"use client";

import * as React from "react";
import { foldText, matchText } from "./text";
import { useControllableState, useLatest } from "./use-controllable-state";

/**
 * One node of a hierarchy: a category, a department, a folder, a page. Shared by Tree view,
 * Tree select and (later) Sortable tree.
 */
export interface TreeNode {
  id: string;
  label: string;
  /** Known children. Leave out and set `hasChildren` to load them lazily. */
  children?: TreeNode[];
  /** Children exist but are loaded on first expand (`loadChildren`). */
  hasChildren?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  /** Trailing count or badge (Tree view). */
  badge?: React.ReactNode;
  /** Secondary text, searchable too ("12 products", a code). */
  description?: string;
  /** Extra search terms (SKU, slug, cost centre code). */
  keywords?: string[];
}

/** What a fully-checked branch yields as the checked value. */
export type TreeCheckValueMode = "all" | "parent" | "leaf";
export type TreeCheckedState = boolean | "mixed";

/** One visible row of the flattened tree. */
export interface TreeItemState {
  node: TreeNode;
  id: string;
  /** 1-based depth (`aria-level`). */
  level: number;
  parentId: string | null;
  /** 1-based position among its siblings (`aria-posinset`). */
  posinset: number;
  /** Number of siblings (`aria-setsize`). */
  setsize: number;
  /** Has (or may lazily have) children. */
  hasChildren: boolean;
  expanded: boolean;
  loading: boolean;
  /** Load error message (lazy children). */
  error: string | null;
  checked: TreeCheckedState;
  selected: boolean;
  disabled: boolean;
  /** Label matches the current filter (rows kept only as ancestors are `false`). */
  match: boolean;
  /** Is the last of its siblings (indent guides stop here). */
  last: boolean;
  /** For each ancestor level (1…level-1): does that ancestor have a following sibling? Draws guides. */
  guides: boolean[];
}

export interface UseTreeOptions {
  nodes: TreeNode[];
  /** Expanded ids (controlled). */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** Loads the children of a node with `hasChildren` on first expand. Abortable. */
  loadChildren?: (node: TreeNode, signal: AbortSignal) => Promise<TreeNode[]>;
  /** Keeps matches and their ancestors, auto-expanding the ancestors. Locale-folded (İ/ı, accents). */
  filter?: string;
  locale?: string;
  /** `"single"` / `"multiple"` selection (`aria-selected`). Default `"none"`. */
  selectionMode?: "none" | "single" | "multiple";
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Can this node be selected? (e.g. leaves only). Default: any enabled node. */
  isSelectable?: (node: TreeNode, hasChildren: boolean) => boolean;
  /** Turns on checkboxes (`aria-checked`). */
  checkable?: boolean;
  checked?: string[];
  defaultChecked?: string[];
  onCheckedChange?: (ids: string[]) => void;
  /** Checking a parent checks its descendants; a parent is checked when all children are (tri-state). Default `true`. */
  cascade?: boolean;
  /** With `cascade`: which ids the checked value lists. Default `"all"`. */
  checkValueMode?: TreeCheckValueMode;
  /** Enter / double click on a row. */
  onAction?: (node: TreeNode) => void;
  /** Swaps ←/→. */
  dir?: "ltr" | "rtl";
  /** Called before focusing a row that may not be rendered yet (virtual lists scroll it into view). */
  scrollToIndex?: (index: number) => void;
}

