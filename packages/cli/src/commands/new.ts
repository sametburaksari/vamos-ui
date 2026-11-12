import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { bool, parseArgs, str, type ParsedArgs } from "../args";
import { CliError } from "../core/types";
import {
  PROJECT_FILE,
  formatPlan,
  importSite,
  localize,
  mergeSite,
  nextQuestions,
  startProject,
  validateAnswers,
  type Answers,
  type Lang,
  type ProjectFile,
  type SiteImport,
} from "../project";
import { SITE_FILE, parseSiteJson, type SiteInfo } from "../site-info";
import { out, p, pc, printJson, spinner, unwrap, type Context } from "../ui";
import { brand } from "./brand";

const NEW_HELP = `${pc.bold("vamos-ui new")}  Plan a website by answering a few questions.

${pc.bold("Usage")}
  npx vamos-ui new [--lang tr|en] [--answers answers.json] [--dry-run]

Asks about the business, domain, hosting, a current site, one page or several, store or
booking needs, contact channels, measurement and who runs the site. Then writes:
  ${PROJECT_FILE}   the answers and the plan: pages and the components on them, legal
                       pages, hosting, forms, measurement, compliance, tasks, open questions
  ${SITE_FILE}      business details for the site files (only empty fields are filled)
  vamos.brand.json     with a current site: logo, colours and fonts (via brand import)

Run it again to continue where you stopped; answers are kept in ${PROJECT_FILE}.
Without a terminal (CI, agents) pass --answers with a JSON object of question id → answer;
missing answers are listed and the plan is written once nothing required is missing.

${pc.bold("Options")}
  --lang tr|en         Language of the questions and the summary (default tr)
  --answers <file>     Answers as JSON ({"business_name": "…", "site_type": "corporate", …})
  --no-import          Do not read the current site even if one is given
  --dry-run            Print the plan, write nothing
  --json               Print the step (questions or plan + files) as JSON`;

const SITE_IMPORT_HELP = `${pc.bold("vamos-ui site import")}  Read a current website into drafts.

${pc.bold("Usage")}
  npx vamos-ui site import <url> [--write] [--json] [--max-pages 4]

Reads the start page and a few linked pages (about, contact, services first) and lists the
business name, description, phone, WhatsApp, email, address, opening hours, social profiles
and languages it found, each with the page it came from, plus the navigation, headings and
content images. --write fills the empty fields of ${SITE_FILE} (never replaces a value).
For logo, colours and fonts use ${pc.cyan("npx vamos-ui brand import <url>")}.`;

async function readJson<T>(file: string): Promise<T | null> {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (error) {
    throw new CliError(`${path.basename(file)} is not valid JSON: ${(error as Error).message}`);
  }
}

async function readSite(root: string): Promise<Partial<SiteInfo> | null> {
  const file = path.join(root, SITE_FILE);
  if (!existsSync(file)) return null;
  const { site, error } = parseSiteJson(await readFile(file, "utf8"));
  if (error) throw new CliError(`${SITE_FILE}: ${error}`, "Fix it or move it away, then run again.");
  return site;
}

function summarizeImport(r: SiteImport, lang: Lang): string {
  const tr = lang === "tr";
  const lines: string[] = [];
  const row = (label: string, value: string, how?: string) => lines.push(`${pc.bold(label.padEnd(14))} ${value}${how ? pc.dim(`  (${how})`) : ""}`);
  const f = r.found;
  if (f.name) row(tr ? "Ad" : "Name", f.name.value, f.name.how);
  if (f.description) row(tr ? "Açıklama" : "Description", f.description.value.slice(0, 110), f.description.how);
  for (const v of f.phone ?? []) row(tr ? "Telefon" : "Phone", v.value, v.how);
  for (const v of f.whatsapp ?? []) row("WhatsApp", v.value, v.how);
  for (const v of f.email ?? []) row(tr ? "E-posta" : "Email", v.value, v.how);
  if (f.address) row(tr ? "Adres" : "Address", Object.values(f.address.value).join(", "), f.address.how);
  if (f.openingHours) row(tr ? "Saatler" : "Hours", f.openingHours.value.join("; "), f.openingHours.how);
  for (const v of f.social ?? []) row(tr ? "Sosyal" : "Social", v.value);
  if (f.languages) row(tr ? "Diller" : "Languages", f.languages.value.join(", "));
  const accent = r.brand.colours[0];
  if (accent) row(tr ? "Vurgu rengi" : "Accent", accent.hex, accent.reasons[0]);
  const fonts = [r.brand.brand.fonts?.display, r.brand.brand.fonts?.body].filter(Boolean);
  if (fonts.length) row(tr ? "Yazı tipleri" : "Fonts", [...new Set(fonts)].join(", "));
  const logos = (r.brand.brand.assets ?? []).filter((a) => /logo|icon/i.test(a.use)).slice(0, 3);
  for (const a of logos) row("Logo", a.path, a.use);
  if (r.navigation.length) row(tr ? "Menü" : "Navigation", r.navigation.map((n) => `${n.label} (${n.path})`).join(", ").slice(0, 300));
  row(tr ? "Okunan" : "Read", `${r.pages.length} ${tr ? "sayfa" : "pages"}, ${r.images.length} ${tr ? "içerik görseli" : "content images"}`);
  return lines.join("\n");
}

