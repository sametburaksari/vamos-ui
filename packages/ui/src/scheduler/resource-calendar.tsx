"use client";

/**
 * Resource calendar: people (rooms, equipment) as rows, days or hours as columns, holding
 * blocks (shifts, absences, bookings, allocations). Template palette, rule warnings, a working
 * calendar with holidays, a one-code-per-cell variant for attendance sheets, and a full
 * keyboard grid. Built on `useTimeScale` maths, `usePointerDrag` and `@tanstack/react-virtual`.
 */
import * as React from "react";
import { cva } from "class-variance-authority";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronLeft, ChevronRight, TriangleAlert, Users } from "lucide-react";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { useLabels } from "../lib/labels";
import { Avatar } from "../components/avatar";
import { Button, IconButton } from "../components/button";
import { Skeleton } from "../components/skeleton";
import { EmptyState } from "../components/empty-state";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/dropdown-menu";
import { toast } from "../components/toast";
import { usePointerDrag } from "../sortable/use-pointer-drag";
import { addDays, compareIsoDate, diffDays, eachDay } from "../locale-data/core/date";
import type { IsoDate, WorkCalendar } from "../locale-data/core/types";
import { clockToMinutes } from "./core/time-scale";
import { instantAt, localDate, localMinutes } from "./core/layout";
import { formatDuration } from "./core/duration";
import { dayInfo, fmtClock, fmtDay, fmtDayRange, fmtHour, resolveWorkCalendar, todayIn, toneColor, useAnnouncer, uses24h, type DayInfo, type ScheduleTone } from "./shared";

/* ------------------------------------------------------------------ */
/* Types & labels                                                      */
/* ------------------------------------------------------------------ */

export const resourceCalendarLabels = {
  grid: "Schedule",
  resource: "Name",
  today: "Today",
  previous: "Previous period",
  next: "Next period",
  templates: "Templates",
  templatesHint: "Pick a template, then click cells (or press Enter) to assign it. You can also drag it onto a cell.",
  armed: "{label} selected. Click cells or press Enter to assign; Escape to stop.",
  assign: "Assign {label}",
  clear: "Clear",
  remove: "Remove {label}",
  removed: "{count, plural, one {# block removed} other {# blocks removed}}",
  undo: "Undo",
  moveHint: "Alt + arrow keys move the blocks in a cell",
  moved: "Moved to {target}",
  empty: "Nothing planned in this period",
  noResources: "No one to schedule yet",
  cellEmpty: "empty",
  total: "Scheduled",
  headcount: "{count}",
  pending: "pending approval",
  approved: "approved",
  rejected: "rejected",
  draft: "draft",
  am: "morning",
  pm: "afternoon",
  weekend: "weekend",
  warning: "Warning: {message}",
  danger: "Problem: {message}",
  readOnly: "read-only",
  cellActions: "Actions",
  selection: "{count, plural, one {# cell selected} other {# cells selected}}",
  saveFailed: "Couldn't save the schedule. Your change was undone.",
  loading: "Loading schedule…",
};
export type ResourceCalendarLabels = typeof resourceCalendarLabels;

export interface Resource {
  id: string;
  title: string;
  avatarUrl?: string | null;
  /** Used by `groupBy="group"` ("Kitchen", "Front of house"). */
  group?: string;
  /** Second line under the name ("Chef de partie", "9 days left"). */
  meta?: React.ReactNode;
  /** The row can't be edited (e.g. people viewing their own row in a team plan). */
  readOnly?: boolean;
}

export type ResourceBlockStatus = "pending" | "approved" | "rejected" | "draft";

export interface ResourceBlock {
  id: string;
  resourceId: string;
  /**
   * Day unit: `YYYY-MM-DD` (whole days, `end` inclusive) or UTC ISO instants for timed shifts
   * (shown on the start day). Hour unit: UTC ISO instants.
   */
  start: string;
  end: string;
  kind?: string;
  label?: string;
  /** Short code for `variant="codes"` ("M", "AL", "S"). Falls back to `label`. */
  code?: string;
  tone?: ScheduleTone | (string & {});
  status?: ResourceBlockStatus;
  halfDay?: "am" | "pm";
  editable?: boolean;
  note?: string;
}

export interface ResourceTemplate {
  id: string;
  label: string;
  /** Wall-clock shift times; without them the template makes whole-day blocks. */
  start?: string;
  end?: string;
  tone?: ScheduleTone | (string & {});
  kind?: string;
  code?: string;
  /** Typed key that assigns it in `variant="codes"` (default: the code's first letter). */
  shortcut?: string;
  status?: ResourceBlockStatus;
}

export interface ResourceRuleViolation {
  blockId?: string;
  day?: IsoDate;
  message: string;
  severity: "warning" | "danger";
  /** `"column"`: flags the day's header (over capacity) instead of a cell. */
  scope?: "cell" | "column";
}

export interface ResourceRuleContext {
  resource: Resource;
  /** This resource's blocks (rejected ones excluded). */
  blocks: ResourceBlock[];
  /** Every visible block, for team-level rules. */
  allBlocks: ResourceBlock[];
  range: { start: IsoDate; end: IsoDate };
  timeZone: string;
}

/** A warning rule. Rules never block an edit; they explain what's off. */
export interface ResourceRule {
  id: string;
  /** Runs once per resource (rest hours, weekly caps). */
  check?(ctx: ResourceRuleContext): ResourceRuleViolation[];
  /** Runs once for the whole team (absence limits). Violations with a `day` flag that column. */
  checkTeam?(ctx: Omit<ResourceRuleContext, "resource" | "blocks"> & { resources: Resource[] }): ResourceRuleViolation[];
}

export interface ResourceBlocksChange {
  created?: ResourceBlock[];
  updated?: ResourceBlock[];
  deleted?: string[];
}

export interface ResourceCellRef {
  resourceId: string;
  day: IsoDate;
  /** Hour unit: the slot's UTC ISO start. */
  start?: string;
}

export interface ResourceCellAction {
  id: string;
  label: string;
  tone?: "default" | "danger";
}

