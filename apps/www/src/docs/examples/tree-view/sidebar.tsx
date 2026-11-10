"use client";

import * as React from "react";
import { FileCode2, Folder } from "lucide-react";
import { TreeView, type TreeNode } from "@vamos-ui/react";

const dir = (id: string, label: string, children: TreeNode[]): TreeNode => ({ id, label, children, icon: <Folder /> });
const file = (id: string, label: string): TreeNode => ({ id, label, icon: <FileCode2 /> });

const files: TreeNode[] = [
  dir("app", "app", [dir("app/(site)", "(site)", [file("app/(site)/page.tsx", "page.tsx"), file("app/(site)/layout.tsx", "layout.tsx")]), dir("app/admin", "admin", [file("app/admin/page.tsx", "page.tsx")])]),
  dir("blocks", "blocks", [file("blocks/hero.tsx", "hero.tsx"), file("blocks/pricing.tsx", "pricing.tsx"), file("blocks/faq.tsx", "faq.tsx")]),
  file("vamos.config.ts", "vamos.config.ts"),
];

export default function TreeViewSidebar() {
  const [current, setCurrent] = React.useState(["blocks/pricing.tsx"]);
  return (
    <nav aria-label="Project files" className="w-full max-w-60 rounded-ui border border-line bg-surface-2 p-1.5">
      <TreeView aria-label="Files" variant="sidebar" size="sm" indent={12} guides={false} data={files} defaultExpanded={["app", "blocks"]} isSelectable={(_n, hasChildren) => !hasChildren} selected={current} onSelectedChange={setCurrent} />
    </nav>
  );
}
