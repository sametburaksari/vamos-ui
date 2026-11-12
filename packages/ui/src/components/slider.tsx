"use client";

import * as React from "react";
import * as SliderPrimitive from "radix-ui/slider";
import { cn } from "../lib/cn";
import { mergeIds } from "../lib/compose-refs";
import { FieldContextReset, useFieldContext } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { Input } from "./input";

const sliderLabels = {
  min: "Minimum",
  max: "Maximum",
  value: "Value {index} of {total}",
};
export type SliderLabels = typeof sliderLabels;

export type SliderMark = number | { value: number; label: React.ReactNode };

export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, "value" | "defaultValue" | "onValueChange" | "onValueCommit" | "name" | "children"> {
  /** One number = single slider, two = range. */
  value?: number[];
  defaultValue?: number[];
  /** Fires continuously while dragging. */
  onValueChange?: (value: number[]) => void;
  /** Fires on release / key up — wire filters and server requests here. */
  onValueCommit?: (value: number[]) => void;
  /** Ticks under the track; objects get a text label. */
  marks?: SliderMark[];
  /** Custom formatter for the value bubble, `aria-valuetext` and marks. Wins over `formatOptions`. */
  formatValue?: (value: number) => string;
  /** `Intl.NumberFormat` options applied with the provider locale, e.g. `{ style: "currency", currency: "USD" }`. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Value bubble above the thumb: on hover/focus/drag, always, or never. Default `"hover"`. */
  showValue?: "never" | "hover" | "always";
  /** Number inputs under the track, synced with the thumbs (commit on blur / Enter). */
  withInputs?: boolean;
  size?: "sm" | "md";
  /** Accessible name per thumb. Range default: "Minimum" / "Maximum" (dictionary `slider`). */
  thumbLabels?: string[];
  /** Form name. Range values submit as repeated entries (`formData.getAll(name)`). */
  name?: string;
  /** Separate form names per thumb, e.g. `["priceMin", "priceMax"]`. */
  names?: string[];
  invalid?: boolean;
  /** Focusable, but the value can't change (`aria-readonly`). */
  readOnly?: boolean;
  required?: boolean;
  labels?: Partial<SliderLabels>;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const decimalsOf = (n: number) => {
  const s = String(n);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
};
const snap = (n: number, min: number, step: number) => {
  const d = decimalsOf(step);
  return Number((Math.round((n - min) / step) * step + min).toFixed(d));
};

/**
 * Pick a number or a range by dragging: price filter, salary band, deal probability, opacity.
 * Radix Slider (WAI-ARIA: arrows ± step, PageUp/PageDown ± 10 steps, Home/End). Values are
 * formatted with the provider locale (`aria-valuetext` included).
 *
 * ```tsx
 * <Field label="Price per night">
 *   <Slider defaultValue={[80, 240]} min={0} max={500} step={10} formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} withInputs />
 * </Field>
 * <Slider defaultValue={[60]} marks={[0, 25, 50, 75, 100]} aria-label="Deal probability" />
 * ```
 */
export const Slider = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(function Slider(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    marks,
    formatValue,
    formatOptions,
    showValue = "hover",
    withInputs,
    size = "md",
    thumbLabels,
    name,
    names,
    invalid,
    readOnly,
    required,
    disabled,
    labels,
    id,
    className,
    orientation = "horizontal",
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
    ...props
  },
  ref,
) {
  const field = useFieldContext();
  const t = useLabels("slider", sliderLabels, labels);
  const f = useFormat();
  const [value, setValue] = useControllableState<number[]>({
    value: valueProp,
    defaultValue: defaultValue ?? [min],
    onChange: onValueChange,
    name: "Slider",
  });
  const [dragging, setDragging] = React.useState(false);
  const fmt = React.useCallback((n: number) => (formatValue ? formatValue(n) : f.number(n, formatOptions)), [formatValue, f, formatOptions]);

  const isDisabled = disabled ?? field?.disabled;
  const isReadOnly = readOnly ?? field?.readOnly;
  const isInvalid = invalid ?? field?.invalid;
  const isRequired = required ?? field?.required;
  const formName = name ?? field?.name;
  const autoId = React.useId().replace(/:/g, "");
  const rootId = id ?? field?.id;
  const groupLabel = labelledBy ?? field?.labelId;
  const count = value.length;

  const thumbName = (i: number) => {
    const own = thumbLabels?.[i];
    if (own) return own;
    if (count === 2) return i === 0 ? t("min") : t("max");
    if (count > 2) return t("value", { index: i + 1, total: count });
    return undefined;
  };

  const commit = (next: number[]) => {
    if (isReadOnly) return;
    setValue(next);
    onValueCommit?.(next);
  };

  const markList = (marks ?? []).map((m) => (typeof m === "number" ? { value: m, label: undefined as React.ReactNode } : m));
  const pct = (n: number) => ((clamp(n, min, max) - min) / (max - min || 1)) * 100;
  const vertical = orientation === "vertical";
  // Radix keeps thumbs inside the track (half a thumb in at the ends); marks follow the same curve.
  const half = size === "sm" ? 7 : 9;
  const atThumb = (n: number) => {
    const p = pct(n);
    return `calc(${p}% + ${(half * (1 - p / 50)).toFixed(2)}px)`;
  };

  return (
    <div
      data-slot="slider-field"
      data-size={size}
      className={cn("grid gap-3", vertical && "h-full w-fit", className)}
      data-disabled={isDisabled ? "" : undefined}
    >
      <SliderPrimitive.Root
        {...props}
        ref={ref}
        id={rootId}
        data-slot="slider"
        data-readonly={isReadOnly ? "" : undefined}
        data-dragging={dragging ? "" : undefined}
        aria-invalid={isInvalid || undefined}
        min={min}
        max={max}
        step={step}
        orientation={orientation}
        disabled={isDisabled}
        value={value}
        onValueChange={(next) => {
          if (isReadOnly) return;
          setDragging(true);
          setValue(next);
        }}
        onValueCommit={(next) => {
          setDragging(false);
          if (!isReadOnly) onValueCommit?.(next);
        }}
        onPointerUp={(e) => {
          setDragging(false);
          props.onPointerUp?.(e);
        }}
        className={cn(
          "group/slider relative flex touch-none select-none items-center data-disabled:opacity-45",
          vertical ? "h-full min-h-32 w-5 flex-col" : "h-5 w-full",
          isReadOnly && "cursor-default",
          // room for the value bubble
          showValue === "always" && !vertical && "mt-7",
          markList.length > 0 && !vertical && (markList.some((m) => m.label != null) ? "mb-7" : "mb-2"),
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative grow overflow-hidden rounded-full bg-track",
            vertical ? (size === "sm" ? "w-1" : "w-1.5") : size === "sm" ? "h-1" : "h-1.5",
            "group-aria-invalid/slider:bg-[color-mix(in_srgb,var(--danger)_25%,transparent)]",
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn("absolute rounded-full bg-accent-ink", vertical ? "w-full" : "h-full", "group-aria-invalid/slider:bg-danger group-data-readonly/slider:bg-fg-subtle")}
          />
        </SliderPrimitive.Track>

        {markList.length ? (
          <div aria-hidden className={cn("pointer-events-none absolute", vertical ? "inset-y-0 start-full ms-1.5" : "inset-x-0 top-full mt-1")}>
            {markList.map((m) => {
              const active = count === 1 ? m.value <= value[0]! : m.value >= Math.min(...value) && m.value <= Math.max(...value);
              return (
                <span
                  key={m.value}
                  data-active={active ? "" : undefined}
                  className={cn("absolute flex items-center gap-1", vertical ? "-translate-y-1/2 flex-row" : "-translate-x-1/2 flex-col rtl:translate-x-1/2")}
                  style={vertical ? { bottom: atThumb(m.value) } : { insetInlineStart: atThumb(m.value) }}
                >
                  <span className={cn("rounded-full", vertical ? "h-px w-1.5" : "h-1.5 w-px", active ? "bg-accent-ink" : "bg-field-border-hover")} />
                  {m.label != null ? <span className="whitespace-nowrap font-mono text-[11px] tabular text-fg-subtle">{m.label}</span> : null}
                </span>
              );
            })}
          </div>
        ) : null}

        {value.map((v, i) => {
          const own = thumbName(i);
          const labelSpanId = own && groupLabel ? `${autoId}-thumb-${i}` : undefined;
          return (
            <SliderPrimitive.Thumb
              key={i}
              data-slot="slider-thumb"
              name={names?.[i] ?? formName}
              aria-label={labelSpanId ? undefined : (own ?? ariaLabel)}
              aria-labelledby={labelSpanId ? `${groupLabel} ${labelSpanId}` : own ? undefined : groupLabel}
              aria-describedby={mergeIds(field?.describedBy, describedBy)}
              aria-valuetext={fmt(v)}
              aria-invalid={isInvalid || undefined}
              aria-readonly={isReadOnly || undefined}
              aria-required={isRequired || undefined}
              className={cn(
                "group/thumb relative block rounded-full border-2 border-accent-ink bg-popover-nested outline-none",
                "shadow-[0_1px_3px_rgb(0_0_0/0.18)] transition-[transform,box-shadow] duration-150",
                "hover:shadow-[0_0_0_5px_var(--accent-soft),0_1px_3px_rgb(0_0_0/0.18)]",
                "focus-visible:shadow-[0_0_0_2px_var(--scene),0_0_0_4px_var(--ring)]",
                "motion-safe:active:scale-110 group-data-dragging/slider:cursor-grabbing",
                "group-aria-invalid/slider:border-danger group-data-readonly/slider:border-fg-subtle group-data-disabled/slider:cursor-not-allowed",
                size === "sm" ? "size-3.5" : "size-[18px]",
                isReadOnly ? "cursor-default" : "cursor-grab",
              )}
            >
              {labelSpanId ? (
                <span id={labelSpanId} hidden>
                  {own}
                </span>
              ) : null}
              {showValue !== "never" ? (
                <span
                  aria-hidden
                  data-slot="slider-value"
                  className={cn(
                    "pointer-events-none absolute whitespace-nowrap rounded-[6px] bg-fg px-1.5 py-0.5 font-mono text-[11px] font-medium tabular text-scene",
                    "transition-[opacity,transform] duration-150",
                    vertical ? "start-full top-1/2 ms-3 -translate-y-1/2" : "bottom-full left-1/2 mb-2.5 -translate-x-1/2",
                    showValue === "hover" &&
                      "opacity-0 scale-95 group-hover/thumb:opacity-100 group-hover/thumb:scale-100 group-focus-visible/thumb:opacity-100 group-focus-visible/thumb:scale-100 group-data-dragging/slider:opacity-100 group-data-dragging/slider:scale-100",
                  )}
                >
                  {fmt(v)}
                </span>
              ) : null}
            </SliderPrimitive.Thumb>
          );
        })}
      </SliderPrimitive.Root>

      {withInputs && !vertical ? (
        <FieldContextReset>
          <SliderInputs
            value={value}
            min={min}
            max={max}
            step={step}
            size={size}
            disabled={isDisabled}
            readOnly={isReadOnly}
            names={value.map((_, i) => thumbName(i) ?? ariaLabel ?? t("value", { index: i + 1, total: count }))}
            groupLabel={groupLabel}
            idBase={autoId}
            onCommit={commit}
          />
        </FieldContextReset>
      ) : null}
    </div>
  );
});

function SliderInputs({
  value,
  min,
  max,
  step,
  size,
  disabled,
  readOnly,
  names,
  groupLabel,
  idBase,
  onCommit,
}: {
  value: number[];
  min: number;
  max: number;
  step: number;
  size: "sm" | "md";
  disabled?: boolean;
  readOnly?: boolean;
  names: string[];
  groupLabel?: string;
  idBase: string;
  onCommit: (v: number[]) => void;
}) {
  const [drafts, setDrafts] = React.useState<string[] | null>(null);
  const shown = drafts ?? value.map(String);

  const apply = (i: number, raw: string) => {
    setDrafts(null);
    const n = Number(raw.replace(",", "."));
    if (raw.trim() === "" || Number.isNaN(n)) return;
    const next = [...value];
    const lo = i > 0 ? next[i - 1]! : min;
    const hi = i < next.length - 1 ? next[i + 1]! : max;
    next[i] = clamp(snap(n, min, step), lo, hi);
    onCommit(next);
  };

  return (
    <div data-slot="slider-inputs" className="flex items-center gap-2">
      {value.map((_, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <span aria-hidden className="h-px w-3 shrink-0 bg-field-border" />
          ) : null}
          <span id={`${idBase}-input-${i}`} hidden>
            {names[i]}
          </span>
          <Input
            type="number"
            inputMode="decimal"
            size={size === "sm" ? "sm" : "md"}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            aria-labelledby={mergeIds(groupLabel, `${idBase}-input-${i}`)}
            value={shown[i] ?? ""}
            onChange={(e) => {
              const next = [...shown];
              next[i] = e.currentTarget.value;
              setDrafts(next);
            }}
            onBlur={(e) => apply(i, e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply(i, e.currentTarget.value);
              }
            }}
            className="w-28 min-w-0 flex-1 sm:flex-none"
            inputClassName="tabular font-mono text-[13px]"
          />
        </React.Fragment>
      ))}
    </div>
  );
}
