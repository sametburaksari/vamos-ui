"use client";

import * as React from "react";
import { Dialog as DialogPrimitive, Slot } from "radix-ui";
import { Download, ImageOff, Info, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { Layer } from "../lib/layer";
import { usePortalContainer } from "../lib/theme-scope";
import { useControllableState } from "../lib/use-controllable-state";
import { IconButton } from "../components/button";
import { Spinner } from "../components/spinner";
import { Carousel, CarouselSlide, CarouselThumbs, CarouselViewport } from "../components/carousel";
import { isMediaAsset, toMediaSource } from "./media-provider";
import { usePanZoom } from "./use-pan-zoom";
import { VideoPlayer } from "./video-player";
import type { MediaAsset, MediaItem } from "./types";

const lightboxLabels = {
  viewer: "Image viewer",
  counter: "Image {index} of {total}",
  counterCaption: "Image {index} of {total}: {caption}",
  close: "Close viewer",
  previous: "Previous image",
  next: "Next image",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetZoom: "Reset zoom",
  download: "Download",
  info: "File details",
  error: "This image could not be loaded.",
  filename: "File name",
  dimensions: "Dimensions",
  size: "Size",
  type: "Type",
  uploaded: "Uploaded",
  uploadedBy: "Uploaded by",
  alt: "Alt text",
  noAlt: "Missing alt text",
  decorative: "Decorative (no alt text)",
};
export type LightboxLabels = typeof lightboxLabels;

interface LightboxContextValue {
  open: (index?: number) => void;
  close: () => void;
  isOpen: boolean;
  index: number;
}
const LightboxContext = React.createContext<LightboxContextValue | null>(null);

/** Open / close the surrounding `Lightbox` from custom triggers. */
export function useLightbox(): LightboxContextValue {
  const ctx = React.useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used inside <Lightbox>.");
  return ctx;
}

export interface LightboxProps {
  items: MediaItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Pinch / wheel / double-tap / +−0 zoom. Default `true` (max 3×). */
  zoom?: boolean | { max?: number };
  /** Thumbnail strip at the bottom. Default `true` with more than one item. */
  thumbnails?: boolean;
  /** Download button (original file). */
  download?: boolean;
  /** File-details side panel toggle (admin). Uses `MediaAsset` fields. */
  info?: boolean;
  /** Wrap around at the ends. Default `true`. */
  loop?: boolean;
  /** `solid` (default) the scene at 96% · `dim` the overlay colour · `blur` overlay + blur. */
  backdrop?: "solid" | "dim" | "blur";
  /** `minimal` hides caption and thumbnails. */
  chrome?: "minimal" | "full";
  labels?: Partial<LightboxLabels>;
  /** Triggers and the gallery that opens the viewer. */
  children?: React.ReactNode;
}

/**
 * Full-screen viewer for images and video: swipe / arrows to navigate, pinch / wheel / double-tap
 * zoom with pan, thumbnails, captions and an optional file-details panel. Dialog pattern (focus
 * trap, Esc, focus returns). Keys: ←/→ navigate, Home/End, + / − / 0 zoom.
 *
 * ```tsx
 * <Lightbox items={photos} download>
 *   {photos.map((p, i) => <LightboxTrigger key={p.id} index={i}><Image src={p} alt={p.alt} aspect="1/1" /></LightboxTrigger>)}
 * </Lightbox>
 * ```
 */
export function Lightbox({
  items,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  zoom = true,
  thumbnails,
  download = false,
  info = false,
  loop = true,
  backdrop = "solid",
  chrome = "full",
  labels,
  children,
}: LightboxProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange, name: "Lightbox" });
  const [index, setIndex] = useControllableState({ value: indexProp, defaultValue: defaultIndex, onChange: onIndexChange, name: "Lightbox" });
  const returnFocus = React.useRef<HTMLElement | null>(null);
  const ctx = React.useMemo<LightboxContextValue>(
    () => ({
      open: (i) => {
        returnFocus.current = typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
        if (i !== undefined) setIndex(i);
        setOpen(true);
      },
      close: () => setOpen(false),
      isOpen: open,
      index,
    }),
    [open, index, setIndex, setOpen],
  );
  return (
    <LightboxContext.Provider value={ctx}>
      {children}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <LightboxViewer
            items={items}
            index={Math.min(Math.max(0, index), Math.max(0, items.length - 1))}
            setIndex={setIndex}
            zoom={zoom}
            thumbnails={thumbnails ?? items.length > 1}
            download={download}
            info={info}
            loop={loop}
            backdrop={backdrop}
            chrome={chrome}
            labels={labels}
            returnFocus={returnFocus}
          />
      </DialogPrimitive.Root>
    </LightboxContext.Provider>
  );
}

