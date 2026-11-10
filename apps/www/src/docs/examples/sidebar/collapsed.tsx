"use client";

import { AppSwitcher, Sidebar, SidebarCollapseButton, SidebarContent, SidebarFooter, SidebarHeader, SidebarNav, VamosProvider } from "@vamos-cms/ui";
import { crmApp, siteApp, siteNav, useMemoryRouter } from "../app-shell/demo-kit";

/** The rail: hover or press → on an item to open its submenu as a flyout; leaves show a tooltip. */
export default function SidebarCollapsed() {
  const router = useMemoryRouter("/site/pages");
  return (
    <VamosProvider Link={router.Link} currentPath={router.currentPath}>
      <div className="h-[520px] overflow-hidden rounded-ui-lg">
        <Sidebar defaultCollapsed>
          <SidebarHeader>
            <AppSwitcher apps={[siteApp, crmApp]} activeApp="site" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav items={siteNav} badges={{ comments: 4 }} />
          </SidebarContent>
          <SidebarFooter>
            <SidebarCollapseButton />
          </SidebarFooter>
        </Sidebar>
      </div>
    </VamosProvider>
  );
}
