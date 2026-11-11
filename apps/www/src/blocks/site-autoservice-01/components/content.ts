// Sample content for "Gearline Garage", a fictional independent car service and hand-wash in
// Kozyatağı. Every human-readable field is `{ en, tr }`. Prices are fictional, in Turkish lira.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const EMAIL = "bays@gearline.example.com";

/** en-GB and tr-TR both use the 24-hour clock. */
export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

/** "1 h 25 min" / "1 sa 25 dk". */
export function duration(minutes: number, locale: SiteLocale): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const [hu, mu] = locale === "tr" ? ["sa", "dk"] : ["h", "min"];
  if (!h) return `${m} ${mu}`;
  return m ? `${h} ${hu} ${m} ${mu}` : `${h} ${hu}`;
}

export const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
export const toClock = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  bay: { ...unsplash("1625047509248-ec889cbff17f", 1600, 1200), alt: { en: "A technician leaning into an open engine bay under the workshop lights", tr: "Atölye ışıkları altında açık motor bölmesine eğilmiş bir teknisyen" } },
  wash: { ...unsplash("1607860108855-64acf2078ed9", 1400, 1000), alt: { en: "A dark saloon covered in foam during a hand wash", tr: "Elde yıkama sırasında köpükle kaplı koyu renk bir sedan" } },
  oil: { ...unsplash("1487754180451-c456f719a1fc", 1400, 1000), alt: { en: "Fresh engine oil being poured into a car engine", tr: "Bir otomobil motoruna yeni motor yağı dökülüyor" } },
  engine: { ...unsplash("1486262715619-67b85e0b08d3", 1400, 1000), alt: { en: "Close-up of an engine’s belts and pulleys", tr: "Bir motorun kayış ve kasnaklarına yakın çekim" } },
};

// ---------------------------------------------------------------- vehicles and services

export type VehicleId = "city" | "sedan" | "suv";
export const vehicles: { id: VehicleId; name: L; hint: L }[] = [
  { id: "city", name: { en: "City car", tr: "Şehir aracı" }, hint: { en: "Hatchbacks and small crossovers", tr: "Hatchback ve küçük crossover" } },
  { id: "sedan", name: { en: "Sedan / estate", tr: "Sedan / station" }, hint: { en: "Family saloons and estates", tr: "Aile sedanları ve station wagon" } },
  { id: "suv", name: { en: "SUV / van", tr: "SUV / van" }, hint: { en: "4×4s, people carriers, light vans", tr: "4×4, minivan, hafif ticari" } },
];

/** Which bay a job runs in: the workshop and the wash lane work in parallel. */
export type Lane = "bay" | "wash";
export type CategoryId = "maintenance" | "tyres" | "wash";

export interface Service {
  id: string;
  category: CategoryId;
  lane: Lane;
  name: L;
  text: L;
  /** Minutes per vehicle size. 0 = no bay time (storage). */
  minutes: Record<VehicleId, number>;
  /** Lira per vehicle size, parts included. */
  price: Record<VehicleId, number>;
  /** Services this one already includes (picking it unpicks those). */
  includes?: string[];
  popular?: boolean;
}

const same = (n: number): Record<VehicleId, number> => ({ city: n, sedan: n, suv: n });

export const categories: { id: CategoryId; name: L; lead: L }[] = [
  { id: "maintenance", name: { en: "Maintenance & repair", tr: "Bakım ve onarım" }, lead: { en: "Workshop bay · one technician from start to finish", tr: "Atölye · baştan sona tek teknisyen" } },
  { id: "tyres", name: { en: "Tyres & alignment", tr: "Lastik ve rot balans" }, lead: { en: "Workshop bay · balanced on a road-force machine", tr: "Atölye · yol kuvveti balans makinesinde" } },
  { id: "wash", name: { en: "Wash & detailing", tr: "Yıkama ve detaylı temizlik" }, lead: { en: "Wash lane · runs while the workshop does its part", tr: "Yıkama hattı · atölye işini yaparken paralel çalışır" } },
];

