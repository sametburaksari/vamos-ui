/**
 * Store checkout for a site, written into the user's project. The logic lives in
 * @vamos-ui/react/commerce (priced on the server from the catalog, iyzico Checkout Form, signed
 * order cookie, order emails); these files only wire it to the host:
 *
 *   next   app/api/checkout/route.ts + app/api/checkout/callback/route.ts — a Next.js server
 *          (Vercel, a VPS with Node, Spacefast in server mode).
 *   edge   functions/api/checkout/index.ts + functions/api/checkout/callback.ts — static exports
 *          on Cloudflare Pages Functions (`onRequestPost`) and Spacefast functions (`POST`).
 *
 * Both share store/catalog.ts (written once, never replaced) and store/checkout.ts. Pure: returns
 * path → content; the caller writes the files.
 */
import type { Lang } from "./questions";

export type StoreRuntime = "next" | "edge";

export interface StoreOptions {
  runtime: StoreRuntime;
  /** Business name for email subjects. */
  siteName?: string;
  /** Catalog currency. Default TRY. */
  currency?: string;
  lang?: Lang;
  /** Next.js app directory (app or src/app). */
  appDir?: string;
  /** Where catalog.ts and checkout.ts go. Default "store" ("src/store" with a src dir). */
  storeDir?: string;
}

export interface StoreResult {
  files: Record<string, string>;
  /** Environment variables (name → example or hint). */
  env: Record<string, string>;
  /** Optional ones (not needed to run). */
  optionalEnv: Record<string, string>;
  notes: string[];
}

const ts = (s: string) => JSON.stringify(s);

function catalogFile(o: { currency: string; lang: Lang }): string {
  const tr = o.lang === "tr";
  return `import type { Catalog } from "@vamos-ui/react/commerce";

/**
 * ${tr ? "Mağazanın tek fiyat kaynağı: sepet bu dosyadan gösterir, sunucu ödemeyi bu dosyadan hesaplar." : "The store's single source of prices: the cart shows them and the server charges from them."}
 * ${tr ? "Fiyatlar KDV dahil ve kuruş cinsindendir: 349_90 = 349,90 ₺." : "Prices include VAT and are in minor units: 349_90 = 349.90."}
 * ${tr ? "Aşağıdaki iki ürün örnektir; yayından önce kendi ürünlerinizle değiştirin." : "The two products below are examples; replace them with your own before launch."}
 */
export const catalog: Catalog = {
  currency: ${ts(o.currency)},
  vatRate: 20,
  shipping: { flat: 89_90, freeOver: 1500_00, label: ${ts(tr ? "Kargo" : "Shipping")} },
  products: [
    {
      id: "example-mug",
      name: ${ts(tr ? "Örnek kupa" : "Example mug")},
      price: 349_90,
      category: ${ts(tr ? "Mutfak" : "Kitchen")},
      variants: [
        { id: "sand", name: ${ts(tr ? "Kum" : "Sand")} },
        { id: "ink", name: ${ts(tr ? "Mürekkep" : "Ink")}, price: 379_90 },
      ],
    },
    { id: "example-guide", name: ${ts(tr ? "Örnek dijital rehber (PDF)" : "Example digital guide (PDF)")}, price: 120_00, itemType: "VIRTUAL", vatRate: 20 },
  ],
};
`;
}

function checkoutFile(o: { siteName?: string; catalogImport: string }): string {
  return `import { createCheckout, notifyAll, resendNotifier, webhookNotifier, type PaidOrder } from "@vamos-ui/react/commerce";
import { catalog } from ${ts(o.catalogImport)};

export type StoreEnv = Record<string, string | undefined>;

function required(env: StoreEnv, name: string): string {
  const value = env[name];
  if (!value) throw new Error(\`checkout: \${name} is not set\`);
  return value;
}

/** The checkout endpoints for one set of environment variables (no state between requests). */
export function storeCheckout(env: StoreEnv) {
  const notifiers: ((order: PaidOrder) => Promise<void>)[] = [];
  if (env.RESEND_API_KEY) {
    notifiers.push(
      resendNotifier({
        apiKey: env.RESEND_API_KEY,
        from: required(env, "ORDER_FROM"),
        to: required(env, "ORDER_TO").split(",").map((x) => x.trim()).filter(Boolean),
        siteName: ${o.siteName ? ts(o.siteName) : "env.SITE_NAME"},
      }),
    );
  }
  if (env.ORDER_WEBHOOK_URL) notifiers.push(webhookNotifier({ url: env.ORDER_WEBHOOK_URL, secret: env.ORDER_WEBHOOK_SECRET }));
  return createCheckout({
    catalog,
    iyzico: { apiKey: required(env, "IYZICO_API_KEY"), secretKey: required(env, "IYZICO_SECRET_KEY"), mode: env.IYZICO_MODE === "live" ? "live" : "sandbox" },
    orderSecret: required(env, "ORDER_SECRET"),
    siteUrl: env.SITE_URL || undefined,
    notify: notifiers.length ? notifyAll(...notifiers) : undefined,
  });
}
`;
}

/** Relative import from one project file to another, without the extension. */
function rel(from: string, to: string): string {
  const a = from.split("/").slice(0, -1);
  const b = to.replace(/\.tsx?$/, "").split("/");
  let i = 0;
  while (i < a.length && i < b.length - 1 && a[i] === b[i]) i++;
  const up = a.length - i;
  const r = [...Array(up).fill(".."), ...b.slice(i)].join("/");
  return up === 0 ? `./${r}` : r;
}

