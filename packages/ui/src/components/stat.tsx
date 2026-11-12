import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { DataLabel, DeltaText, StatGoalText, ValueText } from "../lib/data-islands";
import type { statLabels } from "../lib/data-islands";
import type { ValueFormat } from "../lib/value-format";
import { cardVariants } from "./card";
import { Skeleton } from "./skeleton";
import { Sparkline, sparklineDirection } from "./sparkline";

export type { ValueFormat } from "../lib/value-format";

/** Which direction is good news. Decides the delta colour, never the arrow. */
export type StatIntent = "higher-is-better" | "lower-is-better" | "neutral";
export type StatLabels = Partial<typeof statLabels>;

/* ------------------------------------------------------------------ */
/* Delta                                                                */
/* ------------------------------------------------------------------ */

const deltaVariants = /*#__PURE__*/ cva("inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap font-medium leading-none [&_svg]:shrink-0", {
  variants: {
    variant: {
      text: "text-xs [&_svg]:size-3.5",
      badge: "h-5 rounded-full px-1.5 text-[11px] [--tone-mix:16%] glass:[--tone-mix:20%] tone-soft [&_svg]:size-3",
    },
    tone: {
      positive: "tone-success text-success",
      negative: "tone-danger text-danger",
      neutral: "tone-neutral text-fg-muted",
    },
  },
  defaultVariants: { variant: "text", tone: "neutral" },
});

export interface DeltaProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The change. `kind="percent"` takes a ratio: `0.124` → "+12.4%". `null` → "—". */
  value: number | null | undefined;
  /** Default `"percent"`. */
  kind?: "percent" | "number" | "currency";
  /** ISO 4217 code for `kind="currency"`. Default: the LocaleProvider currency. */
  currency?: string;
  /** Default `"higher-is-better"`. With `"lower-is-better"` a drop is green (response time, churn). */
  intent?: StatIntent;
  /** `"text"` (default) or a soft `"badge"`. */
  variant?: "text" | "badge";
  /** Max fraction digits. */
  precision?: number;
  /** Full screen-reader sentence. Default "Up 12.4%" / "Down 4.1%" / "No change". */
  srLabel?: string;
  /** Appended to the spoken text, e.g. "vs last month". */
  comparison?: string;
  labels?: StatLabels;
}

/**
 * A signed change with an arrow and a semantic colour. Arrow + sign carry the meaning, colour
 * only reinforces it. Server-component compatible; also used in table cells and list rows.
 *
 * ```tsx
 * <Delta value={0.124} />                                  // ↗ +12.4%  (green)
 * <Delta value={-0.18} intent="lower-is-better" />          // ↘ −18%    (green: faster replies)
 * <Delta value={1250} kind="currency" variant="badge" />
 * ```
 */
export const Delta = /*#__PURE__*/ React.forwardRef<HTMLSpanElement, DeltaProps>(function Delta(
  { value, kind = "percent", currency, intent = "higher-is-better", variant, precision, srLabel, comparison, labels, className, ...props },
  ref,
) {
  const has = typeof value === "number" && Number.isFinite(value);
  const dir = has ? Math.sign(value) : 0;
  const good = intent === "neutral" || dir === 0 ? 0 : intent === "higher-is-better" ? dir : -dir;
  const tone = good > 0 ? "positive" : good < 0 ? "negative" : "neutral";
  const Icon = dir > 0 ? ArrowUpRight : dir < 0 ? ArrowDownRight : Minus;
  return (
    <span
      ref={ref}
      data-slot="delta"
      data-trend={dir > 0 ? "up" : dir < 0 ? "down" : "flat"}
      data-tone={tone}
      className={cn(deltaVariants({ variant, tone }), className)}
      {...props}
    >
      {has ? (
        <>
          <Icon aria-hidden strokeWidth={2.25} />
          <DeltaText value={value} kind={kind} currency={currency} precision={precision} srLabel={srLabel} srSuffix={comparison} labels={labels} />
        </>
      ) : (
        <>
          <span aria-hidden>—</span>
          <span className="sr-only">
            <DataLabel ns="stat" id="noData" override={labels} />
          </span>
        </>
      )}
    </span>
  );
});

