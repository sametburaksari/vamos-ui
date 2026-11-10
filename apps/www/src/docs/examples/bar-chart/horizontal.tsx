import { BarChart, type ChartConfig } from "@vamos-cms/ui/charts";

const reps = [
  { rep: "Maya Chen", won: 184_000 },
  { rep: "Diego Alvarez", won: 152_500 },
  { rep: "Priya Raman", won: 131_200 },
  { rep: "Tom Becker", won: 98_400 },
  { rep: "Aylin Kaya", won: 87_900 },
  { rep: "Sam Okafor", won: 61_300 },
];

const config = { won: { label: "Closed won", format: "currency" } } satisfies ChartConfig;

export default function BarChartHorizontal() {
  // Rows grow from inline-start (from the right in RTL).
  return <BarChart title="Closed won by rep, Q4" data={reps} x="rep" layout="horizontal" config={config} valueLabels height="md" className="w-full" />;
}
