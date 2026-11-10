/**
 * Gantt scheduling core: task tree flattening, summary roll-ups, cycle detection and forward
 * scheduling of finish-to-start links (working-day aware). React-free.
 *
 * Dates are `YYYY-MM-DD`; `end` is the last day of the task, inclusive. A milestone has
 * `start === end`.
 */
import { addDays, compareIsoDate, diffDays } from "../../locale-data/core/date";
import { addWorkingDays, countWorkingDays, nextWorkingDay } from "../../locale-data/core/working-days";
import type { IsoDate, WorkCalendar } from "../../locale-data/core/types";

export type GanttTaskType = "task" | "milestone" | "summary";

export interface GanttTaskCore {
  id: string;
  parentId?: string;
  start: IsoDate;
  end: IsoDate;
  type?: GanttTaskType;
  progress?: number;
}

export interface GanttLinkCore {
  id: string;
  from: string;
  to: string;
  /** First release: `"FS"` (finish-to-start) only. */
  type?: "FS" | "SS" | "FF" | "SF";
  /** Days between the predecessor's end and the successor's start. Default 0. */
  lagDays?: number;
}

export interface FlatTask<T extends GanttTaskCore = GanttTaskCore> {
  task: T;
  depth: number;
  /** "1", "1.2", "1.2.3" */
  wbs: string;
  /** Row number (1-based) in the full, expanded order. */
  index: number;
  hasChildren: boolean;
  parentId?: string;
}

/** Depth-first order of a task forest (input order is kept among siblings). */
export function flattenTasks<T extends GanttTaskCore>(tasks: readonly T[]): FlatTask<T>[] {
  const ids = new Set(tasks.map((t) => t.id));
  const children = new Map<string | undefined, T[]>();
  for (const t of tasks) {
    const parent = t.parentId && ids.has(t.parentId) && t.parentId !== t.id ? t.parentId : undefined;
    const list = children.get(parent) ?? [];
    list.push(t);
    children.set(parent, list);
  }
  const out: FlatTask<T>[] = [];
  const seen = new Set<string>();
  const walk = (parent: string | undefined, depth: number, prefix: string) => {
    (children.get(parent) ?? []).forEach((task, i) => {
      if (seen.has(task.id)) return;
      seen.add(task.id);
      const wbs = prefix ? `${prefix}.${i + 1}` : String(i + 1);
      out.push({ task, depth, wbs, index: out.length + 1, hasChildren: (children.get(task.id)?.length ?? 0) > 0, parentId: parent });
      walk(task.id, depth + 1, wbs);
    });
  };
  walk(undefined, 0, "");
  return out;
}

/** Visible rows given a set of collapsed task ids. */
export function visibleTasks<T extends GanttTaskCore>(flat: readonly FlatTask<T>[], collapsed: ReadonlySet<string>): FlatTask<T>[] {
  const out: FlatTask<T>[] = [];
  let hideBelow = Infinity;
  for (const row of flat) {
    if (row.depth > hideBelow) continue;
    hideBelow = Infinity;
    out.push(row);
    if (row.hasChildren && collapsed.has(row.task.id)) hideBelow = row.depth;
  }
  return out;
}

/**
 * Summary tasks (and any task with children) span their children: earliest start, latest end,
 * duration-weighted progress. Returns new task objects for changed summaries only.
 */
export function rollupSummaries<T extends GanttTaskCore>(tasks: readonly T[]): T[] {
  const byId = new Map(tasks.map((t) => [t.id, { ...t }] as const));
  const kids = new Map<string, string[]>();
  for (const t of tasks) if (t.parentId && byId.has(t.parentId)) kids.set(t.parentId, [...(kids.get(t.parentId) ?? []), t.id]);
  const done = new Set<string>();
  const visit = (id: string, stack: Set<string>): T => {
    const t = byId.get(id)!;
    const c = kids.get(id);
    if (!c || done.has(id) || stack.has(id)) return t;
    stack.add(id);
    let start: IsoDate | undefined;
    let end: IsoDate | undefined;
    let weight = 0;
    let progress = 0;
    for (const k of c) {
      const child = visit(k, stack);
      if (!start || compareIsoDate(child.start, start) < 0) start = child.start;
      if (!end || compareIsoDate(child.end, end) > 0) end = child.end;
      const w = Math.max(1, diffDays(child.start, child.end) + 1);
      weight += w;
      progress += w * (child.progress ?? 0);
    }
    stack.delete(id);
    done.add(id);
    if (start && end) {
      t.start = start;
      t.end = end;
      t.progress = weight ? progress / weight : 0;
      if (!t.type || t.type === "task") t.type = "summary";
    }
    return t;
  };
  for (const id of byId.keys()) visit(id, new Set());
  return tasks.map((t) => byId.get(t.id)!);
}

/**
 * Cycles in the dependency graph, each as a list of task ids (`["a", "b", "c"]` for a → b → c → a).
 * Empty when the graph is acyclic.
 */
