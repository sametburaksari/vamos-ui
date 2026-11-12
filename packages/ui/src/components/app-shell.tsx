"use client";

import * as React from "react";
import { ArrowUpRight, ChevronDown, Plus } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { SmartLink, useCan, useLink, useNavigation, VamosProvider, type VamosLinkComponent, type VamosProviderProps } from "../lib/provider";
import { ThemeScope } from "../lib/theme-scope";
import { useContainerWidth } from "../lib/use-container-width";
import type { MenuEntry } from "../lib/variants";
import {
  filterNav,
  flattenNav,
  isAbsoluteHref,
  matchPath,
  navItems,
  navTrailItems,
  resolveActive,
  SIDEBAR_COOKIE,
  type BadgeSpec,
  type NavIcon,
  type NavNode,
} from "../lib/nav";
import { Button } from "./button";
import { Breadcrumb } from "./breadcrumb";
import { DialogTitle } from "./dialog";
import { Sheet, SheetContent } from "./sheet";
import { TooltipProvider } from "./tooltip";
import { Toaster } from "./toast";
import { ConfirmProvider } from "./alert-dialog";
import { EmptyState } from "./empty-state";
import { DropdownMenu, DropdownMenuContent, DropdownMenuEntries, DropdownMenuTrigger } from "./dropdown-menu";
import { CommandPalette, CommandProvider, createCommandRegistry, useRegisterCommands, type CommandAction, type CommandSource } from "./command";
import {
  AppSwitcher,
  Sidebar,
  SidebarCollapseButton,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarSkeleton,
} from "./sidebar";
import { TopBar, TopBarActions, TopBarMenuButton, TopBarSearch, TopBarSeparator, TopBarShellContext, TopBarSpacer, TopBarStart, UserMenu, type UserMenuProps } from "./top-bar";

const appShellLabels = {
  skip: "Skip to content",
  navigation: "Navigation",
  appMenu: "{app} menu",
  workspace: "Workspace",
  goTo: "Go to",
  apps: "Apps",
  switchTo: "Switch to {app}",
  newItem: "New",
  noApps: "No apps available",
  noAppsDescription: "Your account doesn't have access to any app yet. Ask an administrator to invite you.",
  pageChanged: "{title}",
};
export type AppShellLabels = typeof appShellLabels;

/* ------------------------------------------------------------------ */
/* App definitions                                                     */
/* ------------------------------------------------------------------ */

export interface AppLink {
  id: string;
  label: string;
  href: string;
  icon?: NavIcon;
  external?: boolean;
}

