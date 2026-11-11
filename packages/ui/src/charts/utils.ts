// React-free chart helpers: token colours, value formatting, summaries. Safe in server components.
import type { ComponentType, ReactNode } from "react";
import type { DatePreset, Formatter } from "../format/core";

/** A colour token a series can use. Never a hex value — the token follows every theme axis. */
export type ChartColor =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "chart-6"
  | "accent"
  | "accent-ink"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "fg-subtle"
  | "fg-muted";

/** Date presets for chart axes and tooltips (the format module's presets + short axis forms). */
export type ChartDatePreset = DatePreset | "day-month" | "month" | "month-short-year" | "hour" | "weekday-short";

/**
 * How a value is written. Strings use the locale formatter; objects pick a currency or a date preset;
 * a function gets the raw value and the locale.
 */
export type FormatSpec =
  | "number"
  | "integer"
  | "compact"
  | "percent"
  | "currency"
  | "duration"
  | "bytes"
  | { currency: string; compact?: boolean }
  | { date: ChartDatePreset | Intl.DateTimeFormatOptions; timeZoneName?: "short" }
  | { relative: true }
  | ((value: unknown, locale: string) => string);

export type SeriesPattern = "solid" | "dashed" | "dotted";

export interface SeriesConfig {
  /** Shown in legend, tooltip, table header and summary. */
  label: string;
  /** Colour token. Default: chart-1…chart-6 in config order. */
  color?: ChartColor;
  /** How values of this series are written. Default `"number"`. */
  format?: FormatSpec;
  /** Value axis side (Combo). Logical: `start` is left in LTR, right in RTL. */
  axis?: "start" | "end";
  /** Stroke pattern. Auto-assigned when a chart has more than 3 series (colour-blind safety). */
  pattern?: SeriesPattern;
  /** Small icon before the legend label (a lucide icon or any component taking className). */
  icon?: ComponentType<{ className?: string }>;
  /** Start hidden (the legend can show it again). */
  hidden?: boolean;
}

/** Series key → its settings. Key order is legend and colour order. */
export type ChartConfig = Record<string, SeriesConfig>;

export type ChartState =
  | { status: "ready" }
  | { status: "loading" }
  | { status: "refreshing" }
  | { status: "empty"; message?: ReactNode; action?: ReactNode }
  | { status: "error"; message?: ReactNode; onRetry?: () => void };

export type ChartHeight = number | "sm" | "md" | "lg";

export const CHART_HEIGHTS = { sm: 160, md: 260, lg: 360 } as const;

const PALETTE: ChartColor[] = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"];

/** `"chart-2"` → `"var(--chart-2)"`. */
export function resolveChartColor(color: ChartColor): string {
  return `var(--${color})`;
}

/** The first `n` palette tokens (wraps after 6). */
export function seriesPalette(n: number): ChartColor[] {
  return Array.from({ length: n }, (_, i) => PALETTE[i % PALETTE.length]!);
}

