"use client";

import { Button, PageHeader, AppShellProvider } from "@vamos-cms/ui";
import { crmApp, siteApp } from "../app-shell/demo-kit";

/** breadcrumb="auto" builds the trail from the App shell's active nav item — one source of truth. */
export default function PageHeaderWithBreadcrumb() {
  return (
    <AppShellProvider apps={[siteApp, crmApp]} currentPath="/site/posts/categories" shortcuts={false}>
      <PageHeader
        className="w-full"
        breadcrumb="auto"
        title="Categories"
        description="Group posts by topic. Categories appear in the site menu and in post URLs."
        actions={<Button variant="primary">Add category</Button>}
      />
    </AppShellProvider>
  );
}
