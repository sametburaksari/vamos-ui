"use client";

import * as React from "react";
import { useFormat } from "@vamos-cms/ui";
import { SortableTree, moveTreeNode } from "@vamos-cms/ui/sortable";

interface Category {
  id: string;
  label: string;
  products: number;
  hidden?: boolean;
  children?: Category[];
}

const initial: Category[] = [
  {
    id: "coffee",
    label: "Coffee",
    products: 48,
    children: [
      { id: "beans", label: "Whole beans", products: 22 },
      { id: "ground", label: "Ground", products: 14 },
      { id: "capsules", label: "Capsules", products: 12 },
    ],
  },
  {
    id: "equipment",
    label: "Brewing equipment",
    products: 61,
    children: [
      { id: "grinders", label: "Grinders", products: 9 },
      { id: "kettles", label: "Kettles", products: 7 },
      { id: "filters", label: "Pour-over & filters", products: 31 },
      { id: "espresso", label: "Espresso machines", products: 14, hidden: true },
    ],
  },
  { id: "tea", label: "Tea", products: 27 },
  { id: "gifts", label: "Gift sets", products: 8 },
];

export default function SortableTreeCategories() {
  const [cats, setCats] = React.useState(initial);
  const format = useFormat();
  return (
    <div className="w-full max-w-md rounded-ui-lg border border-line bg-surface p-1.5">
      <SortableTree
        aria-label="Shop categories"
        size="sm"
        indent={20}
        nodes={cats}
        maxDepth={2}
        defaultExpanded={["equipment"]}
        onMove={(e) => setCats((c) => moveTreeNode(c, e.id, e.parentId, e.index))}
        renderItem={(c) => (
          <>
            <span className={c.hidden ? "truncate text-fg-subtle line-through decoration-fg-subtle/50" : "truncate"}>{c.label}</span>
            <span className="tabular ms-auto text-xs text-fg-subtle">{format.number(c.products)}</span>
          </>
        )}
      />
    </div>
  );
}
