"use client";

import * as React from "react";
import {
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  functionalUpdate,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type Column,
  type Header,
  type Row,
  type ReactTable,
  type Updater,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Columns3,
  Download,
  EyeOff,
  ListFilter,
  MoreHorizontal,
  Pin,
  PinOff,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { useLink } from "../lib/provider";
import { getCollator } from "../lib/text";
import { useControllableState, useIsomorphicLayoutEffect } from "../lib/use-controllable-state";
import { useContainerWidth } from "../lib/use-container-width";
import type { MenuEntry } from "../lib/variants";
import { controlVariants } from "../lib/variants";
import { Alert } from "../components/alert";
import { ConfirmDialog } from "../components/alert-dialog";
import { Avatar } from "../components/avatar";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Checkbox, type CheckboxCheckedState } from "../components/checkbox";
import { ActionMenu, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/dropdown-menu";
import { EmptyState } from "../components/empty-state";
import { Input } from "../components/input";
import { CursorPagination, PaginationBar } from "../components/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { Skeleton } from "../components/skeleton";
import { Spinner } from "../components/spinner";
import { Switch } from "../components/switch";
import { Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "../components/table";
import { toast } from "../components/toast";
import { FilterBar, type FilterBarProps } from "./filter-bar";
import { applyFilters, hasActiveFilters, searchRows } from "./filter-fns";
import { SavedViews, type SavedViewsProps } from "./saved-views";
import { csvDelimiter, downloadCsv, toCsv, type CsvCell } from "./csv";
import { applyViewState, toViewState } from "./view-state";
import { createHistoryAdapter, mergeListStateIntoSearch, parseListState, type UrlStateOptions } from "./url-state";
import {
  createListState,
  emptyFilterGroup,
  emptySelection,
  isCursorPage,
  isRowSelected,
  selectionCount,
  type DataTableSelection,
  type FieldType,
  type FilterFieldDef,
  type FilterGroup,
  type FilterOption,
  type ListDensity,
  type ListState,
  type ListStateChangeReason,
  type SavedView,
  type SortClause,
  type ViewState,
} from "./types";

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

export const dataTableLabels = {
  search: "Search",
  searchPlaceholder: "Search…",
  selectPageRows: "Select all rows on this page",
  selectRow: "Select {name}",
  selectedCount: "{count} selected",
  selectedOnPage: "{count} on this page",
  selectPage: "Select all {count} on this page",
  selectAllMatching: "Select all {count}",
  allSelected: "All {count} selected",
  clearSelection: "Clear selection",
  clear: "Clear",
  selectionReset: "Selection cleared because the filters changed.",
  bulkActions: "Bulk actions",
  moreActions: "More actions",
  rowActions: "Actions for {name}",
  view: "View",
  viewOptions: "View options",
  columns: "Columns",
  findColumn: "Find a column",
  density: "Density",
  compact: "Compact",
  comfortable: "Comfortable",
  spacious: "Spacious",
  resetColumns: "Reset to default",
  moveUp: "Move {name} up",
  moveDown: "Move {name} down",
  sortAsc: "Sort ascending",
  sortDesc: "Sort descending",
  clearSort: "Clear sort",
  sortBy: "Sort by {name}",
  sortOrder: "sort {index}",
  pinStart: "Pin to start",
  pinEnd: "Pin to end",
  unpin: "Unpin",
  hide: "Hide column",
  filterBy: "Filter by this column",
  columnMenu: "{name} column options",
  resize: "Resize {name} column",
  export: "Export",
  exportPage: "Rows on this page",
  exportSelected: "Selected rows",
  exportAll: "All rows",
  exportAllServer: "All matching rows",
  exportStarted: "Export started — you’ll get the file shortly.",
  exported: "{count, plural, one {# row exported} other {# rows exported}}",
  emptyTitle: "Nothing here yet",
  emptyDescription: "Records you add will show up here.",
  noResultsTitle: "No results for these filters",
  noResultsDescription: "Try a different search or remove a filter.",
  clearFilters: "Clear filters",
  errorTitle: "Couldn’t load the list",
  retry: "Try again",
  loading: "Loading…",
  refreshing: "Updating the list",
  loadMore: "Load more",
  noMore: "You’ve reached the end.",
  edit: "{column}: {value}. Edit",
  editHint: "Press Enter to save, Escape to cancel.",
  saving: "Saving…",
  saveFailed: "Couldn’t save {column}. The previous value is back.",
  invalid: "Invalid value",
  yes: "Yes",
  no: "No",
  none: "—",
  cancel: "Cancel",
  bulkDone: "{action}: {count, plural, one {# record} other {# records}}",
  bulkFailed: "{action} failed. Nothing was changed.",
  undo: "Undo",
  undone: "Undone",
  rowCount: "{count, plural, one {# row} other {# rows}}",
};
export type DataTableLabels = typeof dataTableLabels;
type LabelFn = ReturnType<typeof useLabels<DataTableLabels>>;

/* ------------------------------------------------------------------ */
/* Public types                                                        */
/* ------------------------------------------------------------------ */

export interface DataTableCellContext<T> {
  row: T;
  value: unknown;
  rowId: string;
  /** Index on the current page. */
  index: number;
  column: DataTableColumn<T>;
}

/** Inline editor of a column. Optimistic: the cell shows the new value while `onCellEdit` runs. */
export type DataTableCellEditor<T> =
  | {
      type: "text" | "number" | "currency" | "date" | "select" | "boolean";
      /** For `select`. */
      options?: FilterOption[];
      /** Return an error message to keep the editor open. */
      validate?: (value: unknown, row: T) => string | null;
    }
  | { type: "custom"; render: (ctx: { value: unknown; row: T; commit: (value: unknown) => void; cancel: () => void }) => React.ReactNode };

export interface DataTableColumn<T> {
  /** Stable id (state, URL, CSV). */
  id: string;
  /** Header text — also the column menu, CSV header, mobile label and filter field name. */
  header: string;
  /** Property name or function. Omit for display-only columns (then provide `cell`). */
  accessor?: (keyof T & string) | ((row: T) => unknown);
  /** Custom cell. Default: formatted by `type`. */
  cell?: (ctx: DataTableCellContext<T>) => React.ReactNode;
  /** Decides formatting, alignment, sorting, filter operators and editor. Default `"text"`. */
  type?: FieldType;
  align?: "start" | "center" | "end";
  /** Options for `enum` (labels + badge tones) — shared with the Filter bar. */
  options?: FilterOption[];
  /** ISO 4217 for `currency`. Default: the locale provider's currency. */
  currency?: string;
  /** Default: `true` when the column has an accessor. */
  sortable?: boolean;
  /** Value used for sorting. Default: the accessor value (enum: option order). */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Included in the global search. Default: text, enum, user and tags columns. */
  searchable?: boolean;
  /** Generates a Filter bar field (`false` = not filterable). */
  filter?: Partial<Omit<FilterFieldDef, "field" | "label" | "type">> | false;
  edit?: DataTableCellEditor<T> | false;
  /** Role in the mobile card. Default: the first column is the title, the rest `meta`. */
  mobile?: "title" | "subtitle" | "meta" | "badge" | "avatar" | "hidden";
  /** `mobile="priority"`: 3 hides first under 640px, then 2 under 480px. */
  priority?: 1 | 2 | 3;
  /** CSV value. Default: the raw accessor value. */
  exportValue?: (row: T) => string | number | null;
  /** Default `true` (the first column is never hideable). */
  hideable?: boolean;
  /** Default `true`. */
  pinnable?: boolean;
  /** Default `true`. */
  resizable?: boolean;
  /** Width in px. */
  size?: number;
  minSize?: number;
  maxSize?: number;
  /** Render as a row header (`<th scope="row">`). Default: the title column. */
  rowHeader?: boolean;
  /** Visible by default. Default `true`. */
  defaultVisible?: boolean;
}

export interface DataTableBulkAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  tone?: "default" | "danger";
  /** Shows an Alert Dialog first. `description` receives the count. */
  confirm?: { title: string; description?: (count: number) => string; confirmLabel?: string };
  /** `true` disables; a string disables and explains why (tooltip). */
  disabled?: (selection: DataTableSelection, rows: T[]) => boolean | string;
  /** `rows` are the selected rows that are loaded (all of them in client mode). Return `{ undo }` to offer Undo. */
  run: (selection: DataTableSelection, rows: T[]) => Promise<void | { undo?: () => Promise<void> | void }> | void | { undo?: () => Promise<void> | void };
}

export interface DataTableExportOptions {
  /** File name without extension. */
  filename: string;
  /** Write formatted values ("$4,800.00") instead of raw ones. Default `false`. */
  formatted?: boolean;
  /** Server mode "All matching rows" → your export endpoint. */
  onServerExport?: (state: ListState, selection?: DataTableSelection) => Promise<void> | void;
}

export interface DataTableProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  /** Names the table for assistive tech (required). Hidden visually unless `showCaption`. */
  caption: string;
  showCaption?: boolean;
  /** `"client"` (default) sorts, searches, filters and pages in the browser; `"server"` hands the state to you. */
  mode?: "client" | "server";
  /** Server mode: total matching rows. */
  rowCount?: number;
  /** Controlled list state (any subset). */
  state?: Partial<ListState>;
  defaultState?: Partial<ListState>;
  /** One entry point for every change. `requestId` increases; apply only the latest response. Search is debounced 300ms. */
  onStateChange?: (next: ListState, reason: ListStateChangeReason, requestId: number) => void;
  /** Sync q, filters, sort, page and view with the URL. */
  urlState?: boolean | UrlStateOptions;
  /** Remember column visibility, order, widths, pins and density in localStorage under this key. */
  storageKey?: string;
  loading?: boolean;
  error?: { message: React.ReactNode; onRetry?: () => void } | null;
  pagination?: "pages" | "load-more" | "infinite" | "none";
  /** Default `[25, 50, 100]`. */
  pageSizes?: number[];
  onLoadMore?: () => Promise<void> | void;
  hasMore?: boolean;
  /** Cursor pagination (server): the cursors around the current page. */
  cursors?: { prev: string | null; next: string | null };
  /** Render only visible rows. Use with `pagination="none"` / `"infinite"` for long lists. */
  virtual?: boolean | { estimateRowHeight?: number; overscan?: number; height?: string };
  /** Checkbox column + bulk bar. `"single"` = one row at a time. */
  selectable?: boolean | "single";
  selection?: DataTableSelection;
  defaultSelection?: DataTableSelection;
  onSelectionChange?: (selection: DataTableSelection) => void;
  bulkActions?: DataTableBulkAction<T>[];
  /** Whether a row can be selected; a string explains why not. */
  rowSelectable?: (row: T) => boolean | string;
  onRowClick?: (row: T) => void;
  /** Makes the title cell a real link; the whole row is clickable by pointer. */
  rowHref?: (row: T) => string;
  /** "⋯" menu in the last column. */
  rowActions?: (row: T) => MenuEntry[];
  /** Persist an inline edit. Reject to roll back (the message is shown). */
  onCellEdit?: (edit: { row: T; rowId: string; columnId: string; value: unknown }) => Promise<void> | void;
  readOnly?: boolean;
  /** `"grid"`: ARIA grid with arrow-key cell navigation (spreadsheet-like editing). Default `"table"`. */
  navigation?: "table" | "grid";
  /** Accessible text of a row ("Jane Cooper"). Default: the title column. */
  getRowLabel?: (row: T) => string;
  /** No data at all (first use). */
  empty?: React.ReactNode;
  /** Data, but the search / filters match nothing. */
  noResults?: React.ReactNode;
  /** Under 640px of container width: `cards` (default), `priority` (drop columns) or `scroll`. */
  mobile?: "cards" | "priority" | "scroll";
  export?: DataTableExportOptions;
  /** Table-local density. `"inherit"` follows the page. */
  density?: "inherit" | ListDensity;
  /** `card`: inside its own surface. `flush`: full width (WordPress-style list screens). */
  variant?: "card" | "flush";
  /** Extra toolbar content (a Filter bar, Saved views…) for the default layout. */
  toolbar?: React.ReactNode;
  /** `/` search, Esc clear selection, `x` toggle the focused row. Default `true`. */
  shortcuts?: boolean;
  /** Current user for "Me" filters on user fields. */
  me?: { id: string; name: string };
  labels?: Partial<DataTableLabels>;
  /** Compose the parts yourself (`DataTableToolbar`, `DataTableContent`, `DataTableFooter`…). */
  children?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Column helpers                                                      */
/* ------------------------------------------------------------------ */

const SELECT = "__select";
const ACTIONS = "__actions";

const DEFAULT_SIZE: Record<FieldType, number> = { text: 220, number: 120, currency: 140, percent: 110, date: 140, datetime: 180, enum: 150, boolean: 110, user: 200, tags: 220 };
const END_TYPES = new Set<FieldType>(["number", "currency", "percent"]);

export function readColumnValue<T>(col: DataTableColumn<T>, row: T): unknown {
  if (!col.accessor) return undefined;
  return typeof col.accessor === "function" ? col.accessor(row) : (row as Record<string, unknown>)[col.accessor];
}

const columnAlign = <T,>(col: DataTableColumn<T>) => col.align ?? (END_TYPES.has(col.type ?? "text") ? "end" : "start");

/** Filter bar fields from Data Table columns (`filter: false` opts out; display-only columns are skipped). */
export function filterFieldsFromColumns<T>(cols: DataTableColumn<T>[]): FilterFieldDef[] {
  return cols
    .filter((c) => c.accessor && c.filter !== false)
    .map((c) => ({
      field: c.id,
      label: c.header,
      type: c.type ?? "text",
      options: c.options,
      currency: c.currency,
      accessor: (row: T) => readColumnValue(c, row),
      ...(c.filter || {}),
    }));
}

const textOf = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.map(textOf).join(" ");
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return String(o.name ?? o.label ?? o.title ?? o.id ?? "");
  }
  return String(v);
};

