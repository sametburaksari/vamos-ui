"use client";

import * as React from "react";
import { AppShell, AppShellProvider, PageHeader } from "@vamos-cms/ui";
import { crmApp, DemoPage, ShellFrame, siteApp, useMemoryRouter } from "./demo-kit";

const workspaces = [
  { id: "northwind", name: "Northwind Traders" },
  { id: "lena", name: "Lena Spa" },
  { id: "tuzla", name: "Tuzla Play" },
];

/** A tenant switcher shares the app switcher's panel. */
export default function AppShellWorkspaces() {
  const router = useMemoryRouter("/site/posts");
  const [workspace, setWorkspace] = React.useState("lena");
  const name = workspaces.find((w) => w.id === workspace)!.name;
  return (
    <ShellFrame>
      <AppShellProvider
        apps={[siteApp, crmApp]}
        currentPath={router.currentPath}
        navigate={router.navigate}
        linkComponent={router.Link}
        workspaces={workspaces}
        activeWorkspace={workspace}
        onWorkspaceChange={setWorkspace}
        shortcuts={false}
        defaultCollapsed={false}
      >
        <AppShell height="fill" user={{ name: "Ada Lovelace", email: "ada@northwind.io", items: [{ id: "out", label: "Sign out" }] }}>
          <PageHeader eyebrow={name} title="Posts" description={`Content for ${name}.`} />
          <DemoPage path={router.currentPath} />
        </AppShell>
      </AppShellProvider>
    </ShellFrame>
  );
}
