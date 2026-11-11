"use client";

import * as React from "react";
import { Bar, BarChart as RBarChart, Cell, LabelList, ReferenceLine } from "recharts";
import { Chart, useChart, type ChartProps } from "./chart-shell";
import { ChartFrame, ChartGrid, ChartReferenceLine, ChartTooltip, ChartXAxis, ChartYAxis, useValueAxisWidth } from "./chart";
import type { ChartReference } from "./area-chart";
import { estimateAxisWidth, extent, formatValue, seriesColor } from "./utils";

export interface BarChartProps<T extends object> extends Omit<ChartProps<T>, "children"> {
  /** Keys to draw. Default: every config key. */
  series?: string[];
  /** `vertical` = columns (default), `horizontal` = rows growing from inline-start (rankings). */
  layout?: "vertical" | "horizontal";
  stack?: "none" | "stacked" | "percent";
  /** Corner radius in px. Stacked bars round the outer segment only. Default 4. */
  radius?: number;
  /** Rows for which this returns true keep full colour; the rest are dimmed. */
  highlight?: (row: T) => boolean;
  /** Values printed on the bars. */
  valueLabels?: boolean;
  barSize?: "auto" | number;
  reference?: ChartReference[];
}

/**
 * Category comparison: grouped, stacked or 100% stacked; columns or ranked rows. Negative values get
 * a prominent zero line.
 *
 * ```tsx
 * <BarChart title="Won deals by rep" data={reps} x="rep" layout="horizontal" config={{ won: { label: "Won", format: "currency" } }} />
 * ```
 */
export function BarChart<T extends object>({ series, layout = "vertical", stack = "none", radius = 4, highlight, valueLabels, barSize = "auto", reference, ...props }: BarChartProps<T>) {
  return (
    <Chart skeleton={layout === "horizontal" ? "bar-horizontal" : "bar"} {...props}>
      <BarPlot series={series} layout={layout} stack={stack} radius={radius} highlight={highlight as BarPlotProps["highlight"]} valueLabels={valueLabels} barSize={barSize} reference={reference} />
    </Chart>
  );
}

type BarPlotProps = Pick<BarChartProps<Record<string, unknown>>, "series" | "layout" | "stack" | "radius" | "highlight" | "valueLabels" | "barSize" | "reference">;

function BarPlot({ series: keys, layout, stack, radius = 4, highlight, valueLabels, barSize, reference }: BarPlotProps) {
  const chart = useChart();
  const all = chart.series.filter((s) => (keys ? keys.includes(s.key) : true));
  const visible = all.filter((s) => !chart.isHidden(s.key));
  const stacked = stack !== "none";
  const percent = stack === "percent";
  const horizontal = layout === "horizontal";
  const [min] = extent(chart.data, visible.map((s) => s.key), stacked);
  const valueWidth = useValueAxisWidth(visible.map((s) => s.key), { stacked, percent });
  const categoryWidth = React.useMemo(
    () => (horizontal && chart.x ? Math.min(160, estimateAxisWidth(chart.data.map((r) => chart.formatX(r[chart.x!])), 12)) : 0),
    [horizontal, chart],
  );

  if (process.env.NODE_ENV !== "production" && chart.data.length > 20 && !horizontal) {
    console.warn("[vamos-ui] BarChart: more than 20 categories — use layout=\"horizontal\" or group the tail into \"Other\".");
  }

  const lastKey = visible[visible.length - 1]?.key;
  const r = (key: string): [number, number, number, number] => {
    if (stacked && key !== lastKey) return [0, 0, 0, 0];
    return horizontal ? [0, radius, radius, 0] : [radius, radius, 0, 0];
  };
  const tickPercent = (v: number) => chart.f.percent(v, { maximumFractionDigits: 0 });

  return (
    <ChartFrame>
      <RBarChart
        data={chart.data}
        layout={horizontal ? "vertical" : "horizontal"}
        stackOffset={percent ? "expand" : min < 0 && stacked ? "sign" : undefined}
        margin={{ top: valueLabels && !horizontal ? 18 : 6, right: valueLabels && horizontal ? 48 : 8, bottom: 0, left: 0 }}
        barCategoryGap={horizontal ? "22%" : "28%"}
        barGap={3}
      >
        <ChartGrid vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <ChartXAxis type="number" niceTicks="snap125" dataKey={undefined} tickFormatter={percent ? tickPercent : (v: unknown) => chart.formatTick(v)} minTickGap={24} />
            <ChartYAxis type="category" dataKey={chart.x} width={categoryWidth} tickFormatter={(v: unknown) => chart.formatX(v)} interval={0} />
          </>
        ) : (
          <>
            <ChartXAxis />
            <ChartYAxis width={valueWidth} tickFormatter={percent ? tickPercent : undefined} />
          </>
        )}
        <ChartTooltip cursor={{ fill: "var(--hover)" }} showTotal={stacked && !percent} showShare={percent} />
        {min < 0 ? (horizontal ? <ReferenceLine x={0} stroke="var(--fg-subtle)" strokeWidth={1} /> : <ReferenceLine y={0} stroke="var(--fg-subtle)" strokeWidth={1} />) : null}
        {reference?.map((ref, i) => (horizontal ? <ChartReferenceLine key={i} x={ref.y} label={ref.label} color={ref.color} /> : <ChartReferenceLine key={i} y={ref.y} label={ref.label} color={ref.color} labelPosition={ref.labelPosition} />))}
        {all.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            hide={chart.isHidden(s.key)}
            stackId={stacked ? "stack" : undefined}
            fill={seriesColor(s.key)}
            radius={r(s.key)}
            barSize={barSize === "auto" ? undefined : barSize}
            maxBarSize={horizontal ? 22 : 44}
            isAnimationActive={chart.animate}
            animationDuration={500}
            onClick={chart.onPointClick ? (_: unknown, index: number) => chart.data[index] && chart.onPointClick?.(chart.data[index]!, s.key) : undefined}
            style={chart.onPointClick ? { cursor: "pointer" } : undefined}
          >
            {highlight
              ? chart.data.map((row, i) => (
                  <Cell key={i} fill={highlight(row) ? seriesColor(s.key) : `color-mix(in oklch, ${seriesColor(s.key)} 35%, transparent)`} />
                ))
              : null}
            {valueLabels && (!stacked || s.key === lastKey) ? (
              <LabelList
                dataKey={s.key}
                position={horizontal ? "right" : "top"}
                offset={6}
                className="vui-chart-value-label"
                formatter={(v: unknown) => formatValue(chart.f, chart.config[s.key]?.format, v, { compact: true })}
              />
            ) : null}
          </Bar>
        ))}
      </RBarChart>
    </ChartFrame>
  );
}
