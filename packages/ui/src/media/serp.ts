// Search-result truncation constants and measurement. Static and versioned: update the numbers
// here when search engines change their layout. Google truncates by pixel width, not characters.

export const SERP_LIMITS = {
  version: "2026-11",
  desktop: {
    title: { font: "400 20px Arial, sans-serif", fontSize: 20, maxPx: 600, idealChars: [30, 60] as const },
    description: { font: "400 14px Arial, sans-serif", fontSize: 14, maxPx: 920, idealChars: [70, 160] as const },
  },
  mobile: {
    title: { font: "400 16px Arial, sans-serif", fontSize: 16, maxPx: 640, idealChars: [30, 60] as const },
    description: { font: "400 14px Arial, sans-serif", fontSize: 14, maxPx: 680, idealChars: [70, 120] as const },
  },
} as const;

export type SerpField = "title" | "description";
export type SerpDevice = "desktop" | "mobile";

/** Splits into user-perceived characters (emoji, combining marks). */
export function graphemes(text: string, locale?: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(locale, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** Character count as people see it (`"👩‍💻"` is 1). */
export function countGraphemes(text: string, locale?: string): number {
  return graphemes(text, locale).length;
}

// Arial advance widths in em, used when canvas is unavailable (server, tests).
const NARROW = new Set("iljtf.,;:'!|()[]{} ".split(""));
const SEMI = new Set("rI-\"`*".split(""));
const WIDE = new Set("mwMW@%".split(""));
function estimateWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const ch of text) {
    if (NARROW.has(ch)) em += 0.278;
    else if (SEMI.has(ch)) em += 0.333;
    else if (WIDE.has(ch)) em += 0.86;
    else if (/[A-ZÇĞİÖŞÜ0-9]/.test(ch)) em += 0.667;
    else if (/\p{Extended_Pictographic}/u.test(ch)) em += 1.1;
    else em += 0.556;
  }
  return em * fontSize;
}

let ctx: CanvasRenderingContext2D | null | undefined;
function canvasContext(): CanvasRenderingContext2D | null {
  if (ctx !== undefined) return ctx;
  try {
    const jsdom = typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent);
    ctx = typeof document !== "undefined" && !jsdom ? document.createElement("canvas").getContext("2d") : null;
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Pixel width of `text` in a CSS `font`. Canvas in the browser, an Arial estimate elsewhere. */
export function measureText(text: string, font: string, fontSize: number, estimate = false): number {
  const c = estimate ? null : canvasContext();
  if (c) {
    c.font = font;
    const w = c.measureText(text).width;
    if (w > 0 || text === "") return w;
  }
  return estimateWidth(text, fontSize);
}

export interface SerpMeasure {
  /** Rendered width in px. */
  px: number;
  /** Limit in px for this field/device. */
  maxPx: number;
  truncated: boolean;
  /** Grapheme index where the visible text ends (before the ellipsis). `length` when not truncated. */
  cutAt: number;
  /** The text as shown, with "…" when cut. */
  display: string;
}

/**
 * How a title or description renders in a search result: width in px and where it gets cut.
 *
 * ```ts
 * Pass `{ estimate: true }` for a canvas-free, deterministic result (server rendering, first paint).
 *
 * measureSerp("Spa packages in Kadıköy — Lena Spa", "title"); // { px: 334, truncated: false, … }
 * ```
 */
export function measureSerp(text: string, field: SerpField, device: SerpDevice = "desktop", locale?: string, options: { estimate?: boolean } = {}): SerpMeasure {
  const spec = SERP_LIMITS[device][field];
  const clean = text.replace(/\s+/g, " ").trim();
  const est = options.estimate ?? false;
  const measure = (t: string) => measureText(t, spec.font, spec.fontSize, est);
  const px = measure(clean);
  const chars = graphemes(clean, locale);
  if (px <= spec.maxPx) return { px, maxPx: spec.maxPx, truncated: false, cutAt: chars.length, display: clean };
  const ellipsis = measure(" …");
  // Binary search the longest prefix that fits with the ellipsis.
  let lo = 0;
  let hi = chars.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(chars.slice(0, mid).join("")) + ellipsis <= spec.maxPx) lo = mid;
    else hi = mid - 1;
  }
  // Prefer a word boundary when it is close.
  let cut = lo;
  const lastSpace = chars.slice(0, lo).lastIndexOf(" ");
  if (lastSpace > 0 && lo - lastSpace < 16) cut = lastSpace;
  const shown = chars.slice(0, cut).join("").replace(/[\s,;:—–-]+$/, "");
  return { px, maxPx: spec.maxPx, truncated: true, cutAt: cut, display: `${shown} …` };
}
