// Sample content for "Ledgerly Advisors", a fictional firm of chartered accountants in Kadıköy,
// İstanbul. Every human-readable field is `{ en, tr }`. Fees are fictional, in Turkish lira, excl. VAT.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

export const PHONE = "+902160000000";
export const EMAIL = "hello@ledgerly.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(String(value), "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const money = (amount: number) => ({ amount: String(amount), currency: "TRY" });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  forms: { ...unsplash("1554224155-6726b3ff858f", 1600, 1100), alt: { en: "Tax forms, receipts and a calculator spread on a white desk", tr: "Beyaz masaya yayılmış vergi formları, fişler ve bir hesap makinesi" } },
  signing: { ...unsplash("1603796846097-bee99e4a601f", 1600, 1100), alt: { en: "Two people going through printed statements and signing a page", tr: "Basılı tabloları inceleyip bir sayfayı imzalayan iki kişi" } },
  office: { ...unsplash("1577412647305-991150c7d163", 1600, 1100), alt: { en: "An open-plan office with white desks and a long window wall", tr: "Beyaz masalı, uzun pencere duvarlı açık ofis" } },
};

// ---------------------------------------------------------------- the fee model

export type CompanyType = "sole" | "ltd" | "as" | "branch";
export type InvoiceBand = "50" | "200" | "600" | "600+";
export type ExtraId = "einvoice" | "trade" | "english" | "audit";

export const companyTypes: { id: CompanyType; name: L; short: L; base: number; note: L; included: L[] }[] = [
  {
    id: "sole",
    name: { en: "Sole trader", tr: "Şahıs işletmesi" },
    short: { en: "Sole trader", tr: "Şahıs" },
    base: 4750,
    note: { en: "Freelancers, shops and one-person studios", tr: "Serbest meslek, dükkân ve tek kişilik stüdyolar" },
    included: [
      { en: "Bookkeeping (single or double entry)", tr: "Defter tutma (işletme veya bilanço)" },
      { en: "Monthly VAT and withholding returns", tr: "Aylık KDV ve muhtasar beyannameleri" },
      { en: "Annual income tax return", tr: "Yıllık gelir vergisi beyannamesi" },
    ],
  },
  {
    id: "ltd",
    name: { en: "Limited company (Ltd. Şti.)", tr: "Limited şirket (Ltd. Şti.)" },
    short: { en: "Ltd.", tr: "Ltd." },
    base: 9500,
    note: { en: "Most start-ups and family businesses", tr: "Çoğu girişim ve aile şirketi" },
    included: [
      { en: "Double-entry books and monthly trial balance", tr: "Bilanço esası defter ve aylık mizan" },
      { en: "VAT, withholding and provisional tax returns", tr: "KDV, muhtasar ve geçici vergi beyannameleri" },
      { en: "Corporate tax return and year-end statements", tr: "Kurumlar vergisi beyannamesi ve yıl sonu tabloları" },
    ],
  },
  {
    id: "as",
    name: { en: "Joint-stock company (A.Ş.)", tr: "Anonim şirket (A.Ş.)" },
    short: { en: "A.Ş.", tr: "A.Ş." },
    base: 14500,
    note: { en: "Investor-backed and larger companies", tr: "Yatırım almış ve büyük şirketler" },
    included: [
      { en: "Everything in Ltd., plus board and general-assembly minutes", tr: "Ltd. kapsamındaki her şey, artı yönetim kurulu ve genel kurul tutanakları" },
      { en: "Monthly management accounts", tr: "Aylık yönetim raporu" },
      { en: "Partner review every month", tr: "Her ay ortak kontrolü" },
    ],
  },
  {
    id: "branch",
    name: { en: "Foreign company branch", tr: "Yabancı şirket şubesi" },
    short: { en: "Branch", tr: "Şube" },
    base: 18000,
    note: { en: "Branches and liaison offices reporting abroad", tr: "Yurt dışına raporlayan şube ve irtibat büroları" },
    included: [
      { en: "Turkish statutory books and returns", tr: "Türkiye yasal defterleri ve beyannameleri" },
      { en: "Monthly reporting pack in English, mapped to your group chart", tr: "Grup hesap planına eşlenmiş aylık İngilizce rapor paketi" },
      { en: "Partner review every month", tr: "Her ay ortak kontrolü" },
    ],
  },
];

export const invoiceBands: { id: InvoiceBand; label: L; add: number }[] = [
  { id: "50", label: { en: "Up to 50", tr: "50’ye kadar" }, add: 0 },
  { id: "200", label: { en: "51–200", tr: "51–200" }, add: 2250 },
  { id: "600", label: { en: "201–600", tr: "201–600" }, add: 5500 },
  { id: "600+", label: { en: "600+", tr: "600+" }, add: 9800 },
];

export const PER_EMPLOYEE = 350;

