// Orders grouped for list-04. Reuses the shared Kiln & Linen orders and customers, so the same
// #KL numbers show up in dashboard-08 and the detail-05 order page.
import type { L } from "../../_shared/l10n";
import { addDecimal } from "../../_shared/money";
import { customersById, orderStatusLabels, orders, type Order, type OrderStatus } from "../../_shared/orders";
import { channelLabels, type Channel } from "../../_shared/products";

export type GroupBy = "customer" | "status" | "channel";
export type GroupSort = "revenue" | "orders" | "latest" | "name";
export type StatusScope = "all" | "open" | "done" | "problems";

export const scopeStatuses: Record<StatusScope, OrderStatus[] | null> = {
  all: null,
  open: ["pending", "paid", "fulfilling", "shipped"],
  done: ["delivered"],
  problems: ["cancelled", "refunded"],
};

export const scopeLabels: Record<StatusScope, L> = {
  all: { en: "All", tr: "Tümü" },
  open: { en: "Open", tr: "Açık" },
  done: { en: "Delivered", tr: "Teslim edilen" },
  problems: { en: "Cancelled & refunded", tr: "İptal ve iade" },
};

export const groupByLabels: Record<GroupBy, L> = {
  customer: { en: "Customer", tr: "Müşteri" },
  status: { en: "Status", tr: "Durum" },
  channel: { en: "Channel", tr: "Kanal" },
};

export const sortLabels: Record<GroupSort, L> = {
  revenue: { en: "Highest revenue", tr: "En yüksek ciro" },
  orders: { en: "Most orders", tr: "En çok sipariş" },
  latest: { en: "Latest order", tr: "Son sipariş" },
  name: { en: "Name", tr: "Ada göre" },
};

const OPEN = new Set<OrderStatus>(scopeStatuses.open!);

/** What an order adds to revenue: cancelled orders count zero, refunds are taken off. */
export function netOf(o: Order): string {
  if (o.status === "cancelled" || o.status === "refunded") return "0.00";
  return o.total.amount;
}

export const unitsOf = (o: Order) => o.lines.reduce((s, l) => s + l.qty, 0);

export interface OrderGroup {
  key: string;
  /** Customer name, or a label map for status / channel groups. */
  name: string | L;
  /** Customer email + city (customer grouping only). */
  email?: string;
  city?: string;
  status?: OrderStatus;
  orders: Order[];
  net: string;
  units: number;
  open: number;
  latest: string;
}

export function groupOrders(list: Order[], by: GroupBy): OrderGroup[] {
  const map = new Map<string, Order[]>();
  for (const o of list) {
    const key = by === "customer" ? o.customerId : by === "status" ? o.status : o.channel;
    const arr = map.get(key);
    if (arr) arr.push(o);
    else map.set(key, [o]);
  }
  return [...map.entries()].map(([key, items]) => {
    const sorted = [...items].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
    const cu = by === "customer" ? customersById[key] : undefined;
    return {
      key,
      name: cu ? cu.name : by === "status" ? orderStatusLabels[key as OrderStatus] : channelLabels[key as Channel],
      email: cu?.email,
      city: cu?.city,
      status: by === "status" ? (key as OrderStatus) : undefined,
      orders: sorted,
      net: addDecimal(sorted.map(netOf)),
      units: sorted.reduce((s, o) => s + unitsOf(o), 0),
      open: sorted.filter((o) => OPEN.has(o.status)).length,
      latest: sorted[0]!.placedAt,
    };
  });
}

export { orders };
