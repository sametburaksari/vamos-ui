"use client";

import { BarChart, type ChartConfig } from "@vamos-cms/ui/charts";

const posts = [
  { month: "2026-05-01", published: 34 },
  { month: "2026-06-01", published: 41 },
  { month: "2026-07-01", published: 29 },
  { month: "2026-08-01", published: 38 },
  { month: "2026-09-01", published: 47 },
  { month: "2026-10-01", published: 52 },
  { month: "2026-11-01", published: 19 },
];

const config = { published: { label: "Posts published", format: "integer" } } satisfies ChartConfig;

export default function BarChartHighlight() {
  // Highlight the selected month; the rest dim to 35%.
  return <BarChart title="Posts published" data={posts} x="month" xFormat={{ date: "month" }} config={config} highlight={(r) => r.month === "2026-10-01"} valueLabels height="md" className="w-full" />;
}
