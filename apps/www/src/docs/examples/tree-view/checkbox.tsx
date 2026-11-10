"use client";

import * as React from "react";
import { TreeView, type TreeNode } from "@vamos-cms/ui";

const permissions: TreeNode[] = [
  {
    id: "content",
    label: "Content",
    children: [
      { id: "posts.read", label: "View posts" },
      { id: "posts.write", label: "Create and edit posts" },
      { id: "posts.publish", label: "Publish posts" },
      { id: "media.manage", label: "Manage media library" },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    children: [
      { id: "contacts.read", label: "View contacts" },
      { id: "contacts.export", label: "Export contacts" },
      { id: "deals.manage", label: "Manage deals", children: [{ id: "deals.edit", label: "Edit deals" }, { id: "deals.delete", label: "Delete deals" }] },
    ],
  },
  { id: "billing", label: "Billing", children: [{ id: "invoices.read", label: "View invoices" }, { id: "plan.change", label: "Change plan", disabled: true }] },
];

export default function TreeViewCheckbox() {
  const [granted, setGranted] = React.useState(["posts.read", "posts.write", "contacts.read"]);
  return (
    <div className="grid w-full max-w-md gap-2">
      <div className="rounded-ui border border-line bg-surface p-1.5">
        <TreeView aria-label="Editor role permissions" data={permissions} selectionMode="checkbox" checkValueMode="leaf" defaultExpanded={["content", "crm", "deals.manage"]} selected={granted} onSelectedChange={setGranted} />
      </div>
      <p className="text-xs text-fg-muted">{granted.length} permissions granted · “Change plan” is owner-only</p>
    </div>
  );
}
