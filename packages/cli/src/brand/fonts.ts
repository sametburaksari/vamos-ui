/**
 * Font helpers for brands, backed by the kit's Google Fonts catalog (bundled at build time,
 * so the CLI has no runtime dependency on @vamos-ui/react). Pure.
 */
import { fontStack, fontSubsets, getFont, googleFonts, type GoogleFont } from "../../../ui/src/fonts/catalog";
import { googleFontsUrl } from "../../../ui/src/fonts/loader";
import { displayTokensFor, fontPairings as kitPairings, fontVar, pairingFamilies, pairingUrl, type FontDisplayTokens } from "../../../ui/src/fonts/pairings";
import type { BrandFonts } from "./types";

export { fontPairings, type FontPairing } from "../../../ui/src/fonts/pairings";
export { getFont, googleFonts, type GoogleFont };

export type FontRole = "display" | "body" | "mono" | "accent";

/** CSS variable each role sets, and the next/font variable that feeds it. */
export const FONT_ROLE_VARS: Record<FontRole, { token: string; loaded: string; fallback: string }> = {
  display: { token: "--font-heading", loaded: "--ff-brand-display", fallback: "ui-serif, Georgia, serif" },
  body: { token: "--font-ui", loaded: "--ff-brand-body", fallback: "ui-sans-serif, system-ui, sans-serif" },
  mono: { token: "--font-code", loaded: "--ff-brand-mono", fallback: 'ui-monospace, "SF Mono", Menlo, monospace' },
  accent: { token: "--font-accent", loaded: "--ff-brand-accent", fallback: "cursive" },
};

/** The roles a brand can set, in the order brand.css and the font snippets write them. */
export const FONT_ROLES = ["display", "body", "mono", "accent"] as const;

const GENERIC = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace", "ui-rounded",
  "-apple-system", "blinkmacsystemfont", "segoe ui", "helvetica neue", "helvetica", "arial", "inherit", "initial", "unset", "revert",
  "emoji", "math", "apple color emoji", "segoe ui emoji", "segoe ui symbol", "noto color emoji", "sf mono", "menlo", "consolas",
  "monaco", "courier new", "courier", "times new roman", "times", "georgia", "verdana", "tahoma", "liberation mono",
  "sfmono-regular", "lucida console", "lucida grande", "dejavu sans mono", "cascadia code",
]);

/** Is this a generic family or a system font (not something a brand loads)? */
export const isGenericFamily = (family: string) => GENERIC.has(family.trim().toLowerCase());

/**
 * Cleans a family name from CSS: strips quotes and next/font hashes
 * (`__Inter_d65c78` → `Inter`, `__Playfair_Display_8a1b` → `Playfair Display`).
 * Returns null for fallbacks such as `__Inter_Fallback_d65c78`.
 */
