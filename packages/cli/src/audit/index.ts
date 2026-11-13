/**
 * `vamos-ui audit <url>`: checks a live website over HTTP (no browser, no project files) for
 * launch basics: fetch and redirects, head metadata, robots/sitemap/llms.txt, content and
 * placeholder data, legal links, broken internal links and heavy images.
 *
 * Library entry "vamos-ui/audit": pure, no Node built-ins (global fetch only). The fetch
 * function and a URL guard are injectable, so the MCP server can refuse private addresses.
 */

import { isPlaceholderNumber } from "../verify";
import { AuditRefusedError, pool, probe, request, type FetchLike, type Fetched, type HttpOptions } from "./fetch";
import { AI_CRAWLERS, aiCrawlerPolicy, isAllowed, parseRobots, parseSitemap, type CrawlerAccess, type Robots } from "./files";

const AI_CRAWLER_COUNT = AI_CRAWLERS.length;
import { analyzePage, type PageFacts } from "./page";

export { AuditRefusedError, type FetchLike } from "./fetch";
export { analyzePage, type PageFacts, type PageLink } from "./page";
export { aiCrawlerPolicy, isAllowed, parseRobots, parseSitemap, AI_CRAWLERS } from "./files";
export { tokenize, parseAttrs, decodeEntities } from "./html";

export type AuditSeverity = "error" | "warning" | "info";

export interface AuditIssue {
  rule: string;
  severity: AuditSeverity;
  message: string;
  /** The page it was found on. */
  url?: string;
  fix?: string;
}

export interface AuditOptions {
  /** Injectable fetch (tests, proxies). Defaults to the global fetch. */
  fetch?: FetchLike;
  /** HTML pages to crawl, including the start page (default 30, max 200). */
  maxPages?: number;
  /** Requests in flight (default 6). */
  concurrency?: number;
  /** Per-request timeout in ms (default 10 000). */
  timeoutMs?: number;
  /** Whole-audit time limit in ms (default 120 000). Work left when it runs out is skipped and reported. */
  deadlineMs?: number;
  /** Bytes read from one response (default 5 MB). */
  maxBytes?: number;
  /** Also check external links (HEAD, fallback GET). */
  external?: boolean;
  /** Internal links checked beyond the crawled pages (default 150). */
  maxLinks?: number;
  /** External links checked with `external` (default 100). */
  maxExternal?: number;
  /** Images whose size is checked (default 40). */
  maxImages?: number;
  userAgent?: string;
  /** Called before every request and redirect hop; throw AuditRefusedError to refuse a URL. */
  guard?: (url: URL) => void | Promise<void>;
  /** Also request the http:// and www/non-www variants of the start URL (default true). */
  hostVariants?: boolean;
}

export interface AuditReport {
  url: string;
  finalUrl: string;
  startedAt: string;
  durationMs: number;
  score: number;
  summary: { errors: number; warnings: number; info: number };
  fetch: {
    status: number;
    redirects: { url: string; status: number }[];
    timeMs: number;
    htmlBytes: number;
    compression: string | null;
    https: boolean;
    httpRedirectsToHttps: boolean | null;
    hostVariant: { url: string; result: string } | null;
    securityHeaders: Record<string, boolean>;
  };
  head: {
    lang: string | null;
    title: string | null;
    description: string | null;
    canonical: string | null;
    og: Record<string, string>;
    twitterCard: string | null;
    favicon: string | null;
    jsonLdTypes: string[];
    hreflang: string[];
  } | null;
  files: {
    robots: { found: boolean; sitemaps: string[]; blocksAll: boolean } | null;
    sitemap: { url: string; found: boolean; valid: boolean; kind: string | null; urls: number } | null;
    llmsTxt: boolean | null;
    aiCrawlers: { agent: string; owner: string; access: CrawlerAccess }[];
  };
  legal: { kind: string; url: string; status: number | null }[];
  crawl: {
    pages: { url: string; status: number; title: string | null }[];
    linksChecked: number;
    externalChecked: number;
    imagesChecked: number;
    skippedByRobots: number;
    truncated: boolean;
  };
  issues: AuditIssue[];
}

export const AUDIT_DEFAULTS = { maxPages: 30, maxPagesCap: 200, concurrency: 6, timeoutMs: 10_000, deadlineMs: 120_000, maxBytes: 5 * 1024 * 1024, maxLinks: 150, maxExternal: 100, maxImages: 40 } as const;
/** Same limit as the source check (image-weight). */
export const AUDIT_IMAGE_LIMIT = 300 * 1024;
export const META_LIMITS = { title: 60, descriptionMin: 70, descriptionMax: 160 } as const;
export const DEFAULT_USER_AGENT = "vamos-ui-audit (+https://ui.vamos.ist/docs/cli)";

