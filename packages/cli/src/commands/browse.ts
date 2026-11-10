import { bool, str, type ParsedArgs } from "../args";
import { readLock } from "../core/lockfile";
import { searchItems } from "../core/registry";
import { rewriteImports } from "../core/transform";
import { CliError, type RegistryIndexItem, type ItemType } from "../core/types";
import { out, p, pad, pc, printJson, unwrap, type Context } from "../ui";
import { installItems, openSession } from "./shared";

const TYPE_LABEL: Record<ItemType, string> = { component: "Components", block: "Blocks", lib: "Libraries", style: "Styles" };
const TYPES = Object.keys(TYPE_LABEL) as ItemType[];

async function installedNames(ctx: Context): Promise<Set<string>> {
  try {
    const s = await openSession(ctx, { config: "optional" });
    if (!s.hasConfig) return new Set();
    const lock = await readLock(s.root, s.config.uiDir, s.registry.location);
    return new Set(Object.keys(lock.items));
  } catch {
    return new Set();
  }
}

function printItems(items: RegistryIndexItem[], installed: Set<string>, opts: { grouped: boolean }): void {
  const width = Math.min(28, Math.max(...items.map((i) => i.name.length), 4) + 2);
  const line = (i: RegistryIndexItem) => {
    const mark = installed.has(i.name) ? pc.green("●") : pc.dim("·");
    const desc = i.description.length > 90 ? i.description.slice(0, 87) + "…" : i.description;
    return `  ${mark} ${pad(i.name, width)}${pc.dim(desc)}`;
  };
  if (!opts.grouped) {
    items.forEach((i) => out(line(i)));
    return;
  }
  for (const type of TYPES) {
    const ofType = items.filter((i) => i.type === type);
    if (!ofType.length) continue;
    out(`\n${pc.bold(TYPE_LABEL[type])} ${pc.dim(`(${ofType.length})`)}`);
    const key = (i: RegistryIndexItem) => (type === "component" ? i.group : type === "block" ? i.category : undefined) ?? "";
    const groups = [...new Set(ofType.map(key))];
    for (const g of groups) {
      if (g) out(pc.dim(`  ${g}`));
      ofType.filter((i) => key(i) === g).forEach((i) => out(line(i)));
    }
  }
}

export async function list(ctx: Context, args: ParsedArgs): Promise<number> {
  const { registry } = await openSession(ctx, { config: "optional" });
  const index = await registry.index();
  const type = str(args.flags, "type");
  if (type && !TYPES.includes(type as ItemType)) throw new CliError(`Unknown type "${type}". Use one of: ${TYPES.join(", ")}.`);
  const group = str(args.flags, "group");
  const category = str(args.flags, "category");
  const tag = str(args.flags, "tag");
  const items = index.items.filter(
    (i) =>
      (!type || i.type === type) &&
      (!group || i.group?.toLowerCase() === group.toLowerCase()) &&
      (!category || i.category?.toLowerCase() === category.toLowerCase()) &&
      (!tag || i.tags?.includes(tag)),
  );
  if (ctx.json) {
    printJson(items);
    return 0;
  }
  if (!items.length) {
    out(pc.dim("No items match."));
    return 0;
  }
  const installed = await installedNames(ctx);
  printItems(items, installed, { grouped: true });
  out(`\n${pc.dim(`${items.length} of ${index.items.length} items · ${pc.green("●")} installed · vamos-ui view <name> for details`)}`);
  return 0;
}

export async function search(ctx: Context, args: ParsedArgs): Promise<number> {
  const query = args.positionals.join(" ").trim();
  if (!query) throw new CliError("Usage: vamos-ui search <query>");
  const { registry } = await openSession(ctx, { config: "optional" });
  const index = await registry.index();
  const type = str(args.flags, "type");
  const hits = searchItems(index.items, query).filter((i) => !type || i.type === type);
  if (ctx.json) {
    printJson(hits);
    return 0;
  }
  if (!hits.length) {
    out(pc.dim(`Nothing matches "${query}". Try a broader word, or vamos-ui list.`));
    return 0;
  }
  const installed = await installedNames(ctx);
  out(pc.dim(`${hits.length} result${hits.length === 1 ? "" : "s"} for "${query}"`));
  const shown = hits.slice(0, 25);
  const width = Math.min(28, Math.max(...shown.map((i) => i.name.length)) + 2);
  for (const i of shown) {
    const mark = installed.has(i.name) ? pc.green("●") : pc.dim("·");
    out(`  ${mark} ${pad(i.name, width)}${pc.dim(pad(i.type, 10))}${i.title}${pc.dim(" — " + i.description.slice(0, 70))}`);
  }
  if (hits.length > shown.length) out(pc.dim(`  … ${hits.length - shown.length} more (use --json for all)`));
  return 0;
}

