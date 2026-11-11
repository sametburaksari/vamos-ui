// Sample content for "Paperkite", a fictional children's clinic in Koşuyolu, Kadıköy.
// Every human-readable field is `{ en, tr }`. Names, fees and hours are invented.
// No medical claims: visit types, lengths, fees and what happens — never outcomes.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Kite coral. SiteShell derives the four accent variables and darkens the ink to ≥ 4.5:1. */
export const ACCENT = "#E8603C";

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const EMAIL = "hello@paperkite.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
export const longDate = (iso: string, locale: SiteLocale, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  createFormatter(intlOf(locale)).date(new Date(`${iso}T12:00:00`), opts);

/**
 * Illustration inks: token mixes only, so every drawing follows light/dark and the accent.
 * Pastels are a chart hue mixed into the surface; the outline is the text colour.
 */
export const ink = {
  line: "var(--fg)",
  paper: "var(--surface)",
  sky: "color-mix(in oklch, var(--chart-2) 16%, var(--surface))",
  cloud: "color-mix(in oklch, var(--surface) 92%, var(--chart-2))",
  sun: "color-mix(in oklch, var(--chart-3) 62%, var(--surface))",
  hill: "color-mix(in oklch, var(--chart-5) 34%, var(--surface))",
  hillDeep: "color-mix(in oklch, var(--chart-5) 58%, var(--surface))",
  kite: "var(--accent)",
  kiteSoft: "color-mix(in oklch, var(--accent) 40%, var(--surface))",
  berry: "color-mix(in oklch, var(--chart-6) 48%, var(--surface))",
  plum: "color-mix(in oklch, var(--chart-4) 42%, var(--surface))",
  blue: "color-mix(in oklch, var(--chart-2) 48%, var(--surface))",
  mint: "color-mix(in oklch, var(--chart-5) 26%, var(--surface))",
  sand: "color-mix(in oklch, var(--chart-3) 26%, var(--surface))",
  skin1: "color-mix(in oklch, var(--chart-3) 30%, var(--surface))",
  skin2: "color-mix(in oklch, var(--chart-3) 52%, var(--fg))",
  skin3: "color-mix(in oklch, var(--chart-3) 44%, var(--surface))",
  hair: "color-mix(in oklch, var(--fg) 78%, var(--chart-3))",
  coat: "var(--surface)",
  floor: "color-mix(in oklch, var(--chart-3) 14%, var(--surface))",
} as const;

// ------------------------------------------------------------------ services

export type ReasonId = "checkup" | "unwell" | "vaccine" | "newborn" | "allergy" | "forms";

export interface Service {
  id: ReasonId;
  name: L;
  text: L;
  minutes: number;
  fee: string;
  /** Fee note ("+ vaccine"). */
  note?: L;
  tone: keyof typeof ink;
}

export const services: Service[] = [
  { id: "checkup", name: { en: "Growing-up check-ups", tr: "Gelişim kontrolleri" }, text: { en: "Weight, height and head size on the wall chart, a talk about sleep, food and milestones.", tr: "Duvardaki çizelgede kilo, boy ve baş çevresi; uyku, beslenme ve gelişim üzerine sohbet." }, minutes: 30, fee: "1650", tone: "mint" },
  { id: "unwell", name: { en: "Unwell today", tr: "Bugün rahatsız" }, text: { en: "Fevers, coughs, tummy bugs and earaches. Six slots kept free every morning.", tr: "Ateş, öksürük, mide rahatsızlığı ve kulak ağrısı. Her sabah altı randevu boş tutulur." }, minutes: 20, fee: "1400", tone: "berry" },
  { id: "vaccine", name: { en: "Vaccine visits", tr: "Aşı ziyaretleri" }, text: { en: "Given by our nurse on the national schedule, with a check of the card first.", tr: "Ulusal takvime göre hemşiremiz yapar; önce aşı kartına birlikte bakarız." }, minutes: 15, fee: "750", note: { en: "+ vaccine, if private", tr: "+ aşı ücreti (özel ise)" }, tone: "blue" },
  { id: "newborn", name: { en: "First-week newborn visit", tr: "İlk hafta yenidoğan ziyareti" }, text: { en: "A long, unhurried first visit — at the clinic or at home within Kadıköy.", tr: "Uzun ve acelesiz ilk ziyaret — klinikte ya da Kadıköy içinde evde." }, minutes: 45, fee: "2400", tone: "sand" },
  { id: "allergy", name: { en: "Allergy & asthma clinic", tr: "Alerji ve astım polikliniği" }, text: { en: "Thursday afternoons with Dr Özerdem: inhaler technique, plans for school, follow-ups.", tr: "Perşembe öğleden sonraları Dr. Özerdem ile: inhaler tekniği, okul planı, kontroller." }, minutes: 40, fee: "2100", tone: "plum" },
  { id: "forms", name: { en: "School & sports forms", tr: "Okul ve spor formları" }, text: { en: "Nursery, school and swimming-club forms, signed the same day.", tr: "Kreş, okul ve yüzme kulübü formları, aynı gün imzalı." }, minutes: 15, fee: "900", tone: "sun" },
];
export const serviceById = (id: string) => services.find((s) => s.id === id) ?? services[0]!;

// ------------------------------------------------------------------ people

export type Hair = "bun" | "short" | "curly" | "bob";

export interface Doctor {
  id: string;
  name: string;
  title: L;
  role: L;
  focus: L;
  /** One line a child would like. */
  fact: L;
  days: L;
  hair: Hair;
  skin: "skin1" | "skin2" | "skin3";
  tone: keyof typeof ink;
}

export const doctors: Doctor[] = [
  { id: "arikan", name: "Defne Arıkan", title: { en: "Dr", tr: "Dr." }, role: { en: "Paediatrician, clinic lead", tr: "Çocuk hekimi, klinik sorumlusu" }, focus: { en: "Newborns · sleep · feeding", tr: "Yenidoğan · uyku · beslenme" }, fact: { en: "Keeps a ukulele in room 2.", tr: "2 numaralı odada bir ukulele saklar." }, days: { en: "Mon, Tue, Thu, Fri", tr: "Pzt, Sal, Per, Cum" }, hair: "bun", skin: "skin1", tone: "mint" },
  { id: "ozerdem", name: "Kaan Özerdem", title: { en: "Dr", tr: "Dr." }, role: { en: "Paediatrician", tr: "Çocuk hekimi" }, focus: { en: "Allergy & asthma clinic", tr: "Alerji ve astım" }, fact: { en: "Can name every dinosaur on the wallpaper.", tr: "Duvar kâğıdındaki tüm dinozorların adını bilir." }, days: { en: "Mon, Wed, Thu, Sat", tr: "Pzt, Çar, Per, Cmt" }, hair: "short", skin: "skin2", tone: "blue" },
  { id: "solak", name: "Mira Solak", title: { en: "Dr", tr: "Dr." }, role: { en: "Paediatrician", tr: "Çocuk hekimi" }, focus: { en: "Development · school age", tr: "Gelişim · okul çağı" }, fact: { en: "Draws a kite on every plaster.", tr: "Her yara bandına bir uçurtma çizer." }, days: { en: "Tue, Wed, Fri, Sun", tr: "Sal, Çar, Cum, Paz" }, hair: "curly", skin: "skin3", tone: "berry" },
  { id: "tan", name: "Hülya Tan", title: { en: "Nurse", tr: "Hemşire" }, role: { en: "Paediatric nurse", tr: "Çocuk hemşiresi" }, focus: { en: "Vaccines · growth checks", tr: "Aşılar · gelişim ölçümleri" }, fact: { en: "In charge of the sticker drawer.", tr: "Çıkartma çekmecesinin sorumlusu." }, days: { en: "Mon–Fri", tr: "Pzt–Cum" }, hair: "bob", skin: "skin1", tone: "sun" },
];

// ------------------------------------------------------------------ check-up path (signature)

export interface Stop {
  id: string;
  /** Age in months (0.5 = two weeks). */
  months: number;
  short: L;
  label: L;
  what: L;
  /** Usually a vaccine visit on the national schedule as well. */
  vaccine?: boolean;
}

export const stops: Stop[] = [
  { id: "w2", months: 0.5, short: { en: "2 wk", tr: "2 hf" }, label: { en: "Two-week check", tr: "İki hafta kontrolü" }, what: { en: "Weight back to birth weight? Feeding, jaundice and cord check, and a long chat about the first nights.", tr: "Doğum kilosuna dönüldü mü? Beslenme, sarılık ve göbek kontrolü; ilk geceler üzerine uzun bir sohbet." } },
  { id: "m1", months: 1, short: { en: "1 mo", tr: "1 ay" }, label: { en: "One month", tr: "Bir ay" }, what: { en: "Growth on the chart, hips and eyes, and how everyone at home is sleeping.", tr: "Çizelgede büyüme, kalça ve göz kontrolü; evde herkesin uykusu." }, vaccine: true },
  { id: "m2", months: 2, short: { en: "2 mo", tr: "2 ay" }, label: { en: "Two months", tr: "İki ay" }, what: { en: "First smiles, head control and the first vaccine visit with Nurse Hülya.", tr: "İlk gülümsemeler, baş kontrolü ve Hemşire Hülya ile ilk aşı ziyareti." }, vaccine: true },
  { id: "m4", months: 4, short: { en: "4 mo", tr: "4 ay" }, label: { en: "Four months", tr: "Dört ay" }, what: { en: "Rolling, reaching and grabbing; questions about starting solid food.", tr: "Dönme, uzanma ve kavrama; ek gıdaya geçiş soruları." }, vaccine: true },
  { id: "m6", months: 6, short: { en: "6 mo", tr: "6 ay" }, label: { en: "Six months", tr: "Altı ay" }, what: { en: "Sitting with support, first teeth, a plan for first foods.", tr: "Destekle oturma, ilk dişler, ilk yiyecekler için bir plan." }, vaccine: true },
  { id: "m9", months: 9, short: { en: "9 mo", tr: "9 ay" }, label: { en: "Nine months", tr: "Dokuz ay" }, what: { en: "Crawling and babbling, a hearing check and home safety for new explorers.", tr: "Emekleme ve agulama, işitme kontrolü ve yeni kâşifler için ev güvenliği." } },
  { id: "m12", months: 12, short: { en: "1 yr", tr: "1 yaş" }, label: { en: "First birthday", tr: "Birinci yaş" }, what: { en: "Standing, first words, a blood count if needed, and the one-year vaccines.", tr: "Ayakta durma, ilk kelimeler, gerekirse kan sayımı ve bir yaş aşıları." }, vaccine: true },
  { id: "m18", months: 18, short: { en: "18 mo", tr: "18 ay" }, label: { en: "Eighteen months", tr: "On sekiz ay" }, what: { en: "Walking, words and play — a short development questionnaire together.", tr: "Yürüme, kelimeler ve oyun — birlikte kısa bir gelişim anketi." }, vaccine: true },
  { id: "y2", months: 24, short: { en: "2 yr", tr: "2 yaş" }, label: { en: "Two years", tr: "İki yaş" }, what: { en: "Two-word sentences, running, teeth and the end of the bottle.", tr: "İki kelimelik cümleler, koşma, dişler ve biberona veda." } },
  { id: "y3", months: 36, short: { en: "3 yr", tr: "3 yaş" }, label: { en: "Three years", tr: "Üç yaş" }, what: { en: "Ready for nursery? Eyesight with the picture chart, and the nursery form signed.", tr: "Kreşe hazır mı? Resimli çizelgeyle göz kontrolü ve kreş formu imzası." } },
  { id: "y4", months: 48, short: { en: "4 yr", tr: "4 yaş" }, label: { en: "Four years", tr: "Dört yaş" }, what: { en: "Hearing and eyesight before school, and the pre-school vaccines.", tr: "Okul öncesi işitme ve göz kontrolü ile okul öncesi aşılar." }, vaccine: true },
  { id: "y6", months: 72, short: { en: "6 yr", tr: "6 yaş" }, label: { en: "Six years", tr: "Altı yaş" }, what: { en: "School starts: posture, eyesight, sleep and screen time, the school form.", tr: "Okul başlıyor: duruş, göz, uyku ve ekran süresi; okul formu." } },
  { id: "y9", months: 108, short: { en: "9 yr", tr: "9 yaş" }, label: { en: "Nine years", tr: "Dokuz yaş" }, what: { en: "Growth spurts, sport and the sports-club form, and a few minutes alone with the doctor.", tr: "Büyüme atakları, spor ve kulüp formu; doktorla birkaç dakika baş başa." } },
  { id: "y12", months: 144, short: { en: "12 yr", tr: "12 yaş" }, label: { en: "Twelve years", tr: "On iki yaş" }, what: { en: "Puberty questions answered plainly, and the adolescent vaccines.", tr: "Ergenlik soruları açıkça yanıtlanır ve ergen aşıları." }, vaccine: true },
];

/** `YYYY-MM-DD` + whole/half months (half = 15 days), clamped to the month's last day. */
export function addMonthsIso(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const whole = Math.floor(months);
  const date = new Date(Date.UTC(y, m - 1 + whole, 1));
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(d, last));
  if (months !== whole) date.setUTCDate(date.getUTCDate() + Math.round((months - whole) * 30));
  return date.toISOString().slice(0, 10);
}

