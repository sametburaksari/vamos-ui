// Localized<T>: one value, or one value per locale. Plain strings stay valid, so single-locale
// and hand-written sites never see locale maps. No React, no zod — safe anywhere.

/** BCP 47-ish locale key: `en`, `tr`, `en-GB`, `pt-BR`, `zh-Hant`. */
export type LocaleCode = string;

/** `"Book a table"` or `{ en: "Book a table", tr: "Masa ayırtın" }`. */
export type Localized<T> = T | Partial<Record<LocaleCode, T>>;

export const LOCALE_KEY_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

/** True when `value` is a locale map (`{ en: …, tr: … }`) rather than a value of T. */
export function isLocaleMap(value: unknown): value is Record<LocaleCode, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((k) => LOCALE_KEY_RE.test(k));
}

export interface PickLocaleOptions {
  /** Tried in order after `locale`. Default `["en"]`. */
  fallback?: readonly LocaleCode[];
}

const isEmpty = (v: unknown) => v === undefined || v === null || v === "";
const base = (l: string) => l.split("-")[0]!.toLowerCase();

/** The locale chain used by `pickLocale`: exact → base language → each fallback (exact → base). */
export function localeChain(locale: LocaleCode, fallback: readonly LocaleCode[] = ["en"]): LocaleCode[] {
  const out: string[] = [];
  for (const l of [locale, ...fallback]) for (const c of [l, base(l)]) if (!out.includes(c)) out.push(c);
  return out;
}

/**
 * Picks one locale from a `Localized<T>` value. Deterministic: exact locale → its base language →
 * each fallback → the first non-empty value in insertion order. Empty strings count as missing.
 *
 * ```ts
 * pickLocale({ en: "Book a table", tr: "Masa ayırtın" }, "tr-TR"); // "Masa ayırtın"
 * pickLocale("Book a table", "tr");                                // "Book a table"
 * ```
 */
export function pickLocale<T>(value: Localized<T> | undefined, locale: LocaleCode, opts: PickLocaleOptions = {}): T | undefined {
  if (!isLocaleMap(value)) return value as T | undefined;
  const map = value as Record<string, T | undefined>;
  const lower: Record<string, T | undefined> = {};
  for (const k in map) lower[k.toLowerCase()] = map[k];
  for (const l of localeChain(locale, opts.fallback ?? ["en"])) {
    const v = lower[l.toLowerCase()];
    if (!isEmpty(v)) return v;
  }
  for (const k in map) if (!isEmpty(map[k])) return map[k];
  return Object.values(map)[0];
}

/** Locales present (non-empty) in a localized value. A plain value counts as every locale. */
export function localesOf(value: unknown): LocaleCode[] | "all" {
  if (!isLocaleMap(value)) return "all";
  return Object.keys(value).filter((k) => !isEmpty((value as Record<string, unknown>)[k]));
}
