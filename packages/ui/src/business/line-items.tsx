"use client";

import * as React from "react";
import { Copy, ArrowUp, ArrowDown, Trash2, Plus, CornerDownLeft } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { NumberInput } from "../components/formatted-input";
import { CurrencyInput } from "../components/currency-input";
import { Select } from "../components/select";
import { ActionMenu } from "../components/dropdown-menu";
import { RecordPicker, type RecordSource } from "../components/record-picker";
import { Sortable, SortableHandle, SortableItem } from "../sortable/sortable";
import { arrayMove } from "../sortable/core";
import {
  computeLineTotals,
  createLineItem,
  isLineValid,
  vatLineTaxPack,
  type LineDiscount,
  type LineItem,
  type LineTaxPack,
  type LineTaxRate,
  type LineTotals,
} from "./line-items-core";

export const lineItemsLabels = {
  caption: "Line items",
  item: "Item",
  description: "Description",
  quantity: "Qty",
  unit: "Unit",
  unitPrice: "Price",
  discount: "Discount",
  tax: "Tax",
  withholding: "Withholding",
  total: "Amount",
  actions: "Actions",
  reorder: "Reorder",
  cell: "{column}, row {row}",
  rowActions: "Actions for row {row}",
  addRow: "Add item",
  insertBelow: "Insert row below",
  duplicate: "Duplicate",
  moveUp: "Move up",
  moveDown: "Move down",
  remove: "Delete row",
  none: "None",
  pickItem: "Pick an item",
  descriptionPlaceholder: "What are you selling?",
  percent: "%",
  discountType: "Switch discount to {type}",
  discountPercent: "percent",
  discountAmount: "amount",
  invalidRow: "Quantity and price are required",
  subtotal: "Subtotal",
  discountTotal: "Discounts",
  documentDiscount: "Document discount",
  net: "Net",
  taxLine: "{name} {rate}",
  taxBase: "on {base}",
  withheldLine: "Withholding {code} · {ratio}",
  grandTotal: "Total",
  payable: "Payable",
  inclusive: "Prices include tax",
  summary: "Totals",
  added: "Row {row} added",
  removed: "Row {row} deleted",
  moved: "Row moved to position {row} of {total}",
  totalAnnounce: "Total {total}",
  shortcuts: "Enter on the last field adds a row · Alt+↑/↓ moves a row · Ctrl/⌘+Shift+Backspace deletes it",
};
export type LineItemsLabels = typeof lineItemsLabels;

export type LineItemColumn = "item" | "description" | "quantity" | "unit" | "unitPrice" | "discount" | "tax" | "withholding" | "total";

export interface LineItemsProps<R = unknown> {
  value?: LineItem[];
  defaultValue?: LineItem[];
  /** Called with the rows and the recalculated totals. */
  onValueChange?: (rows: LineItem[], totals: LineTotals) => void;
  /** ISO 4217. Default: the LocaleProvider currency. */
  currency?: string;
  /** Unit prices include tax. */
  pricesIncludeTax?: boolean;
  /** Tax rates, withholding codes and rounding. Default: a generic VAT pack; use `trLineTaxPack()` for KDV. */
  taxPack?: LineTaxPack;
  /** Overrides the pack's rates. */
  taxRates?: LineTaxRate[];
  /** Unit choices ("hour", "day", "pcs"). Without it the unit cell is free text. */
  units?: string[];
  /** Products / services for the Item column (a Record picker). */
  itemSource?: RecordSource<R>;
  /** Fields copied into the row when a record is picked (description, price, unit, tax). */
  onItemPick?: (record: R) => Partial<LineItem>;
  /** Visible columns, in order. Default: item (with `itemSource`), description, quantity, unit, unit price, discount, tax, withholding (when the pack has codes), total. */
  columns?: LineItemColumn[];
  documentDiscount?: LineDiscount;
  /** Makes the document discount editable in the summary. */
  onDocumentDiscountChange?: (d: LineDiscount | undefined) => void;
  /** Printable summary: no inputs, no row actions. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Hidden inputs for native form posts: `name[0][quantity]`… */
  name?: string;
  /** Rows that can't be deleted. Default 1. */
  minRows?: number;
  /** Defaults for new rows. */
  newRow?: () => Partial<LineItem>;
  /** Hide the totals block. */
  hideSummary?: boolean;
  /** Extra rows at the end of the summary (notes, amount in words). */
  summaryFooter?: React.ReactNode;
  labels?: Partial<LineItemsLabels>;
  className?: string;
  "aria-label"?: string;
}

