/**
 * Line items maths — React-free, exact. Every amount is a decimal string in and out; the work is
 * done in BigInt minor units with half-up rounding, so totals never drift by a cent.
 *
 * Tax is generic: a `LineTaxPack` lists rates and optional withholding codes (X8). The `tr`
 * pack (`trLineTaxPack`) is built from the KDV data in `@vamos-ui/react/locale-data`.
 */
import { fromUnits, mulDivRound, toUnits } from "../locale-data/core/decimal";
import { activeTaxRates, allocateProRata, trKdv } from "../locale-data/tr/kdv";
import type { TaxScheme } from "../locale-data/core/types";

export type LineDiscountType = "percent" | "amount";

export interface LineDiscount {
  type: LineDiscountType;
  /** Decimal string: "10" (percent) or "250.00" (amount). */
  value: string;
}

export interface LineItem {
  /** Stable row id. */
  id: string;
  /** Picked record (product / service) id. */
  itemId?: string;
  description: string;
  /** Decimal string ("2", "1.5"). */
  quantity: string;
  unit?: string;
  /** Decimal string, net or gross depending on `pricesIncludeTax`. */
  unitPrice: string;
  discount?: LineDiscount;
  /** Percent as a decimal string ("20"). */
  taxRate?: string;
  /** Withholding code from the tax pack ("602" = 9/10 in the tr pack). Generic, not country-specific. */
  withholding?: string;
}

export interface LineTaxRate {
  /** Percent as a decimal string ("20"). */
  value: string;
  label: string;
}

export interface LineWithholding {
  code: string;
  label: string;
  /** Share of the tax that is withheld: [9, 10] = 9/10. */
  ratio: [number, number];
}

/** Locale tax rules for line items: rates, labels, withholding codes and rounding. */
export interface LineTaxPack {
  id: string;
  /** Short tax name used in labels ("VAT", "KDV", "GST"). */
  name: string;
  rates: LineTaxRate[];
  withholding?: LineWithholding[];
  /** `"line"`: round tax per line (tr e-invoice). `"document"`: round once per rate. */
  rounding: "line" | "document";
  /** Rate used for new rows. */
  defaultRate?: string;
}

/** A generic VAT pack — handy defaults for docs and prototypes. */
export const vatLineTaxPack: LineTaxPack = {
  id: "vat",
  name: "VAT",
  rates: [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "20", label: "20%" },
  ],
  rounding: "line",
  defaultRate: "20",
};

/**
 * Turkish KDV pack from the locale data: rates in force on `date` (0 / 1 / 10 / 20 since July
 * 2023), tevkifat codes as withholding, line rounding.
 *
 * ```ts
 * const pack = trLineTaxPack("2026-11-10"); // rates 0, 1, 10, 20 · withholding 601, 602, 604
 * ```
 */
export function trLineTaxPack(date = "2026-01-01", scheme: TaxScheme = trKdv, options: { localLabels?: boolean } = {}): LineTaxPack {
  return {
    id: scheme.id,
    name: "KDV",
    rates: activeTaxRates(scheme, date).map((r) => ({ value: String(r.value), label: `%${r.value}` })),
    withholding: scheme.withholding?.map((w) => ({
      code: w.code,
      label: `${w.code} · ${w.ratio[0]}/${w.ratio[1]} ${options.localLabels && w.localLabel ? w.localLabel : w.label}`,
      ratio: w.ratio,
    })),
    rounding: scheme.rounding,
    defaultRate: "20",
  };
}

export interface LineResult {
  id: string;
  /** quantity × unit price (before any discount). */
  amount: string;
  /** Row discount. */
  discount: string;
  /** Share of the document discount. */
  documentDiscount: string;
  /** Taxable base after both discounts. */
  net: string;
  tax: string;
  /** net + tax. */
  total: string;
  withheld: string;
  /** Missing / unparsable quantity or price. */
  invalid: boolean;
}

