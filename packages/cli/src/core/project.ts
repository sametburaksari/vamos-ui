import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type Framework = "next" | "vite" | "unknown";
export type PackageManager = "pnpm" | "yarn" | "bun" | "npm";

export interface ProjectInfo {
  root: string;
  framework: Framework;
  /** Next.js App Router (app/ or src/app/) present. */
  appRouter: boolean;
  srcDir: boolean;
  tailwind: { installed: boolean; v4: boolean; version?: string };
  packageManager: PackageManager;
  /** Base of the "@/*"-style alias, e.g. { alias: "@", target: "src" }. */
  alias: { alias: string; target: string } | null;
  css: string | null;
  deps: Record<string, string>;
}

/**
 * Strip comments and trailing commas from JSONC (tsconfig) without touching string contents.
 * A regex pass is not enough: `"@/*"` and `"**\/*.ts"` in a normal tsconfig look like a block comment.
 */
export function stripJsonc(text: string): string {
  let out = "";
  let i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i]!;
    if (ch === '"') {
      let j = i + 1;
      while (j < n && text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
      out += text.slice(i, j + 1);
      i = j + 1;
    } else if (ch === "/" && text[i + 1] === "/") {
      while (i < n && text[i] !== "\n") i++;
    } else if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
    } else if (ch === ",") {
      let j = i + 1;
      while (j < n && /\s/.test(text[j]!)) j++;
      if (text[j] === "}" || text[j] === "]") i++;
      else {
        out += ch;
        i++;
      }
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}

function readJson(file: string): any {
  try {
    // tsconfig allows comments and trailing commas
    return JSON.parse(stripJsonc(stripJsonc(readFileSync(file, "utf8"))));
  } catch {
    return null;
  }
}

export function detectPackageManager(root: string, pkg?: any): PackageManager {
  const declared = typeof pkg?.packageManager === "string" ? pkg.packageManager.split("@")[0] : null;
  if (declared === "pnpm" || declared === "yarn" || declared === "bun" || declared === "npm") return declared;
  let dir = root;
  for (;;) {
    if (existsSync(path.join(dir, "pnpm-lock.yaml")) || existsSync(path.join(dir, "pnpm-workspace.yaml"))) return "pnpm";
    if (existsSync(path.join(dir, "bun.lockb")) || existsSync(path.join(dir, "bun.lock"))) return "bun";
    if (existsSync(path.join(dir, "yarn.lock"))) return "yarn";
    if (existsSync(path.join(dir, "package-lock.json"))) return "npm";
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const ua = process.env.npm_config_user_agent ?? "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("bun")) return "bun";
  return "npm";
}

const CSS_CANDIDATES = [
  "src/app/globals.css",
  "app/globals.css",
  "src/styles/globals.css",
  "styles/globals.css",
  "src/index.css",
  "src/main.css",
  "src/app.css",
  "src/styles.css",
  "src/style.css",
  "app/app.css",
];

export function detectProject(root: string): ProjectInfo {
  const pkg = readJson(path.join(root, "package.json")) ?? {};
  const deps: Record<string, string> = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  const has = (f: string) => existsSync(path.join(root, f));
  const framework: Framework = deps.next ? "next" : deps.vite || has("vite.config.ts") || has("vite.config.js") || has("vite.config.mjs") ? "vite" : "unknown";
  const srcDir = has("src");
  const appRouter = has("src/app") || has("app");

  const twVersion = deps.tailwindcss;
  const v4 = !!twVersion && /(^|[^\d])4\./.test(twVersion.replace(/^[\^~>=<\s]+/, "")) || !!deps["@tailwindcss/postcss"] || !!deps["@tailwindcss/vite"];
  const tailwind = { installed: !!twVersion || v4, v4, ...(twVersion ? { version: twVersion } : {}) };

  let alias: ProjectInfo["alias"] = null;
  for (const name of ["tsconfig.json", "jsconfig.json", "tsconfig.app.json"]) {
    const ts = readJson(path.join(root, name));
    const paths = ts?.compilerOptions?.paths as Record<string, string[]> | undefined;
    if (!paths) continue;
    const baseUrl: string = ts.compilerOptions.baseUrl ?? ".";
    for (const [key, targets] of Object.entries(paths)) {
      const m = /^(.+)\/\*$/.exec(key);
      const t = targets?.[0];
      if (m && t && t.endsWith("/*")) {
        const target = path.posix.normalize(path.posix.join(baseUrl.replace(/\\/g, "/"), t.slice(0, -2))).replace(/^\.\/?/, "");
        alias = { alias: m[1]!, target };
        break;
      }
    }
    if (alias) break;
  }

  const css = CSS_CANDIDATES.find((c) => has(c)) ?? null;
  return { root, framework, appRouter, srcDir, tailwind, packageManager: detectPackageManager(root, pkg), alias, css, deps };
}

/** Suggested vamos.json paths for this project. */
export function suggestPaths(info: ProjectInfo): { uiDir: string; blocksDir: string; css: string; importAlias: string } {
  const base = info.srcDir ? "src/components" : "components";
  const uiDir = `${base}/vamos`;
  const blocksDir = `${base}/blocks`;
  const css = info.css ?? (info.framework === "next" ? (info.srcDir ? "src/app/globals.css" : "app/globals.css") : info.srcDir ? "src/index.css" : "styles/globals.css");
  let importAlias = `@/components/vamos`;
  if (info.alias) {
    const target = info.alias.target.replace(/\/$/, "");
    const rel = target === "" || target === "." ? uiDir : uiDir.startsWith(target + "/") ? uiDir.slice(target.length + 1) : null;
    if (rel !== null) importAlias = `${info.alias.alias}/${rel}`;
  }
  return { uiDir, blocksDir, css, importAlias };
}
