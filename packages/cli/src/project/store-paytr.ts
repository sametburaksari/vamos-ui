/**
 * The PayTR variant of the store checkout (`site store --provider paytr`). PayTR reports the
 * payment only to a notification URL, server to server, so the order waits in an order store
 * instead of the buyer's cookie:
 *
 *   next   app/api/checkout/route.ts + app/api/checkout/paytr-notify/route.ts; orders in Upstash
 *          Redis over REST (UPSTASH_REDIS_REST_URL / _TOKEN, or Vercel Marketplace Redis's
 *          KV_REST_API_URL / _TOKEN).
 *   edge   functions/api/checkout/index.ts + functions/api/checkout/paytr-notify.ts; orders in a
 *          Workers KV binding named ORDERS (Cloudflare Pages), else the Upstash variables
 *          (Spacefast).
 *
 * Shares store/catalog.ts with the iyzico variant. Pure: returns path → content.
 */
import type { Lang } from "./questions";
import { catalogFile, rel, type StoreOptions, type StoreResult } from "./store";

const ts = (s: string) => JSON.stringify(s);

function paytrCheckoutFile(o: { siteName?: string; catalogImport: string }): string {
  return `import {
  cloudflareKvOrderStore,
  createPaytrCheckout,
  notifyAll,
  resendNotifier,
  upstashOrderStore,
  webhookNotifier,
  type KvNamespaceLike,
  type OrderStore,
  type PaidOrder,
} from "@vamos-ui/react/commerce";
import { catalog } from ${ts(o.catalogImport)};

/** Environment variables, plus bindings such as a KV namespace (ORDERS) on Cloudflare. */
export type StoreEnv = Record<string, unknown>;

const optional = (env: StoreEnv, name: string): string | undefined => {
  const value = env[name];
  return typeof value === "string" && value ? value : undefined;
};

function required(env: StoreEnv, name: string): string {
  const value = optional(env, name);
  if (!value) throw new Error(\`checkout: \${name} is not set\`);
  return value;
}

/** Where an order waits for PayTR's notification: the ORDERS KV binding, else Upstash Redis (REST). */
export function orderStore(env: StoreEnv): OrderStore {
  const kv = env.ORDERS as KvNamespaceLike | undefined;
  if (kv && typeof kv === "object" && typeof kv.get === "function") return cloudflareKvOrderStore(kv);
  const url = optional(env, "UPSTASH_REDIS_REST_URL") ?? optional(env, "KV_REST_API_URL");
  const token = optional(env, "UPSTASH_REDIS_REST_TOKEN") ?? optional(env, "KV_REST_API_TOKEN");
  if (url && token) return upstashOrderStore({ url, token });
  throw new Error("checkout: no order store. Bind a KV namespace as ORDERS (Cloudflare), or set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN");
}

/** The checkout endpoints for one environment (all state is in the order store). */
export function storeCheckout(env: StoreEnv) {
  const notifiers: ((order: PaidOrder) => Promise<void>)[] = [];
  const resendKey = optional(env, "RESEND_API_KEY");
  if (resendKey) {
    notifiers.push(
      resendNotifier({
        apiKey: resendKey,
        from: required(env, "ORDER_FROM"),
        to: required(env, "ORDER_TO").split(",").map((x) => x.trim()).filter(Boolean),
        siteName: ${o.siteName ? ts(o.siteName) : 'optional(env, "SITE_NAME")'},
      }),
    );
  }
  const webhook = optional(env, "ORDER_WEBHOOK_URL");
  if (webhook) notifiers.push(webhookNotifier({ url: webhook, secret: optional(env, "ORDER_WEBHOOK_SECRET") }));
  return createPaytrCheckout({
    catalog,
    paytr: {
      merchantId: required(env, "PAYTR_MERCHANT_ID"),
      merchantKey: required(env, "PAYTR_MERCHANT_KEY"),
      merchantSalt: required(env, "PAYTR_MERCHANT_SALT"),
      // Test transactions unless PAYTR_TEST_MODE is "0".
      testMode: optional(env, "PAYTR_TEST_MODE") !== "0",
    },
    store: orderStore(env),
    siteUrl: optional(env, "SITE_URL"),
    notify: notifiers.length ? notifyAll(...notifiers) : undefined,
  });
}
`;
}

