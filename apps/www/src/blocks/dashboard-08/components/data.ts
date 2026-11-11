// Orders desk data for the Kiln & Linen store. Daily totals come from `dailyRevenue` (the whole
// store), the queue and the order sheet from the 48 fixture orders, the funnel and returns from
// the shared e-commerce fixtures.
import type { Formatter } from "@vamos-ui/react/format";
import type { L } from "../../_shared/l10n";
import { dailyRevenue } from "../../_shared/metrics";
import { checkoutFunnel, customersById, orders, returnReasons, type Order, type OrderStatus } from "../../_shared/orders";
import { categoryLabels, products } from "../../_shared/products";

export { checkoutFunnel, customersById, orders, returnReasons, products, categoryLabels };
export type { Order, OrderStatus };

export type Range = 7 | 14 | 30;

/** KPIs for the last `range` days and, where the data reaches, the period before. */
export function periodStats(range: Range) {
  const cur = dailyRevenue.slice(-range);
  const prev = range * 2 <= dailyRevenue.length ? dailyRevenue.slice(-range * 2, -range) : null;
  const sum = (rows: typeof cur) => ({
    revenue: rows.reduce((s, r) => s + Number(r.revenue), 0),
    orders: rows.reduce((s, r) => s + r.orders, 0),
  });
  const a = sum(cur);
  const b = prev ? sum(prev) : null;
  // Sessions scale with orders at the funnel's 30-day conversion, nudged per range.
  const conv = checkoutFunnel.at(-1)!.value / checkoutFunnel[0]!.value;
  const convNow = conv * (range === 7 ? 1.06 : range === 14 ? 1.02 : 1);
  return {
    rows: cur,
    revenue: a.revenue,
    orders: a.orders,
    aov: a.revenue / a.orders,
    conversion: convNow,
    delta: b
      ? { revenue: a.revenue / b.revenue - 1, orders: a.orders / b.orders - 1, aov: a.revenue / a.orders / (b.revenue / b.orders) - 1, conversion: range === 7 ? 0.04 : 0.02 }
      : null,
  };
}

/** Where an order sits on the packing floor. */
export type Lane = "awaiting" | "pick" | "pack" | "transit";
export const lanes: Array<{ key: Lane; status: OrderStatus; label: L; hint: L }> = [
  { key: "awaiting", status: "pending", label: { en: "Awaiting payment", tr: "Ödeme bekliyor" }, hint: { en: "Bank transfer or COD", tr: "Havale veya kapıda ödeme" } },
  { key: "pick", status: "paid", label: { en: "To pick", tr: "Toplanacak" }, hint: { en: "Paid, not started", tr: "Ödendi, başlanmadı" } },
  { key: "pack", status: "fulfilling", label: { en: "Packing", tr: "Paketleniyor" }, hint: { en: "Picked, needs a label", tr: "Toplandı, etiket bekliyor" } },
  { key: "transit", status: "shipped", label: { en: "In transit", tr: "Yolda" }, hint: { en: "With the carrier", tr: "Kargoda" } },
];
export const laneOf = (s: OrderStatus): Lane | null => lanes.find((l) => l.status === s)?.key ?? null;
/** The status an order moves to from each lane. */
export const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = { pending: "paid", paid: "fulfilling", fulfilling: "shipped", shipped: "delivered" };

/** Top products by revenue over 30 days. */
export const topProducts = products
  .filter((p) => p.status === "active")
  .map((p) => ({ p, revenue: Number(p.price.amount) * p.sold30d }))
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 6);

export const returnsCount = returnReasons.reduce((s, r) => s + r.count, 0);

type Fmt = Pick<Formatter, "currency">;
/** "₺1.9M" — explicit min digits so server and browser ICU agree. */
export const tryCompact = (f: Fmt, v: number) =>
  f.currency(Math.round(v), { currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 });
/** "₺1,240" */
export const tryWhole = (f: Fmt, v: number | string) =>
  f.currency(typeof v === "string" ? v : Math.round(v), { currency: "TRY", currencyDisplay: "narrowSymbol" }, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/** Chart axis/tooltip format: "₺75K" with the narrow lira sign in every locale. */
export const tryAxis = (v: unknown, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(Number(v));
export const tryTooltip = (v: unknown, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v));
