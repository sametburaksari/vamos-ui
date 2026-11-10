"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useLink } from "../lib/provider";
import { controlVariants } from "../lib/variants";
import { buttonVariants } from "./button";
import { Spinner } from "./spinner";

const paginationLabels = {
  label: "Pagination",
  previous: "Previous",
  next: "Next",
  previousPage: "Previous page",
  nextPage: "Next page",
  goTo: "Page {page}",
  page: "Page {page} of {total}",
  range: "{from}–{to} of {total}",
  empty: "No results",
  pageSize: "Rows per page",
  morePages: "More pages",
};
type PaginationLabels = Partial<typeof paginationLabels>;

/* ------------------------------------------------------------------ */
/* Range                                                               */
/* ------------------------------------------------------------------ */

export type PaginationRangeItem = number | "ellipsis-start" | "ellipsis-end";

export interface PaginationRangeOptions {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  /** Pages shown on each side of the current one. Default 1. */
  siblingCount?: number;
  /** Pages always shown at the start and end. Default 1. */
  boundaryCount?: number;
}

/**
 * The page numbers to render, with ellipsis markers. The length stays constant while paging
 * (no jumping buttons): `paginationRange({ page: 6, pageCount: 20 })` → `[1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 20]`.
 * A gap of exactly one page shows the page instead of "…".
 */
export function paginationRange({ page, pageCount, siblingCount = 1, boundaryCount = 1 }: PaginationRangeOptions): PaginationRangeItem[] {
  const count = Math.max(0, Math.floor(pageCount));
  if (count === 0) return [];
  const current = Math.min(Math.max(1, Math.floor(page)), count);
  const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  // boundaries + siblings + current + 2 ellipses
  const total = boundaryCount * 2 + siblingCount * 2 + 3;
  if (count <= total) return range(1, count);

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);
  const siblingsStart = Math.max(Math.min(current - siblingCount, count - boundaryCount - siblingCount * 2 - 1), boundaryCount + 2);
  const siblingsEnd = Math.min(Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2), count - boundaryCount - 1);

  const out: PaginationRangeItem[] = [...startPages];
  if (siblingsStart > boundaryCount + 2) out.push("ellipsis-start");
  else if (boundaryCount + 1 < count - boundaryCount) out.push(boundaryCount + 1);
  out.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < count - boundaryCount - 1) out.push("ellipsis-end");
  else if (count - boundaryCount > boundaryCount) out.push(count - boundaryCount);
  out.push(...endPages);
  return out;
}

