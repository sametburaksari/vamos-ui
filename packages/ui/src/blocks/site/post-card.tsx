import * as React from "react";
import { Images, PlayCircle, Radio } from "lucide-react";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import { cn2 as cn } from "./shared/kit-2";
import { newsText } from "./shared/labels-news";
import { CategoryBadge, PostMeta, type NewsCommonProps, type NewsPost, type PostMetaFields } from "./shared/news";

export type PostCardVariant = "overlay" | "stack" | "row" | "list" | "text";
export type PostCardSize = "xl" | "lg" | "md" | "sm";

export interface PostCardProps extends NewsCommonProps {
  post: NewsPost;
  /**
   * overlay: title and byline over the photo (lead stories, featured grids).
   * stack: photo, then section, title, byline and an optional excerpt (module leads, grids).
   * row: a small thumbnail beside the title and date (module lists, sidebars).
   * list: a wide thumbnail beside title, byline and excerpt (archive rows, "latest" lists).
   * text: no image — section, title, byline (dense columns, most-read).
   */
  variant?: PostCardVariant;
  /** Title scale. Default: `lg` for overlay / stack, `sm` for row, `md` otherwise. */
  size?: PostCardSize;
  /** Show the excerpt (stack, list, text). Default false. */
  excerpt?: boolean;
  /** Metadata fields; each defaults to on when the post has it. `false` hides the whole row. */
  meta?: PostMetaFields | false;
  /** Show the section badge. Default true (row: false). */
  category?: boolean;
  /** Rank number before the title ("1"–"10"), for most-read lists. */
  rank?: number;
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** Crop. Default overlay 16:10 (xl 4:3), stack 3:2, row 1:1, list 3:2. */
  aspect?: "16:10" | "3:2" | "4:3" | "1:1" | "16:9";
  /** Above the fold: eager image with high fetch priority. */
  priority?: boolean;
  /** `sizes` for the cover. Default derived from the variant. */
  sizes?: string;
  /** overlay: fill the parent's height (grid cells) instead of keeping the aspect. */
  fill?: boolean;
}

const titleSize: Record<PostCardSize, string> = {
  xl: "font-display text-[clamp(1.625rem,1.1rem+1.6cqi,2.5rem)] leading-[1.08] tracking-[-0.015em]",
  lg: "font-display text-[clamp(1.25rem,1rem+0.9cqi,1.6rem)] leading-[1.15] tracking-[-0.01em]",
  md: "text-[1.0625rem] font-semibold leading-snug tracking-[-0.006em]",
  sm: "text-[0.9375rem] font-semibold leading-snug",
};

const ratio = { "16:10": 1.6, "3:2": 1.5, "4:3": 4 / 3, "1:1": 1, "16:9": 16 / 9 } as const;

function FormatMark({ format, label }: { format: NonNullable<NewsPost["format"]>; label: string }) {
  const Icon = format === "video" ? PlayCircle : format === "gallery" ? Images : Radio;
  return (
    <span className={cn("absolute end-2 top-2 z-[1] inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em]", format === "live" ? "bg-danger-solid text-white" : "bg-fg/80 text-scene")}>
      <Icon aria-hidden strokeWidth={2} className="size-3.5" />
      {label}
    </span>
  );
}

/**
 * One story in a news layout: an `article` whose title link covers the card (one tab stop), with
 * an optional section badge link above it. Five shapes from the lead photo to a text-only line.
 * Server component.
 *
 * ```tsx
 * <PostCard post={post} variant="overlay" size="xl" priority />
 * <PostCard post={post} variant="row" />
 * ```
 */
