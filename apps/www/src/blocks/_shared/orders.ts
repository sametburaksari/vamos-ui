// E-commerce orders for the Kiln & Linen catalogue. Generated from a fixed seed so the same
// 48 orders appear everywhere (dashboard-08, list-04 grouped table, detail-05 order page).
import type { L } from "./l10n";
import { addDecimal, multiplyDecimal, type Money } from "./money";
import { products, type Channel } from "./products";
import { int, pick, seeded } from "./random";
import { at, NOW_MS } from "./time";

const isoAt = (ms: number) => `${new Date(ms + 3 * 3_600_000).toISOString().slice(0, 19)}+03:00`;

export type OrderStatus = "pending" | "paid" | "fulfilling" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentMethod = "card" | "bank-transfer" | "cash-on-delivery" | "marketplace";
export type FulfilmentStep = "placed" | "paid" | "picked" | "packed" | "shipped" | "delivered";

export interface Customer {
  id: string;
  name: string;
  email: string;
  city: string;
  /** Orders before this list. */
  lifetimeOrders: number;
}

export interface OrderLine {
  productId: string;
  sku: string;
  name: L;
  qty: number;
  unitPrice: Money;
  total: Money;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  /** ISO date-time (+03:00). */
  placedAt: string;
  status: OrderStatus;
  channel: Channel;
  payment: PaymentMethod;
  lines: OrderLine[];
  subtotal: Money;
  shipping: Money;
  /** 20% VAT included in the total. */
  tax: Money;
  total: Money;
  /** Steps reached, in order. */
  steps: Array<{ step: FulfilmentStep; at: string }>;
  carrier?: string;
  tracking?: string;
  refunded?: Money;
}

export const orderStatusLabels: Record<OrderStatus, L> = {
  pending: { en: "Pending payment", tr: "Ödeme bekleniyor" },
  paid: { en: "Paid", tr: "Ödendi" },
  fulfilling: { en: "Fulfilling", tr: "Hazırlanıyor" },
  shipped: { en: "Shipped", tr: "Kargoda" },
  delivered: { en: "Delivered", tr: "Teslim edildi" },
  cancelled: { en: "Cancelled", tr: "İptal edildi" },
  refunded: { en: "Refunded", tr: "İade edildi" },
};

/** Badge tone per status (Badge `tone` prop). */
export const orderStatusTone: Record<OrderStatus, "neutral" | "info" | "accent" | "success" | "warning" | "danger"> = {
  pending: "warning",
  paid: "info",
  fulfilling: "accent",
  shipped: "info",
  delivered: "success",
  cancelled: "neutral",
  refunded: "danger",
};

export const paymentLabels: Record<PaymentMethod, L> = {
  card: { en: "Card", tr: "Kart" },
  "bank-transfer": { en: "Bank transfer", tr: "Havale/EFT" },
  "cash-on-delivery": { en: "Cash on delivery", tr: "Kapıda ödeme" },
  marketplace: { en: "Marketplace payout", tr: "Pazaryeri ödemesi" },
};

export const fulfilmentLabels: Record<FulfilmentStep, L> = {
  placed: { en: "Order placed", tr: "Sipariş alındı" },
  paid: { en: "Payment captured", tr: "Ödeme alındı" },
  picked: { en: "Picked", tr: "Toplandı" },
  packed: { en: "Packed", tr: "Paketlendi" },
  shipped: { en: "Handed to carrier", tr: "Kargoya verildi" },
  delivered: { en: "Delivered", tr: "Teslim edildi" },
};

const customerRows: Array<[string, string]> = [
  ["Aslı Korkmaz", "Istanbul"],
  ["Emre Doğan", "Ankara"],
  ["Sophie Laurent", "Paris"],
  ["Cansu Yalçın", "Izmir"],
  ["Murat Tekin", "Bursa"],
  ["Lea Fischer", "Vienna"],
  ["Ilgın Er", "Antalya"],
  ["Rafael Mendes", "Porto"],
  ["Nil Başaran", "Eskişehir"],
  ["Oğuz Kalkan", "Istanbul"],
  ["Tara Whitfield", "Bristol"],
  ["Sena Gürel", "Istanbul"],
];

export const customers: Customer[] = customerRows.map(([name, city], i) => ({
  id: `cu-${i + 1}`,
  name,
  // first.last@example.com, the way people actually type their address at checkout.
  email: `${name.toLowerCase().replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z ]/g, "").trim().split(/\s+/).join(".")}@example.com`,
  city,
  lifetimeOrders: (i * 7) % 11,
}));
export const customersById: Record<string, Customer> = Object.fromEntries(customers.map((c) => [c.id, c]));

const stepOrder: FulfilmentStep[] = ["placed", "paid", "picked", "packed", "shipped", "delivered"];
const reached: Record<OrderStatus, number> = { pending: 1, paid: 2, fulfilling: 4, shipped: 5, delivered: 6, cancelled: 1, refunded: 6 };
const carriers = ["Kırlangıç Kargo", "Martı Express", "Pusula Parcel", "Atlas Courier"];
const sellable = products.filter((p) => p.status === "active");

