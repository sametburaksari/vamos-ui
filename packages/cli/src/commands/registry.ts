import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { existsSync, readdirSync } from "node:fs";
import { buildThirdPartyRegistry, writeThirdPartyRegistry } from "../core/registry-build";
import { bundledSnapshotPath, describeSnapshot, exportSnapshot, loadSnapshot } from "../core/snapshot";
import { CliError } from "../core/types";
import { out, p, pc, plural, printJson, type Context } from "../ui";

const HELP = `${pc.bold("vamos-ui registry")}  Build your own registry, or export the bundled Vamos UI registry

${pc.bold("Usage")}
  npx vamos-ui registry build [dir] [--out <dir>] [--homepage <url>] [--name <name>] [--dry-run] [--strict]
  npx vamos-ui registry export <dir> [--force]
  npx vamos-ui registry info

${pc.bold("build")}

Reads components/*.tsx, lib/*.ts and blocks/<name>/ in [dir] (default: the current folder), plus an
optional registry.json for titles, descriptions and Vamos UI dependencies, and writes <name>.json and
index.json to --out (default: <dir>/r). Host the folder anywhere static; people install with
  npx vamos-ui add https://your.site/r/<item>.json
  npx vamos-ui add github:owner/repo/<item>
Guide: https://ui.vamos.ist/docs/publish-a-registry

${pc.bold("export")}
Writes the copy of the Vamos UI registry bundled with this CLI (the same files https://ui.vamos.ist/r
serves) to <dir>, for teams that host or vendor it on a network that cannot reach the site:
  npx vamos-ui registry export ./vendor/vamos-registry
  npx vamos-ui add button --registry ./vendor/vamos-registry     (or VAMOS_REGISTRY, or "registry" in vamos.json)
--force writes into a folder that is not empty.

${pc.bold("info")}
Prints the version and build date of the bundled registry.`;

export async function registry(ctx: Context, args: ParsedArgs): Promise<number> {
  const [sub, dirArg] = args.positionals;
  if (!["build", "export", "info"].includes(sub ?? "") || bool(args.flags, "help")) {
    out(HELP);
    return sub === undefined || bool(args.flags, "help") ? 0 : 1;
  }
  if (sub === "export" || sub === "info") return exportBundled(ctx, sub, dirArg, bool(args.flags, "force"));
  const dir = path.resolve(ctx.cwd, dirArg ?? ".");
  const outDir = path.resolve(ctx.cwd, str(args.flags, "out") ?? path.join(dir, "r"));
  const result = buildThirdPartyRegistry({ dir, homepage: str(args.flags, "homepage"), name: str(args.flags, "name") });
  const failed = result.errors.length > 0 || (bool(args.flags, "strict") && result.warnings.length > 0);
  const dryRun = bool(args.flags, "dry-run");
  const stats = failed || dryRun ? null : await writeThirdPartyRegistry(result, outDir);
  if (ctx.json) {
    printJson({ ok: !failed, out: outDir, written: !!stats, items: result.index.items, errors: result.errors, warnings: result.warnings });
    return failed ? 1 : 0;
  }
  for (const w of result.warnings) p.log.warn(w);
  for (const e of result.errors) p.log.error(e);
  if (failed) {
    p.log.error(`${plural(result.errors.length, "error")}, ${plural(result.warnings.length, "warning")}: registry not written.`);
    return 1;
  }
  const rel = path.relative(ctx.cwd, outDir) || ".";
  const lines = result.items.map((i) => `${pc.cyan(i.name.padEnd(24))}${pc.dim(i.type.padEnd(10))}${i.registryDependencies.length ? pc.dim(`needs ${i.registryDependencies.join(", ")}`) : ""}`);
  p.note(lines.join("\n"), `${result.index.name} ${pc.dim(`v${result.index.version}`)} → ${rel}${dryRun ? pc.dim(" (dry run)") : ""}`);
  if (stats) p.log.success(`Wrote ${plural(stats.files, "file")} (${Math.round(stats.bytes / 1024)} KB). Host ${rel}/ on any static host, then: ${pc.cyan(`npx vamos-ui add https://<host>/${path.basename(outDir)}/${result.items[0]?.name ?? "<item>"}.json`)}`);
  return 0;
}

async function exportBundled(ctx: Context, sub: "export" | "info", dirArg: string | undefined, force: boolean): Promise<number> {
  const file = bundledSnapshotPath();
  if (!file) throw new CliError("This copy of vamos-ui has no bundled registry.", "In the repo, build it with `pnpm --dir packages/cli build`.");
  const snapshot = await loadSnapshot(file);
  const { meta } = snapshot;
  if (sub === "info") {
    if (ctx.json) printJson({ ...meta, file });
    else out(`Bundled registry ${pc.bold(meta.name)} ${describeSnapshot(meta)} · ${plural(meta.files, "file")} · copy of ${meta.source}`);
    return 0;
  }
  if (!dirArg) throw new CliError("Which folder? Run `vamos-ui registry export <dir>`.");
  const outDir = path.resolve(ctx.cwd, dirArg);
  if (existsSync(outDir) && readdirSync(outDir).length && !force) {
    throw new CliError(`${dirArg} is not empty.`, "Pick an empty folder, or pass --force to write into it (files with the same name are replaced).");
  }
  const stats = await exportSnapshot(snapshot, outDir);
  if (ctx.json) {
    printJson({ ok: true, out: outDir, files: stats.files, bytes: stats.bytes, version: meta.version, builtAt: meta.builtAt, source: meta.source });
    return 0;
  }
  const relPath = path.relative(ctx.cwd, outDir);
  const rel = !relPath ? "." : relPath.startsWith("..") ? outDir : relPath;
  p.log.success(`Wrote the bundled registry (${describeSnapshot(meta)}) to ${rel}: ${plural(stats.files, "file")}, ${(stats.bytes / 1024 / 1024).toFixed(1)} MB.`);
  p.log.info(`Use it with ${pc.cyan(`--registry ${rel}`)}, ${pc.cyan(`VAMOS_REGISTRY=${rel}`)} or ${pc.cyan(`"registry": "${rel}"`)} in vamos.json. Hosted on a static server, point those at its URL.`);
  return 0;
}