// ------------------------------------------------------------------ storybook (visit page)

export type SceneId = "door" | "toy" | "scale" | "listen" | "ears" | "sticker";

export interface Scene {
  id: SceneId;
  title: L;
  story: L;
  grownUps: L;
}

export const scenes: Scene[] = [
  { id: "door", title: { en: "Hello at the blue door", tr: "Mavi kapıda merhaba" }, story: { en: "Sena at the desk knows your name before you say it. There is a kite on the ceiling — can you find the red one?", tr: "Danışmadaki Sena, sen söylemeden adını bilir. Tavanda uçurtmalar var — kırmızıyı bulabilir misin?" }, grownUps: { en: "Check-in takes two minutes. Bring the child’s ID card and vaccination card.", tr: "Kayıt iki dakika sürer. Çocuğun kimliğini ve aşı kartını getirin." } },
  { id: "toy", title: { en: "Bring a friend", tr: "Bir arkadaş getir" }, story: { en: "Teddy can come too. The doctor checks Teddy first, so you can see that nothing is scary.", tr: "Ayıcık da gelebilir. Doktor önce Ayıcık’a bakar; hiçbir şeyin korkutucu olmadığını görürsün." }, grownUps: { en: "A favourite toy really helps under-fives. Room 2 also has a basket of them.", tr: "Sevdiği bir oyuncak beş yaş altı çocuklarda gerçekten işe yarar. 2 numaralı odada da bir sepet var." } },
  { id: "scale", title: { en: "How tall is the giraffe?", tr: "Zürafa ne kadar uzun?" }, story: { en: "Stand next to the giraffe on the wall and stand very still on the scale. Shoes off!", tr: "Duvardaki zürafanın yanında dur, sonra tartıda kıpırdamadan bekle. Ayakkabılar çıkar!" }, grownUps: { en: "We plot weight and height on the chart and show you the line — no guessing.", tr: "Kilo ve boyu çizelgeye işler, çizgiyi size gösteririz — tahmin yok." } },
  { id: "listen", title: { en: "Listening to your heart", tr: "Kalbini dinliyoruz" }, story: { en: "The stethoscope is cold for one second. Then you can listen to the doctor’s heart too.", tr: "Steteskop bir saniye soğuktur. Sonra sen de doktorun kalbini dinleyebilirsin." }, grownUps: { en: "Babies can stay on your lap for most of the check. Ask for a break any time.", tr: "Bebekler muayenenin çoğunda kucağınızda kalabilir. İstediğiniz an ara verebiliriz." } },
  { id: "ears", title: { en: "A torch for your ears", tr: "Kulaklar için fener" }, story: { en: "A tiny torch looks for anything hiding in your ears. It doesn’t touch. It just looks.", tr: "Minik bir fener kulaklarında saklanan bir şey var mı diye bakar. Dokunmaz. Sadece bakar." }, grownUps: { en: "We explain every step to your child first, in words they understand.", tr: "Her adımı önce çocuğunuza, anlayacağı kelimelerle anlatırız." } },
  { id: "sticker", title: { en: "Sticker drawer!", tr: "Çıkartma çekmecesi!" }, story: { en: "Nurse Hülya opens the sticker drawer. Kites, foxes or dinosaurs — you choose.", tr: "Hemşire Hülya çıkartma çekmecesini açar. Uçurtma, tilki ya da dinozor — sen seç." }, grownUps: { en: "Notes and any results reach your Paperkite account the same evening.", tr: "Notlar ve sonuçlar aynı akşam Paperkite hesabınıza düşer." } },
];

