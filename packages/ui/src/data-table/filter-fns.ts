/**
 * Client-side filter semantics — the reference a server implementation must match.
 * React-free. Text matching folds case and diacritics by locale (Turkish İ/ı aware).
 *
 * | op | meaning |
 * |---|---|
 * | contains / notContains / startsWith | folded substring / prefix |
 * | eq / neq | text: folded equality · number: `===` · boolean: `===` · enum: single value |
 * | gt gte lt lte | numeric comparison |
 * | between | inclusive on both ends (numbers and dates) |
 * | in / notIn | the row value (or any of its values, for tags) is / is not in the set |
 * | on / before / after | calendar day in `timeZone` (a datetime on that day matches `on`) |
 * | relative | `RelativeDate` resolved against `now` at query time |
 * | isEmpty / isNotEmpty | `null`, `undefined`, `""` or `[]` |
 */
import { foldText } from "../lib/text";
import type { Formatter } from "../format/core";
import {
  ME,
  fieldOps,
  isClauseComplete,
  isFilterGroup,
  type FieldType,
  type FilterClause,
  type FilterFieldDef,
  type FilterGroup,
  type FilterOp,
  type FilterOption,
  type RelativeDate,
} from "./types";

export interface FilterContext {
  /** BCP 47 locale for text folding. Default "en-US". */
  locale?: string;
  /** IANA zone for calendar-day comparisons. Default "UTC". */
  timeZone?: string;
  /** Reference time for `relative`. Default `new Date()`. */
  now?: Date;
  /** Current user id; replaces `"$me"` in user clauses. */
  me?: string;
  /** First day of the week (0 = Sunday). Default: from the locale (en-US Sunday, else Monday). */
  weekStartsOn?: number;
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const dayFormats = new Map<string, Intl.DateTimeFormat>();

/** The calendar day (`YYYY-MM-DD`) of a value in `timeZone`. Date-only strings pass through. */
export function dayKey(value: unknown, timeZone = "UTC"): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" && DATE_ONLY.test(value)) return value;
  const d = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(d.getTime())) return null;
  let fmt = dayFormats.get(timeZone);
  if (!fmt) dayFormats.set(timeZone, (fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })));
  return fmt.format(d);
}

const ymdToUTC = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
};
const utcToYmd = (d: Date) => d.toISOString().slice(0, 10);