/* ------------------------------------------------------------------ */
/* TanStack v9 setup (isolated here)                                   */
/* ------------------------------------------------------------------ */

const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnPinningFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});
type Features = typeof features;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TRow<T> = Row<Features, any>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TColumn<T> = Column<Features, any, unknown>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type THeader<T> = Header<Features, any, unknown>;

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface CellStatus {
  value: unknown;
  status: "saving" | "saved" | "error";
  error?: string;
}

export interface DataTableContextValue<T = any> {
  /** The TanStack v9 table instance (escape hatch). */
  table: ReactTable<Features, any>;
  state: ListState;
  setState: (patch: Partial<ListState>, reason?: ListStateChangeReason) => void;
  selection: DataTableSelection;
  setSelection: (s: DataTableSelection) => void;
  /** Columns by id. */
  columns: DataTableColumn<T>[];
  /** Filter fields generated from the columns. */
  fields: FilterFieldDef[];
  /** Rows on the current page. */
  pageRows: T[];
  /** Every row after search and filters (client) or the loaded rows (server). */
  filteredRows: T[];
  /** Total matching rows. */
  total: number;
  /** Bind a Filter bar: `<FilterBar {...filterBarProps} />`. */
  filterBarProps: Pick<FilterBarProps, "fields" | "value" | "onChange" | "q" | "onQChange" | "addRequest" | "resultCount" | "me">;
  /** Bind Saved views: `<SavedViews {...savedViewsBinding(views)} … />`. */
  savedViewsBinding: (views: SavedView[]) => Pick<SavedViewsProps, "activeId" | "current" | "onSelect" | "onReset">;
  /** Download a CSV of the page, the selection or every row. */
  exportCsv: (o?: { scope?: "page" | "selected" | "all"; filename?: string; formatted?: boolean }) => void;
  /** Ask a bound Filter bar to open its editor for a column. */
  requestFilter: (columnId: string) => void;
  /** @internal */
  props: DataTableProps<T>;
  /** @internal */
  internal: Internal<T>;
}

interface Internal<T> {
  t: LabelFn;
  width: number | undefined;
  narrow: boolean;
  cards: boolean;
  searchRef: React.RefObject<HTMLInputElement | null>;
  filterBound: boolean;
  setFilterBound: (b: boolean) => void;
  editing: { rowId: string; columnId: string } | null;
  setEditing: (e: { rowId: string; columnId: string } | null) => void;
  cellStatus: Record<string, CellStatus>;
  commitEdit: (row: T, rowId: string, col: DataTableColumn<T>, value: unknown) => void;
  announce: (msg: string) => void;
  rowLabel: (row: T) => string;
  titleColumn: DataTableColumn<T> | undefined;
  orderedColumns: TColumn<T>[];
  defaultColumns: ListState["columns"];
  lastClicked: React.MutableRefObject<number | null>;
  isSelectable: (row: T) => boolean | string;
  hasQuery: boolean;
  requestId: React.MutableRefObject<number>;
  filterRequest: { field: string; key: number } | null;
}

const DataTableContext = React.createContext<DataTableContextValue | null>(null);

/**
 * The table's state and helpers, for custom layouts and bindings inside `<DataTable>`.
 *
 * ```tsx
 * const { state, selection, exportCsv, filterBarProps } = useDataTable<Contact>();
 * ```
 */
