import { LineChart, type ChartConfig } from "@vamos-cms/ui/charts";

const winRate = [
  { month: "2026-05-01", maya: 0.31, diego: 0.24, priya: 0.28, tom: 0.19 },
  { month: "2026-06-01", maya: 0.34, diego: 0.27, priya: 0.26, tom: 0.22 },
  { month: "2026-07-01", maya: 0.33, diego: 0.29, priya: 0.31, tom: 0.21 },
  { month: "2026-08-01", maya: 0.37, diego: 0.28, priya: 0.33, tom: 0.25 },
  { month: "2026-09-01", maya: 0.36, diego: 0.31, priya: 0.35, tom: 0.24 },
  { month: "2026-10-01", maya: 0.39, diego: 0.3, priya: 0.36, tom: 0.27 },
];

const config = {
  maya: { label: "Maya", format: "percent" },
  priya: { label: "Priya", format: "percent" },
  diego: { label: "Diego", format: "percent" },
  tom: { label: "Tom", format: "percent" },
} satisfies ChartConfig;

export default function LineChartEndLabels() {
  // Direct labels instead of a legend; with 4+ series dash patterns are assigned too.
  return <LineChart title="Win rate by rep" data={winRate} x="month" xFormat={{ date: "month" }} config={config} endLabels dots="last" height="md" className="w-full" />;
}
