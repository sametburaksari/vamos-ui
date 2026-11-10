import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { addWorkingDays, countWorkingDays, isoWeekday, isWorkingDay, toUnits } from "../core";
import {
  activeTaxRates,
  allocateProRata,
  checkTrPostalCode,
  computeKdv,
  findTrProvince,
  grossFromNet,
  loadTrAddressData,
  maskTrId,
  needsExemptionCode,
  netFromGross,
  tcknCheckDigits,
  trAmountInWords,
  trDistricts,
  trHolidays,
  trHolidaysForYear,
  trKdv,
  trPack,
  trProvinces,
  trTaxSchemeId,
  trWorkCalendar,
  validateTckn,
  validateTrIban,
  validateTrTaxId,
  validateVkn,
  vatFromNet,
  vknCheckDigit,
  withheldVat,
  TR_RELIGIOUS_HOLIDAYS,
} from "./index";

describe("tr holidays", () => {
  it("lists the fixed national holidays with the 28 October half day", () => {
    const oct = trHolidays.get({ start: "2026-10-01", end: "2026-10-31" });
    expect(oct.map((h) => [h.date, h.localName, h.partial?.from])).toEqual([
      ["2026-10-28", "Cumhuriyet Bayramı Arifesi", "13:00"],
      ["2026-10-29", "Cumhuriyet Bayramı", undefined],
    ]);
    const fixed = trHolidaysForYear(2030).map((h) => h.date);
    expect(fixed).toEqual(["2030-01-01", "2030-04-23", "2030-05-01", "2030-05-19", "2030-07-15", "2030-08-30", "2030-10-28", "2030-10-29"]);
  });

  it.each([
    [2025, "2025-03-29", ["2025-03-30", "2025-03-31", "2025-04-01"], "2025-06-05", ["2025-06-06", "2025-06-07", "2025-06-08", "2025-06-09"]],
    [2026, "2026-03-19", ["2026-03-20", "2026-03-21", "2026-03-22"], "2026-05-26", ["2026-05-27", "2026-05-28", "2026-05-29", "2026-05-30"]],
    [2027, "2027-03-08", ["2027-03-09", "2027-03-10", "2027-03-11"], "2027-05-15", ["2027-05-16", "2027-05-17", "2027-05-18", "2027-05-19"]],
  ])("religious holidays %i match the Diyanet table", (year, rEve, rDays, kEve, kDays) => {
    const list = trHolidaysForYear(year);
    const ramadan = list.filter((h) => h.id?.startsWith("tr-ramadan"));
    const sacrifice = list.filter((h) => h.id?.startsWith("tr-sacrifice"));
    expect(ramadan.map((h) => h.date)).toEqual([rEve, ...rDays]);
    expect(sacrifice.map((h) => h.date)).toEqual([kEve, ...kDays]);
    expect(ramadan[0]!.partial).toEqual({ from: "13:00" });
    expect(sacrifice[0]!.partial).toEqual({ from: "13:00" });
    expect(list.every((h) => h.verified === true)).toBe(true);
  });

  it("covers 2025–2027 and every table row is verified", () => {
    expect(trHolidays.coverage).toEqual({ from: "2025-01-01", to: "2027-12-31" });
    expect(TR_RELIGIOUS_HOLIDAYS.map((r) => r.year)).toEqual([2025, 2026, 2027]);
    expect(TR_RELIGIOUS_HOLIDAYS.every((r) => r.verified)).toBe(true);
  });

  it("drives working-day math", () => {
    // Republic Day week 2026: Mon 26 – Fri 30 Oct, 29 Oct off, 28 Oct half day.
    expect(countWorkingDays("2026-10-26", "2026-10-30", trWorkCalendar)).toBe(4);
    expect(countWorkingDays("2026-10-26", "2026-10-30", { ...trWorkCalendar, partialDays: "half" })).toBe(3.5);
    expect(addWorkingDays("2026-10-27", 2, trWorkCalendar)).toBe("2026-10-30");
    // Ramazan Bayramı 2026 (Fri 20 – Sun 22 March) + eve Thu 19.
    expect(countWorkingDays("2026-03-16", "2026-03-22", trWorkCalendar)).toBe(4);
    expect(isWorkingDay("2026-05-27", trWorkCalendar)).toBe(false);
    expect(isoWeekday("2026-05-27")).toBe(3);
    // Year 2026: 261 weekdays; 10 full-day holidays fall on weekdays.
    expect(countWorkingDays("2026-01-01", "2026-12-31", trWorkCalendar)).toBe(251);
  });

  it("ships pack metadata", () => {
    expect(trPack.weekInfo).toEqual({ firstDay: 1, weekend: [6, 7], minimalDays: 1 });
    expect(trPack.idRules?.map((r) => r.id)).toEqual(["tr-tckn", "tr-vkn", "tr-tax-id"]);
    expect(trPack.money?.amountInWords?.("1.00", "TRY")).toBe("Yalnız Bir Türk Lirası");
  });
});

