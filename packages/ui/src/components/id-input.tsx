"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useComposedRefs } from "../lib/compose-refs";
import { useLabels } from "../lib/labels";
import { useFormattedInput } from "../lib/use-formatted-input";
import type { IdRule } from "../locale-data/core/types";
import { trTaxIdRule, trTcknRule, trVknRule } from "../locale-data/tr/id";
import { Input } from "./input";
import { WithoutFieldName, useFormattedValidity, useSubmitName, type BaseFormattedProps, type FormattedValidity } from "./formatted-input";

/* ------------------------------------------------------------------ */
/* Rule registry                                                       */
/* ------------------------------------------------------------------ */

/** An ID rule as the input uses it: a locale-data `IdRule` plus how it is typed. */
export interface IdInputRule extends IdRule {
  /** Characters a user can type. Default `"digits"`. */
  charset?: "digits" | "alphanumeric";
}

/** Built-in kinds (the `tr` pack) plus anything registered with `registerIdRule`. */
export type IdKind = "tr-tckn" | "tr-vkn" | "tr-tax-id" | (string & {});

const registry = new Map<string, IdInputRule>([
  [trTcknRule.id, trTcknRule],
  [trVknRule.id, trVknRule],
  [trTaxIdRule.id, trTaxIdRule],
]);

/**
 * Adds (or replaces) an ID rule. Locale packs call this with their `idRules`; apps can add
 * their own (employee numbers, membership codes).
 *
 * ```ts
 * import { trPack } from "@vamos-ui/react/locale-data";
 * trPack.idRules?.forEach(registerIdRule);
 * registerIdRule({ id: "de-steuer-id", label: "German tax ID", lengths: [11], normalize, validate });
 * ```
 */
export function registerIdRule(rule: IdInputRule): void {
  registry.set(rule.id, rule);
}

/** A registered rule, or `undefined`. */
export function getIdRule(kind: IdKind): IdInputRule | undefined {
  return registry.get(kind);
}

/** Every registered kind. */
export function listIdRules(): IdInputRule[] {
  return [...registry.values()];
}

/* ------------------------------------------------------------------ */
/* IdInput                                                             */
/* ------------------------------------------------------------------ */

const idInputLabels = {
  length: "Must be {lengths} digits",
  lengthChars: "Must be {lengths} characters",
  chars: "Only digits are allowed",
  checksum: "This number isn't valid. Check it for typos.",
  pattern: "This number isn't valid. Check it for typos.",
  or: "{a} or {b}",
};
export type IdInputLabels = typeof idInputLabels;

export interface IdInputProps extends BaseFormattedProps<string | null> {
  /** A registered rule id (`"tr-tckn"`, `"tr-vkn"`, `"tr-tax-id"`) or a rule object. */
  kind: IdKind | IdInputRule;
  /**
   * Privacy mask (KVKK / GDPR): when the field is not focused, a valid value shows as
   * `123******01`. Focus reveals it. Default false.
   */
  masked?: boolean;
  labels?: Partial<IdInputLabels>;
}

/**
 * National and tax ID entry with checksum validation from pluggable rules: TCKN (and foreign
 * resident YKN, reported as `kind: "tr-ykn"`), VKN, and the combined invoice tax id. The value is
 * the normalized number.
 *
 * ```tsx
 * <Field label="Turkish ID number" error={error}>
 *   <IdInput kind="tr-tckn" onValidate={(r) => setError(r.message)} />
 * </Field>
 * ```
 */
