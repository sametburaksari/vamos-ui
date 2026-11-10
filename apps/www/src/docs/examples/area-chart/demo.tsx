import { AreaChart, type ChartConfig } from "@vamos-ui/react/charts";

const traffic = Array.from({ length: 30 }, (_, i) => {
  const base = 820 + Math.sin(i / 3.2) * 180 + i * 14;
  return {
    date: `2026-11-${String(i + 1).padStart(2, "0")}`,
    visits: Math.round(base + ((i * 37) % 90)),
    previous: Math.round(base * 0.86 + ((i * 29) % 80)),
  };
});

const config = {
  visits: { label: "Visits" },
  previous: { label: "Previous 30 days" },
} satisfies ChartConfig;

export default function AreaChartDemo() {
  return <AreaChart title="Site traffic, November" data={traffic} x="date" config={config} compare={{ key: "previous" }} height="md" className="w-full" />;
}
