/**
 * Theme codec for the /themes editor: preset codes, accent palette generation and brand.css.
 *
 * COPIED from the CLI so the docs site does not depend on it (apps/www only depends on the kit):
 *   - preset codec        ← packages/cli/src/preset.ts            (vamos-ui/preset)
 *   - colour maths        ← packages/cli/src/brand/color.ts       (subset: hex/rgb/oklch parsing)
 *   - generateAccent      ← packages/cli/src/brand/accent.ts      (vamos-ui/brand)
 *   - brandCss            ← packages/cli/src/brand/css.ts         (accent + radius part only)
 *   - KIT_ACCENT_BASE     ← packages/cli/src/commands/preset.ts
 * Keep them in sync: `node --test apps/www/src/lib/theme-codec.test.mjs` compares the outputs of
 * this file with the CLI build (packages/cli/dist) for every axis and a spread of colours.
 *
 * Self-contained on purpose (no imports) so Node can run the test with type stripping.
 */

// ---------------------------------------------------------------------------
// Preset codes (packages/cli/src/preset.ts)
// ---------------------------------------------------------------------------

export const PRESET_VERSION = "v1";

export const PRESET_AXES = {
  theme: ["light", "dark"],
  material: ["solid", "glass"],
  accent: ["lime", "ocean", "ember", "rose", "graphite"],
  density: ["comfortable", "compact"],
  font: ["system", "editorial", "grotesk", "corporate"],
  radius: ["default", "sharp", "round"],
} as const;

export type PresetTheme = (typeof PRESET_AXES.theme)[number];
export type PresetMaterial = (typeof PRESET_AXES.material)[number];
export type PresetAccentName = (typeof PRESET_AXES.accent)[number];
export type PresetDensity = (typeof PRESET_AXES.density)[number];
export type PresetFont = (typeof PRESET_AXES.font)[number];
export type PresetRadius = (typeof PRESET_AXES.radius)[number];

export interface Preset {
  theme: PresetTheme;
  material: PresetMaterial;
  /** A named accent, or a custom colour as lower-case "#rrggbb". */
  accent: PresetAccentName | `#${string}`;
  density: PresetDensity;
  font: PresetFont;
  radius: PresetRadius;
}

export const PRESET_DEFAULTS: Readonly<Preset> = Object.freeze({
  theme: "light",
  material: "solid",
  accent: "lime",
  density: "comfortable",
  font: "system",
  radius: "default",
});

const LETTERS = {
  theme: { light: "l", dark: "d" },
  material: { solid: "s", glass: "g" },
  accent: { lime: "l", ocean: "o", ember: "e", rose: "r", graphite: "g" },
  density: { comfortable: "c", compact: "k" },
  font: { system: "s", editorial: "e", grotesk: "g", corporate: "c" },
  radius: { default: "d", sharp: "s", round: "r" },
} as const;

const CUSTOM_ACCENT = "x";

export class PresetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PresetError";
  }
}

const invert = <T extends Record<string, string>>(o: T): Record<string, keyof T> => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k])) as Record<string, keyof T>;
const FROM_LETTER = {
  theme: invert(LETTERS.theme),
  material: invert(LETTERS.material),
  accent: invert(LETTERS.accent),
  density: invert(LETTERS.density),
  font: invert(LETTERS.font),
  radius: invert(LETTERS.radius),
};

export function normalizeHex(value: string): `#${string}` | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  let hex = m[1]!.toLowerCase();
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  return `#${hex}`;
}

export function isNamedAccent(value: string): value is PresetAccentName {
  return (PRESET_AXES.accent as readonly string[]).includes(value);
}

