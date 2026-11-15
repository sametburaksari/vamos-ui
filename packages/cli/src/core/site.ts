import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectRoutes, internalHrefs } from "../site-check";
import { AI_BOTS, SITE_FILE, parseSiteJson, type SiteInfo } from "../site-info";
import type { ProjectInfo } from "./project";
import { iconSvg, monogram, opengraphImage, siteColors } from "./site-assets";
import { fillCreatedLayout, isCreatedLayout } from "./site-layout";
import type { VamosConfig } from "./types";

/** The block every legal route page renders. */
export const LEGAL_BLOCK = "legal-01";

type LegalKind =
  | "privacy"
  | "kvkk"
  | "cookies"
  | "terms"
  | "accessibility"
  | "returns"
  | "distance-sales"
  | "pre-information"
  | "legal-notice";

/**
 * Legal slugs (English and Turkish) → legal-01 preset and its starting language.
 * Mirrors `legalSlugs` in apps/www/src/blocks/legal-01/components/types.ts.
 */
export const LEGAL_SLUGS: Record<string, { kind: LegalKind; locale: "en" | "tr" }> = {
  privacy: { kind: "privacy", locale: "en" },
  "privacy-policy": { kind: "privacy", locale: "en" },
  gizlilik: { kind: "privacy", locale: "tr" },
  "gizlilik-politikasi": { kind: "privacy", locale: "tr" },
  kvkk: { kind: "kvkk", locale: "tr" },
  "kvkk-aydinlatma-metni": { kind: "kvkk", locale: "tr" },
  cookies: { kind: "cookies", locale: "en" },
  "cookie-policy": { kind: "cookies", locale: "en" },
  cerezler: { kind: "cookies", locale: "tr" },
  "cerez-politikasi": { kind: "cookies", locale: "tr" },
  terms: { kind: "terms", locale: "en" },
  "terms-of-use": { kind: "terms", locale: "en" },
  "kullanim-kosullari": { kind: "terms", locale: "tr" },
  accessibility: { kind: "accessibility", locale: "en" },
  erisilebilirlik: { kind: "accessibility", locale: "tr" },
  returns: { kind: "returns", locale: "en" },
  "refund-policy": { kind: "returns", locale: "en" },
  iade: { kind: "returns", locale: "tr" },
  "iade-politikasi": { kind: "returns", locale: "tr" },
  "iade-ve-degisim": { kind: "returns", locale: "tr" },
  "cayma-hakki": { kind: "returns", locale: "tr" },
  "distance-sales": { kind: "distance-sales", locale: "en" },
  "distance-sales-agreement": { kind: "distance-sales", locale: "en" },
  "mesafeli-satis": { kind: "distance-sales", locale: "tr" },
  "mesafeli-satis-sozlesmesi": { kind: "distance-sales", locale: "tr" },
  "pre-information": { kind: "pre-information", locale: "en" },
  "on-bilgilendirme": { kind: "pre-information", locale: "tr" },
  "on-bilgilendirme-formu": { kind: "pre-information", locale: "tr" },
  "legal-notice": { kind: "legal-notice", locale: "en" },
  imprint: { kind: "legal-notice", locale: "en" },
  impressum: { kind: "legal-notice", locale: "en" },
  "yasal-uyari": { kind: "legal-notice", locale: "tr" },
};

/** The KVKK notice route essentials writes when a Turkish site collects personal data and links none. */
export const KVKK_ROUTE = "/kvkk-aydinlatma-metni";

const filled = (v?: string | null) => {
  const t = v?.trim();
  return t && !/^\[.*\]$/.test(t) ? t : undefined;
};

/** package.json name, or undefined when there is none (then the layout title is not checked). */
function packageName(root: string): string | undefined {
  try {
    const name = (JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as { name?: unknown }).name;
    return typeof name === "string" ? name : undefined;
  } catch {
    return undefined;
  }
}

/** Website blocks whose links the essentials cover. */
export const isSiteBlock = (name: string) => /^(?:site|page)-[a-z0-9-]+$/.test(name);

export interface EssentialFile {
  path: string;
  content: string;
  /** Why it is written (shown in the summary). */
  reason: string;
}

