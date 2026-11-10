import path from "node:path";
import { DEFAULT_CONFIG, findProjectRoot, readConfig, requireConfig } from "../core/config";
import { applyPlan, planInstall, type InstallPlan } from "../core/install";
import { readLock, writeLock, type Lockfile } from "../core/lockfile";
import { missingDependencies, runInstall, installCommand } from "../core/pm";
import { detectProject } from "../core/project";
import { loadBarrels, Registry, resolveRegistryLocation } from "../core/registry";
import { resolveItems } from "../core/resolve";
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
    const [res, index] = await Promise.all([resolveItems(names, (n) => registry.item(n)), registry.index()]);
    items = res.items;
    version = index.version;
    lock = await readLock(root, config.uiDir, registry.location);
    const extra = items.length - res.requested.length;
    spin?.stop(`Resolved ${plural(res.requested.length, "item")}${extra > 0 ? ` + ${plural(extra, "dependency", "dependencies")}` : ""}`);
    for (const c of res.cycles) p.log.warn(`Dependency cycle ignored: ${c.join(" → ")}`);
  } catch (err) {
    spin?.error("Could not resolve items");
    throw err;
  }

  const plan = await planInstall(root, config, items, lock, { overwrite: opts.overwrite });
  describePlan(plan);
  const deps = missingDependencies(root, plan.dependencies);
  const project = detectProject(root);
  if (deps.length) {
    const [cmd, args] = installCommand(project.packageManager, deps);
    p.log.info(`npm packages: ${deps.map((d) => pc.cyan(d)).join(" ")}\n${pc.dim(opts.install ? `will run: ${cmd} ${args.join(" ")}` : `skipped (--no-install). Run: ${cmd} ${args.join(" ")}`)}`);
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

  if (deps.length && opts.install) {
    const s = spinner();
    s.start(`Installing ${plural(deps.length, "package")} with ${project.packageManager}`);
    try {
      await runInstall(root, project.packageManager, deps);
      s.stop(`Installed ${plural(deps.length, "package")}`);
    } catch (err) {
      s.error("Package install failed");
      throw err;
    }
  }
  return { plan, written: result.written.length };
}

export function relFrom(root: string, abs: string): string {
  return path.relative(root, abs).split(path.sep).join("/");
}

export { out };
