"use client";

/**
 * Hierarchy chart: a pannable, zoomable tidy-tree diagram (org chart, partner network, site
 * structure). Collapsible subtrees, search highlight, focus-to-node, drag-to-reparent with a
 * "Change parent…" alternative, viewport culling for large trees, SVG / PNG export and a list
 * view. The accessible model is the Tree view pattern, shared by both views.
 */
import * as React from "react";
import { hierarchy as d3hierarchy, tree as d3tree, type HierarchyPointNode } from "d3-hierarchy";
import { ArrowLeftRight, ArrowUpDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, Crosshair, Ellipsis, GitBranch, Maximize, Minus, Plus } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { matchText } from "../lib/text";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { Avatar } from "./avatar";
import { IconButton } from "./button";
import { Skeleton } from "./skeleton";
import { toast } from "./toast";
import { TreeView } from "./tree-view";
import type { TreeNode } from "../lib/use-tree";
import { Dialog, DialogBody, DialogContent, DialogHeader } from "./dialog";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "./command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";

// ---------------------------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------------------------

export const hierarchyChartLabels = {
  canvas: "Chart canvas",
  instructions: "Arrow keys pan the canvas, plus and minus zoom, 0 fits the chart. In the tree, arrow keys move between nodes, Shift+F10 opens node actions.",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  fit: "Fit to view",
  zoomLevel: "Zoom {percent}",
  expandAll: "Expand all",
  collapseAll: "Collapse all",
  vertical: "Top to bottom",
  horizontal: "Left to right",
  nodeMenu: "Actions for {node}",
  expand: "Expand",
  collapse: "Collapse",
  center: "Center in view",
  changeParent: "Change parent…",
  changeParentTitle: "Move {node} under…",
  changeParentDescription: "Pick the new parent. Its whole team moves with it.",
  searchNodes: "Search",
  noMatches: "No matches",
  hiddenCount: "{count, plural, one {# hidden below} other {# hidden below}}",
  reparented: "{node} moved under {parent}.",
  reparentFailed: "Couldn't move {node}",
  cycle: "Can't move a node under its own team",
  retry: "Retry",
  loading: "Loading chart",
  empty: "No nodes to show",
};
export type HierarchyChartLabels = typeof hierarchyChartLabels;

// ---------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------

export interface HierarchyNodeData {
  id: string;
  /** `null` for a root. Several roots are allowed. */
  parentId: string | null;
}

export interface HierarchyNodeState {
  /** 0 = root. */
  depth: number;
  childCount: number;
  descendantCount: number;
  collapsed: boolean;
  selected: boolean;
  /** Matches `highlight`. */
  matched: boolean;
  orientation: "vertical" | "horizontal";
}

export interface HierarchyReparentEvent {
  id: string;
  newParentId: string;
  oldParentId: string | null;
}

export interface HierarchyChartHandle {
  fit(): void;
  zoomIn(): void;
  zoomOut(): void;
  /** Expands its ancestors, then pans and zooms to the node. */
  focusNode(id: string): void;
  expandAll(): void;
  collapseAll(): void;
  /** Standalone SVG of the visible (expanded) chart, colours resolved from the current theme. */
  toSVG(): string;
  /** PNG of `toSVG()` at `scale` (default 2). */
  toPNG(scale?: number): Promise<Blob>;
}

type NodeSize = { width: number; height: number };
const PRESETS: Record<"compact" | "card", NodeSize> = { compact: { width: 184, height: 56 }, card: { width: 236, height: 84 } };

export interface HierarchyChartProps<T extends HierarchyNodeData> {
  nodes: readonly T[];
  /** Node content inside the kit's card frame. Default: `HierarchyNodeCard` with the label. */
  renderNode?: (node: T, state: HierarchyNodeState) => React.ReactNode;
  /** Text of a node: search, type-ahead, export, list view. Default `name` / `label` / `title`. */
  getLabel?: (node: T) => string;
  /** Second line in export and list view (job title, tier). */
  getDescription?: (node: T) => string | undefined;
  /** Vacant / placeholder nodes get a dashed frame. */
  isPlaceholder?: (node: T) => boolean;
  orientation?: "vertical" | "horizontal";
  defaultOrientation?: "vertical" | "horizontal";
  onOrientationChange?: (o: "vertical" | "horizontal") => void;
  /** px, or a preset. Default `"card"` (236 × 84). */
  nodeSize?: NodeSize | "compact" | "card";
  /** Space between siblings (x) and levels (y). Default `{ x: 28, y: 56 }`. */
  gap?: { x: number; y: number };
  collapsed?: string[];
  /** Ids, or `{ depth }` to collapse every node at that depth and below. Default: `{ depth: 2 }` beyond 500 nodes. */
  defaultCollapsed?: string[] | { depth: number };
  onCollapsedChange?: (ids: string[]) => void;
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (id: string | null) => void;
  /** Pans and zooms to this node whenever it changes (search result, deep link). */
  focusId?: string | null;
  /** Highlights matching nodes (locale-folded) and opens their ancestors. */
  highlight?: string;
  /** Enables drag-to-reparent and "Change parent…". A returned promise keeps the move optimistic. */
  onReparent?: (event: HierarchyReparentEvent) => void | Promise<void>;
  /** `true`, or why the move is not allowed. Cycles are always blocked. */
  canReparent?: (event: HierarchyReparentEvent) => true | string;
  /** Extra items in each node's action menu. */
  nodeMenu?: (node: T) => React.ReactNode;
  view?: "chart" | "list";
  /** Floating zoom / fit / orientation controls. Default `true`. */
  controls?: boolean;
  /** Canvas height. Default `32rem`. */
  height?: number | string;
  loading?: boolean;
  empty?: React.ReactNode;
  labels?: Partial<HierarchyChartLabels>;
  "aria-label"?: string;
  className?: string;
}

interface LaidOut<T> {
  id: string;
  data: T;
  depth: number;
  x: number;
  y: number;
  parentId: string | null;
  childCount: number;
  posinset: number;
  setsize: number;
}

const ROOT = "\u0000root";
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const MIN_K = 0.15;
const MAX_K = 2;

const defaultLabel = (n: unknown): string => {
  const o = n as Record<string, unknown>;
  const v = o.name ?? o.label ?? o.title;
  return typeof v === "string" ? v : String(o.id);
};

// ---------------------------------------------------------------------------------------------
// Layout (pure)
// ---------------------------------------------------------------------------------------------

/**
 * Tidy-tree layout of a flat `{ id, parentId }` list. Returns top-left node boxes in content
 * coordinates (origin at 0,0) and the content size. Collapsed nodes hide their subtree.
 */
