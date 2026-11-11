import { describe, expect, it, vi } from "vitest";
import fc from "fast-check";
import {
  addDays,
  addWorkingDays,
  buildIban,
  combineHolidayProviders,
  countWorkingDays,
  createHolidayProvider,
  diffDays,
  divideDecimal,
  formatIban,
  fromDayNumber,
  getWeekInfo,
  ibanCheckDigits,
  isIsoDate,
  isoWeekday,
  isWorkingDay,
  multiplyDecimal,
  regionOf,
  roundHalfUp,
  toDayNumber,
  validateIban,
  weekdayOrder,
  weekInfoForRegion,
  workingValue,
  addDecimal,
  type WorkCalendar,
} from "./index";

const isoDateArb = fc.integer({ min: toDayNumber("1990-01-01"), max: toDayNumber("2060-12-31") }).map(fromDayNumber);

describe("date-only arithmetic", () => {
  it("validates calendar dates", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(isIsoDate("2026-02-29")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("26-01-01")).toBe(false);
  });

  it("knows weekdays (1 = Monday … 7 = Sunday)", () => {
    expect(isoWeekday("2026-11-10")).toBe(2);
    expect(isoWeekday("2026-11-15")).toBe(7);
    expect(isoWeekday("1970-01-01")).toBe(4);
  });

  it("round-trips day numbers and adds days (property)", () => {
    fc.assert(
      fc.property(isoDateArb, fc.integer({ min: -2000, max: 2000 }), (d, n) => {
        expect(fromDayNumber(toDayNumber(d))).toBe(d);
        expect(diffDays(d, addDays(d, n))).toBe(n);
        expect(isIsoDate(addDays(d, n))).toBe(true);
      }),
    );
  });
});

describe("getWeekInfo", () => {
  it("returns locale conventions", () => {
    expect(getWeekInfo("tr-TR")).toMatchObject({ firstDay: 1, weekend: [6, 7] });
    expect(getWeekInfo("en-US").firstDay).toBe(7);
    expect(getWeekInfo("de-DE").minimalDays).toBe(4);
    expect(getWeekInfo("ar-SA").weekend).toEqual([5, 6]);
  });

  it("resolves the default region of a bare language", () => {
    expect(regionOf("tr")).toBe("TR");
    expect(regionOf("en")).toBe("US");
    expect(getWeekInfo("tr").firstDay).toBe(1);
  });

  it("has a CLDR fallback table", () => {
    expect(weekInfoForRegion("TR")).toEqual({ firstDay: 1, weekend: [6, 7], minimalDays: 1 });
    expect(weekInfoForRegion("US")).toEqual({ firstDay: 7, weekend: [6, 7], minimalDays: 1 });
    expect(weekInfoForRegion("EG")).toEqual({ firstDay: 6, weekend: [5, 6], minimalDays: 1 });
    expect(weekInfoForRegion("IR").weekend).toEqual([5]);
    expect(weekInfoForRegion("GB").minimalDays).toBe(4);
    expect(weekInfoForRegion(undefined).firstDay).toBe(1);
  });

  it("orders weekday headers from the first day", () => {
    expect(weekdayOrder("tr-TR")).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(weekdayOrder("en-US")).toEqual([7, 1, 2, 3, 4, 5, 6]);
  });
});

