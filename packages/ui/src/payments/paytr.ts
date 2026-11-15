/**
 * PayTR iFrame API, server side, per dev.paytr.com:
 *
 * - Step 1, `createPaytrIframeToken` → POST https://www.paytr.com/odeme/api/get-token with
 *   paytr_token = base64(HMAC-SHA256(merchant_key, merchant_id + user_ip + merchant_oid + email +
 *   payment_amount + user_basket + no_installment + max_installment + currency + test_mode +
 *   merchant_salt)); the token opens https://www.paytr.com/odeme/guvenli/<token> in an iframe.
 * - Step 2, `verifyPaytrCallback` → the notification PayTR posts to your Bildirim URL: hash =
 *   base64(HMAC-SHA256(merchant_key, merchant_oid + merchant_salt + status + total_amount)). Answer
 *   with the plain text `OK` (`PAYTR_CALLBACK_OK`), also for repeated notifications.
 *
 * `testMode` is on unless you pass `testMode: false`. Keys are only what you pass (read them from
 * env); they are never logged or put in error messages.
 */
import { toUnits } from "../locale-data/core/decimal";
import { hmacSha256, requireSetting, safeEqual, toBase64 } from "./crypto";

export const PAYTR_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
export const PAYTR_IFRAME_URL = "https://www.paytr.com/odeme/guvenli/";
/** Script PayTR documents for resizing the iframe. */
export const PAYTR_IFRAME_RESIZER = "https://www.paytr.com/js/iframeResizer.min.js";
/** The exact body your notification URL must answer with. */
export const PAYTR_CALLBACK_OK = "OK";

export interface PaytrConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  /** Default `true`: transactions are test transactions. Pass `false` to take real payments. */
  testMode?: boolean;
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
  /** Overrides the token endpoint (a mock server). */
  tokenUrl?: string;
}

export type PaytrCurrency = "TL" | "TRY" | "USD" | "EUR" | "GBP" | "RUB";

export interface PaytrBasketItem {
  name: string;
  /** Unit price, decimal string ("18.00"). */
  price: string;
  quantity: number;
}

export interface PaytrTokenRequest {
  /** Your unique order id: letters and digits only, up to 64 characters. */
  merchantOid: string;
  /** Up to 100 characters, no Turkish characters (PayTR's rule). */
  email: string;
  /** Order total, decimal string ("34.56"); sent as kuruş (3456). */
  amount: string;
  /** The customer's public IP address. */
  userIp: string;
  basket: PaytrBasketItem[];
  userName: string;
  userAddress: string;
  userPhone: string;
  okUrl: string;
  failUrl: string;
  currency?: PaytrCurrency;
  /** Hide installment options. Default false. */
  noInstallment?: boolean;
  /** 0 (default) = the maximum allowed; or 2–12. */
  maxInstallment?: number;
  /** Minutes to complete the payment (PayTR default 30). */
  timeoutLimit?: number;
  lang?: "tr" | "en";
  /** Ask PayTR to return error details (integration only). */
  debug?: boolean;
}

export interface PaytrIframeToken {
  token: string;
  /** `src` for the iframe. */
  iframeUrl: string;
}

export class PaytrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaytrError";
  }
}

const ASCII_EMAIL = /^[\x21-\x7e]+@[\x21-\x7e]+\.[\x21-\x7e]{2,}$/;

/** The form fields of the token request, `paytr_token` included. Pure; exported for tests. */
export async function paytrTokenFields(config: PaytrConfig, req: PaytrTokenRequest): Promise<Record<string, string>> {
  const merchantId = requireSetting(config.merchantId, "PayTR merchantId");
  const merchantKey = requireSetting(config.merchantKey, "PayTR merchantKey");
  const merchantSalt = requireSetting(config.merchantSalt, "PayTR merchantSalt");
  if (!/^[A-Za-z0-9]{1,64}$/.test(req.merchantOid ?? "")) throw new RangeError("PayTR: merchantOid must be 1–64 letters or digits");
  if (!ASCII_EMAIL.test(req.email ?? "") || req.email.length > 100) throw new RangeError("PayTR: email must be a valid address without Turkish characters, up to 100 characters");
  if (!req.userIp || req.userIp.length > 39) throw new RangeError("PayTR: userIp is required (the customer's public IP)");
  if (!req.basket?.length) throw new RangeError("PayTR: basket must not be empty");
  const kurus = toUnits(req.amount, 2);
  if (kurus <= 0n) throw new RangeError("PayTR: amount must be positive");
  const max = req.maxInstallment ?? 0;
  if (!Number.isInteger(max) || max < 0 || max > 12 || max === 1) throw new RangeError("PayTR: maxInstallment must be 0 or 2–12");
  const basket = req.basket.map((b) => {
    if (!Number.isInteger(b.quantity) || b.quantity < 1) throw new RangeError("PayTR: basket quantities must be positive integers");
    const units = toUnits(b.price, 2);
    const price = `${units / 100n}.${String(units % 100n).padStart(2, "0")}`;
    return [b.name, price, b.quantity];
  });

  const testMode = config.testMode === false ? "0" : "1";
  const fields: Record<string, string> = {
    merchant_id: merchantId,
    user_ip: req.userIp,
    merchant_oid: req.merchantOid,
    email: req.email,
    payment_amount: kurus.toString(),
    user_basket: toBase64(JSON.stringify(basket)),
    no_installment: req.noInstallment ? "1" : "0",
    max_installment: String(max),
    currency: req.currency ?? "TL",
    test_mode: testMode,
  };
  const hashStr =
    fields.merchant_id! + fields.user_ip + fields.merchant_oid + fields.email + fields.payment_amount + fields.user_basket + fields.no_installment + fields.max_installment + fields.currency + fields.test_mode;
  fields.paytr_token = toBase64(await hmacSha256(merchantKey, hashStr + merchantSalt));
  Object.assign(fields, {
    user_name: req.userName.slice(0, 60),
    user_address: req.userAddress.slice(0, 400),
    user_phone: req.userPhone.slice(0, 20),
    merchant_ok_url: req.okUrl,
    merchant_fail_url: req.failUrl,
    debug_on: req.debug ? "1" : "0",
    lang: req.lang ?? "tr",
  });
  if (req.timeoutLimit !== undefined) fields.timeout_limit = String(Math.max(1, Math.floor(req.timeoutLimit)));
  return fields;
}

