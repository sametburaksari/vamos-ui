/**
 * Turns interview answers (and, optionally, what was imported from a current site) into a
 * project plan: pages and the kit components on them, legal pages, hosting and form setup,
 * measurement, and a task list for the specialists (brand, content, build, legal, SEO, QA,
 * deploy). Pure and deterministic, so every client produces the same plan.
 */

import type { SiteInfo } from "../site-info";
import { type Answers, type Lang, type SiteType, type Text, wantsTurkish } from "./questions";

export type Structure = "single" | "multi";
export type Hosting = "vercel" | "netlify" | "cloudflare" | "cpanel" | "vps";
export type FormDelivery = "smtp" | "resend" | "php-mail" | "whatsapp" | "none";
export type Agent = "brand" | "content" | "build" | "legal" | "seo" | "tracking" | "forms" | "qa" | "deploy";

export interface PlanPage {
  path: string;
  title: Text;
  /** Kit components / blocks, top to bottom (registry names). */
  sections: string[];
  why?: Text;
}

export interface PlanTask {
  id: string;
  agent: Agent;
  title: Text;
  status: "todo" | "blocked" | "done";
  /** What the user still has to provide before the task can finish. */
  needs?: Text[];
}

export interface Decision {
  value: string;
  reason: Text;
}

export interface ProjectPlan {
  siteType: SiteType;
  structure: Decision & { value: Structure };
  languages: string[];
  /** Closest example websites in the registry to start from. */
  templates: string[];
  pages: PlanPage[];
  legalPages: { path: string; title: Text; required: boolean }[];
  hosting: Decision & { value: Hosting; output: "static" | "server" };
  forms: Decision & { value: FormDelivery; spam: string[]; consent: boolean; env: string[] };
  tracking: { tools: string[]; consentMode: boolean; steps: Text[] };
  domain: { name: string | null; ideas: string[] };
  /** Online store only: where products live, payments, shipping. */
  commerce?: { catalog: Decision; payments: string[]; shipping: string; einvoice: boolean };
  compliance: Text[];
  tasks: PlanTask[];
  openQuestions: Text[];
}

const t = (en: string, tr: string): Text => ({ en, tr });
const list = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] ?? "" : v ?? "");

/** Section → kit components, in page order. */
const SECTION_COMPONENTS: Record<string, string[]> = {
  services: ["feature-grid"],
  about: ["media-text"],
  team: ["team"],
  gallery: ["gallery-section"],
  testimonials: ["testimonials"],
  pricing: ["pricing-table"],
  faq: ["faq"],
  blog: ["blog-list"],
  location: ["map-hours"],
  careers: ["page-intro", "rich-text-section"],
};

const SECTION_TITLES: Record<string, Text> = {
  services: t("Services", "Hizmetler"),
  about: t("About", "Hakkımızda"),
  team: t("Team", "Ekip"),
  gallery: t("Gallery", "Galeri"),
  testimonials: t("Reviews", "Yorumlar"),
  pricing: t("Prices", "Fiyatlar"),
  faq: t("FAQ", "SSS"),
  blog: t("Blog", "Blog"),
  location: t("Location", "Konum"),
  careers: t("Careers", "Kariyer"),
};

const SECTION_SLUGS: Record<string, Text> = {
  services: t("services", "hizmetler"),
  about: t("about", "hakkimizda"),
  team: t("team", "ekip"),
  gallery: t("gallery", "galeri"),
  testimonials: t("reviews", "yorumlar"),
  pricing: t("pricing", "fiyatlar"),
  faq: t("faq", "sss"),
  blog: t("blog", "blog"),
  location: t("location", "konum"),
  careers: t("careers", "kariyer"),
};

/** Paths on a current site that already serve a planned section (kept, so links and rankings survive). */
const SECTION_PATTERNS: Record<string, RegExp> = {
  services: /^\/(?:hizmet(?:ler|lerimiz)?|services?|ne-yapiyoruz|what-we-do)$/,
  about: /^\/(?:hakkimizda|hakkinda|about(?:-us)?|biz-kimiz|kurumsal|who-we-are)$/,
  team: /^\/(?:ekip(?:imiz)?|team|kadromuz|our-team)$/,
  gallery: /^\/(?:galeri|gallery|portfolyo|portfolio|islerimiz|calismalarimiz|work)$/,
  testimonials: /^\/(?:yorumlar|referanslar(?:imiz)?|testimonials|reviews|references)$/,
  pricing: /^\/(?:fiyatlar|fiyat-listesi|paketler|pricing|prices|plans)$/,
  faq: /^\/(?:sss|sik-sorulan-sorular|faq)$/,
  blog: /^\/(?:blog|haberler|news|makaleler|yazilar|journal)$/,
  location: /^\/(?:konum|location|subelerimiz|locations)$/,
  careers: /^\/(?:kariyer|careers|jobs|is-ilanlari|insan-kaynaklari)$/,
  contact: /^\/(?:iletisim|contact(?:-us)?|bize-ulasin|ulasim)$/,
};

