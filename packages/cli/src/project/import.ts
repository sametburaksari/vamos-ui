/**
 * Reads a current website into drafts for a new one: brand (logo, colours, fonts), business
 * details for vamos.site.json (name, description, phone, email, WhatsApp, address, hours, social
 * profiles, languages), the navigation (to keep URLs that rank), headings and text per page,
 * and content images. Every value carries the page it came from; nothing is written anywhere,
 * the caller shows the drafts and the user confirms them.
 *
 * Pure apart from the injected fetch, so the hosted MCP server can pass its guarded fetch.
 */

import type { ExtractedBrand } from "../brand/extract";
import { createBrandCollector, linkedStylesheets } from "../brand/extract";
import { request, type FetchLike, type HttpOptions } from "../audit/fetch";
import { collapse, tokenize, type Token } from "../audit/html";
import type { SiteInfo } from "../site-info";

export interface ImportOptions {
  fetch?: FetchLike;
  /** Called before every request (the hosted server refuses private addresses here). */
  guard?: (url: URL) => void | Promise<void>;
  /** Pages to read besides the start page (about, contact, services first). Default 4. */
  maxPages?: number;
  /** Stylesheets to read per site. Default 6. */
  maxStylesheets?: number;
  timeoutMs?: number;
  deadlineMs?: number;
  maxBytes?: number;
  userAgent?: string;
}

export interface ImportedValue<T = string> {
  value: T;
  /** URL of the page (or stylesheet) it came from. */
  source: string;
  /** How it was found, e.g. `tel: link`, `JSON-LD LocalBusiness`, `<meta name="description">`. */
  how: string;
}

export interface ImportedPage {
  url: string;
  path: string;
  title: string | null;
  headings: { level: number; text: string }[];
  /** Paragraph text, longest first is not applied: page order, short fragments dropped. */
  paragraphs: string[];
}

export interface SiteImport {
  url: string;
  finalUrl: string;
  /** Business details found, field by field, with sources. */
  found: {
    name?: ImportedValue;
    description?: ImportedValue;
    phone?: ImportedValue[];
    whatsapp?: ImportedValue[];
    email?: ImportedValue[];
    address?: ImportedValue<NonNullable<SiteInfo["address"]>>;
    geo?: ImportedValue<NonNullable<SiteInfo["geo"]>>;
    openingHours?: ImportedValue<string[]>;
    social?: ImportedValue[];
    languages?: ImportedValue<string[]>;
    legalName?: ImportedValue;
  };
  /** Draft vamos.site.json values built from `found` (first value of each). */
  site: Partial<SiteInfo>;
  /** Brand extraction (colours, fonts, logo assets) across the pages and their stylesheets. */
  brand: ExtractedBrand;
  /** Same-site navigation links (header / nav / footer), path + label. */
  navigation: { path: string; label: string }[];
  pages: ImportedPage[];
  /** Content images (not logos, icons or tracking pixels), with alt text. */
  images: { url: string; alt: string; source: string }[];
  /** Things that went wrong (unreachable page, refused URL); the import still returns what it has. */
  warnings: string[];
}

const SOCIAL = /^(?:https?:\/\/)?(?:www\.|m\.|tr\.)?(instagram\.com|facebook\.com|fb\.com|linkedin\.com|x\.com|twitter\.com|youtube\.com|tiktok\.com|pinterest\.com|behance\.net|dribbble\.com|github\.com|g\.page|maps\.app\.goo\.gl|wa\.me)\//i;
const PRIORITY = /(hakk[iı]m[iı]zda|about|iletisim|contact|hizmet|service|urun|product|menu|kurumsal|biz-kimiz|ekip|team)/i;
const SKIP_PATH = /\.(?:pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?)$|^\/(?:wp-admin|wp-login|cart|sepet|checkout|odeme|login|giris|account|hesabim)/i;

const toE164ish = (raw: string) => raw.replace(/[^\d+]/g, "");
const isPlaceholderLike = (digits: string) => /^(?:\+?90)?0?5?0{5,}|1234567|(\d)\1{6,}/.test(digits.replace(/\+/g, ""));

