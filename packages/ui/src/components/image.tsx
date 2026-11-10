"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ImageOff } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { DefaultImage, useImage, useMediaAdapter } from "../lib/provider";
import { useComposedRefs } from "../lib/compose-refs";
import { useIsomorphicLayoutEffect } from "../lib/use-controllable-state";
import type { CropRect, ImageLoader, MediaAdapter, MediaAsset } from "../media/types";
import { Spinner } from "./spinner";

/* ------------------------------------------------------------------ */
/* Helpers (pure)                                                       */
/* ------------------------------------------------------------------ */

export type ImageAspect = "auto" | "1/1" | "4/3" | "3/2" | "16/9" | "21/9" | "4/5" | "1.91/1" | number;

/** Default `srcset` steps. */
export const IMAGE_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600, 1920];

/** `"16/9"` → 1.777…, `1.5` → 1.5, `"auto"` → the intrinsic ratio (or `undefined`). */
export function aspectRatioOf(aspect: ImageAspect | undefined, width?: number, height?: number): number | undefined {
  if (typeof aspect === "number") return aspect > 0 ? aspect : undefined;
  if (aspect && aspect !== "auto") {
    const [w, h] = aspect.split("/").map(Number);
    if (w && h) return w / h;
  }
  return width && height ? width / height : undefined;
}

/** Focal point (0..1) → CSS `object-position`. Image space: never mirrored in RTL. */
export function focalToObjectPosition(focal?: { x: number; y: number } | null): string | undefined {
  if (!focal) return undefined;
  const pct = (n: number) => `${Math.round(Math.min(1, Math.max(0, n)) * 1000) / 10}%`;
  return `${pct(focal.x)} ${pct(focal.y)}`;
}

const isAsset = (src: unknown): src is MediaAsset => typeof src === "object" && src !== null && "url" in src && "id" in src;

export interface ImageSourcesOptions {
  /** `sizes` attribute, e.g. `"(min-width: 1024px) 50vw, 100vw"`. */
  sizes?: string;
  widths?: number[];
  loader?: ImageLoader;
  quality?: number;
  focal?: { x: number; y: number };
  crop?: string | CropRect;
  format?: "auto" | "webp" | "avif";
}

