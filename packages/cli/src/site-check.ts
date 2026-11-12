/**
 * Project-level website checks (part of vamos-ui/verify): links to routes that have no page,
 * and the launch basics a public site needs (robots, sitemap, metadataBase, canonical, Open
 * Graph, JSON-LD). Pure: the caller hands in the project's file list and the sources it read,
 * so the CLI and the MCP server share it.
 */

import { lex } from "./lexer";
import type { VerifyIssue, VerifyRule } from "./verify";

export const PROJECT_RULES: readonly VerifyRule[] = [
  { id: "missing-route", severity: "warning", description: "An internal link points to a route with no page in the app (it will 404)." },
  { id: "site-essentials", severity: "warning", description: "A website without robots, sitemap, metadataBase, canonical URLs, Open Graph or JSON-LD." },
];

export interface ProjectSource {
  /** Project-relative posix path. */
  path: string;
  content: string;
}

export interface ProjectCheckInput {
  /** Every project-relative posix path (source, app routes, public/), without node_modules or build output. */
  paths: string[];
  /** Sources to scan for links (usually the files `vamos-ui verify` checks). */
  sources: ProjectSource[];
}

export interface ProjectIssue extends VerifyIssue {
  file: string;
}

const PAGE_FILE = /^page\.(?:tsx|jsx|ts|js|mdx|md)$/;
const ROUTE_FILE = /^route\.(?:ts|js)$/;

interface Route {
  segments: string[];
}

/** Next.js routes from app/ (or src/app/) and pages/ (or src/pages/). */
export function collectRoutes(paths: string[]): { routes: Route[]; appDir: string | null; hasRouter: boolean } {
  const appDir = ["src/app", "app"].find((d) => paths.some((p) => p.startsWith(`${d}/`) && PAGE_FILE.test(p.slice(p.lastIndexOf("/") + 1)))) ?? null;
  const pagesDir = ["src/pages", "pages"].find((d) => paths.some((p) => p.startsWith(`${d}/`) && /\.(?:tsx|jsx|ts|js|mdx)$/.test(p))) ?? null;
  const routes: Route[] = [];
  for (const p of paths) {
    const file = p.slice(p.lastIndexOf("/") + 1);
    if (appDir && p.startsWith(`${appDir}/`) && (PAGE_FILE.test(file) || ROUTE_FILE.test(file))) {
      const dirs = p.slice(appDir.length + 1).split("/").slice(0, -1);
      // Route groups and parallel slots do not add a URL segment; private folders are not routes.
      if (dirs.some((d) => d.startsWith("_"))) continue;
      routes.push({ segments: dirs.filter((d) => !/^\(.*\)$/.test(d) && !d.startsWith("@")) });
    } else if (pagesDir && p.startsWith(`${pagesDir}/`) && /\.(?:tsx|jsx|ts|js|mdx)$/.test(file) && !/^_(?:app|document|error)\./.test(file) && !p.startsWith(`${pagesDir}/api/`)) {
      const parts = p.slice(pagesDir.length + 1).replace(/\.(?:tsx|jsx|ts|js|mdx)$/, "").split("/");
      if (parts[parts.length - 1] === "index") parts.pop();
      routes.push({ segments: parts });
    }
  }
  return { routes, appDir, hasRouter: !!(appDir || pagesDir) };
}

function matches(route: Route, url: string[]): boolean {
  const seg = route.segments;
  for (let i = 0; i < seg.length; i++) {
    const s = seg[i]!;
    if (/^\[\[\.\.\..+\]\]$/.test(s)) return true;
    if (/^\[\.\.\..+\]$/.test(s)) return url.length > i;
    if (i >= url.length) return false;
    if (/^\[.+\]$/.test(s)) continue;
    if (decodeURIComponent(s) !== url[i]) return false;
  }
  return seg.length === url.length;
}

