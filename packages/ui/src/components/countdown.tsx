"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { useEventCallback } from "../lib/use-controllable-state";
import { numberFormat } from "../format/core";

export type CountdownUnit = "days" | "hours" | "minutes" | "seconds";

export const countdownLabels = {
  /** Accessible sentence while counting. */
  remaining: "{time} left",
  /** Accessible sentence before the clock starts on the client (server render). */
  until: "Until {date}",
  /** Accessible sentence (and default visible text) once the target is reached. */
  completed: "Time's up",
};
export type CountdownLabels = typeof countdownLabels;

type DateLike = string | number | Date;
const toMs = (v: DateLike) => (v instanceof Date ? v.getTime() : typeof v === "number" ? v : Date.parse(v));

const SIZE: Record<CountdownUnit, number> = { days: 86_400, hours: 3_600, minutes: 60, seconds: 1 };
const INTL_UNIT: Record<CountdownUnit, "day" | "hour" | "minute" | "second"> = { days: "day", hours: "hour", minutes: "minute", seconds: "second" };
const ORDER: CountdownUnit[] = ["days", "hours", "minutes", "seconds"];
const DEFAULT_UNITS: CountdownUnit[] = ORDER;

/**
 * Splits the time left into the chosen units. The largest unit absorbs the overflow
 * (`["hours", "minutes"]` → 50 h 10 min, not 2 d 2 h 10 min); the smallest is floored.
 */
export function countdownParts(target: DateLike, now: number, units: CountdownUnit[] = DEFAULT_UNITS): { values: Partial<Record<CountdownUnit, number>>; total: number; done: boolean } {
  const total = Math.max(0, Math.floor((toMs(target) - now) / 1000));
  const sorted = ORDER.filter((u) => units.includes(u));
  const values: Partial<Record<CountdownUnit, number>> = {};
  let rest = total;
  for (const u of sorted) {
    const n = Math.floor(rest / SIZE[u]);
    values[u] = n;
    rest -= n * SIZE[u];
  }
  return { values, total, done: total === 0 };
}

/** The localized unit word for `n` ("days" / "day" / "gün"), from Intl. */
function unitWord(locale: string, unit: CountdownUnit, n: number, display: "long" | "short" | "narrow") {
  const parts = numberFormat(locale, { style: "unit", unit: INTL_UNIT[unit], unitDisplay: display }).formatToParts(n);
  return parts
    .filter((p) => p.type === "unit")
    .map((p) => p.value)
    .join("")
    .trim();
}

export interface CountdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Target moment (ISO string, epoch ms or Date). */
  to: DateLike;
  /** Fixed "now" (epoch ms) for static screens, tests and screenshots. Omit to tick live. */
  now?: number;
  /** Which units to show, largest first. Default all four. */
  units?: CountdownUnit[];
  /** `"segments"` (default): one box per unit with a caption · `"inline"`: compact text ("3d 04h 12m"). */
  variant?: "segments" | "inline";
  /** Unit caption style under each segment. Default `"long"` ("days"). */
  unitDisplay?: "long" | "short" | "narrow";
  /** Fill the last segment with the accent (segments variant). */
  highlightLast?: boolean;
  /** What is being counted down to, prefixed to the accessible sentence: "Doors open". */
  label?: string;
  /** Shown instead of the clock once the target is reached. Default: the clock at zero. */
  completed?: React.ReactNode;
  /** Called once when the target is reached (also when it is already past on mount). */
  onComplete?: () => void;
  labels?: Partial<CountdownLabels>;
}

/**
 * Counts down to a moment — a launch, a sale ending, an event starting. The server renders
 * dashes and the clock starts after hydration (no mismatch), unless `now` is passed. The visible
 * digits are hidden from screen readers; `role="timer"` carries one sentence at minute
 * precision (seconds only in the last minute), so it never floods a screen reader.
 *
 * ```tsx
 * <Countdown to="2027-03-01T09:00:00+03:00" label="Registration opens" highlightLast />
 * <Countdown variant="inline" units={["hours", "minutes", "seconds"]} to={sale.endsAt} completed="Sale ended" />
 * ```
 */
