/**
 * React-free board math: the shared `Stage` type, grouping, column summaries and the move
 * helper that applies a Kanban move to a flat item array. Safe in server components and workers.
 */
import { addDecimal, multiplyDecimal } from "../format/core";

/** Semantic tone or one of the six chart hues. Drives the 3px top edge and the header dot. */
export type StageTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info" | `chart-${1 | 2 | 3 | 4 | 5 | 6}`;

/**
 * A step in a pipeline or workflow. Shared by Kanban, Funnel, Approval flow and Status picker.
 *
 * ```ts
 * const stages: Stage[] = [
 *   { key: "lead", label: "Lead", tone: "chart-1", category: "open", probability: 0.1 },
 *   { key: "won", label: "Won", tone: "success", category: "done", probability: 1 },
 * ];
 * ```
 */
export interface Stage {
  key: string;
  label: string;
  tone?: StageTone;
  /** What kind of step it is: reporting rolls stages up by category. */
  category?: "open" | "active" | "done" | "canceled";
  /** Win probability 0…1, used by `weightedSum`. */
  probability?: number;
  /** Work-in-progress limit: the header shows "5/8" and warns above it. */
  wipLimit?: number;
  /** Initially collapsed (uncontrolled boards). */
  collapsed?: boolean;
}

/** CSS colour for a stage tone (a token reference). */
export function stageToneColor(tone: StageTone | undefined): string {
  if (!tone || tone === "neutral") return "var(--fg-subtle)";
  if (tone === "accent") return "var(--accent-ink)";
  if (tone.startsWith("chart-")) return `var(--${tone})`;
  return `var(--${tone})`;
}

/** Items grouped by stage key, in stage order, keeping the items' own order. Unknown stages are dropped. */
export function groupByStage<T>(items: readonly T[], stages: readonly Stage[], getStageKey: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>(stages.map((s) => [s.key, [] as T[]]));
  for (const it of items) out.get(getStageKey(it))?.push(it);
  return out;
}

/** Exact sum of a decimal-string field: `sumBy(deals, (d) => d.value)` → `"245000.00"`. */
export function sumBy<T>(items: readonly T[], getValue: (item: T) => string | null | undefined, scale = 2): string {
  return addDecimal(
    items.map((i) => getValue(i)).filter((v): v is string => typeof v === "string" && v !== ""),
    scale,
  );
}

/** Σ value × stage probability as an exact decimal string (`probability` missing → 0). */
export function weightedSum<T>(items: readonly T[], stage: Stage, getValue: (item: T) => string | null | undefined, scale = 2): string {
  const p = stage.probability ?? 0;
  return multiplyDecimal(sumBy(items, getValue, scale), String(p), scale);
}

export interface KanbanMoveEvent {
  id: string;
  /** Stage keys. Equal for a reorder inside one column. */
  from: string;
  to: string;
  /** Final index in the target column (or lane cell). */
  index: number;
  /** Index in the source column before the move. */
  fromIndex: number;
  /** Lane keys (swimlanes only). */
  lane?: string;
  fromLane?: string;
}

/**
 * Applies a move to a flat item array: changes the stage (and lane) with `update`, and places
 * the item so it lands at `index` among the items of its new column (and lane).
 *
 * ```ts
 * onMove={(e) => setDeals((d) => applyKanbanMove(d, e, {
 *   getId: (x) => x.id, getStageKey: (x) => x.stage,
 *   update: (x, stage) => ({ ...x, stage }),
 * }))}
 * ```
 */
export function applyKanbanMove<T>(
  items: readonly T[],
  e: KanbanMoveEvent,
  o: {
    getId: (item: T) => string;
    getStageKey: (item: T) => string;
    getLaneKey?: (item: T) => string;
    update: (item: T, stage: string, lane: string | undefined) => T;
  },
): T[] {
  const at = items.findIndex((i) => o.getId(i) === e.id);
  if (at === -1) return items.slice();
  const moved = o.update(items[at]!, e.to, e.lane);
  const rest = items.filter((_, i) => i !== at);
  const inCell = (i: T) => o.getStageKey(i) === e.to && (e.lane === undefined || !o.getLaneKey || o.getLaneKey(i) === e.lane);
  const cell = rest.map((it, i) => (inCell(it) ? i : -1)).filter((i) => i !== -1);
  let insertAt: number;
  if (cell.length === 0) insertAt = rest.length;
  else if (e.index >= cell.length) insertAt = cell[cell.length - 1]! + 1;
  else insertAt = cell[Math.max(0, e.index)]!;
  rest.splice(insertAt, 0, moved);
  return rest;
}

/** Separator for lane × stage container ids. */
export const KANBAN_CELL_SEP = "␟";
export const kanbanCellId = (stage: string, lane?: string) => (lane === undefined ? stage : `${lane}${KANBAN_CELL_SEP}${stage}`);
export function parseKanbanCellId(id: string): { stage: string; lane?: string } {
  const i = id.indexOf(KANBAN_CELL_SEP);
  return i === -1 ? { stage: id } : { lane: id.slice(0, i), stage: id.slice(i + KANBAN_CELL_SEP.length) };
}
