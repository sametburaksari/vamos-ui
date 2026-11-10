// Google Fonts catalog for Vamos UI. Generated from https://fonts.google.com/metadata/fonts
// (2026-11-10) and curated by hand. Every family covers latin-ext (Turkish ğ ş ı İ ç ö ü).

export type FontCategory = "sans" | "serif" | "display" | "rounded" | "condensed" | "mono" | "handwriting";
/** Sub-classification inside `sans` (geometric · humanist · grotesk) and `serif` (text · display). */
export type FontStyle = "geometric" | "humanist" | "grotesk" | "text" | "display";

export interface FontAxis {
  /** OpenType axis tag: `wght`, `opsz`, `wdth`, `ital`, `slnt` or a custom one (`SOFT`, `WONK`…). */
  tag: string;
  min: number;
  max: number;
}

export interface GoogleFont {
  /** Exact Google Fonts family name, e.g. `"Bricolage Grotesque"`. */
  family: string;
  /** URL-safe id, e.g. `"bricolage-grotesque"`. */
  id: string;
  category: FontCategory;
  style?: FontStyle;
  /** Available weights (static instances, or named stops of the variable range). */
  weights: number[];
  /** Has true italics. */
  italics: boolean;
  /** Variable axes; empty for static families. */
  axes: FontAxis[];
  /** Character subsets offered by Google Fonts. */
  subsets: string[];
  /** One line: what it is good for. */
  use: string;
}

export interface FontGroup {
  id: string;
  label: string;
  category: FontCategory;
  style?: FontStyle;
}

/** The catalog, grouped in display order. */
export const fontGroups: FontGroup[] = [
  { id: "sans-geometric", label: "Sans · Geometric", category: "sans", style: "geometric" },
  { id: "sans-humanist", label: "Sans · Humanist", category: "sans", style: "humanist" },
  { id: "sans-grotesk", label: "Sans · Grotesk", category: "sans", style: "grotesk" },
  { id: "serif-text", label: "Serif · Text", category: "serif", style: "text" },
  { id: "serif-display", label: "Serif · Display", category: "serif", style: "display" },
  { id: "display", label: "Display", category: "display" },
  { id: "rounded", label: "Rounded", category: "rounded" },
  { id: "condensed", label: "Condensed", category: "condensed" },
  { id: "mono", label: "Mono", category: "mono" },
  { id: "handwriting", label: "Handwriting", category: "handwriting" },
];

/** Top-level categories with labels, in display order. */
export const fontCategories: { id: FontCategory; label: string }[] = [
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "display", label: "Display" },
  { id: "rounded", label: "Rounded" },
  { id: "condensed", label: "Condensed" },
  { id: "mono", label: "Mono" },
  { id: "handwriting", label: "Handwriting" },
];