/** Internal hrefs in a source: `href="/x"`, `href={"/x"}`, `href: "/x"` (path only, no query or hash). */
export function internalHrefs(code: string): { path: string; offset: number }[] {
  const out: { path: string; offset: number }[] = [];
  let strings;
  try {
    strings = lex(code).strings;
  } catch {
    return out;
  }
  for (const s of strings) {
    const v = s.value;
    if (!v.startsWith("/") || v.startsWith("//") || v.includes("${") || /\s/.test(v)) continue;
    const before = code.slice(Math.max(0, s.start - 24), s.start);
    if (!/\bhref\s*[:=]\s*\{?\s*$/.test(before)) continue;
    const path = v.replace(/[?#].*$/, "");
    if (path) out.push({ path, offset: s.start + 1 });
  }
  return out;
}

function lineCol(code: string, offset: number): { line: number; column: number } {
  const before = code.slice(0, offset);
  const line = before.split("\n").length;
  return { line, column: offset - before.lastIndexOf("\n") };
}

/** True when the project builds a public website with the kit's site blocks. */
export function usesSiteBlocks(input: ProjectCheckInput): boolean {
  if (input.paths.some((p) => /(?:^|\/)blocks\/(?:site|page|legal)-[a-z0-9-]+\//.test(p))) return true;
  return input.sources.some((s) => /from\s+["'][^"']*\/blocks["']/.test(s.content) && /<(?:SiteShell|Footer|Navbar)\b/.test(s.content));
}

/** Runs the project checks. Issues carry the file they belong to. */
export function verifyProject(input: ProjectCheckInput): ProjectIssue[] {
  const issues: ProjectIssue[] = [];
  const paths = new Set(input.paths);
  const { routes, appDir, hasRouter } = collectRoutes(input.paths);

  // --- links to routes with no page -----------------------------------------------
  if (hasRouter) {
    const reported = new Set<string>();
    for (const src of input.sources) {
      for (const h of internalHrefs(src.content)) {
        const clean = h.path.replace(/\/+$/, "") || "/";
        if (/\.[a-z0-9]{2,5}$/i.test(clean) && paths.has(`public${clean}`)) continue;
        const url = clean === "/" ? [] : clean.slice(1).split("/");
        if (routes.some((r) => matches(r, url))) continue;
        const key = `${src.path}:${clean}`;
        if (reported.has(key)) continue;
        reported.add(key);
        issues.push({
          file: src.path,
          rule: "missing-route",
          severity: "warning",
          message: `Link to ${clean} has no page in the app, so it returns 404.`,
          fix: /^\/(?:privacy|gizlilik|kvkk|terms|cookies|cerez|kullanim|accessibility|erisilebilirlik)/.test(clean)
            ? "Run `npx vamos-ui site essentials` to write the legal pages (legal-01), or remove the link."
            : `Create ${appDir ?? "app"}${clean}/page.tsx, add a redirect, or remove the link.`,
          ...lineCol(src.content, h.offset),
        });
      }
    }
  }

  // --- launch basics for a website ------------------------------------------------
  if (appDir && usesSiteBlocks(input)) {
    const has = (re: RegExp) => input.paths.some((p) => re.test(p));
    const push = (file: string, message: string, fix: string) => issues.push({ file, rule: "site-essentials", severity: "warning", message, fix, line: 1, column: 1 });
    const essentials = "Run `npx vamos-ui site essentials` to write it.";
    if (!has(new RegExp(`^(?:${appDir}/robots\\.(?:ts|js|txt)|public/robots\\.txt)$`))) push(`${appDir}/robots.ts`, "No robots.txt (app/robots.ts or public/robots.txt).", essentials);
    if (!has(new RegExp(`^(?:${appDir}/sitemap\\.(?:ts|js|xml)|public/sitemap\\.xml)$`))) push(`${appDir}/sitemap.ts`, "No sitemap.xml (app/sitemap.ts or public/sitemap.xml).", essentials);
    const layoutPath = input.paths.find((p) => new RegExp(`^${appDir}/layout\\.(?:tsx|jsx|ts|js)$`).test(p));
    const layout = input.sources.find((s) => s.path === layoutPath)?.content ?? "";
    const all = input.sources.map((s) => s.content).join("\n");
    if (layoutPath) {
      if (!/\bmetadataBase\b/.test(layout)) push(layoutPath, "Root metadata has no metadataBase, so canonical and Open Graph URLs stay relative.", 'Add metadataBase: new URL("https://your-domain") to the root layout metadata.');
      if (!/\bopenGraph\b/.test(layout)) push(layoutPath, "Root metadata has no openGraph (title, description, image, locale), so shared links show no preview.", "Add openGraph: { siteName, locale, type: \"website\", images } to the root layout metadata.");
    }
    if (!/\balternates\s*:\s*\{[^}]*canonical/.test(all)) push(layoutPath ?? `${appDir}/layout.tsx`, "No canonical URL (alternates.canonical) on any page.", 'Set alternates: { canonical: "/" } in the root metadata and the page path on each page.');
    const hasLd = /application\/ld\+json|<JsonLd\b/.test(all) || (/<Footer\b/.test(all) && !/jsonLd=\{false\}/.test(all));
    if (!hasLd) {
      push(layoutPath ?? `${appDir}/layout.tsx`, "No JSON-LD structured data (Organization / LocalBusiness).", "The kit Footer emits Organization JSON-LD; or render <JsonLd data={…} /> with the business type, address, phone and opening hours.");
    }
  }
  return issues;
}
