"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { CurrencyInput } from "./currency-input";
import { Field } from "./input";
import { RadioGroup } from "./radio-group";

export const amountPickerLabels = {
  frequency: "How often",
  once: "One-off",
  monthly: "Monthly",
  amount: "Amount",
  custom: "Other amount",
  customInput: "Your amount",
  /** Summary of the choice, one-off. */
  summaryOnce: "{amount} once",
  /** Summary of the choice for a frequency with a suffix ("a month"). */
  summaryRecurring: "{amount} {suffix}",
  perMonth: "a month",
  min: "The minimum is {min}.",
  max: "The maximum is {max}.",
  empty: "Choose or enter an amount.",
};
export type AmountPickerLabels = typeof amountPickerLabels;

export interface AmountOption {
  value: number;
  /** What this amount does: "Shelves one new picture book". Shown for the selected amount. */
  impact?: React.ReactNode;
  /** Small tag on the option: "Most chosen". */
  badge?: React.ReactNode;
}

export interface AmountFrequency {
  id: string;
  label: React.ReactNode;
  /** Words after the amount in the summary ("a month"). Without it the summary reads as one-off. */
  suffix?: string;
}

export interface AmountPickerValue {
  amount: number | null;
  frequency: string;
}

export interface AmountPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
  /** Preset amounts, or a function giving the presets per frequency (smaller monthly amounts). */
  amounts: AmountOption[] | ((frequency: string) => AmountOption[]);
  /** Frequency switch. Default: one-off and monthly. `false` hides it (one-off only). */
  frequencies?: AmountFrequency[] | false;
  value?: AmountPickerValue;
  defaultValue?: Partial<AmountPickerValue>;
  onValueChange?: (value: AmountPickerValue) => void;
  /** An "Other amount" option with a currency field. Default true. */
  allowCustom?: boolean;
  /** Bounds for any amount, checked on the custom field. */
  min?: number;
  max?: number;
  /** Impact line for any amount (custom ones too). Default: the impact of the largest preset at or below the amount. */
  impact?: (amount: number, frequency: string) => React.ReactNode;
  currency?: string;
  /** Posts the amount (hidden input, plain decimal). */
  name?: string;
  /** Posts the frequency id. */
  frequencyName?: string;
  form?: string;
  /** Preset columns from the container's `@md` width. Default 3. */
  columns?: 2 | 3 | 4;
  labels?: Partial<AmountPickerLabels>;
}

const CUSTOM = "custom";
const colsClass = { 2: "grid-cols-2", 3: "grid-cols-2 @md:grid-cols-3", 4: "grid-cols-2 @md:grid-cols-4" } as const;

/** Impact of the largest preset at or below `amount` (presets sorted by value first). */
export function impactFor(options: AmountOption[], amount: number | null): React.ReactNode {
  if (amount == null) return null;
  const below = [...options].filter((o) => o.value <= amount && o.impact != null).sort((a, b) => b.value - a.value);
  return below[0]?.impact ?? null;
}

/**
 * Pick an amount to give or pay: preset amounts with an impact line ("₺250 shelves ten new
 * books"), an "Other amount" currency field with bounds, and a one-off / monthly switch (or your
 * own frequencies) that can swap the presets. Donations, tips, top-ups, gift cards, pledges.
 * Posts the amount and the frequency with `name` / `frequencyName`.
 *
 * ```tsx
 * <AmountPicker
 *   amounts={(f) => (f === "monthly" ? [{ value: 100 }, { value: 250 }] : [{ value: 250 }, { value: 500, impact: "A month of reading club" }])}
 *   min={50}
 *   name="amount"
 *   frequencyName="frequency"
 * />
 * ```
 */
