import * as React from "react";
import { cn } from "../lib/cn";
import { CopyValueButton, DataLabel, DescriptionEditable, ValueText } from "../lib/data-islands";
import type { descriptionListLabels } from "../lib/data-islands";
import type { ValueFormat } from "../lib/value-format";
import { Skeleton } from "./skeleton";

export { DescriptionEditable, type DescriptionEditableProps } from "../lib/data-islands";
export type DescriptionListLabels = Partial<typeof descriptionListLabels>;

/** One row of `DescriptionList items`. */
export interface DescriptionEntry {
  /** Stable key (also passed to `onEdit`). */
  key: string;
  label: React.ReactNode;
  /** The value. Numbers/dates are formatted with `format`; `null`/`undefined`/`""` show the empty value. */
  value?: React.ReactNode;
  /** Small help text under the value. */
  hint?: React.ReactNode;
  /** Format a number or date value. */
  format?: ValueFormat;
  /** Copy button: `true` copies the value text, a string copies that string. */
  copyable?: boolean | string;
  /** Grid layout only: columns to span. */
  span?: 1 | 2 | "full";
  /** Click-to-edit (needs `onEdit` on the list). The edited text starts from `editValue` or the value. */
  editable?: boolean;
  editValue?: string;
  inputType?: "text" | "email" | "tel" | "url" | "number";
}

export interface DescriptionListProps extends Omit<React.HTMLAttributes<HTMLDListElement>, "children"> {
  /** Rows as data. Or compose `<DescriptionItem>` children. */
  items?: DescriptionEntry[];
  /**
   * `"horizontal"` (default): label start, value end — switches to stacked under ~28rem of container width.
   * `"vertical"`: label above value. `"grid"`: stacked pairs in `columns`.
   */
  layout?: "horizontal" | "vertical" | "grid";
  /** Grid layout columns (fewer on narrow containers). Default 2. */
  columns?: 1 | 2 | 3;
  /** Width of the label column in horizontal layout. Default `"11rem"`. */
  labelWidth?: string;
  /** Hairlines between rows. Default `true` for horizontal, `false` otherwise. */
  divided?: boolean;
  /** Default `"md"`. */
  size?: "sm" | "md";
  /** Shown for empty values. Default "—". */
  emptyValue?: React.ReactNode;
  /** Saves an inline edit (rows with `editable`). Reject to show the error state. */
  onEdit?: (key: string, value: string) => void | Promise<void>;
  /** Label + value skeletons for this many rows. */
  loading?: boolean | number;
  labels?: DescriptionListLabels;
  children?: React.ReactNode;
}

const gridCols = { 1: "", 2: "@lg/dl:grid-cols-2", 3: "@lg/dl:grid-cols-2 @3xl/dl:grid-cols-3" } as const;

/**
 * Label/value pairs for record details and summaries — a native `<dl>`. Values can be copied
 * or edited in place. Server-component compatible (copy and edit are small client islands).
 *
 * ```tsx
 * <DescriptionList items={[
 *   { key: "owner", label: "Owner", value: "Ayşe Kaya" },
 *   { key: "amount", label: "Amount", value: 48500, format: "currency" },
 *   { key: "iban", label: "IBAN", value: "TR33 0006 1005 1978 6457 8413 26", copyable: true },
 * ]} />
 * ```
 */
export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { items, layout = "horizontal", columns = 2, labelWidth, divided, size = "md", emptyValue, onEdit, loading, labels, className, style, children, ...props },
  ref,
) {
  const isDivided = divided ?? layout === "horizontal";
  const rows = loading ? (
    Array.from({ length: typeof loading === "number" ? loading : 4 }, (_, i) => (
      <div key={i} data-slot="description-item" aria-hidden className="ui-dl-row">
        <dt>
          <Skeleton shape="text" className="h-3 w-20" />
        </dt>
        <dd>
          <Skeleton shape="text" className="h-3" style={{ width: `${70 - ((i * 13) % 35)}%` }} />
        </dd>
      </div>
    ))
  ) : items ? (
    items.map((it) => (
      <DescriptionItem
        key={it.key}
        label={it.label}
        hint={it.hint}
        span={it.span}
        copyable={it.copyable}
        emptyValue={emptyValue}
        labels={labels}
        edit={
          it.editable && onEdit ? (
            <DescriptionEditable
              value={it.editValue ?? (typeof it.value === "string" || typeof it.value === "number" ? String(it.value) : "")}
              display={renderValue(it.value, it.format)}
              label={typeof it.label === "string" ? it.label : it.key}
              inputType={it.inputType}
              labels={labels}
              onSave={(v) => onEdit(it.key, v)}
            />
          ) : undefined
        }
      >
        {renderValue(it.value, it.format)}
      </DescriptionItem>
    ))
  ) : (
    children
  );

  return (
    <dl
      ref={ref}
      data-slot="description-list"
      data-layout={layout}
      data-divided={isDivided ? "" : undefined}
      data-size={size}
      aria-busy={loading ? true : undefined}
      className={cn(
        "ui-dl @container/dl m-0 grid min-w-0",
        size === "sm" ? "text-[12.5px]" : "text-[13px]",
        layout === "grid" ? cn("grid-cols-1 gap-x-6 gap-y-4", gridCols[columns]) : null,
        className,
      )}
      style={labelWidth ? { ["--dl-label-w" as string]: labelWidth, ...style } : style}
      {...props}
    >
      {rows}
    </dl>
  );
});

