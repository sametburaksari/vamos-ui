/**
 * Colour maths for the brand tools: CSS colour parsing, sRGB ⇄ OKLab/OKLCH, gamut mapping
 * and WCAG 2.x contrast. Pure: no Node built-ins, no dependencies.
 */

/** sRGB with gamma, channels 0–1. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

export interface Oklch {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

export interface Oklab {
  l: number;
  a: number;
  b: number;
}

// ---------------------------------------------------------------------------
// Conversions
// ---------------------------------------------------------------------------

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function rgbToOklab({ r, g, b }: Rgb): Oklab {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** OKLab → sRGB, unclamped (channels may fall outside 0–1 when out of gamut). */
export function oklabToRgbRaw({ l: L, a, b }: Oklab): { r: number; g: number; b: number } {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const g = (v: number) => (v < 0 ? -toGamma(-v) : toGamma(v));
  return { r: g(lr), g: g(lg), b: g(lb) };
}

export function oklabToOklch({ l, a, b }: Oklab, alpha = 1): Oklch {
  const c = Math.sqrt(a * a + b * b);
  let h = c < 1e-4 ? 0 : (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l, c, h, alpha };
}

export function oklchToOklab({ l, c, h }: Oklch): Oklab {
  const rad = (h * Math.PI) / 180;
  return { l, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

export const rgbToOklch = (rgb: Rgb): Oklch => oklabToOklch(rgbToOklab(rgb), rgb.alpha);

const EPS = 1e-6;
const inGamut = (c: { r: number; g: number; b: number }) =>
  c.r >= -EPS && c.r <= 1 + EPS && c.g >= -EPS && c.g <= 1 + EPS && c.b >= -EPS && c.b <= 1 + EPS;

export function isInGamut(color: Oklch): boolean {
  return inGamut(oklabToRgbRaw(oklchToOklab(color)));
}

/** Brings a colour into sRGB by lowering chroma (hue and lightness kept). */
export function gamutMap(color: Oklch): Oklch {
  const l = Math.min(1, Math.max(0, color.l));
  const base = { ...color, l };
  if (isInGamut(base)) return base;
  let lo = 0;
  let hi = base.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (isInGamut({ ...base, c: mid })) lo = mid;
    else hi = mid;
  }
  return { ...base, c: lo };
}

export function oklchToRgb(color: Oklch): Rgb {
  const raw = oklabToRgbRaw(oklchToOklab(gamutMap(color)));
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return { r: clamp(raw.r), g: clamp(raw.g), b: clamp(raw.b), alpha: color.alpha };
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

// CSS named colours (CSS Color 4), packed as name:hex.
const NAMED_PACKED =
  "aliceblue:f0f8ff antiquewhite:faebd7 aqua:00ffff aquamarine:7fffd4 azure:f0ffff beige:f5f5dc bisque:ffe4c4 black:000000 blanchedalmond:ffebcd blue:0000ff blueviolet:8a2be2 brown:a52a2a burlywood:deb887 cadetblue:5f9ea0 chartreuse:7fff00 chocolate:d2691e coral:ff7f50 cornflowerblue:6495ed cornsilk:fff8dc crimson:dc143c cyan:00ffff darkblue:00008b darkcyan:008b8b darkgoldenrod:b8860b darkgray:a9a9a9 darkgreen:006400 darkgrey:a9a9a9 darkkhaki:bdb76b darkmagenta:8b008b darkolivegreen:556b2f darkorange:ff8c00 darkorchid:9932cc darkred:8b0000 darksalmon:e9967a darkseagreen:8fbc8f darkslateblue:483d8b darkslategray:2f4f4f darkslategrey:2f4f4f darkturquoise:00ced1 darkviolet:9400d3 deeppink:ff1493 deepskyblue:00bfff dimgray:696969 dimgrey:696969 dodgerblue:1e90ff firebrick:b22222 floralwhite:fffaf0 forestgreen:228b22 fuchsia:ff00ff gainsboro:dcdcdc ghostwhite:f8f8ff gold:ffd700 goldenrod:daa520 gray:808080 green:008000 greenyellow:adff2f grey:808080 honeydew:f0fff0 hotpink:ff69b4 indianred:cd5c5c indigo:4b0082 ivory:fffff0 khaki:f0e68c lavender:e6e6fa lavenderblush:fff0f5 lawngreen:7cfc00 lemonchiffon:fffacd lightblue:add8e6 lightcoral:f08080 lightcyan:e0ffff lightgoldenrodyellow:fafad2 lightgray:d3d3d3 lightgreen:90ee90 lightgrey:d3d3d3 lightpink:ffb6c1 lightsalmon:ffa07a lightseagreen:20b2aa lightskyblue:87cefa lightslategray:778899 lightslategrey:778899 lightsteelblue:b0c4de lightyellow:ffffe0 lime:00ff00 limegreen:32cd32 linen:faf0e6 magenta:ff00ff maroon:800000 mediumaquamarine:66cdaa mediumblue:0000cd mediumorchid:ba55d3 mediumpurple:9370db mediumseagreen:3cb371 mediumslateblue:7b68ee mediumspringgreen:00fa9a mediumturquoise:48d1cc mediumvioletred:c71585 midnightblue:191970 mintcream:f5fffa mistyrose:ffe4e1 moccasin:ffe4b5 navajowhite:ffdead navy:000080 oldlace:fdf5e6 olive:808000 olivedrab:6b8e23 orange:ffa500 orangered:ff4500 orchid:da70d6 palegoldenrod:eee8aa palegreen:98fb98 paleturquoise:afeeee palevioletred:db7093 papayawhip:ffefd5 peachpuff:ffdab9 peru:cd853f pink:ffc0cb plum:dda0dd powderblue:b0e0e6 purple:800080 rebeccapurple:663399 red:ff0000 rosybrown:bc8f8f royalblue:4169e1 saddlebrown:8b4513 salmon:fa8072 sandybrown:f4a460 seagreen:2e8b57 seashell:fff5ee sienna:a0522d silver:c0c0c0 skyblue:87ceeb slateblue:6a5acd slategray:708090 slategrey:708090 snow:fffafa springgreen:00ff7f steelblue:4682b4 tan:d2b48c teal:008080 thistle:d8bfd8 tomato:ff6347 turquoise:40e0d0 violet:ee82ee wheat:f5deb3 white:ffffff whitesmoke:f5f5f5 yellow:ffff00 yellowgreen:9acd32";

const NAMED = new Map(NAMED_PACKED.split(" ").map((pair) => pair.split(":") as [string, string]));

/** Is `name` a CSS named colour? */
export const isNamedColor = (name: string) => NAMED.has(name.toLowerCase());

function parseHex(hex: string): Rgb | null {
  let h = hex.replace(/^#/, "");
  if (!/^[0-9a-f]+$/i.test(h) || ![3, 4, 6, 8].includes(h.length)) return null;
  if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), alpha: h.length === 8 ? n(6) : 1 };
}

/** Splits the inside of a CSS colour function into components and an optional alpha. */
function components(inner: string): { parts: string[]; alpha?: string } | null {
  const s = inner.trim();
  if (s.includes(",")) {
    const parts = s.split(",").map((x) => x.trim());
    if (parts.length === 4) return { parts: parts.slice(0, 3), alpha: parts[3] };
    return parts.length === 3 ? { parts } : null;
  }
  const [main, alpha] = s.split("/").map((x) => x.trim());
  const parts = main!.split(/\s+/).filter(Boolean);
  return parts.length === 3 ? { parts, alpha } : null;
}

function num(v: string, percentScale = 1): number {
  if (v === "none") return 0;
  if (v.endsWith("%")) return (parseFloat(v) / 100) * percentScale;
  return parseFloat(v);
}

function hue(v: string): number {
  const m = /^(-?[\d.]+)(deg|rad|grad|turn)?$/.exec(v);
  if (!m) return v === "none" ? 0 : NaN;
  const n = parseFloat(m[1]!);
  const unit = m[2] ?? "deg";
  const deg = unit === "rad" ? (n * 180) / Math.PI : unit === "grad" ? n * 0.9 : unit === "turn" ? n * 360 : n;
  return ((deg % 360) + 360) % 360;
}

function alphaOf(v: string | undefined): number {
  if (v === undefined) return 1;
  const a = num(v, 1);
  return Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 1;
}

function hslToRgb(h: number, s: number, l: number, alpha: number): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: f(0), g: f(8), b: f(4), alpha };
}