const GENERIC_LABEL = /^(?:tümünü gör|tümü|hepsi|daha fazla|devamı|detaylar|incele|see all|view all|all|more|read more|learn more|details)$/i;

/** Menu label for a kept page; generic labels ("See all →") become the path's last segment. */
function pageLabel(label: string, path: string): string {
  const clean = label.replace(/[→›»>←‹«<]+/g, "").replace(/\s+/g, " ").trim();
  if (clean && !GENERIC_LABEL.test(clean)) return clean;
  const seg = path.split("/").filter(Boolean).pop() ?? "";
  return seg ? seg.replace(/-/g, " ").replace(/^./, (c) => c.toLocaleUpperCase("tr")) : clean || path;
}

const TEMPLATES: Record<SiteType, string[]> = {
  "local-business": ["site-studio-01", "site-florist-01", "site-autoservice-01"],
  corporate: ["site-agency-01", "site-accounting-01", "site-law-01"],
  ecommerce: ["site-store-01", "site-store-02"],
  booking: ["site-clinic-01", "site-physio-01", "site-therapy-01"],
  portfolio: ["site-portfolio-01", "site-portfolio-02", "site-cv-01"],
  blog: ["site-blog-01", "site-blog-02"],
  saas: ["site-saas-01", "site-saas-02"],
  nonprofit: ["site-nonprofit-01"],
  event: ["site-event-01", "site-venue-01"],
};

/** schema.org type for vamos.site.json. */
export const SCHEMA_TYPES: Record<SiteType, string> = {
  "local-business": "LocalBusiness",
  corporate: "ProfessionalService",
  ecommerce: "OnlineStore",
  booking: "LocalBusiness",
  portfolio: "Person",
  blog: "Organization",
  saas: "Organization",
  nonprofit: "NGO",
  event: "Organization",
};

export function slugify(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " ve ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decideStructure(a: Answers, type: SiteType, sections: string[]): ProjectPlan["structure"] {
  const asked = one(a.structure);
  if (asked === "single" || asked === "multi") return { value: asked, reason: t("You chose it.", "Siz seçtiniz.") };
  if (type === "ecommerce" || type === "blog" || sections.includes("blog"))
    return { value: "multi", reason: t("Products or articles need their own pages and URLs.", "Ürünler ya da yazılar kendi sayfalarına ve adreslerine ihtiyaç duyar.") };
  if (sections.length >= 6)
    return { value: "multi", reason: t(`${sections.length} topics read better as separate pages and rank separately in search.`, `${sections.length} konu ayrı sayfalarda daha iyi okunur ve aramada ayrı ayrı sıralanır.`) };
  if (type === "corporate" && sections.includes("services"))
    return { value: "multi", reason: t("Each service gets its own page, which helps people searching for it.", "Her hizmetin kendi sayfası olur; o hizmeti arayanlara ulaşmak kolaylaşır.") };
  return { value: "single", reason: t(`${sections.length || "A few"} sections fit on one page; it launches fastest and can grow later.`, `${sections.length || "Birkaç"} bölüm tek sayfaya sığar; en hızlı yayına çıkar, sonra büyütülebilir.`) };
}

function decideHosting(a: Answers, type: SiteType): ProjectPlan["hosting"] {
  const asked = one(a.hosting);
  if (asked === "cpanel") return { value: "cpanel", output: "static", reason: t("Shared hosting serves files: the site is exported as static HTML and forms use a small PHP mailer.", "Paylaşımlı hosting dosya sunar: site statik HTML olarak çıkar, formlar küçük bir PHP gönderici kullanır.") };
  if (asked === "vps") return { value: "vps", output: "server", reason: t("Your own server runs Next.js with Node (pm2 or Docker) behind your web server.", "Kendi sunucunuzda Next.js, Node ile (pm2 ya da Docker) web sunucusunun arkasında çalışır.") };
  if (asked === "netlify" || asked === "cloudflare" || asked === "vercel")
    return { value: asked, output: "server", reason: t("Builds from your Git repository; forms run as serverless functions.", "Git deposundan derlenir; formlar sunucusuz fonksiyon olarak çalışır.") };
  return {
    value: "vercel",
    output: "server",
    reason:
      type === "ecommerce"
        ? t("Vercel: free to start, runs the checkout and payment callbacks, deploys from Git.", "Vercel: başlangıçta ücretsiz, ödeme ve geri dönüş adımlarını çalıştırır, Git'ten yayınlar.")
        : t("Vercel: free for a site like this, HTTPS and deploys from Git included.", "Vercel: bu boyutta bir site için ücretsiz; HTTPS ve Git'ten yayın dahil."),
  };
}

