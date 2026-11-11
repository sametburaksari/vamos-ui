// Money in fixtures is always a decimal string plus an ISO currency — never a float.
import { addDecimal, multiplyDecimal, compareDecimal, subtractDecimal, type Formatter } from "@vamos-ui/react/format";

export type CurrencyCode = "TRY" | "USD" | "EUR";
export interface Money {
  /** Decimal string, "12450.00". */
  amount: string;
  currency: CurrencyCode;
}

export const m = (amount: string | number, currency: CurrencyCode = "TRY"): Money => ({
  amount: typeof amount === "number" ? amount.toFixed(2) : amount,
  currency,
});

/** Sum decimal strings (same currency). */
export function sum(values: readonly string[]): string {
  return addDecimal([...values]);
}

/** Format a Money with the kit formatter: `fmtMoney(useFormat(), order.total)`. */
export function fmtMoney(f: Formatter, value: Money, opts?: { compact?: boolean; whole?: boolean }): string {
  if (opts?.compact) return f.currency(value.amount, { currency: value.currency, notation: "compact", maximumFractionDigits: 1 });
  return f.currency(value.amount, { currency: value.currency }, opts?.whole ? { maximumFractionDigits: 0, minimumFractionDigits: 0 } : undefined);
}

export { addDecimal, subtractDecimal, multiplyDecimal, compareDecimal };
