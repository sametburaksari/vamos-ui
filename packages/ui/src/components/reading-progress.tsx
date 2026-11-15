"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { usePortalContainer } from "../lib/theme-scope";

export const readingProgressLabels = {
  label: "Reading progress",
  minutesLeft: "{count, plural, one {# min left} other {# min left}}",
  done: "Finished",
};
export type ReadingProgressLabels = typeof readingProgressLabels;

/** An element, a ref to one, or a CSS selector. Omit for the whole page. */
export type ReadingProgressTarget = React.RefObject<HTMLElement | null> | HTMLElement | string | null | undefined;

const resolveTarget = (target: ReadingProgressTarget): HTMLElement | null => {
  if (target == null) return null;
  if (typeof target === "string") return document.querySelector<HTMLElement>(target);
  if (typeof HTMLElement !== "undefined" && target instanceof HTMLElement) return target;
  return (target as React.RefObject<HTMLElement | null>).current;
};

/** Progress (0…1) of a target through the window — or of the page, when there is no target. */
function measure(target: ReadingProgressTarget, offset: number): { progress: number; started: boolean } {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const atEnd = max > 0 && window.scrollY >= max - 1;
  const el = resolveTarget(target);
  if (!el) {
    const p = max > 0 ? window.scrollY / max : 0;
    return { progress: Math.min(1, Math.max(0, p)), started: window.scrollY > 0 };
  }
  const rect = el.getBoundingClientRect();
  const line = window.innerHeight * offset;
  const p = (line - rect.top) / Math.max(1, rect.height);
  // A target that ends near the bottom of the page never reaches the reading line; the page end counts as finished.
  const progress = atEnd && rect.top < line ? 1 : Math.min(1, Math.max(0, p));
  return { progress, started: rect.top < line };
}

export interface UseReadingProgressOptions {
  /** Where the "reading line" sits, as a share of the window height. Default `0.3`. */
  offset?: number;
  /** Called with the new progress (0…1) whenever it changes. */
  onChange?: (progress: number) => void;
}

/**
 * Scroll progress (0…1) through a target element — how far the reading line (30% down the
 * window by default) has moved through it — or through the whole page. rAF-throttled, passive
 * listeners; `0` on the server.
 *
 * ```ts
 * const { progress } = useReadingProgress(articleRef);
 * ```
 */
export function useReadingProgress(target?: ReadingProgressTarget, { offset = 0.3, onChange }: UseReadingProgressOptions = {}) {
  const [state, setState] = React.useState({ progress: 0, started: false });
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  React.useEffect(() => {
    let frame = 0;
    let last = -1;
    const update = () => {
      frame = 0;
      const next = measure(target, offset);
      setState((prev) => (prev.progress === next.progress && prev.started === next.started ? prev : next));
      if (next.progress !== last) {
        last = next.progress;
        onChangeRef.current?.(next.progress);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    const el = resolveTarget(target);
    const ro = el && typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (el) ro?.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro?.disconnect();
    };
  }, [target, offset]);
  return state;
}

export interface ReadingProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  /** What is being read: a ref, an element or a selector (`"article"`). Default: the whole page. */
  target?: ReadingProgressTarget;
  /** Reading line as a share of the window height (target mode). Default `0.3`. */
  offset?: number;
  /** Reading time of the target in minutes — adds "4 min left" to the announced value and the indicator. */
  minutes?: number;
  /**
   * `"top"` (default): a thin bar pinned to the top of the window. `"bottom"`: pinned to the
   * bottom. `"inline"`: a bar in the flow (a sticky header, a side column).
   */
  position?: "top" | "bottom" | "inline";
  /** A small floating pill (bottom end) with the percentage and minutes left, shown while reading. */
  indicator?: boolean;
  /**
   * Render the pinned bar in the theme's portal container (or `document.body`), so a sticky
   * header's stacking context or a transformed ancestor never clips it. Default `true` for
   * `top` / `bottom`.
   */
  portal?: boolean;
  /** Called with the progress (0…1) as it changes. */
  onProgressChange?: (progress: number) => void;
  labels?: Partial<ReadingProgressLabels>;
}

/**
 * How far the reader is through an article (or the page): a thin accent bar with
 * `role="progressbar"`, an announced value ("42% · 3 min left") and an optional floating pill.
 * The bar follows the scroll directly, so it stays on under reduced motion (only its easing is
 * dropped).
 *
 * ```tsx
 * <ReadingProgress target={articleRef} minutes={8} indicator />
 * <ReadingProgress />  // the whole page
 * ```
 */
export const ReadingProgress = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ReadingProgressProps>(function ReadingProgress(
  { target, offset, minutes, position = "top", indicator = false, portal, onProgressChange, labels, className, style, ...props },
  ref,
) {
  const t = useLabels("readingProgress", readingProgressLabels, labels);
  const f = useFormat();
  const { progress, started } = useReadingProgress(target, { offset, onChange: onProgressChange });
  const scope = usePortalContainer();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const pinned = position !== "inline";
  const pct = Math.round(progress * 100);
  const left = minutes != null ? Math.max(0, Math.ceil(minutes * (1 - progress))) : null;
  const percent = f.percent(progress, { maximumFractionDigits: 0 });
  const leftText = left != null ? t("minutesLeft", { count: left }) : null;
  const valueText = progress >= 1 ? t("done") : leftText ? `${percent} · ${leftText}` : percent;

  const bar = (
    <div
      ref={ref}
      role="progressbar"
      aria-label={t("label")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={valueText}
      data-slot="reading-progress"
      data-position={position}
      data-complete={progress >= 1 ? "" : undefined}
      className={cn(
        "pointer-events-none h-[3px] overflow-hidden",
        pinned ? "fixed inset-x-0 z-50" : "relative w-full rounded-full bg-track",
        position === "top" && "top-0",
        position === "bottom" && "bottom-0",
        className,
      )}
      style={style}
      {...props}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 origin-left bg-accent transition-transform duration-150 ease-out motion-reduce:transition-none rtl:origin-right"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );

  const pill = indicator ? (
    <p
      aria-hidden="true"
      data-slot="reading-progress-indicator"
      data-shown={started && progress < 1 ? "" : undefined}
      className="surface-popover pointer-events-none fixed bottom-4 end-4 z-40 m-0 flex items-center gap-2 rounded-full px-3.5 py-2 text-xs text-fg-muted opacity-0 transition-opacity duration-200 data-[shown]:opacity-100 motion-reduce:transition-none"
    >
      <span className="font-medium text-fg tabular">{percent}</span>
      {leftText ? (
        <>
          <span className="h-3 w-px bg-line" />
          <span className="tabular">{leftText}</span>
        </>
      ) : null}
    </p>
  ) : null;

  const content = (
    <>
      {bar}
      {pill}
    </>
  );
  const usePortal = (portal ?? pinned) && pinned;
  if (usePortal) {
    if (!mounted) return null;
    return createPortal(content, scope ?? document.body);
  }
  return content;
});
