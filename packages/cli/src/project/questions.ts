/**
 * The project interview: what an assistant (or `vamos-ui new`) asks before building a website.
 * Pure data + a function that picks the next questions from the answers so far, so the CLI,
 * the MCP server and any agent ask the same things in the same order.
 */

export type Lang = "en" | "tr";
export type Text = Record<Lang, string>;

export type QuestionKind = "single" | "multi" | "text" | "url" | "email" | "phone";

export interface QuestionOption {
  value: string;
  label: Text;
  hint?: Text;
}

export interface Question {
  id: string;
  kind: QuestionKind;
  /** The question as asked. */
  text: Text;
  /** Why it matters, shown under the question. */
  why?: Text;
  options?: QuestionOption[];
  /** Asked only when this returns true for the answers so far. */
  when?: (a: Answers) => boolean;
  /** Can be skipped ("I don't know yet"); the plan then records an open question. */
  optional?: boolean;
  /** Group heading for interfaces that show several questions at once. */
  group: "business" | "domain" | "site" | "commerce" | "contact" | "tracking" | "legal";
}

export type Answers = Record<string, string | string[] | undefined>;

const o = (value: string, en: string, tr: string, hint?: [string, string]): QuestionOption => ({
  value,
  label: { en, tr },
  ...(hint ? { hint: { en: hint[0], tr: hint[1] } } : {}),
});

const is = (a: Answers, id: string, ...values: string[]) => values.includes(String(a[id] ?? ""));
const has = (a: Answers, id: string, value: string) => {
  const v = a[id];
  return Array.isArray(v) ? v.includes(value) : v === value;
};

export const SITE_TYPES = ["local-business", "corporate", "ecommerce", "booking", "portfolio", "blog", "saas", "nonprofit", "event"] as const;
export type SiteType = (typeof SITE_TYPES)[number];

