import { ex, type DocEntry } from "../types";
import DataTableDemo from "../examples/data-table/demo";
import DataTableServerMode from "../examples/data-table/server-mode";
import DataTableWithFiltersAndViews from "../examples/data-table/with-filters-and-views";
import DataTableInlineEdit from "../examples/data-table/inline-edit";
import DataTableColumnManagement from "../examples/data-table/column-management";
import DataTableVirtual from "../examples/data-table/virtual";
import DataTableMobileCards from "../examples/data-table/mobile-cards";
import DataTableStates from "../examples/data-table/states";
import DataTableHeadless from "../examples/data-table/headless";

const entry: DocEntry = {
  slug: "data-table",
  title: "Data Table",
  group: "Data display",
  description:
    "The backbone of every list screen. Sorting (Shift for multi-sort), locale-aware search, column visibility, order, widths and pinning, row selection with a bulk bar that can select all matching rows across pages, pagination, server mode with URL state, inline editing with rollback, virtual rows, a container-width card layout and CSV export — on one serializable ListState shared with Filter bar and Saved views.",
  source: ["data-table/data-table.tsx", "data-table/types.ts", "data-table/filter-fns.ts", "data-table/url-state.ts", "data-table/csv.ts", "styles/data.css"],
  basedOn: "TanStack Table v9 + TanStack Virtual",
  usage: `import { DataTable, type DataTableColumn } from "@vamos-cms/ui/data-table";

const columns: DataTableColumn<Contact>[] = [
  { id: "name", header: "Name", accessor: "name" },
  { id: "stage", header: "Stage", accessor: "stage", type: "enum", options: stageOptions },
  { id: "value", header: "Deal value", accessor: "value", type: "currency" },
];

<DataTable caption="Contacts" columns={columns} data={contacts} getRowId={(c) => c.id} selectable bulkActions={actions} />`,
  demo: ex("demo", "Posts (CMS)", "data-table/demo.tsx", DataTableDemo, "Sort, search, select, bulk Publish / Move to trash with Undo, row actions and CSV export."),
  examples: [
    ex("server-mode", "Server mode + URL state (CRM)", "data-table/server-mode.tsx", DataTableServerMode, "12,480 contacts. onStateChange is the single entry point — apply only the latest requestId. Select the page, then “Select all 12,480”."),
    ex("filters-views", "Filter bar + Saved views (HR)", "data-table/with-filters-and-views.tsx", DataTableWithFiltersAndViews, "Composed layout. Change a filter on a view to see Modified → Save / Save as new / Reset; the column menu’s “Filter by this column” opens the bar."),
    ex("inline-edit", "Inline editing with rollback", "data-table/inline-edit.tsx", DataTableInlineEdit, "Text, select, currency, date and switch editors. Optimistic save with a spinner; a rejected save restores the value and shows why."),
    ex("columns", "Column management", "data-table/column-management.tsx", DataTableColumnManagement, "Resize (drag, ←/→, double-click to fit), pin to start/end, hide, reorder and density from View. storageKey remembers it per browser."),
    ex("virtual", "10,000 rows, virtualised", "data-table/virtual.tsx", DataTableVirtual, "virtual + pagination=\"none\": only the visible rows are rendered, inside a native table with aria-rowcount / aria-rowindex."),
    ex("mobile", "Container-width cards", "data-table/mobile-cards.tsx", DataTableMobileCards, "Under 640px of container width rows become cards: title, subtitle, badge, label:value meta, checkbox and actions."),
    ex("states", "Loading, empty, no results, error", "data-table/states.tsx", DataTableStates, "First load shows skeleton rows shaped by column type; refreshing keeps the data under a thin bar; errors keep the last rows."),
    ex("headless", "Custom toolbar with useDataTable", "data-table/headless.tsx", DataTableHeadless, "Compose the parts and drive the state yourself; table is the TanStack v9 instance."),
  ],
  api: [
    {
      name: "DataTable",
      props: [
        { name: "columns", type: "DataTableColumn<T>[]", description: "Column definitions (see below)." },
        { name: "data", type: "T[]", description: "Rows. Client mode: every row. Server mode: the current page (or every loaded row for load-more)." },
        { name: "getRowId", type: "(row: T) => string", description: "Stable row id (selection, edits, keys)." },
        { name: "caption", type: "string", description: "Required accessible name. Hidden visually unless showCaption." },
        { name: "showCaption", type: "boolean", default: "false", description: "Show the caption above the table." },
        { name: "mode", type: '"client" | "server"', default: '"client"', description: "Server mode turns off client sorting, search, filters and paging; you load rows from onStateChange." },
        { name: "rowCount", type: "number", description: "Server mode: total matching rows." },
        { name: "state / defaultState", type: "Partial<ListState>", description: "Controlled (any subset) or initial q, filters, sort, page, columns, density, view." },
        { name: "onStateChange", type: "(next, reason, requestId) => void", description: "Every change with its reason (search, filters, sort, page, pageSize, columns, density, view, reset). Search is debounced 300 ms; filter, search and sort changes reset the page." },
        { name: "urlState", type: "boolean | UrlStateOptions", default: "false", description: "Sync q, filters, sort, page, size and view (sv) with the URL. Options: prefix, keys, adapter, history, density." },
        { name: "storageKey", type: "string", description: "Remember column visibility, order, widths, pins and density in localStorage." },
        { name: "loading", type: "boolean", default: "false", description: "Without data: skeleton rows. With data: refreshing bar, data stays." },
        { name: "error", type: "{ message, onRetry? } | null", description: "Danger alert above the table with a retry button; loaded rows stay." },
        { name: "pagination", type: '"pages" | "load-more" | "infinite" | "none"', default: '"pages"', description: "Pagination bar, a Load more button, an intersection-observed sentinel (with a button fallback) or nothing." },
        { name: "pageSizes", type: "number[]", default: "[25, 50, 100]", description: "Rows-per-page options; the first is the default size." },
        { name: "onLoadMore / hasMore", type: "() => Promise<void> · boolean", description: "For load-more and infinite." },
        { name: "cursors", type: "{ prev, next }", description: "Cursor pagination: set page to { cursor, size } in state and pass the neighbouring cursors." },
        { name: "virtual", type: "boolean | { estimateRowHeight?, overscan?, height? }", default: "false", description: "Render only visible rows (TanStack Virtual). Height defaults to 32rem. A dev warning fires past 300 rendered rows without it." },
        { name: "selectable", type: 'boolean | "single"', default: "false", description: "Checkbox column, Shift-click ranges, `x` toggles the focused row, Esc clears." },
        { name: "selection / defaultSelection / onSelectionChange", type: "DataTableSelection", description: '{ mode: "ids", ids } or, for “select all” in server mode, { mode: "all", except, filters, q, total } — resets when the query changes.' },
        { name: "rowSelectable", type: "(row) => boolean | string", description: "A string disables the checkbox and explains why." },
        { name: "bulkActions", type: "DataTableBulkAction<T>[]", description: "Up to three inline, the rest in ⋯. confirm opens an Alert Dialog; run may return { undo }." },
        { name: "rowActions", type: "(row) => MenuEntry[]", description: "⋯ menu in a pinned last column (also in cards)." },
        { name: "rowHref / onRowClick", type: "(row) => string · (row) => void", description: "The title cell becomes a real link; the whole row is clickable by pointer." },
        { name: "onCellEdit", type: "({ row, rowId, columnId, value }) => Promise<void>", description: "Persist an inline edit. Reject (an Error message is shown) to roll back." },
        { name: "navigation", type: '"table" | "grid"', default: '"table"', description: "grid: WAI-ARIA data grid with arrow keys, Home/End, PageUp/PageDown, Ctrl+Home/End, Enter/F2 to edit." },
        { name: "readOnly", type: "boolean", default: "false", description: "Turns off inline editing." },
        { name: "empty / noResults", type: "ReactNode", description: "No data at all vs. a search/filter that matches nothing (default has Clear filters)." },
        { name: "mobile", type: '"cards" | "priority" | "scroll"', default: '"cards"', description: "Under 640px of container width: cards, drop priority 3 then 2 columns, or scroll with a sticky first column." },
        { name: "export", type: "{ filename, formatted?, onServerExport? }", description: "Adds the Export menu: page, selected or all rows as CSV (UTF-8 BOM, locale delimiter, formula guard)." },
        { name: "density", type: '"inherit" | "compact" | "comfortable" | "spacious"', default: '"inherit"', description: "Table-local density; View › Density writes state.density." },
        { name: "variant", type: '"card" | "flush"', default: '"card"', description: "Own surface, or full width for list screens." },
        { name: "toolbar", type: "ReactNode", description: "Extra toolbar content in the default layout." },
        { name: "shortcuts", type: "boolean", default: "true", description: "`/` search, Esc clear selection, `x` toggle focused row (within the table)." },
        { name: "me", type: "{ id, name }", description: "Resolves “Me” in user filters." },
        { name: "labels", type: "Partial<DataTableLabels>", description: "Override built-in strings (dataTable namespace)." },
        { name: "children", type: "ReactNode", description: "Compose DataTableToolbar, DataTableSearch, DataTableFilterBar, DataTableSavedViews, DataTableViewOptions, DataTableExport, DataTableContent, DataTableFooter yourself." },
      ],
    },
    {
      name: "DataTableColumn<T>",
      props: [
        { name: "id / header", type: "string", description: "Stable id and the label used in the header, column menu, CSV, cards and filter field." },
        { name: "accessor", type: "keyof T | (row) => unknown", description: "Value of the cell. Omit for display-only columns." },
        { name: "type", type: "FieldType", default: '"text"', description: "text, number, currency, percent, date, datetime, enum, boolean, user, tags — formatting, alignment, sorting, operators and editor." },
        { name: "cell", type: "(ctx) => ReactNode", description: "Custom cell ({ row, value, rowId, index, column })." },
        { name: "options", type: "FilterOption[]", description: "enum labels, badge tones and sort order (shared with the Filter bar)." },
        { name: "currency", type: "string", description: "ISO 4217 for currency columns (default: the locale provider’s)." },
        { name: "sortable / sortValue", type: "boolean · (row) => string | number", description: "Sorting uses Intl.Collator(locale, { numeric: true }); enums sort by option order." },
        { name: "searchable", type: "boolean", description: "Included in the global search (default: text, enum, user, tags)." },
        { name: "filter", type: "Partial<FilterFieldDef> | false", description: "Filter field overrides (quick, ops, icon, async options)." },
        { name: "edit", type: "DataTableCellEditor<T> | false", description: "{ type: text | number | currency | date | select | boolean, options?, validate? } or { type: custom, render }." },
        { name: "mobile", type: '"title" | "subtitle" | "meta" | "badge" | "avatar" | "hidden"', description: "Role in the card layout." },
        { name: "priority", type: "1 | 2 | 3", description: 'mobile="priority": which columns drop first.' },
        { name: "exportValue", type: "(row) => string | number | null", description: "CSV value (default: raw value)." },
        { name: "hideable / pinnable / resizable", type: "boolean", default: "true", description: "The title column is never hideable." },
        { name: "size / minSize / maxSize", type: "number", description: "Widths in px (defaults by type)." },
        { name: "defaultVisible", type: "boolean", default: "true", description: "Start hidden (still available in View)." },
      ],
    },
    {
      name: "useDataTable()",
      props: [
        { name: "table", type: "ReactTable", description: "TanStack v9 instance (escape hatch)." },
        { name: "state / setState(patch, reason)", type: "ListState", description: "The list state and its setter." },
        { name: "selection / setSelection", type: "DataTableSelection", description: "Current selection." },
        { name: "pageRows / filteredRows / total", type: "T[] · T[] · number", description: "Rows on the page, after search + filters, and the total." },
        { name: "filterBarProps", type: "FilterBarProps subset", description: "Spread onto a FilterBar placed anywhere inside." },
        { name: "savedViewsBinding(views)", type: "SavedViewsProps subset", description: "activeId, current, onSelect, onReset for SavedViews." },
        { name: "exportCsv({ scope, filename, formatted })", type: "function", description: "Download page, selected or all rows." },
      ],
    },
    {
      name: "List-state helpers",
      props: [
        { name: "serializeListState / parseListState", type: "(state, opts) ⇄ (search, opts)", description: "React-free; parse in a server component so the first HTML has the right rows. Unknown fields and operators are dropped." },
        { name: "mergeListStateIntoSearch", type: "(search, state, opts) => string", description: "Replace the list’s own params and keep the rest." },
        { name: "createHistoryAdapter / createMemoryAdapter", type: "UrlStateAdapter", description: "history.replaceState (works with Next.js useSearchParams) or in-memory." },
        { name: "applyFilters / searchRows", type: "function", description: "The client filter semantics a server should match (between inclusive, dates by calendar day in timeZone, relative resolved at query time)." },
        { name: "toCsv / escapeCsvCell / csvDelimiter / downloadCsv", type: "function", description: "The CSV writer behind Export." },
        { name: "filterFieldsFromColumns", type: "(columns) => FilterFieldDef[]", description: "Filter bar fields from table columns." },
      ],
    },
  ],
  notes: [
    "TanStack Table v9 is isolated inside the component; you write DataTableColumn objects, not TanStack ColumnDefs.",
    "Glass budget: rows, sticky headers and pinned cells are opaque mixes — the only blurred layer is the card (and the floating bulk bar on mobile).",
    "Dates in data are YYYY-MM-DD strings; money is a decimal string. Both are formatted with the locale provider (try tr-TR: ; CSV delimiter, ₺, İ/ı-aware search).",
  ],
  covers: ["Data Table"],
};

export default entry;
