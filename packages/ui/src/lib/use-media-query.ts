import * as React from "react";

/**
 * Subscribes to a CSS media query.
 *
 * Returns `undefined` during server rendering and hydration, so CSS decides the first paint
 * and there is no hydration mismatch. Render a CSS-only fallback while it is `undefined`.
 *
 * ```ts
 * const isDesktop = useMediaQuery("(min-width: 1024px)"); // undefined | boolean
 * ```
 */
export function useMediaQuery(query: string): boolean | undefined {
  const subscribe = React.useCallback(
    (notify: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener?.("change", notify);
      return () => mql.removeEventListener?.("change", notify);
    },
    [query],
  );
  const getSnapshot = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : undefined);
  return React.useSyncExternalStore(subscribe, getSnapshot, () => undefined);
}

/** Tailwind's default breakpoints, for `useBreakpoint`. */
export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 } as const;

/** `true` when the viewport is at least the given Tailwind breakpoint; `undefined` during SSR. */
export function useBreakpoint(bp: keyof typeof breakpoints): boolean | undefined {
  return useMediaQuery(`(min-width: ${breakpoints[bp]}px)`);
}
