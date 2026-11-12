"use client";

import * as React from "react";
import * as SwitchPrimitive from "radix-ui/switch";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { mergeIds } from "../lib/compose-refs";
import { useFieldControl } from "../lib/field-context";
import { useControllableState } from "../lib/use-controllable-state";
import { Spinner } from "./spinner";

export const switchVariants = /*#__PURE__*/ cva(
  [
    "group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent p-[2px] outline-none",
    "bg-track transition-[background-color,box-shadow] duration-200",
    "data-[state=unchecked]:hover:bg-[color-mix(in_srgb,var(--track),var(--fg)_9%)]",
    "data-[state=checked]:bg-accent data-[state=checked]:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--fg)_10%,transparent)]",
    "focus-visible:shadow-[0_0_0_2px_var(--scene),0_0_0_4px_var(--ring)]",
    "aria-invalid:shadow-[inset_0_0_0_1.5px_var(--danger)]",
    "disabled:cursor-not-allowed disabled:opacity-45 aria-busy:cursor-progress",
  ],
  {
    variants: {
      size: {
        /** 28 × 16 — table rows, dense lists. */
        sm: "h-4 w-7 [--switch-thumb-size:12px] [--switch-travel:12px]",
        /** 36 × 20. */
        md: "h-5 w-9 [--switch-thumb-size:16px] [--switch-travel:16px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, "checked" | "defaultChecked" | "onCheckedChange" | "children"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Text beside the switch; clicking it toggles. */
  label?: React.ReactNode;
  /** Secondary line under the label. */
  description?: React.ReactNode;
  /** `"end"` (default): switch, then label. `"start"`: label first, switch at the far end (settings rows). */
  labelPosition?: "start" | "end";
  size?: "sm" | "md";
  /** A save is in flight: spinner in the thumb, `aria-busy`, changes locked. */
  loading?: boolean;
  invalid?: boolean;
  /** Focusable, but can't be flipped (`aria-readonly`). */
  readOnly?: boolean;
  /** Classes for the track when `label` is used (`className` goes on the row). */
  controlClassName?: string;
}

/**
 * Instant on/off setting: "Maintenance mode", "Accept online bookings", active/inactive in a table.
 * Radix Switch (`role="switch"`), Field-aware, with an optimistic-save `loading` state.
 *
 * ```tsx
 * <Switch label="Email digests" description="A summary every Monday at 9:00." defaultChecked />
 * <Switch size="sm" checked={active} onCheckedChange={save} loading={saving} aria-label="Active" />
 * ```
 */
export const Switch = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(function Switch(rawProps, ref) {
  const {
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    label,
    description,
    labelPosition = "end",
    size = "md",
    loading,
    invalid,
    className,
    controlClassName,
    style,
    ...rest
  } = rawProps;
  const control = useFieldControl({ ...rest, "aria-invalid": invalid ? true : rest["aria-invalid"] });
  const { readOnly, required, ...controlProps } = control;
  const [checked, setChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
    name: "Switch",
  });
  const autoId = React.useId();
  const id = controlProps.id ?? (label ? `sw${autoId.replace(/:/g, "")}` : undefined);
  const descId = description ? `${id ?? autoId}-desc` : undefined;
  const labelId = label ? `${id ?? autoId}-label` : undefined;
  const labelledBy = controlProps["aria-labelledby"] ?? (label && !controlProps["aria-label"] ? labelId : undefined);
  const locked = readOnly || loading;

  const track = (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      data-size={size}
      {...controlProps}
      id={id}
      required={required}
      aria-required={required || undefined}
      aria-readonly={readOnly || undefined}
      aria-busy={loading || undefined}
      aria-labelledby={labelledBy}
      aria-describedby={mergeIds(controlProps["aria-describedby"], descId)}
      checked={checked}
      onCheckedChange={(next) => {
        if (locked) return;
        setChecked(next);
      }}
      onKeyDown={(e) => {
        if (locked && (e.key === " " || e.key === "Enter")) e.preventDefault();
        controlProps.onKeyDown?.(e);
      }}
      className={cn(switchVariants({ size }), label ? controlClassName : cn(controlClassName, className))}
      style={label ? undefined : style}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none flex size-(--switch-thumb-size) items-center justify-center rounded-full bg-(--switch-thumb) text-fg-muted",
          "shadow-[0_1px_2px_rgb(0_0_0/0.18),0_0_0_0.5px_rgb(0_0_0/0.06)]",
          "transition-[transform,width,background-color] duration-200 ease-[cubic-bezier(0.3,1.3,0.5,1)]",
          "data-[state=checked]:translate-x-[calc(var(--switch-travel)*var(--dir))] data-[state=checked]:bg-accent-fg data-[state=checked]:text-accent",
          // a little stretch while pressed
          "group-active/switch:w-[calc(var(--switch-thumb-size)+3px)] group-active/switch:data-[state=checked]:translate-x-[calc((var(--switch-travel)-3px)*var(--dir))]",
        )}
      >
        {loading ? <Spinner size={size === "sm" ? 9 : 11} /> : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );

  if (!label) return track;

  const text = (
    <label htmlFor={id} className={cn("grid min-w-0 select-none gap-0.5", controlProps.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
      <span id={labelId} className={cn("text-fg", size === "sm" ? "text-[13px] leading-4" : "text-sm leading-5")}>
        {label}
      </span>
      {description ? (
        <span id={descId} className={cn("text-pretty leading-[1.45] text-fg-subtle", size === "sm" ? "text-[11.5px]" : "text-xs")}>
          {description}
        </span>
      ) : null}
    </label>
  );

  return (
    <div
      data-slot="switch-row"
      data-label-position={labelPosition}
      className={cn("flex items-start gap-3", labelPosition === "start" && "justify-between gap-6", className)}
      style={style}
    >
      {labelPosition === "start" ? text : null}
      <span className={cn("flex shrink-0 items-center", size === "sm" ? "h-4" : "h-5")}>{track}</span>
      {labelPosition === "end" ? text : null}
    </div>
  );
});
