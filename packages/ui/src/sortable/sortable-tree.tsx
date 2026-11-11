"use client";

/**
 * SortableTree: a nested, reorderable tree (menu builder, category order, territory tree).
 * Tree view semantics (`role="tree"`, levels, roving focus, ←/→ expand and collapse) with
 * drag-to-move where the horizontal offset picks the depth, a max depth, a `canDrop` rule and a
 * Move menu (up / down / indent / outdent / move into…) so nothing requires dragging.
 */
import * as React from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  ArrowUpDown,
  ChevronRight,
  CornerDownRight,
  GripVertical,
  IndentDecrease,
  IndentIncrease,
  TriangleAlert,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { usePortalContainer } from "../lib/theme-scope";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { IconButton } from "../components/button";
import { toast } from "../components/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { moveTreeNode, projectTreeMove, type FlatTreeItem, type SortableTreeNode } from "./core";

// ---------------------------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------------------------

export const sortableTreeLabels = {
  instructions:
    "To pick up an item, press Space or Enter. Use the up and down arrow keys to move it, left and right to change its level, then press Space or Enter to drop it, or Escape to cancel.",
  pickedUp: "Picked up {item}. Level {level}, position {position} of {total}.",
  overRoot: "{item} will move to the top level, position {position}.",
  overParent: "{item} will move into {parent}, position {position}.",
  droppedRoot: "{item} dropped at the top level, position {position}.",
  droppedParent: "{item} dropped into {parent}, position {position}.",
  cancelled: "Moving {item} cancelled.",
  invalid: "{item} can't be dropped here: {reason}",
  maxDepth: "Max depth {max}",
  moveMenu: "Move {item}",
  moveUp: "Move up",
  moveDown: "Move down",
  moveTop: "Move to top",
  moveBottom: "Move to bottom",
  indent: "Indent",
  outdent: "Outdent",
  moveInto: "Move into…",
  topLevel: "Top level",
  moved: "{item} moved. Level {level}, position {position} of {total}.",
  moveFailed: "Couldn't move {item}",
  retry: "Retry",
  expand: "Expand",
  collapse: "Collapse",
  empty: "Nothing here yet",
};
export type SortableTreeLabels = typeof sortableTreeLabels;

// ---------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------

export interface SortableTreeMoveEvent {
  id: string;
  /** New parent (`null` = top level). */
  parentId: string | null;
  /** Index among the new siblings. */
  index: number;
  fromParentId: string | null;
  fromIndex: number;
}

export interface SortableTreeDropCheck extends SortableTreeMoveEvent {
  /** 0-based depth the item would land at. */
  depth: number;
}

export interface SortableTreeRenderState {
  depth: number;
  isDragging: boolean;
  /** Rendering the dragged clone. */
  overlay: boolean;
  expanded: boolean;
  childCount: number;
}

