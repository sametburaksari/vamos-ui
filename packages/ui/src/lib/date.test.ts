import { describe, expect, it } from "vitest";
import {
  addIsoDays,
  dateToIso,
  datePlaceholder,
  defaultRangePresets,
  formatDateInput,
  getDatePattern,
  getHourCycle,
  isoToDate,
  parseDateInput,
  parseTime,
  rangeLength,
  timeSlots,
} from "./date";

const ref = new Date(2026, 10, 10); // 10 Nov 2026

describe("lib/date", () => {
  it("round-trips YYYY-MM-DD without UTC shifts", () => {
    expect(dateToIso(isoToDate("2026-03-29")!)).toBe("2026-03-29");
    expect(isoToDate("2026-02-30")).toBeNull();
    expect(addIsoDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(rangeLength({ from: "2026-11-01", to: "2026-11-10" })).toBe(10);
  });

  it("reads the locale pattern", () => {
    expect(getDatePattern("en-US").pattern).toBe("MM/dd/yyyy");
    expect(getDatePattern("tr-TR").pattern).toBe("dd.MM.yyyy");
    expect(datePlaceholder("tr-TR", { day: "GG", month: "AA" })).toBe("GG.AA.YYYY");
    expect(formatDateInput("2026-11-23", "en-US")).toBe("11/23/2026");
    expect(formatDateInput("2026-11-23", "tr-TR")).toBe("23.11.2026");
  });

  it("parses typed dates", () => {
    const o = { reference: ref };
    expect(parseDateInput("11/23/2026", "en-US", o)).toBe("2026-11-23");
    expect(parseDateInput("23.11.2026", "tr-TR", o)).toBe("2026-11-23");
    expect(parseDateInput("23-11-26", "tr-TR", o)).toBe("2026-11-23");
    expect(parseDateInput("23112026", "tr-TR", o)).toBe("2026-11-23");
    expect(parseDateInput("23.11", "tr-TR", o)).toBe("2026-11-23");
    expect(parseDateInput("2026-11-23", "en-US", o)).toBe("2026-11-23");
    expect(parseDateInput("tomorrow", "en-US", o)).toBe("2026-11-11");
    expect(parseDateInput("yarın", "tr-TR", { ...o, words: { tomorrow: ["yarın"] } })).toBe("2026-11-11");
    expect(parseDateInput("+3", "en-US", o)).toBe("2026-11-13");
    expect(parseDateInput("Nov 23, 2026", "en-US", o)).toBe("2026-11-23");
    expect(parseDateInput("02/30/2026", "en-US", o)).toBeNull();
    expect(parseDateInput("soon", "en-US", o)).toBeNull();
  });

  it("handles times and hour cycles", () => {
    expect(parseTime("14:30")).toEqual({ hour: 14, minute: 30, second: 0 });
    expect(parseTime("24:00")).toBeNull();
    expect(getHourCycle("en-US")).toBe(12);
    expect(getHourCycle("tr-TR")).toBe(24);
    expect(timeSlots(30, "09:00", "11:00")).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  it("computes presets from today and the week start", () => {
    const presets = defaultRangePresets();
    const get = (id: string) => presets.find((p) => p.id === id)!.range("2026-11-10", { weekStartsOn: 1 });
    expect(get("last7")).toEqual({ from: "2026-11-04", to: "2026-11-10" });
    expect(get("thisMonth")).toEqual({ from: "2026-11-01", to: "2026-11-30" });
    expect(get("lastMonth")).toEqual({ from: "2026-10-01", to: "2026-10-31" });
    expect(get("thisWeek")).toEqual({ from: "2026-11-09", to: "2026-11-15" });
  });
});
