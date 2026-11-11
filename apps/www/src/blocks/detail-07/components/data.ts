// Product information for one catalogue item: the washed linen duvet cover from the shared
// Kiln & Linen catalogue. Price, cost, variants, stock and channel prices come from _shared;
// the copy in two languages, media crops, SEO, per-warehouse stock and channel rules are here.
import type { L } from "../../_shared/l10n";
import { productsById, warehouses, type Channel } from "../../_shared/products";
import { day } from "../../_shared/time";

export const product = productsById["pr-04"]!;

const photo = (params: string) => `https://images.unsplash.com/photo-${product.photo}?w=900&h=900&q=72&auto=format&fit=crop${params}`;

/** One studio shot, cropped three ways for detail views (focal-point zoom). */
export const initialMedia = [
  { id: "m1", src: photo(""), width: 900, height: 900, alt: "Washed linen duvet cover on a made bed", caption: "" },
  { id: "m2", src: photo("&crop=focalpoint&fp-x=0.3&fp-y=0.6&fp-z=2"), width: 900, height: 900, alt: "Close-up of the stone-washed linen texture", caption: "" },
  { id: "m3", src: photo("&crop=focalpoint&fp-x=0.75&fp-y=0.4&fp-z=2.4"), width: 900, height: 900, alt: "", caption: "" },
  { id: "m4", src: photo("&crop=focalpoint&fp-x=0.5&fp-y=0.85&fp-z=1.6"), width: 900, height: 900, alt: "Duvet edge with hidden button closure", caption: "" },
];

export const extraMedia = { id: "m5", src: photo("&crop=focalpoint&fp-x=0.15&fp-y=0.2&fp-z=1.8"), width: 900, height: 900, alt: "", caption: "" };

export type ContentLang = "en" | "tr";

export const initialCopy: Record<ContentLang, { name: string; description: string; seoTitle: string; seoDescription: string }> = {
  en: {
    name: product.name.en,
    description:
      "Stone-washed European flax, soft from the first night and softer with every wash. Hidden coconut-shell buttons, inside corner ties, OEKO-TEX certified. Fits a 200 × 220 cm duvet in the Large size.",
    seoTitle: "Washed Linen Duvet Cover — Stone-washed Flax | Kiln & Linen",
    seoDescription: "Stone-washed linen duvet cover in three sizes. Breathable, soft from day one, OEKO-TEX certified. Free delivery over ₺1,500.",
  },
  tr: {
    name: product.name.tr,
    description: "Taş yıkamalı Avrupa keteni; ilk geceden yumuşak, her yıkamada daha da yumuşar. Gizli hindistan cevizi düğmeler, iç köşe bağcıkları, OEKO-TEX sertifikalı.",
    seoTitle: "Yıkanmış Keten Nevresim — Taş Yıkamalı | Kiln & Linen",
    seoDescription: "",
  },
};

export const slug = "washed-linen-duvet-cover";

export interface VariantRow {
  sku: string;
  option: L;
  stock: number;
  barcode: string;
  priceDelta: string;
  active: boolean;
}

export const initialVariants: VariantRow[] = product.variants.map((v, i) => ({
  sku: v.sku,
  option: v.option,
  stock: v.stock,
  barcode: `86900000${String(4201 + i).padStart(5, "0")}`,
  priceDelta: ["-400.00", "0.00", "450.00"][i] ?? "0.00",
  active: true,
}));

/** Commission and fees the channel keeps, as a fraction of the gross price. */
export const channelFees: Record<Channel, number> = { web: 0.029, marketplace: 0.18, retail: 0, wholesale: 0 };

export const initialChannels: Array<{ channel: Channel; price: string; published: boolean }> = (["web", "marketplace", "retail", "wholesale"] as const).map((ch) => ({
  channel: ch,
  price: product.channelPrices[ch] ?? product.price.amount,
  published: ch !== "wholesale",
}));

/** Stock split across the three warehouses (sums to product.stock). */
export const stockByWarehouse = [
  { warehouse: warehouses[0]!, onHand: 96, reserved: 7 },
  { warehouse: warehouses[1]!, onHand: 41, reserved: 2 },
  { warehouse: warehouses[2]!, onHand: 17, reserved: 0 },
];

export const incoming = { po: "PO-2026-0419", units: 80, eta: day(6), supplier: "Ege Flax Weavers" };

export const collections = ["Bedroom", "Linen edit", "Autumn 2026"];
