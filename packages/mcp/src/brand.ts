import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { brandLibLoadError, loadBrandLib, type BrandLib } from "./brand-lib.js";
import { ToolError } from "./errors.js";
import { truncate } from "./format.js";
import {
  BRAND_FILE,
  BRAND_SCHEMA,
  CONFIG_FILE,
  DEFAULT_CSS,
  DEFAULT_UI_DIR,
  findRootDocument,
  insideProject,
  readJsonFile,
  readProjectConfig,
  type ProjectTheme,
} from "./project.js";
import type { Brand, BrandIssue, GeneratedAccent } from "./types.js";

export const BRAND_APPLY_COMMAND = "npx vamos-ui brand apply";
export const BRAND_CHECK_COMMAND = "npx vamos-ui brand check";
export const UPDATE_DRY_RUN_COMMAND = "npx vamos-ui update --dry-run";
export const UPDATE_FIX_COMMAND = "npx vamos-ui update --fix";

/** Base colour of each kit accent preset (as in the CLI), for mapping palette families when there is no brand. */
export const PRESET_ACCENTS: Record<string, string> = {
  lime: "oklch(0.89 0.21 122)",
  ocean: "oklch(0.64 0.17 245)",
  ember: "oklch(0.7 0.19 45)",
  rose: "oklch(0.66 0.21 10)",
};
export const MIN_TEXT_CONTRAST = 4.5;

export async function requireBrandLib(): Promise<BrandLib> {
  const lib = await loadBrandLib();
  if (!lib) {
    throw new ToolError(
      `The brand library is not available (${brandLibLoadError() ?? "vamos-ui/brand could not be loaded"}). Update the server (npx -y @vamos-ui/mcp@latest) or run the CLI instead: \`${BRAND_APPLY_COMMAND}\`.`,
    );
  }
  return lib;
}

// --- validation -----------------------------------------------------------------

const ENUMS = {
  material: ["glass", "solid"],
  density: ["comfortable", "compact"],
  radius: ["sharp", "default", "round"],
} as const;
const TOP_LEVEL = new Set(["$schema", "name", "colors", "fonts", "theme", "voice", "assets", "source"]);

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

/** Structural check of a vamos.brand.json value. Works without the brand library. */
export function validateBrandShape(raw: unknown): BrandIssue[] {
  const issues: BrandIssue[] = [];
  const err = (p: string, message: string) => issues.push({ severity: "error", path: p, message });
  const warn = (p: string, message: string) => issues.push({ severity: "warning", path: p, message });
  if (!isObject(raw)) return [{ severity: "error", message: `${BRAND_FILE} must contain a JSON object.` }];

  for (const key of Object.keys(raw)) if (!TOP_LEVEL.has(key)) warn(key, `Unknown field "${key}"; it is ignored.`);
  if (!isText(raw.name)) err("name", "name is required (the brand or product name).");

  if (!isObject(raw.colors)) err("colors", "colors is required, with at least colors.accent.");
  else {
    if (!isText(raw.colors.accent)) err("colors.accent", "colors.accent is required: the one brand colour used for the primary action and active states.");
    for (const key of ["accentDark", "neutralTint"]) {
      if (raw.colors[key] !== undefined && !isText(raw.colors[key])) err(`colors.${key}`, `colors.${key} must be a CSS colour string.`);
    }
  }

  if (raw.fonts !== undefined) {
    if (!isObject(raw.fonts)) err("fonts", "fonts must be an object { display?, body?, mono? }.");
    else for (const key of ["display", "body", "mono"]) if (raw.fonts[key] !== undefined && !isText(raw.fonts[key])) err(`fonts.${key}`, `fonts.${key} must be a font family name.`);
  }

  if (raw.theme !== undefined) {
    if (!isObject(raw.theme)) err("theme", "theme must be an object.");
    else {
      if (raw.theme.dark !== undefined && typeof raw.theme.dark !== "boolean") err("theme.dark", "theme.dark must be true or false.");
      for (const key of Object.keys(ENUMS) as (keyof typeof ENUMS)[]) {
        const value = raw.theme[key];
        if (value !== undefined && !(ENUMS[key] as readonly unknown[]).includes(value)) err(`theme.${key}`, `theme.${key} must be one of: ${ENUMS[key].join(", ")}.`);
      }
    }
  }

  const noVoice = "No voice: tone and copy rules are unknown. Ask the user before writing product copy.";
  if (raw.voice === undefined) warn("voice", noVoice);
  else if (!isObject(raw.voice)) err("voice", "voice must be an object { tone?, rules?, examples? }.");
  else {
    if (!isText(raw.voice.tone) && !(Array.isArray(raw.voice.rules) && raw.voice.rules.length)) {
      warn("voice", Array.isArray(raw.voice.examples) && raw.voice.examples.length ? "Voice has examples but no tone or rules. Ask the user how the brand speaks before writing product copy." : noVoice);
    }
    if (raw.voice.tone !== undefined && !isText(raw.voice.tone)) err("voice.tone", "voice.tone must be a string.");
    if (raw.voice.rules !== undefined && (!Array.isArray(raw.voice.rules) || !raw.voice.rules.every(isText))) err("voice.rules", "voice.rules must be a list of strings.");
    if (raw.voice.examples !== undefined) {
      if (!Array.isArray(raw.voice.examples)) err("voice.examples", "voice.examples must be a list of { do, dont? }.");
      else raw.voice.examples.forEach((ex, i) => {
        if (!isObject(ex) || !isText(ex.do)) err(`voice.examples[${i}]`, "Each example needs a \"do\" string.");
      });
    }
  }

  if (raw.assets === undefined || (Array.isArray(raw.assets) && raw.assets.length === 0)) {
    warn("assets", "No assets: no logo is recorded. Ask the user for the logo files instead of drawing one.");
  } else if (!Array.isArray(raw.assets)) err("assets", "assets must be a list of { path, use }.");
  else raw.assets.forEach((asset, i) => {
    if (!isObject(asset) || !isText(asset.path)) return err(`assets[${i}]`, "Each asset needs a path.");
    if (!isText(asset.use)) warn(`assets[${i}].use`, `${asset.path}: add a "use" note (where and how to use it, minimum size, backgrounds).`);
  });
  return issues;
}

