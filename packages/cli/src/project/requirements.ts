/**
 * Requirement packs: what a site of each type must have before launch, owned by one specialist
 * and, where a tool can tell, the command that checks it. The plan carries them; every task brief
 * lists its own, and QA walks the whole list before deploy. Pure and deterministic.
 */

import type { SiteType, Text } from "./questions";

/** Specialist roles (kept here so requirements, plan and process share one list). */
export const AGENTS = ["brand", "content", "build", "legal", "seo", "tracking", "forms", "qa", "deploy"] as const;
export type Agent = (typeof AGENTS)[number];

export interface Requirement {
  id: string;
  agent: Agent;
  text: Text;
  /** A command that checks it, when one exists. */
  check?: string;
}

export interface RequirementContext {
  siteType: SiteType;
  tr: boolean;
  forms: boolean;
  tracking: boolean;
  /** Analytics / ads tools that set cookies (anything but Search Console). */
  cookies: boolean;
  multilingual: boolean;
  company: boolean;
}

const t = (en: string, tr: string): Text => ({ en, tr });
const r = (id: string, agent: Agent, text: Text, check?: string): Requirement => ({ id, agent, text, ...(check ? { check } : {}) });

const VERIFY = "npx vamos-ui verify";
const AUDIT = "npx vamos-ui audit <preview-url>";