/**
 * Asks PayTR for an iframe token (step 1).
 *
 * ```ts
 * const { iframeUrl } = await createPaytrIframeToken(
 *   { merchantId: process.env.PAYTR_MERCHANT_ID!, merchantKey: process.env.PAYTR_MERCHANT_KEY!, merchantSalt: process.env.PAYTR_MERCHANT_SALT! }, // test mode
 *   { merchantOid: "YA20261115001", email: "deniz@ornek.com.tr", amount: "349.90", userIp, basket: [{ name: "Atölye kaydı", price: "349.90", quantity: 1 }], … },
 * );
 * ```
 */
export async function createPaytrIframeToken(config: PaytrConfig, req: PaytrTokenRequest): Promise<PaytrIframeToken> {
  const fields = await paytrTokenFields(config, req);
  const f = config.fetch ?? globalThis.fetch;
  const res = await f(config.tokenUrl ?? PAYTR_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });
  let json: { status?: string; token?: string; reason?: string };
  try {
    json = (await res.json()) as typeof json;
  } catch {
    throw new PaytrError(`PayTR: HTTP ${res.status} without a JSON body`);
  }
  if (json.status !== "success" || typeof json.token !== "string") throw new PaytrError(`PayTR: ${json.reason ?? "token request failed"}`);
  return { token: json.token, iframeUrl: PAYTR_IFRAME_URL + encodeURIComponent(json.token) };
}

export interface PaytrCallback {
  /** The hash matched: the notification came from PayTR and was not changed. */
  verified: boolean;
  /** `verified` and status is success. */
  paid: boolean;
  merchantOid: string;
  status: "success" | "failed" | string;
  /** Amount charged, decimal string (may exceed the order amount with installment interest). */
  totalAmount?: string;
  /** Order amount from step 1, decimal string. */
  paymentAmount?: string;
  currency?: string;
  paymentType?: string;
  testMode: boolean;
  failedReasonCode?: string;
  failedReasonMsg?: string;
}

type Fields = FormData | URLSearchParams | Record<string, unknown>;
const get = (f: Fields, k: string): string | undefined => {
  const v = f instanceof FormData || f instanceof URLSearchParams ? f.get(k) : f[k];
  return v === null || v === undefined ? undefined : String(v);
};
const kurusToDecimal = (v: string | undefined) => (v && /^\d+$/.test(v) ? `${BigInt(v) / 100n}.${String(BigInt(v) % 100n).padStart(2, "0")}` : undefined);

/**
 * Verifies a PayTR payment notification (step 2). Pass the posted form (FormData, URLSearchParams
 * or a plain object). Process each `merchantOid` once — PayTR may notify more than once — and answer
 * `PAYTR_CALLBACK_OK` either way.
 */
export async function verifyPaytrCallback(config: Pick<PaytrConfig, "merchantKey" | "merchantSalt">, fields: Fields): Promise<PaytrCallback> {
  const merchantKey = requireSetting(config.merchantKey, "PayTR merchantKey");
  const merchantSalt = requireSetting(config.merchantSalt, "PayTR merchantSalt");
  const merchantOid = get(fields, "merchant_oid") ?? "";
  const status = get(fields, "status") ?? "";
  const total = get(fields, "total_amount") ?? "";
  const hash = get(fields, "hash") ?? "";
  const expected = toBase64(await hmacSha256(merchantKey, merchantOid + merchantSalt + status + total));
  const verified = !!merchantOid && !!hash && safeEqual(expected, hash);
  return {
    verified,
    paid: verified && status === "success",
    merchantOid,
    status,
    totalAmount: kurusToDecimal(total),
    paymentAmount: kurusToDecimal(get(fields, "payment_amount")),
    currency: get(fields, "currency"),
    paymentType: get(fields, "payment_type"),
    testMode: get(fields, "test_mode") === "1",
    failedReasonCode: get(fields, "failed_reason_code"),
    failedReasonMsg: get(fields, "failed_reason_msg"),
  };
}
