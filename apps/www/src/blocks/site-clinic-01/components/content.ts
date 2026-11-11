// Sample content for "Northline Family Clinic", a fictional general practice in Ataşehir.
// Every human-readable field is `{ en, tr }`. No medical claims — services, times and fees only.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const EMAIL = "desk@northline.example.com";

/** en-GB and tr-TR both use the 24-hour clock, so times read the same in both languages. */
export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  reception: { ...unsplash("1519494026892-80bbd2d6fd0d", 1600, 1200), alt: { en: "The clinic’s bright reception desk and waiting area", tr: "Kliniğin aydınlık resepsiyonu ve bekleme alanı" } },
  consult: { ...unsplash("1631217868264-e5b90bb7e133", 1400, 1750), alt: { en: "A doctor talking a patient through her notes", tr: "Hastasıyla notlarını konuşan bir doktor" } },
  room: { ...unsplash("1551076805-e1869033e561", 1600, 1067), alt: { en: "A clean consulting room with an examination couch", tr: "Muayene sedyeli temiz bir muayene odası" } },
};

export type ServiceId = "checkup" | "children" | "women" | "chronic" | "vaccines" | "bloods" | "injury";

export interface Service {
  id: ServiceId;
  name: L;
  text: L;
  minutes: number;
  fee: string;
  /** Who can see this service. */
  staff: string[];
}

export const services: Service[] = [
  { id: "checkup", name: { en: "General consultation", tr: "Genel muayene" }, text: { en: "A new problem, a second opinion or a yearly check-up with your family doctor.", tr: "Yeni bir şikâyet, ikinci görüş ya da aile hekiminizle yıllık kontrol." }, minutes: 30, fee: "1800", staff: ["aksoy", "sen"] },
  { id: "children", name: { en: "Children’s health", tr: "Çocuk sağlığı" }, text: { en: "Growth checks, coughs and fevers, school forms — from newborns to 16.", tr: "Gelişim kontrolü, öksürük ve ateş, okul formları — yenidoğandan 16 yaşa." }, minutes: 30, fee: "1800", staff: ["yalin"] },
  { id: "women", name: { en: "Women’s health", tr: "Kadın sağlığı" }, text: { en: "Contraception advice, smear tests and menopause appointments.", tr: "Doğum kontrolü danışmanlığı, smear testi ve menopoz görüşmeleri." }, minutes: 30, fee: "1950", staff: ["aksoy"] },
  { id: "chronic", name: { en: "Long-term condition review", tr: "Kronik hastalık takibi" }, text: { en: "Regular reviews for blood pressure, diabetes or asthma, with your results in hand.", tr: "Tansiyon, diyabet ya da astım için düzenli takip; sonuçlarınız elinizde." }, minutes: 40, fee: "2100", staff: ["sen", "aksoy"] },
  { id: "vaccines", name: { en: "Vaccinations & travel", tr: "Aşı ve seyahat sağlığı" }, text: { en: "Routine and travel vaccines, plus a check of what you still need.", tr: "Rutin ve seyahat aşıları; eksiklerinizin kontrolüyle." }, minutes: 15, fee: "650", staff: ["ural", "yalin"] },
  { id: "bloods", name: { en: "Blood tests & ECG", tr: "Kan tahlili ve EKG" }, text: { en: "Samples taken from 08:00; most results are online the same evening.", tr: "Numune 08:00’den itibaren alınır; çoğu sonuç aynı akşam çevrimiçi." }, minutes: 15, fee: "900", staff: ["ural"] },
  { id: "injury", name: { en: "Minor injuries", tr: "Küçük yaralanmalar" }, text: { en: "Cuts, sprains and burns that need a look today. For emergencies call 112.", tr: "Bugün bakılması gereken kesik, burkulma ve yanıklar. Acil durumda 112’yi arayın." }, minutes: 20, fee: "1200", staff: ["ural", "sen"] },
];
export const serviceById = (id: string) => services.find((s) => s.id === id) ?? services[0]!;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Clinician {
  id: string;
  title?: L;
  name: string;
  role: L;
  focus: L;
  bio: L;
  languages: L;
  /** Days with clinics (0 = Sunday). */
  days: Weekday[];
  photo: { src: string; width: number; height: number; focal?: { x: number; y: number }; alt: L };
  specialty: "family" | "children" | "nursing";
}

