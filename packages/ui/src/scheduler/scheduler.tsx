"use client";

/**
 * Agenda / scheduler: day, week, work week, month and list views over one event model, with
 * overlap layout, drag create / move / resize (snapped), a now line, business hours, holidays
 * and an explicit time zone. Own engine on date-fns + `usePointerDrag` + the scheduler core.
 */
import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { useControllableState } from "../lib/use-controllable-state";
import { SrName } from "../lib/sr-name";
import { Button, IconButton } from "../components/button";
import { ToggleGroup, ToggleGroupItem } from "../components/toggle";
import { Spinner } from "../components/spinner";
import { EmptyState } from "../components/empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { ContextMenu } from "../components/context-menu";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "../components/dialog";
import { Field, Input } from "../components/input";
import { toast } from "../components/toast";
import { usePointerDrag } from "../sortable/use-pointer-drag";
import { addDays, diffDays, compareIsoDate } from "../locale-data/core/date";
import type { IsoDate, WorkCalendar } from "../locale-data/core/types";
import { clockToMinutes } from "./core/time-scale";
import { eventDays, eventsInRange, compareEvents, instantAt, isLaneEvent, layoutDayEvents, localDate, localMinutes, monthWeeks, packLanes, shiftEvent, weekDays, type LaneAssignment, type PositionedEvent } from "./core/layout";
import { clamp, dayInfo, dtf, firstDayOf, fmtClock, fmtDay, fmtDayRange, fmtHour, resolveWorkCalendar, todayIn, toneColor, useAnnouncer, useNow, uses24h, type DayInfo, type ScheduleTone } from "./shared";

/* ------------------------------------------------------------------ */
/* Types & labels                                                      */
/* ------------------------------------------------------------------ */

export const schedulerLabels = {
  today: "Today",
  previous: "Previous",
  next: "Next",
  view: "Calendar view",
  day: "Day",
  week: "Week",
  workweek: "Work week",
  month: "Month",
  list: "List",
  allDay: "All day",
  more: "+{count} more",
  moreLabel: "{count} more on {date}",
  emptyWeek: "Nothing scheduled this week",
  emptyDay: "Nothing scheduled this day",
  emptyHint: "Events you add show up here.",
  tentative: "tentative",
  canceled: "canceled",
  readOnly: "read-only",
  timeRange: "{start} to {end}",
  allDayOn: "all day, {date}",
  multiDay: "{start} to {end}",
  newEvent: "New event",
  slotCursor: "New event at {when}. Arrow keys change the time, Enter creates it.",
  open: "Open",
  changeTime: "Change time…",
  changeTimeTitle: "Change time",
  changeTimeDescription: "Times are in {zone}.",
  date: "Date",
  start: "Start",
  end: "End",
  save: "Save",
  cancel: "Cancel",
  endBeforeStart: "End must be after start.",
  saveFailed: "Couldn't save “{title}”. The change was undone.",
  loading: "Loading events…",
  outsideHours: "Outside business hours",
  moved: "{title}: {when}",
  created: "New event: {when}",
  timeZone: "Times in {zone}",
  nowLine: "Now, {time}",
  events: "{count, plural, one {# event} other {# events}}",
  dayGrid: "{month}",
  weekNumber: "Week {week}",
};
export type SchedulerLabels = typeof schedulerLabels;

export type SchedulerView = "day" | "week" | "workweek" | "month" | "list";

export interface SchedulerEvent {
  id: string;
  title: string;
  /** Timed: UTC ISO instant. All-day: `YYYY-MM-DD`. */
  start: string;
  /** Timed: UTC ISO instant (exclusive). All-day: `YYYY-MM-DD`, the last day (inclusive). */
  end: string;
  allDay?: boolean;
  tone?: ScheduleTone | (string & {});
  status?: "confirmed" | "tentative" | "canceled";
  /** `false` locks the event; an object locks one interaction. Default: editable when `onEventChange` is set. */
  editable?: boolean | { move?: boolean; resize?: boolean };
  location?: string;
  resourceIds?: string[];
  /** Your payload (passed back untouched). */
  data?: unknown;
}

export interface SchedulerEventChange {
  id: string;
  start: string;
  end: string;
  allDay: boolean;
}

export interface SchedulerCreateRange {
  start: string;
  end: string;
  allDay: boolean;
}

export interface SchedulerRenderState {
  view: SchedulerView;
  /** Short block (≤ 30 min) or month / lane bar: render one line. */
  compact: boolean;
  /** The formatted time range ("14:00 – 15:00"). */
  timeLabel: string;
}

export interface SchedulerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  events: SchedulerEvent[];
  view?: SchedulerView;
  defaultView?: SchedulerView;
  onViewChange?(view: SchedulerView): void;
  /** Views offered in the switch. Default `["day", "week", "month", "list"]`. */
  views?: SchedulerView[];
  /** The focused date, `YYYY-MM-DD`. Default: today in `timeZone`. */
  date?: IsoDate;
  defaultDate?: IsoDate;
  onDateChange?(date: IsoDate): void;
  /** Visible days changed (fetch events for them). Inclusive `YYYY-MM-DD` bounds. */
  onRangeChange?(range: { start: IsoDate; end: IsoDate }): void;
  /** Grid line step. Default 30. */
  slotMinutes?: 5 | 10 | 15 | 30 | 60;
  /** Drag / keyboard step. Default 15. Hold Alt while dragging for 5-minute steps. */
  snapMinutes?: number;
  /** Visible part of the day in time views. Default `{ start: "00:00", end: "24:00" }`. */
  dayRange?: { start: string; end: string };
  /** Time scrolled into view on open. Default: business-hours start, else "08:00". */
  scrollToTime?: string;
  /** Height of the scrolling time grid (CSS length). Default `"36rem"`. */
  height?: string | number;
  /** Work days, business hours and holidays. Default from the locale (tr → Turkish public holidays). */
  workCalendar?: WorkCalendar;
  /** Moves and new events outside business hours are refused (danger outline while dragging). */
  restrictToBusinessHours?: boolean;
  /** IANA zone for every time shown and every instant produced. Default: `LocaleProvider` `timeZone`. */
  timeZone?: string;
  /** Drag (or keyboard) on empty time creates a range. */
  onCreate?(range: SchedulerCreateRange): void;
  /** Move / resize. Applied optimistically; a rejected promise reverts the event and shows a toast. */
  onEventChange?(change: SchedulerEventChange): void | Promise<void>;
  /** Click / Enter on an event. */
  onEventOpen?(id: string, event: SchedulerEvent): void;
  renderEvent?(event: SchedulerEvent, state: SchedulerRenderState): React.ReactNode;
  /** Month view: bars per day before "+N more". Default 3. */
  maxEventsPerDay?: number;
  /** `"embedded"` hides the toolbar (cards, side panels). */
  variant?: "full" | "embedded";
  /** Dims events, shows a spinner and keeps the old events visible. */
  loading?: boolean;
  /** No create / move / resize anywhere. */
  readOnly?: boolean;
  /** Extra toolbar content (filters, a "New event" button). */
  toolbar?: React.ReactNode;
  /** List view: number of days from the week start. Default 7. */
  listDays?: number;
  /** Fixed "now" (tests, screenshots). Default: the live clock. */
  now?: Date | number;
  labels?: Partial<SchedulerLabels>;
}

