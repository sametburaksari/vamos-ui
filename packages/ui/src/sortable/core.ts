/**
 * React-free reorder math: array moves, multi-container moves, tree flattening and the
 * drag-depth projection used by tree reordering. No drag-engine types leak from here.
 */

/** Returns a copy of `items` with the element at `from` moved to `to`. */
export function arrayMove<T>(items: readonly T[], from: number, to: number): T[] {
  const out = items.slice();
  if (from < 0 || from >= out.length) return out;
  const clamped = Math.max(0, Math.min(out.length - 1, to));
  const [item] = out.splice(from, 1);
  out.splice(clamped, 0, item as T);
  return out;
}

export type MoveOp = "up" | "down" | "top" | "bottom";

/** Target index for a Move-menu operation, or `null` when the item can't move that way. */
export function moveTargetIndex(index: number, length: number, op: MoveOp): number | null {
  const to = op === "up" ? index - 1 : op === "down" ? index + 1 : op === "top" ? 0 : length - 1;
  return to < 0 || to >= length || to === index ? null : to;
}

export interface ContainerState {
  id: string;
  items: string[];
}

/** Moves `id` into container `to` at `index` (clamped). Returns new container arrays. */
export function moveBetweenContainers(containers: readonly ContainerState[], id: string, to: string, index: number): ContainerState[] {
  const without = containers.map((c) => ({ ...c, items: c.items.filter((x) => x !== id) }));
  return without.map((c) => {
    if (c.id !== to) return c;
    const items = c.items.slice();
    items.splice(Math.max(0, Math.min(items.length, index)), 0, id);
    return { ...c, items };
  });
}

/** The container holding `id`. */
export function findContainer(containers: readonly ContainerState[], id: string): ContainerState | undefined {
  return containers.find((c) => c.id === id) ?? containers.find((c) => c.items.includes(id));
}

// ---------------------------------------------------------------------------------------------
// Trees
// ---------------------------------------------------------------------------------------------

export interface SortableTreeNode {
  id: string;
  children?: SortableTreeNode[];
  collapsed?: boolean;
}

export interface FlatTreeItem<N extends SortableTreeNode = SortableTreeNode> {
  id: string;
  parentId: string | null;
  depth: number;
  /** Index among siblings. */
  index: number;
  node: N;
}

/** Depth-first flattening. Children of collapsed nodes (or of `skip` ids) are left out. */
export function flattenTree<N extends SortableTreeNode>(nodes: readonly N[], skip?: ReadonlySet<string>): FlatTreeItem<N>[] {
  const out: FlatTreeItem<N>[] = [];
  const walk = (list: readonly N[], parentId: string | null, depth: number) => {
    list.forEach((node, index) => {
      out.push({ id: node.id, parentId, depth, index, node });
      if (node.children?.length && !node.collapsed && !skip?.has(node.id)) walk(node.children as N[], node.id, depth + 1);
    });
  };
  walk(nodes, null, 0);
  return out;
}

/** All descendant ids of `id`. */
export function descendantIds(nodes: readonly SortableTreeNode[], id: string): Set<string> {
  const out = new Set<string>();
  const visit = (list: readonly SortableTreeNode[], inside: boolean) => {
    for (const n of list) {
      if (inside) out.add(n.id);
      if (n.children) visit(n.children, inside || n.id === id);
    }
  };
  visit(nodes, false);
  return out;
}

export interface TreeProjection {
  parentId: string | null;
  depth: number;
  /** Index among the new siblings. */
  index: number;
  /** Why the drop is invalid ("maxDepth"), when it is. */
  invalid?: "maxDepth";
}

/**
 * Where a dragged tree item would land: the vertical position comes from `overId`, the depth
 * from the horizontal drag offset (`offsetX / indent`, sign flipped in RTL), clamped between
 * the depth allowed by the item above and the item below.
 */
