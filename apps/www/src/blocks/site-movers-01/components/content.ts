// Sample content for "Tidyframe Movers", a fictional home-moving and cleaning company in
// İstanbul. Every human-readable field is `{ en, tr }`. Prices are fictional, in Turkish lira.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

export const PHONE = "+902160000000";
export const EMAIL = "quotes@tidyframe.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const num = (value: number, locale: SiteLocale, digits = 0) => new Intl.NumberFormat(intlOf(locale), { maximumFractionDigits: digits }).format(value);
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  room: { ...unsplash("1586023492125-27b2c045efd7", 1600, 1100), alt: { en: "A freshly set-up living room with a yellow armchair and a floor lamp", tr: "Sarı koltuk ve lambader ile yeni yerleşilmiş bir oturma odası" } },
  kitchen: { ...unsplash("1600585152220-90363fe7e115", 1600, 1100), alt: { en: "A spotless open-plan kitchen with a white island and wooden stools", tr: "Beyaz adası ve ahşap tabureleriyle pırıl pırıl açık mutfak" } },
  window: { ...unsplash("1581578731548-c64695cc6952", 1200, 1500), alt: { en: "A cleaner in yellow gloves wiping a tall window", tr: "Sarı eldivenli bir temizlik görevlisi yüksek bir camı siliyor" } },
};

// ---------------------------------------------------------------- the quote model

export type ServiceKind = "move" | "clean" | "both";
export type HomeSize = "studio" | "1+1" | "2+1" | "3+1" | "4+1";

export const sizes: { id: HomeSize; volume: number; rooms: number; cleanBase: number; cleanHours: number }[] = [
  { id: "studio", volume: 12, rooms: 1, cleanBase: 3200, cleanHours: 3 },
  { id: "1+1", volume: 18, rooms: 2, cleanBase: 4200, cleanHours: 4 },
  { id: "2+1", volume: 28, rooms: 3, cleanBase: 5600, cleanHours: 5 },
  { id: "3+1", volume: 38, rooms: 4, cleanBase: 7200, cleanHours: 6 },
  { id: "4+1", volume: 50, rooms: 5, cleanBase: 9000, cleanHours: 8 },
];
export const sizeName = (id: HomeSize): L => (id === "studio" ? { en: "Studio", tr: "Stüdyo" } : { en: id, tr: id });

export type ExtraId = "packing" | "crating" | "piano" | "assembly" | "storage" | "oven" | "windows";
export const extras: { id: ExtraId; for: ServiceKind[]; name: L; hint: L }[] = [
  { id: "packing", for: ["move", "both"], name: { en: "Full packing", tr: "Tam paketleme" }, hint: { en: "We bring boxes, pack everything the day before", tr: "Koliyi biz getirir, bir gün önce her şeyi paketleriz" } },
  { id: "crating", for: ["move", "both"], name: { en: "Crates for fragile items", tr: "Hassas eşya sandığı" }, hint: { en: "Wooden crates for art, mirrors, a TV over 55″", tr: "Tablo, ayna, 55″ üstü TV için ahşap sandık" } },
  { id: "piano", for: ["move", "both"], name: { en: "Piano", tr: "Piyano" }, hint: { en: "Upright, with a stair climber", tr: "Duvar piyanosu, merdiven paletiyle" } },
  { id: "assembly", for: ["move", "both"], name: { en: "Furniture assembly", tr: "Mobilya kurulumu" }, hint: { en: "Beds, wardrobes and shelves taken apart and rebuilt", tr: "Yatak, dolap ve raflar sökülüp yeniden kurulur" } },
  { id: "storage", for: ["move", "both"], name: { en: "Storage between homes", tr: "Ara depolama" }, hint: { en: "Dry, insured warehouse in Dudullu", tr: "Dudullu’da kuru, sigortalı depo" } },
  { id: "oven", for: ["clean", "both"], name: { en: "Oven & fridge deep clean", tr: "Fırın ve buzdolabı derin temizlik" }, hint: { en: "Inside and out, racks soaked", tr: "İçi dışı, raflar ıslatılarak" } },
  { id: "windows", for: ["clean", "both"], name: { en: "Windows inside & out", tr: "Camlar içten ve dıştan" }, hint: { en: "Including frames and balcony glass", tr: "Çerçeve ve balkon camı dahil" } },
];