export interface SortableTreeProps<N extends SortableTreeNode> {
  nodes: readonly N[];
  /** Called once per drop or menu move. A returned promise keeps the move optimistic; a rejection rolls it back. */
  onMove: (event: SortableTreeMoveEvent) => void | Promise<void>;
  /** Spoken name and default row text. Default `label` / `title` / `name`. */
  getLabel?: (node: N) => string;
  /** Number of levels allowed (1 = flat). */
  maxDepth?: number;
  /** `true`, or the reason a drop is not allowed ("Pages can't go under a link"). */
  canDrop?: (check: SortableTreeDropCheck) => true | string;
  /** Fixed nodes: not draggable, no menu (they can still receive children). */
  disabled?: (node: N) => boolean;
  expanded?: string[];
  /** Default: every node with children. */
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** Indent per level in px. Default 24. */
  indent?: number;
  /** Vertical indent guides. Default `true`. */
  guides?: boolean;
  size?: "sm" | "md";
  /** Row content. Default: the label. */
  renderItem?: (node: N, state: SortableTreeRenderState) => React.ReactNode;
  /** Trailing buttons before the Move menu. */
  renderActions?: (node: N) => React.ReactNode;
  /** Move menu on every row. Default `true`. */
  moveMenu?: boolean;
  /** Shown when `nodes` is empty. */
  empty?: React.ReactNode;
  /** Id of the selected row (`aria-selected`). Only used together with `onSelect`. */
  selected?: string | null;
  /** Click or Enter on a row selects it (Space still picks it up for a keyboard move). */
  onSelect?: (node: N) => void;
  labels?: Partial<SortableTreeLabels>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

interface Info<N> {
  node: N;
  parentId: string | null;
  index: number;
  depth: number;
  siblings: number;
  /** Levels below this node (0 for a leaf). */
  height: number;
}

const defaultLabel = (n: unknown): string => {
  const o = n as Record<string, unknown>;
  const v = o.label ?? o.title ?? o.name;
  return typeof v === "string" ? v : String(o.id);
};

function indexTree<N extends SortableTreeNode>(nodes: readonly N[]): Map<string, Info<N>> {
  const out = new Map<string, Info<N>>();
  const walk = (list: readonly N[], parentId: string | null, depth: number): number => {
    let h = 0;
    list.forEach((n, index) => {
      const info: Info<N> = { node: n, parentId, index, depth, siblings: list.length, height: 0 };
      out.set(n.id, info);
      info.height = n.children?.length ? walk(n.children as N[], n.id, depth + 1) + 1 : 0;
      h = Math.max(h, info.height);
    });
    return h;
  };
  walk(nodes, null, 0);
  return out;
}

function flatten<N extends SortableTreeNode>(nodes: readonly N[], isOpen: (id: string) => boolean, skip: string | null): FlatTreeItem<N>[] {
  const out: FlatTreeItem<N>[] = [];
  const walk = (list: readonly N[], parentId: string | null, depth: number) => {
    list.forEach((node, index) => {
      out.push({ id: node.id, parentId, depth, index, node });
      if (node.children?.length && isOpen(node.id) && node.id !== skip) walk(node.children as N[], node.id, depth + 1);
    });
  };
  walk(nodes, null, 0);
  return out;
}

const allParents = (nodes: readonly SortableTreeNode[]): string[] => {
  const out: string[] = [];
  const walk = (list: readonly SortableTreeNode[]) => {
    for (const n of list) {
      if (n.children?.length) {
        out.push(n.id);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return out;
};

// ---------------------------------------------------------------------------------------------
// SortableTree
// ---------------------------------------------------------------------------------------------

/**
 * ```tsx
 * <SortableTree
 *   aria-label="Main menu"
 *   nodes={menu}
 *   maxDepth={3}
 *   onMove={(e) => setMenu((m) => moveTreeNode(m, e.id, e.parentId, e.index))}
 * />
 * ```
 */
export function SortableTree<N extends SortableTreeNode>(props: SortableTreeProps<N>) {
  const {
    nodes: nodesProp,
    onMove,
    getLabel = defaultLabel as (n: N) => string,
    maxDepth,
    canDrop,
    disabled,
    expanded: expandedProp,
    defaultExpanded,
    onExpandedChange,
    indent = 24,
    guides = true,
    size = "md",
    renderItem,
    renderActions,
    moveMenu = true,
    empty,
    selected,
    onSelect,
    labels,
    className,
    ...aria
  } = props;
  const t = useLabels("sortableTree", sortableTreeLabels, labels);
  const { dir } = useLocale();
  const reducedMotion = useReducedMotion();
  const portal = usePortalContainer();
  const dndId = React.useId();

  const [optimistic, setOptimistic] = React.useState<N[] | null>(null);
  const nodes = optimistic ?? nodesProp;
  const info = React.useMemo(() => indexTree(nodes), [nodes]);

  const [expanded, setExpanded] = useControllableState<string[]>({
    value: expandedProp,
    defaultValue: () => defaultExpanded ?? allParents(nodesProp),
    onChange: onExpandedChange,
    name: "SortableTree",
  });
  const openSet = React.useMemo(() => new Set(expanded), [expanded]);
  const setOpen = React.useCallback(
    (id: string, open: boolean) => setExpanded((prev) => (open ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id))),
    [setExpanded],
  );

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [offsetX, setOffsetX] = React.useState(0);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [menuId, setMenuId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("");
  const rowRefs = React.useRef(new Map<string, HTMLElement>());

  const flat = React.useMemo(() => flatten(nodes, (id) => openSet.has(id), activeId), [nodes, openSet, activeId]);
  const ids = React.useMemo(() => flat.map((f) => f.id), [flat]);

  const labelOf = React.useCallback((id: string) => {
    const n = info.get(id)?.node;
    return n ? getLabel(n) : id;
  }, [info, getLabel]);

  const checkDrop = React.useCallback(
    (id: string, parentId: string | null, index: number, depth: number): true | string => {
      const me = info.get(id);
      if (!me) return "?";
      if (maxDepth !== undefined && depth + me.height > maxDepth - 1) return t("maxDepth", { max: maxDepth });
      if (!canDrop) return true;
      return canDrop({ id, parentId, index, depth, fromParentId: me.parentId, fromIndex: me.index });
    },
    [info, maxDepth, canDrop, t],
  );

  const projection = React.useMemo(() => {
    if (!activeId || !overId) return null;
    const p = projectTreeMove(flat, activeId, overId, offsetX, indent, { maxDepth, dir });
    if (!p) return null;
    const ok = p.invalid ? t("maxDepth", { max: maxDepth ?? 0 }) : checkDrop(activeId, p.parentId, p.index, p.depth);
    return { ...p, reason: ok === true ? null : ok };
  }, [activeId, overId, flat, offsetX, indent, maxDepth, dir, checkDrop, t]);

  const announce = React.useCallback((msg: string) => {
    setStatus("");
    requestAnimationFrame(() => setStatus(msg));
  }, []);

  const latest = useLatest({ nodes, nodesProp, onMove, info, labelOf, projection, flat, t, setOpen });

  const commit = React.useCallback(
    async (id: string, parentId: string | null, index: number) => {
      const L = latest.current;
      const me = L.info.get(id);
      if (!me) return;
      if (me.parentId === parentId && me.index === index) return;
      const e: SortableTreeMoveEvent = { id, parentId, index, fromParentId: me.parentId, fromIndex: me.index };
      if (parentId) L.setOpen(parentId, true);
      const next = moveTreeNode(L.nodes as N[], id, parentId, index);
      const after = indexTree(next).get(id);
      if (after) announce(L.t("moved", { item: L.labelOf(id), level: after.depth + 1, position: after.index + 1, total: after.siblings }));
      setFocusedId(id);
      const result = L.onMove(e);
      if (result && typeof (result as Promise<void>).then === "function") {
        setOptimistic(next);
        try {
          await result;
        } catch {
          toast.danger(L.t("moveFailed", { item: L.labelOf(id) }), { action: { label: L.t("retry"), onClick: () => void commitRef.current(id, parentId, index) } });
        } finally {
          setOptimistic(null);
        }
      }
      requestAnimationFrame(() => rowRefs.current.get(id)?.focus());
    },
    [latest, announce],
  );
  const commitRef = React.useRef(commit);
  commitRef.current = commit;

  // Keyboard: ↑/↓ over rows (sortable), ←/→ change depth by one indent (mirrored by projection in RTL).
  const coordinateGetter = React.useMemo<KeyboardCoordinateGetter>(
    () => (event, args) => {
      if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
        event.preventDefault();
        const sign = event.code === "ArrowRight" ? 1 : -1;
        return { ...args.currentCoordinates, x: args.currentCoordinates.x + sign * indent };
      }
      return sortableKeyboardCoordinates(event, args);
    },
    [indent],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter }),
  );

  const setDragging = (on: boolean) => {
    if (typeof document === "undefined") return;
    if (on) document.documentElement.setAttribute("data-dragging", "");
    else document.documentElement.removeAttribute("data-dragging");
  };

  const reset = () => {
    setActiveId(null);
    setOverId(null);
    setOffsetX(0);
    setDragging(false);
  };

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    setActiveId(id);
    setOverId(id);
    setFocusedId(id);
    setMenuId(null);
    setDragging(true);
  };
  const onDragMove = (e: DragMoveEvent) => setOffsetX(e.delta.x);
  const onDragOver = (e: DragOverEvent) => setOverId(e.over ? String(e.over.id) : null);
  const onDragEnd = () => {
    const p = projection;
    const id = activeId;
    reset();
    if (!id || !p) return;
    if (p.reason) {
      announce(t("invalid", { item: labelOf(id), reason: p.reason }));
      return;
    }
    void commit(id, p.parentId, p.index);
  };

