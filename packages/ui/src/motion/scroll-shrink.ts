"use client";

import * as React from "react";

export interface UseScrollShrinkOptions {
  /** Scroll distance in px after which the header counts as scrolled. Default 24. */
  threshold?: number;
}

/**
 * Sticky header shrink: sets `data-scrolled` on the element once the page has scrolled past
 * `threshold` (passive listener, rAF-throttled, no re-render). Pair it with the `vm-shrink`
 * class, which tightens the bar with transforms only, so the content below never moves (CLS 0).
 * Returns whether it is scrolled, for anything else you want to switch.
 *
 * ```tsx
 * const ref = React.useRef<HTMLElement>(null);
 * useScrollShrink(ref);
 * <header ref={ref} className="vm-shrink sticky top-0">…</header>
 * ```
 */
export function useScrollShrink(ref: React.RefObject<HTMLElement | null>, { threshold = 24 }: UseScrollShrinkOptions = {}): boolean {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    let raf = 0;
    let last: boolean | null = null;
    const update = () => {
      raf = 0;
      const next = window.scrollY > threshold;
      if (next === last) return;
      last = next;
      const el = ref.current;
      if (el) {
        if (next) el.setAttribute("data-scrolled", "");
        else el.removeAttribute("data-scrolled");
      }
      setScrolled(next);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ref, threshold]);
  return scrolled;
}
