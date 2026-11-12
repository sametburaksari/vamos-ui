"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { ImagePlus, Play, Trash2 } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useContainerWidth } from "../lib/use-container-width";
import { IconButton } from "../components/button";
import { Image, aspectRatioOf, type ImageAspect } from "../components/image";
import { SortableGrid } from "../sortable";
import { Lightbox, LightboxTrigger, type LightboxProps } from "./lightbox";
import { toMediaSource } from "./media-provider";
import { justifyRows, masonryColumns, responsiveValue, type Responsive } from "./gallery-layout";
import type { MediaAsset, MediaItem } from "./types";

const galleryLabels = {
  list: "Gallery",
  enlarge: "Enlarge image: {alt}",
  enlargeUntitled: "Enlarge image {index}",
  remove: "Remove {name}",
  caption: "Caption for {name}",
  captionPlaceholder: "Add a caption",
  add: "Add images",
  addHint: "Pick from the library or drop files",
  loading: "Loading images",
  video: "Video",
};
export type GalleryLabels = typeof galleryLabels;

export const galleryVariants = /*#__PURE__*/ cva("vui-gallery @container/gallery min-w-0", {
  variants: {
    gap: { sm: "[--gallery-gap:0.375rem]", md: "[--gallery-gap:0.75rem]", lg: "[--gallery-gap:1.25rem]" },
  },
  defaultVariants: { gap: "md" },
});

export interface GalleryProps<T extends MediaItem = MediaItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAdd"> {
  items: T[];
  /** `grid` equal tiles · `masonry` columns by ratio · `justified` equal-height rows. */
  layout?: "grid" | "masonry" | "justified";
  /** Columns (grid, masonry), per container width: `{ base: 2, md: 3, lg: 4 }`. */
  columns?: Responsive<number>;
  /** Tile ratio (grid). Default `"1/1"`. */
  aspect?: ImageAspect;
  /** Target row height in px (justified). Default 220. */
  rowHeight?: number;
  captions?: "none" | "below" | "overlay";
  gap?: "sm" | "md" | "lg";
  rounded?: "none" | "ui" | "ui-lg";
  /** Open items in a Lightbox. Pass an object for Lightbox options (`download`, `info`…). */
  lightbox?: boolean | Omit<LightboxProps, "items" | "children">;
  /** `sizes` for each image. Default derived from the column count. */
  sizes?: string;
  /** Skeleton tiles that keep their ratio. */
  loading?: boolean;
  skeletonCount?: number;
  /** Edit mode: drag / keyboard reorder (+ Move menu), remove, caption. Uses the grid layout. */
  editable?: boolean;
  onReorder?: (ids: string[]) => void;
  onRemove?: (id: string) => void;
  onCaptionChange?: (id: string, caption: string) => void;
  /** "Add images" tile (e.g. opens the Media picker). */
  onAdd?: () => void;
  /** Accessible name of the list. */
  label?: string;
  labels?: Partial<GalleryLabels>;
}

const DEFAULT_COLUMNS: Responsive<number> = { base: 2, sm: 3, lg: 4 };

/**
 * Lays out an image collection as an even grid, masonry columns or justified rows, with an
 * optional Lightbox and an edit mode (reorder by drag or keyboard, a Move menu as the
 * non-drag alternative, remove, caption, add). Masonry and justified layouts are computed from
 * known ratios, so they are deterministic and SSR-safe.
 *
 * ```tsx
 * <Gallery items={photos} layout="masonry" columns={{ base: 2, md: 3 }} lightbox />
 * ```
 */
