import { describe, expect, it } from "vitest";
import { describeStatus, formatTime, hoursStatus, isOpenAt, orderedWeek, summarizeHours, weekRows, weekStartOf, openingHoursJsonLd, type OpeningHours } from "./opening-hours";
import { site2Labels } from "./labels-2";

// A meyhane in Istanbul (UTC+3, no DST): late on weekends, closed Mondays, a holiday closure.
const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    tue: [{ open: "12:00", close: "23:00" }],
    wed: [{ open: "12:00", close: "23:00" }],
    thu: [{ open: "12:00", close: "15:00" }, { open: "18:00", close: "23:00" }],
    fri: [{ open: "12:00", close: "02:00" }],
    sat: [{ open: "12:00", close: "02:00" }],
    sun: [{ open: "12:00", close: "22:00" }],
  },
  special: [
    { date: "2026-11-11", closed: true, note: "Staff day" },
    { date: "2026-12-31", ranges: [{ open: "19:00", close: "03:00" }], note: "New Year’s Eve" },
  ],
};
// 2026-11-10 is a Tuesday.
const at = (local: string) => new Date(`${local}+03:00`);

describe("OpeningHours", () => {
  it("evaluates in the business's time zone, not the machine's", () => {
    expect(isOpenAt(hours, at("2026-11-10T12:30:00"))).toBe(true);
    // 08:30 UTC = 11:30 Istanbul → still closed.
    expect(isOpenAt(hours, new Date("2026-11-10T08:30:00Z"))).toBe(false);
    expect(isOpenAt(hours, new Date("2026-11-10T09:30:00Z"))).toBe(true);
  });

  it("handles ranges past midnight (Friday 12:00–02:00 is open at 01:30 Saturday)", () => {
    expect(isOpenAt(hours, at("2026-11-14T01:30:00"))).toBe(true);
    expect(isOpenAt(hours, at("2026-11-14T02:00:00"))).toBe(false);
    // Sunday 01:00 is still Saturday night.
    expect(isOpenAt(hours, at("2026-11-15T01:00:00"))).toBe(true);
  });

  it("special days replace the weekly hours", () => {
    expect(isOpenAt(hours, at("2026-11-11T13:00:00"))).toBe(false);
    const s = hoursStatus(hours, at("2026-11-11T13:00:00"));
    expect(s.state).toBe("closed");
    expect(s.special).toEqual({ closed: true, note: "Staff day" });
    expect(s.opensAt).toMatchObject({ weekday: "thu", time: "12:00", dayOffset: 1 });
    expect(isOpenAt(hours, at("2027-01-01T02:30:00"))).toBe(true);
  });

  it("reports closing soon, split shifts and the next opening", () => {
    expect(hoursStatus(hours, at("2026-11-10T22:15:00"))).toMatchObject({ state: "closing-soon", closesAt: "23:00", minutesLeft: 45 });
    expect(hoursStatus(hours, at("2026-11-12T16:00:00"))).toMatchObject({ state: "closed", opensAt: { time: "18:00", dayOffset: 0 } });
    // Monday is closed → opens Tuesday.
    expect(hoursStatus(hours, at("2026-11-16T10:00:00")).opensAt).toMatchObject({ weekday: "tue", dayOffset: 1 });
  });

  it("detects open 24 hours", () => {
    const allDay: OpeningHours = { timeZone: "UTC", weekly: { mon: [{ open: "00:00", close: "24:00" }], tue: [{ open: "00:00", close: "24:00" }] } };
    const s = hoursStatus(allDay, new Date("2026-11-09T10:00:00Z"));
    expect(s).toMatchObject({ state: "open", allDay: true });
    expect(describeStatus(s, site2Labels).tail).toBe("Open 24 hours");
  });

  it("formats with Intl: week start, 12/24 h, weekday names", () => {
    expect(weekStartOf("tr-TR")).toBe(1);
    expect(weekStartOf("en-US")).toBe(7);
    expect(orderedWeek("en-US")[0]).toBe("sun");
    expect(orderedWeek("tr-TR")[0]).toBe("mon");
    expect(formatTime("09:00", "tr-TR")).toBe("09:00");
    expect(formatTime("22:00", "en-US")).toMatch(/^10\sPM$/);
    expect(formatTime("09:30", "en-US")).toMatch(/^9:30\sAM$/);
    const rows = weekRows(hours, { locale: "tr-TR", at: at("2026-11-10T12:00:00") });
    expect(rows[0]).toMatchObject({ weekday: "mon", label: "Pazartesi", closed: true });
    expect(rows[1]).toMatchObject({ weekday: "tue", today: true, text: "12:00–23:00" });
    // The coming Wednesday is the staff day.
    expect(rows[2]).toMatchObject({ closed: true, note: "Staff day" });
  });

  it("summarises consecutive identical days and emits JSON-LD", () => {
    const s = summarizeHours(hours, "en-GB");
    expect(s[0]).toMatchObject({ days: "Mon", closed: true });
    expect(s[1]).toMatchObject({ days: "Tue–Wed" });
    const ld = openingHoursJsonLd(hours);
    expect(ld[0]).toMatchObject({ dayOfWeek: "https://schema.org/Tuesday", opens: "12:00", closes: "23:00" });
    expect(ld.some((x) => x.validFrom === "2026-11-11" && x.opens === "00:00" && x.closes === "00:00")).toBe(true);
  });

  it("describes the status in words", () => {
    const tr = { ...site2Labels, closesAt: "{time}’de kapanıyor", openNow: "Şu an açık" };
    expect(describeStatus(hoursStatus(hours, at("2026-11-10T13:00:00")), tr, "tr-TR")).toEqual({ head: "Şu an açık", tail: "23:00’de kapanıyor" });
    expect(describeStatus(hoursStatus(hours, at("2026-11-16T10:00:00")), site2Labels, "en-US")).toEqual({ head: "Closed", tail: "opens Tue at 12 PM" });
  });
});
