"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { Progress } from "./progress";
import { daysUntil } from "./goal-meter-days";

export const goalMeterLabels = {
  /** Accessible name of the bar (goal variant). */
  meter: "Raised towards the goal",
  /** Accessible name of the bar (stock variant). */
  stockMeter: "Stock left",
  of: "of {goal}",
  /** `aria-valuetext` and screen-reader summary (goal variant). */
  valueText: "{value} of {goal} raised, {percent}",
  percent: "{percent}",
  backers: "{count, plural, one {# backer} other {# backers}}",
  ends: "Ends {date}",
  ended: "Ended {date}",
  daysLeft: "{count, plural, one {# day left} other {# days left}}",
  lastDay: "Last day",
  reached: "Goal reached",
  /** Stock variant: "12 of 40 left". */
  left: "{value} of {total} left",
  soldOut: "Sold out",
  low: "Almost gone",
};
export type GoalMeterLabels = typeof goalMeterLabels;

export interface GoalMeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Raised so far (goal variant) or units left (stock variant). */
  value: number;
  /** The goal (goal variant) or the run / starting stock (stock variant). */
  goal: number;
  /** `"goal"` (default): raised against a target, with backers and a deadline. `"stock"`: units left of a run, warning when low. */
  variant?: "goal" | "stock";
  /** Eyebrow above the figure: the campaign or product name. */
  label?: React.ReactNode;
  /** Number of backers, donors, pledges or orders. */
  backers?: number;
  /** End date (ISO date or instant). Shows "Ends …" and, once mounted or with `now`, the days left. */
  deadline?: string | Date;
  /** Reference time for the days left. Default: the browser clock after hydration (the server renders the date only). */
  now?: string | Date | number;
  /** How amounts read. Default `"currency"` for the goal variant, `"number"` for stock. */
  format?: "currency" | "number" | ((value: number) => string);
  currency?: string;
  /** Stock variant: at or below this share of the run the bar turns warning. Default 0.2. */
  lowAt?: number;
  /** `"compact"`: one-line figure, smaller type — for cards and heroes. */
  size?: "default" | "compact";
  /** Extra line under the meter (the promise, the rules). */
  footer?: React.ReactNode;
  labels?: Partial<GoalMeterLabels>;
}

// Server-safe: the date math lives in its own module so server components can call daysUntil().
export { daysUntil } from "./goal-meter-days";

/**
 * Progress toward a goal with its context: raised against the target, the share, backers and the
 * deadline with days left — a fundraising campaign, a pre-order threshold, a membership drive.
 * The stock variant reads the same bar as units left of a run ("12 of 40 left"), turning warning
 * when low and "Sold out" at zero. Built on Progress (`role="progressbar"`, localized value text).
 *
 * ```tsx
 * <GoalMeter label="Spring campaign" value={182400} goal={250000} backers={612} deadline="2026-12-31" />
 * <GoalMeter variant="stock" value={12} goal={40} size="compact" />
 * ```
 */
export const GoalMeter = /*#__PURE__*/ React.forwardRef<HTMLDivElement, GoalMeterProps>(function GoalMeter(
  { value, goal, variant = "goal", label, backers, deadline, now: nowProp, format, currency, lowAt = 0.2, size = "default", footer, labels, className, ...props },
  ref,
) {
  const t = useLabels("goalMeter", goalMeterLabels, labels);
  const f = useFormat();
  const [clock, setClock] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (nowProp == null && deadline != null) setClock(Date.now());
  }, [nowProp, deadline]);
  const now = nowProp ?? clock;
  const stock = variant === "stock";
  const fmt = format ?? (stock ? "number" : "currency");
  const amount = (n: number) => (typeof fmt === "function" ? fmt(n) : fmt === "number" ? f.number(n) : f.currency(n, currency ?? f.currencyCode, { maximumFractionDigits: 0 }));
  const safeGoal = goal > 0 ? goal : 1;
  const ratio = Math.max(0, value) / safeGoal;
  const percent = f.percent(ratio, { maximumFractionDigits: 0 });
  const soldOut = stock && value <= 0;
  const low = stock && !soldOut && ratio <= lowAt;
  const compact = size === "compact";

  const valueText = stock ? (soldOut ? t("soldOut") : t("left", { value: amount(value), total: amount(goal) })) : t("valueText", { value: amount(value), goal: amount(goal), percent });

  let timing: string | null = null;
  if (deadline != null) {
    const date = f.date(deadline instanceof Date ? deadline.toISOString() : deadline, { day: "numeric", month: "long" });
    if (now == null) timing = t("ends", { date });
    else {
      const days = daysUntil(deadline, now);
      timing = days < 0 ? t("ended", { date }) : days === 0 ? t("lastDay") : `${t("daysLeft", { count: days })} · ${t("ends", { date })}`;
    }
  }

  return (
    <div ref={ref} data-slot="goal-meter" data-variant={variant} data-state={soldOut ? "sold-out" : low ? "low" : !stock && ratio >= 1 ? "reached" : undefined} className={cn("grid min-w-0", compact ? "gap-1.5" : "gap-3", className)} {...props}>
      {label ? <p className={cn("m-0 font-medium text-fg-muted", compact ? "text-xs" : "text-xs tracking-[0.08em] uppercase")}>{label}</p> : null}
      <p className="m-0 flex flex-wrap items-baseline gap-x-2" aria-hidden="true">
        {stock ? (
          <span className={cn("font-mono font-semibold tabular", compact ? "text-sm" : "text-2xl", soldOut ? "text-fg-muted" : low ? "text-warning" : "text-fg")}>{soldOut ? t("soldOut") : t("left", { value: amount(value), total: amount(goal) })}</span>
        ) : (
          <>
            <span className={cn("font-mono font-semibold text-fg tabular", compact ? "text-lg" : "text-[2rem] leading-none")}>{amount(value)}</span>
            <span className="text-small text-fg-muted">{t("of", { goal: amount(goal) })}</span>
          </>
        )}
      </p>
      <Progress value={Math.max(0, value)} max={safeGoal} size={compact ? "sm" : "md"} tone={stock ? (soldOut ? "danger" : low ? "warning" : "accent") : "accent"} aria-label={stock ? t("stockMeter") : t("meter")} valueText={valueText} />
      {!stock || low || timing ? (
        <p className="m-0 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-fg-muted tabular">
          <span>
            {stock ? (
              low ? <span className="font-medium text-warning">{t("low")}</span> : null
            ) : (
              <>
                {ratio >= 1 ? <span className="me-1 font-medium text-success">{t("reached")} ·</span> : null}
                {backers != null ? `${t("backers", { count: backers })} · ` : ""}
                {t("percent", { percent })}
              </>
            )}
          </span>
          {timing ? <span data-slot="goal-meter-timing">{timing}</span> : null}
        </p>
      ) : null}
      {footer ? <div className={cn("text-small text-fg-muted", !compact && "border-t border-line pt-3")}>{footer}</div> : null}
    </div>
  );
});