/* ------------------------------------------------------------------ */
/* Stat parts                                                           */
/* ------------------------------------------------------------------ */

const statVariants = /*#__PURE__*/ cva(
  "group/stat relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] content-start items-start gap-x-3 [grid-template-areas:'label_delta'_'value_trend'_'target_target'_'foot_foot']" +
    // without a sparkline the value may use the full width (a wide delta must not squeeze "$3,815,400.00")
    " [&:not(:has([data-slot=stat-trend]))_[data-slot=stat-value]]:[grid-column:1/-1]",
  {
    variants: {
      variant: {
        card: "p-(--stat-p)",
        plain: "p-(--stat-p)",
        inline: "gap-y-0.5",
      },
      size: {
        sm: "[--stat-p:calc(var(--gap)*0.8)] [--stat-value:1.25rem]",
        md: "[--stat-p:var(--gap)] [--stat-value:1.75rem]",
        lg: "[--stat-p:calc(var(--gap)*1.2)] [--stat-value:2.5rem]",
      },
    },
    defaultVariants: { variant: "card", size: "md" },
  },
);

export interface StatProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** What is measured ("Visitors"). */
  label?: React.ReactNode;
  /** Numbers are formatted with `format`; strings are shown as they are ("2:47"); `null` → "—" + "No data". */
  value?: number | string | null;
  /** How a numeric value is formatted. Default `"number"`. */
  format?: ValueFormat;
  /** Change vs the comparison period. See `Delta` (`deltaKind="percent"` takes a ratio). */
  delta?: number | null;
  deltaKind?: DeltaProps["kind"];
  /** Delta as text or soft badge. Default `"text"`. */
  deltaVariant?: DeltaProps["variant"];
  /** Which direction is good. Default `"higher-is-better"`. */
  intent?: StatIntent;
  /** "vs previous 30 days" — shown in the footer and appended to the spoken delta (when a string). */
  comparison?: React.ReactNode;
  /** Mini trend, oldest first. */
  trend?: ReadonlyArray<number | null>;
  /** Default `"line"`. */
  trendVariant?: "line" | "area" | "bars";
  /** Progress-to-goal bar. */
  target?: { value: number; label?: React.ReactNode };
  /** Small icon next to the label (a Lucide icon component). */
  icon?: LucideIcon;
  /** Makes the whole stat a link (drill-down). */
  href?: string;
  /** Skeleton sized to label + value; sets `aria-busy`. */
  loading?: boolean;
  /** Error message in place of the value. */
  error?: React.ReactNode;
  /** Slot next to the error (e.g. a Retry button — only when the Stat is not a link). */
  errorAction?: React.ReactNode;
  /** `card` (own surface), `plain` (a cell inside StatGroup/Card) or `inline` (no padding). Default `"card"`. */
  variant?: "card" | "plain" | "inline";
  /** Value size 20 / 28 / 40px. Default `"md"`. */
  size?: "sm" | "md" | "lg";
  labels?: StatLabels;
}

/**
 * One metric: label, value, change and a mini trend. Renders a `<dl>` (label = `dt`, value and
 * change = `dd`); the sparkline is decorative and summarised for screen readers. Server-component
 * compatible — no chart library, no count-up animation.
 *
 * ```tsx
 * <Stat label="Visitors" value={28412} delta={0.124} trend={[4, 6, 5, 8, 7, 9, 12, 11, 14]} comparison="vs previous 30 days" />
 * <Stat label="Avg. response" value={4320} format="duration" delta={-0.18} intent="lower-is-better" />
 * ```
 *
 * Compose for custom layouts: `<Stat><StatLabel/><StatValue/><StatDelta/><StatTrend/><StatFooter/></Stat>`.
 */
