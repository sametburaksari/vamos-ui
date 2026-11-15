import * as React from "react";
import { Check, Minus } from "lucide-react";
import { createFormatter } from "../../format/core";
import { cn2 as cn, textOf, useBlockIds2 } from "./shared/kit-2";
import { JsonLd } from "../json-ld";
import type { BlockAdapters } from "../types";
import { StarRating } from "./star-rating";
import { commerceText, type CommerceBlockLabels } from "./shared/labels-commerce";

export interface ReviewCriterion {
  label: string;
  /** On the same scale as the overall score. */
  score: number;
}

/** What was reviewed, for the Review JSON-LD (`itemReviewed`). */
export interface ReviewedItem {
  name: string;
  /** schema.org type. Default `"Product"`. */
  type?: "Product" | "SoftwareApplication" | "Book" | "Game" | "Movie" | "CreativeWork" | "Organization" | "LocalBusiness";
  /** Absolute image URL. */
  image?: string;
  brand?: string;
  url?: string;
}

export interface ReviewScoreProps {
  /** Overall score on the `max` scale. */
  score: number;
  /** Scale. Default 10. */
  max?: number;
  /** points: "8.6" over "/ 10". percent: "86%". stars: five stars (score is converted to 0–5). */
  display?: "points" | "percent" | "stars";
  /** Box title. Default "Our score". */
  title?: React.ReactNode;
  /** Title level. Default 2. */
  headingLevel?: 2 | 3 | 4;
  /** A word beside the score ("Excellent", "Great value"). */
  scoreLabel?: React.ReactNode;
  /** Score bars per criterion (same scale as `score`). */
  criteria?: ReviewCriterion[];
  pros?: React.ReactNode[];
  cons?: React.ReactNode[];
  /** The bottom line, one or two sentences. */
  verdict?: React.ReactNode;
  reviewer?: { name: string; url?: string };
  /** `YYYY-MM-DD`, for the JSON-LD. */
  datePublished?: string;
  /** Readers' ratings, shown under the score as stars + count and added to the JSON-LD. */
  aggregateRating?: { value: number; count: number; best?: number };
  /** The item reviewed. Required for the JSON-LD. */
  item?: ReviewedItem;
  /** Emit Review JSON-LD (needs `item`). Default true. */
  jsonLd?: boolean;
  /** A call to action under the verdict ("Check price"). */
  action?: React.ReactNode;
  id?: string;
  className?: string;
  labels?: CommerceBlockLabels;
  locale?: string;
  components?: BlockAdapters;
}

/**
 * Review summary box for review articles: the overall score (points, percent or stars), score
 * bars per criterion, pros and cons, the verdict, readers' rating, and schema.org `Review` JSON-LD
 * with `reviewRating`, `positiveNotes` / `negativeNotes` and the item's `aggregateRating`. A named
 * `<section>`; the bars are decorative and every score is in text. Server component.
 *
 * ```tsx
 * <ReviewScore score={8.6} criteria={[{ label: "Sound", score: 9 }]} pros={["Warm mids"]} cons={["No case"]}
 *   verdict="The pair to beat under $200." item={{ name: "Arden H2 headphones", brand: "Arden" }} />
 * ```
 */