/** `vamos-ui site import <url>` */
export async function siteImport(ctx: Context, args: ParsedArgs): Promise<number> {
  if (bool(args.flags, "help")) {
    out(SITE_IMPORT_HELP);
    return 0;
  }
  const url = args.positionals[1];
  if (!url) throw new CliError("Pass the address of the current site.", "npx vamos-ui site import https://example.com");
  const lang = (str(args.flags, "lang") === "en" ? "en" : "tr") as Lang;
  const s = ctx.json ? null : spinner();
  s?.start(`Reading ${url}`);
  const result = await importSite(url, { maxPages: Number(str(args.flags, "max-pages") ?? 4) });
  s?.stop(`Read ${result.finalUrl}`);
  if (ctx.json) {
    printJson(result);
    return result.pages.length ? 0 : 1;
  }
  for (const w of result.warnings) p.log.warn(w);
  if (!result.pages.length) return 1;
  p.note(summarizeImport(result, lang), lang === "tr" ? "Mevcut siteden bulunanlar" : "Found on the current site");
  if (bool(args.flags, "write")) {
    const existing = await readSite(ctx.cwd);
    const { site, filled } = mergeSite(existing, result.site);
    if (!filled.length) p.log.info(`${SITE_FILE}: nothing new to fill.`);
    else if (!bool(args.flags, "dry-run")) {
      await writeFile(path.join(ctx.cwd, SITE_FILE), JSON.stringify(site, null, 2) + "\n");
      p.log.success(`${SITE_FILE}: filled ${filled.join(", ")}`);
    } else p.log.info(`Would fill ${filled.join(", ")} in ${SITE_FILE}.`);
  } else
    p.log.info(
      lang === "tr"
        ? `Değerleri kontrol edin; ${pc.cyan(`npx vamos-ui site import ${url} --write`)} ${SITE_FILE} içindeki boş alanları doldurur. Logo ve renkler: ${pc.cyan(`npx vamos-ui brand import ${url}`)}.`
        : `Check the values, then ${pc.cyan(`npx vamos-ui site import ${url} --write`)} fills the empty fields of ${SITE_FILE}. Logo and colours: ${pc.cyan(`npx vamos-ui brand import ${url}`)}.`,
    );
  return 0;
}

async function ask(q: ReturnType<typeof localize>): Promise<string | string[]> {
  const message = q.why ? `${q.text}\n${pc.dim(q.why)}` : q.text;
  const skip = q.optional ? pc.dim(" (boş bırakılabilir / optional)") : "";
  if (q.kind === "single") return unwrap(await p.select({ message, options: q.options!.map((o) => ({ value: o.value, label: o.label, hint: o.hint })) })) as string;
  if (q.kind === "multi") return unwrap(await p.multiselect({ message, options: q.options!.map((o) => ({ value: o.value, label: o.label, hint: o.hint })), required: !q.optional })) as string[];
  return unwrap(
    await p.text({
      message: message + skip,
      validate: (v) => {
        const value = (v ?? "").trim();
        if (!value && !q.optional) return "Required / zorunlu";
        if (!value) return undefined;
        const problems = validateAnswers({ [q.id]: value });
        return problems[0]?.problem;
      },
    }),
  ).trim();
}

