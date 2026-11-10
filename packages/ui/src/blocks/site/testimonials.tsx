import * as React from "react";
import { Star } from "lucide-react";
import { cn2 as cn } from "./shared/kit-2";
import { createFormatter } from "../../format/core";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import { labelTemplates, site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { fieldAttr, formatDate2, isoDay, useBlockIds2, type SiteImage2, type SiteLink2 } from "./shared/kit-2";
import { TestimonialsCarousel } from "./shared/testimonials-carousel";
import { carouselLabelKeys } from "./shared/island-keys";

export type TestimonialsVariant = "feature" | "wall" | "carousel" | "reviews";
export type ReviewSource = "google" | "yandex" | "tripadvisor" | "trustpilot" | "direct";

export const REVIEW_SOURCE_NAMES: Record<ReviewSource, string> = { google: "Google", yandex: "Yandex", tripadvisor: "Tripadvisor", trustpilot: "Trustpilot", direct: "" };

export interface TestimonialItem {
  quote: React.ReactNode;
  author: React.ReactNode;
  role?: React.ReactNode;
  company?: React.ReactNode;
  /** Small square portrait. No avatar = name only (never an initials circle). */
  avatar?: SiteImage2;
  /** Company logo (feature variant). */
  logo?: SiteImage2;
  /** 1–5. Rendered only with a `source` (D6-8). */
  rating?: number;
  source?: ReviewSource;
  /** `YYYY-MM-DD`. */
  date?: string;
  /** Link to the original review. */
  link?: SiteLink2;
}

export interface ReviewSummary {
  rating: number;
  count: number;
  source: ReviewSource;
  link?: SiteLink2;
}

export interface TestimonialsProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * feature: one large serif quote with a hanging quote mark. wall: uneven columns of quotes, no
   * cards. carousel: sliding quotes with arrows and a "3 / 8" counter (no autoplay).
   * reviews: sticky rating summary beside a dated review list.
   */
  variant?: TestimonialsVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  items: TestimonialItem[];
  /** `reviews` variant: "4.8 on Google — 1,240 reviews". */
  summary?: ReviewSummary;
  labels?: Site2BlockLabels;
}

/**
 * Customer voices: agency references, Google reviews for a spa or restaurant, SaaS quotes.
 * `figure > blockquote + figcaption`, locale quotation marks, stars only with a named source.
 * Server component; `carousel` adds a ~1 KB scroll-snap island.
 *
 * ```tsx
 * <Testimonials variant="wall" title="What clients *say*" items={quotes} />
 * ```
 */
export function Testimonials({
  variant: variantProp = "feature",
  eyebrow,
  title,
  lead,
  items,
  summary,
  id,
  anchor,
  theme,
  headingLevel = 2,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: TestimonialsProps) {
  const t = site2Text(labels, locale);
  const { headingId } = useBlockIds2(id, "testimonials");
  const variant: TestimonialsVariant = variantProp === "carousel" && items.length < 2 ? "feature" : variantProp;
  const ctx: QuoteCtx = { t, locale, components, labels, editMode };
  const header = title || eyebrow || lead ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} editMode={editMode} labels={labels} locale={locale} /> : null;

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="testimonials" editMode={editMode} className={cn("vb-testimonials", className)} data-variant={variant}>
      <Container className="flex flex-col gap-12 @4xl:gap-16">
        {variant === "carousel" ? (
          <TestimonialsCarousel header={header} count={items.length} labels={labelTemplates(labels, carouselLabelKeys)} locale={locale}>
            {items.map((item, i) => (
              <QuoteFigure key={i} item={item} index={i} ctx={ctx} size="m" />
            ))}
          </TestimonialsCarousel>
        ) : (
          <>
            {variant !== "reviews" ? header : null}
            {variant === "feature" ? (
              <FeatureQuote item={items[0]!} ctx={ctx} />
            ) : variant === "wall" ? (
              <ul className="vb-quote-wall gap-x-(--gutter) @2xl:columns-2 @4xl:columns-3">
                {items.map((item, i) => (
                  <li key={i} className="mb-12 break-inside-avoid border-t border-line pt-6">
                    <QuoteFigure item={item} index={i} ctx={ctx} />
                  </li>
                ))}
              </ul>
            ) : (
              <ReviewsLayout header={header} items={items} summary={summary} ctx={ctx} />
            )}
          </>
        )}
      </Container>
    </Section>
  );
}

interface QuoteCtx {
  t: Site2Text;
  locale: string;
  components?: BlockBaseProps["components"];
  labels?: Site2BlockLabels;
  editMode?: boolean;
}

