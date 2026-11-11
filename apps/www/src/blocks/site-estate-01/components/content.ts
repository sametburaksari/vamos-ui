// Sample content for "Harbourline Homes", a fictional Istanbul agency for city apartments.
// Every human-readable field is `{ en, tr }`; prices are whole Turkish lira as decimal strings.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };
export type Deal = "sale" | "rent";

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const WHATSAPP = "+902160000000";
export const EMAIL = "hello@harbourline.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: number | string, locale: SiteLocale, compact = false) =>
  createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", compact ? { currencyDisplay: "narrowSymbol", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 } : { currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

const unsplash = (id: string, w = 1600, h = 1067) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: L;
}

export const ph = {
  living: { ...unsplash("1502672260266-1c1ef2d93688"), alt: { en: "Living room with a grey sofa, plants and tall windows", tr: "Gri kanepe, bitkiler ve yüksek pencereli oturma odası" } },
  kitchen: { ...unsplash("1484154218962-a197022b5858"), alt: { en: "White kitchen with an island and black pendant lights", tr: "Adalı, siyah sarkıt lambalı beyaz mutfak" } },
  bedroom: { ...unsplash("1505693416388-ac5ce068fe85"), alt: { en: "Bedroom with an upholstered headboard and morning light", tr: "Döşemeli başlıklı, sabah ışığı alan yatak odası" } },
  lounge: { ...unsplash("1513694203232-719a280e022f"), alt: { en: "Lounge with a dark sofa, a dresser and a dried-flower vase", tr: "Koyu kanepe, şifonyer ve kuru çiçekli vazolu salon" } },
  reading: { ...unsplash("1586023492125-27b2c045efd7"), alt: { en: "Reading corner with a yellow armchair and a floor lamp", tr: "Sarı koltuk ve ayaklı lambalı okuma köşesi" } },
  studio: { ...unsplash("1554995207-c18c203602cb"), alt: { en: "Open-plan room with a tan leather sofa and wood floors", tr: "Taba deri kanepeli, ahşap zeminli açık plan oda" } },
  dining: { ...unsplash("1522708323590-d24dbb6b0267"), alt: { en: "Dining table by the window, an armchair and a bookcase", tr: "Pencere önünde yemek masası, bir koltuk ve kitaplık" } },
  stairs: { ...unsplash("1502005229762-cf1b2da7c5d6"), alt: { en: "Open timber staircase in a double-height loft", tr: "Çift yükseklikli lofta açık ahşap merdiven" } },
  modern: { ...unsplash("1600607687939-ce8a6c25118c"), alt: { en: "Modern living room with a walnut wall and a white sofa", tr: "Ceviz duvarlı, beyaz kanepeli modern salon" } },
  bright: { ...unsplash("1600210492486-724fe5c67fb0"), alt: { en: "Bright living room with a gallery wall and linen sofas", tr: "Galeri duvarlı, keten kanepeli aydınlık salon" } },
  blue: { ...unsplash("1493809842364-78817add7ffb"), alt: { en: "Living room with a blue sofa and a white sideboard", tr: "Mavi kanepe ve beyaz konsollu oturma odası" } },
  panorama: { ...unsplash("1560448204-e02f11c3d0e2"), alt: { en: "Living and dining room with wide windows over the city", tr: "Şehre bakan geniş pencereli salon ve yemek alanı" } },
  blockGlass: { ...unsplash("1545324418-cc1a3fa10c00"), alt: { en: "A dark-clad apartment block with deep balconies", tr: "Derin balkonlu, koyu cepheli apartman" } },
  blockBlue: { ...unsplash("1460317442991-0ec209397118"), alt: { en: "Blue and orange balconies of a modern block", tr: "Modern bir binanın mavi ve turuncu balkonları" } },
  blockBrick: { ...unsplash("1574362848149-11496d93a7c7"), alt: { en: "Brick apartment building among autumn trees", tr: "Sonbahar ağaçları arasında tuğla apartman" } },
  towers: { ...unsplash("1486406146926-c627a92ad1ab"), alt: { en: "Glass office towers seen from below", tr: "Alttan görülen cam ofis kuleleri" } },
} satisfies Record<string, Photo>;

