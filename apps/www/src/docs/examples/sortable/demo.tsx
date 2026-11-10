"use client";

import * as React from "react";
import { FileText, Home, Lock } from "lucide-react";
import { Badge } from "@vamos-ui/react";
import { SortableList } from "@vamos-ui/react/sortable";

interface MenuPage {
  id: string;
  title: string;
  path: string;
  status: "published" | "draft";
}

const initial: MenuPage[] = [
  { id: "home", title: "Home", path: "/", status: "published" },
  { id: "services", title: "Services", path: "/services", status: "published" },
  { id: "work", title: "Case studies", path: "/work", status: "published" },
  { id: "pricing", title: "Pricing", path: "/pricing", status: "draft" },
  { id: "about", title: "About us", path: "/about", status: "published" },
  { id: "contact", title: "Contact", path: "/contact", status: "published" },
];

export default function SortableDemo() {
  const [pages, setPages] = React.useState(initial);
  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 id="main-menu" className="text-sm font-semibold">
          Main menu
        </h3>
        <span className="text-xs text-fg-muted">Drag, or use the arrows menu</span>
      </div>
      <SortableList
        aria-labelledby="main-menu"
        variant="inset"
        items={pages}
        getLabel={(p) => p.title}
        disabled={(p) => p.id === "home"}
        onReorder={setPages}
        renderItem={(p) => (
          <div className="flex min-w-0 items-center gap-2.5">
            {p.id === "home" ? <Home className="size-4 shrink-0 text-fg-subtle" /> : <FileText className="size-4 shrink-0 text-fg-subtle" />}
            <span className="truncate font-medium">{p.title}</span>
            <span className="truncate font-mono text-xs text-fg-subtle">{p.path}</span>
            <span className="ms-auto flex shrink-0 items-center gap-1.5">
              {p.status === "draft" && <Badge tone="warning">Draft</Badge>}
              {p.id === "home" && <Lock aria-label="Pinned first" className="size-3.5 text-fg-subtle" />}
            </span>
          </div>
        )}
      />
    </div>
  );
}
