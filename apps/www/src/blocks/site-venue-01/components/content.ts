// Sample content for "Old Mill Hall", a fictional event venue in a restored 1911 flour mill on
// the Ömerli stream, Istanbul. Every human-readable field is `Localized` ({ en, tr }) and resolved
// with `pickLocale`. Prices are whole Turkish lira, excluding VAT.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

/** Fictional contact details only. */
export const PHONE = "+902160000000";
export const EMAIL = "events@oldmillhall.example.com";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");
export const pick = (v: L, locale: SiteLocale) => pickLocale(v, locale) ?? "";
export const liraOf = (locale: SiteLocale) => {
  const f = createFormatter(intlOf(locale), { currency: "TRY", timeZone: "Europe/Istanbul" });
  return (n: number) => f.currency(n, "TRY", { minimumFractionDigits: 0, maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" });
};
export const numberOf = (locale: SiteLocale) => (n: number) => new Intl.NumberFormat(intlOf(locale)).format(n);

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pick(value, locale);
  const intl = intlOf(locale);
  const img = <I extends { alt: L }>(image: I) => ({ ...image, alt: t(image.alt) });
  return { t, img, intl, locale, lira: liraOf(locale), num: numberOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}
export type Copy = ReturnType<typeof copyFor>;

export const photos = {
  hall: { ...unsplash("1510076857177-7470076d4098", 2000, 1100), alt: { en: "The Grain Hall laid for a wedding: timber trusses, draped fabric and a chandelier over a long dance floor", tr: "Düğün için hazırlanmış Tahıl Salonu: ahşap makaslar, dökümlü kumaşlar ve uzun dans pistinin üzerinde bir avize" } as L },
  dinner: { ...unsplash("1528605248644-14dd04022da1", 1400, 1000), alt: { en: "Guests at a long dinner table under industrial pendant lamps", tr: "Endüstriyel sarkıt lambaların altında uzun bir akşam yemeği masasında misafirler" } as L },
  theatre: { ...unsplash("1519750157634-b6d493a0f77c", 1400, 1000), alt: { en: "Rows of dark upholstered chairs set out theatre-style", tr: "Tiyatro düzeninde dizilmiş koyu döşemeli sandalye sıraları" } as L },
  loft: { ...unsplash("1497366811353-6870744d04b2", 1400, 1000), alt: { en: "A bright loft room with long tables, concrete floor and tall windows", tr: "Uzun masalı, beton zeminli ve yüksek pencereli aydınlık bir çatı katı" } as L },
  engine: { ...unsplash("1520342868574-5fa3804e551c", 1400, 1000), alt: { en: "A bare brick wall behind a small table set with flowers and a cake", tr: "Çiçekler ve bir pastayla hazırlanmış küçük bir masanın arkasında çıplak tuğla duvar" } as L },
  terrace: { ...unsplash("1527529482837-4698179dc6ce", 1400, 1000), alt: { en: "Guests raising glasses under strings of warm lights", tr: "Sıcak ışık zincirlerinin altında kadeh kaldıran misafirler" } as L },
};

/* ------------------------------------------------------------------ */
/* Spaces and layouts                                                   */
/* ------------------------------------------------------------------ */

export type LayoutId = "theatre" | "banquet" | "cabaret" | "classroom" | "reception" | "boardroom";
export const layouts: { id: LayoutId; name: L; hint: L }[] = [
  { id: "banquet", name: { en: "Banquet", tr: "Ziyafet" }, hint: { en: "Round tables of 10, seated dinner", tr: "10 kişilik yuvarlak masalar, oturmalı yemek" } },
  { id: "reception", name: { en: "Standing", tr: "Ayakta" }, hint: { en: "Drinks reception, canapés", tr: "Kokteyl, kanepe" } },
  { id: "theatre", name: { en: "Theatre", tr: "Tiyatro" }, hint: { en: "Rows of chairs facing a stage", tr: "Sahneye dönük sandalye sıraları" } },
  { id: "cabaret", name: { en: "Cabaret", tr: "Kabare" }, hint: { en: "Rounds with the stage side left open", tr: "Sahne tarafı açık yuvarlak masalar" } },
  { id: "classroom", name: { en: "Classroom", tr: "Sınıf" }, hint: { en: "Rows of tables, everyone facing forward", tr: "Öne dönük masa sıraları" } },
  { id: "boardroom", name: { en: "Boardroom", tr: "Toplantı" }, hint: { en: "One table, everyone around it", tr: "Tek masa, herkes çevresinde" } },
];

export type SpaceId = "grain" | "millstone" | "loft" | "engine" | "terrace";
export interface Space {
  id: SpaceId;
  name: L;
  floor: L;
  area: number;
  ceiling: L;
  /** `null` = this layout doesn't work in the space. */
  caps: Record<LayoutId, number | null>;
  weekday: number;
  weekend: number;
  line: L;
  features: L[];
  photo: { src: string; width: number; height: number; alt: L };
  /** Plan shape in the site-plan SVG (viewBox 800 × 520). */
  plan: { x: number; y: number; w: number; h: number; outdoor?: boolean; upper?: boolean };
}

export const spaces: Space[] = [
  {
    id: "grain",
    name: { en: "Grain Hall", tr: "Tahıl Salonu" },
    floor: { en: "Ground floor", tr: "Zemin kat" },
    area: 620,
    ceiling: { en: "9.4 m to the trusses", tr: "Makaslara 9,4 m" },
    caps: { theatre: 420, banquet: 280, cabaret: 210, classroom: 180, reception: 450, boardroom: null },
    weekday: 165000,
    weekend: 240000,
    line: { en: "The old milling floor: one open room under 1911 pine trusses, with the original hoist still overhead.", tr: "Eski öğütme katı: 1911 çam makasların altında tek açık salon; orijinal vinç hâlâ tepede." },
    features: [{ en: "Stage 8 × 4 m", tr: "8 × 4 m sahne" }, { en: "Full blackout", tr: "Tam karartma" }, { en: "Rigging points, 500 kg each", tr: "500 kg’lık asma noktaları" }, { en: "Step-free from the yard", tr: "Avludan basamaksız" }],
    photo: photos.hall,
    plan: { x: 270, y: 90, w: 340, h: 250 },
  },
  {
    id: "millstone",
    name: { en: "Millstone Room", tr: "Değirmen Taşı Odası" },
    floor: { en: "Ground floor", tr: "Zemin kat" },
    area: 210,
    ceiling: { en: "5.2 m, vaulted brick", tr: "5,2 m, tuğla tonoz" },
    caps: { theatre: 140, banquet: 96, cabaret: 72, classroom: 64, reception: 160, boardroom: 36 },
    weekday: 58000,
    weekend: 72000,
    line: { en: "Brick vaults and the two original millstones set into the floor. Our favourite room for dinners.", tr: "Tuğla tonozlar ve zemine gömülü iki orijinal değirmen taşı. Akşam yemekleri için en sevdiğimiz oda." },
    features: [{ en: "Own bar", tr: "Kendi barı" }, { en: "Fireplace", tr: "Şömine" }, { en: "Opens to the Grain Hall", tr: "Tahıl Salonu’na açılır" }],
    photo: photos.dinner,
    plan: { x: 70, y: 190, w: 190, h: 150 },
  },
  {
    id: "loft",
    name: { en: "Sack Loft", tr: "Çuval Katı" },
    floor: { en: "First floor", tr: "Birinci kat" },
    area: 160,
    ceiling: { en: "4.1 m, exposed beams", tr: "4,1 m, açık kirişler" },
    caps: { theatre: 90, banquet: 60, cabaret: 48, classroom: 40, reception: 120, boardroom: 28 },
    weekday: 42000,
    weekend: 54000,
    line: { en: "Where the flour sacks were stored. North light, oak floor, and a lift as well as the stairs.", tr: "Un çuvallarının saklandığı yer. Kuzey ışığı, meşe zemin; merdivenin yanında asansör de var." },
    features: [{ en: "Lift access", tr: "Asansörle erişim" }, { en: "Daylight, blinds", tr: "Gün ışığı, perde" }, { en: "Built-in screen", tr: "Sabit ekran" }],
    photo: photos.loft,
    plan: { x: 630, y: 70, w: 150, h: 110, upper: true },
  },
  {
    id: "engine",
    name: { en: "Engine Room", tr: "Makine Dairesi" },
    floor: { en: "Ground floor", tr: "Zemin kat" },
    area: 85,
    ceiling: { en: "6 m, brick", tr: "6 m, tuğla" },
    caps: { theatre: 40, banquet: 24, cabaret: 18, classroom: 20, reception: 50, boardroom: 18 },
    weekday: 22000,
    weekend: 28000,
    line: { en: "The turbine housing, now a small room with a big window onto the race. Board meetings, small ceremonies, a green room.", tr: "Türbin odası; şimdi su kanalına bakan büyük pencereli küçük bir oda. Yönetim toplantıları, küçük törenler, kulis." },
    features: [{ en: "Private entrance", tr: "Ayrı giriş" }, { en: "Window on the race", tr: "Kanala bakan pencere" }],
    photo: photos.engine,
    plan: { x: 620, y: 220, w: 120, h: 120 },
  },
  {
    id: "terrace",
    name: { en: "Mill Race Terrace", tr: "Su Kanalı Terası" },
    floor: { en: "Outdoors · April to October", tr: "Açık hava · Nisan–Ekim" },
    area: 300,
    ceiling: { en: "Open sky, festoon lights", tr: "Açık gökyüzü, ışık zincirleri" },
    caps: { theatre: 160, banquet: 140, cabaret: 100, classroom: null, reception: 250, boardroom: null },
    weekday: 48000,
    weekend: 60000,
    line: { en: "Stone terrace along the mill race, under plane trees. Ceremonies at six, dinner as the light goes.", tr: "Çınarların altında, su kanalı boyunca taş teras. Saat altıda tören, ışık giderken yemek." },
    features: [{ en: "Covered fallback in the Grain Hall", tr: "Yağmurda Tahıl Salonu" }, { en: "Heaters from October", tr: "Ekim’den itibaren ısıtıcı" }],
    photo: photos.terrace,
    plan: { x: 120, y: 370, w: 560, h: 60, outdoor: true },
  },
];
export const spaceById = (id: string) => spaces.find((s) => s.id === id);

export const history: { year: string; text: L }[] = [
  { year: "1911", text: { en: "The Kalkan brothers build a water-powered flour mill on the Ömerli stream.", tr: "Kalkan kardeşler Ömerli deresi üzerinde su gücüyle çalışan bir un değirmeni kurar." } },
  { year: "1952", text: { en: "A diesel engine replaces the wheel; the Engine Room is built beside the race.", tr: "Çarkın yerini bir dizel motor alır; Makine Dairesi kanalın yanına inşa edilir." } },
  { year: "1987", text: { en: "Milling stops. The building stands empty for thirty years.", tr: "Öğütme durur. Bina otuz yıl boş kalır." } },
  { year: "2019", text: { en: "Restored with the original trusses, millstones and hoist kept in place.", tr: "Orijinal makaslar, değirmen taşları ve vinç yerinde bırakılarak restore edilir." } },
];

export const included: { title: L; body: L }[] = [
  { title: { en: "Tables and 450 chairs", tr: "Masalar ve 450 sandalye" }, body: { en: "Oak trestles, rounds of 10 and bentwood chairs.", tr: "Meşe sehpalar, 10 kişilik yuvarlaklar ve bükme sandalyeler." } },
  { title: { en: "Sound and light", tr: "Ses ve ışık" }, body: { en: "Two 5 kW PA systems, a 16-channel desk, warm house lighting on dimmers.", tr: "İki adet 5 kW ses sistemi, 16 kanallı mikser, dimmerli sıcak salon ışığı." } },
  { title: { en: "A venue manager", tr: "Mekân sorumlusu" }, body: { en: "From the first visit to the last guest; one person, one phone number.", tr: "İlk ziyaretten son misafire kadar; tek kişi, tek telefon numarası." } },
  { title: { en: "Parking for 80", tr: "80 araçlık otopark" }, body: { en: "Plus a coach bay, and a shuttle from Ümraniye metro for larger events.", tr: "Ayrıca otobüs yeri; büyük etkinliklerde Ümraniye metrosundan servis." } },
];

export const quotes: { quote: L; name: string; role: L }[] = [
  { quote: { en: "We had 260 people for dinner in the Grain Hall and it still felt like a room, not a hangar. Selin ran the night like a stage manager.", tr: "Tahıl Salonu’nda 260 kişiyle yemek yedik ve yine de bir hangar değil bir oda gibi hissettirdi. Selin geceyi bir sahne amiri gibi yönetti." }, name: "Ayşe & Kaan Oral", role: { en: "Wedding, September 2025", tr: "Düğün, Eylül 2025" } },
  { quote: { en: "Two days, 380 attendees, the loft for workshops. The blackout and the rigging points saved our production budget.", tr: "İki gün, 380 katılımcı, atölyeler için çatı katı. Karartma ve asma noktaları prodüksiyon bütçemizi kurtardı." }, name: "Mert Yalın", role: { en: "Head of events, Kestrel Labs", tr: "Etkinlik direktörü, Kestrel Labs" } },
];

export const viewingHours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    tue: [{ open: "10:00", close: "18:00" }],
    wed: [{ open: "10:00", close: "18:00" }],
    thu: [{ open: "10:00", close: "18:00" }],
    fri: [{ open: "10:00", close: "16:00" }],
    sat: [{ open: "11:00", close: "15:00" }],
  },
};

