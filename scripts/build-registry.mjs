#!/usr/bin/env node
// @ts-check
/**
 * Builds the Vamos UI registry into apps/www/public/r/ (served at https://ui.vamos.ist/r/).
 *
 *   node scripts/build-registry.mjs            build, print a summary
 *   node scripts/build-registry.mjs --out DIR  write somewhere else
 *   node scripts/build-registry.mjs --strict   treat warnings as errors
 *   node scripts/build-registry.mjs --quiet    only print problems
 *
 * Exits 1 when the registry is inconsistent (missing files, unresolved imports, bad entries).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { buildRegistry, writeRegistry } from "./registry/build.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({
  options: {
    out: { type: "string" },
    strict: { type: "boolean", default: false },
    quiet: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});
if (values.help) {
  console.log("Usage: node scripts/build-registry.mjs [--out <dir>] [--strict] [--quiet]");
  process.exit(0);
}

const started = performance.now();
const outDir = path.resolve(values.out ?? path.join(root, "apps/www/public/r"));
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (/** @type {string} */ code) => (/** @type {string} */ s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = paint("1");
const dim = paint("2");
const red = paint("31");
const yellow = paint("33");
const green = paint("32");

/** Relative to the cwd when inside it, absolute otherwise. @param {string} p */
const displayPath = (p) => {
  const rel = path.relative(process.cwd(), p);
  return rel && !rel.startsWith("..") ? rel : p;
};

let result;
try {
  result = buildRegistry({ root });
} catch (e) {
  console.error(red("✖ registry build failed: ") + /** @type {Error} */ (e).message);
  process.exit(1);
}

if (!values.quiet) for (const i of result.info) console.log(`${dim("note")}  ${dim(i)}`);
for (const w of result.warnings) console.warn(`${yellow("warn")}  ${w}`);
for (const e of result.errors) console.error(`${red("error")} ${e}`);
const failed = result.errors.length > 0 || (values.strict && result.warnings.length > 0);
if (failed) {
  console.error(red(`\n✖ ${result.errors.length} error(s), ${result.warnings.length} warning(s) — registry not written.`));
  process.exit(1);
}

const stats = writeRegistry(result, outDir);
const ms = Math.round(performance.now() - started);
if (!values.quiet) {
  const kb = (/** @type {number} */ n) => `${(n / 1024).toFixed(0)} KB`;
  const order = ["component", "block", "lib", "style"];
  const fileCount = result.items.reduce((n, i) => n + i.files.length, 0);
  console.log(`\n${bold("Vamos UI registry")} ${dim(`v${result.index.version}`)} → ${displayPath(outDir)}`);
  for (const t of order) console.log(`  ${t.padEnd(10)} ${String(stats.byType[t] ?? 0).padStart(4)}`);
  console.log(`  ${"tokens".padEnd(10)} ${String(result.tokens.length).padStart(4)}`);
  console.log(dim(`  ${result.items.length} items · ${fileCount} source files · ${stats.files} JSON files · ${kb(stats.bytes)} · ${ms} ms`));
  console.log(green(`✔ done`) + (result.warnings.length ? yellow(` with ${result.warnings.length} warning(s)`) : ""));
}
