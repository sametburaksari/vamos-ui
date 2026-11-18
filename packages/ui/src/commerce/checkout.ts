/**
 * Checkout endpoints as Web-standard `Request → Response` handlers (Next.js route handlers,
 * Cloudflare Pages Functions, Spacefast, Deno, Bun):
 *
 *   start(request)     POST JSON { lines, buyer, locale?, note?, coupon? } from the checkout page.
 *                      Prices the cart (and the discount code) from the catalog, never from the
 *                      browser, starts an iyzico Checkout
 *                      Form, keeps the signed order in an HttpOnly cookie and answers
 *                      { order, paymentPageUrl }. The page sends the buyer to paymentPageUrl.
 *   callback(request)  iyzico posts `token` here from the buyer's browser after payment. The result
 *                      is fetched from iyzico (signature checked), matched with the signed order
 *                      (id and amount), `notify` runs once, and the buyer is redirected to the
 *                      confirmation page (or back to checkout when the payment failed).
 *
 * No database: the order email (and an optional webhook) is the record. Keys are read by the caller
 * from the environment and never appear in responses or logs.
 */
import { createIyzicoClient, iyzicoTrimPrice, type IyzicoConfig } from "../payments/iyzico";
import { createOrderId, signOrder, verifyOrder, type OrderBuyer, type OrderSnapshot, type PaidOrder } from "./order";
import { priceCart, toDecimal, type Catalog, type CartLine } from "./pricing";

export interface CheckoutConfig {
  catalog: Catalog;
  iyzico: IyzicoConfig;
  /** At least 32 random characters (ORDER_SECRET). Signs the order cookie. */
  orderSecret: string;
  /** Public site origin ("https://ornek.com.tr"). Default: the request's origin. */
  siteUrl?: string;
  /** Path of the callback endpoint. Default "/api/checkout/callback". */
  callbackPath?: string;
  /** Where a paid order lands (gets ?order=<id>). Default "/order/confirmation". */
  successPath?: string;
  /** Where a failed or cancelled payment lands (gets ?payment=failed). Default "/checkout". */
  failurePath?: string;
  /** Order number prefix. Default "VB". */
  orderPrefix?: string;
  /** Extra origins allowed to call `start` (the page's own origin is always allowed). */
  allowedOrigins?: string[];
  /** Runs once per paid order: emails, a webhook, your database. Errors are logged, not shown. */
  notify?: (order: PaidOrder) => Promise<void> | void;
  /** Runs when a payment succeeded but the order cookie was missing (blocked cookies, another device). */
  onOrphanPayment?: (info: { basketId?: string; paymentId?: string; paidPrice?: string }) => Promise<void> | void;
  /** Installment counts to offer. Default: iyzico decides. */
  enabledInstallments?: number[];
  log?: (message: string, detail?: unknown) => void;
  /** Clock for discount-code windows (tests). Default the real time. */
  now?: () => Date;
}

export const ORDER_COOKIE = "vb_order";
const DONE_COOKIE = "vb_order_done";

export type CheckoutErrorCode = "bad-request" | "forbidden-origin" | "invalid-buyer" | "invalid-cart" | "too-large" | "payment-unavailable";

const json = (status: number, data: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });

const redirect = (location: string, cookies: string[] = []) => {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
  for (const c of cookies) headers.append("Set-Cookie", c);
  return new Response(null, { status: 303, headers });
};

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

// SameSite=None: iyzico's callback is a cross-site POST from the buyer's browser; Lax would drop it.
const cookie = (name: string, value: string, maxAge: number) => `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=None`;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "");

/** Checks and normalises the buyer from the checkout page. Returns the field names that failed. */
export function readBuyer(input: unknown, physical: boolean): { buyer?: OrderBuyer; invalid: string[] } {
  const b = (input ?? {}) as Record<string, unknown>;
  const invalid: string[] = [];
  const buyer: OrderBuyer = {
    name: text(b.name, 60),
    surname: text(b.surname, 60),
    email: text(b.email, 120).toLowerCase(),
    phone: text(b.phone, 20),
    address: text(b.address, 300),
    city: text(b.city, 60),
    district: text(b.district, 60) || undefined,
    zipCode: text(b.zipCode, 12) || undefined,
    country: text(b.country, 60) || "Turkey",
    identityNumber: text(b.identityNumber, 11) || undefined,
  };
  const c = b.company as Record<string, unknown> | undefined;
  if (c && typeof c === "object" && text(c.name, 120)) buyer.company = { name: text(c.name, 120), taxOffice: text(c.taxOffice, 60) || undefined, taxNumber: text(c.taxNumber, 11) || undefined };
  if (!buyer.name) invalid.push("name");
  if (!buyer.surname) invalid.push("surname");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(buyer.email)) invalid.push("email");
  const digits = buyer.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) invalid.push("phone");
  if (buyer.address.length < (physical ? 8 : 3)) invalid.push("address");
  if (!buyer.city) invalid.push("city");
  if (buyer.identityNumber && !/^[1-9]\d{10}$/.test(buyer.identityNumber)) invalid.push("identityNumber");
  return invalid.length ? { invalid } : { buyer, invalid };
}

