import { LineChart, type ChartConfig } from "@vamos-cms/ui/charts";

const churn = [
  { month: "2026-05-01", starter: 0.061, team: 0.034, business: 0.012 },
  { month: "2026-06-01", starter: 0.058, team: 0.031, business: 0.014 },
  { month: "2026-07-01", starter: 0.064, team: 0.029, business: 0.011 },
  { month: "2026-08-01", starter: 0.052, team: 0.027, business: 0.009 },
  { month: "2026-09-01", starter: 0.049, team: 0.026, business: 0.01 },
  { month: "2026-10-01", starter: 0.046, team: 0.024, business: 0.008 },
];

const config = {
  starter: { label: "Starter", format: "percent" },
  team: { label: "Team", format: "percent" },
  business: { label: "Business", format: "percent" },
} satisfies ChartConfig;

export default function ChartTableToggle() {
  // The table is always in the page for screen readers; tableToggle shows it to everyone.
  return <LineChart title="Monthly churn by plan" data={churn} x="month" xFormat={{ date: "month" }} xLabel="Month" config={config} height="md" tableToggle className="w-full" />;
}
