/**
 * `ListState` ⇄ URL search params. React-free: `parseListState()` runs in a server component so
 * the first HTML already has the right rows.
 *
 * `?q=jane&f=stage.in:proposal|won;value.gte:5000;created.relative:last_30_days&sort=-createdAt,name&page=2&size=50&sv=v_8k2`
 *
 * - values are URI-encoded; `|` separates multiple values (`in`, `between`)
 * - unknown fields / operators and malformed values are dropped silently
 * - `page` is 1-based in the URL, 0-based in `ListState`
 * - column widths / visibility are not written (they are preferences, not position)
 */
import { clauseId, createListState, fieldOps, isCursorPage, isFilterGroup, opTakesNoValue, type FilterClause, type FilterFieldDef, type FilterGroup, type ListState, type RelativeDate, type SortClause } from "./types";

export interface UrlStateKeys {
  q: string;
  filters: string;
  sort: string;
  page: string;
  size: string;
  cursor: string;
  view: string;
  density: string;
}

export interface UrlStateOptions {
  /** Prefix every key (two lists on one page): `prefix: "c_"` → `c_q`, `c_f`… */
  prefix?: string;
  /** Rename individual keys. */
  keys?: Partial<UrlStateKeys>;
  /** Where to read and write. Default: `createHistoryAdapter()`. */
  adapter?: UrlStateAdapter;
  /** `"replace"` (default) keeps the back button for real navigation; `"push"` adds an entry per change. */
  history?: "replace" | "push";
  /** Also write the table-local density. Default `false`. */
  density?: boolean;
}

/** Reads and writes the query string. Swap it for a router (`router.replace`) or a hash adapter. */
export interface UrlStateAdapter {
  /** The current search string, with or without the leading `?`. */
  read(): string;
  write(search: string, mode: "replace" | "push"): void;
  /** Called on back / forward. Returns an unsubscribe function. */
  subscribe(cb: () => void): () => void;
}

const DEFAULT_KEYS: UrlStateKeys = { q: "q", filters: "f", sort: "sort", page: "page", size: "size", cursor: "cursor", view: "sv", density: "density" };

export function resolveUrlKeys(o: Pick<UrlStateOptions, "prefix" | "keys"> = {}): UrlStateKeys {
  const keys = { ...DEFAULT_KEYS, ...o.keys };
  if (!o.prefix) return keys;
  return Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, o.prefix + v])) as unknown as UrlStateKeys;
}

/* ------------------------------------------------------------------ */
/* Raw query parsing (no double decoding of the filter string)         */
/* ------------------------------------------------------------------ */

type RawParams = Array<[key: string, raw: string]>;

const decode = (s: string) => {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
};

function readRaw(search: string): RawParams {
  const s = search.startsWith("?") ? search.slice(1) : search;
  if (!s) return [];
  return s
    .split("&")
    .filter(Boolean)
    .map((pair) => {
      const i = pair.indexOf("=");
      return i === -1 ? [decode(pair), ""] : [decode(pair.slice(0, i)), pair.slice(i + 1)];
    });
}

const enc = (s: string) => encodeURIComponent(s);
/** Filter-string value encoding: also escape the separators the format uses. */
const encValue = (s: string) => encodeURIComponent(s);
/** A decoded parameter value back to the raw form the parser expects (separators unescaped). */
const reRaw = (v: string) => encodeURIComponent(v).replace(/%7C/gi, "|").replace(/%3A/gi, ":").replace(/%3B/gi, ";").replace(/%2C/gi, ",");

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

function encodeRelative(r: RelativeDate): string {
  if (typeof r === "string") return r;
  return `${r.last}${r.unit[0]}`;
}

function decodeRelative(s: string): RelativeDate | null {
  const m = /^(\d{1,3})([dwm])$/.exec(s);
  if (m) return { last: Number(m[1]), unit: m[2] === "d" ? "day" : m[2] === "w" ? "week" : "month" };
  return /^[a-z_0-9]+$/.test(s) ? (s as RelativeDate) : null;
}

const scalarToString = (v: unknown) => (typeof v === "object" && v !== null ? String((v as { id?: unknown }).id ?? "") : String(v));

/** `stage.in:proposal|won;value.gte:5000` — the `f` parameter. Nested groups are flattened (simple mode). */
export function encodeFilters(g: FilterGroup): string {
  const parts: string[] = [];
  const walk = (group: FilterGroup) => {
    for (const c of group.clauses) {
      if (isFilterGroup(c)) {
        walk(c);
        continue;
      }
      const head = `${encValue(c.field)}.${c.op}`;
      if (opTakesNoValue(c.op)) {
        parts.push(head);
        continue;
      }
      if (c.value === undefined || c.value === null || c.value === "") continue;
      let value: string;
      if (c.op === "relative") value = encodeRelative(c.value as RelativeDate);
      else if (Array.isArray(c.value)) value = c.value.map((v) => encValue(scalarToString(v))).join("|");
      else value = encValue(scalarToString(c.value));
      if (!value) continue;
      parts.push(`${head}:${value}`);
    }
  };
  walk(g);
  return parts.join(";");
}

