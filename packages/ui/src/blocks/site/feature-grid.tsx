import * as React from "react";
import { cn } from "../../lib/cn";
import { Container, Section } from "../section";
import { SectionHeader } from "../section-header";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import { FeatureTabs } from "./feature-tabs";
import { SiteIcon } from "./_site-icon-1";
import { ArrowEnd, indexLabel, useBlockIds, type SiteBlockLabels, type SiteCta, type SiteImage } from "./_kit-1";

export type FeatureGridVariant = "list" | "grid" | "tabs" | "sticky-media";

export interface FeatureItem {
  title: React.ReactNode;
  text?: React.ReactNode;
  /** Lucide name ("calendar-check") or a node. Small, before the title, never boxed. */
  icon?: React.ReactNode;
  media?: SiteImage;
  /** Makes the whole row clickable (one link, stretched with `::after`). */
  link?: { href: string; label?: React.ReactNode; newTab?: boolean };
}

export interface FeatureGridProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * list (default): two columns of rows, hairline above each, mono 01 index, no cards.
   * grid: 3–4 columns, a 1px top rule per item, optional small icon before the title.
   * tabs: feature titles on the start side, the selected one's image on the end side.
   * sticky-media: a sticky image on the start side swaps as the list scrolls (CSS view timelines).
   */
  variant?: FeatureGridVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** Header actions (≤ 2). */
  actions?: SiteCta[];
  items: FeatureItem[];
  /** Mono index numbers. Default: true for list, false otherwise. */
  numbered?: boolean;
  /** grid: column count on wide containers. Default 3. */
  columns?: 2 | 3 | 4;
  labels?: SiteBlockLabels;
}

const plain = (n: React.ReactNode) => (typeof n === "string" ? n : undefined);

/**
 * Services, treatments or product modules — without the card wall. Server component; the `tabs`
 * variant is a Radix Tabs island, `sticky-media` is CSS only.
 *
 * ```tsx
 * <FeatureGrid title="What we *build*" items={[{ title: "Restaurant sites", text: "Menus your staff can edit…" }]} />
 * ```
 */