export interface QuoteInput {
  kind: ServiceKind;
  size: HomeSize;
  fromFloor: number;
  fromLift: boolean;
  toFloor: number;
  toLift: boolean;
  km: number;
  extras: ExtraId[];
  storageWeeks: number;
  day: string | null;
  flexible: boolean;
}

export const DEFAULT_QUOTE: QuoteInput = { kind: "move", size: "2+1", fromFloor: 3, fromLift: true, toFloor: 1, toLift: false, km: 14, extras: [], storageWeeks: 2, day: null, flexible: false };

export interface QuoteLine {
  id: string;
  label: L;
  amount: number;
}
export interface Quote {
  crew: number;
  truck: L | null;
  hours: number;
  volume: number;
  lines: QuoteLine[];
  modifiers: QuoteLine[];
  total: number;
  low: number;
  high: number;
}

const round50 = (n: number) => Math.round(n / 50) * 50;
const PERSON_HOUR = 650;

/** Busy days: weekends and the last three days of a month (rent changes over). */
export function dayRate(day: string | null): { weekend: boolean; monthEnd: boolean } {
  if (!day) return { weekend: false, monthEnd: false };
  const d = new Date(`${day}T12:00:00Z`);
  const dow = d.getUTCDay();
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return { weekend: dow === 0 || dow === 6, monthEnd: d.getUTCDate() > last - 3 };
}

export function quote(q: QuoteInput): Quote {
  const s = sizes.find((x) => x.id === q.size)!;
  const moving = q.kind !== "clean";
  const cleaning = q.kind !== "move";
  const crew = moving ? (s.volume <= 18 ? 2 : s.volume <= 28 ? 3 : s.volume <= 38 ? 4 : 5) : 2;
  const lines: QuoteLine[] = [];
  let hours = 0;
  let truck: L | null = null;

  if (moving) {
    const stairs = (floor: number, lift: boolean) => (lift ? 0.15 : floor * 0.12 * (s.volume / 10));
    const load = s.volume / (crew * 3.5);
    const drive = q.km / 22;
    hours = Math.max(3, load * 2 + stairs(q.fromFloor, q.fromLift) + stairs(q.toFloor, q.toLift) + drive);
    truck = s.volume <= 18 ? { en: "3.5 t van", tr: "3,5 t kamyonet" } : s.volume <= 38 ? { en: "7.5 t truck", tr: "7,5 t kamyon" } : { en: "Two 7.5 t trucks", tr: "İki adet 7,5 t kamyon" };
    const truckDay = s.volume <= 18 ? 2400 : s.volume <= 38 ? 4200 : 8400;
    lines.push({ id: "crew", label: { en: `Crew of ${crew}, ${hours.toFixed(1)} h`, tr: `${crew} kişilik ekip, ${hours.toFixed(1).replace(".", ",")} sa` }, amount: round50(crew * hours * PERSON_HOUR) });
    lines.push({ id: "truck", label: { en: `${truck.en} and ${q.km} km`, tr: `${truck.tr} ve ${q.km} km` }, amount: round50(truckDay + q.km * 38) });
    if (!q.fromLift || !q.toLift) lines.push({ id: "stairs", label: { en: "Stairs without a lift", tr: "Asansörsüz merdiven" }, amount: round50(((q.fromLift ? 0 : q.fromFloor) + (q.toLift ? 0 : q.toFloor)) * 180) });
  }
  if (cleaning) {
    const cleanH = s.cleanHours;
    hours = moving ? hours : cleanH;
    lines.push({ id: "clean", label: { en: `End-of-tenancy clean, 2 cleaners × ${cleanH} h`, tr: `Taşınma temizliği, 2 kişi × ${cleanH} sa` }, amount: s.cleanBase });
  }
  const has = (id: ExtraId) => q.extras.includes(id) && extras.find((e) => e.id === id)!.for.includes(q.kind);
  if (has("packing")) lines.push({ id: "packing", label: { en: `Full packing, about ${Math.round(s.volume * 2.2)} boxes`, tr: `Tam paketleme, yaklaşık ${Math.round(s.volume * 2.2)} koli` }, amount: round50(s.volume * 190) });
  if (has("crating")) lines.push({ id: "crating", label: { en: "Fragile crates (up to 4)", tr: "Hassas eşya sandığı (4 adede kadar)" }, amount: 1800 });
  if (has("piano")) lines.push({ id: "piano", label: { en: "Piano with stair climber", tr: "Merdiven paletiyle piyano" }, amount: 3500 + (q.fromLift ? 0 : q.fromFloor * 600) + (q.toLift ? 0 : q.toFloor * 600) });
  if (has("assembly")) lines.push({ id: "assembly", label: { en: "Furniture assembly", tr: "Mobilya kurulumu" }, amount: s.rooms * 450 });
  if (has("storage")) lines.push({ id: "storage", label: { en: `Storage, ${q.storageWeeks} weeks`, tr: `Depolama, ${q.storageWeeks} hafta` }, amount: round50(q.storageWeeks * s.volume * 22) });
  if (has("oven")) lines.push({ id: "oven", label: { en: "Oven & fridge", tr: "Fırın ve buzdolabı" }, amount: 900 });
  if (has("windows")) lines.push({ id: "windows", label: { en: "Windows inside & out", tr: "Camlar içten ve dıştan" }, amount: 300 * s.rooms + 200 });

  const subtotal = lines.reduce((n, l) => n + l.amount, 0);
  const modifiers: QuoteLine[] = [];
  const r = dayRate(q.day);
  if (r.weekend) modifiers.push({ id: "weekend", label: { en: "Weekend +15%", tr: "Hafta sonu +%15" }, amount: round50(subtotal * 0.15) });
  if (r.monthEnd) modifiers.push({ id: "monthEnd", label: { en: "Month-end rush +10%", tr: "Ay sonu yoğunluğu +%10" }, amount: round50(subtotal * 0.1) });
  if (q.flexible) modifiers.push({ id: "flex", label: { en: "Flexible ±3 days −8%", tr: "Esnek ±3 gün −%8" }, amount: -round50(subtotal * 0.08) });
  const total = subtotal + modifiers.reduce((n, l) => n + l.amount, 0);
  return { crew, truck, hours, volume: moving ? s.volume : 0, lines, modifiers, total, low: round50(total * 0.94), high: round50(total * 1.08) };
}