export function Gallery<T extends MediaItem = MediaItem>({
  items,
  layout = "grid",
  columns = DEFAULT_COLUMNS,
  aspect = "1/1",
  rowHeight = 220,
  captions = "none",
  gap = "md",
  rounded = "ui",
  lightbox = false,
  sizes,
  loading = false,
  skeletonCount = 6,
  editable = false,
  onReorder,
  onRemove,
  onCaptionChange,
  onAdd,
  label,
  labels,
  className,
  style,
  ...props
}: GalleryProps<T>) {
  const t = useLabels("gallery", galleryLabels, labels);
  const { locale } = useLocale();
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const sources = React.useMemo(() => items.map((it, i) => toMediaSource(it, i)), [items]);
  const ratios = sources.map((s) => (s.width && s.height ? s.width / s.height : 4 / 3));
  const cols = responsiveValue(columns, width, 3);
  const gapPx = gap === "sm" ? 6 : gap === "lg" ? 20 : 12;
  const autoSizes = sizes ?? `(min-width: 1024px) ${Math.round(100 / Math.max(1, cols))}vw, ${Math.round(100 / Math.min(2, cols))}vw`;
  const listLabel = label ?? t("list");
  const rad = rounded === "none" ? undefined : rounded;

  const colVars: Record<string, string> = {};
  const colAttrs: Record<string, string> = {};
  if (typeof columns === "number") colVars["--cols-base"] = String(columns);
  else
    for (const [bp, n] of Object.entries(columns)) {
      colVars[`--cols-${bp}`] = String(n);
      if (bp !== "base") colAttrs[`data-cols-${bp}`] = "";
    }

  const rootProps = {
    ref,
    "data-slot": "gallery",
    "data-layout": editable ? "grid" : layout,
    className: cn(galleryVariants({ gap }), className),
    style: { ...colVars, ...style } as React.CSSProperties,
    ...colAttrs,
    ...props,
  };

  /* --- loading ------------------------------------------------------ */
  if (loading) {
    const r = aspectRatioOf(aspect) ?? 1;
    return (
      <div {...rootProps} aria-busy="true" aria-label={t("loading")} role="status">
        <div className="vui-gallery-grid grid">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <span key={i} aria-hidden className={cn("ui-shimmer block bg-skeleton", rad === "ui" ? "rounded-ui" : rad === "ui-lg" ? "rounded-ui-lg" : "")} style={{ aspectRatio: String(layout === "grid" ? r : ratios[i % Math.max(1, ratios.length)] ?? [1, 0.75, 1.33][i % 3]) }} />
          ))}
        </div>
      </div>
    );
  }

  /* --- edit mode ---------------------------------------------------- */
  if (editable) {
    const addTile = onAdd ? (
      <button
        type="button"
        data-slot="gallery-add"
        onClick={onAdd}
        className={cn(
          "vui-gallery-add focus-ring group/add flex w-full flex-col items-center justify-center gap-1.5 border border-dashed border-field-border bg-surface-2 text-center transition-colors hover:border-field-border-hover hover:bg-hover",
          items.length === 0 ? "min-h-56 rounded-ui-lg p-8" : "mt-(--gallery-gap) min-h-14 rounded-ui px-4 py-3 sm:flex-row sm:gap-2.5",
        )}
      >
        <ImagePlus aria-hidden className={cn("text-fg-muted transition-colors group-hover/add:text-fg", items.length === 0 ? "size-7" : "size-[18px]")} strokeWidth={1.6} />
        <span className="text-sm font-medium text-fg">{t("add")}</span>
        {items.length === 0 ? <span className="text-[13px] text-fg-muted">{t("addHint")}</span> : null}
      </button>
    ) : null;
    return (
      <div {...rootProps}>
        {items.length ? (
          <SortableGrid
            aria-label={listLabel}
            items={sources}
            getId={(s) => s.id}
            getLabel={(s) => s.alt || s.caption || filenameOf(items, s.id) || s.id}
            onReorder={(next) => onReorder?.(next.map((s) => s.id))}
            disabled={!onReorder}
            handle
            // Honour `columns` while editing too: a fixed 10rem minimum fell back to one column on phones.
            minItemWidth={`calc((100% - ${(Math.max(1, cols) - 1) * gapPx}px) / ${Math.max(1, cols)} - 0.5px)`}
            className="gap-(--gallery-gap)"
            itemClassName="overflow-hidden"
            renderActions={
              onRemove
                ? (s) => (
                    <IconButton label={t("remove", { name: s.alt || filenameOf(items, s.id) || s.id })} size="xs" variant="ghost" className="bg-popover text-fg-muted shadow-sm hover:text-danger" onClick={() => onRemove(s.id)}>
                      <Trash2 />
                    </IconButton>
                  )
                : undefined
            }
            renderItem={(s) => (
              <div className="flex flex-col">
                <Image src={assetOf(items, s.id) ?? s.src} alt={s.alt} aspect={aspect} sizes="12rem" widths={[320, 480]} />
                {onCaptionChange ? (
                  <input
                    type="text"
                    defaultValue={s.caption ?? ""}
                    aria-label={t("caption", { name: s.alt || filenameOf(items, s.id) || s.id })}
                    placeholder={t("captionPlaceholder")}
                    onPointerDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    onBlur={(e) => {
                      if (e.currentTarget.value !== (s.caption ?? "")) onCaptionChange(s.id, e.currentTarget.value);
                    }}
                    className="focus-ring w-full border-t border-line bg-transparent px-2.5 py-2 text-[13px] text-fg placeholder:text-fg-subtle focus-visible:outline-offset-[-2px]"
                  />
                ) : null}
              </div>
            )}
          />
        ) : null}
        {addTile}
      </div>
    );
  }

  if (items.length === 0) return null;

  /* --- view mode ---------------------------------------------------- */
  const tile = (i: number, box: { aspect?: ImageAspect; style?: React.CSSProperties; className?: string } = {}) => {
    const s = sources[i]!;
    // Video tiles show their poster (an <img> can't render the video file) with a play mark.
    const isVideo = s.kind === "video";
    const media = (
      <Image
        src={isVideo ? (s.poster ?? "") : (assetOf(items, s.id) ?? s.src)}
        alt={lightbox ? "" : s.alt}
        width={s.width}
        height={s.height}
        aspect={box.aspect ?? (layout === "grid" ? aspect : "auto")}
        focal={s.focalPoint}
        blurDataURL={s.placeholder}
        sizes={autoSizes}
        rounded={rad}
        className="vui-gallery-media w-full"
      />
    );
    const playMark = isVideo ? (
      <span aria-hidden className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <span className="dark grid size-11 place-items-center rounded-full bg-[color-mix(in_oklch,var(--scene)_62%,transparent)] text-fg backdrop-blur-sm">
          <Play className="ms-0.5 size-4 fill-current" />
        </span>
      </span>
    ) : null;
    const overlay =
      captions === "overlay" && s.caption ? (
        <span aria-hidden={lightbox ? true : undefined} className="vui-gallery-overlay dark pointer-events-none absolute inset-x-0 bottom-0 z-10 rounded-b-[inherit] px-3 pt-8 pb-2.5 text-start text-[13px] leading-snug text-fg">
          {s.caption}
        </span>
      ) : null;
    const figureBody = lightbox ? (
      <LightboxTrigger
        index={i}
        className={cn("vui-gallery-trigger group/tile relative block w-full overflow-hidden", rad === "ui" ? "rounded-ui" : rad === "ui-lg" ? "rounded-ui-lg" : "")}
      >
        {/* Text content, not aria-label: a visible caption overlay must not contradict the name (WCAG 2.5.3). */}
        <span className="sr-only">{s.alt ? t("enlarge", { alt: s.alt }) : t("enlargeUntitled", { index: nf.format(i + 1) })}</span>
        {media}
        {playMark}
        {overlay}
      </LightboxTrigger>
    ) : (
      <div className={cn("relative overflow-hidden", rad === "ui" ? "rounded-ui" : rad === "ui-lg" ? "rounded-ui-lg" : "")}>
        {media}
        {playMark}
        {overlay}
      </div>
    );
    return (
      <li key={s.id} data-slot="gallery-item" className={cn("min-w-0", box.className)} style={box.style}>
        <figure className="m-0">
          {figureBody}
          {captions === "below" && s.caption ? <figcaption className="mt-2 text-[13px] leading-snug text-pretty text-fg-muted">{s.caption}</figcaption> : null}
          {captions === "overlay" && s.caption && !lightbox ? <figcaption className="sr-only">{s.caption}</figcaption> : null}
        </figure>
      </li>
    );
  };

  let body: React.ReactNode;
  if (layout === "masonry") {
    const groups = masonryColumns(ratios, cols);
    body = (
      <div className="vui-gallery-masonry flex items-start gap-(--gallery-gap)" data-columns={cols}>
        {groups.map((g, c) => (
          <ul key={c} role="list" aria-label={c === 0 ? listLabel : undefined} className="flex min-w-0 flex-1 flex-col gap-(--gallery-gap)">
            {g.map((i) => tile(i))}
          </ul>
        ))}
      </div>
    );
  } else if (layout === "justified") {
    if (width) {
      const rows = justifyRows(ratios, width, rowHeight, gapPx);
      body = (
        <ul role="list" aria-label={listLabel} className="vui-gallery-justified flex flex-wrap gap-(--gallery-gap)">
          {rows.flatMap((row) => row.items.map((i) => tile(i, { aspect: ratios[i], style: { width: Math.floor(ratios[i]! * row.height * 100) / 100, flex: "none" } })))}
        </ul>
      );
    } else {
      // Before measuring (SSR): proportional flex rows — same look, no JS.
      body = (
        <ul role="list" aria-label={listLabel} className="vui-gallery-justified-css flex flex-wrap gap-(--gallery-gap)">
          {sources.map((_, i) => tile(i, { aspect: ratios[i], style: { flex: `${ratios[i]} 1 ${ratios[i]! * rowHeight}px` } }))}
        </ul>
      );
    }
  } else {
    body = (
      <ul role="list" aria-label={listLabel} className="vui-gallery-grid grid">
        {sources.map((_, i) => tile(i))}
      </ul>
    );
  }

  const content = <div {...rootProps}>{body}</div>;
  if (!lightbox) return content;
  const lbProps = typeof lightbox === "object" ? lightbox : {};
  return (
    <Lightbox items={items} {...lbProps}>
      {content}
    </Lightbox>
  );
}

function assetOf(items: MediaItem[], id: string): MediaAsset | undefined {
  const it = items.find((x) => "mime" in x && (x as MediaAsset).id === id);
  return it as MediaAsset | undefined;
}
function filenameOf(items: MediaItem[], id: string): string | undefined {
  return assetOf(items, id)?.filename;
}
