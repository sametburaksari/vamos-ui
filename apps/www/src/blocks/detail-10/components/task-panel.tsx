"use client";

import * as React from "react";
import { Avatar, Badge, Card, CardHeader, Checkbox, ToggleGroup, ToggleGroupItem, cn, toast } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { taskStatusLabels, type Project, type Task, type TaskStatus } from "../../_shared/projects";
import { TODAY, daysBetween } from "../../_shared/time";
import { tasksOf } from "./data";

type Filter = "open" | "mine" | "all";
const statusTone: Record<TaskStatus, "neutral" | "info" | "warning" | "success"> = { todo: "neutral", "in-progress": "info", review: "warning", done: "success" };

/** The project's tasks: open / assigned to the lead / all, tick to complete with undo. */
export function TaskPanel({ project }: { project: Project }) {
  const { f, t, c } = useBlockFormat();
  const [filter, setFilter] = React.useState<Filter>("open");
  const [rows, setRows] = React.useState<Task[]>(() => tasksOf(project));
  const lead = person(project.leadId);

  const setStatus = (task: Task, done: boolean) => {
    const before = task.status;
    const next: TaskStatus = done ? "done" : "in-progress";
    setRows((all) => all.map((x) => (x.id === task.id ? { ...x, status: next } : x)));
    toast(done ? c("Task completed", "Görev tamamlandı") : c("Task reopened", "Görev yeniden açıldı"), {
      description: t(task.title),
      action: { label: c("Undo", "Geri al"), onClick: () => setRows((all) => all.map((x) => (x.id === task.id ? { ...x, status: before } : x))) },
    });
  };

  const visible = rows.filter((x) => (filter === "open" ? x.status !== "done" : filter === "mine" ? x.assigneeId === project.leadId : true));

  return (
    <Card as="section" aria-labelledby="tasks-title" className="min-w-0 overflow-hidden">
      <CardHeader
        titleId="tasks-title"
        titleAs="h2"
        title={c("Tasks", "Görevler")}
        description={c(`${rows.filter((x) => x.status === "done").length} of ${rows.length} done · ${rows.reduce((a, x) => a + x.estimateHours, 0)} h estimated`, `${rows.length} görevden ${rows.filter((x) => x.status === "done").length} tamam · ${rows.reduce((a, x) => a + x.estimateHours, 0)} sa tahmini`)}
        action={
          <ToggleGroup type="single" size="sm" value={filter} onValueChange={(v) => v && setFilter(v as Filter)} aria-label={c("Filter tasks", "Görevleri filtrele")}>
            <ToggleGroupItem value="open">{c("Open", "Açık")}</ToggleGroupItem>
            <ToggleGroupItem value="mine">{lead.name.split(" ")[0]}</ToggleGroupItem>
            <ToggleGroupItem value="all">{c("All", "Tümü")}</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      {visible.length ? (
        <Stagger asChild effect="fade" key={filter}>
          <ul className="divide-y divide-line border-t border-line">
            {visible.map((task) => {
              const p = person(task.assigneeId);
              const days = daysBetween(TODAY, task.due);
              const done = task.status === "done";
              return (
                <li key={task.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-(--card-p) py-3">
                  <Checkbox className="mt-0.5" checked={done} onCheckedChange={(v) => setStatus(task, v === true)} aria-label={c(`Complete “${t(task.title)}”`, `“${t(task.title)}” tamamla`)} />
                  <div className="min-w-0">
                    <p className={cn("text-sm", done ? "text-fg-muted line-through decoration-fg-subtle/60" : "text-fg")}>{t(task.title)}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-subtle">
                      <Badge tone={statusTone[task.status]} size="sm">{t(taskStatusLabels[task.status])}</Badge>
                      {task.priority === "high" && !done ? <Badge tone="danger" size="sm">{c("High", "Yüksek")}</Badge> : null}
                      <span className={cn(!done && days < 0 && "text-danger")}>
                        {done ? f.date(task.due, "medium") : days === 0 ? c("Due today", "Bugün") : days > 0 ? c(`Due in ${days} d`, `${days} gün içinde`) : c(`${-days} d overdue`, `${-days} gün gecikti`)}
                      </span>
                      <span className="font-mono tabular">{task.estimateHours} {c("h", "sa")}</span>
                    </p>
                  </div>
                  <Avatar name={p.name} size="xs" />
                </li>
              );
            })}
          </ul>
        </Stagger>
      ) : (
        <p className="border-t border-line px-(--card-p) py-8 text-center text-sm text-fg-muted">{filter === "open" ? c("Everything here is done.", "Buradaki her şey tamam.") : c("No tasks yet.", "Henüz görev yok.")}</p>
      )}
    </Card>
  );
}
