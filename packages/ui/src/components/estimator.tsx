"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useControllableState, useEventCallback } from "../lib/use-controllable-state";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { NumberInput } from "./formatted-input";
import { Field, Fieldset } from "./input";
import { NativeSelect } from "./native-select";
import { RadioGroup } from "./radio-group";
import { Slider, type SliderMark } from "./slider";
import { Switch } from "./switch";

export const estimatorLabels = {
  /** Heading of the summary panel. */
  summary: "Estimate",
  total: "Total",
  /** A price range: "₺8,000–11,500". */
  range: "{low}–{high}",
  /** The polite live announcement after a change. */
  live: "{label}: {value}",
  /** Shown instead of the figure while the formula returns `total: null`. */
  empty: "Make a choice to see the price.",
  /** Mobile bottom bar: moves focus to the summary panel. */
  details: "See the breakdown",
  /** "01" before each input label when `numbered`. */
  step: "{n}",
};
export type EstimatorLabels = typeof estimatorLabels;

/** The value of one input: number / slider → number, select / options → string, toggle → boolean, addons → string[]. */
export type EstimatorValue = number | string | boolean | string[];
export type EstimatorValues = Record<string, EstimatorValue>;

export interface EstimatorChoice {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing text on the option: "+ ₺1,200", "from ₺450". */
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Show this choice only when it returns true (e.g. an add-on offered to one company type). Hidden add-ons are left out of the values. */
  when?: (values: EstimatorValues) => boolean;
}

interface EstimatorInputBase {
  /** Key in the values object. */
  id: string;
  label: React.ReactNode;
  /** Line under the label; a function gets the current values ("₺90 per person a month"). */
  hint?: React.ReactNode | ((values: EstimatorValues) => React.ReactNode);
  /** Show the input only when it returns true. A hidden input keeps its value; the formula decides whether it counts. */
  when?: (values: EstimatorValues) => boolean;
  disabled?: boolean;
}

