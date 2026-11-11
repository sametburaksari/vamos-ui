import * as React from "react";
import { ImageOff } from "lucide-react";
import { cn } from "../lib/cn";
import { blockText, type BlockLabels } from "./labels";
import type { BlockAdapters } from "./types";

export type ImageAspect = "1:1" | "4:5" | "3:4" | "4:3" | "3:2" | "2:3" | "16:9" | "21:9" | number;

const ratioOf = (a: ImageAspect | undefined, w?: number, h?: number): string | undefined => {
  if (a === undefined) return undefined;
  if (typeof a === "number") return String(a);
  const [x, y] = a.split(":").map(Number);
  return x && y ? `${x} / ${y}` : w && h ? `${w} / ${h}` : undefined;
};

export interface BlockImageProps {
  src?: string;
  /** Required unless `decorative`. */
  alt?: string;
  /** Intrinsic size — prevents layout shift. */
  width?: number;
  height?: number;
  /** The image only decorates: rendered with `alt=""`. */
  decorative?: boolean;
  /** Crop into a fixed ratio (cover). Without it the image keeps its own ratio. */
  aspect?: ImageAspect;
  fit?: "cover" | "contain";
  /** 0..1 focal point → object-position. */
  focal?: { x: number; y: number };
  /** Tiny data-URL placeholder painted under the image. */
  blurDataURL?: string;
  /** Responsive `sizes`, e.g. `"(min-width: 72rem) 50vw, 100vw"`. */
  sizes?: string;
  /** Above the fold: eager + `fetchpriority="high"`. */
  priority?: boolean;
  /** Wraps the image in `<figure>` with this caption. */
  caption?: React.ReactNode;
  /** Classes for the frame (radius, width). */
  className?: string;
  /** Classes for the `<img>` itself. */
  imgClassName?: string;
  style?: React.CSSProperties;
  components?: BlockAdapters;
  labels?: Partial<BlockLabels>;
  locale?: string;
  /** Builder canvas: an empty `src` renders an "Add an image" placeholder. */
  editMode?: boolean;
  /** Prop path for edit mode (`data-field`). */
  field?: string;
}

/**
 * Images for site blocks: intrinsic size (no CLS), fixed-ratio crops by focal point, blur
 * placeholder, priority hint, `sizes`, and the app's own `<Image>` via `components.Image`.
 * Server component.
 *
 * ```tsx
 * <BlockImage src="/dining-room.jpg" alt="The dining room at dusk" width={2400} height={1600} aspect="4:5" focal={{ x: 0.4, y: 0.5 }} />
 * ```
 */
export function BlockImage({
  src,
  alt,
  width,
  height,
  decorative,
  aspect,
  fit = "cover",
  focal,
  blurDataURL,
  sizes,
  priority,
  caption,
  className,
  imgClassName,
  style,
  components,
  labels,
  locale,
  editMode,
  field,
}: BlockImageProps) {
  const ratio = ratioOf(aspect, width, height);
  const fieldAttr = editMode && field ? { "data-field": field } : undefined;

  if (!src) {
    if (!editMode) return null;
    const t = blockText(labels, locale);
    return (
      <span data-empty="" className={cn("vb-image gap-2 rounded-ui text-small", className)} style={{ aspectRatio: ratio ?? "3 / 2", ...style }} {...fieldAttr}>
        <ImageOff aria-hidden className="size-5" strokeWidth={1.5} />
        <span>{t("addImage")}</span>
      </span>
    );
  }

  if (!decorative && !alt && process.env.NODE_ENV !== "production") {
    console.warn(`[vamos-ui] BlockImage: "${src}" has no alt text. Describe it, or pass decorative.`);
  }

  const frameStyle = {
    ...(ratio ? { aspectRatio: ratio } : null),
    ...(focal ? { "--vb-focal": `${(focal.x * 100).toFixed(1)}% ${(focal.y * 100).toFixed(1)}%` } : null),
    ...(fit !== "cover" ? { "--vb-fit": fit } : null),
    ...(blurDataURL ? { backgroundImage: `url("${blurDataURL}")` } : null),
    ...style,
  } as React.CSSProperties;
  const altText = decorative ? "" : (alt ?? "");
  const Img = components?.Image;
  const img = Img ? (
    <Img src={src} alt={altText} width={ratio ? undefined : width} height={ratio ? undefined : height} fill={ratio ? true : undefined} sizes={sizes} priority={priority} className={imgClassName} />
  ) : (
    <img
      src={src}
      alt={altText}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      className={imgClassName}
    />
  );

  const frame = (
    <span data-ratio={ratio ? "" : undefined} className={cn("vb-image", caption ? undefined : className)} style={frameStyle} {...(caption ? null : fieldAttr)}>
      {img}
    </span>
  );
  if (!caption) return frame;
  return (
    <figure className={cn("vb-figure", className)} {...fieldAttr}>
      {frame}
      <figcaption className="text-small text-fg-muted">{caption}</figcaption>
    </figure>
  );
}
