"use client";

import * as React from "react";
import { Field, TreeSelect, type TreeNode } from "@vamos-cms/ui";

const roots: TreeNode[] = [
  { id: "ops", label: "Operations", hasChildren: true },
  { id: "product", label: "Product & engineering", hasChildren: true },
  { id: "people", label: "People", hasChildren: true },
];

const children: Record<string, TreeNode[]> = {
  ops: [{ id: "ops-cs", label: "Customer support", hasChildren: true }, { id: "ops-fin", label: "Finance" }, { id: "ops-log", label: "Logistics" }],
  "ops-cs": [{ id: "cs-t1", label: "Tier 1 · İstanbul" }, { id: "cs-t2", label: "Tier 2 · Lisbon" }],
  product: [{ id: "pe-web", label: "Web platform" }, { id: "pe-mobile", label: "Mobile apps" }, { id: "pe-design", label: "Design" }],
  people: [{ id: "hr-ta", label: "Talent acquisition" }, { id: "hr-pay", label: "Payroll" }],
};

// Each department loads its sub-teams from the server the first time it opens.
async function loadDepartments(node: TreeNode, signal: AbortSignal) {
  await new Promise((r) => setTimeout(r, 700));
  signal.throwIfAborted();
  return children[node.id] ?? [];
}

export default function TreeSelectLazy() {
  const [department, setDepartment] = React.useState<string | null>(null);
  return (
    <div className="w-full max-w-sm">
      <Field label="Department" hint="Sub-teams load when a branch opens.">
        <TreeSelect nodes={roots} loadChildren={loadDepartments} value={department} onValueChange={setDepartment} placeholder="Select department" />
      </Field>
    </div>
  );
}
