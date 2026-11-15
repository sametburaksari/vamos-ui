/**
 * Theme codec for the /themes editor: preset codes, accent palette generation and brand.css.
 *
 * COPIED from the CLI so the docs site does not depend on it (apps/www only depends on the kit):
 *   - preset codec        ← packages/cli/src/preset.ts            (vamos-ui/preset)
 *   - colour maths        ← packages/cli/src/brand/color.ts       (subset: hex/rgb/oklch parsing)
 *   - generateAccent      ← packages/cli/src/brand/accent.ts      (vamos-ui/brand)
 *   - brandCss            ← packages/cli/src/brand/css.ts         (accent, accent-2 + radius part only)
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
  density: ["comfortable", "compact", "spacious"],
  /** Every pairing in @vamos-ui/react/fonts (same ids); the classic four first. */
  font: [
    "system", "editorial", "grotesk", "corporate",
    "newsroom", "magazine", "bookish", "poster", "fintech", "friendly", "boutique", "luxe", "studio",
    "product", "bistro", "civic", "portal", "tabloid", "neon", "grove", "retail", "arcade", "naskh", "kufi",
  ],
  radius: ["default", "sharp", "round", "none", "pill"],
  scene: ["neutral", "paper", "warm", "ink"],
} as const;

export type PresetTheme = (typeof PRESET_AXES.theme)[number];
export type PresetMaterial = (typeof PRESET_AXES.material)[number];
export type PresetAccentName = (typeof PRESET_AXES.accent)[number];
export type PresetDensity = (typeof PRESET_AXES.density)[number];
export type PresetFont = (typeof PRESET_AXES.font)[number];
export type PresetRadius = (typeof PRESET_AXES.radius)[number];
export type PresetScene = (typeof PRESET_AXES.scene)[number];

export interface Preset {
  theme: PresetTheme;
  material: PresetMaterial;
  /** A named accent, or a custom colour as lower-case "#rrggbb". */
  accent: PresetAccentName | `#${string}`;
  density: PresetDensity;
  font: PresetFont;
  radius: PresetRadius;
  scene: PresetScene;
}

/** The values the CLI assumes when vamos.json leaves an axis out. */
export const PRESET_DEFAULTS: Readonly<Preset> = Object.freeze({
  theme: "light",
  material: "solid",
  accent: "lime",
  density: "comfortable",
  font: "system",
  radius: "default",
  scene: "neutral",
});

/** One letter per value. Letters are unique within an axis. */
const LETTERS = {
  theme: { light: "l", dark: "d" },
  material: { solid: "s", glass: "g" },
  accent: { lime: "l", ocean: "o", ember: "e", rose: "r", graphite: "g" },
  density: { comfortable: "c", compact: "k", spacious: "p" },
  font: {
    system: "s", editorial: "e", grotesk: "g", corporate: "c",
    newsroom: "n", magazine: "m", bookish: "b", poster: "p", fintech: "f", friendly: "r", boutique: "q", luxe: "u", studio: "y",
    product: "d", bistro: "i", civic: "v", portal: "o", tabloid: "t", neon: "z", grove: "w", retail: "h", arcade: "l", naskh: "a", kufi: "k",
  },
  radius: { default: "d", sharp: "s", round: "r", none: "n", pill: "p" },
  scene: { neutral: "n", paper: "p", warm: "w", ink: "i" },
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
  scene: invert(LETTERS.scene),
};

/** "#4F46E5", "4f46e5" or "#abc" → "#4f46e5"; null when it is not a hex colour. */
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

/**
 * Fills missing axes with the defaults and checks every value. Accepts a custom accent as any
 * hex form ("#ABC", "4f46e5"). Throws a PresetError on an unknown value.
 */
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

/** Preset → code. The input is normalised first, so partial presets work. */
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
    p.radius === PRESET_DEFAULTS.radius && p.scene === PRESET_DEFAULTS.scene ? "" : LETTERS.radius[p.radius],
    p.scene === PRESET_DEFAULTS.scene ? "" : LETTERS.scene[p.scene],
  ].join("");
}

/** Code → preset. Throws a PresetError that says which position is wrong. */
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
  const scene = i < s.length ? take("scene") : PRESET_DEFAULTS.scene;
  if (i < s.length) throw new PresetError(`Preset "${code}" has extra characters: "${s.slice(i)}".`);
  return { theme, material, accent, density, font, radius, scene } as Preset;
}

