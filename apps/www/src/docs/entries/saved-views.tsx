import { ex, type DocEntry } from "../types";
import SavedViewsDemo from "../examples/saved-views/demo";
import SavedViewsTeamScope from "../examples/saved-views/team-scope";
import SavedViewsSelectVariant from "../examples/saved-views/select-variant";
import SavedViewsWithDataTable from "../examples/saved-views/with-data-table";

const entry: DocEntry = {
  slug: "saved-views",
  title: "Saved views",
  group: "Data display",
  description:
    "Named list configurations — “My open deals”, “Probation ending”, “Partners at risk” — as tabs above any list. A view stores filters, sort, columns and density; edits show a Modified strip with Save, Save as new and Reset. Personal or team scope, a default view, share links with ?sv=, and a dropdown form for narrow headers. Persistence stays in your app.",
  source: ["data-table/saved-views.tsx", "data-table/view-state.ts", "data-table/types.ts"],
  basedOn: "Tabs pattern (manual activation) + Radix Dropdown Menu + Dialog",
  usage: `import { SavedViews } from "@vamos-cms/ui/data-table";

<SavedViews
  views={views}
  activeId={activeId}
  current={currentViewState}
  onSelect={setActiveId}
  onReset={reset}
  onSave={createView}
  onUpdate={updateView}
/>

// Inside a DataTable the binding is automatic:
<DataTableSavedViews views={views} onSave={createView} onUpdate={updateView} />`,
  demo: ex("demo", "Views over filters (CRM)", "saved-views/demo.tsx", SavedViewsDemo, "Change a filter to mark the view modified; rename, duplicate, set default, copy link and delete from ⋯."),
  examples: [
    ex("team-scope", "Team views and permissions (CMS)", "saved-views/team-scope.tsx", SavedViewsTeamScope, "canEdit decides who may overwrite or delete; read-only views can be saved as a new personal view."),
    ex("select-variant", "Dropdown and overflow (PRM)", "saved-views/select-variant.tsx", SavedViewsSelectVariant, "variant=\"select\" (automatic under 420px) and maxVisible tabs with the rest under More."),
    ex("with-data-table", "Bound to a Data Table", "saved-views/with-data-table.tsx", SavedViewsWithDataTable, "DataTableSavedViews applies the view to the table and computes dirty state with viewStateEqual."),
  ],
  api: [
    {
      name: "SavedViews",
      props: [
        { name: "views", type: "SavedView[]", description: "{ id, name, state: ViewState, scope: personal | team, isDefault?, icon?, ownerId?, system? }." },
        { name: "activeId", type: "string | null", description: "Active view; null = All (unsaved)." },
        { name: "current", type: "ViewState", description: "The live list configuration (from useDataTable().savedViewsBinding or your own list)." },
        { name: "isDirty", type: "boolean", description: "Default: !viewStateEqual(current, active.state) — order-insensitive, ignores clause ids and page." },
        { name: "onSelect", type: "(id: string | null) => void", description: "Tabs use manual activation: arrows move focus, Enter / Space switch (switching usually fetches)." },
        { name: "onSave", type: "({ name, scope, isDefault?, state? }) => SavedView | Promise<SavedView | void>", description: "Create from the dialog (current state) or Duplicate (state set). Resolve with the stored view to activate it." },
        { name: "onUpdate", type: "(id, state) => void | Promise<void>", description: "Save: overwrite the active view." },
        { name: "onRename / onDelete / onSetDefault", type: "(id, …) => void | Promise<void>", description: "⋯ menu actions. Delete confirms first; deleting the active view falls back to the default." },
        { name: "onReset", type: "() => void", description: "Drop unsaved changes." },
        { name: "getShareUrl", type: "(id) => string", description: "Copy link. Default: the current URL with sv=<id>." },
        { name: "permissions", type: "{ canCreateTeam?, canEdit?(view) }", description: "Team scope in the dialog; who may save, rename and delete. System views are never editable." },
        { name: "variant", type: '"auto" | "tabs" | "select"', default: '"auto"', description: "auto switches to select under 420px of container width." },
        { name: "showAll", type: "boolean", default: "true", description: "Built-in “All” entry." },
        { name: "maxVisible", type: "number", default: "4", description: "Tabs before More (the active view always stays visible)." },
        { name: "sortByName", type: "boolean", default: "false", description: "Sort with the locale collator (system views first)." },
        { name: "panelId", type: "string", description: "aria-controls target (the list the tabs drive)." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Tab height." },
        { name: "labels", type: "Partial<SavedViewsLabels>", description: "Built-in strings (savedViews namespace)." },
      ],
    },
    {
      name: "Helpers",
      props: [
        { name: "viewStateEqual(a, b)", type: "boolean", description: "Order-insensitive comparison used for dirty state." },
        { name: "toViewState(listState)", type: "ViewState", description: "What a view stores (no page position; keeps page size)." },
        { name: "applyViewState(list, view, id, base?)", type: "ListState", description: "Apply a view and reset to the first page." },
        { name: "resolveInitialView(views, urlId)", type: "SavedView | null", description: "URL sv → the default view → All." },
      ],
    },
  ],
  notes: ["The ⋯ actions button sits next to the tablist (not inside it), so the tablist only contains tabs.", "Dirty state is announced politely (“View modified.”)."],
  covers: ["Saved views"],
};

export default entry;
