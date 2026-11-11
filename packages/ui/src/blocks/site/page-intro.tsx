import * as React from "react";
import { cn } from "../../lib/cn";
import { Container, Section } from "../section";
import { BlockHeading } from "../block-heading";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import { field, siteText, useBlockIds, type SiteBlockLabels, type SiteImage, type SiteMeta } from "./_kit-1";

export type PageIntroVariant = "simple" | "with-media" | "ruled";

export interface PageIntroCrumb {
  label: React.ReactNode;
  /** Omit on the current page (the last crumb). */
  href?: string;
}

export interface PageIntroProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * simple: small breadcrumb, display-l title, lead beside it on wide containers.
   * with-media: title + lead, then a 21:9 image bleeding past the container.
   * ruled: title at the start, 2–3 meta rows behind a vertical rule at the end, hairline below.
   */
  variant?: PageIntroVariant;
  /** Ancestors first; the last crumb is the current page (`aria-current="page"`). */
  breadcrumb?: PageIntroCrumb[];
  eyebrow?: React.ReactNode;
  /** The page `h1` (inner pages). One `*emphasis*`. */
  title: React.ReactNode;
  lead?: React.ReactNode;
  media?: SiteImage;
  /** ruled: facts on the end side ("Service area" · "Asian side"), up to 3. */
  meta?: SiteMeta[];
  labels?: SiteBlockLabels;
  /**
   * Explicit id for the `h1` (e.g. to move focus back to it after an in-page route change).
   * Default: `<id>-title`, or an auto id.
   */
  headingId?: string;
}

/** `BreadcrumbList` JSON-LD for the crumbs (absolute URLs need `origin`). */
export function breadcrumbJsonLd(crumbs: { label: string; href?: string }[], origin = ""): Record<string, unknown> | null {
  if (!crumbs.length) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${origin}${c.href}` } : null) })),
  };
}

/**
 * The `h1` + breadcrumb of an inner page (About, Services, Contact) — lighter than a hero.
 * Server component.
 *
 * ```tsx
 * <PageIntro breadcrumb={[{ label: "Home", href: "/" }, { label: "Treatments" }]} title="Treatments, *by the hour*" />
 * ```
 */
export function PageIntro({ variant = "simple", breadcrumb, eyebrow, title, lead, media, meta, id, theme, anchor, className, headingLevel = 1, labels, locale, components, editMode, headingId: headingIdProp }: PageIntroProps) {
  const t = siteText(labels, locale);
  const { base, headingId: autoHeadingId } = useBlockIds(id, "intro");
  const headingId = headingIdProp ?? autoHeadingId;
  const linkProps = { components, labels, locale };

  const crumbs = breadcrumb?.length ? (
    <nav aria-label={t("breadcrumb")} {...field(editMode, "breadcrumb")}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-subtle">
        {breadcrumb.map((c, i) => {
          const last = i === breadcrumb.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden className="text-fg-subtle/70 rtl:-scale-x-100">
                  /
                </span>
              ) : null}
              {c.href && !last ? (
                <BlockLink href={c.href} {...linkProps} className="rounded-[2px] transition-colors hover:text-fg focus-ring">
                  {c.label}
                </BlockLink>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-fg-muted" : undefined}>
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  ) : eyebrow ? (
    <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted" {...field(editMode, "eyebrow")}>
      {eyebrow}
    </p>
  ) : null;

  const heading = <BlockHeading id={headingId} level={headingLevel} size="display-l" text={title} editMode={editMode} field="props.title" labels={labels} locale={locale} className="max-w-[20ch]" />;
  const leadEl = lead ? (
    <p className="vb-lead max-w-[52ch] text-lead text-fg-muted" {...field(editMode, "lead")}>
      {lead}
    </p>
  ) : null;

  let content: React.ReactNode;
  if (variant === "ruled") {
    content = (
      <Container>
        <div className="grid gap-x-(--gutter) gap-y-10 border-b border-line pb-[calc(var(--section-y)*0.4)] @4xl:grid-cols-12 @4xl:items-end">
          <div className="flex flex-col gap-6 @4xl:col-span-7">
            {crumbs}
            {heading}
            {leadEl}
          </div>
          {meta?.length ? (
            <dl className="flex flex-col gap-4 border-s border-line ps-6 @4xl:col-span-4 @4xl:col-start-9" {...field(editMode, "meta")}>
              {meta.slice(0, 3).map((m, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-subtle">{m.label}</dt>
                  <dd className="text-body text-fg">{m.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </Container>
    );
  } else {
    content = (
      <>
        <Container className="flex flex-col gap-6">
          {crumbs}
          <div className="grid gap-x-(--gutter) gap-y-6 @4xl:grid-cols-12 @4xl:items-end">
            <div className="@4xl:col-span-7">{heading}</div>
            {leadEl ? <div className="@4xl:col-span-5 @4xl:pb-[0.4em]">{leadEl}</div> : null}
          </div>
        </Container>
        {variant === "with-media" && media ? (
          <Container size="wide" className="mt-[calc(var(--section-y)*0.5)] px-0! @6xl:px-(--gutter)!">
            <BlockImage {...media} aspect="21:9" priority sizes="min(100vw, 90rem)" className="@6xl:rounded-ui" components={components} labels={labels} editMode={editMode} field="props.media" />
          </Container>
        ) : null}
      </>
    );
  }

  return (
    <Section
      theme={theme}
      anchor={anchor}
      headingId={headingId}
      blockId={base}
      blockType="page-intro"
      editMode={editMode}
      className={cn("vb-page-intro", className)}
      data-variant={variant}
    >
      {content}
    </Section>
  );
}
