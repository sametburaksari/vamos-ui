import { ex, type DocEntry } from "../types";
import FilterBarDemo from "../examples/filter-bar/demo";
import FilterBarQuickFacets from "../examples/filter-bar/quick-facets";
import FilterBarAsyncOptions from "../examples/filter-bar/async-options";
import FilterBarRelativeDates from "../examples/filter-bar/relative-dates";
import FilterBarBoard from "../examples/filter-bar/board";
import FilterBarStates from "../examples/filter-bar/states";

const entry: DocEntry = {
  slug: "filter-bar",
  title: "Filter bar",
  group: "Data display",
  description:
    "Structured filters as chips above any collection — tables, boards, calendars, galleries. “+ Filter” walks field → condition + value in one popover; every chip segment edits in place. Operators follow the field type, dates can be relative, options can load from the server, and the value is a plain FilterGroup you can put in a URL or a saved view.",
  source: ["data-table/filter-bar.tsx", "data-table/types.ts", "data-table/filter-fns.ts"],
  basedOn: "Radix Popover + cmdk",
  usage: `import { FilterBar, applyFilters, type FilterFieldDef, type FilterGroup } from "@vamos-ui/react/data-table";

const fields: FilterFieldDef[] = [
  { field: "stage", label: "Stage", type: "enum", options: stageOptions, quick: true },
  { field: "value", label: "Deal value", type: "currency" },
];
const [filters, setFilters] = React.useState<FilterGroup>({ logic: "and", clauses: [] });

<FilterBar fields={fields} value={filters} onChange={setFilters} resultCount={applyFilters(deals, filters, fields).length} />`,
  demo: ex("demo", "Every field type (CRM)", "filter-bar/demo.tsx", FilterBarDemo, "Grouped fields, enum / currency / date / user (with Me) / text / tags."),
  examples: [
    ex("quick-facets", "Quick filters with counts (HR)", "filter-bar/quick-facets.tsx", FilterBarQuickFacets, "quick: true pins an empty dashed chip; facets show how many rows each option would keep."),
    ex("async-options", "Server-searched options", "filter-bar/async-options.tsx", FilterBarAsyncOptions, "options can be (q) => Promise<FilterOption[]> — debounced, with a spinner, labels cached for the chips."),
    ex("relative-dates", "Relative dates", "filter-bar/relative-dates.tsx", FilterBarRelativeDates, "Presets and “Last N days/weeks/months”, resolved at query time so saved views stay current."),
    ex("board", "Above a board, synced to the URL", "filter-bar/board.tsx", FilterBarBoard, "Not table-bound: encodeFilters / decodeFilters keep a standalone bar in ?board_f=…"),
    ex("states", "Read-only, sheet, collapsed, disabled", "filter-bar/states.tsx", FilterBarStates, "A shared-link preview without ×, the mobile sheet layout, maxVisibleChips and size sm."),
  ],
  api: [
    {
      name: "FilterBar",
      props: [
        { name: "fields", type: "FilterFieldDef[]", description: "The filterable fields. From a Data Table: filterFieldsFromColumns(columns)." },
        { name: "value / defaultValue / onChange", type: "FilterGroup", description: '{ logic: "and" | "or", clauses } — controlled or uncontrolled. Incomplete clauses are never committed.' },
        { name: "q / onQChange / searchPlaceholder", type: "string · (q) => void", description: "Shows a search box at the start when onQChange is set." },
        { name: "facets", type: "Record<field, Record<value, number>>", description: "Option counts in the value list." },
        { name: "resultCount", type: "number", description: "Announced after each change (“Filter added: Value at least $5,000. 84 results.”)." },
        { name: "maxVisibleChips", type: "number", description: "Collapse the rest into “+N”." },
        { name: "layout", type: '"auto" | "inline" | "sheet"', default: '"auto"', description: "auto switches to a “Filters (n)” button + bottom Sheet under 480px of container width." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Chip height (md follows --control-h)." },
        { name: "disabled / readOnly", type: "boolean", description: "readOnly hides × and the add button (shared-link previews)." },
        { name: "me", type: "{ id, name }", description: 'Adds “Me” to user fields, stored as the symbolic "$me".' },
        { name: "addRequest", type: "{ field, key } | null", description: "Open the editor for a field programmatically (Data Table “Filter by this column”)." },
        { name: "actions", type: "ReactNode", description: "Extra controls at the end of the bar." },
        { name: "labels", type: "Partial<FilterBarLabels>", description: "All strings, including operator phrases (op_in…) and the {field} {op} {value} sentence template for word order." },
      ],
    },
    {
      name: "FilterFieldDef",
      props: [
        { name: "field / label / type", type: "string · string · FieldType", description: "text, number, currency, percent, date, datetime, enum, boolean, user, tags." },
        { name: "ops", type: "FilterOp[]", description: "Allowed operators. Defaults per type: text contains…, numbers eq/gt/between…, dates on/before/after/between/relative, enum/user/tags in/notIn/isEmpty." },
        { name: "options", type: "FilterOption[] | (q) => Promise<FilterOption[]>", description: "Static or server-searched options ({ value, label, icon?, tone?, keywords? })." },
        { name: "quick", type: "boolean", description: "Always visible as an empty dashed chip." },
        { name: "multiple", type: "boolean", default: "true", description: "Enum: false = single value (eq / neq)." },
        { name: "group / icon / placeholder / currency", type: "string · Component · string · string", description: "Picker section, icon, value placeholder, ISO currency." },
        { name: "accessor", type: "(row) => unknown", description: "applyFilters: read the value from a row (default row[field])." },
      ],
    },
    {
      name: "FilterChip",
      props: [
        { name: "clause / field", type: "FilterClause · FilterFieldDef", description: "Field │ condition │ value │ × — each segment is a button with a full name." },
        { name: "onEdit / onRemove", type: '(step: "field" | "value", trigger) => void · () => void', description: "Delete / Backspace on × also removes." },
        { name: "readOnly / disabled / size", type: "boolean · boolean · sm | md", description: "Presentation states." },
      ],
    },
  ],
  notes: [
    "Keyboard: the bar is one toolbar tab stop; ←/→, Home/End move between chip segments. In the popover type to search fields, Backspace on an empty input goes back a step, Enter applies, Esc cancels.",
    "Matching is locale-aware (Turkish İ/ı folding) and between is inclusive; dates compare by calendar day in the provider’s time zone. A server must implement the same semantics (see filter-fns.ts).",
  ],
  covers: ["Filter bar"],
};

export default entry;
