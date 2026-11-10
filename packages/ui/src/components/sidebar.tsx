"use client";

import * as React from "react";
import { Collapsible, Popover as PopoverPrimitive } from "radix-ui";
import { ArrowUpRight, Check, ChevronDown, ChevronRight, ChevronsUpDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useCan, useLink, useNavigation } from "../lib/provider";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { useHoverIntent } from "../lib/use-hover-intent";
import { useControllableState } from "../lib/use-controllable-state";
import { useHotkeys } from "../lib/use-hotkeys";
import {
  filterNav,
  isAbsoluteHref,
  isNavGroup,
  isNavSeparator,
  normaliseBadge,
  resolveActive,
  type BadgeSpec,
  type NavIcon,
  type NavItem,
  type NavNode,
} from "../lib/nav";
import { Tooltip, TooltipContent, TooltipRoot, TooltipTrigger } from "./tooltip";

// Nav types for consumers; the pure helpers (filterNav, resolveActive, flattenNav, parseSidebarCookie…)
// are exported from a server-safe module (page-header.tsx) so server layouts can call them.
export type { BadgeSpec, NavIcon, NavItem, NavGroup, NavSeparator, NavNode, NavEntry, FlatNavItem, ActiveNav, FilterNavOptions } from "../lib/nav";

const sidebarLabels = {
  label: "Main navigation",
  collapse: "Collapse sidebar",
  expand: "Expand sidebar",
  collapseShort: "Collapse",
  badge: "{count, plural, one {# new} other {# new}}",
  newTab: "opens in a new tab",
  showSubmenu: "Show {label} pages",
  switchApp: "Switch app, current: {app}",
  apps: "Apps",
  workspaces: "Workspaces",
  loading: "Loading menu",
};
export type SidebarLabels = typeof sidebarLabels;

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  collapsible: boolean;
  variant: "nav" | "surface";
  mode: "desktop" | "mobile";
  /** Called after a link is followed (the mobile sheet closes). */
  onNavigate?: () => void;
  t: ReturnType<typeof useLabels<SidebarLabels>>;
}
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/** Collapsed state and helpers of the nearest `Sidebar`. */
export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <Sidebar>.");
  return { collapsed: ctx.collapsed, setCollapsed: ctx.setCollapsed, toggle: () => ctx.setCollapsed(!ctx.collapsed), mode: ctx.mode, variant: ctx.variant };
}
const useSidebarCtx = () => {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("Sidebar parts must be used inside <Sidebar>.");
  return ctx;
};

/** Active trail from `SidebarNav` (data-driven); `null` in the compound API (each item checks its own href). */
const TrailContext = React.createContext<string[] | null>(null);

type Placement = "inline" | "flyout" | "mobile";
const SubContext = React.createContext<{ placement: Placement; depth: number; close?: () => void }>({ placement: "inline", depth: 1 });

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

export interface SidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, "dir"> {
  /** `nav`: dark in both themes (default). `surface`: same background as the content — client portals, websites. */
  variant?: "nav" | "surface";
  /** Rail mode (icons only, submenus as flyouts). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Allow the rail. Default `true`. */
  collapsible?: boolean;
  /** `mobile`: always expanded, accordion levels instead of flyouts (inside the App shell's Sheet). */
  mode?: "desktop" | "mobile";
  /** Toggle shortcut, e.g. `"mod+\\"`. Default off (App shell turns it on). `mod+b` is never used — it is Bold in editors. */
  shortcut?: string | false;
  /** Called after any link is followed. */
  onNavigate?: () => void;
  labels?: Partial<SidebarLabels>;
}