/** One line per rule: what it checks and how to fix it. */
export const AUDIT_RULES: Record<string, { severity: AuditSeverity; title: string; fix?: string }> = {
  "fetch-failed": { severity: "error", title: "Page could not be loaded", fix: "Check DNS, TLS and that the server answers." },
  "refused-address": { severity: "error", title: "Address refused", fix: "Only public http(s) addresses can be audited here." },
  "http-status": { severity: "error", title: "Start page does not return 200" },
  "no-https": { severity: "error", title: "Site is served over plain http", fix: "Serve over HTTPS and redirect http:// to https://." },
  "http-not-redirected": { severity: "warning", title: "http:// does not redirect to https://", fix: "Add a permanent (301/308) redirect from http:// to https://." },
  "host-duplicate": { severity: "warning", title: "www and non-www both serve the site", fix: "Pick one host and 301-redirect the other to it." },
  "redirect-chain": { severity: "warning", title: "Long redirect chain", fix: "Redirect straight to the final URL in one hop." },
  "slow-response": { severity: "warning", title: "Slow response" },
  "page-weight": { severity: "warning", title: "Heavy HTML" },
  "no-compression": { severity: "warning", title: "HTML is not compressed", fix: "Enable gzip or Brotli on the server or CDN." },
  "security-headers": { severity: "info", title: "Security headers" },
  noindex: { severity: "error", title: "Page asks search engines not to index it", fix: 'Remove noindex (meta robots or X-Robots-Tag) from public pages.' },
  "html-lang": { severity: "warning", title: "Missing <html lang>", fix: 'Set <html lang="en"> (or the page language) so screen readers and search engines read it right.' },
  viewport: { severity: "warning", title: "Missing viewport meta", fix: '<meta name="viewport" content="width=device-width, initial-scale=1">' },
  title: { severity: "error", title: "Missing <title>" },
  "meta-length": { severity: "warning", title: "Title or description length", fix: "Keep titles under 60 characters and descriptions between 70 and 160." },
  "meta-description": { severity: "warning", title: "Missing meta description" },
  canonical: { severity: "warning", title: "Canonical URL", fix: 'Add <link rel="canonical" href="…"> with the page’s own absolute URL.' },
  "open-graph": { severity: "warning", title: "Open Graph tags", fix: "Add og:title, og:description, og:image (absolute URL, 1200×630) and og:url for link previews." },
  "twitter-card": { severity: "info", title: "Twitter card", fix: '<meta name="twitter:card" content="summary_large_image">' },
  favicon: { severity: "warning", title: "No favicon" },
  "json-ld": { severity: "info", title: "Structured data (JSON-LD)", fix: "Describe the business with JSON-LD (Organization / LocalBusiness / Product …)." },
  "json-ld-invalid": { severity: "error", title: "JSON-LD does not parse", fix: "Fix the JSON syntax; search engines ignore the whole block." },
  hreflang: { severity: "info", title: "Language alternates" },
  robots: { severity: "warning", title: "robots.txt" },
  "robots-blocks-all": { severity: "error", title: "robots.txt blocks every crawler", fix: 'Replace "Disallow: /" for User-agent: * with the paths you really want hidden.' },
  sitemap: { severity: "warning", title: "sitemap.xml" },
  "sitemap-invalid": { severity: "error", title: "sitemap.xml is not a valid sitemap" },
  "llms-txt": { severity: "info", title: "No /llms.txt", fix: "Optional: a short Markdown summary for AI assistants at /llms.txt." },
  "ai-crawlers": { severity: "info", title: "AI crawler policy" },
  h1: { severity: "warning", title: "Heading structure", fix: "Use exactly one <h1> that says what the page is about." },
  "image-alt": { severity: "warning", title: "Images without alt", fix: 'Describe meaningful images in alt; use alt="" for decorative ones.' },
  "accessible-name": { severity: "warning", title: "Links or buttons without a name", fix: "Give icon-only links and buttons an aria-label." },
  "dead-link": { severity: "warning", title: 'href="#" or empty href', fix: "Link to the real page or anchor, or use a <button> for an action." },
  "placeholder-content": { severity: "error", title: "Placeholder content", fix: "Use the business’s real details before launch, or remove the item." },
  "map-link": { severity: "info", title: "Map short links", fix: "Open each one and check it lands on the real business listing." },
  "contact-links": { severity: "info", title: "No mailto: or tel: links" },
  "client-rendered": { severity: "warning", title: "Little server-rendered content", fix: "Render the main content on the server (SSR/SSG) so crawlers and link previews see it." },
  "legal-links": { severity: "warning", title: "Legal pages", fix: "Link the privacy policy (and KVKK notice / cookie policy where they apply) from the footer." },
  "legal-broken": { severity: "error", title: "Legal page link is broken" },
  "broken-link": { severity: "error", title: "Broken internal link" },
  "link-unreachable": { severity: "warning", title: "Link could not be checked" },
  "redirecting-link": { severity: "info", title: "Internal links that redirect", fix: "Link to the final URL directly." },
  "broken-external": { severity: "warning", title: "Broken external link" },
  "broken-image": { severity: "warning", title: "Broken image" },
  "image-weight": { severity: "warning", title: "Heavy images", fix: "Serve images under 300 KB: resize to the displayed size and use WebP/AVIF." },
  "duplicate-title": { severity: "warning", title: "Pages share a title", fix: "Give every page its own title and description." },
  "sitemap-broken": { severity: "error", title: "sitemap.xml lists a broken URL", fix: "Regenerate the sitemap from the pages that exist." },
  truncated: { severity: "info", title: "Audit stopped early" },
  "not-checked": { severity: "info", title: "Not everything was checked", fix: "Raise --max-pages, or run the audit on the pages that matter most." },
};

