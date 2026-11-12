import { bool, str, type ParsedArgs } from "../args";
import { AUDIT_DEFAULTS, AUDIT_RULES, normalizeAuditUrl, runAudit, type AuditIssue, type AuditReport, type AuditSeverity } from "../audit";
import { CliError } from "../core/types";
import { out, pc, plural, printJson, spinner, type Context } from "../ui";

const HELP = `${pc.bold("vamos-ui audit")} <url>  Check a live website over HTTP (no browser, no project files)

  Fetch and redirects, head metadata (title, description, canonical, Open Graph, JSON-LD),
  robots.txt / sitemap.xml / llms.txt and the AI crawler policy, placeholder content, legal
  links, broken internal links and heavy images. Works for any site.

${pc.bold("Options")}
  --max-pages <n>     HTML pages to crawl, start page included (default ${AUDIT_DEFAULTS.maxPages}, max ${AUDIT_DEFAULTS.maxPagesCap})
  --external          Also check external links (HEAD, fallback GET)
  --timeout <s>       Per-request timeout in seconds (default ${AUDIT_DEFAULTS.timeoutMs / 1000})
  --concurrency <n>   Requests in flight (default ${AUDIT_DEFAULTS.concurrency})
  --strict            Exit 1 on warnings too
  --verbose           Show every finding (default: the first 5 per rule)
  --json              Machine-readable report

Exit code 1 when there are errors (or warnings with --strict). Respects robots.txt Disallow.`;

function int(flags: ParsedArgs["flags"], name: string, min: number, max: number): number | undefined {
  const raw = str(flags, name);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min) throw new CliError(`--${name} must be a number ≥ ${min}.`);
  return Math.min(n, max);
}

const badge: Record<AuditSeverity, (s: string) => string> = { error: (s) => pc.red(s), warning: (s) => pc.yellow(s), info: (s) => pc.dim(s) };

export function formatAuditReport(report: AuditReport, verbose = false): string {
  const lines: string[] = [];
  const { errors, warnings, info } = report.summary;
  const scoreColour = report.score >= 85 ? pc.green : report.score >= 60 ? pc.yellow : pc.red;
  lines.push(`${pc.bold("Audit")} ${pc.cyan(report.finalUrl)}${report.finalUrl !== report.url ? pc.dim(` (from ${report.url})`) : ""}`);
  lines.push(`${scoreColour(pc.bold(`${report.score}/100`))}  ${pc.red(plural(errors, "error"))}, ${pc.yellow(plural(warnings, "warning"))}, ${pc.dim(`${info} info`)}`);
  const f = report.fetch;
  if (f.status) {
    lines.push(
      pc.dim(
        `HTTP ${f.status} · ${f.timeMs} ms · ${Math.round(f.htmlBytes / 1024)} KB HTML${f.compression ? ` (${f.compression})` : " (uncompressed)"} · ${plural(f.redirects.length, "redirect")} · ${plural(report.crawl.pages.length, "page")} crawled · ${report.crawl.linksChecked} links · ${report.crawl.imagesChecked} images · ${(report.durationMs / 1000).toFixed(1)} s`,
      ),
    );
  }
  if (report.head) {
    const h = report.head;
    lines.push(pc.dim(`title ${h.title ? `"${h.title}"` : "—"} · lang ${h.lang ?? "—"} · JSON-LD ${h.jsonLdTypes.length ? h.jsonLdTypes.join(", ") : "—"} · sitemap ${report.files.sitemap?.found ? `${report.files.sitemap.urls} URLs` : "—"} · llms.txt ${report.files.llmsTxt ? "yes" : "no"}`));
  }
  if (report.legal.length) lines.push(pc.dim(`legal: ${report.legal.map((l) => `${l.kind} ${l.status ?? "ext"}`).join(", ")}`));
  const max = verbose ? Infinity : 5;
  for (const sev of ["error", "warning", "info"] as const) {
    const group = report.issues.filter((i) => i.severity === sev);
    if (!group.length) continue;
    lines.push("", pc.bold(badge[sev](`${sev === "error" ? "Errors" : sev === "warning" ? "Warnings" : "Info"} (${group.length})`)));
    const byRule = new Map<string, AuditIssue[]>();
    for (const i of group) byRule.set(i.rule, [...(byRule.get(i.rule) ?? []), i]);
    for (const [rule, items] of byRule) {
      lines.push(`  ${badge[sev]("●")} ${pc.bold(AUDIT_RULES[rule]?.title ?? rule)} ${pc.dim(`[${rule}]`)}`);
      for (const i of items.slice(0, max)) lines.push(`    ${i.message}${i.url && !i.message.includes(i.url) ? pc.dim(`  ${i.url}`) : ""}`);
      if (items.length > max) lines.push(pc.dim(`    … ${items.length - max} more (--verbose)`));
      if (items[0]!.fix) lines.push(pc.dim(`    → ${items[0]!.fix}`));
    }
  }
  if (!report.issues.length) lines.push("", pc.green("No issues found."));
  return lines.join("\n");
}

export async function audit(ctx: Context, args: ParsedArgs): Promise<number> {
  if (bool(args.flags, "help") || !args.positionals[0]) {
    out(HELP);
    return args.positionals[0] || bool(args.flags, "help") ? 0 : 1;
  }
  let url: string;
  try {
    url = normalizeAuditUrl(args.positionals[0]);
  } catch (error) {
    throw new CliError(`"${args.positionals[0]}" is not a URL: ${(error as Error).message}`, "Example: npx vamos-ui audit https://example.com");
  }
  const { VERSION } = await import("../cli");
  const timeout = int(args.flags, "timeout", 1, 120);
  const s = ctx.json ? null : spinner();
  s?.start(`Auditing ${url}`);
  const report = await runAudit(url, {
    maxPages: int(args.flags, "max-pages", 1, AUDIT_DEFAULTS.maxPagesCap),
    concurrency: int(args.flags, "concurrency", 1, 16),
    timeoutMs: timeout ? timeout * 1000 : undefined,
    external: bool(args.flags, "external"),
    userAgent: `vamos-ui-audit/${VERSION} (+https://ui.vamos.ist/docs/cli)`,
  });
  s?.stop(`Audited ${plural(report.crawl.pages.length, "page")} in ${(report.durationMs / 1000).toFixed(1)} s`);
  if (ctx.json) printJson(report);
  else out(formatAuditReport(report, bool(args.flags, "verbose")));
  const failed = report.summary.errors > 0 || (bool(args.flags, "strict") && report.summary.warnings > 0);
  return failed ? 1 : 0;
}
