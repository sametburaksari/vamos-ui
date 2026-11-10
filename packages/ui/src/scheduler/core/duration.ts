/**
 * Time tracking core: duration parsing / formatting, entry totals and the bridge to invoice
 * line items. React-free; identical results on server and client.
 */
import { addDecimal, multiplyDecimal, roundHalfUp } from "../../locale-data/core/decimal";

export interface TimeEntry {
  id: string;
  /** UTC ISO instant. */
  start: string;
  /** UTC ISO instant; absent while the timer runs. */
  end?: string;
  /** Overrides `end - start` (manual entries). */
  durationMin?: number;
  projectId?: string;
  /** Display name of the project (denormalised for lists and invoices). */
  projectLabel?: string;
  taskId?: string;
  taskLabel?: string;
  note?: string;
  billable?: boolean;
  /** Hourly rate. `amount` is a decimal string. */
  rate?: { amount: string; currency: string };
}

/** A draft line for Line items (01): quantity in hours, decimal strings throughout. */
export interface LineItemDraft {
  description: string;
  /** Hours, 2 decimals ("3.25"). */
  quantity: string;
  /** UN/ECE Rec 20 unit code: `HUR` (hour). */
  unitCode: "HUR";
  unitPrice: string;
  currency: string;
  /** quantity × unitPrice, rounded half-up to 2 places. */
  total: string;
  /** Ids of the entries folded into this line. */
  entryIds: string[];
}

const UNIT_WORDS: Record<string, "h" | "m"> = {
  h: "h", hr: "h", hrs: "h", hour: "h", hours: "h", sa: "h", saat: "h", std: "h",
  m: "m", min: "m", mins: "m", minute: "m", minutes: "m", dk: "m", dak: "m", dakika: "m", mn: "m",
};

/**
 * Parses what people type into a timesheet cell. Returns minutes, or `null` when it can't be read.
 *
 * ```ts
 * parseDuration("1.5", "en-US");      // 90   (bare numbers are hours)
 * parseDuration("1,5", "tr-TR");      // 90   (decimal comma where the locale uses it)
 * parseDuration("1:30");              // 90
 * parseDuration("90m");               // 90
 * parseDuration("1h 30m");            // 90
 * parseDuration("1 sa 30 dk", "tr");  // 90
 * parseDuration("");                  // 0    (cleared)
 * ```
 */
export function parseDuration(input: string, locale = "en-US"): number | null {
  const raw = input.trim().toLocaleLowerCase(locale.startsWith("tr") ? "tr-TR" : "en-US");
  if (raw === "" || raw === "-" || raw === "–") return 0;
  const commaDecimal = decimalSeparator(locale) === ",";
  // h:mm
  const clock = /^(\d{1,3}):([0-5]?\d)$/.exec(raw);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const num = (s: string): number | null => {
    let t = s;
    if (commaDecimal) t = t.replace(/\./g, "").replace(",", ".");
    else t = t.replace(/,/g, ".");
    if (!/^\d+(\.\d+)?$|^\.\d+$/.test(t)) return null;
    return Number(t);
  };
  // bare number → hours
  const bare = num(raw);
  if (bare !== null) return Math.round(bare * 60);
  // unit tokens: "1h 30m", "1.5h", "90 min", "1 sa 30 dk"
  const re = /(\d+(?:[.,]\d+)?)\s*([a-zçğıöşü]+)\.?/g;
  let total = 0;
  let consumed = "";
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const unit = UNIT_WORDS[m[2]!];
    if (!unit) return null;
    const value = Number(m[1]!.replace(",", "."));
    total += unit === "h" ? value * 60 : value;
    consumed += m[0];
  }
  if (!consumed || consumed.replace(/\s+/g, "") !== raw.replace(/\s+/g, "")) return null;
  return Math.round(total);
}

function decimalSeparator(locale: string): string {
  try {
    return new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === "decimal")?.value ?? ".";
  } catch {
    return ".";
  }
}

const FALLBACK_UNITS: Record<string, { h: string; m: string }> = {
  en: { h: "h", m: "min" },
  tr: { h: "sa", m: "dk" },
  de: { h: "Std.", m: "Min." },
};

/**
 * Formats minutes for display.
 *
 * - `"short"` (default): "3 h 20 min" / "3 sa 20 dk" (built-in for en / tr / de, Intl.DurationFormat for other locales when available).
 * - `"clock"`: "3:20".
 * - `"decimal"`: "3.33" / "3,33" hours.
 */
