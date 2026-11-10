"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../lib/cn";
import { useFormat, useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { getCollator } from "../lib/text";
import { Skeleton } from "../components/skeleton";
import { chartLabels, type ChartLabels } from "./chart-shell";
import { formatValue, resolveChartColor, type ChartColor, type FormatSpec } from "./utils";

export interface BarListItem {
  key: string;
  label: React.ReactNode;
  /** Plain-text label for sorting and the accessible row text, when `label` is not a string. */
  textLabel?: string;
  value: number;
  href?: string;
  icon?: React.ReactNode;
  /** Change vs the previous period, as a ratio (`0.12` → "+12%"). */
  delta?: number;
}

export interface BarListProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "onClick"> {
  data: BarListItem[];
  format?: FormatSpec;
  /** Bar colour token. Default: the accent tint (`accent-soft`). */
  color?: ChartColor;
  /** Show the top N; the rest become "Other (12)". */
  max?: number;
  sort?: "desc" | "asc" | "none";
  /** Adds each row's share of the total. */
  showShare?: boolean;
  /** Row activation. Rows with `href` render as links instead. */
  onItemClick?: (item: BarListItem) => void;
  size?: "sm" | "md";
  /** `filled` puts the label on the bar; `track` draws a thin bar under the label. */
  variant?: "filled" | "track";
  loading?: boolean;
  /** Rows of the loading skeleton. Default 5. */
  loadingRows?: number;
  /** Shown when `data` is empty. */
  emptyMessage?: React.ReactNode;
  labels?: Partial<ChartLabels>;
  /** Accessible name of the list. */
  "aria-label"?: string;
}

const textOf = (item: BarListItem) => item.textLabel ?? (typeof item.label === "string" ? item.label : item.key);

/**
 * A ranked list with proportional bars — top pages, lead sources, referrers. Plain DOM (no chart
 * library), so it is cheap enough for every dashboard card.
 *
 * ```tsx
 * <BarList aria-label="Top sources" data={[{ key: "google", label: "Google", value: 4120 }]} showShare />
 * ```
 */
export const BarList = React.forwardRef<HTMLOListElement, BarListProps>(function BarList(
  { data, format = "number", color, max, sort = "desc", showShare, onItemClick, size = "md", variant = "filled", loading, loadingRows = 5, emptyMessage, labels, className, ...props },
  ref,
) {
  const f = useFormat();
  const { locale } = useLocale();
  const t = useLabels("chart", chartLabels, labels);

  const rows = React.useMemo(() => {
    const collator = getCollator(locale);
    const sorted = sort === "none" ? [...data] : [...data].sort((a, b) => (sort === "desc" ? b.value - a.value : a.value - b.value) || collator.compare(textOf(a), textOf(b)));
    if (max && sorted.length > max) {
      const rest = sorted.slice(max);
      const other: BarListItem = { key: "__other", label: t("otherCount", { count: rest.length }), value: rest.reduce((s, r) => s + r.value, 0) };
      return [...sorted.slice(0, max), other];
    }
    return sorted;
  }, [data, sort, max, locale, t]);

  const total = rows.reduce((s, r) => s + Math.max(0, r.value), 0);
  const top = rows.reduce((m, r) => Math.max(m, r.value), 0) || 1;
  const rowH = size === "sm" ? "h-7" : "h-8";
  const barColor = color ? resolveChartColor(color) : undefined;

  if (loading)
    return (
      <div aria-busy className={cn("grid gap-1.5", className)}>
        <span role="status" className="sr-only">
          {t("loading")}
        </span>
        {Array.from({ length: loadingRows }, (_, i) => (
          <Skeleton key={i} className={cn(rowH)} style={{ width: `${96 - i * (70 / loadingRows)}%` }} />
        ))}
      </div>
    );

  if (!rows.length) return <p className={cn("py-6 text-center text-[13px] text-fg-muted", className)}>{emptyMessage ?? t("empty")}</p>;

  return (
    <ol ref={ref} data-slot="bar-list" data-variant={variant} className={cn("vui-bar-list grid gap-1", size === "sm" ? "text-[12.5px]" : "text-[13px]", className)} {...props}>
      {rows.map((item) => {
        const width = `${Math.max(0, (item.value / top) * 100)}%`;
        const valueText = formatValue(f, format, item.value);
        const share = total ? f.percent(item.value / total) : undefined;
        const deltaText = item.delta !== undefined ? `${item.delta >= 0 ? "+" : "−"}${f.percent(Math.abs(item.delta))}` : undefined;
        const srText = [textOf(item), valueText, showShare ? share : undefined, deltaText].filter(Boolean).join(", ");
        const isOther = item.key === "__other";
        const interactive = Boolean(item.href || (onItemClick && !isOther));
        const inner = (
          <>
            {variant === "filled" ? (
              <span
                aria-hidden
                className={cn("vui-bar-list-bar absolute inset-y-0 start-0 rounded-ui-sm", !barColor && "bg-accent-soft", isOther && "opacity-60")}
                style={{ width, ...(barColor ? { background: `color-mix(in oklch, ${barColor} 24%, transparent)` } : null) }}
              />
            ) : null}
            <span className="relative flex min-w-0 flex-1 items-center gap-2 ps-2.5">
              {item.icon ? <span className="flex size-4 shrink-0 items-center justify-center [&>img]:size-4 [&>img]:rounded-[3px] [&>svg]:size-3.5 text-fg-muted">{item.icon}</span> : null}
              <span className={cn("truncate", isOther ? "text-fg-muted" : "text-fg")} title={textOf(item)}>
                {item.label}
              </span>
            </span>
            {variant === "track" ? (
              <span aria-hidden className="absolute inset-x-2.5 bottom-0.5 h-1 overflow-hidden rounded-full bg-track">
                <span className={cn("block h-full rounded-full", !barColor && "bg-accent-ink")} style={{ width, ...(barColor ? { background: barColor } : null) }} />
              </span>
            ) : null}
            <span className="relative flex shrink-0 items-center gap-3 pe-2.5 font-mono text-[12.5px] tabular">
              {item.delta !== undefined ? <BarListDelta value={item.delta} format={(v) => f.percent(Math.abs(v))} /> : null}
              <span className="text-fg">{valueText}</span>
              {showShare ? <span className="w-11 text-end text-fg-subtle">{share}</span> : null}
            </span>
          </>
        );
        const rowClass = cn("relative flex w-full items-center gap-3 rounded-ui-sm text-start", rowH, variant === "track" && "pb-1.5");
        return (
          <li key={item.key} className="relative">
            {interactive ? null : <span className="sr-only">{srText}</span>}
            {item.href ? (
              <a href={item.href} aria-label={srText} className={cn(rowClass, "transition-colors focus-ring hover:bg-hover")}>
                {inner}
              </a>
            ) : onItemClick && !isOther ? (
              <button type="button" aria-label={srText} onClick={() => onItemClick(item)} className={cn(rowClass, "transition-colors focus-ring hover:bg-hover")}>
                {inner}
              </button>
            ) : (
              <div aria-hidden className={rowClass}>
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
});

function BarListDelta({ value, format }: { value: number; format: (v: number) => string }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11.5px]", up ? "text-success" : "text-danger")}>
      <Icon aria-hidden className="size-3" />
      {up ? "+" : "−"}
      {format(value)}
    </span>
  );
}