export interface LineTotals {
  lines: LineResult[];
  /** Sum of row amounts before discounts (net of tax). */
  subtotal: string;
  /** Row discounts + document discount (net of tax). */
  discount: string;
  /** Taxable base. */
  net: string;
  byRate: { rate: string; base: string; tax: string }[];
  withholding: { code: string; ratio: [number, number]; tax: string; withheld: string }[];
  tax: string;
  /** net + tax. */
  total: string;
  withheld: string;
  /** total − withheld. */
  payable: string;
  /** Rows that couldn't be calculated. */
  invalidCount: number;
}

export interface ComputeLineTotalsOptions {
  /** Unit prices include tax (retail). Default `false`. */
  pricesIncludeTax?: boolean;
  documentDiscount?: LineDiscount;
  taxPack?: LineTaxPack;
  /** Money scale. Default 2. */
  precision?: number;
}

const RS = 4; // rate scale
const HUNDRED = 100n * 10n ** BigInt(RS);

function safeUnits(v: string | undefined, scale: number): bigint | null {
  if (v == null || v.trim() === "") return null;
  try {
    return toUnits(v, scale);
  } catch {
    return null;
  }
}

/** True when a row has a parsable quantity and price. */
export function isLineValid(row: LineItem): boolean {
  return safeUnits(row.quantity, 6) !== null && safeUnits(row.unitPrice, 6) !== null;
}

/** "2" × "1450.00" → "2900.00", exact. */
function lineAmount(qty: string, price: string, scale: number): bigint {
  const QS = 6;
  const q = toUnits(qty, QS);
  const p = toUnits(price, QS);
  return mulDivRound(q * p, 10n ** BigInt(scale), 10n ** BigInt(QS * 2));
}

function discountUnits(base: bigint, d: LineDiscount | undefined, scale: number): bigint {
  if (!d) return 0n;
  const v = safeUnits(d.value, d.type === "percent" ? RS : scale);
  if (v === null || v <= 0n) return 0n;
  const out = d.type === "percent" ? mulDivRound(base, v, HUNDRED) : v;
  const abs = base < 0n ? -base : base;
  return out > abs ? abs : out;
}

/**
 * Totals for a list of rows: per line, per tax rate and per withholding code. Prices can be
 * net or tax-inclusive; a document discount is allocated pro-rata to the line bases.
 *
 * ```ts
 * computeLineTotals([{ id: "1", description: "Consulting", quantity: "10", unitPrice: "100", taxRate: "20", withholding: "602" }], { taxPack: trLineTaxPack() });
 * // net "1000.00", tax "200.00", total "1200.00", withheld "180.00", payable "1020.00"
 * ```
 */
