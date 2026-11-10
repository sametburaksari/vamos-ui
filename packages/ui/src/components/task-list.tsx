"use client";

import * as React from "react";
import { CalendarDays, ChevronDown, Flag, ListPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { useNow } from "../lib/data-islands";
import { dayKey } from "../lib/value-format";
import { Avatar } from "./avatar";
import { IconButton } from "./button";
import { Checkbox } from "./checkbox";
import { toast } from "./toast";

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskData {
  id: string;
  title: string;
  done: boolean;
  /** Second line (checklist hint, task notes). */
  description?: string;
  assignee?: { id: string; name: string; avatar?: string };
  /** Due date `YYYY-MM-DD`. */
  due?: string;
  priority?: TaskPriority;
  /** Subtasks (nest as deep as you need; one level reads best). */
  children?: TaskData[];
  /** Can't be toggled or edited (system-checked step). */
  disabled?: boolean;
}

export const taskListLabels = {
  list: "Tasks",
  progress: "{done} of {total} done",
  hideCompleted: "Hide completed",
  showCompleted: "Show completed ({count})",
  add: "Add a task",
  addSubtask: "Add subtask",
  addSubtaskTo: "Add subtask to “{title}”",
  edit: "Edit task “{title}”",
  remove: "Delete task “{title}”",
  moveUp: "Move up",
  moveDown: "Move down",
  due: "Due {when}",
  overdue: "Overdue · {when}",
  priority: "{level} priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
  assignee: "Assigned to {name}",
  subtasks: "{done}/{total}",
  expand: "Show subtasks of “{title}”",
  empty: "No tasks yet",
  allDone: "All done. Nice work.",
  toggleError: "Couldn't update “{title}”",
  saveError: "Couldn't save the task",
  newTask: "New task title",
};
export type TaskListLabels = Partial<typeof taskListLabels>;
type T = LabelFn<typeof taskListLabels>;

function flatten(items: TaskData[]): TaskData[] {
  return items.flatMap((i) => [i, ...(i.children ? flatten(i.children) : [])]);
}

function applyDone(items: TaskData[], overrides: Record<string, boolean>): TaskData[] {
  return items.map((i) => ({ ...i, done: overrides[i.id] ?? i.done, children: i.children ? applyDone(i.children, overrides) : undefined }));
}

/* ------------------------------------------------------------------ */
/* TaskList                                                             */
/* ------------------------------------------------------------------ */

export interface TaskListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onToggle"> {
  items: TaskData[];
  /** Check / uncheck. Updates optimistically; a rejection reverts and shows a toast. */
  onToggle?: (id: string, done: boolean) => void | Promise<void>;
  /** Shows the add input (and "Add subtask" with `parentId`). Enter creates and keeps focus. */
  onAdd?: (title: string, parentId?: string) => void | Promise<void>;
  /** Title edits (click the pencil, Enter saves, Esc cancels). */
  onEdit?: (id: string, patch: Partial<TaskData>) => void | Promise<void>;
  onRemove?: (id: string) => void | Promise<void>;
  /** Keyboard reorder: Alt+↑ / Alt+↓ on a task. Receives the new sibling order. */
  onReorder?: (ids: string[], parentId?: string) => void | Promise<void>;
  /** Heading above the list ("Onboarding — week 1"). */
  title?: React.ReactNode;
  /** Header "Hide completed" toggle (controlled / uncontrolled). */
  hideCompleted?: boolean;
  defaultHideCompleted?: boolean;
  onHideCompletedChange?: (hide: boolean) => void;
  /** Progress bar + "3 of 7 done". Default `true`. */
  showProgress?: boolean;
  /** Done tasks move below open ones. Default `false`. */
  sortCompleted?: boolean;
  /** `list` (assignee, due, priority) or `checklist` (titles only). Default `"list"`. */
  variant?: "list" | "checklist";
  /** Today for due states, `YYYY-MM-DD` or a Date (docs, tests). Default: the live clock in the provider time zone. */
  today?: string | Date;
  readOnly?: boolean;
  labels?: TaskListLabels;
}

