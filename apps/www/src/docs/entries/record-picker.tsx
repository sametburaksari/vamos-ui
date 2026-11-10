import { ex, type DocEntry } from "../types";
import RecordPickerDemo from "../examples/record-picker/demo";
import RecordPickerMultiple from "../examples/record-picker/multiple";
import RecordPickerCreate from "../examples/record-picker/create";
import RecordPickerBrowse from "../examples/record-picker/browse";
import RecordPickerCard from "../examples/record-picker/card";
import RecordPickerInitialValues from "../examples/record-picker/initial-values";
import RecordPickerStates from "../examples/record-picker/states";

const entry: DocEntry = {
  slug: "record-picker",
  title: "Record picker",
  group: "Pickers",
  description:
    "Link one or many related records from any collection — a contact to a company, a post to its author, an order to a customer, a task to a project. Async search (debounced, abortable, paged), recent picks, inline create, a browse dialog for big sets, chips or cards, and ids → labels resolution with a deleted-record state. The kit never knows your API: you pass a RecordSource.",
  source: ["components/record-picker.tsx", "components/avatar.tsx", "lib/text.ts"],
  basedOn: "Radix Popover + WAI-ARIA combobox / listbox",
  usage: `import { Field, RecordPicker, type RecordSource } from "@vamos-ui/react";

const companies: RecordSource<Company> = {
  key: "companies",
  search: (q, { signal, cursor }) => api.companies.search({ q, cursor }, { signal }),
  getByIds: (ids, signal) => api.companies.byIds(ids, { signal }),
  getId: (c) => c.id,
  getLabel: (c) => c.name,
  getDescription: (c) => c.domain,
};

<Field label="Company">
  <RecordPicker source={companies} value={companyId} onValueChange={setCompanyId} />
</Field>`,
  demo: ex("demo", "Demo", "record-picker/demo.tsx", RecordPickerDemo),
  examples: [
    ex("multiple", "Multiple (related posts)", "record-picker/multiple.tsx", RecordPickerMultiple, "multiple renders chips that link to the record (href) with their own remove button. max disables the rest of the list. Backspace in an empty search removes the last chip. arrayRecordSource searches an in-memory list with locale folding."),
    ex("create", "Create inline", "record-picker/create.tsx", RecordPickerCreate, "onCreate adds a “Create “query”” row when nothing matches exactly. Return the new record; it is cached and selected."),
    ex("browse", "Browse dialog & paging", "record-picker/browse.tsx", RecordPickerBrowse, "Results page through nextCursor (Load more). browse adds a dialog with a bigger list and checkboxes; pass a function instead to render your own Data Table with filters."),
    ex("card", "Cards on a detail page", "record-picker/card.tsx", RecordPickerCard, 'display="card" shows each record on an inset card with avatar, open link and remove. Good for record detail pages (CRM deal, HR employee).'),
    ex("initial-values", "Resolving ids", "record-picker/initial-values.tsx", RecordPickerInitialValues, "Only ids in the value? getByIds resolves them (skeleton chips meanwhile). Ids that don't come back show a warning “Unknown record” chip you can remove. Pass selectedRecords to skip the round trip."),
    ex("states", "States & sizes", "record-picker/states.tsx", RecordPickerStates, "Error, disabled and read-only through Field (read-only chips stay links). size sm for tables and toolbars."),
  ],
  api: [
    {
      name: "RecordPicker",
      props: [
        { name: "source", type: "RecordSource<R>", description: "How to search and label the collection (see below)." },
        { name: "multiple", type: "boolean", default: "false", description: "Pick many. Changes value to string[]." },
        { name: "value", type: "string | null  ·  string[]", description: "Controlled id(s). Empty is null (single) or [] (multi)." },
        { name: "defaultValue", type: "string | null  ·  string[]", description: "Initial id(s) (uncontrolled)." },
        { name: "onValueChange", type: "(id, record) => void  ·  (ids, records) => void", description: "Called with the new id(s) and the resolved record(s)." },
        { name: "max", type: "number", description: "Multi: most records that can be picked." },
        { name: "selectedRecords", type: "R[]", description: "Records for the initial value, so labels show without calling getByIds." },
        { name: "renderItem", type: "(r, { selected, disabled, query }) => ReactNode", description: "Custom option row. Default: avatar, label and description with matches in bold." },
        { name: "getDisabled", type: "(r) => boolean", description: "Records that can't be picked (archived, no access). Already-selected ones still show." },
        { name: "getGroup", type: "(r) => string | undefined", description: "Group results under headings." },
        { name: "onCreate", type: "(query) => R | Promise<R>", description: "Adds a “Create “query”” row. The returned record is selected." },
        { name: "browse", type: "boolean | (props) => ReactNode", description: "true: built-in browse dialog. Function: render your own dialog; call onPick(records)." },
        { name: "recent", type: "R[] | false", default: "session history", description: "Shown when the query is empty. Default: the last 5 picks from this source." },
        { name: "actions", type: "RecordPickerAction<R>[]", description: "Pinned rows on top (“Assign to me”). onSelect gets { select, close, query }." },
        { name: "resolveSelection", type: "(r) => R | R[] | Promise<…>", description: "Replace what a pick adds (a team → its members)." },
        { name: "display", type: '"chip" | "card"', default: '"chip"', description: "How selected records render." },
        { name: "mode", type: '"popover" | "inline"', default: '"popover"', description: "inline renders the search list without a trigger (side panels)." },
        { name: "renderTrigger", type: "(ctx) => ReactElement", description: "Custom trigger (an avatar stack, a table-cell button). Must forward ref and props." },
        { name: "header", type: "ReactNode", description: "Content above the search box (tabs, filters)." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Follows the density axis." },
        { name: "placeholder", type: "string", default: '"Select…" / "Add…"', description: "Trigger text when empty." },
        { name: "searchPlaceholder", type: "string", default: '"Search…"', description: "Search box placeholder and accessible name." },
        { name: "clearable", type: "boolean", default: "true unless required", description: "Single: the × clear button." },
        { name: "name", type: "string", description: "Hidden input(s) for native form posts; multi repeats the name (FormData.getAll)." },
        { name: "disabled / readOnly / invalid / required", type: "boolean", description: "Also read from the surrounding Field." },
        { name: "open / defaultOpen / onOpenChange", type: "boolean / (open) => void", description: "Popover state." },
        { name: "labels", type: "Partial<RecordPickerLabels>", description: "Override built-in strings (dictionary namespace recordPicker)." },
      ],
    },
    {
      name: "RecordSource<R>",
      props: [
        { name: "key", type: "string", description: "Cache key for the collection; records are cached per key for the session." },
        { name: "search", type: "(query, { signal, cursor, locale }) => Promise<{ items, nextCursor? }>", description: "Server search. Debounced 200 ms and aborted when the query changes. Fold case and accents server-side too." },
        { name: "getByIds", type: "(ids, signal) => Promise<R[]>", description: "Resolve labels for ids you already have." },
        { name: "getId / getLabel", type: "(r) => string", description: "Identity and display text." },
        { name: "getDescription", type: "(r) => string | undefined", description: "Second line (email, domain, SKU)." },
        { name: "getAvatar", type: "(r) => { src?, name, shape? }", description: "Avatar for rows, chips and cards." },
        { name: "href", type: "(r) => string | undefined", description: "Chips and cards link to the record." },
      ],
    },
    {
      name: "arrayRecordSource(key, items, options)",
      props: [
        { name: "getId / getLabel / getDescription / getAvatar / href", type: "(r) => …", description: "As in RecordSource." },
        { name: "getKeywords", type: "(r) => string[]", description: "Extra searchable text." },
        { name: "pageSize", type: "number", default: "50", description: "Results per page." },
        { name: "delay", type: "number", default: "0", description: "Fake latency in ms (prototypes)." },
      ],
    },
  ],
  notes: [
    "Search on the server should fold like the client: in Postgres, unaccent(lower(name)) with a Turkish collation, so “istanbul” finds “İstanbul” and “cagri” finds “Çağrı”.",
    "Using TanStack Query? Wrap it in search: (q, { signal }) => queryClient.fetchQuery({ queryKey: ['companies', q], queryFn: () => api(q, { signal }) }).",
    "clearRecordPickerCache(key?) drops the session caches (after a logout, in tests).",
  ],
  covers: ["Record picker (relation)"],
};

export default entry;
