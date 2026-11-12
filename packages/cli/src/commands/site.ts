import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { bool, type ParsedArgs } from "../args";
import { detectProject } from "../core/project";
import { LAYOUT_METADATA_SNIPPET, LEGAL_BLOCK, planEssentials } from "../core/site";
import { out, p, pc, plural, printJson, type Context } from "../ui";
import { installItems, openSession, type InstallOptions, type Session } from "./shared";

const SITE_HELP = `${pc.bold("vamos-ui site")}  Launch basics for a website built from site-* blocks.

${pc.bold("Usage")}
  npx vamos-ui site essentials [--dry-run] [--no-install]

Writes what a public Next.js site needs and is easy to forget, never replacing a file that exists:
  app/site.ts            site origin (NEXT_PUBLIC_SITE_URL) and the routes in the sitemap
  app/robots.ts          robots.txt
  app/sitemap.ts         sitemap.xml
  app/<legal>/page.tsx   one page per legal link the site blocks have (privacy, kvkk, gizlilik,
                         cookies, cerez-politikasi, terms, kullanim-kosullari, accessibility,
                         iade, mesafeli-satis-sozlesmesi, on-bilgilendirme-formu, yasal-uyari …),
                         rendering the ${LEGAL_BLOCK} block (installed if missing)
Then prints the root-layout metadata to add (metadataBase, canonical, Open Graph) and any
internal links that still have no page.`;

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
  if (plan.files.some((f) => f.reason.startsWith("legal page"))) {
    p.log.warn("The legal pages are template text: fill in every [bracketed] field and have the business or a lawyer review them before launch.");
  }
  if (plan.layoutMissing.length) {
    p.log.info(`${plan.layoutPath ?? `${plan.appDir}/layout.tsx`} has no ${plan.layoutMissing.join(", ")}. Add, with the real name and a 120–160 character description:\n${pc.dim(LAYOUT_METADATA_SNIPPET)}`);
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
