import * as React from "react";
import { BlockLink } from "../block-link";
import { createFormatter } from "../../format/core";
import { PostCard } from "./post-card";
import { BrandIcon, BRAND_NAMES, type BrandName } from "./shared/brand-icons";
import { cn2 as cn, useBlockIds2 } from "./shared/kit-2";
import { newsText } from "./shared/labels-news";
import { ModuleHeading, NewsDate, type NewsCommonProps, type NewsPost } from "./shared/news";

/* ------------------------------------------------------------------ */
/* Layout                                                               */
/* ------------------------------------------------------------------ */

export interface NewsColumnsProps {
  /** Main column (modules). */
  children: React.ReactNode;
  /** Sidebar widgets that scroll with the page. */
  aside?: React.ReactNode;
  /**
   * Sidebar widgets that stick below the header once the rest of the sidebar has scrolled by
   * (an ad, most read) — wide containers only. A whole sidebar taller than the screen can't
   * stick usefully, so only this tail does.
   */
  asideSticky?: React.ReactNode;
  /** Accessible name of the sidebar ("More from the Ledger"). */
  asideLabel?: string;
  /** Sidebar on the start side. */
  asideStart?: boolean;
  className?: string;
}

/**
 * The news page grid: a main column and a 20rem sidebar that stacks below the main column on
 * narrow containers; its `asideSticky` tail sticks on wide ones. Container-query driven.
 * Server component.
 */
