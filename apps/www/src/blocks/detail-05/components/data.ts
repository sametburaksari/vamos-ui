// Order detail for one delivered web order from the shared Kiln & Linen fixtures. The order,
// lines, steps, carrier and customer come from _shared; the address, payment ledger and the
// carrier's scan history are added here.
import type { L } from "../../_shared/l10n";
import { orders, ordersById, customersById } from "../../_shared/orders";
import { productsById, warehouses } from "../../_shared/products";
import { returnReasons } from "../../_shared/orders";
import { minutesFromNow } from "../../_shared/time";

export const order = ordersById["o-1040"]!;
export const customer = customersById[order.customerId]!;
export const origin = warehouses.find((w) => w.id === "wh-gebze")!;

/** Position of this order in the list, for the pager. */
export const orderIndex = orders.findIndex((o) => o.id === order.id);
export const orderCount = orders.length;

export const lineProducts = order.lines.map((l) => productsById[l.productId]!);

export const shippingAddress = {
  name: customer.name,
  line1: "Mimoza Sokak No: 14 D: 3",
  line2: "Bahariye Mah.",
  city: "Karşıyaka / İzmir",
  postcode: "35000",
  country: "Türkiye",
  phone: "+90 216 000 00 64",
};

export const parcel = { weightKg: 2.4, dimensions: "40 × 30 × 18 cm", service: { en: "Next-day, signature", tr: "Ertesi gün, imzalı" } as L };

export type LedgerKind = "authorisation" | "capture" | "refund";
export interface LedgerEntry {
  id: string;
  kind: LedgerKind;
  at: string;
  amount: string;
  status: "succeeded" | "pending" | "failed";
  reference: string;
  note?: L;
}

const placed = order.steps.find((s) => s.step === "placed")!.at;
const paid = order.steps.find((s) => s.step === "paid")?.at ?? placed;

export const initialLedger: LedgerEntry[] = [
  { id: "lg-1", kind: "authorisation", at: placed, amount: order.total.amount, status: "succeeded", reference: "AUTH-7Q2K91" },
  { id: "lg-2", kind: "capture", at: paid, amount: order.total.amount, status: "succeeded", reference: "CAP-7Q2K91" },
];

export const card = { brand: "Card", last4: "4417", expiry: "08/29", holder: customer.name, threeDs: true };

/** Carrier scans, newest first. */
export const trackingScans: Array<{ id: string; at: string; place: string; label: L }> = (() => {
  const shipped = order.steps.find((s) => s.step === "shipped")?.at;
  const delivered = order.steps.find((s) => s.step === "delivered")?.at;
  const out: Array<{ id: string; at: string; place: string; label: L }> = [];
  if (delivered) out.push({ id: "sc-4", at: delivered, place: "İzmir · Karşıyaka", label: { en: "Delivered, signed by C. Yalçın", tr: "Teslim edildi, C. Yalçın imzaladı" } });
  if (shipped) {
    const s = Date.parse(shipped);
    const span = (delivered ? Date.parse(delivered) : s + 8 * 3_600_000) - s;
    const iso = (ms: number) => `${new Date(ms + 3 * 3_600_000).toISOString().slice(0, 19)}+03:00`;
    out.push({ id: "sc-3", at: iso(s + span * 0.72), place: "İzmir hub", label: { en: "Out for delivery", tr: "Dağıtıma çıktı" } });
    out.push({ id: "sc-2", at: iso(s + span * 0.3), place: "Kocaeli sorting centre", label: { en: "Sorted, left the facility", tr: "Ayrıştırıldı, merkezden çıktı" } });
    out.push({ id: "sc-1", at: shipped, place: "Gebze Central", label: { en: "Collected from sender", tr: "Göndericiden alındı" } });
  }
  return out;
})();

export const refundReasons = returnReasons;

/** The customer's message that started the return. */
export const customerMessage = {
  at: minutesFromNow(-180),
  body: {
    en: "Hi, one of the two copper coffee pots arrived with a dented spout. The oven dish is perfect — can I get a refund for the dented pot?",
    tr: "Merhaba, iki bakır cezveden birinin ağzı ezik geldi. Fırın kabı kusursuz; ezik cezve için iade alabilir miyim?",
  } as L,
};
