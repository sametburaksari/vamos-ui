import { ComboChart, type ChartConfig } from "@vamos-ui/react/charts";

const visits = [
  { day: "Mon", visits: 4_210, bounce: 0.42 },
  { day: "Tue", visits: 4_860, bounce: 0.39 },
  { day: "Wed", visits: 5_120, bounce: 0.37 },
  { day: "Thu", visits: 4_930, bounce: 0.41 },
  { day: "Fri", visits: 4_480, bounce: 0.44 },
  { day: "Sat", visits: 2_310, bounce: 0.52 },
  { day: "Sun", visits: 2_080, bounce: 0.55 },
];

const config = {
  visits: { label: "Visits", format: "integer" },
  bounce: { label: "Bounce rate", format: "percent", color: "chart-2" },
} satisfies ChartConfig;

export default function ComboChartEndAxisHidden() {
  // Compact cards: hide the end axis — the rate stays in the tooltip and the table.
  return <ComboChart title="Visits and bounce rate" data={visits} x="day" bars={["visits"]} lines={["bounce"]} endAxis={false} config={config} height="sm" className="w-full" />;
}
