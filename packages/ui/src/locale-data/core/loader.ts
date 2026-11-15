/**
 * The loading pattern every large locale dataset follows (Turkish neighbourhoods, world
 * subdivisions, cities): data split into one JSON file per key (province, country), each loaded on
 * first use, from wherever the app chooses:
 *
 * - files shipped in the package, one lazy chunk per key (an `import()` map);
 * - the same files served over HTTP (`fetchJsonLoader("/data/cities/{cc}.json")`);
 * - anything else (a database, an internal API) behind a plain async function.
 *
 * `createCachedLoader` wraps any of them: one load per key, shared by concurrent callers; a failed
 * load is not cached, so the next call retries.
 */

/** `load(key)` cached per key. Failures are evicted so a later call tries again. */
export function createCachedLoader<K, V>(load: (key: K) => Promise<V>): (key: K) => Promise<V> {
  const cache = new Map<K, Promise<V>>();
  return (key) => {
    let p = cache.get(key);
    if (!p) {
      p = load(key);
      cache.set(key, p);
      p.catch(() => cache.delete(key));
    }
    return p;
  };
}

/** Replaces every `{name}` in `template` with `vars[name]`; unknown names stay as written. */
export function fillUrlTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? encodeURIComponent(String(vars[k])) : m));
}

export interface FetchJsonOptions {
  /** Defaults to the global `fetch`. */
  fetch?: (url: string, init?: RequestInit) => Promise<Response>;
  init?: RequestInit;
}

/**
 * A loader that fetches one JSON document per key. `url` is a template filled from `vars(key)`
 * or a function of the key. Not cached by itself; wrap it in `createCachedLoader`.
 */
export function fetchJsonLoader<K, V>(
  url: string | ((key: K) => string),
  vars: (key: K) => Record<string, string | number>,
  opts: FetchJsonOptions & { name?: string } = {},
): (key: K) => Promise<V> {
  const name = opts.name ?? "fetchJsonLoader";
  return async (key) => {
    const f = opts.fetch ?? globalThis.fetch;
    if (!f) throw new Error(`${name}: no fetch available`);
    const href = typeof url === "function" ? url(key) : fillUrlTemplate(url, vars(key));
    const res = await f(href, opts.init);
    if (!res.ok) throw new Error(`${name}: ${res.status} for ${String(key)}`);
    return (await res.json()) as V;
  };
}
