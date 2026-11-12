import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Button, IconButton, type ButtonProps } from "./button";

/**
 * Merged-edge styling for any row of controls. Corner rounding is done with logical
 * properties (`rounded-s` / `rounded-e`), so the group is RTL-safe.
 */
export const buttonGroupVariants = /*#__PURE__*/ cva("relative isolate inline-flex w-fit max-w-full", {
  variants: {
    orientation: {
      horizontal: "flex-row items-stretch",
      vertical: "flex-col items-stretch",
    },
    attached: {
      true: "[&>*:focus-visible]:z-10 [&>*:focus-within]:z-10 [&>*:hover]:z-[1] [&>[data-slot=button]]:shadow-none!",
      false: "gap-2",
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      attached: true,
      className:
        "[&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none [&>*:not(:first-child)]:-ms-px [&>[data-slot=button-group-separator]+*]:ms-0",
    },
    {
      orientation: "vertical",
      attached: true,
      className:
        "[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:-mt-px [&>[data-slot=button-group-separator]+*]:mt-0",
    },
  ],
  defaultVariants: { orientation: "horizontal", attached: true },
});

type GroupSize = "xs" | "sm" | "md" | "lg";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement>, Omit<VariantProps<typeof buttonGroupVariants>, "attached" | "orientation"> {
  /** Merged borders (default). `false` keeps a small gap between the buttons. */
  attached?: boolean;
  orientation?: "horizontal" | "vertical";
  /** Default variant for direct Button / IconButton children that don't set one. */
  variant?: ButtonProps["variant"];
  /** Default size for direct Button / IconButton children that don't set one. */
  size?: GroupSize;
}

/**
 * Related buttons merged into one control: split "Save ▾", pager arrows, an editor toolbar,
 * a search field + "Go". `role="group"` — give it an `aria-label`. Every button stays its own
 * tab stop. Server-compatible.
 *
 * ```tsx
 * <ButtonGroup aria-label="Pagination" size="sm">
 *   <IconButton label="Previous page"><ChevronLeft /></IconButton>
 *   <ButtonGroupText>21–40 of 340</ButtonGroupText>
 *   <IconButton label="Next page"><ChevronRight /></IconButton>
 * </ButtonGroup>
 * ```
 *
 * For a selected state (view switch, text alignment) use `ToggleGroup`; for a form value use
 * `RadioGroup variant="segmented"`.
 */
export const ButtonGroup = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { attached = true, orientation = "horizontal", variant, size, className, children, ...props },
  ref,
) {
  const content =
    variant || size
      ? React.Children.map(children, (child) => {
          if (!React.isValidElement<ButtonProps>(child)) return child;
          if (child.type !== Button && child.type !== IconButton) return child;
          const p = child.props as ButtonProps & { size?: string };
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            variant: p.variant ?? variant,
            size: p.size ?? size,
          });
        })
      : children;

  return (
    <div
      ref={ref}
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      data-attached={attached ? "" : undefined}
      data-variant={variant}
      className={cn(buttonGroupVariants({ orientation, attached }), variant === "primary" && "[--group-sep:color-mix(in_srgb,var(--accent-fg)_22%,transparent)]", className)}
      {...props}
    >
      {content}
    </div>
  );
});

export interface ButtonGroupSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

/**
 * Hairline between two attached buttons that share a fill (a primary split button), where
 * the merged border would otherwise disappear.
 */
export const ButtonGroupSeparator = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ButtonGroupSeparatorProps>(function ButtonGroupSeparator(
  { orientation = "vertical", className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="button-group-separator"
      className={cn(
        "relative z-20 shrink-0 self-stretch bg-(--group-sep,var(--field-border))",
        orientation === "vertical" ? "w-px" : "h-px",
        className,
      )}
      {...props}
    />
  );
});

export interface ButtonGroupTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: GroupSize;
}

/** A static segment inside a group: "21–40 of 340", a unit, a prefix. */
export const ButtonGroupText = /*#__PURE__*/ React.forwardRef<HTMLSpanElement, ButtonGroupTextProps>(function ButtonGroupText({ size = "md", className, ...props }, ref) {
  return (
    <span
      ref={ref}
      data-slot="button-group-text"
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap border border-field-border bg-surface-2 font-medium tabular text-fg-muted [&_svg]:size-4",
        size === "xs" ? "h-7 rounded-ui-sm px-2.5 text-xs" : size === "sm" ? "h-8 rounded-ui-sm px-3 text-[13px]" : size === "lg" ? "h-12 rounded-ui px-5 text-[15px]" : "h-(--control-h) rounded-ui px-3.5 text-sm",
        className,
      )}
      {...props}
    />
  );
});
