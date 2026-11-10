/**
 * `YYYY-MM-DD` arithmetic on the proleptic Gregorian calendar, done in UTC so the host time zone
 * never shifts a day. React-free.
 */
import type { IsoDate } from "./types";

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

/** True for a well-formed, existing calendar date ("2026-02-30" is false). */
export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string") return false;
  const m = ISO_RE.exec(value);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1) return false;
  return d <= daysInMonth(y, mo);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Days since 1970-01-01 for a `YYYY-MM-DD` string. Throws on malformed input. */
export function toDayNumber(date: IsoDate): number {
  const m = ISO_RE.exec(date);
  if (!m) throw new RangeError(`Expected YYYY-MM-DD, got "${date}"`);
  return Math.round(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / DAY_MS);
}

/** Inverse of `toDayNumber`. */
export function fromDayNumber(n: number): IsoDate {
  const d = new Date(n * DAY_MS);
  const y = d.getUTCFullYear();
  const yy = y < 0 ? "-" + String(-y).padStart(6, "0") : String(y).padStart(4, "0");
  return `${yy}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function addDays(date: IsoDate, n: number): IsoDate {
  return fromDayNumber(toDayNumber(date) + n);
}

/** Whole days from `a` to `b` (`b − a`). */
export function diffDays(a: IsoDate, b: IsoDate): number {
  return toDayNumber(b) - toDayNumber(a);
}

/** ISO weekday: 1 = Monday … 7 = Sunday (the numbering of `Intl.Locale#getWeekInfo`). */
export function isoWeekday(date: IsoDate): number {
  // 1970-01-01 was a Thursday (4).
  const n = toDayNumber(date);
  return ((((n + 3) % 7) + 7) % 7) + 1;
}

/** The local calendar date of a `Date` (or now), without going through UTC. */
export function toIsoDate(d: Date = new Date()): IsoDate {
  return `${String(d.getFullYear()).padStart(4, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** `YYYY-MM-DD` of an instant in an IANA time zone. */
export function isoDateInZone(instant: Date | number, timeZone: string): IsoDate {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function compareIsoDate(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Every date in `[start, end]`, inclusive. */
export function eachDay(start: IsoDate, end: IsoDate): IsoDate[] {
  const a = toDayNumber(start);
  const b = toDayNumber(end);
  const out: IsoDate[] = [];
  for (let n = a; n <= b; n++) out.push(fromDayNumber(n));
  return out;
}
