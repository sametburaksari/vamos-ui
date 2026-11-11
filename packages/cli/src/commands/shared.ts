import path from "node:path";
import { DEFAULT_CONFIG, findProjectRoot, readConfig, requireConfig } from "../core/config";
import { applyPlan, planInstall, type InstallPlan } from "../core/install";
import { readLock, writeLock, type Lockfile } from "../core/lockfile";
import { missingDependencies, runInstall, installCommand } from "../core/pm";
import { detectProject } from "../core/project";
import { loadBarrels, Registry, resolveRegistryLocation } from "../core/registry";
import { parseSpec, resolveItems } from "../core/resolve";
import { canonicalSpec, fetchExternalItem, parseItemSpec, type SourceOptions } from "../core/sources";
import type { RegistryItem, VamosConfig } from "../core/types";
import { confirm, out, p, pad, pc, plural, spinner, symbols, type Context } from "../ui";

export interface Session {
  root: string;
  config: VamosConfig;
  registry: Registry;
}

export async function openSession(ctx: Context, opts: { config: "required" | "optional" }): Promise<Session & { hasConfig: boolean }> {
  const root = findProjectRoot(ctx.cwd);
  const found = opts.config === "required" ? await requireConfig(root) : await readConfig(root);
  const config = found ?? DEFAULT_CONFIG;
  const location = resolveRegistryLocation({ flag: ctx.registryFlag, config: found?.registry, cwd: root, env: ctx.env });
  return { root, config, registry: new Registry(location), hasConfig: !!found };
}

export function sourceOptions(session: Pick<Session, "root" | "config">): SourceOptions {
  return { registries: session.config.registries, root: session.root };
}

/** Fetches an item by plain name (the project's registry) or by any open-registry spec. */
export function fetchSpec(session: Session, spec: string): Promise<RegistryItem> {
  const opts = sourceOptions(session);
  const source = parseItemSpec(spec, opts);
  return source ? fetchExternalItem(source, opts) : session.registry.item(spec);
}

/** Says where third-party items come from, before anything is written. */
export function describeSources(items: RegistryItem[]): void {
  const byHost = new Map<string, string[]>();
  for (const i of items) if (i.source) byHost.set(i.source.host, [...(byHost.get(i.source.host) ?? []), i.key ?? i.name]);
  for (const [host, keys] of byHost) {
    p.log.warn(`Third-party source ${pc.bold(host)}: ${keys.join(", ")}\n${pc.dim("Not published by Vamos UI. Review the files below; nothing from the item is executed, and its npm packages install without lifecycle scripts.")}`);
  }
}

export function describePlan(plan: InstallPlan): void {
  const groups = {
    create: plan.files.filter((f) => f.action === "create"),
    update: plan.files.filter((f) => f.action === "update"),
    conflict: plan.files.filter((f) => f.action === "conflict"),
    identical: plan.files.filter((f) => f.action === "identical"),
  };
  const width = Math.min(72, Math.max(0, ...plan.files.map((f) => f.path.length)) + 2);
  const lines: string[] = [];
  for (const f of [...groups.create, ...groups.update, ...groups.conflict]) {
    const sym = symbols[f.action];
    const note = f.action === "conflict" ? pc.red("edited locally, kept") : f.action === "update" ? pc.yellow("update") : "";
    lines.push(`${sym} ${pad(f.path, width)}${pc.dim(f.item)}${note ? "  " + note : ""}`);
  }
  if (groups.identical.length) lines.push(pc.dim(`${symbols.identical} ${plural(groups.identical.length, "file")} already up to date`));
  if (!lines.length) lines.push(pc.dim("Nothing to write."));
  const names = plan.items.map((i) => i.name);
  p.note(lines.join("\n"), `Files (${names.length > 5 ? `${names.slice(0, 5).join(", ")} +${names.length - 5}` : names.join(", ")})`);
  if (groups.conflict.length) {
    p.log.warn(`${plural(groups.conflict.length, "file")} differ from the registry and will be kept. Re-run with --overwrite to replace, or use \`vamos-ui diff\`.`);
  }
}

export interface InstallOptions {
  overwrite: boolean;
  dryRun: boolean;
  install: boolean;
}

