import * as React from "react";
import { cva } from "class-variance-authority";
import { ArrowLeft } from "lucide-react";
import { cn } from "../lib/cn";
import { SmartLink } from "../lib/provider";
import type { MenuEntry } from "../lib/variants";
import { Skeleton } from "./skeleton";
import { ActionMenu } from "./dropdown-menu";
import { AppShellBreadcrumb } from "./app-shell";

// Server-safe nav helpers (this module has no "use client"), so server layouts can call them.
export {
  filterNav,
  resolveActive,
  flattenNav,
  matchPath,
  navItems,
  findNavItem,
  navTrailItems,
  normaliseBadge,
  isNavGroup,
  isNavItem,
  isNavSeparator,
  SIDEBAR_COOKIE,
  parseSidebarCookie,
} from "../lib/nav";

export const pageHeaderTitleVariants = cva("font-display min-w-0 text-fg [text-wrap:balance]", {
  variants: {
    size: {
      /** Record pages. */
      sm: "text-[length:calc(22px*var(--display-scale))] leading-[1.15]",
      /** Lists and settings. */
      md: "text-[length:calc(30px*var(--display-scale))] leading-[1.1]",
      /** Dashboards. */
      lg: "text-[length:calc(40px*var(--display-scale))] leading-[1.05]",
    },
  },
  defaultVariants: { size: "md" },
});

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** The page's one `<h1>`. `<em>` inside follows the font preset (italic in serif headings). */
  title: React.ReactNode;
  /** Small line above the title ("Monday, November 10", "Content"). */
  eyebrow?: React.ReactNode;
  /** A Breadcrumb, or `"auto"` to build it from the App shell's active nav trail. */
  breadcrumb?: React.ReactNode | "auto";
  /** "← Contacts" link above the title. */
  back?: { href: string; label: string };
  description?: React.ReactNode;
  /** Status badges, "Updated 2h ago" — next to the title. */
  meta?: React.ReactNode;
  /** Buttons at the end; they wrap under the title on narrow screens. */
  actions?: React.ReactNode;
  /** Secondary actions in a "⋯" menu after `actions`. */
  menu?: MenuEntry[];
  /** Sub-navigation (`TabsLinkList` / `TabsList`) attached to the bottom edge. */
  tabs?: React.ReactNode;
  /** `lg` 40px (dashboards), `md` 30px (lists, default), `sm` 22px (records) — scaled by the font preset. */
  size?: "sm" | "md" | "lg";
  /** Sticks under the top bar on the bar surface. */
  sticky?: boolean;
  align?: "start" | "center";
  /** Title still loading: a skeleton line in the `<h1>`. */
  loading?: boolean;
}

/**
 * The title block of a page: breadcrumb or eyebrow, title in the display font, description, meta,
 * actions and sub-tabs. Server-compatible; `breadcrumb="auto"` is a small client island that reads
 * the App shell's active trail.
 *
 * ```tsx
 * <PageHeader
 *   eyebrow="Content"
 *   title="Posts"
 *   description="128 posts · 6 scheduled"
 *   actions={<Button variant="primary">New post</Button>}
 * />
 * ```
 */
export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, eyebrow, breadcrumb, back, description, meta, actions, menu, tabs, size = "md", sticky, align = "start", loading, className, children, ...props },
  ref,
) {
  const centered = align === "center";
  return (
    <header
      ref={ref}
      data-slot="page-header"
      data-size={size}
      className={cn(
        "grid gap-3",
        tabs ? "mb-6" : size === "lg" ? "mb-8" : "mb-6",
        sticky && "surface-bar sticky top-(--topbar-h) z-(--z-sticky) -mx-[var(--page-px,1.5rem)] px-[var(--page-px,1.5rem)] pt-3",
        sticky && !tabs && "pb-3",
        centered && "justify-items-center text-center",
        className,
      )}
      {...props}
    >
      {breadcrumb === "auto" ? <AppShellBreadcrumb /> : breadcrumb ? breadcrumb : null}
      {back ? (
        <SmartLink href={back.href} className="-ms-0.5 inline-flex w-fit items-center gap-1.5 rounded-ui-sm text-[13px] text-fg-muted transition-colors hover:text-fg focus-ring">
          <ArrowLeft aria-hidden className="size-3.5 rtl:-scale-x-100" />
          {back.label}
        </SmartLink>
      ) : null}
      <div className={cn("flex flex-wrap items-end gap-x-6 gap-y-4", centered ? "justify-center" : "justify-between")}>
        <div className={cn("min-w-0", centered ? "max-w-2xl" : "max-w-3xl flex-[1_1_22rem]")}>
          {eyebrow ? <PageHeaderEyebrow className="mb-1.5">{eyebrow}</PageHeaderEyebrow> : null}
          <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", centered && "justify-center")}>
            <PageHeaderTitle size={size} aria-busy={loading || undefined}>
              {loading ? <Skeleton className="inline-block h-[0.8em] w-[min(18rem,60vw)] rounded-ui-sm align-middle" /> : title}
            </PageHeaderTitle>
            {meta ? <div className="flex flex-wrap items-center gap-2 text-[13px] text-fg-subtle">{meta}</div> : null}
          </div>
          {description ? <PageHeaderDescription className={cn(size === "lg" ? "mt-2.5" : "mt-1.5", centered && "mx-auto")}>{description}</PageHeaderDescription> : null}
        </div>
        {actions || menu?.length ? (
          <PageHeaderActions>
            {actions}
            {menu?.length ? <ActionMenu items={menu} triggerSize="md" /> : null}
          </PageHeaderActions>
        ) : null}
      </div>
      {children}
      {tabs ? <PageHeaderTabs>{tabs}</PageHeaderTabs> : null}
    </header>
  );
});

/** The `<h1>`. */
export const PageHeaderTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { size?: "sm" | "md" | "lg" }>(function PageHeaderTitle(
  { size, className, ...props },
  ref,
) {
  return <h1 ref={ref} data-slot="page-header-title" className={cn(pageHeaderTitleVariants({ size }), className)} {...props} />;
});

/** The small line above the title. Not uppercased with CSS: `text-transform` breaks Turkish i/İ without the right `lang`. */
export function PageHeaderEyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="page-header-eyebrow" className={cn("text-[12px] font-medium tracking-[0.08em] text-fg-subtle", className)} {...props} />;
}

export function PageHeaderDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="page-header-description" className={cn("max-w-[62ch] text-[14.5px] leading-relaxed text-fg-muted", className)} {...props} />;
}

export function PageHeaderActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="page-header-actions" className={cn("flex flex-wrap items-center gap-2", className)} {...props} />;
}

/** Tabs row; pulls itself onto the header's bottom hairline. */
export function PageHeaderTabs({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="page-header-tabs" className={cn("-mb-px mt-1 border-b border-line", className)} {...props} />;
}