const ASSET = /\.(?:jpe?g|png|gif|webp|avif|svg|ico|bmp|tiff?|pdf|zip|rar|7z|gz|tar|mp3|mp4|m4a|mov|avi|webm|ogg|wav|woff2?|ttf|otf|eot|css|js|mjs|json|xml|txt|csv|docx?|xlsx?|pptx?|apk|dmg|exe)$/i;
const FILL_IN = /(?<![\w-])\[[A-ZÇĞİÖŞÜ][\p{L}\p{N} .,'’/&()-]{2,48}\]/u;
const EXAMPLE_EMAIL = /^[\w.+-]+@(?:[\w-]+\.)*(?:example\.(?:com|org|net)|ornek\.com(?:\.tr)?|[\w-]+\.example|example)$/i;
const EXAMPLE_HOST = /^(?:[\w-]+\.)*(?:example\.(?:com|org|net)|ornek\.com(?:\.tr)?|[\w-]+\.example)$/i;
const MAP_SHORT = /^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|g\.page)\/([^/?#]+)/i;
const WA_LINK = /^https?:\/\/(?:wa\.me\/|api\.whatsapp\.com\/send\/?\?phone=)\+?(\d+)/i;

/** Placeholder phone digits: the source check's rule, plus runs like 000 00 00 with no area code. */
export function isPlaceholderPhone(digits: string): boolean {
  return isPlaceholderNumber(digits) || /^(\d)\1{6,}$/.test(digits) || /^0*(\d)\1{6,}$/.test(digits);
}

const LEGAL: { kind: string; label: string; slug: RegExp; text: RegExp }[] = [
  { kind: "privacy", label: "privacy policy", slug: /^(?:privacy(?:-policy|-notice)?|gizlilik(?:-politikasi|-sozlesmesi|-bildirimi)?|datenschutz(?:erklarung)?)$/, text: /\bprivacy\b|gizlilik|datenschutz/i },
  { kind: "kvkk", label: "KVKK notice", slug: /^(?:kvkk(?:-[\w-]+)?|aydinlatma-metni|kisisel-veriler(?:in-korunmasi)?(?:-[\w-]+)?)$/, text: /\bkvkk\b|aydınlatma metni|kişisel verilerin korunması/i },
  { kind: "cookies", label: "cookie policy", slug: /^(?:cookies?(?:-policy)?|cerez(?:ler|-politikasi)?)$/, text: /\bcookie|çerez/i },
  { kind: "terms", label: "terms", slug: /^(?:terms(?:-of-(?:service|use))?|terms-and-conditions|tos|kullanim-(?:kosullari|sartlari)|yasal-uyari|legal(?:-notice)?|imprint|impressum)$/, text: /\bterms\b|kullanım koşulları|kullanım şartları|yasal uyarı|\bimprint\b|impressum/i },
  { kind: "sales", label: "returns / distance sales", slug: /^(?:iade(?:-[\w-]+)?|returns?(?:-policy)?|refunds?(?:-policy)?|mesafeli-satis(?:-sozlesmesi)?|on-bilgilendirme(?:-formu)?)$/, text: /\biade\b|mesafeli satış|ön bilgilendirme|\brefund|\breturns? policy/i },
];

function legalKind(link: { url: string | null; text: string }): string | null {
  return legalKinds(link)[0] ?? null;
}

/** Every legal page a link stands for: its address first, then its text ("Gizlilik ve KVKK" on /gizlilik is both). */
function legalKinds(link: { url: string | null; text: string }): string[] {
  if (!link.url) return [];
  let seg = "";
  try {
    seg = new URL(link.url).pathname.replace(/\/+$/, "").split("/").pop()!.replace(/\.(?:html?|php|aspx?)$/i, "").toLowerCase();
  } catch {
    return [];
  }
  const kinds: string[] = [];
  for (const l of LEGAL) if (seg && l.slug.test(seg)) kinds.push(l.kind);
  const text = link.text.toLowerCase();
  if (text.length <= 60) for (const l of LEGAL) if (l.text.test(text) && !kinds.includes(l.kind)) kinds.push(l.kind);
  return kinds;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const kb = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);
const sample = (items: string[], n = 3) => items.slice(0, n).map((s) => `"${s.length > 60 ? `${s.slice(0, 57)}…` : s}"`).join(", ") + (items.length > n ? ` and ${items.length - n} more` : "");

/** Normalised URL used as a map key: no hash, no default port. */
function key(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.href;
  } catch {
    return url;
  }
}

/** Checks that need only one page's HTML. `start` adds the site-wide head checks. */
export function pageIssues(facts: PageFacts, start: boolean): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const url = facts.url;
  const push = (rule: string, message: string, severity: AuditSeverity = AUDIT_RULES[rule]?.severity ?? "warning") =>
    issues.push({ rule, severity, message, url, fix: AUDIT_RULES[rule]?.fix });

  if (facts.robots && /\bnoindex\b/i.test(facts.robots)) push("noindex", `meta robots is "${facts.robots}".`, start ? "error" : "info");
  if (!facts.title) push("title", "The page has no <title>.");
  else if ([...facts.title].length > META_LIMITS.title) push("meta-length", `Title is ${[...facts.title].length} characters (search results show about ${META_LIMITS.title}): "${facts.title}".`);
  if (facts.description === null || facts.description === "") push("meta-description", "No meta description: search engines will pick a snippet themselves.");
  else {
    const len = [...facts.description].length;
    if (len < META_LIMITS.descriptionMin) push("meta-length", `Meta description is ${len} characters (aim for ${META_LIMITS.descriptionMin}–${META_LIMITS.descriptionMax}).`);
    else if (len > META_LIMITS.descriptionMax) push("meta-length", `Meta description is ${len} characters; search results cut it at about ${META_LIMITS.descriptionMax}.`);
  }
  if (!facts.canonical) {
    if (start) push("canonical", 'No <link rel="canonical">.');
  } else {
    try {
      const c = new URL(facts.canonical);
      const p = new URL(url);
      const norm = (u: URL) => `${u.host}${u.pathname.replace(/\/+$/, "")}`;
      if (c.host !== p.host) push("canonical", `Canonical points to another host: ${facts.canonical}.`);
      else if (norm(c) !== norm(p) && !p.search) push("canonical", `Canonical points elsewhere: ${facts.canonical} (this page is ${url}).`, start ? "warning" : "info");
    } catch {
      push("canonical", `Canonical "${facts.canonical}" is not a valid URL.`);
    }
  }
  if (facts.h1.length === 0) push("h1", "No <h1> on the page.");
  else if (facts.h1.length > 1) push("h1", `${facts.h1.length} <h1> elements: ${sample(facts.h1)}.`);

  const noAlt = facts.images.filter((i) => i.alt === null);
  if (noAlt.length) push("image-alt", `${plural(noAlt.length, "image")} without alt: ${sample(noAlt.map((i) => i.src ?? "(no src)"))}.`);
  const unnamedLinks = facts.links.filter((l) => l.unnamed);
  if (unnamedLinks.length || facts.unnamedButtons) {
    const parts = [unnamedLinks.length ? `${plural(unnamedLinks.length, "link")} (${sample(unnamedLinks.map((l) => l.href))})` : "", facts.unnamedButtons ? plural(facts.unnamedButtons, "button") : ""].filter(Boolean);
    push("accessible-name", `${parts.join(" and ")} with no text or aria-label.`);
  }
  if (facts.deadLinks) push("dead-link", `${plural(facts.deadLinks, "link")} with href="#" or an empty href.`);

  // Placeholder data: hrefs first, then visible text.
  const placeholders = new Set<string>();
  const maps: string[] = [];
  let contact = false;
  for (const l of facts.links) {
    const h = l.href;
    if (/^tel:/i.test(h)) {
      contact = true;
      const digits = h.replace(/\D/g, "");
      if (digits.length >= 7 && isPlaceholderPhone(digits)) placeholders.add(`phone link ${h}`);
    } else if (/^mailto:/i.test(h)) {
      contact = true;
      const addr = decodeURIComponent(h.slice(7).split("?")[0]!).trim();
      if (EXAMPLE_EMAIL.test(addr)) placeholders.add(`email ${addr}`);
    } else if (l.url) {
      const wa = WA_LINK.exec(l.url);
      if (wa) {
        contact = true;
        if (isPlaceholderPhone(wa[1]!)) placeholders.add(`WhatsApp link ${l.url}`);
        continue;
      }
      const map = MAP_SHORT.exec(l.url);
      if (map) {
        // maps.app.goo.gl ids are random mixed-case strings; g.page/<name> can be a real custom name.
        if (!/g\.page\//i.test(l.url) && /^[a-z-]+$/.test(map[1]!)) placeholders.add(`invented map link ${l.url}`);
        else maps.push(l.url);
        continue;
      }
      try {
        if (EXAMPLE_HOST.test(new URL(l.url).hostname)) placeholders.add(`link to ${l.url}`);
      } catch {
        /* ignore */
      }
    }
  }
  const text = facts.text;
  // Numbers and addresses that appear only as text may be quoted on purpose (docs, examples): warn.
  const soft = new Set<string>();
  for (const m of text.matchAll(/(?:\+|\b0)?\d[\d ().-]{5,18}\d/g)) {
    const raw = m[0];
    if (!/[ .-]/.test(raw) && !/^[+0]/.test(raw)) continue;
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15 && isPlaceholderPhone(digits)) soft.add(`number "${raw.trim()}"`);
  }
  for (const m of text.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) if (EXAMPLE_EMAIL.test(m[0]) && !placeholders.has(`email ${m[0]}`)) soft.add(`email ${m[0]}`);
  if (/\blorem ipsum\b/i.test(text)) placeholders.add('"Lorem ipsum" text');
  const fills = [...text.matchAll(new RegExp(FILL_IN.source, "gu"))].map((m) => m[0]);
  if (fills.length) placeholders.add(`${plural(fills.length, "[fill-in] field")} such as ${fills[0]}`);
  const listed = (set: Set<string>) => `${[...set].slice(0, 6).join("; ")}${set.size > 6 ? ` and ${set.size - 6} more` : ""}`;
  if (placeholders.size) push("placeholder-content", `Placeholder content left in: ${listed(placeholders)}.`);
  if (soft.size) push("placeholder-content", `Text that looks like placeholder contact data: ${listed(soft)}.`, "warning");
  if (maps.length) push("map-link", `${plural(maps.length, "map short link")}: ${[...new Set(maps)].slice(0, 3).join(", ")}. Check these open the real listing.`);

  const words = text ? text.split(" ").length : 0;
  if (words < 40 && facts.scripts > 0) push("client-rendered", `Only ${plural(words, "word")} of text in the HTML; the rest is drawn by JavaScript, which many crawlers and link previews do not run.`);

  if (start) {
    if (!facts.lang) push("html-lang", "<html> has no lang attribute.");
    if (!facts.viewport) push("viewport", 'No <meta name="viewport">: phones show the desktop layout zoomed out.');
    const missingOg = ["title", "description", "image", "url"].filter((k) => !facts.og[k]);
    if (missingOg.length) push("open-graph", `Missing ${missingOg.map((k) => `og:${k}`).join(", ")}.`);
    else if (!/^https?:\/\//i.test(facts.og.image!)) push("open-graph", `og:image "${facts.og.image}" is not an absolute URL; most previews need one.`);
    if (!facts.twitter.card) push("twitter-card", "No twitter:card meta (X/Twitter falls back to a small preview).");
    const broken = facts.jsonLd.filter((j) => !j.ok);
    for (const b of broken) push("json-ld-invalid", `A JSON-LD block does not parse: ${b.error}.`);
    if (!facts.jsonLd.length) push("json-ld", "No JSON-LD structured data.");
    if (facts.hreflang.length && !facts.hreflang.some((h) => h.lang.toLowerCase() === "x-default")) push("hreflang", `hreflang alternates (${facts.hreflang.map((h) => h.lang).join(", ")}) without x-default.`);
    if (!contact) push("contact-links", "No mailto: or tel: link on the start page; visitors on phones cannot tap to call or write.");
  }
  return issues;
}

function score(issues: AuditIssue[]): number {
  const rules = new Map<string, AuditSeverity>();
  for (const i of issues) {
    const prev = rules.get(i.rule);
    if (prev === "error" || (prev === "warning" && i.severity === "info")) continue;
    rules.set(i.rule, i.severity);
  }
  let s = 100;
  for (const sev of rules.values()) s -= sev === "error" ? 12 : sev === "warning" ? 5 : 0;
  return Math.max(0, s);
}

/** Adds https:// to a bare host and checks the protocol. */
export function normalizeAuditUrl(input: string): string {
  const raw = input.trim();
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  const u = new URL(withScheme);
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new AuditRefusedError(`Only http and https URLs can be audited (got ${u.protocol}).`);
  u.hash = "";
  return u.href;
}

interface PageRecord {
  url: string;
  status: number;
  finalUrl: string;
  facts: PageFacts | null;
  error?: string;
}

export async function runAudit(input: string, options: AuditOptions = {}): Promise<AuditReport> {
  const startedMs = Date.now();
  const deadlineMs = options.deadlineMs ?? AUDIT_DEFAULTS.deadlineMs;
  const maxPages = Math.max(1, Math.min(options.maxPages ?? AUDIT_DEFAULTS.maxPages, AUDIT_DEFAULTS.maxPagesCap));
  const concurrency = Math.max(1, Math.min(options.concurrency ?? AUDIT_DEFAULTS.concurrency, 16));
  const fetchFn: FetchLike = options.fetch ?? ((url, init) => fetch(url, init));
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const http: HttpOptions = {
    fetch: fetchFn,
    userAgent,
    timeoutMs: options.timeoutMs ?? AUDIT_DEFAULTS.timeoutMs,
    maxBytes: options.maxBytes ?? AUDIT_DEFAULTS.maxBytes,
    maxRedirects: 10,
    guard: options.guard,
    remaining: () => deadlineMs - (Date.now() - startedMs),
  };
  const issues: AuditIssue[] = [];
  const push = (rule: string, message: string, url?: string, severity: AuditSeverity = AUDIT_RULES[rule]?.severity ?? "warning") =>
    issues.push({ rule, severity, message, url, fix: AUDIT_RULES[rule]?.fix });
  let truncated = false;

  const url = normalizeAuditUrl(input);
  const report: AuditReport = {
    url,
    finalUrl: url,
    startedAt: new Date(startedMs).toISOString(),
    durationMs: 0,
    score: 0,
    summary: { errors: 0, warnings: 0, info: 0 },
    fetch: { status: 0, redirects: [], timeMs: 0, htmlBytes: 0, compression: null, https: url.startsWith("https:"), httpRedirectsToHttps: null, hostVariant: null, securityHeaders: {} },
    head: null,
    files: { robots: null, sitemap: null, llmsTxt: null, aiCrawlers: [] },
    legal: [],
    crawl: { pages: [], linksChecked: 0, externalChecked: 0, imagesChecked: 0, skippedByRobots: 0, truncated: false },
    issues,
  };
  const finish = (): AuditReport => {
    if (truncated) push("truncated", `The ${Math.round(deadlineMs / 1000)} s time limit ran out; some pages, links or images were not checked.`);
    report.crawl.truncated = truncated;
    const order: Record<AuditSeverity, number> = { error: 0, warning: 1, info: 2 };
    issues.sort((a, b) => order[a.severity] - order[b.severity]);
    report.summary = {
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    };
    report.score = score(issues);
    report.durationMs = Date.now() - startedMs;
    return report;
  };

  // --- start page --------------------------------------------------------------
  const start = await request(url, "GET", http);
  report.fetch.redirects = start.chain;
  report.fetch.timeMs = start.ms;
  report.fetch.status = start.status;
  if (start.refused) {
    push("refused-address", start.error ?? "refused");
    return finish();
  }
  if (!start.status) {
    push("fetch-failed", `${url} could not be loaded: ${start.error ?? "no response"}.`, url);
    return finish();
  }
  const finalUrl = start.finalUrl;
  report.finalUrl = finalUrl;
  const origin = new URL(finalUrl).origin;
  report.fetch.https = finalUrl.startsWith("https:");
  report.fetch.htmlBytes = start.bytes;
  const headers = start.headers!;
  report.fetch.compression = headers.get("content-encoding");
  if (start.status >= 400) push("http-status", `The start page returned HTTP ${start.status}.`, finalUrl);
  else if (start.status !== 200) push("http-status", `The start page returned HTTP ${start.status}.`, finalUrl, "warning");
  if (!report.fetch.https) push("no-https", `The site ends up on ${finalUrl} without TLS.`, finalUrl);
  if (start.chain.length > 2) push("redirect-chain", `${plural(start.chain.length, "redirect")} before the page: ${[...start.chain.map((c) => `${c.url} (${c.status})`), finalUrl].join(" → ")}.`, url);
  if (start.ms > 3000) push("slow-response", `The start page took ${(start.ms / 1000).toFixed(1)} s to load (HTML only).`, finalUrl, start.ms > 6000 ? "error" : "warning");
  if (start.bytes > 500 * 1024) push("page-weight", `The HTML is ${kb(start.bytes)}; over 500 KB slows the first paint on mobile.`, finalUrl);
  if (!report.fetch.compression && start.bytes > 10 * 1024) push("no-compression", `${kb(start.bytes)} of HTML was sent without gzip or Brotli.`, finalUrl);
  const sec: Record<string, boolean> = {
    "strict-transport-security": headers.has("strict-transport-security"),
    "x-content-type-options": headers.has("x-content-type-options"),
    "referrer-policy": headers.has("referrer-policy"),
    "content-security-policy": headers.has("content-security-policy") || headers.has("content-security-policy-report-only"),
  };
  report.fetch.securityHeaders = sec;
  const missingSec = Object.keys(sec).filter((k) => !sec[k]);
  if (missingSec.length) push("security-headers", `Not set: ${missingSec.join(", ")}.`, finalUrl);
  const xRobots = headers.get("x-robots-tag");
  if (xRobots && /\bnoindex\b/i.test(xRobots)) push("noindex", `X-Robots-Tag header is "${xRobots}".`, finalUrl);

  const contentType = headers.get("content-type") ?? "";
  const pages = new Map<string, PageRecord>();
  let startFacts: PageFacts | null = null;
  if (start.body !== null && (/html/i.test(contentType) || /^\s*</.test(start.body))) {
    startFacts = analyzePage(start.body, finalUrl);
    issues.push(...pageIssues(startFacts, true));
    report.head = {
      lang: startFacts.lang,
      title: startFacts.title,
      description: startFacts.description,
      canonical: startFacts.canonical,
      og: startFacts.og,
      twitterCard: startFacts.twitter.card ?? null,
      favicon: startFacts.favicon,
      jsonLdTypes: [...new Set(startFacts.jsonLd.flatMap((j) => j.types))],
      hreflang: startFacts.hreflang.map((h) => h.lang),
    };
  } else push("http-status", `The start page is ${contentType || "not HTML"}, not an HTML page.`, finalUrl);
  pages.set(key(url), { url, status: start.status, finalUrl, facts: startFacts });
  pages.set(key(finalUrl), { url: finalUrl, status: start.status, finalUrl, facts: startFacts });

  // --- files and host variants -----------------------------------------------------
  const get = (path: string) => request(new URL(path, origin).href, "GET", { ...http, maxBytes: Math.min(http.maxBytes, 2 * 1024 * 1024) });
  const variantChecks = async () => {
    if (options.hostVariants === false) return;
    const final = new URL(finalUrl);
    if (final.protocol === "https:") {
      const plain = new URL(finalUrl);
      plain.protocol = "http:";
      const r = await request(plain.href, "HEAD", { ...http, maxRedirects: 0 });
      if (r.chain.length) report.fetch.httpRedirectsToHttps = /^https:/i.test(r.finalUrl);
      else if (r.status) report.fetch.httpRedirectsToHttps = false;
      if (report.fetch.httpRedirectsToHttps === false) push("http-not-redirected", `${plain.href} ${r.status ? `answers ${r.status} without redirecting` : "does not redirect"} to https.`, plain.href);
    }
    const alt = new URL(finalUrl);
    if (/^\d+\.\d+\.\d+\.\d+$|^\[/.test(alt.hostname) || alt.hostname === "localhost" || alt.hostname.split(".").length > (alt.hostname.startsWith("www.") ? 3 : 2)) return;
    alt.hostname = alt.hostname.startsWith("www.") ? alt.hostname.slice(4) : `www.${alt.hostname}`;
    alt.pathname = "/";
    alt.search = "";
    const r = await request(alt.href, "HEAD", { ...http, maxRedirects: 0, timeoutMs: Math.min(http.timeoutMs, 6000) });
    if (r.refused) return;
    const target = r.chain.length ? r.finalUrl : null;
    report.fetch.hostVariant = { url: alt.href, result: target ? `redirects to ${target}` : r.status ? `answers ${r.status}` : `no answer (${r.error})` };
    if (!target && r.status >= 200 && r.status < 300) push("host-duplicate", `${alt.href} serves the site too, without redirecting to ${origin}/.`, alt.href);
    else if (target && new URL(target).host !== new URL(finalUrl).host) push("host-duplicate", `${alt.href} redirects to ${target}, not to ${origin}/.`, alt.href, "info");
  };
  const [robotsRes, sitemapRes, llmsRes] = await Promise.all([get("/robots.txt"), get("/sitemap.xml"), get("/llms.txt"), variantChecks()]);

  let robots: Robots | null = null;
  const isText = (r: Fetched) => r.status === 200 && r.body !== null && !/^\s*<(?:!doctype|html)/i.test(r.body);
  if (isText(robotsRes)) {
    robots = parseRobots(robotsRes.body!);
    const blocksAll = !isAllowed(robots, "Googlebot", "/");
    report.files.robots = { found: true, sitemaps: robots.sitemaps, blocksAll };
    if (blocksAll) push("robots-blocks-all", "robots.txt disallows / for Googlebot (directly or through User-agent: *): the site cannot be indexed.", `${origin}/robots.txt`);
    if (!robots.sitemaps.length) push("robots", "robots.txt has no Sitemap: line.", `${origin}/robots.txt`, "info");
  } else {
    report.files.robots = { found: false, sitemaps: [], blocksAll: false };
    push("robots", `No robots.txt (${robotsRes.status ? `HTTP ${robotsRes.status}` : robotsRes.error}).`, `${origin}/robots.txt`);
  }
  report.files.aiCrawlers = aiCrawlerPolicy(robots);
  const blockedAi = report.files.aiCrawlers.filter((c) => c.access === "blocked").map((c) => c.agent);
  const partialAi = report.files.aiCrawlers.filter((c) => c.access === "partial").map((c) => c.agent);
  push(
    "ai-crawlers",
    [
      blockedAi.length
        ? `robots.txt blocks ${blockedAi.join(", ")}: those assistants cannot read, cite or recommend the site.`
        : "No AI crawler is blocked from the site (GPTBot, ClaudeBot, PerplexityBot, Google-Extended …).",
      partialAi.length ? `${partialAi.length === AI_CRAWLER_COUNT ? "All of them have" : `${partialAi.join(", ")} ${partialAi.length === 1 ? "has" : "have"}`} their own rules that keep them out of some paths.` : "",
    ].filter(Boolean).join(" "),
    `${origin}/robots.txt`,
  );

  let sitemapUrl = `${origin}/sitemap.xml`;
  let sm = sitemapRes;
  if (sm.status !== 200 && robots?.sitemaps.length) {
    sitemapUrl = robots.sitemaps[0]!;
    sm = await request(sitemapUrl, "GET", { ...http, maxBytes: Math.min(http.maxBytes, 2 * 1024 * 1024) });
  }
  let sitemapPages: string[] = [];
  if (sm.status === 200 && sm.body !== null) {
    const info = parseSitemap(sm.body);
    report.files.sitemap = { url: sitemapUrl, found: true, valid: info.valid, kind: info.kind, urls: info.urls.length };
    if (!info.valid) push("sitemap-invalid", `${sitemapUrl} is not a valid sitemap: ${info.error}.`, sitemapUrl);
    else if (!info.urls.length) push("sitemap", `${sitemapUrl} lists no URLs.`, sitemapUrl);
    if (info.kind === "urlset") sitemapPages = info.urls;
    else if (info.kind === "sitemapindex" && info.urls[0]) {
      const child = await request(info.urls[0], "GET", { ...http, maxBytes: Math.min(http.maxBytes, 2 * 1024 * 1024) });
      if (child.status === 200 && child.body) sitemapPages = parseSitemap(child.body).urls;
    }
    const foreign = sitemapPages.filter((u) => {
      try {
        return new URL(u).host !== new URL(origin).host;
      } catch {
        return true;
      }
    });
    if (foreign.length) push("sitemap", `${plural(foreign.length, "sitemap URL")} on another host or protocol, e.g. ${foreign[0]}.`, sitemapUrl);
  } else {
    report.files.sitemap = { url: sitemapUrl, found: false, valid: false, kind: null, urls: 0 };
    push("sitemap", `No sitemap at ${sitemapUrl} (${sm.status ? `HTTP ${sm.status}` : sm.error}).`, sitemapUrl);
  }
  report.files.llmsTxt = isText(llmsRes);
  if (!report.files.llmsTxt) push("llms-txt", "No /llms.txt.", `${origin}/llms.txt`);

  if (startFacts && !startFacts.favicon) {
    const ico = await probe(`${origin}/favicon.ico`, http);
    if (ico.status !== 200) push("favicon", 'No <link rel="icon"> and no /favicon.ico.', finalUrl);
  }

  // --- crawl -----------------------------------------------------------------------
  const sources = new Map<string, Set<string>>();
  const addSource = (u: string, from: string) => {
    let s = sources.get(u);
    if (!s) sources.set(u, (s = new Set()));
    s.add(from);
  };
  const sameOrigin = (u: string) => {
    try {
      return new URL(u).origin === origin;
    } catch {
      return false;
    }
  };
  const pathOf = (u: string) => {
    const x = new URL(u);
    return x.pathname + x.search;
  };
  const allowed = (u: string) => isAllowed(robots, "vamos-ui-audit", pathOf(u));
  const crawlable = (u: string) => sameOrigin(u) && !ASSET.test(new URL(u).pathname);
  const skipped = new Set<string>();
  const queue: string[] = [];
  const queued = new Set<string>([key(url), key(finalUrl)]);
  const enqueue = (u: string) => {
    const k = key(u);
    if (queued.has(k) || !crawlable(k)) return;
    if (!allowed(k)) {
      skipped.add(k);
      return;
    }
    queued.add(k);
    queue.push(k);
  };
  const collect = (facts: PageFacts) => {
    for (const l of facts.links) {
      if (!l.url) continue;
      addSource(key(l.url), facts.url);
      enqueue(l.url);
    }
  };
  if (startFacts) collect(startFacts);
  for (const u of sitemapPages) {
    if (!sameOrigin(u)) continue;
    addSource(key(u), "sitemap.xml");
    enqueue(u);
  }

  let dispatched = 1;
  await new Promise<void>((resolve) => {
    let active = 0;
    const pump = () => {
      while (active < concurrency && queue.length && dispatched < maxPages) {
        if (http.remaining() <= 0) {
          truncated = true;
          queue.length = 0;
          break;
        }
        const u = queue.shift()!;
        dispatched++;
        active++;
        void (async () => {
          const r = await request(u, "GET", http);
          const rec: PageRecord = { url: u, status: r.status, finalUrl: r.finalUrl, facts: null, error: r.error };
          pages.set(u, rec);
          const type = r.headers?.get("content-type") ?? "";
          const finalKey = key(r.finalUrl);
          const dup = finalKey !== u && pages.has(finalKey);
          if (r.status === 200 && r.body !== null && /html/i.test(type) && sameOrigin(r.finalUrl) && !dup) {
            if (finalKey !== u) pages.set(finalKey, rec);
            rec.facts = analyzePage(r.body, r.finalUrl);
            issues.push(...pageIssues(rec.facts, false));
            collect(rec.facts);
          }
        })().finally(() => {
          active--;
          pump();
          if (active === 0) resolve();
        });
      }
      if (active === 0) resolve();
    };
    pump();
  });
  report.crawl.skippedByRobots = skipped.size;

  // --- internal links that were not crawled --------------------------------------------
  const internal = [...sources.keys()].filter((u) => sameOrigin(u) && !pages.has(u) && !skipped.has(u) && allowed(u));
  const legalFirst = (u: string) => (legalKind({ url: u, text: "" }) ? 0 : 1);
  internal.sort((a, b) => legalFirst(a) - legalFirst(b));
  const maxLinks = options.maxLinks ?? AUDIT_DEFAULTS.maxLinks;
  const checks = new Map<string, Fetched>();
  const toCheck = internal.slice(0, maxLinks);
  await pool(toCheck, concurrency, async (u) => {
    if (http.remaining() <= 0) {
      truncated = true;
      return;
    }
    checks.set(u, await probe(u, http));
  });
  report.crawl.linksChecked = checks.size + pages.size;

  const statusOf = (u: string): { status: number; finalUrl: string; error?: string; redirected: boolean } | null => {
    const p = pages.get(u);
    if (p) return { status: p.status, finalUrl: p.finalUrl, error: p.error, redirected: key(p.finalUrl) !== u };
    const c = checks.get(u);
    if (c) return { status: c.status, finalUrl: c.finalUrl, error: c.error, redirected: c.chain.length > 0 };
    return null;
  };
  const broken: string[] = [];
  const unreachable: string[] = [];
  const redirecting: string[] = [];
  const brokenSitemap: string[] = [];
  const where = (u: string) => {
    const from = [...(sources.get(u) ?? [])].filter((s) => s !== "sitemap.xml");
    return from.length ? ` (on ${from.slice(0, 2).join(", ")}${from.length > 2 ? ` +${from.length - 2}` : ""})` : "";
  };
  for (const u of sources.keys()) {
    if (!sameOrigin(u)) continue;
    const s = statusOf(u);
    if (!s || u === key(url) || u === key(finalUrl)) continue;
    const fromPages = [...(sources.get(u) ?? [])].some((x) => x !== "sitemap.xml");
    if (s.status === 404 || s.status === 410 || s.status >= 500) {
      if (fromPages) broken.push(`${u} → ${s.status}${where(u)}`);
      if (sources.get(u)?.has("sitemap.xml")) brokenSitemap.push(`${u} → ${s.status}`);
    } else if (!s.status || (s.status >= 400 && s.status !== 429)) {
      if (fromPages) unreachable.push(`${u} → ${s.status || s.error}${where(u)}`);
    } else if (s.redirected && fromPages && sameOrigin(s.finalUrl)) redirecting.push(`${u} → ${s.finalUrl}`);
  }
  const list = (items: string[], n = 8) => items.slice(0, n).join("; ") + (items.length > n ? `; and ${items.length - n} more` : "");
  if (broken.length) push("broken-link", `${plural(broken.length, "internal link")} return an error: ${list(broken)}.`);
  if (brokenSitemap.length) push("sitemap-broken", `${plural(brokenSitemap.length, "URL")} in the sitemap return an error: ${list(brokenSitemap, 5)}.`, sitemapUrl);
  if (unreachable.length) push("link-unreachable", `${plural(unreachable.length, "internal link")} could not be checked: ${list(unreachable, 5)}.`);
  if (redirecting.length) push("redirecting-link", `${plural(redirecting.length, "internal link")} redirect: ${list(redirecting, 4)}.`);
  if (internal.length > maxLinks) push("not-checked", `${internal.length - maxLinks} more internal links were not checked (limit ${maxLinks}).`, undefined, "info");
  if (skipped.size) push("robots", `${plural(skipped.size, "internal URL")} skipped because robots.txt disallows them, e.g. ${[...skipped][0]}.`, `${origin}/robots.txt`, "info");

  // --- legal links ----------------------------------------------------------------------
  const analyzed = [...new Set([...pages.values()].map((p) => p.facts).filter((f): f is PageFacts => !!f))];
  const legalSeen = new Map<string, { kind: string; url: string }>();
  const kinds = new Set<string>();
  for (const f of analyzed) {
    for (const l of f.links) {
      const found = legalKinds(l);
      for (const k of found) kinds.add(k);
      const kind = found[0];
      if (kind && l.url && !legalSeen.has(key(l.url))) legalSeen.set(key(l.url), { kind, url: key(l.url) });
    }
  }
  report.legal = [...legalSeen.values()].map((l) => ({ ...l, status: sameOrigin(l.url) ? (statusOf(l.url)?.status ?? null) : null }));
  for (const l of report.legal) if (l.status && (l.status === 404 || l.status === 410 || l.status >= 500)) push("legal-broken", `The ${LEGAL.find((x) => x.kind === l.kind)!.label} link ${l.url} returns ${l.status}${where(l.url)}.`, l.url);
  if (startFacts) {
    const lang = (startFacts.lang ?? "").toLowerCase();
    const turkish = lang.startsWith("tr") || /\.tr$/.test(new URL(origin).hostname);
    if (!kinds.has("privacy") && !kinds.has("kvkk")) push("legal-links", "No link to a privacy policy found on the crawled pages.", finalUrl);
    if (turkish && !kinds.has("kvkk")) push("legal-links", "No KVKK notice (aydınlatma metni) link found; Turkish sites that collect personal data need one.", finalUrl);
    if (!kinds.has("cookies")) push("legal-links", "No cookie policy link found (needed if the site sets non-essential cookies).", finalUrl, "info");
  }

  // --- duplicate titles -----------------------------------------------------------------
  const titles = new Map<string, string[]>();
  for (const f of analyzed) if (f.title) titles.set(f.title, [...(titles.get(f.title) ?? []), f.url]);
  for (const [t, urls] of titles) if (urls.length > 1) push("duplicate-title", `${plural(urls.length, "page")} share the title "${t}": ${urls.slice(0, 3).join(", ")}${urls.length > 3 ? " …" : ""}.`);

  // --- external links ---------------------------------------------------------------------
  if (options.external) {
    const ext = [...sources.keys()].filter((u) => !sameOrigin(u)).slice(0, options.maxExternal ?? AUDIT_DEFAULTS.maxExternal);
    const bad: string[] = [];
    await pool(ext, concurrency, async (u) => {
      if (http.remaining() <= 0) {
        truncated = true;
        return;
      }
      const r = await probe(u, http);
      report.crawl.externalChecked++;
      if (r.refused) return;
      if (r.status === 404 || r.status === 410 || r.status >= 500 || (!r.status && r.error)) bad.push(`${u} → ${r.status || r.error}${where(u)}`);
    });
    if (bad.length) push("broken-external", `${plural(bad.length, "external link")} look broken: ${list(bad, 6)}.`);
  }

  // --- images ---------------------------------------------------------------------------
  const images = new Map<string, string>();
  for (const f of analyzed) for (const i of f.images) if (i.url && !images.has(key(i.url))) images.set(key(i.url), f.url);
  const imageList = [...images.keys()].slice(0, options.maxImages ?? AUDIT_DEFAULTS.maxImages);
  const heavy: { url: string; bytes: number; page: string }[] = [];
  const missing: string[] = [];
  await pool(imageList, concurrency, async (u) => {
    if (http.remaining() <= 0) {
      truncated = true;
      return;
    }
    const r = await probe(u, http);
    report.crawl.imagesChecked++;
    if (r.refused) return;
    if (r.status === 404 || r.status === 410) missing.push(`${u} (on ${images.get(u)})`);
    const len = Number(r.headers?.get("content-length") ?? NaN);
    if (r.status === 200 && Number.isFinite(len) && len > AUDIT_IMAGE_LIMIT) heavy.push({ url: u, bytes: len, page: images.get(u)! });
  });
  if (missing.length) push("broken-image", `${plural(missing.length, "image")} return 404: ${list(missing, 4)}.`);
  heavy.sort((a, b) => b.bytes - a.bytes);
  if (heavy.length) push("image-weight", `${plural(heavy.length, "image")} over ${kb(AUDIT_IMAGE_LIMIT)}: ${heavy.slice(0, 5).map((h) => `${h.url} (${kb(h.bytes)})`).join("; ")}${heavy.length > 5 ? ` and ${heavy.length - 5} more` : ""}.`);
  if (images.size > imageList.length) push("not-checked", `${images.size - imageList.length} more images were not size-checked (limit ${imageList.length}).`, undefined, "info");

  report.crawl.pages = [...new Map([...pages.values()].map((p) => [key(p.finalUrl), p])).values()].map((p) => ({ url: p.finalUrl, status: p.status, title: p.facts?.title ?? null }));
  return finish();
}

/** Plain-text report (MCP, logs): grouped by severity, one line per finding. */
export function formatAuditText(report: AuditReport, opts: { maxPerRule?: number } = {}): string {
  const max = opts.maxPerRule ?? 5;
  const lines: string[] = [];
  const { errors, warnings, info } = report.summary;
  lines.push(`Audit of ${report.finalUrl}${report.finalUrl !== report.url ? ` (from ${report.url})` : ""}`);
  lines.push(`Score ${report.score}/100 · ${plural(errors, "error")}, ${plural(warnings, "warning")}, ${info} info · ${plural(report.crawl.pages.length, "page")} crawled, ${report.crawl.linksChecked} links and ${report.crawl.imagesChecked} images checked in ${(report.durationMs / 1000).toFixed(1)} s`);
  if (report.fetch.status) {
    lines.push(`HTTP ${report.fetch.status} in ${report.fetch.timeMs} ms, ${kb(report.fetch.htmlBytes)} HTML${report.fetch.compression ? ` (${report.fetch.compression})` : " (uncompressed)"}${report.fetch.redirects.length ? `, ${plural(report.fetch.redirects.length, "redirect")}` : ""}`);
  }
  for (const sev of ["error", "warning", "info"] as const) {
    const group = report.issues.filter((i) => i.severity === sev);
    if (!group.length) continue;
    lines.push("", `${sev === "error" ? "Errors" : sev === "warning" ? "Warnings" : "Info"} (${group.length})`);
    const byRule = new Map<string, AuditIssue[]>();
    for (const i of group) byRule.set(i.rule, [...(byRule.get(i.rule) ?? []), i]);
    for (const [rule, items] of byRule) {
      for (const i of items.slice(0, max)) lines.push(`- [${rule}] ${i.message}${i.url && !i.message.includes(i.url) ? ` (${i.url})` : ""}`);
      if (items.length > max) lines.push(`- [${rule}] … and ${items.length - max} more pages`);
      const fix = items[0]!.fix;
      if (fix) lines.push(`  Fix: ${fix}`);
    }
  }
  if (!report.issues.length) lines.push("", "No issues found.");
  return lines.join("\n");
}
