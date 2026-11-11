// Storefront data for "Kiln & Linen", the fictional homeware brand of the admin fixtures.
// Shared by the Commerce blocks (product-01, cart-01, checkout-01, order-confirmation-01).
// Money is a decimal string in TRY with 20% VAT (KDV) included, summed with the kit's decimal
// helpers — never floats.
import { addDecimal, compareDecimal, multiplyDecimal, subtractDecimal } from "@vamos-ui/react/format";
import { productsById } from "../../_shared/products";
import type { L } from "../../_shared/l10n";
import { day } from "../../_shared/time";

export { day };

/** Unsplash photo URL (unbranded product shots also used by the other Kiln & Linen blocks). */
export const photo = (id: string, w: number, h = Math.round(w * 1.25)) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=72&auto=format&fit=crop`;

export const VAT_RATE = "0.20";
/** Free standard delivery from this subtotal (after discounts). */
export const FREE_SHIPPING_FROM = "3500.00";

/** VAT contained in a VAT-inclusive amount at 20%: gross × 0.2 / 1.2 = gross / 6. */
export function vatIncluded(gross: string): string {
  return multiplyDecimal(gross, "0.166666666667", 2);
}
export const times = (unit: string, qty: number) => multiplyDecimal(unit, String(qty));
export const total = (values: string[]) => addDecimal(values.length ? values : ["0"]);
export const gte = (a: string, b: string) => compareDecimal(a, b) >= 0;
export const minus = subtractDecimal;

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
  price: string;
  /** Price before the sale, when on sale. */
  compareAt?: string;
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
    { id: "side", name: { en: "Side", tr: "Küçük" }, detail: { en: "Ø 21 cm", tr: "Ø 21 cm" }, price: "429.00" },
    { id: "dinner", name: { en: "Dinner", tr: "Yemek" }, detail: { en: "Ø 27 cm", tr: "Ø 27 cm" }, price: "529.00", compareAt: "629.00" },
    { id: "platter", name: { en: "Platter", tr: "Servis" }, detail: { en: "Ø 32 cm", tr: "Ø 32 cm" }, price: "749.00" },
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
  price: string;
  compareAt?: string;
  photo: string;
  /** 0 = sold out. */
  stock: number;
}

const fromFixture = (id: string, option?: L, extra?: Partial<ShopItem>): ShopItem => {
  const p = productsById[id]!;
  return { id: p.id, sku: p.sku, name: p.name, option, price: p.price.amount, photo: p.photo, stock: p.stock, ...extra };
};

export const shopItems: Record<string, ShopItem> = {
  mug: fromFixture("pr-01", { en: "Sand", tr: "Kum" }),
  bowl: fromFixture("pr-03", { en: "Ø 24 cm", tr: "Ø 24 cm" }),
  board: fromFixture("pr-09", { en: "Medium", tr: "Orta" }),
  candles: fromFixture("pr-13"),
  dish: fromFixture("pr-11", undefined, { compareAt: "1690.00" }),
  coffee: fromFixture("pr-10"),
  lantern: fromFixture("pr-07"),
  mirror: fromFixture("pr-12"),
  plate: {
    id: "pr-02",
    sku: "KL-CER-104-DIN",
    name: featured.name,
    option: { en: "Dinner Ø 27 cm · Sea salt", tr: "Yemek Ø 27 cm · Deniz tuzu" },
    price: "529.00",
    compareAt: "629.00",
    photo: "1578749556568-bc2c40e68b61",
    stock: 18,
  },
};

/** "Goes with" rail on the product page. */
export const relatedIds = ["bowl", "mug", "board", "dish"] as const;
/** Recommended under the cart. */
export const recommendedIds = ["coffee", "lantern", "bowl", "board"] as const;

/* ------------------------------------------------------------------ */
/* Cart, coupons, shipping                                              */
/* ------------------------------------------------------------------ */

export interface CartLine {
  key: string;
  itemId: string;
  qty: number;
  /** A specific variant (size / colour) when it differs from the catalogue item. */
  item?: ShopItem;
}

export const itemOf = (line: CartLine): ShopItem => line.item ?? shopItems[line.itemId]!;

export const starterCart: CartLine[] = [
  { key: "plate-dinner-sea-salt", itemId: "plate", qty: 4 },
  { key: "mug-sand", itemId: "mug", qty: 2 },
  { key: "candles", itemId: "candles", qty: 1 },
];

export interface Coupon {
  code: string;
  label: L;
  kind: "percent" | "fixed";
  value: string;
  /** Minimum subtotal. */
  min?: string;
}

export const coupons: Coupon[] = [
  { code: "KILN10", label: { en: "10% off everything", tr: "Her şeyde %10 indirim" }, kind: "percent", value: "0.10" },
  { code: "WELCOME150", label: { en: "₺150 off your first order over ₺1,000", tr: "1.000 ₺ üzeri ilk siparişe 150 ₺ indirim" }, kind: "fixed", value: "150.00", min: "1000.00" },
];

export function couponDiscount(coupon: Coupon | null, subtotal: string): string {
  if (!coupon) return "0.00";
  if (coupon.min && !gte(subtotal, coupon.min)) return "0.00";
  return coupon.kind === "percent" ? multiplyDecimal(subtotal, coupon.value) : coupon.value;
}

export type ShippingId = "standard" | "express" | "pickup";

export interface ShippingMethod {
  id: ShippingId;
  name: L;
  carrier: L;
  price: string;
  /** Business days from TODAY: [earliest, latest]. */
  days: [number, number];
}

export const shippingMethods: ShippingMethod[] = [
  { id: "standard", name: { en: "Standard delivery", tr: "Standart teslimat" }, carrier: { en: "Parcel courier, tracked", tr: "Kargo, takipli" }, price: "89.90", days: [2, 4] },
  { id: "express", name: { en: "Express", tr: "Hızlı teslimat" }, carrier: { en: "Same-city courier, order by 14:00", tr: "Şehir içi kurye, 14:00’e kadar" }, price: "149.90", days: [1, 1] },
  { id: "pickup", name: { en: "Collect from the Kadıköy studio", tr: "Kadıköy atölyesinden teslim al" }, carrier: { en: "Ready in 2 hours, Mon–Sat 10:00–19:00", tr: "2 saatte hazır, Pzt–Cmt 10:00–19:00" }, price: "0.00", days: [0, 0] },
];

/** Standard is free over the threshold. */
export function shippingCost(method: ShippingMethod, subtotalAfterDiscount: string): string {
  if (method.id === "standard" && gte(subtotalAfterDiscount, FREE_SHIPPING_FROM)) return "0.00";
  return method.price;
}

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

export const PAY_AT_DOOR_FEE = "29.90";

/** Fictional studio details. */
export const STORE = {
  name: "Kiln & Linen",
  phone: "+90 216 000 00 00",
  email: "hello@kilnlinen.example.com",
  iban: "TR33 0006 1005 1978 6457 8413 26",
  bank: { en: "Account holder: Kiln & Linen Ev Ürünleri Ltd. Şti.", tr: "Hesap sahibi: Kiln & Linen Ev Ürünleri Ltd. Şti." },
};
