import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createTwoFilesPatch } from "diff";
import { bool, type ParsedArgs } from "../args";
import { refreshIndexes } from "../core/indexes";
import { ownedFiles, readLock, sha256, writeLock, type Lockfile } from "../core/lockfile";
import { loadBarrels } from "../core/registry";
import { targetPath, transformFile } from "../core/transform";
import { CliError, itemKey, type RegistryItem } from "../core/types";
import { colorDiff, out, p, pc, plural, printJson, unwrap, type Context } from "../ui";
import { fetchSpec, installItems, openSession, sourceOptions, type Session } from "./shared";
import { canonicalSpec } from "../core/sources";

export type FileStatus =
  | "up-to-date" // local == registry
  | "upstream" // local untouched since install, registry changed → safe to replace
  | "local" // local edited, registry unchanged since install
  | "both" // local edited and registry changed
  | "missing" // deleted locally
  | "new"; // registry ships a file the install doesn't have yet

export interface FileComparison {
  item: string;
  path: string;
  status: FileStatus;
  local: string | null;
  remote: string;
}

/** Classifies a file using the lock hash as the merge base. */
export function classify(local: string | null, remote: string, recorded: string | undefined): FileStatus {
  if (local === null) return recorded ? "missing" : "new";
  const l = sha256(local);
  const r = sha256(remote);
  if (l === r) return "up-to-date";
  if (!recorded) return "both";
  if (l === recorded) return "upstream";
  if (r === recorded) return "local";
  return "both";
}

async function compareItem(session: Session, lock: Lockfile, item: RegistryItem): Promise<FileComparison[]> {
  const recorded = lock.items[itemKey(item)]?.files ?? {};
  const rows: FileComparison[] = [];
  for (const file of item.files) {
    const rel = targetPath(item, file, session.config);
    const abs = path.join(session.root, rel);
    const local = existsSync(abs) ? await readFile(abs, "utf8") : null;
    const remote = transformFile(file.content, session.config);
    rows.push({ item: itemKey(item), path: rel, status: classify(local, remote, recorded[rel]), local, remote });
  }
  return rows;
}

function patch(row: FileComparison): string {
  return createTwoFilesPatch(`${row.path} (local)`, `${row.path} (registry)`, row.local ?? "", row.remote, undefined, undefined, { context: 3 });
}

const STATUS_LABEL: Record<FileStatus, string> = {
  "up-to-date": pc.dim("up to date"),
  upstream: pc.cyan("registry changed"),
  local: pc.yellow("edited locally"),
  both: pc.red("edited locally + registry changed"),
  missing: pc.red("deleted locally"),
  new: pc.green("new in registry"),
};

async function installedItems(ctx: Context, session: Session, lock: Lockfile, names: string[]): Promise<RegistryItem[]> {
  const targets = names.length ? names.map((n) => canonicalSpec(n, sourceOptions(session))) : Object.keys(lock.items);
  for (const n of targets) {
    if (!lock.items[n]) throw new CliError(`"${n}" is not installed.`, `Install it with \`vamos-ui add ${n}\`.`);
  }
  if (!targets.length) throw new CliError("Nothing is installed yet.", "Run `vamos-ui add <name>` first.");
  return Promise.all(targets.map((n) => fetchSpec(session, n)));
}

export async function diff(ctx: Context, args: ParsedArgs): Promise<number> {
  const session = await openSession(ctx, { config: "required" });
  const lock = await readLock(session.root, session.config.uiDir, session.registry.location);
  const items = await installedItems(ctx, session, lock, args.positionals);
  const rows = (await Promise.all(items.map((i) => compareItem(session, lock, i)))).flat();
  const changed = rows.filter((r) => r.status !== "up-to-date");
  if (ctx.json) {
    printJson(changed.map((r) => ({ item: r.item, path: r.path, status: r.status, patch: patch(r) })));
    return bool(args.flags, "check") && changed.length ? 1 : 0;
  }
  if (!changed.length) {
    out(`${pc.green("✔")} ${plural(rows.length, "file")} in ${plural(items.length, "item")} match the registry.`);
    return 0;
  }
  const summaryOnly = bool(args.flags, "summary");
  for (const r of changed) {
    out(`${pc.bold(r.path)}  ${pc.dim(r.item)}  ${STATUS_LABEL[r.status]}`);
    if (!summaryOnly) out(colorDiff(patch(r).replace(/^=+\n/, "")));
  }
  const upgradable = changed.filter((r) => r.status === "upstream" || r.status === "new").length;
  out(
    pc.dim(
      `${plural(changed.length, "file")} differ${changed.length === 1 ? "s" : ""}.` +
        (upgradable ? ` ${upgradable} can be upgraded safely with \`vamos-ui upgrade\`.` : ""),
    ),
  );
  return bool(args.flags, "check") ? 1 : 0;
}

