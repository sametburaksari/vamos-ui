/**
 * CSV writer for list exports. React-free. Excel-friendly by default: UTF-8 BOM, CRLF line ends,
 * the delimiter of the locale (`;` where the decimal separator is a comma, e.g. tr-TR / de-DE),
 * and a guard against formula injection.
 */
import { numberSeparators } from "../format/core";

export type CsvCell = string | number | boolean | null | undefined | Date;

export interface CsvOptions {
  /** Default: `csvDelimiter(locale)`. */
  delimiter?: string;
  /** Used for the delimiter and decimal separator. Default "en-US". */
  locale?: string;
  /** Prepend the UTF-8 byte order mark (Excel reads accents correctly). Default `true`. */
  bom?: boolean;
  /** Write numbers with the locale's decimal separator (`1234,5` for tr-TR). Default `true`. */
  localizeNumbers?: boolean;
  /** Prefix cells that start with `= + - @ tab CR` with `'` so spreadsheets never run them. Default `true`. */
  guardFormulas?: boolean;
}

/** `","` for en-US, `";"` for locales whose decimal separator is a comma. */
export function csvDelimiter(locale = "en-US"): string {
  return numberSeparators(locale).decimal === "," ? ";" : ",";
}

const FORMULA = /^[=+\-@\t\r]/;

/** One escaped cell. Strings that look like formulas get a `'` prefix; numbers never do. */
export function escapeCsvCell(value: CsvCell, o: CsvOptions = {}): string {
  const delimiter = o.delimiter ?? csvDelimiter(o.locale);
  if (value === null || value === undefined) return "";
  let s: string;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    s = String(value);
    if (o.localizeNumbers !== false) {
      const { decimal } = numberSeparators(o.locale ?? "en-US");
      if (decimal !== ".") s = s.replace(".", decimal);
    }
  } else if (typeof value === "boolean") {
    s = value ? "true" : "false";
  } else if (value instanceof Date) {
    s = Number.isNaN(value.getTime()) ? "" : value.toISOString();
  } else {
    s = value;
    if (o.guardFormulas !== false && FORMULA.test(s)) s = `'${s}`;
  }
  return s.includes(delimiter) || /["\r\n]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Rows (first row = headers) → CSV text.
 *
 * ```ts
 * toCsv([["Name", "Value"], ["Northwind", 4800.5]], { locale: "tr-TR" }); // "﻿Name;Value\r\nNorthwind;4800,5\r\n"
 * ```
 */
export function toCsv(rows: CsvCell[][], o: CsvOptions = {}): string {
  const opts = { ...o, delimiter: o.delimiter ?? csvDelimiter(o.locale) };
  const body = rows.map((r) => r.map((c) => escapeCsvCell(c, opts)).join(opts.delimiter)).join("\r\n");
  return (o.bom === false ? "" : "﻿") + body + (rows.length ? "\r\n" : "");
}

/** Saves CSV text as a file in the browser. `filename` gets `.csv` if it has no extension. */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof document === "undefined") return;
  const name = /\.[a-z0-9]+$/i.test(filename) ? filename : `${filename}.csv`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
