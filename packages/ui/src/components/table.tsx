import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/cn";
import { DataLabel } from "../lib/data-islands";
import { EmptyState } from "./empty-state";

type Align = "start" | "center" | "end";
const alignClass = { start: "text-start", center: "text-center", end: "text-end" } as const;

/* ------------------------------------------------------------------ */
/* Container                                                            */
/* ------------------------------------------------------------------ */

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name of the scroll region (required when the table can scroll). */
  "aria-label"?: string;
  /** Max height; the header stays visible with `<Table stickyHeader>`. E.g. `"24rem"`. */
  maxHeight?: string;
}

/**
 * Scroll wrapper for a Table: horizontal (and optional vertical) scrolling with soft edge fades
 * that show there is more content. It is a focusable, named region so keyboard users can scroll.
 */
export const TableContainer = /*#__PURE__*/ React.forwardRef<HTMLDivElement, TableContainerProps>(function TableContainer({ className, maxHeight, style, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="region"
      tabIndex={0}
      data-slot="table-container"
      className={cn("ui-table-scroll relative w-full overflow-auto overscroll-x-contain rounded-[inherit] focus-ring", className)}
      style={maxHeight ? { maxHeight, ...style } : style}
      {...props}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Table                                                                */
/* ------------------------------------------------------------------ */

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Row height + cell padding (`--row-h`, `--cell-px`). `"inherit"` follows the page `data-density`. Default `"inherit"`. */
  density?: "inherit" | "compact" | "comfortable" | "spacious";
  /** Zebra rows. */
  striped?: boolean;
  /** Row hover tint. Default `true`. */
  hover?: boolean;
  /** `"rows"` (default) hairlines between rows · `"grid"` every cell · `"none"`. */
  bordered?: "rows" | "grid" | "none";
  /** Keep the header visible while the TableContainer scrolls. Opaque (never blurred). */
  stickyHeader?: boolean;
  /** Pin the first column while scrolling sideways. */
  stickyFirstColumn?: boolean;
  /** `"fixed"` uses the column widths you set (`<TableHead style={{ width }}>`). Default `"auto"`. */
  layout?: "auto" | "fixed";
}

/**
 * Styled semantic table for small and static data: line items, settings lists, chart data.
 * Server-component compatible. Give it a `<TableCaption>` or `aria-label`.
 *
 * ```tsx
 * <TableContainer aria-label="Invoice lines">
 *   <Table>
 *     <TableCaption>Invoice INV-2041</TableCaption>
 *     <TableHeader><TableRow><TableHead>Item</TableHead><TableHead numeric>Amount</TableHead></TableRow></TableHeader>
 *     <TableBody><TableRow><TableCell>Design retainer</TableCell><TableCell numeric>$4,500.00</TableCell></TableRow></TableBody>
 *   </Table>
 * </TableContainer>
 * ```
 */
export const Table = /*#__PURE__*/ React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, density = "inherit", striped, hover = true, bordered = "rows", stickyHeader, stickyFirstColumn, layout = "auto", children, ...props },
  ref,
) {
  if (process.env.NODE_ENV !== "production" && !props["aria-label"] && !props["aria-labelledby"]) {
    const hasCaption = React.Children.toArray(children).some((c) => React.isValidElement(c) && c.type === TableCaption);
    if (!hasCaption) console.warn("[vamos-ui] <Table> needs a <TableCaption>, aria-label or aria-labelledby.");
  }
  return (
    <table
      ref={ref}
      data-slot="table"
      data-density={density === "inherit" ? undefined : density}
      data-striped={striped ? "" : undefined}
      data-hover={hover ? "" : undefined}
      data-bordered={bordered}
      data-sticky-header={stickyHeader ? "" : undefined}
      data-sticky-column={stickyFirstColumn ? "" : undefined}
      className={cn("ui-table w-full caption-bottom border-separate border-spacing-0 text-[13px] text-fg", layout === "fixed" && "table-fixed", className)}
      {...props}
    >
      {children}
    </table>
  );
});

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  /** Keep the caption for screen readers only. */
  visuallyHidden?: boolean;
  /** Default `"bottom"`. */
  side?: "top" | "bottom";
}

/** Names the table. Visible under the table by default; `visuallyHidden` keeps it for screen readers. */
export const TableCaption = /*#__PURE__*/ React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(function TableCaption({ className, visuallyHidden, side = "bottom", ...props }, ref) {
  return (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn(
        visuallyHidden ? "sr-only" : "px-(--cell-px) py-3 text-start text-xs text-fg-subtle",
        side === "top" && "caption-top pt-0",
        className,
      )}
      {...props}
    />
  );
});

export const TableHeader = /*#__PURE__*/ React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} data-slot="table-header" className={className} {...props} />;
});

export const TableBody = /*#__PURE__*/ React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} data-slot="table-body" className={className} {...props} />;
});

