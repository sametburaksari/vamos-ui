/**
 * Date & time helpers for the pickers (Date picker, Date range picker, Time picker, Calendar).
 *
 * Value rules (X11): a date-only value is a `"YYYY-MM-DD"` string, read and written in the local
 * calendar — never through `toISOString()`, which shifts the day east of UTC. A time of day is
 * `"HH:mm"` or `"HH:mm:ss"` (24h) whatever the display uses.
 *
 * React-free: usable from server components and tests.
 */
import { enUS } from "date-fns/locale/en-US";
import { tr as trLocale } from "date-fns/locale/tr";
import type { Locale as DateFnsLocale } from "date-fns";
import { parse as parseWithPattern, isValid } from "date-fns";

/** A date-only value, `YYYY-MM-DD`. */
export type IsoDateString = string;

/** A from–to range of date-only values. `to` is missing while the user is still picking. */
export interface IsoDateRange {
  from: IsoDateString;
  to?: IsoDateString;
}

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const pad = (n: number, len = 2) => String(n).padStart(len, "0");

/* ------------------------------------------------------------------ */
/* ISO <-> Date                                                        */
/* ------------------------------------------------------------------ */

/** `YYYY-MM-DD` of a `Date` in the local calendar (no UTC shift). */
export function dateToIso(date: Date): IsoDateString {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A `YYYY-MM-DD` string as a local-midnight `Date`, or `null` when malformed / non-existent. */
export function isoToDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = ISO_RE.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const date = new Date(y, mo, d);
  date.setFullYear(y); // years 0–99
  if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d) return null;
  return date;
}

/** True for a well-formed, existing `YYYY-MM-DD` date. */
export function isIsoDateString(value: unknown): value is IsoDateString {
  return typeof value === "string" && isoToDate(value) !== null;
}

/** Today as `YYYY-MM-DD` in the local calendar (or in `timeZone` when given). */
export function todayIso(timeZone?: string, now: Date = new Date()): IsoDateString {
  if (!timeZone) return dateToIso(now);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Adds whole days to a `YYYY-MM-DD` string. */
export function addIsoDays(value: IsoDateString, days: number): IsoDateString {
  const d = isoToDate(value);
  if (!d) return value;
  d.setDate(d.getDate() + days);
  return dateToIso(d);
}

/** Days from `a` to `b` (`b − a`), DST-safe. */
export function isoDiffDays(a: IsoDateString, b: IsoDateString): number {
  const da = isoToDate(a);
  const db = isoToDate(b);
  if (!da || !db) return 0;
  return Math.round((Date.UTC(db.getFullYear(), db.getMonth(), db.getDate()) - Date.UTC(da.getFullYear(), da.getMonth(), da.getDate())) / 86_400_000);
}

/** Inclusive number of days in a range (`1` for a single-day range). */
export function rangeLength(range: IsoDateRange | null | undefined): number {
  if (!range?.from) return 0;
  return isoDiffDays(range.from, range.to ?? range.from) + 1;
}

/** ISO weekday of a local date: 1 = Monday … 7 = Sunday. */
export function isoWeekdayOf(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1;
}

/* ------------------------------------------------------------------ */
/* date-fns locales                                                    */
/* ------------------------------------------------------------------ */

const DATE_FNS_LOCALES = new Map<string, DateFnsLocale>([
  ["en", enUS],
  ["en-us", enUS],
  ["tr", trLocale],
  ["tr-tr", trLocale],
]);

/**
 * Registers a date-fns locale for a BCP 47 tag or language, so the calendars use its month and
 * weekday names. `en-US` and `tr` ship built in.
 *
 * ```ts
 * import { de } from "date-fns/locale/de";
 * registerDateLocale("de", de);
 * ```
 */
export function registerDateLocale(tag: string, locale: DateFnsLocale): void {
  DATE_FNS_LOCALES.set(tag.toLowerCase(), locale);
}

/** The date-fns locale for a BCP 47 tag: exact tag, then language, then `en-US`. */
export function getDateFnsLocale(tag: string): DateFnsLocale {
  const key = tag.toLowerCase().replace("_", "-");
  return DATE_FNS_LOCALES.get(key) ?? DATE_FNS_LOCALES.get(key.split("-")[0]!) ?? enUS;
}

/* ------------------------------------------------------------------ */
/* Locale date pattern (typed input)                                   */
/* ------------------------------------------------------------------ */

export type DatePart = "day" | "month" | "year";

export interface DatePattern {
  /** Order of the numeric parts in the locale, e.g. `["month","day","year"]` for en-US. */
  order: DatePart[];
  /** Separator between parts (`/`, `.`, `-`). */
  separator: string;
  /** date-fns pattern, e.g. `"MM/dd/yyyy"` (en-US), `"dd.MM.yyyy"` (tr). */
  pattern: string;
}

const patternCache = new Map<string, DatePattern>();

/** The numeric short-date pattern of a locale, read from `Intl.DateTimeFormat#formatToParts`. */
export function getDatePattern(locale: string): DatePattern {
  const hit = patternCache.get(locale);
  if (hit) return hit;
  let order: DatePart[] = ["month", "day", "year"];
  let separator = "/";
  try {
    const parts = new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(2026, 10, 23));
    const found = parts.filter((p): p is Intl.DateTimeFormatPart & { type: DatePart } => p.type === "day" || p.type === "month" || p.type === "year").map((p) => p.type);
    if (found.length === 3) order = found;
    const lit = parts.find((p) => p.type === "literal")?.value.trim();
    if (lit) separator = lit.slice(0, 1);
  } catch {
    /* invalid tag: en-US order */
  }
  const token: Record<DatePart, string> = { day: "dd", month: "MM", year: "yyyy" };
  const result = { order, separator, pattern: order.map((p) => token[p]).join(separator) };
  patternCache.set(locale, result);
  return result;
}

