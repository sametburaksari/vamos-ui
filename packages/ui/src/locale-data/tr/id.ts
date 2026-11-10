/**
 * Turkish identification numbers: TCKN (citizens), YKN (foreign residents, same checksum,
 * starts with 99) and VKN (tax number). Includes the combined tax-id rule used on invoices,
 * where sole proprietors invoice with their TCKN (UBL-TR `PartyIdentification@schemeID`).
 */
import type { IdResult, IdRule } from "../core/types";

const digitsOnly = (v: string) => v.replace(/[\s\-.]/g, "");

/** The two TCKN check digits (d10, d11) for the first nine digits. */
export function tcknCheckDigits(first9: string): string {
  const d = [...first9].map(Number);
  if (d.length !== 9 || d.some((x) => !Number.isInteger(x))) throw new RangeError("tcknCheckDigits: expected 9 digits");
  const odd = d[0]! + d[2]! + d[4]! + d[6]! + d[8]!;
  const even = d[1]! + d[3]! + d[5]! + d[7]!;
  const d10 = (((odd * 7 - even) % 10) + 10) % 10;
  const d11 = (d.reduce((s, x) => s + x, 0) + d10) % 10;
  return `${d10}${d11}`;
}

/**
 * Validates a TCKN or YKN.
 *
 * ```ts
 * validateTckn("10000000146"); // { valid: true, value: "10000000146", kind: "tr-tckn" }
 * validateTckn("99000000068"); // { valid: true, …, kind: "tr-ykn" }
 * ```
 */
export function validateTckn(value: string): IdResult {
  const v = digitsOnly(value);
  if (!v) return { valid: false, value: v, reason: "empty" };
  if (!/^\d+$/.test(v)) return { valid: false, value: v, reason: "chars" };
  if (v.length !== 11) return { valid: false, value: v, reason: "length" };
  const kind = v.startsWith("99") ? "tr-ykn" : "tr-tckn";
  if (v[0] === "0" || /^(\d)\1{10}$/.test(v)) return { valid: false, value: v, kind, reason: "pattern" };
  if (tcknCheckDigits(v.slice(0, 9)) !== v.slice(9)) return { valid: false, value: v, kind, reason: "checksum" };
  return { valid: true, value: v, kind };
}

/** The VKN check digit (d10) for the first nine digits. */
export function vknCheckDigit(first9: string): string {
  const d = [...first9].map(Number);
  if (d.length !== 9 || d.some((x) => !Number.isInteger(x))) throw new RangeError("vknCheckDigit: expected 9 digits");
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const t = (d[i]! + 9 - i) % 10;
    let r = (t * 2 ** (9 - i)) % 9;
    if (t !== 0 && r === 0) r = 9;
    sum += r;
  }
  return String((10 - (sum % 10)) % 10);
}

/** Validates a 10-digit VKN (vergi kimlik numarası). */
export function validateVkn(value: string): IdResult {
  const v = digitsOnly(value);
  if (!v) return { valid: false, value: v, reason: "empty" };
  if (!/^\d+$/.test(v)) return { valid: false, value: v, reason: "chars" };
  if (v.length !== 10) return { valid: false, value: v, reason: "length" };
  if (vknCheckDigit(v.slice(0, 9)) !== v[9]) return { valid: false, value: v, kind: "tr-vkn", reason: "checksum" };
  return { valid: true, value: v, kind: "tr-vkn" };
}

/**
 * Invoice tax id: a 10-digit VKN or an 11-digit TCKN / YKN. `kind` maps to the e-invoice
 * scheme (`tr-vkn` → `VKN`, `tr-tckn` / `tr-ykn` → `TCKN`).
 */
export function validateTrTaxId(value: string): IdResult {
  const v = digitsOnly(value);
  if (v.length === 11) return validateTckn(v);
  if (v.length === 10) return validateVkn(v);
  if (!v) return { valid: false, value: v, reason: "empty" };
  return { valid: false, value: v, reason: /^\d+$/.test(v) ? "length" : "chars" };
}

/** UBL-TR `schemeID` for a valid tax id result. */
export function trTaxSchemeId(result: IdResult): "VKN" | "TCKN" | undefined {
  if (!result.valid) return undefined;
  return result.kind === "tr-vkn" ? "VKN" : "TCKN";
}

/** Privacy mask for read-only views: first 3 and last 2 digits ("123******01"). */
export function maskTrId(value: string, visibleStart = 3, visibleEnd = 2): string {
  const v = digitsOnly(value);
  if (v.length <= visibleStart + visibleEnd) return v;
  return v.slice(0, visibleStart) + "*".repeat(v.length - visibleStart - visibleEnd) + v.slice(-visibleEnd);
}

/** TCKN / YKN rule for Formatted inputs. */
export const trTcknRule: IdRule = {
  id: "tr-tckn",
  label: "Turkish ID number (TCKN)",
  lengths: [11],
  normalize: digitsOnly,
  validate: validateTckn,
  format: digitsOnly,
  mask: (v) => maskTrId(v),
};

/** VKN rule for Formatted inputs. */
export const trVknRule: IdRule = {
  id: "tr-vkn",
  label: "Turkish tax number (VKN)",
  lengths: [10],
  normalize: digitsOnly,
  validate: validateVkn,
  format: digitsOnly,
  mask: (v) => maskTrId(v, 3, 2),
};

/** Combined VKN-or-TCKN rule for invoice parties. */
export const trTaxIdRule: IdRule = {
  id: "tr-tax-id",
  label: "Tax number (VKN or TCKN)",
  lengths: [10, 11],
  normalize: digitsOnly,
  validate: validateTrTaxId,
  format: digitsOnly,
  mask: (v) => maskTrId(v),
};
