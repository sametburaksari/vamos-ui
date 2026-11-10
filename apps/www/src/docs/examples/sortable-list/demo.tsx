"use client";

import * as React from "react";
import { ExternalLink, FileText, FolderOpen } from "lucide-react";
import { Badge } from "@vamos-cms/ui";
import { SortableTree, moveTreeNode } from "@vamos-cms/ui/sortable";

interface MenuNode {
  id: string;
  label: string;
  href: string;
  kind: "page" | "section" | "external";
  children?: MenuNode[];
}

const initial: MenuNode[] = [
  { id: "home", label: "Home", href: "/", kind: "page" },
  {
    id: "services",
    label: "Services",
    href: "/services",
    kind: "section",
    children: [
      { id: "branding", label: "Branding", href: "/services/branding", kind: "page" },
      {
        id: "web",
        label: "Websites",
        href: "/services/web",
        kind: "section",
        children: [
          { id: "shops", label: "Online shops", href: "/services/web/shops", kind: "page" },
          { id: "booking", label: "Booking sites", href: "/services/web/booking", kind: "page" },
        ],
      },
      { id: "ads", label: "Ad management", href: "/services/ads", kind: "page" },
    ],
  },
  { id: "work", label: "Case studies", href: "/work", kind: "page" },
  { id: "blog", label: "Journal", href: "/journal", kind: "page" },
  { id: "status", label: "System status", href: "https://status.example.com", kind: "external" },
  { id: "contact", label: "Contact", href: "/contact", kind: "page" },
];

const icons = { page: FileText, section: FolderOpen, external: ExternalLink };

export default function SortableTreeDemo() {
  const [menu, setMenu] = React.useState(initial);
  return (
    <div className="w-full max-w-lg">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 id="menu-builder" className="text-sm font-semibold">
          Header navigation
        </h3>
        <span className="text-xs text-fg-muted">Up to 3 levels · drag sideways to nest</span>
      </div>
      <div className="rounded-ui-lg border border-line bg-surface p-1.5">
        <SortableTree
          aria-labelledby="menu-builder"
          nodes={menu}
          maxDepth={3}
          canDrop={(c) => {
            const parent = c.parentId ? find(menu, c.parentId) : null;
            return parent?.kind === "external" ? "External links can't have sub-items" : true;
          }}
          onMove={(e) => setMenu((m) => moveTreeNode(m, e.id, e.parentId, e.index))}
          renderItem={(n) => {
            const Icon = icons[n.kind];
            return (
              <>
                <Icon aria-hidden className="size-4 shrink-0 text-fg-subtle" />
                <span className="truncate font-medium">{n.label}</span>{" "}
                <span className="hidden truncate font-mono text-xs text-fg-subtle sm:inline">{n.href}</span>
                {n.kind === "external" ? <Badge tone="outline" className="ms-auto">External</Badge> : null}
              </>
            );
          }}
        />
      </div>
    </div>
  );
}

function find(list: MenuNode[], id: string): MenuNode | null {
  for (const n of list) {
    if (n.id === id) return n;
    const hit = n.children ? find(n.children, id) : null;
    if (hit) return hit;
  }
  return null;
}
