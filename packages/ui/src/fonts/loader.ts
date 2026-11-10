// Google Fonts CSS2 URL builder and a deduped, SSR-safe <link> loader.
import { getFont, googleFonts, type GoogleFont } from "./catalog";

export const GOOGLE_FONTS_CSS = "https://fonts.googleapis.com/css2";
export const GOOGLE_FONTS_ORIGINS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"] as const;

/** A family to request, optionally narrowed. */
export interface FontRequest {
  family: string;
  /** Only these weights (default: the whole range / every static weight). */
  weights?: number[];
  /** Request italics when the family has them. Default `true`. */
  italics?: boolean;
}

export type FontDisplay = "auto" | "block" | "swap" | "fallback" | "optional";

export interface GoogleFontsUrlOptions {
  /** `font-display` for every face. Default `"swap"`. */
  display?: FontDisplay;
  /** Only the glyphs in this string (tiny files — for previews and logos). */
  text?: string;
  /** Request the optical-size axis when a variable family has one. Default `true`. */
  opticalSize?: boolean;
}

const norm = (r: string | FontRequest): FontRequest => (typeof r === "string" ? { family: r } : r);

/** The `family=` value of one request, e.g. `Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900`. */
export function familySpec(request: string | FontRequest, options: Pick<GoogleFontsUrlOptions, "opticalSize"> = {}): string {
  const r = norm(request);
  const font = getFont(r.family);
  const name = (font?.family ?? r.family).trim().replace(/\s+/g, "+");
  if (!font) {
    // Not in the catalog: pass weights through as given.
    return r.weights?.length ? `${name}:wght@${[...r.weights].sort((a, b) => a - b).join(";")}` : name;
  }
  const ital = font.italics && r.italics !== false;
  const wghtAxis = font.axes.find((a) => a.tag === "wght");
  const opszAxis = options.opticalSize === false || r.weights ? undefined : font.axes.find((a) => a.tag === "opsz");

  let weights: string[];
  if (r.weights?.length) {
    const ok = r.weights.filter((w) => (wghtAxis ? w >= wghtAxis.min && w <= wghtAxis.max : font.weights.includes(w)));
    weights = [...new Set(ok.length ? ok : [nearestWeight(font, 400)])].sort((a, b) => a - b).map(String);
  } else if (wghtAxis) {
    weights = [`${wghtAxis.min}..${wghtAxis.max}`];
  } else {
    weights = font.weights.map(String);
  }

  const single = weights.length === 1 && weights[0] === "400" && !opszAxis;
  if (single && !ital) return name;
  if (single && ital) return `${name}:ital@0;1`;

  const tags = [ital && "ital", opszAxis && "opsz", "wght"].filter(Boolean).join(",");
  const tuples: string[] = [];
  for (const i of ital ? [0, 1] : [null]) {
    for (const w of weights) {
      const parts: string[] = [];
      if (i !== null) parts.push(String(i));
      if (opszAxis) parts.push(`${opszAxis.min}..${opszAxis.max}`);
      parts.push(w);
      tuples.push(parts.join(","));
    }
  }
  return `${name}:${tags}@${tuples.join(";")}`;
}

/** Closest available weight to `target`. */
export function nearestWeight(font: GoogleFont, target = 400): number {
  return font.weights.reduce((best, w) => (Math.abs(w - target) < Math.abs(best - target) ? w : best), font.weights[0] ?? 400);
}

/**
 * Google Fonts CSS2 URL for one or more families. Duplicates are dropped.
 *
 * ```ts
 * googleFontsUrl(["Onest", "Instrument Serif"]);
 * // https://fonts.googleapis.com/css2?family=Onest:wght@100..900&family=Instrument+Serif:ital@0;1&display=swap
 * ```
 */
export function googleFontsUrl(families: Array<string | FontRequest>, options: GoogleFontsUrlOptions = {}): string {
  const seen = new Set<string>();
  const specs: string[] = [];
  for (const f of families) {
    const spec = familySpec(f, options);
    if (seen.has(spec)) continue;
    seen.add(spec);
    specs.push(`family=${spec}`);
  }
  let url = `${GOOGLE_FONTS_CSS}?${specs.join("&")}&display=${options.display ?? "swap"}`;
  if (options.text) url += `&text=${encodeURIComponent(uniqueChars(options.text))}`;
  return url;
}

function uniqueChars(s: string): string {
  return [...new Set(Array.from(s))].sort().join("");
}

