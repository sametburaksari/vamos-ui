"use client";

import * as React from "react";
import * as LabelPrimitive from "radix-ui/label";
import { CircleAlert, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useComposedRefs, mergeIds } from "../lib/compose-refs";
import { FieldContext, useFieldControl, type FieldContextValue } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { controlVariants } from "../lib/variants";

/**
 * The classic field look for a bare `<input>` / `<textarea>`. Kept for compatibility —
 * new controls should use `controlVariants` from `lib/variants`.
 */
export const fieldBase =
  "w-full min-w-0 rounded-ui border border-field-border bg-field text-sm text-fg placeholder:text-fg-subtle transition-[border-color,box-shadow] duration-150 hover:border-field-border-hover focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--danger)_18%,transparent)]";

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

const inputLabels = {
  clear: "Clear",
  count: "{count} / {max}",
  remaining: "{count, plural, =0 {No characters left} one {# character left} other {# characters left}}",
};
export type InputLabels = typeof inputLabels;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  /** Height from the density axis: sm = control-h − 0.5rem, md = control-h, lg = control-h + 0.5rem. */
  size?: "sm" | "md" | "lg";
  /** `"ghost"`: borderless until hover/focus (inline cell edit). `"nav"`: inside the dark sidebar. */
  variant?: "default" | "ghost" | "nav";
  /** Icon or short text inside the box, at the start. */
  leading?: React.ReactNode;
  /** Icon, unit, spinner or small button inside the box, at the end. */
  trailing?: React.ReactNode;
  /** Segmented addon at the start (`https://`, `$`). */
  addonStart?: React.ReactNode;
  /** Segmented addon at the end (`.vamos.ist`, a Button). */
  addonEnd?: React.ReactNode;
  /** Show a clear (×) button while there is a value. Esc also clears. */
  clearable?: boolean;
  /** Called after the value was cleared. */
  onClear?: () => void;
  /** Character counter (`12 / 60` with `maxLength`). Announced politely only near the limit. */
  showCount?: boolean;
  /** Invalid look + `aria-invalid` (a surrounding Field with `error` sets this for you). */
  invalid?: boolean;
  /** Classes for the inner `<input>`; `className` always goes on the root box. */
  inputClassName?: string;
  /** Built-in string overrides (`input` namespace). */
  labels?: Partial<InputLabels>;
}

const setNativeValue = (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
};

/**
 * Single-line text entry. Native contract (`value` / `defaultValue` / `onChange(event)`); the
 * `ref` always reaches the `<input>`, so `react-hook-form`'s `register` works. Inside a `Field`
 * the id, description and invalid/required/disabled state are wired automatically.
 *
 * ```tsx
 * <Field label="Title" hint="Under 60 characters for search results.">
 *   <Input maxLength={60} showCount />
 * </Field>
 * <Input leading={<Search />} placeholder="Search contacts" clearable />
 * <Input addonStart="https://" addonEnd=".vamos.ist" defaultValue="northpoint" />
 * ```
 */
