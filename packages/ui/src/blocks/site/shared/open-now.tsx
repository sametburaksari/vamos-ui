"use client";

import * as React from "react";
import { cn2 as cn } from "./kit-2";
import { describeStatus, hoursStatus, type OpeningHours } from "./opening-hours";

import type { OpenNowLabels } from "./island-keys";

export type { OpenNowLabels };

export interface OpenNowProps {
  hours: OpeningHours;
  labels: OpenNowLabels;
  locale?: string;
  /** "Closing soon" threshold. Default 60 minutes. */
  soonMinutes?: number;
  /** Fixed "now" (tests, previews, screenshots). Without it the status follows the clock. */
  now?: string | number;
  /** `badge`: dot + text. `text`: text only. Default `"badge"`. */
  appearance?: "badge" | "text";
  className?: string;
}

/**
 * "Open · until 10 PM" / "Closed · opens tomorrow at 12 PM" — computed in the business's time zone on the client, refreshed
 * every minute. Renders nothing on the server and without JS: a cached page never shows a stale
 * status. ~1 KB.
 */
export function OpenNow({ hours, labels, locale = "en-US", soonMinutes, now, appearance = "badge", className }: OpenNowProps) {
  const [at, setAt] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (now !== undefined) {
      setAt(new Date(now).getTime());
      return;
    }
    setAt(Date.now());
    const id = window.setInterval(() => setAt(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, [now]);
  if (at === null) return null;
  const status = hoursStatus(hours, at, { soonMinutes });
  const { head, tail } = describeStatus(status, labels, locale);
  return (
    <span data-open-state={status.state} className={cn("vb-open-now inline-flex items-center gap-2 text-small", className)}>
      {appearance === "badge" ? <span aria-hidden className="vb-open-dot size-2 shrink-0 rounded-full" /> : null}
      <span>
        <span className="font-medium text-fg">{head}</span>
        {tail ? <span className="text-fg-muted"> · {tail}</span> : null}
      </span>
    </span>
  );
}
