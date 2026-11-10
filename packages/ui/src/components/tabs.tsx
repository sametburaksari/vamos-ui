"use client";

import * as React from "react";
import { Tabs as RadixTabs } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/use-controllable-state";
import { useComposedRefs } from "../lib/compose-refs";
import { useEdgeFade } from "../lib/use-edge-fade";
import { useLink, useNavigation } from "../lib/provider";
import { Badge, type BadgeProps } from "./badge";

/* ------------------------------------------------------------------ */
/* Variants (shared by Radix tabs and link tabs)                       */
/* ------------------------------------------------------------------ */

export const tabsListVariants = cva("relative flex min-w-max", {
  variants: {
    variant: {
      /** Pages and records: hairline rule with an accent underline on the selected tab. */
      underline: "gap-5 border-b border-line data-[orientation=vertical]:min-w-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-0.5 data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-s",
      /** Status filters: quiet pills. */
      pill: "gap-1 data-[orientation=vertical]:min-w-0 data-[orientation=vertical]:flex-col",
      /** 2–4 option view switch (List / Grid). */
      segmented: "inline-flex w-max gap-0.5 rounded-ui border border-line bg-surface-2 p-0.5 data-[orientation=vertical]:flex-col",
    },
    fill: { true: "w-full min-w-0 [&>*]:flex-1" },
  },
  defaultVariants: { variant: "underline" },
});

export const tabsTriggerVariants = cva(
  [
    "group/tab relative inline-flex shrink-0 select-none items-center gap-2 whitespace-nowrap font-medium text-fg-muted outline-none",
    "transition-[color,background-color,box-shadow] duration-150 focus-ring",
    "hover:text-fg data-selected:text-fg",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        underline: [
          "justify-center rounded-ui-sm px-0.5 focus-visible:outline-offset-0",
          // indicator: a 2px accent rule that grows in from the centre
          "after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-accent-ink",
          "after:origin-center after:scale-x-0 after:transition-transform after:duration-200 motion-reduce:after:transition-none data-selected:after:scale-x-100",
          // vertical: indicator on the start edge
          "data-[orientation=vertical]:justify-start data-[orientation=vertical]:px-3 data-[orientation=vertical]:hover:bg-hover",
          "data-[orientation=vertical]:after:inset-x-auto data-[orientation=vertical]:after:inset-y-1.5 data-[orientation=vertical]:after:-start-px data-[orientation=vertical]:after:bottom-auto",
          "data-[orientation=vertical]:after:h-auto data-[orientation=vertical]:after:w-0.5 data-[orientation=vertical]:after:scale-x-100 data-[orientation=vertical]:after:scale-y-0 data-[orientation=vertical]:data-selected:after:scale-y-100",
        ],
        pill: "justify-center rounded-full px-3 hover:bg-hover data-selected:bg-selected data-[orientation=vertical]:justify-start data-[orientation=vertical]:rounded-ui-sm",
        segmented: "justify-center rounded-[calc(var(--radius)-3px)] px-3 data-selected:bg-surface data-selected:shadow-[0_1px_2px_rgb(0_0_0/0.1),0_0_0_1px_var(--line)] glass:data-selected:bg-field",
      },
      size: { sm: "text-[13px] [&_svg]:size-3.5", md: "text-sm [&_svg]:size-4" },
    },
    compoundVariants: [
      { variant: "underline", size: "sm", className: "h-9" },
      { variant: "underline", size: "md", className: "h-11" },
      { variant: "pill", size: "sm", className: "h-7" },
      { variant: "pill", size: "md", className: "h-8" },
      { variant: "segmented", size: "sm", className: "h-[calc(var(--control-h)-0.75rem)]" },
      { variant: "segmented", size: "md", className: "h-[calc(var(--control-h)-0.375rem)]" },
    ],
    defaultVariants: { variant: "underline", size: "md" },
  },
);

type TabsVariant = NonNullable<VariantProps<typeof tabsListVariants>["variant"]>;
type TabsSize = "sm" | "md";
type TabsOrientation = "horizontal" | "vertical";