export const TableFooter = /*#__PURE__*/ React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableFooter({ className, ...props }, ref) {
  return <tfoot ref={ref} data-slot="table-footer" className={cn("font-medium", className)} {...props} />;
});

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Selected row (`data-state="selected"`, `aria-selected`). */
  selected?: boolean;
  /** Dimmed, non-interactive row. */
  disabled?: boolean;
  /** Accent bar at the start edge — e.g. the row you just created. */
  highlighted?: boolean;
}

export const TableRow = /*#__PURE__*/ React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow({ className, selected, disabled, highlighted, ...props }, ref) {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      data-state={selected ? "selected" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-highlighted={highlighted ? "" : undefined}
      aria-selected={selected === undefined ? undefined : selected}
      aria-disabled={disabled || undefined}
      className={className}
      {...props}
    />
  );
});

export interface TableHeadProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: Align;
  /** Numbers: end-aligned, tabular, mono. */
  numeric?: boolean;
  /** Current sort of this column. Set `false` for a sortable column that is not sorted. */
  sort?: "asc" | "desc" | false;
  /** Makes the header a sort button (`aria-sort` on the `th`). */
  onSort?: () => void;
}

/**
 * Column header (`<th scope="col">`). With `onSort` the label becomes a button and the cell
 * gets `aria-sort`.
 */
export const TableHead = /*#__PURE__*/ React.forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { className, align, numeric, sort, onSort, scope = "col", children, ...props },
  ref,
) {
  const a: Align = align ?? (numeric ? "end" : "start");
  const sortable = sort !== undefined || onSort !== undefined;
  const SortIcon = sort === "asc" ? ArrowUp : sort === "desc" ? ArrowDown : ChevronsUpDown;
  return (
    <th
      ref={ref}
      scope={scope}
      data-slot="table-head"
      data-numeric={numeric ? "" : undefined}
      aria-sort={sortable ? (sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none") : undefined}
      className={cn("h-[calc(var(--row-h)*0.78)] px-(--cell-px) align-middle text-xs font-medium whitespace-nowrap text-fg-muted", alignClass[a], className)}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          data-sorted={sort ? "" : undefined}
          className={cn(
            "-mx-1.5 inline-flex items-center gap-1 rounded-ui-sm px-1.5 py-1 font-medium transition-colors hover:bg-hover hover:text-fg focus-ring data-sorted:text-fg",
            a === "end" && "flex-row-reverse",
          )}
        >
          {children}
          <SortIcon aria-hidden className={cn("size-3.5 shrink-0", sort ? "text-fg" : "text-fg-subtle")} />
        </button>
      ) : (
        children
      )}
    </th>
  );
});

export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: Align;
  /** Numbers and money: end-aligned, tabular, mono — also in RTL. */
  numeric?: boolean;
  /** `true` cuts to one line with an ellipsis; a number clamps to that many lines. */
  truncate?: boolean | number;
  /** Render as a row header (`<th scope="row">`) — e.g. the name column. */
  rowHeader?: boolean;
}

export const TableCell = /*#__PURE__*/ React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, align, numeric, truncate, rowHeader, children, ...props },
  ref,
) {
  const a: Align = align ?? (numeric ? "end" : "start");
  const Comp = rowHeader ? "th" : "td";
  const clamp = typeof truncate === "number" && truncate > 1;
  return (
    <Comp
      ref={ref}
      {...(rowHeader ? { scope: "row" } : {})}
      data-slot="table-cell"
      data-numeric={numeric ? "" : undefined}
      className={cn(
        "h-(--row-h) px-(--cell-px) py-2 align-middle",
        alignClass[a],
        numeric && "font-mono text-[12.5px] whitespace-nowrap tabular",
        rowHeader && "font-medium",
        truncate === true || truncate === 1 ? "max-w-0 truncate" : null,
        className,
      )}
      {...props}
    >
      {clamp ? (
        <span className="line-clamp-(--lines)" style={{ ["--lines" as string]: truncate }}>
          {children}
        </span>
      ) : (
        children
      )}
    </Comp>
  );
});

export interface TableEmptyProps extends Omit<React.HTMLAttributes<HTMLTableRowElement>, "title"> {
  /** Number of columns to span. */
  colSpan: number;
  /** Replace the icon (`false` for none). */
  icon?: React.ReactNode | false;
  /** Main line. Default "No results". */
  title?: React.ReactNode;
  /** Secondary line. Children render as actions (e.g. "Clear filters"). */
  description?: React.ReactNode;
}

/** A single full-width row for an empty table body. */
export const TableEmpty = /*#__PURE__*/ React.forwardRef<HTMLTableRowElement, TableEmptyProps>(function TableEmpty(
  { colSpan, icon, title, description, className, children, ...props },
  ref,
) {
  return (
    <tr ref={ref} data-slot="table-empty" className={className} {...props}>
      <td colSpan={colSpan} className="px-(--cell-px) py-8">
        <EmptyState kind="no-results" size="sm" icon={icon} title={title ?? <DataLabel ns="table" id="empty" />} description={description} actions={children} />
      </td>
    </tr>
  );
});
