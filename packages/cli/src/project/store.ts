/**
 * Store checkout for a site, written into the user's project. The logic lives in
 * @vamos-ui/react/commerce (priced on the server from the catalog, iyzico Checkout Form, signed
 * order cookie, order emails); these files only wire it to the host:
 *
 *   next   app/api/checkout/route.ts + app/api/checkout/callback/route.ts — a Next.js server
 *          (Vercel, a VPS with Node, Spacefast in server mode).
 *   edge   functions/api/checkout/index.ts + functions/api/checkout/callback.ts — static exports
 *          on Cloudflare Pages Functions (`onRequestPost`) and Spacefast functions (`POST`).
 *   php    public/api/checkout.php + checkout-callback.php (+ .htaccess routes) — static exports
 *          on shared hosting (Apache + PHP, cPanel). The same rules in PHP: see store-php.ts.
 *
 * next and edge share store/catalog.ts (written once, never replaced) and store/checkout.ts. php
 * keeps the products in public/api/_store/catalog.json, which store/catalog.ts imports, so the cart
 * and the PHP read one file. Pure: returns path → content; the caller writes the files. `provider: "paytr"` writes the PayTR
 * variant instead (store-paytr.ts; next and edge only).
 */
import { PHP_CATALOG, PHP_CONFIG_NAME, phpStoreFiles } from "./store-php";
import type { Lang } from "./questions";
import { paytrStoreFiles } from "./store-paytr";

export type StoreRuntime = "next" | "edge" | "php";
/** Payment provider. iyzico (default) needs no storage; PayTR needs an order store (store-paytr.ts). */
export type StoreProvider = "iyzico" | "paytr";

