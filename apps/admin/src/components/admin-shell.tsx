"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { AppShell, AppShellProvider, type MenuEntry } from "@vamos-cms/ui";
import { tr } from "@vamos-cms/ui/locale/tr";
import { apps, badges, sharedNav } from "@/lib/nav";

const account: MenuEntry[] = [
  { id: "settings", label: "Ayarlar", icon: <Settings />, href: "/ayarlar" },
  { id: "sign-out", label: "Çıkış", icon: <LogOut />, href: "/logout" },
];

/** NO:17 paneli — kitin AppShell'i, tek uygulama ve sade üst bar. */
export function AdminShell({ defaultCollapsed, children }: { defaultCollapsed?: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const navigate = React.useCallback((href: string) => router.push(href), [router]);
  const [userName, setUserName] = React.useState("NO:17");
  React.useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.profile?.name) setUserName(d.profile.name);
      })
      .catch(() => {});
  }, []);
  return (
    <AppShellProvider
      apps={apps}
      sharedNav={sharedNav}
      linkComponent={Link}
      currentPath={pathname}
      navigate={navigate}
      defaultCollapsed={defaultCollapsed}
      locale="tr-TR"
      messages={tr}
    >
      <AppShell badges={badges} user={{ name: userName, items: account }}>
        {children}
      </AppShell>
    </AppShellProvider>
  );
}