/** Memoised `paginationRange` for components. */
export function usePaginationRange(options: PaginationRangeOptions): PaginationRangeItem[] {
  const { page, pageCount, siblingCount, boundaryCount } = options;
  return React.useMemo(() => paginationRange({ page, pageCount, siblingCount, boundaryCount }), [page, pageCount, siblingCount, boundaryCount]);
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

type PaginationSize = "sm" | "md";
const SizeContext = React.createContext<PaginationSize>("md");

const itemSize = {
  sm: "h-8 min-w-8 px-2 text-[13px] rounded-ui-sm [&_svg]:size-3.5",
  md: "h-(--control-h) min-w-(--control-h) px-2.5 text-sm rounded-ui [&_svg]:size-4",
} as const;

/** The `<ul>` of page items. */
export const PaginationList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(function PaginationList({ className, ...props }, ref) {
  return <ul ref={ref} data-slot="pagination-list" className={cn("flex items-center gap-1", className)} {...props} />;
});

/** One `<li>`. */
export const PaginationItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(function PaginationItem({ className, ...props }, ref) {
  return <li ref={ref} data-slot="pagination-item" className={cn("inline-flex", className)} {...props} />;
});

export interface PaginationLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ButtonHTMLAttributes<HTMLButtonElement>, "href" | "type"> {
  /** Real link (SEO, blog archives). Without it the item is a `<button>`. */
  href?: string;
  /** The current page (`aria-current="page"`). */
  isActive?: boolean;
  disabled?: boolean;
  /** Spinner in place of the label (current page while the next page loads). */
  loading?: boolean;
}

/** A page number, or the shell for Previous / Next. Router `Link` when `href` is set, else a button. */
export const PaginationLink = React.forwardRef<HTMLElement, PaginationLinkProps>(function PaginationLink(
  { href, isActive, disabled, loading, className, children, onClick, ...props },
  ref,
) {
  const Link = useLink();
  const size = React.useContext(SizeContext);
  const classes = cn(
    buttonVariants({ variant: "ghost" }),
    itemSize[size],
    "tabular font-normal text-fg-muted hover:text-fg",
    isActive && "bg-selected font-semibold text-fg hover:bg-selected",
    className,
  );
  const content = loading ? (
    <>
      <span className="invisible">{children}</span>
      <Spinner size="xs" className="absolute" />
    </>
  ) : (
    children
  );
  if (href !== undefined && !disabled) {
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} aria-current={isActive ? "page" : undefined} aria-busy={loading || undefined} className={classes} data-slot="pagination-link" onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>} {...props}>
        {content}
      </Link>
    );
  }
  if (href !== undefined && disabled) {
    // A disabled link: no href, so it isn't focusable or followable.
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} role="link" aria-disabled="true" className={classes} data-slot="pagination-link" {...props}>
        {content}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      aria-current={isActive ? "page" : undefined}
      aria-busy={loading || undefined}
      disabled={disabled}
      className={classes}
      data-slot="pagination-link"
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      {...props}
    >
      {content}
    </button>
  );
});

export interface PaginationStepProps extends PaginationLinkProps {
  /** Show the word next to the arrow ("Previous"). Default: only the arrow; the name is always "Previous page". */
  showLabel?: boolean;
  labels?: PaginationLabels;
}

/** Previous-page control. The arrow flips in RTL. */
export const PaginationPrevious = React.forwardRef<HTMLElement, PaginationStepProps>(function PaginationPrevious({ showLabel, labels, className, ...props }, ref) {
  const t = useLabels("pagination", paginationLabels, labels);
  return (
    <PaginationLink ref={ref} aria-label={t("previousPage")} className={cn(showLabel && "gap-1 ps-2 pe-3", className)} data-slot="pagination-previous" {...props}>
      <ChevronLeft aria-hidden className="rtl:-scale-x-100" />
      {showLabel ? <span>{t("previous")}</span> : null}
    </PaginationLink>
  );
});

/** Next-page control. The arrow flips in RTL. */
export const PaginationNext = React.forwardRef<HTMLElement, PaginationStepProps>(function PaginationNext({ showLabel, labels, className, ...props }, ref) {
  const t = useLabels("pagination", paginationLabels, labels);
  return (
    <PaginationLink ref={ref} aria-label={t("nextPage")} className={cn(showLabel && "gap-1 ps-3 pe-2", className)} data-slot="pagination-next" {...props}>
      {showLabel ? <span>{t("next")}</span> : null}
      <ChevronRight aria-hidden className="rtl:-scale-x-100" />
    </PaginationLink>
  );
});