function renderValue(value: React.ReactNode, format?: ValueFormat): React.ReactNode {
  if (format && (typeof value === "number" || typeof value === "string")) return <ValueText value={value} format={format} />;
  return value;
}

const isEmpty = (v: React.ReactNode) => v === null || v === undefined || v === "" || v === false;

export interface DescriptionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: React.ReactNode;
  /** The value. */
  children?: React.ReactNode;
  hint?: React.ReactNode;
  /** Copy button: `true` copies the text value, a string copies that string. */
  copyable?: boolean | string;
  /** Grid layout: columns to span. */
  span?: 1 | 2 | "full";
  /** Shown when the value is empty. Default "—". */
  emptyValue?: React.ReactNode;
  /** Inline edit slot (e.g. `<DescriptionEditable … />`) — replaces the value. */
  edit?: React.ReactNode;
  /** Trailing slot after the value (a link, a status badge). */
  action?: React.ReactNode;
  labels?: DescriptionListLabels;
}

/** One label/value pair (`<div><dt/><dd/></div>`). */
export const DescriptionItem = React.forwardRef<HTMLDivElement, DescriptionItemProps>(function DescriptionItem(
  { label, children, hint, copyable, span, emptyValue, edit, action, labels, className, ...props },
  ref,
) {
  const empty = isEmpty(children);
  const copyText = typeof copyable === "string" ? copyable : copyable && (typeof children === "string" || typeof children === "number") ? String(children) : undefined;
  const labelText = typeof label === "string" ? label : "value";
  return (
    <div
      ref={ref}
      data-slot="description-item"
      className={cn("ui-dl-row", span === 2 && "@lg/dl:col-span-2", span === "full" && "col-span-full", className)}
      {...props}
    >
      <dt data-slot="description-label">{label}</dt>
      <dd data-slot="description-value">
        <span className="flex min-w-0 items-center gap-1.5">
          {edit ?? (
            <span className={cn("min-w-0 break-words", empty && "text-fg-subtle")}>
              {empty ? (emptyValue ?? <span aria-hidden>—</span>) : children}
            </span>
          )}
          {copyText && !empty ? <CopyValueButton text={copyText} label={labelText} labels={labels} className="-my-1" /> : null}
          {action ? <span className="ms-auto flex shrink-0 items-center gap-1.5">{action}</span> : null}
        </span>
        {empty && !edit && emptyValue === undefined ? (
          <span className="sr-only">
            <DataLabel ns="descriptionList" id="empty" override={labels} />
          </span>
        ) : null}
        {hint ? <span className="mt-0.5 block text-xs text-fg-subtle">{hint}</span> : null}
      </dd>
    </div>
  );
});

export interface DescriptionGroupProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Heading level. Default `"h4"`. */
  titleAs?: "h2" | "h3" | "h4" | "h5";
  /** Slot at the end of the heading row ("Edit" link). */
  action?: React.ReactNode;
}

/** A titled section of a details view; put a DescriptionList inside. */
export function DescriptionGroup({ title, description, titleAs: H = "h4", action, className, children, ...props }: DescriptionGroupProps) {
  const id = React.useId();
  return (
    <section data-slot="description-group" aria-labelledby={id} className={cn("grid gap-2", className)} {...props}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <H id={id} className="font-mono text-[11px] font-medium tracking-[0.06em] text-fg-subtle">
            {title}
          </H>
          {description ? <p className="mt-0.5 text-xs text-fg-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
