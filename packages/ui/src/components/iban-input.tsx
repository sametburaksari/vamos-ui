"use client";

import * as React from "react";
import { Landmark } from "lucide-react";
import { cn } from "../lib/cn";
import { mergeIds, useComposedRefs } from "../lib/compose-refs";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useFormattedInput } from "../lib/use-formatted-input";
import { IBAN_LENGTHS, formatIban, normalizeIban, validateIban } from "../locale-data/core/iban";
import type { IbanCountryRule } from "../locale-data/core/types";
import { trIbanRule } from "../locale-data/tr/iban";
import { Input } from "./input";
import { WithoutFieldName, useFormattedValidity, useSubmitName, type BaseFormattedProps, type FormattedValidity } from "./formatted-input";

const ibanInputLabels = {
  length: "An IBAN from {country} has {length} characters",
  lengthGeneric: "An IBAN has 15 to 34 characters",
  chars: "An IBAN starts with a two-letter country code and two check digits",
  checksum: "Invalid IBAN checksum. Check it for typos.",
  pattern: "This isn't a valid IBAN for {country}",
  country: "IBANs from {country} aren't accepted here",
  bank: "Bank: {bank}",
};
export type IbanInputLabels = typeof ibanInputLabels;

export interface IbanInputProps extends BaseFormattedProps<string | null> {
  /** Allowed country codes (`["TR"]`). Default: any. */
  countries?: string[];
  /** Per-country rules with BBAN patterns and bank lookups (locale packs). Default: the `tr` rule. */
  rules?: IbanCountryRule[];
  /**
   * Bank name next to the number once the bank code is typed. `true` (default) uses the rules'
   * `bankName`; pass a function for your own lookup, or `false` to hide it.
   */
  showBank?: boolean | ((iban: string) => string | undefined);
  labels?: Partial<IbanInputLabels>;
}

function regionName(locale: string, code: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

const accept = (ch: string) => /^[0-9A-Za-z]$/.test(ch);

/**
 * IBAN entry: typed in groups of four (`TR33 0006 1005 1978 6457 8413 26`) with the caret kept in
 * place, checked against the country length, BBAN pattern and ISO 13616 mod-97 checksum. The value
 * is the electronic format (no spaces, uppercase). Turkish IBANs show the bank name.
 *
 * ```tsx
 * <Field label="IBAN" error={error}>
 *   <IbanInput countries={["TR"]} onValidate={(r) => setError(r.message)} />
 * </Field>
 * ```
 */
export const IbanInput = /*#__PURE__*/ React.forwardRef<HTMLInputElement, IbanInputProps>(function IbanInput(
  { countries, rules = [trIbanRule], showBank = true, value, defaultValue, onValueChange, validateOn = "blur", onValidate, mono = true, labels, name, invalid, trailing, inputClassName, onBlur, onKeyDown, disabled, placeholder, ...rest },
  forwardedRef,
) {
  const { locale } = useLocale();
  const t = useLabels("ibanInput", ibanInputLabels, labels);
  const v = useFormattedValidity(validateOn, onValidate);
  const bankId = React.useId();

  const maxFor = (compact: string) => {
    const cc = compact.slice(0, 2).toUpperCase();
    return rules.find((r) => r.country === cc)?.length ?? IBAN_LENGTHS[cc] ?? 34;
  };
  const format = (typed: string) => {
    const compact = [...typed].filter(accept).join("").toUpperCase();
    return formatIban(compact.slice(0, maxFor(compact)));
  };

  const check = (raw: string | null): FormattedValidity & { kind?: string } => {
    if (!raw) return { valid: true };
    const cc = raw.slice(0, 2);
    const country = /^[A-Z]{2}$/.test(cc) ? regionName(locale, cc) : cc;
    if (countries && /^[A-Z]{2}$/.test(cc) && !countries.includes(cc)) return { valid: false, reason: "country", message: t("country", { country }) };
    const r = validateIban(raw, rules);
    if (r.valid) return { valid: true, kind: r.kind };
    const length = rules.find((x) => x.country === cc)?.length ?? IBAN_LENGTHS[cc];
    const message =
      r.reason === "length"
        ? length
          ? t("length", { country, length })
          : t("lengthGeneric")
        : r.reason === "chars"
          ? t("chars")
          : r.reason === "pattern"
            ? t("pattern", { country })
            : t("checksum");
    return { valid: false, reason: r.reason, message, kind: r.kind };
  };

  const engine = useFormattedInput({
    value,
    defaultValue,
    accept,
    format,
    parse: (d) => normalizeIban(d) || null,
    toDisplay: (raw) => (raw ? format(raw) : ""),
    onValueChange: (raw, formatted) => {
      const c = check(raw);
      v.report({ valid: c.valid, reason: c.reason, message: c.message }, "change");
      onValueChange?.(raw, { valid: c.valid, reason: c.reason, kind: c.kind, formatted });
    },
  });
  const ref = useComposedRefs(forwardedRef, engine.ref);
  const submitName = useSubmitName(name);

  const raw = engine.raw ?? "";
  let bank: string | undefined;
  if (showBank && raw.length >= 9) {
    if (typeof showBank === "function") bank = showBank(raw);
    else bank = rules.find((r) => r.country === raw.slice(0, 2))?.bankName?.(raw.slice(4, 9));
  }

  const firstCountry = countries?.[0] ?? "TR";
  const sample = firstCountry === "TR" ? "TR00 0000 0000 0000 0000 0000 00" : `${firstCountry}00 0000 0000 0000 0000`;

  return (
    <>
      <WithoutFieldName>
        <Input
          ref={ref}
          {...rest}
          {...engine.inputProps}
          disabled={disabled}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          dir="ltr"
          placeholder={placeholder ?? sample}
          invalid={invalid || v.invalid}
          aria-describedby={mergeIds(bank ? bankId : undefined, rest["aria-describedby"])}
          inputClassName={cn(mono && "font-mono tabular tracking-[0.02em]", inputClassName)}
          data-slot="iban-input"
          trailing={
            bank || trailing ? (
              <>
                {bank ? (
                  <span id={bankId} data-slot="iban-input-bank" className="ui-fade me-1.5 flex max-w-[11rem] items-center gap-1.5 truncate text-xs font-medium text-fg-muted">
                    <Landmark aria-hidden className="size-3.5 shrink-0 text-fg-subtle" />
                    <span className="sr-only">{t("bank", { bank })}</span>
                    <span aria-hidden className="truncate">{bank}</span>
                  </span>
                ) : null}
                {trailing}
              </>
            ) : undefined
          }
          onKeyDown={(e) => {
            onKeyDown?.(e);
            engine.inputProps.onKeyDown(e);
          }}
          onBlur={(e) => {
            engine.inputProps.onBlur(e);
            const c = check(normalizeIban(e.currentTarget.value) || null);
            v.report({ valid: c.valid, reason: c.reason, message: c.message }, "blur");
            onBlur?.(e);
          }}
        />
      </WithoutFieldName>
      {submitName ? <input type="hidden" name={submitName} value={raw} disabled={disabled} /> : null}
    </>
  );
});
