import { describe, expect, it } from "vitest";
import { describeStatus, timeVars, formatTime, hoursStatus, isOpenAt, orderedWeek, summarizeHours, weekRows, weekStartOf, openingHoursJsonLd, type OpeningHours } from "./opening-hours";
import { site2Labels, site2LabelsTr } from "./labels-2";

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
    expect(describeStatus(s, site2Labels)).toEqual({ head: "Open", tail: "24 hours" });
    expect(describeStatus(s, site2LabelsTr, "tr-TR")).toEqual({ head: "Açık", tail: "24 saat" });
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

  it("describes every state once, without repeating itself (EN)", () => {
    const d = (local: string) => describeStatus(hoursStatus(hours, at(local)), site2Labels, "en-US");
    const line = (x: { head: string; tail?: string }) => [x.head, x.tail].filter(Boolean).join(" · ");
    expect(line(d("2026-11-10T13:00:00"))).toBe("Open · until 11 PM");
    expect(line(d("2026-11-10T22:15:00"))).toBe("Closing soon · open until 11 PM");
    expect(line(d("2026-11-14T01:30:00"))).toBe("Closing soon · open until 2 AM");
    expect(line(d("2026-11-12T16:00:00"))).toBe("Closed · opens at 6 PM");
    expect(line(d("2026-11-16T10:00:00"))).toBe("Closed · opens tomorrow at 12 PM");
    expect(line(d("2026-11-11T13:00:00"))).toBe("Closed today · Staff day · opens tomorrow at 12 PM");
    // Sunday after closing: Monday is closed, so the next opening is two days out.
    expect(line(d("2026-11-15T23:00:00"))).toBe("Closed · opens Tue at 12 PM");
    for (const local of ["2026-11-10T13:00:00", "2026-11-10T22:15:00", "2026-11-16T10:00:00"]) {
      expect(line(d(local))).not.toMatch(/clos\w*.*clos/i);
    }
  });

  it("describes every state naturally in Turkish, with the right case suffix", () => {
    const d = (local: string) => describeStatus(hoursStatus(hours, at(local)), site2LabelsTr, "tr-TR");
    const line = (x: { head: string; tail?: string }) => [x.head, x.tail].filter(Boolean).join(" · ");
    expect(line(d("2026-11-10T13:00:00"))).toBe("Açık · 23:00’e kadar");
    expect(line(d("2026-11-10T22:15:00"))).toBe("Birazdan kapanıyor · 23:00’e kadar açık");
    expect(line(d("2026-11-14T01:30:00"))).toBe("Birazdan kapanıyor · 02:00’ye kadar açık");
    expect(line(d("2026-11-12T16:00:00"))).toBe("Kapalı · bugün 18:00’de açılıyor");
    expect(line(d("2026-11-16T10:00:00"))).toBe("Kapalı · yarın 12:00’de açılıyor");
    expect(line(d("2026-11-15T23:00:00"))).toBe("Kapalı · Sal 12:00’de açılıyor");
  });

  it("picks the Turkish suffix from the last spoken word", () => {
    const to = (t: string) => timeVars(t, "tr-TR").timeTo;
    const atT = (t: string) => timeVars(t, "tr-TR").timeAt;
    expect([to("01:00"), to("02:00"), to("06:00"), to("09:00"), to("10:00"), to("20:00"), to("22:30"), to("00:00"), to("15:45")]).toEqual([
      "01:00’e", "02:00’ye", "06:00’ya", "09:00’a", "10:00’a", "20:00’ye", "22:30’a", "00:00’a", "15:45’e",
    ]);
    expect([atT("03:00"), atT("12:00"), atT("16:00"), atT("19:40"), atT("18:00")]).toEqual(["03:00’te", "12:00’de", "16:00’da", "19:40’ta", "18:00’de"]);
    expect(timeVars("01:00", "en-US")).toEqual({ time: "1 AM", timeTo: "1 AM", timeAt: "1 AM" });
  });
});
