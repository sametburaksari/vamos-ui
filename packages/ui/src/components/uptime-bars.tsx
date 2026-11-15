"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { TooltipContent, TooltipRoot, TooltipTrigger } from "./tooltip";

export type UptimeStatus = "operational" | "degraded" | "partial" | "major" | "maintenance" | "none";

export const uptimeBarsLabels = {
  operational: "Operational",
  degraded: "Degraded performance",
  partial: "Partial outage",
  major: "Major outage",
  maintenance: "Maintenance",
  none: "No data",
  uptime: "{value} uptime",
  rowLabel: "{name}, uptime history",
  start: "{count, plural, one {# day ago} other {# days ago}}",
  end: "Today",
  legend: "Legend",
  selectHint: "Click or press Enter for details",
};
export type UptimeBarsLabels = typeof uptimeBarsLabels;

/** One period (usually a day) of `UptimeBars`. */
export interface UptimeBar {
  /** `"YYYY-MM-DD"` or an ISO instant — formatted with `dateFormat` unless `label` is set. */
  date: string;
  status: UptimeStatus;
  /** Uptime of the period, 0–100. Missing counts as 100 in the summary (except `"none"`). */
  uptime?: number;
  /** Period name instead of the formatted date ("Week 42"). */
  label?: string;
  /** Short plain text — read by screen readers and shown in the tooltip ("Delayed deliveries"). */
  note?: string;
  /** Extra tooltip content (incident links, counts). Not part of the accessible name — repeat key facts in `note`. */
  details?: React.ReactNode;
  /** With `onBarSelect`: `false` makes this bar inert. Default `true`. */
  selectable?: boolean;
}

/** Status token per state — the fill colour of the bar and the legend swatch. */
const fill: Record<UptimeStatus, string> = {
  operational: "bg-success",
  degraded: "bg-warning",
  partial: "bg-warning",
  major: "bg-danger",
  maintenance: "bg-info",
  none: "bg-track",
};

/**
 * Height per state, so the severity reads without colour (grey scale, colour blindness):
 * bad days dip. Maintenance is full height but hatched; "no data" is a dashed outline.
 */
const height: Record<UptimeStatus, string> = {
  operational: "h-full",
  degraded: "h-[78%]",
  partial: "h-[58%]",
  major: "h-[38%]",
  maintenance: "h-full",
  none: "h-full",
};

const hatch = "bg-[repeating-linear-gradient(135deg,transparent_0_2px,color-mix(in_srgb,var(--surface)_55%,transparent)_2px_4px)]";

function Swatch({ status, severity, className }: { status: UptimeStatus; severity: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("relative flex h-3 w-1.5 shrink-0 items-end", className)}>
      <span
        className={cn(
          "w-full rounded-[1px]",
          severity ? height[status] : "h-full",
          status === "none" ? "border border-dashed border-field-border bg-transparent" : fill[status],
          status === "maintenance" && hatch,
        )}
      />
    </span>
  );
}

/** Mean uptime (0–100) over the bars that have data. `null` when none has. */
export function uptimePercent(bars: readonly UptimeBar[]): number | null {
  const withData = bars.filter((b) => b.status !== "none");
  if (!withData.length) return null;
  return withData.reduce((s, b) => s + (b.uptime ?? 100), 0) / withData.length;
}

export interface UptimeLegendProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Which states to list. Default: operational, degraded, partial, major, maintenance, none. */
  statuses?: UptimeStatus[];
  /** Match the bars' severity heights. Default `true`. */
  severity?: boolean;
  labels?: Partial<UptimeBarsLabels>;
}

