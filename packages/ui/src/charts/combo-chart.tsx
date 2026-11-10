"use client";

import * as React from "react";
import { Area, Bar, ComposedChart, Line } from "recharts";
import { useLocale } from "../lib/locale";
import { Chart, useChart, type ChartProps } from "./chart-shell";
import { ChartFrame, ChartGrid, ChartTooltip, ChartXAxis, ChartYAxis, useValueAxisWidth } from "./chart";
import { alignZeroDomains, extent, patternDash, seriesColor, type FormatSpec } from "./utils";

export interface ComboChartProps<T extends object> extends Omit<ChartProps<T>, "children"> {
  /** Keys drawn as bars (default axis: start). */
  bars: string[];
  /** Keys drawn as lines (default axis: end). */
  lines: string[];
  /** Keys drawn as filled areas behind the bars. */
  areas?: string[];
  /** Format of the end axis. Default: the first end-axis series' format. */
  endAxisFormat?: FormatSpec;
  /** Show the end axis. Hidden: values still appear in the tooltip and table. Default `true`. */
  endAxis?: boolean;
  /** Stack the bars. */
  stackBars?: boolean;
  /** Axis titles (label + unit) — recommended, two value scales need naming. */
  startAxisLabel?: string;
  endAxisLabel?: string;
}

/**
 * Volume and rate on two axes — bars on the start axis, a line on the end axis, zero lines aligned
 * so neither scale exaggerates. Axis sides are logical and swap in RTL.
 *
 * ```tsx
 * <ComboChart title="Quotes and win rate" data={rows} x="month" bars={["quotes"]} lines={["winRate"]} config={config} />
 * ```
 */
export function ComboChart<T extends object>({ bars, lines, areas = [], endAxisFormat, endAxis = true, stackBars, startAxisLabel, endAxisLabel, ...props }: ComboChartProps<T>) {
  return (
    <Chart skeleton="bar" {...props}>
      <ComboPlot bars={bars} lines={lines} areas={areas} endAxisFormat={endAxisFormat} endAxis={endAxis} stackBars={stackBars} startAxisLabel={startAxisLabel} endAxisLabel={endAxisLabel} />
    </Chart>
  );
}

function ComboPlot({ bars, lines, areas = [], endAxisFormat, endAxis, stackBars, startAxisLabel, endAxisLabel }: Omit<ComboChartProps<object>, keyof ChartProps<object>>) {
  const chart = useChart();
  const rtl = useLocale().dir === "rtl";
  const axisOf = (key: string, fallback: "start" | "end") => chart.config[key]?.axis ?? fallback;
  const visible = (k: string) => !chart.isHidden(k);
  const startKeys = [...bars.filter((k) => axisOf(k, "start") === "start"), ...lines.filter((k) => axisOf(k, "end") === "start"), ...areas.filter((k) => axisOf(k, "start") === "start")].filter(visible);
  const endKeys = [...bars.filter((k) => axisOf(k, "start") === "end"), ...lines.filter((k) => axisOf(k, "end") === "end"), ...areas.filter((k) => axisOf(k, "start") === "end")].filter(visible);
  const startStacked = Boolean(stackBars);
  const endFormat = endAxisFormat ?? chart.config[endKeys[0] ?? ""]?.format;
  const startFormat = chart.config[startKeys[0] ?? ""]?.format ?? chart.yFormat;

  const [startDomain, endDomain] = React.useMemo(() => {
    const a = extent(chart.data, startKeys, startStacked);
    const b = extent(chart.data, endKeys);
    return alignZeroDomains(a, b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart.data, startKeys.join(), endKeys.join(), startStacked]);

  // Non-negative data: four equal steps on both axes, so the grid lines serve both scales.
  const ticksOf = (d: [number, number]) => (d[0] === 0 ? [0, 1, 2, 3, 4].map((i) => Number(((d[1] * i) / 4).toPrecision(12))) : undefined);
  const startWidth = useValueAxisWidth(startKeys, { stacked: startStacked, format: startFormat });
  const endWidth = useValueAxisWidth(endKeys, { format: endFormat });
  const left = rtl ? "end" : "start";

  const yId = (key: string, fallback: "start" | "end") => axisOf(key, fallback);
  const titleProps = (value?: string, side?: "left" | "right") =>
    value ? { value, angle: -90, position: side === "left" ? ("insideLeft" as const) : ("insideRight" as const), className: "vui-chart-axis-title", offset: 0, style: { textAnchor: "middle" as const } } : undefined;

  return (
    <ChartFrame>
      <ComposedChart data={chart.data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }} barCategoryGap="30%">
        <ChartGrid yAxisId="start" />
        <ChartXAxis />
        <ChartYAxis
          yAxisId="start"
          orientation={left === "start" ? "left" : "right"}
          domain={startDomain}
          ticks={ticksOf(startDomain)}
          width={startWidth + (startAxisLabel ? 16 : 0)}
          tickFormatter={(v: unknown) => chart.formatTick(v, startFormat)}
          label={titleProps(startAxisLabel, left === "start" ? "left" : "right")}
          keys={startKeys}
        />
        <ChartYAxis
          yAxisId="end"
          orientation={left === "start" ? "right" : "left"}
          domain={endDomain}
          ticks={ticksOf(endDomain)}
          hide={!endAxis || endKeys.length === 0}
          width={endWidth + (endAxisLabel ? 16 : 0)}
          tickFormatter={(v: unknown) => chart.formatTick(v, endFormat)}
          label={titleProps(endAxisLabel, left === "start" ? "right" : "left")}
          keys={endKeys}
        />
        <ChartTooltip cursor={{ fill: "var(--hover)" }} />
        {areas.map((key) => (
          <Area
            key={key}
            yAxisId={yId(key, "start")}
            dataKey={key}
            name={chart.config[key]?.label}
            hide={chart.isHidden(key)}
            type="monotone"
            stroke={seriesColor(key)}
            strokeWidth={1.5}
            fill={`color-mix(in oklch, ${seriesColor(key)} 16%, transparent)`}
            isAnimationActive={chart.animate}
          />
        ))}
        {bars.map((key, i) => (
          <Bar
            key={key}
            yAxisId={yId(key, "start")}
            dataKey={key}
            name={chart.config[key]?.label}
            hide={chart.isHidden(key)}
            stackId={stackBars ? "bars" : undefined}
            fill={seriesColor(key)}
            radius={stackBars && i < bars.length - 1 ? 0 : [4, 4, 0, 0]}
            maxBarSize={40}
            isAnimationActive={chart.animate}
          />
        ))}
        {lines.map((key) => {
          const s = chart.series.find((x) => x.key === key);
          return (
            <Line
              key={key}
              yAxisId={yId(key, "end")}
              dataKey={key}
              name={s?.label}
              hide={chart.isHidden(key)}
              type="monotone"
              stroke={seriesColor(key)}
              strokeWidth={2}
              strokeDasharray={patternDash(s?.pattern)}
              dot={{ r: 2.5, fill: seriesColor(key), stroke: "var(--chart-tooltip)", strokeWidth: 1.5 }}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-tooltip)", fill: seriesColor(key) }}
              isAnimationActive={chart.animate}
            />
          );
        })}
      </ComposedChart>
    </ChartFrame>
  );
}
