"use client";

/**
 * Kanban: items in stage columns with drag-to-move, column summaries, WIP limits, collapsible
 * columns, optional swimlanes, quick add and virtualized long columns. Built on `Sortable`
 * (multi-container) — every move also works without dragging: a card menu ("Move to ▸ stage")
 * and Alt + arrow shortcuts, all announced.
 */
import * as React from "react";
import { cva } from "class-variance-authority";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ChevronRight, ChevronsLeftRight, Ellipsis, Plus, TriangleAlert, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { Button, IconButton } from "../components/button";
import { Skeleton } from "../components/skeleton";
import { toast } from "../components/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { Sortable, SortableContainer, SortableOverlay, useSortableActiveId, useSortableItem, type SortableLabels } from "./sortable";
import { arrayMove, keepMountedRange, moveBetweenContainers, type ContainerState } from "./core";
import { kanbanCellId, parseKanbanCellId, stageToneColor, type KanbanMoveEvent, type Stage } from "./kanban-core";

// ---------------------------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------------------------

export const kanbanLabels = {
  board: "Board",
  column: "{stage}, {count, plural, =0 {no items} one {# item} other {# items}}",
  cell: "{stage}, {lane}, {count, plural, =0 {no items} one {# item} other {# items}}",
  lane: "{lane}, {count, plural, =0 {no items} one {# item} other {# items}}",
  wip: "{count} of {limit}",
  wipExceeded: "Over the work-in-progress limit of {limit}",
  empty: "Drop items here",
  filteredEmpty: "No items match",
  loading: "Loading board",
  addCard: "Add card",
  addCardTo: "Add card to {stage}",
  quickAddLabel: "Card title",
  quickAddPlaceholder: "What needs doing?",
  quickAddSubmit: "Add",
  quickAddCancel: "Cancel",
  quickAddFailed: "Couldn't add the card",
  columnMenu: "{stage} options",
  collapse: "Collapse column",
  expand: "Expand {stage}",
  moveColumnStart: "Move column left",
  moveColumnEnd: "Move column right",
  collapseLane: "Collapse {lane}",
  expandLane: "Expand {lane}",
  cardMenu: "Actions for {item}",
  moveUp: "Move up",
  moveDown: "Move down",
  moveToHeading: "Move to",
  currentStage: "Current stage",
  moved: "{item} moved to {stage}, position {position} of {total}.",
  reordered: "{item} moved to position {position} of {total}.",
  blocked: "Can't move {item} to {stage}: {reason}",
  moveFailed: "Couldn't move {item}",
  retry: "Retry",
  saving: "Saving",
};
export type KanbanLabels = typeof kanbanLabels;

// ---------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------

export interface KanbanCardState {
  isDragging: boolean;
  /** `cardSize === "compact"`. */
  compact: boolean;
  /** Rendering the dragged clone. */
  overlay: boolean;
  /** An async `onMove` for this card is in flight. */
  saving: boolean;
  stage: Stage;
}

export interface KanbanLane {
  key: string;
  label: string;
  /** Leading visual (an Avatar for an owner lane). */
  icon?: React.ReactNode;
}

export interface KanbanProps<T> {
  stages: readonly Stage[];
  items: readonly T[];
  getId?: (item: T) => string;
  getStageKey: (item: T) => string;
  /** Spoken name of a card (announcements, menu names). Default `title` / `name` / `label`. */
  getLabel?: (item: T) => string;
  renderCard: (item: T, state: KanbanCardState) => React.ReactNode;
  /** Called once per drop, menu move or shortcut. A returned promise keeps the card optimistic until it settles; a rejection snaps it back with a Retry toast. */
  onMove: (event: KanbanMoveEvent) => void | Promise<void>;
  /** `true` or the reason the move is not allowed ("Value is required to mark as Won"). */
  canMove?: (event: KanbanMoveEvent) => true | string;
  /** Last check before `onMove` (open a "Lost reason" dialog). Resolve `false` to cancel. */
  beforeMove?: (event: KanbanMoveEvent) => boolean | Promise<boolean>;
  /** Column summary under the header label (Σ value, weighted value). Also the column's accessible description. */
  summary?: (items: T[], stage: Stage) => React.ReactNode;
  /** Shows a quick-add row at the bottom of each column. */
  onQuickAdd?: (stageKey: string, title: string, lane?: string) => void | Promise<void>;
  /** Enables "Move column left / right" in the column menu. */
  reorderStages?: (next: Stage[]) => void;
  /** Swimlanes. */
  lanes?: readonly KanbanLane[];
  getLaneKey?: (item: T) => string;
  collapsedStages?: string[];
  defaultCollapsedStages?: string[];
  onCollapsedStagesChange?: (keys: string[]) => void;
  /** Extra items at the end of each card's menu. */
  cardMenu?: (item: T) => React.ReactNode;
  /** Render only the visible cards of long columns. Default threshold 60 cards. */
  virtualize?: boolean | { estimateSize?: number; threshold?: number };
  cardSize?: "compact" | "comfortable";
  columnWidth?: "sm" | "md" | "lg";
  /** Board height (scrolling columns). Required for virtualization; default `36rem` when virtualizing. */
  height?: number | string;
  /** Items are filtered: empty columns say "No items match". */
  filtered?: boolean;
  /** Three skeleton cards per column. */
  loading?: boolean;
  /** Filter bar / view switch slot above the board. */
  toolbar?: React.ReactNode;
  labels?: Partial<KanbanLabels>;
  /** Strings of the underlying Sortable (drag announcements). */
  sortableLabels?: Partial<SortableLabels>;
  "aria-label"?: string;
  className?: string;
}