/**
 * Checkable tasks with assignee, due date, priority and subtasks: deal follow-ups, onboarding,
 * an editorial checklist. Optimistic toggles, inline add and edit, overdue / due-today tones,
 * and a progress header announced politely ("4 of 7 done").
 *
 * ```tsx
 * <TaskList title="Onboarding" items={tasks} onToggle={api.toggle} onAdd={api.add} />
 * <TaskList variant="checklist" items={prePublish} onToggle={toggle} />
 * ```
 */
export const TaskList = React.forwardRef<HTMLDivElement, TaskListProps>(function TaskList(
  {
    items,
    onToggle,
    onAdd,
    onEdit,
    onRemove,
    onReorder,
    title,
    hideCompleted: hideProp,
    defaultHideCompleted = false,
    onHideCompletedChange,
    showProgress = true,
    sortCompleted,
    variant = "list",
    today,
    readOnly,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("taskList", taskListLabels, labels);
  const f = useFormat();
  const { timeZone } = useLocale();
  const now = useNow();
  const todayKey = today ? (typeof today === "string" ? today : dayKey(today, timeZone)) : now === null ? null : dayKey(now, timeZone);
  const [hideState, setHideState] = React.useState(defaultHideCompleted);
  const hide = hideProp ?? hideState;
  const setHide = (v: boolean) => {
    setHideState(v);
    onHideCompletedChange?.(v);
  };
  const [overrides, setOverrides] = React.useState<Record<string, boolean>>({});
  const headingId = React.useId();

  // Drop overrides once the parent's data agrees.
  React.useEffect(() => {
    setOverrides((o) => {
      const flat = new Map(flatten(items).map((i) => [i.id, i.done]));
      let changed = false;
      const next: Record<string, boolean> = {};
      for (const k in o) {
        if (flat.get(k) === o[k]) changed = true;
        else next[k] = o[k]!;
      }
      return changed ? next : o;
    });
  }, [items]);

  const view = React.useMemo(() => applyDone(items, overrides), [items, overrides]);
  const all = flatten(view);
  const done = all.filter((i) => i.done).length;
  const total = all.length;

  const toggle = async (task: TaskData, next: boolean) => {
    if (!onToggle) return;
    setOverrides((o) => ({ ...o, [task.id]: next }));
    try {
      await onToggle(task.id, next);
    } catch {
      setOverrides((o) => {
        const n = { ...o };
        delete n[task.id];
        return n;
      });
      toast.danger(t("toggleError", { title: task.title }));
    }
  };

  const ctx: TaskCtx = {
    t,
    f,
    todayKey,
    variant,
    readOnly: Boolean(readOnly),
    hide,
    sortCompleted: Boolean(sortCompleted),
    toggle,
    onAdd: readOnly ? undefined : onAdd,
    onEdit: readOnly ? undefined : onEdit,
    onRemove: readOnly ? undefined : onRemove,
    onReorder: readOnly ? undefined : onReorder,
  };

  const ratio = total ? done / total : 0;

  return (
    <div ref={ref} data-slot="task-list" data-variant={variant} className={cn("flex flex-col gap-3 [--task-box:1.125rem]", className)} aria-labelledby={title ? headingId : undefined} role={title ? "group" : undefined} {...props}>
      {title || showProgress ? (
        <div data-slot="task-list-header" className="flex flex-col gap-2">
          <div className="flex items-baseline gap-3">
            {title ? (
              <h3 id={headingId} className="text-sm font-semibold text-fg">
                {title}
              </h3>
            ) : null}
            {showProgress && total > 0 ? (
              <span className="text-xs text-fg-muted tabular" aria-live="polite">
                {t("progress", { done: f.number(done), total: f.number(total) })}
              </span>
            ) : null}
            {done > 0 ? (
              <button
                type="button"
                aria-pressed={hide}
                onClick={() => setHide(!hide)}
                className="ms-auto cursor-pointer text-xs font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline focus-ring"
              >
                {hide ? t("showCompleted", { count: f.number(done) }) : t("hideCompleted")}
              </button>
            ) : null}
          </div>
          {showProgress && total > 0 ? (
            <span aria-hidden className="relative block h-1 overflow-hidden rounded-full bg-track">
              <span
                className={cn("absolute inset-y-0 start-0 rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none", ratio === 1 ? "bg-success" : "bg-accent")}
                style={{ width: `${ratio * 100}%` }}
              />
            </span>
          ) : null}
        </div>
      ) : null}

      {total === 0 ? (
        <p className="rounded-ui border border-dashed border-line px-3 py-3 text-[13px] text-fg-subtle">{t("empty")}</p>
      ) : hide && done === total ? (
        <p className="rounded-ui bg-[color-mix(in_srgb,var(--success)_9%,transparent)] px-3 py-2.5 text-[13px] font-medium text-success">{t("allDone")}</p>
      ) : (
        <TaskGroup items={view} ctx={ctx} depth={0} aria-label={typeof title === "string" ? title : t("list")} />
      )}

      {total > 0 && done === total && !hide ? <p className="text-[13px] font-medium text-success">{t("allDone")}</p> : null}

      {ctx.onAdd ? <TaskAdd onAdd={(v) => ctx.onAdd!(v)} t={t} /> : null}
    </div>
  );
});

interface TaskCtx {
  t: T;
  f: ReturnType<typeof useFormat>;
  todayKey: string | null;
  variant: "list" | "checklist";
  readOnly: boolean;
  hide: boolean;
  sortCompleted: boolean;
  toggle: (task: TaskData, done: boolean) => void;
  onAdd?: TaskListProps["onAdd"];
  onEdit?: TaskListProps["onEdit"];
  onRemove?: TaskListProps["onRemove"];
  onReorder?: TaskListProps["onReorder"];
}

function TaskGroup({ items, ctx, depth, parentId, ...props }: { items: TaskData[]; ctx: TaskCtx; depth: number; parentId?: string } & React.HTMLAttributes<HTMLUListElement>) {
  let list = ctx.hide ? items.filter((i) => !i.done) : items;
  if (ctx.sortCompleted) list = [...list.filter((i) => !i.done), ...list.filter((i) => i.done)];
  const ids = items.map((i) => i.id);
  const move = (id: string, delta: -1 | 1) => {
    const from = ids.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= ids.length) return;
    const next = [...ids];
    next.splice(to, 0, next.splice(from, 1)[0]!);
    void ctx.onReorder?.(next, parentId);
  };
  return (
    <ul data-slot="task-group" data-depth={depth} className={cn("flex flex-col", depth > 0 && "ms-[calc(var(--task-box)/2+0.25rem)] border-s border-line ps-3")} {...props}>
      {list.map((task) => (
        <TaskItem key={task.id} task={task} ctx={ctx} depth={depth} parentId={parentId} onMove={ctx.onReorder ? (d) => move(task.id, d) : undefined} />
      ))}
    </ul>
  );
}

