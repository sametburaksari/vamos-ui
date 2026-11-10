"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useFormat, useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { Chart, type ChartLabels, type ChartTableSpec } from "./chart-shell";
import { formatValue, quantileBreaks, resolveChartColor, type ChartColor, type ChartState, type FormatSpec } from "./utils";

export const heatmapLabels = {
  less: "Less",
  more: "More",
  cell: "{label}: {value}",
  noData: "no data",
  date: "Date",
  value: "Value",
  calendarSummary: "{from} – {to}. {total} in total; busiest day {maxAt} with {max}.",
  matrixSummary: "Highest: {maxAt} with {max}. Lowest: {minAt} with {min}.",
};
export type HeatmapLabels = typeof heatmapLabels;

export interface HeatmapCell {
  /** Calendar: `"YYYY-MM-DD"` (or a Date). Matrix: the column label. */
  x: string | Date;
  /** Matrix: the row label. */
  y?: string;
  value: number | null;
  /** Categorical scale: the category value of this cell. */
  category?: string;
  meta?: unknown;
}

export interface HeatmapCategory {
  value: string;
  label: string;
  color: ChartColor;
}

export interface HeatmapProps extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "onClick"> {
  /** `calendar`: weeks × weekdays (activity, attendance). `matrix`: rows × columns (weekday × hour). */
  mode: "calendar" | "matrix";
  data: HeatmapCell[];
  /** Calendar range. Default: first to last date in `data`. */
  range?: { from: string | Date; to: string | Date };
  /** Matrix column order. Default: order of appearance. */
  xLabels?: string[];
  /** Matrix row order. Default: order of appearance. */
  yLabels?: string[];
  scale?: "sequential" | "diverging" | "categorical";
  categories?: HeatmapCategory[];
  /** Colour steps. Default 5. */
  steps?: 4 | 5 | 7;
  /** Linear breaks between these values. Default: quantile breaks (equal-count buckets). */
  domain?: [number, number];
  /** Base colour (sequential). Default `chart-1` — follows the accent. */
  color?: ChartColor;
  format?: FormatSpec;
  /** Name of the measured thing, for table header and cell labels ("Posts"). */
  valueLabel?: string;
  tooltip?: (cell: HeatmapCell) => React.ReactNode;
  onCellClick?: (cell: HeatmapCell) => void;
  /** `auto` fills the width; a number fixes the cell size in px (scrolls when wider). */
  cellSize?: "auto" | number;
  /** Accessible name of the grid and the table caption. */
  title: string;
  /** Override the week start (0 = Sunday … 6 = Saturday). Default: from the locale. */
  weekStart?: number;
  /** Ring this day (`YYYY-MM-DD`). Default: today in the provider's time zone (set after mount). */
  today?: string | null;
  showLegend?: boolean;
  tableToggle?: boolean;
  state?: ChartState;
  summary?: string;
  labels?: Partial<HeatmapLabels & ChartLabels>;
}

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");
const toDay = (v: string | Date): number => {
  if (v instanceof Date) return Math.floor(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()) / DAY);
  const [y, m, d] = v.split("-").map(Number);
  return Math.floor(Date.UTC(y!, (m ?? 1) - 1, d ?? 1) / DAY);
};
const fromDay = (n: number) => {
  const d = new Date(n * DAY);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};
const weekdayOf = (n: number) => new Date(n * DAY).getUTCDay();

const SUNDAY_START = new Set(["US", "CA", "MX", "BR", "JP", "IL", "KR", "TW", "PH", "IN", "ZA", "SA", "AU"]);

/** First day of the week for a locale: 0 = Sunday … 6 = Saturday. */
export function weekStartOf(locale: string): number {
  try {
    const l = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const info = l.getWeekInfo?.() ?? l.weekInfo;
    if (info?.firstDay) return info.firstDay % 7;
    const region = l.maximize().region;
    if (region) return SUNDAY_START.has(region) ? 0 : 1;
  } catch {
    /* fall through */
  }
  return 1;
}

interface GridCell {
  key: string;
  row: number;
  col: number;
  cell: HeatmapCell | null;
  /** Calendar day number (calendar mode). */
  day?: number;
  label: string;
  placeholder?: boolean;
}

/**
 * Density patterns as a grid of tinted cells: a **calendar** (weeks × weekdays, like a contribution
 * graph) or a **matrix** (weekday × hour, channel × week). Plain DOM — no chart library. An ARIA grid
 * with arrow keys, Home / End and PageUp / PageDown, plus a data-table alternative.
 *
 * ```tsx
 * <Heatmap mode="calendar" title="Posts published" data={days} valueLabel="Posts" />
 * ```
 */
