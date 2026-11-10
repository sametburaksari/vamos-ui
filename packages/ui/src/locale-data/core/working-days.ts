/**
 * Working-day math on a `WorkCalendar`: weekends from the locale, holidays from providers,
 * half-day eves, extra days off and make-up work days. React-free; all dates are `YYYY-MM-DD`.
 */
import { addDays, fromDayNumber, isoWeekday, toDayNumber } from "./date";
import { isRangeCovered } from "./holidays";
import { defaultWorkDays } from "./week-info";
import type { Holiday, HolidayProvider, IsoDate, WorkCalendar } from "./types";

const providersOf = (cal: WorkCalendar): HolidayProvider[] => (cal.holidays ? (Array.isArray(cal.holidays) ? cal.holidays : [cal.holidays]) : []);

const warned = new Set<string>();
function warnCoverage(providers: HolidayProvider[], start: IsoDate, end: IsoDate) {
  for (const p of providers) {
    if (!isRangeCovered(p, { start, end }) && !warned.has(p.id)) {
      warned.add(p.id);
      if (typeof console !== "undefined") {
        console.warn(
          `[vamos-ui] Holiday provider "${p.id}" covers ${p.coverage!.from} – ${p.coverage!.to}; ${start} – ${end} is partly outside it, so holidays there may be missing.`,
        );
      }
    }
  }
}

/** Resolved, fast lookups for a calendar over one date range. */
interface Resolved {
  workDays: Set<number>;
  /** Day value overrides: 0 (off), 0.5 (half), 1 (work). */
  overrides: Map<IsoDate, number>;
}

function resolve(cal: WorkCalendar, start: IsoDate, end: IsoDate): Resolved {
  const workDays = new Set(cal.workDays ?? defaultWorkDays(cal.locale ?? "en-US"));
  const overrides = new Map<IsoDate, number>();
  const providers = providersOf(cal);
  if (providers.length) {
    warnCoverage(providers, start, end);
    const partialValue = cal.partialDays === "half" ? 0.5 : cal.partialDays === "off" ? 0 : 1;
    const byDate = new Map<IsoDate, Holiday[]>();
    for (const p of providers) {
      for (const h of p.get({ start, end }, { region: cal.region })) {
        if (h.kind === "observance") continue;
        const list = byDate.get(h.date) ?? [];
        list.push(h);
        byDate.set(h.date, list);
      }
    }
    for (const [date, list] of byDate) {
      const full = list.some((h) => !h.partial);
      overrides.set(date, full ? 0 : partialValue);
    }
  }
  for (const d of cal.extraWorkDays ?? []) if (d >= start && d <= end) overrides.set(d, 1);
  for (const d of cal.extraDaysOff ?? []) if (d >= start && d <= end) overrides.set(d, 0);
  return { workDays, overrides };
}

function dayValue(r: Resolved, date: IsoDate, weekday: number): number {
  const o = r.overrides.get(date);
  if (o !== undefined) {
    // A holiday on a weekend stays a weekend; make-up days (value 1) override the weekend.
    return r.workDays.has(weekday) ? o : o === 1 ? 1 : 0;
  }
  return r.workDays.has(weekday) ? 1 : 0;
}

/**
 * Working value of one day: 1 (working), 0.5 (half day with `partialDays: "half"`) or 0.
 */
export function workingValue(date: IsoDate, cal: WorkCalendar): number {
  return dayValue(resolve(cal, date, date), date, isoWeekday(date));
}

/** True when `date` is a working day (half days count as working). */
export function isWorkingDay(date: IsoDate, cal: WorkCalendar): boolean {
  return workingValue(date, cal) > 0;
}

/**
 * Working days in `[start, end]`, both inclusive. Returns 0 when `end` is before `start`.
 * With `partialDays: "half"` the result can end in .5.
 *
 * ```ts
 * countWorkingDays("2026-10-26", "2026-10-30", { locale: "tr-TR", holidays: trHolidays }); // 4
 * ```
 */
export function countWorkingDays(start: IsoDate, end: IsoDate, cal: WorkCalendar): number {
  const a = toDayNumber(start);
  const b = toDayNumber(end);
  if (b < a) return 0;
  const r = resolve(cal, start, end);
  let total = 0;
  let wd = isoWeekday(start);
  for (let n = a; n <= b; n++) {
    total += dayValue(r, fromDayNumber(n), wd);
    wd = wd === 7 ? 1 : wd + 1;
  }
  return total;
}

/**
 * The date `n` working days after `date` (before it when `n` is negative). `date` itself is not
 * counted; `n = 0` returns `date` unchanged. Half days count as one step.
 *
 * ```ts
 * addWorkingDays("2026-10-27", 2, trCalendar); // "2026-10-30" (29 October is a holiday)
 * ```
 */
export function addWorkingDays(date: IsoDate, n: number, cal: WorkCalendar): IsoDate {
  if (!Number.isInteger(n)) throw new RangeError("addWorkingDays: n must be an integer");
  if (n === 0) return date;
  const workDays = cal.workDays ?? defaultWorkDays(cal.locale ?? "en-US");
  if (workDays.length === 0 && !(cal.extraWorkDays?.length)) throw new RangeError("addWorkingDays: the calendar has no working days");
  const step = n > 0 ? 1 : -1;
  // Resolve holidays in chunks so long spans stay linear.
  const chunk = Math.max(31, Math.ceil((Math.abs(n) * 7) / Math.max(1, workDays.length)) + 14);
  let remaining = Math.abs(n);
  let cursor = date;
  let guard = 0;
  while (remaining > 0) {
    const from = addDays(cursor, step);
    const to = addDays(cursor, step * chunk);
    const r = step > 0 ? resolve(cal, from, to) : resolve(cal, to, from);
    for (let i = 1; i <= chunk; i++) {
      const d = addDays(cursor, step);
      cursor = d;
      if (dayValue(r, d, isoWeekday(d)) > 0) {
        remaining--;
        if (remaining === 0) break;
      }
    }
    if (++guard > 10_000) throw new RangeError("addWorkingDays: no working day found");
  }
  return cursor;
}

/** The first working day on or after `date` (on or before with `direction: -1`). */
export function nextWorkingDay(date: IsoDate, cal: WorkCalendar, direction: 1 | -1 = 1): IsoDate {
  return isWorkingDay(date, cal) ? date : addWorkingDays(date, direction, cal);
}
