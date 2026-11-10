"use client";

import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { cva } from "class-variance-authority";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Pause, Play } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { useControllableState, useIsomorphicLayoutEffect } from "../lib/use-controllable-state";
import { IconButton } from "./button";
import { Skeleton } from "./skeleton";

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;
export type CarouselApi = EmblaApi;
export type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;
export type CarouselPlugin = NonNullable<Parameters<typeof useEmblaCarousel>[1]>[number];

const carouselLabels = {
  carousel: "carousel",
  slide: "slide",
  slideOf: "{index} of {total}",
  previous: "Previous slide",
  next: "Next slide",
  goTo: "Go to slide {index}",
  pause: "Pause autoplay",
  play: "Start autoplay",
  counter: "Slide {index} of {total}",
  dots: "Choose slide",
  thumbs: "Slide thumbnails",
  empty: "Nothing to show yet",
  loading: "Loading slides",
};
export type CarouselLabels = typeof carouselLabels;

export type CarouselPreset = "default" | "gallery" | "hero" | "strip";
type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";

/* ------------------------------------------------------------------ */
/* Context                                                              */
/* ------------------------------------------------------------------ */

interface CarouselContextValue {
  api: EmblaApi | undefined;
  viewportRef: (node: HTMLElement | null) => void;
  index: number;
  /** Snap points (dots). */
  count: number;
  /** Slides rendered. */
  slideCount: number;
  setSlideCount: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
  playing: boolean;
  autoplay: boolean;
  inView: Set<number> | null;
  preset: CarouselPreset;
  controls: "inside" | "outside" | "hidden";
  orientation: "horizontal" | "vertical";
  transition: "slide" | "fade";
  loading: boolean;
  t: ReturnType<typeof useLabels<CarouselLabels>>;
  nf: Intl.NumberFormat;
  scrollTo: (i: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  play: () => void;
  pause: () => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarouselContext(part: string): CarouselContextValue {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) throw new Error(`${part} must be used inside <Carousel>.`);
  return ctx;
}

/**
 * State and commands of the surrounding carousel, for custom controls.
 *
 * ```tsx
 * const { index, count, scrollTo, playing } = useCarousel();
 * ```
 */
export function useCarousel() {
  const c = useCarouselContext("useCarousel");
  return {
    api: c.api,
    index: c.index,
    count: c.count,
    canPrev: c.canPrev,
    canNext: c.canNext,
    playing: c.playing,
    scrollTo: c.scrollTo,
    scrollPrev: c.scrollPrev,
    scrollNext: c.scrollNext,
    play: c.play,
    pause: c.pause,
    toggle: c.playing ? c.pause : c.play,
  };
}

/* ------------------------------------------------------------------ */
/* Root                                                                 */
/* ------------------------------------------------------------------ */

export const carouselVariants = cva("vui-carousel relative min-w-0", {
  variants: {
    preset: {
      default: "",
      /** Thumbnail strip below. */
      gallery: "",
      /** Full-bleed, glass arrows inside, dots over the bottom edge. */
      hero: "vui-carousel-hero overflow-hidden",
      /** Arrows outside, faded edges. */
      strip: "vui-carousel-strip",
    },
    controls: {
      inside: "",
      outside: "vui-carousel-outside",
      hidden: "",
    },
  },
  defaultVariants: { preset: "default", controls: "outside" },
});

export interface CarouselAutoplayOptions {
  /** ms per slide. Default 6000. */
  delay?: number;
  /** Stop for good after a manual swipe or arrow click. Default `false` (resume after). */
  stopOnInteraction?: boolean;
}

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, "dir"> {
  /** Required accessible name: "Featured listings", "Customer stories". */
  label: string;
  preset?: CarouselPreset;
  orientation?: "horizontal" | "vertical";
  /** Slides visible at once, or per breakpoint (`{ base: 1, md: 2, lg: 3 }`), or `"auto"` (slide sets its width). */
  slidesPerView?: number | "auto" | Partial<Record<Breakpoint, number>>;
  /** Space between slides, from `--gap`. */
  gap?: "none" | "sm" | "md" | "lg";
  loop?: boolean;
  align?: "start" | "center";
  /** `fade` cross-fades (one slide per view). Reduced motion: instant. */
  transition?: "slide" | "fade";
  /** Advance on a timer. A pause button is always rendered; off under reduced motion. */
  autoplay?: boolean | CarouselAutoplayOptions;
  /** Arrow placement. Default: `inside` for hero / gallery, `outside` otherwise. */
  controls?: "inside" | "outside" | "hidden";
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** First slide shows a skeleton. */
  loading?: boolean;
  /** Escape hatch: raw engine options / plugins. */
  options?: CarouselOptions;
  plugins?: CarouselPlugin[];
  /** Receives the engine API once ready. */
  setApi?: (api: CarouselApi | undefined) => void;
  labels?: Partial<CarouselLabels>;
}

const GAP: Record<NonNullable<CarouselProps["gap"]>, string> = {
  none: "0px",
  sm: "calc(var(--gap) * 0.5)",
  md: "calc(var(--gap) * 0.8)",
  lg: "var(--gap)",
};

/**
 * One scrolling core for panels and websites: card sliders, hero slider, gallery with thumbnails,
 * KPI strip. WAI-ARIA carousel pattern, arrows / Home / End when focus is inside, a mandatory
 * pause button with autoplay, `inert` off-screen slides, RTL-aware.
 *
 * ```tsx
 * <Carousel label="Featured stays" slidesPerView={{ base: 1, md: 2, lg: 3 }}>
 *   <CarouselViewport>
 *     {stays.map((s) => <CarouselSlide key={s.id}>…</CarouselSlide>)}
 *   </CarouselViewport>
 *   <CarouselDots />
 * </Carousel>
 * ```
 */
export const Carousel = React.forwardRef<HTMLElement, CarouselProps>(function Carousel(
  {
    label,
    preset = "default",
    orientation = "horizontal",
    slidesPerView,
    gap = "md",
    loop = false,
    align = "start",
    transition = "slide",
    autoplay = false,
    controls: controlsProp,
    index: indexProp,
    defaultIndex = 0,
    onIndexChange,
    loading = false,
    options,
    plugins: extraPlugins,
    setApi,
    labels,
    className,
    style,
    onKeyDown,
    children,
    ...props
  },
  ref,
) {
  const t = useLabels("carousel", carouselLabels, labels);
  const { dir, locale } = useLocale();
  const reduced = useReducedMotion();
  const controls = controlsProp ?? (preset === "hero" || preset === "gallery" ? "inside" : "outside");
  const fade = transition === "fade" && !reduced;
  const autoplayOn = Boolean(autoplay) && !reduced;
  const autoplayOpts = typeof autoplay === "object" ? autoplay : {};
  const delay = autoplayOpts.delay ?? 6000;
  const stopOnInteraction = autoplayOpts.stopOnInteraction ?? false;

  const [index, setIndex] = useControllableState({ value: indexProp, defaultValue: defaultIndex, onChange: onIndexChange, name: "Carousel" });
  const [snapCount, setSnapCount] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplayOn);
  const [inView, setInView] = React.useState<Set<number> | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const plugins = React.useMemo(() => {
    const list: CarouselPlugin[] = [];
    if (fade) list.push(Fade());
    if (autoplayOn) list.push(Autoplay({ delay, stopOnInteraction, stopOnMouseEnter: true, stopOnFocusIn: true, playOnInit: true }));
    return [...list, ...(extraPlugins ?? [])];
  }, [fade, autoplayOn, delay, stopOnInteraction, extraPlugins]);

  const [viewportRef, api] = useEmblaCarousel(
    {
      loop,
      align: fade ? "center" : align,
      axis: orientation === "vertical" ? "y" : "x",
      direction: orientation === "horizontal" ? dir : "ltr",
      startIndex: indexProp ?? defaultIndex,
      containScroll: loop ? false : "trimSnaps",
      watchDrag: slideCount > 1,
      duration: 28,
      ...options,
    },
    plugins,
  );

  const count = api ? snapCount : slideCount;
  React.useEffect(() => setApi?.(api), [api, setApi]);

  const indexRef = React.useRef(index);
  indexRef.current = index;

  React.useEffect(() => {
    if (!api) return;
    const sync = () => {
      const i = api.selectedScrollSnap();
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
      if (i !== indexRef.current) setIndex(i);
    };
    const view = () => setInView(new Set(fade ? [api.selectedScrollSnap()] : api.slidesInView()));
    const down = () => setDragging(true);
    const up = () => setDragging(false);
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    sync();
    view();
    setSnapCount(api.scrollSnapList().length);
    const reinit = () => {
      setSnapCount(api.scrollSnapList().length);
      sync();
      view();
    };
    api.on("select", sync).on("select", view).on("reInit", reinit).on("slidesInView", view).on("pointerDown", down).on("pointerUp", up).on("settle", up);
    api.on("autoplay:play", onPlay).on("autoplay:stop", onStop);
    setPlaying(Boolean(api.plugins().autoplay?.isPlaying()));
    return () => {
      api.off("select", sync).off("select", view).off("reInit", reinit).off("slidesInView", view).off("pointerDown", down).off("pointerUp", up).off("settle", up);
      api.off("autoplay:play", onPlay).off("autoplay:stop", onStop);
    };
  }, [api, fade, setIndex]);

  // Controlled index → engine.
  React.useEffect(() => {
    if (!api || indexProp === undefined) return;
    if (api.selectedScrollSnap() !== indexProp) api.scrollTo(indexProp, reduced);
  }, [api, indexProp, reduced]);

  const scrollTo = React.useCallback((i: number) => {
    if (api) api.scrollTo(i, reduced);
    else setIndex(i);
  }, [api, reduced, setIndex]);
  const scrollPrev = React.useCallback(() => api?.scrollPrev(reduced), [api, reduced]);
  const scrollNext = React.useCallback(() => api?.scrollNext(reduced), [api, reduced]);
  const play = React.useCallback(() => api?.plugins().autoplay?.play(), [api]);
  const pause = React.useCallback(() => api?.plugins().autoplay?.stop(), [api]);

  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const total = count;

  const ctx = React.useMemo<CarouselContextValue>(
    () => ({
      api,
      viewportRef,
      index,
      count: total,
      slideCount,
      setSlideCount,
      canPrev: api ? canPrev : index > 0,
      canNext: api ? canNext : index < total - 1,
      playing,
      autoplay: autoplayOn,
      inView,
      preset,
      controls,
      orientation,
      transition: fade ? "fade" : "slide",
      loading,
      t,
      nf,
      scrollTo,
      scrollPrev,
      scrollNext,
      play,
      pause,
    }),
    [api, viewportRef, index, total, slideCount, canPrev, canNext, playing, autoplayOn, inView, preset, controls, orientation, fade, loading, t, nf, scrollTo, scrollPrev, scrollNext, play, pause],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable=true], [role=slider], [role=tablist]")) return;
    const vertical = orientation === "vertical";
    const back = vertical ? "ArrowUp" : dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const fwd = vertical ? "ArrowDown" : dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    if (e.key === back) scrollPrev();
    else if (e.key === fwd) scrollNext();
    else if (e.key === "Home") scrollTo(0);
    else if (e.key === "End") scrollTo(Math.max(0, total - 1));
    else return;
    e.preventDefault();
  };