export const Countdown = /*#__PURE__*/ React.forwardRef<HTMLDivElement, CountdownProps>(function Countdown(
  { to, now: fixedNow, units = DEFAULT_UNITS, variant = "segments", unitDisplay = "long", highlightLast, label, completed, onComplete, labels, className, style, ...props },
  ref,
) {
  const t = useLabels("countdown", countdownLabels, labels);
  const f = useFormat();
  const { locale } = useLocale();
  const target = toMs(to);
  const shown = React.useMemo(() => ORDER.filter((u) => units.includes(u)), [units]);
  const withSeconds = shown.includes("seconds");

  // null until mounted: the server and the first client render agree (dashes).
  const [liveNow, setLiveNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (fixedNow != null) return;
    let id = 0;
    const tick = () => {
      const n = Date.now();
      setLiveNow(n);
      if (n >= target) return;
      const step = withSeconds ? 1000 - (n % 1000) : 60_000 - (n % 60_000);
      id = window.setTimeout(tick, Math.min(step, target - n + 5));
    };
    tick();
    return () => window.clearTimeout(id);
  }, [fixedNow, target, withSeconds]);
  const now = fixedNow ?? liveNow;
  const model = now == null ? null : countdownParts(target, now, shown);
  const done = model?.done ?? false;

  const fire = useEventCallback(onComplete);
  const firedFor = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (done && firedFor.current !== target) {
      firedFor.current = target;
      fire();
    }
  }, [done, target, fire]);

  const smallest = shown.at(-1) ?? "seconds";
  const spokenTime = model
    ? f.duration(model.total, {
        smallest: smallest === "seconds" && model.total < 60 ? "s" : smallest === "days" ? "d" : smallest === "hours" ? "h" : "min",
        maxParts: Math.max(1, Math.min(shown.length, 3)),
        style: "long",
      })
    : "";
  const sentence = !model ? t("until", { date: f.dateTime(target) }) : done ? t("completed") : t("remaining", { time: spokenTime });
  const spoken = `${label ? `${label}: ` : ""}${sentence}`;

  const digits = (u: CountdownUnit, i: number) => {
    const n = model?.values[u];
    if (n == null) return "––";
    return numberFormat(locale, { minimumIntegerDigits: i === 0 && variant === "inline" ? 1 : 2, useGrouping: false }).format(n);
  };

  if (done && completed != null) {
    return (
      <div ref={ref} role="status" data-slot="countdown" data-state="completed" className={cn("text-fg", className)} style={style} {...props}>
        {completed}
      </div>
    );
  }

  const state = !model ? "pending" : done ? "completed" : "running";

  if (variant === "inline") {
    return (
      <div
        ref={ref}
        role="timer"
        aria-label={spoken}
        data-slot="countdown"
        data-state={state}
        className={cn("inline-flex items-baseline gap-1.5 font-medium whitespace-nowrap text-fg tabular", className)}
        style={style}
        {...props}
      >
        {shown.map((u, i) => (
          <span key={u} aria-hidden="true" data-unit={u}>
            {digits(u, i)}
            <span className="text-fg-muted">{unitWord(locale, u, model?.values[u] ?? 0, "narrow")}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="timer"
      aria-label={spoken}
      data-slot="countdown"
      data-state={state}
      className={cn("grid w-full gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))`, ...style }}
      {...props}
    >
      {shown.map((u, i) => {
        const accent = highlightLast && i === shown.length - 1;
        return (
          <div
            key={u}
            aria-hidden="true"
            data-unit={u}
            className={cn("flex min-w-0 flex-col gap-1.5 rounded-ui border px-3 py-2.5", accent ? "border-transparent bg-accent text-accent-fg" : "border-line bg-surface text-fg")}
          >
            <span className="text-[1.75rem] sm:text-[2.5rem] leading-none font-semibold tracking-tight tabular">{digits(u, i)}</span>
            <span className={cn("truncate text-xs font-medium", accent ? "text-accent-fg" : "text-fg-muted")}>{unitWord(locale, u, model?.values[u] ?? 0, unitDisplay)}</span>
          </div>
        );
      })}
    </div>
  );
});