/** The key for one or more `UptimeBars` rows — put it once above a list of services. */
export const UptimeLegend = /*#__PURE__*/ React.forwardRef<HTMLUListElement, UptimeLegendProps>(function UptimeLegend(
  { statuses = ["operational", "degraded", "partial", "major", "maintenance", "none"], severity = true, labels, className, ...props },
  ref,
) {
  const t = useLabels("uptimeBars", uptimeBarsLabels, labels);
  return (
    <ul ref={ref} aria-label={t("legend")} data-slot="uptime-legend" className={cn("m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-fg-muted", className)} {...props}>
      {statuses.map((s) => (
        <li key={s} className="inline-flex items-center gap-1.5">
          <Swatch status={s} severity={severity} />
          {t(s)}
        </li>
      ))}
    </ul>
  );
});

export interface UptimeBarsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Periods, oldest first. */
  bars: UptimeBar[];
  /** What is measured ("REST API") — names the row for screen readers. */
  name: string;
  /** Summary figure, 0–100. Default: `uptimePercent(bars)`. */
  uptime?: number;
  /** Fraction digits of the uptime figures. Default `2`. */
  precision?: number;
  /** Date format for the tooltip and accessible names (preset or Intl options). Default `"medium"`. */
  dateFormat?: Parameters<ReturnType<typeof useFormat>["date"]>[1];
  /** Called on click / Enter on a selectable bar. Without it bars only show details. */
  onBarSelect?: (bar: UptimeBar, index: number) => void;
  /** Bars dip by severity so state is not colour-only. Default `true`. */
  severity?: boolean;
  /** Start / summary / end line under the bars. Default `true`. */
  summary?: boolean;
  /** Text at the start of the summary. Default: "{count} days ago" for `bars.length`. */
  startLabel?: React.ReactNode;
  /** Text at the end of the summary. Default: "Today". */
  endLabel?: React.ReactNode;
  /** Show a legend under the row (use `UptimeLegend` once for a list of rows instead). */
  legend?: boolean;
  labels?: Partial<UptimeBarsLabels>;
}

/**
 * Per-period status bars for one service — the uptime row of a status page or health panel.
 * Hover or focus a bar for its date, state and uptime; one tab stop per row, arrow keys /
 * Home / End move between bars (RTL aware), Esc hides the tooltip, Enter selects.
 *
 * ```tsx
 * <UptimeBars name="REST API" bars={days} onBarSelect={(d) => openIncident(d.date)} />
 * ```
 */