  const spv = slidesPerView ?? 1;
  const spvVars: Record<string, string> = {};
  const spvAttrs: Record<string, string> = {};
  if (spv === "auto") spvAttrs["data-spv-auto"] = "";
  else if (typeof spv === "number") spvVars["--spv-base"] = String(fade ? 1 : spv);
  else
    for (const [bp, n] of Object.entries(spv)) {
      spvVars[`--spv-${bp}`] = String(fade ? 1 : n);
      if (bp !== "base") spvAttrs[`data-spv-${bp}`] = "";
    }

  return (
    <CarouselContext.Provider value={ctx}>
      <section
        ref={ref}
        role="region"
        aria-roledescription={t("carousel")}
        aria-label={label}
        data-slot="carousel"
        data-preset={preset}
        data-controls={controls}
        data-orientation={orientation}
        data-transition={fade ? "fade" : "slide"}
        data-dragging={dragging ? "" : undefined}
        data-single={total <= 1 ? "" : undefined}
        className={cn(carouselVariants({ preset, controls }), className)}
        style={{ "--carousel-gap": fade ? "0px" : GAP[gap], ...spvVars, ...style } as React.CSSProperties}
        onKeyDown={handleKeyDown}
        {...spvAttrs}
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
});

/* ------------------------------------------------------------------ */
/* Viewport + slides                                                    */
/* ------------------------------------------------------------------ */

