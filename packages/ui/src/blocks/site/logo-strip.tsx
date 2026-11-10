import * as React from "react";
import { cn } from "../../lib/cn";
import { Container, Section } from "../section";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import { siteText, useBlockIds, type SiteBlockLabels, type SiteImage } from "./_kit-1";

export type LogoStripVariant = "row" | "marquee" | "grid";

export interface LogoItem {
  /** Brand name — the logo's alt text. */
  name: string;
  image: SiteImage;
  /** Used inside dark sections / dark mode instead of `invert()`. */
  imageDark?: SiteImage;
  link?: { href: string; newTab?: boolean };
}

export interface LogoStripProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * row: caption at the start, logos on one line at an equal optical height (28px).
   * marquee: an endless band with faded edges; pauses on hover/focus; static under reduced motion.
   * grid: 4–6 columns separated by 1px gridlines, logos centred in cells.
   */
  variant?: LogoStripVariant;
  /** "120+ businesses since 2014". */
  caption?: React.ReactNode;
  logos: LogoItem[];
  /** Greyscale at 70% opacity, full colour on hover. Default true. */
  monochrome?: boolean;
  /** grid: columns on wide containers. Default 5. */
  columns?: 4 | 5 | 6;
  /** marquee: seconds for one loop. Default 40. */
  speed?: number;
  labels?: SiteBlockLabels;
}

/**
 * "Brands we work with" proof. Server component; the marquee is CSS keyframes (paused on
 * hover, focus and reduced motion; the duplicate copy is `aria-hidden`).
 *
 * ```tsx
 * <LogoStrip caption="Trusted by 120+ businesses since 2014" logos={[{ name: "Kıyı", image: { src, width, height } }]} />
 * ```
 */
export function LogoStrip({ variant = "row", caption, logos, monochrome = true, columns = 5, speed = 40, id, theme, anchor, className, labels, locale, components, editMode }: LogoStripProps) {
  const { base, headingId } = useBlockIds(id, "logos");
  const t = siteText(labels, locale);
  const marquee = variant === "marquee" && logos.length >= 4;

  const logo = (l: LogoItem, i: number, hidden?: boolean) => {
    const img = (
      <>
        <BlockImage {...l.image} alt={hidden ? undefined : l.name} decorative={hidden} fit="contain" className={cn("vb-logo", l.imageDark && "vb-logo-light")} components={components} />
        {l.imageDark ? <BlockImage {...l.imageDark} decorative fit="contain" className="vb-logo vb-logo-dark" components={components} /> : null}
      </>
    );
    const inner =
      l.link && !hidden ? (
        <BlockLink href={l.link.href} newTab={l.link.newTab} components={components} labels={labels} locale={locale} className="flex items-center rounded-[2px] focus-ring">
          {img}
        </BlockLink>
      ) : (
        img
      );
    return (
      <li key={`${hidden ? "d" : "l"}${i}`} aria-hidden={hidden || undefined} data-dup={hidden ? "" : undefined} className="vb-logo-item flex shrink-0 items-center justify-center" data-field={editMode && !hidden ? `props.logos.${i}` : undefined}>
        {inner}
      </li>
    );
  };

  const captionEl = caption ? (
    <p id={headingId} className={cn("text-small text-fg-muted text-pretty", variant === "row" && "max-w-[26ch] shrink-0")} data-field={editMode ? "props.caption" : undefined}>
      {caption}
    </p>
  ) : null;

  return (
    <Section
      theme={theme}
      anchor={anchor}
      headingId={caption ? headingId : undefined}
      aria-label={caption ? undefined : t("logos")}
      blockId={base}
      blockType="logo-strip"
      editMode={editMode}
      className={cn("vb-logos", className)}
      data-variant={marquee ? "marquee" : variant === "marquee" ? "row" : variant}
      data-mono={monochrome ? "" : undefined}
    >
      {marquee ? (
        <div className="flex flex-col gap-8">
          {captionEl ? <Container>{captionEl}</Container> : null}
          <div className="vb-marquee" style={{ "--vb-marquee-duration": `${speed}s` } as React.CSSProperties}>
            <ul className="vb-marquee-track">
              {logos.map((l, i) => logo(l, i))}
              {logos.map((l, i) => logo(l, i, true))}
            </ul>
          </div>
        </div>
      ) : variant === "grid" ? (
        <Container className="flex flex-col gap-8">
          {captionEl}
          <ul className={cn("vb-logo-grid grid grid-cols-2 @2xl:grid-cols-3", columns === 4 && "@4xl:grid-cols-4", columns === 5 && "@4xl:grid-cols-5", columns === 6 && "@4xl:grid-cols-4 @6xl:grid-cols-6")}>
            {logos.map((l, i) => logo(l, i))}
          </ul>
        </Container>
      ) : (
        <Container className="flex flex-col gap-8 @4xl:flex-row @4xl:items-center @4xl:gap-(--gutter)">
          {captionEl}
          <ul className="flex flex-1 flex-wrap items-center gap-x-[clamp(2rem,5cqi,4rem)] gap-y-6">{logos.map((l, i) => logo(l, i))}</ul>
        </Container>
      )}
    </Section>
  );
}
