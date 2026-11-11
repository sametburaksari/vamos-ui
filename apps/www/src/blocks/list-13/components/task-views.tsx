"use client";

import * as React from "react";
import { ChevronRight, ListChecks, MessageSquare } from "lucide-react";
import { Avatar, Checkbox, DropdownMenuItem, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { Scheduler, type SchedulerEvent } from "@vamos-ui/react/scheduler";
import { Kanban, KanbanCardFooter, KanbanCardMeta, KanbanCardTitle, type KanbanMoveEvent } from "@vamos-ui/react/sortable";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { NOW_MS, TODAY } from "../../_shared/time";
import { DueLabel, PriorityMark, ProjectChip } from "./task-parts";
import { bucketLabels, bucketOf, projectTone, statuses, taskStatusLabels, type DueBucket, type TaskStatus, type WorkTask } from "./tasks-data";

interface ViewProps {
  tasks: WorkTask[];
  onOpen: (id: string) => void;
  onToggleDone: (task: WorkTask) => void;
}

function Meta({ task }: { task: WorkTask }) {
  const { c } = useBlockFormat();
  return (
    <>
      {task.subtasks ? (
        <span className="tabular inline-flex items-center gap-1 text-[12px] text-fg-subtle [&_svg]:size-3.5" aria-label={c(`${task.subtasks.done} of ${task.subtasks.total} subtasks`, `${task.subtasks.total} alt görevden ${task.subtasks.done} tanesi`)}>
          <ListChecks aria-hidden />
          {task.subtasks.done}/{task.subtasks.total}
        </span>
      ) : null}
      {task.comments ? (
        <span className="tabular inline-flex items-center gap-1 text-[12px] text-fg-subtle [&_svg]:size-3.5" aria-label={c(`${task.comments} comments`, `${task.comments} yorum`)}>
          <MessageSquare aria-hidden />
          {task.comments}
        </span>
      ) : null}
    </>
  );
}

const order: DueBucket[] = ["overdue", "today", "week", "later", "done"];

/** Due-date buckets: what's late, what's today, what's coming. Done stays collapsed. */
export function TaskListView({ tasks, onOpen, onToggleDone }: ViewProps) {
  const { c, t } = useBlockFormat();
  const [closed, setClosed] = React.useState<Set<DueBucket>>(() => new Set(["done"]));
  const groups = order.map((b) => ({ b, items: tasks.filter((x) => bucketOf(x) === b).sort((a, z) => a.due.localeCompare(z.due)) })).filter((g) => g.items.length);

  return (
    <div className="grid gap-6">
      {groups.map(({ b, items }) => {
        const open = !closed.has(b);
        const id = `bucket-${b}`;
        return (
          <section key={b} aria-labelledby={`${id}-h`}>
            <h3 id={`${id}-h`}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={id}
                onClick={() =>
                  setClosed((s) => {
                    const n = new Set(s);
                    if (n.has(b)) n.delete(b);
                    else n.add(b);
                    return n;
                  })
                }
                className="focus-ring flex items-center gap-2 rounded-ui-sm py-1 text-start"
              >
                <ChevronRight aria-hidden className={cn("size-3.5 text-fg-subtle transition-transform motion-reduce:transition-none rtl:-scale-x-100", open && "rotate-90")} />
                <span className={cn("font-display text-[1.0625rem]", b === "overdue" ? "text-danger" : "text-fg")}>{t(bucketLabels[b])}</span>
                <span className="tabular text-[12px] text-fg-subtle">{items.length}</span>
              </button>
            </h3>
            {open ? (
              <Stagger asChild effect="fade">
                <ul id={id} className="mt-2 overflow-hidden rounded-ui-lg border border-line bg-surface">
                  {items.map((task) => {
                    const done = task.status === "done";
                    return (
                      <li
                        key={task.id}
                        className="group/row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-line px-3 py-2.5 last:border-b-0 hover:bg-hover md:grid-cols-[auto_4.75rem_minmax(0,1fr)_7rem_1rem_6.5rem_auto] lg:grid-cols-[auto_4.75rem_minmax(0,1fr)_13rem_7rem_1rem_6.5rem_auto]"
                      >
                        <Checkbox
                          checked={done}
                          onCheckedChange={() => onToggleDone(task)}
                          aria-label={done ? c(`Reopen ${t(task.title)}`, `${t(task.title)} yeniden aç`) : c(`Complete ${t(task.title)}`, `${t(task.title)} tamamla`)}
                        />
                        <span className="tabular hidden font-mono text-[11.5px] text-fg-subtle md:block">{task.key}</span>
                        <span className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onOpen(task.id)}
                            className={cn("focus-ring block max-w-full truncate rounded-ui-sm text-start text-[13.5px]", done ? "text-fg-subtle line-through decoration-fg-subtle/60" : "text-fg hover:underline underline-offset-2")}
                          >
                            {t(task.title)}
                          </button>
                          <span className="mt-0.5 flex min-w-0 items-center gap-3 md:hidden">
                            <ProjectChip projectId={task.projectId} code />
                            <DueLabel task={task} />
                            <Meta task={task} />
                          </span>
                          <span className="mt-0.5 hidden min-w-0 md:flex lg:hidden">
                            <ProjectChip projectId={task.projectId} />
                          </span>
                        </span>
                        <span className="hidden min-w-0 lg:block">
                          <ProjectChip projectId={task.projectId} />
                        </span>
                        <span className="hidden items-center justify-end gap-3 md:flex">
                          <Meta task={task} />
                        </span>
                        <span className="hidden md:flex">
                          <PriorityMark priority={task.priority} />
                        </span>
                        <span className="hidden md:block">
                          <DueLabel task={task} />
                        </span>
                        <Avatar name={person(task.assigneeId).name} size="xs" />
                      </li>
                    );
                  })}
                </ul>
              </Stagger>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

const stageTone: Record<TaskStatus, "neutral" | "info" | "warning" | "success"> = {
  todo: "neutral",
  "in-progress": "info",
  review: "warning",
  done: "success",
};

/** Status board: drag between columns; In progress and In review carry WIP limits. */
export function TaskBoardView({ tasks, onOpen, onMove }: Omit<ViewProps, "onToggleDone"> & { onMove: (e: KanbanMoveEvent) => void }) {
  const { c, t } = useBlockFormat();
  const stages = statuses.map((s) => ({
    key: s,
    label: t(taskStatusLabels[s]),
    tone: stageTone[s],
    category: s === "done" ? ("done" as const) : s === "todo" ? ("open" as const) : ("active" as const),
    wipLimit: s === "in-progress" ? 6 : s === "review" ? 6 : undefined,
  }));
  return (
    <Kanban
      aria-label={c("Tasks by status", "Duruma göre görevler")}
      stages={stages}
      items={tasks}
      getStageKey={(x) => x.status}
      getLabel={(x) => t(x.title)}
      onMove={onMove}
      columnWidth="md"
      summary={(items) => <span className="tabular">{c(`${items.reduce((s, x) => s + x.estimateHours, 0)} h estimated`, `${items.reduce((s, x) => s + x.estimateHours, 0)} sa tahmini`)}</span>}
      cardMenu={(x) => <DropdownMenuItem onSelect={() => onOpen(x.id)}>{c("Open details", "Ayrıntıları aç")}</DropdownMenuItem>}
      renderCard={(x, state) => (
        <>
          <KanbanCardMeta>
            <span className="tabular font-mono text-[11px]">{x.key}</span>
            <PriorityMark priority={x.priority} />
          </KanbanCardMeta>
          <KanbanCardTitle>
            <button type="button" className="text-start hover:underline underline-offset-2" onClick={() => onOpen(x.id)}>
              {t(x.title)}
            </button>
          </KanbanCardTitle>
          {!state.compact ? (
            <p className="mt-1">
              <ProjectChip projectId={x.projectId} />
            </p>
          ) : null}
          <KanbanCardFooter>
            <span className="flex min-w-0 items-center gap-2.5">
              <DueLabel task={x} />
              <Meta task={x} />
            </span>
            <Avatar name={person(x.assigneeId).name} size="xs" />
          </KanbanCardFooter>
        </>
      )}
    />
  );
}

/** Month calendar by due date: drag a task to another day to reschedule it. */
export function TaskCalendarView({ tasks, onOpen, onReschedule, onCreate }: Omit<ViewProps, "onToggleDone"> & { onReschedule: (id: string, due: string) => void; onCreate: (due: string) => void }) {
  const { t } = useBlockFormat();
  const events: SchedulerEvent[] = tasks.map((x) => ({
    id: x.id,
    title: t(x.title),
    start: x.due,
    end: x.due,
    allDay: true,
    tone: projectTone[x.projectId],
    status: x.status === "done" ? "canceled" : undefined,
    editable: x.status === "done" ? false : { move: true, resize: false },
  }));
  return (
    <Scheduler
      events={events}
      defaultView="month"
      views={["month", "list"]}
      defaultDate={TODAY}
      now={NOW_MS}
      timeZone="Europe/Istanbul"
      maxEventsPerDay={3}
      listDays={14}
      onEventChange={(ch) => onReschedule(ch.id, ch.start.slice(0, 10))}
      onEventOpen={(id) => onOpen(id)}
      onCreate={(range) => onCreate(range.start.slice(0, 10))}
    />
  );
}
