"use client";

import * as React from "react";
import { Check, ChevronRight, Lock, Minus, ShieldCheck, Eye } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useControllableState } from "../lib/use-controllable-state";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuTrigger } from "../components/dropdown-menu";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "../components/dialog";
import {
  applyDependencies,
  diffPermissions,
  effectiveLevel,
  isGranted,
  scopeRank,
  setMany,
  setPermission,
  SCOPE_ORDER,
  type PermissionChange,
  type PermissionDependency,
  type PermissionLevel,
  type PermissionScope,
  type PermissionValue,
} from "./permission-core";

export const permissionMatrixLabels = {
  label: "Permissions",
  resource: "Resource",
  none: "None",
  own: "Own",
  team: "Team",
  all: "All",
  granted: "Allowed",
  denied: "Not allowed",
  notApplicable: "Not applicable",
  cell: "{resource}, {action}: {level}",
  inheritedFrom: "From {role}",
  inheritedState: "{level}, inherited from {role}",
  override: "Changed from {role}",
  reset: "Reset to inherited",
  grantRow: "Grant all actions on {resource}",
  revokeRow: "Revoke all actions on {resource}",
  grantColumn: "Grant {action} on all resources",
  revokeColumn: "Revoke {action} on all resources",
  grantGroup: "Grant everything in {group}",
  revokeGroup: "Revoke everything in {group}",
  collapse: "Collapse {group}",
  expand: "Expand {group}",
  scopeMenu: "Scope for {resource}, {action}",
  dependencyRaised: "{requires} enabled because {action} requires it",
  dependencyLowered: "{action} lowered because it requires {requires}",
  changes: "{count, plural, one {# change} other {# changes}}",
  review: "Review",
  discard: "Discard",
  save: "Save",
  close: "Close",
  reviewTitle: "Review permission changes",
  reviewDescription: "{count, plural, one {# change} other {# changes}} for {subject}.",
  change: "{resource} · {action}: {from} → {to}",
  dangerous: "Sensitive",
  noChanges: "No changes",
  readOnly: "System role · read only",
  differs: "Differs",
  permission: "Permission",
  keyboard: "Arrow keys move. Space toggles, Enter opens scopes, 1–4 pick a scope, Delete resets to inherited.",
};
export type PermissionMatrixLabels = typeof permissionMatrixLabels;

export interface PermissionResource {
  id: string;
  label: string;
  /** Rows with the same group are shown under a collapsible heading. */
  group?: string;
  description?: string;
  /** Actions that apply to this resource. Default: all. */
  actions?: string[];
}

export interface PermissionAction {
  id: string;
  label: string;
  /** Scope cells (None / Own / Team / All) instead of a checkbox. */
  scoped?: boolean;
  /** Highlight grants ("Delete: All"). */
  danger?: boolean;
}

export interface PermissionMatrixProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  resources: PermissionResource[];
  actions: PermissionAction[];
  /** Scope names. Default None / Own / Team / All from the dictionary. */
  scopes?: { id: PermissionScope; label: string }[];
  value?: PermissionValue;
  defaultValue?: PermissionValue;
  onValueChange?: (value: PermissionValue) => void;
  /** From the parent role: shown locked until overridden. */
  inherited?: PermissionValue;
  /** Parent role name ("Manager"). */
  inheritedFrom?: string;
  /** Saved value: changed cells get a dot and a save bar appears. */
  baseline?: PermissionValue;
  onSave?: (value: PermissionValue, changes: PermissionChange[]) => Promise<void> | void;
  /** Role / plan being edited, for the review dialog ("Sales rep"). */
  subject?: string;
  readOnly?: boolean;
  /** "edit" requires "view": kept consistent automatically. */
  dependencies?: PermissionDependency[];
  /** Called with a message when a dependency changed another cell (show a toast). */
  onDependencyApplied?: (message: string) => void;
  /** Max height of the scroll area (sticky headers). Default none. */
  maxHeight?: string;
  labels?: Partial<PermissionMatrixLabels>;
}

type Cell = { r: number; c: number };