export function projectTreeMove(
  flat: readonly FlatTreeItem[],
  activeId: string,
  overId: string,
  offsetX: number,
  indent: number,
  opts: { maxDepth?: number; dir?: "ltr" | "rtl" } = {},
): TreeProjection | null {
  const activeIndex = flat.findIndex((f) => f.id === activeId);
  const overIndex = flat.findIndex((f) => f.id === overId);
  if (activeIndex === -1 || overIndex === -1) return null;
  const active = flat[activeIndex]!;
  // Drop the active item's descendants: they move with it.
  const hidden = new Set<string>();
  for (let i = activeIndex + 1; i < flat.length && flat[i]!.depth > active.depth; i++) hidden.add(flat[i]!.id);
  const visible = flat.filter((f) => !hidden.has(f.id));
  const from = visible.findIndex((f) => f.id === activeId);
  const to = Math.max(0, visible.findIndex((f) => f.id === overId));
  const reordered = arrayMove(visible, from, to);
  const at = reordered.findIndex((f) => f.id === activeId);
  const prev = reordered[at - 1];
  const next = reordered[at + 1];
  const dragDepth = Math.round(((opts.dir === "rtl" ? -1 : 1) * offsetX) / Math.max(1, indent));
  const projected = active.depth + dragDepth;
  const maxAllowed = prev ? prev.depth + 1 : 0;
  const minAllowed = next ? next.depth : 0;
  let depth = Math.max(minAllowed, Math.min(maxAllowed, projected));
  // Subtree height of the active item counts against maxDepth.
  let subtree = 0;
  for (let i = activeIndex + 1; i < flat.length && flat[i]!.depth > active.depth; i++) subtree = Math.max(subtree, flat[i]!.depth - active.depth);
  let invalid: TreeProjection["invalid"];
  if (opts.maxDepth !== undefined && depth + subtree > opts.maxDepth - 1) {
    const capped = opts.maxDepth - 1 - subtree;
    if (capped < minAllowed) invalid = "maxDepth";
    depth = Math.max(minAllowed, Math.min(depth, capped));
  }
  // Parent: the nearest item above with depth − 1.
  let parentId: string | null = null;
  if (depth > 0) {
    for (let i = at - 1; i >= 0; i--) {
      if (reordered[i]!.depth === depth - 1) {
        parentId = reordered[i]!.id;
        break;
      }
    }
  }
  // Index among the new siblings.
  let index = 0;
  for (let i = 0; i < at; i++) {
    const f = reordered[i]!;
    if (f.parentId === parentId && f.depth === depth && f.id !== activeId) index++;
  }
  return { parentId, depth, index, ...(invalid ? { invalid } : {}) };
}

/** Moves a node to `parentId` at `index` (immutable). */
export function moveTreeNode<N extends SortableTreeNode>(nodes: readonly N[], id: string, parentId: string | null, index: number): N[] {
  let moving: N | undefined;
  const remove = (list: readonly N[]): N[] =>
    list.flatMap((n) => {
      if (n.id === id) {
        moving = n;
        return [];
      }
      return n.children ? [{ ...n, children: remove(n.children as N[]) }] : [n];
    });
  const without = remove(nodes);
  if (!moving) return nodes.slice();
  const node = moving;
  const insert = (list: N[], pid: string | null): N[] => {
    if (pid === parentId) {
      const out = list.slice();
      out.splice(Math.max(0, Math.min(out.length, index)), 0, node);
      return out;
    }
    return list.map((n) => (n.children || n.id === parentId ? { ...n, children: insert((n.children ?? []) as N[], n.id) } : n));
  };
  return insert(without, null);
}

// ---------------------------------------------------------------------------------------------
// Virtualization helper
// ---------------------------------------------------------------------------------------------

/**
 * A `rangeExtractor` for `@tanstack/react-virtual` that keeps the dragged row mounted (dnd-kit
 * needs the active node while it is scrolled out of view).
 *
 * ```ts
 * useVirtualizer({ …, rangeExtractor: keepMountedRange(activeIndex) });
 * ```
 */
export function keepMountedRange(keepIndex: number | null | undefined) {
  return (range: { startIndex: number; endIndex: number; overscan: number; count: number }): number[] => {
    const start = Math.max(range.startIndex - range.overscan, 0);
    const end = Math.min(range.endIndex + range.overscan, range.count - 1);
    const out: number[] = [];
    for (let i = start; i <= end; i++) out.push(i);
    if (keepIndex != null && keepIndex >= 0 && keepIndex < range.count && (keepIndex < start || keepIndex > end)) {
      out.push(keepIndex);
      out.sort((a, b) => a - b);
    }
    return out;
  };
}