export const services: Service[] = [
  { id: "oil", category: "maintenance", lane: "bay", popular: true, name: { en: "Oil & filter change", tr: "Yağ ve filtre değişimi" }, text: { en: "Up to 5 L of 5W-30, new oil filter, levels topped up, service light reset.", tr: "5 litreye kadar 5W-30, yeni yağ filtresi, sıvı seviyeleri, servis ışığı sıfırlama." }, minutes: { city: 45, sedan: 50, suv: 60 }, price: { city: 2950, sedan: 3400, suv: 4100 } },
  { id: "check", category: "maintenance", lane: "bay", popular: true, name: { en: "40-point check before the annual test", tr: "Muayene öncesi 40 nokta kontrol" }, text: { en: "Lights, brakes, emissions, wipers, play in the steering. Written report, no surprises at the test centre.", tr: "Farlar, frenler, egzoz emisyonu, silecekler, direksiyon boşluğu. Yazılı rapor; muayenede sürpriz yok." }, minutes: same(40), price: same(1200) },
  { id: "brakes", category: "maintenance", lane: "bay", name: { en: "Front brake pads", tr: "Ön fren balatası" }, text: { en: "Pads and sensor for the front axle, discs measured, brake fluid tested.", tr: "Ön aks balata ve sensörü; diskler ölçülür, fren hidroliği test edilir." }, minutes: { city: 75, sedan: 80, suv: 95 }, price: { city: 3800, sedan: 4300, suv: 5200 } },
  { id: "aircon", category: "maintenance", lane: "bay", name: { en: "A/C regas & disinfection", tr: "Klima gazı ve dezenfeksiyon" }, text: { en: "Leak test, refrigerant to spec, cabin filter and an evaporator clean.", tr: "Kaçak testi, üretici değerinde gaz, polen filtresi ve evaporatör temizliği." }, minutes: same(50), price: { city: 1850, sedan: 1850, suv: 2300 } },
  { id: "diag", category: "maintenance", lane: "bay", name: { en: "Warning-light diagnosis", tr: "Arıza lambası teşhisi" }, text: { en: "Full scan, a road test and a plain-language quote before we touch anything.", tr: "Tam tarama, yol testi ve hiçbir şeye dokunmadan önce anlaşılır bir teklif." }, minutes: same(30), price: same(900) },
  { id: "tyres", category: "tyres", lane: "bay", popular: true, name: { en: "Seasonal tyre swap", tr: "Mevsimlik lastik değişimi" }, text: { en: "Four wheels off and on, balanced, pressures set, bolts torqued by hand.", tr: "Dört teker sökülür takılır, balans yapılır, basınç ayarlanır, bijonlar torkla sıkılır." }, minutes: { city: 40, sedan: 45, suv: 55 }, price: { city: 1400, sedan: 1600, suv: 1950 } },
  { id: "align", category: "tyres", lane: "bay", name: { en: "Wheel alignment", tr: "Rot ayarı" }, text: { en: "Four-wheel laser alignment with a before-and-after printout.", tr: "Dört tekerde lazer rot ayarı; öncesi ve sonrası çıktısıyla." }, minutes: same(35), price: { city: 1100, sedan: 1250, suv: 1450 } },
  { id: "hotel", category: "tyres", lane: "bay", name: { en: "Tyre storage, one season", tr: "Lastik oteli, bir sezon" }, text: { en: "Washed, bagged and racked in our dry store until you swap back.", tr: "Yıkanır, torbalanır ve geri takılana kadar kuru depomuzda saklanır." }, minutes: same(0), price: same(1800) },
  { id: "express", category: "wash", lane: "wash", popular: true, name: { en: "Exterior hand wash", tr: "Dış elde yıkama" }, text: { en: "Two-bucket wash, wheels and arches, hand-dried with microfibre.", tr: "İki kova yöntemi, jant ve çamurluklar, mikrofiberle elde kurulama." }, minutes: { city: 25, sedan: 30, suv: 40 }, price: { city: 450, sedan: 550, suv: 700 } },
  { id: "interior", category: "wash", lane: "wash", name: { en: "Interior valet", tr: "İç detaylı temizlik" }, text: { en: "Vacuum, mats shampooed, plastics and glass, boot included.", tr: "Süpürme, paspas şampuanlama, plastikler ve camlar; bagaj dahil." }, minutes: { city: 60, sedan: 70, suv: 90 }, price: { city: 1250, sedan: 1450, suv: 1850 } },
  { id: "detail", category: "wash", lane: "wash", includes: ["express"], name: { en: "Clay, polish & wax", tr: "Kil, pasta ve cila" }, text: { en: "Hand wash, clay bar, one-step machine polish and a hard wax. Includes the exterior wash.", tr: "Elde yıkama, kil bar, tek adım makine pastası ve sert cila. Dış yıkama dahildir." }, minutes: { city: 150, sedan: 180, suv: 220 }, price: { city: 5500, sedan: 6400, suv: 7800 } },
];
export const serviceById = (id: string) => services.find((s) => s.id === id);