function dueInfo(due: string, todayKey: string | null, done: boolean, ctx: TaskCtx): { text: string; tone: "danger" | "warning" | "muted"; spoken: string } {
  if (!todayKey) return { text: ctx.f.date(due, { month: "short", day: "numeric" }), tone: "muted", spoken: ctx.t("due", { when: ctx.f.date(due, "long") }) };
  const days = Math.round((Date.UTC(+due.slice(0, 4), +due.slice(5, 7) - 1, +due.slice(8, 10)) - Date.UTC(+todayKey.slice(0, 4), +todayKey.slice(5, 7) - 1, +todayKey.slice(8, 10))) / 86_400_000);
  const rel = Math.abs(days) <= 6 ? ctx.f.relative(days, "day", { numeric: "auto" }) : ctx.f.date(due, { month: "short", day: "numeric", ...(due.slice(0, 4) !== todayKey.slice(0, 4) ? { year: "numeric" } : {}) });
  const text = rel.charAt(0).toLocaleUpperCase(ctx.f.locale) + rel.slice(1);
  const tone = done ? "muted" : days < 0 ? "danger" : days === 0 ? "warning" : "muted";
  return { text, tone, spoken: tone === "danger" ? ctx.t("overdue", { when: text }) : ctx.t("due", { when: text }) };
}

const PRIORITY_TONE: Record<TaskPriority, string> = {
  low: "text-fg-subtle",
  medium: "text-info",
  high: "text-warning",
  urgent: "text-danger",
};

