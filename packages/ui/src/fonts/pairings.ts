// Curated type pairings (heading + body + mono + display character) and the helpers that apply them.
import { fontStack, getFont, type GoogleFont } from "./catalog";
import { familySpec, googleFontsUrl, loadGoogleFonts, type FontRequest, type LoadGoogleFontsOptions } from "./loader";

export interface FontDisplayTokens {
  /** `--display-weight`: weight of display headings. */
  weight: number;
  /** `--display-tracking`, e.g. `"-0.02em"`. */
  tracking: string;
  /** `--display-em`: how `<em>` inside a display heading looks. */
  em: "italic" | "normal";
  /** `--display-scale`: multiplier on the display sizes (wide faces want < 1). */
  scale: number;
}

export interface FontPairing {
  id: string;
  label: string;
  /** One line: the mood and where it fits. */
  description: string;
  /** Heading family (catalog name) or a raw CSS stack. */
  heading: string;
  /** UI / body family. */
  body: string;
  /** Code, IDs and numbers. */
  mono: string;
  display: FontDisplayTokens;
  /** The preset also exists as a `[data-font="<id>"]` block in styles.css. */
  css?: boolean;
}

const SYSTEM_SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const SYSTEM_MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const d = (weight: number, tracking: string, em: "italic" | "normal", scale: number): FontDisplayTokens => ({ weight, tracking, em, scale });

/** 16 curated pairings. The first four match the `data-font` presets in styles.css (same ids). */
export const fontPairings: FontPairing[] = [
  { id: "editorial", label: "Editorial", description: "Condensed serif headlines over a warm sans. The house style.", heading: "Instrument Serif", body: "Onest", mono: "JetBrains Mono", display: d(400, "-0.01em", "italic", 1), css: true },
  { id: "grotesk", label: "Grotesk", description: "Expressive grotesque headlines; neutral text. Product and agency sites.", heading: "Bricolage Grotesque", body: "Hanken Grotesk", mono: "Geist Mono", display: d(640, "-0.035em", "normal", 0.86), css: true },
  { id: "corporate", label: "Corporate", description: "One engineered superfamily. B2B, finance, internal tools.", heading: "IBM Plex Sans", body: "IBM Plex Sans", mono: "IBM Plex Mono", display: d(600, "-0.025em", "normal", 0.8), css: true },
  { id: "system", label: "System", description: "The platform UI font. Zero downloads.", heading: SYSTEM_SANS, body: SYSTEM_SANS, mono: SYSTEM_MONO, display: d(650, "-0.03em", "normal", 0.8), css: true },
  { id: "newsroom", label: "Newsroom", description: "Optical-size text serif headlines with a calm sans. Blogs and magazines.", heading: "Newsreader", body: "Source Sans 3", mono: "IBM Plex Mono", display: d(500, "-0.02em", "italic", 0.94) },
  { id: "product", label: "Product", description: "Tight Swiss-style grotesk throughout. Developer tools and dashboards.", heading: "Geist", body: "Geist", mono: "Geist Mono", display: d(600, "-0.045em", "normal", 0.82) },
  { id: "fintech", label: "Fintech", description: "Wide geometric headlines, compact text, clear numerals. Banking and SaaS.", heading: "Sora", body: "Manrope", mono: "JetBrains Mono", display: d(600, "-0.035em", "normal", 0.8) },
  { id: "boutique", label: "Boutique", description: "Soft, wonky serif over a friendly sans. Spas, food and hospitality.", heading: "Fraunces", body: "Figtree", mono: "DM Mono", display: d(420, "-0.02em", "italic", 0.92) },
  { id: "luxe", label: "Luxe", description: "Razor-thin Didone with an airy geometric. Fashion and beauty.", heading: "Bodoni Moda", body: "Urbanist", mono: "DM Mono", display: d(500, "-0.015em", "italic", 0.96) },
  { id: "magazine", label: "Magazine", description: "High-contrast display serif over its sans sibling. Features and lookbooks.", heading: "DM Serif Display", body: "DM Sans", mono: "DM Mono", display: d(400, "-0.015em", "italic", 0.94) },
  { id: "studio", label: "Studio", description: "Extended avant-garde headlines, precise text, retro mono. Art and culture.", heading: "Syne", body: "Instrument Sans", mono: "Space Mono", display: d(700, "-0.03em", "normal", 0.8) },
  { id: "bistro", label: "Bistro", description: "Chunky warm serif with a modern sans. Cafes, bakeries, restaurants.", heading: "Young Serif", body: "Plus Jakarta Sans", mono: "JetBrains Mono", display: d(400, "-0.02em", "normal", 0.9) },
  { id: "friendly", label: "Friendly", description: "Rounded throughout. Education, health and consumer apps.", heading: "Fredoka", body: "Nunito", mono: "DM Mono", display: d(600, "-0.02em", "normal", 0.86) },
  { id: "poster", label: "Poster", description: "Condensed sports-poster headlines over a sturdy grotesk. Events and transport.", heading: "Barlow Condensed", body: "Archivo", mono: "Martian Mono", display: d(700, "-0.005em", "normal", 1.08) },
  { id: "bookish", label: "Bookish", description: "Classic Garamond headings with a screen-reading serif. Long reads and archives.", heading: "EB Garamond", body: "Literata", mono: "Fira Code", display: d(500, "-0.01em", "italic", 0.96) },
  { id: "civic", label: "Civic", description: "Open, sturdy and neutral. Public sector, HR and non-profits.", heading: "Commissioner", body: "Commissioner", mono: "IBM Plex Mono", display: d(620, "-0.025em", "normal", 0.82) },
];