export function cleanFamily(raw: string): string | null {
  let f = raw.trim().replace(/^["']|["']$/g, "").trim();
  if (!f) return null;
  const next = /^__(.+?)_[0-9a-f]{4,8}$/i.exec(f);
  if (next) {
    if (/_Fallback$/i.test(next[1]!)) return null;
    f = next[1]!.replace(/_/g, " ");
  }
  return f;
}

/** First brand-worthy family in a `font-family` stack. */
export function primaryFamily(stack: string): string | null {
  for (const part of stack.split(",")) {
    if (/var\(/.test(part)) continue;
    const f = cleanFamily(part);
    if (f && !isGenericFamily(f)) return f;
  }
  return null;
}

/** Canonical catalog name for a family, or the cleaned input when it is not in the catalog. */
export function canonicalFamily(family: string): { family: string; font?: GoogleFont } {
  const f = getFont(family.trim());
  return f ? { family: f.family, font: f } : { family: family.trim() };
}

/** Value of the role variable: next/font variable first, then the named family, then the fallback. */
export function roleStack(role: FontRole, family: string): string {
  const vars = FONT_ROLE_VARS[role];
  const font = getFont(family);
  const stack = font ? fontStack(font.family) : `"${family.replace(/"/g, "")}", ${vars.fallback}`;
  return `var(${vars.loaded}, ${stack})`;
}

export function displayTokens(display: string | undefined): FontDisplayTokens | null {
  return display ? displayTokensFor(display) : null;
}

/** Catalog families among the brand fonts, in display/body/mono order, deduplicated. */
export function brandFamilies(fonts: BrandFonts): GoogleFont[] {
  const out: GoogleFont[] = [];
  for (const role of FONT_ROLES) {
    const f = fonts[role] ? getFont(fonts[role]!) : undefined;
    if (f && !out.includes(f)) out.push(f);
  }
  return out;
}

/** Google Fonts stylesheet URL for the brand fonts (catalog or not), or null when there are none. */
export function brandFontsUrl(fonts: BrandFonts): string | null {
  const names = [...new Set(FONT_ROLES.map((r) => fonts[r]).filter((f): f is string => !!f && !isGenericFamily(f)))];
  return names.length ? googleFontsUrl(names.map((n) => canonicalFamily(n).family)) : null;
}

/** <link> tags for plain HTML / Vite. */
export function googleFontsLinks(fonts: BrandFonts): string | null {
  const url = brandFontsUrl(fonts);
  if (!url) return null;
  return [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${url.replace(/&/g, "&amp;")}">`,
  ].join("\n");
}

const ident = (family: string) => family.replace(/[^A-Za-z0-9]+/g, "_").replace(/^(\d)/, "_$1");

/**
 * next/font/google setup for the brand fonts: the import, one loader per family and the
 * className expression for <html>. Families outside the catalog are passed through by name.
 */
export function nextFontSnippet(fonts: BrandFonts): { code: string; classNames: string[] } | null {
  const roles = FONT_ROLES.filter((r) => fonts[r] && !isGenericFamily(fonts[r]!));
  if (!roles.length) return null;
  const imports = new Set<string>();
  const lines: string[] = [];
  const classNames: string[] = [];
  for (const role of roles) {
    const { family, font } = canonicalFamily(fonts[role]!);
    const fn = ident(family);
    imports.add(fn);
    const opts: string[] = [`subsets: [${(font ? fontSubsets(font) : ["latin", "latin-ext"]).map((x) => `"${x}"`).join(", ")}]`];
    const variable = font?.axes.some((a) => a.tag === "wght");
    if (font && !variable) opts.push(`weight: [${font.weights.map((w) => `"${w}"`).join(", ")}]`);
    if (font?.italics) opts.push(`style: ["normal", "italic"]`);
    opts.push(`variable: "${FONT_ROLE_VARS[role].loaded}"`);
    lines.push(`const ${role}Font = ${fn}({ ${opts.join(", ")} });`);
    classNames.push(`\${${role}Font.variable}`);
  }
  const code = [`import { ${[...imports].join(", ")} } from "next/font/google";`, "", ...lines].join("\n");
  return { code, classNames };
}

/** Catalog search for pickers: family, id, category, style and the use note. */
export function searchFonts(query: string, role?: FontRole): GoogleFont[] {
  const q = query.trim().toLowerCase();
  const inRole = (f: GoogleFont) => (role === "mono" ? f.category === "mono" : role === "body" ? !["mono", "handwriting", "display"].includes(f.category) : f.category !== "mono");
  const pool = role ? [...googleFonts.filter(inRole), ...googleFonts.filter((f) => !inRole(f))] : googleFonts;
  if (!q) return pool;
  return pool.filter((f) => `${f.family} ${f.id} ${f.category} ${f.style ?? ""} ${f.use}`.toLowerCase().includes(q));
}

/**
 * How to load a kit pairing the app does not load yet (`theme --font newsroom`, a family preset):
 * next/font loaders named after the `--ff-*` variables its `[data-font]` block reads, or the
 * Google Fonts <link>. Null for the classic four (the scaffold loads them) and for System.
 */
export function fontLoadSnippet(pairingId: string, framework: string): string | null {
  const pairing = kitPairings.find((p) => p.id === pairingId);
  if (!pairing || pairing.css) return null;
  const url = pairingUrl(pairing);
  if (!url) return null;
  if (framework !== "next") {
    return [
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      `<link rel="stylesheet" href="${url.replace(/&/g, "&amp;")}">`,
    ].join("\n");
  }
  const imports: string[] = [];
  const lines: string[] = [];
  const vars: string[] = [];
  for (const req of pairingFamilies(pairing)) {
    const font = getFont(req.family)!;
    const fn = ident(font.family);
    const v = fontVar(font.family)!;
    const name = v.slice(5).replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
    imports.push(fn);
    const opts = [`subsets: [${fontSubsets(font).map((x) => `"${x}"`).join(", ")}]`];
    if (!font.axes.some((a) => a.tag === "wght")) opts.push(`weight: [${font.weights.map((w) => `"${w}"`).join(", ")}]`);
    if (font.italics) opts.push(`style: ["normal", "italic"]`);
    opts.push(`variable: "${v}"`);
    lines.push(`const ${name} = ${fn}({ ${opts.join(", ")} });`);
    vars.push(`\${${name}.variable}`);
  }
  return [`import { ${imports.join(", ")} } from "next/font/google";`, "", ...lines, "", `// <html className={\`${vars.join(" ")}\`} data-font="${pairing.id}">`].join("\n");
}