const levelLabel = (t: LabelFn<PermissionMatrixLabels>, v: PermissionLevel | undefined, scoped: boolean, scopeNames?: Record<string, string>) => {
  if (!scoped) return isGranted(v) ? t("granted") : t("denied");
  const s: PermissionScope = v === true ? "all" : v === false || v === undefined ? "none" : v;
  return scopeNames?.[s] ?? t(s);
};

/**
 * Who may do what: resources × actions with checkbox or scope cells (None / Own / Team / All),
 * inheritance from a parent role, row / column / group bulk toggles, dependencies ("Edit needs
 * View"), sticky headers, and a review-before-save diff. A WAI-ARIA grid.
 *
 * ```tsx
 * <PermissionMatrix resources={resources} actions={actions} value={value} onValueChange={setValue}
 *   inherited={manager} inheritedFrom="Manager" baseline={saved} onSave={save} dependencies={[{ action: "edit", requires: "view" }]} />
 * ```
 */
export const PermissionMatrix = React.forwardRef<HTMLDivElement, PermissionMatrixProps>(function PermissionMatrix(
  {
    resources,
    actions,
    scopes,
    value: valueProp,
    defaultValue,
    onValueChange,
    inherited,
    inheritedFrom = "parent role",
    baseline,
    onSave,
    subject = "this role",
    readOnly,
    dependencies,
    onDependencyApplied,
    maxHeight,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("permissionMatrix", permissionMatrixLabels, labels);
  const [value, setValueState] = useControllableState<PermissionValue>({ value: valueProp, defaultValue: defaultValue ?? {} });
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set());
  const [focus, setFocus] = React.useState<Cell>({ r: 0, c: 0 });
  const [live, setLive] = React.useState("");
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const gridRef = React.useRef<HTMLTableElement>(null);
  const scopeNames = React.useMemo(() => (scopes ? Object.fromEntries(scopes.map((s) => [s.id, s.label])) : undefined), [scopes]);

  // Groups in first-seen order.
  const groups = React.useMemo(() => {
    const out: { key: string; label?: string; resources: PermissionResource[] }[] = [];
    for (const r of resources) {
      const key = r.group ?? "";
      let g = out.find((x) => x.key === key);
      if (!g) out.push((g = { key, label: r.group, resources: [] }));
      g.resources.push(r);
    }
    return out;
  }, [resources]);
  const visibleRows = groups.flatMap((g) => (collapsed.has(g.key) ? [] : g.resources));
  const actionById = React.useMemo(() => new Map(actions.map((a) => [a.id, a])), [actions]);
  const applies = (r: PermissionResource, a: PermissionAction) => !r.actions || r.actions.includes(a.id);

  const commit = (next: PermissionValue, changed?: { resource: string; action: string }) => {
    let v = next;
    if (dependencies?.length) {
      const res = applyDependencies(next, dependencies, { changed, scoped: (id) => !!actionById.get(id)?.scoped, resources: resources.map((r) => r.id) });
      v = res.value;
      const first = res.adjusted[0];
      if (first) {
        const raised = first.action === first.reason.requires;
        const msg = t(raised ? "dependencyRaised" : "dependencyLowered", {
          action: actionById.get(first.reason.action)?.label ?? first.reason.action,
          requires: actionById.get(first.reason.requires)?.label ?? first.reason.requires,
        });
        setLive(msg);
        onDependencyApplied?.(msg);
      }
    }
    setValueState(v);
    onValueChange?.(v);
  };

  const setCell = (r: PermissionResource, a: PermissionAction, level: PermissionLevel | undefined) => {
    if (readOnly || !applies(r, a)) return;
    commit(setPermission(value, r.id, a.id, level), { resource: r.id, action: a.id });
  };
  const toggleCell = (r: PermissionResource, a: PermissionAction) => {
    const cur = effectiveLevel(value, inherited, r.id, a.id);
    if (a.scoped) setCell(r, a, isGranted(cur) ? "none" : "all");
    else setCell(r, a, !isGranted(cur));
  };
  const resetCell = (r: PermissionResource, a: PermissionAction) => {
    if (readOnly) return;
    commit(setPermission(value, r.id, a.id, undefined), { resource: r.id, action: a.id });
  };
  const bulk = (cells: { r: PermissionResource; a: PermissionAction }[]) => {
    const list = cells.filter((x) => applies(x.r, x.a));
    if (readOnly || !list.length) return;
    const allOn = list.every((x) => scopeRank(effectiveLevel(value, inherited, x.r.id, x.a.id)) === 3);
    const next = setMany(
      value,
      list.map((x) => ({ resource: x.r.id, action: x.a.id })),
      (c) => (actionById.get(c.action)?.scoped ? (allOn ? "none" : "all") : !allOn),
    );
    commit(next);
  };
  const allGranted = (cells: { r: PermissionResource; a: PermissionAction }[]) => {
    const list = cells.filter((x) => applies(x.r, x.a));
    return list.length > 0 && list.every((x) => scopeRank(effectiveLevel(value, inherited, x.r.id, x.a.id)) === 3);
  };

  const changes = React.useMemo(() => (baseline ? diffPermissions(baseline, value) : []), [baseline, value]);
  const changedKey = React.useMemo(() => new Set(changes.map((c) => `${c.resource}\u0000${c.action}`)), [changes]);

  // Roving focus. r = -1 → header row (column toggles); c = -1 → row header (row toggle).
  const clamp = (cell: Cell): Cell => ({
    r: Math.max(-1, Math.min(visibleRows.length - 1, cell.r)),
    c: Math.max(-1, Math.min(actions.length - 1, cell.c)),
  });
  const cur = clamp(focus);
  const focusAt = (cell: Cell) => {
    const next = clamp(cell);
    if (next.r === -1 && next.c === -1) next.c = 0;
    setFocus(next);
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-pm-pos="${next.r}:${next.c}"]`)?.focus());
  };
  const onKeyNav = (e: React.KeyboardEvent, cell: Cell) => {
    const mod = e.ctrlKey || e.metaKey;
    let target: Cell | null = null;
    if (e.key === "ArrowRight") target = { r: cell.r, c: cell.c + 1 };
    else if (e.key === "ArrowLeft") target = { r: cell.r, c: cell.c - 1 };
    else if (e.key === "ArrowDown") target = { r: cell.r + 1, c: cell.c };
    else if (e.key === "ArrowUp") target = { r: cell.r - 1, c: cell.c };
    else if (e.key === "Home") target = mod ? { r: 0, c: 0 } : { r: cell.r, c: -1 };
    else if (e.key === "End") target = mod ? { r: visibleRows.length - 1, c: actions.length - 1 } : { r: cell.r, c: actions.length - 1 };
    else if (e.key === "PageDown") target = { r: cell.r + 5, c: cell.c };
    else if (e.key === "PageUp") target = { r: cell.r - 5, c: cell.c };
    if (target) {
      // RTL: left/right swap visually.
      const rtl = gridRef.current?.closest("[dir=rtl]");
      if (rtl && (e.key === "ArrowRight" || e.key === "ArrowLeft")) target = { r: cell.r, c: cell.c + (e.key === "ArrowRight" ? -1 : 1) };
      e.preventDefault();
      focusAt(target);
      return true;
    }
    return false;
  };

  const tab = (cell: Cell) => (cur.r === cell.r && cur.c === cell.c ? 0 : -1);
  const colCount = actions.length + 1;

  return (
    <div ref={ref} data-slot="permission-matrix" data-readonly={readOnly ? "" : undefined} className={cn("vui-pm flex min-w-0 flex-col", className)} {...props}>
      <div className="vui-pm-scroll overflow-auto rounded-ui-lg border border-line bg-surface" style={maxHeight ? { maxHeight } : undefined}>
        <table
          ref={gridRef}
          role="grid"
          aria-label={props["aria-label"] ?? t("label")}
          aria-readonly={readOnly || undefined}
          className="w-full border-separate border-spacing-0 text-sm"
        >
          <caption className="sr-only">{t("keyboard")}</caption>
          <thead>
            <tr>
              <th scope="col" className="vui-pm-sticky vui-pm-corner sticky start-0 top-0 z-30 border-b border-line px-3 py-2.5 text-start text-[11px] font-medium tracking-[0.04em] text-fg-subtle uppercase">
                {readOnly ? (
                  <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                    <Lock aria-hidden className="size-3" /> {t("readOnly")}
                  </span>
                ) : (
                  t("resource")
                )}
              </th>
              {actions.map((a, ci) => {
                const cells = visibleRows.map((r) => ({ r, a }));
                const on = allGranted(cells);
                return (
                  <th key={a.id} scope="col" className="vui-pm-sticky sticky top-0 z-20 min-w-[6.5rem] border-b border-line px-1.5 py-1.5 text-center font-medium">
                    {readOnly ? (
                      <span className="block px-1.5 py-1 text-[13px] text-fg">{a.label}</span>
                    ) : (
                      <button
                        type="button"
                        data-pm-pos={`-1:${ci}`}
                        tabIndex={tab({ r: -1, c: ci })}
                        aria-label={t(on ? "revokeColumn" : "grantColumn", { action: a.label })}
                        title={t(on ? "revokeColumn" : "grantColumn", { action: a.label })}
                        onFocus={() => setFocus({ r: -1, c: ci })}
                        onKeyDown={(e) => onKeyNav(e, { r: -1, c: ci })}
                        onClick={() => bulk(cells)}
                        className="focus-ring inline-flex w-full items-center justify-center gap-1 rounded-ui-sm px-1.5 py-1 text-[13px] text-fg hover:bg-hover"
                      >
                        {a.label}
                        {a.danger ? <span aria-hidden className="size-1.5 rounded-full bg-danger" /> : null}
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          {groups.map((g) => {
            const isCollapsed = collapsed.has(g.key);
            const groupCells = g.resources.flatMap((r) => actions.map((a) => ({ r, a })));
            const groupOn = allGranted(groupCells);
            return (
              <tbody key={g.key || "_"} data-slot="permission-matrix-group">
                {g.label ? (
                  <tr className="vui-pm-group-row">
                    <th scope="colgroup" colSpan={colCount} className="vui-pm-sticky-group sticky start-0 border-b border-line px-1.5 py-1 text-start">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-expanded={!isCollapsed}
                          // The visible group name is the accessible name (WCAG 2.5.3); aria-expanded carries the state.
                          title={t(isCollapsed ? "expand" : "collapse", { group: g.label })}
                          onClick={() =>
                            setCollapsed((s) => {
                              const n = new Set(s);
                              if (n.has(g.key)) n.delete(g.key);
                              else n.add(g.key);
                              return n;
                            })
                          }
                          className="focus-ring inline-flex items-center gap-1.5 rounded-ui-sm px-1.5 py-1 font-mono text-[11px] font-medium tracking-[0.06em] text-fg-muted uppercase hover:bg-hover"
                        >
                          <ChevronRight aria-hidden className={cn("size-3.5 transition-transform duration-150 rtl:rotate-180", !isCollapsed && "rotate-90 rtl:rotate-90")} />
                          {g.label}
                          <span className="font-sans tracking-normal text-fg-subtle normal-case tabular">· {g.resources.length}</span>
                        </button>
                        {!readOnly ? (
                          <Button size="xs" variant="ghost" className="ms-auto text-fg-muted" onClick={() => bulk(groupCells)}>
                            {t(groupOn ? "revokeGroup" : "grantGroup", { group: g.label })}
                          </Button>
                        ) : null}
                      </div>
                    </th>
                  </tr>
                ) : null}
                {isCollapsed
                  ? null
                  : g.resources.map((r) => {
                      const ri = visibleRows.indexOf(r);
                      const rowCells = actions.map((a) => ({ r, a }));
                      const rowOn = allGranted(rowCells);
                      return (
                        <tr key={r.id} data-slot="permission-matrix-row" className="vui-pm-row">
                          <th scope="row" className="vui-pm-sticky-col sticky start-0 z-10 border-b border-line px-1.5 py-1 text-start font-normal">
                            {readOnly ? (
                              <span className="block px-1.5 py-1">
                                <span className="block text-[13px] font-medium text-fg">{r.label}</span>
                                {r.description ? <span className="block text-xs text-fg-subtle">{r.description}</span> : null}
                              </span>
                            ) : (
                              <button
                                type="button"
                                data-pm-pos={`${ri}:-1`}
                                tabIndex={tab({ r: ri, c: -1 })}
                                onFocus={() => setFocus({ r: ri, c: -1 })}
                                onKeyDown={(e) => onKeyNav(e, { r: ri, c: -1 })}
                                onClick={() => bulk(rowCells)}
                                className="focus-ring group/rt flex w-full min-w-[11rem] items-center gap-2 rounded-ui-sm px-1.5 py-1 text-start hover:bg-hover"
                              >
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[13px] font-medium text-fg">{r.label}</span>
                                  {r.description ? <span className="block text-xs text-fg-subtle">{r.description}</span> : null}
                                </span>
                                {/* Visible label first, the action as a hidden suffix (label-in-name). */}
                                <span className="sr-only">, {t(rowOn ? "revokeRow" : "grantRow", { resource: r.label })}</span>
                                <ShieldCheck aria-hidden className={cn("size-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover/rt:opacity-100 group-focus-visible/rt:opacity-100", rowOn && "text-accent-ink opacity-100")} />
                              </button>
                            )}
                          </th>
                          {actions.map((a, ci) => (
                            <td key={a.id} role="gridcell" className="border-b border-line px-1 py-1 text-center">
                              <PermissionMatrixCell
                                resource={r}
                                action={a}
                                applicable={applies(r, a)}
                                own={value[r.id]?.[a.id]}
                                inherited={inherited?.[r.id]?.[a.id]}
                                inheritedFrom={inheritedFrom}
                                changed={changedKey.has(`${r.id}\u0000${a.id}`)}
                                readOnly={readOnly}
                                scopeNames={scopeNames}
                                pos={`${ri}:${ci}`}
                                tabIndex={tab({ r: ri, c: ci })}
                                onFocus={() => setFocus({ r: ri, c: ci })}
                                onNav={(e) => onKeyNav(e, { r: ri, c: ci })}
                                onToggle={() => toggleCell(r, a)}
                                onSet={(l) => setCell(r, a, l)}
                                onReset={() => resetCell(r, a)}
                                t={t}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
              </tbody>
            );
          })}
        </table>
      </div>

      <span className="sr-only" aria-live="polite" aria-atomic>
        {live}
      </span>

      {baseline && changes.length && !readOnly ? (
        <div data-slot="permission-matrix-savebar" className="vui-pm-savebar sticky bottom-3 z-30 mx-auto mt-3 flex w-fit max-w-full items-center gap-2 rounded-full surface-popover py-1.5 ps-4 pe-1.5 text-sm">
          <span className="inline-flex items-center gap-2 text-fg tabular" aria-live="polite">
            <span aria-hidden className="size-1.5 rounded-full bg-accent-ink" />
            {t("changes", { count: changes.length })}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setReviewOpen(true)}>
            <Eye /> {t("review")}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => commit(baseline)}>
            {t("discard")}
          </Button>
          {onSave ? (
            <Button
              size="sm"
              variant="primary"
              pill
              loading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSave(value, changes);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {t("save")}
            </Button>
          ) : null}
        </div>
      ) : null}

      {baseline ? (
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent size="md">
            <DialogHeader title={t("reviewTitle")} description={t("reviewDescription", { count: changes.length, subject })} />
            <DialogBody>
              <PermissionDiff changes={changes} resources={resources} actions={actions} scopes={scopes} labels={labels} />
            </DialogBody>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setReviewOpen(false)}>
                {t("close")}
              </Button>
              {onSave ? (
                <Button
                  variant="primary"
                  loading={saving}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await onSave(value, changes);
                      setReviewOpen(false);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {t("save")}
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Cell                                                                */
/* ------------------------------------------------------------------ */

export interface PermissionMatrixCellProps {
  resource: PermissionResource;
  action: PermissionAction;
  applicable: boolean;
  own: PermissionLevel | undefined;
  inherited: PermissionLevel | undefined;
  inheritedFrom: string;
  changed: boolean;
  readOnly?: boolean;
  scopeNames?: Record<string, string>;
  pos: string;
  tabIndex: number;
  onFocus: () => void;
  onNav: (e: React.KeyboardEvent) => boolean;
  onToggle: () => void;
  onSet: (level: PermissionLevel | undefined) => void;
  onReset: () => void;
  t: LabelFn<PermissionMatrixLabels>;
}

/** One grid cell: a checkbox (boolean actions) or a scope menu (scoped actions). */
export function PermissionMatrixCell({
  resource: r,
  action: a,
  applicable,
  own,
  inherited,
  inheritedFrom,
  changed,
  readOnly,
  scopeNames,
  pos,
  tabIndex,
  onFocus,
  onNav,
  onToggle,
  onSet,
  onReset,
  t,
}: PermissionMatrixCellProps) {
  const level = own !== undefined ? own : inherited;
  const isInherited = own === undefined && inherited !== undefined;
  const isOverride = own !== undefined && inherited !== undefined && scopeRank(own) !== scopeRank(inherited);
  const rank = scopeRank(level);
  const text = levelLabel(t, level, !!a.scoped, scopeNames);
  const state = isInherited ? t("inheritedState", { level: text, role: inheritedFrom }) : text;
  const name = t("cell", { resource: r.label, action: a.label, level: state });
  const danger = !!a.danger && rank === 3;
  const [menuOpen, setMenuOpen] = React.useState(false);

  const common = {
    "data-pm-pos": pos,
    tabIndex,
    onFocus,
    "data-level": a.scoped ? SCOPE_ORDER[rank] : rank ? "on" : "off",
    "data-inherited": isInherited ? "" : undefined,
    "data-override": isOverride ? "" : undefined,
    "data-changed": changed ? "" : undefined,
    "data-danger": danger ? "" : undefined,
    title: isInherited ? t("inheritedFrom", { role: inheritedFrom }) : isOverride ? t("override", { role: inheritedFrom }) : undefined,
  } as const;
  const base = "vui-pm-cell focus-ring relative inline-flex h-8 w-full min-w-[5.5rem] items-center justify-center gap-1 rounded-ui-sm text-xs font-medium transition-[background-color,box-shadow,color] duration-150";

  if (!applicable) {
    return (
      <span {...common} role="img" aria-label={t("cell", { resource: r.label, action: a.label, level: t("notApplicable") })} className={cn(base, "text-fg-subtle/60")} onKeyDown={(e) => void onNav(e)}>
        <Minus aria-hidden className="size-3" />
      </span>
    );
  }

  const marks = (
    <>
      {isInherited ? <Lock aria-hidden className="size-3 text-fg-subtle" /> : null}
      {changed ? <span aria-hidden className="vui-pm-dot absolute end-1 top-1 size-1.5 rounded-full bg-accent-ink" /> : null}
    </>
  );

  const scopeKeys = (e: React.KeyboardEvent) => {
    if (readOnly) return false;
    if (["1", "2", "3", "4"].includes(e.key) && a.scoped) {
      e.preventDefault();
      onSet(SCOPE_ORDER[Number(e.key) - 1]);
      return true;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && own !== undefined && inherited !== undefined) {
      e.preventDefault();
      onReset();
      return true;
    }
    return false;
  };

  if (!a.scoped) {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={rank > 0}
        aria-label={name}
        aria-readonly={readOnly || undefined}
        {...common}
        onClick={() => !readOnly && onToggle()}
        onKeyDown={(e) => {
          if (onNav(e) || scopeKeys(e)) return;
          if (e.key === "Enter") {
            e.preventDefault();
            if (!readOnly) onToggle();
          }
        }}
        className={cn(base, !readOnly && "hover:bg-hover", isInherited && "opacity-75")}
      >
        <span
          aria-hidden
          className={cn(
            "vui-pm-check inline-flex size-[18px] items-center justify-center rounded-[5px] border transition-colors",
            rank ? "border-transparent bg-accent text-accent-fg" : "border-field-border bg-field",
            danger && "tone-danger border-transparent bg-(--tone) text-scene",
            isInherited && rank && "border-dashed border-accent-ink bg-accent-soft text-accent-ink",
          )}
        >
          {rank ? <Check strokeWidth={3} className="size-3" /> : null}
        </span>
        {marks}
      </button>
    );
  }

  const content = (
    <>
      <span className="vui-pm-level-text">{rank === 0 ? <span className="text-fg-subtle">—</span> : text}</span>
      {rank === 3 ? <ShieldCheck aria-hidden className="size-3" /> : null}
      {marks}
    </>
  );

  if (readOnly) {
    return (
      <span {...common} role="img" aria-label={name} className={cn(base, "vui-pm-scope")} onKeyDown={(e) => void onNav(e)}>
        {content}
      </span>
    );
  }

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={name}
          {...common}
          onKeyDown={(e) => {
            if (onNav(e) || scopeKeys(e)) {
              e.preventDefault();
              return;
            }
            if (e.key === " ") {
              // Space toggles None ↔ All; Enter opens the menu.
              e.preventDefault();
              onToggle();
            }
          }}
          onPointerDown={(e) => {
            // Keep Radix from opening on pointerdown so a click opens like Enter does.
            if (e.button === 0 && !e.ctrlKey) {
              e.preventDefault();
              setMenuOpen((o) => !o);
            }
          }}
          className={cn(base, "vui-pm-scope hover:brightness-[0.97]", isInherited && "opacity-75")}
        >
          {content}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-44">
        <DropdownMenuLabel>{t("scopeMenu", { resource: r.label, action: a.label })}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={SCOPE_ORDER[rank]} onValueChange={(v) => onSet(v as PermissionScope)}>
          {SCOPE_ORDER.map((s, i) => (
            <DropdownMenuRadioItem key={s} value={s}>
              <span className="flex-1">{scopeNames?.[s] ?? t(s)}</span>
              <span className="ms-4 font-mono text-[11px] text-fg-subtle">{i + 1}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {own !== undefined && inherited !== undefined ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onReset}>{t("reset")}</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Diff                                                                */
/* ------------------------------------------------------------------ */

export interface PermissionDiffProps extends React.HTMLAttributes<HTMLUListElement> {
  changes: PermissionChange[];
  resources: PermissionResource[];
  actions: PermissionAction[];
  scopes?: { id: PermissionScope; label: string }[];
  labels?: Partial<PermissionMatrixLabels>;
}

/** The review list before saving: "Quotes · Delete: None → Team", sensitive grants flagged. */
export function PermissionDiff({ changes, resources, actions, scopes, labels, className, ...props }: PermissionDiffProps) {
  const t = useLabels("permissionMatrix", permissionMatrixLabels, labels);
  const scopeNames = scopes ? Object.fromEntries(scopes.map((s) => [s.id, s.label])) : undefined;
  if (!changes.length) return <p className="text-sm text-fg-subtle">{t("noChanges")}</p>;
  return (
    <ul data-slot="permission-diff" className={cn("m-0 flex list-none flex-col divide-y divide-line rounded-ui-lg border border-line p-0", className)} {...props}>
      {changes.map((c) => {
        const r = resources.find((x) => x.id === c.resource);
        const a = actions.find((x) => x.id === c.action);
        const scoped = !!a?.scoped;
        const from = levelLabel(t, c.from, scoped, scopeNames);
        const to = levelLabel(t, c.to, scoped, scopeNames);
        const up = scopeRank(c.to) > scopeRank(c.from);
        return (
          <li key={`${c.resource}:${c.action}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5 text-sm">
            <span className="min-w-0 flex-1 text-fg">
              <span className="font-medium">{r?.label ?? c.resource}</span>
              <span className="text-fg-subtle"> · </span>
              {a?.label ?? c.action}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] tabular">
              <span className="text-fg-muted line-through decoration-fg-subtle/50">{from}</span>
              <span aria-hidden className="text-fg-subtle">→</span>
              <span className={cn("font-medium", up ? "text-fg" : "text-fg-muted")}>{to}</span>
              <span className="sr-only">{t("change", { resource: r?.label ?? c.resource, action: a?.label ?? c.action, from, to })}</span>
            </span>
            {a?.danger && up ? (
              <Badge tone="danger" size="sm">
                {t("dangerous")}
              </Badge>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Compare                                                             */
/* ------------------------------------------------------------------ */

export interface PermissionCompareProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Roles or plans as columns. */
  subjects: { id: string; label: string; value: PermissionValue; description?: string }[];
  resources: PermissionResource[];
  actions: PermissionAction[];
  scopes?: { id: PermissionScope; label: string }[];
  /** Only rows where subjects differ. */
  onlyDifferences?: boolean;
  /** Highlight rows where subjects differ. Default `true`. */
  highlightDifferences?: boolean;
  maxHeight?: string;
  labels?: Partial<PermissionMatrixLabels>;
}

/** Subjects side by side: one row per permission, one column per role or plan. Read-only. */
export function PermissionCompare({ subjects, resources, actions, scopes, onlyDifferences, highlightDifferences = true, maxHeight, labels, className, ...props }: PermissionCompareProps) {
  const t = useLabels("permissionMatrix", permissionMatrixLabels, labels);
  const scopeNames = scopes ? Object.fromEntries(scopes.map((s) => [s.id, s.label])) : undefined;
  const rows = resources.flatMap((r) =>
    actions
      .filter((a) => !r.actions || r.actions.includes(a.id))
      .map((a) => {
        const levels = subjects.map((s) => s.value[r.id]?.[a.id]);
        const differs = new Set(levels.map((l) => scopeRank(l))).size > 1;
        return { r, a, levels, differs };
      }),
  );
  const shown = onlyDifferences ? rows.filter((x) => x.differs) : rows;
  return (
    <div data-slot="permission-compare" className={cn("vui-pm overflow-auto rounded-ui-lg border border-line bg-surface", className)} style={maxHeight ? { maxHeight } : undefined} {...props}>
      <table className="w-full border-separate border-spacing-0 text-sm">
        <caption className="sr-only">{props["aria-label"] ?? t("label")}</caption>
        <thead>
          <tr>
            <th scope="col" className="vui-pm-sticky vui-pm-corner sticky start-0 top-0 z-30 border-b border-line px-3 py-2.5 text-start text-[11px] font-medium tracking-[0.04em] text-fg-subtle uppercase">
              {t("permission")}
            </th>
            {subjects.map((s) => (
              <th key={s.id} scope="col" className="vui-pm-sticky sticky top-0 z-20 min-w-[8rem] border-b border-line px-3 py-2 text-center align-bottom">
                <span className="block text-[13px] font-semibold text-fg">{s.label}</span>
                {s.description ? <span className="block text-[11px] font-normal text-fg-subtle">{s.description}</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map(({ r, a, levels, differs }) => (
            <tr key={`${r.id}:${a.id}`} data-differs={differs ? "" : undefined} className={cn(highlightDifferences && differs && "vui-pm-differs")}>
              <th scope="row" className="vui-pm-sticky-col sticky start-0 z-10 border-b border-line px-3 py-2 text-start font-normal">
                <span className="text-[13px] font-medium text-fg">{r.label}</span>
                <span className="text-fg-subtle"> · </span>
                <span className="text-[13px] text-fg-muted">{a.label}</span>
                {highlightDifferences && differs ? <span className="sr-only"> ({t("differs")})</span> : null}
              </th>
              {levels.map((l, i) => {
                const rank = scopeRank(l);
                return (
                  <td key={subjects[i]!.id} className="border-b border-line px-2 py-1.5 text-center">
                    <span
                      className={cn("vui-pm-cell inline-flex h-7 min-w-[5rem] items-center justify-center gap-1 rounded-ui-sm px-2 text-xs font-medium", a.scoped && "vui-pm-scope")}
                      data-level={a.scoped ? SCOPE_ORDER[rank] : rank ? "on" : "off"}
                      data-danger={a.danger && rank === 3 ? "" : undefined}
                    >
                      {a.scoped ? (
                        rank ? levelLabel(t, l, true, scopeNames) : <span className="text-fg-subtle">—</span>
                      ) : rank ? (
                        <>
                          <Check aria-hidden className="size-3.5 text-accent-ink" />
                          <span className="sr-only">{t("granted")}</span>
                        </>
                      ) : (
                        <>
                          <Minus aria-hidden className="size-3.5 text-fg-subtle" />
                          <span className="sr-only">{t("denied")}</span>
                        </>
                      )}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
