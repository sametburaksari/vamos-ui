"use client";

import { AppShell, AppShellProvider, PageHeader, useAppShell } from "@vamos-ui/react";
import { crmApp, DemoPage, peopleApp, ShellFrame, sharedNav, siteApp, useMemoryRouter, workApp } from "./demo-kit";

function Page({ path }: { path: string }) {
  const { activeApp } = useAppShell();
  return (
    <>
      <PageHeader breadcrumb="auto" title={activeApp?.name ?? ""} description={activeApp?.description} />
      <DemoPage path={path} />
    </>
  );
}

/**
 * Switch apps from the sidebar header: the nav, "New ▾" menu, top-bar links ("View site" is
 * Site-only) and the accent change; the top bar, user menu, notifications and ⌘K stay.
 * ⌘K "Go to" lists pages from every app with an app badge.
 */
export default function AppShellMultiApp() {
  const router = useMemoryRouter("/crm/pipeline");
  return (
    <ShellFrame>
      <AppShellProvider apps={[siteApp, crmApp, peopleApp, workApp]} sharedNav={sharedNav} currentPath={router.currentPath} navigate={router.navigate} linkComponent={router.Link} shortcuts={false} defaultCollapsed={false}>
        <AppShell height="fill" user={{ name: "Ada Lovelace", email: "ada@northwind.io", items: [{ id: "out", label: "Sign out" }] }}>
          <Page path={router.currentPath} />
        </AppShell>
      </AppShellProvider>
    </ShellFrame>
  );
}
