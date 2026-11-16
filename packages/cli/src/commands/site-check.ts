import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { AUDIT_DEFAULTS, normalizeAuditUrl, runAudit, runDeployChecks, siteCheckVerdict, siteCheckWorkflow, type DeployCheckStatus } from "../audit";
import { findProjectRoot } from "../core/config";
import { CliError } from "../core/types";
import { PROJECT_FILE, type Lang } from "../project";
import { SITE_FILE } from "../site-info";
import { out, p, pc, printJson, spinner, type Context } from "../ui";
import { formatAuditReport, int } from "./audit";

export const SITE_CHECK_HELP = `${pc.bold("vamos-ui site check")} [url]  After you publish: audit the live site and check the deploy took effect

  Runs the full audit (see ${pc.cyan("vamos-ui audit --help")}) plus the deploy checks:
    http → https     http://<host>/ answers 301 (or 308) to https://
    one host name    www.<domain> and <domain>: one serves, the other 301s to it
    headers          Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy
                     (X-Frame-Options, Permissions-Policy recommended)
    404              an unknown path answers 404, not 200 or a redirect home
    contact form     an empty POST to the form endpoint is refused (400/405/415/422), not 404
                     (functions/api/contact.ts → /api/contact, public/contact.php → /contact.php,
                     or --form-endpoint; nothing is sent)
    _headers         every header public/_headers sets for /* is served
    robots, sitemap  /robots.txt and /sitemap.xml answer and parse
  Only reads the public site; never publishes or changes anything.

  url defaults to "url" in ${SITE_FILE}, else the plan's domain in ${PROJECT_FILE}.

${pc.bold("Options")}
  --min-score <n>     Lowest audit score that passes (default 90)
  --max-pages <n>     HTML pages to crawl (default ${AUDIT_DEFAULTS.maxPages})
  --timeout <s>       Per-request timeout in seconds (default ${AUDIT_DEFAULTS.timeoutMs / 1000})
  --lang tr|en        Text of the deploy checks (default: the site locale, else tr)
  --form-endpoint <p> Contact form endpoint to probe (default: detected from the project)
  --country <code>    Country for the legal checks (default: the plan, else ${SITE_FILE}, else the domain)
  --verbose           Show every audit finding
  --ci                Print a GitHub Actions workflow that runs this check after each deploy
  --json              Machine-readable result

Exit code 1 when the score is below --min-score, the audit has an error or a deploy check
fails, so it can gate CI.`;

/** The contact form endpoint of the project: --form-endpoint, else the sender found, else the plan. */
export function formEndpoint(root: string, plan: string | undefined, flag: string | undefined): string | null {
  if (flag) return flag;
  if (existsSync(path.join(root, "functions/api/contact.ts")) || existsSync(path.join(root, "functions/api/contact.js"))) return "/api/contact";
  if (existsSync(path.join(root, "public/contact.php"))) return "/contact.php";
  if (plan === "edge") return "/api/contact";
  if (plan === "php-mail") return "/contact.php";
  return null;
}

/** Header names set for every path ("/*") in a Netlify / Cloudflare / Spacefast _headers file. */
export function headersFromFile(text: string): string[] {
  const names: string[] = [];
  let all = false;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      all = line.trim() === "/*";
      continue;
    }
    const m = /^\s+(?:!\s*)?([A-Za-z0-9-]+)\s*:/.exec(line);
    if (all && m && !line.trim().startsWith("!")) names.push(m[1]!.toLowerCase());
  }
  return names;
}

