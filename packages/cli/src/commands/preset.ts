import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { ParsedArgs } from "../args";
import { parseColor, toHex } from "../brand/color";
import { BRAND_AXIS_VALUE, BRAND_FILE, emptyBrand, serializeBrand, type Brand } from "../brand/types";
import { writeConfig } from "../core/config";
import { CliError, type ThemeConfig, type VamosConfig } from "../core/types";
import { decodePreset, describePreset, encodePreset, isNamedAccent, normalizeHex, presetAttributes, presetNeedsBrand, PresetError, PRESET_DEFAULTS, type Preset, type PresetAccentName } from "../preset";
import { out, p, pc, printJson, type Context } from "../ui";
import { applyBrand, loadBrand } from "./brand";
import { openSession } from "./shared";

/** The kit's accent fills (styles.css), used when a named accent needs a brand.css for a custom radius. */
const KIT_ACCENT_BASE: Record<PresetAccentName, string> = {
  lime: "oklch(0.89 0.21 122)",
  ocean: "oklch(0.55 0.17 245)",
  ember: "oklch(0.7 0.19 45)",
  rose: "oklch(0.58 0.21 10)",
  graphite: "oklch(0.25 0.01 120)",
};

/** Decodes a code and turns PresetError into a CliError with a hint. */
export function parsePresetFlag(code: string): Preset {
  try {
    return decodePreset(code);
  } catch (err) {
    if (err instanceof PresetError) throw new CliError(err.message, "Get a code with `npx vamos-ui preset` in a configured project, or from the theme picker on https://ui.vamos.ist.");
    throw err;
  }
}

/** The vamos.json theme for a preset (a custom accent or radius selects the generated brand accent). */
export function presetTheme(preset: Preset): ThemeConfig {
  return {
    theme: preset.theme,
    material: preset.material,
    accent: presetNeedsBrand(preset) ? BRAND_AXIS_VALUE : preset.accent,
    density: preset.density,
    font: preset.font,
  };
}

function projectName(root: string): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
    if (typeof pkg.name === "string" && pkg.name) return pkg.name.replace(/^@[^/]+\//, "");
  } catch {
    /* no package.json */
  }
  return path.basename(root) || "Brand";
}

export interface PresetApplyResult {
  theme: ThemeConfig;
  /** vamos.brand.json and brand.css were written (custom accent or radius). */
  brand: { file: string; cssFile: string } | null;
}

/**
 * Applies a preset to a configured project: the theme in vamos.json and, for a custom accent or a
 * non-default radius, vamos.brand.json + brand.css (through the same path as `brand apply`).
 */
export async function applyPreset(root: string, config: VamosConfig, preset: Preset, opts: { dryRun?: boolean } = {}): Promise<PresetApplyResult> {
  const theme = presetTheme(preset);
  if (!presetNeedsBrand(preset)) {
    if (!opts.dryRun) await writeConfig(root, { ...config, theme });
    return { theme, brand: null };
  }
  const loaded = await loadBrand(root);
  const brand: Brand = loaded?.brand ? structuredClone(loaded.brand) : emptyBrand(projectName(root));
  brand.colors = { ...brand.colors, accent: isNamedAccent(preset.accent) ? KIT_ACCENT_BASE[preset.accent] : preset.accent };
  if (isNamedAccent(preset.accent)) delete brand.colors.accentDark;
  brand.theme = { ...brand.theme, dark: preset.theme === "dark", material: preset.material, density: preset.density };
  if (preset.radius === "default") delete brand.theme.radius;
  else brand.theme.radius = preset.radius;
  const file = path.join(root, BRAND_FILE);
  if (!opts.dryRun) await writeFile(file, serializeBrand(brand));
  const res = await applyBrand(root, config, brand, { dryRun: opts.dryRun });
  // The preset's font wins over brand fonts; everything else matches what applyBrand wrote.
  if (!opts.dryRun) await writeConfig(root, { ...config, theme });
  return { theme, brand: { file: BRAND_FILE, cssFile: res.cssFile } };
}

/** Reads the project's current preset from vamos.json (and vamos.brand.json for a brand accent). */
export async function currentPreset(root: string, config: VamosConfig): Promise<{ preset: Preset; notes: string[] }> {
  const t = config.theme ?? {};
  const notes: string[] = [];
  const input: Partial<Record<keyof Preset, string>> = { theme: t.theme, material: t.material, density: t.density, font: t.font };
  if (t.font === BRAND_AXIS_VALUE) {
    input.font = PRESET_DEFAULTS.font;
    notes.push("Brand fonts are not part of a preset code; the code uses the default font pairing.");
  }
  if (t.accent === BRAND_AXIS_VALUE) {
    const loaded = await loadBrand(root).catch(() => null);
    const colour = loaded?.brand.colors.accent;
    const parsed = colour ? (normalizeHex(colour) ?? (parseColor(colour) ? toHex(parseColor(colour)!) : null)) : null;
    if (parsed) input.accent = parsed;
    else notes.push(`accent is "brand" but ${BRAND_FILE} has no readable accent colour; the code uses the default accent.`);
    if (loaded?.brand.theme.radius) input.radius = loaded.brand.theme.radius;
  } else input.accent = t.accent;
  return { preset: normalizeInput(input), notes };
}

function normalizeInput(input: Partial<Record<keyof Preset, string>>): Preset {
  try {
    return decodePreset(encodePreset(input));
  } catch (err) {
    throw new CliError(`vamos.json has a theme value a preset cannot hold: ${(err as Error).message}`);
  }
}

/**
 * `vamos-ui preset`         prints the current project's code
 * `vamos-ui preset <code>`  explains a code (nothing is written; use init/theme --preset to apply)
 */
export async function preset(ctx: Context, args: ParsedArgs): Promise<number> {
  const code = args.positionals[0];
  if (code) {
    const decoded = parsePresetFlag(code);
    const canonical = encodePreset(decoded);
    if (ctx.json) {
      printJson({ code: canonical, preset: decoded, attributes: presetAttributes(decoded) });
      return 0;
    }
    out(`${pc.bold(canonical)}  ${describePreset(decoded)}`);
    out(pc.dim(`Apply: npx vamos-ui theme --preset ${canonical}   ·   New app: npx vamos-ui create my-app --preset ${canonical}`));
    return 0;
  }
  const session = await openSession(ctx, { config: "required" });
  const { preset: current, notes } = await currentPreset(session.root, session.config);
  const canonical = encodePreset(current);
  if (ctx.json) {
    printJson({ code: canonical, preset: current, attributes: presetAttributes(current), notes });
    return 0;
  }
  out(canonical);
  p.log.message(pc.dim(describePreset(current)));
  for (const n of notes) p.log.warn(n);
  p.log.message(pc.dim(`Share it: npx vamos-ui init --preset ${canonical}  ·  npx vamos-ui create my-app --preset ${canonical}`));
  return 0;
}
