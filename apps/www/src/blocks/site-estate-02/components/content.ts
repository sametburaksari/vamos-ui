// Sample content for "Vellacourt", a fictional private office for exceptional homes in and
// around Istanbul. Every human-readable field is `{ en, tr }`. Houses, prices and people are invented.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Cypress green: deep, quiet, never a "luxury gold". SiteShell lifts it for dark mode. */
export const ACCENT = "#2E5B4B";

export const PHONE = "+902160000000";
export const EMAIL = "office@vellacourt.example.com";
export const ADDRESS = "Teşvikiye Caddesi 41, Kat 4, 34365 Şişli / İstanbul";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
/** Euro, no decimals: "€14,800,000" / "14.800.000 €". */
export const eur = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "EUR" }).currency(value, "EUR", { maximumFractionDigits: 0 });
export const num = (value: number, locale: SiteLocale) => createFormatter(intlOf(locale)).number(value);

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=74&auto=format&fit=crop`, width: w, height: h });

export interface Photo {
  src: string;
  width: number;
  height: number;
  focal?: { x: number; y: number };
  alt: L;
}

export const photos = {
  timber: { ...unsplash("1600585154340-be6161a56a0c", 2400, 1600), focal: { x: 0.5, y: 0.55 }, alt: { en: "A dark timber house with tall glazed openings beside an old tree, at dusk", tr: "Yaşlı bir ağacın yanında, geniş camlı koyu ahşap bir ev, alacakaranlıkta" } },
  cubic: { ...unsplash("1523217582562-09d0def993a6", 2400, 1600), focal: { x: 0.5, y: 0.5 }, alt: { en: "A white cubic house with deep openings around a planted courtyard", tr: "Bitkili bir avlunun çevresinde derin açıklıklı beyaz kübik bir ev" } },
  city: { ...unsplash("1560448204-e02f11c3d0e2", 2400, 1600), focal: { x: 0.5, y: 0.5 }, alt: { en: "A living and dining room with wide windows over the city", tr: "Şehre bakan geniş pencereli bir oturma ve yemek odası" } },
  stair: { ...unsplash("1502005229762-cf1b2da7c5d6", 1600, 2000), focal: { x: 0.5, y: 0.4 }, alt: { en: "An open timber staircase rising through a double-height loft", tr: "Çift yükseklikli bir loftta yükselen açık ahşap merdiven" } },
  garden: { ...unsplash("1600607687939-ce8a6c25118c", 2400, 1600), focal: { x: 0.5, y: 0.5 }, alt: { en: "A bright living room with a timber ceiling and full-height windows to the garden", tr: "Ahşap tavanlı, bahçeye açılan boydan pencereli aydınlık bir salon" } },
  kitchen: { ...unsplash("1600585152220-90363fe7e115", 2000, 1400), alt: { en: "An open-plan kitchen with a long white island and timber stools", tr: "Uzun beyaz adası ve ahşap taburelerle açık planlı mutfak" } },
  kitchen2: { ...unsplash("1484154218962-a197022b5858", 2000, 1400), alt: { en: "A white kitchen with an island under black pendant lights", tr: "Siyah sarkıt lambalar altında adalı beyaz mutfak" } },
  bedroom: { ...unsplash("1505693416388-ac5ce068fe85", 2000, 1400), alt: { en: "A bedroom with an upholstered headboard in morning light", tr: "Sabah ışığında döşemeli başlıklı bir yatak odası" } },
  bedroom2: { ...unsplash("1505691938895-1758d7feb511", 2000, 1400), alt: { en: "A quiet guest room with linen bedding and soft daylight", tr: "Keten nevresimli, yumuşak gün ışığı alan sakin bir misafir odası" } },
  lounge: { ...unsplash("1600210492486-724fe5c67fb0", 2000, 1400), alt: { en: "A light sitting room with linen sofas and a gallery wall", tr: "Keten kanepeli ve tablo duvarlı aydınlık bir oturma odası" } },
  leather: { ...unsplash("1554995207-c18c203602cb", 2000, 1400), alt: { en: "An open-plan room with a tan leather sofa and wide-board oak floors", tr: "Taba deri kanepeli, geniş meşe döşemeli açık planlı bir oda" } },
  dining: { ...unsplash("1522708323590-d24dbb6b0267", 2000, 1400), alt: { en: "A dining table by the window, with an armchair and a bookcase", tr: "Pencere önünde yemek masası, bir koltuk ve kitaplık" } },
  library: { ...unsplash("1505664194779-8beaceb93744", 2000, 1400), alt: { en: "A library with tall shelves and two marble busts", tr: "Yüksek raflı ve iki mermer büstlü bir kütüphane" } },
  plants: { ...unsplash("1502672260266-1c1ef2d93688", 2000, 1400), alt: { en: "A living room with a grey sofa, plants and tall windows", tr: "Gri kanepeli, bitkili ve uzun pencereli bir oturma odası" } },
} satisfies Record<string, Photo>;

// ------------------------------------------------------------------ residences

export type Region = "bosphorus" | "city" | "aegean" | "forest";

export interface Room {
  id: string;
  name: L;
  /** "6.4 × 9.1 m". */
  size: string;
  note: L;
  photo: Photo;
  /** Plan rectangle in a 600 × 400 drawing (x, y, w, h). */
  rect: [number, number, number, number];
}

export interface Residence {
  id: string;
  name: string;
  place: L;
  region: Region;
  /** Decimal string; `null` = price on request. */
  price: string | null;
  area: number;
  plot?: number;
  bedrooms: number;
  bathrooms: number;
  year: number;
  hero: Photo;
  line: L;
  story: L;
  features: L[];
  /** Floor shown on the plan. */
  floor: L;
  rooms: Room[];
  /** Off-market: shown to registered buyers only. */
  offMarket?: boolean;
}

const plan = {
  // six rooms, garden floor
  a: [
    [20, 20, 250, 200],
    [270, 20, 170, 120],
    [440, 20, 140, 200],
    [270, 140, 170, 80],
    [20, 220, 300, 160],
    [320, 220, 260, 160],
  ],
  // five rooms, upper floor
  b: [
    [20, 20, 330, 170],
    [350, 20, 230, 170],
    [20, 190, 180, 190],
    [200, 190, 180, 190],
    [380, 190, 200, 190],
  ],
} as const satisfies Record<string, ReadonlyArray<readonly [number, number, number, number]>>;
const at = (p: keyof typeof plan, i: number) => [...plan[p][i]!] as [number, number, number, number];

export const residences: Residence[] = [
  {
    id: "korusu",
    name: "Korusu House",
    place: { en: "Beykoz, Asian shore of the Bosphorus", tr: "Beykoz, Boğaz’ın Anadolu yakası" },
    region: "bosphorus",
    price: "14800000",
    area: 640,
    plot: 4100,
    bedrooms: 5,
    bathrooms: 6,
    year: 2021,
    hero: photos.timber,
    line: { en: "Charred cedar under a 200-year-old plane tree, ten minutes above the water.", tr: "İki yüz yıllık bir çınarın altında yakılmış sedir, sudan on dakika yukarıda." },
    story: {
      en: "Built by its architect-owner in 2021, Korusu House sits in a clearing of protected woodland above Beykoz. The ground floor is one long room of glass and oiled oak that opens on three sides; the bedrooms above look straight into the canopy. It has never been on the open market.",
      tr: "Mimar sahibi tarafından 2021’de inşa edilen Korusu House, Beykoz’un üzerindeki koruma altındaki ormanlık bir açıklıkta yer alır. Zemin kat, üç yana açılan cam ve yağlı meşeden tek uzun bir odadır; üst kattaki yatak odaları doğrudan ağaçların içine bakar. Daha önce hiç açık piyasada satılmadı.",
    },
    features: [
      { en: "4,100 m² of protected woodland, private gate", tr: "4.100 m² koruma altında orman, özel giriş kapısı" },
      { en: "Ground-source heating, 38 kW solar on the studio roof", tr: "Toprak kaynaklı ısıtma, stüdyo çatısında 38 kW güneş paneli" },
      { en: "Separate two-room studio and staff flat", tr: "Ayrı iki odalı stüdyo ve personel dairesi" },
      { en: "Twelve minutes to the Kanlıca ferry pier", tr: "Kanlıca iskelesine on iki dakika" },
    ],
    floor: { en: "Garden floor · 312 m²", tr: "Bahçe katı · 312 m²" },
    rooms: [
      { id: "living", name: { en: "Living room", tr: "Salon" }, size: "12.4 × 9.6 m", note: { en: "Glass on three sides; the fireplace wall is solid basalt.", tr: "Üç yanı cam; şömine duvarı som bazalt." }, photo: photos.plants, rect: at("a", 0) },
      { id: "kitchen", name: { en: "Kitchen", tr: "Mutfak" }, size: "8.5 × 6.0 m", note: { en: "A 4.2-metre island in one piece of honed marble.", tr: "Tek parça honlu mermerden 4,2 metrelik ada." }, photo: photos.kitchen, rect: at("a", 1) },
      { id: "library", name: { en: "Library", tr: "Kütüphane" }, size: "7.0 × 10.0 m", note: { en: "Floor-to-ceiling walnut shelves with a rolling ladder.", tr: "Tavana kadar ceviz raflar ve kayar merdiven." }, photo: photos.library, rect: at("a", 2) },
      { id: "pantry", name: { en: "Pantry & wine room", tr: "Kiler ve şarap odası" }, size: "8.5 × 4.0 m", note: { en: "Climate-controlled for 900 bottles.", tr: "900 şişe için iklimlendirmeli." }, photo: photos.kitchen2, rect: at("a", 3) },
      { id: "dining", name: { en: "Dining room", tr: "Yemek odası" }, size: "15.0 × 8.0 m", note: { en: "Seats fourteen; sliding walls open to the terrace.", tr: "On dört kişilik; sürgülü duvarlar terasa açılır." }, photo: photos.dining, rect: at("a", 4) },
      { id: "garden-room", name: { en: "Garden room", tr: "Bahçe odası" }, size: "13.0 × 8.0 m", note: { en: "Under the plane tree, with a stone floor that stays cool in August.", tr: "Çınarın altında; taş zemini ağustosta bile serin kalır." }, photo: photos.leather, rect: at("a", 5) },
    ],
  },
  {
    id: "gumusluk",
    name: "Gümüşlük Courtyard House",
    place: { en: "Gümüşlük, Bodrum peninsula", tr: "Gümüşlük, Bodrum yarımadası" },
    region: "aegean",
    price: "6250000",
    area: 410,
    plot: 2300,
    bedrooms: 4,
    bathrooms: 4,
    year: 2018,
    hero: photos.cubic,
    line: { en: "Lime-washed walls around an olive courtyard, the sea at the end of the lane.", tr: "Zeytinli bir avlunun çevresinde kireç badanalı duvarlar; yolun sonunda deniz." },
    story: {
      en: "Four white volumes arranged around a courtyard of old olives, each with its own garden door. Deep window reveals keep the rooms cool without air-conditioning for most of the summer. The beach at Gümüşlük is a six-minute walk.",
      tr: "Yaşlı zeytinlerden oluşan bir avlunun çevresine dizilmiş, her biri kendi bahçe kapısına sahip dört beyaz kütle. Derin pencere boşlukları, yazın büyük bölümünde odaları klimasız serin tutar. Gümüşlük plajı altı dakikalık yürüme mesafesinde.",
    },
    features: [
      { en: "16-metre saltwater pool cut into the rock", tr: "Kayaya oyulmuş 16 metrelik tuzlu su havuzu" },
      { en: "Eleven olive trees, the oldest about 300 years", tr: "En yaşlısı yaklaşık 300 yıllık on bir zeytin ağacı" },
      { en: "Guest house with its own kitchen", tr: "Kendi mutfağı olan misafir evi" },
      { en: "Six minutes’ walk to the beach", tr: "Plaja altı dakika yürüme" },
    ],
    floor: { en: "Courtyard level · 286 m²", tr: "Avlu katı · 286 m²" },
    rooms: [
      { id: "living", name: { en: "Living room", tr: "Salon" }, size: "11.0 × 6.0 m", note: { en: "Opens fully to the courtyard on one side.", tr: "Bir yanı tamamen avluya açılır." }, photo: photos.lounge, rect: at("b", 0) },
      { id: "kitchen", name: { en: "Kitchen", tr: "Mutfak" }, size: "7.6 × 6.0 m", note: { en: "Stone counters and a door to the herb garden.", tr: "Taş tezgâhlar ve aromatik bahçeye açılan kapı." }, photo: photos.kitchen2, rect: at("b", 1) },
      { id: "primary", name: { en: "Primary bedroom", tr: "Ebeveyn yatak odası" }, size: "6.0 × 6.4 m", note: { en: "Its own walled garden and outdoor shower.", tr: "Kendine ait duvarlı bahçe ve açık hava duşu." }, photo: photos.bedroom, rect: at("b", 2) },
      { id: "guest", name: { en: "Guest bedroom", tr: "Misafir yatak odası" }, size: "6.0 × 6.4 m", note: { en: "Looks onto the oldest olive.", tr: "En yaşlı zeytine bakar." }, photo: photos.bedroom2, rect: at("b", 3) },
      { id: "dining", name: { en: "Dining loggia", tr: "Yemek loggiası" }, size: "6.6 × 6.4 m", note: { en: "Covered, open-sided, built for long dinners.", tr: "Üstü kapalı, yanları açık; uzun akşam yemekleri için." }, photo: photos.dining, rect: at("b", 4) },
    ],
  },
  {
    id: "macka",
    name: "Maçka Penthouse",
    place: { en: "Maçka, above the park", tr: "Maçka, parkın üzerinde" },
    region: "city",
    price: "9400000",
    area: 380,
    bedrooms: 3,
    bathrooms: 4,
    year: 1962,
    hero: photos.city,
    line: { en: "The whole top floor of a 1962 building, with the park below and the Bosphorus beyond.", tr: "1962 yapımı bir binanın tüm en üst katı; aşağıda park, ötesinde Boğaz." },
    story: {
      en: "A complete restoration of the top floor of one of Maçka’s best mid-century buildings, finished in 2024. Original terrazzo floors were lifted, numbered and relaid; the new steel windows are the full width of the façade.",
      tr: "Maçka’nın en iyi yüzyıl ortası binalarından birinin en üst katının 2024’te tamamlanan eksiksiz restorasyonu. Özgün mozaik zeminler kaldırıldı, numaralandı ve yeniden döşendi; yeni çelik pencereler cephenin tüm genişliğini kaplar.",
    },
    features: [
      { en: "120 m² of roof terrace on two sides", tr: "İki cephede 120 m² çatı terası" },
      { en: "Private lift lobby, two parking spaces", tr: "Özel asansör holü, iki otopark yeri" },
      { en: "24-hour concierge", tr: "24 saat konsiyerj" },
      { en: "Four minutes’ walk to Nişantaşı", tr: "Nişantaşı’na dört dakika yürüme" },
    ],
    floor: { en: "Ninth floor · 380 m²", tr: "Dokuzuncu kat · 380 m²" },
    rooms: [
      { id: "living", name: { en: "Living & dining", tr: "Salon ve yemek" }, size: "14.0 × 7.2 m", note: { en: "Steel windows the full width of the façade.", tr: "Cephe boyunca çelik pencereler." }, photo: photos.city, rect: at("b", 0) },
      { id: "kitchen", name: { en: "Kitchen", tr: "Mutfak" }, size: "8.0 × 6.2 m", note: { en: "Opens to the east terrace for breakfast.", tr: "Kahvaltı için doğu terasına açılır." }, photo: photos.kitchen, rect: at("b", 1) },
      { id: "primary", name: { en: "Primary bedroom", tr: "Ebeveyn yatak odası" }, size: "6.2 × 7.0 m", note: { en: "Dressing room and a marble bathroom with a window.", tr: "Giyinme odası ve pencereli mermer banyo." }, photo: photos.bedroom, rect: at("b", 2) },
      { id: "study", name: { en: "Study", tr: "Çalışma odası" }, size: "6.2 × 7.0 m", note: { en: "Walnut panelling kept from 1962.", tr: "1962’den korunan ceviz lambri." }, photo: photos.library, rect: at("b", 3) },
      { id: "salon", name: { en: "Salon", tr: "Misafir salonu" }, size: "7.0 × 7.0 m", note: { en: "The corner room, with windows on two sides.", tr: "İki yanı pencereli köşe oda." }, photo: photos.plants, rect: at("b", 4) },
    ],
  },
  {
    id: "zekeriyakoy",
    name: "Zekeriyaköy Garden House",
    place: { en: "Zekeriyaköy, Sarıyer", tr: "Zekeriyaköy, Sarıyer" },
    region: "forest",
    price: null,
    area: 720,
    plot: 5600,
    bedrooms: 6,
    bathrooms: 7,
    year: 2016,
    hero: photos.garden,
    line: { en: "A long, low house in a walled garden at the edge of the Belgrad forest.", tr: "Belgrad ormanının kıyısında, duvarlı bir bahçede uzun, alçak bir ev." },
    story: {
      en: "Offered privately to registered buyers. A single-storey family house with a timber ceiling that runs the full 46 metres, a kitchen garden, an orchard of eighty fruit trees and a covered pool.",
      tr: "Kayıtlı alıcılara özel olarak sunulur. Kırk altı metre boyunca uzanan ahşap tavanlı tek katlı bir aile evi; sebze bahçesi, seksen ağaçlık bir meyve bahçesi ve kapalı havuz.",
    },
    features: [
      { en: "5,600 m² walled garden and orchard", tr: "5.600 m² duvarlı bahçe ve meyve bahçesi" },
      { en: "Covered 20-metre pool", tr: "Kapalı 20 metrelik havuz" },
      { en: "Guest cottage and staff house", tr: "Misafir kulübesi ve personel evi" },
      { en: "Twenty minutes to two international schools", tr: "İki uluslararası okula yirmi dakika" },
    ],
    floor: { en: "Main floor · 520 m²", tr: "Ana kat · 520 m²" },
    offMarket: true,
    rooms: [
      { id: "living", name: { en: "Great room", tr: "Büyük salon" }, size: "16.0 × 9.0 m", note: { en: "Under the full-length timber ceiling.", tr: "Boydan boya ahşap tavanın altında." }, photo: photos.garden, rect: at("a", 0) },
      { id: "kitchen", name: { en: "Kitchen", tr: "Mutfak" }, size: "9.0 × 6.0 m", note: { en: "Two islands, a door to the kitchen garden.", tr: "İki ada; sebze bahçesine açılan kapı." }, photo: photos.kitchen2, rect: at("a", 1) },
      { id: "study", name: { en: "Study", tr: "Çalışma odası" }, size: "6.5 × 9.0 m", note: { en: "Looks along the orchard rows.", tr: "Meyve bahçesinin sıralarına bakar." }, photo: photos.library, rect: at("a", 2) },
      { id: "pantry", name: { en: "Pantry", tr: "Kiler" }, size: "9.0 × 3.6 m", note: { en: "With a cold room for the garden harvest.", tr: "Bahçe hasadı için soğuk odalı." }, photo: photos.kitchen, rect: at("a", 3) },
      { id: "family", name: { en: "Family room", tr: "Aile odası" }, size: "15.0 × 7.5 m", note: { en: "Opens onto the lawn on two sides.", tr: "İki yanından çimenliğe açılır." }, photo: photos.lounge, rect: at("a", 4) },
      { id: "primary", name: { en: "Primary suite", tr: "Ebeveyn süiti" }, size: "13.0 × 7.5 m", note: { en: "Its own terrace towards the forest.", tr: "Ormana bakan kendi terası." }, photo: photos.bedroom, rect: at("a", 5) },
    ],
  },
  {
    id: "arnavutkoy",
    name: "Arnavutköy Loft",
    place: { en: "Arnavutköy, European shore", tr: "Arnavutköy, Avrupa yakası" },
    region: "bosphorus",
    price: "3900000",
    area: 240,
    bedrooms: 2,
    bathrooms: 2,
    year: 1890,
    hero: photos.stair,
    line: { en: "A former boat-builder’s workshop, one street back from the water.", tr: "Sudan bir sokak geride, eski bir tekne yapımcısının atölyesi." },
    story: {
      en: "The brick shell of an 1890 workshop holds a double-height living space, a timber stair and two bedrooms on a gallery. The shore promenade and the ferry are a minute away.",
      tr: "1890 yapımı bir atölyenin tuğla kabuğu; çift yükseklikli bir yaşam alanı, ahşap bir merdiven ve galeride iki yatak odası barındırır. Sahil yolu ve vapur bir dakika uzakta.",
    },
    features: [
      { en: "6.4-metre ceilings and original brick vaults", tr: "6,4 metre tavan ve özgün tuğla tonozlar" },
      { en: "Roof deck with a view up the Bosphorus", tr: "Boğaz’a bakan çatı terası" },
      { en: "One minute to the Arnavutköy pier", tr: "Arnavutköy iskelesine bir dakika" },
    ],
    floor: { en: "Gallery level · 96 m²", tr: "Galeri katı · 96 m²" },
    rooms: [
      { id: "living", name: { en: "Double-height living", tr: "Çift yükseklikli salon" }, size: "10.0 × 6.0 m", note: { en: "Under the restored brick vault.", tr: "Restore edilmiş tuğla tonozun altında." }, photo: photos.stair, rect: at("b", 0) },
      { id: "kitchen", name: { en: "Kitchen", tr: "Mutfak" }, size: "6.0 × 5.0 m", note: { en: "Steel and oak, along the old workshop wall.", tr: "Eski atölye duvarı boyunca çelik ve meşe." }, photo: photos.kitchen, rect: at("b", 1) },
      { id: "primary", name: { en: "Bedroom", tr: "Yatak odası" }, size: "5.0 × 5.2 m", note: { en: "On the gallery, with a round window to the water.", tr: "Galeride, suya bakan yuvarlak pencereli." }, photo: photos.bedroom2, rect: at("b", 2) },
      { id: "guest", name: { en: "Second bedroom", tr: "İkinci yatak odası" }, size: "5.0 × 5.2 m", note: { en: "Or a study above the street.", tr: "Ya da sokağa bakan bir çalışma odası." }, photo: photos.bedroom, rect: at("b", 3) },
      { id: "lounge", name: { en: "Reading gallery", tr: "Okuma galerisi" }, size: "5.6 × 5.2 m", note: { en: "Looks down into the living room.", tr: "Salona yukarıdan bakar." }, photo: photos.leather, rect: at("b", 4) },
    ],
  },
];
export const residenceById = (id: string) => residences.find((r) => r.id === id) ?? residences[0]!;

export const regions: { id: Region | "all"; label: L }[] = [
  { id: "all", label: { en: "All", tr: "Tümü" } },
  { id: "bosphorus", label: { en: "Bosphorus", tr: "Boğaz" } },
  { id: "city", label: { en: "City", tr: "Şehir" } },
  { id: "forest", label: { en: "Forest edge", tr: "Orman kıyısı" } },
  { id: "aegean", label: { en: "Aegean", tr: "Ege" } },
];

/** The reel on the home page: one chapter per residence. */
export const reel = ["korusu", "gumusluk", "macka", "arnavutkoy"];
