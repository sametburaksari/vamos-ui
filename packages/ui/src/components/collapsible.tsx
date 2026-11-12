"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "radix-ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";

export interface CollapsibleProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {}

/**
 * One show/hide region with its trigger (WAI-ARIA disclosure). Controlled (`open` / `onOpenChange`)
 * or uncontrolled (`defaultOpen`). For several sections that coordinate, use Accordion.
 *
 * ```tsx
 * <Collapsible>
 *   <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
 *   <CollapsibleContent>…</CollapsibleContent>
 * </Collapsible>
 * ```
 */
export const Collapsible = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof CollapsiblePrimitive.Root>, CollapsibleProps>(function Collapsible({ className, ...props }, ref) {
  return <CollapsiblePrimitive.Root ref={ref} data-slot="collapsible" className={cn("group/collapsible", className)} {...props} />;
});

export interface CollapsibleTriggerProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> {
  /** Trailing chevron that turns when open. Default `true` (ignored with `asChild`). */
  chevron?: boolean;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Right-side summary while closed, e.g. "4 fields". Part of the button's name. */
  meta?: React.ReactNode;
}

/**
 * The toggle button (`aria-expanded`, `aria-controls`). Styled as a quiet full-width row; pass
 * `asChild` to make any button (a Button, a link-styled text) the trigger instead.
 */
export const CollapsibleTrigger = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof CollapsiblePrimitive.Trigger>, CollapsibleTriggerProps>(function CollapsibleTrigger(
  { className, chevron = true, icon, meta, asChild, children, ...props },
  ref,
) {
  if (asChild) {
    return (
      <CollapsiblePrimitive.Trigger ref={ref} data-slot="collapsible-trigger" asChild className={className} {...props}>
        {children}
      </CollapsiblePrimitive.Trigger>
    );
  }
  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      data-slot="collapsible-trigger"
      className={cn(
        "group/collapsible-trigger flex w-full min-w-0 items-center gap-2.5 rounded-ui-sm py-2 text-start text-sm font-medium text-fg outline-none transition-colors focus-ring",
        "hover:[&_[data-slot=collapsible-title]]:underline hover:[&_[data-slot=collapsible-title]]:decoration-line hover:[&_[data-slot=collapsible-title]]:underline-offset-4",
        "disabled:cursor-not-allowed disabled:opacity-45",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden className="inline-flex shrink-0 text-fg-muted">
          {icon}
        </span>
      ) : null}
      <span data-slot="collapsible-title" className="min-w-0 flex-1 text-pretty">
        {children}
      </span>
      {meta ? <span className="sr-only">, </span> : null}
      {meta ? (
        <span data-slot="collapsible-meta" className="tabular shrink-0 truncate text-[13px] font-normal text-fg-subtle">
          {meta}
        </span>
      ) : null}
      {chevron ? (
        <ChevronDown
          aria-hidden
          className="text-fg-subtle transition-transform duration-200 group-data-[state=open]/collapsible-trigger:rotate-180 motion-reduce:transition-none in-data-[motion=off]:transition-none"
        />
      ) : null}
    </CollapsiblePrimitive.Trigger>
  );
});

export interface CollapsibleContentProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> {}

/**
 * The hidden region. Animates its height (`ui-collapse`); no animation with
 * `prefers-reduced-motion` or inside `data-motion="off"`. `forceMount` keeps it in the DOM while closed.
 */
export const CollapsibleContent = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof CollapsiblePrimitive.Content>, CollapsibleContentProps>(function CollapsibleContent(
  { className, ...props },
  ref,
) {
  return <CollapsiblePrimitive.Content ref={ref} data-slot="collapsible-content" className={cn("ui-collapse in-data-[motion=off]:animate-none", className)} {...props} />;
});