export interface LightboxTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Item to open. */
  index: number;
  asChild?: boolean;
}

/** Opens the surrounding Lightbox at `index`. Renders a button (or the child with `asChild`). */
export const LightboxTrigger = React.forwardRef<HTMLButtonElement, LightboxTriggerProps>(function LightboxTrigger({ index, asChild, onClick, className, type, ...props }, ref) {
  const lb = useLightbox();
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type ?? "button"}
      data-slot="lightbox-trigger"
      aria-haspopup="dialog"
      className={cn(!asChild && "focus-ring block cursor-zoom-in rounded-[inherit]", className)}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) lb.open(index);
      }}
      {...props}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Viewer                                                               */
/* ------------------------------------------------------------------ */

interface ViewerProps extends Required<Pick<LightboxProps, "zoom" | "thumbnails" | "download" | "info" | "loop" | "backdrop" | "chrome">> {
  items: MediaItem[];
  index: number;
  setIndex: (i: number) => void;
  labels?: Partial<LightboxLabels>;
  returnFocus: React.RefObject<HTMLElement | null>;
}

function LightboxViewer({ items, index, setIndex, zoom, thumbnails, download, info, loop, backdrop, chrome, labels, returnFocus }: ViewerProps) {
  const t = useLabels("lightbox", lightboxLabels, labels);
  const { dir, locale } = useLocale();
  const container = usePortalContainer();
  const sources = React.useMemo(() => items.map((it, i) => toMediaSource(it, i)), [items]);
  const current = sources[index];
  const currentAsset = isMediaAsset(items[index]) ? (items[index] as MediaAsset) : undefined;
  const zoomMax = typeof zoom === "object" ? zoom.max ?? 3 : 3;
  const canZoom = zoom !== false && current?.kind === "image";
  const pz = usePanZoom({ max: zoomMax, disabled: !canZoom });
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [loaded, setLoaded] = React.useState<Record<string, "loaded" | "error">>({});
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const pct = React.useMemo(() => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }), [locale]);

  const { reset } = pz;
  React.useEffect(() => reset(), [index, reset]);

  const go = (d: number) => {
    const n = sources.length;
    if (n < 2) return;
    const next = index + d;
    setIndex(loop ? (next + n) % n : Math.min(n - 1, Math.max(0, next)));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, [role=slider], [data-slot=video-player]")) return;
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    if (e.key === back) go(-1);
    else if (e.key === fwd) go(1);
    else if (e.key === "Home") setIndex(0);
    else if (e.key === "End") setIndex(sources.length - 1);
    else if (canZoom && (e.key === "+" || e.key === "=")) pz.zoomIn();
    else if (canZoom && e.key === "-") pz.zoomOut();
    else if (canZoom && e.key === "0") pz.reset();
    else return;
    e.preventDefault();
  };

  const counterText = current
    ? current.caption || current.alt
      ? t("counterCaption", { index: nf.format(index + 1), total: nf.format(sources.length), caption: current.caption || current.alt })
      : t("counter", { index: nf.format(index + 1), total: nf.format(sources.length) })
    : "";
  const darkChrome = backdrop !== "solid";
  const toolBtn = "text-fg-muted hover:text-fg";

  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Overlay data-slot="lightbox-overlay" data-backdrop={backdrop} data-overlay-blurred={backdrop === "blur" ? "" : undefined} className="vui-lightbox-overlay ui-fade fixed inset-0 z-(--z-overlay)" />
      <Layer asChild>
        <DialogPrimitive.Content
          data-slot="lightbox"
          data-backdrop={backdrop}
          aria-label={t("viewer")}
          aria-describedby={undefined}
          onKeyDown={onKeyDown}
          onCloseAutoFocus={(e) => {
            const el = returnFocus.current;
            if (el && el.isConnected) {
              e.preventDefault();
              el.focus();
            }
          }}
          onOpenAutoFocus={(e) => {
            const close = (e.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>("[data-autofocus]");
            if (close) {
              e.preventDefault();
              close.focus();
            }
          }}
          className={cn("vui-lightbox ui-fade fixed inset-0 z-(--z-overlay) flex flex-col text-fg outline-none", darkChrome && "dark")}
        >
          <DialogPrimitive.Title className="sr-only">{t("viewer")}</DialogPrimitive.Title>

          <div data-slot="lightbox-toolbar" className="relative z-20 flex items-center gap-2 px-3 pt-3 sm:px-4">
            <p aria-live="polite" aria-atomic className="tabular min-w-0 flex-1 truncate ps-1 text-[13px] text-fg-muted">
              <span className="sr-only">{counterText}</span>
              <span aria-hidden>
                <span className="font-medium text-fg">{nf.format(index + 1)}</span>
                <span className="mx-1 text-fg-subtle">/</span>
                {nf.format(sources.length)}
                {currentAsset?.filename ? <span className="ms-3 hidden text-fg-subtle sm:inline">{currentAsset.filename}</span> : null}
              </span>
            </p>
            <div className="surface-popover flex items-center gap-0.5 rounded-full p-1">
              {canZoom ? (
                <>
                  <IconButton label={t("zoomOut")} tooltip={false} size="sm" className={cn("rounded-full!", toolBtn)} disabled={!pz.canZoomOut} onClick={pz.zoomOut}>
                    <ZoomOut />
                  </IconButton>
                  <button type="button" onClick={pz.reset} aria-label={t("resetZoom")} className="focus-ring tabular h-8 min-w-12 rounded-full px-1.5 text-[12px] font-medium text-fg-muted hover:bg-hover hover:text-fg">
                    {pct.format(pz.scale)}
                  </button>
                  <IconButton label={t("zoomIn")} tooltip={false} size="sm" className={cn("rounded-full!", toolBtn)} disabled={!pz.canZoomIn} onClick={pz.zoomIn}>
                    <ZoomIn />
                  </IconButton>
                  <span aria-hidden className="mx-1 h-4 w-px bg-line" />
                </>
              ) : null}
              {download && current ? (
                <IconButton asChild label={t("download")} tooltip={false} size="sm" className={cn("rounded-full!", toolBtn)}>
                  <a href={current.src} download={currentAsset?.filename ?? ""} target="_blank" rel="noopener noreferrer">
                    <Download />
                  </a>
                </IconButton>
              ) : null}
              {info ? (
                <IconButton label={t("info")} tooltip={false} size="sm" aria-pressed={infoOpen} className={cn("rounded-full!", toolBtn, infoOpen && "bg-selected text-fg")} onClick={() => setInfoOpen((o) => !o)}>
                  <Info />
                </IconButton>
              ) : null}
              <DialogPrimitive.Close asChild>
                <IconButton label={t("close")} tooltip={false} size="sm" className={cn("rounded-full!", toolBtn)} data-autofocus>
                  <X />
                </IconButton>
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <Carousel
              label={t("viewer")}
              index={index}
              onIndexChange={setIndex}
              loop={loop && sources.length > 1}
              gap="none"
              controls="inside"
              options={{ watchDrag: !pz.zoomed && sources.length > 1 }}
              className="flex min-h-0 min-w-0 flex-1 flex-col"
              labels={{ previous: t("previous"), next: t("next") }}
            >
              <CarouselViewport className="h-full" containerClassName="h-full" arrows={sources.length > 1}>
                {sources.map((s, i) => (
                  <CarouselSlide key={s.id} className="h-full">
                    {s.kind === "video" ? (
                      <div className="flex h-full items-center justify-center p-4 sm:px-16 sm:py-8">
                        <div className="w-full" style={{ maxWidth: `calc((100dvh - 12rem) * ${(s.width && s.height ? s.width / s.height : 16 / 9).toFixed(4)})` }}>
                          {Math.abs(i - index) <= 1 ? (
                            <VideoPlayer src={s.src} poster={s.poster} title={s.caption || s.alt} aspect={s.width && s.height ? s.width / s.height : "16/9"} />
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div
                        data-slot="lightbox-stage"
                        className="relative flex h-full items-center justify-center overflow-hidden p-3 sm:px-16 sm:py-6"
                        {...(i === index ? pz.bind : null)}
                      >
                        {s.placeholder && loaded[s.id] !== "loaded" ? (
                          <img aria-hidden alt="" src={s.placeholder} className="vui-image-blur pointer-events-none absolute inset-6 m-auto max-h-[calc(100%-3rem)] max-w-[calc(100%-3rem)] object-contain" />
                        ) : null}
                        {loaded[s.id] === "error" ? (
                          <div role="img" aria-label={s.alt || t("error")} className="flex flex-col items-center gap-2 text-sm text-fg-muted">
                            <ImageOff aria-hidden className="size-7" strokeWidth={1.5} />
                            {t("error")}
                          </div>
                        ) : Math.abs(i - index) <= 1 || (loop && Math.abs(i - index) === sources.length - 1) ? (
                          <img
                            src={s.src}
                            alt={s.alt}
                            width={s.width}
                            height={s.height}
                            draggable={false}
                            decoding="async"
                            onLoad={() => setLoaded((m) => ({ ...m, [s.id]: "loaded" }))}
                            onError={() => setLoaded((m) => ({ ...m, [s.id]: "error" }))}
                            className={cn("vui-lightbox-img relative max-h-full max-w-full object-contain select-none", loaded[s.id] === "loaded" ? "opacity-100" : "opacity-0")}
                            style={i === index && canZoom ? pz.style : undefined}
                          />
                        ) : null}
                        {!loaded[s.id] && i === index ? <Spinner size="md" className="absolute text-fg-muted" /> : null}
                      </div>
                    )}
                  </CarouselSlide>
                ))}
              </CarouselViewport>

              {chrome === "full" ? (
                <div className="flex flex-none flex-col items-center gap-1 px-4 pb-3">
                  {current?.caption ? (
                    <p data-slot="lightbox-caption" className="max-w-[68ch] text-center text-[13.5px] leading-relaxed text-pretty text-fg-muted">
                      {current.caption}
                    </p>
                  ) : null}
                  {thumbnails ? <CarouselThumbs aspect={1} items={sources.map((s) => ({ src: s.kind === "video" ? s.poster ?? "" : s.src, alt: s.alt }))} align="center" className="mt-1 w-full" /> : null}
                </div>
              ) : null}
            </Carousel>

            {info && infoOpen && currentAsset ? <LightboxInfo asset={currentAsset} labels={labels} /> : null}
          </div>
        </DialogPrimitive.Content>
      </Layer>
    </DialogPrimitive.Portal>
  );
}

function LightboxInfo({ asset, labels }: { asset: MediaAsset; labels?: Partial<LightboxLabels> }) {
  const t = useLabels("lightbox", lightboxLabels, labels);
  const f = useFormat();
  const rows: [string, React.ReactNode][] = [
    [t("filename"), <span className="break-all">{asset.filename}</span>],
    [t("type"), asset.mime],
    [t("size"), f.bytes(asset.size)],
  ];
  if (asset.width && asset.height) rows.push([t("dimensions"), `${f.number(asset.width)} × ${f.number(asset.height)}`]);
  rows.push([t("uploaded"), f.date(asset.createdAt, "medium")]);
  if (asset.uploadedBy) rows.push([t("uploadedBy"), asset.uploadedBy.name]);
  return (
    <aside data-slot="lightbox-info" aria-label={t("info")} className="surface-popover m-3 ms-0 hidden w-80 flex-none flex-col gap-5 overflow-y-auto rounded-ui-lg p-5 md:flex">
      <div>
        <p className="text-[11px] font-medium tracking-[0.08em] text-fg-subtle uppercase">{t("alt")}</p>
        <p className={cn("mt-1.5 text-[13.5px] leading-relaxed", asset.alt ? "text-fg" : "text-warning")}>{asset.alt || (asset.alt === "" ? t("decorative") : t("noAlt"))}</p>
      </div>
      {asset.description ? <p className="text-[13.5px] leading-relaxed text-fg-muted">{asset.description}</p> : null}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 border-t border-line pt-4 text-[13px]">
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-fg-subtle">{k}</dt>
            <dd className="tabular text-end text-fg">{v}</dd>
          </React.Fragment>
        ))}
      </dl>
    </aside>
  );
}