export function computeLineTotals(rows: LineItem[], options: ComputeLineTotalsOptions = {}): LineTotals {
  const S = options.precision ?? 2;
  const pack = options.taxPack;
  const inclusive = !!options.pricesIncludeTax;
  const rateOf = (r: LineItem) => safeUnits(r.taxRate ?? pack?.defaultRate ?? "0", RS) ?? 0n;
  const ratioOf = (code?: string) => (code ? pack?.withholding?.find((w) => w.code === code)?.ratio : undefined);

  // 1. amount, row discount, and the net before the document discount
  const pre = rows.map((r) => {
    const valid = isLineValid(r);
    const amount = valid ? lineAmount(r.quantity, r.unitPrice, S) : 0n;
    const disc = discountUnits(amount, r.discount, S);
    const afterDisc = amount - disc;
    const rate = rateOf(r);
    // net of tax
    const toNet = (x: bigint) => (inclusive ? mulDivRound(x, HUNDRED, HUNDRED + rate) : x);
    return { r, valid, amount, disc, afterDisc, rate, amountNet: toNet(amount), discNet: toNet(amount) - toNet(afterDisc), net: toNet(afterDisc) };
  });

  // 2. document discount, allocated pro-rata to line nets
  const sumNet = pre.reduce((s, p) => s + p.net, 0n);
  const docTotal = discountUnits(sumNet, options.documentDiscount, S);
  const shares =
    docTotal > 0n && pre.length
      ? allocateProRata(fromUnits(docTotal, S), pre.map((p) => fromUnits(p.net, S))).map((s) => toUnits(s, S))
      : pre.map(() => 0n);

  // 3. tax per line
  const lines: LineResult[] = pre.map((p, i) => {
    const docShare = shares[i] ?? 0n;
    const net = p.net - docShare;
    // Tax-inclusive without a document discount: keep the entered gross exactly.
    const tax = inclusive && docShare === 0n ? p.afterDisc - p.net : mulDivRound(net, p.rate, HUNDRED);
    const ratio = ratioOf(p.r.withholding);
    const withheld = ratio ? mulDivRound(tax, BigInt(ratio[0]), BigInt(ratio[1])) : 0n;
    return {
      id: p.r.id,
      amount: fromUnits(p.amountNet, S),
      discount: fromUnits(p.discNet, S),
      documentDiscount: fromUnits(docShare, S),
      net: fromUnits(net, S),
      tax: fromUnits(tax, S),
      total: fromUnits(net + tax, S),
      withheld: fromUnits(withheld, S),
      invalid: !p.valid,
    };
  });

  // 4. per-rate and per-code groups
  const rateMap = new Map<string, { units: bigint; base: bigint; tax: bigint }>();
  const whMap = new Map<string, { ratio: [number, number]; tax: bigint; withheld: bigint }>();
  pre.forEach((p, i) => {
    if (!p.valid) return;
    const key = fromUnits(p.rate, RS).replace(/\.?0+$/, "") || "0";
    const g = rateMap.get(key) ?? { units: p.rate, base: 0n, tax: 0n };
    g.base += toUnits(lines[i]!.net, S);
    g.tax += toUnits(lines[i]!.tax, S);
    rateMap.set(key, g);
    const ratio = ratioOf(p.r.withholding);
    if (ratio && p.r.withholding) {
      const w = whMap.get(p.r.withholding) ?? { ratio, tax: 0n, withheld: 0n };
      w.tax += toUnits(lines[i]!.tax, S);
      w.withheld += toUnits(lines[i]!.withheld, S);
      whMap.set(p.r.withholding, w);
    }
  });
  if (pack?.rounding === "document" && !inclusive) {
    for (const g of rateMap.values()) g.tax = mulDivRound(g.base, g.units, HUNDRED);
    for (const w of whMap.values()) w.withheld = mulDivRound(w.tax, BigInt(w.ratio[0]), BigInt(w.ratio[1]));
  }

  const subtotal = pre.reduce((s, p) => s + p.amountNet, 0n);
  const net = [...rateMap.values()].reduce((s, g) => s + g.base, 0n);
  const tax = [...rateMap.values()].reduce((s, g) => s + g.tax, 0n);
  const withheld = [...whMap.values()].reduce((s, w) => s + w.withheld, 0n);
  return {
    lines,
    subtotal: fromUnits(subtotal, S),
    discount: fromUnits(subtotal - net, S),
    net: fromUnits(net, S),
    byRate: [...rateMap]
      .sort((a, b) => (b[1].units > a[1].units ? 1 : b[1].units < a[1].units ? -1 : 0))
      .map(([rate, g]) => ({ rate, base: fromUnits(g.base, S), tax: fromUnits(g.tax, S) })),
    withholding: [...whMap].map(([code, w]) => ({ code, ratio: w.ratio, tax: fromUnits(w.tax, S), withheld: fromUnits(w.withheld, S) })),
    tax: fromUnits(tax, S),
    total: fromUnits(net + tax, S),
    withheld: fromUnits(withheld, S),
    payable: fromUnits(net + tax - withheld, S),
    invalidCount: lines.filter((l) => l.invalid).length,
  };
}

let seq = 0;
/** A fresh row id ("li-…"). */
export function createLineId(): string {
  seq += 1;
  return `li-${Date.now().toString(36)}-${seq.toString(36)}`;
}

/** A blank row with the pack's default rate. */
export function createLineItem(partial: Partial<LineItem> = {}, pack?: LineTaxPack): LineItem {
  return { id: createLineId(), description: "", quantity: "1", unitPrice: "", taxRate: pack?.defaultRate, ...partial };
}
