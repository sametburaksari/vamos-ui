/**
 * vamos-ui/preset — short, shareable codes for the Vamos UI theme axes.
 *
 *   v1dgokg        dark · glass · ocean · compact · grotesk
 *   v1lsx4f46e5ce  light · solid · #4f46e5 · comfortable · editorial
 *   v1dgrkgs       ... with sharp corners (optional 6th axis: radius)
 *
 * Layout: "v1" + one letter per axis in a fixed order (theme, material, accent, density, font,
 * radius). A custom accent is "x" followed by six hex digits. Radius is optional and left out when
 * it is the default. Decoding ignores case and the separators "-", "_", ".", and spaces, so
 * "V1-DG-O-KG" works too. Pure: no Node built-ins and no dependencies.
 */

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

/** The values the CLI assumes when vamos.json leaves an axis out. */
export const PRESET_DEFAULTS: Readonly<Preset> = Object.freeze({
  theme: "light",
  material: "solid",
  accent: "lime",
  density: "comfortable",
  font: "system",
  radius: "default",
});

/** One letter per value. Letters are unique within an axis. */
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
    p.radius === PRESET_DEFAULTS.radius ? "" : LETTERS.radius[p.radius],
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
  if (i < s.length) throw new PresetError(`Preset "${code}" has extra characters: "${s.slice(i)}".`);
  return { theme, material, accent, density, font, radius } as Preset;
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

/** "dark · glass · ocean · compact · grotesk" (radius only when not default). */
export function describePreset(preset: Preset): string {
  const parts: string[] = [preset.theme, preset.material, preset.accent, preset.density, preset.font];
  if (preset.radius !== PRESET_DEFAULTS.radius) parts.push(`${preset.radius} corners`);
  return parts.join(" · ");
}

/**
 * The attributes for <html>. A custom accent or radius needs the generated brand.css
 * (`vamos-ui init --preset` / `theme --preset` write it), so it maps to data-accent="brand".
 */
export function presetAttributes(preset: Preset): Record<string, string> {
  const needsBrand = !isNamedAccent(preset.accent) || preset.radius !== PRESET_DEFAULTS.radius;
  return {
    ...(preset.theme === "dark" ? { class: "dark" } : {}),
    "data-material": preset.material,
    "data-accent": needsBrand ? "brand" : preset.accent,
    "data-density": preset.density,
    "data-font": preset.font,
  };
}

/** Does applying this preset need a generated brand.css (custom accent or non-default radius)? */
export function presetNeedsBrand(preset: Preset): boolean {
  return !isNamedAccent(preset.accent) || preset.radius !== PRESET_DEFAULTS.radius;
}
