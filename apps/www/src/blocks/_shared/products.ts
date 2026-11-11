// Fictional catalogue for a homeware brand ("Kiln & Linen") — used by e-commerce, PIM,
// inventory and bulk-edit blocks. Prices are decimal strings in TRY with a USD list price.
import type { L } from "./l10n";
import type { Money } from "./money";

export type ProductCategory = "ceramics" | "textiles" | "lighting" | "kitchen" | "decor";
export type ProductStatus = "active" | "draft" | "archived";
export type Channel = "web" | "marketplace" | "retail" | "wholesale";

export interface ProductVariant {
  sku: string;
  option: L;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  name: L;
  category: ProductCategory;
  status: ProductStatus;
  price: Money;
  /** List price for export channels. */
  priceUsd: Money;
  cost: Money;
  /** Units on hand across warehouses. */
  stock: number;
  /** Reorder when stock falls to this. */
  reorderPoint: number;
  /** Units sold in the last 30 days. */
  sold30d: number;
  warehouseId: string;
  variants: ProductVariant[];
  /** Price per sales channel (PIM). */
  channelPrices: Partial<Record<Channel, string>>;
  /** Unsplash photo id for thumbnails (unbranded product shots). */
  photo: string;
}

export interface Warehouse {
  id: string;
  name: string;
  city: string;
  code: string;
}

export const warehouses: Warehouse[] = [
  { id: "wh-gebze", name: "Gebze Central", city: "Kocaeli", code: "GBZ" },
  { id: "wh-izmir", name: "Kemalpaşa Hub", city: "Izmir", code: "KMP" },
  { id: "wh-ankara", name: "Sincan Depot", city: "Ankara", code: "SNC" },
];

export const categoryLabels: Record<ProductCategory, L> = {
  ceramics: { en: "Ceramics", tr: "Seramik" },
  textiles: { en: "Textiles", tr: "Tekstil" },
  lighting: { en: "Lighting", tr: "Aydınlatma" },
  kitchen: { en: "Kitchen", tr: "Mutfak" },
  decor: { en: "Decor", tr: "Dekorasyon" },
};

export const channelLabels: Record<Channel, L> = {
  web: { en: "Online store", tr: "Online mağaza" },
  marketplace: { en: "Marketplace", tr: "Pazaryeri" },
  retail: { en: "Retail stores", tr: "Mağazalar" },
  wholesale: { en: "Wholesale", tr: "Toptan" },
};

export const productStatusLabels: Record<ProductStatus, L> = {
  active: { en: "Active", tr: "Aktif" },
  draft: { en: "Draft", tr: "Taslak" },
  archived: { en: "Archived", tr: "Arşivlendi" },
};

type Row = [id: string, sku: string, en: string, tr: string, cat: ProductCategory, status: ProductStatus, price: number, usd: number, stock: number, reorder: number, sold: number, wh: string, photo: string, variants?: Array<[string, string, number]>];

const sizes = (base: number): Array<[string, string, number]> => [
  ["Small", "Küçük", Math.round(base * 0.4)],
  ["Medium", "Orta", Math.round(base * 0.35)],
  ["Large", "Büyük", base - Math.round(base * 0.4) - Math.round(base * 0.35)],
];
const colours = (base: number): Array<[string, string, number]> => [
  ["Sand", "Kum", Math.round(base * 0.5)],
  ["Moss", "Yosun", Math.round(base * 0.3)],
  ["Charcoal", "Antrasit", base - Math.round(base * 0.5) - Math.round(base * 0.3)],
];

