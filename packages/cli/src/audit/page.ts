/**
 * Reads one HTML page into the facts the audit needs: head metadata, links, images, headings,
 * accessible names and visible text. Pure: takes the HTML string and its URL.
 */

import { collapse, tokenize, VOID } from "./html";

export interface PageLink {
  href: string;
  /** Absolute URL without the hash, or null for javascript:, mailto: etc. */
  url: string | null;
  text: string;
  /** No text, aria-label, title or image alt. */
  unnamed: boolean;
  rel: string;
}

export interface PageFacts {
  url: string;
  lang: string | null;
  viewport: string | null;
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  og: Record<string, string>;
  twitter: Record<string, string>;
  favicon: string | null;
  hreflang: { lang: string; href: string }[];
  jsonLd: { ok: boolean; types: string[]; error?: string }[];
  h1: string[];
  images: { src: string | null; alt: string | null; url: string | null }[];
  links: PageLink[];
  /** href="#" or href="" (without a role that makes it a button). */
  deadLinks: number;
  unnamedButtons: number;
  text: string;
  scripts: number;
}

const resolve = (href: string, base: string): string | null => {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
};

function ldTypes(value: unknown, out: Set<string>, depth = 0): void {
  if (depth > 6 || !value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const v of value) ldTypes(v, out, depth + 1);
    return;
  }
  const obj = value as Record<string, unknown>;
  const t = obj["@type"];
  if (typeof t === "string") out.add(t);
  else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && out.add(x));
  if (obj["@graph"]) ldTypes(obj["@graph"], out, depth + 1);
}

interface Collector {
  kind: "a" | "button";
  attrs: Record<string, string>;
  text: string;
  named: boolean;
}