export const schedulerVariants = /*#__PURE__*/ cva("ui-sch relative flex min-w-0 flex-col", {
  variants: {
    variant: {
      full: "surface rounded-ui-lg",
      embedded: "",
    },
  },
  defaultVariants: { variant: "full" },
});

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface DragPreview {
  kind: "move" | "resize" | "create";
  id?: string;
  day: IsoDate;
  startMin: number;
  endMin: number;
  valid: boolean;
}

interface Ctx {
  locale: string;
  tz: string;
  h24: boolean;
  t: ReturnType<typeof useLabels<SchedulerLabels>>;
  view: SchedulerView;
  snap: number;
  slot: number;
  rangeStart: number;
  rangeEnd: number;
  canCreate: boolean;
  readOnly: boolean;
  loading: boolean;
  days: IsoDate[];
  info: Map<IsoDate, DayInfo>;
  businessMinutes: { start: number; end: number }[];
  restrict: boolean;
  renderEvent?: SchedulerProps["renderEvent"];
  describe(e: SchedulerEvent): string;
  timeLabel(e: SchedulerEvent): string;
  canMove(e: SchedulerEvent): boolean;
  canResize(e: SchedulerEvent): boolean;
  commit(e: SchedulerEvent, next: { start: string; end: string }): void;
  open(e: SchedulerEvent): void;
  editTime(e: SchedulerEvent): void;
  create(range: SchedulerCreateRange): void;
  isValidTimed(day: IsoDate, startMin: number, endMin: number): boolean;
  drag: DragPreview | null;
  setDrag(d: DragPreview | null): void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  rtl: boolean;
}
const SchedulerContext = /*#__PURE__*/ React.createContext<Ctx | null>(null);
const useSch = () => {
  const c = React.useContext(SchedulerContext);
  if (!c) throw new Error("Scheduler parts must be used inside <Scheduler>");
  return c;
};

const MIN = 60_000;
const isDateOnly = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