/** 59 Google Fonts families, all with latin-ext. */
export const googleFonts: GoogleFont[] = [
  { family: "Outfit", id: "outfit", category: "sans", style: "geometric", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: false, axes: [{ tag: "wght", min: 100, max: 900 }], subsets: ["latin", "latin-ext"], use: "Product UI and SaaS sites; clean circles, friendly at every weight." },
  { family: "Sora", id: "sora", category: "sans", style: "geometric", weights: [100, 200, 300, 400, 500, 600, 700, 800], italics: false, axes: [{ tag: "wght", min: 100, max: 800 }], subsets: ["latin", "latin-ext"], use: "Tech and fintech headlines; wide, confident and slightly futuristic." },
  { family: "Plus Jakarta Sans", id: "plus-jakarta-sans", category: "sans", style: "geometric", weights: [200, 300, 400, 500, 600, 700, 800], italics: true, axes: [{ tag: "wght", min: 200, max: 800 }], subsets: ["cyrillic-ext", "latin", "latin-ext", "vietnamese"], use: "Modern dashboards and marketing; open counters, crisp at 13px." },
  { family: "Manrope", id: "manrope", category: "sans", style: "geometric", weights: [200, 300, 400, 500, 600, 700, 800], italics: false, axes: [{ tag: "wght", min: 200, max: 800 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "latin", "latin-ext", "vietnamese"], use: "Dense admin tables; semi-condensed geometry with clear numerals." },
  { family: "Urbanist", id: "urbanist", category: "sans", style: "geometric", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 100, max: 900 }], subsets: ["latin", "latin-ext"], use: "Fashion, hospitality and lifestyle brands; airy and elegant." },
  { family: "Lexend", id: "lexend", category: "sans", style: "geometric", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: false, axes: [{ tag: "wght", min: 100, max: 900 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Long reading and accessibility-first UIs; tuned for reading speed." },
  { family: "Red Hat Display", id: "red-hat-display", category: "sans", style: "geometric", weights: [300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 300, max: 900 }], subsets: ["latin", "latin-ext"], use: "Bold product headlines; pairs with Red Hat Mono." },
  { family: "Onest", id: "onest", category: "sans", style: "humanist", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: false, axes: [{ tag: "wght", min: 100, max: 900 }], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "math", "symbols", "vietnamese"], use: "Default UI face; warm, compact and very legible in Turkish." },
  { family: "Figtree", id: "figtree", category: "sans", style: "humanist", weights: [300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 300, max: 900 }], subsets: ["latin", "latin-ext"], use: "Friendly product UI and onboarding; soft geometric-humanist hybrid." },
  { family: "DM Sans", id: "dm-sans", category: "sans", style: "humanist", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], italics: true, axes: [{ tag: "opsz", min: 9, max: 40 }, { tag: "wght", min: 100, max: 1000 }], subsets: ["latin", "latin-ext"], use: "Low-contrast UI text; optical sizes keep small labels open." },
  { family: "IBM Plex Sans", id: "ibm-plex-sans", category: "sans", style: "humanist", weights: [100, 200, 300, 400, 500, 600, 700], italics: true, axes: [{ tag: "wdth", min: 75, max: 100 }, { tag: "wght", min: 100, max: 700 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "latin", "latin-ext", "vietnamese"], use: "Corporate, finance and B2B panels; engineered and neutral." },
  { family: "Source Sans 3", id: "source-sans-3", category: "sans", style: "humanist", weights: [200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 200, max: 900 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "greek-ext", "latin", "latin-ext", "vietnamese"], use: "Long forms and documentation; calm, proven workhorse." },
  { family: "Instrument Sans", id: "instrument-sans", category: "sans", style: "humanist", weights: [400, 500, 600, 700], italics: true, axes: [{ tag: "wdth", min: 75, max: 100 }, { tag: "wght", min: 400, max: 700 }], subsets: ["latin", "latin-ext"], use: "Editorial sites and studios; precise with a width axis." },
  { family: "Commissioner", id: "commissioner", category: "sans", style: "humanist", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: false, axes: [{ tag: "FLAR", min: 0, max: 100 }, { tag: "VOLM", min: 0, max: 100 }, { tag: "slnt", min: -12, max: 0 }, { tag: "wght", min: 100, max: 900 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "latin", "latin-ext", "vietnamese"], use: "Civic and public-sector UIs; flared variant for headings." },
  { family: "Hanken Grotesk", id: "hanken-grotesk", category: "sans", style: "grotesk", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 100, max: 900 }], subsets: ["cyrillic-ext", "latin", "latin-ext", "vietnamese"], use: "Neutral UI text with character; great for CRM and HR." },
  { family: "Geist", id: "geist", category: "sans", style: "grotesk", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 100, max: 900 }], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "vietnamese"], use: "Developer tools and dashboards; tight, modern Swiss feel." },
  { family: "Schibsted Grotesk", id: "schibsted-grotesk", category: "sans", style: "grotesk", weights: [400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 400, max: 900 }], subsets: ["latin", "latin-ext"], use: "News and content sites; sturdy headlines and body." },
  { family: "Familjen Grotesk", id: "familjen-grotesk", category: "sans", style: "grotesk", weights: [400, 500, 600, 700], italics: true, axes: [{ tag: "wght", min: 400, max: 700 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Brand sites and portfolios; quirky details at large sizes." },
  { family: "Bricolage Grotesque", id: "bricolage-grotesque", category: "sans", style: "grotesk", weights: [200, 300, 400, 500, 600, 700, 800], italics: false, axes: [{ tag: "opsz", min: 12, max: 96 }, { tag: "wdth", min: 75, max: 100 }, { tag: "wght", min: 200, max: 800 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Expressive headlines; optical size and width axes." },
  { family: "Host Grotesk", id: "host-grotesk", category: "sans", style: "grotesk", weights: [300, 400, 500, 600, 700, 800], italics: true, axes: [{ tag: "wght", min: 300, max: 800 }], subsets: ["latin", "latin-ext"], use: "Hosting, SaaS and marketing pages; clear and contemporary." },
  { family: "Archivo", id: "archivo", category: "sans", style: "grotesk", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wdth", min: 62, max: 125 }, { tag: "wght", min: 100, max: 900 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Data-heavy screens and posters; width axis from narrow to wide." },
  { family: "Work Sans", id: "work-sans", category: "sans", style: "grotesk", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 100, max: 900 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Agency sites; slightly wide grotesque that reads well large." },
  { family: "Inter Tight", id: "inter-tight", category: "sans", style: "grotesk", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 100, max: 900 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "greek-ext", "latin", "latin-ext", "vietnamese"], use: "Compact headings in product UI; tighter spacing than its parent." },
  { family: "Newsreader", id: "newsreader", category: "serif", style: "text", weights: [200, 300, 400, 500, 600, 700, 800], italics: true, axes: [{ tag: "opsz", min: 6, max: 72 }, { tag: "wght", min: 200, max: 800 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Blogs and long-form articles; optical sizes from captions to titles." },
  { family: "Source Serif 4", id: "source-serif-4", category: "serif", style: "text", weights: [200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "opsz", min: 8, max: 60 }, { tag: "wght", min: 200, max: 900 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "latin", "latin-ext", "vietnamese"], use: "Documentation and reports; sturdy text serif with optical sizes." },
  { family: "Literata", id: "literata", category: "serif", style: "text", weights: [200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "opsz", min: 7, max: 72 }, { tag: "wght", min: 200, max: 900 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "greek-ext", "latin", "latin-ext", "vietnamese"], use: "E-books and reading apps; designed for long screen reading." },
  { family: "Lora", id: "lora", category: "serif", style: "text", weights: [400, 500, 600, 700], italics: true, axes: [{ tag: "wght", min: 400, max: 700 }], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "math", "symbols", "vietnamese"], use: "Lifestyle blogs and menus; calligraphic, warm body text." },
  { family: "Crimson Pro", id: "crimson-pro", category: "serif", style: "text", weights: [200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 200, max: 900 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Literary sites and essays; classic old-style book face." },
  { family: "Spectral", id: "spectral", category: "serif", style: "text", weights: [200, 300, 400, 500, 600, 700, 800], italics: true, axes: [], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "vietnamese"], use: "Premium editorial and legal copy; refined, screen-first serif." },
  { family: "EB Garamond", id: "eb-garamond", category: "serif", style: "text", weights: [400, 500, 600, 700, 800], italics: true, axes: [{ tag: "wght", min: 400, max: 800 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "greek-ext", "latin", "latin-ext", "vietnamese"], use: "Heritage brands, invitations and quotes; classic Garamond." },
  { family: "Instrument Serif", id: "instrument-serif", category: "serif", style: "display", weights: [400], italics: true, axes: [], subsets: ["latin", "latin-ext"], use: "Editorial headlines; condensed, elegant, lovely in italic." },
  { family: "Fraunces", id: "fraunces", category: "serif", style: "display", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "SOFT", min: 0, max: 100 }, { tag: "WONK", min: 0, max: 1 }, { tag: "opsz", min: 9, max: 144 }, { tag: "wght", min: 100, max: 900 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Soft, wonky display serif for food, spa and boutique brands." },
  { family: "Playfair Display", id: "playfair-display", category: "serif", style: "display", weights: [400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 400, max: 900 }], subsets: ["cyrillic", "latin", "latin-ext", "vietnamese"], use: "Luxury and fashion headlines; high-contrast transitional." },
  { family: "DM Serif Display", id: "dm-serif-display", category: "serif", style: "display", weights: [400], italics: true, axes: [], subsets: ["latin", "latin-ext"], use: "Magazine-style headlines with strong contrast." },
  { family: "Young Serif", id: "young-serif", category: "serif", style: "display", weights: [400], italics: false, axes: [], subsets: ["latin", "latin-ext"], use: "Warm, chunky headings for cafes, bakeries and kids brands." },
  { family: "Bodoni Moda", id: "bodoni-moda", category: "serif", style: "display", weights: [400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "opsz", min: 6, max: 96 }, { tag: "wght", min: 400, max: 900 }], subsets: ["latin", "latin-ext", "math", "symbols"], use: "Fashion and beauty; razor-thin Didone with optical sizes." },
  { family: "Syne", id: "syne", category: "display", weights: [400, 500, 600, 700, 800], italics: false, axes: [{ tag: "wght", min: 400, max: 800 }], subsets: ["greek", "latin", "latin-ext"], use: "Art, culture and studio sites; extended and avant-garde at heavy weights." },
  { family: "Unbounded", id: "unbounded", category: "display", weights: [200, 300, 400, 500, 600, 700, 800, 900], italics: false, axes: [{ tag: "wght", min: 200, max: 900 }], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "vietnamese"], use: "Web3, events and posters; wide rounded display." },
  { family: "Dela Gothic One", id: "dela-gothic-one", category: "display", weights: [400], italics: false, axes: [], subsets: ["cyrillic", "greek", "japanese", "latin", "latin-ext", "vietnamese"], use: "Loud campaign headlines and banners; heavy and blocky." },
  { family: "Funnel Display", id: "funnel-display", category: "display", weights: [300, 400, 500, 600, 700, 800], italics: false, axes: [{ tag: "wght", min: 300, max: 800 }], subsets: ["latin", "latin-ext"], use: "Bold marketing headlines; geometric with punchy joins." },
  { family: "Nunito", id: "nunito", category: "rounded", weights: [200, 300, 400, 500, 600, 700, 800, 900, 1000], italics: true, axes: [{ tag: "wght", min: 200, max: 1000 }], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "vietnamese"], use: "Friendly apps, education and health; fully rounded terminals." },
  { family: "Quicksand", id: "quicksand", category: "rounded", weights: [300, 400, 500, 600, 700], italics: false, axes: [{ tag: "wght", min: 300, max: 700 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Light, playful headings for kids, pets and wellness." },
  { family: "Fredoka", id: "fredoka", category: "rounded", weights: [300, 400, 500, 600, 700], italics: false, axes: [{ tag: "wdth", min: 75, max: 125 }, { tag: "wght", min: 300, max: 700 }], subsets: ["hebrew", "latin", "latin-ext"], use: "Playful product UI and games; rounded with a width axis." },
  { family: "Varela Round", id: "varela-round", category: "rounded", weights: [400], italics: false, axes: [], subsets: ["hebrew", "latin", "latin-ext", "vietnamese"], use: "Soft UI labels and onboarding; single regular weight." },
  { family: "Barlow Condensed", id: "barlow-condensed", category: "condensed", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [], subsets: ["latin", "latin-ext", "vietnamese"], use: "Sports, transport and signage; slightly rounded condensed grotesk." },
  { family: "Oswald", id: "oswald", category: "condensed", weights: [200, 300, 400, 500, 600, 700], italics: false, axes: [{ tag: "wght", min: 200, max: 700 }], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "vietnamese"], use: "Posters, menus and stat-heavy headers; classic condensed gothic." },
  { family: "Antonio", id: "antonio", category: "condensed", weights: [100, 200, 300, 400, 500, 600, 700], italics: false, axes: [{ tag: "wght", min: 100, max: 700 }], subsets: ["latin", "latin-ext"], use: "Tall, refined headlines; elegant condensed sans." },
  { family: "Archivo Narrow", id: "archivo-narrow", category: "condensed", weights: [400, 500, 600, 700], italics: true, axes: [{ tag: "wght", min: 400, max: 700 }], subsets: ["latin", "latin-ext", "vietnamese"], use: "Tables and dense lists where width is scarce." },
  { family: "Saira Condensed", id: "saira-condensed", category: "condensed", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: false, axes: [], subsets: ["latin", "latin-ext", "vietnamese"], use: "Tech and automotive; squared condensed shapes." },
  { family: "JetBrains Mono", id: "jetbrains-mono", category: "mono", weights: [100, 200, 300, 400, 500, 600, 700, 800], italics: true, axes: [{ tag: "wght", min: 100, max: 800 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "latin", "latin-ext", "vietnamese"], use: "Code, IDs and numbers in admin UIs; tall x-height." },
  { family: "Geist Mono", id: "geist-mono", category: "mono", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italics: true, axes: [{ tag: "wght", min: 100, max: 900 }], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "symbols2", "vietnamese"], use: "Developer dashboards; pairs with Geist." },
  { family: "IBM Plex Mono", id: "ibm-plex-mono", category: "mono", weights: [100, 200, 300, 400, 500, 600, 700], italics: true, axes: [], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "vietnamese"], use: "Corporate data and logs; pairs with IBM Plex Sans." },
  { family: "Space Mono", id: "space-mono", category: "mono", weights: [400, 700], italics: true, axes: [], subsets: ["latin", "latin-ext", "vietnamese"], use: "Retro-tech display and labels; quirky fixed-width." },
  { family: "DM Mono", id: "dm-mono", category: "mono", weights: [300, 400, 500], italics: true, axes: [], subsets: ["latin", "latin-ext"], use: "Calm code and tabular figures; pairs with DM Sans." },
  { family: "Fira Code", id: "fira-code", category: "mono", weights: [300, 400, 500, 600, 700], italics: false, axes: [{ tag: "wght", min: 300, max: 700 }], subsets: ["cyrillic", "cyrillic-ext", "greek", "greek-ext", "latin", "latin-ext", "symbols2"], use: "Code blocks with programming ligatures." },
  { family: "Martian Mono", id: "martian-mono", category: "mono", weights: [100, 200, 300, 400, 500, 600, 700, 800], italics: false, axes: [{ tag: "wdth", min: 75, max: 112.5 }, { tag: "wght", min: 100, max: 800 }], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext"], use: "Wide technical display and dashboards; width axis." },
  { family: "Caveat", id: "caveat", category: "handwriting", weights: [400, 500, 600, 700], italics: false, axes: [{ tag: "wght", min: 400, max: 700 }], subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext"], use: "Notes, annotations and friendly accents." },
  { family: "Kalam", id: "kalam", category: "handwriting", weights: [300, 400, 700], italics: false, axes: [], subsets: ["devanagari", "latin", "latin-ext"], use: "Informal labels and sketches; felt-pen feel." },
  { family: "Patrick Hand", id: "patrick-hand", category: "handwriting", weights: [400], italics: false, axes: [], subsets: ["latin", "latin-ext", "vietnamese"], use: "Kids, education and playful callouts; neat print handwriting." },
];

const byFamily = new Map(googleFonts.map((f) => [f.family.toLowerCase(), f]));
const byId = new Map(googleFonts.map((f) => [f.id, f]));

/** Look a family up by name (case-insensitive) or id. */
export function getFont(familyOrId: string): GoogleFont | undefined {
  return byFamily.get(familyOrId.toLowerCase()) ?? byId.get(familyOrId);
}

/** The group a font belongs to. */
export function fontGroupOf(font: GoogleFont): FontGroup {
  return fontGroups.find((g) => g.category === font.category && (g.style == null || g.style === font.style)) ?? fontGroups[0]!;
}

/** Is the family variable (has a `wght` axis)? */
export function isVariableFont(font: GoogleFont): boolean {
  return font.axes.some((a) => a.tag === "wght");
}

const fallbacks: Record<FontCategory, string> = {
  sans: "ui-sans-serif, system-ui, sans-serif",
  rounded: "ui-rounded, ui-sans-serif, system-ui, sans-serif",
  display: "ui-sans-serif, system-ui, sans-serif",
  condensed: "ui-sans-serif, system-ui, sans-serif",
  serif: "ui-serif, Georgia, serif",
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  handwriting: "cursive",
};

/**
 * CSS `font-family` value for a family: the quoted name plus a category fallback.
 * A name that is not in the catalog is treated as a ready CSS stack and returned as is.
 */
export function fontStack(family: string): string {
  const f = getFont(family);
  if (!f) return family;
  const serifDisplay = f.category === "serif";
  return `"${f.family}", ${serifDisplay ? fallbacks.serif : fallbacks[f.category]}`;
}
