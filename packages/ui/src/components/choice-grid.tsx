"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { choiceGridStep } from "./choice-grid-step";

export const choiceGridLabels = {
  /** Accessible name of a cell: "Medium, every two weeks: ₺420". */
  cell: "{row}, {column}: {price}",
  cellNoPrice: "{row}, {column}",
  unavailable: "Not available",
  /** Accessible name of an unavailable cell. */
  cellUnavailable: "{row}, {column}: not available",
};
export type ChoiceGridLabels = typeof choiceGridLabels;

export interface ChoiceGridAxisItem {
  id: string;
  /** Header text. Keep it plain text (or pass `name`): it is part of every cell's accessible name. */
  label: React.ReactNode;
  /** Plain-text name used in the accessible names when `label` is not a string. */
  name?: string;
  /** Second line under the header: "250 g · ~16 cups", "save 10%". */
  description?: React.ReactNode;
}

export interface ChoiceGridCell {
  /** Price in the cell; formatted with the locale currency. */
  price?: number | null;
  /** Shown instead of the formatted price. */
  text?: React.ReactNode;
  /** Small second line: "₺5.40 / cup", "save ₺60". */
  meta?: React.ReactNode;
  /** Badge in the cell corner: "Popular". */
  badge?: React.ReactNode;
  /** Not offered: greyed, skipped by the arrow keys, never selectable. */
  unavailable?: boolean;
}

export interface ChoiceGridValue {
  row: string;
  column: string;
}

export interface ChoiceGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
  rows: ChoiceGridAxisItem[];
  columns: ChoiceGridAxisItem[];
  /** Content of each cell; `null` / `undefined` = unavailable. */
  cell: (row: string, column: string) => ChoiceGridCell | null | undefined;
  value?: ChoiceGridValue | null;
  defaultValue?: ChoiceGridValue | null;
  onValueChange?: (value: ChoiceGridValue) => void;
  /** Header of the top-left corner: "Size ↓ · how often →". */
  corner?: React.ReactNode;
  /** Visible caption above the grid; also names the radio group. Or pass `aria-label` / `aria-labelledby`. */
  caption?: React.ReactNode;
  /** Posts the choice with a form as `row:column` (hidden input). */
  name?: string;
  /** Also post the row and column as separate fields. */
  rowName?: string;
  columnName?: string;
  /** `form` attribute of the hidden fields. */
  form?: string;
  /** How prices read. Default: the provider currency, no fraction digits. */
  formatPrice?: (price: number) => string;
  currency?: string;
  disabled?: boolean;
  /** `"sm"`: tighter cells for many columns. Default `"md"`. */
  size?: "sm" | "md";
  labels?: Partial<ChoiceGridLabels>;
}

const plain = (item: ChoiceGridAxisItem) => item.name ?? (typeof item.label === "string" || typeof item.label === "number" ? String(item.label) : item.id);

// Server-safe: the keyboard math lives in its own module so server components can call choiceGridStep().
export { choiceGridStep } from "./choice-grid-step";

/**
 * A two-axis choice — size × frequency, tier × term, room × season — where every cell is an
 * option with its price. One radio group with a single tab stop: arrow keys move across the row
 * (wrapping) and up and down the column, Home / End go to the row ends, Ctrl + Home / End to the
 * first and last cell; unavailable cells are skipped. The chosen cell's row and column headers
 * light up so the choice reads as coordinates. Posts as `row:column` with a `name`.
 *
 * ```tsx
 * <ChoiceGrid
 *   caption="Choose a size and how often it arrives"
 *   rows={[{ id: "s", label: "Small" }, { id: "l", label: "Large" }]}
 *   columns={[{ id: "weekly", label: "Weekly" }, { id: "monthly", label: "Monthly" }]}
 *   cell={(row, column) => ({ price: prices[row][column] })}
 *   name="plan"
 * />
 * ```
 */
