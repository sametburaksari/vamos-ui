/**
 * Week start, weekend and first-week rule of a locale: `Intl.Locale#getWeekInfo()` where the
 * runtime has it, otherwise a CLDR `weekData` fallback table (CLDR 46, territory level).
 */
import type { WeekInfo } from "./types";

type Day = WeekInfo["firstDay"];

// CLDR supplemental weekData — firstDay by territory (default Monday).
const FIRST_DAY_SUN = "AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW";
const FIRST_DAY_SAT = "AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY";
const FIRST_DAY_FRI = "MV";
// weekendStart / weekendEnd (default Saturday–Sunday).
const WEEKEND_FRI_SAT = "AE BH DZ EG IL IQ JO KW LY OM QA SA SD SY YE";
const WEEKEND_THU_FRI = "AF";
const WEEKEND_FRI = "IR";
const WEEKEND_SUN = "IN UG";
// minDays = 4 (ISO 8601 weeks); default 1.
const MIN_DAYS_4 = "AD AN AT AX BE BG CH CZ DE DK EE ES FI FJ FO FR GB GF GG GI GP GR HU IE IM IS IT JE LI LT LU MC MQ NL NO PL RE RU SE SJ SK SM VA";

const set = (s: string) => new Set(s.split(" "));
const SUN = set(FIRST_DAY_SUN);
const SAT = set(FIRST_DAY_SAT);
const FRI = set(FIRST_DAY_FRI);
const W_FRI_SAT = set(WEEKEND_FRI_SAT);
const W_THU_FRI = set(WEEKEND_THU_FRI);
const W_FRI = set(WEEKEND_FRI);
const W_SUN = set(WEEKEND_SUN);
const MIN4 = set(MIN_DAYS_4);

/** CLDR fallback for a territory code ("TR", "US", "SA"). */
export function weekInfoForRegion(region: string | undefined): WeekInfo {
  const r = (region ?? "001").toUpperCase();
  const firstDay: Day = SUN.has(r) ? 7 : SAT.has(r) ? 6 : FRI.has(r) ? 5 : 1;
  const weekend = W_FRI_SAT.has(r) ? [5, 6] : W_THU_FRI.has(r) ? [4, 5] : W_FRI.has(r) ? [5] : W_SUN.has(r) ? [7] : [6, 7];
  return { firstDay, weekend, minimalDays: MIN4.has(r) ? 4 : 1 };
}

const DEFAULT_REGION: Record<string, string> = {
  en: "US", tr: "TR", de: "DE", fr: "FR", es: "ES", it: "IT", pt: "BR", nl: "NL", ar: "EG", he: "IL", fa: "IR",
  ja: "JP", zh: "CN", ko: "KR", ru: "RU", pl: "PL", sv: "SE", da: "DK", fi: "FI", nb: "NO", el: "GR", hi: "IN", az: "AZ",
};

/** The territory a locale resolves to ("tr" → "TR", "en" → "US", "ar-SA" → "SA"). */
export function regionOf(locale: string): string | undefined {
  try {
    const loc = new Intl.Locale(locale);
    if (loc.region) return loc.region;
    const max = typeof loc.maximize === "function" ? loc.maximize() : loc;
    return max.region ?? DEFAULT_REGION[loc.language];
  } catch {
    const m = /^[a-z]{2,3}(?:[-_][A-Za-z]{4})?[-_]([A-Za-z]{2}|\d{3})/.exec(locale);
    return m?.[1]?.toUpperCase() ?? DEFAULT_REGION[locale.slice(0, 2).toLowerCase()];
  }
}

const cache = new Map<string, WeekInfo>();

/**
 * Week conventions of `locale`. Day numbers: 1 = Monday … 7 = Sunday.
 *
 * ```ts
 * getWeekInfo("tr-TR"); // { firstDay: 1, weekend: [6, 7], minimalDays: 1 }
 * getWeekInfo("en-US"); // { firstDay: 7, weekend: [6, 7], minimalDays: 1 }
 * getWeekInfo("ar-SA"); // { firstDay: 7, weekend: [5, 6], minimalDays: 1 }
 * ```
 */
export function getWeekInfo(locale: string): WeekInfo {
  const hit = cache.get(locale);
  if (hit) return hit;
  let info: WeekInfo | undefined;
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number; weekend: number[]; minimalDays: number };
      weekInfo?: { firstDay: number; weekend: number[]; minimalDays: number };
    };
    // Only trust Intl when the locale names a region; otherwise engines differ on the default.
    const raw = loc.region ? (typeof loc.getWeekInfo === "function" ? loc.getWeekInfo() : loc.weekInfo) : undefined;
    if (raw && raw.firstDay >= 1 && raw.firstDay <= 7 && Array.isArray(raw.weekend)) {
      info = { firstDay: raw.firstDay as Day, weekend: [...raw.weekend], minimalDays: raw.minimalDays };
    }
  } catch {
    /* invalid tag: fall through */
  }
  info ??= weekInfoForRegion(regionOf(locale));
  cache.set(locale, info);
  return info;
}

/** Work days (1–7) implied by a locale's weekend. */
export function defaultWorkDays(locale: string): number[] {
  const weekend = getWeekInfo(locale).weekend;
  return [1, 2, 3, 4, 5, 6, 7].filter((d) => !weekend.includes(d));
}

/** Weekday order for headers, starting at the locale's first day: tr → [1..7], en-US → [7,1..6]. */
export function weekdayOrder(locale: string): number[] {
  const first = getWeekInfo(locale).firstDay;
  return Array.from({ length: 7 }, (_, i) => ((first - 1 + i) % 7) + 1);
}
