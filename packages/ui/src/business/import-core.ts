/**
 * Import helpers — React-free and worker-safe: encoding / delimiter sniffing, CSV and XLSX
 * reading (lazy), locale-folded header auto-mapping, locale-aware cell parsing and row
 * validation. `papaparse` and `read-excel-file` are loaded only when a file is read.
 */
import { parseDecimal } from "../format/core";
import { foldText } from "../lib/text";
import { isValidIban } from "../locale-data/core/iban";

export type ImportFieldType = "text" | "number" | "money" | "date" | "boolean" | "enum" | "email" | "phone" | "id" | "iban";

export interface ImportField {
  id: string;
  label: string;
  /** Other header names that map here ("E-posta", "Mail"). */
  aliases?: string[];
  required?: boolean;
  type: ImportFieldType;
  options?: { value: string; label: string; aliases?: string[] }[];
  /** Extra check after type parsing. Return an error message or `null`. */
  validate?: (value: string, row: Record<string, string>) => string | null;
  /** Final value written to the import (e.g. phone → E.164 with the locale pack). */
  normalize?: (value: string) => unknown;
  /** Example value shown in the mapping step. */
  example?: string;
}

export type CsvEncoding = "utf-8" | "windows-1254" | "windows-1252" | (string & {});

export interface CsvSniff {
  encoding: CsvEncoding;
  delimiter: "," | ";" | "\t";
  hasBom: boolean;
}

export interface ImportSheet {
  name: string;
  rows: string[][];
}

/** Turkish letters in Windows-1254 that are something else in Windows-1252. */
const TR_1254 = new Set([0xd0, 0xf0, 0xdd, 0xfd, 0xde, 0xfe]);

/**
 * Guesses encoding and delimiter from the first bytes. Invalid UTF-8 with Turkish code points
 * → Windows-1254 (Excel on Turkish Windows), else Windows-1252.
 */
export function sniffCsv(bytes: Uint8Array): CsvSniff {
  const hasBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  let encoding: CsvEncoding = "utf-8";
  if (!hasBom) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, 64 * 1024));
    } catch {
      let tr = 0;
      for (let i = 0; i < Math.min(bytes.length, 64 * 1024); i++) if (TR_1254.has(bytes[i]!)) tr++;
      encoding = tr > 0 ? "windows-1254" : "windows-1252";
    }
  }
  const head = decodeText(bytes.subarray(0, 16 * 1024), encoding);
  return { encoding, delimiter: sniffDelimiter(head), hasBom };
}

/** Bytes → text in an encoding (drops a UTF-8 BOM). */
export function decodeText(bytes: Uint8Array, encoding: CsvEncoding): string {
  let text: string;
  try {
    text = new TextDecoder(encoding).decode(bytes);
  } catch {
    text = new TextDecoder("utf-8").decode(bytes);
  }
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** The delimiter that splits the first lines most consistently. */
export function sniffDelimiter(text: string): "," | ";" | "\t" {
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, 8);
  const score = (d: string) => {
    const counts = lines.map((l) => {
      let n = 0;
      let q = false;
      for (const ch of l) {
        if (ch === '"') q = !q;
        else if (ch === d && !q) n++;
      }
      return n;
    });
    if (!counts.length || counts[0] === 0) return 0;
    const same = counts.filter((c) => c === counts[0]).length;
    return counts[0]! * (same / counts.length);
  };
  const candidates = [";", ",", "\t"] as const;
  return candidates.reduce((best, d) => (score(d) > score(best) ? d : best), "," as "," | ";" | "\t");
}

/** True when decoded text has replacement characters or typical mojibake ("Ã§", "Ä±"). */
export function looksGarbled(text: string): boolean {
  return /�/.test(text) || /Ã[\u0080-¿§¶¼]|Ä[±°ž]|Å[Ÿž]/.test(text.slice(0, 20000));
}

/** CSV text → rows (lazy `papaparse`). */
export async function parseCsv(text: string, delimiter?: string): Promise<string[][]> {
  const Papa = (await import("papaparse")).default;
  const res = Papa.parse<string[]>(text, { delimiter: delimiter ?? "", skipEmptyLines: "greedy" });
  return res.data.map((r) => r.map((c) => (c ?? "").trim()));
}