/** Reads one HTML page into tokens-derived facts. Exported for tests. */
export function readPage(html: string, url: string) {
  const tokens = tokenize(html);
  const base = new URL(url);
  const abs = (href: string): string | null => {
    try {
      const u = new URL(href, base);
      return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
    } catch {
      return null;
    }
  };

  let title: string | null = null;
  let lang: string | null = null;
  const meta: Record<string, string> = {};
  const hreflang: string[] = [];
  const jsonLd: unknown[] = [];
  const headings: { level: number; text: string }[] = [];
  const paragraphs: string[] = [];
  const links: { href: string; text: string; inNav: boolean }[] = [];
  const images: { src: string; alt: string; logoLike: boolean; width: number }[] = [];

  // Element stack to know whether we are inside header/nav/footer, a heading, a paragraph or a link.
  const stack: { name: string; attrs: Record<string, string> }[] = [];
  let capture: { kind: "h" | "p" | "a"; level?: number; href?: string; inNav?: boolean; text: string } | null = null;
  const inNav = () => stack.some((e) => e.name === "nav" || e.name === "header" || e.name === "footer" || /\b(?:nav|menu|header|footer)\b/i.test(e.attrs.class ?? "") || e.attrs.role === "navigation");
  const inHeader = () => stack.some((e) => e.name === "header" || /\bheader\b|\bnavbar\b|\blogo\b|\bbrand\b/i.test(`${e.attrs.class ?? ""} ${e.attrs.id ?? ""}`));

  const flush = () => {
    if (!capture) return;
    const text = collapse(capture.text);
    if (capture.kind === "h" && text) headings.push({ level: capture.level!, text });
    if (capture.kind === "p" && text.length >= 40) paragraphs.push(text);
    if (capture.kind === "a" && capture.href) links.push({ href: capture.href, text, inNav: !!capture.inNav });
    capture = null;
  };

  for (const tok of tokens as Token[]) {
    if (tok.type === "raw") {
      if (tok.name === "title") title = collapse(tok.text) || title;
      if (tok.name === "script" && /ld\+json/i.test(tok.attrs.type ?? "")) {
        try {
          jsonLd.push(JSON.parse(tok.text));
        } catch {
          /* invalid JSON-LD is the audit's business */
        }
      }
      continue;
    }
    if (tok.type === "text") {
      if (capture) capture.text += tok.text;
      continue;
    }
    if (tok.type === "open") {
      const { name, attrs } = tok;
      if (name === "html" && attrs.lang) lang = attrs.lang;
      if (name === "meta") {
        const key = (attrs.name ?? attrs.property ?? "").toLowerCase();
        if (key && attrs.content) meta[key] = collapse(attrs.content);
      }
      if (name === "link" && (attrs.rel ?? "").toLowerCase() === "alternate" && attrs.hreflang) hreflang.push(attrs.hreflang);
      if (name === "img") {
        const src = attrs.src || attrs["data-src"] || (attrs.srcset ?? "").split(/\s+/)[0] || "";
        const u = src ? abs(src) : null;
        if (u && !u.startsWith("data:")) {
          const hint = `${attrs.alt ?? ""} ${attrs.class ?? ""} ${attrs.id ?? ""} ${src}`;
          images.push({ src: u, alt: collapse(attrs.alt ?? ""), logoLike: /logo|brand/i.test(hint) || inHeader(), width: Number(attrs.width) || 0 });
        }
        if (capture && attrs.alt) capture.text += ` ${attrs.alt}`;
      }
      if (/^h[1-3]$/.test(name)) {
        flush();
        capture = { kind: "h", level: Number(name[1]), text: "" };
      } else if (name === "p") {
        flush();
        capture = { kind: "p", text: "" };
      } else if (name === "a" && attrs.href) {
        if (!capture || capture.kind === "a") {
          flush();
          capture = { kind: "a", href: attrs.href, inNav: inNav(), text: attrs["aria-label"] ?? attrs.title ?? "" };
        } else links.push({ href: attrs.href, text: collapse(attrs["aria-label"] ?? attrs.title ?? ""), inNav: inNav() });
      }
      if (!tok.selfClosing && !["img", "meta", "link", "br", "hr", "input", "source", "wbr"].includes(name)) stack.push({ name, attrs });
      continue;
    }
    if (tok.type === "close") {
      if ((tok.name === "a" && capture?.kind === "a") || (tok.name === "p" && capture?.kind === "p") || (/^h[1-3]$/.test(tok.name) && capture?.kind === "h")) flush();
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i]!.name === tok.name) {
          stack.length = i;
          break;
        }
      }
    }
  }
  flush();
  return { title, lang, meta, hreflang, jsonLd, headings, paragraphs, links, images, abs };
}

