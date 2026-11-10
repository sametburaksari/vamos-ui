import type { RegistryItem } from "./types";

export interface Resolution {
  /** Items in install order: every item comes after all of its registryDependencies. */
  items: RegistryItem[];
  /** Names the user asked for (deduped, in order). */
  requested: string[];
  /** Dependency cycles that were broken, as name chains. */
  cycles: string[][];
}

/**
 * Fetches `names` and their registryDependencies transitively and orders them
 * dependencies-first (depth-first post-order, stable with respect to the order
 * dependencies are listed). Cycles are broken and reported instead of failing.
 */
export async function resolveItems(names: string[], fetchItem: (name: string) => Promise<RegistryItem>): Promise<Resolution> {
  const requested = [...new Set(names)];
  const loaded = new Map<string, Promise<RegistryItem>>();
  const load = (name: string) => {
    let p = loaded.get(name);
    if (!p) {
      p = fetchItem(name);
      loaded.set(name, p);
    }
    return p;
  };

  // Prefetch breadth-first so remote registries are fetched in parallel.
  let frontier = requested;
  const seen = new Set<string>();
  while (frontier.length) {
    frontier.forEach((n) => seen.add(n));
    const items = await Promise.all(frontier.map(load));
    frontier = [...new Set(items.flatMap((i) => i.registryDependencies ?? []))].filter((n) => !seen.has(n));
  }

  const order: RegistryItem[] = [];
  const state = new Map<string, "visiting" | "done">();
  const cycles: string[][] = [];
  const visit = async (name: string, trail: string[]) => {
    const s = state.get(name);
    if (s === "done") return;
    if (s === "visiting") {
      cycles.push([...trail.slice(trail.indexOf(name)), name]);
      return;
    }
    state.set(name, "visiting");
    const item = await load(name);
    for (const dep of item.registryDependencies ?? []) await visit(dep, [...trail, name]);
    state.set(name, "done");
    order.push(item);
  };
  for (const name of requested) await visit(name, []);
  return { items: order, requested, cycles };
}

/** Merges npm dependency specs ("radix-ui@^1.4.3"); a later spec for the same package wins only if the earlier had no range. */
export function collectDependencies(items: Pick<RegistryItem, "dependencies">[]): string[] {
  const byName = new Map<string, string>();
  for (const item of items) {
    for (const spec of item.dependencies ?? []) {
      const { name, range } = parseSpec(spec);
      const prev = byName.get(name);
      if (!prev || (!parseSpec(prev).range && range)) byName.set(name, spec);
    }
  }
  return [...byName.values()].sort((a, b) => parseSpec(a).name.localeCompare(parseSpec(b).name));
}

export function parseSpec(spec: string): { name: string; range: string } {
  const at = spec.lastIndexOf("@");
  if (at > 0) return { name: spec.slice(0, at), range: spec.slice(at + 1) };
  return { name: spec, range: "" };
}
