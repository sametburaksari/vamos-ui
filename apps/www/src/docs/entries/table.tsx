import { ex, type DocEntry } from "../types";
import TableDemo from "../examples/table/demo";
import TableDensity from "../examples/table/density";
import TableSticky from "../examples/table/sticky";
import TableNumeric from "../examples/table/numeric";
import TableStates from "../examples/table/states";
import TableEmptyExample from "../examples/table/empty";

const entry: DocEntry = {
  slug: "table",
  title: "Table",
  group: "Data display",
  description:
    "Styled semantic table primitives for small and static data — invoice lines, settings lists, chart data. Row height and cell padding follow the density axis (--row-h, --cell-px); numbers align to the end with tabular figures; the header and first column can stick without ever blurring.",
  source: ["components/table.tsx", "styles/data.css"],
  basedOn: "Native <table>",
  usage: `import { Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";

<TableContainer aria-label="Invoice lines">
  <Table>
    <TableCaption>Invoice INV-2041</TableCaption>
    <TableHeader>
      <TableRow><TableHead>Item</TableHead><TableHead numeric>Amount</TableHead></TableRow>
    </TableHeader>
    <TableBody>
      <TableRow><TableCell>Design retainer</TableCell><TableCell numeric>$4,500.00</TableCell></TableRow>
    </TableBody>
  </Table>
</TableContainer>`,
  demo: ex("demo", "Invoice lines", "table/demo.tsx", TableDemo),
  examples: [
    ex("density", "Density", "table/density.tsx", TableDensity, "compact / comfortable / spacious set --row-h and --cell-px on the table; \"inherit\" (default) follows the page data-density."),
    ex("sticky", "Sticky header and first column", "table/sticky.tsx", TableSticky, "Give TableContainer a maxHeight. Sticky cells use an opaque surface mix (never blur); the edges fade while there is more to scroll."),
    ex("numeric", "Numbers and sorting (CRM)", "table/numeric.tsx", TableNumeric, "numeric end-aligns with tabular mono figures (also in RTL). onSort turns the header into a button with aria-sort."),
    ex("states", "Row states (HR)", "table/states.tsx", TableStates, "highlighted (accent bar on the start edge), selected, disabled — with bordered=\"grid\"."),
    ex("empty", "Empty", "table/empty.tsx", TableEmptyExample, "TableEmpty spans every column and renders the kit's Empty state; children become its actions."),
  ],
  api: [
    { name: "Table", props: [
      { name: "density", type: '"inherit" | "compact" | "comfortable" | "spacious"', default: '"inherit"', description: "Row height and cell padding via --row-h / --cell-px." },
      { name: "striped", type: "boolean", default: "false", description: "Zebra rows." },
      { name: "hover", type: "boolean", default: "true", description: "Row hover tint." },
      { name: "bordered", type: '"rows" | "grid" | "none"', default: '"rows"', description: "Hairlines between rows, around every cell, or none." },
      { name: "stickyHeader", type: "boolean", default: "false", description: "Header stays visible while the container scrolls (opaque fill)." },
      { name: "stickyFirstColumn", type: "boolean", default: "false", description: "Pins the first column (inset-inline-start, RTL-aware)." },
      { name: "layout", type: '"auto" | "fixed"', default: '"auto"', description: "fixed honours the widths you set on TableHead." },
      { name: "aria-label", type: "string", description: "Required unless the table has a TableCaption (dev warning)." },
    ] },
    { name: "TableContainer", props: [
      { name: "aria-label", type: "string", description: "Names the focusable scroll region (role=\"region\", tabIndex 0)." },
      { name: "maxHeight", type: "string", description: "Vertical scroll limit, e.g. \"24rem\" — needed for stickyHeader." },
    ] },
    { name: "TableHead", props: [
      { name: "numeric", type: "boolean", default: "false", description: "End-aligned header for a number column." },
      { name: "align", type: '"start" | "center" | "end"', description: "Explicit alignment (logical)." },
      { name: "sort", type: '"asc" | "desc" | false', description: "Current sort; sets aria-sort and the icon." },
      { name: "onSort", type: "() => void", description: "Makes the label a sort button." },
      { name: "scope", type: '"col" | "colgroup"', default: '"col"', description: "Header scope." },
    ] },
    { name: "TableCell", props: [
      { name: "numeric", type: "boolean", default: "false", description: "text-end, tabular, mono, no wrap." },
      { name: "align", type: '"start" | "center" | "end"', description: "Explicit alignment." },
      { name: "truncate", type: "boolean | number", description: "true → one line with ellipsis; a number clamps to that many lines." },
      { name: "rowHeader", type: "boolean", default: "false", description: "Render as <th scope=\"row\">." },
    ] },
    { name: "TableRow", props: [
      { name: "selected", type: "boolean", description: "data-state=\"selected\" + aria-selected." },
      { name: "disabled", type: "boolean", description: "Muted row, aria-disabled." },
      { name: "highlighted", type: "boolean", description: "Accent bar at the start edge." },
    ] },
    { name: "TableCaption", props: [
      { name: "visuallyHidden", type: "boolean", default: "false", description: "Caption for screen readers only." },
      { name: "side", type: '"top" | "bottom"', default: '"bottom"', description: "Caption position." },
    ] },
    { name: "TableEmpty", props: [
      { name: "colSpan", type: "number", description: "Required. Columns to span." },
      { name: "title", type: "ReactNode", default: '"No results"', description: "Main line (dictionary table.empty)." },
      { name: "description", type: "ReactNode", description: "Secondary line." },
      { name: "icon", type: "ReactNode | false", description: "Replace or hide the icon." },
      { name: "children", type: "ReactNode", description: "Actions (e.g. Clear filters)." },
    ] },
    { name: "TableHeader / TableBody / TableFooter", props: [{ name: "...props", type: "HTMLAttributes", description: "thead / tbody / tfoot." }] },
  ],
  notes: [
    "For sorting, filtering, selection and pagination at scale use Data Table — it renders with these primitives.",
    "Glass: sticky header and pinned column use color-mix(var(--surface), var(--scene)) — opaque, so rows never show through, and no extra blur layer.",
  ],
  covers: ["Table"],
};

export default entry;