export function useDataTable<T = unknown>(): DataTableContextValue<T> {
  const ctx = React.useContext(DataTableContext);
  if (!ctx) throw new Error("useDataTable must be used inside <DataTable>.");
  return ctx as DataTableContextValue<T>;
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

function readPrefs(key: string): Partial<Pick<ListState, "columns" | "density">> | null {
  try {
    const raw = window.localStorage.getItem(`vamos-ui:dt:${key}`);
    return raw ? (JSON.parse(raw) as Partial<Pick<ListState, "columns" | "density">>) : null;
  } catch {
    return null;
  }
}
function writePrefs(key: string, v: Pick<ListState, "columns" | "density">) {
  try {
    window.localStorage.setItem(`vamos-ui:dt:${key}`, JSON.stringify(v));
  } catch {
    /* storage blocked */
  }
}

/* ------------------------------------------------------------------ */
/* DataTable                                                           */
/* ------------------------------------------------------------------ */

const sameJSON = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The backbone of every list screen: sorting, search, filters, column management, selection and
 * bulk actions, inline editing, pagination, server mode, URL state, mobile cards and CSV.
 * Built on TanStack Table v9 — `useDataTable().table` is the escape hatch.
 *
 * ```tsx
 * <DataTable caption="Contacts" columns={columns} data={contacts} getRowId={(c) => c.id} selectable bulkActions={actions} />
 * ```
 */
export function DataTable<T>(props: DataTableProps<T>) {
  const {
    columns,
    data,
    getRowId,
    mode = "client",
    rowCount,
    state: stateProp,
    defaultState,
    onStateChange,
    urlState,
    storageKey,
    pagination = "pages",
    pageSizes = [25, 50, 100],
    selectable,
    selection: selectionProp,
    defaultSelection,
    onSelectionChange,
    rowSelectable,
    onCellEdit,
    getRowLabel,
    mobile = "cards",
    density = "inherit",
    variant = "card",
    shortcuts = true,
    labels,
    me,
    children,
    className,
    caption: _caption,
    showCaption: _showCaption,
    loading: _loading,
    error: _error,
    onLoadMore: _onLoadMore,
    hasMore: _hasMore,
    cursors: _cursors,
    virtual: _virtual,
    bulkActions: _bulk,
    onRowClick: _orc,
    rowHref: _rh,
    rowActions: _ra,
    readOnly: _ro,
    navigation: _nav,
    empty: _empty,
    noResults: _nr,
    export: _export,
    toolbar,
    ...rest
  } = props;
  const t = useLabels("dataTable", dataTableLabels, labels);
  const { locale, timeZone, dir } = useLocale();
  const server = mode === "server";

  /* ---- columns ---- */
  const defaultColumns = React.useMemo<ListState["columns"]>(() => {
    const visible: Record<string, boolean> = {};
    for (const c of columns) if (c.defaultVisible === false) visible[c.id] = false;
    return { visible, order: columns.map((c) => c.id), sizing: {}, pinned: { start: [], end: [] }, ...defaultState?.columns };
  }, [columns, defaultState?.columns]);
  const titleColumn = columns.find((c) => c.mobile === "title") ?? columns.find((c) => c.accessor) ?? columns[0];
  const fields = React.useMemo(() => filterFieldsFromColumns(columns), [columns]);

  /* ---- list state (any subset can be controlled) ---- */
  const base = React.useMemo(() => createListState({ ...defaultState, columns: defaultColumns }, pageSizes[0] ?? 25), [defaultState, defaultColumns, pageSizes]);
  const [internal, setInternal] = React.useState<ListState>(base);
  const state: ListState = React.useMemo(() => ({ ...internal, ...stateProp }) as ListState, [internal, stateProp]);
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const requestId = React.useRef(0);
  const onStateChangeRef = React.useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  const setState = React.useCallback((patch: Partial<ListState>, reason: ListStateChangeReason = "reset") => {
    const prev = stateRef.current;
    let next: ListState = { ...prev, ...patch };
    // A new query starts at the first page.
    if ((reason === "search" || reason === "filters" || reason === "sort" || reason === "pageSize") && !("page" in patch && reason === "pageSize")) {
      next = { ...next, page: isCursorPage(next.page) ? { cursor: null, size: next.page.size } : { index: 0, size: next.page.size } };
    }
    if (sameJSON(prev, next)) return;
    stateRef.current = next;
    setInternal(next);
    requestId.current += 1;
    onStateChangeRef.current?.(next, reason, requestId.current);
  }, []);

  /* ---- URL state ---- */
  const urlOptions = urlState ? (urlState === true ? {} : urlState) : null;
  const adapter = React.useMemo(() => (urlOptions ? (urlOptions.adapter ?? createHistoryAdapter()) : null), [urlOptions?.adapter, Boolean(urlOptions)]); // eslint-disable-line react-hooks/exhaustive-deps
  // "pending": the URL was just read; skip one write so the pre-parse state never overwrites it.
  const urlReady = React.useRef<boolean | "pending">(false);
  React.useEffect(() => {
    if (!adapter || !urlOptions) return;
    const load = () => {
      const parsed = parseListState(adapter.read(), { ...urlOptions, fields, defaults: { ...base, columns: stateRef.current.columns }, pageSizes });
      setState({ q: parsed.q, filters: parsed.filters, sort: parsed.sort, page: parsed.page, view: parsed.view, ...(urlOptions.density ? { density: parsed.density } : {}) }, "reset");
    };
    load();
    urlReady.current = "pending";
    return adapter.subscribe(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter]);
  React.useEffect(() => {
    if (!adapter || !urlOptions || !urlReady.current) return;
    if (urlReady.current === "pending") {
      urlReady.current = true;
      return;
    }
    adapter.write(mergeListStateIntoSearch(adapter.read(), state, { ...urlOptions, defaults: base }), urlOptions.history ?? "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter, state.q, JSON.stringify(state.filters), JSON.stringify(state.sort), JSON.stringify(state.page), state.view, state.density]);

  /* ---- column prefs in localStorage ---- */
  const prefsLoaded = React.useRef(false);
  React.useEffect(() => {
    if (!storageKey) return;
    const prefs = readPrefs(storageKey);
    prefsLoaded.current = true;
    if (prefs && !stateRef.current.view) setState({ columns: { ...stateRef.current.columns, ...prefs.columns }, density: prefs.density ?? stateRef.current.density }, "columns");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  React.useEffect(() => {
    if (storageKey && prefsLoaded.current) writePrefs(storageKey, { columns: state.columns, density: state.density });
  }, [storageKey, state.columns, state.density]);

  /* ---- selection ---- */
  const [selection, setSelectionRaw] = useControllableState<DataTableSelection>({ value: selectionProp, defaultValue: defaultSelection ?? emptySelection(), onChange: onSelectionChange, name: "DataTable" });
  const [announcement, setAnnouncement] = React.useState("");
  const announce = React.useCallback((msg: string) => setAnnouncement((prev) => (prev === msg ? `${msg} ` : msg)), []);
  const queryKey = JSON.stringify([state.q, state.filters]);
  const lastQueryKey = React.useRef(queryKey);
  React.useEffect(() => {
    if (lastQueryKey.current === queryKey) return;
    lastQueryKey.current = queryKey;
    if (selection.mode === "all") {
      setSelectionRaw(emptySelection());
      announce(t("selectionReset"));
    }
  }, [queryKey, selection.mode, setSelectionRaw, announce, t]);

  /* ---- client pipeline: search → filters ---- */
  const colById = React.useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns]);
  const searchable = React.useMemo(() => columns.filter((c) => c.accessor && (c.searchable ?? ["text", "enum", "user", "tags", undefined].includes(c.type))), [columns]);
  const optionLabel = React.useCallback((c: DataTableColumn<T>, v: unknown) => (c.options ? (c.options.find((o) => o.value === v)?.label ?? textOf(v)) : textOf(v)), []);
  const filteredRows = React.useMemo(() => {
    if (server) return data;
    const searched = searchRows(data, state.q, (row) => searchable.map((c) => optionLabel(c, readColumnValue(c, row))).join(" "), locale);
    return applyFilters(searched, state.filters, fields, { locale, timeZone, me: me?.id });
  }, [server, data, state.q, state.filters, searchable, fields, locale, timeZone, me?.id, optionLabel]);

  /* ---- TanStack ---- */
  const collator = React.useMemo(() => getCollator(locale, { numeric: true, sensitivity: "base" }), [locale]);
  const tsColumns = React.useMemo<ColumnDef<Features, any, unknown>[]>(() => {
    const out: ColumnDef<Features, any, unknown>[] = [];
    if (selectable) out.push({ id: SELECT, header: "", size: 44, minSize: 44, maxSize: 44, enableSorting: false, enableHiding: false, enableResizing: false, enablePinning: false });
    for (const c of columns) {
      const type = c.type ?? "text";
      const optionIndex = c.options ? new Map(c.options.map((o, i) => [o.value, i])) : null;
      const sortKey = (row: T): string | number | null => {
        if (c.sortValue) return c.sortValue(row) ?? null;
        const v = readColumnValue(c, row);
        if (v === null || v === undefined || v === "") return null;
        if (END_TYPES.has(type)) return Number(v);
        if (type === "boolean") return v ? 1 : 0;
        if (type === "enum" && optionIndex) return optionIndex.get(String(v)) ?? Number.MAX_SAFE_INTEGER;
        if (type === "date" || type === "datetime") return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : new Date(v as string).getTime();
        return textOf(v);
      };
      out.push({
        id: c.id,
        header: c.header,
        accessorFn: (row: T) => readColumnValue(c, row),
        size: c.size ?? DEFAULT_SIZE[type],
        minSize: c.minSize ?? 72,
        maxSize: c.maxSize ?? 640,
        enableSorting: c.sortable ?? Boolean(c.accessor || c.sortValue),
        enableHiding: c.hideable ?? c !== titleColumn,
        enableResizing: c.resizable ?? true,
        enablePinning: c.pinnable ?? true,
        sortUndefined: "last",
        sortFn: (a: TRow<T>, b: TRow<T>) => {
          const x = sortKey(a.original);
          const y = sortKey(b.original);
          if (x === null && y === null) return 0;
          if (x === null) return 1;
          if (y === null) return -1;
          if (typeof x === "number" && typeof y === "number") return x - y;
          return collator.compare(String(x), String(y));
        },
      });
    }
    if (props.rowActions) out.push({ id: ACTIONS, header: "", size: 52, minSize: 52, maxSize: 52, enableSorting: false, enableHiding: false, enableResizing: false, enablePinning: false });
    return out;
  }, [columns, selectable, props.rowActions, collator, titleColumn]);

  const order = React.useMemo(() => {
    const known = state.columns.order.filter((id) => colById.has(id));
    const rest = columns.map((c) => c.id).filter((id) => !known.includes(id));
    return [...(selectable ? [SELECT] : []), ...known, ...rest, ...(props.rowActions ? [ACTIONS] : [])];
  }, [state.columns.order, colById, columns, selectable, props.rowActions]);
  const pinning = React.useMemo(() => {
    const start = state.columns.pinned.start.filter((id) => colById.has(id));
    const end = state.columns.pinned.end.filter((id) => colById.has(id));
    return { start: start.length && selectable ? [SELECT, ...start] : start, end: props.rowActions ? [...end, ACTIONS] : end };
  }, [state.columns.pinned, colById, selectable, props.rowActions]);
  const manualPaging = server || pagination !== "pages" || isCursorPage(state.page);
  const pageState = { pageIndex: isCursorPage(state.page) ? 0 : state.page.index, pageSize: state.page.size };

  const update = <S,>(current: S, updater: Updater<S>) => functionalUpdate(updater, current);

  const table = useTable<Features, any>({
    features,
    columns: tsColumns,
    data: filteredRows,
    getRowId: (row: T) => getRowId(row),
    state: {
      sorting: state.sort,
      pagination: pageState,
      columnVisibility: state.columns.visible,
      columnOrder: order,
      columnSizing: state.columns.sizing,
      columnPinning: pinning,
    },
    onSortingChange: (u) => setState({ sort: update(stateRef.current.sort, u as Updater<SortClause[]>) }, "sort"),
    onPaginationChange: (u) => {
      const s = stateRef.current;
      const prev = { pageIndex: isCursorPage(s.page) ? 0 : s.page.index, pageSize: s.page.size };
      const next = update(prev, u);
      setState({ page: { index: next.pageIndex, size: next.pageSize } }, next.pageSize !== prev.pageSize ? "pageSize" : "page");
    },
    onColumnVisibilityChange: (u) => setState({ columns: { ...stateRef.current.columns, visible: update(stateRef.current.columns.visible, u) } }, "columns"),
    onColumnOrderChange: (u) => {
      const next = update(order, u).filter((id) => id !== SELECT && id !== ACTIONS);
      setState({ columns: { ...stateRef.current.columns, order: next } }, "columns");
    },
    onColumnSizingChange: (u) => setState({ columns: { ...stateRef.current.columns, sizing: update(stateRef.current.columns.sizing, u) } }, "columns"),
    onColumnPinningChange: (u) => {
      const next = update(pinning, u);
      setState({ columns: { ...stateRef.current.columns, pinned: { start: next.start.filter((id) => id !== SELECT), end: next.end.filter((id) => id !== ACTIONS) } } }, "columns");
    },
    manualSorting: server,
    manualPagination: manualPaging,
    rowCount: server ? (rowCount ?? data.length) : undefined,
    autoResetPageIndex: false,
    enableSortingRemoval: true,
    enableMultiSort: true,
    sortDescFirst: false,
    columnResizeMode: "onChange",
    columnResizeDirection: dir,
  });

  const pageRowModels = table.getRowModel().rows;
  const pageRows = React.useMemo(() => pageRowModels.map((r) => r.original), [pageRowModels]);
  const total = server ? (rowCount ?? data.length) : filteredRows.length;

  // Clamp the page when the list shrinks (client).
  React.useEffect(() => {
    if (server || manualPaging || isCursorPage(state.page)) return;
    const pages = Math.max(1, Math.ceil(total / state.page.size));
    if (state.page.index > pages - 1) setState({ page: { index: pages - 1, size: state.page.size } }, "page");
  }, [server, manualPaging, total, state.page, setState]);

  /* ---- width / layout ---- */
  const { ref: measureRef, width } = useContainerWidth<HTMLDivElement>();
  const narrow = width !== undefined && width < 640;
  const cards = narrow && mobile === "cards";

  /* ---- inline edit ---- */
  const [editing, setEditing] = React.useState<{ rowId: string; columnId: string } | null>(null);
  const [cellStatus, setCellStatus] = React.useState<Record<string, CellStatus>>({});
  React.useEffect(() => {
    // New data from the parent replaces optimistic values that were saved.
    setCellStatus((prev) => {
      const next: Record<string, CellStatus> = {};
      let changed = false;
      for (const [k, v] of Object.entries(prev)) {
        if (v.status === "saved") changed = true;
        else next[k] = v;
      }
      return changed ? next : prev;
    });
  }, [data]);
  const rowLabel = React.useCallback((row: T) => (getRowLabel ? getRowLabel(row) : titleColumn ? textOf(readColumnValue(titleColumn, row)) : getRowId(row)), [getRowLabel, titleColumn, getRowId]);
  const commitEdit = React.useCallback(
    (row: T, rowId: string, col: DataTableColumn<T>, value: unknown) => {
      const key = `${rowId}:${col.id}`;
      setEditing(null);
      if (sameJSON(value, readColumnValue(col, row))) return;
      setCellStatus((s) => ({ ...s, [key]: { value, status: "saving" } }));
      Promise.resolve(onCellEdit?.({ row, rowId, columnId: col.id, value })).then(
        () => setCellStatus((s) => ({ ...s, [key]: { value, status: "saved" } })),
        (err: unknown) => {
          const message = err instanceof Error && err.message ? err.message : t("saveFailed", { column: col.header });
          setCellStatus((s) => ({ ...s, [key]: { value, status: "error", error: message } }));
          announce(message);
        },
      );
    },
    [onCellEdit, t, announce],
  );

  /* ---- misc ---- */
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [filterBound, setFilterBound] = React.useState(false);
  const [filterRequest, setFilterRequest] = React.useState<{ field: string; key: number } | null>(null);
  const lastClicked = React.useRef<number | null>(null);
  const isSelectable = React.useCallback((row: T) => (rowSelectable ? rowSelectable(row) : true), [rowSelectable]);
  const hasQuery = state.q.trim() !== "" || hasActiveFilters(state.filters);
  const orderedColumns = [...table.getStartVisibleLeafColumns(), ...table.getCenterVisibleLeafColumns(), ...table.getEndVisibleLeafColumns()].filter((c) => {
    if (!(narrow && mobile === "priority")) return true;
    const p = colById.get(c.id)?.priority;
    return !(p === 3 || (p === 2 && width !== undefined && width < 480));
  });

  if (process.env.NODE_ENV !== "production" && !props.virtual && pageRows.length > 300) {
    warnOnce("[vamos-ui] DataTable is rendering more than 300 rows without `virtual`. Turn on `virtual` or paginate.");
  }

  const exportCsv: DataTableContextValue<T>["exportCsv"] = (o = {}) => {
    const scope = o.scope ?? "all";
    const formatted = o.formatted ?? props.export?.formatted ?? false;
    const filename = o.filename ?? props.export?.filename ?? "export";
    let rows: T[];
    if (scope === "page") rows = pageRows;
    else if (scope === "selected") rows = (server ? data : filteredRows).filter((r) => isRowSelected(selection, getRowId(r)));
    else {
      if (server && props.export?.onServerExport) {
        void props.export.onServerExport(stateRef.current);
        toast.info(t("exportStarted"));
        return;
      }
      rows = server ? data : table.getPrePaginatedRowModel().rows.map((r) => r.original);
    }
    const cols = orderedColumns.map((c) => colById.get(c.id)).filter((c): c is DataTableColumn<T> => Boolean(c && c.accessor));
    const matrix: CsvCell[][] = [cols.map((c) => c.header)];
    for (const row of rows) matrix.push(cols.map((c) => exportCell(c, row, formatted, formatRef.current)));
    downloadCsv(filename, toCsv(matrix, { locale, delimiter: csvDelimiter(locale) }));
    announce(t("exported", { count: rows.length }));
  };
  const format = useFormat();
  const formatRef = React.useRef(format);
  formatRef.current = format;

  const ctx: DataTableContextValue<T> = {
    table,
    state,
    setState,
    selection,
    setSelection: setSelectionRaw,
    columns,
    fields,
    pageRows,
    filteredRows,
    total,
    filterBarProps: {
      fields,
      value: state.filters,
      onChange: (g: FilterGroup) => setState({ filters: g }, "filters"),
      q: state.q,
      onQChange: (q: string) => setState({ q }, "search"),
      addRequest: filterRequest,
      resultCount: total,
      me,
    },
    savedViewsBinding: (views) => ({
      activeId: state.view ?? null,
      current: toViewState(state),
      onSelect: (id) => setState(applyViewState(stateRef.current, views.find((v) => v.id === id)?.state, id, { ...defaultState, columns: defaultColumns }), "view"),
      onReset: () => {
        const id = stateRef.current.view ?? null;
        setState(applyViewState(stateRef.current, views.find((v) => v.id === id)?.state, id, { ...defaultState, columns: defaultColumns }), "view");
      },
    }),
    exportCsv,
    requestFilter: (field) => setFilterRequest({ field, key: Date.now() }),
    props,
    internal: {
      t,
      width,
      narrow,
      cards,
      searchRef,
      filterBound,
      setFilterBound,
      editing,
      setEditing,
      cellStatus,
      commitEdit,
      announce,
      rowLabel,
      titleColumn,
      orderedColumns,
      defaultColumns,
      lastClicked,
      isSelectable,
      hasQuery,
      requestId,
      filterRequest,
    },
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!shortcuts || e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    const typing = target.closest("input, textarea, select, [contenteditable=true], [role=dialog], [role=menu], [role=listbox]");
    if (e.key === "Escape" && selectionCount(selection) > 0 && !typing) {
      e.preventDefault();
      setSelectionRaw(emptySelection());
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/" && searchRef.current) {
      e.preventDefault();
      searchRef.current.focus();
    } else if ((e.key === "x" || e.key === "X") && selectable) {
      const tr = target.closest<HTMLElement>("[data-row-id]");
      const id = tr?.dataset.rowId;
      const row = id ? pageRows.find((r) => getRowId(r) === id) : undefined;
      if (row && isSelectable(row) === true) {
        e.preventDefault();
        setSelectionRaw(toggleId(selection, id!, selectable === "single"));
      }
    }
  };

  return (
    <DataTableContext.Provider value={ctx as DataTableContextValue}>
      <div
        ref={measureRef}
        data-slot="data-table"
        data-variant={variant}
        data-density={density === "inherit" ? (state.density ?? undefined) : density}
        data-layout={cards ? "cards" : "table"}
        className={cn("ui-dt relative flex min-w-0 flex-col text-fg", variant === "card" && "surface overflow-hidden rounded-ui-lg", className)}
        onKeyDown={onKeyDown}
        {...rest}
      >
        {children ?? (
          <>
            <DataTableToolbar>
              <DataTableSearch />
              {toolbar}
              <div className="ms-auto flex items-center gap-1.5">
                <DataTableViewOptions />
                {props.export ? <DataTableExport /> : null}
              </div>
            </DataTableToolbar>
            <DataTableContent />
            <DataTableFooter />
          </>
        )}
        <div aria-live="polite" className="sr-only" data-slot="data-table-live">
          {announcement}
        </div>
      </div>
    </DataTableContext.Provider>
  );
}

const warned = new Set<string>();
function warnOnce(msg: string) {
  if (warned.has(msg)) return;
  warned.add(msg);
  console.warn(msg);
}

function toggleId(s: DataTableSelection, id: string, single: boolean): DataTableSelection {
  if (s.mode === "all") return { ...s, except: s.except.includes(id) ? s.except.filter((x) => x !== id) : [...s.except, id] };
  if (single) return { mode: "ids", ids: s.ids.includes(id) ? [] : [id] };
  return { mode: "ids", ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] };
}

function exportCell<T>(c: DataTableColumn<T>, row: T, formatted: boolean, f: ReturnType<typeof useFormat>): CsvCell {
  if (c.exportValue) return c.exportValue(row);
  const v = readColumnValue(c, row);
  if (v === null || v === undefined) return null;
  const type = c.type ?? "text";
  if (formatted) return formatPlain(c, v, f);
  if (type === "enum") return String(v);
  if (type === "boolean") return Boolean(v);
  if (type === "number" || type === "percent") return typeof v === "number" ? v : Number(v);
  if (type === "currency") return typeof v === "number" ? v : Number(v);
  if (Array.isArray(v)) return v.map(textOf).join(", ");
  if (typeof v === "object" && !(v instanceof Date)) return textOf(v);
  return v as CsvCell;
}

function formatPlain<T>(c: DataTableColumn<T>, v: unknown, f: ReturnType<typeof useFormat>): string {
  if (v === null || v === undefined || v === "") return "";
  switch (c.type ?? "text") {
    case "currency":
      return f.currency(v as string | number, c.currency);
    case "number":
      return f.number(v as number);
    case "percent":
      return f.percent(Number(v));
    case "date":
      return f.date(v as string);
    case "datetime":
      return f.dateTime(v as string);
    case "enum":
      return c.options?.find((o) => o.value === v)?.label ?? String(v);
    case "boolean":
      return v ? "Yes" : "No";
    default:
      return textOf(v);
  }
}

/* ------------------------------------------------------------------ */
/* Toolbar, search, bulk bar                                           */
/* ------------------------------------------------------------------ */

/**
 * The bar above the table. While rows are selected it shows the bulk bar in the same place
 * (same height, no layout jump).
 */
export function DataTableToolbar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { selection, props: p } = useDataTable();
  const bulk = Boolean(p.selectable) && selectionCount(selection) > 0;
  return (
    <div data-slot="data-table-toolbar" className={cn("ui-dt-toolbar flex min-h-[calc(var(--control-h)+1.5rem)] flex-wrap items-center gap-2 px-(--cell-px) py-3", p.variant !== "flush" && "border-b border-line", className)} {...props}>
      {bulk ? <DataTableBulkBar /> : children}
    </div>
  );
}

export interface DataTableSearchProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  /** ms before the search applies. Default 300. */
  debounce?: number;
}

/** Global search across the searchable columns. `/` focuses it. */
export function DataTableSearch({ debounce = 300, className, placeholder, ...props }: DataTableSearchProps) {
  const { state, setState, internal } = useDataTable();
  const { t, searchRef } = internal;
  const [value, setValue] = React.useState(state.q);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => setValue(state.q), [state.q]);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const push = (q: string, wait: number) => {
    clearTimeout(timer.current);
    if (wait === 0) setState({ q }, "search");
    else timer.current = setTimeout(() => setState({ q }, "search"), wait);
  };
  return (
    <Input
      ref={searchRef}
      type="search"
      size="sm"
      aria-label={t("search")}
      placeholder={placeholder ?? t("searchPlaceholder")}
      value={value}
      leading={<Search />}
      clearable
      onClear={() => push("", 0)}
      onChange={(e) => {
        setValue(e.target.value);
        push(e.target.value, debounce);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") push(value, 0);
      }}
      className={cn("w-full sm:w-64", className)}
      data-slot="data-table-search"
      {...props}
    />
  );
}

/** A Filter bar bound to the table (fields from the columns, "Filter by this column" opens it). */
export function DataTableFilterBar(props: Partial<FilterBarProps>) {
  const { filterBarProps, internal } = useDataTable();
  const { setFilterBound } = internal;
  React.useEffect(() => {
    setFilterBound(true);
    return () => setFilterBound(false);
  }, [setFilterBound]);
  const { q: _q, onQChange: _oq, ...bound } = filterBarProps;
  return <FilterBar {...bound} {...props} className={cn("min-w-0 flex-1", props.className)} />;
}

export interface DataTableSavedViewsProps extends Omit<SavedViewsProps, "activeId" | "current" | "onSelect" | "onReset"> {}

/** Saved views bound to the table: switching applies the view, edits mark it modified. */
export function DataTableSavedViews(props: DataTableSavedViewsProps) {
  const { savedViewsBinding } = useDataTable();
  return <SavedViews {...savedViewsBinding(props.views)} {...props} />;
}

/** Replaces the toolbar while rows are selected: count, select-all across pages, actions. */
export function DataTableBulkBar({ className }: { className?: string }) {
  const { selection, setSelection, pageRows, filteredRows, total, state, props: p, internal } = useDataTable();
  const { t } = internal;
  const f = useFormat();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [confirming, setConfirming] = React.useState<DataTableBulkAction<any> | null>(null);
  const count = selectionCount(selection);
  const pageIds = pageRows.map((r) => p.getRowId(r));
  const onPage = pageIds.filter((id) => isRowSelected(selection, id)).length;
  const allPage = pageIds.length > 0 && onPage === pageIds.length;
  const server = p.mode === "server";
  const allMatching = selection.mode === "all" || count >= total;
  const selectedRows = (server ? p.data : filteredRows).filter((r) => isRowSelected(selection, p.getRowId(r)));

  const selectAll = () => {
    if (server) setSelection({ mode: "all", except: [], filters: state.filters, q: state.q, total });
    else setSelection({ mode: "ids", ids: filteredRows.filter((r) => internal.isSelectable(r) === true).map((r) => p.getRowId(r)) });
  };
  const selectPage = () => {
    const add = pageRows.filter((r) => internal.isSelectable(r) === true).map((r) => p.getRowId(r));
    if (selection.mode === "all") setSelection({ ...selection, except: selection.except.filter((id) => !add.includes(id)) });
    else setSelection({ mode: "ids", ids: Array.from(new Set([...selection.ids, ...add])) });
  };

  const run = async (action: DataTableBulkAction<any>) => {
    setBusy(action.id);
    try {
      const result = await action.run(selection, selectedRows);
      const n = count;
      setSelection(emptySelection());
      const undo = result && typeof result === "object" && "undo" in result ? result.undo : undefined;
      toast.success(t("bulkDone", { action: action.label, count: n }), undo ? { action: { label: t("undo"), onClick: () => void Promise.resolve(undo()).then(() => toast(t("undone"))) } } : undefined);
    } catch {
      toast.danger(t("bulkFailed", { action: action.label }));
    } finally {
      setBusy(null);
    }
  };

  const actions = p.bulkActions ?? [];
  const inline = actions.slice(0, 3);
  const extra = actions.slice(3);
  const disabledReason = (a: DataTableBulkAction<any>) => {
    const r = a.disabled?.(selection, selectedRows);
    return r === true ? "" : typeof r === "string" ? r : null;
  };

  return (
    <div role="toolbar" aria-label={t("bulkActions")} data-slot="data-table-bulk-bar" className={cn("ui-dt-bulk ui-fade flex w-full flex-wrap items-center gap-x-1 gap-y-2 text-[13px]", className)}>
      <span className="inline-flex items-center gap-2 pe-2 font-medium text-fg tabular">
        <span aria-hidden className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-fg">
          {f.count(count, 9999)}
        </span>
        {allMatching && selection.mode === "all" ? t("allSelected", { count: f.number(count) }) : t("selectedCount", { count: f.number(count) })}
        {selection.mode === "ids" && onPage !== count && onPage > 0 ? <span className="font-normal text-fg-muted">({t("selectedOnPage", { count: f.number(onPage) })})</span> : null}
      </span>
      {!allPage && pageIds.length > 1 && p.selectable !== "single" ? (
        <Button size="xs" variant="ghost" onClick={selectPage}>
          {t("selectPage", { count: f.number(pageIds.length) })}
        </Button>
      ) : null}
      {!allMatching && allPage && p.selectable !== "single" ? (
        <Button size="xs" variant="ghost" className="text-accent-ink" onClick={selectAll}>
          {t("selectAllMatching", { count: f.number(total) })}
        </Button>
      ) : null}
      <Button size="xs" variant="ghost" className="text-fg-muted" onClick={() => setSelection(emptySelection())}>
        {t("clear")}
      </Button>
      <span aria-hidden className="mx-1 hidden h-4 w-px bg-line sm:block" />
      <div className="ms-auto flex flex-wrap items-center gap-1.5">
        {inline.map((a) => {
          const reason = disabledReason(a);
          return (
            <Button
              key={a.id}
              size="sm"
              variant={a.tone === "danger" ? "danger-ghost" : "secondary"}
              disabled={reason !== null}
              title={reason || undefined}
              loading={busy === a.id}
              onClick={() => (a.confirm ? setConfirming(a) : run(a))}
            >
              {a.icon}
              {a.label}
            </Button>
          );
        })}
        {extra.length ? (
          <ActionMenu
            triggerLabel={t("moreActions")}
            items={extra.map((a) => ({ id: a.id, label: a.label, icon: a.icon, tone: a.tone, disabled: disabledReason(a) !== null, onSelect: () => (a.confirm ? setConfirming(a) : run(a)) }))}
          />
        ) : null}
      </div>
      <ConfirmDialog
        open={confirming !== null}
        tone={confirming?.tone === "danger" ? "danger" : "default"}
        title={confirming?.confirm?.title ?? ""}
        description={confirming?.confirm?.description?.(count)}
        confirmLabel={confirming?.confirm?.confirmLabel ?? confirming?.label}
        onResult={(ok) => {
          const a = confirming;
          setConfirming(null);
          if (ok && a) void run(a);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* View options                                                        */
/* ------------------------------------------------------------------ */

/** "View" popover: show/hide and reorder columns, density, reset. */
export function DataTableViewOptions({ className }: { className?: string }) {
  const { state, setState, columns, internal } = useDataTable();
  const { t, defaultColumns } = internal;
  const { locale } = useLocale();
  const [query, setQuery] = React.useState("");
  const order = [...state.columns.order.filter((id) => columns.some((c) => c.id === id)), ...columns.map((c) => c.id).filter((id) => !state.columns.order.includes(id))];
  const list = order.map((id) => columns.find((c) => c.id === id)!).filter((c) => !query || c.header.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)));
  const move = (id: string, by: -1 | 1) => {
    const next = [...order];
    const i = next.indexOf(id);
    const j = i + by;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    setState({ columns: { ...state.columns, order: next } }, "columns");
  };
  const densities: ListDensity[] = ["compact", "comfortable", "spacious"];
  const current = state.density ?? "comfortable";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className={cn("text-fg-muted", className)} aria-label={t("viewOptions")}>
          <Columns3 aria-hidden />
          <span className="max-sm:sr-only">{t("view")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" size="sm" padded={false} aria-label={t("viewOptions")} className="w-72">
        <div className="border-b border-line p-2">
          <p className="px-1 pb-1.5 text-[11px] font-medium tracking-[0.04em] text-fg-subtle">{t("columns")}</p>
          {columns.length > 7 ? <Input size="sm" type="search" aria-label={t("findColumn")} placeholder={t("findColumn")} value={query} onChange={(e) => setQuery(e.target.value)} leading={<Search />} /> : null}
        </div>
        <ul className="max-h-64 overflow-y-auto p-1" aria-label={t("columns")}>
          {list.map((c) => {
            const hideable = c.hideable ?? c !== internal.titleColumn;
            const visible = state.columns.visible[c.id] !== false;
            const i = order.indexOf(c.id);
            return (
              <li key={c.id} className="group/col flex items-center gap-1 rounded-ui-sm py-0.5 ps-2 pe-1 hover:bg-hover">
                <Checkbox
                  size="sm"
                  label={c.header}
                  checked={visible}
                  disabled={!hideable}
                  onCheckedChange={(v) => setState({ columns: { ...state.columns, visible: { ...state.columns.visible, [c.id]: v === true } } }, "columns")}
                  className="min-w-0 flex-1 py-1 text-[13px]"
                />
                <button type="button" aria-label={t("moveUp", { name: c.header })} disabled={i === 0 || Boolean(query)} onClick={() => move(c.id, -1)} className="inline-flex size-6 items-center justify-center rounded-ui-sm text-fg-subtle hover:bg-selected hover:text-fg focus-ring disabled:opacity-30">
                  <ChevronUp aria-hidden className="size-3.5" />
                </button>
                <button type="button" aria-label={t("moveDown", { name: c.header })} disabled={i === order.length - 1 || Boolean(query)} onClick={() => move(c.id, 1)} className="inline-flex size-6 items-center justify-center rounded-ui-sm text-fg-subtle hover:bg-selected hover:text-fg focus-ring disabled:opacity-30">
                  <ChevronDown aria-hidden className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-line p-2">
          <p id="dt-density-label" className="px-1 pb-1.5 text-[11px] font-medium tracking-[0.04em] text-fg-subtle">
            {t("density")}
          </p>
          <div role="radiogroup" aria-label={t("density")} className="grid grid-cols-3 gap-0.5 rounded-ui-sm bg-selected p-0.5">
            {densities.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={current === d}
                onClick={() => setState({ density: d }, "density")}
                className={cn("h-7 rounded-[calc(var(--radius)-6px)] text-xs font-medium transition-colors focus-ring", current === d ? "bg-surface text-fg shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-fg-muted hover:text-fg")}
              >
                {t(d)}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-line p-1">
          <button type="button" onClick={() => setState({ columns: defaultColumns, density: undefined }, "columns")} className="flex h-8 w-full items-center gap-2 rounded-ui-sm px-2 text-[13px] text-fg-muted hover:bg-hover hover:text-fg focus-ring">
            <RotateCcw aria-hidden className="size-3.5" />
            {t("resetColumns")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** "Export" menu: rows on this page, selected rows, all rows (or your server export). */
export function DataTableExport({ className }: { className?: string }) {
  const { exportCsv, selection, pageRows, total, props: p, internal } = useDataTable();
  const { t } = internal;
  const f = useFormat();
  const selected = selectionCount(selection);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className={cn("text-fg-muted", className)} aria-label={t("export")}>
          <Download aria-hidden />
          <span className="max-sm:sr-only">{t("export")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" size="md">
        <DropdownMenuLabel>CSV</DropdownMenuLabel>
        <DropdownMenuItem icon={<ArrowDownToLine />} badge={f.number(pageRows.length)} onSelect={() => exportCsv({ scope: "page" })}>
          {t("exportPage")}
        </DropdownMenuItem>
        <DropdownMenuItem icon={<ArrowDownToLine />} badge={f.number(selected)} disabled={selected === 0} onSelect={() => exportCsv({ scope: "selected" })}>
          {t("exportSelected")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Download />} badge={p.mode === "server" && p.export?.onServerExport ? undefined : f.number(total)} onSelect={() => exportCsv({ scope: "all" })}>
          {p.mode === "server" && p.export?.onServerExport ? t("exportAllServer") : t("exportAll")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Header cell                                                         */
/* ------------------------------------------------------------------ */

function pinStyle<T>(col: TColumn<T>, header?: boolean): React.CSSProperties | undefined {
  const pinned = col.getIsPinned();
  if (!pinned) return undefined;
  return pinned === "start"
    ? { position: "sticky", insetInlineStart: col.getStart("start"), zIndex: header ? 4 : 1 }
    : { position: "sticky", insetInlineEnd: col.getAfter("end"), zIndex: header ? 4 : 1 };
}

function pinAttrs<T>(col: TColumn<T>) {
  const pinned = col.getIsPinned();
  if (!pinned) return {};
  const edge = pinned === "start" ? col.getIsLastColumn("start") : col.getIsFirstColumn("end");
  return { "data-pinned": pinned, "data-pin-edge": edge ? "" : undefined };
}

function HeaderCell<T>({ header, def }: { header: THeader<T>; def: DataTableColumn<T> }) {
  const { state, setState, internal, requestFilter, fields } = useDataTable<T>();
  const { t } = internal;
  const col = header.column;
  const sorted = col.getIsSorted();
  const sortIndex = state.sort.length > 1 ? col.getSortIndex() : -1;
  const align = columnAlign(def);
  const canSort = col.getCanSort();
  const canPin = col.getCanPin();
  const canHide = col.getCanHide();
  const pinned = col.getIsPinned();
  const filterable = internal.filterBound && fields.some((f) => f.field === def.id);
  const size = header.getSize();
  const resizeHandler = header.getResizeHandler();
  const thRef = React.useRef<HTMLTableCellElement>(null);

  const setSize = (px: number) => setState({ columns: { ...state.columns, sizing: { ...state.columns.sizing, [def.id]: Math.round(Math.min(col.columnDef.maxSize ?? 640, Math.max(col.columnDef.minSize ?? 72, px))) } } }, "columns");
  const autofit = () => {
    const table = thRef.current?.closest("table");
    if (!table) return;
    let max = 0;
    table.querySelectorAll<HTMLElement>(`[data-col="${CSS.escape(def.id)}"] > [data-fit]`).forEach((el) => {
      max = Math.max(max, el.scrollWidth);
    });
    if (max) setSize(max + 36);
  };

  return (
    <TableHead
      ref={thRef}
      data-col={def.id}
      align={align}
      aria-sort={canSort ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined}
      style={{ width: size, ...pinStyle(col, true) }}
      {...pinAttrs(col)}
      className="group/th relative"
    >
      <div data-fit className={cn("flex min-w-0 items-center gap-0.5", align === "end" && "flex-row-reverse", align === "center" && "justify-center")}>
        {canSort ? (
          <button
            type="button"
            onClick={col.getToggleSortingHandler()}
            aria-label={t("sortBy", { name: def.header })}
            className={cn("-mx-1.5 inline-flex min-w-0 items-center gap-1 rounded-ui-sm px-1.5 py-1 font-medium transition-colors hover:bg-hover hover:text-fg focus-ring", sorted && "text-fg", align === "end" && "flex-row-reverse")}
          >
            <span className="truncate">{def.header}</span>
            {sorted === "asc" ? <ArrowUp aria-hidden className="size-3.5 shrink-0" /> : sorted === "desc" ? <ArrowDown aria-hidden className="size-3.5 shrink-0" /> : <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover/th:opacity-100" />}
            {sortIndex >= 0 ? (
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-accent-soft font-mono text-[10px] text-accent-ink" aria-label={t("sortOrder", { index: sortIndex + 1 })}>
                {sortIndex + 1}
              </span>
            ) : null}
          </button>
        ) : (
          <span className="truncate">{def.header}</span>
        )}
        {canSort || canPin || canHide || filterable ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t("columnMenu", { name: def.header })}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-ui-sm text-fg-subtle opacity-0 transition-opacity group-hover/th:opacity-100 hover:bg-hover hover:text-fg focus-visible:opacity-100 focus-ring data-[state=open]:opacity-100 pointer-coarse:opacity-100"
              >
                <MoreHorizontal aria-hidden className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align === "end" ? "end" : "start"} size="sm">
              {canSort ? (
                <>
                  <DropdownMenuItem icon={<ArrowUp />} onSelect={() => col.toggleSorting(false)}>
                    {t("sortAsc")}
                  </DropdownMenuItem>
                  <DropdownMenuItem icon={<ArrowDown />} onSelect={() => col.toggleSorting(true)}>
                    {t("sortDesc")}
                  </DropdownMenuItem>
                  {sorted ? (
                    <DropdownMenuItem icon={<X />} onSelect={() => col.clearSorting()}>
                      {t("clearSort")}
                    </DropdownMenuItem>
                  ) : null}
                </>
              ) : null}
              {filterable ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem icon={<ListFilter />} onSelect={() => requestFilter(def.id)}>
                    {t("filterBy")}
                  </DropdownMenuItem>
                </>
              ) : null}
              {canPin || canHide ? <DropdownMenuSeparator /> : null}
              {canPin && pinned !== "start" ? (
                <DropdownMenuItem icon={<Pin />} onSelect={() => col.pin("start")}>
                  {t("pinStart")}
                </DropdownMenuItem>
              ) : null}
              {canPin && pinned !== "end" ? (
                <DropdownMenuItem icon={<Pin className="rotate-90" />} onSelect={() => col.pin("end")}>
                  {t("pinEnd")}
                </DropdownMenuItem>
              ) : null}
              {canPin && pinned ? (
                <DropdownMenuItem icon={<PinOff />} onSelect={() => col.pin(false)}>
                  {t("unpin")}
                </DropdownMenuItem>
              ) : null}
              {canHide ? (
                <DropdownMenuItem icon={<EyeOff />} onSelect={() => col.toggleVisibility(false)}>
                  {t("hide")}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      {col.getCanResize() ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t("resize", { name: def.header })}
          aria-valuenow={Math.round(size)}
          aria-valuemin={col.columnDef.minSize ?? 72}
          aria-valuemax={col.columnDef.maxSize ?? 640}
          tabIndex={0}
          data-resizing={col.getIsResizing() ? "" : undefined}
          onMouseDown={resizeHandler}
          onTouchStart={resizeHandler}
          onDoubleClick={autofit}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 64 : 16;
            const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              const grow = (e.key === "ArrowRight") !== rtl;
              setSize(size + (grow ? step : -step));
            } else if (e.key === "Enter") {
              e.preventDefault();
              autofit();
            }
          }}
          className="ui-dt-resize"
        />
      ) : null}
    </TableHead>
  );
}

/* ------------------------------------------------------------------ */
/* Cells                                                               */
/* ------------------------------------------------------------------ */

/** Default rendering of a value by column type. */
export function DataTableValue<T>({ column, value }: { column: DataTableColumn<T>; value: unknown }) {
  const f = useFormat();
  const t = useLabels("dataTable", dataTableLabels);
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-fg-subtle">{t("none")}</span>;
  }
  switch (column.type ?? "text") {
    case "currency":
      return <>{f.currency(value as string | number, column.currency)}</>;
    case "number":
      return <>{f.number(value as number)}</>;
    case "percent":
      return <>{f.percent(Number(value))}</>;
    case "date":
      return <time dateTime={String(value)}>{f.date(value as string)}</time>;
    case "datetime":
      return <time dateTime={String(value)}>{f.dateTime(value as string)}</time>;
    case "boolean":
      return value ? <span className="text-fg">{t("yes")}</span> : <span className="text-fg-subtle">{t("no")}</span>;
    case "enum": {
      const o = column.options?.find((x) => x.value === value);
      return (
        <Badge tone={o?.tone ?? "neutral"} dot={Boolean(o?.tone && o.tone !== "neutral")}>
          {o?.label ?? String(value)}
        </Badge>
      );
    }
    case "user": {
      const name = textOf(value);
      const src = typeof value === "object" && value ? ((value as { avatar?: string; image?: string }).avatar ?? (value as { image?: string }).image) : undefined;
      return (
        <span className="inline-flex min-w-0 items-center gap-2">
          <Avatar name={name} src={src} size="xs" />
          <span className="truncate">{name}</span>
        </span>
      );
    }
    case "tags": {
      const list = (Array.isArray(value) ? value : [value]).map(textOf);
      return (
        <span className="inline-flex min-w-0 items-center gap-1">
          {list.slice(0, 2).map((x) => (
            <Badge key={x} tone="outline">
              {x}
            </Badge>
          ))}
          {list.length > 2 ? <span className="text-xs text-fg-subtle tabular">+{list.length - 2}</span> : null}
        </span>
      );
    }
    default:
      return <>{textOf(value)}</>;
  }
}

function CellEditorInput<T>({ def, row, value, onCommit, onCancel }: { def: DataTableColumn<T>; row: T; value: unknown; onCommit: (v: unknown) => void; onCancel: () => void }) {
  const { internal } = useDataTable<T>();
  const { t } = internal;
  const editor = def.edit as Exclude<DataTableCellEditor<T>, { type: "custom" }>;
  const [draft, setDraft] = React.useState<string>(() => (value === null || value === undefined ? "" : String(value)));
  const [error, setError] = React.useState<string | null>(null);
  const errorId = React.useId();
  const parse = (s: string): unknown => {
    if (editor.type === "number") return s === "" ? null : Number(s.replace(",", "."));
    if (editor.type === "currency") return s === "" ? null : s.replace(",", ".").replace(/[^\d.-]/g, "");
    return s;
  };
  const commit = () => {
    const v = parse(draft);
    if ((editor.type === "number" || editor.type === "currency") && v !== null && !Number.isFinite(Number(v))) {
      setError(t("invalid"));
      return;
    }
    const msg = editor.validate?.(v, row) ?? null;
    if (msg) {
      setError(msg);
      return;
    }
    onCommit(v);
  };
  const keys = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      if (e.key === "Enter") e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };
  if (editor.type === "select") {
    return (
      <div className="relative">
        <select
          autoFocus
          aria-label={def.header}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            onCommit(e.target.value);
          }}
          onKeyDown={keys}
          onBlur={onCancel}
          className={cn(controlVariants({ size: "sm" }), "h-[calc(var(--row-h)-0.75rem)] w-full appearance-none py-0 ps-2 pe-7 text-[13px]")}
        >
          {(editor.options ?? def.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-fg-subtle" />
      </div>
    );
  }
  return (
    <div className="relative">
      <Input
        autoFocus
        size="sm"
        aria-label={def.header}
        type={editor.type === "date" ? "date" : "text"}
        inputMode={editor.type === "number" || editor.type === "currency" ? "decimal" : undefined}
        value={draft}
        invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => {
          setDraft(e.target.value);
          setError(null);
        }}
        onKeyDown={keys}
        onBlur={commit}
        onFocus={(e) => e.currentTarget.select()}
        className="h-[calc(var(--row-h)-0.75rem)] w-full"
        inputClassName={cn("text-[13px]", END_TYPES.has(def.type ?? "text") && "text-end tabular")}
      />
      {error ? (
        <p id={errorId} role="alert" className="surface-popover absolute start-0 top-full z-(--z-popover) mt-1 rounded-ui-sm px-2 py-1 text-xs whitespace-nowrap text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function BodyCell<T>({ row, rowId, col, def, index, gridPos }: { row: T; rowId: string; col: TColumn<T>; def: DataTableColumn<T>; index: number; gridPos?: { r: number; c: number } }) {
  const { internal, props: p } = useDataTable<T>();
  const { t, editing, setEditing, cellStatus, commitEdit } = internal;
  const Link = useLink();
  const key = `${rowId}:${def.id}`;
  const status = cellStatus[key];
  const raw = readColumnValue(def, row);
  const value = status && status.status !== "error" ? status.value : raw;
  const editable = Boolean(def.edit && !p.readOnly && p.onCellEdit);
  const isEditing = editing?.rowId === rowId && editing.columnId === def.id;
  const align = columnAlign(def);
  const isTitle = def === internal.titleColumn;
  const content = def.cell ? def.cell({ row, value, rowId, index, column: def }) : <DataTableValue column={def} value={value} />;
  const grid = p.navigation === "grid";
  const f = useFormat();
  // The edit button's name carries the value as the cell shows it ("$72,500.00", not "72500"),
  // or it fails WCAG 2.5.3 label in name. A custom cell renderer falls back to the raw text.
  const label = (def.cell ? textOf(raw) : formatPlain(def, value, f)) || t("none");

  let body: React.ReactNode = content;
  if (isEditing && def.edit && def.edit.type === "custom") {
    body = def.edit.render({ value: raw, row, commit: (v) => commitEdit(row, rowId, def, v), cancel: () => setEditing(null) });
  } else if (isEditing) {
    body = <CellEditorInput def={def} row={row} value={raw} onCommit={(v) => commitEdit(row, rowId, def, v)} onCancel={() => setEditing(null)} />;
  } else if (editable && def.edit && def.edit.type === "boolean") {
    body = <Switch size="sm" checked={Boolean(value)} aria-label={`${def.header}, ${internal.rowLabel(row)}`} onCheckedChange={(c) => commitEdit(row, rowId, def, c)} />;
  } else if (editable && !grid) {
    body = (
      <button
        type="button"
        data-no-row-click=""
        onClick={() => setEditing({ rowId, columnId: def.id })}
        aria-label={t("edit", { column: def.header, value: label })}
        className={cn("ui-dt-editable -mx-2 flex w-[calc(100%+1rem)] min-w-0 items-center rounded-ui-sm px-2 py-1 text-start focus-ring", align === "end" && "justify-end text-end")}
      >
        <span className="min-w-0 truncate">{content}</span>
      </button>
    );
  } else if (isTitle && p.rowHref) {
    body = (
      <Link href={p.rowHref(row)} className="min-w-0 truncate font-medium text-fg underline-offset-4 hover:underline focus-ring rounded-ui-sm">
        {content}
      </Link>
    );
  }

  const rowHeader = def.rowHeader ?? isTitle;
  return (
    <TableCell
      rowHeader={rowHeader && !grid}
      data-col={def.id}
      align={align}
      numeric={END_TYPES.has(def.type ?? "text") && !def.cell}
      role={grid ? "gridcell" : undefined}
      tabIndex={grid ? -1 : undefined}
      data-r={gridPos?.r}
      data-c={gridPos?.c}
      aria-readonly={grid && !editable ? true : undefined}
      data-editable={editable ? "" : undefined}
      data-editing={isEditing ? "" : undefined}
      data-status={status?.status}
      title={status?.status === "error" ? status.error : undefined}
      aria-invalid={status?.status === "error" || undefined}
      style={pinStyle(col)}
      {...pinAttrs(col)}
      className={cn("relative", isEditing ? "py-1" : "truncate", rowHeader && "font-medium")}
    >
      <div data-fit className={cn("flex min-w-0 items-center gap-2", align === "end" && "justify-end", align === "center" && "justify-center")}>
        {body}
        {status?.status === "saving" ? <Spinner size="xs" tone="muted" aria-label={t("saving")} className="shrink-0" /> : null}
      </div>
    </TableCell>
  );
}

/* ------------------------------------------------------------------ */
/* Rows                                                                */
/* ------------------------------------------------------------------ */

function SelectCell<T>({ row, rowId, index, col }: { row: T; rowId: string; index: number; col: TColumn<T> }) {
  const { selection, setSelection, pageRows, internal, props: p } = useDataTable<T>();
  const selected = isRowSelected(selection, rowId);
  const can = internal.isSelectable(row);
  return (
    <TableCell style={pinStyle(col)} {...pinAttrs(col)} className="w-11 pe-0" data-no-row-click="">
      <span className="flex items-center" title={typeof can === "string" ? can : undefined}>
        <Checkbox
          size="sm"
          checked={selected}
          disabled={can !== true}
          aria-label={internal.t("selectRow", { name: internal.rowLabel(row) })}
          onClick={(e) => {
            if (e.shiftKey && internal.lastClicked.current !== null && p.selectable !== "single") {
              e.preventDefault();
              const [a, b] = [internal.lastClicked.current, index].sort((x, y) => x - y);
              const ids = pageRows.slice(a, b! + 1).filter((r) => internal.isSelectable(r) === true).map((r) => p.getRowId(r));
              if (selection.mode === "all") setSelection({ ...selection, except: selection.except.filter((x) => !ids.includes(x)) });
              else setSelection({ mode: "ids", ids: Array.from(new Set([...selection.ids, ...ids])) });
            }
            internal.lastClicked.current = index;
          }}
          onCheckedChange={() => setSelection(toggleId(selection, rowId, p.selectable === "single"))}
        />
      </span>
    </TableCell>
  );
}

function ActionsCell<T>({ row, col }: { row: T; col: TColumn<T> }) {
  const { props: p, internal } = useDataTable<T>();
  const items = p.rowActions?.(row) ?? [];
  return (
    <TableCell style={pinStyle(col)} {...pinAttrs(col)} align="end" className="w-[52px] ps-0" data-no-row-click="">
      <ActionMenu items={items} triggerLabel={internal.t("rowActions", { name: internal.rowLabel(row) })} triggerSize="xs" />
    </TableCell>
  );
}

const INTERACTIVE = "a, button, input, select, textarea, label, [role=checkbox], [role=switch], [role=menuitem], [data-no-row-click]";

function DataRow<T>({ row, index, measureRef, virtualIndex }: { row: TRow<T>; index: number; measureRef?: (el: HTMLTableRowElement | null) => void; virtualIndex?: number }) {
  const { selection, internal, props: p } = useDataTable<T>();
  const navigate = useNavigateRow<T>();
  const rowId = row.id;
  const selected = p.selectable ? isRowSelected(selection, rowId) : undefined;
  const can = internal.isSelectable(row.original);
  const clickable = Boolean(p.onRowClick || p.rowHref);
  const grid = p.navigation === "grid";
  return (
    <TableRow
      ref={measureRef}
      data-index={virtualIndex}
      data-row-id={rowId}
      selected={selected}
      aria-selected={p.selectable ? selected : undefined}
      aria-rowindex={virtualIndex !== undefined ? virtualIndex + 2 : undefined}
      disabled={p.selectable ? can !== true : undefined}
      className={cn(clickable && "cursor-pointer")}
      onClick={(e) => {
        if (!clickable || (e.target as HTMLElement).closest(INTERACTIVE)) return;
        navigate(row.original);
      }}
    >
      {internal.orderedColumns.map((col, c) => {
        if (col.id === SELECT) return <SelectCell key={col.id} row={row.original} rowId={rowId} index={index} col={col} />;
        if (col.id === ACTIONS) return <ActionsCell key={col.id} row={row.original} col={col} />;
        const def = p.columns.find((x) => x.id === col.id)!;
        return <BodyCell key={col.id} row={row.original} rowId={rowId} col={col} def={def} index={index} gridPos={grid ? { r: index, c } : undefined} />;
      })}
    </TableRow>
  );
}

function useNavigateRow<T>() {
  const { props: p } = useDataTable<T>();
  return (row: T) => {
    if (p.onRowClick) p.onRowClick(row);
    else if (p.rowHref && typeof window !== "undefined") {
      const href = p.rowHref(row);
      const a = document.querySelector<HTMLAnchorElement>(`a[href="${CSS.escape(href)}"]`);
      if (a) a.click();
      else window.location.assign(href);
    }
  };
}

function SkeletonRows<T>({ count }: { count: number }) {
  const { internal, props: p } = useDataTable<T>();
  const widths = ["72%", "54%", "64%", "48%", "80%"];
  return (
    <>
      {Array.from({ length: count }, (_, r) => (
        <TableRow key={r} aria-hidden data-slot="data-table-skeleton">
          {internal.orderedColumns.map((col, c) => {
            if (col.id === SELECT || col.id === ACTIONS) return <TableCell key={col.id} className="w-11" />;
            const def = p.columns.find((x) => x.id === col.id)!;
            const type = def.type ?? "text";
            return (
              <TableCell key={col.id} align={columnAlign(def)}>
                {type === "user" ? (
                  <span className="flex items-center gap-2">
                    <Skeleton shape="circle" className="size-5" />
                    <Skeleton className="h-3 rounded-full" style={{ width: widths[(r + c) % 5] }} />
                  </span>
                ) : type === "enum" || type === "tags" ? (
                  <Skeleton className="h-5 w-16 rounded-full" />
                ) : (
                  <Skeleton className={cn("h-3 rounded-full", END_TYPES.has(type) && "ms-auto")} style={{ width: END_TYPES.has(type) ? "46%" : widths[(r + c) % 5] }} />
                )}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

function StatusRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr data-slot="table-empty">
      <td colSpan={colSpan} className="px-(--cell-px) py-10">
        {children}
      </td>
    </tr>
  );
}

/** The table (or the mobile cards) with loading, empty, no-results and error states. */
export function DataTableContent({ className }: { className?: string }) {
  const ctx = useDataTable();
  const { table, selection, setSelection, pageRows, setState, internal, props: p } = ctx;
  const { t, orderedColumns } = internal;
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const virtual = p.virtual ? (p.virtual === true ? {} : p.virtual) : null;
  const virtualizer = useVirtualizer({
    count: virtual ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => virtual?.estimateRowHeight ?? 48,
    overscan: virtual?.overscan ?? 8,
    getItemKey: (i) => rows[i]?.id ?? i,
    initialRect: { width: 960, height: 600 },
  });
  const grid = p.navigation === "grid";
  const firstLoad = Boolean(p.loading) && p.data.length === 0;
  const refreshing = Boolean(p.loading) && p.data.length > 0;
  const noData = !p.loading && p.data.length === 0 && !internal.hasQuery;
  const noResults = !p.loading && rows.length === 0 && !noData;
  const pageIds = pageRows.map((r) => p.getRowId(r));
  const selectablePage = pageRows.filter((r) => internal.isSelectable(r) === true).map((r) => p.getRowId(r));
  const onPage = pageIds.filter((id) => isRowSelected(selection, id)).length;
  const headerChecked: CheckboxCheckedState = onPage === 0 ? false : onPage === pageIds.length ? true : "indeterminate";

  const toggleAllPage = () => {
    if (headerChecked === true) {
      if (selection.mode === "all") setSelection({ ...selection, except: Array.from(new Set([...selection.except, ...pageIds])) });
      else setSelection({ mode: "ids", ids: selection.ids.filter((id) => !pageIds.includes(id)) });
    } else if (selection.mode === "all") setSelection({ ...selection, except: selection.except.filter((id) => !selectablePage.includes(id)) });
    else setSelection({ mode: "ids", ids: Array.from(new Set([...selection.ids, ...selectablePage])) });
  };

  // Grid navigation (WAI-ARIA data grid): roving cell focus.
  const [active, setActive] = React.useState({ r: 0, c: 0 });
  useIsomorphicLayoutEffect(() => {
    if (!grid) return;
    const root = scrollRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-r]").forEach((el) => {
      el.tabIndex = Number(el.dataset.r) === active.r && Number(el.dataset.c) === active.c ? 0 : -1;
    });
  });
  const onGridKeyDown = (e: React.KeyboardEvent) => {
    if (!grid) return;
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-r]");
    if (!cell || cell !== e.target) return;
    const r = Number(cell.dataset.r);
    const c = Number(cell.dataset.c);
    const maxR = rows.length - 1;
    const maxC = orderedColumns.length - 1;
    let next: { r: number; c: number } | null = null;
    if (e.key === "ArrowDown") next = { r: Math.min(maxR, r + 1), c };
    else if (e.key === "ArrowUp") next = { r: Math.max(0, r - 1), c };
    else if (e.key === "ArrowRight") next = { r, c: Math.min(maxC, c + 1) };
    else if (e.key === "ArrowLeft") next = { r, c: Math.max(0, c - 1) };
    else if (e.key === "Home") next = e.ctrlKey || e.metaKey ? { r: 0, c: 0 } : { r, c: 0 };
    else if (e.key === "End") next = e.ctrlKey || e.metaKey ? { r: maxR, c: maxC } : { r, c: maxC };
    else if (e.key === "PageDown") next = { r: Math.min(maxR, r + 10), c };
    else if (e.key === "PageUp") next = { r: Math.max(0, r - 10), c };
    else if (e.key === "Enter" || e.key === "F2") {
      const colId = orderedColumns[c]?.id;
      const def = p.columns.find((x) => x.id === colId);
      if (def?.edit && !p.readOnly && p.onCellEdit) {
        e.preventDefault();
        internal.setEditing({ rowId: rows[r]!.id, columnId: def.id });
      }
      return;
    }
    if (!next) return;
    e.preventDefault();
    setActive(next);
    const target = scrollRef.current?.querySelector<HTMLElement>(`[data-r="${next.r}"][data-c="${next.c}"]`);
    target?.focus();
  };

  if (internal.cards) return <DataTableCards className={className} />;

  const visibleCount = orderedColumns.length;
  const items = virtual ? virtualizer.getVirtualItems() : [];
  const padTop = virtual && items.length ? items[0]!.start : 0;
  const padBottom = virtual && items.length ? virtualizer.getTotalSize() - items[items.length - 1]!.end : 0;

  return (
    <div className={cn("relative min-w-0", className)} data-slot="data-table-content">
      {p.error ? (
        <div className="px-(--cell-px) pt-3">
          <Alert
            tone="danger"
            live="assertive"
            title={t("errorTitle")}
            actions={
              p.error.onRetry ? (
                <Button size="sm" variant="secondary" onClick={p.error.onRetry}>
                  {t("retry")}
                </Button>
              ) : undefined
            }
          >
            {p.error.message}
          </Alert>
        </div>
      ) : null}
      {refreshing ? <div className="ui-dt-refresh" role="progressbar" aria-label={t("refreshing")} /> : null}
      <TableContainer ref={scrollRef} aria-label={p.caption} maxHeight={virtual ? (virtual.height ?? "32rem") : undefined} onKeyDown={onGridKeyDown}>
        <Table
          role={grid ? "grid" : undefined}
          aria-busy={p.loading || undefined}
          aria-rowcount={virtual ? rows.length + 1 : undefined}
          aria-multiselectable={grid && p.selectable === true ? true : undefined}
          layout="fixed"
          stickyHeader={Boolean(virtual)}
          stickyFirstColumn={internal.narrow && p.mobile === "scroll"}
          density="inherit"
          style={{ width: table.getTotalSize(), minWidth: "100%" }}
          className="ui-dt-table"
        >
          <TableCaption visuallyHidden={!p.showCaption} side="top">
            {p.caption}
          </TableCaption>
          <TableHeader>
            <TableRow aria-rowindex={virtual ? 1 : undefined}>
              {orderedColumns.map((col) => {
                if (col.id === SELECT) {
                  return (
                    <TableHead key={col.id} style={{ width: 44, ...pinStyle(col, true) }} {...pinAttrs(col)} className="pe-0">
                      {p.selectable === true ? (
                        <span className="flex items-center">
                          <Checkbox size="sm" checked={headerChecked} disabled={selectablePage.length === 0} onCheckedChange={toggleAllPage} aria-label={t("selectPageRows")} />
                        </span>
                      ) : (
                        <span className="sr-only">{t("selectPageRows")}</span>
                      )}
                    </TableHead>
                  );
                }
                if (col.id === ACTIONS)
                  return (
                    <TableHead key={col.id} style={{ width: 52, ...pinStyle(col, true) }} {...pinAttrs(col)}>
                      <span className="sr-only">{t("moreActions")}</span>
                    </TableHead>
                  );
                const header = table.getFlatHeaders().find((h) => h.column.id === col.id)!;
                const def = p.columns.find((x) => x.id === col.id)!;
                return <HeaderCell key={col.id} header={header} def={def} />;
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {firstLoad ? (
              <SkeletonRows count={Math.min(10, isCursorPage(ctx.state.page) ? 10 : ctx.state.page.size)} />
            ) : noData ? (
              <StatusRow colSpan={visibleCount}>{p.empty ?? <EmptyState kind="first-use" size="sm" title={t("emptyTitle")} description={t("emptyDescription")} />}</StatusRow>
            ) : noResults ? (
              <StatusRow colSpan={visibleCount}>
                {p.noResults ?? (
                  <EmptyState
                    kind="no-results"
                    size="sm"
                    title={t("noResultsTitle")}
                    description={t("noResultsDescription")}
                    actions={
                      <Button size="sm" variant="secondary" onClick={() => setState({ q: "", filters: emptyFilterGroup() }, "filters")}>
                        {t("clearFilters")}
                      </Button>
                    }
                  />
                )}
              </StatusRow>
            ) : virtual ? (
              <>
                {padTop > 0 ? (
                  <tr aria-hidden style={{ height: padTop }}>
                    <td colSpan={visibleCount} />
                  </tr>
                ) : null}
                {items.map((item) => {
                  const row = rows[item.index]!;
                  return <DataRow key={row.id} row={row} index={item.index} virtualIndex={item.index} measureRef={virtualizer.measureElement} />;
                })}
                {padBottom > 0 ? (
                  <tr aria-hidden style={{ height: padBottom }}>
                    <td colSpan={visibleCount} />
                  </tr>
                ) : null}
              </>
            ) : (
              rows.map((row, i) => <DataRow key={row.id} row={row} index={i} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

/** Mobile layout: every row a card (title, subtitle, badge, label:value meta, checkbox, actions). */
export function DataTableCards({ className }: { className?: string }) {
  const { table, selection, setSelection, internal, props: p, setState } = useDataTable();
  const { t } = internal;
  const navigate = useNavigateRow();
  const rows = table.getRowModel().rows;
  const visibleIds = new Set(internal.orderedColumns.map((c) => c.id));
  const defs = p.columns.filter((c) => visibleIds.has(c.id) && c.mobile !== "hidden");
  const title = internal.titleColumn;
  const subtitle = defs.find((c) => c.mobile === "subtitle");
  const badge = defs.find((c) => c.mobile === "badge") ?? defs.find((c) => c !== title && c.type === "enum" && !c.mobile);
  const avatar = defs.find((c) => c.mobile === "avatar");
  const meta = defs.filter((c) => c !== title && c !== subtitle && c !== badge && c !== avatar && (c.mobile === "meta" || !c.mobile)).slice(0, 4);
  const Link = useLink();

  if (p.loading && p.data.length === 0) {
    return (
      <ul aria-label={p.caption} aria-busy className={cn("grid gap-2 p-3", className)}>
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="surface-2 grid gap-2 rounded-ui p-3">
            <Skeleton className="h-3.5 w-2/3 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
          </li>
        ))}
      </ul>
    );
  }
  if (rows.length === 0) {
    return (
      <div className={cn("px-4 py-10", className)}>
        {internal.hasQuery
          ? (p.noResults ?? (
              <EmptyState
                kind="no-results"
                size="sm"
                title={t("noResultsTitle")}
                description={t("noResultsDescription")}
                actions={
                  <Button size="sm" variant="secondary" onClick={() => setState({ q: "", filters: emptyFilterGroup() }, "filters")}>
                    {t("clearFilters")}
                  </Button>
                }
              />
            ))
          : (p.empty ?? <EmptyState kind="first-use" size="sm" title={t("emptyTitle")} description={t("emptyDescription")} />)}
      </div>
    );
  }
  return (
    <ul aria-label={p.caption} aria-busy={p.loading || undefined} data-slot="data-table-cards" className={cn("grid gap-2 p-3", className)}>
      {rows.map((row) => {
        const r = row.original;
        const selected = isRowSelected(selection, row.id);
        const titleValue = title ? readColumnValue(title, r) : row.id;
        const titleNode = title?.cell ? title.cell({ row: r, value: titleValue, rowId: row.id, index: row.index, column: title }) : textOf(titleValue);
        return (
          <li
            key={row.id}
            data-row-id={row.id}
            data-state={selected ? "selected" : undefined}
            className={cn("ui-dt-card surface-2 relative flex gap-3 rounded-ui p-3 transition-colors", selected && "bg-selected", (p.onRowClick || p.rowHref) && "cursor-pointer")}
            onClick={(e) => {
              if (!(p.onRowClick || p.rowHref) || (e.target as HTMLElement).closest(INTERACTIVE)) return;
              navigate(r);
            }}
          >
            {p.selectable ? (
              <span className="pt-0.5" data-no-row-click="">
                <Checkbox size="sm" checked={selected} disabled={internal.isSelectable(r) !== true} aria-label={t("selectRow", { name: internal.rowLabel(r) })} onCheckedChange={() => setSelection(toggleId(selection, row.id, p.selectable === "single"))} />
              </span>
            ) : null}
            {avatar ? <DataTableValue column={{ ...avatar, type: "user" }} value={readColumnValue(avatar, r)} /> : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
                  {p.rowHref ? (
                    <Link href={p.rowHref(r)} className="rounded-ui-sm underline-offset-4 hover:underline focus-ring">
                      {titleNode}
                    </Link>
                  ) : (
                    titleNode
                  )}
                </p>
                {badge ? <span className="shrink-0">{badge.cell ? badge.cell({ row: r, value: readColumnValue(badge, r), rowId: row.id, index: row.index, column: badge }) : <DataTableValue column={badge} value={readColumnValue(badge, r)} />}</span> : null}
              </div>
              {subtitle ? <p className="mt-0.5 truncate text-[13px] text-fg-muted">{subtitle.cell ? subtitle.cell({ row: r, value: readColumnValue(subtitle, r), rowId: row.id, index: row.index, column: subtitle }) : <DataTableValue column={subtitle} value={readColumnValue(subtitle, r)} />}</p> : null}
              {meta.length ? (
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {meta.map((c) => (
                    <div key={c.id} className="min-w-0">
                      <dt className="text-fg-subtle">{c.header}</dt>
                      <dd className={cn("truncate text-fg", END_TYPES.has(c.type ?? "text") && "tabular")}>
                        {c.cell ? c.cell({ row: r, value: readColumnValue(c, r), rowId: row.id, index: row.index, column: c }) : <DataTableValue column={c} value={readColumnValue(c, r)} />}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
            {p.rowActions ? (
              <span data-no-row-click="" className="-me-1 -mt-1">
                <ActionMenu items={p.rowActions(r)} triggerLabel={t("rowActions", { name: internal.rowLabel(r) })} triggerSize="xs" />
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

/** Pagination (pages, cursor), "Load more" or the infinite-scroll sentinel. */
export function DataTableFooter({ className }: { className?: string }) {
  const { state, setState, total, internal, props: p } = useDataTable();
  const { t } = internal;
  const sentinel = React.useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const loadMore = React.useCallback(async () => {
    if (!p.onLoadMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await p.onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  }, [p, loadingMore]);

  React.useEffect(() => {
    if (p.pagination !== "infinite" || !p.hasMore || typeof IntersectionObserver === "undefined" || !sentinel.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) void loadMore();
    }, { rootMargin: "240px" });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [p.pagination, p.hasMore, loadMore]);

  const pagination = p.pagination ?? "pages";
  if (pagination === "none" || (p.data.length === 0 && !p.loading && total === 0)) return null;
  const frame = cn("flex items-center gap-3 px-(--cell-px) py-3", p.variant !== "flush" && "border-t border-line", className);

  if (pagination === "load-more" || pagination === "infinite") {
    return (
      <div className={cn(frame, "justify-center")} data-slot="data-table-footer">
        {pagination === "infinite" ? <div ref={sentinel} aria-hidden className="h-px w-px" /> : null}
        {p.hasMore ? (
          <Button size="sm" variant="secondary" loading={loadingMore || (Boolean(p.loading) && p.data.length > 0)} onClick={() => void loadMore()}>
            {t("loadMore")}
          </Button>
        ) : (
          <p className="text-[13px] text-fg-subtle">{t("noMore")}</p>
        )}
      </div>
    );
  }

  if (isCursorPage(state.page)) {
    const size = state.page.size;
    return (
      <div className={cn(frame, "justify-end")} data-slot="data-table-footer">
        <CursorPagination
          hasPrev={Boolean(p.cursors?.prev)}
          hasNext={Boolean(p.cursors?.next)}
          loading={p.loading}
          size="sm"
          onPrev={() => setState({ page: { cursor: p.cursors?.prev ?? null, size } }, "page")}
          onNext={() => setState({ page: { cursor: p.cursors?.next ?? null, size } }, "page")}
        />
      </div>
    );
  }

  return (
    <div className={frame} data-slot="data-table-footer">
      <PaginationBar
        className="w-full"
        size="sm"
        total={total}
        page={state.page.index + 1}
        pageSize={state.page.size}
        pageSizeOptions={p.pageSizes ?? [25, 50, 100]}
        loading={Boolean(p.loading) && p.data.length > 0}
        onPageChange={(page) => setState({ page: { index: page - 1, size: (state.page as { size: number }).size } }, "page")}
        onPageSizeChange={(size) => setState({ page: { index: 0, size } }, "pageSize")}
      />
    </div>
  );
}

export type { ViewState };