export function layoutHierarchy<T extends HierarchyNodeData>(
  nodes: readonly T[],
  opts: { collapsed?: ReadonlySet<string>; orientation?: "vertical" | "horizontal"; size?: NodeSize; gap?: { x: number; y: number }; dir?: "ltr" | "rtl" } = {},
): { nodes: LaidOut<T>[]; width: number; height: number } {
  const { collapsed, orientation = "vertical", size = PRESETS.card, gap = { x: 28, y: 56 }, dir = "ltr" } = opts;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const kids = new Map<string, T[]>();
  for (const n of nodes) {
    const p = n.parentId !== null && byId.has(n.parentId) ? n.parentId : ROOT;
    const list = kids.get(p);
    if (list) list.push(n);
    else kids.set(p, [n]);
  }
  if (!kids.get(ROOT)?.length) return { nodes: [], width: 0, height: 0 };
  type D = { id: string; data?: T };
  const root = d3hierarchy<D>({ id: ROOT }, (d) => (d.id !== ROOT && collapsed?.has(d.id) ? null : (kids.get(d.id) ?? []).map((c) => ({ id: c.id, data: c }))));
  const vertical = orientation === "vertical";
  const layout = d3tree<D>()
    .nodeSize(vertical ? [size.width + gap.x, size.height + gap.y] : [size.height + gap.x * 0.6, size.width + gap.y])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));
  const laid = layout(root);
  const out: LaidOut<T>[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  laid.each((p: HierarchyPointNode<D>) => {
    if (p.data.id === ROOT) return;
    const depth = p.depth - 1;
    let x: number;
    let y: number;
    if (vertical) {
      x = p.x - size.width / 2;
      y = depth * (size.height + gap.y);
    } else {
      x = depth * (size.width + gap.y);
      y = p.x - size.height / 2;
    }
    // RTL: the root sits on the inline-start (right) side and siblings run right to left.
    if (dir === "rtl") x = -x - size.width;
    const siblings = p.parent?.children ?? [p];
    out.push({
      id: p.data.id,
      data: p.data.data!,
      depth,
      x,
      y,
      parentId: p.parent && p.parent.data.id !== ROOT ? p.parent.data.id : null,
      childCount: kids.get(p.data.id)?.length ?? 0,
      posinset: siblings.indexOf(p) + 1,
      setsize: siblings.length,
    });
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + size.width);
    maxY = Math.max(maxY, y + size.height);
  });
  for (const n of out) {
    n.x -= minX;
    n.y -= minY;
  }
  return { nodes: out, width: maxX - minX, height: maxY - minY };
}

/** Rounded orthogonal edge between a parent box and a child box. */
function edgePath(p: { x: number; y: number }, c: { x: number; y: number }, s: NodeSize, vertical: boolean, rtl: boolean): string {
  if (vertical) {
    const px = p.x + s.width / 2;
    const py = p.y + s.height;
    const cx = c.x + s.width / 2;
    const cy = c.y;
    const my = (py + cy) / 2;
    if (Math.abs(cx - px) < 1) return `M${px},${py}V${cy}`;
    const r = Math.min(10, Math.abs(cx - px) / 2, (cy - py) / 4);
    const sx = cx > px ? 1 : -1;
    return `M${px},${py}V${my - r}Q${px},${my} ${px + sx * r},${my}H${cx - sx * r}Q${cx},${my} ${cx},${my + r}V${cy}`;
  }
  const px = rtl ? p.x : p.x + s.width;
  const py = p.y + s.height / 2;
  const cx = rtl ? c.x + s.width : c.x;
  const cy = c.y + s.height / 2;
  const mx = (px + cx) / 2;
  if (Math.abs(cy - py) < 1) return `M${px},${py}H${cx}`;
  const r = Math.min(10, Math.abs(cy - py) / 2, Math.abs(cx - px) / 4);
  const sy = cy > py ? 1 : -1;
  const sx = cx > px ? 1 : -1;
  return `M${px},${py}H${mx - sx * r}Q${mx},${py} ${mx},${py + sy * r}V${cy - sy * r}Q${mx},${cy} ${mx + sx * r},${cy}H${cx}`;
}

// ---------------------------------------------------------------------------------------------
// HierarchyChart
// ---------------------------------------------------------------------------------------------