function base(c: RequirementContext): Requirement[] {
  const out: Requirement[] = [
    r("brand-tokens", "brand", t("The accent and fonts come from vamos.brand.json / theme tokens; no colour literals in the code.", "Vurgu rengi ve yazı tipleri vamos.brand.json / tema token'larından gelir; kodda renk değeri yazılmaz."), VERIFY),
    r("brand-contrast", "brand", t("Text on the accent and on every surface passes WCAG AA contrast in light and dark.", "Vurgu rengi ve tüm yüzeylerdeki metin açık ve koyu temada WCAG AA kontrastını geçer."), "npx vamos-ui brand check"),
    r("content-real", "content", t("Every text, phone, email, address and price is the business's own; no lorem ipsum, placeholders or invented facts.", "Tüm metin, telefon, e-posta, adres ve fiyatlar işletmenin kendisinden gelir; lorem ipsum, yer tutucu ya da uydurma bilgi yok."), VERIFY),
    r("content-alt", "content", t("Every content image has a descriptive alt text (alt=\"\" only for decoration).", "Her içerik görselinin açıklayıcı bir alt metni var (alt=\"\" yalnızca süs görsellerinde)."), VERIFY),
    r("content-cta", "content", t("Every page ends in one clear next step (call, message, book, buy).", "Her sayfa tek ve net bir sonraki adımla biter (ara, yaz, randevu al, satın al)."), undefined),
    r("build-kit", "build", t("Pages are built from the planned kit blocks and components; no hand-rolled dialogs, menus, tables or forms.", "Sayfalar planlanan kit blokları ve bileşenleriyle kurulur; elle yazılmış modal, menü, tablo ya da form yok."), VERIFY),
    r("build-mobile", "build", t("No horizontal scroll at 360 px; tap targets at least 44 px; the menu works with the keyboard.", "360 px genişlikte yatay kaydırma yok; dokunma alanları en az 44 px; menü klavyeyle çalışır."), AUDIT),
    r("build-images", "build", t("Images are WebP/AVIF or optimised JPEG, under 300 KB, with width and height set.", "Görseller WebP/AVIF ya da sıkıştırılmış JPEG, 300 KB altında, genişlik ve yükseklik belirtilmiş."), VERIFY),
    r("build-404", "build", t("A designed 404 page that links back to the main pages.", "Ana sayfalara dönüş bağlantısı olan tasarlanmış bir 404 sayfası."), undefined),
    r("seo-meta", "seo", t("One H1 per page, a title under 60 characters, a 120–160 character description, a canonical URL and Open Graph image.", "Her sayfada tek H1, 60 karakter altında başlık, 120–160 karakter açıklama, canonical adres ve Open Graph görseli."), VERIFY),
    r("seo-files", "seo", t("robots.txt, sitemap.xml, llms.txt and JSON-LD for the business are generated from vamos.site.json.", "robots.txt, sitemap.xml, llms.txt ve işletmenin JSON-LD'si vamos.site.json'dan üretilir."), "npx vamos-ui site essentials --dry-run"),
    r("seo-links", "seo", t("Every internal link has a page (no 404s); old URLs of a current site redirect to their new pages.", "Her iç bağlantının bir sayfası var (404 yok); mevcut sitenin eski adresleri yeni sayfalara yönlenir."), VERIFY),
    r("legal-pages", "legal", t("The legal pages in the plan exist, are filled from vamos.site.json and are linked in the footer.", "Plandaki yasal sayfalar var, vamos.site.json'dan doldurulmuş ve footer'da bağlantılı."), VERIFY),
    r("legal-review", "legal", t("The business (or its lawyer) has read and approved the legal texts; they are templates until then.", "İşletme (ya da avukatı) yasal metinleri okuyup onayladı; o zamana kadar bunlar şablondur."), undefined),
    r("qa-verify", "qa", t("vamos-ui verify passes with no errors.", "vamos-ui verify hatasız geçer."), VERIFY),
    r("qa-audit", "qa", t("vamos-ui audit on the preview scores 90 or more, with no errors.", "Önizlemede vamos-ui audit 90 ve üzeri puan verir, hata yok."), AUDIT),
    r("deploy-https", "deploy", t("http:// and the other host name (www or bare) redirect with 301 to one HTTPS address.", "http:// ve diğer alan adı biçimi (www ya da çıplak) 301 ile tek bir HTTPS adresine yönlenir."), "npx vamos-ui audit <live-url>"),
    r("deploy-headers", "deploy", t("Security headers are sent: HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy.", "Güvenlik başlıkları gönderilir: HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy."), "npx vamos-ui audit <live-url>"),
    r("deploy-search", "deploy", t("The domain is verified in Google Search Console and the sitemap is submitted.", "Alan adı Google Search Console'da doğrulandı ve sitemap gönderildi."), undefined),
  ];
  if (c.forms)
    out.push(
      r("forms-delivery", "forms", t("A test message from the live site arrives in the business inbox (not spam) with Reply-To set to the visitor.", "Canlı siteden gönderilen deneme mesajı işletmenin gelen kutusuna (spam'e değil) ulaşır, Yanıtla adresi ziyaretçidir."), undefined),
      r("forms-spam", "forms", t("The honeypot, minimum fill time and rate limit are on; a bot-style submit is dropped silently.", "Bal küpü alanı, en kısa doldurma süresi ve hız sınırı açık; bot gibi gönderim sessizce düşer."), undefined),
      r("forms-notice", "legal", c.tr ? t("The KVKK notice is linked next to the form; marketing consent is a separate, unticked box.", "Formun yanında KVKK aydınlatma metni bağlantısı var; pazarlama izni ayrı ve işaretsiz bir kutu.") : t("The privacy notice is linked next to the form; marketing consent is a separate, unticked box.", "Formun yanında gizlilik bildirimi bağlantısı var; pazarlama izni ayrı ve işaretsiz bir kutu."), undefined),
    );
  if (c.tracking)
    out.push(
      r("tracking-consent", "tracking", c.cookies ? t("No analytics or ads tag loads before consent; ConsentDefaults is in <head> and the banner offers Reject as clearly as Accept.", "Onaydan önce hiçbir analiz ya da reklam etiketi yüklenmez; ConsentDefaults <head> içinde, bantta Reddet en az Kabul et kadar görünür.") : t("Search Console only: no cookies, so no consent banner.", "Yalnızca Search Console: çerez yok, onay bandı gerekmez."), VERIFY),
      ...(c.cookies
        ? [
            r("tracking-events", "tracking", t("Calls, WhatsApp, email, directions, bookings and form leads arrive as events (checked in GA4 DebugView / Tag Assistant).", "Arama, WhatsApp, e-posta, yol tarifi, randevu ve form talepleri olay olarak gelir (GA4 DebugView / Tag Assistant ile kontrol edildi)."), undefined),
            r("tracking-conversion", "tracking", t("The lead event is marked as a key event in GA4 and, with Google Ads, imported as a conversion.", "Talep olayı GA4'te önemli etkinlik olarak işaretli; Google Ads varsa dönüşüm olarak içe aktarıldı."), undefined),
            r("tracking-policy", "legal", t("The cookie policy lists every tool that sets cookies and links the consent settings.", "Çerez politikası çerez yazan her aracı listeler ve onay ayarlarına bağlantı verir."), undefined),
          ]
        : []),
    );
  if (c.multilingual)
    out.push(
      r("seo-hreflang", "seo", t("Each language version has its own URL with hreflang alternates and an x-default.", "Her dil sürümünün kendi adresi, hreflang alternatifleri ve x-default'u var."), AUDIT),
      r("content-languages", "content", t("Every language is a real translation reviewed by a speaker, not a machine draft left as is.", "Her dil, bir konuşucunun gözden geçirdiği gerçek bir çeviri; olduğu gibi bırakılmış makine taslağı değil."), undefined),
    );
  if (c.company && c.tr) out.push(r("legal-company", "legal", t("Trade name, tax office and number and MERSIS number appear in the footer or the legal notice.", "Unvan, vergi dairesi ve numarası ile MERSİS numarası footer'da ya da yasal uyarıda yer alır."), VERIFY));
  return out;
}

