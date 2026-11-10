// OpeningHours — pure, React-free, works in RSC, edge and the browser.
// Every computation happens in the business's IANA time zone, so "open now" is right for a
// visitor in another zone and on a server running in UTC. Ranges with close <= open run past
// midnight ("18:00"–"02:00"); "00:00"–"24:00" (or open == close) is open all day.

import { formatMessage } from "../../../lib/message-format";
import type { OpeningHours, TimeRange, Weekday } from "../../schema/types";

export type { OpeningHours, TimeRange, Weekday };

/** Monday-first, the ISO order. */
export const WEEKDAYS: readonly Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const DAY_MS = 86_400_000;
const SHORT_TO_WEEKDAY: Record<string, Weekday> = { Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun" };

const partsCache = new Map<string, Intl.DateTimeFormat>();
function zoneFormat(timeZone: string): Intl.DateTimeFormat {
  let f = partsCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    partsCache.set(timeZone, f);
  }
  return f;
}

/** Wall-clock parts of an instant in a time zone. */
export interface ZonedMoment {
  /** `YYYY-MM-DD` in the business's zone. */
  date: string;
  weekday: Weekday;
  /** Minutes since local midnight. */
  minutes: number;
}

/** The wall-clock date, weekday and minute of `at` in `timeZone`. */
export function zonedMoment(at: Date | number | string, timeZone: string): ZonedMoment {
  const d = at instanceof Date ? at : new Date(at);
  const p: Record<string, string> = {};
  for (const part of zoneFormat(timeZone).formatToParts(d)) p[part.type] = part.value;
  const hour = Number(p.hour) % 24;
  return { date: `${p.year}-${p.month}-${p.day}`, weekday: SHORT_TO_WEEKDAY[p.weekday!] ?? "mon", minutes: hour * 60 + Number(p.minute) };
}

/** "09:30" → 570; "24:00" → 1440. */
export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
const fromMinutes = (min: number): string => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** Calendar arithmetic on `YYYY-MM-DD` strings (UTC-anchored, never shifts a day). */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = Date.UTC(y!, m! - 1, d!) + n * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}
/** The weekday of a `YYYY-MM-DD` date. */
export function weekdayOf(date: string): Weekday {
  const [y, m, d] = date.split("-").map(Number);
  const js = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay(); // 0 = Sunday
  return WEEKDAYS[(js + 6) % 7]!;
}

/** What applies on one calendar day: the special-day override, or the weekly ranges. */
export interface DayHours {
  date: string;
  weekday: Weekday;
  ranges: TimeRange[];
  closed: boolean;
  /** The special-day entry that replaced the weekly hours. */
  special?: { note?: string };
}

/** Hours for one date (special days win over the weekly schedule). */
export function hoursOn(hours: OpeningHours, date: string): DayHours {
  const weekday = weekdayOf(date);
  const special = hours.special?.find((s) => s.date === date);
  if (special) {
    const ranges = special.closed ? [] : (special.ranges ?? hours.weekly[weekday] ?? []);
    const note = typeof special.note === "string" ? special.note : undefined;
    return { date, weekday, ranges, closed: ranges.length === 0, special: { note } };
  }
  const ranges = hours.weekly[weekday] ?? [];
  return { date, weekday, ranges, closed: ranges.length === 0 };
}

/** A range as [start, end) in minutes from `date`'s midnight; past-midnight ends exceed 1440. */
function span(r: TimeRange): [number, number] {
  const a = toMinutes(r.open);
  let b = toMinutes(r.close);
  if (b <= a) b += 1440; // past midnight, or open == close → 24 h
  return [a, b];
}

/** Open intervals around `date`, in minutes relative to its midnight, merged and sorted. */
function intervals(hours: OpeningHours, date: string, fromDay: number, toDay: number): [number, number][] {
  const out: [number, number][] = [];
  for (let d = fromDay; d <= toDay; d++) {
    const day = hoursOn(hours, addDays(date, d));
    for (const r of day.ranges) {
      const [a, b] = span(r);
      out.push([a + d * 1440, b + d * 1440]);
    }
  }
  out.sort((x, y) => x[0] - y[0]);
  const merged: [number, number][] = [];
  for (const iv of out) {
    const last = merged[merged.length - 1];
    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);
    else merged.push([...iv]);
  }
  return merged;
}

/** True when the business is open at `at` (default now). Handles past-midnight and special days. */
export function isOpenAt(hours: OpeningHours, at: Date | number | string = Date.now()): boolean {
  const z = zonedMoment(at, hours.timeZone);
  return intervals(hours, z.date, -1, 0).some(([a, b]) => z.minutes >= a && z.minutes < b);
}

