import { AreaChart, type ChartConfig } from "@vamos-ui/react/charts";

const traffic = Array.from({ length: 30 }, (_, i) => {
  const base = 820 + Math.sin(i / 3.2) * 180 + i * 14;
  return {
    date: `2026-11-${String(i + 1).padStart(2, "0")}`,
    visits: Math.round(base + ((i * 37) % 90)),
    reads: Math.round(base * 0.58 + ((i * 53) % 70)),
  };
});

const config = {
  visits: { label: "Visits" },
  reads: { label: "Full reads" },
} satisfies ChartConfig;

export default function AreaChartDemo() {
  return <AreaChart title="Traffic, November" data={traffic} x="date" config={config} compare={{ key: "reads" }} height="md" tableToggle className="w-full" />;
}
