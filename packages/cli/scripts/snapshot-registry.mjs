#!/usr/bin/env node
// @ts-check
/**
 * Bundles a copy of the Vamos UI registry (the JSON served at https://ui.vamos.ist/r) into the CLI
 * package, for networks that cannot reach the site. Runs as part of `pnpm --dir packages/cli build`.
 *
 *   node scripts/snapshot-registry.mjs                 build the registry from the repo, then pack it
 *   node scripts/snapshot-registry.mjs --from DIR      pack an already built registry (e.g. apps/www/public/r)
 *   node scripts/snapshot-registry.mjs --out FILE      write somewhere else (default snapshot/registry.json.br)
 *   node scripts/snapshot-registry.mjs --quality N     brotli quality 0-11 (default 10)
 *
 * The format is read by src/core/snapshot.ts (keep the two in step):
 *   brotli( <meta JSON>\n<files JSON> ), meta.sha256 = sha256(<files JSON>)
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import zlib from "node:zlib";

const FORMAT = 1;
const SOURCE = "https://ui.vamos.ist/r";
const pkgDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pkgDir, "../..");

const { values } = parseArgs({
  options: {
    from: { type: "string" },
    out: { type: "string" },
    quality: { type: "string", default: "10" },
    quiet: { type: "boolean", default: false },
  },
});
const outFile = path.resolve(values.out ?? path.join(pkgDir, "snapshot/registry.json.br"));
const quality = Number(values.quality);
const started = performance.now();

/** @param {string} dir @returns {Record<string, string>} */
function readTree(dir) {
  /** @type {Record<string, string>} */
  const files = {};
  for (const rel of fs.readdirSync(dir, { recursive: true }).map(String).sort()) {
    const abs = path.join(dir, rel);
    if (!fs.statSync(abs).isFile() || !/\.(json|md)$/.test(rel)) continue;
    files[rel.split(path.sep).join("/")] = fs.readFileSync(abs, "utf8");
  }
  return files;
}

let srcDir = values.from ? path.resolve(values.from) : "";
let tmp = "";
if (!srcDir) {
  const { buildRegistry, writeRegistry } = await import(path.join(repoRoot, "scripts/registry/build.mjs"));
  const result = buildRegistry({ root: repoRoot });
  if (result.errors.length) {
    for (const e of result.errors) console.error(`error ${e}`);
    console.error("✖ registry build failed; snapshot not written.");
    process.exit(1);
  }
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vamos-snapshot-"));
  writeRegistry(result, tmp);
  srcDir = tmp;
}
if (!fs.existsSync(path.join(srcDir, "index.json"))) {
  console.error(`✖ ${srcDir} has no index.json.`);
  process.exit(1);
}

const files = readTree(srcDir);
/** @type {Record<string, unknown>} */
const parsed = {};
for (const rel of Object.keys(files)) {
  parsed[rel] = rel.endsWith(".json") ? JSON.parse(files[rel]) : files[rel];
  // The CLI writes .json files back with JSON.stringify(v, null, 2) + "\n"; make sure that is lossless.
  if (rel.endsWith(".json") && JSON.stringify(parsed[rel], null, 2) + "\n" !== files[rel]) {
    console.error(`✖ ${rel} is not in the registry's stable JSON layout; the snapshot could not reproduce it.`);
    process.exit(1);
  }
}
const index = /** @type {{ name: string, version: string }} */ (parsed["index.json"]);
const body = JSON.stringify(parsed);
const meta = {
  format: FORMAT,
  name: index.name ?? "vamos-ui",
  version: index.version ?? "0.0.0",
  builtAt: new Date().toISOString(),
  source: SOURCE,
  files: Object.keys(parsed).length,
  sha256: createHash("sha256").update(body).digest("hex"),
};
const raw = Buffer.from(`${JSON.stringify(meta)}\n${body}`);
const packed = zlib.brotliCompressSync(raw, {
  params: { [zlib.constants.BROTLI_PARAM_QUALITY]: quality, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: raw.length },
});
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, packed);
if (tmp) fs.rmSync(tmp, { recursive: true, force: true });

if (!values.quiet) {
  const mb = (/** @type {number} */ n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
  const rel = path.relative(process.cwd(), outFile) || outFile;
  console.log(`registry snapshot v${meta.version}: ${meta.files} files, ${mb(raw.length)} → ${mb(packed.length)} (${rel}, ${Math.round(performance.now() - started)} ms)`);
}
