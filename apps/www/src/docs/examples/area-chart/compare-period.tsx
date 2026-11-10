import { AreaChart, type ChartConfig } from "@vamos-cms/ui/charts";

// Numeric-looking keys ("2026") get reordered by JavaScript, so name series by meaning.
const headcount = [
  { month: "Jan", thisYear: 212, lastYear: 184 },
  { month: "Feb", thisYear: 216, lastYear: 186 },
  { month: "Mar", thisYear: 223, lastYear: 191 },
  { month: "Apr", thisYear: 229, lastYear: 193 },
  { month: "May", thisYear: 231, lastYear: 198 },
  { month: "Jun", thisYear: 238, lastYear: 202 },
  { month: "Jul", thisYear: 244, lastYear: 205 },
  { month: "Aug", thisYear: 246, lastYear: 207 },
  { month: "Sep", thisYear: 252, lastYear: 209 },
  { month: "Oct", thisYear: 259, lastYear: 210 },
];

const config = {
  thisYear: { label: "2026", format: "integer" },
  lastYear: { label: "2025", format: "integer", color: "fg-subtle" },
} satisfies ChartConfig;

export default function AreaChartComparePeriod() {
  // The comparison series is dashed and never filled.
  return <AreaChart title="Headcount, 2026 vs 2025" data={headcount} x="month" config={config} compare={{ key: "lastYear" }} height="md" className="w-full" />;
}
