"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "../lib/cn";
import { useFieldContext, useFieldControl } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { useControllableState } from "../lib/use-controllable-state";
import { Spinner } from "./spinner";

const otpLabels = {
  label: "Verification code, {length} digits",
  labelCharacters: "Verification code, {length} characters",
  verifying: "Verifying code…",
};
export type InputOTPLabels = typeof otpLabels;

const PATTERNS = {
  digits: "^\\d+$",
  alphanumeric: "^[a-zA-Z0-9]+$",
} as const;

interface OTPStyleContextValue {
  size: "md" | "lg";
  mask: boolean;
  invalid: boolean;
}
const OTPStyleContext = /*#__PURE__*/ React.createContext<OTPStyleContextValue>({ size: "md", mask: false, invalid: false });

/* ------------------------------------------------------------------ */
/* Composite parts                                                     */
/* ------------------------------------------------------------------ */

export interface InputOTPRootProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "pattern" | "children" | "maxLength"> {
  /** Number of characters. */
  maxLength: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once all slots are filled. */
  onComplete?: (value: string) => void;
  /** Allowed characters. Default `"digits"`. */
  pattern?: "digits" | "alphanumeric" | RegExp;
  size?: "md" | "lg";
  /** Show dots instead of characters (the value is unchanged). */
  mask?: boolean;
  invalid?: boolean;
  /** Code is being checked: spinner after the slots, input read-only. */
  loading?: boolean;
  /** Classes for the visual container (`className` too). */
  containerClassName?: string;
  labels?: Partial<InputOTPLabels>;
  children: React.ReactNode;
}

/**
 * One real `<input>` (screen readers, SMS autofill, password managers and paste all see one
 * field) with visual slots drawn over it. Compose `InputOTPGroup` / `InputOTPSlot` /
 * `InputOTPSeparator`, or use the `InputOTP` shorthand.
 */
export const InputOTPRoot = /*#__PURE__*/ React.forwardRef<HTMLInputElement, InputOTPRootProps>(function InputOTPRoot(rawProps, ref) {
  const {
    maxLength,
    value: valueProp,
    defaultValue,
    onValueChange,
    onComplete,
    pattern = "digits",
    size = "md",
    mask = false,
    invalid,
    loading,
    containerClassName,
    className,
    labels,
    children,
    ...rest
  } = rawProps;
  const t = useLabels("otp", otpLabels, labels);
  const field = useFieldContext();
  const props = useFieldControl({ ...rest, "aria-invalid": invalid ? true : rest["aria-invalid"] });
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue: defaultValue ?? "", onChange: onValueChange, name: "InputOTP" });
  const isInvalid = Boolean(props["aria-invalid"]) && props["aria-invalid"] !== "false";
  const named = props["aria-label"] || props["aria-labelledby"] || field?.labelId;
  const patternSource = pattern instanceof RegExp ? pattern.source : PATTERNS[pattern];
  const style = React.useMemo(() => ({ size, mask, invalid: isInvalid }), [size, mask, isInvalid]);

  return (
    <OTPStyleContext.Provider value={style}>
      <OTPInput
        ref={ref}
        {...props}
        maxLength={maxLength}
        value={value}
        onChange={(v: string) => setValue(v)}
        onComplete={onComplete}
        pattern={patternSource}
        inputMode={pattern === "digits" ? "numeric" : "text"}
        autoComplete="one-time-code"
        readOnly={props.readOnly || loading}
        aria-busy={loading || undefined}
        aria-label={named ? props["aria-label"] : t(pattern === "digits" ? "label" : "labelCharacters", { length: maxLength })}
        data-slot="input-otp-input"
        containerClassName={cn(
          "group/otp flex items-center gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-50",
          isInvalid && "ui-otp-invalid",
          containerClassName,
          className,
        )}
        // Slots are always left-to-right, even in RTL pages.
        dir="ltr"
      >
        <>
          {children}
          {loading ? (
            <span className="ms-1 inline-flex items-center">
              <Spinner size="sm" tone="muted" label={t("verifying")} />
            </span>
          ) : null}
        </>
      </OTPInput>
    </OTPStyleContext.Provider>
  );
});