export interface ImageSources {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/** Builds `src` / `srcSet` / `sizes` for an asset or URL (pure; usable on the server). */
export function getImageSources(source: string | MediaAsset, options: ImageSourcesOptions = {}): ImageSources {
  const { loader, widths = IMAGE_WIDTHS, quality, focal, format, sizes } = options;
  const url = typeof source === "string" ? source : source.url;
  const crop = typeof options.crop === "string" ? (isAsset(source) ? source.crops?.[options.crop] : undefined) : options.crop;
  if (loader) {
    const max = isAsset(source) && source.width ? source.width : Infinity;
    const steps = widths.filter((w) => w <= max);
    const list = steps.length ? steps : [Math.min(widths[0] ?? 640, max)];
    const srcSet = list.map((w) => `${loader({ src: url, width: w, quality, focal, crop, format })} ${w}w`).join(", ");
    const fallbackWidth = list[Math.min(list.length - 1, Math.floor(list.length / 2))]!;
    return { src: loader({ src: url, width: fallbackWidth, quality, focal, crop, format }), srcSet, sizes: sizes ?? "100vw" };
  }
  if (isAsset(source) && source.variants) {
    const variants = Object.values(source.variants).sort((a, b) => a.width - b.width);
    if (variants.length) {
      const srcSet = [...variants.map((v) => `${v.url} ${v.width}w`), ...(source.width ? [`${source.url} ${source.width}w`] : [])].join(", ");
      return { src: url, srcSet, sizes: sizes ?? "100vw" };
    }
  }
  return { src: url, sizes };
}

/* ------------------------------------------------------------------ */
/* Loader context                                                       */
/* ------------------------------------------------------------------ */

const ImageLoaderContext = React.createContext<ImageLoader | undefined>(undefined);

/**
 * Sets the image loader for every kit `Image` below (CDN URL builder). Same signature as the
 * Next.js loader. The media adapter's `loader` is used when no provider sets one.
 *
 * ```tsx
 * <ImageLoaderProvider loader={({ src, width, quality }) => `https://cdn.example.com/cdn-cgi/image/width=${width},quality=${quality ?? 75},format=auto/${src}`}>
 * ```
 */
export function ImageLoaderProvider({ loader, children }: { loader: ImageLoader | undefined; children: React.ReactNode }) {
  return <ImageLoaderContext.Provider value={loader}>{children}</ImageLoaderContext.Provider>;
}

/** The active loader: `ImageLoaderProvider` → media adapter `loader` → none. */
export function useImageLoader(): ImageLoader | undefined {
  const fromContext = React.useContext(ImageLoaderContext);
  const adapter = useMediaAdapter<MediaAdapter>();
  return fromContext ?? adapter?.loader;
}

/** `getImageSources` with the provider's loader. */
export function useImageSources(source: string | MediaAsset, options: ImageSourcesOptions = {}): ImageSources {
  const ctxLoader = useImageLoader();
  const loader = options.loader ?? ctxLoader;
  const cropKey = typeof options.crop === "object" ? JSON.stringify(options.crop) : options.crop;
  const widthsKey = options.widths?.join(",");
  return React.useMemo(
    () => getImageSources(source, { ...options, loader }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source, loader, options.sizes, widthsKey, options.quality, options.focal?.x, options.focal?.y, cropKey, options.format],
  );
}

/* ------------------------------------------------------------------ */
/* Image                                                                */
/* ------------------------------------------------------------------ */

export const imageVariants = cva("vui-image relative isolate block max-w-full overflow-hidden bg-skeleton", {
  variants: {
    rounded: { none: "", ui: "rounded-ui", "ui-lg": "rounded-ui-lg", full: "rounded-full" },
    fit: { cover: "", contain: "" },
    /** `surface`: a hairline `--surface-border` frame drawn above the image. */
    frame: { none: "", surface: "vui-image-framed" },
  },
  defaultVariants: { rounded: "none", fit: "cover", frame: "none" },
});

const imageLabels = { processing: "Processing", error: "Image could not be loaded" };
export type ImageLabels = typeof imageLabels;

export type ImagePlaceholder = "blur" | "color" | "skeleton" | "none";

export interface ImageBaseProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "placeholder" | "width" | "height" | "alt">,
    Omit<VariantProps<typeof imageVariants>, "fit"> {
  width?: number;
  height?: number;
  /** Box ratio. `"auto"` (default) uses the intrinsic width/height. */
  aspect?: ImageAspect;
  fit?: "cover" | "contain";
  /** 0..1 → `object-position`. Defaults to the asset's `focalPoint`. */
  focal?: { x: number; y: number };
  /** Named crop from `asset.crops`, or a rect. Applied by the loader. */
  crop?: string | CropRect;
  sizes?: string;
  /** `srcset` steps (with a loader). */
  widths?: number[];
  quality?: number;
  /** Above the fold: eager loading + `fetchpriority="high"`. */
  priority?: boolean;
  /** While loading. Default: `blur` with a blur source, `color` with a dominant colour, else `skeleton`. */
  placeholder?: ImagePlaceholder;
  /** Tiny blurred preview (LQIP data URL or a small URL). Defaults to `asset.placeholder`. */
  blurDataURL?: string;
  /** Placeholder colour. Defaults to `asset.dominantColor`. */
  color?: string;
  /** Overrides the provider loader. */
  loader?: ImageLoader;
  /** Rendered instead of the broken-image icon. */
  fallback?: React.ReactNode;
  /** Show the "Processing" badge (defaults to `asset.status === "processing"`). */
  processing?: boolean;
  /** Class of the wrapper; `className` goes to the wrapper too, `imgClassName` to the `<img>`. */
  imgClassName?: string;
  labels?: Partial<ImageLabels>;
}

/**
 * `src` is a URL (then `alt` is required; `""` marks the image decorative) or a `MediaAsset`
 * (supplies alt, size, focal point, placeholder and variants; `alt` overrides per use).
 */
export type ImageProps = ImageBaseProps & ({ src: string | MediaAsset; alt: string } | { src: MediaAsset; alt?: string });

const FILENAME_ALT = /(^(img|dsc|pxl|screenshot)[-_ ]?\d+)|\.(jpe?g|png|gif|webp|avif|heic|svg|tiff?)$/i;

/**
 * The image primitive: no layout shift (width/height + `aspect-ratio`), focal point →
 * `object-position`, LQIP / colour / skeleton placeholder that cross-fades out, `srcset` from the
 * loader or asset variants. Framework-agnostic: a plain `<img>`, or the app's `Image` from
 * `VamosProvider` (e.g. `next/image`).
 *
 * ```tsx
 * <Image src={asset} alt="Lobby of the Kadıköy office" aspect="16/9" sizes="(min-width: 1024px) 50vw, 100vw" rounded="ui" />
 * ```
 */
export const Image = React.forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src: source,
    alt: altProp,
    width: widthProp,
    height: heightProp,
    aspect = "auto",
    fit = "cover",
    focal: focalProp,
    crop,
    sizes,
    widths,
    quality,
    priority,
    placeholder: placeholderProp,
    blurDataURL,
    color: colorProp,
    loader,
    fallback,
    processing: processingProp,
    rounded,
    frame,
    className,
    imgClassName,
    style,
    labels,
    onLoad,
    onError,
    loading,
    decoding,
    ...props
  },
  forwardedRef,
) {
  const t = useLabels("image", imageLabels, labels);
  const Bridge = useImage();
  const asset = isAsset(source) ? source : undefined;
  const alt = altProp ?? asset?.alt ?? "";
  const width = widthProp ?? asset?.width;
  const height = heightProp ?? asset?.height;
  const focal = focalProp ?? asset?.focalPoint;
  const blur = blurDataURL ?? asset?.placeholder;
  const color = colorProp ?? asset?.dominantColor;
  const processing = processingProp ?? asset?.status === "processing";
  const placeholder: ImagePlaceholder = placeholderProp ?? (blur ? "blur" : color ? "color" : "skeleton");
  const ratio = aspectRatioOf(aspect, width, height);
  const sources = useImageSources(source, { sizes, widths, loader, quality, focal, crop });

  const [state, setState] = React.useState<"loading" | "loaded" | "error">("loading");
  const imgRef = React.useRef<HTMLImageElement>(null);
  const ref = useComposedRefs(forwardedRef, imgRef);

  // Reset on a new source; catch images that finished before hydration attached onLoad.
  useIsomorphicLayoutEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setState("loaded");
    // A broken image that errored before hydration never fires onError again.
    else if (img?.complete && img.getAttribute("src")) setState("error");
    else setState("loading");
  }, [sources.src]);

  if (process.env.NODE_ENV !== "production" && alt && FILENAME_ALT.test(alt.trim())) {
    console.warn(`Image: alt text "${alt}" looks like a file name. Describe the image instead, or pass alt="" if it is decorative.`);
  }

  const objectPosition = focalToObjectPosition(focal);
  const positioned = ratio !== undefined;
  const imgClasses = cn(
    "vui-image-img block",
    positioned ? "absolute inset-0 size-full" : "h-auto w-full",
    fit === "contain" ? "object-contain" : "object-cover",
    imgClassName,
  );
  const imgStyle: React.CSSProperties = { objectPosition };
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setState("loaded");
    onLoad?.(e);
  };
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setState("error");
    onError?.(e);
  };
  const a11y = alt === "" ? ({ role: "presentation" } as const) : null;

  const img =
    Bridge !== DefaultImage ? (
      <Bridge
        ref={ref}
        src={sources.src}
        alt={alt}
        {...(positioned ? { fill: true } : { width, height })}
        sizes={sources.sizes}
        priority={priority}
        quality={quality}
        className={imgClasses}
        style={imgStyle}
        onLoad={handleLoad}
        onError={handleError}
        {...a11y}
        {...props}
      />
    ) : (
      <img
        ref={ref}
        src={sources.src}
        srcSet={sources.srcSet}
        sizes={sources.sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading ?? (priority ? "eager" : "lazy")}
        decoding={decoding ?? "async"}
        fetchPriority={priority ? "high" : undefined}
        className={imgClasses}
        style={imgStyle}
        onLoad={handleLoad}
        onError={handleError}
        {...a11y}
        {...props}
      />
    );

  return (
    <span
      data-slot="image"
      data-state={state}
      data-placeholder={placeholder}
      className={cn(imageVariants({ rounded, frame }), placeholder === "none" && "bg-transparent", className)}
      style={{
        ...(positioned ? { aspectRatio: String(ratio) } : null),
        ...(placeholder === "color" && color ? { backgroundColor: color } : null),
        ...style,
      }}
    >
      {placeholder === "blur" && blur && state !== "error" ? (
        <img aria-hidden alt="" src={blur} data-slot="image-blur" className="vui-image-blur pointer-events-none absolute inset-0 size-full object-cover" style={imgStyle} />
      ) : null}
      {placeholder === "skeleton" && state === "loading" ? <span aria-hidden data-slot="image-skeleton" className="ui-shimmer absolute inset-0" /> : null}
      {state === "error" ? (
        fallback ? (
          <span data-slot="image-fallback" className={cn(positioned ? "absolute inset-0" : "block min-h-24", "flex items-center justify-center")}>
            {fallback}
          </span>
        ) : (
          <span
            data-slot="image-fallback"
            {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
            title={t("error")}
            className={cn(positioned ? "absolute inset-0" : "block min-h-24", "flex items-center justify-center text-fg-subtle [&_svg]:size-6")}
          >
            <ImageOff aria-hidden strokeWidth={1.5} />
          </span>
        )
      ) : (
        img
      )}
      {processing ? (
        <span data-slot="image-processing" className="surface-popover absolute start-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium">
          <Spinner size="xs" tone="accent" />
          {t("processing")}
        </span>
      ) : null}
    </span>
  );
});