/** One app (CMS, CRM, HR, PRM…) on the shared shell. Define these in a client module (they hold components). */
export interface AppDefinition {
  /** `"site"` | `"crm"` | `"people"`… */
  id: string;
  name: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> | React.ReactNode;
  /** App home. An absolute URL (separately deployed app) triggers a full navigation. */
  href: string;
  /** Path prefix that belongs to the app. Default: `href`. */
  base?: string;
  /** `data-accent` override for the whole shell while this app is active (e.g. CRM = `"ocean"`). */
  accent?: string;
  nav: NavNode[];
  /** Commands for ⌘K while this app is active. */
  commands?: CommandAction[];
  /** Record search sources (stay registered when another app is active). */
  sources?: CommandSource[];
  /** Contents of the top bar's "New ▾" button. */
  newMenu?: MenuEntry[];
  /** Top-bar links that only make sense in this app ("View site" in the Site app). */
  links?: AppLink[];
  /** Hide the app entirely unless `can(permission)`. */
  permission?: string;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export interface AppShellProviderProps extends Partial<Omit<VamosProviderProps, "children" | "Link">> {
  apps: AppDefinition[];
  /** Default: the app whose `base` / `href` is the longest prefix of `currentPath`, else the last one used. */
  activeApp?: string;
  /** A menu shared by every app (users, settings), shown at the bottom of the sidebar. */
  sharedNav?: NavNode[];
  /** Commands available in every app. */
  commands?: CommandAction[];
  /** Feature flags / module toggles for nav items with `feature`. */
  features?: Record<string, boolean | undefined>;
  /** Rail preference — read the `ui-sidebar` cookie on the server (`parseSidebarCookie`) to avoid a flash. `undefined` = no preference. */
  defaultCollapsed?: boolean;
  /** Default: writes the `ui-sidebar` cookie. */
  onCollapsedChange?: (collapsed: boolean) => void;
  workspaces?: { id: string; name: string; logo?: string }[];
  activeWorkspace?: string;
  onWorkspaceChange?: (id: string) => void;
  /** Global shortcuts: `mod+k` (palette) and `mod+\\` (rail). Default `true`; turn off for shells embedded in a page. */
  shortcuts?: boolean;
  /** Router link (Next `Link`). Also accepted as `Link`. Omit when a `VamosProvider` above already sets it. */
  linkComponent?: VamosLinkComponent;
  Link?: VamosLinkComponent;
  children: React.ReactNode;
}

interface AppShellContextValue {
  apps: AppDefinition[];
  activeApp: AppDefinition | undefined;
  sharedNav: NavNode[];
  /** `activeApp.nav` filtered by `can` and `features`. */
  nav: NavNode[];
  visibleSharedNav: NavNode[];
  features?: Record<string, boolean | undefined>;
  trail: string[];
  /** The user's explicit rail preference (undefined = follow the width). */
  preference: boolean | undefined;
  setCollapsed: (v: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  switchApp: (id: string) => void;
  can: (permission: string) => boolean;
  workspaces?: AppShellProviderProps["workspaces"];
  activeWorkspace?: string;
  onWorkspaceChange?: (id: string) => void;
  registry: ReturnType<typeof createCommandRegistry>;
  commands?: CommandAction[];
  currentPath?: string;
  shortcuts: boolean;
}

const AppShellContext = /*#__PURE__*/ React.createContext<AppShellContextValue | null>(null);
/** Rail state as resolved by the layout (preference or width). */
const CollapsedContext = /*#__PURE__*/ React.createContext(false);

function writeCookie(v: boolean) {
  try {
    document.cookie = `${SIDEBAR_COOKIE}=${v ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* no document */
  }
}

function appFor(apps: AppDefinition[], path: string | undefined): AppDefinition | undefined {
  if (!path) return undefined;
  let best: { app: AppDefinition; score: number } | undefined;
  for (const a of apps) {
    const base = a.base ?? a.href;
    const score = matchPath(base, path);
    if (score >= 0 && (!best || score > best.score)) best = { app: a, score };
  }
  return best?.app;
}

/**
 * The app bridge for the shell: apps, shared nav, permissions, collapse preference, the ⌘K
 * registry (with "Go to" commands derived from every accessible app's nav) and app switching.
 * Router pieces come from the surrounding `VamosProvider`, or pass them here.
 */
export function AppShellProvider(props: AppShellProviderProps) {
  const { linkComponent, Link, currentPath, navigate, can, locale, messages, dir, timeZone, currency, Image, media, ...rest } = props;
  const bridge = linkComponent ?? Link ?? currentPath ?? navigate ?? can ?? locale ?? messages ?? dir ?? timeZone ?? currency ?? Image ?? media;
  const inner = <AppShellState {...rest} />;
  if (bridge === undefined) return inner;
  return (
    <VamosProvider Link={linkComponent ?? Link} currentPath={currentPath} navigate={navigate} can={can} locale={locale} messages={messages} dir={dir} timeZone={timeZone} currency={currency} Image={Image} media={media}>
      {inner}
    </VamosProvider>
  );
}

function AppShellState({
  apps: allApps,
  activeApp: activeAppId,
  sharedNav = [],
  commands,
  features,
  defaultCollapsed,
  onCollapsedChange,
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
  shortcuts = true,
  children,
}: Omit<AppShellProviderProps, "linkComponent" | keyof VamosProviderProps> & { children: React.ReactNode }) {
  const can = useCan();
  const { currentPath, navigate } = useNavigation();
  const apps = React.useMemo(() => allApps.filter((a) => !a.permission || can(a.permission)), [allApps, can]);
  const routeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : appFor(apps, currentPath);
  const [lastApp, setLastApp] = React.useState<string | undefined>(routeApp?.id);
  React.useEffect(() => {
    if (routeApp) setLastApp(routeApp.id);
  }, [routeApp]);
  const activeApp = routeApp ?? apps.find((a) => a.id === lastApp) ?? apps[0];

  const [preference, setPreference] = React.useState<boolean | undefined>(defaultCollapsed);
  const setCollapsed = React.useCallback(
    (v: boolean) => {
      setPreference(v);
      if (onCollapsedChange) onCollapsedChange(v);
      else writeCookie(v);
    },
    [onCollapsedChange],
  );
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  React.useEffect(() => setMobileNavOpen(false), [currentPath]);

  const nav = React.useMemo(() => filterNav(activeApp?.nav ?? [], { can, features }), [activeApp, can, features]);
  const visibleSharedNav = React.useMemo(() => filterNav(sharedNav, { can, features }), [sharedNav, can, features]);
  const trail = React.useMemo(() => resolveActive([...nav, ...visibleSharedNav], currentPath).trail, [nav, visibleSharedNav, currentPath]);

  const switchApp = React.useCallback(
    (id: string) => {
      const a = apps.find((x) => x.id === id);
      if (!a) return;
      setLastApp(id);
      if (isAbsoluteHref(a.href) && typeof window !== "undefined") window.location.assign(a.href);
      else navigate(a.href);
    },
    [apps, navigate],
  );

  const [registry] = React.useState(() => createCommandRegistry());
  // Static record sources of every app stay registered.
  React.useEffect(() => {
    const off = apps.flatMap((a) => a.sources ?? []).map((s) => registry.registerSource(s));
    return () => off.forEach((f) => f());
  }, [apps, registry]);

  const value = React.useMemo<AppShellContextValue>(
    () => ({
      apps,
      activeApp,
      sharedNav,
      nav,
      visibleSharedNav,
      features,
      trail,
      preference,
      setCollapsed,
      mobileNavOpen,
      setMobileNavOpen,
      switchApp,
      can,
      workspaces,
      activeWorkspace,
      onWorkspaceChange,
      registry,
      commands,
      currentPath,
      shortcuts,
    }),
    [apps, activeApp, sharedNav, nav, visibleSharedNav, features, trail, preference, setCollapsed, mobileNavOpen, switchApp, can, workspaces, activeWorkspace, onWorkspaceChange, registry, commands, currentPath, shortcuts],
  );

  return (
    <AppShellContext.Provider value={value}>
      <CommandProvider registry={registry} shortcut={shortcuts ? "mod+k" : false}>
        <ShellCommands />
        {children}
      </CommandProvider>
    </AppShellContext.Provider>
  );
}

/** Registers app commands, "Go to" commands from every accessible app's nav, and app switching. */
function ShellCommands() {
  const ctx = React.useContext(AppShellContext)!;
  const t = useLabels("appShell", appShellLabels);
  const { apps, activeApp, sharedNav, can, features, switchApp, commands } = ctx;
  const multi = apps.length > 1;

  const goTo = React.useMemo<CommandAction[]>(() => {
    const out: CommandAction[] = [];
    for (const a of apps) {
      for (const it of flattenNav(filterNav(a.nav, { can, features }))) {
        out.push({
          id: `nav.${a.id}.${it.id}`,
          title: it.trail.join(" › "),
          group: t("goTo"),
          href: it.href,
          icon: it.icon,
          keywords: [...(it.keywords ?? []), ...(it.group ? [it.group] : []), a.name],
          app: multi ? a.name : undefined,
          priority: a.id === activeApp?.id ? 1 : 0,
        });
      }
    }
    for (const it of flattenNav(filterNav(sharedNav, { can, features }))) {
      out.push({ id: `nav.shared.${it.id}`, title: it.trail.join(" › "), group: t("goTo"), href: it.href, icon: it.icon, keywords: it.keywords, priority: 0.5 });
    }
    if (multi) {
      for (const a of apps) {
        if (a.id === activeApp?.id) continue;
        out.push({ id: `app.switch.${a.id}`, title: t("switchTo", { app: a.name }), subtitle: a.description, group: t("apps"), icon: a.icon as CommandAction["icon"], perform: () => switchApp(a.id) });
      }
    }
    return out;
  }, [apps, activeApp, sharedNav, can, features, multi, switchApp, t]);

  useRegisterCommands(goTo, [goTo]);
  useRegisterCommands(React.useMemo(() => (activeApp?.commands ?? []).map((c) => ({ ...c, app: c.app ?? (multi ? activeApp?.name : undefined) })), [activeApp, multi]), [activeApp]);
  useRegisterCommands(commands ?? [], [commands]);
  return null;
}

/**
 * The shell state: active app, nav, rail, mobile nav, app switching. Throws outside `AppShellProvider`.
 */
export function useAppShell() {
  const ctx = React.useContext(AppShellContext);
  const collapsed = React.useContext(CollapsedContext);
  if (!ctx) throw new Error("useAppShell must be used inside <AppShellProvider>.");
  return {
    activeApp: ctx.activeApp,
    apps: ctx.apps,
    nav: ctx.nav,
    sharedNav: ctx.visibleSharedNav,
    collapsed,
    setCollapsed: ctx.setCollapsed,
    openMobileNav: () => ctx.setMobileNavOpen(true),
    closeMobileNav: () => ctx.setMobileNavOpen(false),
    mobileNavOpen: ctx.mobileNavOpen,
    trail: ctx.trail,
    can: ctx.can,
    switchApp: ctx.switchApp,
  };
}

/** `true` inside an `AppShellProvider`. */
export function useInAppShell(): boolean {
  return React.useContext(AppShellContext) !== null;
}

/** Breadcrumb built from the shell's active trail (used by `PageHeader breadcrumb="auto"`). */
export function AppShellBreadcrumb({ includeApp = true, className }: { includeApp?: boolean; className?: string }) {
  const ctx = React.useContext(AppShellContext);
  if (!ctx || !ctx.trail.length) return null;
  const crumbs = navTrailItems([...ctx.nav, ...ctx.visibleSharedNav], ctx.trail);
  // An "All posts" index child duplicates its parent: keep one.
  const items = crumbs.filter((c, i) => !(i > 0 && c.href && c.href === crumbs[i - 1]!.href));
  const all = [...(includeApp && ctx.apps.length > 1 && ctx.activeApp ? [{ label: ctx.activeApp.name, href: ctx.activeApp.href }] : []), ...items.map((c) => ({ label: c.label, href: c.href }))];
  // A one-item trail only repeats the page title.
  if (all.length < 2) return null;
  return <Breadcrumb size="sm" items={all} className={className} />;
}

/* ------------------------------------------------------------------ */
/* AppShell layout                                                     */
/* ------------------------------------------------------------------ */

export interface AppShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "dir"> {
  /** Replace the default sidebar (AppSwitcher + SidebarNav + shared nav + collapse). `false` = none. */
  sidebar?: React.ReactNode | false;
  /** Replace the default top bar. `false` = none. */
  topbar?: React.ReactNode | false;
  /** Slot above the top bar (offline, trial, maintenance banner). */
  banner?: React.ReactNode;
  /** Notification center in the default top bar (`<NotificationCenter adapter={…} />`). */
  notifications?: React.ReactNode;
  /** Extra default top-bar actions (theme switch, help). */
  actions?: React.ReactNode;
  /** User menu in the default top bar. */
  user?: UserMenuProps;
  /** Live sidebar badges by nav item id. */
  badges?: Record<string, BadgeSpec | undefined>;
  /** Extra sidebar footer content (above the collapse button). */
  sidebarFooter?: React.ReactNode;
  /** Footer link in the app switcher ("Manage apps & modules…"). */
  appSwitcherFooter?: React.ReactNode;
  /** `sidebar` (default) or `topnav` (portal-style: top-level links in the top bar, no sidebar). */
  layout?: "sidebar" | "topnav";
  /** Permissions still loading: sidebar skeleton. */
  loading?: boolean;
  /** Move focus to `main` and announce the page title after route changes. Default `true`. */
  announceRouteChanges?: boolean;
  /** `screen` fills the viewport (default); `fill` fills the parent (embedded previews). */
  height?: "screen" | "fill";
  /** Mount the ⌘K palette, Toaster and confirm dialog. Default `true`. */
  globals?: boolean;
  labels?: Partial<AppShellLabels>;
}

/**
 * The one shell every app runs in: sidebar, top bar, content, skip link, mobile sheet nav, ⌘K
 * palette, toasts and confirm. Switching apps swaps the nav, commands, "New" menu, links and
 * accent; everything else stays. Use inside `AppShellProvider`.
 *
 * ```tsx
 * <AppShellProvider apps={[siteApp, crmApp]} sharedNav={shared} currentPath={pathname} linkComponent={Link} navigate={router.push}>
 *   <AppShell user={{ name: "Ada Lovelace", email: "ada@northwind.io", items: account }} notifications={<NotificationCenter adapter={inbox} />}>
 *     {children}
 *   </AppShell>
 * </AppShellProvider>
 * ```
 */
export const AppShell = /*#__PURE__*/ React.forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  { sidebar, topbar, banner, notifications, actions, user, badges, sidebarFooter, appSwitcherFooter, layout = "sidebar", loading, announceRouteChanges = true, height = "screen", globals = true, labels, className, children, ...props },
  ref,
) {
  const ctx = React.useContext(AppShellContext);
  if (!ctx) throw new Error("AppShell must be used inside <AppShellProvider>.");
  const t = useLabels("appShell", appShellLabels, labels);
  const { ref: measureRef, width } = useContainerWidth<HTMLDivElement>();
  const mainRef = React.useRef<HTMLElement>(null);
  const columnRef = React.useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const { activeApp, currentPath } = ctx;

  // 768–1279px: rail unless the user chose otherwise.
  const collapsed = ctx.preference ?? (width !== undefined && width >= 768 && width < 1280);

  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!announceRouteChanges) return;
    columnRef.current?.scrollTo?.({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
    const id = setTimeout(() => setAnnouncement(typeof document !== "undefined" ? document.title : ""), 60);
    return () => clearTimeout(id);
  }, [currentPath, announceRouteChanges]);

  const shellBridge = React.useMemo(() => ({ openMobileNav: () => ctx.setMobileNavOpen(true), mobileNavOpen: ctx.mobileNavOpen }), [ctx]);

  if (!ctx.apps.length || !activeApp) {
    return (
      <div ref={ref} className={cn("grid place-items-center bg-scene p-6", height === "screen" ? "min-h-dvh" : "h-full", className)} {...props}>
        <EmptyState kind="forbidden" size="lg" as="h2" title={t("noApps")} description={t("noAppsDescription")} />
      </div>
    );
  }

  const sidebarBody = (mode: "desktop" | "mobile") => (
    <>
      <SidebarHeader>
        <AppSwitcher
          apps={ctx.apps.map((a) => ({ id: a.id, name: a.name, description: a.description, icon: a.icon, href: a.href }))}
          activeApp={activeApp.id}
          onSelect={ctx.switchApp}
          workspaces={ctx.workspaces}
          activeWorkspace={ctx.activeWorkspace}
          onWorkspaceChange={ctx.onWorkspaceChange}
          footer={appSwitcherFooter}
        />
      </SidebarHeader>
      <SidebarContent aria-label={t("appMenu", { app: activeApp.name })}>
        {loading ? <SidebarSkeleton /> : <SidebarNav items={ctx.nav} badges={badges} trail={ctx.trail} />}
      </SidebarContent>
      {sidebarFooter ? <SidebarFooter>{sidebarFooter}</SidebarFooter> : null}
      {ctx.visibleSharedNav.length && !loading ? (
        <SidebarFooter>
          <SidebarNav aria-label={t("workspace")} items={ctx.visibleSharedNav} badges={badges} trail={ctx.trail} />
        </SidebarFooter>
      ) : null}
      {mode === "desktop" ? (
        <SidebarFooter>
          <SidebarCollapseButton />
        </SidebarFooter>
      ) : null}
    </>
  );

  const defaultSidebar = (
    <Sidebar collapsed={collapsed} onCollapsedChange={ctx.setCollapsed} shortcut={ctx.shortcuts ? "mod+\\" : false} className="h-full">
      {sidebarBody("desktop")}
    </Sidebar>
  );

  const links = activeApp.links ?? [];
  const defaultTopbar = (
    <TopBar scrollTarget={columnRef}>
      <TopBarStart>
        <TopBarMenuButton />
        {layout === "topnav" ? <span className="shrink-0 font-display text-[length:calc(19px*var(--display-scale))] leading-none text-fg">{activeApp.name}</span> : null}
        {layout === "topnav" ? <TopNavLinks nav={ctx.nav} trail={ctx.trail} label={t("appMenu", { app: activeApp.name })} /> : null}
      </TopBarStart>
      <TopBarSearch />
      <TopBarSpacer />
      <TopBarActions>
        {actions}
        {actions && (links.length || notifications || activeApp.newMenu || user) ? <TopBarSeparator /> : null}
        {links.map((l) => {
          const Icon = l.icon;
          const ext = l.external ?? isAbsoluteHref(l.href);
          return (
            <Button key={l.id} asChild variant="ghost" size="sm" className="@max-[640px]/topbar:hidden">
              <SmartLink href={l.href} external={ext}>
                {Icon ? <Icon aria-hidden /> : ext ? <ArrowUpRight aria-hidden /> : null}
                {l.label}
              </SmartLink>
            </Button>
          );
        })}
        {notifications}
        {activeApp.newMenu?.length ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="primary" size="sm">
                <Plus aria-hidden />
                <span className="@max-[480px]/topbar:sr-only">{t("newItem")}</span>
                <ChevronDown aria-hidden className="-me-0.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuEntries items={activeApp.newMenu} />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {user ? <UserMenu {...user} /> : null}
      </TopBarActions>
    </TopBar>
  );

  const showSidebar = layout === "sidebar" && sidebar !== false;

  const shell = (
    <ThemeScope
      accent={activeApp.accent}
      className={cn("relative w-full overflow-hidden bg-transparent", height === "screen" ? "h-dvh" : "h-full")}
    >
      <TopBarShellContext.Provider value={shellBridge}>
        <CollapsedContext.Provider value={collapsed}>
          <div
            ref={(node) => {
              measureRef(node);
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            data-slot="app-shell"
            data-app={activeApp.id}
            data-layout={layout}
            data-collapsed={collapsed ? "" : undefined}
            className={cn("vui-app-shell flex h-full w-full min-w-0", className)}
            {...props}
          >
            <a href="#vui-main" className="vui-skip-link rounded-ui-sm bg-fg px-3 py-2 text-[13px] font-medium text-scene focus-ring" onClick={(e) => {
              e.preventDefault();
              mainRef.current?.focus();
            }}>
              {t("skip")}
            </a>
            {showSidebar ? <div className="relative z-(--z-nav) h-full shrink-0 @max-[767px]/shell:hidden">{sidebar ?? defaultSidebar}</div> : null}
            <div ref={columnRef} data-slot="app-shell-column" className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
              {banner}
              {topbar === false ? null : (topbar ?? defaultTopbar)}
              <main
                ref={mainRef}
                id="vui-main"
                tabIndex={-1}
                data-slot="app-shell-main"
                className="min-w-0 flex-1 px-4 py-6 outline-none [--page-px:1rem] @min-[640px]/shell:px-6 @min-[640px]/shell:py-7 @min-[640px]/shell:[--page-px:1.5rem] @min-[1024px]/shell:px-8 @min-[1024px]/shell:[--page-px:2rem]"
              >
                {children}
              </main>
            </div>
          </div>
          {(showSidebar || layout === "topnav") && sidebar !== false ? (
            <Sheet open={ctx.mobileNavOpen} onOpenChange={ctx.setMobileNavOpen}>
              <SheetContent side="start" size="sm" hideClose className="max-w-[86vw] border-0 p-0">
                <DialogTitle className="sr-only">{t("navigation")}</DialogTitle>
                <Sidebar mode="mobile" onNavigate={() => ctx.setMobileNavOpen(false)} className="h-full">
                  {sidebarBody("mobile")}
                </Sidebar>
              </SheetContent>
            </Sheet>
          ) : null}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {announcement ? t("pageChanged", { title: announcement }) : ""}
          </div>
        </CollapsedContext.Provider>
      </TopBarShellContext.Provider>
    </ThemeScope>
  );

  if (!globals) return shell;
  return (
    <TooltipProvider>
      <ConfirmProvider>
        {shell}
        <CommandPalette />
        <Toaster />
      </ConfirmProvider>
    </TooltipProvider>
  );
});

function TopNavLinks({ nav, trail, label }: { nav: NavNode[]; trail: string[]; label: string }) {
  const Link = useLink();
  return (
    <nav aria-label={label} className="ms-1 flex min-w-0 items-center gap-0.5 overflow-x-auto scrollbar-none @max-[767px]/shell:hidden">
      {navItems(nav)
        .filter((it) => it.href)
        .map((it) => {
          const active = trail[0] === it.id;
          return (
            <Link
              key={it.id}
              href={it.href!}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-ui-sm px-2.5 py-1.5 text-[13.5px] transition-colors focus-ring",
                active ? "bg-selected font-medium text-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
              )}
            >
              {it.label}
            </Link>
          );
        })}
    </nav>
  );
}
