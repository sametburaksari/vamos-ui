"use client";

import * as React from "react";
import { ChevronDown, Menu, Search } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import type { MenuEntry } from "../lib/variants";
import { IconButton } from "./button";
import { KbdGroup } from "./kbd";
import { Avatar } from "./avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuEntries, DropdownMenuTrigger } from "./dropdown-menu";
import { useCommandPalette } from "./command";

const topBarLabels = {
  search: "Search or run a command…",
  searchShort: "Search",
  menu: "Open menu",
  account: "Account menu for {name}",
};
export type TopBarLabels = typeof topBarLabels;

/**
 * Bridge between the top bar and the App shell (mobile nav button). App shell provides it; outside
 * a shell the menu button needs its own `onClick`.
 */
export const TopBarShellContext = /*#__PURE__*/ React.createContext<{ openMobileNav: () => void; mobileNavOpen: boolean } | null>(null);

export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Sticks to the top of the scrolling area. Default `true`. */
  sticky?: boolean;
  /** `bar`: translucent bar with a hairline. `transparent`: blends in until the page scrolls (`data-scrolled`). */
  variant?: "bar" | "transparent";
  /** Element whose scroll sets `data-scrolled`. Default `window`. */
  scrollTarget?: React.RefObject<HTMLElement | null>;
}

/**
 * The sticky bar above the content: mobile menu button, ⌘K search, contextual actions,
 * notifications and the user menu. The same in every app.
 *
 * ```tsx
 * <TopBar>
 *   <TopBarStart><TopBarMenuButton /></TopBarStart>
 *   <TopBarSearch />
 *   <TopBarSpacer />
 *   <TopBarActions><NotificationCenter adapter={inbox} /><UserMenu name="Ada Lovelace" items={account} /></TopBarActions>
 * </TopBar>
 * ```
 */
export const TopBar = /*#__PURE__*/ React.forwardRef<HTMLElement, TopBarProps>(function TopBar({ sticky = true, variant = "bar", scrollTarget, className, role, ...props }, ref) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const el = scrollTarget?.current;
    const read = () => setScrolled((el ? el.scrollTop : window.scrollY) > 4);
    read();
    const target: HTMLElement | Window = el ?? window;
    target.addEventListener("scroll", read, { passive: true });
    return () => target.removeEventListener("scroll", read);
  }, [scrollTarget]);
  return (
    <header
      ref={ref}
      role={role ?? "banner"}
      data-slot="top-bar"
      data-variant={variant}
      data-scrolled={scrolled ? "" : undefined}
      className={cn(
        "vui-top-bar surface-bar @container/topbar flex h-(--topbar-h) min-w-0 shrink-0 items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-6",
        "transition-[background-color,border-color] duration-200",
        sticky && "sticky top-0 z-(--z-sticky)",
        className,
      )}
      {...props}
    />
  );
});

/** Leading slot: menu button, breadcrumb. */
export function TopBarStart({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="top-bar-start" className={cn("flex min-w-0 items-center gap-2", className)} {...props} />;
}

/** Pushes the following slots to the end. */
export function TopBarSpacer({ className }: { className?: string }) {
  return <div aria-hidden data-slot="top-bar-spacer" className={cn("min-w-0 flex-1", className)} />;
}

/** Trailing slot: theme switch, notifications, "New", user menu. */
export function TopBarActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="top-bar-actions" className={cn("flex shrink-0 items-center gap-1 sm:gap-1.5", className)} {...props} />;
}

/** A short vertical rule between action groups. */
export function TopBarSeparator({ className }: { className?: string }) {
  return <span aria-hidden data-slot="top-bar-separator" className={cn("mx-1 h-5 w-px shrink-0 bg-line", className)} />;
}

export interface TopBarMenuButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  labels?: Partial<TopBarLabels>;
}

