"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { AlarmClock, CircleCheck, CircleX, Pause, Timer } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";

export type SlaState = "on-track" | "at-risk" | "breached" | "met" | "missed" | "paused";

export const slaTimerLabels = {
  dueIn: "Due in {time}",
  overdue: "Overdue by {time}",
  met: "Met with {time} to spare",
  missed: "Missed by {time}",
  paused: "Paused with {time} left",
  pausedOverdue: "Paused, {time} over",
  stateOnTrack: "On track",
  stateAtRisk: "At risk",
  stateBreached: "Breached",
  stateMet: "Met",
  stateMissed: "Missed",
  statePaused: "Paused",
};
export type SlaTimerLabels = typeof slaTimerLabels;

type DateLike = string | number | Date;
const ms = (v: DateLike) => (v instanceof Date ? v.getTime() : typeof v === "number" ? v : Date.parse(v));

export interface SlaModel {
  state: SlaState;
  /** Milliseconds left (negative when overdue); frozen for met/missed/paused. */
  remaining: number;
  /** Share of the window used, 0…1+ (needs `start`). */
  used: number | null;
}

/**
 * Pure SLA state: `on-track`, `at-risk` (less than `warnAt` of the window or `warnMinutes`
 * left), `breached`, and the final `met` / `missed` once `completedAt` is set.
 */
export function slaState({ due, start, completedAt, pausedAt, now, warnAt = 0.25, warnMinutes }: { due: DateLike; start?: DateLike; completedAt?: DateLike | null; pausedAt?: DateLike | null; now: number; warnAt?: number; warnMinutes?: number }): SlaModel {
  const dueMs = ms(due);
  const startMs = start != null ? ms(start) : null;
  const end = completedAt != null ? ms(completedAt) : pausedAt != null ? ms(pausedAt) : now;
  const remaining = dueMs - end;
  const used = startMs != null && dueMs > startMs ? (end - startMs) / (dueMs - startMs) : null;
  if (completedAt != null) return { state: remaining >= 0 ? "met" : "missed", remaining, used };
  if (pausedAt != null) return { state: "paused", remaining, used };
  if (remaining < 0) return { state: "breached", remaining, used };
  const threshold = warnMinutes != null ? warnMinutes * 60_000 : startMs != null ? (dueMs - startMs) * warnAt : 30 * 60_000;
  return { state: remaining <= threshold ? "at-risk" : "on-track", remaining, used };
}

const slaTimerVariants = cva("inline-flex items-center gap-1.5 whitespace-nowrap font-medium tabular", {
  variants: {
    variant: {
      /** Tinted pill — list rows, inbox items. */
      badge: "h-6 rounded-full px-2 text-xs [&_svg]:size-3.5",
      /** Text with an icon — headers, side panels. */
      inline: "text-[13px] [&_svg]:size-4",
    },
    state: {
      "on-track": "",
      "at-risk": "",
      breached: "",
      met: "",
      missed: "",
      paused: "",
    },
  },
  compoundVariants: [
    { variant: "badge", state: "on-track", class: "bg-selected text-fg-muted" },
    { variant: "badge", state: "at-risk", class: "tone-warning tone-soft" },
    { variant: "badge", state: "breached", class: "tone-danger tone-soft" },
    { variant: "badge", state: "met", class: "tone-success tone-soft" },
    { variant: "badge", state: "missed", class: "tone-danger tone-soft" },
    { variant: "badge", state: "paused", class: "border border-dashed border-field-border text-fg-muted" },
    { variant: "inline", state: "on-track", class: "text-fg" },
    { variant: "inline", state: "at-risk", class: "tone-warning [color:color-mix(in_srgb,var(--tone)_var(--tone-ink-mix,100%),var(--fg))]" },
    { variant: "inline", state: "breached", class: "tone-danger [color:color-mix(in_srgb,var(--tone)_var(--tone-ink-mix,100%),var(--fg))]" },
    { variant: "inline", state: "met", class: "tone-success [color:color-mix(in_srgb,var(--tone)_var(--tone-ink-mix,100%),var(--fg))]" },
    { variant: "inline", state: "missed", class: "tone-danger [color:color-mix(in_srgb,var(--tone)_var(--tone-ink-mix,100%),var(--fg))]" },
    { variant: "inline", state: "paused", class: "text-fg-muted" },
  ],
  defaultVariants: { variant: "badge", state: "on-track" },
});

const icons: Record<SlaState, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  "on-track": Timer,
  "at-risk": AlarmClock,
  breached: AlarmClock,
  met: CircleCheck,
  missed: CircleX,
  paused: Pause,
};

const barColor: Record<SlaState, string> = {
  "on-track": "bg-accent",
  "at-risk": "bg-warning",
  breached: "bg-danger",
  met: "bg-success",
  missed: "bg-danger",
  paused: "bg-fg-subtle",
};

/** Ticks once per second near the deadline, every 15 s otherwise; static when `now` is passed. */
function useNow(fixed: number | undefined, remaining: () => number, live: boolean) {
  const [now, setNow] = React.useState(() => fixed ?? Date.now());
  React.useEffect(() => {
    if (fixed != null || !live) return;
    let id = 0;
    const tick = () => {
      setNow(Date.now());
      const left = Math.abs(remaining());
      id = window.setTimeout(tick, left < 3_600_000 ? 1000 - (Date.now() % 1000) : 15_000);
    };
    tick();
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixed, live]);
  return fixed ?? now;
}

