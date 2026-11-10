"use client";

import { Archive, Copy, Eye, Pencil, Send, Trash2 } from "lucide-react";
import { ActionMenu, Badge, VamosProvider, type MenuEntry } from "@vamos-cms/ui";

const invoices = [
  { id: "INV-2041", client: "Northwind Logistics", total: "$12,480.00", status: "Overdue", tone: "danger" },
  { id: "INV-2042", client: "Harbor & Pine", total: "$3,915.50", status: "Sent", tone: "info" },
  { id: "INV-2043", client: "Lumen Dental Group", total: "$860.00", status: "Paid", tone: "success" },
] as const;

const actionsFor = (id: string): MenuEntry[] => [
  { id: "view", label: "View", icon: <Eye />, href: `#${id}` },
  { id: "edit", label: "Edit", icon: <Pencil />, shortcut: "e", onSelect: () => console.log("edit", id) },
  { id: "duplicate", label: "Duplicate", icon: <Copy />, shortcut: "mod+d" },
  { id: "remind", label: "Send reminder", icon: <Send />, description: "Emails the billing contact" },
  { type: "separator" },
  { id: "archive", label: "Archive", icon: <Archive /> },
  // hidden for users without the permission (VamosProvider `can`)
  { id: "delete", label: "Delete", icon: <Trash2 />, tone: "danger", permission: "invoices.delete" },
];

export default function DropdownMenuActionMenu() {
  return (
    <VamosProvider can={(permission) => permission !== "invoices.delete"}>
      <div className="w-full max-w-lg divide-y divide-line overflow-hidden rounded-ui-lg surface">
        {invoices.map((inv) => (
          <div key={inv.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span className="w-20 font-mono text-xs text-fg-subtle">{inv.id}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-fg">{inv.client}</span>
            <Badge tone={inv.tone}>{inv.status}</Badge>
            <span className="w-24 text-end tabular text-fg">{inv.total}</span>
            <ActionMenu items={actionsFor(inv.id)} triggerLabel={`Actions for ${inv.id}`} triggerSize="xs" size="sm" />
          </div>
        ))}
      </div>
    </VamosProvider>
  );
}
