"use client";

// The Chart shell — context, legend, states, data-table alternative. No Recharts import here,
// so SVG/DOM charts (Heatmap) can reuse it without loading the chart library.

import * as React from "react";
import { CircleAlert, Table2, ChartColumnBig } from "lucide-react";
import { cn } from "../lib/cn";
import { useFormat } from "../lib/locale";
import { useLabels, type LabelFn } from "../lib/labels";
import { useControllableState } from "../lib/use-controllable-state";
import { useReducedMotion } from "../lib/use-reduced-motion";
import type { Formatter } from "../format/core";
import { Button } from "../components/button";
import {
  CHART_HEIGHTS,
  formatCategory,
  formatValue,
  patternDash,
  resolveChartColor,
  resolveSeries,
  seriesColor,
  seriesVarName,
  summarizeSeries,
  type ChartConfig,
  type ChartHeight,
  type ChartState,
  type FormatSpec,
  type ResolvedSeries,
} from "./utils";

export const chartLabels = {
  viewTable: "View as table",
  viewChart: "View as chart",
  legend: "Series",
  empty: "No data for this range",
  error: "This chart couldn't load.",
  retry: "Try again",
  loading: "Loading chart…",
  refreshing: "Updating…",
  total: "Total",
  other: "Other",
  otherCount: "Other ({count})",
  share: "Share",
  category: "Category",
  value: "Value",
  range: "{from} – {to}.",
  seriesSummary: "{label}: low {min} ({minAt}), high {max} ({maxAt}), average {avg}.",
};
export type ChartLabels = typeof chartLabels;

export type ChartSkeletonKind = "area" | "line" | "bar" | "bar-horizontal" | "donut" | "grid";

export interface ChartTableColumn {
  key: string;
  label: string;
  format?: FormatSpec;
  /** Row header column (first column). */
  header?: boolean;
}

/** Overrides the generated data table (columns + rows). */
export interface ChartTableSpec {
  columns: ChartTableColumn[];
  rows: Record<string, unknown>[];
}

type Row = Record<string, unknown>;