const SlideIndexContext = React.createContext<{ index: number; total: number }>({ index: -1, total: 0 });

export interface CarouselViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Built-in previous / next arrows on the stage. Default `true` (hidden when `controls="hidden"` or one slide). */
  arrows?: boolean;
  /** Built-in pause button when autoplay is on. Turn off only if you render `CarouselPlayPause` yourself. */
  playPause?: boolean;
  /** Shown when there are no slides. */
  empty?: React.ReactNode;
  /** Class of the scrolling track (the flex row of slides). */
  containerClassName?: string;
}

/**
 * The clipping viewport and the slide track. Children are `CarouselSlide`s. Renders the arrows
 * (and the pause button with autoplay) on the stage, so they line up with the slides.
 */
export const CarouselViewport = React.forwardRef<HTMLDivElement, CarouselViewportProps>(function CarouselViewport(
  { arrows = true, playPause = true, empty, containerClassName, className, children, ...props },
  ref,
) {
  const c = useCarouselContext("CarouselViewport");
  const slides = React.Children.toArray(children).filter(React.isValidElement);
  const n = slides.length;
  const { setSlideCount } = c;
  useIsomorphicLayoutEffect(() => setSlideCount(n), [n, setSlideCount]);

  if (n === 0 && !c.loading) {
    return (
      <div ref={ref} data-slot="carousel-empty" className={cn("flex min-h-40 items-center justify-center rounded-ui border border-dashed border-line text-sm text-fg-muted", className)} {...props}>
        {empty ?? c.t("empty")}
      </div>
    );
  }

  const vertical = c.orientation === "vertical";
  const showArrows = arrows && c.controls !== "hidden" && c.slideCount > 1;

  return (
    <div data-slot="carousel-stage" className="vui-carousel-stage relative">
      {c.autoplay && playPause ? <CarouselPlayPause className="vui-carousel-playpause absolute end-3 top-3 z-20" /> : null}
      <div ref={ref} className={cn("vui-carousel-viewport overflow-hidden", className)} data-slot="carousel-viewport" {...props}>
        <div ref={c.viewportRef as React.Ref<HTMLDivElement>} className="h-full">
          <div
            data-slot="carousel-container"
            aria-live={c.playing ? "off" : "polite"}
            aria-busy={c.loading || undefined}
            className={cn("vui-carousel-container flex", vertical ? "h-full flex-col" : "touch-pan-y", containerClassName)}
          >
            {c.loading && n === 0 ? (
              <CarouselSlide aria-label={c.t("loading")}>
                <Skeleton className="ui-shimmer aspect-video w-full rounded-ui" />
              </CarouselSlide>
            ) : (
              slides.map((slide, i) => (
                <SlideIndexContext.Provider key={slide.key ?? i} value={{ index: i, total: n }}>
                  {slide}
                </SlideIndexContext.Provider>
              ))
            )}
          </div>
        </div>
      </div>
      {showArrows ? (
        <>
          <CarouselPrev className={cn("vui-carousel-arrow absolute z-10", vertical ? "start-1/2 top-2 -translate-x-1/2 rtl:translate-x-1/2" : "start-3 top-1/2 -translate-y-1/2")} />
          <CarouselNext className={cn("vui-carousel-arrow absolute z-10", vertical ? "start-1/2 bottom-2 -translate-x-1/2 rtl:translate-x-1/2" : "end-3 top-1/2 -translate-y-1/2")} />
        </>
      ) : null}
    </div>
  );
});

