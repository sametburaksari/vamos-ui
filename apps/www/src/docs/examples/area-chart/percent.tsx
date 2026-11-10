import { AreaChart, type ChartConfig } from "@vamos-cms/ui/charts";

const devices = [
  { month: "2026-05-01", mobile: 5840, desktop: 4120, tablet: 610 },
  { month: "2026-06-01", mobile: 6210, desktop: 3980, tablet: 580 },
  { month: "2026-07-01", mobile: 6940, desktop: 3720, tablet: 540 },
  { month: "2026-08-01", mobile: 7180, desktop: 3810, tablet: 520 },
  { month: "2026-09-01", mobile: 6820, desktop: 4260, tablet: 560 },
  { month: "2026-10-01", mobile: 7420, desktop: 4190, tablet: 530 },
];

const config = {
  mobile: { label: "Mobile" },
  desktop: { label: "Desktop" },
  tablet: { label: "Tablet" },
} satisfies ChartConfig;

export default function AreaChartPercent() {
  // 100% stacked: the axis reads 0–100%, the tooltip shows each share.
  return <AreaChart title="Device mix" data={devices} x="month" xFormat={{ date: "month" }} config={config} stack="percent" height="md" className="w-full" />;
}
