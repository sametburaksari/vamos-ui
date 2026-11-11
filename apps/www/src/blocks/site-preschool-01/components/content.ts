// Sample content for "Little Orchard", a fictional bilingual preschool in Suadiye, Kadıköy.
// Every human-readable field is `{ en, tr }`. Names, prices and dates are invented.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Sky from the plan; SiteShell darkens the ink so text on light surfaces stays ≥ 4.5:1. */
export const ACCENT = "#38BDF8";

export const PHONE = "+902160000000";
export const EMAIL = "office@littleorchard.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
export const longDate = (iso: string, locale: SiteLocale, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  new Intl.DateTimeFormat(intlOf(locale), { ...opts, timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  paint: { ...unsplash("1503454537195-1dcabb73ffb9", 1200, 1500), focal: { x: 0.55, y: 0.4 }, alt: { en: "A laughing girl with paint on her cheeks", tr: "Yanakları boyalı, gülen bir kız çocuğu" } },
  reading: { ...unsplash("1544776193-352d25ca82cd", 1400, 1050), alt: { en: "Two children reading a picture book at a yellow table", tr: "Sarı bir masada resimli kitap okuyan iki çocuk" } },
  camera: { ...unsplash("1516627145497-ae6968895b74", 1200, 1500), alt: { en: "A toddler holding a toy camera in the playroom", tr: "Oyun odasında oyuncak fotoğraf makinesi tutan küçük bir çocuk" } },
  crayons: { ...unsplash("1596464716127-f2a82984de30", 1400, 1050), alt: { en: "Crayons, paints and a half-finished drawing on a wooden table", tr: "Ahşap bir masada boya kalemleri, boyalar ve yarım kalmış bir resim" } },
  blocks: { ...unsplash("1484820540004-14229fe36ca4", 1200, 1500), alt: { en: "A tower of painted wooden alphabet blocks", tr: "Boyalı ahşap harf bloklarından bir kule" } },
  garden: { ...unsplash("1503919005314-30d93d07d823", 1400, 1050), alt: { en: "A boy watching deer through a fence on a nature walk", tr: "Doğa yürüyüşünde çitin ardından geyikleri izleyen bir çocuk" } },
};

// ---------------------------------------------------------------- groups

export type GroupId = "sprouts" | "saplings" | "orchard";
export const GROUPS: GroupId[] = ["sprouts", "saplings", "orchard"];

export interface Group {
  id: GroupId;
  name: L;
  ages: L;
  /** Age range in whole months at the start of the school year. */
  months: [number, number];
  size: number;
  adults: number;
  room: L;
  focus: L;
}

export const groups: Record<GroupId, Group> = {
  sprouts: { id: "sprouts", name: { en: "Sprouts", tr: "Filizler" }, ages: { en: "2–3 years", tr: "2–3 yaş" }, months: [24, 35], size: 10, adults: 3, room: { en: "Ground floor, opening onto the sand garden", tr: "Zemin kat, kum bahçesine açılıyor" }, focus: { en: "Settling in, first words in two languages, toilet learning at each child’s pace.", tr: "Uyum, iki dilde ilk kelimeler, her çocuğun kendi hızında tuvalet eğitimi." } },
  saplings: { id: "saplings", name: { en: "Saplings", tr: "Fidanlar" }, ages: { en: "3–4 years", tr: "3–4 yaş" }, months: [36, 47], size: 14, adults: 2, room: { en: "First floor, the long room with the reading loft", tr: "Birinci kat, okuma çatısı olan uzun oda" }, focus: { en: "Projects that last a week, songs in English, clay and the first real friendships.", tr: "Bir hafta süren projeler, İngilizce şarkılar, kil ve ilk gerçek arkadaşlıklar." } },
  orchard: { id: "orchard", name: { en: "Orchard", tr: "Bahçe" }, ages: { en: "5–6 years", tr: "5–6 yaş" }, months: [48, 72], size: 16, adults: 2, room: { en: "Top floor, with the science corner and the roof terrace", tr: "En üst kat; fen köşesi ve çatı terasıyla" }, focus: { en: "The year before school: early reading, numbers, and doing things on their own.", tr: "Okuldan önceki yıl: okumaya giriş, sayılar ve işlerini kendi başına yapmak." } },
};

/** Which group a child joins in September 2027, from the date of birth. */
export function groupFor(dob: string, start = "2027-09-01"): GroupId | null {
  const [y, m] = dob.split("-").map(Number);
  const [sy, sm] = start.split("-").map(Number);
  if (!y || !m || !sy || !sm) return null;
  const months = (sy - y) * 12 + (sm - m);
  if (months < 24 || months > 72) return null;
  return months < 36 ? "sprouts" : months < 48 ? "saplings" : "orchard";
}

// ---------------------------------------------------------------- daily rhythm (the signature)

export type Kind = "care" | "play" | "learn" | "outdoor" | "rest" | "meal";

export const kindNames: Record<Kind, L> = {
  care: { en: "Arrival & home time", tr: "Geliş ve eve dönüş" },
  play: { en: "Free play", tr: "Serbest oyun" },
  learn: { en: "Learning together", tr: "Birlikte öğrenme" },
  outdoor: { en: "Outdoors", tr: "Açık havada" },
  rest: { en: "Rest", tr: "Dinlenme" },
  meal: { en: "Meals", tr: "Yemek" },
};

export interface Block {
  start: string;
  end: string;
  kind: Kind;
  title: L;
  detail: L;
  /** Who leads it. */
  lead: string;
}

const b = (start: string, end: string, kind: Kind, title: L, detail: L, lead: string): Block => ({ start, end, kind, title, detail, lead });

export const rhythm: Record<GroupId, Block[]> = {
  sprouts: [
    b("08:00", "09:00", "care", { en: "Arrival & free play", tr: "Geliş ve serbest oyun" }, { en: "A slow start: parents can stay for ten minutes, and every child is greeted by name at the door.", tr: "Yavaş bir başlangıç: aileler on dakika kalabilir, her çocuk kapıda adıyla karşılanır." }, "Elif Aras"),
    b("09:00", "09:30", "meal", { en: "Breakfast", tr: "Kahvaltı" }, { en: "Cheese, olives, eggs or porridge, seasonal fruit. Cooked downstairs every morning.", tr: "Peynir, zeytin, yumurta ya da lapa, mevsim meyvesi. Her sabah alt katta hazırlanır." }, "Kitchen"),
    b("09:30", "10:00", "learn", { en: "Morning circle", tr: "Sabah çemberi" }, { en: "Songs in Turkish and English, the weather board, and who is here today.", tr: "Türkçe ve İngilizce şarkılar, hava durumu panosu ve bugün kim var." }, "Elif Aras"),
    b("10:00", "11:15", "outdoor", { en: "Sand garden & sensory play", tr: "Kum bahçesi ve duyu oyunu" }, { en: "Water trays, sand, mud kitchen. Waterproofs are provided; please send spare socks.", tr: "Su tepsileri, kum, çamur mutfağı. Yağmurluklar bizden; lütfen yedek çorap gönderin." }, "Can Dalgıç"),
    b("11:15", "12:00", "learn", { en: "Stories & music", tr: "Hikâye ve müzik" }, { en: "Picture books, shakers and drums, one short story read twice.", tr: "Resimli kitaplar, marakas ve davullar, iki kez okunan kısa bir hikâye." }, "Elif Aras"),
    b("12:00", "12:45", "meal", { en: "Lunch", tr: "Öğle yemeği" }, { en: "Soup, a main and yoghurt. Children serve themselves from small jugs.", tr: "Çorba, ana yemek ve yoğurt. Çocuklar küçük sürahilerden kendileri servis yapar." }, "Kitchen"),
    b("12:45", "14:45", "rest", { en: "Nap", tr: "Uyku" }, { en: "Each child has their own cot and blanket. Those who wake early read quietly with an adult.", tr: "Her çocuğun kendi yatağı ve battaniyesi var. Erken uyananlar bir yetişkinle sessizce kitap okur." }, "Ayşe Nur Tekin"),
    b("14:45", "15:15", "meal", { en: "Snack", tr: "Ara öğün" }, { en: "Fruit, bread sticks and milk or ayran.", tr: "Meyve, galeta ve süt ya da ayran." }, "Kitchen"),
    b("15:15", "16:30", "play", { en: "Messy art", tr: "Kirli sanat" }, { en: "Finger paint, dough and collage. It goes home in a named folder on Fridays.", tr: "Parmak boya, oyun hamuru ve kolaj. Cuma günleri isimli bir dosyayla eve gider." }, "Can Dalgıç"),
    b("16:30", "17:30", "care", { en: "Garden & home time", tr: "Bahçe ve eve dönüş" }, { en: "Pick-up from the garden gate; a teacher tells you one thing about the day.", tr: "Bahçe kapısından teslim; bir öğretmen günden bir şey anlatır." }, "Elif Aras"),
  ],
  saplings: [
    b("08:00", "08:45", "care", { en: "Arrival & free play", tr: "Geliş ve serbest oyun" }, { en: "Puzzles, the building corner and the reading loft while friends arrive.", tr: "Arkadaşlar gelirken yapbozlar, inşa köşesi ve okuma çatısı." }, "Defne Kılıç"),
    b("08:45", "09:15", "meal", { en: "Breakfast", tr: "Kahvaltı" }, { en: "A Turkish breakfast with a different child helping to lay the table each day.", tr: "Her gün başka bir çocuğun sofrayı kurmaya yardım ettiği Türk kahvaltısı." }, "Kitchen"),
    b("09:15", "09:45", "learn", { en: "Circle & calendar", tr: "Çember ve takvim" }, { en: "The day, the date and the plan, in both languages.", tr: "Gün, tarih ve plan; iki dilde." }, "Defne Kılıç"),
    b("09:45", "11:00", "learn", { en: "Project time (in English)", tr: "Proje zamanı (İngilizce)" }, { en: "One topic for a week — this term: bridges, bees and bread.", tr: "Bir hafta boyunca tek konu — bu dönem: köprüler, arılar ve ekmek." }, "Laura Hale"),
    b("11:00", "12:00", "outdoor", { en: "Garden", tr: "Bahçe" }, { en: "Climbing frame, bikes, and the vegetable beds the children planted in October.", tr: "Tırmanma iskelesi, bisikletler ve çocukların ekimde diktiği sebze tarhları." }, "Mert Uysal"),
    b("12:00", "12:45", "meal", { en: "Lunch", tr: "Öğle yemeği" }, { en: "Children serve themselves and clear their own plates.", tr: "Çocuklar kendi tabaklarını doldurur ve kaldırır." }, "Kitchen"),
    b("12:45", "14:00", "rest", { en: "Quiet hour", tr: "Sessiz saat" }, { en: "Sleep for those who need it; audiobooks and drawing on mats for the rest.", tr: "İhtiyacı olana uyku; diğerlerine minderlerde sesli kitap ve resim." }, "Defne Kılıç"),
    b("14:00", "15:00", "learn", { en: "Workshops", tr: "Atölyeler" }, { en: "Music on Monday and Wednesday, clay on Tuesday, movement on Thursday, cooking on Friday.", tr: "Pazartesi ve çarşamba müzik, salı kil, perşembe hareket, cuma mutfak." }, "Mert Uysal"),
    b("15:00", "15:30", "meal", { en: "Snack", tr: "Ara öğün" }, { en: "Fruit and something baked in Friday’s cooking workshop.", tr: "Meyve ve cuma mutfak atölyesinde pişen bir şey." }, "Kitchen"),
    b("15:30", "16:30", "learn", { en: "Library & stories", tr: "Kütüphane ve hikâyeler" }, { en: "Each child borrows one book a week to take home.", tr: "Her çocuk haftada bir kitabı eve ödünç götürür." }, "Laura Hale"),
    b("16:30", "17:30", "care", { en: "Free play & home time", tr: "Serbest oyun ve eve dönüş" }, { en: "Pick-up from the classroom, with a photo of the day on the parents’ app.", tr: "Sınıftan teslim; günün fotoğrafı veli uygulamasında." }, "Defne Kılıç"),
  ],
  orchard: [
    b("08:00", "08:30", "care", { en: "Arrival", tr: "Geliş" }, { en: "Children hang up their own coats and choose a morning job.", tr: "Çocuklar montlarını kendileri asar ve bir sabah görevi seçer." }, "Barış Ekinci"),
    b("08:30", "09:00", "meal", { en: "Breakfast", tr: "Kahvaltı" }, { en: "Breakfast club: children pour, spread and wash up.", tr: "Kahvaltı kulübü: çocuklar doldurur, sürer ve bulaşığı yıkar." }, "Kitchen"),
    b("09:00", "09:30", "learn", { en: "Morning meeting", tr: "Sabah toplantısı" }, { en: "Plans, news from home, and one question the class wants to answer this week.", tr: "Planlar, evden haberler ve sınıfın bu hafta yanıtlamak istediği bir soru." }, "Barış Ekinci"),
    b("09:30", "10:30", "learn", { en: "Letters & numbers", tr: "Harfler ve sayılar" }, { en: "Phonics games, counting with real objects, writing their own names.", tr: "Ses oyunları, gerçek nesnelerle sayma, kendi adlarını yazma." }, "Barış Ekinci"),
    b("10:30", "11:15", "outdoor", { en: "Roof terrace", tr: "Çatı terası" }, { en: "Running, skipping ropes and the weather station they read every day.", tr: "Koşu, atlama ipi ve her gün okudukları hava istasyonu." }, "Mert Uysal"),
    b("11:15", "12:15", "learn", { en: "Science & making", tr: "Fen ve tasarım" }, { en: "Magnets, seeds, ramps and things that float. Hands first, words second.", tr: "Mıknatıslar, tohumlar, rampalar ve yüzen şeyler. Önce eller, sonra kelimeler." }, "Laura Hale"),
    b("12:15", "13:00", "meal", { en: "Lunch", tr: "Öğle yemeği" }, { en: "Family-style tables with a teacher at each.", tr: "Her masada bir öğretmenle aile usulü sofralar." }, "Kitchen"),
    b("13:00", "13:45", "rest", { en: "Quiet reading", tr: "Sessiz okuma" }, { en: "Books, cushions and the lights down low. No naps unless a child asks.", tr: "Kitaplar, minderler ve kısık ışık. Çocuk istemedikçe uyku yok." }, "Barış Ekinci"),
    b("13:45", "14:45", "learn", { en: "English club", tr: "İngilizce kulübü" }, { en: "Games, songs and a puppet called Pip who only speaks English.", tr: "Oyunlar, şarkılar ve yalnızca İngilizce konuşan Pip adlı bir kukla." }, "Laura Hale"),
    b("14:45", "15:15", "meal", { en: "Snack", tr: "Ara öğün" }, { en: "Fruit, cheese toast and water.", tr: "Meyve, peynirli tost ve su." }, "Kitchen"),
    b("15:15", "16:15", "play", { en: "Movement & dance", tr: "Hareket ve dans" }, { en: "In the hall downstairs: balance, rhythm and a lot of noise.", tr: "Alt kattaki salonda: denge, ritim ve bolca ses." }, "Mert Uysal"),
    b("16:15", "17:30", "care", { en: "Journals & home time", tr: "Günlükler ve eve dönüş" }, { en: "Each child draws one thing from the day in their journal before pick-up.", tr: "Her çocuk eve dönmeden önce günden bir şeyi günlüğüne çizer." }, "Barış Ekinci"),
  ],
};

export const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
export const DAY_START = toMin("08:00");
export const DAY_END = toMin("17:30");

// ---------------------------------------------------------------- fees, term dates, team

export type PlanId = "full5" | "full3" | "half5";
export interface Plan {
  id: PlanId;
  name: L;
  hours: L;
  monthly: number;
}
export const plans: Plan[] = [
  { id: "full5", name: { en: "Full days, five a week", tr: "Tam gün, haftada beş" }, hours: { en: "Mon–Fri 08:00–17:30", tr: "Pzt–Cum 08:00–17:30" }, monthly: 32500 },
  { id: "full3", name: { en: "Full days, three a week", tr: "Tam gün, haftada üç" }, hours: { en: "Mon, Wed, Fri 08:00–17:30", tr: "Pzt, Çar, Cum 08:00–17:30" }, monthly: 23800 },
  { id: "half5", name: { en: "Mornings, five a week", tr: "Yarım gün, haftada beş" }, hours: { en: "Mon–Fri 08:00–12:45, with lunch", tr: "Pzt–Cum 08:00–12:45, öğle yemeği dahil" }, monthly: 21000 },
];
export const REGISTRATION = 7500;
export const SIBLING_DISCOUNT = 0.1;

export const terms: { name: L; from: string; to: string; note?: L }[] = [
  { name: { en: "Autumn term", tr: "Güz dönemi" }, from: "2026-09-07", to: "2027-01-22", note: { en: "Half-term break 16–20 November", tr: "Ara tatil 16–20 Kasım" } },
  { name: { en: "Winter break", tr: "Kış tatili" }, from: "2027-01-25", to: "2027-02-05", note: { en: "Holiday club open, 3.900 ₺ a week", tr: "Tatil kulübü açık, haftalık 3.900 ₺" } },
  { name: { en: "Spring term", tr: "Bahar dönemi" }, from: "2027-02-08", to: "2027-06-25", note: { en: "Closed 19–21 March and 1 May", tr: "19–21 Mart ve 1 Mayıs kapalı" } },
  { name: { en: "Summer club", tr: "Yaz kulübü" }, from: "2027-07-05", to: "2027-08-06", note: { en: "Mornings only, booked by the week", tr: "Yalnızca sabahları, haftalık kayıt" } },
];

export const openMornings = ["2026-11-21", "2026-12-05", "2027-01-16", "2027-02-20"];

export const teachers = [
  { name: "Elif Aras", role: { en: "Sprouts lead teacher", tr: "Filizler sınıf öğretmeni" }, specialty: { en: "Early childhood education · 12 years", tr: "Okul öncesi eğitim · 12 yıl" }, photo: { ...unsplash("1520813792240-56fc4a3765a7", 800, 1000), alt: { en: "Elif Aras smiling, with a fringe", tr: "Kâkülleriyle gülümseyen Elif Aras" } } },
  { name: "Laura Hale", role: { en: "English lead", tr: "İngilizce öğretmeni" }, specialty: { en: "Bilingual early years · from Bristol", tr: "İki dilli erken çocukluk · Bristol’dan" }, photo: { ...unsplash("1517841905240-472988babdf9", 800, 1000), alt: { en: "Laura Hale in a grey hoodie and denim jacket, smiling", tr: "Gri kapüşonlu ve kot ceketli, gülümseyen Laura Hale" } } },
  { name: "Barış Ekinci", role: { en: "Orchard lead teacher", tr: "Bahçe sınıf öğretmeni" }, specialty: { en: "School readiness · maths through play", tr: "Okula hazırlık · oyunla matematik" }, photo: { ...unsplash("1492562080023-ab3db95bfbce", 800, 1000), alt: { en: "Barış Ekinci smiling outdoors, arms crossed", tr: "Dışarıda, kollarını kavuşturmuş gülümseyen Barış Ekinci" } } },
];

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "08:00", close: "17:30" }],
    tue: [{ open: "08:00", close: "17:30" }],
    wed: [{ open: "08:00", close: "17:30" }],
    thu: [{ open: "08:00", close: "17:30" }],
    fri: [{ open: "08:00", close: "17:30" }],
    sat: [],
    sun: [],
  },
};

const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f2f4f6'/>" +
  "<g fill='#e3e7ec'>" +
  Array.from({ length: 35 }, (_, i) => `<rect x='${(i % 7) * 172 + 12}' y='${Math.floor(i / 7) * 180 + 12}' width='148' height='156' rx='18'/>`).join("") +
  "</g><path d='M-20 640 L1220 520' stroke='#ffffff' stroke-width='28'/><path d='M700 -20 L640 920' stroke='#ffffff' stroke-width='18'/>" +
  "<rect x='0' y='820' width='1200' height='80' fill='#dbe6ee'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Little Orchard Preschool",
    address: { line: "Erguvan Sokak 7", district: "Suadiye Mahallesi", city: "Kadıköy", region: "İstanbul", postalCode: "34740", country: "TR", geo: { lat: 40.9605, lng: 29.0824 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({ en: "Drop-off bays for five minutes on Erguvan Sokak; the garden gate opens at 07:55. A ten-minute walk from Suadiye station.", tr: "Erguvan Sokak’ta beş dakikalık bırakma cepleri; bahçe kapısı 07:55’te açılır. Suadiye istasyonuna on dakika yürüme mesafesinde." }),
  };
}
