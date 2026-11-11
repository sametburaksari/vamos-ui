// Sample content for "Clearroad Driving", a fictional driving school in Ataşehir. Every
// human-readable field is `{ en, tr }`. Prices are fictional, in Turkish lira, VAT included.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

export const PHONE = "+902160000000";
export const EMAIL = "hello@clearroad.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
export const pct = (n: number, locale: SiteLocale) => new Intl.NumberFormat(intlOf(locale), { style: "percent", maximumFractionDigits: 0 }).format(n);

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  wheel: { ...unsplash("1449965408869-eaa3f722e40d", 1600, 1100), alt: { en: "A learner’s hands on the steering wheel at dusk, city lights ahead", tr: "Alacakaranlıkta direksiyonu tutan bir aday sürücünün elleri, önde şehir ışıkları" } },
  road: { ...unsplash("1568605117036-5fe5e7bab0b7", 1600, 1000), alt: { en: "A car taking a long bend on an open road at sunset", tr: "Gün batımında açık bir yolda uzun bir virajı alan otomobil" } },
};

// ---------------------------------------------------------------- licences and courses

export type LicenceId = "manual" | "auto" | "moto";
export const licences: { id: LicenceId; name: L; short: string; hint: L }[] = [
  { id: "manual", short: "B", name: { en: "Car · manual", tr: "Otomobil · manuel" }, hint: { en: "Drive any car", tr: "Her otomobili kullanın" } },
  { id: "auto", short: "B", name: { en: "Car · automatic", tr: "Otomobil · otomatik" }, hint: { en: "Automatics only", tr: "Yalnızca otomatik vites" } },
  { id: "moto", short: "A2", name: { en: "Motorcycle A2", tr: "Motosiklet A2" }, hint: { en: "Up to 35 kW", tr: "35 kW’a kadar" } },
];

export type CourseId = "starter" | "standard" | "intensive";

export interface Course {
  id: CourseId;
  name: L;
  tagline: L;
  /** 50-minute lessons per licence. */
  lessons: Record<LicenceId, number>;
  price: Record<LicenceId, number>;
  /** First-time pass rate over the last 12 months. */
  passRate: number;
  /** Intensive runs on a fixed timetable. */
  fixedWeeks?: number;
  recommended?: boolean;
}

export const courses: Course[] = [
  { id: "starter", name: { en: "Starter", tr: "Başlangıç" }, tagline: { en: "For people who have driven a little before", tr: "Biraz direksiyon deneyimi olanlar için" }, lessons: { manual: 16, auto: 14, moto: 12 }, price: { manual: 24500, auto: 23200, moto: 14900 }, passRate: 0.71 },
  { id: "standard", name: { en: "Standard", tr: "Standart" }, tagline: { en: "Never driven? Start here", tr: "Hiç sürmediyseniz buradan başlayın" }, lessons: { manual: 24, auto: 22, moto: 18 }, price: { manual: 32900, auto: 31400, moto: 19500 }, passRate: 0.84, recommended: true },
  { id: "intensive", name: { en: "Intensive", tr: "Yoğun" }, tagline: { en: "Three weeks, two lessons a day", tr: "Üç hafta, günde iki ders" }, lessons: { manual: 30, auto: 28, moto: 22 }, price: { manual: 38500, auto: 36900, moto: 23900 }, passRate: 0.88, fixedWeeks: 3 },
];
export const courseById = (id: string) => courses.find((c) => c.id === id) ?? courses[1]!;

/** One comparison row: a value per course (string, yes/no) — may depend on the licence. */
export interface Row {
  id: string;
  label: L;
  hint?: L;
  values: (licence: LicenceId) => [Cell, Cell, Cell];
}
export type Cell = boolean | L | string;

const same = (a: Cell, b: Cell, c: Cell) => () => [a, b, c] as [Cell, Cell, Cell];