/**
 * The primary app navigation. Dark in both themes; the active section's submenu stays open in
 * place, other sections open as flyouts, and the rail turns every submenu into a flyout.
 * Router-agnostic: links and the current path come from `VamosProvider`.
 *
 * ```tsx
 * <Sidebar>
 *   <SidebarHeader><AppSwitcher apps={apps} activeApp="site" /></SidebarHeader>
 *   <SidebarContent><SidebarNav items={nav} badges={{ comments: 4 }} /></SidebarContent>
 *   <SidebarFooter><SidebarCollapseButton /></SidebarFooter>
 * </Sidebar>
 * ```
 */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { variant = "nav", collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, collapsible = true, mode = "desktop", shortcut = false, onNavigate, labels, className, children, ...props },
  ref,
) {
  const t = useLabels("sidebar", sidebarLabels, labels);
  const [collapsedState, setCollapsed] = useControllableState({ value: collapsedProp, defaultValue: defaultCollapsed, onChange: onCollapsedChange, name: "Sidebar" });
  const collapsed = mode === "desktop" && collapsible && collapsedState;
  useHotkeys(shortcut || "", () => setCollapsed(!collapsedState), { enabled: Boolean(shortcut) && collapsible && mode === "desktop" });
  const ctx = React.useMemo<SidebarContextValue>(
    () => ({ collapsed, setCollapsed, collapsible, variant, mode, onNavigate, t }),
    [collapsed, setCollapsed, collapsible, variant, mode, onNavigate, t],
  );
  return (
    <SidebarContext.Provider value={ctx}>
      <aside
        ref={ref}
        data-slot="sidebar"
        data-variant={variant}
        data-mode={mode}
        data-collapsed={collapsed ? "" : undefined}
        className={cn(
          "vui-sidebar surface-nav relative flex h-full min-h-0 shrink-0 flex-col text-[13.5px]",
          mode === "desktop" && "border-e border-nav-line",
          variant === "surface" && "border-line",
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
});

/** Top slot: app switcher, workspace switcher, logo. */
export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function SidebarHeader({ className, ...props }, ref) {
  return <div ref={ref} data-slot="sidebar-header" className={cn("grid gap-1 border-b border-nav-line p-2", className)} {...props} />;
});

export interface SidebarContentProps extends React.HTMLAttributes<HTMLElement> {
  /** Accessible name of the `nav`. Default "Main navigation" (`sidebar.label`). */
  "aria-label"?: string;
}

/** The scrolling `<nav>` with the menu. */
export const SidebarContent = React.forwardRef<HTMLElement, SidebarContentProps>(function SidebarContent({ className, ...props }, ref) {
  const { t } = useSidebarCtx();
  return (
    <nav
      ref={ref}
      data-slot="sidebar-content"
      aria-label={props["aria-label"] ?? t("label")}
      className={cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain py-2 scrollbar-none", className)}
      {...props}
    />
  );
});

/** Bottom slot: shared menu, collapse button, user. */
export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function SidebarFooter({ className, ...props }, ref) {
  return <div ref={ref} data-slot="sidebar-footer" className={cn("border-t border-nav-line", className)} {...props} />;
});

export interface SidebarGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Section heading ("Content"). In the rail it becomes a hairline. */
  label?: React.ReactNode;
}

/** A section: optional heading plus a list of `SidebarItem`s. */
export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup({ label, className, children, ...props }, ref) {
  const { collapsed } = useSidebarCtx();
  const id = React.useId();
  return (
    <div ref={ref} data-slot="sidebar-group" role={label ? "group" : undefined} aria-labelledby={label ? id : undefined} className={cn("grid", className)} {...props}>
      {label ? (
        collapsed ? (
          <>
            <span id={id} className="sr-only">{label}</span>
            <span aria-hidden className="mx-4 my-2 h-px bg-nav-line" />
          </>
        ) : (
          <span id={id} className="px-4.5 pt-4 pb-1.5 text-[11px] font-medium tracking-[0.06em] text-nav-fg/50">
            {label}
          </span>
        )
      ) : null}
      <ul className="grid gap-px">{children}</ul>
    </div>
  );
});

/** A hairline between sections. */
export function SidebarSeparator({ className }: { className?: string }) {
  return <div role="separator" data-slot="sidebar-separator" className={cn("mx-4 my-2 h-px bg-nav-line", className)} />;
}

/* ------------------------------------------------------------------ */
/* Badge                                                                */
/* ------------------------------------------------------------------ */

const badgeTone = {
  accent: "bg-accent text-accent-fg",
  danger: "bg-danger-solid text-white",
  warning: "tone-warning bg-[color-mix(in_srgb,var(--warning)_26%,transparent)] text-nav-fg-strong",
  neutral: "bg-nav-active text-nav-fg-strong",
};
const dotTone = { accent: "bg-accent", danger: "bg-danger-solid", warning: "bg-warning", neutral: "bg-nav-fg" };

/** The count / dot next to a sidebar item. Visual only; the accessible text is added to the link name. */
function SidebarBadgeView({ spec, rail }: { spec: BadgeSpec | undefined; rail: boolean }) {
  const { format } = useLocale();
  const b = normaliseBadge(spec);
  if (!b) return null;
  if (rail || b.dot) {
    return <span aria-hidden data-slot="sidebar-badge" className={cn("size-1.5 shrink-0 rounded-full", rail && "absolute end-2 top-2", dotTone[b.tone])} />;
  }
  const text = b.count !== undefined ? (b.count > 99 ? `${format.number(99)}+` : format.number(b.count)) : b.text;
  return (
    <span aria-hidden data-slot="sidebar-badge" className={cn("min-w-[18px] shrink-0 rounded-full px-1.5 text-center text-[10.5px] font-semibold leading-[18px] tabular", badgeTone[b.tone])}>
      {text}
    </span>
  );
}

function useBadgeText(spec: BadgeSpec | undefined): string | undefined {
  const { t } = useSidebarCtx();
  const b = normaliseBadge(spec);
  if (!b) return undefined;
  if (b.label) return b.label;
  if (b.count !== undefined) return t("badge", { count: b.count });
  return b.text;
}

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