/**
 * The placeholder for a typed date: the locale pattern spelled with `tokens`
 * (`"MM/DD/YYYY"` for en-US; tr with `{ day: "GG", month: "AA" }` → `"GG.AA.YYYY"`).
 */
export function datePlaceholder(locale: string, tokens: Partial<Record<DatePart, string>> = {}): string {
  const { order, separator } = getDatePattern(locale);
  const t: Record<DatePart, string> = { day: tokens.day ?? "DD", month: tokens.month ?? "MM", year: tokens.year ?? "YYYY" };
  return order.map((p) => t[p]).join(separator);
}

/** A `YYYY-MM-DD` value in the locale's numeric pattern (`"11/23/2026"`, `"23.11.2026"`). */
export function formatDateInput(value: IsoDateString | null | undefined, locale: string): string {
  const d = isoToDate(value);
  if (!d) return "";
  const { order, separator } = getDatePattern(locale);
  const v: Record<DatePart, string> = { day: pad(d.getDate()), month: pad(d.getMonth() + 1), year: pad(d.getFullYear(), 4) };
  return order.map((p) => v[p]).join(separator);
}

export interface ParseDateOptions {
  /** Reference date for partial input and relative words. Default: now. */
  reference?: Date;
  /** Relative words, lower case. Default English `today / tomorrow / yesterday`. */
  words?: { today?: string[]; tomorrow?: string[]; yesterday?: string[] };
}

const DEFAULT_WORDS = { today: ["today", "now"], tomorrow: ["tomorrow", "tmrw"], yesterday: ["yesterday"] };

