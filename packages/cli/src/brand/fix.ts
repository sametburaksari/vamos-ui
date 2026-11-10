/**
 * fixSource: safe, mechanical rewrites towards the Vamos UI tokens. Pure.
 *
 *   Tailwind palette classes   bg-white → bg-surface, text-gray-500 → text-fg-muted, bg-blue-600 → bg-accent …
 *   Raw colours                bg-[#1d4ed8] → bg-accent, style={{ color: "#333" }} → var(--fg), CSS color: #666 → var(--fg-muted)
 *   dark: variants             removed when the light class next to them is (now) a token
 *   Hard-coded fonts           font-['Inter'] → font-sans, fontFamily: "Inter" → var(--font-ui), CSS font-family → var(--font-*)
 *
 * Anything that is not an unambiguous match is left alone for a person (verify still reports it).
 * Lines with a `vamos-ui-ignore` comment (and the line after) and `vamos-ui-ignore-file` files are skipped.
 */
import { hueDistance, parseColor, COLOR_LITERAL, type Oklch } from "./color";
import { getFont, primaryFamily } from "./fonts";
import type { BrandFonts } from "./types";
import { lex, lineIndex, matchBracket, position } from "../lexer";

export type FixKind = "palette" | "colour" | "dark-variant" | "font";

export interface FixChange {
  line: number;
  kind: FixKind;
  from: string;
  /** Replacement; empty when a class was removed. */
  to: string;
}

export interface FixResult {
  code: string;
  changes: FixChange[];
}

export interface FixOptions {
  /** Brand accent (any CSS colour): palette families near its hue map to the accent tokens. */
  accent?: string;
  /** Brand fonts: a hard-coded family that matches one of them maps to that role. */
  fonts?: BrandFonts;
}

/** Hue of each Tailwind family's 500 shade (OKLCH), for matching the brand accent. */
const FAMILY_HUE: Record<string, number> = {
  red: 25, orange: 47, amber: 70, yellow: 86, lime: 131, green: 150, emerald: 163, teal: 183, cyan: 215,
  sky: 237, blue: 260, indigo: 277, violet: 293, purple: 304, fuchsia: 322, pink: 354, rose: 16,
};
const NEUTRAL_FAMILIES = new Set(["slate", "gray", "zinc", "neutral", "stone", "mauve", "olive", "mist", "taupe"]);
const STATUS_FAMILY: Record<string, Status> = {
  red: "danger", rose: "danger", orange: "warning", amber: "warning", yellow: "warning",
  green: "success", emerald: "success", blue: "info", sky: "info",
};
type Status = "danger" | "warning" | "success" | "info";
type Slot = "bg" | "text" | "border" | "divide" | "ring" | "outline" | "fill" | "stroke" | "placeholder";

const PALETTE = [...NEUTRAL_FAMILIES, ...Object.keys(FAMILY_HUE)].join("|");
const UTIL = "bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|fill|stroke|divide|placeholder";
const VARIANTS = "((?:[\\w@\\[\\]&=\"'.#>*()-]+:)*)";
const PALETTE_RE = new RegExp(`^${VARIANTS}(!?)(${UTIL})-(${PALETTE}|white|black)(?:-(50|[1-9]00|950))?(\\/[\\w.\\[\\]%]+)?(!?)$`);
const ARBITRARY_RE = new RegExp(`^${VARIANTS}(!?)(${UTIL})-\\[(?:color:)?([^\\]]+)\\](\\/[\\w.\\[\\]%]+)?(!?)$`);
const FONT_ARBITRARY_RE = /^((?:[\w@[\]-]+:)*)font-\[([^\]]+)\]$/;
const SEMANTIC_RE = new RegExp(
  `^${VARIANTS}!?(${UTIL})-(scene|fg|fg-muted|fg-subtle|surface|surface-2|surface-border|line|field|field-border|field-border-hover|hover|selected|skeleton|track|popover|popover-border|overlay|nav|nav-fg|nav-fg-strong|accent|accent-fg|accent-soft|accent-ink|ring|success|warning|danger|danger-solid|info|chart-\\d)(\\/[\\w.\\[\\]%]+)?!?$`,
);

