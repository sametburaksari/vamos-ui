// Shared parts of the news / magazine blocks: the post contract, card metadata, the module heading
// and JSON-LD helpers. Server-safe (no hooks beyond useId, no "use client"), so client islands can
// import the plain values too.

import * as React from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import { BlockLink } from "../../block-link";
import type { BlockAdapters } from "../../types";
import type { JsonLdNode } from "../../json-ld";
import { cn2 as cn, formatDate2, isoDay, type SiteImage2 } from "./kit-2";
import { newsText, type NewsBlockLabels, type NewsText } from "./labels-news";

/**
 * The contract every CMS maps into for news blocks. A superset of `PostSummary` (BlogList), so
 * the same feed works in both.
 */
export interface NewsPost {
  href: string;
  title: string;
  /** Standfirst / dek. Shown by layouts that make room for it. */
  excerpt?: string;
  /** Cover image. Cards crop it (3:2, 4:3 or 16:10) by `focal`. */
  cover?: SiteImage2;
  /** Section the story belongs to. `href` makes the badge a link (above the card link). */
  category?: { label: string; href?: string };
  /** ISO datetime or `YYYY-MM-DD`. */
  publishedAt: string;
  updatedAt?: string;
  author?: { name: string; href?: string; avatar?: SiteImage2 };
  commentCount?: number;
  readingMinutes?: number;
  /** Small marker on the card: video, gallery or a live blog. */
  format?: "video" | "gallery" | "live";
  /** Stable id for keys and JSON-LD. Default: `href`. */
  id?: string;
}

/** Which metadata a card shows. Every field defaults to on when the post has it. */
export interface PostMetaFields {
  author?: boolean;
  date?: boolean;
  comments?: boolean;
  readingTime?: boolean;
}

/** Common props of the news blocks. */
export interface NewsCommonProps {
  locale?: string;
  labels?: NewsBlockLabels;
  components?: BlockAdapters;
  className?: string;
}

/** Date in the card style: "12 Nov 2026" (medium) on the calendar day of the value. */
export function NewsDate({ value, locale = "en-US", className, preset = "medium" }: { value: string; locale?: string; className?: string; preset?: "short" | "medium" | "long" }) {
  return (
    <time dateTime={value.length > 10 ? value : isoDay(value)} className={className}>
      {formatDate2(isoDay(value), locale, preset)}
    </time>
  );
}

export interface PostMetaProps extends NewsCommonProps {
  post: NewsPost;
  show?: PostMetaFields;
  /** `onImage`: light text for overlay cards. */
  tone?: "default" | "onImage";
}

/**
 * Byline row: author · date · comments · reading time. The author is a link only when the card has
 * no covering link (pass `post.author.href` and render outside a card). Server component.
 */
export function PostMeta({ post, show, tone = "default", locale = "en-US", labels, className }: PostMetaProps) {
  const t = newsText(labels, locale);
  const on = (k: keyof PostMetaFields) => show?.[k] !== false;
  const parts: React.ReactNode[] = [];
  if (on("author") && post.author) parts.push(<span key="a" className={cn("font-semibold", tone === "onImage" ? "text-white" : "text-fg")}>{t("by", { name: post.author.name })}</span>);
  if (on("date")) parts.push(<NewsDate key="d" value={post.publishedAt} locale={locale} />);
  if (on("readingTime") && post.readingMinutes) parts.push(<span key="r">{t("minRead", { count: post.readingMinutes })}</span>);
  const comments = on("comments") && post.commentCount !== undefined;
  if (!parts.length && !comments) return null;
  return (
    <p className={cn("vb-news-meta flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8125rem] leading-snug", tone === "onImage" ? "text-white/85" : "text-fg-muted", className)}>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <span aria-hidden className="opacity-50">·</span> : null}
          {p}
        </React.Fragment>
      ))}
      {comments ? (
        <span className="ms-auto inline-flex items-center gap-1 tabular" title={t("comments", { count: post.commentCount })}>
          <MessageSquare aria-hidden strokeWidth={1.75} className="size-3.5" />
          <span aria-hidden>{t("commentsShort", { count: post.commentCount })}</span>
          <span className="sr-only">{t("comments", { count: post.commentCount })}</span>
        </span>
      ) : null}
    </p>
  );
}

export interface CategoryBadgeProps extends NewsCommonProps {
  category: NonNullable<NewsPost["category"]>;
  /** solid: a filled tag (on images and above titles). text: small caps in accent ink. */
  variant?: "solid" | "text";
}

/**
 * The story's section. A link when `category.href` is set; it sits above the card's covering link
 * (`relative z-[1]`) so both stay clickable. Server component.
 */