export interface ResourceCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  resources: Resource[];
  blocks: ResourceBlock[];
  /** Visible days, inclusive `YYYY-MM-DD`. */
  range: { start: IsoDate; end: IsoDate };
  /** Shows ‹ Today › in the toolbar; you move `range`. */
  onRangeChange?(range: { start: IsoDate; end: IsoDate }): void;
  /** Columns are days, or hour slots of each day. Default `"day"`. */
  unit?: "day" | "hour";
  /** Hour unit: visible hours. Default 08:00–20:00. */
  hours?: { start: string; end: string };
  /** `"codes"`: one short code per cell (attendance sheets). Default `"blocks"`. */
  variant?: "blocks" | "codes";
  templates?: ResourceTemplate[];
  workCalendar?: WorkCalendar;
  rules?: ResourceRule[];
  /** Create / update / delete. Applied optimistically; a rejected promise reverts with a toast. */
  onBlocksChange?(change: ResourceBlocksChange): void | Promise<void>;
  /** Extra items in the cell menu ("Request time off"). */
  cellActions?: ResourceCellAction[];
  onCellAction?(action: { id: string; cells: ResourceCellRef[] }): void;
  /** Click / Enter on a block when no template is armed. Default opens the cell menu. */
  onBlockOpen?(block: ResourceBlock): void;
  renderBlock?(block: ResourceBlock, state: { compact: boolean }): React.ReactNode;
  /** Content of the summary row per column. Default: number of people scheduled. `false` hides the row. */
  summary?: ((day: IsoDate, blocks: ResourceBlock[]) => React.ReactNode) | false;
  /** Trailing value in each row header ("38 h"). */
  rowSummary?(resource: Resource, blocks: ResourceBlock[]): React.ReactNode;
  groupBy?: "group" | null;
  /** Rejected blocks are hidden unless this is set. */
  showRejected?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  /** IANA zone for timed blocks. Default: `LocaleProvider` `timeZone`. */
  timeZone?: string;
  /** Max height of the scrolling grid (CSS length). Default `"32rem"`. */
  height?: string | number;
  /** Rows are virtualized from this count. Default 60. */
  virtualizeAt?: number;
  /** Extra toolbar content. */
  toolbar?: React.ReactNode;
  /** Fixed "now" (tests, screenshots). */
  now?: Date | number;
  labels?: Partial<ResourceCalendarLabels>;
}

