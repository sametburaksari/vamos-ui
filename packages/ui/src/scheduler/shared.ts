"use client";

/** Internal helpers shared by Scheduler, ResourceCalendar, Gantt and Timesheet. Not exported publicly. */
import * as React from "react";
import { getWeekInfo, defaultWorkDays } from "../locale-data/core/week-info";
import { holidaysOn } from "../locale-data/core/holidays";
import { workingValue } from "../locale-data/core/working-days";
import { isoWeekday, toIsoDate, isoDateInZone } from "../locale-data/core/date";
import { trHolidays } from "../locale-data/tr/holidays";
import type { Holiday, HolidayProvider, IsoDate, WorkCalendar } from "../locale-data/core/types";

/** Semantic tones and chart hues an event / block / bar can use. */
export type ScheduleTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info" | `chart-${1 | 2 | 3 | 4 | 5 | 6}`;

const TONE_VAR: Record<string, string> = {
  neutral: "var(--fg-muted)",
  accent: "var(--accent-ink)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
};

/** CSS colour for a tone (`--ev` on events, blocks and bars). */
export function toneColor(tone: string | undefined): string {
  if (!tone) return TONE_VAR.accent!;
  if (tone in TONE_VAR) return TONE_VAR[tone]!;
  if (/^chart-[1-6]$/.test(tone)) return `var(--${tone})`;
  return tone; // any CSS colour (user-defined calendars)
}

/** A work calendar with locale defaults filled in (week days, tr holidays). */
export function resolveWorkCalendar(cal: WorkCalendar | undefined, locale: string): WorkCalendar & { workDays: number[]; holidays: HolidayProvider[] } {
  const holidays = cal?.holidays ? (Array.isArray(cal.holidays) ? cal.holidays : [cal.holidays]) : locale.toLowerCase().startsWith("tr") ? [trHolidays] : [];
  return { ...cal, locale: cal?.locale ?? locale, workDays: cal?.workDays ?? defaultWorkDays(cal?.locale ?? locale), holidays };
}

export interface DayInfo {
  date: IsoDate;
  weekday: number;
  /** 1 working, 0.5 half day, 0 off. */
  working: number;
  weekend: boolean;
  holidays: Holiday[];
  /** Earliest partial-holiday cut-off ("13:00") when the day is a half day. */
  partialFrom?: string;
  today: boolean;
}

export function dayInfo(date: IsoDate, cal: ReturnType<typeof resolveWorkCalendar>, today: IsoDate): DayInfo {
  const weekday = isoWeekday(date);
  const holidays = holidaysOn(cal.holidays, date, cal.region);
  const full = holidays.some((h) => !h.partial);
  const partialFrom = full ? undefined : holidays.find((h) => h.partial)?.partial?.from;
  return {
    date,
    weekday,
    working: workingValue(date, { ...cal, partialDays: cal.partialDays ?? "half" }),
    weekend: !cal.workDays.includes(weekday),
    holidays,
    partialFrom,
    today: date === today,
  };
}

/** First day of week, 1 = Monday … 7 = Sunday. */
export const firstDayOf = (locale: string) => getWeekInfo(locale).firstDay;

/** Today as YYYY-MM-DD in a zone; re-renders at most once a minute when `live`. */
export function useNow(live: boolean, intervalMs = 60_000): number {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [live, intervalMs]);
  return now;
}

export const todayIn = (timeZone: string, now = Date.now()) => {
  try {
    return isoDateInZone(now, timeZone);
  } catch {
    return toIsoDate(new Date(now));
  }
};

/** Noon UTC of a date-only value: safe to format with `timeZone: "UTC"` without a day shift. */
export const dateAtNoon = (d: IsoDate) => {
  const [y, m, day] = d.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, day, 12));
};

/**
 * ICU versions differ in the spaces they emit (U+202F before "AM", U+2009 around range dashes).
 * Server (Node) and browser must render the same text, so every formatted string is normalised.
 */
