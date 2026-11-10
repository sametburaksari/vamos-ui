import { PermissionCompare, type PermissionAction, type PermissionResource } from "@vamos-ui/react/business";

const resources: PermissionResource[] = [
  { id: "deals", label: "Deals" },
  { id: "quotes", label: "Quotes" },
  { id: "contacts", label: "Contacts" },
];
const actions: PermissionAction[] = [
  { id: "view", label: "View", scoped: true },
  { id: "edit", label: "Edit", scoped: true },
  { id: "delete", label: "Delete", scoped: true, danger: true },
];

export default function PermissionMatrixCompare() {
  return (
    <div className="w-full">
      <PermissionCompare
        aria-label="Sales roles compared"
        resources={resources}
        actions={actions}
        subjects={[
          { id: "rep", label: "Sales rep", description: "12 people", value: { deals: { view: "own", edit: "own" }, quotes: { view: "own", edit: "own" }, contacts: { view: "team", edit: "own" } } },
          { id: "mgr", label: "Sales manager", description: "3 people", value: { deals: { view: "team", edit: "team", delete: "own" }, quotes: { view: "team", edit: "team" }, contacts: { view: "all", edit: "team" } } },
          { id: "admin", label: "Admin", description: "2 people", value: { deals: { view: "all", edit: "all", delete: "all" }, quotes: { view: "all", edit: "all", delete: "all" }, contacts: { view: "all", edit: "all", delete: "all" } } },
        ]}
      />
    </div>
  );
}
