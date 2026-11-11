// Deterministic clock for every admin block. All fixtures are written relative to TODAY,
// so dashboards, SLA timers and "3 days ago" labels read the same on the server, the client
// and in screenshots, no matter when the page is opened.

/** The day every fixture is anchored to (a Wednesday). Date-only values are YYYY-MM-DD. */
export const TODAY = "2026-11-18";
/** "Now" inside the fixtures: 10:24 Istanbul time on TODAY. */
export const NOW = "2026-11-18T10:24:00+03:00";
/** `NOW` as epoch milliseconds — pass to `f.relative(x, { now: NOW_MS })` and timers. */
export const NOW_MS = Date.parse(NOW);

const DAY = 86_400_000;
const base = Date.UTC(2026, 10, 18); // TODAY at 00:00 UTC

/** YYYY-MM-DD `offset` days from TODAY (negative = past). Never shifted by a time zone. */
export function day(offset: number): string {
  return new Date(base + offset * DAY).toISOString().slice(0, 10);
}

/** ISO date-time with +03:00 offset, `offset` days from TODAY at `time` ("09:30"). */
export function at(offset: number, time = "09:00"): string {
  return `${day(offset)}T${time}:00+03:00`;
}

/** ISO date-time `minutes` from NOW (negative = past). */
export function minutesFromNow(minutes: number): string {
  const d = new Date(NOW_MS + minutes * 60_000 + 3 * 3_600_000);
  return `${d.toISOString().slice(0, 19)}+03:00`;
}

/** First day of the month `offset` months from November 2026, as YYYY-MM-DD. */
export function month(offset: number): string {
  return new Date(Date.UTC(2026, 10 + offset, 1)).toISOString().slice(0, 10);
}

/** Whole days between two YYYY-MM-DD values (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);
}
