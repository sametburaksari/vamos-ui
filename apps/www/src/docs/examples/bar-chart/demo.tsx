import { BarChart, type ChartConfig } from "@vamos-ui/react/charts";

const signups = [
  { month: "2026-05-01", signups: 1284 },
  { month: "2026-06-01", signups: 1412 },
  { month: "2026-07-01", signups: 1196 },
  { month: "2026-08-01", signups: 1538 },
  { month: "2026-09-01", signups: 1702 },
  { month: "2026-10-01", signups: 1865 },
];

const config = { signups: { label: "Sign-ups", format: "integer" } } satisfies ChartConfig;

export default function BarChartDemo() {
  return <BarChart title="Monthly sign-ups" data={signups} x="month" xFormat={{ date: "month" }} config={config} height="md" className="w-full" />;
}
