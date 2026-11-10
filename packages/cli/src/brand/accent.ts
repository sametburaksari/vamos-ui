/**
 * generateAccent: one brand colour → the four accent variables of the kit, with WCAG 2.x
 * contrast guaranteed for every text use. Pure.
 *
 *   --accent-base       fill (primary button, active state)       text on it: --accent-fg
 *   --accent-fg         text/icons on the fill                     ≥ 4.5:1 on --accent-base
 *   --accent-ink-light  accent text/icons on light surfaces        ≥ 4.5:1 on the light scene
 *   --accent-ink-dark   accent text/icons on dark surfaces         ≥ 4.5:1 on dark surface-2
 *
 * Contrast is measured against the hardest surface of each theme (light: --scene #eef0ea,
 * dark: --surface-2 #1b1e15), so it holds on every surface the kit uses.
 */
import { contrastRatio, formatOklch, gamutMap, parseColor, roundContrast, type Oklch } from "./color";

export const TEXT_CONTRAST = 4.5;
/** Non-text UI (fills against the page, focus rings): WCAG 1.4.11. */
export const UI_CONTRAST = 3;

/** Reference surfaces from styles.css. */
export const SURFACES = {
  light: { surface: "#ffffff", hardest: "#eef0ea" },
  dark: { surface: "#15180f", hardest: "#1b1e15" },
} as const;

const WHITE: Oklch = { l: 1, c: 0, h: 0, alpha: 1 };

export interface AccentContrast {
  /** --accent-fg on --accent-base. */
  fgOnBase: number;
  /** --accent-ink-light on the light scene. */
  inkLightOnLight: number;
  /** --accent-ink-dark on dark surface-2. */
  inkDarkOnDark: number;
  /** Dark-mode --accent-fg on the dark-mode fill, when there is one. */
  darkFgOnBase?: number;
}

export interface AccentPalette {
  /** The colour as given. */
  source: string;
  base: string;
  fg: string;
  inkLight: string;
  inkDark: string;
  /** Dark-mode fill override, when the base would vanish on dark surfaces or accentDark is set. */
  dark?: { base: string; fg: string };
  contrast: AccentContrast;
  /** What was adjusted and why, plus anything worth knowing about the colour. Empty = used as is. */
  warnings: string[];
}

export interface GenerateAccentOptions {
  /** Explicit dark-mode fill (brand.colors.accentDark). */
  dark?: string;
}

const fmtL = (l: number) => l.toFixed(3);

/** Moves lightness from `from` in `dir` steps until `ok` holds. Returns null when it never does. */
function seekLightness(from: Oklch, dir: 1 | -1, ok: (c: Oklch) => boolean): Oklch | null {
  for (let i = 0; i <= 200; i++) {
    const l = from.l + dir * i * 0.005;
    if (l < 0 || l > 1) break;
    const c = gamutMap({ ...from, l });
    // Judge the formatted value: it is what ends up in the stylesheet.
    if (ok(parseColor(formatOklch(c))!)) return c;
  }
  return null;
}

const darkInk = (h: number): Oklch => ({ l: 0.18, c: 0.02, h, alpha: 1 });
const fgString = (fg: Oklch) => (fg.l === 1 && fg.c === 0 ? "#fff" : formatOklch(fg));

interface FillResult {
  base: Oklch;
  fg: Oklch;
  note?: string;
}

/** Picks white or a dark ink for text on the fill; adjusts fill lightness when neither reaches 4.5:1. */
function fillWithText(base: Oklch, label: string): FillResult {
  const dark = darkInk(base.h);
  const cw = contrastRatio(WHITE, base);
  const cd = contrastRatio(dark, base);
  if (Math.max(cw, cd) >= TEXT_CONTRAST) return { base, fg: cw >= cd ? WHITE : dark };
  const target = TEXT_CONTRAST + 0.05;
  const forWhite = seekLightness(base, -1, (c) => contrastRatio(WHITE, c) >= target);
  const forDark = seekLightness(base, 1, (c) => contrastRatio(darkInk(c.h), c) >= target);
  const dW = forWhite ? base.l - forWhite.l : Infinity;
  const dD = forDark ? forDark.l - base.l : Infinity;
  const useWhite = dW <= dD;
  const next = (useWhite ? forWhite : forDark) ?? base;
  const fg = useWhite ? WHITE : darkInk(next.h);
  const was = roundContrast(Math.max(cw, cd));
  return {
    base: next,
    fg,
    note: `${label} lightness ${fmtL(base.l)} → ${fmtL(next.l)} so ${useWhite ? "white" : "dark"} text on it reaches 4.5:1 (best was ${was}:1).`,
  };
}

/**
 * Derives the accent variables from one brand colour.
 * Throws a TypeError when `colour` is not a CSS colour it can read.
 */
