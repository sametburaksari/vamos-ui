"use client";

import * as React from "react";
import { Construction } from "lucide-react";
import { Card } from "@vamos-cms/ui";
import { AppSidebar } from "./components/app-sidebar";
import { TopBar } from "./components/top-bar";
import { appForPath, apps, sharedNav, type NavEntry } from "./components/nav";

function titleFor(path: string) {
  const all: NavEntry[] = [...apps.flatMap((a) => a.nav), ...sharedNav];
  for (const e of all) {
    if (!("href" in e)) continue;
    if (e.href === path) return e.label;
    const c = e.children?.find((x) => x.href === path);
    if (c) return `${e.label} · ${c.label}`;
  }
  return "Dashboard";
}

/** Multi-app shell: one sidebar, many apps (Site, CRM, People, Work), shared bottom menu. */
export default function Shell01({ children, initialPath = "/crm/pipeline" }: { children?: React.ReactNode; initialPath?: string }) {
  const [path, setPath] = React.useState(initialPath);
  const [collapsed, setCollapsed] = React.useState(false);
  const app = appForPath(path);
  return (
    <div className="relative z-10 flex min-h-dvh">
      <AppSidebar path={path} onNavigate={setPath} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={`${app?.name ?? "Workspace"} / ${titleFor(path)}`} />
        <main className="flex-1 px-6 py-7">
          {children ?? (
            <Card className="grid place-items-center px-6 py-24 text-center">
              <Construction className="mb-3 size-6 text-fg-subtle" strokeWidth={1.6} />
              <p className="text-fg-muted">Your page goes here. Try the app switcher at the top of the sidebar.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
