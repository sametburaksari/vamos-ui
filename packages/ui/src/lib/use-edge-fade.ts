import * as React from "react";
import { useIsomorphicLayoutEffect } from "./use-controllable-state";

/**
 * Keeps `data-fade-start` / `data-fade-end` on a scrolling element while content is hidden on that
 * side. Pair with `data-edge-fade="x" | "y"` (styles/navigation.css) for a cheap mask-image fade —
 * no blur, no extra DOM. Works in RTL (`scrollLeft` is negative there).
 *
 * ```tsx
 * const ref = React.useRef<HTMLDivElement>(null);
 * useEdgeFade(ref, "x");
 * <div ref={ref} data-edge-fade="x" className="overflow-x-auto">…</div>
 * ```
 */
export function useEdgeFade(ref: React.RefObject<HTMLElement | null>, axis: "x" | "y", enabled = true) {
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const update = () => {
      const pos = Math.abs(axis === "x" ? el.scrollLeft : el.scrollTop);
      const max = axis === "x" ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
      toggle(el, "data-fade-start", pos > 1);
      toggle(el, "data-fade-end", max - pos > 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : undefined;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
      el.removeAttribute("data-fade-start");
      el.removeAttribute("data-fade-end");
    };
  }, [ref, axis, enabled]);
}

function toggle(el: HTMLElement, attr: string, on: boolean) {
  if (on) el.setAttribute(attr, "");
  else el.removeAttribute(attr);
}
