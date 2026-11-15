"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Marquee } from "../../components/carousel";
import { BlockLink } from "../block-link";
import { cn2 as cn } from "./shared/kit-2";
import { newsText, type NewsBlockLabels } from "./shared/labels-news";
import type { BlockAdapters } from "../types";

export interface NewsTickerItem {
  title: string;
  href: string;
  /** Short section label before the headline ("Markets"). */
  category?: string;
  /** Marks breaking news (a pulsing dot; static under reduced motion). */
  breaking?: boolean;
}

export interface NewsTickerProps {
  items: NewsTickerItem[];
  /** The tag at the start. Default "Trending now". */
  label?: React.ReactNode;
  /**
   * rotate: one headline at a time with previous / next and a pause button.
   * marquee: a continuous crawl (CSS, pausable, static under reduced motion).
   */
  mode?: "rotate" | "marquee";
  /** rotate: milliseconds per headline. Default 5000. */
  interval?: number;
  /** rotate: advance on its own. Default true; off under prefers-reduced-motion. */
  autoplay?: boolean;
  /** Tone of the label tag. Default `"accent"`. */
  tone?: "accent" | "ink" | "danger";
  locale?: string;
  labels?: NewsBlockLabels;
  components?: BlockAdapters;
  className?: string;
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduce;
}

/**
 * A "Trending now" / breaking-news strip. `rotate` shows one headline at a time: it pauses while
 * hovered or focused, when the tab is hidden, with its pause button (WCAG 2.2.2), and never
 * starts under reduced motion. Changes are announced only while paused (no chatter while it
 * runs). `marquee` reuses the kit `Marquee`.
 *
 * ```tsx
 * <NewsTicker items={[{ title: "Ferry timetable changes from Monday", href: "/city/ferries" }]} />
 * ```
 */
export function NewsTicker({ items, label, mode = "rotate", interval = 5000, autoplay = true, tone = "accent", locale = "en-US", labels, components, className }: NewsTickerProps) {
  const t = newsText(labels, locale);
  const reduce = usePrefersReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [hold, setHold] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const total = items.length;
  const running = mode === "rotate" && autoplay && !reduce && !paused && !hold && !hidden && total > 1;

  React.useEffect(() => {
    const on = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  React.useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % total), interval);
    return () => window.clearTimeout(id);
  }, [running, index, interval, total]);

  if (!total) return null;
  const tag = (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[2px] px-2.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em]",
        tone === "accent" ? "bg-accent text-accent-fg" : tone === "danger" ? "bg-danger-solid text-white" : "bg-fg text-scene",
      )}
    >
      {label ?? t("trendingNow")}
    </span>
  );
  const headline = (item: NewsTickerItem, cls?: string) => (
    <BlockLink href={item.href} components={components} locale={locale} className={cn("group/tick inline-flex min-w-0 items-baseline gap-2 rounded-[2px] text-[0.9375rem] text-fg focus-ring", cls)}>
      {item.breaking ? <span aria-hidden className="relative top-[-0.1em] inline-block size-2 shrink-0 rounded-full bg-danger-solid motion-safe:animate-pulse" /> : null}
      {item.category ? <span className="shrink-0 font-semibold text-accent-ink @max-md:hidden">{item.category}</span> : null}
      <span className="truncate group-hover/tick:underline">{item.title}</span>
    </BlockLink>
  );

  if (mode === "marquee") {
    return (
      <div className={cn("vb-ticker flex min-w-0 items-center gap-4 border-y border-line py-2", className)} data-mode="marquee">
        {tag}
        <Marquee label={typeof label === "string" ? label : t("trendingNow")} duration={Math.max(30, total * 9)} gap="lg" fade className="min-w-0 flex-1" pauseLabel={t("pauseHeadlines")}>
          {items.map((item, i) => (
            <React.Fragment key={i}>{headline(item, "max-w-none [&>span:last-child]:overflow-visible")}</React.Fragment>
          ))}
        </Marquee>
      </div>
    );
  }

  const item = items[index % total]!;
  const btn = "inline-flex size-7 items-center justify-center rounded-ui-sm border border-line text-fg-muted transition-colors hover:border-fg hover:text-fg focus-ring [&_svg]:size-3.5";
  return (
    <section
      aria-label={typeof label === "string" ? label : t("trendingNow")}
      aria-roledescription="carousel"
      className={cn("vb-ticker @container flex min-w-0 items-center gap-3 border-y border-line py-2", className)}
      data-mode="rotate"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
      }}
    >
      {tag}
      <div className="relative min-w-0 flex-1 overflow-hidden" aria-live={running ? "off" : "polite"} aria-atomic="true">
        <div key={index} className="vb-ticker-line flex min-w-0" role="group" aria-roledescription="slide" aria-label={t("headlineOf", { index: (index % total) + 1, total })}>
          {headline(item)}
        </div>
      </div>
      {total > 1 ? (
        <div className="flex shrink-0 items-center gap-1">
          {autoplay && !reduce ? (
            <button type="button" className={btn} onClick={() => setPaused((p) => !p)} aria-label={paused ? t("playHeadlines") : t("pauseHeadlines")}>
              {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
            </button>
          ) : null}
          <button type="button" className={cn(btn, "@max-md:hidden")} onClick={() => setIndex((i) => (i - 1 + total) % total)} aria-label={t("previousHeadline")}>
            <ChevronLeft aria-hidden className="rtl:-scale-x-100" />
          </button>
          <button type="button" className={btn} onClick={() => setIndex((i) => (i + 1) % total)} aria-label={t("nextHeadline")}>
            <ChevronRight aria-hidden className="rtl:-scale-x-100" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