function HierarchyChartInner<T extends HierarchyNodeData>(props: HierarchyChartProps<T>, ref: React.ForwardedRef<HierarchyChartHandle>) {
  const {
    nodes: nodesProp,
    renderNode,
    getLabel = defaultLabel as (n: T) => string,
    getDescription,
    isPlaceholder,
    orientation: orientationProp,
    defaultOrientation = "vertical",
    onOrientationChange,
    nodeSize = "card",
    gap: gapProp,
    collapsed: collapsedProp,
    defaultCollapsed,
    onCollapsedChange,
    selected: selectedProp,
    defaultSelected = null,
    onSelectedChange,
    focusId,
    highlight,
    onReparent,
    canReparent,
    nodeMenu,
    view = "chart",
    controls = true,
    height = "32rem",
    loading,
    empty,
    labels,
    className,
    "aria-label": ariaLabel,
  } = props;
  const t = useLabels("hierarchyChart", hierarchyChartLabels, labels);
  const { dir, locale, format } = useLocale();
  const reducedMotion = useReducedMotion();
  // Stable by value: inline `nodeSize` / `gap` objects must not re-run the layout every render.
  const sizeRaw = typeof nodeSize === "string" ? PRESETS[nodeSize] : nodeSize;
  const size = React.useMemo(() => ({ width: sizeRaw.width, height: sizeRaw.height }), [sizeRaw.width, sizeRaw.height]);
  const gap = React.useMemo(() => ({ x: gapProp?.x ?? 28, y: gapProp?.y ?? 56 }), [gapProp?.x, gapProp?.y]);
  const instructionsId = React.useId();

  const [orientation, setOrientation] = useControllableState({ value: orientationProp, defaultValue: defaultOrientation, onChange: onOrientationChange, name: "HierarchyChart" });
  const vertical = orientation === "vertical";

  // Optimistic reparenting.
  const [overrides, setOverrides] = React.useState<Map<string, string>>(() => new Map());
  const nodes = React.useMemo(
    () => (overrides.size ? nodesProp.map((n) => (overrides.has(n.id) ? { ...n, parentId: overrides.get(n.id)! } : n)) : nodesProp),
    [nodesProp, overrides],
  );
  const byId = React.useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const childrenOf = React.useMemo(() => {
    const m = new Map<string, string[]>();
    for (const n of nodes) {
      if (n.parentId === null || !byId.has(n.parentId)) continue;
      const list = m.get(n.parentId);
      if (list) list.push(n.id);
      else m.set(n.parentId, [n.id]);
    }
    return m;
  }, [nodes, byId]);
  const descendants = React.useMemo(() => {
    const memo = new Map<string, number>();
    const count = (id: string): number => {
      const hit = memo.get(id);
      if (hit !== undefined) return hit;
      const c = (childrenOf.get(id) ?? []).reduce((a, k) => a + 1 + count(k), 0);
      memo.set(id, c);
      return c;
    };
    for (const n of nodes) count(n.id);
    return memo;
  }, [nodes, childrenOf]);
  const depthOf = React.useCallback(
    (id: string) => {
      let d = 0;
      let cur = byId.get(id);
      const seen = new Set<string>();
      while (cur && cur.parentId !== null && byId.has(cur.parentId) && !seen.has(cur.id)) {
        seen.add(cur.id);
        d++;
        cur = byId.get(cur.parentId);
      }
      return d;
    },
    [byId],
  );
  const ancestorsOf = React.useCallback(
    (id: string) => {
      const out: string[] = [];
      let cur = byId.get(id);
      while (cur && cur.parentId !== null && byId.has(cur.parentId) && !out.includes(cur.parentId)) {
        out.push(cur.parentId);
        cur = byId.get(cur.parentId);
      }
      return out;
    },
    [byId],
  );

  const [collapsed, setCollapsed] = useControllableState<string[]>({
    value: collapsedProp,
    defaultValue: () => {
      const dc = defaultCollapsed ?? (nodesProp.length > 500 ? { depth: 2 } : []);
      if (Array.isArray(dc)) return dc;
      const ids = new Set(nodesProp.map((n) => n.id));
      const parents = new Set(nodesProp.filter((n) => n.parentId !== null && ids.has(n.parentId)).map((n) => n.parentId!));
      const map = new Map(nodesProp.map((n) => [n.id, n]));
      const depth = (n: T) => {
        let d = 0;
        let c: T | undefined = n;
        while (c && c.parentId !== null && map.has(c.parentId) && d < 1000) {
          d++;
          c = map.get(c.parentId);
        }
        return d;
      };
      return nodesProp.filter((n) => parents.has(n.id) && depth(n) >= dc.depth).map((n) => n.id);
    },
    onChange: onCollapsedChange,
    name: "HierarchyChart",
  });

  const matches = React.useMemo(() => {
    const q = highlight?.trim();
    if (!q) return new Set<string>();
    return new Set(nodes.filter((n) => matchText(`${getLabel(n)} ${getDescription?.(n) ?? ""}`, q, locale)).map((n) => n.id));
  }, [highlight, nodes, getLabel, getDescription, locale]);

  const collapsedSet = React.useMemo(() => {
    const s = new Set(collapsed);
    for (const id of matches) for (const a of ancestorsOf(id)) s.delete(a);
    return s;
  }, [collapsed, matches, ancestorsOf]);

  const [selected, setSelected] = useControllableState<string | null>({ value: selectedProp, defaultValue: defaultSelected, onChange: onSelectedChange, name: "HierarchyChart" });

  const layout = React.useMemo(() => layoutHierarchy(nodes, { collapsed: collapsedSet, orientation, size, gap, dir }), [nodes, collapsedSet, orientation, size, gap, dir]);
  const laidById = React.useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout]);
  // Depth-first order of visible nodes (DOM and keyboard order).
  const order = React.useMemo(() => {
    const kids = new Map<string | null, LaidOut<T>[]>();
    for (const n of layout.nodes) {
      const list = kids.get(n.parentId);
      if (list) list.push(n);
      else kids.set(n.parentId, [n]);
    }
    const out: LaidOut<T>[] = [];
    const walk = (pid: string | null) => {
      for (const n of (kids.get(pid) ?? []).sort((a, b) => a.posinset - b.posinset)) {
        out.push(n);
        walk(n.id);
      }
    };
    walk(null);
    return out;
  }, [layout]);

  // ------------------------------------------------------------------ viewport / transform
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [vp, setVp] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [tf, setTf] = React.useState({ x: 24, y: 24, k: 1 });
  const [animate, setAnimate] = React.useState(false);
  const fitted = React.useRef(false);
  /** The person panned, zoomed or toggled: stop auto-fitting. */
  const touched = React.useRef(false);
  const pendingCenter = React.useRef<string | null>(null);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const r = entry.contentRect;
      setVp((p) => (p.w === r.width && p.h === r.height ? p : { w: r.width, h: r.height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  const apply = React.useCallback(
    (next: { x: number; y: number; k: number } | ((p: { x: number; y: number; k: number }) => { x: number; y: number; k: number }), anim = false) => {
      setAnimate(anim && !reducedMotion);
      setTf(next);
    },
    [reducedMotion],
  );

  const fitTransform = React.useCallback(() => {
    if (!vp.w || !vp.h || !layout.width) return null;
    const pad = 32;
    // The floating controls sit bottom-end: keep the fitted chart clear of them.
    const bottom = controls ? 64 : pad;
    const k = clamp(Math.min((vp.w - pad * 2) / layout.width, (vp.h - pad - bottom) / layout.height, 1), MIN_K, MAX_K);
    const y = (vp.h - bottom + pad - layout.height * k) / 2;
    return { k, x: (vp.w - layout.width * k) / 2, y: vertical ? Math.max(pad, y) : y };
  }, [vp, layout, vertical, controls]);

  const fit = React.useCallback(
    (anim = true) => {
      const f = fitTransform();
      if (f) apply(f, anim);
    },
    [fitTransform, apply],
  );

  const centerOn = React.useCallback(
    (id: string, anim = true, minK = 0.85) => {
      const n = laidById.get(id);
      if (!n || !vp.w) return false;
      touched.current = true;
      apply((p) => {
        const k = Math.max(p.k, minK);
        return { k, x: vp.w / 2 - (n.x + size.width / 2) * k, y: vp.h / 2 - (n.y + size.height / 2) * k };
      }, anim);
      return true;
    },
    [laidById, vp, size, apply],
  );

  const ensureVisible = React.useCallback(
    (id: string) => {
      const n = laidById.get(id);
      if (!n || !vp.w) return;
      const m = 24;
      const sx = n.x * tf.k + tf.x;
      const sy = n.y * tf.k + tf.y;
      const sw = size.width * tf.k;
      const sh = size.height * tf.k;
      let dx = 0;
      let dy = 0;
      if (sx < m) dx = m - sx;
      else if (sx + sw > vp.w - m) dx = vp.w - m - sx - sw;
      if (sy < m) dy = m - sy;
      else if (sy + sh > vp.h - m) dy = vp.h - m - sy - sh;
      if (dx || dy) apply((p) => ({ ...p, x: p.x + dx, y: p.y + dy }), true);
    },
    [laidById, vp, tf, size, apply],
  );

  // Initial view: fit when it stays readable, otherwise start at the root at 60 %.
  const initialView = React.useCallback(() => {
    const f = fitTransform();
    if (!f) return;
    if (f.k >= 0.6) return apply(f, false);
    const root = layout.nodes.find((n) => n.depth === 0);
    if (!root) return apply(f, false);
    const k = 0.6;
    const pad = 32;
    // Centre the rows that fit vertically instead of pinning a short tree to the top edge.
    const bottom = controls ? 64 : pad;
    if (vertical) apply({ k, x: vp.w / 2 - (root.x + size.width / 2) * k, y: Math.max(pad, (vp.h - bottom + pad - layout.height * k) / 2) }, false);
    else apply({ k, x: dir === "rtl" ? vp.w - pad - (root.x + size.width) * k : pad - root.x * k, y: vp.h / 2 - (root.y + size.height / 2) * k }, false);
  }, [fitTransform, apply, layout, vertical, vp, size, dir, controls]);

  // Re-run the initial view while the person hasn't moved the canvas (the container may resize
  // during hydration); deferred centering after expand.
  React.useLayoutEffect(() => {
    if ((!fitted.current || !touched.current) && vp.w && layout.width) {
      fitted.current = true;
      initialView();
    }
    if (pendingCenter.current && centerOn(pendingCenter.current, true)) pendingCenter.current = null;
  }, [vp, layout, initialView, centerOn]);

  const zoomBy = React.useCallback(
    (f: number, at?: { x: number; y: number }) => {
      touched.current = true;
      apply((p) => {
        const k = clamp(p.k * f, MIN_K, MAX_K);
        const cx = at?.x ?? vp.w / 2;
        const cy = at?.y ?? vp.h / 2;
        return { k, x: cx - (cx - p.x) * (k / p.k), y: cy - (cy - p.y) * (k / p.k) };
      }, !at);
    },
    [apply, vp],
  );

  const focusNodeImpl = React.useCallback(
    (id: string) => {
      if (!byId.has(id)) return;
      const anc = ancestorsOf(id);
      const needs = anc.some((a) => collapsedSet.has(a));
      if (needs) setCollapsed((prev) => prev.filter((x) => !anc.includes(x)));
      setFocusedId(id);
      if (needs || !centerOn(id)) pendingCenter.current = id;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [byId, ancestorsOf, collapsedSet, setCollapsed, centerOn],
  );

  React.useEffect(() => {
    if (focusId) focusNodeImpl(focusId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  // Wheel: pan, Ctrl/⌘ + wheel (and trackpad pinch) zooms at the cursor. Non-passive to keep the page still.
  const wheelLatest = useLatest({ zoomBy, apply });
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      touched.current = true;
      const L = wheelLatest.current;
      if (e.ctrlKey || e.metaKey) {
        const r = el.getBoundingClientRect();
        L.zoomBy(Math.exp(-e.deltaY * 0.0045), { x: e.clientX - r.left, y: e.clientY - r.top });
      } else {
        const dx = e.shiftKey ? e.deltaY : e.deltaX;
        const dy = e.shiftKey ? 0 : e.deltaY;
        L.apply((p) => ({ ...p, x: p.x - dx, y: p.y - dy }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wheelLatest, view]);

  // ------------------------------------------------------------------ focus, selection, collapse
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const nodeRefs = React.useRef(new Map<string, HTMLElement>());
  const tabId = focusedId && laidById.has(focusedId) ? focusedId : (selected && laidById.has(selected) ? selected : (order[0]?.id ?? null));

  const focusNodeEl = (id: string | undefined) => {
    if (!id) return;
    setFocusedId(id);
    ensureVisible(id);
    requestAnimationFrame(() => nodeRefs.current.get(id)?.focus({ preventScroll: true }));
  };

  const toggle = React.useCallback(
    (id: string, open?: boolean) => {
      touched.current = true;
      setCollapsed((prev) => {
      const isClosed = prev.includes(id);
      const wantOpen = open ?? isClosed;
      return wantOpen ? prev.filter((x) => x !== id) : isClosed ? prev : [...prev, id];
      });
    },
    [setCollapsed],
  );
  const expandAll = React.useCallback(() => setCollapsed([]), [setCollapsed]);
  const collapseAll = React.useCallback(() => {
    const roots = nodes.filter((n) => n.parentId === null || !byId.has(n.parentId)).map((n) => n.id);
    setCollapsed(roots.filter((r) => childrenOf.has(r)));
  }, [nodes, byId, childrenOf, setCollapsed]);

  // ------------------------------------------------------------------ reparent
  const [status, setStatus] = React.useState("");
  const announce = (msg: string) => {
    setStatus("");
    requestAnimationFrame(() => setStatus(msg));
  };
  const isInSubtree = React.useCallback(
    (root: string, id: string) => {
      let cur = byId.get(id);
      const seen = new Set<string>();
      while (cur && !seen.has(cur.id)) {
        if (cur.id === root) return true;
        seen.add(cur.id);
        cur = cur.parentId !== null ? byId.get(cur.parentId) : undefined;
      }
      return false;
    },
    [byId],
  );
  const checkReparent = React.useCallback(
    (id: string, newParentId: string): true | string => {
      if (id === newParentId || isInSubtree(id, newParentId)) return t("cycle");
      const oldParentId = byId.get(id)?.parentId ?? null;
      return canReparent ? canReparent({ id, newParentId, oldParentId }) : true;
    },
    [isInSubtree, byId, canReparent, t],
  );
  const reparent = React.useCallback(
    async (id: string, newParentId: string) => {
      const me = byId.get(id);
      if (!me || !onReparent || me.parentId === newParentId) return;
      const ok = checkReparent(id, newParentId);
      if (ok !== true) {
        announce(ok);
        return;
      }
      const ev: HierarchyReparentEvent = { id, newParentId, oldParentId: me.parentId };
      const name = getLabel(me);
      const parentName = byId.get(newParentId) ? getLabel(byId.get(newParentId)!) : newParentId;
      setCollapsed((prev) => prev.filter((x) => x !== newParentId));
      announce(t("reparented", { node: name, parent: parentName }));
      pendingCenter.current = id;
      const r = onReparent(ev);
      if (r && typeof (r as Promise<void>).then === "function") {
        setOverrides((m) => new Map(m).set(id, newParentId));
        try {
          await r;
        } catch {
          toast.danger(t("reparentFailed", { node: name }), { action: { label: t("retry"), onClick: () => void reparentRef.current(id, newParentId) } });
        } finally {
          setOverrides((m) => {
            const next = new Map(m);
            next.delete(id);
            return next;
          });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [byId, onReparent, checkReparent, getLabel, setCollapsed, t],
  );
  const reparentRef = React.useRef(reparent);
  reparentRef.current = reparent;

  const [drag, setDrag] = React.useState<{ id: string; x: number; y: number; target: string | null; reason: string | null } | null>(null);
  const gesture = React.useRef<{ kind: "pan" | "node"; id?: string; sx: number; sy: number; ox: number; oy: number; moved: boolean; pointerId: number } | null>(null);
  const suppressClick = React.useRef(false);
  const [panning, setPanning] = React.useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-hierarchy-ui]")) return;
    const nodeEl = target.closest<HTMLElement>("[data-node-id]");
    const kind = nodeEl && onReparent ? "node" : "pan";
    gesture.current = { kind, id: nodeEl?.dataset.nodeId, sx: e.clientX, sy: e.clientY, ox: tf.x, oy: tf.y, moved: false, pointerId: e.pointerId };
    suppressClick.current = false;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const dx = e.clientX - g.sx;
    const dy = e.clientY - g.sy;
    if (!g.moved && Math.hypot(dx, dy) < 5) return;
    if (!g.moved) {
      g.moved = true;
      suppressClick.current = true;
      viewportRef.current?.setPointerCapture?.(e.pointerId);
      if (typeof document !== "undefined") document.documentElement.setAttribute("data-dragging", "");
    }
    if (g.kind === "pan") {
      touched.current = true;
      setAnimate(false);
      setPanning(true);
      setTf((p) => ({ ...p, x: g.ox + dx, y: g.oy + dy }));
      return;
    }
    const r = viewportRef.current!.getBoundingClientRect();
    const hit = typeof document !== "undefined" && document.elementsFromPoint ? document.elementsFromPoint(e.clientX, e.clientY) : [];
    const over = hit.map((el) => (el as HTMLElement).closest?.<HTMLElement>("[data-node-id]")).find((el) => el && el.dataset.nodeId !== g.id && viewportRef.current?.contains(el));
    const targetId = over?.dataset.nodeId ?? null;
    const reason = targetId ? (byId.get(g.id!)?.parentId === targetId ? null : checkReparent(g.id!, targetId)) : null;
    setDrag({ id: g.id!, x: e.clientX - r.left, y: e.clientY - r.top, target: targetId, reason: reason === true ? null : reason });
  };
  const endGesture = (e: React.PointerEvent<HTMLDivElement>, cancel = false) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    gesture.current = null;
    setPanning(false);
    if (typeof document !== "undefined") document.documentElement.removeAttribute("data-dragging");
    if (viewportRef.current?.hasPointerCapture?.(e.pointerId)) viewportRef.current.releasePointerCapture(e.pointerId);
    if (g.kind === "node" && drag) {
      const d = drag;
      setDrag(null);
      if (!cancel && d.target && !d.reason) void reparent(d.id, d.target);
      else if (d.reason) announce(d.reason);
    }
  };

  // ------------------------------------------------------------------ keyboard
  const onViewportKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && drag) {
      setDrag(null);
      gesture.current = null;
      return;
    }
    const onCanvas = e.target === e.currentTarget;
    if ("+=-_0".includes(e.key) || (onCanvas && e.key.startsWith("Arrow"))) touched.current = true;
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoomBy(1.25);
      return;
    }
    if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      zoomBy(0.8);
      return;
    }
    if (e.key === "0") {
      e.preventDefault();
      fit();
      return;
    }
    if (onCanvas && e.key.startsWith("Arrow")) {
      e.preventDefault();
      const step = e.shiftKey ? 160 : 48;
      const dx = e.key === "ArrowLeft" ? step : e.key === "ArrowRight" ? -step : 0;
      const dy = e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0;
      apply((p) => ({ ...p, x: p.x + dx, y: p.y + dy }), true);
    }
  };

  const [menuFor, setMenuFor] = React.useState<string | null>(null);
  const [pickerFor, setPickerFor] = React.useState<string | null>(null);

  const onNodeKeyDown = (e: React.KeyboardEvent<HTMLElement>, n: LaidOut<T>) => {
    if (e.target !== e.currentTarget) return;
    const i = order.findIndex((o) => o.id === n.id);
    const hasKids = n.childCount > 0;
    const open = hasKids && !collapsedSet.has(n.id);
    const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
      e.preventDefault();
      setMenuFor(n.id);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusNodeEl(order[i + 1]?.id);
        return;
      case "ArrowUp":
        e.preventDefault();
        focusNodeEl(order[i - 1]?.id);
        return;
      case "Home":
        e.preventDefault();
        focusNodeEl(order[0]?.id);
        return;
      case "End":
        e.preventDefault();
        focusNodeEl(order[order.length - 1]?.id);
        return;
      case fwd:
        e.preventDefault();
        if (hasKids && !open) toggle(n.id, true);
        else if (open) focusNodeEl(order[i + 1]?.id);
        return;
      case back:
        e.preventDefault();
        if (open) toggle(n.id, false);
        else if (n.parentId) focusNodeEl(n.parentId);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        setSelected(n.id);
        return;
      case "*": {
        e.preventDefault();
        const sibs = order.filter((o) => o.parentId === n.parentId && o.childCount > 0).map((o) => o.id);
        setCollapsed((prev) => prev.filter((x) => !sibs.includes(x)));
        return;
      }
    }
    if (e.key.length === 1 && /\S/.test(e.key) && !"+-=_0".includes(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const ch = e.key.toLocaleLowerCase(locale);
      const rest = [...order.slice(i + 1), ...order.slice(0, i + 1)];
      const hit = rest.find((o) => getLabel(o.data).toLocaleLowerCase(locale).startsWith(ch));
      if (hit) {
        e.preventDefault();
        focusNodeEl(hit.id);
      }
    }
  };

  // ------------------------------------------------------------------ export
  const exportSVG = React.useCallback((): string => {
    const el = viewportRef.current;
    const cs = el && typeof getComputedStyle !== "undefined" ? getComputedStyle(el) : null;
    const v = (name: string, fb: string) => cs?.getPropertyValue(name).trim() || fb;
    const surface = v("--surface-solid", v("--popover-nested", "#ffffff"));
    const line = v("--line", "#d4d4d4");
    const fg = v("--fg", "#111111");
    const muted = v("--fg-muted", "#666666");
    const scene = v("--scene", "#f5f5f5");
    const font = cs?.fontFamily || "system-ui, sans-serif";
    const pad = 24;
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const w = layout.width + pad * 2;
    const h = layout.height + pad * 2;
    const edges = layout.nodes
      .filter((n) => n.parentId && laidById.has(n.parentId))
      .map((n) => `<path d="${edgePath(laidById.get(n.parentId!)!, n, size, vertical, dir === "rtl")}" fill="none" stroke="${line}" stroke-width="1.5"/>`)
      .join("");
    const boxes = layout.nodes
      .map((n) => {
        const label = esc(getLabel(n.data));
        const desc = getDescription?.(n.data);
        const dashed = isPlaceholder?.(n.data) ? ' stroke-dasharray="4 3"' : "";
        return `<g transform="translate(${n.x},${n.y})"><rect width="${size.width}" height="${size.height}" rx="10" fill="${surface}" stroke="${line}"${dashed}/><text x="14" y="${desc ? size.height / 2 - 4 : size.height / 2 + 5}" font-size="14" font-weight="600" fill="${fg}">${label}</text>${desc ? `<text x="14" y="${size.height / 2 + 14}" font-size="12" fill="${muted}">${esc(desc)}</text>` : ""}</g>`;
      })
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${esc(font)}"><rect width="100%" height="100%" fill="${scene}"/><g transform="translate(${pad},${pad})">${edges}${boxes}</g></svg>`;
  }, [layout, laidById, size, vertical, dir, getLabel, getDescription, isPlaceholder]);

  const exportPNG = React.useCallback(
    (scale = 2) =>
      new Promise<Blob>((resolve, reject) => {
        const svg = exportSVG();
        const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const g = canvas.getContext("2d");
          if (!g) return reject(new Error("Canvas unavailable"));
          g.scale(scale, scale);
          g.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png");
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("SVG could not be rendered"));
        };
        img.src = url;
      }),
    [exportSVG],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      fit: () => fit(),
      zoomIn: () => zoomBy(1.25),
      zoomOut: () => zoomBy(0.8),
      focusNode: focusNodeImpl,
      expandAll,
      collapseAll,
      toSVG: exportSVG,
      toPNG: exportPNG,
    }),
    [fit, zoomBy, focusNodeImpl, expandAll, collapseAll, exportSVG, exportPNG],
  );

  // ------------------------------------------------------------------ render
  const frameStyle = { height: typeof height === "number" ? `${height}px` : height } as React.CSSProperties;

  if (view === "list") {
    return (
      <div className={cn("vui-hierarchy-list w-full min-w-0 rounded-ui-lg border border-line bg-surface p-1.5", className)}>
        <TreeView
          aria-label={ariaLabel}
          data={toTreeData(nodes, byId, getLabel, getDescription, descendants)}
          expanded={nodes.filter((n) => childrenOf.has(n.id) && !collapsedSet.has(n.id)).map((n) => n.id)}
          onExpandedChange={(open) => setCollapsed(nodes.filter((n) => childrenOf.has(n.id) && !open.includes(n.id)).map((n) => n.id))}
          selected={selected ? [selected] : []}
          onSelectedChange={(ids) => setSelected(ids[0] ?? null)}
          filter={highlight}
          height={height}
        />
      </div>
    );
  }

  // Culling: only nodes in (or near) the visible rect, plus the focused / selected / dragged one.
  const culled = vp.w > 0 && layout.nodes.length > 150;
  const margin = 240 / tf.k;
  const rect = { x0: -tf.x / tf.k - margin, y0: -tf.y / tf.k - margin, x1: (vp.w - tf.x) / tf.k + margin, y1: (vp.h - tf.y) / tf.k + margin };
  const inView = (n: { x: number; y: number }) => !culled || (n.x + size.width >= rect.x0 && n.x <= rect.x1 && n.y + size.height >= rect.y0 && n.y <= rect.y1);
  const keep = new Set([tabId, selected, drag?.id].filter(Boolean) as string[]);
  const visible = order.filter((n) => inView(n) || keep.has(n.id));
  const selectedPath = new Set(selected ? [selected, ...ancestorsOf(selected)] : []);

  return (
    <div data-slot="hierarchy-chart" className={cn("relative w-full min-w-0", className)}>
      <div
        ref={viewportRef}
        role="group"
        aria-label={ariaLabel ? `${ariaLabel} · ${t("canvas")}` : t("canvas")}
        aria-describedby={instructionsId}
        aria-busy={loading || undefined}
        tabIndex={0}
        data-panning={panning ? "" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endGesture(e)}
        onPointerCancel={(e) => endGesture(e, true)}
        onKeyDown={onViewportKeyDown}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.stopPropagation();
            e.preventDefault();
            suppressClick.current = false;
          }
        }}
        className="vui-hierarchy focus-ring relative overflow-hidden rounded-ui-lg border border-line outline-none select-none"
        style={frameStyle}
      >
        <p id={instructionsId} className="sr-only">
          {t("instructions")}
        </p>
        {loading ? (
          <HierarchySkeleton label={t("loading")} />
        ) : layout.nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-fg-subtle">{empty ?? t("empty")}</div>
        ) : (
          <div
            className="vui-hierarchy-layer absolute top-0"
            data-animate={animate ? "" : undefined}
            onTransitionEnd={() => setAnimate(false)}
            // Canvas coordinates are physical (the layout already mirrors for RTL).
            style={{ width: layout.width, height: layout.height, left: 0, transform: `translate(${tf.x}px, ${tf.y}px) scale(${tf.k})` }}
          >
            <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={layout.width} height={layout.height}>
              {layout.nodes.map((n) => {
                if (!n.parentId) return null;
                const p = laidById.get(n.parentId);
                if (!p || (!inView(n) && !inView(p))) return null;
                return <path key={n.id} className="vui-hierarchy-edge" data-active={selectedPath.has(n.id) ? "" : undefined} d={edgePath(p, n, size, vertical, dir === "rtl")} />;
              })}
            </svg>
            <div role="tree" aria-label={ariaLabel} className="absolute inset-0">
              {visible.map((n) => {
                const isCollapsed = collapsedSet.has(n.id);
                const state: HierarchyNodeState = {
                  depth: n.depth,
                  childCount: n.childCount,
                  descendantCount: descendants.get(n.id) ?? 0,
                  collapsed: isCollapsed,
                  selected: selected === n.id,
                  matched: matches.has(n.id),
                  orientation,
                };
                return (
                  <HierarchyNodeShell
                    key={n.id}
                    n={n}
                    state={state}
                    size={size}
                    t={t}
                    label={getLabel(n.data)}
                    vertical={vertical}
                    rtl={dir === "rtl"}
                    tabbable={tabId === n.id}
                    placeholder={!!isPlaceholder?.(n.data)}
                    dragSource={drag?.id === n.id}
                    dropTarget={drag?.target === n.id ? (drag.reason ? "invalid" : "valid") : null}
                    countText={format.number(state.descendantCount)}
                    nodeRef={(el) => {
                      if (el) nodeRefs.current.set(n.id, el);
                      else nodeRefs.current.delete(n.id);
                    }}
                    onFocus={() => setFocusedId(n.id)}
                    onClick={() => {
                      setSelected(n.id);
                      setFocusedId(n.id);
                    }}
                    onKeyDown={(e) => onNodeKeyDown(e, n)}
                    onToggle={() => toggle(n.id)}
                    menu={
                      <NodeMenu
                        open={menuFor === n.id}
                        onOpenChange={(o) => setMenuFor(o ? n.id : null)}
                        label={getLabel(n.data)}
                        t={t}
                        hasKids={n.childCount > 0}
                        collapsed={isCollapsed}
                        onToggle={() => toggle(n.id)}
                        onCenter={() => centerOn(n.id)}
                        onChangeParent={onReparent ? () => setPickerFor(n.id) : undefined}
                        returnFocus={() => nodeRefs.current.get(n.id)?.focus({ preventScroll: true })}
                        extra={nodeMenu?.(n.data)}
                      />
                    }
                  >
                    {renderNode ? renderNode(n.data, state) : <HierarchyNodeCard title={getLabel(n.data)} subtitle={getDescription?.(n.data)} />}
                  </HierarchyNodeShell>
                );
              })}
            </div>
          </div>
        )}
        {drag ? (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute z-10 max-w-56 -translate-x-1/2 -translate-y-[130%] truncate rounded-ui-sm border px-2 py-1 text-xs font-medium shadow-(--popover-shadow)",
              drag.reason ? "border-danger bg-popover text-danger" : "border-line bg-popover text-fg",
            )}
            style={{ left: drag.x, top: drag.y }}
          >
            {drag.reason ?? getLabel(byId.get(drag.id)!)}
          </div>
        ) : null}
        {controls && !loading && layout.nodes.length > 0 ? (
          <div data-hierarchy-ui="" className="surface-popover absolute end-3 bottom-3 flex items-center gap-0.5 rounded-ui p-1">
            <IconButton label={t("zoomOut")} size="xs" tooltip={false} onClick={() => zoomBy(0.8)} disabled={tf.k <= MIN_K + 0.001}>
              <Minus />
            </IconButton>
            <output aria-live="off" aria-label={t("zoomLevel", { percent: format.percent(tf.k, { maximumFractionDigits: 0 }) })} className="tabular w-11 text-center text-xs text-fg-muted">
              {format.percent(tf.k, { maximumFractionDigits: 0 })}
            </output>
            <IconButton label={t("zoomIn")} size="xs" tooltip={false} onClick={() => zoomBy(1.25)} disabled={tf.k >= MAX_K - 0.001}>
              <Plus />
            </IconButton>
            <span aria-hidden className="mx-0.5 h-4 w-px bg-line" />
            <IconButton label={t("fit")} size="xs" tooltip={false} onClick={() => fit()}>
              <Maximize />
            </IconButton>
            <IconButton label={vertical ? t("horizontal") : t("vertical")} size="xs" tooltip={false} onClick={() => {
              setOrientation(vertical ? "horizontal" : "vertical");
              fitted.current = false;
            }}>
              {vertical ? <ArrowLeftRight /> : <ArrowUpDown />}
            </IconButton>
            <IconButton label={t("expandAll")} size="xs" tooltip={false} onClick={() => {
              expandAll();
              fitted.current = false;
            }}>
              <ChevronsUpDown />
            </IconButton>
            <IconButton label={t("collapseAll")} size="xs" tooltip={false} onClick={() => {
              collapseAll();
              fitted.current = false;
            }}>
              <ChevronsDownUp />
            </IconButton>
          </div>
        ) : null}
      </div>
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-slot="hierarchy-status">
        {status}
      </span>
      {onReparent ? (
        <ParentPicker
          nodeId={pickerFor}
          onClose={() => {
            const id = pickerFor;
            setPickerFor(null);
            if (id) requestAnimationFrame(() => nodeRefs.current.get(id)?.focus({ preventScroll: true }));
          }}
          nodes={nodes}
          getLabel={getLabel}
          getDescription={getDescription}
          check={checkReparent}
          currentParent={pickerFor ? (byId.get(pickerFor)?.parentId ?? null) : null}
          t={t}
          locale={locale}
          onPick={(pid) => {
            const id = pickerFor;
            setPickerFor(null);
            if (id) void reparent(id, pid);
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * ```tsx
 * <HierarchyChart
 *   aria-label="Organization"
 *   nodes={people}
 *   renderNode={(p) => <HierarchyPersonNode name={p.name} title={p.title} src={p.photo} />}
 * />
 * ```
 */
export const HierarchyChart = /*#__PURE__*/ React.forwardRef(HierarchyChartInner) as <T extends HierarchyNodeData>(
  props: HierarchyChartProps<T> & { ref?: React.Ref<HierarchyChartHandle> },
) => React.ReactElement;

function toTreeData<T extends HierarchyNodeData>(
  nodes: readonly T[],
  byId: Map<string, T>,
  getLabel: (n: T) => string,
  getDescription: ((n: T) => string | undefined) | undefined,
  descendants: Map<string, number>,
): TreeNode[] {
  const kids = new Map<string | null, T[]>();
  for (const n of nodes) {
    const p = n.parentId !== null && byId.has(n.parentId) ? n.parentId : null;
    const list = kids.get(p);
    if (list) list.push(n);
    else kids.set(p, [n]);
  }
  const build = (pid: string | null): TreeNode[] =>
    (kids.get(pid) ?? []).map((n) => {
      const ch = build(n.id);
      const d = descendants.get(n.id) ?? 0;
      return {
        id: n.id,
        label: getLabel(n),
        description: getDescription?.(n),
        badge: d > 0 ? <span className="tabular text-xs text-fg-subtle">{d}</span> : undefined,
        ...(ch.length ? { children: ch } : {}),
      };
    });
  return build(null);
}

// ---------------------------------------------------------------------------------------------
// Node shell (positioned treeitem + card frame + collapse chip)
// ---------------------------------------------------------------------------------------------

interface NodeShellProps<T> {
  n: LaidOut<T>;
  state: HierarchyNodeState;
  size: NodeSize;
  t: LabelFn<HierarchyChartLabels>;
  label: string;
  vertical: boolean;
  rtl: boolean;
  tabbable: boolean;
  placeholder: boolean;
  dragSource: boolean;
  dropTarget: "valid" | "invalid" | null;
  countText: string;
  nodeRef: (el: HTMLElement | null) => void;
  onFocus: () => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  onToggle: () => void;
  menu: React.ReactNode;
  children: React.ReactNode;
}

function HierarchyNodeShell<T>({ n, state, size, t, vertical, rtl, tabbable, placeholder, dragSource, dropTarget, countText, nodeRef, onFocus, onClick, onKeyDown, onToggle, menu, children }: NodeShellProps<T>) {
  const chipPos: React.CSSProperties = vertical
    ? { left: "50%", bottom: 0, transform: "translate(-50%, 50%)" }
    : rtl
      ? { left: 0, top: "50%", transform: "translate(-50%, -50%)" }
      : { right: 0, top: "50%", transform: "translate(50%, -50%)" };
  return (
    <div
      ref={nodeRef}
      role="treeitem"
      aria-level={n.depth + 1}
      aria-setsize={n.setsize}
      aria-posinset={n.posinset}
      aria-expanded={n.childCount > 0 ? !state.collapsed : undefined}
      aria-selected={state.selected}
      aria-keyshortcuts="Shift+F10"
      tabIndex={tabbable ? 0 : -1}
      data-node-id={n.id}
      data-selected={state.selected ? "" : undefined}
      data-match={state.matched ? "" : undefined}
      data-drag-source={dragSource ? "" : undefined}
      data-drop-target={dropTarget === "valid" ? "" : undefined}
      data-drop-invalid={dropTarget === "invalid" ? "" : undefined}
      onFocus={(e) => e.target === e.currentTarget && onFocus()}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="vui-hierarchy-node group/node absolute"
      style={{ left: n.x, top: n.y, width: size.width, height: size.height }}
    >
      <div
        data-slot="hierarchy-card"
        className={cn(
          "relative h-full overflow-hidden rounded-ui-lg border bg-surface text-fg shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-[box-shadow,background-color]",
          placeholder ? "border-dashed border-field-border-hover bg-surface-2" : "border-surface-border",
        )}
      >
        {children}
        <div data-hierarchy-ui="" className="absolute end-1 top-1 opacity-0 transition-opacity group-hover/node:opacity-100 group-focus-visible/node:opacity-100 group-data-[selected]/node:opacity-100 pointer-coarse:opacity-100 has-data-[state=open]:opacity-100">
          {menu}
        </div>
      </div>
      {n.childCount > 0 ? (
        <span
          aria-hidden
          data-hierarchy-ui=""
          data-slot="hierarchy-toggle"
          title={state.collapsed ? t("expand") : t("collapse")}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            "tabular absolute z-[1] inline-flex h-5 min-w-5 cursor-pointer items-center justify-center gap-0.5 rounded-full border px-1.5 text-[11px] font-medium shadow-sm transition-colors",
            state.collapsed ? "border-transparent bg-fg text-scene hover:opacity-90" : "border-line bg-surface text-fg-muted hover:text-fg",
          )}
          style={chipPos}
        >
          {state.collapsed ? (
            <>
              <Plus className="size-2.5" strokeWidth={3} />
              {countText}
            </>
          ) : (
            <ChevronUp className={cn("size-3", !vertical && (rtl ? "rotate-90" : "-rotate-90"))} />
          )}
        </span>
      ) : null}
      {state.collapsed && state.descendantCount > 0 ? <span className="sr-only">{t("hiddenCount", { count: state.descendantCount })}</span> : null}
    </div>
  );
}

function NodeMenu({
  open,
  onOpenChange,
  label,
  t,
  hasKids,
  collapsed,
  onToggle,
  onCenter,
  onChangeParent,
  returnFocus,
  extra,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  label: string;
  t: LabelFn<HierarchyChartLabels>;
  hasKids: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onCenter: () => void;
  onChangeParent?: () => void;
  returnFocus: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <IconButton label={t("nodeMenu", { node: label })} size="xs" tooltip={false} tabIndex={-1} className="size-6 bg-surface text-fg-subtle" onClick={(e) => e.stopPropagation()}>
          <Ellipsis />
        </IconButton>
      </DropdownMenuTrigger>
      {open ? (
        <DropdownMenuContent
          align="end"
          size="sm"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocus();
          }}
        >
          {hasKids ? (
            <DropdownMenuItem icon={collapsed ? <ChevronsUpDown /> : <ChevronsDownUp />} onSelect={onToggle}>
              {collapsed ? t("expand") : t("collapse")}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem icon={<Crosshair />} onSelect={onCenter}>
            {t("center")}
          </DropdownMenuItem>
          {onChangeParent ? (
            <DropdownMenuItem icon={<GitBranch />} onSelect={() => requestAnimationFrame(onChangeParent)}>
              {t("changeParent")}
            </DropdownMenuItem>
          ) : null}
          {extra ? (
            <>
              <DropdownMenuSeparator />
              {extra}
            </>
          ) : null}
        </DropdownMenuContent>
      ) : null}
    </DropdownMenu>
  );
}

function ParentPicker<T extends HierarchyNodeData>({
  nodeId,
  onClose,
  nodes,
  getLabel,
  getDescription,
  check,
  currentParent,
  t,
  locale,
  onPick,
}: {
  nodeId: string | null;
  onClose: () => void;
  nodes: readonly T[];
  getLabel: (n: T) => string;
  getDescription?: (n: T) => string | undefined;
  check: (id: string, pid: string) => true | string;
  currentParent: string | null;
  t: LabelFn<HierarchyChartLabels>;
  locale: string;
  onPick: (parentId: string) => void;
}) {
  const me = nodeId ? nodes.find((n) => n.id === nodeId) : undefined;
  const options = me ? nodes.filter((n) => n.id !== me.id && n.id !== currentParent) : [];
  return (
    <Dialog open={!!me} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="sm">
        <DialogHeader title={me ? t("changeParentTitle", { node: getLabel(me) }) : ""} description={t("changeParentDescription")} />
        <DialogBody flush>
          <Command label={t("searchNodes")} filter={(value, search) => (matchText(value, search, locale) ? 1 : 0)}>
            <CommandInput placeholder={t("searchNodes")} />
            <CommandList className="max-h-72">
              <CommandEmpty>{t("noMatches")}</CommandEmpty>
              {options.map((n) => {
                const ok = me ? check(me.id, n.id) : true;
                const desc = getDescription?.(n);
                return (
                  <CommandItem key={n.id} value={`${getLabel(n)} ${desc ?? ""} ${n.id}`} disabled={ok !== true} onSelect={() => onPick(n.id)}>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{getLabel(n)}</span>
                      <span className="truncate text-xs text-fg-subtle">{ok !== true ? ok : desc}</span>
                    </span>
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function HierarchySkeleton({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-10" aria-hidden={false}>
      <span className="sr-only">{label}</span>
      <Skeleton aria-hidden className="h-16 w-52 rounded-ui-lg" />
      <div aria-hidden className="flex gap-6">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-44 rounded-ui-lg" />
        ))}
      </div>
      <div aria-hidden className="flex gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-32 rounded-ui-lg" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Node content
// ---------------------------------------------------------------------------------------------

export interface HierarchyNodeCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Leading visual (icon, logo). */
  icon?: React.ReactNode;
  /** Trailing badge (tier, volume). */
  badge?: React.ReactNode;
  /** Bottom line (location, count). */
  meta?: React.ReactNode;
}

/** Generic node content: icon · title · subtitle · badge. */
export function HierarchyNodeCard({ title, subtitle, icon, badge, meta, className, ...props }: HierarchyNodeCardProps) {
  return (
    <div data-slot="hierarchy-node-card" className={cn("flex h-full min-w-0 items-center gap-2.5 px-3 pe-7", className)} {...props}>
      {icon ? <span className="inline-flex shrink-0 items-center text-fg-muted [&_svg]:size-4">{icon}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[13.5px] leading-tight font-semibold tracking-tight">{title}</span>
          {badge}
        </span>
        {subtitle ? <span className="truncate text-xs leading-snug text-fg-muted">{subtitle}</span> : null}
        {meta ? <span className="mt-0.5 truncate text-[11px] text-fg-subtle">{meta}</span> : null}
      </span>
    </div>
  );
}

export interface HierarchyPersonNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  title?: string;
  src?: string | null;
  /** Bottom line: department, location, team size. */
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  /** An open position: initials replaced by a dashed avatar, name muted. */
  vacant?: boolean;
}

/** Person node for org charts: Avatar · name · job title · meta. */
export function HierarchyPersonNode({ name, title, src, meta, badge, vacant, className, ...props }: HierarchyPersonNodeProps) {
  return (
    <div data-slot="hierarchy-person" className={cn("flex h-full min-w-0 items-center gap-3 px-3 pe-7", className)} {...props}>
      {vacant ? (
        <span aria-hidden className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-field-border-hover text-fg-subtle">
          <Plus className="size-4" />
        </span>
      ) : (
        <Avatar name={name} src={src} size="lg" />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className={cn("truncate text-[13.5px] leading-tight font-semibold tracking-tight", vacant && "text-fg-muted")}>{name}</span>
          {badge}
        </span>
        {title ? <span className="truncate text-xs leading-snug text-fg-muted">{title}</span> : null}
        {meta ? <span className="mt-0.5 truncate text-[11px] text-fg-subtle">{meta}</span> : null}
      </span>
    </div>
  );
}
