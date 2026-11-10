"use client";

import * as React from "react";
import { Accordion as RadixAccordion } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

type AccordionVariant = "plain" | "separated" | "card";
type AccordionSize = "sm" | "md";
const AccordionContext = React.createContext<{ variant: AccordionVariant; size: AccordionSize; headingLevel: 2 | 3 | 4 | 5 | 6 }>({
  variant: "plain",
  size: "md",
  headingLevel: 3,
});

const rootVariants = cva("w-full", {
  variants: {
    variant: {
      /** Ruled list: hairlines between items. */
      plain: "",
      /** Each item in its own inset box. */
      separated: "flex flex-col gap-2",
      /** All items inside one surface (panel style). */
      card: "surface overflow-hidden rounded-ui-lg",
    },
  },
  defaultVariants: { variant: "plain" },
});

type AccordionRootProps = React.ComponentPropsWithoutRef<typeof RadixAccordion.Root>;

export type AccordionProps = AccordionRootProps & {
  /** `plain` (ruled list, default) · `separated` (boxed items) · `card` (one panel). */
  variant?: AccordionVariant;
  size?: AccordionSize;
  /** Heading level wrapping each trigger, to fit the page outline. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
};

/**
 * Collapsible sections (WAI-ARIA Accordion: a heading containing a button, arrow keys / Home / End
 * move between headers). `type="single"` (add `collapsible` to allow closing the open one) or `type="multiple"`.
 *
 * ```tsx
 * <Accordion type="single" collapsible defaultValue="refunds">
 *   <AccordionItem value="refunds">
 *     <AccordionTrigger>How do refunds work?</AccordionTrigger>
 *     <AccordionContent>Refunds go back to the original card within 5–10 business days.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 *
 * Persisting the open sections is the consumer's job: control `value` and store it.
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { variant = "plain", size = "md", headingLevel = 3, className, ...props },
  ref,
) {
  const ctx = React.useMemo(() => ({ variant, size, headingLevel }), [variant, size, headingLevel]);
  return (
    <AccordionContext.Provider value={ctx}>
      <RadixAccordion.Root ref={ref} data-slot="accordion" data-variant={variant} className={cn(rootVariants({ variant }), className)} {...(props as AccordionRootProps)} />
    </AccordionContext.Provider>
  );
});

const accordionItemVariants = cva("group/acc-item", {
  variants: {
    variant: {
      plain: "border-b border-line last:border-b-0",
      separated: "surface-2 rounded-ui",
      card: "border-b border-line last:border-b-0",
    },
  },
});

export interface AccordionItemProps extends React.ComponentPropsWithoutRef<typeof RadixAccordion.Item> {}

/** One section. `value` identifies it; `disabled` locks it. */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem({ className, ...props }, ref) {
  const { variant } = React.useContext(AccordionContext);
  return <RadixAccordion.Item ref={ref} data-slot="accordion-item" className={cn(accordionItemVariants({ variant }), className)} {...props} />;
});

const pad = { plain: "", separated: "px-4", card: "px-(--gap)" } as const;

export interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger> {
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Right-side summary shown in the header, e.g. "3 selected" or "Scheduled". Part of the button's name. */
  meta?: React.ReactNode;
  /** Buttons next to the header (outside the toggle button, so they stay separate controls). */
  actions?: React.ReactNode;
}

/** The section header: a heading with the toggle button (and optional actions beside it). */
export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger(
  { icon, meta, actions, className, children, ...props },
  ref,
) {
  const { variant, size, headingLevel } = React.useContext(AccordionContext);
  const Heading = `h${headingLevel}` as "h3";
  return (
    <RadixAccordion.Header asChild>
      <Heading data-slot="accordion-header" className={cn("flex items-center gap-1", pad[variant], actions && "pe-2")}>
        <RadixAccordion.Trigger
          ref={ref}
          data-slot="accordion-trigger"
          className={cn(
            "group/acc flex min-w-0 flex-1 items-center gap-3 rounded-ui-sm text-start font-medium text-fg outline-none transition-colors focus-ring",
            "disabled:cursor-not-allowed disabled:opacity-45",
            "hover:[&_[data-slot=accordion-title]]:underline hover:[&_[data-slot=accordion-title]]:decoration-line hover:[&_[data-slot=accordion-title]]:underline-offset-4",
            size === "sm" ? "py-2.5 text-[13px] [&_svg]:size-3.5" : "py-3.5 text-sm [&_svg]:size-4",
            variant === "plain" && (size === "sm" ? "py-2" : "py-3"),
            className,
          )}
          {...props}
        >
          {icon ? <span aria-hidden className="inline-flex shrink-0 text-fg-muted [&_svg]:shrink-0">{icon}</span> : null}
          <span data-slot="accordion-title" className="min-w-0 flex-1 text-pretty">
            {children}
          </span>
          {meta ? <span className="sr-only">, </span> : null}
          {meta ? (
            <span data-slot="accordion-meta" className="tabular shrink-0 truncate text-[13px] font-normal text-fg-subtle">
              {meta}
            </span>
          ) : null}
          <ChevronDown aria-hidden className="shrink-0 text-fg-subtle transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]/acc:rotate-180" />
        </RadixAccordion.Trigger>
        {actions ? (
          <span data-slot="accordion-actions" className="flex shrink-0 items-center gap-0.5">
            {actions}
          </span>
        ) : null}
      </Heading>
    </RadixAccordion.Header>
  );
});

export interface AccordionContentProps extends React.ComponentPropsWithoutRef<typeof RadixAccordion.Content> {}

/** The collapsible body. Animates its height (`ui-collapse`, reduced-motion safe). */
export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(function AccordionContent({ className, children, ...props }, ref) {
  const { variant, size } = React.useContext(AccordionContext);
  return (
    <RadixAccordion.Content ref={ref} data-slot="accordion-content" className="ui-collapse" {...props}>
      <div className={cn("text-fg-muted", size === "sm" ? "pb-3 text-[13px]" : "pb-4 text-sm leading-relaxed", pad[variant], className)}>{children}</div>
    </RadixAccordion.Content>
  );
});
