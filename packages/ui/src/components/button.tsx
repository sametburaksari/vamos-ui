import * as React from "react";
import * as Slot from "radix-ui/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Spinner } from "./spinner";
import { IconButtonTooltip, type TooltipContentProps } from "./tooltip";

export const buttonVariants = /*#__PURE__*/ cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium",
    "transition-[background-color,border-color,box-shadow,color,filter,opacity] duration-150 focus-ring",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "motion-safe:active:translate-y-px [&_svg]:shrink-0",
    // loading: the spinner replaces a leading icon instead of adding a second one
    "[&[data-loading]>[data-slot=spinner]+svg]:hidden",
  ],
  {
    variants: {
      variant: {
        /** The one loud action on a screen. */
        primary:
          "bg-accent text-accent-fg font-semibold shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-[color-mix(in_srgb,var(--fg)_10%,transparent)] hover:brightness-[1.04]",
        /** Default: a calm action on a surface. */
        secondary:
          "border border-field-border bg-field text-fg shadow-[0_1px_1px_rgb(0_0_0/0.04)] hover:border-field-border-hover hover:bg-hover glass:border-field-border-hover",
        ghost: "text-fg hover:bg-hover",
        soft: "bg-accent-soft text-accent-ink hover:brightness-95",
        /** Dark, typographic action for decisive steps ("Publish"). */
        solid: "bg-fg text-scene hover:opacity-90",
        danger: "bg-danger-solid text-white shadow-sm hover:brightness-110",
        "danger-ghost": "text-danger hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]",
        link: "h-auto! p-0! text-accent-ink underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 gap-1 rounded-ui-sm px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-8 gap-1.5 rounded-ui-sm px-3 text-[13px] [&_svg]:size-3.5",
        md: "h-(--control-h) gap-2 rounded-ui px-4 text-sm [&_svg]:size-4",
        lg: "h-12 gap-2.5 rounded-ui px-6 text-[15px] [&_svg]:size-[18px]",
        /** Hero / website CTA. */
        xl: "h-14 gap-3 rounded-ui px-8 text-base [&_svg]:size-5",
        "icon-xs": "size-7 rounded-ui-sm [&_svg]:size-3.5",
        "icon-sm": "size-8 rounded-ui-sm [&_svg]:size-4",
        icon: "size-(--control-h) rounded-ui [&_svg]:size-[18px]",
        "icon-lg": "size-12 rounded-ui [&_svg]:size-5",
      },
      block: { true: "w-full" },
      pill: { true: "rounded-full!" },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;
const spinnerSize = (size: ButtonSize | null | undefined) => (size === "xs" || size === "sm" || size === "icon-xs" ? "xs" : size === "lg" || size === "xl" || size === "icon-lg" ? "md" : "sm");

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. Next <Link>), keeping the styles. */
  asChild?: boolean;
  /** Spinner, `aria-busy` and click lock. */
  loading?: boolean;
  /** Text shown (and announced) while loading, e.g. "Saving…". Replaces the label. */
  loadingText?: string;
  /**
   * `"inline"` (default): the spinner sits before the label (replacing a leading icon).
   * `"replace"`: the label is hidden and the spinner centred — the width never changes.
   */
  loadingMode?: "inline" | "replace";
}

/**
 * Starts an action. One `primary` per screen; the rest `secondary` or `ghost`.
 *
 * ```tsx
 * <Button variant="primary" loading={saving} loadingText="Publishing…">Publish</Button>
 * <Button asChild><Link href="/posts/new">New post</Link></Button>
 * ```
 *
 * Defaults to `type="button"` (no accidental form submits). With `asChild` + `disabled`/`loading`
 * the element gets `aria-disabled`, leaves the tab order and ignores clicks.
 */
