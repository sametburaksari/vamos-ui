// The app behind the re-auth dialog: recent orders and one order with an unsaved note.
import { customersById, me, orderStatusLabels, orderStatusTone, orders, type L } from "../../_shared";

export const account = { name: me.name, email: me.email, title: me.title };

export const recentOrders = [...orders]
  .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
  .slice(0, 7)
  .map((o) => ({
    id: o.id,
    number: o.number,
    customer: customersById[o.customerId]?.name ?? "—",
    placedAt: o.placedAt,
    status: orderStatusLabels[o.status],
    tone: orderStatusTone[o.status],
    total: o.total,
  }));

export const draftOrder = recentOrders[1]!;
export const draftNote: L = {
  en: "Customer called — wants the linen set gift-wrapped and shipped with the second parcel. Waive the wrap fee.",
  tr: "Müşteri aradı — keten seti hediye paketiyle ve ikinci koliyle birlikte istiyor. Paket ücretini almayın.",
};

export const nav: Array<{ id: string; label: L; count?: number }> = [
  { id: "home", label: { en: "Home", tr: "Ana sayfa" } },
  { id: "orders", label: { en: "Orders", tr: "Siparişler" }, count: 12 },
  { id: "products", label: { en: "Products", tr: "Ürünler" } },
  { id: "customers", label: { en: "Customers", tr: "Müşteriler" } },
  { id: "returns", label: { en: "Returns", tr: "İadeler" }, count: 3 },
  { id: "reports", label: { en: "Reports", tr: "Raporlar" } },
];

/** Minutes of inactivity before the session ends. */
export const IDLE_MINUTES = 30;