export function normalizePreset(input: Partial<Record<keyof Preset, string>>): Preset {
  const out = { ...PRESET_DEFAULTS } as Preset;
  for (const axis of Object.keys(PRESET_AXES) as (keyof Preset)[]) {
    const raw = input[axis];
    if (raw === undefined || raw === null || raw === "") continue;
    const v = String(raw).trim().toLowerCase();
    if (axis === "accent") {
      if (isNamedAccent(v)) out.accent = v;
      else {
        const hex = normalizeHex(v);
        if (!hex) throw new PresetError(`Unknown accent "${raw}". Use ${PRESET_AXES.accent.join(", ")} or a hex colour such as #4f46e5.`);
        out.accent = hex;
      }
      continue;
    }
    const allowed = PRESET_AXES[axis] as readonly string[];
    if (!allowed.includes(v)) throw new PresetError(`Unknown ${axis} "${raw}". Use one of: ${allowed.join(", ")}.`);
    (out as unknown as Record<string, string>)[axis] = v;
  }
  return out;
}

export function encodePreset(input: Partial<Record<keyof Preset, string>>): string {
  const p = normalizePreset(input);
  const accent = isNamedAccent(p.accent) ? LETTERS.accent[p.accent] : CUSTOM_ACCENT + p.accent.slice(1);
  return [
    PRESET_VERSION,
    LETTERS.theme[p.theme],
    LETTERS.material[p.material],
    accent,
    LETTERS.density[p.density],
    LETTERS.font[p.font],
    p.radius === PRESET_DEFAULTS.radius ? "" : LETTERS.radius[p.radius],
  ].join("");
}

export function decodePreset(code: string): Preset {
  if (typeof code !== "string") throw new PresetError("A preset code must be a string.");
  const s = code.trim().toLowerCase().replace(/[-_.\s]/g, "");
  if (!s) throw new PresetError("The preset code is empty.");
  if (!s.startsWith(PRESET_VERSION)) {
    throw new PresetError(/^v\d/.test(s) ? `Preset version "${s.slice(0, 2)}" is not supported by this vamos-ui version (expected ${PRESET_VERSION}).` : `"${code}" is not a preset code. Codes start with "${PRESET_VERSION}", e.g. v1dgokg.`);
  }
  let i = PRESET_VERSION.length;
  const take = <A extends keyof typeof FROM_LETTER>(axis: A): string => {
    const ch = s[i];
    if (ch === undefined) throw new PresetError(`Preset "${code}" is too short: the ${axis} letter is missing.`);
    const value = FROM_LETTER[axis][ch];
    if (value === undefined) {
      const letters = Object.entries(LETTERS[axis]).map(([k, v]) => `${v}=${k}`).join(", ");
      throw new PresetError(`Preset "${code}": "${ch}" is not a ${axis} letter (${letters}${axis === "accent" ? `, ${CUSTOM_ACCENT}<hex>=custom` : ""}).`);
    }
    i++;
    return value as string;
  };
  const theme = take("theme");
  const material = take("material");
  let accent: string;
  if (s[i] === CUSTOM_ACCENT) {
    const hex = s.slice(i + 1, i + 7);
    if (!/^[0-9a-f]{6}$/.test(hex)) throw new PresetError(`Preset "${code}": a custom accent is "${CUSTOM_ACCENT}" followed by 6 hex digits.`);
    accent = `#${hex}`;
    i += 7;
  } else accent = take("accent");
  const density = take("density");
  const font = take("font");
  const radius = i < s.length ? take("radius") : PRESET_DEFAULTS.radius;
  if (i < s.length) throw new PresetError(`Preset "${code}" has extra characters: "${s.slice(i)}".`);
  return { theme, material, accent, density, font, radius } as Preset;
}

