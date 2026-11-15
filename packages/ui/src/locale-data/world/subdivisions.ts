/**
 * Subdivisions for every country: the regions an address names (US states, JP prefectures, IT
 * provinces, AE emirates), with ISO 3166-2 codes and English and local-language names. One small
 * JSON file per country (202 countries, 0.1–9 kB raw), loaded the first time its country is
 * picked. This module holds the loader logic; pick where the files come from:
 *
 * - `bundledSubdivisions` (`@vamos-ui/react/locale-data/world-subdivisions`): the files shipped
 *   in the package, one lazy chunk per country. AddressField and RegionSelect use it by default.
 * - `subdivisionsFromUrl("/data/subdivisions/{cc}.json")`: the same files served by the app.
 * - `createSubdivisionLoader(load)`: anything else.
 *
 * Sources: Google's Address Data Service where it lists the regions addresses use (CC BY 4.0),
 * Unicode CLDR level-1 subdivisions elsewhere (Unicode License v3); stamped in every file.
 */
import { compareText } from "../../lib/text";
import { countryVars, createCachedLoader, fetchJsonLoader, type FetchJsonOptions } from "../core/loader";

/** `[iso, value, name, local]`: name / local are `""` when they equal the value. */
export type SubdivisionRow = [iso: string, value: string, name: string, local: string];

export interface SubdivisionFile {
  source: string;
  license: string;
  generated: string;
  /** ISO 3166-1 alpha-2. */
  country: string;
  /** Language of `local` names ("ja"). */
  lang: string;
  /** `"google"` (the regions the post expects), `"cldr"` (level-1 subdivisions) or `"tr"`. */
  from: string;
  rows: SubdivisionRow[];
}

export interface Subdivision {
  /** ISO 3166-2 ("US-CA", "JP-13"); `""` for the few regions without one (US armed forces). */
  code: string;
  /** What an address stores and prints: "CA", "東京都" (or "Tokyo" for a Latin-script address), "Bayern". */
  value: string;
  /** What a picker shows in the current language: "California", "Tokyo" / "東京都", "Bavaria" / "Bayern". */
  label: string;
  /** English / Latin-script name ("Tokyo"). */
  name: string;
  /** Name in the country's language ("東京都"). */
  localName: string;
  /** The value as the country writes it in its own script ("東京都", "CA"). */
  key: string;
}

/** `(country) => file`, `null` for a country without subdivisions. */
export type SubdivisionLoader = (country: string) => Promise<SubdivisionFile | null>;

const isLatin = (s: string) => /\p{L}/u.test(s) && !/[^\p{Script=Latin}\P{L}]/u.test(s);
const langOf = (locale: string) => locale.toLowerCase().split(/[-_]/)[0]!;

/**
 * A country's rows as entries for `locale`. In the country's own language you get local names
 * and values ("東京都"); in any other language English / Latin names, and Latin values where the
 * country's own are in another script ("Tokyo"), so the address stays in one script. Values the
 * post expects as codes stay codes ("CA", "SP", "AG").
 */
export function parseSubdivisions(file: SubdivisionFile, locale = "en"): Subdivision[] {
  const local = langOf(locale) === langOf(file.lang);
  const cc = file.country.toUpperCase();
  const list = file.rows.map(([iso, key, n, l]) => {
    const name = n || key;
    const localName = l || key;
    return {
      code: iso ? `${cc}-${iso}` : "",
      value: local || isLatin(key) || !isLatin(name) ? key : name,
      label: local ? localName : name,
      name,
      localName,
      key,
    };
  });
  // Keep the source order in the country's own script (JP prefectures run north to south);
  // sort Latin labels alphabetically.
  if (!local || isLatin(list[0]?.label ?? "")) {
    const cmp = compareText(locale);
    list.sort((a, b) => cmp(a.label, b.label));
  }
  return list;
}

/** A loader over country files from anywhere, cached per country; failures are retried on the next call. */
export function createSubdivisionLoader(load: (country: string) => Promise<SubdivisionFile | null>): SubdivisionLoader {
  const cached = createCachedLoader(load);
  return (country) => cached(country.toUpperCase());
}

/**
 * Fetches country files the app serves: a template with `{cc}` ("US") / `{cc_lower}` ("us"), or a
 * function. A 404 means "no subdivisions" (`null`); other errors reject.
 *
 * ```ts
 * // copy node_modules/@vamos-ui/react/…/locale-data/world/subdivisions/*.json to public/data/subdivisions/
 * <AddressField subdivisions={subdivisionsFromUrl("/data/subdivisions/{cc}.json")} />
 * ```
 */
export function subdivisionsFromUrl(url: string | ((country: string) => string), opts: FetchJsonOptions = {}): SubdivisionLoader {
  return createSubdivisionLoader(fetchJsonLoader<string, SubdivisionFile | null>(url, countryVars, { ...opts, name: "subdivisionsFromUrl", notFoundAsNull: true }));
}

/** Entries of one country for `locale` (`[]` when it has none). */
export async function loadSubdivisions(loader: SubdivisionLoader, country: string, locale = "en"): Promise<Subdivision[]> {
  const file = await loader(country);
  return file ? parseSubdivisions(file, locale) : [];
}

/**
 * Finds a stored value among the entries: by value, key, English or local name, or ISO code
 * (case-insensitive), so "California", "CA" and "US-CA" all find California.
 */
export function findSubdivision(list: readonly Subdivision[], text: string): Subdivision | undefined {
  const t = text.trim().toLowerCase();
  if (!t) return undefined;
  return list.find((s) => s.value.toLowerCase() === t) ?? list.find((s) => [s.key, s.name, s.localName, s.code].some((x) => x.toLowerCase() === t));
}
