import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { findProjectRoot } from "../core/config";
import { detectProject } from "../core/project";
import { JSON_LD_SNIPPET, LAYOUT_METADATA_FROM_SITE, LAYOUT_METADATA_SNIPPET, LEGAL_BLOCK, planEssentials } from "../core/site";
import { CliError } from "../core/types";
import { SITE_FILE, missingSiteFields, siteTemplate } from "../site-info";
import { out, p, pc, plural, printJson, type Context } from "../ui";
import { siteImport } from "./new";
import { siteDeploy } from "./site-deploy";
import { siteForm } from "./site-form";
import { installItems, openSession, type InstallOptions, type Session } from "./shared";

const SITE_HELP = `${pc.bold("vamos-ui site")}  Business info and launch basics for a website built from site-* blocks.

${pc.bold("Usage")}
  npx vamos-ui site init [--name <name>] [--url <https://…>] [--locale <tr-TR>]
  npx vamos-ui site import <url> [--write]   read a current site into ${SITE_FILE} drafts
  npx vamos-ui site essentials [--dry-run] [--no-install]
  npx vamos-ui site form [--kind php-mail|resend|smtp] [--to <inbox>] [--from <mailbox>] [--booking] [--dry-run]
  npx vamos-ui site deploy [--host vercel|netlify|cloudflare|cpanel|vps] [--domain <name>] [--www] [--dry-run]

${pc.bold("site init")} writes an empty ${SITE_FILE} at the project root (never over an existing one):
the one source for the business name, contact, address, opening hours, legal ids (MERSİS, tax,
KEP, ETBİS), analytics ids and AI settings. Fill it in with the business's own details.

${pc.bold("site essentials")} writes what a public Next.js site needs and is easy to forget, never
replacing a file that exists:
  app/site.ts            site origin (NEXT_PUBLIC_SITE_URL, else ${SITE_FILE} url), the sitemap
                         routes and, with ${SITE_FILE}, a typed \`site\` object
  app/robots.ts          robots.txt (with ${SITE_FILE}: AI crawlers per ai.allowAiCrawlers)
  app/sitemap.ts         sitemap.xml
  app/llms.txt/route.ts  /llms.txt from ${SITE_FILE} (unless ai.llmsTxt is false)
  app/site-json-ld.tsx   schema.org JSON-LD for the business (+ FAQPage) from ${SITE_FILE}
  app/<legal>/page.tsx   one page per legal link the site blocks have (privacy, kvkk, gizlilik,
                         cookies, cerez-politikasi, terms, kullanim-kosullari, accessibility,
                         iade, mesafeli-satis-sozlesmesi, on-bilgilendirme-formu, yasal-uyari …),
                         rendering the ${LEGAL_BLOCK} block (installed if missing); fields known
                         from ${SITE_FILE} are filled in
Then prints the root-layout metadata and JSON-LD to add, and any internal links that still have
no page.

${pc.bold("site form")} writes the sender behind ContactForm, never replacing a file:
  php-mail  public/contact.php for static exports on shared hosting (cPanel): mail() through the
            host, JSON for the form, a redirect when JavaScript is off
  resend    app/actions/contact.ts + app/contact-fields.ts, a server action using the Resend API
  smtp      the same with nodemailer and the business's own mailbox
All three validate the same fields as the form, drop bot submits, rate-limit per IP and refuse
cross-site posts. Default kind: the plan in vamos.project.json, else php-mail for a static site
and smtp for a Next.js server. --to defaults to contact.email in ${SITE_FILE}.

${pc.bold("site deploy")} writes the host's config, never replacing a file, and prints the publishing
steps and the checks to run afterwards. It never publishes anything itself:
  cpanel      public/.htaccess: http → https and one host name (301), security headers, cache
              rules, the 404 page, project files denied
  vercel      vercel.json: security headers, immutable cache for /_next/static, www redirect
  netlify     public/_headers (+ public/_redirects for the other host name)
  cloudflare  public/_headers (+ public/_redirects)
  vps         deploy/nginx-<domain>.conf (TLS, redirects, headers, proxy) + deploy/ecosystem.config.cjs (pm2)
Host: --host, else the plan in vamos.project.json. Domain: --domain, else the plan, else ${SITE_FILE} url.`;

export interface EssentialsResult {
  written: string[];
  unmatched: string[];
  skipped: boolean;
}

