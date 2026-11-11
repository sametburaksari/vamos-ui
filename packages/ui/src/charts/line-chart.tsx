"use client";

import * as React from "react";
import { Line, LineChart as RLineChart } from "recharts";
import { Chart, useChart, type ChartProps } from "./chart-shell";
import { ChartFrame, ChartGrid, ChartReferenceLine, ChartTooltip, ChartXAxis, ChartYAxis, usePointClick } from "./chart";
import type { ChartReference } from "./area-chart";
import { patternDash, seriesColor } from "./utils";

export interface LineChartProps<T extends object> extends Omit<ChartProps<T>, "children"> {
  series?: string[];
  curve?: "monotone" | "linear" | "step";
  /** Point markers. Default `"last"` (the latest value stands out). */
  dots?: "none" | "last" | "all";
  reference?: ChartReference[];
  /** Series names written at the end of each line instead of a legend (≤ 4 series). */
  endLabels?: boolean;
}

/**
 * Multi-series trends and rates. With 3+ series prefer `endLabels` — direct labels do not rely on
 * colour.
 *
 * ```tsx
 * <LineChart title="Win rate by rep" data={rows} x="month" config={{ ada: { label: "Ada", format: "percent" } }} endLabels />
 * ```
 */
export function LineChart<T extends object>({ series, curve = "monotone", dots = "last", reference, endLabels, legend, ...props }: LineChartProps<T>) {
  return (
    <Chart skeleton="line" legend={legend ?? (endLabels ? "none" : undefined)} {...props}>
      <LinePlot series={series} curve={curve} dots={dots} reference={reference} endLabels={endLabels} />
    </Chart>
  );
}

function LinePlot({ series: keys, curve, dots, reference, endLabels }: Pick<LineChartProps<object>, "series" | "curve" | "dots" | "reference" | "endLabels">) {
  const chart = useChart();
  const onClick = usePointClick();
  const all = chart.series.filter((s) => (keys ? keys.includes(s.key) : true));
  const lastIndex = chart.data.length - 1;
  const type = curve === "step" ? "stepAfter" : curve;

  if (process.env.NODE_ENV !== "production" && all.length > 6) {
    console.warn("[vamos-ui] LineChart: more than 6 series — group the tail into \"Other\" or use small multiples.");
  }

  const labelRoom = endLabels ? Math.min(140, Math.max(...all.map((s) => s.label.length), 0) * 7 + 14) : 18;

  return (
    <ChartFrame>
      <RLineChart data={chart.data} margin={{ top: 8, right: labelRoom, bottom: 0, left: 0 }} onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>
        <ChartGrid />
        <ChartXAxis />
        <ChartYAxis keys={all.map((s) => s.key)} />
        <ChartTooltip indicator="line" />
        {reference?.map((r, i) => <ChartReferenceLine key={i} y={r.y} label={r.label} color={r.color} labelPosition={r.labelPosition} />)}
        {all.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            name={s.label}
            type={type}
            hide={chart.isHidden(s.key)}
            stroke={seriesColor(s.key)}
            strokeWidth={2}
            strokeDasharray={patternDash(s.pattern)}
            connectNulls={false}
            dot={(p: { index?: number; cx?: number; cy?: number }) => {
              const show = dots === "all" || (dots === "last" && p.index === lastIndex) || chart.data.length === 1;
              if (!show || p.cx === undefined || p.cy === undefined) return <g key={`${s.key}-${p.index}`} />;
              return <circle key={`${s.key}-${p.index}`} cx={p.cx} cy={p.cy} r={3} fill={seriesColor(s.key)} stroke="var(--chart-tooltip)" strokeWidth={1.5} />;
            }}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-tooltip)", fill: seriesColor(s.key) }}
            label={
              endLabels
                ? (p: { index?: number; x?: number | string; y?: number | string }) =>
                    p.index === lastIndex ? (
                      <text key={`${s.key}-label`} x={Number(p.x) + 8} y={Number(p.y)} dy="0.32em" className="vui-chart-end-label" fill={seriesColor(s.key)}>
                        {s.label}
                      </text>
                    ) : (
                      <g key={`${s.key}-l-${p.index}`} />
                    )
                : undefined
            }
            isAnimationActive={chart.animate}
            animationDuration={600}
          />
        ))}
      </RLineChart>
    </ChartFrame>
  );
}
