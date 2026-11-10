import { describe, expect, it } from "vitest";
import { entryMinutes, formatDuration, lineItemsTotal, parseDuration, timesheetTotals, toLineItems } from "./duration";

describe("parseDuration", () => {
  it.each([
    ["1.5", "en-US", 90],
    ["1,5", "tr-TR", 90],
    ["1:30", "en-US", 90],
    ["90m", "en-US", 90],
    ["1h 30m", "en-US", 90],
    ["1h30m", "en-US", 90],
    ["1 sa 30 dk", "tr-TR", 90],
    ["2 hours", "en-US", 120],
    ["", "en-US", 0],
    ["abc", "en-US", null],
    ["1h 30x", "en-US", null],
  ])("%s (%s) → %s", (input, locale, expected) => {
    expect(parseDuration(input, locale)).toBe(expected);
  });
});

describe("formatDuration", () => {
  it("formats short, clock and decimal styles per locale", () => {
    expect(formatDuration(200, "en-US")).toBe("3 h 20 min");
    expect(formatDuration(200, "tr-TR")).toBe("3 sa 20 dk");
    expect(formatDuration(45, "en-US")).toBe("45 min");
    expect(formatDuration(200, "en-US", "clock")).toBe("3:20");
    expect(formatDuration(450, "tr-TR", "decimal")).toBe("7,5");
  });
});

describe("totals and line items", () => {
  it("sums a timesheet", () => {
    const t = timesheetTotals({ a: { "2026-11-09": 120, "2026-11-10": 60 }, b: { "2026-11-10": 30 } }, ["2026-11-09", "2026-11-10"]);
    expect(t).toEqual({ rows: { a: 180, b: 30 }, days: { "2026-11-09": 120, "2026-11-10": 90 }, total: 210 });
  });

  it("groups billable entries into hour lines with decimal totals", () => {
    const rate = { amount: "95.00", currency: "EUR" };
    const lines = toLineItems([
      { id: "1", start: "2026-11-09T09:00:00Z", end: "2026-11-09T11:00:00Z", projectLabel: "Mobile app", billable: true, rate },
      { id: "2", start: "2026-11-10T09:00:00Z", durationMin: 80, projectLabel: "Mobile app", billable: true, rate },
      { id: "3", start: "2026-11-10T13:00:00Z", durationMin: 60, projectLabel: "Mobile app", billable: false, rate },
    ]);
    expect(lines).toEqual([{ description: "Mobile app", quantity: "3.33", unitCode: "HUR", unitPrice: "95.00", currency: "EUR", total: "316.35", entryIds: ["1", "2"] }]);
    expect(lineItemsTotal(lines)).toBe("316.35");
    expect(entryMinutes({ start: "2026-11-10T09:00:00Z" }, Date.parse("2026-11-10T09:45:00Z"))).toBe(45);
  });
});
