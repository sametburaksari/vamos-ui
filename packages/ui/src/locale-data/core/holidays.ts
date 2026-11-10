/** Holiday providers: build one from data, combine several, check coverage. React-free. */
import { compareIsoDate } from "./date";
import type { Holiday, HolidayProvider, HolidayRange, IsoDate } from "./types";

export interface CreateHolidayProviderOptions {
  id: string;
  /** A static list, or a function returning the holidays of one year. */
  holidays: Holiday[] | ((year: number) => Holiday[]);
  coverage?: { from: IsoDate; to: IsoDate };
}

const inRange = (d: IsoDate, r: HolidayRange) => d >= r.start && d <= r.end;
const regionMatch = (h: Holiday, region?: string) => !h.region || (region !== undefined && h.region === region);

/**
 * A `HolidayProvider` from plain data. Region-specific entries are returned only when the
 * caller asks for that region.
 *
 * ```ts
 * const company = createHolidayProvider({
 *   id: "acme",
 *   holidays: [{ date: "2026-12-24", name: "Company day off", kind: "bank" }],
 * });
 * ```
 */
export function createHolidayProvider(options: CreateHolidayProviderOptions): HolidayProvider {
  const { id, holidays, coverage } = options;
  const byYear = new Map<number, Holiday[]>();
  const yearOf = (year: number) => {
    let list = byYear.get(year);
    if (!list) {
      list = typeof holidays === "function" ? holidays(year) : holidays.filter((h) => h.date.startsWith(`${year}-`));
      list = [...list].sort((a, b) => compareIsoDate(a.date, b.date));
      byYear.set(year, list);
    }
    return list;
  };
  return {
    id,
    coverage,
    get(range, opts) {
      if (range.end < range.start) return [];
      const y0 = Number(range.start.slice(0, 4));
      const y1 = Number(range.end.slice(0, 4));
      const out: Holiday[] = [];
      for (let y = y0; y <= y1; y++) for (const h of yearOf(y)) if (inRange(h.date, range) && regionMatch(h, opts?.region)) out.push(h);
      return out;
    },
  };
}

/** Merges providers (e.g. national pack + company days off). Coverage is the intersection. */
export function combineHolidayProviders(...providers: HolidayProvider[]): HolidayProvider {
  const covs = providers.map((p) => p.coverage);
  const coverage = covs.every(Boolean)
    ? {
        from: covs.reduce((m, c) => (c!.from > m ? c!.from : m), covs[0]!.from),
        to: covs.reduce((m, c) => (c!.to < m ? c!.to : m), covs[0]!.to),
      }
    : undefined;
  return {
    id: providers.map((p) => p.id).join("+"),
    coverage,
    get(range, opts) {
      return providers.flatMap((p) => p.get(range, opts)).sort((a, b) => compareIsoDate(a.date, b.date));
    },
  };
}

/** True when `range` lies inside the provider's declared coverage (or none is declared). */
export function isRangeCovered(provider: HolidayProvider, range: HolidayRange): boolean {
  const c = provider.coverage;
  return !c || (range.start >= c.from && range.end <= c.to);
}

/** The holidays on one date. */
export function holidaysOn(provider: HolidayProvider | HolidayProvider[] | undefined, date: IsoDate, region?: string): Holiday[] {
  if (!provider) return [];
  const list = Array.isArray(provider) ? provider : [provider];
  return list.flatMap((p) => p.get({ start: date, end: date }, { region }));
}

/** The holiday's name for `locale`: `localName` when the locale's language matches the pack. */
export function holidayName(holiday: Holiday, locale: string, packLanguage?: string): string {
  if (holiday.localName && packLanguage && locale.toLowerCase().split(/[-_]/)[0] === packLanguage) return holiday.localName;
  return holiday.name;
}