export interface SlaTimerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Deadline (ISO string, epoch ms or Date). */
  due: DateLike;
  /** When the clock started — enables the proportional warning and the bar. */
  start?: DateLike;
  /** Target reached (first reply sent, ticket solved) → `met` or `missed`, frozen. */
  completedAt?: DateLike | null;
  /** Clock stopped (waiting on customer) → `paused`, frozen. */
  pausedAt?: DateLike | null;
  /** Fixed "now" (epoch ms) for static screens, tests and screenshots. Omit to tick live. */
  now?: number;
  /** Warn when less than this share of the window is left (needs `start`). Default `0.25`. */
  warnAt?: number;
  /** Warn when fewer minutes than this are left (overrides `warnAt`). */
  warnMinutes?: number;
  /** `"badge"` (default), `"inline"`, or `"bar"` (label row + progress line). */
  variant?: "badge" | "inline" | "bar";
  /** What the SLA measures, prefixed to the accessible text: "First response". */
  label?: string;
  /** Show seconds under an hour left. Default `true`. */
  seconds?: boolean;
  /** Hide the icon (badge / inline). */
  hideIcon?: boolean;
  labels?: Partial<SlaTimerLabels>;
}

/**
 * Countdown to a service-level deadline — first response, resolution, delivery window.
 * Colour follows the state (on track → at risk → breached), and it freezes as met/missed
 * once `completedAt` is set. `role="timer"` with a full sentence for screen readers.
 *
 * ```tsx
 * <SlaTimer label="First response" start={ticket.createdAt} due={ticket.firstResponseDue} />
 * <SlaTimer variant="bar" label="Resolution" start={t.createdAt} due={t.resolveDue} completedAt={t.solvedAt} />
 * ```
 */
export const SlaTimer = React.forwardRef<HTMLSpanElement, SlaTimerProps>(function SlaTimer(
  { due, start, completedAt, pausedAt, now: fixedNow, warnAt, warnMinutes, variant = "badge", label, seconds = true, hideIcon, labels, className, ...props },
  ref,
) {
  const t = useLabels("slaTimer", slaTimerLabels, labels);
  const f = useFormat();
  const frozen = completedAt != null || pausedAt != null;
  const now = useNow(fixedNow, () => ms(due) - Date.now(), !frozen);
  const m = slaState({ due, start, completedAt, pausedAt, now, warnAt, warnMinutes });
  const abs = Math.abs(m.remaining);
  const time = f.duration(Math.floor(abs / 1000), { smallest: seconds && abs < 3_600_000 ? "s" : "min", maxParts: 2 });
  const sentence =
    m.state === "met" ? t("met", { time })
    : m.state === "missed" ? t("missed", { time })
    : m.state === "paused" ? t(m.remaining >= 0 ? "paused" : "pausedOverdue", { time })
    : m.state === "breached" ? t("overdue", { time })
    : t("dueIn", { time });
  const stateName = t(({ "on-track": "stateOnTrack", "at-risk": "stateAtRisk", breached: "stateBreached", met: "stateMet", missed: "stateMissed", paused: "statePaused" } as const)[m.state]);
  const spoken = `${label ? `${label}: ` : ""}${sentence}`;
  const Icon = icons[m.state];
  const visible = m.state === "breached" || m.state === "missed" ? `−${time}` : m.state === "met" ? stateName : time;

  if (variant === "bar") {
    const fill = m.used == null ? (m.remaining < 0 ? 1 : 0) : Math.max(0, Math.min(1, m.used));
    return (
      <span ref={ref} role="timer" aria-label={spoken} suppressHydrationWarning data-slot="sla-timer" data-state={m.state} className={cn("grid w-full min-w-40 gap-1.5", className)} {...props}>
        <span aria-hidden="true" className="flex items-baseline justify-between gap-3 text-[13px]">
          <span className="truncate text-fg-muted">{label ?? stateName}</span>
          <span suppressHydrationWarning className={cn("font-medium tabular", slaTimerVariants({ variant: "inline", state: m.state }))}>
            {visible}
          </span>
        </span>
        <span aria-hidden="true" className="relative h-1 overflow-hidden rounded-full bg-track">
          <span
            suppressHydrationWarning
            className={cn("absolute inset-0 origin-left rounded-full transition-transform duration-500 motion-reduce:transition-none rtl:origin-right", barColor[m.state])}
            style={{ transform: `scaleX(${fill})` }}
          />
        </span>
      </span>
    );
  }

  return (
    <span
      ref={ref}
      role="timer"
      aria-label={spoken}
      title={spoken}
      suppressHydrationWarning
      data-slot="sla-timer"
      data-state={m.state}
      className={cn(slaTimerVariants({ variant, state: m.state }), className)}
      {...props}
    >
      {hideIcon ? null : <Icon aria-hidden />}
      <span aria-hidden="true" suppressHydrationWarning>
        {visible}
      </span>
    </span>
  );
});