// ------------------------------------------------------------------ place

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "08:30", close: "19:30" }],
    tue: [{ open: "08:30", close: "19:30" }],
    wed: [{ open: "08:30", close: "19:30" }],
    thu: [{ open: "08:30", close: "19:30" }],
    fri: [{ open: "08:30", close: "19:30" }],
    sat: [{ open: "09:00", close: "15:00" }],
    sun: [{ open: "10:00", close: "13:00" }],
  },
};

// A neutral street-map preview for the map facade (rendered greyscale by the block).
const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f4f4f2'/>" +
  "<g fill='#e6e6e2'>" +
  Array.from({ length: 42 }, (_, i) => `<rect x='${(i % 7) * 172 + 14}' y='${Math.floor(i / 7) * 150 + 14}' width='150' height='124' rx='10'/>`).join("") +
  "</g><g fill='none' stroke='#ffffff' stroke-width='24' stroke-linecap='round'><path d='M-20 300 C300 360 700 240 1220 320'/><path d='M520 -20 V920'/><path d='M-20 760 H1220'/></g>" +
  "<circle cx='600' cy='470' r='70' fill='#d6dcd9'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Paperkite Children’s Clinic",
    address: { line: "Çınarlı Sokak 12", district: "Koşuyolu Mahallesi", city: "Kadıköy", region: "İstanbul", postalCode: "34718", country: "TR", geo: { lat: 41.0062, lng: 29.0441 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({ en: "Ground floor, pram-friendly ramp, baby-change and a quiet feeding room. Two short-stay parking spaces for families at the door.", tr: "Zemin kat, bebek arabasına uygun rampa, alt değiştirme ve sessiz emzirme odası. Kapıda ailelere ayrılmış iki kısa süreli park yeri." }),
  };
}

/** Deterministic demo availability: about two in three slots are free. Sundays are unwell-only mornings. */
export function slotsFor(day: string, minutes: number): { start: string; available: boolean }[] {
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
  const [open, close] = dow === 0 ? [10 * 60, 13 * 60] : dow === 6 ? [9 * 60, 15 * 60] : [8 * 60 + 30, 19 * 60 + 30];
  const step = minutes <= 20 ? 20 : 30;
  const seed = Number(day.slice(8, 10)) + minutes;
  const out: { start: string; available: boolean }[] = [];
  for (let m = open, i = 0; m + minutes <= close; m += step, i++) {
    if (m >= 12 * 60 + 30 && m < 13 * 60 + 30 && dow !== 0 && dow !== 6) continue; // lunch
    out.push({ start: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`, available: (seed * 7 + i * 5) % 3 !== 0 });
  }
  return out;
}