/** The mapping table, for docs and `vamos-ui update --help`. */
export const FIX_MAPPINGS: readonly { from: string; to: string }[] = [
  { from: "bg-white", to: "bg-surface" },
  { from: "bg-{gray}-50/100", to: "bg-surface-2 (hover: bg-hover)" },
  { from: "text-{gray}-800…950, text-black", to: "text-fg" },
  { from: "text-{gray}-500…700", to: "text-fg-muted" },
  { from: "text-{gray}-300/400", to: "text-fg-subtle" },
  { from: "border-{gray}-100/200", to: "border-line" },
  { from: "border-{gray}-300/400", to: "border-field-border" },
  { from: "bg-{accent}-500…700", to: "bg-accent (hover: bg-accent/90)" },
  { from: "bg-{accent}-50…200", to: "bg-accent-soft" },
  { from: "text-{accent}-500…900", to: "text-accent-ink" },
  { from: "text-white / neutral text next to bg-accent", to: "text-accent-fg" },
  { from: "border/ring-{accent}-*", to: "border-accent / ring-ring" },
  { from: "{red,rose} · {orange,amber,yellow} · {green,emerald} · {blue,sky}", to: "danger · warning · success · info (bg-*/10 for 50/100, bg-danger-solid for red-600/700)" },
  { from: "#hex / rgb() in classes, style and CSS", to: "the nearest token (neutral by lightness, colours by hue)" },
  { from: "dark:{class} beside a token class", to: "removed (tokens switch under .dark)" },
  { from: "font-['Family'], fontFamily, font-family", to: "font-sans / font-display / font-mono, var(--font-ui|heading|code)" },
];

interface Ctx {
  accentHue: number | null;
  accentFamilies: Set<string>;
  fonts: BrandFonts;
}

function makeCtx(options: FixOptions): Ctx {
  let accentHue: number | null = null;
  if (options.accent) {
    const c = parseColor(options.accent);
    // A grey accent (graphite) maps no palette family.
    if (c && c.c >= 0.04) accentHue = c.h;
  }
  const accentFamilies = new Set<string>();
  if (accentHue !== null) {
    const sorted = Object.entries(FAMILY_HUE).sort((a, b) => hueDistance(a[1], accentHue!) - hueDistance(b[1], accentHue!));
    accentFamilies.add(sorted[0]![0]);
    for (const [fam, h] of sorted.slice(1)) if (hueDistance(h, accentHue) <= 16) accentFamilies.add(fam);
  }
  return { accentHue, accentFamilies, fonts: options.fonts ?? {} };
}

const slotOf = (util: string): Slot => (util.startsWith("border") ? "border" : util.startsWith("ring") ? "ring" : (util as Slot));
const shadeNum = (s: string | undefined) => (s ? Number(s) : NaN);
const inRange = (n: number, lo: number, hi: number) => n >= lo && n <= hi;