export interface Agent {
  id: string;
  name: string;
  role: L;
  areas: L;
  phone: string;
  photo: Photo;
  languages: L;
}

export const agents: Agent[] = [
  { id: "selma", name: "Selma Yurt", role: { en: "Partner · Asian side", tr: "Ortak · Anadolu yakası" }, areas: { en: "Moda · Fenerbahçe · Acıbadem", tr: "Moda · Fenerbahçe · Acıbadem" }, phone: "+902160000001", languages: { en: "Turkish, English", tr: "Türkçe, İngilizce" }, photo: { ...unsplash("1573496359142-b8d87734a5a2", 800, 1000), alt: { en: "Selma Yurt in a grey blazer by a window", tr: "Pencere önünde gri ceketli Selma Yurt" } } },
  { id: "okan", name: "Okan Erdem", role: { en: "Senior agent · Beyoğlu", tr: "Kıdemli danışman · Beyoğlu" }, areas: { en: "Cihangir · Karaköy · Kurtuluş", tr: "Cihangir · Karaköy · Kurtuluş" }, phone: "+902160000002", languages: { en: "Turkish, English, German", tr: "Türkçe, İngilizce, Almanca" }, photo: { ...unsplash("1560250097-0b93528c311a", 800, 1000), alt: { en: "Okan Erdem in a navy suit, smiling", tr: "Lacivert takım elbiseli, gülümseyen Okan Erdem" } } },
  { id: "pinar", name: "Pınar Gül", role: { en: "Rentals lead", tr: "Kiralama sorumlusu" }, areas: { en: "Bebek · Üsküdar · rentals citywide", tr: "Bebek · Üsküdar · tüm şehirde kiralık" }, phone: "+902160000003", languages: { en: "Turkish, English, Russian", tr: "Türkçe, İngilizce, Rusça" }, photo: { ...unsplash("1619895862022-09114b41f16f", 800, 1000), alt: { en: "Pınar Gül with long hair, in a striped top", tr: "Uzun saçlı, çizgili bluzlu Pınar Gül" } } },
];
export const agentById = (id: string) => agents.find((a) => a.id === id) ?? agents[0]!;

export type Hood = "moda" | "cihangir" | "bebek" | "kurtulus" | "karakoy" | "uskudar" | "acibadem" | "fenerbahce";
export const hoods: Record<Hood, { name: string; side: L }> = {
  moda: { name: "Moda", side: { en: "Kadıköy, Asian side", tr: "Kadıköy, Anadolu yakası" } },
  cihangir: { name: "Cihangir", side: { en: "Beyoğlu, European side", tr: "Beyoğlu, Avrupa yakası" } },
  bebek: { name: "Bebek", side: { en: "Beşiktaş, European side", tr: "Beşiktaş, Avrupa yakası" } },
  kurtulus: { name: "Kurtuluş", side: { en: "Şişli, European side", tr: "Şişli, Avrupa yakası" } },
  karakoy: { name: "Karaköy", side: { en: "Beyoğlu, European side", tr: "Beyoğlu, Avrupa yakası" } },
  uskudar: { name: "Üsküdar", side: { en: "Üsküdar, Asian side", tr: "Üsküdar, Anadolu yakası" } },
  acibadem: { name: "Acıbadem", side: { en: "Kadıköy, Asian side", tr: "Kadıköy, Anadolu yakası" } },
  fenerbahce: { name: "Fenerbahçe", side: { en: "Kadıköy, Asian side", tr: "Kadıköy, Anadolu yakası" } },
};

export interface Listing {
  id: string;
  ref: string;
  title: L;
  deal: Deal;
  hood: Hood;
  rooms: "1+1" | "2+1" | "3+1" | "4+1";
  /** Net m². */
  size: number;
  floor: L;
  built: number;
  /** Sale price or monthly rent, TRY. */
  price: string;
  /** Position on the neutral map, viewBox 1000 × 700. */
  at: { x: number; y: number };
  photos: Photo[];
  agent: string;
  /** `YYYY-MM-DD` */
  listed: string;
  features: L[];
  description: L;
  featured?: boolean;
}