export const Input = /*#__PURE__*/ React.forwardRef<HTMLInputElement, InputProps>(function Input(rawProps, forwardedRef) {
  const {
    className,
    inputClassName,
    size = "md",
    variant = "default",
    leading,
    trailing,
    addonStart,
    addonEnd,
    clearable,
    onClear,
    showCount,
    invalid,
    labels,
    style,
    ...rest
  } = rawProps;
  const props = useFieldControl({ ...rest, "aria-invalid": invalid ? true : rest["aria-invalid"] });
  const t = useLabels("input", inputLabels, labels);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ref = useComposedRefs(forwardedRef, inputRef);
  const countId = React.useId();

  const controlled = props.value !== undefined;
  const [uncontrolledLength, setLength] = React.useState(() => String(props.defaultValue ?? "").length);
  const length = controlled ? String(props.value ?? "").length : uncontrolledLength;
  const hasValue = length > 0;
  const inert = props.disabled || props.readOnly;
  const max = props.maxLength !== undefined && props.maxLength >= 0 ? props.maxLength : undefined;
  const remaining = max !== undefined ? max - length : undefined;

  const clear = () => {
    const el = inputRef.current;
    if (!el) return;
    setNativeValue(el, "");
    if (!controlled) setLength(0);
    onClear?.();
    el.focus();
  };

  const showClear = clearable && hasValue && !inert;
  const adornment = "pointer-events-none flex shrink-0 items-center text-fg-subtle [&_svg]:size-[1em]";
  const addon = "flex shrink-0 items-center self-stretch bg-surface-2 text-fg-muted whitespace-nowrap";

  return (
    <div
      data-slot="input"
      data-size={size}
      data-readonly={props.readOnly ? "" : undefined}
      className={cn(controlVariants({ size, variant }), "cursor-text gap-0 overflow-visible px-0", className)}
      style={style}
      onPointerDown={(e) => {
        // Clicking padding or an adornment focuses the input (not addons/buttons).
        if (e.target === e.currentTarget) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
    >
      {addonStart ? <span className={cn(addon, "rounded-s-[inherit] border-e border-field-border px-3")}>{addonStart}</span> : null}
      {leading ? <span className={cn(adornment, "ps-3")}>{leading}</span> : null}
      <input
        ref={ref}
        {...props}
        aria-describedby={mergeIds(props["aria-describedby"], showCount ? countId : undefined)}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent px-3 text-[length:inherit] text-fg outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed",
          leading && "ps-2",
          (trailing || showClear || showCount) && "pe-1.5",
          inputClassName,
        )}
        onChange={(e) => {
          if (!controlled) setLength(e.currentTarget.value.length);
          props.onChange?.(e);
        }}
        onKeyDown={(e) => {
          props.onKeyDown?.(e);
          if (!e.defaultPrevented && clearable && e.key === "Escape" && hasValue && !inert) {
            e.preventDefault();
            e.stopPropagation();
            clear();
          }
        }}
      />
      {showClear ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label={t("clear")}
          onClick={clear}
          className="me-1.5 inline-flex size-6 shrink-0 items-center justify-center rounded-ui-sm text-fg-subtle transition-colors hover:bg-hover hover:text-fg [&_svg]:size-3.5"
        >
          <X aria-hidden />
        </button>
      ) : null}
      {showCount ? (
        <span
          className={cn(
            "pointer-events-none shrink-0 pe-3 font-mono text-[11px] tabular text-fg-subtle",
            remaining !== undefined && remaining <= 0 && "text-danger",
            remaining !== undefined && remaining > 0 && remaining <= 10 && "text-warning",
          )}
        >
          <span aria-hidden>{max !== undefined ? t("count", { count: length, max }) : length}</span>
          <span id={countId} className="sr-only" aria-live="polite">
            {remaining !== undefined && remaining <= 10 ? t("remaining", { count: Math.max(remaining, 0) }) : ""}
          </span>
        </span>
      ) : null}
      {trailing ? <span className={cn("flex shrink-0 items-center text-fg-subtle [&_svg]:size-[1em]", !addonEnd && "pe-1.5", "[&>svg]:me-1.5")}>{trailing}</span> : null}
      {addonEnd ? <span className={cn(addon, "rounded-e-[inherit] border-s border-field-border px-3")}>{addonEnd}</span> : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Textarea                                                            */
/* ------------------------------------------------------------------ */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  /** Character counter under the box (`120 / 400` with `maxLength`). Announced politely only near the limit. */
  showCount?: boolean;
  /** Built-in string overrides (`input` namespace: `count`, `remaining`). */
  labels?: Partial<InputLabels>;
}

/**
 * Multi-line text. Grows with its content (`field-sizing: content`) and reads Field context.
 *
 * ```tsx
 * <Field label="Anything we should know first?"><Textarea maxLength={400} showCount /></Field>
 * ```
 */
export const Textarea = /*#__PURE__*/ React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, rows = 4, invalid, showCount, labels, ...rest }, ref) {
  const props = useFieldControl({ ...rest, "aria-invalid": invalid ? true : rest["aria-invalid"] });
  const t = useLabels("input", inputLabels, labels);
  const countId = React.useId();
  const controlled = props.value !== undefined;
  const [uncontrolledLength, setLength] = React.useState(() => String(props.defaultValue ?? "").length);
  const length = controlled ? String(props.value ?? "").length : uncontrolledLength;
  const max = props.maxLength !== undefined && props.maxLength >= 0 ? props.maxLength : undefined;
  const remaining = max !== undefined ? max - length : undefined;

  const area = (
    <textarea
      ref={ref}
      rows={rows}
      data-slot="textarea"
      className={cn(fieldBase, "field-sizing-content min-h-20 px-3 py-2.5 leading-relaxed read-only:border-dashed read-only:bg-transparent", className)}
      {...props}
      aria-describedby={showCount ? mergeIds(props["aria-describedby"], countId) : props["aria-describedby"]}
      onChange={(e) => {
        if (!controlled) setLength(e.currentTarget.value.length);
        props.onChange?.(e);
      }}
    />
  );
  if (!showCount) return area;
  return (
    <div data-slot="textarea-root" className="flex w-full flex-col gap-1">
      {area}
      <span
        className={cn(
          "self-end font-mono text-[11px] tabular text-fg-muted",
          remaining !== undefined && remaining <= 0 && "text-danger",
          remaining !== undefined && remaining > 0 && remaining <= 20 && "text-warning",
        )}
      >
        <span aria-hidden>{max !== undefined ? t("count", { count: length, max }) : length}</span>
        <span id={countId} className="sr-only" aria-live="polite">
          {remaining !== undefined && remaining <= 20 ? t("remaining", { count: Math.max(remaining, 0) }) : ""}
        </span>
      </span>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Label                                                               */
/* ------------------------------------------------------------------ */

/** Form label (Radix Label: no text selection on double-click). */
export const Label = /*#__PURE__*/ React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      className={cn("text-[13px] font-medium text-fg", className)}
      {...props}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Field                                                               */
/* ------------------------------------------------------------------ */

const fieldLabels = { optional: "(optional)", required: "(required)" };
export type FieldLabels = typeof fieldLabels;

export interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** Error text; an array (TanStack Form) shows the first entry. Replaces the hint while shown. */
  error?: React.ReactNode | React.ReactNode[];
  /** Control id the label points to. Default: the child's `id`, or a generated one. */
  id?: string;
  /** Form field name, passed to the control. */
  name?: string;
  /** Adds an asterisk (hidden from screen readers) and `required` on the control. */
  required?: boolean;
  /** Shows "(optional)" — for forms where most fields are required. */
  optional?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /**
   * `"vertical"` (default): label, control, hint.
   * `"horizontal"`: control first, then label + hint (Checkbox, Switch, Radio).
   */
  orientation?: "vertical" | "horizontal";
  /** `"inline"`: fixed label column beside the control (settings pages). Default `"stack"`. */
  layout?: "stack" | "inline";
  /** Slot at the end of the label row ("Forgot password?", an info button). */
  labelAction?: React.ReactNode;
  className?: string;
  /** Built-in string overrides (`field` namespace). */
  labels?: Partial<FieldLabels>;
  /** One control. Kit controls read the Field context; a plain `<input>`/`<select>`/`<textarea>` is wired by cloning. */
  children: React.ReactNode;
}

const NATIVE = new Set(["input", "select", "textarea"]);

/**
 * Label + control + hint/error, with the accessibility wiring done for you:
 * `<label for>`, `aria-describedby` (merged with the control's own), `aria-invalid`, `required`,
 * `disabled`. Works with any kit control through context — Select, Combobox, Date picker —
 * not only a single direct child.
 *
 * ```tsx
 * <Field label="Work email" hint="We send the invoice here." required>
 *   <Input type="email" />
 * </Field>
 * <Field label="Status" error={errors.status}><Select … /></Field>
 * ```
 */
export function Field({
  label,
  hint,
  error,
  id,
  name,
  required = false,
  optional = false,
  disabled = false,
  readOnly = false,
  orientation = "vertical",
  layout = "stack",
  labelAction,
  className,
  labels,
  children,
}: FieldProps) {
  const t = useLabels("field", fieldLabels, labels);
  const autoId = React.useId();
  const only = React.Children.count(children) === 1 && React.isValidElement<{ id?: string }>(children) ? children : null;
  const controlId = id ?? only?.props.id ?? `field${autoId.replace(/:/g, "")}`;
  const firstError = Array.isArray(error) ? error.find((e) => e != null && e !== false && e !== "") : error;
  const hasError = firstError != null && firstError !== false && firstError !== "";
  const labelId = label ? `${controlId}-label` : undefined;
  const hintId = !hasError && hint ? `${controlId}-hint` : undefined;
  const errorId = hasError ? `${controlId}-error` : undefined;

  const ctx = React.useMemo<FieldContextValue>(
    () => ({ id: controlId, labelId, describedBy: mergeIds(hintId, errorId), errorId, invalid: hasError, required, disabled, readOnly, name }),
    [controlId, labelId, hintId, errorId, hasError, required, disabled, readOnly, name],
  );

  // A plain DOM control can't read context: wire it by cloning.
  let control = children;
  if (only && typeof only.type === "string" && NATIVE.has(only.type)) {
    const p = only.props as Record<string, unknown>;
    control = React.cloneElement(only as React.ReactElement<Record<string, unknown>>, {
      id: controlId,
      name: p.name ?? name,
      "aria-describedby": mergeIds(ctx.describedBy, p["aria-describedby"] as string | undefined),
      "aria-invalid": p["aria-invalid"] ?? (hasError || undefined),
      required: p.required ?? (required || undefined),
      disabled: p.disabled ?? (disabled || undefined),
      readOnly: p.readOnly ?? (readOnly || undefined),
    });
  }

  const labelEl = label ? (
    <div className={cn("flex min-w-0 items-baseline justify-between gap-3", orientation === "horizontal" && "col-start-2 row-start-1")}>
      <Label id={labelId} htmlFor={controlId} className={cn(disabled && "opacity-60", orientation === "horizontal" && "font-normal")}>
        {label}
        {required ? (
          <span aria-hidden className="ms-0.5 text-danger">
            *
          </span>
        ) : null}
        {optional && !required ? <span className="ms-1 font-normal text-fg-subtle">{t("optional")}</span> : null}
      </Label>
      {labelAction ? <div className="shrink-0 text-xs">{labelAction}</div> : null}
    </div>
  ) : null;

  const message = hasError ? (
    <p id={errorId} data-slot="field-error" className="flex items-start gap-1.5 text-xs text-danger">
      <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
      <span>{firstError as React.ReactNode}</span>
    </p>
  ) : hint ? (
    <p id={hintId} data-slot="field-hint" className="text-xs text-pretty text-fg-subtle">
      {hint}
    </p>
  ) : null;

  const body =
    orientation === "horizontal" ? (
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2.5 gap-y-0.5">
        <div className="col-start-1 row-span-2 row-start-1 flex min-h-5 items-center">{control}</div>
        {labelEl}
        {message ? <div className="col-start-2 row-start-2">{message}</div> : null}
      </div>
    ) : layout === "inline" ? (
      <div className="grid gap-1.5 sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] sm:gap-x-6">
        <div className="sm:pt-[calc((var(--control-h)-1.25rem)/2)]">{labelEl}</div>
        <div className="grid min-w-0 gap-1.5">
          {control}
          {message}
        </div>
      </div>
    ) : (
      <>
        {labelEl}
        {control}
        {message}
      </>
    );

  return (
    <FieldContext.Provider value={ctx}>
      <div
        data-slot="field"
        data-invalid={hasError ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn("group/field grid min-w-0 content-start gap-1.5", className)}
      >
        {body}
      </div>
    </FieldContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Fieldset                                                            */
/* ------------------------------------------------------------------ */

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Group title, rendered as `<legend>`. Or put a `<Legend>` first in children. */
  legend?: React.ReactNode;
  /** Helper text under the legend (linked with `aria-describedby`). */
  hint?: React.ReactNode;
  /** Error for the whole group (e.g. "Pick at least one channel"). */
  error?: React.ReactNode;
}

/**
 * Groups related controls with a real `<fieldset>` + `<legend>` — radio and checkbox groups,
 * an address block. `disabled` disables every native control inside.
 *
 * ```tsx
 * <Fieldset legend="Notifications" hint="Choose where we reach you.">
 *   <Field label="Email" orientation="horizontal"><Checkbox /></Field>
 * </Fieldset>
 * ```
 */
export const Fieldset = /*#__PURE__*/ React.forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset(
  { legend, hint, error, className, children, "aria-describedby": describedBy, ...props },
  ref,
) {
  const id = React.useId();
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <fieldset
      ref={ref}
      data-slot="fieldset"
      aria-describedby={mergeIds(hintId, errorId, describedBy)}
      data-invalid={error ? "" : undefined}
      className={cn("grid min-w-0 gap-3 border-0 p-0 disabled:opacity-60", className)}
      {...props}
    >
      {/* Floated, the legend becomes a regular grid item, so the grid gap and the hint's offset apply to it. */}
      {legend ? <Legend className="float-left w-full">{legend}</Legend> : null}
      {hint && !error ? (
        <p id={hintId} className="-mt-2 text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="-mt-2 flex items-start gap-1.5 text-xs text-danger">
          <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
      {children}
    </fieldset>
  );
});

/** Title of a Fieldset. */
export const Legend = /*#__PURE__*/ React.forwardRef<HTMLLegendElement, React.HTMLAttributes<HTMLLegendElement>>(function Legend({ className, ...props }, ref) {
  return <legend ref={ref} data-slot="legend" className={cn("mb-0 p-0 text-sm font-semibold tracking-[-0.005em] text-fg", className)} {...props} />;
});