export const clinicians: Clinician[] = [
  {
    id: "aksoy",
    title: { en: "Dr", tr: "Dr." },
    name: "Leyla Aksoy",
    role: { en: "Family doctor, clinic lead", tr: "Aile hekimi, klinik sorumlusu" },
    focus: { en: "Women’s health · long-term conditions", tr: "Kadın sağlığı · kronik hastalıklar" },
    bio: { en: "Trained in Ankara and Leeds; at Northline since it opened in 2016.", tr: "Ankara ve Leeds’te eğitim aldı; 2016’daki açılıştan beri Northline’da." },
    languages: { en: "Turkish, English", tr: "Türkçe, İngilizce" },
    days: [1, 2, 4],
    specialty: "family",
    photo: { ...unsplash("1559839734-2b71ea197ec2", 800, 1000), alt: { en: "Dr Leyla Aksoy in a white coat, outdoors", tr: "Beyaz önlüğüyle dışarıda Dr. Leyla Aksoy" } },
  },
  {
    id: "sen",
    title: { en: "Dr", tr: "Dr." },
    name: "Murat Şen",
    role: { en: "Family doctor", tr: "Aile hekimi" },
    focus: { en: "Blood pressure · diabetes · sports injuries", tr: "Tansiyon · diyabet · spor yaralanmaları" },
    bio: { en: "Former team doctor for a regional basketball club; runs the Saturday clinic.", tr: "Bölgesel bir basketbol kulübünün eski takım doktoru; cumartesi polikliniğini yürütür." },
    languages: { en: "Turkish, English, Arabic", tr: "Türkçe, İngilizce, Arapça" },
    days: [1, 3, 5, 6],
    specialty: "family",
    photo: { ...unsplash("1612349317150-e413f6a5b16d", 800, 1000), alt: { en: "Dr Murat Şen with a stethoscope, arms folded", tr: "Steteskopuyla, kollarını kavuşturmuş Dr. Murat Şen" } },
  },
  {
    id: "yalin",
    title: { en: "Dr", tr: "Dr." },
    name: "Ece Yalın",
    role: { en: "Paediatrician", tr: "Çocuk sağlığı uzmanı" },
    focus: { en: "Newborns · vaccinations · school health", tr: "Yenidoğan · aşılar · okul sağlığı" },
    bio: { en: "Keeps a basket of picture books in room 2 and the shortest waits in the building.", tr: "2 numaralı odada resimli kitap sepeti ve binanın en kısa bekleme süresi onda." },
    languages: { en: "Turkish, English, German", tr: "Türkçe, İngilizce, Almanca" },
    days: [2, 3, 4, 6],
    specialty: "children",
    photo: { ...unsplash("1666214280557-f1b5022eb634", 800, 1000), focal: { x: 0.72, y: 0.35 }, alt: { en: "Dr Ece Yalın explaining a scan on a monitor", tr: "Ekrandaki bir görüntüyü anlatan Dr. Ece Yalın" } },
  },
  {
    id: "ural",
    name: "Hakan Ural",
    role: { en: "Nurse practitioner", tr: "Uzman hemşire" },
    focus: { en: "Vaccines · blood tests · wound care", tr: "Aşı · kan alma · yara bakımı" },
    bio: { en: "Takes most blood samples before 09:00 so you can get to work.", tr: "İşe yetişebilmeniz için kan örneklerinin çoğunu 09:00’dan önce alır." },
    languages: { en: "Turkish, English", tr: "Türkçe, İngilizce" },
    days: [1, 2, 3, 4, 5, 6],
    specialty: "nursing",
    photo: { ...unsplash("1622253692010-333f2da6031d", 800, 1000), alt: { en: "Hakan Ural in blue scrubs, smiling", tr: "Mavi forma içinde gülümseyen Hakan Ural" } },
  },
];
export const clinicianById = (id: string) => clinicians.find((c) => c.id === id);
export const displayName = (c: Clinician, locale: SiteLocale) => (c.title ? `${c.title[locale]} ${c.name}` : c.name);

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "08:00", close: "20:00" }],
    tue: [{ open: "08:00", close: "20:00" }],
    wed: [{ open: "08:00", close: "20:00" }],
    thu: [{ open: "08:00", close: "20:00" }],
    fri: [{ open: "08:00", close: "20:00" }],
    sat: [{ open: "09:00", close: "14:00" }],
    sun: [],
  },
};

// A neutral street-map preview for the map facade (rendered greyscale by the block).
const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f4f4f2'/>" +
  "<g fill='#e6e6e2'>" +
  Array.from({ length: 48 }, (_, i) => `<rect x='${(i % 8) * 150 + 12}' y='${Math.floor(i / 8) * 150 + 12}' width='126' height='126' rx='4'/>`).join("") +
  "</g><g fill='none' stroke='#ffffff' stroke-width='22' stroke-linecap='round'><path d='M-20 450 H1220'/><path d='M600 -20 V920'/><path d='M-20 860 C400 700 800 760 1220 600'/></g>" +
  "<rect x='460' y='300' width='140' height='140' rx='6' fill='#d6dcd9'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Northline Family Clinic",
    address: { line: "Ihlamur Sokak 4, Kat 2", district: "Atatürk Mahallesi", city: "Ataşehir", region: "İstanbul", postalCode: "34758", country: "TR", geo: { lat: 40.9925, lng: 29.1244 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({ en: "Step-free entrance and lift. Free parking for patients on level −1; ask the desk for a ticket.", tr: "Basamaksız giriş ve asansör. Hastalara −1. katta ücretsiz otopark; bilet için danışmaya başvurun." }),
  };
}

/** Deterministic demo availability: about two in three slots are free. */
export function slotsFor(day: string, minutes: number, clinician?: Clinician): { start: string; available: boolean }[] {
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
  const [open, close] = dow === 6 ? [9 * 60, 14 * 60] : [8 * 60, 20 * 60];
  const step = minutes <= 20 ? 20 : 30;
  const seed = Number(day.slice(8, 10)) + (clinician?.id.length ?? 3);
  const out: { start: string; available: boolean }[] = [];
  for (let m = open, i = 0; m + minutes <= close; m += step, i++) {
    if (m >= 13 * 60 && m < 14 * 60 && dow !== 6) continue; // lunch
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    out.push({ start: `${hh}:${mm}`, available: (seed * 7 + i * 5) % 3 !== 0 });
  }
  return out;
}

