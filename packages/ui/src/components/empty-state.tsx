import * as React from "react";
import { cva } from "class-variance-authority";
import { CircleCheck, FilePlus2, LockKeyhole, SearchX, TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { LocalizedText } from "../lib/islands";

export type EmptyStateKind = "first-use" | "no-results" | "error" | "forbidden" | "done";

const emptyLabels = {
  firstUse: "Nothing here yet",
  noResults: "No results match your filters",
  error: "Something went wrong",
  forbidden: "You don't have access to this page",
  done: "You're all caught up",
  retry: "Try again",
};

const KIND: Record<EmptyStateKind, { icon: React.ComponentType<{ "aria-hidden"?: boolean }>; label: keyof typeof emptyLabels; well: string }> = {
  "first-use": { icon: FilePlus2, label: "firstUse", well: "bg-accent-soft text-accent-ink" },
  "no-results": { icon: SearchX, label: "noResults", well: "surface-2 text-fg-muted" },
  error: { icon: TriangleAlert, label: "error", well: "tone-danger tone-soft" },
  forbidden: { icon: LockKeyhole, label: "forbidden", well: "surface-2 text-fg-muted" },
  done: { icon: CircleCheck, label: "done", well: "tone-success tone-soft" },
};

export const emptyStateVariants = /*#__PURE__*/ cva("vui-empty flex w-full flex-col items-center text-center", {
  variants: {
    size: {
      /** Inside a table, card or popover. */
      sm: "gap-2.5 px-4 py-8 [--empty-well:2.5rem] [--empty-icon:1.125rem]",
      /** A page section. */
      md: "gap-3 px-6 py-14 [--empty-well:3rem] [--empty-icon:1.375rem]",
      /** A whole page. */
      lg: "gap-4 px-6 py-24 [--empty-well:3.75rem] [--empty-icon:1.625rem]",
    },
    framed: {
      true: "rounded-ui-lg border border-dashed border-field-border",
    },
  },
  defaultVariants: { size: "md" },
});

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Picks the default icon, its tint and the default title. Default `"first-use"`. */
  kind?: EmptyStateKind;
  /** `sm` inside a table/card, `md` a page section, `lg` a full page. Default `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Replace the kind's icon, or `false` for none. */
  icon?: React.ReactNode | false;
  /** A larger picture in place of the icon well (SVG, image). */
  illustration?: React.ReactNode;
  /** Default copy comes from the dictionary (`empty.firstUse`, `empty.noResults`…). */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** One primary next step, optionally a secondary one. */
  actions?: React.ReactNode;
  /** Dashed frame — a drop zone or an empty column. */
  framed?: boolean;
  /** Title element. Default `"h3"`. */
  as?: "h2" | "h3" | "h4" | "p";
}

/**
 * Points to a next step when a list is empty, a search finds nothing, access is denied or
 * something failed. Server-compatible. A `no-results` state is announced (`role="status"`).
 *
 * ```tsx
 * <EmptyState
 *   title="No posts yet"
 *   description="Write your first post, or import from WordPress."
 *   actions={<Button variant="primary">Write a post</Button>}
 * />
 * <EmptyState kind="no-results" size="sm" actions={<Button size="sm" onClick={clear}>Clear filters</Button>} />
 * ```
 */
export const EmptyState = /*#__PURE__*/ React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { kind = "first-use", size = "md", icon, illustration, title, description, actions, framed, as = "h3", className, children, role, ...props },
  ref,
) {
  const k = KIND[kind];
  const Icon = k.icon;
  return (
    <div
      ref={ref}
      data-slot="empty-state"
      data-kind={kind}
      data-size={size}
      role={role ?? (kind === "no-results" ? "status" : undefined)}
      className={cn(emptyStateVariants({ size, framed }), className)}
      {...props}
    >
      {illustration ? (
        <div data-slot="empty-state-illustration" className={cn("mb-1 flex justify-center text-fg-subtle", size === "lg" ? "max-w-72" : "max-w-48")}>
          {illustration}
        </div>
      ) : icon === false ? null : (
        <EmptyStateIcon className={cn(k.well, size === "sm" ? "mb-1" : "mb-2")}>{icon ?? <Icon aria-hidden />}</EmptyStateIcon>
      )}
      <EmptyStateTitle as={as} size={size}>
        {title ?? <LocalizedText namespace="empty" id={k.label} defaults={emptyLabels} />}
      </EmptyStateTitle>
      {description ? <EmptyStateDescription size={size}>{description}</EmptyStateDescription> : null}
      {children}
      {actions ? <EmptyStateActions className={size === "sm" ? "mt-1" : "mt-2"}>{actions}</EmptyStateActions> : null}
    </div>
  );
});

/** The icon well (sits on two faint contour rings). */
export function EmptyStateIcon({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      data-slot="empty-state-icon"
      className={cn(
        "vui-empty-well flex size-(--empty-well,3rem) items-center justify-center rounded-ui [&_svg]:size-(--empty-icon,1.375rem) [&_svg]:stroke-[1.75]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyStateTitle({
  as: Tag = "h3",
  size = "md",
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" | "p"; size?: "sm" | "md" | "lg" }) {
  return (
    <Tag
      data-slot="empty-state-title"
      className={cn(
        "max-w-[36ch] text-balance text-fg",
        size === "sm" && "text-sm font-semibold",
        size === "md" && "text-base font-semibold tracking-[-0.01em]",
        size === "lg" && "font-display text-[1.75rem] leading-tight",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyStateDescription({ size = "md", className, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { size?: "sm" | "md" | "lg" }) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn("max-w-[44ch] text-pretty text-fg-muted", size === "sm" ? "-mt-1 text-[13px]" : size === "lg" ? "-mt-1 text-[15px] leading-relaxed" : "-mt-1 text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

export function EmptyStateActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="empty-state-actions" className={cn("flex flex-wrap items-center justify-center gap-2", className)} {...props} />;
}
