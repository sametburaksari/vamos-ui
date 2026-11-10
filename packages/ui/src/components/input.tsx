import * as React from "react";
import { cn } from "../lib/cn";

export const fieldBase =
  "w-full min-w-0 rounded-ui border border-field-border bg-field text-sm text-fg placeholder:text-fg-subtle transition-[border-color,box-shadow] duration-150 hover:border-field-border-hover focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--danger)_18%,transparent)]";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Icon or text at the start. */
  leading?: React.ReactNode;
  /** Icon, unit or button at the end. */
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ className, leading, trailing, ...props }, ref) {
  if (!leading && !trailing) {
    return <input ref={ref} className={cn(fieldBase, "h-(--control-h) px-3", className)} {...props} />;
  }
  return (
    <div className={cn("relative flex items-center", className)}>
      {leading ? (
        <span className="pointer-events-none absolute start-3 flex items-center text-fg-subtle [&_svg]:size-4">{leading}</span>
      ) : null}
      <input ref={ref} className={cn(fieldBase, "h-(--control-h) px-3", leading && "ps-9", trailing && "pe-10")} {...props} />
      {trailing ? <span className="absolute end-1.5 flex items-center text-fg-subtle [&_svg]:size-4">{trailing}</span> : null}
    </div>
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 4, ...props },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={cn(fieldBase, "field-sizing-content min-h-20 px-3 py-2.5 leading-relaxed", className)} {...props} />;
});

export interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Control id the label points to. Generated and passed to the single child when omitted. */
  id?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}

/** Label + control + hint/error text. Wires up the accessibility attributes itself. */
export function Field({ label, hint, error, id, required, className, children }: FieldProps) {
  const autoId = React.useId();
  const controlId = id ?? children.props.id ?? autoId;
  const descId = hint || error ? `${controlId}-desc` : undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      {label ? (
        <label htmlFor={controlId} className="text-[13px] font-medium text-fg">
          {label}
          {required ? <span className="ms-0.5 text-danger">*</span> : null}
        </label>
      ) : null}
      {React.cloneElement(children, {
        id: controlId,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-describedby": descId,
      })}
      {error ? (
        <p id={descId} className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p id={descId} className="text-xs text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] font-medium text-fg", className)} {...props} />;
}
