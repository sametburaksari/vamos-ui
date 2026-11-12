"use client";

import * as React from "react";
import { diffChars, diffLines, diffWordsWithSpace } from "diff";
import { ArrowDown, ArrowUp, ChevronsUpDown, History, RotateCcw } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { formatValue, type ValueFormat } from "../lib/value-format";
import { ConfirmDialog } from "./alert-dialog";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Button, IconButton } from "./button";
import { Skeleton } from "./skeleton";
import { toast } from "./toast";
import { ToggleGroup, ToggleGroupItem } from "./toggle";

export const versionHistoryLabels = {
  versions: "Versions",
  current: "Current",
  autosave: "Autosave",
  published: "Published",
  manual: "Saved",
  system: "System",
  before: "Before",
  after: "After",
  comparing: "Comparing {before} with {after}",
  split: "Split",
  unified: "Unified",
  viewMode: "Diff layout",
  onlyChanges: "Only changes",
  identical: "These versions are identical",
  identicalHint: "Pick another version from the list to compare.",
  loading: "Loading versions…",
  loadError: "Couldn't load this version.",
  retry: "Try again",
  added: "Added",
  removed: "Removed",
  changed: "Changed",
  unchanged: "Unchanged",
  addedLine: "Added line",
  removedLine: "Removed line",
  stats: "{added} additions, {removed} deletions",
  prevChange: "Previous change",
  nextChange: "Next change",
  changeOf: "Change {index} of {total}",
  unchangedLines: "{count, plural, one {Show # unchanged line} other {Show # unchanged lines}}",
  expandAll: "Expand all",
  diffRegion: "Differences between {before} and {after}",
  field: "Field",
  restore: "Restore this version",
  restoreTitle: "Restore the version from {date}?",
  restoreBody: "The current content is kept as a version too, so you can undo this.",
  restoreConfirm: "Restore",
  restored: "Version restored",
  restoreError: "Couldn't restore the version",
  yes: "Yes",
  no: "No",
  empty: "—",
  selectHint: "Select two versions to compare.",
};
export type VersionHistoryLabels = Partial<typeof versionHistoryLabels>;
type T = LabelFn<typeof versionHistoryLabels>;

/* ------------------------------------------------------------------ */
/* Text diff model                                                      */
/* ------------------------------------------------------------------ */

export type DiffGranularity = "line" | "word" | "char";
type SegKind = "same" | "add" | "del";
interface Seg {
  text: string;
  kind: SegKind;
}
export interface DiffLine {
  type: SegKind;
  text: string;
  oldNo?: number;
  newNo?: number;
  /** Word / char highlights inside a changed line. */
  segments?: Seg[];
}

