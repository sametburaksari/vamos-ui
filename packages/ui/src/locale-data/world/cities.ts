/**
 * City suggestions for every country, from GeoNames (CC BY 4.0, attribution required: "City data
 * © GeoNames, https://www.geonames.org"). About 66 000 places with 5 000+ inhabitants or an
 * administrative seat, one JSON file per country (1.5 MB raw / ~550 kB gzip in all; the US, the
 * largest, 143 kB). Too large for the package, so the files are not in it: an app loads them over
 * HTTP, one country at a time, the first time the city field is focused.
 *
 * - `citiesFromUrl()`: from https://ui.vamos.ist/data/cities/{cc}.json (the docs site publishes
 *   them, CORS open).
 * - `citiesFromUrl("/data/cities/{cc}.json")`: the same files served by the app (copy them from
 *   the site or regenerate them with `packages/ui/scripts/world-address.mjs`).
 * - `createCityLoader(load)`: anything else.
 *
 * Opt-in by design: AddressField makes no network request unless it is given a `cities` loader.
 */
import { compareText } from "../../lib/text";
import { countryVars, createCachedLoader, fetchJsonLoader, type FetchJsonOptions } from "../core/loader";

/** `[name, local, subdivision]`: GeoNames name, local-language name (`""` when the same), index into `subdivisions` (-1 = unknown). */
export type CityRow = [name: string, local: string, subdivision: number];

export interface CityFile {
  source: string;
  license: string;
  /** Show it wherever the data is used: "City data © GeoNames (https://www.geonames.org), CC BY 4.0". */
  attribution: string;
  generated: string;
  country: string;
  /** Language of `local` names. */
  lang: string;
  /** ISO 3166-2 suffixes the rows point at (the same codes as the subdivision files). */
  subdivisions: string[];
  /** Most populous first. */
  rows: CityRow[];
}

export interface City {
  /** What an address stores: the local name in Latin-script countries ("München"), the Latin one elsewhere outside the country's language ("Tokyo"). */
  value: string;
  /** GeoNames name ("Munich", "Tokyo"). */
  name: string;
  /** Local-language name ("München", "東京都"). */
  localName: string;
  /** ISO 3166-2 of the subdivision ("DE-BY"), `""` when unknown. */
  subdivision: string;
}

/** `(country) => file`, `null` for a country without a file. */
export type CityLoader = (country: string) => Promise<CityFile | null>;

/** Where `citiesFromUrl()` looks by default. */
export const DEFAULT_CITIES_URL = "https://ui.vamos.ist/data/cities/{cc}.json";

const isLatin = (s: string) => /\p{L}/u.test(s) && !/[^\p{Script=Latin}\P{L}]/u.test(s);
const langOf = (locale: string) => locale.toLowerCase().split(/[-_]/)[0]!;

export interface ParseCitiesOptions {
  /** Only places in this subdivision ("US-CA" or "CA"). Unknown codes keep the whole list. */
  subdivision?: string;
  /** At most this many, most populous first. */
  limit?: number;
}

/** A country's places for `locale`, most populous first, unique values. */
export function parseCities(file: CityFile, locale = "en", opts: ParseCitiesOptions = {}): City[] {
  const local = langOf(locale) === langOf(file.lang);
  const cc = file.country.toUpperCase();
  let want = -1;
  if (opts.subdivision) {
    const code = opts.subdivision.toUpperCase().replace(`${cc}-`, "");
    want = file.subdivisions.indexOf(code);
  }
  const out: City[] = [];
  const seen = new Set<string>();
  for (const [name, l, s] of file.rows) {
    if (want >= 0 && s !== want) continue;
    const localName = l || name;
    const value = local || isLatin(localName) ? localName : name;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push({ value, name, localName, subdivision: s >= 0 && file.subdivisions[s] ? `${cc}-${file.subdivisions[s]}` : "" });
    if (opts.limit && out.length >= opts.limit) break;
  }
  return out;
}

/** The same list sorted alphabetically for `locale` (for pickers rather than suggestions). */
export function sortCities(list: readonly City[], locale = "en"): City[] {
  const cmp = compareText(locale);
  return [...list].sort((a, b) => cmp(a.value, b.value));
}

/** A loader over country files from anywhere, cached per country; failures are retried on the next call. */
export function createCityLoader(load: (country: string) => Promise<CityFile | null>): CityLoader {
  const cached = createCachedLoader(load);
  return (country) => cached(country.toUpperCase());
}

/**
 * Fetches country files over HTTP: a template with `{cc}` ("US") / `{cc_lower}` ("us"), or a
 * function. Default: the files the Vamos UI docs site publishes. A 404 means "no cities" (`null`).
 *
 * ```tsx
 * const cities = citiesFromUrl(); // or citiesFromUrl("/data/cities/{cc}.json")
 * <AddressField cities={cities} />
 * ```
 */
export function citiesFromUrl(url: string | ((country: string) => string) = DEFAULT_CITIES_URL, opts: FetchJsonOptions = {}): CityLoader {
  return createCityLoader(fetchJsonLoader<string, CityFile | null>(url, countryVars, { ...opts, name: "citiesFromUrl", notFoundAsNull: true }));
}
