"use client";

import * as React from "react";
import { TreeView, type TreeNode } from "@vamos-cms/ui";

// 50 warehouses × 10 aisles × 10 bins = 5,550 nodes. Only the rows in view are rendered.
function buildLocations(): TreeNode[] {
  return Array.from({ length: 50 }, (_, w) => ({
    id: `wh-${w + 1}`,
    label: `Warehouse ${String(w + 1).padStart(2, "0")}`,
    badge: "100 bins",
    children: Array.from({ length: 10 }, (_, a) => ({
      id: `wh-${w + 1}-a${a + 1}`,
      label: `Aisle ${String.fromCharCode(65 + a)}`,
      children: Array.from({ length: 10 }, (_, b) => ({ id: `wh-${w + 1}-a${a + 1}-b${b + 1}`, label: `Bin ${String.fromCharCode(65 + a)}-${String(b + 1).padStart(2, "0")}` })),
    })),
  }));
}

export default function TreeViewVirtual() {
  const data = React.useMemo(buildLocations, []);
  const [expanded, setExpanded] = React.useState<string[]>(["wh-1", "wh-1-a1"]);
  const all = React.useMemo(() => data.flatMap((w) => [w.id, ...(w.children ?? []).map((a) => a.id)]), [data]);
  return (
    <div className="grid w-full max-w-sm gap-2">
      <div className="flex gap-3 text-xs">
        <button type="button" className="text-accent-ink hover:underline" onClick={() => setExpanded(all)}>
          Expand all 550 branches
        </button>
        <button type="button" className="text-fg-muted hover:underline" onClick={() => setExpanded([])}>
          Collapse
        </button>
      </div>
      <div className="rounded-ui border border-line bg-surface p-1.5">
        <TreeView aria-label="Stock locations" data={data} virtual height={320} size="sm" expanded={expanded} onExpandedChange={setExpanded} />
      </div>
    </div>
  );
}
