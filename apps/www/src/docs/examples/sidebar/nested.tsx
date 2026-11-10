"use client";

import { Bell, Mail, Settings, Shield, Users } from "lucide-react";
import { Sidebar, SidebarContent, SidebarNav, VamosProvider, type NavNode } from "@vamos-cms/ui";
import { useMemoryRouter } from "../app-shell/demo-kit";

const nav: NavNode[] = [
  {
    type: "group",
    id: "admin",
    label: "Administration",
    items: [
      { id: "team", label: "Team", href: "/settings/team", icon: Users },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        children: [
          { id: "settings.general", label: "General", href: "/settings" },
          {
            id: "settings.email",
            label: "Email",
            children: [
              { id: "settings.email.senders", label: "Senders", href: "/settings/email/senders" },
              { id: "settings.email.templates", label: "Templates", href: "/settings/email/templates" },
              { id: "settings.email.dns", label: "DNS & DKIM", href: "/settings/email/dns" },
            ],
          },
          { id: "settings.notifications", label: "Notifications", href: "/settings/notifications" },
        ],
      },
      { id: "security", label: "Security", href: "/security", icon: Shield },
      { id: "alerts", label: "Alerts", href: "/alerts", icon: Bell, disabled: "Soon" },
      { id: "inbox", label: "Shared inbox", href: "/inbox", icon: Mail },
    ],
  },
];

/** Three levels: the third is a collapsible inline and a heading + list inside a flyout. */
export default function SidebarNested() {
  const router = useMemoryRouter("/settings/email/templates");
  return (
    <VamosProvider Link={router.Link} currentPath={router.currentPath}>
      <div className="h-[460px] overflow-hidden rounded-ui-lg">
        <Sidebar collapsible={false}>
          <SidebarContent>
            <SidebarNav items={nav} />
          </SidebarContent>
        </Sidebar>
      </div>
    </VamosProvider>
  );
}
