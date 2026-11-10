/** Saved-view helpers. React-free. */
import { createListState, isCursorPage, isFilterGroup, type FilterGroup, type ListState, type SavedView, type ViewState } from "./types";

const canonValue = (v: unknown): unknown => (Array.isArray(v) ? v.map(canonValue).map(String).sort() : v && typeof v === "object" ? JSON.stringify(v, Object.keys(v as object).sort()) : v);

function canonFilters(g: FilterGroup): unknown {
  const items = g.clauses.map((c) => (isFilterGroup(c) ? canonFilters(c) : JSON.stringify([c.field, c.op, canonValue(c.value)]))).map((x) => (typeof x === "string" ? x : JSON.stringify(x)));
  items.sort();
  return { logic: items.length > 1 ? g.logic : "and", items };
}

/** Visibility with explicit `true` entries removed (missing = visible). */
const canonVisible = (v: Record<string, boolean> = {}) =>
  Object.keys(v)
    .filter((k) => v[k] === false)
    .sort();

/**
 * `true` when two view states describe the same list. Order-insensitive for filters and column
 * visibility; ignores clause ids, page position and column widths under 4 px apart.
 */
export function viewStateEqual(a: ViewState, b: ViewState): boolean {
  if ((a.q ?? "").trim() !== (b.q ?? "").trim()) return false;
  if (JSON.stringify(canonFilters(a.filters)) !== JSON.stringify(canonFilters(b.filters))) return false;
  if (JSON.stringify(a.sort ?? []) !== JSON.stringify(b.sort ?? [])) return false;
  if ((a.density ?? null) !== (b.density ?? null)) return false;
  if ((a.groupBy ?? null) !== (b.groupBy ?? null)) return false;
  if (a.pageSize !== undefined && b.pageSize !== undefined && a.pageSize !== b.pageSize) return false;
  const ca = a.columns;
  const cb = b.columns;
  if (JSON.stringify(canonVisible(ca?.visible)) !== JSON.stringify(canonVisible(cb?.visible))) return false;
  const orderA = ca?.order ?? [];
  const orderB = cb?.order ?? [];
  if (orderA.length && orderB.length && orderA.join() !== orderB.join()) return false;
  if (JSON.stringify(ca?.pinned ?? { start: [], end: [] }) !== JSON.stringify(cb?.pinned ?? { start: [], end: [] })) return false;
  const sizes = new Set([...Object.keys(ca?.sizing ?? {}), ...Object.keys(cb?.sizing ?? {})]);
  for (const key of sizes) {
    const x = ca?.sizing?.[key];
    const y = cb?.sizing?.[key];
    if (x !== undefined && y !== undefined && Math.abs(x - y) >= 4) return false;
  }
  return true;
}

/** The part of a list state a saved view stores. */
export function toViewState(s: ListState): ViewState {
  return { q: s.q || undefined, filters: s.filters, sort: s.sort, columns: s.columns, density: s.density, groupBy: s.groupBy ?? null, pageSize: s.page.size };
}

/** Applies a view to a list state: position resets to the first page, the view becomes active. */
export function applyViewState(current: ListState, view: ViewState | undefined, viewId: string | null, base?: Partial<ListState>): ListState {
  const reset = createListState(base, current.page.size);
  const source = view ?? toViewState(reset);
  const size = source.pageSize ?? current.page.size;
  return {
    ...current,
    q: source.q ?? "",
    filters: source.filters ?? reset.filters,
    sort: source.sort ?? reset.sort,
    columns: { ...reset.columns, ...source.columns, pinned: source.columns?.pinned ?? { start: [], end: [] } },
    density: source.density ?? reset.density,
    groupBy: source.groupBy ?? null,
    page: isCursorPage(current.page) ? { cursor: null, size } : { index: 0, size },
    view: viewId,
  };
}

/**
 * Which view to open on load: URL `sv` → the user's default view → `null` ("All").
 * A deleted id falls through to the default.
 */
export function resolveInitialView(views: SavedView[], urlViewId?: string | null): SavedView | null {
  if (urlViewId) {
    const hit = views.find((v) => v.id === urlViewId);
    if (hit) return hit;
  }
  return views.find((v) => v.isDefault) ?? null;
}
