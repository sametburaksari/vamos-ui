import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "../lib/cn";

export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium",
    "transition-[background-color,border-color,box-shadow,color,filter] duration-150 focus-ring",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "active:translate-y-px [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** The one loud action on a screen. */
        primary:
          "bg-accent text-accent-fg font-semibold shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-black/10 hover:brightness-[1.04]",
        /** Default: a calm action on a surface. */
        secondary: "border border-field-border bg-field text-fg shadow-[0_1px_1px_rgb(0_0_0/0.04)] hover:border-field-border-hover hover:bg-hover",
        ghost: "text-fg hover:bg-hover",
        soft: "bg-accent-soft text-accent-ink hover:brightness-95",
        /** Dark, typographic action for decisive steps ("Publish"). */
        solid: "bg-fg text-scene hover:opacity-90",
        danger: "bg-danger text-white shadow-sm hover:brightness-110",
        "danger-ghost": "text-danger hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]",
        link: "h-auto! p-0! text-accent-ink underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 gap-1 rounded-ui-sm px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-8 gap-1.5 rounded-ui-sm px-3 text-[13px] [&_svg]:size-3.5",
        md: "h-(--control-h) gap-2 rounded-ui px-4 text-sm [&_svg]:size-4",
        lg: "h-12 gap-2.5 rounded-ui px-6 text-[15px] [&_svg]:size-[18px]",
        "icon-xs": "size-7 rounded-ui-sm [&_svg]:size-3.5",
        "icon-sm": "size-8 rounded-ui-sm [&_svg]:size-4",
        icon: "size-(--control-h) rounded-ui [&_svg]:size-[18px]",
      },
      block: { true: "w-full" },
      pill: { true: "rounded-full!" },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. Next <Link>), keeping the styles. */
  asChild?: boolean;
  /** Spinner, aria-busy and click lock. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, pill, asChild, loading, disabled, children, type, ...props },
  ref,
) {
  const classes = cn(buttonVariants({ variant, size, block, pill }), className);
  if (asChild) {
    return (
      <Slot.Root ref={ref} className={classes} aria-busy={loading || undefined} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button ref={ref} type={type ?? "button"} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
});

export interface IconButtonProps extends Omit<ButtonProps, "size" | "aria-label"> {
  /** Accessible name — required for icon-only controls. Also used as the tooltip. */
  label: string;
  size?: "xs" | "sm" | "md";
}

const iconSize = { xs: "icon-xs", sm: "icon-sm", md: "icon" } as const;

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "md", variant = "ghost", title, ...props },
  ref,
) {
  return <Button ref={ref} aria-label={label} title={title ?? label} variant={variant} size={iconSize[size]} {...props} />;
});
