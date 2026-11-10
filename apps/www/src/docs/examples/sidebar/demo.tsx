"use client";

import { AppSwitcher, Sidebar, SidebarCollapseButton, SidebarContent, SidebarFooter, SidebarHeader, SidebarNav, VamosProvider } from "@vamos-cms/ui";
import { crmApp, peopleApp, sharedNav, siteApp, siteNav, useMemoryRouter } from "../app-shell/demo-kit";

export default function SidebarDemo() {
  // Your app passes Next's Link and usePathname() to VamosProvider at the root.
  const router = useMemoryRouter("/site/posts/categories");
  return (
    <VamosProvider Link={router.Link} currentPath={router.currentPath} navigate={router.navigate}>
      <div className="h-[600px] overflow-hidden rounded-ui-lg">
        <Sidebar>
          <SidebarHeader>
            <AppSwitcher apps={[siteApp, crmApp, peopleApp]} activeApp="site" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav items={siteNav} badges={{ comments: 4, forms: { count: 12, tone: "danger" } }} />
          </SidebarContent>
          <SidebarFooter>
            <SidebarNav aria-label="Workspace" items={sharedNav} />
          </SidebarFooter>
          <SidebarFooter>
            <SidebarCollapseButton />
          </SidebarFooter>
        </Sidebar>
      </div>
    </VamosProvider>
  );
}
