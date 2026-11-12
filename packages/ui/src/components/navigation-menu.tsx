"use client";

import * as React from "react";
import * as Dialog from "radix-ui/dialog";
import * as RadixNav from "radix-ui/navigation-menu";
import { ChevronDown, Menu, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { SmartLink, useNavigation } from "../lib/provider";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const navLabels = {
  label: "Main",
  open: "Open menu",
  close: "Close menu",
  title: "Menu",
};
type NavLabels = Partial<typeof navLabels>;

/**
 * A site navigation entry. One source for the desktop `NavigationMenu` and the mobile `MobileNav`.
 * `children` makes it a dropdown; `featured` adds a highlighted card to the panel.
 */
export interface SiteNavItem {
  id?: string;
  label: string;
  href?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: SiteNavItem[];
  /** Panel layout for an item with children. Default `"list"`. */
  layout?: NavigationMenuLayout;
  /** `layout="featured"`: the highlighted card on the start side of the panel. */
  featured?: { title: string; description?: string; href: string; eyebrow?: string };
}

type NavigationMenuLayout = "list" | "grid-2" | "featured";

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

const rootVariants = /*#__PURE__*/ cva("relative z-(--z-nav) flex max-w-max flex-1 items-center justify-center", {
  variants: {
    variant: {
      /** Sits in a site header. */
      bar: "",
      /** A floating glass pill — the site's one permanent blur. */
      floating: "surface rounded-full p-1",
    },
  },
  defaultVariants: { variant: "bar" },
});

export interface NavigationMenuProps extends React.ComponentPropsWithoutRef<typeof RadixNav.Root> {
  /** `bar` (in a header, default) or `floating` (glass pill). */
  variant?: "bar" | "floating";
  /** Render the shared animated panel (`NavigationMenuViewport`). Default `true`; `false` drops each panel under its trigger. */
  viewport?: boolean;
  /** Data-driven menu. Or compose `NavigationMenuList` children yourself. */
  items?: SiteNavItem[];
  labels?: NavLabels;
}

/**
 * A website's top navigation, including mega menus (Radix NavigationMenu: disclosure-based site
 * navigation with hover intent, arrow keys and Escape). Admin panels use Sidebar instead.
 *
 * ```tsx
 * <NavigationMenu items={nav} />                 // data-driven
 * <NavigationMenu>
 *   <NavigationMenuList>
 *     <NavigationMenuItem>
 *       <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *       <NavigationMenuContent layout="grid-2">
 *         <NavigationMenuLink href="/vtag" title="vTag" description="NFC business cards" />
 *       </NavigationMenuContent>
 *     </NavigationMenuItem>
 *     <NavigationMenuItem><NavigationMenuLink href="/pricing" variant="top">Pricing</NavigationMenuLink></NavigationMenuItem>
 *   </NavigationMenuList>
 * </NavigationMenu>
 * ```
 */
export const NavigationMenu = /*#__PURE__*/ React.forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu(
  { variant = "bar", viewport = true, items, labels, className, children, "aria-label": ariaLabel, ...props },
  ref,
) {
  const t = useLabels("navigationMenu", navLabels, labels);
  return (
    <RadixNav.Root
      ref={ref}
      data-slot="navigation-menu"
      data-variant={variant}
      data-viewport={viewport || undefined}
      aria-label={ariaLabel ?? t("label")}
      className={cn(rootVariants({ variant }), className)}
      {...props}
    >
      {items ? <NavigationMenuItems items={items} viewport={viewport} /> : children}
      {viewport ? <NavigationMenuViewport /> : null}
    </RadixNav.Root>
  );
});

