/**
 * Locale-aware text helpers — the single source for search, typeahead, sorting, initials and
 * slugs in the kit. React-free (works in server components).
 *
 * Why: `"İ".toLowerCase()` is `"i̇"` (two code units), `"ı".toUpperCase()` is `"I"`, and people
 * type "cagri" when they mean "Çağrı". Every function takes a BCP 47 `locale` (default `"en"`);
 * pass `useLocale().locale` from components, or use the bound `useText()` hook.
 */

export interface TextRules {
  /** Extra per-character folds applied after locale lowercasing (must map 1 char → 1 char). */
  fold?: Record<string, string>;
  /** Per-character slug transliteration applied before the generic one (may expand: "ä" → "ae"). */
  slug?: Record<string, string>;
  /** Word used for "&" in slugs ("and", "ve", "und"). */
  and?: string;
}

/** Folds that apply in every locale (characters without a Unicode decomposition). */
const GENERIC_FOLD: Record<string, string> = { ı: "i", ø: "o", ł: "l", đ: "d", ħ: "h", ŧ: "t", ŀ: "l" };
const GENERIC_SLUG: Record<string, string> = { ß: "ss", æ: "ae", œ: "oe", ø: "o", ł: "l", đ: "d", ð: "d", þ: "th", ı: "i", ħ: "h" };

const rules = new Map<string, TextRules>([
  ["en", { and: "and" }],
  // Turkish: dotted/dotless i are handled by toLocaleLowerCase("tr"); the rest decompose (ç ğ ş ö ü).
  ["tr", { and: "ve" }],
  ["de", { and: "und", slug: { ä: "ae", ö: "oe", ü: "ue", ß: "ss" } }],
  ["az", { and: "və", slug: { ə: "e" }, fold: { ə: "e" } }],
]);

const foldCache = new Map<string, Map<string, string>>();

/** Register (or extend) the rules for a language, e.g. `registerTextRules("fr", { and: "et" })`. */
export function registerTextRules(lang: string, r: TextRules): void {
  const key = lang.toLowerCase();
  const prev = rules.get(key) ?? {};
  rules.set(key, { ...prev, ...r, fold: { ...prev.fold, ...r.fold }, slug: { ...prev.slug, ...r.slug } });
  foldCache.delete(key);
}

/** Base language of a BCP 47 tag: `"tr-TR"` → `"tr"`. */
export function baseLanguage(locale?: string): string {
  return (locale || "en").split(/[-_]/)[0]!.toLowerCase();
}

const MARKS = /[\u0300-\u036f]/g;

function foldChar(c: string, lang: string, r: TextRules | undefined): string {
  let lower = c.toLocaleLowerCase(lang);
  if (lower.length !== 1) {
    // e.g. "İ" → "i̇" outside Turkish: drop the combining mark, keep 1:1 length.
    const stripped = lower.normalize("NFD").replace(MARKS, "");
    lower = stripped.length === 1 ? stripped : c;
  }
  const custom = r?.fold?.[lower] ?? GENERIC_FOLD[lower];
  if (custom) return custom;
  const base = lower.normalize("NFD").replace(MARKS, "");
  return base.length === 1 ? base : lower;
}

/**
 * Folds text for search: locale lowercase + diacritic stripping + locale rules.
 * The result has **exactly the same length** as the input (1:1 per UTF-16 unit), so indexes
 * found in the folded string are valid on the original (see `highlightText`).
 *
 * ```ts
 * foldText("İSTANBUL", "tr"); // "istanbul"
 * foldText("Çağrı Işık", "tr"); // "cagri isik"
 * ```
 */
export function foldText(s: string, locale?: string): string {
  const lang = baseLanguage(locale);
  const r = rules.get(lang);
  let cache = foldCache.get(lang);
  if (!cache) foldCache.set(lang, (cache = new Map()));
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    const code = c.charCodeAt(0);
    // Surrogate halves (emoji etc.) and plain ASCII lowercase/digits pass through.
    if ((code >= 0xd800 && code <= 0xdfff) || (code >= 0x61 && code <= 0x7a) || (code >= 0x30 && code <= 0x39) || code === 0x20) {
      out += c;
      continue;
    }
    let f = cache.get(c);
    if (f === undefined) cache.set(c, (f = foldChar(c, lang, r)));
    out += f;
  }
  return out;
}

const words = (q: string) => q.split(/\s+/).filter(Boolean);

/**
 * `true` when every word of `query` occurs in `text` (order-independent, folded).
 * An empty query matches everything.
 *
 * ```ts
 * matchText("Çağrı Yılmaz", "yilmaz cag", "tr"); // true
 * ```
 */
export function matchText(text: string, query: string, locale?: string): boolean {
  const t = foldText(text, locale);
  return words(foldText(query, locale)).every((w) => t.includes(w));
}

/**
 * Match ranges `[start, end)` of every query word in `text`, sorted and merged. Indexes are
 * valid on the original string because folding preserves length.
 */
