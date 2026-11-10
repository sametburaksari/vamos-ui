"use client";

/**
 * Time tracker: one running timer across tabs (`TimerButton` + a `TimerAdapter`), a weekly
 * timesheet grid with typed durations and totals (`Timesheet`), and a day-grouped entry list
 * (`TimeEntryList`). Attendance sheets use `ResourceCalendar variant="codes"`.
 */
import * as React from "react";
import { cva } from "class-variance-authority";
import { Lock, Play, Square, TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { SrName } from "../lib/sr-name";
import { useControllableState } from "../lib/use-controllable-state";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { NativeSelect } from "../components/native-select";
import { Input } from "../components/input";
import { EmptyState } from "../components/empty-state";
import { toast } from "../components/toast";
import { addDays } from "../locale-data/core/date";
import type { IsoDate, WorkCalendar } from "../locale-data/core/types";
import { localDate } from "./core/layout";
import { entryMinutes, formatDuration, parseDuration, timesheetTotals, type TimeEntry } from "./core/duration";
import { dayInfo, dtf, fmtDay, resolveWorkCalendar, todayIn, useAnnouncer, useNow, uses24h } from "./shared";

/* ------------------------------------------------------------------ */
/* Adapters                                                            */
/* ------------------------------------------------------------------ */

/** Where the running timer lives. One active entry per user, shared by every tab. */
export interface TimerAdapter {
  getActive(): Promise<TimeEntry | null>;
  start(draft: Partial<TimeEntry>): Promise<TimeEntry>;
  stop(id: string): Promise<TimeEntry>;
  /** Notifies when another tab (or the server) starts / stops the timer. */
  subscribe?(listener: (active: TimeEntry | null) => void): () => void;
}

/** Tab id written into `entry.origin` so a tab knows the timer runs elsewhere. */
const TAB_ID = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `tab-${Math.random().toString(36).slice(2)}`;
type WithOrigin = TimeEntry & { origin?: string };

const newEntryId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `te-${Date.now().toString(36)}`);

