import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { collectRoutes, internalHrefs } from "../site-check";
import type { ProjectInfo } from "./project";
import type { VamosConfig } from "./types";

/** The block every legal route page renders. */
export const LEGAL_BLOCK = "legal-01";

type LegalKind = "privacy" | "kvkk" | "cookies" | "terms" | "accessibility";

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
};

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

function legalPage(route: string, kind: LegalKind, locale: "en" | "tr", pageImport: string, presetsImport: string): string {
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

/** Root-layout metadata the site should set; printed as a hint (the layout is never edited). */
export const LAYOUT_METADATA_SNIPPET = `export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Business name — what it does, where", template: "%s — Business name" },
  description: "120–160 characters: what the business offers, where, and why someone should get in touch.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Business name", locale: "tr_TR", images: ["/og.jpg"] },
};`;

/**
 * Decides which essentials a Next.js App Router site still lacks: robots.ts, sitemap.ts (plus the
 * site.ts they share) and one page per legal route the installed site blocks link to.
 */
export function planEssentials(root: string, config: Pick<VamosConfig, "blocksDir">, project: Pick<ProjectInfo, "alias">): EssentialsPlan {
  const paths = walk(root);
  const appDir = ["src/app", "app"].find((d) => existsSync(path.join(root, d)) && statSync(path.join(root, d)).isDirectory()) ?? "app";
  const { routes } = collectRoutes(paths);
  const hasRoute = (route: string) => {
    const url = route === "/" ? [] : route.slice(1).split("/");
    return routes.some((r) => r.segments.length === url.length && r.segments.every((s, i) => s === url[i] || /^\[.+\]$/.test(s)));
  };

  // Links from the installed website blocks and the app's own files.
  const blocksDir = config.blocksDir.replace(/\/+$/, "");
  const scanned = paths.filter((p) => /\.(?:tsx|jsx|ts|js)$/.test(p) && ((p.startsWith(`${blocksDir}/`) && isSiteBlock(p.slice(blocksDir.length + 1).split("/")[0]!)) || p.startsWith(`${appDir}/`)));
  const linked = new Set<string>();
  for (const p of scanned) for (const h of internalHrefs(readFileSync(path.join(root, p), "utf8"))) linked.add(h.path.replace(/\/+$/, "") || "/");

  const files: EssentialFile[] = [];
  const kept: string[] = [];
  const legalRoutes: string[] = [];
  const unmatched: string[] = [];
  const pageTarget = `${blocksDir}/${LEGAL_BLOCK}/page`;
  const presetsTarget = `${blocksDir}/${LEGAL_BLOCK}/components/presets`;
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
    const file = `${appDir}/${slug}/page.tsx`;
    files.push({ path: file, reason: `legal page (${legal.kind}, ${legal.locale})`, content: legalPage(route, legal.kind, legal.locale, importPath(file, pageTarget, project.alias), importPath(file, presetsTarget, project.alias)) });
    legalRoutes.push(route);
  }

  const exists = (re: RegExp) => paths.some((p) => re.test(p));
  const sitemapRoutes = ["/", ...[...linked].filter((r) => r !== "/" && (hasRoute(r) || files.some((f) => f.path === `${appDir}${r}/page.tsx`))).sort()];
  const hasRobots = exists(new RegExp(`^(?:${appDir}/robots\\.(?:ts|js|txt)|public/robots\\.txt)$`));
  const hasSitemap = exists(new RegExp(`^(?:${appDir}/sitemap\\.(?:ts|js|xml)|public/sitemap\\.xml)$`));
  const basics: EssentialFile[] = [];
  if ((!hasRobots || !hasSitemap) && !exists(new RegExp(`^${appDir}/site\\.(?:ts|js)$`))) basics.push({ path: `${appDir}/site.ts`, reason: "site origin + sitemap routes", content: siteFile(sitemapRoutes) });
  if (hasRobots) kept.push("robots");
  else basics.push({ path: `${appDir}/robots.ts`, reason: "robots.txt", content: ROBOTS });
  if (hasSitemap) kept.push("sitemap");
  else basics.push({ path: `${appDir}/sitemap.ts`, reason: "sitemap.xml", content: SITEMAP });
  files.unshift(...basics);

  const layoutPath = paths.find((p) => new RegExp(`^${appDir}/layout\\.(?:tsx|jsx|ts|js)$`).test(p)) ?? null;
  const layout = layoutPath ? readFileSync(path.join(root, layoutPath), "utf8") : "";
  const layoutMissing = ["metadataBase", "alternates", "openGraph"].filter((k) => !new RegExp(`\\b${k}\\b`).test(layout));

  return { appDir, files: files.filter((f) => !existsSync(path.join(root, f.path))), kept, unmatched, legalRoutes, layoutMissing, layoutPath };
}
