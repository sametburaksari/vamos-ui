"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../lib/cn";
import { useComposedRefs } from "../lib/compose-refs";
import { FieldContext, useFieldContext } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useLatest } from "../lib/use-controllable-state";
import { useFormattedInput, type FormattedInputState } from "../lib/use-formatted-input";
import { numberSeparators, parseDecimal } from "../format/core";
import { Input, type InputProps } from "./input";

/* ------------------------------------------------------------------ */
/* Shared contract                                                     */
/* ------------------------------------------------------------------ */

/** What a formatted input reports with every change. */
export interface FormattedValueMeta {
  /** The value passes the component's rules (length, checksum, min/max). Empty counts as valid. */
  valid: boolean;
  /** What the field shows ("1.250,50", "TR33 0006 …"). */
  formatted: string;
  /** Machine-readable reason when invalid ("length", "checksum", "min", …). */
  reason?: string;
  /** Detected sub-kind, e.g. `"tr-ykn"` for a foreign resident ID, `"iban-TR"`. */
  kind?: string;
}

/** Result of a validation pass, with a localized message for the surrounding Field's `error`. */
export interface FormattedValidity {
  valid: boolean;
  reason?: string;
  /** Localized, ready for `<Field error>`. */
  message?: string;
}

export interface BaseFormattedProps<V>
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "labels" | "type" | "maxLength" | "showCount" | "min" | "max" | "step" | "pattern"> {
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V, meta: FormattedValueMeta) => void;
  /** When the invalid state (and `onValidate`) kicks in. Default `"blur"`; after a shown error it re-checks on every change. */
  validateOn?: "blur" | "change";
  /** Called at validation moments with a localized message — pass it to `<Field error>`. */
  onValidate?: (result: FormattedValidity) => void;
  /** Tabular monospace digits. */
  mono?: boolean;
}

/**
 * Tracks the "shown" validity: errors appear on blur (or change) and, once shown, clear live
 * while the user fixes the value.
 */
export function useFormattedValidity(validateOn: "blur" | "change", onValidate?: (r: FormattedValidity) => void) {
  const [shown, setShown] = React.useState<FormattedValidity | null>(null);
  const shownRef = React.useRef(shown);
  shownRef.current = shown;
  const cb = useLatest(onValidate);
  const report = React.useCallback(
    (r: FormattedValidity, trigger: "change" | "blur") => {
      const prev = shownRef.current;
      if (trigger === "change" && validateOn !== "change" && !(prev && !prev.valid)) return;
      if (prev && prev.valid === r.valid && prev.reason === r.reason && prev.message === r.message) return;
      shownRef.current = r;
      setShown(r);
      cb.current?.(r);
    },
    [validateOn, cb],
  );
  return { invalid: shown ? !shown.valid : false, report };
}

/**
 * Hides the Field's `name` from the visible input: formatted inputs submit their locale-free
 * raw value through a hidden input instead.
 */
export function WithoutFieldName({ children }: { children: React.ReactNode }) {
  const field = useFieldContext();
  const value = React.useMemo(() => (field ? { ...field, name: undefined } : null), [field]);
  return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>;
}

/** The name a formatted input submits its raw value under (own `name`, else the Field's). */
export function useSubmitName(name?: string): string | undefined {
  const field = useFieldContext();
  return name ?? field?.name;
}

/* ------------------------------------------------------------------ */
/* Decimal display engine (Number · Percent · Currency)                */
/* ------------------------------------------------------------------ */

export interface DecimalFormatOptions {
  locale: string;
  /** Max fraction digits. `undefined` = free. */
  precision?: number;
  /** Pad to `precision` on blur and in the raw value (money). */
  fixed?: boolean;
  allowNegative?: boolean;
  /** Locale grouping ("1.250.000"). Default true. */
  grouping?: boolean;
}

const LATN = { numberingSystem: "latn" } as Intl.NumberFormatOptions;
const groupCache = new Map<string, Intl.NumberFormat>();
function groupFormat(locale: string): Intl.NumberFormat {
  let f = groupCache.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, { ...LATN, maximumFractionDigits: 0, useGrouping: true });
    groupCache.set(locale, f);
  }
  return f;
}

/** Strips trailing fraction zeros so "1250.5" and "1250.50" compare equal. */
export function canonicalDecimal(v: string | null): string | null {
  if (v == null) return null;
  let s = v.replace(/^(-?)0+(?=\d)/, "$1");
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s === "-0" ? "0" : s;
}

/**
 * Formatter set for decimal inputs: live grouping with the locale's separators, the caret kept
 * in place, and a locale-free decimal string as the raw value.
 */
