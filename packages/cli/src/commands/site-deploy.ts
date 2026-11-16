import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { findProjectRoot } from "../core/config";
import { CliError } from "../core/types";
import { detectProject } from "../core/project";
import { HOSTS, PROJECT_FILE, deployGuide, formEnv, secretCommands, type DeployOptions, type Hosting, type Lang } from "../project";
import { projectSlug, publishIO, publishPlan, stepLine, type PackageManagerName, type PublishPlan } from "../project/publish";
import { SITE_FILE } from "../site-info";
import { confirm, p, pc, plural, printJson, type Context } from "../ui";
import { staticExport } from "./site-form";

function readJson(file: string): Record<string, any> | null {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** The host the site is served on: www.<domain> with --www, else the domain as given. */
function hostName(domain: string, www: boolean): string {
  const bare = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./i, "").toLowerCase();
  return www ? `www.${bare}` : bare;
}

/** The installed Next.js version, else the version range in package.json (without ^ / ~). */
export function nextVersion(root: string): string | null {
  const installed = readJson(path.join(root, "node_modules/next/package.json"))?.version;
  if (typeof installed === "string") return installed;
  const pkg = readJson(path.join(root, "package.json"));
  const range = pkg?.dependencies?.next ?? pkg?.devDependencies?.next;
  return typeof range === "string" ? range.replace(/^[\^~>=<\s]+/, "") || null : null;
}

/** The form sender found in the project when the plan does not say. */
function detectForms(root: string): DeployOptions["forms"] | undefined {
  if (existsSync(path.join(root, "functions/api/contact.ts")) || existsSync(path.join(root, "functions/api/contact.js"))) return "edge";
  if (existsSync(path.join(root, "public/contact.php"))) return "php-mail";
  for (const dir of ["app", "src/app"]) {
    const file = path.join(root, dir, "actions/contact.ts");
    if (existsSync(file)) return /nodemailer/.test(readFileSync(file, "utf8")) ? "smtp" : "resend";
  }
  return undefined;
}

