"use client";

import * as React from "react";
import { toast } from "@vamos-cms/ui";
import { PermissionMatrix, type PermissionAction, type PermissionResource, type PermissionValue } from "@vamos-cms/ui/business";

const resources: PermissionResource[] = [
  { id: "resellers", label: "Resellers", group: "Partners" },
  { id: "deals", label: "Registered deals", group: "Partners" },
  { id: "payouts", label: "Commission payouts", group: "Finance", actions: ["view", "approve"] },
];
const actions: PermissionAction[] = [
  { id: "view", label: "View", scoped: true },
  { id: "edit", label: "Edit", scoped: true },
  { id: "approve", label: "Approve", scoped: true, danger: true },
];
const saved: PermissionValue = { resellers: { view: "own", edit: "own" }, deals: { view: "own" }, payouts: { view: "own" } };

export default function PermissionMatrixDiff() {
  // baseline = what's saved: changed cells get a dot and a save bar offers Review · Discard · Save.
  const [baseline, setBaseline] = React.useState(saved);
  const [value, setValue] = React.useState<PermissionValue>({ ...saved, deals: { view: "team", edit: "own" }, payouts: { view: "own", approve: "all" } });
  return (
    <div className="w-full">
      <PermissionMatrix
        aria-label="Partner admin permissions"
        subject="Partner admin"
        resources={resources}
        actions={actions}
        value={value}
        onValueChange={setValue}
        baseline={baseline}
        onSave={async (v, changes) => {
          await new Promise((r) => setTimeout(r, 600));
          setBaseline(v);
          toast.success(`${changes.length} permission changes saved`);
        }}
      />
    </div>
  );
}
