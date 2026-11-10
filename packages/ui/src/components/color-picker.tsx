"use client";

import * as React from "react";
import { HexAlphaColorPicker, HexColorPicker } from "react-colorful";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { Check, ChevronDown, Pipette } from "lucide-react";
import { cn } from "../lib/cn";
import { mergeIds } from "../lib/compose-refs";
import { FieldContextReset, useFieldContext, useFieldControl } from "../lib/field-context";
import { useLabels, type LabelFn } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { contrastLevel, contrastRatio, formatColor, parseColor, readableOn, rgbaToHex, type ColorFormat } from "../lib/color";
import { useControllableState } from "../lib/use-controllable-state";
import { controlVariants } from "../lib/variants";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { RadioGroup } from "./radio-group";

const colorLabels = {
  dialog: "Pick a color",
  area: "Saturation and brightness",
  hue: "Hue",
  alpha: "Opacity",
  input: "Color value",
  format: "Color format",
  swatches: "Swatches",
  swatch: "{name}, {value}",
  eyeDropper: "Pick a color from the screen",
  invalid: "Enter a hex, rgb() or oklch() color",
  contrast: "Contrast with {against}",
  ratio: "{ratio}:1",
  aaa: "AAA",
  aa: "AA",
  aaLarge: "AA large text",
  fail: "Fails",
  transparent: "Transparent",
};
export type ColorPickerLabels = typeof colorLabels;

/** One preset colour. `name` is what screen readers hear ("Lime, #c6f432"). */
export interface ColorSwatch {
  value: string;
  name?: string;
}

/** Theme tokens offered by `swatches="tokens"` (resolved to hex in the browser). */
const TOKEN_SWATCHES: Array<{ token: string; name: string }> = [
  { token: "--accent", name: "Accent" },
  { token: "--chart-2", name: "Blue" },
  { token: "--chart-5", name: "Teal" },
  { token: "--success", name: "Green" },
  { token: "--chart-3", name: "Orange" },
  { token: "--warning", name: "Amber" },
  { token: "--danger", name: "Red" },
  { token: "--chart-6", name: "Rose" },
  { token: "--chart-4", name: "Violet" },
  { token: "--fg-muted", name: "Gray" },
];

/** Resolves `"tokens"` to concrete hex swatches from the current theme. */
function useSwatches(swatches: ColorSwatch[] | "tokens" | undefined, probe: React.RefObject<HTMLElement | null>): ColorSwatch[] {
  const [resolved, setResolved] = React.useState<ColorSwatch[]>([]);
  React.useEffect(() => {
    if (swatches !== "tokens" || !probe.current) return;
    const el = document.createElement("span");
    probe.current.appendChild(el);
    const out: ColorSwatch[] = [];
    for (const { token, name } of TOKEN_SWATCHES) {
      el.style.color = `var(${token})`;
      const c = parseColor(getComputedStyle(el).color);
      if (c) out.push({ value: rgbaToHex({ ...c, a: 1 }), name });
    }
    el.remove();
    setResolved(out);
  }, [swatches, probe]);
  if (swatches === "tokens") return resolved;
  return swatches ?? [];
}

/* ------------------------------------------------------------------ */
/* Swatch picker                                                       */
/* ------------------------------------------------------------------ */

export interface ColorSwatchPickerProps {
  swatches: ColorSwatch[] | "tokens";
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (hex: string) => void;
  size?: "sm" | "md";
  name?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  labels?: Partial<ColorPickerLabels>;
}

/**
 * A row of preset colours as a radio group (one tab stop, arrow keys move and select). For label
 * colours, calendar categories and campaign colours where a free picker is too much.
 */
