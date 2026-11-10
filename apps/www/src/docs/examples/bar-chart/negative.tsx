import { BarChart, type ChartConfig } from "@vamos-ui/react/charts";

const pnl = [
  { month: "2026-05-01", net: 42_300 },
  { month: "2026-06-01", net: 18_900 },
  { month: "2026-07-01", net: -12_400 },
  { month: "2026-08-01", net: -4_800 },
  { month: "2026-09-01", net: 27_600 },
  { month: "2026-10-01", net: 35_100 },
];

const config = { net: { label: "Net income", format: "currency" } } satisfies ChartConfig;

export default function BarChartNegative() {
  // Negative values get a prominent zero line.
  return <BarChart title="Net income" data={pnl} x="month" xFormat={{ date: "month" }} config={config} height="md" className="w-full" />;
}
