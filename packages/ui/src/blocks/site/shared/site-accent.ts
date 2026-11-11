/**
 * Site accent: one brand colour → the kit's four accent variables, with WCAG 2.x text contrast
 * guaranteed (the same rules as `vamos-ui brand`, so a site and its panel derive identical
 * values from one colour). Pure, React-free, server-safe.
 *
 *   --accent-base       fill (primary button, active state)
 *   --accent-fg         text on the fill                    ≥ 4.5:1 on --accent-base
 *   --accent-ink-light  accent text on light surfaces       ≥ 4.5:1 on the light scene and on accent-soft over it
 *   --accent-ink-dark   accent text on dark surfaces        ≥ 4.5:1 on dark surface-2 and on accent-soft over it
 *
 * Very dark colours get a lighter dark-mode fill so buttons stay visible on dark surfaces.
 */
import { parseColor as parseRgba } from "../../../lib/color";

interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** Text contrast target (WCAG 1.4.3 AA). */
export const SITE_TEXT_CONTRAST = 4.5;
const UI_CONTRAST = 3;

/** Hardest surfaces of each theme in styles.css (light scene, dark surface-2) and the plain surfaces. */
const SURFACES = {
  light: { surface: "#ffffff", hardest: "#eef0ea" },
  dark: { surface: "#15180f", hardest: "#1b1e15" },
} as const;

/** Built-in accent presets of styles.css; these are used by name, not recomputed. */
export const BUILT_IN_SITE_ACCENTS = ["lime", "ocean", "ember", "rose", "graphite"] as const;
export const isBuiltInAccent = (v: string) => (BUILT_IN_SITE_ACCENTS as readonly string[]).includes(v);

// ---------------------------------------------------------------- colour maths (sRGB 0–1)

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

