import {
  addDecimal,
  compareDecimal,
  createFormatter,
  currencyDigits,
  fromISODate,
  fromMinorUnits,
  multiplyDecimal,
  parseDecimal,
  parseNumber,
  readingMinutes,
  roundDecimal,
  subtractDecimal,
  toISODate,
  toMinorUnits,
} from "./index";

// Intl output uses narrow no-break spaces in some places; normalise for readable assertions.
const n = (s: string) => s.replace(/[\u00a0\u202f\u2009]/g, " ");

const en = createFormatter("en-US", { currency: "USD", timeZone: "UTC" });
const tr = createFormatter("tr-TR", { currency: "TRY", timeZone: "Europe/Istanbul" });
const NOW = Date.UTC(2026, 10, 10, 12, 0, 0);

describe("numbers", () => {
  it("formats numbers and exact decimal strings", () => {
    expect(en.number(1234.5)).toBe("1,234.5");
    expect(tr.number(1234.5)).toBe("1.234,5");
    expect(en.number("12345678901234567.89")).toBe("12,345,678,901,234,567.89");
  });
  it("formats currency with the default and an explicit code", () => {
    expect(en.currency("1250.50")).toBe("$1,250.50");
    expect(tr.currency("1250.50")).toBe("₺1.250,50");
    expect(en.currency(5, "EUR")).toBe("€5.00");
    expect(tr.currency(5, { currency: "USD" })).toBe("$5,00");
    expect(en.currency(1250, { display: "code" }).replace(/\s/g, " ")).toMatch(/USD.1,250\.00/);
  });
  it("formats percent with locale sign position", () => {
    expect(en.percent(0.124, { signDisplay: "exceptZero" })).toBe("+12.4%");
    expect(tr.percent(0.124, { signDisplay: "exceptZero" })).toBe("+%12,4");
  });
  it("formats compact numbers", () => {
    expect(en.compact(1234567)).toBe("1.2M");
    expect(n(tr.compact(1234567))).toBe("1,2 Mn");
  });
  it("formats bytes", () => {
    expect(en.bytes(512)).toBe("512 byte");
    expect(en.bytes(1_200_000)).toBe("1.2 MB");
    expect(tr.bytes(1_200_000)).toBe("1,2 MB");
    expect(en.bytes(1536, { binary: true })).toBe("1.5 kB");
  });
  it("formats durations", () => {
    expect(en.duration(167)).toBe("2m 47s");
    expect(tr.duration(167)).toBe("2 dk. 47 sn.");
    expect(en.duration(3725)).toBe("1h 2m");
    expect(en.duration(3725, { maxParts: 3 })).toBe("1h 2m 5s");
    expect(en.duration(90_000, { unit: "ms" })).toBe("1m 30s");
    expect(en.duration(0)).toBe("0s");
    expect(en.duration(5400, { smallest: "h" })).toBe("2h");
  });
  it("caps counts", () => {
    expect(en.count(42)).toBe("42");
    expect(en.count(120)).toBe("99+");
    expect(tr.count(1500, 999)).toBe("999+");
  });
  it("formats lists", () => {
    expect(en.list(["Ada", "Grace", "Linus"])).toBe("Ada, Grace, and Linus");
    expect(tr.list(["Ada", "Grace", "Linus"])).toBe("Ada, Grace ve Linus");
  });
});

describe("dates", () => {
  it("never shifts date-only values by the time zone", () => {
    expect(en.date("2026-11-08")).toBe("Nov 8, 2026");
    expect(tr.date("2026-11-08")).toBe("8 Kas 2026");
    const la = createFormatter("en-US", { timeZone: "America/Los_Angeles" });
    expect(la.date("2026-01-01")).toBe("Jan 1, 2026");
  });
  it("formats instants in the formatter's time zone", () => {
    const instant = new Date("2026-11-10T21:30:00Z");
    expect(en.date(instant, "long")).toBe("November 10, 2026");
    expect(tr.date(instant, "long")).toBe("11 Kasım 2026"); // already the 11th in Istanbul (UTC+3)
    expect(n(en.time(instant))).toBe("9:30 PM");
    expect(tr.time(instant)).toBe("00:30");
  });
  it("formats time-only strings and date ranges", () => {
    expect(n(en.time("09:30"))).toBe("9:30 AM");
    expect(tr.time("09:30")).toBe("09:30");
    expect(n(en.dateRange("2026-11-08", "2026-11-12"))).toBe("Nov 8 – 12, 2026");
    expect(n(tr.dateRange("2026-11-08", "2026-11-12"))).toBe("8–12 Kas 2026");
  });
  it("supports presets and raw options", () => {
    expect(en.date("2026-11-08", "month-year")).toBe("November 2026");
    expect(tr.date("2026-11-08", { weekday: "long" })).toBe("Pazar");
    expect(n(en.dateTime(new Date("2026-11-10T09:05:00Z")))).toBe("Nov 10, 2026, 9:05 AM");
    expect(en.date("not a date")).toBe("");
  });
  it("formats relative times", () => {
    expect(en.relative(NOW - 4 * 60_000, { now: NOW })).toBe("4 minutes ago");
    expect(tr.relative(NOW - 4 * 60_000, { now: NOW })).toBe("4 dakika önce");
    expect(en.relative(NOW - 86_400_000, { now: NOW })).toBe("yesterday");
    expect(tr.relative(NOW - 86_400_000, { now: NOW })).toBe("dün");
    expect(en.relative(NOW + 14 * 86_400_000, { now: NOW })).toBe("in 2 weeks");
    expect(en.relative(-1, "day")).toBe("yesterday");
    expect(tr.relative(3, "month")).toBe("3 ay sonra");
  });
  it("round-trips ISO dates in local time", () => {
    const d = fromISODate("2026-03-31")!;
    expect(d.getDate()).toBe(31);
    expect(toISODate(d)).toBe("2026-03-31");
    expect(fromISODate("2026-02-30")).toBeNull();
    expect(fromISODate("31.03.2026")).toBeNull();
  });
});