/** Check-in and the final walk-round with you. */
export const HANDOVER = 15;
export const OPEN_WEEKDAY = { open: "08:00", close: "19:00" };
export const OPEN_SATURDAY = { open: "09:00", close: "17:00" };

export interface Estimate {
  bay: number;
  wash: number;
  /** Total time the car is with us: the two lanes run side by side. */
  total: number;
  price: number;
  items: Service[];
}

export function estimate(ids: string[], vehicle: VehicleId): Estimate {
  const items = ids.map(serviceById).filter((s): s is Service => !!s);
  const bay = items.filter((s) => s.lane === "bay").reduce((n, s) => n + s.minutes[vehicle], 0);
  const wash = items.filter((s) => s.lane === "wash").reduce((n, s) => n + s.minutes[vehicle], 0);
  const work = Math.max(bay, wash);
  return { bay, wash, total: items.length ? work + HANDOVER : 0, price: items.reduce((n, s) => n + s.price[vehicle], 0), items };
}

/** Drop-off slots for a day (deterministic demo availability). */
export function dropOffSlots(day: string): { start: string; available: boolean }[] {
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
  if (dow === 0) return [];
  const { open, close } = dow === 6 ? OPEN_SATURDAY : OPEN_WEEKDAY;
  const seed = Number(day.slice(8, 10));
  const out: { start: string; available: boolean }[] = [];
  for (let m = toMinutes(open), i = 0; m <= toMinutes(close) - 120; m += 30, i++) out.push({ start: toClock(m), available: (seed * 3 + i * 7) % 4 !== 0 });
  return out;
}

export function closingOn(day: string | null): number {
  if (!day) return toMinutes(OPEN_WEEKDAY.close);
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
  return toMinutes(dow === 6 ? OPEN_SATURDAY.close : OPEN_WEEKDAY.close);
}

// ---------------------------------------------------------------- people, place, words

export const team = [
  { name: "Murat Kaplan", role: { en: "Workshop lead · master technician", tr: "Atölye şefi · usta teknisyen" }, specialty: { en: "19 years on petrol, diesel and hybrid", tr: "Benzinli, dizel ve hibritte 19 yıl" }, photo: { ...unsplash("1500648767791-00dcc994a43e", 800, 1000), alt: { en: "Murat Kaplan, smiling, in a grey jumper", tr: "Gri kazaklı, gülümseyen Murat Kaplan" } } },
  { name: "Selin Ateş", role: { en: "Service advisor", tr: "Servis danışmanı" }, specialty: { en: "Calls you before any extra work", tr: "Ek iş öncesi sizi arar" }, photo: { ...unsplash("1438761681033-6461ffad8d80", 800, 1000), alt: { en: "Selin Ateş by the water, looking at the camera", tr: "Su kenarında kameraya bakan Selin Ateş" } } },
  { name: "Emre Doğru", role: { en: "Tyres & alignment", tr: "Lastik ve rot balans" }, specialty: { en: "Road-force balancing, run-flats", tr: "Yol kuvveti balansı, run-flat lastikler" }, photo: { ...unsplash("1507003211169-0a1dd7228f2d", 800, 1000), alt: { en: "Emre Doğru with a wide smile", tr: "Geniş bir gülümsemeyle Emre Doğru" } } },
  { name: "Deniz Yurt", role: { en: "Detailing lead", tr: "Detaylı temizlik sorumlusu" }, specialty: { en: "Paint correction, ceramic prep", tr: "Boya düzeltme, seramik hazırlığı" }, photo: { ...unsplash("1547425260-76bcadfb4f2c", 800, 1000), alt: { en: "Deniz Yurt in glasses and a blue striped shirt", tr: "Gözlüklü, mavi çizgili gömlekli Deniz Yurt" } } },
];

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [OPEN_WEEKDAY],
    tue: [OPEN_WEEKDAY],
    wed: [OPEN_WEEKDAY],
    thu: [OPEN_WEEKDAY],
    fri: [OPEN_WEEKDAY],
    sat: [OPEN_SATURDAY],
    sun: [],
  },
};

