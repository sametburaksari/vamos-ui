// Sample content for "Crate & Co. Supply", a fictional wholesaler of packaging and shipping
// supplies. Every human-readable field is `Localized` ({ en, tr }). Prices are TRY per unit,
// excluding VAT, one price per quantity tier (cases ordered). Phone and domain are fictional.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

export const ACCENT = "#1D4ED8";
export const PHONE = "+902160000000";
export const EMAIL = "trade@crateandco.example.com";
export const ADDRESS = "Depo Yolu 14, Hangar C, 34957 Tuzla / İstanbul";
export const VAT_RATE = 0.2;

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = intlOf(locale);
  const f = createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" });
  /** ₺ with two decimals — unit prices go to the kuruş. */
  const lira = (v: number) => f.currency(v.toFixed(2), "TRY", { currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  /** ₺ without decimals — order totals. */
  const liraRound = (v: number) => f.currency(Math.round(v).toString(), "TRY", { currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return {
    locale,
    t,
    f,
    lira,
    liraRound,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

/** Fills `{n}`-style placeholders. */
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));

const unsplash = (id: string, w: number, h: number, focal?: { x: number; y: number }) => ({
  src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`,
  width: w,
  height: h,
  ...(focal ? { focal } : null),
});

export const photos = {
  aisle: { ...unsplash("1553413077-190dd305871c", 1600, 2000, { x: 0.5, y: 0.55 }), alt: { en: "A long warehouse aisle between racks stacked to the roof with cartons", tr: "Tavana kadar kolilerle dolu raflar arasında uzun bir depo koridoru" } },
  packing: { ...unsplash("1580674285054-bed31e145f59", 1600, 1100), alt: { en: "Stacks of brown shipping cartons waiting in the packing area", tr: "Paketleme alanında bekleyen kahverengi koli yığınları" } },
  handover: { ...unsplash("1566576721346-d4a3b4eaeb55", 1600, 1100), alt: { en: "A sealed cardboard box being handed over at the door", tr: "Kapıda teslim edilen bantlı bir karton kutu" } },
};

/* ------------------------------------------------------------------ */
/* Price tiers — the signature                                         */
/* ------------------------------------------------------------------ */

/** Lower bound (cases) of each tier. */
export const TIER_MIN = [1, 10, 50, 200] as const;
export const tierNames: L[] = [
  { en: "Case", tr: "Koli" },
  { en: "Stack", tr: "İstif" },
  { en: "Half pallet", tr: "Yarım palet" },
  { en: "Pallet", tr: "Palet" },
];
export const tierRange = (i: number) =>
  i === TIER_MIN.length - 1 ? `${TIER_MIN[i]}+` : `${TIER_MIN[i]}–${TIER_MIN[i + 1]! - 1}`;

export function tierOf(cases: number): number {
  let i = 0;
  TIER_MIN.forEach((min, idx) => {
    if (cases >= min) i = idx;
  });
  return i;
}

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export type Category = "cartons" | "mailers" | "bags" | "tape" | "wrap" | "labels";
export const categories: { id: Category; label: L; blurb: L; skus: number }[] = [
  { id: "cartons", label: { en: "Shipping cartons", tr: "Koliler" }, blurb: { en: "Single and double wall, 38 sizes", tr: "Tek ve çift oluklu, 38 ölçü" }, skus: 86 },
  { id: "mailers", label: { en: "Mailer boxes", tr: "Kargo kutuları" }, blurb: { en: "Self-locking, print-ready kraft", tr: "Kilitli kapak, baskıya hazır kraft" }, skus: 41 },
  { id: "bags", label: { en: "Paper bags", tr: "Kâğıt çantalar" }, blurb: { en: "Twisted and flat handles, 70–110 gsm", tr: "Burgu ve yassı saplı, 70–110 g" }, skus: 64 },
  { id: "tape", label: { en: "Tape", tr: "Bantlar" }, blurb: { en: "Paper, PP and water-activated", tr: "Kâğıt, PP ve suyla aktifleşen" }, skus: 29 },
  { id: "wrap", label: { en: "Wrap & void fill", tr: "Streç ve dolgu" }, blurb: { en: "Stretch film, kraft fill, tissue", tr: "Streç film, kraft dolgu, pelur" }, skus: 47 },
  { id: "labels", label: { en: "Labels", tr: "Etiketler" }, blurb: { en: "Thermal, A4 sheets, fragile", tr: "Termal, A4 sayfa, kırılır" }, skus: 33 },
];

export interface Product {
  sku: string;
  category: Category;
  name: L;
  spec: L;
  /** What one case holds. */
  perCase: number;
  /** "box", "roll", "bag"… for "₺4.10 / box". */
  unit: L;
  /** Unit price ex VAT, one per tier (1+, 10+, 50+, 200+ cases). */
  price: [number, number, number, number];
  /** Cases on the shelf; 0 = back on `restock`. */
  stock: number;
  restock?: string;
  /** Working days from order to dispatch. */
  leadDays: number;
  popular?: boolean;
}

const box = { en: "box", tr: "kutu" };
const roll = { en: "roll", tr: "rulo" };

export const products: Product[] = [
  {
    sku: "CC-SC-403030",
    category: "cartons",
    name: { en: "Double-wall shipping carton 40 × 30 × 30", tr: "Çift oluklu koli 40 × 30 × 30" },
    spec: { en: "BC flute, 7 mm · 30 kg load · brown kraft · 20 per case", tr: "BC dalga, 7 mm · 30 kg yük · kahve kraft · kolide 20 adet" },
    perCase: 20,
    unit: box,
    price: [18.4, 16.9, 15.2, 13.8],
    stock: 412,
    leadDays: 0,
    popular: true,
  },
  {
    sku: "CC-SC-302020",
    category: "cartons",
    name: { en: "Single-wall carton 30 × 20 × 20", tr: "Tek oluklu koli 30 × 20 × 20" },
    spec: { en: "B flute, 3 mm · 15 kg load · 25 per case", tr: "B dalga, 3 mm · 15 kg yük · kolide 25 adet" },
    perCase: 25,
    unit: box,
    price: [9.6, 8.8, 7.9, 7.1],
    stock: 960,
    leadDays: 0,
  },
  {
    sku: "CC-SC-605040",
    category: "cartons",
    name: { en: "Moving carton 60 × 50 × 40", tr: "Taşıma kolisi 60 × 50 × 40" },
    spec: { en: "Double wall with hand holes · 40 kg load · 10 per case", tr: "Tutma delikli çift oluklu · 40 kg yük · kolide 10 adet" },
    perCase: 10,
    unit: box,
    price: [34.5, 31.9, 28.6, 25.9],
    stock: 38,
    leadDays: 1,
  },
  {
    sku: "CC-MB-A4",
    category: "mailers",
    name: { en: "Kraft mailer box A4", tr: "Kraft kargo kutusu A4" },
    spec: { en: "31 × 22 × 5 cm · self-locking lid · tear strip · 50 per case", tr: "31 × 22 × 5 cm · kilitli kapak · yırtma şeridi · kolide 50 adet" },
    perCase: 50,
    unit: box,
    price: [6.2, 5.7, 5.1, 4.55],
    stock: 233,
    leadDays: 0,
    popular: true,
  },
  {
    sku: "CC-MB-A5",
    category: "mailers",
    name: { en: "Kraft mailer box A5", tr: "Kraft kargo kutusu A5" },
    spec: { en: "22 × 16 × 4 cm · white inside · 50 per case", tr: "22 × 16 × 4 cm · içi beyaz · kolide 50 adet" },
    perCase: 50,
    unit: box,
    price: [4.8, 4.4, 3.95, 3.5],
    stock: 0,
    restock: "2026-11-18",
    leadDays: 0,
  },
  {
    sku: "CC-PB-L",
    category: "bags",
    name: { en: "Paper carrier bag, twisted handles — large", tr: "Burgu saplı kâğıt çanta — büyük" },
    spec: { en: "32 × 12 × 41 cm · 100 gsm brown kraft · 250 per case", tr: "32 × 12 × 41 cm · 100 g kahve kraft · kolide 250 adet" },
    perCase: 250,
    unit: { en: "bag", tr: "çanta" },
    price: [3.1, 2.8, 2.5, 2.2],
    stock: 174,
    leadDays: 0,
    popular: true,
  },
  {
    sku: "CC-PB-FS",
    category: "bags",
    name: { en: "Flat-handle paper bag — small", tr: "Yassı saplı kâğıt çanta — küçük" },
    spec: { en: "18 × 8 × 22 cm · 80 gsm white kraft · 500 per case", tr: "18 × 8 × 22 cm · 80 g beyaz kraft · kolide 500 adet" },
    perCase: 500,
    unit: { en: "bag", tr: "çanta" },
    price: [1.45, 1.32, 1.18, 1.05],
    stock: 88,
    leadDays: 1,
  },
  {
    sku: "CC-TP-KR48",
    category: "tape",
    name: { en: "Paper packing tape 48 mm × 50 m", tr: "Kâğıt koli bandı 48 mm × 50 m" },
    spec: { en: "Natural rubber adhesive · recyclable with the box · 36 rolls per case", tr: "Doğal kauçuk yapışkan · kutuyla geri dönüşür · kolide 36 rulo" },
    perCase: 36,
    unit: roll,
    price: [42, 38.5, 34.9, 31.5],
    stock: 120,
    leadDays: 0,
  },
  {
    sku: "CC-TP-PP66",
    category: "tape",
    name: { en: "Clear PP tape 48 mm × 66 m", tr: "Şeffaf PP bant 48 mm × 66 m" },
    spec: { en: "Low-noise acrylic · 36 rolls per case", tr: "Sessiz açılan akrilik · kolide 36 rulo" },
    perCase: 36,
    unit: roll,
    price: [21.5, 19.6, 17.8, 16.2],
    stock: 340,
    leadDays: 0,
  },
  {
    sku: "CC-SF-500",
    category: "wrap",
    name: { en: "Stretch film 500 mm × 300 m, 17 µm", tr: "Streç film 500 mm × 300 m, 17 µm" },
    spec: { en: "Hand roll, cast · 6 rolls per case", tr: "El rulosu, cast · kolide 6 rulo" },
    perCase: 6,
    unit: roll,
    price: [289, 265, 242, 219],
    stock: 57,
    leadDays: 0,
  },
  {
    sku: "CC-VF-380",
    category: "wrap",
    name: { en: "Kraft void-fill paper 380 mm × 450 m", tr: "Kraft dolgu kâğıdı 380 mm × 450 m" },
    spec: { en: "50 gsm, fan-folded for dispensers · 1 per case", tr: "50 g, makine için zikzak katlı · kolide 1 adet" },
    perCase: 1,
    unit: { en: "pack", tr: "paket" },
    price: [640, 590, 545, 499],
    stock: 26,
    leadDays: 2,
  },
  {
    sku: "CC-LB-100150",
    category: "labels",
    name: { en: "Thermal shipping labels 100 × 150 mm", tr: "Termal kargo etiketi 100 × 150 mm" },
    spec: { en: "500 per roll, 25 mm core · fits most desktop printers · 12 rolls per case", tr: "Rulo başına 500, 25 mm masura · çoğu masaüstü yazıcıya uyar · kolide 12 rulo" },
    perCase: 12,
    unit: roll,
    price: [118, 108, 98, 89],
    stock: 205,
    leadDays: 0,
    popular: true,
  },
];

export const productBySku = (sku: string) => products.find((p) => p.sku === sku) ?? products[0]!;

/* ------------------------------------------------------------------ */
/* Delivery                                                            */
/* ------------------------------------------------------------------ */

export type DeliveryId = "pallet" | "courier" | "collect";
export const deliveries: { id: DeliveryId; label: L; detail: L; cost: (subtotal: number) => number }[] = [
  {
    id: "pallet",
    label: { en: "Our van or pallet truck", tr: "Kendi aracımız veya palet kamyonu" },
    detail: { en: "Istanbul and Kocaeli, next working day. Free over ₺15,000, otherwise ₺650.", tr: "İstanbul ve Kocaeli, ertesi iş günü. 15.000 ₺ üzeri ücretsiz, altı 650 ₺." },
    cost: (s) => (s >= 15000 ? 0 : 650),
  },
  {
    id: "courier",
    label: { en: "Courier, anywhere in Türkiye", tr: "Kargo, Türkiye’nin her yeri" },
    detail: { en: "1–3 working days. ₺38 per case, capped at ₺2,400.", tr: "1–3 iş günü. Koli başına 38 ₺, en fazla 2.400 ₺." },
    cost: () => 0, // computed per case in the provider
  },
  {
    id: "collect",
    label: { en: "Collect from Tuzla", tr: "Tuzla’dan teslim alın" },
    detail: { en: "Ready in two hours. Mon–Fri 08:00–18:00, Sat 09:00–13:00.", tr: "İki saatte hazır. Pzt–Cum 08:00–18:00, Cmt 09:00–13:00." },
    cost: () => 0,
  },
];
export const COURIER_PER_CASE = 38;
export const COURIER_CAP = 2400;

export const zones: { zone: L; when: L; minimum: L; cost: L }[] = [
  { zone: { en: "Istanbul (both sides), Kocaeli", tr: "İstanbul (iki yaka), Kocaeli" }, when: { en: "Next working day, 09:00–17:00", tr: "Ertesi iş günü, 09:00–17:00" }, minimum: { en: "None", tr: "Yok" }, cost: { en: "Free over ₺15,000 · ₺650", tr: "15.000 ₺ üzeri ücretsiz · 650 ₺" } },
  { zone: { en: "Bursa, Sakarya, Tekirdağ", tr: "Bursa, Sakarya, Tekirdağ" }, when: { en: "2 working days", tr: "2 iş günü" }, minimum: { en: "10 cases", tr: "10 koli" }, cost: { en: "Free over ₺25,000 · ₺1,200", tr: "25.000 ₺ üzeri ücretsiz · 1.200 ₺" } },
  { zone: { en: "Rest of Türkiye — courier", tr: "Türkiye geneli — kargo" }, when: { en: "1–3 working days", tr: "1–3 iş günü" }, minimum: { en: "None", tr: "Yok" }, cost: { en: "₺38 per case, max ₺2,400", tr: "Koli başına 38 ₺, en fazla 2.400 ₺" } },
  { zone: { en: "Full pallets, anywhere", tr: "Tam palet, her yere" }, when: { en: "2–4 working days", tr: "2–4 iş günü" }, minimum: { en: "1 pallet", tr: "1 palet" }, cost: { en: "Quoted with the order", tr: "Siparişle teklif edilir" } },
];

export const faqItems: { q: L; a: L }[] = [
  { q: { en: "Do I need a trade account to order?", tr: "Sipariş için ticari hesap gerekir mi?" }, a: { en: "No. Anyone with a tax number can order from one case and pay by card or bank transfer. A trade account adds 30-day terms, a named account manager and saved price lists.", tr: "Hayır. Vergi numarası olan herkes tek koliden sipariş verip kartla veya havaleyle ödeyebilir. Ticari hesap 30 gün vade, size özel bir müşteri temsilcisi ve kayıtlı fiyat listeleri ekler." } },
  { q: { en: "How do the price tiers count?", tr: "Fiyat kademeleri nasıl sayılır?" }, a: { en: "Per product, by whole cases on one order. 10 cases of one carton reach the Stack price on that carton; mixing two products does not combine their counts. Pallet orders (200+ cases) can mix sizes within one product family — ask us.", tr: "Ürün başına, tek siparişteki tam koli sayısına göre. Bir koliden 10 koli o ürünün İstif fiyatına ulaşır; iki farklı ürün birleştirilmez. Palet siparişlerinde (200+ koli) aynı ürün ailesinde ölçü karıştırabilirsiniz — bize sorun." } },
  { q: { en: "Can you print our logo on mailer boxes?", tr: "Kargo kutularına logomuzu basabilir misiniz?" }, a: { en: "Yes, one or two colours on kraft, from 500 boxes. Proof in two working days, production in 12. Send the artwork with your quote request.", tr: "Evet, kraft üzerine tek veya iki renk, 500 kutudan başlayarak. Prova iki iş gününde, üretim 12 iş gününde. Teklif talebinizle birlikte çalışmayı gönderin." } },
  { q: { en: "What is the cut-off for same-day dispatch?", tr: "Aynı gün sevkiyat için son saat kaç?" }, a: { en: "15:00 on working days for stock items. Orders after 15:00 leave the next morning at 08:30.", tr: "Stoktaki ürünler için iş günlerinde 15:00. 15:00’ten sonraki siparişler ertesi sabah 08:30’da çıkar." } },
  { q: { en: "Can I return unused stock?", tr: "Kullanılmamış ürünü iade edebilir miyim?" }, a: { en: "Sealed cases within 30 days, collected free on your next delivery. Printed items cannot be returned.", tr: "Açılmamış koliler 30 gün içinde, bir sonraki teslimatta ücretsiz alınır. Baskılı ürünler iade edilemez." } },
];

type TierIndex = 0 | 1 | 2 | 3;
const clampTier = (i: number) => Math.min(3, Math.max(0, i)) as TierIndex;
/** Unit price of a product at a tier index. */
export const priceAt = (p: Product, tier: number): number => p.price[clampTier(tier)];
/** Lower bound (cases) of a tier index. */
export const tierMin = (tier: number): number => TIER_MIN[clampTier(tier)];
