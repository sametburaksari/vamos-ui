import * as React from "react";
import { cn } from "../lib/cn";

/** A theme colour token, or any CSS colour. Tokens follow every theme axis. */
export type SparklineColor =
  | "currentColor"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "chart-6"
  | "accent-ink"
  | "fg"
  | "fg-muted"
  | "fg-subtle"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | (string & {});

const TOKENS = new Set(["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "accent-ink", "fg", "fg-muted", "fg-subtle", "success", "warning", "danger", "info"]);

/** `"chart-2"` → `"var(--chart-2)"`; other values pass through. */
export const sparklineColor = (c: SparklineColor = "currentColor") => (TOKENS.has(c) ? `var(--${c})` : c);

const SIZES = { xs: [64, 20], sm: [96, 32], md: [160, 40] } as const;

export interface SparklineProps extends Omit<React.SVGAttributes<SVGSVGElement>, "values" | "color" | "width" | "height"> {
  /** Data points, oldest first. `null` leaves a gap. */
  values: ReadonlyArray<number | null>;
  /** Default `"line"`. `"winloss"` draws up/down ticks from the sign of each value. */
  variant?: "line" | "area" | "bars" | "winloss";
  /** Preset box: xs 64×20 (table cells), sm 96×32, md 160×40. Default `"sm"`. */
  size?: keyof typeof SIZES;
  /** Pixel width, or `"100%"` to fill the container (strokes stay crisp). Overrides `size`. */
  width?: number | "100%";
  /** Pixel height. Overrides `size`. */
  height?: number;
  /** Token (`"chart-2"`, `"success"`…) or CSS colour. Default `currentColor`. */
  color?: SparklineColor;
  /** Stroke width of line/area. Default 1.6. */
  strokeWidth?: number;
  /** Dot on the last value. */
  showLast?: boolean;
  /** Dots on the lowest and highest value. */
  showMinMax?: boolean;
  /** Dashed reference line (target, average). */
  reference?: number;
  /** Shared scale `[min, max]` — use the same domain for every row of a table. */
  domain?: readonly [number, number];
  /** Accessible description. Without it the sparkline is decorative (`aria-hidden`). See `sparklineSummary()`. */
  label?: string;
}

/**
 * An axis-less mini trend: plain SVG, no chart library, server-component compatible.
 * Use in Stat, table cells and list rows; decorative unless you pass `label`.
 *
 * ```tsx
 * <Sparkline values={[4, 6, 5, 8, 7, 9, 12]} className="text-accent-ink" />
 * <Sparkline values={weekly} variant="bars" size="xs" domain={[0, 120]} label={sparklineSummary(weekly)} />
 * ```
 */
export const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(function Sparkline(
  { values, variant = "line", size = "sm", width, height, color, strokeWidth = 1.6, showLast, showMinMax, reference, domain, label, className, style, ...props },
  ref,
) {
  const gradientId = `spark-${React.useId().replace(/:/g, "")}`;
  const fluid = width === "100%";
  const w = typeof width === "number" ? width : SIZES[size][0];
  const h = height ?? SIZES[size][1];
  const nums = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  const svgProps = {
    ref,
    "data-slot": "sparkline",
    "data-variant": variant,
    viewBox: `0 0 ${w} ${h}`,
    width: fluid ? "100%" : w,
    height: h,
    preserveAspectRatio: fluid ? "none" : undefined,
    className: cn("block shrink-0 overflow-visible", fluid && "w-full", className),
    style: { color: color ? sparklineColor(color) : undefined, ...style },
    focusable: "false" as const,
    ...a11y,
    ...props,
  };

  if (nums.length === 0) {
    return (
      <svg {...svgProps}>
        <line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke="var(--line)" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }

  const pad = variant === "bars" || variant === "winloss" ? 0 : Math.max(2, strokeWidth + 1.5);
  const base = variant === "bars" ? [Math.min(0, ...nums), Math.max(0, ...nums)] : [Math.min(...nums), Math.max(...nums)];
  const extra = reference === undefined ? [] : [reference];
  const lo = domain ? domain[0] : Math.min(base[0]!, ...extra);
  const hi = domain ? domain[1] : Math.max(base[1]!, ...extra);
  const span = hi - lo || 1;
  const flat = hi === lo;
  const y = (v: number) => (flat ? h / 2 : h - pad - ((Math.min(hi, Math.max(lo, v)) - lo) / span) * (h - pad * 2));
  const n = values.length;
  const x = (i: number) => (n === 1 ? w / 2 : (i / (n - 1)) * w);
  const stroke = { vectorEffect: "non-scaling-stroke" as const };
  // A zero-length round-capped line renders as a true circle even when the SVG is stretched.
  const dot = (i: number, v: number, key: string, r = 2.25) => (
    <path key={key} d={`M${x(i)} ${y(v)}h0`} stroke="currentColor" strokeWidth={r * 2} strokeLinecap="round" {...stroke} />
  );

  if (variant === "bars" || variant === "winloss") {
    const slot = w / n;
    const gap = Math.min(2, slot * 0.25);
    const bw = Math.max(1, slot - gap);
    const zero = variant === "winloss" ? h / 2 : y(Math.max(lo, Math.min(hi, 0)));
    return (
      <svg {...svgProps}>
        {reference !== undefined && variant === "bars" ? (
          <line x1={0} x2={w} y1={y(reference)} y2={y(reference)} stroke="var(--fg-subtle)" strokeDasharray="3 3" strokeWidth={1} {...stroke} />
        ) : null}
        {values.map((v, i) => {
          if (typeof v !== "number" || !Number.isFinite(v)) return null;
          const bx = i * slot + gap / 2;
          if (variant === "winloss") {
            if (v === 0) return <rect key={i} x={bx} width={bw} y={h / 2 - 0.5} height={1} fill="var(--fg-subtle)" />;
            const up = v > 0;
            return <rect key={i} x={bx} width={bw} y={up ? 1 : h / 2 + 1} height={h / 2 - 2} rx={Math.min(1.5, bw / 3)} fill={up ? "var(--success)" : "var(--danger)"} />;
          }
          const top = Math.min(y(v), zero);
          const bh = Math.max(1, Math.abs(zero - y(v)));
          const last = i === n - 1;
          return <rect key={i} x={bx} width={bw} y={top} height={bh} rx={Math.min(1.5, bw / 3)} fill="currentColor" opacity={showLast && !last ? 0.45 : 1} />;
        })}
      </svg>
    );
  }

  // Line / area: split into segments at null gaps.
  const segments: Array<Array<[number, number]>> = [];
  let cur: Array<[number, number]> = [];
  values.forEach((v, i) => {
    if (typeof v === "number" && Number.isFinite(v)) cur.push([x(i), y(v)]);
    else if (cur.length) {
      segments.push(cur);
      cur = [];
    }
  });
  if (cur.length) segments.push(cur);
  const path = (seg: Array<[number, number]>) =>
    seg.length === 1 ? `M${Math.max(0, seg[0]![0] - 2)} ${seg[0]![1]}H${Math.min(w, seg[0]![0] + 2)}` : seg.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(2)} ${py.toFixed(2)}`).join("");

  const lastIdx = values.findLastIndex((v) => typeof v === "number" && Number.isFinite(v));
  const minIdx = values.indexOf(Math.min(...nums));
  const maxIdx = values.indexOf(Math.max(...nums));

  return (
    <svg {...svgProps}>
      {variant === "area" ? (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.24} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
      ) : null}
      {reference !== undefined ? (
        <line data-slot="sparkline-reference" x1={0} x2={w} y1={y(reference)} y2={y(reference)} stroke="var(--fg-subtle)" strokeDasharray="3 3" strokeWidth={1} {...stroke} />
      ) : null}
      {variant === "area"
        ? segments.map((seg, i) =>
            seg.length > 1 ? <path key={`a${i}`} d={`${path(seg)}L${seg[seg.length - 1]![0]} ${h}L${seg[0]![0]} ${h}Z`} fill={`url(#${gradientId})`} stroke="none" /> : null,
          )
        : null}
      {segments.map((seg, i) => (
        <path key={`l${i}`} d={path(seg)} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" {...stroke} />
      ))}
      {showMinMax && !flat ? [dot(minIdx, nums.length ? Math.min(...nums) : 0, "min", 1.75), dot(maxIdx, Math.max(...nums), "max", 1.75)] : null}
      {showLast && lastIdx >= 0 ? dot(lastIdx, values[lastIdx] as number, "last") : null}
    </svg>
  );
});

