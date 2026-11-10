/**
 * ISO 13616 IBAN: normalization, mod-97 check, check-digit computation and display grouping.
 * Chunked mod-97 (no BigInt). Per-country rules are pack data (`IbanCountryRule`).
 */
import type { IbanCountryRule, IdResult } from "./types";

/**
 * IBAN lengths from the SWIFT IBAN registry for common countries. Unknown countries are
 * checked against the generic 15–34 range only.
 */
export const IBAN_LENGTHS: Readonly<Record<string, number>> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29, CH: 21, CY: 28, CZ: 24,
  DE: 22, DK: 18, DO: 28, EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18,
  GR: 27, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LI: 21,
  LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28,
  PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26, UA: 29,
  VA: 22, XK: 20,
};

/** Uppercase, separators and whitespace removed ("tr33 0006-1…" → "TR330006…"). */
export function normalizeIban(value: string): string {
  return value.replace(/[\s\-._]/g, "").toUpperCase();
}

/** `n mod 97` of a string of decimal digits, in 9-digit chunks. */
function mod97(digits: string): number {
  let rem = 0;
  for (let i = 0; i < digits.length; i += 7) rem = Number(String(rem) + digits.slice(i, i + 7)) % 97;
  return rem;
}

/** Letters → numbers (A = 10 … Z = 35). */
function toDigits(s: string): string {
  let out = "";
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    out += c >= 65 && c <= 90 ? String(c - 55) : ch;
  }
  return out;
}

/** The two check digits for a country code and BBAN. */
export function ibanCheckDigits(country: string, bban: string): string {
  const rem = mod97(toDigits(normalizeIban(bban) + country.toUpperCase() + "00"));
  return String(98 - rem).padStart(2, "0");
}

/** Builds a valid IBAN from a country code and BBAN. */
export function buildIban(country: string, bban: string): string {
  const b = normalizeIban(bban);
  return country.toUpperCase() + ibanCheckDigits(country, b) + b;
}

/**
 * Validates an IBAN: shape, the country's length (and BBAN pattern when a rule is given), mod 97.
 *
 * ```ts
 * validateIban("TR33 0006 1005 1978 6457 8413 26"); // { valid: true, value: "TR33…", kind: "iban-TR" }
 * ```
 */
export function validateIban(value: string, rules?: IbanCountryRule[]): IdResult {
  const v = normalizeIban(value);
  if (!v) return { valid: false, value: v, reason: "empty" };
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(v)) return { valid: false, value: v, reason: "chars" };
  const country = v.slice(0, 2);
  const rule = rules?.find((r) => r.country === country);
  const length = rule?.length ?? IBAN_LENGTHS[country];
  if (length !== undefined ? v.length !== length : v.length < 15 || v.length > 34) return { valid: false, value: v, kind: `iban-${country}`, reason: "length" };
  if (rule && !rule.bban.test(v.slice(4))) return { valid: false, value: v, kind: `iban-${country}`, reason: "pattern" };
  const ok = mod97(toDigits(v.slice(4) + v.slice(0, 4))) === 1;
  return ok ? { valid: true, value: v, kind: `iban-${country}` } : { valid: false, value: v, kind: `iban-${country}`, reason: "checksum" };
}

export function isValidIban(value: string, rules?: IbanCountryRule[]): boolean {
  return validateIban(value, rules).valid;
}

/** Print format: groups of four ("TR33 0006 1005 1978 6457 8413 26"). Works on partial input. */
export function formatIban(value: string): string {
  return normalizeIban(value).replace(/(.{4})(?=.)/g, "$1 ");
}

/** Electronic format (no spaces, uppercase). */
export const electronicIban = normalizeIban;
