/**
 * Brand extraction from a web page (HTML + its CSS), SVG logos and brand documents.
 * Heuristic and regex based on purpose: fast, dependency-free and pure (no fetch, no fs).
 * Every proposed value comes with the evidence that led to it, so a person can judge it.
 */
import { COLOR_LITERAL, deltaE, formatOklch, hueDistance, isNeutral, parseColor, toHex, type Oklch } from "./color";
import { canonicalFamily, cleanFamily, getFont, googleFonts, isGenericFamily, primaryFamily, type FontRole } from "./fonts";
import type { Brand, BrandAsset, BrandRadius, BrandTheme, BrandVoice } from "./types";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface BrandDraft {
  name?: string;
  colors?: Partial<Brand["colors"]>;
  fonts?: Brand["fonts"];
  theme?: BrandTheme;
  voice?: BrandVoice;
  assets?: BrandAsset[];
  source?: Brand["source"];
}

export interface BrandEvidence {
  /** Field the evidence supports: "colors.accent", "fonts.body", "name", "theme.dark", "assets" … */
  field: string;
  value: string;
  /** Why, e.g. `<meta name="theme-color">` or `--primary (main.css)`. */
  reason: string;
}

export interface ColourCandidate {
  /** #rrggbb */
  hex: string;
  oklch: string;
  score: number;
  reasons: string[];
  /** Only seen in dark-mode rules. */
  darkOnly: boolean;
}

export interface FontCandidate {
  family: string;
  role: FontRole;
  score: number;
  inCatalog: boolean;
  reasons: string[];
}

export interface ExtractedBrand {
  brand: BrandDraft;
  evidence: BrandEvidence[];
  /** Accent candidates, best first (neutrals excluded unless nothing else was found). */
  colours: ColourCandidate[];
  fonts: Record<FontRole, FontCandidate[]>;
}

/** A stylesheet given to the extractor: raw CSS, or CSS with a name for the evidence. */
export type CssInput = string | { css: string; source: string };

// ---------------------------------------------------------------------------
// Small HTML helpers
// ---------------------------------------------------------------------------

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1]!.toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

