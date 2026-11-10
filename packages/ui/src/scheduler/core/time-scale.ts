/**
 * Time scale: instant ↔ pixel mapping, zoom presets, calendar ticks in an explicit time zone,
 * snapping and visible-window math. Shared by Agenda, Resource calendar and Gantt.
 * React-free (the hook `useTimeScale` lives in `@vamos-ui/react/sortable`, next to `usePointerDrag`).
 */
import { TZDate } from "@date-fns/tz";
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { getWeekInfo } from "../../locale-data/core/week-info";
import { workingValue } from "../../locale-data/core/working-days";
import type { IsoDate, WorkCalendar } from "../../locale-data/core/types";

export type TimeScaleUnit = "hour" | "day" | "week" | "month" | "quarter";
export type TickUnit = "minute15" | "minute30" | "hour" | "day" | "week" | "month" | "quarter" | "year";

export interface TimeScalePreset {
  /** Pixels per 24 hours. */
  pxPerDay: number;
  /** Fine header row / grid lines. */
  minor: TickUnit;
  /** Coarse header row. */
  major: TickUnit;
}

/** Zoom presets: hour (rooms × hours), day (people × days), week / month / quarter (Gantt). */
export const TIME_SCALE_PRESETS: Readonly<Record<TimeScaleUnit, TimeScalePreset>> = {
  hour: { pxPerDay: 64 * 24, minor: "hour", major: "day" },
  day: { pxPerDay: 44, minor: "day", major: "month" },
  week: { pxPerDay: 18, minor: "week", major: "month" },
  month: { pxPerDay: 4, minor: "month", major: "year" },
  quarter: { pxPerDay: 1.5, minor: "quarter", major: "year" },
};

const DAY_MS = 86_400_000;

/** An instant: `Date`, epoch ms, ISO instant ("2026-11-10T09:00:00Z") or date-only (local midnight in the zone). */
export type TimeInput = Date | number | string;

export interface TimeScaleOptions {
  start: TimeInput;
  end: TimeInput;
  /** Zoom preset. Default `"day"`. */
  scale?: TimeScaleUnit;
  /** Overrides the preset's density. */
  pxPerDay?: number;
  /** IANA zone for ticks and date-only inputs. Default `"UTC"`. */
  timeZone?: string;
  /** Locale for the week start. Default `"en-US"`. */
  locale?: string;
  /** Marks day ticks with their working value. */
  workCalendar?: WorkCalendar;
}

export interface TimeTick {
  unit: TickUnit;
  /** Epoch ms of the tick start (inclusive) and end (exclusive). */
  start: number;
  end: number;
  /** Pixel offset and width. */
  x: number;
  width: number;
  /** Local calendar date of the tick start in the scale's zone. */
  date: IsoDate;
  /** Day ticks with a `workCalendar`: 1 working, 0.5 half day, 0 off. */
  working?: number;
}