export interface EssentialsPlan {
  appDir: string;
  /** Files to create; never includes a path that exists. */
  files: EssentialFile[];
  /** Files skipped because the project already has them (or an equivalent). */
  kept: string[];
  /** Internal links (from the site blocks) that still have no page and no preset. */
  unmatched: string[];
  /** Legal routes this plan writes pages for. */
  legalRoutes: string[];
  /** Root layout metadata keys that are missing (metadataBase, alternates, openGraph). */
  layoutMissing: string[];
  layoutPath: string | null;
  /** vamos.site.json, when the project has one (null otherwise or when it does not parse). */
  site: SiteInfo | null;
  /** Set when vamos.site.json exists but is not valid JSON. */
  siteError?: string;
  /** True when the root layout still has to render <SiteJsonLd /> (the JSON-LD component exists or is written now). */
  jsonLdInLayout: boolean;
  /**
   * The root layout filled in from vamos.site.json (lang, metadata, <SiteJsonLd />), when it is still
   * the one `vamos-ui create` wrote. Null when it was edited (then the snippets are printed instead).
   */
  layoutPatch: { path: string; before: string; after: string } | null;
  /**
   * A KVKK notice route nothing links to yet on a Turkish site that collects personal data (the
   * footer and the contact form should link it). Null when not needed or already linked.
   */
  kvkkUnlinked: string | null;
  /** True when the kit Footer is rendered without jsonLd={false} (it would describe the business twice). */
  footerJsonLd: boolean;
  /** Things the user should do by hand (an existing file predates vamos.site.json, an outdated block …). */
  notes: string[];
}

const IGNORE = new Set(["node_modules", ".next", ".git", "dist", "build", "out", "coverage", ".turbo", ".vercel"]);

function walk(root: string, rel = "", out: string[] = []): string[] {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) return out;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (IGNORE.has(entry.name) || entry.name.startsWith(".")) continue;
    const r = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(root, r, out);
    else out.push(r);
  }
  return out;
}

/** Module specifier for `target` (project-relative, no extension) as imported from `fromFile`. */
export function importPath(fromFile: string, target: string, alias: ProjectInfo["alias"]): string {
  if (alias) {
    const base = alias.target.replace(/\/$/, "");
    if (base === "" || base === ".") return `${alias.alias}/${target}`;
    if (target.startsWith(`${base}/`)) return `${alias.alias}/${target.slice(base.length + 1)}`;
  }
  const rel = path.posix.relative(path.posix.dirname(fromFile), target);
  return rel.startsWith(".") ? rel : `./${rel}`;
}

const header = (what: string) => `// Written by \`vamos-ui site essentials\`. ${what} Edit freely; it is never overwritten.\n`;

function siteFile(routes: string[]): string {
  return (
    header("Site origin and the routes listed in sitemap.xml.") +
    `\n/** The live origin, e.g. https://www.your-business.com.tr. Set NEXT_PUBLIC_SITE_URL where the site is hosted. */\n` +
    `export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\\/+$/, "");\n\n` +
    `/** Every public page. Add a route here when you add a page. */\n` +
    `export const SITE_ROUTES: string[] = ${JSON.stringify(routes, null, 2)};\n`
  );
}

const ROBOTS = `${header("robots.txt for the whole site.")}import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: \`\${SITE_URL}/sitemap.xml\`,
    host: SITE_URL,
  };
}
`;

const SITEMAP = `${header("sitemap.xml from SITE_ROUTES.")}import type { MetadataRoute } from "next";
import { SITE_ROUTES, SITE_URL } from "./site";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.map((route) => ({
    url: \`\${SITE_URL}\${route === "/" ? "" : route}\`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "yearly",
    priority: route === "/" ? 1 : 0.3,
  }));
}
`;