function buildOrders(): Order[] {
  const rand = seeded(2611);
  const out: Order[] = [];
  for (let i = 0; i < 48; i++) {
    const offset = -Math.floor(i * 0.62); // newest first, ~30 days back
    const hh = String(offset === 0 ? int(rand, 7, 9) : int(rand, 8, 22)).padStart(2, "0");
    const mm = String(int(rand, 0, 59)).padStart(2, "0");
    const placedAt = at(offset, `${hh}:${mm}`);
    const status: OrderStatus =
      offset === 0 ? pick(rand, ["pending", "paid", "fulfilling"] as const)
      : offset > -3 ? pick(rand, ["paid", "fulfilling", "shipped", "shipped"] as const)
      : rand() < 0.06 ? "cancelled"
      : rand() < 0.07 ? "refunded"
      : rand() < 0.15 ? "shipped"
      : "delivered";
    const lineCount = int(rand, 1, 4);
    const used = new Set<string>();
    const lines: OrderLine[] = [];
    for (let l = 0; l < lineCount; l++) {
      const p = pick(rand, sellable);
      if (used.has(p.id)) continue;
      used.add(p.id);
      const qty = int(rand, 1, 3);
      lines.push({ productId: p.id, sku: p.sku, name: p.name, qty, unitPrice: p.price, total: { amount: multiplyDecimal(p.price.amount, qty), currency: "TRY" } });
    }
    const subtotal = addDecimal(lines.map((l) => l.total.amount));
    const shipping = Number(subtotal) >= 1500 ? "0.00" : "89.90";
    const total = addDecimal([subtotal, shipping]);
    const tax = multiplyDecimal(total, "0.1666667"); // VAT share of a 20%-inclusive price
    const channel = pick(rand, ["web", "web", "web", "marketplace", "marketplace", "retail"] as const);
    const n = reached[status];
    // Each step follows the previous by 25 min – 14 h, never after NOW.
    const placedMs = Date.parse(placedAt);
    let stepMs = placedMs;
    const steps = stepOrder.slice(0, n).map((step, s) => {
      if (s > 0) stepMs = Math.min(NOW_MS - (n - s) * 60_000, stepMs + int(rand, 25, s >= 4 ? 840 : 180) * 60_000);
      return { step, at: isoAt(stepMs) };
    });
    const shippedish = n >= 5;
    out.push({
      id: `o-${1000 + 48 - i}`,
      number: `#KL-${24180 + 48 - i}`,
      customerId: pick(rand, customers).id,
      placedAt,
      status,
      channel,
      payment: channel === "marketplace" ? "marketplace" : pick(rand, ["card", "card", "card", "bank-transfer", "cash-on-delivery"] as const),
      lines,
      subtotal: { amount: subtotal, currency: "TRY" },
      shipping: { amount: shipping, currency: "TRY" },
      tax: { amount: tax, currency: "TRY" },
      total: { amount: total, currency: "TRY" },
      steps,
      carrier: shippedish ? pick(rand, carriers) : undefined,
      tracking: shippedish ? `KL${String(73001942 + i * 389).padStart(10, "0")}` : undefined,
      refunded: status === "refunded" ? { amount: total, currency: "TRY" } : undefined,
    });
  }
  return out;
}

/** 48 orders, newest first (TODAY back ~30 days). */
export const orders: Order[] = buildOrders();
export const ordersById: Record<string, Order> = Object.fromEntries(orders.map((o) => [o.id, o]));
export const ordersOf = (customerId: string) => orders.filter((o) => o.customerId === customerId);

/** Orders placed on a YYYY-MM-DD day. */
export const ordersOn = (date: string) => orders.filter((o) => o.placedAt.startsWith(date));

/** Checkout funnel for the last 30 days (sessions → purchases). */
export const checkoutFunnel: Array<{ key: string; label: L; value: number }> = [
  { key: "sessions", label: { en: "Sessions", tr: "Oturumlar" }, value: 48210 },
  { key: "product", label: { en: "Viewed a product", tr: "Ürün görüntüledi" }, value: 21960 },
  { key: "cart", label: { en: "Added to cart", tr: "Sepete ekledi" }, value: 4870 },
  { key: "checkout", label: { en: "Started checkout", tr: "Ödemeye geçti" }, value: 2310 },
  { key: "purchase", label: { en: "Purchased", tr: "Satın aldı" }, value: 1104 },
];

/** Return reasons over the last 30 days. */
export const returnReasons: Array<{ key: string; label: L; count: number }> = [
  { key: "damaged", label: { en: "Arrived damaged", tr: "Hasarlı geldi" }, count: 14 },
  { key: "size", label: { en: "Wrong size", tr: "Beden/ölçü uymadı" }, count: 11 },
  { key: "colour", label: { en: "Colour not as pictured", tr: "Renk fotoğraftaki gibi değil" }, count: 7 },
  { key: "changed-mind", label: { en: "Changed my mind", tr: "Vazgeçtim" }, count: 5 },
];

