import { existsSync } from "node:fs";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { writeConfig } from "../core/config";
import type { Framework } from "../core/project";
import { detectProject } from "../core/project";
import { CliError, type ThemeConfig } from "../core/types";
import { p, pc, printJson, unwrap, type Context } from "../ui";
import { openSession } from "./shared";
import { applyPreset, parsePresetFlag, presetTheme } from "./preset";
import { decodePreset, describePreset, encodePreset, getPresetFamily, presetNeedsBrand, PRESET_AXES, PRESET_FAMILIES, type Preset, type PresetFamily } from "../preset";
import { fontLoadSnippet } from "../brand/fonts";

export const AXES = {
  theme: { values: PRESET_AXES.theme, default: "light", label: "Theme" },
  material: { values: PRESET_AXES.material, default: "solid", label: "Material" },
  accent: { values: PRESET_AXES.accent, default: "lime", label: "Accent" },
  density: { values: PRESET_AXES.density, default: "comfortable", label: "Density" },
  font: { values: PRESET_AXES.font, default: "system", label: "Font pairing" },
  radius: { values: PRESET_AXES.radius, default: "default", label: "Corners" },
  scene: { values: PRESET_AXES.scene, default: "neutral", label: "Scene" },
} as const;

type Axis = keyof typeof AXES;

/** Axis values; "brand" is offered for accent and font once brand.css exists. */
function axisValues(axis: Axis, hasBrand: boolean): string[] {
  const values: string[] = [...AXES[axis].values];
  if (hasBrand && (axis === "accent" || axis === "font")) values.push("brand");
  return values;
}
const AXIS_NAMES = Object.keys(AXES) as Axis[];

export function htmlAttributes(theme: ThemeConfig): Record<string, string> {
  const t = { ...Object.fromEntries(AXIS_NAMES.map((a) => [a, AXES[a].default])), ...theme } as Required<ThemeConfig>;
  return {
    ...(t.theme === "dark" ? { class: "dark" } : {}),
    "data-material": t.material,
    "data-accent": t.accent,
    "data-density": t.density,
    "data-font": t.font,
    // Corners and scene: absent = default, so only the other values are written.
    ...(t.radius && t.radius !== "default" ? { "data-radius": t.radius } : {}),
    ...(t.scene && t.scene !== "neutral" ? { "data-scene": t.scene } : {}),
  };
}

export function htmlSnippet(framework: Framework, theme: ThemeConfig, srcDir = false, extra: Record<string, string> = {}): string {
  const attrs = { ...extra, ...htmlAttributes(theme) };
  const jsx = Object.entries(attrs)
    .map(([k, v]) => `${k === "class" ? "className" : k}="${v}"`)
    .join(" ");
  const html = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  const lang = extra.dir === "rtl" ? "ar" : "en";
  if (framework === "next") return `${pc.dim(`// ${srcDir ? "src/" : ""}app/layout.tsx`)}\n<html lang="${lang}" ${jsx}>`;
  if (framework === "vite") return `${pc.dim("<!-- index.html -->")}\n<html lang="${lang}" ${html}>`;
  return `<html lang="${lang}" ${html}>`;
}

/** `--family <name>` → the family, or a CliError that lists the names. */
export function parseFamilyFlag(name: string): PresetFamily {
  const family = getPresetFamily(name);
  if (!family) throw new CliError(`Unknown style family "${name}".`, `Choose one of: ${PRESET_FAMILIES.map((f) => f.id).join(", ")}. List them with \`npx vamos-ui theme --families\`.`);
  return family;
}

/** The families as a table for `theme --families`. */
function printFamilies(ctx: Context): number {
  if (ctx.json) {
    printJson({ families: PRESET_FAMILIES.map((f) => ({ ...f, preset: decodePreset(f.code) })) });
    return 0;
  }
  const w = Math.max(...PRESET_FAMILIES.map((f) => f.id.length));
  for (const f of PRESET_FAMILIES) p.log.message(`${pc.bold(f.id.padEnd(w))}  ${pc.cyan(f.code)}  ${f.label}: ${pc.dim(f.description)}`);
  p.log.message(pc.dim("Apply one: npx vamos-ui theme --family <id>   ·   New app: npx vamos-ui create my-app --preset <code>"));
  return 0;
}

/** Font loading note for pairings the app does not load yet (everything but the classic four). */
function fontNote(framework: Framework, preset: Pick<Preset, "font">): string | null {
  return fontLoadSnippet(preset.font, framework);
}

