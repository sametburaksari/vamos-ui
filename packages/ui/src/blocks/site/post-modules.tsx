import * as React from "react";
import { PostCard } from "./post-card";
import { NewsPagination } from "./news-pagination";
import { PostSlider } from "./shared/post-slider";
import { cn2 as cn, useBlockIds2 } from "./shared/kit-2";
import { newsText } from "./shared/labels-news";
import { ModuleHeading, type NewsCommonProps, type NewsPost } from "./shared/news";

/* ------------------------------------------------------------------ */
/* FeaturedPosts                                                        */
/* ------------------------------------------------------------------ */

export type FeaturedPostsLayout = "mosaic" | "quad";

export interface FeaturedPostsProps extends NewsCommonProps {
  /** The first four stories fill one page. More than four with `slider` → pages of four. */
  posts: NewsPost[];
  /**
   * mosaic: the lead on the start half; a wide story and two squares on the other.
   * quad: a wide lead with three stories stacked beside it.
   */
  layout?: FeaturedPostsLayout;
  /** Page through groups of four with arrows. Default false (extra posts are ignored). */
  slider?: boolean;
  /** Accessible name of the region ("Top stories"). Also names the slider. */
  label?: string;
  /** Heading level of the card titles. Default 2 (the grid usually sits right under the h1 masthead). */
  headingLevel?: 2 | 3;
  /** The lead image loads eagerly (it is the LCP). Default true. */
  priority?: boolean;
  id?: string;
}

const cell = {
  mosaic: ["@3xl:col-span-2 @3xl:row-span-2", "@3xl:col-span-2", "", ""],
  quad: ["@3xl:col-span-3 @3xl:row-span-3", "@3xl:col-start-4", "@3xl:col-start-4", "@3xl:col-start-4"],
};
/** Phone shapes (no fixed grid height): the lead 4:3, a wide story, then two squares side by side. */
const phone = ["col-span-2 aspect-[4/3]", "col-span-2 aspect-[16/9]", "aspect-[4/5]", "aspect-[4/5]"];

/**
 * The lead grid under the masthead: one large story and three smaller ones, all photo cards with
 * section, title and byline. Optional slider arrows page through more groups. Server component
 * (the slider is a small island).
 *
 * ```tsx
 * <FeaturedPosts posts={lead} layout="mosaic" label="Top stories" />
 * ```
 */
