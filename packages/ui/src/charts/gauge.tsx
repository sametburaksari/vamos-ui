"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useFormat } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { formatValue, resolveChartColor, type ChartColor, type FormatSpec } from "./utils";

export const gaugeLabels = {
  valueText: "{value} of {max}",
  valueTextWithLabel: "{value} of {max}, {label}",
  target: "Target {value}",
  noValue: "No value",
};
export type GaugeLabels = typeof gaugeLabels;

export interface GaugeThreshold {
  /** Applies from this value up. */
  at: number;
  color: ChartColor;
  /** Word for the band ("Fair") — shown under the value and read in `aria-valuetext`. */
  label?: string;
}

const SIZES = { xs: 20, sm: 36, md: 96, lg: 160 } as const;

export interface ProgressRingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Current value. `null` = unknown (empty track, "—"). */
  value: number | null;
  /** Default 100. */
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | number;
  /** Stroke width in px. Default: about a tenth of the size. */
  thickness?: number;
  /** Fill token, or `"auto"` to take it from `thresholds`. Default `chart-1`. */
  color?: ChartColor | "auto";
  thresholds?: GaugeThreshold[];
  /** Centre content (md and lg). Default: the formatted value. Pass `null` for none. */
  label?: React.ReactNode;
  /** `percent` shows value / max; any other spec formats the value itself. */
  format?: FormatSpec;
  /** `progress` (task completion) → role="progressbar"; `meter` (a score) → role="meter". Default `progress`. */
  semantic?: "progress" | "meter";
  "aria-label": string;
  labels?: Partial<GaugeLabels>;
}

export interface GaugeProps extends ProgressRingProps {
  /** Sweep of the arc. Default 270. */
  arc?: 180 | 270;
  /** Paint the threshold ranges as a thin outer band. */
  showThresholdBands?: boolean;
  /** A marker on the arc (quota, goal). */
  target?: number;
}

function pickThreshold(value: number | null, thresholds?: GaugeThreshold[]) {
  if (value === null || !thresholds?.length) return undefined;
  return [...thresholds].sort((a, b) => a.at - b.at).filter((t) => value >= t.at).pop();
}

function useGaugeText(value: number | null, max: number, format: FormatSpec | undefined, threshold: GaugeThreshold | undefined, labels?: Partial<GaugeLabels>) {
  const f = useFormat();
  const t = useLabels("gauge", gaugeLabels, labels);
  const fmt = (v: number) => (format === "percent" ? f.percent(v / max) : formatValue(f, format, v));
  const display = value === null ? "—" : fmt(value);
  const maxText = format === "percent" ? f.percent(1) : formatValue(f, format, max);
  const valueText =
    value === null ? t("noValue") : threshold?.label ? t("valueTextWithLabel", { value: fmt(value), max: maxText, label: threshold.label }) : t("valueText", { value: fmt(value), max: maxText });
  return { display, valueText, t, fmt };
}

function a11yProps(semantic: "progress" | "meter", value: number | null, max: number, valueText: string, label: string) {
  return {
    role: semantic === "meter" ? "meter" : "progressbar",
    "aria-label": label,
    "aria-valuemin": 0,
    "aria-valuemax": max,
    "aria-valuenow": value === null ? undefined : Math.min(value, max),
    "aria-valuetext": valueText,
  } as const;
}

/**
 * A full ring for progress to a target — profile completeness, quota, upload. Plain SVG; `xs` fits
 * in a table cell.
 *
 * ```tsx
 * <ProgressRing value={85} aria-label="Profile completeness" format="percent" size="md" />
 * ```
 */
