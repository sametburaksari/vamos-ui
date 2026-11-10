import { BarChart, type ChartConfig } from "@vamos-cms/ui/charts";

const quarters = [
  { quarter: "Q1", target: 420_000, actual: 386_500 },
  { quarter: "Q2", target: 460_000, actual: 471_200 },
  { quarter: "Q3", target: 500_000, actual: 512_800 },
  { quarter: "Q4", target: 560_000, actual: 498_300 },
];

const config = {
  target: { label: "Target", format: "currency", color: "fg-subtle" },
  actual: { label: "Actual", format: "currency" },
} satisfies ChartConfig;

export default function BarChartGrouped() {
  return <BarChart title="Bookings vs target" data={quarters} x="quarter" config={config} height="md" className="w-full" />;
}
