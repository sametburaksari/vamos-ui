"use client";

import * as React from "react";
import { Badge, Checkbox, cn, type BadgeProps } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { columnLabels, editKeys, productStatusLabels, type EditKey, type GridProduct, type ProductStatus, type RowValues } from "./grid-data";
import { parseCell, toMoney, type CellValue } from "./use-grid-edits";

const statusTone: Record<ProductStatus, BadgeProps["tone"]> = {
  active: "success",
  draft: "neutral",
  archived: "outline",
};
const isMoney = (k: EditKey) => k === "price" || k === "marketplace" || k === "wholesale";

interface PriceGridProps {
  rows: GridProduct[];
  values: Record<string, RowValues>;
  base: Record<string, RowValues>;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onCommit: (id: string, key: EditKey, value: CellValue) => void;
  onUndo: () => void;
  onRedo: () => void;
}

type Pos = { r: number; c: number };

/**
 * Spreadsheet grid: arrow keys move, Enter or F2 (or just typing) edits, Enter / Tab commit and
 * move on, Escape cancels. Prices accept "+10%" / "-5%". ⌘Z / Ctrl+Z undo, ⇧⌘Z / Ctrl+Y redo.
 */
export function PriceGrid({ rows, values, base, selected, onToggle, onToggleAll, onCommit, onUndo, onRedo }: PriceGridProps) {
  const { c, t, f, lang } = useBlockFormat();
  const [active, setActive] = React.useState<Pos>({ r: 0, c: 1 });
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const cells = React.useRef(new Map<string, HTMLTableCellElement>());
  const wantFocus = React.useRef(false);
  const committed = React.useRef(false);
  /** Editing started by typing a character: keep it and put the caret after it. */
  const typed = React.useRef(false);

  const r = Math.min(active.r, Math.max(0, rows.length - 1));
  const activeRow = rows[r];
  const activeKey = editKeys[active.c]!;

  React.useEffect(() => {
    if (!editing && wantFocus.current && activeRow) cells.current.get(`${activeRow.id}:${activeKey}`)?.focus();
  }, [activeRow, activeKey, editing]);

  const money = (v: string | number) => f.currency(v, { currency: "TRY", currencyDisplay: "narrowSymbol" });
  const display = (k: EditKey, v: CellValue) => (k === "status" ? null : isMoney(k) ? money(v as string) : f.number(v as number));
  const rawOf = (k: EditKey, v: CellValue) =>
    isMoney(k)
      ? f.number(Number(v), {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: false,
        })
      : String(v);

  const move = (dr: number, dc: number) => {
    wantFocus.current = true;
    setActive({
      r: Math.max(0, Math.min(rows.length - 1, r + dr)),
      c: Math.max(0, Math.min(editKeys.length - 1, active.c + dc)),
    });
  };

  const startEdit = (initial?: string) => {
    if (!activeRow) return;
    committed.current = false;
    setError(null);
    typed.current = initial !== undefined;
    setDraft(initial ?? rawOf(activeKey, values[activeRow.id]![activeKey]));
    setEditing(true);
  };

  /** Returns false (and keeps editing) when the value can't be used. */
  const commit = (raw: string): boolean => {
    if (!activeRow || committed.current) return true;
    if (activeKey === "status") {
      onCommit(activeRow.id, "status", raw as ProductStatus);
    } else {
      const current = Number(values[activeRow.id]![activeKey]);
      const n = parseCell(raw, lang, current);
      if (n === null) {
        setError(c("Enter a number.", "Bir sayı girin."));
        return false;
      }
      if (isMoney(activeKey)) {
        if (n <= 0) {
          setError(c("A price must be above zero.", "Fiyat sıfırdan büyük olmalı."));
          return false;
        }
        onCommit(activeRow.id, activeKey, toMoney(n));
      } else {
        if (n < 0) {
          setError(c("Units can't go below zero.", "Adet sıfırın altına düşemez."));
          return false;
        }
        onCommit(activeRow.id, activeKey, Math.round(n));
      }
    }
    committed.current = true;
    setError(null);
    setEditing(false);
    return true;
  };

  const cancel = () => {
    committed.current = true;
    wantFocus.current = true;
    setError(null);
    setEditing(false);
  };

  const historyKeys = (e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return false;
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) {
      e.preventDefault();
      onUndo();
      return true;
    }
    if ((k === "z" && e.shiftKey) || k === "y") {
      e.preventDefault();
      onRedo();
      return true;
    }
    return false;
  };

  const onCellKeyDown = (e: React.KeyboardEvent) => {
    if (editing || historyKeys(e)) return;
    const keys: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const d = keys[e.key];
    if (d) {
      e.preventDefault();
      move(d[0], d[1]);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      wantFocus.current = true;
      setActive({
        r: e.ctrlKey || e.metaKey ? (e.key === "Home" ? 0 : rows.length - 1) : r,
        c: e.key === "Home" ? 0 : editKeys.length - 1,
      });
    } else if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      startEdit();
    } else if (e.key === "Tab") {
      // Tab leaves the grid like any other widget; Shift+Tab too.
      wantFocus.current = false;
    } else if (activeKey !== "status" && e.key.length === 1 && /[\d.,+-]/.test(e.key) && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      startEdit(e.key);
    }
  };

  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
      wantFocus.current = true;
      if (commit(e.currentTarget.value)) move(e.shiftKey ? -1 : 1, 0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      wantFocus.current = true;
      if (commit(e.currentTarget.value)) move(0, e.shiftKey ? -1 : 1);
    }
  };

  const allChecked = rows.length > 0 && rows.every((p) => selected.has(p.id));
  const someChecked = rows.some((p) => selected.has(p.id));

  const head = "sticky top-0 z-20 border-b border-line bg-[var(--surface-solid)] px-3 py-2.5 text-start text-[11.5px] font-medium whitespace-nowrap text-fg-muted";
  const cell = "relative h-11 border-b border-line px-3 font-mono text-[12.5px] whitespace-nowrap tabular";

  return (
    <div
      className="max-h-[calc(100dvh-19rem)] min-h-[360px] overflow-auto overscroll-contain rounded-ui-lg border border-line bg-[var(--surface-solid)]"
      onBlur={(e) => {
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) wantFocus.current = false;
      }}
    >
      <table role="grid" aria-label={c("Prices and stock", "Fiyat ve stok")} aria-rowcount={rows.length + 1} className="w-full min-w-[1080px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th scope="col" className={cn(head, "start-0 z-30 w-[200px] min-w-[190px] border-e sm:w-[280px] sm:min-w-[240px]")}>
              <span className="flex items-center gap-3">
                <Checkbox
                  aria-label={c("Select all rows", "Tüm satırları seç")}
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={(v) => onToggleAll(v === true)}
                />
                {c("Product", "Ürün")}
              </span>
            </th>
            <th scope="col" className={head}>
              {t(columnLabels.status)}
            </th>
            <th scope="col" className={cn(head, "text-end")}>
              {c("Unit cost", "Birim maliyet")}
            </th>
            <th scope="col" className={cn(head, "text-end")}>
              {t(columnLabels.price)}
            </th>
            <th scope="col" className={cn(head, "text-end")}>
              {t(columnLabels.marketplace)}
            </th>
            <th scope="col" className={cn(head, "text-end")}>
              {t(columnLabels.wholesale)}
            </th>
            <th scope="col" className={cn(head, "text-end")}>
              {c("Margin", "Marj")}
            </th>
            <th scope="col" className={cn(head, "text-end")}>
              {t(columnLabels.stock)}
            </th>
            <th scope="col" className={cn(head, "text-end")}>
              {t(columnLabels.reorder)}
            </th>
            <th scope="col" className={cn(head, "text-end")}>
              {c("Cover", "Yeterlilik")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, ri) => {
            const v = values[p.id]!;
            const b = base[p.id]!;
            const checked = selected.has(p.id);
            const margin = (Number(v.price) - Number(p.cost)) / Number(v.price);
            const daily = p.sold30d / 30;
            const cover = daily > 0 ? Math.floor(v.stock / daily) : null;

            const editable = (key: EditKey, extra?: { warn?: string | false }) => {
              const ci = editKeys.indexOf(key);
              const isActive = ri === r && ci === active.c;
              const changed = v[key] !== b[key];
              const isEditing = isActive && editing;
              return (
                <td
                  key={key}
                  role="gridcell"
                  ref={(el) => {
                    if (el) cells.current.set(`${p.id}:${key}`, el);
                    else cells.current.delete(`${p.id}:${key}`);
                  }}
                  tabIndex={isActive && !editing ? 0 : -1}
                  aria-invalid={extra?.warn ? true : undefined}
                  aria-describedby={isEditing && error ? "grid-cell-error" : undefined}
                  onKeyDown={onCellKeyDown}
                  onMouseDown={() => {
                    wantFocus.current = true;
                    if (!isActive) {
                      if (editing && !commit(draft)) cancel();
                      setActive({ r: ri, c: ci });
                    }
                  }}
                  onDoubleClick={() => startEdit()}
                  title={
                    changed
                      ? c(
                          `Was ${key === "status" ? t(productStatusLabels[b.status]) : display(key, b[key])}`,
                          `Önceki: ${key === "status" ? t(productStatusLabels[b.status]) : display(key, b[key])}`,
                        )
                      : extra?.warn || undefined
                  }
                  className={cn(
                    cell,
                    key !== "status" && "text-end",
                    "cursor-cell outline-none transition-colors",
                    changed && "bg-accent-soft/55",
                    extra?.warn && "text-danger",
                    isActive && "z-10 shadow-[inset_0_0_0_2px_var(--ring)]",
                  )}
                >
                  {changed ? <span aria-hidden="true" className="absolute top-0 end-0 size-0 border-s-[7px] border-t-[7px] border-s-transparent border-t-accent" /> : null}
                  {isEditing ? (
                    key === "status" ? (
                      <select
                        autoFocus
                        aria-label={`${t(columnLabels.status)}, ${t(p.name)}`}
                        defaultValue={v.status}
                        onKeyDown={onEditorKeyDown}
                        onChange={(e) => {
                          wantFocus.current = true;
                          commit(e.target.value);
                        }}
                        onBlur={(e) => commit(e.target.value)}
                        className="absolute inset-0.5 rounded-ui-sm border border-field-border bg-field px-2 font-sans text-[13px] text-fg outline-none"
                      >
                        {(["active", "draft", "archived"] as const).map((s) => (
                          <option key={s} value={s}>
                            {t(productStatusLabels[s])}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <input
                          autoFocus
                          aria-label={`${t(columnLabels[key])}, ${t(p.name)}`}
                          aria-invalid={!!error}
                          value={draft}
                          inputMode="decimal"
                          onChange={(e) => {
                            setDraft(e.target.value);
                            setError(null);
                          }}
                          onFocus={(e) => {
                            const el = e.currentTarget;
                            if (typed.current) el.setSelectionRange(el.value.length, el.value.length);
                            else el.select();
                          }}
                          onKeyDown={onEditorKeyDown}
                          onBlur={(e) => {
                            if (!commit(e.target.value)) cancel();
                          }}
                          className={cn(
                            "absolute inset-0.5 rounded-ui-sm border bg-field px-2 text-end font-mono text-[12.5px] text-fg outline-none",
                            error ? "border-danger" : "border-[var(--ring)]",
                          )}
                        />
                        {error ? (
                          <span
                            id="grid-cell-error"
                            role="alert"
                            className="surface-popover absolute end-0 top-full z-30 mt-1 rounded-ui-sm px-2 py-1 font-sans text-xs text-danger"
                          >
                            {error}
                          </span>
                        ) : null}
                      </>
                    )
                  ) : key === "status" ? (
                    <Badge tone={statusTone[v.status]} dot={v.status === "active"} className="font-sans">
                      {t(productStatusLabels[v.status])}
                    </Badge>
                  ) : (
                    <span className={cn(changed ? "font-medium text-fg" : "text-fg-muted", extra?.warn && "text-danger")}>{display(key, v[key])}</span>
                  )}
                </td>
              );
            };

            return (
              <tr key={p.id} aria-rowindex={ri + 2} aria-selected={checked} className="group">
                <th
                  scope="row"
                  className={cn(
                    "sticky start-0 z-10 h-11 border-e border-b border-line px-3 text-start font-normal",
                    checked ? "bg-[color-mix(in_oklch,var(--selected)_100%,var(--surface-solid))]" : "bg-[var(--surface-solid)]",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Checkbox aria-label={c(`Select ${t(p.name)}`, `${t(p.name)} seç`)} checked={checked} onCheckedChange={() => onToggle(p.id)} />
                    <span className="grid min-w-0 leading-tight">
                      <span className="truncate text-[13px] font-medium text-fg">{t(p.name)}</span>
                      <span className="truncate font-mono text-[11px] text-fg-subtle">
                        {p.sku}
                        {p.variants ? ` · ${p.variants} ${c("variants", "varyant")}` : ""}
                      </span>
                    </span>
                  </span>
                </th>
                {editable("status")}
                <td role="gridcell" aria-readonly="true" className={cn(cell, "text-end text-fg-subtle")}>
                  {money(p.cost)}
                </td>
                {editable("price", {
                  warn: Number(v.price) < Number(p.cost) && c("Below unit cost", "Birim maliyetin altında"),
                })}
                {editable("marketplace", {
                  warn: Number(v.marketplace) < Number(p.cost) && c("Below unit cost", "Birim maliyetin altında"),
                })}
                {editable("wholesale", {
                  warn: Number(v.wholesale) < Number(p.cost) && c("Below unit cost", "Birim maliyetin altında"),
                })}
                <td role="gridcell" aria-readonly="true" className={cn(cell, "text-end", margin < 0 ? "text-danger" : "text-fg-muted")}>
                  {margin >= 0 && margin < 0.45 ? <span aria-hidden="true" className="me-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-warning" /> : null}
                  {f.percent(margin, {
                    maximumFractionDigits: 1,
                    minimumFractionDigits: 1,
                  })}
                </td>
                {editable("stock")}
                {editable("reorder")}
                <td
                  role="gridcell"
                  aria-readonly="true"
                  className={cn(cell, "text-end", cover === null ? "text-fg-subtle" : "text-fg-muted")}
                >
                  {cover !== null && (v.stock <= v.reorder || cover < 14) ? (
                    <span className="me-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-warning" role="img" aria-label={c("Reorder soon", "Yakında sipariş ver")} />
                  ) : null}
                  {cover === null ? "—" : c(`${f.number(cover)} d`, `${f.number(cover)} g`)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