function TaskItem({ task, ctx, depth, parentId, onMove }: { task: TaskData; ctx: TaskCtx; depth: number; parentId?: string; onMove?: (delta: -1 | 1) => void }) {
  const { t } = ctx;
  const [editing, setEditing] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  const titleId = React.useId();
  const kids = task.children ?? [];
  const kidsDone = flatten(kids).filter((k) => k.done).length;
  const kidsTotal = flatten(kids).length;
  const editBtn = React.useRef<HTMLButtonElement>(null);
  const rich = ctx.variant === "list";
  const due = task.due && rich ? dueInfo(task.due, ctx.todayKey, task.done, ctx) : null;
  const locked = task.disabled || ctx.readOnly;

  return (
    <li
      data-slot="task-item"
      data-done={task.done ? "" : undefined}
      onKeyDown={(e) => {
        if (!onMove || !e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
        if (e.target !== e.currentTarget && (e.target as HTMLElement).closest("li") !== e.currentTarget) return;
        e.preventDefault();
        onMove(e.key === "ArrowUp" ? -1 : 1);
        const el = e.target as HTMLElement;
        requestAnimationFrame(() => el.focus());
      }}
    >
      <div
        className={cn(
          "group/task relative -mx-2 flex items-start gap-2.5 rounded-ui-sm px-2 transition-colors hover:bg-hover",
          rich ? "py-2" : "py-1.5",
        )}
      >
        <Checkbox
          checked={task.done}
          disabled={task.disabled}
          readOnly={ctx.readOnly}
          aria-labelledby={titleId}
          onCheckedChange={(v) => ctx.toggle(task, v === true)}
          className="mt-px"
        />
        <div className="min-w-0 flex-1">
          {editing ? (
            <TaskTitleEditor
              initial={task.title}
              label={t("edit", { title: task.title })}
              onCancel={() => {
                setEditing(false);
                requestAnimationFrame(() => editBtn.current?.focus());
              }}
              onSave={async (title) => {
                try {
                  await ctx.onEdit!(task.id, { title });
                  setEditing(false);
                  requestAnimationFrame(() => editBtn.current?.focus());
                } catch {
                  toast.danger(t("saveError"));
                }
              }}
            />
          ) : (
            <span
              id={titleId}
              className={cn(
                "block text-[13.5px] leading-[var(--task-box)] text-fg transition-colors",
                task.done && "text-fg-subtle line-through decoration-[color-mix(in_srgb,var(--fg-subtle)_70%,transparent)]",
              )}
              onDoubleClick={() => !locked && ctx.onEdit && setEditing(true)}
            >
              {task.title}
            </span>
          )}
          {task.description && !editing ? <p className={cn("mt-0.5 text-xs text-fg-muted", task.done && "text-fg-subtle")}>{task.description}</p> : null}
          {rich && (due || task.priority || task.assignee || kidsTotal > 0) && !editing ? (
            <div data-slot="task-meta" className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
              {kidsTotal > 0 ? (
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpen((o) => !o)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-ui-sm tabular hover:text-fg focus-ring"
                >
                  <ChevronDown className={cn("size-3.5 transition-transform motion-reduce:transition-none", !open && "-rotate-90 rtl:rotate-90")} aria-hidden />
                  {/* Visible "2/5" stays in the name (label-in-name); the hidden prefix names the action. */}
                  <span className="sr-only">{t("expand", { title: task.title })}, </span>
                  {t("subtasks", { done: kidsDone, total: kidsTotal })}
                </button>
              ) : null}
              {due ? (
                <span className={cn("inline-flex items-center gap-1", due.tone === "danger" && "font-medium text-danger", due.tone === "warning" && "font-medium text-warning")}>
                  <CalendarDays className="size-3.5" aria-hidden />
                  <span aria-hidden>{due.text}</span>
                  <span className="sr-only">{due.spoken}</span>
                </span>
              ) : null}
              {task.priority && task.priority !== "low" ? (
                <span className={cn("inline-flex items-center gap-1", PRIORITY_TONE[task.priority], task.done && "text-fg-subtle")}>
                  <Flag className="size-3.5" aria-hidden fill={task.priority === "urgent" ? "currentColor" : "none"} />
                  <span>{t("priority", { level: t(task.priority) })}</span>
                </span>
              ) : null}
              {task.assignee ? (
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" aria-hidden />
                  <span className="sr-only">{t("assignee", { name: task.assignee.name })}</span>
                  <span aria-hidden className="max-sm:hidden">{task.assignee.name.split(" ")[0]}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        {!locked && !editing && (ctx.onEdit || ctx.onRemove || ctx.onAdd) ? (
          <span className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/task:opacity-100 sm:group-focus-within/task:opacity-100 [@media(hover:none)]:opacity-100">
            {ctx.onAdd && depth === 0 && rich ? (
              <IconButton label={t("addSubtaskTo", { title: task.title })} size="xs" tooltip={false} onClick={() => setAdding(true)}>
                <ListPlus />
              </IconButton>
            ) : null}
            {ctx.onEdit ? (
              <IconButton ref={editBtn} label={t("edit", { title: task.title })} size="xs" tooltip={false} onClick={() => setEditing(true)}>
                <Pencil />
              </IconButton>
            ) : null}
            {ctx.onRemove ? (
              <IconButton label={t("remove", { title: task.title })} size="xs" tooltip={false} className="hover:text-danger" onClick={() => void ctx.onRemove!(task.id)}>
                <Trash2 />
              </IconButton>
            ) : null}
          </span>
        ) : null}
      </div>
      {(kids.length > 0 && open) || adding ? (
        <div className="pb-1">
          {kids.length > 0 && open ? <TaskGroup items={kids} ctx={ctx} depth={depth + 1} parentId={task.id} /> : null}
          {adding ? (
            <div className="ms-[calc(var(--task-box)/2+0.25rem)] border-s border-line ps-3">
              <TaskAdd
                autoFocus
                compact
                placeholder={t("addSubtask")}
                t={t}
                onCancel={() => setAdding(false)}
                onAdd={(v) => ctx.onAdd!(v, task.id)}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function TaskTitleEditor({ initial, label, onSave, onCancel }: { initial: string; label: string; onSave: (v: string) => void | Promise<void>; onCancel: () => void }) {
  const [v, setV] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);
  return (
    <input
      autoFocus
      aria-label={label}
      value={v}
      disabled={busy}
      dir="auto"
      onChange={(e) => setV(e.target.value)}
      onBlur={() => !busy && onCancel()}
      onKeyDown={async (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        } else if (e.key === "Enter") {
          e.preventDefault();
          const next = v.trim();
          if (!next || next === initial) return onCancel();
          setBusy(true);
          await onSave(next);
          setBusy(false);
        }
      }}
      className="-my-0.5 h-[calc(var(--task-box)+0.25rem)] w-full rounded-ui-sm border border-field-border-hover bg-field px-1.5 text-[13.5px] text-fg outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_18%,transparent)]"
    />
  );
}

function TaskAdd({ onAdd, onCancel, t, placeholder, autoFocus, compact }: { onAdd: (v: string) => void | Promise<void>; onCancel?: () => void; t: T; placeholder?: string; autoFocus?: boolean; compact?: boolean }) {
  const [v, setV] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <div data-slot="task-add" className={cn("group/add flex items-center gap-2.5 rounded-ui-sm text-fg-subtle focus-within:text-fg-muted", compact ? "py-1" : "-mx-2 px-2 py-1.5 hover:bg-hover")}>
      <Plus className="size-(--task-box) shrink-0 p-px" aria-hidden />
      <input
        ref={ref}
        autoFocus={autoFocus}
        value={v}
        dir="auto"
        disabled={busy}
        placeholder={placeholder ?? t("add")}
        aria-label={placeholder ?? t("add")}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => !v && onCancel?.()}
        onKeyDown={async (e) => {
          if (e.key === "Escape" && onCancel) {
            e.preventDefault();
            onCancel();
          }
          if (e.key !== "Enter") return;
          e.preventDefault();
          const title = v.trim();
          if (!title) return;
          setBusy(true);
          try {
            await onAdd(title);
            setV("");
          } catch {
            toast.danger(t("saveError"));
          } finally {
            setBusy(false);
            requestAnimationFrame(() => ref.current?.focus());
          }
        }}
        className="h-7 min-w-0 flex-1 bg-transparent text-[13.5px] text-fg outline-none placeholder:text-fg-subtle"
      />
    </div>
  );
}