export const Stat = /*#__PURE__*/ React.forwardRef<HTMLElement, StatProps>(function Stat(
  {
    label,
    value,
    format,
    delta,
    deltaKind = "percent",
    deltaVariant,
    intent = "higher-is-better",
    comparison,
    trend,
    trendVariant = "line",
    target,
    icon: Icon,
    href,
    loading,
    error,
    errorAction,
    variant = "card",
    size = "md",
    labels,
    className,
    children,
    ...props
  },
  ref,
) {
  const trendId = React.useId();
  const dir = trend ? sparklineDirection(trend) : 0;
  const good = intent === "neutral" || dir === 0 ? 0 : intent === "higher-is-better" ? dir : -dir;
  const count = trend ? trend.filter((v) => typeof v === "number").length : 0;

  let content: React.ReactNode = children;
  if (children === undefined) {
    content = loading ? (
      <>
        <dt className="[grid-area:label]">
          <Skeleton shape="text" className="h-3 w-24" />
          <span className="sr-only">{label}</span>
        </dt>
        <dd className="mt-3 [grid-area:value]">
          <Skeleton className="h-(--stat-value) w-28" />
          <span className="sr-only">
            <DataLabel ns="stat" id="noData" override={labels} />
          </span>
        </dd>
      </>
    ) : (
      <>
        <StatLabel>
          {Icon ? <Icon aria-hidden className="size-3.5 shrink-0 text-fg-subtle" /> : null}
          {label}
        </StatLabel>
        {error ? (
          <dd data-slot="stat-error" className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-danger [grid-column:1/-1] [grid-row:2]">
            <span>{error}</span>
            {errorAction}
          </dd>
        ) : (
          <StatValue value={value} format={format} labels={labels} describedBy={trend && count > 1 ? trendId : undefined} />
        )}
        {!error && delta !== undefined ? (
          <StatDelta>
            <Delta value={delta} kind={deltaKind} intent={intent} variant={deltaVariant} labels={labels} comparison={typeof comparison === "string" ? comparison : undefined} />
          </StatDelta>
        ) : null}
        {!error && trend && count > 0 ? (
          <StatTrend>
            <Sparkline values={trend} variant={trendVariant} className={good > 0 || (intent === "neutral" && dir !== 0) ? "text-accent-ink" : "text-fg-subtle"} showLast={trendVariant === "bars"} />
            <span id={trendId} className="sr-only">
              <DataLabel ns="stat" id={dir > 0 ? "trendUp" : dir < 0 ? "trendDown" : "trendFlat"} override={labels} vars={{ count }} />
            </span>
          </StatTrend>
        ) : null}
        {!error && target && typeof value === "number" ? <StatTarget value={value} target={target.value} label={target.label} format={format} labels={labels} /> : null}
        {comparison && !error ? <StatFooter>{comparison}</StatFooter> : null}
      </>
    );
  }

  const classes = cn(
    statVariants({ variant, size }),
    variant === "card" && !href && "surface rounded-ui-lg",
    className,
  );

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        data-slot="stat-link"
        className={cn(
          "block min-w-0 rounded-ui-lg",
          variant === "card" ? cardVariants({ variant: "surface", interactive: true }) : "transition-colors hover:bg-hover focus-ring",
        )}
      >
        <dl data-slot="stat" data-variant={variant} aria-busy={loading || undefined} className={classes} {...(props as React.HTMLAttributes<HTMLDListElement>)}>
          {content}
        </dl>
      </a>
    );
  }
  return (
    <dl ref={ref as React.Ref<HTMLDListElement>} data-slot="stat" data-variant={variant} aria-busy={loading || undefined} className={classes} {...(props as React.HTMLAttributes<HTMLDListElement>)}>
      {content}
    </dl>
  );
});

/** The metric name (`<dt>`). */
export function StatLabel({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <dt data-slot="stat-label" className={cn("flex min-w-0 items-center gap-1.5 text-[13px] leading-5 text-fg-muted [grid-area:label]", className)} {...props} />;
}

export interface StatValueProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  value?: number | string | null;
  format?: ValueFormat;
  /** Id of a text that describes the value (the trend summary). */
  describedBy?: string;
  labels?: StatLabels;
  children?: React.ReactNode;
}

