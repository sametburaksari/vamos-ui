"use client";

/**
 * Gantt: a WBS treegrid (the accessible source of truth: dates, duration, progress,
 * predecessors, all editable inline) beside a time axis with bars, summaries, milestones,
 * finish-to-start links, a today marker and non-working days. Drag to move / resize, drag the
 * end handle onto another bar to link. Zoom: day · week · month · quarter.
 */
import * as React from "react";
import { cva } from "class-variance-authority";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getWeek } from "date-fns";
import { ChevronRight, Diamond, GanttChartSquare } from "lucide-react";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { useControllableState } from "../lib/use-controllable-state";
import { Button } from "../components/button";
import { ToggleGroup, ToggleGroupItem } from "../components/toggle";
import { AvatarGroup, Avatar } from "../components/avatar";
import { EmptyState } from "../components/empty-state";
import { toast } from "../components/toast";
import { usePointerDrag } from "../sortable/use-pointer-drag";
import { useTimeScale } from "../sortable/use-time-scale";
import { addDays, compareIsoDate, diffDays } from "../locale-data/core/date";
import { addWorkingDays } from "../locale-data/core/working-days";
import { getWeekInfo } from "../locale-data/core/week-info";
import type { IsoDate, WorkCalendar } from "../locale-data/core/types";
import { TIME_SCALE_PRESETS, type TickUnit } from "./core/time-scale";
import { createsCycle, flattenTasks, linkViolations, moveTaskTo, rollupSummaries, scheduleForward, taskDuration, visibleTasks, type GanttLinkCore, type GanttTaskCore } from "./core/gantt";
import { clamp, fmtDay, fmtDayRange, resolveWorkCalendar, todayIn, toneColor, useAnnouncer, type ScheduleTone } from "./shared";

/* ------------------------------------------------------------------ */
/* Types & labels                                                      */
/* ------------------------------------------------------------------ */

export const ganttLabels = {
  plan: "Project plan",
  task: "Task",
  assignees: "Owner",
  start: "Start",
  end: "End",
  duration: "Duration",
  progress: "Progress",
  predecessors: "Predecessors",
  zoom: "Zoom",
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  today: "Today",
  resize: "Resize task list",
  workingDays: "{count, plural, one {# working day} other {# working days}}",
  days: "{count, plural, one {# day} other {# days}}",
  milestone: "Milestone",
  summary: "Summary",
  overdue: "overdue",
  done: "done",
  cycle: "That link would create a loop. It wasn't added.",
  saveFailed: "Couldn't save the plan. Your change was undone.",
  empty: "No tasks yet",
  emptyHint: "Add the first task to start the plan.",
  editHint: "Enter edits the cell, Escape cancels",
  invalid: "Not a valid value",
  unknownTask: "No task {wbs}",
  moved: "{title}: {range}",
  linked: "{from} now comes before {to}",
  unlinked: "Link from {from} to {to} removed",
  undo: "Undo",
  weekShort: "W{week}",
  quarterShort: "Q{quarter}",
  noOwner: "Unassigned",
};
export type GanttLabels = typeof ganttLabels;

export interface GanttAssignee {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface GanttTask extends GanttTaskCore {
  title: string;
  /** 0–1 */
  progress?: number;
  assignees?: GanttAssignee[];
  tone?: ScheduleTone | (string & {});
  /** `false` locks this task's dates. */
  editable?: boolean;
}

export type GanttLink = GanttLinkCore;
export type GanttScale = "day" | "week" | "month" | "quarter";
export type GanttColumnKey = "title" | "assignees" | "start" | "end" | "duration" | "progress" | "predecessors";

export interface GanttTaskChange {
  id: string;
  start: IsoDate;
  end: IsoDate;
  progress?: number;
}

export interface GanttProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  tasks: GanttTask[];
  links?: GanttLink[];
  scale?: GanttScale;
  defaultScale?: GanttScale;
  onScaleChange?(scale: GanttScale): void;
  /** Scales offered in the toolbar. Default all four; `[]` hides the switch. */
  scales?: GanttScale[];
  workCalendar?: WorkCalendar;
  /** How durations are counted and shown. Default `"workdays"`. */
  durationUnit?: "workdays" | "days";
  /** One batch per edit: the task and every successor auto-scheduling moved. Optimistic; reject to revert. */
  onTaskChange?(changes: GanttTaskChange[]): void | Promise<void>;
  onLinkCreate?(link: Omit<GanttLink, "id">): void | Promise<void>;
  onLinkDelete?(id: string): void | Promise<void>;
  /** Push FS successors when a task moves. Default true. */
  autoSchedule?: boolean;
  readOnly?: boolean;
  /** Task-list columns, in order. Default title, start, end, duration, progress. */
  columns?: GanttColumnKey[];
  /** Task-list width in px. */
  gridWidth?: number;
  defaultGridWidth?: number;
  onGridWidthChange?(px: number): void;
  /** Collapsed summary ids. */
  collapsed?: string[];
  defaultCollapsed?: string[];
  onCollapsedChange?(ids: string[]): void;
  /** Max height of the chart (CSS length). Default `"32rem"`. */
  height?: string | number;
  /** Row height in px. Default from density (36 / 32). */
  rowHeight?: number;
  /** Rows are virtualized from this count. Default 150. */
  virtualizeAt?: number;
  toolbar?: React.ReactNode;
  /** "Today" for the marker and overdue state. Default: today in the locale time zone. */
  today?: IsoDate;
  labels?: Partial<GanttLabels>;
}