export const QUESTIONS: Question[] = [
  {
    id: "business_name",
    group: "business",
    kind: "text",
    text: { en: "What is the business or project called?", tr: "İşletmenin ya da projenin adı ne?" },
  },
  {
    id: "site_type",
    group: "business",
    kind: "single",
    text: { en: "What kind of website is it?", tr: "Nasıl bir web sitesi?" },
    why: { en: "Decides the pages, legal texts and integrations it needs.", tr: "Gereken sayfaları, yasal metinleri ve entegrasyonları belirler." },
    options: [
      o("local-business", "Local business (shop, workshop, practice)", "Yerel işletme (dükkân, atölye, muayenehane)"),
      o("corporate", "Company / professional services", "Kurumsal / profesyonel hizmet"),
      o("ecommerce", "Online store", "E-ticaret (online satış)"),
      o("booking", "Appointments or reservations", "Randevu ya da rezervasyon"),
      o("portfolio", "Portfolio or personal site", "Portfolyo ya da kişisel site"),
      o("blog", "Blog or publication", "Blog ya da yayın"),
      o("saas", "Software / app product", "Yazılım / uygulama ürünü"),
      o("nonprofit", "Association or non-profit", "Dernek ya da vakıf"),
      o("event", "Event or conference", "Etkinlik ya da konferans"),
    ],
  },
  {
    id: "description",
    group: "business",
    kind: "text",
    optional: true,
    text: { en: "In one sentence: what do you offer, to whom, where?", tr: "Tek cümleyle: ne sunuyorsunuz, kime, nerede?" },
    why: { en: "Becomes the meta description, the hero text and llms.txt.", tr: "Meta açıklama, ana başlık metni ve llms.txt buradan çıkar." },
  },
  {
    id: "languages",
    group: "business",
    kind: "multi",
    text: { en: "Which languages should the site have?", tr: "Site hangi dillerde olsun?" },
    options: [o("tr", "Turkish", "Türkçe"), o("en", "English", "İngilizce"), o("de", "German", "Almanca"), o("ar", "Arabic", "Arapça"), o("fr", "French", "Fransızca"), o("es", "Spanish", "İspanyolca")],
  },
  {
    id: "existing_site",
    group: "domain",
    kind: "url",
    optional: true,
    text: { en: "Is there a current website? Paste its address, or leave empty.", tr: "Şu an bir web sitesi var mı? Adresini yapıştırın ya da boş bırakın." },
    why: {
      en: "Logo, colours, fonts, texts, contact details and images can be taken from it (you confirm each one).",
      tr: "Logo, renkler, yazı tipleri, metinler, iletişim bilgileri ve görseller oradan alınabilir (her birini siz onaylarsınız).",
    },
  },
  {
    id: "domain",
    group: "domain",
    kind: "single",
    text: { en: "Do you have a domain name?", tr: "Alan adınız var mı?" },
    options: [o("yes", "Yes", "Var"), o("no", "Not yet, suggest some", "Henüz yok, öneri istiyorum"), o("later", "Decide later", "Sonra karar vereceğim")],
  },
  {
    id: "domain_name",
    group: "domain",
    kind: "text",
    when: (a) => is(a, "domain", "yes"),
    text: { en: "Which domain? (e.g. example.com.tr)", tr: "Hangi alan adı? (örn. ornekfirma.com.tr)" },
  },
  {
    id: "hosting",
    group: "domain",
    kind: "single",
    text: { en: "Where will the site run?", tr: "Site nerede yayınlanacak?" },
    why: { en: "Decides static or server build, and how forms send email.", tr: "Statik mi sunuculu mu derleneceğini ve formların nasıl e-posta göndereceğini belirler." },
    options: [
      o("vercel", "Vercel", "Vercel"),
      o("netlify", "Netlify", "Netlify"),
      o("cloudflare", "Cloudflare Pages", "Cloudflare Pages"),
      o("cpanel", "Shared hosting (cPanel / Plesk)", "Paylaşımlı hosting (cPanel / Plesk)"),
      o("vps", "Own server (VPS)", "Kendi sunucum (VPS)"),
      o("unsure", "Not sure, recommend one", "Bilmiyorum, öneri istiyorum"),
    ],
  },
  {
    id: "structure",
    group: "site",
    kind: "single",
    text: { en: "One long page or several pages?", tr: "Tek sayfa mı, çok sayfalı mı?" },
    options: [
      o("single", "One page", "Tek sayfa", ["Fast to launch; fine for a few sections.", "Hızlı yayına çıkar; birkaç bölüm için yeterli."]),
      o("multi", "Several pages", "Çok sayfalı", ["Better for SEO and for many services or products.", "SEO ve çok sayıda hizmet ya da ürün için daha iyi."]),
      o("recommend", "Recommend for me", "Siz önerin"),
    ],
  },
  {
    id: "sections",
    group: "site",
    kind: "multi",
    text: { en: "What should the site show?", tr: "Sitede neler olsun?" },
    options: [
      o("services", "Services or products", "Hizmetler ya da ürünler"),
      o("about", "About us", "Hakkımızda"),
      o("team", "Team", "Ekip"),
      o("gallery", "Gallery / work", "Galeri / işler"),
      o("testimonials", "Customer reviews", "Müşteri yorumları"),
      o("pricing", "Prices or packages", "Fiyatlar ya da paketler"),
      o("faq", "Frequently asked questions", "Sık sorulan sorular"),
      o("blog", "Blog / news", "Blog / haberler"),
      o("location", "Map and opening hours", "Harita ve çalışma saatleri"),
      o("careers", "Careers", "Kariyer"),
    ],
  },
  {
    id: "product_count",
    group: "commerce",
    kind: "single",
    when: (a) => is(a, "site_type", "ecommerce"),
    text: { en: "Roughly how many products?", tr: "Yaklaşık kaç ürün?" },
    options: [o("small", "Under 50", "50'den az"), o("medium", "50 to 1,000", "50 – 1.000"), o("large", "More than 1,000", "1.000'den fazla")],
  },
  {
    id: "payment",
    group: "commerce",
    kind: "multi",
    when: (a) => is(a, "site_type", "ecommerce"),
    text: { en: "How will customers pay?", tr: "Müşteriler nasıl ödeyecek?" },
    options: [
      o("iyzico", "iyzico", "iyzico"),
      o("paytr", "PayTR", "PayTR"),
      o("stripe", "Stripe", "Stripe"),
      o("bank-transfer", "Bank transfer", "Havale / EFT"),
      o("cod", "Pay on delivery", "Kapıda ödeme"),
    ],
  },
  {
    id: "shipping",
    group: "commerce",
    kind: "single",
    when: (a) => is(a, "site_type", "ecommerce"),
    text: { en: "Are products shipped?", tr: "Ürünler kargoyla mı gönderiliyor?" },
    options: [o("yes", "Yes, by cargo", "Evet, kargo ile"), o("digital", "Digital products only", "Sadece dijital ürün"), o("pickup", "Pickup only", "Sadece mağazadan teslim")],
  },
  {
    id: "einvoice",
    group: "commerce",
    kind: "single",
    when: (a) => is(a, "site_type", "ecommerce") && wantsTurkish(a),
    text: { en: "Do you issue e-Archive invoices (e-Arşiv)?", tr: "e-Arşiv fatura kesiyor musunuz?" },
    options: [o("yes", "Yes", "Evet"), o("no", "No / not yet", "Hayır / henüz değil")],
  },
  {
    id: "booking_tool",
    group: "commerce",
    kind: "single",
    when: (a) => is(a, "site_type", "booking"),
    text: { en: "How should bookings work?", tr: "Randevular nasıl alınsın?" },
    options: [
      o("form", "A request form; we confirm by phone or email", "Talep formu; biz telefon ya da e-postayla onaylarız"),
      o("whatsapp", "Through WhatsApp", "WhatsApp üzerinden"),
      o("calendar", "Live calendar with available slots", "Boş saatleri gösteren canlı takvim"),
      o("existing", "We already use a booking service", "Zaten bir randevu servisi kullanıyoruz"),
    ],
  },
  {
    id: "contact_channels",
    group: "contact",
    kind: "multi",
    text: { en: "How should visitors reach you?", tr: "Ziyaretçiler size nasıl ulaşsın?" },
    options: [o("form", "Contact form", "İletişim formu"), o("whatsapp", "WhatsApp", "WhatsApp"), o("phone", "Phone call", "Telefon"), o("email", "Email link", "E-posta bağlantısı"), o("map", "Directions / map", "Yol tarifi / harita")],
  },
  {
    id: "form_delivery",
    group: "contact",
    kind: "single",
    when: (a) => has(a, "contact_channels", "form") || is(a, "booking_tool", "form"),
    text: { en: "Where should form messages go?", tr: "Form mesajları nereye gitsin?" },
    why: { en: "Messages go to your own inbox; nothing is stored by Vamos UI.", tr: "Mesajlar kendi gelen kutunuza gider; Vamos UI hiçbir şey saklamaz." },
    options: [
      o("smtp", "My email account (SMTP)", "Kendi e-posta hesabım (SMTP)", ["Works with any mail provider.", "Her e-posta sağlayıcısıyla çalışır."]),
      o("resend", "An email service (Resend)", "Bir e-posta servisi (Resend)", ["Simple setup, free tier.", "Kolay kurulum, ücretsiz katmanı var."]),
      o("whatsapp", "Open WhatsApp with the message", "Mesajı WhatsApp'ta açsın"),
      o("recommend", "Recommend for my hosting", "Hostinge göre siz önerin"),
    ],
  },
  { id: "phone", group: "contact", kind: "phone", optional: true, when: (a) => has(a, "contact_channels", "phone") || has(a, "contact_channels", "whatsapp"), text: { en: "Phone number to show (and WhatsApp, if different say so)", tr: "Sitede görünecek telefon (WhatsApp farklıysa belirtin)" } },
  { id: "email", group: "contact", kind: "email", optional: true, text: { en: "Email address for messages and the legal pages", tr: "Mesajlar ve yasal sayfalar için e-posta adresi" } },
  { id: "address", group: "contact", kind: "text", optional: true, when: (a) => has(a, "contact_channels", "map") || is(a, "site_type", "local-business", "booking"), text: { en: "Address customers come to", tr: "Müşterilerin geldiği adres" } },
  {
    id: "tracking",
    group: "tracking",
    kind: "multi",
    text: { en: "Which measurement tools should be set up?", tr: "Hangi ölçüm araçları kurulsun?" },
    why: { en: "All of them load only after cookie consent (Consent Mode v2).", tr: "Hepsi çerez onayından sonra yüklenir (Consent Mode v2)." },
    options: [
      o("gsc", "Google Search Console", "Google Search Console"),
      o("ga4", "Google Analytics 4", "Google Analytics 4"),
      o("google-ads", "Google Ads conversions", "Google Ads dönüşümleri"),
      o("meta", "Meta (Facebook / Instagram) pixel", "Meta (Facebook / Instagram) pikseli"),
      o("none", "None for now", "Şimdilik hiçbiri"),
    ],
  },
  {
    id: "ga4_id",
    group: "tracking",
    kind: "text",
    optional: true,
    when: (a) => has(a, "tracking", "ga4"),
    text: { en: "GA4 measurement id, if you have one (G-XXXXXXX)", tr: "Varsa GA4 ölçüm kimliği (G-XXXXXXX)" },
  },
  {
    id: "legal_entity",
    group: "legal",
    kind: "single",
    text: { en: "Who runs the site legally?", tr: "Siteyi yasal olarak kim işletiyor?" },
    why: { en: "Decides the data controller in the privacy texts.", tr: "Gizlilik metinlerindeki veri sorumlusunu belirler." },
    options: [o("company", "A company", "Şirket"), o("sole", "Sole proprietor", "Şahıs işletmesi"), o("person", "A private person", "Gerçek kişi (şahsi site)"), o("association", "Association / foundation", "Dernek / vakıf")],
  },
];