/** Token for a palette class core, e.g. ("text", "gray", 500) → "fg-muted". Null = leave it. */
function paletteToken(slot: Slot, family: string, shade: number, variants: string, ctx: Ctx): string | null {
  const hover = /(^|:)(hover|active|group-hover|peer-hover):/.test(variants);
  const focus = /(^|:)(focus|focus-visible|focus-within):/.test(variants);
  if (family === "white" || family === "black" || NEUTRAL_FAMILIES.has(family)) {
    const s = family === "white" ? 0 : family === "black" ? 1000 : shade;
    switch (slot) {
      case "bg":
        if (s === 0) return "surface";
        if (inRange(s, 50, 100)) return hover ? "hover" : "surface-2";
        if (s === 200 && hover) return "hover";
        return null;
      case "text":
        if (s >= 800) return "fg";
        if (inRange(s, 500, 700)) return "fg-muted";
        if (inRange(s, 300, 400)) return "fg-subtle";
        return null;
      case "border":
      case "outline":
        if (inRange(s, 100, 200)) return "line";
        if (inRange(s, 300, 400)) return "field-border";
        return null;
      case "divide":
        return inRange(s, 100, 300) ? "line" : null;
      case "ring":
        return focus ? "ring" : null;
      case "placeholder":
        return inRange(s, 300, 500) ? "fg-subtle" : null;
      case "fill":
      case "stroke":
        if (s >= 700) return "fg";
        if (inRange(s, 500, 600)) return "fg-muted";
        if (inRange(s, 300, 400)) return "fg-subtle";
        return null;
    }
  }
  if (ctx.accentFamilies.has(family)) {
    switch (slot) {
      case "bg":
        if (inRange(shade, 50, 200)) return "accent-soft";
        if (inRange(shade, 400, 700)) return hover ? "accent/90" : "accent";
        return null;
      case "text":
        return inRange(shade, 500, 900) ? "accent-ink" : null;
      case "border":
      case "outline":
      case "divide":
        if (focus && slot === "outline") return "ring";
        if (inRange(shade, 200, 300)) return "accent/40";
        return inRange(shade, 400, 700) ? "accent" : null;
      case "ring":
        return "ring";
      case "fill":
      case "stroke":
        return inRange(shade, 400, 800) ? "accent-ink" : null;
      default:
        return null;
    }
  }
  const status = STATUS_FAMILY[family];
  if (status) {
    switch (slot) {
      case "bg":
        if (inRange(shade, 50, 100)) return `${status}/10`;
        if (shade === 200) return `${status}/20`;
        if (shade === 500) return status;
        if (inRange(shade, 600, 700)) return status === "danger" ? "danger-solid" : status;
        return null;
      case "text":
        return inRange(shade, 400, 900) ? status : null;
      case "border":
      case "outline":
      case "divide":
        if (inRange(shade, 200, 300)) return `${status}/40`;
        return inRange(shade, 400, 700) ? status : null;
      case "ring":
        return status;
      case "fill":
      case "stroke":
        return inRange(shade, 400, 800) ? status : null;
      default:
        return null;
    }
  }
  return null;
}

/** Token for a literal colour in a given slot. Null when nothing is close enough. */
export function colourToken(slot: Slot, colour: Oklch, ctx: Ctx): string | null {
  if (colour.alpha < 0.95) return null; // translucent colours are deliberate; leave them
  // Tailwind's slate/gray carry a little blue (chroma up to ~0.045); they are still neutrals.
  if (colour.c < 0.05) {
    const l = colour.l;
    switch (slot) {
      case "bg":
        if (l >= 0.985) return "surface";
        if (l >= 0.94) return "surface-2";
        return null;
      case "text":
      case "fill":
      case "stroke":
        if (l < 0.45) return "fg";
        if (l < 0.66) return "fg-muted";
        if (l < 0.8) return "fg-subtle";
        return null;
      case "border":
      case "outline":
      case "divide":
        if (l >= 0.88 && l < 0.975) return "line";
        if (l >= 0.75 && l < 0.88) return "field-border";
        return null;
      default:
        return null;
    }
  }
  let role: "accent" | Status | null = null;
  if (ctx.accentHue !== null && hueDistance(colour.h, ctx.accentHue) <= 22) role = "accent";
  else {
    const h = colour.h;
    if (h >= 10 && h < 38) role = "danger"; // pinks and magentas are not "danger"
    else if (h < 100) role = "warning";
    else if (h >= 125 && h < 175) role = "success";
    else if (h >= 235 && h < 275) role = "info";
  }
  if (!role) return null;
  const l = colour.l;
  if (role === "accent") {
    if (slot === "bg") return l >= 0.9 ? "accent-soft" : l >= 0.4 ? "accent" : null;
    if (slot === "text" || slot === "fill" || slot === "stroke") return l <= 0.75 ? "accent-ink" : null;
    if (slot === "ring") return "ring";
    return "accent";
  }
  if (slot === "bg") return l >= 0.9 ? `${role}/10` : l >= 0.4 ? (role === "danger" ? "danger-solid" : role) : null;
  if (slot === "text" || slot === "fill" || slot === "stroke") return l <= 0.75 ? role : null;
  return role;
}

const withOpacity = (token: string, original: string | undefined) => (original ? token.replace(/\/[\w.]+$/, "") + original : token);

/** CSS value for a token, e.g. "fg-muted" → var(--fg-muted), "danger/10" → color-mix(…). */
function cssVar(token: string): string {
  const [name, pct] = token.split("/");
  return pct ? `color-mix(in oklch, var(--${name}) ${pct}%, transparent)` : `var(--${name})`;
}

