/**
 * Motion core: level lookup, a shared IntersectionObserver pool and timing helpers.
 * No React in here — every primitive in this folder builds on these.
 */

export type MotionLevel = "full" | "subtle" | "off";

const REDUCE = "(prefers-reduced-motion: reduce)";

/** `true` when the OS asks for reduced motion. `false` on the server. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(REDUCE).matches;
}

/**
 * The motion level that applies to an element: `data-motion="off"` on `<html>` always wins,
 * then the closest `[data-motion]` ancestor (SiteShell sets one), then `"subtle"`.
 * Reduced motion turns every level into `"off"`.
 */
export function motionLevel(el?: Element | null): MotionLevel {
  if (typeof document === "undefined" || prefersReducedMotion()) return "off";
  if (document.documentElement.getAttribute("data-motion") === "off") return "off";
  const v = el?.closest("[data-motion]")?.getAttribute("data-motion");
  return v === "off" || v === "full" ? v : "subtle";
}

/** Shorthand: may this element animate at all? */
export const motionAllowed = (el?: Element | null) => motionLevel(el) !== "off";

/* ------------------------------------------------------------------ */
/* Shared IntersectionObserver pool (one observer per option set)       */
/* ------------------------------------------------------------------ */

type Handler = (entry: IntersectionObserverEntry) => void;
const pools = new Map<string, { io: IntersectionObserver; handlers: Map<Element, Handler> }>();

export const ioSupported = () => typeof window !== "undefined" && typeof window.IntersectionObserver === "function";

/**
 * Observe an element with a pooled IntersectionObserver. Returns the unobserve function.
 * Without IntersectionObserver the handler is never called — callers fall back themselves.
 */
export function observe(el: Element, handler: Handler, { rootMargin = "0px 0px -8% 0px", threshold = 0 }: { rootMargin?: string; threshold?: number } = {}): () => void {
  if (!ioSupported()) return () => {};
  const key = `${rootMargin}|${threshold}`;
  let pool = pools.get(key);
  if (!pool) {
    const handlers = new Map<Element, Handler>();
    const io = new IntersectionObserver((entries) => entries.forEach((e) => handlers.get(e.target)?.(e)), { rootMargin, threshold });
    pool = { io, handlers };
    pools.set(key, pool);
  }
  const p = pool;
  p.handlers.set(el, handler);
  p.io.observe(el);
  return () => {
    p.handlers.delete(el);
    p.io.unobserve(el);
  };
}

/** Is the element's box (at least partly) inside the viewport right now? */
export function inViewport(el: Element): boolean {
  if (typeof window === "undefined") return false;
  const r = el.getBoundingClientRect();
  const h = window.innerHeight || document.documentElement.clientHeight;
  const w = window.innerWidth || document.documentElement.clientWidth;
  return r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;
}

/** Longest `duration + delay` (ms) among the element's transitions — or its children's, for staggers. */
export function transitionEnd(el: Element, children = false): number {
  if (typeof window === "undefined") return 0;
  const ms = (v: string) => v.split(",").map((s) => (s.trim().endsWith("ms") ? parseFloat(s) : parseFloat(s) * 1000) || 0);
  const longest = (node: Element) => {
    const cs = window.getComputedStyle(node);
    const d = ms(cs.transitionDuration);
    const de = ms(cs.transitionDelay);
    return d.reduce((m, v, i) => Math.max(m, v + (de[i] ?? de[0] ?? 0)), 0);
  };
  let max = longest(el);
  if (children) for (const c of Array.from(el.children)) max = Math.max(max, longest(c));
  return max;
}

/** Easing used by the JS-driven primitives (count-up): ease-out quint. */
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