// A neutral street-map preview for the map facade (greyscale; the block inverts it in dark mode).
const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f3f3f1'/>" +
  "<g fill='#e4e4df'>" +
  Array.from({ length: 35 }, (_, i) => `<rect x='${(i % 7) * 175 + 14}' y='${Math.floor(i / 7) * 185 + 14}' width='150' height='160' rx='3'/>`).join("") +
  "</g><g fill='none' stroke='#ffffff' stroke-linecap='round'><path d='M-20 380 H1220' stroke-width='30'/><path d='M520 -20 V920' stroke-width='18'/><path d='M-20 820 L1220 560' stroke-width='22'/></g>" +
  "<rect x='540' y='400' width='130' height='120' rx='4' fill='#cfd2cb'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Gearline Garage",
    address: { line: "Sanayi Sokak 18", district: "Kozyatağı", city: "Kadıköy", region: "İstanbul", postalCode: "34742", country: "TR", geo: { lat: 40.9733, lng: 29.0951 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({ en: "Drive in through the yellow gate; six customer spaces by the reception. Free shuttle to Kozyatağı metro while you wait.", tr: "Sarı kapıdan girin; resepsiyonun yanında altı müşteri park yeri var. Beklerken Kozyatağı metrosuna ücretsiz servis." }),
  };
}

export const reviews = [
  { quote: { en: "Booked an oil change and a wash online, dropped the car at 08:30 and it was ready at 09:45 — exactly the time the site showed.", tr: "Yağ değişimi ve yıkamayı internetten ayarladım, arabayı 08:30’da bıraktım, 09:45’te hazırdı — sitenin gösterdiği saatin ta kendisi." }, author: "Okan Bilgin", role: { en: "Sedan, oil & wash", tr: "Sedan, yağ ve yıkama" }, date: "2026-10-14" },
  { quote: { en: "Selin called before replacing the rear discs, sent photos, and the final bill matched the quote to the lira.", tr: "Selin arka diskleri değiştirmeden önce aradı, fotoğraf gönderdi; son fatura teklifle kuruşu kuruşuna aynıydı." }, author: "Aylin Karaca", role: { en: "SUV, brakes", tr: "SUV, fren" }, date: "2026-09-29" },
  { quote: { en: "Tyre hotel is the best idea. I don’t carry four wheels up to my flat any more.", tr: "Lastik oteli harika fikir. Artık dört tekeri daireme taşımıyorum." }, author: "Cem Ersoy", role: { en: "City car, tyres", tr: "Şehir aracı, lastik" }, date: "2026-11-02" },
];

export const faqs: { q: L; a: L }[] = [
  { q: { en: "Can I wait while you work?", tr: "İş yapılırken bekleyebilir miyim?" }, a: { en: "Yes. The lounge has coffee, Wi-Fi and a window onto bay 2. For jobs over 90 minutes we offer the free shuttle to Kozyatağı metro instead.", tr: "Evet. Bekleme salonunda kahve, Wi-Fi ve 2 numaralı bölmeye bakan bir pencere var. 90 dakikayı aşan işlerde Kozyatağı metrosuna ücretsiz servis öneriyoruz." } },
  { q: { en: "How accurate is the ready-by time?", tr: "Hazır olma saati ne kadar doğru?" }, a: { en: "It is built from our own job times for your car size. Nine in ten cars are ready on time; if we find something extra, we call before doing it and give you a new time.", tr: "Araç boyutunuza göre kendi iş sürelerimizden hesaplanır. On araçtan dokuzu zamanında hazır olur; ek bir şey çıkarsa yapmadan önce arar, yeni saati söyleriz." } },
  { q: { en: "Do you use original parts?", tr: "Orijinal parça kullanıyor musunuz?" }, a: { en: "We fit OE-quality parts with a two-year warranty by default. Ask for manufacturer-branded parts and we quote them side by side.", tr: "Varsayılan olarak iki yıl garantili OE kalitesinde parça takarız. Üretici markalı parça isterseniz ikisini yan yana fiyatlarız." } },
  { q: { en: "Will servicing here affect my warranty?", tr: "Burada bakım yaptırmak garantimi etkiler mi?" }, a: { en: "No. We follow the manufacturer’s schedule, use the specified fluids and stamp your service book.", tr: "Hayır. Üretici takvimine uyar, belirtilen sıvıları kullanır ve servis kitabınızı damgalarız." } },
  { q: { en: "How do I pay?", tr: "Nasıl ödeme yaparım?" }, a: { en: "Card, contactless or bank transfer when you collect. Nothing is charged when you book.", tr: "Teslim alırken kart, temassız ya da havale. Randevu sırasında hiçbir ücret alınmaz." } },
];
