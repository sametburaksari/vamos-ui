/**
 * @vamos-ui/react/format — React-free formatting core. Works in server components, route
 * handlers and the browser. Every formatter goes through cached `Intl.*` instances.
 *
 * Value rules (X11): a date-only value is a `"YYYY-MM-DD"` string (formatted as a calendar
 * date, never shifted by a time zone); money is a decimal string (`"1250.50"`) or a number;
 * the time zone is always explicit (default `"UTC"`, so server and client agree).
 */

export type DateInput = Date | number | string;
export type NumericInput = number | bigint | string;

export interface FormatterOptions {
  /** ISO 4217 code used by `currency()` when none is passed. Default `"USD"`. */
  currency?: string;
  /** IANA time zone for instants. Default `"UTC"`. Date-only strings ignore it. */
  timeZone?: string;
}

export type DatePreset = "short" | "medium" | "long" | "full" | "datetime" | "datetime-short" | "datetime-seconds" | "month-year" | "weekday";
export type DurationStyle = "narrow" | "short" | "long";

export interface CurrencyOptions extends Intl.NumberFormatOptions {
  currency?: string;
  /** `"symbol"` (default) | `"narrowSymbol"` | `"code"` | `"name"`. */
  display?: Intl.NumberFormatOptions["currencyDisplay"];
}

export interface BytesOptions {
  /** Default 1. */
  maximumFractionDigits?: number;
  /** Use 1024 steps. Default `false` (1000, SI — what file managers show). */
  binary?: boolean;
  unitDisplay?: "short" | "long" | "narrow";
}

export interface DurationOptions {
  /** Unit of the input. Default `"s"`. */
  unit?: "ms" | "s" | "min" | "h";
  /** Default: `"narrow"` for English ("2m 47s"), `"short"` elsewhere ("2 dk. 47 sn."). */
  style?: DurationStyle;
  /** Max number of parts, largest first. Default 2 ("1h 5m", not "1h 5m 12s"). */
  maxParts?: number;
  /** Smallest unit shown. Default `"s"`. */
  smallest?: "d" | "h" | "min" | "s";
}

export interface RelativeOptions {
  /** Reference time. Default `Date.now()`. */
  now?: DateInput;
  style?: Intl.RelativeTimeFormatStyle;
  /** `"auto"` (default) gives "yesterday"/"dün"; `"always"` gives "1 day ago". */
  numeric?: Intl.RelativeTimeFormatNumeric;
}

const cache = new Map<string, unknown>();
function cached<T>(kind: string, locale: string, options: object | undefined, make: () => T): T {
  const key = `${kind}|${locale}|${options ? JSON.stringify(options) : ""}`;
  let v = cache.get(key) as T | undefined;
  if (!v) cache.set(key, (v = make()));
  return v;
}

export const numberFormat = (locale: string, o?: Intl.NumberFormatOptions) => cached("n", locale, o, () => new Intl.NumberFormat(locale, o));
export const dateTimeFormat = (locale: string, o?: Intl.DateTimeFormatOptions) => cached("d", locale, o, () => new Intl.DateTimeFormat(locale, o));
const relativeFormat = (locale: string, o?: Intl.RelativeTimeFormatOptions) => cached("r", locale, o, () => new Intl.RelativeTimeFormat(locale, o));
const listFormat = (locale: string, o?: Intl.ListFormatOptions) => cached("l", locale, o, () => new Intl.ListFormat(locale, o));

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

/** `true` for `"YYYY-MM-DD"` strings. */
export const isDateOnly = (v: unknown): v is string => typeof v === "string" && DATE_ONLY.test(v);

