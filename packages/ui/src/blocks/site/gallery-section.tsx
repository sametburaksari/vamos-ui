import * as React from "react";
import { cn2 as cn } from "./shared/kit-2";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { BlockImage, type ImageAspect } from "../block-image";
import { LightboxTrigger } from "../../media/lightbox";
import type { BlockBaseProps } from "../types";
import { site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { textOf, useBlockIds2, type SiteImage2 } from "./shared/kit-2";
import { GalleryLightbox } from "./shared/gallery-lightbox";
import { Stagger } from "../../motion/reveal";

export type GalleryVariant = "mosaic" | "filmstrip" | "grid" | "split-caption";
export type GallerySpan = "1" | "wide" | "tall" | "big";

export interface GalleryImage {
  image: SiteImage2 & { alt: string };
  caption?: React.ReactNode;
  /** mosaic cell: 1 (4 cols) · wide (8 cols) · tall (4 cols, 2 rows) · big (8 cols, 2 rows). */
  span?: GallerySpan;
}

export interface GallerySectionProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * mosaic: a 12-column grid with author-chosen spans — irregular but aligned. filmstrip: one
   * horizontally scrolling row, equal heights, overflowing the end edge. grid: equal cells at a
   * fixed ratio with small captions. split-caption: sticky title beside a vertical image stream.
   */
  variant?: GalleryVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** 3–40 images, `alt` required. */
  images: GalleryImage[];
  /** Open images in a full-screen viewer. Default true. */
  lightbox?: boolean;
  /** Cell ratio for `grid` (and `mosaic` fallback). Default `"3:2"`. */
  aspect?: "mixed" | "3:2" | "1:1" | "4:5";
  labels?: Site2BlockLabels;
}

/**
 * Venue, food and project photos — the section restaurants, spas and hotels live on. Server
 * grid; the lightbox is the Media group's viewer (focus trap, Esc, arrows, "Image 3 of 12"),
 * loaded as an island only when `lightbox` is on.
 *
 * ```tsx
 * <GallerySection variant="mosaic" title="The *room*" images={[{ image: { src, alt, width, height }, span: "big" }, …]} />
 * ```
 */
