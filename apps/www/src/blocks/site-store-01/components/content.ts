// Sample content for "Kilnhouse", a fictional small-batch ceramics studio in Kuzguncuk.
// Every human-readable field is `{ en, tr }`; prices are decimal strings per currency.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type Currency = "USD" | "TRY";
export type L = { en: string; tr: string };

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const EMAIL = "studio@kilnhouse.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-US");
export const defaultCurrency = (locale: SiteLocale): Currency => (locale === "tr" ? "TRY" : "USD");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  const intl = intlOf(locale);
  return {
    t,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

/** Money through the kit formatter, whole units (every price in the shop is a round number). */
export function money(value: number | string, currency: Currency, locale: SiteLocale) {
  return createFormatter(intlOf(locale), { currency }).currency(value, currency, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}

const unsplash = (id: string, w: number, h: number, focal?: { x: number; y: number }) => ({
  src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`,
  width: w,
  height: h,
  ...(focal ? { focal } : null),
});

/** Free delivery above these subtotals; flat rate below. */
export const FREE_SHIPPING: Record<Currency, number> = { USD: 75, TRY: 2500 };
export const SHIPPING: Record<Currency, number> = { USD: 12, TRY: 190 };
export const COURIER: Record<Currency, number> = { USD: 18, TRY: 290 };

export type Category = "tableware" | "cups" | "vases" | "sets";
export const categories: { id: Category; label: L; blurb: L }[] = [
  { id: "tableware", label: { en: "Tableware", tr: "Sofra" }, blurb: { en: "Plates and bowls for every day", tr: "Her gün için tabak ve kâse" } },
  { id: "cups", label: { en: "Cups & mugs", tr: "Fincan ve kupa" }, blurb: { en: "Thrown to fit one hand", tr: "Tek ele oturacak gibi çekildi" } },
  { id: "vases", label: { en: "Vases", tr: "Vazolar" }, blurb: { en: "For one stem or a branch", tr: "Tek dal ya da bir budak için" } },
  { id: "sets", label: { en: "Sets", tr: "Setler" }, blurb: { en: "Matched by the kiln, not a catalogue", tr: "Katalog değil, fırın eşleştirdi" } },
];

export interface Glaze {
  id: string;
  name: L;
  /** The glaze itself — product data shown as a swatch, not a UI colour. */
  swatch: string;
  photo: { src: string; width: number; height: number; focal?: { x: number; y: number } };
  alt: L;
  stock: number;
}

export interface Product {
  id: string;
  name: L;
  category: Category;
  price: Record<Currency, string>;
  /** Kiln batch date, `YYYY-MM-DD`. */
  batch: string;
  isNew?: boolean;
  rating: number;
  reviews: number;
  short: L;
  story: L;
  specs: { size: L; capacity?: L; care: L; clay: L };
  glazes: Glaze[];
}

const glaze = {
  seaSalt: { id: "sea-salt", name: { en: "Sea salt", tr: "Deniz tuzu" }, swatch: "oklch(0.8 0.035 232)" },
  oat: { id: "oat", name: { en: "Oat", tr: "Yulaf" }, swatch: "oklch(0.8 0.055 76)" },
  chalk: { id: "chalk", name: { en: "Chalk", tr: "Tebeşir" }, swatch: "oklch(0.95 0.012 90)" },
  clayFoot: { id: "clay-foot", name: { en: "Clay foot", tr: "Kil taban" }, swatch: "oklch(0.63 0.12 48)" },
  bone: { id: "bone", name: { en: "Bone", tr: "Kemik" }, swatch: "oklch(0.9 0.02 86)" },
  ash: { id: "ash", name: { en: "Ash", tr: "Kül" }, swatch: "oklch(0.52 0.012 250)" },
  milk: { id: "milk", name: { en: "Milk", tr: "Süt" }, swatch: "oklch(0.97 0.006 95)" },
  fog: { id: "fog", name: { en: "Fog", tr: "Sis" }, swatch: "oklch(0.85 0.012 240)" },
  cream: { id: "cream", name: { en: "Cream", tr: "Krem" }, swatch: "oklch(0.92 0.03 85)" },
  latte: { id: "latte", name: { en: "Latte", tr: "Sütlü kahve" }, swatch: "oklch(0.64 0.07 62)" },
  studio: { id: "studio-mix", name: { en: "Studio mix", tr: "Atölye karışık" }, swatch: "oklch(0.74 0.06 66)" },
} as const;

export const products: Product[] = [
  {
    id: "tide-plates",
    name: { en: "Tide dinner plates, set of 4", tr: "Gelgit yemek tabağı, 4’lü" },
    category: "tableware",
    price: { USD: "98", TRY: "3400" },
    batch: "2026-11-03",
    isNew: true,
    rating: 4.9,
    reviews: 41,
    short: { en: "27 cm, a low rim that keeps sauce on the plate.", tr: "27 cm, sosu tabakta tutan alçak kenar." },
    story: {
      en: "Thrown in pairs on the same wheel, then trimmed by hand so no two rims sit exactly alike. The glaze pools where the rim meets the well — that is where you will see the colour change.",
      tr: "Aynı tornada çiftler hâlinde çekilir, sonra elle tıraşlanır; böylece hiçbir kenar birbirinin aynı olmaz. Sır, kenarın çukurla buluştuğu yerde toplanır — renk değişimini orada görürsünüz.",
    },
    specs: { size: { en: "Ø 27 cm · 2.4 cm deep", tr: "Ø 27 cm · 2,4 cm derinlik" }, care: { en: "Dishwasher and microwave safe", tr: "Bulaşık makinesi ve mikrodalgaya uygun" }, clay: { en: "Stoneware, fired to 1,240 °C", tr: "Taşkil, 1.240 °C’de pişirilir" } },
    glazes: [
      { ...glaze.seaSalt, photo: unsplash("1578749556568-bc2c40e68b61", 1200, 1500), alt: { en: "Stacked plates and bowls in a pale blue sea-salt glaze on a wooden table", tr: "Ahşap masada açık mavi deniz tuzu sırlı üst üste tabak ve kâseler" }, stock: 12 },
      { ...glaze.oat, photo: unsplash("1603199506016-b9a594b593c0", 1200, 1500), alt: { en: "Plates in a warm oat glaze, stacked with a patterned bowl", tr: "Desenli bir kâseyle üst üste konmuş sıcak yulaf sırlı tabaklar" }, stock: 3 },
    ],
  },
  {
    id: "morning-cup",
    name: { en: "Morning cup", tr: "Sabah fincanı" },
    category: "cups",
    price: { USD: "22", TRY: "780" },
    batch: "2026-11-05",
    isNew: true,
    rating: 4.8,
    reviews: 126,
    short: { en: "220 ml, no handle — you hold it by the warmth.", tr: "220 ml, kulpsuz — sıcaklığından tutarsınız." },
    story: {
      en: "Our most-made piece: about 300 a month. The unglazed foot is left raw on purpose, so it grips the saucer and shows the clay it came from.",
      tr: "En çok ürettiğimiz parça: ayda yaklaşık 300 adet. Sırsız taban bilerek çıplak bırakılır; tabağı tutar ve geldiği kili gösterir.",
    },
    specs: { size: { en: "Ø 8 cm · 9 cm tall", tr: "Ø 8 cm · 9 cm yükseklik" }, capacity: { en: "220 ml", tr: "220 ml" }, care: { en: "Dishwasher safe", tr: "Bulaşık makinesine uygun" }, clay: { en: "Stoneware with a red-clay foot", tr: "Kırmızı kil tabanlı taşkil" } },
    glazes: [
      { ...glaze.chalk, photo: unsplash("1590422749897-47036da0b0ff", 1200, 1500), alt: { en: "Four chalk-white cups stacked at an angle", tr: "Eğik üst üste dizilmiş dört tebeşir beyazı fincan" }, stock: 40 },
      { ...glaze.clayFoot, photo: unsplash("1610701596007-11502861dcfa", 1200, 1500), alt: { en: "Cream cups with raw terracotta feet in a row", tr: "Sırsız kiremit tabanlı krem fincanlar yan yana" }, stock: 18 },
    ],
  },
  {
    id: "long-neck-bottle",
    name: { en: "Long-neck bottle vase", tr: "Uzun boyunlu şişe vazo" },
    category: "vases",
    price: { USD: "56", TRY: "1950" },
    batch: "2026-10-27",
    rating: 4.9,
    reviews: 33,
    short: { en: "31 cm, for a single dried stem.", tr: "31 cm, tek bir kuru dal için." },
    story: {
      en: "Thrown in two parts and joined while leather-hard. The neck is narrow enough that one stem of oat grass stands on its own.",
      tr: "İki parça hâlinde çekilir ve deri sertliğindeyken birleştirilir. Boyun, tek bir yulaf otu dalının kendi kendine durabileceği kadar dardır.",
    },
    specs: { size: { en: "Ø 9 cm · 31 cm tall", tr: "Ø 9 cm · 31 cm yükseklik" }, care: { en: "Hand wash; watertight", tr: "Elde yıkayın; su geçirmez" }, clay: { en: "Porcelain-stoneware blend", tr: "Porselen-taşkil karışımı" } },
    glazes: [
      { ...glaze.bone, photo: unsplash("1565193566173-7a0ee3dbe261", 1200, 1500), alt: { en: "Three bone-white bottle vases against a dark wall, one with a dried stem", tr: "Koyu duvar önünde, birinde kuru dal olan üç kemik beyazı şişe vazo" }, stock: 6 },
      { ...glaze.ash, photo: unsplash("1525974160448-038dacadcc71", 1200, 1500), alt: { en: "A tall ash-glazed bottle beside two small cups on a grey table", tr: "Gri masada iki küçük fincanın yanında uzun kül sırlı şişe" }, stock: 2 },
    ],
  },
  {
    id: "bud-vase-pair",
    name: { en: "Bud vase pair", tr: "Tomurcuk vazo, çift" },
    category: "vases",
    price: { USD: "36", TRY: "1250" },
    batch: "2026-11-05",
    isNew: true,
    rating: 4.7,
    reviews: 58,
    short: { en: "12 and 15 cm, sold as a pair.", tr: "12 ve 15 cm, çift olarak satılır." },
    story: {
      en: "Made from the clay left over at the end of each day, so every pair is a little different in height and shoulder.",
      tr: "Her günün sonunda artan kilden yapılır; bu yüzden her çiftin boyu ve omzu biraz farklıdır.",
    },
    specs: { size: { en: "12 cm and 15 cm tall", tr: "12 cm ve 15 cm yükseklik" }, care: { en: "Hand wash; watertight", tr: "Elde yıkayın; su geçirmez" }, clay: { en: "Stoneware", tr: "Taşkil" } },
    glazes: [
      { ...glaze.milk, photo: unsplash("1490312278390-ab64016e0aa9", 1200, 1500), alt: { en: "Two milk-white bud vases with blossom branches on a wooden stand", tr: "Ahşap altlık üzerinde çiçekli dallarla iki süt beyazı tomurcuk vazo" }, stock: 9 },
      { ...glaze.fog, photo: unsplash("1581783342308-f792dbdd27c5", 1200, 1500), alt: { en: "A fog-grey bud vase holding a eucalyptus sprig", tr: "Okaliptüs dalı tutan sis grisi tomurcuk vazo" }, stock: 11 },
    ],
  },
  {
    id: "moon-vase",
    name: { en: "Moon vase", tr: "Ay vazo" },
    category: "vases",
    price: { USD: "69", TRY: "2400" },
    batch: "2026-10-20",
    rating: 5,
    reviews: 17,
    short: { en: "24 cm, a full belly and a small mouth.", tr: "24 cm, dolgun gövde ve küçük ağız." },
    story: {
      en: "The hardest shape we throw: about one in three survives the kiln. The cream glaze breaks to a faint brown where it runs thin over the shoulder.",
      tr: "Çektiğimiz en zor form: fırından yaklaşık üçte biri sağ çıkar. Krem sır, omuzda inceldiği yerde hafif kahveye döner.",
    },
    specs: { size: { en: "Ø 20 cm · 24 cm tall", tr: "Ø 20 cm · 24 cm yükseklik" }, care: { en: "Hand wash; watertight", tr: "Elde yıkayın; su geçirmez" }, clay: { en: "Stoneware, reduction fired", tr: "Taşkil, redüksiyon pişirim" } },
    glazes: [{ ...glaze.cream, photo: unsplash("1612196808214-b8e1d6145a8c", 1200, 1500), alt: { en: "A round cream vase with a green branch beside a framed print", tr: "Çerçeveli bir baskının yanında yeşil dallı yuvarlak krem vazo" }, stock: 4 }],
  },
  {
    id: "everyday-mug",
    name: { en: "Everyday mug", tr: "Her gün kupası" },
    category: "cups",
    price: { USD: "19", TRY: "690" },
    batch: "2026-11-01",
    rating: 4.8,
    reviews: 212,
    short: { en: "330 ml, a handle for three fingers.", tr: "330 ml, üç parmaklık kulp." },
    story: {
      en: "The handle is pulled, not moulded: we draw it from a lump of wet clay and attach it while the mug is still soft.",
      tr: "Kulp kalıptan değil, çekilerek yapılır: ıslak bir kil topağından uzatıp kupa henüz yumuşakken takarız.",
    },
    specs: { size: { en: "Ø 8.5 cm · 10 cm tall", tr: "Ø 8,5 cm · 10 cm yükseklik" }, capacity: { en: "330 ml", tr: "330 ml" }, care: { en: "Dishwasher and microwave safe", tr: "Bulaşık makinesi ve mikrodalgaya uygun" }, clay: { en: "Stoneware", tr: "Taşkil" } },
    glazes: [
      { ...glaze.milk, id: "porcelain", name: { en: "Porcelain", tr: "Porselen" }, photo: unsplash("1514228742587-6b1558fcca3d", 1200, 1500), alt: { en: "A plain white mug on a white table", tr: "Beyaz masada sade beyaz kupa" }, stock: 54 },
      { ...glaze.latte, photo: unsplash("1517256064527-09c73fc73e38", 1200, 1500), alt: { en: "A latte-glazed cup of coffee seen from above", tr: "Yukarıdan görülen sütlü kahve sırlı fincanda kahve" }, stock: 22 },
    ],
  },
  {
    id: "nesting-bowls",
    name: { en: "Nesting bowls, set of 3", tr: "İç içe kâse, 3’lü" },
    category: "tableware",
    price: { USD: "46", TRY: "1600" },
    batch: "2026-10-30",
    rating: 4.6,
    reviews: 29,
    short: { en: "12, 15 and 18 cm — they fit inside each other.", tr: "12, 15 ve 18 cm — birbirinin içine girer." },
    story: {
      en: "Thrown off the hump, one after another, from the same block of clay — so the three always shrink the same and keep nesting.",
      tr: "Aynı kil bloğundan art arda çekilir; böylece üçü hep aynı oranda çeker ve iç içe girmeye devam eder.",
    },
    specs: { size: { en: "Ø 12 / 15 / 18 cm", tr: "Ø 12 / 15 / 18 cm" }, care: { en: "Dishwasher safe", tr: "Bulaşık makinesine uygun" }, clay: { en: "Stoneware", tr: "Taşkil" } },
    glazes: [
      { ...glaze.oat, photo: unsplash("1603199506016-b9a594b593c0", 1200, 1500, { x: 0.5, y: 0.6 }), alt: { en: "Oat-glazed bowls stacked on a pale table", tr: "Açık renk masada üst üste yulaf sırlı kâseler" }, stock: 7 },
      { ...glaze.seaSalt, photo: unsplash("1578749556568-bc2c40e68b61", 1200, 1500, { x: 0.8, y: 0.3 }), alt: { en: "Sea-salt bowls stacked beside plates", tr: "Tabakların yanında üst üste deniz tuzu kâseler" }, stock: 0 },
    ],
  },
  {
    id: "espresso-pair",
    name: { en: "Espresso pair", tr: "Espresso fincanı, çift" },
    category: "cups",
    price: { USD: "26", TRY: "920" },
    batch: "2026-10-24",
    rating: 4.7,
    reviews: 64,
    short: { en: "90 ml, thick walls that hold the heat.", tr: "90 ml, ısıyı tutan kalın çeper." },
    story: {
      en: "Thick-walled on purpose, so the cup is already warm when the coffee lands. Sold in twos because nobody drinks the second one alone.",
      tr: "Kahve döküldüğünde fincan zaten ılık olsun diye bilerek kalın çeperli. İkili satılır, çünkü ikincisini kimse yalnız içmez.",
    },
    specs: { size: { en: "Ø 6 cm · 6 cm tall", tr: "Ø 6 cm · 6 cm yükseklik" }, capacity: { en: "90 ml", tr: "90 ml" }, care: { en: "Dishwasher safe", tr: "Bulaşık makinesine uygun" }, clay: { en: "Stoneware with a red-clay foot", tr: "Kırmızı kil tabanlı taşkil" } },
    glazes: [
      { ...glaze.clayFoot, photo: unsplash("1610701596007-11502861dcfa", 1200, 1500, { x: 0.3, y: 0.55 }), alt: { en: "Small cups with raw clay feet", tr: "Sırsız kil tabanlı küçük fincanlar" }, stock: 14 },
      { ...glaze.chalk, photo: unsplash("1590422749897-47036da0b0ff", 1200, 1500, { x: 0.45, y: 0.4 }), alt: { en: "Chalk-white cups stacked", tr: "Üst üste tebeşir beyazı fincanlar" }, stock: 20 },
    ],
  },
  {
    id: "shelf-collection",
    name: { en: "The open-shelf collection", tr: "Açık raf koleksiyonu" },
    category: "sets",
    price: { USD: "195", TRY: "6900" },
    batch: "2026-11-03",
    isNew: true,
    rating: 4.9,
    reviews: 12,
    short: { en: "Plates, bowls, cups and a board — one kiln load, 14 pieces.", tr: "Tabak, kâse, fincan ve bir tahta — tek fırın, 14 parça." },
    story: {
      en: "Everything from one firing, packed together so the glazes match the way they came out of the kiln. Includes an olive-wood board from a workshop in Ayvalık.",
      tr: "Hepsi aynı pişirimden; sırlar fırından nasıl çıktıysa öyle eşleşsin diye birlikte paketlenir. Ayvalık’taki bir atölyeden zeytin ağacı tahta dahildir.",
    },
    specs: { size: { en: "14 pieces, boxed: 48 × 36 × 30 cm", tr: "14 parça, kutulu: 48 × 36 × 30 cm" }, care: { en: "Ceramics dishwasher safe; oil the board monthly", tr: "Seramikler bulaşık makinesine uygun; tahtayı ayda bir yağlayın" }, clay: { en: "Stoneware and olive wood", tr: "Taşkil ve zeytin ağacı" } },
    glazes: [{ ...glaze.studio, photo: unsplash("1610701596061-2ecf227e85b2", 1200, 1500), alt: { en: "Cups, bowls and wooden boards arranged on an open kitchen shelf", tr: "Açık mutfak rafına dizilmiş fincan, kâse ve ahşap tahtalar" }, stock: 3 }],
  },
];

export const productById = (id: string) => products.find((p) => p.id === id) ?? products[0]!;

export const photos = {
  hero: { ...unsplash("1610701596007-11502861dcfa", 1600, 1900), alt: { en: "Morning cups with raw clay feet, lined up after glazing", tr: "Sırlamadan sonra dizilmiş, kil tabanlı sabah fincanları" } },
  maker: { ...unsplash("1493106641515-6b5631de4bb9", 1400, 1750), alt: { en: "Clay-covered hands shaping a pot on the wheel", tr: "Tornada bir çömleği biçimlendiren killi eller" } },
};

/** Category tiles use one glaze photo of their best seller. */
export const categoryPhoto: Record<Category, { product: string; glaze: number }> = {
  tableware: { product: "tide-plates", glaze: 0 },
  cups: { product: "morning-cup", glaze: 0 },
  vases: { product: "long-neck-bottle", glaze: 0 },
  sets: { product: "shelf-collection", glaze: 0 },
};

/** Every built-in string of the client parts, EN + TR. */
export const ui = {
  cart: { en: "Cart", tr: "Sepet" },
  cartTitle: { en: "Your cart", tr: "Sepetiniz" },
  cartEmpty: { en: "Your cart is empty. The morning cup is a good place to start.", tr: "Sepetiniz boş. Sabah fincanı iyi bir başlangıç." },
  browse: { en: "Browse the shop", tr: "Mağazaya göz atın" },
  subtotal: { en: "Subtotal", tr: "Ara toplam" },
  shipping: { en: "Shipping", tr: "Kargo" },
  free: { en: "Free", tr: "Ücretsiz" },
  total: { en: "Total", tr: "Toplam" },
  checkout: { en: "Check out", tr: "Ödemeye geç" },
  remove: { en: "Remove", tr: "Kaldır" },
  removeItem: { en: "Remove {name}", tr: "{name} ürününü kaldır" },
  quantity: { en: "Quantity", tr: "Adet" },
  quantityOf: { en: "Quantity of {name}", tr: "{name} adedi" },
  freeLeft: { en: "{amount} more for free delivery", tr: "Ücretsiz kargo için {amount} kaldı" },
  freeDone: { en: "Free delivery unlocked", tr: "Ücretsiz kargo kazandınız" },
  added: { en: "Added to your cart", tr: "Sepetinize eklendi" },
  addToCart: { en: "Add to cart", tr: "Sepete ekle" },
  quickAdd: { en: "Add {name} in {glaze} to cart", tr: "{glaze} {name} ürününü sepete ekle" },
  soldOut: { en: "Sold out in this glaze", tr: "Bu sırda tükendi" },
  lowStock: { en: "Only {n} left from this firing", tr: "Bu pişirimden yalnızca {n} adet kaldı" },
  inStock: { en: "In stock · ships in 2 working days", tr: "Stokta · 2 iş gününde kargoda" },
  glaze: { en: "Glaze", tr: "Sır" },
  glazeOf: { en: "Glaze of {name}", tr: "{name} sırrı" },
  showGlaze: { en: "Show {glaze}", tr: "{glaze} göster" },
  glazes: { en: "{n} glazes", tr: "{n} sır" },
  currency: { en: "Currency", tr: "Para birimi" },
  newBadge: { en: "New this week", tr: "Bu hafta yeni" },
  reviews: { en: "{n} reviews", tr: "{n} değerlendirme" },
  ratingLabel: { en: "Rated {r} out of 5", tr: "5 üzerinden {r} puan" },
  fired: { en: "Fired {date}", tr: "Pişirim {date}" },
  continueShopping: { en: "Keep shopping", tr: "Alışverişe devam" },
} satisfies Record<string, L>;

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
