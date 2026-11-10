import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { clockToMinutes, createTimeScale, minutesToClock, toEpoch } from "./index";
import { trWorkCalendar } from "../../locale-data/tr";

const DAY = 86_400_000;

describe("createTimeScale", () => {
  const scale = createTimeScale({ start: "2026-11-01", end: "2026-12-01", scale: "day", timeZone: "Europe/Istanbul", locale: "tr-TR" });

  it("maps dates to pixels and back", () => {
    expect(scale.pxPerDay).toBe(44);
    expect(scale.width).toBeCloseTo(30 * 44);
    expect(scale.toPx("2026-11-02")).toBeCloseTo(44);
    expect(scale.toPx("2026-11-01T21:00:00Z")).toBeCloseTo(44); // midnight in Istanbul (UTC+3)
    expect(scale.dateOf(scale.toTime(44 * 9.5))).toBe("2026-11-10");
    expect(scale.durationToPx(DAY / 2)).toBeCloseTo(22);
  });

  it("round-trips px ↔ time (property)", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: scale.width, noNaN: true }), (px) => {
        expect(scale.toPx(scale.toTime(px))).toBeCloseTo(px, 6);
      }),
    );
  });

  it("builds day ticks with working values", () => {
    const s = createTimeScale({ start: "2026-10-26", end: "2026-11-02", timeZone: "Europe/Istanbul", locale: "tr-TR", workCalendar: trWorkCalendar });
    const days = s.ticks("day");
    expect(days.map((d) => d.date)).toEqual(["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"]);
    expect(days.map((d) => d.working)).toEqual([1, 1, 1, 0, 1, 0, 0]);
    expect(days[1]!.x).toBeCloseTo(44);
  });

  it("starts weeks on the locale's first day", () => {
    const tr = createTimeScale({ start: "2026-11-01", end: "2026-11-30", scale: "week", locale: "tr-TR" });
    const us = createTimeScale({ start: "2026-11-01", end: "2026-11-30", scale: "week", locale: "en-US" });
    expect(tr.weekStartsOn).toBe(1);
    expect(us.weekStartsOn).toBe(0);
    expect(tr.ticks("week").map((t) => t.date)).toEqual(["2026-10-26", "2026-11-02", "2026-11-09", "2026-11-16", "2026-11-23"]);
    expect(us.ticks("week")[0]!.date).toBe("2026-11-01");
    expect(tr.ticks("week")[0]!.x).toBe(0); // clipped to the range start
  });

  it("handles DST days (23 h) in the zone", () => {
    const s = createTimeScale({ start: "2026-03-28", end: "2026-03-31", scale: "hour", timeZone: "Europe/Berlin" });
    const days = s.ticks("day");
    expect(days.map((d) => (d.end - d.start) / 3_600_000)).toEqual([24, 23, 24]);
    expect(s.ticks("hour")).toHaveLength(71);
  });

  it("snaps to minutes and calendar units", () => {
    const s = createTimeScale({ start: "2026-11-10", end: "2026-11-11", scale: "hour", timeZone: "Europe/Istanbul" });
    const t = toEpoch("2026-11-10T06:07:00Z"); // 09:07 local
    expect(new Date(s.snap(t, 15)).toISOString()).toBe("2026-11-10T06:00:00.000Z");
    expect(new Date(s.snap(t, 15, "ceil")).toISOString()).toBe("2026-11-10T06:15:00.000Z");
    expect(s.dateOf(s.snap(toEpoch("2026-11-10T12:00:00Z"), "day"))).toBe("2026-11-11");
    expect(s.dateOf(s.snap(toEpoch("2026-11-10T12:00:00Z"), "day", "floor"))).toBe("2026-11-10");
  });

  it("computes the visible window", () => {
    const r = scale.visibleRange(440, 220, 44);
    expect(scale.dateOf(r.start)).toBe("2026-11-10");
    expect(scale.dateOf(r.end - 1)).toBe("2026-11-16");
  });

  it("rejects bad ranges and inputs", () => {
    expect(() => createTimeScale({ start: "2026-11-02", end: "2026-11-01" })).toThrow();
    expect(() => toEpoch("not a date")).toThrow();
  });
});

describe("clock helpers", () => {
  it("converts minutes and clocks", () => {
    expect(minutesToClock(14 * 60 + 15)).toBe("14:15");
    expect(minutesToClock(-15)).toBe("23:45");
    expect(clockToMinutes("09:30")).toBe(570);
    expect(() => clockToMinutes("9.30")).toThrow();
  });
});
