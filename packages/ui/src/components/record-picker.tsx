"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Check, ChevronsUpDown, ExternalLink, LayoutList, Plus, RotateCw, Search, TriangleAlert, X } from "lucide-react";
import { cn } from "../lib/cn";
import { mergeIds } from "../lib/compose-refs";
import { FieldContextReset, useFieldControl } from "../lib/field-context";
import { useLabels, type LabelFn } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { SmartLink } from "../lib/provider";
import { highlightParts, matchText } from "../lib/text";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { ChipRemoveButton } from "../lib/islands";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { controlVariants, itemSlots, itemVariants } from "../lib/variants";
import { Avatar } from "./avatar";
import { Button, IconButton } from "./button";
import { Checkbox } from "./checkbox";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "./dialog";
import { Skeleton } from "./skeleton";
import { Spinner } from "./spinner";

/* ------------------------------------------------------------------ */
/* Data source                                                         */
/* ------------------------------------------------------------------ */

/**
 * How a picker reads a collection. The kit knows nothing about your API: wrap your fetch
 * (REST, tRPC, a server action, `queryClient.fetchQuery`) in `search` and `getByIds`.
 */
export interface RecordSource<R> {
  /** Cache key for the collection ("contacts", "companies"). Records are cached per key for the session. */
  key: string;
  /** Server search. Fold case and accents server-side too (Postgres `unaccent(lower(...))`). */
  search: (query: string, ctx: { signal: AbortSignal; cursor?: string; locale: string }) => Promise<{ items: R[]; nextCursor?: string }>;
  /** Resolve labels for ids you already have (initial values, a record loaded without its relations). */
  getByIds?: (ids: string[], signal: AbortSignal) => Promise<R[]>;
  getId: (r: R) => string;
  getLabel: (r: R) => string;
  getDescription?: (r: R) => string | undefined;
  getAvatar?: (r: R) => { src?: string | null; name: string; shape?: "circle" | "square" } | undefined;
  /** Link to the record: chips and cards become links. */
  href?: (r: R) => string | undefined;
}

export interface ArrayRecordSourceOptions<R> extends Omit<RecordSource<R>, "key" | "search" | "getByIds"> {
  /** Extra searchable text (email, SKU, city). */
  getKeywords?: (r: R) => string[];
  /** Page size. Default 50. */
  pageSize?: number;
  /** Fake latency in ms (docs, prototypes). Default 0. */
  delay?: number;
}

/**
 * A `RecordSource` over an in-memory array, searched with locale folding (İ/ı, accents).
 * Good for small sets, tests and prototypes; switch to a server `search` later without
 * touching the picker.
 */
export function arrayRecordSource<R>(key: string, items: R[], options: ArrayRecordSourceOptions<R>): RecordSource<R> {
  const { getKeywords, pageSize = 50, delay = 0, ...rest } = options;
  const wait = (signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      if (!delay) return resolve();
      const timer = setTimeout(resolve, delay);
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  return {
    key,
    ...rest,
    async search(query, { signal, cursor, locale }) {
      await wait(signal);
      const q = query.trim();
      const all = q
        ? items.filter((r) => matchText([rest.getLabel(r), rest.getDescription?.(r) ?? "", ...(getKeywords?.(r) ?? [])].join(" "), q, locale))
        : items;
      const start = cursor ? Number(cursor) : 0;
      const end = start + pageSize;
      return { items: all.slice(start, end), nextCursor: end < all.length ? String(end) : undefined };
    },
    async getByIds(ids, signal) {
      await wait(signal);
      const set = new Set(ids);
      return items.filter((r) => set.has(rest.getId(r)));
    },
  };
}

/* ------------------------------------------------------------------ */
/* Session caches (per source key)                                     */
/* ------------------------------------------------------------------ */

const recordCache = new Map<string, Map<string, unknown>>();
const recentCache = new Map<string, string[]>();
const pageCache = new Map<string, { items: unknown[]; nextCursor?: string; at: number }>();
const PAGE_TTL = 30_000;

function remember<R>(source: RecordSource<R>, records: R[]) {
  let m = recordCache.get(source.key);
  if (!m) recordCache.set(source.key, (m = new Map()));
  for (const r of records) m.set(source.getId(r), r);
}
function cached<R>(source: RecordSource<R>, id: string): R | undefined {
  return recordCache.get(source.key)?.get(id) as R | undefined;
}
function pushRecent<R>(source: RecordSource<R>, ids: string[]) {
  const prev = recentCache.get(source.key) ?? [];
  recentCache.set(source.key, [...ids, ...prev.filter((x) => !ids.includes(x))].slice(0, 5));
}
/** Clears the picker's session caches (after a logout, or in tests). Pass a key to clear one collection. */
export function clearRecordPickerCache(key?: string) {
  if (key === undefined) {
    recordCache.clear();
    recentCache.clear();
    pageCache.clear();
    return;
  }
  recordCache.delete(key);
  recentCache.delete(key);
  for (const k of pageCache.keys()) if (k.startsWith(`${key}\u0000`)) pageCache.delete(k);
}

const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

/** Debounced, abortable, paged search against a source. */
function useRecordSearch<R>(source: RecordSource<R>, query: string, enabled: boolean, locale: string) {
  const sourceRef = useLatest(source);
  const [state, setState] = React.useState<{ items: R[]; nextCursor?: string; loading: boolean; loadingMore: boolean; error: string | null; query: string }>({
    items: [],
    loading: false,
    loadingMore: false,
    error: null,
    query: "",
  });
  const [attempt, setAttempt] = React.useState(0);
  const ctrlRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (!enabled) return;
    const src = sourceRef.current;
    const cacheKey = `${src.key}\u0000${query.trim()}`;
    const hit = pageCache.get(cacheKey);
    if (hit && Date.now() - hit.at < PAGE_TTL && attempt === 0) {
      setState({ items: hit.items as R[], nextCursor: hit.nextCursor, loading: false, loadingMore: false, error: null, query });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    const ctrl = new AbortController();
    ctrlRef.current?.abort();
    ctrlRef.current = ctrl;
    const timer = setTimeout(
      () => {
        src
          .search(query.trim(), { signal: ctrl.signal, locale })
          .then((res) => {
            if (ctrl.signal.aborted) return;
            remember(src, res.items);
            pageCache.set(cacheKey, { items: res.items, nextCursor: res.nextCursor, at: Date.now() });
            setState({ items: res.items, nextCursor: res.nextCursor, loading: false, loadingMore: false, error: null, query });
          })
          .catch((e: unknown) => {
            if (ctrl.signal.aborted || isAbort(e)) return;
            setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
          });
      },
      query.trim() ? 200 : 0,
    );
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [enabled, query, attempt, locale, sourceRef, source.key]);

  const loadMore = React.useCallback(() => {
    const src = sourceRef.current;
    if (!state.nextCursor || state.loadingMore) return;
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setState((s) => ({ ...s, loadingMore: true }));
    src
      .search(query.trim(), { signal: ctrl.signal, cursor: state.nextCursor, locale })
      .then((res) => {
        if (ctrl.signal.aborted) return;
        remember(src, res.items);
        setState((s) => ({ ...s, items: [...s.items, ...res.items], nextCursor: res.nextCursor, loadingMore: false }));
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted || isAbort(e)) return;
        setState((s) => ({ ...s, loadingMore: false, error: e instanceof Error ? e.message : String(e) }));
      });
  }, [locale, query, sourceRef, state.loadingMore, state.nextCursor]);

  const retry = React.useCallback(() => {
    pageCache.delete(`${sourceRef.current.key}\u0000${query.trim()}`);
    setAttempt((n) => n + 1);
  }, [query, sourceRef]);

  return { ...state, loadMore, retry };
}

