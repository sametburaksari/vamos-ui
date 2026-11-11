"use client";

import * as React from "react";
import { Area, AreaChart as RAreaChart } from "recharts";
import { Chart, useChart, type ChartProps } from "./chart-shell";
import { ChartFrame, ChartGrid, ChartReferenceLine, ChartTooltip, ChartXAxis, ChartYAxis, usePointClick } from "./chart";
import { patternDash, seriesColor, type ChartColor } from "./utils";

export interface ChartReference {
  y: number;
  label?: string;
  color?: ChartColor;
  /** Which side of the line the label sits on. Default `"below"`; use `"above"` to keep it clear of data under the line (control limits). */
  labelPosition?: "above" | "below";
}

export interface AreaChartProps<T extends object> extends Omit<ChartProps<T>, "children"> {
  /** Keys to draw. Default: every config key. */
  series?: string[];
  stack?: "none" | "stacked" | "percent";
  curve?: "monotone" | "linear" | "step";
  /** Gradient (default), flat tint, or no fill (lines only). */
  fill?: "gradient" | "solid" | "none";
  /** Horizontal reference lines (targets, averages). */
  reference?: ChartReference[];
  /** A previous-period series: dashed, unfilled, never stacked. */
  compare?: { key: string };
  /** Hide the value axis (sparkline-like cards). */
  hideYAxis?: boolean;
}

/**
 * Volume or trend over time. One line of code for the common case; colours, formatting, legend,
 * tooltip, states and the table alternative come from the Chart frame.
 *
 * ```tsx
 * <AreaChart title="Visits" data={rows} x="date" config={{ visits: { label: "Visits" } }} height="md" />
 * ```
 */
export function AreaChart<T extends object>({ series, stack = "none", curve = "monotone", fill = "gradient", reference, compare, hideYAxis, ...props }: AreaChartProps<T>) {
  return (
    <Chart skeleton="area" {...props}>
      <AreaPlot series={series} stack={stack} curve={curve} fill={fill} reference={reference} compare={compare} hideYAxis={hideYAxis} />
    </Chart>
  );
}

function AreaPlot({ series: keys, stack, curve, fill, reference, compare, hideYAxis }: Pick<AreaChartProps<object>, "series" | "stack" | "curve" | "fill" | "reference" | "compare" | "hideYAxis">) {
  const chart = useChart();
  const onClick = usePointClick();
  const all = chart.series.filter((s) => (keys ? keys.includes(s.key) : true));
  const visible = all.filter((s) => !chart.isHidden(s.key));
  const stacked = stack !== "none";
  const percent = stack === "percent";
  const single = chart.data.length === 1;
  const type = curve === "step" ? "stepAfter" : curve;
  const stackKeys = visible.filter((s) => s.key !== compare?.key).map((s) => s.key);
  return (
    <ChartFrame>
      <RAreaChart data={chart.data} stackOffset={percent ? "expand" : undefined} margin={{ top: 6, right: 18, bottom: 0, left: 0 }} onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>
        <defs>
          {all.map((s) => (
            <linearGradient key={s.key} id={`${chart.idPrefix}-${s.index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesColor(s.key)} data-top="" stopOpacity={0.45} />
              <stop offset="95%" stopColor={seriesColor(s.key)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <ChartGrid />
        <ChartXAxis />
        <ChartYAxis
          hide={hideYAxis}
          keys={stackKeys}
          stacked={stacked}
          format={percent ? "percent" : undefined}
          tickFormatter={percent ? (v: number) => chart.f.percent(v, { maximumFractionDigits: 0 }) : undefined}
        />
        <ChartTooltip showTotal={stacked && !percent} showShare={percent} indicator={fill === "none" ? "line" : undefined} />
        {reference?.map((r, i) => <ChartReferenceLine key={i} y={r.y} label={r.label} color={r.color} labelPosition={r.labelPosition} />)}
        {all.map((s) => {
          const isCompare = s.key === compare?.key;
          const fillValue = isCompare || fill === "none" ? "transparent" : fill === "solid" ? `color-mix(in oklch, ${seriesColor(s.key)} 22%, transparent)` : `url(#${chart.idPrefix}-${s.index})`;
          return (
            <Area
              key={s.key}
              dataKey={s.key}
              name={s.label}
              type={type}
              hide={chart.isHidden(s.key)}
              stackId={stacked && !isCompare ? "stack" : undefined}
              stroke={seriesColor(s.key)}
              strokeWidth={isCompare ? 1.5 : 2}
              strokeDasharray={isCompare ? "4 4" : patternDash(s.pattern)}
              fill={fillValue}
              fillOpacity={1}
              connectNulls={false}
              dot={single ? { r: 3, fill: seriesColor(s.key), strokeWidth: 0 } : false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-tooltip)", fill: seriesColor(s.key) }}
              isAnimationActive={chart.animate}
              animationDuration={600}
            />
          );
        })}
      </RAreaChart>
    </ChartFrame>
  );
}
