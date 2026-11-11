"use client";

// Recharts parts of the Chart frame: responsive plot, themed tooltip, axes and grid.

import * as React from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type CartesianGridProps,
  type ReferenceLineProps,
  type TooltipProps,
  type TooltipValueType as ValueType,
  type XAxisProps,
  type YAxisProps,
} from "recharts";
import type { NameType } from "recharts/types/component/DefaultTooltipContent";
import { cn } from "../lib/cn";
import { ChartIndicator, useChart, useOptionalChart } from "./chart-shell";
import { estimateAxisWidth, extent, formatValue, niceCeil, niceStep, resolveChartColor, seriesColor, type ChartColor, type FormatSpec } from "./utils";

export interface ChartFrameProps {
  /** One Recharts chart element (`<RAreaChart data={…}>…</RAreaChart>`). */
  children: React.ReactElement;
  className?: string;
}

/**
 * Sizes a Recharts chart to the Chart body (height from `height` / `aspect` on `<Chart>`), so the
 * first paint never shifts layout. Use it for raw Recharts inside `<Chart>`.
 */
export function ChartFrame({ children, className }: ChartFrameProps) {
  return (
    <div data-slot="chart-frame" className={cn("size-full min-w-0", className)}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tooltip                                                             */
/* ------------------------------------------------------------------ */

interface TooltipEntry {
  dataKey?: unknown;
  name?: unknown;
  value?: unknown;
  type?: string;
  payload?: unknown;
}

export interface ChartTooltipContentProps {
  /** Injected by Recharts. */
  active?: boolean;
  /** Injected by Recharts. */
  payload?: readonly TooltipEntry[];
  /** Injected by Recharts. */
  label?: unknown;
  indicator?: "dot" | "line" | "dashed";
  /** Adds a total row (stacked charts). */
  showTotal?: boolean;
  /** Percent-stacked charts: show each value's share next to it. */
  showShare?: boolean;
  hideLabel?: boolean;
  /** Custom header text. */
  labelFormatter?: (label: unknown, payload: readonly TooltipEntry[]) => React.ReactNode;
  className?: string;
}

/**
 * Tooltip body: opaque `--chart-tooltip` surface (no blur — it re-renders on every pointer move),
 * formatted header, one row per visible series, optional total.
 */
export function ChartTooltipContent({ active, payload, label, indicator, showTotal, showShare, hideLabel, labelFormatter, className }: ChartTooltipContentProps) {
  const chart = useOptionalChart();
  if (!active || !payload?.length || !chart) return null;
  const rows = payload.filter((p) => p.dataKey !== undefined && !chart.isHidden(String(p.dataKey)) && p.type !== "none");
  if (!rows.length) return null;
  const ind = indicator ?? chart.tooltipIndicator;
  const raw = (rows[0]?.payload ?? {}) as Record<string, unknown>;
  const header = hideLabel ? null : labelFormatter ? labelFormatter(label, rows) : chart.formatX(chart.x ? raw[chart.x] : label, true);
  const numeric = (k: string) => {
    const v = Number(raw[k]);
    return Number.isFinite(v) ? v : 0;
  };
  const total = rows.reduce((sum, p) => sum + numeric(String(p.dataKey)), 0);
  return (
    <div data-slot="chart-tooltip" className={cn("vui-chart-tooltip min-w-36 rounded-ui-sm px-2.5 py-2 text-[12px]", className)}>
      {header ? <div className="mb-1.5 font-medium text-fg">{header}</div> : null}
      <div className="grid gap-1">
        {rows.map((p) => {
          const key = String(p.dataKey);
          const s = chart.series.find((x) => x.key === key);
          return (
            <div key={key} className="flex items-center gap-2">
              <ChartIndicator color={seriesColor(key)} variant={ind} pattern={s?.pattern} />
              <span className="me-auto text-fg-muted">{s?.label ?? String(p.name ?? key)}</span>
              <span className="font-mono text-fg tabular">{chart.formatSeries(key, raw[key] ?? p.value)}</span>
              {showShare && total ? <span className="w-11 text-end font-mono text-fg-subtle tabular">{chart.f.percent(numeric(key) / total)}</span> : null}
            </div>
          );
        })}
        {showTotal && rows.length > 1 ? (
          <div className="mt-0.5 flex items-center gap-2 border-t border-line pt-1.5">
            <span className="me-auto text-fg-muted">{chart.t("total")}</span>
            <span className="font-mono font-medium text-fg tabular">{chart.formatSeries(String(rows[0]?.dataKey), total)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type ChartTooltipProps = Omit<TooltipProps<ValueType, NameType>, "content" | "labelFormatter"> & Pick<ChartTooltipContentProps, "indicator" | "showTotal" | "showShare" | "hideLabel" | "labelFormatter">;

/** Recharts Tooltip wired to `ChartTooltipContent` and the themed cursor. */
export function ChartTooltip({ indicator, showTotal, showShare, hideLabel, labelFormatter, cursor, ...props }: ChartTooltipProps) {
  return (
    <Tooltip
      isAnimationActive={false}
      cursor={cursor ?? { stroke: "var(--chart-cursor)", strokeWidth: 1 }}
      content={<ChartTooltipContent indicator={indicator} showTotal={showTotal} showShare={showShare} hideLabel={hideLabel} labelFormatter={labelFormatter} />}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Axes & grid                                                         */
/* ------------------------------------------------------------------ */

const TICK = { fill: "var(--chart-axis)" };

/** Horizontal grid lines in `--chart-grid`. */
export function ChartGrid(props: CartesianGridProps) {
  return <CartesianGrid stroke="var(--chart-grid)" vertical={false} {...props} />;
}

/** Category / time axis: no lines, axis-coloured ticks, density-aware gaps, formatted with `xFormat`. */
export function ChartXAxis({ tickFormatter, ...props }: XAxisProps) {
  const chart = useChart();
  return (
    <XAxis
      dataKey={chart.x}
      tickLine={false}
      axisLine={false}
      tick={TICK}
      tickMargin={8}
      minTickGap={18}
      interval="preserveStartEnd"
      tickFormatter={tickFormatter ?? ((v: unknown) => chart.formatX(v))}
      {...props}
    />
  );
}

/** Value axis with compact ticks ("$1.2M") and a width measured from the longest tick. */
export function ChartYAxis({ format, keys, stacked, tickFormatter, width: widthProp, ...props }: YAxisProps & { format?: FormatSpec; keys?: string[]; stacked?: boolean }) {
  const chart = useChart();
  const axisKeys = keys ?? chart.visibleSeries.map((s) => s.key);
  const width = useValueAxisWidth(axisKeys, { stacked, format });
  const compactFrom = axisCompactFrom(extent(chart.data, axisKeys, stacked));
  const fallback = (v: unknown) => formatValue(chart.f, format ?? chart.yFormat, v, { compact: true, compactFrom });
  return <YAxis niceTicks="snap125" tickLine={false} axisLine={false} tick={TICK} tickMargin={6} width={widthProp ?? width} tickFormatter={tickFormatter ?? fallback} {...props} />;
}

/** A labelled reference line (target, average). Colour is a token. */
export function ChartReferenceLine({ color = "fg-subtle", label, labelPosition = "below", ...props }: Omit<ReferenceLineProps, "label"> & { color?: ChartColor; label?: string; labelPosition?: "above" | "below" }) {
  return (
    <ReferenceLine
      stroke={resolveChartColor(color)}
      strokeDasharray="4 4"
      strokeWidth={1}
      ifOverflow="extendDomain"
      label={label ? { value: label, position: labelPosition === "above" ? "insideBottomRight" : "insideTopRight", fill: resolveChartColor(color === "fg-subtle" ? "fg-muted" : color), fontSize: 11 } : undefined}
      {...props}
    />
  );
}

/** Once the top tick reaches 10K, every tick ≥ 1000 is compact too ("5K" next to "10K", never "5,000"). */
function axisCompactFrom([lo, hi]: [number, number]): number {
  return Math.max(niceCeil(Math.abs(hi)), niceCeil(Math.abs(lo))) >= 10000 ? 1000 : 10000;
}

/** Width for a value axis: estimated from every tick it could draw. */
export function useValueAxisWidth(keys: string[], o: { stacked?: boolean; format?: FormatSpec; percent?: boolean } = {}) {
  const chart = useChart();
  return React.useMemo(() => {
    if (o.percent) return estimateAxisWidth([chart.f.percent(1)]);
    const [min, max] = extent(chart.data, keys, o.stacked);
    const compactFrom = axisCompactFrom([min, max]);
    // Format every tick the axis could draw (snap125 may stop at 800K while niceCeil says 1M).
    const lo = Math.min(0, min);
    const hi = Math.max(0, max);
    const step = niceStep((hi - lo) / 4) || 1;
    const values: number[] = [niceCeil(Math.abs(hi)), lo < 0 ? -niceCeil(-lo) : 0];
    for (let v = Math.floor(lo / step) * step, i = 0; v <= hi + step && i < 24; v += step, i++) values.push(Number(v.toPrecision(12)));
    return estimateAxisWidth(values.map((v) => formatValue(chart.f, o.format ?? chart.yFormat, v, { compact: true, compactFrom })));
  }, [chart.data, chart.f, chart.yFormat, keys, o.stacked, o.format, o.percent]);
}

/** Recharts `onClick` → `onPointClick(row, seriesKey)` from the active tooltip index. */
export function usePointClick(seriesKey?: string) {
  const chart = useChart();
  return React.useMemo(() => {
    if (!chart.onPointClick) return undefined;
    return (state: { activeTooltipIndex?: unknown } | null) => {
      const i = Number(state?.activeTooltipIndex);
      const row = Number.isInteger(i) ? chart.data[i] : undefined;
      if (row) chart.onPointClick?.(row, seriesKey ?? chart.visibleSeries[0]?.key ?? "");
    };
  }, [chart, seriesKey]);
}
