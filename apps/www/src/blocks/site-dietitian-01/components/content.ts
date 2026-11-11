// Sample content for "Greenplate Nutrition", a fictional dietitian practice in Ataşehir, İstanbul.
// Every human-readable field is `{ en, tr }`. No weight-loss promises, no before/after, no cures —
// programmes, sessions, prices, people and how health data is handled.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Olive from the plan; SiteShell derives the four accent variables (contrast-checked). */
export const ACCENT = "#65A30D";

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const EMAIL = "hello@greenplate.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  bowl: { ...unsplash("1512621776951-a57141f2eefd", 1400, 1400), focal: { x: 0.5, y: 0.5 }, alt: { en: "A bowl of greens, avocado, chickpeas, tomatoes and sweet potato seen from above", tr: "Yukarıdan görülen yeşillik, avokado, nohut, domates ve tatlı patatesli bir kase" } },
  prep: { ...unsplash("1498837167922-ddd27525d352", 1600, 1067), alt: { en: "Trays of chopped vegetables, beans and herbs laid out for meal prep", tr: "Hazırlık için dizilmiş doğranmış sebze, fasulye ve ot tepsileri" } },
  jar: { ...unsplash("1505576399279-565b52d4ac71", 1200, 1500), alt: { en: "A jar salad layered with grains, tomatoes and greens on a wooden table", tr: "Ahşap masada tahıl, domates ve yeşillikle katmanlanmış bir kavanoz salata" } },
};

// ---------------------------------------------------------------- goals → programmes (the signature)

export type GoalId = "weight" | "sport" | "gut" | "pregnancy" | "plant" | "family";
export const GOALS: GoalId[] = ["weight", "sport", "gut", "pregnancy", "plant", "family"];

export type Support = "light" | "standard" | "close";
export const SUPPORTS: Support[] = ["light", "standard", "close"];
export type Mode = "clinic" | "online";

export interface Goal {
  id: GoalId;
  label: L;
  /** One line under the label. */
  hint: L;
  /** Recommended programme, then an alternative. */
  programmes: [ProgrammeId, ProgrammeId];
}

export const goals: Record<GoalId, Goal> = {
  weight: { id: "weight", label: { en: "Change my weight, steadily", tr: "Kilomu yavaş yavaş değiştirmek" }, hint: { en: "No crash diets, no banned foods", tr: "Şok diyet yok, yasak yiyecek yok" }, programmes: ["steady", "kickstart"] },
  sport: { id: "sport", label: { en: "Fuel training and races", tr: "Antrenman ve yarışlara enerji" }, hint: { en: "Runners, cyclists, swimmers, team sports", tr: "Koşucular, bisikletçiler, yüzücüler, takım sporları" }, programmes: ["performance", "kickstart"] },
  gut: { id: "gut", label: { en: "Calmer digestion", tr: "Daha rahat sindirim" }, hint: { en: "After your doctor has ruled things out", tr: "Hekiminiz diğer nedenleri dışladıktan sonra" }, programmes: ["gut", "kickstart"] },
  pregnancy: { id: "pregnancy", label: { en: "Pregnancy and breastfeeding", tr: "Gebelik ve emzirme" }, hint: { en: "From planning to the first year", tr: "Planlamadan ilk yıla" }, programmes: ["bump", "kickstart"] },
  plant: { id: "plant", label: { en: "Eat more plants, safely", tr: "Daha bitkisel, güvenle" }, hint: { en: "Vegetarian, vegan or just curious", tr: "Vejetaryen, vegan ya da sadece meraklı" }, programmes: ["plant", "steady"] },
  family: { id: "family", label: { en: "Feed the whole family", tr: "Tüm aileyi beslemek" }, hint: { en: "Picky eaters, busy weeknights", tr: "Seçici çocuklar, yoğun hafta içi akşamları" }, programmes: ["family", "kickstart"] },
};

export type ProgrammeId = "kickstart" | "steady" | "performance" | "gut" | "bump" | "plant" | "family";

export interface Programme {
  id: ProgrammeId;
  name: L;
  summary: L;
  /** Standard tier. */
  weeks: number;
  sessions: number;
  price: number;
  includes: L[];
}

