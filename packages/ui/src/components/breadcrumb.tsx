"use client";

import * as React from "react";
import * as DropdownMenu from "radix-ui/dropdown-menu";
import * as Slot from "radix-ui/slot";
import { ChevronRight, ChevronsUpDown, MoreHorizontal } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { SmartLink } from "../lib/provider";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { itemVariants } from "../lib/variants";

const breadcrumbLabels = {
  label: "Breadcrumb",
  showHidden: "Show hidden pages",
  siblings: "Pages next to {label}",
};

type BreadcrumbSize = "sm" | "md";
const SizeContext = /*#__PURE__*/ React.createContext<BreadcrumbSize>("md");

export interface BreadcrumbMenuLink {
  label: React.ReactNode;
  href: string;
  /** Marks the sibling that is the current item. */
  current?: boolean;
}

export interface BreadcrumbItemData {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  /** Jump to siblings ("Companies › Northpoint ▾" → other companies). */
  menu?: BreadcrumbMenuLink[];
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Data-driven trail. The last item is the current page. Omit for the compound API. */
  items?: BreadcrumbItemData[];
  /** Collapse the middle into a "…" menu when there are more items (first + last `maxItems − 2` stay). */
  maxItems?: number;
  /** Separator between items. Default a chevron that flips in RTL. */
  separator?: React.ReactNode;
  size?: BreadcrumbSize;
  /** Websites: also output a schema.org `BreadcrumbList` JSON-LD script (items with `href`). */
  jsonLd?: boolean;
  /** Origin used to make JSON-LD URLs absolute, e.g. `"https://vamos.ist"`. */
  baseUrl?: string;
  labels?: Partial<typeof breadcrumbLabels>;
}

/**
 * Shows where a page sits in a hierarchy and offers a way up (WAI-ARIA Breadcrumb: `nav` + `ol`,
 * `aria-current="page"` on the last item). Links go through the app's router `Link`.
 *
 * ```tsx
 * <Breadcrumb items={[{ label: "Companies", href: "/companies" }, { label: "Northpoint", href: "/companies/northpoint" }, { label: "Contacts" }]} />
 * ```
 *
 * Compound: `<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href/></BreadcrumbItem><BreadcrumbSeparator/>…<BreadcrumbPage/></BreadcrumbList></Breadcrumb>`.
 */
export const Breadcrumb = /*#__PURE__*/ React.forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, maxItems, separator, size = "md", jsonLd, baseUrl, labels, className, children, ...props },
  ref,
) {
  const t = useLabels("breadcrumb", breadcrumbLabels, labels);
  return (
    <SizeContext.Provider value={size}>
      <nav ref={ref} aria-label={t("label")} data-slot="breadcrumb" className={cn("min-w-0", className)} {...props}>
        {items ? <BreadcrumbTrail items={items} maxItems={maxItems} separator={separator} labels={labels} /> : children}
        {items && jsonLd ? <BreadcrumbJsonLd items={items} baseUrl={baseUrl} /> : null}
      </nav>
    </SizeContext.Provider>
  );
});

function BreadcrumbTrail({ items, maxItems, separator, labels }: Pick<BreadcrumbProps, "maxItems" | "separator" | "labels"> & { items: BreadcrumbItemData[] }) {
  const tail = maxItems ? Math.max(1, maxItems - 2) : items.length;
  const collapse = maxItems !== undefined && items.length > maxItems && items.length > tail + 1;
  const hidden = collapse ? items.slice(1, items.length - tail) : [];
  const visible: Array<{ item: BreadcrumbItemData; index: number } | "ellipsis"> = collapse
    ? [{ item: items[0]!, index: 0 }, "ellipsis", ...items.slice(items.length - tail).map((item, i) => ({ item, index: items.length - tail + i }))]
    : items.map((item, index) => ({ item, index }));

  return (
    <BreadcrumbList>
      {visible.map((entry, i) => {
        const sep = i > 0 ? <BreadcrumbSeparator key={`s${i}`}>{separator}</BreadcrumbSeparator> : null;
        if (entry === "ellipsis") {
          return (
            <React.Fragment key="ellipsis">
              {sep}
              <BreadcrumbItem>
                <BreadcrumbEllipsis items={hidden.map((h) => ({ label: h.label, href: h.href ?? "" })).filter((h) => h.href)} labels={labels} />
              </BreadcrumbItem>
            </React.Fragment>
          );
        }
        const { item, index } = entry;
        const last = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {sep}
            <BreadcrumbItem>
              {last || !item.href ? (
                <BreadcrumbPage icon={item.icon} aria-current={last ? "page" : undefined}>
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href} icon={item.icon}>
                  {item.label}
                </BreadcrumbLink>
              )}
              {item.menu?.length ? <BreadcrumbSiblings label={item.label} items={item.menu} labels={labels} /> : null}
            </BreadcrumbItem>
          </React.Fragment>
        );
      })}
    </BreadcrumbList>
  );
}

const listVariants = /*#__PURE__*/ cva("flex min-w-0 flex-wrap items-center text-fg-muted", {
  variants: { size: { sm: "gap-1 text-[13px] [&_svg]:size-3.5", md: "gap-1.5 text-sm [&_svg]:size-4" } },
  defaultVariants: { size: "md" },
});

/** The ordered list of crumbs. */
export const BreadcrumbList = /*#__PURE__*/ React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(function BreadcrumbList({ className, ...props }, ref) {
  const size = React.useContext(SizeContext);
  return <ol ref={ref} data-slot="breadcrumb-list" className={cn(listVariants({ size }), className)} {...props} />;
});