export type OpenState = "open" | "closing-soon" | "closed";

export interface OpenStatus {
  state: OpenState;
  /** When open: local closing time `HH:mm` (absent when open around the clock). */
  closesAt?: string;
  /** Minutes until closing / opening. */
  minutesLeft?: number;
  /** When closed: the next opening — `dayOffset` 0 = later today, 1 = tomorrow… */
  opensAt?: { time: string; weekday: Weekday; dayOffset: number; date: string };
  /** Open without a break for the next 24 h. */
  allDay?: boolean;
  /** Today is a special day (holiday, event). */
  special?: { closed: boolean; note?: string };
  /** The business's local date and weekday. */
  today: { date: string; weekday: Weekday };
}

/**
 * Open / closing soon / closed at `at`, with the closing or next opening time.
 *
 * ```ts
 * hoursStatus(hours, new Date()) // { state: "open", closesAt: "22:00", minutesLeft: 95, … }
 * ```
 */
export function hoursStatus(hours: OpeningHours, at: Date | number | string = Date.now(), opts: { soonMinutes?: number } = {}): OpenStatus {
  const soon = opts.soonMinutes ?? 60;
  const z = zonedMoment(at, hours.timeZone);
  const day = hoursOn(hours, z.date);
  const base = { today: { date: z.date, weekday: z.weekday }, special: day.special ? { closed: day.closed, note: day.special.note } : undefined };
  const ivs = intervals(hours, z.date, -1, 8);
  const current = ivs.find(([a, b]) => z.minutes >= a && z.minutes < b);
  if (current) {
    const left = current[1] - z.minutes;
    const allDay = left >= 1440;
    return {
      ...base,
      state: !allDay && left <= soon ? "closing-soon" : "open",
      closesAt: allDay ? undefined : fromMinutes(current[1]),
      minutesLeft: allDay ? undefined : left,
      allDay: allDay || undefined,
    };
  }
  const next = ivs.find(([a]) => a > z.minutes);
  if (!next) return { ...base, state: "closed" };
  const dayOffset = Math.floor(next[0] / 1440);
  const date = addDays(z.date, dayOffset);
  return { ...base, state: "closed", minutesLeft: next[0] - z.minutes, opensAt: { time: fromMinutes(next[0]), weekday: weekdayOf(date), dayOffset, date } };
}

/* ------------------------------------------------------------------ */
/* Locale formatting                                                    */
/* ------------------------------------------------------------------ */

const REF_MONDAY = Date.UTC(2024, 0, 1); // 2024-01-01 was a Monday

/** Weekday name from the locale ("Monday" / "Pazartesi"). */
export function weekdayName(day: Weekday, locale = "en-US", style: "long" | "short" | "narrow" = "long"): string {
  const t = REF_MONDAY + WEEKDAYS.indexOf(day) * DAY_MS;
  return new Intl.DateTimeFormat(locale, { weekday: style, timeZone: "UTC" }).format(t);
}

/** Local `HH:mm` → "9:00 AM" (en-US) / "09:00" (tr). Whole hours drop ":00" in 12-hour locales. */
export function formatTime(hhmm: string, locale = "en-US"): string {
  const min = toMinutes(hhmm) % 1440;
  const d = Date.UTC(2000, 0, 1, Math.floor(min / 60), min % 60);
  const h12 = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle?.startsWith("h1");
  const opts: Intl.DateTimeFormatOptions = h12 && min % 60 === 0 ? { hour: "numeric", timeZone: "UTC" } : { hour: h12 ? "numeric" : "2-digit", minute: "2-digit", timeZone: "UTC" };
  return new Intl.DateTimeFormat(locale, opts).format(d).replace(/[  ]/g, " ");
}

/** "09:00–22:00" / "9 AM–10 PM". */
export const formatRange = (r: TimeRange, locale = "en-US") => `${formatTime(r.open, locale)}–${formatTime(r.close, locale)}`;

/** First day of the week for a locale: 1 = Monday … 7 = Sunday. */
export function weekStartOf(locale = "en-US"): number {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info?.firstDay) return info.firstDay;
  } catch {
    /* fall through */
  }
  const region = locale.split("-")[1]?.toUpperCase();
  return region && ["US", "CA", "JP", "BR", "MX", "IL", "PH", "SA", "IN"].includes(region) ? 7 : 1;
}

/** The week in the locale's order (Sunday first for en-US, Monday first for tr). */
export function orderedWeek(locale = "en-US"): Weekday[] {
  const start = weekStartOf(locale) - 1;
  return [...WEEKDAYS.slice(start), ...WEEKDAYS.slice(0, start)];
}

