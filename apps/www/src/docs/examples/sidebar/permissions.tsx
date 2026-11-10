"use client";

import * as React from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarNav, VamosProvider } from "@vamos-cms/ui";
import { sharedNav, siteNav, useMemoryRouter } from "../app-shell/demo-kit";

const roles = {
  Admin: ["comments.moderate", "design.edit", "users.manage"],
  Editor: ["comments.moderate"],
  Viewer: [] as string[],
};
type Role = keyof typeof roles;

/** Hidden items never reach the DOM. This is UI only — enforce permissions on the server. */
export default function SidebarPermissions() {
  const router = useMemoryRouter("/site/posts");
  const [role, setRole] = React.useState<Role>("Editor");
  const can = React.useCallback((p: string) => roles[role].includes(p), [role]);
  return (
    <div className="grid w-full max-w-md gap-3">
      <div role="radiogroup" aria-label="Role" className="flex gap-1 self-center justify-self-center rounded-full border border-line bg-surface-2 p-1">
        {(Object.keys(roles) as Role[]).map((r) => (
          <button
            key={r}
            role="radio"
            aria-checked={role === r}
            onClick={() => setRole(r)}
            className="rounded-full px-3 py-1 text-[13px] font-medium text-fg-muted focus-ring aria-checked:bg-fg aria-checked:text-scene"
          >
            {r}
          </button>
        ))}
      </div>
      <VamosProvider Link={router.Link} currentPath={router.currentPath} can={can}>
        <div className="mx-auto h-[500px] overflow-hidden rounded-ui-lg">
          <Sidebar collapsible={false}>
            <SidebarContent>
              <SidebarNav items={siteNav} />
            </SidebarContent>
            <SidebarFooter>
              <SidebarNav aria-label="Workspace" items={sharedNav} />
            </SidebarFooter>
          </Sidebar>
        </div>
      </VamosProvider>
    </div>
  );
}
