/**
 * Turkish VAT (KDV): rates, exemption and withholding (tevkifat) codes, and exact decimal
 * helpers for net / gross / VAT, withholding, document discounts and per-rate breakdowns.
 *
 * Rates are dated data: 0 / 1 / 10 / 20 % since 10 July 2023 (Presidential Decree 7346; 8 → 10
 * and 18 → 20). Calculations do not replace an accountant's review. The rounding mode must match
 * the e-invoice integrator's or documents get rejected.
 */
import { fromUnits, mulDivRound, toUnits } from "../core/decimal";
import type { IsoDate, TaxRate, TaxScheme } from "../core/types";

/** Historic start dates are simplified to 2008-01-01: the kit only models rates from 2008 on. */
export const TR_KDV_RATES: TaxRate[] = [
  { value: 0, label: "0%", validFrom: "2008-01-01" },
  { value: 1, label: "1%", validFrom: "2008-01-01" },
  { value: 8, label: "8%", validFrom: "2008-01-01", validTo: "2023-07-09" },
  { value: 18, label: "18%", validFrom: "2008-01-01", validTo: "2023-07-09" },
  { value: 10, label: "10%", validFrom: "2023-07-10" },
  { value: 20, label: "20%", validFrom: "2023-07-10" },
];

/**
 * KDV scheme. Exemption and withholding codes are a starter subset.
 * TODO(data): generate the full lists from the GİB code lists and review them every January.
 */
export const trKdv: TaxScheme = {
  id: "tr-kdv",
  rates: TR_KDV_RATES,
  zeroRateRequiresExemption: true,
  exemptionCodes: [
    { code: "301", label: "Exports of goods (KDV Law 11/1-a)", localLabel: "11/1-a Mal ihracatı" },
    { code: "350", label: "Other exemptions", localLabel: "Diğer istisnalar" },
  ],
  withholding: [
    { code: "601", label: "Construction works and related engineering services", localLabel: "Yapım işleri ile bu işlerle birlikte ifa edilen mühendislik-mimarlık ve etüt-proje hizmetleri", ratio: [4, 10] },
    { code: "602", label: "Survey, planning, consulting, audit and similar services", localLabel: "Etüt, plan-proje, danışmanlık, denetim ve benzeri hizmetler", ratio: [9, 10] },
    { code: "604", label: "Catering services", localLabel: "Yemek servis hizmeti", ratio: [5, 10] },
  ],
  rounding: "line",
  priceEntry: ["net", "gross"],
};

/** Rates in force on `date`. */
export function activeTaxRates(scheme: TaxScheme, date: IsoDate): TaxRate[] {
  return scheme.rates.filter((r) => r.validFrom <= date && (!r.validTo || r.validTo >= date));
}

const S = 2; // money scale
const RS = 4; // rate scale
const HUNDRED = 100n * 10n ** BigInt(RS);
const rateUnits = (rate: number) => toUnits(String(rate), RS);

/** VAT on a net amount, half-up to 2 places ("100.00" at 20 → "20.00"). */
export function vatFromNet(net: string, rate: number): string {
  return fromUnits(mulDivRound(toUnits(net, S), rateUnits(rate), HUNDRED), S);
}

/** Net from a VAT-inclusive amount: `gross / (1 + rate)`, half-up ("120.00" at 20 → "100.00"). */
export function netFromGross(gross: string, rate: number): string {
  return fromUnits(mulDivRound(toUnits(gross, S), HUNDRED, HUNDRED + rateUnits(rate)), S);
}

/** Gross from net: `net + vatFromNet(net)`. */
export function grossFromNet(net: string, rate: number): string {
  const n = toUnits(net, S);
  return fromUnits(n + mulDivRound(n, rateUnits(rate), HUNDRED), S);
}

/** Withheld VAT: `vat × num / den`, half-up ("18.00" at 9/10 → "16.20"). */
export function withheldVat(vat: string, ratio: [number, number]): string {
  return fromUnits(mulDivRound(toUnits(vat, S), BigInt(ratio[0]), BigInt(ratio[1])), S);
}

/**
 * Splits `total` across `weights` pro-rata, exact to the kuruş (largest remainder), so the
 * parts always add up to `total`. Used to allocate a document discount to line bases.
 */
