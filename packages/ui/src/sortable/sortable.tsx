"use client";

/**
 * Sortable: the kit's reordering primitive. A drag-and-drop engine (dnd-kit) is wrapped behind
 * kit-owned props, so no engine type appears in the public API and the engine can be swapped.
 *
 * - Pointer, touch (long press) and keyboard dragging (Space / Enter lifts, arrows move,
 *   Space / Enter drops, Esc cancels).
 * - Localized screen-reader announcements ("Picked up About us. Position 2 of 6.").
 * - A Move menu on every item: the single-pointer, non-drag alternative (WCAG 2.2 · 2.5.7).
 * - Single list, grid, or several containers (boards).
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
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
  type Modifier,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToHorizontalAxis, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowUpDown, ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine, CornerDownRight } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { usePortalContainer } from "../lib/theme-scope";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { useLatest } from "../lib/use-controllable-state";
import { IconButton } from "../components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { arrayMove, findContainer, moveBetweenContainers, moveTargetIndex, type ContainerState, type MoveOp } from "./core";

// ---------------------------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------------------------

export const sortableLabels = {
  handle: "Reorder {item}",
  roleDescription: "sortable",
  instructions:
    "To pick up an item, press Space or Enter. Use the arrow keys to move it, then press Space or Enter to drop it, or Escape to cancel.",
  pickedUp: "Picked up {item}. Position {position} of {total}.",
  movedOver: "{item} moved to position {position} of {total}.",
  movedToContainer: "{item} moved to {container}, position {position} of {total}.",
  dropped: "{item} dropped at position {position} of {total}.",
  droppedInContainer: "{item} dropped in {container} at position {position} of {total}.",
  cancelled: "Moving {item} cancelled. It is back at position {position} of {total}.",
  moveMenu: "Move {item}",
  moveUp: "Move up",
  moveDown: "Move down",
  moveTop: "Move to top",
  moveBottom: "Move to bottom",
  moveEarlier: "Move earlier",
  moveLater: "Move later",
  moveStart: "Move to start",
  moveEnd: "Move to end",
  moveTo: "Move to {container}",
  moveToHeading: "Move to list",
  dropHere: "Drop items here",
};
export type SortableLabels = typeof sortableLabels;

// ---------------------------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------------------------

export type SortableOrientation = "vertical" | "horizontal" | "grid";

/** A list inside a multi-container Sortable (a board column, a "Selected" / "Available" pair). */
export interface SortableContainerSpec {
  id: string;
  /** Spoken in announcements and shown in the Move menu ("In review"). */
  label?: string;
  /** Item ids in order. */
  items: string[];
}

export interface SortableMoveEvent {
  id: string;
  from: number;
  to: number;
}

export interface SortableMoveBetweenEvent {
  id: string;
  /** Container ids. Equal when the item was reordered within its container. */
  from: string;
  to: string;
  /** Final index in `to`. */
  index: number;
  /** Index in `from` before the move. */
  fromIndex: number;
}

interface RootContextValue {
  handle: boolean;
  orientation: SortableOrientation;
  t: LabelFn<SortableLabels>;
  labelOf(id: string): string;
  isDisabled(id: string): boolean;
  activeId: string | null;
  hasOverlay: boolean;
  registerOverlay(): () => void;
  multi: boolean;
  /** Live (preview) containers in multi mode. */
  containers: ContainerState[];
  containerLabel(id: string): string;
  ids: string[];
  /** Move-menu move: within the list (`op`) or to another container. */
  move(id: string, target: MoveOp | { container: string; index?: number }): void;
  positionOf(id: string): { index: number; total: number; container?: string };
  renderOverlay?: (id: string) => React.ReactNode;
  reducedMotion: boolean;
}

const SortableRootContext = /*#__PURE__*/ React.createContext<RootContextValue | null>(null);

