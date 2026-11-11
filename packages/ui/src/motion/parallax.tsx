"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { motionAllowed } from "./core";

const supports = (q: string) => typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports(q);

/**
 * Calls `onProgress(0…1)` on scroll (rAF-throttled, passive). Used as the fallback where CSS
 * scroll-driven animations are missing. `measure` returns the progress for the current scroll.
 */
function useScrollFallback(enabled: boolean, ref: React.RefObject<HTMLElement | null>, measure: (el: HTMLElement) => number) {
  React.useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.setProperty("--vm-progress", Math.min(1, Math.max(0, measure(el))).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    el.setAttribute("data-js", "");
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      el.removeAttribute("data-js");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

export interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * How far the content travels each way while the frame crosses the viewport, in px.
   * Positive moves slower than the page (depth), negative faster (foreground). Default 40.
   */
  shift?: number;
  /**
   * Clip to the frame and over-size the layer so no edge ever shows — for images. The frame
   * needs its own size (an aspect ratio or a height). Default true.
   */
  clip?: boolean;
}

/**
 * Scroll-linked depth. CSS `animation-timeline: view()` where supported (no JS on scroll), a
 * passive rAF scroll listener elsewhere. Transform only; off under reduced motion and
 * `data-motion="off"`.
 *
 * ```tsx
 * <Parallax shift={48} className="aspect-[16/9] rounded-ui-lg"><img className="size-full object-cover" … /></Parallax>
 * ```
 */
export const Parallax = React.forwardRef<HTMLDivElement, ParallaxProps>(function Parallax({ shift = 40, clip = true, className, style, children, ...props }, ref) {
  const inner = React.useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = React.useState(false);
  React.useEffect(() => {
    setFallback(!supports("animation-timeline: view()") && motionAllowed(inner.current));
  }, []);
  useScrollFallback(fallback, inner, (el) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return (vh - r.top) / (vh + r.height);
  });
  return (
    <div
      ref={(node) => {
        inner.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-parallax=""
      data-clip={clip ? "" : undefined}
      className={cn("vm-parallax", className)}
      style={{ "--vm-parallax-shift": `${shift}px`, ...style } as React.CSSProperties}
      {...props}
    >
      <div className="vm-parallax-layer">{children}</div>
    </div>
  );
});

export interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed to the top of the viewport (reading progress). With false it sits in the flow. Default true. */
  fixed?: boolean;
}

/**
 * A thin accent bar that fills as the page scrolls — `animation-timeline: scroll()` with a
 * scroll-listener fallback. Decorative (`aria-hidden`); it follows the scroll directly, so it
 * stays on under reduced motion.
 *
 * ```tsx
 * <ScrollProgress />
 * ```
 */
export const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(function ScrollProgress({ fixed = true, className, ...props }, ref) {
  const inner = React.useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = React.useState(false);
  React.useEffect(() => setFallback(!supports("animation-timeline: scroll()")), []);
  useScrollFallback(fallback, inner, () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  });
  return (
    <div
      ref={(node) => {
        inner.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      aria-hidden="true"
      data-fixed={fixed ? "" : undefined}
      className={cn("vm-scroll-progress", className)}
      {...props}
    >
      <div className="vm-scroll-progress-bar" />
    </div>
  );
});
