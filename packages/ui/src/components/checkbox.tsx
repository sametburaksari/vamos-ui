"use client";

import * as React from "react";
import * as CheckboxPrimitive from "radix-ui/checkbox";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { mergeIds } from "../lib/compose-refs";
import { FieldContextReset, useFieldContext, useFieldControl } from "../lib/field-context";
import { useControllableState } from "../lib/use-controllable-state";

export type CheckboxCheckedState = boolean | "indeterminate";

export const checkboxVariants = /*#__PURE__*/ cva(
  [
    "peer relative inline-flex shrink-0 items-center justify-center border bg-field text-accent-fg outline-none",
    // 16–18px boxes need the stronger edge in every material, or they vanish on dark solid
    "border-field-border-hover",
    "transition-[background-color,border-color,box-shadow] duration-150",
    "hover:border-fg-subtle",
    "focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]",
    "data-[state=checked]:border-transparent data-[state=checked]:bg-accent data-[state=indeterminate]:border-transparent data-[state=indeterminate]:bg-accent",
    "data-[state=checked]:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_0_0_1px_color-mix(in_srgb,var(--fg)_10%,transparent)]",
    "data-[state=indeterminate]:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_0_0_1px_color-mix(in_srgb,var(--fg)_10%,transparent)]",
    "aria-invalid:border-danger aria-invalid:data-[state=unchecked]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--danger)_14%,transparent)]",
    "disabled:cursor-not-allowed disabled:opacity-45",
    "aria-readonly:cursor-default aria-readonly:data-[state=checked]:bg-fg-subtle aria-readonly:data-[state=indeterminate]:bg-fg-subtle aria-readonly:text-scene",
  ],
  {
    variants: {
      size: {
        sm: "size-4 rounded-[5px] [&_svg]:size-3",
        md: "size-[18px] rounded-[5px] [&_svg]:size-[13px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/* ------------------------------------------------------------------ */
/* Group context                                                       */
/* ------------------------------------------------------------------ */

interface CheckboxGroupContextValue {
  value: string[];
  toggle: (value: string, checked: boolean) => void;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  size?: "sm" | "md";
  variant?: "default" | "card";
}
const CheckboxGroupContext = /*#__PURE__*/ React.createContext<CheckboxGroupContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Checkbox                                                            */
/* ------------------------------------------------------------------ */

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, "checked" | "defaultChecked" | "onCheckedChange" | "children"> {
  checked?: CheckboxCheckedState;
  defaultChecked?: CheckboxCheckedState;
  onCheckedChange?: (checked: CheckboxCheckedState) => void;
  /** Text next to the box; the whole row is clickable. */
  label?: React.ReactNode;
  /** Secondary line under the label (linked with `aria-describedby`). */
  description?: React.ReactNode;
  /** 16 / 18 px box. Default `"md"`. */
  size?: "sm" | "md";
  /** `"card"`: a bordered, selectable tile — module pickers, plan add-ons. Needs `label`. */
  variant?: "default" | "card";
  /** Leading icon / logo inside a card. */
  icon?: React.ReactNode;
  /** Invalid look + `aria-invalid` (a surrounding Field with `error` sets it for you). */
  invalid?: boolean;
  /** Visible and focusable, but the value can't change (`aria-readonly`). */
  readOnly?: boolean;
  /** Classes for the box itself when `label` is used (`className` goes on the row). */
  controlClassName?: string;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden focusable="false">
      <path className="ui-check-path" d="M3 7.4 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DashIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden focusable="false">
      <path d="M3.5 7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Yes/no and multi-select: "Allow comments", row selection, permissions, consent.
 * Built on Radix Checkbox (tri-state, hidden input with `name`). Reads Field context.
 *
 * ```tsx
 * <Checkbox label="Allow comments" description="Readers can reply below the post." defaultChecked />
 * <Checkbox checked={some ? "indeterminate" : all} onCheckedChange={toggleAll} aria-label="Select all rows" />
 * <Field label="I accept the terms" orientation="horizontal" error={err}><Checkbox name="terms" /></Field>
 * ```
 */
export const Checkbox = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(function Checkbox(rawProps, ref) {
  const group = React.useContext(CheckboxGroupContext);
  const {
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    label,
    description,
    size = group?.size ?? "md",
    variant = group?.variant ?? "default",
    icon,
    invalid,
    readOnly: readOnlyProp,
    className,
    controlClassName,
    value,
    style,
    ...rest
  } = rawProps;

  const groupValue = value === undefined ? undefined : String(value);
  const inGroup = Boolean(group && groupValue !== undefined);
  const control = useFieldControl({
    ...rest,
    name: rest.name ?? (inGroup ? group!.name : undefined),
    disabled: rest.disabled ?? (group?.disabled || undefined),
    readOnly: readOnlyProp ?? (group?.readOnly || undefined),
    "aria-invalid": invalid || group?.invalid ? true : rest["aria-invalid"],
  });
  const { readOnly, required, ...controlProps } = control;

  const [state, setState] = useControllableState<CheckboxCheckedState>({
    value: inGroup ? group!.value.includes(groupValue!) : checkedProp,
    defaultValue: defaultChecked ?? false,
    onChange: (next) => {
      if (inGroup) group!.toggle(groupValue!, next === true);
      onCheckedChange?.(next);
    },
    name: "Checkbox",
  });

  const autoId = React.useId();
  const id = controlProps.id ?? (label ? `cb${autoId.replace(/:/g, "")}` : undefined);
  const descId = description ? `${id ?? autoId}-desc` : undefined;
  const labelId = label ? `${id ?? autoId}-label` : undefined;
  const labelledBy = controlProps["aria-labelledby"] ?? (label && !controlProps["aria-label"] ? labelId : undefined);

  const box = (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      data-size={size}
      {...controlProps}
      id={id}
      value={groupValue}
      required={required}
      aria-required={required || undefined}
      aria-readonly={readOnly || undefined}
      aria-labelledby={labelledBy}
      aria-describedby={mergeIds(controlProps["aria-describedby"], descId)}
      checked={state}
      onCheckedChange={(next) => {
        if (readOnly) return;
        setState(next);
      }}
      onKeyDown={(e) => {
        // Radix ignores Enter on purpose (WAI-ARIA); read-only also swallows Space.
        if (readOnly && e.key === " ") e.preventDefault();
        controlProps.onKeyDown?.(e);
      }}
      className={cn(checkboxVariants({ size }), label ? controlClassName : cn(controlClassName, className))}
      style={label ? undefined : style}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" forceMount className="flex items-center justify-center data-[state=unchecked]:hidden">
        {state === "indeterminate" ? <DashIcon /> : <CheckIcon />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) return box;

  const disabled = controlProps.disabled;
  const text = (
    <span className="grid min-w-0 gap-0.5">
      <span id={labelId} className={cn("text-fg", size === "sm" ? "text-[13px]" : "text-sm", variant === "card" ? "font-medium" : "leading-5")}>
        {label}
      </span>
      {description ? (
        <span id={descId} className={cn("text-fg-muted text-pretty", size === "sm" ? "text-[11.5px]" : "text-xs", "leading-[1.45]")}>
          {description}
        </span>
      ) : null}
    </span>
  );

  if (variant === "card") {
    return (
      <label
        htmlFor={id}
        data-slot="checkbox-card"
        data-state={state === true ? "checked" : state === "indeterminate" ? "indeterminate" : "unchecked"}
        data-disabled={disabled ? "" : undefined}
        className={cn(
          "group/cb relative flex cursor-pointer items-start gap-3 rounded-ui border border-field-border bg-field p-3.5 transition-[background-color,border-color,box-shadow] duration-150",
          "hover:border-field-border-hover glass:border-field-border-hover",
          "has-[:focus-visible]:border-ring has-[:focus-visible]:shadow-[0_0_0_3px_var(--accent-soft)]",
          "data-[state=checked]:border-accent-ink data-[state=checked]:bg-[color-mix(in_oklch,var(--accent-base)_11%,transparent)] data-[state=checked]:shadow-[inset_0_0_0_1px_var(--accent-ink)]",
          "has-[[aria-invalid=true]]:border-danger",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className,
        )}
        style={style}
      >
        {icon ? <span className="mt-px flex size-8 shrink-0 items-center justify-center rounded-ui-sm bg-surface-2 text-fg-muted [&_svg]:size-4">{icon}</span> : null}
        <span className="min-w-0 flex-1">{text}</span>
        <span className="mt-px">{box}</span>
      </label>
    );
  }

  return (
    <div
      data-slot="checkbox-row"
      data-disabled={disabled ? "" : undefined}
      className={cn("flex items-start gap-2.5", className)}
      style={style}
    >
      <span className={cn("flex shrink-0 items-center", size === "sm" ? "h-[19.5px]" : "h-5")}>{box}</span>
      <label htmlFor={id} className={cn("min-w-0 select-none", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
        {text}
      </label>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* CheckboxGroup                                                       */
/* ------------------------------------------------------------------ */

export interface CheckboxGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir"> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Form name; every checked item submits one entry (`formData.getAll(name)`). */
  name?: string;
  /** Shorthand for the items. Or compose `CheckboxGroupItem` children. */
  items?: { value: string; label: React.ReactNode; description?: React.ReactNode; icon?: React.ReactNode; disabled?: boolean }[];
  orientation?: "vertical" | "horizontal";
  /** `"card"` lays the items out as selectable tiles in a responsive grid. */
  variant?: "default" | "card";
  size?: "sm" | "md";
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
}

/**
 * Several checkboxes that share one array value: notification channels, modules, permissions.
 * `role="group"`, labelled by the surrounding Field / Fieldset.
 *
 * ```tsx
 * <Field label="Notify me by">
 *   <CheckboxGroup name="channels" defaultValue={["email"]} items={[{ value: "email", label: "Email" }, { value: "sms", label: "SMS" }]} />
 * </Field>
 * ```
 */
export const CheckboxGroup = /*#__PURE__*/ React.forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroup(
  {
    value,
    defaultValue,
    onValueChange,
    name,
    items,
    orientation = "vertical",
    variant = "default",
    size,
    disabled,
    readOnly,
    invalid,
    required,
    className,
    children,
    id,
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
    ...props
  },
  ref,
) {
  const field = useFieldContext();
  const [current, setCurrent] = useControllableState<string[]>({ value, defaultValue: defaultValue ?? [], onChange: onValueChange, name: "CheckboxGroup" });
  const order = React.useRef<string[]>([]);
  order.current = items?.map((i) => i.value) ?? [];

  const toggle = React.useCallback(
    (v: string, checked: boolean) =>
      setCurrent((prev) => {
        if (checked === prev.includes(v)) return prev;
        const next = checked ? [...prev, v] : prev.filter((x) => x !== v);
        // Keep the order of the items list, so the value is stable regardless of click order.
        return order.current.length ? next.sort((a, b) => order.current.indexOf(a) - order.current.indexOf(b)) : next;
      }),
    [setCurrent],
  );

  const ctx = React.useMemo<CheckboxGroupContextValue>(
    () => ({
      value: current,
      toggle,
      name: name ?? field?.name,
      disabled: disabled ?? field?.disabled,
      readOnly: readOnly ?? field?.readOnly,
      invalid: invalid ?? field?.invalid,
      size,
      variant,
    }),
    [current, toggle, name, field?.name, disabled, field?.disabled, readOnly, field?.readOnly, invalid, field?.invalid, size, variant],
  );
  const isRequired = required ?? field?.required;

  return (
    <div
      {...props}
      ref={ref}
      role="group"
      data-slot="checkbox-group"
      data-orientation={orientation}
      aria-labelledby={labelledBy ?? (props["aria-label"] ? undefined : field?.labelId)}
      aria-describedby={mergeIds(field?.describedBy, describedBy)}
      aria-invalid={ctx.invalid || undefined}
      aria-required={isRequired || undefined}
      id={id ?? field?.id}
      className={cn(
        variant === "card"
          ? "grid gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]"
          : orientation === "horizontal"
            ? "flex flex-wrap items-start gap-x-6 gap-y-2.5"
            : "grid gap-2.5",
        className,
      )}
    >
      <FieldContextReset>
        <CheckboxGroupContext.Provider value={ctx}>
          {items?.map((item) => (
            <CheckboxGroupItem key={item.value} value={item.value} label={item.label} description={item.description} icon={item.icon} disabled={item.disabled} />
          ))}
          {children}
        </CheckboxGroupContext.Provider>
      </FieldContextReset>
    </div>
  );
});

export interface CheckboxGroupItemProps extends Omit<CheckboxProps, "checked" | "defaultChecked" | "value"> {
  /** The string added to the group value when checked. */
  value: string;
}

/** One option inside a `CheckboxGroup`. */
export const CheckboxGroupItem = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxGroupItemProps>(function CheckboxGroupItem(props, ref) {
  return <Checkbox ref={ref} {...props} />;
});
