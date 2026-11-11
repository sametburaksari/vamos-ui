import { existsSync, readdirSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bool, str, type ParsedArgs } from "../args";
import { DEFAULT_CONFIG, validateConfig, writeConfig } from "../core/config";
import { projectInstallCommand, runCommand } from "../core/pm";
import { detectPackageManager, detectProject, suggestPaths } from "../core/project";
import { DEFAULT_REGISTRY } from "../core/registry";
import { CliError, type ThemeConfig } from "../core/types";
import { encodePreset } from "../preset";
import { p, pc, spinner, unwrap, type Context } from "../ui";
import { add } from "./browse";
import { init } from "./init";
import { parsePresetFlag, presetTheme } from "./preset";
import { htmlAttributes } from "./theme";

export const TEMPLATES = ["next", "vite"] as const;
export type Template = (typeof TEMPLATES)[number];

/** Kit items the starter screen imports. */
export const STARTER_ITEMS = ["button", "card", "badge"];

const TEMPLATE_INFO: Record<Template, { label: string; starter: string; html: "jsx" | "html"; dev: string }> = {
  next: { label: "Next.js (App Router) + Tailwind CSS v4", starter: "src/components/starter-screen.tsx", html: "jsx", dev: "dev" },
  vite: { label: "Vite + React + Tailwind CSS v4", starter: "src/components/starter-screen.tsx", html: "html", dev: "dev" },
};

/** packages/cli/templates, from src/commands (dev, tests) or dist (published). */
export function templatesDir(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "templates");
    if (existsSync(path.join(candidate, "next")) && existsSync(path.join(candidate, "vite"))) return candidate;
    dir = path.dirname(dir);
  }
  throw new CliError("The vamos-ui templates folder is missing from this install.", "Reinstall vamos-ui (npx vamos-ui@latest create …).");
}

/** A valid npm package name from a folder name. */
export function packageNameFor(dir: string): string {
  const base = path.basename(path.resolve(dir));
  const name = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[._-]+|[-]+$/g, "");
  return name || "vamos-app";
}

function titleFor(name: string): string {
  return name.replace(/[-_.]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function attrsFor(theme: ThemeConfig, kind: "jsx" | "html"): string {
  return Object.entries(htmlAttributes(theme))
    .map(([k, v]) => `${kind === "jsx" && k === "class" ? "className" : k}="${v}"`)
    .join(" ");
}

function walk(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs, base));
    else out.push(path.relative(base, abs));
  }
  return out.sort();
}

export interface ScaffoldOptions {
  template: Template;
  name: string;
  theme: ThemeConfig;
}

/** Writes the template files (no install, no kit). Returns project-relative paths. */
export async function scaffold(target: string, opts: ScaffoldOptions): Promise<string[]> {
  const root = templatesDir();
  const info = TEMPLATE_INFO[opts.template];
  const replace = (text: string) =>
    text
      .replace(/__APP_NAME__/g, opts.name)
      .replace(/__APP_TITLE__/g, titleFor(opts.name))
      .replace(/__HTML_ATTRS_JSX__/g, attrsFor(opts.theme, "jsx"))
      .replace(/__HTML_ATTRS__/g, attrsFor(opts.theme, "html"));
  const files: [string, string][] = walk(path.join(root, opts.template)).map((rel) => [path.join(root, opts.template, rel), rel.split(path.sep).join("/").replace(/(^|\/)_gitignore$/, "$1.gitignore")]);
  files.push([path.join(root, "_shared/starter-screen.tsx"), info.starter]);
  const written: string[] = [];
  for (const [src, rel] of files) {
    const abs = path.join(target, rel);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, replace(await readFile(src, "utf8")));
    written.push(rel);
  }
  return written;
}

function isEmptyDir(dir: string): boolean {
  if (!existsSync(dir)) return true;
  if (!statSync(dir).isDirectory()) return false;
  return readdirSync(dir).every((f) => f === ".git" || f === ".DS_Store" || f === "Thumbs.db");
}

