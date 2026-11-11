"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  Avatar,
  Button,
  DatePicker,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Input,
  Select,
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { TODAY } from "../../_shared/time";
import { DueLabel, PriorityMark, ProjectChip } from "./task-parts";
import { priorityLabels, projects, statuses, taskStatusLabels, type Priority, type TaskStatus, type WorkTask } from "./tasks-data";

function useOptions() {
  const { t } = useBlockFormat();
  return {
    status: statuses.map((s) => ({ value: s, label: t(taskStatusLabels[s]) })),
    priority: (["high", "medium", "low"] as Priority[]).map((p) => ({ value: p, label: t(priorityLabels[p]) })),
    project: projects.filter((p) => p.status !== "completed").map((p) => ({ value: p.id, label: `${p.code} · ${t(p.name)}` })),
    people: (projectId: string) => projects.find((p) => p.id === projectId)!.memberIds.map((id) => ({ value: id, label: person(id).name })),
  };
}

interface TaskSheetProps {
  task: WorkTask | null;
  onOpenChange: (open: boolean) => void;
  onChange: (id: string, patch: Partial<WorkTask>) => void;
  onDelete: (task: WorkTask) => void;
}

/** Task details at the edge of the page; every field saves as you change it. */
export function TaskSheet({ task, onOpenChange, onChange, onDelete }: TaskSheetProps) {
  const { c, t, f } = useBlockFormat();
  const o = useOptions();
  const [last, setLast] = React.useState<WorkTask | null>(task);
  React.useEffect(() => {
    if (task) setLast(task);
  }, [task]);
  const x = task ?? last;
  return (
    <Sheet open={!!task} onOpenChange={onOpenChange}>
      <SheetContent side="end" size="md">
        {x ? (
          <>
            <SheetHeader title={t(x.title)} description={<span className="font-mono text-[12px]">{x.key}</span>} />
            <SheetBody className="grid content-start gap-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <ProjectChip projectId={x.projectId} />
                <DueLabel task={x} />
                <PriorityMark priority={x.priority} withLabel />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={c("Status", "Durum")}>
                  <Select value={x.status} onValueChange={(v) => v && onChange(x.id, { status: v as TaskStatus })} items={o.status} />
                </Field>
                <Field label={c("Priority", "Öncelik")}>
                  <Select value={x.priority} onValueChange={(v) => v && onChange(x.id, { priority: v as Priority })} items={o.priority} />
                </Field>
                <Field label={c("Assignee", "Atanan")}>
                  <Select
                    value={x.assigneeId}
                    onValueChange={(v) => v && onChange(x.id, { assigneeId: v })}
                    items={o.people(x.projectId)}
                    renderValue={(it) => (
                      <span className="flex items-center gap-2">
                        <Avatar name={it.label as string} size="xs" />
                        {it.label}
                      </span>
                    )}
                  />
                </Field>
                <Field label={c("Due date", "Bitiş tarihi")}>
                  <DatePicker value={x.due} onValueChange={(v) => v && onChange(x.id, { due: v })} />
                </Field>
              </div>
              <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-ui border border-line bg-line text-[12px]">
                <div className="bg-surface px-3 py-2">
                  <dt className="text-fg-subtle">{c("Estimate", "Tahmin")}</dt>
                  <dd className="tabular mt-0.5 text-[14px] text-fg">{c(`${x.estimateHours} h`, `${x.estimateHours} sa`)}</dd>
                </div>
                <div className="bg-surface px-3 py-2">
                  <dt className="text-fg-subtle">{c("Subtasks", "Alt görev")}</dt>
                  <dd className="tabular mt-0.5 text-[14px] text-fg">{x.subtasks ? `${x.subtasks.done}/${x.subtasks.total}` : "—"}</dd>
                </div>
                <div className="bg-surface px-3 py-2">
                  <dt className="text-fg-subtle">{c("Comments", "Yorum")}</dt>
                  <dd className="tabular mt-0.5 text-[14px] text-fg">{f.number(x.comments)}</dd>
                </div>
              </dl>
            </SheetBody>
            <SheetFooter>
              <Button variant="danger-ghost" onClick={() => onDelete(x)}>
                <Trash2 /> {c("Delete task", "Görevi sil")}
              </Button>
              <Button onClick={() => onOpenChange(false)}>{c("Close", "Kapat")}</Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

interface NewTaskDialogProps {
  open: boolean;
  defaultDue?: string;
  defaultProject?: string | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (task: Omit<WorkTask, "id" | "key">) => void;
}

/** Quick capture: title, project, assignee, due date, priority. */
export function NewTaskDialog({ open, defaultDue, defaultProject, onOpenChange, onCreate }: NewTaskDialogProps) {
  const { c } = useBlockFormat();
  const o = useOptions();
  const [title, setTitle] = React.useState("");
  const [projectId, setProjectId] = React.useState("pj-1");
  const [assigneeId, setAssigneeId] = React.useState("p-defne");
  const [due, setDue] = React.useState(TODAY);
  const [priority, setPriority] = React.useState<Priority>("medium");
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const p = defaultProject && o.project.some((x) => x.value === defaultProject) ? defaultProject : "pj-1";
    setTitle("");
    setProjectId(p);
    setAssigneeId(projects.find((x) => x.id === p)!.memberIds[0]!);
    setDue(defaultDue ?? TODAY);
    setPriority("medium");
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader title={c("New task", "Yeni görev")} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!title.trim()) return;
            onCreate({ title: { en: title.trim(), tr: title.trim() }, projectId, assigneeId, due, priority, status: "todo", estimateHours: 2, comments: 0 });
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("Title", "Başlık")} required error={tried && !title.trim() ? c("Say what needs doing", "Ne yapılacağını yazın") : undefined}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder={c("e.g. Review checkout copy", "ör. Ödeme ekranı metinlerini incele")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={c("Project", "Proje")}>
                <Select
                  value={projectId}
                  onValueChange={(v) => {
                    if (!v) return;
                    setProjectId(v);
                    setAssigneeId(projects.find((x) => x.id === v)!.memberIds[0]!);
                  }}
                  items={o.project}
                />
              </Field>
              <Field label={c("Assignee", "Atanan")}>
                <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)} items={o.people(projectId)} />
              </Field>
              <Field label={c("Due date", "Bitiş tarihi")}>
                <DatePicker value={due} onValueChange={(v) => v && setDue(v)} />
              </Field>
              <Field label={c("Priority", "Öncelik")}>
                <Select value={priority} onValueChange={(v) => v && setPriority(v as Priority)} items={o.priority} />
              </Field>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary">
              {c("Create task", "Görevi oluştur")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
