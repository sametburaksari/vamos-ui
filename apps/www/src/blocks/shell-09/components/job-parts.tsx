"use client";

import { Check } from "lucide-react";
import { Badge, cn, type BadgeProps } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { stepLabels, steps, type Job, type JobStatus } from "./data";

export const statusTone: Record<JobStatus, BadgeProps["tone"]> = {
  unassigned: "neutral",
  "en-route": "info",
  "on-site": "accent",
  done: "success",
  delayed: "warning",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const { t } = useBlockFormat();
  return (
    <Badge tone={statusTone[status]} dot={status === "on-site" || status === "en-route"}>
      {t(stepLabels[status])}
    </Badge>
  );
}

/** "09:30–10:30" in Istanbul time. */
export function useWindow() {
  const { f } = useBlockFormat();
  const hm = (iso: string) => f.time(iso, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Istanbul" });
  return { hm, window: (j: Job) => `${hm(j.windowStart)}–${hm(j.windowEnd)}` };
}

/** Four-step progress track: Scheduled → En route → On site → Done. Delayed counts as en route. */
export function StatusTrack({ status, className }: { status: JobStatus; className?: string }) {
  const { t, c } = useBlockFormat();
  const current = steps.indexOf(status === "delayed" ? "en-route" : status);
  return (
    <ol className={cn("grid grid-cols-4 gap-1.5", className)} aria-label={c("Job progress", "İş durumu")}>
      {steps.map((s, i) => {
        const done = i < current || status === "done";
        const now = i === current && status !== "done";
        return (
          <li key={s} aria-current={now ? "step" : undefined} className="min-w-0">
            <span className={cn("block h-1 rounded-full", done ? "bg-fg" : now ? (status === "delayed" ? "bg-warning" : "bg-accent") : "bg-track")} />
            <span className={cn("mt-1.5 flex items-center gap-1 truncate text-[11px]", done || now ? "text-fg" : "text-fg-subtle")}>
              {done && <Check className="size-3 shrink-0" aria-hidden />}
              {t(stepLabels[s])}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
