import { ex, type DocEntry } from "../types";
import PermissionMatrixDemo from "../examples/permission-matrix/demo";
import PermissionMatrixScoped from "../examples/permission-matrix/scoped";
import PermissionMatrixInherited from "../examples/permission-matrix/inherited";
import PermissionMatrixCompare from "../examples/permission-matrix/compare";
import PermissionMatrixDiff from "../examples/permission-matrix/diff";
import PermissionMatrixPlans from "../examples/permission-matrix/plans";

const entry: DocEntry = {
  slug: "permission-matrix",
  title: "Permission matrix",
  group: "Editors & drag-and-drop",
  description:
    "Edit what a role, group or plan may do: resources × actions with checkbox cells or scope cells (None / Own / Team / All, shown as increasing fill plus text), inheritance from a parent role, row, column and group bulk toggles, dependencies kept consistent (\"Edit needs View\"), sticky headers, and a review-before-save diff. PermissionCompare puts roles side by side.",
  source: ["business/permission-matrix.tsx", "business/permission-core.ts"],
  basedOn: "WAI-ARIA grid · Dropdown Menu · Dialog",
  usage: `import { PermissionMatrix, PermissionCompare, diffPermissions } from "@vamos-cms/ui/business";

<PermissionMatrix
  resources={resources}
  actions={[{ id: "view", label: "View", scoped: true }, { id: "delete", label: "Delete", danger: true }]}
  value={value}
  onValueChange={setValue}
  inherited={managerRole}
  inheritedFrom="Manager"
  baseline={saved}
  onSave={(v, changes) => api.roles.update(id, v)}
  dependencies={[{ action: "edit", requires: "view" }]}
/>`,
  demo: ex("demo", "Demo", "permission-matrix/demo.tsx", PermissionMatrixDemo),
  examples: [
    ex("scoped", "Scoped cells", "permission-matrix/scoped.tsx", PermissionMatrixScoped, "Own / Team / All as increasing fill with the name in the cell. Enter opens the scope menu, 1–4 pick directly, Space toggles None ↔ All. Raising Delete raises Edit and View (toast)."),
    ex("inherited", "Inherited from a parent role", "permission-matrix/inherited.tsx", PermissionMatrixInherited, "Inherited cells are striped and locked (\"From Manager\"); overrides get a ring and \"Reset to inherited\" in the menu."),
    ex("compare", "Compare roles", "permission-matrix/compare.tsx", PermissionMatrixCompare, "PermissionCompare: subjects as columns, permissions as rows; rows that differ are tinted (onlyDifferences filters them)."),
    ex("diff", "Review before save", "permission-matrix/diff.tsx", PermissionMatrixDiff, "With baseline, changed cells get a dot and a floating bar shows \"3 changes · Review · Discard · Save\". The review lists every change as text and flags sensitive grants."),
    ex("plans", "Plan entitlements", "permission-matrix/plans.tsx", PermissionMatrixPlans, "Features × plans with boolean cells, relabelled Included / Not included, inside a scroll area with sticky headers."),
  ],
  api: [
    { name: "PermissionMatrix", props: [
      { name: "resources", type: "{ id; label; group?; description?; actions?: string[] }[]", description: "Rows. group makes collapsible sections; actions limits which cells apply (others show \"Not applicable\")." },
      { name: "actions", type: "{ id; label; scoped?; danger? }[]", description: "Columns. scoped → None/Own/Team/All; danger highlights full grants." },
      { name: "value / defaultValue / onValueChange", type: "Record<resource, Record<action, Scope | boolean>>", description: "Missing entries are not granted (or inherited)." },
      { name: "scopes", type: "{ id: Scope; label: string }[]", description: "Rename scope levels (default from the dictionary)." },
      { name: "inherited / inheritedFrom", type: "PermissionValue / string", description: "Parent role values shown locked until overridden." },
      { name: "baseline", type: "PermissionValue", description: "Saved value: enables change dots, the save bar and the review dialog." },
      { name: "onSave", type: "(value, changes) => Promise<void> | void", description: "Save button in the bar and the review dialog." },
      { name: "subject", type: "string", default: '"this role"', description: "Named in the review dialog." },
      { name: "dependencies", type: "{ action: string; requires: string }[]", description: "Kept consistent both ways; changes are announced." },
      { name: "onDependencyApplied", type: "(message: string) => void", description: "Show a toast: \"View enabled because Edit requires it\"." },
      { name: "readOnly", type: "boolean", default: "false", description: "System roles: no toggles, cells stay navigable." },
      { name: "maxHeight", type: "string", description: "Scroll area height for sticky headers." },
      { name: "labels", type: "Partial<PermissionMatrixLabels>", description: "Built-in strings (permissionMatrix namespace)." },
    ] },
    { name: "PermissionCompare", props: [
      { name: "subjects", type: "{ id; label; description?; value }[]", description: "Roles or plans as columns." },
      { name: "resources / actions / scopes", type: "as above", description: "Rows are resource × action." },
      { name: "onlyDifferences", type: "boolean", default: "false", description: "Hide rows where every subject agrees." },
      { name: "highlightDifferences", type: "boolean", default: "true", description: "Tint rows that differ." },
    ] },
    { name: "PermissionDiff", props: [
      { name: "changes", type: "PermissionChange[]", description: "From diffPermissions(a, b)." },
      { name: "resources / actions", type: "as above", description: "For labels." },
    ] },
    { name: "core", props: [
      { name: "diffPermissions(a, b)", type: "PermissionChange[]", description: "{ resource, action, from, to } per changed cell (none / false / missing are equal)." },
      { name: "applyDependencies(value, deps, { changed })", type: "{ value, adjusted[] }", description: "Raises requirements or lowers dependents depending on what changed." },
    ] },
  ],
  notes: [
    "Keyboard: arrows move (roving tabindex, mirrored in RTL), Home/End go to the row edges, Ctrl+Home/End to the grid corners. Space toggles, Enter opens the scope menu, 1–4 pick a scope, Delete resets an override. The header row and row headers are part of the grid: their buttons grant or revoke a whole column or row.",
    "Every cell has a full name (\"Quotes, Delete: Team\"); colour never stands alone. Sticky headers sit on an opaque surface and never blur.",
  ],
  covers: ["Permission matrix"],
};

export default entry;