export function GallerySection({
  variant: variantProp = "mosaic",
  eyebrow,
  title,
  lead,
  images,
  lightbox = true,
  aspect = "3:2",
  id,
  anchor,
  theme,
  headingLevel = 2,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: GallerySectionProps) {
  const t = site2Text(labels, locale);
  const { headingId } = useBlockIds2(id, "gallery");
  const variant: GalleryVariant = variantProp === "mosaic" && images.length < 5 ? "grid" : variantProp;
  const ctx: Ctx = { t, locale, components, editMode, lightbox, total: images.length };
  const header = title || eyebrow || lead ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} editMode={editMode} labels={labels} locale={locale} /> : null;

  let body: React.ReactNode;
  if (variant === "filmstrip") {
    body = (
      <div className="flex flex-col gap-4">
        <ul className="vb-filmstrip scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1" tabIndex={0} aria-label={textOf(title).replace(/\*/g, "") || t("galleryImages", { count: images.length })}>
          {images.map((g, i) => (
            <li key={i} className="shrink-0 snap-start">
              <Cell g={g} i={i} ctx={ctx} className="h-[clamp(15rem,38cqi,30rem)]" style={{ aspectRatio: g.image.width && g.image.height ? `${g.image.width} / ${g.image.height}` : "4 / 5" }} sizes="(min-width: 56rem) 40vw, 80vw" fill />
            </li>
          ))}
        </ul>
        <p className="vb-container font-mono text-eyebrow tabular uppercase tracking-[0.08em] text-fg-muted">{t("galleryImages", { count: images.length })}</p>
      </div>
    );
  } else if (variant === "mosaic") {
    body = (
      <Stagger asChild effect="clip" disabled={editMode}>
        <ul className="vb-mosaic grid grid-cols-2 gap-2 @2xl:grid-cols-12">
          {images.map((g, i) => (
            <li key={i} data-span={g.span ?? "1"} className="vb-mosaic-cell min-h-0">
              <Cell g={g} i={i} ctx={ctx} className="size-full" sizes="(min-width: 42rem) 66vw, 100vw" fill />
            </li>
          ))}
        </ul>
      </Stagger>
    );
  } else if (variant === "split-caption") {
    body = null;
  } else {
    const a: ImageAspect | undefined = aspect === "mixed" ? undefined : aspect;
    body = (
      <Stagger asChild disabled={editMode}>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 @4xl:grid-cols-3 @4xl:gap-x-4">
          {images.map((g, i) => (
            <li key={i}>
              <figure className="flex flex-col gap-2.5">
                <Cell g={g} i={i} ctx={ctx} aspect={a ?? "3:2"} sizes="(min-width: 56rem) 33vw, 50vw" />
                {g.caption ? <figcaption className="text-small text-fg-muted">{g.caption}</figcaption> : null}
              </figure>
            </li>
          ))}
        </ul>
      </Stagger>
    );
  }

  const content =
    variant === "split-caption" ? (
      <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12">
        <div className="@4xl:col-span-4">
          <div className="flex flex-col gap-6 @4xl:sticky @4xl:top-[calc(var(--topbar-h,0px)+2rem)]">{header}</div>
        </div>
        <ol className="flex flex-col gap-12 @4xl:col-span-7 @4xl:col-start-6">
          {images.map((g, i) => (
            <li key={i}>
              <figure className="flex flex-col gap-4">
                <Cell g={g} i={i} ctx={ctx} sizes="(min-width: 56rem) 58vw, 100vw" />
                {g.caption ? (
                  <figcaption className="flex gap-4 text-small text-fg-muted text-pretty">
                    <span aria-hidden className="font-mono text-eyebrow tabular text-fg-subtle">
                      {t("imageCounter", { index: i + 1, total: images.length })}
                    </span>
                    <span>{g.caption}</span>
                  </figcaption>
                ) : null}
              </figure>
            </li>
          ))}
        </ol>
      </Container>
    ) : (
      <>
        {header ? <Container>{header}</Container> : null}
        {variant === "filmstrip" ? <div className="vb-filmstrip-wrap">{body}</div> : <Container>{body}</Container>}
      </>
    );

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="gallery" editMode={editMode} className={cn("vb-gallery", className)} data-variant={variant}>
      <div className="flex flex-col gap-10 @4xl:gap-14">
        {lightbox ? (
          <GalleryLightbox items={images.map((g) => ({ src: g.image.src, alt: g.image.alt, width: g.image.width, height: g.image.height, caption: textOf(g.caption) || undefined, focalPoint: g.image.focal }))}>{content}</GalleryLightbox>
        ) : (
          content
        )}
      </div>
    </Section>
  );
}

interface Ctx {
  t: Site2Text;
  locale: string;
  components?: BlockBaseProps["components"];
  editMode?: boolean;
  lightbox: boolean;
  total: number;
}

function Cell({ g, i, ctx, className, style, sizes, aspect, fill }: { g: GalleryImage; i: number; ctx: Ctx; className?: string; style?: React.CSSProperties; sizes: string; aspect?: ImageAspect; fill?: boolean }) {
  const img = (
    <BlockImage
      {...g.image}
      aspect={aspect}
      sizes={sizes}
      className={cn("vb-gallery-img rounded-ui-sm", fill && "size-full", !ctx.lightbox && className)}
      style={!ctx.lightbox ? style : undefined}
      components={ctx.components}
      editMode={ctx.editMode}
      field={`props.images.${i}.image`}
    />
  );
  if (!ctx.lightbox) return img;
  return (
    <LightboxTrigger index={i} aria-label={ctx.t("openImage", { index: i + 1, total: ctx.total })} className={cn("vb-gallery-trigger group/img block rounded-ui-sm", className)} style={style}>
      {img}
    </LightboxTrigger>
  );
}

