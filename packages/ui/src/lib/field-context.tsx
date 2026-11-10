"use client";

import * as React from "react";
import { mergeIds } from "./compose-refs";

/** What a `Field` tells the control inside it. */
export interface FieldContextValue {
  /** Id for the control (the `<label for>` target). */
  id: string;
  /** Id of the visible label, for role-based controls that `<label for>` can't name (radio group, slider…). */
  labelId?: string;
  /** Ids of the visible hint / error, in reading order. */
  describedBy?: string;
  /** Id of the error text when it is shown. */
  errorId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
  /** Form field name, so adapters can look up errors. */
  name?: string;
}

export const FieldContext = React.createContext<FieldContextValue | null>(null);

/** The surrounding Field, or `null`. */
export function useFieldContext(): FieldContextValue | null {
  return React.useContext(FieldContext);
}

/**
 * Stops a Field's wiring from reaching controls rendered inside an overlay of a field control
 * (e.g. the search input inside a Combobox popover).
 */
export function FieldContextReset({ children }: { children: React.ReactNode }) {
  return <FieldContext.Provider value={null}>{children}</FieldContext.Provider>;
}

/** Accessibility props a control can receive from a Field. */
export interface ControlA11yProps {
  id?: string;
  name?: string;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
  "aria-required"?: boolean | "true" | "false";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

/**
 * Wires a control to the surrounding `Field`. Call it in every kit control with the control's own
 * props and spread the result on the focusable element. The control's own values win, except
 * `aria-describedby`, which is merged (Field ids first).
 *
 * ```tsx
 * const Select = React.forwardRef((props, ref) => {
 *   const control = useFieldControl(props);
 *   return <button ref={ref} {...control} />;
 * });
 * ```
 *
 * Outside a Field it returns the props unchanged (with an `id` only if one was given).
 * Native elements only get `required`; set `aria-required` yourself for role-based controls.
 */
export function useFieldControl<P extends ControlA11yProps>(props: P): P {
  const field = React.useContext(FieldContext);
  if (!field) return props;
  const invalid = props["aria-invalid"] ?? (field.invalid ? true : undefined);
  return {
    ...props,
    id: props.id ?? field.id,
    name: props.name ?? field.name,
    "aria-describedby": mergeIds(field.describedBy, props["aria-describedby"]),
    "aria-invalid": invalid,
    required: props.required ?? (field.required || undefined),
    disabled: props.disabled ?? (field.disabled || undefined),
    readOnly: props.readOnly ?? (field.readOnly || undefined),
  };
}

/**
 * Focuses the first invalid control in a form (after a failed submit). Returns it, or `null`.
 *
 * ```ts
 * onSubmit={(e) => { if (!valid) { e.preventDefault(); focusFirstInvalid(e.currentTarget); } }}
 * ```
 */
export function focusFirstInvalid(root: HTMLElement | null | undefined): HTMLElement | null {
  const el = root?.querySelector<HTMLElement>('[aria-invalid="true"], :invalid:not(fieldset):not(form)');
  if (!el) return null;
  el.focus();
  el.scrollIntoView?.({ block: "center", behavior: "smooth" });
  return el;
}
