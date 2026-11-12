import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { findProjectRoot, readConfig } from "../core/config";
import { CliError } from "../core/types";
import { SITE_FILE, verifyProject, verifySource, type VerifyIssue } from "../verify";
import type { ParsedArgs } from "../args";
import { out, pad, pc, plural, printJson, type Context } from "../ui";

const EXT = /\.(tsx|jsx|ts|js|mjs|cjs|mts|cts|html|htm|vue|svelte|astro|mdx|css)$/;
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", "out", "coverage", ".turbo", ".vercel", ".output", ".svelte-kit", ".astro"]);
const TEST_FILE = /\.(test|spec|stories)\.[jt]sx?$|\.d\.ts$/;
export const DEFAULT_ROOTS = ["src", "app", "components", "pages", "lib", "index.html"];

export function collectFiles(root: string, inputs: string[], exclude: string[]): string[] {
  const files = new Set<string>();
  const excluded = (abs: string) => exclude.some((e) => abs === e || abs.startsWith(e + path.sep));
  const walk = (abs: string, explicit: boolean) => {
    if (!existsSync(abs) || (!explicit && excluded(abs))) return;
    const st = statSync(abs);
    if (st.isDirectory()) {
      for (const entry of readdirSync(abs)) {
        if (IGNORE_DIRS.has(entry) || entry.startsWith(".")) continue;
        walk(path.join(abs, entry), false);
      }
    } else if (explicit || (EXT.test(abs) && !TEST_FILE.test(abs))) files.add(abs);
  };
  for (const input of inputs) walk(path.resolve(root, input), true);
  return [...files].sort();
}

/**
 * The files a project command works on: the given paths (relative to cwd), or the default
 * source folders minus the kit folder (upstream code; pass it explicitly to include it).
 */
export function projectFiles(ctx: Context, root: string, positionals: string[], uiDir: string | null, command: string): string[] {
  if (positionals.length) return collectFiles(ctx.cwd, positionals, []);
  const inputs = DEFAULT_ROOTS.filter((r) => existsSync(path.join(root, r)));
  if (!inputs.length) throw new CliError("No source folders found (looked for src/, app/, components/, pages/).", `Pass paths: vamos-ui ${command} <paths...>`);
  return collectFiles(root, inputs, uiDir ? [path.resolve(root, uiDir)] : []);
}

/** Every project-relative posix path (for route and launch checks), skipping build output and dot folders. */
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

/** Byte sizes of the raster images in public/ (for the image-weight check). */
export function publicImageSizes(root: string, paths: string[]): Record<string, number> {
  const sizes: Record<string, number> = {};
  for (const p of paths) {
    if (!p.startsWith("public/") || !/\.(?:jpe?g|png|webp|avif|gif)$/i.test(p)) continue;
    try {
      sizes[p] = statSync(path.join(root, p)).size;
    } catch {
      // vanished between listing and stat
    }
  }
  return sizes;
}

/** Route and website-launch checks over the whole project, merged into the report by file. */
export function addProjectChecks(root: string, files: string[], report: VerifyReport): VerifyReport {
  const sources = files.map((abs) => ({ path: path.relative(root, abs).split(path.sep).join("/"), content: readFileSync(abs, "utf8") }));
  const paths = listProjectPaths(root);
  const siteFile = path.join(root, SITE_FILE);
  const siteJson = existsSync(siteFile) ? readFileSync(siteFile, "utf8") : undefined;
  const issues = verifyProject({ paths, sources, sizes: publicImageSizes(root, paths), siteJson });
  for (const { file, ...issue } of issues) {
    let entry = report.results.find((r) => r.file === file);
    if (!entry) report.results.push((entry = { file, issues: [] }));
    entry.issues.push(issue);
    if (issue.severity === "error") report.errors++;
    else report.warnings++;
  }
  return report;
}

export interface VerifyReport {
  files: number;
  errors: number;
  warnings: number;
  results: { file: string; issues: VerifyIssue[] }[];
}

export function verifyFiles(root: string, files: string[]): VerifyReport {
  const results: VerifyReport["results"] = [];
  let errors = 0;
  let warnings = 0;
  for (const abs of files) {
    const rel = path.relative(root, abs).split(path.sep).join("/");
    const issues = verifySource(readFileSync(abs, "utf8"), rel);
    if (!issues.length) continue;
    errors += issues.filter((i) => i.severity === "error").length;
    warnings += issues.filter((i) => i.severity === "warning").length;
    results.push({ file: rel, issues });
  }
  return { files: files.length, errors, warnings, results };
}

export async function verify(ctx: Context, args: ParsedArgs): Promise<number> {
  const root = findProjectRoot(ctx.cwd);
  const config = await readConfig(root).catch(() => null);
  const files = projectFiles(ctx, root, args.positionals, config?.uiDir ?? null, "verify");
  const report = verifyFiles(root, files);
  // Project mode (no paths): also check links against the app's routes and the website basics.
  if (!args.positionals.length) addProjectChecks(root, files, report);
  if (ctx.json) {
    printJson(report);
    return report.errors ? 1 : 0;
  }
  const quiet = args.flags.quiet === true;
  for (const r of report.results) {
    const shown = quiet ? r.issues.filter((i) => i.severity === "error") : r.issues;
    if (!shown.length) continue;
    out(`\n${pc.underline(r.file)}`);
    for (const i of shown) {
      const sev = i.severity === "error" ? pc.red("error  ") : pc.yellow("warning");
      out(`  ${pc.dim(pad(`${i.line}:${i.column}`, 8))}${sev}  ${i.message}  ${pc.dim(i.rule)}`);
      if (i.fix) out(`  ${" ".repeat(8)}${pc.dim("→ " + i.fix)}`);
    }
  }
  const inFiles = report.results.length;
  if (!report.errors && !report.warnings) out(`${pc.green("✔")} No issues in ${plural(report.files, "file")}.`);
  else {
    const parts = [report.errors && pc.red(plural(report.errors, "error")), report.warnings && pc.yellow(plural(report.warnings, "warning"))].filter(Boolean);
    out(`\n${report.errors ? pc.red("✖") : pc.yellow("!")} ${parts.join(", ")} in ${plural(inFiles, "file")} ${pc.dim(`(${report.files} checked)`)}`);
  }
  return report.errors ? 1 : 0;
}