export async function upgrade(ctx: Context, args: ParsedArgs): Promise<number> {
  const session = await openSession(ctx, { config: "required" });
  const lock = await readLock(session.root, session.config.uiDir, session.registry.location);
  const items = await installedItems(ctx, session, lock, args.positionals);
  const index = items.every((i) => i.source) ? ((await session.registry.index().catch(() => null)) ?? { version: "0.0.0" }) : await session.registry.index();
  const force = bool(args.flags, "overwrite") || bool(args.flags, "force");
  const dryRun = bool(args.flags, "dry-run");
  if (!ctx.json) p.intro(pc.bold("vamos-ui upgrade"));

  const counts = { replaced: 0, kept: 0, current: 0, restored: 0 };
  for (const item of items) {
    const rows = await compareItem(session, lock, item);
    const key = itemKey(item);
    const prev = lock.items[key]?.files ?? {};
    const files: Record<string, string> = {};
    for (const r of rows) {
      let write = false;
      if (r.status === "up-to-date") counts.current++;
      else if (r.status === "upstream" || r.status === "new") write = true;
      else if (r.status === "missing") {
        write = force || (await askRestore(ctx, r));
        if (write) counts.restored++;
      } else if (r.status === "local") {
        counts.kept++; // registry has nothing new for this file
      } else {
        // edited locally and changed upstream: show the diff and ask
        out(`\n${pc.bold(r.path)}  ${STATUS_LABEL[r.status]}`);
        out(colorDiff(patch(r).replace(/^=+\n/, "")));
        write = force || (await askOverwrite(ctx, r));
        if (!write) counts.kept++;
      }
      if (write && !dryRun) {
        const abs = path.join(session.root, r.path);
        await mkdir(path.dirname(abs), { recursive: true });
        await writeFile(abs, r.remote);
      }
      if (write && r.status !== "missing") counts.replaced++;
      // The lock tracks what the registry last gave us; kept files keep their old base.
      files[r.path] = write || r.status === "up-to-date" ? sha256(r.remote) : (prev[r.path] ?? sha256(r.remote));
      if (write) p.log.step(`${dryRun ? "would update" : "updated"} ${r.path}`);
    }
    for (const gone of Object.keys(prev).filter((f) => !(f in files))) {
      p.log.warn(`${gone} is no longer part of ${key}; left in place.`);
    }
    if (!dryRun) lock.items[key] = { ...lock.items[key]!, version: item.source ? lock.items[key]!.version : index.version, files };
  }
  if (!dryRun) {
    await writeLock(session.root, session.config.uiDir, lock);
    await refreshIndexes(session.root, session.config.uiDir, { barrels: await loadBarrels(session.registry), owned: ownedFiles(lock) });
  }

  // Items may have gained dependencies since they were installed.
  const missingDeps = [...new Set(items.flatMap((i) => i.registryDependencies).map((d) => canonicalSpec(d, sourceOptions(session))))].filter((d) => !lock.items[d]);
  if (missingDeps.length) {
    p.log.info(`New dependencies: ${missingDeps.join(", ")}`);
    await installItems(ctx, session, missingDeps, { overwrite: false, dryRun, install: bool(args.flags, "install", true) });
  }

  if (ctx.json) printJson({ ...counts, dryRun });
  else
    p.outro(
      [
        counts.replaced && `${plural(counts.replaced, "file")} ${dryRun ? "to update" : "updated"}`,
        counts.restored && `${counts.restored} restored`,
        counts.kept && pc.yellow(`${counts.kept} kept (edited locally)`),
        counts.current && pc.dim(`${counts.current} already current`),
      ]
        .filter(Boolean)
        .join(", ") || "Nothing to upgrade.",
    );
  return 0;
}

async function askOverwrite(ctx: Context, r: FileComparison): Promise<boolean> {
  if (!ctx.interactive) {
    p.log.warn(`Kept your version of ${r.path}. Re-run with --overwrite to take the registry version.`);
    return false;
  }
  const choice = unwrap(
    await p.select({
      message: `${r.path} was edited locally. What should happen?`,
      initialValue: "keep",
      options: [
        { value: "keep", label: "Keep my version", hint: "review the diff above and merge by hand" },
        { value: "overwrite", label: "Take the registry version", hint: "your edits are lost" },
      ],
    }),
  );
  return choice === "overwrite";
}

async function askRestore(ctx: Context, r: FileComparison): Promise<boolean> {
  if (!ctx.interactive) {
    p.log.warn(`${r.path} was deleted locally; not restored (use --overwrite).`);
    return false;
  }
  return unwrap(await p.confirm({ message: `${r.path} was deleted locally. Restore it?`, initialValue: false }));
}
