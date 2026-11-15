/**
 * Postal address formats for every country: which parts an address has and in which order, which
 * are required, what each part is called ("state", "prefecture", "emirate"; "ZIP code", "PIN
 * code"), which parts are written in capitals, and the postal code pattern with examples.
 *
 * Data: Google's Address Data Service, the metadata behind libaddressinput and Chromium autofill
 * (CC BY 4.0), normalised by `scripts/world-address.mjs` into `address-formats.json` (~22 kB raw,
 * ~5.5 kB gzip). The file loads lazily with `import()` on first use and never reaches the main
 * bundle; until it has loaded, `addressFormatFallback` covers the common cases.
 */
import type { Address, AddressPart } from "../core/types";

/** One country record, Google's keys (absent keys inherit from the file's `default`). */
export interface AddressFormatRecord {
  fmt?: string;
  lfmt?: string;
  require?: string;
  upper?: string;
  zip?: string;
  zipex?: string;
  postprefix?: string;
  zip_name_type?: PostalCodeKind;
  state_name_type?: RegionKind;
  locality_name_type?: CityKind;
  sublocality_name_type?: SublocalityKind;
  lang?: string;
}

export interface AddressFormatsFile {
  source: string;
  license: string;
  generated: string;
  default: AddressFormatRecord;
  countries: Record<string, AddressFormatRecord>;
}

export type PostalCodeKind = "postal" | "zip" | "pin" | "eircode";
export type RegionKind = "area" | "county" | "department" | "district" | "do_si" | "emirate" | "island" | "oblast" | "parish" | "prefecture" | "province" | "state";
export type CityKind = "city" | "district" | "post_town" | "suburb";
export type SublocalityKind = "district" | "neighborhood" | "suburb" | "townland" | "village_township";

/** A piece of a format line: an address part (`street` = line1 + line2) or literal text ("〒", ", "). */
export type AddressFormatToken = { part: Exclude<AddressPart, "country" | "line1" | "line2"> | "street" } | { text: string };

export interface AddressFormat {
  /** ISO 3166-1 alpha-2, upper case. */
  country: string;
  /** The country's own format (local script), one entry per printed line. */
  lines: AddressFormatToken[][];
  /** The format for addresses written in Latin script, when it differs (JP, CN, KR, RU…). */
  latinLines?: AddressFormatToken[][];
  /** Parts the country's addresses use, in format order (`country` excluded). */
  fields: AddressPart[];
  /** `fields` in the Latin-script order, when it differs. */
  latinFields?: AddressPart[];
  /** Parts a deliverable address needs (`line1` stands for the street). */
  required: AddressPart[];
  /** Parts printed in capitals on an envelope (`formatAddress(…, { postal: true })`). */
  upper: AddressPart[];
  /** What the parts are called. */
  kinds: { region1: RegionKind; region2: CityKind; region3: SublocalityKind; postalCode: PostalCodeKind };
  /** Postal codes: anchored pattern (upper-case input), examples, printed prefix ("CH-"). Absent when the country has none. */
  postalCode?: { pattern: RegExp; examples: string[]; prefix?: string; numeric: boolean };
  /** Main language of the country's addresses ("ja"), when the data names one. */
  language?: string;
}

type TokenPart = Extract<AddressFormatToken, { part: unknown }>["part"];
const LETTERS: Record<string, TokenPart> = { A: "street", D: "region3", C: "region2", S: "region1", Z: "postalCode" };
const PART_OF: Record<string, AddressPart> = { A: "line1", D: "region3", C: "region2", S: "region1", Z: "postalCode" };

/**
 * Parses a Google format string ("%N%n%O%n%A%n%C, %S %Z") into lines of tokens. Parts the kit
 * does not collect (%N name, %O organisation, %X sorting code…) are dropped, and so are the lines
 * left without a part.
 */
export function parseAddressFormat(fmt: string): AddressFormatToken[][] {
  const lines: AddressFormatToken[][] = [];
  for (const line of fmt.split("%n")) {
    const out: AddressFormatToken[] = [];
    for (const m of line.matchAll(/%(.)|([^%]+)/g)) {
      if (m[2]) out.push({ text: m[2] });
      else if (LETTERS[m[1]!]) out.push({ part: LETTERS[m[1]!]! });
    }
    if (out.some((t) => "part" in t)) lines.push(out);
  }
  return lines;
}

function fieldsOf(fmt: string): AddressPart[] {
  const out: AddressPart[] = [];
  for (const m of fmt.matchAll(/%([ADCSZ])/g)) {
    const p = PART_OF[m[1]!]!;
    if (p === "line1") out.push("line1", "line2");
    else if (!out.includes(p)) out.push(p);
  }
  return out;
}

const lettersToParts = (s: string | undefined): AddressPart[] => [...new Set([...(s ?? "")].map((c) => PART_OF[c]).filter((p): p is AddressPart => !!p))];