export const ganttVariants = cva("ui-gantt relative flex min-w-0 flex-col", {
  variants: { framed: { true: "surface rounded-ui-lg", false: "" } },
  defaultVariants: { framed: true },
});

const PAD: Record<GanttScale, number> = { day: 4, week: 14, month: 45, quarter: 90 };
const COL_W: Record<Exclude<GanttColumnKey, "title">, number> = { assignees: 76, start: 84, end: 84, duration: 128, progress: 76, predecessors: 104 };

interface EditState {
  row: number;
  col: number;
  value: string;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * ```tsx
 * <Gantt
 *   tasks={plan}
 *   links={[{ id: "l1", from: "design", to: "build", type: "FS" }]}
 *   defaultScale="week"
 *   workCalendar={trWorkCalendar}
 *   onTaskChange={(batch) => api.tasks.updateMany(batch)}
 * />
 * ```
 */
export const Gantt = React.forwardRef<HTMLDivElement, GanttProps>(function Gantt(
  {
    tasks,
    links = [],
    scale: scaleProp,
    defaultScale = "week",
    onScaleChange,
    scales = ["day", "week", "month", "quarter"],
    workCalendar,
    durationUnit = "workdays",
    onTaskChange,
    onLinkCreate,
    onLinkDelete,
    autoSchedule = true,
    readOnly = false,
    columns = ["title", "start", "end", "duration", "progress"],
    gridWidth: gridWidthProp,
    defaultGridWidth,
    onGridWidthChange,
    collapsed: collapsedProp,
    defaultCollapsed = [],
    onCollapsedChange,
    height = "32rem",
    rowHeight: rowHeightProp,
    virtualizeAt = 150,
    toolbar,
    today: todayProp,
    labels,
    className,
    ...props
  },
  ref,
) {
  const { locale, timeZone, dir } = useLocale();
  const rtl = dir === "rtl";
  const t = useLabels("gantt", ganttLabels, labels);
  const [scale, setScale] = useControllableState<GanttScale>({ value: scaleProp, defaultValue: defaultScale, onChange: onScaleChange });
  const [collapsedList, setCollapsed] = useControllableState<string[]>({ value: collapsedProp, defaultValue: defaultCollapsed, onChange: onCollapsedChange });
  const collapsed = React.useMemo(() => new Set(collapsedList), [collapsedList]);
  const fixedCols = columns.filter((c) => c !== "title") as Exclude<GanttColumnKey, "title">[];
  const minGrid = 220;
  const [gridWidth, setGridWidth] = useControllableState<number>({ value: gridWidthProp, defaultValue: defaultGridWidth ?? Math.min(800, 232 + fixedCols.reduce((s, c) => s + COL_W[c], 0)), onChange: onGridWidthChange });
  const cal = React.useMemo(() => resolveWorkCalendar(workCalendar, locale), [workCalendar, locale]);
  const today = todayProp ?? todayIn(timeZone);
  const { message, announce } = useAnnouncer();
  const canEdit = !readOnly && Boolean(onTaskChange);
  const canLink = !readOnly && Boolean(onLinkCreate);

  // Optimistic task patches
  const [patches, setPatches] = React.useState<Record<string, GanttTaskChange>>({});
  React.useEffect(() => setPatches({}), [tasks]);
  const patched = React.useMemo(() => (Object.keys(patches).length ? tasks.map((x) => (patches[x.id] ? { ...x, ...patches[x.id] } : x)) : tasks), [tasks, patches]);
  const rolled = React.useMemo(() => rollupSummaries(patched), [patched]);
  const flat = React.useMemo(() => flattenTasks(rolled), [rolled]);
  const rows = React.useMemo(() => visibleTasks(flat, collapsed), [flat, collapsed]);
  const byId = React.useMemo(() => new Map(flat.map((r) => [r.task.id, r])), [flat]);
  const rowIndex = React.useMemo(() => new Map(rows.map((r, i) => [r.task.id, i])), [rows]);
  const badLinks = React.useMemo(() => linkViolations(rolled, links), [rolled, links]);

  // Time axis
  const bounds = React.useMemo(() => {
    let s: IsoDate | undefined;
    let e: IsoDate | undefined;
    for (const x of rolled) {
      if (!s || compareIsoDate(x.start, s) < 0) s = x.start;
      if (!e || compareIsoDate(x.end, e) > 0) e = x.end;
    }
    s ??= today;
    e ??= addDays(today, 30);
    if (compareIsoDate(today, s) < 0) s = today;
    if (compareIsoDate(today, e) > 0) e = today;
    return { start: addDays(s, -PAD[scale]), end: addDays(e, PAD[scale] + 1) };
  }, [rolled, today, scale]);
  const ts = useTimeScale({ start: bounds.start, end: bounds.end, scale, timeZone: "UTC", locale, workCalendar: scale === "day" ? cal : undefined });
  const preset = TIME_SCALE_PRESETS[scale];
  const xOf = (d: IsoDate) => ts.toPx(d);
  const wOf = (s: IsoDate, e: IsoDate) => Math.max(ts.pxPerDay, ts.toPx(addDays(e, 1)) - ts.toPx(s));

  // Row height (density aware)
  const probe = React.useRef<HTMLSpanElement>(null);
  const [measuredRow, setMeasuredRow] = React.useState(36);
  React.useLayoutEffect(() => {
    const h = probe.current?.offsetHeight;
    if (h && h > 10) setMeasuredRow(h);
  }, []);
  const rowH = rowHeightProp ?? measuredRow;

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const virtual = rows.length >= virtualizeAt;
  const virtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => scrollRef.current, estimateSize: () => rowH, overscan: 10, enabled: virtual });
  const items = virtual ? virtualizer.getVirtualItems().map((v) => v.index) : rows.map((_, i) => i);
  const bodyH = rows.length * rowH;