export interface UseTreeReturn {
  /** Visible rows in order — render them flat, inside one `role="tree"` element. */
  items: TreeItemState[];
  /** Every known node by id (including loaded children). */
  getNode: (id: string) => TreeNode | undefined;
  getParentId: (id: string) => string | null;
  /** Ancestors + the node, root first. */
  getPath: (id: string) => TreeNode[];
  getChildren: (node: TreeNode) => TreeNode[] | undefined;
  isExpanded: (id: string) => boolean;
  toggleExpanded: (id: string, open?: boolean) => void;
  expandAll: () => void;
  collapseAll: () => void;
  expandedIds: string[];
  selectedIds: string[];
  select: (id: string) => void;
  checkedIds: string[];
  getChecked: (id: string) => TreeCheckedState;
  toggleChecked: (id: string, next?: boolean) => void;
  /** Retry a failed lazy load. */
  reload: (id: string) => void;
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  /** Focus a row (scrolling it into view first in virtual lists). */
  focusItem: (id: string) => void;
  /** Spread on the `role="tree"` element (ref, role, keyboard). */
  getTreeProps: () => {
    ref: React.RefCallback<HTMLElement>;
    role: "tree";
    "aria-multiselectable"?: boolean;
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  };
  /** Spread on each row. */
  getItemProps: (item: TreeItemState) => {
    role: "treeitem";
    id?: string;
    tabIndex: number;
    "aria-level": number;
    "aria-posinset": number;
    "aria-setsize": number;
    "aria-expanded"?: boolean;
    "aria-selected"?: boolean;
    "aria-checked"?: boolean | "mixed";
    "aria-disabled"?: boolean;
    "aria-busy"?: boolean;
    "data-tree-id": string;
    "data-state"?: "open" | "closed";
    onFocus: (e: React.FocusEvent<HTMLElement>) => void;
  };
  /** Number of filter matches (for "N results" announcements). */
  matchCount: number;
  /** Is a filter active? */
  filtering: boolean;
}

interface TreeIndex {
  byId: Map<string, TreeNode>;
  parent: Map<string, string | null>;
  /** All known ids in depth-first order. */
  order: string[];
}

const EMPTY: string[] = [];

/**
 * The shared tree model behind Tree view and Tree select: flattened visible rows, expand state,
 * single/multiple selection, tri-state checks with cascade, lazy children (with abort and retry),
 * locale-folded filtering that keeps ancestors, and the full WAI-ARIA treeview keyboard
 * (↑ ↓ → ← Home End `*`, type-ahead, Space, Enter) with a roving tabindex.
 *
 * ```tsx
 * const tree = useTree({ nodes, defaultExpanded: ["clothing"], checkable: true });
 * <div {...tree.getTreeProps()} aria-label="Categories">
 *   {tree.items.map((item) => <div key={item.id} {...tree.getItemProps(item)}>{item.node.label}</div>)}
 * </div>
 * ```
 */