export function ReviewScore({
  score,
  max = 10,
  display = "points",
  title,
  headingLevel = 2,
  scoreLabel,
  criteria,
  pros,
  cons,
  verdict,
  reviewer,
  datePublished,
  aggregateRating,
  item,
  jsonLd = true,
  action,
  id,
  className,
  labels,
  locale = "en-US",
  components,
}: ReviewScoreProps) {
  const t = commerceText(labels, locale);
  const { base, headingId } = useBlockIds2(id, "review");
  const nf = createFormatter(locale);
  const Heading = `h${headingLevel}` as "h2";
  const Sub = `h${Math.min(6, headingLevel + 1)}` as "h3";
  const clamped = Math.min(max, Math.max(0, score));
  const fmt = (n: number) => nf.number(n, { minimumFractionDigits: max <= 10 ? 1 : 0, maximumFractionDigits: max <= 10 ? 1 : 0 });
  const pct = Math.round((clamped / max) * 100);
  const scoreText = t("scoreOutOf", { score: fmt(clamped), max: nf.number(max) });

  return (
    <section id={base} aria-labelledby={headingId} className={cn("vb-review @container flex flex-col gap-6 rounded-ui-lg border border-line bg-surface p-5 @md:p-7", className)}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="vb-review-score flex shrink-0 items-baseline gap-1 rounded-ui bg-accent px-4 py-3 text-accent-fg" {...(display === "stars" ? null : { role: "img", "aria-label": scoreText })}>
          {display === "stars" ? (
            <StarRating value={(clamped / max) * 5} size="lg" label={scoreText} labels={labels} locale={locale} className="text-accent-fg [&_.text-fg-subtle]:text-[color-mix(in_srgb,currentColor_45%,transparent)]" />
          ) : display === "percent" ? (
            <span aria-hidden className="font-display text-display-m tabular leading-none">
              {nf.number(pct)}
              <span className="text-lead">%</span>
            </span>
          ) : (
            <>
              <span aria-hidden className="font-display text-display-m tabular leading-none">{fmt(clamped)}</span>
              <span aria-hidden className="text-small tabular opacity-80">/ {nf.number(max)}</span>
            </>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Heading id={headingId} className="font-display text-h3 leading-tight text-fg">
            {title ?? t("reviewScore")}
          </Heading>
          {scoreLabel ? <p className="text-body font-medium text-fg">{scoreLabel}</p> : null}
          {aggregateRating ? <StarRating value={aggregateRating.value} max={aggregateRating.best ?? 5} count={aggregateRating.count} showValue size="sm" labels={labels} locale={locale} components={components} /> : null}
        </div>
      </div>

      {criteria?.length ? (
        <div className="flex flex-col gap-3">
          <Sub className="sr-only">{t("criteria")}</Sub>
          <ul className="grid gap-x-8 gap-y-3 @xl:grid-cols-2">
            {criteria.map((c, i) => {
              const v = Math.min(max, Math.max(0, c.score));
              return (
                <li key={i} className="flex flex-col gap-1.5">
                  <span className="flex items-baseline justify-between gap-3 text-small">
                    <span className="text-fg">{c.label}</span>
                    <span className="tabular font-medium text-fg">
                      {display === "percent" ? `${nf.number(Math.round((v / max) * 100))}%` : fmt(v)}
                      <span className="sr-only"> ({t("scoreOutOf", { score: fmt(v), max: nf.number(max) })})</span>
                    </span>
                  </span>
                  <span aria-hidden className="vb-review-bar block h-1.5 overflow-hidden rounded-full bg-track">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${(v / max) * 100}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {pros?.length || cons?.length ? (
        <div className="grid gap-6 @xl:grid-cols-2">
          {pros?.length ? <NoteList title={t("pros")} items={pros} kind="pro" Sub={Sub} /> : null}
          {cons?.length ? <NoteList title={t("cons")} items={cons} kind="con" Sub={Sub} /> : null}
        </div>
      ) : null}

      {verdict || reviewer || action ? (
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          {verdict ? (
            <div className="flex flex-col gap-1">
              <Sub className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t("verdict")}</Sub>
              <p className="text-lead text-fg">{verdict}</p>
            </div>
          ) : null}
          {reviewer ? <p className="text-small text-fg-muted">{t("reviewedBy", { name: reviewer.name })}</p> : null}
          {action ? <div className="flex flex-wrap gap-3 pt-1">{action}</div> : null}
        </div>
      ) : null}

      {jsonLd && item ? <JsonLd data={reviewJsonLd({ score: clamped, max, item, reviewer, datePublished, aggregateRating, verdict, pros, cons })} /> : null}
    </section>
  );
}

function NoteList({ title, items, kind, Sub }: { title: string; items: React.ReactNode[]; kind: "pro" | "con"; Sub: "h3" }) {
  const Icon = kind === "pro" ? Check : Minus;
  return (
    <div className="flex flex-col gap-3">
      <Sub className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{title}</Sub>
      <ul className="flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5 text-small text-fg">
            <span aria-hidden className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", kind === "pro" ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-success-ink" : "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger-ink")}>
              <Icon className="size-3.5" strokeWidth={2.25} />
            </span>
            <span className="min-w-0">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface ReviewJsonLdInput {
  score: number;
  max?: number;
  item: ReviewedItem;
  reviewer?: { name: string; url?: string };
  datePublished?: string;
  aggregateRating?: { value: number; count: number; best?: number };
  verdict?: React.ReactNode;
  pros?: React.ReactNode[];
  cons?: React.ReactNode[];
}

const notes = (items: React.ReactNode[] | undefined) => {
  const names = (items ?? []).map(textOf).filter(Boolean);
  return names.length ? { "@type": "ItemList", itemListElement: names.map((name, i) => ({ "@type": "ListItem", position: i + 1, name })) } : undefined;
};

/**
 * schema.org `Review`: `itemReviewed` (with its `aggregateRating` when given), `reviewRating`,
 * author, date, `reviewBody` and pros / cons as `positiveNotes` / `negativeNotes`. String items only
 * reach the JSON-LD. Pass to `<JsonLd data={…} />`; `ReviewScore` emits it for you.
 */
export function reviewJsonLd({ score, max = 10, item, reviewer, datePublished, aggregateRating, verdict, pros, cons }: ReviewJsonLdInput): Record<string, unknown> {
  const positive = notes(pros);
  const negative = notes(cons);
  const body = textOf(verdict);
  return {
    "@type": "Review",
    itemReviewed: {
      "@type": item.type ?? "Product",
      name: item.name,
      ...(item.image ? { image: item.image } : null),
      ...(item.url ? { url: item.url } : null),
      ...(item.brand ? { brand: { "@type": "Brand", name: item.brand } } : null),
      ...(aggregateRating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: aggregateRating.value, reviewCount: aggregateRating.count, bestRating: aggregateRating.best ?? 5, worstRating: 1 } } : null),
    },
    reviewRating: { "@type": "Rating", ratingValue: score, bestRating: max, worstRating: 0 },
    ...(reviewer ? { author: { "@type": "Person", name: reviewer.name, ...(reviewer.url ? { url: reviewer.url } : null) } } : null),
    ...(datePublished ? { datePublished } : null),
    ...(body ? { reviewBody: body } : null),
    ...(positive ? { positiveNotes: positive } : null),
    ...(negative ? { negativeNotes: negative } : null),
  };
}