function legalPage(route: string, kind: LegalKind, locale: "en" | "tr", pageImport: string, presetsImport: string, siteImport: string | null): string {
  if (siteImport) {
    return `${header(`The ${route} page (legal-01, preset "${kind}").`)}import type { Metadata } from "next";
import Legal01 from "${pageImport}";
import { fillLegalDoc, legalPreset } from "${presetsImport}";
import { LEGAL_VALUES } from "${siteImport}";

// Template text. Fields known from vamos.site.json are filled in (LEGAL_VALUES); replace every
// [bracketed] field that is left, have the business or its lawyer review the page, then pass
// notice={false}. \`npx vamos-ui verify\` lists the fields that are still open.
const doc = fillLegalDoc(legalPreset("${kind}", "${locale}"), LEGAL_VALUES);

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "${route}" },
  openGraph: { url: "${route}", title: doc.title, description: doc.summary },
};

export default function Page() {
  return <Legal01 doc={doc} locale="${locale}" values={LEGAL_VALUES} />;
}
`;
  }
  return `${header(`The ${route} page (legal-01, preset "${kind}").`)}import type { Metadata } from "next";
import Legal01 from "${pageImport}";
import { legalPreset } from "${presetsImport}";

// Template text. Replace every [bracketed] field, have the business or its lawyer review the page,
// then pass notice={false}. \`npx vamos-ui verify\` lists the fields that are still open.
const doc = legalPreset("${kind}", "${locale}");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "${route}" },
};

export default function Page() {
  return <Legal01 doc={doc} locale="${locale}" />;
}
`;
}

/** packages/cli/templates/site, from src/core (dev, tests) or dist (published). */
function siteTemplatesDir(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "templates", "site");
    if (existsSync(path.join(candidate, "site.ts"))) return candidate;
    dir = path.dirname(dir);
  }
  throw new Error("The vamos-ui templates/site folder is missing from this install. Reinstall vamos-ui.");
}

function readSiteTemplate(name: "site.ts" | "robots.ts" | "llms-route.ts" | "site-json-ld.tsx", vars: Record<string, string> = {}): string {
  let text = readFileSync(path.join(siteTemplatesDir(), name), "utf8");
  for (const [k, v] of Object.entries(vars)) text = text.split(k).join(v);
  return text;
}

/** What the root layout needs to render the JSON-LD (printed; the layout is never edited). */
export const JSON_LD_SNIPPET = `import { SiteJsonLd } from "./site-json-ld";

// inside <body>, once:
<SiteJsonLd />`;

/** Root-layout metadata from vamos.site.json (printed as a hint). og:image comes from app/opengraph-image.tsx. */
export const LAYOUT_METADATA_FROM_SITE = `import { SITE_URL, filled, site } from "./site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.name, template: \`%s — \${site.name}\` },
  description: filled(site.description),
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: site.name, title: site.name, description: filled(site.description), locale: filled(site.locale)?.replace("-", "_") },
  twitter: { card: "summary_large_image" },
};

// and on <html>: lang={filled(site.locale) ?? "en"}`;

/** Root-layout metadata the site should set; printed as a hint (the layout is never edited). */
export const LAYOUT_METADATA_SNIPPET = `export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Business name — what it does, where", template: "%s — Business name" },
  description: "120–160 characters: what the business offers, where, and why someone should get in touch.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "Business name", locale: "tr_TR", images: ["/og.jpg"] },
};`;

/**
 * Decides which essentials a Next.js App Router site still lacks: robots.ts, sitemap.ts (plus the
 * site.ts they share) and one page per legal route the installed site blocks link to. With a
 * vamos.site.json it also plans llms.txt and the JSON-LD component, and the legal pages and
 * robots.ts read the business details from it.
 */
