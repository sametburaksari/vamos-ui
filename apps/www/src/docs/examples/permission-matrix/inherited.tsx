"use client";

import * as React from "react";
import { PermissionMatrix, type PermissionAction, type PermissionResource, type PermissionValue } from "@vamos-cms/ui/business";

const resources: PermissionResource[] = [
  { id: "employees", label: "Employees", description: "Profiles and job history" },
  { id: "salaries", label: "Salaries", description: "Pay, bonuses, bank details" },
  { id: "leave", label: "Leave requests" },
  { id: "reviews", label: "Performance reviews" },
];
const actions: PermissionAction[] = [
  { id: "view", label: "View", scoped: true },
  { id: "edit", label: "Edit", scoped: true },
  { id: "approve", label: "Approve", scoped: true },
];

// "Team lead" inherits from "Manager"; locked cells follow the parent until overridden.
const manager: PermissionValue = {
  employees: { view: "team", edit: "team" },
  salaries: { view: "team" },
  leave: { view: "team", approve: "team" },
  reviews: { view: "team", edit: "team" },
};

export default function PermissionMatrixInherited() {
  const [value, setValue] = React.useState<PermissionValue>({ salaries: { view: "none" } });
  return (
    <div className="w-full">
      <PermissionMatrix aria-label="Team lead permissions" resources={resources} actions={actions} inherited={manager} inheritedFrom="Manager" value={value} onValueChange={setValue} />
      <p className="mt-2 text-xs text-fg-subtle">Striped cells are inherited from Manager. Delete or Backspace on an overridden cell resets it.</p>
    </div>
  );
}
