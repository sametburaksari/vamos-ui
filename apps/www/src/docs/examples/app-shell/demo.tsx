"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import { AppShell, AppShellProvider, Button, NotificationCenter, PageHeader, createMemoryNotificationAdapter } from "@vamos-cms/ui";
import { DemoPage, ShellFrame, sharedNav, siteApp, useMemoryRouter } from "./demo-kit";

const inbox = createMemoryNotificationAdapter([
  { id: "n1", title: "Ahmet K. commented on “QR menus for restaurants”", createdAt: new Date(Date.now() - 4e5).toISOString(), actor: { name: "Ahmet Kaya" }, href: "/site/comments" },
  { id: "n2", title: "New submission on Contact form", createdAt: new Date(Date.now() - 3e6).toISOString(), tone: "info", href: "/site/forms" },
]);

export default function AppShellDemo() {
  const router = useMemoryRouter("/site");
  return (
    <ShellFrame>
      {/* shortcuts={false}: this docs page owns ⌘K — leave it on in your app. defaultCollapsed={false}: start expanded in this narrow preview. */}
      <AppShellProvider apps={[siteApp]} sharedNav={sharedNav} currentPath={router.currentPath} navigate={router.navigate} linkComponent={router.Link} shortcuts={false} defaultCollapsed={false}>
        <AppShell
          height="fill"
          badges={{ comments: 4, forms: { count: 12, tone: "danger" } }}
          notifications={<NotificationCenter adapter={inbox} />}
          user={{
            name: "Ada Lovelace",
            email: "ada@northwind.io",
            items: [
              { id: "profile", label: "Your profile", icon: <UserRound /> },
              { id: "settings", label: "Settings", icon: <Settings />, href: "/settings" },
              { type: "separator" },
              { id: "out", label: "Sign out", icon: <LogOut /> },
            ],
          }}
        >
          <PageHeader breadcrumb="auto" eyebrow="Northwind" title="Dashboard" actions={<Button>Export report</Button>} />
          <DemoPage path={router.currentPath} />
        </AppShell>
      </AppShellProvider>
    </ShellFrame>
  );
}