/** `addDays("2026-11-10", -7)` → `"2026-11-03"`. Pure calendar arithmetic (no DST drift). */
export function addDays(ymd: string, days: number): string {
  const d = ymdToUTC(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return utcToYmd(d);
}

function addMonths(ymd: string, months: number): string {
  const d = ymdToUTC(ymd);
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  return utcToYmd(d);
}

/** First day of the week for a locale: 0 (Sunday) for US/CA/JP…, 1 (Monday) elsewhere. */
export function weekStartFor(locale = "en-US"): number {
  try {
    const info = (new Intl.Locale(locale) as Intl.Locale & { weekInfo?: { firstDay: number }; getWeekInfo?: () => { firstDay: number } });
    const first = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay;
    if (first) return first % 7;
  } catch {
    /* fall through */
  }
  return /-(US|CA|JP|BR|MX|IL|PH|KR|TW|HK|IN)\b/i.test(locale) || locale === "en" ? 0 : 1;
}

/** Inclusive `{ start, end }` calendar days for a relative date. */
export function resolveRelativeDate(r: RelativeDate, ctx: FilterContext = {}): { start: string; end: string } {
  const today = dayKey(ctx.now ?? new Date(), ctx.timeZone ?? "UTC")!;
  if (typeof r === "object") {
    const n = Math.max(1, Math.floor(r.last));
    if (r.unit === "day") return { start: addDays(today, -(n - 1)), end: today };
    if (r.unit === "week") return { start: addDays(today, -(n * 7 - 1)), end: today };
    const start = ymdToUTC(today);
    start.setUTCMonth(start.getUTCMonth() - n);
    return { start: addDays(utcToYmd(start), 1), end: today };
  }
  const weekStart = ctx.weekStartsOn ?? weekStartFor(ctx.locale);
  const monthStart = today.slice(0, 8) + "01";
  switch (r) {
    case "today":
      return { start: today, end: today };
    case "yesterday": {
      const y = addDays(today, -1);
      return { start: y, end: y };
    }
    case "this_week": {
      const dow = ymdToUTC(today).getUTCDay();
      const start = addDays(today, -((dow - weekStart + 7) % 7));
      return { start, end: addDays(start, 6) };
    }
    case "last_7_days":
      return { start: addDays(today, -6), end: today };
    case "last_30_days":
      return { start: addDays(today, -29), end: today };
    case "last_90_days":
      return { start: addDays(today, -89), end: today };
    case "this_month":
      return { start: monthStart, end: addDays(addMonths(monthStart, 1), -1) };
    case "last_month": {
      const start = addMonths(monthStart, -1);
      return { start, end: addDays(monthStart, -1) };
    }
    case "this_quarter": {
      const m = Number(today.slice(5, 7));
      const qStart = `${today.slice(0, 4)}-${String(Math.floor((m - 1) / 3) * 3 + 1).padStart(2, "0")}-01`;
      return { start: qStart, end: addDays(addMonths(qStart, 3), -1) };
    }
    case "this_year":
      return { start: `${today.slice(0, 4)}-01-01`, end: `${today.slice(0, 4)}-12-31` };
  }
}

/* ------------------------------------------------------------------ */
/* Clause evaluation                                                   */
/* ------------------------------------------------------------------ */

const isEmptyValue = (v: unknown) => v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Scalar key of an option-like value (`"won"`, `{ id: "u_1" }`, `{ value: "x" }`). */
const keyOf = (v: unknown): string => {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return String(o.id ?? o.value ?? o.name ?? "");
  }
  return String(v);
};

const valuesOf = (v: unknown): string[] => (Array.isArray(v) ? v.map(keyOf) : isEmptyValue(v) ? [] : [keyOf(v)]);

const textOf = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.map(textOf).join(" ");
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return String(o.name ?? o.label ?? o.value ?? o.id ?? "");
  }
  return String(v);
};

/** Reads a field's value from a row (`accessor` or `row[field]`). */
export const readField = (row: unknown, field: FilterFieldDef | undefined, name: string): unknown =>
  field?.accessor ? field.accessor(row) : (row as Record<string, unknown> | null)?.[name];

/** Evaluates one complete clause against a raw value. */
export function matchClause(value: unknown, clause: FilterClause, type: FieldType, ctx: FilterContext = {}): boolean {
  const { op } = clause;
  const locale = ctx.locale ?? "en-US";
  const tz = ctx.timeZone ?? "UTC";
  if (op === "isEmpty") return isEmptyValue(value);
  if (op === "isNotEmpty") return !isEmptyValue(value);
  let target = clause.value;
  if (type === "user" && ctx.me) {
    if (target === ME) target = ctx.me;
    else if (Array.isArray(target)) target = target.map((t) => (t === ME ? ctx.me : t));
  }

  switch (type) {
    case "number":
    case "currency":
    case "percent": {
      const n = toNumber(value);
      if (op === "between") {
        const [a, b] = (target as unknown[]).map(toNumber);
        return n !== null && a != null && b != null && n >= Math.min(a, b) && n <= Math.max(a, b);
      }
      const t = toNumber(target);
      if (n === null || t === null) return op === "neq";
      return op === "eq" ? n === t : op === "neq" ? n !== t : op === "gt" ? n > t : op === "gte" ? n >= t : op === "lt" ? n < t : op === "lte" ? n <= t : false;
    }
    case "date":
    case "datetime": {
      const day = dayKey(value, tz);
      if (day === null) return false;
      if (op === "relative") {
        const { start, end } = resolveRelativeDate(target as RelativeDate, ctx);
        return day >= start && day <= end;
      }
      if (op === "between") {
        const [a, b] = (target as unknown[]).map((x) => dayKey(x, tz));
        if (!a || !b) return false;
        return day >= (a < b ? a : b) && day <= (a < b ? b : a);
      }
      const t = dayKey(target, tz);
      if (!t) return false;
      return op === "on" || op === "eq" ? day === t : op === "before" || op === "lt" ? day < t : op === "after" || op === "gt" ? day > t : op === "lte" ? day <= t : op === "gte" ? day >= t : false;
    }
    case "boolean": {
      const t = target === true || target === "true";
      return Boolean(value) === t ? op !== "neq" : op === "neq";
    }
    case "enum":
    case "user":
    case "tags": {
      const have = valuesOf(value);
      const set = valuesOf(target);
      if (op === "in" || op === "eq") return have.some((h) => set.includes(h));
      if (op === "notIn" || op === "neq") return !have.some((h) => set.includes(h));
      if (op === "contains") return have.some((h) => foldText(h, locale).includes(foldText(String(target), locale)));
      return false;
    }
    case "text":
    default: {
      const v = foldText(textOf(value), locale);
      const t = foldText(String(target ?? ""), locale);
      if (op === "contains") return v.includes(t);
      if (op === "notContains") return !v.includes(t);
      if (op === "startsWith") return v.startsWith(t);
      if (op === "eq") return v === t;
      if (op === "neq") return v !== t;
      if (op === "in") return valuesOf(target).some((x) => foldText(x, locale) === v);
      return false;
    }
  }
}

