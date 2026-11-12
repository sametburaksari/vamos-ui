import * as React from "react";
import * as SeparatorPrimitive from "radix-ui/separator";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

export const separatorVariants = /*#__PURE__*/ cva("shrink-0 border-0", {
  variants: {
    tone: {
      line: "bg-line",
      strong: "bg-field-border",
      nav: "bg-nav-line",
    },
    orientation: {
      horizontal: "h-px w-full",
      vertical: "w-px self-stretch",
    },
    inset: { true: "" },
  },
  compoundVariants: [
    { orientation: "horizontal", inset: true, className: "mx-auto w-[calc(100%-2*var(--gap))]" },
    { orientation: "vertical", inset: true, className: "my-1.5" },
  ],
  defaultVariants: { tone: "line", orientation: "horizontal" },
});

export interface SeparatorProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>, "orientation">,
    Omit<VariantProps<typeof separatorVariants>, "orientation"> {
  orientation?: "horizontal" | "vertical";
  /**
   * Purely visual (default `true`): hidden from assistive tech. Set `false` when the separator
   * divides meaningful groups (toolbars, menus) so it is announced as `role="separator"`.
   */
  decorative?: boolean;
  /** Text in the middle of a horizontal line ("or"). The label is read as normal text. */
  label?: React.ReactNode;
  /** Label alignment. Default `"center"`. */
  labelAlign?: "start" | "center" | "end";
}

/**
 * A hairline divider between content: card sections, menu groups, the "or" on a sign-in form,
 * toolbar groups. Built on Radix Separator.
 *
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" className="h-5" />
 * <Separator label="or continue with" />
 * ```
 */
export const Separator = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(function Separator(
  { className, orientation = "horizontal", decorative = true, tone, inset, label, labelAlign = "center", ...props },
  ref,
) {
  if (label != null && orientation === "horizontal") {
    const line = <SeparatorPrimitive.Root decorative className={cn(separatorVariants({ tone, orientation: "horizontal" }), "w-auto flex-1")} />;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        data-slot="separator"
        data-orientation="horizontal"
        className={cn("flex w-full items-center gap-3 text-xs text-fg-subtle", inset && "px-(--gap)", className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {labelAlign !== "start" ? line : null}
        <span className="shrink-0 tracking-[0.01em]">{label}</span>
        {labelAlign !== "end" ? line : null}
      </div>
    );
  }
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(separatorVariants({ tone, orientation, inset }), className)}
      {...props}
    />
  );
});
