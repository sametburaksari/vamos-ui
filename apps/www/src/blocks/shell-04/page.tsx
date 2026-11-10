"use client";

import { AppShell, AppShellProvider } from "@vamos-ui/react";
import { AppMenu } from "./components/app-menu";
import { AppRail } from "./components/app-rail";
import { apps, sharedNav } from "./components/apps";
import { IssuesPage } from "./components/issues-page";
import { useMemoryRouter } from "./components/router";

/**
 * Two-level sidebar: a column of app tiles, then the active app's menu. Switching apps swaps the
 * menu, ⌘K commands and the New menu. On phones both collapse into the shell's sheet menu.
 */
export default function Shell04() {
  const router = useMemoryRouter("/work/projects/checkout");
  return (
    <AppShellProvider apps={apps} sharedNav={sharedNav} currentPath={router.currentPath} navigate={router.navigate} linkComponent={router.Link}>
      <AppShell
        sidebar={
          <div className="flex h-full">
            <AppRail />
            <AppMenu />
          </div>
        }
        user={{
          name: "Ece Demir",
          email: "ece@brightline.studio",
          items: [
            { id: "profile", label: "Profile", href: "/settings/profile" },
            { id: "status", label: "Set status…" },
            { type: "separator", id: "sep" },
            { id: "signout", label: "Sign out" },
          ],
        }}
      >
        <IssuesPage path={router.currentPath} />
      </AppShell>
    </AppShellProvider>
  );
}
