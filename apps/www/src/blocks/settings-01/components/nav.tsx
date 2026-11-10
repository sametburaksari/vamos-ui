import {
  Blocks, Briefcase, CalendarDays, Clock, Contact, FileText, Files, FolderKanban, Globe, HeartHandshake, Image, Inbox, KanbanSquare,
  LayoutDashboard, ListChecks, Menu, MessageSquare, Network, Paintbrush, Receipt, ReceiptText, Settings, ShieldCheck, Timer, UserRound, Users, Building2, CalendarClock,
} from "lucide-react";
import type { AppDefinition, NavNode } from "@vamos-ui/react";

/** Four apps in one workspace; each has its own sidebar menu. */
export const workspaceApps: AppDefinition[] = [
  {
    id: "site",
    name: "Site",
    description: "Content & website",
    icon: Globe,
    href: "/site",
    nav: [
      { id: "site.dashboard", label: "Dashboard", href: "/site", icon: LayoutDashboard },
      {
        type: "group",
        id: "site.content",
        label: "Content",
        items: [
          { id: "site.posts", label: "Posts", href: "/site/posts", icon: FileText },
          { id: "site.pages", label: "Pages", href: "/site/pages", icon: Files },
          { id: "site.media", label: "Media", href: "/site/media", icon: Image },
        ],
      },
      {
        type: "group",
        id: "site.engagement",
        label: "Engagement",
        items: [
          { id: "site.comments", label: "Comments", href: "/site/comments", icon: MessageSquare, badge: { count: 4 } },
          { id: "site.forms", label: "Forms", href: "/site/forms", icon: Inbox, badge: { count: 12 } },
        ],
      },
      {
        type: "group",
        id: "site.design",
        label: "Design",
        items: [
          { id: "site.menus", label: "Menus", href: "/site/menus", icon: Menu },
          { id: "site.theme", label: "Theme", href: "/site/theme", icon: Paintbrush },
        ],
      },
    ],
  },
  {
    id: "crm",
    name: "CRM",
    description: "Sales & clients",
    icon: KanbanSquare,
    href: "/crm",
    nav: [
      { id: "crm.dashboard", label: "Dashboard", href: "/crm", icon: LayoutDashboard },
      {
        type: "group",
        id: "crm.sales",
        label: "Sales",
        items: [
          { id: "crm.pipeline", label: "Pipeline", href: "/crm/pipeline", icon: KanbanSquare, badge: { count: 7 } },
          { id: "crm.quotes", label: "Quotes", href: "/crm/quotes", icon: ReceiptText },
        ],
      },
      {
        type: "group",
        id: "crm.records",
        label: "Records",
        items: [
          { id: "crm.contacts", label: "Contacts", href: "/crm/contacts", icon: Contact },
          { id: "crm.companies", label: "Companies", href: "/crm/companies", icon: Building2 },
          { id: "crm.activities", label: "Activities", href: "/crm/activities", icon: CalendarClock },
        ],
      },
    ],
  },
  {
    id: "people",
    name: "People",
    description: "HR & time off",
    icon: Users,
    href: "/people",
    nav: [
      { id: "people.dashboard", label: "Dashboard", href: "/people", icon: LayoutDashboard },
      {
        type: "group",
        id: "people.team",
        label: "Team",
        items: [
          { id: "people.employees", label: "Employees", href: "/people/employees", icon: UserRound },
          { id: "people.org", label: "Org chart", href: "/people/org", icon: Network },
        ],
      },
      {
        type: "group",
        id: "people.time",
        label: "Time",
        items: [
          {
            id: "people.leave",
            label: "Leave",
            href: "/people/leave",
            icon: CalendarDays,
            badge: { count: 3 },
            children: [
              { id: "people.leave.requests", label: "Requests", href: "/people/leave" },
              { id: "people.leave.new", label: "New request", href: "/people/leave/new" },
              { id: "people.leave.calendar", label: "Calendar", href: "/people/leave/calendar" },
            ],
          },
          { id: "people.shifts", label: "Shifts", href: "/people/shifts", icon: Clock },
        ],
      },
    ],
  },
  {
    id: "work",
    name: "Work",
    description: "Projects & billing",
    icon: Briefcase,
    href: "/work",
    nav: [
      { id: "work.dashboard", label: "Dashboard", href: "/work", icon: LayoutDashboard },
      { id: "work.projects", label: "Projects", href: "/work/projects", icon: FolderKanban },
      { id: "work.tasks", label: "Tasks", href: "/work/tasks", icon: ListChecks },
      { id: "work.time", label: "Timesheets", href: "/work/time", icon: Timer },
      { id: "work.partners", label: "Partners", href: "/work/partners", icon: HeartHandshake },
      { id: "work.invoices", label: "Invoices", href: "/work/invoices", icon: Receipt },
    ],
  },
];

/** The same in every app, under the app's own menu. */
export const workspaceSharedNav: NavNode[] = [
  { id: "users", label: "Users & roles", href: "/users", icon: ShieldCheck },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { id: "settings.general", label: "General", href: "/settings" },
      { id: "settings.locale", label: "Language & formats", href: "/settings/locale" },
      { id: "settings.appearance", label: "Appearance", href: "/settings/appearance" },
    ],
  },
  { id: "kit", label: "Component kit", href: "/components", icon: Blocks },
];