const PACKS: Record<SiteType, (c: RequirementContext) => Requirement[]> = {
  "local-business": () => [
    r("local-nap", "content", t("Name, address and phone are written exactly as on the Google Business Profile, on every page that shows them.", "Ad, adres ve telefon, gösterildiği her sayfada Google İşletme Profili'ndekiyle birebir aynı."), undefined),
    r("local-hours", "content", t("Opening hours (and holiday hours) are in vamos.site.json and shown with an open-now status.", "Çalışma saatleri (ve tatil saatleri) vamos.site.json'da ve açık/kapalı durumuyla gösteriliyor."), undefined),
    r("local-map", "build", t("A map with a directions link, and click-to-call / WhatsApp on mobile.", "Yol tarifi bağlantılı harita; mobilde tıkla-ara / WhatsApp."), undefined),
    r("local-schema", "seo", t("LocalBusiness JSON-LD with address, geo, opening hours and the profile link (sameAs).", "Adres, konum, çalışma saatleri ve profil bağlantısı (sameAs) içeren LocalBusiness JSON-LD."), VERIFY),
    r("local-profile", "deploy", t("The Google Business Profile website link points to the new site.", "Google İşletme Profili'ndeki web sitesi bağlantısı yeni siteyi gösteriyor."), undefined),
  ],
  corporate: (c) => [
    r("corp-services", "content", t("Each service has its own section or page: who it is for, what is included, the result.", "Her hizmetin kendi bölümü ya da sayfası var: kimin için, neler dahil, sonuç ne."), undefined),
    r("corp-proof", "content", t("Proof: references, case studies, certificates or client logos the business is allowed to show.", "Kanıt: işletmenin göstermeye izni olan referanslar, örnek çalışmalar, sertifikalar ya da müşteri logoları."), undefined),
    r("corp-schema", "seo", t("Organization / ProfessionalService JSON-LD with logo, contact point and sameAs profiles.", "Logo, iletişim noktası ve sameAs profilleri içeren Organization / ProfessionalService JSON-LD."), VERIFY),
    ...(c.tr ? [r("corp-kep", "legal", t("The KEP address is shown if the company has one.", "Şirketin KEP adresi varsa gösteriliyor."), undefined)] : []),
  ],
  ecommerce: (c) => [
    r("shop-product-schema", "seo", t("Product JSON-LD with price, currency, availability and reviews on every product page.", "Her ürün sayfasında fiyat, para birimi, stok durumu ve yorumlarla Product JSON-LD."), VERIFY),
    r("shop-price", "content", c.tr ? t("Prices include VAT and say so; shipping cost and delivery time are on the product page.", "Fiyatlar KDV dahil ve bu yazıyor; kargo ücreti ve teslim süresi ürün sayfasında.") : t("Prices show tax as required; shipping cost and delivery time are on the product page.", "Fiyatlar gerektiği gibi vergiyi gösterir; kargo ücreti ve teslim süresi ürün sayfasında."), undefined),
    r("shop-checkout-legal", "legal", t("Checkout shows the pre-contract information and the distance sales agreement and needs an explicit tick before paying.", "Ödeme adımı ön bilgilendirme formunu ve mesafeli satış sözleşmesini gösterir, ödemeden önce açık onay ister."), undefined),
    r("shop-returns", "legal", t("The returns page states the 14-day right of withdrawal and how to use it.", "İade sayfası 14 günlük cayma hakkını ve nasıl kullanılacağını anlatır."), undefined),
    ...(c.tr ? [r("shop-etbis", "legal", t("ETBİS registration and MERSIS number are in the footer.", "ETBİS kaydı ve MERSİS numarası footer'da."), VERIFY)] : []),
    r("shop-payment-test", "build", t("A full order with the payment provider's test card succeeds, the callback is verified on the server, and a failed payment shows a clear error.", "Ödeme sağlayıcının test kartıyla tam bir sipariş başarılı olur, geri dönüş sunucuda doğrulanır, başarısız ödeme net bir hata gösterir."), undefined),
    r("shop-emails", "build", t("Order confirmation and shipping emails reach the customer, with the order and the seller's details.", "Sipariş onayı ve kargo e-postaları müşteriye, sipariş ve satıcı bilgileriyle ulaşır."), undefined),
    r("shop-tracking", "tracking", t("view_item, add_to_cart, begin_checkout and purchase (with value and currency) are measured.", "view_item, add_to_cart, begin_checkout ve purchase (tutar ve para birimiyle) ölçülür."), undefined),
  ],
  booking: (c) => [
    r("book-flow", "build", t("Booking takes three steps or fewer on mobile and confirms the date, time and place.", "Randevu mobilde en fazla üç adımda biter; tarih, saat ve yeri teyit eder."), undefined),
    r("book-policy", "content", t("Cancellation and no-show rules are stated before the visitor confirms.", "İptal ve gelmeme kuralları ziyaretçi onaylamadan önce yazıyor."), undefined),
    r("book-confirm", "build", t("The visitor gets a confirmation (email, SMS or WhatsApp) and the business is notified.", "Ziyaretçi bir onay alır (e-posta, SMS ya da WhatsApp), işletmeye bildirim gider."), undefined),
    r(
      "book-sensitive",
      "legal",
      c.tr
        ? t("If health or other special-category data is asked, it is kept to the minimum and asked with a separate explicit consent (KVKK art. 6).", "Sağlık ya da başka özel nitelikli veri soruluyorsa en azda tutulur ve ayrı açık rızayla istenir (KVKK md. 6).")
        : t("If health or other special-category data is asked, it is kept to the minimum and asked with a separate explicit consent.", "Sağlık ya da başka özel nitelikli veri soruluyorsa en azda tutulur ve ayrı açık rızayla istenir."),
      undefined,
    ),
    r("book-tracking", "tracking", t("Booking clicks and completed bookings are separate events; the completed one is the conversion.", "Randevu tıklaması ve tamamlanan randevu ayrı olaylar; dönüşüm tamamlanan randevudur."), undefined),
  ],
  portfolio: () => [
    r("folio-work", "content", t("Each project shows the brief, the role and the result, with the client's permission.", "Her proje, müşterinin izniyle, isteği, üstlenilen rolü ve sonucu gösterir."), undefined),
    r("folio-images", "build", t("Gallery images are responsive (srcset) and lazy below the first screen.", "Galeri görselleri duyarlı (srcset) ve ilk ekranın altında geç yüklenir."), VERIFY),
    r("folio-schema", "seo", t("Person (or Organization) JSON-LD with sameAs profiles.", "sameAs profilleriyle Person (ya da Organization) JSON-LD."), VERIFY),
  ],
  blog: () => [
    r("blog-article", "seo", t("Article JSON-LD with author, published and modified dates on every post.", "Her yazıda yazar, yayın ve güncelleme tarihleriyle Article JSON-LD."), VERIFY),
    r("blog-author", "content", t("Author pages with a short bio; dates are visible on posts.", "Kısa biyografili yazar sayfaları; yazılarda tarih görünür."), undefined),
    r("blog-feed", "build", t("An RSS feed, categories and pagination that keep their URLs.", "RSS akışı, kategoriler ve adresleri sabit kalan sayfalama."), undefined),
    r("blog-links", "seo", t("Each post links to two or more related posts or service pages.", "Her yazı en az iki ilgili yazıya ya da hizmet sayfasına bağlantı verir."), undefined),
  ],
  saas: () => [
    r("saas-pricing", "content", t("Pricing says what each plan includes, the currency, VAT and how to cancel.", "Fiyatlandırma her planın içeriğini, para birimini, KDV'yi ve iptal yolunu söyler."), undefined),
    r("saas-schema", "seo", t("SoftwareApplication (or Product) JSON-LD with offers.", "Teklifleriyle SoftwareApplication (ya da Product) JSON-LD."), VERIFY),
    r("saas-terms", "legal", t("Terms of use, privacy policy and, for business customers, a data processing note.", "Kullanım koşulları, gizlilik politikası ve kurumsal müşteriler için veri işleme notu."), undefined),
    r("saas-signup", "tracking", t("Sign-up and trial start are events; the app's own analytics is not loaded on the marketing site without consent.", "Kayıt ve deneme başlangıcı olay olarak ölçülür; uygulamanın kendi analitiği pazarlama sitesinde onaysız yüklenmez."), undefined),
  ],
  nonprofit: (c) => [
    r("npo-donate", "content", t("A donation path from every page, with bank details or the payment provider.", "Her sayfadan bağış yolu; banka bilgileri ya da ödeme sağlayıcısıyla."), undefined),
    r("npo-transparency", "content", t("Registration details and annual activity or financial reports are published.", "Kayıt bilgileri ve yıllık faaliyet ya da mali raporlar yayında."), undefined),
    r("npo-schema", "seo", t("NGO JSON-LD with the registration number and sameAs profiles.", "Kayıt numarası ve sameAs profilleriyle NGO JSON-LD."), VERIFY),
    ...(c.tr ? [r("npo-permit", "legal", t("Online donation collection follows the association's legal permission (Yardım Toplama Kanunu); the permit or exemption is stated.", "Çevrimiçi bağış toplama derneğin yasal iznine uygun (Yardım Toplama Kanunu); izin ya da muafiyet belirtilir."), undefined)] : []),
  ],
  event: () => [
    r("event-schema", "seo", t("Event JSON-LD with start and end time (with time zone), place and offers.", "Başlangıç ve bitiş saati (saat dilimiyle), yer ve tekliflerle Event JSON-LD."), VERIFY),
    r("event-details", "content", t("Date, time, venue, map, tickets and an add-to-calendar link are on the first screen.", "Tarih, saat, mekân, harita, bilet ve takvime ekle bağlantısı ilk ekranda."), undefined),
    r("event-after", "content", t("After the event the page says so (recap, next date) instead of selling an ended event.", "Etkinlikten sonra sayfa bunu söyler (özet, sonraki tarih); bitmiş etkinliği satmaya devam etmez."), undefined),
  ],
};

/** The requirement pack for a site: the shared baseline plus the site type's own items. */
export function requirementsFor(c: RequirementContext): Requirement[] {
  const all = [...base(c), ...(PACKS[c.siteType]?.(c) ?? [])];
  const order = new Map(AGENTS.map((a, i) => [a, i]));
  return all.sort((a, b) => order.get(a.agent)! - order.get(b.agent)!);
}

/**
 * Which tasks must be done before a task can start. Brand and content run in parallel; the
 * build waits for the brand; everything that edits the app waits for the build; QA waits for
 * all of them and deploy waits for QA.
 */
export function taskDependencies(ids: string[]): Record<string, string[]> {
  const has = (id: string) => ids.includes(id);
  const deps: Record<string, string[]> = {};
  const specialists = ids.filter((id) => id !== "qa" && id !== "deploy");
  for (const id of ids) {
    let after: string[];
    if (id === "brand" || id === "content") after = [];
    else if (id === "build") after = ["brand"];
    else if (id === "bank-transfer") after = ["content"];
    else if (id === "seo") after = ["build", "content"];
    else if (id === "qa") after = specialists;
    else if (id === "deploy") after = ["qa"];
    else after = ["build"];
    deps[id] = after.filter(has);
  }
  return deps;
}
