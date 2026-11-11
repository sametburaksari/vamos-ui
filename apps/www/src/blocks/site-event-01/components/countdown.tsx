"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";

export interface CountdownLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  /** Shown once the event has started. */
  live: string;
  /** Screen-reader sentence ("Starts on 14 May 2027 at 09:30"). */
  summary: string;
}

const UNITS = ["days", "hours", "minutes", "seconds"] as const;

function partsUntil(target: number, now: number) {
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60, done: s === 0 };
}

/**
 * A countdown built from tokens: four tabular cells, the seconds cell on the accent. Renders
 * dashes on the server and starts ticking after hydration (no mismatch); the live sentence for
 * screen readers is static so the timer never chatters.
 */
export function Countdown({ to, labels, locale, className }: { to: string; labels: CountdownLabels; locale: string; className?: string }) {
  const target = React.useMemo(() => new Date(to).getTime(), [to]);
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const p = now === null ? null : partsUntil(target, now);
  const nf = React.useMemo(() => new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false }), [locale]);

  if (p?.done) {
    return (
      <p className={cn("m-0 inline-flex items-center gap-3 font-display text-display-m text-fg", className)}>
        <span aria-hidden className="size-4 rounded-full bg-accent" />
        {labels.live}
      </p>
    );
  }

  return (
    <div className={cn("w-full", className)} data-countdown="">
      <p className="sr-only">{labels.summary}</p>
      <ol aria-hidden className="m-0 grid list-none grid-cols-4 border border-fg p-0">
        {UNITS.map((u, i) => (
          <li key={u} className={cn("flex flex-col justify-between gap-3 border-fg p-3 sm:p-4 [&:not(:first-child)]:border-s", i === 3 && "bg-accent text-accent-fg")}>
            <span className={cn("font-mono text-[10px] font-semibold tracking-[0.12em] uppercase", i === 3 ? "text-accent-fg" : "text-fg-muted")}>{labels[u]}</span>
            <span className="font-display text-[clamp(1.75rem,1.2rem+2.4cqi,3.25rem)] leading-none font-bold tracking-[-0.04em] tabular" data-unit={u}>
              {p ? nf.format(p[u]) : "––"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
