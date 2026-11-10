"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useComposedRefs } from "../lib/compose-refs";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useFormattedInput } from "../lib/use-formatted-input";
import { currencyDigits } from "../format/core";
import { compareDecimal } from "../locale-data/core/decimal";
import { Input } from "./input";
import {
  WithoutFieldName,
  createDecimalFormat,
  useDecimalKeys,
  useFormattedValidity,
  useSubmitName,
  type BaseFormattedProps,
  type FormattedValidity,
} from "./formatted-input";

const currencyInputLabels = {
  min: "Must be at least {min}",
  max: "Must be at most {max}",
  negative: "Must not be negative",
};
export type CurrencyInputLabels = typeof currencyInputLabels;

export interface CurrencyInputProps extends BaseFormattedProps<string | null> {
  /** ISO 4217 code. Default: the LocaleProvider's currency. */
  currency?: string;
  /** Fraction digits. Default from the currency (TRY / USD 2, JPY 0, KWD 3). */
  precision?: number;
  /** Inclusive bounds as decimal strings ("0.01", "50000"). Checked, never clamped. */
  min?: string;
  max?: string;
  /** Allow negative amounts (credit notes, adjustments). Default false. */
  allowNegative?: boolean;
  /** How the currency is shown. `"none"` hides it. Default `"narrowSymbol"` (₺, $, €). */
  currencyDisplay?: "narrowSymbol" | "symbol" | "code" | "none";
  /** Custom currency mark ("TL"), placed where the locale puts the symbol. */
  symbol?: React.ReactNode;
  /** Text alignment of the amount. `"end"` lines amounts up in tables and totals. Default `"start"`. */
  align?: "start" | "end";
  labels?: Partial<CurrencyInputLabels>;
}

/** Currency mark and its side for a locale ("₺" before in tr-TR, "€" after in de-DE). */
export function currencyAffix(locale: string, currency: string, display: "narrowSymbol" | "symbol" | "code" = "narrowSymbol"): { text: string; position: "start" | "end" } {
  const parts = new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: display }).formatToParts(1);
  const ci = parts.findIndex((p) => p.type === "currency");
  const ii = parts.findIndex((p) => p.type === "integer");
  return { text: parts[ci]?.value ?? currency, position: ci !== -1 && ci > ii ? "end" : "start" };
}

/**
 * Money entry. Types with the locale's grouping live ("1.250.000,50" in Turkish, "1,250,000.50"
 * in English) without moving the caret; the value is always a **decimal string** ("1250000.50"),
 * never a float. Either `.` or `,` starts the decimals; pasting "₺1.250,50" works.
 *
 * ```tsx
 * <Field label="Deal value"><CurrencyInput currency="USD" defaultValue="48500.00" /></Field>
 * <CurrencyInput currency="TRY" min="0.01" align="end" onValueChange={(v) => setAmount(v)} />
 * ```
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(function CurrencyInput(props, forwardedRef) {
  const {
    currency: currencyProp,
    precision: precisionProp,
    min,
    max,
    allowNegative = false,
    currencyDisplay = "narrowSymbol",
    symbol,
    align = "start",
    value,
    defaultValue,
    onValueChange,
    validateOn = "blur",
    onValidate,
    mono,
    labels,
    name,
    invalid,
    leading,
    trailing,
    inputClassName,
    onBlur,
    onKeyDown,
    disabled,
    ...rest
  } = props;
  const { locale, currency: providerCurrency, format: f } = useLocale();
  const currency = (currencyProp ?? providerCurrency).toUpperCase();
  const precision = precisionProp ?? currencyDigits(currency);
  const t = useLabels("currencyInput", currencyInputLabels, labels);
  const fmt = React.useMemo(() => createDecimalFormat({ locale, precision, fixed: true, allowNegative }), [locale, precision, allowNegative]);
  const v = useFormattedValidity(validateOn, onValidate);

  const check = (raw: string | null): FormattedValidity => {
    if (raw == null) return { valid: true };
    if (!allowNegative && raw.startsWith("-")) return { valid: false, reason: "negative", message: t("negative") };
    if (min !== undefined && compareDecimal(raw, min) < 0) return { valid: false, reason: "min", message: t("min", { min: f.currency(min, currency) }) };
    if (max !== undefined && compareDecimal(raw, max) > 0) return { valid: false, reason: "max", message: t("max", { max: f.currency(max, currency) }) };
    return { valid: true };
  };

  const engine = useFormattedInput({
    value,
    defaultValue,
    accept: fmt.accept,
    format: fmt.format,
    parse: fmt.parse,
    toDisplay: fmt.toDisplay,
    formatOnBlur: fmt.formatOnBlur,
    isSameValue: fmt.isSameValue,
    onValueChange: (raw, display) => {
      const c = check(raw);
      v.report(c, "change");
      onValueChange?.(raw, { valid: c.valid, reason: c.reason, formatted: display });
    },
  });
  const keys = useDecimalKeys(engine, { locale, decimal: fmt.decimal, precision, allowNegative });
  const ref = useComposedRefs(forwardedRef, engine.ref);
  const submitName = useSubmitName(name);

  const affix = currencyDisplay === "none" ? null : currencyAffix(locale, currency, currencyDisplay);
  const mark = affix ? (
    <span aria-hidden data-slot="currency-input-symbol" className="font-medium text-fg-subtle">
      {symbol ?? affix.text}
    </span>
  ) : null;
  const atStart = affix?.position === "start";
  const placeholder = rest.placeholder ?? fmt.toDisplay(precision ? `0.${"0".repeat(precision)}` : "0");

  return (
    <>
      <WithoutFieldName>
        <Input
          ref={ref}
          {...rest}
          {...engine.inputProps}
          disabled={disabled}
          placeholder={placeholder}
          inputMode={precision === 0 ? "numeric" : "decimal"}
          autoComplete="off"
          dir="ltr"
          invalid={invalid || v.invalid}
          leading={atStart ? <>{leading}{mark}</> : leading}
          trailing={!atStart && mark ? <>{mark}{trailing}</> : trailing}
          inputClassName={cn("tabular", mono && "font-mono", align === "end" && "text-end", inputClassName)}
          data-slot="currency-input"
          data-currency={currency}
          onPaste={keys.onPaste}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            keys.onKeyDown(e);
            engine.inputProps.onKeyDown(e);
          }}
          onBlur={(e) => {
            engine.inputProps.onBlur(e);
            v.report(check(fmt.parse(e.currentTarget.value)), "blur");
            onBlur?.(e);
          }}
        />
      </WithoutFieldName>
      {submitName ? <input type="hidden" name={submitName} value={engine.raw ?? ""} disabled={disabled} /> : null}
    </>
  );
});