export interface LoadGoogleFontsOptions extends GoogleFontsUrlOptions {
  /** Document to inject into (iframes, tests). Default: the global `document`. */
  document?: Document;
  /**
   * Add `blocking="render"` to the link so supporting browsers wait for the CSS
   * (not the font files) before first paint. Use only in a boot script. Default `false`.
   */
  renderBlocking?: boolean;
}

const LINK_ATTR = "data-vamos-fonts";

/** Adds `<link rel="preconnect">` for both Google Fonts origins, once per document. */
export function preconnectGoogleFonts(doc: Document | undefined = typeof document === "undefined" ? undefined : document): void {
  if (!doc) return;
  for (const origin of GOOGLE_FONTS_ORIGINS) {
    if (doc.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) continue;
    const l = doc.createElement("link");
    l.rel = "preconnect";
    l.href = origin;
    if (origin.includes("gstatic")) l.crossOrigin = "anonymous";
    doc.head.appendChild(l);
  }
}

/**
 * Loads Google Fonts families by injecting a single `<link rel="stylesheet">` (plus preconnect).
 * Families already requested by an earlier call — with the same options — are skipped, so calling
 * it on every render is cheap. Resolves when the stylesheet has loaded (or failed); a no-op on the server.
 *
 * ```ts
 * await loadGoogleFonts(["Fraunces", "Figtree"], { display: "swap" });
 * ```
 */
export function loadGoogleFonts(families: Array<string | FontRequest>, options: LoadGoogleFontsOptions = {}): Promise<void> {
  const doc = options.document ?? (typeof document === "undefined" ? undefined : document);
  if (!doc || families.length === 0) return Promise.resolve();
  const variant = `${options.display ?? "swap"}|${options.text ? uniqueChars(options.text) : ""}|${options.opticalSize === false ? 0 : 1}`;
  const loaded = new Set(
    Array.from(doc.head.querySelectorAll<HTMLLinkElement>(`link[${LINK_ATTR}]`)).flatMap((l) =>
      l.getAttribute("data-variant") === variant ? (l.getAttribute(LINK_ATTR) ?? "").split("|") : [],
    ),
  );
  const fresh: Array<string | FontRequest> = [];
  const keys: string[] = [];
  for (const f of families) {
    const key = familySpec(f, options);
    if (loaded.has(key) || keys.includes(key)) continue;
    keys.push(key);
    fresh.push(f);
  }
  if (fresh.length === 0) return Promise.resolve();

  preconnectGoogleFonts(doc);
  const link = doc.createElement("link");
  link.rel = "stylesheet";
  link.href = googleFontsUrl(fresh, options);
  link.setAttribute(LINK_ATTR, keys.join("|"));
  link.setAttribute("data-variant", variant);
  if (options.renderBlocking) link.setAttribute("blocking", "render");
  const done = new Promise<void>((resolve) => {
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener("error", () => resolve(), { once: true });
  });
  doc.head.appendChild(link);
  return done;
}

/** The sample line pickers show under each family. */
export const FONT_PREVIEW_TEXT = "Hamburgefonstiv — Ağaç işçiliği";

let previewChars: string | undefined;
/** Every glyph a preview may need: the sample line, digits and all catalog family names. Stable, so loads dedupe. */
export function fontPreviewCharacters(extra = ""): string {
  previewChars ??= uniqueChars(FONT_PREVIEW_TEXT + "AaGg0123456789 " + googleFonts.map((f) => f.family).join(""));
  return extra ? uniqueChars(previewChars + extra) : previewChars;
}

/**
 * Loads tiny glyph-subset files — one weight per family, only the characters of the preview line and
 * the catalog family names — so a picker can show every family in its own face without full downloads.
 * Pass `{ family, weights: [700] }` to preview a heavier weight.
 */
export function loadFontPreviews(families: Array<string | FontRequest>, options: Omit<LoadGoogleFontsOptions, "text" | "opticalSize"> & { extraText?: string } = {}): Promise<void> {
  const { extraText, ...rest } = options;
  const reqs: FontRequest[] = [];
  for (const r of families.map(norm)) {
    const f = getFont(r.family);
    if (!f) continue;
    reqs.push({ family: f.family, weights: r.weights?.length ? r.weights : [nearestWeight(f, 400)], italics: r.italics ?? false });
  }
  if (reqs.length === 0) return Promise.resolve();
  return loadGoogleFonts(reqs, { ...rest, text: fontPreviewCharacters(extraText), opticalSize: false });
}
