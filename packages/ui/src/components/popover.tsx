"use client";

import * as React from "react";
import * as PopoverPrimitive from "radix-ui/popover";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { FloatingArrow } from "../lib/floating-arrow";

/** Root. Controlled (`open` / `onOpenChange`) or uncontrolled (`defaultOpen`). */
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
/** Position the content against something other than the trigger. */
export const PopoverAnchor = PopoverPrimitive.Anchor;
/** Closes the popover; use `asChild` with a Button. */
export const PopoverClose = PopoverPrimitive.Close;

export const popoverContentVariants = /*#__PURE__*/ cva(
  ["surface-popover ui-pop z-(--z-popover) rounded-ui-lg outline-none", "max-h-(--radix-popover-content-available-height) overflow-y-auto overscroll-contain"],
  {
    variants: {
      size: {
        auto: "w-auto max-w-[calc(100vw-1.5rem)]",
        sm: "w-64 max-w-[calc(100vw-1.5rem)]",
        md: "w-80 max-w-[calc(100vw-1.5rem)]",
        lg: "w-[26rem] max-w-[calc(100vw-1.5rem)]",
        /** Same width as the trigger (lists, comboboxes). */
        trigger: "w-(--radix-popover-trigger-width) min-w-40",
      },
      padded: {
        true: "p-(--popover-p) [--popover-p:calc(var(--gap)*0.85)]",
        false: "p-0 [--popover-p:0px]",
      },
    },
    defaultVariants: { size: "md", padded: true },
  },
);

const PopoverTitleContext = /*#__PURE__*/ React.createContext<{ id: string; register: (on: boolean) => void } | null>(null);

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>, VariantProps<typeof popoverContentVariants> {
  /** Show the pointer arrow. Default `false`. */
  arrow?: boolean;
}

/**
 * The floating panel. Portals into the nearest `ThemeScope`, sets the layer depth
 * (only the first layer blurs in glass mode; a popover inside a dialog turns opaque),
 * and is labelled by its `PopoverTitle` when one is rendered.
 */
export const PopoverContent = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(function PopoverContent(
  { className, size, padded, arrow = false, sideOffset = 6, collisionPadding = 12, align = "center", children, ...props },
  ref,
) {
  const container = usePortalContainer();
  const titleId = React.useId();
  const [hasTitle, setHasTitle] = React.useState(false);
  const titleCtx = React.useMemo(() => ({ id: titleId, register: setHasTitle }), [titleId]);
  return (
    <PopoverPrimitive.Portal container={container}>
      <Layer asChild>
        <PopoverPrimitive.Content
          ref={ref}
          data-slot="popover-content"
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          align={align}
          aria-labelledby={hasTitle ? titleId : undefined}
          className={cn(popoverContentVariants({ size, padded }), className)}
          {...props}
        >
          <PopoverTitleContext.Provider value={titleCtx}>{children}</PopoverTitleContext.Provider>
          {arrow ? (
            <PopoverPrimitive.Arrow asChild width={14} height={7}>
              <FloatingArrow />
            </PopoverPrimitive.Arrow>
          ) : null}
        </PopoverPrimitive.Content>
      </Layer>
    </PopoverPrimitive.Portal>
  );
});

export interface PopoverHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Heading; becomes the popover's accessible name. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing element (a close button, a badge). */
  action?: React.ReactNode;
}

/** Title + optional description at the top of the content. */
export const PopoverHeader = /*#__PURE__*/ React.forwardRef<HTMLDivElement, PopoverHeaderProps>(function PopoverHeader(
  { title, description, action, className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} data-slot="popover-header" className={cn("mb-3 flex items-start gap-3", className)} {...props}>
      <div className="grid min-w-0 flex-1 gap-0.5">
        {title != null ? <PopoverTitle>{title}</PopoverTitle> : null}
        {description != null ? <PopoverDescription>{description}</PopoverDescription> : null}
        {children}
      </div>
      {action ? <div className="-me-1 -mt-1 shrink-0">{action}</div> : null}
    </div>
  );
});

/** Heading inside the content; wired to `aria-labelledby`. */
export const PopoverTitle = /*#__PURE__*/ React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function PopoverTitle({ className, id, ...props }, ref) {
  const ctx = React.useContext(PopoverTitleContext);
  const register = ctx?.register;
  React.useEffect(() => {
    if (!register || id) return;
    register(true);
    return () => register(false);
  }, [register, id]);
  return <h3 ref={ref} id={id ?? ctx?.id} data-slot="popover-title" className={cn("text-sm font-semibold leading-tight tracking-[-0.005em] text-fg", className)} {...props} />;
});

export function PopoverDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="popover-description" className={cn("text-[13px] leading-snug text-fg-muted", className)} {...props} />;
}

/** Bottom row for actions. Bleeds to the panel edge with a hairline on top. */
export const PopoverFooter = /*#__PURE__*/ React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function PopoverFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="popover-footer"
      className={cn(
        "-mx-(--popover-p) -mb-(--popover-p) mt-4 flex items-center justify-end gap-2 border-t border-line px-(--popover-p) py-[calc(var(--popover-p)*0.7)]",
        className,
      )}
      {...props}
    />
  );
});