function useSortableRoot(component: string): RootContextValue {
  const ctx = React.useContext(SortableRootContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Sortable>.`);
  return ctx;
}

/** Id of the item being dragged, or `null`. For virtualized lists (`keepMountedRange`). */
export function useSortableActiveId(): string | null {
  return React.useContext(SortableRootContext)?.activeId ?? null;
}

// ---------------------------------------------------------------------------------------------
// Keyboard coordinates (orientation-aware; arrows follow the visual layout, so they mirror in RTL)
// ---------------------------------------------------------------------------------------------

function keyboardCoordinates(orientation: SortableOrientation): KeyboardCoordinateGetter {
  return (event, args) => {
    const code = event.code;
    if (orientation === "vertical" && (code === "ArrowLeft" || code === "ArrowRight")) return undefined;
    if (orientation === "horizontal" && (code === "ArrowUp" || code === "ArrowDown")) return undefined;
    return sortableKeyboardCoordinates(event, args);
  };
}

const MODIFIERS: Record<SortableOrientation, Modifier[]> = {
  vertical: [restrictToVerticalAxis],
  horizontal: [restrictToHorizontalAxis],
  grid: [],
};
const STRATEGY = { vertical: verticalListSortingStrategy, horizontal: horizontalListSortingStrategy, grid: rectSortingStrategy };

// ---------------------------------------------------------------------------------------------
// Sortable (root)
// ---------------------------------------------------------------------------------------------

export interface SortableProps<T> {
  items: readonly T[];
  /** Stable id of an item. Default: `item.id`, or the item itself for strings. */
  getId?: (item: T) => string;
  /** Spoken name of an item. Default: `label` / `title` / `name`, then the id. */
  getLabel?: (item: T) => string;
  /** Single-list reorder. Called with the reordered array. */
  onReorder?: (next: T[], event: SortableMoveEvent) => void;
  /** `"grid"` uses 2-D keyboard movement and rect sorting. Default `"vertical"`. */
  orientation?: SortableOrientation;
  /** Drag only from a `SortableHandle`. Default `true`. */
  handle?: boolean;
  disabled?: boolean | ((item: T) => boolean);
  /** Multi-container mode: lists of item ids. `items` must contain every item. */
  containers?: SortableContainerSpec[];
  /** Multi-container mode: called once on drop (also for moves within one container). */
  onMoveBetween?: (event: SortableMoveBetweenEvent) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string, cancelled: boolean) => void;
  /** Built-in strings (announcements, Move menu). */
  labels?: Partial<SortableLabels>;
  /** Default overlay content for `<SortableOverlay/>` without children. */
  renderOverlay?: (item: T) => React.ReactNode;
  children?: React.ReactNode;
}

const defaultGetId = (item: unknown): string =>
  typeof item === "string" ? item : typeof item === "number" ? String(item) : String((item as { id?: unknown }).id);
const defaultGetLabel = (item: unknown): string | undefined => {
  if (typeof item === "string") return item;
  const o = item as Record<string, unknown> | null;
  const v = o && (o.label ?? o.title ?? o.name);
  return typeof v === "string" ? v : undefined;
};

/**
 * Context, sensors and announcements for reordering. Renders no DOM of its own besides a
 * visually hidden live region for Move-menu moves.
 *
 * ```tsx
 * <Sortable items={pages} onReorder={setPages}>
 *   {pages.map((p) => (
 *     <SortableItem key={p.id} id={p.id}><SortableHandle /> {p.title}</SortableItem>
 *   ))}
 *   <SortableOverlay />
 * </Sortable>
 * ```
 */
export function Sortable<T>(props: SortableProps<T>) {
  const {
    items,
    getId = defaultGetId,
    getLabel,
    onReorder,
    orientation = "vertical",
    handle = true,
    disabled,
    containers,
    onMoveBetween,
    onDragStart,
    onDragEnd,
    labels,
    renderOverlay,
    children,
  } = props;
  const t = useLabels("sortable", sortableLabels, labels);
  const reducedMotion = useReducedMotion();
  const multi = !!containers;

  const byId = React.useMemo(() => {
    const m = new Map<string, T>();
    for (const it of items) m.set(getId(it), it);
    return m;
  }, [items, getId]);
  const ids = React.useMemo(() => items.map(getId), [items, getId]);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [live, setLive] = React.useState<ContainerState[] | null>(null);
  const [overlayCount, setOverlayCount] = React.useState(0);
  const [status, setStatus] = React.useState("");
  const snapshot = React.useRef<ContainerState[] | null>(null);
  const movedRef = React.useRef(false);
  // Stable across server and client render (the engine's own counter is not).
  const dndId = React.useId();

  const baseContainers = React.useMemo<ContainerState[]>(() => (containers ?? []).map((c) => ({ id: c.id, items: c.items })), [containers]);
  const current = live ?? baseContainers;
  const containerLabelMap = React.useMemo(() => new Map((containers ?? []).map((c) => [c.id, c.label ?? c.id])), [containers]);

  const labelOf = React.useCallback(
    (id: string) => {
      const it = byId.get(id);
      if (it === undefined) return containerLabelMap.get(id) ?? id;
      return (getLabel ? getLabel(it) : defaultGetLabel(it)) ?? id;
    },
    [byId, getLabel, containerLabelMap],
  );
  const isDisabled = React.useCallback(
    (id: string) => {
      if (typeof disabled === "function") {
        const it = byId.get(id);
        return it !== undefined && disabled(it);
      }
      return !!disabled;
    },
    [disabled, byId],
  );

  const positionOf = React.useCallback(
    (id: string, state: ContainerState[] = current) => {
      if (multi) {
        const c = findContainer(state, id);
        if (!c) return { index: -1, total: 0 };
        return { index: c.id === id ? c.items.length : c.items.indexOf(id), total: c.items.length, container: c.id };
      }
      return { index: ids.indexOf(id), total: ids.length };
    },
    [multi, current, ids],
  );

  // Refs for dnd-kit callbacks (announcements are read on demand).
  const latest = useLatest({ positionOf, labelOf, current, ids, items, byId, onReorder, onMoveBetween, multi, containerLabelMap, t });

  const announce = React.useCallback((msg: string) => {
    // Re-set so identical consecutive messages are spoken again.
    setStatus("");
    requestAnimationFrame(() => setStatus(msg));
  }, []);

  const move = React.useCallback<RootContextValue["move"]>(
    (id, target) => {
      const L = latest.current;
      if (L.multi) {
        const from = findContainer(L.current, id);
        if (!from) return;
        const fromIndex = from.items.indexOf(id);
        let toId = from.id;
        let index: number;
        if (typeof target === "string") {
          const to = moveTargetIndex(fromIndex, from.items.length, target);
          if (to === null) return;
          index = to;
        } else {
          toId = target.container;
          const dest = L.current.find((c) => c.id === toId);
          if (!dest) return;
          index = target.index ?? (toId === from.id ? from.items.length - 1 : dest.items.length);
        }
        L.onMoveBetween?.({ id, from: from.id, to: toId, index, fromIndex });
        const total = toId === from.id ? from.items.length : (L.current.find((c) => c.id === toId)?.items.length ?? 0) + 1;
        announce(
          toId === from.id
            ? L.t("movedOver", { item: L.labelOf(id), position: index + 1, total })
            : L.t("movedToContainer", { item: L.labelOf(id), container: L.containerLabelMap.get(toId) ?? toId, position: index + 1, total }),
        );
        return;
      }
      if (typeof target !== "string") return;
      const from = L.ids.indexOf(id);
      const to = from === -1 ? null : moveTargetIndex(from, L.ids.length, target);
      if (to === null) return;
      L.onReorder?.(arrayMove(L.items as T[], from, to), { id, from, to });
      announce(L.t("movedOver", { item: L.labelOf(id), position: to + 1, total: L.ids.length }));
    },
    [latest, announce],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates(orientation) }),
  );

  const setDragging = (on: boolean) => {
    if (typeof document === "undefined") return;
    if (on) document.documentElement.setAttribute("data-dragging", "");
    else document.documentElement.removeAttribute("data-dragging");
  };

  const handleDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    setActiveId(id);
    if (multi) {
      snapshot.current = baseContainers;
      setLive(baseContainers);
    }
    setDragging(true);
    onDragStart?.(id);
  };

  const handleDragOver = (e: DragOverEvent) => {
    if (!multi || !e.over) return;
    const id = String(e.active.id);
    const overId = String(e.over.id);
    setLive((prev) => {
      const state = prev ?? baseContainers;
      const from = findContainer(state, id);
      const to = findContainer(state, overId);
      if (!from || !to || from.id === to.id) return state;
      const overIndex = to.id === overId ? to.items.length : to.items.indexOf(overId);
      return moveBetweenContainers(state, id, to.id, overIndex < 0 ? to.items.length : overIndex);
    });
  };

  const finish = (id: string, cancelled: boolean) => {
    setActiveId(null);
    setLive(null);
    snapshot.current = null;
    setDragging(false);
    onDragEnd?.(id, cancelled);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const id = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (multi) {
      const start = snapshot.current ?? baseContainers;
      const state = live ?? baseContainers;
      const from = findContainer(start, id);
      const c = findContainer(state, id);
      if (from && c && overId) {
        let index = c.items.indexOf(id);
        if (overId !== c.id && c.items.includes(overId)) index = c.items.indexOf(overId);
        const fromIndex = from.items.indexOf(id);
        if (from.id !== c.id || index !== fromIndex) onMoveBetween?.({ id, from: from.id, to: c.id, index, fromIndex });
      }
    } else if (overId && overId !== id) {
      const from = ids.indexOf(id);
      const to = ids.indexOf(overId);
      if (from !== -1 && to !== -1) onReorder?.(arrayMove(items as T[], from, to), { id, from, to });
    }
    finish(id, false);
  };

  const handleDragCancel = (e: { active: { id: UniqueIdentifier } }) => finish(String(e.active.id), true);

  const announcements = React.useMemo<Announcements>(() => {
    const pos = (id: string, overId?: string) => {
      const L = latest.current;
      if (L.multi) {
        const c = findContainer(L.current, overId ?? id);
        if (!c) return { position: 0, total: 0 };
        const i = overId && overId !== c.id ? c.items.indexOf(overId) : c.items.indexOf(id);
        return { position: (i < 0 ? c.items.length : i) + 1, total: c.items.length, container: L.containerLabelMap.get(c.id) ?? c.id, containerId: c.id };
      }
      const p = L.ids.indexOf(overId ?? id);
      return { position: p + 1, total: L.ids.length };
    };
    return {
      onDragStart: ({ active }) => {
        movedRef.current = false;
        return latest.current.t("pickedUp", { item: latest.current.labelOf(String(active.id)), ...pos(String(active.id)) });
      },
      onDragOver: ({ active, over }) => {
        if (!over) return undefined;
        // Right after pick-up the item is over itself: keep the "Picked up" message.
        if (over.id === active.id && !movedRef.current) return undefined;
        movedRef.current = true;
        const L = latest.current;
        const p = pos(String(active.id), String(over.id));
        if (L.multi && "container" in p) {
          const start = snapshot.current ? findContainer(snapshot.current, String(active.id)) : undefined;
          if (start && start.id !== p.containerId) return L.t("movedToContainer", { item: L.labelOf(String(active.id)), ...p });
        }
        return L.t("movedOver", { item: L.labelOf(String(active.id)), ...p });
      },
      onDragEnd: ({ active, over }) => {
        if (!over) return undefined;
        const L = latest.current;
        const p = pos(String(active.id), String(over.id));
        return L.multi && "container" in p
          ? L.t("droppedInContainer", { item: L.labelOf(String(active.id)), ...p })
          : L.t("dropped", { item: L.labelOf(String(active.id)), ...p });
      },
      onDragCancel: ({ active }) => {
        const L = latest.current;
        const id = String(active.id);
        const start = snapshot.current;
        if (L.multi && start) {
          const c = findContainer(start, id);
          return L.t("cancelled", { item: L.labelOf(id), position: (c?.items.indexOf(id) ?? 0) + 1, total: c?.items.length ?? 0 });
        }
        return L.t("cancelled", { item: L.labelOf(id), ...pos(id) });
      },
    };
  }, [latest]);

  const collision: CollisionDetection = multi ? closestCorners : closestCenter;

  const ctx = React.useMemo<RootContextValue>(
    () => ({
      handle,
      orientation,
      t,
      labelOf,
      isDisabled,
      activeId,
      hasOverlay: overlayCount > 0,
      registerOverlay: () => {
        setOverlayCount((n) => n + 1);
        return () => setOverlayCount((n) => n - 1);
      },
      multi,
      containers: current,
      containerLabel: (id) => containerLabelMap.get(id) ?? id,
      ids,
      move,
      positionOf: (id) => positionOf(id),
      renderOverlay: renderOverlay
        ? (id) => {
            const it = byId.get(id);
            return it === undefined ? null : renderOverlay(it);
          }
        : undefined,
      reducedMotion,
    }),
    [handle, orientation, t, labelOf, isDisabled, activeId, overlayCount, multi, current, containerLabelMap, ids, move, positionOf, renderOverlay, byId, reducedMotion],
  );

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={collision}
      modifiers={multi ? [] : MODIFIERS[orientation]}
      measuring={multi ? { droppable: { strategy: MeasuringStrategy.Always } } : undefined}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{ announcements, screenReaderInstructions: { draggable: t("instructions") } }}
    >
      <SortableRootContext.Provider value={ctx}>
        {multi ? (
          children
        ) : (
          <SortableContext items={ids} strategy={STRATEGY[orientation]}>
            {children}
          </SortableContext>
        )}
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-slot="sortable-status">
          {status}
        </span>
      </SortableRootContext.Provider>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------------------------
// Containers (multi mode)
// ---------------------------------------------------------------------------------------------

export interface SortableContainerProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  id: string;
  /** Element to render. Default `"div"`. */
  as?: "div" | "ul" | "ol" | "section";
  /** Receives the live (preview) item ids of this container. */
  children: (ids: string[], state: { isOver: boolean; isEmpty: boolean }) => React.ReactNode;
}

/** One list in a multi-container Sortable. Also the drop target when it is empty. */
export function SortableContainer({ id, as: Comp = "div", className, children, ...props }: SortableContainerProps) {
  const ctx = useSortableRoot("SortableContainer");
  const ids = ctx.containers.find((c) => c.id === id)?.items ?? [];
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "container" } });
  // Highlight the list the dragged item would land in.
  const overThis = isOver || (ctx.activeId !== null && ids.includes(ctx.activeId));
  return (
    <SortableContext id={id} items={ids} strategy={STRATEGY[ctx.orientation]}>
      <Comp
        ref={setNodeRef as React.Ref<never>}
        data-slot="sortable-container"
        data-over={overThis ? "" : undefined}
        data-empty={ids.length === 0 ? "" : undefined}
        className={cn("vui-sortable-container", className)}
        {...props}
      >
        {children(ids, { isOver: overThis, isEmpty: ids.length === 0 })}
      </Comp>
    </SortableContext>
  );
}

/** Live item ids of a container (multi mode). */
export function useSortableContainerItems(id: string): string[] {
  const ctx = useSortableRoot("useSortableContainerItems");
  return ctx.containers.find((c) => c.id === id)?.items ?? [];
}

// ---------------------------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------------------------

export interface UseSortableItemResult {
  /** Ref for the item's root element. */
  ref: (node: HTMLElement | null) => void;
  /** Spread on the drag activator: the handle, or the item itself when `handle={false}`. */
  handleProps: React.HTMLAttributes<HTMLElement> & { ref: (node: HTMLElement | null) => void };
  /** Transform + transition for the item root. */
  style: React.CSSProperties;
  isDragging: boolean;
  /** The item is the dragged one and an overlay renders the clone: show a placeholder. */
  isPlaceholder: boolean;
  isSorting: boolean;
  disabled: boolean;
  index: number;
  label: string;
}

/**
 * Low-level hook for kit consumers (Data Table columns, Line items rows, Gallery…).
 *
 * ```tsx
 * const s = useSortableItem(row.id);
 * <tr ref={s.ref} style={s.style}><td><button {...s.handleProps}><GripVertical /></button></td>…</tr>
 * ```
 */
export function useSortableItem(id: string, options: { disabled?: boolean } = {}): UseSortableItemResult {
  const ctx = useSortableRoot("useSortableItem");
  const disabled = options.disabled ?? ctx.isDisabled(id);
  const label = ctx.labelOf(id);
  const s = useSortable({
    id,
    disabled,
    attributes: { roleDescription: ctx.t("roleDescription") },
    transition: ctx.reducedMotion ? null : { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  });
  const handleProps = React.useMemo(
    () => ({
      ...s.attributes,
      ...(s.listeners ?? {}),
      ref: s.setActivatorNodeRef,
      ...(ctx.handle ? { "aria-label": ctx.t("handle", { item: label }) } : {}),
    }),
    [s.attributes, s.listeners, s.setActivatorNodeRef, ctx, label],
  ) as UseSortableItemResult["handleProps"];
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(s.transform),
    transition: ctx.reducedMotion ? undefined : s.transition,
  };
  return {
    ref: s.setNodeRef,
    handleProps,
    style,
    isDragging: s.isDragging,
    isPlaceholder: s.isDragging && ctx.hasOverlay,
    isSorting: s.isSorting,
    disabled,
    index: s.index,
    label,
  };
}

const SortableItemContext = /*#__PURE__*/ React.createContext<(UseSortableItemResult & { id: string }) | null>(null);

/** The current item (inside `SortableItem`). */
export function useSortableItemContext() {
  return React.useContext(SortableItemContext);
}

export interface SortableItemProps extends React.HTMLAttributes<HTMLElement> {
  id: string;
  /** Element to render. Default `"div"`. Use `"li"` inside a list (keep `handle` on). */
  as?: "div" | "li" | "tr" | "section" | "article";
  disabled?: boolean;
}

/**
 * A sortable element. With `handle` (default) put a `SortableHandle` inside; with
 * `handle={false}` the whole item is the activator.
 */
export const SortableItem = /*#__PURE__*/ React.forwardRef<HTMLElement, SortableItemProps>(function SortableItem(
  { id, as: Comp = "div", disabled, className, style, children, ...props },
  ref,
) {
  const ctx = useSortableRoot("SortableItem");
  const item = useSortableItem(id, { disabled });
  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      item.ref(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.ref, ref],
  );
  const activator = ctx.handle ? null : item.handleProps;
  const { ref: activatorRef, ...activatorProps } = activator ?? { ref: undefined };
  const value = React.useMemo(() => ({ ...item, id }), [item, id]);
  return (
    <SortableItemContext.Provider value={value}>
      <Comp
        ref={(node: HTMLElement | null) => {
          setRef(node);
          activatorRef?.(node);
        }}
        data-slot="sortable-item"
        data-dragging={item.isDragging ? "" : undefined}
        data-placeholder={item.isPlaceholder ? "" : undefined}
        data-disabled={item.disabled ? "" : undefined}
        className={cn("vui-sortable-item", !ctx.handle && !item.disabled && "focus-ring cursor-grab", className)}
        style={{ ...item.style, ...style }}
        {...(activatorProps as React.HTMLAttributes<HTMLElement>)}
        {...props}
      >
        {children}
      </Comp>
    </SortableItemContext.Provider>
  );
});

export interface SortableHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Item id; default: the surrounding `SortableItem`. */
  id?: string;
  size?: "sm" | "md";
}

/** The drag handle: a button named "Reorder {item}". Hidden for disabled items. */
export const SortableHandle = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, SortableHandleProps>(function SortableHandle(
  { id: _id, size = "md", className, children, ...props },
  ref,
) {
  const item = useSortableItemContext();
  if (!item) throw new Error("<SortableHandle> must be used inside <SortableItem> (or pass the handle props from useSortableItem).");
  if (item.disabled) return <span aria-hidden className={cn(size === "sm" ? "w-6" : "w-7", "shrink-0")} data-slot="sortable-handle-spacer" />;
  const { ref: activatorRef, ...handleProps } = item.handleProps;
  return (
    <button
      type="button"
      ref={(node) => {
        activatorRef(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="sortable-handle"
      className={cn(
        "vui-sortable-handle focus-ring inline-flex shrink-0 cursor-grab touch-none items-center justify-center rounded-ui-sm text-fg-subtle",
        "transition-colors hover:bg-hover hover:text-fg active:cursor-grabbing",
        size === "sm" ? "size-6 [&_svg]:size-3.5" : "size-7 [&_svg]:size-4",
        className,
      )}
      {...(handleProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      {...props}
    >
      {children ?? <GripVertical aria-hidden />}
    </button>
  );
});

// ---------------------------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------------------------

export interface SortableOverlayProps {
  /** Overlay content: a node or a function of the dragged id. Default: the root `renderOverlay`. */
  children?: React.ReactNode | ((id: string) => React.ReactNode);
  className?: string;
}

/**
 * The dragged clone, portaled so a blurred container can't clip or offset it. Opaque
 * `surface-popover` without blur: it looks the same in glass and solid.
 */
export function SortableOverlay({ children, className }: SortableOverlayProps) {
  const ctx = useSortableRoot("SortableOverlay");
  const container = usePortalContainer();
  const { registerOverlay } = ctx;
  React.useEffect(() => registerOverlay(), [registerOverlay]);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const id = ctx.activeId;
  const content = id === null ? null : typeof children === "function" ? children(id) : (children ?? ctx.renderOverlay?.(id) ?? null);
  const overlay = (
    <DragOverlay dropAnimation={ctx.reducedMotion ? null : { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }} zIndex={1000}>
      {content ? (
        <div data-slot="sortable-overlay" className={cn("vui-sortable-overlay", className)}>
          {content}
        </div>
      ) : null}
    </DragOverlay>
  );
  if (!mounted) return null;
  return createPortal(overlay, container ?? document.body);
}

// ---------------------------------------------------------------------------------------------
// Move menu (WCAG 2.5.7 alternative)
// ---------------------------------------------------------------------------------------------

export interface SortableMoveMenuProps {
  /** Item id; default: the surrounding `SortableItem`. */
  id?: string;
  /** Custom trigger (rendered with `asChild`). */
  trigger?: React.ReactElement;
  size?: "xs" | "sm" | "md";
  align?: "start" | "end";
  className?: string;
}

/**
 * Move up / down / to top / to bottom (and "Move to {list}" with containers) without dragging.
 * The result is announced politely.
 */
export function SortableMoveMenu({ id: idProp, trigger, size = "sm", align = "end", className }: SortableMoveMenuProps) {
  const ctx = useSortableRoot("SortableMoveMenu");
  const item = useSortableItemContext();
  const id = idProp ?? item?.id;
  if (!id) throw new Error("<SortableMoveMenu> needs an `id` outside <SortableItem>.");
  const label = ctx.labelOf(id);
  const { index, total, container } = ctx.positionOf(id);
  const disabled = ctx.isDisabled(id);
  const vertical = ctx.orientation === "vertical";
  const ops: { op: MoveOp; label: string; icon: React.ReactNode }[] = [
    { op: "up", label: ctx.t(vertical ? "moveUp" : "moveEarlier"), icon: <ArrowUp /> },
    { op: "down", label: ctx.t(vertical ? "moveDown" : "moveLater"), icon: <ArrowDown /> },
    { op: "top", label: ctx.t(vertical ? "moveTop" : "moveStart"), icon: <ArrowUpToLine /> },
    { op: "bottom", label: ctx.t(vertical ? "moveBottom" : "moveEnd"), icon: <ArrowDownToLine /> },
  ];
  const others = ctx.multi ? ctx.containers.filter((c) => c.id !== container) : [];
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {trigger ?? (
          <IconButton label={ctx.t("moveMenu", { item: label })} size={size} tooltip={false} className={cn("text-fg-subtle", className)} data-slot="sortable-move-menu">
            <ArrowUpDown />
          </IconButton>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} size="sm">
        {ops.map((o) => (
          <DropdownMenuItem key={o.op} icon={o.icon} disabled={moveTargetIndex(index, total, o.op) === null} onSelect={() => ctx.move(id, o.op)}>
            {o.label}
          </DropdownMenuItem>
        ))}
        {others.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{ctx.t("moveToHeading")}</DropdownMenuLabel>
            {others.map((c) => (
              <DropdownMenuItem key={c.id} icon={<CornerDownRight />} onSelect={() => ctx.move(id, { container: c.id })}>
                {ctx.t("moveTo", { container: ctx.containerLabel(c.id) })}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
