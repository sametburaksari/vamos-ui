// Warehouse data for dashboard-13: the shared catalogue's stock per warehouse, today's movements
// and fictional suppliers with lead times, so reorder suggestions and purchase orders have numbers
// behind them.
import type { L } from "../../_shared/l10n";
import { stockMovements } from "../../_shared/metrics";
import { categoryLabels, productPhoto, products, stockState, warehouses, type Product, type ProductCategory } from "../../_shared/products";
import { NOW, NOW_MS, TODAY, day, minutesFromNow } from "../../_shared/time";

export { categoryLabels, NOW, NOW_MS, productPhoto, products, stockState, TODAY, day, warehouses };
export type { Product, ProductCategory };

export type MoveType = "in" | "out" | "transfer" | "adjustment";
export interface Movement {
  id: string;
  at: string;
  productId: string;
  type: MoveType;
  qty: number;
  warehouseId: string;
  reference: string;
}
export const moveLabels: Record<MoveType, L> = {
  in: { en: "Received", tr: "Giriş" },
  out: { en: "Shipped", tr: "Çıkış" },
  transfer: { en: "Transfer", tr: "Transfer" },
  adjustment: { en: "Adjustment", tr: "Düzeltme" },
};

/** Today's movements, newest first: the shared five plus the morning's earlier picks. */
export const initialMovements: Movement[] = [
  ...stockMovements,
  { id: "mv-6", at: minutesFromNow(-170), productId: "pr-04", type: "out", qty: -3, warehouseId: "wh-gebze", reference: "#KL-24217" },
  { id: "mv-7", at: minutesFromNow(-195), productId: "pr-07", type: "out", qty: -2, warehouseId: "wh-gebze", reference: "#KL-24214" },
  { id: "mv-8", at: minutesFromNow(-210), productId: "pr-03", type: "in", qty: 24, warehouseId: "wh-izmir", reference: "PO-8806" },
];

export interface Supplier {
  id: string;
  name: string;
  leadDays: number;
  /** Units per case; orders round up to it. */
  casePack: number;
}
export const suppliers: Record<ProductCategory, Supplier> = {
  ceramics: { id: "sp-avanos", name: "Avanos Clayworks", leadDays: 12, casePack: 12 },
  textiles: { id: "sp-loom", name: "Denizli Loom Co.", leadDays: 9, casePack: 10 },
  lighting: { id: "sp-lumen", name: "Lumen Atelier", leadDays: 21, casePack: 4 },
  kitchen: { id: "sp-olive", name: "Ayvalık Olivewood Works", leadDays: 14, casePack: 6 },
  decor: { id: "sp-hive", name: "Hive & Wick Candles", leadDays: 7, casePack: 24 },
};

/** Units sold per day over the last 30 days. */
export const dailyRate = (p: Product) => p.sold30d / 30;
/** Days the current stock lasts at the 30-day rate; `null` when nothing sells. */
export const daysOfCover = (p: Pick<Product, "stock" | "sold30d">) => (p.sold30d > 0 ? p.stock / (p.sold30d / 30) : null);

/** Enough for 45 days plus the supplier lead time, rounded up to whole cases. */
export function suggestedQty(p: Product) {
  const s = suppliers[p.category];
  const need = Math.ceil(dailyRate(p) * (45 + s.leadDays) - p.stock);
  return need <= 0 ? 0 : Math.ceil(need / s.casePack) * s.casePack;
}

export const unitCost = (p: Product) => Number(p.cost.amount);