/** Resolves ids → records through the cache, `known` records and `getByIds`. */
function useResolvedRecords<R>(source: RecordSource<R>, ids: string[], known: R[] | undefined) {
  const sourceRef = useLatest(source);
  const [, bump] = React.useReducer((n: number) => n + 1, 0);
  const [pending, setPending] = React.useState<Set<string>>(() => new Set());
  const [missing, setMissing] = React.useState<Set<string>>(() => new Set());

  if (known?.length) remember(source, known);

  const idsKey = ids.join("\u0000");
  React.useEffect(() => {
    const src = sourceRef.current;
    const unresolved = ids.filter((id) => !cached(src, id) && !missing.has(id));
    if (unresolved.length === 0) return;
    if (!src.getByIds) {
      setMissing((m) => new Set([...m, ...unresolved]));
      return;
    }
    const ctrl = new AbortController();
    setPending(new Set(unresolved));
    src
      .getByIds(unresolved, ctrl.signal)
      .then((rs) => {
        if (ctrl.signal.aborted) return;
        remember(src, rs);
        const found = new Set(rs.map((r) => src.getId(r)));
        const gone = unresolved.filter((id) => !found.has(id));
        if (gone.length) setMissing((m) => new Set([...m, ...gone]));
        setPending(new Set());
        bump();
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted || isAbort(e)) return;
        setPending(new Set());
        setMissing((m) => new Set([...m, ...unresolved]));
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, source.key]);

  return ids.map((id) => ({ id, record: cached(source, id), pending: pending.has(id), missing: missing.has(id) && !cached(source, id) }));
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

const recordPickerLabels = {
  placeholder: "Select…",
  placeholderMultiple: "Add…",
  search: "Search…",
  searching: "Searching…",
  empty: "No results",
  noResultsFor: "No results for “{query}”",
  create: "Create “{query}”",
  creating: "Creating…",
  browse: "Browse all",
  recent: "Recent",
  results: "{count, plural, =0 {No results} one {# result} other {# results}}",
  loadMore: "Load more",
  unknown: "Unknown record",
  max: "{max, plural, one {You can pick # record} other {You can pick up to # records}}",
  error: "Couldn't load results",
  retry: "Try again",
  clear: "Clear selection",
  add: "Add",
  change: "Change",
  open: "Open {label}",
  remove: "Remove {label}",
  browseTitle: "Browse",
  selectCount: "{count, plural, =0 {Select} one {Select # record} other {Select # records}}",
  cancel: "Cancel",
  resolving: "Loading selection…",
  selectedCount: "{count, plural, one {# selected} other {# selected}}",
};
export type RecordPickerLabels = typeof recordPickerLabels;

/** A pinned row at the top of the list ("Assign to me", "Create from template…"). */
export interface RecordPickerAction<R> {
  id: string;
  label: React.ReactNode;
  /** Plain text for the accessible name when `label` isn't a string. */
  textValue?: string;
  icon?: React.ReactNode;
  /** Hide while searching. Default `true`. */
  hideWhileSearching?: boolean;
  onSelect: (api: { select: (r: R) => void; close: () => void; query: string }) => void;
}

/** What `renderTrigger` receives. */
export interface RecordPickerTriggerContext<R> {
  selected: R[];
  /** Selected ids whose records couldn't be found. */
  unknownIds: string[];
  open: boolean;
  disabled: boolean;
  placeholder: string;
  getLabel: (r: R) => string;
}

export interface RecordPickerRenderState {
  selected: boolean;
  disabled: boolean;
  query: string;
}

interface RecordPickerBaseProps<R> {
  source: RecordSource<R>;
  /** Custom option row. Default: avatar, label (matches in bold) and description. */
  renderItem?: (r: R, state: RecordPickerRenderState) => React.ReactNode;
  /** Records that can't be picked (archived, no permission). Already-selected ones still show. */
  getDisabled?: (r: R) => boolean;
  /** Group results under headings ("Customers", "Suppliers"). */
  getGroup?: (r: R) => string | undefined;
  /** Inline create: return the new record (it is selected). Shown as "Create “query”". */
  onCreate?: (query: string) => R | Promise<R>;
  /** `true` → the built-in browse dialog (search + list + load more). A function renders your own (a Data Table with filters). */
  browse?: boolean | ((props: { onPick: (records: R[]) => void; selectedIds: string[]; multiple: boolean; close: () => void }) => React.ReactNode);
  /** Shown above results when the query is empty. Default: the last 5 records picked from this source in the session. `false` hides. */
  recent?: R[] | false;
  /** Pinned rows on top of the list. */
  actions?: RecordPickerAction<R>[];
  /** Replace what a pick adds (a team → its members). */
  resolveSelection?: (r: R) => R | R[] | Promise<R | R[]>;
  /** Records for the initial value, so labels show without a round trip. */
  selectedRecords?: R[];
  /** Selected records as chips (default) or cards (record detail pages). */
  display?: "chip" | "card";
  /** `"inline"` renders the search list without a trigger (side panels). */
  mode?: "popover" | "inline";
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  searchPlaceholder?: string;
  /** Hidden input name(s) for native form posts (multi → repeated inputs). */
  name?: string;
  disabled?: boolean;
  /** Chips become plain links; nothing can change. */
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  /** Single: show the × clear button. Default `true` (unless `required`). */
  clearable?: boolean;
  /** Full control over the trigger (avatar stacks, a button in a table cell). Must forward ref and props. */
  renderTrigger?: (ctx: RecordPickerTriggerContext<R>) => React.ReactElement;
  /** Extra content above the search box (tabs, filters). */
  header?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: Partial<RecordPickerLabels>;
  id?: string;
  className?: string;
  /** Class of the popover panel. */
  contentClassName?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

export interface RecordPickerSingleProps<R> extends RecordPickerBaseProps<R> {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null, record: R | null) => void;
  max?: never;
}
export interface RecordPickerMultipleProps<R> extends RecordPickerBaseProps<R> {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (ids: string[], records: R[]) => void;
  /** Most records that can be picked. */
  max?: number;
}
export type RecordPickerProps<R> = RecordPickerSingleProps<R> | RecordPickerMultipleProps<R>;

type Entry<R> =
  | { kind: "action"; key: string; action: RecordPickerAction<R> }
  | { kind: "record"; key: string; record: R; group?: string; disabled: boolean }
  | { kind: "create"; key: string }
  | { kind: "more"; key: string };

const EMPTY_IDS: string[] = [];

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Highlight({ text, query, locale }: { text: string; query: string; locale: string }) {
  if (!query.trim()) return <>{text}</>;
  return (
    <>
      {highlightParts(text, query, locale).map((p, i) =>
        p.match ? (
          <mark key={i} className="bg-transparent font-semibold text-fg">
            {p.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ),
      )}
    </>
  );
}

function RecordAvatar<R>({ source, record, size }: { source: RecordSource<R>; record: R; size: "xs" | "sm" | "md" | "lg" }) {
  const a = source.getAvatar?.(record);
  if (!a) return null;
  return <Avatar name={a.name} src={a.src} shape={a.shape} size={size} aria-hidden />;
}

/** Option look: highlight follows the active descendant, not `aria-selected` (that marks the picked records). */
function optionClass(active: boolean, extra?: string, size: "sm" | "md" = "md") {
  return cn(itemVariants({ size }), "aria-selected:bg-transparent", active && "bg-hover aria-selected:bg-hover", extra);
}

/** Default option row. */
function DefaultRecordRow<R>({ source, record, query, locale }: { source: RecordSource<R>; record: R; query: string; locale: string }) {
  const desc = source.getDescription?.(record);
  return (
    <>
      <RecordAvatar source={source} record={record} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate">
          <Highlight text={source.getLabel(record)} query={query} locale={locale} />
        </span>
        {desc ? (
          <span className={cn(itemSlots.description, "truncate")}>
            <Highlight text={desc} query={query} locale={locale} />
          </span>
        ) : null}
      </span>
    </>
  );
}

/** The search box + listbox, shared by the popover and inline modes. */
function RecordPickerPanel<R>(props: {
  source: RecordSource<R>;
  multiple: boolean;
  selectedIds: string[];
  max?: number;
  onPick: (r: R) => void | Promise<void>;
  onRemoveLast?: () => void;
  onCreate?: (q: string) => R | Promise<R>;
  onBrowse?: () => void;
  renderItem?: RecordPickerBaseProps<R>["renderItem"];
  getDisabled?: (r: R) => boolean;
  getGroup?: (r: R) => string | undefined;
  recent?: R[] | false;
  actions?: RecordPickerAction<R>[];
  close: () => void;
  t: LabelFn<RecordPickerLabels>;
  searchPlaceholder?: string;
  header?: React.ReactNode;
  inline?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  /** Accessible name when inline (the field label). */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const { source, multiple, selectedIds, max, t, close } = props;
  const { locale } = useLocale();
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const search = useRecordSearch(source, query, true, locale);
  const listId = React.useId();
  const optionId = (key: string) => `${listId}-${key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const atMax = multiple && max !== undefined && selectedIds.length >= max;

  const recentRecords = React.useMemo(() => {
    if (props.recent === false || query.trim()) return [] as R[];
    if (props.recent) return props.recent;
    return (recentCache.get(source.key) ?? []).map((id) => cached(source, id)).filter((r): r is R => r !== undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.recent, query, source.key, search.items]);

  const entries = React.useMemo(() => {
    const out: Entry<R>[] = [];
    const searching = query.trim().length > 0;
    for (const a of props.actions ?? []) {
      if (searching && a.hideWhileSearching !== false) continue;
      out.push({ kind: "action", key: `action:${a.id}`, action: a });
    }
    const recentIds = new Set<string>();
    for (const r of recentRecords) {
      const id = source.getId(r);
      recentIds.add(id);
      const disabled = Boolean(props.getDisabled?.(r)) || (atMax && !selectedSet.has(id));
      out.push({ kind: "record", key: `recent:${id}`, record: r, group: t("recent"), disabled });
    }
    for (const r of search.items) {
      const id = source.getId(r);
      if (recentIds.has(id)) continue;
      const disabled = Boolean(props.getDisabled?.(r)) || (atMax && !selectedSet.has(id));
      out.push({ kind: "record", key: `r:${id}`, record: r, group: props.getGroup?.(r) ?? (recentIds.size ? "\u0000all" : undefined), disabled });
    }
    if (props.onCreate && searching && !search.loading && !atMax) {
      const exact = search.items.some((r) => source.getLabel(r).trim().toLocaleLowerCase(locale) === query.trim().toLocaleLowerCase(locale));
      if (!exact) out.push({ kind: "create", key: "create" });
    }
    if (search.nextCursor && !search.loading) out.push({ kind: "more", key: "more" });
    return out;
  }, [atMax, locale, props, query, recentRecords, search.items, search.loading, search.nextCursor, selectedSet, source, t]);

  const enabled = entries.filter((e) => !(e.kind === "record" && e.disabled));
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const active = enabled.find((e) => e.key === activeKey) ?? enabled[0] ?? null;
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!active) return;
    const els = listRef.current?.querySelectorAll<HTMLElement>("[data-key]") ?? [];
    for (const el of els) if (el.dataset.key === active.key) el.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  const activate = async (e: Entry<R> | null) => {
    if (!e) return;
    if (e.kind === "action") {
      e.action.onSelect({ select: (r) => void props.onPick(r), close, query });
    } else if (e.kind === "record") {
      if (e.disabled) return;
      await props.onPick(e.record);
    } else if (e.kind === "create" && props.onCreate) {
      setCreating(true);
      try {
        const r = await props.onCreate(query.trim());
        remember(source, [r]);
        setQuery("");
        await props.onPick(r);
      } finally {
        setCreating(false);
      }
    } else if (e.kind === "more") {
      search.loadMore();
    }
  };

  const move = (delta: number) => {
    if (!enabled.length) return;
    const i = active ? enabled.indexOf(active) : -1;
    const next = enabled[Math.max(0, Math.min(enabled.length - 1, i + delta))];
    if (next) setActiveKey(next.key);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "PageDown":
        e.preventDefault();
        move(8);
        break;
      case "PageUp":
        e.preventDefault();
        move(-8);
        break;
      case "Enter":
        e.preventDefault();
        void activate(active);
        break;
      case "Backspace":
        if (multiple && query === "" && props.onRemoveLast) {
          e.preventDefault();
          props.onRemoveLast();
        }
        break;
      default:
        break;
    }
  };

  // Group consecutive entries for rendering.
  const blocks: Array<{ group?: string; entries: Entry<R>[] }> = [];
  for (const e of entries) {
    const g = e.kind === "record" ? e.group : undefined;
    const last = blocks[blocks.length - 1];
    if (last && last.group === g) last.entries.push(e);
    else blocks.push({ group: g, entries: [e] });
  }

  const renderEntry = (e: Entry<R>) => {
    const isActive = active?.key === e.key;
    const common = {
      id: optionId(e.key),
      role: "option" as const,
      "data-key": e.key,
      "data-active": isActive || undefined,
      onMouseMove: () => setActiveKey(e.key),
      onMouseDown: (ev: React.MouseEvent) => ev.preventDefault(),
      onClick: () => void activate(e),
    };
    if (e.kind === "record") {
      const id = source.getId(e.record);
      const selected = selectedSet.has(id);
      return (
        <div
          key={e.key}
          {...common}
          aria-selected={selected}
          aria-disabled={e.disabled || undefined}
          data-state={selected ? "checked" : undefined}
          className={optionClass(isActive, "data-[state=checked]:font-normal min-h-9 gap-2.5 pe-2")}
        >
          {props.renderItem ? props.renderItem(e.record, { selected, disabled: e.disabled, query }) : <DefaultRecordRow source={source} record={e.record} query={query} locale={locale} />}
          <Check aria-hidden className={cn("ms-auto size-4 shrink-0 text-accent-ink transition-opacity", selected ? "opacity-100" : "opacity-0")} strokeWidth={2.5} />
        </div>
      );
    }
    if (e.kind === "action") {
      return (
        <div key={e.key} {...common} aria-selected={false} className={optionClass(isActive, "font-medium text-accent-ink [&_svg]:text-accent-ink")}>
          {e.action.icon ?? null}
          <span className={itemSlots.label}>{e.action.label}</span>
        </div>
      );
    }
    if (e.kind === "create") {
      return (
        <div key={e.key} {...common} aria-selected={false} className={optionClass(isActive)}>
          {creating ? <Spinner size="xs" tone="muted" /> : <Plus aria-hidden />}
          <span className={itemSlots.label}>{creating ? t("creating") : t("create", { query: query.trim() })}</span>
        </div>
      );
    }
    return (
      <div key={e.key} {...common} aria-selected={false} className={optionClass(isActive, "justify-center text-fg-muted", "sm")}>
        {search.loadingMore ? <Spinner size="xs" tone="muted" /> : null}
        {t("loadMore")}
      </div>
    );
  };

  const resultCount = search.items.length;
  const showEmpty = !search.loading && !search.error && entries.length === 0;

  return (
    <div data-slot="record-picker-panel" className="flex min-h-0 flex-col">
      {props.header}
      <div className="flex items-center gap-2 border-b border-line px-3">
        <Search aria-hidden className="size-4 shrink-0 text-fg-subtle" />
        <input
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active ? optionId(active.key) : undefined}
          aria-label={props.ariaLabel ?? props.searchPlaceholder ?? t("search")}
          aria-busy={search.loading || undefined}
          autoComplete="off"
          spellCheck={false}
          disabled={props.disabled}
          placeholder={props.searchPlaceholder ?? t("search")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveKey(null);
          }}
          onKeyDown={onKeyDown}
          {...props.inputProps}
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
        />
        {search.loading ? <Spinner size="xs" tone="muted" /> : null}
      </div>
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        aria-label={props.ariaLabel ?? t("search")}
        className={cn("overflow-y-auto overscroll-contain p-1", props.inline ? "max-h-80" : "max-h-72")}
      >
        {blocks.map((b, i) =>
          b.group && b.group !== "\u0000all" ? (
            <div key={`g${i}`} role="group" aria-labelledby={`${listId}-g${i}`}>
              <div id={`${listId}-g${i}`} role="presentation" className={itemSlots.groupLabel}>
                {b.group}
              </div>
              {b.entries.map(renderEntry)}
            </div>
          ) : b.group === "\u0000all" ? (
            <div key={`g${i}`} role="group" aria-label={t("results", { count: resultCount })} className="mt-1 border-t border-line pt-1">
              {b.entries.map(renderEntry)}
            </div>
          ) : (
            <React.Fragment key={`g${i}`}>{b.entries.map(renderEntry)}</React.Fragment>
          ),
        )}
        {search.loading && entries.length === 0 ? (
          <div className="grid gap-2 p-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton shape="circle" className="size-6" />
                <Skeleton className="h-3 flex-1" style={{ maxWidth: `${70 - i * 15}%` }} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {showEmpty ? <p className="px-3 pb-4 pt-2 text-center text-sm text-fg-muted">{query.trim() ? t("noResultsFor", { query: query.trim() }) : t("empty")}</p> : null}
      {search.error ? (
        <div className="flex items-center gap-2 px-3 pb-3 pt-1 text-sm text-fg-muted">
          <TriangleAlert aria-hidden className="size-4 text-warning" />
          <span className="flex-1">{t("error")}</span>
          <Button size="xs" variant="ghost" onClick={search.retry}>
            <RotateCw aria-hidden /> {t("retry")}
          </Button>
        </div>
      ) : null}
      {atMax ? <p className="px-3 pb-2 text-xs text-fg-muted">{t("max", { max })}</p> : null}
      <span role="status" aria-live="polite" className="sr-only">
        {search.loading ? t("searching") : t("results", { count: resultCount })}
      </span>
      {props.onBrowse ? (
        <div className="flex items-center justify-between gap-2 border-t border-line px-2 py-1.5">
          <span className="ps-1 text-xs text-fg-subtle">{multiple && selectedIds.length ? t("selectedCount", { count: selectedIds.length }) : null}</span>
          <Button size="xs" variant="ghost" onClick={props.onBrowse}>
            <LayoutList aria-hidden /> {t("browse")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Built-in browse dialog: bigger search list with checkboxes, load more and a confirm step. */
function RecordPickerBrowse<R>({
  source,
  open,
  onOpenChange,
  multiple,
  selectedIds,
  max,
  onPick,
  getDisabled,
  t,
  onCloseAutoFocus,
}: {
  source: RecordSource<R>;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  multiple: boolean;
  selectedIds: string[];
  max?: number;
  onPick: (rs: R[]) => void;
  getDisabled?: (r: R) => boolean;
  t: LabelFn<RecordPickerLabels>;
  onCloseAutoFocus?: (e: Event) => void;
}) {
  const { locale } = useLocale();
  const [query, setQuery] = React.useState("");
  const [draft, setDraft] = React.useState<string[]>(selectedIds);
  const search = useRecordSearch(source, query, open, locale);
  React.useEffect(() => {
    if (open) {
      setDraft(selectedIds);
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const atMax = max !== undefined && draft.length >= max;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader title={t("browseTitle")} />
        <DialogBody className="grid gap-3">
          <div className={cn(controlVariants({ size: "md" }))}>
            <Search aria-hidden className="text-fg-subtle" />
            <input
              data-autofocus
              aria-label={t("search")}
              placeholder={t("search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-fg-subtle"
            />
            {search.loading ? <Spinner size="xs" tone="muted" /> : null}
          </div>
          <ul className="grid max-h-[min(26rem,55vh)] overflow-y-auto overscroll-contain rounded-ui border border-line" aria-busy={search.loading || undefined}>
            {search.items.map((r) => {
              const id = source.getId(r);
              const checked = draft.includes(id);
              const disabled = Boolean(getDisabled?.(r)) || (multiple && atMax && !checked);
              const desc = source.getDescription?.(r);
              const body = (
                <>
                  <RecordAvatar source={source} record={r} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">
                      <Highlight text={source.getLabel(r)} query={query} locale={locale} />
                    </span>
                    {desc ? <span className="block truncate text-xs text-fg-subtle">{desc}</span> : null}
                  </span>
                </>
              );
              return (
                <li key={id} className="border-b border-line last:border-b-0">
                  {multiple ? (
                    <label className={cn("flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-hover", disabled && "pointer-events-none opacity-45")}>
                      <Checkbox
                        size="sm"
                        checked={checked}
                        disabled={disabled}
                        aria-label={source.getLabel(r)}
                        onCheckedChange={(c) => setDraft((d) => (c === true ? [...d, id] : d.filter((x) => x !== id)))}
                      />
                      {body}
                    </label>
                  ) : (
                    <button
                      type="button"
                      disabled={disabled}
                      aria-pressed={checked}
                      onClick={() => {
                        onPick([r]);
                        onOpenChange(false);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-start hover:bg-hover focus-ring disabled:opacity-45 aria-pressed:bg-selected"
                    >
                      {body}
                      {checked ? <Check aria-hidden className="size-4 text-accent-ink" /> : null}
                    </button>
                  )}
                </li>
              );
            })}
            {!search.loading && search.items.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-fg-muted">{query.trim() ? t("noResultsFor", { query: query.trim() }) : t("empty")}</li>
            ) : null}
            {search.nextCursor ? (
              <li className="p-1.5">
                <Button size="sm" variant="ghost" block loading={search.loadingMore} onClick={search.loadMore}>
                  {t("loadMore")}
                </Button>
              </li>
            ) : null}
          </ul>
        </DialogBody>
        {multiple ? (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
            <Button
              variant="primary"
              onClick={() => {
                onPick(draft.map((id) => cached(source, id)).filter((r): r is R => r !== undefined));
                onOpenChange(false);
              }}
            >
              {t("selectCount", { count: draft.length })}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* RecordPicker                                                        */
/* ------------------------------------------------------------------ */

const chipClass =
  "inline-flex h-6 max-w-full min-w-0 shrink-0 items-center gap-1.5 rounded-full bg-selected ps-1 pe-2 text-xs font-medium leading-none text-fg";

function RecordPickerInner<R>(props: RecordPickerProps<R>, forwardedRef: React.ForwardedRef<HTMLDivElement>) {
  const {
    source,
    renderItem,
    getDisabled,
    getGroup,
    onCreate,
    browse,
    recent,
    actions,
    resolveSelection,
    selectedRecords,
    display = "chip",
    mode = "popover",
    size = "md",
    placeholder,
    searchPlaceholder,
    renderTrigger,
    header,
    labels,
    className,
    contentClassName,
    clearable,
  } = props;
  const multiple = props.multiple === true;
  const control = useFieldControl({
    id: props.id,
    name: props.name,
    disabled: props.disabled,
    readOnly: props.readOnly,
    required: props.required,
    "aria-describedby": props["aria-describedby"],
    "aria-labelledby": props["aria-labelledby"],
    "aria-invalid": props["aria-invalid"] ?? (props.invalid ? true : undefined),
  });
  const cardTriggerId = React.useId();
  const disabled = Boolean(control.disabled);
  const readOnly = Boolean(control.readOnly);
  const t = useLabels("recordPicker", recordPickerLabels, labels);
  const container = usePortalContainer();
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // value as an array internally
  const toArray = (v: string | string[] | null | undefined): string[] | undefined => (v === undefined ? undefined : Array.isArray(v) ? v : v === null ? [] : [v]);
  const [ids, setIdsRaw] = useControllableState<string[]>({
    value: toArray(props.value as string | string[] | null | undefined),
    defaultValue: () => toArray(props.defaultValue as string | string[] | null | undefined) ?? EMPTY_IDS,
    name: "RecordPicker",
  });
  const onValueChangeRef = useLatest(props.onValueChange);
  const setIds = (next: string[]) => {
    setIdsRaw(next);
    const rs = next.map((id) => cached(source, id)).filter((r): r is R => r !== undefined);
    if (multiple) (onValueChangeRef.current as RecordPickerMultipleProps<R>["onValueChange"])?.(next, rs);
    else (onValueChangeRef.current as RecordPickerSingleProps<R>["onValueChange"])?.(next[0] ?? null, rs[0] ?? null);
  };

  const [open, setOpen] = useControllableState({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange, name: "RecordPicker" });
  const [browseOpen, setBrowseOpen] = React.useState(false);

  const resolved = useResolvedRecords(source, ids, selectedRecords);
  const selected = resolved.filter((x) => x.record).map((x) => x.record!) as R[];
  const unknownIds = resolved.filter((x) => x.missing).map((x) => x.id);
  const max = multiple ? (props as RecordPickerMultipleProps<R>).max : undefined;

  const pick = async (r: R) => {
    let picked: R[] = [r];
    if (resolveSelection) {
      const res = await resolveSelection(r);
      picked = Array.isArray(res) ? res : [res];
    }
    remember(source, picked);
    const pickedIds = picked.map((p) => source.getId(p));
    pushRecent(source, pickedIds);
    if (!multiple) {
      setIds(pickedIds.slice(0, 1));
      setOpen(false);
      return;
    }
    if (picked.length === 1 && ids.includes(pickedIds[0]!)) {
      setIds(ids.filter((x) => x !== pickedIds[0]));
      return;
    }
    let next = [...ids, ...pickedIds.filter((x) => !ids.includes(x))];
    if (max !== undefined) next = next.slice(0, max);
    setIds(next);
  };
  const remove = (id: string) => setIds(ids.filter((x) => x !== id));

  const placeholderText = placeholder ?? (multiple ? t("placeholderMultiple") : t("placeholder"));
  const showClear = !multiple && (clearable ?? !control.required) && ids.length > 0 && !disabled && !readOnly;
  const labelOf = (r: R) => source.getLabel(r);

  const hidden = props.name || control.name ? (
    ids.map((id) => <input key={id} type="hidden" name={control.name} value={id} />).concat(ids.length === 0 && !multiple ? [<input key="__empty" type="hidden" name={control.name} value="" />] : [])
  ) : null;

  const openBrowse = () => {
    setOpen(false);
    setBrowseOpen(true);
  };

  const panel = (
    <RecordPickerPanel<R>
      source={source}
      multiple={multiple}
      selectedIds={ids}
      max={max}
      onPick={pick}
      onRemoveLast={multiple && ids.length ? () => remove(ids[ids.length - 1]!) : undefined}
      onCreate={onCreate}
      onBrowse={browse ? openBrowse : undefined}
      renderItem={renderItem}
      getDisabled={getDisabled}
      getGroup={getGroup}
      recent={recent}
      actions={actions}
      close={() => setOpen(false)}
      t={t}
      searchPlaceholder={searchPlaceholder}
      header={header}
      inline={mode === "inline"}
      disabled={disabled || readOnly}
      ariaLabel={mode === "inline" ? props["aria-label"] : undefined}
      inputProps={mode === "inline" ? { id: control.id, "aria-labelledby": control["aria-labelledby"], "aria-describedby": control["aria-describedby"] } : undefined}
    />
  );

  const browseDialog =
    browse === true ? (
      <RecordPickerBrowse<R>
        source={source}
        open={browseOpen}
        onOpenChange={setBrowseOpen}
        multiple={multiple}
        selectedIds={ids}
        max={max}
        getDisabled={getDisabled}
        t={t}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          triggerRef.current?.focus();
        }}
        onPick={(rs) => {
          remember(source, rs);
          const picked = rs.map((r) => source.getId(r));
          pushRecent(source, picked);
          setIds(multiple ? picked : picked.slice(0, 1));
        }}
      />
    ) : typeof browse === "function" && browseOpen ? (
      browse({
        selectedIds: ids,
        multiple,
        close: () => setBrowseOpen(false),
        onPick: (rs) => {
          remember(source, rs);
          const picked = rs.map((r) => source.getId(r));
          setIds(multiple ? picked : picked.slice(0, 1));
          setBrowseOpen(false);
        },
      })
    ) : null;

  /* ---------- inline mode ---------- */
  if (mode === "inline") {
    return (
      <div
        ref={forwardedRef}
        data-slot="record-picker"
        data-mode="inline"
        aria-invalid={control["aria-invalid"]}
        className={cn("surface-2 overflow-hidden rounded-ui border border-line aria-invalid:border-danger", disabled && "pointer-events-none opacity-50", className)}
      >
        {panel}
        {hidden}
        {browseDialog}
      </div>
    );
  }

  /* ---------- selected rendering ---------- */
  const renderChip = (x: (typeof resolved)[number]) => {
    if (x.pending) return <Skeleton key={x.id} className="h-6 w-24 rounded-full" aria-hidden />;
    if (!x.record) {
      return (
        <span key={x.id} data-slot="record-chip" data-unknown="" title={x.id} className={cn(chipClass, "tone-warning tone-soft ps-2")}>
          <TriangleAlert aria-hidden className="size-3" />
          {t("unknown")}
          {!readOnly && !disabled ? <ChipRemoveButton onRemove={() => remove(x.id)} itemLabel={t("unknown")} /> : null}
        </span>
      );
    }
    const r = x.record;
    const label = labelOf(r);
    const href = source.href?.(r);
    const a = source.getAvatar?.(r);
    return (
      <span key={x.id} data-slot="record-chip" className={cn(chipClass, !a && "ps-2")}>
        {a ? <Avatar name={a.name} src={a.src} shape={a.shape} size="xs" aria-hidden /> : null}
        {href ? (
          <SmartLink href={href} className="min-w-0 truncate underline-offset-2 hover:underline focus-ring rounded-sm">
            {label}
          </SmartLink>
        ) : (
          <span className="min-w-0 truncate">{label}</span>
        )}
        {!readOnly && !disabled ? <ChipRemoveButton onRemove={() => remove(x.id)} itemLabel={label} labels={{ remove: t.labels.remove }} /> : null}
      </span>
    );
  };

  const renderCard = (x: (typeof resolved)[number]) => {
    if (x.pending) {
      return (
        <div key={x.id} className="flex items-center gap-3 rounded-ui border border-line bg-surface-2 p-3" aria-hidden>
          <Skeleton shape="circle" className="size-10" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      );
    }
    const r = x.record;
    const label = r ? labelOf(r) : t("unknown");
    const href = r ? source.href?.(r) : undefined;
    const desc = r ? source.getDescription?.(r) : x.id;
    return (
      <div key={x.id} data-slot="record-card" data-unknown={r ? undefined : ""} className={cn("group/card relative flex items-center gap-3 rounded-ui border border-line bg-surface-2 p-3", !r && "tone-warning tone-soft border-transparent")}>
        {r ? <RecordAvatar source={source} record={r} size="lg" /> : <TriangleAlert aria-hidden className="size-5 text-warning" />}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-fg">{label}</div>
          {desc ? <div className="truncate text-xs text-fg-muted">{desc}</div> : null}
        </div>
        {href ? (
          <IconButton asChild label={t("open", { label })} size="sm" variant="ghost" tooltip={false}>
            <SmartLink href={href}>
              <ExternalLink />
            </SmartLink>
          </IconButton>
        ) : null}
        {!readOnly && !disabled ? (
          <IconButton label={t("remove", { label })} size="sm" variant="ghost" tooltip={false} onClick={() => remove(x.id)}>
            <X />
          </IconButton>
        ) : null}
      </div>
    );
  };

  /* ---------- trigger ---------- */
  const triggerA11y = {
    id: control.id,
    "aria-label": props["aria-label"],
    "aria-labelledby": control["aria-labelledby"],
    "aria-describedby": mergeIds(control["aria-describedby"]),
    "aria-invalid": control["aria-invalid"],
    // No aria-required: the triggers are buttons, where it isn't allowed (axe aria-allowed-attr).
    // The Field marks the label as required and the hidden input carries the constraint.
    "aria-haspopup": "listbox" as const,
    disabled,
  };

  let body: React.ReactNode;
  if (readOnly) {
    body =
      display === "card" ? (
        <div ref={forwardedRef} data-slot="record-picker" data-readonly="" className={cn("grid gap-2", className)}>
          {resolved.map(renderCard)}
          {hidden}
        </div>
      ) : (
        <div
          ref={forwardedRef}
          id={control.id}
          data-slot="record-picker"
          data-readonly=""
          role="group"
          aria-labelledby={control["aria-labelledby"]}
          aria-describedby={control["aria-describedby"]}
          className={cn(controlVariants({ size, multiline: multiple || undefined }), "flex-wrap gap-1.5", className)}
        >
          {resolved.length ? resolved.map(renderChip) : <span className="text-fg-subtle">—</span>}
          {hidden}
        </div>
      );
    return body;
  }

  const content = (
    <PopoverPrimitive.Portal container={container}>
      <Layer asChild>
        <PopoverPrimitive.Content
          data-slot="record-picker-content"
          aria-label={props["aria-label"] ?? searchPlaceholder ?? t("search")}
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            "surface-popover ui-pop z-(--z-popover) w-(--radix-popover-trigger-width) min-w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-ui-lg outline-none",
            contentClassName,
          )}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement | null)?.querySelector<HTMLInputElement>("input[role=combobox]")?.focus();
          }}
        >
          <FieldContextReset>{panel}</FieldContextReset>
        </PopoverPrimitive.Content>
      </Layer>
    </PopoverPrimitive.Portal>
  );

  if (renderTrigger) {
    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild ref={triggerRef} {...triggerA11y}>
          {renderTrigger({ selected, unknownIds, open, disabled, placeholder: placeholderText, getLabel: labelOf })}
        </PopoverPrimitive.Trigger>
        {content}
        {hidden}
        {browseDialog}
      </PopoverPrimitive.Root>
    );
  }

  if (display === "card") {
    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <div ref={forwardedRef} data-slot="record-picker" data-display="card" className={cn("grid gap-2", className)}>
          {resolved.map(renderCard)}
          {(multiple && (max === undefined || ids.length < max)) || !multiple ? (
            <PopoverPrimitive.Anchor asChild>
              <div>
                <PopoverPrimitive.Trigger asChild>
                  <Button
                    ref={triggerRef}
                    size="sm"
                    variant="secondary"
                    {...triggerA11y}
                    aria-label={props["aria-label"]}
                    // The visible text ("Add", "Change") must stay part of the name next to the label.
                    id={control.id ?? cardTriggerId}
                    aria-labelledby={control["aria-labelledby"] ? `${control["aria-labelledby"]} ${control.id ?? cardTriggerId}` : undefined}
                  >
                    <Plus aria-hidden /> {!multiple && ids.length ? t("change") : placeholder ?? t("add")}
                  </Button>
                </PopoverPrimitive.Trigger>
              </div>
            </PopoverPrimitive.Anchor>
          ) : null}
          {hidden}
        </div>
        {content}
        {browseDialog}
      </PopoverPrimitive.Root>
    );
  }

  if (multiple) {
    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Anchor asChild>
          <div
            ref={forwardedRef}
            data-slot="record-picker"
            data-state={open ? "open" : "closed"}
            aria-invalid={control["aria-invalid"]}
            aria-disabled={disabled || undefined}
            className={cn(controlVariants({ size, multiline: true }), "min-h-(--control-h) flex-wrap items-center gap-1.5 py-1.5 ps-1.5", className)}
            onClick={(e) => {
              if (e.target === e.currentTarget && !disabled) triggerRef.current?.click();
            }}
          >
            {resolved.map(renderChip)}
            <PopoverPrimitive.Trigger asChild>
              <button
                ref={triggerRef}
                type="button"
                {...triggerA11y}
                className="inline-flex h-6 min-w-0 flex-1 items-center gap-1 rounded-ui-sm px-1.5 text-start text-fg-subtle outline-none hover:text-fg focus-visible:text-fg disabled:cursor-not-allowed [&_svg]:size-3.5"
              >
                <Plus aria-hidden />
                <span className="truncate">{placeholderText}</span>
              </button>
            </PopoverPrimitive.Trigger>
            {hidden}
          </div>
        </PopoverPrimitive.Anchor>
        {content}
        {browseDialog}
      </PopoverPrimitive.Root>
    );
  }

  const current = resolved[0];
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div
          ref={forwardedRef}
          data-slot="record-picker"
          data-state={open ? "open" : "closed"}
          aria-invalid={control["aria-invalid"]}
          aria-disabled={disabled || undefined}
          className={cn(controlVariants({ size }), "p-0", className)}
        >
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={triggerRef}
              type="button"
              {...triggerA11y}
              className={cn("flex h-full min-w-0 flex-1 items-center gap-2 rounded-[inherit] ps-3 text-start outline-none disabled:cursor-not-allowed", showClear ? "pe-1" : "pe-3")}
            >
              {current?.pending ? (
                <>
                  <span className="sr-only">{t("resolving")}</span>
                  <Skeleton aria-hidden className="h-3 w-32" />
                </>
              ) : current?.record ? (
                <>
                  <RecordAvatar source={source} record={current.record} size={size === "lg" ? "sm" : "xs"} />
                  <span className="min-w-0 flex-1 truncate">{labelOf(current.record)}</span>
                </>
              ) : current?.missing ? (
                <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-warning">
                  <TriangleAlert aria-hidden className="size-3.5" /> {t("unknown")}
                </span>
              ) : (
                <span className="min-w-0 flex-1 truncate text-fg-subtle">{placeholderText}</span>
              )}
              {!showClear ? <ChevronsUpDown aria-hidden className="ms-auto size-4 shrink-0 text-fg-subtle" /> : null}
            </button>
          </PopoverPrimitive.Trigger>
          {showClear ? (
            <button
              type="button"
              aria-label={t("clear")}
              onClick={() => {
                setIds([]);
                triggerRef.current?.focus();
              }}
              className="me-1.5 inline-flex size-6 shrink-0 items-center justify-center rounded-ui-sm text-fg-subtle hover:bg-hover hover:text-fg focus-ring [&_svg]:size-3.5"
            >
              <X aria-hidden />
            </button>
          ) : null}
          {hidden}
        </div>
      </PopoverPrimitive.Anchor>
      {content}
      {browseDialog}
    </PopoverPrimitive.Root>
  );
}

/**
 * Link one or many related records from any collection: a contact to a company, a post to its
 * author, an order to a customer, a task to a project. Async search with debounce, abort and
 * paging; recent picks; inline create; a browse dialog for big sets; chips or cards; ids → labels
 * resolution with a skeleton and an "Unknown record" state for deleted records.
 *
 * ```tsx
 * const companies: RecordSource<Company> = {
 *   key: "companies",
 *   search: (q, { signal, cursor }) => api.companies.search({ q, cursor }, { signal }),
 *   getByIds: (ids, signal) => api.companies.byIds(ids, { signal }),
 *   getId: (c) => c.id, getLabel: (c) => c.name, getDescription: (c) => c.domain,
 * };
 * <Field label="Company"><RecordPicker source={companies} value={companyId} onValueChange={setCompanyId} /></Field>
 * ```
 */
export const RecordPicker = React.forwardRef(RecordPickerInner) as <R>(props: RecordPickerProps<R> & { ref?: React.Ref<HTMLDivElement> }) => React.ReactElement;