export function paytrStoreFiles(opts: StoreOptions): StoreResult {
  if (opts.runtime !== "next" && opts.runtime !== "edge") throw new TypeError(`PayTR checkout supports the next and edge runtimes, not "${String(opts.runtime)}".`);
  const lang: Lang = opts.lang ?? "tr";
  const tr = lang === "tr";
  const storeDir = opts.storeDir ?? "store";
  const catalogPath = `${storeDir}/catalog.ts`;
  const checkoutPath = `${storeDir}/checkout.ts`;
  const files: Record<string, string> = {
    [catalogPath]: catalogFile({ currency: opts.currency ?? "TRY", lang }),
    [checkoutPath]: paytrCheckoutFile({ siteName: opts.siteName, catalogImport: "./catalog" }),
  };

  const notifyUrl = "/api/checkout/paytr-notify";
  if (opts.runtime === "next") {
    const app = opts.appDir ?? "app";
    const start = `${app}/api/checkout/route.ts`;
    const back = `${app}/api/checkout/paytr-notify/route.ts`;
    files[start] = `import { storeCheckout } from ${ts(rel(start, checkoutPath))};

export const dynamic = "force-dynamic";

// POST { lines, buyer, locale } from the checkout page → { order, iframeUrl, token, paymentPageUrl }.
export async function POST(request: Request): Promise<Response> {
  return storeCheckout(process.env).start(request);
}
`;
    files[back] = `import { storeCheckout } from ${ts(rel(back, checkoutPath))};

export const dynamic = "force-dynamic";

// PayTR's notification (Bildirim URL in the PayTR panel), server to server. Answers "OK".
export async function POST(request: Request): Promise<Response> {
  return storeCheckout(process.env).notify(request);
}
`;
  } else {
    const start = "functions/api/checkout/index.ts";
    const back = "functions/api/checkout/paytr-notify.ts";
    const body = (method: "start" | "notify") => `import { storeCheckout, type StoreEnv } from ${ts(rel(method === "start" ? start : back, checkoutPath))};
${method === "notify" ? '\n// PayTR\'s notification (Bildirim URL in the PayTR panel), server to server. Answers "OK".\n' : ""}
// Cloudflare Pages Functions (env.ORDERS is the KV namespace binding)
export async function onRequestPost(context: { request: Request; env: StoreEnv }): Promise<Response> {
  return storeCheckout(context.env ?? {}).${method}(context.request);
}

// Spacefast functions (orders in Upstash: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)
export async function POST(request: Request, context?: { env?: StoreEnv }): Promise<Response> {
  const env = context?.env ?? ((globalThis as { process?: { env?: StoreEnv } }).process?.env ?? {});
  return storeCheckout(env).${method}(request);
}
`;
    files[start] = body("start");
    files[back] = body("notify");
  }

  const env: Record<string, string> = {
    PAYTR_MERCHANT_ID: tr ? "PayTR mağaza paneli → Bilgi: Mağaza no" : "PayTR merchant panel → Info: merchant id",
    PAYTR_MERCHANT_KEY: tr ? "PayTR Mağaza Parola (merchant_key)" : "PayTR merchant key",
    PAYTR_MERCHANT_SALT: tr ? "PayTR Mağaza Gizli Anahtar (merchant_salt)" : "PayTR merchant salt",
    PAYTR_TEST_MODE: "1",
    ...(opts.runtime === "edge"
      ? { ORDERS: tr ? "KV namespace bağlaması (gizli değer değil): npx wrangler kv namespace create ORDERS" : "KV namespace binding (not a secret): npx wrangler kv namespace create ORDERS" }
      : {
          UPSTASH_REDIS_REST_URL: tr ? "Upstash Redis REST adresi (Vercel Marketplace Redis'te KV_REST_API_URL)" : "Upstash Redis REST URL (KV_REST_API_URL with Vercel Marketplace Redis)",
          UPSTASH_REDIS_REST_TOKEN: tr ? "Upstash Redis REST token (Vercel'de KV_REST_API_TOKEN)" : "Upstash Redis REST token (KV_REST_API_TOKEN on Vercel)",
        }),
    RESEND_API_KEY: "re_…",
    ORDER_FROM: tr ? "Mağaza <siparis@alanadiniz.com.tr>" : "Shop <orders@yourdomain.com>",
    ORDER_TO: tr ? "siparişlerin gideceği adres(ler), virgülle" : "where orders go, comma-separated",
  };
  const optionalEnv: Record<string, string> = {
    ...(opts.runtime === "edge"
      ? {
          UPSTASH_REDIS_REST_URL: tr ? "KV yerine (Spacefast): Upstash Redis REST adresi" : "instead of KV (Spacefast): Upstash Redis REST URL",
          UPSTASH_REDIS_REST_TOKEN: tr ? "KV yerine: Upstash Redis REST token" : "instead of KV: Upstash Redis REST token",
        }
      : {}),
    SITE_URL: tr ? "https://alanadiniz.com.tr (boşsa isteğin adresi)" : "https://yourdomain.com (default: the request's origin)",
    ORDER_WEBHOOK_URL: tr ? "her ödenen siparişin JSON olarak gideceği adres (panel, tablo, ERP)" : "receives each paid order as JSON (a panel, a sheet, an ERP)",
    ORDER_WEBHOOK_SECRET: tr ? "webhook imzası (X-Vamos-Signature)" : "signs the webhook (X-Vamos-Signature)",
  };

  const storage = tr
    ? opts.runtime === "edge"
      ? "Siparişler PayTR bildirimine kadar bir KV namespace'te bekler: npx wrangler kv namespace create ORDERS, sonra Pages projesinde Settings → Functions → KV namespace bindings altında ORDERS adıyla bağlayın. Spacefast'te bunun yerine UPSTASH_REDIS_REST_URL / _TOKEN girin."
      : "Siparişler PayTR bildirimine kadar Upstash Redis'te bekler: Vercel'de Marketplace'ten Upstash Redis ekleyin (KV_REST_API_URL / _TOKEN kendiliğinden gelir), başka yerde UPSTASH_REDIS_REST_URL / _TOKEN girin."
    : opts.runtime === "edge"
      ? "Orders wait for PayTR's notification in a KV namespace: npx wrangler kv namespace create ORDERS, then bind it as ORDERS in the Pages project (Settings → Functions → KV namespace bindings). On Spacefast set UPSTASH_REDIS_REST_URL / _TOKEN instead."
      : "Orders wait for PayTR's notification in Upstash Redis: on Vercel add Upstash Redis from the Marketplace (it sets KV_REST_API_URL / _TOKEN), elsewhere set UPSTASH_REDIS_REST_URL / _TOKEN.";
  const notes = tr
    ? [
        `Ürünleri ${catalogPath} dosyasında düzenleyin (fiyatlar KDV dahil, kuruş). Sepet sayfası ve sunucu aynı dosyayı kullanır; tarayıcıdan gelen fiyat hiç okunmaz.`,
        `PayTR mağaza panelinde Bildirim URL'ini https://alanadiniz.com.tr${notifyUrl} yapın. Ödeme sonucu yalnızca oraya gelir; alıcının /order/confirmation?order=… sayfasına dönmesi ödemenin kanıtı değildir, sipariş e-postası esastır.`,
        storage,
        "Sayfada: <CartProvider catalog={catalog}> ile sarın ve useCart().checkout({ buyer }) çağırın: sepet PayTR ödeme sayfasını açar. Sayfa içinde göstermek için redirect={false} verip dönen paymentPageUrl'i (iframe adresi) <iframe> içinde PAYTR_IFRAME_RESIZER betiğiyle gösterin.",
        "PAYTR_TEST_MODE=1 ile PayTR test kartlarıyla deneyin; canlıya geçerken PAYTR_TEST_MODE=0 yapın.",
        "Mesafeli satış sözleşmesi, ön bilgilendirme formu ve iade politikası sayfaları zorunludur: npx vamos-ui site essentials.",
      ]
    : [
        `Edit the products in ${catalogPath} (prices include VAT, in minor units). The cart page and the server use the same file; a price from the browser is never read.`,
        `In the PayTR merchant panel set the notification URL (Bildirim URL) to https://yourdomain.com${notifyUrl}. Only that URL learns the result; the buyer returning to /order/confirmation?order=… is not proof of payment, the order email is.`,
        storage,
        "In the page: wrap with <CartProvider catalog={catalog}> and call useCart().checkout({ buyer }): the cart opens PayTR's payment page. To embed it instead, pass redirect={false} and show the returned paymentPageUrl (the iframe URL) in an <iframe> with the PAYTR_IFRAME_RESIZER script.",
        "Test with PAYTR_TEST_MODE=1 and PayTR's test cards first; for launch set PAYTR_TEST_MODE=0.",
        "Distance-sales contract, pre-information form and returns policy pages are required in Türkiye: npx vamos-ui site essentials.",
      ];
  return { files, env, optionalEnv, notes };
}