/** Monochrome stars with a text alternative ("4.8 out of 5"). */
export function RatingStars({ rating, label, className }: { rating: number; label: string; className?: string }) {
  const r = Math.max(0, Math.min(5, rating));
  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-0.5 text-fg", className)}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, r - i));
        return (
          <span key={i} aria-hidden className="relative inline-flex size-3.5">
            <Star strokeWidth={1.5} className="absolute inset-0 size-3.5 text-fg-subtle" />
            {fill > 0 ? (
              <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star strokeWidth={1.5} className="size-3.5 fill-current" />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

function Attribution({ item, ctx, align = "start", as: Comp = "figcaption" }: { item: TestimonialItem; ctx: QuoteCtx; align?: "start" | "between"; as?: "figcaption" | "div" }) {
  const meta = [item.role, item.company].filter(Boolean);
  return (
    <Comp className={cn("flex items-center gap-3", align === "between" && "justify-between")}>
      <span className="flex items-center gap-3">
        {item.avatar ? (
          <BlockImage {...item.avatar} alt={item.avatar.alt ?? ""} decorative={!item.avatar.alt} aspect="1:1" sizes="40px" className="size-10 shrink-0 rounded-full" components={ctx.components} />
        ) : null}
        <span className="flex flex-col">
          <span className="text-sm font-medium text-fg">{item.author}</span>
          {meta.length ? (
            <span className="font-mono text-eyebrow uppercase tracking-[0.06em] text-fg-muted">
              {meta.map((m, i) => (
                <React.Fragment key={i}>
                  {i > 0 ? " · " : null}
                  {m}
                </React.Fragment>
              ))}
            </span>
          ) : null}
        </span>
      </span>
      {align === "between" && item.logo ? (
        <BlockImage {...item.logo} alt={item.logo.alt ?? ""} decorative={!item.logo.alt} fit="contain" className="h-7 w-24 bg-transparent opacity-80" imgClassName="vb-logo-mono" components={ctx.components} />
      ) : null}
    </Comp>
  );
}

function SourceLine({ item, ctx }: { item: TestimonialItem; ctx: QuoteCtx }) {
  const showRating = item.rating !== undefined && item.source;
  const name = item.source ? REVIEW_SOURCE_NAMES[item.source] : "";
  if (!showRating && !item.date && !name) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
      {showRating ? <RatingStars rating={item.rating!} label={ctx.t("ratingOutOf", { rating: item.rating })} /> : null}
      {name ? (
        item.link ? (
          <BlockLink href={item.link.href} newTab={item.link.newTab ?? true} components={ctx.components} labels={ctx.labels} locale={ctx.locale} className="underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]">
            {name}
          </BlockLink>
        ) : (
          <span>{name}</span>
        )
      ) : null}
      {item.date ? <time dateTime={isoDay(item.date)}>{formatDate2(isoDay(item.date), ctx.locale, "medium")}</time> : null}
    </p>
  );
}

function QuoteFigure({ item, index, ctx, size = "s" }: { item: TestimonialItem; index: number; ctx: QuoteCtx; size?: "s" | "m" }) {
  return (
    <figure className="flex flex-col gap-5">
      <SourceLine item={item} ctx={ctx} />
      <blockquote className={cn("text-fg text-pretty", size === "m" ? "text-lead" : "text-body")} {...fieldAttr(ctx.editMode, `items.${index}.quote`)}>
        <p>
          <span aria-hidden>{ctx.t("quoteOpen")}</span>
          {item.quote}
          <span aria-hidden>{ctx.t("quoteClose")}</span>
        </p>
      </blockquote>
      <Attribution item={item} ctx={ctx} />
    </figure>
  );
}

function FeatureQuote({ item, ctx }: { item: TestimonialItem; ctx: QuoteCtx }) {
  return (
    <figure className="grid gap-y-10 @4xl:grid-cols-12 @4xl:gap-x-(--gutter)">
      <blockquote className="relative @4xl:col-span-10 @4xl:col-start-2" {...fieldAttr(ctx.editMode, "items.0.quote")}>
        <span aria-hidden className="vb-quote-mark pointer-events-none absolute -top-[0.08em] end-full me-[0.12em] font-display text-display-l leading-none text-accent-ink">
          {ctx.t("quoteOpen")}
        </span>
        <p className="font-display text-display-m text-fg text-pretty">
          {item.quote}
          <span aria-hidden>{ctx.t("quoteClose")}</span>
        </p>
      </blockquote>
      <figcaption className="flex flex-col gap-4 border-t border-line pt-6 @4xl:col-span-10 @4xl:col-start-2">
        <Attribution item={item} ctx={ctx} align="between" as="div" />
        <SourceLine item={item} ctx={ctx} />
      </figcaption>
    </figure>
  );
}

function ReviewsLayout({ header, items, summary, ctx }: { header: React.ReactNode; items: TestimonialItem[]; summary?: ReviewSummary; ctx: QuoteCtx }) {
  const nf = createFormatter(ctx.locale);
  const sourceName = summary ? REVIEW_SOURCE_NAMES[summary.source] : "";
  return (
    <div className="grid gap-x-(--gutter) gap-y-12 @4xl:grid-cols-12">
      <div className="flex flex-col gap-8 @4xl:sticky @4xl:top-[calc(var(--topbar-h,0px)+2rem)] @4xl:col-span-4 @4xl:self-start">
        {header}
        {summary && sourceName ? (
          <div className="flex flex-col gap-3 border-t border-line pt-6">
            <p className="flex items-baseline gap-3">
              <span className="font-display text-display-l tabular text-fg">{nf.number(summary.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
              <RatingStars rating={summary.rating} label={ctx.t("ratingOutOf", { rating: nf.number(summary.rating, { maximumFractionDigits: 1 }) })} />
            </p>
            <p className="text-small text-fg-muted">
              {ctx.t("ratingSummary", { rating: nf.number(summary.rating, { maximumFractionDigits: 1 }), source: sourceName })} — {ctx.t("reviewCount", { count: summary.count })}
            </p>
            {summary.link ? (
              <BlockLink href={summary.link.href} newTab={summary.link.newTab ?? true} appearance="link" components={ctx.components} labels={ctx.labels} locale={ctx.locale} className="self-start text-small">
                {summary.link.label ?? ctx.t("readAllReviews")}
              </BlockLink>
            ) : null}
          </div>
        ) : null}
      </div>
      <ol className="flex flex-col @4xl:col-span-7 @4xl:col-start-6">
        {items.map((item, i) => (
          <li key={i} className="border-t border-line py-7 first:border-t-0 first:pt-0 @4xl:first:border-t @4xl:first:pt-7">
            <QuoteFigure item={item} index={i} ctx={ctx} />
          </li>
        ))}
      </ol>
    </div>
  );
}