const rows: Row[] = [
  ["pr-01", "KL-CER-101", "Speckled stoneware mug", "Benekli taş kupa", "ceramics", "active", 389, 14, 412, 120, 286, "wh-gebze", "1514228742587-6b1558fcca3d", colours(412)],
  ["pr-02", "KL-CER-104", "Ash-glaze dinner plate", "Kül sırlı servis tabağı", "ceramics", "active", 529, 19, 96, 100, 174, "wh-gebze", "1603199506016-b9a594b593c0"],
  ["pr-03", "KL-CER-117", "Hand-thrown serving bowl", "El yapımı servis kasesi", "ceramics", "active", 849, 31, 38, 40, 61, "wh-izmir", "1610701596007-11502861dcfa"],
  ["pr-04", "KL-TEX-201", "Washed linen duvet cover", "Yıkanmış keten nevresim", "textiles", "active", 2490, 89, 154, 60, 97, "wh-gebze", "1522771739844-6a9f6d5f14af", sizes(154)],
  ["pr-05", "KL-TEX-208", "Waffle cotton bath towel", "Petek dokuma banyo havlusu", "textiles", "active", 649, 24, 0, 80, 212, "wh-ankara", "1540555700478-4be289fbecef", colours(0)],
  ["pr-06", "KL-TEX-215", "Wool herringbone throw", "Balıksırtı yün battaniye", "textiles", "active", 3150, 112, 27, 30, 44, "wh-izmir", "1600166898405-da9535204843", colours(27)],
  ["pr-07", "KL-LGT-301", "Paper lantern pendant", "Kâğıt fener sarkıt", "lighting", "active", 1890, 68, 63, 25, 39, "wh-gebze", "1513506003901-1e6a229e2d15"],
  ["pr-08", "KL-LGT-306", "Brass task lamp", "Pirinç çalışma lambası", "lighting", "draft", 4290, 152, 0, 10, 0, "wh-gebze", "1507473885765-e6ed057f782c"],
  ["pr-09", "KL-KIT-401", "Olive-wood cutting board", "Zeytin ağacı kesme tahtası", "kitchen", "active", 1190, 42, 141, 50, 118, "wh-izmir", "1610701596061-2ecf227e85b2", sizes(141)],
  ["pr-10", "KL-KIT-409", "Copper coffee pot", "Bakır cezve", "kitchen", "active", 990, 36, 18, 45, 133, "wh-ankara", "1610889556528-9a770e32642f"],
  ["pr-11", "KL-KIT-412", "Enamel oven dish", "Emaye fırın kabı", "kitchen", "active", 1450, 52, 76, 30, 58, "wh-gebze", "1578749556568-bc2c40e68b61"],
  ["pr-12", "KL-DEC-501", "Rattan wall mirror", "Hasır duvar aynası", "decor", "active", 2790, 99, 22, 15, 26, "wh-izmir", "1618220179428-22790b461013"],
  ["pr-13", "KL-DEC-507", "Beeswax pillar candles (3)", "Balmumu sütun mum (3'lü)", "decor", "active", 459, 17, 530, 150, 341, "wh-gebze", "1602874801007-bd458bb1b8b6"],
  ["pr-14", "KL-DEC-512", "Jute floor cushion", "Jüt yer minderi", "decor", "archived", 1290, 46, 4, 0, 2, "wh-ankara", "1584100936595-c0654b55a2e2"],
];

const cost = (price: number) => (Math.round(price * 0.42 * 100) / 100).toFixed(2);

export const products: Product[] = rows.map(([id, sku, en, tr, category, status, price, usd, stock, reorderPoint, sold30d, warehouseId, photo, variants]) => ({
  id,
  sku,
  name: { en, tr },
  category,
  status,
  price: { amount: price.toFixed(2), currency: "TRY" },
  priceUsd: { amount: usd.toFixed(2), currency: "USD" },
  cost: { amount: cost(price), currency: "TRY" },
  stock,
  reorderPoint,
  sold30d,
  warehouseId,
  variants: (variants ?? []).map(([oe, ot, s], i) => ({ sku: `${sku}-${i + 1}`, option: { en: oe, tr: ot }, stock: s })),
  channelPrices: {
    web: price.toFixed(2),
    marketplace: (Math.round(price * 1.12) - 0.01).toFixed(2),
    retail: price.toFixed(2),
    wholesale: (Math.round(price * 0.6 * 100) / 100).toFixed(2),
  },
  photo,
}));

export const productsById: Record<string, Product> = Object.fromEntries(products.map((p) => [p.id, p]));

/** Stock state for badges: out (0), low (≤ reorder point), ok. */
export function stockState(p: Pick<Product, "stock" | "reorderPoint">): "out" | "low" | "ok" {
  return p.stock <= 0 ? "out" : p.stock <= p.reorderPoint ? "low" : "ok";
}

export const stockStateLabels: Record<"out" | "low" | "ok", L> = {
  out: { en: "Out of stock", tr: "Stokta yok" },
  low: { en: "Low stock", tr: "Stok az" },
  ok: { en: "In stock", tr: "Stokta" },
};

/** Unsplash URL for a product photo. */
export const productPhoto = (p: Pick<Product, "photo">, size = 160) => `https://images.unsplash.com/photo-${p.photo}?w=${size}&h=${size}&q=70&auto=format&fit=crop`;
