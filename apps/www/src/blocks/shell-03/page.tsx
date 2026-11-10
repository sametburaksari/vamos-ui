"use client";

import { AppShell, AppShellProvider } from "@vamos-ui/react";
import { selfServiceApp } from "./components/nav";
import { useMemoryRouter } from "./components/router";
import { SelfServiceHome } from "./components/self-service-home";

/**
 * Top-navigation shell for simple panels (client portals, self-service, partner areas):
 * no sidebar, top-level links in the bar, a sheet menu on phones, ⌘K still works.
 */
export default function Shell03() {
  const router = useMemoryRouter("/me");
  return (
    <AppShellProvider apps={[selfServiceApp]} currentPath={router.currentPath} navigate={router.navigate} linkComponent={router.Link}>
      <AppShell
        layout="topnav"
        user={{
          name: "Sofia Ricci",
          email: "sofia.ricci@kestrel.studio",
          items: [
            { id: "profile", label: "My profile", href: "/me/profile" },
            { id: "prefs", label: "Notification preferences", href: "/me/preferences" },
            { type: "separator", id: "sep" },
            { id: "signout", label: "Sign out" },
          ],
        }}
      >
        <SelfServiceHome path={router.currentPath} />
      </AppShell>
    </AppShellProvider>
  );
}