/**
 * Parses a CSS colour: hex, named, rgb()/rgba(), hsl()/hsla(), oklch(), oklab() and
 * color(srgb …). Returns OKLCH (possibly outside sRGB) or null when it is not a colour
 * this module understands (var(), currentColor, lab(), transparent …).
 */
export function parseColor(input: string): Oklch | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;
  if (s.startsWith("#")) {
    const rgb = parseHex(s);
    return rgb ? rgbToOklch(rgb) : null;
  }
  if (NAMED.has(s)) return rgbToOklch(parseHex(NAMED.get(s)!)!);
  const fn = /^([a-z]+)\((.*)\)$/s.exec(s);
  if (!fn) return null;
  const name = fn[1]!;
  if (name === "color") {
    const m = /^(srgb|srgb-linear|display-p3)\s+(.*)$/.exec(fn[2]!.trim());
    if (!m || m[1] !== "srgb") return null;
    const c = components(m[2]!);
    if (!c) return null;
    const [r, g, b] = c.parts.map((x) => num(x, 1));
    if (![r, g, b].every(Number.isFinite)) return null;
    return rgbToOklch({ r: r!, g: g!, b: b!, alpha: alphaOf(c.alpha) });
  }
  const c = components(fn[2]!);
  if (!c) return null;
  const [p0, p1, p2] = c.parts as [string, string, string];
  const alpha = alphaOf(c.alpha);
  let out: Oklch | null = null;
  if (name === "rgb" || name === "rgba") {
    const ch = (v: string) => (v.endsWith("%") ? num(v, 1) : num(v) / 255);
    const r = ch(p0);
    const g = ch(p1);
    const b = ch(p2);
    if ([r, g, b].every(Number.isFinite)) out = rgbToOklch({ r: clamp01(r), g: clamp01(g), b: clamp01(b), alpha });
  } else if (name === "hsl" || name === "hsla") {
    const h = hue(p0);
    const sat = num(p1.endsWith("%") ? p1 : `${p1}%`, 1);
    const lig = num(p2.endsWith("%") ? p2 : `${p2}%`, 1);
    if ([h, sat, lig].every(Number.isFinite)) out = rgbToOklch(hslToRgb(h, clamp01(sat), clamp01(lig), alpha));
  } else if (name === "oklch") {
    const l = num(p0, 1);
    const ch = num(p1, 0.4);
    const h = hue(p2);
    if ([l, ch, h].every(Number.isFinite)) out = { l: clamp01(l), c: Math.max(0, ch), h, alpha };
  } else if (name === "oklab") {
    const l = num(p0, 1);
    const a = num(p1, 0.4);
    const b = num(p2, 0.4);
    if ([l, a, b].every(Number.isFinite)) out = oklabToOklch({ l: clamp01(l), a, b }, alpha);
  }
  return out;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Every colour literal in a piece of CSS/markup (hex, rgb/hsl/oklch/oklab functions). */