const digits = (n: number) => fc.stringMatching(new RegExp(`^[0-9]{${n}}$`));

describe("TCKN / YKN", () => {
  it("validates known numbers", () => {
    expect(validateTckn("10000000146")).toEqual({ valid: true, value: "10000000146", kind: "tr-tckn" });
    expect(validateTckn("100 000 001 46").valid).toBe(true);
    const ykn = "99" + "0000000" + tcknCheckDigits("990000000");
    expect(validateTckn(ykn)).toMatchObject({ valid: true, kind: "tr-ykn" });
  });

  it("rejects bad input with a reason", () => {
    expect(validateTckn("").reason).toBe("empty");
    expect(validateTckn("1000000014a").reason).toBe("chars");
    expect(validateTckn("1000000014").reason).toBe("length");
    expect(validateTckn("01234567890").reason).toBe("pattern");
    expect(validateTckn("11111111111").reason).toBe("pattern");
    expect(validateTckn("10000000147").reason).toBe("checksum");
  });

  it("computed check digits always validate; any single-digit change fails (property)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 9 }), digits(8), fc.integer({ min: 0, max: 10 }), fc.integer({ min: 1, max: 9 }), (d1, rest, pos, delta) => {
        const first9 = String(d1) + rest;
        const id = first9 + tcknCheckDigits(first9);
        if (/^(\d)\1{10}$/.test(id)) return;
        expect(validateTckn(id).valid).toBe(true);
        const ch = Number(id[pos]);
        const broken = id.slice(0, pos) + String((ch + delta) % 10) + id.slice(pos + 1);
        if (broken[0] === "0") return;
        expect(validateTckn(broken).valid).toBe(false);
      }),
    );
  });

  it("masks for read-only views", () => {
    expect(maskTrId("12345678901")).toBe("123******01");
    expect(maskTrId("1234")).toBe("1234");
  });
});

describe("VKN and tax id", () => {
  it("validates per the GİB algorithm", () => {
    const vkn = "123456789" + vknCheckDigit("123456789");
    expect(vkn).toBe("1234567890");
    expect(validateVkn(vkn)).toEqual({ valid: true, value: vkn, kind: "tr-vkn" });
    expect(validateVkn("1234567891").reason).toBe("checksum");
    expect(validateVkn("12345").reason).toBe("length");
  });

  it("computed check digits validate; changing the check digit fails (property)", () => {
    fc.assert(
      fc.property(digits(9), fc.integer({ min: 1, max: 9 }), (first9, delta) => {
        const c = vknCheckDigit(first9);
        expect(validateVkn(first9 + c).valid).toBe(true);
        expect(validateVkn(first9 + String((Number(c) + delta) % 10)).valid).toBe(false);
      }),
    );
  });

  it("accepts VKN or TCKN for invoices", () => {
    expect(trTaxSchemeId(validateTrTaxId("1234567890"))).toBe("VKN");
    expect(trTaxSchemeId(validateTrTaxId("10000000146"))).toBe("TCKN");
    expect(validateTrTaxId("123").reason).toBe("length");
    expect(trTaxSchemeId(validateTrTaxId("1234567891"))).toBeUndefined();
  });
});