const HELP = `${pc.bold("vamos-ui create")} <dir>  Start a new app with Vamos UI

${pc.bold("Usage")}
  npx vamos-ui create <dir> [--template next|vite] [--preset <code>] [--yes] [--no-install]

Writes a minimal Next.js (App Router) or Vite + React app with Tailwind CSS v4, installs it with your
package manager, runs ${pc.cyan("vamos-ui init")} (with the preset, if given) and adds a starter screen.`;

export async function create(ctx: Context, args: ParsedArgs): Promise<number> {
  if (bool(args.flags, "help")) {
    p.log.message(HELP);
    return 0;
  }
  let dir = args.positionals[0];
  if (!dir) {
    if (!ctx.interactive) throw new CliError("Usage: vamos-ui create <dir> [--template next|vite] [--preset <code>]");
    dir = unwrap(await p.text({ message: "Project folder", initialValue: "my-app", validate: (v) => (v && v.trim() ? undefined : "Enter a folder name") })).trim();
  }
  const target = path.resolve(ctx.cwd, dir);
  if (!isEmptyDir(target)) throw new CliError(`${dir} already exists and is not empty.`, "Pick a new folder name, or run `npx vamos-ui init` inside an existing app.");

  let template = str(args.flags, "template") as Template | undefined;
  if (template && !TEMPLATES.includes(template)) throw new CliError(`Unknown template "${template}".`, `Use one of: ${TEMPLATES.join(", ")}.`);
  if (!template) {
    template = ctx.interactive
      ? (unwrap(await p.select({ message: "Template", initialValue: "next", options: TEMPLATES.map((t) => ({ value: t, label: TEMPLATE_INFO[t].label })) })) as Template)
      : "next";
  }
  const presetCode = str(args.flags, "preset");
  const preset = presetCode ? parsePresetFlag(presetCode) : null;
  const install = bool(args.flags, "install", true);
  const name = packageNameFor(target);

  p.intro(pc.bold(`Vamos UI · create ${name}`));
  const files = await scaffold(target, { template, name, theme: preset ? presetTheme(preset) : {} });
  p.log.step(`Wrote the ${TEMPLATE_INFO[template].label} template (${files.length} files) to ${pc.dim(path.relative(ctx.cwd, target) || ".")}`);

  // vamos.json first, so init and add use this folder even inside another Vamos UI project.
  const project = detectProject(target);
  await writeConfig(target, validateConfig({ ...DEFAULT_CONFIG, ...suggestPaths(project), registry: ctx.registryFlag ?? DEFAULT_REGISTRY }));

  const pm = detectPackageManager(target);
  if (install) {
    const [cmd, cmdArgs] = projectInstallCommand(pm);
    const s = spinner();
    s.start(`Installing dependencies with ${pm}`);
    try {
      await runCommand(target, cmd, cmdArgs);
      s.stop(`Installed dependencies with ${pm}`);
    } catch (err) {
      s.error("Install failed");
      throw err;
    }
  } else p.log.info(pc.dim(`Skipped installing (--no-install). Run ${pm} install in ${dir}.`));

  const sub: Context = { ...ctx, cwd: target, interactive: false, yes: true };
  const flags: ParsedArgs["flags"] = { yes: true, install, ...(preset ? { preset: encodePreset(preset) } : {}) };
  const initCode = await init(sub, { command: "init", positionals: [], flags });
  if (initCode !== 0) return initCode;
  const addCode = await add(sub, { command: "add", positionals: STARTER_ITEMS, flags: { yes: true, install } });
  if (addCode !== 0) return addCode;

  const rel = path.relative(ctx.cwd, target) || ".";
  const run = pm === "npm" ? "npm run dev" : `${pm} dev`;
  p.outro(`Created ${pc.bold(name)}. Next: ${pc.cyan(`cd ${rel}${install ? "" : ` && ${pm} install`} && ${run}`)}`);
  return 0;
}