export const AmountPicker = /*#__PURE__*/ React.forwardRef<HTMLDivElement, AmountPickerProps>(function AmountPicker(
  { amounts, frequencies, value: valueProp, defaultValue, onValueChange, allowCustom = true, min, max, impact, currency, name, frequencyName, form, columns = 3, labels, className, ...props },
  ref,
) {
  const t = useLabels("amountPicker", amountPickerLabels, labels);
  const f = useFormat();
  const id = React.useId();
  const cur = currency ?? f.currencyCode;
  const freqs: AmountFrequency[] =
    frequencies === false ? [] : (frequencies ?? [{ id: "once", label: t("once") }, { id: "monthly", label: t("monthly"), suffix: t("perMonth") }]);
  const firstFreq = freqs[0]?.id ?? "once";
  const presetsFor = (fr: string) => (typeof amounts === "function" ? amounts(fr) : amounts);
  const [value, setValue] = useControllableState<AmountPickerValue>({
    value: valueProp,
    defaultValue: () => {
      const fr = defaultValue?.frequency ?? firstFreq;
      return { frequency: fr, amount: defaultValue?.amount !== undefined ? defaultValue.amount : (presetsFor(fr)[0]?.value ?? null) };
    },
    onChange: onValueChange,
    name: "AmountPicker",
  });
  const presets = presetsFor(value.frequency);
  const isPreset = value.amount != null && presets.some((p) => p.value === value.amount);
  const [customMode, setCustomMode] = React.useState(!isPreset && value.amount != null);
  const custom = allowCustom && (customMode || (!isPreset && value.amount != null));
  const [draft, setDraft] = React.useState<string | null>(custom && value.amount != null ? String(value.amount) : null);

  const money = (n: number) => f.currency(n, cur, { maximumFractionDigits: Number.isInteger(n) ? 0 : 2 });
  const error = custom && value.amount != null ? (min != null && value.amount < min ? t("min", { min: money(min) }) : max != null && value.amount > max ? t("max", { max: money(max) }) : null) : null;
  const freq = freqs.find((x) => x.id === value.frequency);
  const impactLine = value.amount != null ? (impact ? impact(value.amount, value.frequency) : impactFor(presets, value.amount)) : null;
  const summary = value.amount == null ? t("empty") : freq?.suffix ? t("summaryRecurring", { amount: money(value.amount), suffix: freq.suffix }) : t("summaryOnce", { amount: money(value.amount) });

  const pickFrequency = (fr: string) => {
    const next = presetsFor(fr);
    // Keep a custom amount; move a preset to the same position in the new list.
    if (custom) setValue({ frequency: fr, amount: value.amount });
    else {
      const at = Math.max(0, presets.findIndex((p) => p.value === value.amount));
      setValue({ frequency: fr, amount: next[Math.min(at, next.length - 1)]?.value ?? null });
    }
  };
  const pickAmount = (v: string) => {
    if (v === CUSTOM) {
      setCustomMode(true);
      const n = draft != null && draft !== "" ? Number(draft) : null;
      setValue({ ...value, amount: n });
      return;
    }
    setCustomMode(false);
    setValue({ ...value, amount: Number(v) });
  };

  const freqLabelId = `${id}-freq`;
  const amountLabelId = `${id}-amount`;

  return (
    <div ref={ref} data-slot="amount-picker" className={cn("@container grid min-w-0 gap-5", className)} {...props}>
      {freqs.length > 1 ? (
        <div className="grid gap-2">
          <span id={freqLabelId} className="text-xs font-medium text-fg-muted">
            {t("frequency")}
          </span>
          <RadioGroup variant="segmented" aria-labelledby={freqLabelId} value={value.frequency} onValueChange={pickFrequency} items={freqs.map((x) => ({ value: x.id, label: x.label }))} />
        </div>
      ) : null}

      <div className="grid gap-2">
        <span id={amountLabelId} className="text-xs font-medium text-fg-muted">
          {t("amount")}
        </span>
        <RadioGroup
          variant="card"
          aria-labelledby={amountLabelId}
          value={custom ? CUSTOM : value.amount != null ? String(value.amount) : null}
          onValueChange={pickAmount}
          className={cn("grid gap-2", colsClass[columns])}
          items={[
            ...presets.map((p) => ({
              value: String(p.value),
              label: (
                <span className="flex w-full items-baseline justify-between gap-2">
                  <span className="font-mono text-base font-semibold tabular">{money(p.value)}</span>
                  {p.badge ? <span className="shrink-0 text-[11px] font-normal text-accent-ink">{p.badge}</span> : null}
                </span>
              ),
            })),
            ...(allowCustom ? [{ value: CUSTOM, label: t("custom") }] : []),
          ]}
        />
      </div>

      {custom ? (
        <Field label={t("customInput")} error={error ?? undefined}>
          <CurrencyInput
            currency={cur}
            precision={0}
            value={draft}
            onValueChange={(v) => {
              setDraft(v);
              setValue({ ...value, amount: v == null || v === "" ? null : Number(v) });
            }}
            className="max-w-56"
          />
        </Field>
      ) : null}

      <div className="grid gap-1 rounded-ui bg-accent-soft px-4 py-3" aria-live="polite" aria-atomic="true" data-slot="amount-summary">
        <span className="font-mono text-sm font-semibold text-fg tabular">{summary}</span>
        {impactLine ? <span className="text-small text-fg">{impactLine}</span> : null}
      </div>

      {name ? <input type="hidden" name={name} form={form} value={value.amount != null && !error ? String(value.amount) : ""} /> : null}
      {frequencyName ? <input type="hidden" name={frequencyName} form={form} value={value.frequency} /> : null}
    </div>
  );
});