function decideForms(a: Answers, hosting: ProjectPlan["hosting"]): ProjectPlan["forms"] {
  const channels = list(a.contact_channels);
  const wantsForm = channels.includes("form") || one(a.booking_tool) === "form";
  const spam = ["honeypot", "min-fill-time", "rate-limit"];
  if (!wantsForm) return { value: "none", reason: t("No form was asked for.", "Form istenmedi."), spam: [], consent: false, env: [] };
  let value = one(a.form_delivery) as FormDelivery | "recommend" | "";
  let reason = t("You chose it.", "Siz seçtiniz.");
  if (!value || value === "recommend") {
    value = hosting.output === "static" ? "php-mail" : "smtp";
    reason =
      value === "php-mail"
        ? t("Static hosting has no Node server; a PHP mailer next to the site sends the form with the host's mail account.", "Statik hostingde Node sunucu yok; sitenin yanındaki PHP gönderici formu hostingin e-posta hesabıyla yollar.")
        : t("SMTP works with the email account you already have; no extra service.", "SMTP mevcut e-posta hesabınızla çalışır; ek servis gerekmez.");
  }
  if (value === "smtp" && hosting.output === "static") {
    value = "php-mail";
    reason = t("SMTP from a static site needs a server script; on this hosting that is the PHP mailer.", "Statik sitede SMTP için sunucu betiği gerekir; bu hostingde bu PHP göndericidir.");
  }
  const env =
    value === "smtp" ? ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "CONTACT_TO"] : value === "resend" ? ["RESEND_API_KEY", "CONTACT_TO"] : value === "php-mail" ? ["CONTACT_TO (in contact.php)"] : [];
  return { value: value as FormDelivery, reason, spam: value === "whatsapp" ? [] : spam, consent: true, env };
}

function legalPages(a: Answers, type: SiteType, tr: boolean, tracking: string[]): ProjectPlan["legalPages"] {
  const pages: ProjectPlan["legalPages"] = [];
  const add = (en: string, trSlug: string, title: Text, required: boolean) => pages.push({ path: `/${tr ? trSlug : en}`, title, required });
  const collectsData = list(a.contact_channels).includes("form") || type === "ecommerce" || type === "booking";
  if (tr) add("kvkk", "kvkk-aydinlatma-metni", t("KVKK information notice", "KVKK aydınlatma metni"), collectsData);
  add("privacy-policy", "gizlilik-politikasi", t("Privacy policy", "Gizlilik politikası"), true);
  const tools = tracking.filter((x) => x !== "none" && x !== "gsc");
  add("cookie-policy", "cerez-politikasi", t("Cookie policy", "Çerez politikası"), tools.length > 0);
  if (type === "ecommerce") {
    add("distance-sales-agreement", "mesafeli-satis-sozlesmesi", t("Distance sales agreement", "Mesafeli satış sözleşmesi"), true);
    add("pre-information", "on-bilgilendirme-formu", t("Pre-contract information", "Ön bilgilendirme formu"), true);
    add("refund-policy", "iade-politikasi", t("Returns and refunds", "İade ve cayma hakkı"), true);
  }
  if (type === "ecommerce" || type === "saas" || type === "booking") add("terms-of-use", "kullanim-kosullari", t("Terms of use", "Kullanım koşulları"), type !== "booking");
  if (one(a.legal_entity) === "company" && tr) add("legal-notice", "yasal-uyari", t("Legal notice", "Yasal uyarı"), false);
  return pages;
}

const DOMAIN_STOP = new Set(["ve", "and", "the", "ltd", "sti", "as", "a", "s", "inc", "llc", "gmbh", "co", "sirketi", "ticaret", "sanayi", "limited"]);
const DOMAIN_GENERIC = new Set(["atolyesi", "atolye", "studio", "studyo", "magazasi", "magaza", "shop", "store", "group", "grup", "hizmetleri", "danismanlik", "consulting", "official"]);

