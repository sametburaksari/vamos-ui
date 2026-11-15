"use client";

import * as React from "react";
import { Pagination } from "../../components/pagination";
import { cn2 as cn } from "./shared/kit-2";
import { newsText, type NewsBlockLabels } from "./shared/labels-news";

export interface NewsPaginationProps {
  /** Current page, 1-based. */
  page: number;
  total: number;
  /** URL of a page: `"/latest?page={page}"`. Page 1 drops `?page={page}` / `&page={page}`. Serializable, so server components can pass it. */
  hrefTemplate?: string;
  /** Client-side paging instead of links. */
  onPageChange?: (page: number) => void;
  locale?: string;
  labels?: NewsBlockLabels;
  className?: string;
}

/** Fills a `{page}` template; page 1 drops a trailing `?page={page}`. */
export function newsPageHref(template: string, page: number): string {
  if (page === 1 && /[?&][\w-]+=\{page\}$/.test(template)) return template.replace(/[?&][\w-]+=\{page\}$/, "") || "?";
  return template.replace("{page}", String(page));
}

/**
 * Numbered archive pagination with the "Page 1 of 17" line, built on the kit `Pagination`
 * (real links for crawlers, compact on phones). Takes a string template instead of a function,
 * so a server component can render it.
 *
 * ```tsx
 * <NewsPagination page={1} total={17} hrefTemplate="/latest?page={page}" />
 * ```
 */
export function NewsPagination({ page, total, hrefTemplate, onPageChange, locale = "en-US", labels, className }: NewsPaginationProps) {
  const t = newsText(labels, locale);
  if (total <= 1) return null;
  return (
    <div className={cn("vb-news-pagination flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-5", className)}>
      <Pagination
        page={page}
        pageCount={total}
        onPageChange={onPageChange}
        getHref={hrefTemplate ? (p) => newsPageHref(hrefTemplate, p) : undefined}
        labels={{ label: t("pagination"), previousPage: t("previousPage"), nextPage: t("nextPage") }}
      />
      <p className="font-mono text-[0.75rem] uppercase tracking-[0.08em] tabular text-fg-muted">{t("pageOf", { page, total })}</p>
    </div>
  );
}
