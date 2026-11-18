/**
 * PayTR checkout endpoints as Web-standard `Request → Response` handlers, the second provider
 * next to iyzico's `createCheckout`:
 *
 *   start(request)   POST JSON { lines, buyer, locale?, note? }, the same contract as iyzico's start.
 *                    Prices the cart from the catalog, keeps the order snapshot in an `OrderStore`
 *                    (about two hours), asks PayTR for an iframe token and answers
 *                    { order, iframeUrl, token, paymentPageUrl }. Show iframeUrl in an iframe, or
 *                    let the cart open it (paymentPageUrl is the same URL).
 *   notify(request)  PayTR's notification (Bildirim URL), posted server to server: merchant_oid,
 *                    status, total_amount (kuruş) and hash. The hash is checked, the order is loaded
 *                    from the store, the amount is compared, `notify` runs once per order and the
 *                    answer is the plain text "OK".
 *
 * Why storage: PayTR tells the result only to the notification URL, from its own servers, so the
 * buyer's cookie is not there; the browser merely returns to merchant_ok_url / merchant_fail_url,
 * which proves nothing about the payment. The ok URL lands on the confirmation page
 * (?order=<id>), the fail URL on the checkout page (?payment=failed); the order email is the
 * confirmation that counts.
 *
 * PayTR retries a notification until it gets "OK", so every answer is "OK" except for a bad hash
 * (not from PayTR) and a storage failure (so the retry can succeed). Keys are never logged.
 */
import { createPaytrIframeToken, PAYTR_CALLBACK_OK, verifyPaytrCallback, type PaytrConfig, type PaytrCurrency } from "../payments/paytr";
import { readBuyer } from "./checkout";
import { createOrderId, type OrderSnapshot, type PaidOrder } from "./order";
import { priceCart, toDecimal, type CartLine, type Catalog } from "./pricing";
import type { OrderStore } from "./store";

export interface PaytrCheckoutConfig {
  catalog: Catalog;
  /** merchantId, merchantKey, merchantSalt, testMode (default true). */
  paytr: PaytrConfig;
  /** Keeps orders between start and PayTR's notification. */
  store: OrderStore;
  /** Public site origin ("https://ornek.com.tr"). Default: the request's origin. */
  siteUrl?: string;
  /** merchant_ok_url path (gets ?order=<id>). Default "/order/confirmation". */
  okPath?: string;
  /** merchant_fail_url path (gets ?payment=failed). Default "/checkout". */
  failPath?: string;
  /** Order number prefix (letters and digits). Default "VB". */
  orderPrefix?: string;
  /** Extra origins allowed to call `start` (the page's own origin is always allowed). */
  allowedOrigins?: string[];
  /** Seconds an unpaid order is kept. Default 7200 (PayTR's payment window is 30 minutes by default). */
  orderTtlSeconds?: number;
  /** Minutes the buyer has to pay (PayTR timeout_limit). Default: PayTR's 30. */
  timeoutLimit?: number;
  /** Hide installment options. Default false. */
  noInstallment?: boolean;
  /** 0 (default) = the maximum allowed; or 2–12. */
  maxInstallment?: number;
  /** Runs once per paid order: emails, a webhook, your database. Errors are logged, not retried. */
  notify?: (order: PaidOrder) => Promise<void> | void;
  /** Runs once when PayTR reports a payment for an order the store does not have (expired, another store). */
  onOrphanPayment?: (info: { merchantOid: string; totalAmount?: string }) => Promise<void> | void;
  log?: (message: string, detail?: unknown) => void;
}

const json = (status: number, data: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });

const plain = (status: number, body: string) => new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "");

const clientIp = (request: Request) => (request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "").trim() || "127.0.0.1";

// PayTR's own rule for the email field: ASCII only.
const ASCII_EMAIL = /^[\x21-\x7e]+@[\x21-\x7e]+\.[\x21-\x7e]{2,}$/;

const PAYTR_CURRENCIES: Record<string, PaytrCurrency> = { TRY: "TL", TL: "TL", USD: "USD", EUR: "EUR", GBP: "GBP", RUB: "RUB" };

/** A PayTR merchant_oid: the readable order number without separators ("VB251118K7Q3M9XA"). */
export function createPaytrOrderId(prefix = "VB", now = new Date()): string {
  return createOrderId(prefix, now).replace(/[^A-Za-z0-9]/g, "");
}

