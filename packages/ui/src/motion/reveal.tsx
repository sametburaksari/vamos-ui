"use client";

import * as React from "react";
import * as Slot from "radix-ui/slot";
import { cn } from "../lib/cn";
import { inViewport, ioSupported, motionAllowed, observe, transitionEnd } from "./core";

export type RevealEffect = "fade" | "rise" | "blur" | "scale" | "clip";

const noopSubscribe = () => () => {};
export const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * `true` when the component mounted on the client after hydration (a page switch, a tab, a
 * replay); `false` when it was server-rendered and is being hydrated. Server-rendered content
 * is already on screen, so it is never hidden again; fresh content may start hidden.
 */
export function useFreshMount(): boolean {
  const hydrating = React.useSyncExternalStore(noopSubscribe, () => false, () => true);
  const [fresh] = React.useState(!hydrating);
  return fresh;
}

export interface UseRevealOptions {
  /** Reveal once and stop observing. Default true. With false it hides again when scrolled back above it. */
  once?: boolean;
  /** IntersectionObserver rootMargin. Default `"0px 0px -8% 0px"` (a little before the bottom edge). */
  rootMargin?: string;
  /** IntersectionObserver threshold. Default 0. */
  threshold?: number;
  /** The children animate (Stagger): wait for the last child before settling. */
  stagger?: boolean;
  /** Skip the animation; the element just shows. */
  disabled?: boolean;
  /** Called once the element starts revealing. */
  onReveal?: () => void;
}

/**
 * Scroll-reveal state machine on any element: `data-reveal-state` goes
 * `pending → in → done`. CSS (motion.css) draws the states, so the hook only flips an attribute.
 *
 * - Server-rendered content that is already in view stays as it is (no flash, CLS 0).
 * - Server-rendered content below the fold is hidden just before paint and revealed on scroll.
 * - Freshly mounted content starts hidden and reveals when it enters the viewport.
 * - Reduced motion, `data-motion="off"` or no IntersectionObserver → shown at once.
 *
 * Returns the props for the first render (spread them on the element).
 */
export function useReveal<T extends HTMLElement>(ref: React.RefObject<T | null>, { once = true, rootMargin, threshold, stagger, disabled, onReveal }: UseRevealOptions = {}) {
  const fresh = useFreshMount();
  const onRevealRef = React.useRef(onReveal);
  onRevealRef.current = onReveal;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    const set = (s: "pending" | "in" | "done") => el.setAttribute("data-reveal-state", s);
    const show = () => {
      if (el.getAttribute("data-reveal-state") !== "pending") return;
      set("in");
      onRevealRef.current?.();
      clearTimeout(timer);
      // After the transition, drop the reveal styles so the element's own transitions
      // (hover, focus) are its own again.
      timer = setTimeout(() => el.getAttribute("data-reveal-state") === "in" && set("done"), transitionEnd(el, stagger) + 60);
    };

    if (disabled || !motionAllowed(el)) {
      set("done");
      return;
    }
    if (!ioSupported()) {
      if (fresh) frame = requestAnimationFrame(() => show());
      else set("done");
      return () => cancelAnimationFrame(frame);
    }
    if (!fresh && inViewport(el)) {
      set("done");
      if (once) return;
    } else set("pending");

    const stop = observe(
      el,
      (entry) => {
        if (entry.isIntersecting) {
          show();
          if (once) stop();
        } else if (!once && entry.boundingClientRect.top > 0) set("pending");
      },
      { rootMargin, threshold },
    );
    return () => {
      stop();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fresh, once, rootMargin, threshold, stagger, disabled]);

  return { "data-reveal-state": fresh && !disabled ? "pending" : undefined } as const;
}

interface RevealBaseProps extends React.HTMLAttributes<HTMLDivElement>, Omit<UseRevealOptions, "stagger"> {
  /** fade · rise (default) · blur · scale · clip (wipes up from the bottom edge). */
  effect?: RevealEffect;
  /** Delay before it starts, in ms. */
  delay?: number;
  /** Override the duration, in ms. Default: the motion token for the level (`--motion-reveal`). */
  duration?: number;
  /** Render the single child instead of a `div` (keeps your `ul`, `section`, `Container`…). */
  asChild?: boolean;
}

export type RevealProps = RevealBaseProps;

function useComposedRef<T>(...refs: (React.Ref<T> | undefined)[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback((node: T | null) => {
    for (const r of refs) {
      if (typeof r === "function") r(node);
      else if (r) (r as React.RefObject<T | null>).current = node;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

const timing = (delay?: number, duration?: number, extra?: Record<string, string>) =>
  ({
    ...(delay ? { "--vm-delay": `${delay}ms` } : null),
    ...(duration ? { "--vm-duration": `${duration}ms` } : null),
    ...extra,
  }) as React.CSSProperties;

/**
 * Shows its content when it scrolls into view — opacity and transform only, so nothing moves
 * (CLS 0). Server-rendered content is never hidden before hydration; reduced motion and
 * `data-motion="off"` show it at once.
 *
 * ```tsx
 * <Reveal effect="rise" delay={80}><Card>…</Card></Reveal>
 * ```
 */
export const Reveal = /*#__PURE__*/ React.forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  { effect = "rise", delay, duration, once, rootMargin, threshold, disabled, onReveal, asChild, className, style, ...props },
  ref,
) {
  const inner = React.useRef<HTMLDivElement | null>(null);
  const setRef = useComposedRef(ref, inner);
  const initial = useReveal(inner, { once, rootMargin, threshold, disabled, onReveal });
  const Comp = asChild ? Slot.Root : "div";
  return <Comp ref={setRef} data-reveal={effect} {...initial} className={cn("vm-reveal", className)} style={{ ...timing(delay, duration), ...style }} {...props} />;
});

export interface StaggerProps extends RevealBaseProps {
  /** Time between two children, in ms. Default: the level's `--motion-stagger` (60 ms subtle, 90 ms full). */
  step?: number;
}

/**
 * Reveals its direct children one after another (the 13th and later share the last slot, so a
 * long list never keeps people waiting). Use `asChild` on a list to keep its semantics.
 *
 * ```tsx
 * <Stagger asChild step={70}><ul className="grid grid-cols-3">{plans.map(…)}</ul></Stagger>
 * ```
 */
export const Stagger = /*#__PURE__*/ React.forwardRef<HTMLDivElement, StaggerProps>(function Stagger(
  { effect = "rise", step, delay, duration, once, rootMargin, threshold, disabled, onReveal, asChild, className, style, ...props },
  ref,
) {
  const inner = React.useRef<HTMLDivElement | null>(null);
  const setRef = useComposedRef(ref, inner);
  const initial = useReveal(inner, { once, rootMargin, threshold, disabled, onReveal, stagger: true });
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      ref={setRef}
      data-reveal={effect}
      data-reveal-stagger=""
      {...initial}
      className={cn("vm-stagger", className)}
      style={{ ...timing(delay, duration, step ? { "--vm-step": `${step}ms` } : undefined), ...style }}
      {...props}
    />
  );
});