function NavigationMenuItems({ items, viewport }: { items: SiteNavItem[]; viewport: boolean }) {
  return (
    <NavigationMenuList>
      {items.map((item, i) => (
        <NavigationMenuItem key={item.id ?? i}>
          {item.children?.length ? (
            <>
              <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent layout={item.layout} inline={!viewport}>
                {item.layout === "featured" && item.featured ? <NavigationMenuFeatured {...item.featured} /> : null}
                <NavigationMenuGroup>
                  {item.children.map((child, j) => (
                    <li key={child.id ?? j}>
                      <NavigationMenuLink href={child.href ?? "#"} title={child.label} description={child.description} icon={child.icon} />
                    </li>
                  ))}
                </NavigationMenuGroup>
              </NavigationMenuContent>
            </>
          ) : (
            <NavigationMenuLink href={item.href ?? "#"} variant="top">
              {item.label}
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  );
}

/** The row of top-level items. */
export const NavigationMenuList = /*#__PURE__*/ React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<typeof RadixNav.List>>(function NavigationMenuList({ className, ...props }, ref) {
  return <RadixNav.List ref={ref} data-slot="navigation-menu-list" className={cn("flex flex-1 list-none items-center justify-center gap-0.5", className)} {...props} />;
});

/** One top-level item (a trigger + content, or a plain link). */
export const NavigationMenuItem = /*#__PURE__*/ React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<typeof RadixNav.Item>>(function NavigationMenuItem({ className, ...props }, ref) {
  return <RadixNav.Item ref={ref} data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />;
});

const topItemClass = cn(
  "group/nav inline-flex h-9 select-none items-center justify-center gap-1 rounded-full px-3.5 text-sm font-medium text-fg-muted outline-none",
  "transition-colors duration-150 hover:bg-hover hover:text-fg focus-ring",
  "data-[state=open]:bg-hover data-[state=open]:text-fg data-active:text-fg aria-[current=page]:text-fg",
);

/** Opens a panel. Hover (with intent delay), click, Enter/Space or ↓. */
export const NavigationMenuTrigger = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof RadixNav.Trigger>>(function NavigationMenuTrigger(
  { className, children, ...props },
  ref,
) {
  return (
    <RadixNav.Trigger ref={ref} data-slot="navigation-menu-trigger" className={cn(topItemClass, className)} {...props}>
      {children}
      <ChevronDown aria-hidden className="relative top-px size-3.5 text-fg-subtle transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]/nav:rotate-180" />
    </RadixNav.Trigger>
  );
});

const contentLayouts = {
  list: "w-[min(22rem,calc(100vw-2rem))]",
  "grid-2": "w-[min(36rem,calc(100vw-2rem))] [&_[data-slot=navigation-menu-group]]:grid-cols-2",
  featured: "grid w-[min(42rem,calc(100vw-2rem))] grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-2",
} as const;

export interface NavigationMenuContentProps extends React.ComponentPropsWithoutRef<typeof RadixNav.Content> {
  /** `list` (one column) · `grid-2` (two columns) · `featured` (highlight card + list). */
  layout?: NavigationMenuLayout;
  /** Without the shared viewport: render the panel as its own popover under the trigger. */
  inline?: boolean;
}

/** The panel of an item. */
export const NavigationMenuContent = /*#__PURE__*/ React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(function NavigationMenuContent(
  { layout = "list", inline, className, ...props },
  ref,
) {
  return (
    <RadixNav.Content
      ref={ref}
      data-slot="navigation-menu-content"
      data-layout={layout}
      className={cn(
        "ui-nav-content p-2",
        inline ? "surface-popover ui-pop absolute start-0 top-full z-(--z-popover) mt-2 rounded-ui-lg" : "start-0 top-0 md:absolute",
        contentLayouts[layout],
        className,
      )}
      {...props}
    />
  );
});

/** The shared, animated container all panels render into. Rendered by `NavigationMenu` unless `viewport={false}`. */
export const NavigationMenuViewport = /*#__PURE__*/ React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof RadixNav.Viewport>>(function NavigationMenuViewport(
  { className, ...props },
  ref,
) {
  return (
    <div className="absolute start-0 top-full z-(--z-popover) flex w-full justify-center pt-2">
      <Layer asChild>
        <RadixNav.Viewport
          ref={ref}
          data-slot="navigation-menu-viewport"
          className={cn(
            "ui-pop ui-nav-viewport surface-popover relative shrink-0 origin-top overflow-hidden rounded-ui-lg",
            "h-(--radix-navigation-menu-viewport-height) w-full md:w-(--radix-navigation-menu-viewport-width)",
            className,
          )}
          {...props}
        />
      </Layer>
    </div>
  );
});

/** A list of links inside a panel (`ul`). */
export const NavigationMenuGroup = /*#__PURE__*/ React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement> & { heading?: React.ReactNode }>(function NavigationMenuGroup(
  { heading, className, children, ...props },
  ref,
) {
  return (
    <div className="min-w-0">
      {heading ? <p className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-[0.06em] text-fg-subtle">{heading}</p> : null}
      <ul ref={ref} data-slot="navigation-menu-group" className={cn("grid list-none gap-0.5", className)} {...props}>
        {children}
      </ul>
    </div>
  );
});

export interface NavigationMenuLinkProps extends Omit<React.ComponentPropsWithoutRef<typeof RadixNav.Link>, "title" | "href"> {
  href: string;
  /** `panel` (rich link in a panel, default) or `top` (a top-level link in the bar). */
  variant?: "panel" | "top";
  /** Panel links: the bold line. Falls back to `children`. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Current page. Default: derived from `currentPath` (VamosProvider). */
  active?: boolean;
}

/** A link — in the bar (`variant="top"`) or in a panel with icon and description. Uses the app's router `Link`. */
export const NavigationMenuLink = /*#__PURE__*/ React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(function NavigationMenuLink(
  { href, variant = "panel", title, description, icon, active, className, children, ...props },
  ref,
) {
  const { isActive } = useNavigation();
  const current = active ?? isActive(href);
  if (variant === "top") {
    return (
      <RadixNav.Link asChild active={current} {...props}>
        <SmartLink ref={ref} href={href} aria-current={current ? "page" : undefined} data-slot="navigation-menu-link" className={cn(topItemClass, className)}>
          {children ?? title}
        </SmartLink>
      </RadixNav.Link>
    );
  }
  return (
    <RadixNav.Link asChild active={current} {...props}>
      <SmartLink
        ref={ref}
        href={href}
        aria-current={current ? "page" : undefined}
        data-slot="navigation-menu-link"
        className={cn(
          "group/link flex select-none gap-3 rounded-ui p-3 outline-none transition-colors duration-100 hover:bg-hover focus-visible:bg-hover focus-ring",
          "aria-[current=page]:bg-selected",
          className,
        )}
      >
        {icon ? (
          <span aria-hidden className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-ui-sm border border-line bg-surface-2 text-fg-muted transition-colors group-hover/link:text-fg [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium text-fg">{title ?? children}</span>
          {description ? <span className="line-clamp-2 text-[13px] leading-snug text-fg-muted">{description}</span> : null}
        </span>
      </SmartLink>
    </RadixNav.Link>
  );
});

/** The highlighted card of a `featured` panel. */
export function NavigationMenuFeatured({ title, description, href, eyebrow, className }: { title: string; description?: string; href: string; eyebrow?: string; className?: string }) {
  return (
    <RadixNav.Link asChild>
      <SmartLink
        href={href}
        data-slot="navigation-menu-featured"
        className={cn(
          "group/feat relative flex min-h-full flex-col justify-end overflow-hidden rounded-ui bg-fg p-5 text-scene outline-none focus-ring",
          className,
        )}
      >
        <span aria-hidden className="absolute -end-10 -top-10 size-40 rounded-full border-[18px] border-accent opacity-90 transition-transform duration-300 group-hover/feat:scale-105 motion-reduce:transition-none" />
        {eyebrow ? <span className="relative mb-auto text-[11px] font-medium tracking-[0.08em] opacity-70">{eyebrow}</span> : null}
        <span className="relative mt-10 font-display text-[1.375rem] leading-tight">{title}</span>
        {description ? <span className="relative mt-1.5 text-[13px] leading-snug opacity-75">{description}</span> : null}
      </SmartLink>
    </RadixNav.Link>
  );
}

/** Optional arrow under the open trigger. */
export const NavigationMenuIndicator = /*#__PURE__*/ React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof RadixNav.Indicator>>(function NavigationMenuIndicator(
  { className, ...props },
  ref,
) {
  return (
    <RadixNav.Indicator ref={ref} data-slot="navigation-menu-indicator" className={cn("top-full z-[1] flex h-2 items-end justify-center overflow-hidden ui-fade", className)} {...props}>
      <span className="relative top-[60%] size-2.5 rotate-45 rounded-tl-sm border-s border-t border-popover-border bg-popover" />
    </RadixNav.Indicator>
  );
});

/* ------------------------------------------------------------------ */
/* Mobile                                                              */
/* ------------------------------------------------------------------ */

export interface MobileNavProps {
  items: SiteNavItem[];
  /** Extra content at the bottom of the sheet (CTA buttons, language switch). */
  footer?: React.ReactNode;
  /** Brand or title shown in the sheet header. Default "Menu". */
  title?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Class names for the trigger button. Hide it on desktop, e.g. `"md:hidden"`. */
  className?: string;
  labels?: NavLabels;
}

/**
 * The mobile counterpart of `NavigationMenu`: a menu button that opens a side sheet with the same
 * items, groups as an accordion. Following a link closes the sheet.
 *
 * ```tsx
 * <NavigationMenu items={nav} className="max-md:hidden" />
 * <MobileNav items={nav} className="md:hidden" footer={<Button variant="primary" block>Book a demo</Button>} />
 * ```
 */
export function MobileNav({ items, footer, title, open, defaultOpen, onOpenChange, className, labels }: MobileNavProps) {
  const t = useLabels("navigationMenu", navLabels, labels);
  const container = usePortalContainer();
  const [isOpen, setOpen] = React.useState(defaultOpen ?? false);
  const controlled = open !== undefined;
  const value = controlled ? open : isOpen;
  const set = (v: boolean) => {
    if (!controlled) setOpen(v);
    onOpenChange?.(v);
  };
  const { isActive } = useNavigation();
  const leaf = (item: SiteNavItem, nested = false) => (
    <SmartLink
      href={item.href ?? "#"}
      aria-current={item.href && isActive(item.href) ? "page" : undefined}
      onClick={() => set(false)}
      className={cn(
        "flex flex-col gap-0.5 rounded-ui-sm py-2.5 outline-none focus-ring aria-[current=page]:text-fg",
        nested ? "px-3 text-sm text-fg-muted hover:bg-hover hover:text-fg" : "text-[15px] font-medium text-fg",
      )}
    >
      <span>{item.label}</span>
      {nested && item.description ? <span className="text-[13px] text-fg-subtle">{item.description}</span> : null}
    </SmartLink>
  );

  return (
    <Dialog.Root open={value} onOpenChange={set}>
      <Dialog.Trigger
        aria-label={t("open")}
        className={cn("inline-flex size-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-hover focus-ring [&_svg]:size-5", className)}
      >
        <Menu aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal container={container}>
        <Dialog.Overlay className="ui-fade fixed inset-0 z-(--z-overlay) bg-overlay backdrop-blur-(--overlay-blur)" />
        <Layer asChild>
          <Dialog.Content
            data-slot="mobile-nav"
            aria-describedby={undefined}
            className="ui-sheet-end surface-popover fixed inset-y-0 end-0 z-(--z-overlay) flex w-[min(24rem,calc(100vw-3rem))] flex-col rounded-none border-y-0 border-e-0 outline-none"
          >
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line ps-5 pe-3">
              <Dialog.Title className="text-sm font-semibold text-fg">{title ?? t("title")}</Dialog.Title>
              <Dialog.Close aria-label={t("close")} className="inline-flex size-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring [&_svg]:size-[18px]">
                <X aria-hidden />
              </Dialog.Close>
            </div>
            <nav aria-label={t("label")} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2">
              <Accordion type="multiple" headingLevel={2}>
                {items.map((item, i) =>
                  item.children?.length ? (
                    <AccordionItem key={item.id ?? i} value={item.id ?? String(i)}>
                      <AccordionTrigger className="text-[15px]">{item.label}</AccordionTrigger>
                      <AccordionContent className="-mx-3 flex flex-col gap-0.5">
                        {item.children.map((child, j) => (
                          <React.Fragment key={child.id ?? j}>{leaf(child, true)}</React.Fragment>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <div key={item.id ?? i} className="border-b border-line py-1 last:border-b-0">
                      {leaf(item)}
                    </div>
                  ),
                )}
              </Accordion>
            </nav>
            {footer ? <div className="shrink-0 border-t border-line p-5">{footer}</div> : null}
          </Dialog.Content>
        </Layer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
