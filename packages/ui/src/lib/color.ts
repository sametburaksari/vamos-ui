/**
 * Colour helpers for Color picker (and anything that shows user-defined colours):
 * parse hex / rgb() / oklch() strings, convert hex ↔ OKLCH, and compute WCAG contrast.
 * React-free (works in server components).
 *
 * Values in the kit's public APIs are always hex: `"#rrggbb"` or `"#rrggbbaa"`.
 */

/** Red, green, blue in 0–255, alpha in 0–1. */
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** OKLCH: lightness 0–1, chroma ≥ 0 (≈ 0–0.4 in sRGB), hue in degrees, alpha 0–1. */
export interface OKLCH {
  l: number;
  c: number;
  h: number;
  a: number;
}

export type ColorFormat = "hex" | "rgb" | "oklch";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round = (n: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

/** Parses `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` (the `#` is optional). */
export function hexToRgba(input: string): RGBA | null {
  const hex = input.trim().replace(/^#/, "");
  if (!/^[0-9a-f]+$/i.test(hex)) return null;
  let full: string;
  if (hex.length === 3 || hex.length === 4) full = [...hex].map((c) => c + c).join("");
  else if (hex.length === 6 || hex.length === 8) full = hex;
  else return null;
  const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? round(n(6) / 255, 3) : 1 };
}

const toHexByte = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");

/** `"#rrggbb"`, or `"#rrggbbaa"` when `withAlpha` (default: only when alpha < 1). Lowercase. */
export function rgbaToHex(c: RGBA, withAlpha: boolean = c.a < 1): string {
  return `#${toHexByte(c.r)}${toHexByte(c.g)}${toHexByte(c.b)}${withAlpha ? toHexByte(c.a * 255) : ""}`;
}

const channel = (s: string, max: number) => (s.endsWith("%") ? (parseFloat(s) / 100) * max : parseFloat(s));
const alphaOf = (s: string | undefined) => (s === undefined ? 1 : clamp(channel(s, 1), 0, 1));

/**
 * Parses any colour string the picker accepts: hex (with or without `#`), `rgb()`/`rgba()`
 * (comma or space syntax) and `oklch()`. Returns `null` for anything else.
 *
 * ```ts
 * parseColor("c6f432");                   // { r: 198, g: 244, b: 50, a: 1 }
 * parseColor("oklch(89% 0.21 122 / 50%)"); // …a: 0.5
 * ```
 */
export function parseColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;
  const fn = /^(rgba?|oklch)\(\s*([^)]*)\)$/.exec(s);
  if (!fn) return hexToRgba(s);
  const [, name, body] = fn;
  const [main, slashAlpha] = body!.split("/").map((p) => p.trim());
  const parts = main!.split(/[\s,]+/).filter(Boolean);
  const alpha = slashAlpha ?? (parts.length === 4 ? parts[3] : undefined);
  if (parts.length < 3 || parts.slice(0, 3).some((p) => Number.isNaN(parseFloat(p)))) return null;
  if (name === "oklch") {
    const l = channel(parts[0]!, 1);
    const c = parts[1]!.endsWith("%") ? (parseFloat(parts[1]!) / 100) * 0.4 : parseFloat(parts[1]!);
    const h = parseFloat(parts[2]!);
    return oklchToRgba({ l, c, h, a: alphaOf(alpha) });
  }
  return {
    r: clamp(channel(parts[0]!, 255), 0, 255),
    g: clamp(channel(parts[1]!, 255), 0, 255),
    b: clamp(channel(parts[2]!, 255), 0, 255),
    a: round(alphaOf(alpha), 3),
  };
}

/** Normalises any accepted colour string to lowercase hex, or `null` if it can't be parsed. */
export function toHex(input: string, withAlpha?: boolean): string | null {
  const c = parseColor(input);
  return c ? rgbaToHex(c, withAlpha ?? c.a < 1) : null;
}

/* ---------------------------------------------------------------- OKLab */

const toLinear = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** sRGB → OKLCH. */
export function rgbaToOklch({ r, g, b, a }: RGBA): OKLCH {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.sqrt(A * A + B * B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h: c < 1e-4 ? 0 : h, a };
}

/** OKLCH → sRGB, clipped to the sRGB gamut. */
export function oklchToRgba({ l, c, h, a }: OKLCH): RGBA {
  const hr = (h * Math.PI) / 180;
  const A = c * Math.cos(hr);
  const B = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = l - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = l - 0.0894841775 * A - 1.291485548 * B;
  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;
  return {
    r: clamp(fromLinear(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S), 0, 255),
    g: clamp(fromLinear(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S), 0, 255),
    b: clamp(fromLinear(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S), 0, 255),
    a: clamp(a, 0, 1),
  };
}

/**
 * Formats a hex value for display / editing.
 *
 * ```ts
 * formatColor("#c6f432", "rgb");   // "rgb(198 244 50)"
 * formatColor("#c6f432", "oklch"); // "oklch(91.5% 0.205 125.3)"
 * ```
 */
export function formatColor(hex: string, format: ColorFormat = "hex"): string {
  const c = parseColor(hex);
  if (!c) return hex;
  const alpha = c.a < 1 ? ` / ${round(c.a * 100)}%` : "";
  if (format === "rgb") return `rgb(${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)}${alpha})`;
  if (format === "oklch") {
    const o = rgbaToOklch(c);
    return `oklch(${round(o.l * 100, 1)}% ${round(o.c, 3)} ${round(o.h, 1)}${alpha})`;
  }
  return rgbaToHex(c);
}

/* ---------------------------------------------------------------- Contrast */

/** WCAG 2 relative luminance (0 = black, 1 = white). Alpha is ignored. */
export function relativeLuminance({ r, g, b }: RGBA): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Composites a translucent colour over an opaque background. */
export function blend(fg: RGBA, bg: RGBA): RGBA {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

/**
 * WCAG 2 contrast ratio between two colours (1–21), or `null` if either can't be parsed.
 * A translucent colour is composited over the other one first.
 */
export function contrastRatio(a: string, b: string): number | null {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return null;
  const bgOpaque = { ...cb, a: 1 };
  const la = relativeLuminance(ca.a < 1 ? blend(ca, bgOpaque) : ca);
  const lb = relativeLuminance(bgOpaque);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG 2 rating for a contrast ratio: AAA ≥ 7, AA ≥ 4.5, AA large text ≥ 3. */
export function contrastLevel(ratio: number): "AAA" | "AA" | "AA-large" | "fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-large";
  return "fail";
}

/** Black or white — whichever reads better on `background`. */
export function readableOn(background: string): "#000000" | "#ffffff" {
  const white = contrastRatio("#ffffff", background) ?? 21;
  const black = contrastRatio("#000000", background) ?? 21;
  return black >= white ? "#000000" : "#ffffff";
}