function coerce(raw: string, field: FilterFieldDef | undefined): unknown {
  const s = decode(raw);
  if (!field) return s;
  if (field.type === "number" || field.type === "percent") {
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }
  if (field.type === "currency") return /^-?\d+(\.\d+)?$/.test(s) ? s : undefined;
  if (field.type === "boolean") return s === "true" ? true : s === "false" ? false : undefined;
  if (field.type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
  return s;
}

/**
 * Parses the `f` parameter. With `fields`, unknown fields, operators a field does not allow and
 * malformed values are dropped; without it every syntactically valid clause is kept as text.
 */
export function decodeFilters(raw: string, fields?: FilterFieldDef[]): FilterGroup {
  const byField = fields ? new Map(fields.map((f) => [f.field, f])) : null;
  const clauses: FilterClause[] = [];
  for (const part of raw.split(";")) {
    if (!part) continue;
    const colon = part.indexOf(":");
    const head = colon === -1 ? part : part.slice(0, colon);
    const body = colon === -1 ? "" : part.slice(colon + 1);
    const dot = head.lastIndexOf(".");
    if (dot <= 0) continue;
    const field = decode(head.slice(0, dot));
    const op = head.slice(dot + 1) as FilterClause["op"];
    const def = byField?.get(field);
    if (byField && (!def || !fieldOps(def).includes(op))) continue;
    if (opTakesNoValue(op)) {
      clauses.push({ id: clauseId(), field, op });
      continue;
    }
    if (!body) continue;
    let value: unknown;
    if (op === "relative") {
      value = decodeRelative(decode(body));
    } else if (op === "in" || op === "notIn") {
      const list = body.split("|").map((v) => decode(v)).filter(Boolean);
      value = list.length ? list : undefined;
    } else if (op === "between") {
      const pair = body.split("|").map((v) => coerce(v, def));
      value = pair.length === 2 && pair.every((v) => v !== undefined && v !== "") ? pair : undefined;
    } else {
      value = coerce(body, def);
    }
    if (value === undefined || value === null) continue;
    clauses.push({ id: clauseId(), field, op, value });
  }
  return { logic: "and", clauses };
}

/* ------------------------------------------------------------------ */
/* Whole state                                                         */
/* ------------------------------------------------------------------ */

export interface SerializeOptions extends Pick<UrlStateOptions, "prefix" | "keys" | "density"> {
  /** Values equal to these defaults are left out of the URL (clean links). */
  defaults?: Partial<ListState>;
}

/** The owned parameters of a list state, in a stable order. Values are already encoded. */
export function listStateToParams(state: ListState, o: SerializeOptions = {}): Array<[string, string]> {
  const k = resolveUrlKeys(o);
  const d = createListState(o.defaults);
  const out: Array<[string, string]> = [];
  if (state.q.trim()) out.push([k.q, enc(state.q)]);
  const f = encodeFilters(state.filters);
  if (f && f !== encodeFilters(d.filters)) out.push([k.filters, f]);
  const sort = state.sort.map((s) => (s.desc ? "-" : "") + encValue(s.id)).join(",");
  const defSort = d.sort.map((s) => (s.desc ? "-" : "") + encValue(s.id)).join(",");
  if (sort !== defSort) out.push([k.sort, sort || "none"]);
  if (isCursorPage(state.page)) {
    if (state.page.cursor) out.push([k.cursor, enc(state.page.cursor)]);
  } else if (state.page.index > 0) out.push([k.page, String(state.page.index + 1)]);
  if (state.page.size !== d.page.size) out.push([k.size, String(state.page.size)]);
  if (state.view) out.push([k.view, enc(state.view)]);
  if (o.density && state.density && state.density !== d.density) out.push([k.density, state.density]);
  return out;
}

/**
 * `ListState` → search string (no leading `?`). Defaults are omitted, so the canonical list has a clean URL.
 *
 * ```ts
 * serializeListState(state, { defaults: { sort: [{ id: "createdAt", desc: true }] } });
 * // "q=jane&f=stage.in:proposal|won&page=2"
 * ```
 */
export function serializeListState(state: ListState, o: SerializeOptions = {}): string {
  return listStateToParams(state, o)
    .map(([key, v]) => `${enc(key)}=${v}`)
    .join("&");
}

/**
 * Replaces the list's own parameters in an existing search string and keeps every other
 * parameter (`?tab=deals&q=…`) in place.
 */
export function mergeListStateIntoSearch(search: string, state: ListState, o: SerializeOptions = {}): string {
  const k = resolveUrlKeys(o);
  const owned = new Set(Object.values(k));
  const kept = readRaw(search).filter(([key]) => !owned.has(key)).map(([key, raw]) => `${enc(key)}=${raw}`);
  const own = listStateToParams(state, o).map(([key, v]) => `${enc(key)}=${v}`);
  return [...kept, ...own].join("&");
}

export interface ParseOptions extends Pick<UrlStateOptions, "prefix" | "keys"> {
  /** Field definitions: unknown fields / operators are dropped, values typed. */
  fields?: FilterFieldDef[];
  /** Base state for anything the URL does not say. */
  defaults?: Partial<ListState>;
  /** Allowed sort column ids (others are dropped). */
  sortable?: string[];
  /** Allowed page sizes. A different `size` falls back to the default. */
  pageSizes?: number[];
}

/**
 * Search string (or `URLSearchParams`, or a Next.js `searchParams` object) → `ListState`.
 * Safe on untrusted input: bad values fall back to the defaults.
 */
export function parseListState(input: string | URLSearchParams | Record<string, string | string[] | undefined>, o: ParseOptions = {}): ListState {
  const k = resolveUrlKeys(o);
  const base = createListState(o.defaults);
  let raw: RawParams;
  if (typeof input === "string") raw = readRaw(input);
  else if (input instanceof URLSearchParams) raw = [...input.entries()].map(([key, v]) => [key, reRaw(v)]);
  else
    raw = Object.entries(input).flatMap(([key, v]) =>
      v === undefined ? [] : (Array.isArray(v) ? v : [v]).map((x) => [key, reRaw(x)] as [string, string]),
    );
  const get = (key: string) => raw.find(([n]) => n === key)?.[1];

  const state: ListState = { ...base, columns: base.columns };
  const q = get(k.q);
  if (q !== undefined) state.q = decode(q).slice(0, 500);
  const f = get(k.filters);
  if (f !== undefined) state.filters = decodeFilters(f, o.fields);
  const sort = get(k.sort);
  if (sort !== undefined) {
    const list: SortClause[] = sort === "none" || sort === "" ? [] : sort.split(",").map((s) => (s.startsWith("-") ? { id: decode(s.slice(1)), desc: true } : { id: decode(s), desc: false }));
    state.sort = list.filter((s) => s.id && (!o.sortable || o.sortable.includes(s.id)));
  }
  let size = base.page.size;
  const sizeRaw = get(k.size);
  if (sizeRaw !== undefined) {
    const n = Number(sizeRaw);
    if (Number.isInteger(n) && n > 0 && n <= 1000 && (!o.pageSizes || o.pageSizes.includes(n))) size = n;
  }
  const cursor = get(k.cursor);
  if (cursor !== undefined || isCursorPage(base.page)) {
    state.page = { cursor: cursor ? decode(cursor) : null, size };
  } else {
    const p = Number(get(k.page) ?? 1);
    state.page = { index: Number.isInteger(p) && p > 0 ? p - 1 : 0, size };
  }
  const view = get(k.view);
  if (view !== undefined) state.view = decode(view) || null;
  const density = get(k.density);
  if (density === "compact" || density === "comfortable" || density === "spacious") state.density = density;
  return state;
}

/* ------------------------------------------------------------------ */
/* Adapters                                                            */
/* ------------------------------------------------------------------ */

/**
 * The built-in adapter: `history.replaceState` / `pushState` on the current URL. Works with the
 * Next.js App Router (`useSearchParams` observes `history` updates). SSR-safe.
 */
export function createHistoryAdapter(): UrlStateAdapter {
  return {
    read: () => (typeof window === "undefined" ? "" : window.location.search),
    write(search, mode) {
      if (typeof window === "undefined") return;
      const url = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
      if (url === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
      if (mode === "push") window.history.pushState(window.history.state, "", url);
      else window.history.replaceState(window.history.state, "", url);
    },
    subscribe(cb) {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("popstate", cb);
      return () => window.removeEventListener("popstate", cb);
    },
  };
}

/** An in-memory adapter for tests, previews and embedded lists. */
export function createMemoryAdapter(initial = ""): UrlStateAdapter & { readonly search: string } {
  let search = initial.replace(/^\?/, "");
  const subs = new Set<() => void>();
  return {
    get search() {
      return search;
    },
    read: () => search,
    write(next) {
      search = next;
    },
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
  };
}
