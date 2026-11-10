import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const SIZES = { xs: 12, sm: 16, md: 20, lg: 28 } as const;
const STROKE = { xs: 3, sm: 2.75, md: 2.5, lg: 2.25 } as const;

export const spinnerVariants = cva("ui-spinner inline-block shrink-0 align-middle", {
  variants: {
    tone: {
      /** Inherits the text colour — the default inside buttons. */
      current: "text-current",
      accent: "text-accent-ink",
      muted: "text-fg-muted",
    },
  },
  defaultVariants: { tone: "current" },
});

export interface SpinnerProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children">, VariantProps<typeof spinnerVariants> {
  /** 12 / 16 / 20 / 28 px, or any pixel number. Default `"sm"`. */
  size?: keyof typeof SIZES | number;
  /**
   * Accessible status text ("Saving changes"). When set, the spinner is announced politely
   * (`role="status"`); without it the spinner is decorative (`aria-hidden`) — use that inside a
   * button that already has `aria-busy`.
   */
  label?: string;
  /** ms to wait before showing, so fast responses don't flash a spinner. CSS-only. */
  delay?: number;
}

/**
 * Indeterminate loading indicator: a thin track with a rotating, breathing arc.
 * Server-compatible. Under `prefers-reduced-motion` it pulses slowly instead of spinning.
 *
 * ```tsx
 * <Spinner label="Loading orders" />
 * <Button loading>Save</Button>   // uses a decorative Spinner
 * ```
 */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { size = "sm", tone, label, delay, className, style, ...props },
  ref,
) {
  const px = typeof size === "number" ? size : SIZES[size];
  const stroke = typeof size === "number" ? (size <= 14 ? 3 : size >= 26 ? 2.25 : 2.5) : STROKE[size];
  const svg = (
    <svg
      ref={ref}
      data-slot="spinner"
      viewBox="0 0 24 24"
      width={px}
      height={px}
      fill="none"
      aria-hidden
      focusable="false"
      className={cn(spinnerVariants({ tone }), delay ? "ui-spinner-delayed" : undefined, className)}
      style={delay ? ({ ...style, "--spinner-delay": `${delay}ms` } as React.CSSProperties) : style}
      {...props}
    >
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeOpacity={0.18} strokeWidth={stroke} />
      <circle
        className="ui-spinner-arc"
        cx="12"
        cy="12"
        r="9.25"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
      />
    </svg>
  );
  if (!label) return svg;
  return (
    <span role="status" aria-live="polite" data-slot="spinner-status" className="inline-flex items-center">
      {svg}
      <span className="sr-only">{label}</span>
    </span>
  );
});
