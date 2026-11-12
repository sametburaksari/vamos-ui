#!/usr/bin/env node
// pnpm release:publish — publish the package versions that are not on npm yet, then tag them.
//
//   1. Skips everything when every version in the repo is already on npm.
//   2. Runs check.mjs (build, pack, install with npm, smoke test) and uploads those tarballs.
//   3. In GitHub Actions it publishes with npm trusted publishing (OIDC, no token) and
//      provenance; locally it asks for npm's browser / security-key confirmation.
//   4. Creates a git tag "<name>@<version>" and a GitHub release (notes from CHANGELOG.md) for
//      each package version on npm that has no tag yet.
//
//   --dry-run   show what would be published and tagged, change nothing
import { execFileSync } from "node:child_process";
import path from "node:path";
import { OUT, PACKAGES, changelogSection, isPublished, log, run, tagOf, tarballName, versionOf } from "./lib.mjs";

const dryRun = process.argv.includes("--dry-run");
const inCI = !!process.env.GITHUB_ACTIONS;

const pending = PACKAGES.filter((p) => !isPublished(p.name, versionOf(p)));
if (pending.length) {
  log(`To publish: ${pending.map(tagOf).join(", ")}`);
  if (!dryRun) {
    run("node", ["scripts/release/check.mjs"]);
    for (const pkg of pending) {
      const args = ["publish", path.join(OUT, tarballName(pkg)), "--access", "public"];
      if (inCI) args.push("--provenance");
      else args.push("--auth-type=web");
      log(`\n▸ npm ${args.join(" ")}`);
      run("npm", args);
    }
  }
} else log("Every package version is already on npm.");

// Tags and GitHub releases for versions that are on npm but not tagged yet.
const remoteTags = new Set(
  run("git", ["ls-remote", "--tags", "origin"], { capture: true })
    .split("\n")
    .map((l) => l.split("refs/tags/")[1]?.replace(/\^\{\}$/, ""))
    .filter(Boolean),
);
const toTag = PACKAGES.filter((p) => !remoteTags.has(tagOf(p)) && (pending.includes(p) ? !dryRun : true));
for (const pkg of toTag) {
  const tag = tagOf(pkg);
  const notes = changelogSection(pkg) || `See ${pkg.dir}/CHANGELOG.md.`;
  if (dryRun) {
    log(`would tag ${tag} and create its GitHub release`);
    continue;
  }
  const exists = (() => {
    try {
      execFileSync("git", ["rev-parse", "-q", "--verify", `refs/tags/${tag}`], { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  })();
  if (!exists) run("git", ["tag", "-a", tag, "-m", `${pkg.name} ${versionOf(pkg)}`]);
  run("git", ["push", "origin", `refs/tags/${tag}`]);
  run("gh", ["release", "create", tag, "--title", `${pkg.name} ${versionOf(pkg)}`, "--notes", notes, "--verify-tag"]);
  log(`✓ tagged ${tag}`);
}
if (!toTag.length) log("Every published version is tagged.");
