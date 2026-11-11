// Time series and KPI sets for the dashboards that do not sit on a single entity:
// SaaS metrics (dashboard-14), marketing campaigns (dashboard-12), realtime web analytics
// (dashboard-15), warehouse movements (dashboard-13) and daily store revenue (dashboard-08).
import type { L } from "./l10n";
import type { Money } from "./money";
import { series } from "./random";
import { day, minutesFromNow, month } from "./time";

/** Last 30 days of store revenue in TRY (oldest first), weekend peaks. */
export const dailyRevenue = series(30, { start: 61_000, drift: 0.006, noise: 0.14, seed: 31, weekly: [0.9, 0.85, 0.92, 1, 1.08, 1.32, 1.24] }).map((v, i) => ({
  date: day(i - 29),
  revenue: v.toFixed(2),
  orders: Math.round(v / 1180),
}));

/** SaaS: last 12 months (oldest first). Amounts in USD. */
export const saasMonths = (() => {
  let mrr = 182_400;
  return Array.from({ length: 12 }, (_, i) => {
    const newMrr = 9_800 + i * 420 + ((i * 37) % 5) * 300;
    const expansion = 4_100 + ((i * 53) % 7) * 260;
    const contraction = 1_300 + ((i * 29) % 4) * 210;
    const churned = 3_600 + ((i * 17) % 6) * 340;
    mrr += newMrr + expansion - contraction - churned;
    return { month: month(i - 11), mrr: mrr.toFixed(2), newMrr: newMrr.toFixed(2), expansion: expansion.toFixed(2), contraction: contraction.toFixed(2), churned: churned.toFixed(2), customers: 812 + i * 19, logoChurnRate: Math.round((0.021 - i * 0.0006) * 10000) / 10000 };
  });
})();

/** Retention cohorts: share of customers still active N months after signing up (rows oldest first). */
export const cohorts: Array<{ cohort: string; size: number; retention: number[] }> = Array.from({ length: 8 }, (_, r) => {
  const size = 62 + ((r * 13) % 25);
  const length = 8 - r;
  return {
    cohort: month(r - 8),
    size,
    retention: Array.from({ length }, (_, c) => (c === 0 ? 1 : Math.round((0.94 ** c - (r % 3) * 0.012 * c) * 1000) / 1000)),
  };
});

export interface Campaign {
  id: string;
  name: string;
  channel: "search" | "social" | "display" | "email" | "affiliate";
  status: "active" | "paused" | "ended" | "scheduled";
  spend: Money;
  budget: Money;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: Money;
  start: string;
  end: string;
}

export const campaignChannelLabels: Record<Campaign["channel"], L> = {
  search: { en: "Paid search", tr: "Arama ağı" },
  social: { en: "Paid social", tr: "Sosyal medya" },
  display: { en: "Display", tr: "Görüntülü reklam" },
  email: { en: "Email", tr: "E-posta" },
  affiliate: { en: "Affiliate", tr: "Satış ortaklığı" },
};

const tl = (n: number): Money => ({ amount: n.toFixed(2), currency: "TRY" });
export const campaigns: Campaign[] = [
  { id: "cp-1", name: "Winter textiles · Search", channel: "search", status: "active", spend: tl(84_200), budget: tl(120_000), impressions: 612_000, clicks: 21_400, conversions: 612, revenue: tl(1_048_000), start: day(-24), end: day(36) },
  { id: "cp-2", name: "Ceramics reels · Social", channel: "social", status: "active", spend: tl(56_900), budget: tl(60_000), impressions: 1_840_000, clicks: 18_900, conversions: 241, revenue: tl(312_400), start: day(-30), end: day(6) },
  { id: "cp-3", name: "Retargeting · Display", channel: "display", status: "active", spend: tl(18_300), budget: tl(30_000), impressions: 930_000, clicks: 4_120, conversions: 133, revenue: tl(176_900), start: day(-45), end: day(45) },
  { id: "cp-4", name: "Black Friday early access", channel: "email", status: "scheduled", spend: tl(0), budget: tl(4_000), impressions: 0, clicks: 0, conversions: 0, revenue: tl(0), start: day(9), end: day(12) },
  { id: "cp-5", name: "Home bloggers", channel: "affiliate", status: "active", spend: tl(12_750), budget: tl(25_000), impressions: 214_000, clicks: 6_300, conversions: 188, revenue: tl(221_500), start: day(-60), end: day(30) },
  { id: "cp-6", name: "Autumn lighting · Social", channel: "social", status: "ended", spend: tl(41_000), budget: tl(40_000), impressions: 1_120_000, clicks: 9_800, conversions: 97, revenue: tl(118_300), start: day(-75), end: day(-20) },
];

/** Realtime analytics: visitors per minute for the last 30 minutes (oldest first). */
export const liveVisitorsPerMinute = series(30, { start: 140, drift: 0.004, noise: 0.18, seed: 77 }).map((v, i) => ({ at: minutesFromNow(i - 29), visitors: v }));

export const topPagesNow: Array<{ path: string; title: L; visitors: number }> = [
  { path: "/", title: { en: "Home", tr: "Ana sayfa" }, visitors: 41 },
  { path: "/collections/winter-textiles", title: { en: "Winter textiles", tr: "Kış tekstilleri" }, visitors: 33 },
  { path: "/products/washed-linen-duvet-cover", title: { en: "Washed linen duvet cover", tr: "Yıkanmış keten nevresim" }, visitors: 21 },
  { path: "/cart", title: { en: "Cart", tr: "Sepet" }, visitors: 14 },
  { path: "/journal/how-to-care-for-linen", title: { en: "How to care for linen", tr: "Keten bakımı nasıl yapılır" }, visitors: 11 },
];

export const trafficSourcesNow: Array<{ source: string; visitors: number }> = [
  { source: "google", visitors: 62 },
  { source: "instagram.com", visitors: 38 },
  { source: "direct", visitors: 31 },
  { source: "newsletter", visitors: 17 },
  { source: "pinterest.com", visitors: 9 },
];

/** Warehouse stock movements, today (newest first). */
export const stockMovements: Array<{ id: string; at: string; productId: string; type: "in" | "out" | "transfer" | "adjustment"; qty: number; warehouseId: string; reference: string }> = [
  { id: "mv-1", at: minutesFromNow(-8), productId: "pr-13", type: "out", qty: -24, warehouseId: "wh-gebze", reference: "#KL-24228" },
  { id: "mv-2", at: minutesFromNow(-26), productId: "pr-05", type: "adjustment", qty: -24, warehouseId: "wh-ankara", reference: "Cycle count" },
  { id: "mv-3", at: minutesFromNow(-55), productId: "pr-01", type: "in", qty: 300, warehouseId: "wh-gebze", reference: "PO-8812" },
  { id: "mv-4", at: minutesFromNow(-80), productId: "pr-09", type: "transfer", qty: 40, warehouseId: "wh-izmir", reference: "TR-0419 → Gebze" },
  { id: "mv-5", at: minutesFromNow(-140), productId: "pr-10", type: "out", qty: -6, warehouseId: "wh-ankara", reference: "#KL-24221" },
];
