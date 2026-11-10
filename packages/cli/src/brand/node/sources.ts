/**
 * Reading brand sources for `vamos-ui brand import`: a web page (plus its stylesheets and
 * logo SVGs) or local files (logos, CSS, brand guidelines as Markdown, text or PDF).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { inflateSync } from "node:zlib";
import { createBrandCollector, linkedStylesheets, type ExtractedBrand } from "../extract";
import { decodePng, dominantColour } from "./png";

export interface ImportLog {
  read: string[];
  skipped: { what: string; why: string }[];
}

export interface ImportResult extends ExtractedBrand {
  log: ImportLog;
}

const USER_AGENT = "Mozilla/5.0 (compatible; vamos-ui-brand-import/1.0; +https://ui.vamos.ist)";
const PAGE_TIMEOUT = 12_000;
const ASSET_TIMEOUT = 8_000;
const MAX_PAGE_BYTES = 3_000_000;
const MAX_CSS_BYTES = 2_000_000;
const MAX_STYLESHEETS = 8;

/** Hosts that serve stylesheets for sites on other domains (site builders and public CDNs). */
const CDN_HOSTS = [
  /(^|\.)cdn\.jsdelivr\.net$/, /(^|\.)unpkg\.com$/, /(^|\.)cdnjs\.cloudflare\.com$/, /(^|\.)cloudfront\.net$/, /(^|\.)fonts\.googleapis\.com$/,
  /(^|\.)cdn\.shopify\.com$/, /(^|\.)website-files\.com$/, /(^|\.)squarespace(-cdn)?\.com$/, /(^|\.)parastorage\.com$/,
  /(^|\.)framerusercontent\.com$/, /(^|\.)wp\.com$/, /(^|\.)typekit\.net$/, /(^|\.)b-cdn\.net$/, /(^|\.)azureedge\.net$/, /(^|\.)fastly\.net$/,
];

/** example.co.uk → example.co.uk, app.example.com → example.com (good enough for "same site"). */
function siteOf(host: string): string {
  const parts = host.toLowerCase().split(".");
  const twoLevel = parts.length > 2 && /^(co|com|org|net|gov|ac|edu)$/.test(parts[parts.length - 2]!) && parts[parts.length - 1]!.length === 2;
  return parts.slice(twoLevel ? -3 : -2).join(".");
}

export function isAllowedStylesheet(url: string, pageUrl: string): boolean {
  try {
    const u = new URL(url);
    const p = new URL(pageUrl);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (siteOf(u.hostname) === siteOf(p.hostname)) return true;
    return CDN_HOSTS.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}

async function fetchText(url: string, timeout: number, maxBytes: number, accept: string): Promise<{ text: string; url: string; type: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow", headers: { "user-agent": USER_AGENT, accept } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > maxBytes) throw new Error(`too large (${Math.round(len / 1024)} KB)`);
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length > maxBytes) throw new Error(`too large (${Math.round(buf.length / 1024)} KB)`);
    return { text: new TextDecoder().decode(buf), url: res.url || url, type: res.headers.get("content-type") ?? "" };
  } catch (err) {
    if ((err as Error).name === "AbortError") throw new Error(`timed out after ${timeout / 1000}s`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Fetches a page, up to 8 same-site/CDN stylesheets and up to 2 SVG logos, and extracts a brand. */
export async function importFromUrl(url: string): Promise<ImportResult> {
  const log: ImportLog = { read: [], skipped: [] };
  const page = await fetchText(url, PAGE_TIMEOUT, MAX_PAGE_BYTES, "text/html,application/xhtml+xml");
  if (page.type && !/html|xml|text\/plain/.test(page.type)) throw new Error(`${url} is not an HTML page (${page.type}).`);
  log.read.push(page.url);
  const sheets = linkedStylesheets(page.text, page.url);
  const allowed = sheets.filter((s) => isAllowedStylesheet(s, page.url));
  for (const s of sheets.filter((x) => !allowed.includes(x))) log.skipped.push({ what: s, why: "other domain" });
  for (const s of allowed.slice(MAX_STYLESHEETS)) log.skipped.push({ what: s, why: `limit of ${MAX_STYLESHEETS} stylesheets` });
  const css = await Promise.all(
    allowed.slice(0, MAX_STYLESHEETS).map(async (s) => {
      // Google Fonts stylesheets only matter for their URL (family names), which the HTML already gives.
      if (/fonts\.googleapis\.com/.test(s)) return null;
      try {
        const r = await fetchText(s, ASSET_TIMEOUT, MAX_CSS_BYTES, "text/css,*/*;q=0.1");
        log.read.push(s);
        return { css: r.text, source: path.posix.basename(new URL(s).pathname) || s };
      } catch (err) {
        log.skipped.push({ what: s, why: (err as Error).message });
        return null;
      }
    }),
  );
  const c = createBrandCollector(page.url);
  c.addHtml(page.text, "page");
  for (const s of css) if (s) c.addCss(s.css, s.source);
  // Logo SVGs carry the most reliable brand colours.
  const draft = c.result();
  const svgs = (draft.brand.assets ?? []).filter((a) => /\.svg(\?|$)/i.test(a.path) && /^logo/i.test(a.use) && isAllowedStylesheet(a.path, page.url)).slice(0, 2);
  if (svgs.length) {
    const c2 = createBrandCollector(page.url);
    c2.addHtml(page.text, "page");
    for (const s of css) if (s) c2.addCss(s.css, s.source);
    for (const a of svgs) {
      try {
        const r = await fetchText(a.path, ASSET_TIMEOUT, 1_000_000, "image/svg+xml,*/*;q=0.1");
        c2.addSvg(r.text, path.posix.basename(new URL(a.path).pathname));
        log.read.push(a.path);
      } catch (err) {
        log.skipped.push({ what: a.path, why: (err as Error).message });
      }
    }
    const result = c2.result();
    result.brand.source = { url: page.url };
    return { ...result, log };
  }
  draft.brand.source = { url: page.url };
  return { ...draft, log };
}

const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", ".turbo", ".vercel"]);
const TEXT_EXT = /\.(md|mdx|markdown|txt)$/i;
const IMAGE_EXT = /\.(svg|png|jpe?g|webp|gif|ico)$/i;

function walk(dir: string, depth: number, out: string[]): void {
  if (out.length >= 300) return;
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".") || IGNORE_DIRS.has(entry)) continue;
    const abs = path.join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) {
      if (depth < 3) walk(abs, depth + 1, out);
    } else out.push(abs);
  }
}

