/**
 * Shared list-state contract for Data Table, Filter bar, Saved views, Kanban, Calendar and any
 * other collection view. React-free at runtime (type-only React import), so it can be imported
 * in server components and API routes: the same `ListState` drives the UI, the URL and the
 * server query.
 */
import type { ComponentType, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Fields & operators                                                  */
/* ------------------------------------------------------------------ */

/** Value type of a field. Decides operators, value editor, formatting and sorting. */
export type FieldType = "text" | "number" | "currency" | "percent" | "date" | "datetime" | "enum" | "boolean" | "user" | "tags";

/** Filter operator. Semantics are documented in `filter-fns.ts` and are the same on the server. */
export type FilterOp =
  | "contains"
  | "notContains"
  | "eq"
  | "neq"
  | "startsWith"
  | "isEmpty"
  | "isNotEmpty"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"
  | "notIn"
  | "before"
  | "after"
  | "on"
  | "relative";

export type RelativeDatePreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year";

/** A date range relative to "now", resolved at query time (so saved views stay current). */
export type RelativeDate = RelativeDatePreset | { last: number; unit: "day" | "week" | "month" };

/** One condition: `{ field: "stage", op: "in", value: ["proposal", "won"] }`. */
export interface FilterClause {
  /** Stable id (chip key, focus management). */
  id: string;
  field: string;
  op: FilterOp;
  /**
   * `in`/`notIn` → `string[]`; `between` → `[min, max]` (numbers or `YYYY-MM-DD`);
   * `relative` → `RelativeDate`; `isEmpty`/`isNotEmpty` → none; otherwise a scalar.
   * Dates are `YYYY-MM-DD` strings, money a decimal string or number. `"$me"` = the current user.
   */
  value?: unknown;
}

/** A group of clauses. The root is always a group; nested groups are the advanced mode. */
export interface FilterGroup {
  logic: "and" | "or";
  clauses: Array<FilterClause | FilterGroup>;
}

/** Symbolic "current user" value for user fields. Resolved at query time so team views work for everyone. */
export const ME = "$me";

/** Option of an enum / user / tags field. */
export interface FilterOption {
  value: string;
  label: string;
  /** Leading visual (avatar, status dot). */
  icon?: ReactNode;
  /** Badge tone used by the Data Table's default enum cell. */
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
  /** Extra search terms. */
  keywords?: string[];
}

/** A filterable field. Data Table generates these from its columns (`filterFieldsFromColumns`). */
export interface FilterFieldDef {
  field: string;
  label: string;
  type: FieldType;
  /** Icon component (e.g. a lucide icon) shown in the field picker. */
  icon?: ComponentType<{ className?: string }>;
  /** Allowed operators, in menu order. Default: `defaultOps(type)`. */
  ops?: FilterOp[];
  /** Enum / user / tags options. A function = async server search (`q` is the typed text). */
  options?: FilterOption[] | ((q: string) => Promise<FilterOption[]>);
  /** Pinned in the bar as an empty chip ("Status ▾") even without a value. */
  quick?: boolean;
  /** Enum: `false` → single value (`eq`) instead of `in`. Default `true`. */
  multiple?: boolean;
  /** Section in the field picker ("Contact", "Company"). */
  group?: string;
  /** ISO 4217 code for `currency` fields. Default: the locale provider's currency. */
  currency?: string;
  /** Client filtering: read the value from a row. Default `row[field]`. */
  accessor?: (row: any) => unknown;
  /** Input placeholder in the value editor. */
  placeholder?: string;
}

/* ------------------------------------------------------------------ */
/* List state                                                          */
/* ------------------------------------------------------------------ */

export interface SortClause {
  id: string;
  desc: boolean;
}

export type OffsetPage = { index: number; size: number };
export type CursorPage = { cursor: string | null; size: number };
export type PageState = OffsetPage | CursorPage;

export interface ColumnsState {
  /** Missing key = visible. */
  visible: Record<string, boolean>;
  /** Column ids in display order. Missing ids keep their definition order after the listed ones. */
  order: string[];
  /** Widths in px. */
  sizing: Record<string, number>;
  /** Pinned to the inline start / end (RTL-aware). */
  pinned: { start: string[]; end: string[] };
}

export type ListDensity = "compact" | "comfortable" | "spacious";

/** Everything a list screen needs to reproduce what the user sees. Serializable. */
export interface ListState {
  q: string;
  filters: FilterGroup;
  sort: SortClause[];
  page: PageState;
  columns: ColumnsState;
  density?: ListDensity;
  /** Active saved view id. */
  view?: string | null;
  groupBy?: string | null;
}

export type ListStateChangeReason = "search" | "filters" | "sort" | "page" | "pageSize" | "columns" | "density" | "view" | "reset";

/* ------------------------------------------------------------------ */
/* Selection                                                           */
/* ------------------------------------------------------------------ */

/**
 * Row selection. `ids` survives paging. `all` spans every page of a server-mode list: it carries
 * a snapshot of the query it was made for (and resets when the query changes).
 */
export type DataTableSelection =
  | { mode: "ids"; ids: string[] }
  | { mode: "all"; except: string[]; filters: FilterGroup; q: string; total: number };

export const emptySelection = (): DataTableSelection => ({ mode: "ids", ids: [] });

export function selectionCount(s: DataTableSelection): number {
  return s.mode === "ids" ? s.ids.length : Math.max(0, s.total - s.except.length);
}

export function isRowSelected(s: DataTableSelection, id: string): boolean {
  return s.mode === "ids" ? s.ids.includes(id) : !s.except.includes(id);
}

/* ------------------------------------------------------------------ */
/* Saved views                                                         */
/* ------------------------------------------------------------------ */

/** What a saved view stores: the list state without the position (page, cursor). */
export type ViewState = Omit<ListState, "page" | "q" | "view"> & { q?: string; pageSize?: number };

export interface SavedView {
  id: string;
  name: string;
  state: ViewState;
  scope: "personal" | "team";
  isDefault?: boolean;
  /** Icon component shown before the name. */
  icon?: ComponentType<{ className?: string }>;
  ownerId?: string;
  /** Built in (e.g. "All open deals"): cannot be renamed or deleted. */
  system?: boolean;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const emptyFilterGroup = (): FilterGroup => ({ logic: "and", clauses: [] });

export const emptyColumnsState = (): ColumnsState => ({ visible: {}, order: [], sizing: {}, pinned: { start: [], end: [] } });

export const isFilterGroup = (c: FilterClause | FilterGroup): c is FilterGroup => "clauses" in c;

export const isCursorPage = (p: PageState): p is CursorPage => "cursor" in p;

/** A complete `ListState` from a partial one (missing parts get defaults). */
export function createListState(partial: Partial<ListState> = {}, pageSize = 25): ListState {
  return {
    q: partial.q ?? "",
    filters: partial.filters ?? emptyFilterGroup(),
    sort: partial.sort ?? [],
    page: partial.page ?? { index: 0, size: pageSize },
    columns: { ...emptyColumnsState(), ...partial.columns, pinned: { start: [], end: [], ...partial.columns?.pinned } },
    density: partial.density,
    view: partial.view ?? null,
    groupBy: partial.groupBy ?? null,
  };
}

/** Root-level clauses (nested groups flattened depth-first). */
export function flattenClauses(g: FilterGroup): FilterClause[] {
  const out: FilterClause[] = [];
  for (const c of g.clauses) {
    if (isFilterGroup(c)) out.push(...flattenClauses(c));
    else out.push(c);
  }
  return out;
}

/** Operators per field type, in menu order. */
export function defaultOps(type: FieldType): FilterOp[] {
  switch (type) {
    case "text":
      return ["contains", "notContains", "eq", "startsWith", "isEmpty", "isNotEmpty"];
    case "number":
    case "currency":
    case "percent":
      return ["eq", "neq", "gt", "gte", "lt", "lte", "between", "isEmpty"];
    case "date":
    case "datetime":
      return ["on", "before", "after", "between", "relative", "isEmpty"];
    case "enum":
    case "tags":
      return ["in", "notIn", "isEmpty"];
    case "boolean":
      return ["eq"];
    case "user":
      return ["in", "notIn", "isEmpty"];
  }
}

/** Operators of a field, honouring `multiple: false` (single-valued enum → `eq`/`neq`). */
export function fieldOps(field: FilterFieldDef): FilterOp[] {
  if (field.ops) return field.ops;
  if (field.type === "enum" && field.multiple === false) return ["eq", "neq", "isEmpty"];
  return defaultOps(field.type);
}

/** Operators that take no value. */
export const opTakesNoValue = (op: FilterOp): boolean => op === "isEmpty" || op === "isNotEmpty";

/** `true` when a clause has what its operator needs (an incomplete clause is never applied). */
export function isClauseComplete(c: FilterClause): boolean {
  if (opTakesNoValue(c.op)) return true;
  const v = c.value;
  if (v === undefined || v === null || v === "") return false;
  if (c.op === "in" || c.op === "notIn") return Array.isArray(v) && v.length > 0;
  if (c.op === "between") return Array.isArray(v) && v.length === 2 && v[0] !== "" && v[1] !== "" && v[0] != null && v[1] != null;
  return true;
}

let clauseSeq = 0;
/** A short unique clause id. */
export const clauseId = (): string => `c${Date.now().toString(36)}${(++clauseSeq).toString(36)}`;