export function PostCard({
  post,
  variant = "stack",
  size,
  excerpt = false,
  meta,
  category,
  rank,
  headingLevel = 3,
  aspect,
  priority,
  sizes,
  fill,
  locale = "en-US",
  labels,
  components,
  className,
}: PostCardProps) {
  const t = newsText(labels, locale);
  const H = `h${headingLevel}` as "h3";
  const s = size ?? (variant === "overlay" || variant === "stack" ? "lg" : variant === "row" ? "sm" : "md");
  const showCategory = (category ?? variant !== "row") && !!post.category;
  const common = { locale, labels, components };
  const metaRow = meta === false ? null : <PostMeta post={post} show={meta || undefined} tone={variant === "overlay" ? "onImage" : "default"} {...common} />;
  const crop = aspect ?? (variant === "overlay" ? (s === "xl" ? "4:3" : "16:10") : variant === "row" ? "1:1" : "3:2");
  const formatLabel = post.format ? t(post.format) : "";

  const title = (
    <H className={cn("vb-news-title text-pretty", titleSize[s], variant === "overlay" ? "text-white" : "text-fg", variant === "overlay" && s !== "xl" && "line-clamp-4")}>
      {rank !== undefined ? (
        <span aria-hidden className="me-2 font-display text-[1.6em] leading-none text-accent-ink tabular">
          {rank}
        </span>
      ) : null}
      <BlockLink
        href={post.href}
        components={components}
        locale={locale}
        className="vb-news-link rounded-[2px] bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover/post:bg-[length:100%_1px] motion-reduce:transition-none focus-ring after:absolute after:inset-0 after:content-[''] rtl:bg-right-bottom"
      >
        {post.title}
      </BlockLink>
    </H>
  );

  const cover = (cls?: string, defaultSizes?: string) =>
    post.cover?.src ? (
      <BlockImage
        {...post.cover}
        alt={post.cover.alt ?? ""}
        decorative={!post.cover.alt}
        aspect={fill ? undefined : (ratio[crop] as number)}
        sizes={sizes ?? defaultSizes}
        priority={priority}
        className={cn("vb-news-cover overflow-hidden bg-surface-2", cls)}
        imgClassName="transition-transform duration-500 ease-out group-hover/post:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/post:scale-100"
        components={components}
      />
    ) : (
      <span aria-hidden className={cn("block bg-surface-2", cls)} style={fill ? undefined : { aspectRatio: String(ratio[crop]) }} />
    );

  if (variant === "overlay") {
    return (
      <article data-variant="overlay" data-size={s} className={cn("vb-news-card group/post relative isolate flex min-h-0 overflow-hidden rounded-ui-sm bg-fg", fill && "h-full", className)}>
        <div className={cn("w-full", fill && "absolute inset-0 [&_.vb-news-cover]:h-full [&_img]:h-full [&_img]:object-cover")}>{cover("rounded-none", s === "xl" ? "(min-width: 56rem) 50vw, 100vw" : "(min-width: 56rem) 25vw, 100vw")}</div>
        <span aria-hidden className="vb-news-scrim pointer-events-none absolute inset-0" />
        {post.format ? <FormatMark format={post.format} label={formatLabel} /> : null}
        <div className={cn("absolute inset-x-0 bottom-0 flex flex-col gap-2", s === "xl" ? "p-[clamp(1rem,3cqi,2rem)]" : "p-4")}>
          {showCategory ? <CategoryBadge category={post.category!} variant="solid" {...common} /> : null}
          {title}
          {s === "xl" || s === "lg" ? metaRow : null}
        </div>
      </article>
    );
  }

  if (variant === "stack") {
    return (
      <article data-variant="stack" className={cn("vb-news-card group/post relative flex flex-col gap-3", className)}>
        <div className="relative">
          {cover("rounded-ui-sm", "(min-width: 56rem) 30vw, (min-width: 42rem) 50vw, 100vw")}
          {post.format ? <FormatMark format={post.format} label={formatLabel} /> : null}
          {showCategory ? <CategoryBadge category={post.category!} variant="solid" {...common} className="absolute bottom-0 start-0 rounded-none rounded-se-[2px]" /> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          {title}
          {metaRow}
          {excerpt && post.excerpt ? <p className="line-clamp-3 text-[0.9375rem] leading-relaxed text-fg-muted">{post.excerpt}</p> : null}
        </div>
      </article>
    );
  }

  if (variant === "row" || variant === "list") {
    const list = variant === "list";
    return (
      <article data-variant={variant} className={cn("vb-news-card group/post relative grid items-start gap-x-4", list ? "grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-x-5 @md:gap-x-6" : "grid-cols-[5.5rem_minmax(0,1fr)]", className)}>
        <div className="relative">{cover("rounded-ui-sm", list ? "(min-width: 56rem) 18rem, 40vw" : "6rem")}</div>
        <div className="flex min-w-0 flex-col gap-1.5">
          {showCategory ? <CategoryBadge category={post.category!} variant="text" {...common} /> : null}
          {title}
          {list ? metaRow : meta === false ? null : <PostMeta post={post} show={{ author: false, comments: false, readingTime: false, ...(meta || {}) }} {...common} />}
          {list && excerpt && post.excerpt ? <p className="line-clamp-2 text-[0.9375rem] leading-relaxed text-fg-muted max-[30rem]:hidden">{post.excerpt}</p> : null}
        </div>
      </article>
    );
  }

  return (
    <article data-variant="text" className={cn("vb-news-card group/post relative flex flex-col gap-1.5", className)}>
      {showCategory ? <CategoryBadge category={post.category!} variant="text" {...common} /> : null}
      {title}
      {excerpt && post.excerpt ? <p className="line-clamp-3 text-[0.9375rem] leading-relaxed text-fg-muted">{post.excerpt}</p> : null}
      {metaRow}
    </article>
  );
}