export interface StoreOptions {
  runtime: StoreRuntime;
  /** Default iyzico. */
  provider?: StoreProvider;
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

/** The two example products of the PHP runtime's catalog.json (the same as catalogFile). */
function catalogData(o: { currency: string; lang: Lang }) {
  const tr = o.lang === "tr";
  return {
    currency: o.currency,
    vatRate: 20,
    shipping: { flat: 8990, freeOver: 150000, label: tr ? "Kargo" : "Shipping" },
    products: [
      {
        id: "example-mug",
        name: tr ? "Örnek kupa" : "Example mug",
        price: 34990,
        category: tr ? "Mutfak" : "Kitchen",
        variants: [
          { id: "sand", name: tr ? "Kum" : "Sand" },
          { id: "ink", name: tr ? "Mürekkep" : "Ink", price: 37990 },
        ],
      },
      { id: "example-guide", name: tr ? "Örnek dijital rehber (PDF)" : "Example digital guide (PDF)", price: 12000, itemType: "VIRTUAL", vatRate: 20 },
    ],
  };
}

export function catalogFile(o: { currency: string; lang: Lang }): string {
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

/** store/catalog.ts for the PHP runtime: the type over the JSON both sides read. */
function phpCatalogModule(o: { lang: Lang; jsonImport: string }): string {
  const tr = o.lang === "tr";
  return `import type { Catalog } from "@vamos-ui/react/commerce";
import data from ${ts(o.jsonImport)};

/**
 * ${tr ? "Ürünler ve fiyatlar public/api/_store/catalog.json dosyasındadır: sepet onu derleme sırasında, sunucudaki" : "The products and prices are in public/api/_store/catalog.json: the cart reads it at build time and the"}
 * ${tr ? "PHP ödeme sayfası ödeme anında okur. Tek dosya olduğu için ikisi hiç ayrışmaz; kopyalama adımı yoktur." : "PHP checkout on the server reads it at payment time. One file, so the two never drift; nothing to copy."}
 * ${tr ? "Fiyatlar KDV dahil ve kuruş cinsindendir: 34990 = 349,90 ₺. Dosya web'den okunamaz (.htaccess) ve" : "Prices include VAT, in minor units: 34990 = 349.90. The file is denied to the web (.htaccess) and holds"}
 * ${tr ? "gizli bir şey içermez: anahtarlar site klasörünün dışındaki " + PHP_CONFIG_NAME + " dosyasındadır." : "nothing secret: the keys live in " + PHP_CONFIG_NAME + " outside the site folder."}
 */
export const catalog = data as Catalog;
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
export function rel(from: string, to: string): string {
  const a = from.split("/").slice(0, -1);
  const b = to.replace(/\.tsx?$/, "").split("/");
  let i = 0;
  while (i < a.length && i < b.length - 1 && a[i] === b[i]) i++;
  const up = a.length - i;
  const r = [...Array(up).fill(".."), ...b.slice(i)].join("/");
  return up === 0 ? `./${r}` : r;
}

export function storeFiles(opts: StoreOptions): StoreResult {
  if (opts.provider === "paytr") return paytrStoreFiles(opts);
  const lang: Lang = opts.lang ?? "tr";
  const tr = lang === "tr";
  const storeDir = opts.storeDir ?? "store";
  const catalogPath = `${storeDir}/catalog.ts`;
  const checkoutPath = `${storeDir}/checkout.ts`;
  if (opts.runtime === "php") return phpStore({ ...opts, lang, catalogPath });
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

function phpStore(opts: StoreOptions & { lang: Lang; catalogPath: string }): StoreResult {
  const tr = opts.lang === "tr";
  const catalogJson = `${JSON.stringify(catalogData({ currency: opts.currency ?? "TRY", lang: opts.lang }), null, 2)}\n`;
  const files: Record<string, string> = {
    [opts.catalogPath]: phpCatalogModule({ lang: opts.lang, jsonImport: rel(opts.catalogPath, PHP_CATALOG) }),
    ...phpStoreFiles({ lang: opts.lang, siteName: opts.siteName, catalogJson }),
  };
  const env: Record<string, string> = {
    IYZICO_API_KEY: tr ? "iyzico panelinden (sandbox-… test anahtarı)" : "from the iyzico panel (sandbox-… test key)",
    IYZICO_SECRET_KEY: tr ? "iyzico gizli anahtarı" : "iyzico secret key",
    IYZICO_MODE: "sandbox",
    ORDER_SECRET: tr ? "en az 32 rastgele karakter: openssl rand -hex 32" : "at least 32 random characters: openssl rand -hex 32",
    ORDER_FROM: tr ? "Mağaza <siparis@alanadiniz.com.tr> (bu alan adında var olan bir e-posta hesabı)" : "Shop <orders@yourdomain.com> (a real mailbox on this domain)",
    ORDER_TO: tr ? "siparişlerin gideceği adres(ler), virgülle" : "where orders go, comma-separated",
  };
  const optionalEnv: Record<string, string> = {
    SITE_URL: tr ? "https://alanadiniz.com.tr (önerilir; boşsa isteğin adresi)" : "https://yourdomain.com (recommended; default: the request's host)",
    ORDER_WEBHOOK_URL: tr ? "her ödenen siparişin JSON olarak gideceği adres (panel, tablo, ERP)" : "receives each paid order as JSON (a panel, a sheet, an ERP)",
    ORDER_WEBHOOK_SECRET: tr ? "webhook imzası (X-Vamos-Signature)" : "signs the webhook (X-Vamos-Signature)",
    STATE_DIR: tr ? "tek bildirim işaretleri için klasör, ör. ~/vamos-store-state (boşsa sistem geçici klasörü)" : "folder for the notify-once markers, e.g. ~/vamos-store-state (default: the system temp folder)",
    ALLOWED_ORIGINS: tr ? "ödeme başlatabilecek başka kökenler, virgülle" : "other origins allowed to start a checkout, comma-separated",
  };
  const notes = tr
    ? [
        `Ürünleri ${PHP_CATALOG} dosyasında düzenleyin (fiyatlar KDV dahil, kuruş: 34990 = 349,90 ₺). Sepet ${opts.catalogPath} üzerinden aynı dosyayı okur; sunucu ödemeyi bu dosyadan hesaplar, tarayıcıdan gelen fiyat hiç okunmaz. Fiyat değişince yeniden derleyip yükleyin.`,
        `Gizli ayarlar: store/php-config.example.php dosyasını hostingde ~/${PHP_CONFIG_NAME} olarak kopyalayın (public_html'in DIŞI, chmod 600) ve doldurun. cPanel: Dosya Yöneticisi > ana dizin; ya da başka bir yol için VAMOS_STORE_CONFIG ortam değişkeni.`,
        "cPanel > MultiPHP Manager: PHP 8.1 veya üstü; curl, mbstring (ve isteğe bağlı intl) eklentileri açık olmalı. Site HTTPS ile açılmalı (sipariş çerezi Secure).",
        "Sipariş e-postaları hostingin mail() fonksiyonuyla gider: ORDER_FROM bu alan adında gerçek bir e-posta hesabı olmalı (SPF/DKIM). İndirim kodları PHP ödemede desteklenmez (coupon-unsupported).",
        "Yerelde denemek için: next build sonrası VAMOS_STORE_CONFIG=... php -S localhost:8080 -t out store/php-dev-router.php. Tam ödemeyi hostingde sandbox anahtarları ve iyzico test kartlarıyla deneyin; canlıya geçerken IYZICO_MODE=live.",
        "Mesafeli satış sözleşmesi, ön bilgilendirme formu ve iade politikası sayfaları zorunludur: npx vamos-ui site essentials.",
      ]
    : [
        `Edit the products in ${PHP_CATALOG} (prices include VAT, in minor units: 34990 = 349.90). The cart reads the same file through ${opts.catalogPath}; the server charges from it and never reads a price from the browser. Rebuild and upload after a price change.`,
        `Secrets: copy store/php-config.example.php to ~/${PHP_CONFIG_NAME} on the host (OUTSIDE public_html, chmod 600) and fill it in. cPanel: File Manager > home directory; or point VAMOS_STORE_CONFIG at another path.`,
        "cPanel > MultiPHP Manager: PHP 8.1 or newer with the curl and mbstring extensions (intl optional). Serve the site over HTTPS (the order cookie is Secure).",
        "Order emails go out through the host's mail(): ORDER_FROM must be a real mailbox on this domain (SPF/DKIM). Discount codes are not supported by the PHP checkout (coupon-unsupported).",
        "To try it locally: after next build, VAMOS_STORE_CONFIG=... php -S localhost:8080 -t out store/php-dev-router.php. Test the full payment on the host with sandbox keys and iyzico's test cards; for launch set IYZICO_MODE=live.",
        "Distance-sales contract, pre-information form and returns policy pages are required in Türkiye: npx vamos-ui site essentials.",
      ];
  return { files, env, optionalEnv, notes };
}
