// Sample content for "Fernway", a fictional savings and everyday-money app for households in
// Türkiye. Every human-readable field is { en, tr } and resolved with `pickLocale`. Licence
// numbers, rates, people and figures are invented; nothing here is a financial offer.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, sitePageHref } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
/** A string in both languages. */
export type L = { en: string; tr: string };

export const BRAND = "Fernway";
export const PHONE = "+902160000000";
export const EMAIL = "help@example.com";
export const SECURITY_EMAIL = "security@example.com";

export const appPages = ["home", "pricing", "security"];
export const home = (anchor?: string) => sitePageHref("home", anchor);
export const PRICING_HREF = sitePageHref("pricing");
export const SECURITY_HREF = sitePageHref("security");
export const SIGNUP_HREF = "https://example.com/open-account";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  return {
    t,
    intl,
    f: createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" }),
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

/** Illustrative pot rate: gross yearly, and the withholding tax deducted from interest. */
export const RATE = { grossYearly: 0.395, withholding: 0.175 };
/** Net monthly rate used by the planner (compounded monthly). */
export const netMonthly = (RATE.grossYearly * (1 - RATE.withholding)) / 12;

/* Trust badges ---------------------------------------------------------- */

export const trust: { icon: "licence" | "safeguard" | "iso" | "pci" | "kvkk"; title: L; text: L }[] = [
  {
    icon: "licence",
    title: { en: "Licensed e-money institution", tr: "Lisanslı elektronik para kuruluşu" },
    text: { en: "Licence no. 00/000 (fictional)", tr: "Lisans no. 00/000 (kurgusal)" },
  },
  {
    icon: "safeguard",
    title: { en: "Safeguarded 1:1", tr: "1:1 koruma altında" },
    text: { en: "Held apart at a partner bank", tr: "Bir iş ortağı bankada ayrı tutulur" },
  },
  {
    icon: "iso",
    title: { en: "ISO/IEC 27001", tr: "ISO/IEC 27001" },
    text: { en: "Information security, audited yearly", tr: "Bilgi güvenliği, yıllık denetim" },
  },
  {
    icon: "pci",
    title: { en: "PCI DSS Level 1", tr: "PCI DSS Seviye 1" },
    text: { en: "Card data never touches our apps", tr: "Kart verisi uygulamalarımıza hiç değmez" },
  },
  {
    icon: "kvkk",
    title: { en: "KVKK by design", tr: "Tasarımdan KVKK uyumlu" },
    text: { en: "We never sell or rent your data", tr: "Verinizi asla satmaz ya da kiralamayız" },
  },
];

/* Features --------------------------------------------------------------- */

export const features: { icon: string; title: L; text: L }[] = [
  {
    icon: "piggy-bank",
    title: { en: "Pots that earn every day", tr: "Her gün kazandıran kumbaralar" },
    text: {
      en: "Up to 10 pots, each with its own goal. Interest is worked out daily and paid on the 1st; take money out any time, no notice period.",
      tr: "Her birinin kendi hedefi olan 10’a kadar kumbara. Faiz günlük hesaplanır, ayın 1’inde ödenir; ihbar süresi olmadan istediğiniz an çekin.",
    },
  },
  {
    icon: "users",
    title: { en: "One budget for the household", tr: "Hane için tek bütçe" },
    text: {
      en: "Invite a partner or a parent. Shared pots and shared bills, with each person’s own card and own privacy.",
      tr: "Eşinizi ya da ebeveyninizi davet edin. Ortak kumbaralar ve ortak faturalar; herkesin kendi kartı ve kendi gizliliğiyle.",
    },
  },
  {
    icon: "calendar-clock",
    title: { en: "Bills, three days early", tr: "Faturalar, üç gün önceden" },
    text: {
      en: "Rent, dues and utilities are set aside before payday spending starts, and you get a reminder three days before each one leaves.",
      tr: "Kira, aidat ve faturalar maaş harcamaları başlamadan kenara ayrılır; her biri çıkmadan üç gün önce hatırlatma alırsınız.",
    },
  },
  {
    icon: "snowflake",
    title: { en: "Freeze a card in one tap", tr: "Kartı tek dokunuşla dondurun" },
    text: {
      en: "Freeze, unfreeze or replace a card from the app. Online, contactless and ATM use can be switched off separately.",
      tr: "Kartı uygulamadan dondurun, çözün ya da yenileyin. İnternet, temassız ve ATM kullanımı ayrı ayrı kapatılabilir.",
    },
  },
];

/* Planner goals ---------------------------------------------------------------- */

export const goals: { id: string; label: L; target: number; monthly: number; months: number }[] = [
  { id: "emergency", label: { en: "Emergency fund", tr: "Acil durum fonu" }, target: 150_000, monthly: 7_500, months: 18 },
  { id: "car", label: { en: "Car down payment", tr: "Araç peşinatı" }, target: 400_000, monthly: 15_000, months: 24 },
  { id: "home", label: { en: "Home deposit", tr: "Ev peşinatı" }, target: 1_200_000, monthly: 25_000, months: 36 },
];

/* Home: stats, quote, FAQ ---------------------------------------------------- */

export const stats: { value: number; unit?: L; label: L }[] = [
  { value: 214000, label: { en: "households use Fernway", tr: "hane Fernway kullanıyor" } },
  { value: 4.1, unit: { en: "bn ₺", tr: "milyar ₺" }, label: { en: "safeguarded at our partner bank", tr: "iş ortağı bankada koruma altında" } },
  { value: 99.97, unit: { en: "%", tr: "%" }, label: { en: "uptime over the last 12 months", tr: "son 12 ayda erişilebilirlik" } },
  { value: 38, unit: { en: "s", tr: "sn" }, label: { en: "median wait for a person in chat", tr: "sohbette bir kişiye ortalama bekleme" } },
];

export const quote = {
  text: {
    en: "We moved the rent, the dues and our holiday savings over in one evening. For the first time in years, nothing surprises us on the 1st of the month.",
    tr: "Kirayı, aidatı ve tatil birikimimizi bir akşamda taşıdık. Yıllardır ilk kez ayın 1’inde hiçbir şey bizi şaşırtmıyor.",
  },
  author: "Elif & Kaan Demirci",
  role: { en: "Household plan since 2025, Üsküdar", tr: "2025’ten beri Hane planı, Üsküdar" },
};

export const faq: { q: L; a: L }[] = [
  {
    q: { en: "Is my money safe if Fernway goes out of business?", tr: "Fernway faaliyetini durdurursa param güvende mi?" },
    a: {
      en: "Yes. Customer money is not ours to lend. It is held 1:1 in a separate safeguarding account at our partner bank and would be returned to you by an administrator. Safeguarding is not the same as deposit insurance — we explain the difference on the security page.",
      tr: "Evet. Müşteri parası bizim borç verebileceğimiz bir para değildir. İş ortağı bankamızda ayrı bir koruma hesabında 1:1 tutulur ve bir kayyum tarafından size iade edilir. Koruma, mevduat sigortasıyla aynı şey değildir — farkı güvenlik sayfasında anlatıyoruz.",
    },
  },
  {
    q: { en: "How is pot interest calculated?", tr: "Kumbara faizi nasıl hesaplanır?" },
    a: {
      en: "Daily, on the balance at the end of each day, and paid on the 1st of the month. The current illustrative rate is 39.5% a year before the 17.5% withholding tax. Rates can change; we give 30 days’ notice of any cut.",
      tr: "Her günün sonundaki bakiye üzerinden günlük hesaplanır ve ayın 1’inde ödenir. Güncel örnek oran, %17,5 stopaj öncesi yıllık %39,5’tir. Oranlar değişebilir; her indirimi 30 gün önceden bildiririz.",
    },
  },
  {
    q: { en: "What do I need to open an account?", tr: "Hesap açmak için neye ihtiyacım var?" },
    a: {
      en: "A Turkish ID card (or a residence permit), a phone number in your name and about six minutes for the video check. Accounts are for people 18 and over.",
      tr: "T.C. kimlik kartı (ya da ikamet izni), adınıza kayıtlı bir telefon numarası ve görüntülü doğrulama için yaklaşık altı dakika. Hesaplar 18 yaş ve üzeri içindir.",
    },
  },
  {
    q: { en: "Can I leave whenever I want?", tr: "İstediğim zaman ayrılabilir miyim?" },
    a: {
      en: "Yes. Move your balance out and close the account from Settings; there is no closing fee and no minimum term on any plan.",
      tr: "Evet. Bakiyenizi aktarın ve hesabı Ayarlar’dan kapatın; hiçbir planda kapatma ücreti ya da asgari süre yoktur.",
    },
  },
];

/* Pricing ------------------------------------------------------------------- */

export const plans: { id: string; name: L; description: L; monthly: string; yearly: string; features: L[]; highlight?: L }[] = [
  {
    id: "essential",
    name: { en: "Essential", tr: "Temel" },
    description: { en: "Everyday account, card and two pots.", tr: "Günlük hesap, kart ve iki kumbara." },
    monthly: "0",
    yearly: "0",
    features: [
      { en: "Debit card, free to issue", tr: "Banka kartı, ücretsiz" },
      { en: "2 pots with daily interest", tr: "Günlük faizli 2 kumbara" },
      { en: "Free transfers (FAST, EFT)", tr: "Ücretsiz havale (FAST, EFT)" },
      { en: "2 ATM withdrawals a month", tr: "Ayda 2 ATM çekimi" },
    ],
  },
  {
    id: "plus",
    name: { en: "Plus", tr: "Plus" },
    description: { en: "For one person who saves on purpose.", tr: "Bilinçli birikim yapan tek kişi için." },
    monthly: "89",
    yearly: "890",
    highlight: { en: "Most chosen", tr: "En çok seçilen" },
    features: [
      { en: "10 pots with daily interest", tr: "Günlük faizli 10 kumbara" },
      { en: "Bill planner and reminders", tr: "Fatura planlayıcı ve hatırlatmalar" },
      { en: "FX at interbank + 0.4%", tr: "Bankalar arası kur + %0,4" },
      { en: "Unlimited ATM withdrawals", tr: "Sınırsız ATM çekimi" },
    ],
  },
  {
    id: "household",
    name: { en: "Household", tr: "Hane" },
    description: { en: "Up to four adults, one budget.", tr: "Dört yetişkine kadar, tek bütçe." },
    monthly: "149",
    yearly: "1490",
    features: [
      { en: "Everything in Plus, for 4 people", tr: "Plus’taki her şey, 4 kişi için" },
      { en: "Shared pots and shared bills", tr: "Ortak kumbaralar ve ortak faturalar" },
      { en: "Monthly household report", tr: "Aylık hane raporu" },
      { en: "Priority support line", tr: "Öncelikli destek hattı" },
    ],
  },
];

/* Security ----------------------------------------------------------------- */

export const layers: { no: string; title: L; text: L; facts: L[] }[] = [
  {
    no: "01",
    title: { en: "Your money is kept apart", tr: "Paranız ayrı tutulur" },
    text: {
      en: "Every lira you hold with us sits in a safeguarding account at our partner bank, reconciled every business day. We cannot lend it, invest it or use it to pay our own bills.",
      tr: "Bizde tuttuğunuz her lira, iş ortağı bankamızdaki bir koruma hesabında durur ve her iş günü mutabakatı yapılır. Onu borç veremez, yatıramaz ya da kendi faturalarımızı ödemek için kullanamayız.",
    },
    facts: [
      { en: "Daily reconciliation", tr: "Günlük mutabakat" },
      { en: "Independent yearly audit", tr: "Bağımsız yıllık denetim" },
    ],
  },
  {
    no: "02",
    title: { en: "Your account is tied to your phone", tr: "Hesabınız telefonunuza bağlıdır" },
    text: {
      en: "Sign-in needs your face or fingerprint on a device you registered. A new device has to be approved from the old one or by a video check — a stolen password alone opens nothing.",
      tr: "Giriş, kaydettiğiniz bir cihazda yüzünüzü ya da parmak izinizi gerektirir. Yeni bir cihaz eskisinden ya da görüntülü doğrulamayla onaylanmalıdır — çalınan bir şifre tek başına hiçbir şeyi açmaz.",
    },
    facts: [
      { en: "Biometrics + device binding", tr: "Biyometri + cihaz bağlama" },
      { en: "24-hour hold on new payees over ₺50,000", tr: "50.000 ₺ üzeri yeni alıcılara 24 saat bekleme" },
    ],
  },
  {
    no: "03",
    title: { en: "Data is encrypted and stays in Türkiye", tr: "Veriler şifrelenir ve Türkiye’de kalır" },
    text: {
      en: "Data is encrypted in transit (TLS 1.3) and at rest (AES-256) in two data centres in Türkiye. Card numbers are held by a PCI-certified processor and never reach our servers.",
      tr: "Veriler aktarımda (TLS 1.3) ve depolamada (AES-256) Türkiye’deki iki veri merkezinde şifrelenir. Kart numaraları PCI sertifikalı bir işlemcide tutulur ve sunucularımıza hiç ulaşmaz.",
    },
    facts: [
      { en: "ISO/IEC 27001 · PCI DSS Level 1", tr: "ISO/IEC 27001 · PCI DSS Seviye 1" },
      { en: "Penetration test every six months", tr: "Altı ayda bir sızma testi" },
    ],
  },
  {
    no: "04",
    title: { en: "People watch for fraud, around the clock", tr: "Dolandırıcılığı insanlar izler, gece gündüz" },
    text: {
      en: "Unusual payments are paused and confirmed with you in the app. Our fraud team works in shifts every day of the year and will never ask for your code or password by phone.",
      tr: "Olağan dışı ödemeler durdurulur ve uygulamada sizinle teyit edilir. Dolandırıcılık ekibimiz yılın her günü vardiyalı çalışır ve telefonda asla kodunuzu ya da şifrenizi istemez.",
    },
    facts: [
      { en: "24/7 fraud desk", tr: "7/24 dolandırıcılık masası" },
      { en: "In-app call verification", tr: "Uygulama içi arama doğrulaması" },
    ],
  },
];

export const lostPhone: { title: L; text: L; duration: L }[] = [
  {
    title: { en: "Freeze from any browser", tr: "Herhangi bir tarayıcıdan dondurun" },
    text: { en: "Sign in at example.com/freeze with your ID number and a code sent to your email.", tr: "example.com/freeze adresinde kimlik numaranız ve e-postanıza gelen bir kodla giriş yapın." },
    duration: { en: "1 minute", tr: "1 dakika" },
  },
  {
    title: { en: "Or call us", tr: "Ya da bizi arayın" },
    text: { en: "+90 216 000 00 00, every day, 24 hours. We freeze cards and sessions while you are on the line.", tr: "+90 216 000 00 00, her gün 24 saat. Siz hattayken kartları ve oturumları dondururuz." },
    duration: { en: "Any time", tr: "Her an" },
  },
  {
    title: { en: "Verify on the new phone", tr: "Yeni telefonda doğrulayın" },
    text: { en: "A short video check moves your account to the new device; the old one is signed out everywhere.", tr: "Kısa bir görüntülü doğrulama hesabınızı yeni cihaza taşır; eskisinin her yerde oturumu kapanır." },
    duration: { en: "About 6 minutes", tr: "Yaklaşık 6 dakika" },
  },
  {
    title: { en: "A new card is posted", tr: "Yeni kart yola çıkar" },
    text: { en: "Free of charge, with the card number shown in the app straight away for online payments.", tr: "Ücretsizdir; kart numarası çevrim içi ödemeler için hemen uygulamada görünür." },
    duration: { en: "2–3 working days", tr: "2–3 iş günü" },
  },
];

/** 90 days of service health for the status strip: mostly up, two short incidents. */
export const uptime: { day: string; state: "up" | "degraded" | "down" }[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 7, 13 + i));
  const state: "up" | "degraded" | "down" = i === 23 ? "degraded" : i === 61 ? "down" : i === 62 ? "degraded" : "up";
  return { day: d.toISOString().slice(0, 10), state };
});