export const ChoiceGrid = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ChoiceGridProps>(function ChoiceGrid(
  {
    rows,
    columns,
    cell,
    value: valueProp,
    defaultValue,
    onValueChange,
    corner,
    caption,
    name,
    rowName,
    columnName,
    form,
    formatPrice,
    currency,
    disabled = false,
    size = "md",
    labels,
    className,
    "aria-labelledby": labelledBy,
    "aria-label": ariaLabel,
    ...props
  },
  ref,
) {
  const t = useLabels("choiceGrid", choiceGridLabels, labels);
  const f = useFormat();
  const { dir } = useLocale();
  const id = React.useId();
  const [value, setValue] = useControllableState<ChoiceGridValue | null>({ value: valueProp, defaultValue: defaultValue ?? null, name: "ChoiceGrid" });
  const refs = React.useRef(new Map<string, HTMLButtonElement>());

  const grid = rows.map((r) => columns.map((c) => cell(r.id, c.id) ?? null));
  const available = grid.map((row) => row.map((x) => !!x && !x.unavailable && !disabled));
  const ri = value ? rows.findIndex((r) => r.id === value.row) : -1;
  const ci = value ? columns.findIndex((c) => c.id === value.column) : -1;
  const selectedOk = ri >= 0 && ci >= 0 && available[ri]?.[ci];
  const tabStop: [number, number] | null = selectedOk ? [ri, ci] : choiceGridStep(available, [0, 0], "first");
  const price = (n: number) => (formatPrice ? formatPrice(n) : f.currency(n, currency ?? f.currencyCode, { maximumFractionDigits: 0 }));

  const choose = (r: number, c: number) => {
    const next = { row: rows[r]!.id, column: columns[c]!.id };
    setValue(next);
    onValueChange?.(next);
  };

  const onKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    const rtl = dir === "rtl";
    const map: Record<string, Parameters<typeof choiceGridStep>[2]> = {
      ArrowRight: rtl ? "prev" : "next",
      ArrowLeft: rtl ? "next" : "prev",
      ArrowDown: "down",
      ArrowUp: "up",
      Home: e.ctrlKey || e.metaKey ? "first" : "rowStart",
      End: e.ctrlKey || e.metaKey ? "last" : "rowEnd",
    };
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (available[r]?.[c]) choose(r, c);
      return;
    }
    const move = map[e.key];
    if (!move) return;
    e.preventDefault();
    const to = choiceGridStep(available, [r, c], move);
    if (!to) return;
    refs.current.get(`${to[0]}:${to[1]}`)?.focus();
    choose(to[0], to[1]);
  };

  const captionId = caption ? `${id}-caption` : undefined;
  const cols = `minmax(6.5rem, auto) repeat(${columns.length}, minmax(${size === "sm" ? "4.5rem" : "5.75rem"}, 1fr))`;

  return (
    <div ref={ref} data-slot="choice-grid" className={cn("grid min-w-0 gap-2", className)} {...props}>
      {caption ? (
        <div id={captionId} className="text-sm font-semibold text-fg">
          {caption}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-ui-lg border border-line bg-surface">
        <div
          role="radiogroup"
          aria-labelledby={labelledBy ?? captionId}
          aria-label={labelledBy || captionId ? undefined : ariaLabel}
          aria-disabled={disabled || undefined}
          className="grid min-w-max"
          style={{ gridTemplateColumns: cols }}
        >
          <div aria-hidden="true" className={cn("border-b border-line text-start text-[11px] text-fg-muted", size === "sm" ? "p-2" : "p-3")}>
            {corner}
          </div>
          {columns.map((c, j) => (
            <div key={c.id} aria-hidden="true" data-selected={ci === j && selectedOk ? "" : undefined} className={cn("border-s border-b border-line text-start transition-colors motion-reduce:transition-none", size === "sm" ? "p-2" : "p-3", ci === j && selectedOk && "bg-accent-soft")}>
              <span className={cn("block text-[13px] font-semibold", ci === j && selectedOk ? "text-accent-ink" : "text-fg")}>{c.label}</span>
              {c.description ? <span className={cn("mt-0.5 block text-[11px]", ci === j && selectedOk ? "text-accent-ink" : "text-fg-muted")}>{c.description}</span> : null}
            </div>
          ))}
          {rows.map((r, i) => (
            <React.Fragment key={r.id}>
              <div aria-hidden="true" data-selected={ri === i && selectedOk ? "" : undefined} className={cn("border-line text-start transition-colors motion-reduce:transition-none", i > 0 && "border-t", size === "sm" ? "p-2" : "p-3", ri === i && selectedOk && "bg-accent-soft")}>
                <span className={cn("block text-[13px] font-semibold", ri === i && selectedOk ? "text-accent-ink" : "text-fg")}>{r.label}</span>
                {r.description ? <span className={cn("mt-0.5 block text-[11px]", ri === i && selectedOk ? "text-accent-ink" : "text-fg-muted")}>{r.description}</span> : null}
              </div>
              {columns.map((c, j) => {
                const x = grid[i]![j];
                const ok = available[i]![j]!;
                const checked = selectedOk && ri === i && ci === j;
                const priceText = x?.price != null ? price(x.price) : undefined;
                const shown = x?.text ?? priceText;
                const aria = !x || x.unavailable ? t("cellUnavailable", { row: plain(r), column: plain(c) }) : priceText ? t("cell", { row: plain(r), column: plain(c), price: priceText }) : t("cellNoPrice", { row: plain(r), column: plain(c) });
                return (
                  <button
                    key={c.id}
                    ref={(el) => {
                      if (el) refs.current.set(`${i}:${j}`, el);
                      else refs.current.delete(`${i}:${j}`);
                    }}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-disabled={!ok || undefined}
                    aria-label={aria}
                    data-row={r.id}
                    data-column={c.id}
                    data-state={checked ? "checked" : ok ? "unchecked" : "unavailable"}
                    tabIndex={tabStop && tabStop[0] === i && tabStop[1] === j ? 0 : -1}
                    onClick={() => ok && choose(i, j)}
                    onKeyDown={(e) => onKeyDown(e, i, j)}
                    className={cn(
                      "relative flex min-h-[4.25rem] flex-col items-start justify-between gap-1 border-s border-line text-start transition-colors focus-ring motion-reduce:transition-none",
                      i > 0 && "border-t",
                      size === "sm" ? "p-2" : "p-3",
                      checked ? "bg-accent text-accent-fg" : ok ? "cursor-pointer text-fg hover:bg-hover" : "cursor-not-allowed bg-surface-2 text-fg-subtle",
                    )}
                  >
                    {x?.badge && ok ? <span className={cn("absolute end-1.5 top-1.5 rounded-full px-1.5 py-px text-[10px] font-medium", checked ? "bg-accent-fg text-accent" : "bg-accent-soft text-accent-ink")}>{x.badge}</span> : null}
                    <span className={cn("font-mono leading-none font-semibold tabular", size === "sm" ? "text-sm" : "text-lg")}>{ok || x?.text ? (shown ?? "—") : t("unavailable")}</span>
                    {x?.meta && ok ? <span className={cn("text-[11px]", checked ? "text-accent-fg" : "text-fg-muted")}>{x.meta}</span> : null}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {name && value && selectedOk ? <input type="hidden" name={name} form={form} value={`${value.row}:${value.column}`} /> : null}
      {rowName && value && selectedOk ? <input type="hidden" name={rowName} form={form} value={value.row} /> : null}
      {columnName && value && selectedOk ? <input type="hidden" name={columnName} form={form} value={value.column} /> : null}
    </div>
  );
});