/** Asset files must be local copies inside the project. */
export function checkAssets(root: string, brand: Brand): BrandIssue[] {
  const issues: BrandIssue[] = [];
  (brand.assets ?? []).forEach((asset, i) => {
    if (!isText(asset?.path)) return;
    const where = `assets[${i}].path`;
    if (/^(https?:)?\/\//i.test(asset.path) || asset.path.startsWith("data:")) {
      issues.push({ severity: "warning", path: where, message: `${truncate(asset.path, 80)} is remote. Save a copy in the project (e.g. under brand/) and point path at it; \`npx vamos-ui brand import <url>\` does this for logos and icons.` });
      return;
    }
    try {
      if (!existsSync(insideProject(root, asset.path))) issues.push({ severity: "error", path: where, message: `${asset.path} does not exist.` });
    } catch (error) {
      issues.push({ severity: "error", path: where, message: (error as Error).message });
    }
  });
  return issues;
}

export function dedupeIssues(issues: BrandIssue[]): BrandIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.path ?? ""}|${issue.message.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** All issues for a brand: shape, assets on disk and (when available) the library's checkBrand. */
export function brandIssues(raw: unknown, root: string | undefined, lib: BrandLib | null): BrandIssue[] {
  const issues = validateBrandShape(raw);
  const structurallyValid = !issues.some((i) => i.severity === "error");
  if (structurallyValid && root) issues.push(...checkAssets(root, raw as Brand));
  if (structurallyValid && lib) {
    try {
      // The shape check already says what is missing from the voice, in agent terms.
      const hasVoiceIssue = issues.some((i) => i.path === "voice");
      issues.push(...lib.checkBrand(raw as Brand).filter((i) => !(hasVoiceIssue && i.path === "voice" && i.severity !== "error")));
    } catch (error) {
      issues.push({ severity: "error", message: `checkBrand failed: ${(error as Error).message}` });
    }
  }
  return dedupeIssues(issues).sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1));
}

