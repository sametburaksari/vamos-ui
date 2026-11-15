"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn2 as cn } from "./kit-2";
import { formatMessage } from "../../../lib/message-format";

export interface PostSliderLabels {
  previous: string;
  next: string;
  slideOf: string;
}

export interface PostSliderProps {
  /** One child per page of posts (server-rendered). */
  children: React.ReactNode;
  labels: PostSliderLabels;
  locale?: string;
  /** Accessible name of the group ("Featured stories"). */
  label: string;
  /** Where the arrows sit. Default `"bottom"`. */
  controls?: "bottom" | "top";
  className?: string;
}

/**
 * Pages of posts with previous / next arrows (the small paging arrows under news modules). Only
 * the current page is rendered visible; the others stay in the DOM `hidden`, so crawlers see
 * every story. The counter is announced politely. ~0.6 KB.
 */
export function PostSlider({ children, labels, locale = "en-US", label, controls = "bottom", className }: PostSliderProps) {
  const pages = React.Children.toArray(children);
  const [i, setI] = React.useState(0);
  const total = pages.length;
  const btn = "inline-flex size-8 items-center justify-center rounded-ui-sm border border-line text-fg-muted transition-colors hover:border-fg hover:text-fg focus-ring disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4";
  const bar =
    total > 1 ? (
      <div className="flex items-center gap-1.5">
        <button type="button" className={btn} onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} aria-label={labels.previous}>
          <ChevronLeft aria-hidden className="rtl:-scale-x-100" />
        </button>
        <button type="button" className={btn} onClick={() => setI((n) => Math.min(total - 1, n + 1))} disabled={i === total - 1} aria-label={labels.next}>
          <ChevronRight aria-hidden className="rtl:-scale-x-100" />
        </button>
        <span className="ms-2 font-mono text-[0.75rem] tabular text-fg-muted" aria-live="polite">
          {formatMessage(labels.slideOf, { index: i + 1, total }, locale)}
        </span>
      </div>
    ) : null;
  return (
    <div role="group" aria-roledescription="carousel" aria-label={label} className={cn("vb-post-slider flex flex-col gap-4", className)}>
      {controls === "top" ? bar : null}
      {pages.map((page, n) => (
        <div key={n} role="group" aria-roledescription="slide" aria-label={formatMessage(labels.slideOf, { index: n + 1, total }, locale)} hidden={n !== i}>
          {page}
        </div>
      ))}
      {controls === "bottom" ? bar : null}
    </div>
  );
}
