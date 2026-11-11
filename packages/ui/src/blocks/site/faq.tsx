import * as React from "react";
import { cn } from "../../lib/cn";
import { slugify } from "../../lib/text";
import { Container, Section } from "../section";
import { SectionHeader } from "../section-header";
import { BlockLink } from "../block-link";
import { RichText } from "../rich-text";
import type { BlockBaseProps } from "../types";
import { richToText, type RichDoc } from "../schema/rich-doc";
import { ArrowEnd, siteText, useBlockIds, type SiteBlockLabels, type SiteCta } from "./_kit-1";
import { Stagger } from "../../motion/reveal";

export type FaqVariant = "split" | "stacked" | "columns";

export interface FaqItem {
  q: string;
  /** RichDoc or plain text (blank line = paragraph). */
  a: RichDoc | string;
  /** Anchor id; default `faq-<slug of the question>` (locale-aware). */
  id?: string;
}

export interface FaqProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * split: sticky title + "Can't find your question?" link on the start side, accordion on the end side.
   * stacked: title above, accordion full width at a 42rem measure.
   * columns: no accordion — every answer open in two columns (short answers, maximally indexable).
   */
  variant?: FaqVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  items: FaqItem[];
  /** Only one answer open at a time (native `<details name>`). Default true. */
  exclusive?: boolean;
  /** Open the first answer. Default false. */
  openFirst?: boolean;
  /** "Message us" link under the title. */
  contact?: SiteCta;
  /** Open the item matching `location.hash` (`#faq-parking`) — a 200-byte inline script. Default true. */
  deepLink?: boolean;
  labels?: SiteBlockLabels;
}

/** `FAQPage` JSON-LD for the items. */
export function faqJsonLd(items: { q: string; a: RichDoc | string }[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: typeof it.a === "string" ? it.a : richToText(it.a) },
    })),
  };
}

const DEEP_LINK = `(function(){var h=decodeURIComponent(location.hash.slice(1));if(!h)return;var d=document.getElementById(h);if(d&&d.tagName==="DETAILS")d.open=true;})();`;

/**
 * Questions and answers — 0 JS: native `<details name>` (exclusive accordion), animated with
 * `::details-content` where supported; closed answers stay findable by in-page search.
 * Server component.
 *
 * ```tsx
 * <Faq title="Before you *book*" items={[{ q: "Is there parking?", a: "Yes — two hours free in the Piazza garage." }]} />
 * ```
 */
export function Faq({
  variant = "split",
  eyebrow,
  title,
  lead,
  items,
  exclusive = true,
  openFirst,
  contact,
  deepLink = true,
  id,
  theme,
  anchor,
  className,
  headingLevel = 2,
  labels,
  locale,
  components,
  editMode,
}: FaqProps) {
  const t = siteText(labels, locale);
  const { base, headingId } = useBlockIds(id, "faq");
  const QTag = `h${Math.min(headingLevel + 1, 6)}` as "h3";
  const itemId = (it: FaqItem) => it.id ?? `faq-${slugify(it.q, { locale, maxLength: 48 })}`;
  const answer = (it: FaqItem, i: number) => (
    <RichText doc={it.a} headingOffset={2} components={components} labels={labels} locale={locale} editMode={editMode} field={`props.items.${i}.a`} className="text-fg-muted" />
  );

  const contactEl = contact ? (
    <p className="flex flex-col gap-1 text-small text-fg-muted">
      <span>{t("faqMore")}</span>
      <BlockLink href={contact.link.href} newTab={contact.link.newTab} appearance="link" components={components} labels={labels} locale={locale} className="w-fit text-body">
        {contact.link.label}
        <ArrowEnd />
      </BlockLink>
    </p>
  ) : null;

  const header =
    title || eyebrow || lead ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingLevel={headingLevel} headingId={headingId} editMode={editMode} labels={labels} locale={locale} /> : null;

  const list =
    variant === "columns" ? (
      <Stagger asChild effect="fade" disabled={editMode}>
        <dl className="grid gap-x-(--gutter) @4xl:grid-cols-2">
          {items.map((it, i) => (
            <div key={i} id={itemId(it)} className="flex flex-col gap-3 border-t border-line py-7">
              <dt className="text-h3 font-semibold tracking-[-0.012em] text-fg text-balance" data-field={editMode ? `props.items.${i}.q` : undefined}>
                {it.q}
              </dt>
              <dd className="m-0">{answer(it, i)}</dd>
            </div>
          ))}
        </dl>
      </Stagger>
    ) : (
      <Stagger asChild effect="fade" disabled={editMode}>
        <div className="vb-faq-list border-b border-line">
          {items.map((it, i) => (
            <details key={i} id={itemId(it)} name={exclusive ? `${base}-faq` : undefined} open={openFirst && i === 0 ? true : undefined} className="vb-faq-item group/faq border-t border-line">
              <summary className="vb-faq-q flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-start focus-ring rounded-[2px]">
                <QTag className="text-h3 font-semibold tracking-[-0.012em] text-fg text-balance" data-field={editMode ? `props.items.${i}.q` : undefined}>
                  {it.q}
                </QTag>
                <span aria-hidden className="vb-faq-marker relative mt-[0.45em] size-3.5 shrink-0" />
              </summary>
              <div className="vb-faq-a max-w-[64ch] pb-7 pe-10">{answer(it, i)}</div>
            </details>
          ))}
        </div>
      </Stagger>
    );

  let content: React.ReactNode;
  if (variant === "split") {
    content = (
      <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12">
        <div className="@4xl:col-span-4">
          <div className="flex flex-col gap-8 @4xl:sticky @4xl:top-[calc(var(--vb-nav-h,4.5rem)+2rem)]">
            {header}
            {contactEl}
          </div>
        </div>
        <div className="@4xl:col-span-7 @4xl:col-start-6">{list}</div>
      </Container>
    );
  } else if (variant === "stacked") {
    content = (
      <Container className="flex flex-col gap-10">
        {header}
        <div className="max-w-(--prose)">{list}</div>
        {contactEl}
      </Container>
    );
  } else {
    content = (
      <Container className="flex flex-col gap-10">
        {header ? <div className="flex flex-col gap-6 @4xl:flex-row @4xl:items-end @4xl:justify-between">{header}{contactEl}</div> : contactEl}
        {list}
      </Container>
    );
  }

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={base} blockType="faq" editMode={editMode} className={cn("vb-faq", className)} data-variant={variant}>
      {content}
      {deepLink && variant !== "columns" ? <script dangerouslySetInnerHTML={{ __html: DEEP_LINK }} /> : null}
    </Section>
  );
}