/** Opens the App shell's mobile navigation. Visible only below 768px. */
export const TopBarMenuButton = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, TopBarMenuButtonProps>(function TopBarMenuButton({ className, onClick, labels, ...props }, ref) {
  const shell = React.useContext(TopBarShellContext);
  const t = useLabels("topBar", topBarLabels, labels);
  return (
    <IconButton
      ref={ref}
      label={t("menu")}
      size="sm"
      tooltip={false}
      aria-expanded={shell ? shell.mobileNavOpen : undefined}
      aria-haspopup="dialog"
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) shell?.openMobileNav();
      }}
      className={cn(shell ? "@min-[768px]/shell:hidden" : "md:hidden", "-ms-1", className)}
      {...props}
    >
      <Menu />
    </IconButton>
  );
});

export interface TopBarSearchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Default "Search or run a command…" (`topBar.search`). */
  placeholder?: string;
  /** Shortcut hint. Default `"mod+k"`; `false` hides it. */
  shortcut?: string | false;
  /** Default: opens the command palette of the nearest `CommandProvider`. */
  onOpen?: () => void;
  labels?: Partial<TopBarLabels>;
}

/**
 * The ⌘K trigger: a real button that looks like a field. Collapses to an icon button when the bar is
 * narrower than 560px.
 */
export const TopBarSearch = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, TopBarSearchProps>(function TopBarSearch({ placeholder, shortcut = "mod+k", onOpen, onClick, className, labels, ...props }, ref) {
  const t = useLabels("topBar", topBarLabels, labels);
  const palette = useCommandPalette();
  const open = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (onOpen) onOpen();
    else palette.open();
  };
  const text = placeholder ?? t("search");
  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        aria-keyshortcuts={shortcut ? "Meta+K Control+K" : undefined}
        onClick={open}
        data-slot="top-bar-search"
        className={cn(
          "group flex h-[calc(var(--control-h)-0.5rem)] w-full max-w-80 min-w-0 items-center gap-2 rounded-full border border-field-border bg-field ps-3 pe-1.5 text-[13px] text-fg-subtle",
          "transition-[border-color,background-color] hover:border-field-border-hover focus-ring @max-[560px]/topbar:hidden",
          className,
        )}
        {...props}
      >
        <Search aria-hidden className="size-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-start">{text}</span>
        {shortcut ? <KbdGroup keys={shortcut} size="sm" className="shrink-0" /> : null}
      </button>
      <IconButton label={t("searchShort")} size="sm" tooltip={false} aria-haspopup="dialog" onClick={open} className="hidden @max-[560px]/topbar:inline-flex">
        <Search />
      </IconButton>
    </>
  );
});

export interface UserMenuProps {
  name: string;
  email?: string;
  avatar?: string | null;
  /** Account entries: profile, settings, theme, sign out. Same model as Dropdown Menu. */
  items: MenuEntry[];
  /** Show the name next to the avatar (wide bars). Default `false`. */
  showName?: boolean;
  /** Extra content under the header (a plan badge, a workspace line). */
  children?: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
  labels?: Partial<TopBarLabels>;
}

/** The avatar button with the account menu. */
export function UserMenu({ name, email, avatar, items, showName, children, align = "end", className, labels }: UserMenuProps) {
  const t = useLabels("topBar", topBarLabels, labels);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="user-menu-trigger"
          className={cn("flex shrink-0 items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-hover focus-ring", showName && "pe-2", className)}
        >
          {/* Text content, not aria-label: the visible initials / name must not contradict the name (WCAG 2.5.3). */}
          <span className="sr-only">{t("account", { name })}</span>
          <Avatar name={name} src={avatar} size="sm" aria-hidden />
          {showName ? (
            <>
              <span aria-hidden className="max-w-32 truncate text-[13px] font-medium text-fg">{name}</span>
              <ChevronDown aria-hidden className="size-3.5 text-fg-subtle" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-60">
        <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-2">
          <Avatar name={name} src={avatar} size="md" aria-hidden />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13.5px] font-medium text-fg">{name}</p>
            {email ? <p className="truncate text-xs text-fg-subtle">{email}</p> : null}
          </div>
        </div>
        {children}
        <div role="none" className="-mx-1 my-1 h-px bg-line" />
        <DropdownMenuEntries items={items} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
