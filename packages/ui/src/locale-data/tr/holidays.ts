/**
 * Turkish public holidays (Law 2429 on national holidays and general holidays).
 *
 * Fixed-date holidays are generated for any year. Religious holidays follow the lunar calendar
 * and are NOT computed: published dates can differ from computed Umm al-Qura dates. They ship
 * as a static table from the Diyanet İşleri Başkanlığı "Dini Günler" calendar.
 *
 * Source: Diyanet İşleri Başkanlığı, Dini Günler takvimi 2025, 2026, 2027 (the 2027 table was
 *         announced on 2026-08-24), cross-checked against national press listings of the
 *         official holiday calendar.
 * Verified: 2026-11-10. Review every year in January and extend `RELIGIOUS` (target 2035).
 *
 * Government "bridge" days (idari izin) bind only the public sector and are not included;
 * add them as a custom provider (`createHolidayProvider`).
 */
import { addDays } from "../core/date";
import { createHolidayProvider } from "../core/holidays";
import type { Holiday, HolidayProvider } from "../core/types";

export const TR_HOLIDAYS_SOURCE = {
  source: "Diyanet İşleri Başkanlığı — Dini Günler takvimi (2025–2027); Law 2429",
  verifiedOn: "2026-11-10",
  coverage: { from: "2025-01-01", to: "2027-12-31" },
} as const;

interface ReligiousRow {
  year: number;
  /** First day of Ramazan Bayramı (3 days; eve = previous day, half day). */
  ramazan: string;
  /** First day of Kurban Bayramı (4 days; eve = previous day, half day). */
  kurban: string;
  verified: boolean;
}

/** First days of the religious holidays, as published by Diyanet. */
export const TR_RELIGIOUS_HOLIDAYS: readonly ReligiousRow[] = [
  { year: 2025, ramazan: "2025-03-30", kurban: "2025-06-06", verified: true },
  { year: 2026, ramazan: "2026-03-20", kurban: "2026-05-27", verified: true },
  { year: 2027, ramazan: "2027-03-09", kurban: "2027-05-16", verified: true },
];

const FIXED: { md: string; id: string; name: string; localName: string; partial?: boolean }[] = [
  { md: "01-01", id: "tr-new-year", name: "New Year's Day", localName: "Yılbaşı" },
  { md: "04-23", id: "tr-sovereignty-children", name: "National Sovereignty and Children's Day", localName: "Ulusal Egemenlik ve Çocuk Bayramı" },
  { md: "05-01", id: "tr-labour", name: "Labour and Solidarity Day", localName: "Emek ve Dayanışma Günü" },
  { md: "05-19", id: "tr-ataturk-youth-sports", name: "Commemoration of Atatürk, Youth and Sports Day", localName: "Atatürk'ü Anma, Gençlik ve Spor Bayramı" },
  { md: "07-15", id: "tr-democracy", name: "Democracy and National Unity Day", localName: "Demokrasi ve Millî Birlik Günü" },
  { md: "08-30", id: "tr-victory", name: "Victory Day", localName: "Zafer Bayramı" },
  { md: "10-28", id: "tr-republic-eve", name: "Republic Day Eve", localName: "Cumhuriyet Bayramı Arifesi", partial: true },
  { md: "10-29", id: "tr-republic", name: "Republic Day", localName: "Cumhuriyet Bayramı" },
];

const ORDINAL_EN = ["day 1", "day 2", "day 3", "day 4"];

function religious(row: ReligiousRow): Holiday[] {
  const out: Holiday[] = [];
  const feast = (first: string, days: number, key: "ramadan" | "sacrifice") => {
    const en = key === "ramadan" ? "Ramadan Feast" : "Sacrifice Feast";
    const tr = key === "ramadan" ? "Ramazan Bayramı" : "Kurban Bayramı";
    out.push({ date: addDays(first, -1), id: `tr-${key}-eve`, name: `${en} Eve`, localName: `${tr} Arifesi`, kind: "public", partial: { from: "13:00" }, verified: row.verified });
    for (let i = 0; i < days; i++) {
      out.push({ date: addDays(first, i), id: `tr-${key}-${i + 1}`, name: `${en} (${ORDINAL_EN[i]})`, localName: `${tr} (${i + 1}. gün)`, kind: "public", verified: row.verified });
    }
  };
  feast(row.ramazan, 3, "ramadan");
  feast(row.kurban, 4, "sacrifice");
  return out;
}

/** All Turkish public holidays of one year (religious ones only inside the table's coverage). */
export function trHolidaysForYear(year: number): Holiday[] {
  const y = String(year).padStart(4, "0");
  const fixed: Holiday[] = FIXED.map((f) => ({
    date: `${y}-${f.md}`,
    id: f.id,
    name: f.name,
    localName: f.localName,
    kind: "public",
    ...(f.partial ? { partial: { from: "13:00" } } : {}),
    verified: true,
  }));
  const row = TR_RELIGIOUS_HOLIDAYS.find((r) => r.year === year);
  return [...fixed, ...(row ? religious(row) : [])];
}

/**
 * The `tr` holiday provider. Names are English in `name` and official Turkish in `localName`.
 *
 * ```ts
 * trHolidays.get({ start: "2026-10-01", end: "2026-10-31" });
 * // [{ date: "2026-10-28", name: "Republic Day Eve", partial: { from: "13:00" }, … }, { date: "2026-10-29", … }]
 * ```
 */
export const trHolidays: HolidayProvider = createHolidayProvider({
  id: "tr",
  holidays: trHolidaysForYear,
  coverage: { ...TR_HOLIDAYS_SOURCE.coverage },
});