export function storeFiles(opts: StoreOptions): StoreResult {
  const lang: Lang = opts.lang ?? "tr";
  const tr = lang === "tr";
  const storeDir = opts.storeDir ?? "store";
  const catalogPath = `${storeDir}/catalog.ts`;
  const checkoutPath = `${storeDir}/checkout.ts`;
  const files: Record<string, string> = {
    [catalogPath]: catalogFile({ currency: opts.currency ?? "TRY", lang }),
    [checkoutPath]: checkoutFile({ siteName: opts.siteName, catalogImport: "./catalog" }),
  };

  if (opts.runtime === "next") {
    const app = opts.appDir ?? "app";
    const start = `${app}/api/checkout/route.ts`;
    const back = `${app}/api/checkout/callback/route.ts`;
    files[start] = `import { storeCheckout } from ${ts(rel(start, checkoutPath))};

export const dynamic = "force-dynamic";

// POST { lines, buyer, locale } from the checkout page → { order, paymentPageUrl }.
export async function POST(request: Request): Promise<Response> {
  return storeCheckout(process.env).start(request);
}
`;
    files[back] = `import { storeCheckout } from ${ts(rel(back, checkoutPath))};

export const dynamic = "force-dynamic";

// iyzico posts the payment token here; the buyer is redirected to the confirmation page.
export async function POST(request: Request): Promise<Response> {
  return storeCheckout(process.env).callback(request);
}
`;
  } else {
    const start = "functions/api/checkout/index.ts";
    const back = "functions/api/checkout/callback.ts";
    const body = (method: "start" | "callback") => `import { storeCheckout, type StoreEnv } from ${ts(rel(method === "start" ? start : back, checkoutPath))};

// Cloudflare Pages Functions
export async function onRequestPost(context: { request: Request; env: StoreEnv }): Promise<Response> {
  return storeCheckout(context.env ?? {}).${method}(context.request);
}

// Spacefast functions
export async function POST(request: Request, context?: { env?: StoreEnv }): Promise<Response> {
  const env = context?.env ?? ((globalThis as { process?: { env?: StoreEnv } }).process?.env ?? {});
  return storeCheckout(env).${method}(request);
}
`;
    files[start] = body("start");
    files[back] = body("callback");
  }

  const env: Record<string, string> = {
    IYZICO_API_KEY: tr ? "iyzico panelinden (sandbox-… test anahtarı)" : "from the iyzico panel (sandbox-… test key)",
    IYZICO_SECRET_KEY: tr ? "iyzico gizli anahtarı" : "iyzico secret key",
    IYZICO_MODE: "sandbox",
    ORDER_SECRET: tr ? "en az 32 rastgele karakter: openssl rand -hex 32" : "at least 32 random characters: openssl rand -hex 32",
    RESEND_API_KEY: "re_…",
    ORDER_FROM: tr ? "Mağaza <siparis@alanadiniz.com.tr>" : "Shop <orders@yourdomain.com>",
    ORDER_TO: tr ? "siparişlerin gideceği adres(ler), virgülle" : "where orders go, comma-separated",
  };
  const optionalEnv: Record<string, string> = {
    SITE_URL: tr ? "https://alanadiniz.com.tr (boşsa isteğin adresi)" : "https://yourdomain.com (default: the request's origin)",
    ORDER_WEBHOOK_URL: tr ? "her ödenen siparişin JSON olarak gideceği adres (panel, tablo, ERP)" : "receives each paid order as JSON (a panel, a sheet, an ERP)",
    ORDER_WEBHOOK_SECRET: tr ? "webhook imzası (X-Vamos-Signature)" : "signs the webhook (X-Vamos-Signature)",
  };

  const notes = tr
    ? [
        `Ürünleri ${catalogPath} dosyasında düzenleyin (fiyatlar KDV dahil, kuruş). Sepet sayfası ve sunucu aynı dosyayı kullanır; tarayıcıdan gelen fiyat hiç okunmaz.`,
        `Sayfada: <CartProvider catalog={catalog}> (@vamos-ui/react/commerce/cart) ile sarın; ödeme formunda useCart().checkout({ buyer }) çağırın. Ödeme sonrası alıcı /order/confirmation?order=… sayfasına, başarısız ödemede /checkout?payment=failed sayfasına döner.`,
        "Önce IYZICO_MODE=sandbox ile iyzico test kartlarıyla deneyin; canlıya geçerken canlı anahtarları girip IYZICO_MODE=live yapın.",
        "Mesafeli satış sözleşmesi, ön bilgilendirme formu ve iade politikası sayfaları zorunludur: npx vamos-ui site essentials.",
      ]
    : [
        `Edit the products in ${catalogPath} (prices include VAT, in minor units). The cart page and the server use the same file; a price from the browser is never read.`,
        `In the page: wrap with <CartProvider catalog={catalog}> (@vamos-ui/react/commerce/cart) and call useCart().checkout({ buyer }) from the checkout form. After payment the buyer lands on /order/confirmation?order=…, after a failed payment on /checkout?payment=failed.`,
        "Test with IYZICO_MODE=sandbox and iyzico's test cards first; for launch enter the live keys and set IYZICO_MODE=live.",
        "Distance-sales contract, pre-information form and returns policy pages are required in Türkiye: npx vamos-ui site essentials.",
      ];
  return { files, env, optionalEnv, notes };
}
