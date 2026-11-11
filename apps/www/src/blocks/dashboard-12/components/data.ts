// Marketing data for dashboard-12: the shared campaigns, 90 days of daily spend / conversions /
// revenue per channel (seeded, so every render is the same) and conversion credit per channel
// under four attribution models.
import type { L } from "../../_shared/l10n";
import { campaignChannelLabels, campaigns, type Campaign } from "../../_shared/metrics";
import { series } from "../../_shared/random";
import { TODAY, day, daysBetween } from "../../_shared/time";

export { campaignChannelLabels, campaigns, TODAY, daysBetween };
export type { Campaign };

export type ChannelKey = Campaign["channel"];
export const channels: ChannelKey[] = ["search", "social", "display", "email", "affiliate"];
export const channelColor: Record<ChannelKey, "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"> = {
  search: "chart-1",
  social: "chart-2",
  display: "chart-3",
  email: "chart-4",
  affiliate: "chart-5",
};

export type Range = "7" | "30" | "90";
export const ranges: Array<{ key: Range; label: L }> = [
  { key: "7", label: { en: "7 days", tr: "7 gün" } },
  { key: "30", label: { en: "30 days", tr: "30 gün" } },
  { key: "90", label: { en: "90 days", tr: "90 gün" } },
];

// Average daily spend (TRY), cost per conversion and order value per channel.
const profile: Record<ChannelKey, { spend: number; cpa: number; aov: number; seed: number }> = {
  search: { spend: 3_400, cpa: 138, aov: 1_710, seed: 11 },
  social: { spend: 2_050, cpa: 236, aov: 1_300, seed: 12 },
  display: { spend: 620, cpa: 138, aov: 1_330, seed: 13 },
  email: { spend: 70, cpa: 9, aov: 1_180, seed: 14 },
  affiliate: { spend: 430, cpa: 68, aov: 1_180, seed: 15 },
};
const weekly = [0.92, 0.88, 0.94, 1, 1.06, 1.2, 1.14];

/** 180 days so every range can compare against the previous period. Oldest first. */
export const daily = (() => {
  const n = 180;
  const per = Object.fromEntries(
    channels.map((ch) => {
      const p = profile[ch];
      const spend = series(n, { start: p.spend * 0.82, drift: 0.0012, noise: 0.16, seed: p.seed, weekly });
      const eff = series(n, { start: 1, drift: 0.0009, noise: 0.22, seed: p.seed + 50, decimals: 3 });
      return [ch, spend.map((s, i) => ({ spend: s, conversions: Math.max(0, Math.round((s / p.cpa) * eff[i]!)), aov: p.aov }))];
    }),
  ) as Record<ChannelKey, Array<{ spend: number; conversions: number; aov: number }>>;
  return Array.from({ length: n }, (_, i) => {
    const row: { date: string } & Record<`${ChannelKey}Spend` | `${ChannelKey}Conv` | `${ChannelKey}Rev`, number> = { date: day(i - (n - 1)) } as never;
    for (const ch of channels) {
      const d = per[ch][i]!;
      row[`${ch}Spend`] = d.spend;
      row[`${ch}Conv`] = d.conversions;
      row[`${ch}Rev`] = d.conversions * d.aov;
    }
    return row;
  });
})();
export type DailyRow = (typeof daily)[number];

export function totals(rows: DailyRow[], only?: ChannelKey[]) {
  const list = only ?? channels;
  let spend = 0;
  let conv = 0;
  let rev = 0;
  for (const r of rows)
    for (const ch of list) {
      spend += r[`${ch}Spend`];
      conv += r[`${ch}Conv`];
      rev += r[`${ch}Rev`];
    }
  return { spend, conv, rev, cpa: conv ? spend / conv : 0, roas: spend ? rev / spend : 0 };
}

/** Current and previous window for a range. */
export function windowOf(range: Range) {
  const n = Number(range);
  return { now: daily.slice(-n), prev: daily.slice(-2 * n, -n) };
}

export type Model = "last" | "first" | "linear" | "position";
export const models: Array<{ key: Model; label: L; hint: L }> = [
  { key: "last", label: { en: "Last click", tr: "Son tıklama" }, hint: { en: "All credit to the final touch before purchase.", tr: "Tüm pay satın almadan önceki son temasa." } },
  { key: "first", label: { en: "First click", tr: "İlk tıklama" }, hint: { en: "All credit to the touch that brought the customer in.", tr: "Tüm pay müşteriyi getiren ilk temasa." } },
  { key: "linear", label: { en: "Linear", tr: "Doğrusal" }, hint: { en: "Credit split evenly across every touch.", tr: "Pay tüm temaslara eşit dağıtılır." } },
  { key: "position", label: { en: "Position-based", tr: "Konuma dayalı" }, hint: { en: "40% first, 40% last, 20% shared by the middle.", tr: "%40 ilk, %40 son, %20 aradakiler." } },
];
/** Share of conversions credited to each channel, per model (sums to 1). */
export const credit: Record<Model, Record<ChannelKey, number>> = {
  last: { search: 0.46, social: 0.17, display: 0.06, email: 0.21, affiliate: 0.1 },
  first: { search: 0.31, social: 0.38, display: 0.14, email: 0.04, affiliate: 0.13 },
  linear: { search: 0.38, social: 0.27, display: 0.11, email: 0.12, affiliate: 0.12 },
  position: { search: 0.39, social: 0.28, display: 0.1, email: 0.12, affiliate: 0.11 },
};

/** How far through its flight a campaign is (0–1), for pacing. */
export function elapsed(cp: Campaign) {
  const total = Math.max(1, daysBetween(cp.start, cp.end));
  return Math.min(1, Math.max(0, daysBetween(cp.start, TODAY) / total));
}