/** "…" between page numbers. */
export function PaginationEllipsis({ className, labels, ...props }: React.HTMLAttributes<HTMLSpanElement> & { labels?: PaginationLabels }) {
  const t = useLabels("pagination", paginationLabels, labels);
  const size = React.useContext(SizeContext);
  return (
    <span data-slot="pagination-ellipsis" className={cn("inline-flex items-center justify-center text-fg-subtle", size === "sm" ? "h-8 w-6 [&_svg]:size-3.5" : "h-(--control-h) w-7 [&_svg]:size-4", className)} {...props}>
      <MoreHorizontal aria-hidden />
      <span className="sr-only">{t("morePages")}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  /** Web / SEO: real `<a href>` links through the app's router `Link`. */
  getHref?: (page: number) => string;
  /** Default 1. */
  siblingCount?: number;
  /** Default 1. */
  boundaryCount?: number;
  /** `numbers` (default), `compact` ("3 / 52" + arrows) or `simple` (Previous / Next). Below 640px `numbers` shows as `compact`. */
  variant?: "numbers" | "compact" | "simple";
  size?: PaginationSize;
  /** Render nothing when there is only one page. Default `true`. */
  hideOnSinglePage?: boolean;
  /** Spinner on the current page and arrows locked while the next page loads. */
  loading?: boolean;
  labels?: PaginationLabels;
}

/**
 * Page through a long list. 1-based `page`, props line up with TanStack Table state.
 *
 * ```tsx
 * <Pagination page={page} pageCount={52} onPageChange={setPage} />
 * <Pagination page={3} pageCount={12} getHref={(p) => `/blog?page=${p}`} />   // SEO links
 * ```
 *
 * Moving focus to the top of the list after a page change is the consumer's job.
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, pageCount, onPageChange, getHref, siblingCount, boundaryCount, variant = "numbers", size = "md", hideOnSinglePage = true, loading, labels, className, ...props },
  ref,
) {
  const t = useLabels("pagination", paginationLabels, labels);
  const range = usePaginationRange({ page, pageCount, siblingCount, boundaryCount });
  if (pageCount < 1 || (hideOnSinglePage && pageCount <= 1)) return null;
  const current = Math.min(Math.max(1, page), pageCount);

  const go = (p: number) => (e: React.MouseEvent) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (p !== current) onPageChange?.(p);
  };
  const linkProps = (p: number) => (getHref ? { href: getHref(p) } : {});

  const compact = (
    <span className="tabular px-2 text-[13px] text-fg-muted" aria-live="polite">
      <span className="sr-only">{t("page", { page: current, total: pageCount })}</span>
      <span aria-hidden>
        <span className="font-medium text-fg">{current}</span> / {pageCount}
      </span>
    </span>
  );

  return (
    <SizeContext.Provider value={size}>
      <nav ref={ref} aria-label={t("label")} data-slot="pagination" data-variant={variant} className={cn("flex", className)} {...props}>
        <PaginationList>
          <PaginationItem>
            <PaginationPrevious disabled={current <= 1 || loading} onClick={go(current - 1)} showLabel={variant === "simple"} labels={labels} {...linkProps(current - 1)} />
          </PaginationItem>
          {variant === "numbers"
            ? range.map((item) =>
                typeof item === "number" ? (
                  <PaginationItem key={item} className="max-sm:hidden">
                    <PaginationLink
                      isActive={item === current}
                      loading={loading && item === current}
                      aria-label={t("goTo", { page: item })}
                      onClick={go(item)}
                      {...linkProps(item)}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item} className="max-sm:hidden">
                    <PaginationEllipsis labels={labels} />
                  </PaginationItem>
                ),
              )
            : null}
          {variant === "numbers" ? <PaginationItem className="sm:hidden">{compact}</PaginationItem> : null}
          {variant === "compact" ? <PaginationItem>{compact}</PaginationItem> : null}
          <PaginationItem>
            <PaginationNext disabled={current >= pageCount || loading} onClick={go(current + 1)} showLabel={variant === "simple"} labels={labels} {...linkProps(current + 1)} />
          </PaginationItem>
        </PaginationList>
      </nav>
    </SizeContext.Provider>
  );
});

/* ------------------------------------------------------------------ */
/* PaginationBar                                                       */
/* ------------------------------------------------------------------ */

export interface PaginationBarProps extends Omit<PaginationProps, "pageCount"> {
  /** Total number of rows. */
  total: number;
  pageSize: number;
  /** Default `[10, 20, 50, 100]`. Pass `[]` to hide the page-size picker. */
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * The table footer: "1–20 of 312" + rows per page + page numbers. Changing the page size keeps the
 * first visible row on screen (the page is recomputed) — the consumer receives both callbacks.
 */
export const PaginationBar = React.forwardRef<HTMLDivElement, PaginationBarProps>(function PaginationBar(
  { total, pageSize, pageSizeOptions = [10, 20, 50, 100], onPageSizeChange, page, onPageChange, labels, size = "md", className, style, id, ...props },
  ref,
) {
  const t = useLabels("pagination", paginationLabels, labels);
  const f = useFormat();
  const selectId = React.useId();
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const current = Math.min(Math.max(1, page), pageCount);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);
  const options = pageSizeOptions.includes(pageSize) || pageSizeOptions.length === 0 ? pageSizeOptions : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

  return (
    <div ref={ref} id={id} style={style} data-slot="pagination-bar" className={cn("flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-fg-muted", className)}>
      <p className="tabular me-auto" aria-live="polite">
        {total === 0 ? t("empty") : t("range", { from: f.number(from), to: f.number(to), total: f.number(total) })}
      </p>
      {options.length > 0 && onPageSizeChange ? (
        <div className="flex items-center gap-2">
          <label htmlFor={selectId} className="whitespace-nowrap">
            {t("pageSize")}
          </label>
          <div className="relative">
            <select
              id={selectId}
              value={pageSize}
              onChange={(e) => {
                const next = Number(e.target.value);
                onPageSizeChange(next);
                // keep the first visible row on screen
                const nextPage = Math.floor((from > 0 ? from - 1 : 0) / next) + 1;
                if (nextPage !== current) onPageChange?.(nextPage);
              }}
              className={cn(controlVariants({ size: "sm" }), "tabular w-auto appearance-none pe-7 text-fg")}
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {f.number(o)}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-fg-subtle" />
          </div>
        </div>
      ) : null}
      <Pagination page={current} pageCount={pageCount} onPageChange={onPageChange} labels={labels} size={size} hideOnSinglePage={false} {...props} />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* CursorPagination                                                    */
/* ------------------------------------------------------------------ */

export interface CursorPaginationProps extends React.HTMLAttributes<HTMLElement> {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  /** Locks both buttons and shows a spinner on the one that was pressed. */
  loading?: boolean;
  /** Optional status in the middle, e.g. "Showing 50 contacts". */
  status?: React.ReactNode;
  size?: PaginationSize;
  labels?: PaginationLabels;
}

/** Previous / Next for cursor APIs where the total is unknown. */
export const CursorPagination = React.forwardRef<HTMLElement, CursorPaginationProps>(function CursorPagination(
  { hasPrev, hasNext, onPrev, onNext, loading, status, size = "md", labels, className, ...props },
  ref,
) {
  const t = useLabels("pagination", paginationLabels, labels);
  const [pressed, setPressed] = React.useState<"prev" | "next" | null>(null);
  React.useEffect(() => {
    if (!loading) setPressed(null);
  }, [loading]);
  const btn = cn(buttonVariants({ variant: "secondary", size: size === "sm" ? "sm" : "md" }), "gap-1");
  return (
    <nav ref={ref} aria-label={t("label")} data-slot="cursor-pagination" className={cn("flex items-center gap-3", className)} {...props}>
      <button
        type="button"
        className={cn(btn, "ps-2.5")}
        disabled={!hasPrev || loading}
        aria-busy={(loading && pressed === "prev") || undefined}
        onClick={() => {
          setPressed("prev");
          onPrev?.();
        }}
      >
        {loading && pressed === "prev" ? <Spinner size="xs" /> : <ChevronLeft aria-hidden className="rtl:-scale-x-100" />}
        {t("previous")}
      </button>
      {status ? <span className="tabular text-[13px] text-fg-muted">{status}</span> : null}
      <button
        type="button"
        className={cn(btn, "pe-2.5")}
        disabled={!hasNext || loading}
        aria-busy={(loading && pressed === "next") || undefined}
        onClick={() => {
          setPressed("next");
          onNext?.();
        }}
      >
        {t("next")}
        {loading && pressed === "next" ? <Spinner size="xs" /> : <ChevronRight aria-hidden className="rtl:-scale-x-100" />}
      </button>
    </nav>
  );
});
