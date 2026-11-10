"use client";

import { AppShell, AppShellProvider, createMemoryNotificationAdapter, NotificationCenter } from "@vamos-ui/react";
import * as React from "react";
import { notifications, opsApp, sharedNav } from "./components/nav";
import { useMemoryRouter } from "./components/router";
import { ShipmentsPage } from "./components/shipments-page";

/**
 * Icon-rail shell: the sidebar starts as a 64px rail (labels in tooltips, submenus as flyouts),
 * expandable with the button at the bottom or ⌘\. Below 768px it becomes a sheet.
 */
export default function Shell02() {
  const router = useMemoryRouter("/ops/shipments");
  const [collapsed, setCollapsed] = React.useState(true);
  const inbox = React.useMemo(() => createMemoryNotificationAdapter(notifications), []);

  return (
    <AppShellProvider
      apps={[opsApp]}
      sharedNav={sharedNav}
      currentPath={router.currentPath}
      navigate={router.navigate}
      linkComponent={router.Link}
      defaultCollapsed={collapsed}
      onCollapsedChange={setCollapsed}
    >
      <AppShell
        notifications={<NotificationCenter adapter={inbox} />}
        user={{
          name: "Ingrid Solberg",
          email: "ingrid@fjordfreight.no",
          items: [
            { id: "profile", label: "Profile", href: "/settings/profile" },
            { id: "shift", label: "Shift handover notes", href: "/ops/handover" },
            { type: "separator", id: "sep" },
            { id: "signout", label: "Sign out" },
          ],
        }}
      >
        <ShipmentsPage path={router.currentPath} />
      </AppShell>
    </AppShellProvider>
  );
}
