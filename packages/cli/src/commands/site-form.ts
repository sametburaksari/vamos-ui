import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { findProjectRoot } from "../core/config";
import { detectProject } from "../core/project";
import { CliError } from "../core/types";
import { PROJECT_FILE } from "../project";
import { formSender, type SenderKind } from "../project/forms";
import { SITE_FILE } from "../site-info";
import { p, pc, plural, printJson, type Context } from "../ui";

const KINDS: SenderKind[] = ["php-mail", "resend", "smtp"];

function readJson(file: string): Record<string, any> | null {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** True when next.config sets output: "export" (a static export, no server actions). */
function staticExport(root: string): boolean {
  for (const name of ["next.config.ts", "next.config.mjs", "next.config.js"]) {
    const file = path.join(root, name);
    if (existsSync(file) && /output\s*:\s*["']export["']/.test(readFileSync(file, "utf8"))) return true;
  }
  return false;
}

/**
 * `site form`: writes the contact-form sender. Kind: --kind, else the plan in vamos.project.json,
 * else php-mail for static exports and smtp for a Next.js server. Never replaces a file.
 */
export async function siteForm(ctx: Context, args: ParsedArgs): Promise<number> {
  const root = findProjectRoot(ctx.cwd);
  const project = detectProject(root);
  const site = readJson(path.join(root, SITE_FILE));
  const plan = readJson(path.join(root, PROJECT_FILE));
  const planned = plan?.plan?.forms?.value as string | undefined;
  const isStatic = project.framework !== "next" || staticExport(root);
  let kind = str(args.flags, "kind") as SenderKind | undefined;
  let why = "--kind";
  if (kind && !KINDS.includes(kind)) throw new CliError(`--kind must be one of ${KINDS.join(", ")}, got "${kind}".`);
  if (!kind && planned && KINDS.includes(planned as SenderKind)) [kind, why] = [planned as SenderKind, PROJECT_FILE];
  if (!kind) [kind, why] = isStatic ? ["php-mail", "static site"] : ["smtp", "Next.js server"];
  if (kind !== "php-mail" && isStatic) {
    throw new CliError(`${kind} needs a server (Next.js server actions), but this is a static ${project.framework === "next" ? "export" : "site"}. Use --kind php-mail on shared hosting.`);
  }
  const lang = (str(args.flags, "lang") ?? (String(site?.locale ?? "").startsWith("en") ? "en" : "tr")) as "tr" | "en";
  if (lang !== "tr" && lang !== "en") throw new CliError(`--lang must be tr or en.`);
  const booking = bool(args.flags, "booking") || plan?.answers?.booking_tool === "form";
  let result;
  try {
    result = formSender({
      kind,
      siteName: site?.name || plan?.answers?.business_name || undefined,
      to: str(args.flags, "to") ?? (site?.contact?.email || plan?.answers?.email || undefined),
      from: str(args.flags, "from"),
      lang,
      booking,
      appDir: project.srcDir ? "src/app" : "app",
      publicDir: "public",
      fieldsFile: project.framework === "next" ? `${project.srcDir ? "src/app" : "app"}/contact-fields.ts` : undefined,
    });
  } catch (error) {
    throw new CliError((error as Error).message);
  }

  const dryRun = bool(args.flags, "dry-run");
  const written: string[] = [];
  const kept: string[] = [];
  for (const [rel, content] of Object.entries(result.files)) {
    const abs = path.join(root, rel);
    if (existsSync(abs)) {
      kept.push(rel);
      continue;
    }
    if (!dryRun) {
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, content);
    }
    written.push(rel);
  }
  if (ctx.json) {
    printJson({ kind, reason: why, written: dryRun ? [] : written, planned: written, kept, env: result.env, dependencies: result.dependencies, action: result.action, notes: result.notes });
    return 0;
  }
  p.intro(pc.bold("vamos-ui site form"));
  p.log.info(`Sender: ${pc.cyan(kind)} ${pc.dim(`(${why})`)}`);
  p.note(
    [...written.map((f) => `${dryRun ? pc.dim("+") : pc.green("+")} ${f}`), ...kept.map((f) => `${pc.dim("=")} ${f} ${pc.dim("kept, already there")}`)].join("\n"),
    dryRun ? "Form sender (dry run)" : "Form sender",
  );
  if (Object.keys(result.env).length) p.log.info(`Environment:\n${Object.entries(result.env).map(([k, v]) => `  ${k}=${v}`).join("\n")}`);
  if (result.dependencies.length) p.log.info(`Install: ${pc.cyan(`${project.packageManager} add ${result.dependencies.join(" ")}`)}`);
  for (const note of result.notes) p.log.message(note);
  p.outro(dryRun ? "Dry run: nothing was written." : written.length ? `Wrote ${plural(written.length, "file")}.` : "Nothing to write.");
  return 0;
}
