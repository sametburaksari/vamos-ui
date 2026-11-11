// Sample content for "Gridwork Templates", a fictional shop for website and dashboard templates.
// Every human-readable field is `Localized` ({ en, tr }). Prices are USD. The template previews
// are real kit components rendered live, so there are no screenshots to keep in sync.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

export const ACCENT = "#059669";
export const PHONE = "+902160000000";
export const EMAIL = "hello@gridwork.example.com";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-US";
  const f = createFormatter(intl, { currency: "USD", timeZone: "Europe/Istanbul" });
  const usd = (v: number) => f.currency(v.toFixed(2), "USD", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  return {
    locale,
    t,
    f,
    usd,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));

/* ------------------------------------------------------------------ */
/* Preview options                                                     */
/* ------------------------------------------------------------------ */

export const ACCENTS = ["lime", "ocean", "ember", "rose", "graphite"] as const;
export type PreviewAccent = (typeof ACCENTS)[number];
export const accentNames: Record<PreviewAccent, L> = {
  lime: { en: "Lime", tr: "Misket" },
  ocean: { en: "Ocean", tr: "Okyanus" },
  ember: { en: "Ember", tr: "Kor" },
  rose: { en: "Rose", tr: "Gül" },
  graphite: { en: "Graphite", tr: "Grafit" },
};

export const FONTS = ["editorial", "grotesk", "corporate", "system"] as const;
export type PreviewFont = (typeof FONTS)[number];
export const fontNames: Record<PreviewFont, L> = {
  editorial: { en: "Editorial — serif headings", tr: "Editoryal — serif başlık" },
  grotesk: { en: "Grotesk", tr: "Grotesk" },
  corporate: { en: "Corporate — Plex", tr: "Kurumsal — Plex" },
  system: { en: "System fonts", tr: "Sistem yazı tipleri" },
};

export type Device = "desktop" | "tablet" | "mobile";
export const DEVICE_WIDTH: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };
export const DEVICE_HEIGHT: Record<Device, number> = { desktop: 800, tablet: 1060, mobile: 780 };

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export type Layout = "landing" | "dashboard" | "editorial";
export type Kind = "website" | "dashboard" | "editorial";
export const kinds: { id: Kind; label: L }[] = [
  { id: "website", label: { en: "Product sites", tr: "Ürün siteleri" } },
  { id: "dashboard", label: { en: "Dashboards", tr: "Paneller" } },
  { id: "editorial", label: { en: "Editorial", tr: "Editoryal" } },
];

export interface Template {
  id: string;
  name: string;
  kind: Kind;
  layout: Layout;
  tagline: L;
  description: L;
  /** Preview page ids, first = home. */
  pages: { id: string; label: L; path: string }[];
  /** The look the preview opens with. */
  accent: PreviewAccent;
  font: PreviewFont;
  dark?: boolean;
  /** Brand inside the preview (fictional). */
  brand: string;
  domain: string;
  version: string;
  updated: string;
  sales: number;
  pageCount: number;
  author: string;
  isNew?: boolean;
}

const landingPages = [
  { id: "home", label: { en: "Home", tr: "Ana sayfa" }, path: "/" },
  { id: "pricing", label: { en: "Pricing", tr: "Fiyatlar" }, path: "/pricing" },
  { id: "signin", label: { en: "Sign in", tr: "Giriş" }, path: "/sign-in" },
];
const dashboardPages = [
  { id: "overview", label: { en: "Overview", tr: "Genel bakış" }, path: "/app" },
  { id: "customers", label: { en: "Customers", tr: "Müşteriler" }, path: "/app/customers" },
  { id: "settings", label: { en: "Settings", tr: "Ayarlar" }, path: "/app/settings" },
];
const editorialPages = [
  { id: "home", label: { en: "Front page", tr: "Ön sayfa" }, path: "/" },
  { id: "article", label: { en: "Article", tr: "Yazı" }, path: "/notes/slow-cities" },
  { id: "about", label: { en: "About", tr: "Hakkında" }, path: "/about" },
];

