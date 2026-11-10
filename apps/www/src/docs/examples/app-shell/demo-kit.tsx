"use client";

/**
 * Shared data for the navigation examples: an in-memory router (so clicks inside a preview move
 * the active item instead of leaving the docs page) and four app definitions.
 * In your app, pass Next's `Link`, `usePathname()` and `router.push` instead.
 */
import * as React from "react";
import {
  BarChart3, Building2, CalendarDays, Contact, FileText, Files, FolderKanban, Globe, Handshake, HeartHandshake, Image,
  Inbox, KanbanSquare, LayoutDashboard, ListChecks, Menu, MessageSquare, Paintbrush, ReceiptText, Settings,
  ShieldCheck, Timer, UserRound, Users, Briefcase, Network, Clock,
} from "lucide-react";
import type { AppDefinition, NavNode, VamosLinkProps } from "@vamos-cms/ui";

export function useMemoryRouter(initial: string) {
  const [currentPath, setPath] = React.useState(initial);
  const navigate = React.useCallback((href: string) => setPath(href), []);
  const Link = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, VamosLinkProps>(function MemoryLink({ href, onClick, replace: _r, prefetch: _p, ...props }, ref) {
        return (
          <a
            ref={ref}
            href={href}
            onClick={(e) => {
              onClick?.(e);
              if (e.defaultPrevented || /^https?:/.test(href)) return;
              e.preventDefault();
              setPath(href);
            }}
            {...props}
          />
        );
      }),
    [],
  );
  return { currentPath, navigate, Link };
}

export const siteNav: NavNode[] = [
  { id: "dashboard", label: "Dashboard", href: "/site", icon: LayoutDashboard },
  {
    type: "group",
    id: "content",
    label: "Content",
    items: [
      {
        id: "posts",
        label: "Posts",
        href: "/site/posts",
        icon: FileText,
        keywords: ["articles", "blog"],
        children: [
          { id: "posts.all", label: "All posts", href: "/site/posts" },
          { id: "posts.new", label: "Add new", href: "/site/posts/new" },
          { id: "posts.categories", label: "Categories", href: "/site/posts/categories" },
          { id: "posts.tags", label: "Tags", href: "/site/posts/tags" },
        ],
      },
      {
        id: "pages",
        label: "Pages",
        href: "/site/pages",
        icon: Files,
        children: [
          { id: "pages.all", label: "All pages", href: "/site/pages" },
          { id: "pages.new", label: "Add new", href: "/site/pages/new" },
        ],
      },
      { id: "media", label: "Media", href: "/site/media", icon: Image },
    ],
  },
  {
    type: "group",
    id: "engagement",
    label: "Engagement",
    items: [
      { id: "comments", label: "Comments", href: "/site/comments", icon: MessageSquare, permission: "comments.moderate" },
      { id: "forms", label: "Forms", href: "/site/forms", icon: Inbox },
    ],
  },
  {
    type: "group",
    id: "design",
    label: "Design",
    items: [
      { id: "menus", label: "Menus", href: "/site/menus", icon: Menu, permission: "design.edit" },
      { id: "theme", label: "Theme", href: "/site/theme", icon: Paintbrush, permission: "design.edit" },
    ],
  },
];

export const sharedNav: NavNode[] = [
  { id: "users", label: "Users & roles", href: "/users", icon: ShieldCheck, permission: "users.manage" },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { id: "settings.general", label: "General", href: "/settings" },
      { id: "settings.apps", label: "Apps & modules", href: "/settings/apps" },
      { id: "settings.locale", label: "Language & formats", href: "/settings/locale" },
    ],
  },
];

export const siteApp: AppDefinition = {
  id: "site",
  name: "Site",
  description: "Content & website",
  icon: Globe,
  href: "/site",
  nav: siteNav,
  links: [{ id: "view-site", label: "View site", href: "https://northwind.example", external: true }],
  newMenu: [
    { id: "new-post", label: "Post", icon: <FileText />, href: "/site/posts/new" },
    { id: "new-page", label: "Page", icon: <Files />, href: "/site/pages/new" },
  ],
};

export const crmApp: AppDefinition = {
  id: "crm",
  name: "CRM",
  description: "Customers & sales",
  icon: Handshake,
  href: "/crm",
  accent: "ocean",
  nav: [
    { id: "crm.dashboard", label: "Dashboard", href: "/crm", icon: LayoutDashboard },
    {
      type: "group",
      id: "crm.sales",
      label: "Sales",
      items: [
        { id: "crm.pipeline", label: "Pipeline", href: "/crm/pipeline", icon: KanbanSquare, keywords: ["deals"], badge: 7 },
        { id: "crm.quotes", label: "Quotes", href: "/crm/quotes", icon: ReceiptText },
        { id: "crm.reports", label: "Reports", href: "/crm/reports", icon: BarChart3, disabled: "Soon" },
      ],
    },
    {
      type: "group",
      id: "crm.customers",
      label: "Customers",
      items: [
        { id: "crm.contacts", label: "Contacts", href: "/crm/contacts", icon: Contact },
        { id: "crm.companies", label: "Companies", href: "/crm/companies", icon: Building2 },
      ],
    },
  ],
  newMenu: [{ id: "new-contact", label: "Contact", icon: <Contact />, href: "/crm/contacts/new" }],
};