export function formatBrandIssues(issues: BrandIssue[]): string[] {
  return issues.map((i) => `- ${i.severity === "error" ? "error  " : "warning"} ${i.path ? `\`${i.path}\` ` : ""}${i.message}`);
}

export interface LoadedBrand {
  file: string;
  raw: unknown;
  brand: Brand | null;
}

/** Reads <root>/vamos.brand.json; null when there is none. `brand` is null when the shape is invalid. */
export function readBrand(root: string): LoadedBrand | null {
  const file = path.join(root, BRAND_FILE);
  if (!existsSync(file)) return null;
  const raw = readJsonFile(file);
  const valid = !validateBrandShape(raw).some((i) => i.severity === "error");
  return { file, raw, brand: valid ? (raw as Brand) : null };
}

export function withSchema(brand: Brand): Brand {
  const { $schema: _ignored, ...rest } = brand;
  return { $schema: BRAND_SCHEMA, ...rest };
}

export function brandJson(brand: Brand): string {
  return `${JSON.stringify(withSchema(brand), null, 2)}\n`;
}

// --- accent ---------------------------------------------------------------------

export function accentCss(accent: GeneratedAccent, name = "brand"): string {
  const lines = [
    `[data-accent="${name}"] {`,
    `  --accent-base: ${accent.base};`,
    `  --accent-fg: ${accent.fg};`,
    `  --accent-ink-light: ${accent.inkLight};`,
    `  --accent-ink-dark: ${accent.inkDark};`,
    "}",
  ];
  if (accent.dark) {
    lines.push(`.dark[data-accent="${name}"],`, `.dark [data-accent="${name}"] {`, `  --accent-base: ${accent.dark.base};`, `  --accent-fg: ${accent.dark.fg};`, "}");
  }
  return lines.join("\n");
}

export function contrastRows(accent: GeneratedAccent): string[] {
  const row = (label: string, ratio: number) =>
    `| ${label} | ${Number.isFinite(ratio) ? ratio.toFixed(2) : "?"}:1 | ${ratio >= MIN_TEXT_CONTRAST ? "pass" : "FAIL"} |`;
  return [
    `| Pair | Contrast | ≥ ${MIN_TEXT_CONTRAST}:1 |`,
    "|---|---|---|",
    row("`--accent-fg` on `--accent-base` (primary button text)", accent.contrast.fgOnBase),
    row("`--accent-ink-light` on light surface (links, active text)", accent.contrast.inkLightOnLight),
    row("`--accent-ink-dark` on dark surface", accent.contrast.inkDarkOnDark),
    ...(accent.dark && accent.contrast.darkFgOnBase !== undefined ? [row("dark-mode `--accent-fg` on its fill", accent.contrast.darkFgOnBase)] : []),
  ];
}

export function generateAccentSafe(lib: BrandLib, colour: string, dark?: string): GeneratedAccent {
  try {
    return lib.generateAccent(colour.trim(), dark?.trim() || undefined);
  } catch (error) {
    throw new ToolError(`Could not use "${colour}" as a colour: ${(error as Error).message}. Pass a CSS colour such as #0f766e, rgb(15 118 110) or oklch(0.55 0.1 180).`);
  }
}

// --- alignment plan (shared by apply_design_system, update_design, verify_design) --

export interface PlannedEdit {
  /** Project-relative posix path. */
  path: string;
  action: "create" | "update";
  reason: string;
  /** Full new file content. */
  content: string;
  /** The part that changes, for display. */
  snippet?: string;
}

export interface ManualStep {
  path?: string;
  message: string;
  snippet?: string;
}

export interface DesignPlan {
  edits: PlannedEdit[];
  manual: ManualStep[];
  problems: BrandIssue[];
  inSync: string[];
  uiDir: string;
  css: string;
  hasConfig: boolean;
}

function relImport(fromFile: string, toFile: string): string {
  let rel = path.posix.relative(path.posix.dirname(fromFile), toFile);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

const IMPORT_RE = /^\s*@import\s+(?:url\()?["']([^"']+)["']/;

/** Adds (or moves) the brand.css import so it comes right after the kit styles import. Null when already right. */
export function placeBrandImport(css: string, brandImport: string): { css: string; moved: boolean } | null {
  const lines = css.split("\n");
  const target = (i: number) => IMPORT_RE.exec(lines[i]!)?.[1];
  let brandIdx = -1;
  let stylesIdx = -1;
  let lastImport = -1;
  let tailwind = -1;
  for (let i = 0; i < lines.length; i++) {
    const href = target(i);
    if (!href) continue;
    lastImport = i;
    if (href === brandImport || /(^|\/)brand\.css$/.test(href)) brandIdx = brandIdx < 0 ? i : brandIdx;
    else if (/(^|\/)styles\.css$/.test(href)) stylesIdx = i;
    else if (/^tailwindcss(\/|$)/.test(href)) tailwind = i;
  }
  if (brandIdx >= 0 && (stylesIdx < 0 || brandIdx > stylesIdx)) return null;
  const line = `@import "${brandImport}";`;
  let moved = false;
  if (brandIdx >= 0) {
    lines.splice(brandIdx, 1);
    if (stylesIdx > brandIdx) stylesIdx--;
    moved = true;
  }
  const at = stylesIdx >= 0 ? stylesIdx + 1 : tailwind >= 0 ? tailwind + 1 : Math.max(0, lastImport + (moved ? 0 : 1));
  lines.splice(at, 0, line);
  return { css: lines.join("\n"), moved };
}

export function desiredTheme(current: ProjectTheme | undefined, brand: Brand): ProjectTheme {
  const next: ProjectTheme = { ...current, accent: "brand" };
  if (brand.theme?.dark !== undefined) next.theme = brand.theme.dark ? "dark" : "light";
  if (brand.theme?.material) next.material = brand.theme.material;
  if (brand.theme?.density) next.density = brand.theme.density;
  return next;
}

export function htmlAttributes(theme: ProjectTheme): string {
  const attrs = [
    theme.theme === "dark" ? 'className="dark"' : "",
    `data-material="${theme.material ?? "solid"}"`,
    `data-accent="${theme.accent ?? "brand"}"`,
    `data-density="${theme.density ?? "comfortable"}"`,
    theme.font ? `data-font="${theme.font}"` : "",
  ].filter(Boolean);
  return `<html lang="en" ${attrs.join(" ")}>`;
}

export function googleFontsUrl(families: string[]): string {
  const query = [...new Set(families)].map((f) => `family=${encodeURIComponent(f.trim()).replace(/%20/g, "+")}`).join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

const sameText = (a: string, b: string) => a.replace(/\s+$/g, "") === b.replace(/\s+$/g, "");
const read = (file: string) => (existsSync(file) ? readFileSync(file, "utf8") : null);

export interface PlanOptions {
  /** The brand came from the caller, not from vamos.brand.json: plan writing the file too. */
  writeBrandFile?: boolean;
}

/** Everything needed for the project to use `brand`: file edits, manual steps and blocking problems. */
export function planAlignment(root: string, brand: Brand, lib: BrandLib | null, options: PlanOptions = {}): DesignPlan {
  const config = readProjectConfig(root);
  const uiDir = config?.uiDir ?? DEFAULT_UI_DIR;
  const cssFile = config?.css ?? DEFAULT_CSS;
  const plan: DesignPlan = { edits: [], manual: [], problems: [], inSync: [], uiDir, css: cssFile, hasConfig: !!config };
  const edit = (p: string, action: PlannedEdit["action"], reason: string, content: string, snippet?: string) => {
    insideProject(root, p);
    plan.edits.push({ path: p, action, reason, content, ...(snippet ? { snippet } : {}) });
  };

  if (!config) plan.problems.push({ severity: "error", path: CONFIG_FILE, message: `No ${CONFIG_FILE}: run \`npx vamos-ui init\` first so the kit styles are installed.` });

  // 1. vamos.brand.json
  if (options.writeBrandFile) {
    const next = brandJson(brand);
    const current = read(path.join(root, BRAND_FILE));
    if (current === null) edit(BRAND_FILE, "create", "Save the brand profile.", next);
    else if (!sameText(current, next)) edit(BRAND_FILE, "update", "Replace the brand profile with the confirmed one.", next);
    else plan.inSync.push(BRAND_FILE);
  }

  // 2. <uiDir>/brand.css
  const brandCssPath = `${uiDir}/brand.css`;
  if (lib) {
    let expected: string | undefined;
    try {
      expected = lib.brandCss(brand);
    } catch (error) {
      plan.problems.push({ severity: "error", path: brandCssPath, message: `brandCss failed: ${(error as Error).message}` });
    }
    if (expected !== undefined) {
      const content = expected.endsWith("\n") ? expected : `${expected}\n`;
      const current = read(insideProject(root, brandCssPath));
      if (current === null) edit(brandCssPath, "create", "Brand accent and font variables.", content);
      else if (!sameText(current, content)) edit(brandCssPath, "update", "brand.css is out of date with vamos.brand.json (regenerate, do not hand-edit).", content);
      else plan.inSync.push(brandCssPath);
    }
  } else {
    plan.problems.push({ severity: "warning", path: brandCssPath, message: `Cannot generate brand.css here (${brandLibLoadError() ?? "brand library unavailable"}); \`${BRAND_APPLY_COMMAND}\` does it.` });
  }

  // 3. CSS entry imports brand.css after styles.css
  const brandImport = relImport(cssFile, brandCssPath);
  const cssAbs = insideProject(root, cssFile);
  const css = read(cssAbs);
  if (css === null) {
    plan.problems.push({ severity: "error", path: cssFile, message: `CSS entry ${cssFile} not found. Fix "css" in ${CONFIG_FILE} or run \`npx vamos-ui init\`.` });
  } else {
    const placed = placeBrandImport(css, brandImport);
    if (!placed) plan.inSync.push(`${cssFile} imports brand.css`);
    else edit(cssFile, "update", placed.moved ? "Move the brand.css import after the kit styles (it must override them)." : "Import brand.css right after the kit styles.", placed.css, `@import "${brandImport}";`);
  }

  // 4. vamos.json theme
  if (config) {
    const next = desiredTheme(config.theme, brand);
    if (JSON.stringify(next) !== JSON.stringify(config.theme ?? {})) {
      const content = `${JSON.stringify({ ...config.raw, theme: next }, null, 2)}\n`;
      edit(CONFIG_FILE, "update", 'Select the brand accent (theme.accent = "brand") and the brand theme defaults.', content, `"theme": ${JSON.stringify(next)}`);
    } else plan.inSync.push(`${CONFIG_FILE} theme`);
  }

  // 5. root element attributes (JSX/HTML edits are left to the agent)
  const theme = desiredTheme(config?.theme, brand);
  const doc = findRootDocument(root);
  const docText = doc ? read(path.join(root, doc)) ?? "" : "";
  if (doc && /data-accent=\{?["'`]brand["'`]\}?/.test(docText)) plan.inSync.push(`${doc} data-accent="brand"`);
  else {
    plan.manual.push({
      path: doc,
      message: doc ? `Set the theme attributes on <html> in ${doc}.` : "Set the theme attributes on the root <html> element.",
      snippet: htmlAttributes(theme),
    });
  }

  // 6. fonts must be loaded by the app
  const families = [brand.fonts?.display, brand.fonts?.body, brand.fonts?.mono].filter(isText);
  if (families.length) {
    const haystack = `${docText}\n${css ?? ""}`.toLowerCase();
    const missing = families.filter((f) => !haystack.includes(f.toLowerCase()) && !haystack.includes(f.toLowerCase().replace(/ /g, "+")) && !haystack.includes(f.toLowerCase().replace(/ /g, "_")));
    if (missing.length) {
      plan.manual.push({
        path: doc,
        message: `Load the brand fonts (${missing.join(", ")}) in the app; brand.css only points the font variables at them. Use your framework's font loader or this stylesheet:`,
        snippet: `<link rel="stylesheet" href="${googleFontsUrl(missing)}" />`,
      });
    } else plan.inSync.push("brand fonts loaded");
  }

  // 7. brand problems (shape, assets, checkBrand)
  plan.problems.push(...brandIssues(brand, root, lib));
  plan.problems = dedupeIssues(plan.problems);
  return plan;
}

export function formatPlan(plan: DesignPlan, options: { showContent?: boolean } = {}): string[] {
  const out: string[] = [];
  if (plan.edits.length) {
    out.push(`## File edits (${plan.edits.length})`, "");
    for (const e of plan.edits) {
      out.push(`### ${e.action} \`${e.path}\``, e.reason);
      if (e.snippet && !options.showContent) out.push("", "```", e.snippet, "```");
      if (options.showContent) out.push("", `\`\`\`${e.path.endsWith(".json") ? "json" : e.path.endsWith(".css") ? "css" : ""}`, e.content.replace(/\n$/, ""), "```");
      out.push("");
    }
  }
  if (plan.manual.length) {
    out.push(`## Manual steps (${plan.manual.length})`, "");
    for (const m of plan.manual) {
      out.push(`- ${m.message}`);
      if (m.snippet) out.push("", "  ```", `  ${m.snippet}`, "  ```");
    }
    out.push("");
  }
  if (plan.problems.length) out.push(`## Problems (${plan.problems.length})`, "", ...formatBrandIssues(plan.problems), "");
  if (plan.inSync.length) out.push(`Already in line: ${plan.inSync.join(", ")}.`, "");
  return out;
}