function matchGroup(row: unknown, g: FilterGroup, byField: Map<string, FilterFieldDef>, ctx: FilterContext): boolean {
  const results: boolean[] = [];
  for (const c of g.clauses) {
    if (isFilterGroup(c)) {
      if (c.clauses.length) results.push(matchGroup(row, c, byField, ctx));
      continue;
    }
    const field = byField.get(c.field);
    if (!field || !isClauseComplete(c) || !fieldOps(field).includes(c.op)) continue; // unknown / incomplete clauses are ignored
    results.push(matchClause(readField(row, field, c.field), c, field.type, ctx));
  }
  if (results.length === 0) return true;
  return g.logic === "or" ? results.some(Boolean) : results.every(Boolean);
}

/**
 * Filters rows by a group. Unknown fields, invalid operators and incomplete clauses are skipped
 * (the same rule the URL parser applies), so a half-built chip never empties the list.
 *
 * ```ts
 * applyFilters(deals, { logic: "and", clauses: [{ id: "a", field: "stage", op: "in", value: ["won"] }] }, fields, { locale: "en-US" });
 * ```
 */
export function applyFilters<T>(rows: readonly T[], group: FilterGroup, fields: FilterFieldDef[], ctx: FilterContext = {}): T[] {
  if (!group.clauses.length) return rows.slice();
  const byField = new Map(fields.map((f) => [f.field, f]));
  return rows.filter((row) => matchGroup(row, group, byField, ctx));
}

/** Global search: every word of `q` must occur in one of the row's searchable texts (folded). */
export function searchRows<T>(rows: readonly T[], q: string, getText: (row: T) => string, locale = "en-US"): T[] {
  const words = foldText(q.trim(), locale).split(/\s+/).filter(Boolean);
  if (!words.length) return rows.slice();
  return rows.filter((row) => {
    const hay = foldText(getText(row), locale);
    return words.every((w) => hay.includes(w));
  });
}

/** `true` when a group has at least one complete clause. */
export function hasActiveFilters(g: FilterGroup): boolean {
  return g.clauses.some((c) => (isFilterGroup(c) ? hasActiveFilters(c) : isClauseComplete(c)));
}

/* ------------------------------------------------------------------ */
/* Describing                                                          */
/* ------------------------------------------------------------------ */

