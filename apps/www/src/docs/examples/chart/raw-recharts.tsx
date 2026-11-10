"use client";

import { Area, AreaChart as RAreaChart, Line } from "recharts";
import { Chart, ChartFrame, ChartGrid, ChartReferenceLine, ChartTooltip, ChartXAxis, ChartYAxis, seriesColor, type ChartConfig } from "@vamos-cms/ui/charts";

const latency = [
  { hour: "00:00", p50: 112, p95: 284 },
  { hour: "04:00", p50: 98, p95: 241 },
  { hour: "08:00", p50: 141, p95: 362 },
  { hour: "12:00", p50: 168, p95: 418 },
  { hour: "16:00", p50: 152, p95: 391 },
  { hour: "20:00", p50: 126, p95: 305 },
];

const config = {
  p95: { label: "p95", format: (v) => `${v} ms` },
  p50: { label: "p50", format: (v) => `${v} ms` },
} satisfies ChartConfig;

// Raw mode: any Recharts tree inside <Chart> + <ChartFrame>. You still get colours, formatters,
// the legend, states and the table alternative.
export default function ChartRawRecharts() {
  return (
    <Chart title="API latency" data={latency} config={config} x="hour" height="md" className="w-full">
      <ChartFrame>
        <RAreaChart data={latency} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <ChartGrid />
          <ChartXAxis />
          <ChartYAxis />
          <ChartTooltip indicator="line" />
          <ChartReferenceLine y={350} label="SLO 350 ms" color="danger" />
          <Area dataKey="p95" type="monotone" stroke={seriesColor("p95")} fill={`color-mix(in oklch, ${seriesColor("p95")} 14%, transparent)`} strokeWidth={1.5} />
          <Line dataKey="p50" type="monotone" stroke={seriesColor("p50")} strokeWidth={2} dot={false} />
        </RAreaChart>
      </ChartFrame>
    </Chart>
  );
}
