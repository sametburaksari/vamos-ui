import * as React from "react";
import * as Slot from "radix-ui/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { ChipRemoveButton, LocaleCount } from "../lib/islands";

export const badgeVariants = /*#__PURE__*/ cva(
  "inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-medium leading-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-selected text-fg-muted",
        accent: "bg-accent-soft text-accent-ink",
        success: "tone-success tone-soft",
        warning: "tone-warning tone-soft",
        danger: "tone-danger tone-soft",
        info: "tone-info tone-soft",
        outline: "border border-field-border text-fg-muted",
        /** Driven by the `color` prop (user-defined label colours). */
        custom: "tone-soft",
      },
      size: {
        sm: "h-5 px-2 text-[11px]",
        md: "h-6 px-2.5 text-xs",
        lg: "h-7 gap-1.5 px-3 text-[13px] [&_svg]:size-3.5",
      },
      shape: {
        pill: "rounded-full",
        /** Version / code tags. */
        square: "rounded-ui-sm",
      },
      interactive: {
        true: "cursor-pointer transition-[filter,background-color] hover:brightness-95 focus-ring",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm", shape: "pill" },
  },
);

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">, Omit<VariantProps<typeof badgeVariants>, "interactive"> {
  /** Render as the child element (e.g. a `<Link>` to a filtered list). Ignored when `onRemove` is set. */
  asChild?: boolean;
  /** Small status dot before the label. */
  dot?: boolean;
  /** Any CSS colour (hex, oklch, var()) — user-defined label colours. Overrides `tone`. */
  color?: string;
  /** Show a number instead of children, with tabular figures and a cap (`max`). */
  count?: number;
  /** Cap for `count`: 120 → "99+". Default 99. */
  max?: number;
  /** Makes the badge a removable chip with a × button. */
  onRemove?: () => void;
  /** Accessible name of the × button. Default "Remove {label}" (dictionary `badge.remove`). */
  removeLabel?: string;
  /** Dims the badge and disables the remove button. */
  disabled?: boolean;
}

/**
 * Status, count and label pill — and the kit's chip (`onRemove`), reused by Tag input,
 * Combobox multi-select and Filter bar. Server-compatible (the remove button and count
 * formatting are tiny client islands).
 *
 * ```tsx
 * <Badge tone="success" dot>Published</Badge>
 * <Badge count={128} tone="accent" />            // "99+"
 * <Badge onRemove={() => drop("design")}>Design</Badge>
 * <Badge asChild interactive><Link href="/posts?status=draft">Draft</Link></Badge>
 * ```
 *
 * No CSS `uppercase` — it breaks Turkish (i → I) without the right `lang`; use `upperText()`.
 */
export const Badge = /*#__PURE__*/ React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, tone, size, shape, dot, color, count, max = 99, onRemove, removeLabel, disabled, asChild, children, style, ...props },
  ref,
) {
  const removable = Boolean(onRemove);
  const Comp = asChild && !removable ? Slot.Root : "span";
  const classes = cn(
    badgeVariants({ tone: color ? "custom" : tone, size, shape, interactive: asChild && !removable ? true : undefined }),
    count !== undefined && "tabular justify-center",
    count !== undefined && (size === "lg" ? "min-w-7 px-2" : size === "md" ? "min-w-6 px-2" : "min-w-5 px-1.5"),
    removable && "pe-1.5",
    disabled && "pointer-events-none opacity-50",
    className,
  );
  const content = count !== undefined ? <LocaleCount value={count} max={max} /> : children;

  if (Comp === Slot.Root) {
    const slotProps = {
      ref,
      "data-slot": "badge",
      className: classes,
      style: color ? { ...style, ["--tone" as string]: color } : style,
      "aria-disabled": disabled || undefined,
      ...props,
    };
    // Slot needs the dot and the Slottable as direct children (no fragment).
    return dot ? (
      <Slot.Root {...slotProps}>
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
        <Slot.Slottable>{children}</Slot.Slottable>
      </Slot.Root>
    ) : (
      <Slot.Root {...slotProps}>{children}</Slot.Root>
    );
  }
  return (
    <span
      ref={ref}
      data-slot="badge"
      data-tone={color ? "custom" : (tone ?? "neutral")}
      className={classes}
      style={color ? { ...style, ["--tone" as string]: color } : style}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {dot ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
      {content}
      {onRemove ? (
        <ChipRemoveButton
          onRemove={onRemove}
          disabled={disabled}
          removeLabel={removeLabel}
          itemLabel={typeof children === "string" || typeof children === "number" ? String(children) : undefined}
        />
      ) : null}
    </span>
  );
});