const norm = (s: string) => s.replace(/[\u2009\u202f\u00a0]/g, " ");

export interface StableDateFormat {
  format(d: Date | number): string;
  formatRange(a: Date | number, b: Date | number): string;
  formatToParts(d: Date | number): Intl.DateTimeFormatPart[];
  resolvedOptions(): Intl.ResolvedDateTimeFormatOptions;
}

const fmtCache = new Map<string, StableDateFormat>();
/** Cached, whitespace-normalised Intl.DateTimeFormat. Date-only values: pass `timeZone: "UTC"` with `dateAtNoon`. */
export function dtf(locale: string, options: Intl.DateTimeFormatOptions): StableDateFormat {
  const key = locale + JSON.stringify(options);
  let f = fmtCache.get(key);
  if (!f) {
    const raw = new Intl.DateTimeFormat(locale, options);
    f = {
      format: (d) => norm(raw.format(d)),
      formatRange: (a, b) => norm(typeof raw.formatRange === "function" ? raw.formatRange(a, b) : `${raw.format(a)} – ${raw.format(b)}`),
      formatToParts: (d) => raw.formatToParts(d).map((p) => ({ ...p, value: norm(p.value) })),
      resolvedOptions: () => raw.resolvedOptions(),
    };
    fmtCache.set(key, f);
  }
  return f;
}

/** Formats a date-only value. */
export const fmtDay = (locale: string, d: IsoDate, options: Intl.DateTimeFormatOptions) => dtf(locale, { ...options, timeZone: "UTC" }).format(dateAtNoon(d));

/** "10–16 November 2026" style range of two date-only values. */
export function fmtDayRange(locale: string, a: IsoDate, b: IsoDate, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }): string {
  const f = dtf(locale, { ...options, timeZone: "UTC" });
  if (a === b) return f.format(dateAtNoon(a));
  return f.formatRange(dateAtNoon(a), dateAtNoon(b));
}

/** 24-hour clock for the locale? (tr → true, en-US → false) */
export function uses24h(locale: string): boolean {
  const hc = dtf(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
  return hc === "h23" || hc === "h24";
}

/** Wall-clock minutes → "14:15" / "2:15 PM". */
export function fmtClock(locale: string, minutes: number, h24 = uses24h(locale)): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const d = new Date(Date.UTC(2000, 0, 1, Math.floor(m / 60), m % 60));
  return dtf(locale, { hour: h24 ? "2-digit" : "numeric", minute: "2-digit", hourCycle: h24 ? "h23" : "h12", timeZone: "UTC" }).format(d);
}

/** Hour axis label: "14:00" / "2 PM". */
export function fmtHour(locale: string, hour: number, h24 = uses24h(locale)): string {
  const d = new Date(Date.UTC(2000, 0, 1, hour % 24));
  return h24 ? dtf(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }).format(d) : dtf(locale, { hour: "numeric", hourCycle: "h12", timeZone: "UTC" }).format(d);
}

/**
 * Optimistic patches: apply a change at once, keep it while the save runs, drop it when the
 * parent's data catches up or the save is rejected.
 */
export function useOptimistic<P>() {
  const [patches, setPatches] = React.useState<Record<string, P>>({});
  const apply = React.useCallback((id: string, patch: P) => setPatches((p) => ({ ...p, [id]: patch })), []);
  const clear = React.useCallback((ids: string[]) => setPatches((p) => {
    const next = { ...p };
    for (const id of ids) delete next[id];
    return next;
  }), []);
  return { patches, apply, clear };
}

/** Clamp helper. */
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Visually hidden live region text. */
export function useAnnouncer() {
  const [message, setMessage] = React.useState("");
  const announce = React.useCallback((m: string) => {
    setMessage("");
    window.setTimeout(() => setMessage(m), 30);
  }, []);
  return { message, announce };
}
