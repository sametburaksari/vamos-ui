"use client";

import { FileText, Files, Inbox, LayoutDashboard, MessageSquare } from "lucide-react";
import { Sidebar, SidebarCollapseButton, SidebarContent, SidebarFooter, SidebarGroup, SidebarItem, SidebarSeparator, SidebarSubItem, VamosProvider } from "@vamos-ui/react";
import { useMemoryRouter } from "../app-shell/demo-kit";

/** The same parts SidebarNav renders, written by hand. */
export default function SidebarComposed() {
  const router = useMemoryRouter("/site/posts");
  return (
    <VamosProvider Link={router.Link} currentPath={router.currentPath}>
      <div className="h-[480px] overflow-hidden rounded-ui-lg">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarItem label="Dashboard" href="/site" icon={LayoutDashboard} active={router.currentPath === "/site"} />
            </SidebarGroup>
            <SidebarGroup label="Content">
              <SidebarItem label="Posts" href="/site/posts" icon={FileText}>
                <SidebarSubItem label="All posts" href="/site/posts" />
                <SidebarSubItem label="Categories" href="/site/posts/categories" />
                <SidebarSubItem label="Tags" href="/site/posts/tags" />
              </SidebarItem>
              <SidebarItem label="Pages" href="/site/pages" icon={Files}>
                <SidebarSubItem label="All pages" href="/site/pages" />
                <SidebarSubItem label="Add new" href="/site/pages/new" />
              </SidebarItem>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup label="Engagement">
              <SidebarItem label="Comments" href="/site/comments" icon={MessageSquare} badge={4} />
              <SidebarItem label="Forms" href="/site/forms" icon={Inbox} badge={{ dot: true, label: "new submissions" }} />
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarCollapseButton />
          </SidebarFooter>
        </Sidebar>
      </div>
    </VamosProvider>
  );
}
