"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import { AppShell, AppShellProvider, NotificationCenter, type MenuEntry } from "@vamos-ui/react";
import { apps, badges, sharedNav } from "@/lib/nav";
import { notificationAdapter } from "@/lib/notifications";
import { ThemeControls } from "./theme-controls";

const account: MenuEntry[] = [
  { id: "profile", label: "Your profile", icon: <UserRound />, href: "/users/me" },
  { id: "settings", label: "Settings", icon: <Settings />, href: "/settings", shortcut: "mod+comma" },
  { type: "separator" },
  { id: "sign-out", label: "Sign out", icon: <LogOut />, href: "/logout" },
];

/** The admin panel on the kit's AppShell: Next router bridge, apps, shared menu, inbox, user menu. */
export function AdminShell({ defaultCollapsed, children }: { defaultCollapsed?: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const navigate = React.useCallback((href: string) => router.push(href), [router]);
  return (
    <AppShellProvider apps={apps} sharedNav={sharedNav} linkComponent={Link} currentPath={pathname} navigate={navigate} defaultCollapsed={defaultCollapsed}>
      <AppShell
        badges={badges}
        actions={<ThemeControls />}
        notifications={<NotificationCenter adapter={notificationAdapter} settingsHref="/settings/notifications" />}
        user={{ name: "Samet Burak Sarı", email: "samet@vamos.ist", items: account }}
        appSwitcherFooter={<Link href="/settings/apps">Manage apps & modules…</Link>}
      >
        {children}
      </AppShell>
    </AppShellProvider>
  );
}