export const programmes: Record<ProgrammeId, Programme> = {
  kickstart: {
    id: "kickstart",
    name: { en: "Kickstart", tr: "Başlangıç" },
    summary: { en: "A first look at how you eat now, and three changes to try.", tr: "Şu anki beslenmenize ilk bakış ve denenecek üç değişiklik." },
    weeks: 4,
    sessions: 3,
    price: 4900,
    includes: [
      { en: "60-minute first consultation", tr: "60 dakikalık ilk görüşme" },
      { en: "A one-page plan, not a diet sheet", tr: "Diyet listesi değil, tek sayfalık bir plan" },
      { en: "Food diary review", tr: "Beslenme günlüğü değerlendirmesi" },
    ],
  },
  steady: {
    id: "steady",
    name: { en: "Steady", tr: "İstikrar" },
    summary: { en: "Twelve weeks of small, kept habits, measured without obsessing.", tr: "On iki hafta boyunca küçük ama sürdürülen alışkanlıklar; takıntısız ölçüm." },
    weeks: 12,
    sessions: 6,
    price: 13500,
    includes: [
      { en: "Body-composition scan at each visit", tr: "Her ziyarette vücut analizi" },
      { en: "Weekly menu built around your shopping", tr: "Alışverişinize göre haftalık menü" },
      { en: "Weekday messages with your dietitian", tr: "Hafta içi diyetisyeninizle mesajlaşma" },
    ],
  },
  performance: {
    id: "performance",
    name: { en: "Performance", tr: "Performans" },
    summary: { en: "Training-day and race-day fuelling, planned around your calendar.", tr: "Takviminize göre planlanan antrenman günü ve yarış günü beslenmesi." },
    weeks: 16,
    sessions: 8,
    price: 18900,
    includes: [
      { en: "Sweat-rate test and hydration plan", tr: "Terleme hızı testi ve sıvı planı" },
      { en: "Race-week menu and gel schedule", tr: "Yarış haftası menüsü ve jel planı" },
      { en: "Review with your coach, if you like", tr: "İsterseniz antrenörünüzle ortak değerlendirme" },
    ],
  },
  gut: {
    id: "gut",
    name: { en: "Gut Reset", tr: "Bağırsak Dengesi" },
    summary: { en: "A guided low-FODMAP elimination and a careful, food-by-food reintroduction.", tr: "Rehberli düşük FODMAP eleme dönemi ve yiyecek yiyecek dikkatli yeniden ekleme." },
    weeks: 10,
    sessions: 5,
    price: 11800,
    includes: [
      { en: "Three-phase plan with shopping lists", tr: "Alışveriş listeli üç aşamalı plan" },
      { en: "Symptom diary in the Greenplate app", tr: "Greenplate uygulamasında belirti günlüğü" },
      { en: "Letter to your doctor at the end", tr: "Sonunda hekiminize bir mektup" },
    ],
  },
  bump: {
    id: "bump",
    name: { en: "Bump & Beyond", tr: "Gebelik ve Sonrası" },
    summary: { en: "Six visits spread from the first trimester to six months after birth.", tr: "İlk üç aydan doğumdan sonraki altıncı aya yayılan altı ziyaret." },
    weeks: 52,
    sessions: 6,
    price: 12600,
    includes: [
      { en: "Trimester-by-trimester menus", tr: "Üç aylık dönemlere göre menüler" },
      { en: "Breastfeeding and first-foods session", tr: "Emzirme ve ek gıdaya geçiş görüşmesi" },
      { en: "Partner welcome at every visit", tr: "Her ziyarette eşinize de yer var" },
    ],
  },
  plant: {
    id: "plant",
    name: { en: "Plant Start", tr: "Bitkisel Başlangıç" },
    summary: { en: "Protein, iron and B12 covered, with recipes you will actually cook.", tr: "Protein, demir ve B12 güvence altında; gerçekten pişireceğiniz tariflerle." },
    weeks: 6,
    sessions: 3,
    price: 7200,
    includes: [
      { en: "Blood-test review with your GP’s results", tr: "Aile hekiminizin tahlil sonuçlarının değerlendirmesi" },
      { en: "A 21-recipe starter book", tr: "21 tarifli başlangıç kitapçığı" },
      { en: "Supermarket walk-through (Saturdays)", tr: "Market turu (cumartesi)" },
    ],
  },
  family: {
    id: "family",
    name: { en: "Family Table", tr: "Aile Sofrası" },
    summary: { en: "One menu for everyone, from toddlers to grandparents.", tr: "Küçük çocuklardan büyükanne ve büyükbabalara herkes için tek menü." },
    weeks: 8,
    sessions: 4,
    price: 9400,
    includes: [
      { en: "Sessions for the whole household", tr: "Tüm hane için görüşmeler" },
      { en: "Lunchbox and snack ideas for school", tr: "Okul için beslenme çantası ve ara öğün fikirleri" },
      { en: "Picky-eater steps that avoid fights", tr: "Seçici çocuklar için kavgasız adımlar" },
    ],
  },
};