export const IdInput = /*#__PURE__*/ React.forwardRef<HTMLInputElement, IdInputProps>(function IdInput(
  { kind, masked = false, value, defaultValue, onValueChange, validateOn = "blur", onValidate, mono = true, labels, name, invalid, inputClassName, onBlur, onFocus, onKeyDown, disabled, placeholder, ...rest },
  forwardedRef,
) {
  const rule = typeof kind === "string" ? registry.get(kind) : kind;
  if (!rule && process.env.NODE_ENV !== "production") console.warn(`IdInput: no rule registered for "${String(kind)}".`);
  const t = useLabels("idInput", idInputLabels, labels);
  const digits = (rule?.charset ?? "digits") === "digits";
  const maxLength = rule ? Math.max(...rule.lengths) : 64;
  const accept = React.useCallback((ch: string) => (digits ? ch >= "0" && ch <= "9" : /^[0-9A-Za-z]$/.test(ch)), [digits]);
  const v = useFormattedValidity(validateOn, onValidate);
  const [focused, setFocused] = React.useState(false);

  const normalize = (s: string) => {
    const out = [...s].filter(accept).join("").slice(0, maxLength);
    return digits ? out : out.toUpperCase();
  };
  const display = (s: string) => {
    const n = normalize(s);
    return n && rule?.format && rule.lengths.includes(n.length) ? rule.format(n) : n;
  };

  const lengthText = () => {
    const ls = rule?.lengths ?? [];
    const joined = ls.length > 1 ? t("or", { a: ls.slice(0, -1).join(", "), b: ls[ls.length - 1] }) : String(ls[0] ?? "");
    return t(digits ? "length" : "lengthChars", { lengths: joined });
  };

  const check = (raw: string | null): FormattedValidity & { kind?: string } => {
    if (!raw || !rule) return { valid: true };
    const r = rule.validate(raw);
    if (r.valid) return { valid: true, kind: r.kind };
    const reason = r.reason ?? "checksum";
    const message = reason === "length" ? lengthText() : reason === "chars" ? t("chars") : t(reason === "pattern" ? "pattern" : "checksum");
    return { valid: false, reason, message, kind: r.kind };
  };

  const engine = useFormattedInput({
    value,
    defaultValue,
    accept,
    format: display,
    parse: (d) => normalize(d) || null,
    toDisplay: (raw) => (raw ? display(raw) : ""),
    onValueChange: (raw, formatted) => {
      const c = check(raw);
      v.report({ valid: c.valid, reason: c.reason, message: c.message }, "change");
      onValueChange?.(raw, { valid: c.valid, reason: c.reason, kind: c.kind, formatted });
    },
  });
  const ref = useComposedRefs(forwardedRef, engine.ref);
  const submitName = useSubmitName(name);

  const showMask = masked && !focused && engine.raw && rule?.mask && check(engine.raw).valid;
  const shown = showMask ? rule!.mask!(engine.raw!) : engine.display;

  return (
    <>
      <WithoutFieldName>
        <Input
          ref={ref}
          {...rest}
          {...engine.inputProps}
          value={shown}
          disabled={disabled}
          inputMode={digits ? "numeric" : "text"}
          autoComplete="off"
          spellCheck={false}
          dir="ltr"
          placeholder={placeholder}
          invalid={invalid || v.invalid}
          inputClassName={cn(mono && "font-mono tabular tracking-[0.02em]", inputClassName)}
          data-slot="id-input"
          data-kind={rule?.id}
          data-masked={showMask ? "" : undefined}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            engine.inputProps.onKeyDown(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            engine.inputProps.onBlur(e);
            const c = check(normalize(e.currentTarget.value) || null);
            v.report({ valid: c.valid, reason: c.reason, message: c.message }, "blur");
            onBlur?.(e);
          }}
        />
      </WithoutFieldName>
      {submitName ? <input type="hidden" name={submitName} value={engine.raw ?? ""} disabled={disabled} /> : null}
    </>
  );
});

export interface NationalIdInputProps extends Omit<IdInputProps, "kind"> {
  /** Default `"tr-tckn"` (accepts YKN too). */
  kind?: IdKind | IdInputRule;
}

/** `IdInput` preset for personal IDs. Default kind `tr-tckn`. */
export const NationalIdInput = /*#__PURE__*/ React.forwardRef<HTMLInputElement, NationalIdInputProps>(function NationalIdInput({ kind = "tr-tckn", ...props }, ref) {
  return <IdInput ref={ref} kind={kind} {...props} />;
});

/** `IdInput` preset for tax numbers. Default kind `tr-tax-id` (VKN or a sole proprietor's TCKN). */
export const TaxIdInput = /*#__PURE__*/ React.forwardRef<HTMLInputElement, NationalIdInputProps>(function TaxIdInput({ kind = "tr-tax-id", ...props }, ref) {
  return <IdInput ref={ref} kind={kind} {...props} />;
});