describe("holiday providers", () => {
  const northpoint = createHolidayProvider({
    id: "northpoint",
    holidays: [
      { date: "2026-12-24", name: "Company day off", kind: "bank" },
      { date: "2026-12-31", name: "New Year's Eve", kind: "public", partial: { from: "13:00" } },
      { date: "2026-12-08", name: "Founders' Day", kind: "observance" },
      { date: "2026-12-07", name: "Regional fair", kind: "public", region: "TR-34" },
    ],
    coverage: { from: "2026-01-01", to: "2026-12-31" },
  });

  it("returns holidays in range and filters regions", () => {
    expect(northpoint.get({ start: "2026-12-01", end: "2026-12-31" }).map((h) => h.date)).toEqual(["2026-12-08", "2026-12-24", "2026-12-31"]);
    expect(northpoint.get({ start: "2026-12-01", end: "2026-12-31" }, { region: "TR-34" })).toHaveLength(4);
    expect(northpoint.get({ start: "2026-12-31", end: "2026-12-01" })).toEqual([]);
  });

  it("combines providers with intersected coverage", () => {
    const other = createHolidayProvider({ id: "b", holidays: [{ date: "2026-12-25", name: "X", kind: "public" }], coverage: { from: "2025-01-01", to: "2026-06-30" } });
    const both = combineHolidayProviders(northpoint, other);
    expect(both.id).toBe("northpoint+b");
    expect(both.coverage).toEqual({ from: "2026-01-01", to: "2026-06-30" });
    expect(both.get({ start: "2026-12-20", end: "2026-12-26" }).map((h) => h.date)).toEqual(["2026-12-24", "2026-12-25"]);
  });

  it("treats observances as working days and partial days by mode", () => {
    const cal: WorkCalendar = { locale: "en-GB", holidays: northpoint };
    expect(isWorkingDay("2026-12-08", cal)).toBe(true);
    expect(isWorkingDay("2026-12-24", cal)).toBe(false);
    expect(workingValue("2026-12-31", cal)).toBe(1);
    expect(workingValue("2026-12-31", { ...cal, partialDays: "half" })).toBe(0.5);
    expect(workingValue("2026-12-31", { ...cal, partialDays: "off" })).toBe(0);
  });

  it("warns once outside coverage", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const p = createHolidayProvider({ id: "narrow", holidays: [], coverage: { from: "2026-01-01", to: "2026-01-31" } });
    countWorkingDays("2026-01-01", "2026-03-01", { holidays: p });
    countWorkingDays("2026-01-01", "2026-03-01", { holidays: p });
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe("working days", () => {
  const plain: WorkCalendar = { locale: "en-GB" };

  it("counts inclusive ranges", () => {
    expect(countWorkingDays("2026-11-09", "2026-11-15", plain)).toBe(5);
    expect(countWorkingDays("2026-11-14", "2026-11-15", plain)).toBe(0);
    expect(countWorkingDays("2026-11-15", "2026-11-09", plain)).toBe(0);
    expect(countWorkingDays("2026-11-09", "2026-11-15", { workDays: [7] })).toBe(1);
  });

  it("honours extra days off and make-up days", () => {
    const cal: WorkCalendar = { ...plain, extraDaysOff: ["2026-11-10"], extraWorkDays: ["2026-11-14"] };
    expect(countWorkingDays("2026-11-09", "2026-11-15", cal)).toBe(5);
    expect(isWorkingDay("2026-11-14", cal)).toBe(true);
  });

  it("adds working days forwards and backwards", () => {
    expect(addWorkingDays("2026-11-13", 1, plain)).toBe("2026-11-16");
    expect(addWorkingDays("2026-11-16", -1, plain)).toBe("2026-11-13");
    expect(addWorkingDays("2026-11-13", 0, plain)).toBe("2026-11-13");
    expect(() => addWorkingDays("2026-11-13", 1, { workDays: [] })).toThrow();
    expect(() => addWorkingDays("2026-11-13", 1.5, plain)).toThrow();
  });

  const holidays = createHolidayProvider({
    id: "prop",
    holidays: (y) => [
      { date: `${y}-01-01`, name: "A", kind: "public" },
      { date: `${y}-05-01`, name: "B", kind: "public" },
      { date: `${y}-12-24`, name: "C", kind: "public", partial: { from: "13:00" } },
      { date: `${y}-12-25`, name: "D", kind: "public" },
    ],
  });
  const calArb = fc.record({
    workDays: fc.uniqueArray(fc.integer({ min: 1, max: 7 }), { minLength: 1, maxLength: 7 }),
  });

  it("addWorkingDays lands on a working day n working days away (property)", () => {
    fc.assert(
      fc.property(isoDateArb, fc.integer({ min: 1, max: 400 }), calArb, (d, n, c) => {
        const cal: WorkCalendar = { ...c, holidays };
        const end = addWorkingDays(d, n, cal);
        expect(isWorkingDay(end, cal)).toBe(true);
        expect(countWorkingDays(addDays(d, 1), end, cal)).toBe(n);
        expect(addWorkingDays(end, -n, cal) <= d).toBe(true);
      }),
      { numRuns: 150 },
    );
  });

  it("counts are additive over split ranges (property)", () => {
    fc.assert(
      fc.property(isoDateArb, fc.integer({ min: 0, max: 500 }), fc.integer({ min: 0, max: 500 }), calArb, (d, a, b, c) => {
        const cal: WorkCalendar = { ...c, holidays, partialDays: "half" };
        const mid = addDays(d, a);
        const end = addDays(mid, b);
        const whole = countWorkingDays(d, end, cal);
        expect(whole).toBeCloseTo(countWorkingDays(d, mid, cal) + countWorkingDays(addDays(mid, 1), end, cal), 6);
        expect(whole).toBeLessThanOrEqual(a + b + 1);
      }),
      { numRuns: 150 },
    );
  });
});

describe("IBAN (ISO 13616)", () => {
  it("validates known IBANs", () => {
    expect(validateIban("GB82 WEST 1234 5698 7654 32").valid).toBe(true);
    expect(validateIban("DE89370400440532013000").valid).toBe(true);
    expect(validateIban("tr33 0006 1005 1978 6457 8413 26")).toMatchObject({ valid: true, kind: "iban-TR" });
  });

  it("explains failures", () => {
    expect(validateIban("").reason).toBe("empty");
    expect(validateIban("GB82-WEST-1234-5698-7654-3?").reason).toBe("chars");
    expect(validateIban("GB82WEST123456987654").reason).toBe("length");
    expect(validateIban("GB83WEST12345698765432").reason).toBe("checksum");
  });

  it("formats in groups of four", () => {
    expect(formatIban("tr330006100519786457841326")).toBe("TR33 0006 1005 1978 6457 8413 26");
    expect(formatIban("TR3300")).toBe("TR33 00");
  });

  it("built IBANs validate and single-digit errors are caught (property)", () => {
    const bban = fc.stringMatching(/^[0-9]{22}$/);
    fc.assert(
      fc.property(bban, fc.integer({ min: 4, max: 25 }), fc.integer({ min: 1, max: 9 }), (b, pos, delta) => {
        const iban = buildIban("TR", b);
        expect(iban).toHaveLength(26);
        expect(iban.slice(2, 4)).toBe(ibanCheckDigits("TR", b));
        expect(validateIban(iban).valid).toBe(true);
        const ch = Number(iban[pos]);
        const broken = iban.slice(0, pos) + String((ch + delta) % 10) + iban.slice(pos + 1);
        expect(validateIban(broken).valid).toBe(false);
      }),
    );
  });
});

describe("decimal strings", () => {
  it("rounds half-up away from zero", () => {
    expect(roundHalfUp("2.345")).toBe("2.35");
    expect(roundHalfUp("2.344")).toBe("2.34");
    expect(roundHalfUp("-2.345")).toBe("-2.35");
    expect(roundHalfUp("7")).toBe("7.00");
    expect(roundHalfUp(0.1 + 0.2)).toBe("0.30");
  });

  it("multiplies, divides and adds exactly", () => {
    expect(multiplyDecimal("19.99", "3")).toBe("59.97");
    expect(multiplyDecimal("0.125", "1", 2)).toBe("0.13");
    expect(divideDecimal("100", "3")).toBe("33.33");
    expect(divideDecimal("2", "3")).toBe("0.67");
    expect(addDecimal("0.10", "0.20", "1")).toBe("1.30");
  });
});
