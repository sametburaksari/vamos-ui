import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { findProjectRoot } from "../core/config";
import { CliError } from "../core/types";
import { HOSTS, PROJECT_FILE, deployGuide, type Hosting, type Lang } from "../project";
import { SITE_FILE } from "../site-info";
import { p, pc, plural, printJson, type Context } from "../ui";

function readJson(file: string): Record<string, any> | null {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/**
 * `site deploy`: the host's config files (one HTTPS address, security headers, cache rules) and
 * the publishing steps. Host: --host, else the plan in vamos.project.json. Never replaces a file
 * and never publishes anything itself.
 */
export async function siteDeploy(ctx: Context, args: ParsedArgs): Promise<number> {
  const root = findProjectRoot(ctx.cwd);
  const project = readJson(path.join(root, PROJECT_FILE));
  const site = readJson(path.join(root, SITE_FILE));
  const host = (str(args.flags, "host") ?? project?.plan?.hosting?.value) as Hosting | undefined;
  if (!host) throw new CliError("Which host?", `npx vamos-ui site deploy --host ${HOSTS.join("|")}  (or plan the site with npx vamos-ui new)`);
  if (!HOSTS.includes(host)) throw new CliError(`--host must be one of ${HOSTS.join(", ")}, got "${host}".`);
  const siteUrl = typeof site?.url === "string" ? site.url : "";
  const domain = str(args.flags, "domain") ?? project?.plan?.domain?.name ?? (siteUrl ? siteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : null);
  const www = bool(args.flags, "www") || /^www\./i.test(domain ?? "");
  const lang = (str(args.flags, "lang") ?? (String(site?.locale ?? "").startsWith("en") ? "en" : "tr")) as Lang;
  const guide = deployGuide({ host, domain, www, forms: project?.plan?.forms?.value, env: project?.plan?.forms?.env });

  const dryRun = bool(args.flags, "dry-run");
  const written: string[] = [];
  const kept: string[] = [];
  for (const [rel, content] of Object.entries(guide.files)) {
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
  const steps = guide.steps.map((s) => s[lang]);
  const checks = guide.checks.map((s) => s[lang]);
  if (ctx.json) {
    printJson({ host, domain, output: guide.output, written: dryRun ? [] : written, planned: written, kept, steps, checks, files: guide.files });
    return 0;
  }
  p.intro(pc.bold("vamos-ui site deploy"));
  p.log.info(`Host: ${pc.cyan(host)} (${guide.output})${domain ? `  ·  ${pc.cyan(domain)}` : pc.dim("  ·  no domain yet (--domain)")}`);
  const lines = [...written.map((f) => `${dryRun ? pc.dim("+") : pc.green("+")} ${f}`), ...kept.map((f) => `${pc.dim("=")} ${f} ${pc.dim("kept, already there; compare with --json")}`)];
  if (lines.length) p.note(lines.join("\n"), dryRun ? "Config (dry run)" : "Config");
  p.note(steps.map((s, i) => `${i + 1}. ${s}`).join("\n"), lang === "tr" ? "Yayın adımları" : "Steps");
  p.note(checks.map((s) => `- ${s}`).join("\n"), lang === "tr" ? "Yayından sonra" : "After the deploy");
  p.outro(dryRun ? "Dry run: nothing was written." : written.length ? `Wrote ${plural(written.length, "file")}. Nothing was published; that step is yours.` : "Nothing to write. Nothing was published.");
  return 0;
}
