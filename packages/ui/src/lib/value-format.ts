import type { Formatter } from "../format/core";

/**
 * How a data-display component (Stat, Delta, Description list, Table cell) turns a raw value
 * into text. Serializable, so it can be passed from server components to client islands.
 *
 * - `"number"` 28412 → "28,412" · `"integer"` rounds · `"decimal"` keeps 2 digits
 * - `"currency"` uses the provider currency (or `{ type: "currency", currency: "EUR" }`)
 * - `"compact"` 1240000 → "1.2M" · `"compact-currency"` → "$1.2M"
 * - `"percent"` is a ratio: 0.124 → "12.4%" (tr-TR "%12,4")
 * - `"duration"` seconds: 167 → "2m 47s" · `"bytes"` → "1.2 MB"
 * - `"date"` / `"datetime"` / `"relative"` for dates and instants
 */
export type ValueFormat =
  | "number"
  | "integer"
  | "decimal"
  | "currency"
  | "compact"
  | "compact-currency"
  | "percent"
  | "duration"
  | "bytes"
  | "date"
  | "datetime"
  | "relative"
  | {
      type: "number" | "currency" | "compact" | "compact-currency" | "percent";
      /** ISO 4217 code for currency types. Default: the provider currency. */
      currency?: string;
      /** Extra Intl.NumberFormat options (e.g. `{ maximumFractionDigits: 0 }`). */
      options?: Intl.NumberFormatOptions;
    };

const typeOf = (spec: ValueFormat) => (typeof spec === "string" ? spec : spec.type);

/** Formats `value` with a `ValueFormat`. Strings that are not numbers pass through unchanged. */
export function formatValue(f: Formatter, value: number | string | Date, spec: ValueFormat = "number", extra?: Intl.NumberFormatOptions): string {
  const type = typeOf(spec);
  const opts: Intl.NumberFormatOptions = { ...(typeof spec === "object" ? spec.options : undefined), ...extra };
  const currency = typeof spec === "object" ? spec.currency : undefined;
  if (type === "date") return f.date(value as string);
  if (type === "datetime") return f.dateTime(value as string);
  if (type === "relative") return f.relative(value as string);
  if (value instanceof Date) return f.dateTime(value);
  if (typeof value === "string" && !/^-?\d+(\.\d+)?$/.test(value.trim())) return value;
  const n = typeof value === "string" ? Number(value) : value;
  switch (type) {
    case "integer":
      return f.number(Math.round(n), opts);
    case "decimal":
      return f.number(value as number, { minimumFractionDigits: 2, maximumFractionDigits: 2, ...opts });
    case "currency":
      return f.currency(value as number, currency ?? f.currencyCode, opts);
    case "compact":
      return f.compact(n, opts);
    case "compact-currency":
      return f.currency(n, currency ?? f.currencyCode, { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1, ...opts });
    case "percent":
      return f.percent(n, opts);
    case "duration":
      return f.duration(n);
    case "bytes":
      return f.bytes(n);
    default:
      return f.number(value as number, opts);
  }
}

/** `"YYYY-MM-DD"` of an instant in a time zone (date-only strings pass through). */
export function dayKey(value: Date | string | number, timeZone = "UTC"): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Serializable ISO form of a date input (keeps date-only strings as they are). */
export function toIsoInstant(value: Date | string | number): string {
  if (typeof value === "string") return value;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}
