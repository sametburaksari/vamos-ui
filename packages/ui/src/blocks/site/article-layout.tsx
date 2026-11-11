import * as React from "react";
import { cn2 as cn } from "./shared/kit-2";
import { slugify } from "../../lib/text";
import { readingMinutes } from "../../format/core";
import { Section, Container } from "../section";
import { BlockHeading } from "../block-heading";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import { RichText } from "../rich-text";
import type { BlockBaseProps } from "../types";
import type { RichBlock, RichDoc } from "../schema/rich-doc";
import { inlineToText, richToText, countWords } from "../schema/rich-doc";
import { labelTemplates, site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { formatDate2, isoDay, useBlockIds2, type SiteImage2, type SiteLink2 } from "./shared/kit-2";
import { BrandIcon, type BrandName } from "./shared/brand-icons";
import { CopyLinkButton } from "./shared/copy-link";
import { shareLabelKeys } from "./shared/island-keys";
import { BlogList, type PostSummary } from "./blog-list";
import { headingLines } from "./shared/heading-lines";

export type ArticleVariant = "classic" | "wide-cover" | "minimal";
export type ShareTarget = "copy" | "whatsapp" | "x" | "linkedin" | "email";

export interface ArticleAuthor {
  name: string;
  role?: string;
  bio?: React.ReactNode;
  avatar?: SiteImage2;
  href?: string;
}

export interface ArticlePost {
  title: string;
  /** Standfirst under the title. */
  dek?: React.ReactNode;
  body: RichDoc;
  /** Cover. `sizes`: wide `100vw`, contained `(min-width: 76rem) 76rem, 100vw`. Above the fold: `priority`. */
  cover?: SiteImage2;
  coverCaption?: React.ReactNode;
  author?: ArticleAuthor;
  /** ISO datetime or `YYYY-MM-DD`. */
  publishedAt: string;
  updatedAt?: string;
  category?: SiteLink2;
  tags?: SiteLink2[];
  /** Breadcrumb trail above the title (Home › Journal). The post itself is appended. */
  breadcrumb?: SiteLink2[];
  /** Default: computed from the body (220 wpm). */
  readingMinutes?: number;
}

export interface ArticleLayoutProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * classic: 42rem text column with a sticky mono table of contents at the end; cover wider than
   * the text. wide-cover: full-width 21:9 cover, title below, TOC as a row of links.
   * minimal: no cover, mono date above a large title — notes and announcements.
   */
  variant?: ArticleVariant;
  post: ArticlePost;
  /** Table of contents from the body's h2s (hidden under 3). Default true. */
  toc?: boolean;
  /** Share targets — plain URLs, no SDKs. Default copy · whatsapp · linkedin · email. */
  share?: ShareTarget[];
  /** Absolute URL used for sharing. Default: the page URL (copy) / omitted. */
  url?: string;
  related?: PostSummary[];
  /** Any block after the article (newsletter, booking CTA). */
  cta?: React.ReactNode;
  /** Draft preview: a "Preview" strip on top. Add `noindex` in the app's metadata. */
  draft?: boolean;
  labels?: Site2BlockLabels;
}

interface TocEntry {
  id: string;
  text: string;
}

/** Gives every h2/h3 a unique, locale-aware anchor and collects the h2s for the TOC. */
function withAnchors(doc: RichDoc, locale: string): { doc: RichDoc; toc: TocEntry[] } {
  const used = new Set<string>();
  const toc: TocEntry[] = [];
  const content = doc.content.map((b): RichBlock => {
    if (b.type !== "heading") return b;
    const text = inlineToText(b.content);
    let id = b.anchor || slugify(text, { locale }) || "section";
    let n = 2;
    while (used.has(id)) id = `${b.anchor || slugify(text, { locale })}-${n++}`;
    used.add(id);
    if (b.level === 2) toc.push({ id, text });
    return { ...b, anchor: id };
  });
  return { doc: { ...doc, content }, toc };
}