/** A run of joined slots. */
export const InputOTPGroup = /*#__PURE__*/ React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function InputOTPGroup({ className, ...props }, ref) {
  return <div ref={ref} data-slot="input-otp-group" className={cn("ui-otp-group flex items-center", className)} {...props} />;
});

export interface InputOTPSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Position of the character this slot shows (0-based). */
  index: number;
}

/** One visual character box: active ring, fake caret, filled state. */
export const InputOTPSlot = /*#__PURE__*/ React.forwardRef<HTMLDivElement, InputOTPSlotProps>(function InputOTPSlot({ index, className, ...props }, ref) {
  const ctx = React.useContext(OTPInputContext);
  const { size, mask, invalid } = React.useContext(OTPStyleContext);
  const slot = ctx.slots[index];
  const char = slot?.char ?? null;
  return (
    <div
      ref={ref}
      data-slot="input-otp-slot"
      data-active={slot?.isActive ? "" : undefined}
      data-filled={char ? "" : undefined}
      aria-hidden
      className={cn(
        "relative flex items-center justify-center border-y border-e border-field-border bg-field font-medium text-fg tabular",
        "transition-[border-color,box-shadow,background-color] duration-150",
        "first:rounded-s-ui first:border-s last:rounded-e-ui",
        size === "lg" ? "h-[calc(var(--control-h)+1rem)] w-[calc(var(--control-h)+0.25rem)] text-xl" : "h-[calc(var(--control-h)+0.25rem)] w-[calc(var(--control-h)-0.25rem)] text-lg",
        "group-hover/otp:border-field-border-hover",
        slot?.isActive && "z-10 border-ring shadow-[0_0_0_3px_var(--accent-soft)]",
        slot?.isActive && "border-s",
        invalid && "border-danger",
        invalid && slot?.isActive && "shadow-[0_0_0_3px_color-mix(in_srgb,var(--danger)_18%,transparent)]",
        className,
      )}
      {...props}
    >
      {char ? mask ? <span className="size-2 rounded-full bg-current" /> : char : null}
      {slot?.hasFakeCaret ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="ui-otp-caret h-[45%] w-px bg-fg" />
        </span>
      ) : null}
    </div>
  );
});

/** Visual divider between groups (123–456). */
export const InputOTPSeparator = /*#__PURE__*/ React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function InputOTPSeparator({ className, ...props }, ref) {
  return (
    <div ref={ref} role="separator" data-slot="input-otp-separator" className={cn("flex w-3 items-center justify-center text-fg-subtle", className)} {...props}>
      <span className="h-px w-2.5 bg-current" />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Shorthand                                                           */
/* ------------------------------------------------------------------ */

export interface InputOTPProps extends Omit<InputOTPRootProps, "maxLength" | "children"> {
  /** Number of characters. Default 6. */
  length?: number;
  /** Slot grouping, e.g. `[3, 3]` → 123–456. Default: one group. */
  groups?: number[];
}

/**
 * One-time code entry: 2FA sign-in, SMS verification, customer portal email codes, payment
 * confirmation. Paste and SMS autofill fill every slot at once; `onComplete` fires when full.
 *
 * ```tsx
 * <Field label="Verification code" hint="We sent a 6-digit code to +90 532 ••• 41 07.">
 *   <InputOTP name="code" groups={[3, 3]} onComplete={verify} />
 * </Field>
 * ```
 */
export const InputOTP = /*#__PURE__*/ React.forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP({ length = 6, groups, ...props }, ref) {
  const sizes = groups && groups.reduce((a, b) => a + b, 0) === length ? groups : [length];
  let start = 0;
  return (
    <InputOTPRoot ref={ref} maxLength={length} {...props}>
      {sizes.map((count, gi) => {
        const from = start;
        start += count;
        return (
          <React.Fragment key={gi}>
            {gi > 0 ? <InputOTPSeparator /> : null}
            <InputOTPGroup>
              {Array.from({ length: count }, (_, i) => (
                <InputOTPSlot key={from + i} index={from + i} />
              ))}
            </InputOTPGroup>
          </React.Fragment>
        );
      })}
    </InputOTPRoot>
  );
});