// ---------------------------------------------------------------- people, place, words

export const crew = [
  { name: "Gökhan Erdem", role: { en: "Founder · move planner", tr: "Kurucu · taşınma planlayıcısı" }, specialty: { en: "Surveys every home over 3+1 in person", tr: "3+1 üstü her evi yerinde inceler" }, photo: { ...unsplash("1527980965255-d3b416303d12", 800, 1000), alt: { en: "Gökhan Erdem smiling, in a dark coat and scarf", tr: "Koyu palto ve atkıyla gülümseyen Gökhan Erdem" } } },
  { name: "Ayşe Tunalı", role: { en: "Cleaning team lead", tr: "Temizlik ekip lideri" }, specialty: { en: "Deposit-back cleans for landlords’ checklists", tr: "Ev sahibi kontrol listesine göre depozito temizliği" }, photo: { ...unsplash("1580489944761-15a19d654956", 800, 1000), alt: { en: "Ayşe Tunalı smiling at the camera", tr: "Kameraya gülümseyen Ayşe Tunalı" } } },
  { name: "Serkan Polat", role: { en: "Crew chief", tr: "Ekip şefi" }, specialty: { en: "Pianos, narrow stairwells, balcony lifts", tr: "Piyano, dar merdiven, balkon asansörü" }, photo: { ...unsplash("1570295999919-56ceb5ecca61", 800, 1000), alt: { en: "Serkan Polat in a navy jumper", tr: "Lacivert kazaklı Serkan Polat" } } },
];

