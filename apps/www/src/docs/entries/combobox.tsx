import { ex, type DocEntry } from "../types";
import ComboboxDemo from "../examples/combobox/demo";
import ComboboxMultiple from "../examples/combobox/multiple";
import ComboboxAsync from "../examples/combobox/async";
import ComboboxCreatable from "../examples/combobox/creatable";
import ComboboxLocaleSearch from "../examples/combobox/locale-search";
import ComboboxRichItems from "../examples/combobox/rich-items";
import ComboboxInline from "../examples/combobox/inline";

const entry: DocEntry = {
  slug: "combobox",
  title: "Combobox",
  group: "Forms & inputs",
  description:
    "Searchable selection — single or multiple, static or server-backed, optionally creatable: country, assignee, labels, category. Search folds locale characters (“istanbul” finds “İstanbul”, “cagri” finds “Çağrı”) and highlights matches by weight. Multi-select shows removable chips; async search is debounced, abortable and paged through useAsyncList.",
  source: ["components/combobox.tsx", "lib/use-async-list.ts", "lib/text.ts", "components/popover.tsx", "components/badge.tsx"],
  basedOn: "cmdk + Radix Popover",
  usage: `import { Combobox, Field } from "@vamos-ui/react";

<Field label="Country">
  <Combobox name="country" items={countries} clearable />
</Field>

<Combobox multiple items={labels} defaultValue={["bug"]} maxVisibleChips={3} />

<Combobox
  loadItems={(q, signal, cursor) => fetch(\`/api/people?q=\${q}&after=\${cursor ?? ""}\`, { signal }).then((r) => r.json())}
  getValue={(p) => p.id}
  getLabel={(p) => p.name}
/>`,
  demo: ex("demo", "Demo", "combobox/demo.tsx", ComboboxDemo),
  examples: [
    ex("multiple", "Multiple with chips (helpdesk)", "combobox/multiple.tsx", ComboboxMultiple, "The list stays open while you pick. Chips are Badges with a remove button; ←/→ move between chips, Backspace or Delete removes one, and maxVisibleChips collapses the rest into +N."),
    ex("async", "Server search with paging", "combobox/async.tsx", ComboboxAsync, "loadItems is debounced (200 ms), aborts the superseded request and caches per query. Return { items, cursor } and the list loads the next page on scroll or via “Show more results”. selectedItems supplies labels for initial values."),
    ex("creatable", "Create on the fly (CMS)", "combobox/creatable.tsx", ComboboxCreatable, "onCreate shows “Create “…”” for unknown text. Return the new item (or a promise of it) and it is selected."),
    ex("locale-search", "81 provinces, accent-free search", "combobox/locale-search.tsx", ComboboxLocaleSearch, "Under tr-TR the search folds İ/ı and ç ğ ö ş ü, so “sanliurfa” and “IGDIR” match. Plate codes are keywords."),
    ex("rich-items", "Avatar and email rows (CRM)", "combobox/rich-items.tsx", ComboboxRichItems, "renderItem draws the row; the highlighted label comes in as state.highlight. keywords make email and company searchable."),
    ex("inline", "Inline list (permissions)", "combobox/inline.tsx", ComboboxInline, 'mode="inline" renders the search and list in place — for settings panels and side sheets. Named by the surrounding Field.'),
  ],
  api: [
    {
      name: "Combobox",
      props: [
        { name: "items", type: "T[]", description: "Static items, filtered client-side (prefix > word start > contains, locale-folded)." },
        { name: "loadItems", type: "(query, signal, cursor?) => Promise<T[] | { items, cursor }>", description: "Server search. Debounced, aborted when superseded, cached per query, paged with cursor." },
        { name: "debounce", type: "number", default: "200", description: "ms before loadItems runs after typing." },
        { name: "multiple", type: "boolean", default: "false", description: "Select several values; the trigger shows chips." },
        { name: "value / defaultValue", type: "string | null  ·  string[] (multiple)", description: "Selected value(s). Controlled when value is not undefined." },
        { name: "onValueChange", type: "(value, item) => void  ·  (values, items) => void", description: "Called with the value(s) and the matching item(s)." },
        { name: "getValue / getLabel", type: "(item: T) => string", default: "item.value / item.label", description: "Read any item shape." },
        { name: "getKeywords / getDisabled / getGroup", type: "(item: T) => …", default: "item.keywords / .disabled / .group", description: "Extra search text, disabled rows, group headings." },
        { name: "renderItem", type: "(item, { selected, query, highlight }) => ReactNode", description: "Custom row content; the check indicator is added for you." },
        { name: "onCreate", type: "(query) => T | void | Promise<T | void>", description: "Adds a “Create “…”” row. Return the item to select it." },
        { name: "selectedItems", type: "T[]", description: "Items for initial values not in the current list (async)." },
        { name: "mode", type: '"popover" | "inline"', default: '"popover"', description: "Floating list under a trigger, or search + list in place." },
        { name: "clearable", type: "boolean", default: "false", description: "× button to clear the selection." },
        { name: "maxVisibleChips", type: "number", description: "multiple: collapse further chips into +N (announced as “N more selected”)." },
        { name: "closeOnSelect", type: "boolean", default: "true single · false multiple", description: "Close the popover after picking." },
        { name: "placeholder / searchPlaceholder", type: "string", description: "Trigger text with no selection · search box placeholder (also its accessible name)." },
        { name: "emptyMessage", type: "ReactNode", default: '"No results"', description: "Shown when nothing matches." },
        { name: "size / variant", type: '"sm" | "md" | "lg"  ·  "default" | "ghost" | "pill"', default: '"md" · "default"', description: "Same box as Input and Select." },
        { name: "loading", type: "boolean", description: "Static items are still loading (spinner + aria-busy)." },
        { name: "name", type: "string", description: "Hidden input(s); multiple submits one entry per value (formData.getAll)." },
        { name: "disabled / readOnly / invalid / required", type: "boolean", description: "Also inherited from Field." },
        { name: "open / defaultOpen / onOpenChange", type: "boolean / (open) => void", description: "Control the popover." },
        { name: "className / contentClassName / listClassName", type: "string", description: "Root box · popover panel · list (max height)." },
        { name: "labels", type: "Partial<ComboboxLabels>", description: "search, empty, create, results, error, retry, loadMore, clear, remove, more…" },
      ],
    },
    {
      name: "useAsyncList",
      props: [
        { name: "load", type: "(query, signal, cursor?) => Promise<T[] | { items, cursor }>", description: "The loader. Absent = idle." },
        { name: "query", type: "string", description: "Each change starts a debounced first-page request; the previous one is aborted." },
        { name: "debounce / enabled / cache / minQueryLength", type: "number / boolean / boolean / number", default: "200 / true / true / 0", description: "Timing, pause (e.g. while closed), per-query cache, minimum query length." },
        { name: "→ returns", type: "{ items, loading, loadingMore, error, hasMore, loadedQuery, loadMore(), reload() }", description: "State for a custom list (Record picker, User picker, Tag input suggestions)." },
      ],
    },
  ],
  notes: [
    "WAI-ARIA combobox + listbox: the search box owns aria-activedescendant; ↑/↓ move, Enter selects, Esc closes and returns focus to the trigger.",
    "The result count is announced politely while you type. Async loading sets aria-busy on the list; errors show a retry button.",
    "Matches are emphasised with weight (font-semibold), not the accent colour, so they stay readable on glass.",
  ],
  covers: ["Combobox"],
};

export default entry;
