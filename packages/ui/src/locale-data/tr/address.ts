/**
 * Turkish provinces (81) and districts (973), loaded lazily with dynamic `import()` on first
 * use (~19 kB raw / ~8 kB gzip), never in the main bundle.
 *
 * Names match official spelling exactly ("Eyüpsultan", "Kahramanmaraş") because UBL-TR
 * `CityName` / `CitySubdivisionName` are text, not codes. Source and date are stamped in
 * `address-tr.json`. Postal codes are not bundled; use `checkTrPostalCode` for a sanity warning.
 */
import { compareText, foldText } from "../../lib/text";
import type { AddressDataSource, AddressDistrict, AddressProvince } from "../core/types";

/** Compact on-disk shape: `[plate, "Adana", [[districtCode, "Aladağ"], …]]`. */
export type TrAddressRow = [plate: number, name: string, districts: [code: number, name: string][]];

export interface TrAddressData {
  source: string;
  generated: string;
  provinces: TrAddressRow[];
}

const byName = compareText("tr");

let pending: Promise<TrAddressData> | undefined;

/** Loads the province / district dataset once (cached). */
export function loadTrAddressData(): Promise<TrAddressData> {
  pending ??= import("./address-tr.json").then((m) => ((m as { default?: unknown }).default ?? m) as TrAddressData);
  return pending;
}

/** Province list sorted by plate code. */
export async function trProvinces(): Promise<AddressProvince[]> {
  const data = await loadTrAddressData();
  return data.provinces.map(([code, name]) => ({ code, name }));
}

/** Districts of a province (by plate code), in Turkish alphabetical order. */
export async function trDistricts(plate: number): Promise<AddressDistrict[]> {
  const data = await loadTrAddressData();
  const row = data.provinces.find((p) => p[0] === plate);
  return row ? row[2].map(([code, name]) => ({ code, name })).sort((a, b) => byName(a.name, b.name)) : [];
}

/** Finds a province by name, case- and dotted-I-insensitive ("istanbul" → İstanbul). */
export async function findTrProvince(name: string): Promise<AddressProvince | undefined> {
  const list = await trProvinces();
  const key = foldText(name.trim(), "tr");
  return list.find((p) => foldText(p.name, "tr") === key);
}

/**
 * Sanity check for a 5-digit postal code: its first two digits are the plate code.
 * Returns `"ok"`, `"format"` (not 5 digits) or `"province"` (prefix does not match).
 */
export function checkTrPostalCode(code: string, plate?: number): "ok" | "format" | "province" {
  const v = code.trim();
  if (!/^\d{5}$/.test(v)) return "format";
  const prefix = Number(v.slice(0, 2));
  if (prefix < 1 || prefix > 81) return "format";
  return plate === undefined || prefix === plate ? "ok" : "province";
}

/** `AddressDataSource` for Address field. */
export const trAddress: AddressDataSource = {
  id: "tr",
  provinces: trProvinces,
  districts: trDistricts,
};