const NUMERIC: LineItemColumn[] = ["quantity", "unitPrice", "discount", "total"];

function toDecimal(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "";
  return String(n);
}

function LineItemsInner<R>(props: LineItemsProps<R>, ref: React.ForwardedRef<HTMLDivElement>) {
  const {
    value,
    defaultValue,
    onValueChange,
    currency: currencyProp,
    pricesIncludeTax,
    taxPack: packProp,
    taxRates,
    units,
    itemSource,
    onItemPick,
    columns: columnsProp,
    documentDiscount,
    onDocumentDiscountChange,
    readOnly,
    disabled,
    name,
    minRows = 1,
    newRow,
    hideSummary,
    summaryFooter,
    labels,
    className,
  } = props;
  const t = useLabels("lineItems", lineItemsLabels, labels);
  const { currency: providerCurrency, format } = useLocale();
  const currency = (currencyProp ?? providerCurrency).toUpperCase();
  const pack = React.useMemo<LineTaxPack>(() => {
    const base = packProp ?? vatLineTaxPack;
    return taxRates ? { ...base, rates: taxRates } : base;
  }, [packProp, taxRates]);
  const make = React.useCallback((partial: Partial<LineItem> = {}) => createLineItem({ ...newRow?.(), ...partial }, pack), [newRow, pack]);

  const [initial] = React.useState(() => defaultValue ?? Array.from({ length: Math.max(1, minRows) }, () => make()));
  const totalsFor = React.useCallback(
    (rows: LineItem[]) => computeLineTotals(rows, { pricesIncludeTax, documentDiscount, taxPack: pack }),
    [pricesIncludeTax, documentDiscount, pack],
  );
  const [rows, setRowsState] = useControllableState<LineItem[]>({ value, defaultValue: initial });
  const totals = React.useMemo(() => totalsFor(rows), [rows, totalsFor]);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [announce, setAnnounce] = React.useState("");

  const columns: LineItemColumn[] = React.useMemo(() => {
    if (columnsProp) return columnsProp;
    const out: LineItemColumn[] = [];
    if (itemSource) out.push("item");
    out.push("description", "quantity", "unit", "unitPrice", "discount", "tax");
    if (pack.withholding?.length) out.push("withholding");
    out.push("total");
    return out;
  }, [columnsProp, itemSource, pack.withholding]);
  const editable = !readOnly && !disabled;
  const columnLabel = (c: LineItemColumn) => t(c);

  const commit = (next: LineItem[], message?: string) => {
    setRowsState(next);
    onValueChange?.(next, totalsFor(next));
    if (message) setAnnounce(message);
  };
  const patch = (id: string, p: Partial<LineItem>) => commit(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const focusCell = (rowId: string, col?: string) => {
    requestAnimationFrame(() => {
      const row = rootRef.current?.querySelector<HTMLElement>(`[data-row-id="${rowId}"]`);
      if (!row) return;
      const cell = (col && row.querySelector<HTMLElement>(`[data-col="${col}"]`)) || row.querySelector<HTMLElement>("[data-col]");
      cell?.querySelector<HTMLElement>("input:not([type=hidden]), button:not([data-slot=sortable-handle])")?.focus();
    });
  };

  const addRow = (afterIndex = rows.length - 1, partial?: Partial<LineItem>) => {
    const row = make(partial);
    const next = [...rows.slice(0, afterIndex + 1), row, ...rows.slice(afterIndex + 1)];
    commit(next, t("added", { row: afterIndex + 2 }));
    focusCell(row.id, columns[0]);
  };
  const removeRow = (index: number) => {
    if (rows.length <= minRows) return;
    const next = rows.filter((_, i) => i !== index);
    commit(next, t("removed", { row: index + 1 }));
    const target = next[Math.min(index, next.length - 1)];
    if (target) focusCell(target.id);
  };
  const moveRow = (index: number, to: number, col?: string) => {
    if (to < 0 || to >= rows.length || to === index) return;
    const id = rows[index]!.id;
    commit(arrayMove(rows, index, to), t("moved", { row: to + 1, total: rows.length }));
    focusCell(id, col);
  };

  // Polite total announcement, debounced so typing doesn't spam.
  const [totalAnnounce, setTotalAnnounce] = React.useState("");
  const firstRun = React.useRef(true);
  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const id = setTimeout(() => setTotalAnnounce(t("totalAnnounce", { total: format.currency(totals.payable, currency) })), 700);
    return () => clearTimeout(id);
  }, [totals.payable, currency, format, t]);

  const onRowKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (!editable) return;
    const col = (e.target as HTMLElement).closest<HTMLElement>("[data-col]")?.dataset.col;
    const mod = e.metaKey || e.ctrlKey;
    if (e.altKey && !mod && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      e.stopPropagation();
      moveRow(index, index + (e.key === "ArrowUp" ? -1 : 1), col);
    } else if (mod && e.shiftKey && e.key === "Backspace") {
      e.preventDefault();
      e.stopPropagation();
      removeRow(index);
    } else if (mod && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      addRow(index);
    } else if (e.key === "Enter" && !e.shiftKey && !e.altKey && (e.target as HTMLElement).tagName === "INPUT" && index === rows.length - 1) {
      const editableCols = columns.filter((c) => c !== "total");
      if (col && col === editableCols[editableCols.length - 1]) {
        e.preventDefault();
        addRow(index);
      }
    }
  };

  const showDiscount = columns.includes("discount");
  const money = (v: string) => format.currency(v, currency);
  const rateLabel = (rate: string) => pack.rates.find((r) => r.value === rate)?.label ?? `${rate}%`;

  const renderCell = (row: LineItem, index: number, col: LineItemColumn) => {
    const line = totals.lines[index];
    const aria = t("cell", { column: columnLabel(col), row: index + 1 });
    const invalid = !isLineValid(row) && (row.unitPrice !== "" || row.description !== "");
    if (!editable) {
      switch (col) {
        case "item":
        case "description":
          return <span className="block min-w-0 text-fg">{col === "item" ? row.itemId ?? "" : row.description}</span>;
        case "quantity":
          return <span className="tabular">{row.quantity ? format.number(row.quantity) : ""}</span>;
        case "unit":
          return <span className="text-fg-muted">{row.unit}</span>;
        case "unitPrice":
          return <span className="tabular">{row.unitPrice ? money(row.unitPrice) : ""}</span>;
        case "discount":
          return row.discount && row.discount.value ? (
            <span className="tabular text-fg-muted">{row.discount.type === "percent" ? format.percent(Number(row.discount.value) / 100) : money(row.discount.value)}</span>
          ) : (
            <span className="text-fg-subtle">—</span>
          );
        case "tax":
          return <span className="tabular text-fg-muted">{row.taxRate != null ? rateLabel(row.taxRate) : ""}</span>;
        case "withholding":
          return <span className="text-fg-muted">{row.withholding ?? "—"}</span>;
        case "total":
          return <span className="tabular font-medium text-fg">{line ? money(line.net) : ""}</span>;
      }
    }
    switch (col) {
      case "item":
        return itemSource ? (
          <RecordPicker
            source={itemSource}
            size="sm"
            value={row.itemId ?? null}
            onValueChange={(id, record) => patch(row.id, { itemId: id ?? undefined, ...(record && onItemPick ? onItemPick(record) : null) })}
            placeholder={t("pickItem")}
            aria-label={aria}
            className="min-w-40"
          />
        ) : null;
      case "description":
        return (
          <Input
            size="sm"
            variant="ghost"
            value={row.description}
            placeholder={t("descriptionPlaceholder")}
            aria-label={aria}
            onChange={(e) => patch(row.id, { description: e.target.value })}
          />
        );
      case "quantity":
        return (
          <NumberInput
            size="sm"
            variant="ghost"
            precision={3}
            min={0}
            value={row.quantity === "" ? null : Number(row.quantity)}
            onValueChange={(n) => patch(row.id, { quantity: toDecimal(n) })}
            aria-label={aria}
            invalid={invalid && row.quantity === ""}
            inputClassName="text-end"
          />
        );
      case "unit":
        return units ? (
          <Select
            size="sm"
            variant="ghost"
            value={row.unit ?? null}
            onValueChange={(u) => patch(row.id, { unit: u ?? undefined })}
            items={units.map((u) => ({ value: u, label: u }))}
            aria-label={aria}
            placeholder="—"
          />
        ) : (
          <Input size="sm" variant="ghost" value={row.unit ?? ""} onChange={(e) => patch(row.id, { unit: e.target.value })} aria-label={aria} />
        );
      case "unitPrice":
        return (
          <CurrencyInput
            size="sm"
            variant="ghost"
            currency={currency}
            currencyDisplay="none"
            align="end"
            value={row.unitPrice === "" ? null : row.unitPrice}
            onValueChange={(v) => patch(row.id, { unitPrice: v ?? "" })}
            aria-label={aria}
            invalid={invalid && row.unitPrice === ""}
          />
        );
      case "discount": {
        const type = row.discount?.type ?? "percent";
        const other = type === "percent" ? "amount" : "percent";
        return (
          <CurrencyInput
            size="sm"
            variant="ghost"
            currency={currency}
            currencyDisplay="none"
            precision={2}
            align="end"
            placeholder="0"
            value={row.discount?.value ? row.discount.value : null}
            onValueChange={(v) => patch(row.id, { discount: v ? { type, value: v } : undefined })}
            aria-label={`${aria} (${type === "percent" ? t("discountPercent") : currency})`}
            trailing={
              <button
                type="button"
                className="focus-ring -me-1 inline-flex h-5 min-w-6 items-center justify-center rounded-ui-sm px-1 text-[11px] font-medium text-fg-muted hover:bg-hover hover:text-fg"
                aria-label={t("discountType", { type: other === "percent" ? t("discountPercent") : t("discountAmount") })}
                onClick={() => patch(row.id, { discount: { type: other, value: row.discount?.value ?? "" } })}
              >
                {type === "percent" ? t("percent") : currency}
              </button>
            }
          />
        );
      }
      case "tax":
        return (
          <Select
            size="sm"
            variant="ghost"
            value={row.taxRate ?? null}
            onValueChange={(r) => patch(row.id, { taxRate: r ?? undefined })}
            items={pack.rates.map((r) => ({ value: r.value, label: r.label }))}
            aria-label={aria}
          />
        );
      case "withholding":
        return (
          <Select
            size="sm"
            variant="ghost"
            value={row.withholding ?? "none"}
            onValueChange={(c) => patch(row.id, { withholding: !c || c === "none" ? undefined : c })}
            items={[{ value: "none", label: t("none") }, ...(pack.withholding ?? []).map((w) => ({ value: w.code, label: w.label }))]}
            renderValue={(o) => (o.value === "none" ? t("none") : `${o.value} · ${pack.withholding?.find((w) => w.code === o.value)?.ratio.join("/") ?? ""}`)}
            aria-label={aria}
          />
        );
      case "total":
        return (
          <span className={cn("block px-1 tabular font-medium text-fg", line?.invalid && "text-fg-subtle")} title={line?.invalid ? t("invalidRow") : undefined}>
            {line ? money(line.net) : ""}
          </span>
        );
    }
  };

  // Fixed table layout: inputs have an intrinsic width (size=20) that would otherwise push the
  // numeric columns wide and squeeze the description. Widths in rem; description takes the rest.
  const colRem: Partial<Record<LineItemColumn, number>> = {
    item: 12,
    quantity: 4.75,
    unit: 5.75,
    unitPrice: 7.5,
    discount: 6.75,
    tax: 5.75,
    withholding: 7.5,
    total: 7.5,
  };
  const tableMinRem = 2 + (editable ? 2.25 : 0) + 14 + columns.reduce((sum, c) => sum + (colRem[c] ?? 0), 0);

  const table = (
    <table className="vui-line-items-table w-full table-fixed border-collapse text-sm" style={{ ["--li-min-w" as string]: `${tableMinRem}rem` }} data-slot="line-items-table">
      <caption className="sr-only">
        {props["aria-label"] ?? t("caption")}
        {editable ? `. ${t("shortcuts")}` : ""}
      </caption>
      <thead>
        <tr className="border-b border-line text-[11px] font-medium tracking-[0.04em] text-fg-subtle uppercase">
          {editable ? (
            <th scope="col" className="w-8">
              <span className="sr-only">{t("reorder")}</span>
            </th>
          ) : (
            <th scope="col" className="w-8 py-2 ps-3 text-start font-medium tabular">
              #
            </th>
          )}
          {columns.map((c) => (
            <th key={c} scope="col" className={cn("px-2 py-2 font-medium", NUMERIC.includes(c) ? "text-end" : "text-start")} style={colRem[c] ? { width: `${colRem[c]}rem` } : undefined}>
              {columnLabel(c)}
              {c === "unitPrice" ? <span className="ms-1 font-mono text-[10px] normal-case tracking-normal text-fg-subtle">{currency}</span> : null}
            </th>
          ))}
          {editable ? (
            <th scope="col" className="w-9">
              <span className="sr-only">{t("actions")}</span>
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const cells = (
            <>
              {editable ? (
                <td className="vui-li-handle ps-1 align-middle">
                  <SortableHandle size="sm" />
                </td>
              ) : (
                <td className="vui-li-index py-2.5 ps-3 align-top text-xs text-fg-subtle tabular">{index + 1}</td>
              )}
              {columns.map((c) => (
                <td
                  key={c}
                  data-col={c}
                  data-label={columnLabel(c)}
                  className={cn("vui-li-cell px-1 py-1 align-middle", !editable && "px-2 py-2.5 align-top", NUMERIC.includes(c) && "text-end")}
                >
                  {renderCell(row, index, c)}
                </td>
              ))}
              {editable ? (
                <td className="vui-li-actions pe-1 align-middle">
                  <ActionMenu
                    triggerLabel={t("rowActions", { row: index + 1 })}
                    triggerSize="xs"
                    items={[
                      { id: "insert", label: t("insertBelow"), icon: <CornerDownLeft />, shortcut: "mod+enter", onSelect: () => addRow(index) },
                      { id: "duplicate", label: t("duplicate"), icon: <Copy />, onSelect: () => {
                          const { id: _id, ...copy } = row;
                          addRow(index, copy);
                        } },
                      { id: "up", label: t("moveUp"), icon: <ArrowUp />, shortcut: "alt+up", disabled: index === 0, onSelect: () => moveRow(index, index - 1) },
                      { id: "down", label: t("moveDown"), icon: <ArrowDown />, shortcut: "alt+down", disabled: index === rows.length - 1, onSelect: () => moveRow(index, index + 1) },
                      { type: "separator", id: "sep" },
                      { id: "remove", label: t("remove"), icon: <Trash2 />, tone: "danger", shortcut: "mod+shift+backspace", disabled: rows.length <= minRows, onSelect: () => removeRow(index) },
                    ]}
                  />
                </td>
              ) : null}
            </>
          );
          const rowClass = "vui-li-row border-b border-line last:border-b-0";
          return editable ? (
            <SortableItem
              key={row.id}
              id={row.id}
              as="tr"
              data-row-id={row.id}
              className={rowClass}
              onKeyDownCapture={(e: React.KeyboardEvent<HTMLElement>) => onRowKeyDown(e, index)}
            >
              {cells}
            </SortableItem>
          ) : (
            <tr key={row.id} data-row-id={row.id} className={rowClass}>
              {cells}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="line-items"
      data-readonly={readOnly ? "" : undefined}
      aria-disabled={disabled || undefined}
      className={cn("vui-line-items flex flex-col gap-3", disabled && "opacity-60", className)}
    >
      <div className="vui-line-items-frame overflow-x-auto rounded-ui-lg border border-line bg-surface">
        {editable ? (
          <Sortable items={rows} getLabel={(r) => r.description || t("cell", { column: t("item"), row: rows.indexOf(r) + 1 })} onReorder={(next) => commit(next)}>
            {table}
          </Sortable>
        ) : (
          table
        )}
        {editable ? (
          <div className="flex items-center justify-between gap-3 border-t border-line px-2 py-1.5">
            <Button size="sm" variant="ghost" onClick={() => addRow()} data-slot="line-items-add">
              <Plus /> {t("addRow")}
            </Button>
            <p className="vui-li-hint hidden text-[11px] text-fg-subtle sm:block">{t("shortcuts")}</p>
          </div>
        ) : null}
      </div>

      {hideSummary ? null : (
        <LineItemsSummary
          totals={totals}
          currency={currency}
          taxPack={pack}
          pricesIncludeTax={pricesIncludeTax}
          showDiscount={showDiscount || !!documentDiscount}
          documentDiscount={documentDiscount}
          onDocumentDiscountChange={editable ? onDocumentDiscountChange : undefined}
          labels={labels}
        >
          {summaryFooter}
        </LineItemsSummary>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic>
        {announce}
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic>
        {totalAnnounce}
      </div>

      {name
        ? rows.map((r, i) => (
            <React.Fragment key={r.id}>
              {(["id", "itemId", "description", "quantity", "unit", "unitPrice", "taxRate", "withholding"] as const).map((k) =>
                r[k] != null ? <input key={k} type="hidden" name={`${name}[${i}][${k}]`} value={String(r[k])} /> : null,
              )}
              {r.discount ? (
                <>
                  <input type="hidden" name={`${name}[${i}][discount][type]`} value={r.discount.type} />
                  <input type="hidden" name={`${name}[${i}][discount][value]`} value={r.discount.value} />
                </>
              ) : null}
            </React.Fragment>
          ))
        : null}
    </div>
  );
}

/**
 * Editable rows of item × quantity × price with discounts, tax per rate, a generic withholding
 * field and exact totals. Real `<table>` semantics; every cell is a labelled input. Rows reorder
 * by drag, keyboard (Alt+↑/↓) or the row menu. Below 40rem the rows stack into cards.
 *
 * ```tsx
 * <LineItems currency="TRY" taxPack={trLineTaxPack()} units={["hour", "day", "pcs"]} defaultValue={rows} onValueChange={(rows, totals) => save(rows, totals.payable)} />
 * ```
 */
export const LineItems = React.forwardRef(LineItemsInner) as <R = unknown>(
  props: LineItemsProps<R> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */

function SummaryRow({ label, value, muted, strong, divider, children }: { label: React.ReactNode; value: string; muted?: boolean; strong?: boolean; divider?: boolean; children?: React.ReactNode }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-6 py-1", strong && "pt-2.5", divider && "mt-1.5 border-t border-line")}>
      <dt className={cn("min-w-0", muted ? "text-fg-muted" : "text-fg", strong && "font-medium")}>
        {label}
        {children}
      </dt>
      <dd className={cn("shrink-0 tabular", strong ? "font-mono text-lg font-medium tracking-[-0.02em] text-fg" : "text-fg")}>{value}</dd>
    </div>
  );
}

export interface LineItemsSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  totals: LineTotals;
  currency?: string;
  taxPack?: LineTaxPack;
  pricesIncludeTax?: boolean;
  /** Show the discount rows. Default: when there is a discount. */
  showDiscount?: boolean;
  documentDiscount?: LineDiscount;
  /** Makes the document discount editable. */
  onDocumentDiscountChange?: (d: LineDiscount | undefined) => void;
  labels?: Partial<LineItemsLabels>;
  children?: React.ReactNode;
}

/** Subtotal, discounts, tax per rate, withholding, total and payable. Usable alone (invoice previews). */
export function LineItemsSummary({
  totals,
  currency: currencyProp,
  taxPack = vatLineTaxPack,
  pricesIncludeTax,
  showDiscount,
  documentDiscount,
  onDocumentDiscountChange,
  labels,
  className,
  children,
  ...props
}: LineItemsSummaryProps) {
  const t = useLabels("lineItems", lineItemsLabels, labels);
  const { currency: providerCurrency, format } = useLocale();
  const currency = (currencyProp ?? providerCurrency).toUpperCase();
  const money = (v: string) => format.currency(v, currency);
  const hasDiscount = totals.discount !== "0.00" && totals.discount !== "0";
  const rateLabel = (rate: string) => taxPack.rates.find((r) => r.value === rate)?.label ?? `${rate}%`;
  const withholdingOf = (code: string) => taxPack.withholding?.find((w) => w.code === code);
  const hasWithholding = totals.withholding.length > 0;

  return (
    <div data-slot="line-items-summary" className={cn("flex justify-end", className)} {...props}>
      <div className="w-full max-w-[22rem] rounded-ui-lg surface-2 px-4 py-3 text-sm">
      <dl aria-label={t("summary")}>
        <SummaryRow label={t("subtotal")} value={money(totals.subtotal)} muted />
        {showDiscount || hasDiscount ? (
          <SummaryRow label={t("discountTotal")} value={hasDiscount ? `−${money(totals.discount)}` : money("0")} muted />
        ) : null}
        {onDocumentDiscountChange ? (
          <div className="flex items-center justify-between gap-4 py-1">
            <dt className="text-fg-muted">{t("documentDiscount")}</dt>
            <dd className="w-32">
              <CurrencyInput
                size="sm"
                currency={currency}
                currencyDisplay="none"
                align="end"
                placeholder="0"
                value={documentDiscount?.value || null}
                onValueChange={(v) => onDocumentDiscountChange(v ? { type: documentDiscount?.type ?? "percent", value: v } : undefined)}
                aria-label={`${t("documentDiscount")} (${(documentDiscount?.type ?? "percent") === "percent" ? t("discountPercent") : currency})`}
                trailing={
                  <button
                    type="button"
                    className="focus-ring -me-1 inline-flex h-5 min-w-6 items-center justify-center rounded-ui-sm px-1 text-[11px] font-medium text-fg-muted hover:bg-hover hover:text-fg"
                    aria-label={t("discountType", { type: (documentDiscount?.type ?? "percent") === "percent" ? t("discountAmount") : t("discountPercent") })}
                    onClick={() =>
                      onDocumentDiscountChange({ type: (documentDiscount?.type ?? "percent") === "percent" ? "amount" : "percent", value: documentDiscount?.value ?? "" })
                    }
                  >
                    {(documentDiscount?.type ?? "percent") === "percent" ? t("percent") : currency}
                  </button>
                }
              />
            </dd>
          </div>
        ) : null}
        {showDiscount || hasDiscount || totals.byRate.length > 1 ? <SummaryRow label={t("net")} value={money(totals.net)} muted /> : null}
        {totals.byRate.map((g) => (
          <SummaryRow key={g.rate} label={t("taxLine", { name: taxPack.name, rate: rateLabel(g.rate) })} value={money(g.tax)} muted>
            <span className="ms-1.5 text-xs text-fg-subtle tabular">{t("taxBase", { base: money(g.base) })}</span>
          </SummaryRow>
        ))}
        <SummaryRow divider label={t("grandTotal")} value={money(totals.total)} strong={!hasWithholding} />
        {hasWithholding ? (
          <>
            {totals.withholding.map((w) => (
              <SummaryRow
                key={w.code}
                label={t("withheldLine", { code: w.code, ratio: `${w.ratio[0]}/${w.ratio[1]}` })}
                value={`−${money(w.withheld)}`}
                muted
              >
                {withholdingOf(w.code) ? <span className="sr-only">{withholdingOf(w.code)!.label}</span> : null}
              </SummaryRow>
            ))}
            <SummaryRow divider label={t("payable")} value={money(totals.payable)} strong />
          </>
        ) : null}
      </dl>
        {pricesIncludeTax ? <p className="pt-1 text-[11px] text-fg-subtle">{t("inclusive")}</p> : null}
        {children}
      </div>
    </div>
  );
}