  const announcements = React.useMemo<Announcements>(() => {
    const where = (id: string) => {
      const L = latest.current;
      const p = L.projection;
      if (!p) return undefined;
      const item = L.labelOf(id);
      if (p.reason) return L.t("invalid", { item, reason: p.reason });
      return p.parentId
        ? { parent: L.labelOf(p.parentId), position: p.index + 1, item }
        : { position: p.index + 1, item };
    };
    return {
      onDragStart: ({ active }) => {
        const L = latest.current;
        const me = L.info.get(String(active.id));
        return L.t("pickedUp", { item: L.labelOf(String(active.id)), level: (me?.depth ?? 0) + 1, position: (me?.index ?? 0) + 1, total: me?.siblings ?? 0 });
      },
      onDragMove: ({ active }) => {
        const w = where(String(active.id));
        if (!w) return undefined;
        if (typeof w === "string") return w;
        return "parent" in w ? latest.current.t("overParent", w) : latest.current.t("overRoot", w);
      },
      onDragOver: () => undefined,
      onDragEnd: ({ active }) => {
        const w = where(String(active.id));
        if (!w) return undefined;
        if (typeof w === "string") return w;
        return "parent" in w ? latest.current.t("droppedParent", w) : latest.current.t("droppedRoot", w);
      },
      onDragCancel: ({ active }) => latest.current.t("cancelled", { item: latest.current.labelOf(String(active.id)) }),
    };
  }, [latest]);

