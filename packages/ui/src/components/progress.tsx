"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";

export type ProgressTone = "accent" | "success" | "warning" | "danger" | "auto";
type ResolvedTone = Exclude<ProgressTone, "auto">;

const progressLabels = { of: "{value} of {max}", loading: "Loading…" };

interface SharedProgressProps {
  /** Current value. `null` / `undefined` → indeterminate. Values above `max` are allowed (quota overrun). */
  value?: number | null;
  /** Default 100. */
  max?: number;
  /**
   * `"accent"` (default; turns success when complete), a status colour, or `"auto"` for quotas:
   * above 80% warning, at or above 100% danger.
   */
  tone?: ProgressTone;
  /** How the value reads (visible and `aria-valuetext`): `"42%"` or `"1,240 of 5,000"`. Default `"percent"`. */
  display?: "percent" | "fraction";
  /** Override the announced value text entirely. */
  valueText?: string;
  labels?: Partial<typeof progressLabels>;
}

function resolveTone(tone: ProgressTone, ratio: number | null): ResolvedTone {
  if (tone === "auto") return ratio == null ? "accent" : ratio >= 1 ? "danger" : ratio > 0.8 ? "warning" : "accent";
  if (tone === "accent" && ratio != null && ratio >= 1) return "success";
  return tone;
}

function useProgressModel({ value, max = 100, tone = "accent", display = "percent", valueText, labels }: SharedProgressProps) {
  const f = useFormat();
  const t = useLabels("progress", progressLabels, labels);
  const indeterminate = value == null || Number.isNaN(value);
  const safeMax = max > 0 ? max : 100;
  const ratio = indeterminate ? null : Math.max(0, value!) / safeMax;
  const fill = ratio == null ? 0 : Math.min(1, ratio);
  const text = indeterminate
    ? undefined
    : (valueText ?? (display === "fraction" ? t("of", { value: f.number(value!), max: f.number(safeMax) }) : f.percent(ratio!, { maximumFractionDigits: 0 })));
  return { indeterminate, ratio, fill, text, max: safeMax, tone: resolveTone(tone, ratio), t };
}

const fillColor: Record<ResolvedTone, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};
const strokeColor: Record<ResolvedTone, string> = {
  accent: "stroke-accent-ink",
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
};
const valueColor: Record<ResolvedTone, string> = {
  accent: "text-fg",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

/* ------------------------------------------------------------------ */
/* Linear                                                               */
/* ------------------------------------------------------------------ */

export const progressTrackVariants = /*#__PURE__*/ cva("relative w-full overflow-hidden rounded-full bg-track", {
  variants: {
    size: { xs: "h-0.5", sm: "h-1", md: "h-2" },
  },
  defaultVariants: { size: "sm" },
});

export interface ProgressProps extends SharedProgressProps, Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 2 / 4 / 8 px. Default `"sm"`. */
  size?: "xs" | "sm" | "md";
  /** Visible label above the bar (linked with `aria-labelledby`). Without it, pass `aria-label`. */
  label?: React.ReactNode;
  /** Show the value at the end of the label row, or render your own. */
  showValue?: boolean | ((value: number, max: number) => React.ReactNode);
  /** Small text under the bar ("About 2 minutes left"). */
  hint?: React.ReactNode;
}

/**
 * Task progress or quota use. `role="progressbar"` with `aria-valuenow/min/max` and a localized
 * `aria-valuetext` ("42%" in English, "%42" in Turkish). Fills from the inline start (right in RTL).
 *
 * ```tsx
 * <Progress label="Uploading 4 files" value={42} showValue />
 * <Progress label="Contacts imported" value={1240} max={5000} display="fraction" showValue />
 * <Progress label="Storage" value={9.2} max={10} tone="auto" />
 * <Progress aria-label="Loading" value={null} />
 * ```
 */
