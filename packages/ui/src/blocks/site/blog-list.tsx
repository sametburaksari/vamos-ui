import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn2 as cn } from "./shared/kit-2";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import { site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { fieldAttr, formatDate2, isoDay, useBlockIds2, type SiteImage2, type SiteLink2 } from "./shared/kit-2";
import { columnSizes } from "./shared/image-sizes";

export type BlogListVariant = "editorial" | "list" | "grid" | "compact";

/** The contract every CMS maps into. Plain data. */
export interface PostSummary {
  href: string;
  title: string;
  excerpt?: string;
  /** 3:2 cover. `sizes`: featured `(min-width: 56rem) min(59vw, 45rem), 100vw`; grid `min(34vw, 26rem)` / `min(50vw, 38rem)` / 100vw. */
  cover?: SiteImage2;
  category?: { label: string; href?: string };
  /** ISO datetime or `YYYY-MM-DD`. */
  publishedAt: string;
  readingMinutes?: number;
  author?: { name: string; avatar?: SiteImage2 };
}

export interface BlogPagination {
  page: number;
  total: number;
  /** Builds a page URL (server usage). */
  href?: (page: number) => string;
  /** JSON-friendly alternative: `"/blog?page={page}"`. Page 1 drops the query when it ends in `?page={page}`. */
  hrefTemplate?: string;
}

export interface BlogListProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * editorial: the first post large beside its cover, the rest as a two-column title list.
   * list: date · title + excerpt · reading time rows. grid: three columns of 3:2 covers.
   * compact: titles and dates only — sidebars, footers, "related posts".
   */
  variant?: BlogListVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** "All posts" link beside the header. */
  allLink?: SiteLink2;
  posts: PostSummary[];
  /** Category filter (links; mark one `active`). */
  categories?: { label: string; href: string; active?: boolean }[];
  pagination?: BlogPagination;
  /** Default true (compact never shows covers). */
  showCovers?: boolean;
  /** Empty state copy and an optional action (newsletter CTA). */
  empty?: { title?: React.ReactNode; text?: React.ReactNode; action?: React.ReactNode };
  /** Post title level. Default: 3 under a section title, else 2. */
  postHeadingLevel?: 2 | 3 | 4;
  labels?: Site2BlockLabels;
}

/**
 * Latest posts and category archives. Receives posts as data (`PostSummary`); fetching is the
 * app's job (or the renderer's `resolvers.posts`). Each post is an `article` with one link on the
 * title that covers the card. Server component.
 *
 * ```tsx
 * <BlogList variant="editorial" title="From the *studio*" posts={posts} pagination={{ page: 1, total: 4, hrefTemplate: "/blog?page={page}" }} />
 * ```
 */
