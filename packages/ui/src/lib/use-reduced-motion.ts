import { useMediaQuery } from "./use-media-query";

/**
 * `true` when the user asked the OS to reduce motion. `false` during SSR (animations are
 * CSS-driven and already respect the media query; use this only for JS-driven motion such as
 * carousels, chart transitions or `scrollIntoView({ behavior })`).
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)") ?? false;
}

/** `true` when the user asked the OS to reduce transparency (glass falls back to opaque). */
export function useReducedTransparency(): boolean {
  return useMediaQuery("(prefers-reduced-transparency: reduce)") ?? false;
}