/** Plans and writes the website essentials. Shared by `site essentials` and `add`. */
export async function writeEssentials(ctx: Context, session: Session, opts: Pick<InstallOptions, "dryRun" | "install">): Promise<EssentialsResult> {
  const { root, config } = session;
  const project = detectProject(root);
  if (project.framework !== "next" || !project.appRouter) {
    if (!ctx.json)
      p.log.info(
        `Not a Next.js App Router project, so nothing was written. Before launch the site still needs: robots.txt, sitemap.xml, a page for every legal link (privacy / KVKK / cookies / terms / returns / legal notice; the ${LEGAL_BLOCK} block renders them), canonical + Open Graph tags and JSON-LD.`,
      );
    return { written: [], unmatched: [], skipped: true };
  }

  let plan = planEssentials(root, config, project);
  const needsLegal = plan.files.some((f) => f.reason.startsWith("legal page"));
  if (needsLegal && !existsSync(path.join(root, config.blocksDir, LEGAL_BLOCK, "page.tsx"))) {
    await installItems(ctx, session, [LEGAL_BLOCK], { overwrite: false, dryRun: opts.dryRun, install: opts.install });
    plan = planEssentials(root, config, project);
  }

  const written: string[] = [];
  if (!opts.dryRun) {
    for (const f of plan.files) {
      const abs = path.join(root, f.path);
      if (existsSync(abs)) continue;
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, f.content);
      written.push(f.path);
    }
  }

  if (ctx.json) return { written, unmatched: plan.unmatched, skipped: false };
  const lines = plan.files.map((f) => `${opts.dryRun ? pc.dim("+") : pc.green("+")} ${f.path} ${pc.dim(f.reason)}`);
  p.note(lines.length ? lines.join("\n") : pc.dim("Robots, sitemap and the legal pages are already there."), opts.dryRun ? "Site essentials (dry run)" : "Site essentials");
  if (plan.siteError) p.log.error(`${plan.siteError} It was ignored; fix it and run again.`);
  else if (!plan.site) p.log.info(`No ${SITE_FILE}. ${pc.cyan("npx vamos-ui site init")} creates one; with the business details in it, essentials also writes llms.txt and JSON-LD and fills the legal pages.`);
  else {
    const missing = missingSiteFields(plan.site);
    if (missing.length) p.log.warn(`${SITE_FILE} still has no ${missing.join(", ")}. Fill in the business's own details; the generated files read them at build time.`);
  }
  for (const note of plan.notes) p.log.warn(note);
  if (plan.files.some((f) => f.reason.startsWith("legal page"))) {
    p.log.warn("The legal pages are template text: fill in every [bracketed] field that is left and have the business or a lawyer review them before launch.");
  }
  const layoutFile = plan.layoutPath ?? `${plan.appDir}/layout.tsx`;
  if (plan.layoutMissing.length) {
    p.log.info(
      plan.site
        ? `${layoutFile} has no ${plan.layoutMissing.join(", ")}. Add (it reads ${SITE_FILE}):\n${pc.dim(LAYOUT_METADATA_FROM_SITE)}`
        : `${layoutFile} has no ${plan.layoutMissing.join(", ")}. Add, with the real name and a 120–160 character description:\n${pc.dim(LAYOUT_METADATA_SNIPPET)}`,
    );
  }
  if (plan.jsonLdInLayout && (plan.files.some((f) => f.path.endsWith("/site-json-ld.tsx")) || plan.kept.includes("JSON-LD"))) {
    p.log.info(`Render the JSON-LD once in ${layoutFile} (the layout is not edited for you). If the kit Footer is on the page, pass it jsonLd={false} so the business is not described twice:\n${pc.dim(JSON_LD_SNIPPET)}`);
  }
  if (plan.unmatched.length) {
    p.log.warn(`${plural(plan.unmatched.length, "internal link")} still ${plan.unmatched.length === 1 ? "has" : "have"} no page (404): ${plan.unmatched.join(", ")}\n${pc.dim("Create those pages or remove the links. Also replace placeholder phones, emails and map links; `npx vamos-ui verify` lists them.")}`);
  }
  return { written, unmatched: plan.unmatched, skipped: false };
}

export async function site(ctx: Context, args: ParsedArgs): Promise<number> {
  const sub = args.positionals[0];
  if (bool(args.flags, "help") || !sub || sub === "help") {
    out(SITE_HELP);
    return sub || bool(args.flags, "help") ? 0 : 1;
  }
  if (sub === "init") return siteInit(ctx, args);
  if (sub === "import") return siteImport(ctx, args);
  if (sub === "form") return siteForm(ctx, args);
  if (sub === "deploy") return siteDeploy(ctx, args);
  if (sub !== "essentials") {
    out(`${pc.red("Unknown site command")} "${sub}".\n\n${SITE_HELP}`);
    return 1;
  }
  const session = await openSession(ctx, { config: "required" });
  if (!ctx.json) p.intro(pc.bold("vamos-ui site essentials"));
  const res = await writeEssentials(ctx, session, { dryRun: bool(args.flags, "dry-run"), install: bool(args.flags, "install", true) });
  if (ctx.json) printJson(res);
  else p.outro(res.skipped ? "Done." : bool(args.flags, "dry-run") ? "Dry run: nothing was written." : res.written.length ? `Wrote ${plural(res.written.length, "file")}.` : "Nothing to write.");
  return 0;
}

/** `site init`: an empty vamos.site.json at the project root; never replaces one. */
async function siteInit(ctx: Context, args: ParsedArgs): Promise<number> {
  const root = findProjectRoot(ctx.cwd);
  const file = path.join(root, SITE_FILE);
  if (existsSync(file)) {
    if (ctx.json) printJson({ written: [], kept: [SITE_FILE] });
    else p.log.info(`${SITE_FILE} already exists; it was not changed.`);
    return 0;
  }
  const url = str(args.flags, "url");
  if (url !== undefined && !/^https?:\/\/[^\s/]+/.test(url)) throw new CliError(`--url must be a full origin such as https://www.example.com, got "${url}".`);
  const data = siteTemplate({ name: str(args.flags, "name"), url, locale: str(args.flags, "locale") });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  if (ctx.json) {
    printJson({ written: [SITE_FILE], kept: [] });
    return 0;
  }
  p.log.success(`Wrote ${SITE_FILE}.`);
  p.log.info(`Fill in the business's own details (empty fields stay empty; \`npx vamos-ui verify\` lists the required ones), then run ${pc.cyan("npx vamos-ui site essentials")}.`);
  return 0;
}
