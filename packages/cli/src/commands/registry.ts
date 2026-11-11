import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { buildThirdPartyRegistry, writeThirdPartyRegistry } from "../core/registry-build";
import { out, p, pc, plural, printJson, type Context } from "../ui";

const HELP = `${pc.bold("vamos-ui registry build")} [dir]  Build a registry others can install from

${pc.bold("Usage")}
  npx vamos-ui registry build [dir] [--out <dir>] [--homepage <url>] [--name <name>] [--dry-run] [--strict]

Reads components/*.tsx, lib/*.ts and blocks/<name>/ in [dir] (default: the current folder), plus an
optional registry.json for titles, descriptions and Vamos UI dependencies, and writes <name>.json and
index.json to --out (default: <dir>/r). Host the folder anywhere static; people install with
  npx vamos-ui add https://your.site/r/<item>.json
  npx vamos-ui add github:owner/repo/<item>
Guide: https://ui.vamos.ist/docs/publish-a-registry`;

export async function registry(ctx: Context, args: ParsedArgs): Promise<number> {
  const [sub, dirArg] = args.positionals;
  if (sub !== "build" || bool(args.flags, "help")) {
    out(HELP);
    return sub === undefined || sub === "build" || bool(args.flags, "help") ? 0 : 1;
  }
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