/** Date-only string → a `Date` at UTC midnight (format it with `timeZone: "UTC"`). */
function dateOnlyToUTC(s: string): Date {
  const [, y, m, d] = DATE_ONLY.exec(s)!;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

/** Normalises a date input. Returns the Date and whether it is a calendar date (no time zone). */
function toDate(v: DateInput): { date: Date; calendar: boolean } {
  if (v instanceof Date) return { date: v, calendar: false };
  if (typeof v === "number") return { date: new Date(v), calendar: false };
  if (DATE_ONLY.test(v)) return { date: dateOnlyToUTC(v), calendar: true };
  const t = TIME_ONLY.exec(v);
  if (t) return { date: new Date(Date.UTC(1970, 0, 1, Number(t[1]), Number(t[2]), Number(t[3] ?? 0))), calendar: true };
  return { date: new Date(v), calendar: false };
}

const PRESETS: Record<DatePreset, Intl.DateTimeFormatOptions> = {
  short: { dateStyle: "short" },
  medium: { dateStyle: "medium" },
  long: { dateStyle: "long" },
  full: { dateStyle: "full" },
  datetime: { dateStyle: "medium", timeStyle: "short" },
  "datetime-short": { dateStyle: "short", timeStyle: "short" },
  "datetime-seconds": { dateStyle: "medium", timeStyle: "medium" },
  "month-year": { month: "long", year: "numeric" },
  weekday: { weekday: "long" },
};

/** Fraction digits a currency uses (USD/TRY 2, JPY 0, KWD 3). */
export function currencyDigits(currency: string): number {
  return numberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

/** The kit's formatter. Create one with `createFormatter(locale)`; in client components use `useFormat()`. */
export interface Formatter {
  readonly locale: string;
  readonly currencyCode: string;
  readonly timeZone: string;
  /** `1234.5` → "1,234.5" / "1.234,5". Accepts decimal strings exactly ("1250.50"). */
  number(value: NumericInput, options?: Intl.NumberFormatOptions): string;
  /** Money. `currency(1250.5)` uses the default currency; `currency(5, "EUR")` or `currency(5, { currency: "EUR" })`. */
  currency(value: NumericInput, currency?: string | CurrencyOptions, options?: Intl.NumberFormatOptions): string;
  /** Ratio → percent: `0.124` → "12.4%" / "%12,4". Max 1 fraction digit by default. */
  percent(value: number, options?: Intl.NumberFormatOptions): string;
  /** `1234567` → "1.2M" / "1,2 Mn". */
  compact(value: NumericInput, options?: Intl.NumberFormatOptions): string;
  /** Bytes → "1.2 MB" / "1,2 MB". */
  bytes(value: number, options?: BytesOptions): string;
  /** `167` (seconds) → "2m 47s" / "2 dk. 47 sn.". */
  duration(value: number, options?: DurationOptions): string;
  /** Date, instant or `"YYYY-MM-DD"`. Preset name or Intl options. Default `"medium"`. */
  date(value: DateInput, options?: DatePreset | Intl.DateTimeFormatOptions): string;
  /** Shorthand for `date(value, "datetime")`. */
  dateTime(value: DateInput, options?: Intl.DateTimeFormatOptions): string;
  /** "Nov 8 – 12, 2026" / "8–12 Kas 2026". */
  dateRange(start: DateInput, end: DateInput, options?: DatePreset | Intl.DateTimeFormatOptions): string;
  /** Time of an instant, or an `"HH:mm"` string: "9:30 AM" / "09:30". */
  time(value: DateInput, options?: Intl.DateTimeFormatOptions): string;
  /** "3 minutes ago", "yesterday", "in 2 weeks". Also the classic `relative(-1, "day")`. */
  relative(value: DateInput, options?: RelativeOptions): string;
  relative(value: number, unit: Intl.RelativeTimeFormatUnit, options?: Omit<RelativeOptions, "now">): string;
  /** "Ada, Grace, and Linus" / "Ada, Grace ve Linus". */
  list(items: string[], options?: Intl.ListFormatOptions): string;
  /** Counts with a cap: `count(120)` → "99+". */
  count(value: number, max?: number): string;
}

const RELATIVE_STEPS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
  ["week", 4.34524],
  ["month", 12],
  ["year", Infinity],
];

/**
 * Creates a formatter bound to a locale, a default currency and a time zone.
 *
 * ```ts
 * const f = createFormatter("tr-TR", { currency: "TRY", timeZone: "Europe/Istanbul" });
 * f.currency("1250.50"); // "₺1.250,50"
 * f.date("2026-11-08");  // "8 Kas 2026"
 * ```
 */
export function createFormatter(locale = "en-US", options: FormatterOptions = {}): Formatter {
  const currencyCode = options.currency ?? "USD";
  const timeZone = options.timeZone ?? "UTC";
  const lang = locale.split(/[-_]/)[0]!.toLowerCase();

  const dateOptions = (o: DatePreset | Intl.DateTimeFormatOptions | undefined, fallback: DatePreset) =>
    typeof o === "string" ? PRESETS[o] : (o ?? PRESETS[fallback]);

  const formatDate = (value: DateInput, o: Intl.DateTimeFormatOptions) => {
    const { date, calendar } = toDate(value);
    if (Number.isNaN(date.getTime())) return "";
    return dateTimeFormat(locale, { timeZone: calendar ? "UTC" : timeZone, ...o }).format(date);
  };

  const f: Formatter = {
    locale,
    currencyCode,
    timeZone,
    number: (value, o) => numberFormat(locale, o).format(value as number),
    currency(value, cur, o) {
      const opts: CurrencyOptions = typeof cur === "string" ? { ...o, currency: cur } : { ...cur, ...o };
      const { display, currency = currencyCode, ...rest } = opts;
      return numberFormat(locale, { style: "currency", currency, currencyDisplay: display, ...rest }).format(value as number);
    },
    percent: (value, o) => numberFormat(locale, { style: "percent", maximumFractionDigits: 1, ...o }).format(value),
    compact: (value, o) => numberFormat(locale, { notation: "compact", maximumFractionDigits: 1, ...o }).format(value as number),
    bytes(value, o = {}) {
      const base = o.binary ? 1024 : 1000;
      const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte", "petabyte"] as const;
      let i = 0;
      let n = Math.abs(value);
      while (n >= base && i < units.length - 1) {
        n /= base;
        i++;
      }
      return numberFormat(locale, {
        style: "unit",
        unit: units[i],
        unitDisplay: o.unitDisplay ?? "short",
        maximumFractionDigits: i === 0 ? 0 : (o.maximumFractionDigits ?? 1),
      }).format(Math.sign(value) * n || 0);
    },
    duration(value, o = {}) {
      const toSeconds = { ms: 0.001, s: 1, min: 60, h: 3600 }[o.unit ?? "s"];
      let rest = Math.round(Math.abs(value) * toSeconds);
      const style = o.style ?? (lang === "en" ? "narrow" : "short");
      const maxParts = o.maxParts ?? 2;
      const order = [
        ["day", 86400, "d"],
        ["hour", 3600, "h"],
        ["minute", 60, "min"],
        ["second", 1, "s"],
      ] as const;
      const smallestIdx = order.findIndex((u) => u[2] === (o.smallest ?? "s"));
      const parts: string[] = [];
      order.forEach(([unit, size], idx) => {
        if (idx > smallestIdx || parts.length >= maxParts) return;
        const n = idx === smallestIdx ? Math.round(rest / size) : Math.floor(rest / size);
        rest -= n * size;
        if (n > 0 || (idx === smallestIdx && parts.length === 0)) parts.push(numberFormat(locale, { style: "unit", unit, unitDisplay: style }).format(n));
      });
      const text = parts.join(" ");
      return value < 0 ? `-${text}` : text;
    },
    date: (value, o) => formatDate(value, dateOptions(o, "medium")),
    dateTime: (value, o) => formatDate(value, o ?? PRESETS.datetime),
    dateRange(start, end, o) {
      const a = toDate(start);
      const b = toDate(end);
      if (Number.isNaN(a.date.getTime()) || Number.isNaN(b.date.getTime())) return "";
      const calendar = a.calendar && b.calendar;
      const fmt = dateTimeFormat(locale, { timeZone: calendar ? "UTC" : timeZone, ...dateOptions(o, "medium") });
      // ICU versions disagree on the spaces around the dash (Node: thin U+2009, Chrome: plain),
      // which made every server-rendered range a hydration mismatch. Plain spaces everywhere.
      return fmt.formatRange(a.date, b.date).replace(/[\u2009\u202f]/g, " ");
    },
    time: (value, o) => formatDate(value, o ?? { timeStyle: "short" }),
    relative(value: DateInput, unitOrOptions?: Intl.RelativeTimeFormatUnit | RelativeOptions, maybe?: Omit<RelativeOptions, "now">): string {
      if (typeof value === "number" && typeof unitOrOptions === "string") {
        return relativeFormat(locale, { numeric: maybe?.numeric ?? "auto", style: maybe?.style }).format(value, unitOrOptions);
      }
      const o = (unitOrOptions as RelativeOptions | undefined) ?? {};
      const target = toDate(value).date.getTime();
      const now = o.now === undefined ? Date.now() : toDate(o.now).date.getTime();
      if (Number.isNaN(target)) return "";
      let delta = (target - now) / 1000;
      const rtf = relativeFormat(locale, { numeric: o.numeric ?? "auto", style: o.style });
      for (const [unit, step] of RELATIVE_STEPS) {
        if (Math.abs(delta) < step) return rtf.format(Math.round(delta), unit);
        delta /= step;
      }
      return rtf.format(Math.round(delta), "year");
    },
    list: (items, o) => listFormat(locale, { type: "conjunction", ...o }).format(items),
    count: (value, max = 99) => (value > max ? `${numberFormat(locale).format(max)}+` : numberFormat(locale).format(value)),
  } as Formatter;
  return f;
}

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

/** Decimal and group separators of a locale: en-US `{ decimal: ".", group: "," }`, tr-TR `{ decimal: ",", group: "." }`. */
export function numberSeparators(locale = "en-US"): { decimal: string; group: string } {
  const parts = numberFormat(locale).formatToParts(11111.1);
  return {
    decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
    group: parts.find((p) => p.type === "group")?.value ?? ",",
  };
}

const NATIVE_DIGITS: Array<[number, number]> = [
  [0x0660, 0x0669], // Arabic-Indic
  [0x06f0, 0x06f9], // Extended Arabic-Indic (Persian)
  [0x0966, 0x096f], // Devanagari
];
function latinDigits(s: string): string {
  return s.replace(/[\u0660-\u0669\u06f0-\u06f9\u0966-\u096f]/g, (ch) => {
    const c = ch.charCodeAt(0);
    const range = NATIVE_DIGITS.find(([a, b]) => c >= a && c <= b)!;
    return String(c - range[0]);
  });
}

/**
 * Parses user input into a normalised decimal string (`"-1250.5"`), or `null` when it isn't a number.
 * Strict about the locale's separators, lenient about what people actually type:
 *
 * ```ts
 * parseDecimal("1.250,50", "tr-TR"); // "1250.50"
 * parseDecimal("₺1.250", "tr-TR");   // "1250"
 * parseDecimal("12,5", "tr-TR");     // "12.5"
 * parseDecimal("1250.75", "tr-TR");  // "1250.75" (single non-locale separator not followed by 3 digits → decimal)
 * parseDecimal("(42.00)", "en-US");  // "-42.00" (accounting negative)
 * ```
 */
export function parseDecimal(input: string, locale = "en-US"): string | null {
  const { decimal, group } = numberSeparators(locale);
  let s = latinDigits(String(input)).trim();
  if (!s) return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/[\s\u00a0\u202f']/g, "");
  // Drop currency symbols / codes / percent signs around the number (keep the sign).
  s = s.replace(/^[^\d.,\-\u2212]+|[^\d.,\-\u2212]+$/g, "");
  if (/^[-\u2212]|[-\u2212]$/.test(s)) {
    negative = true;
    s = s.replace(/^[-\u2212]|[-\u2212]$/g, "").replace(/^[^\d.,]+|[^\d.,]+$/g, "");
  }
  if (!s || /[^\d.,]/.test(s)) return null;

  let int: string;
  let frac = "";
  const groupChar = group === "\u00a0" || group === "\u202f" || group === "’" ? "" : group;
  if (s.includes(decimal)) {
    const pieces = s.split(decimal);
    if (pieces.length !== 2) return null;
    int = groupChar ? pieces[0]!.split(groupChar).join("") : pieces[0]!;
    frac = pieces[1]!;
    if (/[.,]/.test(int) || /[.,]/.test(frac)) return null;
  } else {
    const other = decimal === "." ? "," : ".";
    const sep = groupChar && s.includes(groupChar) ? groupChar : s.includes(other) ? other : "";
    if (!sep) int = s;
    else {
      const pieces = s.split(sep);
      const grouped = pieces.length > 1 && pieces.slice(1).every((p) => p.length === 3) && pieces[0]!.length > 0 && pieces[0]!.length <= 3;
      if (grouped) int = pieces.join("");
      else if (pieces.length === 2) {
        int = pieces[0]!;
        frac = pieces[1]!;
      } else return null;
    }
  }
  if (!/^\d*$/.test(int) || !/^\d*$/.test(frac) || (!int && !frac)) return null;
  int = int.replace(/^0+(?=\d)/, "") || "0";
  const out = frac ? `${int}.${frac}` : int;
  return negative && /[1-9]/.test(out) ? `-${out}` : out;
}

/**
 * `parseNumber(locale)` returns a parser: `parseNumber("tr-TR")("1.250,5")` → `1250.5`.
 * Prefer `parseDecimal` for money (no float).
 */
export function parseNumber(locale = "en-US"): (input: string) => number | null {
  return (input) => {
    const d = parseDecimal(input, locale);
    return d === null ? null : Number(d);
  };
}

/* ------------------------------------------------------------------ */
/* Decimal strings (money) — exact arithmetic via bigint minor units   */
/* ------------------------------------------------------------------ */

const DECIMAL = /^-?\d+(\.\d+)?$/;

/** `true` for canonical decimal strings: `"12"`, `"-0.5"`, `"1250.50"`. */
export const isDecimalString = (v: unknown): v is string => typeof v === "string" && DECIMAL.test(v);

export type RoundingMode = "half-up" | "half-even" | "down" | "up";

/** Decimal string → integer minor units at `scale` (`"12.345"`, 2 → `1235n` with half-up). */
export function toMinorUnits(value: string | number, scale = 2, rounding: RoundingMode = "half-up"): bigint {
  const s = typeof value === "number" ? value.toFixed(Math.min(20, scale + 2)) : value.trim();
  if (!DECIMAL.test(s)) throw new RangeError(`Not a decimal string: "${value}"`);
  const neg = s.startsWith("-");
  const [i, f = ""] = (neg ? s.slice(1) : s).split(".");
  const kept = BigInt((i ?? "0") + f.slice(0, scale).padEnd(scale, "0"));
  const dropped = f.slice(scale);
  let n = kept;
  if (dropped && /[1-9]/.test(dropped)) {
    const first = Number(dropped[0]);
    const exactHalf = first === 5 && !/[1-9]/.test(dropped.slice(1));
    const roundAway =
      rounding === "up" ||
      (rounding === "half-up" && first >= 5) ||
      (rounding === "half-even" && (first > 5 || (exactHalf ? kept % 2n === 1n : first >= 5)));
    if (roundAway) n += 1n;
  }
  return neg ? -n : n;
}

/** Integer minor units → decimal string with exactly `scale` digits (`1235n`, 2 → `"12.35"`). */
export function fromMinorUnits(minor: bigint, scale = 2): string {
  const neg = minor < 0n;
  const digits = (neg ? -minor : minor).toString().padStart(scale + 1, "0");
  const out = scale ? `${digits.slice(0, -scale)}.${digits.slice(-scale)}` : digits;
  return neg ? `-${out}` : out;
}

/** Round a decimal string to `scale` digits: `roundDecimal("2.345", 2)` → `"2.35"`. */
export const roundDecimal = (value: string, scale = 2, rounding: RoundingMode = "half-up") => fromMinorUnits(toMinorUnits(value, scale, rounding), scale);
/** Exact sum of decimal strings at `scale` digits. */
export const addDecimal = (values: string[], scale = 2) => fromMinorUnits(values.reduce((acc, v) => acc + toMinorUnits(v, scale), 0n), scale);
/** `a - b` at `scale` digits. */
export const subtractDecimal = (a: string, b: string, scale = 2) => fromMinorUnits(toMinorUnits(a, scale) - toMinorUnits(b, scale), scale);

/**
 * `value × factor`, rounded to `scale` (quantity × unit price, VAT rate…). `factor` may be a decimal string.
 *
 * ```ts
 * multiplyDecimal("19.99", "3");    // "59.97"
 * multiplyDecimal("1250.00", "0.20"); // "250.00"
 * ```
 */
export function multiplyDecimal(value: string, factor: string | number, scale = 2, rounding: RoundingMode = "half-up"): string {
  const f = typeof factor === "number" ? String(factor) : factor;
  const fScale = (f.split(".")[1] ?? "").length;
  const vScale = (value.split(".")[1] ?? "").length;
  const product = toMinorUnits(value, vScale) * toMinorUnits(f, fScale);
  return roundDecimal(fromMinorUnits(product, vScale + fScale), scale, rounding);
}

/** -1, 0 or 1. */
export function compareDecimal(a: string, b: string): -1 | 0 | 1 {
  const scale = Math.max((a.split(".")[1] ?? "").length, (b.split(".")[1] ?? "").length);
  const d = toMinorUnits(a, scale) - toMinorUnits(b, scale);
  return d === 0n ? 0 : d < 0n ? -1 : 1;
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

/** Estimated reading time in whole minutes (min 1) for text or a word count. Default 220 wpm. */
export function readingMinutes(textOrWords: string | number, wordsPerMinute = 220): number {
  const n = typeof textOrWords === "number" ? textOrWords : (textOrWords.trim().match(/\S+/g)?.length ?? 0);
  return Math.max(1, Math.round(n / wordsPerMinute));
}

/** Local calendar date → `"YYYY-MM-DD"` (never `toISOString()`, which shifts the day at UTC+3). */
export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** `"YYYY-MM-DD"` → a local-midnight `Date` (for date pickers). Returns `null` for invalid input. */
export function fromISODate(s: string): Date | null {
  const m = DATE_ONLY.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
}

