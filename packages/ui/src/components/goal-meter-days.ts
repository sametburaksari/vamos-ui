const DAY = 86_400_000;
const toTime = (d: string | Date | number) => (d instanceof Date ? d.getTime() : typeof d === "number" ? d : Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T23:59:59` : d));

/** Whole days from `now` until the end of `deadline` (0 on the last day, negative once it has passed). */
export function daysUntil(deadline: string | Date, now: string | Date | number): number {
  const diff = toTime(deadline) - toTime(now);
  return diff < 0 ? -1 : Math.floor(diff / DAY);
}
