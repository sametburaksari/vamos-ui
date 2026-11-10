"use client";

import * as React from "react";
import { TreeSelect, type TreeNode } from "@vamos-ui/react";

const initial: TreeNode[] = [
  { id: "guides", label: "Guides", children: [{ id: "seo", label: "SEO" }, { id: "accessibility", label: "Accessibility" }] },
  { id: "product", label: "Product updates" },
  { id: "stories", label: "Customer stories", children: [{ id: "agencies", label: "Agencies" }, { id: "retail", label: "Retail" }] },
];

function insert(nodes: TreeNode[], parentId: string | null, node: TreeNode): TreeNode[] {
  if (parentId === null) return [...nodes, node];
  return nodes.map((n) => (n.id === parentId ? { ...n, children: [...(n.children ?? []), node] } : { ...n, children: n.children && insert(n.children, parentId, node) }));
}

export default function TreeSelectInline() {
  const [nodes, setNodes] = React.useState(initial);
  const [checked, setChecked] = React.useState<string[]>(["accessibility"]);
  return (
    <aside className="grid w-full max-w-xs gap-2">
      <h4 id="post-categories" className="text-[13px] font-medium text-fg">Categories</h4>
      <TreeSelect
        aria-labelledby="post-categories"
        aria-label="Categories"
        mode="inline"
        multiple
        cascade={false}
        searchable={false}
        nodes={nodes}
        defaultExpanded={["guides", "stories"]}
        value={checked}
        onValueChange={setChecked}
        onCreate={async (parentId, label) => {
          const node = { id: label.toLowerCase().replace(/\s+/g, "-"), label };
          setNodes((list) => insert(list, parentId, node));
          return node;
        }}
      />
    </aside>
  );
}