  // Roving focus target.
  const tabId = focusedId && ids.includes(focusedId) ? focusedId : (ids[0] ?? null);

  const focusRow = (id: string | undefined) => {
    if (!id) return;
    setFocusedId(id);
    rowRefs.current.get(id)?.focus();
  };

  const opsFor = React.useCallback(
    (id: string) => {
      const me = info.get(id)!;
      const parent = me.parentId ? info.get(me.parentId) : undefined;
      const siblingsOf = (pid: string | null) => (pid ? ((info.get(pid)?.node.children ?? []) as N[]) : (nodes as N[]));
      const sibs = siblingsOf(me.parentId);
      const prev = sibs[me.index - 1];
      const ok = (pid: string | null, index: number, depth: number) => checkDrop(id, pid, index, depth);
      return {
        up: me.index > 0 ? { parentId: me.parentId, index: me.index - 1, ok: ok(me.parentId, me.index - 1, me.depth) } : null,
        down: me.index < me.siblings - 1 ? { parentId: me.parentId, index: me.index + 1, ok: ok(me.parentId, me.index + 1, me.depth) } : null,
        top: me.index > 0 ? { parentId: me.parentId, index: 0, ok: ok(me.parentId, 0, me.depth) } : null,
        bottom: me.index < me.siblings - 1 ? { parentId: me.parentId, index: me.siblings - 1, ok: ok(me.parentId, me.siblings - 1, me.depth) } : null,
        indent: prev ? { parentId: prev.id, index: prev.children?.length ?? 0, ok: ok(prev.id, prev.children?.length ?? 0, me.depth + 1) } : null,
        outdent: parent ? { parentId: parent.parentId, index: parent.index + 1, ok: ok(parent.parentId, parent.index + 1, parent.depth) } : null,
      };
    },
    [info, nodes, checkDrop],
  );