/** Direction of a series from its first to its last number: `1` up, `-1` down, `0` flat. */
export function sparklineDirection(values: ReadonlyArray<number | null>): -1 | 0 | 1 {
  const nums = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (nums.length < 2) return 0;
  const d = nums[nums.length - 1]! - nums[0]!;
  return d > 0 ? 1 : d < 0 ? -1 : 0;
}

/**
 * Plain-English summary for a sparkline's `label`: "Rose from 4 to 14, peak 14".
 * Pass `format` for locale numbers (`(n) => f.number(n)`), or write your own sentence.
 */
export function sparklineSummary(values: ReadonlyArray<number | null>, format: (n: number) => string = (n) => n.toLocaleString("en-US")): string {
  const nums = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (nums.length === 0) return "No data";
  if (nums.length === 1) return `Single value ${format(nums[0]!)}`;
  const first = nums[0]!;
  const last = nums[nums.length - 1]!;
  const peak = Math.max(...nums);
  const low = Math.min(...nums);
  const verb = last > first ? "Rose" : last < first ? "Fell" : "Held";
  const range = last === first ? `at ${format(first)}` : `from ${format(first)} to ${format(last)}`;
  const tail = last > first ? `, peak ${format(peak)}` : last < first ? `, low ${format(low)}` : "";
  return `${verb} ${range}${tail}`;
}
