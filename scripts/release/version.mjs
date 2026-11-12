#!/usr/bin/env node
// pnpm release:version — apply the pending changesets.
//   1. `changeset version`: bumps package versions and writes each CHANGELOG.md.
//   2. Dates the new CHANGELOG headings ("## 0.5.1" → "## 0.5.1 — 2026-11-13").
//   3. Copies the new versions into the source constants (CLI VERSION, MCP SERVER_VERSION).
// The release workflow runs this inside the "Version packages" pull request.
import fs from "node:fs";
import path from "node:path";
import { PACKAGES, ROOT, log, run, versionOf } from "./lib.mjs";

run(path.join(ROOT, "node_modules", ".bin", "changeset"), ["version"]);

const today = new Date().toISOString().slice(0, 10);
for (const pkg of PACKAGES) {
  const version = versionOf(pkg);

  const changelog = path.join(ROOT, pkg.dir, "CHANGELOG.md");
  if (fs.existsSync(changelog)) {
    const md = fs.readFileSync(changelog, "utf8");
    const dated = md.replace(/^## (\d+\.\d+\.\d+(?:-[\w.]+)?)[ \t]*$/gm, `## $1 — ${today}`);
    if (dated !== md) fs.writeFileSync(changelog, dated);
  }

  for (const { file, re } of pkg.versionIn) {
    const abs = path.join(ROOT, file);
    const src = fs.readFileSync(abs, "utf8");
    const next = src.replace(re, (m, old) => m.replace(`"${old}"`, `"${version}"`));
    if (next !== src) {
      fs.writeFileSync(abs, next);
      log(`${file}: ${version}`);
    }
  }
  log(`${pkg.name} ${version}`);
}