/** The big number (`<dd>`): mono, tabular, sized by the Stat `size`. */
export function StatValue({ value, format, describedBy, labels, className, children, ...props }: StatValueProps) {
  const empty = children === undefined && (value === null || value === undefined || value === "");
  return (
    <dd
      data-slot="stat-value"
      aria-describedby={describedBy}
      className={cn(
        "mt-3 min-w-0 self-end truncate font-mono text-(length:--stat-value) leading-none font-medium tracking-[-0.03em] text-fg tabular [grid-area:value]",
        empty && "text-fg-subtle",
        className,
      )}
      {...props}
    >
      {children ?? (empty ? (
        <>
          <span aria-hidden>—</span>
          <span className="sr-only">
            <DataLabel ns="stat" id="noData" override={labels} />
          </span>
        </>
      ) : typeof value === "number" || (format && typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) ? (
        <ValueText value={value} format={format} />
      ) : (
        value
      ))}
    </dd>
  );
}

/** Wrapper (`<dd>`) for a Delta at the top end. */
export function StatDelta({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <dd data-slot="stat-delta" className={cn("flex justify-end leading-5 [grid-area:delta]", className)} {...props} />;
}

/** Wrapper (`<dd>`) for the mini trend at the bottom end. */
export function StatTrend({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <dd data-slot="stat-trend" className={cn("mt-3 flex items-end justify-end self-end [grid-area:trend]", className)} {...props} />;
}

/** Secondary line under the value ("vs previous 30 days"). */
export function StatFooter({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <dd data-slot="stat-footer" className={cn("mt-3 text-xs text-fg-subtle [grid-area:foot]", className)} {...props} />;
}

export interface StatTargetProps {
  value: number;
  target: number;
  /** Caption override; default "Goal $46,800" + percent. */
  label?: React.ReactNode;
  format?: ValueFormat;
  labels?: StatLabels;
  className?: string;
}

/** Progress-to-goal bar under the value. Turns success-coloured once the goal is reached. */
export function StatTarget({ value, target, label, format, labels, className }: StatTargetProps) {
  const ratio = target > 0 ? Math.max(0, value / target) : 0;
  const reached = ratio >= 1;
  return (
    <dd data-slot="stat-target" data-reached={reached ? "" : undefined} className={cn("mt-4 [grid-area:target]", className)}>
      <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-track">
        <div className={cn("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", reached ? "bg-success" : "bg-accent")} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
      </div>
      <div className="mt-2 flex justify-between gap-3 text-xs text-fg-subtle">
        {label ? (
          <>
            <span>{label}</span>
            <span className="tabular">{Math.round(ratio * 100)}%</span>
          </>
        ) : (
          <StatGoalText value={value} target={target} format={format} labels={labels} />
        )}
      </div>
    </dd>
  );
}

/* ------------------------------------------------------------------ */
/* Group                                                                */
/* ------------------------------------------------------------------ */

export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max columns; fewer on narrow containers (container queries). Default 4. */
  columns?: 2 | 3 | 4;
  /**
   * `"cards"` (default): separate Stat cards with a gap.
   * `"plain"`: one surface with hairline dividers — put `variant="plain"` Stats inside.
   */
  variant?: "cards" | "plain";
}

const columnClasses = {
  2: "@md:grid-cols-2",
  3: "@md:grid-cols-2 @3xl:grid-cols-3",
  4: "@md:grid-cols-2 @4xl:grid-cols-4",
} as const;

/**
 * A responsive row of Stats. Columns follow the container width, not the viewport, so the same
 * row works in a page, a sheet or a dashboard widget.
 */
export const StatGroup = /*#__PURE__*/ React.forwardRef<HTMLDivElement, StatGroupProps>(function StatGroup({ columns = 4, variant = "cards", className, children, ...props }, ref) {
  return (
    <div ref={ref} data-slot="stat-group" className={cn("@container", className)} {...props}>
      <div
        className={cn(
          "grid grid-cols-1",
          columnClasses[columns],
          variant === "cards" ? "gap-(--gap)" : "surface overflow-hidden rounded-ui-lg [&>*]:shadow-[-1px_-1px_0_0_var(--line)]",
        )}
      >
        {children}
      </div>
    </div>
  );
});

