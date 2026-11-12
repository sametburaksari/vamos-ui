"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { useFieldControl } from "../lib/field-context";
import { controlVariants } from "../lib/variants";

/** One option of the `NativeSelect` `items` shorthand. */
export interface NativeSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Options with the same `group` render inside one `<optgroup>`. */
  group?: string;
}

export interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "sm" | "md" | "lg";
  /** `"default"` field look · `"ghost"` borderless · `"pill"` rounded. */
  variant?: "default" | "ghost" | "pill";
  invalid?: boolean;
  /** Disabled, empty first option shown until the user picks (use with `required` and `defaultValue=""`). */
  placeholder?: string;
  /** Options shorthand; or pass `<option>` / `<optgroup>` children. */
  items?: NativeSelectOption[];
  /** Classes for the `<select>`; `className` goes on the wrapper. */
  selectClassName?: string;
}

/**
 * A styled native `<select>` — the platform picker on phones, zero JavaScript to open, and the
 * native contract (`value` / `defaultValue` / `onChange(event)`). Use it for mobile-heavy website
 * forms (booking, contact, checkout). Same box as Input and Select.
 *
 * ```tsx
 * <Field label="Country">
 *   <NativeSelect name="country" defaultValue="" placeholder="Choose a country" required items={countries} />
 * </Field>
 * ```
 */
export const NativeSelect = /*#__PURE__*/ React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { className, selectClassName, size = "md", variant = "default", invalid, placeholder, items, children, ...rest },
  ref,
) {
  const props = useFieldControl({ ...rest, "aria-invalid": invalid ? true : rest["aria-invalid"] });
  const { readOnly, ...selectProps } = props as typeof props & { readOnly?: boolean };

  let options: React.ReactNode = children;
  if (items) {
    const groups = new Map<string, NativeSelectOption[]>();
    for (const item of items) {
      const key = item.group ?? "";
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    options = [...groups.entries()].map(([group, list]) => {
      const opts = list.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ));
      return group ? (
        <optgroup key={group} label={group}>
          {opts}
        </optgroup>
      ) : (
        <React.Fragment key="_">{opts}</React.Fragment>
      );
    });
  }

  return (
    <div
      data-slot="native-select"
      data-size={size}
      data-readonly={readOnly ? "" : undefined}
      className={cn(
        controlVariants({ size, variant: variant === "pill" ? "default" : variant, pill: variant === "pill" }),
        "gap-0 px-0",
        className,
      )}
    >
      <select
        ref={ref}
        {...selectProps}
        // A native select has no readonly; block changes and keep it focusable.
        aria-readonly={readOnly || undefined}
        onChange={readOnly ? undefined : selectProps.onChange}
        onKeyDown={(e) => {
          if (readOnly && e.key !== "Tab") e.preventDefault();
          selectProps.onKeyDown?.(e);
        }}
        onMouseDown={(e) => {
          if (readOnly) e.preventDefault();
          selectProps.onMouseDown?.(e);
        }}
        className={cn(
          "h-full w-full min-w-0 cursor-pointer appearance-none truncate rounded-[inherit] bg-transparent text-[length:inherit] text-fg outline-none",
          "disabled:cursor-not-allowed [&:has(option[value='']:checked)]:text-fg-subtle",
          size === "sm" ? "ps-2.5 pe-7" : size === "lg" ? "ps-3.5 pe-10" : "ps-3 pe-9",
          // the dropdown list itself uses the system colours
          "[&_option]:bg-popover [&_option]:text-fg",
          readOnly && "cursor-default",
          selectClassName,
        )}
      >
        {placeholder !== undefined ? (
          // Hidden, not disabled: a disabled selected option is painted as GrayText (fails 4.5:1);
          // an empty value still fails `required`, and the list no longer offers it as a choice.
          <option value="" hidden>
            {placeholder}
          </option>
        ) : null}
        {options}
      </select>
      {readOnly ? null : (
        <ChevronDown aria-hidden className={cn("pointer-events-none absolute text-fg-subtle", size === "sm" ? "end-2.5" : size === "lg" ? "end-3.5" : "end-3")} />
      )}
    </div>
  );
});