function rgbToOklch(r: number, g: number, b: number): Oklch {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.sqrt(A * A + B * B);
  let h = c < 1e-4 ? 0 : (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

/** OKLCH → sRGB, unclamped (may leave 0–1 when out of gamut). */
function oklchToRgbRaw({ l: L, c, h }: Oklch) {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const g = (v: number) => (v < 0 ? -toGamma(-v) : toGamma(v));
  return {
    r: g(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: g(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: g(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

const EPS = 1e-6;
const inGamut = (c: Oklch) => {
  const { r, g, b } = oklchToRgbRaw(c);
  return [r, g, b].every((v) => v >= -EPS && v <= 1 + EPS);
};

/** Into sRGB by lowering chroma (hue and lightness kept). */
function gamutMap(color: Oklch): Oklch {
  const base = { ...color, l: Math.min(1, Math.max(0, color.l)) };
  if (inGamut(base)) return base;
  let lo = 0;
  let hi = base.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut({ ...base, c: mid })) lo = mid;
    else hi = mid;
  }
  return { ...base, c: lo };
}

const trim = (n: number, digits: number) => {
  const s = n.toFixed(digits);
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
};

/** `oklch(0.64 0.17 245)`: the house format for accent values. */
function formatOklch(color: Oklch): string {
  const c = gamutMap(color);
  const chroma = c.c < 0.0005 ? 0 : c.c;
  return `oklch(${trim(c.l, 3)} ${trim(chroma, 3)} ${trim(chroma === 0 ? 0 : c.h, 1)})`;
}

const parse = (input: string): Oklch | null => {
  const rgba = parseRgba(input);
  return rgba ? rgbToOklch(rgba.r / 255, rgba.g / 255, rgba.b / 255) : null;
};

function luminance(color: Oklch): number {
  const raw = oklchToRgbRaw(gamutMap(color));
  const ch = (v: number) => toLinear(Math.min(1, Math.max(0, v)));
  return 0.2126 * ch(raw.r) + 0.7152 * ch(raw.g) + 0.0722 * ch(raw.b);
}

function contrast(a: Oklch | string, b: Oklch | string): number {
  const pa = typeof a === "string" ? parse(a) : a;
  const pb = typeof b === "string" ? parse(b) : b;
  if (!pa || !pb) return NaN;
  const la = luminance(pa);
  const lb = luminance(pb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Re-reads a formatted value: what the stylesheet gets is what is judged. */
const asWritten = (c: Oklch) => parseOklchString(formatOklch(c));
function parseOklchString(s: string): Oklch {
  const m = /oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/.exec(s)!;
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) };
}

const roundDown = (n: number) => Math.floor(n * 100) / 100;

/**
 * `color-mix(in oklch, base p%, transparent)` painted on `bg`: the browser blends the
 * translucent colour in gamma-encoded sRGB. That is the `--accent-soft` chip behind accent text.
 */
function softOn(base: Oklch, bg: string, amount: number): Oklch {
  const b = parse(bg)!;
  const fg = oklchToRgbRaw(gamutMap(base));
  const bgRgb = oklchToRgbRaw(b);
  const mix = (f: number, k: number) => Math.min(1, Math.max(0, f)) * amount + Math.min(1, Math.max(0, k)) * (1 - amount);
  return rgbToOklch(mix(fg.r, bgRgb.r), mix(fg.g, bgRgb.g), mix(fg.b, bgRgb.b));
}

/** Accent-soft amounts of styles.css (light 22 %, dark 16 %). */
const SOFT = { light: 0.22, dark: 0.16 } as const;

// ---------------------------------------------------------------- palette

export interface SiteAccentPalette {
  /** The colour as given. */
  source: string;
  base: string;
  fg: string;
  inkLight: string;
  inkDark: string;
  /** Dark-mode fill, when the base would vanish on dark surfaces (or `dark` was given). */
  dark?: { base: string; fg: string };
  /** Measured contrast ratios (rounded down). */
  contrast: { fgOnBase: number; inkLightOnLight: number; inkDarkOnDark: number; darkFgOnBase?: number };
  /** What was adjusted, in plain words. Empty = used as given. */
  warnings: string[];
}

export interface SiteAccentOptions {
  /** Explicit dark-mode fill. */
  dark?: string;
}

const WHITE: Oklch = { l: 1, c: 0, h: 0 };
const darkInk = (h: number): Oklch => ({ l: 0.18, c: 0.02, h });
const fgString = (fg: Oklch) => (fg.l === 1 && fg.c === 0 ? "#fff" : formatOklch(fg));

function seekLightness(from: Oklch, dir: 1 | -1, ok: (c: Oklch) => boolean): Oklch | null {
  for (let i = 0; i <= 200; i++) {
    const l = from.l + dir * i * 0.005;
    if (l < 0 || l > 1) break;
    const c = gamutMap({ ...from, l });
    if (ok(asWritten(c))) return c;
  }
  return null;
}

function fillWithText(base: Oklch, label: string, warnings: string[]): { base: Oklch; fg: Oklch } {
  const cw = contrast(WHITE, base);
  const cd = contrast(darkInk(base.h), base);
  if (Math.max(cw, cd) >= SITE_TEXT_CONTRAST) return { base, fg: cw >= cd ? WHITE : darkInk(base.h) };
  const target = SITE_TEXT_CONTRAST + 0.05;
  const forWhite = seekLightness(base, -1, (c) => contrast(WHITE, c) >= target);
  const forDark = seekLightness(base, 1, (c) => contrast(darkInk(c.h), c) >= target);
  const dW = forWhite ? base.l - forWhite.l : Infinity;
  const dD = forDark ? forDark.l - base.l : Infinity;
  const useWhite = dW <= dD;
  const next = (useWhite ? forWhite : forDark) ?? base;
  warnings.push(`${label} lightness ${base.l.toFixed(3)} → ${next.l.toFixed(3)} so ${useWhite ? "white" : "dark"} text on it reaches 4.5:1.`);
  return { base: next, fg: useWhite ? WHITE : darkInk(next.h) };
}

/**
 * The four accent variables for one brand colour (hex, rgb() or oklch()).
 * Throws a TypeError when the colour cannot be read.
 *
 * ```ts
 * siteAccent("#B4532A"); // { base: "oklch(…)", fg: "#fff", inkLight: "oklch(…)", inkDark: "oklch(…)", … }
 * ```
 */
export function siteAccent(colour: string, options: SiteAccentOptions = {}): SiteAccentPalette {
  const parsed = parse(colour);
  if (!parsed) throw new TypeError(`"${colour}" is not a colour. Use hex (#1d4ed8), rgb() or oklch().`);
  const warnings: string[] = [];
  let base = gamutMap(parsed);

  // 1. A near-white fill would lose its edge on white surfaces.
  if (contrast(base, SURFACES.light.surface) < 1.25) {
    const darker = seekLightness(base, -1, (c) => contrast(c, SURFACES.light.surface) >= 1.35);
    if (darker) {
      warnings.push(`Near-white colour: fill darkened so buttons stay visible on white.`);
      base = darker;
    }
  }

  // 2. Text on the fill.
  const fill = fillWithText(base, "Fill", warnings);
  base = fill.base;
  const fg = fill.fg;

  // 3. Ink on light surfaces: the scene and an accent-soft chip on it (accent badges, selected rows).
  const softLight = softOn(base, SURFACES.light.hardest, SOFT.light);
  const inkLightOk = (c: Oklch) => Math.min(contrast(c, SURFACES.light.hardest), contrast(c, softLight)) >= SITE_TEXT_CONTRAST + 0.05;
  let inkLight = base;
  if (!inkLightOk(asWritten(base))) {
    inkLight = seekLightness(base, -1, inkLightOk) ?? { ...base, l: 0.3 };
  }

  // 4. Dark-mode fill: explicit, or derived when the fill disappears on dark surfaces.
  let dark: { base: Oklch; fg: Oklch } | undefined;
  if (options.dark) {
    const pd = parse(options.dark);
    if (!pd) throw new TypeError(`"${options.dark}" (dark) is not a colour.`);
    dark = fillWithText(gamutMap(pd), "Dark-mode fill", warnings);
  } else if (contrast(base, SURFACES.dark.surface) < 1.6) {
    const lifted =
      base.c < 0.04
        ? gamutMap({ ...base, l: Math.min(0.95, Math.max(0.88, 1 - base.l)) })
        : seekLightness(base, 1, (c) => contrast(c, SURFACES.dark.surface) >= UI_CONTRAST) ?? { ...base, l: 0.7 };
    dark = fillWithText(lifted, "Dark-mode fill", warnings);
    warnings.push(`Very dark colour: dark mode uses a lighter fill so buttons stay visible.`);
  }

  // 5. Ink on dark surfaces: a light shade of the (dark-mode) fill.
  const from = dark?.base ?? base;
  const softDark = softOn(from, SURFACES.dark.hardest, SOFT.dark);
  const inkDarkOk = (c: Oklch) => Math.min(contrast(c, SURFACES.dark.hardest), contrast(c, softDark)) >= SITE_TEXT_CONTRAST + 0.05;
  let inkDark = from;
  if (from.l < 0.7 || !inkDarkOk(asWritten(from))) {
    const start = gamutMap({ ...from, l: Math.max(from.l, 0.7), c: from.l < 0.7 ? from.c * 0.75 : from.c });
    inkDark = inkDarkOk(asWritten(start)) ? start : seekLightness(start, 1, inkDarkOk) ?? { ...start, l: 0.9 };
  }

  const out = { base: formatOklch(base), fg: fgString(fg), inkLight: formatOklch(inkLight), inkDark: formatOklch(inkDark) };
  const palette: SiteAccentPalette = {
    source: colour,
    ...out,
    contrast: {
      fgOnBase: roundDown(contrast(out.fg, out.base)),
      inkLightOnLight: roundDown(contrast(out.inkLight, SURFACES.light.hardest)),
      inkDarkOnDark: roundDown(contrast(out.inkDark, SURFACES.dark.hardest)),
    },
    warnings,
  };
  if (dark) {
    palette.dark = { base: formatOklch(dark.base), fg: fgString(dark.fg) };
    palette.contrast.darkFgOnBase = roundDown(contrast(palette.dark.fg, palette.dark.base));
  }
  return palette;
}

/** A stable attribute value for a palette (`b4532a`-like), safe inside a quoted CSS selector. */
export function siteAccentKey(colour: string): string {
  return colour.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "accent";
}

/**
 * The scoped stylesheet for a palette under `[data-site-accent="<key>"]`: the four variables,
 * plus the dark-mode fill for dark pages, dark sections inside the site and light sections
 * inside those. Pair it with `data-accent` on the same element so the derived values recompute.
 */
export function siteAccentCss(palette: SiteAccentPalette, key: string): string {
  const s = `[data-site-accent="${key.replace(/["\\]/g, "")}"]`;
  const light = `--accent-base:${palette.base};--accent-fg:${palette.fg};`;
  let css = `${s}{${light}--accent-ink-light:${palette.inkLight};--accent-ink-dark:${palette.inkDark};}`;
  if (palette.dark) {
    css += `.dark${s},.dark ${s},${s} .dark{--accent-base:${palette.dark.base};--accent-fg:${palette.dark.fg};}`;
    css += `.dark ${s} .light,.dark${s} .light,${s} .dark .light{${light}}`;
  }
  return css;
}