function hrefsOf(children: React.ReactNode): string[] {
  const out: string[] = [];
  React.Children.forEach(children, (c) => {
    if (!React.isValidElement<{ href?: string; children?: React.ReactNode }>(c)) return;
    if (c.props.href) out.push(c.props.href);
    if (c.props.children) out.push(...hrefsOf(c.props.children));
  });
  return out;
}

function useItemActive(id: string | undefined, href: string | undefined, children: React.ReactNode, explicit: boolean | undefined) {
  const trail = React.useContext(TrailContext);
  const { isActive } = useNavigation();
  if (explicit !== undefined) return { inTrail: explicit, current: explicit };
  if (trail && id) return { inTrail: trail.includes(id), current: trail[trail.length - 1] === id };
  const self = href ? isActive(href) : false;
  const child = hrefsOf(children).some((h) => isActive(h));
  return { inTrail: self || child, current: self && !child };
}

const rowBase = "relative flex w-full items-center gap-3 rounded-ui-sm text-start outline-none transition-colors focus-ring";

interface LinkRowProps {
  href?: string;
  external?: boolean;
  disabled?: boolean | string;
  className?: string;
  children: React.ReactNode;
  "aria-current"?: React.AriaAttributes["aria-current"];
  onClick?: React.MouseEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  onPointerDown?: React.PointerEventHandler<HTMLElement>;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/** An `<a>` through the app router, a `<button>` (no href) or a disabled `<span>`. */
const LinkRow = React.forwardRef<HTMLElement, LinkRowProps & Record<`aria-${string}`, unknown>>(function LinkRow(
  { href, external, disabled, className, children, onClick, buttonProps, ...rest },
  ref,
) {
  const Link = useLink();
  const { onNavigate } = useSidebarCtx();
  if (disabled) {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} aria-disabled="true" className={cn(className, "cursor-not-allowed opacity-45")} {...(rest as object)}>
        {children}
      </span>
    );
  }
  if (!href) {
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={className} onClick={onClick} {...buttonProps} {...(rest as object)}>
        {children}
      </button>
    );
  }
  const ext = external ?? isAbsoluteHref(href);
  const handle: React.MouseEventHandler<HTMLElement> = (e) => {
    onClick?.(e);
    if (!e.defaultPrevented) onNavigate?.();
  };
  if (ext) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={handle} {...(rest as object)}>
        {children}
      </a>
    );
  }
  return (
    <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={className} onClick={handle} {...(rest as object)}>
      {children}
    </Link>
  );
});

function ExternalMark() {
  const { t } = useSidebarCtx();
  return (
    <>
      <ArrowUpRight aria-hidden className="size-3.5 shrink-0 opacity-60 rtl:-scale-x-100" />
      <span className="sr-only">({t("newTab")})</span>
    </>
  );
}

