"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "radix-ui/toggle-group";
import { cva } from "class-variance-authority";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "../lib/cn";
import { SrName } from "../lib/sr-name";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { Progress } from "./progress";
import { SkeletonRow } from "./skeleton";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "./sheet";

/* ------------------------------------------------------------------ */
/* Labels & context                                                    */
/* ------------------------------------------------------------------ */

const listLabels = {
  selected: "{count, plural, one {# selected} other {# selected}}",
  selectAll: "Select all",
  selectAllCount: "Select all {total}",
  allSelected: "All {total} selected",
  clear: "Clear selection",
  bulkActions: "Bulk actions",
  filters: "Filters",
  filtersCount: "Filters ({count})",
  search: "Search",
  view: "View",
  results: "{count, plural, one {# result} other {# results}}",
  loading: "Loading…",
  refreshing: "Updating results…",
  noResults: "No results match your filters",
  clearFilters: "Clear filters",
  error: "Couldn't load this list",
  retry: "Try again",
};

export type ListLayoutLabels = Partial<typeof listLabels>;

interface ListLayoutContextValue {
  stickyToolbar: boolean;
  bulkActive: boolean;
  setBulkActive: (active: boolean) => void;
  toolbarRef: React.RefObject<HTMLDivElement | null>;
}

const ListLayoutContext = /*#__PURE__*/ React.createContext<ListLayoutContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* ListLayout                                                          */
/* ------------------------------------------------------------------ */

export const listLayoutVariants = /*#__PURE__*/ cva("@container/list relative mx-auto flex w-full min-w-0 flex-col", {
  variants: {
    width: {
      /** Edge to edge of the page area. */
      full: "max-w-none",
      /** 90rem — big tables and boards. */
      wide: "max-w-(--container-wide)",
      /** 76rem — most index pages. */
      content: "max-w-(--container)",
    },
  },
  defaultVariants: { width: "full" },
});

export interface ListLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `full` (default) · `wide` 90rem · `content` 76rem. */
  width?: "full" | "wide" | "content";
  /** The toolbar (and the bulk bar that replaces it) stick under the top bar. Default `true`. */
  stickyToolbar?: boolean;
  /**
   * Distance from the top of the scroll container where the toolbar sticks. Default
   * `"var(--topbar-h)"` (under the App shell top bar). Use `0` inside your own scroll box.
   */
  stickyTop?: number | string;
}

/**
 * The standard index page: Page header, toolbar (search, filters, saved views, view switch),
 * bulk-action bar, content (table, grid or board) and footer pagination — with one consistent
 * set of loading, empty, no-results and error states. Arrangement and states only: filtering,
 * selection and data fetching stay in your Data Table / Filter bar / data layer.
 *
 * ```tsx
 * <ListLayout>
 *   <PageHeader title="Contacts" meta={<Badge>1,284</Badge>} actions={<Button variant="primary">New contact</Button>} />
 *   <ListToolbar search={<Input … />} filters={<FilterBar … />} viewSwitch={<ListViewSwitch … />} />
 *   <ListBulkBar count={selected.length} total={1284} onClear={clear}>…</ListBulkBar>
 *   <ListContent state={state}>{table}</ListContent>
 *   <ListFooter><PaginationBar … /></ListFooter>
 * </ListLayout>
 * ```
 *
 * Responds to its own width (container queries), so it behaves the same in a split view.
 */
export const ListLayout = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ListLayoutProps>(function ListLayout(
  { width = "full", stickyToolbar = true, stickyTop, className, style, ...props },
  ref,
) {
  const [bulkActive, setBulkActive] = React.useState(false);
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const ctx = React.useMemo(() => ({ stickyToolbar, bulkActive, setBulkActive, toolbarRef }), [stickyToolbar, bulkActive]);
  const top = stickyTop === undefined ? undefined : typeof stickyTop === "number" ? `${stickyTop}px` : stickyTop;
  return (
    <ListLayoutContext.Provider value={ctx}>
      <div
        ref={ref}
        data-slot="list-layout"
        data-bulk={bulkActive ? "" : undefined}
        className={cn(listLayoutVariants({ width }), className)}
        style={top !== undefined ? ({ "--list-sticky-top": top, ...style } as React.CSSProperties) : style}
        {...props}
      />
    </ListLayoutContext.Provider>
  );
});

const stickyBar = "sticky top-(--list-sticky-top,var(--topbar-h)) z-(--z-sticky)";

/* ------------------------------------------------------------------ */
/* ListToolbar                                                         */
/* ------------------------------------------------------------------ */