/** In-memory adapter (docs, tests, prototypes). `onStop` receives finished entries. */
export function createMemoryTimerAdapter(opts: { initial?: TimeEntry | null; onStop?(entry: TimeEntry): void; now?: () => number } = {}): TimerAdapter {
  let active: WithOrigin | null = opts.initial ?? null;
  const listeners = new Set<(a: TimeEntry | null) => void>();
  const now = opts.now ?? Date.now;
  const emit = () => listeners.forEach((l) => l(active));
  return {
    async getActive() {
      return active;
    },
    async start(draft) {
      active = { id: newEntryId(), ...draft, start: new Date(now()).toISOString(), end: undefined, origin: TAB_ID };
      emit();
      return active;
    },
    async stop(id) {
      if (!active || active.id !== id) throw new Error("No running timer with that id");
      const done: TimeEntry = { ...active, end: new Date(now()).toISOString() };
      active = null;
      opts.onStop?.(done);
      emit();
      return done;
    },
    subscribe(l) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

/**
 * Browser adapter: `localStorage` + `BroadcastChannel`, so starting in one tab shows the timer
 * running in all of them. Persist finished entries in `onStop` (your API).
 */
export function createLocalTimerAdapter(opts: { key?: string; onStop?(entry: TimeEntry): void | Promise<void> } = {}): TimerAdapter {
  const key = opts.key ?? "vamos-ui:timer";
  const read = (): WithOrigin | null => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as WithOrigin) : null;
    } catch {
      return null;
    }
  };
  const write = (v: WithOrigin | null) => {
    try {
      if (v) window.localStorage.setItem(key, JSON.stringify(v));
      else window.localStorage.removeItem(key);
    } catch {
      /* private mode: in-tab only */
    }
    channel?.postMessage(v);
  };
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(key) : null;
  return {
    async getActive() {
      return read();
    },
    async start(draft) {
      const entry: WithOrigin = { id: newEntryId(), ...draft, start: new Date().toISOString(), end: undefined, origin: TAB_ID };
      write(entry);
      return entry;
    },
    async stop(id) {
      const cur = read();
      if (!cur || cur.id !== id) throw new Error("No running timer with that id");
      const done: TimeEntry = { ...cur, end: new Date().toISOString() };
      write(null);
      await opts.onStop?.(done);
      return done;
    },
    subscribe(listener) {
      const onMsg = (e: MessageEvent) => listener((e.data as TimeEntry | null) ?? null);
      const onStorage = (e: StorageEvent) => e.key === key && listener(read());
      channel?.addEventListener("message", onMsg);
      window.addEventListener("storage", onStorage);
      return () => {
        channel?.removeEventListener("message", onMsg);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}

/* ------------------------------------------------------------------ */
/* TimerButton                                                         */
/* ------------------------------------------------------------------ */

export const timeTrackerLabels = {
  start: "Start timer",
  startFor: "Start timer for {project}",
  stop: "Stop timer",
  stopFor: "Stop timer for {project}",
  started: "Timer started for {project}",
  stopped: "Timer stopped. {duration} on {project}",
  noProject: "No project",
  project: "Project",
  note: "What are you working on?",
  notePlaceholder: "Add a note",
  elsewhere: "Running in another tab",
  stale: "Running for {duration}. Still on it?",
  adjust: "Adjust end time",
  failed: "The timer couldn't be updated. Try again.",
  // timesheet
  timesheet: "Timesheet",
  row: "Project",
  total: "Total",
  weekTotal: "Week total",
  rowTotal: "{label}, total {duration}",
  dayTotal: "{day}, total {duration}",
  underTarget: "under the {target} target",
  invalid: "Use 1.5, 1:30, 90m or 1h 30m",
  locked: "Approved. This week is read-only.",
  editHint: "Type a duration, Enter saves, Escape cancels",
  saveFailed: "Couldn't save {duration}. The cell was reset.",
  empty: "No time tracked yet",
  emptyHint: "Start the timer or add an entry.",
  billable: "Billable",
  running: "running",
};
export type TimeTrackerLabels = typeof timeTrackerLabels;

export interface TimerProject {
  id: string;
  label: string;
  /** Client / account shown next to the name. */
  meta?: string;
}

export interface TimerButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  adapter: TimerAdapter;
  projects?: TimerProject[];
  projectId?: string;
  defaultProjectId?: string;
  onProjectChange?(id: string): void;
  /** `"compact"` (top bar pill) or `"full"` (project, note, big counter). Default `"compact"`. */
  variant?: "compact" | "full";
  /** Minutes after which a running timer asks "still on it?". Default 600. */
  staleAfterMin?: number;
  onStart?(entry: TimeEntry): void;
  onStop?(entry: TimeEntry): void;
  /** Shown on a stale timer; open your edit dialog. */
  onAdjust?(entry: TimeEntry): void;
  /** Prefix the document title with the elapsed time while running. Default false. */
  titleTicker?: boolean;
  labels?: Partial<TimeTrackerLabels>;
}

const clock = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/**
 * ```tsx
 * const adapter = React.useMemo(() => createLocalTimerAdapter({ onStop: api.entries.create }), []);
 * <TimerButton adapter={adapter} projects={projects} defaultProjectId="mobile-app" />
 * ```
 */
export const TimerButton = React.forwardRef<HTMLDivElement, TimerButtonProps>(function TimerButton(
  { adapter, projects = [], projectId: projectIdProp, defaultProjectId, onProjectChange, variant = "compact", staleAfterMin = 600, onStart, onStop, onAdjust, titleTicker = false, labels, className, ...props },
  ref,
) {
  const t = useLabels("timeTracker", timeTrackerLabels, labels);
  const { locale } = useLocale();
  const [projectId, setProjectId] = useControllableState<string>({ value: projectIdProp, defaultValue: defaultProjectId ?? projects[0]?.id ?? "", onChange: onProjectChange });
  const [active, setActive] = React.useState<(TimeEntry & { origin?: string }) | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState("");
  const { message, announce } = useAnnouncer();
  const now = useNow(Boolean(active), 1000);

  React.useEffect(() => {
    let alive = true;
    adapter.getActive().then((a) => alive && setActive(a));
    const off = adapter.subscribe?.((a) => setActive(a));
    return () => {
      alive = false;
      off?.();
    };
  }, [adapter]);

  const running = Boolean(active);
  const elapsedSec = active ? Math.max(0, (now - Date.parse(active.start)) / 1000) : 0;
  const project = projects.find((p) => p.id === (active?.projectId ?? projectId));
  const projectName = active?.projectLabel ?? project?.label ?? t("noProject");
  const stale = running && elapsedSec / 60 > staleAfterMin;
  const elsewhere = running && active?.origin !== undefined && active.origin !== TAB_ID;

  // Opt-in document title ticker.
  const baseTitle = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!titleTicker || typeof document === "undefined") return;
    if (running) {
      baseTitle.current ??= document.title;
      document.title = `${clock(elapsedSec).replace(/^00:/, "")} · ${baseTitle.current}`;
    } else if (baseTitle.current !== null) {
      document.title = baseTitle.current;
      baseTitle.current = null;
    }
  }, [titleTicker, running, elapsedSec]);
  React.useEffect(() => () => {
    if (baseTitle.current !== null) document.title = baseTitle.current;
  }, []);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (active) {
        const done = await adapter.stop(active.id);
        setActive(null);
        announce(t("stopped", { duration: formatDuration(entryMinutes(done), locale), project: projectName }));
        onStop?.(done);
      } else {
        const entry = await adapter.start({ projectId: project?.id, projectLabel: project?.label, note: note || undefined });
        setActive(entry);
        announce(t("started", { project: projectName }));
        onStart?.(entry);
      }
    } catch {
      toast.danger(t("failed"));
    } finally {
      setBusy(false);
    }
  };

  const name = running ? t("stopFor", { project: projectName }) : project ? t("startFor", { project: projectName }) : t("start");

  const button = (
    <button
      type="button"
      aria-pressed={running}
      aria-busy={busy || undefined}
      data-slot="timer-button"
      data-running={running ? "" : undefined}
      disabled={busy}
      onClick={toggle}
      className={cn("ui-tt-btn focus-ring", variant === "full" && "ui-tt-btn-lg")}
    >
      {/* Name from a hidden span, not aria-label: the visible clock differs from it (label-in-name). */}
      <span className="sr-only">{name}</span>
      {running ? <span aria-hidden className="ui-tt-pulse" /> : <Play aria-hidden className="ui-tt-ico" />}
      <span aria-hidden className="tabular">{clock(elapsedSec)}</span>
      {variant === "compact" ? <span aria-hidden className="ui-tt-proj">{projectName}</span> : null}
      {running && variant === "full" ? <Square aria-hidden className="ui-tt-ico" /> : null}
    </button>
  );

  return (
    <div ref={ref} data-slot="timer" data-variant={variant} className={cn(variant === "full" ? "ui-tt-full grid gap-3" : "inline-flex items-center gap-2", className)} {...props}>
      {variant === "full" ? (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <label className="grid min-w-[12rem] flex-1 gap-1">
              <span className="text-[12px] font-medium text-fg-muted">{t("project")}</span>
              <NativeSelect value={active?.projectId ?? projectId} disabled={running} onChange={(e) => setProjectId(e.target.value)} items={projects.map((p) => ({ value: p.id, label: p.meta ? `${p.label} · ${p.meta}` : p.label }))} />
            </label>
            <label className="grid min-w-[14rem] flex-[2] gap-1">
              <span className="text-[12px] font-medium text-fg-muted">{t("note")}</span>
              <Input value={active?.note ?? note} disabled={running} onChange={(e) => setNote(e.target.value)} placeholder={t("notePlaceholder")} />
            </label>
            {button}
          </div>
          {elsewhere || stale ? (
            <p className="flex items-center gap-2 text-[12.5px]" data-slot="timer-note">
              {stale ? <TriangleAlert aria-hidden className="size-3.5 text-warning" /> : null}
              <span className={stale ? "text-warning" : "text-fg-muted"}>{stale ? t("stale", { duration: formatDuration(elapsedSec / 60, locale) }) : t("elsewhere")}</span>
              {stale && onAdjust && active ? <Button size="xs" variant="ghost" onClick={() => onAdjust(active)}>{t("adjust")}</Button> : null}
            </p>
          ) : null}
        </>
      ) : (
        <>
          {button}
          {stale ? <span className="sr-only">{t("stale", { duration: formatDuration(elapsedSec / 60, locale) })}</span> : null}
          {stale ? <TriangleAlert aria-hidden className="size-3.5 text-warning" /> : null}
        </>
      )}
      <span className="sr-only" aria-live="polite">{message}</span>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Timesheet                                                           */
/* ------------------------------------------------------------------ */

export interface TimesheetRow {
  id: string;
  label: string;
  meta?: React.ReactNode;
  /** This row can't be edited (e.g. synced from the timer). */
  readOnly?: boolean;
}

export interface TimesheetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** First day, `YYYY-MM-DD`. */
  weekStart: IsoDate;
  /** Number of days. Default 7. */
  days?: number;
  rows: TimesheetRow[];
  /** rowId → YYYY-MM-DD → minutes. */
  value?: Record<string, Record<IsoDate, number>>;
  defaultValue?: Record<string, Record<IsoDate, number>>;
  /** Saves one cell. A rejected promise resets the cell and shows a toast. */
  onCellChange?(rowId: string, day: IsoDate, minutes: number): void | Promise<void>;
  /** Minutes expected per working day; totals under it turn amber. */
  dailyTarget?: number;
  /** Approved / submitted week. */
  locked?: boolean;
  workCalendar?: WorkCalendar;
  /** Cell display. Default `"clock"` (7:30). */
  display?: "clock" | "decimal" | "short";
  labels?: Partial<TimeTrackerLabels>;
}

