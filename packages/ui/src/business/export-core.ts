/**
 * Export helpers — React-free. CSV goes through the kit's CSV writer (RFC 4180 quoting, BOM,
 * locale delimiter, formula-injection guard). XLSX loads `write-excel-file` only when used.
 */
import { csvDelimiter, toCsv, type CsvCell } from "../data-table/csv";

export type ExportFormat = "csv" | "xlsx" | "json";

export interface ExportColumn {
  id: string;
  label: string;
  /** Personal data (KVKK / GDPR): flagged in the dialog, can be masked, can require a reason. */
  personalData?: boolean;
  /** Masked unless the user turns masking off. */
  maskByDefault?: boolean;
  /** Ticked when the dialog opens. Default `true`. */
  defaultSelected?: boolean;
  /** Cell value. Default `row[id]`. */
  accessor?: (row: Record<string, unknown>) => unknown;
  /** `"number"` cells stay numeric in CSV / XLSX. */
  type?: "text" | "number" | "date" | "boolean";
}

export interface CsvExportOptions {
  /** Default: from the locale (`;` where the decimal separator is a comma). */
  delimiter?: "," | ";" | "\t";
  /** UTF-8 byte order mark so Excel reads accents. Default `true`. */
  bom?: boolean;
  /** `"locale"`: decimal comma in tr-TR. `"."`: always a point. Default `"locale"`. */
  decimal?: "locale" | ".";
}

export interface ExportToBlobOptions {
  rows: Record<string, unknown>[];
  columns: ExportColumn[];
  format: ExportFormat;
  /** Column ids written masked. */
  masked?: string[];
  locale?: string;
  csv?: CsvExportOptions;
  /** XLSX sheet name. Default "Export". */
  sheetName?: string;
}

/** "ayse.yilmaz@northwind.com" → "a••••@northwind.com"; "+90 532 111 22 33" → "••••••••33". */
export function maskValue(value: unknown): string {
  if (value == null || value === "") return "";
  const s = String(value);
  const at = s.indexOf("@");
  if (at > 0) return `${s[0]}••••${s.slice(at)}`;
  if (s.length <= 2) return "••";
  return `${"•".repeat(Math.min(8, s.length - 2))}${s.slice(-2)}`;
}

function cellOf(col: ExportColumn, row: Record<string, unknown>, masked: Set<string>): CsvCell {
  const raw = col.accessor ? col.accessor(row) : row[col.id];
  if (masked.has(col.id)) return maskValue(raw);
  if (raw == null) return null;
  if (typeof raw === "number" || typeof raw === "boolean" || typeof raw === "string" || raw instanceof Date) return raw;
  return String(raw);
}

/** Two-dimensional data with a header row — what CSV and XLSX writers take. */
export function toExportMatrix(rows: Record<string, unknown>[], columns: ExportColumn[], masked: string[] = []): CsvCell[][] {
  const m = new Set(masked);
  return [columns.map((c) => c.label), ...rows.map((r) => columns.map((c) => cellOf(c, r, m)))];
}

const MIME: Record<ExportFormat, string> = {
  csv: "text/csv;charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  json: "application/json",
};

/**
 * Rows → a file Blob in the chosen format.
 *
 * ```ts
 * const blob = await exportToBlob({ rows, columns, format: "csv", locale: "tr-TR" }); // ; + decimal comma + BOM
 * ```
 */
export async function exportToBlob({ rows, columns, format, masked = [], locale = "en-US", csv, sheetName = "Export" }: ExportToBlobOptions): Promise<Blob> {
  const matrix = toExportMatrix(rows, columns, masked);
  if (format === "csv") {
    const text = toCsv(matrix, {
      locale,
      delimiter: csv?.delimiter ?? csvDelimiter(locale),
      bom: csv?.bom ?? true,
      localizeNumbers: (csv?.decimal ?? "locale") === "locale",
    });
    return new Blob([text], { type: MIME.csv });
  }
  if (format === "json") {
    const m = new Set(masked);
    const data = rows.map((r) => Object.fromEntries(columns.map((c) => [c.id, cellOf(c, r, m) ?? null])));
    return new Blob([JSON.stringify(data, null, 2)], { type: MIME.json });
  }
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const sheet = matrix.map((r, i) =>
    r.map((v) => {
      if (v == null || v === "") return null;
      if (i === 0) return { value: String(v), fontWeight: "bold" as const };
      if (typeof v === "number") return { value: v, type: Number };
      if (typeof v === "boolean") return { value: v, type: Boolean };
      if (v instanceof Date) return { value: v, type: Date, format: "yyyy-mm-dd" };
      return { value: String(v), type: String };
    }),
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (writeXlsxFile as any)(sheet, { sheet: sheetName.slice(0, 31) }).toBlob();
}

/** A dated file name: `exportFilename("contacts", "csv", "2026-11-10")` → "contacts-2026-11-10.csv". */
export function exportFilename(base: string, format: ExportFormat, date?: string): string {
  const d = date ?? localIsoDate(new Date());
  const safe = base.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "export";
  return `${safe}-${d}.${format}`;
}

function localIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Saves a Blob as a file in the browser. */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