export function allocateProRata(total: string, weights: string[]): string[] {
  const t = toUnits(total, S);
  const neg = t < 0n;
  const abs = neg ? -t : t;
  const w = weights.map((x) => {
    const u = toUnits(x, S);
    return u < 0n ? -u : u;
  });
  const sum = w.reduce((a, b) => a + b, 0n);
  if (w.length === 0) return [];
  const parts = sum === 0n ? w.map((_, i) => (i === 0 ? abs : 0n)) : w.map((x) => (abs * x) / sum);
  if (sum !== 0n) {
    let left = abs - parts.reduce((a, b) => a + b, 0n);
    const order = w.map((x, i) => ({ i, r: (abs * x) % sum })).sort((a, b) => (b.r > a.r ? 1 : b.r < a.r ? -1 : a.i - b.i));
    for (let k = 0; left > 0n; k++, left--) parts[order[k % order.length]!.i]! += 1n;
  }
  return parts.map((p) => fromUnits(neg ? -p : p, S));
}

export interface KdvLineInput {
  /** Decimal string; net or gross according to `entry`. Discounts already applied. */
  amount: string;
  /** Percent (20). */
  rate: number;
  entry?: "net" | "gross";
  /** Withholding code from the scheme (e.g. "602"). */
  withholding?: string;
}

export interface KdvLineResult {
  net: string;
  vat: string;
  gross: string;
  withheld: string;
}

export interface KdvBreakdown {
  lines: KdvLineResult[];
  /** "KDV Matrahı (%20)" / "Hesaplanan KDV (%20)" rows. */
  byRate: { rate: number; base: string; vat: string }[];
  /** "KDV Tevkifatı (9/10)" rows. */
  withholding: { code: string; ratio: [number, number]; vat: string; withheld: string }[];
  totalNet: string;
  totalVat: string;
  totalWithheld: string;
  /** Net + VAT. */
  grandTotal: string;
  /** Grand total − withheld VAT. */
  payable: string;
}

export interface KdvOptions {
  scheme?: TaxScheme;
  /** Default: the scheme's (`"line"` for tr-kdv). */
  rounding?: "line" | "document";
  /** A document-level discount on the net total, allocated pro-rata to line bases. */
  documentDiscount?: string;
}

/**
 * Per-line and per-rate KDV totals with exact half-up rounding. One implementation for client
 * and server.
 *
 * ```ts
 * computeKdv([{ amount: "1000.00", rate: 20, withholding: "602" }]);
 * // totalVat "200.00", totalWithheld "180.00", grandTotal "1200.00", payable "1020.00"
 * ```
 */
export function computeKdv(lines: KdvLineInput[], options: KdvOptions = {}): KdvBreakdown {
  const scheme = options.scheme ?? trKdv;
  const rounding = options.rounding ?? scheme.rounding;
  const nets = lines.map((l) => (l.entry === "gross" ? netFromGross(l.amount, l.rate) : fromUnits(toUnits(l.amount, S), S)));
  const discounts = options.documentDiscount ? allocateProRata(options.documentDiscount, nets) : nets.map(() => "0.00");
  const ratioOf = (code?: string) => (code ? scheme.withholding?.find((w) => w.code === code)?.ratio : undefined);

  const out: KdvLineResult[] = lines.map((l, i) => {
    const net = toUnits(nets[i]!, S) - toUnits(discounts[i]!, S);
    // Gross entry without a document discount keeps the entered gross exactly.
    const vat = l.entry === "gross" && !options.documentDiscount ? toUnits(l.amount, S) - net : mulDivRound(net, rateUnits(l.rate), HUNDRED);
    const ratio = ratioOf(l.withholding);
    const withheld = ratio ? mulDivRound(vat, BigInt(ratio[0]), BigInt(ratio[1])) : 0n;
    return { net: fromUnits(net, S), vat: fromUnits(vat, S), gross: fromUnits(net + vat, S), withheld: fromUnits(withheld, S) };
  });

  const rateMap = new Map<number, { base: bigint; vat: bigint }>();
  const whMap = new Map<string, { ratio: [number, number]; vat: bigint; withheld: bigint }>();
  lines.forEach((l, i) => {
    const r = rateMap.get(l.rate) ?? { base: 0n, vat: 0n };
    r.base += toUnits(out[i]!.net, S);
    r.vat += toUnits(out[i]!.vat, S);
    rateMap.set(l.rate, r);
  });
  if (rounding === "document") {
    for (const [rate, r] of rateMap) r.vat = mulDivRound(r.base, rateUnits(rate), HUNDRED);
  }
  lines.forEach((l, i) => {
    const ratio = ratioOf(l.withholding);
    if (!ratio || !l.withholding) return;
    const w = whMap.get(l.withholding) ?? { ratio, vat: 0n, withheld: 0n };
    w.vat += toUnits(out[i]!.vat, S);
    w.withheld += toUnits(out[i]!.withheld, S);
    whMap.set(l.withholding, w);
  });
  if (rounding === "document") for (const w of whMap.values()) w.withheld = mulDivRound(w.vat, BigInt(w.ratio[0]), BigInt(w.ratio[1]));

  const totalNet = [...rateMap.values()].reduce((s, r) => s + r.base, 0n);
  const totalVat = [...rateMap.values()].reduce((s, r) => s + r.vat, 0n);
  const totalWithheld = [...whMap.values()].reduce((s, w) => s + w.withheld, 0n);
  return {
    lines: out,
    byRate: [...rateMap].sort((a, b) => b[0] - a[0]).map(([rate, r]) => ({ rate, base: fromUnits(r.base, S), vat: fromUnits(r.vat, S) })),
    withholding: [...whMap].map(([code, w]) => ({ code, ratio: w.ratio, vat: fromUnits(w.vat, S), withheld: fromUnits(w.withheld, S) })),
    totalNet: fromUnits(totalNet, S),
    totalVat: fromUnits(totalVat, S),
    totalWithheld: fromUnits(totalWithheld, S),
    grandTotal: fromUnits(totalNet + totalVat, S),
    payable: fromUnits(totalNet + totalVat - totalWithheld, S),
  };
}