/** English operator phrases. Every key is overridable through the Filter bar's `labels`. */
export const filterOpLabels: Record<FilterOp, string> = {
  contains: "contains",
  notContains: "does not contain",
  eq: "is",
  neq: "is not",
  startsWith: "starts with",
  isEmpty: "is empty",
  isNotEmpty: "is not empty",
  gt: "greater than",
  gte: "at least",
  lt: "less than",
  lte: "at most",
  between: "between",
  in: "is any of",
  notIn: "is none of",
  before: "before",
  after: "after",
  on: "on",
  relative: "in",
};

export const relativeDateLabels: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This week",
  last_7_days: "Last 7 days",
  last_30_days: "Last 30 days",
  last_90_days: "Last 90 days",
  this_month: "This month",
  last_month: "Last month",
  this_quarter: "This quarter",
  this_year: "This year",
};

export interface DescribeLabels {
  ops?: Partial<Record<FilterOp, string>>;
  relative?: Partial<Record<string, string>>;
  /** "Last {count} days" etc. */
  lastN?: (n: number, unit: "day" | "week" | "month") => string;
  yes?: string;
  no?: string;
  me?: string;
  /** Joiner for `between`: "{from} and {to}". */
  range?: (from: string, to: string) => string;
  and?: string;
  or?: string;
}

const staticOptions = (f: FilterFieldDef): FilterOption[] => (Array.isArray(f.options) ? f.options : []);

/** Human text of a clause's value: "Proposal, Won", "$5,000", "Last 30 days". */
export function describeValue(clause: FilterClause, field: FilterFieldDef, format: Formatter, labels: DescribeLabels = {}, optionCache?: Map<string, string>): string {
  const v = clause.value;
  if (v === undefined || v === null || v === "") return "";
  const fmtScalar = (x: unknown): string => {
    if (x === ME) return labels.me ?? "Me";
    switch (field.type) {
      case "currency":
        return toNumber(x) === null ? String(x) : format.currency(x as number | string, field.currency);
      case "number":
        return toNumber(x) === null ? String(x) : format.number(x as number);
      case "percent":
        return toNumber(x) === null ? String(x) : format.percent(Number(x));
      case "date":
      case "datetime":
        return format.date(x as string);
      case "boolean":
        return x === true || x === "true" ? (labels.yes ?? "Yes") : (labels.no ?? "No");
      case "enum":
      case "user":
      case "tags": {
        const key = keyOf(x);
        return staticOptions(field).find((o) => o.value === key)?.label ?? optionCache?.get(key) ?? key;
      }
      default:
        return String(x);
    }
  };
  if (clause.op === "relative") {
    const r = v as RelativeDate;
    if (typeof r === "string") return labels.relative?.[r] ?? relativeDateLabels[r] ?? r;
    return labels.lastN ? labels.lastN(r.last, r.unit) : `Last ${r.last} ${r.unit}${r.last === 1 ? "" : "s"}`;
  }
  if (clause.op === "between" && Array.isArray(v)) {
    const [a, b] = v.map(fmtScalar);
    return labels.range ? labels.range(a!, b!) : `${a} – ${b}`;
  }
  if (Array.isArray(v)) return format.list(v.map(fmtScalar), { type: "disjunction" });
  return fmtScalar(v);
}

/**
 * One line of text for a filter group: `Stage is any of Proposal or Won and Value at least $5,000`.
 * Used for announcements, saved-view tooltips and export headers.
 */
export function describeFilters(g: FilterGroup, fields: FilterFieldDef[], format: Formatter, labels: DescribeLabels = {}): string {
  const byField = new Map(fields.map((f) => [f.field, f]));
  const parts: string[] = [];
  for (const c of g.clauses) {
    if (isFilterGroup(c)) {
      const inner = describeFilters(c, fields, format, labels);
      if (inner) parts.push(`(${inner})`);
      continue;
    }
    const f = byField.get(c.field);
    if (!f || !isClauseComplete(c)) continue;
    const op = labels.ops?.[c.op] ?? filterOpLabels[c.op];
    const value = describeValue(c, f, format, labels);
    parts.push([f.label, op, value].filter(Boolean).join(" "));
  }
  return parts.join(` ${g.logic === "or" ? (labels.or ?? "or") : (labels.and ?? "and")} `);
}
