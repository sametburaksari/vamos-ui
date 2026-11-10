import { ex, type DocEntry } from "../types";
import ListLayoutDemo from "../examples/list-layout/demo";
import ListLayoutStates from "../examples/list-layout/states";
import ListLayoutBulk from "../examples/list-layout/bulk";
import ListLayoutGrid from "../examples/list-layout/grid";
import ListLayoutMobile from "../examples/list-layout/mobile";

const entry: DocEntry = {
  slug: "list-layout",
  title: "List layout",
  group: "Page layouts",
  description:
    "The standard index page — Page header, a sticky toolbar (search, filters, saved views, view switch), a bulk-action bar that takes the toolbar's place, the content (table, grid or board) and footer pagination — with one consistent set of loading, refreshing, empty, no-results and error states. It arranges and announces; filtering, selection and data fetching stay with your Data Table and data layer.",
  source: ["components/list-layout.tsx", "styles/navigation.css"],
  basedOn: "Radix Toggle Group (view switch) · Sheet (mobile filters)",
  usage: `import { ListLayout, ListToolbar, ListViewSwitch, ListBulkBar, ListContent, ListFooter, PageHeader, PaginationBar } from "@vamos-ui/react";

<ListLayout>
  <PageHeader title="Contacts" meta={<Badge>1,284</Badge>} actions={<Button variant="primary">New contact</Button>} />
  <ListToolbar
    search={<Input leading={<Search />} placeholder="Search contacts" aria-label="Search contacts" />}
    filters={<FilterBar … />}
    filterCount={2}
    viewSwitch={<ListViewSwitch value={view} onValueChange={setView} options={[{ value: "table", label: "Table" }, { value: "board", label: "Board" }]} />}
  />
  <ListBulkBar count={selected.length} total={1284} onSelectAll={selectAll} onClear={clear}>
    <Button size="sm">Assign owner</Button>
  </ListBulkBar>
  <ListContent state={state} resultCount={1284} onRetry={refetch} onClearFilters={clearFilters}>
    <DataTable … />
  </ListContent>
  <ListFooter><PaginationBar total={1284} page={page} pageSize={20} onPageChange={setPage} /></ListFooter>
</ListLayout>`,
  demo: ex("demo", "Demo", "list-layout/demo.tsx", ListLayoutDemo),
  examples: [
    ex("states", "States", "list-layout/states.tsx", ListLayoutStates, "Every ListContentState. refreshing keeps the rows and shows a thin bar; the change is announced in a polite live region (\"3 results\"). Override any placeholder with empty / noResults / error / skeleton."),
    ex("bulk", "Selection and bulk bar", "list-layout/bulk.tsx", ListLayoutBulk, "The bar replaces the toolbar while count > 0 and announces \"2 selected\". \"Select all 312\" widens the selection across pages (allSelected). Esc clears and focus returns to the toolbar."),
    ex("grid", "Grid view", "list-layout/grid.tsx", ListLayoutGrid, "ListViewSwitch is a radio group with one tab stop; arrow keys move, Space selects. A CMS media library with a \"Load more\" footer."),
    ex("mobile", "Phone width", "list-layout/mobile.tsx", ListLayoutMobile, "The layout responds to its own width: below ~640px filters fold into a \"Filters (3)\" sheet and the view switch shows icons only."),
  ],
  api: [
    { name: "ListLayout", props: [
      { name: "width", type: '"full" | "wide" | "content"', default: '"full"', description: "Max width: none · 90rem · 76rem." },
      { name: "stickyToolbar", type: "boolean", default: "true", description: "Toolbar and bulk bar stick under the top bar on the bar surface." },
      { name: "stickyTop", type: "number | string", default: '"var(--topbar-h)"', description: "Sticky offset. Use 0 inside your own scroll container." },
    ] },
    { name: "ListToolbar", props: [
      { name: "search", type: "ReactNode", description: "Search field, wrapped in a role=\"search\" landmark." },
      { name: "searchLabel", type: "string", default: '"Search"', description: "Name of the search landmark." },
      { name: "filters", type: "ReactNode", description: "Filter chips / Filter bar. Fold into a sheet below ~640px." },
      { name: "filterCount", type: "number", description: "Active filters, shown on the folded \"Filters (3)\" button." },
      { name: "views", type: "ReactNode", description: "Saved views — a row above the search." },
      { name: "viewSwitch", type: "ReactNode", description: "Usually a ListViewSwitch." },
      { name: "actions", type: "ReactNode", description: "Trailing actions: export, columns, ⋯." },
      { name: "labels", type: "ListLayoutLabels", description: "Overrides for the list namespace." },
    ] },
    { name: "ListViewSwitch", props: [
      { name: "options", type: "{ value: string; label: string; icon?: ReactNode }[]", description: "Views. With an icon the label hides on narrow lists (still the accessible name)." },
      { name: "value · defaultValue · onValueChange", type: "string", description: "Controlled or uncontrolled. A view is always selected." },
      { name: "label", type: "string", default: '"View"', description: "Accessible name of the radio group." },
    ] },
    { name: "ListBulkBar", props: [
      { name: "count", type: "number", description: "Selected rows. The bar shows while count > 0." },
      { name: "total", type: "number", description: "All matching rows; enables \"Select all {total}\"." },
      { name: "onSelectAll", type: "() => void", description: "Select every matching row across pages." },
      { name: "allSelected", type: "boolean", description: "Shows \"All {total} selected\"." },
      { name: "onClear", type: "() => void", description: "Clear button and Esc." },
      { name: "children", type: "ReactNode", description: "Bulk actions." },
    ] },
    { name: "ListContent", props: [
      { name: "state", type: '"ready" | "loading" | "refreshing" | "empty" | "no-results" | "error"', default: '"ready"', description: "What the content area shows; loading and refreshing set aria-busy." },
      { name: "empty · noResults · error · skeleton", type: "ReactNode", description: "Replace the default placeholders." },
      { name: "onRetry", type: "() => void", description: "Adds \"Try again\" to the default error state." },
      { name: "onClearFilters", type: "() => void", description: "Adds \"Clear filters\" to the default no-results state." },
      { name: "resultCount", type: "number", description: "Announced politely when the list becomes ready." },
      { name: "skeletonRows", type: "number", default: "6", description: "Rows in the default skeleton." },
    ] },
    { name: "ListFooter", props: [{ name: "className", type: "string", description: "Row under the content: PaginationBar, Load more, a summary." }] },
  ],
  notes: [
    "Selection lives in your Data Table; ListBulkBar is presentational. The same goes for filters and saved views.",
    "Built-in strings use the list namespace: selected, selectAllCount, allSelected, clear, filters, filtersCount, results, refreshing, noResults, clearFilters, error, retry.",
  ],
  covers: ["List layout"],
};

export default entry;
