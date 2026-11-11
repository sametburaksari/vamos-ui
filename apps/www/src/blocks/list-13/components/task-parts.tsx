"use client";

import * as React from "react";
import { CalendarClock, ChevronsUp, Equal, ChevronDown } from "lucide-react";
import { cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { TODAY, daysBetween } from "../../_shared/time";
import { priorityLabels, projectToneClass, projects, type Priority, type WorkTask } from "./tasks-data";

const priorityIcon: Record<Priority, React.ReactNode> = {
  high: <ChevronsUp aria-hidden />,
  medium: <Equal aria-hidden />,
  low: <ChevronDown aria-hidden />,
};

export function PriorityMark({ priority, withLabel }: { priority: Priority; withLabel?: boolean }) {
  const { t, c } = useBlockFormat();
  const label = t(priorityLabels[priority]);
  return (
    <span
      role={withLabel ? undefined : "img"}
      aria-label={withLabel ? undefined : c(`${label} priority`, `${label} öncelik`)}
      title={withLabel ? undefined : label}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-[12px] [&_svg]:size-3.5",
        priority === "high" ? "text-danger" : priority === "medium" ? "text-fg-muted" : "text-fg-subtle",
      )}
    >
      {priorityIcon[priority]}
      {withLabel ? label : null}
    </span>
  );
}

/** "Today", "Tomorrow", "3 days late" or a short date. Overdue reads in the danger tone. */
export function DueLabel({ task, className }: { task: WorkTask; className?: string }) {
  const { c, f } = useBlockFormat();
  const d = daysBetween(TODAY, task.due);
  const done = task.status === "done";
  const text =
    d === 0
      ? c("Today", "Bugün")
      : d === 1
        ? c("Tomorrow", "Yarın")
        : d < 0 && !done
          ? c(`${-d} ${d === -1 ? "day" : "days"} late`, `${-d} gün gecikti`)
          : f.date(task.due, { day: "numeric", month: "short" });
  return (
    <time
      dateTime={task.due}
      className={cn("tabular inline-flex shrink-0 items-center gap-1 text-[12px] [&_svg]:size-3.5", !done && d < 0 ? "text-danger" : d === 0 && !done ? "text-fg" : "text-fg-subtle", className)}
    >
      <CalendarClock aria-hidden />
      {text}
    </time>
  );
}

export function ProjectChip({ projectId, code }: { projectId: string; code?: boolean }) {
  const { t } = useBlockFormat();
  const p = projects.find((x) => x.id === projectId)!;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-fg-subtle">
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", projectToneClass[projectId])} />
      <span className="truncate">{code ? p.code : t(p.name)}</span>
    </span>
  );
}
