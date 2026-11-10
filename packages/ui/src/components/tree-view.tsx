"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight, RotateCw, TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { highlightParts } from "../lib/text";
import { useTree, type TreeCheckValueMode, type TreeItemState, type TreeNode, type UseTreeReturn } from "../lib/use-tree";
import { Spinner } from "./spinner";

export type { TreeNode, TreeItemState, TreeCheckValueMode } from "../lib/use-tree";
export { useTree, type UseTreeOptions, type UseTreeReturn, type TreeCheckedState } from "../lib/use-tree";

const treeViewLabels = {
  loading: "Loading…",
  loadError: "Couldn't load",
  retry: "Retry",
  empty: "Nothing here yet",
  noMatches: "No matches for “{query}”",
  results: "{count, plural, =0 {No matches} one {# match} other {# matches}}",
};
export type TreeViewLabels = typeof treeViewLabels;

export const treeRowVariants = cva(
  [
    "group/tree-row relative flex w-full min-w-0 cursor-default select-none items-center gap-1.5 rounded-ui-sm pe-1.5 text-start outline-none",
    "transition-colors duration-100",
    "hover:bg-hover focus-visible:bg-hover focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]",
    "aria-selected:bg-selected aria-selected:text-fg aria-selected:font-medium",
    "aria-disabled:pointer-events-none aria-disabled:opacity-45",
  ],
  {
    variants: {
      size: {
        sm: "h-[calc(var(--control-h)*0.7)] text-[13px]",
        md: "h-[calc(var(--control-h)*0.8)] text-sm",
      },
      variant: {
        default: "text-fg",
        /** Navigation-like tree (docs, file explorer pane): accent ink on the current row. */
        sidebar: "text-fg-muted hover:text-fg aria-selected:bg-accent-soft aria-selected:text-accent-ink",
      },
    },
    defaultVariants: { size: "md", variant: "default" },
  },
);

/* ------------------------------------------------------------------ */
/* Row parts                                                           */
/* ------------------------------------------------------------------ */

