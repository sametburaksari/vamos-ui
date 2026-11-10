/**
 * Turkish IBAN: 26 characters = "TR" + 2 check digits + 5-digit bank code + reserved "0" +
 * 16-character account number.
 */
import { formatIban, normalizeIban, validateIban } from "../core/iban";
import type { IbanCountryRule, IdResult } from "../core/types";

/**
 * Bank names by 5-digit EFT participant code — the major banks only.
 * TODO(data): replace with a table generated from the TCMB EFT participant list by script.
 */
export const TR_BANK_NAMES: Readonly<Record<string, string>> = {
  "00010": "Ziraat Bankası",
  "00012": "Halkbank",
  "00015": "VakıfBank",
  "00046": "Akbank",
  "00062": "Garanti BBVA",
  "00064": "İşbank",
  "00067": "Yapı Kredi",
  "00111": "QNB",
  "00134": "DenizBank",
  "00205": "Kuveyt Türk",
};

/** The 5-digit bank code of a TR IBAN ("TR33 0006 1…" → "00061"). */
export function trIbanBankCode(iban: string): string | undefined {
  const v = normalizeIban(iban);
  return v.startsWith("TR") && v.length >= 9 ? v.slice(4, 9) : undefined;
}

export const trIbanRule: IbanCountryRule = {
  country: "TR",
  length: 26,
  bban: /^\d{5}0[0-9A-Z]{16}$/,
  bankName: (code) => TR_BANK_NAMES[code],
};

/** Validates a Turkish IBAN (rejects other countries with `reason: "country"`). */
export function validateTrIban(value: string): IdResult & { bankCode?: string; bankName?: string } {
  const v = normalizeIban(value);
  if (v && !v.startsWith("TR") && /^[A-Z]{2}/.test(v)) return { valid: false, value: v, reason: "country" };
  const r = validateIban(v, [trIbanRule]);
  if (!r.valid) return r;
  const bankCode = v.slice(4, 9);
  return { ...r, bankCode, bankName: TR_BANK_NAMES[bankCode] };
}

/** Display format "TR33 0006 1005 1978 6457 8413 26". */
export const formatTrIban = formatIban;