describe("TR IBAN", () => {
  it("validates and resolves the bank", () => {
    const r = validateTrIban("TR33 0006 1005 1978 6457 8413 26");
    expect(r).toMatchObject({ valid: true, bankCode: "00061" });
    const ziraat = validateTrIban("TR" + "00" + "000100" + "0000000012345678");
    expect(ziraat.valid).toBe(false);
  });

  it("rejects other countries and the reserved digit", () => {
    expect(validateTrIban("DE89370400440532013000").reason).toBe("country");
    expect(validateTrIban("TR330006115197864578413260").reason).toBe("pattern");
    expect(validateTrIban("TR33000610051978645784132").reason).toBe("length");
  });
});

describe("KDV", () => {
  it("has the 2023 rates", () => {
    expect(activeTaxRates(trKdv, "2026-11-10").map((r) => r.value)).toEqual([0, 1, 10, 20]);
    expect(activeTaxRates(trKdv, "2023-07-09").map((r) => r.value)).toEqual([0, 1, 8, 18]);
    expect(needsExemptionCode(trKdv, 0)).toBe(true);
    expect(needsExemptionCode(trKdv, 0, "301")).toBe(false);
    expect(needsExemptionCode(trKdv, 20)).toBe(false);
  });

  it("computes net, gross, VAT and withholding", () => {
    expect(vatFromNet("100.00", 20)).toBe("20.00");
    expect(vatFromNet("0.03", 20)).toBe("0.01");
    expect(netFromGross("120.00", 20)).toBe("100.00");
    expect(netFromGross("99.99", 10)).toBe("90.90");
    expect(grossFromNet("90.90", 10)).toBe("99.99");
    expect(withheldVat("18.00", [9, 10])).toBe("16.20");
  });

  it("builds an invoice breakdown with withholding", () => {
    const r = computeKdv([
      { amount: "1000.00", rate: 20, withholding: "602" },
      { amount: "250.00", rate: 10 },
    ]);
    expect(r.byRate).toEqual([
      { rate: 20, base: "1000.00", vat: "200.00" },
      { rate: 10, base: "250.00", vat: "25.00" },
    ]);
    expect(r.withholding).toEqual([{ code: "602", ratio: [9, 10], vat: "200.00", withheld: "180.00" }]);
    expect(r).toMatchObject({ totalNet: "1250.00", totalVat: "225.00", grandTotal: "1475.00", totalWithheld: "180.00", payable: "1295.00" });
  });

  it("line and document rounding can differ by a kuruş", () => {
    const lines = [0, 1, 2].map(() => ({ amount: "0.03", rate: 20 }));
    expect(computeKdv(lines).totalVat).toBe("0.03");
    expect(computeKdv(lines, { rounding: "document" }).totalVat).toBe("0.02");
  });

  it("keeps gross-entered totals exact", () => {
    const r = computeKdv([{ amount: "99.99", rate: 10, entry: "gross" }]);
    expect(r.lines[0]).toEqual({ net: "90.90", vat: "9.09", gross: "99.99", withheld: "0.00" });
  });

  it("allocates a document discount pro-rata (property: parts sum exactly)", () => {
    expect(allocateProRata("10.00", ["100.00", "200.00", "700.00"])).toEqual(["1.00", "2.00", "7.00"]);
    expect(allocateProRata("0.10", ["1.00", "1.00", "1.00"])).toEqual(["0.04", "0.03", "0.03"]);
    const money = fc.integer({ min: 0, max: 10_000_000 }).map((c) => (c / 100).toFixed(2));
    fc.assert(
      fc.property(fc.array(money, { minLength: 1, maxLength: 12 }), fc.integer({ min: 0, max: 1_000_000 }), (weights, cents) => {
        const total = (cents / 100).toFixed(2);
        const parts = allocateProRata(total, weights);
        expect(parts.reduce((s, p) => s + toUnits(p, 2), 0n)).toBe(toUnits(total, 2));
      }),
    );
  });

  it("net ↔ gross round-trips within one kuruş and breakdown totals add up (property)", () => {
    const rate = fc.constantFrom(0, 1, 10, 20);
    const money = fc.integer({ min: 0, max: 100_000_000 }).map((c) => (c / 100).toFixed(2));
    fc.assert(
      fc.property(money, rate, (net, r) => {
        const back = netFromGross(grossFromNet(net, r), r);
        const diff = toUnits(back, 2) - toUnits(net, 2);
        expect(diff >= -1n && diff <= 1n).toBe(true);
      }),
    );
    fc.assert(
      fc.property(fc.array(fc.record({ amount: money, rate, withholding: fc.constantFrom(undefined, "601", "602", "604") }), { minLength: 1, maxLength: 10 }), fc.constantFrom("line" as const, "document" as const), (lines, rounding) => {
        const r = computeKdv(lines, { rounding });
        const sum = (xs: string[]) => xs.reduce((s, x) => s + toUnits(x, 2), 0n);
        expect(sum(r.byRate.map((b) => b.base))).toBe(toUnits(r.totalNet, 2));
        expect(toUnits(r.grandTotal, 2)).toBe(toUnits(r.totalNet, 2) + toUnits(r.totalVat, 2));
        expect(toUnits(r.payable, 2)).toBe(toUnits(r.grandTotal, 2) - toUnits(r.totalWithheld, 2));
        const lineVat = sum(r.lines.map((l) => l.vat));
        const d = lineVat - toUnits(r.totalVat, 2);
        expect(d >= -BigInt(lines.length) && d <= BigInt(lines.length)).toBe(true);
      }),
    );
  });

  it("writes amounts in Turkish words", () => {
    expect(trAmountInWords("1234.50")).toBe("Yalnız Bin İki Yüz Otuz Dört Türk Lirası Elli Kuruş");
    expect(trAmountInWords("100")).toBe("Yalnız Yüz Türk Lirası");
    expect(trAmountInWords("1001000.01")).toBe("Yalnız Bir Milyon Bin Türk Lirası Bir Kuruş");
    expect(trAmountInWords("250", "USD")).toBe("Yalnız İki Yüz Elli ABD Doları");
    expect(trAmountInWords("0.75")).toBe("Yalnız Sıfır Türk Lirası Yetmiş Beş Kuruş");
  });
});

