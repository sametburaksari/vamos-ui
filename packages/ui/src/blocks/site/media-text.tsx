import * as React from "react";
import { Play } from "lucide-react";
import { cn } from "../../lib/cn";
import { Container, Section } from "../section";
import { SectionHeader } from "../section-header";
import { BlockImage, type ImageAspect } from "../block-image";
import { RichText } from "../rich-text";
import type { BlockBaseProps } from "../types";
import type { RichDoc } from "../schema/rich-doc";
import { EmbedFacade } from "./embed-facade";
import { CtaList, siteText, useBlockIds, type SiteBlockLabels, type SiteCta, type SiteImage } from "./_kit-1";
import { Reveal } from "../../motion/reveal";
import { columnSizes } from "./shared/image-sizes";

export type MediaTextVariant = "side" | "overlap" | "bleed";

export interface MediaTextVideo {
  provider: "youtube" | "vimeo" | "mp4";
  url: string;
  /** Accessible title ("A morning in our kitchen"). Default: the block title. */
  title?: string;
}

export interface MediaTextProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * side: 5/7 or 7/5, text top-aligned with the image (not centred).
   * overlap: the image takes 8 columns, a surface panel overlaps its bottom corner by 2.
   * bleed: the image runs to the section edge, the text stays inside the container.
   */
  variant?: MediaTextVariant;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body?: RichDoc | string;
  /** Short points with accent dashes (≤ 6). */
  bullets?: React.ReactNode[];
  cta?: SiteCta;
  /**
   * The image (also the video poster). `sizes`: side `(min-width: 56rem) min(42vw, 32rem), 100vw` ·
   * overlap `min(67vw, 51rem)` · bleed `59vw` (runs to the section edge); 100vw on narrow screens.
   */
  media: SiteImage;
  /** Static preview → plays only after a click (YouTube via youtube-nocookie). */
  video?: MediaTextVideo;
  /** Logical side of the image. Default `"start"`. */
  mediaSide?: "start" | "end";
  /** Crop ratio. Default `"4:5"`. */
  aspect?: "4:5" | "3:2" | "1:1";
  labels?: SiteBlockLabels;
}

