import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { ToolError } from "./errors.js";

/** Project files the design tools read. Mirrors the CLI defaults (packages/cli/src/core/config.ts). */
export const CONFIG_FILE = "vamos.json";
export const BRAND_FILE = "vamos.brand.json";
export const BRAND_SCHEMA = "https://ui.vamos.ist/r/brand-schema.json";

export interface ProjectTheme {
  theme?: "light" | "dark";
  material?: string;
  accent?: string;
  density?: string;
  font?: string;
}

export interface ProjectConfig {
  uiDir: string;
  css: string;
  theme?: ProjectTheme;
  /** Raw vamos.json, for writing it back with only `theme` changed. */
  raw: Record<string, unknown>;
}

export const DEFAULT_UI_DIR = "src/components/vamos";
export const DEFAULT_CSS = "src/app/globals.css";

/** Resolves and checks the project directory (default: the server's working directory). */
export function resolveProjectDir(dir: string | undefined): string {
  const root = path.resolve(dir?.trim() || process.cwd());
  if (!existsSync(root)) throw new ToolError(`Project directory not found: ${root}. Pass projectDir as an absolute path to the project root.`);
  if (!statSync(root).isDirectory()) throw new ToolError(`projectDir is not a directory: ${root}.`);
  return realpathSync(root);
}

/** Project-relative posix path → absolute path, refusing anything that resolves outside `root` (also through symlinks). */
export function insideProject(root: string, rel: string): string {
  if (!rel || path.isAbsolute(rel) || /^[a-z]+:/i.test(rel)) throw new ToolError(`"${rel}" must be a path relative to the project root.`);
  const abs = path.resolve(root, rel);
  const check = (base: string, candidate: string) => {
    const r = path.relative(base, candidate);
    if (r === ".." || r.startsWith(`..${path.sep}`) || path.isAbsolute(r)) throw new ToolError(`"${rel}" resolves outside the project (${root}); refusing to touch it.`);
  };
  check(root, abs);
  // Follow symlinks on the deepest existing ancestor.
  let probe = abs;
  while (!existsSync(probe) && path.dirname(probe) !== probe) probe = path.dirname(probe);
  check(existsSync(root) ? realpathSync(root) : root, realpathSync(probe));
  return abs;
}

export function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

export function readJsonFile(file: string): unknown {
  const text = readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ToolError(`${path.basename(file)} is not valid JSON: ${(error as Error).message}`);
  }
}

const isInside = (p: unknown) => typeof p === "string" && p.length > 0 && !path.isAbsolute(p) && !p.split(/[\\/]/).includes("..");

/** Reads vamos.json; null when the project has none. */
export function readProjectConfig(root: string): ProjectConfig | null {
  const file = path.join(root, CONFIG_FILE);
  if (!existsSync(file)) return null;
  const raw = readJsonFile(file);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new ToolError(`${CONFIG_FILE} must contain a JSON object.`);
  const record = raw as Record<string, unknown>;
  const uiDir = record.uiDir ?? DEFAULT_UI_DIR;
  const css = record.css ?? DEFAULT_CSS;
  if (!isInside(uiDir)) throw new ToolError(`${CONFIG_FILE}: "uiDir" must be a path inside the project.`);
  if (!isInside(css)) throw new ToolError(`${CONFIG_FILE}: "css" must be a path inside the project.`);
  const theme = record.theme && typeof record.theme === "object" ? (record.theme as ProjectTheme) : undefined;
  return { uiDir: String(uiDir).replace(/\/+$/, ""), css: String(css), theme, raw: record };
}

// --- source files (same selection as `vamos-ui verify`) --------------------------

const EXT = /\.(tsx|jsx|ts|js|mjs|cjs|mts|cts|html|htm|vue|svelte|astro|mdx|css)$/;
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", "out", "coverage", ".turbo", ".vercel", ".output", ".svelte-kit", ".astro"]);
const TEST_FILE = /\.(test|spec|stories)\.[jt]sx?$|\.d\.ts$/;
export const DEFAULT_ROOTS = ["src", "app", "components", "pages", "lib", "index.html"];
export const MAX_FILES = 3000;
const MAX_FILE_BYTES = 1_000_000;

export interface CollectedFiles {
  files: string[];
  truncated: boolean;
  skippedLarge: string[];
}

/** Source files under `inputs` (project-relative), skipping build output, tests and `exclude` dirs. */
export function collectSourceFiles(root: string, inputs: string[], exclude: string[] = []): CollectedFiles {
  const files: string[] = [];
  const skippedLarge: string[] = [];
  let truncated = false;
  const excluded = exclude.map((e) => path.resolve(root, e));
  const isExcluded = (abs: string) => excluded.some((e) => abs === e || abs.startsWith(e + path.sep));
  const walk = (abs: string, explicit: boolean) => {
    if (truncated || !existsSync(abs) || (!explicit && isExcluded(abs))) return;
    const st = statSync(abs);
    if (st.isDirectory()) {
      for (const entry of readdirSync(abs).sort()) {
        if (IGNORE_DIRS.has(entry) || entry.startsWith(".")) continue;
        walk(path.join(abs, entry), false);
      }
      return;
    }
    if (!explicit && (!EXT.test(abs) || TEST_FILE.test(abs))) return;
    if (st.size > MAX_FILE_BYTES) {
      skippedLarge.push(toPosix(path.relative(root, abs)));
      return;
    }
    if (files.length >= MAX_FILES) {
      truncated = true;
      return;
    }
    files.push(abs);
  };
  for (const input of inputs) walk(insideProject(root, input), true);
  return { files: [...new Set(files)].sort(), truncated, skippedLarge };
}

/** Root layout / HTML entry where the theme attributes live, if one exists. */
export function findRootDocument(root: string): string | undefined {
  const candidates = ["src/app/layout.tsx", "app/layout.tsx", "src/app/layout.jsx", "app/layout.jsx", "index.html", "src/index.html", "pages/_document.tsx", "src/pages/_document.tsx"];
  return candidates.find((c) => existsSync(path.join(root, c)));
}

/** Every project-relative posix path (app routes, public/, sources) for the route and website checks. */
export function listProjectPaths(root: string, limit = 20000): string[] {
  const out: string[] = [];
  const walk = (abs: string, rel: string) => {
    if (out.length >= limit) return;
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      const r = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(abs, entry.name), r);
      else out.push(r);
    }
  };
  walk(root, "");
  return out.sort();
}
