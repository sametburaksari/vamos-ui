/**
 * Event layout for the Agenda / scheduler: overlap column packing for time grids and lane
 * packing for all-day / multi-day events and month weeks. React-free.
 *
 * Conventions:
 * - Timed events: `start` / `end` are instants (UTC ISO strings), `end` exclusive.
 * - All-day events: `start` / `end` are `YYYY-MM-DD`, `end` **inclusive** (a one-day event has
 *   `start === end`).
 * - Every function takes an explicit IANA `timeZone`; day boundaries are local midnight there.
 */
import { addDays, diffDays, compareIsoDate } from "../../locale-data/core/date";
import type { IsoDate } from "../../locale-data/core/types";
import { TZDate } from "@date-fns/tz";
import { toEpoch } from "./time-scale";

const MIN = 60_000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Minimal shape the layout functions need (SchedulerEvent satisfies it). */
export interface LayoutEvent {
  id: string;
  start: string;
  end: string;
  allDay?: boolean;
}

export interface PositionedEvent<E extends LayoutEvent = LayoutEvent> {
  event: E;
  /** Minutes after local midnight of the day, clipped to the day (0–1440). */
  startMin: number;
  endMin: number;
  /** 0-based column inside its overlap cluster. */
  column: number;
  /** Number of columns in the cluster. */
  columns: number;
  /** Columns this event may stretch over to its inline-end (free neighbours), ≥ 1. */
  span: number;
  /** The event started before / ends after this day. */
  continuesBefore: boolean;
  continuesAfter: boolean;
}

export interface LaneAssignment<E extends LayoutEvent = LayoutEvent> {
  event: E;
  lane: number;
  /** First and last visible day (clipped to the range), inclusive. */
  startDay: IsoDate;
  endDay: IsoDate;
  /** Index of `startDay` in the range and number of days covered. */
  startIndex: number;
  span: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/** True when the event is laid out in the all-day lane (all-day, or a timed event of 24 h or more). */
export function isLaneEvent(e: LayoutEvent, timeZone = "UTC"): boolean {
  if (e.allDay || DATE_ONLY.test(e.start)) return true;
  return toEpoch(e.end, timeZone) - toEpoch(e.start, timeZone) >= 24 * 60 * MIN;
}

/** Local first and last day (inclusive) an event touches in `timeZone`. */
export function eventDays(e: LayoutEvent, timeZone = "UTC"): { start: IsoDate; end: IsoDate } {
  if (e.allDay || DATE_ONLY.test(e.start)) {
    const s = e.start.slice(0, 10);
    const en = e.end ? e.end.slice(0, 10) : s;
    return { start: s, end: compareIsoDate(en, s) < 0 ? s : en };
  }
  const s = toEpoch(e.start, timeZone);
  const en = Math.max(s, toEpoch(e.end, timeZone) - 1); // end is exclusive
  return { start: localDate(s, timeZone), end: localDate(en, timeZone) };
}

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function partsFmt(timeZone: string) {
  let f = dtfCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    dtfCache.set(timeZone, f);
  }
  return f;
}

