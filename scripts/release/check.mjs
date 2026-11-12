#!/usr/bin/env node
// pnpm release:check — build and pack every published package exactly as it will be uploaded,
// then install the tarballs with plain npm in an empty folder and use them.
//
// Catches what unit tests cannot: a stale dist/, a `workspace:*` dependency left in the packed
// package.json, a missing file behind an export, a version constant that differs from
// package.json, a bin that does not start. publish.mjs uploads these same tarballs.
//
//   --skip-build   reuse the existing builds (faster when you just built)
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { OUT, PACKAGES, ROOT, log, run, tarballName, versionOf } from "./lib.mjs";

const skipBuild = process.argv.includes("--skip-build");
const problems = [];
const fail = (msg) => problems.push(msg);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 1. Versions in source match package.json.
for (const pkg of PACKAGES) {
  const version = versionOf(pkg);
  for (const { file, re } of pkg.versionIn) {
    const found = re.exec(fs.readFileSync(path.join(ROOT, file), "utf8"))?.[1];
    if (found !== version) fail(`${file} says ${found ?? "(no version)"}, ${pkg.dir}/package.json says ${version}. Run pnpm release:version or fix the constant.`);
  }
}

// 2. Build and pack. pnpm pack turns workspace:* into real versions; npm pack would not.
for (const pkg of PACKAGES) {
  if (!skipBuild) {
    log(`\n▸ build ${pkg.name}`);
    run(pkg.build[0], pkg.build[1]);
  }
  const packDir = path.join(ROOT, pkg.packDir);
  if (!fs.existsSync(path.join(packDir, "package.json"))) {
    fail(`${pkg.packDir}/package.json is missing (build ${pkg.name} first).`);
    continue;
  }
  run("pnpm", ["pack", "--pack-destination", OUT], { cwd: packDir, capture: true });
  const tgz = path.join(OUT, tarballName(pkg));
  if (!fs.existsSync(tgz)) fail(`expected ${path.relative(ROOT, tgz)} after packing ${pkg.name}.`);
}

// 3. The packed package.json files.
for (const pkg of PACKAGES) {
  const tgz = path.join(OUT, tarballName(pkg));
  if (!fs.existsSync(tgz)) continue;
  const manifest = JSON.parse(run("tar", ["-xzOf", tgz, "package/package.json"], { capture: true }));
  if (manifest.version !== versionOf(pkg)) fail(`${pkg.name}: packed version ${manifest.version}, expected ${versionOf(pkg)}.`);
  for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
    for (const [dep, range] of Object.entries(manifest[field] ?? {})) {
      if (/^(workspace|link|file):/.test(String(range))) fail(`${pkg.name}: ${field}.${dep} is "${range}" in the tarball; it cannot be installed from npm.`);
    }
  }
  const files = run("tar", ["-tzf", tgz], { capture: true }).split("\n");
  for (const f of ["package/CHANGELOG.md", "package/README.md", "package/LICENSE"]) if (!files.includes(f)) fail(`${pkg.name}: ${f.slice(8)} is not in the tarball.`);
  log(`✓ packed ${path.basename(tgz)} (${files.length - 1} files)`);
}

if (problems.length) finish();

// 4. Install the tarballs with plain npm, like a user (and the hosted MCP server) would.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vamos-ui-release-"));
fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "release-smoke", private: true, type: "module" }));
log(`\n▸ npm install in ${dir}`);
run("npm", ["install", "--no-audit", "--no-fund", "--ignore-scripts", "--loglevel=error", ...PACKAGES.map((p) => path.join(OUT, tarballName(p))), "react@19", "react-dom@19"], { cwd: dir });
const nm = path.join(dir, "node_modules");