export const rowGroups: { title: L; rows: Row[] }[] = [
  {
    title: { en: "On the road", tr: "Yolda" },
    rows: [
      { id: "lessons", label: { en: "Driving lessons", tr: "Direksiyon dersi" }, hint: { en: "50 minutes each, dual-control car", tr: "Her biri 50 dakika, çift kumandalı araç" }, values: (l) => courses.map((c) => `${c.lessons[l]}`) as [Cell, Cell, Cell] },
      { id: "pickup", label: { en: "Pick-up from home or work", tr: "Evden ya da işten alma" }, values: same(false, true, true) },
      { id: "night", label: { en: "Night driving", tr: "Gece sürüşü" }, values: same(false, { en: "1 lesson", tr: "1 ders" }, { en: "2 lessons", tr: "2 ders" }) },
      { id: "motorway", label: { en: "Motorway lesson", tr: "Otoyol dersi" }, values: (l) => (l === "moto" ? [false, false, true] : [false, true, true]) },
    ],
  },
  {
    title: { en: "Theory & practice", tr: "Teori ve pratik" },
    rows: [
      { id: "theory", label: { en: "Theory course", tr: "Teori eğitimi" }, values: same({ en: "Online", tr: "Çevrimiçi" }, { en: "Online + 8 classes", tr: "Çevrimiçi + 8 sınıf" }, { en: "Online + 12 classes", tr: "Çevrimiçi + 12 sınıf" }) },
      { id: "sim", label: { en: "Simulator hours", tr: "Simülatör saati" }, hint: { en: "Hill starts and skids before the real thing", tr: "Gerçeğinden önce rampa kalkışı ve kayma" }, values: (l) => (l === "moto" ? [false, false, false] : ["—", "2", "4"]) },
      { id: "mock", label: { en: "Mock tests on the real route", tr: "Gerçek güzergâhta deneme sınavı" }, values: same("1", "2", "3") },
    ],
  },
  {
    title: { en: "Test day", tr: "Sınav günü" },
    rows: [
      { id: "car", label: { en: "Our car and instructor on test day", tr: "Sınav günü aracımız ve eğitmenimiz" }, values: same(true, true, true) },
      { id: "retake", label: { en: "Lessons for a retake, included", tr: "Tekrar sınavı için dahil ders" }, values: same(false, "2", "4") },
      { id: "pass", label: { en: "First-time pass rate", tr: "İlk denemede geçme oranı" }, hint: { en: "Our learners, Nov 2025 – Oct 2026", tr: "Öğrencilerimiz, Kas 2025 – Eki 2026" }, values: () => courses.map((c) => ({ en: pct(c.passRate, "en"), tr: pct(c.passRate, "tr") })) as [Cell, Cell, Cell] },
    ],
  },
];

/** Weeks to test-ready: lessons spread over the chosen pace, never under the 4-week theory minimum. */
export function weeksFor(course: Course, licence: LicenceId, perWeek: number): number {
  if (course.fixedWeeks) return course.fixedWeeks;
  return Math.max(4, Math.ceil(course.lessons[licence] / perWeek));
}

// ---------------------------------------------------------------- people, place, words

export const instructors = [
  { name: "Tarık Öncel", role: { en: "Head instructor · since 2014", tr: "Baş eğitmen · 2014’ten beri" }, specialty: { en: "Nervous drivers, manual gearboxes", tr: "Çekingen sürücüler, manuel vites" }, photo: { ...unsplash("1599566150163-29194dcaad36", 800, 1000), alt: { en: "Tarık Öncel, bearded, in glasses", tr: "Gözlüklü, sakallı Tarık Öncel" } } },
  { name: "Melis Arıkan", role: { en: "Instructor · automatics", tr: "Eğitmen · otomatik vites" }, specialty: { en: "Intensive courses, motorway", tr: "Yoğun kurslar, otoyol" }, photo: { ...unsplash("1508214751196-bcfd4ca60f91", 800, 1000), alt: { en: "Melis Arıkan smiling outdoors at sunset", tr: "Gün batımında dışarıda gülümseyen Melis Arıkan" } } },
  { name: "Can Yüce", role: { en: "Motorcycle instructor", tr: "Motosiklet eğitmeni" }, specialty: { en: "A2 and slow-speed control", tr: "A2 ve düşük hız kontrolü" }, photo: { ...unsplash("1564564321837-a57b7070ac4f", 800, 1000), alt: { en: "Can Yüce in a cap, smiling", tr: "Şapkalı, gülümseyen Can Yüce" } } },
  { name: "Elif Sezer", role: { en: "Theory & simulator lead", tr: "Teori ve simülatör sorumlusu" }, specialty: { en: "Road signs, hazard perception", tr: "Trafik işaretleri, tehlike algısı" }, photo: { ...unsplash("1546961329-78bef0414d7c", 800, 1000), alt: { en: "Elif Sezer in a denim jacket, smiling", tr: "Kot ceketli, gülümseyen Elif Sezer" } } },
];

const office = { open: "09:00", close: "20:00" };
export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: { mon: [office], tue: [office], wed: [office], thu: [office], fri: [office], sat: [{ open: "09:00", close: "16:00" }], sun: [] },
};

