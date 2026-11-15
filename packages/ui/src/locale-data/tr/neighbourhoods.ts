/**
 * Turkish neighbourhoods (mahalle) and villages (köy): the third address level, ~50 000 entries.
 * Far too large for a bundle, so it is split into one JSON file per province (7–37 kB raw, 1–8 kB
 * gzip) and loaded per province on demand. This module holds only the loader logic; pick where the
 * files come from:
 *
 * - `@vamos-ui/react/locale-data/tr-neighbourhoods` — the files shipped in the package, one lazy
 *   chunk per province (`trAddressWithNeighbourhoods`).
 * - `trNeighbourhoodsFromUrl("/data/mahalle/{plate}.json")` — the same files served by the app
 *   (copy them from `@vamos-ui/react/locale-data/tr/neighbourhoods/*.json`), or any endpoint that
 *   answers in the same shape.
 * - `createTrNeighbourhoodLoader(load)` — anything else (a database, an internal API).
 *
 * Source and licence are stamped in every file (`source`, `license`).
 */
import { compareText } from "../../lib/text";
import { createCachedLoader, fetchJsonLoader, type FetchJsonOptions } from "../core/loader";
import type { AddressDataSource, AddressNeighbourhood } from "../core/types";

/**
 * One entry on disk: `[name, postalCode]` for a neighbourhood of the district centre,
 * `[name, postalCode, 1]` for a village, `[name, postalCode, 0, town]` for a neighbourhood of a
 * town (belde) municipality. `postalCode` is `""` when there is no official code.
 */
export type TrNeighbourhoodRow = [name: string, postalCode: string, village?: 0 | 1, town?: string];

/** One province file: district code (NVİ, as in `trDistricts`) → rows. */
export interface TrNeighbourhoodFile {
  source: string;
  license: string;
  generated: string;
  plate: number;
  districts: Record<string, TrNeighbourhoodRow[]>;
}

/** `(plate, districtCode) => neighbourhoods`, the shape `AddressDataSource.neighbourhoods` takes. */
export type NeighbourhoodLoader = (provinceCode: number, districtCode: number) => Promise<AddressNeighbourhood[]>;

const byName = compareText("tr");

/** The display / stored form: "Caferağa Mah.", "Akören Köyü", "Cami Mah. (Pınarbaşı)". */
export function trNeighbourhoodLabel(n: Pick<AddressNeighbourhood, "name" | "kind" | "town">): string {
  const base = n.kind === "village" ? `${n.name} Köyü` : `${n.name} Mah.`;
  return n.town ? `${base} (${n.town})` : base;
}

/** Rows of one district as sorted entries with unique labels. */
export function parseTrNeighbourhoods(rows: readonly TrNeighbourhoodRow[]): AddressNeighbourhood[] {
  const list = rows.map(([name, postalCode, village, town]) => {
    const n: AddressNeighbourhood = { name, label: "", kind: village === 1 ? "village" : "neighbourhood" };
    if (town) n.town = town;
    if (postalCode) n.postalCode = postalCode;
    n.label = trNeighbourhoodLabel(n);
    return n;
  });
  const seen = new Map<string, number>();
  for (const n of list) {
    const count = (seen.get(n.label) ?? 0) + 1;
    seen.set(n.label, count);
    if (count > 1) n.label = `${n.label} ${count}`;
  }
  return list.sort((a, b) => byName(a.label, b.label));
}

/**
 * A loader over province files from anywhere, cached per province (one request per province, even
 * for concurrent calls). A failed load is not cached, so the next call retries.
 */
export function createTrNeighbourhoodLoader(load: (plate: number) => Promise<TrNeighbourhoodFile>): NeighbourhoodLoader {
  const file = createCachedLoader(load);
  return async (plate, districtCode) => {
    const rows = (await file(plate)).districts[String(districtCode)];
    return rows ? parseTrNeighbourhoods(rows) : [];
  };
}

export type TrNeighbourhoodsFromUrlOptions = FetchJsonOptions;

/**
 * A loader that fetches province files from the app. `url` is a template (`{plate}` → `34`,
 * `{plate2}` → `01`) or a function of the plate code.
 *
 * ```ts
 * // copy node_modules/@vamos-ui/react/…/locale-data/tr/neighbourhoods/*.json to public/data/mahalle/
 * const source = withNeighbourhoods(trAddress, trNeighbourhoodsFromUrl("/data/mahalle/{plate2}.json"));
 * ```
 */
export function trNeighbourhoodsFromUrl(url: string | ((plate: number) => string), opts: TrNeighbourhoodsFromUrlOptions = {}): NeighbourhoodLoader {
  return createTrNeighbourhoodLoader(
    fetchJsonLoader<number, TrNeighbourhoodFile>(url, (plate) => ({ plate, plate2: String(plate).padStart(2, "0") }), { ...opts, name: "trNeighbourhoodsFromUrl" }),
  );
}

/** An address source with a neighbourhood level added (`trAddress` has none by default). */
export function withNeighbourhoods(source: AddressDataSource, neighbourhoods: NeighbourhoodLoader): AddressDataSource {
  return { ...source, id: source.id, neighbourhoods };
}