type FontRoleToken = "sans" | "display" | "mono";
function fontRole(family: string, ctx: Ctx, selector = ""): FontRoleToken {
  const f = family.replace(/^["']|["']$/g, "").replace(/_/g, " ").trim().toLowerCase();
  const eq = (x?: string) => !!x && x.toLowerCase() === f;
  if (eq(ctx.fonts.mono)) return "mono";
  if (eq(ctx.fonts.display)) return "display";
  if (eq(ctx.fonts.body)) return "sans";
  const cat = getFont(f)?.category;
  if (cat === "mono" || /mono|code|consol|courier|menlo/.test(f)) return "mono";
  if (cat === "serif" || cat === "display" || /serif|garamond|playfair|didot|bodoni/.test(f) && !/sans/.test(f)) return "display";
  if (/(^|[\s,>+~])h[1-6]\b|heading|title|display|hero/i.test(selector)) return "display";
  return "sans";
}
const FONT_VAR: Record<FontRoleToken, string> = { sans: "var(--font-ui)", display: "var(--font-heading)", mono: "var(--font-code)" };

// ---------------------------------------------------------------------------
// Class lists
// ---------------------------------------------------------------------------

interface ClassEdit {
  token: string;
  next: string;
  kind: FixKind;
}

/** Rewrites one class list. Returns the new list and the per-class changes. */
export function fixClassList(list: string, options: FixOptions | Ctx = {}): { value: string; edits: ClassEdit[] } {
  const ctx = "accentFamilies" in options ? options : makeCtx(options);
  const parts = list.split(/(\s+)/);
  const edits: ClassEdit[] = [];
  /** Index of each class pass 1 rewrote → its entry in edits. */
  const editAt = new Map<number, number>();
  const mapped: (string | null)[] = parts.map((p) => (/^\s*$/.test(p) || p.includes("${") || /[{}`]/.test(p) ? null : p));

  // Pass 1: palette, arbitrary colours and fonts.
  for (let i = 0; i < mapped.length; i++) {
    const tok = mapped[i];
    if (!tok) continue;
    let next: string | null = null;
    let kind: FixKind = "palette";
    let m = PALETTE_RE.exec(tok);
    if (m) {
      const [, variants, bang, util, family, shade, opacity, bang2] = m as unknown as string[];
      if (!shade && family !== "white" && family !== "black") continue;
      const t = paletteToken(slotOf(util!), family!, shadeNum(shade), variants!, ctx);
      if (t) next = `${variants}${bang}${util}-${withOpacity(t, opacity)}${bang2}`;
    } else if ((m = ARBITRARY_RE.exec(tok))) {
      const [, variants, bang, util, value, opacity, bang2] = m as unknown as string[];
      const c = parseColor(value!.replace(/_/g, " "));
      if (c) {
        const t = colourToken(slotOf(util!), c, ctx);
        if (t) {
          next = `${variants}${bang}${util}-${withOpacity(t, opacity)}${bang2}`;
          kind = "colour";
        }
      }
    } else if ((m = FONT_ARBITRARY_RE.exec(tok))) {
      const value = m[2]!;
      if (!/^(?:var\(--font|inherit$|initial$|unset$|\d|weight:|length:)/.test(value)) {
        next = `${m[1]}font-${fontRole(value.split(",")[0]!, ctx)}`;
        kind = "font";
      }
    }
    if (next && next !== tok) {
      editAt.set(i, edits.length);
      edits.push({ token: tok, next, kind });
      mapped[i] = next;
      parts[i] = next;
    }
  }

  // Pass 2: text on an accent fill. Neutral text that pass 1 mapped to text-fg* would sit on
  // the brand colour, where only --accent-fg is contrast-safe.
  const hasSolidAccentFill = parts.some((p) => /^!?bg-accent!?$/.test(p));
  if (hasSolidAccentFill) {
    for (const [i, e] of editAt) {
      const m = /^(!?)text-fg(?:-muted|-subtle)?(\/[\w.]+)?(!?)$/.exec(parts[i]!);
      if (!m) continue;
      const next = `${m[1]}text-accent-fg${m[2] ?? ""}${m[3]}`;
      edits[e]!.next = next;
      parts[i] = next;
    }
  }
  const hasAccentFill = parts.some((p) => /^!?bg-accent(?:\/[\w.]+)?!?$/.test(p));
  if (hasAccentFill) {
    for (let i = 0; i < parts.length; i++) {
      const m = /^((?:[\w@[\]-]+:)*)(!?)text-white(\/[\w.]+)?(!?)$/.exec(parts[i]!);
      if (!m || m[1]!.includes("dark:")) continue;
      const next = `${m[1]}${m[2]}text-accent-fg${m[3] ?? ""}${m[4]}`;
      edits.push({ token: parts[i]!, next, kind: "palette" });
      parts[i] = next;
    }
  }

  // Pass 3: dark: variants that only mirror a token.
  const core = (p: string) => {
    const m = /^((?:[\w@[\]&=.#>*()-]+:)*)(.*)$/.exec(p)!;
    return { variants: m[1]!, rest: m[2]! };
  };
  const slotKey = (cls: string) => {
    const m = new RegExp(`^!?(${UTIL})-`).exec(cls);
    return m ? slotOf(m[1]!) + (m[1]!.startsWith("border-") ? m[1]!.slice(6) : "") : null;
  };
  const isColourClass = (cls: string) => PALETTE_RE.test(cls) || ARBITRARY_RE.test(cls) || SEMANTIC_RE.test(cls);
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]!;
    if (!/(^|:)dark:/.test(p) || !isColourClass(p)) continue;
    const { variants, rest } = core(p);
    const otherVariants = variants.replace(/(^|:)dark:/, "$1");
    const key = slotKey(rest);
    if (!key) continue;
    const counterpart = parts.find((q, j) => {
      if (j === i || /(^|:)dark:/.test(q)) return false;
      const c = core(q);
      return c.variants === otherVariants && slotKey(c.rest) === key && SEMANTIC_RE.test(q);
    });
    if (!counterpart) continue;
    // A class first mapped in pass 1 and now removed is reported once, from its original form.
    const earlier = edits.findIndex((e) => e.next === p);
    const original = earlier >= 0 ? edits.splice(earlier, 1)[0]!.token : p;
    edits.push({ token: original, next: "", kind: "dark-variant" });
    parts[i] = "";
  }

  // Pass 4: hover:X next to X (both mapped to the same token) does nothing; drop it.
  for (let i = 0; i < parts.length; i++) {
    const m = /^hover:(.+)$/.exec(parts[i]!);
    if (!m || !SEMANTIC_RE.test(m[1]!) || !parts.includes(m[1]!)) continue;
    const earlier = edits.findIndex((e) => e.next === parts[i]);
    if (earlier < 0) continue; // only clean up what this pass produced
    const original = edits.splice(earlier, 1)[0]!.token;
    edits.push({ token: original, next: "", kind: "palette" });
    parts[i] = "";
  }

  let value = parts.join("");
  if (edits.some((e) => e.next === "")) {
    const lead = /^\s*/.exec(list)![0];
    const trail = /\s*$/.exec(list)![0];
    value = lead + value.trim().replace(/\s{2,}/g, " ") + trail;
  }
  return { value, edits };
}

// ---------------------------------------------------------------------------
// Declarations (CSS files, style="" attributes, style={{}} objects)
// ---------------------------------------------------------------------------

const CSS_SLOT: [RegExp, Slot][] = [
  [/^(color|caret-color|text-decoration-color|fill|stroke)$/, "text"],
  [/^(background|background-color)$/, "bg"],
  [/^(border|border-(?:top|right|bottom|left|block|inline)(?:-start|-end)?(?:-color)?|border-color|outline|outline-color)$/, "border"],
];
const JS_SLOT: [RegExp, Slot][] = [
  [/^(color|caretColor|textDecorationColor|fill|stroke)$/, "text"],
  [/^(background|backgroundColor)$/, "bg"],
  [/^(border(?:Top|Right|Bottom|Left)?Color|borderColor|outlineColor)$/, "border"],
];

interface Edit {
  start: number;
  end: number;
  text: string;
  change: Omit<FixChange, "line">;
}

/** Edits for `prop: value` declarations inside `text`, offset by `base`. */
const isWhite = (c: Oklch) => c.l > 0.99 && c.c < 0.01;

/** Does a declaration block set a background that maps to the accent fill? */
function hasAccentBackground(body: string, ctx: Ctx): boolean {
  for (const m of body.matchAll(/background(?:-color|Color)?["']?\s*:\s*["']?([^;,}"'\n]+)/gi)) {
    const v = m[1]!.trim();
    if (/var\(--accent\)/.test(v)) return true;
    const c = parseColor(v);
    if (c && colourToken("bg", c, ctx) === "accent") return true;
  }
  return false;
}

function declarationEdits(text: string, base: number, ctx: Ctx, opts: { selectorAt?: (offset: number) => string; bodyAt?: (offset: number) => string } = {}): Edit[] {
  const edits: Edit[] = [];
  const re = /(^|[;{\s])([\w-]+)\s*:\s*([^;{}]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const prop = m[2]!.toLowerCase();
    if (prop.startsWith("--")) continue;
    const value = m[3]!;
    const valueStart = m.index + m[1]!.length + m[0].slice(m[1]!.length).indexOf(value, m[2]!.length);
    const slot = CSS_SLOT.find(([r]) => r.test(prop))?.[1];
    if (slot) {
      COLOR_LITERAL.lastIndex = 0;
      let c: RegExpExecArray | null;
      while ((c = COLOR_LITERAL.exec(value))) {
        const colour = parseColor(c[0]);
        let t = colour ? colourToken(slot, colour, ctx) : null;
        if (!t && colour && slot === "text" && isWhite(colour) && hasAccentBackground(opts.bodyAt?.(m.index) ?? text, ctx)) t = "accent-fg";
        if (!t) continue;
        const start = base + valueStart + c.index;
        edits.push({ start, end: start + c[0].length, text: cssVar(t), change: { kind: "colour", from: c[0], to: cssVar(t) } });
      }
    } else if (prop === "font-family" && !/^\s*(var\(|inherit|initial|unset)/.test(value)) {
      const family = primaryFamily(value) ?? value.split(",")[0]!;
      const role = fontRole(family, ctx, opts.selectorAt?.(base + m.index) ?? "");
      const raw = value.trimEnd();
      const start = base + valueStart;
      edits.push({ start, end: start + raw.length, text: FONT_VAR[role], change: { kind: "font", from: raw, to: FONT_VAR[role] } });
    }
  }
  return edits;
}

function cssEdits(code: string, ctx: Ctx): Edit[] {
  const { masked } = lex(code, { css: true });
  const selectorAt = (offset: number) => {
    const open = masked.lastIndexOf("{", offset);
    if (open < 0) return "";
    const prev = Math.max(masked.lastIndexOf("}", open), masked.lastIndexOf(";", open), masked.lastIndexOf("{", open - 1));
    return masked.slice(prev + 1, open).trim();
  };
  // Work on the masked copy so commented-out declarations are skipped; offsets are identical.
  const bodyAt = (offset: number) => {
    const open = masked.lastIndexOf("{", offset);
    const close = masked.indexOf("}", offset);
    return masked.slice(open + 1, close < 0 ? undefined : close);
  };
  return declarationEdits(masked, 0, ctx, { selectorAt, bodyAt }).map((e) => ({ ...e, change: { ...e.change, from: code.slice(e.start, e.end) } }));
}

function styleObjectEdits(code: string, masked: string, ctx: Ctx): Edit[] {
  const edits: Edit[] = [];
  const re = /\bstyle\s*=\s*\{\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked))) {
    const open = m.index + m[0].length - 1;
    const close = matchBracket(masked, open);
    const region = code.slice(open, close + 1);
    const prop = /\b([A-Za-z]+)\s*:\s*(["'])([^"'\n]*)\2/g;
    let p: RegExpExecArray | null;
    while ((p = prop.exec(region))) {
      if (masked.slice(open + p.index, open + p.index + p[0].length) !== p[0]) continue; // inside a comment
      const key = p[1]!;
      const value = p[3]!;
      const valueStart = open + p.index + p[0].length - value.length - 1;
      const slot = JS_SLOT.find(([r]) => r.test(key))?.[1];
      if (slot) {
        const colour = parseColor(value);
        let t = colour ? colourToken(slot, colour, ctx) : null;
        if (!t && colour && slot === "text" && isWhite(colour) && hasAccentBackground(region, ctx)) t = "accent-fg";
        if (t) edits.push({ start: valueStart, end: valueStart + value.length, text: cssVar(t), change: { kind: "colour", from: value, to: cssVar(t) } });
      } else if (key === "fontFamily" && !/^(var\(|inherit)/.test(value)) {
        const role = fontRole(primaryFamily(value) ?? value.split(",")[0]!, ctx);
        edits.push({ start: valueStart, end: valueStart + value.length, text: FONT_VAR[role], change: { kind: "font", from: value, to: FONT_VAR[role] } });
      }
    }
    re.lastIndex = close;
  }
  return edits;
}

// ---------------------------------------------------------------------------
// fixSource
// ---------------------------------------------------------------------------

const JS_EXT = new Set(["ts", "tsx", "js", "jsx", "mjs", "cjs", "mts", "cts", "html", "htm", "vue", "svelte", "astro", "mdx"]);

/** Applies the safe fixes to one file. `filename` decides the file type. */
export function fixSource(code: string, filename: string, options: FixOptions = {}): FixResult {
  const file = filename.replace(/\\/g, "/");
  const ext = /\.([a-z]+)$/i.exec(file)?.[1]?.toLowerCase() ?? "tsx";
  if (code.includes("vamos-ui-ignore-file") || code.startsWith("/* vamos-ui brand")) return { code, changes: [] };
  const ctx = makeCtx(options);
  const isCss = ["css", "scss", "pcss"].includes(ext);
  if (!isCss && !JS_EXT.has(ext)) return { code, changes: [] };

  const { masked, strings, comments } = lex(code, { css: isCss });
  const starts = lineIndex(code);
  const ignored = new Set<number>();
  for (const c of comments) {
    if (!c.text.includes("vamos-ui-ignore")) continue;
    ignored.add(position(starts, c.start).line);
    ignored.add(position(starts, c.end).line + 1);
  }

  let edits: Edit[] = [];
  if (isCss) edits = cssEdits(code, ctx);
  else {
    for (const s of strings) {
      if (s.value.length > 2000 || /^\s*(https?:|\/|\.\.?\/|@|data:)/.test(s.value)) continue;
      const before = masked.slice(Math.max(0, s.start - 8), s.start);
      if (/\bstyle\s*=\s*$/.test(before)) {
        edits.push(...declarationEdits(s.value, s.start + 1, ctx));
        continue;
      }
      const { value, edits: classEdits } = fixClassList(s.value, ctx);
      if (!classEdits.length) continue;
      // One edit per string keeps whitespace clean-up simple; changes are reported per class.
      const first = classEdits[0]!;
      edits.push({ start: s.start + 1, end: s.end - 1, text: value, change: { kind: first.kind, from: first.token, to: first.next } });
      for (const e of classEdits.slice(1)) edits.push({ start: s.start + 1, end: s.start + 1, text: "", change: { kind: e.kind, from: e.token, to: e.next } });
    }
    edits.push(...styleObjectEdits(code, masked, ctx));
  }

  // Drop ignored lines, then apply from the end so offsets stay valid. Zero-width entries only carry change records.
  const kept = edits.filter((e) => !ignored.has(position(starts, e.start).line));
  const real = kept.filter((e) => e.end > e.start || e.text).sort((a, b) => b.start - a.start);
  let out = code;
  let lastStart = Infinity;
  const applied = new Set<Edit>();
  for (const e of real) {
    if (e.end > lastStart) continue; // overlapping; keep the later one
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    lastStart = e.start;
    applied.add(e);
  }
  const changes: FixChange[] = kept
    .filter((e) => applied.has(e) || (e.end === e.start && !e.text && [...applied].some((a) => a.start === e.start)))
    .sort((a, b) => a.start - b.start)
    .map((e) => ({ line: position(starts, e.start).line, ...e.change }));
  return { code: out, changes };
}