function cellToString(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${v.getUTCFullYear()}-${p(v.getUTCMonth() + 1)}-${p(v.getUTCDate())}`;
  }
  return String(v).trim();
}

/** An XLSX file → sheets of string rows (lazy `read-excel-file`). */
export async function readXlsx(file: Blob): Promise<ImportSheet[]> {
  const mod = await import("read-excel-file/browser");
  const sheets = await mod.default(file as File);
  return sheets.map((s) => ({ name: s.sheet, rows: s.data.map((r) => r.map(cellToString)) }));
}

const norm = (s: string, locale: string) => foldText(s, locale).replace(/[^\p{L}\p{N}]+/gu, "");

/**
 * Maps file headers to fields: exact folded match on id, label or aliases first, then
 * containment. Locale folding makes "E-posta" ≈ "eposta" ≈ "EPOSTA". Each field is used once.
 */
export function autoMap(headers: string[], fields: ImportField[], locale = "en-US"): Record<number, string | null> {
  const out: Record<number, string | null> = {};
  const used = new Set<string>();
  const names = fields.map((f) => ({ id: f.id, keys: [f.id, f.label, ...(f.aliases ?? [])].map((k) => norm(k, locale)).filter(Boolean) }));
  headers.forEach((h, i) => {
    const n = norm(h, locale);
    const exact = names.find((f) => !used.has(f.id) && f.keys.includes(n));
    if (exact && n) {
      out[i] = exact.id;
      used.add(exact.id);
    } else out[i] = null;
  });
  headers.forEach((h, i) => {
    if (out[i]) return;
    const n = norm(h, locale);
    if (n.length < 3) return;
    const loose = names.find((f) => !used.has(f.id) && f.keys.some((k) => k.length >= 3 && (n.includes(k) || k.includes(n))));
    if (loose) {
      out[i] = loose.id;
      used.add(loose.id);
    }
  });
  return out;
}

export interface ParsedCell {
  value: unknown;
  error?: string;
  warning?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TRUE = new Set(["true", "yes", "y", "1", "x", "evet", "e", "var", "on"]);
const FALSE = new Set(["false", "no", "n", "0", "hayir", "h", "yok", "off", ""]);

export const importCellMessages = {
  number: "Not a number",
  date: "Not a date (use YYYY-MM-DD)",
  boolean: "Use yes or no",
  enum: "Not one of: {options}",
  email: "Not an email address",
  phone: "Not a phone number",
  iban: "IBAN check digits don't match",
  required: "Required",
  duplicate: "Duplicate of row {row}",
};
export type ImportCellMessages = typeof importCellMessages;

const pad = (n: number) => String(n).padStart(2, "0");
function isoFromParts(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1000) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** "2026-11-10", "10.11.2026", "10/11/2026" (month first for en-US), Excel serials → "YYYY-MM-DD". */
export function parseDateCell(v: string, locale = "en-US"): string | null {
  const s = v.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(s);
  if (m) return isoFromParts(+m[1]!, +m[2]!, +m[3]!);
  m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/.exec(s);
  if (m) {
    const y = m[3]!.length === 2 ? 2000 + +m[3]! : +m[3]!;
    const monthFirst = /^en-(US|PH)$/i.test(locale) || (+m[2]! > 12 && +m[1]! <= 12);
    return monthFirst ? isoFromParts(y, +m[1]!, +m[2]!) : isoFromParts(y, +m[2]!, +m[1]!);
  }
  if (/^\d{4,5}(\.\d+)?$/.test(s)) {
    const serial = Math.floor(Number(s));
    if (serial > 0 && serial < 80000) {
      const dt = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
    }
  }
  return null;
}

/** One cell → typed value or a message. Number and date formats follow the file's locale. */
export function parseCell(v: string, field: ImportField, locale = "en-US", messages: ImportCellMessages = importCellMessages): ParsedCell {
  const s = v.trim();
  if (!s) return { value: field.type === "boolean" ? false : null };
  switch (field.type) {
    case "number": {
      const d = parseDecimal(s, locale);
      return d == null ? { value: null, error: messages.number } : { value: Number(d) };
    }
    case "money": {
      const d = parseDecimal(s, locale);
      return d == null ? { value: null, error: messages.number } : { value: d };
    }
    case "date": {
      const d = parseDateCell(s, locale);
      return d ? { value: d } : { value: null, error: messages.date };
    }
    case "boolean": {
      const f = foldText(s, locale);
      if (TRUE.has(f)) return { value: true };
      if (FALSE.has(f)) return { value: false };
      return { value: null, error: messages.boolean };
    }
    case "enum": {
      const f = norm(s, locale);
      const opt = field.options?.find((o) => [o.value, o.label, ...(o.aliases ?? [])].some((k) => norm(k, locale) === f));
      return opt ? { value: opt.value } : { value: null, error: messages.enum.replace("{options}", (field.options ?? []).map((o) => o.label).join(", ")) };
    }
    case "email":
      return EMAIL.test(s) ? { value: s.toLowerCase() } : { value: null, error: messages.email };
    case "phone": {
      const digits = s.replace(/[^\d+]/g, "");
      const count = digits.replace(/\D/g, "").length;
      return count >= 7 && count <= 15 ? { value: digits } : { value: null, error: messages.phone };
    }
    case "iban":
      return isValidIban(s) ? { value: s.replace(/\s+/g, "").toUpperCase() } : { value: null, error: messages.iban };
    default:
      return { value: s };
  }
}

export interface ImportRowResult {
  /** 1-based row number in the file (header excluded). */
  row: number;
  raw: Record<string, string>;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface ValidateImportOptions {
  locale?: string;
  /** Field ids that identify a record; repeated combinations are flagged as warnings. */
  dedupeKeys?: string[];
  messages?: ImportCellMessages;
}

/** Mapped raw rows → typed values, errors and warnings per field. */
export function validateImport(
  rows: string[][],
  mapping: Record<number, string | null>,
  fields: ImportField[],
  options: ValidateImportOptions = {},
): ImportRowResult[] {
  const { locale = "en-US", dedupeKeys, messages = importCellMessages } = options;
  const byId = new Map(fields.map((f) => [f.id, f]));
  const seen = new Map<string, number>();
  return rows.map((cells, i) => {
    const raw: Record<string, string> = {};
    for (const [col, id] of Object.entries(mapping)) if (id) raw[id] = cells[Number(col)] ?? "";
    return validateImportRow(raw, i + 1, byId, { locale, messages, dedupeKeys, seen });
  });
}

/** Re-validates one row after an inline fix. */
export function validateImportRow(
  raw: Record<string, string>,
  row: number,
  fields: Map<string, ImportField> | ImportField[],
  o: { locale?: string; messages?: ImportCellMessages; dedupeKeys?: string[]; seen?: Map<string, number> } = {},
): ImportRowResult {
  const byId = fields instanceof Map ? fields : new Map(fields.map((f) => [f.id, f]));
  const locale = o.locale ?? "en-US";
  const messages = o.messages ?? importCellMessages;
  const values: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  for (const f of byId.values()) {
    const v = raw[f.id] ?? "";
    if (!v.trim()) {
      if (f.required) errors[f.id] = messages.required;
      values[f.id] = f.type === "boolean" ? false : null;
      continue;
    }
    const p = parseCell(v, f, locale, messages);
    if (p.error) errors[f.id] = p.error;
    else {
      const custom = f.validate?.(v, raw);
      if (custom) errors[f.id] = custom;
      values[f.id] = f.normalize ? f.normalize(String(p.value)) : p.value;
    }
    if (p.warning) warnings[f.id] = p.warning;
  }
  if (o.dedupeKeys?.length && o.seen) {
    const key = o.dedupeKeys.map((k) => foldText(String(raw[k] ?? ""), locale)).join("\u0000");
    if (key.replace(/\u0000/g, "")) {
      const first = o.seen.get(key);
      if (first !== undefined) warnings[o.dedupeKeys[0]!] = messages.duplicate.replace("{row}", String(first));
      else o.seen.set(key, row);
    }
  }
  return { row, raw, values, errors, warnings };
}

export interface MappingTemplate {
  id: string;
  name: string;
  /** Folded header → field id. */
  mapping: Record<string, string>;
}

/** Applies a saved template to the current headers. */
export function applyTemplate(headers: string[], template: MappingTemplate, locale = "en-US"): Record<number, string | null> {
  const out: Record<number, string | null> = {};
  headers.forEach((h, i) => (out[i] = template.mapping[norm(h, locale)] ?? null));
  return out;
}

/** The current mapping as a template body. */
export function mappingToTemplate(headers: string[], mapping: Record<number, string | null>, locale = "en-US"): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((h, i) => {
    const id = mapping[i];
    if (id) out[norm(h, locale)] = id;
  });
  return out;
}