/** True when a 0% line has the exemption code the scheme requires. */
export function needsExemptionCode(scheme: TaxScheme, rate: number, code?: string): boolean {
  return rate === 0 && !!scheme.zeroRateRequiresExemption && !scheme.exemptionCodes?.some((c) => c.code === code);
}

// ---------------------------------------------------------------------------------------------
// Amount in words (required on printed Turkish invoices)
// ---------------------------------------------------------------------------------------------

const ONES = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz"];
const TENS = ["", "On", "Yirmi", "Otuz", "Kırk", "Elli", "Altmış", "Yetmiş", "Seksen", "Doksan"];
const SCALES = ["", "Bin", "Milyon", "Milyar", "Trilyon", "Katrilyon"];

function threeDigits(n: number): string[] {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  const out: string[] = [];
  if (h) out.push(...(h > 1 ? [ONES[h]!] : []), "Yüz");
  if (t) out.push(TENS[t]!);
  if (o) out.push(ONES[o]!);
  return out;
}

/** "1234" → "Bin İki Yüz Otuz Dört" (no "Bir" before "Bin" or "Yüz"). */
export function trNumberToWords(n: bigint): string {
  if (n === 0n) return "Sıfır";
  const neg = n < 0n;
  let v = neg ? -n : n;
  const groups: number[] = [];
  while (v > 0n) {
    groups.push(Number(v % 1000n));
    v /= 1000n;
  }
  if (groups.length > SCALES.length) throw new RangeError("trNumberToWords: number too large");
  const words: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]!;
    if (!g) continue;
    if (i === 1 && g === 1) words.push("Bin");
    else words.push(...threeDigits(g), ...(SCALES[i] ? [SCALES[i]!] : []));
  }
  return (neg ? "Eksi " : "") + words.join(" ");
}

const CURRENCY_TR: Record<string, [major: string, minor: string]> = {
  TRY: ["Türk Lirası", "Kuruş"],
  USD: ["ABD Doları", "Sent"],
  EUR: ["Avro", "Sent"],
  GBP: ["İngiliz Sterlini", "Peni"],
  CHF: ["İsviçre Frangı", "Santim"],
};

/**
 * Turkish amount in words for printed invoices.
 *
 * ```ts
 * trAmountInWords("1234.50", "TRY"); // "Yalnız Bin İki Yüz Otuz Dört Türk Lirası Elli Kuruş"
 * trAmountInWords("250", "USD");     // "Yalnız İki Yüz Elli ABD Doları"
 * ```
 */
export function trAmountInWords(decimal: string, currency = "TRY"): string {
  const units = toUnits(decimal, 2);
  const abs = units < 0n ? -units : units;
  const major = abs / 100n;
  const minor = Number(abs % 100n);
  const [majorName, minorName] = CURRENCY_TR[currency.toUpperCase()] ?? [currency.toUpperCase(), ""];
  let out = `Yalnız ${units < 0n ? "Eksi " : ""}${trNumberToWords(major)} ${majorName}`;
  if (minor) out += ` ${trNumberToWords(BigInt(minor))}${minorName ? ` ${minorName}` : ""}`;
  return out;
}