export function analyzePage(html: string, pageUrl: string): PageFacts {
  const tokens = tokenize(html);
  let base = pageUrl;
  const facts: PageFacts = {
    url: pageUrl,
    lang: null,
    viewport: null,
    title: null,
    description: null,
    canonical: null,
    robots: null,
    og: {},
    twitter: {},
    favicon: null,
    hreflang: [],
    jsonLd: [],
    h1: [],
    images: [],
    links: [],
    deadLinks: 0,
    unnamedButtons: 0,
    text: "",
    scripts: 0,
  };
  const text: string[] = [];
  const open: Collector[] = [];
  let h1: string[] | null = null;
  let h1Depth = 0;
  let svgDepth = 0;

  const finish = (c: Collector) => {
    const name = collapse(c.text);
    const named = c.named || name.length > 0;
    if (c.kind === "a") {
      const href = c.attrs.href;
      if (href === undefined) return;
      const h = href.trim();
      const role = (c.attrs.role ?? "").toLowerCase();
      if ((h === "#" || h === "") && role !== "button") facts.deadLinks++;
      facts.links.push({ href: h, url: h.startsWith("#") || h === "" ? null : resolve(h, base), text: name.slice(0, 120), unnamed: !named, rel: (c.attrs.rel ?? "").toLowerCase() });
    } else if (!named) facts.unnamedButtons++;
  };
  const addName = (s: string) => {
    for (const c of open) c.text += ` ${s}`;
  };

  for (const t of tokens) {
    if (t.type === "text") {
      if (svgDepth === 0) text.push(t.text);
      addName(t.text);
      if (h1) h1.push(t.text);
      continue;
    }
    if (t.type === "raw") {
      if (t.name === "title") {
        if (svgDepth > 0) addName(t.text);
        else if (facts.title === null) facts.title = collapse(t.text);
      } else if (t.name === "script") {
        facts.scripts++;
        if ((t.attrs.type ?? "").toLowerCase().trim() === "application/ld+json") {
          const src = t.text.trim().replace(/^<!\[CDATA\[|\]\]>$/g, "");
          try {
            const types = new Set<string>();
            ldTypes(JSON.parse(src), types);
            facts.jsonLd.push({ ok: true, types: [...types] });
          } catch (error) {
            facts.jsonLd.push({ ok: false, types: [], error: (error as Error).message.slice(0, 160) });
          }
        }
      }
      continue;
    }
    if (t.type === "close") {
      if (t.name === "svg" && svgDepth > 0) svgDepth--;
      if (t.name === "h1" && h1) {
        if (--h1Depth <= 0) {
          facts.h1.push(collapse(h1.join(" ")));
          h1 = null;
        }
      }
      if (t.name === "a" || t.name === "button") {
        for (let i = open.length - 1; i >= 0; i--) {
          if (open[i]!.kind === t.name) {
            const [c] = open.splice(i, 1);
            finish(c!);
            break;
          }
        }
      }
      continue;
    }
    // open tag
    const a = t.attrs;
    switch (t.name) {
      case "html":
        if (a.lang !== undefined) facts.lang = a.lang.trim() || null;
        break;
      case "base":
        if (a.href) base = resolve(a.href, pageUrl) ?? base;
        break;
      case "svg":
        if (!t.selfClosing) svgDepth++;
        break;
      case "meta": {
        const name = (a.name ?? "").toLowerCase();
        const prop = (a.property ?? "").toLowerCase();
        const content = a.content ?? "";
        if (name === "viewport") facts.viewport = content;
        else if (name === "description" && facts.description === null) facts.description = collapse(content);
        else if (name === "robots" || name === "googlebot") facts.robots = [facts.robots, content].filter(Boolean).join(", ");
        else if (name.startsWith("twitter:")) facts.twitter[name.slice(8)] ??= content;
        if (prop.startsWith("og:")) facts.og[prop.slice(3)] ??= content;
        else if (!prop && name.startsWith("og:")) facts.og[name.slice(3)] ??= content;
        if (prop.startsWith("twitter:")) facts.twitter[prop.slice(8)] ??= content;
        break;
      }
      case "link": {
        const rel = (a.rel ?? "").toLowerCase().split(/\s+/);
        if (rel.includes("canonical") && facts.canonical === null && a.href) facts.canonical = resolve(a.href, base) ?? a.href;
        if (rel.includes("icon") || rel.includes("apple-touch-icon")) facts.favicon ??= a.href ?? null;
        if (rel.includes("alternate") && a.hreflang && a.href) facts.hreflang.push({ lang: a.hreflang, href: resolve(a.href, base) ?? a.href });
        break;
      }
      case "h1":
        if (svgDepth === 0) {
          if (!h1) h1 = [];
          h1Depth++;
        }
        break;
      case "img": {
        const alt = a.alt !== undefined ? a.alt : null;
        const decorative = (a.role ?? "").toLowerCase() === "presentation" || a["aria-hidden"] === "true";
        const src = a.src ?? a["data-src"] ?? null;
        facts.images.push({ src, alt: decorative && alt === null ? "" : alt, url: src && !src.startsWith("data:") ? resolve(src, base) : null });
        if (alt) addName(alt);
        break;
      }
      case "a":
      case "button": {
        const c: Collector = { kind: t.name, attrs: a, text: "", named: !!(a["aria-label"]?.trim() || a["aria-labelledby"]?.trim() || a.title?.trim()) };
        if (c.kind === "button" && (a["aria-hidden"] === "true" || a.hidden !== undefined)) c.named = true;
        if (t.selfClosing) finish(c);
        else {
          // An unclosed <a> before the next <a>: HTML closes it implicitly.
          if (t.name === "a") {
            const prev = open.findIndex((o) => o.kind === "a");
            if (prev >= 0) finish(open.splice(prev, 1)[0]!);
          }
          open.push(c);
        }
        break;
      }
      case "input": {
        const type = (a.type ?? "").toLowerCase();
        if ((type === "submit" || type === "button" || type === "reset") && !a.value?.trim() && !a["aria-label"]?.trim() && !a.title?.trim()) facts.unnamedButtons++;
        if (type === "image" && !a.alt?.trim() && !a["aria-label"]?.trim()) facts.unnamedButtons++;
        break;
      }
      default:
        break;
    }
    if (!VOID.has(t.name) && t.name !== "img" && (a["aria-label"] ?? "").trim() && t.name !== "a" && t.name !== "button") addName(a["aria-label"]!);
  }
  for (const c of open) finish(c);
  if (h1) facts.h1.push(collapse(h1.join(" ")));
  facts.text = collapse(text.join(" "));
  return facts;
}