/** Resolve → plan → confirm → write → npm install. Shared by init, add and upgrade. */
export async function installItems(ctx: Context, session: Session, names: string[], opts: InstallOptions): Promise<{ plan: InstallPlan; written: number } | null> {
  const { root, config, registry } = session;
  const spin = ctx.json ? null : spinner();
  spin?.start(`Resolving ${names.join(", ")}`);
  let items: RegistryItem[];
  let version: string;
  let lock: Lockfile;
  try {
    const opts = sourceOptions(session);
    const allExternal = names.every((n) => parseItemSpec(n, opts));
    const [res, index] = await Promise.all([
      resolveItems(names, (n) => fetchSpec(session, n), (n) => canonicalSpec(n, opts)),
      allExternal ? registry.index().catch(() => null) : registry.index(),
    ]);
    items = res.items;
    version = index?.version ?? "0.0.0";
    lock = await readLock(root, config.uiDir, registry.location);
    const extra = items.length - res.requested.length;
    spin?.stop(`Resolved ${plural(res.requested.length, "item")}${extra > 0 ? ` + ${plural(extra, "dependency", "dependencies")}` : ""}`);
    for (const c of res.cycles) p.log.warn(`Dependency cycle ignored: ${c.join(" → ")}`);
  } catch (err) {
    spin?.error("Could not resolve items");
    throw err;
  }

  describeSources(items);
  const plan = await planInstall(root, config, items, lock, { overwrite: opts.overwrite });
  describePlan(plan);
  const deps = missingDependencies(root, plan.dependencies);
  // npm packages that only third-party items ask for install with lifecycle scripts disabled.
  const kitPackages = new Set(items.filter((i) => !i.source).flatMap((i) => i.dependencies.map((d) => parseSpec(d).name)));
  const trusted = deps.filter((d) => kitPackages.has(parseSpec(d).name));
  const untrusted = deps.filter((d) => !kitPackages.has(parseSpec(d).name));
  const project = detectProject(root);
  const batches: { specs: string[]; ignoreScripts: boolean }[] = [
    { specs: trusted, ignoreScripts: false },
    { specs: untrusted, ignoreScripts: true },
  ].filter((b) => b.specs.length);
  for (const b of batches) {
    const [cmd, args] = installCommand(project.packageManager, b.specs, { ignoreScripts: b.ignoreScripts });
    p.log.info(`npm packages${b.ignoreScripts ? " (third-party)" : ""}: ${b.specs.map((d) => pc.cyan(d)).join(" ")}\n${pc.dim(opts.install ? `will run: ${cmd} ${args.join(" ")}` : `skipped (--no-install). Run: ${cmd} ${args.join(" ")}`)}`);
  }

  if (opts.dryRun) {
    p.log.info(pc.dim("Dry run: nothing was written."));
    return { plan, written: 0 };
  }
  const toWrite = plan.files.filter((f) => f.action === "create" || f.action === "update").length;
  if (toWrite > 0 && !(await confirm(ctx, `Write ${plural(toWrite, "file")}?`))) {
    p.log.warn("Nothing written.");
    return null;
  }

  const result = await applyPlan(root, config, plan, lock, version, await loadBarrels(registry));
  await writeLock(root, config.uiDir, lock);
  if (result.indexes.written.length) p.log.step(`Updated ${result.indexes.written.map((f) => pc.dim(f)).join(", ")}`);
  for (const kept of result.indexes.kept) p.log.warn(`${kept} has no vamos-ui header, so it was not regenerated.`);
  if (result.css?.result === "added" || result.css?.result === "created") {
    p.log.step(`${result.css.result === "created" ? "Created" : "Updated"} ${config.css} with the Vamos UI styles import`);
    if (!result.css.afterTailwind) p.log.warn(`${config.css} has no @import "tailwindcss"; add it above the Vamos UI import.`);
  }

  if (opts.install) {
    for (const b of batches) {
      const s = spinner();
      s.start(`Installing ${plural(b.specs.length, "package")} with ${project.packageManager}`);
      try {
        await runInstall(root, project.packageManager, b.specs, { ignoreScripts: b.ignoreScripts });
        s.stop(`Installed ${plural(b.specs.length, "package")}`);
      } catch (err) {
        s.error("Package install failed");
        throw err;
      }
    }
  }
  return { plan, written: result.written.length };
}

export function relFrom(root: string, abs: string): string {
  return path.relative(root, abs).split(path.sep).join("/");
}

export { out };