export function createDecimalFormat({ locale, precision, fixed = false, allowNegative = false, grouping = true }: DecimalFormatOptions) {
  const { decimal } = numberSeparators(locale);
  const allowsFraction = precision === undefined || precision > 0;
  const accept = (ch: string) => (ch >= "0" && ch <= "9") || (allowsFraction && ch === decimal) || (allowNegative && ch === "-");

  const format = (typed: string): string => {
    let neg = false;
    let int = "";
    let frac = "";
    let seenDec = false;
    let seenDigit = false;
    for (const ch of typed) {
      if (ch >= "0" && ch <= "9") {
        seenDigit = true;
        if (seenDec) frac += ch;
        else int += ch;
      } else if (allowsFraction && ch === decimal && !seenDec) seenDec = true;
      else if (allowNegative && (ch === "-" || ch === "−") && !seenDigit && !seenDec) neg = true;
    }
    int = int.replace(/^0+(?=\d)/, "");
    if (precision !== undefined) frac = frac.slice(0, precision);
    const groupedInt = int ? (grouping ? groupFormat(locale).format(BigInt(int)) : int) : "";
    return (neg ? "-" : "") + groupedInt + (seenDec ? decimal + frac : "");
  };

  const parse = (display: string): string | null => {
    let s = "";
    for (const ch of display) {
      if (ch >= "0" && ch <= "9") s += ch;
      else if (ch === decimal) s += ".";
      else if (ch === "-") s += "-";
    }
    const neg = s.startsWith("-");
    s = s.replace(/-/g, "");
    if (!/\d/.test(s)) return null;
    let [int = "", frac = ""] = s.split(".");
    int = int.replace(/^0+(?=\d)/, "") || "0";
    if (fixed && precision) frac = frac.padEnd(precision, "0");
    const out = frac ? `${int}.${frac}` : int;
    return neg && /[1-9]/.test(out) ? `-${out}` : out;
  };

  const formatOnBlur = (display: string): string => {
    if (!/\d/.test(display)) return "";
    let d = display;
    if (d.startsWith(decimal) || d.startsWith(`-${decimal}`)) d = d.replace(decimal, `0${decimal}`);
    if (d.endsWith(decimal) && !(fixed && precision)) d = d.slice(0, -1);
    if (fixed && precision) {
      const at = d.indexOf(decimal);
      const fracLen = at === -1 ? 0 : d.length - at - 1;
      d = (at === -1 ? d + decimal : d) + "0".repeat(Math.max(0, precision - fracLen));
    }
    if (/^-0(?:\D0*)?$/.test(d.replace(new RegExp(`\\${decimal}`, "g"), "."))) d = d.slice(1);
    return d;
  };

  const toDisplay = (raw: string | null): string => {
    if (raw == null || raw === "") return "";
    const v = canonicalDecimal(String(raw).trim())!;
    return formatOnBlur(format(v.replace(".", decimal)));
  };

  return { accept, format, parse, formatOnBlur, toDisplay, decimal, isSameValue: (a: string | null, b: string | null) => canonicalDecimal(a) === canonicalDecimal(b) };
}

/**
 * Key and paste handling shared by decimal inputs: either `.` or `,` starts the decimals (group
 * separators are inserted automatically, so nobody needs to type them), `-` toggles the sign,
 * and pasted text is parsed leniently ("₺1.250,50", "(42.00)", "1,250.50").
 */
export function useDecimalKeys(engine: FormattedInputState, opts: { locale: string; decimal: string; precision?: number; allowNegative?: boolean }) {
  const o = useLatest(opts);
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const { decimal, precision, allowNegative } = o.current!;
    if ((e.key === "." || e.key === ",") && e.key !== decimal) {
      e.preventDefault();
      if (precision !== 0) engine.insert(decimal);
      return;
    }
    if (e.key === "-" && allowNegative) {
      e.preventDefault();
      const el = e.currentTarget;
      const s = el.value;
      const caret = el.selectionStart ?? s.length;
      if (s.startsWith("-")) engine.update(s.slice(1), Math.max(0, caret - 1));
      else engine.update(`-${s}`, caret + 1);
    }
  };
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    const parsed = parseDecimal(text, o.current!.locale);
    if (parsed == null) return;
    e.preventDefault();
    engine.insert(parsed.replace(".", o.current!.decimal));
  };
  return { onKeyDown, onPaste };
}

/* ------------------------------------------------------------------ */
/* FormattedInput — pattern masks and custom formatters                */
/* ------------------------------------------------------------------ */