/* ------------------------------------------------------------------ */
/* Figure                                                               */
/* ------------------------------------------------------------------ */

export interface FigureProps extends React.HTMLAttributes<HTMLElement> {
  /** Spacing between media and caption. */
  gap?: "sm" | "md";
}

/** `<figure>` for a captioned image (blocks, galleries, articles). */
export const Figure = React.forwardRef<HTMLElement, FigureProps>(function Figure({ gap = "sm", className, ...props }, ref) {
  return <figure ref={ref} data-slot="figure" className={cn("m-0 flex flex-col", gap === "sm" ? "gap-2" : "gap-3", className)} {...props} />;
});

export interface FigureCaptionProps extends React.HTMLAttributes<HTMLElement> {
  /** Small print line, e.g. photo credit. */
  credit?: React.ReactNode;
}

/** `<figcaption>`: caption text plus an optional credit. */
export const FigureCaption = React.forwardRef<HTMLElement, FigureCaptionProps>(function FigureCaption({ credit, className, children, ...props }, ref) {
  return (
    <figcaption ref={ref} data-slot="figure-caption" className={cn("text-[13px] leading-relaxed text-pretty text-fg-muted", className)} {...props}>
      {children}
      {credit ? <span className="ms-2 text-[11.5px] tracking-wide text-fg-subtle uppercase">{credit}</span> : null}
    </figcaption>
  );
});