export function generateAccent(colour: string, options: GenerateAccentOptions = {}): AccentPalette {
  const parsed = parseColor(colour);
  if (!parsed) throw new TypeError(`"${colour}" is not a colour. Use hex (#1d4ed8), rgb(), hsl() or oklch().`);
  const warnings: string[] = [];
  if (parsed.alpha < 1) warnings.push("Transparency is ignored; the accent is used as an opaque colour.");
  let base = gamutMap({ ...parsed, alpha: 1 });
  if (base.c + 0.02 < parsed.c) warnings.push(`The colour is outside sRGB; chroma ${parsed.c.toFixed(3)} → ${base.c.toFixed(3)} so every screen shows the same colour.`);
  if (base.c < 0.03) warnings.push("Very low chroma: the accent reads as grey. That works for a monochrome brand (like graphite); otherwise pick a more saturated colour.");

  // 1. The fill must stand out from white surfaces, or buttons lose their edge.
  const onWhite = contrastRatio(base, SURFACES.light.surface);
  if (onWhite < 1.25) {
    const darker = seekLightness(base, -1, (c) => contrastRatio(c, SURFACES.light.surface) >= 1.35);
    if (darker) {
      warnings.push(`Near-white colour: fill lightness ${fmtL(base.l)} → ${fmtL(darker.l)} so buttons stay visible on white surfaces.`);
      base = darker;
    }
  }

  // 2. Text on the fill.
  const fill = fillWithText(base, "Fill");
  if (fill.note) warnings.push(fill.note);
  base = fill.base;
  const fg = fill.fg;

  // 3. Ink on light surfaces: the fill itself when it is dark enough, else a darker shade.
  const lightTarget = TEXT_CONTRAST + 0.05;
  let inkLight = base;
  if (contrastRatio(base, SURFACES.light.hardest) < TEXT_CONTRAST) {
    inkLight = seekLightness(base, -1, (c) => contrastRatio(c, SURFACES.light.hardest) >= lightTarget) ?? { ...base, l: 0.3 };
  }

  // 4. Dark-mode fill: explicit, or derived when the fill would disappear on dark surfaces.
  let dark: FillResult | undefined;
  if (options.dark) {
    const pd = parseColor(options.dark);
    if (!pd) throw new TypeError(`"${options.dark}" (accentDark) is not a colour.`);
    const d = gamutMap({ ...pd, alpha: 1 });
    if (contrastRatio(d, SURFACES.dark.surface) < 1.5) warnings.push("accentDark is very close to the dark surfaces; buttons will barely show in dark mode.");
    dark = fillWithText(d, "Dark-mode fill");
    if (dark.note) warnings.push(dark.note);
  } else if (contrastRatio(base, SURFACES.dark.surface) < 1.6) {
    let lifted: Oklch;
    if (base.c < 0.04) {
      // Monochrome brands invert, like the graphite accent: near-black fill → near-white fill.
      lifted = gamutMap({ ...base, l: Math.min(0.95, Math.max(0.88, 1 - base.l)) });
    } else {
      lifted = seekLightness(base, 1, (c) => contrastRatio(c, SURFACES.dark.surface) >= UI_CONTRAST) ?? { ...base, l: 0.7 };
    }
    dark = fillWithText(lifted, "Dark-mode fill");
    warnings.push(`Very dark colour: dark mode uses a lighter fill (lightness ${fmtL(base.l)} → ${fmtL(dark.base.l)}) so buttons stay visible. Set colors.accentDark to choose it yourself.`);
    if (dark.note) warnings.push(dark.note);
  }

  // 5. Ink on dark surfaces: a light shade of the (dark-mode) fill with slightly lower chroma.
  const from = dark?.base ?? base;
  const darkTarget = TEXT_CONTRAST + 0.05;
  let inkDark = from;
  if (from.l < 0.7 || contrastRatio(from, SURFACES.dark.hardest) < TEXT_CONTRAST) {
    const start = gamutMap({ ...from, l: Math.max(from.l, 0.7), c: from.l < 0.7 ? from.c * 0.75 : from.c });
    inkDark = contrastRatio(start, SURFACES.dark.hardest) >= darkTarget ? start : seekLightness(start, 1, (c) => contrastRatio(c, SURFACES.dark.hardest) >= darkTarget) ?? { ...start, l: 0.9 };
  }

  const out = {
    base: formatOklch(base),
    fg: fgString(fg),
    inkLight: formatOklch(inkLight),
    inkDark: formatOklch(inkDark),
  };
  const contrast: AccentContrast = {
    fgOnBase: roundContrast(contrastRatio(out.fg, out.base)),
    inkLightOnLight: roundContrast(contrastRatio(out.inkLight, SURFACES.light.hardest)),
    inkDarkOnDark: roundContrast(contrastRatio(out.inkDark, SURFACES.dark.hardest)),
  };
  const palette: AccentPalette = { source: colour, ...out, contrast, warnings };
  if (dark) {
    palette.dark = { base: formatOklch(dark.base), fg: fgString(dark.fg) };
    contrast.darkFgOnBase = roundContrast(contrastRatio(palette.dark.fg, palette.dark.base));
  }
  return palette;
}