export const templates: Template[] = [
  {
    id: "ledger",
    name: "Ledger",
    kind: "dashboard",
    layout: "dashboard",
    tagline: { en: "Invoicing and cash-flow dashboard", tr: "Fatura ve nakit akışı paneli" },
    description: {
      en: "An admin for a small finance team: overview with cash runway, a customers table with filters, and a settings page with real forms. 14 screens in the full file.",
      tr: "Küçük bir finans ekibi için yönetim paneli: nakit pistli genel bakış, filtreli müşteri tablosu ve gerçek formlu ayarlar sayfası. Tam dosyada 14 ekran.",
    },
    pages: dashboardPages,
    accent: "ocean",
    font: "corporate",
    brand: "Northbeam Finance",
    domain: "app.northbeam.example.com",
    version: "2.3.0",
    updated: "2026-10-28",
    sales: 1284,
    pageCount: 14,
    author: "Derin Aksu",
  },
  {
    id: "launchpad",
    name: "Launchpad",
    kind: "website",
    layout: "landing",
    tagline: { en: "Product site for a SaaS launch", tr: "SaaS lansmanı için ürün sitesi" },
    description: {
      en: "Home, pricing with a yearly toggle and a sign-in page. Built for a product with one clear job and a free trial. 9 pages in the full file.",
      tr: "Ana sayfa, yıllık geçişli fiyatlar ve giriş sayfası. Tek net işi ve ücretsiz denemesi olan bir ürün için. Tam dosyada 9 sayfa.",
    },
    pages: landingPages,
    accent: "lime",
    font: "grotesk",
    brand: "Tidewell",
    domain: "tidewell.example.com",
    version: "1.8.2",
    updated: "2026-11-04",
    sales: 2210,
    pageCount: 9,
    author: "Mira Stenberg",
  },
  {
    id: "almanac",
    name: "Almanac",
    kind: "editorial",
    layout: "editorial",
    tagline: { en: "Magazine and newsletter site", tr: "Dergi ve bülten sitesi" },
    description: {
      en: "A front page with a lead story, long-form articles with a comfortable measure, and an about page for the masthead. 7 pages in the full file.",
      tr: "Manşet haberli ön sayfa, rahat satır uzunluklu uzun yazılar ve künye için hakkında sayfası. Tam dosyada 7 sayfa.",
    },
    pages: editorialPages,
    accent: "ember",
    font: "editorial",
    brand: "The Long Field",
    domain: "longfield.example.com",
    version: "1.2.0",
    updated: "2026-09-30",
    sales: 640,
    pageCount: 7,
    author: "Derin Aksu",
  },
  {
    id: "quarry",
    name: "Quarry",
    kind: "dashboard",
    layout: "dashboard",
    tagline: { en: "Ops console, dark by default", tr: "Operasyon konsolu, varsayılan koyu" },
    description: {
      en: "The Ledger screens re-cut for an operations team: dense tables, status pills and a dark default. 12 screens in the full file.",
      tr: "Ledger ekranlarının operasyon ekibi için yeniden kurgusu: yoğun tablolar, durum etiketleri ve varsayılan koyu tema. Tam dosyada 12 ekran.",
    },
    pages: dashboardPages,
    accent: "graphite",
    font: "system",
    dark: true,
    brand: "Kestrel Logistics",
    domain: "ops.kestrel.example.com",
    version: "1.0.4",
    updated: "2026-11-08",
    sales: 312,
    pageCount: 12,
    author: "Ozan Erim",
    isNew: true,
  },
  {
    id: "harbor",
    name: "Harbor",
    kind: "website",
    layout: "landing",
    tagline: { en: "Calm product site for a finance app", tr: "Finans uygulaması için sakin ürün sitesi" },
    description: {
      en: "The Launchpad structure in a quieter voice: serif headings, more white space, trust details up front. 9 pages in the full file.",
      tr: "Launchpad yapısı daha sakin bir sesle: serif başlıklar, daha çok boşluk, güven bilgileri en önde. Tam dosyada 9 sayfa.",
    },
    pages: landingPages,
    accent: "rose",
    font: "editorial",
    brand: "Penny & Pine",
    domain: "pennypine.example.com",
    version: "1.1.0",
    updated: "2026-10-12",
    sales: 498,
    pageCount: 9,
    author: "Mira Stenberg",
  },
  {
    id: "fieldbook",
    name: "Fieldbook",
    kind: "editorial",
    layout: "editorial",
    tagline: { en: "Studio journal and portfolio", tr: "Stüdyo günlüğü ve portfolyo" },
    description: {
      en: "Almanac for a small studio: a front page of notes, case-study articles and an about page with the team. 8 pages in the full file.",
      tr: "Küçük bir stüdyo için Almanac: notlardan oluşan ön sayfa, vaka yazıları ve ekipli hakkında sayfası. Tam dosyada 8 sayfa.",
    },
    pages: editorialPages,
    accent: "ocean",
    font: "grotesk",
    brand: "Saltmarsh Studio",
    domain: "saltmarsh.example.com",
    version: "0.9.1",
    updated: "2026-11-06",
    sales: 87,
    pageCount: 8,
    author: "Ozan Erim",
    isNew: true,
  },
];
export const templateById = (id: string) => templates.find((x) => x.id === id) ?? templates[0]!;

/* ------------------------------------------------------------------ */
/* Licences                                                            */
/* ------------------------------------------------------------------ */