export function FeatureGrid({
  variant = "list",
  eyebrow,
  title,
  lead,
  actions,
  items,
  numbered,
  columns = 3,
  id,
  theme,
  anchor,
  className,
  headingLevel = 2,
  labels,
  locale,
  components,
  editMode,
}: FeatureGridProps) {
  const { base, headingId } = useBlockIds(id, "features");
  // Two items never make a grid: fall back to the list.
  const v: FeatureGridVariant = variant === "grid" && items.length <= 2 ? "list" : variant;
  const showIndex = numbered ?? v === "list";
  const ItemTag = `h${Math.min(headingLevel + 1, 6)}` as "h3";
  const linkProps = { components, labels, locale };

  const itemTitle = (it: FeatureItem, i: number, cls?: string) => (
    <ItemTag className={cn("text-h3 font-semibold tracking-[-0.012em] text-fg text-balance", cls)} data-field={editMode ? `props.items.${i}.title` : undefined}>
      {it.link ? (
        <BlockLink href={it.link.href} newTab={it.link.newTab} {...linkProps} className="vb-stretched rounded-[2px] focus-ring">
          {it.title}
        </BlockLink>
      ) : (
        it.title
      )}
    </ItemTag>
  );
  const itemText = (it: FeatureItem, i: number, cls?: string) =>
    it.text ? (
      <p className={cn("text-body text-fg-muted text-pretty", cls)} data-field={editMode ? `props.items.${i}.text` : undefined}>
        {it.text}
      </p>
    ) : null;
  const more = (it: FeatureItem) =>
    it.link?.label ? (
      <span aria-hidden className="mt-auto inline-flex items-center gap-1.5 pt-2 text-small font-medium text-fg">
        {it.link.label}
        <ArrowEnd className="group-hover/fi:translate-x-0.5 rtl:group-hover/fi:-translate-x-0.5" />
      </span>
    ) : null;

  let body: React.ReactNode;
  if (v === "tabs") {
    body = (
      <>
        <FeatureTabs
          className="hidden @4xl:grid"
          label={plain(title)}
          items={items.map((it, i) => ({
            value: `f${i}`,
            title: it.title,
            text: it.text,
            panel: (
              <div className="flex flex-col gap-4">
                {it.media ? <BlockImage {...it.media} aspect="3:2" sizes="(min-width: 56rem) 55vw, 100vw" className="rounded-ui border border-line" components={components} labels={labels} /> : null}
                {it.link ? (
                  <BlockLink href={it.link.href} newTab={it.link.newTab} appearance="link" {...linkProps}>
                    {it.link.label ?? it.title}
                    <ArrowEnd />
                  </BlockLink>
                ) : null}
              </div>
            ),
          }))}
        />
        {/* Narrow containers: stacked, every feature visible (no hidden panels). */}
        <ol className="flex flex-col @4xl:hidden">
          {items.map((it, i) => (
            <li key={i} className="flex flex-col gap-3 border-t border-line py-6">
              {itemTitle(it, i)}
              {itemText(it, i)}
              {it.media ? <BlockImage {...it.media} aspect="3:2" sizes="100vw" className="mt-2 rounded-ui border border-line" components={components} labels={labels} /> : null}
            </li>
          ))}
        </ol>
      </>
    );
  } else if (v === "sticky-media") {
    const names = items.map((_, i) => `--vbf-${base.replace(/[^a-zA-Z0-9_-]/g, "")}-${i}`);
    body = (
      <div className="vb-sticky-features grid gap-x-(--gutter) @4xl:grid-cols-12" style={{ timelineScope: names.join(", ") } as React.CSSProperties}>
        <div className="vb-sticky-media" aria-hidden>
          <div className="sticky top-[calc(var(--vb-nav-h,4.5rem)+2rem)]">
            <div className="relative overflow-hidden rounded-ui">
              {items.map((it, i) =>
                it.media ? (
                  <BlockImage
                    key={i}
                    {...it.media}
                    decorative
                    aspect="4:5"
                    sizes="(min-width: 56rem) 45vw, 100vw"
                    className={cn("vb-sticky-frame", i > 0 && "absolute! inset-0")}
                    data-pos={i === 0 ? "first" : i === items.length - 1 ? "last" : undefined}
                    style={{ "--vbf-timeline": names[i], zIndex: i } as React.CSSProperties}
                    components={components}
                  />
                ) : null,
              )}
            </div>
          </div>
        </div>
        <ol className="vb-sticky-list flex flex-col">
          {items.map((it, i) => (
            <li key={i} className="vb-sticky-item flex min-h-[min(70svh,34rem)] flex-col justify-center gap-4 border-t border-line py-10" style={{ viewTimelineName: names[i] } as React.CSSProperties}>
              {it.media ? <BlockImage {...it.media} aspect="3:2" sizes="100vw" className="vb-sticky-inline mb-2 rounded-ui" components={components} labels={labels} /> : null}
              <span className="font-mono text-eyebrow tabular text-fg-subtle">{indexLabel(i)}</span>
              {itemTitle(it, i, "text-display-m font-display font-normal")}
              {itemText(it, i, "max-w-[46ch]")}
              {it.link ? (
                <BlockLink href={it.link.href} newTab={it.link.newTab} appearance="link" {...linkProps} className="mt-2">
                  {it.link.label ?? it.title}
                  <ArrowEnd />
                </BlockLink>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    );
  } else if (v === "grid") {
    body = (
      <ul className={cn("grid gap-x-(--gutter) gap-y-12 @2xl:grid-cols-2", columns >= 3 && "@4xl:grid-cols-3", columns === 4 && "@6xl:grid-cols-4", columns === 2 && "@4xl:grid-cols-2")}>
        {items.map((it, i) => (
          <li key={i} className={cn("group/fi relative flex flex-col gap-3 border-t border-line pt-4", it.link && "vb-linked")}>
            {it.media ? <BlockImage {...it.media} aspect="3:2" sizes="(min-width: 56rem) 30vw, 100vw" className="mb-2 rounded-ui" components={components} labels={labels} /> : null}
            <div className="flex items-start gap-3 pt-2">
              {showIndex ? <span className="pt-1.5 font-mono text-eyebrow tabular text-fg-subtle">{indexLabel(i)}</span> : null}
              {it.icon ? <SiteIcon icon={it.icon} className="mt-1" /> : null}
              {itemTitle(it, i)}
            </div>
            {itemText(it, i)}
            {more(it)}
          </li>
        ))}
      </ul>
    );
  } else {
    body = (
      <ol className="grid gap-x-(--gutter) @4xl:grid-cols-2">
        {items.map((it, i) => (
          <li key={i} className={cn("group/fi relative grid grid-cols-[3rem_1fr] gap-x-4 gap-y-3 border-t border-line py-7 @2xl:grid-cols-[4.5rem_1fr]", it.link && "vb-linked", !showIndex && "grid-cols-1!")}>
            {showIndex ? <span className="row-span-3 pt-1.5 font-mono text-eyebrow tabular text-fg-subtle">{indexLabel(i)}</span> : null}
            {itemTitle(it, i)}
            {itemText(it, i, "max-w-[52ch]")}
            {more(it)}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={base} blockType="features" editMode={editMode} components={components} labels={labels} className={cn("vb-features", className)} data-variant={v}>
      <Container className="flex flex-col gap-[calc(var(--section-y)*0.45)]">
        {title || eyebrow || lead ? (
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            lead={lead}
            align={lead ? "split" : "start"}
            headingLevel={headingLevel}
            headingId={headingId}
            editMode={editMode}
            labels={labels}
            locale={locale}
            actions={actions?.length ? actions.map((a, i) => (
              <BlockLink key={i} href={a.link.href} newTab={a.link.newTab} appearance={a.style ?? "link"} {...linkProps}>
                {a.link.label}
                {(a.style ?? "link") === "link" ? <ArrowEnd /> : null}
              </BlockLink>
            )) : undefined}
          />
        ) : null}
        <div className={v === "list" || v === "grid" ? "vb-reveal" : undefined}>{body}</div>
      </Container>
    </Section>
  );
}