/** Find a pairing by id. */
export function getFontPairing(id: string, pairings: FontPairing[] = fontPairings): FontPairing | undefined {
  return pairings.find((p) => p.id === id);
}

/** Display tokens that suit a heading family (used for custom pairings). */
export function displayTokensFor(heading: string): FontDisplayTokens {
  const f = getFont(heading);
  if (!f) return d(650, "-0.03em", "normal", 0.8);
  const w = (target: number) => clampWeight(f, target);
  switch (f.category) {
    case "serif":
      return f.style === "display" ? d(w(400), "-0.01em", "italic", 0.96) : d(w(500), "-0.02em", "italic", 0.94);
    case "condensed":
      return d(w(700), "-0.005em", "normal", 1.06);
    case "display":
      return d(w(700), "-0.03em", "normal", 0.78);
    case "rounded":
      return d(w(600), "-0.02em", "normal", 0.86);
    case "handwriting":
      return d(w(600), "0em", "normal", 1);
    case "mono":
      return d(w(600), "-0.04em", "normal", 0.74);
    default:
      return d(w(620), "-0.035em", "normal", 0.84);
  }
}

function clampWeight(f: GoogleFont, target: number): number {
  const axis = f.axes.find((a) => a.tag === "wght");
  if (axis) return Math.min(axis.max, Math.max(axis.min, target));
  return f.weights.reduce((best, x) => (Math.abs(x - target) < Math.abs(best - target) ? x : best), f.weights[0] ?? 400);
}

/** Build a pairing from any three families; display tokens follow the heading family. */
export function createFontPairing(input: { heading: string; body: string; mono?: string; id?: string; label?: string; description?: string; display?: Partial<FontDisplayTokens> }): FontPairing {
  return {
    id: input.id ?? "custom",
    label: input.label ?? "Custom",
    description: input.description ?? `${input.heading} · ${input.body}`,
    heading: input.heading,
    body: input.body,
    mono: input.mono ?? "JetBrains Mono",
    display: { ...displayTokensFor(input.heading), ...input.display },
  };
}

/** The Google Fonts families a pairing needs (skips raw CSS stacks). */
export function pairingFamilies(pairing: FontPairing): FontRequest[] {
  const out: FontRequest[] = [];
  for (const fam of [pairing.heading, pairing.body, pairing.mono]) {
    const f = getFont(fam);
    if (f && !out.some((r) => r.family === f.family)) out.push({ family: f.family });
  }
  return out;
}

/** Stylesheet URL for a pairing, or `null` when it needs no web fonts (System). */
export function pairingUrl(pairing: FontPairing, options?: Parameters<typeof googleFontsUrl>[1]): string | null {
  const fams = pairingFamilies(pairing);
  return fams.length ? googleFontsUrl(fams, options) : null;
}

export const FONT_PAIRING_VARS = ["--font-ui", "--font-heading", "--font-code", "--display-weight", "--display-tracking", "--display-em", "--display-scale"] as const;