export function planEssentials(
  root: string,
  config: Pick<VamosConfig, "blocksDir"> & Partial<Pick<VamosConfig, "uiDir" | "theme">>,
  project: Pick<ProjectInfo, "alias">,
): EssentialsPlan {
  const paths = walk(root);
  const appDir = ["src/app", "app"].find((d) => existsSync(path.join(root, d)) && statSync(path.join(root, d)).isDirectory()) ?? "app";
  const { routes } = collectRoutes(paths);
  const hasRoute = (route: string) => {
    const url = route === "/" ? [] : route.slice(1).split("/");
    return routes.some((r) => r.segments.length === url.length && r.segments.every((s, i) => s === url[i] || /^\[.+\]$/.test(s)));
  };
  const notes: string[] = [];

  // vamos.site.json: the business details everything below reads.
  let site: SiteInfo | null = null;
  let siteError: string | undefined;
  if (existsSync(path.join(root, SITE_FILE))) {
    const parsed = parseSiteJson(readFileSync(path.join(root, SITE_FILE), "utf8"));
    site = parsed.site;
    siteError = parsed.error;
  }

  // Links from the installed website blocks and the app's own files.
  const blocksDir = config.blocksDir.replace(/\/+$/, "");
  const scanned = paths.filter((p) => /\.(?:tsx|jsx|ts|js)$/.test(p) && ((p.startsWith(`${blocksDir}/`) && isSiteBlock(p.slice(blocksDir.length + 1).split("/")[0]!)) || p.startsWith(`${appDir}/`)));
  const linked = new Set<string>();
  for (const p of scanned) for (const h of internalHrefs(readFileSync(path.join(root, p), "utf8"))) linked.add(h.path.replace(/\/+$/, "") || "/");

  // app/site.ts: written now, or an existing one that already exports what the site.json files import.
  const exists = (re: RegExp) => paths.some((p) => re.test(p));
  const siteTsPath = paths.find((p) => new RegExp(`^${appDir}/site\\.(?:ts|js)$`).test(p)) ?? null;
  const siteTs = siteTsPath ? readFileSync(path.join(root, siteTsPath), "utf8") : "";
  const siteTsReady = /export const site\b/.test(siteTs) && /\bLEGAL_VALUES\b/.test(siteTs) && /\bLEGAL_ROUTES\b/.test(siteTs);
  const useSite = !!site && (!siteTsPath || siteTsReady);
  if (site && siteTsPath && !siteTsReady) {
    notes.push(`${siteTsPath} predates vamos.site.json (no \`site\`, LEGAL_ROUTES or LEGAL_VALUES export), so llms.txt, JSON-LD and the legal page values were skipped. Delete it and run \`npx vamos-ui site essentials\` again, or add those exports by hand.`);
  }
  const siteTarget = `${appDir}/site`;

  // Legal pages fill their fields from LEGAL_VALUES only with a legal-01 that has fillLegalDoc.
  const presetsFile = path.join(root, blocksDir, LEGAL_BLOCK, "components", "presets.ts");
  const legalHasValues = !existsSync(presetsFile) || /\bfillLegalDoc\b/.test(readFileSync(presetsFile, "utf8"));
  if (useSite && !legalHasValues) notes.push(`The installed ${LEGAL_BLOCK} predates the \`values\` prop, so new legal pages do not read vamos.site.json. Update it with \`npx vamos-ui add ${LEGAL_BLOCK} --overwrite\`.`);

  const files: EssentialFile[] = [];
  const kept: string[] = [];
  const legalRoutes: string[] = [];
  const unmatched: string[] = [];
  const pageTarget = `${blocksDir}/${LEGAL_BLOCK}/page`;
  const presetsTarget = `${blocksDir}/${LEGAL_BLOCK}/components/presets`;
  const addLegalPage = (route: string, legal: (typeof LEGAL_SLUGS)[string], why = "") => {
    const file = `${appDir}/${route.slice(1)}/page.tsx`;
    const siteImport = useSite && legalHasValues ? importPath(file, siteTarget, project.alias) : null;
    files.push({
      path: file,
      reason: `legal page (${legal.kind}, ${legal.locale}${siteImport ? ", values from vamos.site.json" : ""}${why})`,
      content: legalPage(route, legal.kind, legal.locale, importPath(file, pageTarget, project.alias), importPath(file, presetsTarget, project.alias), siteImport),
    });
    legalRoutes.push(route);
  };
  for (const route of [...linked].sort()) {
    if (route === "/") continue;
    const slug = route.slice(1);
    const legal = LEGAL_SLUGS[slug];
    if (hasRoute(route)) {
      if (legal) legalRoutes.push(route);
      continue;
    }
    if (!legal) {
      unmatched.push(route);
      continue;
    }
    addLegalPage(route, legal);
  }

  // A Turkish site that collects personal data (a contact form, a newsletter) needs a KVKK notice
  // (aydınlatma metni) even when no block links one yet: write it, and say where to link it.
  const appSources = scanned.filter((p) => p.startsWith(`${appDir}/`) || p.startsWith(`${blocksDir}/`));
  const readSource = (p: string) => readFileSync(path.join(root, p), "utf8");
  const layoutLang = (() => {
    const lp = paths.find((p) => new RegExp(`^${appDir}/layout\\.(?:tsx|jsx|ts|js)$`).test(p));
    return lp ? (/<html\b[^>]*\blang="([^"]+)"/.exec(readSource(lp))?.[1] ?? "") : "";
  })();
  const turkish = /^tr(?:-|$)/i.test(site?.locale?.trim() || layoutLang);
  const uiDir = config.uiDir?.replace(/\/+$/, "");
  const collectsData =
    (!!uiDir && existsSync(path.join(root, uiDir, "blocks", "site", "contact-form.tsx"))) ||
    appSources.some((p) => /<ContactForm\b|\bnewsletter=\{/.test(readSource(p)));
  const isKvkk = (r: string) => LEGAL_SLUGS[r.slice(1)]?.kind === "kvkk";
  let kvkkUnlinked: string | null = null;
  if (turkish && collectsData && ![...linked].some(isKvkk)) {
    const existing = routes.map((r) => `/${r.segments.join("/")}`).find(isKvkk);
    kvkkUnlinked = existing ?? KVKK_ROUTE;
    if (!existing) addLegalPage(KVKK_ROUTE, LEGAL_SLUGS[KVKK_ROUTE.slice(1)]!, ", the site collects personal data");
    else legalRoutes.push(existing);
  }
  const footerJsonLd = appSources.some((p) => {
    const text = readSource(p);
    return /<Footer\b/.test(text) && !/jsonLd=\{false\}/.test(text);
  });

  const sitemapRoutes = [
    "/",
    ...[...new Set([...linked, ...(kvkkUnlinked ? [kvkkUnlinked] : [])])].filter((r) => r !== "/" && (hasRoute(r) || files.some((f) => f.path === `${appDir}${r}/page.tsx`))).sort(),
  ];
  const robotsPath = paths.find((p) => new RegExp(`^(?:${appDir}/robots\\.(?:ts|js|txt)|public/robots\\.txt)$`).test(p));
  const hasSitemap = exists(new RegExp(`^(?:${appDir}/sitemap\\.(?:ts|js|xml)|public/sitemap\\.xml)$`));
  const basics: EssentialFile[] = [];
  if (!siteTsPath && (useSite || !robotsPath || !hasSitemap)) {
    basics.push(
      useSite
        ? {
            path: `${appDir}/site.ts`,
            reason: "business info (vamos.site.json), site origin + sitemap routes",
            content: readSiteTemplate("site.ts", {
              __SITE_JSON__: importPath(`${appDir}/site.ts`, SITE_FILE, null),
              __ROUTES__: JSON.stringify(sitemapRoutes, null, 2),
              __LEGAL_ROUTES__: JSON.stringify(sitemapRoutes.filter((r) => LEGAL_SLUGS[r.slice(1)]), null, 2),
            }),
          }
        : { path: `${appDir}/site.ts`, reason: "site origin + sitemap routes", content: siteFile(sitemapRoutes) },
    );
  }
  if (robotsPath) {
    kept.push("robots");
    if (site && site.ai?.allowAiCrawlers !== undefined && site.ai.allowAiCrawlers !== true) {
      const robots = readFileSync(path.join(root, robotsPath), "utf8");
      if (!/allowAiCrawlers|GPTBot/.test(robots)) notes.push(`${robotsPath} exists and does not follow ai.allowAiCrawlers in vamos.site.json; AI crawlers are still allowed. Delete it and run \`npx vamos-ui site essentials\` again, or add the AI bot rules by hand.`);
    }
  } else basics.push({ path: `${appDir}/robots.ts`, reason: useSite ? "robots.txt (AI crawlers per vamos.site.json)" : "robots.txt", content: useSite ? readSiteTemplate("robots.ts", { __AI_BOTS__: JSON.stringify(AI_BOTS, null, 2) }) : ROBOTS });
  if (hasSitemap) kept.push("sitemap");
  else basics.push({ path: `${appDir}/sitemap.ts`, reason: "sitemap.xml", content: SITEMAP });

  if (useSite) {
    const hasLlms = exists(new RegExp(`^(?:${appDir}/llms\\.txt/route\\.(?:ts|js)|public/llms\\.txt)$`));
    if (hasLlms) kept.push("llms.txt");
    else if (site!.ai?.llmsTxt !== false) {
      const file = `${appDir}/llms.txt/route.ts`;
      basics.push({ path: file, reason: "llms.txt (from vamos.site.json)", content: readSiteTemplate("llms-route.ts", { __SITE_IMPORT__: importPath(file, siteTarget, project.alias) }) });
    }
    if (exists(new RegExp(`^${appDir}/site-json-ld\\.(?:tsx|jsx)$`))) kept.push("JSON-LD");
    else basics.push({ path: `${appDir}/site-json-ld.tsx`, reason: "JSON-LD component (rendered in the root layout)", content: readSiteTemplate("site-json-ld.tsx") });

    // Favicon and link-preview image, in the theme colours. Next.js serves both from the file names.
    const colors = siteColors(root, config);
    const name = filled(site!.name) ?? "";
    const hasIcon = exists(new RegExp(`^(?:${appDir}/(?:icon\\.(?:svg|png|ico|jpe?g|tsx|jsx|ts|js)|favicon\\.ico)|public/favicon\\.(?:ico|svg|png))$`));
    if (hasIcon) kept.push("favicon");
    else if (name) basics.push({ path: `${appDir}/icon.svg`, reason: `favicon (monogram "${monogram(name, site!.locale)}" in the theme accent)`, content: iconSvg(name, colors, site!.locale) });
    const hasOg = exists(new RegExp(`^(?:${appDir}/opengraph-image\\.(?:tsx|jsx|ts|js|png|jpe?g)|public/og\\.(?:jpe?g|png))$`));
    if (hasOg) kept.push("og:image");
    else {
      const file = `${appDir}/opengraph-image.tsx`;
      basics.push({ path: file, reason: "og:image (business name + description, 1200×630)", content: opengraphImage(importPath(file, siteTarget, project.alias), colors, site!.locale) });
    }
  }
  files.unshift(...basics);

  const layoutPath = paths.find((p) => new RegExp(`^${appDir}/layout\\.(?:tsx|jsx|ts|js)$`).test(p)) ?? null;
  const layout = layoutPath ? readFileSync(path.join(root, layoutPath), "utf8") : "";
  let layoutMissing = ["metadataBase", "alternates", "openGraph"].filter((k) => !new RegExp(`\\b${k}\\b`).test(layout));
  let jsonLdInLayout = useSite && !/<SiteJsonLd\b/.test(layout);

  // The layout `vamos-ui create` wrote, untouched: fill it in instead of printing snippets.
  const jsonLdReady = basics.some((f) => f.path.endsWith("/site-json-ld.tsx")) || kept.includes("JSON-LD");
  let layoutPatch: EssentialsPlan["layoutPatch"] = null;
  if (useSite && jsonLdReady && layoutPath && /\.tsx$/.test(layoutPath) && isCreatedLayout(layout, packageName(root))) {
    const after = fillCreatedLayout(layout, { site: importPath(layoutPath, siteTarget, null), jsonLd: importPath(layoutPath, `${appDir}/site-json-ld`, null) }, "en");
    layoutPatch = { path: layoutPath, before: layout, after };
    layoutMissing = [];
    jsonLdInLayout = false;
  }

  return {
    appDir,
    files: files.filter((f) => !existsSync(path.join(root, f.path))),
    kept,
    unmatched,
    legalRoutes,
    layoutMissing,
    layoutPath,
    site,
    siteError,
    jsonLdInLayout,
    layoutPatch,
    kvkkUnlinked,
    footerJsonLd,
    notes,
  };
}