export interface ListToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The search field. Wrapped in a `role="search"` landmark (only the search, not the whole bar). */
  search?: React.ReactNode;
  /** Filter chips / Filter bar. Below ~640px of width they move into a "Filters" sheet. */
  filters?: React.ReactNode;
  /** Number of active filters, shown on the collapsed "Filters (3)" button. */
  filterCount?: number;
  /** Saved views (tabs or a menu) — the first row on wide screens. */
  views?: React.ReactNode;
  /** Table / grid / board switch — `ListViewSwitch`. */
  viewSwitch?: React.ReactNode;
  /** Trailing actions: export, column settings, "⋯". */
  actions?: React.ReactNode;
  /** Accessible name of the search landmark. Default "Search". */
  searchLabel?: string;
  labels?: ListLayoutLabels;
}

/**
 * The row above the content. Sticky under the top bar on the bar surface; while a selection is
 * active the `ListBulkBar` takes its place.
 */
export const ListToolbar = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ListToolbarProps>(function ListToolbar(
  { search, filters, filterCount, views, viewSwitch, actions, searchLabel, labels, className, children, ...props },
  ref,
) {
  const t = useLabels("list", listLabels, labels);
  const ctx = React.useContext(ListLayoutContext);
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (ctx) ctx.toolbarRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ctx, ref],
  );
  const hidden = ctx?.bulkActive ?? false;
  const sticky = ctx?.stickyToolbar ?? false;
  const filterLabel = filterCount ? t("filtersCount", { count: filterCount }) : t("filters");

  return (
    <div
      ref={setRefs}
      data-slot="list-toolbar"
      hidden={hidden || undefined}
      className={cn(
        "flex flex-col gap-2.5 py-3",
        sticky && cn(stickyBar, "surface-bar -mx-[var(--page-px,1.5rem)] border-b px-[var(--page-px,1.5rem)]"),
        !sticky && "border-b border-line",
        className,
      )}
      {...props}
    >
      {views ? <div data-slot="list-toolbar-views" className="-mt-1 min-w-0">{views}</div> : null}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {search ? (
          <div role="search" aria-label={searchLabel ?? t("search")} data-slot="list-toolbar-search" className="min-w-0 flex-[1_1_10rem] @2xl/list:max-w-80">
            {search}
          </div>
        ) : null}
        {filters ? (
          <>
            <div data-slot="list-toolbar-filters" className="order-last hidden w-full min-w-0 flex-wrap items-center gap-1.5 @2xl/list:flex @5xl/list:order-none @5xl/list:w-auto @5xl/list:flex-[1_1_0]">
              {filters}
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="@2xl/list:hidden">
                  {/* "Filters (3)" is read from a hidden span: the visible text is "Filters" + a count badge,
                      or only the badge at narrow widths, so an aria-label would fail label-in-name. */}
                  <SrName name={filterLabel}>
                    <SlidersHorizontal aria-hidden />
                    <span className="hidden @sm/list:inline">{t("filters")}</span>
                    {filterCount ? (
                      <span className="tabular -me-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-soft px-1.5 text-[11px] font-semibold text-accent-ink">
                        {filterCount}
                      </span>
                    ) : null}
                  </SrName>
                </Button>
              </SheetTrigger>
              <SheetContent side="end" size="sm">
                <SheetHeader title={t("filters")} />
                <SheetBody>
                  <div className="flex flex-col items-stretch gap-2 [&>*]:w-full">{filters}</div>
                </SheetBody>
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className="flex-1" />
        )}
        {viewSwitch || actions ? (
          <div data-slot="list-toolbar-end" className="ms-auto flex shrink-0 items-center gap-2">
            {viewSwitch}
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* ListViewSwitch                                                      */
/* ------------------------------------------------------------------ */

export interface ListViewOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ListViewSwitchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "dir"> {
  options: ListViewOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name of the group. Default "View". */
  label?: string;
  labels?: ListLayoutLabels;
}

/**
 * Table / grid / board switch: a segmented radio group (one tab stop, arrow keys move, Space selects). Labels
 * collapse to icons below ~640px of list width; the accessible name stays.
 */
export const ListViewSwitch = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ListViewSwitchProps>(function ListViewSwitch(
  { options, value: valueProp, defaultValue, onValueChange, label, labels, className, ...props },
  ref,
) {
  const t = useLabels("list", listLabels, labels);
  const [inner, setInner] = React.useState(defaultValue ?? options[0]?.value ?? "");
  const value = valueProp ?? inner;
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type="single"
      aria-label={label ?? t("view")}
      value={value}
      onValueChange={(next: string) => {
        if (!next) return; // a view switch always has a view
        if (valueProp === undefined) setInner(next);
        onValueChange?.(next);
      }}
      data-slot="list-view-switch"
      className={cn("inline-flex h-(--control-h) items-stretch gap-0.5 rounded-ui border border-line bg-surface-2 p-[3px]", className)}
      {...props}
    >
      {options.map((o) => (
        <ToggleGroupPrimitive.Item
          key={o.value}
          value={o.value}
          aria-label={o.label}
          title={o.label}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[calc(var(--radius)-5px)] px-2.5 text-[13px] font-medium text-fg-muted outline-none transition-[color,background-color,box-shadow] duration-150 focus-ring",
            "hover:text-fg data-[state=on]:bg-surface data-[state=on]:text-fg data-[state=on]:shadow-[0_1px_2px_rgb(0_0_0/0.1),0_0_0_1px_var(--line)] glass:data-[state=on]:bg-field",
            "[&_svg]:size-4 [&_svg]:shrink-0",
          )}
        >
          {o.icon ? <span aria-hidden className="inline-flex">{o.icon}</span> : null}
          <span className={cn(o.icon && "hidden @2xl/list:inline")}>{o.label}</span>
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
});

/* ------------------------------------------------------------------ */
/* ListBulkBar                                                         */
/* ------------------------------------------------------------------ */

export interface ListBulkBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Selected rows. The bar shows while `count > 0` and takes the toolbar's place. */
  count: number;
  /** Rows across all pages. With `onSelectAll`, shows "Select all {total}". */
  total?: number;
  /** Extends the selection to every row that matches the current filters (all pages). */
  onSelectAll?: () => void;
  /** `true` once the selection covers all `total` rows ("All 1,284 selected"). */
  allSelected?: boolean;
  onClear: () => void;
  /** Bulk actions (buttons, an ActionMenu). */
  children?: React.ReactNode;
  labels?: ListLayoutLabels;
}

/**
 * The selection bar. Presentational: the Data Table (or your list) owns the selection. Announces
 * "{n} selected" politely; Esc inside the bar clears the selection and focus returns to the toolbar.
 */
export const ListBulkBar = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ListBulkBarProps>(function ListBulkBar(
  { count, total, onSelectAll, allSelected, onClear, labels, className, children, onKeyDown, ...props },
  ref,
) {
  const t = useLabels("list", listLabels, labels);
  const f = useFormat();
  const ctx = React.useContext(ListLayoutContext);
  const active = count > 0;
  const setBulkActive = ctx?.setBulkActive;
  const toolbarRef = ctx?.toolbarRef;
  const restoreFocus = React.useRef(false);

  React.useEffect(() => {
    setBulkActive?.(active);
    if (!active && restoreFocus.current) {
      restoreFocus.current = false;
      // After the toolbar is shown again, put focus back where the user was working.
      requestAnimationFrame(() => {
        const first = toolbarRef?.current?.querySelector<HTMLElement>("input, button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])");
        first?.focus();
      });
    }
  }, [active, setBulkActive, toolbarRef]);
  React.useEffect(() => () => setBulkActive?.(false), [setBulkActive]);

  const clear = () => {
    restoreFocus.current = true;
    onClear();
  };

  const totalText = total !== undefined ? f.number(total) : "";
  return (
    <>
      <div aria-live="polite" className="sr-only">
        {active ? (allSelected && total !== undefined ? t("allSelected", { total: totalText }) : t("selected", { count })) : ""}
      </div>
      {active ? (
        <div
          ref={ref}
          role="region"
          aria-label={t("bulkActions")}
          data-slot="list-bulk-bar"
          className={cn(
            ctx?.stickyToolbar && stickyBar,
            "ui-rise my-2 flex min-h-(--control-h) flex-wrap items-center gap-x-3 gap-y-2 rounded-ui-lg py-1.5 ps-1.5 pe-1.5 surface-popover",
            className,
          )}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (!e.defaultPrevented && e.key === "Escape") {
              e.preventDefault();
              clear();
            }
          }}
          {...props}
        >
          <span className="tabular inline-flex h-[calc(var(--control-h)-0.75rem)] items-center rounded-[calc(var(--radius)-4px)] bg-accent-soft px-2.5 text-[13px] font-semibold text-accent-ink">
            {allSelected && total !== undefined ? t("allSelected", { total: totalText }) : t("selected", { count })}
          </span>
          {onSelectAll && total !== undefined && total > count && !allSelected ? (
            <Button variant="link" size="sm" onClick={onSelectAll} className="text-[13px]">
              {t("selectAllCount", { total: totalText })}
            </Button>
          ) : null}
          <div className="ms-auto flex flex-wrap items-center gap-1.5">
            {children}
            <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />
            <Button variant="ghost" size="sm" onClick={clear} aria-keyshortcuts="Escape">
              <X aria-hidden /> <span className="hidden @md/list:inline">{t("clear")}</span>
              <span className="sr-only @md/list:hidden">{t("clear")}</span>
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
});

/* ------------------------------------------------------------------ */
/* ListContent                                                         */
/* ------------------------------------------------------------------ */

/** What the content area shows. */
export type ListContentState = "ready" | "loading" | "refreshing" | "empty" | "no-results" | "error";

export interface ListContentProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: ListContentState;
  /** First-use empty state (nothing exists yet). Default: a generic `EmptyState`. */
  empty?: React.ReactNode;
  /** Filters match nothing. Default: `EmptyState kind="no-results"` with "Clear filters" when `onClearFilters` is set. */
  noResults?: React.ReactNode;
  /** Load failed. Default: `EmptyState kind="error"` with "Try again" when `onRetry` is set. */
  error?: React.ReactNode;
  onRetry?: () => void;
  onClearFilters?: () => void;
  /** Loading placeholder. Default: skeleton rows. */
  skeleton?: React.ReactNode;
  /** Skeleton rows for the default placeholder. Default 6. */
  skeletonRows?: number;
  /** Total results, announced politely when the list becomes ready ("1,284 results"). */
  resultCount?: number;
  labels?: ListLayoutLabels;
}

/**
 * The content slot (table, grid or board) with every state. `refreshing` keeps the content and
 * shows a thin indeterminate bar; all states set `aria-busy` while work is pending.
 */
export const ListContent = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ListContentProps>(function ListContent(
  { state = "ready", empty, noResults, error, onRetry, onClearFilters, skeleton, skeletonRows = 6, resultCount, labels, className, children, ...props },
  ref,
) {
  const t = useLabels("list", listLabels, labels);
  const busy = state === "loading" || state === "refreshing";

  // Announce state changes once (not on every render).
  const [announcement, setAnnouncement] = React.useState("");
  const prev = React.useRef<ListContentState | null>(null);
  React.useEffect(() => {
    if (prev.current === null) {
      prev.current = state;
      return;
    }
    if (prev.current === state) return;
    prev.current = state;
    if (state === "loading") setAnnouncement(t("loading"));
    else if (state === "refreshing") setAnnouncement(t("refreshing"));
    else if (state === "no-results") setAnnouncement(t("noResults"));
    else if (state === "error") setAnnouncement(t("error"));
    else if (state === "ready" && resultCount !== undefined) setAnnouncement(t("results", { count: resultCount }));
    else setAnnouncement("");
  }, [state, resultCount, t]);

  let body: React.ReactNode;
  if (state === "loading") {
    body = skeleton ?? (
      <div data-slot="list-skeleton" className="divide-y divide-line overflow-hidden rounded-ui-lg border border-line">
        {Array.from({ length: skeletonRows }, (_, i) => (
          <SkeletonRow key={i} columns={4} />
        ))}
      </div>
    );
  } else if (state === "empty") {
    body = empty ?? <EmptyState kind="first-use" size="lg" />;
  } else if (state === "no-results") {
    body =
      noResults ??
      (
        <EmptyState
          kind="no-results"
          role="none"
          title={t("noResults")}
          actions={onClearFilters ? <Button onClick={onClearFilters}>{t("clearFilters")}</Button> : undefined}
        />
      );
  } else if (state === "error") {
    body =
      error ??
      (
        <EmptyState kind="error" title={t("error")} actions={onRetry ? <Button onClick={onRetry}>{t("retry")}</Button> : undefined} />
      );
  } else {
    body = children;
  }

  return (
    <div
      ref={ref}
      data-slot="list-content"
      data-state={state}
      aria-busy={busy || undefined}
      className={cn("relative min-w-0 flex-1 py-4", className)}
      {...props}
    >
      {state === "refreshing" ? (
        <Progress aria-label={t("refreshing")} value={null} size="xs" className="absolute inset-x-0 top-0 rounded-none bg-transparent" />
      ) : null}
      <div className={cn(state === "refreshing" && "opacity-70 transition-opacity motion-reduce:transition-none")}>{body}</div>
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* ListFooter                                                          */
/* ------------------------------------------------------------------ */

export interface ListFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/** The row under the content: `PaginationBar`, "Load more", a summary line. */
export const ListFooter = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ListFooterProps>(function ListFooter({ className, ...props }, ref) {
  return <div ref={ref} data-slot="list-footer" className={cn("flex flex-wrap items-center gap-3 border-t border-line pt-3 pb-1", className)} {...props} />;
});
