"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn } from "../lib/cn";
import { mergeIds } from "../lib/compose-refs";
import { FieldContextReset, useFieldContext } from "../lib/field-context";
import { useControllableState } from "../lib/use-controllable-state";

export interface RadioGroupOption<V extends string = string> {
  value: V;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface RadioGroupContextValue {
  variant: "default" | "card" | "segmented";
  size: "sm" | "md";
  value: string | null;
  readOnly?: boolean;
}
const RadioGroupContext = React.createContext<RadioGroupContextValue>({ variant: "default", size: "md", value: null });

export interface RadioGroupProps<V extends string = string>
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, "value" | "defaultValue" | "onValueChange" | "orientation"> {
  /** Selected value; `null` = nothing selected (controlled). */
  value?: V | null;
  defaultValue?: V | null;
  onValueChange?: (value: V) => void;
  /** Shorthand for the options. Or compose `RadioGroupItem` children. */
  items?: RadioGroupOption<V>[];
  /**
   * `"default"`: circle + label. `"card"`: selectable tiles with icon and description (plans).
   * `"segmented"`: a compact segmented control for short labels (a form value, not a view switch —
   * use `ToggleGroup` for toolbar/view state).
   */
  variant?: "default" | "card" | "segmented";
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md";
  invalid?: boolean;
  /** Focusable, but the selection can't change (`aria-readonly`). */
  readOnly?: boolean;
}

const segmentedTrack =
  "inline-flex w-fit max-w-full items-stretch gap-0.5 rounded-ui border border-line bg-selected p-[3px] has-[:focus-visible]:border-ring aria-invalid:border-danger";

/**
 * Pick exactly one of a small set: post visibility, invoice type, plan. WAI-ARIA radio group on
 * Radix (one tab stop, arrow keys move and select). Labelled by the surrounding Field / Fieldset.
 *
 * ```tsx
 * <Field label="Visibility">
 *   <RadioGroup name="visibility" defaultValue="public" items={[{ value: "public", label: "Public" }, { value: "private", label: "Private" }]} />
 * </Field>
 * <RadioGroup variant="segmented" items={…} aria-label="Billing period" />
 * ```
 */
function RadioGroupInner<V extends string = string>(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    items,
    variant = "default",
    orientation,
    size = "md",
    invalid,
    readOnly,
    disabled,
    required,
    name,
    id,
    className,
    children,
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
    ...props
  }: RadioGroupProps<V>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const field = useFieldContext();
  const [value, setValue] = useControllableState<V | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: (v) => {
      if (v !== null) onValueChange?.(v);
    },
    name: "RadioGroup",
  });
  const dir = orientation ?? (variant === "segmented" ? "horizontal" : "vertical");
  const isInvalid = invalid ?? field?.invalid;
  const isReadOnly = readOnly ?? field?.readOnly;
  const isRequired = required ?? field?.required;
  const ctx = React.useMemo(() => ({ variant, size, value, readOnly: isReadOnly }), [variant, size, value, isReadOnly]);

  return (
    <RadioGroupPrimitive.Root
      {...props}
      ref={ref}
      data-slot="radio-group"
      data-variant={variant}
      id={id ?? field?.id}
      name={name ?? field?.name}
      disabled={disabled ?? (field?.disabled || undefined)}
      required={isRequired || undefined}
      aria-labelledby={labelledBy ?? (props["aria-label"] ? undefined : field?.labelId)}
      aria-describedby={mergeIds(field?.describedBy, describedBy)}
      aria-invalid={isInvalid || undefined}
      aria-readonly={isReadOnly || undefined}
      orientation={dir}
      // Radix treats "" as "no selection".
      value={value ?? ""}
      onValueChange={(v) => {
        if (isReadOnly) return;
        setValue(v as V);
      }}
      className={cn(
        "group/radio",
        variant === "segmented"
          ? segmentedTrack
          : variant === "card"
            ? dir === "horizontal"
              ? "grid gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]"
              : "grid gap-2.5"
            : dir === "horizontal"
              ? "flex flex-wrap items-start gap-x-6 gap-y-2.5"
              : "grid gap-2.5",
        className,
      )}
    >
      <FieldContextReset>
        <RadioGroupContext.Provider value={ctx}>
          {items?.map((item) => (
            <RadioGroupItem key={item.value} value={item.value} label={item.label} description={item.description} icon={item.icon} disabled={item.disabled} />
          ))}
          {children}
        </RadioGroupContext.Provider>
      </FieldContextReset>
    </RadioGroupPrimitive.Root>
  );
}

export const RadioGroup = React.forwardRef(RadioGroupInner) as <V extends string = string>(
  props: RadioGroupProps<V> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

/* ------------------------------------------------------------------ */
/* Item                                                                */
/* ------------------------------------------------------------------ */

export interface RadioGroupItemProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Leading icon (card and segmented variants). */
  icon?: React.ReactNode;
  /** Free content for a card (price, badge) under the label. */
  children?: React.ReactNode;
  /** Classes for the radio circle (default variant). */
  controlClassName?: string;
}

