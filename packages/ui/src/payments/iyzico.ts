/**
 * iyzico Checkout Form (hosted payment page), server side, per docs.iyzico.com:
 *
 * - `initializeCheckoutForm` → POST /payment/iyzipos/checkoutform/initialize/auth/ecom, returns the
 *   token, `paymentPageUrl` and `checkoutFormContent`; the response signature
 *   (conversationId, token) is checked.
 * - iyzico posts `token` to your `callbackUrl`; `retrieveCheckoutForm(token)` → POST
 *   /payment/iyzipos/checkoutform/auth/ecom/detail, response signature (paymentStatus, paymentId,
 *   currency, basketId, conversationId, paidPrice, price, token) checked. Only `paid: true` means
 *   the money was taken.
 * - `verifyIyzicoWebhook` checks the `X-IYZ-SIGNATURE-V3` header of merchant notifications (direct
 *   and HPP formats).
 *
 * Authentication is IYZWSv2 (HMAC-SHA256 over randomKey + path + body). Sandbox unless
 * `mode: "live"`. Keys are only what you pass (read them from env); they are never logged or put in
 * error messages.
 */
import { addDecimal, compareDecimal } from "../locale-data/core/decimal";
import { hmacSha256, requireSetting, safeEqual, toBase64, toHex } from "./crypto";

export const IYZICO_BASE_URL = { sandbox: "https://sandbox-api.iyzipay.com", live: "https://api.iyzipay.com" } as const;

export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  /** Default `"sandbox"`. */
  mode?: "sandbox" | "live";
  /** Overrides the base URL (a proxy, a mock server). */
  baseUrl?: string;
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
  /** Random key generator for the auth header (tests). */
  randomKey?: () => string;
}

export type IyzicoCurrency = "TRY" | "USD" | "EUR" | "GBP" | "NOK" | "CHF";

export interface IyzicoBuyer {
  id: string;
  name: string;
  surname: string;
  /** TCKN for Turkish buyers. */
  identityNumber: string;
  email: string;
  gsmNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  zipCode?: string;
  /** The buyer's IP address. */
  ip?: string;
  registrationDate?: string;
  lastLoginDate?: string;
}

export interface IyzicoAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface IyzicoBasketItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  /** Decimal string ("149.90"). */
  price: string;
}

export interface IyzicoCheckoutRequest {
  /** Basket total, decimal string. Must equal the sum of `basketItems[].price`. */
  price: string;
  /** Amount to charge (≥ price when you add installment interest yourself). Default `price`. */
  paidPrice?: string;
  currency?: IyzicoCurrency;
  basketId?: string;
  conversationId?: string;
  locale?: "tr" | "en";
  paymentGroup?: "PRODUCT" | "LISTING" | "SUBSCRIPTION";
  callbackUrl: string;
  enabledInstallments?: number[];
  buyer: IyzicoBuyer;
  billingAddress: IyzicoAddress;
  /** Required when an item is PHYSICAL. */
  shippingAddress?: IyzicoAddress;
  basketItems: IyzicoBasketItem[];
}

export interface IyzicoCheckoutSession {
  token: string;
  paymentPageUrl?: string;
  /** HTML/script that renders the form inline (as iyzico returns it). */
  checkoutFormContent?: string;
  conversationId?: string;
  /** Seconds the token stays valid. */
  tokenExpireTime?: number;
}

export interface IyzicoCheckoutResult {
  /** True only when the call succeeded, the signature matched and paymentStatus is SUCCESS. */
  paid: boolean;
  /** The response signature matched (false when it was missing or wrong). */
  verified: boolean;
  status: "success" | "failure";
  paymentStatus?: string;
  paymentId?: string;
  conversationId?: string;
  basketId?: string;
  price?: string;
  paidPrice?: string;
  currency?: string;
  installment?: number;
  fraudStatus?: number;
  token: string;
  errorCode?: string;
  errorMessage?: string;
  /** The full response. */
  raw: Record<string, unknown>;
}

export class IyzicoError extends Error {
  constructor(
    message: string,
    readonly errorCode?: string,
    readonly errorGroup?: string,
  ) {
    super(message);
    this.name = "IyzicoError";
  }
}

const DECIMAL = /^\d+(\.\d+)?$/;

/** iyzico's price form: trailing zeros removed ("10.50" → "10.5", "10.0" → "10"), as its signatures use. */
export function iyzicoTrimPrice(value: string | number): string {
  const s = String(value).trim();
  if (!DECIMAL.test(s)) throw new RangeError(`iyzico: not a price: "${s}"`);
  if (!s.includes(".")) return s.replace(/^0+(?=\d)/, "");
  const [int, frac] = s.split(".") as [string, string];
  const f = frac.replace(/0+$/, "");
  const i = int.replace(/^0+(?=\d)/, "");
  return f ? `${i}.${f}` : i;
}

