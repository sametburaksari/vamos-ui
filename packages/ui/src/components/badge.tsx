import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

export const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-medium [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-selected text-fg-muted",
        accent: "bg-accent-soft text-accent-ink",
        success: "bg-[color-mix(in_srgb,var(--success)_13%,transparent)] text-success",
        warning: "bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-warning",
        danger: "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger",
        info: "bg-[color-mix(in_srgb,var(--info)_12%,transparent)] text-info",
        outline: "border border-field-border text-fg-muted",
      },
      size: {
        sm: "h-5 px-2 text-[11px]",
        md: "h-6 px-2.5 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Small status dot before the label. */
  dot?: boolean;
}

export function Badge({ className, tone, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {dot ? <span aria-hidden className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
