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
import { describePreset, encodePreset, presetNeedsBrand } from "../preset";

export const AXES = {
  theme: { values: ["light", "dark"], default: "light", label: "Theme" },
  material: { values: ["solid", "glass"], default: "solid", label: "Material" },
  accent: { values: ["lime", "ocean", "ember", "rose", "graphite"], default: "lime", label: "Accent" },
  density: { values: ["comfortable", "compact"], default: "comfortable", label: "Density" },
  font: { values: ["system", "editorial", "grotesk", "corporate"], default: "system", label: "Font pairing" },
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
  };
}

export function htmlSnippet(framework: Framework, theme: ThemeConfig, srcDir = false): string {
  const attrs = htmlAttributes(theme);
  const jsx = Object.entries(attrs)
    .map(([k, v]) => `${k === "class" ? "className" : k}="${v}"`)
    .join(" ");
  const html = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  if (framework === "next") return `${pc.dim(`// ${srcDir ? "src/" : ""}app/layout.tsx`)}\n<html lang="en" ${jsx}>`;
  if (framework === "vite") return `${pc.dim("<!-- index.html -->")}\n<html lang="en" ${html}>`;
  return `<html lang="en" ${html}>`;
}

export async function theme(ctx: Context, args: ParsedArgs): Promise<number> {
  const session = await openSession(ctx, { config: "optional" });
  const presetCode = str(args.flags, "preset");
  if (presetCode) {
    const preset = parsePresetFlag(presetCode);
    let theme = presetTheme(preset);
    let saved = false;
    if (session.hasConfig) {
      theme = (await applyPreset(session.root, session.config, preset, { dryRun: bool(args.flags, "dry-run") })).theme;
      saved = !bool(args.flags, "dry-run");
    } else if (presetNeedsBrand(preset)) {
      throw new CliError("A custom accent or radius needs a project: it writes vamos.brand.json and brand.css.", "Run `npx vamos-ui init --preset " + encodePreset(preset) + "` instead.");
    }
    if (ctx.json) {
      printJson({ code: encodePreset(preset), preset, theme, attributes: htmlAttributes(theme), saved });
      return 0;
    }
    const project = detectProject(session.root);
    p.log.success(`${saved ? "Applied" : "Preset"} ${pc.bold(encodePreset(preset))}: ${describePreset(preset)}`);
    if (!session.hasConfig) p.log.info(pc.dim("No vamos.json here, so nothing was saved."));
    p.note(htmlSnippet(project.framework, theme, project.srcDir && project.appRouter && !existsSync(path.join(session.root, "app"))), "Set these attributes on <html>");
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