/** Builds the two handlers. Create it once per module; all state is in `store`. */
export function createPaytrCheckout(config: PaytrCheckoutConfig) {
  const okPath = config.okPath ?? "/order/confirmation";
  const failPath = config.failPath ?? "/checkout";
  const ttl = config.orderTtlSeconds ?? 2 * 3600;
  const log = config.log ?? ((m: string, d?: unknown) => console.error(`[checkout:paytr] ${m}`, d ?? ""));
  const currency = PAYTR_CURRENCIES[config.catalog.currency.toUpperCase()];
  if (!currency) throw new TypeError(`commerce: PayTR does not take ${config.catalog.currency} (TRY, USD, EUR, GBP or RUB)`);
  if (!config.store) throw new TypeError("commerce: createPaytrCheckout needs an order store (memoryOrderStore, cloudflareKvOrderStore or upstashOrderStore)");

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
    const priced = priceCart(config.catalog, lines);
    if (!priced.ok) return json(422, { error: "invalid-cart", issues: priced.issues });
    const { quote } = priced;
    const { buyer, invalid } = readBuyer(body.buyer, quote.physical);
    if (!buyer) return json(422, { error: "invalid-buyer", fields: invalid });
    if (!ASCII_EMAIL.test(buyer.email) || buyer.email.length > 100) return json(422, { error: "invalid-buyer", fields: ["email"] });
    const locale = body.locale === "en" ? "en" : "tr";
    const note = text(body.note, 500);
    const order: OrderSnapshot = { v: 1, id: createPaytrOrderId(config.orderPrefix), createdAt: new Date().toISOString(), locale, quote, buyer, ...(note ? { note } : {}) };

    try {
      await config.store.put(order.id, order, ttl);
    } catch (error) {
      log("could not store the order", (error as Error).message);
      return json(502, { error: "payment-unavailable" });
    }

    const base = origin(request);
    const basket = quote.lines.map((l) => ({ name: l.name.slice(0, 120), price: toDecimal(l.unit), quantity: l.qty }));
    if (quote.shipping > 0) basket.push({ name: quote.shippingLabel, price: toDecimal(quote.shipping), quantity: 1 });
    try {
      const { token, iframeUrl } = await createPaytrIframeToken(config.paytr, {
        merchantOid: order.id,
        email: buyer.email,
        amount: toDecimal(quote.total),
        userIp: clientIp(request),
        basket,
        userName: `${buyer.name} ${buyer.surname}`,
        userAddress: [buyer.address, buyer.district, buyer.city, buyer.zipCode, buyer.country].filter(Boolean).join(", "),
        userPhone: buyer.phone,
        okUrl: withQuery(base, okPath, { order: order.id }),
        failUrl: withQuery(base, failPath, { payment: "failed" }),
        currency,
        lang: locale,
        ...(config.noInstallment ? { noInstallment: true } : {}),
        ...(config.maxInstallment !== undefined ? { maxInstallment: config.maxInstallment } : {}),
        ...(config.timeoutLimit !== undefined ? { timeoutLimit: config.timeoutLimit } : {}),
      });
      return json(200, { order: order.id, iframeUrl, token, paymentPageUrl: iframeUrl });
    } catch (error) {
      log("payment provider refused the checkout", (error as Error).message);
      await config.store.delete(order.id).catch(() => undefined);
      return json(502, { error: "payment-unavailable" });
    }
  }

  async function notify(request: Request): Promise<Response> {
    if (request.method !== "POST") return plain(405, "method not allowed");
    // A plain object: FormData classes can differ between the runtime and test environments.
    let form: Record<string, string>;
    try {
      form = {};
      for (const [k, v] of (await request.formData()).entries()) if (typeof v === "string") form[k] = v;
    } catch {
      return plain(400, "bad request");
    }
    const result = await verifyPaytrCallback(config.paytr, form);
    if (!result.verified) {
      log("notification with a bad hash", { merchantOid: result.merchantOid });
      return plain(400, "bad hash");
    }
    const oid = result.merchantOid;
    if (!result.paid) {
      log("payment failed", { merchantOid: oid, status: result.status, code: result.failedReasonCode });
      return plain(200, PAYTR_CALLBACK_OK);
    }
    try {
      const order = await config.store.get(oid);
      if (!order) {
        // Expired or never stored here. Mark it so a retry is not reported twice.
        if (!(await config.store.markPaid(oid))) {
          log("notification for an order already processed", { merchantOid: oid });
          return plain(200, PAYTR_CALLBACK_OK);
        }
        log("payment for an unknown order", { merchantOid: oid, totalAmount: result.totalAmount });
        try {
          await config.onOrphanPayment?.({ merchantOid: oid, totalAmount: result.totalAmount });
        } catch (error) {
          log("onOrphanPayment failed", (error as Error).message);
        }
        return plain(200, PAYTR_CALLBACK_OK);
      }
      // total_amount is in the hash; it can exceed the order total by installment interest, never fall short.
      const raw = form.total_amount ?? "";
      const charged = /^\d+$/.test(raw) ? Number(raw) : NaN;
      if (!(charged >= order.quote.total)) {
        log("payment does not match the order", { merchantOid: oid, totalAmount: raw, expected: order.quote.total });
        return plain(200, PAYTR_CALLBACK_OK);
      }
      if (!(await config.store.markPaid(oid))) {
        log("notification for an order already processed", { merchantOid: oid });
        return plain(200, PAYTR_CALLBACK_OK);
      }
      const installment = Number(form.installment_count ?? "");
      const paid: PaidOrder = {
        ...order,
        paidAt: new Date().toISOString(),
        provider: "paytr",
        paidPrice: result.totalAmount,
        ...(Number.isInteger(installment) && installment > 0 ? { installment } : {}),
      };
      try {
        await config.notify?.(paid);
      } catch (error) {
        log("notify failed", (error as Error).message);
      }
      return plain(200, PAYTR_CALLBACK_OK);
    } catch (error) {
      // The store is unreachable: a non-OK answer makes PayTR try again later.
      log("order store failed", (error as Error).message);
      return plain(503, "store unavailable");
    }
  }

  return { start, notify };
}

export type PaytrCheckout = ReturnType<typeof createPaytrCheckout>;