function build(y: number, m: number, d: number): IsoDateString | null {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const iso = `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
  return isIsoDateString(iso) ? iso : null;
}

function fullYear(y: string, reference: Date): number {
  const n = Number(y);
  if (y.length > 2) return n;
  // Two-digit year: pick the century that lands within (now − 80, now + 20].
  const now = reference.getFullYear();
  let full = Math.floor(now / 100) * 100 + n;
  if (full > now + 20) full -= 100;
  return full;
}

/**
 * Parses what a person types into a date field. Returns `YYYY-MM-DD` or `null`.
 *
 * Accepts the locale's numeric pattern with any of `. / - ␣` as separator, digits only
 * (`11232026` / `23112026`), partial dates (day + month = this year), two-digit years, ISO
 * `2026-11-23`, month names (`Nov 23, 2026`, `23 Kasım 2026`), relative words and `+3` / `-2` days.
 *
 * ```ts
 * parseDateInput("11/23/2026", "en-US"); // "2026-11-23"
 * parseDateInput("23.11", "tr-TR");      // "2026-11-23" (this year)
 * parseDateInput("tomorrow", "en-US");   // the day after today
 * ```
 */
export function parseDateInput(input: string, locale: string, options: ParseDateOptions = {}): IsoDateString | null {
  const reference = options.reference ?? new Date();
  const raw = input.trim();
  if (!raw) return null;
  const lower = raw.toLocaleLowerCase(locale);

  const words = { ...DEFAULT_WORDS, ...options.words };
  const refIso = dateToIso(reference);
  if (words.today?.includes(lower)) return refIso;
  if (words.tomorrow?.includes(lower)) return addIsoDays(refIso, 1);
  if (words.yesterday?.includes(lower)) return addIsoDays(refIso, -1);
  const rel = /^([+-])\s*(\d{1,4})\s*d?$/.exec(lower);
  if (rel) return addIsoDays(refIso, (rel[1] === "-" ? -1 : 1) * Number(rel[2]));

  if (ISO_RE.test(raw)) return isIsoDateString(raw) ? raw : null;

  const { order } = getDatePattern(locale);
  const pick = (vals: Record<DatePart, string>) => build(fullYear(vals.year, reference), Number(vals.month), Number(vals.day));

  // Digits only: 8 = full, 6 = two-digit year, 4 = day + month this year.
  if (/^\d+$/.test(raw)) {
    const len = raw.length;
    if (len !== 4 && len !== 6 && len !== 8) return null;
    const vals: Record<DatePart, string> = { day: "", month: "", year: String(reference.getFullYear()) };
    let i = 0;
    for (const p of order) {
      if (p === "year") {
        if (len === 4) continue;
        const n = len === 8 ? 4 : 2;
        vals.year = raw.slice(i, i + n);
        i += n;
      } else {
        vals[p] = raw.slice(i, i + 2);
        i += 2;
      }
    }
    return pick(vals);
  }

  // Numeric with separators.
  if (/^\d{1,4}([./\-\s]+\d{1,4}){1,2}[./\s]*$/.test(raw)) {
    const nums = raw.split(/[./\-\s]+/).filter(Boolean);
    if (nums.length === 3) {
      // A leading 4-digit number is a year (ISO-like order), whatever the locale says.
      const effective: DatePart[] = nums[0]!.length === 4 ? ["year", "month", "day"] : order;
      const vals = { day: "", month: "", year: "" } as Record<DatePart, string>;
      effective.forEach((p, idx) => (vals[p] = nums[idx]!));
      return pick(vals);
    }
    if (nums.length === 2) {
      const dm = order.filter((p) => p !== "year");
      const vals = { day: "", month: "", year: String(reference.getFullYear()) } as Record<DatePart, string>;
      dm.forEach((p, idx) => (vals[p] = nums[idx]!));
      return pick(vals);
    }
    return null;
  }

  // Month names: try the locale's long formats.
  const fnsLocale = getDateFnsLocale(locale);
  const patterns = ["PPP", "PP", "P", "d MMMM yyyy", "d MMM yyyy", "MMMM d yyyy", "MMM d yyyy", "MMMM d, yyyy", "MMM d, yyyy", "d MMMM", "d MMM", "MMMM d", "MMM d"];
  const cleaned = raw.replace(/\s+/g, " ").replace(/(\d)(st|nd|rd|th)\b/gi, "$1");
  for (const p of patterns) {
    const d = parseWithPattern(cleaned, p, reference, { locale: fnsLocale });
    if (isValid(d)) return dateToIso(d);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Time of day                                                         */
/* ------------------------------------------------------------------ */

export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

const TIME_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

/** `"14:30"` / `"14:30:05"` → parts, or `null` when malformed or out of range. */
export function parseTime(value: string | null | undefined): TimeParts | null {
  if (!value) return null;
  const m = TIME_RE.exec(value.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  const second = m[3] ? Number(m[3]) : 0;
  if (hour > 23 || minute > 59 || second > 59) return null;
  return { hour, minute, second };
}

/** Parts → `"HH:mm"` (or `"HH:mm:ss"` with `seconds`). */
export function formatTimeValue(parts: TimeParts, seconds = false): string {
  return `${pad(parts.hour)}:${pad(parts.minute)}${seconds ? `:${pad(parts.second)}` : ""}`;
}

/** Minutes since midnight of `"HH:mm[:ss]"` (seconds ignored), or `NaN`. */
export function timeToMinutes(value: string | null | undefined): number {
  const p = parseTime(value);
  return p ? p.hour * 60 + p.minute : Number.NaN;
}

/** Minutes since midnight → `"HH:mm"` (wraps past midnight). */
export function minutesToTime(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Compares two `"HH:mm[:ss]"` strings. */
export function compareTime(a: string, b: string): number {
  const pa = parseTime(a);
  const pb = parseTime(b);
  if (!pa || !pb) return 0;
  return pa.hour * 3600 + pa.minute * 60 + pa.second - (pb.hour * 3600 + pb.minute * 60 + pb.second);
}

/** 12 for locales that show AM/PM (en-US), 24 otherwise (tr, most of Europe). */
export function getHourCycle(locale: string): 12 | 24 {
  try {
    const hc = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
    return hc === "h11" || hc === "h12" ? 12 : 24;
  } catch {
    return 24;
  }
}

/** AM / PM labels of a locale (`["AM","PM"]`, `["ÖÖ","ÖS"]`). */
export function getDayPeriodLabels(locale: string): [am: string, pm: string] {
  const read = (h: number) => {
    try {
      return new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true }).formatToParts(new Date(2026, 0, 1, h)).find((p) => p.type === "dayPeriod")?.value;
    } catch {
      return undefined;
    }
  };
  return [read(9) ?? "AM", read(15) ?? "PM"];
}

/** The time separator of a locale (`":"` almost everywhere, `"."` for some). */
export function getTimeSeparator(locale: string): string {
  try {
    const parts = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(2026, 0, 1, 9, 30));
    return parts.find((p) => p.type === "literal")?.value.trim() || ":";
  } catch {
    return ":";
  }
}

/** Whether the locale puts the day period before the hour (ko, zh). */
export function dayPeriodFirst(locale: string): boolean {
  try {
    const parts = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(new Date(2026, 0, 1, 9, 30));
    const dp = parts.findIndex((p) => p.type === "dayPeriod");
    const h = parts.findIndex((p) => p.type === "hour");
    return dp !== -1 && dp < h;
  } catch {
    return false;
  }
}

/** A list of times from `start` to `end` (inclusive of start, exclusive of end) every `step` minutes. */
export function timeSlots(step = 15, start = "00:00", end = "24:00"): string[] {
  const s = start === "24:00" ? 1440 : timeToMinutes(start);
  const e = end === "24:00" ? 1440 : timeToMinutes(end);
  const out: string[] = [];
  if (!Number.isFinite(s) || !Number.isFinite(e) || step <= 0) return out;
  for (let m = s; m < e; m += step) out.push(minutesToTime(m));
  return out;
}

/* ------------------------------------------------------------------ */
/* Range presets                                                       */
/* ------------------------------------------------------------------ */

/** A quick choice in the Date range picker ("Last 7 days"). `range` is computed from `today`. */
export interface DateRangePreset {
  id: string;
  label: string;
  range: (today: IsoDateString, ctx: { weekStartsOn: number }) => { from: IsoDateString; to: IsoDateString };
}

const monthStart = (iso: IsoDateString) => `${iso.slice(0, 7)}-01`;
const monthEnd = (iso: IsoDateString) => {
  const d = isoToDate(monthStart(iso))!;
  d.setMonth(d.getMonth() + 1, 0);
  return dateToIso(d);
};
const shiftMonth = (iso: IsoDateString, n: number) => {
  const d = isoToDate(monthStart(iso))!;
  d.setMonth(d.getMonth() + n);
  return dateToIso(d);
};

/** English labels of the default presets (the `dateRangePicker` namespace overrides them). */
export const defaultPresetLabels = {
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 days",
  last30: "Last 30 days",
  thisWeek: "This week",
  thisMonth: "This month",
  lastMonth: "Last month",
  last90: "Last 90 days",
  thisYear: "This year",
} as const;
export type PresetLabelKey = keyof typeof defaultPresetLabels;

/** The built-in presets. `weekStartsOn` (0 = Sunday … 6) comes from the locale's week info. */
export function defaultRangePresets(labels: Partial<Record<PresetLabelKey, string>> = {}): DateRangePreset[] {
  const l = { ...defaultPresetLabels, ...labels };
  return [
    { id: "today", label: l.today, range: (t) => ({ from: t, to: t }) },
    { id: "yesterday", label: l.yesterday, range: (t) => ({ from: addIsoDays(t, -1), to: addIsoDays(t, -1) }) },
    { id: "last7", label: l.last7, range: (t) => ({ from: addIsoDays(t, -6), to: t }) },
    { id: "last30", label: l.last30, range: (t) => ({ from: addIsoDays(t, -29), to: t }) },
    {
      id: "thisWeek",
      label: l.thisWeek,
      range: (t, { weekStartsOn }) => {
        const d = isoToDate(t)!;
        const back = (d.getDay() - weekStartsOn + 7) % 7;
        const from = addIsoDays(t, -back);
        return { from, to: addIsoDays(from, 6) };
      },
    },
    { id: "thisMonth", label: l.thisMonth, range: (t) => ({ from: monthStart(t), to: monthEnd(t) }) },
    { id: "lastMonth", label: l.lastMonth, range: (t) => ({ from: shiftMonth(t, -1), to: monthEnd(shiftMonth(t, -1)) }) },
    { id: "last90", label: l.last90, range: (t) => ({ from: addIsoDays(t, -89), to: t }) },
    { id: "thisYear", label: l.thisYear, range: (t) => ({ from: `${t.slice(0, 4)}-01-01`, to: `${t.slice(0, 4)}-12-31` }) },
  ];
}