export interface TimeScale {
  readonly start: number;
  readonly end: number;
  readonly unit: TimeScaleUnit;
  readonly timeZone: string;
  readonly pxPerDay: number;
  readonly pxPerMs: number;
  /** Total width in px. */
  readonly width: number;
  /** 0 = Sunday … 6 = Saturday (date-fns numbering). */
  readonly weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  toPx(t: TimeInput): number;
  /** Epoch ms at a pixel offset. */
  toTime(px: number): number;
  toDate(px: number): Date;
  durationToPx(ms: number): number;
  pxToDuration(px: number): number;
  /** Rounds an instant to the nearest tick boundary (`"day"`) or step in minutes (15). */
  snap(t: TimeInput, step: TickUnit | number, mode?: "round" | "floor" | "ceil"): number;
  /** Ticks of `unit` covering the range (clipped to it). */
  ticks(unit?: TickUnit): TimeTick[];
  /** Time window visible in a viewport, with optional overscan in px. */
  visibleRange(scrollLeft: number, viewportWidth: number, overscanPx?: number): { start: number; end: number };
  /** The local date of an instant in the scale's zone. */
  dateOf(t: TimeInput): IsoDate;
  /** Epoch ms of local midnight of a date in the scale's zone. */
  startOfDate(date: IsoDate): number;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Resolves a `TimeInput` to epoch ms; date-only strings are local midnight in `timeZone`. */
export function toEpoch(t: TimeInput, timeZone = "UTC"): number {
  if (t instanceof Date) return t.getTime();
  if (typeof t === "number") return t;
  if (DATE_ONLY.test(t)) {
    const [y, m, d] = t.split("-").map(Number) as [number, number, number];
    return new TZDate(y, m - 1, d, timeZone).getTime();
  }
  const ms = Date.parse(t);
  if (Number.isNaN(ms)) throw new RangeError(`Invalid time: "${t}"`);
  return ms;
}

function isoOf(d: TZDate): IsoDate {
  return `${String(d.getFullYear()).padStart(4, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function floorTo(d: TZDate, unit: TickUnit, weekStartsOn: TimeScale["weekStartsOn"]): TZDate {
  switch (unit) {
    case "minute15":
    case "minute30": {
      const step = unit === "minute15" ? 15 : 30;
      const h = startOfHour(d);
      return addMinutes(h, Math.floor(d.getMinutes() / step) * step);
    }
    case "hour":
      return startOfHour(d);
    case "day":
      return startOfDay(d);
    case "week":
      return startOfWeek(d, { weekStartsOn });
    case "month":
      return startOfMonth(d);
    case "quarter":
      return startOfQuarter(d);
    case "year":
      return startOfYear(d);
  }
}

function step(d: TZDate, unit: TickUnit, n = 1): TZDate {
  switch (unit) {
    case "minute15":
      return addMinutes(d, 15 * n);
    case "minute30":
      return addMinutes(d, 30 * n);
    case "hour":
      return addHours(d, n);
    case "day":
      return addDays(d, n);
    case "week":
      return addWeeks(d, n);
    case "month":
      return addMonths(d, n);
    case "quarter":
      return addQuarters(d, n);
    case "year":
      return addYears(d, n);
  }
}

/**
 * Creates a time scale.
 *
 * ```ts
 * const scale = createTimeScale({ start: "2026-11-01", end: "2026-12-01", scale: "day", timeZone: "Europe/Istanbul", locale: "tr-TR" });
 * scale.toPx("2026-11-02"); // 44
 * scale.ticks("week");      // week columns starting Monday
 * ```
 */
export function createTimeScale(options: TimeScaleOptions): TimeScale {
  const timeZone = options.timeZone ?? "UTC";
  const unit = options.scale ?? "day";
  const preset = TIME_SCALE_PRESETS[unit];
  const pxPerDay = options.pxPerDay ?? preset.pxPerDay;
  const start = toEpoch(options.start, timeZone);
  const end = toEpoch(options.end, timeZone);
  if (!(end > start)) throw new RangeError("createTimeScale: end must be after start");
  const pxPerMs = pxPerDay / DAY_MS;
  const weekStartsOn = (getWeekInfo(options.locale ?? "en-US").firstDay % 7) as TimeScale["weekStartsOn"];
  const width = (end - start) * pxPerMs;
  const toPx = (t: TimeInput) => (toEpoch(t, timeZone) - start) * pxPerMs;
  const toTime = (px: number) => start + px / pxPerMs;
  const tz = (ms: number) => new TZDate(ms, timeZone);

  const scale: TimeScale = {
    start,
    end,
    unit,
    timeZone,
    pxPerDay,
    pxPerMs,
    width,
    weekStartsOn,
    toPx,
    toTime,
    toDate: (px) => new Date(toTime(px)),
    durationToPx: (ms) => ms * pxPerMs,
    pxToDuration: (px) => px / pxPerMs,
    snap(t, by, mode = "round") {
      const ms = toEpoch(t, timeZone);
      if (typeof by === "number") {
        // Minute steps are aligned to local wall-clock hours of the zone.
        const hour = startOfHour(tz(ms)).getTime();
        const size = by * 60_000;
        const k = (ms - hour) / size;
        const n = mode === "floor" ? Math.floor(k) : mode === "ceil" ? Math.ceil(k) : Math.round(k);
        return hour + n * size;
      }
      const lo = floorTo(tz(ms), by, weekStartsOn).getTime();
      if (lo === ms || mode === "floor") return lo;
      const hi = step(tz(lo), by).getTime();
      if (mode === "ceil") return hi;
      return ms - lo < hi - ms ? lo : hi;
    },
    ticks(tickUnit = preset.minor) {
      const out: TimeTick[] = [];
      let cur = floorTo(tz(start), tickUnit, weekStartsOn);
      let guard = 0;
      while (cur.getTime() < end && guard++ < 100_000) {
        const next = step(cur, tickUnit);
        const s = Math.max(cur.getTime(), start);
        const e = Math.min(next.getTime(), end);
        const tick: TimeTick = { unit: tickUnit, start: s, end: e, x: (s - start) * pxPerMs, width: (e - s) * pxPerMs, date: isoOf(cur) };
        if (tickUnit === "day" && options.workCalendar) tick.working = workingValue(tick.date, options.workCalendar);
        out.push(tick);
        cur = next;
      }
      return out;
    },
    visibleRange(scrollLeft, viewportWidth, overscanPx = 0) {
      const a = Math.max(0, scrollLeft - overscanPx);
      const b = Math.min(width, scrollLeft + viewportWidth + overscanPx);
      return { start: toTime(a), end: toTime(b) };
    },
    dateOf: (t) => isoOf(tz(toEpoch(t, timeZone))),
    startOfDate: (date) => toEpoch(date, timeZone),
  };
  return scale;
}

/** Converts a minute offset into "HH:mm" (wall clock), e.g. for drag labels. */
export function minutesToClock(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Parses "HH:mm" into minutes since midnight. */
export function clockToMinutes(clock: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(clock.trim());
  if (!m) throw new RangeError(`Expected HH:mm, got "${clock}"`);
  return Number(m[1]) * 60 + Number(m[2]);
}