export const listings: Listing[] = [
  {
    id: "moda-sea-view",
    ref: "HL-2417",
    title: { en: "Sea-view 2+1 on Moda’s quiet side", tr: "Moda’nın sakin yakasında deniz manzaralı 2+1" },
    deal: "sale",
    hood: "moda",
    rooms: "2+1",
    size: 105,
    floor: { en: "4th of 5", tr: "5 katın 4.’sü" },
    built: 2014,
    price: "14750000",
    at: { x: 636, y: 598 },
    photos: [ph.living, ph.kitchen, ph.bedroom, ph.lounge],
    agent: "selma",
    listed: "2026-11-04",
    features: [{ en: "Sea view from the living room", tr: "Salondan deniz manzarası" }, { en: "Lift and parking space", tr: "Asansör ve otopark yeri" }, { en: "Underfloor heating", tr: "Yerden ısıtma" }, { en: "4 min walk to the Moda tram", tr: "Moda tramvayına 4 dk yürüme" }],
    description: {
      en: "A corner flat on a street of plane trees, two blocks from the sea. The living room faces south-west over the rooftops to the Princes’ Islands; both bedrooms face the garden at the back. Renovated in 2024 with oak floors and a new kitchen.",
      tr: "Çınarlı bir sokakta, denize iki blok mesafede köşe daire. Salon güneybatıya, çatıların üzerinden Adalar’a bakıyor; iki yatak odası da arka bahçeye bakar. 2024’te meşe parke ve yeni mutfakla yenilendi.",
    },
    featured: true,
  },
  {
    id: "cihangir-terrace",
    ref: "HL-2398",
    title: { en: "Top-floor 1+1 with a roof terrace", tr: "Çatı teraslı en üst kat 1+1" },
    deal: "rent",
    hood: "cihangir",
    rooms: "1+1",
    size: 70,
    floor: { en: "6th of 6", tr: "6 katın 6.’sı" },
    built: 1965,
    price: "62000",
    at: { x: 402, y: 342 },
    photos: [ph.reading, ph.studio, ph.dining],
    agent: "okan",
    listed: "2026-11-07",
    features: [{ en: "28 m² private terrace", tr: "28 m² özel teras" }, { en: "Furnished, available 1 December", tr: "Eşyalı, 1 Aralık’ta boş" }, { en: "Pets considered", tr: "Evcil hayvan değerlendirilir" }],
    description: {
      en: "The whole top floor of a 1960s building, with a terrace that looks down the hill to the Bosphorus. Rented furnished for a minimum of twelve months; dues and building heating included.",
      tr: "1960’lardan bir binanın tüm en üst katı; terası yokuştan Boğaz’a bakıyor. En az on iki ay eşyalı kiralanır; aidat ve kalorifer dahil.",
    },
    featured: true,
  },
  {
    id: "bebek-1930s",
    ref: "HL-2381",
    title: { en: "3+1 in a 1930s building, Bosphorus glimpse", tr: "1930’lardan binada, Boğaz’ı gören 3+1" },
    deal: "sale",
    hood: "bebek",
    rooms: "3+1",
    size: 165,
    floor: { en: "2nd of 4", tr: "4 katın 2.’si" },
    built: 1934,
    price: "46500000",
    at: { x: 522, y: 196 },
    photos: [ph.modern, ph.bright, ph.bedroom, ph.kitchen],
    agent: "pinar",
    listed: "2026-10-28",
    features: [{ en: "3.4 m ceilings, original mouldings", tr: "3,4 m tavan, özgün kartonpiyer" }, { en: "Two balconies", tr: "İki balkon" }, { en: "Earthquake assessment 2025: passed", tr: "2025 deprem değerlendirmesi: uygun" }],
    description: {
      en: "One flat per floor in a stone building above the Bebek shoreline. The front rooms catch a slice of the Bosphorus between the trees; the kitchen and the third bedroom face a quiet courtyard.",
      tr: "Bebek sahilinin üzerinde, her katta tek daire olan taş bir bina. Ön odalar ağaçların arasından Boğaz’dan bir dilim görür; mutfak ve üçüncü yatak odası sakin bir avluya bakar.",
    },
    featured: true,
  },
  {
    id: "kurtulus-tram",
    ref: "HL-2402",
    title: { en: "Bright 2+1 near the metro", tr: "Metroya yakın aydınlık 2+1" },
    deal: "sale",
    hood: "kurtulus",
    rooms: "2+1",
    size: 95,
    floor: { en: "3rd of 5", tr: "5 katın 3.’sü" },
    built: 2009,
    price: "8900000",
    at: { x: 366, y: 252 },
    photos: [ph.blue, ph.kitchen, ph.panorama],
    agent: "okan",
    listed: "2026-11-02",
    features: [{ en: "6 min walk to Osmanbey metro", tr: "Osmanbey metrosuna 6 dk yürüme" }, { en: "South-facing", tr: "Güney cephe" }, { en: "Storage room in the basement", tr: "Bodrumda depo" }],
    description: {
      en: "A practical, sunny flat on a residential street with a bakery on the corner. Combi boiler from 2023, double glazing throughout, and a separate kitchen that could be opened up.",
      tr: "Köşesinde fırın olan bir konut sokağında pratik, güneşli bir daire. 2023 kombi, her yerde çift cam ve açılabilecek ayrı bir mutfak.",
    },
  },
  {
    id: "karakoy-loft",
    ref: "HL-2391",
    title: { en: "Loft 1+1 above the old warehouses", tr: "Eski depoların üzerinde loft 1+1" },
    deal: "rent",
    hood: "karakoy",
    rooms: "1+1",
    size: 88,
    floor: { en: "5th of 5 (duplex)", tr: "5 katın 5.’si (dubleks)" },
    built: 1912,
    price: "85000",
    at: { x: 432, y: 392 },
    photos: [ph.stairs, ph.modern, ph.studio],
    agent: "okan",
    listed: "2026-10-30",
    features: [{ en: "Double-height living room", tr: "Çift yükseklikli salon" }, { en: "Air conditioning", tr: "Klima" }, { en: "Short walk to the ferry", tr: "İskeleye kısa yürüme" }],
    description: {
      en: "A converted 1912 warehouse floor with exposed brick, steel windows and a timber mezzanine bedroom. Unfurnished; available now for a two-year lease.",
      tr: "Açık tuğla, çelik pencereler ve ahşap asma kat yatak odasıyla dönüştürülmüş 1912 tarihli bir depo katı. Eşyasız; iki yıllık kira için hemen boş.",
    },
  },
  {
    id: "uskudar-garden",
    ref: "HL-2372",
    title: { en: "3+1 with use of the garden", tr: "Bahçe kullanımlı 3+1" },
    deal: "sale",
    hood: "uskudar",
    rooms: "3+1",
    size: 140,
    floor: { en: "Raised ground of 4", tr: "4 katın yüksek girişi" },
    built: 2017,
    price: "18200000",
    at: { x: 690, y: 405 },
    photos: [ph.panorama, ph.lounge, ph.dining],
    agent: "pinar",
    listed: "2026-10-21",
    features: [{ en: "Shared garden with fruit trees", tr: "Meyve ağaçlı ortak bahçe" }, { en: "Two bathrooms", tr: "İki banyo" }, { en: "10 min to the Marmaray", tr: "Marmaray’a 10 dk" }],
    description: {
      en: "A family flat with direct access to the building’s garden, on a cul-de-sac above the Üsküdar ferry. Built in 2017 to the current earthquake code.",
      tr: "Üsküdar iskelesinin üzerinde çıkmaz bir sokakta, binanın bahçesine doğrudan çıkışı olan bir aile dairesi. 2017’de güncel deprem yönetmeliğine göre yapıldı.",
    },
  },
  {
    id: "acibadem-new",
    ref: "HL-2410",
    title: { en: "New-build 2+1 with parking", tr: "Otoparklı yeni bina 2+1" },
    deal: "rent",
    hood: "acibadem",
    rooms: "2+1",
    size: 100,
    floor: { en: "8th of 12", tr: "12 katın 8.’i" },
    built: 2025,
    price: "48000",
    at: { x: 766, y: 482 },
    photos: [ph.bright, ph.reading, ph.blue],
    agent: "selma",
    listed: "2026-11-06",
    features: [{ en: "Indoor parking, one space", tr: "Kapalı otopark, bir araçlık" }, { en: "Gym and concierge", tr: "Spor salonu ve resepsiyon" }, { en: "Available 15 November", tr: "15 Kasım’da boş" }],
    description: {
      en: "A first-occupancy flat in a 2025 building with a concierge, a small gym and a playground. Kitchen appliances included; the rest is unfurnished.",
      tr: "Resepsiyonu, küçük spor salonu ve oyun alanı olan 2025 yapımı bir binada ilk kez oturulacak daire. Mutfak cihazları dahil; geri kalanı eşyasız.",
    },
  },
  {
    id: "fenerbahce-park",
    ref: "HL-2366",
    title: { en: "4+1 by the park, two balconies", tr: "Park kenarında iki balkonlu 4+1" },
    deal: "sale",
    hood: "fenerbahce",
    rooms: "4+1",
    size: 190,
    floor: { en: "3rd of 6", tr: "6 katın 3.’sü" },
    built: 2003,
    price: "32000000",
    at: { x: 704, y: 656 },
    photos: [ph.dining, ph.modern, ph.bedroom, ph.living],
    agent: "selma",
    listed: "2026-10-15",
    features: [{ en: "Park view from both balconies", tr: "İki balkondan park manzarası" }, { en: "Master bedroom with en suite", tr: "Ebeveyn banyolu yatak odası" }, { en: "Generator and 24 h security", tr: "Jeneratör ve 24 saat güvenlik" }],
    description: {
      en: "A large family flat next to the Fenerbahçe park, five minutes from the marina. Every room has a window; the two balconies face the park and the sea air.",
      tr: "Fenerbahçe parkının yanında, marinaya beş dakika geniş bir aile dairesi. Her odanın penceresi var; iki balkon parka ve deniz havasına bakıyor.",
    },
  },
];
export const listingById = (id: string) => listings.find((l) => l.id === id) ?? listings[0]!;