export function BlogList({
  variant = "editorial",
  eyebrow,
  title,
  lead,
  allLink,
  posts,
  categories,
  pagination,
  showCovers = true,
  empty,
  postHeadingLevel,
  id,
  anchor,
  theme,
  headingLevel = 2,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: BlogListProps) {
  const t = site2Text(labels, locale);
  const { headingId } = useBlockIds2(id, "blog");
  const level = postHeadingLevel ?? (title ? 3 : 2);
  const ctx: PostCtx = { t, locale, components, labels, editMode, level, covers: showCovers && variant !== "compact" };
  const actions = allLink ? (
    <BlockLink href={allLink.href} appearance="link" components={components} labels={labels} locale={locale}>
      {allLink.label}
      <ArrowRight aria-hidden strokeWidth={1.5} className="size-[1em] rtl:-scale-x-100" />
    </BlockLink>
  ) : undefined;
  const compact = variant === "compact";

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="blog-list" editMode={editMode} className={cn("vb-blog", className)} data-variant={variant}>
      <Container className={cn("flex flex-col", compact ? "gap-6" : "gap-10 @4xl:gap-14")}>
        {title || eyebrow || lead || actions ? (
          compact ? (
            <div className="flex items-baseline justify-between gap-4">
              {title ? (
                <h2 id={headingId} className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted" {...fieldAttr(editMode, "title")}>
                  {title}
                </h2>
              ) : null}
              {actions}
            </div>
          ) : (
            <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} align={actions ? "split" : "start"} actions={actions} editMode={editMode} labels={labels} locale={locale} />
          )
        ) : null}

        {categories?.length ? (
          <nav aria-label={t("categories")} className="-mx-1 overflow-x-auto scrollbar-none">
            <ul className="flex gap-1 px-1">
              {categories.map((c, i) => (
                <li key={i}>
                  <BlockLink
                    href={c.href}
                    aria-current={c.active ? "page" : undefined}
                    components={components}
                    labels={labels}
                    locale={locale}
                    className={cn("inline-flex h-9 items-center whitespace-nowrap rounded-full px-3.5 text-sm transition-colors focus-ring", c.active ? "bg-fg text-scene" : "text-fg-muted hover:bg-hover hover:text-fg")}
                  >
                    {c.label}
                  </BlockLink>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {posts.length === 0 ? (
          <div className="flex flex-col items-start gap-3 border-t border-line pt-8">
            <p className="text-h3 font-semibold tracking-[-0.012em] text-fg">{empty?.title ?? t("noPosts")}</p>
            <p className="max-w-(--measure) text-fg-muted">{empty?.text ?? t("noPostsHint")}</p>
            {empty?.action ? <div className="pt-3">{empty.action}</div> : null}
          </div>
        ) : variant === "editorial" ? (
          <Editorial posts={posts} ctx={ctx} />
        ) : variant === "list" ? (
          <ul className="flex flex-col border-b border-line">
            {posts.map((p, i) => (
              <li key={p.href + i} className="border-t border-line">
                <ListPost post={p} ctx={ctx} />
              </li>
            ))}
          </ul>
        ) : variant === "grid" ? (
          <ul className="grid gap-x-(--gutter) gap-y-12 @2xl:grid-cols-2 @4xl:grid-cols-3">
            {posts.map((p, i) => (
              <li key={p.href + i}>
                <GridPost post={p} ctx={ctx} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col">
            {posts.slice(0, 5).map((p, i) => (
              <li key={p.href + i} className="border-t border-line first:border-t-0">
                <CompactPost post={p} ctx={ctx} />
              </li>
            ))}
          </ul>
        )}

        {pagination && pagination.total > 1 ? <Pager pagination={pagination} ctx={ctx} /> : null}
      </Container>
    </Section>
  );
}

interface PostCtx {
  t: Site2Text;
  locale: string;
  components?: BlockBaseProps["components"];
  labels?: Site2BlockLabels;
  editMode?: boolean;
  level: 2 | 3 | 4;
  covers: boolean;
}

function PostTitle({ post, ctx, className }: { post: PostSummary; ctx: PostCtx; className?: string }) {
  const H = `h${ctx.level}` as "h3";
  return (
    <H className={cn("text-fg text-balance", className)}>
      <BlockLink href={post.href} components={ctx.components} labels={ctx.labels} locale={ctx.locale} className="vb-post-link rounded-[2px] focus-ring after:absolute after:inset-0 after:content-['']">
        {post.title}
      </BlockLink>
    </H>
  );
}

function PostDate({ post, ctx, className }: { post: PostSummary; ctx: PostCtx; className?: string }) {
  return (
    <time dateTime={isoDay(post.publishedAt)} className={cn("font-mono text-eyebrow tabular uppercase tracking-[0.06em] text-fg-muted", className)}>
      {formatDate2(isoDay(post.publishedAt), ctx.locale, "medium")}
    </time>
  );
}

function Meta({ post, ctx }: { post: PostSummary; ctx: PostCtx }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-eyebrow uppercase tracking-[0.06em] text-fg-muted">
      <PostDate post={post} ctx={ctx} />
      {post.readingMinutes ? (
        <>
          <span aria-hidden>·</span>
          <span>{ctx.t("minRead", { count: post.readingMinutes })}</span>
        </>
      ) : null}
      {post.author ? (
        <>
          <span aria-hidden>·</span>
          <span>{ctx.t("by", { name: post.author.name })}</span>
        </>
      ) : null}
    </p>
  );
}

function Category({ post }: { post: PostSummary }) {
  if (!post.category) return null;
  // Text only (the card link covers the article; a nested link would steal its click area).
  return <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-accent-ink">{post.category.label}</p>;
}

function Cover({ post, ctx, sizes, priority, className }: { post: PostSummary; ctx: PostCtx; sizes: string; priority?: boolean; className?: string }) {
  if (!ctx.covers || !post.cover?.src) return null;
  return <BlockImage {...post.cover} alt={post.cover.alt ?? ""} decorative={!post.cover.alt} aspect="3:2" sizes={sizes} priority={priority} className={cn("vb-post-cover rounded-ui", className)} components={ctx.components} />;
}

function Editorial({ posts, ctx }: { posts: PostSummary[]; ctx: PostCtx }) {
  const [first, ...rest] = posts;
  return (
    <div className="flex flex-col gap-12">
      <article className="vb-post group/post relative grid gap-x-(--gutter) gap-y-6 @4xl:grid-cols-12 @4xl:items-end">
        {ctx.covers && first!.cover ? (
          <div className="@4xl:col-span-7">
            <Cover post={first!} ctx={ctx} sizes={columnSizes(7 / 12)} />
          </div>
        ) : null}
        <div className={cn("flex flex-col gap-4", ctx.covers && first!.cover ? "@4xl:col-span-5" : "@4xl:col-span-9")}>
          <Category post={first!} />
          <PostTitle post={first!} ctx={ctx} className="font-display text-display-m" />
          {first!.excerpt ? <p className="max-w-[52ch] text-fg-muted text-pretty">{first!.excerpt}</p> : null}
          <Meta post={first!} ctx={ctx} />
        </div>
      </article>
      {rest.length ? (
        <ul className="grid gap-x-(--gutter) @2xl:grid-cols-2">
          {rest.map((p, i) => (
            <li key={p.href + i} className="border-t border-line">
              <article className="vb-post group/post relative flex flex-col gap-2 py-6">
                <PostDate post={p} ctx={ctx} />
                <PostTitle post={p} ctx={ctx} className="text-h3 font-semibold tracking-[-0.012em]" />
                {p.category ? <p className="text-small text-fg-muted">{p.category.label}</p> : null}
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ListPost({ post, ctx }: { post: PostSummary; ctx: PostCtx }) {
  return (
    <article className="vb-post group/post relative grid gap-x-(--gutter) gap-y-2 py-6 @2xl:grid-cols-12 @2xl:items-baseline">
      <PostDate post={post} ctx={ctx} className="@2xl:col-span-2" />
      <div className="flex flex-col gap-1.5 @2xl:col-span-8">
        <PostTitle post={post} ctx={ctx} className="text-h3 font-semibold tracking-[-0.012em]" />
        {post.excerpt ? <p className="line-clamp-1 text-small text-fg-muted">{post.excerpt}</p> : null}
      </div>
      <p className="text-small text-fg-muted @2xl:col-span-2 @2xl:text-end">{post.readingMinutes ? ctx.t("minRead", { count: post.readingMinutes }) : null}</p>
    </article>
  );
}

function GridPost({ post, ctx }: { post: PostSummary; ctx: PostCtx }) {
  return (
    <article className="vb-post group/post relative flex flex-col gap-4">
      {ctx.covers ? post.cover ? <Cover post={post} ctx={ctx} sizes={`(min-width: 56rem) min(34vw, 26rem), ${columnSizes(1 / 2, { from: "42rem" })}`} /> : <span aria-hidden className="block aspect-[3/2] rounded-ui bg-surface-2" /> : null}
      <div className="flex flex-col gap-2.5">
        <Category post={post} />
        <PostTitle post={post} ctx={ctx} className="text-h3 font-semibold tracking-[-0.012em]" />
        <Meta post={post} ctx={ctx} />
      </div>
    </article>
  );
}

function CompactPost({ post, ctx }: { post: PostSummary; ctx: PostCtx }) {
  return (
    <article className="vb-post group/post relative flex flex-col gap-1 py-4">
      <PostTitle post={post} ctx={ctx} className="text-body font-medium" />
      <PostDate post={post} ctx={ctx} />
    </article>
  );
}

function pageHref(p: BlogPagination, page: number): string {
  if (p.href) return p.href(page);
  const tpl = p.hrefTemplate ?? "?page={page}";
  if (page === 1 && /[?&]page=\{page\}$/.test(tpl)) return tpl.replace(/[?&]page=\{page\}$/, "") || "?";
  return tpl.replace("{page}", String(page));
}

function Pager({ pagination, ctx }: { pagination: BlogPagination; ctx: PostCtx }) {
  const { page, total } = pagination;
  const linkClass = "inline-flex h-11 items-center gap-2 rounded-ui px-1 text-sm font-medium text-fg underline decoration-line underline-offset-[0.3em] hover:decoration-current focus-ring";
  return (
    <nav aria-label={ctx.t("pagination")} className="flex items-center justify-between gap-4 border-t border-line pt-6">
      {page > 1 ? (
        <BlockLink href={pageHref(pagination, page - 1)} rel="prev" components={ctx.components} labels={ctx.labels} locale={ctx.locale} className={linkClass}>
          <ArrowLeft aria-hidden strokeWidth={1.5} className="size-4 rtl:-scale-x-100" />
          {ctx.t("previousPage")}
        </BlockLink>
      ) : (
        <span />
      )}
      <p className="font-mono text-eyebrow tabular uppercase tracking-[0.08em] text-fg-muted" aria-current="page">
        {ctx.t("pageOf", { page, total })}
      </p>
      {page < total ? (
        <BlockLink href={pageHref(pagination, page + 1)} rel="next" components={ctx.components} labels={ctx.labels} locale={ctx.locale} className={linkClass}>
          {ctx.t("nextPage")}
          <ArrowRight aria-hidden strokeWidth={1.5} className="size-4 rtl:-scale-x-100" />
        </BlockLink>
      ) : (
        <span />
      )}
    </nav>
  );
}

/** Streaming fallback for `<Suspense fallback={<BlogListSkeleton />}>`. */
export function BlogListSkeleton({ variant = "grid", count = 3, className }: { variant?: BlogListVariant; count?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("vb-container py-(--section-y)", className)} data-skeleton="">
      <div className="mb-10 h-10 w-2/5 rounded-ui-sm bg-skeleton" />
      <div className={cn("grid gap-x-(--gutter) gap-y-10", variant === "grid" ? "@2xl:grid-cols-2 @4xl:grid-cols-3" : "")}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex flex-col gap-3">
            {variant === "grid" ? <div className="aspect-[3/2] rounded-ui bg-skeleton" /> : null}
            <div className="h-3 w-24 rounded-ui-sm bg-skeleton" />
            <div className="h-5 w-4/5 rounded-ui-sm bg-skeleton" />
            {variant !== "compact" ? <div className="h-4 w-3/5 rounded-ui-sm bg-skeleton" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