interface KanbanContextValue {
  t: LabelFn<KanbanLabels>;
  uid: string;
  stages: readonly Stage[];
  stageByKey: Map<string, Stage>;
  byId: Map<string, unknown>;
  labelOf: (id: string) => string;
  cells: ContainerState[];
  cellOf: (id: string) => ContainerState | undefined;
  pending: Set<string>;
  originCell: string | null;
  compact: boolean;
  renderCard: (item: unknown, state: KanbanCardState) => React.ReactNode;
  requestMove: (id: string, toCell: string, index: number) => void;
  check: (id: string, toCell: string, index: number) => true | string;
  focusRequest: React.RefObject<string | null>;
  cardMenu?: (item: unknown) => React.ReactNode;
  dir: "ltr" | "rtl";
  lanes: readonly KanbanLane[] | undefined;
}

const KanbanContext = /*#__PURE__*/ React.createContext<KanbanContextValue | null>(null);
function useKanban(): KanbanContextValue {
  const ctx = React.useContext(KanbanContext);
  if (!ctx) throw new Error("Kanban parts must be used inside <Kanban>.");
  return ctx;
}

const defaultGetId = (item: unknown) => String((item as { id?: unknown }).id);
const defaultGetLabel = (item: unknown): string | undefined => {
  const o = item as Record<string, unknown>;
  const v = o?.title ?? o?.name ?? o?.label;
  return typeof v === "string" ? v : undefined;
};

export const kanbanColumnVariants = /*#__PURE__*/ cva("vui-kanban-column relative flex min-h-0 shrink-0 flex-col rounded-ui-lg", {
  variants: {
    width: { sm: "w-[15.5rem]", md: "w-[18.5rem]", lg: "w-[22rem]" },
  },
  defaultVariants: { width: "md" },
});

const COLUMN_W = { sm: "15.5rem", md: "18.5rem", lg: "22rem" } as const;

// ---------------------------------------------------------------------------------------------
// Kanban
// ---------------------------------------------------------------------------------------------

/**
 * A board of items in stage columns.
 *
 * ```tsx
 * <Kanban
 *   aria-label="Sales pipeline"
 *   stages={stages}
 *   items={deals}
 *   getStageKey={(d) => d.stage}
 *   renderCard={(d) => <DealCard deal={d} />}
 *   onMove={(e) => setDeals((all) => applyKanbanMove(all, e, { getId, getStageKey, update: (d, stage) => ({ ...d, stage }) }))}
 * />
 * ```
 */
