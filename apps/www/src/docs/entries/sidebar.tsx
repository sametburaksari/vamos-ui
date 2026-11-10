import { ex, type DocEntry } from "../types";
import SidebarDemo from "../examples/sidebar/demo";
import SidebarComposed from "../examples/sidebar/composed";
import SidebarCollapsed from "../examples/sidebar/collapsed";
import SidebarNested from "../examples/sidebar/nested";
import SidebarBadges from "../examples/sidebar/badges";
import SidebarPermissions from "../examples/sidebar/permissions";
import SidebarSurface from "../examples/sidebar/surface";

const entry: DocEntry = {
  slug: "sidebar",
  title: "Sidebar",
  group: "Navigation",
  description:
    "The primary app navigation, dark in both themes. The active section's submenu stays open in place, other sections open as flyouts, and the rail turns every submenu into a flyout. Data-driven from one nav config that also feeds Breadcrumb, Page header and ⌘K — or composed by hand with identical DOM.",
  source: ["components/sidebar.tsx", "lib/nav.ts", "styles/navigation.css"],
  basedOn: "Radix Popover (flyouts), Radix Collapsible, Tooltip",
  usage: `import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarNav, SidebarCollapseButton, AppSwitcher, type NavNode } from "@vamos-ui/react";

const nav: NavNode[] = [
  { id: "dashboard", label: "Dashboard", href: "/site", icon: LayoutDashboard },
  { type: "group", id: "content", label: "Content", items: [
    { id: "posts", label: "Posts", href: "/site/posts", icon: FileText, children: [
      { id: "posts.all", label: "All posts", href: "/site/posts" },
      { id: "posts.categories", label: "Categories", href: "/site/posts/categories" },
    ] },
  ] },
];

// Link + currentPath come from VamosProvider (router-agnostic).
<Sidebar>
  <SidebarHeader><AppSwitcher apps={apps} activeApp="site" /></SidebarHeader>
  <SidebarContent><SidebarNav items={nav} badges={{ comments: 4 }} /></SidebarContent>
  <SidebarFooter><SidebarCollapseButton /></SidebarFooter>
</Sidebar>`,
  demo: ex("demo", "Demo", "sidebar/demo.tsx", SidebarDemo),
  examples: [
    ex("composed", "Composed by hand", "sidebar/composed.tsx", SidebarComposed, "SidebarGroup, SidebarItem and SidebarSubItem are the parts SidebarNav renders. Without a nav config an item is active when its href (or a child's) matches the current path; pass active to override."),
    ex("collapsed", "Rail", "sidebar/collapsed.tsx", SidebarCollapsed, "Collapsed, every submenu opens as a flyout headed by the section name, leaves get a tooltip and badges become dots. In the App shell mod+\\ toggles it (never mod+b — that is Bold in editors) and the choice is stored in the ui-sidebar cookie."),
    ex("nested", "Three levels", "sidebar/nested.tsx", SidebarNested, "Level 3 is a collapsible inline and a heading plus list inside a flyout. Items without href only open their children. A string disabled shows a reason badge."),
    ex("badges", "Live badges", "sidebar/badges.tsx", SidebarBadges, "The badges map is separate from the config. Counts over 99 show 99+, the rail shows a dot, and the text joins the link's name: “Comments, 4 awaiting moderation”."),
    ex("permissions", "Role-based menu", "sidebar/permissions.tsx", SidebarPermissions, "filterNav runs before render, so hidden items aren't in the DOM. It is UI only: enforce every permission on the server."),
    ex("surface", "Surface variant (client portal)", "sidebar/surface.tsx", SidebarSurface, "variant=\"surface\" takes the content background — for client portals and websites. With one app the switcher is a static title."),
  ],
  api: [
    { name: "Sidebar", props: [
      { name: "variant", type: '"nav" | "surface"', default: '"nav"', description: "Dark navigation in both themes, or the content surface." },
      { name: "collapsed / defaultCollapsed / onCollapsedChange", type: "boolean", default: "false", description: "Rail mode." },
      { name: "collapsible", type: "boolean", default: "true", description: "Allow the rail." },
      { name: "mode", type: '"desktop" | "mobile"', default: '"desktop"', description: "mobile: always expanded, accordion levels (App shell's sheet)." },
      { name: "shortcut", type: "string | false", default: "false", description: 'Toggle shortcut, e.g. "mod+\\". App shell turns it on.' },
      { name: "onNavigate", type: "() => void", description: "Called after a link is followed." },
      { name: "labels", type: "Partial<SidebarLabels>", description: "Override built-in strings (sidebar.*)." },
    ] },
    { name: "SidebarNav", props: [
      { name: "items", type: "NavNode[]", description: "Items, groups ({ type: \"group\" }) and separators." },
      { name: "badges", type: "Record<string, BadgeSpec>", description: "Live counts by item id: { comments: 4, forms: { count: 12, tone: \"danger\" } }." },
      { name: "features", type: "Record<string, boolean>", description: "Feature flags for items with feature." },
      { name: "trail", type: "string[]", description: "Active trail override; default resolveActive(items, currentPath)." },
      { name: "aria-label", type: "string", description: "Wrap in its own <nav> (a second menu in the footer)." },
    ] },
    { name: "NavItem", props: [
      { name: "id", type: "string", description: "Stable key for badges, the active trail and ⌘K." },
      { name: "label / href / icon", type: "string / string / LucideIcon", description: "No href: a parent that only opens its children." },
      { name: "children", type: "NavItem[]", description: "Up to 3 levels." },
      { name: "match", type: "string[] | (path) => boolean", description: 'Extra active patterns, "/posts/*" = any child path.' },
      { name: "permission", type: "string | string[]", description: "Hidden unless can() — UI only." },
      { name: "feature", type: "string", description: "Hidden unless features[feature]." },
      { name: "external", type: "boolean", description: "New tab + ↗ (detected from absolute hrefs)." },
      { name: "keywords", type: "string[]", description: "Extra ⌘K search terms." },
      { name: "badge", type: "BadgeSpec", description: "Static badge: number, string or { count, tone, dot, label }." },
      { name: "disabled", type: "boolean | string", description: "A string is shown as the reason (\"Coming soon\")." },
    ] },
    { name: "SidebarItem / SidebarSubItem", props: [
      { name: "id", type: "string", description: "Matches badges and the trail in SidebarNav." },
      { name: "label / href / icon", type: "string", description: "icon on SidebarItem only." },
      { name: "badge / disabled / external", type: "BadgeSpec / boolean | string / boolean", description: "As in NavItem." },
      { name: "active", type: "boolean", description: "Force the active state." },
      { name: "children", type: "SidebarSubItem[]", description: "Submenu (inline when active, flyout otherwise)." },
    ] },
    { name: "SidebarGroup · SidebarHeader · SidebarContent · SidebarFooter · SidebarSeparator · SidebarCollapseButton · SidebarSkeleton", props: [
      { name: "label", type: "ReactNode", description: "SidebarGroup heading; a hairline in the rail." },
      { name: "aria-label", type: "string", default: '"Main navigation"', description: "SidebarContent is the <nav>." },
      { name: "rows", type: "number", default: "6", description: "SidebarSkeleton rows while permissions load." },
    ] },
    { name: "AppSwitcher", props: [
      { name: "apps", type: "{ id, name, description?, icon?, href }[]", description: "Every app the user can open. One app → static title." },
      { name: "activeApp", type: "string", description: "Current app id." },
      { name: "onSelect", type: "(id) => void", description: "Switch in place instead of following href." },
      { name: "workspaces / activeWorkspace / onWorkspaceChange", type: "…", description: "Tenant switcher in the same panel." },
      { name: "footer", type: "ReactNode", description: "Links under the list (“Manage apps & modules…”)." },
    ] },
    { name: "Helpers (lib/nav)", props: [
      { name: "filterNav(nodes, { can, features })", type: "NavNode[]", description: "Drops hidden items, empty groups and orphan separators." },
      { name: "resolveActive(nodes, path)", type: "{ trail, leafId }", description: "Longest-prefix match; / matches only exactly." },
      { name: "flattenNav(nodes)", type: "FlatNavItem[]", description: "Navigable items with label trails, for ⌘K and Breadcrumb." },
      { name: "parseSidebarCookie(value)", type: "boolean | undefined", description: "Read the ui-sidebar cookie on the server." },
    ] },
  ],
  notes: [
    "Keyboard: Tab moves between items (this is site navigation, not role=menu). → (← in RTL) opens a flyout and focuses its first link; ↑↓ move inside; Esc or ← closes and returns focus.",
    "Touch: the first tap on a section with a flyout opens it, the second follows the link.",
    "Flyouts are portalled, so the scrolling menu can't clip them, and never blur (an almost opaque --nav-popover instead).",
  ],
  covers: ["Sidebar (multi-level)"],
};

export default entry;