export interface WeekRow {
  weekday: Weekday;
  label: string;
  ranges: TimeRange[];
  /** "09:00–22:00, 23:00–02:00", or empty when closed. */
  text: string;
  closed: boolean;
  allDay: boolean;
  today: boolean;
  /** The date in this week (when `at` is given) and a special-day note. */
  date?: string;
  note?: string;
}

/**
 * The 7 rows of an hours table in locale order. With `at`, rows carry this week's dates, so
 * special days (holidays) replace the weekly hours, and `today` is marked.
 */
export function weekRows(hours: OpeningHours, opts: { locale?: string; at?: Date | number | string; style?: "long" | "short" } = {}): WeekRow[] {
  const locale = opts.locale ?? "en-US";
  const z = opts.at !== undefined ? zonedMoment(opts.at, hours.timeZone) : undefined;
  const todayIdx = z ? WEEKDAYS.indexOf(z.weekday) : -1;
  return orderedWeek(locale).map((weekday) => {
    let ranges = hours.weekly[weekday] ?? [];
    let date: string | undefined;
    let note: string | undefined;
    if (z) {
      // Upcoming occurrence of this weekday (today counts), so the table shows the coming week.
      const offset = (WEEKDAYS.indexOf(weekday) - todayIdx + 7) % 7;
      date = addDays(z.date, offset);
      const day = hoursOn(hours, date);
      ranges = day.ranges;
      note = day.special?.note;
    }
    const allDay = ranges.some((r) => span(r)[1] - span(r)[0] >= 1440);
    return {
      weekday,
      label: weekdayName(weekday, locale, opts.style ?? "long"),
      ranges,
      text: ranges.map((r) => formatRange(r, locale)).join(", "),
      closed: ranges.length === 0,
      allDay,
      today: z ? z.weekday === weekday : false,
      date,
      note,
    };
  });
}

/** Consecutive days with identical hours collapsed: [{ days: "Mon–Fri", text: "09:00–18:00" }]. */
export function summarizeHours(hours: OpeningHours, locale = "en-US"): { days: string; text: string; closed: boolean }[] {
  const rows = weekRows(hours, { locale, style: "short" });
  const groups: { from: WeekRow; to: WeekRow; key: string }[] = [];
  for (const r of rows) {
    const key = r.text || "closed";
    const g = groups[groups.length - 1];
    if (g && g.key === key) g.to = r;
    else groups.push({ from: r, to: r, key });
  }
  return groups.map((g) => ({ days: g.from === g.to ? g.from.label : `${g.from.label}–${g.to.label}`, text: g.from.text, closed: g.from.closed }));
}

const SCHEMA_DAY: Record<Weekday, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

/** schema.org `OpeningHoursSpecification[]` for JSON-LD (weekly + special days). */
export function openingHoursJsonLd(hours: OpeningHours): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const day of WEEKDAYS) {
    for (const r of hours.weekly[day] ?? []) out.push({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${SCHEMA_DAY[day]}`, opens: r.open, closes: r.close === "24:00" ? "23:59" : r.close });
  }
  for (const s of hours.special ?? []) {
    if (s.closed || !s.ranges?.length) out.push({ "@type": "OpeningHoursSpecification", validFrom: s.date, validThrough: s.date, opens: "00:00", closes: "00:00" });
    else for (const r of s.ranges) out.push({ "@type": "OpeningHoursSpecification", validFrom: s.date, validThrough: s.date, opens: r.open, closes: r.close });
  }
  return out;
}

/** The status sentence: "Open now · closes at 22:00", "Closed · opens Thu at 12:00". */
export function describeStatus(s: OpenStatus, labels: Record<"openNow" | "closesAt" | "closingSoon" | "closed" | "closedToday" | "opensAt" | "opensTodayAt" | "open24h", string>, locale = "en-US"): { head: string; tail?: string } {
  const f = (tpl: string, vars?: Record<string, unknown>) => formatMessage(tpl, vars, locale);
  if (s.state !== "closed") {
    if (s.allDay) return { head: f(labels.openNow), tail: f(labels.open24h) };
    const tail = f(labels.closesAt, { time: formatTime(s.closesAt!, locale) });
    return { head: f(s.state === "closing-soon" ? labels.closingSoon : labels.openNow), tail };
  }
  const head = s.special?.closed ? (s.special.note ? `${f(labels.closedToday)} · ${s.special.note}` : f(labels.closedToday)) : f(labels.closed);
  if (!s.opensAt) return { head };
  const time = formatTime(s.opensAt.time, locale);
  const tail = s.opensAt.dayOffset === 0 ? f(labels.opensTodayAt, { time }) : f(labels.opensAt, { day: weekdayName(s.opensAt.weekday, locale, "short"), time });
  return { head, tail };
}