  const onRowKeyDown = (e: React.KeyboardEvent<HTMLElement>, f: FlatTreeItem<N>, dndKeyDown?: React.KeyboardEventHandler<HTMLElement>) => {
    if (activeId) return;
    if (e.target !== e.currentTarget) return;
    const i = ids.indexOf(f.id);
    const hasKids = !!f.node.children?.length;
    const open = openSet.has(f.id);
    const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === fwd || e.key === back)) {
      e.preventDefault();
      const ops = opsFor(f.id);
      const op = e.key === "ArrowUp" ? ops.up : e.key === "ArrowDown" ? ops.down : e.key === fwd ? ops.indent : ops.outdent;
      if (op && op.ok === true) void commit(f.id, op.parentId, op.index);
      else if (op && op.ok !== true) announce(t("invalid", { item: labelOf(f.id), reason: op.ok }));
      return;
    }
    if (e.key === "Enter" && onSelect && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      onSelect(f.node);
      return;
    }
    if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
      e.preventDefault();
      setMenuId(f.id);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusRow(ids[i + 1]);
        return;
      case "ArrowUp":
        e.preventDefault();
        focusRow(ids[i - 1]);
        return;
      case "Home":
        e.preventDefault();
        focusRow(ids[0]);
        return;
      case "End":
        e.preventDefault();
        focusRow(ids[ids.length - 1]);
        return;
      case fwd:
        e.preventDefault();
        if (hasKids && !open) setOpen(f.id, true);
        else if (hasKids) focusRow(ids[i + 1]);
        return;
      case back:
        e.preventDefault();
        if (hasKids && open) setOpen(f.id, false);
        else if (f.parentId) focusRow(f.parentId);
        return;
      case "*": {
        e.preventDefault();
        const sibs = flat.filter((x) => x.parentId === f.parentId && x.node.children?.length).map((x) => x.id);
        setExpanded((prev) => Array.from(new Set([...prev, ...sibs])));
        return;
      }
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== " ") {
      const ch = e.key.toLocaleLowerCase();
      const order = [...ids.slice(i + 1), ...ids.slice(0, i + 1)];
      const hit = order.find((id) => labelOf(id).toLocaleLowerCase().startsWith(ch));
      if (hit) {
        e.preventDefault();
        focusRow(hit);
      }
      return;
    }
    dndKeyDown?.(e);
  };

  if (nodes.length === 0) {
    return <div data-slot="sortable-tree-empty">{empty ?? <p className="px-3 py-6 text-center text-sm text-fg-subtle">{t("empty")}</p>}</div>;
  }

  const activeInfo = activeId ? info.get(activeId) : undefined;

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={reset}
      accessibility={{ announcements, screenReaderInstructions: { draggable: t("instructions") } }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          role="tree"
          data-slot="sortable-tree"
          data-size={size}
          className={cn("vui-sortable-tree flex min-w-0 flex-col gap-px", className)}
          style={{ "--tree-indent": `${indent}px` } as React.CSSProperties}
          {...aria}
        >
          {flat.map((f) => {
            const me = info.get(f.id)!;
            const isActive = f.id === activeId;
            const depth = isActive && projection ? projection.depth : f.depth;
            return (
              <TreeRow
                key={f.id}
                item={f}
                depth={depth}
                info={me}
                t={t}
                label={labelOf(f.id)}
                expanded={openSet.has(f.id)}
                onToggle={() => setOpen(f.id, !openSet.has(f.id))}
                tabbable={tabId === f.id}
                onFocus={() => setFocusedId(f.id)}
                onKeyDown={onRowKeyDown}
                selected={onSelect ? selected === f.id : undefined}
                onSelect={onSelect ? () => onSelect(f.node) : undefined}
                rowRef={(el) => {
                  if (el) rowRefs.current.set(f.id, el);
                  else rowRefs.current.delete(f.id);
                }}
                disabled={!!disabled?.(f.node)}
                invalid={isActive && !!projection?.reason}
                guides={guides}
                indent={indent}
                size={size}
                reducedMotion={reducedMotion}
                renderItem={renderItem}
                actions={renderActions?.(f.node)}
                menu={
                  moveMenu && !disabled?.(f.node) ? (
                    <TreeMoveMenu
                      id={f.id}
                      label={labelOf(f.id)}
                      t={t}
                      open={menuId === f.id}
                      onOpenChange={(o) => setMenuId(o ? f.id : null)}
                      ops={menuId === f.id ? opsFor(f.id) : null}
                      targets={menuId === f.id ? intoTargets(f.id, info, nodes, labelOf, checkDrop) : []}
                      onMove={(pid, index) => void commit(f.id, pid, index)}
                      returnFocus={() => rowRefs.current.get(f.id)?.focus()}
                    />
                  ) : null
                }
              />
            );
          })}
        </div>
      </SortableContext>
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-slot="sortable-status">
        {status}
      </span>
      {typeof document !== "undefined"
        ? createPortal(
            <DragOverlay dropAnimation={reducedMotion ? null : { duration: 160, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }} zIndex={1000}>
              {activeId && activeInfo ? (
                <div className="vui-sortable-overlay">
                  <div
                    data-invalid={projection?.reason ? "" : undefined}
                    className={cn(
                      "vui-sortable-clone vui-tree-clone flex min-w-56 items-center gap-1.5 rounded-ui border border-line px-2 text-sm",
                      size === "sm" ? "h-8" : "h-9",
                    )}
                  >
                    <GripVertical aria-hidden className="size-4 text-fg-subtle" />
                    <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
                      {renderItem ? renderItem(activeInfo.node, { depth: projection?.depth ?? activeInfo.depth, isDragging: true, overlay: true, expanded: false, childCount: activeInfo.node.children?.length ?? 0 }) : labelOf(activeId)}
                    </span>
                    {activeInfo.node.children?.length ? (
                      <span className="tabular rounded-full bg-selected px-1.5 text-[11px] text-fg-muted">+{countDescendants(activeInfo.node)}</span>
                    ) : null}
                    {projection?.reason ? (
                      <span className="inline-flex items-center gap-1 text-xs text-danger">
                        <TriangleAlert aria-hidden className="size-3.5" />
                        {projection.reason}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </DragOverlay>,
            portal ?? document.body,
          )
        : null}
    </DndContext>
  );
}

function countDescendants(n: SortableTreeNode): number {
  return (n.children ?? []).reduce((acc, c) => acc + 1 + countDescendants(c), 0);
}

function intoTargets<N extends SortableTreeNode>(
  id: string,
  info: Map<string, Info<N>>,
  nodes: readonly N[],
  labelOf: (id: string) => string,
  check: (id: string, parentId: string | null, index: number, depth: number) => true | string,
) {
  const me = info.get(id)!;
  const banned = new Set([id]);
  const mark = (n: SortableTreeNode) => n.children?.forEach((c) => (banned.add(c.id), mark(c)));
  mark(me.node);
  const out: { id: string | null; label: string; depth: number; index: number; ok: true | string }[] = [];
  if (me.parentId !== null) out.push({ id: null, label: "", depth: -1, index: nodes.length, ok: check(id, null, nodes.length, 0) });
  for (const [nid, i] of info) {
    if (banned.has(nid) || nid === me.parentId) continue;
    const index = i.node.children?.length ?? 0;
    out.push({ id: nid, label: labelOf(nid), depth: i.depth, index, ok: check(id, nid, index, i.depth + 1) });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------------------------

interface TreeRowProps<N extends SortableTreeNode> {
  item: FlatTreeItem<N>;
  depth: number;
  info: Info<N>;
  t: LabelFn<SortableTreeLabels>;
  label: string;
  expanded: boolean;
  onToggle: () => void;
  tabbable: boolean;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>, f: FlatTreeItem<N>, dnd?: React.KeyboardEventHandler<HTMLElement>) => void;
  selected?: boolean;
  onSelect?: () => void;
  rowRef: (el: HTMLElement | null) => void;
  disabled: boolean;
  invalid: boolean;
  guides: boolean;
  indent: number;
  size: "sm" | "md";
  reducedMotion: boolean;
  renderItem?: (node: N, state: SortableTreeRenderState) => React.ReactNode;
  actions?: React.ReactNode;
  menu: React.ReactNode;
}

function TreeRow<N extends SortableTreeNode>(p: TreeRowProps<N>) {
  const { item, depth, info, t, label, expanded, onToggle, tabbable, disabled, invalid, guides, indent, size, reducedMotion } = p;
  const s = useSortable({
    id: item.id,
    disabled,
    transition: reducedMotion ? null : { duration: 160, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  });
  const labelId = React.useId();
  const hasKids = !!item.node.children?.length;
  const childCount = item.node.children?.length ?? 0;
  const { role: _r, tabIndex: _ti, "aria-pressed": _ap, "aria-roledescription": _rd, ...attrs } = s.attributes as typeof s.attributes & { "aria-pressed"?: boolean };
  const listeners = (s.listeners ?? {}) as Record<string, React.EventHandler<React.SyntheticEvent>>;
  const { onKeyDown: dndKeyDown, ...pointerListeners } = listeners;
  return (
    <div
      ref={(el) => {
        s.setNodeRef(el);
        s.setActivatorNodeRef(el);
        p.rowRef(el);
      }}
      role="treeitem"
      aria-level={item.depth + 1}
      aria-setsize={info.siblings}
      aria-posinset={info.index + 1}
      aria-expanded={hasKids ? expanded : undefined}
      aria-labelledby={labelId}
      aria-disabled={disabled || undefined}
      aria-selected={p.selected}
      tabIndex={tabbable ? 0 : -1}
      aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight Shift+F10"
      {...(attrs as React.HTMLAttributes<HTMLDivElement>)}
      {...(disabled ? {} : (pointerListeners as React.HTMLAttributes<HTMLDivElement>))}
      onKeyDown={(e) => p.onKeyDown(e, item, disabled ? undefined : (dndKeyDown as React.KeyboardEventHandler<HTMLElement>))}
      onFocus={(e) => {
        if (e.target === e.currentTarget) p.onFocus();
      }}
      onClick={
        p.onSelect
          ? (e) => {
              // The expand toggle, row actions and the Move menu keep their own click.
              if ((e.target as HTMLElement).closest('button, a, input, [data-slot="sortable-tree-toggle"]')) return;
              p.onSelect?.();
            }
          : undefined
      }
      data-slot="sortable-tree-item"
      data-selected={p.selected ? "" : undefined}
      data-depth={depth}
      data-dragging={s.isDragging ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      style={{ transform: CSS.Translate.toString(s.transform), transition: reducedMotion ? undefined : s.transition, paddingInlineStart: depth * indent, "--depth-px": `${depth * indent}px` } as React.CSSProperties}
      className={cn(
        "vui-tree-row group/row relative flex min-w-0 items-center gap-1 rounded-ui-sm pe-1 text-fg outline-none",
        "transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]",
        size === "sm" ? "h-8 text-[13px]" : "h-9 text-sm",
        !disabled && "cursor-grab active:cursor-grabbing",
      )}
    >
      {guides && !s.isDragging
        ? Array.from({ length: depth }, (_, l) => (
            <span key={l} aria-hidden data-slot="sortable-tree-guide" className="pointer-events-none absolute inset-y-0 w-px bg-line" style={{ insetInlineStart: l * indent + 12 }} />
          ))
        : null}
      {s.isDragging ? <span aria-hidden data-slot="sortable-tree-indicator" className="vui-tree-indicator" /> : null}
      <span className="inline-flex size-6 shrink-0 items-center justify-center">
        {hasKids ? (
          <span
            aria-hidden
            data-slot="sortable-tree-toggle"
            onClick={onToggle}
            onMouseDown={(e) => e.stopPropagation()}
            title={expanded ? t("collapse") : t("expand")}
            className="inline-flex size-6 cursor-pointer items-center justify-center rounded-ui-sm text-fg-subtle hover:bg-hover hover:text-fg"
          >
            <ChevronRight className={cn("size-3.5 transition-transform motion-reduce:transition-none rtl:-scale-x-100", expanded && "rotate-90 rtl:rotate-90")} />
          </span>
        ) : null}
      </span>
      {disabled ? (
        <span aria-hidden className="w-4 shrink-0" />
      ) : (
        <GripVertical aria-hidden className="size-4 shrink-0 text-fg-subtle opacity-50 transition-opacity group-hover/row:opacity-100 group-focus-visible/row:opacity-100" />
      )}
      <span id={labelId} className="flex min-w-0 flex-1 items-center gap-2 ps-1">
        {p.renderItem ? p.renderItem(item.node, { depth, isDragging: s.isDragging, overlay: false, expanded, childCount }) : <span className="truncate">{label}</span>}
      </span>
      {p.actions}
      {p.menu}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Move menu
// ---------------------------------------------------------------------------------------------

type Op = { parentId: string | null; index: number; ok: true | string } | null;

interface TreeMoveMenuProps {
  id: string;
  label: string;
  t: LabelFn<SortableTreeLabels>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ops: { up: Op; down: Op; top: Op; bottom: Op; indent: Op; outdent: Op } | null;
  targets: { id: string | null; label: string; depth: number; index: number; ok: true | string }[];
  onMove: (parentId: string | null, index: number) => void;
  returnFocus: () => void;
}

function TreeMoveMenu({ label, t, open, onOpenChange, ops, targets, onMove, returnFocus }: TreeMoveMenuProps) {
  const item = (op: Op, text: string, icon: React.ReactNode, shortcut?: string) => (
    <DropdownMenuItem
      icon={icon}
      disabled={!op || op.ok !== true}
      description={op && op.ok !== true ? op.ok : undefined}
      shortcut={shortcut}
      onSelect={() => op && onMove(op.parentId, op.index)}
    >
      {text}
    </DropdownMenuItem>
  );
  return (
    <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <IconButton
          label={t("moveMenu", { item: label })}
          size="xs"
          tooltip={false}
          tabIndex={-1}
          data-slot="sortable-move-menu"
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-fg-subtle opacity-60 group-hover/row:opacity-100 group-focus-visible/row:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
        >
          <ArrowUpDown />
        </IconButton>
      </DropdownMenuTrigger>
      {open && ops ? (
        <DropdownMenuContent
          align="end"
          size="sm"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocus();
          }}
        >
          {item(ops.up, t("moveUp"), <ArrowUp />, "alt+up")}
          {item(ops.down, t("moveDown"), <ArrowDown />, "alt+down")}
          {item(ops.top, t("moveTop"), <ArrowUpToLine />)}
          {item(ops.bottom, t("moveBottom"), <ArrowDownToLine />)}
          <DropdownMenuSeparator />
          {item(ops.indent, t("indent"), <IndentIncrease className="rtl:-scale-x-100" />, "alt+right")}
          {item(ops.outdent, t("outdent"), <IndentDecrease className="rtl:-scale-x-100" />, "alt+left")}
          {targets.length > 0 ? (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger icon={<CornerDownRight className="rtl:-scale-x-100" />}>{t("moveInto")}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent size="sm" className="max-h-72 overflow-y-auto">
                {targets.map((x) => (
                  <DropdownMenuItem
                    key={x.id ?? "__root"}
                    disabled={x.ok !== true}
                    description={x.ok !== true ? x.ok : undefined}
                    onSelect={() => onMove(x.id, x.index)}
                    style={{ paddingInlineStart: `calc(0.5rem + ${Math.max(0, x.depth) * 12}px)` }}
                  >
                    {x.id === null ? t("topLevel") : x.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : null}
        </DropdownMenuContent>
      ) : null}
    </DropdownMenu>
  );
}