/** One crumb (`li`). */
export const BreadcrumbItem = /*#__PURE__*/ React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(function BreadcrumbItem({ className, ...props }, ref) {
  return <li ref={ref} data-slot="breadcrumb-item" className={cn("inline-flex min-w-0 items-center gap-0.5", className)} {...props} />;
});

const crumbClass = "inline-flex min-w-0 max-w-[16rem] items-center gap-1.5 rounded-ui-sm [&_svg]:shrink-0";

export interface BreadcrumbLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string;
  icon?: React.ReactNode;
  /** Render your own link element instead (keeps the styles). */
  asChild?: boolean;
}

/** A crumb that links up the hierarchy. Uses the app's router `Link` (external URLs open in a new tab). */
export const BreadcrumbLink = /*#__PURE__*/ React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(function BreadcrumbLink(
  { href, icon, asChild, className, children, title, ...props },
  ref,
) {
  const classes = cn(crumbClass, "transition-colors hover:text-fg focus-ring", className);
  if (asChild) return <Slot.Root ref={ref} data-slot="breadcrumb-link" className={classes} {...props}>{children}</Slot.Root>;
  return (
    <SmartLink ref={ref} href={href ?? "#"} data-slot="breadcrumb-link" className={classes} title={title ?? (typeof children === "string" ? children : undefined)} {...props}>
      {icon ? <span aria-hidden className="inline-flex">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </SmartLink>
  );
});

export interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon?: React.ReactNode;
}

/** The current page: plain text, `aria-current="page"` (override for a non-link middle crumb). */
export const BreadcrumbPage = /*#__PURE__*/ React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(function BreadcrumbPage({ icon, className, children, title, ...props }, ref) {
  const current = !("aria-current" in props) || props["aria-current"] !== undefined;
  return (
    <span
      ref={ref}
      data-slot="breadcrumb-page"
      aria-current="page"
      title={title ?? (typeof children === "string" ? children : undefined)}
      className={cn(crumbClass, current ? "font-medium text-fg" : "text-fg-muted", className)}
      {...props}
    >
      {icon ? <span aria-hidden className="inline-flex">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </span>
  );
});

/** The separator between crumbs. Hidden from assistive tech. */
export function BreadcrumbSeparator({ className, children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li role="presentation" aria-hidden data-slot="breadcrumb-separator" className={cn("inline-flex text-fg-subtle [&>svg]:rtl:-scale-x-100", className)} {...props}>
      {children ?? <ChevronRight strokeWidth={1.75} />}
    </li>
  );
}

const menuContentClass = "surface-popover ui-pop z-(--z-popover) min-w-48 max-w-72 rounded-ui p-1";

function CrumbMenu({ trigger, items }: { trigger: React.ReactNode; items: BreadcrumbMenuLink[] }) {
  const container = usePortalContainer();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal container={container}>
        <Layer asChild>
          <DropdownMenu.Content align="start" sideOffset={6} className={menuContentClass}>
            {items.map((it, i) => (
              <DropdownMenu.Item key={i} asChild className={cn(itemVariants({ size: "sm" }), it.current && "font-medium")}>
                <SmartLink href={it.href} aria-current={it.current ? "page" : undefined}>
                  <span className="min-w-0 flex-1 truncate">{it.label}</span>
                </SmartLink>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </Layer>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

const iconTrigger =
  "inline-flex size-6 items-center justify-center rounded-ui-sm text-fg-subtle transition-colors hover:bg-hover hover:text-fg focus-ring data-[state=open]:bg-hover data-[state=open]:text-fg";

export interface BreadcrumbEllipsisProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The hidden crumbs, offered in a menu. Without items it renders a static "…". */
  items?: BreadcrumbMenuLink[];
  labels?: Partial<typeof breadcrumbLabels>;
}

/** "…" for collapsed crumbs; opens a menu with the hidden pages. */
export const BreadcrumbEllipsis = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, BreadcrumbEllipsisProps>(function BreadcrumbEllipsis(
  { items, labels, className, ...props },
  ref,
) {
  const t = useLabels("breadcrumb", breadcrumbLabels, labels);
  if (!items?.length) {
    return (
      <span data-slot="breadcrumb-ellipsis" className="inline-flex size-6 items-center justify-center text-fg-subtle">
        <MoreHorizontal aria-hidden />
        <span className="sr-only">{t("showHidden")}</span>
      </span>
    );
  }
  return (
    <CrumbMenu
      items={items}
      trigger={
        <button ref={ref} type="button" data-slot="breadcrumb-ellipsis" aria-label={t("showHidden")} className={cn(iconTrigger, className)} {...props}>
          <MoreHorizontal aria-hidden />
        </button>
      }
    />
  );
});

/** A small ▾ after a crumb that jumps to its siblings. */
export function BreadcrumbSiblings({ label, items, labels }: { label: React.ReactNode; items: BreadcrumbMenuLink[]; labels?: Partial<typeof breadcrumbLabels> }) {
  const t = useLabels("breadcrumb", breadcrumbLabels, labels);
  const name = t("siblings", { label: typeof label === "string" ? label : "" }).trim();
  return (
    <CrumbMenu
      items={items}
      trigger={
        <button type="button" data-slot="breadcrumb-siblings" aria-label={name} className={cn(iconTrigger, "size-5 [&_svg]:size-3!")}>
          <ChevronsUpDown aria-hidden />
        </button>
      }
    />
  );
}

function BreadcrumbJsonLd({ items, baseUrl = "" }: { items: BreadcrumbItemData[]; baseUrl?: string }) {
  const list = items
    .filter((i) => i.href && typeof i.label === "string")
    .map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.label as string, item: /^https?:/.test(i.href!) ? i.href : `${baseUrl.replace(/\/$/, "")}${i.href}` }));
  const json = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: list }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