export const ColorSwatchPicker = React.forwardRef<HTMLDivElement, ColorSwatchPickerProps>(function ColorSwatchPicker(
  { swatches: swatchesProp, value: valueProp, defaultValue, onValueChange, size = "md", name: nameProp, disabled, id, className, labels, ...aria },
  ref,
) {
  const t = useLabels("colorPicker", colorLabels, labels);
  const field = useFieldContext();
  const probe = React.useRef<HTMLDivElement>(null);
  const swatches = useSwatches(swatchesProp, probe);
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp === undefined ? undefined : (valueProp?.toLowerCase() ?? null),
    defaultValue: defaultValue?.toLowerCase() ?? null,
    onChange: (v) => v && onValueChange?.(v),
    name: "ColorSwatchPicker",
  });
  const isDisabled = disabled ?? field?.disabled;
  return (
    <RadioGroupPrimitive.Root
      ref={(node) => {
        probe.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="color-swatch-picker"
      id={id ?? field?.id}
      name={nameProp ?? field?.name}
      disabled={isDisabled}
      value={value ?? ""}
      onValueChange={(v) => setValue(v)}
      orientation="horizontal"
      loop
      aria-label={aria["aria-label"] ?? (aria["aria-labelledby"] || field?.labelId ? undefined : t("swatches"))}
      aria-labelledby={aria["aria-labelledby"] ?? (aria["aria-label"] ? undefined : field?.labelId)}
      aria-describedby={field?.describedBy}
      className={cn("flex flex-wrap items-center", size === "sm" ? "gap-1.5" : "gap-2", className)}
    >
      <FieldContextReset>
        {swatches.map((s) => {
          const hex = s.value.toLowerCase();
          return (
            <RadioGroupPrimitive.Item
              key={hex}
              value={hex}
              aria-label={s.name ? t("swatch", { name: s.name, value: hex }) : hex}
              data-slot="color-swatch"
              className={cn(
                "ui-checker group/swatch relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full outline-none",
                "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--fg)_14%,transparent)] transition-transform duration-100",
                "hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-solid)",
                "data-[state=checked]:ring-2 data-[state=checked]:ring-fg data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-(--surface-solid)",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100",
                size === "sm" ? "size-5" : "size-7",
              )}
            >
              <span aria-hidden className="absolute inset-0" style={{ background: hex }} />
              <RadioGroupPrimitive.Indicator className="relative" style={{ color: readableOn(hex) }}>
                <Check aria-hidden strokeWidth={3} className={size === "sm" ? "size-3" : "size-3.5"} />
              </RadioGroupPrimitive.Indicator>
            </RadioGroupPrimitive.Item>
          );
        })}
      </FieldContextReset>
    </RadioGroupPrimitive.Root>
  );
});

/* ------------------------------------------------------------------ */
/* Contrast hint                                                       */
/* ------------------------------------------------------------------ */