export interface ChartContextValue {
  config: ChartConfig;
  series: ResolvedSeries[];
  visibleSeries: ResolvedSeries[];
  isHidden: (key: string) => boolean;
  toggleSeries: (key: string) => void;
  data: Row[];
  x?: string;
  xFormat?: FormatSpec;
  yFormat?: FormatSpec;
  /** Full value of a series ("$1,240.00"). */
  formatSeries: (key: string, value: unknown) => string;
  /** Compact value-axis tick ("$1.2K"). */
  formatTick: (value: unknown, spec?: FormatSpec) => string;
  /** x value; `long` for tooltip headers and tables ("Nov 1, 2026"). */
  formatX: (value: unknown, long?: boolean) => string;
  f: Formatter;
  t: LabelFn<ChartLabels>;
  /** `animate` resolved against `prefers-reduced-motion`. */
  animate: boolean;
  tooltipIndicator: "dot" | "line" | "dashed";
  onPointClick?: (row: Row, seriesKey: string) => void;
  height: number | undefined;
  idPrefix: string;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

/** Chart context: config, formatters and hidden series. Use inside `<Chart>`. */
export function useChart(): ChartContextValue {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used inside <Chart>.");
  return ctx;
}

/** Like `useChart`, but `null` outside a Chart. */
export const useOptionalChart = () => React.useContext(ChartContext);

export interface ChartProps<T extends object = Row> extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "children" | "onClick"> {
  data: T[];
  config: ChartConfig;
  /** Category / time key of a row. */
  x?: keyof T & string;
  /** Header of the x column in the data table. Default: the x key, capitalised. */
  xLabel?: string;
  xFormat?: FormatSpec;
  /** Value axis format. Default: the first series' format, compact. */
  yFormat?: FormatSpec;
  /** Plot height: presets sm 160 / md 260 / lg 360 or pixels. Set this or `aspect` (no layout shift). `"auto"` sizes to the content (DOM charts such as Heatmap). */
  height?: ChartHeight | "auto";
  /** Width / height ratio instead of a fixed height. */
  aspect?: number;
  /** Loading / refreshing / empty / error. Default: empty when `data` is empty, else ready. */
  state?: ChartState;
  /** Accessible name and table caption (not shown — put a visible title in the Card header). */
  title: string;
  /** Text alternative. Default: generated from the data (range, low, high, average). */
  summary?: string | ((data: T[]) => string);
  /** Shows a "View as table" switch. The table is always in the page for screen readers. */
  tableToggle?: boolean;
  /** Default `"top"` with 2+ series, `"none"` with one. */
  legend?: "top" | "bottom" | "none";
  tooltipIndicator?: "dot" | "line" | "dashed";
  /** Transitions on data change. Always off under reduced motion. Default `true`. */
  animate?: boolean;
  /** Drill-down. Also makes the rows of the visible data table activatable. */
  onPointClick?: (row: T, seriesKey: string) => void;
  /** Controlled hidden series. */
  hiddenSeries?: string[];
  defaultHiddenSeries?: string[];
  onHiddenSeriesChange?: (keys: string[]) => void;
  labels?: Partial<ChartLabels>;
  /** Replace the generated data table. */
  table?: ChartTableSpec;
  /** Content beside (or under) the plot — e.g. the Donut legend list. */
  aside?: React.ReactNode;
  asidePosition?: "side" | "bottom";
  /** Shape of the loading skeleton. Default `"area"`. */
  skeleton?: ChartSkeletonKind;
  /** Extra controls at the end of the toolbar (range picker…). */
  toolbar?: React.ReactNode;
  /** Plot content: a ready chart's Recharts tree, `<ChartFrame>` with raw Recharts, or any SVG. */
  children?: React.ReactNode;
}

const capitalise = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

/**
 * The shell every chart shares: series → token colours (`--series-<key>`), locale formatting,
 * an interactive legend, loading / refreshing / empty / error states, a generated text summary and
 * a data-table alternative.
 *
 * ```tsx
 * <Chart title="Visits" data={rows} config={{ visits: { label: "Visits" } }} x="date" height="md">
 *   <ChartFrame><RAreaChart data={rows}>…</RAreaChart></ChartFrame>
 * </Chart>
 * ```
 */
export function Chart<T extends object>(props: ChartProps<T>) {
  const {
    data: dataProp,
    config,
    x,
    xLabel,
    xFormat,
    yFormat,
    height,
    aspect,
    state: stateProp,
    title,
    summary,
    tableToggle,
    legend,
    tooltipIndicator = "dot",
    animate = true,
    onPointClick,
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange,
    labels,
    table,
    aside,
    asidePosition = "side",
    skeleton = "area",
    toolbar,
    className,
    style,
    children,
    ...rest
  } = props;
  const data = dataProp as unknown as Row[];
  const f = useFormat();
  const t = useLabels("chart", chartLabels, labels);
  const reduced = useReducedMotion();
  const rawId = React.useId();
  const idPrefix = `vc${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const series = React.useMemo(() => resolveSeries(config), [config]);

  const [hidden, setHidden] = useControllableState<string[]>({
    value: hiddenSeries,
    defaultValue: () => defaultHiddenSeries ?? series.filter((s) => s.hidden).map((s) => s.key),
    onChange: onHiddenSeriesChange,
    name: "Chart",
  });
  const hiddenSet = React.useMemo(() => new Set(hidden), [hidden]);
  const visibleSeries = React.useMemo(() => series.filter((s) => !hiddenSet.has(s.key)), [series, hiddenSet]);
  const toggleSeries = React.useCallback(
    (key: string) =>
      setHidden((prev) => {
        if (prev.includes(key)) return prev.filter((k) => k !== key);
        // at least one series stays visible
        if (series.filter((s) => !prev.includes(s.key)).length <= 1) return prev;
        return [...prev, key];
      }),
    [setHidden, series],
  );

  const status: ChartState = stateProp ?? (data.length === 0 ? { status: "empty" } : { status: "ready" });
  const [showTable, setShowTable] = React.useState(false);

  const seriesFormat = React.useCallback((key: string) => config[key]?.format, [config]);
  const ctx = React.useMemo<ChartContextValue>(
    () => ({
      config,
      series,
      visibleSeries,
      isHidden: (k) => hiddenSet.has(k),
      toggleSeries,
      data,
      x,
      xFormat,
      yFormat: yFormat ?? series[0]?.format,
      formatSeries: (key, v) => formatValue(f, seriesFormat(key), v),
      formatTick: (v, spec) => formatValue(f, spec ?? yFormat ?? series[0]?.format, v, { compact: true }),
      formatX: (v, long) => formatCategory(f, xFormat, v, long),
      f,
      t,
      animate: animate && !reduced,
      tooltipIndicator,
      onPointClick: onPointClick as ChartContextValue["onPointClick"],
      height: height === "auto" ? undefined : typeof height === "string" ? CHART_HEIGHTS[height] : height,
      idPrefix,
    }),
    [config, series, visibleSeries, hiddenSet, toggleSeries, data, x, xFormat, yFormat, f, t, animate, reduced, tooltipIndicator, onPointClick, height, idPrefix, seriesFormat],
  );

  const vars = React.useMemo(() => {
    const out: Record<string, string> = {};
    for (const s of series) out[seriesVarName(s.key)] = resolveChartColor(s.color);
    return out;
  }, [series]);

  const summaryText = React.useMemo(() => {
    if (typeof summary === "function") return summary(dataProp);
    if (typeof summary === "string") return summary;
    return summarizeSeries({ f, rows: data, series: visibleSeries, x, xFormat, templates: { range: t.labels.range, series: t.labels.seriesSummary } });
  }, [summary, dataProp, data, f, visibleSeries, x, xFormat, t]);

  const tableSpec = React.useMemo<ChartTableSpec>(
    () =>
      table ?? {
        columns: [
          ...(x ? [{ key: x, label: xLabel ?? capitalise(x), header: true, format: xFormat }] : []),
          ...series.map((s) => ({ key: s.key, label: s.label, format: s.format })),
        ],
        rows: data,
      },
    [table, x, xLabel, xFormat, series, data],
  );

  const legendPos = legend ?? (series.length > 1 ? "top" : "none");
  const summaryId = `${idPrefix}-summary`;
  const plotHeight = ctx.height;
  const busy = status.status === "loading" || status.status === "refreshing";
  const showToolbar = legendPos === "top" || tableToggle || toolbar;

  let body: React.ReactNode;
  if (status.status === "loading") body = <ChartSkeleton kind={skeleton} label={t("loading")} />;
  else if (status.status === "empty") body = <ChartEmpty message={status.message ?? t("empty")} action={status.action} />;
  else if (status.status === "error") body = <ChartError message={status.message ?? t("error")} onRetry={status.onRetry} retryLabel={t("retry")} />;
  else if (showTable) body = <ChartDataTable caption={title} spec={tableSpec} onRowClick={onPointClick ? (row) => onPointClick(row as T, visibleSeries[0]?.key ?? "") : undefined} className={cn("overflow-auto", height === "auto" ? "max-h-96" : "h-full")} />;
  else
    body = (
      <>
        {status.status === "refreshing" ? <ChartRefreshBar label={t("refreshing")} /> : null}
        <div className={cn("size-full transition-opacity duration-200", status.status === "refreshing" && "opacity-60")}>{children}</div>
      </>
    );

  const plot = (
    <div
      data-slot="chart-body"
      data-state={status.status}
      aria-busy={busy || undefined}
      className={cn("vui-chart-body relative min-w-0", aside && asidePosition === "side" ? "flex-1" : "w-full")}
      style={
        height === "auto"
          ? status.status === "ready" || status.status === "refreshing"
            ? undefined
            : { minHeight: CHART_HEIGHTS.sm }
          : plotHeight !== undefined
            ? { height: plotHeight }
            : aspect
              ? { aspectRatio: String(aspect) }
              : { height: CHART_HEIGHTS.md }
      }
    >
      {body}
    </div>
  );

  return (
    <ChartContext.Provider value={ctx}>
      <figure
        data-slot="chart"
        aria-label={title}
        aria-describedby={summaryText ? summaryId : undefined}
        className={cn("vui-chart m-0 grid min-w-0 gap-3", className)}
        style={{ ...vars, ...style } as React.CSSProperties}
        {...rest}
      >
        {showToolbar ? (
          <div data-slot="chart-toolbar" className="flex min-h-7 flex-wrap items-center justify-between gap-x-4 gap-y-2">
            {legendPos === "top" ? <ChartLegendContent /> : <span />}
            {tableToggle || toolbar ? (
              <div className="flex items-center gap-1.5">
                {toolbar}
                {tableToggle ? (
                  <Button size="xs" variant="ghost" aria-pressed={showTable} onClick={() => setShowTable((v) => !v)} className="text-fg-muted">
                    {showTable ? <ChartColumnBig className="size-3.5" /> : <Table2 className="size-3.5" />}
                    {showTable ? t("viewChart") : t("viewTable")}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        {aside ? (
          <div className={cn("@container")}>
            <div className={cn("flex flex-col gap-5", asidePosition === "side" && "@md:flex-row @md:items-center")}>
              {plot}
              <div data-slot="chart-aside" className={cn("min-w-0", asidePosition === "side" && "@md:w-[min(46%,18rem)]")}>{aside}</div>
            </div>
          </div>
        ) : (
          plot
        )}
        {legendPos === "bottom" ? <ChartLegendContent className="justify-center" /> : null}
        {summaryText ? (
          <p id={summaryId} className="sr-only">
            {summaryText}
          </p>
        ) : null}
        {!showTable && status.status !== "loading" && status.status !== "error" && tableSpec.rows.length ? <ChartDataTable caption={title} spec={tableSpec} className="sr-only" /> : null}
      </figure>
    </ChartContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Legend                                                              */
/* ------------------------------------------------------------------ */

export interface ChartLegendContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Keys to list. Default: every series of the config. */
  keys?: string[];
  /** Click toggles visibility. Default `true`. */
  interactive?: boolean;
  /** Swatch shape. Default: a line for line/area patterns, a dot otherwise. */
  swatch?: "dot" | "line";
}

/** The legend: one toggle per series (`aria-pressed`). At least one series always stays visible. */
export function ChartLegendContent({ keys, interactive = true, swatch, className, ...props }: ChartLegendContentProps) {
  const { series, isHidden, toggleSeries, visibleSeries, t } = useChart();
  const items = keys ? series.filter((s) => keys.includes(s.key)) : series;
  return (
    <div role="group" aria-label={t("legend")} data-slot="chart-legend" className={cn("flex flex-wrap items-center gap-x-1 gap-y-1", className)} {...props}>
      {items.map((s) => {
        const hidden = isHidden(s.key);
        const locked = !hidden && visibleSeries.length <= 1;
        const Icon = s.icon;
        const content = (
          <>
            {Icon ? <Icon className="size-3.5" /> : <LegendSwatch color={seriesColor(s.key)} pattern={s.pattern} shape={swatch ?? (s.pattern !== "solid" ? "line" : "dot")} />}
            <span className={cn(hidden && "line-through decoration-fg-subtle")}>{s.label}</span>
          </>
        );
        if (!interactive)
          return (
            <span key={s.key} className="inline-flex items-center gap-1.5 px-1.5 text-[12.5px] text-fg-muted">
              {content}
            </span>
          );
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={!hidden}
            aria-disabled={locked || undefined}
            onClick={() => toggleSeries(s.key)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-ui-sm px-2 text-[12.5px] text-fg-muted transition-[color,background-color,opacity] focus-ring hover:bg-hover hover:text-fg",
              hidden && "opacity-55",
              locked && "cursor-default hover:bg-transparent",
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

function LegendSwatch({ color, pattern, shape }: { color: string; pattern: ResolvedSeries["pattern"]; shape: "dot" | "line" }) {
  if (shape === "line")
    return (
      <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden className="shrink-0">
        <line x1="1" y1="4" x2="13" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={pattern === "dashed" ? "4 3" : pattern === "dotted" ? "0.5 3" : undefined} />
      </svg>
    );
  return <span aria-hidden className="size-2 shrink-0 rounded-[3px]" style={{ background: color }} />;
}

/** Swatch used by tooltips and lists: `dot`, `line` or `dashed`. */
export function ChartIndicator({ color, variant = "dot", pattern }: { color: string; variant?: "dot" | "line" | "dashed"; pattern?: ResolvedSeries["pattern"] }) {
  if (variant === "line" || variant === "dashed")
    return (
      <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden className="shrink-0">
        <line x1="1" y1="5" x2="11" y2="5" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeDasharray={variant === "dashed" || pattern === "dashed" ? "3 2.5" : pattern === "dotted" ? "0.5 3" : undefined} />
      </svg>
    );
  return <span aria-hidden className="size-2 shrink-0 rounded-[3px]" style={{ background: color }} />;
}

/* ------------------------------------------------------------------ */
/* States                                                              */
/* ------------------------------------------------------------------ */

const BAR_HEIGHTS = [42, 64, 50, 78, 58, 88, 70, 54, 82, 66, 92, 60];

/** Chart-shaped loading placeholder (wave, bars, ring or grid) — never a spinner. */
export function ChartSkeleton({ kind = "area", label, className }: { kind?: ChartSkeletonKind; label?: string; className?: string }) {
  return (
    <div data-slot="chart-skeleton" data-kind={kind} className={cn("vui-chart-skeleton absolute inset-0 flex", className)}>
      {label ? (
        <span role="status" className="sr-only">
          {label}
        </span>
      ) : null}
      {kind === "bar" ? (
        <div aria-hidden className="flex size-full items-end gap-[3%] ps-10 pb-6">
          {BAR_HEIGHTS.map((h, i) => (
            <div key={i} className="ui-shimmer flex-1 rounded-t-[4px] bg-skeleton" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : kind === "bar-horizontal" ? (
        <div aria-hidden className="flex size-full flex-col justify-around gap-2 py-2 ps-20">
          {[92, 76, 64, 50, 38, 26].map((w, i) => (
            <div key={i} className="ui-shimmer h-[9%] min-h-2 rounded-e-[4px] bg-skeleton" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : kind === "donut" ? (
        <div aria-hidden className="grid size-full place-items-center">
          <div className="vui-chart-skeleton-ring ui-shimmer aspect-square h-[82%] max-h-full rounded-full bg-skeleton" />
        </div>
      ) : kind === "grid" ? (
        <div aria-hidden className="vui-chart-skeleton-grid ui-shimmer size-full rounded-ui-sm" />
      ) : (
        <div aria-hidden className="flex size-full flex-col ps-10 pb-6">
          <div className={cn("ui-shimmer mt-auto h-[78%] w-full bg-skeleton", kind === "line" ? "vui-chart-skeleton-line" : "vui-chart-skeleton-wave")} />
        </div>
      )}
    </div>
  );
}

/** Thin indeterminate bar on top of a chart that is refetching (old data stays, dimmed). */
export function ChartRefreshBar({ label, className }: { label?: string; className?: string }) {
  return (
    <div data-slot="chart-refresh" className={cn("absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden rounded-full bg-track", className)}>
      {label ? (
        <span role="status" className="sr-only">
          {label}
        </span>
      ) : null}
      <div aria-hidden className="vui-chart-refresh-bar h-full w-2/5 rounded-full bg-accent-ink" />
    </div>
  );
}

/** Empty state that keeps the chart height: a quiet message and an optional action. */
export function ChartEmpty({ message, action, className }: { message?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div data-slot="chart-empty" className={cn("absolute inset-0 grid place-items-center", className)}>
      <div aria-hidden className="vui-chart-empty-grid absolute inset-0" />
      <div className="relative flex flex-col items-center gap-2.5 px-6 text-center">
        <p className="text-[13px] text-fg-muted">{message}</p>
        {action}
      </div>
    </div>
  );
}

/** Error state: icon, message and a retry action. */
export function ChartError({ message, onRetry, retryLabel = "Try again", className }: { message?: React.ReactNode; onRetry?: () => void; retryLabel?: string; className?: string }) {
  return (
    <div data-slot="chart-error" role="alert" className={cn("absolute inset-0 grid place-items-center", className)}>
      <div className="flex flex-col items-center gap-2.5 px-6 text-center">
        <CircleAlert aria-hidden className="size-5 text-danger" />
        <p className="max-w-xs text-[13px] text-fg-muted">{message}</p>
        {onRetry ? (
          <Button size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data table                                                          */
/* ------------------------------------------------------------------ */

export interface ChartDataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  caption: string;
  spec: ChartTableSpec;
  /** Makes each row header a button (drill-down without a pointer). */
  onRowClick?: (row: Record<string, unknown>) => void;
}

/** The accessible alternative of a chart: same numbers, same formatters, as a real `<table>`. */
export function ChartDataTable({ caption, spec, onRowClick, className, ...props }: ChartDataTableProps) {
  const f = useFormat();
  return (
    <div data-slot="chart-table" className={cn("min-w-0", className)} {...props}>
      <table className="w-full border-collapse text-[13px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {spec.columns.map((c, i) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "sticky top-0 z-[1] border-b border-line bg-[var(--chart-tooltip)] px-3 py-2 text-[12px] font-medium whitespace-nowrap text-fg-muted",
                  i === 0 ? "text-start" : "text-end",
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spec.rows.map((row, ri) => (
            <tr key={ri} className="border-b border-line last:border-b-0">
              {spec.columns.map((c, ci) => {
                const text = c.header ? formatCategory(f, c.format, row[c.key], true) : formatValue(f, c.format, row[c.key]);
                if (ci === 0 || c.header)
                  return (
                    <th key={c.key} scope="row" className="px-3 py-1.5 text-start font-normal whitespace-nowrap text-fg">
                      {onRowClick ? (
                        <button type="button" onClick={() => onRowClick(row)} className="rounded-ui-sm text-start text-accent-ink underline-offset-4 focus-ring hover:underline">
                          {text}
                        </button>
                      ) : (
                        text
                      )}
                    </th>
                  );
                return (
                  <td key={c.key} className="px-3 py-1.5 text-end font-mono text-[12.5px] whitespace-nowrap text-fg tabular">
                    {text}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { patternDash };