/** Check box drawn for a treeitem (state lives on the row's `aria-checked`). */
export function TreeCheckboxMark({ checked, className }: { checked: boolean | "mixed"; className?: string }) {
  return (
    <span
      aria-hidden
      data-slot="tree-checkbox"
      data-state={checked === "mixed" ? "indeterminate" : checked ? "checked" : "unchecked"}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-field-border-hover bg-field text-accent-fg transition-colors duration-150",
        "data-[state=checked]:border-transparent data-[state=checked]:bg-accent data-[state=indeterminate]:border-transparent data-[state=indeterminate]:bg-accent",
        "group-hover/tree-row:border-fg-subtle",
        className,
      )}
    >
      {checked === "mixed" ? (
        <svg viewBox="0 0 14 14" fill="none" className="size-3" focusable="false">
          <path d="M3.5 7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : checked ? (
        <svg viewBox="0 0 14 14" fill="none" className="size-3" focusable="false">
          <path d="M3 7.4 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

/** Label with matched parts in bold (weight, not colour — readable on glass). */
export function TreeLabelText({ text, query, locale }: { text: string; query?: string; locale?: string }) {
  if (!query?.trim()) return <>{text}</>;
  return (
    <>
      {highlightParts(text, query, locale).map((p, i) =>
        p.match ? (
          <mark key={i} className="rounded-[3px] bg-accent-soft px-px font-semibold text-fg">
            {p.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ),
      )}
    </>
  );
}

export interface TreeViewRowProps extends React.HTMLAttributes<HTMLDivElement> {
  item: TreeItemState;
  tree: UseTreeReturn;
  /** Indent per level in px. */
  indent?: number;
  guides?: boolean;
  size?: "sm" | "md";
  variant?: "default" | "sidebar";
  /** Show the check mark (checkbox mode). */
  checkbox?: boolean;
  query?: string;
  /** Replace the label. */
  label?: React.ReactNode;
  /** Trailing buttons, revealed on hover / focus. */
  actions?: React.ReactNode;
  labels?: Partial<TreeViewLabels>;
  /** Called on row click after the built-in behaviour. */
  onRowClick?: (item: TreeItemState, e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * One treeitem: indent guides, chevron (spinner while children load, retry on error), check mark,
 * icon, label, badge and hover actions. Used by Tree view and Tree select; render it inside an
 * element carrying `tree.getTreeProps()`.
 */
export const TreeViewRow = React.forwardRef<HTMLDivElement, TreeViewRowProps>(function TreeViewRow(
  { item, tree, indent = 16, guides = true, size = "md", variant = "default", checkbox, query, label, actions, labels, onRowClick, className, style, onClick, onDoubleClick, ...props },
  ref,
) {
  const t = useLabels("treeView", treeViewLabels, labels);
  const { locale } = useLocale();
  const { node } = item;
  const base = size === "sm" ? 4 : 6;
  const pad = base + (item.level - 1) * indent;

  return (
    <div
      ref={ref}
      {...tree.getItemProps(item)}
      data-slot="tree-row"
      data-level={item.level}
      data-match={item.match || undefined}
      className={cn(treeRowVariants({ size, variant }), className)}
      style={{ paddingInlineStart: pad, ...style }}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || item.disabled) return;
        const el = e.currentTarget;
        if (document.activeElement !== el) el.focus({ preventScroll: true });
        onRowClick?.(item, e);
      }}
      onDoubleClick={onDoubleClick}
      {...props}
    >
      {guides && item.level > 1
        ? item.guides.map((on, i) =>
            on || i === item.level - 2 ? (
              <span
                key={i}
                aria-hidden
                data-slot="tree-guide"
                className={cn("pointer-events-none absolute w-px bg-line", i === item.level - 2 && !on && item.last ? "top-0 h-1/2" : "inset-y-0")}
                style={{ insetInlineStart: base + i * indent + 8 }}
              />
            ) : null,
          )
        : null}
      <span
        aria-hidden
        data-slot="tree-toggle"
        className={cn(
          "relative z-[1] -ms-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] text-fg-subtle transition-[transform,color,background-color] duration-150",
          item.hasChildren && "hover:bg-hover hover:text-fg",
        )}
        onClick={(e) => {
          if (!item.hasChildren || item.disabled) return;
          e.stopPropagation();
          tree.toggleExpanded(item.id);
          (e.currentTarget.closest("[data-tree-id]") as HTMLElement | null)?.focus({ preventScroll: true });
        }}
      >
        {item.loading ? (
          <Spinner size="xs" tone="muted" />
        ) : item.error ? (
          <TriangleAlert className="size-3.5 text-warning" />
        ) : item.hasChildren ? (
          <ChevronRight className={cn("size-3.5 transition-transform duration-150 rtl:-scale-x-100 motion-reduce:transition-none", item.expanded && "rotate-90 rtl:rotate-90")} strokeWidth={2.25} />
        ) : null}
      </span>
      {checkbox ? <TreeCheckboxMark checked={item.checked} /> : null}
      {node.icon ? <span className="inline-flex shrink-0 text-fg-muted [&_svg]:size-4" aria-hidden>{node.icon}</span> : null}
      <span className="min-w-0 flex-1 truncate" data-slot="tree-label">
        {label ?? <TreeLabelText text={node.label} query={query} locale={locale} />}
        {node.description ? <span className="ms-2 text-xs font-normal text-fg-subtle">{node.description}</span> : null}
      </span>
      {item.loading ? <span className="sr-only">{t("loading")}</span> : null}
      {item.error ? (
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-fg-muted">
          <span>{t("loadError")}</span>
          <button
            type="button"
            tabIndex={-1}
            className="inline-flex items-center gap-1 rounded-ui-sm px-1.5 py-0.5 font-medium text-fg hover:bg-hover focus-ring"
            onClick={(e) => {
              e.stopPropagation();
              tree.reload(item.id);
            }}
          >
            <RotateCw aria-hidden className="size-3" /> {t("retry")}
          </button>
        </span>
      ) : null}
      {node.badge != null ? <span className="shrink-0 text-xs tabular text-fg-subtle">{node.badge}</span> : null}
      {actions ? (
        <span
          data-slot="tree-actions"
          className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/tree-row:opacity-100 group-focus-visible/tree-row:opacity-100 focus-within:opacity-100 [&_button]:size-6"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {actions}
        </span>
      ) : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* TreeView                                                            */
/* ------------------------------------------------------------------ */

export interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onSelect" | "children"> {
  /** The hierarchy. */
  data: TreeNode[];
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** `"checkbox"` = tri-state checks with cascade. Default `"single"`. */
  selectionMode?: "none" | "single" | "multiple" | "checkbox";
  /** Selected ids (checked ids in `"checkbox"` mode). */
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Checkbox mode: checking a parent checks its descendants. Default `true`. */
  cascade?: boolean;
  /** Checkbox mode: what a fully-checked branch yields. Default `"all"`. */
  checkValueMode?: TreeCheckValueMode;
  /** Can this node be selected? Default: any enabled node. */
  isSelectable?: (node: TreeNode, hasChildren: boolean) => boolean;
  /** Loads children of a node with `hasChildren` on first expand. */
  loadChildren?: (node: TreeNode, signal: AbortSignal) => Promise<TreeNode[]>;
  /** Keeps matches + ancestors and highlights the match. */
  filter?: string;
  /** Enter / double click (open a page, a folder). */
  onAction?: (node: TreeNode) => void;
  /** Trailing per-row buttons (revealed on hover / focus). Use `tabIndex={-1}`-free IconButtons; they stay mouse + Tab reachable. */
  renderActions?: (node: TreeNode) => React.ReactNode;
  /** Replace a row's label. */
  renderLabel?: (item: TreeItemState) => React.ReactNode;
  /** Render only the rows in view (thousands of nodes). Needs a fixed `height`. */
  virtual?: boolean;
  /** Scroll height (virtual mode, or any long tree). Default 360 when `virtual`. */
  height?: number | string;
  /** Indent per level in px. Default 16. */
  indent?: number;
  /** Indent guide lines. Default `true`. */
  guides?: boolean;
  variant?: "default" | "sidebar";
  size?: "sm" | "md";
  /** Shown when `data` is empty. */
  emptyState?: React.ReactNode;
  labels?: Partial<TreeViewLabels>;
  /** Accessible name of the tree. */
  "aria-label"?: string;
}

/**
 * Display and navigate hierarchies — CMS page tree, category tree, media folders, department
 * tree, file explorer panes. A flat WAI-ARIA tree (level / set size / position on every row) with
 * single, multiple or tri-state checkbox selection, lazy children, filter with ancestors kept and
 * optional virtualisation for 10k+ nodes.
 *
 * ```tsx
 * <TreeView aria-label="Pages" data={pages} defaultExpanded={["company"]} onAction={(n) => open(n.id)} />
 * <TreeView aria-label="Categories" data={categories} selectionMode="checkbox" checkValueMode="leaf" />
 * ```
 */
export const TreeView = React.forwardRef<HTMLDivElement, TreeViewProps>(function TreeView(
  {
    data,
    expanded,
    defaultExpanded,
    onExpandedChange,
    selectionMode = "single",
    selected,
    defaultSelected,
    onSelectedChange,
    cascade,
    checkValueMode,
    isSelectable,
    loadChildren,
    filter,
    onAction,
    renderActions,
    renderLabel,
    virtual = false,
    height,
    indent = 16,
    guides = true,
    variant = "default",
    size = "md",
    emptyState,
    labels,
    className,
    style,
    ...props
  },
  ref,
) {
  const t = useLabels("treeView", treeViewLabels, labels);
  const { locale, dir } = useLocale();
  const checkbox = selectionMode === "checkbox";
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const virtualizerRef = React.useRef<{ scrollToIndex: (i: number, o?: { align?: "auto" }) => void } | null>(null);

  const tree = useTree({
    nodes: data,
    expanded,
    defaultExpanded,
    onExpandedChange,
    loadChildren,
    filter,
    locale,
    dir,
    selectionMode: checkbox ? "none" : selectionMode,
    selected: checkbox ? undefined : selected,
    defaultSelected: checkbox ? undefined : defaultSelected,
    onSelectedChange: checkbox ? undefined : onSelectedChange,
    isSelectable,
    checkable: checkbox,
    checked: checkbox ? selected : undefined,
    defaultChecked: checkbox ? defaultSelected : undefined,
    onCheckedChange: checkbox ? onSelectedChange : undefined,
    cascade,
    checkValueMode,
    onAction,
    scrollToIndex: (i) => virtualizerRef.current?.scrollToIndex(i, { align: "auto" }),
  });

  const rowPx = size === "sm" ? 28 : 32;
  const virtualizer = useVirtualizer({
    count: virtual ? tree.items.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowPx,
    overscan: 12,
    getItemKey: (i) => tree.items[i]?.id ?? i,
  });
  virtualizerRef.current = virtual ? virtualizer : null;

  const onRowClick = (item: TreeItemState) => {
    if (checkbox) tree.toggleChecked(item.id);
    else if (selectionMode !== "none" && (!isSelectable || isSelectable(item.node, item.hasChildren))) tree.select(item.id);
    else if (item.hasChildren) tree.toggleExpanded(item.id);
  };

  const renderRow = (item: TreeItemState, extra?: { style?: React.CSSProperties; index?: number; measure?: (el: HTMLElement | null) => void }) => (
    <TreeViewRow
      key={item.id}
      ref={extra?.measure}
      data-index={extra?.index}
      item={item}
      tree={tree}
      indent={indent}
      guides={guides}
      size={size}
      variant={variant}
      checkbox={checkbox}
      query={filter}
      label={renderLabel?.(item)}
      actions={renderActions?.(item.node)}
      labels={labels}
      style={extra?.style}
      onRowClick={onRowClick}
      onDoubleClick={() => !item.disabled && onAction?.(item.node)}
    />
  );

  const treeProps = tree.getTreeProps();
  const setRefs = (el: HTMLDivElement | null) => {
    treeProps.ref(el);
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
    if (!virtual) scrollRef.current = el;
  };

  if (data.length === 0) {
    return (
      <div data-slot="tree-view-empty" className={cn("px-3 py-6 text-center text-sm text-fg-muted", className)} style={style}>
        {emptyState ?? t("empty")}
      </div>
    );
  }

  const noMatches = tree.filtering && tree.items.length === 0;
  const scrollHeight = height ?? (virtual ? 360 : undefined);

  return (
    <div data-slot="tree-view" className={cn("relative", className)} style={style}>
      {tree.filtering ? (
        <span className="sr-only" role="status" aria-live="polite">
          {t("results", { count: tree.matchCount })}
        </span>
      ) : null}
      {noMatches ? (
        <p className="px-3 py-6 text-center text-sm text-fg-muted">{t("noMatches", { query: filter ?? "" })}</p>
      ) : virtual ? (
        <div ref={scrollRef} className="overflow-auto overscroll-contain" style={{ height: scrollHeight }}>
          <div
            {...treeProps}
            ref={setRefs}
            aria-label={props["aria-label"]}
            {...props}
            className="relative w-full outline-none"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((v) => {
              const item = tree.items[v.index];
              if (!item) return null;
              return renderRow(item, {
                index: v.index,
                measure: virtualizer.measureElement,
                style: { position: "absolute", top: 0, insetInlineStart: 0, transform: `translateY(${v.start}px)` },
              });
            })}
          </div>
        </div>
      ) : (
        <div
          {...treeProps}
          ref={setRefs}
          {...props}
          className={cn("grid gap-px outline-none", scrollHeight !== undefined && "overflow-auto overscroll-contain")}
          style={scrollHeight !== undefined ? { maxHeight: scrollHeight } : undefined}
        >
          {tree.items.map((item) => renderRow(item))}
        </div>
      )}
    </div>
  );
});
