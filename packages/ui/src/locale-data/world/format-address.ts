/**
 * `formatAddress`: an address as printed lines, in the country's order (Google address formats).
 * React-free; the same function AddressField uses for its read-only view.
 */
import { foldText } from "../../lib/text";
import type { Address } from "../core/types";
import { addressFormatFallback, peekAddressFormat, type AddressFormat, type AddressFormatToken } from "./formats";

export interface FormatAddressOptions {
  /** Language of the country name line. Default `"en-US"`. */
  locale?: string;
  /** Add the country name as the last line. Default `true`. */
  includeCountry?: boolean;
  /**
   * The country's format (`await loadAddressFormat("JP")`). Default: the loaded data if any part
   * of the app has loaded it, else the built-in rules (TR, US, CA, AU, GB, DE and a generic one).
   */
  format?: AddressFormat;
  /** Envelope style: the parts the country writes in capitals are upper-cased, and so is the country. */
  postal?: boolean;
  /**
   * Use the Latin-script format for countries that have one (JP, CN, KR, RU…). Default `"auto"`:
   * when every part of the address is written in Latin script.
   */
  latin?: boolean | "auto";
}

function displayName(locale: string, code: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

const hasNonLatinLetters = (s: string) => /[^\p{Script=Latin}\P{L}]/u.test(s);

/** True when the text has letters and all of them are Latin. */
export function isLatinText(s: string): boolean {
  return /\p{L}/u.test(s) && !/[^\p{Script=Latin}\P{L}]/u.test(s);
}

/**
 * Formats an address as lines in the country's convention.
 *
 * ```ts
 * formatAddress({ country: "TR", region1: "İstanbul", region2: "Kadıköy", region3: "Caferağa Mah.", line1: "Moda Cad. No: 12", postalCode: "34710" }, { locale: "en-US" });
 * // ["Caferağa Mah. Moda Cad. No: 12", "34710 Kadıköy/İstanbul", "Türkiye"]
 * formatAddress({ country: "US", line1: "548 Market St", region2: "San Francisco", region1: "CA", postalCode: "94104" }, { includeCountry: false });
 * // ["548 Market St", "San Francisco, CA 94104"]
 * ```
 *
 * Turkish addresses put the neighbourhood in front of the street; when `line1` already names it,
 * it is not repeated. Literal text of the format ("〒", "CH-", ", ") is printed only next to the
 * parts it belongs to.
 */
export function formatAddress(a: Address, opts: FormatAddressOptions = {}): string[] {
  const { locale = "en-US", includeCountry = true, postal = false, latin = "auto" } = opts;
  const c = (a.country ?? "").toUpperCase();
  const format = opts.format ?? peekAddressFormat(c) ?? addressFormatFallback(c);
  const values = [a.line1, a.line2, a.region1, a.region2, a.region3, a.postalCode].filter((v): v is string => !!v?.trim());
  const useLatin = !!format.latinLines && (latin === true || (latin === "auto" && values.some(isLatinText) && !values.some(hasNonLatinLetters)));
  const lines = useLatin ? format.latinLines! : format.lines;
  const hasRegion3 = lines.some((l) => l.some((t) => "part" in t && t.part === "region3"));
  const up = (part: string, v: string) => (postal && format.upper.includes(part as never) ? v.toLocaleUpperCase(format.language ?? locale) : v);

  // Countries without a dependent-locality part: TR writes the neighbourhood before the street,
  // others get it as a line of its own after the street.
  let street = [a.line1, a.line2].map((x) => x?.trim()).filter((x): x is string => !!x);
  if (!hasRegion3 && a.region3?.trim()) {
    if (c === "TR") street = [trStreetLine(a.region3, street[0])!, ...street.slice(1)];
    else street = [...street, a.region3.trim()];
  }
  let postalValue = a.postalCode?.trim() ?? "";
  const prefix = format.postalCode?.prefix;
  if (prefix && postalValue.toUpperCase().startsWith(prefix.toUpperCase())) postalValue = postalValue.slice(prefix.length).trim();

  const value = (part: Extract<AddressFormatToken, { part: unknown }>["part"]): string => {
    if (part === "postalCode") return postalValue ? up("postalCode", postalValue) : "";
    if (part === "street") return street.map((x) => up("line1", x)).join(", ");
    const v = a[part]?.trim() ?? "";
    return v ? up(part, v) : "";
  };

  const out: string[] = [];
  for (const line of lines) {
    if (line.length === 1 && "part" in line[0]! && line[0].part === "street") {
      out.push(...street.map((s) => up("line1", s)));
      continue;
    }
    out.push(renderLine(line, value));
  }
  if (includeCountry && c) {
    const name = displayName(locale, c);
    out.push(postal ? name.toLocaleUpperCase(locale) : name);
  }
  return out.map((l) => l.trim()).filter(Boolean);
}

/**
 * One format line. A literal before the first part is that part's prefix ("〒", "CH-"), one after
 * the last part its suffix; a literal between parts is a separator, printed only when there is a
 * printed part on both sides, and only the first separator of a gap (Z " " C "/" S with no C →
 * "34710 İstanbul").
 */
function renderLine(line: AddressFormatToken[], value: (part: Extract<AddressFormatToken, { part: unknown }>["part"]) => string): string {
  const parts = line.map((t, i) => ({ i, v: "part" in t ? value(t.part) : null })).filter((x) => x.v !== null);
  if (!parts.length) return "";
  const firstPart = parts[0]!.i;
  const lastPart = parts[parts.length - 1]!.i;
  let s = "";
  let printedBefore = false;
  let gap: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const t = line[i]!;
    if ("text" in t) {
      if (i < firstPart) {
        // prefix of the first part: decided when we reach it
        continue;
      }
      if (i > lastPart) {
        if (value((line[lastPart] as { part: never }).part)) s += t.text;
        continue;
      }
      if (printedBefore && gap === null) gap = t.text;
      continue;
    }
    const v = value(t.part);
    if (!v) continue;
    if (!printedBefore) {
      // prefix literals directly before the first part, if that part is the one printed
      if (i === firstPart) for (let j = 0; j < i; j++) if ("text" in line[j]!) s += (line[j] as { text: string }).text;
    } else s += gap ?? "";
    s += v;
    printedBefore = true;
    gap = null;
  }
  return s;
}

/** "Caferağa Mah." + "Moda Cad. No: 12", skipping the neighbourhood when the street line already has it. */
function trStreetLine(region3: string | undefined, line1: string | undefined): string | undefined {
  const n = region3?.trim();
  if (!n) return line1;
  if (!line1?.trim()) return n;
  const bare = n.replace(/\s+(Mah\.?|Mahallesi|Köyü)(\s*\(.*\))?\s*$/iu, "");
  return foldText(line1, "tr").includes(foldText(bare, "tr")) ? line1 : `${n} ${line1}`;
}