/**
 * The single-post template: header (breadcrumb, category, title, dek, byline, dates, reading
 * time), cover, table of contents, body (`RichText`), share links, author box and related posts.
 * Server component; only "Copy link" is a tiny island.
 *
 * ```tsx
 * <ArticleLayout post={post} related={related} share={["copy", "whatsapp", "linkedin"]} />
 * ```
 */
export function ArticleLayout({
  variant = "classic",
  post,
  toc: showToc = true,
  share = ["copy", "whatsapp", "linkedin", "email"],
  url,
  related,
  cta,
  draft,
  id,
  anchor,
  theme,
  headingLevel = 1,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: ArticleLayoutProps) {
  const t = site2Text(labels, locale);
  const { headingId } = useBlockIds2(id, "article");
  const { doc, toc } = withAnchors(post.body, locale);
  const tocVisible = showToc && toc.length >= 3;
  const minutes = post.readingMinutes ?? readingMinutes(countWords(richToText(post.body)));
  const ctx = { t, locale, components, labels };
  const cover = variant !== "minimal" && post.cover?.src ? post.cover : undefined;

  const header = (
    <header className={cn("flex flex-col gap-6", variant === "wide-cover" && "pt-4")}>
      {post.breadcrumb?.length ? <Breadcrumb trail={post.breadcrumb} current={post.title} ctx={ctx} /> : null}
      {variant === "minimal" ? (
        <p className="font-mono text-eyebrow tabular uppercase tracking-[0.08em] text-fg-muted">
          <time dateTime={isoDay(post.publishedAt)}>{formatDate2(isoDay(post.publishedAt), locale)}</time>
        </p>
      ) : post.category ? (
        <p className="font-mono text-eyebrow uppercase tracking-[0.08em]">
          <BlockLink href={post.category.href} components={components} labels={labels} locale={locale} className="text-accent-ink hover:underline underline-offset-[0.25em] focus-ring rounded-[2px]">
            {post.category.label}
          </BlockLink>
        </p>
      ) : null}
      <BlockHeading id={headingId} level={headingLevel} size={variant === "minimal" ? "display-xl" : "display-l"} text={headingLines(post.title)} editMode={editMode} field="props.post.title" labels={labels} locale={locale} className="max-w-[22ch]" />
      {post.dek ? <p className="max-w-[58ch] text-lead text-fg-muted text-pretty">{post.dek}</p> : null}
      <Byline post={post} minutes={minutes} ctx={ctx} showDate={variant !== "minimal"} />
    </header>
  );

  const tocNav = tocVisible ? (
    <nav aria-label={t("onThisPage")} className={cn("vb-toc", variant === "wide-cover" ? "border-y border-line py-4" : "flex flex-col gap-3")}>
      <p className={cn("font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted", variant === "wide-cover" && "sr-only")}>{t("onThisPage")}</p>
      <ol className={cn("text-small", variant === "wide-cover" ? "flex flex-wrap gap-x-6 gap-y-2" : "flex flex-col gap-2 border-s border-line")}>
        {toc.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} className={cn("vb-toc-link block text-fg-muted transition-colors hover:text-fg focus-ring rounded-[2px]", variant !== "wide-cover" && "-ms-px border-s border-transparent ps-4 hover:border-fg")}>
              {e.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  ) : null;

  const body = <RichText doc={doc} size="lg" components={components} labels={labels} locale={locale} className="vb-article-body" editMode={editMode} field="props.post.body" />;

  return (
    <>
      {draft ? (
        <p role="note" className="vb-draft-strip sticky top-0 z-20 px-4 py-2 text-center text-small text-fg">
          <span className="me-2 font-mono text-eyebrow uppercase tracking-[0.08em]">{t("preview")}</span>
          {t("previewNotice")}
        </p>
      ) : null}
      <Section as="article" theme={theme} anchor={anchor} headingId={headingId} blockId={id} blockType="article" editMode={editMode} className={cn("vb-article", className)} data-variant={variant}>
        {variant === "wide-cover" && cover ? (
          <div className="vb-article-cover -mt-[calc(var(--section-y)*var(--vb-rhythm))] mb-12 @4xl:mb-16">
            <BlockImage {...cover} alt={cover.alt ?? ""} decorative={!cover.alt} aspect="21:9" priority sizes="100vw" components={components} caption={post.coverCaption ? <span className="vb-container block">{post.coverCaption}</span> : undefined} />
          </div>
        ) : null}

        <Container className="flex flex-col gap-12 @4xl:gap-16">
          <div className={cn(variant === "classic" ? "@4xl:grid @4xl:grid-cols-12 @4xl:gap-x-(--gutter)" : "mx-auto w-full max-w-(--prose)", variant === "wide-cover" && "max-w-[58rem]")}>
            <div className={cn(variant === "classic" && "@4xl:col-span-9")}>{header}</div>
          </div>

          {variant === "classic" && cover ? (
            <BlockImage {...cover} alt={cover.alt ?? ""} decorative={!cover.alt} aspect="3:2" priority sizes="(min-width: 76rem) 76rem, 100vw" className="vb-article-cover rounded-ui" components={components} caption={post.coverCaption} />
          ) : null}

          {variant === "wide-cover" && tocNav ? <div className="mx-auto w-full max-w-[58rem]">{tocNav}</div> : null}

          <div className={cn(variant === "classic" ? "grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12" : "mx-auto w-full max-w-(--prose)")}>
            {variant === "classic" && tocNav ? (
              <aside className="@4xl:col-span-3 @4xl:col-start-10 @4xl:row-start-1">
                <div className="@4xl:sticky @4xl:top-[calc(var(--topbar-h,0px)+2rem)]">{tocNav}</div>
              </aside>
            ) : null}
            <div className={cn("flex min-w-0 flex-col gap-12", variant === "classic" && "@4xl:col-span-8 @4xl:row-start-1 @6xl:col-span-7")}>
              {body}
              <ArticleFooter post={post} share={share} url={url} ctx={ctx} />
            </div>
          </div>
        </Container>
      </Section>
      {related?.length ? <BlogList variant="compact" title={t("relatedPosts")} posts={related} postHeadingLevel={3} theme={{ rhythm: "tight" }} components={components} labels={labels} locale={locale} /> : null}
      {cta}
    </>
  );
}

interface Ctx {
  t: Site2Text;
  locale: string;
  components?: BlockBaseProps["components"];
  labels?: Site2BlockLabels;
}

function Breadcrumb({ trail, current, ctx }: { trail: SiteLink2[]; current: string; ctx: Ctx }) {
  return (
    <nav aria-label={ctx.t("breadcrumb")}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-fg-muted">
        {trail.map((l, i) => (
          <li key={i} className="flex items-center gap-2">
            <BlockLink href={l.href} components={ctx.components} labels={ctx.labels} locale={ctx.locale} className="hover:text-fg underline-offset-[0.25em] hover:underline focus-ring rounded-[2px]">
              {l.label}
            </BlockLink>
            <span aria-hidden className="text-fg-subtle rtl:-scale-x-100">
              /
            </span>
          </li>
        ))}
        <li>
          <span aria-current="page" className="line-clamp-1 text-fg">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}

function Byline({ post, minutes, ctx, showDate }: { post: ArticlePost; minutes: number; ctx: Ctx; showDate: boolean }) {
  const updated = post.updatedAt && isoDay(post.updatedAt) !== isoDay(post.publishedAt) ? post.updatedAt : undefined;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-5 text-small text-fg-muted">
      {post.author ? (
        <span className="flex items-center gap-3">
          {post.author.avatar?.src ? <BlockImage {...post.author.avatar} decorative aspect="1:1" sizes="36px" className="size-9 shrink-0 rounded-full" components={ctx.components} /> : null}
          <span className="font-medium text-fg">{post.author.name}</span>
        </span>
      ) : null}
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-eyebrow tabular uppercase tracking-[0.06em]">
        {showDate ? <time dateTime={isoDay(post.publishedAt)}>{formatDate2(isoDay(post.publishedAt), ctx.locale)}</time> : null}
        {updated ? (
          <>
            <span aria-hidden>·</span>
            <time dateTime={isoDay(updated)}>{ctx.t("updated", { date: formatDate2(isoDay(updated), ctx.locale, "medium") })}</time>
          </>
        ) : null}
        {showDate || updated ? <span aria-hidden>·</span> : null}
        <span>{ctx.t("minRead", { count: minutes })}</span>
      </span>
    </div>
  );
}

const SHARE_NETWORK: Record<Exclude<ShareTarget, "copy">, { brand: BrandName; name: string }> = {
  whatsapp: { brand: "whatsapp", name: "WhatsApp" },
  x: { brand: "x", name: "X" },
  linkedin: { brand: "linkedin", name: "LinkedIn" },
  email: { brand: "email", name: "Email" },
};

export function shareUrl(target: Exclude<ShareTarget, "copy">, url: string, title: string): string {
  const u = encodeURIComponent(url);
  const tt = encodeURIComponent(title);
  switch (target) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
    case "x":
      return `https://x.com/intent/post?url=${u}&text=${tt}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "email":
      return `mailto:?subject=${tt}&body=${u}`;
  }
}

function ArticleFooter({ post, share, url, ctx }: { post: ArticlePost; share: ShareTarget[]; url?: string; ctx: Ctx }) {
  const targets = share.filter((s) => s === "copy" || url);
  return (
    <footer className="flex flex-col gap-10 border-t border-line pt-8">
      {post.tags?.length ? (
        <ul className="flex flex-wrap gap-2" aria-label={ctx.t("tags")}>
          {post.tags.map((tag, i) => (
            <li key={i}>
              <BlockLink href={tag.href} components={ctx.components} labels={ctx.labels} locale={ctx.locale} className="inline-flex h-8 items-center rounded-full border border-line px-3 text-small text-fg-muted transition-colors hover:border-fg hover:text-fg focus-ring">
                {tag.label}
              </BlockLink>
            </li>
          ))}
        </ul>
      ) : null}
      {targets.length ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          <p className="me-3 font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{ctx.t("share")}</p>
          {targets.map((s) =>
            s === "copy" ? (
              <CopyLinkButton key={s} url={url} labels={labelTemplates(ctx.labels, shareLabelKeys)} />
            ) : (
              <BlockLink
                key={s}
                href={shareUrl(s, url!, post.title)}
                newTab={s !== "email"}
                components={ctx.components}
                labels={ctx.labels}
                locale={ctx.locale}
                aria-label={s === "email" ? ctx.t("shareByEmail") : ctx.t("shareOn", { network: SHARE_NETWORK[s].name })}
                className="vb-share-btn"
                data-track={`share:${s}`}
              >
                <BrandIcon name={SHARE_NETWORK[s].brand} className="size-4" />
                <span aria-hidden>{SHARE_NETWORK[s].name}</span>
              </BlockLink>
            ),
          )}
        </div>
      ) : null}
      {post.author?.bio ? (
        <div className="flex gap-5 rounded-ui bg-surface-2 p-6">
          {post.author.avatar?.src ? <BlockImage {...post.author.avatar} decorative aspect="1:1" sizes="64px" className="size-16 shrink-0 rounded-full" components={ctx.components} /> : null}
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{ctx.t("writtenBy")}</p>
            <p className="text-h3 font-semibold tracking-[-0.012em] text-fg">
              {post.author.href ? (
                <BlockLink href={post.author.href} components={ctx.components} labels={ctx.labels} locale={ctx.locale} className="hover:underline underline-offset-[0.2em] focus-ring rounded-[2px]">
                  {post.author.name}
                </BlockLink>
              ) : (
                post.author.name
              )}
              {post.author.role ? <span className="ms-2 text-small font-normal text-fg-muted">{post.author.role}</span> : null}
            </p>
            <div className="text-small text-fg-muted text-pretty">{post.author.bio}</div>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
