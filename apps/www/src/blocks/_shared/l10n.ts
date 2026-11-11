// Copy helpers. Every human-readable fixture field is `L` ({ en, tr }); resolve it with `tx`.

export type Lang = "en" | "tr";
/** A string in both block languages. */
export type L = { en: string; tr: string };

/** "tr-TR" → "tr", anything else → "en". Pair with `useLocale().locale`. */
export function langOf(locale: string | undefined): Lang {
  return locale?.toLowerCase().startsWith("tr") ? "tr" : "en";
}

/** Pick the string for a language (falls back to English). */
export function tx(value: L, lang: Lang | string): string {
  const l = lang.length > 2 ? langOf(lang) : (lang as Lang);
  return value[l] || value.en;
}

/** Label map for an enum: `{ open: { en: "Open", tr: "Açık" }, … }`. */
export type LabelMap<K extends string> = Record<K, L>;