export function Kanban<T>(props: KanbanProps<T>) {
  const {
    stages,
    items,
    getId = defaultGetId as (item: T) => string,
    getStageKey,
    getLabel,
    renderCard,
    onMove,
    canMove,
    beforeMove,
    summary,
    onQuickAdd,
    reorderStages,
    lanes,
    getLaneKey,
    collapsedStages,
    defaultCollapsedStages,
    onCollapsedStagesChange,
    cardMenu,
    virtualize,
    cardSize = "comfortable",
    columnWidth = "md",
    height,
    filtered,
    loading,
    toolbar,
    labels,
    sortableLabels,
    className,
    "aria-label": ariaLabel,
  } = props;
  const t = useLabels("kanban", kanbanLabels, labels);
  const { dir } = useLocale();
  const uid = "vui-kanban" + React.useId().replace(/:/g, "");

  const [collapsed, setCollapsed] = useControllableState<string[]>({
    value: collapsedStages,
    defaultValue: () => defaultCollapsedStages ?? stages.filter((s) => s.collapsed).map((s) => s.key),
    onChange: onCollapsedStagesChange,
    name: "Kanban",
  });
  const collapsedSet = React.useMemo(() => new Set(collapsed), [collapsed]);
  const [collapsedLanes, setCollapsedLanes] = React.useState<Set<string>>(() => new Set());

  const stageByKey = React.useMemo(() => new Map(stages.map((s) => [s.key, s])), [stages]);
  const byId = React.useMemo(() => new Map(items.map((i) => [getId(i), i as unknown])), [items, getId]);
  const labelOf = React.useCallback(
    (id: string) => {
      const it = byId.get(id) as T | undefined;
      if (it === undefined) return id;
      return (getLabel ? getLabel(it) : defaultGetLabel(it)) ?? id;
    },
    [byId, getLabel],
  );

  // Base cells from the items, then optimistic (pending) moves on top.
  const baseCells = React.useMemo<ContainerState[]>(() => {
    const laneKeys = lanes?.map((l) => l.key);
    const map = new Map<string, string[]>();
    const order: string[] = [];
    for (const lk of laneKeys ?? [undefined]) {
      for (const s of stages) {
        const id = kanbanCellId(s.key, lk);
        map.set(id, []);
        order.push(id);
      }
    }
    for (const it of items) {
      const cell = kanbanCellId(getStageKey(it), lanes && getLaneKey ? getLaneKey(it) : undefined);
      map.get(cell)?.push(getId(it));
    }
    return order.map((id) => ({ id, items: map.get(id)! }));
  }, [items, stages, lanes, getStageKey, getLaneKey, getId]);

  const [pendingMoves, setPendingMoves] = React.useState<{ id: string; to: string; index: number }[]>([]);
  const cells = React.useMemo(
    () => pendingMoves.reduce((acc, m) => moveBetweenContainers(acc, m.id, m.to, m.index), baseCells),
    [baseCells, pendingMoves],
  );
  const pending = React.useMemo(() => new Set(pendingMoves.map((m) => m.id)), [pendingMoves]);
  const cellOf = React.useCallback((id: string) => cells.find((c) => c.items.includes(id)), [cells]);

  const [status, setStatus] = React.useState("");
  const announce = React.useCallback((msg: string) => {
    setStatus("");
    requestAnimationFrame(() => setStatus(msg));
  }, []);
  const focusRequest = React.useRef<string | null>(null);
  const [originCell, setOriginCell] = React.useState<string | null>(null);

  const buildEvent = React.useCallback(
    (id: string, toCell: string, index: number, state: ContainerState[]): KanbanMoveEvent | null => {
      const from = state.find((c) => c.items.includes(id));
      if (!from) return null;
      const a = parseKanbanCellId(from.id);
      const b = parseKanbanCellId(toCell);
      const e: KanbanMoveEvent = { id, from: a.stage, to: b.stage, index, fromIndex: from.items.indexOf(id) };
      if (b.lane !== undefined) {
        e.lane = b.lane;
        e.fromLane = a.lane;
      }
      return e;
    },
    [],
  );

  const latest = useLatest({ cells, canMove, beforeMove, onMove, labelOf, stageByKey, lanes, t });

  const check = React.useCallback(
    (id: string, toCell: string, index: number): true | string => {
      const L = latest.current;
      const e = buildEvent(id, toCell, index, L.cells);
      if (!e || !L.canMove) return true;
      if (e.from === e.to && e.lane === e.fromLane) return true;
      return L.canMove(e);
    },
    [latest, buildEvent],
  );

  const requestMove = React.useCallback(
    async (id: string, toCell: string, index: number) => {
      const L = latest.current;
      const e = buildEvent(id, toCell, index, L.cells);
      if (!e) return;
      const item = L.labelOf(id);
      const stage = L.stageByKey.get(e.to);
      const stageName = stage?.label ?? e.to;
      const sameCell = e.from === e.to && e.lane === e.fromLane;
      if (sameCell && e.index === e.fromIndex) return;
      if (!sameCell && L.canMove) {
        const ok = L.canMove(e);
        if (ok !== true) {
          const msg = L.t("blocked", { item, stage: stageName, reason: ok });
          announce(msg);
          toast.warning(msg);
          return;
        }
      }
      if (L.beforeMove) {
        const go = await L.beforeMove(e);
        if (!go) {
          focusRequest.current = id;
          return;
        }
      }
      focusRequest.current = id;
      // Re-read after the (possibly async) confirmation: handlers may have new closures by now.
      const N = latest.current;
      const target = N.cells.find((c) => c.id === toCell);
      const total = sameCell ? (target?.items.length ?? 0) : (target?.items.length ?? 0) + 1;
      announce(sameCell ? L.t("reordered", { item, position: e.index + 1, total }) : L.t("moved", { item, stage: stageName, position: e.index + 1, total }));
      const result = N.onMove(e);
      if (result && typeof (result as Promise<void>).then === "function") {
        const entry = { id, to: toCell, index: e.index };
        setPendingMoves((p) => [...p.filter((m) => m.id !== id), entry]);
        try {
          await result;
        } catch {
          toast.danger(N.t("moveFailed", { item }), {
            action: { label: N.t("retry"), onClick: () => void requestMoveRef.current?.(id, toCell, index) },
          });
        } finally {
          setPendingMoves((p) => p.filter((m) => m !== entry));
        }
      }
    },
    [latest, buildEvent, announce],
  );
  const requestMoveRef = React.useRef(requestMove);
  requestMoveRef.current = requestMove;

  const containers = React.useMemo(
    () =>
      cells.map((c) => {
        const { stage, lane } = parseKanbanCellId(c.id);
        const s = stageByKey.get(stage)?.label ?? stage;
        const l = lane !== undefined ? lanes?.find((x) => x.key === lane)?.label : undefined;
        return { id: c.id, label: l ? `${s} · ${l}` : s, items: c.items };
      }),
    [cells, stageByKey, lanes],
  );

  const ctx: KanbanContextValue = {
    t,
    uid,
    stages,
    stageByKey,
    byId,
    labelOf,
    cells,
    cellOf,
    pending,
    originCell,
    compact: cardSize === "compact",
    renderCard: renderCard as (item: unknown, s: KanbanCardState) => React.ReactNode,
    requestMove: (id, to, index) => void requestMove(id, to, index),
    check,
    focusRequest,
    cardMenu: cardMenu as ((item: unknown) => React.ReactNode) | undefined,
    dir,
    lanes,
  };

  const virtualOpts = virtualize ? { estimateSize: 96, threshold: 60, ...(typeof virtualize === "object" ? virtualize : {}) } : null;
  const boardHeight = height ?? (virtualOpts ? "36rem" : undefined);
  const toggleStage = (key: string) => setCollapsed((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const moveStage = (key: string, delta: -1 | 1) => {
    if (!reorderStages) return;
    const i = stages.findIndex((s) => s.key === key);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= stages.length) return;
    reorderStages(arrayMove(stages as Stage[], i, j));
  };

  const itemsOfCell = (cellId: string) => (cells.find((c) => c.id === cellId)?.items ?? []).map((id) => byId.get(id) as T);

  const header = (stage: Stage, cellIds: string[], idx: number) => {
    const all = cellIds.flatMap((cid) => itemsOfCell(cid));
    return (
      <KanbanColumnHeader
        stage={stage}
        count={all.length}
        summary={summary?.(all, stage)}
        collapsed={collapsedSet.has(stage.key)}
        onToggle={() => toggleStage(stage.key)}
        onAdd={onQuickAdd && !lanes ? () => document.getElementById(quickAddId(uid, stage.key))?.click() : undefined}
        onMoveStart={reorderStages && idx > 0 ? () => moveStage(stage.key, -1) : undefined}
        onMoveEnd={reorderStages && idx < stages.length - 1 ? () => moveStage(stage.key, 1) : undefined}
      />
    );
  };

  const body = (stage: Stage, lane?: KanbanLane) => {
    const cellId = kanbanCellId(stage.key, lane?.key);
    return (
      <KanbanCell
        key={cellId}
        cellId={cellId}
        stage={stage}
        lane={lane}
        collapsed={collapsedSet.has(stage.key)}
        loading={!!loading}
        filtered={!!filtered}
        virtual={virtualOpts}
        bounded={boardHeight !== undefined}
      />
    );
  };

  return (
    <KanbanContext.Provider value={ctx}>
      <div
        data-slot="kanban"
        data-size={cardSize}
        aria-busy={loading || undefined}
        className={cn("vui-kanban flex w-full min-w-0 flex-col gap-3", className)}
        style={boardHeight !== undefined ? ({ "--kanban-h": typeof boardHeight === "number" ? `${boardHeight}px` : boardHeight } as React.CSSProperties) : undefined}
      >
        {toolbar ? <div data-slot="kanban-toolbar" className="flex min-w-0 flex-wrap items-center gap-2">{toolbar}</div> : null}
        <Sortable
          items={items}
          getId={getId}
          getLabel={(i) => labelOf(getId(i))}
          containers={containers}
          // "grid": no axis lock and 2-D keyboard moves, so cards travel across columns.
          orientation="grid"
          handle={false}
          labels={{ moveToHeading: t("moveToHeading"), ...sortableLabels }}
          onDragStart={(id) => setOriginCell(cellOf(id)?.id ?? null)}
          onDragEnd={() => setOriginCell(null)}
          onMoveBetween={(e) => void requestMove(e.id, e.to, e.index)}
        >
          <div
            role="region"
            aria-label={ariaLabel ?? t("board")}
            className="vui-kanban-scroll -mx-1 w-auto overflow-x-auto px-1 pb-2 [contain:inline-size]"
          >
            {loading ? <span className="sr-only">{t("loading")}</span> : null}
            {lanes ? (
              <div
                data-slot="kanban-grid"
                className="grid w-max gap-x-3 gap-y-2"
                style={{ gridTemplateColumns: stages.map((s) => (collapsedSet.has(s.key) ? "2.75rem" : COLUMN_W[columnWidth])).join(" ") }}
              >
                {stages.map((s, i) => (
                  <div key={s.key} data-slot="kanban-column-head" data-collapsed={collapsedSet.has(s.key) ? "" : undefined} className="vui-kanban-head sticky top-0 z-[1] rounded-ui-lg surface-2" style={{ "--stage-tone": stageToneColor(s.tone) } as React.CSSProperties}>
                    {header(s, lanes.map((l) => kanbanCellId(s.key, l.key)), i)}
                  </div>
                ))}
                {lanes.map((lane) => {
                  const count = stages.reduce((n, s) => n + (cells.find((c) => c.id === kanbanCellId(s.key, lane.key))?.items.length ?? 0), 0);
                  const closed = collapsedLanes.has(lane.key);
                  return (
                    <React.Fragment key={lane.key}>
                      <div data-slot="kanban-lane" className="sticky start-0 col-span-full flex items-center gap-2 pt-2" style={{ gridColumn: "1 / -1" }}>
                        <button
                          type="button"
                          aria-expanded={!closed}
                          title={t(closed ? "expandLane" : "collapseLane", { lane: lane.label })}
                          onClick={() =>
                            setCollapsedLanes((prev) => {
                              const next = new Set(prev);
                              if (next.has(lane.key)) next.delete(lane.key);
                              else next.add(lane.key);
                              return next;
                            })
                          }
                          className="focus-ring inline-flex items-center gap-2 rounded-ui-sm py-0.5 pe-2 text-sm font-medium text-fg hover:bg-hover"
                        >
                          {closed ? <ChevronRight aria-hidden className="size-4 text-fg-subtle rtl:-scale-x-100" /> : <ChevronDown aria-hidden className="size-4 text-fg-subtle" />}
                          {lane.icon}
                          <span>{lane.label}</span>
                        </button>
                        <span className="tabular text-xs text-fg-subtle">{count}</span>
                        <span aria-hidden className="h-px flex-1 bg-line" />
                      </div>
                      {!closed && stages.map((s) => body(s, lane))}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div data-slot="kanban-columns" className="flex w-max items-start gap-3">
                {stages.map((s, i) => {
                  const cellId = kanbanCellId(s.key);
                  const ids = cells.find((c) => c.id === cellId)?.items ?? [];
                  const isCollapsed = collapsedSet.has(s.key);
                  const summaryId = `${quickAddId(uid, s.key)}-summary`;
                  return (
                    <div
                      key={s.key}
                      role="group"
                      aria-label={t("column", { stage: s.label, count: ids.length })}
                      aria-describedby={summary && !isCollapsed ? summaryId : undefined}
                      data-slot="kanban-column"
                      data-collapsed={isCollapsed ? "" : undefined}
                      data-over-limit={s.wipLimit !== undefined && ids.length > s.wipLimit ? "" : undefined}
                      className={cn(kanbanColumnVariants({ width: columnWidth }), "surface-2", isCollapsed && "w-11")}
                      style={{ "--stage-tone": stageToneColor(s.tone) } as React.CSSProperties}
                    >
                      {header(s, [cellId], i)}
                      {body(s)}
                      {onQuickAdd && !isCollapsed && !loading ? <KanbanQuickAdd stage={s} onAdd={onQuickAdd} /> : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <SortableOverlay>
            {(id) => {
              const it = byId.get(id);
              const c = cellOf(id);
              const stage = c ? stageByKey.get(parseKanbanCellId(c.id).stage) : undefined;
              if (it === undefined || !stage) return null;
              return (
                <div className={cn("vui-sortable-clone vui-kanban-card rounded-ui border border-line", cardSize === "compact" ? "p-2" : "p-3")} style={{ width: COLUMN_W[columnWidth] }}>
                  {renderCard(it as T, { isDragging: true, compact: cardSize === "compact", overlay: true, saving: false, stage })}
                </div>
              );
            }}
          </SortableOverlay>
        </Sortable>
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-slot="kanban-status">
          {status}
        </span>
      </div>
    </KanbanContext.Provider>
  );
}

const quickAddId = (uid: string, stage: string) => `${uid}-${stage.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

// ---------------------------------------------------------------------------------------------
// Column header
// ---------------------------------------------------------------------------------------------

export interface KanbanColumnHeaderProps {
  stage: Stage;
  count: number;
  summary?: React.ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
  onAdd?: () => void;
  onMoveStart?: () => void;
  onMoveEnd?: () => void;
}

/** Label · count · summary · WIP · menu. Collapsed: a vertical label that expands on click. */
export function KanbanColumnHeader({ stage, count, summary, collapsed, onToggle, onAdd, onMoveStart, onMoveEnd }: KanbanColumnHeaderProps) {
  const { t, dir, uid } = useKanban();
  const { format } = useLocale();
  const over = stage.wipLimit !== undefined && count > stage.wipLimit;
  if (collapsed) {
    return (
      <button
        type="button"
        data-slot="kanban-column-expand"
        onClick={onToggle}
        // Visible text (count + stage) is the accessible name (WCAG 2.5.3); aria-expanded="false" says it opens.
        title={t("expand", { stage: stage.label })}
        aria-expanded={false}
        className="focus-ring flex h-full min-h-48 w-full flex-col items-center gap-2 rounded-ui-lg px-1 pt-3 pb-3 text-fg hover:bg-hover"
      >
        <span aria-hidden className="size-2 shrink-0 rounded-full bg-(--stage-tone)" />
        <span className="tabular text-xs text-fg-muted">{format.number(count)}</span>
        <span className="text-[13px] font-medium [writing-mode:vertical-rl]">{stage.label}</span>
        <ChevronsLeftRight aria-hidden className="mt-auto size-3.5 text-fg-subtle" />
      </button>
    );
  }
  const StartIcon = dir === "rtl" ? ArrowRight : ArrowLeft;
  const EndIcon = dir === "rtl" ? ArrowLeft : ArrowRight;
  return (
    <div data-slot="kanban-column-header" className="vui-kanban-header flex flex-col gap-0.5 px-3 pt-3 pb-2">
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden className="size-2 shrink-0 rounded-full bg-(--stage-tone)" />
        <h3 className="min-w-0 truncate text-[13px] font-semibold tracking-tight text-fg">{stage.label}</h3>
        <span className="tabular text-xs text-fg-subtle">{format.number(count)}</span>
        {stage.wipLimit !== undefined ? (
          <span
            data-slot="kanban-wip"
            data-exceeded={over ? "" : undefined}
            title={over ? t("wipExceeded", { limit: stage.wipLimit }) : undefined}
            className={cn(
              "tabular inline-flex h-5 items-center gap-1 rounded-full px-1.5 text-[11px] font-medium",
              over ? "tone-warning tone-soft" : "bg-selected text-fg-muted",
            )}
          >
            {over ? <TriangleAlert aria-hidden className="size-3" /> : null}
            <span aria-hidden>
              {count}/{stage.wipLimit}
            </span>
            <span className="sr-only">{over ? t("wipExceeded", { limit: stage.wipLimit }) : t("wip", { count, limit: stage.wipLimit })}</span>
          </span>
        ) : null}
        <div className="ms-auto flex items-center">
          {onAdd ? (
            <IconButton label={t("addCardTo", { stage: stage.label })} size="xs" tooltip={false} onClick={onAdd} className="text-fg-subtle">
              <Plus />
            </IconButton>
          ) : null}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <IconButton label={t("columnMenu", { stage: stage.label })} size="xs" tooltip={false} className="text-fg-subtle">
                <Ellipsis />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" size="sm">
              <DropdownMenuItem icon={<ChevronsLeftRight />} onSelect={onToggle}>
                {t("collapse")}
              </DropdownMenuItem>
              {onAdd ? (
                <DropdownMenuItem icon={<Plus />} onSelect={() => requestAnimationFrame(onAdd)}>
                  {t("addCard")}
                </DropdownMenuItem>
              ) : null}
              {onMoveStart || onMoveEnd ? <DropdownMenuSeparator /> : null}
              {onMoveStart ? (
                <DropdownMenuItem icon={<StartIcon />} onSelect={onMoveStart}>
                  {t("moveColumnStart")}
                </DropdownMenuItem>
              ) : null}
              {onMoveEnd ? (
                <DropdownMenuItem icon={<EndIcon />} onSelect={onMoveEnd}>
                  {t("moveColumnEnd")}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {summary !== undefined && summary !== null ? (
        <div id={`${quickAddId(uid, stage.key)}-summary`} data-slot="kanban-summary" className="tabular ps-4 text-xs text-fg-muted">
          {summary}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Cell (one droppable list: a column, or a lane × stage cell)
// ---------------------------------------------------------------------------------------------

interface KanbanCellProps {
  cellId: string;
  stage: Stage;
  lane?: KanbanLane;
  collapsed: boolean;
  loading: boolean;
  filtered: boolean;
  virtual: { estimateSize: number; threshold: number } | null;
  bounded: boolean;
}

function KanbanCell({ cellId, stage, lane, collapsed, loading, filtered, virtual, bounded }: KanbanCellProps) {
  const ctx = useKanban();
  const activeId = useSortableActiveId();
  const { t } = ctx;
  const laned = !!lane;
  return (
    <SortableContainer
      id={cellId}
      role={laned ? "group" : undefined}
      aria-label={laned ? t("cell", { stage: stage.label, lane: lane.label, count: ctx.cells.find((c) => c.id === cellId)?.items.length ?? 0 }) : undefined}
      data-kanban-cell=""
      className={cn(
        "vui-kanban-cell relative flex min-h-0 flex-col rounded-ui-lg",
        laned && "surface-2 min-h-20",
        collapsed && "min-h-20",
        bounded && !laned && "max-h-[calc(var(--kanban-h)-3.5rem)]",
      )}
      style={laned ? ({ "--stage-tone": stageToneColor(stage.tone) } as React.CSSProperties) : undefined}
    >
      {(ids, { isEmpty }) => {
        const blockedReason =
          activeId && ctx.originCell && ctx.originCell !== cellId && ids.includes(activeId) ? ctx.check(activeId, cellId, ids.indexOf(activeId)) : true;
        const blocked = blockedReason !== true;
        if (collapsed) {
          // Keep the dragged card mounted (hidden) while it hovers a collapsed column.
          return (
            <div data-blocked={blocked ? "" : undefined} className="contents">
              {ids.filter((id) => id === activeId).map((id) => (
                <div key={id} className="sr-only">
                  <KanbanCardItem id={id} cellId={cellId} stage={stage} index={ids.indexOf(id)} total={ids.length} />
                </div>
              ))}
            </div>
          );
        }
        const useVirtual = !!virtual && ids.length > virtual.threshold;
        return (
          <>
            {blocked ? (
              <div data-slot="kanban-blocked" role="alert" className="mx-2 mt-1 flex items-start gap-1.5 rounded-ui-sm tone-danger tone-soft px-2 py-1.5 text-xs">
                <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
                <span>{blockedReason}</span>
              </div>
            ) : null}
            {loading ? (
              <div className="flex flex-col gap-2 px-2 pb-2" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-ui border border-line bg-surface p-3">
                    <Skeleton className="h-3.5 w-3/4 rounded-ui-sm" />
                    <Skeleton className="mt-2 h-3 w-1/2 rounded-ui-sm" />
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div data-slot="kanban-empty" className="mx-2 mb-2 flex min-h-16 flex-1 items-center justify-center rounded-ui border border-dashed border-field-border px-3 text-center text-xs text-fg-subtle">
                {filtered ? t("filteredEmpty") : t("empty")}
              </div>
            ) : useVirtual ? (
              <VirtualCards ids={ids} cellId={cellId} stage={stage} estimateSize={virtual!.estimateSize} />
            ) : (
              <div data-slot="kanban-cards" className={cn("flex flex-col gap-2 px-2 pb-2", bounded && !laned && "min-h-0 overflow-y-auto")}>
                {ids.map((id, i) => (
                  <KanbanCardItem key={id} id={id} cellId={cellId} stage={stage} index={i} total={ids.length} />
                ))}
              </div>
            )}
            {blocked ? <span aria-hidden data-slot="kanban-blocked-outline" className="pointer-events-none absolute inset-0 rounded-[inherit] ring-[1.5px] ring-danger ring-inset" /> : null}
          </>
        );
      }}
    </SortableContainer>
  );
}

function VirtualCards({ ids, cellId, stage, estimateSize }: { ids: string[]; cellId: string; stage: Stage; estimateSize: number }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeId = useSortableActiveId();
  const activeIndex = activeId ? ids.indexOf(activeId) : -1;
  const v = useVirtualizer({
    count: ids.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan: 6,
    getItemKey: (i) => ids[i]!,
    rangeExtractor: keepMountedRange(activeIndex >= 0 ? activeIndex : null),
  });
  return (
    <div ref={scrollRef} data-slot="kanban-cards" data-virtual="" className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
      <div className="relative w-full" style={{ height: v.getTotalSize() }}>
        {v.getVirtualItems().map((row) => {
          const id = ids[row.index]!;
          return (
            <div key={row.key} data-index={row.index} ref={v.measureElement} className="absolute inset-x-0 pb-2" style={{ top: row.start }}>
              <KanbanCardItem id={id} cellId={cellId} stage={stage} index={row.index} total={ids.length} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------------------------

interface KanbanCardItemProps {
  id: string;
  cellId: string;
  stage: Stage;
  index: number;
  total: number;
}

const ARROWS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

function KanbanCardItem({ id, cellId, stage, index, total }: KanbanCardItemProps) {
  const ctx = useKanban();
  const s = useSortableItem(id);
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const item = ctx.byId.get(id);
  const saving = ctx.pending.has(id);
  const label = ctx.labelOf(id);
  // Drag attributes on the article, minus the button semantics (it stays an article).
  const { ref: activatorRef, role: _role, "aria-pressed": _pressed, "aria-roledescription": _rd, onKeyDown: dndKeyDown, ...activator } = s.handleProps as typeof s.handleProps & {
    "aria-pressed"?: unknown;
    "aria-roledescription"?: string;
  };

  React.useEffect(() => {
    if (ctx.focusRequest.current === id && nodeRef.current && !s.isDragging) {
      ctx.focusRequest.current = null;
      nodeRef.current.focus({ preventScroll: false });
    }
  });

  const { stage: cellStage, lane } = parseKanbanCellId(cellId);
  const stageIndex = ctx.stages.findIndex((x) => x.key === cellStage);

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.target === e.currentTarget && e.altKey && ARROWS.has(e.key)) {
      e.preventDefault();
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const to = index + (e.key === "ArrowUp" ? -1 : 1);
        if (to >= 0 && to < total) ctx.requestMove(id, cellId, to);
        return;
      }
      const forward = (e.key === "ArrowRight") !== (ctx.dir === "rtl");
      const next = ctx.stages[stageIndex + (forward ? 1 : -1)];
      if (!next) return;
      const toCell = kanbanCellId(next.key, lane);
      ctx.requestMove(id, toCell, ctx.cells.find((c) => c.id === toCell)?.items.length ?? 0);
      return;
    }
    dndKeyDown?.(e);
  };

  if (item === undefined) return null;
  return (
    <article
      ref={(node) => {
        nodeRef.current = node;
        s.ref(node);
        activatorRef(node);
      }}
      {...(activator as React.HTMLAttributes<HTMLElement>)}
      onKeyDown={onKeyDown}
      aria-label={label}
      aria-busy={saving || undefined}
      aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown"
      style={s.style}
      data-slot="sortable-item"
      data-kanban-card=""
      data-dragging={s.isDragging ? "" : undefined}
      data-placeholder={s.isPlaceholder ? "" : undefined}
      data-saving={saving ? "" : undefined}
      className={cn(
        "vui-kanban-card group/card focus-ring relative cursor-grab touch-manipulation rounded-ui border border-surface-border bg-surface text-sm text-fg outline-none",
        "transition-[border-color,box-shadow,opacity] hover:border-field-border-hover active:cursor-grabbing",
        ctx.compact ? "p-2 pe-8" : "p-3 pe-9",
      )}
    >
      {ctx.renderCard(item, { isDragging: s.isDragging, compact: ctx.compact, overlay: false, saving, stage })}
      {saving ? <span className="sr-only">{ctx.t("saving")}</span> : null}
      <KanbanCardMenu id={id} cellId={cellId} index={index} total={total} label={label} />
    </article>
  );
}

function KanbanCardMenu({ id, cellId, index, total, label }: { id: string; cellId: string; index: number; total: number; label: string }) {
  const ctx = useKanban();
  const { stage: current, lane } = parseKanbanCellId(cellId);
  const [open, setOpen] = React.useState(false);
  const extra = ctx.cardMenu?.(ctx.byId.get(id));
  return (
    <div className={cn("absolute end-1 top-1 opacity-60 transition-opacity group-hover/card:opacity-100 group-focus-within/card:opacity-100 pointer-coarse:opacity-100", open && "opacity-100")}>
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <IconButton
            label={ctx.t("cardMenu", { item: label })}
            size="xs"
            tooltip={false}
            className="size-6 text-fg-subtle"
            data-slot="kanban-card-menu"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Ellipsis />
          </IconButton>
        </DropdownMenuTrigger>
        {open ? (
          <DropdownMenuContent align="end" size="sm">
            <DropdownMenuItem icon={<ArrowUp />} disabled={index === 0} onSelect={() => ctx.requestMove(id, cellId, index - 1)} shortcut="alt+up">
              {ctx.t("moveUp")}
            </DropdownMenuItem>
            <DropdownMenuItem icon={<ArrowDown />} disabled={index >= total - 1} onSelect={() => ctx.requestMove(id, cellId, index + 1)} shortcut="alt+down">
              {ctx.t("moveDown")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{ctx.t("moveToHeading")}</DropdownMenuLabel>
            {ctx.stages.map((s) => {
              const toCell = kanbanCellId(s.key, lane);
              if (s.key === current) {
                return (
                  <DropdownMenuItem key={s.key} disabled icon={<span aria-hidden className="size-2 rounded-full" style={{ background: stageToneColor(s.tone) }} />} description={ctx.t("currentStage")}>
                    {s.label}
                  </DropdownMenuItem>
                );
              }
              const end = ctx.cells.find((c) => c.id === toCell)?.items.length ?? 0;
              const ok = ctx.check(id, toCell, end);
              return (
                <DropdownMenuItem
                  key={s.key}
                  disabled={ok !== true}
                  description={ok !== true ? ok : undefined}
                  icon={<span aria-hidden className="size-2 rounded-full" style={{ background: stageToneColor(s.tone) }} />}
                  onSelect={() => ctx.requestMove(id, toCell, end)}
                >
                  {s.label}
                </DropdownMenuItem>
              );
            })}
            {extra ? (
              <>
                <DropdownMenuSeparator />
                {extra}
              </>
            ) : null}
          </DropdownMenuContent>
        ) : null}
      </DropdownMenu>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Quick add
// ---------------------------------------------------------------------------------------------

function KanbanQuickAdd({ stage, onAdd }: { stage: Stage; onAdd: NonNullable<KanbanProps<unknown>["onQuickAdd"]> }) {
  const { t, uid } = useKanban();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const inputId = React.useId();

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    setValue("");
    requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const submit = async () => {
    const title = value.trim();
    if (!title || busy) return;
    setBusy(true);
    try {
      await onAdd(stage.key, title);
      setValue("");
      inputRef.current?.focus();
    } catch {
      toast.danger(t("quickAddFailed"));
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div className="px-2 pb-2">
        <button
          ref={triggerRef}
          id={quickAddId(uid, stage.key)}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("addCardTo", { stage: stage.label })}
          className="focus-ring flex h-8 w-full items-center gap-1.5 rounded-ui-sm px-2 text-[13px] text-fg-muted transition-colors hover:bg-hover hover:text-fg"
        >
          <Plus aria-hidden className="size-3.5" />
          {t("addCard")}
        </button>
      </div>
    );
  }
  return (
    <form
      data-slot="kanban-quick-add"
      className="mx-2 mb-2 rounded-ui border border-field-border bg-field p-2 shadow-[0_1px_1px_rgb(0_0_0/0.04)]"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {t("quickAddLabel")}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        value={value}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
        }}
        placeholder={t("quickAddPlaceholder")}
        className="w-full bg-transparent px-1 py-1 text-sm text-fg outline-none placeholder:text-fg-subtle"
      />
      <div className="mt-2 flex items-center justify-end gap-1">
        <IconButton type="button" label={t("quickAddCancel")} size="xs" tooltip={false} onClick={close}>
          <X />
        </IconButton>
        <Button type="submit" size="xs" variant="primary" loading={busy} disabled={!value.trim()}>
          {t("quickAddSubmit")}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------------------------
// Card content helpers
// ---------------------------------------------------------------------------------------------

/** Card title. Put a link inside for the card's main action. */
export function KanbanCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 data-slot="kanban-card-title" className={cn("text-[13.5px] leading-snug font-medium text-fg [&_a]:focus-ring [&_a]:rounded-[2px] [&_a:hover]:underline [&_a]:underline-offset-2", className)} {...props} />;
}

/** A row of secondary facts (company, value, due date). */
export function KanbanCardMeta({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="kanban-card-meta" className={cn("mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-muted", className)} {...props} />;
}

/** Bottom row: badges start, avatars end. */
export function KanbanCardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="kanban-card-footer" className={cn("mt-2.5 flex min-w-0 items-center justify-between gap-2", className)} {...props} />;
}
