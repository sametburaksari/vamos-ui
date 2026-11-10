"use client";

import * as React from "react";
import {
  Briefcase, Building2, CalendarClock, CalendarDays, Clock, Contact, FileText, FolderKanban, Globe, Handshake,
  Image, KanbanSquare, LayoutDashboard, ListChecks, Network, Receipt, ReceiptText, Settings, ShieldCheck, Timer, UserRound, Users,
} from "lucide-react";
import { AppShell, AppShellProvider, type AppDefinition, type NavNode, type VamosLinkProps } from "@vamos-ui/react";

/** The workspace's apps. One sidebar, a menu per app; on phones it becomes the shell's sheet. */
const apps: AppDefinition[] = [
  {
    id: "crm", name: "CRM", description: "Customers & sales", icon: Handshake, href: "/crm",
    nav: [
      { id: "crm.home", label: "Dashboard", href: "/crm", icon: LayoutDashboard },
      { type: "group", id: "crm.sales", label: "Sales", items: [
        { id: "crm.pipeline", label: "Pipeline", href: "/crm/pipeline", icon: KanbanSquare, badge: 7 },
        { id: "crm.quotes", label: "Quotes", href: "/crm/quotes", icon: ReceiptText },
      ] },
      { type: "group", id: "crm.customers", label: "Customers", items: [
        { id: "crm.contacts", label: "Contacts", href: "/crm/contacts", icon: Contact, match: ["/crm/contacts/*"] },
        { id: "crm.companies", label: "Companies", href: "/crm/companies", icon: Building2 },
        { id: "crm.activities", label: "Activities", href: "/crm/activities", icon: CalendarClock },
      ] },
    ],
    newMenu: [{ id: "new-contact", label: "Contact", href: "/crm/contacts/new" }, { id: "new-deal", label: "Deal", href: "/crm/deals/new" }],
  },
  {
    id: "people", name: "People", description: "HR & time off", icon: Users, href: "/people",
    nav: [
      { id: "people.home", label: "Dashboard", href: "/people", icon: LayoutDashboard },
      { type: "group", id: "people.team", label: "Team", items: [
        { id: "people.employees", label: "Employees", href: "/people/employees", icon: UserRound, match: ["/people/employees/*"] },
        { id: "people.org", label: "Org chart", href: "/people/org", icon: Network },
      ] },
      { type: "group", id: "people.time", label: "Time", items: [
        { id: "people.leave", label: "Leave", href: "/people/leave", icon: CalendarDays, badge: 3 },
        { id: "people.shifts", label: "Shifts", href: "/people/shifts", icon: Clock },
      ] },
    ],
    newMenu: [{ id: "new-employee", label: "Employee", href: "/people/employees/new" }, { id: "new-leave", label: "Leave request", href: "/people/leave/new" }],
  },
  {
    id: "work", name: "Work", description: "Projects & billing", icon: Briefcase, href: "/work",
    nav: [
      { id: "work.home", label: "Dashboard", href: "/work", icon: LayoutDashboard },
      { type: "group", id: "work.delivery", label: "Delivery", items: [
        { id: "work.projects", label: "Projects", href: "/work/projects", icon: FolderKanban },
        { id: "work.tasks", label: "Tasks", href: "/work/tasks", icon: ListChecks },
        { id: "work.time", label: "Timesheets", href: "/work/time", icon: Timer },
      ] },
      { type: "group", id: "work.billing", label: "Billing", items: [
        { id: "work.invoices", label: "Invoices", href: "/work/invoices", icon: Receipt, match: ["/work/invoices/*"] },
      ] },
    ],
    newMenu: [{ id: "new-invoice", label: "Invoice", href: "/work/invoices/new" }, { id: "new-project", label: "Project", href: "/work/projects/new" }],
  },
  {
    id: "site", name: "Site", description: "Content & website", icon: Globe, href: "/site",
    nav: [
      { id: "site.home", label: "Dashboard", href: "/site", icon: LayoutDashboard },
      { id: "site.posts", label: "Posts", href: "/site/posts", icon: FileText },
      { id: "site.media", label: "Media", href: "/site/media", icon: Image },
    ],
  },
];

const sharedNav: NavNode[] = [
  { id: "users", label: "Users & roles", href: "/users", icon: ShieldCheck },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

/** In-memory router so clicks in the preview move the active item instead of leaving the page. */
function useMemoryRouter(initial: string) {
  const [currentPath, setPath] = React.useState(initial);
  const navigate = React.useCallback((href: string) => setPath(href), []);
  const Link = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, VamosLinkProps>(function MemoryLink({ href, onClick, replace: _replace, prefetch: _prefetch, ...props }, ref) {
        return (
          <a
            ref={ref}
            href={href}
            onClick={(e) => {
              onClick?.(e);
              if (e.defaultPrevented || /^(https?:|mailto:|tel:|#)/.test(href)) return;
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

/**
 * Responsive workspace shell for the detail pages: sidebar on wide screens, sheet menu on phones.
 * The record page stays on screen while you click around the menu (it's a preview).
 * In your app, pass Next's `Link`, `usePathname()` and `router.push` to AppShellProvider instead.
 */
export function WorkspaceShell({ path, children }: { path: string; children: React.ReactNode }) {
  const router = useMemoryRouter(path);
  return (
    <AppShellProvider apps={apps} sharedNav={sharedNav} currentPath={router.currentPath} navigate={router.navigate} linkComponent={router.Link}>
      <AppShell
        user={{
          name: "Meltem Aydın",
          email: "meltem@northpoint.example",
          items: [
            { id: "profile", label: "Profile", href: "/settings/profile" },
            { type: "separator", id: "sep" },
            { id: "signout", label: "Sign out" },
          ],
        }}
      >
        {children}
      </AppShell>
    </AppShellProvider>
  );
}
