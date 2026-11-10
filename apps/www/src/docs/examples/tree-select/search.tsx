"use client";

import * as React from "react";
import { Field, TreeSelect, type TreeNode } from "@vamos-cms/ui";

// Chart of accounts: search "rent" or "kira" — matches keep their parents, folded for Turkish İ/ı.
const accounts: TreeNode[] = [
  {
    id: "6",
    label: "Operating expenses",
    description: "6",
    children: [
      { id: "60", label: "Premises", description: "60", children: [{ id: "600", label: "Office rent", description: "600", keywords: ["kira"] }, { id: "601", label: "Utilities", description: "601" }] },
      { id: "61", label: "Staff", description: "61", children: [{ id: "610", label: "Salaries", description: "610" }, { id: "611", label: "Training", description: "611" }] },
      { id: "62", label: "Software & subscriptions", description: "62" },
    ],
  },
  {
    id: "7",
    label: "Cost of sales",
    description: "7",
    children: [{ id: "700", label: "Equipment rental", description: "700" }, { id: "701", label: "Freight in", description: "701" }],
  },
];

export default function TreeSelectSearch() {
  const [account, setAccount] = React.useState<string | null>(null);
  return (
    <div className="w-full max-w-sm">
      <Field label="Expense account">
        <TreeSelect nodes={accounts} selectable="leaf" value={account} onValueChange={setAccount} searchPlaceholder="Search by name or code…" placeholder="Pick an account" />
      </Field>
    </div>
  );
}