export const UptimeBars = /*#__PURE__*/ React.forwardRef<HTMLDivElement, UptimeBarsProps>(function UptimeBars(
  { bars, name, uptime, precision = 2, dateFormat = "medium", onBarSelect, severity = true, summary = true, startLabel, endLabel, legend, labels, className, ...props },
  ref,
) {
  const t = useLabels("uptimeBars", uptimeBarsLabels, labels);
  const f = useFormat();
  const uid = React.useId();
  const last = bars.length - 1;
  const [focusIndex, setFocusIndex] = React.useState(last);
  const [active, setActive] = React.useState<number | null>(null);
  const barRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const rowRef = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    if (focusIndex > last) setFocusIndex(Math.max(0, last));
  }, [focusIndex, last]);

  // One tooltip per row, moved over the active bar.
  React.useLayoutEffect(() => {
    if (active === null) return;
    const bar = barRefs.current[active];
    const row = rowRef.current;
    if (!bar || !row) return;
    const b = bar.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    const rtl = getComputedStyle(row).direction === "rtl";
    setOffset(rtl ? r.right - b.right + b.width / 2 : b.left - r.left + b.width / 2);
  }, [active]);

  const pct = (v: number) => f.percent(v / 100, { minimumFractionDigits: precision, maximumFractionDigits: precision });
  const total = uptime ?? uptimePercent(bars);
  const periodName = (b: UptimeBar) => b.label ?? f.date(b.date, dateFormat);
  const describe = (b: UptimeBar) => {
    const parts = [t(b.status)];
    if (b.status !== "none" && b.status !== "maintenance" && b.uptime != null) parts.push(t("uptime", { value: pct(b.uptime) }));
    if (b.note) parts.push(b.note);
    return parts.join(" · ");
  };
  const isSelectable = (b: UptimeBar) => Boolean(onBarSelect) && b.selectable !== false;

  const move = (to: number) => {
    const i = Math.max(0, Math.min(last, to));
    setFocusIndex(i);
    setActive(i);
    barRefs.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step = getComputedStyle(e.currentTarget).direction === "rtl" ? -1 : 1;
    if (e.key === "ArrowRight") move(i + step);
    else if (e.key === "ArrowLeft") move(i - step);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(last);
    else if (e.key === "Escape" && active !== null) setActive(null);
    else return;
    e.preventDefault();
  };

  const bar = active !== null ? bars[active] : undefined;
  const sumId = `${uid}-sum`;

  return (
    <div ref={ref} data-slot="uptime-bars" className={cn("min-w-0", className)} {...props}>
      <TooltipRoot open={bar !== undefined} onOpenChange={() => {}}>
        <TooltipTrigger asChild>
          <div
            ref={rowRef}
            role="group"
            aria-label={t("rowLabel", { name })}
            aria-describedby={summary ? sumId : undefined}
            onPointerLeave={() => setActive(null)}
            className="flex h-9 items-stretch gap-px sm:gap-[3px]"
          >
            {bars.map((b, i) => {
              const selectable = isSelectable(b);
              return (
                <button
                  key={`${b.date}-${i}`}
                  ref={(el) => {
                    barRefs.current[i] = el;
                  }}
                  type="button"
                  data-status={b.status}
                  tabIndex={i === focusIndex ? 0 : -1}
                  aria-label={`${periodName(b)}: ${describe(b)}`}
                  aria-disabled={onBarSelect && !selectable ? true : undefined}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => {
                    setFocusIndex(i);
                    setActive(i);
                  }}
                  onBlur={() => setActive((a) => (a === i ? null : a))}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  onClick={() => {
                    if (selectable) onBarSelect!(b, i);
                  }}
                  className={cn(
                    "group/bar flex min-w-0 flex-1 items-end rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                    selectable ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "w-full rounded-[2px] transition-[opacity,scale] duration-100 motion-reduce:transition-none",
                      severity ? height[b.status] : "h-full",
                      b.status === "none" ? "border border-dashed border-field-border bg-transparent" : fill[b.status],
                      b.status === "maintenance" && hatch,
                      b.status === "operational" && "opacity-80",
                      active === i && "opacity-100 motion-safe:scale-y-[1.08] origin-bottom",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent
          tone="default"
          side="top"
          align="start"
          alignOffset={offset - 128}
          sideOffset={8}
          avoidCollisions
          collisionPadding={12}
          className="w-64 max-w-[calc(100vw-2rem)] p-0"
        >
          {bar ? (
            <span className="grid gap-1.5 px-3 py-2.5 text-start font-normal">
              <span className="text-[12px] font-semibold text-fg">{periodName(bar)}</span>
              <span className="flex items-center gap-2 text-[12px] text-fg-muted">
                <Swatch status={bar.status} severity={severity} />
                {describe(bar)}
              </span>
              {bar.details ? <span className="border-t border-line pt-1.5 text-[12px] text-fg">{bar.details}</span> : null}
              {isSelectable(bar) ? <span className="text-[11px] text-fg-muted">{t("selectHint")}</span> : null}
            </span>
          ) : null}
        </TooltipContent>
      </TooltipRoot>
      {summary ? (
        <div id={sumId} className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-fg-subtle">
          <span>{startLabel ?? t("start", { count: bars.length })}</span>
          <span aria-hidden className="h-px flex-1 bg-line" />
          {total != null ? <span className="text-fg-muted tabular">{t("uptime", { value: pct(total) })}</span> : null}
          {total != null ? <span aria-hidden className="h-px flex-1 bg-line" /> : null}
          <span>{endLabel ?? t("end")}</span>
        </div>
      ) : null}
      {legend ? <UptimeLegend className="mt-2" severity={severity} labels={labels} /> : null}
    </div>
  );
});