/** The price as sent in requests: trimmed, with at least one decimal ("10" → "10.0"), like iyzipay's SDKs. */
function requestPrice(value: string, what: string): string {
  if (!DECIMAL.test(String(value).trim())) throw new RangeError(`iyzico: ${what} must be a decimal string like "149.90"`);
  const t = iyzicoTrimPrice(value);
  return t.includes(".") ? t : `${t}.0`;
}

/** Hex HMAC-SHA256 of the values joined with ":" — iyzico's response signature. */
export async function iyzicoSignature(secretKey: string, values: readonly (string | number | null | undefined)[]): Promise<string> {
  return toHex(await hmacSha256(secretKey, values.map((v) => (v === null || v === undefined ? "" : String(v))).join(":")));
}

/** The IYZWSv2 `Authorization` header for one request. */
export async function iyzicoAuthorization(opts: { apiKey: string; secretKey: string; randomKey: string; path: string; body: string }): Promise<string> {
  const signature = toHex(await hmacSha256(opts.secretKey, opts.randomKey + opts.path + opts.body));
  return `IYZWSv2 ${toBase64(`apiKey:${opts.apiKey}&randomKey:${opts.randomKey}&signature:${signature}`)}`;
}

const defaultRandomKey = () => `${Date.now()}${Math.floor(Math.random() * 1e9)}`;

/** Builds the JSON body for initialize (validated, prices normalised). Exported for tests and logging-free inspection. */
export function iyzicoCheckoutBody(req: IyzicoCheckoutRequest): Record<string, unknown> {
  if (!req.basketItems?.length) throw new RangeError("iyzico: basketItems must not be empty");
  if (!/^https?:\/\//.test(req.callbackUrl ?? "")) throw new RangeError("iyzico: callbackUrl must be an absolute URL");
  const items = req.basketItems.map((it) => ({ ...it, price: requestPrice(it.price, `basket item ${it.id} price`) }));
  const price = requestPrice(req.price, "price");
  if (compareDecimal(addDecimal(...items.map((i) => i.price)), price) !== 0) throw new RangeError("iyzico: price must equal the sum of basketItems[].price");
  if (items.some((i) => i.itemType === "PHYSICAL") && !req.shippingAddress) throw new RangeError("iyzico: shippingAddress is required for PHYSICAL items");
  const body: Record<string, unknown> = {
    locale: req.locale ?? "tr",
    conversationId: req.conversationId,
    price,
    paidPrice: requestPrice(req.paidPrice ?? req.price, "paidPrice"),
    currency: req.currency ?? "TRY",
    basketId: req.basketId,
    paymentGroup: req.paymentGroup ?? "PRODUCT",
    callbackUrl: req.callbackUrl,
    enabledInstallments: req.enabledInstallments,
    buyer: req.buyer,
    shippingAddress: req.shippingAddress,
    billingAddress: req.billingAddress,
    basketItems: items,
  };
  for (const k of Object.keys(body)) if (body[k] === undefined) delete body[k];
  return body;
}

/** Checks the `signature` of an initialize response. */
export async function verifyIyzicoInitializeSignature(secretKey: string, res: Record<string, unknown>): Promise<boolean> {
  if (typeof res.signature !== "string") return false;
  return safeEqual(await iyzicoSignature(secretKey, [res.conversationId as string, res.token as string]), res.signature.toLowerCase());
}

/** Checks the `signature` of a checkout form retrieve response. */
export async function verifyIyzicoRetrieveSignature(secretKey: string, res: Record<string, unknown>): Promise<boolean> {
  if (typeof res.signature !== "string") return false;
  const price = (v: unknown) => (v === undefined || v === null || v === "" ? "" : iyzicoTrimPrice(v as string | number));
  const expected = await iyzicoSignature(secretKey, [
    res.paymentStatus as string,
    res.paymentId as string,
    res.currency as string,
    res.basketId as string,
    res.conversationId as string,
    price(res.paidPrice),
    price(res.price),
    res.token as string,
  ]);
  return safeEqual(expected, res.signature.toLowerCase());
}

/**
 * A client bound to one merchant account.
 *
 * ```ts
 * const iyzico = createIyzicoClient({ apiKey: process.env.IYZICO_API_KEY!, secretKey: process.env.IYZICO_SECRET_KEY! }); // sandbox
 * const { paymentPageUrl } = await iyzico.initializeCheckoutForm({ price: "149.90", callbackUrl: "https://ornek.com.tr/odeme/sonuc", … });
 * // callback route: const result = await iyzico.retrieveCheckoutForm(formData.get("token"));
 * ```
 */
export function createIyzicoClient(config: IyzicoConfig) {
  const apiKey = requireSetting(config.apiKey, "iyzico apiKey");
  const secretKey = requireSetting(config.secretKey, "iyzico secretKey");
  const mode = config.mode ?? "sandbox";
  const base = (config.baseUrl ?? IYZICO_BASE_URL[mode]).replace(/\/$/, "");

  async function post(path: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const body = JSON.stringify(payload);
    const randomKey = (config.randomKey ?? defaultRandomKey)();
    const f = config.fetch ?? globalThis.fetch;
    const res = await f(base + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-iyzi-rnd": randomKey,
        Authorization: await iyzicoAuthorization({ apiKey, secretKey, randomKey, path, body }),
      },
      body,
    });
    let json: unknown;
    try {
      json = await res.json();
    } catch {
      throw new IyzicoError(`iyzico: HTTP ${res.status} without a JSON body`);
    }
    if (!json || typeof json !== "object") throw new IyzicoError(`iyzico: HTTP ${res.status} with an unexpected body`);
    return json as Record<string, unknown>;
  }

  return {
    mode,
    /** Starts a checkout form session. Throws `IyzicoError` on a failure response or a bad signature. */
    async initializeCheckoutForm(req: IyzicoCheckoutRequest): Promise<IyzicoCheckoutSession> {
      const res = await post("/payment/iyzipos/checkoutform/initialize/auth/ecom", iyzicoCheckoutBody(req));
      if (res.status !== "success" || typeof res.token !== "string") {
        throw new IyzicoError(`iyzico: ${String(res.errorMessage ?? "initialize failed")}`, res.errorCode as string | undefined, res.errorGroup as string | undefined);
      }
      if (!(await verifyIyzicoInitializeSignature(secretKey, res))) throw new IyzicoError("iyzico: initialize response signature does not match");
      return {
        token: res.token,
        paymentPageUrl: res.paymentPageUrl as string | undefined,
        checkoutFormContent: res.checkoutFormContent as string | undefined,
        conversationId: res.conversationId as string | undefined,
        tokenExpireTime: res.tokenExpireTime as number | undefined,
      };
    },

    /** The result for the `token` iyzico posted to your callbackUrl. Never trust the callback alone. */
    async retrieveCheckoutForm(token: string | FormDataEntryValue | null | undefined, opts: { conversationId?: string; locale?: "tr" | "en" } = {}): Promise<IyzicoCheckoutResult> {
      if (typeof token !== "string" || !token) throw new IyzicoError("iyzico: token is missing");
      const res = await post("/payment/iyzipos/checkoutform/auth/ecom/detail", { locale: opts.locale ?? "tr", conversationId: opts.conversationId, token });
      const status = res.status === "success" ? "success" : "failure";
      const verified = status === "success" && (await verifyIyzicoRetrieveSignature(secretKey, res));
      const str = (v: unknown) => (v === undefined || v === null ? undefined : String(v));
      return {
        paid: verified && res.paymentStatus === "SUCCESS",
        verified,
        status,
        paymentStatus: str(res.paymentStatus),
        paymentId: str(res.paymentId),
        conversationId: str(res.conversationId),
        basketId: str(res.basketId),
        price: str(res.price),
        paidPrice: str(res.paidPrice),
        currency: str(res.currency),
        installment: typeof res.installment === "number" ? res.installment : undefined,
        fraudStatus: typeof res.fraudStatus === "number" ? res.fraudStatus : undefined,
        token,
        errorCode: str(res.errorCode),
        errorMessage: str(res.errorMessage),
        raw: res,
      };
    },
  };
}