/** Decode without throwing. */
export function tryDecodePreset(code: string): { ok: true; preset: Preset } | { ok: false; error: string } {
  try {
    return { ok: true, preset: decodePreset(code) };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export function isPresetCode(code: string): boolean {
  return tryDecodePreset(code).ok;
}

/** "dark · glass · ocean · compact · grotesk" (radius and scene only when not default). */
export function describePreset(preset: Preset): string {
  const parts: string[] = [preset.theme, preset.material, preset.accent, preset.density, preset.font];
  if (preset.radius !== PRESET_DEFAULTS.radius) parts.push(`${preset.radius} corners`);
  if (preset.scene !== PRESET_DEFAULTS.scene) parts.push(`${preset.scene} scene`);
  return parts.join(" · ");
}

/**
 * The attributes for <html>. A custom accent needs the generated brand.css (`vamos-ui init --preset`
 * / `theme --preset` write it), so it maps to data-accent="brand". Corners are their own axis:
 * data-radius="sharp|round" (left out for the default), which works with every accent.
 */
export function presetAttributes(preset: Preset): Record<string, string> {
  return {
    ...(preset.theme === "dark" ? { class: "dark" } : {}),
    "data-material": preset.material,
    "data-accent": presetNeedsBrand(preset) ? "brand" : preset.accent,
    "data-density": preset.density,
    "data-font": preset.font,
    ...(preset.radius !== PRESET_DEFAULTS.radius ? { "data-radius": preset.radius } : {}),
    ...(preset.scene !== PRESET_DEFAULTS.scene ? { "data-scene": preset.scene } : {}),
  };
}

/** Does applying this preset need a generated brand.css? Only for a custom accent colour. */
export function presetNeedsBrand(preset: Preset): boolean {
  return !isNamedAccent(preset.accent);
}

// ---------------------------------------------------------------------------
// Style families: named starting points, one preset code each
// ---------------------------------------------------------------------------

export interface PresetFamily {
  /** Name for `vamos-ui theme --family <id>`. */
  id: string;
  label: string;
  /** The mood and the sites it fits. */
  description: string;
  /** The preset code the family applies. */
  code: string;
  /** Second accent for gradients and highlights (brand.colors.accent2). Derived from the accent when absent. */
  accent2?: `#${string}`;
  /** `dir` for <html>. Only the Arabic family sets it. */
  dir?: "rtl";
  /** Suggested data-motion value (full | subtle | off). */
  motion: "full" | "subtle" | "off";
  /** One line on how to hold the look: card treatment, what to avoid. */
  notes: string;
}

/**
 * Twelve style families plus the Arabic RTL modifier. Each is one preset code, so an AI agent or a
 * recipe can pick a look by name (`theme --family newsroom`) and a person can share it as a code.
 * Accents are our own choices; every custom one goes through the same contrast-checked accent
 * generator as a brand colour.
 */
export const PRESET_FAMILIES: readonly PresetFamily[] = Object.freeze([
  { id: "portal", label: "Classic Portal", description: "White page, cobalt accent, bold grotesk headlines, coloured category chips. Dense news and magazine homepages.", code: "v1lsx2448c8kos", motion: "subtle", notes: "Image-top cards, a category chip on the image (bg-cat-N text-cat-fg), dark block-title bars, a tight three-column grid." },
  { id: "tabloid", label: "Tabloid", description: "Black and white with one hot red, heavy condensed capitals, square corners. Breaking news, sport, nightlife.", code: "v1lsxe23b2ektn", accent2: "#f5c400", motion: "full", notes: "Text over images with a dark gradient, numbered lists, uppercase kickers; accent-2 (yellow) only for BREAKING." },
  { id: "newsroom", label: "Editorial Serif", description: "Ink on warm white, an oxblood accent, optical-size serif headlines over a calm sans. Magazines, long reads, culture.", code: "v1lsx7a1f2bcnsw", motion: "subtle", notes: "Large images with captions, italic serif decks, generous gutters, hairline rules between items instead of cards." },
  { id: "broadsheet", label: "Broadsheet", description: "Parchment scene, near-black ink, one rust accent, Garamond headings, no corners. Vintage papers and archives.", code: "v1lsx9a3b16kbnp", motion: "off", notes: "Column rules, a nameplate masthead, almost no card chrome; keep imagery in black and white or duotone." },
  { id: "neon", label: "Dark Neon", description: "Near-black scene, an electric teal accent, wide display type, pill controls. Gaming, music, video.", code: "v1dsx19e3c4kzpi", accent2: "#b14dff", motion: "full", notes: "Dark surfaces, an accent glow on hover, round thumbnails, an accent underline on titles; one neon colour, never three." },
  { id: "web3", label: "Gradient Glass", description: "Deep violet-navy with an indigo-to-fuchsia gradient, glass surfaces and big corners. Web3, AI and gaming launches.", code: "v1dgx6d4affcfr", accent2: "#e040c8", motion: "full", notes: "Glass cards, gradient borders and buttons (bg-accent-gradient), big rounded tiles; keep body text on solid surfaces." },
  { id: "saas", label: "SaaS Clean", description: "Cool grey scene, one saturated indigo, a tight Swiss grotesk, soft shadows. Directories, apps, B2B sites.", code: "v1lsx4a3fd6cd", motion: "subtle", notes: "White cards with soft shadows, icon tiles, search-first heroes; one accent for actions only." },
  { id: "pastel", label: "Soft Pastel", description: "Cream scene, a coral accent with mint, rounded type with a handwritten accent, round corners. Lifestyle, kids, beauty.", code: "v1lsxf2665acrrw", accent2: "#3fb58f", motion: "full", notes: "Rounded image cards, circular avatars, sticker-like category chips; one handwritten word per heading at most (font-accent)." },
  { id: "luxury", label: "Luxury Boutique", description: "Near-black scene, a muted brass accent, a razor-thin Didone, no corners and a lot of air. Fashion, interiors, wine, law.", code: "v1dsxb8955apuni", motion: "subtle", notes: "Edge-to-edge photographs, thin rules, small letter-spaced uppercase labels; slow crossfades, never bounce." },
  { id: "earthy", label: "Earthy Nature", description: "Sand scene, moss green, a soft sturdy serif over an open grotesk. Nature, food, gardens, travel.", code: "v1lsx4f6b2acwdw", accent2: "#b7792b", motion: "subtle", notes: "Photo-led cards, leaf-tone category tags, natural textures; avoid saturated blues." },
  { id: "agency", label: "Playful Agency", description: "A fuchsia accent with mint pops, an extended avant-garde display, round corners. Studios, creators, portfolios.", code: "v1lsxd6249fcyr", accent2: "#2fd3a6", motion: "full", notes: "Colour-block tiles, stickers, oversized type, marquees; a hand-drawn accent word (font-accent) for warmth." },
  { id: "commerce", label: "Minimal Commerce", description: "Untinted white, graphite type, one tight grotesk, pill buttons on square-ish cards. Shops and catalogues.", code: "v1lsgchpi", motion: "subtle", notes: "Product-first cards, swatch dots, the danger ink for sale prices; image swap on hover is the only motion." },
  { id: "arabic", label: "Arabic RTL", description: "A Naskh headline face over IBM Plex Sans Arabic, mirrored layout. Arabic news and portals; switch the font to kufi for apps.", code: "v1lsocas", dir: "rtl", motion: "subtle", notes: 'Set dir="rtl" and lang="ar"; no letter-spacing on Arabic, no italics, no uppercase. Latin runs use the matching Plex Latin.' },
] satisfies PresetFamily[]);

/** Looks a family up by id or label, case-insensitively ("Dark Neon", "neon"). */
export function getPresetFamily(name: string): PresetFamily | undefined {
  const q = name.trim().toLowerCase().replace(/[\s_]+/g, "-");
  return PRESET_FAMILIES.find((f) => f.id === q || f.label.toLowerCase().replace(/\s+/g, "-") === q);
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
export const RADIUS: Record<PresetRadius, Record<PresetDensity, string>> = {
  default: { comfortable: "14px", compact: "10px", spacious: "16px" },
  sharp: { comfortable: "6px", compact: "4px", spacious: "6px" },
  round: { comfortable: "20px", compact: "14px", spacious: "22px" },
  none: { comfortable: "0px", compact: "0px", spacious: "0px" },
  pill: { comfortable: "14px · pill controls", compact: "10px · pill controls", spacious: "16px · pill controls" },
};

/** Hue turn for a derived second accent (packages/cli/src/brand/css.ts ACCENT2_HUE_TURN). */
export const ACCENT2_HUE_TURN = 60;

/** The colour the second accent is generated from (packages/cli/src/brand/css.ts accent2Source). */
export function accent2Source(colors: { accent: string; accent2?: string }): string {
  if (colors.accent2) {
    if (!parseColor(colors.accent2)) throw new TypeError(`"${colors.accent2}" (accent2) is not a colour.`);
    return colors.accent2;
  }
  const a = parseColor(colors.accent);
  if (!a) throw new TypeError(`"${colors.accent}" is not a colour.`);
  if (a.c < 0.035) return formatOklch({ ...a, alpha: 1 });
  return formatOklch(gamutMap({ ...a, h: (a.h + ACCENT2_HUE_TURN) % 360, alpha: 1 }));
}

/** The accent colour a preset's brand.css is generated from. */
export const presetAccentSource = (preset: Preset) => (isNamedAccent(preset.accent) ? KIT_ACCENT_BASE[preset.accent] : preset.accent);

/**
 * The brand.css `vamos-ui init/theme/create --preset` writes for a custom accent (brandCss for a
 * brand with colors.accent, and accent2 for a family; corners are data-radius, not brand.css). null when none is needed.
 */
export function presetBrandCss(preset: Preset, name = "my-app", accent2?: string): string | null {
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
  const second = generateAccent(accent2Source({ accent: presetAccentSource(preset), accent2 }));
  out.push(`  --accent-2-base: ${second.base}; /* ${accent2 ? `accent2 ${accent2.replace(/\*\//g, "")}` : "derived from the accent"} */`);
  out.push(`  --accent-2-ink-light: ${second.inkLight};`);
  out.push(`  --accent-2-ink-dark: ${second.inkDark};`);
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