// @vamos-ui/react: every export points at files that exist; the entry points load in Node.
{
  const pkg = PACKAGES[0];
  const root = path.join(nm, pkg.name);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const targets = [];
  for (const [key, value] of Object.entries(manifest.exports ?? {})) {
    if (key.includes("*")) continue;
    for (const t of typeof value === "string" ? [value] : Object.values(value)) targets.push([key, t]);
  }
  for (const [key, t] of targets) if (!fs.existsSync(path.join(root, t))) fail(`${pkg.name}: export "${key}" points at ${t}, which is not in the package.`);
  const jsEntries = Object.entries(manifest.exports ?? {}).filter(([k, v]) => !k.includes("*") && typeof v === "object").map(([k]) => (k === "." ? pkg.name : `${pkg.name}/${k.slice(2)}`));
  const loader = `const r = await Promise.allSettled(${JSON.stringify(jsEntries)}.map((m) => import(m)));
    const bad = r.map((x, i) => [x, ${JSON.stringify(jsEntries)}[i]]).filter(([x]) => x.status === "rejected").map(([x, m]) => m + ": " + String(x.reason?.message ?? x.reason).split("\\n")[0]);
    console.log(JSON.stringify(bad));`;
  const bad = JSON.parse(run("node", ["--input-type=module", "-e", loader], { cwd: dir, capture: true }).trim().split("\n").pop());
  for (const b of bad) fail(`${pkg.name}: import failed: ${b}`);
  log(`✓ ${pkg.name}: ${targets.length} export files, ${jsEntries.length - bad.length}/${jsEntries.length} entry points load`);
}

// vamos-ui: the bin reports its version and the audit library loads.
{
  const pkg = PACKAGES[1];
  const out = run(path.join(nm, ".bin", "vamos-ui"), ["--version"], { cwd: dir, capture: true }).trim();
  if (out !== versionOf(pkg)) fail(`vamos-ui --version printed "${out}", expected ${versionOf(pkg)}.`);
  const audit = run("node", ["--input-type=module", "-e", `const m = await import("vamos-ui/audit"); console.log(typeof m.runAudit);`], { cwd: dir, capture: true }).trim();
  if (audit !== "function") fail(`vamos-ui/audit does not export runAudit (${audit}).`);
  log(`✓ vamos-ui ${out}: bin and vamos-ui/audit work`);
}

// @vamos-ui/mcp: the HTTP server starts, reports its version and lists tools.
{
  const pkg = PACKAGES[2];
  const port = 39000 + Math.floor(Math.random() * 500);
  const child = spawn(path.join(nm, ".bin", "vamos-ui-mcp"), ["--http", "--port", String(port), "--host", "127.0.0.1"], { cwd: dir, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (d) => (stderr += d));
  try {
    let health;
    for (let i = 0; i < 60 && !health; i++) {
      await new Promise((r) => setTimeout(r, 250));
      health = await fetch(`http://127.0.0.1:${port}/health`).then((r) => r.json()).catch(() => undefined);
    }
    if (!health) fail(`vamos-ui-mcp did not start: ${stderr.trim().split("\n").slice(-3).join(" ")}`);
    else {
      if (health.version !== versionOf(pkg)) fail(`vamos-ui-mcp reports ${health.version}, expected ${versionOf(pkg)}.`);
      const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
      });
      const text = await res.text();
      const tools = (text.match(/"name":"[a-z_]+"/g) ?? []).length;
      if (!tools) fail(`vamos-ui-mcp tools/list returned no tools (HTTP ${res.status}).`);
      else log(`✓ vamos-ui-mcp ${health.version}: HTTP server up, ${tools} tools`);
    }
  } finally {
    child.kill();
  }
}

fs.rmSync(dir, { recursive: true, force: true });
finish();

function finish() {
  if (problems.length) {
    log(`\n✗ release check failed:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    process.exit(1);
  }
  log(`\n✓ release check passed: ${PACKAGES.map((p) => `${p.name}@${versionOf(p)}`).join(", ")} in ${path.relative(ROOT, OUT)}/`);
}
