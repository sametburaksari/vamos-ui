"use client";

import * as React from "react";
import { DialogTitle, Sheet, SheetContent } from "@vamos-ui/react";
import { AppSidebar } from "./components/app-sidebar";
import { SamplePage } from "./components/sample-page";
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

/** Multi-app shell: one sidebar, many apps (Site, CRM, People, Work), shared bottom menu. Below 768px the sidebar opens as a sheet. */
export default function Shell01({ children, initialPath = "/crm/pipeline" }: { children?: React.ReactNode; initialPath?: string }) {
  const [path, setPath] = React.useState(initialPath);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileNav, setMobileNav] = React.useState(false);
  const app = appForPath(path);
  return (
    <div className="relative z-10 flex min-h-dvh">
      <AppSidebar className="max-md:hidden" path={path} onNavigate={setPath} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={`${app?.name ?? "Workspace"} / ${titleFor(path)}`} onMenu={() => setMobileNav(true)} />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-7">
          {children ?? <SamplePage appId={app?.id} />}
        </main>
      </div>
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="start" size="sm" hideClose className="max-w-[86vw] border-0 p-0">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <AppSidebar
            mobile
            className="static h-full w-full border-e-0"
            path={path}
            onNavigate={(href) => {
              setPath(href);
              setMobileNav(false);
            }}
            collapsed={false}
            onToggle={() => setMobileNav(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