describe("parsing", () => {
  it("parses locale numbers into decimal strings", () => {
    expect(parseDecimal("1.250,50", "tr-TR")).toBe("1250.50");
    expect(parseDecimal("1,250.50", "en-US")).toBe("1250.50");
    expect(parseDecimal("12,5", "tr-TR")).toBe("12.5");
    expect(parseDecimal("₺1.250", "tr-TR")).toBe("1250");
    expect(parseDecimal("$ -42.10", "en-US")).toBe("-42.10");
    expect(parseDecimal("(42.00)", "en-US")).toBe("-42.00");
    expect(parseDecimal("%12,5", "tr-TR")).toBe("12.5");
    expect(parseDecimal("1 250,5", "fr-FR")).toBe("1250.5");
    expect(parseDecimal("٣٤٥", "ar-EG")).toBe("345");
  });
  it("is lenient about a single foreign decimal separator", () => {
    expect(parseDecimal("1250.75", "tr-TR")).toBe("1250.75");
    expect(parseDecimal("1.250", "tr-TR")).toBe("1250");
    expect(parseDecimal("0,5", "en-US")).toBe("0.5");
  });
  it("rejects non-numbers", () => {
    for (const bad of ["", "abc", "1,2,3,4", "1.2.3", "12-3", "--"]) expect(parseDecimal(bad, "en-US")).toBeNull();
  });
  it("parseNumber returns numbers", () => {
    expect(parseNumber("tr-TR")("1.250,5")).toBe(1250.5);
    expect(parseNumber("en-US")("oops")).toBeNull();
  });
});

describe("decimal strings", () => {
  it("converts minor units exactly", () => {
    expect(toMinorUnits("12.345")).toBe(1235n);
    expect(toMinorUnits("12.345", 2, "half-even")).toBe(1234n);
    expect(toMinorUnits("12.355", 2, "half-even")).toBe(1236n);
    expect(toMinorUnits("-0.005")).toBe(-1n);
    expect(fromMinorUnits(1235n)).toBe("12.35");
    expect(fromMinorUnits(-5n)).toBe("-0.05");
    expect(fromMinorUnits(7n, 0)).toBe("7");
  });
  it("adds without float drift", () => {
    expect(addDecimal(["0.1", "0.2"])).toBe("0.30");
    expect(subtractDecimal("100", "33.33")).toBe("66.67");
    expect(roundDecimal("2.345")).toBe("2.35");
  });
  it("multiplies quantity × price and VAT", () => {
    expect(multiplyDecimal("19.99", "3")).toBe("59.97");
    expect(multiplyDecimal("1250.00", "0.20")).toBe("250.00");
    expect(multiplyDecimal("10.05", 1.5)).toBe("15.08");
  });
  it("compares", () => {
    expect(compareDecimal("1.50", "1.5")).toBe(0);
    expect(compareDecimal("-2", "1")).toBe(-1);
    expect(compareDecimal("10", "9.99")).toBe(1);
  });
  it("knows currency digits", () => {
    expect(currencyDigits("USD")).toBe(2);
    expect(currencyDigits("JPY")).toBe(0);
    expect(currencyDigits("KWD")).toBe(3);
  });
  it("estimates reading time", () => {
    expect(readingMinutes(1100)).toBe(5);
    expect(readingMinutes("Short note")).toBe(1);
  });
});