const streetMap = {
  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'%3E%3Cdefs%3E%3Cpattern id='t' width='70' height='70' patternUnits='userSpaceOnUse'%3E%3Crect width='70' height='70' fill='%23f5f6f1'/%3E%3Ccircle cx='20' cy='22' r='9' fill='%23e2e5da'/%3E%3Ccircle cx='52' cy='50' r='11' fill='%23e2e5da'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='1200' height='900' fill='url(%23t)'/%3E%3Cpath d='M-20 620C200 560 380 640 600 600S960 470 1220 520' fill='none' stroke='%23cdd6da' stroke-width='40'/%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cg stroke='%23d6d5ce' stroke-width='26'%3E%3Cpath d='M-20 300C300 340 600 280 1220 330'/%3E%3Cpath d='M640 -20C620 200 600 400 620 560'/%3E%3C/g%3E%3Cg stroke='%23fff' stroke-width='16'%3E%3Cpath d='M-20 300C300 340 600 280 1220 330'/%3E%3Cpath d='M640 -20C620 200 600 400 620 560'/%3E%3C/g%3E%3C/g%3E%3Crect x='560' y='440' width='150' height='90' rx='3' fill='%23dcdfd2'/%3E%3C/svg%3E",
  width: 1200,
  height: 900,
  alt: "",
};