/** `vamos-ui new` */
export async function newProject(ctx: Context, args: ParsedArgs): Promise<number> {
  if (bool(args.flags, "help")) {
    out(NEW_HELP);
    return 0;
  }
  const root = ctx.cwd;
  const lang = (str(args.flags, "lang") === "en" ? "en" : "tr") as Lang;
  const dryRun = bool(args.flags, "dry-run");
  const projectPath = path.join(root, PROJECT_FILE);
  const previous = await readJson<ProjectFile>(projectPath);
  const answers: Answers = { ...(previous?.answers ?? {}) };
  const answersFile = str(args.flags, "answers");
  if (answersFile) Object.assign(answers, (await readJson<Answers>(path.resolve(ctx.cwd, answersFile))) ?? {});
  const existingSite = await readSite(root);

  if (!ctx.json) p.intro(pc.bold(lang === "tr" ? "Vamos UI · yeni site" : "Vamos UI · new website"));
  if (previous && !ctx.json) p.log.info(lang === "tr" ? `${PROJECT_FILE} bulundu; kalan sorulardan devam ediliyor.` : `Found ${PROJECT_FILE}; continuing with the remaining questions.`);

  let imported: SiteImport | null = null;
  const doImport = async () => {
    const url = String(answers.existing_site ?? "").trim();
    if (!url || imported || !bool(args.flags, "import", true)) return;
    const s = ctx.json ? null : spinner();
    s?.start(lang === "tr" ? `${url} okunuyor` : `Reading ${url}`);
    imported = await importSite(url);
    s?.stop(lang === "tr" ? `${imported.pages.length} sayfa okundu` : `Read ${imported.pages.length} pages`);
    if (!ctx.json) {
      for (const w of imported.warnings) p.log.warn(w);
      if (imported.pages.length) p.note(summarizeImport(imported, lang), lang === "tr" ? "Mevcut siteden bulunanlar" : "Found on the current site");
    }
    // Answers the import already knows (only where the user has not answered).
    const f = imported.found;
    if (answers.business_name === undefined && f.name) answers.business_name = f.name.value;
    if (answers.description === undefined && f.description) answers.description = f.description.value;
    if (answers.phone === undefined && f.phone?.[0]) answers.phone = f.phone[0].value;
    if (answers.email === undefined && f.email?.[0]) answers.email = f.email[0].value;
    if (answers.address === undefined && f.address) answers.address = Object.values(f.address.value).filter(Boolean).join(", ");
  };

  // Interview loop (interactive) or a single step (answers file / agents).
  if (ctx.interactive) {
    for (;;) {
      const [q] = nextQuestions(answers, 1);
      if (!q) break;
      answers[q.id] = await ask(localize(q, lang));
      if (q.id === "existing_site") await doImport();
    }
  } else await doImport();

  const step = startProject(answers, {
    lang,
    existingSite,
    imported: imported ? { site: (imported as SiteImport).site, pages: (imported as SiteImport).navigation, url: (imported as SiteImport).finalUrl } : undefined,
  });

  if (ctx.json) {
    printJson(step);
    return step.problems.length ? 1 : 0;
  }
  for (const pr of step.problems) p.log.error(`${pr.id}: ${pr.problem}`);
  if (step.problems.length) return 1;

  if (!step.complete) {
    // Save progress so the next run (or another tool) continues from here.
    if (!dryRun) await writeFile(projectPath, JSON.stringify({ ...(previous ?? {}), $schema: "https://ui.vamos.ist/r/project-schema.json", version: 1, answers, plan: step.plan }, null, 2) + "\n");
    p.note(
      nextQuestions(answers)
        .filter((q) => !q.optional)
        .map((q) => `${pc.cyan(q.id)}  ${q.text[lang]}${q.options ? pc.dim(`  [${q.options.map((o) => o.value).join(" | ")}]`) : ""}`)
        .join("\n"),
      lang === "tr" ? `${step.remaining} soru kaldı` : `${step.remaining} questions left`,
    );
    p.outro(lang === "tr" ? `Cevapları --answers ile verin ya da terminalde ${pc.cyan("npx vamos-ui new")} çalıştırın.` : `Pass the answers with --answers, or run ${pc.cyan("npx vamos-ui new")} in a terminal.`);
    return 0;
  }

  out(formatPlan(step.plan, lang));
  out("");
  if (dryRun) {
    p.outro(lang === "tr" ? "Deneme: hiçbir dosya yazılmadı." : "Dry run: nothing written.");
    return 0;
  }

  await writeFile(projectPath, step.files![PROJECT_FILE]!);
  const filled = step.filled ?? [];
  await writeFile(path.join(root, SITE_FILE), step.files![SITE_FILE]!);
  p.log.success(`${PROJECT_FILE}`);
  p.log.success(`${SITE_FILE}${filled.length ? pc.dim(`  ${lang === "tr" ? "doldurulan" : "filled"}: ${filled.join(", ")}`) : ""}`);

  if (imported && (imported as SiteImport).pages.length && !existsSync(path.join(root, "vamos.brand.json"))) {
    const run = ctx.interactive ? unwrap(await p.confirm({ message: lang === "tr" ? "Logo, renkler ve yazı tipleri de mevcut siteden alınsın mı (vamos.brand.json)?" : "Take the logo, colours and fonts from the current site too (vamos.brand.json)?" })) : ctx.yes;
    if (run) await brand(ctx, parseArgs(["brand", "import", (imported as SiteImport).finalUrl, ...(ctx.yes ? ["--yes"] : [])]));
    else p.log.info(`${lang === "tr" ? "Marka için" : "For the brand"}: ${pc.cyan(`npx vamos-ui brand import ${(imported as SiteImport).finalUrl}`)}`);
  }

  const first = step.plan.templates[0];
  p.outro(
    lang === "tr"
      ? `Sonraki adım: ${pc.cyan(`npx vamos-ui create site --template next`)} ve ${first ? pc.cyan(`npx vamos-ui add ${first}`) : "planlanan bileşenler"}; ya da bir yapay zeka asistanına "${PROJECT_FILE} planını uygula" deyin.`
      : `Next: ${pc.cyan(`npx vamos-ui create site --template next`)} and ${first ? pc.cyan(`npx vamos-ui add ${first}`) : "the planned components"}; or ask an AI assistant to "build the plan in ${PROJECT_FILE}".`,
  );
  return 0;
}