export interface EstimatorNumberInput extends EstimatorInputBase {
  type: "number";
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface EstimatorSliderInput extends EstimatorInputBase {
  type: "slider";
  defaultValue?: number;
  min: number;
  max: number;
  step?: number;
  marks?: SliderMark[];
  /** Value text for the bubble, the label row and `aria-valuetext`: `(v) => \`${v} people\``. */
  format?: (value: number) => string;
  /** Synced number field beside the slider. */
  withInput?: boolean;
}

export interface EstimatorSelectInput extends EstimatorInputBase {
  type: "select";
  defaultValue?: string;
  options: (Omit<EstimatorChoice, "label"> & { label: string })[];
}

export interface EstimatorToggleInput extends EstimatorInputBase {
  type: "toggle";
  defaultValue?: boolean;
  /** Text under the switch label. */
  description?: React.ReactNode;
}

export interface EstimatorOptionsInput extends EstimatorInputBase {
  type: "options";
  defaultValue?: string;
  options: EstimatorChoice[];
  /** `"card"` (default): tiles with description and meta. `"segmented"`: short labels in one row. */
  variant?: "card" | "segmented";
  /** Card columns from the container's `@xl` width. Default 2. */
  columns?: 1 | 2 | 3 | 4;
}

export interface EstimatorAddonsInput extends EstimatorInputBase {
  type: "addons";
  defaultValue?: string[];
  options: EstimatorChoice[];
  /** Card columns from the container's `@xl` width. Default 2. */
  columns?: 1 | 2 | 3 | 4;
}

export type EstimatorInput = EstimatorNumberInput | EstimatorSliderInput | EstimatorSelectInput | EstimatorToggleInput | EstimatorOptionsInput | EstimatorAddonsInput;

export interface EstimateLine {
  id: string;
  label: React.ReactNode;
  /** Amount of the line. `null` with `text` for a line without a price ("Included", "Doesn't fit"). */
  amount?: number | null;
  /** Shown instead of the amount. */
  text?: React.ReactNode;
  /** Second line under the label: "6 × ₺90", "2 extra hours". */
  detail?: React.ReactNode;
  /**
   * `"item"` (default) · `"discount"` (shown as a minus, success colour) · `"subtotal"` and `"tax"`
   * (after a rule, muted) · `"info"` (no amount column).
   */
  kind?: "item" | "discount" | "subtotal" | "tax" | "info";
  /** Mark the line, e.g. the cheapest plan when lines compare plans. */
  highlight?: boolean;
  badge?: React.ReactNode;
}

export interface EstimateResult {
  /** The headline figure. `null` while nothing is chosen (the CTA is disabled). */
  total: number | null;
  /** Show a range instead of one figure: `[low, high]`. */
  range?: [number, number];
  lines?: EstimateLine[];
  /** A short spec sheet in a two-column grid: crew, duration, ready by, per unit. */
  facts?: { label: React.ReactNode; value: React.ReactNode }[];
  /** Fine print under the figure: assumptions, VAT, validity. */
  notes?: React.ReactNode[];
  /** `false` disables the CTA (e.g. a date is still missing). Default: `total !== null`. */
  ready?: boolean;
}

export type EstimatorFormat = "currency" | "number" | ((value: number) => string);

export interface EstimatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "onSubmit" | "title"> {
  inputs: EstimatorInput[];
  /** Pure function from the values to the result. Runs on every change; keep it fast and free of side effects. */
  formula: (values: EstimatorValues) => EstimateResult;
  values?: EstimatorValues;
  /** Initial values; inputs fall back to their own `defaultValue`, then min / first option / false / []. */
  defaultValues?: EstimatorValues;
  onValuesChange?: (values: EstimatorValues, result: EstimateResult) => void;
  /** How amounts read. Default `"currency"` (provider currency, or `currency`). */
  format?: EstimatorFormat;
  currency?: string;
  /** Fraction digits for currency and number amounts. Default 0. */
  fractionDigits?: number;
  /** Heading of the summary panel. Default label `summary`. */
  title?: React.ReactNode;
  /** Label beside the figure: "Monthly, excl. VAT". Default label `total`. */
  totalLabel?: React.ReactNode;
  /** After the figure: "/ month". */
  totalSuffix?: React.ReactNode;
  /** Number the input labels 01, 02… */
  numbered?: boolean;
  /** The call to action under the summary. */
  cta?: React.ReactNode;
  /** Link the CTA opens (e.g. "#contact"); without it the CTA is a button. */
  ctaHref?: string;
  /** Called by the CTA with the values and result — open a form, store the selection, navigate. */
  onSubmit?: (values: EstimatorValues, result: EstimateResult) => void;
  /** Posts the selection with a form: renders `<input type="hidden" name>` holding `serialize(values, result)`. */
  name?: string;
  /** `form` attribute of the hidden field, to belong to a form elsewhere on the page. */
  form?: string;
  /** Hidden-field text. Default: JSON of `{ values, total, range }`. */
  serialize?: (values: EstimatorValues, result: EstimateResult) => string;
  /** Extra content in the summary panel under the lines: a chart, a timeline, a secondary action. */
  summaryExtra?: (values: EstimatorValues, result: EstimateResult) => React.ReactNode;
  /** Sticky offset of the summary panel on wide containers (below a fixed header). Default `"1.5rem"`. */
  stickyTop?: string;
  labels?: Partial<EstimatorLabels>;
}

const colsClass = { 1: "", 2: "@xl:grid-cols-2", 3: "@xl:grid-cols-2 @3xl:grid-cols-3", 4: "@xl:grid-cols-2 @3xl:grid-cols-4" } as const;

function initialValue(input: EstimatorInput): EstimatorValue {
  switch (input.type) {
    case "number":
      return input.defaultValue ?? input.min ?? 0;
    case "slider":
      return input.defaultValue ?? input.min;
    case "select":
    case "options":
      return input.defaultValue ?? input.options.find((o) => !o.disabled)?.value ?? "";
    case "toggle":
      return input.defaultValue ?? false;
    case "addons":
      return input.defaultValue ?? [];
  }
}

/** Default values for a set of inputs (each input's `defaultValue`, then min / first option / false / []), merged with `overrides`. */
export function estimatorDefaults(inputs: EstimatorInput[], overrides?: EstimatorValues): EstimatorValues {
  const out: EstimatorValues = {};
  for (const input of inputs) out[input.id] = initialValue(input);
  return { ...out, ...overrides };
}

/**
 * The values the formula sees: add-ons whose `when` fails are dropped, and a single choice whose
 * option is hidden falls back to the first visible one.
 */
export function effectiveEstimatorValues(inputs: EstimatorInput[], values: EstimatorValues): EstimatorValues {
  const out = { ...values };
  for (const input of inputs) {
    if (input.type === "addons") {
      const list = Array.isArray(out[input.id]) ? (out[input.id] as string[]) : [];
      out[input.id] = list.filter((v) => {
        const o = input.options.find((x) => x.value === v);
        return o && !o.disabled && (!o.when || o.when(values));
      });
    } else if (input.type === "options" || input.type === "select") {
      const visible = input.options.filter((o) => !o.when || o.when(values));
      if (!visible.some((o) => o.value === out[input.id])) out[input.id] = visible.find((o) => !o.disabled)?.value ?? "";
    }
  }
  return out;
}

const defaultSerialize = (values: EstimatorValues, result: EstimateResult) => JSON.stringify({ values, total: result.total, range: result.range });

/**
 * A live calculator: declarative inputs (number, slider, select, toggle, option cards, add-on
 * checkboxes) feed a pure `formula`, and a summary panel shows the total (or a range), the line
 * items, a spec sheet, notes and a call to action that hands the selection on — as a callback, a
 * link or a hidden form field. Fee estimates, quotes, package builders, usage pricing, planners.
 * The panel is sticky beside the inputs on wide containers; on narrow ones a bottom bar keeps
 * the figure in view.
 *
 * ```tsx
 * <Estimator
 *   inputs={[
 *     { type: "options", id: "size", label: "Home size", options: [{ value: "s", label: "1 room" }, { value: "m", label: "2–3 rooms" }] },
 *     { type: "slider", id: "km", label: "Distance", min: 1, max: 80, format: (v) => `${v} km` },
 *     { type: "addons", id: "extras", label: "Extras", options: [{ value: "pack", label: "Packing", meta: "+ ₺1,500" }] },
 *   ]}
 *   formula={(v) => ({ total: base[v.size as string] + (v.km as number) * 40 })}
 *   cta="Request this quote"
 *   onSubmit={(values) => openForm(values)}
 * />
 * ```
 */
export const Estimator = /*#__PURE__*/ React.forwardRef<HTMLDivElement, EstimatorProps>(function Estimator(
  {
    inputs,
    formula,
    values: valuesProp,
    defaultValues,
    onValuesChange,
    format = "currency",
    currency,
    fractionDigits = 0,
    title,
    totalLabel,
    totalSuffix,
    numbered = false,
    cta,
    ctaHref,
    onSubmit,
    name,
    form,
    serialize = defaultSerialize,
    summaryExtra,
    stickyTop = "1.5rem",
    labels,
    className,
    style,
    ...props
  },
  ref,
) {
  const t = useLabels("estimator", estimatorLabels, labels);
  const f = useFormat();
  const id = React.useId();
  const summaryRef = React.useRef<HTMLElement>(null);
  const notify = useEventCallback(onValuesChange);
  const [raw, setRaw] = useControllableState<EstimatorValues>({
    value: valuesProp,
    defaultValue: () => estimatorDefaults(inputs, defaultValues),
    name: "Estimator",
  });
  const values = React.useMemo(() => effectiveEstimatorValues(inputs, { ...estimatorDefaults(inputs), ...raw }), [inputs, raw]);
  const result = formula(values);

  const set = (key: string, v: EstimatorValue) => {
    const next = effectiveEstimatorValues(inputs, { ...values, [key]: v });
    setRaw(next);
    notify(next, formula(next));
  };

  const money = (n: number) =>
    typeof format === "function"
      ? format(n)
      : format === "number"
        ? f.number(n, { maximumFractionDigits: fractionDigits })
        : f.currency(n, currency ?? f.currencyCode, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
  const figure = result.range ? t("range", { low: money(result.range[0]), high: money(result.range[1]) }) : result.total != null ? money(result.total) : null;
  const ready = result.ready ?? result.total !== null;
  const heading = title ?? t("summary");
  const live = figure ? t("live", { label: typeof totalLabel === "string" ? totalLabel : t("total"), value: figure }) : t("empty");

  const submit = () => onSubmit?.(values, result);
  const ctaNode = cta ? (
    ctaHref && !onSubmit ? (
      <Button asChild variant="primary" size="lg" block>
        <a href={ctaHref} aria-disabled={ready ? undefined : true} onClick={ready ? undefined : (e) => e.preventDefault()}>
          {cta}
        </a>
      </Button>
    ) : (
      <Button
        type="button"
        variant="primary"
        size="lg"
        block
        disabled={!ready}
        onClick={() => {
          submit();
          if (ctaHref && typeof window !== "undefined") window.location.assign(ctaHref);
        }}
      >
        {cta}
      </Button>
    )
  ) : null;

  const visibleInputs = inputs.filter((input) => !input.when || input.when(values));
  const lines = result.lines ?? [];
  const items = lines.filter((l) => l.kind !== "subtotal" && l.kind !== "tax");
  const totals = lines.filter((l) => l.kind === "subtotal" || l.kind === "tax");

  const renderLine = (l: EstimateLine) => {
    const amount =
      l.text ?? (l.amount == null ? null : l.kind === "discount" ? `−${money(Math.abs(l.amount))}` : money(l.amount));
    return (
      <div
        key={l.id}
        data-line={l.id}
        data-kind={l.kind ?? "item"}
        data-highlight={l.highlight ? "" : undefined}
        className={cn("flex items-baseline justify-between gap-4 py-2", l.highlight && "-mx-2 rounded-ui-sm bg-accent-soft px-2")}
      >
        <dt className="min-w-0">
          <span className={cn("flex flex-wrap items-center gap-2", l.kind === "subtotal" || l.kind === "tax" ? "text-fg-muted" : "text-fg")}>
            {l.label}
            {l.badge ? <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-fg">{l.badge}</span> : null}
          </span>
          {l.detail ? <span className="mt-0.5 block text-xs text-fg-muted">{l.detail}</span> : null}
        </dt>
        {l.kind === "info" && amount == null ? null : (
          <dd className={cn("m-0 shrink-0 text-end font-mono tabular", l.kind === "discount" ? "text-success" : l.kind === "tax" ? "text-fg-muted" : "text-fg")}>{amount ?? "—"}</dd>
        )}
      </div>
    );
  };

  return (
    <div ref={ref} data-slot="estimator" className={cn("@container min-w-0", className)} style={style} {...props}>
      <div className="grid items-start gap-8 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] @3xl:gap-10">
        <div className="flex min-w-0 flex-col gap-8" data-slot="estimator-inputs">
          {visibleInputs.map((input, i) => {
            const hint = typeof input.hint === "function" ? input.hint(values) : input.hint;
            const step = numbered ? <span className="me-2 font-mono text-xs font-normal text-fg-muted tabular">{t("step", { n: String(i + 1).padStart(2, "0") })}</span> : null;
            const label = (
              <>
                {step}
                {input.label}
              </>
            );
            const v = values[input.id];
            switch (input.type) {
              case "number":
                return (
                  <Field key={input.id} label={label} hint={hint} disabled={input.disabled}>
                    <NumberInput value={typeof v === "number" ? v : null} onValueChange={(n) => set(input.id, n ?? input.min ?? 0)} min={input.min} max={input.max} step={input.step} stepper className="max-w-48" />
                  </Field>
                );
              case "slider": {
                const n = typeof v === "number" ? v : input.min;
                return (
                  <Field
                    key={input.id}
                    label={
                      <span className="flex w-full items-baseline justify-between gap-3">
                        <span>{label}</span>
                        {input.withInput ? null : <span className="font-mono text-sm font-normal text-fg tabular">{input.format ? input.format(n) : f.number(n)}</span>}
                      </span>
                    }
                    hint={hint}
                    disabled={input.disabled}
                  >
                    <Slider value={[n]} onValueChange={(x) => set(input.id, x[0] ?? n)} min={input.min} max={input.max} step={input.step ?? 1} marks={input.marks} formatValue={input.format} withInputs={input.withInput} />
                  </Field>
                );
              }
              case "select":
                return (
                  <Field key={input.id} label={label} hint={hint} disabled={input.disabled}>
                    <NativeSelect
                      value={String(v ?? "")}
                      onChange={(e) => set(input.id, e.target.value)}
                      items={input.options.filter((o) => !o.when || o.when(values)).map((o) => ({ value: o.value, label: o.label, disabled: o.disabled }))}
                      className="max-w-sm"
                    />
                  </Field>
                );
              case "toggle":
                return (
                  <div key={input.id} className="grid gap-1">
                    <Switch checked={v === true} onCheckedChange={(on) => set(input.id, on)} label={label} description={input.description ?? hint} disabled={input.disabled} />
                  </div>
                );
              case "options": {
                const opts = input.options.filter((o) => !o.when || o.when(values));
                const legendId = `${id}-${input.id}-legend`;
                return (
                  <Fieldset key={input.id} legend={<span id={legendId}>{label}</span>} hint={hint} disabled={input.disabled}>
                    <RadioGroup
                      variant={input.variant ?? "card"}
                      value={String(v ?? "")}
                      onValueChange={(x) => set(input.id, x)}
                      aria-labelledby={legendId}
                      className={input.variant === "segmented" ? "flex-wrap" : cn("grid gap-3", colsClass[input.columns ?? 2])}
                      items={opts.map((o) => ({
                        value: o.value,
                        disabled: o.disabled,
                        icon: o.icon,
                        description: o.description,
                        label: o.meta ? (
                          <span className="flex w-full items-baseline justify-between gap-3">
                            <span>{o.label}</span>
                            <span className="shrink-0 font-mono text-xs font-normal text-fg-muted tabular">{o.meta}</span>
                          </span>
                        ) : (
                          o.label
                        ),
                      }))}
                    />
                  </Fieldset>
                );
              }
              case "addons": {
                const list = Array.isArray(v) ? v : [];
                const opts = input.options.filter((o) => !o.when || o.when(values));
                return (
                  <Fieldset key={input.id} legend={label} hint={hint} disabled={input.disabled}>
                    <ul className={cn("m-0 grid list-none gap-3 p-0", colsClass[input.columns ?? 2])}>
                      {opts.map((o) => (
                        <li key={o.value} className="min-w-0">
                          <Checkbox
                            variant="card"
                            checked={list.includes(o.value)}
                            disabled={o.disabled}
                            onCheckedChange={(on) => set(input.id, on === true ? [...list, o.value] : list.filter((x) => x !== o.value))}
                            label={
                              o.meta ? (
                                <span className="flex w-full items-baseline justify-between gap-3">
                                  <span>{o.label}</span>
                                  <span className="shrink-0 font-mono text-xs font-normal text-fg-muted tabular">{o.meta}</span>
                                </span>
                              ) : (
                                o.label
                              )
                            }
                            description={o.description}
                          />
                        </li>
                      ))}
                    </ul>
                  </Fieldset>
                );
              }
            }
          })}

          <div data-slot="estimator-bar" className="sticky bottom-0 z-10 -mx-1 flex items-center justify-between gap-3 rounded-ui border border-line bg-surface px-4 py-3 shadow-sm @3xl:hidden">
            <span className="min-w-0" aria-hidden="true">
              <span className="block text-xs text-fg-muted">{totalLabel ?? t("total")}</span>
              <span className="block truncate font-mono text-lg font-semibold text-fg tabular">
                {figure ?? "—"}
                {figure && totalSuffix ? <span className="ms-1 text-xs font-normal text-fg-muted">{totalSuffix}</span> : null}
              </span>
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const el = summaryRef.current;
                el?.scrollIntoView({ block: "start", behavior: "smooth" });
                el?.focus({ preventScroll: true });
              }}
            >
              {t("details")}
            </Button>
          </div>
        </div>

        <aside
          ref={summaryRef}
          tabIndex={-1}
          aria-labelledby={`${id}-summary`}
          data-slot="estimator-summary"
          className="surface flex min-w-0 flex-col gap-5 rounded-ui-lg border border-line p-5 focus-ring @3xl:sticky @3xl:top-(--estimator-top)"
          style={{ "--estimator-top": stickyTop } as React.CSSProperties}
        >
          <h2 id={`${id}-summary`} className="m-0 text-xs font-medium tracking-[0.08em] text-fg-muted uppercase">
            {heading}
          </h2>
          <div className="grid gap-1">
            <span className="text-small text-fg-muted">{totalLabel ?? t("total")}</span>
            <p className="m-0 flex flex-wrap items-baseline gap-x-2 font-mono text-[1.75rem] leading-tight font-semibold text-fg tabular" data-slot="estimator-total">
              {figure ?? <span className="font-sans text-small font-normal text-fg-muted">{t("empty")}</span>}
              {figure && totalSuffix ? <span className="font-sans text-small font-normal text-fg-muted">{totalSuffix}</span> : null}
            </p>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {live}
            </p>
          </div>

          {result.facts?.length ? (
            <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-ui border border-line bg-line">
              {result.facts.map((fact, i) => (
                <div key={i} className="flex min-w-0 flex-col gap-0.5 bg-surface p-3">
                  <dt className="text-xs text-fg-muted">{fact.label}</dt>
                  <dd className="m-0 font-mono text-small text-fg tabular">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {items.length || totals.length ? (
            <div className="flex flex-col text-small" data-slot="estimator-lines">
              {items.length ? <dl className="m-0 flex flex-col divide-y divide-line">{items.map(renderLine)}</dl> : null}
              {totals.length ? <dl className={cn("m-0 flex flex-col", items.length && "mt-1 border-t border-line pt-1")}>{totals.map(renderLine)}</dl> : null}
            </div>
          ) : null}

          {summaryExtra ? summaryExtra(values, result) : null}

          {result.notes?.length ? (
            <ul className="m-0 grid list-none gap-1 p-0 text-xs text-fg-muted">
              {result.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : null}

          {ctaNode}
          {name ? <input type="hidden" name={name} form={form} value={serialize(values, result)} /> : null}
        </aside>
      </div>
    </div>
  );
});