export interface CarouselSlideProps extends React.HTMLAttributes<HTMLDivElement> {}

/** One slide: `role="group"`, `aria-roledescription="slide"`, labelled "3 of 7"; `inert` while off-screen. */
export const CarouselSlide = React.forwardRef<HTMLDivElement, CarouselSlideProps>(function CarouselSlide({ className, children, ...props }, ref) {
  const c = useCarouselContext("CarouselSlide");
  const { index: i, total } = React.useContext(SlideIndexContext);
  const hidden = c.inView !== null && i >= 0 && !c.inView.has(i);
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription={c.t("slide")}
      aria-label={i >= 0 ? c.t("slideOf", { index: c.nf.format(i + 1), total: c.nf.format(Math.max(total, i + 1)) }) : undefined}
      data-slot="carousel-slide"
      data-active={i === c.index ? "" : undefined}
      inert={hidden || undefined}
      className={cn("vui-carousel-slide min-w-0 shrink-0 grow-0", className)}
      {...props}
    >
      {children}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Controls                                                             */
/* ------------------------------------------------------------------ */

type ArrowProps = Omit<React.ComponentPropsWithoutRef<typeof IconButton>, "label" | "children"> & { label?: string; children?: React.ReactNode };

function ArrowButton({ direction, label, className, onClick, size, variant, ...props }: ArrowProps & { direction: "prev" | "next" }) {
  const c = useCarouselContext(direction === "prev" ? "CarouselPrev" : "CarouselNext");
  const vertical = c.orientation === "vertical";
  const Icon = direction === "prev" ? (vertical ? ChevronUp : ChevronLeft) : vertical ? ChevronDown : ChevronRight;
  const disabled = direction === "prev" ? !c.canPrev : !c.canNext;
  const overlay = c.controls === "inside" || c.preset === "hero";
  return (
    <IconButton
      label={label ?? c.t(direction === "prev" ? "previous" : "next")}
      tooltip={false}
      size={size ?? (c.preset === "hero" ? "lg" : "md")}
      variant={variant ?? (overlay ? "ghost" : "secondary")}
      data-slot={direction === "prev" ? "carousel-prev" : "carousel-next"}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) (direction === "prev" ? c.scrollPrev : c.scrollNext)();
      }}
      className={cn("rounded-full!", overlay && "surface-popover hover:bg-popover", !vertical && "rtl:[&_svg]:-scale-x-100", className)}
      {...props}
    >
      <Icon aria-hidden />
    </IconButton>
  );
}

