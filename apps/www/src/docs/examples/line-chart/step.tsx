import { LineChart, type ChartConfig } from "@vamos-cms/ui/charts";

const prices = [
  { date: "2026-01-01", team: 29, business: 79 },
  { date: "2026-03-01", team: 29, business: 79 },
  { date: "2026-04-15", team: 32, business: 79 },
  { date: "2026-06-01", team: 32, business: 89 },
  { date: "2026-08-01", team: 35, business: 89 },
  { date: "2026-10-01", team: 35, business: 99 },
];

const config = {
  business: { label: "Business seat", format: { currency: "USD" } },
  team: { label: "Team seat", format: { currency: "USD" } },
} satisfies ChartConfig;

export default function LineChartStep() {
  // Step curves for values that change in jumps — prices, plan limits, headcount caps.
  return <LineChart title="List price per seat" data={prices} x="date" config={config} curve="step" dots="all" height="md" className="w-full" />;
}