export function formatDuration(min: number, locale = "en-US", style: "short" | "clock" | "decimal" = "short"): string {
  const sign = min < 0 ? "−" : "";
  const abs = Math.round(Math.abs(min));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (style === "clock") return `${sign}${h}:${String(m).padStart(2, "0")}`;
  if (style === "decimal") return sign + new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(abs / 60);
  const known = FALLBACK_UNITS[locale.slice(0, 2).toLowerCase()];
  // Known languages use the dictionary so server and browser render the same text (no
  // hydration drift between runtimes with and without Intl.DurationFormat).
  const DF = (Intl as unknown as { DurationFormat?: new (l: string, o: object) => { format(d: object): string } }).DurationFormat;
  if (!known && DF) {
    try {
      return sign + new DF(locale, { style: "short" }).format(h && m ? { hours: h, minutes: m } : h ? { hours: h } : { minutes: m });
    } catch {
      /* fall through */
    }
  }
  const u = FALLBACK_UNITS[locale.slice(0, 2).toLowerCase()] ?? FALLBACK_UNITS.en!;
  const nf = new Intl.NumberFormat(locale);
  if (h && m) return `${sign}${nf.format(h)} ${u.h} ${nf.format(m)} ${u.m}`;
  if (h) return `${sign}${nf.format(h)} ${u.h}`;
  return `${sign}${nf.format(m)} ${u.m}`;
}

/** Minutes of an entry (running entries count up to `now`). */
export function entryMinutes(e: Pick<TimeEntry, "start" | "end" | "durationMin">, now: number = Date.now()): number {
  if (typeof e.durationMin === "number") return e.durationMin;
  const s = Date.parse(e.start);
  const en = e.end ? Date.parse(e.end) : now;
  return Math.max(0, Math.round((en - s) / 60_000));
}

/** Sums a timesheet value map: per row, per day and the grand total. */
export function timesheetTotals(value: Record<string, Record<string, number>>, days: readonly string[]): { rows: Record<string, number>; days: Record<string, number>; total: number } {
  const rows: Record<string, number> = {};
  const dayTotals: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
  let total = 0;
  for (const [rowId, cells] of Object.entries(value)) {
    let r = 0;
    for (const d of days) {
      const v = cells[d] ?? 0;
      r += v;
      dayTotals[d] = (dayTotals[d] ?? 0) + v;
    }
    rows[rowId] = r;
    total += r;
  }
  return { rows, days: dayTotals, total };
}

/**
 * Billable entries → invoice line drafts, one line per project (or task) and rate.
 * Hours are rounded half-up to 2 decimals per line; amounts stay decimal strings.
 *
 * ```ts
 * toLineItems(entries, "project");
 * // [{ description: "Mobile app", quantity: "3.33", unitCode: "HUR", unitPrice: "95.00", currency: "EUR", total: "316.35", … }]
 * ```
 */
export function toLineItems(entries: readonly TimeEntry[], groupBy: "project" | "task" = "project", opts: { now?: number; describe?(key: { project?: string; task?: string }): string } = {}): LineItemDraft[] {
  const groups = new Map<string, { project?: string; task?: string; minutes: number; rate: { amount: string; currency: string }; ids: string[] }>();
  for (const e of entries) {
    if (!e.billable || !e.rate) continue;
    const project = e.projectLabel ?? e.projectId;
    const task = e.taskLabel ?? e.taskId;
    const key = `${groupBy === "task" ? `${project}\u0000${task}` : project}\u0000${e.rate.amount}\u0000${e.rate.currency}`;
    const g = groups.get(key) ?? { project, task: groupBy === "task" ? task : undefined, minutes: 0, rate: e.rate, ids: [] };
    g.minutes += entryMinutes(e, opts.now);
    g.ids.push(e.id);
    groups.set(key, g);
  }
  return [...groups.values()].map((g) => {
    const quantity = roundHalfUp(String(g.minutes / 60), 2);
    const description = opts.describe ? opts.describe({ project: g.project, task: g.task }) : [g.project, g.task].filter(Boolean).join(" · ") || "Time";
    return {
      description,
      quantity,
      unitCode: "HUR" as const,
      unitPrice: roundHalfUp(g.rate.amount, 2),
      currency: g.rate.currency,
      total: multiplyDecimal(quantity, g.rate.amount, 2),
      entryIds: g.ids,
    };
  });
}

/** Sum of line totals (decimal string). */
export const lineItemsTotal = (lines: readonly LineItemDraft[]): string => (lines.length ? addDecimal(...lines.map((l) => l.total)) : "0.00");