export function Heatmap({
  mode,
  data,
  range,
  xLabels: xLabelsProp,
  yLabels: yLabelsProp,
  scale = "sequential",
  categories,
  steps = 5,
  domain,
  color = "chart-1",
  format = "integer",
  valueLabel,
  tooltip,
  onCellClick,
  cellSize = "auto",
  title,
  weekStart: weekStartProp,
  today: todayProp,
  showLegend = true,
  tableToggle,
  state,
  summary,
  labels,
  className,
  ...props
}: HeatmapProps) {
  const f = useFormat();
  const { locale, dir } = useLocale();
  const t = useLabels("heatmap", heatmapLabels, labels as Partial<HeatmapLabels>);
  const weekStart = weekStartProp ?? weekStartOf(locale);

  const [today, setToday] = React.useState<string | null>(todayProp ?? null);
  React.useEffect(() => {
    if (todayProp !== undefined) return setToday(todayProp);
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: f.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    setToday(parts);
  }, [todayProp, f.timeZone]);

  /* ----- layout ----- */
  const layout = React.useMemo(() => {
    if (mode === "calendar") {
      const byDay = new Map<number, HeatmapCell>();
      for (const c of data) byDay.set(toDay(c.x), c);
      const days = [...byDay.keys()];
      const from = range ? toDay(range.from) : days.length ? Math.min(...days) : toDay(new Date());
      const to = range ? toDay(range.to) : days.length ? Math.max(...days) : from;
      const gridStart = from - ((weekdayOf(from) - weekStart + 7) % 7);
      const cols = Math.floor((to - gridStart) / 7) + 1;
      const rows: GridCell[][] = Array.from({ length: 7 }, () => []);
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < 7; row++) {
          const day = gridStart + col * 7 + row;
          const iso = fromDay(day);
          const inRange = day >= from && day <= to;
          rows[row]!.push({
            key: iso,
            row,
            col,
            day,
            cell: inRange ? (byDay.get(day) ?? { x: iso, value: null }) : null,
            label: f.date(iso, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
            placeholder: !inRange,
          });
        }
      }
      const weekdays = Array.from({ length: 7 }, (_, row) => {
        const day = gridStart + row;
        return { short: f.date(fromDay(day), { weekday: "short" }), long: f.date(fromDay(day), { weekday: "long" }) };
      });
      const months: { col: number; label: string }[] = [];
      let lastMonth = -1;
      for (let col = 0; col < cols; col++) {
        const day = Math.max(from, gridStart + col * 7);
        const m = new Date(day * DAY).getUTCMonth();
        if (m !== lastMonth && (col === 0 || new Date((gridStart + col * 7) * DAY).getUTCDate() <= 7)) {
          months.push({ col, label: f.date(fromDay(day), { month: "short" }) });
          lastMonth = m;
        }
      }
      return { rows, cols, rowLabels: weekdays, colLabels: null as string[] | null, months: months as { col: number; label: string }[], from, to };
    }
    const xs = xLabelsProp ?? [...new Set(data.map((c) => String(c.x)))];
    const ys = yLabelsProp ?? [...new Set(data.map((c) => c.y ?? ""))];
    const lookup = new Map(data.map((c) => [`${c.y ?? ""}|${String(c.x)}`, c]));
    const rows: GridCell[][] = ys.map((y, row) =>
      xs.map((x, col) => ({ key: `${y}|${x}`, row, col, cell: lookup.get(`${y}|${x}`) ?? { x, y, value: null }, label: `${y}, ${x}` })),
    );
    return { rows, cols: xs.length, rowLabels: ys.map((y) => ({ short: y, long: y })), colLabels: xs, months: [], from: 0, to: 0 };
  }, [mode, data, range, weekStart, xLabelsProp, yLabelsProp, f]);

  /* ----- scale ----- */
  const values = React.useMemo(() => data.map((c) => c.value).filter((v): v is number => typeof v === "number" && Number.isFinite(v)), [data]);
  const bucketOf = React.useMemo(() => {
    if (scale === "diverging") {
      const m = domain ? Math.max(Math.abs(domain[0]), Math.abs(domain[1])) : Math.max(0, ...values.map(Math.abs)) || 1;
      const mid = (steps - 1) / 2;
      return (v: number) => Math.max(0, Math.min(steps - 1, Math.round(mid + (v / m) * mid)));
    }
    if (domain) {
      const [lo, hi] = domain;
      return (v: number) => (v <= lo ? 0 : Math.max(1, Math.min(steps - 1, Math.ceil(((v - lo) / (hi - lo || 1)) * (steps - 1)))));
    }
    const breaks = quantileBreaks(values, steps);
    return (v: number) => {
      if (v <= 0) return 0;
      let b = 1;
      for (const br of breaks) if (v > br) b++;
      return Math.min(steps - 1, b);
    };
  }, [scale, domain, values, steps]);

  const stepColor = React.useCallback(
    (i: number) => {
      if (scale === "diverging") {
        const mid = (steps - 1) / 2;
        if (i === mid) return "var(--track)";
        const tone = i < mid ? "var(--danger)" : "var(--success)";
        const p = 18 + (Math.abs(i - mid) / mid) * 72;
        return `color-mix(in oklch, ${tone} ${p}%, var(--surface-solid, var(--surface)))`;
      }
      if (steps === 5 && color === "chart-1") return `var(--chart-seq-${i})`;
      const p = 10 + (i / (steps - 1)) * 90;
      return `color-mix(in oklch, ${resolveChartColor(color)} ${p}%, var(--surface-solid, var(--surface)))`;
    },
    [scale, steps, color],
  );
  const catMap = React.useMemo(() => new Map((categories ?? []).map((c) => [c.value, c])), [categories]);

  const fillOf = (c: HeatmapCell | null): { bg?: string; step?: number } => {
    if (!c) return {};
    if (scale === "categorical") {
      const cat = c.category ? catMap.get(c.category) : undefined;
      return cat ? { bg: resolveChartColor(cat.color) } : {};
    }
    if (c.value === null) return {};
    const step = bucketOf(c.value);
    return { bg: stepColor(step), step };
  };

  const valueText = (c: HeatmapCell | null) => {
    if (!c) return "";
    if (scale === "categorical") return c.category ? (catMap.get(c.category)?.label ?? c.category) : t("noData");
    if (c.value === null) return t("noData");
    const v = formatValue(f, format, c.value);
    return valueLabel ? `${v} ${valueLabel.toLocaleLowerCase(locale)}` : v;
  };

  /* ----- keyboard ----- */
  const focusable = React.useMemo(() => layout.rows.flat().filter((g) => !g.placeholder), [layout]);
  const [active, setActive] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const activeKey = active ?? focusable[focusable.length - 1]?.key ?? null;
  const gridRef = React.useRef<HTMLDivElement>(null);
  const byKey = React.useMemo(() => new Map(focusable.map((g) => [g.key, g])), [focusable]);

  const focusKey = (key: string | undefined) => {
    if (!key || !byKey.has(key)) return;
    setActive(key);
    gridRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, g: GridCell) => {
    const rtl = dir === "rtl";
    const h = rtl ? -1 : 1;
    let next: string | undefined;
    if (mode === "calendar" && g.day !== undefined) {
      const go = (d: number) => {
        const clamped = Math.max(layout.from, Math.min(layout.to, d));
        return fromDay(clamped);
      };
      const rowCells = layout.rows[g.row]!.filter((c) => !c.placeholder);
      switch (e.key) {
        case "ArrowUp": next = go(g.day - 1); break;
        case "ArrowDown": next = go(g.day + 1); break;
        case "ArrowLeft": next = go(g.day - 7 * h); break;
        case "ArrowRight": next = go(g.day + 7 * h); break;
        case "Home": next = rowCells[0]?.key; break;
        case "End": next = rowCells[rowCells.length - 1]?.key; break;
        case "PageUp": next = go(g.day - 28); break;
        case "PageDown": next = go(g.day + 28); break;
      }
    } else {
      const at = (r: number, c: number) => layout.rows[Math.max(0, Math.min(layout.rows.length - 1, r))]?.[Math.max(0, Math.min(layout.cols - 1, c))]?.key;
      switch (e.key) {
        case "ArrowUp": next = at(g.row - 1, g.col); break;
        case "ArrowDown": next = at(g.row + 1, g.col); break;
        case "ArrowLeft": next = at(g.row, g.col - h); break;
        case "ArrowRight": next = at(g.row, g.col + h); break;
        case "Home": next = e.ctrlKey ? at(0, 0) : at(g.row, 0); break;
        case "End": next = e.ctrlKey ? at(layout.rows.length - 1, layout.cols - 1) : at(g.row, layout.cols - 1); break;
        case "PageUp": next = at(0, g.col); break;
        case "PageDown": next = at(layout.rows.length - 1, g.col); break;
      }
    }
    if (next) {
      e.preventDefault();
      focusKey(next);
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && onCellClick && g.cell) {
      e.preventDefault();
      onCellClick(g.cell);
    }
  };

  /* ----- table + summary ----- */
  const table = React.useMemo<ChartTableSpec>(() => {
    if (mode === "calendar") {
      const rows = focusable.filter((g) => g.cell && (g.cell.value !== null || g.cell.category)).map((g) => ({ date: g.key, value: scale === "categorical" ? valueText(g.cell) : g.cell!.value }));
      return { columns: [{ key: "date", label: t("date"), header: true }, { key: "value", label: valueLabel ?? t("value"), format: scale === "categorical" ? undefined : format }], rows };
    }
    const cols = layout.colLabels ?? [];
    return {
      columns: [{ key: "__y", label: title, header: true }, ...cols.map((c) => ({ key: c, label: c, format }))],
      rows: layout.rows.map((r, i) => Object.fromEntries([["__y", layout.rowLabels[i]?.long ?? ""], ...r.map((g) => [g.cell ? String(g.cell.x) : g.key, g.cell?.value ?? null])])),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, focusable, layout, format, valueLabel, t, scale, title]);

  const summaryText = React.useMemo(() => {
    if (summary) return summary;
    const withValues = focusable.filter((g) => typeof g.cell?.value === "number");
    if (!withValues.length) return "";
    let max = withValues[0]!;
    let min = withValues[0]!;
    let total = 0;
    for (const g of withValues) {
      const v = g.cell!.value!;
      total += v;
      if (v > max.cell!.value!) max = g;
      if (v < min.cell!.value!) min = g;
    }
    const fmt = (v: number) => formatValue(f, format, v);
    if (mode === "calendar")
      return t("calendarSummary", { from: f.date(fromDay(layout.from), "medium"), to: f.date(fromDay(layout.to), "medium"), total: fmt(total), maxAt: max.label, max: fmt(max.cell!.value!) });
    return t("matrixSummary", { maxAt: max.label, max: fmt(max.cell!.value!), minAt: min.label, min: fmt(min.cell!.value!) });
  }, [summary, focusable, f, format, mode, t, layout]);

  /* ----- render ----- */
  const fixed = typeof cellSize === "number";
  const colTemplate = fixed ? `repeat(${layout.cols}, ${cellSize}px)` : `repeat(${layout.cols}, minmax(0, 1fr))`;
  const shown = hover ?? null;
  const shownCell = shown ? byKey.get(shown) : undefined;
  const legendSteps = scale === "categorical" ? [] : Array.from({ length: steps }, (_, i) => i);

  const legendNode =
    showLegend && (scale !== "categorical" || categories?.length) ? (
      <div aria-hidden className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11.5px] text-fg-muted">
        {scale === "categorical" ? (
          categories!.map((c) => (
            <span key={c.value} className="inline-flex items-center gap-1.5">
              <span className="vui-heatmap-swatch" style={{ background: resolveChartColor(c.color) }} />
              {c.label}
            </span>
          ))
        ) : (
          <span className="inline-flex items-center gap-1">
            <span className="me-1">{t("less")}</span>
            {legendSteps.map((i) => (
              <span key={i} className="vui-heatmap-swatch" data-step={i} style={{ background: stepColor(i) }} />
            ))}
            <span className="ms-1">{t("more")}</span>
          </span>
        )}
      </div>
    ) : null;

  return (
    <Chart
      title={title}
      data={table.rows}
      config={{ value: { label: valueLabel ?? t("value"), format } }}
      table={table}
      summary={summaryText}
      height="auto"
      legend="none"
      skeleton="grid"
      tableToggle={tableToggle}
      state={state ?? (data.length === 0 ? { status: "empty" } : { status: "ready" })}
      labels={labels}
      className={className}
      {...props}
    >
      <div className="vui-heatmap grid gap-2" data-mode={mode} data-scale={scale}>
        <div className={cn("relative", fixed && "overflow-x-auto pb-1")}>
          <div className="grid w-full" style={{ gridTemplateColumns: "auto minmax(0, 1fr)", columnGap: 8 }}>
            {/* column headers */}
            <span />
            {mode === "calendar" ? (
              <div aria-hidden className="relative mb-1 h-4 text-[11px] text-fg-subtle" style={{ display: "grid", gridTemplateColumns: colTemplate, gap: "var(--hm-gap)" }}>
                {layout.months.map((m) => (
                  <span key={m.col} className="whitespace-nowrap" style={{ gridColumnStart: m.col + 1 }}>
                    {m.label}
                  </span>
                ))}
              </div>
            ) : (
              <span />
            )}
            <div
              ref={gridRef}
              role="grid"
              aria-label={title}
              aria-readonly
              className="col-span-2 grid"
              style={{ gridTemplateColumns: "subgrid", rowGap: "var(--hm-gap)" }}
              onMouseLeave={() => setHover(null)}
            >
              {mode === "matrix" ? (
                <div role="row" className="col-span-2 grid" style={{ gridTemplateColumns: "subgrid" }}>
                  <span role="columnheader">
                    <span className="sr-only">{title}</span>
                  </span>
                  <div className="grid" style={{ gridTemplateColumns: colTemplate, gap: "var(--hm-gap)" }}>
                    {(layout.colLabels ?? []).map((c, i) => (
                      <span key={c} role="columnheader" className="overflow-hidden text-center text-[11px] whitespace-nowrap text-fg-subtle">
                        <span className={cn(layout.cols > 12 && i % 3 !== 0 && "sr-only")}>{c}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {layout.rows.map((row, ri) => (
                <div key={ri} role="row" className="col-span-2 grid items-center" style={{ gridTemplateColumns: "subgrid" }}>
                  <span role="rowheader" className="pe-1 text-end text-[11px] leading-none whitespace-nowrap text-fg-subtle">
                    <span className={cn(mode === "calendar" && ri % 2 === 0 && "sr-only")}>{layout.rowLabels[ri]?.short}</span>
                  </span>
                  <div className="grid" style={{ gridTemplateColumns: colTemplate, gap: "var(--hm-gap)" }}>
                    {row.map((g) => {
                      if (g.placeholder) return <span key={g.key} role="presentation" className="vui-heatmap-cell" data-placeholder="" />;
                      const { bg, step } = fillOf(g.cell);
                      const text = t("cell", { label: g.label, value: valueText(g.cell) });
                      const isToday = mode === "calendar" && today === g.key;
                      return (
                        <div
                          key={g.key}
                          role="gridcell"
                          data-key={g.key}
                          data-step={step}
                          data-empty={bg ? undefined : ""}
                          data-today={isToday ? "" : undefined}
                          aria-label={text}
                          aria-current={isToday ? "date" : undefined}
                          tabIndex={g.key === activeKey ? 0 : -1}
                          onFocus={() => {
                            setActive(g.key);
                            setHover(g.key);
                          }}
                          onBlur={() => setHover((h) => (h === g.key ? null : h))}
                          onMouseEnter={() => setHover(g.key)}
                          onKeyDown={(e) => onKeyDown(e, g)}
                          onClick={onCellClick && g.cell ? () => onCellClick(g.cell!) : undefined}
                          className={cn("vui-heatmap-cell focus-ring", onCellClick && "cursor-pointer")}
                          style={bg ? { background: bg } : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {shownCell ? <HeatmapTooltip gridRef={gridRef} cellKey={shownCell.key} content={tooltip && shownCell.cell ? tooltip(shownCell.cell) : <><span className="text-fg-muted">{shownCell.label}</span><span className="font-mono text-fg tabular">{valueText(shownCell.cell)}</span></>} /> : null}
        </div>
        {legendNode}
      </div>
    </Chart>
  );
}

/** Floating cell tooltip, positioned above the cell (decorative — the cell carries the full label). */
function HeatmapTooltip({ gridRef, cellKey, content }: { gridRef: React.RefObject<HTMLDivElement | null>; cellKey: string; content: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  React.useLayoutEffect(() => {
    const grid = gridRef.current;
    const cell = grid?.querySelector<HTMLElement>(`[data-key="${CSS.escape(cellKey)}"]`);
    const host = ref.current?.offsetParent as HTMLElement | null;
    if (!cell || !host) return;
    const a = cell.getBoundingClientRect();
    const b = host.getBoundingClientRect();
    setPos({ x: a.left - b.left + a.width / 2, y: a.top - b.top });
  }, [gridRef, cellKey]);
  return (
    <div
      ref={ref}
      aria-hidden
      className="vui-chart-tooltip pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col gap-0.5 rounded-ui-sm px-2.5 py-1.5 text-[12px] whitespace-nowrap"
      style={{ left: pos?.x ?? 0, top: (pos?.y ?? 0) - 6, visibility: pos ? "visible" : "hidden" }}
    >
      {content}
    </div>
  );
}