const TabsContext = React.createContext<{ value: string; orientation: TabsOrientation }>({ value: "", orientation: "horizontal" });
const TabsListContext = React.createContext<{ variant: TabsVariant; size: TabsSize }>({ variant: "underline", size: "md" });

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export interface TabsProps extends Omit<React.ComponentPropsWithoutRef<typeof RadixTabs.Root>, "value" | "defaultValue" | "onValueChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/**
 * Switches between views of the same context (WAI-ARIA Tabs: arrows, Home/End).
 * Inactive panels unmount by default; pass `forceMount` on a `TabsContent` to keep it.
 *
 * ```tsx
 * <Tabs defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="deals" count={4}>Deals</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">…</TabsContent>
 * </Tabs>
 * ```
 *
 * `activationMode="manual"` for heavy panels (focus moves with arrows, Enter/Space selects).
 * For route-based tabs use `TabsLinkList` — that is navigation, not the Tabs pattern.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value: valueProp, defaultValue, onValueChange, orientation = "horizontal", className, ...props },
  ref,
) {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue: defaultValue ?? "", onChange: onValueChange, name: "Tabs" });
  const ctx = React.useMemo(() => ({ value, orientation }), [value, orientation]);
  return (
    <TabsContext.Provider value={ctx}>
      <RadixTabs.Root
        ref={ref}
        data-slot="tabs"
        value={value}
        onValueChange={setValue}
        orientation={orientation}
        className={cn("flex flex-col gap-4 data-[orientation=vertical]:flex-row data-[orientation=vertical]:gap-6", className)}
        {...props}
      />
    </TabsContext.Provider>
  );
});

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof RadixTabs.List> {
  /** `underline` (pages, records) · `pill` (status filters) · `segmented` (view switch). Default `underline`. */
  variant?: TabsVariant;
  size?: TabsSize;
  /** Equal-width tabs that fill the row. */
  fill?: boolean;
  /**
   * `"scroll"`: when tabs don't fit, the strip scrolls with edge fade masks and the selected tab
   * is kept in view. Default `"scroll"` for horizontal lists. `"none"` lets the list wrap/clip.
   */
  overflow?: "scroll" | "none";
}

/** The row (or column) of tab triggers. */
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { variant = "underline", size = "md", fill, overflow = "scroll", className, children, ...props },
  ref,
) {
  const { value, orientation } = React.useContext(TabsContext);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrolls = overflow === "scroll" && orientation === "horizontal" && !fill;
  useEdgeFade(scrollRef, "x", scrolls);

  // Keep the selected tab visible when it changes (or on mount).
  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scrolls || !scroller) return;
    const active = scroller.querySelector<HTMLElement>("[data-selected]");
    if (!active) return;
    const s = scroller.getBoundingClientRect();
    const a = active.getBoundingClientRect();
    if (a.left < s.left || a.right > s.right) {
      scroller.scrollTo?.({ left: scroller.scrollLeft + (a.left - s.left) - s.width / 2 + a.width / 2, behavior: "smooth" });
    }
  }, [value, scrolls]);

  const ctx = React.useMemo(() => ({ variant, size }), [variant, size]);
  const list = (
    <RadixTabs.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant, fill }), className)}
      {...props}
    >
      {children}
    </RadixTabs.List>
  );
  return (
    <TabsListContext.Provider value={ctx}>
      {scrolls ? (
        <div ref={scrollRef} data-slot="tabs-scroller" data-edge-fade="x" className="min-w-0 scrollbar-none overflow-x-auto overscroll-x-contain">
          {list}
        </div>
      ) : (
        list
      )}
    </TabsListContext.Provider>
  );
});

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger> {
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Trailing count (locale-formatted, 99+). Announced as part of the name: "Draft, 12". */
  count?: number;
  /** Badge tone for `count`. Default `neutral` (the selected tab uses `accent`). */
  badgeTone?: BadgeProps["tone"];
}

/** One tab. `value` must match a `TabsContent`. */
export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value, icon, count, badgeTone, className, children, ...props },
  ref,
) {
  const { variant, size } = React.useContext(TabsListContext);
  const selected = React.useContext(TabsContext).value === value;
  // Tabs used as a filter (no TabsContent) would point aria-controls at a panel that never
  // exists — an invalid ARIA reference. Drop it when the selected tab has no panel in the DOM.
  const innerRef = React.useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs<HTMLButtonElement>(ref, innerRef);
  const controlsId = React.useRef<string | null>(null);
  const [noPanel, setNoPanel] = React.useState(false);
  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    controlsId.current ??= el.getAttribute("aria-controls");
    if (!selected) return;
    const id = controlsId.current;
    setNoPanel(!!id && !el.ownerDocument.getElementById(id));
  }, [selected]);
  return (
    <RadixTabs.Trigger
      ref={composedRef}
      value={value}
      data-slot="tabs-trigger"
      data-selected={selected ? "" : undefined}
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
      {...(noPanel && props["aria-controls"] === undefined ? { "aria-controls": undefined } : {})}
    >
      <TabContent icon={icon} count={count} badgeTone={badgeTone ?? (selected && variant !== "underline" ? "accent" : undefined)}>
        {children}
      </TabContent>
    </RadixTabs.Trigger>
  );
});