export function parseAttrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const body = tag.replace(/^<[\w:-]+/, "").replace(/\/?>$/, "");
  for (const m of body.matchAll(/([\w:@.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[m[1]!.toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

function tags(html: string, name: string): { raw: string; attrs: Record<string, string>; index: number }[] {
  const re = new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "gi");
  return [...html.matchAll(re)].map((m) => ({ raw: m[0], attrs: parseAttrs(m[0]), index: m.index! }));
}

function resolveUrl(href: string, baseUrl: string | undefined): string {
  if (!baseUrl) return href;
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

// Inline elements join their text ("Vamos<span>.</span>" → "Vamos."); anything else separates words.
const stripTags = (s: string) =>
  decodeEntities(
    s
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "")
      .replace(/<\/?(?:span|a|em|strong|b|i|u|s|small|mark|sup|sub|code|abbr|q|bdi|bdo|data|time|var|kbd|wbr)\b[^>]*>/gi, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

/** Absolute URLs of the stylesheets a page links (rel=stylesheet and preloaded styles). */
export function linkedStylesheets(html: string, baseUrl?: string): string[] {
  const out: string[] = [];
  for (const t of tags(html.replace(/<!--[\s\S]*?-->/g, ""), "link")) {
    const rel = (t.attrs.rel ?? "").toLowerCase().split(/\s+/);
    const isStyle = rel.includes("stylesheet") || (rel.includes("preload") && t.attrs.as === "style");
    if (isStyle && t.attrs.href && !rel.includes("alternate")) {
      const url = resolveUrl(t.attrs.href, baseUrl);
      if (!out.includes(url)) out.push(url);
    }
  }
  return out;
}

/** Family names requested by a Google Fonts URL (css and css2 APIs). */
export function googleFontsFamilies(url: string): string[] {
  if (!/fonts\.googleapis\.com\/css/.test(url)) return [];
  const query = decodeEntities(url).split("?")[1] ?? "";
  const out: string[] = [];
  for (const part of query.split("&")) {
    const [key, value] = part.split("=");
    if (key !== "family" || !value) continue;
    for (const fam of decodeURIComponent(value.replace(/\+/g, " ")).split("|")) {
      const name = fam.split(":")[0]!.trim();
      if (name && !out.includes(name)) out.push(name);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// CSS parsing
// ---------------------------------------------------------------------------

export interface CssRule {
  selector: string;
  /** Enclosing at-rule preludes, outermost first (e.g. "@media (prefers-color-scheme: dark)"). */
  context: string[];
  decls: [string, string][];
}

const GROUPING = /^@(media|supports|layer|container|document|scope|starting-style)\b/i;

function splitDecls(body: string): [string, string][] {
  const out: [string, string][] = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  const push = (end: number) => {
    const d = body.slice(start, end);
    const colon = d.indexOf(":");
    if (colon > 0) {
      const prop = d.slice(0, colon).trim();
      const value = d.slice(colon + 1).replace(/!important\s*$/i, "").trim();
      if (/^(--)?[\w-]+$/.test(prop) && value) out.push([prop.startsWith("--") ? prop : prop.toLowerCase(), value]);
    }
    start = end + 1;
  };
  for (let i = 0; i < body.length; i++) {
    const c = body[i]!;
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === ";" && depth === 0) push(i);
  }
  push(body.length);
  return out;
}

/** A forgiving CSS rule walker: nested rules, at-rules and @import statements. */
export function parseCss(css: string): { rules: CssRule[]; imports: string[] } {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: CssRule[] = [];
  const imports: string[] = [];
  const stack: { prelude: string; decls: string }[] = [];
  let buf = "";
  const statement = (text: string) => {
    const m = /^@import\s+(?:url\(\s*)?["']?([^"')\s]+)/i.exec(text.trim());
    if (m) imports.push(m[1]!);
  };
  const selectorOf = (prelude: string) => {
    const parent = [...stack].reverse().find((f) => !f.prelude.startsWith("@"));
    if (!parent || prelude.startsWith("@")) return prelude;
    return prelude
      .split(",")
      .map((s) => (s.includes("&") ? s.replace(/&/g, parent.prelude.trim()) : `${parent.prelude.trim()} ${s.trim()}`))
      .join(", ");
  };
  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === "\\" ? 2 : 1;
      buf += src.slice(i, j + 1);
      i = j;
      continue;
    }
    const top = stack[stack.length - 1];
    if (c === "{") {
      const cut = buf.lastIndexOf(";");
      if (top) top.decls += buf.slice(0, cut + 1);
      else if (cut >= 0) buf.slice(0, cut + 1).split(";").forEach(statement);
      const prelude = buf.slice(cut + 1).trim();
      stack.push({ prelude: selectorOf(prelude), decls: "" });
      buf = "";
    } else if (c === "}") {
      const frame = stack.pop();
      if (frame) {
        frame.decls += buf;
        const decls = splitDecls(frame.decls);
        if (decls.length && !GROUPING.test(frame.prelude)) {
          rules.push({ selector: frame.prelude, context: stack.filter((f) => f.prelude.startsWith("@")).map((f) => f.prelude), decls });
        }
      }
      buf = "";
    } else if (c === ";" && (!top || GROUPING.test(top.prelude))) {
      statement(buf);
      buf = "";
    } else buf += c;
  }
  return { rules, imports };
}

const DARK_SELECTOR = /\.dark\b|\.theme-dark\b|\[data-(?:theme|mode|color-scheme|bs-theme)=["']?dark/i;
const isDarkContext = (rule: CssRule) => DARK_SELECTOR.test(rule.selector) || rule.context.some((c) => /prefers-color-scheme\s*:\s*dark/i.test(c));
const BUTTONISH = /(^|[\s,.#>+~:[-])(button|btn|cta|primary)\b|\[type=["']?submit/i;
const HEADING = /(^|[\s,>+~])h[1-3]\b|heading|headline|title|display|hero/i;
const MONO = /(^|[\s,>+~])(code|pre|kbd|samp)\b|mono/i;
const ROOTISH = /^(html|body|:root|\*)(\s*,\s*(html|body|:root|\*))*$/i;
const COLOR_PROPS = /^(color|background|background-color|border|border-(?:top|right|bottom|left)(?:-color)?|border-color|outline|outline-color|fill|stroke|text-decoration-color|caret-color|accent-color|stop-color)$/;

/** "222 47% 11%" style HSL channels inside a custom property. */
const HSL_CHANNELS = /^(-?[\d.]+)(?:deg)?\s+([\d.]+)%\s+([\d.]+)%$/;

// ---------------------------------------------------------------------------
// The collector
// ---------------------------------------------------------------------------

interface ColourHit {
  colour: Oklch;
  score: number;
  reason: string;
  dark: boolean;
  /** Strong signals (theme-color, brand variable, logo) may propose a neutral accent. */
  strong: boolean;
}

interface FontHit {
  family: string;
  role: FontRole;
  score: number;
  reason: string;
}

export interface BrandCollector {
  /** A page: meta tags, links, logos, inline styles and SVGs, copy. */
  addHtml(html: string, source?: string): void;
  addCss(css: string, source?: string): void;
  /** An SVG document or fragment; `logo` weighs its fills as brand colours. */
  addSvg(svg: string, source: string, opts?: { logo?: boolean }): void;
  /** Brand guidelines as plain text or Markdown (colours, fonts, voice). */
  addText(text: string, source: string): void;
  addColour(colour: string, score: number, reason: string, opts?: { dark?: boolean; strong?: boolean }): void;
  addAsset(asset: BrandAsset, reason: string): void;
  result(): ExtractedBrand;
}

export function createBrandCollector(baseUrl?: string): BrandCollector {
  const colours: ColourHit[] = [];
  const fonts: FontHit[] = [];
  const assets: { asset: BrandAsset; reason: string }[] = [];
  const evidence: BrandEvidence[] = [];
  const sheets: { css: string; source: string }[] = [];
  const styleAttrs: { selector: string; decls: string; source: string }[] = [];
  const loadedFamilies = new Map<string, string>();
  const names: { value: string; score: number; reason: string }[] = [];
  const copy: { text: string; reason: string }[] = [];
  const darkSignals: string[] = [];
  const radii: number[] = [];
  const voice: BrandVoice = {};
  const imgLogos: { path: string; src: string; alt: string; inHeader: boolean }[] = [];
  let host = "";
  try {
    host = baseUrl ? new URL(baseUrl).hostname.replace(/^www\./, "") : "";
  } catch {
    /* not a URL */
  }

  const addColour: BrandCollector["addColour"] = (raw, score, reason, opts = {}) => {
    const c = parseColor(raw);
    if (!c || c.alpha < 0.5) return;
    colours.push({ colour: { ...c, alpha: 1 }, score, reason, dark: !!opts.dark, strong: !!opts.strong });
  };
  const addFont = (raw: string, role: FontRole, score: number, reason: string) => {
    const f = cleanFamily(raw);
    if (!f || isGenericFamily(f) || /^(icon|fontawesome|font awesome|material (icons|symbols)|glyphicons)/i.test(f)) return;
    fonts.push({ family: canonicalFamily(f).family, role, score, reason });
  };
  const addAsset: BrandCollector["addAsset"] = (asset, reason) => {
    if (assets.some((a) => a.asset.path === asset.path)) return;
    assets.push({ asset, reason });
  };

  const svgColours = (svg: string, source: string, logo: boolean) => {
    const seen = new Map<string, number>();
    const literals = [
      ...[...svg.matchAll(/\b(?:fill|stroke|stop-color)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]!),
      ...[...svg.matchAll(/\b(?:fill|stroke|stop-color)\s*:\s*([^;"'}]+)/gi)].map((m) => m[1]!),
    ];
    for (const lit of literals) {
      const c = parseColor(lit.trim());
      if (!c) continue;
      const key = toHex(c);
      const n = seen.get(key) ?? 0;
      seen.set(key, n + 1);
      if (logo) {
        if (n < 6) addColour(lit, n === 0 ? 12 : 2, `fill in ${source}`, { strong: n === 0 });
      } else addColour(lit, 1, `fill in ${source}`);
    }
  };

  const collector: BrandCollector = {
    addColour,
    addAsset,
    addCss(css, source = "inline <style>") {
      sheets.push({ css, source });
    },
    addSvg(svg, source, opts = {}) {
      svgColours(svg, source, opts.logo ?? true);
      for (const m of svg.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) svgColours(m[1]!, source, opts.logo ?? true);
    },
    addText(text, source) {
      const lines = text.split(/\r?\n/);
      let section = "";
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const heading = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
        if (heading) {
          section = heading[2]!.toLowerCase();
          if (heading[1] === "#" && !names.some((n) => n.reason.startsWith("title of"))) {
            const n = heading[2]!.replace(/\b(brand(ing)?\s*(guide(lines)?|book|identity|manual)?|style\s*guide|guidelines|visual identity)\b/gi, "").replace(/[-–—:|·]+\s*$/, "").trim();
            if (n && n.length <= 40) names.push({ value: n, score: 6, reason: `title of ${source}` });
          }
          continue;
        }
        const lower = line.toLowerCase();
        const brandish = /\b(primary|brand|main|accent|key colou?r|hero)\b/.test(lower) || /colou?r/.test(section) && /\bprimary\b/.test(section);
        for (const m of line.matchAll(COLOR_LITERAL)) {
          const dark = /\bdark\b/.test(lower);
          addColour(m[0], brandish ? 25 : 6, `${brandish ? "primary colour" : "colour"} in ${source}${i ? ` (line ${i + 1})` : ""}`, { dark, strong: brandish });
        }
        // Font names: catalog families mentioned anywhere, or "Font: X" lines.
        const role: FontRole | null = /\b(mono|code)\b/.test(lower) ? "mono" : /\b(head(ing|line)s?|display|titles?)\b/.test(lower) ? "display" : /\b(body|text|copy|paragraph|ui|interface)\b/.test(lower) ? "body" : null;
        for (const f of googleFonts) {
          if (new RegExp(`\\b${f.family.replace(/\s+/g, "\\s+")}\\b`, "i").test(line)) addFont(f.family, role ?? (f.category === "mono" ? "mono" : "body"), role ? 8 : 3, `named in ${source}`);
        }
        const declared = /^\s*[-*]?\s*(?:primary\s+|secondary\s+|heading\s+|body\s+|display\s+)?(?:font|typeface|type)\s*[:=]\s*["']?([A-Z][\w ]{1,40}?)["']?\s*(?:[,(;]|$)/i.exec(line);
        if (declared && !getFont(declared[1]!)) addFont(declared[1]!, role ?? "body", 6, `named in ${source}`);
        // Voice
        const tone = /^\s*[-*]?\s*(?:tone|voice|tone of voice)\s*:\s*(.+)$/i.exec(line);
        if (tone) voice.tone ??= tone[1]!.trim();
        const doLine = /^\s*[-*]?\s*(?:\*\*)?(do|don'?t|avoid)(?:\*\*)?\s*:\s*(.+)$/i.exec(line);
        if (doLine) {
          const kind = doLine[1]!.toLowerCase();
          voice.examples ??= [];
          if (kind === "do") voice.examples.push({ do: doLine[2]!.trim() });
          else {
            const last = voice.examples[voice.examples.length - 1];
            if (last && !last.dont) last.dont = doLine[2]!.trim();
            else (voice.rules ??= []).push(`Avoid: ${doLine[2]!.trim()}`);
          }
          continue;
        }
        if (/voice|tone|writing|copy|messaging/.test(section)) {
          const bullet = /^\s*[-*+]\s+(.+)$/.exec(line);
          if (bullet) (voice.rules ??= []).push(bullet[1]!.replace(/\*\*/g, "").trim());
          else if (!voice.tone && line.trim() && line.trim().length <= 80 && !/^[|>]/.test(line.trim())) voice.tone = line.trim();
        }
      }
    },
    addHtml(rawHtml, source = "page") {
      const html = rawHtml.replace(/<!--[\s\S]*?-->/g, "");
      const head = /<head\b[\s\S]*?<\/head>/i.exec(html)?.[0] ?? html;

      for (const t of tags(head, "meta")) {
        const key = (t.attrs.name ?? t.attrs.property ?? "").toLowerCase();
        const content = (t.attrs.content ?? "").trim();
        if (!content) continue;
        if (key === "theme-color") {
          const dark = /prefers-color-scheme:\s*dark/i.test(t.attrs.media ?? "");
          addColour(content, 40, `<meta name="theme-color"${dark ? ' media="(prefers-color-scheme: dark)"' : ""}>`, { dark, strong: true });
        } else if (key === "msapplication-tilecolor") addColour(content, 15, '<meta name="msapplication-TileColor">', { strong: true });
        else if (key === "og:site_name") names.push({ value: content, score: 10, reason: '<meta property="og:site_name">' });
        else if (key === "application-name" || key === "apple-mobile-web-app-title") names.push({ value: content, score: 8, reason: `<meta name="${key}">` });
        else if (key === "description" || key === "og:description" || key === "twitter:description") {
          if (!copy.some((c) => c.text === content)) copy.push({ text: content, reason: `<meta ${key.startsWith("og") ? "property" : "name"}="${key}">` });
        } else if (key === "og:image" || key === "twitter:image") {
          addAsset({ path: resolveUrl(content, baseUrl), use: "Social share image (og:image). Not a logo; use for link previews." }, `<meta property="${key}">`);
        } else if (key === "color-scheme" && /^\s*dark\s*$/i.test(content)) darkSignals.push('<meta name="color-scheme" content="dark">');
      }

      const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1];
      if (title) {
        const t = decodeEntities(title).replace(/\s+/g, " ").trim();
        const parts = t.split(/\s+[|–—·•:-]\s+/).map((s) => s.trim()).filter(Boolean);
        const hostWord = host.split(".")[0]?.replace(/[^a-z0-9]/g, "") ?? "";
        const byHost = parts.find((p) => hostWord && p.toLowerCase().replace(/[^a-z0-9]/g, "").includes(hostWord));
        const pick = byHost ?? (parts.length > 1 && parts[parts.length - 1]!.split(" ").length <= 3 ? parts[parts.length - 1]! : parts[0]!);
        if (pick) names.push({ value: pick, score: byHost ? 9 : 5, reason: "<title>" });
      }

      for (const t of tags(html, "link")) {
        const rel = (t.attrs.rel ?? "").toLowerCase();
        const href = t.attrs.href;
        if (!href) continue;
        if (/fonts\.googleapis\.com\/css/.test(href)) for (const f of googleFontsFamilies(href)) loadedFamilies.set(canonicalFamily(f).family, "Google Fonts <link>");
        if (/mask-icon/.test(rel) && t.attrs.color) addColour(t.attrs.color, 25, '<link rel="mask-icon" color>', { strong: true });
        if (/(^|\s)(icon|apple-touch-icon|mask-icon)(\s|$)/.test(rel) || rel === "shortcut icon") {
          const use = rel.includes("apple-touch")
            ? "App icon (apple-touch-icon). Square; use for home-screen and app tiles."
            : rel.includes("mask-icon")
              ? "Pinned-tab icon (single-colour SVG). Browser chrome only."
              : "Favicon. Browser tabs only; too small for in-page use.";
          addAsset({ path: resolveUrl(href, baseUrl), use }, `<link rel="${rel}">`);
        }
      }

      const htmlTag = tags(html, "html")[0];
      const bodyTag = tags(html, "body")[0];
      for (const t of [htmlTag, bodyTag]) {
        if (!t) continue;
        const cls = `${t.attrs.class ?? ""} ${t.attrs["data-theme"] ?? ""} ${t.attrs["data-mode"] ?? ""} ${t.attrs["data-bs-theme"] ?? ""}`;
        if (/(^|\s)(dark|theme-dark)(\s|$)/.test(cls)) darkSignals.push(`<${t.raw.slice(1, 5).trim()}> has a dark class/theme`);
      }

      // Logo images are classified in result(), once the brand name is known: a page often
      // shows client, partner or product logos next to its own.
      const header = /<header\b[\s\S]*?<\/header>/i.exec(html);
      for (const t of tags(html, "img")) {
        const hay = `${t.attrs.src ?? ""} ${t.attrs.alt ?? ""} ${t.attrs.class ?? ""} ${t.attrs.id ?? ""}`;
        if (!t.attrs.src || !/logo|brand|wordmark/i.test(hay)) continue;
        const inHeader = !!header && t.index >= header.index && t.index < header.index + header[0].length;
        const logoPath = resolveUrl(t.attrs.src, baseUrl);
        if (!imgLogos.some((l) => l.path === logoPath)) imgLogos.push({ path: logoPath, src: t.attrs.src, alt: (t.attrs.alt ?? "").trim(), inHeader });
      }

      // Inline SVG: logo-like ones (in <header>, or marked as logo) weigh as brand colours.
      let headerSvgs = 0;
      for (const m of html.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)) {
        const svg = m[0];
        const before = html.slice(Math.max(0, m.index! - 300), m.index!);
        const inHeader = !!header && m.index! >= header.index && m.index! < header.index + header[0].length;
        const marked = /logo|brand|wordmark/i.test(svg.slice(0, 300)) || /logo|brand|wordmark|navbar-brand/i.test(before.slice(-160));
        const logo = marked || (inHeader && headerSvgs++ === 0);
        svgColours(svg, logo ? "inline SVG logo" : "inline SVG", logo);
      }

      for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) sheets.push({ css: m[1]!, source: `${source} <style>` });

      for (const m of html.matchAll(/<([a-z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)) {
        if (!/\sstyle\s*=/.test(m[2]!)) continue;
        const attrs = parseAttrs(m[0]);
        if (!attrs.style) continue;
        styleAttrs.push({ selector: `${m[1]!.toLowerCase()}${attrs.class ? "." + attrs.class.trim().split(/\s+/).join(".") : ""}`, decls: attrs.style, source: `style attribute in ${source}` });
      }

      const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1];
      if (h1) {
        const text = stripTags(h1);
        if (text && text.length <= 160) copy.unshift({ text, reason: "<h1>" });
      }
    },
    result() {
      // 1. Parse every stylesheet once; collect custom properties for var() resolution.
      const parsed: { rule: CssRule; source: string }[] = [];
      for (const s of sheets) {
        const { rules, imports } = parseCss(s.css);
        for (const imp of imports) for (const f of googleFontsFamilies(imp)) loadedFamilies.set(canonicalFamily(f).family, `Google Fonts @import in ${s.source}`);
        for (const rule of rules) parsed.push({ rule, source: s.source });
      }
      for (const a of styleAttrs) parsed.push({ rule: { selector: a.selector, context: [], decls: splitDecls(a.decls) }, source: a.source });

      const vars = new Map<string, string>();
      for (const { rule } of parsed) {
        if (isDarkContext(rule)) continue;
        for (const [prop, value] of rule.decls) if (prop.startsWith("--") && !vars.has(prop)) vars.set(prop, value);
      }
      const resolve = (value: string, depth = 0): string =>
        depth > 4 ? value : value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (_m, name: string, fallback?: string) => {
          const v = vars.get(name) ?? fallback;
          return v === undefined ? "" : resolve(v, depth + 1);
        });
      const literals = (value: string) => [...resolve(value).matchAll(COLOR_LITERAL)].map((m) => m[0]).concat(resolve(value).split(/[\s,()/]+/).filter((w) => /^[a-z]+$/i.test(w) && parseColor(w) !== null && !["transparent", "currentcolor"].includes(w.toLowerCase())));

      // 2. Score declarations.
      for (const { rule, source } of parsed) {
        const dark = isDarkContext(rule);
        const sel = rule.selector;
        for (const [prop, value] of rule.decls) {
          if (prop.startsWith("--")) {
            const name = prop.slice(2).toLowerCase();
            const v = value.trim();
            const colourValue = HSL_CHANNELS.test(v) ? `hsl(${v})` : resolve(v);
            if (/(^|-)(primary|brand|accent|main|theme|cta)(-|$)/.test(name) && !/(fg|foreground|text|contrast|on|light|lighter|soft|muted|hover|active|focus|bg-subtle|\d{2,3})$/.test(name)) {
              const lit = literals(colourValue)[0] ?? (parseColor(colourValue) ? colourValue : null);
              if (lit) addColour(lit, 30, `${prop} in ${source}${dark ? " (dark)" : ""}`, { dark, strong: true });
            } else if (/(^|-)(secondary|highlight|link)(-|$)/.test(name)) {
              const lit = literals(colourValue)[0];
              if (lit) addColour(lit, 3, `${prop} in ${source}`, { dark });
            }
            if (/^font-(heading|display|title|headline|serif)/.test(name)) {
              const f = primaryFamily(v);
              if (f) addFont(f, "display", 6, `${prop} in ${source}`);
            } else if (/^font-(body|sans|base|text|ui|primary|copy)/.test(name)) {
              const f = primaryFamily(v);
              if (f) addFont(f, "body", 6, `${prop} in ${source}`);
            } else if (/^font-(mono|code)/.test(name)) {
              const f = primaryFamily(v);
              if (f) addFont(f, "mono", 6, `${prop} in ${source}`);
            }
            continue;
          }
          if (COLOR_PROPS.test(prop)) {
            const buttonish = BUTTONISH.test(sel);
            const weight = /^background/.test(prop) && buttonish ? 8 : prop === "color" && /(^|[\s,>+~])a\b|link/i.test(sel) ? 3 : buttonish ? 3 : 1;
            for (const lit of literals(value)) addColour(lit, weight, `${prop} on ${shortSelector(sel)} (${source})`, { dark });
            if (/^background/.test(prop) && ROOTISH.test(sel.trim()) && !dark) {
              const c = parseColor(literals(value)[0] ?? "");
              if (c && c.l < 0.3) darkSignals.push(`dark ${prop} on ${sel} (${source})`);
            }
          } else if (prop === "font-family" || prop === "font") {
            const stack = prop === "font" ? /(?:^|\s)[\d.]+(?:px|rem|em|%|pt|vw|vh)?(?:\s*\/\s*[\d.]+\w*)?\s+(.+)$/.exec(value)?.[1] ?? "" : value;
            const f = primaryFamily(resolve(stack));
            if (!f) continue;
            if (rule.selector.startsWith("@font-face")) {
              loadedFamilies.set(canonicalFamily(f).family, `@font-face in ${source}`);
              continue;
            }
            const role: FontRole = MONO.test(sel) ? "mono" : HEADING.test(sel) ? "display" : "body";
            addFont(f, role, role === "body" ? (ROOTISH.test(sel.trim()) ? 5 : 1) : 3, `font-family on ${shortSelector(sel)} (${source})`);
          } else if (prop === "border-radius" && BUTTONISH.test(sel)) {
            const px = toPx(value);
            if (px !== null) radii.push(px);
          }
        }
      }
      for (const [family, reason] of loadedFamilies) {
        const roles = new Set(fonts.filter((f) => f.family === family).map((f) => f.role));
        if (roles.size) for (const r of roles) fonts.push({ family, role: r, score: 4, reason: `loaded via ${reason}` });
        else {
          const cat = getFont(family)?.category;
          fonts.push({ family, role: cat === "mono" ? "mono" : "body", score: 2, reason: `loaded via ${reason}` });
          if (cat === "serif" || cat === "display") fonts.push({ family, role: "display", score: 3, reason: `loaded via ${reason}` });
        }
      }

      // 3. Rank colours.
      const ranked = cluster(colours.filter((c) => !c.dark));
      const chromatic = ranked.filter((c) => !isNeutral(c.colour) && c.colour.l <= 0.97 && c.colour.l >= 0.12);
      const candidates = chromatic.length ? chromatic : ranked.filter((c) => c.strong);
      const darkRanked = cluster(colours.filter((c) => c.dark)).filter((c) => !isNeutral(c.colour));

      const brand: BrandDraft = {};
      const accent = candidates[0];
      if (accent) {
        brand.colors = { accent: toHex(accent.colour) };
        for (const r of accent.reasons.slice(0, 4)) evidence.push({ field: "colors.accent", value: brand.colors.accent!, reason: r });
        const dk = darkRanked.find((d) => hueDistance(d.colour.h, accent.colour.h) < 40 && deltaE(d.colour, accent.colour) > 0.05);
        if (dk) {
          brand.colors.accentDark = toHex(dk.colour);
          for (const r of dk.reasons.slice(0, 2)) evidence.push({ field: "colors.accentDark", value: brand.colors.accentDark, reason: r });
        }
      }

      // 4. Fonts per role.
      const fontsByRole = {} as Record<FontRole, FontCandidate[]>;
      for (const role of ["display", "body", "mono"] as const) {
        const map = new Map<string, FontCandidate>();
        for (const f of fonts.filter((x) => x.role === role)) {
          const c = map.get(f.family) ?? { family: f.family, role, score: 0, inCatalog: !!getFont(f.family), reasons: [] };
          c.score += f.score;
          if (!c.reasons.includes(f.reason)) c.reasons.push(f.reason);
          map.set(f.family, c);
        }
        fontsByRole[role] = [...map.values()].sort((a, b) => b.score - a.score || Number(b.inCatalog) - Number(a.inCatalog));
      }
      const chosen: Brand["fonts"] = {};
      const body = fontsByRole.body[0];
      if (body) chosen.body = body.family;
      const display = fontsByRole.display.find((f) => f.family !== chosen.body);
      if (display && display.score >= 3) chosen.display = display.family;
      const mono = fontsByRole.mono.find((f) => getFont(f.family)?.category === "mono" || /mono|code/i.test(f.family)) ?? fontsByRole.mono[0];
      if (mono) chosen.mono = mono.family;
      for (const role of ["display", "body", "mono"] as const) {
        const fam = chosen[role];
        if (!fam) continue;
        const cand = fontsByRole[role].find((f) => f.family === fam)!;
        for (const r of cand.reasons.slice(0, 3)) evidence.push({ field: `fonts.${role}`, value: fam, reason: r });
        if (!cand.inCatalog) evidence.push({ field: `fonts.${role}`, value: fam, reason: "not in the kit font catalog: it loads from Google Fonts by name, if it is there" });
      }
      if (Object.keys(chosen).length) brand.fonts = chosen;

      // 5. Name, theme, voice, assets.
      const name = names.sort((a, b) => b.score - a.score)[0];
      if (name) {
        brand.name = name.value;
        evidence.push({ field: "name", value: name.value, reason: name.reason });
      }
      const theme: BrandTheme = {};
      if (darkSignals.length) {
        theme.dark = true;
        for (const s of darkSignals.slice(0, 2)) evidence.push({ field: "theme.dark", value: "true", reason: s });
      }
      if (radii.length) {
        const sorted = [...radii].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)]!;
        const radius: BrandRadius = median <= 4 ? "sharp" : median >= 16 ? "round" : "default";
        if (radius !== "default") {
          theme.radius = radius;
          evidence.push({ field: "theme.radius", value: radius, reason: `button border-radius ≈ ${median}px` });
        }
      }
      if (Object.keys(theme).length) brand.theme = theme;

      const v: BrandVoice = { ...voice };
      if (copy.length && !v.examples?.length) {
        v.examples = copy.slice(0, 2).map((c) => ({ do: c.text }));
        for (const c of copy.slice(0, 2)) evidence.push({ field: "voice.examples", value: c.text, reason: `existing copy from ${c.reason}` });
      }
      if (v.tone || v.rules?.length || v.examples?.length) brand.voice = v;

      // Logo images: keep the brand's own (alt or file name matches the brand, or a generic
      // logo file name); leave out logos that name someone else (clients, partners). Unnamed
      // ones are a fallback only when nothing better was found.
      if (imgLogos.length) {
        const keys = brandKeys(host, name?.value);
        const own: typeof imgLogos = [];
        const unsure: typeof imgLogos = [];
        for (const l of imgLogos) {
          const altKey = normKey(l.alt);
          const file = (l.src.split(/[?#]/)[0]!.split("/").pop() ?? "").replace(/\.[a-z0-9]+$/i, "");
          const fileKey = normKey(file);
          const altMatch = !!altKey && keys.some((k) => altKey.includes(k) || (altKey.length >= 3 && k.includes(altKey)));
          const fileMatch = keys.some((k) => fileKey.includes(k)) || /^(site[-_]?)?logo([-_.]?(white|dark|light|black|mono|colou?r|full|mark|icon|horizontal|vertical|primary|main|\d+(x\d+)?))*$/i.test(file);
          if (altMatch || fileMatch) own.push(l);
          else if (!l.alt || l.inHeader) unsure.push(l);
        }
        const picked = own.length ? own : unsure.slice(0, 1);
        const entries = picked.map((l) => ({
          asset: {
            path: l.path,
            use: `Logo${l.alt ? ` (${l.alt})` : ""}${own.length ? "" : " (not confirmed as the brand's own; check it)"}.${logoVariant(l.src)} Keep clear space around it; don't recolour or stretch.`,
          },
          reason: `<img${l.alt ? ` alt="${l.alt}"` : ""}>${l.inHeader ? " in <header>" : ""}`,
        }));
        for (const e of entries.reverse()) if (!assets.some((a) => a.asset.path === e.asset.path)) assets.unshift(e);
        const skipped = imgLogos.length - picked.length;
        if (skipped) evidence.push({ field: "assets", value: `${skipped} other logo image${skipped === 1 ? "" : "s"} left out`, reason: "they name another organisation (clients, partners) or are unnamed product icons" });
      }
      if (assets.length) {
        brand.assets = assets.map((a) => a.asset);
        for (const a of assets) evidence.push({ field: "assets", value: a.asset.path, reason: a.reason });
      }
      return {
        brand,
        evidence,
        colours: candidates.slice(0, 8).map((c) => ({ hex: toHex(c.colour), oklch: formatOklch(c.colour), score: Math.round(c.score), reasons: c.reasons, darkOnly: false })),
        fonts: fontsByRole,
      };
    },
  };
  return collector;
}

interface Cluster {
  colour: Oklch;
  score: number;
  reasons: string[];
  strong: boolean;
}

/** Merges perceptually close colours (ΔE OK < 0.05); the best-scored member represents the group. */
function cluster(hits: ColourHit[]): Cluster[] {
  const byHex = new Map<string, Cluster>();
  for (const h of hits) {
    const key = toHex(h.colour);
    const c = byHex.get(key) ?? { colour: h.colour, score: 0, reasons: [], strong: false };
    c.score += h.score;
    c.strong ||= h.strong;
    if (!c.reasons.includes(h.reason)) c.reasons.push(h.reason);
    byHex.set(key, c);
  }
  const sorted = [...byHex.values()].sort((a, b) => b.score - a.score);
  const out: Cluster[] = [];
  for (const c of sorted) {
    const into = out.find((o) => deltaE(o.colour, c.colour) < 0.05);
    if (into) {
      into.score += c.score;
      into.strong ||= c.strong;
      for (const r of c.reasons) if (!into.reasons.includes(r)) into.reasons.push(r);
    } else out.push({ ...c, reasons: [...c.reasons] });
  }
  for (const o of out) o.reasons.sort((a, b) => reasonRank(a) - reasonRank(b));
  return out.sort((a, b) => b.score - a.score);
}

const reasonRank = (r: string) => (/theme-color|mask-icon/.test(r) ? 0 : /^--/.test(r) ? 1 : /logo|primary colour/.test(r) ? 2 : /button|btn|cta|primary/.test(r) ? 3 : 4);

/** " For dark backgrounds." for white/inverse logo files, " For light backgrounds." for dark/black ones. */
function logoVariant(src: string): string {
  const file = (src.split(/[?#]/)[0]!.split("/").pop() ?? "").toLowerCase();
  if (/(^|[-_.])(white|light|inverse|inverted|reverse|negative|on[-_]?dark)([-_.]|$)/.test(file)) return " For dark backgrounds.";
  if (/(^|[-_.])(black|dark|on[-_]?light)([-_.]|$)/.test(file)) return " For light backgrounds.";
  return "";
}

/** Lower-case ASCII letters and digits only ("İGDAŞ" → "igdas"), for name matching. */
function normKey(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Name keys a brand's own logo would carry: the host's first label and the brand name (whole and first word). */
function brandKeys(host: string, name: string | undefined): string[] {
  const keys = new Set<string>();
  const hostWord = normKey(host.split(".")[0] ?? "");
  if (hostWord.length >= 3) keys.add(hostWord);
  if (name) {
    const whole = normKey(name);
    if (whole.length >= 3) keys.add(whole);
    const first = normKey(name.split(/\s+/).find((w) => !/^(the|my|get|go|by)$/i.test(w)) ?? "");
    if (first.length >= 3) keys.add(first);
  }
  return [...keys];
}

function shortSelector(sel: string): string {
  const s = sel.replace(/\s+/g, " ").trim();
  return s.length > 48 ? `${s.slice(0, 45)}…` : s;
}

function toPx(value: string): number | null {
  const v = value.trim().split(/\s+/)[0]!;
  if (/^9{3,}px$|^50%$|^100%$/.test(v)) return 999;
  const m = /^([\d.]+)(px|rem|em)?$/.exec(v);
  if (!m) return null;
  const n = parseFloat(m[1]!);
  return m[2] === "rem" || m[2] === "em" ? n * 16 : n;
}

/**
 * Proposes a brand from a page: theme-color meta, CSS custom properties, the most-used
 * non-neutral colours (weighted towards buttons and links), logo/icon links and inline SVG
 * fills, font-family declarations and Google Fonts links, and title/description/og tags.
 *
 * @param html    The page source.
 * @param css     Contents of its linked stylesheets (the caller fetches them; see linkedStylesheets).
 * @param baseUrl The page URL, used to resolve asset links and to read the brand name from the host.
 */
export function extractBrandFromHtml(html: string, css: CssInput[] = [], baseUrl?: string): ExtractedBrand {
  const c = createBrandCollector(baseUrl);
  c.addHtml(html, "page");
  css.forEach((s, i) => (typeof s === "string" ? c.addCss(s, `stylesheet ${i + 1}`) : c.addCss(s.css, s.source)));
  const result = c.result();
  if (baseUrl) result.brand.source = { url: baseUrl };
  return result;
}
