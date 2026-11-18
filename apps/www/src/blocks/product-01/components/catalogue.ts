// Storefront data for "Kiln & Linen", the fictional homeware brand of the admin fixtures.
// Shared by the Commerce blocks (product-01, cart-01, checkout-01, order-confirmation-01).
// `catalog` is what the kit cart and the checkout endpoint price from: integer minor units (kuruş)
// in TRY with 20% VAT (KDV) included. The rest is display data (names, photos, stock, ratings).
import type { CartLine, Catalog } from "@vamos-ui/react/commerce";
import { productsById } from "../../_shared/products";
import type { L } from "../../_shared/l10n";
import { day } from "../../_shared/time";

export { day };

/** Unsplash photo URL (unbranded product shots also used by the other Kiln & Linen blocks). */
export const photo = (id: string, w: number, h = Math.round(w * 1.25)) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=72&auto=format&fit=crop`;

/** "389.00" → 38900. Fixture prices are decimal strings; the cart works in minor units. */
export const toMinor = (decimal: string) => {
  const [whole = "0", frac = ""] = decimal.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0").slice(0, 2));
};

export const VAT_RATE = 20;
/** VAT contained in a VAT-inclusive amount (display only; the receipt uses the priced quote). */
export const vatIncluded = (gross: number) => Math.round((gross * VAT_RATE) / (100 + VAT_RATE));
/** Free standard delivery from this subtotal. */
export const FREE_SHIPPING_FROM = 3500_00;
export const SHIPPING_FLAT = 89_90;

/* ------------------------------------------------------------------ */
/* Featured product (product-01)                                        */
/* ------------------------------------------------------------------ */

export interface GalleryPhoto {
  id: string;
  alt: L;
}

export interface Glaze {
  id: string;
  name: L;
  /** The glaze itself: product data drawn as a swatch, not a UI colour. */
  swatch: string;
  photos: GalleryPhoto[];
}

export interface SizeOption {
  id: string;
  name: L;
  detail: L;
  /** Minor units (kuruş), VAT included. */
  price: number;
  /** Price before the sale, when on sale (display only). */
  compareAt?: number;
}

export const featured = {
  id: "pr-02",
  sku: "KL-CER-104",
  name: { en: "Tide stoneware plate", tr: "Gelgit taşkil tabak" },
  collection: { en: "Ceramics · Tide collection", tr: "Seramik · Gelgit serisi" },
  rating: 4.8,
  reviewCount: 214,
  short: {
    en: "Thrown in Kemalpaşa and fired to 1,240 °C. A low rim that keeps the sauce on the plate, a glaze that pools where the rim meets the well.",
    tr: "Kemalpaşa’da tornada çekilir, 1.240 °C’de pişirilir. Sosu tabakta tutan alçak bir kenar; kenarın çukurla buluştuğu yerde toplanan bir sır.",
  },
  glazes: [
    {
      id: "sea-salt",
      name: { en: "Sea salt", tr: "Deniz tuzu" },
      swatch: "oklch(0.8 0.035 232)",
      photos: [
        { id: "1578749556568-bc2c40e68b61", alt: { en: "Stacked plates and bowls in a pale blue sea-salt glaze on a wooden table", tr: "Ahşap masada açık mavi deniz tuzu sırlı üst üste tabak ve kâseler" } },
        { id: "1610701596061-2ecf227e85b2", alt: { en: "Plates, bowls and wooden boards on an open kitchen shelf", tr: "Açık mutfak rafında tabaklar, kâseler ve ahşap tahtalar" } },
        { id: "1493106641515-6b5631de4bb9", alt: { en: "Clay-covered hands shaping a plate on the wheel", tr: "Tornada tabağa şekil veren killi eller" } },
      ],
    },
    {
      id: "oat",
      name: { en: "Oat", tr: "Yulaf" },
      swatch: "oklch(0.8 0.055 76)",
      photos: [
        { id: "1603199506016-b9a594b593c0", alt: { en: "Plates in a warm oat glaze, stacked with a patterned bowl", tr: "Desenli bir kâseyle üst üste konmuş sıcak yulaf sırlı tabaklar" } },
        { id: "1610701596061-2ecf227e85b2", alt: { en: "Plates, bowls and wooden boards on an open kitchen shelf", tr: "Açık mutfak rafında tabaklar, kâseler ve ahşap tahtalar" } },
        { id: "1493106641515-6b5631de4bb9", alt: { en: "Clay-covered hands shaping a plate on the wheel", tr: "Tornada tabağa şekil veren killi eller" } },
      ],
    },
    {
      id: "ash",
      name: { en: "Ash", tr: "Kül" },
      swatch: "oklch(0.52 0.012 250)",
      photos: [
        { id: "1525974160448-038dacadcc71", alt: { en: "Ash-glazed stoneware on a grey table", tr: "Gri masada kül sırlı taşkil parçalar" } },
        { id: "1493106641515-6b5631de4bb9", alt: { en: "Clay-covered hands shaping a plate on the wheel", tr: "Tornada tabağa şekil veren killi eller" } },
      ],
    },
  ] satisfies Glaze[],
  sizes: [
    { id: "side", name: { en: "Side", tr: "Küçük" }, detail: { en: "Ø 21 cm", tr: "Ø 21 cm" }, price: 429_00 },
    { id: "dinner", name: { en: "Dinner", tr: "Yemek" }, detail: { en: "Ø 27 cm", tr: "Ø 27 cm" }, price: 529_00, compareAt: 629_00 },
    { id: "platter", name: { en: "Platter", tr: "Servis" }, detail: { en: "Ø 32 cm", tr: "Ø 32 cm" }, price: 749_00 },
  ] satisfies SizeOption[],
  /** Units on hand per glaze × size. */
  stock: {
    "sea-salt": { side: 34, dinner: 18, platter: 3 },
    oat: { side: 9, dinner: 2, platter: 0 },
    ash: { side: 0, dinner: 0, platter: 0 },
  } as Record<string, Record<string, number>>,
  details: [
    [{ en: "Material", tr: "Malzeme" }, { en: "Stoneware, fired to 1,240 °C", tr: "Taşkil, 1.240 °C’de pişirilir" }],
    [{ en: "Finish", tr: "Yüzey" }, { en: "Satin glaze, raw clay foot", tr: "Saten sır, sırsız kil taban" }],
    [{ en: "Care", tr: "Bakım" }, { en: "Dishwasher, microwave and oven safe to 220 °C", tr: "Bulaşık makinesi, mikrodalga ve 220 °C’ye kadar fırına uygun" }],
    [{ en: "Made in", tr: "Üretim yeri" }, { en: "Kemalpaşa, İzmir", tr: "Kemalpaşa, İzmir" }],
    [{ en: "SKU", tr: "Stok kodu" }, { en: "KL-CER-104", tr: "KL-CER-104" }],
  ] as Array<[L, L]>,
  /** Size, diameter / well / height in cm, weight in g, what it is for. */
  sizeGuide: [
    ["side", 21, 15, 2, 540, { en: "Bread, dessert, small plates", tr: "Ekmek, tatlı, ara sıcak" }],
    ["dinner", 27, 20, 2.4, 860, { en: "Mains, pasta, a full breakfast", tr: "Ana yemek, makarna, kahvaltı" }],
    ["platter", 32, 25, 2.8, 1280, { en: "Sharing, roast, mezze", tr: "Paylaşım, fırın yemeği, meze" }],
  ] as Array<[string, number, number, number, number, L]>,
};

export type FeaturedSizeId = (typeof featured.sizes)[number]["id"];

export const reviews = [
  { id: "rv-1", name: "Aslı Korkmaz", city: "Istanbul", rating: 5, date: day(-6), glaze: "sea-salt", text: { en: "Heavier than I expected, in the best way. The glaze pooling at the rim is exactly like the photo — set of eight now.", tr: "Beklediğimden ağır, en iyi anlamda. Kenarda toplanan sır tam fotoğraftaki gibi — artık sekizli setim var." } },
  { id: "rv-2", name: "Tara Whitfield", city: "Bristol", rating: 5, date: day(-13), glaze: "oat", text: { en: "Arrived to the UK in five days, wrapped in so much paper I almost lost one. Not a chip on any of them.", tr: "İngiltere’ye beş günde geldi; o kadar çok kâğıda sarılıydı ki birini neredeyse kaybediyordum. Hiçbirinde çizik yok." } },
  { id: "rv-3", name: "Emre Doğan", city: "Ankara", rating: 4, date: day(-21), glaze: "sea-salt", text: { en: "Lovely plates. The 27 cm is a touch big for our cupboard, so check the size guide before you order.", tr: "Çok güzel tabaklar. 27 cm bizim dolap için biraz büyük; sipariş vermeden ölçü rehberine bakın." } },
];

/** Star counts 5 → 1, out of `reviewCount`. */
export const ratingBreakdown = [168, 31, 9, 4, 2];

/* ------------------------------------------------------------------ */
/* Catalogue items used by related / recommended rails and the cart     */
/* ------------------------------------------------------------------ */

export interface ShopItem {
  id: string;
  sku: string;
  name: L;
  option?: L;
  /** Minor units, VAT included. */
  price: number;
  /** Price before the sale (display only). */
  compareAt?: number;
  photo: string;
  /** 0 = sold out. */
  stock: number;
  category: string;
}

const fromFixture = (id: string, option?: L, extra?: Partial<ShopItem>): ShopItem => {
  const p = productsById[id]!;
  return { id: p.id, sku: p.sku, name: p.name, option, price: toMinor(p.price.amount), photo: p.photo, stock: p.stock, category: p.category, ...extra };
};

/** Simple products, keyed by their catalog id. The featured plate (with variants) is `PLATE_ID`. */
export const shopItems: Record<string, ShopItem> = {
  mug: fromFixture("pr-01", { en: "Sand", tr: "Kum" }),
  bowl: fromFixture("pr-03", { en: "Ø 24 cm", tr: "Ø 24 cm" }),
  board: fromFixture("pr-09", { en: "Medium", tr: "Orta" }),
  candles: fromFixture("pr-13"),
  dish: fromFixture("pr-11", undefined, { compareAt: 1690_00 }),
  coffee: fromFixture("pr-10"),
  lantern: fromFixture("pr-07"),
  mirror: fromFixture("pr-12"),
};

/** "Goes with" rail on the product page. */
export const relatedIds = ["bowl", "mug", "board", "dish"] as const;
/** Recommended under the cart. */
export const recommendedIds = ["coffee", "lantern", "bowl", "board"] as const;

/* ------------------------------------------------------------------ */
/* The catalog the cart and the checkout endpoint price from            */
/* ------------------------------------------------------------------ */

export const PLATE_ID = "plate";
/** Variant id of the featured plate: glaze + size ("sea-salt.dinner"). */
export const plateVariant = (glazeId: string, sizeId: string) => `${glazeId}.${sizeId}`;

/**
 * Put this file (or the `catalog` part of it) where your checkout endpoint can import it: the
 * server prices every order from it and never from the browser. Names are what the payment page
 * and the order emails show.
 */
export const catalog: Catalog = {
  currency: "TRY",
  vatRate: VAT_RATE,
  shipping: { flat: SHIPPING_FLAT, freeOver: FREE_SHIPPING_FROM, label: "Standard delivery" },
  products: [
    {
      id: PLATE_ID,
      name: featured.name.en,
      price: featured.sizes[0]!.price,
      category: "Ceramics",
      variants: featured.glazes.flatMap((g) =>
        featured.sizes.map((s) => ({
          id: plateVariant(g.id, s.id),
          name: `${s.name.en} ${s.detail.en} · ${g.name.en}`,
          price: s.price,
          available: (featured.stock[g.id]?.[s.id] ?? 0) > 0,
        })),
      ),
    },
    ...Object.entries(shopItems).map(([id, item]) => ({
      id,
      name: item.option ? `${item.name.en} · ${item.option.en}` : item.name.en,
      price: item.price,
      category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      available: item.stock > 0,
      maxQty: Math.min(20, item.stock),
    })),
  ],
};

/** What a cart line shows: the shop item, or the featured plate in the chosen glaze and size. */
export function itemOf(line: Pick<CartLine, "productId" | "variantId">): ShopItem | null {
  if (line.productId !== PLATE_ID) return shopItems[line.productId] ?? null;
  const [glazeId, sizeId] = (line.variantId ?? "").split(".");
  const glaze = featured.glazes.find((g) => g.id === glazeId);
  const size = featured.sizes.find((s) => s.id === sizeId);
  if (!glaze || !size) return null;
  return {
    id: featured.id,
    sku: `${featured.sku}-${size.id.slice(0, 3).toUpperCase()}-${glaze.id.slice(0, 2).toUpperCase()}`,
    name: featured.name,
    option: { en: `${size.name.en} ${size.detail.en} · ${glaze.name.en}`, tr: `${size.name.tr} ${size.detail.tr} · ${glaze.name.tr}` },
    price: size.price,
    compareAt: size.compareAt,
    photo: glaze.photos[0]!.id,
    stock: featured.stock[glaze.id]?.[size.id] ?? 0,
    category: "ceramics",
  };
}

/** What the previews start with, so the cart, checkout and summary show real content. */
export const starterLines: CartLine[] = [
  { productId: PLATE_ID, variantId: plateVariant("sea-salt", "dinner"), qty: 4 },
  { productId: "mug", qty: 2 },
  { productId: "candles", qty: 1 },
];

/** The one delivery the catalog charges for. Express or pick-up need their own catalog rules. */
export const delivery = {
  name: { en: "Standard delivery", tr: "Standart teslimat" },
  carrier: { en: "Parcel courier, tracked", tr: "Kargo, takipli" },
  /** Business days from TODAY: [earliest, latest]. */
  days: [2, 4] as [number, number],
};

/** TODAY + n business days (Mon–Fri), YYYY-MM-DD. */
export function businessDay(n: number): string {
  let offset = 0;
  let left = n;
  while (left > 0) {
    offset += 1;
    const wd = new Date(`${day(offset)}T12:00:00Z`).getUTCDay();
    if (wd !== 0 && wd !== 6) left -= 1;
  }
  return day(offset);
}

/** Fictional studio details. */
export const STORE = {
  name: "Kiln & Linen",
  phone: "+90 216 000 00 00",
  email: "hello@kilnlinen.example.com",
};