const office = { open: "08:30", close: "19:00" };
export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: { mon: [office], tue: [office], wed: [office], thu: [office], fri: [office], sat: [{ open: "09:00", close: "15:00" }], sun: [] },
};

const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f4f5f6'/>" +
  "<g fill='#e5e7ea'>" +
  Array.from({ length: 24 }, (_, i) => `<rect x='${(i % 6) * 200 + 18}' y='${Math.floor(i / 6) * 225 + 18}' width='170' height='195' rx='3'/>`).join("") +
  "</g><g fill='none' stroke='#ffffff' stroke-linecap='round'><path d='M-20 452 H1220' stroke-width='30'/><path d='M806 -20 V920' stroke-width='22'/><path d='M-20 120 L1220 330' stroke-width='16'/></g>" +
  "<rect x='620' y='470' width='170' height='190' rx='4' fill='#cdd3da'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branches(t: (v: Localized<string>) => string): Branch[] {
  return [
    { name: t({ en: "Office", tr: "Ofis" }), address: { line: "Alemdağ Caddesi 112, Kat 3", district: "Ümraniye", city: "Ümraniye", region: "İstanbul", postalCode: "34764", country: "TR", geo: { lat: 41.0237, lng: 29.1246 } }, phone: PHONE, email: EMAIL, hours, mapImage: streetMap, notes: t({ en: "Surveys and box pick-up by appointment.", tr: "Keşif ve koli teslimi randevuyla." }) },
    { name: t({ en: "Warehouse", tr: "Depo" }), address: { line: "Depo Sokak 7", district: "Dudullu OSB", city: "Ümraniye", region: "İstanbul", postalCode: "34776", country: "TR", geo: { lat: 41.0, lng: 29.16 } }, phone: PHONE, hours, mapImage: streetMap, notes: t({ en: "Storage visits Monday to Saturday; bring your unit code.", tr: "Depo ziyareti pazartesi–cumartesi; ünite kodunuzu getirin." }) },
  ];
}

export const reviews = [
  { quote: { en: "The quote said ₺18,050 to ₺20,750. The bill was ₺19,400. Three floors, no lift, and not one scratch on the stairwell.", tr: "Teklif 18.050–20.750 ₺ dedi. Fatura 19.400 ₺ geldi. Üç kat, asansör yok ve merdivende tek bir çizik yok." }, author: "Derya Kılıç", role: { en: "2+1, Kadıköy → Ümraniye", tr: "2+1, Kadıköy → Ümraniye" }, date: "2026-09-12" },
  { quote: { en: "Booked move + clean together. The cleaners started as the truck left; I handed over the keys the same evening and got the full deposit back.", tr: "Taşınma ve temizliği birlikte aldım. Kamyon çıkar çıkmaz temizlik başladı; anahtarı aynı akşam teslim ettim, depozitonun tamamını geri aldım." }, author: "Murat Şahin", role: { en: "3+1, Ataşehir", tr: "3+1, Ataşehir" }, date: "2026-10-30" },
  { quote: { en: "Moving on a Tuesday instead of a Saturday saved us almost three thousand lira. The calculator shows it straight away.", tr: "Cumartesi yerine salı taşınmak bize neredeyse üç bin lira kazandırdı. Hesaplayıcı bunu hemen gösteriyor." }, author: "Seda & Onur", role: { en: "1+1, Üsküdar", tr: "1+1, Üsküdar" }, date: "2026-08-19" },
];

export type FaqCat = "quote" | "moving" | "cleaning" | "payment";
export const faqCats: { id: FaqCat; name: L }[] = [
  { id: "quote", name: { en: "Quotes", tr: "Teklif" } },
  { id: "moving", name: { en: "Moving day", tr: "Taşınma günü" } },
  { id: "cleaning", name: { en: "Cleaning", tr: "Temizlik" } },
  { id: "payment", name: { en: "Payment & insurance", tr: "Ödeme ve sigorta" } },
];