/** The CSS custom properties a pairing sets, ready for `style` or `setProperty`. */
export function pairingVars(pairing: FontPairing): Record<(typeof FONT_PAIRING_VARS)[number], string> {
  return {
    "--font-ui": fontStack(pairing.body),
    "--font-heading": fontStack(pairing.heading),
    "--font-code": fontStack(pairing.mono),
    "--display-weight": String(pairing.display.weight),
    "--display-tracking": pairing.display.tracking,
    "--display-em": pairing.display.em,
    "--display-scale": String(pairing.display.scale),
  };
}

export interface ApplyFontPairingOptions extends LoadGoogleFontsOptions {
  /** Inject the Google Fonts stylesheet. Default `true`. */
  load?: boolean;
}

/**
 * Applies a pairing to an element: sets `data-font`, the three family tokens and the display tokens
 * as inline custom properties, and (by default) loads the families from Google Fonts.
 * Resolves when the stylesheet has loaded.
 */
export function applyFontPairing(el: HTMLElement, pairing: FontPairing, options: ApplyFontPairingOptions = {}): Promise<void> {
  const { load = true, ...loadOptions } = options;
  el.dataset.font = pairing.id;
  const vars = pairingVars(pairing);
  for (const k of FONT_PAIRING_VARS) el.style.setProperty(k, vars[k]);
  return load ? loadGoogleFonts(pairingFamilies(pairing), { document: el.ownerDocument, ...loadOptions }) : Promise.resolve();
}

/** Removes the inline pairing tokens so the `[data-font]` CSS preset (if any) applies again. */
export function clearFontPairing(el: HTMLElement): void {
  for (const k of FONT_PAIRING_VARS) el.style.removeProperty(k);
}

/** A pairing resolved for storage (localStorage, cookies): a boot script can apply it without the catalog. */
export interface StoredFontPairing {
  id: string;
  label: string;
  heading: string;
  body: string;
  mono: string;
  display: FontDisplayTokens;
  css?: boolean;
  /** Google Fonts stylesheet, `null` when none is needed. */
  href: string | null;
  /** Dedupe key of the stylesheet (lets `loadGoogleFonts` skip what the boot script loaded). */
  key: string;
  vars: Record<string, string>;
}

export function serializeFontPairing(pairing: FontPairing): StoredFontPairing {
  return {
    id: pairing.id,
    label: pairing.label,
    heading: pairing.heading,
    body: pairing.body,
    mono: pairing.mono,
    display: pairing.display,
    css: pairing.css,
    href: pairingUrl(pairing),
    key: pairingFamilies(pairing).map((f) => familySpec(f)).join("|"),
    vars: pairingVars(pairing),
  };
}

/** Reads a stored pairing back (validates the shape; unknown input returns `undefined`). */
export function parseFontPairing(value: unknown): FontPairing | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Partial<StoredFontPairing>;
  if (typeof v.id !== "string" || typeof v.heading !== "string" || typeof v.body !== "string") return undefined;
  const preset = getFontPairing(v.id);
  if (preset && preset.heading === v.heading && preset.body === v.body && preset.mono === v.mono) return preset;
  return createFontPairing({ id: v.id, label: v.label ?? "Custom", heading: v.heading, body: v.body, mono: typeof v.mono === "string" ? v.mono : undefined, display: v.display });
}

/**
 * Inline boot script (string) that applies a stored pairing before first paint. Put it in `<head>`.
 * It reads `localStorage[storageKey][field]` (a `StoredFontPairing`).
 */
export function fontBootScript(storageKey = "vamos-theme", field = "fontPairing"): string {
  return `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})||"{}"),p=s[${JSON.stringify(field)}],h=document.documentElement;if(p&&p.id){h.dataset.font=p.id;if(!p.css&&p.vars){for(var k in p.vars)h.style.setProperty(k,p.vars[k]);if(p.href){["https://fonts.googleapis.com","https://fonts.gstatic.com"].forEach(function(o,i){var c=document.createElement("link");c.rel="preconnect";c.href=o;if(i)c.crossOrigin="anonymous";document.head.appendChild(c)});var l=document.createElement("link");l.rel="stylesheet";l.href=p.href;l.setAttribute("blocking","render");l.setAttribute("data-vamos-fonts",p.key||"");l.setAttribute("data-variant","swap||1");document.head.appendChild(l)}}}}catch(e){}`;
}
