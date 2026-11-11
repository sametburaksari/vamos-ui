"use client";

import * as React from "react";
import { Download, FilePlus2, Mail, Trash2 } from "lucide-react";
import { Menubar, type MenubarMenuEntry } from "@vamos-ui/react";

// The same MenuEntry model as Dropdown Menu, Context Menu and Command.
export default function MenubarDataDriven() {
  const [showPaid, setShowPaid] = React.useState(true);
  const [group, setGroup] = React.useState("client");

  const menus: MenubarMenuEntry[] = [
    {
      id: "invoice",
      label: "Invoice",
      items: [
        { id: "new", label: "New invoice", icon: <FilePlus2 />, shortcut: "mod+n" },
        { id: "send", label: "Send reminder", icon: <Mail />, shortcut: "mod+shift+r" },
        { id: "export", label: "Export", icon: <Download />, type: "submenu", items: [
          { id: "csv", label: "CSV" },
          { id: "xlsx", label: "Excel" },
          { id: "pdf", label: "PDF bundle" },
        ] },
        { type: "separator" },
        { id: "void", label: "Void invoice", icon: <Trash2 />, tone: "danger" },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { id: "paid", type: "checkbox", label: "Show paid", checked: showPaid, onCheckedChange: setShowPaid },
        { type: "separator" },
        { id: "group", type: "radio", label: "Group by", value: group, onValueChange: setGroup, options: [
          { value: "client", label: "Client" },
          { value: "month", label: "Month" },
          { value: "status", label: "Status" },
        ] },
      ],
    },
    { id: "admin", label: "Admin", permission: "billing.admin", items: [{ id: "tax", label: "Tax rates" }] },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Menubar aria-label="Invoices" menus={menus} />
      <p className="text-[13px] text-fg-muted">
        {showPaid ? "Showing all invoices" : "Hiding paid invoices"}, grouped by {group}. The Admin menu appears only when <code>can("billing.admin")</code> is true.
      </p>
    </div>
  );
}
