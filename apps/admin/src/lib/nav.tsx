import {
  LayoutDashboard, FileText, Files, Image, MessageSquare, Inbox, Menu, Paintbrush,
  Globe, Handshake, Users, Briefcase, Settings, Blocks, ShieldCheck,
  KanbanSquare, Contact, Building2, CalendarClock, ReceiptText,
  CalendarDays, Clock, Network, UserRound, FolderKanban, ListChecks, Timer, HeartHandshake, Receipt,
  FilePlus2, UserPlus, Upload,
} from "lucide-react";
import type { AppDefinition, NavNode } from "@vamos-ui/react";

/**
 * Apps share one shell (the kit's AppShell). Each app brings its own menu; the shared menu at the
 * bottom (users, settings, kit) is the same everywhere. Enabling/disabling an app is what "Modules" means.
 * Imported only from client components: the definitions hold icon components.
 */
export const apps: AppDefinition[] = [
  {
    id: "site", name: "Site", description: "Content & website", icon: Globe, href: "/site",
    links: [{ id: "view-site", label: "View site", href: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vamos.ist", external: true }],
    newMenu: [
      { id: "new-post", label: "Post", icon: <FileText />, href: "/site/posts/new" },
      { id: "new-page", label: "Page", icon: <Files />, href: "/site/pages/new" },
      { id: "upload", label: "Upload media", icon: <Upload />, href: "/site/media/upload" },
    ],
    nav: [
      { id: "site.dashboard", label: "Dashboard", href: "/site", icon: LayoutDashboard },
      { type: "group", id: "site.content", label: "Content", items: [
        { id: "site.posts", label: "Posts", href: "/site/posts", icon: FileText, keywords: ["articles", "blog"], children: [
          { id: "site.posts.all", label: "All posts", href: "/site/posts" },
          { id: "site.posts.new", label: "Add new", href: "/site/posts/new" },
          { id: "site.posts.categories", label: "Categories", href: "/site/posts/categories" },
          { id: "site.posts.tags", label: "Tags", href: "/site/posts/tags" },
        ] },
        { id: "site.pages", label: "Pages", href: "/site/pages", icon: Files, children: [
          { id: "site.pages.all", label: "All pages", href: "/site/pages" },
          { id: "site.pages.new", label: "Add new", href: "/site/pages/new" },
        ] },
        { id: "site.media", label: "Media", href: "/site/media", icon: Image, children: [
          { id: "site.media.library", label: "Library", href: "/site/media" },
          { id: "site.media.upload", label: "Upload", href: "/site/media/upload" },
        ] },
      ] },
      { type: "group", id: "site.engagement", label: "Engagement", items: [
        { id: "site.comments", label: "Comments", href: "/site/comments", icon: MessageSquare },
        { id: "site.forms", label: "Forms", href: "/site/forms", icon: Inbox },
      ] },
      { type: "group", id: "site.design", label: "Design", items: [
        { id: "site.menus", label: "Menus", href: "/site/menus", icon: Menu },
        { id: "site.theme", label: "Theme", href: "/site/theme", icon: Paintbrush },
      ] },
    ],
  },
  {
    id: "crm", name: "CRM", description: "Customers & sales", icon: Handshake, href: "/crm",
    newMenu: [
      { id: "new-contact", label: "Contact", icon: <UserPlus />, href: "/crm/contacts/new" },
      { id: "new-quote", label: "Quote", icon: <ReceiptText />, href: "/crm/quotes/new" },
    ],
    nav: [
      { id: "crm.dashboard", label: "Dashboard", href: "/crm", icon: LayoutDashboard },
      { type: "group", id: "crm.sales", label: "Sales", items: [
        { id: "crm.pipeline", label: "Pipeline", href: "/crm/pipeline", icon: KanbanSquare, keywords: ["deals"] },
        { id: "crm.quotes", label: "Quotes", href: "/crm/quotes", icon: ReceiptText, children: [
          { id: "crm.quotes.all", label: "All quotes", href: "/crm/quotes" },
          { id: "crm.quotes.new", label: "New quote", href: "/crm/quotes/new" },
        ] },
      ] },
      { type: "group", id: "crm.customers", label: "Customers", items: [
        { id: "crm.contacts", label: "Contacts", href: "/crm/contacts", icon: Contact },
        { id: "crm.companies", label: "Companies", href: "/crm/companies", icon: Building2 },
        { id: "crm.activities", label: "Activities", href: "/crm/activities", icon: CalendarClock },
      ] },
    ],
  },
  {
    id: "people", name: "People", description: "Team & HR", icon: Users, href: "/people",
    newMenu: [{ id: "new-employee", label: "Employee", icon: <UserPlus />, href: "/people/employees/new" }],
    nav: [
      { id: "people.dashboard", label: "Dashboard", href: "/people", icon: LayoutDashboard },
      { type: "group", id: "people.team", label: "Team", items: [
        { id: "people.employees", label: "Employees", href: "/people/employees", icon: UserRound },
        { id: "people.org", label: "Org chart", href: "/people/org", icon: Network },
      ] },
      { type: "group", id: "people.time", label: "Time off & shifts", items: [
        { id: "people.leave", label: "Leave", href: "/people/leave", icon: CalendarDays, children: [
          { id: "people.leave.requests", label: "Requests", href: "/people/leave" },
          { id: "people.leave.calendar", label: "Calendar", href: "/people/leave/calendar" },
          { id: "people.leave.policies", label: "Policies", href: "/people/leave/policies" },
        ] },
        { id: "people.shifts", label: "Shifts", href: "/people/shifts", icon: Clock },
      ] },
    ],
  },
  {
    id: "work", name: "Work", description: "Projects & partners", icon: Briefcase, href: "/work",
    newMenu: [{ id: "new-project", label: "Project", icon: <FilePlus2 />, href: "/work/projects/new" }],
    nav: [
      { id: "work.dashboard", label: "Dashboard", href: "/work", icon: LayoutDashboard },
      { type: "group", id: "work.delivery", label: "Delivery", items: [
        { id: "work.projects", label: "Projects", href: "/work/projects", icon: FolderKanban },
        { id: "work.tasks", label: "Tasks", href: "/work/tasks", icon: ListChecks },
        { id: "work.time", label: "Timesheets", href: "/work/time", icon: Timer },
      ] },
      { type: "group", id: "work.partners", label: "Partners & billing", items: [
        { id: "work.partners", label: "Partners", href: "/work/partners", icon: HeartHandshake },
        { id: "work.invoices", label: "Invoices", href: "/work/invoices", icon: Receipt },
      ] },
    ],
  },
];

/** Same in every app. */
export const sharedNav: NavNode[] = [
  { id: "users", label: "Users & roles", href: "/users", icon: ShieldCheck },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings, children: [
    { id: "settings.general", label: "General", href: "/settings" },
    { id: "settings.apps", label: "Apps & modules", href: "/settings/apps" },
    { id: "settings.locale", label: "Language & formats", href: "/settings/locale" },
    { id: "settings.appearance", label: "Appearance", href: "/settings/appearance" },
  ] },
  { id: "kit", label: "Component kit", href: process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3200/docs/components", icon: Blocks, external: true },
];

/** Live sidebar counts (would come from the API). */
export const badges = { "site.comments": 4, "site.forms": { count: 12, tone: "danger" as const }, "crm.pipeline": 7, "people.leave": 3 };