/**
 * `site deploy`: the host's config files (one HTTPS address, security headers, cache rules) and
 * the publishing steps. Host: --host, else the plan in vamos.project.json. Never replaces a file.
 * With --publish (vercel, cloudflare, spacefast) it then shows exactly what will run, asks, checks
 * the host's CLI and login, and runs it. Without --publish nothing is published.
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
  const info = detectProject(root);
  const forms = (project?.plan?.forms?.value as DeployOptions["forms"]) ?? detectForms(root);
  const isStatic = staticExport(root);
  const version = nextVersion(root);
  const pkgName = readJson(path.join(root, "package.json"))?.name;
  const projectName = str(args.flags, "project") ?? projectSlug(typeof pkgName === "string" ? pkgName : path.basename(root));
  const space = str(args.flags, "space") ?? null;
  const guide = deployGuide({ host, domain, www, forms, env: project?.plan?.forms?.env, nextVersion: version, staticExport: isStatic, project: projectName, space });
  const publish = bool(args.flags, "publish");

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
  const checkCommand = `npx vamos-ui site check${domain ? ` https://${hostName(domain, www)}` : ""}`;
  const secretNames = (project?.plan?.forms?.env?.length ? (project.plan.forms.env as string[]) : formEnv(forms)).filter((e) => !e.includes("contact.php"));
  const secrets = secretCommands(host, secretNames, { project: projectName, space });
  let plan: PublishPlan | null = null;
  let planError: string | null = null;
  if (publish) {
    try {
      plan = publishPlan({ host, staticExport: isStatic, nextVersion: version, project: projectName, space, hasFunctions: existsSync(path.join(root, "functions")), packageManager: info.packageManager as PackageManagerName });
    } catch (error) {
      planError = (error as Error).message;
    }
  }
  if (ctx.json) {
    const publishInfo = publish ? (plan ? { target: plan.target, directory: plan.directory, commands: plan.steps.map(stepLine), notes: plan.notes } : { error: planError }) : undefined;
    printJson({ host, domain, output: guide.output, written: dryRun ? [] : written, planned: written, kept, steps, checks, files: guide.files, secretCommands: secrets, next: checkCommand, ...(publishInfo ? { publish: publishInfo } : {}) });
    if (!publish || dryRun) return 0;
    if (!plan) return 1;
    return runPublish(ctx, root, plan, lang);
  }
  p.intro(pc.bold("vamos-ui site deploy"));
  p.log.info(`Host: ${pc.cyan(host)} (${guide.output})${domain ? `  ·  ${pc.cyan(domain)}` : pc.dim("  ·  no domain yet (--domain)")}`);
  const lines = [...written.map((f) => `${dryRun ? pc.dim("+") : pc.green("+")} ${f}`), ...kept.map((f) => `${pc.dim("=")} ${f} ${pc.dim("kept, already there; compare with --json")}`)];
  if (lines.length) p.note(lines.join("\n"), dryRun ? "Config (dry run)" : "Config");
  p.note(steps.map((s, i) => `${i + 1}. ${s}`).join("\n"), lang === "tr" ? "Yayın adımları" : "Steps");
  p.note(checks.map((s) => `- ${s}`).join("\n"), lang === "tr" ? "Yayından sonra" : "After the deploy");
  p.log.step(
    lang === "tr"
      ? `Yayınladıktan sonra hepsini tek komutla kontrol edin (denetim + yönlendirmeler, başlıklar, 404, sitemap; eşiğin altında 1 ile çıkar): ${pc.cyan(checkCommand)}`
      : `Once it is live, check it all in one go (audit + redirects, headers, 404, sitemap; exits 1 below the bar): ${pc.cyan(checkCommand)}`,
  );
  if (!publish) {
    p.outro(dryRun ? "Dry run: nothing was written." : written.length ? `Wrote ${plural(written.length, "file")}. Nothing was published; that step is yours (or run again with --publish).` : "Nothing to write. Nothing was published.");
    return 0;
  }
  if (!plan) {
    p.log.error(planError ?? "Cannot publish.");
    p.outro("Nothing was published.");
    return 1;
  }
  if (dryRun) {
    showPlan(plan, lang);
    p.outro("Dry run: nothing was written or published.");
    return 0;
  }
  return runPublish(ctx, root, plan, lang);
}

function showPlan(plan: PublishPlan, lang: Lang): void {
  const tr = lang === "tr";
  p.note(
    [
      `${tr ? "Hosting" : "Host"}:      ${pc.cyan(plan.host)}`,
      `${tr ? "Hedef" : "Target"}:    ${plan.target}`,
      `${tr ? "Klasör" : "Directory"}: ${plan.directory}`,
      "",
      ...plan.steps.map((s, i) => `${i + 1}. ${pc.cyan(stepLine(s))}`),
      ...(plan.notes.length ? ["", ...plan.notes.map((n) => pc.dim(`- ${n}`))] : []),
    ].join("\n"),
    tr ? "Yayınlanacak" : "Will publish",
  );
}

/** Shows the plan, asks, checks the host CLI and login, then runs the steps. Never runs without a yes. */
async function runPublish(ctx: Context, root: string, plan: PublishPlan, lang: Lang): Promise<number> {
  const tr = lang === "tr";
  const say = (msg: string) => (ctx.json ? process.stderr.write(msg + "\n") : p.log.message(msg));
  if (!ctx.json) showPlan(plan, lang);
  if (!ctx.yes && !ctx.interactive) {
    say(tr ? "Yayınlanmadı: etkileşimsiz çalışmada onay için --yes verin." : "Not published: pass --yes to confirm in a non-interactive run.");
    return 1;
  }
  if (!(await confirm(ctx, tr ? `${plan.host} üzerinde yayınlansın mı?` : `Publish to ${plan.host} now?`, false))) {
    say(tr ? "Yayınlanmadı." : "Not published.");
    return 0;
  }
  const check = await publishIO.run(plan.check.command, plan.check.args, { cwd: root, capture: true });
  if (check.code === 127) {
    say(tr ? `${plan.check.command} bulunamadı. Kurun: ${plan.install ?? plan.check.command}` : `${plan.check.command} was not found. Install it: ${plan.install ?? plan.check.command}`);
    return 1;
  }
  if (check.code !== 0 || plan.check.loggedOut?.test(check.output)) {
    say(tr ? `${plan.host} hesabında oturum açık değil. Önce şunu çalıştırın: ${plan.login}` : `Not signed in to ${plan.host}. Run this first: ${plan.login}`);
    return 1;
  }
  for (const step of plan.steps) {
    say(pc.dim(`$ ${stepLine(step)}`));
    if (step.kind === "copy") {
      try {
        publishIO.copy(root, step.from, step.to);
      } catch (error) {
        say(`${stepLine(step)}: ${(error as Error).message}`);
        return 1;
      }
      continue;
    }
    const r = await publishIO.run(step.command, step.args, { cwd: root, stdout: ctx.json ? "stderr" : "inherit" });
    if (r.code !== 0) {
      say(tr ? `"${stepLine(step)}" ${r.code} koduyla bitti; yayın durdu.` : `"${stepLine(step)}" exited with ${r.code}; publishing stopped.`);
      return r.code === 127 ? 1 : r.code;
    }
  }
  if (!ctx.json) p.outro(tr ? "Yayınlandı. Şimdi site check ile canlı adresi kontrol edin." : "Published. Now check the live address with site check.");
  return 0;
}
