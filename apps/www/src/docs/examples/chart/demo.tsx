import { AreaChart, type ChartConfig } from "@vamos-cms/ui/charts";

// 30 days of site traffic; dates are plain "YYYY-MM-DD" strings.
const traffic = Array.from({ length: 30 }, (_, i) => {
  const base = 1180 + Math.sin(i / 3.1) * 210 + i * 16;
  return {
    date: `2026-10-${String(i + 1).padStart(2, "0")}`,
    visits: Math.round(base + ((i * 37) % 95)),
    reads: Math.round(base * 0.56 + ((i * 53) % 70)),
  };
});

const config = {
  visits: { label: "Visits" },
  reads: { label: "Full reads" },
} satisfies ChartConfig;

export default function ChartDemo() {
  return <AreaChart title="Traffic, October" data={traffic} x="date" config={config} height="md" className="w-full" />;
}