describe("tr address data", () => {
  it("has 81 provinces and 973 districts with source stamp", async () => {
    const data = await loadTrAddressData();
    expect(data.provinces).toHaveLength(81);
    expect(data.provinces.reduce((s, p) => s + p[2].length, 0)).toBe(973);
    expect(data.source).toMatch(/NVİ/);
    expect(new Set(data.provinces.flatMap((p) => p[2].map((d) => d[0]))).size).toBe(973);
  });

  it("uses official spellings", async () => {
    const provinces = await trProvinces();
    expect(provinces[33]).toEqual({ code: 34, name: "İstanbul" });
    expect(provinces[45]!.name).toBe("Kahramanmaraş");
    const ist = await trDistricts(34);
    expect(ist).toHaveLength(39);
    expect(ist.map((d) => d.name)).toContain("Eyüpsultan");
    expect(ist.map((d) => d.name)).toContain("Üsküdar");
    expect(await trDistricts(99)).toEqual([]);
    expect(await findTrProvince("istanbul")).toEqual({ code: 34, name: "İstanbul" });
    expect(await findTrProvince("IZMIR")).toMatchObject({ code: 35 });
  });

  it("sanity-checks postal codes against the plate", () => {
    expect(checkTrPostalCode("34840", 34)).toBe("ok");
    expect(checkTrPostalCode("06100", 34)).toBe("province");
    expect(checkTrPostalCode("3484")).toBe("format");
    expect(checkTrPostalCode("99000")).toBe("format");
  });
});
