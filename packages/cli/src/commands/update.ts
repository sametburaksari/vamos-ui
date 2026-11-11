import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createTwoFilesPatch } from "diff";
import { bool, type ParsedArgs } from "../args";
import { FIX_MAPPINGS, fixSource, type FixChange } from "../brand/fix";
import { readConfig, findProjectRoot } from "../core/config";
import { verifySource, type VerifyIssue } from "../verify";
import { colorDiff, out, p, pad, pc, plural, printJson, type Context } from "../ui";
import { applyBrand, loadBrand, projectBrandIssues } from "./brand";
import { projectFiles } from "./verify";

/** Base colour of each kit accent preset, used to map palette families when there is no brand. */
const PRESET_ACCENTS: Record<string, string> = {
  lime: "oklch(0.89 0.21 122)",
  ocean: "oklch(0.55 0.17 245)",
  ember: "oklch(0.7 0.19 45)",
  rose: "oklch(0.58 0.21 10)",
};

export interface UpdateFileResult {
  file: string;
  changes: FixChange[];
  /** Issues verify still reports after the fixes. */
  remaining: VerifyIssue[];
  before: string;
  after: string;
}

export interface UpdateReport {
  files: number;
  changed: UpdateFileResult[];
  remaining: { file: string; issues: VerifyIssue[] }[];
  brand: { present: boolean; stale: boolean; regenerated: boolean; cssFile: string | null };
  mappings: { from: string; to: string; count: number }[];
}

export const UPDATE_HELP = `${pc.bold("vamos-ui update [paths...]")}  Bring the project in line with the brand and the design rules.

Runs verify and reports what can be fixed automatically. With ${pc.cyan("--fix")} it applies the safe fixes:

${FIX_MAPPINGS.map((m) => `  ${pad(m.from, 44)} ${pc.dim("→")} ${m.to}`).join("\n")}

It also regenerates brand.css when vamos.brand.json changed. Everything else is listed as a manual item.

${pc.bold("Options")}
  --fix        Apply the fixes
  --dry-run    Show the diff of what --fix would change, write nothing
  --json       Machine-readable report
  --quiet      Only list errors among the remaining items

${pc.dim("To update installed components from the registry, use `vamos-ui upgrade`.")}`;