export const guides: { hood: Hood; photo: Photo; line: L; sqm: string; rent: string; commute: L }[] = [
  { hood: "moda", photo: ph.blockBrick, line: { en: "Sea walks, second-hand bookshops and the tram.", tr: "Sahil yürüyüşü, sahaflar ve tramvay." }, sqm: "142000", rent: "55000", commute: { en: "Ferry to Karaköy · 20 min", tr: "Karaköy’e vapur · 20 dk" } },
  { hood: "cihangir", photo: ph.blockBlue, line: { en: "Steep streets, cafés and views down to the water.", tr: "Dik sokaklar, kafeler ve suya inen manzaralar." }, sqm: "168000", rent: "60000", commute: { en: "Funicular to Taksim · 2 min", tr: "Taksim’e füniküler · 2 dk" } },
  { hood: "bebek", photo: ph.blockGlass, line: { en: "Old stone buildings above the shoreline.", tr: "Sahilin üzerinde eski taş binalar." }, sqm: "285000", rent: "120000", commute: { en: "To Levent by car · 15 min", tr: "Levent’e arabayla · 15 dk" } },
  { hood: "uskudar", photo: ph.towers, line: { en: "Family streets, gardens and the Marmaray.", tr: "Aile sokakları, bahçeler ve Marmaray." }, sqm: "118000", rent: "42000", commute: { en: "Marmaray to Sirkeci · 4 min", tr: "Sirkeci’ye Marmaray · 4 dk" } },
];

export const photosHero = { ...unsplash("1560448204-e02f11c3d0e2", 2000, 1300), alt: { en: "", tr: "" } };
