/**
 * Project-level website checks (part of vamos-ui/verify): links to routes that have no page,
 * and the launch basics a public site needs (robots, sitemap, metadataBase, canonical, Open
 * Graph, JSON-LD). Pure: the caller hands in the project's file list and the sources it read,
 * so the CLI and the MCP server share it.
 */

import { lex } from "./lexer";
import { SITE_FILE, missingSiteFields, parseSiteJson } from "./site-info";
import type { VerifyIssue, VerifyRule } from "./verify";

export const PROJECT_RULES: readonly VerifyRule[] = [
  { id: "missing-route", severity: "warning", description: "An internal link points to a route with no page in the app (it will 404)." },
  { id: "site-essentials", severity: "warning", description: "A website without robots, sitemap, metadataBase, canonical URLs, Open Graph or JSON-LD." },
  { id: "meta-length", severity: "warning", description: "A page title over 60 characters or a meta description outside 70–160 characters (search results cut or ignore it)." },
  { id: "image-weight", severity: "warning", description: "An image in public/ over 300 KB (slow first load on mobile)." },
  { id: "site-info", severity: "warning", description: "vamos.site.json with empty required fields (name, url, phone or email, city; MERSİS and ETBİS for a shop), or a website without llms.txt." },
];

/** Search results show about 60 title characters and 70–160 description characters. */
export const META_LIMITS = { title: 60, descriptionMin: 70, descriptionMax: 160 } as const;
/** Images in public/ above this many bytes get a warning. */
export const IMAGE_WEIGHT_LIMIT = 300 * 1024;
const RASTER = /\.(?:jpe?g|png|webp|avif|gif)$/i;

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
  /** Optional byte sizes by project-relative path (at least for images in public/), for the image-weight check. */
  sizes?: Record<string, number>;
  /** Raw contents of vamos.site.json at the project root, when it exists (for the site-info check). */
  siteJson?: string;
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

/**
 * Literal `title` / `description` values in Next.js metadata (`export const metadata`,
 * `generateMetadata`, openGraph/twitter blocks). Template strings with `${…}` are skipped.
 */
