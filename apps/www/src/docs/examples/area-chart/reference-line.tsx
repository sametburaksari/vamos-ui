import { AreaChart, type ChartConfig } from "@vamos-ui/react/charts";

const mrr = [
  { month: "2026-04-01", mrr: 38_200 },
  { month: "2026-05-01", mrr: 41_900 },
  { month: "2026-06-01", mrr: 44_300 },
  { month: "2026-07-01", mrr: 43_700 },
  { month: "2026-08-01", mrr: 47_800 },
  { month: "2026-09-01", mrr: 51_200 },
  { month: "2026-10-01", mrr: 54_600 },
];

const config = { mrr: { label: "MRR", format: "currency" } } satisfies ChartConfig;

export default function AreaChartReferenceLine() {
  return <AreaChart title="Monthly recurring revenue" data={mrr} x="month" xFormat={{ date: "month" }} config={config} reference={[{ y: 50_000, label: "Q4 target $50K", color: "accent-ink" }]} curve="linear" height="md" className="w-full" />;
}