function splitLines(v: string): string[] {
  const lines = v.split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function inline(a: string, b: string, g: DiffGranularity): [Seg[], Seg[]] {
  const parts = g === "char" ? diffChars(a, b) : diffWordsWithSpace(a, b);
  const left: Seg[] = [];
  const right: Seg[] = [];
  for (const p of parts) {
    if (p.added) right.push({ text: p.value, kind: "add" });
    else if (p.removed) left.push({ text: p.value, kind: "del" });
    else {
      left.push({ text: p.value, kind: "same" });
      right.push({ text: p.value, kind: "same" });
    }
  }
  return [left, right];
}

/** Line diff with optional word / char highlights inside changed lines (jsdiff). */
export function diffText(before: string, after: string, granularity: DiffGranularity = "word"): DiffLine[] {
  const changes = diffLines(before, after);
  const out: DiffLine[] = [];
  let o = 1;
  let n = 1;
  for (let i = 0; i < changes.length; i++) {
    const c = changes[i]!;
    if (!c.added && !c.removed) {
      for (const text of splitLines(c.value)) out.push({ type: "same", text, oldNo: o++, newNo: n++ });
      continue;
    }
    if (c.removed) {
      const dels = splitLines(c.value);
      const next = changes[i + 1];
      const adds = next?.added ? splitLines(next.value) : [];
      if (next?.added) i++;
      const delLines: DiffLine[] = dels.map((text) => ({ type: "del", text, oldNo: o++ }));
      const addLines: DiffLine[] = adds.map((text) => ({ type: "add", text, newNo: n++ }));
      if (granularity !== "line") {
        for (let k = 0; k < Math.min(dels.length, adds.length); k++) {
          const [l, r] = inline(dels[k]!, adds[k]!, granularity);
          delLines[k]!.segments = l;
          addLines[k]!.segments = r;
        }
      }
      out.push(...delLines, ...addLines);
      continue;
    }
    for (const text of splitLines(c.value)) out.push({ type: "add", text, newNo: n++ });
  }
  return out;
}

type Row<L> = { kind: "line"; line: L; change: boolean } | { kind: "gap"; id: number; count: number };

function collapse<L>(lines: L[], isChange: (l: L) => boolean, context: number, open: Set<number>): Row<L>[] {
  const keep = lines.map(() => false);
  lines.forEach((l, i) => {
    if (!isChange(l)) return;
    for (let k = Math.max(0, i - context); k <= Math.min(lines.length - 1, i + context); k++) keep[k] = true;
  });
  const rows: Row<L>[] = [];
  let i = 0;
  while (i < lines.length) {
    if (keep[i] || open.has(i)) {
      rows.push({ kind: "line", line: lines[i]!, change: isChange(lines[i]!) });
      i++;
      continue;
    }
    let j = i;
    while (j < lines.length && !keep[j]) j++;
    if (j - i <= 2) {
      for (let k = i; k < j; k++) rows.push({ kind: "line", line: lines[k]!, change: false });
    } else rows.push({ kind: "gap", id: i, count: j - i });
    i = j;
  }
  return rows;
}

function Segments({ line }: { line: DiffLine }) {
  if (!line.segments) {
    if (line.type === "add") return <ins className="ui-diff-text">{line.text || " "}</ins>;
    if (line.type === "del") return <del className="ui-diff-text">{line.text || " "}</del>;
    return <span className="ui-diff-text">{line.text || " "}</span>;
  }
  return (
    <span className="ui-diff-text">
      {line.segments.map((s, i) =>
        s.kind === "add" ? (
          <ins key={i} data-word="">
            {s.text}
          </ins>
        ) : s.kind === "del" ? (
          <del key={i} data-word="">
            {s.text}
          </del>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* DiffView                                                             */
/* ------------------------------------------------------------------ */

export interface DiffViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  before: string;
  after: string;
  /** Highlight changes inside lines by word (default), char, or not at all (`"line"`). */
  granularity?: DiffGranularity;
  /** `unified` (default) or `split` (before at the start side, after at the end). */
  mode?: "split" | "unified";
  /** Unchanged lines kept around each change; longer runs collapse behind "Show N unchanged lines". Default 3. `Infinity` shows all. */
  context?: number;
  /** Column / region names ("v12 · Nov 8", "Current"). */
  beforeLabel?: string;
  afterLabel?: string;
  /** Line number gutters. Default `true`. */
  lineNumbers?: boolean;
  /** Previous / next change buttons and the +/− summary. Default `true`. */
  toolbar?: boolean;
  /** Extra toolbar content (mode switch, restore). */
  actions?: React.ReactNode;
  /** Wrap long lines (prose) instead of scrolling (code). Default `true`. */
  wrap?: boolean;
  labels?: VersionHistoryLabels;
}

/**
 * Text diff of two versions — line diff with word-level highlights (jsdiff), unified or
 * side by side, with collapsed unchanged runs and change navigation (buttons and `n` / `p`).
 * Colour is never the only signal: `+` / `−` gutters, `<ins>` / `<del>` and screen-reader text.
 *
 * ```tsx
 * <DiffView before={v11.body} after={v12.body} mode="split" beforeLabel="v11" afterLabel="v12" />
 * ```
 */
export const DiffView = /*#__PURE__*/ React.forwardRef<HTMLDivElement, DiffViewProps>(function DiffView(
  { before, after, granularity = "word", mode = "unified", context = 3, beforeLabel, afterLabel, lineNumbers = true, toolbar = true, actions, wrap = true, labels, className, ...props },
  ref,
) {
  const t = useLabels("versionHistory", versionHistoryLabels, labels);
  const f = useFormat();
  const lines = React.useMemo(() => diffText(before, after, granularity), [before, after, granularity]);
  const [open, setOpen] = React.useState<Set<number>>(() => new Set());
  const [current, setCurrent] = React.useState(-1);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const added = lines.filter((l) => l.type === "add").length;
  const removed = lines.filter((l) => l.type === "del").length;
  const bLabel = beforeLabel ?? t("before");
  const aLabel = afterLabel ?? t("after");

  React.useEffect(() => {
    setOpen(new Set());
    setCurrent(-1);
  }, [before, after]);

  type Pair = { left?: DiffLine; right?: DiffLine; idx: number };
  const pairs = React.useMemo<Pair[]>(() => {
    const out: Pair[] = [];
    let i = 0;
    while (i < lines.length) {
      const l = lines[i]!;
      if (l.type === "same") {
        out.push({ left: l, right: l, idx: i });
        i++;
        continue;
      }
      const dels: DiffLine[] = [];
      const adds: DiffLine[] = [];
      const start = i;
      while (i < lines.length && lines[i]!.type === "del") dels.push(lines[i++]!);
      while (i < lines.length && lines[i]!.type === "add") adds.push(lines[i++]!);
      for (let k = 0; k < Math.max(dels.length, adds.length); k++) out.push({ left: dels[k], right: adds[k], idx: start + k });
    }
    return out;
  }, [lines]);

  const rows = React.useMemo(
    () =>
      mode === "split"
        ? collapse(pairs, (p) => p.left?.type !== "same" || p.right?.type !== "same", context, open)
        : collapse(lines, (l) => l.type !== "same", context, open),
    [mode, pairs, lines, context, open],
  );

  // Change blocks: first row of each contiguous run of changed rows.
  const blocks = React.useMemo(() => {
    const out: number[] = [];
    rows.forEach((r, i) => {
      if (r.kind === "line" && r.change && !(rows[i - 1]?.kind === "line" && (rows[i - 1] as { change: boolean }).change)) out.push(i);
    });
    return out;
  }, [rows]);

  const go = (dir: 1 | -1) => {
    if (!blocks.length) return;
    const next = current < 0 ? (dir === 1 ? 0 : blocks.length - 1) : (current + dir + blocks.length) % blocks.length;
    setCurrent(next);
    const el = bodyRef.current?.querySelector<HTMLElement>(`[data-row="${blocks[next]}"]`);
    el?.scrollIntoView({ block: "center", behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const expand = (id: number, count: number) =>
    setOpen((s) => {
      const n = new Set(s);
      for (let k = id; k < id + count; k++) n.add(k);
      return n;
    });

  const identical = added === 0 && removed === 0;
  const gaps = rows.filter((r) => r.kind === "gap") as Array<{ kind: "gap"; id: number; count: number }>;

  const gapRow = (r: { id: number; count: number }, i: number) => (
    <div key={`g${r.id}`} data-row={i} className="ui-diff-gap">
      <button type="button" onClick={() => expand(r.id, r.count)} className="focus-ring">
        <ChevronsUpDown aria-hidden className="size-3.5" />
        {t("unchangedLines", { count: r.count })}
      </button>
    </div>
  );

  const gutter = (no: number | undefined) => (lineNumbers ? <span className="ui-diff-no" aria-hidden>{no ?? ""}</span> : null);
  const marker = (type: SegKind | undefined) => (
    <span className="ui-diff-marker" aria-hidden>
      {type === "add" ? "+" : type === "del" ? "−" : ""}
    </span>
  );
  const sr = (type: SegKind | undefined) => (type === "add" ? <span className="sr-only">{t("addedLine")}: </span> : type === "del" ? <span className="sr-only">{t("removedLine")}: </span> : null);

  return (
    <div
      ref={ref}
      data-slot="diff-view"
      data-mode={mode}
      data-wrap={wrap ? "" : undefined}
      data-numbers={lineNumbers ? "" : undefined}
      className={cn("ui-diff overflow-hidden rounded-ui border border-line bg-surface-2", className)}
      {...props}
    >
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-2.5 py-1.5">
          <span className="font-mono text-xs tabular">
            <span aria-hidden>
              <span className="text-success">+{f.number(added)}</span> <span className="text-danger">−{f.number(removed)}</span>
            </span>
            <span className="sr-only">{t("stats", { added: f.number(added), removed: f.number(removed) })}</span>
          </span>
          {blocks.length > 0 ? (
            <span className="text-xs text-fg-subtle tabular" aria-live="polite">
              {current >= 0 ? t("changeOf", { index: current + 1, total: blocks.length }) : null}
            </span>
          ) : null}
          <span className="ms-auto flex items-center gap-1">
            {actions}
            {gaps.length > 1 ? (
              <Button size="xs" variant="ghost" onClick={() => expand(0, lines.length)}>
                {t("expandAll")}
              </Button>
            ) : null}
            <IconButton label={t("prevChange")} shortcut="p" size="xs" tooltip={false} disabled={!blocks.length} onClick={() => go(-1)}>
              <ArrowUp />
            </IconButton>
            <IconButton label={t("nextChange")} shortcut="n" size="xs" tooltip={false} disabled={!blocks.length} onClick={() => go(1)}>
              <ArrowDown />
            </IconButton>
          </span>
        </div>
      ) : null}
      {identical ? (
        <p className="px-4 py-6 text-center text-sm text-fg-muted">{t("identical")}</p>
      ) : (
        <div
          ref={bodyRef}
          role="region"
          tabIndex={0}
          aria-label={t("diffRegion", { before: bLabel, after: aLabel })}
          onKeyDown={(e) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === "n" || e.key === "j") {
              e.preventDefault();
              go(1);
            } else if (e.key === "p" || e.key === "k") {
              e.preventDefault();
              go(-1);
            }
          }}
          className="ui-diff-body focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)"
        >
          {mode === "split" ? (
            <>
              <div className="ui-diff-split ui-diff-head" aria-hidden>
                <span>{bLabel}</span>
                <span>{aLabel}</span>
              </div>
              {(rows as Row<Pair>[]).map((r, i) =>
                r.kind === "gap" ? (
                  gapRow(r, i)
                ) : (
                  <div key={r.line.idx + (r.line.left?.type ?? "") + (r.line.right?.type ?? "")} data-row={i} data-current={blocks[current] === i ? "" : undefined} className="ui-diff-split">
                    <div className="ui-diff-line" data-type={r.line.left?.type ?? "empty"} dir="auto">
                      {gutter(r.line.left?.oldNo)}
                      {marker(r.line.left?.type === "same" ? undefined : r.line.left?.type)}
                      {r.line.left ? (
                        <>
                          {r.line.left.type !== "same" ? sr(r.line.left.type) : null}
                          <Segments line={r.line.left} />
                        </>
                      ) : null}
                    </div>
                    <div className="ui-diff-line" data-type={r.line.right?.type ?? "empty"} dir="auto">
                      {gutter(r.line.right?.newNo)}
                      {marker(r.line.right?.type === "same" ? undefined : r.line.right?.type)}
                      {r.line.right && r.line.right.type !== "same" ? sr(r.line.right.type) : null}
                      {r.line.right ? r.line.right.type === "same" ? <span className="ui-diff-text" aria-hidden>{r.line.right.text || " "}</span> : <Segments line={r.line.right} /> : null}
                    </div>
                  </div>
                ),
              )}
            </>
          ) : (
            (rows as Row<DiffLine>[]).map((r, i) =>
              r.kind === "gap" ? (
                gapRow(r, i)
              ) : (
                <div key={`${r.line.type}${r.line.oldNo ?? ""}-${r.line.newNo ?? ""}`} data-row={i} data-current={blocks[current] === i ? "" : undefined} className="ui-diff-line" data-type={r.line.type} dir="auto">
                  {gutter(r.line.oldNo)}
                  {gutter(r.line.newNo)}
                  {marker(r.line.type)}
                  {sr(r.line.type)}
                  <Segments line={r.line} />
                </div>
              ),
            )
          )}
        </div>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Record (field) diff                                                  */
/* ------------------------------------------------------------------ */

export interface FieldDiffField {
  key: string;
  label: string;
  /** Number / date / money formatting of the value. */
  format?: ValueFormat;
  /** `"text-long"` renders a word diff (descriptions, notes). */
  type?: "text" | "text-long" | "boolean" | "list" | "json";
  /** Custom value renderer. */
  render?: (value: unknown) => React.ReactNode;
}

export type FieldChange = "added" | "removed" | "changed" | "same";
export interface RecordDiffEntry {
  key: string;
  change: FieldChange;
  before?: unknown;
  after?: unknown;
}

const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
const same = (a: unknown, b: unknown) => (typeof a === "object" || typeof b === "object" ? JSON.stringify(a) === JSON.stringify(b) : a === b);

/** Field-by-field comparison of two records. Pass `fields` to pick and order keys; default: every key of both. */
export function diffRecords(a: Record<string, unknown> | null | undefined, b: Record<string, unknown> | null | undefined, fields?: Array<{ key: string }> | string[]): RecordDiffEntry[] {
  const before = a ?? {};
  const after = b ?? {};
  const keys = fields ? fields.map((f) => (typeof f === "string" ? f : f.key)) : Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  return keys.map((key) => {
    const x = before[key];
    const y = after[key];
    const change: FieldChange = isEmpty(x) && isEmpty(y) ? "same" : isEmpty(x) ? "added" : isEmpty(y) ? "removed" : same(x, y) ? "same" : "changed";
    return { key, change, before: x, after: y };
  });
}

function humanize(key: string) {
  const s = key.replace(/[_.-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export interface FieldDiffProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  before: Record<string, unknown> | null | undefined;
  after: Record<string, unknown> | null | undefined;
  /** Fields to compare, in order. Default: every key, humanized labels. */
  fields?: FieldDiffField[];
  /** Hide unchanged fields. Default `true`. */
  onlyChanges?: boolean;
  beforeLabel?: string;
  afterLabel?: string;
  labels?: VersionHistoryLabels;
}

/**
 * Record changes field by field — price, status, owner, permissions. Before is struck through,
 * after is marked; long text fields get a word diff.
 *
 * ```tsx
 * <FieldDiff before={v1} after={v2} fields={[
 *   { key: "amount", label: "Amount", format: "currency" },
 *   { key: "stage", label: "Stage" },
 * ]} />
 * ```
 */
export const FieldDiff = /*#__PURE__*/ React.forwardRef<HTMLDivElement, FieldDiffProps>(function FieldDiff(
  { before, after, fields, onlyChanges = true, beforeLabel, afterLabel, labels, className, ...props },
  ref,
) {
  const t = useLabels("versionHistory", versionHistoryLabels, labels);
  const f = useFormat();
  const defs = fields ?? diffRecords(before, after).map((d) => ({ key: d.key, label: humanize(d.key) }) as FieldDiffField);
  const entries = diffRecords(before, after, defs);
  const rows = entries.map((e, i) => ({ e, def: defs[i]! })).filter((r) => !onlyChanges || r.e.change !== "same");

  const show = (def: FieldDiffField, v: unknown): React.ReactNode => {
    if (isEmpty(v)) return <span className="text-fg-subtle">{t("empty")}</span>;
    if (def.render) return def.render(v);
    if (typeof v === "boolean" || def.type === "boolean") return v ? t("yes") : t("no");
    if (Array.isArray(v) || def.type === "list") return (Array.isArray(v) ? v : [v]).map(String).join(", ");
    if (typeof v === "object" || def.type === "json") return <code className="font-mono text-[12px]">{JSON.stringify(v)}</code>;
    if (def.format && (typeof v === "number" || typeof v === "string")) return formatValue(f, v, def.format);
    return String(v);
  };

  if (rows.length === 0) {
    return (
      <div ref={ref} data-slot="field-diff" className={cn("rounded-ui border border-line bg-surface-2 px-4 py-5 text-center text-sm text-fg-muted", className)} {...props}>
        {t("identical")}
      </div>
    );
  }

  const toneOf: Record<FieldChange, "success" | "danger" | "warning" | "neutral"> = { added: "success", removed: "danger", changed: "warning", same: "neutral" };

  return (
    <div ref={ref} data-slot="field-diff" className={cn("overflow-x-auto rounded-ui border border-line bg-surface-2", className)} {...props}>
      <table className="ui-field-diff w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th scope="col">{t("field")}</th>
            <th scope="col">{beforeLabel ?? t("before")}</th>
            <th scope="col">{afterLabel ?? t("after")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ e, def }) => (
            <tr key={e.key} data-change={e.change}>
              <th scope="row">
                <span className="flex flex-wrap items-center gap-1.5">
                  {def.label}
                  {e.change !== "same" ? (
                    <Badge size="sm" tone={toneOf[e.change]} className="font-normal">
                      {t(e.change)}
                    </Badge>
                  ) : null}
                </span>
              </th>
              {def.type === "text-long" && e.change === "changed" ? (
                <td colSpan={2}>
                  <DiffView before={String(e.before ?? "")} after={String(e.after ?? "")} toolbar={false} lineNumbers={false} context={Infinity} className="border-0 bg-transparent" labels={labels} />
                </td>
              ) : (
                <>
                  <td dir="auto">{e.change === "same" ? show(def, e.before) : e.change === "added" ? show(def, e.before) : <del>{show(def, e.before)}</del>}</td>
                  <td dir="auto">{e.change === "same" ? show(def, e.after) : e.change === "removed" ? show(def, e.after) : <ins>{show(def, e.after)}</ins>}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* VersionHistory                                                       */
/* ------------------------------------------------------------------ */

export interface Version {
  id: string;
  /** ISO instant. */
  createdAt: string;
  author?: { name: string; avatar?: string };
  /** "v12 · Pricing update". Default: the date. */
  label?: string;
  /** Default `"manual"`. */
  kind?: "manual" | "autosave" | "published" | "system";
  current?: boolean;
  /** Short note ("Changed hero copy and pricing"). */
  summary?: string;
}

export type VersionContent = string | Record<string, unknown>;

export interface VersionHistoryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  versions: Version[];
  /** Pair to compare (any order; older is "before"). Default: the newest non-current version vs current. */
  compare?: [string, string];
  defaultCompare?: [string, string];
  onCompareChange?: (pair: [string, string]) => void;
  /** Content of a version: text (DiffView) or a record (FieldDiff). Cached per id. */
  loadVersion: (id: string) => VersionContent | Promise<VersionContent>;
  /** Record versions: which fields to compare. */
  fields?: FieldDiffField[];
  /** Shows "Restore this version" (with confirmation) for the older selected version. */
  onRestore?: (id: string) => void | Promise<void>;
  /** `page` (list beside the diff) or `panel` (stacked, for a Sheet). Default `"page"`. */
  layout?: "panel" | "page";
  /** Text diff layout. Uncontrolled; default `"unified"` (`"split"` on `page` layout). */
  defaultMode?: "split" | "unified";
  granularity?: DiffGranularity;
  /** Collapsed context lines (DiffView). Default 3. */
  context?: number;
  labels?: VersionHistoryLabels;
}

/**
 * Revisions of a record: pick two (listbox with two-selection), see what changed — text with
 * word highlights or record fields — and restore an older one after confirmation.
 *
 * ```tsx
 * <VersionHistory
 *   versions={revisions}
 *   loadVersion={(id) => api.revision(id).then((r) => r.body)}
 *   onRestore={(id) => api.restore(postId, id)}
 * />
 * ```
 */
export const VersionHistory = /*#__PURE__*/ React.forwardRef<HTMLDivElement, VersionHistoryProps>(function VersionHistory(
  { versions, compare, defaultCompare, onCompareChange, loadVersion, fields, onRestore, layout = "page", defaultMode, granularity = "word", context = 3, labels, className, ...props },
  ref,
) {
  const t = useLabels("versionHistory", versionHistoryLabels, labels);
  const f = useFormat();
  const sorted = React.useMemo(() => [...versions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [versions]);
  const currentId = sorted.find((v) => v.current)?.id ?? sorted[0]?.id;
  const fallback = React.useMemo<[string, string] | null>(() => {
    if (!sorted.length) return null;
    const other = sorted.find((v) => v.id !== currentId);
    return [other?.id ?? currentId!, currentId!];
  }, [sorted, currentId]);
  const [pairState, setPairState] = React.useState<[string, string] | null>(defaultCompare ?? null);
  const pair = compare ?? pairState ?? fallback;
  const setPair = (p: [string, string]) => {
    setPairState(p);
    onCompareChange?.(p);
  };
  const [lastClicked, setLastClicked] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"split" | "unified">(defaultMode ?? (layout === "page" ? "split" : "unified"));
  const [onlyChanges, setOnlyChanges] = React.useState(true);
  const [active, setActive] = React.useState(0);
  const [cache, setCache] = React.useState<Record<string, VersionContent>>({});
  const [errors, setErrors] = React.useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = React.useState(false);
  const listRef = React.useRef<HTMLUListElement>(null);
  const loadRef = React.useRef(loadVersion);
  loadRef.current = loadVersion;
  const listId = React.useId();

  const [older, newer] = React.useMemo(() => {
    if (!pair) return [undefined, undefined];
    const a = sorted.find((v) => v.id === pair[0]);
    const b = sorted.find((v) => v.id === pair[1]);
    if (!a || !b) return [a ?? b, b ?? a];
    return a.createdAt <= b.createdAt ? [a, b] : [b, a];
  }, [pair, sorted]);

  const load = React.useCallback((id: string) => {
    setErrors((e) => ({ ...e, [id]: false }));
    Promise.resolve(loadRef.current(id))
      .then((c) => setCache((m) => ({ ...m, [id]: c })))
      .catch(() => setErrors((e) => ({ ...e, [id]: true })));
  }, []);

  React.useEffect(() => {
    for (const v of [older, newer]) if (v && cache[v.id] === undefined && !errors[v.id]) load(v.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [older?.id, newer?.id]);

  const toggle = (id: string) => {
    if (!pair) return;
    const selected = Array.from(new Set(pair));
    if (selected.includes(id)) {
      if (selected.length < 2) return;
      const keep = selected.find((x) => x !== id)!;
      setPair([keep, keep === currentId ? keep : currentId!]);
      return;
    }
    const keep = lastClicked && selected.includes(lastClicked) ? lastClicked : (selected.find((x) => x === currentId) ?? selected[0]!);
    setLastClicked(id);
    setPair([keep, id]);
  };

  const vLabel = (v?: Version) => (v ? (v.label ?? f.date(v.createdAt, "datetime-short")) : "");

  const onListKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const max = sorted.length - 1;
    let next = active;
    if (e.key === "ArrowDown") next = Math.min(max, active + 1);
    else if (e.key === "ArrowUp") next = Math.max(0, active - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = max;
    else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle(sorted[active]!.id);
      return;
    } else return;
    e.preventDefault();
    setActive(next);
    listRef.current?.querySelectorAll<HTMLElement>("[role=option]")[next]?.focus();
  };

  const kindTone = { autosave: "neutral", published: "success", system: "info", manual: "neutral" } as const;
  const a = older && cache[older.id];
  const b = newer && cache[newer.id];
  const loading = (older && a === undefined && !errors[older.id]) || (newer && b === undefined && !errors[newer.id]);
  const failed = (older && errors[older.id]) || (newer && errors[newer.id]);
  const isRecord = (a !== undefined && typeof a === "object") || (b !== undefined && typeof b === "object");
  const restorable = onRestore && older && newer && older.id !== newer.id && !older.current ? older : undefined;

  const list = (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      aria-multiselectable="true"
      aria-label={t("versions")}
      aria-describedby={`${listId}-hint`}
      onKeyDown={onListKey}
      className={cn("flex flex-col gap-px", layout === "panel" ? "max-h-72 overflow-y-auto" : "max-h-72 overflow-y-auto @[52rem]/vh:max-h-none")}
    >
      {sorted.map((v, i) => {
        const selected = Boolean(pair?.includes(v.id));
        const role = v.id === older?.id && older?.id !== newer?.id ? "before" : v.id === newer?.id ? "after" : null;
        return (
          <li
            key={v.id}
            role="option"
            aria-selected={selected}
            tabIndex={i === active ? 0 : -1}
            onClick={() => {
              setActive(i);
              toggle(v.id);
            }}
            onFocus={() => setActive(i)}
            data-selected={selected ? "" : undefined}
            className={cn(
              "group relative flex cursor-pointer items-start gap-2.5 rounded-ui-sm px-2.5 py-2 outline-none transition-colors",
              "hover:bg-hover focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-inset",
              selected && "bg-selected hover:bg-selected",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-2 start-0 w-0.5 rounded-full transition-colors",
                role === "after" ? "bg-accent-ink" : role === "before" ? "bg-fg-muted" : "bg-transparent",
              )}
            />
            {v.author ? <Avatar name={v.author.name} src={v.author.avatar} size="sm" className="mt-px" /> : (
              <span aria-hidden className="mt-px inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-selected text-fg-muted [&_svg]:size-3.5">
                <History />
              </span>
            )}
            <span className="grid min-w-0 flex-1 gap-0.5">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-[13px] font-medium text-fg">{vLabel(v)}</span>
                {v.current ? (
                  <Badge tone="accent" size="sm">
                    {t("current")}
                  </Badge>
                ) : v.kind && v.kind !== "manual" ? (
                  <Badge tone={kindTone[v.kind]} size="sm">
                    {t(v.kind)}
                  </Badge>
                ) : null}
              </span>
              <span className="truncate text-xs text-fg-muted">
                {[v.author?.name, v.label ? f.date(v.createdAt, "datetime-short") : null].filter(Boolean).join(" · ")}
              </span>
              {v.summary ? <span className="line-clamp-2 text-xs text-fg-muted">{v.summary}</span> : null}
            </span>
            {role ? (
              <span className={cn("mt-0.5 shrink-0 rounded-ui-sm px-1.5 py-px font-mono text-[10px] uppercase tracking-wider", role === "after" ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-fg-muted ring-1 ring-line")}>
                {t(role)}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );

  const toolbarActions = (
    <>
      {!isRecord ? (
        <ToggleGroup aria-label={t("viewMode")} size="xs" value={mode} onValueChange={(v) => v && setMode(v as "split" | "unified")} className="max-sm:hidden">
          <ToggleGroupItem value="unified">{t("unified")}</ToggleGroupItem>
          <ToggleGroupItem value="split">{t("split")}</ToggleGroupItem>
        </ToggleGroup>
      ) : null}
    </>
  );

  const compareView =
    !older || !newer ? (
      <p className="text-sm text-fg-muted">{t("selectHint")}</p>
    ) : failed ? (
      <div role="alert" className="flex items-center gap-3 rounded-ui border border-line bg-surface-2 px-4 py-4 text-sm text-danger">
        {t("loadError")}
        <Button size="xs" onClick={() => [older, newer].forEach((v) => errors[v.id] && load(v.id))}>
          {t("retry")}
        </Button>
      </div>
    ) : loading ? (
      <div role="status" aria-busy="true" className="grid gap-2 rounded-ui border border-line bg-surface-2 p-4">
        <span className="sr-only">{t("loading")}</span>
        {[92, 78, 85, 40, 66].map((w, i) => (
          <Skeleton key={i} className="h-3.5 rounded-ui-sm" style={{ width: `${w}%` }} />
        ))}
      </div>
    ) : older.id === newer.id ? (
      <div className="rounded-ui border border-line bg-surface-2 px-4 py-6 text-center">
        <p className="text-sm font-medium text-fg">{t("identical")}</p>
        <p className="mt-1 text-[13px] text-fg-muted">{t("identicalHint")}</p>
      </div>
    ) : isRecord ? (
      <div className="grid gap-2">
        <label className="ms-auto inline-flex cursor-pointer items-center gap-2 text-xs text-fg-muted">
          <input type="checkbox" checked={onlyChanges} onChange={(e) => setOnlyChanges(e.target.checked)} className="size-3.5 accent-(--accent-ink)" />
          {t("onlyChanges")}
        </label>
        <FieldDiff
          before={typeof a === "object" ? a : null}
          after={typeof b === "object" ? b : null}
          fields={fields}
          onlyChanges={onlyChanges}
          beforeLabel={vLabel(older)}
          afterLabel={vLabel(newer)}
          labels={labels}
        />
      </div>
    ) : (
      <DiffView
        before={String(a ?? "")}
        after={String(b ?? "")}
        mode={mode}
        granularity={granularity}
        context={context}
        beforeLabel={vLabel(older)}
        afterLabel={vLabel(newer)}
        actions={toolbarActions}
        labels={labels}
      />
    );

  return (
    <div ref={ref} data-slot="version-history" data-layout={layout} className={cn("@container/vh", className)} {...props}>
      <div className={cn("grid gap-4", layout === "page" && "@[52rem]/vh:grid-cols-[16.5rem_minmax(0,1fr)] @[52rem]/vh:items-start")}>
        <div className={cn("grid content-start gap-2", layout === "page" && "@[52rem]/vh:sticky @[52rem]/vh:top-4")}>
          <p id={`${listId}-hint`} className="px-2.5 text-xs text-fg-muted">
            {t("selectHint")}
          </p>
          {list}
        </div>
        <section aria-label={older && newer ? t("comparing", { before: vLabel(older), after: vLabel(newer) }) : undefined} className="grid min-w-0 gap-3">
          {older && newer && older.id !== newer.id ? (
            <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-sm">
                <span className="text-fg-muted">{vLabel(older)}</span>
                <span aria-hidden className="text-fg-subtle">→</span>
                <span className="font-medium text-fg">{vLabel(newer)}</span>
              </p>
              {restorable ? (
                <Button size="sm" variant="secondary" className="ms-auto" onClick={() => setConfirming(true)}>
                  <RotateCcw aria-hidden />
                  {t("restore")}
                </Button>
              ) : null}
            </header>
          ) : null}
          {compareView}
        </section>
        {restorable ? (
          <ConfirmDialog
            open={confirming}
            title={t("restoreTitle", { date: f.dateTime(restorable.createdAt) })}
            description={t("restoreBody")}
            confirmLabel={t("restoreConfirm")}
            onConfirm={async () => {
              try {
                await onRestore!(restorable.id);
                toast.success(t("restored"));
              } catch (err) {
                toast.danger(t("restoreError"));
                throw err;
              }
            }}
            onResult={() => setConfirming(false)}
          />
        ) : null}
      </div>
    </div>
  );
});
