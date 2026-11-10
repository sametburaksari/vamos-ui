"use client";

import * as React from "react";
import { Sidebar, SidebarContent, SidebarNav, VamosProvider } from "@vamos-ui/react";
import { siteNav, useMemoryRouter } from "../app-shell/demo-kit";

/** Live counts live outside the config, so updates never rebuild the tree. */
export default function SidebarBadges() {
  const router = useMemoryRouter("/site");
  const [comments, setComments] = React.useState(4);
  const [forms, setForms] = React.useState(98);
  React.useEffect(() => {
    const id = setInterval(() => {
      setComments((c) => (c >= 9 ? 0 : c + 1));
      setForms((f) => f + 1);
    }, 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <VamosProvider Link={router.Link} currentPath={router.currentPath}>
      <div className="h-[520px] overflow-hidden rounded-ui-lg">
        <Sidebar collapsible={false}>
          <SidebarContent>
            <SidebarNav
              items={siteNav}
              badges={{
                comments: { count: comments, label: `${comments} awaiting moderation` },
                forms: { count: forms, tone: "danger" },
                media: { dot: true, label: "new uploads" },
              }}
            />
          </SidebarContent>
        </Sidebar>
      </div>
    </VamosProvider>
  );
}