export function detectCycles(links: readonly Pick<GanttLinkCore, "from" | "to">[]): string[][] {
  const adj = new Map<string, string[]>();
  for (const l of links) adj.set(l.from, [...(adj.get(l.from) ?? []), l.to]);
  const state = new Map<string, 1 | 2>(); // 1 visiting, 2 done
  const stack: string[] = [];
  const cycles: string[][] = [];
  const dfs = (n: string) => {
    state.set(n, 1);
    stack.push(n);
    for (const m of adj.get(n) ?? []) {
      const s = state.get(m);
      if (s === 1) cycles.push(stack.slice(stack.indexOf(m)));
      else if (!s) dfs(m);
    }
    stack.pop();
    state.set(n, 2);
  };
  for (const n of adj.keys()) if (!state.has(n)) dfs(n);
  return cycles;
}

/** Would adding `from → to` create a cycle? */
export function createsCycle(links: readonly Pick<GanttLinkCore, "from" | "to">[], from: string, to: string): boolean {
  if (from === to) return true;
  return detectCycles([...links, { from, to }]).length > 0;
}

/** Task length in days or working days (inclusive of both ends). Milestones are 0. */
export function taskDuration(task: Pick<GanttTaskCore, "start" | "end" | "type">, cal?: WorkCalendar, unit: "workdays" | "days" = "workdays"): number {
  if (task.type === "milestone") return 0;
  if (unit === "days" || !cal) return diffDays(task.start, task.end) + 1;
  return countWorkingDays(task.start, task.end, cal);
}

/** Moves a task so it starts on `start`, keeping its length (working days when a calendar is given). */
export function moveTaskTo<T extends GanttTaskCore>(task: T, start: IsoDate, cal?: WorkCalendar, unit: "workdays" | "days" = "workdays"): T {
  if (task.type === "milestone") return { ...task, start, end: start };
  if (unit === "days" || !cal) return { ...task, start, end: addDays(start, diffDays(task.start, task.end)) };
  const s = nextWorkingDay(start, cal, 1);
  const len = Math.max(1, countWorkingDays(task.start, task.end, cal));
  return { ...task, start: s, end: addWorkingDays(s, len - 1, cal) };
}

/**
 * Forward scheduling of finish-to-start links: every successor starts no earlier than the day
 * after its predecessor ends (+ `lagDays`), skipping non-working days when a calendar is given.
 * Successors are only pushed later, never pulled earlier. Returns a new array with moved tasks
 * replaced; unchanged tasks keep their identity. Links in a cycle are ignored.
 *
 * ```ts
 * const next = scheduleForward(tasks, links, trWorkCalendar);
 * const moved = next.filter((t, i) => t !== tasks[i]);
 * ```
 */
export function scheduleForward<T extends GanttTaskCore>(tasks: readonly T[], links: readonly GanttLinkCore[], cal?: WorkCalendar, unit: "workdays" | "days" = "workdays"): T[] {
  const byId = new Map<string, T>(tasks.map((t) => [t.id, t]));
  const fs = links.filter((l) => (l.type ?? "FS") === "FS" && byId.has(l.from) && byId.has(l.to));
  const cyclic = new Set(detectCycles(fs).flat());
  const usable = fs.filter((l) => !(cyclic.has(l.from) && cyclic.has(l.to)));
  const incoming = new Map<string, GanttLinkCore[]>();
  const indeg = new Map<string, number>();
  for (const l of usable) {
    incoming.set(l.to, [...(incoming.get(l.to) ?? []), l]);
    indeg.set(l.to, (indeg.get(l.to) ?? 0) + 1);
  }
  const out = new Map<string, T>(byId);
  // Kahn order so predecessors settle first.
  const queue = tasks.filter((t) => !indeg.get(t.id)).map((t) => t.id);
  const order: string[] = [];
  const remaining = new Map(indeg);
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const l of usable) {
      if (l.from !== id) continue;
      const n = (remaining.get(l.to) ?? 1) - 1;
      remaining.set(l.to, n);
      if (n === 0) queue.push(l.to);
    }
  }
  for (const id of order) {
    const ins = incoming.get(id);
    if (!ins) continue;
    const task = out.get(id)!;
    let earliest: IsoDate | undefined;
    for (const l of ins) {
      const pred = out.get(l.from)!;
      const lag = l.lagDays ?? 0;
      let candidate = pred.type === "milestone" ? pred.end : addDays(pred.end, 1);
      if (cal && unit === "workdays") {
        candidate = nextWorkingDay(candidate, cal, 1);
        if (lag) candidate = addWorkingDays(candidate, lag, cal);
      } else if (lag) candidate = addDays(candidate, lag);
      if (!earliest || compareIsoDate(candidate, earliest) > 0) earliest = candidate;
    }
    if (earliest && compareIsoDate(task.start, earliest) < 0) out.set(id, moveTaskTo(task, earliest, cal, unit));
  }
  return tasks.map((t) => out.get(t.id)!);
}

/** Links whose successor starts before its predecessor allows (FS violated). */
export function linkViolations(tasks: readonly GanttTaskCore[], links: readonly GanttLinkCore[]): Set<string> {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const bad = new Set<string>();
  for (const l of links) {
    const a = byId.get(l.from);
    const b = byId.get(l.to);
    if (!a || !b || (l.type ?? "FS") !== "FS") continue;
    const limit = a.type === "milestone" ? a.end : addDays(a.end, 1);
    if (compareIsoDate(b.start, limit) < 0) bad.add(l.id);
  }
  return bad;
}