  /* -------- changes -------- */

  const commitTask = React.useCallback(
    (id: string, next: { start: IsoDate; end: IsoDate; progress?: number }) => {
      if (!onTaskChange) return;
      const base = tasks.map((x) => (patches[x.id] ? { ...x, ...patches[x.id] } : x));
      const edited = base.map((x) => (x.id === id ? { ...x, ...next } : x));
      const scheduled = autoSchedule ? scheduleForward(edited, links, cal, durationUnit) : edited;
      const changes: GanttTaskChange[] = [];
      scheduled.forEach((x, i) => {
        const before = base[i]!;
        if (x.start !== before.start || x.end !== before.end || x.progress !== before.progress) changes.push({ id: x.id, start: x.start, end: x.end, ...(x.progress !== undefined ? { progress: x.progress } : null) });
      });
      if (!changes.length) return;
      setPatches((p) => ({ ...p, ...Object.fromEntries(changes.map((c) => [c.id, c])) }));
      const title = byId.get(id)?.task.title ?? "";
      announce(t("moved", { title, range: fmtDayRange(locale, next.start, next.end, { day: "numeric", month: "short" }) }));
      Promise.resolve()
        .then(() => onTaskChange(changes))
        .catch(() => {
          setPatches({});
          toast.danger(t("saveFailed"));
        });
    },
    [onTaskChange, tasks, patches, autoSchedule, links, cal, durationUnit, byId, announce, t, locale],
  );

  const addLink = React.useCallback(
    (from: string, to: string) => {
      if (!onLinkCreate || from === to || links.some((l) => l.from === from && l.to === to)) return;
      if (createsCycle(links, from, to)) {
        toast.danger(t("cycle"));
        return;
      }
      Promise.resolve(onLinkCreate({ from, to, type: "FS" })).catch(() => toast.danger(t("saveFailed")));
      announce(t("linked", { from: byId.get(from)?.task.title ?? from, to: byId.get(to)?.task.title ?? to }));
    },
    [onLinkCreate, links, t, announce, byId],
  );

  const removeLink = React.useCallback(
    (id: string) => {
      const l = links.find((x) => x.id === id);
      if (!onLinkDelete || !l) return;
      Promise.resolve(onLinkDelete(id)).then(
        () => {
          const msg = t("unlinked", { from: byId.get(l.from)?.task.title ?? l.from, to: byId.get(l.to)?.task.title ?? l.to });
          if (onLinkCreate) toast(msg, { action: { label: t("undo"), onClick: () => void onLinkCreate({ from: l.from, to: l.to, type: l.type ?? "FS", lagDays: l.lagDays }) } });
          announce(msg);
        },
        () => toast.danger(t("saveFailed")),
      );
    },
    [onLinkDelete, onLinkCreate, links, t, announce, byId],
  );

  /* -------- formatting -------- */

  const fmtDate = (d: IsoDate) => fmtDay(locale, d, { day: "numeric", month: "short" });
  const durationText = (x: GanttTask) => {
    if (x.type === "milestone") return t("milestone");
    const n = taskDuration(x, cal, durationUnit);
    return durationUnit === "workdays" ? t("workingDays", { count: n }) : t("days", { count: n });
  };
  const pctFmt = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
  const pct = { format: (v: number) => pctFmt.format(v).replace(/[\u202f\u00a0]/g, " ") };
  const predecessorText = (id: string) =>
    links
      .filter((l) => l.to === id)
      .map((l) => byId.get(l.from)?.wbs)
      .filter(Boolean)
      .join(", ");

  /* -------- treegrid focus / editing -------- */

  const colKeys = columns;
  const [active, setActive] = React.useState({ row: 0, col: 0 });
  const [edit, setEdit] = React.useState<EditState | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const ar = clamp(active.row, 0, Math.max(0, rows.length - 1));
  const ac = clamp(active.col, 0, colKeys.length - 1);