/** Builds an `AddressFormat` from a record merged over the default record. */
export function createAddressFormat(country: string, record: AddressFormatRecord, base: AddressFormatRecord = {}): AddressFormat {
  const r = { ...base, ...record };
  const fmt = r.fmt ?? "%A%n%C";
  const f: AddressFormat = {
    country: country.toUpperCase(),
    lines: parseAddressFormat(fmt),
    fields: fieldsOf(fmt),
    required: lettersToParts(r.require),
    upper: lettersToParts(r.upper),
    kinds: {
      region1: r.state_name_type ?? "province",
      region2: r.locality_name_type ?? "city",
      region3: r.sublocality_name_type ?? "suburb",
      postalCode: r.zip_name_type ?? "postal",
    },
  };
  if (r.lfmt && r.lfmt !== fmt) {
    f.latinLines = parseAddressFormat(r.lfmt);
    f.latinFields = fieldsOf(r.lfmt);
  }
  if (r.zip) {
    const examples = (r.zipex ?? "").split(",").filter(Boolean);
    f.postalCode = { pattern: new RegExp(`^(?:${r.zip})$`), examples, numeric: examples.length > 0 && examples.every((e) => /^[\d -]+$/.test(e)) };
    if (r.postprefix) f.postalCode.prefix = r.postprefix;
  }
  if (r.lang) f.language = r.lang;
  return f;
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

let pending: Promise<AddressFormatsFile> | undefined;
let loaded: AddressFormatsFile | undefined;
const parsed = new Map<string, AddressFormat>();
const listeners = new Set<() => void>();

/** Loads `address-formats.json` once (cached). */
export function loadAddressFormats(): Promise<AddressFormatsFile> {
  pending ??= import("./address-formats.json").then(
    (m) => {
      loaded = ((m as { default?: unknown }).default ?? m) as AddressFormatsFile;
      for (const l of listeners) l();
      return loaded;
    },
    (e: unknown) => {
      pending = undefined;
      throw e;
    },
  );
  return pending;
}

function fromFile(file: AddressFormatsFile, cc: string): AddressFormat {
  const key = cc.toUpperCase();
  let f = parsed.get(key);
  if (!f) {
    f = createAddressFormat(key, file.countries[key] ?? {}, file.default);
    parsed.set(key, f);
  }
  return f;
}

/** The format of a country (unknown codes get the generic format). */
export async function loadAddressFormat(country: string): Promise<AddressFormat> {
  return fromFile(await loadAddressFormats(), country);
}

/** The format if the data has already loaded, else `undefined` (never triggers a load). */
export function peekAddressFormat(country: string): AddressFormat | undefined {
  return loaded ? fromFile(loaded, country) : undefined;
}

/** Called once when the format data finishes loading (for `useSyncExternalStore`). */
export function subscribeAddressFormats(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Every country code the format data knows. */
export async function addressFormatCountries(): Promise<string[]> {
  return Object.keys((await loadAddressFormats()).countries);
}

// The handful of formats available before (or without) the data file: the same rules the data
// has for these countries, so the first render and the loaded one agree.
const BUILTIN: Record<string, AddressFormatRecord> = {
  TR: { fmt: "%A%n%Z %C/%S", require: "ACZ", zip: "\\d{5}", zipex: "01960,06101", locality_name_type: "district" },
  US: { fmt: "%A%n%C, %S %Z", require: "ACSZ", upper: "CS", zip: "(\\d{5})(?:[ \\-](\\d{4}))?", zipex: "95014,22162-1010", zip_name_type: "zip", state_name_type: "state" },
  CA: { fmt: "%A%n%C %S %Z", require: "ACSZ", upper: "ACNOSZ", zip: "[ABCEGHJKLMNPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z] ?\\d[ABCEGHJ-NPRSTV-Z]\\d", zipex: "H3Z 2Y7,V8X 3X4" },
  AU: { fmt: "%A%n%C %S %Z", require: "ACSZ", upper: "CS", zip: "\\d{4}", zipex: "2060,3171", state_name_type: "state", locality_name_type: "suburb" },
  GB: { fmt: "%A%n%C%n%Z", require: "ACZ", upper: "CZ", locality_name_type: "post_town" },
  DE: { fmt: "%A%n%Z %C", require: "ACZ", zip: "\\d{5}", zipex: "26133,53225" },
};
const BUILTIN_DEFAULT: AddressFormatRecord = { fmt: "%A%n%Z %C%n%S", require: "AC" };

/** A format without loading anything: the built-in rules for TR, US, CA, AU, GB and DE, a generic one otherwise. */
export function addressFormatFallback(country: string): AddressFormat {
  const cc = (country || "").toUpperCase();
  return createAddressFormat(cc, BUILTIN[cc] ?? BUILTIN_DEFAULT);
}

/* ------------------------------------------------------------------ */
/* Postal codes & validation                                           */
/* ------------------------------------------------------------------ */

export interface PostalCodeCheck {
  /** `"ok"`, `"empty"`, `"format"` (does not match the country's pattern) or `"none"` (the country has no postal codes). */
  status: "ok" | "empty" | "format" | "none";
  /** Trimmed, upper-cased, without the printed prefix ("ch-8001" → "8001"). */
  value: string;
}

/** Checks a postal code against a country's pattern. */
export function checkPostalCode(code: string, format: AddressFormat): PostalCodeCheck {
  let value = code.trim().replace(/\s+/g, " ").toUpperCase();
  const pc = format.postalCode;
  if (pc?.prefix && value.startsWith(pc.prefix.toUpperCase())) value = value.slice(pc.prefix.length).trim();
  if (!value) return { status: "empty", value };
  if (!pc) return { status: "none", value };
  return { status: pc.pattern.test(value) ? "ok" : "format", value };
}

export type AddressIssue = "required" | "format";

/**
 * Checks an address against its country's rules: required parts and the postal code pattern.
 * Returns the parts with a problem (empty object = fine). `required` overrides the country's list.
 */
export function validateAddress(address: Address, format: AddressFormat, opts: { required?: AddressPart[] } = {}): Partial<Record<AddressPart, AddressIssue>> {
  const out: Partial<Record<AddressPart, AddressIssue>> = {};
  const required = opts.required ?? ["country", ...format.required];
  for (const p of required) if (!address[p]?.trim()) out[p] = "required";
  if (address.postalCode?.trim() && !out.postalCode && checkPostalCode(address.postalCode, format).status === "format") out.postalCode = "format";
  return out;
}