/** Previous slide. Disabled at the start (unless `loop`). */
export function CarouselPrev(props: ArrowProps) {
  return <ArrowButton direction="prev" {...props} />;
}
/** Next slide. Disabled at the end (unless `loop`). */
export function CarouselNext(props: ArrowProps) {
  return <ArrowButton direction="next" {...props} />;
}

export interface CarouselDotsProps extends React.HTMLAttributes<HTMLDivElement> {}

/** One button per slide; the current one is `aria-current` and painted with `--accent`. */
export const CarouselDots = React.forwardRef<HTMLDivElement, CarouselDotsProps>(function CarouselDots({ className, ...props }, ref) {
  const c = useCarouselContext("CarouselDots");
  if (c.count <= 1) return null;
  return (
    <div
      ref={ref}
      role="group"
      aria-label={c.t("dots")}
      data-slot="carousel-dots"
      className={cn(
        "vui-carousel-dots flex items-center justify-center gap-1",
        c.preset === "hero" ? "absolute inset-x-0 bottom-4 z-10" : "mt-4",
        className,
      )}
      {...props}
    >
      {Array.from({ length: c.count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={c.t("goTo", { index: c.nf.format(i + 1) })}
          aria-current={i === c.index ? "true" : undefined}
          data-slot="carousel-dot"
          onClick={() => c.scrollTo(i)}
          className="vui-carousel-dot focus-ring group/dot relative flex h-6 min-w-6 items-center justify-center rounded-full"
        >
          <span aria-hidden className="block h-1.5 rounded-full" />
        </button>
      ))}
    </div>
  );
});

export interface CarouselThumbsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** One thumbnail per slide (URL or `{ src, alt }`). */
  items: (string | { src: string; alt?: string })[];
  /** Thumbnail box ratio. Default 4/3. */
  aspect?: number;
  /** Center the row while it fits (it still scrolls when it overflows). Default `"start"`. */
  align?: "start" | "center";
}

