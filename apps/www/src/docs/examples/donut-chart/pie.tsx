import { DonutChart, type ChartConfig } from "@vamos-ui/react/charts";

const devices = [
  { device: "mobile", sessions: 7_420 },
  { device: "desktop", sessions: 4_190 },
  { device: "tablet", sessions: 530 },
];

const config = {
  mobile: { label: "Mobile" },
  desktop: { label: "Desktop" },
  tablet: { label: "Tablet" },
} satisfies ChartConfig;

export default function DonutChartPie() {
  return <DonutChart title="Sessions by device" data={devices} nameKey="device" valueKey="sessions" config={config} variant="pie" size="sm" className="w-full max-w-md" />;
}