export function mill(t: (v: L) => string): Branch {
  return {
    name: "Old Mill Hall",
    address: { line: "Değirmen Yolu 4", district: "Ömerli", city: "Çekmeköy", region: "İstanbul", postalCode: "34797", country: "TR", geo: { lat: 41.0571, lng: 29.3502 } },
    phone: PHONE,
    email: EMAIL,
    hours: viewingHours,
    mapImage: streetMap,
    notes: t({ en: "Viewings by appointment in these hours. 35 minutes from Kadıköy outside rush hour; follow the signs for Ömerli Barajı, then the stream.", tr: "Bu saatlerde randevuyla gezi. Yoğun saatler dışında Kadıköy’den 35 dakika; Ömerli Barajı tabelalarını, sonra dereyi izleyin." }),
  };
}

export const faq: { q: L; a: L }[] = [
  { q: { en: "Can we use our own caterer?", tr: "Kendi yemek firmamızla çalışabilir miyiz?" }, a: { en: "Yes. Our in-house partner is Kiln Kitchen; an outside caterer pays a ₺15,000 kitchen fee and needs our food-safety checklist.", tr: "Evet. Kurum içi ortağımız Kiln Kitchen; dışarıdan bir firma ₺15.000 mutfak ücreti öder ve gıda güvenliği listemizi doldurur." } },
  { q: { en: "How late can we go?", tr: "Ne kadar geç saate kadar kalabiliriz?" }, a: { en: "Music until 01:00 indoors and 23:00 on the terrace, guests out by 01:30. We’re by a village, and we’d like to stay welcome there.", tr: "İç mekânda 01:00’e, terasta 23:00’e kadar müzik; misafirler 01:30’da çıkar. Bir köyün yanındayız ve orada sevilmeye devam etmek istiyoruz." } },
  { q: { en: "How do we hold a date?", tr: "Bir tarihi nasıl ayırtırız?" }, a: { en: "Send an enquiry and we’ll hold the date for seven days, free. A 30% deposit confirms it.", tr: "Talep gönderin; tarihi yedi gün ücretsiz tutarız. %30 kapora ile kesinleşir." } },
  { q: { en: "Is the building accessible?", tr: "Bina erişilebilir mi?" }, a: { en: "Every space is step-free or served by the lift; there are two accessible toilets and a hearing loop in the Grain Hall.", tr: "Tüm alanlar basamaksız ya da asansörle erişilebilir; iki engelli tuvaleti ve Tahıl Salonu’nda işitme döngüsü var." } },
];
