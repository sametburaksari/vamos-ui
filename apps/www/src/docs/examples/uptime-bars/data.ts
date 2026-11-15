import type { UptimeBar, UptimeStatus } from "@vamos-ui/react";

const END = Date.UTC(2026, 10, 14);
const iso = (daysAgo: number) => new Date(END - daysAgo * 86_400_000).toISOString().slice(0, 10);

/** `days` daily bars ending 2026-11-14; `events` maps days-ago → status, uptime and a note. */
export function history(days: number, events: Record<number, { status: UptimeStatus; uptime?: number; note?: string }> = {}, since?: number): UptimeBar[] {
  return Array.from({ length: days }, (_, i) => {
    const ago = days - 1 - i;
    if (since !== undefined && ago > since) return { date: iso(ago), status: "none" as const };
    const e = events[ago];
    return e ? { date: iso(ago), ...e } : { date: iso(ago), status: "operational" as const, uptime: 100 };
  });
}