export interface SidebarItemProps {
  /** Stable key (matches `badges` and the active trail in `SidebarNav`). */
  id?: string;
  label: string;
  href?: string;
  icon?: NavIcon;
  /** Count, label or `{ count, tone, dot, label }`. */
  badge?: BadgeSpec;
  /** `true`, or a reason shown as a badge ("Coming soon"). */
  disabled?: boolean | string;
  external?: boolean;
  /** Force the active state. Default: from `SidebarNav`'s trail or the current path. */
  active?: boolean;
  /** `SidebarSubItem`s. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * A level-1 item (icon + label). With children it is a section: open in place when active,
 * a flyout otherwise (and always in the rail), an accordion in the mobile sheet.
 */
export function SidebarItem({ id, label, href, icon: Icon, badge, disabled, external, active, children, className }: SidebarItemProps) {
  const ctx = useSidebarCtx();
  const { collapsed, mode, t, variant } = ctx;
  const { inTrail, current } = useItemActive(id, href, children, active);
  const hasChildren = React.Children.toArray(children).length > 0;
  const badgeText = useBadgeText(badge);
  const reason = typeof disabled === "string" ? disabled : undefined;

  const inline = hasChildren && !collapsed && mode === "desktop" && inTrail;
  const flyout = mode === "desktop" && !disabled && (collapsed || (hasChildren && !inline));
  const accordion = hasChildren && mode === "mobile";

  const rowClass = cn(
    rowBase,
    "mx-2 h-(--sidebar-item-h) w-auto",
    collapsed ? "justify-center px-0" : "px-2.5",
    inTrail ? "bg-nav-active font-medium text-nav-fg-strong" : "hover:bg-nav-hover hover:text-nav-fg-strong",
    className,
  );
  const content = (
    <>
      {inTrail ? <span aria-hidden className="absolute -start-2 top-1.5 bottom-1.5 w-[3px] rounded-e-full bg-accent" /> : null}
      {Icon ? <Icon aria-hidden className={cn("size-[17px] shrink-0", inTrail ? (variant === "surface" ? "text-accent-ink" : "text-accent") : "opacity-80")} strokeWidth={1.8} /> : null}
      <span className={cn("min-w-0 flex-1 truncate", collapsed && "sr-only")}>{label}</span>
      {badgeText ? <span className="sr-only">, {badgeText}</span> : null}
      {reason && !collapsed ? <span className="shrink-0 rounded-full bg-nav-hover px-1.5 text-[10.5px] leading-[18px] text-nav-fg">{reason}</span> : null}
      {reason && collapsed ? <span className="sr-only">, {reason}</span> : null}
      {!reason ? <SidebarBadgeView spec={badge} rail={collapsed} /> : null}
      {(external ?? (href ? isAbsoluteHref(href) : false)) && !collapsed ? <ExternalMark /> : null}
      {flyout && hasChildren && !collapsed ? <ChevronRight aria-hidden className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/item:opacity-50 rtl:-scale-x-100" /> : null}
    </>
  );

  if (accordion) {
    return (
      <SidebarAccordionItem label={label} href={href} defaultOpen={inTrail} rowClass={rowClass} current={current} disabled={disabled} external={external} showLabel={t("showSubmenu", { label })}>
        {content}
        <SubContext.Provider value={{ placement: "mobile", depth: 1 }}>{children}</SubContext.Provider>
      </SidebarAccordionItem>
    );
  }

  if (flyout) {
    return (
      <SidebarFlyoutItem label={label} href={href} rowClass={rowClass} current={current} inTrail={inTrail} external={external} hasChildren={hasChildren}>
        {content}
        {hasChildren ? <SubContext.Provider value={{ placement: "flyout", depth: 1 }}>{children}</SubContext.Provider> : null}
      </SidebarFlyoutItem>
    );
  }

  return (
    <li data-slot="sidebar-item" className="group/item">
      <LinkRow href={href} external={external} disabled={disabled} aria-current={current ? "page" : inTrail && hasChildren ? "true" : undefined} className={rowClass}>
        {content}
      </LinkRow>
      {inline ? (
        <ul className="mx-2 mt-px mb-1 grid gap-px rounded-ui-sm bg-nav-sub py-1">
          <SubContext.Provider value={{ placement: "inline", depth: 1 }}>{children}</SubContext.Provider>
        </ul>
      ) : null}
    </li>
  );
}

function SidebarAccordionItem({
  label,
  href,
  defaultOpen,
  rowClass,
  current,
  disabled,
  external,
  showLabel,
  children,
}: {
  label: string;
  href?: string;
  defaultOpen: boolean;
  rowClass: string;
  current: boolean;
  disabled?: boolean | string;
  external?: boolean;
  showLabel: string;
  children: [React.ReactNode, React.ReactNode];
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [content, sub] = children;
  return (
    <Collapsible.Root asChild open={open} onOpenChange={setOpen}>
      <li data-slot="sidebar-item" className="group/item">
        <div className="relative flex items-center">
          {href ? (
            <LinkRow href={href} external={external} disabled={disabled} aria-current={current ? "page" : undefined} className={cn(rowClass, "flex-1 pe-10")}>
              {content}
            </LinkRow>
          ) : (
            <Collapsible.Trigger asChild>
              <button type="button" className={cn(rowClass, "flex-1 pe-10")}>
                {content}
              </button>
            </Collapsible.Trigger>
          )}
          {href ? (
            <Collapsible.Trigger asChild>
              <button type="button" aria-label={showLabel} className="absolute end-3 grid size-7 place-items-center rounded-ui-sm text-nav-fg hover:bg-nav-hover hover:text-nav-fg-strong focus-ring">
                <ChevronDown aria-hidden className={cn("size-4 transition-transform", open && "rotate-180")} />
              </button>
            </Collapsible.Trigger>
          ) : (
            <ChevronDown aria-hidden className={cn("pointer-events-none absolute end-5 size-4 transition-transform", open && "rotate-180")} />
          )}
        </div>
        <Collapsible.Content className="ui-collapse">
          <ul aria-label={label} className="mx-2 mt-px mb-1 grid gap-px rounded-ui-sm bg-nav-sub py-1">
            {sub}
          </ul>
        </Collapsible.Content>
      </li>
    </Collapsible.Root>
  );
}

function focusables(root: HTMLElement | null) {
  return root ? Array.from(root.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")) : [];
}

function SidebarFlyoutItem({
  label,
  href,
  rowClass,
  current,
  inTrail,
  external,
  hasChildren,
  children,
}: {
  label: string;
  href?: string;
  rowClass: string;
  current: boolean;
  inTrail: boolean;
  external?: boolean;
  hasChildren: boolean;
  children: [React.ReactNode, React.ReactNode];
}) {
  const { collapsed, variant } = useSidebarCtx();
  const { dir } = useLocale();
  const container = usePortalContainer();
  const [content, sub] = children;
  const hover = useHoverIntent({ openDelay: 60, closeDelay: 180, openOnFocus: false });
  const triggerRef = React.useRef<HTMLElement>(null);
  const viaKeyboard = React.useRef(false);
  const pointerType = React.useRef<string>("mouse");
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";

  // Leaf in the rail: a tooltip is enough.
  if (!hasChildren) {
    return (
      <li data-slot="sidebar-item" className="group/item">
        <Tooltip content={label} side={dir === "rtl" ? "left" : "right"}>
          <LinkRow ref={triggerRef} href={href} external={external} aria-current={current ? "page" : undefined} className={rowClass}>
            {content}
          </LinkRow>
        </Tooltip>
      </li>
    );
  }

  const openWithKeyboard = () => {
    viaKeyboard.current = true;
    hover.setOpen(true);
  };
  const close = (refocus: boolean) => {
    hover.setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  return (
    <PopoverPrimitive.Root open={hover.open} onOpenChange={(o) => (o ? hover.setOpen(true) : close(false))} modal={false}>
      <li data-slot="sidebar-item" className="group/item">
        <PopoverPrimitive.Anchor asChild>
          <LinkRow
            ref={triggerRef}
            href={href}
            external={external}
            aria-current={current ? "page" : inTrail ? "true" : undefined}
            aria-haspopup="true"
            aria-expanded={hover.open}
            className={cn(rowClass, hover.open && !inTrail && "bg-nav-hover text-nav-fg-strong")}
            {...(hover.triggerProps as object)}
            onPointerDown={(e: React.PointerEvent) => (pointerType.current = e.pointerType)}
            onClick={(e: React.MouseEvent) => {
              // Touch: the first tap opens the flyout, the second follows the link (WordPress-style).
              if (!href) {
                e.preventDefault();
                if (hover.open) close(false);
                else if (e.detail === 0) openWithKeyboard();
                else hover.setOpen(true);
                return;
              }
              if (pointerType.current === "touch" && !hover.open) {
                e.preventDefault();
                hover.setOpen(true);
              }
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === forward || (e.key === "ArrowDown" && !href && hover.open)) {
                e.preventDefault();
                if (hover.open) focusables(panelRef.current)[0]?.focus();
                else openWithKeyboard();
              } else if (e.key === "Escape" && hover.open) {
                e.preventDefault();
                close(true);
              }
            }}
          >
            {content}
          </LinkRow>
        </PopoverPrimitive.Anchor>
      </li>
      <PopoverPrimitive.Portal container={container}>
        <Layer asChild>
          <PopoverPrimitive.Content
            ref={(node: HTMLDivElement | null) => {
              panelRef.current = node;
              hover.contentRef(node);
            }}
            side={dir === "rtl" ? "left" : "right"}
            align="start"
            sideOffset={8}
            alignOffset={-6}
            collisionPadding={12}
            aria-label={label}
            data-slot="sidebar-flyout"
            data-variant={variant}
            className="vui-sidebar-flyout ui-pop z-(--z-popover) min-w-52 max-w-72 rounded-ui-lg p-1.5 text-[13px] outline-none"
            {...hover.contentProps}
            onOpenAutoFocus={(e) => {
              // Radix skips links on auto-focus; focus the first item ourselves when opened from the keyboard.
              e.preventDefault();
              if (viaKeyboard.current) focusables(e.currentTarget as HTMLElement)[0]?.focus();
              viaKeyboard.current = false;
            }}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              close(true);
            }}
            onKeyDown={(e) => {
              const items = focusables(panelRef.current);
              const i = items.indexOf(document.activeElement as HTMLElement);
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
                items[next]?.focus();
              } else if (e.key === "Home" || e.key === "End") {
                e.preventDefault();
                items[e.key === "Home" ? 0 : items.length - 1]?.focus();
              } else if (e.key === backward) {
                e.preventDefault();
                close(true);
              }
            }}
          >
            {collapsed ? <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-medium tracking-[0.06em] text-nav-fg/60">{label}</p> : null}
            <SubContext.Provider value={{ placement: "flyout", depth: 1, close: () => close(false) }}>
              <ul className="grid gap-px">{sub}</ul>
            </SubContext.Provider>
          </PopoverPrimitive.Content>
        </Layer>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export interface SidebarSubItemProps {
  id?: string;
  label: string;
  href?: string;
  badge?: BadgeSpec;
  disabled?: boolean | string;
  external?: boolean;
  active?: boolean;
  /** Level-3 `SidebarSubItem`s: a collapsible inline, a heading + list in a flyout. */
  children?: React.ReactNode;
  className?: string;
}

/** A level-2 (or level-3) link under a `SidebarItem`. */
export function SidebarSubItem({ id, label, href, badge, disabled, external, active, children, className }: SidebarSubItemProps) {
  const { placement, depth, close } = React.useContext(SubContext);
  const { inTrail, current } = useItemActive(id, href, children, active);
  const badgeText = useBadgeText(badge);
  const hasChildren = React.Children.toArray(children).length > 0;
  const [open, setOpen] = React.useState(inTrail);
  if (process.env.NODE_ENV !== "production" && depth > 2) console.warn("[vamos-ui] Sidebar supports up to 3 levels.");

  const flyout = placement === "flyout";
  const pad = flyout ? (depth > 1 ? "ps-5 pe-2.5" : "px-2.5") : depth > 1 ? "ps-[54px] pe-3" : "ps-[42px] pe-3";
  const rowClass = cn(
    rowBase,
    "gap-2 py-1.5 text-[13px]",
    flyout ? "rounded-ui-sm hover:bg-nav-hover hover:text-nav-fg-strong" : "hover:text-nav-fg-strong",
    pad,
    current ? "font-medium text-nav-fg-strong" : undefined,
    className,
  );
  const body = (
    <>
      {current && flyout ? <Check aria-hidden className="size-3.5 shrink-0 text-accent" /> : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badgeText ? <span className="sr-only">, {badgeText}</span> : null}
      {typeof disabled === "string" ? <span className="shrink-0 text-[10.5px] text-nav-fg/60">{disabled}</span> : <SidebarBadgeView spec={badge} rail={false} />}
      {(external ?? (href ? isAbsoluteHref(href) : false)) ? <ExternalMark /> : null}
    </>
  );

  if (hasChildren && flyout) {
    return (
      <li data-slot="sidebar-sub-item" className="mt-1 first:mt-0">
        <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium tracking-[0.06em] text-nav-fg/55">{label}</p>
        <ul className="grid gap-px">
          <SubContext.Provider value={{ placement, depth: depth + 1, close }}>{children}</SubContext.Provider>
        </ul>
      </li>
    );
  }
  if (hasChildren) {
    return (
      <Collapsible.Root asChild open={open} onOpenChange={setOpen}>
        <li data-slot="sidebar-sub-item">
          <Collapsible.Trigger asChild>
            <button type="button" className={cn(rowClass, inTrail && "text-nav-fg-strong")}>
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <ChevronDown aria-hidden className={cn("size-3.5 shrink-0 opacity-60 transition-transform", open && "rotate-180")} />
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content className="ui-collapse">
            <ul aria-label={label} className="grid gap-px">
              <SubContext.Provider value={{ placement, depth: depth + 1, close }}>{children}</SubContext.Provider>
            </ul>
          </Collapsible.Content>
        </li>
      </Collapsible.Root>
    );
  }
  return (
    <li data-slot="sidebar-sub-item">
      <LinkRow href={href} external={external} disabled={disabled} aria-current={current ? "page" : undefined} className={rowClass} onClick={() => close?.()}>
        {body}
      </LinkRow>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Data-driven nav                                                      */
/* ------------------------------------------------------------------ */

export interface SidebarNavProps {
  items: NavNode[];
  /** Live counts by item id, separate from the config so updates don't rebuild the tree: `{ comments: 4 }`. */
  badges?: Record<string, BadgeSpec | undefined>;
  /** Feature flags / module toggles for `feature`. */
  features?: Record<string, boolean | undefined>;
  /** Active trail override (App shell resolves it across every nav on the page). Default: `resolveActive(items, currentPath)`. */
  trail?: string[];
  /** Wraps the menu in its own `<nav>` with this name (e.g. a second "Workspace" menu in the footer). */
  "aria-label"?: string;
  className?: string;
}

function renderItem(it: NavItem, badges: SidebarNavProps["badges"]): React.ReactNode {
  return (
    <SidebarItem key={it.id} id={it.id} label={it.label} href={it.href} icon={it.icon} badge={badges?.[it.id] ?? it.badge} disabled={it.disabled} external={it.external}>
      {it.children?.map((c) => renderSub(c, badges))}
    </SidebarItem>
  );
}
function renderSub(it: NavItem, badges: SidebarNavProps["badges"]): React.ReactNode {
  return (
    <SidebarSubItem key={it.id} id={it.id} label={it.label} href={it.href} badge={badges?.[it.id] ?? it.badge} disabled={it.disabled} external={it.external}>
      {it.children?.map((c) => renderSub(c, badges))}
    </SidebarSubItem>
  );
}

/**
 * Renders a `NavNode[]` config with the same parts as the compound API (identical DOM). Items the
 * user can't see (`permission` via `can`, `feature`) are filtered out before render — **UI only**;
 * enforce permissions on the server.
 */
export function SidebarNav({ items, badges, features, trail: trailProp, className, ...props }: SidebarNavProps) {
  const can = useCan();
  const { currentPath } = useNavigation();
  const visible = React.useMemo(() => filterNav(items, { can, features }), [items, can, features]);
  const trail = React.useMemo(() => trailProp ?? resolveActive(visible, currentPath).trail, [trailProp, visible, currentPath]);

  const blocks: React.ReactNode[] = [];
  let loose: NavItem[] = [];
  const flush = (key: string) => {
    if (!loose.length) return;
    blocks.push(<SidebarGroup key={`loose-${key}`}>{loose.map((it) => renderItem(it, badges))}</SidebarGroup>);
    loose = [];
  };
  visible.forEach((n, i) => {
    if (isNavSeparator(n)) {
      flush(String(i));
      blocks.push(<SidebarSeparator key={n.id ?? `sep-${i}`} />);
    } else if (isNavGroup(n)) {
      flush(String(i));
      blocks.push(
        <SidebarGroup key={n.id} label={n.label}>
          {n.items.map((it) => renderItem(it, badges))}
        </SidebarGroup>,
      );
    } else loose.push(n);
  });
  flush("end");

  const body = <TrailContext.Provider value={trail}>{blocks}</TrailContext.Provider>;
  if (props["aria-label"]) {
    return (
      <nav aria-label={props["aria-label"]} data-slot="sidebar-nav" className={cn("py-2", className)}>
        {body}
      </nav>
    );
  }
  return (
    <div data-slot="sidebar-nav" className={className}>
      {body}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Collapse button, skeleton                                            */
/* ------------------------------------------------------------------ */

/** Toggles the rail. `aria-pressed` is true while collapsed. */
export const SidebarCollapseButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(function SidebarCollapseButton({ className, onClick, ...props }, ref) {
  const { collapsed, setCollapsed, collapsible, mode, t } = useSidebarCtx();
  const { dir } = useLocale();
  if (!collapsible || mode === "mobile") return null;
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  // One stable element in both states (a remount would drop focus after the click).
  return (
    <TooltipRoot open={collapsed ? undefined : false}>
      <TooltipTrigger asChild>
      <button
        ref={ref}
        type="button"
        aria-pressed={collapsed}
        aria-label={t("collapse")}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setCollapsed(!collapsed);
        }}
        className={cn(
          "flex h-10 w-full items-center gap-3 text-[12.5px] text-nav-fg/70 transition-colors hover:text-nav-fg-strong focus-ring",
          collapsed ? "justify-center" : "px-4.5",
          className,
        )}
        {...props}
      >
        <Icon aria-hidden className="size-4 rtl:-scale-x-100" />
        {!collapsed ? <span aria-hidden>{t("collapseShort")}</span> : null}
      </button>
      </TooltipTrigger>
      <TooltipContent side={dir === "rtl" ? "left" : "right"}>{t("expand")}</TooltipContent>
    </TooltipRoot>
  );
});

/** Placeholder rows while permissions load. */
export function SidebarSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  const { collapsed, t } = useSidebarCtx();
  return (
    <div role="status" aria-label={t("loading")} data-slot="sidebar-skeleton" className={cn("grid gap-1.5 px-2 py-3", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={cn("flex h-(--sidebar-item-h) items-center gap-3 rounded-ui-sm", collapsed ? "justify-center" : "px-2.5")}>
          <span className="size-4 shrink-0 animate-pulse rounded-[5px] bg-nav-active motion-reduce:animate-none" />
          {!collapsed ? <span className="h-2.5 animate-pulse rounded-full bg-nav-active motion-reduce:animate-none" style={{ width: `${48 + ((i * 37) % 40)}%` }} /> : null}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App switcher                                                        */
/* ------------------------------------------------------------------ */

export interface AppSwitcherApp {
  id: string;
  name: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> | React.ReactNode;
  href: string;
}

export interface AppSwitcherProps {
  apps: AppSwitcherApp[];
  activeApp?: string;
  /** Called instead of following the app's `href` (the App shell switches in place). */
  onSelect?: (id: string) => void;
  /** Small line under the app name. Default the app's description. */
  subtitle?: React.ReactNode;
  workspaces?: { id: string; name: string; logo?: string }[];
  activeWorkspace?: string;
  onWorkspaceChange?: (id: string) => void;
  /** Extra links at the bottom ("Manage apps & modules…"). */
  footer?: React.ReactNode;
  className?: string;
  labels?: Partial<SidebarLabels>;
}

function AppIcon({ icon, className }: { icon: AppSwitcherApp["icon"]; className?: string }) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in (icon as object))) {
    const I = icon as React.ComponentType<{ className?: string; strokeWidth?: number }>;
    return <I aria-hidden className={className} strokeWidth={2} />;
  }
  return <>{icon as React.ReactNode}</>;
}

/**
 * The app (and workspace) switcher in `SidebarHeader`: a panel of every app the user can open.
 * With a single app it is a static title.
 */
export function AppSwitcher({ apps, activeApp, onSelect, subtitle, workspaces, activeWorkspace, onWorkspaceChange, footer, className, labels }: AppSwitcherProps) {
  const { collapsed, variant, onNavigate } = useSidebarCtx();
  const t = useLabels("sidebar", sidebarLabels, labels);
  const Link = useLink();
  const { dir } = useLocale();
  const container = usePortalContainer();
  const [open, setOpen] = React.useState(false);
  const app = apps.find((a) => a.id === activeApp) ?? apps[0];
  if (!app) return null;
  const single = apps.length < 2 && !(workspaces && workspaces.length > 1);
  const workspace = workspaces?.find((w) => w.id === activeWorkspace);

  const tile = (
    <>
      <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-accent text-accent-fg [&_svg]:size-[17px]">
        <AppIcon icon={app.icon} />
      </span>
      <span className={cn("min-w-0 flex-1 leading-tight", collapsed && "sr-only")}>
        <span className="block truncate text-[13.5px] font-semibold text-nav-fg-strong">{app.name}</span>
        <span className="block truncate text-[11.5px] text-nav-fg/60">{subtitle ?? (workspace ? workspace.name : app.description)}</span>
      </span>
    </>
  );
  const boxClass = cn("flex w-full items-center gap-2.5 rounded-ui-sm p-1.5 text-start", collapsed && "justify-center");

  if (single) return <div className={cn(boxClass, className)}>{tile}</div>;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button type="button" className={cn(boxClass, "transition-colors hover:bg-nav-hover focus-ring", className)}>
          {/* The name is text, not aria-label: the visible app name and subtitle would otherwise
              contradict it (WCAG 2.5.3 label in name). The full name already contains the app name. */}
          <span className="sr-only">{t("switchApp", { app: app.name })}</span>
          <span aria-hidden className="contents">
            {tile}
          </span>
          {!collapsed ? <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-nav-fg/50" /> : null}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={container}>
        <Layer asChild>
          <PopoverPrimitive.Content
            side={collapsed ? (dir === "rtl" ? "left" : "right") : "bottom"}
            align="start"
            sideOffset={6}
            collisionPadding={12}
            aria-label={t("apps")}
            data-variant={variant}
            className="vui-sidebar-flyout ui-pop z-(--z-popover) w-64 max-w-[calc(100vw-1.5rem)] rounded-ui-lg p-1.5 outline-none"
          >
            {workspaces && workspaces.length > 1 ? (
              <div role="group" aria-label={t("workspaces")} className="mb-1 border-b border-nav-line pb-1.5">
                <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-medium tracking-[0.06em] text-nav-fg/55">{t("workspaces")}</p>
                {workspaces.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    aria-pressed={w.id === activeWorkspace}
                    onClick={() => {
                      onWorkspaceChange?.(w.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-ui-sm px-2 py-1.5 text-start text-[13px] text-nav-fg hover:bg-nav-hover hover:text-nav-fg-strong focus-ring"
                  >
                    <span aria-hidden className="grid size-6 place-items-center rounded-[7px] bg-nav-active text-[11px] font-semibold text-nav-fg-strong">
                      {w.name.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{w.name}</span>
                    {w.id === activeWorkspace ? <Check aria-hidden className="size-4 text-accent" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-medium tracking-[0.06em] text-nav-fg/55">{t("apps")}</p>
            <ul className="grid gap-px">
              {apps.map((a) => {
                const isActive = a.id === app.id;
                const inner = (
                  <>
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-[8px] [&_svg]:size-[15px]", isActive ? "bg-accent text-accent-fg" : "bg-nav-active text-nav-fg-strong")}>
                      <AppIcon icon={a.icon} />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[13px] font-medium text-nav-fg-strong">{a.name}</span>
                      {a.description ? <span className="block truncate text-[11.5px] text-nav-fg/55">{a.description}</span> : null}
                    </span>
                    {isActive ? <Check aria-hidden className="size-4 shrink-0 text-accent" /> : null}
                  </>
                );
                const cls = "flex w-full items-center gap-2.5 rounded-ui-sm px-2 py-1.5 text-start hover:bg-nav-hover focus-ring";
                return (
                  <li key={a.id}>
                    {onSelect ? (
                      <button
                        type="button"
                        aria-current={isActive ? "true" : undefined}
                        className={cls}
                        onClick={() => {
                          onSelect(a.id);
                          setOpen(false);
                          onNavigate?.();
                        }}
                      >
                        {inner}
                      </button>
                    ) : (
                      <Link href={a.href} aria-current={isActive ? "true" : undefined} className={cls} onClick={() => setOpen(false)}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            {footer ? <div className="mt-1 border-t border-nav-line pt-1 text-[12.5px] [&_a]:block [&_a]:rounded-ui-sm [&_a]:px-2.5 [&_a]:py-1.5 [&_a:hover]:bg-nav-hover [&_a:hover]:text-nav-fg-strong">{footer}</div> : null}
          </PopoverPrimitive.Content>
        </Layer>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