const circle =
  "peer relative inline-flex shrink-0 items-center justify-center rounded-full border border-field-border-hover bg-field outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-fg-subtle focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] data-[state=checked]:border-accent-ink disabled:cursor-not-allowed disabled:opacity-45 group-aria-invalid/radio:border-danger";

/** One option inside a `RadioGroup`. */
export const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(function RadioGroupItem(
  { label, description, icon, children, className, controlClassName, id: idProp, "aria-describedby": describedBy, onKeyDown, ...props },
  ref,
) {
  const { variant, size, value: selected, readOnly } = React.useContext(RadioGroupContext);
  const autoId = React.useId();
  const id = idProp ?? `rd${autoId.replace(/:/g, "")}`;
  const labelId = `${id}-label`;
  const descId = description ? `${id}-desc` : undefined;
  const checked = selected === props.value;
  const guard = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (readOnly && e.key === " ") e.preventDefault();
  };

  if (variant === "segmented") {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        id={id}
        data-slot="radio-segment"
        aria-describedby={describedBy}
        onKeyDown={guard}
        className={cn(
          "relative inline-flex min-w-0 flex-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius)-5px)] font-medium text-fg-muted outline-none",
          "transition-[background-color,color,box-shadow] duration-150 hover:text-fg",
          "focus-visible:shadow-[0_0_0_2px_var(--ring)]",
          "data-[state=checked]:bg-(--segment-thumb) data-[state=checked]:text-fg data-[state=checked]:shadow-(--segment-thumb-shadow)",
          "disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0",
          size === "sm" ? "h-[calc(var(--control-h)-0.5rem-8px)] px-2.5 text-xs [&_svg]:size-3.5" : "h-[calc(var(--control-h)-8px)] px-3.5 text-[13px] [&_svg]:size-4",
          className,
        )}
        {...props}
      >
        {icon}
        {label ?? children}
      </RadioGroupPrimitive.Item>
    );
  }

  const dot = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={id}
      data-slot="radio"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={mergeIds(descId, describedBy)}
      onKeyDown={guard}
      className={cn(circle, size === "sm" ? "size-4" : "size-[18px]", controlClassName, !label && className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-indicator"
        className={cn("ui-radio-dot rounded-full bg-accent-ink", size === "sm" ? "size-1.5" : "size-2")}
      />
    </RadioGroupPrimitive.Item>
  );

  if (!label) return dot;

  const textSize = size === "sm" ? "text-[13px]" : "text-sm";
  const descSize = size === "sm" ? "text-[11.5px]" : "text-xs";

  if (variant === "card") {
    return (
      <label
        htmlFor={id}
        data-slot="radio-card"
        data-state={checked ? "checked" : "unchecked"}
        data-disabled={props.disabled ? "" : undefined}
        className={cn(
          "relative flex cursor-pointer items-start gap-3 rounded-ui border border-field-border bg-field p-3.5 transition-[background-color,border-color,box-shadow] duration-150",
          "hover:border-field-border-hover glass:border-field-border-hover",
          "has-[:focus-visible]:border-ring has-[:focus-visible]:shadow-[0_0_0_3px_var(--accent-soft)]",
          "data-[state=checked]:border-accent-ink data-[state=checked]:bg-accent-soft data-[state=checked]:shadow-[inset_0_0_0_1px_var(--accent-ink)]",
          "group-aria-invalid/radio:border-danger data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className,
        )}
      >
        {icon ? <span className="mt-px flex size-8 shrink-0 items-center justify-center rounded-ui-sm bg-surface-2 text-fg-muted [&_svg]:size-4">{icon}</span> : null}
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span id={labelId} className={cn("font-medium text-fg", textSize)}>
            {label}
          </span>
          {description ? (
            <span id={descId} className={cn("text-pretty leading-[1.45] text-fg-subtle", descSize)}>
              {description}
            </span>
          ) : null}
          {children ? <span className="mt-1.5 block">{children}</span> : null}
        </span>
        <span className="mt-px">{dot}</span>
      </label>
    );
  }

  return (
    <div data-slot="radio-row" className={cn("flex items-start gap-2.5", className)}>
      <span className={cn("flex shrink-0 items-center", size === "sm" ? "h-[19.5px]" : "h-5")}>{dot}</span>
      <label htmlFor={id} className={cn("grid min-w-0 select-none gap-0.5", props.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
        <span id={labelId} className={cn("leading-5 text-fg", textSize)}>
          {label}
        </span>
        {description ? (
          <span id={descId} className={cn("text-pretty leading-[1.45] text-fg-subtle", descSize)}>
            {description}
          </span>
        ) : null}
        {children}
      </label>
    </div>
  );
});
