import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { eventDays, instantAt, isLaneEvent, layoutDayEvents, localDate, localMinutes, monthWeeks, packLanes, shiftEvent, weekDays } from "./layout";

const ev = (id: string, start: string, end: string, allDay?: boolean) => ({ id, start, end, allDay });

describe("layoutDayEvents", () => {
  it("packs overlapping events into columns and stretches free ones", () => {
    const out = layoutDayEvents(
      [ev("a", "2026-11-10T09:00:00Z", "2026-11-10T10:00:00Z"), ev("b", "2026-11-10T09:30:00Z", "2026-11-10T11:00:00Z"), ev("c", "2026-11-10T10:00:00Z", "2026-11-10T10:30:00Z"), ev("d", "2026-11-10T13:00:00Z", "2026-11-10T14:00:00Z")],
      "2026-11-10",
      "UTC",
    );
    const by = Object.fromEntries(out.map((p) => [p.event.id, p]));
    expect(by.a).toMatchObject({ startMin: 540, endMin: 600, column: 0, columns: 2 });
    expect(by.b).toMatchObject({ column: 1, columns: 2 });
    expect(by.c).toMatchObject({ column: 0, columns: 2, span: 1 });
    expect(by.d).toMatchObject({ column: 0, columns: 1, span: 1 });
  });

  it("uses the time zone for day boundaries and clips events crossing midnight", () => {
    const e = ev("late", "2026-11-10T20:00:00Z", "2026-11-10T23:00:00Z"); // 23:00–02:00 in Istanbul
    const d1 = layoutDayEvents([e], "2026-11-10", "Europe/Istanbul");
    const d2 = layoutDayEvents([e], "2026-11-11", "Europe/Istanbul");
    expect(d1[0]).toMatchObject({ startMin: 1380, endMin: 1440, continuesAfter: true });
    expect(d2[0]).toMatchObject({ startMin: 0, endMin: 120, continuesBefore: true });
  });

  it("never overlaps two events in the same column (property)", () => {
    const arb = fc.array(fc.tuple(fc.integer({ min: 0, max: 1400 }), fc.integer({ min: 5, max: 240 })), { maxLength: 25 });
    fc.assert(
      fc.property(arb, (spans) => {
        const events = spans.map(([s, len], i) => ev(String(i), new Date(Date.UTC(2026, 10, 10, 0, s)).toISOString(), new Date(Date.UTC(2026, 10, 10, 0, Math.min(1439, s + len))).toISOString()));
        const out = layoutDayEvents(events, "2026-11-10", "UTC", { minDuration: 0 });
        for (const a of out) for (const b of out) {
          if (a === b || a.column !== b.column) continue;
          expect(a.startMin < b.endMin && b.startMin < a.endMin).toBe(false);
        }
        for (const p of out) expect(p.column + p.span).toBeLessThanOrEqual(p.columns);
      }),
    );
  });
});

describe("packLanes", () => {
  it("puts multi-day bars in the lowest free lane and clips them to the range", () => {
    const lanes = packLanes(
      [ev("conf", "2026-11-08", "2026-11-11", true), ev("trip", "2026-11-11", "2026-11-13", true), ev("off", "2026-11-12", "2026-11-12", true), ev("call", "2026-11-12T10:00:00Z", "2026-11-12T11:00:00Z")],
      { start: "2026-11-09", end: "2026-11-15" },
    );
    const by = Object.fromEntries(lanes.map((l) => [l.event.id, l]));
    expect(by.conf).toMatchObject({ lane: 0, startIndex: 0, span: 3, continuesBefore: true });
    expect(by.trip).toMatchObject({ lane: 1, startIndex: 2, span: 3 });
    expect(by.off).toMatchObject({ lane: 0, startIndex: 3, span: 1 });
    expect(by.call).toBeUndefined();
    const all = packLanes([ev("call", "2026-11-12T10:00:00Z", "2026-11-12T11:00:00Z")], { start: "2026-11-09", end: "2026-11-15" }, "UTC", { include: "all" });
    expect(all[0]).toMatchObject({ startIndex: 3, span: 1 });
  });
});

describe("date helpers", () => {
  it("reads local dates and minutes in a zone", () => {
    expect(localDate("2026-11-10T22:30:00Z", "Europe/Istanbul")).toBe("2026-11-11");
    expect(localMinutes("2026-11-10T06:15:00Z", "Europe/Istanbul")).toBe(9 * 60 + 15);
    expect(instantAt("2026-11-10", 9 * 60, "Europe/Istanbul")).toBe("2026-11-10T06:00:00.000Z");
    expect(instantAt("2026-07-01", 9 * 60, "America/New_York")).toBe("2026-07-01T13:00:00.000Z");
  });

  it("treats all-day and 24h+ events as lane events with inclusive end days", () => {
    expect(isLaneEvent(ev("x", "2026-11-10", "2026-11-10", true))).toBe(true);
    expect(isLaneEvent(ev("y", "2026-11-10T00:00:00Z", "2026-11-12T00:00:00Z"))).toBe(true);
    expect(eventDays(ev("z", "2026-11-10T09:00:00Z", "2026-11-11T00:00:00Z"))).toEqual({ start: "2026-11-10", end: "2026-11-10" });
  });

  it("shifts timed events by wall-clock days across DST", () => {
    // 1 Nov 2026: US DST ends. 09:00 New York stays 09:00 after moving one day.
    const out = shiftEvent(ev("m", "2026-10-31T13:00:00Z", "2026-10-31T14:00:00Z"), 1, 0, "America/New_York");
    expect(out).toEqual({ start: "2026-11-01T14:00:00.000Z", end: "2026-11-01T15:00:00.000Z" });
  });

  it("builds weeks and month rows from the locale's first day", () => {
    expect(weekDays("2026-11-12", 1)[0]).toBe("2026-11-09");
    expect(weekDays("2026-11-12", 7)[0]).toBe("2026-11-08");
    const weeks = monthWeeks("2026-11-10", 1);
    expect(weeks[0]![0]).toBe("2026-10-26");
    expect(weeks.at(-1)!.at(-1)).toBe("2026-12-06");
    expect(weeks).toHaveLength(6);
  });
});