/** A pluggable formatter for `FormattedInput` (what `mask` compiles to). */
export interface InputFormatter {
  accept: (ch: string) => boolean;
  format: (typed: string) => string;
  parse: (display: string) => string | null;
  toDisplay?: (raw: string | null) => string;
  formatOnBlur?: (display: string) => string;
  /** Validity of a complete raw value. */
  validate?: (raw: string) => { valid: boolean; reason?: string };
}

const SLOT: Record<string, (ch: string) => boolean> = {
  "#": (ch) => /^\d$/.test(ch),
  A: (ch) => /^\p{L}$/u.test(ch),
  "*": (ch) => /^[\p{L}\p{N}]$/u.test(ch),
};

/**
 * Compiles a pattern mask: `#` digit, `A` letter, `*` letter or digit; anything else is a literal
 * that is inserted for you ("(###) ###-####", "AA-####", "####-##-##").
 *
 * ```ts
 * maskFormatter("(###) ###-####").format("4155550132"); // "(415) 555-0132"
 * ```
 */
export function maskFormatter(mask: string, opts: { uppercase?: boolean } = {}): InputFormatter {
  const slots = [...mask];
  const accept = (ch: string) => /^[\p{L}\p{N}]$/u.test(ch);
  const slotCount = slots.filter((c) => SLOT[c]).length;
  const format = (typed: string) => {
    const chars = [...typed].filter(accept).map((c) => (opts.uppercase ? c.toLocaleUpperCase() : c));
    let out = "";
    let pending = "";
    let i = 0;
    for (const slot of slots) {
      if (i >= chars.length) break;
      const test = SLOT[slot];
      if (!test) {
        pending += slot;
        continue;
      }
      // skip characters that don't fit this slot
      while (i < chars.length && !test(chars[i]!)) i++;
      if (i >= chars.length) break;
      out += pending + chars[i]!;
      pending = "";
      i++;
    }
    return out;
  };
  const parse = (display: string) => {
    const raw = [...display].filter(accept).join("");
    return raw || null;
  };
  return {
    accept,
    format,
    parse,
    toDisplay: (raw) => (raw ? format(raw) : ""),
    validate: (raw) => (raw.length === slotCount ? { valid: true } : { valid: false, reason: "incomplete" }),
  };
}

const formattedInputLabels = {
  incomplete: "Fill in all {count, plural, one {# character} other {# characters}}",
  invalid: "This value isn't valid",
};
export type FormattedInputLabels = typeof formattedInputLabels;

export interface FormattedInputProps extends BaseFormattedProps<string | null> {
  /** Pattern: `#` digit, `A` letter, `*` letter or digit, anything else literal. */
  mask?: string;
  /** Custom formatter (wins over `mask`). */
  formatter?: InputFormatter;
  /** Uppercase letters as they are typed (with `mask`). */
  uppercase?: boolean;
  /** Raw value: `"unmasked"` (significant characters only, default) or `"masked"` (as displayed). */
  valueFormat?: "unmasked" | "masked";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  labels?: Partial<FormattedInputLabels>;
}

/**
 * Generic masked input: the caret-preserving engine with a pattern (`mask="(###) ###-####"`)
 * or your own `formatter`. Use it for order numbers, plate numbers, card expiry, SKU codes.
 *
 * ```tsx
 * <FormattedInput mask="AA-####-##" uppercase placeholder="TR-2026-01" />
 * ```
 */
