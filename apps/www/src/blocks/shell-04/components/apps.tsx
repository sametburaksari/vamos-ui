"use client";

import {
  BarChart3, Briefcase, Building2, CalendarDays, CircleDot, Clock, Contact, FileText, Files, Globe, Handshake, Image, Inbox,
  KanbanSquare, Layers, Map, MessageSquare, Network, ReceiptText, Repeat, Settings, UserRound, Users,
} from "lucide-react";
import type { AppDefinition, NavNode } from "@vamos-ui/react";

/**
 * Four apps on one workspace. The first column switches apps; the second column is the active
 * app's own menu. Each app keeps its own accent only if you set `accent` — here they follow the theme.
 */
export const workApp: AppDefinition = {
  id: "work",
  name: "Work",
  description: "Projects & issues",
  icon: Briefcase,
  href: "/work",
  nav: [
    { id: "work.inbox", label: "Inbox", href: "/work", icon: Inbox, badge: 5 },
    { id: "work.mine", label: "My issues", href: "/work/my-issues", icon: CircleDot },
    {
      type: "group",
      id: "work.projects",
      label: "Projects",
      items: [
        {
          id: "work.checkout",
          label: "Checkout redesign",
          href: "/work/projects/checkout",
          icon: Layers,
          children: [
            { id: "work.checkout.issues", label: "Issues", href: "/work/projects/checkout" },
            { id: "work.checkout.board", label: "Board", href: "/work/projects/checkout/board" },
            { id: "work.checkout.docs", label: "Docs", href: "/work/projects/checkout/docs" },
          ],
        },
        { id: "work.brand", label: "Brand refresh", href: "/work/projects/brand", icon: Layers },
        { id: "work.renewals", label: "Q4 renewals", href: "/work/projects/renewals", icon: Layers },
      ],
    },
    {
      type: "group",
      id: "work.planning",
      label: "Planning",
      items: [
        { id: "work.cycles", label: "Cycles", href: "/work/cycles", icon: Repeat },
        { id: "work.roadmap", label: "Roadmap", href: "/work/roadmap", icon: Map },
      ],
    },
  ],
  newMenu: [
    { id: "new-issue", label: "Issue", icon: <CircleDot />, href: "/work/issues/new" },
    { id: "new-project", label: "Project", icon: <Layers />, href: "/work/projects/new" },
  ],
};

export const crmApp: AppDefinition = {
  id: "crm",
  name: "CRM",
  description: "Customers & sales",
  icon: Handshake,
  href: "/crm",
  nav: [
    { id: "crm.pipeline", label: "Pipeline", href: "/crm", icon: KanbanSquare, badge: 7 },
    { id: "crm.quotes", label: "Quotes", href: "/crm/quotes", icon: ReceiptText },
    { id: "crm.reports", label: "Reports", href: "/crm/reports", icon: BarChart3 },
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
  newMenu: [{ id: "new-deal", label: "Deal", icon: <KanbanSquare />, href: "/crm/deals/new" }],
};

export const peopleApp: AppDefinition = {
  id: "people",
  name: "People",
  description: "Team & HR",
  icon: Users,
  href: "/people",
  nav: [
    { id: "people.directory", label: "Directory", href: "/people", icon: UserRound },
    { id: "people.org", label: "Org chart", href: "/people/org", icon: Network },
    { id: "people.leave", label: "Leave", href: "/people/leave", icon: CalendarDays, badge: 3 },
    { id: "people.shifts", label: "Shifts", href: "/people/shifts", icon: Clock },
  ],
};

export const siteApp: AppDefinition = {
  id: "site",
  name: "Site",
  description: "Content & website",
  icon: Globe,
  href: "/site",
  nav: [
    { id: "site.posts", label: "Posts", href: "/site", icon: FileText },
    { id: "site.pages", label: "Pages", href: "/site/pages", icon: Files },
    { id: "site.media", label: "Media", href: "/site/media", icon: Image },
    { id: "site.comments", label: "Comments", href: "/site/comments", icon: MessageSquare, badge: { count: 2, tone: "warning" } },
  ],
};

export const apps = [workApp, crmApp, peopleApp, siteApp];

/** Unread dots on the app column. In your app these come from your API. */
export const appUnread: Record<string, boolean> = { work: true, crm: false, people: true, site: false };

export const sharedNav: NavNode[] = [{ id: "settings", label: "Settings", href: "/settings", icon: Settings }];