export const extras: { id: ExtraId; name: L; hint: L; add: number; only?: CompanyType[] }[] = [
  { id: "einvoice", name: { en: "E-invoice & e-ledger", tr: "E-fatura ve e-defter" }, hint: { en: "We run the portal, archive and monthly e-ledger upload", tr: "Portalı, arşivi ve aylık e-defter yüklemesini biz yönetiriz" }, add: 1200 },
  { id: "trade", name: { en: "Import / export", tr: "İthalat / ihracat" }, hint: { en: "Customs declarations booked, FX revaluation, export VAT refunds", tr: "Gümrük beyannameleri, kur değerlemesi, ihracat KDV iadesi" }, add: 2800 },
  { id: "english", name: { en: "English management pack", tr: "İngilizce yönetim raporu" }, hint: { en: "P&L, cash and KPIs in English by the 10th", tr: "Ayın 10’una kadar İngilizce gelir tablosu, nakit ve göstergeler" }, add: 3400 },
  { id: "audit", name: { en: "Audit-ready year end", tr: "Denetime hazır yıl sonu" }, hint: { en: "Lead schedules and a file your auditors can open on day one", tr: "Denetçinizin ilk gün açabileceği dosya ve ana tablolar" }, add: 4500, only: ["as", "branch"] },
];

export interface FeeInput {
  type: CompanyType;
  employees: number;
  invoices: InvoiceBand;
  extras: ExtraId[];
}

export const DEFAULT_FEE: FeeInput = { type: "ltd", employees: 6, invoices: "200", extras: ["einvoice"] };

export interface FeeLine {
  id: string;
  label: L;
  amount: number;
}

export function estimate(input: FeeInput) {
  const type = companyTypes.find((c) => c.id === input.type)!;
  const band = invoiceBands.find((b) => b.id === input.invoices)!;
  const lines: FeeLine[] = [{ id: "base", label: { en: `${type.name.en} retainer`, tr: `${type.name.tr} aylık ücreti` }, amount: type.base }];
  if (input.employees > 0) lines.push({ id: "payroll", label: { en: `Payroll & SGK for ${input.employees} ${input.employees === 1 ? "person" : "people"}`, tr: `${input.employees} kişi bordro ve SGK` }, amount: input.employees * PER_EMPLOYEE });
  if (band.add) lines.push({ id: "volume", label: { en: `Invoice volume ${band.label.en} a month`, tr: `Aylık ${band.label.tr} fatura hacmi` }, amount: band.add });
  for (const e of extras) {
    if (!input.extras.includes(e.id)) continue;
    if (e.only && !e.only.includes(input.type)) continue;
    lines.push({ id: e.id, label: e.name, amount: e.add });
  }
  const monthly = lines.reduce((s, l) => s + l.amount, 0);
  const vat = Math.round(monthly * 0.2);
  // Year-end close is billed once, in March, at one month's retainer (base only).
  const yearEnd = type.base;
  const takeover = Math.round(type.base * 0.5);
  const partner = input.type === "as" || input.type === "branch" || input.employees >= 20;
  return { type, lines, monthly, vat, gross: monthly + vat, yearEnd, takeover, annual: monthly * 12 + yearEnd, partner };
}

// ---------------------------------------------------------------- people, office, FAQ

export const team = [
  { name: "Nesrin Aydemir", role: { en: "Founding partner · SMMM", tr: "Kurucu ortak · SMMM" }, specialty: { en: "Corporate tax, foreign-owned companies", tr: "Kurumlar vergisi, yabancı sermayeli şirketler" }, photo: { ...unsplash("1544005313-94ddf0286df2", 800, 1000), alt: { en: "Nesrin Aydemir in a striped blouse, smiling", tr: "Çizgili bluzuyla gülümseyen Nesrin Aydemir" } } },
  { name: "Kerem Başaran", role: { en: "Partner · SMMM", tr: "Ortak · SMMM" }, specialty: { en: "Payroll, SGK audits, incentives", tr: "Bordro, SGK denetimleri, teşvikler" }, photo: { ...unsplash("1519085360753-af0119f7cbe7", 800, 1000), alt: { en: "Kerem Başaran in a dark suit and tie, arms folded", tr: "Koyu takım elbiseli ve kravatlı Kerem Başaran, kollarını kavuşturmuş" } } },
  { name: "Defne Ilgaz", role: { en: "Senior accountant", tr: "Kıdemli muhasebeci" }, specialty: { en: "Branches and English reporting", tr: "Şubeler ve İngilizce raporlama" }, photo: { ...unsplash("1525134479668-1bee5c7c6845", 800, 1000), alt: { en: "Defne Ilgaz, wavy fair hair, in a denim jacket outdoors", tr: "Dalgalı açık renk saçlı, kot ceketli Defne Ilgaz, dışarıda" } } },
  { name: "Tolga Yazıcı", role: { en: "Senior accountant", tr: "Kıdemli muhasebeci" }, specialty: { en: "E-commerce, marketplaces, e-invoice", tr: "E-ticaret, pazaryerleri, e-fatura" }, photo: { ...unsplash("1535713875002-d1d0cf377fde", 800, 1000), alt: { en: "Tolga Yazıcı, short dark hair, in a dark collarless shirt", tr: "Kısa koyu saçlı, koyu yakasız gömlekli Tolga Yazıcı" } } },
];