export const FormattedInput = React.forwardRef<HTMLInputElement, FormattedInputProps>(function FormattedInput(
  { mask, formatter, uppercase, valueFormat = "unmasked", value, defaultValue, onValueChange, validateOn = "blur", onValidate, mono, labels, name, invalid, className, inputClassName, onBlur, onKeyDown, placeholder, ...rest },
  forwardedRef,
) {
  const t = useLabels("formattedInput", formattedInputLabels, labels);
  const fmt = React.useMemo(() => formatter ?? maskFormatter(mask ?? "", { uppercase }), [formatter, mask, uppercase]);
  const slotCount = mask ? [...mask].filter((c) => SLOT[c]).length : 0;
  const v = useFormattedValidity(validateOn, onValidate);
  const check = (raw: string | null): FormattedValidity => {
    if (!raw || !fmt.validate) return { valid: true };
    const r = fmt.validate(valueFormat === "masked" ? [...raw].filter(fmt.accept).join("") : raw);
    if (r.valid) return { valid: true };
    return { valid: false, reason: r.reason, message: r.reason === "incomplete" ? t("incomplete", { count: slotCount }) : t("invalid") };
  };
  const engine = useFormattedInput({
    value,
    defaultValue,
    accept: fmt.accept,
    format: fmt.format,
    parse: valueFormat === "masked" ? (d) => (d ? d : null) : fmt.parse,
    toDisplay: fmt.toDisplay ?? ((raw) => (raw ? fmt.format(raw) : "")),
    formatOnBlur: fmt.formatOnBlur,
    onValueChange: (raw, display) => {
      const c = check(raw);
      v.report(c, "change");
      onValueChange?.(raw, { valid: c.valid, reason: c.reason, formatted: display });
    },
  });
  const ref = useComposedRefs(forwardedRef, engine.ref);
  const submitName = useSubmitName(name);
  return (
    <>
      <WithoutFieldName>
        <Input
          ref={ref}
          {...rest}
          {...engine.inputProps}
          placeholder={placeholder ?? (mask ? mask.replace(/[#A*]/g, "_") : undefined)}
          invalid={invalid || v.invalid}
          className={className}
          inputClassName={cn(mono && "font-mono tabular", inputClassName)}
          data-slot="formatted-input"
          onKeyDown={(e) => {
            onKeyDown?.(e);
            engine.inputProps.onKeyDown(e);
          }}
          onBlur={(e) => {
            engine.inputProps.onBlur(e);
            v.report(check(fmt.parse(e.currentTarget.value)), "blur");
            onBlur?.(e);
          }}
        />
      </WithoutFieldName>
      {submitName ? <input type="hidden" name={submitName} value={engine.raw ?? ""} disabled={rest.disabled} /> : null}
    </>
  );
});

/* ------------------------------------------------------------------ */
/* NumberInput                                                         */
/* ------------------------------------------------------------------ */

const numberInputLabels = {
  increment: "Increase",
  decrement: "Decrease",
  min: "Must be at least {min}",
  max: "Must be at most {max}",
};
export type NumberInputLabels = typeof numberInputLabels;

export interface NumberInputProps extends BaseFormattedProps<number | null> {
  min?: number;
  max?: number;
  /** Arrow keys and stepper buttons. Default 1. Shift + arrow steps ×10. */
  step?: number;
  /** Max fraction digits. Default: free. `0` = whole numbers only. */
  precision?: number;
  /** − / + buttons at the end. */
  stepper?: boolean;
  /** Locale grouping. Default true. */
  grouping?: boolean;
  labels?: Partial<NumberInputLabels>;
}

const decimalsOf = (n: number) => {
  const s = String(n);
  const at = s.indexOf(".");
  return at === -1 ? 0 : s.length - at - 1;
};

/**
 * Locale-aware number entry: "1.250,5" in Turkish, "1,250.5" in English, value always a JS
 * number. ARIA spinbutton with arrow keys (Shift ×10), optional stepper buttons.
 *
 * ```tsx
 * <NumberInput defaultValue={12} min={1} max={500} stepper aria-label="Quantity" />
 * ```
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(props, forwardedRef) {
  const { min, max, step = 1, precision, stepper, grouping = true, value, defaultValue, onValueChange, validateOn = "blur", onValidate, mono, labels, name, invalid, className, inputClassName, onBlur, onKeyDown, trailing, size, disabled, readOnly, ...rest } = props;
  const { locale, format: f } = useLocale();
  const t = useLabels("numberInput", numberInputLabels, labels);
  const allowNegative = min === undefined || min < 0;
  const fmt = React.useMemo(() => createDecimalFormat({ locale, precision, allowNegative, grouping }), [locale, precision, allowNegative, grouping]);
  const v = useFormattedValidity(validateOn, onValidate);
  const check = (n: number | null): FormattedValidity => {
    if (n == null) return { valid: true };
    if (min !== undefined && n < min) return { valid: false, reason: "min", message: t("min", { min: f.number(min) }) };
    if (max !== undefined && n > max) return { valid: false, reason: "max", message: t("max", { max: f.number(max) }) };
    return { valid: true };
  };
  const toNum = (raw: string | null) => (raw == null ? null : Number(raw));
  const engine = useFormattedInput({
    value: value === undefined ? undefined : value == null ? null : String(value),
    defaultValue: defaultValue == null ? null : String(defaultValue),
    accept: fmt.accept,
    format: fmt.format,
    parse: fmt.parse,
    toDisplay: fmt.toDisplay,
    formatOnBlur: fmt.formatOnBlur,
    isSameValue: fmt.isSameValue,
    onValueChange: (raw, display) => {
      const n = toNum(raw);
      const c = check(n);
      v.report(c, "change");
      onValueChange?.(n, { valid: c.valid, reason: c.reason, formatted: display });
    },
  });
  const keys = useDecimalKeys(engine, { locale, decimal: fmt.decimal, precision, allowNegative });
  const ref = useComposedRefs(forwardedRef, engine.ref);
  const submitName = useSubmitName(name);
  const current = toNum(engine.raw);
  const inert = disabled || readOnly;

  const stepBy = (dir: 1 | -1, mult = 1) => {
    if (inert) return;
    const places = Math.max(decimalsOf(step), precision ?? 0, current == null ? 0 : decimalsOf(current));
    let next = (current ?? (dir > 0 ? (min ?? 0) - step * mult : (max ?? 0) + step * mult)) + dir * step * mult;
    next = Number(next.toFixed(Math.min(places, 20)));
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    engine.setDisplay(fmt.toDisplay(String(next)));
  };

  const stepButton = "inline-flex size-7 items-center justify-center rounded-ui-sm text-fg-muted transition-colors hover:bg-hover hover:text-fg disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5";

  return (
    <>
      <WithoutFieldName>
        <Input
          ref={ref}
          {...rest}
          {...engine.inputProps}
          size={size}
          disabled={disabled}
          readOnly={readOnly}
          role="spinbutton"
          inputMode={precision === 0 ? "numeric" : "decimal"}
          autoComplete="off"
          dir="ltr"
          aria-valuenow={current ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={engine.display || undefined}
          invalid={invalid || v.invalid}
          className={className}
          inputClassName={cn("tabular", mono && "font-mono", inputClassName)}
          data-slot="number-input"
          trailing={
            stepper || trailing ? (
              <span className="flex items-center gap-0.5">
                {trailing}
                {stepper ? (
                  <>
                    <button type="button" tabIndex={-1} aria-label={t("decrement")} className={stepButton} disabled={inert || (min !== undefined && current != null && current <= min)} onClick={() => stepBy(-1)}>
                      <Minus aria-hidden />
                    </button>
                    <button type="button" tabIndex={-1} aria-label={t("increment")} className={stepButton} disabled={inert || (max !== undefined && current != null && current >= max)} onClick={() => stepBy(1)}>
                      <Plus aria-hidden />
                    </button>
                  </>
                ) : null}
              </span>
            ) : undefined
          }
          onPaste={keys.onPaste}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (e.defaultPrevented) return;
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              stepBy(e.key === "ArrowUp" ? 1 : -1, e.shiftKey ? 10 : 1);
              return;
            }
            if (e.key === "Home" && min !== undefined && e.ctrlKey) {
              e.preventDefault();
              engine.setDisplay(fmt.toDisplay(String(min)));
              return;
            }
            keys.onKeyDown(e);
            engine.inputProps.onKeyDown(e);
          }}
          onBlur={(e) => {
            engine.inputProps.onBlur(e);
            v.report(check(toNum(fmt.parse(e.currentTarget.value))), "blur");
            onBlur?.(e);
          }}
        />
      </WithoutFieldName>
      {submitName ? <input type="hidden" name={submitName} value={engine.raw ?? ""} disabled={disabled} /> : null}
    </>
  );
});

/* ------------------------------------------------------------------ */
/* PercentInput                                                        */
/* ------------------------------------------------------------------ */

export interface PercentInputProps extends Omit<NumberInputProps, "leading"> {}

/** Where the locale puts the percent sign: tr "%12", en "12%", fr "12 %". */
export function percentSignPosition(locale: string): "start" | "end" {
  const parts = new Intl.NumberFormat(locale, { style: "percent" }).formatToParts(0.12);
  const pi = parts.findIndex((p) => p.type === "percentSign");
  const ii = parts.findIndex((p) => p.type === "integer");
  return pi !== -1 && pi < ii ? "start" : "end";
}

/**
 * Percent entry (discounts, tax rates, commission). The value is in percent units (`12.5` =
 * 12.5%), the sign sits where the locale puts it. Default range 0–100, two decimals.
 */
export const PercentInput = React.forwardRef<HTMLInputElement, PercentInputProps>(function PercentInput({ min = 0, max = 100, precision = 2, trailing, ...props }, ref) {
  const { locale } = useLocale();
  const sign = <span aria-hidden className="font-medium text-fg-subtle">%</span>;
  const start = percentSignPosition(locale) === "start";
  return (
    <NumberInput
      ref={ref}
      min={min}
      max={max}
      precision={precision}
      {...props}
      data-slot="percent-input"
      {...(start ? { leading: sign, trailing } : { trailing: <>{sign}{trailing}</> })}
    />
  );
});