export type Licence = "personal" | "team" | "extended";
export const licences: { id: Licence; name: L; price: number; who: L }[] = [
  { id: "personal", name: { en: "Personal", tr: "Kişisel" }, price: 49, who: { en: "One person, unlimited own projects", tr: "Tek kişi, sınırsız kendi projesi" } },
  { id: "team", name: { en: "Team", tr: "Ekip" }, price: 129, who: { en: "Up to 8 people, client work allowed", tr: "8 kişiye kadar, müşteri işi serbest" } },
  { id: "extended", name: { en: "Extended", tr: "Genişletilmiş" }, price: 349, who: { en: "Use in a product you sell (SaaS, themes)", tr: "Sattığınız bir üründe kullanım (SaaS, tema)" } },
];
export const licenceById = (id: Licence) => licences.find((l) => l.id === id)!;
export const UPDATES_PRICE = 29;

export const COUPONS: Record<string, number> = { GRID10: 0.1, FRIENDS15: 0.15 };

export const countries: { id: string; name: L; vat: number; note: L }[] = [
  { id: "TR", name: { en: "Türkiye", tr: "Türkiye" }, vat: 0.2, note: { en: "KDV 20% · e-Arşiv invoice", tr: "KDV %20 · e-Arşiv fatura" } },
  { id: "DE", name: { en: "Germany", tr: "Almanya" }, vat: 0.19, note: { en: "VAT 19% (OSS)", tr: "KDV %19 (OSS)" } },
  { id: "GB", name: { en: "United Kingdom", tr: "Birleşik Krallık" }, vat: 0.2, note: { en: "VAT 20%", tr: "KDV %20" } },
  { id: "US", name: { en: "United States", tr: "Amerika Birleşik Devletleri" }, vat: 0, note: { en: "No sales tax on digital templates in most states", tr: "Çoğu eyalette dijital şablonda satış vergisi yok" } },
];

export const changelog: { version: string; date: string; text: L }[] = [
  { version: "2.3.0", date: "2026-10-28", text: { en: "Settings page rebuilt with real forms; density switch.", tr: "Ayarlar sayfası gerçek formlarla yeniden yapıldı; yoğunluk anahtarı." } },
  { version: "2.2.1", date: "2026-09-14", text: { en: "Dark mode chart contrast fixed; Turkish strings checked.", tr: "Koyu modda grafik kontrastı düzeltildi; Türkçe metinler kontrol edildi." } },
  { version: "2.2.0", date: "2026-08-02", text: { en: "Customers table: saved views and CSV export.", tr: "Müşteri tablosu: kayıtlı görünümler ve CSV dışa aktarma." } },
];

export const faqItems: { q: L; a: L }[] = [
  { q: { en: "What exactly do I download?", tr: "Tam olarak ne indiriyorum?" }, a: { en: "A zip with the React source (Next.js App Router), the pages you see in the preview plus the rest of the set, sample data, and a README. Everything uses Vamos UI components and tokens, so your accent, fonts and dark mode work out of the box.", tr: "React kaynak kodu (Next.js App Router), önizlemede gördüğünüz sayfalar ve setin geri kalanı, örnek veri ve bir README içeren bir zip. Her şey Vamos UI bileşen ve token’larını kullanır; vurgu renginiz, yazı tipleriniz ve koyu mod kutudan çıktığı gibi çalışır." } },
  { q: { en: "Is the preview the real template?", tr: "Önizleme gerçek şablon mu?" }, a: { en: "Yes. It is the same components rendered in your browser — switch the accent, fonts, dark mode or device and you see exactly what the code does.", tr: "Evet. Tarayıcınızda çizilen aynı bileşenler — vurgu rengini, yazı tipini, koyu modu veya cihazı değiştirin; kodun tam olarak ne yaptığını görürsünüz." } },
  { q: { en: "Which licence do I need for client work?", tr: "Müşteri işi için hangi lisans gerekir?" }, a: { en: "Team. Personal covers your own projects only. Extended is for products you sell where the template is part of what the buyer gets.", tr: "Ekip. Kişisel yalnızca kendi projelerinizi kapsar. Genişletilmiş, şablonun alıcıya verilen şeyin parçası olduğu, sattığınız ürünler içindir." } },
  { q: { en: "Do I get updates?", tr: "Güncelleme alıyor muyum?" }, a: { en: "Every licence includes 12 months of updates. Add lifetime updates at checkout for $29.", tr: "Her lisans 12 ay güncelleme içerir. Ödemede 29 $’a ömür boyu güncelleme ekleyebilirsiniz." } },
  { q: { en: "Can I get a refund?", tr: "İade alabilir miyim?" }, a: { en: "Within 14 days if you have not shipped anything built on it. Write to us with the order number.", tr: "Üzerine kurulu bir şey yayımlamadıysanız 14 gün içinde. Sipariş numarasıyla bize yazın." } },
];