export const COLOR_LITERAL = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab)\([^()]*\)/g;

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const trim = (n: number, digits: number) => {
  const s = n.toFixed(digits);
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
};

/** `oklch(0.64 0.17 245)` — the house format for accent values. */
export function formatOklch(color: Oklch): string {
  const c = gamutMap(color);
  const chroma = c.c < 0.0005 ? 0 : c.c;
  const h = chroma === 0 ? 0 : c.h;
  const alpha = c.alpha < 1 ? ` / ${trim(c.alpha, 3)}` : "";
  return `oklch(${trim(c.l, 3)} ${trim(chroma, 3)} ${trim(h, 1)}${alpha})`;
}

export function toHex(color: Oklch | Rgb): string {
  const rgb = "r" in color ? color : oklchToRgb(color);
  const h = (v: number) => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0");
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
}

/** 0–255 integer channels, for terminal swatches. */
export function toRgb255(color: Oklch): [number, number, number] {
  const rgb = oklchToRgb(color);
  return [Math.round(rgb.r * 255), Math.round(rgb.g * 255), Math.round(rgb.b * 255)];
}

// ---------------------------------------------------------------------------
// Contrast and distance
// ---------------------------------------------------------------------------

/** WCAG 2.x relative luminance. */
export function luminance(color: Oklch | Rgb): number {
  const rgb = "r" in color ? color : oklchToRgb(color);
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

/** WCAG 2.x contrast ratio (1–21). Accepts parsed colours or CSS strings. */
export function contrastRatio(a: Oklch | Rgb | string, b: Oklch | Rgb | string): number {
  const pa = typeof a === "string" ? parseColor(a) : a;
  const pb = typeof b === "string" ? parseColor(b) : b;
  if (!pa || !pb) return NaN;
  const la = luminance(pa);
  const lb = luminance(pb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Rounded down to 2 decimals so a reported 4.5 is never really 4.499. */
export const roundContrast = (n: number) => Math.floor(n * 100) / 100;

/** Euclidean distance in OKLab (≈ ΔE OK; 0.02 is barely visible, 0.1 is clearly different). */
export function deltaE(a: Oklch, b: Oklch): number {
  const x = oklchToOklab(a);
  const y = oklchToOklab(b);
  return Math.hypot(x.l - y.l, x.a - y.a, x.b - y.b);
}

/** Shortest angle between two hues, 0–180. */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Low-chroma colours read as grey; they are skipped as accent candidates. */
export const isNeutral = (c: Oklch, threshold = 0.035) => c.c < threshold;
