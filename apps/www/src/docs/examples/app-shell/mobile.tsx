"use client";

import { AppShell, AppShellProvider, PageHeader } from "@vamos-cms/ui";
import { crmApp, DemoPage, ShellFrame, sharedNav, siteApp, useMemoryRouter } from "./demo-kit";

/**
 * Below 768px of shell width the sidebar hides, the top bar shows the menu button and the nav
 * opens in a start-side sheet (accordion levels). Following a link closes it.
 */
export default function AppShellMobile() {
  const router = useMemoryRouter("/site/posts/categories");
  return (
    <ShellFrame width={390} height={680}>
      <AppShellProvider apps={[siteApp, crmApp]} sharedNav={sharedNav} currentPath={router.currentPath} navigate={router.navigate} linkComponent={router.Link} shortcuts={false}>
        <AppShell height="fill" user={{ name: "Ece Demir", email: "ece@tuzlaplay.com", items: [{ id: "out", label: "Sign out" }] }}>
          <PageHeader breadcrumb="auto" title="Categories" />
          <DemoPage path={router.currentPath} />
        </AppShell>
      </AppShellProvider>
    </ShellFrame>
  );
}