/** Local calendar date of an instant in a zone. */
export function localDate(t: number | string | Date, timeZone = "UTC"): IsoDate {
  const ms = typeof t === "number" ? t : t instanceof Date ? t.getTime() : toEpoch(t, timeZone);
  const p = partsFmt(timeZone).formatToParts(ms);
  const get = (type: string) => p.find((x) => x.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Wall-clock minutes after midnight of an instant in a zone (0–1439). */
export function localMinutes(t: number | string | Date, timeZone = "UTC"): number {
  const ms = typeof t === "number" ? t : t instanceof Date ? t.getTime() : toEpoch(t, timeZone);
  const p = partsFmt(timeZone).formatToParts(ms);
  const h = Number(p.find((x) => x.type === "hour")?.value ?? 0) % 24;
  const m = Number(p.find((x) => x.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** UTC ISO instant of a local wall-clock time (`minutes` after local midnight of `date`, may overflow into later days). */
export function instantAt(date: IsoDate, minutes: number, timeZone = "UTC"): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const whole = Math.round(minutes);
  return new Date(new TZDate(y, m - 1, d, 0, whole, timeZone).getTime()).toISOString();
}

/** Shifts an event by whole days and minutes, keeping its kind. Returns new `{ start, end }`. */
export function shiftEvent(e: LayoutEvent, days: number, minutes = 0, timeZone = "UTC"): { start: string; end: string } {
  if (e.allDay || DATE_ONLY.test(e.start)) {
    return { start: addDays(e.start.slice(0, 10), days), end: addDays((e.end || e.start).slice(0, 10), days) };
  }
  const s = toEpoch(e.start, timeZone);
  const en = toEpoch(e.end, timeZone);
  const sd = localDate(s, timeZone);
  const start = instantAt(addDays(sd, days), localMinutes(s, timeZone) + minutes, timeZone);
  const startMs = Date.parse(start);
  return { start, end: new Date(startMs + (en - s)).toISOString() };
}

/** Events touching `[start, end]` (inclusive local days). */
export function eventsInRange<E extends LayoutEvent>(events: readonly E[], range: { start: IsoDate; end: IsoDate }, timeZone = "UTC"): E[] {
  return events.filter((e) => {
    const d = eventDays(e, timeZone);
    return compareIsoDate(d.end, range.start) >= 0 && compareIsoDate(d.start, range.end) <= 0;
  });
}

/** Sort: earlier start first, then longer first, then id (stable across renders). */
export function compareEvents(a: LayoutEvent, b: LayoutEvent, timeZone = "UTC"): number {
  const as = toEpoch(a.start, timeZone);
  const bs = toEpoch(b.start, timeZone);
  if (as !== bs) return as - bs;
  const al = toEpoch(a.end || a.start, timeZone) - as;
  const bl = toEpoch(b.end || b.start, timeZone) - bs;
  if (al !== bl) return bl - al;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Overlap column packing for one day of a time grid.
 *
 * ```ts
 * layoutDayEvents(events, "2026-11-10", "Europe/Istanbul");
 * // → [{ event, startMin: 540, endMin: 600, column: 0, columns: 2, span: 1, … }, …]
 * ```
 *
 * Events in the all-day lane (`isLaneEvent`) are skipped. Very short events get at least
 * `minDuration` minutes of height so they stay clickable (default 15).
 */
export function layoutDayEvents<E extends LayoutEvent>(events: readonly E[], day: IsoDate, timeZone = "UTC", opts: { minDuration?: number } = {}): PositionedEvent<E>[] {
  const minDur = opts.minDuration ?? 15;
  const dayStart = toEpoch(day, timeZone);
  const dayEnd = toEpoch(addDays(day, 1), timeZone);
  const dayLen = (dayEnd - dayStart) / MIN;
  const items: PositionedEvent<E>[] = [];
  const timed = events.filter((e) => !isLaneEvent(e, timeZone)).slice().sort((a, b) => compareEvents(a, b, timeZone));
  for (const event of timed) {
    const s = toEpoch(event.start, timeZone);
    const en = Math.max(s, toEpoch(event.end, timeZone));
    if (en <= dayStart || s >= dayEnd) {
      if (!(s === en && s >= dayStart && s < dayEnd)) continue;
    }
    const startMin = Math.max(0, (s - dayStart) / MIN);
    let endMin = Math.min(dayLen, (en - dayStart) / MIN);
    if (endMin - startMin < minDur) endMin = Math.min(dayLen, startMin + minDur);
    items.push({ event, startMin, endMin, column: 0, columns: 1, span: 1, continuesBefore: s < dayStart, continuesAfter: en > dayEnd });
  }

  // Clusters of transitively overlapping events share a column count.
  let cluster: PositionedEvent<E>[] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    if (!cluster.length) return;
    const colEnds: number[] = [];
    for (const it of cluster) {
      let col = colEnds.findIndex((end) => end <= it.startMin);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(it.endMin);
      } else colEnds[col] = it.endMin;
      it.column = col;
    }
    const columns = colEnds.length;
    for (const it of cluster) {
      it.columns = columns;
      // Stretch into free columns to the inline-end.
      let span = 1;
      for (let c = it.column + 1; c < columns; c++) {
        const blocked = cluster.some((o) => o !== it && o.column === c && o.startMin < it.endMin && o.endMin > it.startMin);
        if (blocked) break;
        span++;
      }
      it.span = span;
    }
    cluster = [];
  };
  for (const it of items) {
    if (it.startMin >= clusterEnd) {
      flush();
      clusterEnd = it.endMin;
    } else clusterEnd = Math.max(clusterEnd, it.endMin);
    cluster.push(it);
  }
  flush();
  return items;
}

/**
 * Lane packing for all-day / multi-day bars over a range of days (a week row, the week view's
 * all-day lane). Each event gets the lowest lane free on all of its days.
 *
 * ```ts
 * packLanes(events, { start: "2026-11-09", end: "2026-11-15" }, "UTC", { include: "all" });
 * ```
 *
 * `include: "lane"` (default) keeps only lane events (all-day or ≥ 24 h); `"all"` also packs
 * timed events as one-day bars (month view).
 */
export function packLanes<E extends LayoutEvent>(
  events: readonly E[],
  range: { start: IsoDate; end: IsoDate },
  timeZone = "UTC",
  opts: { include?: "lane" | "all" } = {},
): LaneAssignment<E>[] {
  const include = opts.include ?? "lane";
  const length = diffDays(range.start, range.end) + 1;
  if (length <= 0) return [];
  const chosen = eventsInRange(events, range, timeZone).filter((e) => include === "all" || isLaneEvent(e, timeZone));
  const withDays = chosen.map((event) => ({ event, days: eventDays(event, timeZone), lane: isLaneEvent(event, timeZone) }));
  // Multi-day bars first (they are hardest to place), then by start.
  withDays.sort((a, b) => {
    const la = diffDays(a.days.start, a.days.end);
    const lb = diffDays(b.days.start, b.days.end);
    const c = compareIsoDate(a.days.start, b.days.start);
    if (c !== 0) return c;
    if (a.lane !== b.lane) return a.lane ? -1 : 1;
    if (la !== lb) return lb - la;
    return compareEvents(a.event, b.event, timeZone);
  });
  const occupied: boolean[][] = []; // lane → day index
  const out: LaneAssignment<E>[] = [];
  for (const { event, days } of withDays) {
    const startDay = compareIsoDate(days.start, range.start) < 0 ? range.start : days.start;
    const endDay = compareIsoDate(days.end, range.end) > 0 ? range.end : days.end;
    const startIndex = diffDays(range.start, startDay);
    const span = diffDays(startDay, endDay) + 1;
    let lane = 0;
    for (;; lane++) {
      const row = (occupied[lane] ??= new Array(length).fill(false));
      let free = true;
      for (let i = startIndex; i < startIndex + span; i++) if (row[i]) { free = false; break; }
      if (free) {
        for (let i = startIndex; i < startIndex + span; i++) row[i] = true;
        break;
      }
    }
    out.push({ event, lane, startDay, endDay, startIndex, span, continuesBefore: compareIsoDate(days.start, range.start) < 0, continuesAfter: compareIsoDate(days.end, range.end) > 0 });
  }
  return out;
}

/** Lane count needed by a packing result. */
export const laneCount = (lanes: readonly LaneAssignment[]): number => lanes.reduce((m, l) => Math.max(m, l.lane + 1), 0);

/** Days of the week containing `date`, given the first weekday (1 = Monday … 7 = Sunday). */
export function weekDays(date: IsoDate, firstDay: number): IsoDate[] {
  const wd = isoWeekdayOf(date);
  const back = (wd - firstDay + 7) % 7;
  const start = addDays(date, -back);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** The week rows (4–6, each 7 days) of the month containing `date`, starting on `firstDay`. */
export function monthWeeks(date: IsoDate, firstDay: number): IsoDate[][] {
  const first = `${date.slice(0, 7)}-01`;
  const last = addDays(`${addDays(first, 32).slice(0, 7)}-01`, -1);
  const weeks: IsoDate[][] = [];
  for (let cur = weekDays(first, firstDay)[0]!; compareIsoDate(cur, last) <= 0; cur = addDays(cur, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cur, i)));
  }
  return weeks;
}

function isoWeekdayOf(date: IsoDate): number {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return wd === 0 ? 7 : wd;
}
