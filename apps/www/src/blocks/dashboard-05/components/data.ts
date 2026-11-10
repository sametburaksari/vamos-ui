import type { ChartConfig, FunnelStep } from "@vamos-ui/react/charts";

/** Last day of the demo data (date-only). */
export const TODAY = "2026-11-10";

function addDays(day: string, n: number) {
  const [y, m, d] = day.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/**
 * Daily revenue for the last 90 days plus the same weekday a period earlier. Deterministic
 * (no Math.random) so server and client render the same numbers.
 */
export const dailyRevenue = Array.from({ length: 90 }, (_, i) => {
  const day = addDays(TODAY, i - 89);
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  const weekend = weekday === 0 || weekday === 6 ? 1.32 : 1;
  const trend = 2200 + i * 14;
  const wave = Math.sin(i / 4.3) * 260 + ((i * 47) % 180);
  const revenue = Math.round((trend + wave) * weekend);
  const previous = Math.round((trend * 0.86 + Math.cos(i / 5.1) * 210 + ((i * 31) % 150)) * weekend);
  return { day, revenue, previous };
});

export const revenueConfig = {
  revenue: { label: "Revenue", format: { currency: "USD" } },
  previous: { label: "Previous period", format: { currency: "USD" }, color: "chart-2" },
} satisfies ChartConfig;

export const channels = [
  { channel: "store", revenue: 51_840 },
  { channel: "instagram", revenue: 14_260 },
  { channel: "marketplace", revenue: 11_390 },
  { channel: "pos", revenue: 6_720 },
];

export const channelConfig = {
  store: { label: "Online store", format: { currency: "USD" } },
  instagram: { label: "Instagram Shop" },
  marketplace: { label: "Marketplaces" },
  pos: { label: "In-store POS" },
} satisfies ChartConfig;

export const checkout: FunnelStep[] = [
  { key: "sessions", label: "Sessions", value: 44_180 },
  { key: "cart", label: "Added to cart", value: 4_310 },
  { key: "checkout", label: "Reached checkout", value: 1_962 },
  { key: "paid", label: "Paid", value: 1_236 },
];

export interface Product {
  sku: string;
  name: string;
  variant: string;
  units: number;
  /** Decimal string, USD. */
  revenue: string;
  /** Units per week, last 8 weeks. */
  weekly: number[];
  stock: number;
}

export const products: Product[] = [
  { sku: "CER-MUG-12", name: "Stoneware mug", variant: "Sand · 12 oz", units: 642, revenue: "16050.00", weekly: [58, 61, 66, 72, 70, 81, 88, 96], stock: 214 },
  { sku: "LIN-TWL-SET", name: "Linen tea towel set", variant: "Set of 3 · Olive", units: 388, revenue: "13580.00", weekly: [44, 40, 46, 45, 49, 52, 50, 58], stock: 96 },
  { sku: "OAK-BRD-L", name: "Oak serving board", variant: "Large", units: 171, revenue: "11115.00", weekly: [18, 22, 19, 24, 21, 20, 23, 25], stock: 12 },
  { sku: "CND-FIG-8", name: "Fig & cedar candle", variant: "8 oz", units: 296, revenue: "8288.00", weekly: [41, 38, 36, 37, 34, 35, 33, 31], stock: 340 },
  { sku: "BRS-SPN-4", name: "Brass spoon set", variant: "Set of 4", units: 154, revenue: "6930.00", weekly: [12, 15, 17, 16, 19, 22, 24, 29], stock: 58 },
];

export type Payment = "Paid" | "Pending" | "Refunded";
export type Fulfillment = "Unfulfilled" | "Shipped" | "Delivered" | "Returned";

export interface Order {
  number: string;
  customer: string;
  city: string;
  items: number;
  total: string;
  /** ISO instant. */
  placed: string;
  payment: Payment;
  fulfillment: Fulfillment;
}

export const orders: Order[] = [
  { number: "#10482", customer: "Charlotte Dubois", city: "Lyon", items: 3, total: "128.40", placed: "2026-11-10T14:41:00Z", payment: "Paid", fulfillment: "Unfulfilled" },
  { number: "#10481", customer: "Mehmet Öztürk", city: "Izmir", items: 1, total: "65.00", placed: "2026-11-10T13:58:00Z", payment: "Paid", fulfillment: "Unfulfilled" },
  { number: "#10480", customer: "Grace Liu", city: "London", items: 5, total: "241.75", placed: "2026-11-10T11:12:00Z", payment: "Pending", fulfillment: "Unfulfilled" },
  { number: "#10479", customer: "Jakob Svensson", city: "Malmö", items: 2, total: "84.00", placed: "2026-11-10T08:30:00Z", payment: "Paid", fulfillment: "Shipped" },
  { number: "#10476", customer: "Aisha Rahman", city: "Manchester", items: 4, total: "176.20", placed: "2026-11-09T19:05:00Z", payment: "Paid", fulfillment: "Delivered" },
  { number: "#10471", customer: "Luca Bianchi", city: "Milan", items: 1, total: "28.00", placed: "2026-11-09T10:47:00Z", payment: "Refunded", fulfillment: "Returned" },
];