export function highlightText(text: string, query: string, locale?: string): Array<[start: number, end: number]> {
  const t = foldText(text, locale);
  const ranges: Array<[number, number]> = [];
  for (const w of words(foldText(query, locale))) {
    let from = 0;
    for (let i = t.indexOf(w, from); i !== -1; i = t.indexOf(w, from)) {
      ranges.push([i, i + w.length]);
      from = i + w.length;
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: Array<[number, number]> = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

/**
 * `text` split into matched / unmatched parts, ready to render:
 *
 * ```tsx
 * {highlightParts(label, query, locale).map((p, i) => (p.match ? <mark key={i}>{p.text}</mark> : p.text))}
 * ```
 */
export function highlightParts(text: string, query: string, locale?: string): Array<{ text: string; match: boolean }> {
  const out: Array<{ text: string; match: boolean }> = [];
  let pos = 0;
  for (const [s, e] of highlightText(text, query, locale)) {
    if (s > pos) out.push({ text: text.slice(pos, s), match: false });
    out.push({ text: text.slice(s, e), match: true });
    pos = e;
  }
  if (pos < text.length || out.length === 0) out.push({ text: text.slice(pos), match: false });
  return out;
}

/**
 * A score function for cmdk's `filter` prop (0 = hidden, 1 = best):
 * exact > prefix > word start > contains > keyword match. Every query word must match.
 *
 * ```tsx
 * <Command filter={cmdkFilter(locale)}>
 * ```
 */
export function cmdkFilter(locale?: string): (value: string, search: string, keywords?: string[]) => number {
  return (value, search, keywords) => {
    const q = foldText(search.trim(), locale);
    if (!q) return 1;
    const v = foldText(value, locale);
    if (v === q) return 1;
    if (v.startsWith(q)) return 0.9;
    const qs = words(q);
    const vWords = words(v.replace(/[^\p{L}\p{N}\s]+/gu, " "));
    if (qs.every((w) => vWords.some((vw) => vw.startsWith(w)))) return 0.75;
    if (qs.every((w) => v.includes(w))) return 0.5;
    const k = foldText((keywords ?? []).join(" "), locale);
    if (k && qs.every((w) => v.includes(w) || k.includes(w))) return 0.3;
    return 0;
  };
}

const collators = new Map<string, Intl.Collator>();

/** Cached `Intl.Collator(locale, { sensitivity: "base", numeric: true })`. */
export function getCollator(locale = "en", options?: Intl.CollatorOptions): Intl.Collator {
  const key = locale + (options ? JSON.stringify(options) : "");
  let c = collators.get(key);
  if (!c) collators.set(key, (c = new Intl.Collator(locale, { sensitivity: "base", numeric: true, ...options })));
  return c;
}

/**
 * A locale-aware comparator for `Array.prototype.sort`: "Çiçek" sorts after "Cem" in Turkish,
 * "item 10" after "item 9".
 */
export function compareText(locale?: string, options?: Intl.CollatorOptions): (a: string, b: string) => number {
  return getCollator(locale, options).compare;
}

/** `toLocaleUpperCase` with the right language (tr: "i" → "İ"). Use instead of CSS `text-transform`. */
export const upperText = (s: string, locale?: string): string => s.toLocaleUpperCase(baseLanguage(locale));
/** `toLocaleLowerCase` with the right language (tr: "I" → "ı"). */
export const lowerText = (s: string, locale?: string): string => s.toLocaleLowerCase(baseLanguage(locale));

/**
 * Initials for avatars: first letter of the first and last word, uppercased with the locale.
 *
 * ```ts
 * initials("ilker şahin", "tr"); // "İŞ"
 * initials("Ada Lovelace"); // "AL"
 * ```
 */
export function initials(name: string, locale?: string, max: 1 | 2 = 2): string {
  const parts = name
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .map((w) => Array.from(w).find((ch) => /\p{L}|\p{N}/u.test(ch)))
    .filter((ch): ch is string => Boolean(ch));
  if (parts.length === 0) return "";
  const picked = max === 1 || parts.length === 1 ? [parts[0]!] : [parts[0]!, parts[parts.length - 1]!];
  return upperText(picked.join(""), locale);
}

export interface SlugifyOptions {
  locale?: string;
  /** Default 80. Cut at a separator when possible. */
  maxLength?: number;
  separator?: "-" | "_";
}

/**
 * URL slug with locale transliteration.
 *
 * ```ts
 * slugify("Çağrı Merkezi & Destek", { locale: "tr" }); // "cagri-merkezi-ve-destek"
 * slugify("Größe über alles", { locale: "de" }); // "groesse-ueber-alles"
 * ```
 */
export function slugify(s: string, opts: SlugifyOptions = {}): string {
  const { locale, maxLength = 80, separator = "-" } = opts;
  const lang = baseLanguage(locale);
  const r = rules.get(lang);
  const lower = s.toLocaleLowerCase(lang);
  let out = "";
  for (const ch of lower) out += r?.slug?.[ch] ?? GENERIC_SLUG[ch] ?? ch;
  out = out
    .normalize("NFD")
    .replace(MARKS, "")
    .replace(/&/g, ` ${r?.and ?? "and"} `)
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, "g"), "");
  if (out.length > maxLength) {
    const cut = out.slice(0, maxLength);
    const at = cut.lastIndexOf(separator);
    out = (at > maxLength * 0.5 ? cut.slice(0, at) : cut).replace(new RegExp(`\\${separator}+$`), "");
  }
  return out;
}