export const ProgressRing = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ProgressRingProps>(function ProgressRing(
  { value, max = 100, size = "md", thickness, color = "chart-1", thresholds, label, format, semantic = "progress", labels, className, style, "aria-label": ariaLabel, ...props },
  ref,
) {
  const px = typeof size === "number" ? size : SIZES[size];
  const sw = thickness ?? Math.max(2.5, Math.round(px * 0.09 * 10) / 10);
  const threshold = pickThreshold(value, thresholds);
  const { display, valueText } = useGaugeText(value, max, format, threshold, labels);
  const ratio = value === null ? 0 : Math.max(0, Math.min(1, value / max));
  const stroke = resolveChartColor(color === "auto" ? (threshold?.color ?? "chart-1") : color);
  const r = (px - sw) / 2;
  const c = 2 * Math.PI * r;
  const showLabel = px >= 64 && label !== null;
  return (
    <div
      ref={ref}
      data-slot="progress-ring"
      {...a11yProps(semantic, value, max, valueText, ariaLabel)}
      className={cn("relative inline-grid shrink-0 place-items-center align-middle", className)}
      style={{ width: px, height: px, ...style }}
      {...props}
    >
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-hidden data-ring="" className="vui-gauge-arc -rotate-90">
        <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={sw} />
        {ratio > 0 ? (
          <circle
            cx={px / 2}
            cy={px / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap={ratio >= 1 ? "butt" : "round"}
            strokeDasharray={`${c * ratio} ${c}`}
            className="vui-gauge-value"
          />
        ) : null}
      </svg>
      {showLabel ? (
        <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label ?? (
            <>
              <span className={cn("font-mono leading-none font-medium tracking-[-0.02em] text-fg tabular", px >= 140 ? "text-[30px]" : "text-[17px]")}>{display}</span>
              {threshold?.label && px >= 120 ? <span className="mt-1.5 text-[12px] text-fg-muted">{threshold.label}</span> : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
});

/**
 * A score or attainment on a 180° / 270° arc with optional threshold bands and a target marker —
 * SEO score, quota, NPS. `semantic="meter"` for scores.
 *
 * ```tsx
 * <Gauge value={64} aria-label="SEO score" semantic="meter" thresholds={[{ at: 0, color: "danger", label: "Poor" }, { at: 50, color: "warning", label: "Fair" }, { at: 80, color: "success", label: "Good" }]} color="auto" />
 * ```
 */
export const Gauge = /*#__PURE__*/ React.forwardRef<HTMLDivElement, GaugeProps>(function Gauge(
  { value, max = 100, size = "lg", thickness, color = "chart-1", thresholds, label, format, semantic = "meter", arc = 270, showThresholdBands, target, labels, className, style, "aria-label": ariaLabel, ...props },
  ref,
) {
  const px = typeof size === "number" ? size : SIZES[size];
  const sw = thickness ?? Math.max(3, Math.round(px * 0.075 * 10) / 10);
  const threshold = pickThreshold(value, thresholds);
  const { display, valueText, t, fmt } = useGaugeText(value, max, format, threshold, labels);
  const ratio = value === null ? 0 : Math.max(0, Math.min(1, value / max));
  const over = value !== null && value > max;
  const stroke = resolveChartColor(color === "auto" ? (threshold?.color ?? "chart-1") : color);

  const band = showThresholdBands && thresholds?.length ? sw * 0.35 : 0;
  const gap = band ? 3 : 0;
  const cx = px / 2;
  const r = (px - sw) / 2 - band - gap;
  const rb = (px - band) / 2;
  const sweep = arc;
  const start = arc === 180 ? 180 : 135; // degrees, clockwise from +x
  const height = arc === 180 ? Math.ceil(px / 2 + sw / 2 + 2) : Math.ceil(px / 2 + Math.sin(Math.PI / 4) * (px / 2) + 2);
  const len = (rad: number) => (2 * Math.PI * rad * sweep) / 360;
  const C = (rad: number) => 2 * Math.PI * rad;
  const point = (deg: number, rad: number) => [cx + rad * Math.cos((deg * Math.PI) / 180), cx + rad * Math.sin((deg * Math.PI) / 180)] as const;

  const sorted = thresholds ? [...thresholds].sort((a, b) => a.at - b.at) : [];
  const targetDeg = target !== undefined ? start + (Math.max(0, Math.min(1, target / max)) * sweep) : undefined;

  return (
    <div
      ref={ref}
      data-slot="gauge"
      data-arc={arc}
      {...a11yProps(semantic, value, max, valueText + (target !== undefined ? `, ${t("target", { value: fmt(target) })}` : ""), ariaLabel)}
      className={cn("relative inline-block shrink-0 align-middle", className)}
      style={{ width: px, height, ...style }}
      {...props}
    >
      <svg width={px} height={height} viewBox={`0 0 ${px} ${height}`} aria-hidden className="vui-gauge-arc overflow-visible">
        <g transform={`rotate(${start} ${cx} ${cx})`}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--track)" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${len(r)} ${C(r)}`} />
          {ratio > 0 ? (
            <circle cx={cx} cy={cx} r={r} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${len(r) * ratio} ${C(r)}`} className="vui-gauge-value" />
          ) : null}
          {band
            ? sorted.map((th, i) => {
                const from = Math.max(0, th.at / max);
                const to = Math.min(1, (sorted[i + 1]?.at ?? max) / max);
                if (to <= from) return null;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cx}
                    r={rb}
                    fill="none"
                    stroke={`color-mix(in oklch, ${resolveChartColor(th.color)} 55%, transparent)`}
                    strokeWidth={band}
                    strokeDasharray={`${Math.max(0, len(rb) * (to - from) - 1.5)} ${C(rb)}`}
                    strokeDashoffset={-len(rb) * from}
                  />
                );
              })
            : null}
        </g>
        {targetDeg !== undefined ? (
          (() => {
            const [x1, y1] = point(targetDeg, r - sw / 2 - 3);
            const [x2, y2] = point(targetDeg, r + sw / 2 + 3);
            return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fg)" strokeWidth={2} strokeLinecap="round" />;
          })()
        ) : null}
        {over ? (
          (() => {
            const [x, y] = point(start + sweep, r);
            return <circle cx={x} cy={y} r={sw / 2 + 1.5} fill="none" stroke="var(--fg)" strokeWidth={1.5} />;
          })()
        ) : null}
      </svg>
      {label !== null && px >= 64 ? (
        <div aria-hidden className={cn("absolute inset-x-0 flex flex-col items-center text-center", arc === 180 ? "bottom-0" : "top-0 bottom-[12%] justify-center")}>
          {label ?? (
            <>
              <span className={cn("font-mono leading-none font-medium tracking-[-0.03em] text-fg tabular", px >= 140 ? "text-[32px]" : "text-[18px]")}>{display}</span>
              {threshold?.label || target !== undefined ? (
                <span className="mt-1.5 text-[12px] text-fg-muted">{threshold?.label ?? t("target", { value: fmt(target!) })}</span>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
});