export const supportNames: Record<Support, { label: L; hint: L }> = {
  light: { label: { en: "Light", tr: "Hafif" }, hint: { en: "Fewer visits, more on your own", tr: "Daha az ziyaret, daha çok kendi başınıza" } },
  standard: { label: { en: "Standard", tr: "Standart" }, hint: { en: "What most people choose", tr: "Çoğu kişinin seçtiği" } },
  close: { label: { en: "Close", tr: "Yakın" }, hint: { en: "Extra visits and weekend messages", tr: "Ek ziyaretler ve hafta sonu mesajları" } },
};

/** The plan a goal + support + mode works out to. Online is 10% less; tiers change visits and price. */
export function planFor(id: ProgrammeId, support: Support, mode: Mode) {
  const p = programmes[id];
  const sessions = support === "light" ? Math.max(2, p.sessions - 2) : support === "close" ? p.sessions + 2 : p.sessions;
  const factor = support === "light" ? 0.72 : support === "close" ? 1.3 : 1;
  const raw = p.price * factor * (mode === "online" ? 0.9 : 1);
  const price = Math.round(raw / 100) * 100;
  // Spread the visits over the weeks: first in week 1, the rest evenly up to the last week.
  const weeksWithVisit = Array.from({ length: sessions }, (_, i) => (sessions === 1 ? 1 : Math.round(1 + (i * (p.weeks - 1)) / (sessions - 1))));
  return { programme: p, sessions, price, perWeek: Math.round(price / p.weeks), weeks: p.weeks, weeksWithVisit };
}

// ---------------------------------------------------------------- people

export interface Dietitian {
  id: string;
  name: string;
  role: L;
  focus: L;
  photo: { src: string; width: number; height: number; alt: L };
}

export const team: Dietitian[] = [
  { id: "kaya", name: "Derya Kaya", role: { en: "Registered dietitian, founder", tr: "Diyetisyen, kurucu" }, focus: { en: "Sports nutrition · endurance", tr: "Sporcu beslenmesi · dayanıklılık" }, photo: { ...unsplash("1494790108377-be9c29b29330", 800, 1000), alt: { en: "Derya Kaya smiling, in a red jumper", tr: "Kırmızı kazaklı, gülümseyen Derya Kaya" } } },
  { id: "sahin", name: "Emre Şahin", role: { en: "Registered dietitian", tr: "Diyetisyen" }, focus: { en: "Digestive health · plant-based", tr: "Sindirim sağlığı · bitkisel beslenme" }, photo: { ...unsplash("1507003211169-0a1dd7228f2d", 800, 1000), alt: { en: "Emre Şahin in a white T-shirt, smiling", tr: "Beyaz tişörtlü, gülümseyen Emre Şahin" } } },
  { id: "oral", name: "Merve Oral", role: { en: "Registered dietitian", tr: "Diyetisyen" }, focus: { en: "Pregnancy · children · families", tr: "Gebelik · çocuklar · aileler" }, photo: { ...unsplash("1580489944761-15a19d654956", 800, 1000), alt: { en: "Merve Oral, dark hair tied up, against a white wall", tr: "Saçları toplu Merve Oral, beyaz bir duvarın önünde" } } },
];

// ---------------------------------------------------------------- booking

/** Free first-consultation times shown in the booking form (same every week, 24-hour clock). */
export const SLOTS = ["09:00", "10:30", "12:00", "14:30", "16:00", "18:30"];

// ---------------------------------------------------------------- place

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "08:30", close: "19:30" }],
    tue: [{ open: "08:30", close: "19:30" }],
    wed: [{ open: "08:30", close: "19:30" }],
    thu: [{ open: "08:30", close: "19:30" }],
    fri: [{ open: "08:30", close: "18:00" }],
    sat: [{ open: "09:00", close: "14:00" }],
    sun: [],
  },
};

const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f3f4f0'/>" +
  "<g fill='#e5e8df'>" +
  Array.from({ length: 24 }, (_, i) => `<rect x='${(i % 6) * 200 + 16}' y='${Math.floor(i / 6) * 220 + 16}' width='168' height='190' rx='6'/>`).join("") +
  "</g><path d='M-20 450 L1220 430' fill='none' stroke='#ffffff' stroke-width='30'/>" +
  "<path d='M610 -20 L590 920' fill='none' stroke='#ffffff' stroke-width='18'/>" +
  "<circle cx='300' cy='700' r='90' fill='#dde5d3'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Greenplate Nutrition",
    address: { line: "Kardelen Caddesi 18, Kat 4", district: "Barbaros Mahallesi", city: "Ataşehir", region: "İstanbul", postalCode: "34746", country: "TR", geo: { lat: 40.9923, lng: 29.1244 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({ en: "Fourth floor, lift from the car park (first hour free). Five minutes’ walk from the metro.", tr: "Dördüncü kat, otoparktan asansör (ilk saat ücretsiz). Metroya beş dakika yürüme mesafesi." }),
  };
}