export const timesheetVariants = cva("ui-ts relative min-w-0", {
  variants: { framed: { true: "surface rounded-ui-lg", false: "" } },
  defaultVariants: { framed: true },
});

/**
 * ```tsx
 * <Timesheet weekStart="2026-11-09" rows={projects} value={hours} onCellChange={save} dailyTarget={8 * 60} />
 * ```
 */
export const Timesheet = React.forwardRef<HTMLDivElement, TimesheetProps>(function Timesheet(
  { weekStart, days: dayCount = 7, rows, value: valueProp, defaultValue, onCellChange, dailyTarget, locked = false, workCalendar, display = "clock", labels, className, ...props },
  ref,
) {
  const t = useLabels("timeTracker", timeTrackerLabels, labels);
  const { locale, timeZone } = useLocale();
  const cal = React.useMemo(() => resolveWorkCalendar(workCalendar, locale), [workCalendar, locale]);
  const today = todayIn(timeZone);
  const days = React.useMemo(() => Array.from({ length: dayCount }, (_, i) => addDays(weekStart, i)), [weekStart, dayCount]);
  const infos = React.useMemo(() => days.map((d) => dayInfo(d, cal, today)), [days, cal, today]);
  const [value, setValue] = useControllableState<Record<string, Record<IsoDate, number>>>({ value: valueProp, defaultValue: defaultValue ?? {} });
  const [overrides, setOverrides] = React.useState<Record<string, number>>({});
  React.useEffect(() => setOverrides({}), [valueProp]);
  const cellValue = (rowId: string, day: IsoDate) => overrides[`${rowId}|${day}`] ?? value[rowId]?.[day] ?? 0;
  const merged = React.useMemo(() => {
    const out: Record<string, Record<IsoDate, number>> = {};
    for (const r of rows) {
      out[r.id] = {};
      for (const d of days) out[r.id]![d] = cellValue(r.id, d);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, days, value, overrides]);
  const totals = timesheetTotals(merged, days);
  const fmt = (min: number) => (min ? formatDuration(min, locale, display) : "");
  const fmtFull = (min: number) => formatDuration(min, locale);

  const [active, setActive] = React.useState({ r: 0, c: 0 });
  const [edit, setEdit] = React.useState<{ r: number; c: number; text: string; error?: boolean } | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const focus = (r: number, c: number) => {
    setActive({ r, c });
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-ts-cell="${r}:${c}"]`)?.focus());
  };
  const editable = (r: number) => !locked && !rows[r]?.readOnly;

  const commit = (r: number, c: number, text: string) => {
    const minutes = parseDuration(text, locale);
    if (minutes === null || minutes < 0 || minutes > 24 * 60) {
      setEdit({ r, c, text, error: true });
      return false;
    }
    const row = rows[r]!;
    const day = days[c]!;
    const prev = cellValue(row.id, day);
    setEdit(null);
    if (minutes === prev) return true;
    const key = `${row.id}|${day}`;
    setOverrides((o) => ({ ...o, [key]: minutes }));
    if (valueProp === undefined) setValue((v) => ({ ...v, [row.id]: { ...v[row.id], [day]: minutes } }));
    Promise.resolve()
      .then(() => onCellChange?.(row.id, day, minutes))
      .catch(() => {
        setOverrides((o) => {
          const n = { ...o };
          delete n[key];
          return n;
        });
        if (valueProp === undefined) setValue((v) => ({ ...v, [row.id]: { ...v[row.id], [day]: prev } }));
        toast.danger(t("saveFailed", { duration: fmtFull(minutes) }));
      });
    return true;
  };

  const onKeyDown = (k: React.KeyboardEvent) => {
    if (edit) return;
    const { r, c } = active;
    const map: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (k.key in map) {
      k.preventDefault();
      const [dr, dc] = map[k.key]!;
      return focus(Math.max(0, Math.min(rows.length - 1, r + dr)), Math.max(0, Math.min(days.length - 1, c + dc)));
    }
    if (k.key === "Home") {
      k.preventDefault();
      return focus(r, 0);
    }
    if (k.key === "End") {
      k.preventDefault();
      return focus(r, days.length - 1);
    }
    if (!editable(r)) return;
    if (k.key === "Enter" || k.key === "F2") {
      k.preventDefault();
      setEdit({ r, c, text: cellValue(rows[r]!.id, days[c]!) ? formatDuration(cellValue(rows[r]!.id, days[c]!), locale, "clock") : "" });
    } else if (k.key === "Delete" || k.key === "Backspace") {
      k.preventDefault();
      commit(r, c, "");
    } else if (k.key.length === 1 && !k.metaKey && !k.ctrlKey && !k.altKey && /[\d.,:]/.test(k.key)) {
      k.preventDefault();
      setEdit({ r, c, text: k.key });
    }
  };

  const titleId = React.useId();
  const hintId = React.useId();

  return (
    <div ref={ref} data-slot="timesheet" data-locked={locked ? "" : undefined} className={cn(timesheetVariants(), className)} {...props}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-2.5">
        <h3 id={titleId} className="me-auto font-heading text-[14px] font-semibold text-fg">
          {t("timesheet")} <span className="font-normal text-fg-muted">· {fmtDay(locale, days[0]!, { day: "numeric", month: "short" })} – {fmtDay(locale, days.at(-1)!, { day: "numeric", month: "short", year: "numeric" })}</span>
        </h3>
        {locked ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-fg-muted">
            <Lock aria-hidden className="size-3.5" />
            {t("locked")}
          </span>
        ) : null}
        <span id={hintId} className="sr-only">{t("editHint")}</span>
      </div>
      <div className="overflow-x-auto">
        <div
          ref={gridRef}
          role="grid"
          aria-labelledby={titleId}
          aria-describedby={hintId}
          aria-readonly={locked || undefined}
          aria-rowcount={rows.length + 2}
          className="ui-ts-grid min-w-max"
          style={{ gridTemplateColumns: `minmax(11rem, 1.6fr) repeat(${days.length}, minmax(4.25rem, 1fr)) minmax(5rem, 1fr)` }}
          onKeyDown={onKeyDown}
        >
          <div role="row" className="ui-ts-row ui-ts-head">
            <div role="columnheader" className="ui-ts-rh">{t("row")}</div>
            {days.map((d, i) => (
              <div key={d} role="columnheader" aria-label={fmtDay(locale, d, { weekday: "long", day: "numeric", month: "long" })} data-off={infos[i]!.working === 0 ? "" : undefined} data-today={infos[i]!.today ? "" : undefined} className="ui-ts-ch" title={infos[i]!.holidays[0]?.name}>
                <span className="text-[10.5px] font-medium text-fg-muted">{fmtDay(locale, d, { weekday: "short" })}</span>
                <span className="ui-ts-daynum tabular">{fmtDay(locale, d, { day: "numeric" })}</span>
              </div>
            ))}
            <div role="columnheader" className="ui-ts-ch ui-ts-totalcol">{t("total")}</div>
          </div>
          {rows.length === 0 ? (
            <div role="row" className="ui-ts-row">
              <div role="gridcell" aria-colspan={days.length + 2} className="col-span-full p-4">
                <EmptyState size="sm" title={t("empty")} description={t("emptyHint")} />
              </div>
            </div>
          ) : null}
          {rows.map((row, r) => (
            <div key={row.id} role="row" className="ui-ts-row">
              <div role="rowheader" className="ui-ts-rh">
                <span className="block truncate text-[13px] font-medium text-fg">{row.label}</span>
                {row.meta ? <span className="block truncate text-[11.5px] text-fg-muted">{row.meta}</span> : null}
              </div>
              {days.map((d, c) => {
                const v = cellValue(row.id, d);
                const isActive = active.r === r && active.c === c;
                const editing = edit && edit.r === r && edit.c === c ? edit : null;
                const dayName = fmtDay(locale, d, { weekday: "long", day: "numeric", month: "long" });
                return (
                  <div
                    key={d}
                    role="gridcell"
                    data-ts-cell={`${r}:${c}`}
                    data-off={infos[c]!.working === 0 ? "" : undefined}
                    data-pending={overrides[`${row.id}|${d}`] !== undefined ? "" : undefined}
                    aria-readonly={!editable(r) || undefined}
                    tabIndex={isActive && !editing ? 0 : -1}
                    className="ui-ts-cell tabular"
                    onFocus={() => !isActive && setActive({ r, c })}
                    onDoubleClick={() => editable(r) && setEdit({ r, c, text: v ? formatDuration(v, locale, "clock") : "" })}
                  >
                    {editing ? (
                      <input
                        autoFocus
                        aria-label={`${row.label}, ${dayName}`}
                        aria-invalid={editing.error || undefined}
                        aria-describedby={editing.error ? `${hintId}-err` : undefined}
                        inputMode="decimal"
                        className="ui-ts-input tabular"
                        value={editing.text}
                        onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}
                        onChange={(e) => setEdit({ ...editing, text: e.target.value, error: false })}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (commit(r, c, editing.text)) focus(Math.min(rows.length - 1, r + 1), c);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setEdit(null);
                            focus(r, c);
                          } else if (e.key === "Tab") {
                            if (commit(r, c, editing.text)) return;
                            e.preventDefault();
                          }
                        }}
                        onBlur={() => {
                          if (edit && !edit.error) commit(r, c, editing.text);
                        }}
                      />
                    ) : (
                      <SrName name={`${row.label}, ${dayName}, ${v ? fmtFull(v) : "0"}`}>{fmt(v)}</SrName>
                    )}
                    {editing?.error ? (
                      <span id={`${hintId}-err`} role="alert" className="ui-ts-error">
                        {t("invalid")}
                      </span>
                    ) : null}
                  </div>
                );
              })}
              <div role="gridcell" className="ui-ts-cell ui-ts-totalcol tabular">
                <SrName name={t("rowTotal", { label: row.label, duration: fmtFull(totals.rows[row.id] ?? 0) })}>{fmt(totals.rows[row.id] ?? 0) || "–"}</SrName>
              </div>
            </div>
          ))}
          <div role="row" className="ui-ts-row ui-ts-foot">
            <div role="rowheader" className="ui-ts-rh text-[12px] font-semibold">{t("total")}</div>
            {days.map((d, c) => {
              const sum = totals.days[d] ?? 0;
              const under = dailyTarget !== undefined && infos[c]!.working > 0 && sum < dailyTarget * infos[c]!.working && compareDay(d, today) <= 0;
              return (
                <div key={d} role="gridcell" data-under={under ? "" : undefined} className="ui-ts-cell tabular">
                  <SrName name={`${t("dayTotal", { day: fmtDay(locale, d, { weekday: "long", day: "numeric", month: "long" }), duration: fmtFull(sum) })}${under ? `, ${t("underTarget", { target: fmtFull(dailyTarget! * infos[c]!.working) })}` : ""}`}>{fmt(sum) || "–"}</SrName>
                </div>
              );
            })}
            <div role="gridcell" className="ui-ts-cell ui-ts-totalcol ui-ts-grand tabular">
              <SrName name={`${t("weekTotal")}, ${fmtFull(totals.total)}`}>{fmt(totals.total) || "–"}</SrName>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const compareDay = (a: IsoDate, b: IsoDate) => (a < b ? -1 : a > b ? 1 : 0);

/* ------------------------------------------------------------------ */
/* TimeEntryList                                                       */
/* ------------------------------------------------------------------ */

export interface TimeEntryListProps extends React.HTMLAttributes<HTMLDivElement> {
  entries: TimeEntry[];
  onEntryOpen?(entry: TimeEntry): void;
  /** Show the hourly rate × time for billable entries. Default false. */
  showAmounts?: boolean;
  labels?: Partial<TimeTrackerLabels>;
}

/** Entries grouped by day (newest first) with day totals. */
export const TimeEntryList = React.forwardRef<HTMLDivElement, TimeEntryListProps>(function TimeEntryList({ entries, onEntryOpen, showAmounts = false, labels, className, ...props }, ref) {
  const t = useLabels("timeTracker", timeTrackerLabels, labels);
  const { locale, timeZone, format } = useLocale();
  const now = useNow(entries.some((e) => !e.end && e.durationMin === undefined), 30_000);
  const h24 = uses24h(locale);
  const timeFmt = dtf(locale, { hour: h24 ? "2-digit" : "numeric", minute: "2-digit", hourCycle: h24 ? "h23" : "h12", timeZone });
  const groups = React.useMemo(() => {
    const map = new Map<IsoDate, TimeEntry[]>();
    for (const e of [...entries].sort((a, b) => Date.parse(b.start) - Date.parse(a.start))) {
      const d = localDate(e.start, timeZone);
      map.set(d, [...(map.get(d) ?? []), e]);
    }
    return [...map];
  }, [entries, timeZone]);
  if (!entries.length) {
    return (
      <div ref={ref} className={cn("p-4", className)} {...props}>
        <EmptyState size="sm" title={t("empty")} description={t("emptyHint")} />
      </div>
    );
  }
  return (
    <div ref={ref} data-slot="time-entry-list" className={cn("ui-tl grid", className)} {...props}>
      {groups.map(([day, list]) => {
        const total = list.reduce((s, e) => s + entryMinutes(e, now), 0);
        const headId = `tl-${day}`;
        return (
          <section key={day} aria-labelledby={headId} className="ui-tl-group">
            <h4 id={headId} className="ui-tl-head">
              <span>{fmtDay(locale, day, { weekday: "long", day: "numeric", month: "long" })}</span>
              <span className="tabular text-fg-muted">{formatDuration(total, locale)}</span>
            </h4>
            <ul className="grid">
              {list.map((e) => {
                const mins = entryMinutes(e, now);
                const runningNow = !e.end && e.durationMin === undefined;
                const amount = showAmounts && e.billable && e.rate ? format.currency(((Number(e.rate.amount) * mins) / 60).toFixed(2), e.rate.currency) : null;
                const body = (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-fg">{e.projectLabel ?? e.projectId ?? t("noProject")}</span>
                      {e.note ? <span className="block truncate text-[12px] text-fg-muted">{e.note}</span> : null}
                    </span>
                    {e.billable ? <Badge size="sm" tone="accent">{t("billable")}</Badge> : null}
                    <span className="hidden w-40 shrink-0 whitespace-nowrap text-end text-[12px] tabular text-fg-muted sm:block">
                      {timeFmt.format(Date.parse(e.start))}–{e.end ? timeFmt.format(Date.parse(e.end)) : "…"}
                    </span>
                    <span className="w-20 shrink-0 text-end text-[13px] font-medium tabular text-fg">
                      {runningNow ? <span role="img" className="ui-tt-pulse me-1.5 inline-block align-middle" aria-label={t("running")} /> : null}
                      {formatDuration(mins, locale, "clock")}
                    </span>
                    {amount ? <span className="w-24 shrink-0 text-end text-[12.5px] tabular text-fg-muted">{amount}</span> : null}
                  </>
                );
                return (
                  <li key={e.id}>
                    {onEntryOpen ? (
                      <button type="button" className="ui-tl-row focus-ring" onClick={() => onEntryOpen(e)}>
                        {body}
                      </button>
                    ) : (
                      <div className="ui-tl-row">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
});