/** Short, readable domain ideas from the business name (availability is not checked). */
export function domainIdeas(name: string, tr: boolean): string[] {
  const words = slugify(name).split("-").filter((w) => w && !DOMAIN_STOP.has(w));
  if (!words.length) return [];
  const core = words.filter((w) => !DOMAIN_GENERIC.has(w));
  const main = (core.length ? core : words).slice(0, 2).join("");
  const withThird = (core.length ? core : words).slice(0, 3).join("");
  const tlds = tr ? [".com.tr", ".com", ".tr"] : [".com", ".co", ".io"];
  const ideas = [`${main}${tlds[0]}`, `${main}${tlds[1]}`];
  if (withThird !== main && withThird.length <= 24) ideas.push(`${withThird}${tlds[0]}`);
  ideas.push(`${main}${tlds[2]}`);
  return [...new Set(ideas)].filter((d) => d.split(".")[0]!.length >= 3);
}

export interface ImportedHints {
  /** Navigation of the current site (path + label), used to keep its structure. */
  pages?: { path: string; label: string }[];
  site?: Partial<SiteInfo>;
}

export function buildPlan(a: Answers, imported: ImportedHints = {}): ProjectPlan {
  const type = (one(a.site_type) || "local-business") as SiteType;
  const tr = wantsTurkish(a) || (!a.languages && true);
  const L: Lang = tr ? "tr" : "en";
  const languages = list(a.languages).length ? list(a.languages) : ["tr"];
  const sections = list(a.sections);
  const channels = list(a.contact_channels);
  const tracking = list(a.tracking).filter((x) => x !== "none");

  const structure = decideStructure(a, type, sections);
  const hosting = decideHosting(a, type);
  const forms = decideForms(a, hosting);

  // Pages
  const contactSections = [
    ...(channels.includes("form") || one(a.booking_tool) === "form" ? ["contact-form"] : []),
    ...(channels.includes("map") && !sections.includes("location") ? ["map-hours"] : []),
  ];
  const chrome = { top: ["navbar"], bottom: ["footer", ...(channels.includes("whatsapp") || channels.includes("phone") ? ["contact-dock"] : []), ...(tracking.some((x) => x !== "gsc") ? ["consent-banner"] : [])] };
  const pages: PlanPage[] = [];
  if (structure.value === "single") {
    const body = sections.flatMap((s) => SECTION_COMPONENTS[s] ?? []);
    pages.push({ path: "/", title: t("Home", "Ana sayfa"), sections: [...chrome.top, "hero", ...dedupe(body), ...(contactSections.length ? contactSections : ["cta"]), ...chrome.bottom] });
    if (sections.includes("blog")) pages.push({ path: `/${SECTION_SLUGS.blog![L]}/[slug]`, title: t("Article", "Yazı"), sections: [...chrome.top, "article-layout", ...chrome.bottom] });
  } else {
    const home =
      type === "ecommerce"
        ? ["hero", "site-store-01", "feature-grid", ...(sections.includes("testimonials") ? ["testimonials"] : []), "cta"]
        : ["hero", ...(sections.includes("services") ? ["feature-grid"] : []), ...(sections.includes("testimonials") ? ["testimonials"] : []), ...(type === "corporate" ? ["logo-strip", "stats-band"] : []), "cta"];
    pages.push({
      path: "/",
      title: t("Home", "Ana sayfa"),
      sections: [...chrome.top, ...dedupe(home), ...chrome.bottom],
      ...(type === "ecommerce" ? { why: t("Featured products under the hero; the feature grid carries shipping, returns and secure payment.", "Ana başlığın altında öne çıkan ürünler; özellik ızgarası kargo, iade ve güvenli ödemeyi anlatır.") } : {}),
    });
    // A planned section reuses the current site's page for it when there is one.
    const existingPath = (section: string): string | undefined => imported.pages?.find((p) => SECTION_PATTERNS[section]?.test(p.path))?.path;
    const keptWhy = t("Same address as on the current site, so its links and search ranking are kept.", "Mevcut sitedeki adresle aynı; bağlantıları ve arama sıralaması korunur.");
    for (const s of sections) {
      const comps = SECTION_COMPONENTS[s];
      if (!comps) continue;
      const kept = existingPath(s);
      const path = kept ?? `/${SECTION_SLUGS[s]![L]}`;
      pages.push({ path, title: SECTION_TITLES[s]!, sections: [...chrome.top, "page-intro", ...comps.filter((c) => c !== "page-intro"), "cta", ...chrome.bottom], ...(kept ? { why: keptWhy } : {}) });
      if (s === "blog") pages.push({ path: `${path}/[slug]`, title: t("Article", "Yazı"), sections: [...chrome.top, "article-layout", ...chrome.bottom] });
    }
    if (contactSections.length || channels.length) {
      const kept = existingPath("contact");
      pages.push({ path: kept ?? (tr ? "/iletisim" : "/contact"), title: t("Contact", "İletişim"), sections: [...chrome.top, "page-intro", ...(contactSections.length ? contactSections : ["map-hours"]), ...chrome.bottom], ...(kept ? { why: keptWhy } : {}) });
    }
  }
  if (type === "ecommerce") {
    const p = (en: string, trp: string) => (tr ? trp : en);
    pages.push(
      { path: p("/products", "/urunler"), title: t("Products", "Ürünler"), sections: [...chrome.top, "page-intro", "site-store-01", ...chrome.bottom] },
      { path: p("/products/[slug]", "/urun/[slug]"), title: t("Product", "Ürün"), sections: [...chrome.top, "product-01", ...chrome.bottom] },
      { path: p("/cart", "/sepet"), title: t("Cart", "Sepet"), sections: [...chrome.top, "cart-01", ...chrome.bottom] },
      { path: p("/checkout", "/odeme"), title: t("Checkout", "Ödeme"), sections: ["checkout-01"] },
      { path: p("/order/[id]", "/siparis/[id]"), title: t("Order confirmation", "Sipariş onayı"), sections: [...chrome.top, "order-confirmation-01", ...chrome.bottom] },
    );
  }
  if (imported.pages?.length) {
    const known = new Set(pages.map((p) => p.path));
    for (const p of imported.pages) {
      if (known.has(p.path) || p.path === "/" || /^\/(?:kvkk|gizlilik|cerez|privacy|cookie|terms|kullanim)/.test(p.path)) continue;
      if (structure.value !== "multi") continue;
      const label = pageLabel(p.label, p.path);
      // A page under a planned section (e.g. /hizmetler/yazilim) is a detail page for it.
      const parent = pages.find((x) => x.path !== "/" && p.path.startsWith(`${x.path}/`));
      const body = parent ? ["page-intro", "media-text", "faq", "cta"] : ["page-intro", "rich-text-section", "cta"];
      pages.push({ path: p.path, title: t(label, label), sections: [...chrome.top, ...body, ...chrome.bottom], why: t("Exists on the current site; keeping it keeps its links and search ranking.", "Mevcut sitede var; korumak bağlantılarını ve arama sıralamasını korur.") });
      known.add(p.path);
    }
  }

  const legal = legalPages(a, type, tr, tracking);

  // Measurement
  const steps: Text[] = [];
  if (tracking.includes("gsc")) steps.push(t("Search Console: add the domain property, verify with a DNS TXT record, submit /sitemap.xml.", "Search Console: alan adı mülkünü ekleyin, DNS TXT kaydıyla doğrulayın, /sitemap.xml gönderin."));
  if (tracking.includes("ga4")) steps.push(t("GA4: create a property and web stream; put the G- id in vamos.site.json (analytics.ga4).", "GA4: mülk ve web akışı oluşturun; G- kimliğini vamos.site.json'a yazın (analytics.ga4)."));
  if (tracking.includes("google-ads")) steps.push(t("Google Ads: create conversions for form send, phone and WhatsApp clicks; put the AW- id in analytics.googleAds.", "Google Ads: form gönderimi, telefon ve WhatsApp tıklaması için dönüşüm oluşturun; AW- kimliğini analytics.googleAds'e yazın."));
  if (tracking.includes("meta")) steps.push(t("Meta: create a dataset (pixel) in Events Manager; put its id in analytics.metaPixel.", "Meta: Olay Yöneticisi'nde veri kümesi (piksel) oluşturun; kimliğini analytics.metaPixel'e yazın."));
  const consentMode = tracking.some((x) => x !== "gsc");
  if (consentMode)
    steps.push(
      t(
        "The kit's Analytics component loads each tool only after consent and sends: generate_lead (form), click_call, click_whatsapp, click_email, click_directions. Mark generate_lead (and calls if wanted) as key events in GA4.",
        "Kitin Analytics bileşeni her aracı yalnızca onaydan sonra yükler ve şu olayları gönderir: generate_lead (form), click_call, click_whatsapp, click_email, click_directions. GA4'te generate_lead'i (isterseniz aramaları da) temel olay işaretleyin.",
      ),
    );

  // Compliance (Turkey first)
  const compliance: Text[] = [];
  if (tr && legal.some((p) => p.path.includes("kvkk")))
    compliance.push(t("KVKK: forms link the information notice and ask for explicit consent only for marketing; data stays in your inbox.", "KVKK: formlar aydınlatma metnine bağlanır, açık rıza yalnızca pazarlama için istenir; veriler sizin gelen kutunuzda kalır."));
  if (consentMode) compliance.push(t("Cookies: measurement loads only after consent (Consent Mode v2, default denied).", "Çerezler: ölçüm araçları yalnızca onaydan sonra yüklenir (Consent Mode v2, varsayılan reddedildi)."));
  if (type === "ecommerce" && tr) {
    compliance.push(t("Register the store in ETBİS (etbis.ticaret.gov.tr) and show the ETBİS badge in the footer.", "Mağazayı ETBİS'e kaydedin (etbis.ticaret.gov.tr) ve ETBİS logosunu footer'da gösterin."));
    compliance.push(t("Show trade name, MERSIS number, address and contact in the footer or legal notice (Law 6563).", "Unvan, MERSIS numarası, adres ve iletişim bilgilerini footer'da ya da yasal uyarıda gösterin (6563 sayılı Kanun)."));
    compliance.push(t("Checkout shows the pre-contract information form and the distance sales agreement before payment; 14-day withdrawal right.", "Ödeme öncesinde ön bilgilendirme formu ve mesafeli satış sözleşmesi gösterilir; 14 günlük cayma hakkı."));
    if (one(a.einvoice) === "yes") compliance.push(t("e-Archive invoice: connect your integrator after payment (not part of the kit).", "e-Arşiv fatura: ödemeden sonra entegratörünüzü bağlayın (kitin parçası değil)."));
  }
  if (type === "ecommerce" && list(a.payment).some((p) => p === "iyzico" || p === "paytr" || p === "stripe"))
    compliance.push(t("Card payments: use the provider's hosted or iframe form so card data never touches your server.", "Kart ödemeleri: sağlayıcının kendi sayfasını ya da iframe formunu kullanın; kart verisi sunucunuza hiç gelmez."));

  // Store: where products live, payments, shipping
  let commerce: ProjectPlan["commerce"];
  const commerceTasks: PlanTask[] = [];
  if (type === "ecommerce") {
    const count = one(a.product_count);
    const catalog: Decision =
      count === "large"
        ? { value: "commerce-backend", reason: t("Over 1,000 products need stock, variants and orders managed in a commerce backend (Shopify Storefront API, Medusa or your ERP); the kit renders the store.", "1.000'den fazla ürün için stok, varyant ve siparişler bir e-ticaret altyapısında yönetilmeli (Shopify Storefront API, Medusa ya da ERP'niz); kit mağazayı gösterir.") }
        : count === "medium"
          ? { value: "headless-cms", reason: t("50 to 1,000 products: a headless CMS or a database with an admin panel, so prices and stock change without a deploy.", "50 – 1.000 ürün: fiyat ve stok yayın yapmadan değişsin diye başsız bir CMS ya da yönetim panelli bir veritabanı.") }
          : { value: "files", reason: t("Under 50 products: a JSON or CSV file in the project is enough to start.", "50'den az ürün: başlangıç için projedeki bir JSON ya da CSV dosyası yeterli.") };
    const payments = list(a.payment);
    commerce = { catalog, payments, shipping: one(a.shipping) || "yes", einvoice: one(a.einvoice) === "yes" };
    commerceTasks.push({ id: "catalog", agent: "build", status: "todo", title: t(`Product catalogue: ${catalog.value}.`, `Ürün kataloğu: ${catalog.value}.`), needs: [t("Product list (name, price, stock, photos), e.g. as CSV.", "Ürün listesi (ad, fiyat, stok, fotoğraf), örneğin CSV olarak.")] });
    const cardProviders = payments.filter((x) => x === "iyzico" || x === "paytr" || x === "stripe");
    if (cardProviders.length)
      commerceTasks.push({ id: "payments", agent: "build", status: "todo", title: t(`Card payments with ${cardProviders.join(", ")} (hosted / iframe form, sandbox first) and the payment callback.`, `${cardProviders.join(", ")} ile kart ödemesi (sağlayıcının formu, önce test ortamı) ve ödeme geri dönüşü.`), needs: [t(`${cardProviders.join(", ")} merchant account and API keys (sandbox and live).`, `${cardProviders.join(", ")} üye iş yeri hesabı ve API anahtarları (test ve canlı).`)] });
    if (payments.includes("bank-transfer")) commerceTasks.push({ id: "bank-transfer", agent: "content", status: "todo", title: t("Bank transfer instructions on the order confirmation.", "Sipariş onayında havale / EFT bilgileri."), needs: [t("Account holder, bank and IBAN.", "Hesap sahibi, banka ve IBAN.")] });
    if (payments.includes("cod")) commerceTasks.push({ id: "cod", agent: "build", status: "todo", title: t("Pay on delivery option and its fee.", "Kapıda ödeme seçeneği ve ücreti.") });
    if ((one(a.shipping) || "yes") === "yes") commerceTasks.push({ id: "shipping", agent: "build", status: "todo", title: t("Shipping options and prices in the cart and checkout.", "Sepet ve ödemede kargo seçenekleri ve ücretleri."), needs: [t("Cargo company, prices, free-shipping threshold, delivery time.", "Kargo firması, ücretler, ücretsiz kargo sınırı, teslim süresi.")] });
  }

  // Domain
  const name = one(a.business_name);
  const domainName = one(a.domain) === "yes" ? one(a.domain_name).replace(/^https?:\/\//, "").replace(/\/.*$/, "") || null : null;

  // Open questions (things the plan needs but nobody answered)
  const openQuestions: Text[] = [];
  if (!one(a.description)) openQuestions.push(t("One-sentence description of the business (for the hero and search results).", "İşletmenin tek cümlelik tanımı (ana başlık ve arama sonuçları için)."));
  if (!one(a.email) && !imported.site?.contact?.email) openQuestions.push(t("Email address for messages and the legal pages.", "Mesajlar ve yasal sayfalar için e-posta adresi."));
  if ((channels.includes("phone") || channels.includes("whatsapp")) && !one(a.phone) && !imported.site?.contact?.phone) openQuestions.push(t("Phone / WhatsApp number.", "Telefon / WhatsApp numarası."));
  if (one(a.domain) !== "yes") openQuestions.push(t("Domain name (ideas below).", "Alan adı (öneriler aşağıda)."));
  if (legal.length && one(a.legal_entity) === "company") openQuestions.push(t("Trade name, tax office and number, MERSIS (for the legal pages).", "Unvan, vergi dairesi ve numarası, MERSIS (yasal sayfalar için)."));

  // Tasks for the specialists
  const hasImport = !!(one(a.existing_site) || imported.site);
  const tasks: PlanTask[] = [
    { id: "brand", agent: "brand", status: "todo", title: hasImport ? t("Import logo, colours and fonts from the current site; confirm the accent.", "Mevcut siteden logo, renk ve yazı tiplerini al; vurgu rengini onaylat.") : t("Define the brand: logo, accent colour, fonts, tone of voice.", "Markayı tanımla: logo, vurgu rengi, yazı tipleri, dil tonu."), needs: hasImport ? [] : [t("Logo file (SVG or PNG).", "Logo dosyası (SVG ya da PNG).")] },
    { id: "content", agent: "content", status: "todo", title: t(`Write the texts for ${pages.length} ${pages.length === 1 ? "page" : "pages"} in ${languages.join(", ")}.`, `${pages.length} sayfanın metinlerini ${languages.join(", ")} ${languages.length === 1 ? "dilinde" : "dillerinde"} yaz.`), needs: hasImport ? [] : [t("Photos of the place, products or team (or approve placeholders).", "Mekân, ürün ya da ekip fotoğrafları (ya da yer tutucuları onaylayın).")] },
    { id: "build", agent: "build", status: "todo", title: t(`Create the app (${hosting.output === "static" ? "static export" : "Next.js"}), apply the brand and build the pages from the components listed.`, `Uygulamayı oluştur (${hosting.output === "static" ? "statik çıktı" : "Next.js"}), markayı uygula ve sayfaları listelenen bileşenlerle kur.`) },
    ...commerceTasks,
    { id: "legal", agent: "legal", status: "todo", title: t(`Fill ${legal.length} legal pages from vamos.site.json.`, `${legal.length} yasal sayfayı vamos.site.json'dan doldur.`), needs: one(a.legal_entity) === "company" ? [t("Trade name, tax number, MERSIS.", "Unvan, vergi numarası, MERSIS.")] : [] },
    { id: "seo", agent: "seo", status: "todo", title: t("Metadata, sitemap, robots, llms.txt and JSON-LD for every page.", "Her sayfa için metadata, sitemap, robots, llms.txt ve JSON-LD.") },
    ...(forms.value !== "none" ? [{ id: "forms", agent: "forms" as const, status: "todo" as const, title:
          forms.value === "whatsapp"
            ? t("Contact through WhatsApp: ContactDock with the business number, no form server.", "WhatsApp ile iletişim: işletme numarasıyla ContactDock, form sunucusu yok.")
            : t(`Contact form via ${forms.value}: run \`npx vamos-ui site form --kind ${forms.value}\` (sender + field list), then <ContactForm action=…> with the KVKK notice.`, `İletişim formu (${forms.value}): \`npx vamos-ui site form --kind ${forms.value}\` çalıştırın (gönderici + alan listesi), sonra KVKK bilgilendirmeli <ContactForm action=…>.`), needs: forms.env.length ? [t(`Values for ${forms.env.join(", ")}.`, `${forms.env.join(", ")} değerleri.`)] : [] }] : []),
    ...(tracking.length ? [{ id: "tracking", agent: "tracking" as const, status: "todo" as const, title: tracking.some((x) => x !== "gsc") ? t(`Consent and measurement: <ConsentDefaults /> in <head>, <ConsentBanner /> and <Analytics {...site.analytics} conversions={…} /> in the root layout (${tracking.join(", ")}).`, `Onay ve ölçüm: <head> içinde <ConsentDefaults />, kök layout'ta <ConsentBanner /> ve <Analytics {...site.analytics} conversions={…} /> (${tracking.join(", ")}).`) : t("Search Console verification and sitemap (no cookies, no banner needed).", "Search Console doğrulaması ve sitemap (çerez yok, onay bandı gerekmez)."), needs: tracking.includes("ga4") && !one(a.ga4_id) ? [t("GA4 measurement id.", "GA4 ölçüm kimliği.")] : [] }] : []),
    { id: "qa", agent: "qa", status: "todo", title: t("Run vamos-ui verify on the code and vamos-ui audit on the preview; fix what they find.", "Kodda vamos-ui verify, önizlemede vamos-ui audit çalıştır; bulunanları düzelt.") },
    { id: "deploy", agent: "deploy", status: "todo", title: t(`Publish on ${hosting.value}, connect the domain, HTTPS, then submit the sitemap.`, `${hosting.value} üzerinde yayınla, alan adını bağla, HTTPS, ardından sitemap gönder.`), needs: domainName ? [] : [t("A domain name.", "Bir alan adı.")] },
  ];
  for (const task of tasks) if (task.needs && task.needs.length === 0) delete task.needs;

  return {
    siteType: type,
    structure,
    languages,
    templates: TEMPLATES[type] ?? [],
    pages,
    legalPages: legal,
    hosting,
    forms,
    tracking: { tools: tracking, consentMode, steps },
    domain: { name: domainName, ideas: domainName ? [] : domainIdeas(name, tr) },
    ...(commerce ? { commerce } : {}),
    compliance,
    tasks,
    openQuestions,
  };
}

function dedupe<T>(items: T[]): T[] {
  return [...new Set(items)];
}

/** vamos.site.json values that follow from the answers (only fields the user gave). */
export function siteFromAnswers(a: Answers): Partial<SiteInfo> {
  const type = (one(a.site_type) || "local-business") as SiteType;
  const languages = list(a.languages);
  const localeOf = (l: string) => ({ tr: "tr-TR", en: "en-US", de: "de-DE", ar: "ar", fr: "fr-FR", es: "es-ES" })[l] ?? l;
  const out: Partial<SiteInfo> = {};
  if (one(a.business_name)) out.name = one(a.business_name);
  if (one(a.description)) out.description = one(a.description);
  if (one(a.domain) === "yes" && one(a.domain_name)) out.url = `https://${one(a.domain_name).replace(/^https?:\/\//, "").replace(/\/.*$/, "")}`;
  if (languages.length) {
    out.locale = localeOf(languages[0]!);
    if (languages.length > 1) out.locales = languages.map(localeOf);
  }
  out.type = SCHEMA_TYPES[type];
  const contact: NonNullable<SiteInfo["contact"]> = {};
  if (one(a.phone)) contact.phone = one(a.phone);
  if (one(a.phone) && list(a.contact_channels).includes("whatsapp")) contact.whatsapp = one(a.phone);
  if (one(a.email)) contact.email = one(a.email);
  if (Object.keys(contact).length) out.contact = contact;
  if (one(a.address)) out.address = { street: one(a.address) };
  if (one(a.ga4_id)) out.analytics = { ga4: one(a.ga4_id).toUpperCase() };
  return out;
}
