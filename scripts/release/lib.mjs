// Shared helpers for the release scripts (version.mjs, check.mjs, publish.mjs).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
/** Where check.mjs writes the tarballs that publish.mjs uploads. */
export const OUT = path.join(ROOT, ".release");

/**
 * The published packages, in publish order (a package comes after the ones it depends on).
 * `versionIn` lists source constants that must equal the package version.
 */
export const PACKAGES = [
  {
    dir: "packages/ui",
    name: "@vamos-ui/react",
    // Built into packages/ui/.npm (compiled JS + .d.ts); the workspace itself imports src/*.ts.
    build: ["node", ["packages/ui/scripts/build-npm.mjs"]],
    packDir: "packages/ui/.npm",
    versionIn: [],
  },
  {
    dir: "packages/cli",
    name: "vamos-ui",
    build: ["pnpm", ["--dir", "packages/cli", "run", "build"]],
    packDir: "packages/cli",
    versionIn: [{ file: "packages/cli/src/cli.ts", re: /export const VERSION = "([^"]+)";/ }],
  },
  {
    dir: "packages/mcp",
    name: "@vamos-ui/mcp",
    build: ["pnpm", ["--dir", "packages/mcp", "run", "build"]],
    packDir: "packages/mcp",
    versionIn: [{ file: "packages/mcp/src/server.ts", re: /export const SERVER_VERSION = "([^"]+)";/ }],
  },
];

export const readJson = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
export const versionOf = (pkg) => readJson(`${pkg.dir}/package.json`).version;
export const tarballName = (pkg) => `${pkg.name.replace(/^@/, "").replace("/", "-")}-${versionOf(pkg)}.tgz`;
export const tagOf = (pkg) => `${pkg.name}@${versionOf(pkg)}`;

export function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: ROOT, stdio: opts.capture ? ["ignore", "pipe", "pipe"] : "inherit", encoding: "utf8", ...opts });
}

/** True when name@version exists on the npm registry (including versions npm is still processing). */
export function isPublished(name, version) {
  try {
    const out = execFileSync("npm", ["view", `${name}@${version}`, "version", "--json"], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

/** The CHANGELOG.md section for one version (without its heading), or "". */
export function changelogSection(pkg, version = versionOf(pkg)) {
  const file = path.join(ROOT, pkg.dir, "CHANGELOG.md");
  if (!fs.existsSync(file)) return "";
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${version.replace(/\./g, "\\.")}(\\s|$)`).test(l));
  if (start < 0) return "";
  let end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  if (end < 0) end = lines.length;
  return lines.slice(start + 1, end).join("\n").trim();
}

export function log(msg) {
  process.stdout.write(`${msg}\n`);
}