function ContrastHint({ color, against, t }: { color: string; against: string; t: LabelFn<ColorPickerLabels> }) {
  const f = useFormat();
  const ratio = contrastRatio(color, against);
  if (ratio === null) return null;
  const level = contrastLevel(ratio);
  const levelText = level === "AAA" ? t("aaa") : level === "AA" ? t("aa") : level === "AA-large" ? t("aaLarge") : t("fail");
  const ok = level === "AAA" || level === "AA";
  return (
    <div data-slot="color-contrast" className="flex items-center gap-2.5 rounded-ui-sm border border-line bg-surface-2 p-1.5 pe-2.5">
      <span aria-hidden className="ui-checker relative flex h-7 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[6px] text-[13px] font-semibold">
        <span className="absolute inset-0" style={{ background: color }} />
        <span className="relative" style={{ color: against }}>
          Aa
        </span>
      </span>
      <span className="min-w-0 flex-1 text-xs leading-tight text-fg-muted">
        {t("contrast", { against: formatColor(against) })}
        <span className="block font-medium text-fg tabular">{t("ratio", { ratio: f.number(Math.floor(ratio * 10) / 10, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) })}</span>
      </span>
      <span
        className={cn(
          "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[11px] font-medium",
          ok ? "tone-success tone-soft" : level === "AA-large" ? "tone-warning tone-soft" : "tone-danger tone-soft",
        )}
      >
        {levelText}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

export interface ColorPickerPanelProps {
  value: string;
  onValueChange: (hex: string) => void;
  alpha?: boolean;
  swatches?: ColorSwatch[] | "tokens";
  eyeDropper?: boolean;
  format?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  /** Show a format switch (HEX / RGB / OKLCH) above the input. Default `true`. */
  showFormats?: boolean;
  contrastAgainst?: string;
  disabled?: boolean;
  className?: string;
  labels?: Partial<ColorPickerLabels>;
}

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

/** The picker body: saturation/brightness area, hue (and opacity) strip, value input, swatches, contrast. */
export function ColorPickerPanel({
  value,
  onValueChange,
  alpha = false,
  swatches,
  eyeDropper = true,
  format: formatProp,
  onFormatChange,
  showFormats = true,
  contrastAgainst,
  disabled,
  className,
  labels,
}: ColorPickerPanelProps) {
  const t = useLabels("colorPicker", colorLabels, labels);
  const [format, setFormat] = useControllableState<ColorFormat>({ value: formatProp, defaultValue: "hex", onChange: onFormatChange, name: "ColorPicker" });
  const areaRef = React.useRef<HTMLDivElement>(null);
  const [draft, setDraft] = React.useState<string | null>(null);
  const [draftInvalid, setDraftInvalid] = React.useState(false);
  const [canDrop, setCanDrop] = React.useState(false);
  const inputId = React.useId();
  const errorId = React.useId();
  const hasAlpha = alpha;
  const hex = value.toLowerCase();

  React.useEffect(() => setCanDrop(typeof window !== "undefined" && "EyeDropper" in window), []);

  // react-colorful names its sliders in English ("Color", "Hue", "Alpha"): use the dictionary.
  React.useEffect(() => {
    const sliders = areaRef.current?.querySelectorAll<HTMLElement>('[role="slider"]');
    if (!sliders) return;
    const names = [t("area"), t("hue"), t("alpha")];
    sliders.forEach((s, i) => {
      s.setAttribute("aria-label", names[i] ?? "");
      if (disabled) s.setAttribute("tabindex", "-1");
      else s.setAttribute("tabindex", "0");
      s.setAttribute("aria-disabled", disabled ? "true" : "false");
    });
  }, [t, disabled, hasAlpha]);

  const commitText = (text: string, final: boolean) => {
    const c = parseColor(text);
    if (!c) {
      if (final) setDraftInvalid(true);
      return;
    }
    const raw = text.trim().replace(/^#/, "");
    // While typing hex, wait for a complete value (6 or 8 digits) before applying.
    if (!final && /^[0-9a-f]*$/i.test(raw) && raw.length !== 6 && raw.length !== 8) return;
    setDraftInvalid(false);
    onValueChange(rgbaToHex(hasAlpha ? c : { ...c, a: 1 }, hasAlpha && c.a < 1));
    if (final) setDraft(null);
  };

  const shown = draft ?? (format === "hex" ? formatColor(hex, "hex").slice(1) : formatColor(hex, format));
  const Picker = hasAlpha ? HexAlphaColorPicker : HexColorPicker;
  const resolvedSwatches = swatches;

  return (
    <div data-slot="color-picker-panel" className={cn("grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3", disabled && "pointer-events-none opacity-60", className)}>
      <div ref={areaRef} data-slot="color-picker-area" className="ui-color-area">
        <Picker color={hex} onChange={(v: string) => onValueChange(hasAlpha ? (v.length === 9 && v.endsWith("ff") ? v.slice(0, 7) : v) : v)} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
        {showFormats ? (
          <RadioGroup
            variant="segmented"
            size="sm"
            aria-label={t("format")}
            value={format}
            onValueChange={(v) => {
              setFormat(v as ColorFormat);
              setDraft(null);
              setDraftInvalid(false);
            }}
            className="w-full [&>*]:flex-1"
            items={[
              { value: "hex", label: "HEX" },
              { value: "rgb", label: "RGB" },
              { value: "oklch", label: "OKLCH" },
            ]}
          />
        ) : null}
        <div className="flex items-center gap-2">
          <span aria-hidden className="ui-checker relative size-(--control-h) shrink-0 overflow-hidden rounded-ui border border-field-border">
            <span className="absolute inset-0" style={{ background: hex }} />
          </span>
          <label htmlFor={inputId} className="sr-only">
            {t("input")}
          </label>
          <div className={cn(controlVariants({ size: "md" }), "min-w-0 flex-1 gap-0 px-0")} data-slot="color-picker-input">
            {format === "hex" ? (
              <span aria-hidden className="ps-3 font-mono text-[13px] text-fg-subtle">
                #
              </span>
            ) : null}
            <input
              id={inputId}
              value={shown}
              spellCheck={false}
              autoComplete="off"
              disabled={disabled}
              aria-invalid={draftInvalid || undefined}
              aria-describedby={draftInvalid ? errorId : undefined}
              onChange={(e) => {
                setDraft(e.target.value);
                setDraftInvalid(false);
                commitText(e.target.value, false);
              }}
              onBlur={() => {
                if (draft !== null) commitText(draft, true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft !== null) {
                  e.preventDefault();
                  commitText(draft, true);
                }
                if (e.key === "Escape" && draft !== null) {
                  e.stopPropagation();
                  setDraft(null);
                  setDraftInvalid(false);
                }
              }}
              className={cn("h-full min-w-0 flex-1 bg-transparent font-mono text-[13px] text-fg outline-none tabular", format === "hex" ? "ps-1 pe-3" : "px-3")}
            />
          </div>
          {eyeDropper && canDrop ? (
            <button
              type="button"
              aria-label={t("eyeDropper")}
              disabled={disabled}
              onClick={async () => {
                try {
                  const Dropper = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
                  const res = await new Dropper().open();
                  const picked = parseColor(res.sRGBHex);
                  if (picked) onValueChange(rgbaToHex({ ...picked, a: 1 }));
                } catch {
                  /* cancelled */
                }
              }}
              className="inline-flex size-(--control-h) shrink-0 items-center justify-center rounded-ui border border-field-border bg-field text-fg-muted transition-colors hover:border-field-border-hover hover:text-fg focus-ring [&_svg]:size-4"
            >
              <Pipette aria-hidden />
            </button>
          ) : null}
        </div>
        {draftInvalid ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {t("invalid")}
          </p>
        ) : null}
      </div>
      {resolvedSwatches && (resolvedSwatches === "tokens" || resolvedSwatches.length > 0) ? (
        <ColorSwatchPicker
          swatches={resolvedSwatches}
          size="sm"
          value={hex.slice(0, 7)}
          onValueChange={(v) => onValueChange(v)}
          disabled={disabled}
          labels={labels}
          className="border-t border-line pt-3"
        />
      ) : null}
      {contrastAgainst ? <ContrastHint color={hex} against={contrastAgainst} t={t} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Color picker                                                        */
/* ------------------------------------------------------------------ */

export interface ColorPickerProps {
  /** `"#rrggbb"`, or `"#rrggbbaa"` with `alpha`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  /** Add an opacity strip; values become `#rrggbbaa` when not fully opaque. */
  alpha?: boolean;
  /** Preset colours under the picker, or `"tokens"` for the theme palette. */
  swatches?: ColorSwatch[] | "tokens";
  /** Screen colour picker button (only where the EyeDropper API exists). Default `true`. */
  eyeDropper?: boolean;
  /** Display / input format; the value is always hex. Default `"hex"`. */
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  /** Show the HEX / RGB / OKLCH switch. Default `true`. */
  showFormats?: boolean;
  /** Show the WCAG contrast ratio of the colour against this one (e.g. `"#ffffff"` for button text). */
  contrastAgainst?: string;
  /** `"popover"` (default): swatch button + floating panel. `"inline"`: the panel in place. */
  variant?: "popover" | "inline";
  name?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
  labels?: Partial<ColorPickerLabels>;
}

/**
 * Choose a colour: website brand colour, label colours, campaign or chart series colour.
 * Saturation/brightness area and hue strip are keyboard sliders; the value field accepts hex,
 * `rgb()` and `oklch()`; swatches are a radio group; an optional WCAG contrast hint shows whether
 * text on the colour stays readable. The value is always hex.
 *
 * ```tsx
 * <Field label="Brand color"><ColorPicker name="brand" defaultValue="#c6f432" contrastAgainst="#12150f" /></Field>
 * <ColorPicker alpha swatches="tokens" variant="inline" />
 * ```
 */
export const ColorPicker = React.forwardRef<HTMLButtonElement, ColorPickerProps>(function ColorPicker(props, ref) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    alpha,
    swatches,
    eyeDropper,
    format: formatProp,
    defaultFormat,
    onFormatChange,
    showFormats,
    contrastAgainst,
    variant = "popover",
    name: nameProp,
    size = "md",
    invalid,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
    labels,
  } = props;
  const t = useLabels("colorPicker", colorLabels, labels);
  const field = useFieldContext();
  const control = useFieldControl({
    id: props.id,
    name: nameProp,
    disabled: props.disabled,
    readOnly: props.readOnly,
    "aria-invalid": invalid ? true : undefined,
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"],
    "aria-describedby": props["aria-describedby"],
  });
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue: defaultValue ?? "#000000", onChange: onValueChange, name: "ColorPicker" });
  const [format, setFormat] = useControllableState<ColorFormat>({ value: formatProp, defaultValue: defaultFormat ?? "hex", onChange: onFormatChange, name: "ColorPicker" });
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange, name: "ColorPicker" });
  const valueId = React.useId();
  const disabled = Boolean(control.disabled);
  const readOnly = Boolean(control.readOnly);
  const hex = (parseColor(value) ? value : "#000000").toLowerCase();
  const transparent = parseColor(hex)?.a === 0;

  const panel = (
    <ColorPickerPanel
      value={hex}
      onValueChange={setValue}
      alpha={alpha}
      swatches={swatches}
      eyeDropper={eyeDropper}
      format={format}
      onFormatChange={setFormat}
      showFormats={showFormats}
      contrastAgainst={contrastAgainst}
      disabled={disabled || readOnly}
      labels={labels}
    />
  );
  const hidden = control.name ? <input type="hidden" name={control.name} value={hex} /> : null;

  if (variant === "inline") {
    return (
      <div
        data-slot="color-picker"
        data-variant="inline"
        role="group"
        aria-label={control["aria-label"] ?? (control["aria-labelledby"] || field?.labelId ? undefined : t("dialog"))}
        aria-labelledby={control["aria-labelledby"] ?? (control["aria-label"] ? undefined : field?.labelId)}
        aria-describedby={control["aria-describedby"]}
        className={cn("w-72 max-w-full rounded-ui-lg border border-line bg-surface p-3", className)}
      >
        <FieldContextReset>{panel}</FieldContextReset>
        {hidden}
      </div>
    );
  }

  return (
    <Popover open={readOnly || disabled ? false : open} onOpenChange={(o) => !readOnly && !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          data-slot="color-picker"
          data-readonly={readOnly ? "" : undefined}
          id={control.id}
          disabled={disabled}
          aria-label={control["aria-label"]}
          aria-labelledby={control["aria-labelledby"]}
          aria-describedby={mergeIds(control["aria-describedby"], valueId)}
          aria-invalid={control["aria-invalid"] || undefined}
          className={cn(controlVariants({ size }), "justify-start text-start font-mono tabular", size === "sm" ? "ps-1" : "ps-1.5", className)}
        >
          <span
            aria-hidden
            className={cn(
              "ui-checker relative shrink-0 overflow-hidden rounded-[calc(var(--radius)-5px)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--fg)_14%,transparent)]",
              size === "sm" ? "size-5" : size === "lg" ? "size-8" : "size-6.5",
            )}
          >
            <span className="absolute inset-0" style={{ background: hex }} />
          </span>
          <span id={valueId} className="min-w-0 flex-1 truncate text-[0.95em]">
            {transparent ? t("transparent") : formatColor(hex, format)}
          </span>
          {readOnly ? null : <ChevronDown aria-hidden className="shrink-0 text-fg-subtle" />}
        </button>
      </PopoverTrigger>
      {hidden}
      <PopoverContent size="auto" align="start" aria-label={t("dialog")} className="w-72">
        <FieldContextReset>{panel}</FieldContextReset>
      </PopoverContent>
    </Popover>
  );
});