export async function view(ctx: Context, args: ParsedArgs): Promise<number> {
  const name = args.positionals[0];
  if (!name) throw new CliError("Usage: vamos-ui view <name>");
  const { registry, config, hasConfig } = await openSession(ctx, { config: "optional" });
  const item = await registry.item(name);
  // In a project with vamos.json the snippet should import from the project alias, as installed files do.
  const usage = item.usage && hasConfig ? rewriteImports(item.usage, config.importAlias) : item.usage;
  const showFiles = bool(args.flags, "files");
  if (ctx.json) {
    printJson(showFiles ? item : { ...item, files: item.files.map((f) => ({ path: f.path, lines: f.content.split("\n").length })) });
    return 0;
  }
  out(`${pc.bold(item.title)} ${pc.dim(`${item.name} · ${item.type}${item.group ? ` · ${item.group}` : ""}${item.category ? ` · ${item.category}` : ""}`)}`);
  out(item.description);
  out(pc.dim(item.docs));
  const section = (title: string, body: string[]) => {
    if (!body.length) return;
    out(`\n${pc.bold(title)}`);
    body.forEach((b) => out(`  ${b}`));
  };
  section("Usage", usage ? usage.trim().split("\n") : []);
  section("When to use", item.guidance?.whenToUse.map((s) => `· ${s}`) ?? []);
  section("Avoid when", item.guidance?.avoidWhen.map((s) => `· ${s}`) ?? []);
  section("Accessibility", item.guidance?.a11y?.map((s) => `· ${s}`) ?? []);
  section("Related", item.guidance?.related.length ? [item.guidance.related.join(", ")] : []);
  for (const table of item.props ?? []) {
    const w = Math.min(24, Math.max(...table.props.map((r) => r.name.length), 4) + 2);
    section(
      `${table.component} props`,
      table.props.map((r) => `${pad(r.name, w)}${pc.cyan(r.type)}${r.default ? pc.dim(` = ${r.default}`) : ""}${r.description ? pc.dim(`  ${r.description}`) : ""}`),
    );
  }
  section("Examples", (item.examples ?? []).map((e) => `· ${e.title}${e.description ? pc.dim(` — ${e.description}`) : ""}`));
  section("Depends on", [
    ...(item.registryDependencies.length ? [`items: ${item.registryDependencies.join(", ")}`] : []),
    ...(item.dependencies.length ? [`npm:   ${item.dependencies.join(" ")}`] : []),
  ]);
  section("Files", item.files.map((f) => `${f.path} ${pc.dim(`(${f.content.split("\n").length} lines)`)}`));
  if (showFiles) {
    for (const f of item.files) {
      out(`\n${pc.bold(pc.underline(f.path))}`);
      out(f.content);
    }
  }
  out(`\n${pc.dim("Install:")} ${pc.cyan(`npx vamos-ui add ${item.name}`)}`);
  return 0;
}

export async function add(ctx: Context, args: ParsedArgs): Promise<number> {
  const session = await openSession(ctx, { config: "required" });
  let names = args.positionals;
  if (!names.length) {
    if (!ctx.interactive) throw new CliError("Usage: vamos-ui add <names...>", "Run `vamos-ui list` to see what is available.");
    const index = await session.registry.index();
    names = unwrap(
      await p.autocompleteMultiselect({
        message: "Which items?",
        options: index.items.filter((i) => i.type !== "lib").map((i) => ({ value: i.name, label: i.name, hint: i.type === "block" ? "block" : i.group })),
        required: true,
      }),
    ) as string[];
  }
  if (!ctx.json) p.intro(pc.bold(`vamos-ui add ${names.join(" ")}`));
  const res = await installItems(ctx, session, names, {
    overwrite: bool(args.flags, "overwrite"),
    dryRun: bool(args.flags, "dry-run"),
    install: bool(args.flags, "install", true),
  });
  if (!res) return 1;
  if (!bool(args.flags, "dry-run")) {
    const conflicts = res.plan.files.filter((f) => f.action === "conflict").length;
    const alias = session.config.importAlias;
    const first = res.plan.items.find((i) => names.includes(i.name));
    const hint = first?.type === "block" ? `Blocks are in ${session.config.blocksDir}/${first.name}` : `import { … } from "${alias}"`;
    p.outro(`${res.written ? `Wrote ${res.written} file${res.written === 1 ? "" : "s"}` : "Already up to date"}${conflicts ? pc.yellow(`, kept ${conflicts} edited`) : ""}. ${pc.dim(hint)}`);
  } else p.outro("Done.");
  return 0;
}