/** Flattens JSON-LD (arrays, @graph) into objects. */
function ldNodes(value: unknown, out: Record<string, unknown>[] = [], depth = 0): Record<string, unknown>[] {
  if (depth > 5 || !value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const v of value) ldNodes(v, out, depth + 1);
    return out;
  }
  const obj = value as Record<string, unknown>;
  out.push(obj);
  if (obj["@graph"]) ldNodes(obj["@graph"], out, depth + 1);
  return out;
}

const ORG_TYPES = /Organization|LocalBusiness|Store|Restaurant|ProfessionalService|Corporation|Place|Person|NGO|MedicalBusiness|Service/;

export async function importSite(input: string, options: ImportOptions = {}): Promise<SiteImport> {
  const started = Date.now();
  const deadline = options.deadlineMs ?? 40_000;
  const http: HttpOptions = {
    fetch: options.fetch ?? ((u, init) => fetch(u, init)),
    userAgent: options.userAgent ?? "vamos-ui-import (+https://ui.vamos.ist/docs/cli)",
    timeoutMs: options.timeoutMs ?? 10_000,
    maxBytes: options.maxBytes ?? 3 * 1024 * 1024,
    maxRedirects: 5,
    guard: options.guard,
    remaining: () => deadline - (Date.now() - started),
  };
  let url = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
  try {
    url = new URL(url).href;
  } catch {
    /* request() reports the invalid URL */
  }
  const warnings: string[] = [];
  const collector = createBrandCollector(url);
  const found: SiteImport["found"] = {};
  const pages: ImportedPage[] = [];
  const images: SiteImport["images"] = [];
  const navigation = new Map<string, string>();
  const phones = new Map<string, ImportedValue>();
  const whatsapps = new Map<string, ImportedValue>();
  const emails = new Map<string, ImportedValue>();
  const socials = new Map<string, ImportedValue>();
  const sheets = new Set<string>();

  const home = await request(url, "GET", http);
  if (!home.body || home.status >= 400) {
    warnings.push(home.error ? `Could not read ${url}: ${home.error}` : `${url} answered HTTP ${home.status}.`);
    return { url, finalUrl: home.finalUrl, found, site: {}, brand: collector.result(), navigation: [], pages, images, warnings };
  }
  const origin = new URL(home.finalUrl).origin;

  const readOne = (html: string, pageUrl: string, isHome: boolean) => {
    const p = readPage(html, pageUrl);
    collector.addHtml(html, pageUrl);
    for (const s of linkedStylesheets(html, pageUrl)) sheets.add(s);
    const path = new URL(pageUrl).pathname || "/";
    pages.push({ url: pageUrl, path, title: p.title, headings: p.headings.slice(0, 40), paragraphs: p.paragraphs.slice(0, 30) });

    if (isHome) {
      const name = p.meta["og:site_name"] ?? p.meta["application-name"];
      if (name) found.name = { value: name, source: pageUrl, how: name === p.meta["og:site_name"] ? '<meta property="og:site_name">' : '<meta name="application-name">' };
      const desc = p.meta.description ?? p.meta["og:description"];
      if (desc) found.description = { value: desc, source: pageUrl, how: p.meta.description ? '<meta name="description">' : '<meta property="og:description">' };
      const langs = [...new Set([p.lang, ...p.hreflang].filter((x): x is string => !!x && x !== "x-default"))];
      if (langs.length) found.languages = { value: langs, source: pageUrl, how: "<html lang> and hreflang links" };
    }

    for (const node of p.jsonLd.flatMap((v) => ldNodes(v))) {
      const type = String(([] as unknown[]).concat(node["@type"] ?? "").join(" "));
      if (!ORG_TYPES.test(type)) continue;
      const how = `JSON-LD ${type}`;
      if (typeof node.name === "string" && !found.name) found.name = { value: node.name, source: pageUrl, how };
      if (typeof node.legalName === "string") found.legalName ??= { value: node.legalName, source: pageUrl, how };
      if (typeof node.description === "string" && !found.description) found.description = { value: node.description, source: pageUrl, how };
      for (const tel of ([] as unknown[]).concat(node.telephone ?? [])) if (typeof tel === "string") addPhone(tel, pageUrl, how);
      for (const mail of ([] as unknown[]).concat(node.email ?? [])) if (typeof mail === "string") addEmail(mail.replace(/^mailto:/i, ""), pageUrl, how);
      const addr = node.address as Record<string, unknown> | undefined;
      if (addr && typeof addr === "object" && !found.address) {
        const a: NonNullable<SiteInfo["address"]> = {};
        if (typeof addr.streetAddress === "string") a.street = addr.streetAddress;
        // schema.org: addressLocality is the town / district (ilçe), addressRegion the province (il).
        if (typeof addr.addressLocality === "string") a.district = addr.addressLocality;
        if (typeof addr.addressRegion === "string") a.city = addr.addressRegion;
        if (typeof addr.postalCode === "string") a.postalCode = addr.postalCode;
        if (typeof addr.addressCountry === "string") a.country = addr.addressCountry;
        if (Object.keys(a).length) found.address = { value: a, source: pageUrl, how };
      }
      const geo = node.geo as Record<string, unknown> | undefined;
      if (geo && !found.geo && Number.isFinite(Number(geo.latitude)) && Number.isFinite(Number(geo.longitude))) found.geo = { value: { latitude: Number(geo.latitude), longitude: Number(geo.longitude) }, source: pageUrl, how };
      const hours = ([] as unknown[]).concat(node.openingHours ?? []).filter((h): h is string => typeof h === "string");
      if (hours.length && !found.openingHours) found.openingHours = { value: hours, source: pageUrl, how };
      for (const s of ([] as unknown[]).concat(node.sameAs ?? [])) if (typeof s === "string" && SOCIAL.test(s)) addSocial(s, pageUrl, how);
    }

    for (const l of p.links) {
      const href = l.href.trim();
      if (/^tel:/i.test(href)) addPhone(decodeURIComponent(href.slice(4)), pageUrl, "tel: link");
      else if (/^mailto:/i.test(href)) addEmail(decodeURIComponent(href.slice(7).split("?")[0]!), pageUrl, "mailto: link");
      else if (/^(?:https?:\/\/)?(?:wa\.me\/|api\.whatsapp\.com\/send|web\.whatsapp\.com\/send)/i.test(href)) {
        const num = /wa\.me\/(\+?\d+)/i.exec(href)?.[1] ?? /phone=(\+?\d+)/i.exec(href)?.[1];
        if (num && !isPlaceholderLike(num)) whatsapps.set(toE164ish(num), { value: toE164ish(num), source: pageUrl, how: "WhatsApp link" });
      } else if (SOCIAL.test(href)) addSocial(href, pageUrl, "link on the page");
      else {
        const abs = p.abs(href);
        if (abs && new URL(abs).origin === origin && l.inNav && l.text) {
          const u = new URL(abs);
          const path = u.pathname.replace(/\/+$/, "") || "/";
          if (path !== "/" && !SKIP_PATH.test(path) && path.split("/").length <= 3 && l.text.length <= 40 && !navigation.has(path)) navigation.set(path, l.text);
        }
      }
    }

    for (const img of p.images) {
      if (img.logoLike || /\.svg(?:$|\?)/i.test(img.src) || /pixel|spacer|tracking|facebook\.com\/tr|1x1/i.test(img.src) || (img.width && img.width < 120)) continue;
      if (!images.some((i) => i.url === img.src) && images.length < 30) images.push({ url: img.src, alt: img.alt, source: pageUrl });
    }
  };

  function addPhone(raw: string, source: string, how: string) {
    const v = toE164ish(raw);
    if (v.replace(/\D/g, "").length < 7 || isPlaceholderLike(v)) return;
    if (!phones.has(v)) phones.set(v, { value: raw.trim(), source, how });
  }
  function addEmail(raw: string, source: string, how: string) {
    const v = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) || /example\.|ornek\.|@domain\.|sentry|wixpress/.test(v)) return;
    if (!emails.has(v)) emails.set(v, { value: v, source, how });
  }
  function addSocial(raw: string, source: string, how: string) {
    let v = raw.trim();
    if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
    v = v.replace(/\/+$/, "").replace(/\?.*$/, "");
    if (/\/(?:sharer|share|intent|plugins|dialog)\b/i.test(v)) return;
    if (!socials.has(v.toLowerCase())) socials.set(v.toLowerCase(), { value: v, source, how });
  }

  readOne(home.body, home.finalUrl, true);

  // A few more pages: about / contact / services first, then the rest of the navigation.
  const maxPages = options.maxPages ?? 4;
  const candidates = [...navigation.keys()].filter((p) => p !== "/" && p !== new URL(home.finalUrl).pathname.replace(/\/+$/, ""));
  candidates.sort((x, y) => Number(PRIORITY.test(y)) - Number(PRIORITY.test(x)));
  for (const path of candidates.slice(0, maxPages)) {
    if (http.remaining() <= 2_000) {
      warnings.push("Stopped early: time limit.");
      break;
    }
    const res = await request(origin + path, "GET", http);
    if (res.body && res.status < 400 && /html/i.test(res.headers?.get("content-type") ?? "text/html")) readOne(res.body, res.finalUrl, false);
    else if (res.refused || res.error) warnings.push(`Skipped ${path}: ${res.error ?? `HTTP ${res.status}`}`);
  }

  // Stylesheets (same site or font hosts) for colours and fonts.
  const maxSheets = options.maxStylesheets ?? 6;
  for (const sheet of [...sheets].slice(0, maxSheets)) {
    if (http.remaining() <= 1_000) break;
    const res = await request(sheet, "GET", { ...http, maxBytes: Math.min(http.maxBytes, 800 * 1024) });
    if (res.body && res.status < 400) collector.addCss(res.body, sheet);
  }

  if (phones.size > 1) warnings.push(`Different phone numbers on the site: ${[...phones.values()].map((v) => `${v.value} (${v.how}, ${new URL(v.source).pathname})`).join("; ")}. Keep one and update the others.`);
  if (emails.size > 2) warnings.push(`${emails.size} different email addresses on the site; check which one should receive messages.`);
  if (phones.size) found.phone = [...phones.values()];
  if (whatsapps.size) found.whatsapp = [...whatsapps.values()];
  if (emails.size) found.email = [...emails.values()];
  if (socials.size) found.social = [...socials.values()];
  if (!found.name) {
    const t = pages[0]?.title?.split(/\s[|–—·-]\s/)[0]?.trim();
    if (t) found.name = { value: t, source: home.finalUrl, how: "<title> (before the separator)" };
  }

  const brand = collector.result();
  brand.brand.source = { url: home.finalUrl };

  return {
    url,
    finalUrl: home.finalUrl,
    found,
    site: siteFromImport(found, origin),
    brand,
    navigation: [...navigation].map(([path, label]) => ({ path, label })),
    pages,
    images,
    warnings,
  };
}

/** Draft vamos.site.json fields from what was found (first value of each). */
export function siteFromImport(found: SiteImport["found"], origin: string): Partial<SiteInfo> {
  const site: Partial<SiteInfo> = { url: origin };
  if (found.name) site.name = found.name.value;
  if (found.legalName) site.legalName = found.legalName.value;
  if (found.description) site.description = found.description.value;
  const langs = found.languages?.value ?? [];
  if (langs[0]) site.locale = langs[0].includes("-") ? langs[0] : { tr: "tr-TR", en: "en-US", de: "de-DE" }[langs[0]] ?? langs[0];
  if (langs.length > 1) site.locales = langs;
  const contact: NonNullable<SiteInfo["contact"]> = {};
  if (found.phone?.[0]) contact.phone = found.phone[0].value;
  if (found.whatsapp?.[0]) contact.whatsapp = found.whatsapp[0].value;
  if (found.email?.[0]) contact.email = found.email[0].value;
  if (Object.keys(contact).length) site.contact = contact;
  if (found.address) site.address = found.address.value;
  if (found.geo) site.geo = found.geo.value;
  if (found.openingHours) site.openingHours = found.openingHours.value;
  if (found.social?.length) site.social = found.social.map((s) => s.value);
  return site;
}
