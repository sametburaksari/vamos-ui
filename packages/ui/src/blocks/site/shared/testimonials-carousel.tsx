"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn2 as cn } from "./kit-2";
import { formatMessage } from "../../../lib/message-format";

import type { CarouselLabels } from "./island-keys";

export interface TestimonialsCarouselProps {
  /** Section header, rendered beside the arrows. */
  header?: React.ReactNode;
  count: number;
  labels: CarouselLabels;
  locale?: string;
  /** One child per slide (server-rendered quotes). */
  children: React.ReactNode;
  className?: string;
}

/**
 * Scroll-snap carousel island (~1 KB): native swipe/scroll, arrow buttons, a "3 / 8" counter,
 * ←/→ keys on the track. No autoplay. Slides are labelled groups (WAI-ARIA carousel pattern).
 */
export function TestimonialsCarousel({ header, count, labels, locale = "en-US", children, className }: TestimonialsCarouselProps) {
  const track = React.useRef<HTMLDivElement>(null);
  const [current, setCurrent] = React.useState(0);
  const f = (k: keyof CarouselLabels, v?: Record<string, unknown>) => formatMessage(labels[k], v, locale);
  const slides = React.Children.toArray(children);

  const slideEls = () => Array.from(track.current?.children ?? []) as HTMLElement[];
  const go = React.useCallback((i: number) => {
    const el = track.current;
    const target = (Array.from(el?.children ?? []) as HTMLElement[])[Math.max(0, Math.min(count - 1, i))];
    if (!el || !target) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const left = rtl ? target.offsetLeft + target.offsetWidth - el.clientWidth : target.offsetLeft - el.offsetLeft;
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof el.scrollTo === "function") el.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
    setCurrent(Math.max(0, Math.min(count - 1, i)));
  }, [count]);

  React.useEffect(() => {
    const el = track.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting && e.intersectionRatio > 0.6);
        if (visible.length) {
          const first = visible.map((e) => slideEls().indexOf(e.target as HTMLElement)).sort((a, b) => a - b)[0];
          if (first !== undefined && first >= 0) setCurrent(first);
        }
      },
      { root: el, threshold: [0.6] },
    );
    for (const s of slideEls()) io.observe(s);
    return () => io.disconnect();
  }, [count]);

  return (
    <div role="region" aria-roledescription={labels.carousel} aria-label={labels.carousel} className={cn("vb-carousel flex flex-col gap-10", className)}>
      <div className="flex flex-col gap-6 @2xl:flex-row @2xl:items-end @2xl:justify-between">
        {header ?? <span />}
        <div className="flex shrink-0 items-center gap-4">
          <span className="font-mono text-eyebrow tabular uppercase tracking-[0.08em] text-fg-muted" aria-live="polite">
            {f("slideCounter", { index: current + 1, total: count })}
          </span>
          <div className="flex gap-2">
            <button type="button" aria-label={labels.previous} disabled={current === 0} onClick={() => go(current - 1)} className="vb-carousel-btn">
              <ArrowLeft aria-hidden strokeWidth={1.5} className="size-[18px] rtl:-scale-x-100" />
            </button>
            <button type="button" aria-label={labels.next} disabled={current >= count - 1} onClick={() => go(current + 1)} className="vb-carousel-btn">
              <ArrowRight aria-hidden strokeWidth={1.5} className="size-[18px] rtl:-scale-x-100" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={track}
        tabIndex={0}
        aria-label={labels.carousel}
        onKeyDown={(e) => {
          const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
          if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
            e.preventDefault();
            go(current + 1);
          } else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
            e.preventDefault();
            go(current - 1);
          } else if (e.key === "Home") {
            e.preventDefault();
            go(0);
          } else if (e.key === "End") {
            e.preventDefault();
            go(count - 1);
          }
        }}
        className="vb-carousel-track scrollbar-none -mx-1 flex snap-x snap-mandatory gap-(--gutter) overflow-x-auto px-1 pb-1 focus-ring rounded-ui-sm"
      >
        {slides.map((child, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription={labels.slide}
            aria-label={f("slideLabel", { index: i + 1, total: count })}
            className="w-full shrink-0 snap-start border-t border-line pt-6 @2xl:w-[calc((100%-var(--gutter))/2)]"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
