import * as React from "react";
import * as Slot from "radix-ui/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { SkeletonText } from "./skeleton";

export const cardVariants = /*#__PURE__*/ cva("relative block [--card-p:var(--gap)]", {
  variants: {
    variant: {
      /** The main surface: glass or solid from tokens. */
      surface: "surface rounded-ui-lg",
      /** Hairline border, no fill — quiet grouping on a surface. */
      outline: "rounded-ui-lg border border-line",
      /** No chrome; keeps the card spacing. */
      ghost: "rounded-ui-lg",
      /** A card inside a card: `surface-2`, never blurs (glass budget). */
      inset: "surface-2 rounded-ui",
    },
    padding: {
      /** Parts (CardHeader/Body/Footer) bring their own padding. */
      none: "",
      sm: "p-[calc(var(--card-p)*0.7)]",
      md: "p-(--card-p)",
    },
    interactive: {
      true: "cursor-pointer transition-[border-color,box-shadow,transform] duration-150 hover:border-field-border-hover focus-ring has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-ring motion-safe:active:translate-y-px",
    },
  },
  defaultVariants: { variant: "surface", padding: "none" },
});

export interface CardProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof cardVariants> {
  /** Merge onto the child — e.g. `<Card asChild interactive><Link href>…</Link></Card>` makes the whole card a link. */
  asChild?: boolean;
  /** Semantic element. Use `"section"` with `aria-labelledby` pointing at the CardTitle id. Default `"div"`. */
  as?: "div" | "section" | "article" | "aside" | "li";
  /** Sets `aria-busy`; render `<CardBody loading />` for the shimmer. */
  loading?: boolean;
  /** Selected state for selectable cards (`data-selected`, accent border). */
  selected?: boolean;
}

/**
 * The main content surface. Takes its glass or solid material from tokens; spacing follows
 * `--gap` (density axis). In glass mode nest cards with `variant="inset"` — a second blurred
 * surface costs frames and blurs text.
 *
 * ```tsx
 * <Card>
 *   <CardHeader title="Open deals" description="Pipeline value by stage" action={<Button size="sm">View all</Button>} />
 *   <CardBody>…</CardBody>
 * </Card>
 * ```
 */
export const Card = /*#__PURE__*/ React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, padding, interactive, asChild, as = "div", loading, selected, ...props },
  ref,
) {
  const Comp = (asChild ? Slot.Root : as) as React.ElementType;
  return (
    <Comp
      ref={ref}
      data-slot="card"
      data-variant={variant ?? "surface"}
      data-selected={selected ? "" : undefined}
      aria-busy={loading || undefined}
      className={cn(cardVariants({ variant, padding, interactive }), selected && "border-accent-ink! ring-1 ring-accent-ink", className)}
      {...props}
    />
  );
});

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Small line above the title ("Q3 · Sales"). No CSS uppercase — Turkish-safe. */
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Actions at the top end. */
  action?: React.ReactNode;
  /** Heading level of `title`. Default `"h3"`. */
  titleAs?: "h2" | "h3" | "h4";
  /** Id for the title (for `aria-labelledby` on a section card). */
  titleId?: string;
  /** Hairline under the header. */
  divider?: boolean;
}

/** Prop-based header (title, description, action). For custom layouts compose CardTitle / CardDescription / CardAction. */
export const CardHeader = /*#__PURE__*/ React.forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { eyebrow, title, description, action, titleAs = "h3", titleId, divider, className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        "flex items-start justify-between gap-4 px-(--card-p,1.25rem) pt-[calc(var(--card-p,1.25rem)*0.8)] pb-[calc(var(--card-p,1.25rem)*0.6)]",
        divider && "border-b border-line pb-[calc(var(--card-p,1.25rem)*0.8)]",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        {eyebrow ? <CardEyebrow>{eyebrow}</CardEyebrow> : null}
        {title ? (
          <CardTitle as={titleAs} id={titleId}>
            {title}
          </CardTitle>
        ) : null}
        {description ? <CardDescription>{description}</CardDescription> : null}
        {children}
      </div>
      {action ? <CardAction>{action}</CardAction> : null}
    </div>
  );
});

/** Small mono line above a title. */
export function CardEyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="card-eyebrow" className={cn("mb-1 font-mono text-[11px] tracking-[0.06em] text-fg-subtle", className)} {...props} />;
}

/** Card title. Default `<h3>`. */
export const CardTitle = /*#__PURE__*/ React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" | "p" }>(
  function CardTitle({ as: Tag = "h3", className, ...props }, ref) {
    return <Tag ref={ref} data-slot="card-title" className={cn("text-[15px] font-semibold tracking-[-0.01em] text-balance text-fg", className)} {...props} />;
  },
);

/** Secondary line under the title. */
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="card-description" className={cn("mt-0.5 text-[13px] text-pretty text-fg-muted", className)} {...props} />;
}

/** Actions slot at the top end of a header. */
export function CardAction({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-action" className={cn("flex shrink-0 items-center gap-1.5", className)} {...props} />;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Replace the content with a text skeleton. */
  loading?: boolean;
  /** Lines of the loading skeleton. Default 3. */
  loadingLines?: number;
}

export const CardBody = /*#__PURE__*/ React.forwardRef<HTMLDivElement, CardBodyProps>(function CardBody({ className, loading, loadingLines = 3, children, ...props }, ref) {
  return (
    <div ref={ref} data-slot="card-body" className={cn("px-(--card-p,1.25rem) pb-(--card-p,1.25rem)", className)} {...props}>
      {loading ? <SkeletonText lines={loadingLines} /> : children}
    </div>
  );
});

export const CardFooter = /*#__PURE__*/ React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn("flex items-center gap-2 border-t border-line px-(--card-p,1.25rem) py-[calc(var(--card-p,1.25rem)*0.6)]", className)}
      {...props}
    />
  );
});

/** A secondary tile inside a card (`surface-2`, never blurs). */
export const Inset = /*#__PURE__*/ React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Inset({ className, ...props }, ref) {
  return <div ref={ref} data-slot="inset" className={cn("surface-2 rounded-ui", className)} {...props} />;
});