export const reviews = [
  { quote: { en: "We switched in March, mid-quarter. Defne rebuilt three months of books in nine days and our provisional tax went in on time.", tr: "Mart’ta, çeyreğin ortasında geçtik. Defne üç aylık defteri dokuz günde yeniden kurdu, geçici vergimiz zamanında verildi." }, author: "Elif Sarıgül", role: { en: "Co-founder, Pinecone Ceramics Ltd.", tr: "Kurucu ortak, Pinecone Seramik Ltd." }, date: "2026-06-18" },
  { quote: { en: "The English pack lands on the 10th, every month. Our group controller in Rotterdam stopped sending me questions.", tr: "İngilizce rapor her ay 10’unda geliyor. Rotterdam’daki grup kontrolörümüz bana soru göndermeyi bıraktı." }, author: "Jonas Verhoef", role: { en: "Country manager, Tidewell Logistics branch", tr: "Ülke müdürü, Tidewell Lojistik şubesi" }, date: "2026-09-02" },
];

const office = { open: "09:00", close: "18:00" };
export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: { mon: [office], tue: [office], wed: [office], thu: [office], fri: [office], sat: [{ open: "10:00", close: "13:00" }], sun: [] },
};

const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f3f4f6'/>" +
  "<g fill='#e4e6ea'>" +
  Array.from({ length: 30 }, (_, i) => `<rect x='${(i % 6) * 200 + 14}' y='${Math.floor(i / 6) * 180 + 14}' width='172' height='152' rx='2'/>`).join("") +
  "</g><g fill='none' stroke='#ffffff' stroke-linecap='round'><path d='M-20 362 H1220' stroke-width='28'/><path d='M600 -20 V920' stroke-width='20'/><path d='M-20 760 L1220 560' stroke-width='14'/></g>" +
  "<rect x='614' y='194' width='172' height='152' rx='2' fill='#c9ced6'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export const address = { line: "Değirmen Sokak 14, Kat 6", district: "Kozyatağı", city: "Kadıköy", region: "İstanbul", postalCode: "34742", country: "TR", geo: { lat: 40.9772, lng: 29.0961 } };

export function branches(t: (v: Localized<string>) => string): Branch[] {
  return [
    {
      name: "Ledgerly Advisors",
      address,
      phone: PHONE,
      email: EMAIL,
      hours,
      mapImage: streetMap,
      notes: t({ en: "Two minutes from Kozyatağı metro, exit B. Visitor parking on level −1; tell the desk you are here for Ledgerly.", tr: "Kozyatağı metrosu B çıkışından iki dakika. Ziyaretçi otoparkı −1. katta; danışmaya Ledgerly için geldiğinizi söyleyin." }),
    },
  ];
}

export const faqs: { q: L; a: L }[] = [
  { q: { en: "Is the estimate the price I will pay?", tr: "Tahmin ödeyeceğim fiyat mı?" }, a: { en: "It is the fee we start from. After a 20-minute call and a look at last month’s bank statement we confirm it in writing; nine in ten clients sign at the estimated figure.", tr: "Başlangıç ücretimizdir. 20 dakikalık bir görüşme ve geçen ayın banka ekstresine bir bakıştan sonra yazılı teyit ederiz; on müşteriden dokuzu tahmin edilen rakamla imzalar." } },
  { q: { en: "Can you take over from my current accountant mid-year?", tr: "Mevcut muhasebecimden yıl ortasında devralabilir misiniz?" }, a: { en: "Yes. We request the books and e-ledger access, reconcile the opening balances and file the next return ourselves. Takeover is a one-off half-month fee.", tr: "Evet. Defterleri ve e-defter erişimini talep eder, açılış bakiyelerini mutabık kılar ve sonraki beyannameyi kendimiz veririz. Devir, tek seferlik yarım aylık ücrettir." } },
  { q: { en: "Do you work with companies outside İstanbul?", tr: "İstanbul dışındaki şirketlerle çalışıyor musunuz?" }, a: { en: "About a third of our clients are in Ankara, İzmir and Bursa. Documents come in through the client portal; we meet on video.", tr: "Müşterilerimizin yaklaşık üçte biri Ankara, İzmir ve Bursa’da. Belgeler müşteri portalından gelir; görüntülü görüşürüz." } },
  { q: { en: "Who signs my returns?", tr: "Beyannamelerimi kim imzalar?" }, a: { en: "A licensed SMMM partner signs every return. Your senior accountant prepares it and is your daily contact.", tr: "Her beyannameyi lisanslı bir SMMM ortak imzalar. Kıdemli muhasebeciniz hazırlar ve günlük muhatabınızdır." } },
  { q: { en: "What happens if a deadline is missed because of you?", tr: "Bizim yüzümüzden bir süre kaçarsa ne olur?" }, a: { en: "We pay the penalty and the late interest. It is written into every engagement letter; since 2014 it has cost us nothing.", tr: "Cezayı ve gecikme faizini biz öderiz. Her sözleşmede yazılıdır; 2014’ten beri bize bir maliyeti olmadı." } },
];
