// Rows for the bulk price & stock editor, taken from the shared Kiln & Linen catalogue.
// Prices are decimal strings (TRY); stock and reorder points are whole units.
import type { L } from "../../_shared/l10n";
import { categoryLabels, productStatusLabels, products, type ProductCategory, type ProductStatus } from "../../_shared/products";

export type EditKey = "status" | "price" | "marketplace" | "wholesale" | "stock" | "reorder";
export type PriceKey = "price" | "marketplace" | "wholesale";

export interface RowValues {
  status: ProductStatus;
  price: string;
  marketplace: string;
  wholesale: string;
  stock: number;
  reorder: number;
}

export interface GridProduct {
  id: string;
  sku: string;
  name: L;
  category: ProductCategory;
  cost: string;
  /** Units sold in the last 30 days, for stock cover. */
  sold30d: number;
  variants: number;
}

export const gridProducts: GridProduct[] = products.map((p) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  category: p.category,
  cost: p.cost.amount,
  sold30d: p.sold30d,
  variants: p.variants.length,
}));

/** What is live in every channel right now. */
export const published: Record<string, RowValues> = Object.fromEntries(
  products.map((p) => [
    p.id,
    {
      status: p.status,
      price: p.channelPrices.web ?? p.price.amount,
      marketplace: p.channelPrices.marketplace ?? p.price.amount,
      wholesale: p.channelPrices.wholesale ?? p.price.amount,
      stock: p.stock,
      reorder: p.reorderPoint,
    } satisfies RowValues,
  ]),
);

export const columnLabels: Record<EditKey, L> = {
  status: { en: "Status", tr: "Durum" },
  price: { en: "Online price", tr: "Online fiyat" },
  marketplace: { en: "Marketplace", tr: "Pazaryeri" },
  wholesale: { en: "Wholesale", tr: "Toptan" },
  stock: { en: "Stock", tr: "Stok" },
  reorder: { en: "Reorder at", tr: "Sipariş noktası" },
};

/** Editable columns in grid order; arrow keys move between these. */
export const editKeys: EditKey[] = ["status", "price", "marketplace", "wholesale", "stock", "reorder"];
export const priceKeys: PriceKey[] = ["price", "marketplace", "wholesale"];

export { categoryLabels, productStatusLabels };
export type { ProductCategory, ProductStatus };