export function metadataStrings(code: string): { key: "title" | "description"; value: string; offset: number }[] {
  let strings;
  try {
    strings = lex(code).strings;
  } catch {
    return [];
  }
  // Only the metadata object / generateMetadata body: `title` and `description` keys elsewhere
  // in the file (card data, props) are content, not metadata.
  const regions: [number, number][] = [];
  const mask = new Uint8Array(code.length);
  for (const s of strings) mask.fill(1, s.start, s.end);
  const inString = (i: number) => mask[i] === 1;
  const head = /export\s+(?:const\s+metadata\b[^=]*=|(?:async\s+)?function\s+generateMetadata\s*\([^)]*\)[^{]*)/g;
  for (let m; (m = head.exec(code)); ) {
    let i = code.indexOf("{", m.index + m[0].length);
    if (i < 0) continue;
    const start = i;
    let depth = 0;
    for (; i < code.length; i++) {
      if (inString(i)) continue;
      if (code[i] === "{") depth++;
      else if (code[i] === "}" && --depth === 0) break;
    }
    regions.push([start, i]);
  }
  if (!regions.length) return [];
  const out: { key: "title" | "description"; value: string; offset: number }[] = [];
  for (const s of strings) {
    if (s.value.includes("${") || !regions.some(([a, b]) => s.start > a && s.start < b)) continue;
    const before = code.slice(Math.max(0, s.start - 40), s.start);
    const m = /\b(title|description|default)\s*:\s*$/.exec(before);
    if (!m) continue;
    // `title: { default: "…", template: "%s · Brand" }`: the default is the title.
    if (m[1] === "default" && !/\btitle\s*:\s*\{[^{}]*$/.test(code.slice(Math.max(0, s.start - 200), s.start))) continue;
    out.push({ key: m[1] === "description" ? "description" : "title", value: s.value, offset: s.start + 1 });
  }
  return out;
}

function fmtKB(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
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
          fix: /^\/(?:privacy|gizlilik|kvkk|terms|cookies|cerez|kullanim|accessibility|erisilebilirlik|returns|refund|iade|cayma|distance-sales|mesafeli|pre-information|on-bilgilendirme|legal-notice|imprint|impressum|yasal-uyari)/.test(clean)
            ? "Run `npx vamos-ui site essentials` to write the legal pages (legal-01), or remove the link."
            : `Create ${appDir ?? "app"}${clean}/page.tsx, add a redirect, or remove the link.`,
          ...lineCol(src.content, h.offset),
        });
      }
    }
  }

  // --- vamos.site.json ------------------------------------------------------------
  const info = (file: string, message: string, fix: string) => issues.push({ file, rule: "site-info", severity: "warning", message, fix, line: 1, column: 1 });
  const parsed = input.siteJson !== undefined ? parseSiteJson(input.siteJson) : null;
  if (parsed?.error) info(SITE_FILE, parsed.error, "Fix the JSON; `npx vamos-ui site init` shows the expected shape.");
  if (parsed?.site) {
    const ecommerce = input.paths.some((p) => /(?:^|\/)blocks\/(?:cart-01|checkout-01|site-store-[a-z0-9-]+)\//.test(p));
    const missing = missingSiteFields(parsed.site, { ecommerce });
    if (missing.length) {
      const shop = missing.some((m) => m.startsWith("legal.")) ? " An online shop selling in Turkey must show its MERSİS number and ETBİS registration." : "";
      info(SITE_FILE, `${SITE_FILE} has no ${missing.join(", ")}.${shop}`, "Fill in the business's own details; llms.txt, JSON-LD and the legal pages read them.");
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

    // llms.txt: a summary of the business for AI assistants.
    const llmsOff = parsed?.site?.ai?.llmsTxt === false;
    if (!llmsOff && !has(new RegExp(`^(?:${appDir}/llms\\.txt/route\\.(?:ts|js)|public/llms\\.txt)$`))) {
      info(
        `${appDir}/llms.txt/route.ts`,
        "No llms.txt (app/llms.txt/route.ts or public/llms.txt), so AI assistants get no summary of the business.",
        parsed?.site ? "Run `npx vamos-ui site essentials` to write it from vamos.site.json." : "Run `npx vamos-ui site init`, fill in vamos.site.json, then `npx vamos-ui site essentials`.",
      );
    }

    // Title and description lengths in page/layout metadata.
    for (const src of input.sources) {
      if (!src.path.startsWith(`${appDir}/`)) continue;
      for (const m of metadataStrings(src.content)) {
        const n = [...m.value].length;
        // A "%s · Brand" template adds the brand, so only flag clearly long titles.
        const message =
          m.key === "title"
            ? n > META_LIMITS.title
              ? `Title is ${n} characters; search results cut it after about ${META_LIMITS.title}.`
              : null
            : n < META_LIMITS.descriptionMin
              ? `Meta description is ${n} characters; under ${META_LIMITS.descriptionMin} Google usually replaces it with page text.`
              : n > META_LIMITS.descriptionMax
                ? `Meta description is ${n} characters; search results cut it after about ${META_LIMITS.descriptionMax}.`
                : null;
        if (!message) continue;
        issues.push({
          file: src.path,
          rule: "meta-length",
          severity: "warning",
          message,
          fix: m.key === "title" ? "Lead with what the page is and where (\"Ceramics studio in Kadıköy\"), brand last." : "Write one or two sentences (70–160 characters) that say what the visitor gets and why this business.",
          ...lineCol(src.content, m.offset),
        });
      }
    }
  }

  // --- heavy images in public/ ---------------------------------------------------
  if (input.sizes) {
    for (const p of input.paths) {
      if (!p.startsWith("public/") || !RASTER.test(p)) continue;
      const size = input.sizes[p];
      if (size === undefined || size <= IMAGE_WEIGHT_LIMIT) continue;
      issues.push({
        file: p,
        rule: "image-weight",
        severity: "warning",
        message: `${p} is ${fmtKB(size)}; images over ${fmtKB(IMAGE_WEIGHT_LIMIT)} slow the first load on mobile.`,
        fix: "Resize to the largest size it is shown at (2× for retina), export as WebP or AVIF, and render it with next/image and a sizes attribute.",
        line: 1,
        column: 1,
      });
    }
  }
  return issues;
}