function readJson(file: string): Record<string, any> | null {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

const mark: Record<DeployCheckStatus, string> = { pass: pc.green("✓"), warn: pc.yellow("!"), fail: pc.red("✗"), skip: pc.dim("–") };

/** `site check [url]`: audit + deploy checks on the live address. Never publishes anything. */
export async function siteCheck(ctx: Context, args: ParsedArgs): Promise<number> {
  if (bool(args.flags, "help")) {
    out(SITE_CHECK_HELP);
    return 0;
  }
  const root = findProjectRoot(ctx.cwd);
  const site = readJson(path.join(root, SITE_FILE));
  const project = readJson(path.join(root, PROJECT_FILE));
  const lang = (str(args.flags, "lang") ?? (String(site?.locale ?? "").startsWith("en") ? "en" : "tr")) as Lang;
  if (lang !== "tr" && lang !== "en") throw new CliError(`--lang must be tr or en, got "${lang}".`);
  const domain = typeof project?.plan?.domain?.name === "string" ? project.plan.domain.name : "";
  const raw = args.positionals[1] ?? (typeof site?.url === "string" && site.url ? site.url : domain ? `https://${domain}` : undefined);
  const minScore = int(args.flags, "min-score", 0, 100) ?? 90;

  if (bool(args.flags, "ci")) {
    const shown = raw ? normalizeAuditUrl(raw).replace(/\/$/, "") : "https://example.com";
    const workflow = siteCheckWorkflow(shown, minScore);
    if (ctx.json) printJson({ path: ".github/workflows/site-check.yml", workflow });
    else {
      out(workflow);
      if (!raw) out(pc.dim(lang === "tr" ? `# https://example.com yerine sitenin adresini yazın (ya da ${SITE_FILE} içine "url" ekleyin).` : `# Replace https://example.com with the site's address (or set "url" in ${SITE_FILE}).`));
    }
    return 0;
  }

  if (!raw) throw new CliError("Which site?", `npx vamos-ui site check https://ornek.com.tr  (or set "url" in ${SITE_FILE})`);
  let url: string;
  try {
    url = normalizeAuditUrl(raw);
  } catch (error) {
    throw new CliError(`"${raw}" is not a URL: ${(error as Error).message}`, "Example: npx vamos-ui site check https://ornek.com.tr");
  }

  const { VERSION } = await import("../cli");
  const timeout = int(args.flags, "timeout", 1, 120);
  const timeoutMs = timeout ? timeout * 1000 : undefined;
  const userAgent = `vamos-ui-site-check/${VERSION} (+https://ui.vamos.ist/docs/cli)`;
  const s = ctx.json ? null : spinner();
  s?.start(lang === "tr" ? `${url} kontrol ediliyor` : `Checking ${url}`);
  const [audit, deploy] = await Promise.all([
    runAudit(url, {
      maxPages: int(args.flags, "max-pages", 1, AUDIT_DEFAULTS.maxPagesCap),
      timeoutMs,
      userAgent,
      localPreview: false,
      country: str(args.flags, "country") ?? (typeof project?.plan?.jurisdiction?.country === "string" ? project.plan.jurisdiction.country : undefined),
      site: site && typeof site === "object" ? site : null,
    }),
    runDeployChecks(url, {
      timeoutMs,
      userAgent,
      formEndpoint: formEndpoint(root, typeof project?.plan?.forms?.value === "string" ? project.plan.forms.value : undefined, str(args.flags, "form-endpoint")),
      expectedHeaders: existsSync(path.join(root, "public/_headers")) ? headersFromFile(readFileSync(path.join(root, "public/_headers"), "utf8")) : undefined,
    }),
  ]);
  const verdict = siteCheckVerdict(audit, deploy.checks, minScore);
  const deployTask = Array.isArray(project?.plan?.tasks) ? project!.plan.tasks.find((x: { id?: string }) => x?.id === "deploy") : null;
  const next = verdict.passed && project && deployTask?.status !== "done" ? "npx vamos-ui task done deploy" : null;
  s?.stop(verdict.passed ? (lang === "tr" ? "Kontrol geçti" : "Check passed") : lang === "tr" ? "Kontrol geçmedi" : "Check failed");

  if (ctx.json) {
    printJson({ url, finalUrl: audit.finalUrl, ...verdict, reasons: verdict.reasons.map((r) => r[lang]), checks: deploy.checks, audit, next });
    return verdict.passed ? 0 : 1;
  }
  out(formatAuditReport(audit, bool(args.flags, "verbose")));
  out("");
  out(pc.bold(lang === "tr" ? "Yayın kontrolleri" : "Deploy checks"));
  for (const c of deploy.checks) {
    out(`  ${mark[c.status]} ${pc.bold(c.title[lang])}  ${c.message[lang]}`);
    if (c.fix && (c.status === "fail" || c.status === "warn")) out(pc.dim(`      → ${c.fix[lang]}`));
  }
  out("");
  if (verdict.passed) {
    out(pc.green(pc.bold(lang === "tr" ? `Geçti: puan ${verdict.score}/100 (eşik ${minScore}), hata yok.` : `Passed: score ${verdict.score}/100 (min ${minScore}), no errors.`)));
    if (next) out(lang === "tr" ? `Planda yayın görevini kapatmak için: ${pc.cyan(next)}` : `To mark the deploy task done in the plan: ${pc.cyan(next)}`);
  } else {
    out(pc.red(pc.bold(lang === "tr" ? "Geçmedi." : "Failed.")));
    for (const r of verdict.reasons) out(`  - ${r[lang]}`);
  }
  return verdict.passed ? 0 : 1;
}