/** A row of thumbnail buttons under a gallery carousel; the selected one gets a `--ring` border. */
export const CarouselThumbs = React.forwardRef<HTMLDivElement, CarouselThumbsProps>(function CarouselThumbs({ items, aspect = 4 / 3, align = "start", className, ...props }, ref) {
  const c = useCarouselContext("CarouselThumbs");
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${c.index}"]`);
    el?.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [c.index]);
  return (
    <div ref={ref} role="group" aria-label={c.t("thumbs")} data-slot="carousel-thumbs" className={cn("mt-3", className)} {...props}>
      <div ref={listRef} className={cn("vui-carousel-thumbs-track scrollbar-none flex gap-2 overflow-x-auto p-1", align === "center" && "[&>:first-child]:ms-auto [&>:last-child]:me-auto")}>
        {items.map((item, i) => {
          const src = typeof item === "string" ? item : item.src;
          const alt = typeof item === "string" ? "" : item.alt ?? "";
          return (
            <button
              key={i}
              type="button"
              data-index={i}
              data-slot="carousel-thumb"
              aria-label={c.t("goTo", { index: c.nf.format(i + 1) }) + (alt ? `: ${alt}` : "")}
              aria-current={i === c.index ? "true" : undefined}
              onClick={() => c.scrollTo(i)}
              className="vui-carousel-thumb focus-ring relative w-20 shrink-0 overflow-hidden rounded-ui-sm bg-skeleton sm:w-24"
              style={{ aspectRatio: String(aspect) }}
            >
              <img src={src} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
});

export interface CarouselPlayPauseProps extends Omit<ArrowProps, "onClick"> {}

/** Pause / resume autoplay. Rendered automatically on the stage while autoplay is on. */
export function CarouselPlayPause({ className, size, ...props }: CarouselPlayPauseProps) {
  const c = useCarouselContext("CarouselPlayPause");
  if (!c.autoplay) return null;
  return (
    <IconButton
      label={c.t(c.playing ? "pause" : "play")}
      tooltip={false}
      size={size ?? "sm"}
      variant="ghost"
      data-slot="carousel-playpause"
      aria-pressed={undefined}
      onClick={c.playing ? c.pause : c.play}
      className={cn("surface-popover rounded-full! hover:bg-popover", className)}
      {...props}
    >
      {c.playing ? <Pause aria-hidden /> : <Play aria-hidden />}
    </IconButton>
  );
}

export interface CarouselCounterProps extends React.HTMLAttributes<HTMLSpanElement> {}

/** "3 / 7" in the locale's digits. */
export const CarouselCounter = React.forwardRef<HTMLSpanElement, CarouselCounterProps>(function CarouselCounter({ className, ...props }, ref) {
  const c = useCarouselContext("CarouselCounter");
  if (c.count === 0) return null;
  return (
    <span ref={ref} data-slot="carousel-counter" className={cn("tabular text-[13px] text-fg-muted", className)} {...props}>
      <span className="sr-only">{c.t("counter", { index: c.nf.format(c.index + 1), total: c.nf.format(c.count) })}</span>
      <span aria-hidden>
        <span className="font-medium text-fg">{c.nf.format(c.index + 1)}</span>
        <span className="mx-1 text-fg-subtle">/</span>
        {c.nf.format(c.count)}
      </span>
    </span>
  );
});

/* ------------------------------------------------------------------ */
/* Marquee (pure CSS)                                                   */
/* ------------------------------------------------------------------ */

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name of the list ("Customers"). */
  label: string;
  /** Seconds per loop. Default 40. */
  duration?: number;
  reverse?: boolean;
  /** Pause while hovered or focused. Default `true`. */
  pauseOnHover?: boolean;
  /** Fade the edges. Default `true`. */
  fade?: boolean;
  gap?: "sm" | "md" | "lg";
}

/**
 * Endless logo band in pure CSS: no JS, renders with SSR. The items are listed once for assistive
 * tech; a duplicate track (aria-hidden) closes the loop. Reduced motion: static, scrollable row.
 */
export function Marquee({ label, duration = 40, reverse, pauseOnHover = true, fade = true, gap = "lg", className, style, children, ...props }: MarqueeProps) {
  const items = React.Children.toArray(children);
  const track = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} aria-label={hidden ? undefined : label} className="vui-marquee-track flex shrink-0 items-center">
      {items.map((child, i) => (
        <li key={i} className="flex shrink-0 items-center">
          {child}
        </li>
      ))}
    </ul>
  );
  return (
    <div
      data-slot="marquee"
      data-reverse={reverse ? "" : undefined}
      data-pause-on-hover={pauseOnHover ? "" : undefined}
      data-fade={fade ? "" : undefined}
      className={cn("vui-marquee flex overflow-hidden", className)}
      style={{ "--marquee-duration": `${duration}s`, "--marquee-gap": GAP[gap], ...style } as React.CSSProperties}
      {...props}
    >
      {track(false)}
      {track(true)}
    </div>
  );
}
