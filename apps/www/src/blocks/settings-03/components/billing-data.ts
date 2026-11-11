// Billing screen data: plan catalogue, the subscription's invoices and the current cycle.
// Usage, the current plan and the card come from the shared account fixtures.
import type { L } from "../../_shared/l10n";
import type { Money } from "../../_shared/money";
import { currentPlan, usage, paymentMethod } from "../../_shared/account";
import { day, daysBetween, TODAY } from "../../_shared/time";

export { currentPlan, usage, paymentMethod };

export type PlanId = "starter" | "scale" | "business";
export type Interval = "month" | "year";

export interface Plan {
  id: PlanId;
  name: L;
  pitch: L;
  /** USD per month on monthly billing. Yearly billing charges ten months. */
  monthly: number;
  seats: number;
  orders: number;
  apiRequests: number;
  storageGb: number;
  features: L[];
}

export const plans: Plan[] = [
  {
    id: "starter",
    name: { en: "Starter", tr: "Başlangıç" },
    pitch: { en: "One shop, a small team.", tr: "Tek mağaza, küçük ekip." },
    monthly: 79,
    seats: 5,
    orders: 1_500,
    apiRequests: 100_000,
    storageGb: 10,
    features: [{ en: "Email support", tr: "E-posta desteği" }, { en: "2 sales channels", tr: "2 satış kanalı" }],
  },
  {
    id: "scale",
    name: { en: "Scale", tr: "Ölçek" },
    pitch: { en: "Several channels and a warehouse.", tr: "Birden çok kanal ve depo." },
    monthly: 249,
    seats: 25,
    orders: 10_000,
    apiRequests: 1_000_000,
    storageGb: 50,
    features: [{ en: "Chat support, 4 h reply", tr: "Canlı destek, 4 saatte yanıt" }, { en: "Unlimited channels", tr: "Sınırsız kanal" }, { en: "Audit log, 90 days", tr: "Denetim kaydı, 90 gün" }],
  },
  {
    id: "business",
    name: { en: "Business", tr: "Kurumsal" },
    pitch: { en: "Multiple brands, SSO and contracts.", tr: "Çoklu marka, SSO ve sözleşme." },
    monthly: 590,
    seats: 60,
    orders: 30_000,
    apiRequests: 5_000_000,
    storageGb: 250,
    features: [{ en: "Single sign-on (SAML)", tr: "Tek oturum açma (SAML)" }, { en: "Named account manager", tr: "Atanmış müşteri temsilcisi" }, { en: "Audit log, 2 years", tr: "Denetim kaydı, 2 yıl" }],
  },
];

/* Billing cycle ----------------------------------------------------------------- */

/** The cycle runs from the day after the last renewal to the renewal date. */
export const cycle = (() => {
  const end = currentPlan.renews;
  const start = day(-18);
  const length = daysBetween(start, end);
  const elapsed = daysBetween(start, TODAY);
  return { start, end, length, elapsed, left: length - elapsed };
})();

/** Straight-line projection of a meter to the end of the cycle. */
export const projected = (used: number) => Math.round((used / Math.max(1, cycle.elapsed)) * cycle.length);

/** Overage rules for the metered lines (USD per block). */
export const overageRules: Record<string, { block: number; price: number }> = {
  orders: { block: 100, price: 4 },
  api: { block: 100_000, price: 2 },
};

export function overageCost(key: string, value: number, limit: number) {
  const rule = overageRules[key];
  if (!rule || value <= limit) return 0;
  return Math.ceil((value - limit) / rule.block) * rule.price;
}

/** Turkish VAT on the subscription. */
export const VAT_RATE = 0.2;

/* Invoices ------------------------------------------------------------------------- */

export type BillStatus = "paid" | "refunded" | "failed" | "open";

export interface Bill {
  id: string;
  number: string;
  /** Issue date YYYY-MM-DD. */
  issued: string;
  period: L;
  total: Money;
  status: BillStatus;
  /** Shown under the status ("Paid on the second attempt"). */
  note?: L;
  lines: Array<{ label: L; amount: string }>;
}