export function useTree(options: UseTreeOptions): UseTreeReturn {
  const {
    nodes,
    loadChildren,
    filter,
    locale,
    selectionMode = "none",
    isSelectable,
    checkable = false,
    cascade = true,
    checkValueMode = "all",
    dir = "ltr",
  } = options;

  const [expandedIds, setExpandedIds] = useControllableState<string[]>({
    value: options.expanded,
    defaultValue: options.defaultExpanded ?? EMPTY,
    onChange: options.onExpandedChange,
    name: "Tree",
  });
  const [selectedIds, setSelectedIds] = useControllableState<string[]>({
    value: options.selected,
    defaultValue: options.defaultSelected ?? EMPTY,
    onChange: options.onSelectedChange,
    name: "Tree",
  });
  const [checkedValue, setCheckedValue] = useControllableState<string[]>({
    value: options.checked,
    defaultValue: options.defaultChecked ?? EMPTY,
    onChange: options.onCheckedChange,
    name: "Tree",
  });

  /* ---------------- lazy children ---------------- */
  const [loaded, setLoaded] = React.useState<Map<string, TreeNode[]>>(() => new Map());
  const [loading, setLoading] = React.useState<Set<string>>(() => new Set());
  const [errors, setErrors] = React.useState<Map<string, string>>(() => new Map());
  const controllers = React.useRef(new Map<string, AbortController>());
  const loadRef = useLatest(loadChildren);

  React.useEffect(() => {
    const map = controllers.current;
    return () => {
      map.forEach((c) => c.abort());
      map.clear();
    };
  }, []);

  const getChildren = React.useCallback((node: TreeNode) => node.children ?? loaded.get(node.id), [loaded]);

  /* ---------------- index ---------------- */
  const index = React.useMemo<TreeIndex>(() => {
    const byId = new Map<string, TreeNode>();
    const parent = new Map<string, string | null>();
    const order: string[] = [];
    const walk = (list: TreeNode[], parentId: string | null) => {
      for (const n of list) {
        byId.set(n.id, n);
        parent.set(n.id, parentId);
        order.push(n.id);
        const kids = n.children ?? loaded.get(n.id);
        if (kids) walk(kids, n.id);
      }
    };
    walk(nodes, null);
    return { byId, parent, order };
  }, [nodes, loaded]);

  const indexRef = useLatest(index);

  const startLoad = React.useCallback(
    (node: TreeNode) => {
      const fn = loadRef.current;
      if (!fn || controllers.current.has(node.id)) return;
      const ctrl = new AbortController();
      controllers.current.set(node.id, ctrl);
      setLoading((s) => new Set(s).add(node.id));
      setErrors((m) => {
        if (!m.has(node.id)) return m;
        const next = new Map(m);
        next.delete(node.id);
        return next;
      });
      fn(node, ctrl.signal)
        .then((kids) => {
          if (ctrl.signal.aborted) return;
          setLoaded((m) => new Map(m).set(node.id, kids));
        })
        .catch((err: unknown) => {
          if (ctrl.signal.aborted) return;
          setErrors((m) => new Map(m).set(node.id, err instanceof Error ? err.message : String(err)));
        })
        .finally(() => {
          if (controllers.current.get(node.id) === ctrl) controllers.current.delete(node.id);
          if (ctrl.signal.aborted) return;
          setLoading((s) => {
            const next = new Set(s);
            next.delete(node.id);
            return next;
          });
        });
    },
    [loadRef],
  );

  const needsLoad = React.useCallback(
    (node: TreeNode) => Boolean(node.hasChildren && !node.children && !loaded.has(node.id) && loadRef.current),
    [loaded, loadRef],
  );

  const nodeHasChildren = React.useCallback(
    (node: TreeNode) => {
      const kids = node.children ?? loaded.get(node.id);
      if (kids) return kids.length > 0;
      return Boolean(node.hasChildren);
    },
    [loaded],
  );

  /* ---------------- filter ---------------- */
  const query = (filter ?? "").trim();
  const filtering = query.length > 0;
  const { keep, forced, matches } = React.useMemo(() => {
    const keep = new Set<string>();
    const forced = new Set<string>();
    const matches = new Set<string>();
    if (!filtering) return { keep, forced, matches };
    for (const id of index.order) {
      const n = index.byId.get(id)!;
      const text = [n.label, n.description ?? "", ...(n.keywords ?? [])].join(" ");
      if (!matchText(text, query, locale)) continue;
      matches.add(id);
      keep.add(id);
      let p = index.parent.get(id) ?? null;
      while (p) {
        keep.add(p);
        forced.add(p);
        p = index.parent.get(p) ?? null;
      }
    }
    return { keep, forced, matches };
  }, [filtering, index, query, locale]);

  const expandedSet = React.useMemo(() => new Set(expandedIds), [expandedIds]);
  const isExpanded = React.useCallback((id: string) => expandedSet.has(id) || forced.has(id), [expandedSet, forced]);

  /* ---------------- checks ---------------- */
  const childIds = React.useCallback(
    (id: string): string[] => {
      const n = index.byId.get(id);
      const kids = n ? (n.children ?? loaded.get(id)) : undefined;
      return kids ? kids.map((k) => k.id) : EMPTY;
    },
    [index, loaded],
  );

  /** Expand an external value into the full set of checked ids, then settle parents. */
  const normalize = React.useCallback(
    (ids: Iterable<string>): Set<string> => {
      const set = new Set(ids);
      if (!cascade) return set;
      // down: a checked node checks every known descendant
      const stack = [...set];
      while (stack.length) {
        const id = stack.pop()!;
        for (const c of childIds(id)) {
          if (!set.has(c)) {
            set.add(c);
            stack.push(c);
          }
        }
      }
      // up (post-order): a parent with known children is checked iff all its children are
      for (let i = index.order.length - 1; i >= 0; i--) {
        const id = index.order[i]!;
        const kids = childIds(id);
        if (kids.length === 0) continue;
        if (kids.every((k) => set.has(k))) set.add(id);
        else set.delete(id);
      }
      return set;
    },
    [cascade, childIds, index],
  );

  const fullChecked = React.useMemo(() => (checkable ? normalize(checkedValue) : new Set<string>()), [checkable, checkedValue, normalize]);
  const partial = React.useMemo(() => {
    const s = new Set<string>();
    if (!cascade) return s;
    for (const id of fullChecked) {
      let p = index.parent.get(id) ?? null;
      while (p && !s.has(p)) {
        s.add(p);
        p = index.parent.get(p) ?? null;
      }
    }
    return s;
  }, [cascade, fullChecked, index]);

  const getChecked = React.useCallback(
    (id: string): TreeCheckedState => (fullChecked.has(id) ? true : partial.has(id) ? "mixed" : false),
    [fullChecked, partial],
  );

  const toValue = React.useCallback(
    (set: Set<string>): string[] => {
      const known = index.order.filter((id) => set.has(id));
      // keep ids the tree doesn't know yet (unloaded branches) at the end
      const unknown = [...set].filter((id) => !index.byId.has(id));
      if (!cascade || checkValueMode === "all") return [...known, ...unknown];
      if (checkValueMode === "leaf") return [...known.filter((id) => childIds(id).length === 0), ...unknown];
      return [...known.filter((id) => !set.has(index.parent.get(id) ?? "\u0000")), ...unknown];
    },
    [cascade, checkValueMode, childIds, index],
  );

  const toggleChecked = React.useCallback(
    (id: string, next?: boolean) => {
      const node = index.byId.get(id);
      if (!node || node.disabled) return;
      const set = new Set(fullChecked);
      const on = next ?? !set.has(id);
      if (!cascade) {
        if (on) set.add(id);
        else set.delete(id);
        setCheckedValue(toValue(set));
        return;
      }
      const stack = [id];
      while (stack.length) {
        const cur = stack.pop()!;
        const n = index.byId.get(cur);
        if (cur !== id && n?.disabled) continue; // disabled descendants keep their state
        if (on) set.add(cur);
        else set.delete(cur);
        stack.push(...childIds(cur));
      }
      if (!on) {
        let p = index.parent.get(id) ?? null;
        while (p) {
          set.delete(p);
          p = index.parent.get(p) ?? null;
        }
      }
      setCheckedValue(toValue(normalize(set)));
    },
    [cascade, childIds, fullChecked, index, normalize, setCheckedValue, toValue],
  );

  /* ---------------- selection ---------------- */
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const canSelect = React.useCallback(
    (node: TreeNode) => !node.disabled && (isSelectable ? isSelectable(node, nodeHasChildren(node)) : true),
    [isSelectable, nodeHasChildren],
  );
  const select = React.useCallback(
    (id: string) => {
      const node = index.byId.get(id);
      if (!node || selectionMode === "none" || !canSelect(node)) return;
      if (selectionMode === "single") setSelectedIds([id]);
      else setSelectedIds(selectedSet.has(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
    },
    [canSelect, index, selectedIds, selectedSet, selectionMode, setSelectedIds],
  );

  /* ---------------- expand ---------------- */
  const toggleExpanded = React.useCallback(
    (id: string, open?: boolean) => {
      const node = index.byId.get(id);
      if (!node) return;
      const isOpen = expandedSet.has(id) || forced.has(id);
      const want = open ?? !isOpen;
      if (want === isOpen && (want ? expandedSet.has(id) : !expandedSet.has(id))) return;
      if (want) {
        if (needsLoad(node) && !errors.has(id)) startLoad(node);
        if (!expandedSet.has(id)) setExpandedIds([...expandedIds, id]);
      } else {
        setExpandedIds(expandedIds.filter((x) => x !== id));
      }
    },
    [errors, expandedIds, expandedSet, forced, index, needsLoad, setExpandedIds, startLoad],
  );

  // Lazy branches that start expanded (defaultExpanded / controlled) load on mount.
  React.useEffect(() => {
    for (const id of expandedIds) {
      const n = index.byId.get(id);
      if (n && needsLoad(n) && !errors.has(id) && !controllers.current.has(id)) startLoad(n);
    }
  }, [expandedIds, index, needsLoad, errors, startLoad]);

  const reload = React.useCallback(
    (id: string) => {
      const n = index.byId.get(id);
      if (!n) return;
      setLoaded((m) => {
        if (!m.has(id)) return m;
        const next = new Map(m);
        next.delete(id);
        return next;
      });
      startLoad(n);
      if (!expandedSet.has(id)) setExpandedIds([...expandedIds, id]);
    },
    [expandedIds, expandedSet, index, setExpandedIds, startLoad],
  );

  const expandAll = React.useCallback(() => {
    setExpandedIds(index.order.filter((id) => childIds(id).length > 0));
  }, [childIds, index, setExpandedIds]);
  const collapseAll = React.useCallback(() => setExpandedIds([]), [setExpandedIds]);

  /* ---------------- flatten ---------------- */
  const items = React.useMemo(() => {
    const out: TreeItemState[] = [];
    const walk = (list: TreeNode[], level: number, parentId: string | null, guides: boolean[], onlyKept: boolean) => {
      const shown = onlyKept ? list.filter((n) => keep.has(n.id)) : list;
      shown.forEach((n, i) => {
        const hasKids = nodeHasChildren(n);
        const open = hasKids && (expandedSet.has(n.id) || forced.has(n.id));
        const last = i === shown.length - 1;
        out.push({
          node: n,
          id: n.id,
          level,
          parentId,
          posinset: i + 1,
          setsize: shown.length,
          hasChildren: hasKids,
          expanded: open,
          loading: loading.has(n.id),
          error: errors.get(n.id) ?? null,
          checked: checkable ? getChecked(n.id) : false,
          selected: selectedSet.has(n.id),
          disabled: Boolean(n.disabled),
          match: matches.has(n.id),
          last,
          guides,
        });
        const kids = n.children ?? loaded.get(n.id);
        if (open && kids) {
          // A forced (ancestor-of-match) branch shows only kept children; a branch the user opened shows all.
          const restrict = filtering && forced.has(n.id) && !expandedSet.has(n.id);
          walk(kids, level + 1, n.id, [...guides, !last], restrict);
        }
      });
    };
    walk(nodes, 1, null, [], filtering);
    return out;
  }, [nodes, loaded, keep, forced, matches, filtering, expandedSet, loading, errors, checkable, getChecked, selectedSet, nodeHasChildren]);

  /* ---------------- focus ---------------- */
  const [focusedIdState, setFocusedId] = React.useState<string | null>(null);
  const focusedId = focusedIdState && items.some((i) => i.id === focusedIdState) ? focusedIdState : null;
  const tabStopId = focusedId ?? items.find((i) => i.selected)?.id ?? items.find((i) => i.checked === true)?.id ?? items[0]?.id ?? null;
  const rootRef = React.useRef<HTMLElement | null>(null);
  const itemsRef = useLatest(items);
  const scrollRef = useLatest(options.scrollToIndex);

  const findEl = React.useCallback((id: string) => {
    const root = rootRef.current;
    if (!root) return null;
    for (const el of root.querySelectorAll<HTMLElement>("[data-tree-id]")) if (el.dataset.treeId === id) return el;
    return null;
  }, []);

  const focusItem = React.useCallback(
    (id: string) => {
      setFocusedId(id);
      const idx = itemsRef.current.findIndex((i) => i.id === id);
      const el = findEl(id);
      if (el) {
        el.focus({ preventScroll: false });
        el.scrollIntoView?.({ block: "nearest" });
        return;
      }
      if (idx >= 0) scrollRef.current?.(idx);
      requestAnimationFrame(() => findEl(id)?.focus());
    },
    [findEl, itemsRef, scrollRef],
  );

  /* ---------------- keyboard ---------------- */
  const typeahead = React.useRef({ buffer: "", time: 0 });
  const optionsRef = useLatest(options);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-tree-id]");
      if (!target || !rootRef.current?.contains(target)) return;
      // Keys typed into a control inside a row (rename input, action button) are not tree navigation.
      if (target !== e.target && (e.target as HTMLElement).matches("input, textarea, select, [contenteditable=true]")) return;
      const list = itemsRef.current;
      const i = list.findIndex((it) => it.id === target.dataset.treeId);
      if (i < 0) return;
      const item = list[i]!;
      const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      const go = (j: number) => {
        const next = list[Math.max(0, Math.min(list.length - 1, j))];
        if (next) focusItem(next.id);
      };

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          go(i + 1);
          return;
        case "ArrowUp":
          e.preventDefault();
          go(i - 1);
          return;
        case "Home":
          e.preventDefault();
          go(0);
          return;
        case "End":
          e.preventDefault();
          go(list.length - 1);
          return;
        case forward:
          e.preventDefault();
          if (!item.hasChildren) return;
          if (!item.expanded) toggleExpanded(item.id, true);
          else if (list[i + 1]?.parentId === item.id) go(i + 1);
          return;
        case backward:
          e.preventDefault();
          if (item.expanded && !(filtering && forced.has(item.id) && !expandedSet.has(item.id))) toggleExpanded(item.id, false);
          else if (item.parentId) focusItem(item.parentId);
          return;
        case "*": {
          e.preventDefault();
          const siblings = list.filter((it) => it.parentId === item.parentId && it.hasChildren && !it.expanded).map((it) => it.id);
          if (siblings.length) {
            const kids = siblings.map((id) => index.byId.get(id)!).filter((n) => needsLoad(n));
            kids.forEach((n) => startLoad(n));
            setExpandedIds([...new Set([...expandedIds, ...siblings])]);
          }
          return;
        }
        case "Enter":
          e.preventDefault();
          if (item.disabled) return;
          if (selectionMode !== "none") select(item.id);
          else if (checkable) toggleChecked(item.id);
          optionsRef.current.onAction?.(item.node);
          return;
        case " ":
          e.preventDefault();
          if (item.disabled) return;
          if (checkable) toggleChecked(item.id);
          else if (selectionMode !== "none") select(item.id);
          else if (item.hasChildren) toggleExpanded(item.id);
          return;
        default:
          break;
      }

      // Type-ahead (folded: "ist" finds "İstanbul").
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /\S/.test(e.key)) {
        const now = Date.now();
        const ta = typeahead.current;
        ta.buffer = now - ta.time > 600 ? e.key : ta.buffer + e.key;
        ta.time = now;
        const q = foldText(ta.buffer, locale);
        const start = ta.buffer.length === 1 ? i + 1 : i;
        for (let k = 0; k < list.length; k++) {
          const cand = list[(start + k) % list.length]!;
          if (foldText(cand.node.label, locale).startsWith(q)) {
            focusItem(cand.id);
            break;
          }
        }
      }
    },
    [checkable, dir, expandedIds, expandedSet, filtering, focusItem, forced, index, itemsRef, locale, needsLoad, optionsRef, select, selectionMode, setExpandedIds, startLoad, toggleChecked, toggleExpanded],
  );

  const getTreeProps = React.useCallback(
    () => ({
      ref: (el: HTMLElement | null) => {
        rootRef.current = el;
      },
      role: "tree" as const,
      "aria-multiselectable": selectionMode === "multiple" || checkable ? true : undefined,
      onKeyDown,
    }),
    [checkable, onKeyDown, selectionMode],
  );

  const getItemProps = React.useCallback(
    (item: TreeItemState) => ({
      role: "treeitem" as const,
      tabIndex: item.id === tabStopId ? 0 : -1,
      "aria-level": item.level,
      "aria-posinset": item.posinset,
      "aria-setsize": item.setsize,
      "aria-expanded": item.hasChildren ? item.expanded : undefined,
      "aria-selected": selectionMode !== "none" ? item.selected : undefined,
      "aria-checked": checkable ? item.checked : undefined,
      "aria-disabled": item.disabled || undefined,
      "aria-busy": item.loading || undefined,
      "data-tree-id": item.id,
      "data-state": item.hasChildren ? (item.expanded ? ("open" as const) : ("closed" as const)) : undefined,
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        if (e.target === e.currentTarget) setFocusedId(item.id);
      },
    }),
    [checkable, selectionMode, tabStopId],
  );

  const getPath = React.useCallback(
    (id: string) => {
      const out: TreeNode[] = [];
      let cur: string | null = id;
      const idx = indexRef.current;
      while (cur) {
        const n = idx.byId.get(cur);
        if (!n) break;
        out.unshift(n);
        cur = idx.parent.get(cur) ?? null;
      }
      return out;
    },
    [indexRef],
  );

  const checkedIds = React.useMemo(() => (checkable ? toValue(fullChecked) : EMPTY), [checkable, fullChecked, toValue]);

  return {
    items,
    getNode: (id) => index.byId.get(id),
    getParentId: (id) => index.parent.get(id) ?? null,
    getPath,
    getChildren,
    isExpanded,
    toggleExpanded,
    expandAll,
    collapseAll,
    expandedIds,
    selectedIds,
    select,
    checkedIds,
    getChecked,
    toggleChecked,
    reload,
    focusedId,
    setFocusedId,
    focusItem,
    getTreeProps,
    getItemProps,
    matchCount: matches.size,
    filtering,
  };
}
