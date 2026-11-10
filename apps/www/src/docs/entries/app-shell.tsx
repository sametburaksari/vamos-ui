import { ex, type DocEntry } from "../types";
import AppShellDemo from "../examples/app-shell/demo";
import AppShellMultiApp from "../examples/app-shell/multi-app";
import AppShellWorkspaces from "../examples/app-shell/workspaces";
import AppShellMobile from "../examples/app-shell/mobile";
import AppShellNextRouter from "../examples/app-shell/next-router";
import AppShellTopnav from "../examples/app-shell/topnav";

const entry: DocEntry = {
  slug: "app-shell",
  title: "App shell",
  group: "Page layouts",
  description:
    "The one shell every app runs on — CMS, CRM, HR, PRM — with a different app definition. Sidebar, top bar, content, skip link, mobile sheet nav, a ⌘K palette with “Go to” commands derived from every app's nav, toasts and confirm. Router-agnostic.",
  source: ["components/app-shell.tsx", "components/sidebar.tsx", "components/top-bar.tsx", "components/command.tsx", "lib/nav.ts", "styles/navigation.css"],
  basedOn: "Sidebar, Top bar, Command, Sheet, Toast",
  usage: `"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppShellProvider, AppShell, NotificationCenter, type AppDefinition } from "@vamos-cms/ui";

const site: AppDefinition = { id: "site", name: "Site", href: "/site", icon: Globe, nav: siteNav, links: [{ id: "view", label: "View site", href: "https://example.com" }] };
const crm: AppDefinition = { id: "crm", name: "CRM", href: "/crm", icon: Handshake, nav: crmNav, accent: "ocean" };

export function Shell({ defaultCollapsed, children }) {
  const router = useRouter();
  return (
    <AppShellProvider apps={[site, crm]} sharedNav={shared} linkComponent={Link} currentPath={usePathname()} navigate={router.push} defaultCollapsed={defaultCollapsed}>
      <AppShell user={{ name: "Ada Lovelace", email: "ada@northwind.io", items: account }} notifications={<NotificationCenter adapter={inbox} />}>
        {children}
      </AppShell>
    </AppShellProvider>
  );
}`,
  demo: ex("demo", "Demo", "app-shell/demo.tsx", AppShellDemo),
  examples: [
    ex("multi-app", "Multi-app", "app-shell/multi-app.tsx", AppShellMultiApp, "Switching apps swaps the nav, commands, “New ▾” menu, app links and accent. Top bar, user menu, notifications and ⌘K stay. Apps a user can't open (permission) never appear."),
    ex("workspaces", "Workspaces", "app-shell/workspaces.tsx", AppShellWorkspaces, "A workspace/tenant switcher shares the app switcher's panel for multi-company setups."),
    ex("mobile", "Mobile", "app-shell/mobile.tsx", AppShellMobile, "The shell responds to its own width: below 768px the sidebar moves into a start-side sheet with accordion levels; 768–1279px defaults to the rail when the user has no preference."),
    ex("next-router", "Next.js router", "app-shell/next-router.tsx", AppShellNextRouter, "Pass Link, usePathname() and router.push. Read the ui-sidebar cookie in the server layout with parseSidebarCookie and pass defaultCollapsed to avoid a flash. These links navigate this site."),
    ex("topnav", "Top navigation (portal)", "app-shell/topnav.tsx", AppShellTopnav, "layout=\"topnav\" puts top-level links in the top bar and drops the sidebar — for client portals."),
  ],
  api: [
    { name: "AppShellProvider", props: [
      { name: "apps", type: "AppDefinition[]", description: "Every app on the shell. Filtered by permission." },
      { name: "activeApp", type: "string", description: "Default: the app whose base/href is the longest prefix of currentPath, else the last one used." },
      { name: "sharedNav", type: "NavNode[]", description: "Bottom menu shared by every app (users, settings)." },
      { name: "commands", type: "CommandAction[]", description: "Commands available in every app." },
      { name: "linkComponent / currentPath / navigate / can", type: "VamosProvider bridge", description: "Router and permission pieces; omit when a VamosProvider above sets them." },
      { name: "features", type: "Record<string, boolean>", description: "Feature flags for nav items." },
      { name: "defaultCollapsed", type: "boolean", description: "Rail preference from the ui-sidebar cookie; undefined = follow the width." },
      { name: "onCollapsedChange", type: "(v: boolean) => void", default: "writes the cookie", description: "Persist the preference elsewhere." },
      { name: "workspaces / activeWorkspace / onWorkspaceChange", type: "…", description: "Tenant switcher." },
      { name: "shortcuts", type: "boolean", default: "true", description: "mod+k (palette) and mod+\\ (rail). Off for embedded shells." },
      { name: "locale / messages / dir", type: "…", description: "Passed to the LocaleProvider." },
    ] },
    { name: "AppShell", props: [
      { name: "user", type: "UserMenuProps", description: "User menu in the default top bar." },
      { name: "notifications", type: "ReactNode", description: "<NotificationCenter adapter={…} /> slot." },
      { name: "actions", type: "ReactNode", description: "Extra top-bar actions (theme, help)." },
      { name: "badges", type: "Record<string, BadgeSpec>", description: "Live sidebar badges by nav id." },
      { name: "banner", type: "ReactNode", description: "Slot above the top bar (offline, trial)." },
      { name: "sidebar / topbar", type: "ReactNode | false", description: "Replace or remove the defaults." },
      { name: "sidebarFooter / appSwitcherFooter", type: "ReactNode", description: "Extra sidebar content." },
      { name: "layout", type: '"sidebar" | "topnav"', default: '"sidebar"', description: "Portal-style top navigation." },
      { name: "loading", type: "boolean", default: "false", description: "Sidebar skeleton while permissions load." },
      { name: "announceRouteChanges", type: "boolean", default: "true", description: "Focus main and announce the page title after navigation." },
      { name: "height", type: '"screen" | "fill"', default: '"screen"', description: "fill: fill the parent (embedded previews)." },
      { name: "globals", type: "boolean", default: "true", description: "Mount the ⌘K palette, Toaster, ConfirmProvider and TooltipProvider." },
    ] },
    { name: "AppDefinition", props: [
      { name: "id / name / description / icon", type: "string / ReactNode", description: "Shown in the app switcher and as the ⌘K app badge." },
      { name: "href / base", type: "string", description: "App home and its path prefix. An absolute href does a full navigation (multi-zone)." },
      { name: "accent", type: "string", description: "data-accent while active (CRM = ocean)." },
      { name: "nav", type: "NavNode[]", description: "The app's sidebar; also ⌘K “Go to”." },
      { name: "commands / sources", type: "CommandAction[] / CommandSource[]", description: "⌘K commands (active app) and record search (always)." },
      { name: "newMenu", type: "MenuEntry[]", description: "Top bar “New ▾”." },
      { name: "links", type: "{ id, label, href, icon?, external? }[]", description: "Top-bar links for this app only — “View site” in the Site app." },
      { name: "permission", type: "string", description: "Hide the app entirely." },
    ] },
    { name: "useAppShell()", props: [
      { name: "activeApp / apps / nav / sharedNav", type: "…", description: "Current state (nav already filtered)." },
      { name: "collapsed / setCollapsed", type: "boolean / (v) => void", description: "Rail." },
      { name: "openMobileNav / closeMobileNav / mobileNavOpen", type: "…", description: "Mobile sheet." },
      { name: "trail", type: "string[]", description: "Active nav trail (Breadcrumb, Page header)." },
      { name: "switchApp(id)", type: "void", description: "Navigate to another app." },
    ] },
  ],
  notes: [
    "Landmarks: banner (top bar), navigation (sidebar), main (skip-link target, focused after route changes). The skip link is the first focusable element.",
    "App definitions contain components and functions, so keep them in a client module; compute defaultCollapsed and activeApp in the server layout to avoid a hydration flash.",
    "Glass: the shell owns the two permanent blurs (sidebar, top bar); flyouts and nested layers never blur.",
  ],
  covers: ["App shell"],
};

export default entry;