export const peopleApp: AppDefinition = {
  id: "people",
  name: "People",
  description: "Team & HR",
  icon: Users,
  href: "/people",
  accent: "ember",
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
      label: "Time off & shifts",
      items: [
        {
          id: "people.leave",
          label: "Leave",
          href: "/people/leave",
          icon: CalendarDays,
          badge: 3,
          children: [
            { id: "people.leave.requests", label: "Requests", href: "/people/leave" },
            { id: "people.leave.calendar", label: "Calendar", href: "/people/leave/calendar" },
          ],
        },
        { id: "people.shifts", label: "Shifts", href: "/people/shifts", icon: Clock },
      ],
    },
  ],
};

export const workApp: AppDefinition = {
  id: "work",
  name: "Work",
  description: "Projects & partners",
  icon: Briefcase,
  href: "/work",
  accent: "rose",
  nav: [
    { id: "work.dashboard", label: "Dashboard", href: "/work", icon: LayoutDashboard },
    { id: "work.projects", label: "Projects", href: "/work/projects", icon: FolderKanban },
    { id: "work.tasks", label: "Tasks", href: "/work/tasks", icon: ListChecks },
    { id: "work.time", label: "Timesheets", href: "/work/time", icon: Timer },
    { id: "work.partners", label: "Partners", href: "/work/partners", icon: HeartHandshake },
  ],
};

/** A fixed-height stage for full-shell previews. Full-bleed: it breaks out of the preview's padding. */
export function ShellFrame({ children, width, height = 600 }: { children: React.ReactNode; width?: number; height?: number }) {
  if (width) {
    return (
      <div className="mx-auto w-full overflow-hidden rounded-[28px] border-[6px] border-fg/85 bg-scene shadow-[0_24px_60px_-28px_rgb(0_0_0/0.55)]" style={{ height, maxWidth: width }}>
        {children}
      </div>
    );
  }
  return (
    <div className="-m-8 w-[calc(100%+4rem)] overflow-hidden bg-scene md:-m-12 md:w-[calc(100%+6rem)]" style={{ height }}>
      {children}
    </div>
  );
}

type DemoSection = { stats: [string, string, string?][]; title: string; rows: [string, string, string][] };

const sections: [prefix: string, section: DemoSection][] = [
  ["/crm", {
    stats: [["Open deals", "37"], ["Pipeline value", "$412,800"], ["Won this month", "$68,450", "+12%"]],
    title: "Deals closing soon",
    rows: [["Fjord Freight · Fleet tracking", "Proposal sent", "Dec 15"], ["Harbor & Pine Legal · Retainer", "Negotiation", "Dec 18"], ["Brightline Studio · Site rebuild", "Discovery", "Jan 9"]],
  }],
  ["/people", {
    stats: [["Headcount", "84"], ["On leave today", "6"], ["Open roles", "4"]],
    title: "Pending leave requests",
    rows: [["Can Yıldız · Annual leave", "Dec 22 – Jan 2", "7 days"], ["Sofia Ricci · Sick leave", "Nov 11", "1 day"], ["Liam O'Connor · Parental leave", "Jan 6 – Mar 28", "60 days"]],
  }],
  ["/work", {
    stats: [["Active projects", "12"], ["Hours this week", "186.5"], ["Overdue tasks", "3"]],
    title: "Due this week",
    rows: [["Checkout redesign · QA pass", "Mert A.", "Wed"], ["Q4 renewal emails", "Priya R.", "Thu"], ["Brand refresh · final files", "Ece D.", "Fri"]],
  }],
  ["/portal", {
    stats: [["Open invoices", "2"], ["Shared documents", "18"], ["Unread messages", "3"]],
    title: "Recently shared",
    rows: [["Brand guidelines v3.pdf", "Design", "Nov 8"], ["Q4 campaign brief.docx", "Marketing", "Nov 4"], ["Service agreement 2027.pdf", "Contracts", "Oct 29"]],
  }],
  ["/site", {
    stats: [["Visitors · 30 days", "28,412", "+8.4%"], ["Published posts", "144"], ["Form submissions", "312"]],
    title: "Recent posts",
    rows: [["A field guide to GDPR consent banners", "Published", "Nov 9"], ["Writing alt text that actually helps", "Scheduled", "Nov 12"], ["Local SEO checklist for 2026", "Draft", "Nov 6"]],
  }],
];

/** Page body for shell previews: stats and a short list that match the current route's app. */
export function DemoPage({ path }: { path: string }) {
  const section = (sections.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`)) ?? sections[sections.length - 1]!)[1];
  return (
    <div className="grid gap-(--gap)">
      <div className="grid gap-(--gap) sm:grid-cols-3">
        {section.stats.map(([label, value, delta]) => (
          <div key={label} className="surface rounded-ui-lg p-4">
            <p className="text-xs text-fg-subtle">{label}</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-[length:calc(28px*var(--display-scale))] tabular">{value}</span>
              {delta ? <span className="text-xs text-success tabular">{delta}</span> : null}
            </p>
          </div>
        ))}
      </div>
      <div className="surface overflow-hidden rounded-ui-lg">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-medium">{section.title}</p>
          <code className="font-mono text-[11px] text-fg-subtle">{path}</code>
        </div>
        <ul className="divide-y divide-line">
          {section.rows.map(([name, meta, when]) => (
            <li key={name} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
              <span className="min-w-0 flex-1 truncate">{name}</span>
              <span className="hidden shrink-0 text-fg-muted sm:inline">{meta}</span>
              <span className="w-24 shrink-0 text-end text-fg-subtle tabular">{when}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