export function wantsTurkish(a: Answers): boolean {
  const langs = a.languages;
  return Array.isArray(langs) ? langs.includes("tr") : langs === "tr";
}

export const questionById = (id: string) => QUESTIONS.find((q) => q.id === id);

/** True when the question has an answer, including an explicit skip (""). */
export const answered = (a: Answers, id: string) => a[id] !== undefined;

/** Questions that apply to these answers and are not answered yet, in interview order. */
export function nextQuestions(a: Answers, limit = Infinity): Question[] {
  return QUESTIONS.filter((q) => (!q.when || q.when(a)) && !answered(a, q.id)).slice(0, limit);
}

export interface AnswerProblem {
  id: string;
  problem: string;
}

/** Checks answers against the questions: known ids, option values, formats. */
export function validateAnswers(a: Answers): AnswerProblem[] {
  const problems: AnswerProblem[] = [];
  for (const [id, value] of Object.entries(a)) {
    const q = questionById(id);
    if (!q) {
      problems.push({ id, problem: "unknown question id" });
      continue;
    }
    if (value === undefined || value === "") continue;
    const values = Array.isArray(value) ? value : [value];
    if (q.kind === "single" && Array.isArray(value)) problems.push({ id, problem: "expects one value" });
    if ((q.kind === "single" || q.kind === "multi") && q.options) {
      for (const v of values) if (!q.options.some((op) => op.value === v)) problems.push({ id, problem: `"${v}" is not one of ${q.options.map((op) => op.value).join(", ")}` });
    }
    if (q.kind === "url" && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(String(value)) && !/^[^\s/]+\.[^\s]+$/.test(String(value))) problems.push({ id, problem: "not a web address" });
    if (q.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) problems.push({ id, problem: "not an email address" });
    if (id === "ga4_id" && !/^G-[A-Z0-9]{4,}$/i.test(String(value))) problems.push({ id, problem: "GA4 ids look like G-XXXXXXX" });
  }
  return problems;
}