/** Embed URL for a video facade (YouTube → youtube-nocookie, Vimeo → player). */
export function videoEmbedUrl(v: MediaTextVideo): string {
  if (v.provider === "youtube") {
    const id = /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{6,})/.exec(v.url)?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : v.url;
  }
  if (v.provider === "vimeo") {
    const id = /vimeo\.com\/(?:video\/)?(\d+)/.exec(v.url)?.[1];
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` : v.url;
  }
  return v.url;
}

const textOf = (n: React.ReactNode) => (typeof n === "string" ? n.replace(/\*/g, "") : "");

/**
 * The most used body section: an image or video beside text. Server component; a video is a
 * click-to-load facade island (no third-party request before the visitor asks).
 *
 * ```tsx
 * <MediaText eyebrow="The kitchen" title="Fish from the *morning* boats" body="…" media={{ src, alt, width, height }} />
 * ```
 */
export function MediaText({
  variant = "side",
  eyebrow,
  title,
  body,
  bullets,
  cta,
  media,
  video,
  mediaSide = "start",
  aspect = "4:5",
  id,
  theme,
  anchor,
  className,
  headingLevel = 2,
  labels,
  locale,
  components,
  editMode,
}: MediaTextProps) {
  const t = siteText(labels, locale);
  const { base, headingId } = useBlockIds(id, "media-text");
  const end = mediaSide === "end";
  const ratio: ImageAspect = variant === "overlap" ? "3:2" : aspect;

  const image = (sizes: string, cls?: string) => {
    const img = <BlockImage {...media} aspect={ratio} sizes={sizes} className={cn("size-full", cls)} components={components} labels={labels} locale={locale} editMode={editMode} field="props.media" />;
    if (!video) return img;
    const vTitle = video.title ?? textOf(title);
    return (
      <div className={cn("relative overflow-hidden", cls)} style={{ aspectRatio: ratio.replace(":", " / ") }}>
        <EmbedFacade kind={video.provider === "mp4" ? "video" : "iframe"} src={videoEmbedUrl(video)} title={vTitle || t("video")} buttonLabel={t("playVideo", { title: vTitle || t("video") })}>
          <BlockImage {...media} alt={undefined} decorative aspect={ratio} sizes={sizes} className="size-full" components={components} />
          <span aria-hidden className="vb-play absolute inset-0 grid place-items-center">
            <span className="inline-flex size-16 items-center justify-center rounded-full bg-scene text-fg transition-colors duration-200 group-hover/facade:bg-accent group-hover/facade:text-accent-fg">
              <Play strokeWidth={1.5} className="ms-0.5 size-6" />
            </span>
          </span>
        </EmbedFacade>
      </div>
    );
  };

  const text = (
    <div className="flex flex-col gap-7">
      <SectionHeader eyebrow={eyebrow} title={title} headingLevel={headingLevel} headingId={headingId} editMode={editMode} labels={labels} locale={locale} />
      {body ? <RichText doc={body} components={components} labels={labels} locale={locale} headingOffset={1} editMode={editMode} field="props.body" className="text-fg-muted" /> : null}
      {bullets?.length ? (
        <ul className="flex flex-col border-t border-line" data-field={editMode ? "props.bullets" : undefined}>
          {bullets.slice(0, 6).map((b, i) => (
            <li key={i} className="flex gap-4 border-b border-line py-3 text-body text-fg">
              <span aria-hidden className="mt-[0.8em] h-px w-4 shrink-0 bg-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {cta ? <CtaList actions={[cta]} components={components} labels={labels} locale={locale} max={1} editMode={editMode} /> : null}
    </div>
  );

  let content: React.ReactNode;
  if (variant === "overlap") {
    content = (
      <Container className="grid gap-y-0 @4xl:grid-cols-12 @4xl:pb-[calc(var(--section-y)*0.4)]">
        <div className={cn("@4xl:col-span-8 @4xl:row-start-1", end && "@4xl:col-start-5")}>{image(columnSizes(8 / 12), "rounded-ui")}</div>
        <div
          className={cn(
            "vb-overlap-panel surface relative -mt-12 mx-[clamp(0.75rem,3cqi,1.5rem)] rounded-ui p-[clamp(1.5rem,4cqi,3rem)] @4xl:row-start-1 @4xl:mx-0 @4xl:mt-0 @4xl:self-end @4xl:translate-y-[calc(var(--section-y)*0.35)]",
            end ? "@4xl:col-span-6 @4xl:col-start-1" : "@4xl:col-span-6 @4xl:col-start-7",
          )}
        >
          {text}
        </div>
      </Container>
    );
  } else if (variant === "bleed") {
    content = (
      <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12 @4xl:items-start">
        <div className={cn("@4xl:col-span-7", end ? "vb-bleed-end @4xl:order-2 @4xl:col-start-6" : "vb-bleed-start")}>{image(columnSizes(7 / 12, { bleed: true }))}</div>
        <div className={cn("@4xl:col-span-4 @4xl:pt-4", end ? "@4xl:order-1 @4xl:col-start-1" : "@4xl:col-start-9")}>{text}</div>
      </Container>
    );
  } else {
    content = (
      <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12 @4xl:items-start">
        <div className={cn("@4xl:col-span-5", end && "@4xl:order-2 @4xl:col-start-8")}>{image(columnSizes(5 / 12), "rounded-ui")}</div>
        <div className={cn("@4xl:col-span-6", end ? "@4xl:order-1 @4xl:col-start-1" : "@4xl:col-start-7")}>{text}</div>
      </Container>
    );
  }

  return (
    <Section theme={theme} anchor={anchor} headingId={headingId} blockId={base} blockType="media-text" editMode={editMode} className={cn("vb-media-text", variant === "overlap" && "vb-media-overlap", className)} data-variant={variant} data-side={mediaSide}>
      <Reveal disabled={editMode}>{content}</Reveal>
    </Section>
  );
}
