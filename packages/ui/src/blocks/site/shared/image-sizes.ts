// Responsive `sizes` for site-block photos. Every photo in a site block passes one of these to
// BlockImage → the kit Image / `components.Image` (e.g. next/image), so a CDN loader picks a
// 400–800 px file on a phone instead of the 3840 px top step. Fractions follow the block's 12-col
// grid and are capped at the content container (`--container`, 76rem): a 2560 px monitor does
// not fetch a 1500 px file for a 33% column that is never wider than 25rem.
// Server-safe, no React.

/** `--container` (76rem) — the content column every Container caps at. */
export const CONTAINER_REM = 76;

/**
 * A column that spans `fraction` of the container from `from` up, and `narrow` below.
 * `columnSizes(5 / 12)` → `"(min-width: 56rem) min(42vw, 32rem), 100vw"`.
 */
export function columnSizes(fraction: number, opts: { from?: "42rem" | "56rem"; narrow?: string; bleed?: boolean } = {}): string {
  const { from = "56rem", narrow = "100vw", bleed = false } = opts;
  const vw = Math.ceil(fraction * 100);
  // A column bleeding to the section edge grows past the container on very wide screens.
  const wide = bleed ? `${vw}vw` : `min(${vw}vw, ${Math.ceil(fraction * CONTAINER_REM)}rem)`;
  return `(min-width: ${from}) ${wide}, ${narrow}`;
}

/** Common presets. */
export const SITE_SIZES = {
  /** Edge-to-edge photo (full-bleed hero, editorial strip). */
  bleed: "100vw",
  /** A photo as wide as the content container. */
  container: `min(100vw, ${CONTAINER_REM}rem)`,
  /** A photo only shown on narrow containers (< 56rem), full width there. */
  narrowOnly: "min(100vw, 56rem)",
} as const;

/**
 * Filmstrip cell: fixed height `clamp(15rem, 38cqi, 30rem)`, width = height × ratio.
 * `filmstripSizes(4 / 5)` → `"max(12rem, min(31vw, 24rem))"`.
 */
export function filmstripSizes(ratio: number): string {
  const r = ratio > 0 ? ratio : 0.8;
  const n = (x: number) => Math.round(x * 10) / 10;
  return `max(${n(15 * r)}rem, min(${Math.ceil(38 * r)}vw, ${n(30 * r)}rem))`;
}