export const billStatusLabels: Record<BillStatus, L> = {
  paid: { en: "Paid", tr: "Ödendi" },
  refunded: { en: "Refunded", tr: "İade edildi" },
  failed: { en: "Payment failed", tr: "Ödeme başarısız" },
  open: { en: "Open", tr: "Açık" },
};
export const billStatusTone: Record<BillStatus, "success" | "neutral" | "danger" | "info"> = {
  paid: "success",
  refunded: "neutral",
  failed: "danger",
  open: "info",
};

const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthsTr = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

// Month (1 = January) and year of each invoice, newest first, with the overage it carried.
const history: Array<{ y: number; m: number; plan: number; orders?: number; api?: number; status?: BillStatus; note?: L }> = [
  { y: 2026, m: 10, plan: 249, orders: 96, api: 18 },
  { y: 2026, m: 9, plan: 249, orders: 64, api: 12 },
  { y: 2026, m: 8, plan: 249, orders: 28, note: { en: "Paid on the second attempt", tr: "İkinci denemede ödendi" } },
  { y: 2026, m: 7, plan: 249, api: 6 },
  { y: 2026, m: 6, plan: 249 },
  { y: 2026, m: 5, plan: 249 },
  { y: 2026, m: 4, plan: 164, note: { en: "Prorated upgrade from Starter", tr: "Başlangıç'tan yükseltme, kısmi" } },
  { y: 2026, m: 3, plan: 79 },
  { y: 2026, m: 2, plan: 79, status: "refunded", note: { en: "Refunded as credit for the 9 February outage", tr: "9 Şubat kesintisi için kredi olarak iade edildi" } },
  { y: 2026, m: 1, plan: 79 },
  { y: 2025, m: 12, plan: 79 },
  { y: 2025, m: 11, plan: 79 },
  { y: 2025, m: 10, plan: 79 },
];

const pad = (n: number) => String(n).padStart(2, "0");

export const bills: Bill[] = history.map((h, i) => {
  const lines: Bill["lines"] = [{ label: h.plan === 249 ? { en: "Scale plan", tr: "Ölçek planı" } : h.plan === 79 ? { en: "Starter plan", tr: "Başlangıç planı" } : { en: "Scale plan, prorated", tr: "Ölçek planı, kısmi" }, amount: h.plan.toFixed(2) }];
  if (h.orders) lines.push({ label: { en: "Extra orders", tr: "Ek siparişler" }, amount: h.orders.toFixed(2) });
  if (h.api) lines.push({ label: { en: "Extra API requests", tr: "Ek API istekleri" }, amount: h.api.toFixed(2) });
  const net = lines.reduce((s, l) => s + Number(l.amount), 0);
  lines.push({ label: { en: "VAT 20%", tr: "KDV %20" }, amount: (net * VAT_RATE).toFixed(2) });
  const total = net * (1 + VAT_RATE);
  // Issued on the last day of the month it covers.
  const last = new Date(Date.UTC(h.y, h.m, 0)).getUTCDate();
  return {
    id: `bill-${h.y}-${pad(h.m)}`,
    number: `KL-${h.y}${pad(h.m)}-${String(4210 - i * 37).padStart(5, "0")}`,
    issued: `${h.y}-${pad(h.m)}-${pad(last)}`,
    period: { en: `${monthsEn[h.m - 1]} ${h.y}`, tr: `${monthsTr[h.m - 1]} ${h.y}` },
    total: { amount: total.toFixed(2), currency: "USD" },
    status: h.status ?? "paid",
    note: h.note,
    lines,
  };
});

/** Who receives invoices and the tax details printed on them. */
export const billingProfile = {
  legalName: "Kiln & Linen Tekstil Ltd. Şti.",
  taxOffice: "Kadıköy",
  taxId: "4830192756",
  address: "Loom Street 12, Moda, 34710 Kadıköy, Istanbul",
  emails: ["finance@kilnlinen.example.com", "felix.hartmann@kilnlinen.example.com"],
};
