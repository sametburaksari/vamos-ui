import { LineChart, type ChartConfig } from "@vamos-ui/react/charts";

const conversion = [
  { week: "2026-09-07", landing: 0.042, pricing: 0.067, blog: 0.011 },
  { week: "2026-09-14", landing: 0.045, pricing: 0.071, blog: 0.012 },
  { week: "2026-09-21", landing: 0.039, pricing: 0.064, blog: 0.014 },
  { week: "2026-09-28", landing: 0.048, pricing: 0.076, blog: 0.013 },
  { week: "2026-10-05", landing: 0.051, pricing: 0.079, blog: 0.016 },
  { week: "2026-10-12", landing: 0.049, pricing: 0.083, blog: 0.015 },
  { week: "2026-10-19", landing: 0.055, pricing: 0.088, blog: 0.018 },
];

const config = {
  pricing: { label: "Pricing page", format: "percent" },
  landing: { label: "Landing pages", format: "percent" },
  blog: { label: "Blog", format: "percent" },
} satisfies ChartConfig;

export default function LineChartDemo() {
  return <LineChart title="Conversion rate by entry page" data={conversion} x="week" config={config} height="md" className="w-full" />;
}
