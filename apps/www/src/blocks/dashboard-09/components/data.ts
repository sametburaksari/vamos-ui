// Cash-flow data for dashboard-09: 12 months of cash, burn and runway, and the open receivables
// and payables from the shared finance fixtures. Foreign-currency invoices are converted to TRY
// at fixed reporting rates so ageing totals and cash add up.
import type { Formatter } from "@vamos-ui/react/format";
import { ageingBucket, ageingLabels, burn, cashBalance, invoices, type AgeingBucket, type Invoice } from "../../_shared/finance";
import type { L } from "../../_shared/l10n";
import type { Money } from "../../_shared/money";
import { month, TODAY } from "../../_shared/time";

export { ageingBucket, ageingLabels, burn, cashBalance, TODAY };
export type { AgeingBucket, Invoice };

export const FX: Record<Money["currency"], number> = { TRY: 1, USD: 41.8, EUR: 48.6 };
export const toTry = (m: Money) => Number(m.amount) * FX[m.currency];

export const buckets: AgeingBucket[] = ["current", "1-30", "31-60", "61-90", "90+"];

/** Invoices with money still open (sent, overdue or partly paid). */
export const openInvoices = invoices.filter((i) => Number(i.balance.amount) > 0 && i.status !== "draft" && i.status !== "void");

export type Scenario = "base" | "hire" | "cut";
export const scenarios: Array<{ key: Scenario; label: L; hint: L; delta: number }> = [
  { key: "base", label: { en: "Current plan", tr: "Mevcut plan" }, hint: { en: "Burn stays at the 3-month average", tr: "Harcama son 3 ay ortalamasında kalır" }, delta: 0 },
  { key: "hire", label: { en: "Hire 4 in Q1", tr: "Q1'de 4 işe alım" }, hint: { en: "+₺185K a month from January", tr: "Ocak'tan itibaren aylık +₺185B" }, delta: 185_000 },
  { key: "cut", label: { en: "Trim 10% opex", tr: "Giderleri %10 kıs" }, hint: { en: "−₺130K a month from December", tr: "Aralık'tan itibaren aylık −₺130B" }, delta: -130_000 },
];

/** Actual month-end balances plus an 18-month projection for a scenario. */
export function projection(cash: number, scenario: Scenario) {
  const net = Number(burn.monthlyNetBurn);
  const s = scenarios.find((x) => x.key === scenario)!;
  const rows: Array<{ month: string; actual: number | null; projected: number | null }> = cashBalance.map((r, i) => ({
    month: r.month,
    actual: Number(r.balance),
    projected: i === cashBalance.length - 1 ? cash : null,
  }));
  let bal = cash;
  let outMonth: string | null = null;
  for (let i = 1; i <= 18; i++) {
    const extra = scenario === "hire" ? (i >= 2 ? s.delta : 0) : scenario === "cut" ? s.delta : 0;
    bal -= net + extra;
    if (bal <= 0 && !outMonth) outMonth = month(i);
    rows.push({ month: month(i), actual: null, projected: Math.max(0, Math.round(bal)) });
  }
  const monthlyBurn = net + (scenario === "base" ? 0 : s.delta);
  return { rows, outMonth, runway: cash / Math.max(1, monthlyBurn), monthlyBurn };
}

type Fmt = Pick<Formatter, "currency">;
export const tryCompact = (f: Fmt, v: number) =>
  f.currency(Math.round(v), { currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 });
export const amountOf = (f: Fmt, m: Money) =>
  f.currency(m.amount, { currency: m.currency, currencyDisplay: "narrowSymbol" }, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
export const tryAxis = (v: unknown, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(Number(v));
export const tryExact = (v: unknown, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v));
