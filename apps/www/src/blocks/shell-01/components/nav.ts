import {
  LayoutDashboard, FileText, Files, Image, MessageSquare, Inbox, Menu, Paintbrush,
  Globe, Handshake, Users, Briefcase, Settings, Blocks, ShieldCheck,
  KanbanSquare, Contact, Building2, CalendarClock, ReceiptText,
  CalendarDays, Clock, Network, UserRound, FolderKanban, ListChecks, Timer, HeartHandshake, Receipt,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: { label: string; href: string }[];
}
/** A menu entry: a link, or a small section heading. */
export type NavEntry = NavLink | { section: string };

export interface AppDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Every route of the app lives under this prefix. */
  base: string;
  nav: NavEntry[];
}

/**
 * Apps share one shell. Each app brings its own menu; the shared menu at the
 * bottom (users, settings, kit) is the same everywhere. Enabling/disabling an
 * app is what "Modules" means.
 */
export const apps: AppDef[] = [
  {
    id: "site", name: "Site", description: "Content & website", icon: Globe, base: "/site",
    nav: [
      { label: "Dashboard", href: "/site", icon: LayoutDashboard },
      { section: "Content" },
      { label: "Posts", href: "/site/posts", icon: FileText, children: [
        { label: "All posts", href: "/site/posts" }, { label: "Add new", href: "/site/posts/new" },
        { label: "Categories", href: "/site/posts/categories" }, { label: "Tags", href: "/site/posts/tags" },
      ] },
      { label: "Pages", href: "/site/pages", icon: Files, children: [{ label: "All pages", href: "/site/pages" }, { label: "Add new", href: "/site/pages/new" }] },
      { label: "Media", href: "/site/media", icon: Image, children: [{ label: "Library", href: "/site/media" }, { label: "Upload", href: "/site/media/upload" }] },
      { section: "Engagement" },
      { label: "Comments", href: "/site/comments", icon: MessageSquare, badge: "4" },
      { label: "Forms", href: "/site/forms", icon: Inbox, badge: "12" },
      { section: "Design" },
      { label: "Menus", href: "/site/menus", icon: Menu },
      { label: "Theme", href: "/site/theme", icon: Paintbrush },
    ],
  },
  {
    id: "crm", name: "CRM", description: "Customers & sales", icon: Handshake, base: "/crm",
    nav: [
      { label: "Dashboard", href: "/crm", icon: LayoutDashboard },
      { section: "Sales" },
      { label: "Pipeline", href: "/crm/pipeline", icon: KanbanSquare, badge: "7" },
      { label: "Quotes", href: "/crm/quotes", icon: ReceiptText, children: [{ label: "All quotes", href: "/crm/quotes" }, { label: "New quote", href: "/crm/quotes/new" }] },
      { section: "Customers" },
      { label: "Contacts", href: "/crm/contacts", icon: Contact },
      { label: "Companies", href: "/crm/companies", icon: Building2 },
      { label: "Activities", href: "/crm/activities", icon: CalendarClock },
    ],
  },
  {
    id: "people", name: "People", description: "Team & HR", icon: Users, base: "/people",
    nav: [
      { label: "Dashboard", href: "/people", icon: LayoutDashboard },
      { section: "Team" },
      { label: "Employees", href: "/people/employees", icon: UserRound },
      { label: "Org chart", href: "/people/org", icon: Network },
      { section: "Time off & shifts" },
      { label: "Leave", href: "/people/leave", icon: CalendarDays, badge: "3", children: [
        { label: "Requests", href: "/people/leave" }, { label: "Calendar", href: "/people/leave/calendar" }, { label: "Policies", href: "/people/leave/policies" },
      ] },
      { label: "Shifts", href: "/people/shifts", icon: Clock },
    ],
  },
  {
    id: "work", name: "Work", description: "Projects & partners", icon: Briefcase, base: "/work",
    nav: [
      { label: "Dashboard", href: "/work", icon: LayoutDashboard },
      { section: "Delivery" },
      { label: "Projects", href: "/work/projects", icon: FolderKanban },
      { label: "Tasks", href: "/work/tasks", icon: ListChecks },
      { label: "Timesheets", href: "/work/time", icon: Timer },
      { section: "Partners & billing" },
      { label: "Partners", href: "/work/partners", icon: HeartHandshake },
      { label: "Invoices", href: "/work/invoices", icon: Receipt },
    ],
  },
];

/** Same in every app. */
export const sharedNav: NavEntry[] = [
  { label: "Users & roles", href: "/users", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings, children: [
    { label: "General", href: "/settings" }, { label: "Apps & modules", href: "/settings/apps" },
    { label: "Language & formats", href: "/settings/locale" }, { label: "Appearance", href: "/settings/appearance" },
  ] },
  { label: "Component kit", href: "/components", icon: Blocks },
];

export const appForPath = (path: string) => apps.find((a) => path === a.base || path.startsWith(a.base + "/"));
