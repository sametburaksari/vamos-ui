"use client";

import * as React from "react";
import { CornerDownRight } from "lucide-react";
import { cn } from "../lib/cn";
import { useFormat } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { Skeleton } from "../components/skeleton";
import { formatValue, resolveChartColor, type ChartColor, type FormatSpec } from "./utils";

export const funnelLabels = {
  conversion: "{percent} of {previous}",
  overall: "{percent} overall",
  dropoff: "−{count}",
  stage: "{label}: {value}",
  stageWithConversion: "{label}: {value} ({percent} of {previous})",
  compare: "{delta} vs previous period",
  points: "{value} pt",
  loading: "Loading…",
  empty: "No stages yet",
};
export type FunnelLabels = typeof funnelLabels;

export interface FunnelStep {
  key: string;
  label: string;
  value: number;
  /** Money (or any second number) per stage, e.g. pipeline value. */
  amount?: number;
  href?: string;
}

export interface FunnelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  steps: FunnelStep[];
  /** `horizontal` = stage columns (falls back to rows in a narrow container); `vertical` = stacked rows (mobile). */
  orientation?: "horizontal" | "vertical";
  format?: FormatSpec;
  /** Format of `amount`. Default compact currency. */
  amountFormat?: FormatSpec;
  /** Metrics under each stage. Default `["conversion", "dropoff"]`. */
  show?: ("conversion" | "overall" | "dropoff")[];
  /** Base colour; later stages fade. Default `chart-1`. */
  color?: ChartColor;
  /** The same stages for a previous period — adds a marker and the conversion change. */
  compareTo?: FunnelStep[];
  onStepClick?: (step: FunnelStep) => void;
  size?: "sm" | "md";
  loading?: boolean;
  /** Accessible name of the list. */
  title?: string;
  labels?: Partial<FunnelLabels>;
}

/**
 * Stage-by-stage conversion as aligned bars: value, conversion from the previous stage, drop-off and
 * an optional amount. Drop-off is muted, not red — losing leads between stages is normal.
 *
 * ```tsx
 * <Funnel title="Sales pipeline" steps={[{ key: "leads", label: "Leads", value: 1240 }, …]} />
 * ```
 */