const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f5f4f1'/>" +
  "<g fill='#e7e5e0'>" +
  Array.from({ length: 30 }, (_, i) => `<rect x='${(i % 6) * 205 + 16}' y='${Math.floor(i / 6) * 182 + 16}' width='176' height='152' rx='4'/>`).join("") +
  "</g><g fill='none' stroke='#ffffff' stroke-linecap='round'><path d='M-20 530 H1220' stroke-width='28'/><path d='M410 -20 C430 300 380 600 420 920' stroke-width='20'/><circle cx='415' cy='530' r='52' stroke-width='18'/></g>" +
  "<rect x='450' y='560' width='150' height='120' rx='4' fill='#d3d1ca'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Clearroad Driving",
    address: { line: "Kayışdağı Caddesi 41, Kat 1", district: "Küçükbakkalköy", city: "Ataşehir", region: "İstanbul", postalCode: "34750", country: "TR", geo: { lat: 40.9846, lng: 29.1105 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({ en: "Classroom and simulator on the first floor, above the bakery. Lessons start from the car park behind the building.", tr: "Sınıf ve simülatör birinci katta, fırının üstünde. Dersler binanın arkasındaki otoparktan başlar." }),
  };
}

export const reviews = [
  { quote: { en: "Forty-one, never driven, terrified of roundabouts. Tarık never raised his voice once. Passed first time in March.", tr: "Kırk bir yaşında, hiç sürmemiş, göbekten korkan biriydim. Tarık bir kez bile sesini yükseltmedi. Martta ilk seferde geçtim." }, author: "Nermin Aksoy", role: { en: "Standard · manual", tr: "Standart · manuel" }, date: "2026-03-18" },
  { quote: { en: "Did the intensive over my summer break. Two lessons a day sounds a lot; it is exactly enough.", tr: "Yoğun kursu yaz tatilimde yaptım. Günde iki ders çok gibi geliyor; tam yetiyor." }, author: "Barış Ekinci", role: { en: "Intensive · automatic", tr: "Yoğun · otomatik" }, date: "2026-08-27" },
  { quote: { en: "The mock test on the real route was the best part. Nothing on the day surprised me.", tr: "Gerçek güzergâhtaki deneme sınavı en iyi kısmıydı. Sınav günü hiçbir şey beni şaşırtmadı." }, author: "Zeynep Kurt", role: { en: "Motorcycle A2", tr: "Motosiklet A2" }, date: "2026-10-05" },
];

export const faqs: { q: L; a: L }[] = [
  { q: { en: "How old do I need to be?", tr: "Kaç yaşında olmam gerekiyor?" }, a: { en: "You can start theory at 17 and a half; the driving test for a car (B) or an A2 motorcycle is from your 18th birthday.", tr: "Teoriye 17,5 yaşında başlayabilirsiniz; otomobil (B) ya da A2 motosiklet direksiyon sınavı 18 yaşınızdan itibaren." } },
  { q: { en: "Manual or automatic?", tr: "Manuel mi otomatik mi?" }, a: { en: "An automatic licence is quicker to get but only lets you drive automatics. If you might ever drive a manual car, learn manual.", tr: "Otomatik ehliyet daha hızlı alınır ama yalnızca otomatik araç kullanmanıza izin verir. Bir gün manuel araç kullanabilirseniz manuel öğrenin." } },
  { q: { en: "Can I pay in instalments?", tr: "Taksitle ödeyebilir miyim?" }, a: { en: "Yes: three equal monthly payments at no extra cost, or 5% off when you pay in full at sign-up.", tr: "Evet: ek ücret olmadan üç eşit aylık ödeme, ya da kayıtta tamamını öderseniz %5 indirim." } },
  { q: { en: "What happens if I fail?", tr: "Kalırsam ne olur?" }, a: { en: "Standard and Intensive include retake lessons. We book the next test date with you the same week.", tr: "Standart ve Yoğun kurslar tekrar dersi içerir. Bir sonraki sınav tarihini aynı hafta birlikte ayarlarız." } },
  { q: { en: "Can I switch course later?", tr: "Sonradan kurs değiştirebilir miyim?" }, a: { en: "You can upgrade at any time and pay only the difference. Unused lessons stay valid for 12 months.", tr: "İstediğiniz zaman üst kursa geçip yalnızca farkı ödeyebilirsiniz. Kullanılmayan dersler 12 ay geçerlidir." } },
];
