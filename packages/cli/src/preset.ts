/**
 * vamos-ui/preset — short, shareable codes for the Vamos UI theme axes.
 *
 *   v1dgokg        dark · glass · ocean · compact · grotesk
 *   v1lsx4f46e5ce  light · solid · #4f46e5 · comfortable · editorial
 *   v1dgrkgs       ... with sharp corners (optional 6th axis: corners → data-radius)
 *   v1lsx9a3b16kbnp ... compact · bookish · no corners · paper scene (optional 7th axis → data-scene)
 *
 * Layout: "v1" + one letter per axis in a fixed order (theme, material, accent, density, font,
 * radius, scene). A custom accent is "x" followed by six hex digits. Radius and scene are optional
 * and left out when they are the default; a code with a scene spells its radius out (`d` for the
 * default). Decoding ignores case and the separators "-", "_", ".", and spaces, so "V1-DG-O-KG"
 * works too. Pure: no Node built-ins and no dependencies.
 *
 * Compatibility: the axes only gained letters, so every code an older vamos-ui wrote decodes to the
 * same preset. An older vamos-ui rejects a code that uses a new letter (say "is not a font letter")
 * instead of guessing. The version stays "v1".
 */

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
