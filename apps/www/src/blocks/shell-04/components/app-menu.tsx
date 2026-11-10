"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarNav, useAppShell } from "@vamos-ui/react";

/**
 * Second column: the active app's name and its menu, plus the shared workspace menu. Not
 * collapsible — the app column already is the compact form.
 */
export function AppMenu() {
  const { activeApp, nav, sharedNav, trail } = useAppShell();
  if (!activeApp) return null;
  return (
    <Sidebar collapsible={false} className="h-full">
      <SidebarHeader className="px-4.5 py-3.5">
        <p className="text-[14px] font-semibold leading-tight text-nav-fg-strong">{activeApp.name}</p>
        <p className="text-[12px] leading-tight text-nav-fg/75">Brightline Studio · {activeApp.description}</p>
      </SidebarHeader>
      <SidebarContent aria-label={`${activeApp.name} menu`}>
        <SidebarNav items={nav} trail={trail} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarNav aria-label="Workspace" items={sharedNav} trail={trail} />
      </SidebarFooter>
    </Sidebar>
  );
}
