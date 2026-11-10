"use client";

import { ComboChart, type ChartConfig } from "@vamos-cms/ui/charts";

const hiring = [
  { quarter: "Q1 2026", engineering: 9, sales: 5, support: 3, days: 41 },
  { quarter: "Q2 2026", engineering: 12, sales: 4, support: 6, days: 37 },
  { quarter: "Q3 2026", engineering: 8, sales: 7, support: 4, days: 33 },
  { quarter: "Q4 2026", engineering: 11, sales: 6, support: 5, days: 29 },
];

const config = {
  engineering: { label: "Engineering", format: "integer" },
  sales: { label: "Sales", format: "integer" },
  support: { label: "Support", format: "integer" },
  days: { label: "Avg. days to hire", format: (v) => `${v} d`, color: "chart-6" },
} satisfies ChartConfig;

export default function ComboChartStacked() {
  return <ComboChart title="Hires and time to hire" data={hiring} x="quarter" bars={["engineering", "sales", "support"]} lines={["days"]} stackBars config={config} height="md" className="w-full" />;
}