/** iyzico wants +90… for Turkish numbers. */
function gsm(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return `+${d}`;
  if (d.length === 10) return `+90${d}`;
  if (d.length === 11 && d.startsWith("0")) return `+90${d.slice(1)}`;
  return `+${d}`;
}

const clientIp = (request: Request) => (request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "").trim() || "127.0.0.1";

/** Builds the two handlers. Create it once per module; it holds no state between requests. */
export function createCheckout(config: CheckoutConfig) {
  const callbackPath = config.callbackPath ?? "/api/checkout/callback";
  const successPath = config.successPath ?? "/order/confirmation";
  const failurePath = config.failurePath ?? "/checkout";
  const log = config.log ?? ((m: string, d?: unknown) => console.error(`[checkout] ${m}`, d ?? ""));
  const iyzico = createIyzicoClient(config.iyzico);
  if (!config.orderSecret || config.orderSecret.length < 32) throw new TypeError("commerce: ORDER_SECRET must be at least 32 characters");

  const origin = (request: Request) => (config.siteUrl ?? new URL(request.url).origin).replace(/\/$/, "");
  const withQuery = (base: string, path: string, query: Record<string, string>) => {
    const url = new URL(path, `${base}/`);
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    return url.toString();
  };

  async function start(request: Request): Promise<Response> {
    if (request.method !== "POST") return json(405, { error: "bad-request" }, { Allow: "POST" });
    const from = request.headers.get("origin");
    const self = new URL(request.url).origin;
    const allowed = new Set([self, ...(config.siteUrl ? [new URL(config.siteUrl).origin] : []), ...(config.allowedOrigins ?? [])]);
    if (from && !allowed.has(from)) return json(403, { error: "forbidden-origin" });
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return json(400, { error: "bad-request" });
    }
    const lines = Array.isArray(body.lines)
      ? (body.lines as Record<string, unknown>[]).map((l): CartLine => ({ productId: String(l?.productId ?? ""), variantId: l?.variantId ? String(l.variantId) : undefined, qty: Number(l?.qty) }))
      : [];
    const coupon = text(body.coupon, 64);
    const now = config.now?.() ?? new Date();
    const priced = priceCart(config.catalog, lines, { coupon, now });
    if (!priced.ok) return json(422, { error: "invalid-cart", issues: priced.issues });
    const { quote } = priced;
    const { buyer, invalid } = readBuyer(body.buyer, quote.physical);
    if (!buyer) return json(422, { error: "invalid-buyer", fields: invalid });
    const locale = body.locale === "en" ? "en" : "tr";
    const order: OrderSnapshot = { v: 1, id: createOrderId(config.orderPrefix), createdAt: new Date().toISOString(), locale, quote, buyer, ...(text(body.note, 500) ? { note: text(body.note, 500) } : {}) };
    const signed = await signOrder(order, config.orderSecret);
    if (signed.length > 3800) return json(413, { error: "too-large" });

    const base = origin(request);
    const contactName = `${buyer.name} ${buyer.surname}`;
    const address = { contactName, city: buyer.city, country: buyer.country ?? "Turkey", address: [buyer.address, buyer.district].filter(Boolean).join(", "), zipCode: buyer.zipCode };
    // Discounted line totals: iyzico needs the items to add up to `price` exactly, each above zero
    // (priceCart keeps every line at 1 minor unit or more).
    const basketItems = quote.lines.map((l, i) => ({ id: `${l.productId}${l.variantId ? `-${l.variantId}` : ""}`.slice(0, 60) || `item-${i}`, name: l.name.slice(0, 120), category1: l.category, itemType: l.itemType, price: toDecimal(l.total - l.discount) }));
    if (quote.shipping > 0) basketItems.push({ id: "shipping", name: quote.shippingLabel, category1: "Shipping", itemType: "VIRTUAL", price: toDecimal(quote.shipping) });
    try {
      const session = await iyzico.initializeCheckoutForm({
        price: toDecimal(quote.total),
        paidPrice: toDecimal(quote.total),
        currency: quote.currency as "TRY",
        basketId: order.id,
        conversationId: order.id,
        locale,
        callbackUrl: `${base}${callbackPath}`,
        ...(config.enabledInstallments ? { enabledInstallments: config.enabledInstallments } : {}),
        buyer: {
          id: order.id,
          name: buyer.name,
          surname: buyer.surname,
          // iyzico requires a value; 11111111111 is its documented placeholder when TCKN is not collected.
          identityNumber: buyer.identityNumber ?? "11111111111",
          email: buyer.email,
          gsmNumber: gsm(buyer.phone),
          registrationAddress: address.address,
          city: buyer.city,
          country: address.country,
          zipCode: buyer.zipCode,
          ip: clientIp(request),
        },
        billingAddress: buyer.company ? { ...address, contactName: buyer.company.name } : address,
        ...(quote.physical ? { shippingAddress: address } : {}),
        basketItems,
      });
      if (!session.paymentPageUrl) throw new Error("no paymentPageUrl");
      return json(200, { order: order.id, paymentPageUrl: session.paymentPageUrl }, { "Set-Cookie": cookie(ORDER_COOKIE, signed, 3600) });
    } catch (error) {
      log("payment provider refused the checkout", (error as Error).message);
      return json(502, { error: "payment-unavailable" });
    }
  }

  async function callback(request: Request): Promise<Response> {
    const base = origin(request);
    const failed = (reason: string) => redirect(withQuery(base, failurePath, { payment: "failed", reason }), [cookie(ORDER_COOKIE, "", 0)]);
    if (request.method !== "POST") return redirect(withQuery(base, failurePath, { payment: "failed", reason: "method" }));
    let token = "";
    try {
      const type = request.headers.get("content-type") ?? "";
      if (type.includes("application/json")) token = String(((await request.json()) as Record<string, unknown>).token ?? "");
      else token = String((await request.formData()).get("token") ?? "");
    } catch {
      /* no body */
    }
    if (!token) return failed("token");
    let result;
    try {
      result = await iyzico.retrieveCheckoutForm(token);
    } catch (error) {
      log("could not read the payment result", (error as Error).message);
      return failed("provider");
    }
    if (!result.paid) return failed("declined");

    const order = await verifyOrder(readCookie(request, ORDER_COOKIE), config.orderSecret, { maxAgeSeconds: 2 * 3600 });
    const doneId = readCookie(request, DONE_COOKIE);
    if (!order) {
      // Paid, but the signed order is gone: a second post of the same callback, or blocked cookies.
      if (doneId && doneId === result.basketId) return redirect(withQuery(base, successPath, { order: doneId }));
      log("payment succeeded without a matching order cookie", { basketId: result.basketId, paymentId: result.paymentId });
      try {
        await config.onOrphanPayment?.({ basketId: result.basketId, paymentId: result.paymentId, paidPrice: result.paidPrice });
      } catch (error) {
        log("onOrphanPayment failed", (error as Error).message);
      }
      return redirect(withQuery(base, successPath, { order: result.basketId ?? "" }));
    }
    const expected = iyzicoTrimPrice(toDecimal(order.quote.total));
    if (result.basketId !== order.id || iyzicoTrimPrice(result.price ?? "") !== expected) {
      log("payment does not match the order", { order: order.id, basketId: result.basketId, price: result.price, expected });
      return failed("mismatch");
    }
    const paid: PaidOrder = { ...order, paidAt: new Date().toISOString(), provider: "iyzico", paymentId: result.paymentId, paidPrice: result.paidPrice, installment: result.installment };
    try {
      await config.notify?.(paid);
    } catch (error) {
      log("notify failed", (error as Error).message);
    }
    return redirect(withQuery(base, successPath, { order: order.id }), [cookie(ORDER_COOKIE, "", 0), cookie(DONE_COOKIE, order.id, 3600)]);
  }

  return { start, callback };
}

export type Checkout = ReturnType<typeof createCheckout>;