/** A CSS-identifier-safe version of a series key, used in `--series-<key>` variables. */
export function seriesVarName(key: string): string {
  return `--series-${key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

/** `var(--series-<key>)` — the colour of a series inside a Chart. */
export function seriesColor(key: string): string {
  return `var(${seriesVarName(key)})`;
}

export interface ResolvedSeries extends SeriesConfig {
  key: string;
  color: ChartColor;
  pattern: SeriesPattern;
  index: number;
}

const AUTO_PATTERNS: SeriesPattern[] = ["solid", "dashed", "dotted"];

/** Fills in colour and pattern defaults for every series of a config. */
export function resolveSeries(config: ChartConfig): ResolvedSeries[] {
  const keys = Object.keys(config);
  const auto = keys.length > 3;
  return keys.map((key, index) => {
    const s = config[key]!;
    return {
      ...s,
      key,
      index,
      color: s.color ?? PALETTE[index % PALETTE.length]!,
      pattern: s.pattern ?? (auto ? AUTO_PATTERNS[index % AUTO_PATTERNS.length]! : "solid"),
    };
  });
}

/** SVG dash array for a pattern. */
export function patternDash(pattern: SeriesPattern | undefined): string | undefined {
  if (pattern === "dashed") return "6 4";
  if (pattern === "dotted") return "1.5 3.5";
  return undefined;
}

const CHART_DATE_PRESETS: Record<string, Intl.DateTimeFormatOptions> = {
  "day-month": { month: "short", day: "numeric" },
  month: { month: "short" },
  "month-short-year": { month: "short", year: "2-digit" },
  hour: { hour: "numeric" },
  "weekday-short": { weekday: "short" },
};

const isMissing = (v: unknown) => v === null || v === undefined || (typeof v === "number" && Number.isNaN(v));

/**
 * Writes a value with a FormatSpec. `compact` shortens numbers and money for axis ticks
 * ("$1.2M", "₺1,2 Mn"); tooltips and tables use the full form. Missing values → "—".
 */
export function formatValue(f: Formatter, spec: FormatSpec | undefined, value: unknown, options: { compact?: boolean; compactFrom?: number } = {}): string {
  if (isMissing(value)) return "—";
  // compactFrom: plain numbers shorten from this size (axes whose top tick is ≥ 10K pass 1000 so every tick reads alike)
  const { compact, compactFrom = 10000 } = options;
  if (typeof spec === "function") return spec(value, f.locale);
  const num = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value)) ? Number(value) : NaN;
  if (spec && typeof spec === "object") {
    if ("date" in spec) {
      const preset = spec.date;
      const o: Intl.DateTimeFormatOptions = typeof preset === "string" ? (CHART_DATE_PRESETS[preset] ?? {}) : preset;
      const opts = { ...o, ...(spec.timeZoneName ? { timeZoneName: spec.timeZoneName } : {}) };
      if (typeof preset === "string" && !CHART_DATE_PRESETS[preset]) return f.date(value as string, preset as DatePreset);
      return f.date(value as string, opts);
    }
    if ("relative" in spec) return f.relative(value as string);
    if ("currency" in spec) {
      const c = compact || spec.compact;
      return f.currency(value as number, { currency: spec.currency, ...(c ? { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 } : {}) });
    }
  }
  if (Number.isNaN(num)) return String(value);
  switch (spec) {
    case "integer":
      return compact && Math.abs(num) >= compactFrom ? f.compact(num) : f.number(num, { maximumFractionDigits: 0 });
    case "compact":
      return f.compact(num);
    case "percent":
      return f.percent(num);
    case "currency":
      return compact ? f.currency(num, { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }) : f.currency(num);
    case "duration":
      return f.duration(num, compact ? { maxParts: 1 } : undefined);
    case "bytes":
      return f.bytes(num);
    case "number":
    default:
      return compact && Math.abs(num) >= compactFrom ? f.compact(num) : f.number(num, { maximumFractionDigits: 2 });
  }
}

/** Default x formatter: `YYYY-MM-DD` strings become "Nov 1", everything else is printed as is. */
export function formatCategory(f: Formatter, spec: FormatSpec | undefined, value: unknown, long = false): string {
  if (spec) return formatValue(f, spec, value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return f.date(value, long ? "medium" : { month: "short", day: "numeric" });
  return isMissing(value) ? "—" : String(value);
}

/** Estimated pixel width of a y-axis from its longest formatted tick (11px tabular text). */
export function estimateAxisWidth(labels: string[], fontSize = 11): number {
  const longest = labels.reduce((m, s) => Math.max(m, s.length), 0);
  return Math.min(128, Math.max(32, Math.ceil(longest * fontSize * 0.68) + 16));
}

/** Numeric min / max over some keys of the rows (stacked → per-row sums). */
export function extent(rows: Record<string, unknown>[], keys: string[], stacked = false): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const row of rows) {
    if (stacked) {
      let pos = 0;
      let neg = 0;
      for (const k of keys) {
        const v = Number(row[k]);
        if (!Number.isFinite(v)) continue;
        if (v >= 0) pos += v;
        else neg += v;
      }
      min = Math.min(min, neg);
      max = Math.max(max, pos);
    } else {
      for (const k of keys) {
        const v = row[k];
        if (v === null || v === undefined) continue;
        const n = Number(v);
        if (!Number.isFinite(n)) continue;
        min = Math.min(min, n);
        max = Math.max(max, n);
      }
    }
  }
  if (min === Infinity) return [0, 0];
  return [min, max];
}

/** Rounds a max up to a "nice" tick (1, 2, 2.5, 5 × 10ⁿ). */
export function niceCeil(v: number): number {
  if (v <= 0) return 0;
  const exp = Math.floor(Math.log10(v));
  const base = 10 ** exp;
  const f = v / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * base;
}

/** A "nice" tick step at or above `v` (1, 1.5, 2, 2.5, 3, 4, 5, 6, 8 × 10ⁿ). */
export function niceStep(v: number): number {
  if (v <= 0) return 0;
  const exp = Math.floor(Math.log10(v));
  const base = 10 ** exp;
  const f = v / base;
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const nice = steps.find((s) => f <= s + 1e-9) ?? 10;
  return Number((nice * base).toPrecision(12));
}

/**
 * Two value-axis domains whose zero lines meet (Combo). Each input is a `[min, max]` extent.
 * Returns domains with the same negative share, so neither axis exaggerates.
 */
export function alignZeroDomains(a: [number, number], b: [number, number]): [[number, number], [number, number]] {
  const norm = ([lo, hi]: [number, number]): [number, number] => [Math.min(0, lo), Math.max(0, hi, lo < 0 && hi <= 0 ? 0 : hi)];
  const [aLo, aHi] = norm(a);
  const [bLo, bHi] = norm(b);
  const share = (lo: number, hi: number) => (hi - lo === 0 ? 0 : -lo / (hi - lo));
  const s = Math.max(share(aLo, aHi), share(bLo, bHi));
  const fit = (lo: number, hi: number): [number, number] => {
    if (s === 0) return [0, niceStep(hi / 4) * 4 || 1];
    if (s >= 1) return [lo || -1, 0];
    const top = Math.max(hi, (-lo * (1 - s)) / s);
    const bottom = -(top * s) / (1 - s);
    return [Math.min(lo, bottom), top];
  };
  return [fit(aLo, aHi), fit(bLo, bHi)];
}

/**
 * Two value axes (Combo) with nice, evenly spaced ticks whose zero lines meet: both axes get the
 * same number of steps below and above zero, each with its own nice step (1, 2, 2.5, 5… × 10ⁿ), so
 * one set of grid lines serves both scales. An axis whose data never goes below zero keeps only its
 * non-negative ticks (its domain still reaches below zero to line up with the other axis).
 */
export function alignedAxes(a: [number, number], b: [number, number]): { domains: [[number, number], [number, number]]; ticks: [number[], number[]] } {
  const norm = ([lo, hi]: [number, number]): [number, number] => [Math.min(0, Number.isFinite(lo) ? lo : 0), Math.max(0, Number.isFinite(hi) ? hi : 0)];
  const axes = [norm(a), norm(b)] as const;
  const round = (v: number) => Number(v.toPrecision(12));
  const build = (neg: number, pos: number, steps: [number, number]) =>
    axes.map(([lo], i) => {
      const step = steps[i]!;
      const all = Array.from({ length: neg + pos + 1 }, (_, k) => round((k - neg) * step));
      return { domain: [round(-neg * step), round(pos * step)] as [number, number], ticks: lo < 0 ? all : all.filter((v) => v >= 0) };
    });
  const anyNeg = axes.some(([lo]) => lo < 0);
  const anyPos = axes.some(([, hi]) => hi > 0);
  if (!anyNeg) {
    // Non-negative data: four equal steps on both axes.
    const steps = axes.map(([, hi]) => niceStep(hi / 4) || 0.25) as [number, number];
    const [x, y] = build(0, 4, steps);
    return { domains: [x!.domain, y!.domain], ticks: [x!.ticks, y!.ticks] };
  }
  let best: { score: number; neg: number; pos: number; steps: [number, number] } | null = null;
  for (const total of [4, 5, 6]) {
    for (let neg = 1; neg <= total; neg++) {
      const pos = total - neg;
      if (anyPos && pos === 0) continue;
      const steps = axes.map(([lo, hi]) => {
        const need = Math.max(neg ? -lo / neg : 0, pos ? hi / pos : hi > 0 ? Infinity : 0);
        return Number.isFinite(need) ? niceStep(need) || 1 : Infinity;
      }) as [number, number];
      if (!steps.every(Number.isFinite)) continue;
      // Share of each axis left empty, plus a small cost per extra step.
      const waste = axes.reduce((sum, [lo, hi], i) => sum + 1 - (hi - lo) / (steps[i]! * total || 1), 0);
      const score = waste + (total - 4) * 0.06;
      if (!best || score < best.score - 1e-9) best = { score, neg, pos, steps };
    }
  }
  const { neg, pos, steps } = best!;
  const [x, y] = build(neg, pos, steps);
  return { domains: [x!.domain, y!.domain], ticks: [x!.ticks, y!.ticks] };
}

export interface SeriesStats {
  key: string;
  min: number;
  max: number;
  avg: number;
  minIndex: number;
  maxIndex: number;
  count: number;
}

/** Min / max / average of one series (nulls skipped). `null` when the series has no numbers. */
export function seriesStats(rows: Record<string, unknown>[], key: string): SeriesStats | null {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let count = 0;
  let minIndex = 0;
  let maxIndex = 0;
  rows.forEach((row, i) => {
    const raw = row[key];
    if (raw === null || raw === undefined) return;
    const v = Number(raw);
    if (!Number.isFinite(v)) return;
    if (v < min) {
      min = v;
      minIndex = i;
    }
    if (v > max) {
      max = v;
      maxIndex = i;
    }
    sum += v;
    count++;
  });
  if (!count) return null;
  return { key, min, max, avg: sum / count, minIndex, maxIndex, count };
}

/**
 * A one-paragraph text summary of a chart for screen readers:
 * "Nov 1 – Nov 30. Visits: low 812 (Nov 3), high 1,402 (Nov 28), average 1,090."
 */
export function summarizeSeries(options: {
  f: Formatter;
  rows: Record<string, unknown>[];
  series: Pick<ResolvedSeries, "key" | "label" | "format">[];
  x?: string;
  xFormat?: FormatSpec;
  templates?: { range?: string; series?: string };
}): string {
  const { f, rows, series, x, xFormat } = options;
  if (!rows.length) return "";
  const xText = (i: number) => (x ? formatCategory(f, xFormat, rows[i]?.[x]) : String(i + 1));
  const fill = (tpl: string, vars: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
  const parts: string[] = [];
  if (x && rows.length > 1) parts.push(fill(options.templates?.range ?? "{from} – {to}.", { from: xText(0), to: xText(rows.length - 1) }));
  for (const s of series) {
    const st = seriesStats(rows, s.key);
    if (!st) continue;
    const fmt = (v: number) => formatValue(f, s.format, v);
    parts.push(
      fill(options.templates?.series ?? "{label}: low {min} ({minAt}), high {max} ({maxAt}), average {avg}.", {
        label: s.label,
        min: fmt(st.min),
        minAt: xText(st.minIndex),
        max: fmt(st.max),
        maxAt: xText(st.maxIndex),
        avg: fmt(Math.round(st.avg * 100) / 100),
      }),
    );
  }
  return parts.join(" ");
}

/** Equal-count (quantile) break points for `steps` buckets. Returns `steps - 1` thresholds. */
export function quantileBreaks(values: number[], steps: number): number[] {
  const sorted = values.filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
  if (!sorted.length) return Array.from({ length: steps - 2 }, () => Infinity);
  const out: number[] = [];
  // bucket 0 is reserved for zero; the rest split the positive values.
  for (let i = 1; i < steps - 1; i++) {
    const q = sorted[Math.min(sorted.length - 1, Math.floor((i / (steps - 1)) * sorted.length))]!;
    out.push(q);
  }
  return out;
}
