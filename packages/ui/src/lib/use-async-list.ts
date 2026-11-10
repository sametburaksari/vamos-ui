"use client";

import * as React from "react";
import { useLatest } from "./use-controllable-state";

/** One page of results with an optional cursor for the next page (`null`/absent = last page). */
export interface AsyncPage<T> {
  items: T[];
  cursor?: string | null;
}

/**
 * Loads items for a query. Return an array (single page) or `{ items, cursor }` for paging.
 * Always pass `signal` to `fetch` so superseded requests are cancelled.
 */
export type AsyncLoader<T> = (query: string, signal: AbortSignal, cursor?: string) => Promise<T[] | AsyncPage<T>>;

export interface UseAsyncListOptions<T> {
  /** The loader. When absent the hook is idle and returns no items. */
  load?: AsyncLoader<T>;
  /** Current query; every change (debounced) starts a new first-page request. */
  query: string;
  /** ms to wait after the last query change. Default 200. The first request is not delayed. */
  debounce?: number;
  /** Set `false` to pause (e.g. while a popover is closed). Default `true`. */
  enabled?: boolean;
  /** Cache results per query for the lifetime of the component. Default `true`. */
  cache?: boolean;
  /** Don't load below this many characters (returns an empty, idle list). Default 0. */
  minQueryLength?: number;
}

export interface AsyncListState<T> {
  items: T[];
  /** First page in flight (including the debounce wait). */
  loading: boolean;
  /** A next page is in flight. */
  loadingMore: boolean;
  /** The last error (cleared on the next successful request). */
  error: unknown;
  /** A cursor for another page exists. */
  hasMore: boolean;
  /** The query the current `items` belong to. */
  loadedQuery: string | null;
  /** Fetch the next page (no-op without a cursor or while loading). */
  loadMore: () => void;
  /** Drop the cache for the current query and load it again. */
  reload: () => void;
}

interface CacheEntry<T> {
  items: T[];
  cursor: string | null;
}

const normalize = <T,>(r: T[] | AsyncPage<T>): CacheEntry<T> => (Array.isArray(r) ? { items: r, cursor: null } : { items: r.items, cursor: r.cursor ?? null });
const isAbort = (e: unknown) => (e instanceof DOMException || e instanceof Error) && e.name === "AbortError";

/**
 * Debounced, abortable, paged loading for search lists: Combobox, Tag input suggestions,
 * record and user pickers.
 *
 * ```tsx
 * const list = useAsyncList({
 *   query,
 *   load: async (q, signal, cursor) => {
 *     const res = await fetch(`/api/contacts?q=${encodeURIComponent(q)}&after=${cursor ?? ""}`, { signal });
 *     return res.json(); // { items, cursor }
 *   },
 * });
 * list.items; list.loading; list.loadMore();
 * ```
 *
 * - Typing fast only sends the last query; a new query aborts the request in flight.
 * - Results are cached per query, so deleting a character shows the earlier list instantly.
 */
export function useAsyncList<T>({ load, query, debounce = 200, enabled = true, cache = true, minQueryLength = 0 }: UseAsyncListOptions<T>): AsyncListState<T> {
  const loadRef = useLatest(load);
  const cacheRef = React.useRef(new Map<string, CacheEntry<T>>());
  const firstRef = React.useRef(true);
  const moreRef = React.useRef<AbortController | null>(null);
  const [reloadToken, setReloadToken] = React.useState(0);
  const [state, setState] = React.useState<{
    items: T[];
    cursor: string | null;
    loading: boolean;
    loadingMore: boolean;
    error: unknown;
    loadedQuery: string | null;
  }>({ items: [], cursor: null, loading: Boolean(load && enabled), loadingMore: false, error: null, loadedQuery: null });

  const hasLoader = Boolean(load);
  const active = hasLoader && enabled && query.length >= minQueryLength;

  React.useEffect(() => {
    if (!active) {
      setState((s) => (s.loading || s.loadingMore ? { ...s, loading: false, loadingMore: false } : s));
      return;
    }
    const cached = cache ? cacheRef.current.get(query) : undefined;
    if (cached) {
      setState({ items: cached.items, cursor: cached.cursor, loading: false, loadingMore: false, error: null, loadedQuery: query });
      return;
    }
    moreRef.current?.abort();
    setState((s) => ({ ...s, loading: true, loadingMore: false }));
    const controller = new AbortController();
    const delay = firstRef.current ? 0 : debounce;
    firstRef.current = false;
    const timer = setTimeout(() => {
      const fn = loadRef.current;
      if (!fn) return;
      fn(query, controller.signal)
        .then((res) => {
          if (controller.signal.aborted) return;
          const entry = normalize(res);
          if (cache) cacheRef.current.set(query, entry);
          setState({ items: entry.items, cursor: entry.cursor, loading: false, loadingMore: false, error: null, loadedQuery: query });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted || isAbort(error)) return;
          setState((s) => ({ ...s, loading: false, error }));
        });
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [active, query, debounce, cache, reloadToken, loadRef]);

  const stateRef = useLatest(state);
  const loadMore = React.useCallback(() => {
    const s = stateRef.current;
    const fn = loadRef.current;
    if (!fn || !s.cursor || s.loading || s.loadingMore || s.loadedQuery === null) return;
    const q = s.loadedQuery;
    const cursor = s.cursor;
    const controller = new AbortController();
    moreRef.current = controller;
    setState((prev) => ({ ...prev, loadingMore: true }));
    fn(q, controller.signal, cursor)
      .then((res) => {
        if (controller.signal.aborted) return;
        const page = normalize(res);
        setState((prev) => {
          if (prev.loadedQuery !== q) return prev;
          const next = { items: [...prev.items, ...page.items], cursor: page.cursor };
          if (cache) cacheRef.current.set(q, next);
          return { ...prev, ...next, loadingMore: false, error: null };
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbort(error)) return;
        setState((prev) => ({ ...prev, loadingMore: false, error }));
      });
  }, [cache, loadRef, stateRef]);

  const reload = React.useCallback(() => {
    cacheRef.current.delete(query);
    firstRef.current = true;
    setReloadToken((n) => n + 1);
  }, [query]);

  React.useEffect(() => () => moreRef.current?.abort(), []);

  return {
    items: active ? state.items : [],
    loading: active && state.loading,
    loadingMore: active && state.loadingMore,
    error: active ? state.error : null,
    hasMore: active && state.cursor !== null,
    loadedQuery: active ? state.loadedQuery : null,
    loadMore,
    reload,
  };
}