export const resourceCalendarVariants = /*#__PURE__*/ cva("ui-rc relative flex min-w-0 flex-col", {
  variants: { variant: { blocks: "", codes: "" }, framed: { true: "surface rounded-ui-lg", false: "" } },
  defaultVariants: { variant: "blocks", framed: true },
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const isDateOnly = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
let seq = 0;
const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `rc-${Date.now().toString(36)}-${++seq}`);

interface Column {
  key: string;
  day: IsoDate;
  /** Hour unit: minutes after midnight of the slot. */
  minute?: number;
  info: DayInfo;
}

interface CellPos {
  r: number;
  c: number;
}

/** Day a block starts on (timed blocks: in the zone). */
const blockDay = (b: ResourceBlock, tz: string) => (isDateOnly(b.start) ? b.start : localDate(b.start, tz));
const blockEndDay = (b: ResourceBlock, tz: string) => (isDateOnly(b.start) ? (isDateOnly(b.end) ? b.end : b.start) : blockDay(b, tz));

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * ```tsx
 * <ResourceCalendar
 *   resources={staff}
 *   blocks={shifts}
 *   range={{ start: "2026-11-09", end: "2026-11-15" }}
 *   templates={[{ id: "am", label: "Morning", start: "08:00", end: "16:00", tone: "chart-2" }]}
 *   rules={[minRest(11 * 60)]}
 *   onBlocksChange={save}
 * />
 * ```
 */
export const ResourceCalendar = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ResourceCalendarProps>(function ResourceCalendar(
  {
    resources,
    blocks,
    range,
    onRangeChange,
    unit = "day",
    hours = { start: "08:00", end: "20:00" },
    variant = "blocks",
    templates = [],
    workCalendar,
    rules = [],
    onBlocksChange,
    cellActions = [],
    onCellAction,
    onBlockOpen,
    renderBlock,
    summary,
    rowSummary,
    groupBy = null,
    showRejected = false,
    readOnly = false,
    loading = false,
    timeZone,
    height = "32rem",
    virtualizeAt = 60,
    toolbar,
    now: nowProp,
    labels,
    className,
    ...props
  },
  ref,
) {
  const { locale, timeZone: ctxZone, dir } = useLocale();
  const tz = timeZone ?? ctxZone;
  const rtl = dir === "rtl";
  const t = useLabels("resourceCalendar", resourceCalendarLabels, labels);
  const h24 = uses24h(locale);
  const now = nowProp === undefined ? Date.now() : typeof nowProp === "number" ? nowProp : nowProp.getTime();
  const today = todayIn(tz, now);
  const cal = React.useMemo(() => resolveWorkCalendar(workCalendar, locale), [workCalendar, locale]);
  const { message, announce } = useAnnouncer();
  const editable = !readOnly && Boolean(onBlocksChange);

  // Columns
  const hStart = clockToMinutes(hours.start);
  const hEnd = hours.end === "24:00" ? 1440 : clockToMinutes(hours.end);
  const columns = React.useMemo<Column[]>(() => {
    const days = eachDay(range.start, range.end);
    const out: Column[] = [];
    for (const d of days) {
      const info = dayInfo(d, cal, today);
      if (unit === "day") out.push({ key: d, day: d, info });
      else for (let m = hStart; m < hEnd; m += 60) out.push({ key: `${d}T${m}`, day: d, minute: m, info });
    }
    return out;
  }, [range.start, range.end, cal, today, unit, hStart, hEnd]);

  // Optimistic blocks
  const [pending, setPending] = React.useState<ResourceBlocksChange | null>(null);
  React.useEffect(() => setPending(null), [blocks]);
  const current = React.useMemo(() => {
    if (!pending) return blocks;
    const del = new Set(pending.deleted ?? []);
    const upd = new Map((pending.updated ?? []).map((b) => [b.id, b]));
    // The parent may already hold the created blocks for one render before the effect above clears
    // `pending`: skip those, or the same block renders twice (duplicate React keys).
    const have = new Set(blocks.map((b) => b.id));
    return [...blocks.filter((b) => !del.has(b.id)).map((b) => upd.get(b.id) ?? b), ...(pending.created ?? []).filter((b) => !have.has(b.id))];
  }, [blocks, pending]);
  const visibleBlocks = React.useMemo(() => current.filter((b) => showRejected || b.status !== "rejected"), [current, showRejected]);

  const apply = React.useCallback(
    (change: ResourceBlocksChange, undoable?: { message: string; inverse: ResourceBlocksChange }) => {
      if (!onBlocksChange) return;
      setPending((p) => merge(p, change));
      Promise.resolve()
        .then(() => onBlocksChange(change))
        .then(
          () => {
            if (undoable) toast(undoable.message, { action: { label: t("undo"), onClick: () => apply(undoable.inverse) } });
          },
          () => {
            setPending(null);
            toast.danger(t("saveFailed"));
          },
        );
    },
    [onBlocksChange, t],
  );

  // Rows (+ group headers)
  const rows = React.useMemo(() => {
    if (groupBy !== "group") return resources.map((r) => ({ type: "resource" as const, resource: r }));
    const groups = new Map<string, Resource[]>();
    for (const r of resources) groups.set(r.group ?? "", [...(groups.get(r.group ?? "") ?? []), r]);
    return [...groups].flatMap(([g, list]) => [{ type: "group" as const, group: g, count: list.length }, ...list.map((r) => ({ type: "resource" as const, resource: r }))]);
  }, [resources, groupBy]);
  const resourceRows = React.useMemo(() => rows.flatMap((r) => (r.type === "resource" ? [r.resource] : [])), [rows]);

  // Index: resource → column key → blocks
  const index = React.useMemo(() => {
    const map = new Map<string, Map<string, ResourceBlock[]>>();
    const put = (rid: string, key: string, b: ResourceBlock) => {
      let m = map.get(rid);
      if (!m) map.set(rid, (m = new Map()));
      m.set(key, [...(m.get(key) ?? []), b]);
    };
    for (const b of visibleBlocks) {
      if (unit === "day") {
        const s = blockDay(b, tz);
        const e = blockEndDay(b, tz);
        if (compareIsoDate(e, range.start) < 0 || compareIsoDate(s, range.end) > 0) continue;
        const from = compareIsoDate(s, range.start) < 0 ? range.start : s;
        const to = compareIsoDate(e, range.end) > 0 ? range.end : e;
        for (const d of eachDay(from, to)) put(b.resourceId, d, b);
      } else {
        if (isDateOnly(b.start)) continue;
        const d = localDate(b.start, tz);
        const m = Math.floor(localMinutes(b.start, tz) / 60) * 60;
        const key = `${d}T${Math.max(hStart, m)}`;
        put(b.resourceId, key, b);
      }
    }
    return map;
  }, [visibleBlocks, unit, tz, range.start, range.end, hStart]);

  // Rules
  const violations = React.useMemo(() => {
    const byBlock = new Map<string, ResourceRuleViolation[]>();
    const byCell = new Map<string, ResourceRuleViolation[]>();
    const byColumn = new Map<string, ResourceRuleViolation[]>();
    if (!rules.length) return { byBlock, byCell, byColumn };
    const active = visibleBlocks.filter((b) => b.status !== "rejected");
    for (const rule of rules) {
      for (const v of rule.checkTeam?.({ resources, allBlocks: active, range, timeZone: tz }) ?? []) {
        if (v.day) byColumn.set(v.day, [...(byColumn.get(v.day) ?? []), { ...v, scope: "column" }]);
      }
    }
    for (const resource of resources) {
      const own = active.filter((b) => b.resourceId === resource.id);
      for (const rule of rules) {
        if (!rule.check) continue;
        for (const v of rule.check({ resource, blocks: own, allBlocks: active, range, timeZone: tz })) {
          if (v.scope === "column" && v.day) byColumn.set(v.day, [...(byColumn.get(v.day) ?? []), v]);
          else if (v.blockId) byBlock.set(v.blockId, [...(byBlock.get(v.blockId) ?? []), v]);
          else if (v.day) byCell.set(`${resource.id}|${v.day}`, [...(byCell.get(`${resource.id}|${v.day}`) ?? []), v]);
        }
      }
    }
    return { byBlock, byCell, byColumn };
  }, [rules, visibleBlocks, resources, range, tz]);

  // Focus & selection
  const [active, setActive] = React.useState<CellPos>({ r: 0, c: Math.max(0, columns.findIndex((c) => c.info.today)) });
  const [anchor, setAnchor] = React.useState<CellPos | null>(null);
  const [armed, setArmed] = React.useState<ResourceTemplate | null>(null);
  const [menuFor, setMenuFor] = React.useState<CellPos | null>(null);
  const [dropTarget, setDropTarget] = React.useState<string | null>(null);
  const selecting = React.useRef(false);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const r = Math.min(active.r, Math.max(0, resourceRows.length - 1));
  const c = Math.min(active.c, Math.max(0, columns.length - 1));

  const selection = React.useMemo(() => {
    const a = anchor ?? { r, c };
    const r0 = Math.min(a.r, r), r1 = Math.max(a.r, r), c0 = Math.min(a.c, c), c1 = Math.max(a.c, c);
    const cells: CellPos[] = [];
    for (let i = r0; i <= r1; i++) for (let j = c0; j <= c1; j++) cells.push({ r: i, c: j });
    return { r0, r1, c0, c1, cells, has: (p: CellPos) => p.r >= r0 && p.r <= r1 && p.c >= c0 && p.c <= c1 };
  }, [anchor, r, c]);

  const cellRef = React.useCallback((p: CellPos): ResourceCellRef => {
    const col = columns[p.c]!;
    return { resourceId: resourceRows[p.r]!.id, day: col.day, start: col.minute !== undefined ? instantAt(col.day, col.minute, tz) : undefined };
  }, [columns, resourceRows, tz]);
  const blocksAt = React.useCallback((p: CellPos) => index.get(resourceRows[p.r]?.id ?? "")?.get(columns[p.c]?.key ?? "") ?? [], [index, resourceRows, columns]);
  const rowEditable = (p: CellPos) => editable && !resourceRows[p.r]?.readOnly;

  const virtual = resourceRows.length >= virtualizeAt && groupBy !== "group";
  const rowVirtualizer = useVirtualizer({
    count: virtual ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (variant === "codes" ? 36 : 56),
    overscan: 8,
  });

  const focusCell = React.useCallback(
    (p: CellPos) => {
      if (virtual) rowVirtualizer.scrollToIndex(p.r, { align: "auto" });
      requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-rc-cell="${p.r}:${p.c}"]`)?.focus({ preventScroll: false }));
    },
    [virtual, rowVirtualizer],
  );

  /* -------- actions -------- */

  const makeBlock = React.useCallback(
    (tpl: ResourceTemplate, p: CellPos): ResourceBlock => {
      const col = columns[p.c]!;
      const resourceId = resourceRows[p.r]!.id;
      const base = { id: newId(), resourceId, label: tpl.label, tone: tpl.tone, kind: tpl.kind ?? tpl.id, code: tpl.code, status: tpl.status };
      if (unit === "hour") {
        const s = instantAt(col.day, col.minute!, tz);
        return { ...base, start: s, end: instantAt(col.day, col.minute! + 60, tz) };
      }
      if (tpl.start && tpl.end) {
        const s = clockToMinutes(tpl.start);
        let e = clockToMinutes(tpl.end);
        if (e <= s) e += 1440; // overnight shift
        return { ...base, start: instantAt(col.day, s, tz), end: instantAt(col.day, e, tz) };
      }
      return { ...base, start: col.day, end: col.day };
    },
    [columns, resourceRows, unit, tz],
  );

  const assign = React.useCallback(
    (tpl: ResourceTemplate, cells: CellPos[]) => {
      const target = cells.filter(rowEditable);
      if (!target.length) return;
      const created = target.map((p) => makeBlock(tpl, p));
      const deleted = variant === "codes" ? target.flatMap((p) => blocksAt(p).filter((b) => b.editable !== false).map((b) => b.id)) : [];
      apply({ created, deleted: deleted.length ? deleted : undefined });
      announce(t("assign", { label: tpl.label }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [makeBlock, variant, blocksAt, apply, announce, t, editable, resourceRows],
  );

  const removeCells = React.useCallback(
    (cells: CellPos[]) => {
      const seen = new Map<string, ResourceBlock>();
      for (const p of cells.filter(rowEditable)) for (const b of blocksAt(p)) if (b.editable !== false) seen.set(b.id, b);
      if (!seen.size) return;
      const removed = [...seen.values()];
      apply({ deleted: removed.map((b) => b.id) }, { message: t("removed", { count: removed.length }), inverse: { created: removed } });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blocksAt, apply, t, editable, resourceRows],
  );

  const moveBlocks = React.useCallback(
    (list: ResourceBlock[], from: CellPos, to: CellPos) => {
      if (!rowEditable(from) || !rowEditable(to) || (from.r === to.r && from.c === to.c)) return;
      const toRes = resourceRows[to.r]!.id;
      const fromCol = columns[from.c]!;
      const toCol = columns[to.c]!;
      const updated = list.filter((b) => b.editable !== false).map((b) => {
        let next: ResourceBlock = { ...b, resourceId: toRes };
        if (unit === "day") {
          const dd = diffDays(fromCol.day, toCol.day);
          next = isDateOnly(b.start) ? { ...next, start: addDays(b.start, dd), end: addDays(isDateOnly(b.end) ? b.end : b.start, dd) } : { ...next, ...shiftInstants(b, dd * 1440 + 0) };
        } else {
          const dm = diffDays(fromCol.day, toCol.day) * 1440 + (toCol.minute! - fromCol.minute!);
          next = { ...next, ...shiftInstants(b, dm) };
        }
        return next;
      });
      if (!updated.length) return;
      apply({ updated });
      announce(t("moved", { target: `${resourceRows[to.r]!.title}, ${columnLabel(toCol)}` }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resourceRows, columns, unit, apply, announce, t, editable],
  );

  const columnLabel = (col: Column) =>
    col.minute !== undefined ? `${fmtDay(locale, col.day, { weekday: "short", day: "numeric", month: "short" })} ${fmtClock(locale, col.minute, h24)}` : fmtDay(locale, col.day, { weekday: "long", day: "numeric", month: "long" });

  /* -------- keyboard -------- */

  const onKeyDown = (k: React.KeyboardEvent) => {
    const target = k.target as HTMLElement;
    if (!target.dataset.rcCell) return;
    const h = rtl ? -1 : 1;
    const moves: Record<string, [number, number]> = { ArrowRight: [0, h], ArrowLeft: [0, -h], ArrowDown: [1, 0], ArrowUp: [-1, 0] };
    if (k.key in moves) {
      k.preventDefault();
      const [dr, dc] = moves[k.key]!;
      const next = { r: clampN(r + dr, resourceRows.length), c: clampN(c + dc, columns.length) };
      if (k.altKey && rowEditable({ r, c })) {
        const list = blocksAt({ r, c });
        if (list.length) moveBlocks(list, { r, c }, next);
        setAnchor(null);
      } else if (k.shiftKey) setAnchor((a) => a ?? { r, c });
      else setAnchor(null);
      setActive(next);
      focusCell(next);
      return;
    }
    if (k.key === "Home" || k.key === "End") {
      k.preventDefault();
      const next = { r: k.ctrlKey ? (k.key === "Home" ? 0 : resourceRows.length - 1) : r, c: k.key === "Home" ? 0 : columns.length - 1 };
      setAnchor(null);
      setActive(next);
      focusCell(next);
      return;
    }
    if (k.key === "Escape") {
      if (armed) {
        setArmed(null);
        k.preventDefault();
      } else setAnchor(null);
      return;
    }
    if (k.key === "Enter" || k.key === " ") {
      k.preventDefault();
      if (armed) assign(armed, selection.cells);
      else setMenuFor({ r, c });
      return;
    }
    if ((k.key === "Delete" || k.key === "Backspace") && editable) {
      k.preventDefault();
      removeCells(selection.cells);
      return;
    }
    if (variant === "codes" && editable && k.key.length === 1 && !k.metaKey && !k.ctrlKey && !k.altKey) {
      const key = k.key.toLocaleLowerCase(locale);
      const tpl = templates.find((x) => (x.shortcut ?? x.code ?? x.label).slice(0, x.shortcut ? undefined : 1).toLocaleLowerCase(locale) === key);
      if (tpl) {
        k.preventDefault();
        assign(tpl, selection.cells);
      }
    }
  };

  /* -------- pointer: select, paint, drop -------- */

  const cellFromPoint = (x: number, y: number): CellPos | null => {
    const el = typeof document !== "undefined" ? document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-rc-cell]") : null;
    if (!el || !gridRef.current?.contains(el)) return null;
    const [rr, cc] = el.dataset.rcCell!.split(":").map(Number) as [number, number];
    return { r: rr, c: cc };
  };

  const latest = React.useRef({ armed, selection, assign });
  latest.current = { armed, selection, assign };
  React.useEffect(() => {
    const up = () => {
      if (!selecting.current) return;
      selecting.current = false;
      const l = latest.current;
      // Painting a range with an armed template (a single cell is handled by click).
      if (l.armed && l.selection.cells.length > 1) l.assign(l.armed, l.selection.cells);
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  /* -------- render -------- */

  const blockText = (b: ResourceBlock) => {
    const parts = [b.label ?? b.code ?? b.kind ?? ""];
    if (!isDateOnly(b.start)) parts.push(`${fmtClock(locale, localMinutes(b.start, tz), h24)}–${fmtClock(locale, localMinutes(b.end, tz), h24)}`);
    if (b.halfDay) parts.push(t(b.halfDay));
    if (b.status && b.status !== "approved") parts.push(t(b.status));
    return parts.filter(Boolean).join(", ");
  };

  const titleText = unit === "hour" && range.start === range.end ? fmtDay(locale, range.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : fmtDayRange(locale, range.start, range.end);
  const span = diffDays(range.start, range.end) + 1;
  const step = (dirn: 1 | -1) => {
    if (!onRangeChange) return;
    const n = span >= 28 && range.start.endsWith("-01") ? 0 : span;
    if (n === 0) {
      const [y, m] = range.start.split("-").map(Number) as [number, number];
      const idx = y * 12 + (m - 1) + dirn;
      const start = `${String(Math.floor(idx / 12)).padStart(4, "0")}-${String((idx % 12) + 1).padStart(2, "0")}-01`;
      const end = addDays(`${addDays(start, 32).slice(0, 7)}-01`, -1);
      onRangeChange({ start, end });
    } else onRangeChange({ start: addDays(range.start, dirn * n), end: addDays(range.end, dirn * n) });
  };

  const gridCols = { gridTemplateColumns: `var(--rc-head) repeat(${columns.length}, minmax(var(--rc-col), 1fr))` } as React.CSSProperties;
  const showSummary = summary !== false && resourceRows.length > 0;
  const colViolations = (col: Column) => (col.minute === undefined || col.minute === hStart ? violations.byColumn.get(col.day) : undefined);

  const renderRow = (row: (typeof rows)[number], rowIndex: number, style?: React.CSSProperties, measure?: (el: HTMLElement | null) => void) => {
    if (row.type === "group") {
      return (
        <div key={`g-${row.group}`} role="row" className="ui-rc-group grid" style={{ ...gridCols, ...style }} ref={measure} data-index={rowIndex}>
          <div role="rowheader" aria-colspan={columns.length + 1} className="ui-rc-grouphead">
            <span>{row.group || "—"}</span>
            <span className="tabular text-fg-subtle">{row.count}</span>
          </div>
        </div>
      );
    }
    const res = row.resource;
    const ri = resourceRows.indexOf(res);
    const own = visibleBlocks.filter((b) => b.resourceId === res.id);
    return (
      <div key={res.id} role="row" aria-rowindex={ri + 2} data-slot="resource-row" data-readonly={res.readOnly ? "" : undefined} className="ui-rc-row grid" style={{ ...gridCols, ...style }} ref={measure} data-index={rowIndex}>
        <div role="rowheader" data-slot="resource-row-header" className="ui-rc-rowhead">
          {variant === "codes" ? null : <Avatar name={res.title} src={res.avatarUrl ?? undefined} size="sm" aria-hidden />}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-fg">{res.title}</div>
            {res.meta && variant !== "codes" ? <div className="truncate text-[11.5px] text-fg-muted">{res.meta}</div> : null}
          </div>
          {rowSummary ? <div className="shrink-0 text-[11.5px] tabular text-fg-muted">{rowSummary(res, own)}</div> : null}
        </div>
        {columns.map((col, ci) => {
          const p = { r: ri, c: ci };
          const list = index.get(res.id)?.get(col.key) ?? [];
          const issues = [...(violations.byCell.get(`${res.id}|${col.day}`) ?? []), ...list.flatMap((b) => violations.byBlock.get(b.id) ?? [])];
          const isActive = ri === r && ci === c;
          const selected = selection.cells.length > 1 && selection.has(p);
          const worst = issues.some((v) => v.severity === "danger") ? "danger" : issues.length ? "warning" : undefined;
          const name = [
            `${res.title}, ${columnLabel(col)}`,
            col.info.holidays[0]?.name,
            list.length ? list.map(blockText).join("; ") : t("cellEmpty"),
            ...issues.map((v) => t(v.severity, { message: v.message })),
          ].filter(Boolean).join(". ");
          return (
            <div
              key={col.key}
              role="gridcell"
              data-slot="resource-cell"
              data-rc-cell={`${ri}:${ci}`}
              data-weekend={col.info.weekend ? "" : undefined}
              data-holiday={col.info.holidays.length && col.info.working < 1 ? "" : undefined}
              data-today={col.info.today ? "" : undefined}
              data-selected={selected ? "" : undefined}
              data-drop={dropTarget === `${ri}:${ci}` ? "" : undefined}
              data-violation={worst}
              data-day-start={col.minute === hStart ? "" : undefined}
              aria-selected={selected || isActive}
              aria-readonly={!rowEditable(p) || undefined}
              tabIndex={isActive ? 0 : -1}
              className="ui-rc-cell"
              onFocus={() => {
                if (!isActive) setActive(p);
              }}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                selecting.current = true;
                if (e.shiftKey) setAnchor((a) => a ?? { r, c });
                else setAnchor(p);
                setActive(p);
              }}
              onPointerEnter={() => {
                if (selecting.current) setActive(p);
              }}
              onClick={(e) => {
                if (armed && !e.shiftKey && selection.cells.length <= 1) assign(armed, [p]);
              }}
              onDoubleClick={() => setMenuFor(p)}
            >
              {/* The full cell description is the name; the (non-focusable) chips are its visual form. */}
              <span className="sr-only">{name}</span>
              <span aria-hidden className="contents">
              {list.map((b) => (
                <ResourceBlockChip
                  key={b.id}
                  block={b}
                  variant={variant}
                  unit={unit}
                  col={col}
                  hStart={hStart}
                  tz={tz}
                  issues={violations.byBlock.get(b.id)}
                  continuesBefore={unit === "day" && compareIsoDate(blockDay(b, tz), col.day) < 0 && ci > 0}
                  continuesAfter={unit === "day" && compareIsoDate(blockEndDay(b, tz), col.day) > 0 && ci < columns.length - 1}
                  draggable={rowEditable(p) && b.editable !== false}
                  renderBlock={renderBlock}
                  locale={locale}
                  h24={h24}
                  onDropAt={(x, y) => {
                    const to = cellFromPoint(x, y);
                    setDropTarget(null);
                    if (to) moveBlocks([b], p, to);
                  }}
                  onHover={(x, y) => {
                    const to = cellFromPoint(x, y);
                    setDropTarget(to ? `${to.r}:${to.c}` : null);
                  }}
                />
              ))}
              </span>
              {worst ? <span aria-hidden className="ui-rc-flag" data-severity={worst} title={issues.map((v) => v.message).join("\n")} /> : null}
              {menuFor && menuFor.r === ri && menuFor.c === ci ? (
                <ResourceCellMenu
                  open
                  onOpenChange={(o) => {
                    if (!o) {
                      setMenuFor(null);
                      focusCell(p);
                    }
                  }}
                  title={`${res.title} · ${columnLabel(col)}`}
                  templates={rowEditable(p) ? templates : []}
                  blocks={rowEditable(p) ? list.filter((b) => b.editable !== false) : []}
                  actions={cellActions}
                  t={t}
                  blockText={blockText}
                  onAssign={(tpl) => assign(tpl, selection.cells.length > 1 && selection.has(p) ? selection.cells : [p])}
                  onRemove={(b) => apply({ deleted: [b.id] }, { message: t("removed", { count: 1 }), inverse: { created: [b] } })}
                  onClear={() => removeCells(selection.cells.length > 1 && selection.has(p) ? selection.cells : [p])}
                  onOpenBlock={onBlockOpen}
                  onAction={(id) => onCellAction?.({ id, cells: (selection.cells.length > 1 && selection.has(p) ? selection.cells : [p]).map(cellRef) })}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  const rowItems = virtual ? rowVirtualizer.getVirtualItems() : null;
  const totalSize = virtual ? rowVirtualizer.getTotalSize() : 0;

  return (
    <div
      ref={ref}
      data-slot="resource-calendar"
      data-unit={unit}
      data-variant={variant}
      aria-busy={loading || undefined}
      className={cn(resourceCalendarVariants({ variant }), className)}
      {...props}
    >
      {(onRangeChange || toolbar || templates.length) ? (
        <div data-slot="resource-toolbar" className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2.5 sm:px-4">
          {onRangeChange ? (
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={() => {
                const s = unit === "hour" ? today : addDays(today, -((diffDays(range.start, today) % span + span) % span));
                onRangeChange({ start: s, end: addDays(s, span - 1) });
              }}>
                {t("today")}
              </Button>
              <IconButton size="sm" label={t("previous")} onClick={() => step(rtl ? 1 : -1)}>
                <ChevronLeft className="rtl:-scale-x-100" />
              </IconButton>
              <IconButton size="sm" label={t("next")} onClick={() => step(rtl ? -1 : 1)}>
                <ChevronRight className="rtl:-scale-x-100" />
              </IconButton>
            </div>
          ) : null}
          <h2 aria-live="polite" className="me-auto min-w-0 truncate font-heading text-[15px] font-semibold tracking-[-0.01em] text-fg">{titleText}</h2>
          {toolbar}
        </div>
      ) : null}

      {templates.length && editable ? (
        <ResourcePalette templates={templates} armed={armed} onArm={setArmed} t={t} onDropAt={(tpl, x, y) => {
          const to = cellFromPoint(x, y);
          setDropTarget(null);
          if (to) assign(tpl, [to]);
        }} onHover={(x, y) => {
          const to = cellFromPoint(x, y);
          setDropTarget(to ? `${to.r}:${to.c}` : null);
        }} variant={variant} />
      ) : null}

      {!resourceRows.length && !loading ? (
        <div className="p-6"><EmptyState size="sm" icon={<Users />} title={t("noResources")} /></div>
      ) : (
        <div ref={scrollRef} data-slot="resource-scroll" className="relative min-h-0 overflow-auto overscroll-contain" style={{ maxHeight: typeof height === "number" ? `${height}px` : height }}>
          <div
            ref={gridRef}
            role="grid"
            aria-label={`${t("grid")}, ${titleText}`}
            aria-rowcount={resourceRows.length + 1 + (showSummary ? 1 : 0)}
            aria-colcount={columns.length + 1}
            aria-multiselectable
            aria-busy={loading || undefined}
            data-armed={armed ? "" : undefined}
            className={cn("ui-rc-grid min-w-max", loading && "ui-rc-dim")}
            onKeyDown={onKeyDown}
          >
            <div role="row" aria-rowindex={1} data-slot="resource-header" className="ui-rc-head sticky top-0 z-[3] grid" style={gridCols}>
              <div role="columnheader" className="ui-rc-corner">{t("resource")}</div>
              {columns.map((col) => {
                const issues = colViolations(col);
                const first = col.minute === undefined || col.minute === hStart;
                return (
                  <div
                    key={col.key}
                    role="columnheader"
                    aria-label={[columnLabel(col), col.info.holidays[0]?.name, ...(issues ?? []).map((v) => t(v.severity, { message: v.message }))].filter(Boolean).join(". ")}
                    data-today={col.info.today ? "" : undefined}
                    data-weekend={col.info.weekend ? "" : undefined}
                    data-holiday={col.info.holidays.length && col.info.working < 1 ? "" : undefined}
                    data-violation={issues?.length ? (issues.some((v) => v.severity === "danger") ? "danger" : "warning") : undefined}
                    data-day-start={col.minute === hStart ? "" : undefined}
                    className="ui-rc-colhead"
                    title={[col.info.holidays.map((h) => h.name).join(" · "), ...(issues ?? []).map((v) => v.message)].filter(Boolean).join("\n") || undefined}
                  >
                    {unit === "day" ? (
                      <>
                        <span className="text-[10.5px] font-medium text-fg-muted">{fmtDay(locale, col.day, { weekday: "short" })}</span>
                        <span className="ui-rc-daynum tabular">{fmtDay(locale, col.day, { day: "numeric" })}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10.5px] font-medium text-fg-muted">{first ? fmtDay(locale, col.day, { weekday: "short", day: "numeric" }) : " "}</span>
                        <span className="ui-rc-hour tabular">{fmtHour(locale, col.minute! / 60, h24)}</span>
                      </>
                    )}
                    {issues?.length ? <TriangleAlert aria-hidden className="ui-rc-colwarn" /> : null}
                  </div>
                );
              })}
            </div>

            {loading && !resourceRows.length
              ? Array.from({ length: 5 }, (_, i) => (
                  <div key={i} role="row" className="ui-rc-row grid" style={gridCols}>
                    <div role="rowheader" className="ui-rc-rowhead"><Skeleton className="h-4 w-28" /></div>
                    {columns.map((col) => <div key={col.key} role="gridcell" className="ui-rc-cell"><Skeleton className="m-1.5 h-5 w-[70%]" /></div>)}
                  </div>
                ))
              : virtual && rowItems ? (
                <>
                  {rowItems[0] && rowItems[0].start > 0 ? <div aria-hidden style={{ height: rowItems[0].start }} /> : null}
                  {rowItems.map((vi) => renderRow(rows[vi.index]!, vi.index, undefined, rowVirtualizer.measureElement))}
                  {rowItems.length ? <div aria-hidden style={{ height: Math.max(0, totalSize - (rowItems.at(-1)!.end)) }} /> : null}
                </>
              ) : (
                rows.map((row, i) => renderRow(row, i))
              )}

            {showSummary ? (
              <div role="row" aria-rowindex={resourceRows.length + 2} data-slot="resource-summary" className="ui-rc-summary sticky bottom-0 z-[2] grid" style={gridCols}>
                <div role="rowheader" className="ui-rc-rowhead text-[12px] font-medium text-fg-muted">{t("total")}</div>
                {columns.map((col) => {
                  const inCol = resourceRows.flatMap((res) => index.get(res.id)?.get(col.key) ?? []).filter((b) => b.status !== "rejected");
                  const content = summary ? summary(col.day, inCol) : t("headcount", { count: new Set(inCol.map((b) => b.resourceId)).size });
                  return (
                    <div key={col.key} role="gridcell" className="ui-rc-sumcell tabular">
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      )}
      <span className="sr-only" aria-live="polite">{armed ? t("armed", { label: armed.label }) : message}</span>
    </div>
  );
});

function clampN(v: number, n: number) {
  return Math.max(0, Math.min(n - 1, v));
}

function shiftInstants(b: ResourceBlock, minutes: number): Pick<ResourceBlock, "start" | "end"> {
  const d = minutes * 60_000;
  return { start: new Date(Date.parse(b.start) + d).toISOString(), end: new Date(Date.parse(b.end) + d).toISOString() };
}

function merge(a: ResourceBlocksChange | null, b: ResourceBlocksChange): ResourceBlocksChange {
  if (!a) return b;
  const createdIds = new Set((a.created ?? []).map((x) => x.id));
  const deleted = new Set(b.deleted ?? []);
  const created = [...(a.created ?? []).filter((x) => !deleted.has(x.id)).map((x) => b.updated?.find((u) => u.id === x.id) ?? x), ...(b.created ?? [])];
  const updated = [...(a.updated ?? []).filter((x) => !deleted.has(x.id) && !b.updated?.some((u) => u.id === x.id)), ...(b.updated ?? []).filter((u) => !createdIds.has(u.id))];
  return { created, updated, deleted: [...(a.deleted ?? []), ...[...deleted].filter((id) => !createdIds.has(id))] };
}

/* ------------------------------------------------------------------ */
/* Block chip                                                          */
/* ------------------------------------------------------------------ */

interface ChipProps {
  block: ResourceBlock;
  variant: "blocks" | "codes";
  unit: "day" | "hour";
  col: Column;
  hStart: number;
  tz: string;
  issues?: ResourceRuleViolation[];
  continuesBefore: boolean;
  continuesAfter: boolean;
  draggable: boolean;
  locale: string;
  h24: boolean;
  renderBlock?: ResourceCalendarProps["renderBlock"];
  onDropAt(x: number, y: number): void;
  onHover(x: number, y: number): void;
}

function ResourceBlockChip({ block: b, variant, unit, col, tz, issues, continuesBefore, continuesAfter, draggable, renderBlock, locale, h24, onDropAt, onHover }: ChipProps) {
  const [offset, setOffset] = React.useState<{ x: number; y: number } | null>(null);
  const drag = usePointerDrag({
    disabled: !draggable,
    onStart: () => setOffset({ x: 0, y: 0 }),
    onMove: (s) => {
      setOffset(s.rawDelta);
      onHover(s.origin.x + s.rawDelta.x, s.origin.y + s.rawDelta.y);
    },
    onEnd: (s) => {
      setOffset(null);
      onDropAt(s.origin.x + s.rawDelta.x, s.origin.y + s.rawDelta.y);
    },
    onCancel: () => setOffset(null),
  });
  const timed = !isDateOnly(b.start);
  let style: React.CSSProperties = { ["--ev" as string]: toneColor(b.tone) };
  if (unit === "hour" && timed) {
    const startMin = localMinutes(b.start, tz);
    const durMin = (Date.parse(b.end) - Date.parse(b.start)) / 60_000;
    const lead = (startMin - (col.minute ?? 0)) / 60;
    style = { ...style, position: "absolute", insetBlock: "4px", insetInlineStart: `calc(${lead * 100}% + 2px)`, width: `calc(${(durMin / 60) * 100}% - 4px)` };
  }
  if (offset) style = { ...style, translate: `${offset.x}px ${offset.y}px`, zIndex: 10 };
  const code = b.code ?? b.label?.slice(0, 2) ?? "•";
  const time = timed ? `${fmtClock(locale, localMinutes(b.start, tz), h24)}–${fmtClock(locale, localMinutes(b.end, tz), h24)}` : undefined;
  return (
    <span
      aria-hidden
      data-slot="resource-block"
      data-status={b.status ?? "approved"}
      data-half={b.halfDay}
      data-continues-before={continuesBefore ? "" : undefined}
      data-continues-after={continuesAfter ? "" : undefined}
      data-dragging={offset ? "" : undefined}
      data-issue={issues?.length ? (issues.some((v) => v.severity === "danger") ? "danger" : "warning") : undefined}
      className={cn("ui-rc-block", variant === "codes" && "ui-rc-code")}
      style={{ ...style, ...(draggable ? drag.bind.style : null) }}
      title={issues?.map((v) => v.message).join("\n") || b.note}
      onPointerDown={(e) => {
        if (!draggable) return;
        e.stopPropagation();
        drag.bind.onPointerDown(e);
      }}
    >
      {renderBlock ? (
        renderBlock(b, { compact: variant === "codes" })
      ) : variant === "codes" ? (
        code
      ) : (
        <>
          <span className="truncate font-medium">{continuesBefore ? " " : (b.label ?? b.kind)}</span>
          {time && !continuesBefore ? <span className="truncate tabular text-fg-muted">{time}</span> : null}
        </>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

function ResourcePalette({ templates, armed, onArm, onDropAt, onHover, t, variant }: { templates: ResourceTemplate[]; armed: ResourceTemplate | null; onArm(t: ResourceTemplate | null): void; onDropAt(t: ResourceTemplate, x: number, y: number): void; onHover(x: number, y: number): void; t: ReturnType<typeof useLabels<ResourceCalendarLabels>>; variant: "blocks" | "codes" }) {
  const hintId = React.useId();
  return (
    <div data-slot="resource-palette" role="toolbar" aria-label={t("templates")} aria-describedby={hintId} className="ui-rc-palette flex flex-wrap items-center gap-1.5 border-b border-line px-3 py-2 sm:px-4">
      <span className="me-1 text-[11.5px] font-medium text-fg-muted">{t("templates")}</span>
      {templates.map((tpl) => (
        <PaletteChip key={tpl.id} tpl={tpl} pressed={armed?.id === tpl.id} onArm={() => onArm(armed?.id === tpl.id ? null : tpl)} onDropAt={onDropAt} onHover={onHover} variant={variant} />
      ))}
      <span id={hintId} className="sr-only">{t("templatesHint")} {t("moveHint")}</span>
    </div>
  );
}

function PaletteChip({ tpl, pressed, onArm, onDropAt, onHover, variant }: { tpl: ResourceTemplate; pressed: boolean; onArm(): void; onDropAt(t: ResourceTemplate, x: number, y: number): void; onHover(x: number, y: number): void; variant: "blocks" | "codes" }) {
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const dragged = React.useRef(false);
  const drag = usePointerDrag({
    onStart: () => {
      dragged.current = true;
    },
    onMove: (s) => {
      const p = { x: s.origin.x + s.rawDelta.x, y: s.origin.y + s.rawDelta.y };
      setPos(p);
      onHover(p.x, p.y);
    },
    onEnd: (s) => {
      setPos(null);
      onDropAt(tpl, s.origin.x + s.rawDelta.x, s.origin.y + s.rawDelta.y);
    },
    onCancel: () => setPos(null),
  });
  const time = tpl.start && tpl.end ? `${tpl.start}–${tpl.end}` : undefined;
  return (
    <>
      <button
        type="button"
        aria-pressed={pressed}
        data-slot="resource-template"
        className="ui-rc-tpl focus-ring"
        style={{ ["--ev" as string]: toneColor(tpl.tone), ...drag.bind.style }}
        onPointerDown={(e) => {
          dragged.current = false;
          drag.bind.onPointerDown(e);
        }}
        onClick={() => !dragged.current && onArm()}
      >
        {variant === "codes" && tpl.code ? <span className="ui-rc-tplcode">{tpl.code}</span> : <span aria-hidden className="ui-rc-tpldot" />}
        <span>{tpl.label}</span>
        {time ? <span className="tabular text-fg-muted">{time}</span> : null}
      </button>
      {pos ? (
        <span aria-hidden className="ui-rc-tplghost" style={{ ["--ev" as string]: toneColor(tpl.tone), left: pos.x, top: pos.y }}>
          {tpl.label}
        </span>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Cell menu (the non-drag path for every edit)                        */
/* ------------------------------------------------------------------ */

function ResourceCellMenu({
  open,
  onOpenChange,
  title,
  templates,
  blocks,
  actions,
  t,
  blockText,
  onAssign,
  onRemove,
  onClear,
  onOpenBlock,
  onAction,
}: {
  open: boolean;
  onOpenChange(o: boolean): void;
  title: string;
  templates: ResourceTemplate[];
  blocks: ResourceBlock[];
  actions: ResourceCellAction[];
  t: ReturnType<typeof useLabels<ResourceCalendarLabels>>;
  blockText(b: ResourceBlock): string;
  onAssign(tpl: ResourceTemplate): void;
  onRemove(b: ResourceBlock): void;
  onClear(): void;
  onOpenBlock?(b: ResourceBlock): void;
  onAction(id: string): void;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <span aria-hidden className="ui-rc-menuanchor" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={2} className="min-w-56" aria-label={`${t("cellActions")}: ${title}`}>
        <DropdownMenuLabel className="truncate">{title}</DropdownMenuLabel>
        {templates.map((tpl) => (
          <DropdownMenuItem key={tpl.id} onSelect={() => onAssign(tpl)}>
            <span aria-hidden className="ui-rc-tpldot" style={{ ["--ev" as string]: toneColor(tpl.tone) }} />
            {t("assign", { label: tpl.label })}
          </DropdownMenuItem>
        ))}
        {blocks.length ? <DropdownMenuSeparator /> : null}
        {onOpenBlock ? blocks.map((b) => (
          <DropdownMenuItem key={`o-${b.id}`} onSelect={() => onOpenBlock(b)}>
            {blockText(b)}
          </DropdownMenuItem>
        )) : null}
        {blocks.map((b) => (
          <DropdownMenuItem key={b.id} tone="danger" onSelect={() => onRemove(b)}>
            {t("remove", { label: b.label ?? b.code ?? b.kind ?? "" })}
          </DropdownMenuItem>
        ))}
        {blocks.length > 1 ? (
          <DropdownMenuItem tone="danger" onSelect={onClear}>
            {t("clear")}
          </DropdownMenuItem>
        ) : null}
        {actions.length ? <DropdownMenuSeparator /> : null}
        {actions.map((a) => (
          <DropdownMenuItem key={a.id} tone={a.tone} onSelect={() => onAction(a.id)}>
            {a.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Example rules (recipe data, not built-in policy)                    */
/* ------------------------------------------------------------------ */

/** Warns when two timed blocks of a person are closer than `minutes` (e.g. 11 h rest). */
export function minRestRule(minutes: number, message: (gapMin: number, locale?: string) => string = (g) => `Only ${formatDuration(g, "en-US")} rest before this shift`): ResourceRule {
  return {
    id: `min-rest-${minutes}`,
    check({ blocks }) {
      const timed = blocks.filter((b) => !isDateOnly(b.start)).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
      const out: ResourceRuleViolation[] = [];
      for (let i = 1; i < timed.length; i++) {
        const gap = (Date.parse(timed[i]!.start) - Date.parse(timed[i - 1]!.end)) / 60_000;
        if (gap >= 0 && gap < minutes) out.push({ blockId: timed[i]!.id, message: message(gap), severity: "warning" });
      }
      return out;
    },
  };
}

/** Warns when a person's timed blocks in the visible range exceed `maxMinutes` (e.g. 45 h week). */
export function maxHoursRule(maxMinutes: number, message: (totalMin: number) => string = (m) => `${formatDuration(m, "en-US")} scheduled, over the ${formatDuration(maxMinutes, "en-US")} limit`): ResourceRule {
  return {
    id: `max-hours-${maxMinutes}`,
    check({ blocks }) {
      const timed = blocks.filter((b) => !isDateOnly(b.start)).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
      let total = 0;
      for (const b of timed) {
        total += (Date.parse(b.end) - Date.parse(b.start)) / 60_000;
        if (total > maxMinutes) return [{ blockId: b.id, message: message(timed.reduce((s, x) => s + (Date.parse(x.end) - Date.parse(x.start)) / 60_000, 0)), severity: "danger" }];
      }
      return [];
    },
  };
}

/** Flags days on which more than `max` people have a block of one of `kinds` (e.g. 3 absent). */
export function maxConcurrentRule(max: number, kinds: string[], message: (count: number) => string = (n) => `${n} people off, the limit is ${max}`): ResourceRule {
  return {
    id: `max-concurrent-${max}-${kinds.join("-")}`,
    checkTeam({ allBlocks, range, timeZone }) {
      const out: ResourceRuleViolation[] = [];
      const relevant = allBlocks.filter((b) => kinds.includes(b.kind ?? ""));
      for (const day of eachDay(range.start, range.end)) {
        const people = new Set(relevant.filter((b) => compareIsoDate(blockDay(b, timeZone), day) <= 0 && compareIsoDate(blockEndDay(b, timeZone), day) >= 0).map((b) => b.resourceId));
        if (people.size > max) out.push({ day, message: message(people.size), severity: "warning", scope: "column" });
      }
      return out;
    },
  };
}