export async function update(ctx: Context, args: ParsedArgs): Promise<number> {
  if (bool(args.flags, "help")) {
    out(UPDATE_HELP);
    return 0;
  }
  const fix = bool(args.flags, "fix");
  const dryRun = bool(args.flags, "dry-run");
  const write = fix && !dryRun;
  const root = findProjectRoot(ctx.cwd);
  const config = await readConfig(root).catch(() => null);
  const loaded = await loadBrand(root).catch(() => null);
  const brand = loaded?.brand ?? null;

  // 1. Brand stylesheet.
  const brandStatus: UpdateReport["brand"] = { present: !!brand, stale: false, regenerated: false, cssFile: null };
  if (brand && config && !loaded!.issues.some((i) => i.severity === "error")) {
    const status = await projectBrandIssues(root, config, brand);
    brandStatus.stale = status.stale;
    brandStatus.cssFile = status.cssFile;
    if (status.stale && (fix || dryRun)) {
      const res = await applyBrand(root, config, brand, { dryRun: !write });
      brandStatus.regenerated = write && res.cssChanged;
      if (dryRun && res.cssChanged && !ctx.json) out(colorDiff(createTwoFilesPatch(res.cssFile, res.cssFile, res.previousCss ?? "", res.css, "", "", { context: 2 })));
    }
  }

  // 2. Source files.
  const files = projectFiles(ctx, root, args.positionals, config?.uiDir ?? null, "update");
  const accent = brand?.colors.accent ?? PRESET_ACCENTS[config?.theme?.accent ?? "lime"];
  const results: UpdateFileResult[] = [];
  const remaining: UpdateReport["remaining"] = [];
  const rel = (abs: string) => path.relative(root, abs).split(path.sep).join("/");
  for (const abs of files) {
    const file = rel(abs);
    const before = readFileSync(abs, "utf8");
    const { code: after, changes } = fixSource(before, file, { accent, fonts: brand?.fonts });
    const left = verifySource(after, file);
    if (changes.length) results.push({ file, changes, remaining: left, before, after });
    if (left.length) remaining.push({ file, issues: left });
  }
  if (write) for (const r of results) await writeFile(path.join(root, r.file), r.after);

  const counts = new Map<string, number>();
  for (const r of results) for (const c of r.changes) counts.set(`${c.from}\u0000${c.to}`, (counts.get(`${c.from}\u0000${c.to}`) ?? 0) + 1);
  const mappings = [...counts].map(([k, count]) => {
    const [from, to] = k.split("\u0000") as [string, string];
    return { from, to, count };
  }).sort((a, b) => b.count - a.count || a.from.localeCompare(b.from));
  const report: UpdateReport = { files: files.length, changed: results, remaining, brand: brandStatus, mappings };
  const errorsLeft = remaining.reduce((n, r) => n + r.issues.filter((i) => i.severity === "error").length, 0);
  const warningsLeft = remaining.reduce((n, r) => n + r.issues.filter((i) => i.severity === "warning").length, 0);

  if (ctx.json) {
    printJson({
      fix,
      dryRun,
      files: report.files,
      changed: results.map((r) => ({ file: r.file, changes: r.changes })),
      mappings,
      remaining,
      brand: brandStatus,
      errors: errorsLeft,
      warnings: warningsLeft,
    });
    return errorsLeft ? 1 : 0;
  }

  // 3. Report.
  if (brandStatus.regenerated) p.log.step(`Regenerated ${brandStatus.cssFile} from vamos.brand.json`);
  else if (brandStatus.stale && !fix && !dryRun) p.log.warn(`${brandStatus.cssFile ?? "brand.css"} is out of date with vamos.brand.json (fixed by --fix).`);
  if (!brand) p.log.message(pc.dim(`No vamos.brand.json: accent colours are matched to the "${config?.theme?.accent ?? "lime"}" accent.`));

  if (dryRun) for (const r of results) out(colorDiff(createTwoFilesPatch(r.file, r.file, r.before, r.after, "", "", { context: 1 })));

  const changeCount = results.reduce((n, r) => n + r.changes.length, 0);
  if (results.length) {
    const verb = write ? "Fixed" : fix ? "Would fix" : "Can fix";
    const lines = results.map((r) => `${write ? pc.green("~") : pc.yellow("~")} ${pad(r.file, 44)} ${pc.dim(plural(r.changes.length, "change"))}`);
    p.note(lines.join("\n"), `${verb} ${plural(changeCount, "issue")} in ${plural(results.length, "file")}`);
    const clip = (t: string) => (t.length > 30 ? `${t.slice(0, 29)}…` : t);
    const table = mappings.slice(0, 14).map((m) => `${pad(clip(m.from), 30)} ${pc.dim("→")} ${m.to || pc.dim("(removed)")}  ${pc.dim(`×${m.count}`)}`);
    if (mappings.length > 14) table.push(pc.dim(`… ${mappings.length - 14} more`));
    p.note(table.join("\n"), "Mappings");
  } else p.log.info(`Nothing to fix automatically in ${plural(files.length, "file")}.`);

  if (remaining.length) {
    const quiet = bool(args.flags, "quiet");
    const lines: string[] = [];
    let shown = 0;
    for (const r of remaining) {
      for (const i of r.issues) {
        if (quiet && i.severity !== "error") continue;
        if (shown++ >= 25) continue;
        const sev = i.severity === "error" ? pc.red("error  ") : pc.yellow("warning");
        lines.push(`${sev} ${pc.dim(`${r.file}:${i.line}`)}  ${i.message} ${pc.dim(i.rule)}`);
      }
    }
    if (shown > 25) lines.push(pc.dim(`… ${shown - 25} more (run vamos-ui verify for the full list)`));
    if (lines.length) p.note(lines.join("\n"), `Manual: ${[errorsLeft && plural(errorsLeft, "error"), warningsLeft && plural(warningsLeft, "warning")].filter(Boolean).join(", ")}`);
  }

  if (!fix && changeCount) out(`Run ${pc.cyan("npx vamos-ui update --fix")} to apply${dryRun ? "" : pc.dim(", or --dry-run to see the diff")}.`);
  else if (write && !errorsLeft) out(`${pc.green("✔")} Project is in line with the brand and the rules${warningsLeft ? pc.dim(` (${plural(warningsLeft, "warning")} left)`) : ""}.`);
  if (dryRun) p.log.info(pc.dim("Dry run: nothing was written."));
  return errorsLeft ? 1 : 0;
}