export type IyzicoClient = ReturnType<typeof createIyzicoClient>;

/** A merchant notification (webhook) body, direct or HPP (checkout form) format. */
export interface IyzicoWebhookPayload {
  iyziEventType?: string;
  iyziEventTime?: number;
  iyziReferenceCode?: string;
  iyziPaymentId?: number | string;
  paymentId?: number | string;
  paymentConversationId?: string;
  merchantId?: number | string;
  /** Present in the HPP format (checkout form, Pay with iyzico). */
  token?: string;
  status?: string;
}

/**
 * Verifies the `X-IYZ-SIGNATURE-V3` header of a merchant notification: hex HMAC-SHA256 with the
 * secret key over secretKey + iyziEventType + paymentId + paymentConversationId + status (direct), or
 * secretKey + iyziEventType + iyziPaymentId + token + paymentConversationId + status (HPP, when the
 * body has a `token`). Pass the parsed JSON body.
 */
export async function verifyIyzicoWebhook(secretKey: string, signature: string | null | undefined, payload: IyzicoWebhookPayload): Promise<boolean> {
  requireSetting(secretKey, "iyzico secretKey");
  if (!signature || !payload || typeof payload !== "object") return false;
  const s = (v: unknown) => (v === undefined || v === null ? "" : String(v));
  const message =
    payload.token !== undefined
      ? secretKey + s(payload.iyziEventType) + s(payload.iyziPaymentId) + s(payload.token) + s(payload.paymentConversationId) + s(payload.status)
      : secretKey + s(payload.iyziEventType) + s(payload.paymentId) + s(payload.paymentConversationId) + s(payload.status);
  return safeEqual(toHex(await hmacSha256(secretKey, message)), signature.trim().toLowerCase());
}