export function tryDecodePreset(code: string): { ok: true; preset: Preset } | { ok: false; error: string } {
  try {
    return { ok: true, preset: decodePreset(code) };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export function describePreset(preset: Preset): string {
  const parts: string[] = [preset.theme, preset.material, preset.accent, preset.density, preset.font];
  if (preset.radius !== PRESET_DEFAULTS.radius) parts.push(`${preset.radius} corners`);
  return parts.join(" · ");
}

/** <html> attributes. Corners are their own axis (data-radius, left out for the default). */
export function presetAttributes(preset: Preset): Record<string, string> {
  return {
    ...(preset.theme === "dark" ? { class: "dark" } : {}),
    "data-material": preset.material,
    "data-accent": presetNeedsBrand(preset) ? "brand" : preset.accent,
    "data-density": preset.density,
    "data-font": preset.font,
    ...(preset.radius !== PRESET_DEFAULTS.radius ? { "data-radius": preset.radius } : {}),
  };
}

/** Only a custom accent colour needs a generated brand.css. */
export function presetNeedsBrand(preset: Preset): boolean {
  return !isNamedAccent(preset.accent);
}

// ---------------------------------------------------------------------------
// Colour maths (packages/cli/src/brand/color.ts — subset)
// ---------------------------------------------------------------------------

interface Rgb {
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
interface Oklab {
  l: number;
  a: number;
  b: number;
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function rgbToOklab({ r, g, b }: Rgb): Oklab {
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

function oklabToRgbRaw({ l: L, a, b }: Oklab): { r: number; g: number; b: number } {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const g = (v: number) => (v < 0 ? -toGamma(-v) : toGamma(v));
  return { r: g(lr), g: g(lg), b: g(lb) };
}

function oklabToOklch({ l, a, b }: Oklab, alpha = 1): Oklch {
  const c = Math.sqrt(a * a + b * b);
  let h = c < 1e-4 ? 0 : (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l, c, h, alpha };
}

function oklchToOklab({ l, c, h }: Oklch): Oklab {
  const rad = (h * Math.PI) / 180;
  return { l, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

const rgbToOklch = (rgb: Rgb): Oklch => oklabToOklch(rgbToOklab(rgb), rgb.alpha);

const EPS = 1e-6;
const inGamut = (c: { r: number; g: number; b: number }) => c.r >= -EPS && c.r <= 1 + EPS && c.g >= -EPS && c.g <= 1 + EPS && c.b >= -EPS && c.b <= 1 + EPS;
const isInGamut = (color: Oklch) => inGamut(oklabToRgbRaw(oklchToOklab(color)));

function gamutMap(color: Oklch): Oklch {
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

function oklchToRgb(color: Oklch): Rgb {
  const raw = oklabToRgbRaw(oklchToOklab(gamutMap(color)));
  return { r: clamp01(raw.r), g: clamp01(raw.g), b: clamp01(raw.b), alpha: color.alpha };
}

function parseHex(hex: string): Rgb | null {
  let h = hex.replace(/^#/, "");
  if (!/^[0-9a-f]+$/i.test(h) || ![3, 4, 6, 8].includes(h.length)) return null;
  if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), alpha: h.length === 8 ? n(6) : 1 };
}

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

/** Hex, rgb()/rgba() and oklch(). (The CLI also reads named colours, hsl(), oklab() and color(srgb).) */
export function parseColor(input: string): Oklch | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;
  if (s.startsWith("#")) {
    const rgb = parseHex(s);
    return rgb ? rgbToOklch(rgb) : null;
  }
  const fn = /^([a-z]+)\((.*)\)$/s.exec(s);
  if (!fn) return null;
  const name = fn[1]!;
  const c = components(fn[2]!);
  if (!c) return null;
  const [p0, p1, p2] = c.parts as [string, string, string];
  const alpha = alphaOf(c.alpha);
  if (name === "rgb" || name === "rgba") {
    const ch = (v: string) => (v.endsWith("%") ? num(v, 1) : num(v) / 255);
    const r = ch(p0);
    const g = ch(p1);
    const b = ch(p2);
    if ([r, g, b].every(Number.isFinite)) return rgbToOklch({ r: clamp01(r), g: clamp01(g), b: clamp01(b), alpha });
  } else if (name === "oklch") {
    const l = num(p0, 1);
    const ch = num(p1, 0.4);
    const h = hue(p2);
    if ([l, ch, h].every(Number.isFinite)) return { l: clamp01(l), c: Math.max(0, ch), h, alpha };
  }
  return null;
}

const trimNum = (n: number, digits: number) => {
  const s = n.toFixed(digits);
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
};

export function formatOklch(color: Oklch): string {
  const c = gamutMap(color);
  const chroma = c.c < 0.0005 ? 0 : c.c;
  const h = chroma === 0 ? 0 : c.h;
  const alpha = c.alpha < 1 ? ` / ${trimNum(c.alpha, 3)}` : "";
  return `oklch(${trimNum(c.l, 3)} ${trimNum(chroma, 3)} ${trimNum(h, 1)}${alpha})`;
}

export function toHex(color: Oklch): string {
  const rgb = oklchToRgb(color);
  const h = (v: number) => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0");
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
}

function luminance(color: Oklch): number {
  const rgb = oklchToRgb(color);
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

export function contrastRatio(a: Oklch | string, b: Oklch | string): number {
  const pa = typeof a === "string" ? parseColor(a) : a;
  const pb = typeof b === "string" ? parseColor(b) : b;
  if (!pa || !pb) return NaN;
  const la = luminance(pa);
  const lb = luminance(pb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const roundContrast = (n: number) => Math.floor(n * 100) / 100;

// ---------------------------------------------------------------------------
// generateAccent (packages/cli/src/brand/accent.ts)
// ---------------------------------------------------------------------------

export const TEXT_CONTRAST = 4.5;
export const UI_CONTRAST = 3;

export const SURFACES = {
  light: { surface: "#ffffff", hardest: "#eef0ea" },
  dark: { surface: "#15180f", hardest: "#1b1e15" },
} as const;

const WHITE: Oklch = { l: 1, c: 0, h: 0, alpha: 1 };

export interface AccentContrast {
  fgOnBase: number;
  inkLightOnLight: number;
  inkDarkOnDark: number;
  darkFgOnBase?: number;
}

export interface AccentPalette {
  source: string;
  base: string;
  fg: string;
  inkLight: string;
  inkDark: string;
  dark?: { base: string; fg: string };
  contrast: AccentContrast;
  warnings: string[];
}

const fmtL = (l: number) => l.toFixed(3);

function seekLightness(from: Oklch, dir: 1 | -1, ok: (c: Oklch) => boolean): Oklch | null {
  for (let i = 0; i <= 200; i++) {
    const l = from.l + dir * i * 0.005;
    if (l < 0 || l > 1) break;
    const c = gamutMap({ ...from, l });
    if (ok(parseColor(formatOklch(c))!)) return c;
  }
  return null;
}

const darkInk = (h: number): Oklch => ({ l: 0.18, c: 0.02, h, alpha: 1 });
const fgString = (fg: Oklch) => (fg.l === 1 && fg.c === 0 ? "#fff" : formatOklch(fg));

interface FillResult {
  base: Oklch;
  fg: Oklch;
  note?: string;
}

function fillWithText(base: Oklch, label: string): FillResult {
  const dark = darkInk(base.h);
  const cw = contrastRatio(WHITE, base);
  const cd = contrastRatio(dark, base);
  if (Math.max(cw, cd) >= TEXT_CONTRAST) return { base, fg: cw >= cd ? WHITE : dark };
  const target = TEXT_CONTRAST + 0.05;
  const forWhite = seekLightness(base, -1, (c) => contrastRatio(WHITE, c) >= target);
  const forDark = seekLightness(base, 1, (c) => contrastRatio(darkInk(c.h), c) >= target);
  const dW = forWhite ? base.l - forWhite.l : Infinity;
  const dD = forDark ? forDark.l - base.l : Infinity;
  const useWhite = dW <= dD;
  const next = (useWhite ? forWhite : forDark) ?? base;
  const fg = useWhite ? WHITE : darkInk(next.h);
  const was = roundContrast(Math.max(cw, cd));
  return {
    base: next,
    fg,
    note: `${label} lightness ${fmtL(base.l)} → ${fmtL(next.l)} so ${useWhite ? "white" : "dark"} text on it reaches 4.5:1 (best was ${was}:1).`,
  };
}

/** One brand colour → the four accent variables (+ dark-mode fill), with WCAG contrast guaranteed. */
export function generateAccent(colour: string): AccentPalette {
  const parsed = parseColor(colour);
  if (!parsed) throw new TypeError(`"${colour}" is not a colour. Use hex (#1d4ed8), rgb(), hsl() or oklch().`);
  const warnings: string[] = [];
  if (parsed.alpha < 1) warnings.push("Transparency is ignored; the accent is used as an opaque colour.");
  let base = gamutMap({ ...parsed, alpha: 1 });
  if (base.c + 0.02 < parsed.c) warnings.push(`The colour is outside sRGB; chroma ${parsed.c.toFixed(3)} → ${base.c.toFixed(3)} so every screen shows the same colour.`);
  if (base.c < 0.03) warnings.push("Very low chroma: the accent reads as grey. That works for a monochrome brand (like graphite); otherwise pick a more saturated colour.");

  const onWhite = contrastRatio(base, SURFACES.light.surface);
  if (onWhite < 1.25) {
    const darker = seekLightness(base, -1, (c) => contrastRatio(c, SURFACES.light.surface) >= 1.35);
    if (darker) {
      warnings.push(`Near-white colour: fill lightness ${fmtL(base.l)} → ${fmtL(darker.l)} so buttons stay visible on white surfaces.`);
      base = darker;
    }
  }

  const fill = fillWithText(base, "Fill");
  if (fill.note) warnings.push(fill.note);
  base = fill.base;
  const fg = fill.fg;

  const lightTarget = TEXT_CONTRAST + 0.05;
  let inkLight = base;
  if (contrastRatio(base, SURFACES.light.hardest) < TEXT_CONTRAST) {
    inkLight = seekLightness(base, -1, (c) => contrastRatio(c, SURFACES.light.hardest) >= lightTarget) ?? { ...base, l: 0.3 };
  }

  let dark: FillResult | undefined;
  if (contrastRatio(base, SURFACES.dark.surface) < 1.6) {
    let lifted: Oklch;
    if (base.c < 0.04) {
      lifted = gamutMap({ ...base, l: Math.min(0.95, Math.max(0.88, 1 - base.l)) });
    } else {
      lifted = seekLightness(base, 1, (c) => contrastRatio(c, SURFACES.dark.surface) >= UI_CONTRAST) ?? { ...base, l: 0.7 };
    }
    dark = fillWithText(lifted, "Dark-mode fill");
    warnings.push(`Very dark colour: dark mode uses a lighter fill (lightness ${fmtL(base.l)} → ${fmtL(dark.base.l)}) so buttons stay visible. Set colors.accentDark to choose it yourself.`);
    if (dark.note) warnings.push(dark.note);
  }

  const from = dark?.base ?? base;
  const darkTarget = TEXT_CONTRAST + 0.05;
  let inkDark = from;
  if (from.l < 0.7 || contrastRatio(from, SURFACES.dark.hardest) < TEXT_CONTRAST) {
    const start = gamutMap({ ...from, l: Math.max(from.l, 0.7), c: from.l < 0.7 ? from.c * 0.75 : from.c });
    inkDark = contrastRatio(start, SURFACES.dark.hardest) >= darkTarget ? start : seekLightness(start, 1, (c) => contrastRatio(c, SURFACES.dark.hardest) >= darkTarget) ?? { ...start, l: 0.9 };
  }

  const out = { base: formatOklch(base), fg: fgString(fg), inkLight: formatOklch(inkLight), inkDark: formatOklch(inkDark) };
  const contrast: AccentContrast = {
    fgOnBase: roundContrast(contrastRatio(out.fg, out.base)),
    inkLightOnLight: roundContrast(contrastRatio(out.inkLight, SURFACES.light.hardest)),
    inkDarkOnDark: roundContrast(contrastRatio(out.inkDark, SURFACES.dark.hardest)),
  };
  const palette: AccentPalette = { source: colour, ...out, contrast, warnings };
  if (dark) {
    palette.dark = { base: formatOklch(dark.base), fg: fgString(dark.fg) };
    contrast.darkFgOnBase = roundContrast(contrastRatio(palette.dark.fg, palette.dark.base));
  }
  return palette;
}

// ---------------------------------------------------------------------------
// brand.css for a preset (packages/cli/src/brand/css.ts + commands/preset.ts)
// ---------------------------------------------------------------------------

/** The kit's accent fills, used when a named accent needs a brand.css for a custom radius. */
export const KIT_ACCENT_BASE: Record<PresetAccentName, string> = {
  lime: "oklch(0.89 0.21 122)",
  ocean: "oklch(0.55 0.17 245)",
  ember: "oklch(0.7 0.19 45)",
  rose: "oklch(0.58 0.21 10)",
  graphite: "oklch(0.25 0.01 120)",
};

/** The --radius each corner setting resolves to (styles.css: --radius-base × --radius-scale). */
export const RADIUS: Record<"sharp" | "round", { comfortable: string; compact: string }> = {
  sharp: { comfortable: "6px", compact: "4px" },
  round: { comfortable: "20px", compact: "14px" },
};

/** The accent colour a preset's brand.css is generated from. */
export const presetAccentSource = (preset: Preset) => (isNamedAccent(preset.accent) ? KIT_ACCENT_BASE[preset.accent] : preset.accent);

/**
 * The brand.css `vamos-ui init/theme/create --preset` writes for a custom accent (brandCss for a
 * brand with only colors.accent set; corners are data-radius, not brand.css). null when none is needed.
 */
export function presetBrandCss(preset: Preset, name = "my-app"): string | null {
  if (!presetNeedsBrand(preset)) return null;
  const palette = generateAccent(presetAccentSource(preset));
  const sel = `[data-accent="brand"]`;
  const out: string[] = [];
  out.push(`/* vamos-ui brand: ${name.replace(/\*\//g, "")}`);
  out.push(" * Generated by `vamos-ui brand apply` from vamos.brand.json. Edit the JSON and re-run");
  out.push(' * instead of editing this file. Use: <html data-accent="brand">');
  out.push(" */");
  out.push("");
  out.push(`${sel} {`);
  out.push(`  --accent-base: ${palette.base}; /* source ${palette.source.replace(/\*\//g, "")} */`);
  out.push(`  --accent-fg: ${palette.fg}; /* ${palette.contrast.fgOnBase}:1 on the fill */`);
  out.push(`  --accent-ink-light: ${palette.inkLight}; /* ${palette.contrast.inkLightOnLight}:1 on light surfaces */`);
  out.push(`  --accent-ink-dark: ${palette.inkDark}; /* ${palette.contrast.inkDarkOnDark}:1 on dark surfaces */`);
  out.push("}");
  if (palette.dark) {
    out.push(`.dark${sel},`);
    out.push(`.dark ${sel} {`);
    out.push(`  --accent-base: ${palette.dark.base};`);
    out.push(`  --accent-fg: ${palette.dark.fg}; /* ${palette.contrast.darkFgOnBase}:1 on the dark-mode fill */`);
    out.push("}");
    out.push(`.dark .light${sel},`);
    out.push(`.dark .light ${sel} {`);
    out.push(`  --accent-base: ${palette.base};`);
    out.push(`  --accent-fg: ${palette.fg};`);
    out.push("}");
  }
  return out.join("\n") + "\n";
}