function viewRange(view: SchedulerView, anchor: IsoDate, firstDay: number, workDays: number[], listDays: number): IsoDate[] {
  if (view === "day") return [anchor];
  if (view === "month") return monthWeeks(anchor, firstDay).flat();
  const week = weekDays(anchor, firstDay);
  if (view === "workweek") {
    const ww = week.filter((d) => workDays.includes(isoWd(d)));
    return ww.length ? ww : week;
  }
  if (view === "list") return Array.from({ length: listDays }, (_, i) => addDays(week[0]!, i));
  return week;
}
const isoWd = (d: IsoDate) => {
  const [y, m, day] = d.split("-").map(Number) as [number, number, number];
  const w = new Date(Date.UTC(y, m - 1, day)).getUTCDay();
  return w === 0 ? 7 : w;
};
function stepDate(view: SchedulerView, anchor: IsoDate, dir: 1 | -1, listDays: number): IsoDate {
  if (view === "day") return addDays(anchor, dir);
  if (view === "month") {
    const [y, m] = anchor.split("-").map(Number) as [number, number];
    const idx = y * 12 + (m - 1) + dir;
    return `${String(Math.floor(idx / 12)).padStart(4, "0")}-${String((idx % 12) + 1).padStart(2, "0")}-01`;
  }
  return addDays(anchor, dir * (view === "list" ? Math.max(7, listDays) : 7));
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

/**
 * ```tsx
 * <Scheduler
 *   events={events}
 *   defaultView="week"
 *   timeZone="Europe/Istanbul"
 *   onCreate={(r) => openCreateDialog(r)}
 *   onEventChange={(c) => api.events.update(c)}
 * />
 * ```
 */
export const Scheduler = /*#__PURE__*/ React.forwardRef<HTMLDivElement, SchedulerProps>(function Scheduler(
  {
    events,
    view: viewProp,
    defaultView = "week",
    onViewChange,
    views = ["day", "week", "month", "list"],
    date: dateProp,
    defaultDate,
    onDateChange,
    onRangeChange,
    slotMinutes = 30,
    snapMinutes = 15,
    dayRange,
    scrollToTime,
    height = "36rem",
    workCalendar,
    restrictToBusinessHours = false,
    timeZone,
    onCreate,
    onEventChange,
    onEventOpen,
    renderEvent,
    maxEventsPerDay = 3,
    variant = "full",
    loading = false,
    readOnly = false,
    toolbar,
    listDays = 7,
    now: nowProp,
    labels,
    className,
    ...props
  },
  ref,
) {
  const { locale, timeZone: ctxZone, dir } = useLocale();
  const tz = timeZone ?? ctxZone;
  const t = useLabels("scheduler", schedulerLabels, labels);
  const liveNow = useNow(nowProp === undefined);
  const now = nowProp === undefined ? liveNow : typeof nowProp === "number" ? nowProp : nowProp.getTime();
  // The live clock differs between server render and hydration: draw the now line after mount.
  const [mounted, setMounted] = React.useState(nowProp !== undefined);
  React.useEffect(() => setMounted(true), []);
  const today = todayIn(tz, now);
  const [view, setView] = useControllableState<SchedulerView>({ value: viewProp, defaultValue: defaultView, onChange: onViewChange });
  const [anchor, setAnchor] = useControllableState<IsoDate>({ value: dateProp, defaultValue: defaultDate ?? today, onChange: onDateChange });
  const cal = React.useMemo(() => resolveWorkCalendar(workCalendar, locale), [workCalendar, locale]);
  const firstDay = firstDayOf(cal.locale ?? locale);
  const days = React.useMemo(() => viewRange(view, anchor, firstDay, cal.workDays, listDays), [view, anchor, firstDay, cal.workDays, listDays]);
  const info = React.useMemo(() => new Map(days.map((d) => [d, dayInfo(d, cal, today)] as const)), [days, cal, today]);
  const rangeStart = dayRange ? clockToMinutes(dayRange.start) : 0;
  const rangeEnd = dayRange ? (dayRange.end === "24:00" ? 1440 : clockToMinutes(dayRange.end)) : 1440;
  const businessMinutes = React.useMemo(() => (cal.businessHours ?? []).map((b) => ({ start: clockToMinutes(b.start), end: b.end === "24:00" ? 1440 : clockToMinutes(b.end) })), [cal.businessHours]);
  const h24 = uses24h(locale);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = React.useState<DragPreview | null>(null);
  const [editing, setEditing] = React.useState<SchedulerEvent | null>(null);
  const { message, announce } = useAnnouncer();

  // Optimistic patches, dropped when the events prop changes or a save fails.
  const [patches, setPatches] = React.useState<Record<string, { start: string; end: string }>>({});
  React.useEffect(() => setPatches({}), [events]);
  const shown = React.useMemo(() => (Object.keys(patches).length ? events.map((e) => (patches[e.id] ? { ...e, ...patches[e.id] } : e)) : events), [events, patches]);

  const rangeKey = `${days[0]}|${days.at(-1)}`;
  const onRangeRef = React.useRef(onRangeChange);
  onRangeRef.current = onRangeChange;
  React.useEffect(() => {
    onRangeRef.current?.({ start: days[0]!, end: days.at(-1)! });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey]);

  const timeFmt = React.useMemo(() => dtf(locale, { hour: h24 ? "2-digit" : "numeric", minute: "2-digit", hourCycle: h24 ? "h23" : "h12", timeZone: tz }), [locale, h24, tz]);
  const timeLabel = React.useCallback(
    (e: SchedulerEvent) => {
      if (e.allDay || isDateOnly(e.start)) return t("allDay");
      return `${timeFmt.format(Date.parse(e.start))} – ${timeFmt.format(Date.parse(e.end))}`;
    },
    [timeFmt, t],
  );
  const describe = React.useCallback(
    (e: SchedulerEvent) => {
      const longDay = (d: IsoDate) => fmtDay(locale, d, { weekday: "long", day: "numeric", month: "long" });
      let when: string;
      if (e.allDay || isDateOnly(e.start)) {
        const d = eventDays(e, tz);
        when = d.start === d.end ? t("allDayOn", { date: longDay(d.start) }) : t("multiDay", { start: longDay(d.start), end: longDay(d.end) });
      } else {
        const d = eventDays(e, tz);
        const s = timeFmt.format(Date.parse(e.start));
        const en = timeFmt.format(Date.parse(e.end));
        when = d.start === d.end ? `${longDay(d.start)}, ${t("timeRange", { start: s, end: en })}` : t("multiDay", { start: `${longDay(d.start)} ${s}`, end: `${longDay(d.end)} ${en}` });
      }
      const extra = [e.location, e.status === "tentative" ? t("tentative") : e.status === "canceled" ? t("canceled") : undefined].filter(Boolean);
      return [e.title, when, ...extra].join(", ");
    },
    [locale, tz, t, timeFmt],
  );

  const editableBase = !readOnly && Boolean(onEventChange);
  const canMove = React.useCallback((e: SchedulerEvent) => editableBase && e.editable !== false && !(typeof e.editable === "object" && e.editable.move === false), [editableBase]);
  const canResize = React.useCallback((e: SchedulerEvent) => editableBase && e.editable !== false && !(typeof e.editable === "object" && e.editable.resize === false), [editableBase]);

  const isValidTimed = React.useCallback(
    (day: IsoDate, startMin: number, endMin: number) => {
      if (!restrictToBusinessHours) return true;
      const di = info.get(day) ?? dayInfo(day, cal, today);
      if (di.working === 0) return false;
      const limit = di.partialFrom ? clockToMinutes(di.partialFrom) : 1440;
      const windows = businessMinutes.length ? businessMinutes : [{ start: 0, end: 1440 }];
      return windows.some((w) => startMin >= w.start && endMin <= Math.min(w.end, limit));
    },
    [restrictToBusinessHours, info, cal, today, businessMinutes],
  );

  const commit = React.useCallback(
    (e: SchedulerEvent, next: { start: string; end: string }) => {
      if (!onEventChange || (next.start === e.start && next.end === e.end)) return;
      const allDay = Boolean(e.allDay || isDateOnly(e.start));
      if (!allDay && restrictToBusinessHours) {
        const d = localDate(next.start, tz);
        const s = localMinutes(next.start, tz);
        if (!isValidTimed(d, s, s + (Date.parse(next.end) - Date.parse(next.start)) / MIN)) {
          toast.warning(t("outsideHours"));
          return;
        }
      }
      setPatches((p) => ({ ...p, [e.id]: next }));
      announce(t("moved", { title: e.title, when: describe({ ...e, ...next }).slice(e.title.length + 2) }));
      Promise.resolve()
        .then(() => onEventChange({ id: e.id, start: next.start, end: next.end, allDay }))
        .catch(() => {
          setPatches((p) => {
            const n = { ...p };
            delete n[e.id];
            return n;
          });
          toast.danger(t("saveFailed", { title: e.title }));
        });
    },
    [onEventChange, restrictToBusinessHours, tz, isValidTimed, t, announce, describe],
  );

  const create = React.useCallback(
    (r: SchedulerCreateRange) => {
      if (!onCreate || readOnly) return;
      if (!r.allDay && restrictToBusinessHours) {
        const d = localDate(r.start, tz);
        const s = localMinutes(r.start, tz);
        if (!isValidTimed(d, s, s + (Date.parse(r.end) - Date.parse(r.start)) / MIN)) {
          toast.warning(t("outsideHours"));
          return;
        }
      }
      onCreate(r);
    },
    [onCreate, readOnly, restrictToBusinessHours, tz, isValidTimed, t],
  );

  const ctx: Ctx = {
    locale,
    tz,
    h24,
    t,
    view,
    snap: snapMinutes,
    slot: slotMinutes,
    rangeStart,
    rangeEnd,
    canCreate: Boolean(onCreate) && !readOnly,
    readOnly,
    loading,
    days,
    info,
    businessMinutes,
    restrict: restrictToBusinessHours,
    renderEvent,
    describe,
    timeLabel,
    canMove,
    canResize,
    commit,
    open: (e) => onEventOpen?.(e.id, e),
    editTime: (e) => setEditing(e),
    create,
    isValidTimed,
    drag,
    setDrag,
    scrollRef,
    rtl: dir === "rtl",
  };

  const title = React.useMemo(() => {
    if (view === "month") return fmtDay(locale, `${anchor.slice(0, 7)}-15`, { month: "long", year: "numeric" });
    if (view === "day") return fmtDay(locale, anchor, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return fmtDayRange(locale, days[0]!, days.at(-1)!);
  }, [view, anchor, days, locale]);

  const zoneName = React.useMemo(() => {
    try {
      return dtf(locale, { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? tz;
    } catch {
      return tz;
    }
  }, [locale, tz, now]);

  const viewLabel: Record<SchedulerView, string> = { day: t("day"), week: t("week"), workweek: t("workweek"), month: t("month"), list: t("list") };
  const titleId = React.useId();

  return (
    <SchedulerContext.Provider value={ctx}>
      <div
        ref={ref}
        data-slot="scheduler"
        data-view={view}
        data-variant={variant}
        data-loading={loading ? "" : undefined}
        aria-busy={loading || undefined}
        aria-labelledby={variant === "full" ? titleId : undefined}
        role={variant === "full" ? "region" : undefined}
        className={cn(schedulerVariants({ variant }), className)}
        {...props}
      >
        {variant === "full" ? (
          <div data-slot="scheduler-toolbar" className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={() => setAnchor(today)} aria-label={`${t("today")}, ${fmtDay(locale, today, { weekday: "long", day: "numeric", month: "long" })}`}>
                {t("today")}
              </Button>
              <IconButton size="sm" label={t("previous")} onClick={() => setAnchor(stepDate(view, anchor, dir === "rtl" ? 1 : -1, listDays))}>
                <ChevronLeft className="rtl:-scale-x-100" />
              </IconButton>
              <IconButton size="sm" label={t("next")} onClick={() => setAnchor(stepDate(view, anchor, dir === "rtl" ? -1 : 1, listDays))}>
                <ChevronRight className="rtl:-scale-x-100" />
              </IconButton>
            </div>
            <h2 id={titleId} aria-live="polite" className="me-auto min-w-0 truncate font-heading text-[15px] font-semibold tracking-[-0.01em] text-fg">
              {title}
            </h2>
            {loading ? <Spinner size="sm" label={t("loading")} /> : null}
            {toolbar}
            {views.length > 1 ? (
              <ToggleGroup size="sm" aria-label={t("view")} value={view} onValueChange={(v) => v && setView(v as SchedulerView)}>
                {views.map((v) => (
                  <ToggleGroupItem key={v} value={v}>
                    {viewLabel[v]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : null}
          </div>
        ) : null}

        {view === "month" ? (
          <SchedulerMonthView events={shown} anchor={anchor} maxEventsPerDay={maxEventsPerDay} onOpenDay={(d) => { setAnchor(d); if (views.includes("day")) setView("day"); }} />
        ) : view === "list" ? (
          <SchedulerListView events={shown} />
        ) : (
          <SchedulerTimeGrid events={shown} height={height} zoneName={zoneName} scrollToTime={scrollToTime} now={now} showNow={mounted} />
        )}

        <span className="sr-only" aria-live="polite">{message}</span>
        <SchedulerTimeDialog event={editing} onClose={() => setEditing(null)} />
      </div>
    </SchedulerContext.Provider>
  );
});

/* ------------------------------------------------------------------ */
/* Event block (time grid)                                             */
/* ------------------------------------------------------------------ */

function eventStyle(e: SchedulerEvent): React.CSSProperties {
  return { ["--ev" as string]: toneColor(e.tone) };
}

function EventContextMenu({ event, children }: { event: SchedulerEvent; children: React.ReactElement }) {
  const c = useSch();
  const items = [
    { id: "open", label: c.t("open"), onSelect: () => c.open(event) },
    ...(c.canMove(event) ? [{ id: "time", label: c.t("changeTime"), onSelect: () => c.editTime(event) }] : []),
  ];
  return <ContextMenu items={items}>{children}</ContextMenu>;
}

interface DragRef {
  pxPerMin: number;
  colWidth: number;
  rowHeight: number;
  dragged: boolean;
}

function useEventKeys(e: SchedulerEvent, mode: "time" | "days" | "month") {
  const c = useSch();
  return (k: React.KeyboardEvent) => {
    if (!k.altKey) return;
    const isLane = mode !== "time";
    let next: { start: string; end: string } | null = null;
    const horiz = (k.key === "ArrowRight" ? 1 : k.key === "ArrowLeft" ? -1 : 0) * (c.rtl ? -1 : 1);
    if (horiz && c.canMove(e)) next = shiftEvent(e, horiz, 0, c.tz);
    else if ((k.key === "ArrowUp" || k.key === "ArrowDown") && !isLane) {
      const d = (k.key === "ArrowDown" ? 1 : -1) * c.snap;
      if (k.shiftKey && c.canResize(e)) {
        const end = Date.parse(e.end) + d * MIN;
        if (end - Date.parse(e.start) >= c.snap * MIN) next = { start: e.start, end: new Date(end).toISOString() };
      } else if (!k.shiftKey && c.canMove(e)) next = shiftEvent(e, 0, d, c.tz);
    } else if ((k.key === "ArrowUp" || k.key === "ArrowDown") && mode === "month" && c.canMove(e)) next = shiftEvent(e, k.key === "ArrowDown" ? 7 : -7, 0, c.tz);
    if (next) {
      k.preventDefault();
      c.commit(e, next);
    }
  };
}

function SchedulerEventBlock({ p }: { p: PositionedEvent<SchedulerEvent> }) {
  const c = useSch();
  const e = p.event;
  const day = localDate(Date.parse(e.start), c.tz);
  const dref = React.useRef<DragRef>({ pxPerMin: 1, colWidth: 1, rowHeight: 1, dragged: false });
  const total = c.rangeEnd - c.rangeStart;
  const durMin = (Date.parse(e.end) - Date.parse(e.start)) / MIN;
  const startLocal = localMinutes(Date.parse(e.start), c.tz);

  const measure = (target: HTMLElement) => {
    const col = target.closest<HTMLElement>("[data-slot=scheduler-column]");
    if (col) {
      dref.current.pxPerMin = col.clientHeight / total || 1;
      dref.current.colWidth = col.offsetWidth || 1;
    }
  };
  const stepOf = (alt: boolean) => (alt ? 5 : c.snap);
  const dayIndex = c.days.indexOf(day);

  const move = usePointerDrag({
    disabled: !c.canMove(e),
    scrollContainer: c.scrollRef,
    onStart: (s) => {
      measure(s.target);
      dref.current.dragged = true;
    },
    onMove: (s) => {
      const step = stepOf(s.altKey);
      const dMin = Math.round(s.rawDelta.y / dref.current.pxPerMin / step) * step;
      const dDay = clamp(Math.round(s.rawDelta.x / dref.current.colWidth) * (c.rtl ? -1 : 1), -Math.max(0, dayIndex), c.days.length - 1 - Math.max(0, dayIndex));
      const startMin = clamp(startLocal + dMin, c.rangeStart, c.rangeEnd - Math.min(durMin, 15));
      const targetDay = addDays(day, dDay);
      const endMin = Math.min(1440, startMin + durMin);
      c.setDrag({ kind: "move", id: e.id, day: targetDay, startMin, endMin, valid: c.isValidTimed(targetDay, startMin, endMin) });
    },
    onEnd: () => {
      const d = c.drag;
      c.setDrag(null);
      if (!d || d.id !== e.id) return;
      if (!d.valid) return;
      const start = instantAt(d.day, d.startMin, c.tz);
      c.commit(e, { start, end: new Date(Date.parse(start) + durMin * MIN).toISOString() });
    },
    onCancel: () => c.setDrag(null),
  });
  const resize = usePointerDrag({
    axis: "y",
    disabled: !c.canResize(e),
    scrollContainer: c.scrollRef,
    onStart: (s) => {
      measure(s.target);
      dref.current.dragged = true;
    },
    onMove: (s) => {
      const step = stepOf(s.altKey);
      const dMin = Math.round(s.rawDelta.y / dref.current.pxPerMin / step) * step;
      const startMin = startLocal;
      const endMin = clamp(startLocal + durMin + dMin, startMin + step, c.rangeEnd);
      c.setDrag({ kind: "resize", id: e.id, day, startMin, endMin, valid: c.isValidTimed(day, startMin, endMin) });
    },
    onEnd: () => {
      const d = c.drag;
      c.setDrag(null);
      if (!d || d.id !== e.id || !d.valid) return;
      c.commit(e, { start: e.start, end: instantAt(d.day, d.endMin, c.tz) });
    },
    onCancel: () => c.setDrag(null),
  });
  const onKeyDown = useEventKeys(e, "time");

  const top = ((p.startMin - c.rangeStart) / total) * 100;
  const h = ((p.endMin - p.startMin) / total) * 100;
  const compact = p.endMin - p.startMin <= 30;
  const dragging = c.drag?.id === e.id;
  const label = c.timeLabel(e);
  const gap = 2;

  return (
    <EventContextMenu event={e}>
      <button
        type="button"
        data-slot="scheduler-event"
        data-status={e.status ?? "confirmed"}
        data-compact={compact ? "" : undefined}
        data-dragging={dragging ? "" : undefined}
        data-continues-before={p.continuesBefore ? "" : undefined}
        data-continues-after={p.continuesAfter ? "" : undefined}
        className="ui-sch-event absolute focus-ring"
        style={{
          ...eventStyle(e),
          top: `${top}%`,
          height: `${h}%`,
          insetInlineStart: `calc(${(p.column / p.columns) * 100}% + ${gap}px)`,
          width: `calc(${(p.span / p.columns) * 100}% - ${gap * 2}px)`,
          ...move.bind.style,
        }}
        onPointerDown={(ev) => {
          ev.stopPropagation();
          dref.current.dragged = false;
          move.bind.onPointerDown(ev);
        }}
        onClick={() => {
          if (dref.current.dragged) return;
          c.open(e);
        }}
        onKeyDown={onKeyDown}
      >
        <SrName name={c.describe(e)}>
          {c.renderEvent ? (
            c.renderEvent(e, { view: c.view, compact, timeLabel: label })
          ) : (
            <span className={cn("flex min-w-0 gap-x-1.5", compact ? "items-baseline" : "flex-col")}>
              <span className="truncate font-medium text-fg">{e.title}</span>
              <span className="truncate tabular text-fg-muted">{compact ? label.split(" – ")[0] : label}</span>
              {!compact && e.location ? <span className="truncate text-fg-subtle">{e.location}</span> : null}
            </span>
          )}
        </SrName>
        {c.canResize(e) && !p.continuesAfter ? (
          <span
            aria-hidden
            data-slot="scheduler-event-resize"
            className="ui-sch-resize"
            style={resize.bind.style}
            onPointerDown={(ev) => {
              ev.stopPropagation();
              dref.current.dragged = false;
              resize.bind.onPointerDown(ev);
            }}
            onClick={(ev) => ev.stopPropagation()}
          />
        ) : null}
      </button>
    </EventContextMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Time grid (day · week · work week)                                  */
/* ------------------------------------------------------------------ */

function SchedulerTimeGrid({ events, height, zoneName, scrollToTime, now, showNow }: { events: SchedulerEvent[]; height: string | number; zoneName: string; scrollToTime?: string; now: number; showNow: boolean }) {
  const c = useSch();
  const { days, tz, t, locale, rangeStart, rangeEnd } = c;
  const total = rangeEnd - rangeStart;
  const visible = React.useMemo(() => eventsInRange(events, { start: days[0]!, end: days.at(-1)! }, tz), [events, days, tz]);
  const lanes = React.useMemo(() => packLanes(visible, { start: days[0]!, end: days.at(-1)! }, tz), [visible, days, tz]);
  const laneRows = lanes.reduce((m, l) => Math.max(m, l.lane + 1), 0);
  const perDay = React.useMemo(() => new Map(days.map((d) => [d, layoutDayEvents(visible, d, tz)] as const)), [visible, days, tz]);
  const firstHour = Math.floor(rangeStart / 60);
  const lastHour = Math.ceil(rangeEnd / 60);
  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i);

  // Initial scroll to business hours / 08:00.
  const scrollKey = `${c.view}|${days[0]}`;
  React.useLayoutEffect(() => {
    const el = c.scrollRef.current;
    const body = el?.querySelector<HTMLElement>("[data-slot=scheduler-column]");
    if (!el || !body) return;
    const target = scrollToTime ? clockToMinutes(scrollToTime) : (c.businessMinutes[0]?.start ?? 8 * 60);
    const pxPerMin = body.clientHeight / total;
    el.scrollTop = Math.max(0, (target - rangeStart) * pxPerMin - 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollKey]);

  const cols = { gridTemplateColumns: `var(--sch-gutter) repeat(${days.length}, minmax(var(--sch-col-min), 1fr))` } as React.CSSProperties;
  const todayIdx = days.findIndex((d) => c.info.get(d)?.today);
  const nowMin = localMinutes(now, tz);

  return (
    <div
      ref={c.scrollRef}
      data-slot="scheduler-time-grid"
      className="ui-sch-scroll relative min-h-0 overflow-auto overscroll-contain"
      style={{ maxHeight: typeof height === "number" ? `${height}px` : height }}
    >
      <div className="ui-sch-timegrid min-w-max" style={{ ["--sch-days" as string]: days.length, ["--sch-hours" as string]: total / 60 }}>
        {/* Day headers */}
        <div data-slot="scheduler-header" className="ui-sch-head sticky top-0 z-[3] grid" style={cols}>
          <div className="ui-sch-corner flex items-end justify-end px-2 pb-1.5 text-[10.5px] tabular text-fg-subtle" title={t("timeZone", { zone: tz })}>
            <span className="sr-only">{t("timeZone", { zone: tz })}</span>
            <span aria-hidden>{zoneName}</span>
          </div>
          {days.map((d) => {
            const di = c.info.get(d)!;
            return (
              <div
                key={d}
                data-slot="scheduler-day-header"
                data-today={di.today ? "" : undefined}
                data-off={di.working === 0 ? "" : undefined}
                data-holiday={di.holidays.length ? "" : undefined}
                className="ui-sch-dayhead"
              >
                <span className="text-[11px] font-medium text-fg-muted">{fmtDay(locale, d, { weekday: "short" })}</span>
                <span className="ui-sch-daynum tabular">{fmtDay(locale, d, { day: "numeric" })}</span>
                {di.holidays[0] ? <span className="ui-sch-holiday truncate" title={di.holidays.map((h) => h.name).join(" · ")}>{di.holidays[0].name}</span> : null}
              </div>
            );
          })}
          {/* All-day lane */}
          {laneRows > 0 ? (
            <>
              <div className="ui-sch-alldaylabel px-2 py-1 text-end text-[10.5px] text-fg-subtle">{t("allDay")}</div>
              <div data-slot="scheduler-all-day" className="ui-sch-allday" style={{ gridColumn: `2 / span ${days.length}`, gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${laneRows}, var(--sch-bar-h))` }}>
                {lanes.map((l) => (
                  <SchedulerLaneBar key={l.event.id} lane={l} mode="days" />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Body */}
        <div data-slot="scheduler-body" className="relative grid" style={cols}>
          <div data-slot="scheduler-axis" className="ui-sch-axis relative" aria-hidden>
            {hours.map((h) => (
              <span key={h} className="ui-sch-hour tabular" style={{ top: `${((h * 60 - rangeStart) / total) * 100}%` }}>
                {h * 60 === rangeStart ? "" : fmtHour(locale, h, c.h24)}
              </span>
            ))}
          </div>
          {days.map((d, i) => (
            <SchedulerDayColumn key={d} day={d} positioned={perDay.get(d) ?? []} nowMin={showNow && i === todayIdx ? nowMin : undefined} />
          ))}
          {c.canCreate ? <SchedulerSlotCursor /> : null}
        </div>
      </div>
    </div>
  );
}

function SchedulerDayColumn({ day, positioned, nowMin }: { day: IsoDate; positioned: PositionedEvent<SchedulerEvent>[]; nowMin?: number }) {
  const c = useSch();
  const di = c.info.get(day)!;
  const total = c.rangeEnd - c.rangeStart;
  const pct = (m: number) => `${((clamp(m, c.rangeStart, c.rangeEnd) - c.rangeStart) / total) * 100}%`;
  const ref = React.useRef<HTMLDivElement>(null);
  const anchor = React.useRef(0);

  const minAt = (clientY: number) => {
    const r = ref.current!.getBoundingClientRect();
    return c.rangeStart + ((clientY - r.top) / (r.height || 1)) * total;
  };
  const create = usePointerDrag({
    axis: "y",
    disabled: !c.canCreate,
    scrollContainer: c.scrollRef,
    onStart: (s) => {
      anchor.current = Math.floor(minAt(s.origin.y) / c.snap) * c.snap;
    },
    onMove: (s) => {
      const cur = minAt(s.origin.y + s.rawDelta.y);
      const step = s.altKey ? 5 : c.snap;
      const a = anchor.current;
      const b = cur >= a ? Math.max(a + step, Math.ceil(cur / step) * step) : Math.floor(cur / step) * step;
      const startMin = clamp(Math.min(a, b), c.rangeStart, c.rangeEnd);
      const endMin = clamp(Math.max(a, b === a ? a + step : b), c.rangeStart, c.rangeEnd);
      c.setDrag({ kind: "create", day, startMin, endMin, valid: c.isValidTimed(day, startMin, endMin) });
    },
    onEnd: () => {
      const d = c.drag;
      c.setDrag(null);
      if (!d || d.kind !== "create" || !d.valid) return;
      c.create({ start: instantAt(day, d.startMin, c.tz), end: instantAt(day, d.endMin, c.tz), allDay: false });
    },
    onCancel: () => c.setDrag(null),
  });

  // Non-working shading: whole day off, outside business hours, half-day holidays.
  const shades: { from: number; to: number }[] = [];
  if (di.working === 0) shades.push({ from: 0, to: 1440 });
  else {
    if (c.businessMinutes.length) {
      let cursor = 0;
      for (const w of [...c.businessMinutes].sort((a, b) => a.start - b.start)) {
        if (w.start > cursor) shades.push({ from: cursor, to: w.start });
        cursor = Math.max(cursor, w.end);
      }
      if (cursor < 1440) shades.push({ from: cursor, to: 1440 });
    }
    if (di.partialFrom) shades.push({ from: clockToMinutes(di.partialFrom), to: 1440 });
  }
  const ghost = c.drag && c.drag.day === day ? c.drag : null;

  return (
    <div
      ref={ref}
      data-slot="scheduler-column"
      data-day={day}
      data-today={di.today ? "" : undefined}
      data-off={di.working === 0 ? "" : undefined}
      data-holiday={di.holidays.length ? "" : undefined}
      className={cn("ui-sch-col relative", c.loading && "ui-sch-dim")}
      style={create.bind.style}
      onPointerDown={create.bind.onPointerDown}
      onDoubleClick={(ev) => {
        if (!c.canCreate || ev.target !== ev.currentTarget) return;
        const m = Math.floor(minAt(ev.clientY) / c.slot) * c.slot;
        c.create({ start: instantAt(day, m, c.tz), end: instantAt(day, m + c.slot, c.tz), allDay: false });
      }}
    >
      {shades.map((s, i) => (
        <div key={i} aria-hidden data-slot="scheduler-non-working" data-holiday={di.holidays.length ? "" : undefined} className="ui-sch-off pointer-events-none absolute inset-x-0" style={{ top: pct(s.from), height: `calc(${pct(s.to)} - ${pct(s.from)})` }} />
      ))}
      {positioned.map((p) => (
        <SchedulerEventBlock key={p.event.id} p={p} />
      ))}
      {ghost ? (
        <div aria-hidden data-slot="scheduler-ghost" data-invalid={ghost.valid ? undefined : ""} className="ui-sch-ghost pointer-events-none absolute inset-x-1" style={{ top: pct(ghost.startMin), height: `calc(${pct(ghost.endMin)} - ${pct(ghost.startMin)})` }}>
          <span className="tabular">{`${fmtClock(c.locale, ghost.startMin, c.h24)} – ${fmtClock(c.locale, ghost.endMin, c.h24)}`}</span>
          {!ghost.valid ? <span className="block text-[10.5px]">{c.t("outsideHours")}</span> : null}
        </div>
      ) : null}
      {nowMin !== undefined && nowMin >= c.rangeStart && nowMin <= c.rangeEnd ? (
        <div data-slot="scheduler-now-line" role="img" aria-label={c.t("nowLine", { time: fmtClock(c.locale, nowMin, c.h24) })} className="ui-sch-now pointer-events-none absolute inset-x-0" style={{ top: pct(nowMin) }} />
      ) : null}
    </div>
  );
}

/** Keyboard create: one tab stop over a virtual slot grid. Arrow keys move, Enter creates. */
function SchedulerSlotCursor() {
  const c = useSch();
  const [focused, setFocused] = React.useState(false);
  const [pos, setPos] = React.useState(() => ({ day: Math.max(0, c.days.findIndex((d) => c.info.get(d)?.today)), min: c.businessMinutes[0]?.start ?? 9 * 60 }));
  const day = c.days[clamp(pos.day, 0, c.days.length - 1)]!;
  const total = c.rangeEnd - c.rangeStart;
  const when = `${fmtDay(c.locale, day, { weekday: "long", day: "numeric", month: "long" })}, ${fmtClock(c.locale, pos.min, c.h24)} – ${fmtClock(c.locale, pos.min + c.slot, c.h24)}`;
  const onKeyDown = (k: React.KeyboardEvent) => {
    const h = c.rtl ? -1 : 1;
    let next = pos;
    if (k.key === "ArrowDown") next = { ...pos, min: Math.min(c.rangeEnd - c.slot, pos.min + c.slot) };
    else if (k.key === "ArrowUp") next = { ...pos, min: Math.max(c.rangeStart, pos.min - c.slot) };
    else if (k.key === "ArrowRight") next = { ...pos, day: clamp(pos.day + h, 0, c.days.length - 1) };
    else if (k.key === "ArrowLeft") next = { ...pos, day: clamp(pos.day - h, 0, c.days.length - 1) };
    else if (k.key === "Home") next = { ...pos, min: c.rangeStart };
    else if (k.key === "End") next = { ...pos, min: c.rangeEnd - c.slot };
    else if (k.key === "Enter" || k.key === " ") {
      k.preventDefault();
      c.create({ start: instantAt(day, pos.min, c.tz), end: instantAt(day, pos.min + c.slot, c.tz), allDay: false });
      return;
    } else return;
    k.preventDefault();
    setPos(next);
  };
  React.useEffect(() => {
    if (!focused) return;
    const el = c.scrollRef.current;
    const col = el?.querySelector<HTMLElement>("[data-slot=scheduler-column]");
    if (!el || !col) return;
    const y = ((pos.min - c.rangeStart) / total) * col.clientHeight;
    const head = el.querySelector<HTMLElement>("[data-slot=scheduler-header]")?.offsetHeight ?? 0;
    if (y < el.scrollTop) el.scrollTop = y;
    else if (y + 48 > el.scrollTop + el.clientHeight - head) el.scrollTop = y - el.clientHeight + head + 64;
  }, [pos, focused, c.scrollRef, c.rangeStart, total]);
  return (
    <>
      <button
        type="button"
        data-slot="scheduler-slot-cursor"
        className="sr-only"
        aria-label={c.t("slotCursor", { when })}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
      />
      {focused ? (
        <div
          aria-hidden
          className="ui-sch-cursor pointer-events-none absolute"
          style={{
            top: `${((pos.min - c.rangeStart) / total) * 100}%`,
            height: `${(c.slot / total) * 100}%`,
            insetInlineStart: `calc(var(--sch-gutter) + (100% - var(--sch-gutter)) / ${c.days.length} * ${pos.day})`,
            width: `calc((100% - var(--sch-gutter)) / ${c.days.length})`,
          }}
        >
          <span className="tabular">{fmtClock(c.locale, pos.min, c.h24)}</span>
        </div>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Lane bars (all-day lane, month view)                                */
/* ------------------------------------------------------------------ */

function SchedulerLaneBar({ lane, mode }: { lane: LaneAssignment<SchedulerEvent>; mode: "days" | "month" }) {
  const c = useSch();
  const e = lane.event;
  const timed = !isLaneEvent(e, c.tz);
  const dref = React.useRef<DragRef>({ pxPerMin: 1, colWidth: 1, rowHeight: 1, dragged: false });
  const [shift, setShift] = React.useState({ x: 0, y: 0 });
  const move = usePointerDrag({
    disabled: !c.canMove(e),
    axis: mode === "days" ? "x" : "both",
    onStart: (s) => {
      dref.current.dragged = true;
      const host = s.target.closest<HTMLElement>(mode === "month" ? "[data-slot=scheduler-month]" : "[data-slot=scheduler-all-day]");
      if (host) {
        dref.current.colWidth = host.offsetWidth / (mode === "month" ? 7 : c.days.length) || 1;
        dref.current.rowHeight = host.querySelector<HTMLElement>("[data-slot=scheduler-month-week]")?.offsetHeight || 1;
      }
    },
    onMove: (s) => setShift({ x: Math.round(s.rawDelta.x / dref.current.colWidth), y: mode === "month" ? Math.round(s.rawDelta.y / dref.current.rowHeight) : 0 }),
    onEnd: () => {
      const days = shift.x * (c.rtl ? -1 : 1) + shift.y * 7;
      setShift({ x: 0, y: 0 });
      if (days) c.commit(e, shiftEvent(e, days, 0, c.tz));
    },
    onCancel: () => setShift({ x: 0, y: 0 }),
  });
  const onKeyDown = useEventKeys(e, mode === "month" ? "month" : "days");
  const time = timed ? c.timeLabel(e).split(" – ")[0] : undefined;
  const moved = shift.x || shift.y;
  const place: React.CSSProperties =
    mode === "days"
      ? { gridColumn: `${lane.startIndex + 1} / span ${lane.span}`, gridRow: lane.lane + 1 }
      : { top: `calc(${lane.lane} * var(--sch-bar-h))`, width: `calc(${lane.span * 100}% + ${lane.span - 1}px - 6px)` };
  return (
    <EventContextMenu event={e}>
      <button
        type="button"
        data-slot="scheduler-lane-event"
        data-status={e.status ?? "confirmed"}
        data-timed={timed ? "" : undefined}
        data-dragging={moved ? "" : undefined}
        data-continues-before={lane.continuesBefore ? "" : undefined}
        data-continues-after={lane.continuesAfter ? "" : undefined}
        tabIndex={mode === "month" ? -1 : undefined}
        className={cn("ui-sch-bar focus-ring", mode === "month" && "ui-sch-mbar")}
        style={{ ...eventStyle(e), ...place, ...(moved ? { translate: `${shift.x * dref.current.colWidth}px ${shift.y * dref.current.rowHeight}px` } : null), ...move.bind.style }}
        onPointerDown={(ev) => {
          ev.stopPropagation();
          dref.current.dragged = false;
          move.bind.onPointerDown(ev);
        }}
        onClick={(ev) => {
          ev.stopPropagation();
          if (!dref.current.dragged) c.open(e);
        }}
        onKeyDown={onKeyDown}
      >
        <SrName name={c.describe(e)}>
          {c.renderEvent ? (
            c.renderEvent(e, { view: c.view, compact: true, timeLabel: c.timeLabel(e) })
          ) : (
            <>
              {timed ? <span aria-hidden className="ui-sch-dot" /> : null}
              {time ? <span className="shrink-0 tabular text-fg-muted">{time}</span> : null}
              <span className="truncate font-medium">{e.title}</span>
            </>
          )}
        </SrName>
      </button>
    </EventContextMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Month                                                               */
/* ------------------------------------------------------------------ */

function SchedulerMonthView({ events, anchor, maxEventsPerDay, onOpenDay }: { events: SchedulerEvent[]; anchor: IsoDate; maxEventsPerDay: number; onOpenDay(d: IsoDate): void }) {
  const c = useSch();
  const { locale, tz, t } = c;
  const weeks = React.useMemo(() => {
    const out: IsoDate[][] = [];
    for (let i = 0; i < c.days.length; i += 7) out.push(c.days.slice(i, i + 7));
    return out;
  }, [c.days]);
  const month = anchor.slice(0, 7);
  const [focusDay, setFocusDay] = React.useState<IsoDate>(anchor);
  React.useEffect(() => setFocusDay((f) => (c.days.includes(f) ? f : anchor)), [anchor, c.days]);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const onKeyDown = (k: React.KeyboardEvent) => {
    if (k.altKey || (k.target as HTMLElement).dataset.slot !== "scheduler-month-cell") return;
    const h = c.rtl ? -1 : 1;
    const map: Record<string, number> = { ArrowRight: h, ArrowLeft: -h, ArrowDown: 7, ArrowUp: -7 };
    let next: IsoDate | null = null;
    if (k.key in map) next = addDays(focusDay, map[k.key]!);
    else if (k.key === "Home") next = weeks.find((w) => w.includes(focusDay))?.[0] ?? null;
    else if (k.key === "End") next = weeks.find((w) => w.includes(focusDay))?.[6] ?? null;
    else if (k.key === "Enter") {
      k.preventDefault();
      onOpenDay(focusDay);
      return;
    }
    if (!next) return;
    k.preventDefault();
    if (!c.days.includes(next)) return;
    setFocusDay(next);
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-day="${next}"]`)?.focus());
  };

  const weekdayHeads = weeks[0]!.map((d) => ({ d, short: fmtDay(locale, d, { weekday: "short" }), long: fmtDay(locale, d, { weekday: "long" }) }));

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label={fmtDay(locale, `${month}-15`, { month: "long", year: "numeric" })}
      data-slot="scheduler-month"
      className={cn("ui-sch-month", c.loading && "ui-sch-dim")}
      style={{ ["--sch-lanes" as string]: maxEventsPerDay }}
      onKeyDown={onKeyDown}
    >
      <div role="row" className="ui-sch-mhead grid grid-cols-7">
        {weekdayHeads.map((w) => (
          <div key={w.d} role="columnheader" aria-label={w.long} className="px-2 py-2 text-[11px] font-medium text-fg-muted">
            {w.short}
          </div>
        ))}
      </div>
      {weeks.map((week) => {
        const lanes = packLanes(events, { start: week[0]!, end: week[6]! }, tz, { include: "all" });
        return (
          <div key={week[0]} role="row" data-slot="scheduler-month-week" className="ui-sch-mweek grid grid-cols-7">
            {week.map((d, i) => {
              const di = c.info.get(d)!;
              const starting = lanes.filter((l) => l.startIndex === i && l.lane < maxEventsPerDay);
              const covering = lanes.filter((l) => l.startIndex <= i && l.startIndex + l.span > i);
              const hidden = covering.filter((l) => l.lane >= maxEventsPerDay);
              const label = `${fmtDay(locale, d, { weekday: "long", day: "numeric", month: "long" })}${di.holidays[0] ? `, ${di.holidays[0].name}` : ""}, ${t("events", { count: covering.length })}`;
              return (
                <div
                  key={d}
                  role="gridcell"
                  data-slot="scheduler-month-cell"
                  data-day={d}
                  data-today={di.today ? "" : undefined}
                  data-outside={d.slice(0, 7) !== month ? "" : undefined}
                  data-off={di.working === 0 ? "" : undefined}
                  data-holiday={di.holidays.length ? "" : undefined}
                  aria-selected={d === focusDay}
                  tabIndex={d === focusDay ? 0 : -1}
                  className="ui-sch-mcell focus-ring"
                  onFocus={() => setFocusDay(d)}
                  onDoubleClick={(ev) => {
                    if (ev.target === ev.currentTarget && c.canCreate) c.create({ start: d, end: d, allDay: true });
                  }}
                >
                  {/* Name from content: the full date first (the visible day number is aria-hidden),
                      then the event bars. An aria-label would drop the bars' visible titles (label-in-name). */}
                  <span className="sr-only">{label}</span>
                  <div className="flex items-center justify-between gap-1 px-1.5 pt-1">
                    <span className="ui-sch-mnum tabular" aria-hidden>
                      {fmtDay(locale, d, { day: "numeric" })}
                    </span>
                    {di.holidays[0] ? <span className="ui-sch-holiday truncate" aria-hidden>{di.holidays[0].name}</span> : null}
                  </div>
                  <div className="ui-sch-mlanes">
                    {starting.map((l) => (
                      <SchedulerLaneBar key={l.event.id} lane={l} mode="month" />
                    ))}
                  </div>
                  {hidden.length ? <SchedulerMorePopover day={d} lanes={covering} count={hidden.length} /> : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function SchedulerMorePopover({ day, lanes, count }: { day: IsoDate; lanes: LaneAssignment<SchedulerEvent>[]; count: number }) {
  const c = useSch();
  const dateLabel = fmtDay(c.locale, day, { weekday: "long", day: "numeric", month: "long" });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" data-slot="scheduler-more" className="ui-sch-more focus-ring" aria-label={c.t("moreLabel", { count, date: dateLabel })} tabIndex={-1} onKeyDown={(k) => k.stopPropagation()}>
          {c.t("more", { count })}
        </button>
      </PopoverTrigger>
      <PopoverContent size="sm" align="start" className="w-64 p-2">
        <p className="px-1.5 pb-1.5 text-[12px] font-medium text-fg-muted">{dateLabel}</p>
        <ul className="grid gap-1">
          {lanes.map((l) => (
            <li key={l.event.id}>
              <button type="button" className="ui-sch-bar w-full focus-ring" data-status={l.event.status ?? "confirmed"} style={eventStyle(l.event)} onClick={() => c.open(l.event)}>
                <SrName name={c.describe(l.event)}>
                  {!isLaneEvent(l.event, c.tz) ? <span className="shrink-0 tabular text-fg-muted">{c.timeLabel(l.event).split(" – ")[0]}</span> : null}
                  <span className="truncate font-medium">{l.event.title}</span>
                </SrName>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/* List (agenda) — the screen-reader-first view                        */
/* ------------------------------------------------------------------ */

function SchedulerListView({ events }: { events: SchedulerEvent[] }) {
  const c = useSch();
  const { days, tz, locale, t } = c;
  const groups = React.useMemo(() => {
    const inRange = eventsInRange(events, { start: days[0]!, end: days.at(-1)! }, tz);
    return days
      .map((d) => ({ day: d, items: inRange.filter((e) => { const r = eventDays(e, tz); return compareIsoDate(r.start, d) <= 0 && compareIsoDate(r.end, d) >= 0; }).sort((a, b) => (isLaneEvent(a, tz) === isLaneEvent(b, tz) ? compareEvents(a, b, tz) : isLaneEvent(a, tz) ? -1 : 1)) }))
      .filter((g) => g.items.length);
  }, [events, days, tz]);

  if (!groups.length) {
    return (
      <div className="p-6">
        <EmptyState size="sm" title={days.length === 1 ? t("emptyDay") : t("emptyWeek")} description={t("emptyHint")} icon={<Clock3 />} />
      </div>
    );
  }
  return (
    <div data-slot="scheduler-list" className={cn("ui-sch-list", c.loading && "ui-sch-dim")}>
      {groups.map((g) => {
        const di = c.info.get(g.day);
        const headId = `sch-list-${g.day}`;
        return (
          <section key={g.day} aria-labelledby={headId} data-today={di?.today ? "" : undefined} className="ui-sch-lgroup">
            <h3 id={headId} className="ui-sch-lhead" aria-label={fmtDay(locale, g.day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}>
              <span className="ui-sch-lnum tabular">{fmtDay(locale, g.day, { day: "numeric" })}</span>
              <span className="text-fg">{fmtDay(locale, g.day, { weekday: "long" })}</span>
              <span className="text-fg-subtle">{fmtDay(locale, g.day, { month: "long", year: "numeric" })}</span>
              {di?.holidays[0] ? <span className="ui-sch-holiday">{di.holidays[0].name}</span> : null}
            </h3>
            <ul className="grid">
              {g.items.map((e) => (
                <li key={e.id}>
                  <button type="button" data-slot="scheduler-list-event" data-status={e.status ?? "confirmed"} className="ui-sch-lrow focus-ring" style={eventStyle(e)} onClick={() => c.open(e)}>
                    <SrName name={c.describe(e)}>
                      <span className="ui-sch-ltime tabular">{c.timeLabel(e)}</span>
                      <span aria-hidden className="ui-sch-swatch" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-fg">{e.title}</span>
                        {e.location ? <span className="block truncate text-[12px] text-fg-muted">{e.location}</span> : null}
                      </span>
                      {e.status && e.status !== "confirmed" ? <span className="shrink-0 text-[11px] text-fg-subtle">{e.status === "tentative" ? t("tentative") : t("canceled")}</span> : null}
                    </SrName>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Change time dialog (the non-drag path, WCAG 2.5.7)                  */
/* ------------------------------------------------------------------ */

function SchedulerTimeDialog({ event, onClose }: { event: SchedulerEvent | null; onClose(): void }) {
  const c = useSch();
  const allDay = Boolean(event && (event.allDay || isDateOnly(event.start)));
  const [date, setDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  React.useEffect(() => {
    if (!event) return;
    setError(undefined);
    const d = eventDays(event, c.tz);
    setDate(d.start);
    setEndDate(d.end);
    if (!allDay) {
      const s = localMinutes(Date.parse(event.start), c.tz);
      const en = s + (Date.parse(event.end) - Date.parse(event.start)) / MIN;
      const hhmm = (m: number) => `${String(Math.floor((m % 1440) / 60)).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;
      setStart(hhmm(s));
      setEnd(hhmm(Math.min(en, 1439)));
    }
  }, [event, allDay, c.tz]);
  const save = () => {
    if (!event) return;
    if (allDay) {
      if (compareIsoDate(endDate, date) < 0) return setError(c.t("endBeforeStart"));
      c.commit(event, { start: date, end: endDate });
    } else {
      const s = clockToMinutes(start);
      const en = clockToMinutes(end);
      if (en <= s) return setError(c.t("endBeforeStart"));
      c.commit(event, { start: instantAt(date, s, c.tz), end: instantAt(date, en, c.tz) });
    }
    onClose();
  };
  return (
    <Dialog open={Boolean(event)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="sm">
        <DialogHeader title={c.t("changeTimeTitle")} description={event ? `${event.title} · ${c.t("changeTimeDescription", { zone: c.tz })}` : undefined} />
        <DialogBody>
          <form
            id="scheduler-time-form"
            className="grid gap-3"
            onSubmit={(ev) => {
              ev.preventDefault();
              save();
            }}
          >
            <Field label={c.t("date")}>
              <Input type="date" value={date} onChange={(ev) => setDate(ev.target.value)} required />
            </Field>
            {allDay ? (
              <Field label={c.t("end")} error={error}>
                <Input type="date" value={endDate} onChange={(ev) => setEndDate(ev.target.value)} required />
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label={c.t("start")}>
                  <Input type="time" step={c.snap * 60} value={start} onChange={(ev) => setStart(ev.target.value)} required />
                </Field>
                <Field label={c.t("end")} error={error}>
                  <Input type="time" step={c.snap * 60} value={end} onChange={(ev) => setEnd(ev.target.value)} required />
                </Field>
              </div>
            )}
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={onClose}>{c.t("cancel")}</Button>
          <Button variant="primary" type="submit" form="scheduler-time-form">
            {c.t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Number of days an event spans (inclusive), in a zone. */
export function schedulerEventDays(e: Pick<SchedulerEvent, "start" | "end" | "allDay">, timeZone = "UTC"): number {
  const d = eventDays({ id: "", ...e }, timeZone);
  return diffDays(d.start, d.end) + 1;
}