export function CategoryBadge({ category, variant = "text", locale, labels, components, className }: CategoryBadgeProps) {
  const cls = cn(
    "vb-news-badge relative z-[1] inline-flex w-fit items-center font-mono text-[0.6875rem] font-medium uppercase leading-none tracking-[0.08em]",
    variant === "solid" ? "rounded-[2px] bg-accent px-1.5 py-1 text-accent-fg" : "text-accent-ink",
    category.href && "rounded-[2px] hover:underline focus-ring",
    className,
  );
  return category.href ? (
    <BlockLink href={category.href} className={cls} components={components} locale={locale}>
      {category.label}
    </BlockLink>
  ) : (
    <span className={cls}>{category.label}</span>
  );
}

export interface ModuleHeadingProps extends NewsCommonProps {
  title: React.ReactNode;
  /** Heading level. Default 2. */
  level?: 2 | 3 | 4;
  id?: string;
  /** "View all" link at the end. */
  href?: string;
  hrefLabel?: React.ReactNode;
  /** Anything at the end instead of the link (tabs, pager). */
  actions?: React.ReactNode;
  /** lg: section heading in the main column. sm: sidebar widgets. */
  size?: "lg" | "sm";
}

/**
 * A newspaper section heading: a heavy rule above, the title in the display face, a quiet
 * "View all" (or tabs) at the end. Server component.
 */
export function ModuleHeading({ title, level = 2, id, href, hrefLabel, actions, size = "lg", locale, labels, components, className }: ModuleHeadingProps) {
  const t = newsText(labels, locale);
  const H = `h${level}` as "h2";
  return (
    <div className={cn("vb-news-heading flex min-w-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t-[3px] border-fg", size === "lg" ? "pt-2.5" : "pt-2", className)}>
      <H id={id} className={cn("text-fg", size === "lg" ? "font-display text-[1.5rem] leading-tight tracking-[-0.01em]" : "font-mono text-eyebrow font-semibold uppercase tracking-[0.1em]")}>
        {title}
      </H>
      {actions ?? (href ? (
        <BlockLink href={href} components={components} locale={locale} className="inline-flex items-center gap-1 rounded-[2px] text-[0.8125rem] font-medium text-fg-muted hover:text-fg focus-ring">
          {hrefLabel ?? t("viewAll")}
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-3.5 rtl:-scale-x-100" />
        </BlockLink>
      ) : null)}
    </div>
  );
}

/** `NewsText` bound to a block's props — small helper for islands and blocks. */
export const newsT = (p: { labels?: NewsBlockLabels; locale?: string }): NewsText => newsText(p.labels, p.locale);

/** IAB ad sizes for `AdSlot` (plain data; kept out of the client module). */
export const AD_SIZES = {
  leaderboard: [728, 90],
  billboard: [970, 250],
  "large-leaderboard": [970, 90],
  rectangle: [300, 250],
  "half-page": [300, 600],
  skyscraper: [160, 600],
  "mobile-banner": [320, 50],
  "large-mobile-banner": [320, 100],
} as const satisfies Record<string, readonly [number, number]>;

export type AdSize = keyof typeof AD_SIZES | { width: number; height: number };

/* ------------------------------------------------------------------ */
/* JSON-LD                                                              */
/* ------------------------------------------------------------------ */

const absolute = (href: string, origin?: string) => (origin && href.startsWith("/") ? origin.replace(/\/$/, "") + href : href);

export interface NewsJsonLdOptions {
  /** Site origin for absolute URLs ("https://example.com"). Relative hrefs stay relative without it. */
  origin?: string;
  publisher?: { name: string; logo?: string; url?: string };
}

/** `NewsArticle` for one story (article pages; cards use `newsItemListJsonLd`). */
export function newsArticleJsonLd(post: NewsPost, opts: NewsJsonLdOptions = {}): JsonLdNode {
  return {
    "@type": "NewsArticle",
    headline: post.title.slice(0, 110),
    url: absolute(post.href, opts.origin),
    mainEntityOfPage: absolute(post.href, opts.origin),
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.cover?.src ? { image: [absolute(post.cover.src, opts.origin)] } : {}),
    ...(post.category ? { articleSection: post.category.label } : {}),
    ...(post.author ? { author: [{ "@type": "Person", name: post.author.name, ...(post.author.href ? { url: absolute(post.author.href, opts.origin) } : {}) }] } : {}),
    ...(post.commentCount !== undefined ? { commentCount: post.commentCount } : {}),
    ...(opts.publisher
      ? { publisher: { "@type": "NewsMediaOrganization", name: opts.publisher.name, ...(opts.publisher.url ? { url: opts.publisher.url } : {}), ...(opts.publisher.logo ? { logo: { "@type": "ImageObject", url: absolute(opts.publisher.logo, opts.origin) } } : {}) } }
      : {}),
  };
}

/** `ItemList` of story URLs (a home page's lead stories, a category archive). */
export function newsItemListJsonLd(posts: NewsPost[], opts: NewsJsonLdOptions & { name?: string } = {}): JsonLdNode {
  return {
    "@type": "ItemList",
    ...(opts.name ? { name: opts.name } : {}),
    itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(p.href, opts.origin) })),
  };
}

export type { NewsText, NewsBlockLabels };