export function NewsColumns({ children, aside, asideSticky, asideLabel, asideStart, className }: NewsColumnsProps) {
  return (
    <div className={cn("vb-news-columns @container", className)}>
      <div className={cn("grid gap-x-10 gap-y-14 @5xl:grid-cols-[minmax(0,1fr)_20rem]", asideStart && "@5xl:grid-cols-[20rem_minmax(0,1fr)]")}>
        <div className={cn("flex min-w-0 flex-col gap-14", asideStart && "@5xl:order-2")}>{children}</div>
        {aside || asideSticky ? (
          <aside aria-label={asideLabel} className={cn("vb-news-aside flex min-w-0 flex-col gap-10", asideStart && "@5xl:order-1")}>
            {aside}
            {asideSticky ? (
              <div className="vb-news-aside-sticky flex flex-col gap-10" data-sticky="">
                {asideSticky}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Widget frame                                                         */
/* ------------------------------------------------------------------ */

export interface SidebarWidgetProps extends NewsCommonProps {
  title: React.ReactNode;
  /** Title level. Default 2 (widgets are siblings of the main column's modules). */
  headingLevel?: 2 | 3 | 4;
  href?: string;
  children: React.ReactNode;
  id?: string;
}

/** A titled sidebar box (small rule heading + content). Server component. */
export function SidebarWidget({ title, headingLevel = 2, href, children, id, locale, labels, components, className }: SidebarWidgetProps) {
  const { headingId } = useBlockIds2(id, "widget");
  return (
    <section aria-labelledby={headingId} className={cn("vb-news-widget @container flex flex-col gap-4", className)}>
      <ModuleHeading title={title} id={headingId} level={headingLevel} href={href} size="sm" locale={locale} labels={labels} components={components} />
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Widgets                                                              */
/* ------------------------------------------------------------------ */

export interface FollowAccount {
  network: BrandName;
  href: string;
  count: number;
  /** "Fans", "Subscribers". Default "{count} followers". */
  unit?: string;
  /** Button text. Default "Follow". */
  action?: string;
}

export interface FollowCountsProps extends Omit<SidebarWidgetProps, "children" | "title"> {
  title?: React.ReactNode;
  accounts: FollowAccount[];
}

/**
 * "Stay connected": follower counts per network, each row one link ("Follow us on YouTube,
 * 22.9K subscribers"). Counts are compact and locale-formatted. Server component.
 */
export function FollowCounts({ title, accounts, locale = "en-US", labels, components, ...rest }: FollowCountsProps) {
  const t = newsText(labels, locale);
  const f = createFormatter(locale);
  return (
    <SidebarWidget title={title ?? t("follow")} locale={locale} labels={labels} components={components} {...rest}>
      <ul className="flex flex-col divide-y divide-line border-b border-line">
        {accounts.map((a) => {
          const count = f.compact(a.count);
          const brand = BRAND_NAMES[a.network];
          return (
            <li key={a.network + a.href}>
              <BlockLink href={a.href} newTab components={components} locale={locale} className="group/follow flex items-center gap-3 py-2.5 rounded-[2px] focus-ring">
                <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-ui-sm bg-fg text-scene transition-colors group-hover/follow:bg-accent group-hover/follow:text-accent-fg">
                  <BrandIcon name={a.network} className="size-[18px]" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="font-semibold tabular text-fg">{a.unit ? `${count} ${a.unit}` : t("followers", { count })}</span>
                  <span className="text-[0.8125rem] text-fg-muted">{brand}</span>
                </span>
                <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-muted group-hover/follow:text-fg">{a.action ?? t("follow")}</span>
              </BlockLink>
            </li>
          );
        })}
      </ul>
    </SidebarWidget>
  );
}

export interface PopularPostsProps extends Omit<SidebarWidgetProps, "children"> {
  posts: NewsPost[];
  /** numbered: big rank numbers, text only. thumbs: thumbnail rows. Default `"numbered"`. */
  variant?: "numbered" | "thumbs";
  /** Max items. Default 5. */
  limit?: number;
}

/** "Most read" / "Editor’s picks": numbered text list or thumbnail rows. Server component. */
export function PopularPosts({ posts, variant = "numbered", limit = 5, headingLevel = 2, locale = "en-US", labels, components, ...rest }: PopularPostsProps) {
  const common = { locale, labels, components };
  const level = Math.min(4, headingLevel + 1) as 3 | 4;
  return (
    <SidebarWidget headingLevel={headingLevel} {...common} {...rest}>
      <ol className={cn("flex flex-col", variant === "numbered" ? "divide-y divide-line" : "gap-4")}>
        {posts.slice(0, limit).map((p, i) => (
          <li key={(p.id ?? p.href) + i} className={variant === "numbered" ? "py-3 first:pt-0" : undefined}>
            {variant === "numbered" ? (
              <div className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline">
                <span aria-hidden className="font-display text-[1.75rem] leading-none text-accent-ink tabular">{i + 1}</span>
                <PostCard post={p} variant="text" size="sm" category={false} meta={{ author: false, comments: false, readingTime: false }} headingLevel={level} {...common} />
              </div>
            ) : (
              <PostCard post={p} variant="row" headingLevel={level} {...common} />
            )}
          </li>
        ))}
      </ol>
    </SidebarWidget>
  );
}

export interface RecentComment {
  author: string;
  postTitle: string;
  postHref: string;
  /** Anchor of the comment: `"/story#comment-31"`. Default `postHref`. */
  href?: string;
  /** A short quote of the comment. */
  excerpt?: string;
  at?: string;
}

export interface RecentCommentsProps extends Omit<SidebarWidgetProps, "children"> {
  comments: RecentComment[];
}

/** "Recent comments": who commented on which story, with an optional one-line quote. Server component. */
export function RecentComments({ comments, locale = "en-US", labels, components, ...rest }: RecentCommentsProps) {
  return (
    <SidebarWidget locale={locale} labels={labels} components={components} {...rest}>
      <ul className="flex flex-col gap-3.5">
        {comments.map((c, i) => (
          <li key={i} className="flex flex-col gap-1 border-s-2 border-line ps-3 text-[0.875rem] leading-snug">
            <p className="text-fg-muted">
              <span className="font-semibold text-fg">{c.author}</span>
              <span aria-hidden> — </span>
              <span className="sr-only">: </span>
              <BlockLink href={c.href ?? c.postHref} components={components} locale={locale} className="rounded-[2px] italic text-fg underline decoration-line underline-offset-[0.2em] hover:decoration-current focus-ring">
                {c.postTitle}
              </BlockLink>
            </p>
            {c.excerpt ? <p className="line-clamp-2 text-fg-muted">“{c.excerpt}”</p> : null}
            {c.at ? <NewsDate value={c.at} locale={locale} className="text-[0.75rem] text-fg-subtle" /> : null}
          </li>
        ))}
      </ul>
    </SidebarWidget>
  );
}

export interface CategoryCount {
  label: string;
  href: string;
  count: number;
}

export interface CategoryCountsProps extends Omit<SidebarWidgetProps, "children"> {
  categories: CategoryCount[];
}

/** "Popular sections": section links with story counts. Server component. */
export function CategoryCounts({ categories, locale = "en-US", labels, components, ...rest }: CategoryCountsProps) {
  const t = newsText(labels, locale);
  const f = createFormatter(locale);
  return (
    <SidebarWidget locale={locale} labels={labels} components={components} {...rest}>
      <ul className="flex flex-col divide-y divide-line border-b border-line">
        {categories.map((c) => (
          <li key={c.href}>
            <BlockLink href={c.href} components={components} locale={locale} className="group/cat flex items-baseline justify-between gap-3 py-2 rounded-[2px] focus-ring">
              <span className="text-[0.9375rem] font-medium text-fg group-hover/cat:underline">{c.label}</span>
              <span className="font-mono text-[0.75rem] tabular text-fg-muted">
                <span aria-hidden>{f.number(c.count)}</span>
                <span className="sr-only">{t("postsInCategory", { count: c.count })}</span>
              </span>
            </BlockLink>
          </li>
        ))}
      </ul>
    </SidebarWidget>
  );
}