export const faqs: { cat: FaqCat; q: L; a: L }[] = [
  { cat: "quote", q: { en: "How close is the online estimate to the final price?", tr: "Çevrimiçi tahmin son fiyata ne kadar yakın?" }, a: { en: "Nine in ten of last year’s moves landed inside the range. We confirm a fixed price after a 15-minute video call or, for 3+1 and larger, a visit.", tr: "Geçen yılki taşınmaların onda dokuzu aralığın içinde kaldı. 15 dakikalık görüntülü görüşmeden ya da 3+1 ve üzeri evlerde keşiften sonra sabit fiyat veririz." } },
  { cat: "quote", q: { en: "Is the fixed price really fixed?", tr: "Sabit fiyat gerçekten sabit mi?" }, a: { en: "Yes, unless the inventory changes — for example a second sofa we didn’t know about. We tell you before loading, never after.", tr: "Evet, eşya listesi değişmedikçe — örneğin bilmediğimiz ikinci bir kanepe. Bunu yüklemeden önce söyleriz, sonra asla." } },
  { cat: "quote", q: { en: "Why are weekends more expensive?", tr: "Hafta sonu neden daha pahalı?" }, a: { en: "Two thirds of moves want a Saturday. Weekday moves keep crews busy all week, so we pass the saving on: 15% less than a weekend.", tr: "Taşınmaların üçte ikisi cumartesi istiyor. Hafta içi taşınmalar ekipleri bütün hafta çalıştırır; tasarrufu size yansıtırız: hafta sonuna göre %15 daha az." } },
  { cat: "moving", q: { en: "Do I need to empty the wardrobes?", tr: "Dolapları boşaltmam gerekiyor mu?" }, a: { en: "No. We bring hanging wardrobe boxes; clothes go straight from the rail to the box and back.", tr: "Hayır. Askılı dolap kolisi getiririz; kıyafetler askıdan koliye, koliden askıya gider." } },
  { cat: "moving", q: { en: "What if the building has no lift?", tr: "Binada asansör yoksa ne olur?" }, a: { en: "We add a crew member or a balcony lift for higher floors. The calculator adds the stairs time automatically.", tr: "Yüksek katlar için ekibe bir kişi ya da balkon asansörü ekleriz. Hesaplayıcı merdiven süresini otomatik ekler." } },
  { cat: "moving", q: { en: "Can you move us between cities?", tr: "Şehirler arası taşıyor musunuz?" }, a: { en: "Yes, with a partner network for Ankara, İzmir and Bursa. Ask for a quote by phone; the online calculator covers İstanbul only.", tr: "Evet, Ankara, İzmir ve Bursa için ortak ağımızla. Telefonla teklif isteyin; çevrimiçi hesaplayıcı yalnızca İstanbul içindir." } },
  { cat: "cleaning", q: { en: "Do you bring the products?", tr: "Malzemeleri siz mi getiriyorsunuz?" }, a: { en: "Everything — including a vacuum, a steam cleaner and ladders. We use unscented, pet-safe products unless you ask otherwise.", tr: "Her şeyi — süpürge, buharlı temizleyici ve merdiven dahil. Aksini istemedikçe kokusuz, evcil hayvan dostu ürünler kullanırız." } },
  { cat: "cleaning", q: { en: "What if the landlord isn’t happy?", tr: "Ev sahibi memnun kalmazsa?" }, a: { en: "Tell us within 48 hours and we come back to re-clean the listed areas free.", tr: "48 saat içinde haber verin; belirtilen alanları ücretsiz yeniden temizlemeye geliriz." } },
  { cat: "payment", q: { en: "Are my things insured?", tr: "Eşyalarım sigortalı mı?" }, a: { en: "Every move carries goods-in-transit cover up to ₺750,000. Crated items are covered at their declared value.", tr: "Her taşınmada 750.000 ₺’ye kadar nakliyat sigortası vardır. Sandıklı eşyalar beyan edilen değerle sigortalıdır." } },
  { cat: "payment", q: { en: "When do I pay?", tr: "Ne zaman öderim?" }, a: { en: "A 10% deposit holds the date; the rest after unloading, by card or transfer. Cancel free up to 72 hours before.", tr: "%10 kapora tarihi tutar; kalanı boşaltmadan sonra kart ya da havaleyle. 72 saat öncesine kadar ücretsiz iptal." } },
];