function TabContent({ icon, count, badgeTone, children }: { icon?: React.ReactNode; count?: number; badgeTone?: BadgeProps["tone"]; children?: React.ReactNode }) {
  return (
    <>
      {icon ? (
        <span aria-hidden className="inline-flex text-fg-subtle transition-colors group-hover/tab:text-fg-muted group-data-selected/tab:text-current">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
      {count !== undefined ? (
        <>
          <span className="sr-only">, </span>
          <Badge count={count} tone={badgeTone ?? "neutral"} className="-me-0.5" />
        </>
      ) : null}
    </>
  );
}

export interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof RadixTabs.Content> {}

/** The panel for one tab. Unmounted while inactive unless `forceMount`. */
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent({ className, ...props }, ref) {
  return <RadixTabs.Content ref={ref} data-slot="tabs-content" className={cn("min-w-0 flex-1 rounded-ui outline-none focus-ring", className)} {...props} />;
});

/* ------------------------------------------------------------------ */
/* Link tabs (route-based)                                             */
/* ------------------------------------------------------------------ */

export interface TabsLinkListProps extends React.HTMLAttributes<HTMLElement> {
  /** Accessible name of the `nav`, e.g. "Contact sections". Required when the page has more than one nav. */
  "aria-label"?: string;
  variant?: TabsVariant;
  size?: TabsSize;
  fill?: boolean;
  orientation?: TabsOrientation;
  overflow?: "scroll" | "none";
}

/**
 * Route-based tabs: a `<nav>` of links with `aria-current="page"` on the active one. Links use the
 * app's router `Link` from `VamosProvider`, and the active tab is derived from `currentPath`
 * unless a `TabsLink` sets `active`.
 *
 * ```tsx
 * <TabsLinkList aria-label="Contact sections">
 *   <TabsLink href="/contacts/42" exact>Overview</TabsLink>
 *   <TabsLink href="/contacts/42/deals" count={4}>Deals</TabsLink>
 * </TabsLinkList>
 * ```
 */
export const TabsLinkList = React.forwardRef<HTMLElement, TabsLinkListProps>(function TabsLinkList(
  { variant = "underline", size = "md", fill, orientation = "horizontal", overflow = "scroll", className, children, ...props },
  ref,
) {
  const scrollRef = React.useRef<HTMLElement>(null);
  const composed = useComposedRefs<HTMLElement>(ref, scrollRef);
  const scrolls = overflow === "scroll" && orientation === "horizontal" && !fill;
  useEdgeFade(scrollRef, "x", scrolls);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!scrolls || !el) return;
    el.querySelector<HTMLElement>("[aria-current=page]")?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [scrolls]);
  const ctx = React.useMemo(() => ({ variant, size }), [variant, size]);
  return (
    <TabsListContext.Provider value={ctx}>
      <nav
        ref={composed}
        data-slot="tabs-link-list"
        data-edge-fade={scrolls ? "x" : undefined}
        className={cn(scrolls && "min-w-0 scrollbar-none overflow-x-auto overscroll-x-contain", className)}
        {...props}
      >
        <div data-orientation={orientation} data-variant={variant} className={tabsListVariants({ variant, fill })}>
          {React.Children.map(children, (child) =>
            React.isValidElement<{ "data-orientation"?: string }>(child) ? React.cloneElement(child, { "data-orientation": orientation }) : child,
          )}
        </div>
      </nav>
    </TabsListContext.Provider>
  );
});

export interface TabsLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  /** Force the active state. Default: derived from `currentPath` (`exact` for an index route). */
  active?: boolean;
  /** Match only this exact path (use for the first, "Overview" tab). */
  exact?: boolean;
  icon?: React.ReactNode;
  count?: number;
  badgeTone?: BadgeProps["tone"];
  /** Dims the link and removes it from the tab order. */
  disabled?: boolean;
}

/** One route tab. Renders the app's `Link`. */
export const TabsLink = React.forwardRef<HTMLAnchorElement, TabsLinkProps>(function TabsLink(
  { href, active, exact, icon, count, badgeTone, disabled, className, children, ...props },
  ref,
) {
  const Link = useLink();
  const { isActive } = useNavigation();
  const { variant, size } = React.useContext(TabsListContext);
  const current = active ?? isActive(href, { exact });
  return (
    <Link
      ref={ref}
      href={href}
      data-slot="tabs-link"
      data-selected={current ? "" : undefined}
      aria-current={current ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
    >
      <TabContent icon={icon} count={count} badgeTone={badgeTone ?? (current && variant !== "underline" ? "accent" : undefined)}>
        {children}
      </TabContent>
    </Link>
  );
});
