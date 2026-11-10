import { ComboChart, type ChartConfig } from "@vamos-ui/react/charts";

const quotes = [
  { month: "2026-05-01", sent: 42, winRate: 0.31 },
  { month: "2026-06-01", sent: 51, winRate: 0.35 },
  { month: "2026-07-01", sent: 47, winRate: 0.29 },
  { month: "2026-08-01", sent: 58, winRate: 0.33 },
  { month: "2026-09-01", sent: 63, winRate: 0.38 },
  { month: "2026-10-01", sent: 71, winRate: 0.36 },
];

const config = {
  sent: { label: "Quotes sent", format: "integer" },
  winRate: { label: "Win rate", format: "percent", color: "chart-3" },
} satisfies ChartConfig;

export default function ComboChartDemo() {
  // Bars on the start axis, the rate on the end axis; both share the zero line and grid.
  return (
    <ComboChart
      title="Quotes sent and win rate"
      data={quotes}
      x="month"
      xFormat={{ date: "month" }}
      bars={["sent"]}
      lines={["winRate"]}
      config={config}
      startAxisLabel="Quotes"
      endAxisLabel="Win rate"
      height="md"
      className="w-full"
    />
  );
}