export async function theme(ctx: Context, args: ParsedArgs): Promise<number> {
  if (bool(args.flags, "families")) return printFamilies(ctx);
  const session = await openSession(ctx, { config: "optional" });
  const familyName = str(args.flags, "family");
  const family = familyName ? parseFamilyFlag(familyName) : null;
  const presetCode = family?.code ?? str(args.flags, "preset");
  if (presetCode) {
    const preset = parsePresetFlag(presetCode);
    let theme = presetTheme(preset);
    let saved = false;
    if (session.hasConfig) {
      theme = (await applyPreset(session.root, session.config, preset, { dryRun: bool(args.flags, "dry-run"), accent2: family?.accent2 })).theme;
      saved = !bool(args.flags, "dry-run");
    } else if (presetNeedsBrand(preset)) {
      throw new CliError("A custom accent colour needs a project: it writes vamos.brand.json and brand.css.", "Run `npx vamos-ui init --preset " + encodePreset(preset) + "` instead.");
    }
    const extra: Record<string, string> = family?.dir ? { dir: family.dir } : {};
    if (family) extra["data-motion"] = family.motion;
    const project = detectProject(session.root);
    const fonts = fontNote(project.framework, preset);
    if (ctx.json) {
      printJson({ code: encodePreset(preset), preset, theme, attributes: { ...extra, ...htmlAttributes(theme) }, saved, ...(family ? { family: family.id } : {}), ...(fonts ? { fonts } : {}) });
      return 0;
    }
    p.log.success(`${saved ? "Applied" : "Preset"} ${pc.bold(encodePreset(preset))}${family ? ` (${family.label})` : ""}: ${describePreset(preset)}`);
    if (!session.hasConfig) p.log.info(pc.dim("No vamos.json here, so nothing was saved."));
    p.note(htmlSnippet(project.framework, theme, project.srcDir && project.appRouter && !existsSync(path.join(session.root, "app")), extra), "Set these attributes on <html>");
    if (fonts) p.note(fonts, project.framework === "next" ? `Load the ${preset.font} fonts (next/font)` : `Load the ${preset.font} fonts (in <head>)`);
    if (family) p.log.message(pc.dim(family.notes));
    return 0;
  }
  const current: ThemeConfig = { ...session.config.theme };
  const hasBrand = existsSync(path.join(session.root, session.config.uiDir, "brand.css"));
  const next: ThemeConfig = { ...current };
  let anyFlag = false;
  // Shorthands: --dark / --light for --theme dark|light.
  if (bool(args.flags, "dark")) {
    next.theme = "dark";
    anyFlag = true;
  } else if (bool(args.flags, "light")) {
    next.theme = "light";
    anyFlag = true;
  }
  for (const axis of AXIS_NAMES) {
    const v = str(args.flags, axis);
    if (v === undefined) continue;
    anyFlag = true;
    if (!axisValues(axis, hasBrand).includes(v)) {
      throw new CliError(
        `Unknown ${axis} "${v}". Choose one of: ${axisValues(axis, hasBrand).join(", ")}.`,
        axis === "accent" || axis === "font" ? "For your own brand colour and fonts, run `npx vamos-ui brand init` (or `brand import <url>`), then `brand apply`." : undefined,
      );
    }
    (next as Record<string, string>)[axis] = v;
  }
  if (!anyFlag && ctx.interactive && !ctx.json) {
    p.intro(pc.bold("Vamos UI theme"));
    for (const axis of AXIS_NAMES) {
      const a = AXES[axis];
      const value = unwrap(
        await p.select({
          message: a.label,
          initialValue: (current as Record<string, string>)[axis] ?? a.default,
          options: axisValues(axis, hasBrand).map((v) => ({ value: v, label: v })),
        }),
      );
      (next as Record<string, string>)[axis] = value;
    }
  }
  // Default corners are the absence of data-radius, so they are not stored.
  if ((next.radius as string | undefined) === "default") delete next.radius;
  if ((next.scene as string | undefined) === "neutral") delete next.scene;

  const changed = JSON.stringify(next) !== JSON.stringify(current);
  if (changed && session.hasConfig) {
    await writeConfig(session.root, { ...session.config, theme: next });
  }
  if (ctx.json) {
    printJson({ theme: next, attributes: htmlAttributes(next), saved: changed && session.hasConfig });
    return 0;
  }
  const project = detectProject(session.root);
  if (changed && session.hasConfig) p.log.success("Saved the theme in vamos.json");
  else if (changed) p.log.info(pc.dim("No vamos.json here, so nothing was saved."));
  p.note(htmlSnippet(project.framework, next, project.srcDir && project.appRouter && !existsSync(path.join(session.root, "app"))), "Set these attributes on <html>");
  p.log.message(pc.dim("Every axis also works on any element, e.g. a dark sidebar: <aside className=\"dark\">"));
  return 0;
}