  const focusCell = (row: number, col: number) => {
    setActive({ row, col });
    if (virtual) virtualizer.scrollToIndex(row, { align: "auto" });
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-gantt-cell="${row}:${col}"]`)?.focus());
  };
  const toggle = (id: string, open?: boolean) => {
    const isOpen = !collapsed.has(id);
    const want = open ?? !isOpen;
    if (want === isOpen) return;
    setCollapsed((list) => (want ? list.filter((x) => x !== id) : [...list, id]));
  };
  const isEditable = (key: GanttColumnKey, task: GanttTask) => {
    if (key === "predecessors") return canLink || Boolean(onLinkDelete);
    if (!canEdit || task.editable === false || task.type === "summary" || byId.get(task.id)?.hasChildren) return false;
    if (key === "duration" && task.type === "milestone") return false;
    return key === "start" || key === "end" || key === "duration" || key === "progress";
  };
  const startEdit = (row: number, col: number) => {
    const r = rows[row];
    const key = colKeys[col]!;
    if (!r || !isEditable(key, r.task)) return false;
    const x = r.task;
    const value = key === "start" ? x.start : key === "end" ? x.end : key === "duration" ? String(taskDuration(x, cal, durationUnit)) : key === "progress" ? String(Math.round((x.progress ?? 0) * 100)) : predecessorText(x.id);
    setEdit({ row, col, value });
    return true;
  };
  const commitEdit = () => {
    if (!edit) return;
    const r = rows[edit.row]!;
    const x = r.task;
    const key = colKeys[edit.col]!;
    const v = edit.value.trim();
    const fail = (msg = t("invalid")) => setEdit({ ...edit, error: msg });
    if (key === "start") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return fail();
      const moved = moveTaskTo(x, v, durationUnit === "workdays" ? cal : undefined, durationUnit);
      commitTask(x.id, { start: moved.start, end: moved.end });
    } else if (key === "end") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || compareIsoDate(v, x.start) < 0) return fail();
      commitTask(x.id, x.type === "milestone" ? { start: v, end: v } : { start: x.start, end: v });
    } else if (key === "duration") {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1) return fail();
      commitTask(x.id, { start: x.start, end: durationUnit === "workdays" ? addWorkingDays(x.start, n - 1, cal) : addDays(x.start, n - 1) });
    } else if (key === "progress") {
      const n = Number(v.replace("%", "").replace(",", "."));
      if (!Number.isFinite(n) || n < 0 || n > 100) return fail();
      commitTask(x.id, { start: x.start, end: x.end, progress: n / 100 });
    } else if (key === "predecessors") {
      const wbsList = v ? v.split(/[\s,;]+/).filter(Boolean) : [];
      const ids: string[] = [];
      for (const w of wbsList) {
        const found = flat.find((f) => f.wbs === w);
        if (!found) return fail(t("unknownTask", { wbs: w }));
        ids.push(found.task.id);
      }
      const current = links.filter((l) => l.to === x.id);
      for (const l of current) if (!ids.includes(l.from)) removeLink(l.id);
      for (const id of ids) if (!current.some((l) => l.from === id)) addLink(id, x.id);
    }
    setEdit(null);
    focusCell(edit.row, edit.col);
  };

  const onGridKeyDown = (k: React.KeyboardEvent) => {
    if (edit) return;
    const el = k.target as HTMLElement;
    if (!el.dataset.ganttCell) return;
    const row = rows[ar];
    const h = rtl ? -1 : 1;
    const key = k.key === "ArrowRight" && h < 0 ? "ArrowLeft" : k.key === "ArrowLeft" && h < 0 ? "ArrowRight" : k.key;
    switch (key) {
      case "ArrowDown":
        k.preventDefault();
        return focusCell(Math.min(rows.length - 1, ar + 1), ac);
      case "ArrowUp":
        k.preventDefault();
        return focusCell(Math.max(0, ar - 1), ac);
      case "ArrowRight":
        k.preventDefault();
        if (ac === 0 && row?.hasChildren && collapsed.has(row.task.id)) return toggle(row.task.id, true);
        return focusCell(ar, Math.min(colKeys.length - 1, ac + 1));
      case "ArrowLeft":
        k.preventDefault();
        if (ac === 0 && row?.hasChildren && !collapsed.has(row.task.id)) return toggle(row.task.id, false);
        if (ac === 0 && row?.parentId) return focusCell(rowIndex.get(row.parentId) ?? ar, 0);
        return focusCell(ar, Math.max(0, ac - 1));
      case "Home":
        k.preventDefault();
        return focusCell(k.ctrlKey ? 0 : ar, 0);
      case "End":
        k.preventDefault();
        return focusCell(k.ctrlKey ? rows.length - 1 : ar, colKeys.length - 1);
      case "Enter":
      case "F2":
        k.preventDefault();
        if (!startEdit(ar, ac) && row?.hasChildren && colKeys[ac] === "title") toggle(row.task.id);
        return;
    }
  };

  /* -------- splitter -------- */

  const splitStart = React.useRef(gridWidth);
  const split = usePointerDrag({
    axis: "x",
    onStart: () => {
      splitStart.current = gridWidth;
    },
    onMove: (s) => setGridWidth(clamp(splitStart.current + s.rawDelta.x * (rtl ? -1 : 1), minGrid, 1200)),
  });

  /* -------- render -------- */

  const scaleLabel: Record<GanttScale, string> = { day: t("day"), week: t("week"), month: t("month"), quarter: t("quarter") };
  const majorTicks = ts.ticks(preset.major as TickUnit);
  const minorTicks = ts.ticks(preset.minor as TickUnit);
  const todayX = compareIsoDate(today, bounds.start) >= 0 && compareIsoDate(today, bounds.end) < 0 ? xOf(today) + ts.pxPerDay / 2 : null;
  const weekOpts = React.useMemo(() => {
    const wi = getWeekInfo(locale);
    return { weekStartsOn: (wi.firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6, firstWeekContainsDate: (wi.minimalDays >= 4 ? 4 : 1) as 1 | 4 };
  }, [locale]);
  const tickLabel = (unit: TickUnit, date: IsoDate, width: number) => {
    const [y, m, d] = date.split("-").map(Number) as [number, number, number];
    switch (unit) {
      case "day":
        return width >= 30 ? fmtDay(locale, date, { day: "numeric" }) : "";
      case "week":
        return t("weekShort", { week: getWeek(new Date(y, m - 1, d), weekOpts) });
      case "month":
        return fmtDay(locale, date, width > 90 ? { month: "long", year: scale === "week" || scale === "day" ? "numeric" : undefined } : { month: "short" });
      case "quarter":
        return t("quarterShort", { quarter: Math.floor((m - 1) / 3) + 1 });
      case "year":
        return String(y);
      default:
        return "";
    }
  };

  const gridTemplate = `minmax(12rem, 1fr) ${fixedCols.map((c) => `${COL_W[c]}px`).join(" ")}`;
  const totalWidth = gridWidth + ts.width;

  if (!rows.length) {
    return (
      <div ref={ref} data-slot="gantt" className={cn(ganttVariants(), "p-6", className)} {...props}>
        <EmptyState size="sm" icon={<GanttChartSquare />} title={t("empty")} description={t("emptyHint")} />
      </div>
    );
  }

  return (
    <div ref={ref} data-slot="gantt" data-scale={scale} data-readonly={readOnly ? "" : undefined} className={cn(ganttVariants(), className)} style={{ ["--gantt-row" as string]: `${rowH}px` }} {...props}>
      <span ref={probe} aria-hidden className="ui-gantt-probe" />
      {(scales.length > 1 || toolbar) ? (
        <div data-slot="gantt-toolbar" className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2.5 sm:px-4">
          <Button size="sm" onClick={() => { if (scrollRef.current && todayX !== null) scrollRef.current.scrollLeft = Math.max(0, todayX - (scrollRef.current.clientWidth - gridWidth) / 2); }}>
            {t("today")}
          </Button>
          <div className="me-auto" />
          {toolbar}
          {scales.length > 1 ? (
            <ToggleGroup size="sm" aria-label={t("zoom")} value={scale} onValueChange={(v) => v && setScale(v as GanttScale)}>
              {scales.map((s) => <ToggleGroupItem key={s} value={s}>{scaleLabel[s]}</ToggleGroupItem>)}
            </ToggleGroup>
          ) : null}
        </div>
      ) : null}

      <div ref={scrollRef} data-slot="gantt-scroll" className="ui-gantt-scroll relative min-h-0 overflow-auto overscroll-contain" style={{ maxHeight: typeof height === "number" ? `${height}px` : height }}>
        <div className="relative flex" style={{ width: totalWidth }}>
          {/* Task list: WAI-ARIA treegrid holding all information */}
          <div className="ui-gantt-gridpane sticky z-[4] shrink-0" style={{ width: gridWidth, insetInlineStart: 0 }}>
            <div ref={gridRef} role="treegrid" aria-label={t("plan")} aria-rowcount={flat.length + 1} aria-colcount={colKeys.length} aria-readonly={!canEdit || undefined} onKeyDown={onGridKeyDown} className="ui-gantt-grid">
              <div role="row" aria-rowindex={1} className="ui-gantt-ghead sticky top-0 z-[2] grid" style={{ gridTemplateColumns: gridTemplate }}>
                {colKeys.map((k) => (
                  <div key={k} role="columnheader" className={cn("ui-gantt-gh", k !== "title" && "justify-end text-end")}>
                    {t(k === "title" ? "task" : k)}
                  </div>
                ))}
              </div>
              <div className="relative" style={{ height: bodyH }}>
                {items.map((i) => {
                  const r = rows[i]!;
                  const x = r.task;
                  const isSummary = x.type === "summary" || r.hasChildren;
                  const overdue = x.type !== "milestone" && !isSummary && (x.progress ?? 0) < 1 && compareIsoDate(x.end, today) < 0;
                  return (
                    <div
                      key={x.id}
                      role="row"
                      aria-rowindex={r.index + 1}
                      aria-level={r.depth + 1}
                      aria-expanded={r.hasChildren ? !collapsed.has(x.id) : undefined}
                      aria-selected={i === ar}
                      data-slot="gantt-row"
                      data-summary={isSummary ? "" : undefined}
                      data-active={i === ar ? "" : undefined}
                      className="ui-gantt-row absolute inset-x-0 grid"
                      style={{ top: i * rowH, height: rowH, gridTemplateColumns: gridTemplate }}
                    >
                      {colKeys.map((k, ci) => {
                        const editing = edit && edit.row === i && edit.col === ci ? edit : null;
                        const cellProps = {
                          role: "gridcell",
                          "data-gantt-cell": `${i}:${ci}`,
                          tabIndex: i === ar && ci === ac ? 0 : -1,
                          onFocus: () => (i !== ar || ci !== ac) && setActive({ row: i, col: ci }),
                          onDoubleClick: () => startEdit(i, ci),
                          "aria-readonly": !isEditable(k, x) || undefined,
                        } as const;
                        if (editing) {
                          return (
                            <div key={k} {...cellProps} className="ui-gantt-cell ui-gantt-editing">
                              <input
                                autoFocus
                                aria-label={`${t(k === "title" ? "task" : k)}, ${x.title}`}
                                aria-invalid={editing.error ? true : undefined}
                                title={editing.error}
                                type={k === "start" || k === "end" ? "date" : k === "duration" || k === "progress" ? "number" : "text"}
                                min={k === "duration" ? 1 : k === "progress" ? 0 : undefined}
                                max={k === "progress" ? 100 : undefined}
                                className="ui-gantt-input"
                                value={editing.value}
                                onChange={(e) => setEdit({ ...editing, value: e.target.value, error: undefined })}
                                onKeyDown={(e) => {
                                  e.stopPropagation();
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    commitEdit();
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    setEdit(null);
                                    focusCell(i, ci);
                                  }
                                }}
                                onBlur={() => setEdit(null)}
                              />
                            </div>
                          );
                        }
                        if (k === "title") {
                          return (
                            <div key={k} {...cellProps} className="ui-gantt-cell ui-gantt-title" style={{ paddingInlineStart: `calc(0.5rem + ${r.depth} * 1.125rem)` }}>
                              {r.hasChildren ? (
                                <button type="button" tabIndex={-1} aria-hidden className="ui-gantt-twisty" data-open={!collapsed.has(x.id) ? "" : undefined} onClick={() => toggle(x.id)}>
                                  <ChevronRight className="rtl:-scale-x-100" />
                                </button>
                              ) : (
                                <span className="ui-gantt-twisty" aria-hidden>{x.type === "milestone" ? <Diamond className="ui-gantt-mico" /> : null}</span>
                              )}
                              <span className="ui-gantt-wbs tabular" aria-hidden>{r.wbs}</span>
                              <span className="truncate">{x.title}</span>
                              {overdue ? <span className="sr-only">, {t("overdue")}</span> : null}
                            </div>
                          );
                        }
                        let content: React.ReactNode = null;
                        if (k === "start") content = fmtDate(x.start);
                        else if (k === "end") content = fmtDate(x.end);
                        else if (k === "duration") content = durationText(x);
                        else if (k === "progress") content = x.type === "milestone" ? ((x.progress ?? 0) >= 1 ? t("done") : "–") : pct.format(x.progress ?? 0);
                        else if (k === "predecessors") content = predecessorText(x.id) || "–";
                        else if (k === "assignees")
                          content = x.assignees?.length ? (
                            <AvatarGroup size="xs" max={3}>
                              {x.assignees.map((a) => <Avatar key={a.id} name={a.name} src={a.avatarUrl ?? undefined} />)}
                            </AvatarGroup>
                          ) : isSummary ? null : <span className="text-fg-subtle"><span aria-hidden>–</span><span className="sr-only">{t("noOwner")}</span></span>;
                        return (
                          <div key={k} {...cellProps} data-overdue={overdue && k === "end" ? "" : undefined} className="ui-gantt-cell justify-end text-end tabular">
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Splitter */}
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label={t("resize")}
              aria-valuenow={Math.round(gridWidth)}
              aria-valuemin={minGrid}
              aria-valuemax={1200}
              tabIndex={0}
              data-slot="gantt-splitter"
              className="ui-gantt-split focus-ring"
              style={split.bind.style}
              onPointerDown={split.bind.onPointerDown}
              onKeyDown={(k) => {
                const d = k.key === "ArrowRight" ? 24 : k.key === "ArrowLeft" ? -24 : 0;
                if (!d) return;
                k.preventDefault();
                setGridWidth(clamp(gridWidth + d * (rtl ? -1 : 1), minGrid, 1200));
              }}
            />
          </div>

          {/* Timeline: visual only (the treegrid carries the information) */}
          <div aria-hidden data-slot="gantt-timeline" className="ui-gantt-timeline relative shrink-0" style={{ width: ts.width }}>
            <div className="ui-gantt-thead sticky top-0 z-[3]">
              <div className="relative h-1/2">
                {majorTicks.map((tk) => (
                  <div key={tk.start} className="ui-gantt-major" style={{ insetInlineStart: tk.x, width: tk.width }}>
                    <span className="sticky truncate" style={{ insetInlineStart: gridWidth + 8 }}>{tickLabel(preset.major as TickUnit, tk.date, tk.width)}</span>
                  </div>
                ))}
              </div>
              <div className="relative h-1/2">
                {minorTicks.map((tk) => (
                  <div key={tk.start} className="ui-gantt-minor tabular" data-off={tk.working === 0 ? "" : undefined} data-today={scale === "day" && tk.date === today ? "" : undefined} style={{ insetInlineStart: tk.x, width: tk.width }}>
                    {tickLabel(preset.minor as TickUnit, tk.date, tk.width)}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative" style={{ height: bodyH }}>
              {/* grid lines + non-working */}
              {minorTicks.map((tk) => (
                <div key={tk.start} className="ui-gantt-vline" data-off={tk.working === 0 ? "" : tk.working === 0.5 ? "half" : undefined} style={{ insetInlineStart: tk.x, width: tk.width }} />
              ))}
              {items.map((i) => (
                <div key={`band-${i}`} className="ui-gantt-band" data-active={i === ar ? "" : undefined} style={{ top: i * rowH, height: rowH }} />
              ))}
              {todayX !== null ? <div className="ui-gantt-today" style={{ insetInlineStart: todayX }} /> : null}
              <GanttLinks links={links} rows={rows} rowIndex={rowIndex} rowH={rowH} xOf={xOf} wOf={wOf} pxPerDay={ts.pxPerDay} bad={badLinks} width={ts.width} height={bodyH} onDelete={onLinkDelete && !readOnly ? removeLink : undefined} rtl={rtl} />
              {items.map((i) => {
                const r = rows[i]!;
                return (
                  <GanttBarRow
                    key={r.task.id}
                    task={r.task}
                    summary={r.task.type === "summary" || r.hasChildren}
                    top={i * rowH}
                    rowH={rowH}
                    x={xOf(r.task.start)}
                    w={wOf(r.task.start, r.task.end)}
                    pxPerDay={ts.pxPerDay}
                    today={today}
                    editable={canEdit && r.task.editable !== false && !(r.task.type === "summary" || r.hasChildren)}
                    linkable={canLink}
                    rtl={rtl}
                    label={(s, e) => {
                      const n = durationUnit === "workdays" ? taskDuration({ start: s, end: e }, cal, "workdays") : diffDays(s, e) + 1;
                      return `${fmtDayRange(locale, s, e, { day: "numeric", month: "short" })} · ${durationUnit === "workdays" ? t("workingDays", { count: n }) : t("days", { count: n })}`;
                    }}
                    onCommit={(s, e) => commitTask(r.task.id, { start: s, end: e })}
                    onLink={(to) => addLink(r.task.id, to)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{message}</span>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Bars                                                                */
/* ------------------------------------------------------------------ */

interface BarProps {
  task: GanttTask;
  summary: boolean;
  top: number;
  rowH: number;
  x: number;
  w: number;
  pxPerDay: number;
  today: IsoDate;
  editable: boolean;
  linkable: boolean;
  rtl: boolean;
  label(start: IsoDate, end: IsoDate): string;
  onCommit(start: IsoDate, end: IsoDate): void;
  onLink(to: string): void;
}

function GanttBarRow({ task, summary, top, rowH, x, w, pxPerDay, today, editable, linkable, rtl, label, onCommit, onLink }: BarProps) {
  const [preview, setPreview] = React.useState<{ start: IsoDate; end: IsoDate } | null>(null);
  const [linkTo, setLinkTo] = React.useState<{ dx: number; dy: number } | null>(null);
  const sign = rtl ? -1 : 1;
  const daysOf = (dx: number) => Math.round((dx * sign) / pxPerDay);
  const move = usePointerDrag({
    axis: "x",
    disabled: !editable,
    onMove: (s) => {
      const d = daysOf(s.rawDelta.x);
      setPreview({ start: addDays(task.start, d), end: addDays(task.end, d) });
    },
    onEnd: () => {
      if (preview && preview.start !== task.start) onCommit(preview.start, preview.end);
      setPreview(null);
    },
    onCancel: () => setPreview(null),
  });
  const resize = usePointerDrag({
    axis: "x",
    disabled: !editable || task.type === "milestone",
    onMove: (s) => {
      const end = addDays(task.end, daysOf(s.rawDelta.x));
      setPreview({ start: task.start, end: compareIsoDate(end, task.start) < 0 ? task.start : end });
    },
    onEnd: () => {
      if (preview && preview.end !== task.end) onCommit(preview.start, preview.end);
      setPreview(null);
    },
    onCancel: () => setPreview(null),
  });
  const link = usePointerDrag({
    disabled: !linkable,
    onMove: (s) => setLinkTo({ dx: s.rawDelta.x, dy: s.rawDelta.y }),
    onEnd: (s) => {
      setLinkTo(null);
      const el = document.elementFromPoint(s.origin.x + s.rawDelta.x, s.origin.y + s.rawDelta.y)?.closest<HTMLElement>("[data-gantt-bar]");
      const to = el?.dataset.ganttBar;
      if (to && to !== task.id) onLink(to);
    },
    onCancel: () => setLinkTo(null),
  });

  const cur = preview ?? { start: task.start, end: task.end };
  const shift = preview ? (Math.round((Date.parse(preview.start) - Date.parse(task.start)) / 86_400_000) * pxPerDay) : 0;
  const width = preview ? Math.max(pxPerDay, (diffDays(cur.start, cur.end) + 1) * pxPerDay) : w;
  const left = x + shift;
  const overdue = task.type !== "milestone" && !summary && (task.progress ?? 0) < 1 && compareIsoDate(task.end, today) < 0;
  const style = { ["--ev" as string]: toneColor(task.tone), top: top + rowH / 2, insetInlineStart: left } as React.CSSProperties;

  if (task.type === "milestone") {
    return (
      <div data-gantt-bar={task.id} className="ui-gantt-milestone" data-done={(task.progress ?? 0) >= 1 ? "" : undefined} style={{ ...style, insetInlineStart: left + pxPerDay / 2, ...move.bind.style }} onPointerDown={move.bind.onPointerDown}>
        <span className="ui-gantt-mlabel">{task.title}</span>
        {preview ? <span className="ui-gantt-tip">{label(cur.start, cur.end)}</span> : null}
      </div>
    );
  }
  return (
    <div
      data-gantt-bar={task.id}
      data-summary={summary ? "" : undefined}
      data-overdue={overdue ? "" : undefined}
      data-dragging={preview ? "" : undefined}
      className="ui-gantt-bar"
      style={{ ...style, width, ...(editable ? move.bind.style : null) }}
      onPointerDown={editable ? move.bind.onPointerDown : undefined}
    >
      {!summary ? <span className="ui-gantt-progress" style={{ width: `${clamp(task.progress ?? 0, 0, 1) * 100}%` }} /> : null}
      <span className="ui-gantt-barlabel">{task.title}</span>
      {editable ? (
        <span
          className="ui-gantt-handle"
          style={resize.bind.style}
          onPointerDown={(e) => {
            e.stopPropagation();
            resize.bind.onPointerDown(e);
          }}
        />
      ) : null}
      {linkable && !summary ? (
        <span
          className="ui-gantt-connect"
          style={link.bind.style}
          onPointerDown={(e) => {
            e.stopPropagation();
            link.bind.onPointerDown(e);
          }}
        />
      ) : null}
      {linkTo ? (
        <svg className="ui-gantt-linkdraft" width="1" height="1" style={{ insetInlineStart: "100%" }}>
          <line x1={0} y1={0} x2={linkTo.dx * (rtl ? -1 : 1)} y2={linkTo.dy} />
        </svg>
      ) : null}
      {preview ? <span className="ui-gantt-tip">{label(cur.start, cur.end)}</span> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Links                                                               */
/* ------------------------------------------------------------------ */

function GanttLinks({
  links,
  rows,
  rowIndex,
  rowH,
  xOf,
  wOf,
  pxPerDay,
  bad,
  width,
  height,
  onDelete,
  rtl,
}: {
  links: GanttLink[];
  rows: ReturnType<typeof visibleTasks<GanttTask>>;
  rowIndex: Map<string, number>;
  rowH: number;
  xOf(d: IsoDate): number;
  wOf(s: IsoDate, e: IsoDate): number;
  pxPerDay: number;
  bad: Set<string>;
  width: number;
  height: number;
  onDelete?(id: string): void;
  rtl: boolean;
}) {
  const [hot, setHot] = React.useState<string | null>(null);
  const X = (v: number) => (rtl ? width - v : v);
  return (
    <svg className="ui-gantt-links" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <marker id="ui-gantt-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" fill="context-stroke" />
        </marker>
      </defs>
      {links.map((l) => {
        const a = rowIndex.get(l.from);
        const b = rowIndex.get(l.to);
        if (a === undefined || b === undefined) return null;
        const ta = rows[a]!.task;
        const tb = rows[b]!.task;
        const ax = ta.type === "milestone" ? xOf(ta.start) + pxPerDay / 2 + 7 : xOf(ta.start) + wOf(ta.start, ta.end);
        const bx = tb.type === "milestone" ? xOf(tb.start) + pxPerDay / 2 - 7 : xOf(tb.start);
        const ay = a * rowH + rowH / 2;
        const by = b * rowH + rowH / 2;
        const gap = 8;
        const d =
          bx - gap >= ax + gap
            ? `M${X(ax)},${ay} H${X(ax + gap)} V${by} H${X(bx)}`
            : `M${X(ax)},${ay} H${X(ax + gap)} V${ay + (by > ay ? rowH / 2 : -rowH / 2)} H${X(bx - gap)} V${by} H${X(bx)}`;
        return (
          <g key={l.id} data-bad={bad.has(l.id) ? "" : undefined} data-hot={hot === l.id ? "" : undefined} className="ui-gantt-link">
            <path d={d} markerEnd="url(#ui-gantt-arrow)" />
            {onDelete ? (
              <path
                d={d}
                className="ui-gantt-linkhit"
                onPointerEnter={() => setHot(l.id)}
                onPointerLeave={() => setHot(null)}
                onClick={() => onDelete(l.id)}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
