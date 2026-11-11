"use client";

import * as React from "react";
import { CalendarDays, Columns3, List, Plus, Search, X } from "lucide-react";
import { Button, EmptyState, Input, ListViewSwitch, PageHeader, Select, Switch, cn, toast } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { applyKanbanMove, type KanbanMoveEvent } from "@vamos-ui/react/sortable";
import { useBlockFormat } from "../../_shared/format";
import { me } from "../../_shared/people";
import { TODAY, daysBetween } from "../../_shared/time";
import { NewTaskDialog, TaskSheet } from "./task-dialogs";
import { TaskBoardView, TaskCalendarView, TaskListView } from "./task-views";
import { initialTasks, isOverdue, projectToneClass, projects, taskStatusLabels, type WorkTask } from "./tasks-data";

type View = "list" | "board" | "calendar";
const VIEW_KEY = "vui-list-13-view";
let seq = 100;

/** Agency tasks with three views over one filtered set: due-date list, status board, month calendar. */
export function TasksView() {
  const { c, t } = useBlockFormat();
  const [tasks, setTasks] = React.useState(initialTasks);
  const [view, setView] = React.useState<View>("list");
  const [q, setQ] = React.useState("");
  const [project, setProject] = React.useState<string | null>(null);
  const [mine, setMine] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState<{ due?: string } | null>(null);

  // Remember the last view per browser (a convenience only).
  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem(VIEW_KEY);
      if (v === "list" || v === "board" || v === "calendar") setView(v);
    } catch {}
  }, []);
  const changeView = (v: string) => {
    setView(v as View);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };

  const needle = q.trim().toLocaleLowerCase();
  const visible = tasks.filter(
    (x) =>
      (!project || x.projectId === project) &&
      (!mine || x.assigneeId === me.id) &&
      (!needle || t(x.title).toLocaleLowerCase().includes(needle) || x.key.toLowerCase().includes(needle)),
  );
  const filtered = !!project || mine || !!needle;

  const patch = (id: string, p: Partial<WorkTask>) => setTasks((all) => all.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const toggleDone = (task: WorkTask) => {
    const prev = task.status;
    const next = prev === "done" ? "todo" : "done";
    patch(task.id, { status: next });
    toast(next === "done" ? c(`Completed “${t(task.title)}”`, `“${t(task.title)}” tamamlandı`) : c(`Reopened “${t(task.title)}”`, `“${t(task.title)}” yeniden açıldı`), {
      action: { label: c("Undo", "Geri al"), onClick: () => patch(task.id, { status: prev }) },
    });
  };

  const move = (e: KanbanMoveEvent) => {
    setTasks((all) => applyKanbanMove(all, e, { getId: (x) => x.id, getStageKey: (x) => x.status, update: (x, stage) => ({ ...x, status: stage as WorkTask["status"] }) }));
    if (e.from !== e.to) {
      const task = tasks.find((x) => x.id === e.id);
      if (task && e.to === "done") toast.success(c(`Completed “${t(task.title)}”`, `“${t(task.title)}” tamamlandı`));
    }
  };

  const reschedule = (id: string, due: string) => {
    const task = tasks.find((x) => x.id === id);
    if (!task || task.due === due) return;
    const prev = task.due;
    patch(id, { due });
    toast(c(`Moved to ${due}`, `${due} tarihine taşındı`), {
      description: t(task.title),
      action: { label: c("Undo", "Geri al"), onClick: () => patch(id, { due: prev }) },
    });
  };

  const remove = (task: WorkTask) => {
    const index = tasks.findIndex((x) => x.id === task.id);
    setTasks((all) => all.filter((x) => x.id !== task.id));
    setOpenId(null);
    toast(c(`Deleted “${t(task.title)}”`, `“${t(task.title)}” silindi`), {
      action: {
        label: c("Undo", "Geri al"),
        onClick: () =>
          setTasks((all) => {
            const n = [...all];
            n.splice(index, 0, task);
            return n;
          }),
      },
    });
  };

  // Header numbers (always over all tasks, not the filtered set).
  const open = tasks.filter((x) => x.status !== "done");
  const overdue = tasks.filter(isOverdue).length;
  const thisWeek = open.filter((x) => {
    const d = daysBetween(TODAY, x.due);
    return d >= 0 && d <= 7;
  }).length;
  const hours = open.reduce((s, x) => s + x.estimateHours, 0);
  const stats: Array<[string, number, string?]> = [
    [c("Open", "Açık"), open.length],
    [c("Overdue", "Gecikmiş"), overdue, overdue ? "text-danger" : undefined],
    [c("Due in 7 days", "7 gün içinde"), thisWeek],
    [c("Hours left", "Kalan saat"), hours],
  ];

  const current = openId ? (tasks.find((x) => x.id === openId) ?? null) : null;

  return (
    <div className="mx-auto w-full max-w-[1320px]">
      <PageHeader
        eyebrow={c("Work", "İş")}
        title={c("Tasks", "Görevler")}
        description={c("Every open task across client projects. Switch the view; filters carry over.", "Müşteri projelerindeki tüm açık görevler. Görünümü değiştirin, filtreler korunur.")}
        actions={
          <Button variant="primary" onClick={() => setCreating({})}>
            <Plus /> {c("New task", "Yeni görev")}
          </Button>
        }
      />

      <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
        {stats.map(([label, value, tone]) => (
          <div key={label} className="border-s border-line ps-4">
            <dt className="text-[12px] text-fg-subtle">{label}</dt>
            <dd className={cn("tabular font-display text-[1.75rem] leading-tight text-fg", tone)}>
              <CountUp value={value} duration={900} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-2.5 border-b border-line pb-3">
        <div className="relative min-w-0 basis-full sm:basis-64">
          <Search aria-hidden className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input size="sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder={c("Search tasks or keys", "Görev ya da anahtar ara")} aria-label={c("Search tasks", "Görev ara")} className="ps-8" />
        </div>
        <div className="w-full min-w-0 sm:w-56">
          <Select
            size="sm"
            value={project}
            onValueChange={setProject}
            clearable
            placeholder={c("All projects", "Tüm projeler")}
            aria-label={c("Project", "Proje")}
            items={projects.map((p) => ({ value: p.id, label: `${p.code} · ${t(p.name)}` }))}
            renderValue={(it) => (
              <span className="flex min-w-0 items-center gap-2">
                <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", projectToneClass[it.value])} />
                <span className="truncate">{it.label}</span>
              </span>
            )}
          />
        </div>
        <Switch size="sm" checked={mine} onCheckedChange={setMine} label={c("Assigned to me", "Bana atananlar")} />
        {filtered ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setQ("");
              setProject(null);
              setMine(false);
            }}
          >
            <X /> {c("Clear", "Temizle")}
          </Button>
        ) : null}
        <span role="status" className="text-[12px] text-fg-subtle tabular">
          {filtered ? c(`${visible.length} of ${tasks.length}`, `${tasks.length} görevden ${visible.length}`) : ""}
        </span>
        <ListViewSwitch
          className="ms-auto"
          label={c("View", "Görünüm")}
          value={view}
          onValueChange={changeView}
          options={[
            { value: "list", label: c("List", "Liste"), icon: <List /> },
            { value: "board", label: c("Board", "Pano"), icon: <Columns3 /> },
            { value: "calendar", label: c("Calendar", "Takvim"), icon: <CalendarDays /> },
          ]}
        />
      </div>

      <section aria-label={c(`Tasks, ${view} view`, `Görevler, ${{ list: "liste", board: "pano", calendar: "takvim" }[view]} görünümü`)} className="mt-5 min-w-0" key={view}>
        <div className="ui-fade">
          {visible.length === 0 && view !== "calendar" ? (
            <EmptyState
              kind="no-results"
              size="md"
              title={c("No tasks match", "Eşleşen görev yok")}
              description={mine ? c("Nothing is assigned to you with these filters.", "Bu filtrelerle size atanmış bir şey yok.") : c("Try another project or clear the search.", "Başka bir proje deneyin ya da aramayı temizleyin.")}
            />
          ) : view === "list" ? (
            <TaskListView tasks={visible} onOpen={setOpenId} onToggleDone={toggleDone} />
          ) : view === "board" ? (
            <TaskBoardView tasks={visible} onOpen={setOpenId} onMove={move} />
          ) : (
            <TaskCalendarView tasks={visible} onOpen={setOpenId} onReschedule={reschedule} onCreate={(due) => setCreating({ due })} />
          )}
        </div>
      </section>

      <TaskSheet
        task={current}
        onOpenChange={(o) => !o && setOpenId(null)}
        onChange={(id, p) => {
          patch(id, p);
          if (p.status) toast.success(c(`Status: ${t(taskStatusLabels[p.status])}`, `Durum: ${t(taskStatusLabels[p.status])}`));
        }}
        onDelete={remove}
      />
      <NewTaskDialog
        open={!!creating}
        defaultDue={creating?.due}
        defaultProject={project}
        onOpenChange={(o) => !o && setCreating(null)}
        onCreate={(task) => {
          const p = projects.find((x) => x.id === task.projectId)!;
          const id = `tk-new-${++seq}`;
          setTasks((all) => [{ ...task, id, key: `${p.code}-${seq}` }, ...all]);
          setCreating(null);
          toast.success(c(`Task created in ${p.code}`, `Görev ${p.code} içinde oluşturuldu`), { action: { label: c("Open", "Aç"), onClick: () => setOpenId(id) } });
        }}
      />
    </div>
  );
}