export const Progress = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max, tone, display, valueText, labels, size, label, showValue, hint, className, id, ...props },
  ref,
) {
  const m = useProgressModel({ value, max, tone, display, valueText, labels });
  const autoId = React.useId();
  const baseId = id ?? `progress${autoId.replace(/:/g, "")}`;
  const labelId = label ? `${baseId}-label` : undefined;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const shownValue = m.indeterminate || !showValue ? null : typeof showValue === "function" ? showValue(value!, m.max) : m.text;

  const bar = (
    <div
      ref={label || hint ? undefined : ref}
      id={label || hint ? undefined : id}
      role="progressbar"
      aria-labelledby={labelId}
      aria-describedby={hintId}
      aria-valuemin={0}
      aria-valuemax={m.indeterminate ? undefined : m.max}
      aria-valuenow={m.indeterminate ? undefined : Math.min(value!, m.max)}
      aria-valuetext={m.indeterminate ? (label ? undefined : m.t("loading")) : m.text}
      data-slot="progress"
      data-state={m.indeterminate ? "indeterminate" : m.ratio! >= 1 ? "complete" : "loading"}
      data-tone={m.tone}
      className={cn("vui-progress", progressTrackVariants({ size }), !(label || hint) && className)}
      {...(label || hint ? {} : props)}
    >
      <div
        data-slot="progress-indicator"
        className={cn("vui-progress-indicator h-full w-full origin-left rounded-full rtl:origin-right", fillColor[m.tone])}
        style={m.indeterminate ? undefined : { transform: `scaleX(${m.fill})` }}
      />
    </div>
  );

  if (!label && !hint && !shownValue) return bar;

  return (
    <div ref={ref} id={id} data-slot="progress-field" className={cn("grid w-full gap-1.5", className)} {...props}>
      {label || shownValue ? (
        <div className="flex items-baseline justify-between gap-3 text-[13px]">
          {label ? (
            <span id={labelId} className="min-w-0 truncate font-medium text-fg">
              {label}
            </span>
          ) : (
            <span />
          )}
          {shownValue ? (
            <span aria-hidden className={cn("shrink-0 font-mono text-xs tabular", valueColor[m.tone] === "text-fg" ? "text-fg-muted" : valueColor[m.tone])}>
              {shownValue}
            </span>
          ) : null}
        </div>
      ) : null}
      {bar}
      {hint ? (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Circular                                                             */
/* ------------------------------------------------------------------ */

const CIRCLE = { sm: { px: 18, stroke: 2.5 }, md: { px: 40, stroke: 3.5 }, lg: { px: 64, stroke: 4.5 } } as const;

export interface ProgressCircleProps extends SharedProgressProps, Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 18 / 40 / 64 px. `sm` sits inline next to text. Default `"md"`. */
  size?: keyof typeof CIRCLE;
  /** Show the value in the centre (md and lg). Default `true` for lg. */
  showValue?: boolean;
  /** Content in the centre instead of the value (an icon, "3/5"). */
  children?: React.ReactNode;
}

/**
 * Compact circular progress: profile completion, a step ring, an inline upload. Needs an
 * accessible name (`aria-label` or `aria-labelledby`).
 *
 * ```tsx
 * <ProgressCircle aria-label="Profile complete" value={72} size="lg" />
 * ```
 */
export const ProgressCircle = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ProgressCircleProps>(function ProgressCircle(
  { value, max, tone, display, valueText, labels, size = "md", showValue, children, className, ...props },
  ref,
) {
  const m = useProgressModel({ value, max, tone, display, valueText, labels });
  const { px, stroke } = CIRCLE[size];
  const r = (px - stroke) / 2;
  const showCenter = size !== "sm" && (children != null || (showValue ?? size === "lg"));
  const pct = m.indeterminate ? 26 : m.fill * 100;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={m.indeterminate ? undefined : m.max}
      aria-valuenow={m.indeterminate ? undefined : Math.min(value!, m.max)}
      aria-valuetext={m.indeterminate ? m.t("loading") : m.text}
      data-slot="progress-circle"
      data-state={m.indeterminate ? "indeterminate" : m.ratio! >= 1 ? "complete" : "loading"}
      data-tone={m.tone}
      className={cn("vui-progress-circle relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: px, height: px }}
      {...props}
    >
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-hidden focusable="false" className="-rotate-90 rtl:-scale-y-100">
        <circle cx={px / 2} cy={px / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-track" />
        <g className="vui-progress-arc">
          <circle
            cx={px / 2}
            cy={px / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${pct} 100`}
            className={cn(strokeColor[m.tone], "transition-[stroke-dasharray] duration-300 motion-reduce:transition-none", pct === 0 && "opacity-0")}
          />
        </g>
      </svg>
      {showCenter ? (
        <span aria-hidden className={cn("absolute inset-0 flex items-center justify-center font-mono tabular", size === "lg" ? "text-[13px] font-medium" : "text-[10px]", valueColor[m.tone])}>
          {children ?? (m.indeterminate ? null : display === "fraction" ? `${value}/${m.max}` : m.text)}
        </span>
      ) : null}
    </div>
  );
});
