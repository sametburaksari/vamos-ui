"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import type { LaunchTask } from "./data";

export interface LaunchRailProps {
  tasks: LaunchTask[];
  currentId?: string;
  onSelect: (id: string) => void;
  doneCount: number;
  minutesLeft: number;
  blockers: number;
}

/**
 * The progress strip under the header: a large done count and one segment per task. Each segment
 * is a button that opens its task; required tasks sit on a taller bar so the launch path reads at
 * a glance.
 */
export function LaunchRail({ tasks, currentId, onSelect, doneCount, minutesLeft, blockers }: LaunchRailProps) {
  const { c, t } = useBlockFormat();
  const statusText = (x: LaunchTask) =>
    x.status === "done" ? c("done", "tamam") : x.status === "skipped" ? c("skipped", "atlandı") : x.id === currentId ? c("up next", "sıradaki") : c("not started", "başlanmadı");
  return (
    <section aria-label={c("Launch progress", "Yayın ilerlemesi")} className="mt-6 grid gap-4 rounded-ui-lg surface px-4 py-4 sm:px-6 sm:py-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-8">
      <div className="flex items-baseline gap-3 md:block">
        <p className="font-display text-[44px] leading-none tracking-[-0.03em] text-fg tabular md:text-[56px]">
          {doneCount}
          <span className="text-fg-subtle">/{tasks.length}</span>
        </p>
        <p className="text-[13px] text-fg-muted md:mt-2">
          {blockers ? c(`${blockers} required left · ~${minutesLeft} min`, `${blockers} zorunlu kaldı · ~${minutesLeft} dk`) : c("Ready to launch", "Yayına hazır")}
        </p>
      </div>
      <ol className="m-0 flex min-w-0 list-none items-end gap-1 p-0 sm:gap-1.5">
        {tasks.map((x, i) => {
          const isCurrent = x.id === currentId;
          return (
            <li key={x.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect(x.id)}
                aria-label={`${i + 1}. ${t(x.title)}, ${statusText(x)}${x.required ? "" : `, ${c("optional", "isteğe bağlı")}`}`}
                aria-current={isCurrent ? "step" : undefined}
                className="group focus-ring flex w-full flex-col items-stretch gap-2 rounded-ui py-1.5 text-start"
              >
                <span
                  aria-hidden
                  className={cn(
                    "block w-full rounded-full transition-[background-color,height] duration-300 motion-reduce:transition-none",
                    x.required ? "h-2.5" : "h-1.5",
                    x.status === "done" && "bg-accent",
                    x.status === "skipped" && "border border-dashed border-field-border",
                    x.status === "todo" && (isCurrent ? "bg-fg-muted" : "bg-track group-hover:bg-fg-subtle"),
                  )}
                />
                <span aria-hidden className={cn("hidden truncate text-[11.5px] lg:block", isCurrent ? "font-medium text-fg" : "text-fg-subtle")}>
                  {t(x.title)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