export const Button = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, pill, asChild, loading, loadingText, loadingMode = "inline", disabled, children, type, onClick, ...props },
  ref,
) {
  const classes = cn(buttonVariants({ variant, size, block, pill }), className);
  const state = {
    "data-slot": "button",
    "data-variant": variant ?? "secondary",
    "data-size": size ?? "md",
    "data-loading": loading ? "" : undefined,
    "aria-busy": loading || undefined,
  } as const;
  const spinner = <Spinner size={spinnerSize(size)} className={loadingMode === "replace" ? "absolute" : undefined} />;

  if (asChild) {
    const inert = disabled || loading;
    const slotProps = {
      ref,
      className: classes,
      ...state,
      "aria-disabled": inert || undefined,
      tabIndex: inert ? -1 : undefined,
      // No wrapper function here, so Button stays usable from server components. While inert the
      // element leaves the tab order and `aria-disabled:pointer-events-none` blocks pointer clicks.
      onClick: inert ? undefined : onClick,
      ...props,
    };
    // Slot needs the spinner and the Slottable as direct children (no fragment).
    return loading ? (
      <Slot.Root {...slotProps}>
        {spinner}
        <Slot.Slottable>{children}</Slot.Slottable>
      </Slot.Root>
    ) : (
      <Slot.Root {...slotProps}>{children}</Slot.Root>
    );
  }

  let content: React.ReactNode = children;
  if (loading && loadingText) content = loadingMode === "replace" ? <><span className="invisible">{children}</span><span className="sr-only">{loadingText}</span></> : loadingText;
  // opacity-0 (not visibility:hidden) keeps the label in the accessibility tree, so the busy button keeps its name.
  else if (loading && loadingMode === "replace") content = <span className="inline-flex items-center gap-[inherit] opacity-0">{children}</span>;

  return (
    <button ref={ref} type={type ?? "button"} className={classes} disabled={disabled || loading} onClick={onClick} {...state} {...props}>
      {loading ? spinner : null}
      {content}
    </button>
  );
});

export interface IconButtonProps extends Omit<ButtonProps, "size" | "aria-label" | "loadingText" | "loadingMode"> {
  /** Accessible name — required for icon-only controls. Also shown as the tooltip. */
  label: string;
  size?: "xs" | "sm" | "md" | "lg";
  /**
   * Tooltip text. Default: `label`. A string shows different text (the accessible name stays `label`);
   * `false` turns the tooltip off and uses the native `title` instead.
   * Inside a `TooltipProvider` (App shell ships one) the label is a Tooltip; without one it falls back to `title`.
   */
  tooltip?: boolean | string;
  /** Side the tooltip opens on. Default `"top"`. */
  tooltipSide?: TooltipContentProps["side"];
  /** Shortcut hint in the tooltip, e.g. `"mod+e"`. */
  shortcut?: string | string[];
}

const iconSize = { xs: "icon-xs", sm: "icon-sm", md: "icon", lg: "icon-lg" } as const;

/**
 * Icon-only button. `label` is required: it becomes the accessible name and the tooltip.
 *
 * ```tsx
 * <IconButton label="Delete post" variant="danger-ghost"><Trash2 /></IconButton>
 * <IconButton label="Edit" shortcut="mod+e"><Pencil /></IconButton>
 * ```
 */
export const IconButton = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "md", variant = "ghost", title, loading, tooltip = true, tooltipSide, shortcut, children, ...props },
  ref,
) {
  if (tooltip === false) {
    return (
      <Button ref={ref} aria-label={label} title={title ?? label} variant={variant} size={iconSize[size]} loading={loading} loadingMode="replace" {...props}>
        {children}
      </Button>
    );
  }
  return (
    <IconButtonTooltip label={typeof tooltip === "string" ? tooltip : label} side={tooltipSide} shortcut={shortcut}>
      <Button ref={ref} aria-label={label} {...(title !== undefined ? { title } : null)} variant={variant} size={iconSize[size]} loading={loading} loadingMode="replace" {...props}>
        {children}
      </Button>
    </IconButtonTooltip>
  );
});
