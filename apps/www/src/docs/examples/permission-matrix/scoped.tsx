"use client";

import * as React from "react";
import { toast } from "@vamos-ui/react";
import { PermissionMatrix, type PermissionAction, type PermissionResource, type PermissionValue } from "@vamos-ui/react/business";

// CRM "Sales rep": sees own deals, the team's contacts. Scope cells: None / Own / Team / All.
const resources: PermissionResource[] = [
  { id: "contacts", label: "Contacts", group: "CRM" },
  { id: "companies", label: "Companies", group: "CRM" },
  { id: "deals", label: "Deals", group: "Sales" },
  { id: "quotes", label: "Quotes", group: "Sales" },
  { id: "invoices", label: "Invoices", group: "Finance", actions: ["view", "export"] },
];
const actions: PermissionAction[] = [
  { id: "view", label: "View", scoped: true },
  { id: "edit", label: "Edit", scoped: true },
  { id: "delete", label: "Delete", scoped: true, danger: true },
  { id: "export", label: "Export", scoped: true, danger: true },
];

export default function PermissionMatrixScoped() {
  const [value, setValue] = React.useState<PermissionValue>({
    contacts: { view: "team", edit: "own" },
    companies: { view: "all", edit: "own" },
    deals: { view: "own", edit: "own" },
    quotes: { view: "own", edit: "own" },
  });
  return (
    <div className="w-full">
      <PermissionMatrix
        aria-label="Sales rep permissions"
        resources={resources}
        actions={actions}
        value={value}
        onValueChange={setValue}
        dependencies={[{ action: "edit", requires: "view" }, { action: "delete", requires: "edit" }, { action: "export", requires: "view" }]}
        onDependencyApplied={(m) => toast.info(m)}
      />
    </div>
  );
}