export const Funnel = /*#__PURE__*/ React.forwardRef<HTMLDivElement, FunnelProps>(function Funnel(
  { steps, orientation = "horizontal", format = "integer", amountFormat = "currency", show = ["conversion", "dropoff"], color = "chart-1", compareTo, onStepClick, size = "md", loading, title, labels, className, style, ...props },
  ref,
) {
  const f = useFormat();
  const t = useLabels("funnel", funnelLabels, labels);
  const first = steps[0]?.value ?? 0;
  const max = Math.max(first, ...steps.map((s) => s.value), 1);
  const base = resolveChartColor(color);

  if (process.env.NODE_ENV !== "production") {
    steps.forEach((s, i) => {
      if (i > 0 && s.value > steps[i - 1]!.value) console.warn(`[vamos-ui] Funnel: stage "${s.key}" is larger than the stage before it.`);
    });
  }

  if (loading)
    return (
      <div ref={ref} aria-busy className={cn("grid gap-3", className)} {...props}>
        <span role="status" className="sr-only">
          {t("loading")}
        </span>
        {[100, 72, 48, 30, 18].map((w, i) => (
          <div key={i} className="grid gap-1.5">
            <Skeleton shape="text" className="w-24 text-[13px]" />
            <Skeleton className="h-6" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    );

  if (!steps.length) return <p className={cn("py-6 text-center text-[13px] text-fg-muted", className)}>{t("empty")}</p>;

  const pct = (v: number) => f.percent(v, { maximumFractionDigits: v < 0.1 ? 1 : 0 });
  const prevSteps = compareTo ? new Map(compareTo.map((s, i) => [s.key, { step: s, prev: compareTo[i - 1] }])) : null;

  return (
    <div ref={ref} data-slot="funnel" data-orientation={orientation} data-size={size} className={cn("vui-funnel @container", className)} style={style} {...props}>
      <ol aria-label={title} className="vui-funnel-list" style={{ "--funnel-n": steps.length } as React.CSSProperties}>
        {steps.map((s, i) => {
          const prev = steps[i - 1];
          const conv = prev ? (prev.value > 0 ? s.value / prev.value : null) : null;
          const overall = first > 0 ? s.value / first : null;
          const drop = prev ? prev.value - s.value : 0;
          const valueText = formatValue(f, format, s.value);
          const convText = conv === null ? "—" : pct(conv);
          const fade = steps.length > 1 ? 100 - (i / (steps.length - 1)) * 52 : 100;
          const fill = `color-mix(in oklch, ${base} ${fade}%, var(--surface-solid, var(--surface)))`;
          const cmp = prevSteps?.get(s.key);
          const prevConv = cmp?.prev && cmp.prev.value > 0 ? cmp.step.value / cmp.prev.value : null;
          const convDelta = conv !== null && prevConv !== null ? conv - prevConv : null;
          const deltaText = convDelta === null ? null : `${convDelta >= 0 ? "+" : "−"}${t("points", { value: f.number(Math.abs(convDelta) * 100, { maximumFractionDigits: 1 }) })}`;
          const srText = [
            prev ? t("stageWithConversion", { label: s.label, value: valueText, percent: convText, previous: prev.label }) : t("stage", { label: s.label, value: valueText }),
            s.amount !== undefined ? formatValue(f, amountFormat, s.amount) : null,
            deltaText ? t("compare", { delta: deltaText }) : null,
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <li key={s.key} className="vui-funnel-step group/step relative">
              <div className="vui-funnel-head flex min-w-0 items-baseline justify-between gap-3">
                {s.href ? (
                  <a href={s.href} aria-label={srText} className="truncate rounded-ui-sm text-[13px] text-fg focus-ring after:absolute after:inset-0 hover:underline hover:underline-offset-4">
                    {s.label}
                  </a>
                ) : onStepClick ? (
                  <button type="button" aria-label={srText} onClick={() => onStepClick(s)} className="truncate rounded-ui-sm text-start text-[13px] text-fg focus-ring after:absolute after:inset-0 group-hover/step:underline group-hover/step:underline-offset-4">
                    {s.label}
                  </button>
                ) : (
                  <span className="truncate text-[13px] text-fg">
                    <span aria-hidden>{s.label}</span>
                    <span className="sr-only">{srText}</span>
                  </span>
                )}
                <span aria-hidden className="vui-funnel-value font-mono text-fg tabular">
                  {valueText}
                </span>
              </div>
              <div aria-hidden className="vui-funnel-track">
                <div className="vui-funnel-fill" style={{ "--p": Math.max(1.5, (s.value / max) * 100), background: fill } as React.CSSProperties} />
                {cmp ? <div className="vui-funnel-marker" style={{ "--p": Math.min(100, (cmp.step.value / Math.max(max, compareTo?.[0]?.value ?? 0)) * 100) } as React.CSSProperties} /> : null}
              </div>
              <div aria-hidden className="vui-funnel-meta flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[11.5px] text-fg-muted tabular">
                {s.amount !== undefined ? <span className="text-fg">{formatValue(f, amountFormat, s.amount, { compact: true })}</span> : null}
                {prev && show.includes("conversion") ? (
                  <span className="inline-flex items-center gap-1 text-fg" title={t("conversion", { percent: convText, previous: prev.label })}>
                    <CornerDownRight className="size-3 text-fg-subtle" />
                    {convText}
                  </span>
                ) : null}
                {prev && show.includes("dropoff") && drop > 0 ? <span className="text-fg-subtle">{t("dropoff", { count: formatValue(f, format, drop) })}</span> : null}
                {i > 0 && show.includes("overall") && overall !== null ? <span className="text-fg-subtle">{t("overall", { percent: pct(overall) })}</span> : null}
                {deltaText ? <span className={cn(convDelta! >= 0 ? "text-success" : "text-danger")}>{deltaText}</span> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
});