export function FeaturedPosts({ posts, layout = "mosaic", slider = false, label, headingLevel = 2, priority = true, id, locale = "en-US", labels, components, className }: FeaturedPostsProps) {
  const t = newsText(labels, locale);
  const groups: NewsPost[][] = [];
  for (let i = 0; i < (slider ? posts.length : Math.min(4, posts.length)); i += 4) groups.push(posts.slice(i, i + 4));
  const page = (group: NewsPost[], g: number) => (
    <div
      className={cn(
        "grid grid-cols-2 gap-1 @3xl:h-[clamp(26rem,46cqi,36rem)] @3xl:grid-cols-4",
        layout === "mosaic" ? "@3xl:grid-rows-2" : "@3xl:grid-rows-3",
      )}
    >
      {group.map((post, i) => (
        <div key={post.id ?? post.href} className={cn("relative min-h-0 @3xl:aspect-auto", phone[i], cell[layout][i])}>
          <PostCard
            post={post}
            variant="overlay"
            size={i === 0 ? "xl" : i === 1 && layout === "mosaic" ? "lg" : "md"}
            fill
            meta={i === 0 ? undefined : false}
            headingLevel={headingLevel}
            priority={priority && g === 0 && i === 0}
            sizes={i === 0 ? "(min-width: 48rem) 50vw, 100vw" : i === 1 ? "(min-width: 48rem) 50vw, 100vw" : "(min-width: 48rem) 25vw, 50vw"}
            locale={locale}
            labels={labels}
            components={components}
            className="absolute inset-0"
          />
        </div>
      ))}
    </div>
  );
  return (
    <section id={id} aria-label={label} className={cn("vb-news-featured @container", className)}>
      {groups.length > 1 ? (
        <PostSlider label={label ?? ""} locale={locale} labels={{ previous: t("previousPage"), next: t("nextPage"), slideOf: t("slideOf") }}>
          {groups.map(page)}
        </PostSlider>
      ) : groups[0] ? (
        page(groups[0], 0)
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PostBlock                                                            */
/* ------------------------------------------------------------------ */

export type PostBlockLayout = "lead-list" | "lead-grid" | "big-2" | "featured-list" | "trio" | "list" | "grid";

export interface PostBlockProps extends NewsCommonProps {
  /** Section title ("Don’t miss", "Science"). Omit inside `PostTabs` (the tabs carry it). */
  title?: React.ReactNode;
  /** "View all" target beside the title. */
  href?: string;
  hrefLabel?: React.ReactNode;
  /** Section heading level. Card titles go one level deeper. Default 2. */
  headingLevel?: 2 | 3;
  /**
   * lead-list: a lead with excerpt beside four thumbnail rows.
   * lead-grid: two leads with excerpts over four thumbnail rows in two columns.
   * big-2: a large lead and two stories stacked beside it.
   * featured-list: a photo lead over a text list of three.
   * trio: three photo cards in a row.
   * list: wide thumbnail rows with byline and excerpt (latest, archives).
   * grid: photo cards with byline (and `excerpts`) in `columns`.
   */
  layout?: PostBlockLayout;
  posts: NewsPost[];
  /** Extra pages of posts behind small arrows (the module pager). */
  pages?: NewsPost[][];
  /** grid: 2 or 3 columns on wide containers. Default 2. */
  columns?: 2 | 3;
  /** grid / list / trio: show excerpts. Default true for list, false otherwise. */
  excerpts?: boolean;
  /** Numbered pagination under the module ("Page 1 of 17"). */
  pagination?: { page: number; total: number; hrefTemplate?: string };
  /** Anything after the posts (an ad, a "load more"). */
  footer?: React.ReactNode;
  /** Heading style: `lg` in the main column, `sm` (small caps) in a sidebar. Default `"lg"`. */
  headingSize?: "lg" | "sm";
  id?: string;
}

/**
 * A category module of a news home page: section heading, then the posts in one of seven
 * layouts, with optional pager arrows or numbered pagination. Lays out by its own width
 * (container queries), so the same module works in a wide main column or a narrow one.
 * Server component.
 *
 * ```tsx
 * <PostBlock title="Science" href="/science" layout="lead-list" posts={science} />
 * <PostBlock title="Latest" layout="list" posts={latest} pagination={{ page: 1, total: 17, hrefTemplate: "/latest?page={page}" }} />
 * ```
 */
export function PostBlock({
  title,
  href,
  hrefLabel,
  headingLevel = 2,
  layout = "lead-list",
  posts,
  pages,
  columns = 2,
  excerpts,
  pagination,
  footer,
  headingSize = "lg",
  id,
  locale = "en-US",
  labels,
  components,
  className,
}: PostBlockProps) {
  const t = newsText(labels, locale);
  const { headingId } = useBlockIds2(id, "news");
  const common = { locale, labels, components };
  const level = (title ? headingLevel + 1 : headingLevel) as 2 | 3 | 4;
  const body = (list: NewsPost[]) => <PostLayout layout={layout} posts={list} columns={columns} excerpts={excerpts} level={level} common={common} empty={t("emptyModule")} />;
  const all = pages?.length ? [posts, ...pages] : null;
  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className={cn("vb-news-module @container flex flex-col gap-5", className)} data-layout={layout}>
      {title ? <ModuleHeading title={title} id={headingId} level={headingLevel} href={href} hrefLabel={hrefLabel} size={headingSize} {...common} /> : null}
      {all ? (
        <PostSlider label={typeof title === "string" ? title : t("more")} locale={locale} labels={{ previous: t("previousPage"), next: t("nextPage"), slideOf: t("slideOf") }}>
          {all.map((list, i) => (
            <React.Fragment key={i}>{body(list)}</React.Fragment>
          ))}
        </PostSlider>
      ) : (
        body(posts)
      )}
      {pagination ? <NewsPagination page={pagination.page} total={pagination.total} hrefTemplate={pagination.hrefTemplate} locale={locale} labels={labels} /> : null}
      {footer}
    </section>
  );
}

interface LayoutProps {
  layout: PostBlockLayout;
  posts: NewsPost[];
  columns: 2 | 3;
  excerpts?: boolean;
  level: 2 | 3 | 4;
  common: NewsCommonProps;
  empty: string;
}

const key = (p: NewsPost, i: number) => (p.id ?? p.href) + i;

/** The post arrangement of a PostBlock — exported for tabbed panels (`PostTabs`). Server component. */
export function PostLayout({ layout, posts, columns, excerpts, level, common, empty }: LayoutProps) {
  if (!posts.length) return <p className="border-t border-line py-6 text-fg-muted">{empty}</p>;
  const [lead, ...rest] = posts;
  const rows = (list: NewsPost[], cls?: string) => (
    <ul className={cn("flex flex-col gap-5", cls)}>
      {list.map((p, i) => (
        <li key={key(p, i)}>
          <PostCard post={p} variant="row" headingLevel={level} {...common} />
        </li>
      ))}
    </ul>
  );

  switch (layout) {
    case "lead-list":
      return (
        <div className="grid gap-x-8 gap-y-6 @2xl:grid-cols-2">
          <PostCard post={lead!} variant="stack" excerpt headingLevel={level} {...common} />
          {rows(rest.slice(0, 4))}
        </div>
      );
    case "lead-grid":
      return (
        <div className="flex flex-col gap-7">
          <ul className="grid gap-x-8 gap-y-7 @2xl:grid-cols-2">
            {posts.slice(0, 2).map((p, i) => (
              <li key={key(p, i)}>
                <PostCard post={p} variant="stack" excerpt headingLevel={level} {...common} />
              </li>
            ))}
          </ul>
          <ul className="grid gap-x-8 gap-y-5 border-t border-line pt-6 @2xl:grid-cols-2">
            {posts.slice(2, 6).map((p, i) => (
              <li key={key(p, i)}>
                <PostCard post={p} variant="row" headingLevel={level} {...common} />
              </li>
            ))}
          </ul>
        </div>
      );
    case "big-2":
      return (
        <div className="grid gap-x-8 gap-y-7 @3xl:grid-cols-3">
          <PostCard post={lead!} variant="stack" size="xl" excerpt headingLevel={level} className="@3xl:col-span-2" {...common} />
          <ul className="grid gap-7 @2xl:max-@3xl:grid-cols-2">
            {rest.slice(0, 2).map((p, i) => (
              <li key={key(p, i)}>
                <PostCard post={p} variant="stack" size="md" headingLevel={level} {...common} />
              </li>
            ))}
          </ul>
        </div>
      );
    case "featured-list":
      return (
        <div className="flex flex-col gap-5">
          <div className="relative aspect-[16/10]">
            <PostCard post={lead!} variant="overlay" size="md" fill meta={false} headingLevel={level} className="absolute inset-0" {...common} />
          </div>
          <ul className="flex flex-col divide-y divide-line">
            {rest.slice(0, 3).map((p, i) => (
              <li key={key(p, i)} className="py-3.5 first:pt-0">
                <PostCard post={p} variant="text" size="sm" meta={{ author: false, comments: false }} headingLevel={level} {...common} />
              </li>
            ))}
          </ul>
        </div>
      );
    case "trio":
      return (
        <ul className="grid gap-x-6 gap-y-7 @xl:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <li key={key(p, i)}>
              <PostCard post={p} variant="stack" size="md" excerpt={excerpts} meta={{ author: false, comments: false }} headingLevel={level} {...common} />
            </li>
          ))}
        </ul>
      );
    case "list":
      return (
        <ul className="flex flex-col divide-y divide-line">
          {posts.map((p, i) => (
            <li key={key(p, i)} className="py-5 first:pt-0 last:pb-0">
              <PostCard post={p} variant="list" size="lg" excerpt={excerpts ?? true} headingLevel={level} {...common} />
            </li>
          ))}
        </ul>
      );
    case "grid":
      return (
        <ul className={cn("grid gap-x-6 gap-y-9 @xl:grid-cols-2", columns === 3 && "@4xl:grid-cols-3")}>
          {posts.map((p, i) => (
            <li key={key(p, i)}>
              <PostCard post={p} variant="stack" size={columns === 2 ? "lg" : "md"} excerpt={excerpts} headingLevel={level} {...common} />
            </li>
          ))}
        </ul>
      );
  }
}