/** Best-effort text from a PDF: inflates content streams and reads the Tj/TJ string operands. */
export function pdfText(buf: Buffer): string {
  const chunks: string[] = [];
  const src = buf.toString("latin1");
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const start = m.index + m[0].length;
    const end = src.indexOf("endstream", start);
    if (end < 0) break;
    const dict = src.slice(Math.max(0, m.index - 300), m.index);
    let body: string;
    const bytes = buf.subarray(start, end);
    if (/FlateDecode/.test(dict)) {
      try {
        body = inflateSync(bytes).toString("latin1");
      } catch {
        re.lastIndex = end;
        continue;
      }
    } else body = bytes.toString("latin1");
    re.lastIndex = end;
    if (!/T[jJ]/.test(body)) continue;
    const lines: string[] = [];
    for (const t of body.matchAll(/\[((?:\([^)]*\)|[^\]])*)\]\s*TJ|\(((?:\\.|[^\\)])*)\)\s*Tj|(T\*|Td|TD|ET)/g)) {
      if (t[3]) lines.push("\n");
      else if (t[1] !== undefined) lines.push([...t[1].matchAll(/\(((?:\\.|[^\\)])*)\)/g)].map((x) => x[1]).join(""));
      else if (t[2] !== undefined) lines.push(t[2]);
    }
    chunks.push(lines.join("").replace(/\\([()\\])/g, "$1").replace(/\\n/g, "\n"));
  }
  return chunks.join("\n").replace(/[^\S\n]+/g, " ").trim();
}

/** Reads a folder (or a single file) of brand material relative to `root`. */
export function importFromPath(target: string, root: string): ImportResult {
  const abs = path.resolve(root, target);
  if (!existsSync(abs)) throw new Error(`${target} does not exist.`);
  const files: string[] = [];
  if (statSync(abs).isDirectory()) walk(abs, 0, files);
  else files.push(abs);
  const log: ImportLog = { read: [], skipped: [] };
  const c = createBrandCollector();
  const rel = (f: string) => path.relative(root, f).split(path.sep).join("/") || path.basename(f);
  const isLogo = (f: string) => /logo|wordmark|brandmark|mark|symbol|icon/i.test(path.basename(f));
  for (const file of files.sort()) {
    const name = rel(file);
    try {
      if (/\.svg$/i.test(file)) {
        c.addSvg(readFileSync(file, "utf8"), path.basename(file), { logo: true });
        c.addAsset({ path: name, use: isLogo(file) ? "Logo (SVG). Preferred format; keep clear space, don't recolour or stretch." : "Brand graphic (SVG)." }, `file ${name}`);
      } else if (/\.png$/i.test(file)) {
        const dom = dominantColour(decodePng(readFileSync(file)));
        if (dom) c.addColour(dom.hex, dom.neutral ? 4 : isLogo(file) ? 18 : 8, `dominant colour of ${path.basename(file)} (${Math.round(dom.share * 100)}% of its colour pixels)`, { strong: isLogo(file) });
        c.addAsset({ path: name, use: isLogo(file) ? "Logo (PNG). Use the SVG where possible; never scale above its pixel size." : "Brand image (PNG)." }, `file ${name}`);
      } else if (IMAGE_EXT.test(file)) {
        c.addAsset({ path: name, use: isLogo(file) ? "Logo." : "Brand image." }, `file ${name}`);
        log.skipped.push({ what: name, why: "colours are only read from SVG and PNG" });
        continue;
      } else if (/\.(css|scss|pcss)$/i.test(file)) {
        c.addCss(readFileSync(file, "utf8"), path.basename(file));
      } else if (/\.html?$/i.test(file)) {
        c.addHtml(readFileSync(file, "utf8"), path.basename(file));
      } else if (TEXT_EXT.test(file)) {
        c.addText(readFileSync(file, "utf8"), path.basename(file));
        c.addAsset({ path: name, use: "Brand guidelines. Read before writing copy or designing new screens." }, `file ${name}`);
      } else if (/\.pdf$/i.test(file)) {
        const text = pdfText(readFileSync(file));
        if (text.length < 20) log.skipped.push({ what: name, why: "no readable text (scanned or encrypted PDF?)" });
        else c.addText(text, path.basename(file));
        c.addAsset({ path: name, use: "Brand guidelines (PDF). Read before writing copy or designing new screens." }, `file ${name}`);
      } else if (/\.json$/i.test(file) && /tokens?|brand|colou?rs?|theme/i.test(path.basename(file))) {
        c.addText(readFileSync(file, "utf8"), path.basename(file));
      } else {
        log.skipped.push({ what: name, why: "unsupported file type" });
        continue;
      }
      log.read.push(name);
    } catch (err) {
      log.skipped.push({ what: name, why: (err as Error).message });
    }
  }
  return { ...c.result(), log };
}
