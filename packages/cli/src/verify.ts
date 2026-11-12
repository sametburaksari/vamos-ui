/**
 * vamos-ui/verify — a fast, dependency-free linter for Vamos UI design rules.
 *
 * It is token/regex based on purpose: no TypeScript compiler, no AST. It runs on
 * any JS/TS/JSX/HTML/CSS source and is safe to call from editors, CI or agents.
 *
 * Suppress a finding with a comment containing `vamos-ui-ignore` on the same or
 * the previous line, or `vamos-ui-ignore-file` anywhere in the file.
 */

import { lex, lineIndex, matchBracket, position, type Comment } from "./lexer";

export { PROJECT_RULES, collectRoutes, internalHrefs, usesSiteBlocks, verifyProject, type ProjectCheckInput, type ProjectIssue, type ProjectSource } from "./site-check";
export { AI_BOTS, SITE_FILE, SITE_JSON_SCHEMA, SITE_SCHEMA, missingSiteFields, parseSiteJson, siteTemplate, type SiteFaq, type SiteInfo, type SiteService } from "./site-info";

export type VerifySeverity = "error" | "warning";

export interface VerifyIssue {
  rule: string;
  severity: VerifySeverity;
  message: string;
  line: number;
  column: number;
  fix?: string;
}

export interface VerifyRule {
  id: string;
  severity: VerifySeverity;
  description: string;
}

/** Every rule verifySource can report, for docs and tool listings. */
export const VERIFY_RULES: readonly VerifyRule[] = [
  { id: "raw-color", severity: "error", description: "Raw colour literals (hex/rgb/hsl/oklch) or Tailwind palette classes instead of design tokens." },
  { id: "no-dark-variant", severity: "error", description: "dark: variants. Tokens already switch under .dark." },
  { id: "no-hardcoded-font", severity: "error", description: "Hard-coded font-family or font names. Use font-sans / font-display / font-mono and the data-font axis." },
  { id: "icon-button-label", severity: "error", description: "Icon-only buttons need an accessible name (aria-label, or label on IconButton)." },
  { id: "img-alt", severity: "error", description: "<img>/<Image> needs an alt attribute (alt=\"\" for decorative images)." },
  { id: "click-events-interactive", severity: "error", description: "onClick on a non-interactive element needs role and tabIndex (or use <Button>)." },
  { id: "no-positive-tabindex", severity: "error", description: "Positive tabIndex breaks the natural focus order." },
  { id: "use-client", severity: "error", description: "Files under app/ that use React hooks need a \"use client\" directive." },
  { id: "z-index-token", severity: "warning", description: "Arbitrary z-index values. Use the z tokens (--z-sticky, --z-nav, --z-overlay, --z-popover, --z-toast, --z-tooltip)." },
  { id: "prefer-kit-component", severity: "warning", description: "Hand-rolled modal/dropdown/tooltip/select markup. Use the kit component." },
  { id: "placeholder-content", severity: "warning", description: "Placeholder contact data or links left in: dummy phone numbers (000 00 00, 555 55 55), example.com / .example emails and URLs, href=\"#\", invented map short links, [fill-in] fields." },
];

const SEVERITY: Record<string, VerifySeverity> = Object.fromEntries(VERIFY_RULES.map((r) => [r.id, r.severity]));

interface JsxAttr {
  name: string;
  /** Raw value including quotes/braces, or null for a boolean attribute. */
  value: string | null;
  start: number;
  valueStart: number;
}

interface JsxTag {
  name: string;
  start: number;
  /** Offset just after the closing `>` of the opening tag. */
  end: number;
  selfClosing: boolean;
  attrs: JsxAttr[];
  spread: boolean;
}

function parseTags(masked: string): JsxTag[] {
  const tags: JsxTag[] = [];
  const re = /<([A-Za-z][\w.:-]*)(?=[\s/>])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked))) {
    const start = m.index;
    let i = start + m[0].length;
    const attrs: JsxAttr[] = [];
    let spread = false;
    let selfClosing = false;
    let ok = false;
    while (i < masked.length) {
      const c = masked[i]!;
      if (/\s/.test(c)) {
        i++;
        continue;
      }
      if (c === ">") {
        ok = true;
        i++;
        break;
      }
      if (c === "/" && masked[i + 1] === ">") {
        ok = true;
        selfClosing = true;
        i += 2;
        break;
      }
      if (c === "{") {
        const close = matchBracket(masked, i);
        if (/^\{\s*\.\.\./.test(masked.slice(i, i + 8))) spread = true;
        i = close + 1;
        continue;
      }
      const nameMatch = /^[A-Za-z_@:][\w:.@-]*/.exec(masked.slice(i, i + 64));
      if (!nameMatch) break; // not a tag (e.g. a comparison or generic)
      const name = nameMatch[0];
      const attrStart = i;
      i += name.length;
      while (masked[i] === " ") i++;
      if (masked[i] === "=") {
        i++;
        while (masked[i] === " ") i++;
        const q = masked[i];
        const valueStart = i;
        if (q === '"' || q === "'") {
          const close = masked.indexOf(q, i + 1);
          if (close === -1) break;
          attrs.push({ name, value: masked.slice(i, close + 1), start: attrStart, valueStart });
          i = close + 1;
        } else if (q === "{") {
          const close = matchBracket(masked, i);
          attrs.push({ name, value: masked.slice(i, close + 1), start: attrStart, valueStart });
          i = close + 1;
        } else {
          const v = /^[^\s>]+/.exec(masked.slice(i))?.[0] ?? "";
          attrs.push({ name, value: v, start: attrStart, valueStart });
          i += v.length;
        }
      } else {
        attrs.push({ name, value: null, start: attrStart, valueStart: i });
      }
    }
    if (ok) {
      tags.push({ name: m[1]!, start, end: i, selfClosing, attrs, spread });
      re.lastIndex = Math.max(re.lastIndex, start + 1);
    }
  }
  return tags;
}

function attr(tag: JsxTag, ...names: string[]): JsxAttr | undefined {
  const lower = names.map((n) => n.toLowerCase());
  return tag.attrs.find((a) => lower.includes(a.name.toLowerCase()));
}

/** Plain value of an attribute: "x" → x, {"x"} → x, {3} → 3; null for dynamic values. */
function staticValue(a: JsxAttr | undefined): string | null {
  if (!a || a.value === null) return null;
  const v = a.value.trim();
  const quoted = /^["'`]([^"'`]*)["'`]$/.exec(v);
  if (quoted) return quoted[1]!;
  const braced = /^\{\s*(?:["'`]([^"'`]*)["'`]|(-?\d+))\s*\}$/.exec(v);
  if (braced) return braced[1] ?? braced[2]!;
  if (!v.startsWith("{")) return v;
  return null;
}

/** Children source of a non-self-closing tag (matching same-name nesting). */
function childrenOf(masked: string, tag: JsxTag): string | null {
  if (tag.selfClosing) return null;
  const name = tag.name.replace(/\./g, "\\.");
  const re = new RegExp(`<${name}(?=[\\s/>])|</${name}\\s*>`, "g");
  re.lastIndex = tag.end;
  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked))) {
    if (m[0].startsWith("</")) {
      depth--;
      if (depth === 0) return masked.slice(tag.end, m.index);
    } else {
      const gt = masked.indexOf(">", m.index);
      if (gt !== -1 && masked[gt - 1] !== "/") depth++;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Rule data
// ---------------------------------------------------------------------------

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|mauve|olive|mist|taupe";
const COLOR_UTIL =
  "bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow|inset-shadow|inset-ring|drop-shadow";
const VARIANTS = "(?:[\\w@\\[\\]&=\"'.#>*()-]+:)*";
const PALETTE_CLASS = new RegExp(`^${VARIANTS}!?(${COLOR_UTIL})-(${PALETTE})-(50|[1-9]00|950)(?:\\/[\\w.\\[\\]%]+)?!?$`);
const BW_CLASS = new RegExp(`^${VARIANTS}!?(${COLOR_UTIL})-(white|black)(?:\\/[\\w.\\[\\]%]+)?!?$`);
const ARBITRARY_COLOR = /-\[(?:[\w-]+:)?(#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\()/;
const DARK_VARIANT = /(^|:)dark:[\w[!-]/;
const Z_CLASS = /^(?:[\w@[\]-]+:)*-?z-(\[[^\]]+\]|\d+)$/;
const FONT_ARBITRARY = /^(?:[\w@[\]-]+:)*font-\[([^\]]+)\]$/;
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/g;
const FONT_NAMES = /\b(Inter|Arial|Helvetica(?: Neue)?|Roboto|Open Sans|Poppins|Montserrat|Lato|Times New Roman|Segoe UI)\b/;

const TOKEN_HINT: Record<string, string> = {
  bg: "bg-surface, bg-surface-2, bg-accent, bg-accent-soft, bg-danger …",
  text: "text-fg, text-fg-muted, text-fg-subtle, text-accent-ink, text-danger …",
  border: "border-line, border-surface-border, border-field-border …",
  ring: "ring-ring",
};

function tokenFix(util: string): string {
  const base = util.split("-")[0]!;
  const hint = TOKEN_HINT[base];
  return hint ? `Use a semantic token class such as ${hint}` : "Use a semantic token class (see https://ui.vamos.ist/docs/theming).";
}

const NON_INTERACTIVE = new Set([
  "div", "span", "li", "ul", "ol", "p", "section", "article", "aside", "header", "footer", "main", "nav",
  "td", "tr", "th", "tbody", "table", "img", "h1", "h2", "h3", "h4", "h5", "h6", "figure", "label", "dl", "dt", "dd", "form",
]);

const REACT_HOOKS =
  /(?:^|[^\w.])(?:React\.)?(use(?:State|Effect|LayoutEffect|InsertionEffect|Reducer|Ref|Context|Memo|Callback|Transition|DeferredValue|Optimistic|ActionState|FormStatus|SyncExternalStore|Id|ImperativeHandle|EffectEvent))\s*[(<]/;

// ---------------------------------------------------------------------------
// verifySource
// ---------------------------------------------------------------------------

/**
 * Lints one source file against the Vamos UI design rules.
 * @param code     File contents.
 * @param filename Path used for file-type and app/ detection (posix or windows separators).
 */
export function verifySource(code: string, filename: string): VerifyIssue[] {
  const file = filename.replace(/\\/g, "/");
  const ext = /\.([a-z]+)$/i.exec(file)?.[1]?.toLowerCase() ?? "tsx";
  if (code.includes("vamos-ui-ignore-file")) return [];
  if (["css", "scss", "pcss"].includes(ext)) return finish(code, verifyCss(code));
  if (!["ts", "tsx", "js", "jsx", "mjs", "cjs", "mts", "cts", "html", "htm", "vue", "svelte", "astro", "mdx"].includes(ext)) return [];

  const { masked, strings, comments } = lex(code);
  const issues: Raw[] = [];
  const push = (rule: string, offset: number, message: string, fix?: string) =>
    issues.push({ rule, offset, message, fix, severity: SEVERITY[rule]! });

  // --- class tokens in every string literal ---------------------------------
  for (const s of strings) {
    if (s.value.length > 2000 || /^\s*(https?:|\/|\.\.?\/|@|data:)/.test(s.value)) continue;
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s.value))) {
      const tok = m[0];
      const at = s.start + 1 + m.index;
      if (tok.includes("${")) continue;
      let pm: RegExpExecArray | null;
      if ((pm = PALETTE_CLASS.exec(tok))) {
        push("raw-color", at, `Tailwind palette class "${tok}" bypasses the theme.`, tokenFix(pm[1]!));
      } else if ((pm = BW_CLASS.exec(tok))) {
        issues.push({ rule: "raw-color", severity: "warning", offset: at, message: `"${tok}" ignores light/dark and material.`, fix: tokenFix(pm[1]!) });
      } else if (/^[\w:@[\]!-]*-\[/.test(tok) && ARBITRARY_COLOR.test(tok)) {
        push("raw-color", at, `Arbitrary colour "${tok}" bypasses the theme.`, "Use a token class (bg-accent, text-fg-muted …) or var(--token).");
      }
      if (DARK_VARIANT.test(tok)) {
        push("no-dark-variant", at, `"${tok}" uses a dark: variant.`, "Remove the dark: class; tokens switch automatically under .dark.");
      }
      const zm = Z_CLASS.exec(tok);
      if (zm) {
        const v = zm[1]!;
        const arbitrary = v.startsWith("[") ? !/^\[var\(--z-/.test(v) : Number(v) > 10;
        if (arbitrary) push("z-index-token", at, `z-index "${tok}" is not a z token.`, "Use z-(--z-overlay), z-(--z-popover), z-(--z-toast) … or z-0/z-10 for local stacking.");
      }
      const fm = FONT_ARBITRARY.exec(tok);
      if (fm && !/^(?:var\(--font|inherit$|initial$|unset$|\d|weight:|length:)/.test(fm[1]!)) {
        push("no-hardcoded-font", at, `"${tok}" hard-codes a font.`, "Use font-sans / font-display / font-mono and pick the pairing with data-font.");
      }
    }
    if (/font-family\s*:/i.test(s.value) && !/font-family\s*:\s*var\(/i.test(s.value)) {
      push("no-hardcoded-font", s.start, "Inline font-family in a string.", "Use font-sans / font-display / font-mono and the data-font axis.");
    }
  }

  // --- style / class regions -------------------------------------------------
  const tags = parseTags(masked);
  const styleRegions: [number, number][] = [];
  const classRegions: [number, number][] = [];
  for (const t of tags) {
    for (const a of t.attrs) {
      if (a.value === null) continue;
      const range: [number, number] = [a.valueStart, a.valueStart + a.value.length];
      if (a.name === "style") styleRegions.push(range);
      else if (a.name === "class" || /className$/i.test(a.name)) classRegions.push(range);
    }
  }
  const callRe = /\b(?:cn|clsx|cva|twMerge|classNames|tv)\s*\(/g;
  let cm: RegExpExecArray | null;
  while ((cm = callRe.exec(masked))) {
    const open = cm.index + cm[0].length - 1;
    classRegions.push([open, matchBracket(masked, open) + 1]);
  }
  const inRegion = (regions: [number, number][], offset: number) => regions.some(([a, b]) => offset >= a && offset < b);

  for (const s of strings) {
    const inStyle = inRegion(styleRegions, s.start);
    const inClass = inRegion(classRegions, s.start);
    if (!inStyle && !inClass) continue;
    if (inStyle) {
      for (const re of [HEX, COLOR_FN]) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(s.value))) {
          push("raw-color", s.start + 1 + m.index, `Raw colour "${m[0].replace(/\($/, "(…)")}" in style.`, "Use var(--accent), var(--fg-muted) … or a token class.");
        }
      }
    }
    const font = FONT_NAMES.exec(s.value);
    if (font && (inStyle || /font-\[/.test(s.value))) {
      // font-[…] tokens are already reported above; only report style strings here.
      if (inStyle) push("no-hardcoded-font", s.start + 1 + font.index, `Hard-coded font "${font[1]}".`, "Use font-sans / font-display / font-mono and the data-font axis.");
    }
  }
  for (const [a, b] of styleRegions) {
    const region = masked.slice(a, b);
    // Only literal values: a computed fontFamily (e.g. a font picker preview) is legitimate.
    const ff = /\bfontFamily\s*:\s*["'`](?!var\(|inherit)/.exec(region);
    if (ff) {
      push("no-hardcoded-font", a + ff.index, "Inline fontFamily.", "Use font-sans / font-display / font-mono and the data-font axis.");
    }
    const z = /\bz-?[iI]ndex\s*:\s*["'`]?(-?\d+)/.exec(region);
    if (z && Math.abs(Number(z[1])) > 10) {
      push("z-index-token", a + z.index, `Inline z-index ${z[1]}.`, "Use zIndex: \"var(--z-overlay)\" (or --z-popover, --z-toast, --z-tooltip …).");
    }
  }

  // --- next/font with a hard-coded family -------------------------------------
  const nf = /import\s*\{([^}]*)\}\s*from\s*["']next\/font\/google["']/.exec(masked);
  if (nf) {
    const named = FONT_NAMES.exec(nf[1]!.replace(/_/g, " "));
    if (named) {
      issues.push({ rule: "no-hardcoded-font", severity: "warning", offset: nf.index, message: `next/font loads "${named[1]}" directly.`, fix: "Load fonts through the data-font axis (or @vamos-ui/react/fonts) so the pairing stays switchable." });
    }
  }

  // --- element rules ---------------------------------------------------------
  const kitHints = new Set<string>();
  const hint = (kind: string, offset: number, message: string, fix: string) => {
    if (kitHints.has(kind)) return;
    kitHints.add(kind);
    push("prefer-kit-component", offset, message, fix);
  };
  const isHtml = ext === "html" || ext === "htm";
  const isIcon = iconMatcher(masked);
  for (const t of tags) {
    const lower = t.name.toLowerCase();
    const isDom = t.name === lower || isHtml;

    if ((lower === "img" && isDom) || t.name === "Image") {
      if (!attr(t, "alt") && !t.spread) push("img-alt", t.start, `<${t.name}> is missing alt.`, 'Add alt="…" describing the image, or alt="" if it is decorative.');
    }

    const tab = staticValue(attr(t, "tabIndex", "tabindex"));
    if (tab !== null && /^\d+$/.test(tab) && Number(tab) > 0) {
      push("no-positive-tabindex", attr(t, "tabIndex", "tabindex")!.start, `tabIndex=${tab} breaks the natural focus order.`, "Use tabIndex={0} (focusable) or -1 (programmatic) and reorder the DOM instead.");
    }

    const hidden = staticValue(attr(t, "aria-hidden")) !== "false" && !!attr(t, "aria-hidden");
    const click = attr(t, "onClick", "onclick");
    const onlyStops = !!click?.value && /^\{\s*\(?\s*\w*\s*\)?\s*=>\s*\{?\s*\w+\.stopPropagation\(\);?\s*\}?\s*\}$/.test(click.value);
    if (isDom && NON_INTERACTIVE.has(lower) && click && !onlyStops && !t.spread && !hidden) {
      const role = staticValue(attr(t, "role"));
      const hasRole = !!attr(t, "role");
      // Options/items inside a composite widget get focus via aria-activedescendant or roving tabindex.
      const hasTab = !!attr(t, "tabIndex", "tabindex") || (!!role && COMPOSITE_CHILD_ROLES.has(role));
      if (!hasRole || !hasTab) {
        const missing = [!hasRole && "role", !hasTab && "tabIndex"].filter(Boolean).join(" and ");
        push("click-events-interactive", attr(t, "onClick", "onclick")!.start, `onClick on <${t.name}> without ${missing}: keyboard and screen-reader users can't use it.`, 'Use <Button> (or <button>), or add role="button" tabIndex={0} and an onKeyDown handler.');
      }
    }

    if (t.name === "IconButton" && !attr(t, "label", "aria-label") && !t.spread) {
      push("icon-button-label", t.start, "<IconButton> without label.", 'Add label="…" — it becomes the accessible name and the tooltip.');
    } else if ((t.name === "Button" || (lower === "button" && isDom)) && !t.spread && !hidden) {
      const named = attr(t, "aria-label", "aria-labelledby", "label", "title");
      if (!named) {
        const kids = childrenOf(masked, t);
        const iconProp = attr(t, "icon", "leftIcon", "iconLeft", "startIcon");
        if (kids === null ? !!iconProp && t.selfClosing : isIconOnly(kids, isIcon)) {
          push("icon-button-label", t.start, `Icon-only <${t.name}> has no accessible name.`, t.name === "Button" ? 'Use <IconButton label="…"> or add aria-label="…".' : 'Add aria-label="…" (or use <IconButton label="…">).');
        }
      }
    }

    if (isDom) {
      const role = staticValue(attr(t, "role"));
      if (lower === "dialog" || role === "dialog" || role === "alertdialog" || attr(t, "aria-modal")) {
        hint("dialog", t.start, "Hand-rolled modal markup.", "Use Dialog, AlertDialog or Sheet from the kit: focus trap, scroll lock, Escape and layering are built in.");
      } else if (role === "menu" || role === "menubar") {
        hint("menu", t.start, "Hand-rolled menu markup.", "Use DropdownMenu (or ContextMenu) from the kit.");
      } else if (role === "listbox" || role === "combobox") {
        hint("listbox", t.start, "Hand-rolled listbox markup.", "Use Select or Combobox from the kit.");
      } else if (role === "tooltip") {
        hint("tooltip", t.start, "Hand-rolled tooltip markup.", "Use Tooltip from the kit (or IconButton, which includes one).");
      } else if (lower === "select" && !isHtml) {
        hint("select", t.start, "Native <select> element.", "Use Select (or NativeSelect for long native lists) from the kit so it follows the theme.");
      } else if (lower === "div") {
        const cls = staticValue(attr(t, "className", "class")) ?? "";
        if (/\bfixed\b/.test(cls) && /\binset-0\b/.test(cls) && /\bbg-|backdrop|z-/.test(cls)) {
          hint("dialog", t.start, "Full-screen fixed overlay looks like a hand-rolled modal.", "Use Dialog or Sheet from the kit.");
        }
      }
    }
  }

  const stateRe = /\[\s*(\w*?(modal|dropdown|tooltip|popover|menu)\w*)\s*,\s*set\w*\s*\]\s*=\s*(?:React\.)?useState/gi;
  let sm: RegExpExecArray | null;
  while ((sm = stateRe.exec(masked))) {
    const kind = sm[2]!.toLowerCase();
    const map: Record<string, [string, string]> = {
      modal: ["dialog", "Dialog or Sheet"],
      dropdown: ["menu", "DropdownMenu, Select or Combobox"],
      menu: ["menu", "DropdownMenu"],
      tooltip: ["tooltip", "Tooltip"],
      popover: ["popover", "Popover"],
    };
    const [key, comp] = map[kind]!;
    hint(key, sm.index, `State "${sm[1]}" suggests a hand-rolled ${kind}.`, `Use ${comp} from the kit; it manages open state, focus and dismissal.`);
  }

  checkPlaceholders(code, strings, push);

  // --- "use client" -----------------------------------------------------------
  if (/(^|\/)app\//.test(file) && /\.(tsx|jsx|ts|js)$/.test(file) && !/(^|\/)(route|middleware|proxy)\.[jt]sx?$/.test(file)) {
    const hook = REACT_HOOKS.exec(masked);
    if (hook) {
      const head = masked.replace(/^\s+/, "");
      if (!/^["']use client["']/.test(head)) {
        push("use-client", hook.index + (hook[0].length - hook[0].trimStart().length), `${hook[1]} is used in a Server Component file.`, 'Add "use client"; as the first line, or move the interactive part into a client component.');
      }
    }
  }

  return finish(code, issues, comments);
}

const PHONE_LIKE = /^(?:tel:|sms:)?\+?[\d\s().-]{7,22}$/;
const EXAMPLE_HOST = /(?:^|[@./])example(?:\.(?:com|org|net))?(?=$|[/:?#"'\s])/i;
const URL_OR_EMAIL = /^(?:https?:\/\/|mailto:|[\w.+-]+@)/i;
const WA_LINK = /^https?:\/\/(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/?\+?(\d+)/i;
const MAP_SHORT = /^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|g\.page)\/([^/?#]+)/i;
const FILL_IN = /(?<![\w-])\[[A-ZÇĞİÖŞÜ][\p{L}\p{N} .,'’/&()-]{2,48}\]/u;

/** A run of digits that no real number has: six or more of one digit, or 1234567 / 7654321. */
export function isPlaceholderNumber(digits: string): boolean {
  const national = digits.replace(/^(?:00|\+)?90/, "").replace(/^0/, "");
  if (national.length < 7) return false;
  return /(\d)\1{5,}/.test(national.slice(3)) || /^(\d)\1+$/.test(national) || /1234567|7654321|5555555/.test(national);
}

function checkPlaceholders(code: string, strings: { value: string; start: number }[], push: (rule: string, offset: number, message: string, fix?: string) => void): void {
  const fix = "Use the business’s real details before launch, or remove the item.";
  let fillIns = 0;
  let firstFill = -1;
  for (const s of strings) {
    const v = s.value.trim();
    if (!v || v.length > 4000) continue;
    const at = s.start + 1;
    if (PHONE_LIKE.test(v)) {
      const digits = v.replace(/\D/g, "");
      if (digits.length >= 7 && digits.length <= 15 && isPlaceholderNumber(digits)) push("placeholder-content", at, `"${v}" looks like a placeholder number.`, fix);
      continue;
    }
    const wa = WA_LINK.exec(v);
    if (wa && isPlaceholderNumber(wa[1]!)) {
      push("placeholder-content", at, `WhatsApp link "${v}" points to a placeholder number.`, fix);
      continue;
    }
    if (URL_OR_EMAIL.test(v) && EXAMPLE_HOST.test(v.replace(/^mailto:/i, ""))) {
      push("placeholder-content", at, `"${v}" is an example address; it goes nowhere on a live site.`, fix);
      continue;
    }
    const map = MAP_SHORT.exec(v);
    if (map && /^[a-z-]+$/.test(map[1]!)) {
      push("placeholder-content", at, `"${v}" looks like an invented map link (real short links are random letters and digits).`, "Copy the share link from the business’s Maps listing, or build one with directionsUrl().");
      continue;
    }
    if (v === "#") {
      const before = code.slice(Math.max(0, s.start - 24), s.start);
      if (/\bhref\s*[:=]\s*\{?\s*$/.test(before)) push("placeholder-content", at, 'href="#" goes nowhere.', "Link to the real page or anchor, or use a <button> for an action.");
      continue;
    }
    if (FILL_IN.test(v)) {
      fillIns++;
      if (firstFill < 0) firstFill = at;
    }
  }
  if (fillIns) push("placeholder-content", firstFill, `${fillIns === 1 ? "1 string still contains" : `${fillIns} strings still contain`} [fill-in] fields such as "${FILL_IN.exec(strings.find((x) => x.start + 1 === firstFill)!.value)![0]}".`, "Replace every [bracketed] field with the real text, and have legal pages reviewed before launch.");
}

/**
 * Decides whether a capitalised component is an icon: imported from an icon package,
 * named *Icon, or (for snippets without imports) not imported/declared at all.
 */
function iconMatcher(code: string): (name: string) => boolean {
  const iconNames = new Set<string>();
  const otherNames = new Set<string>();
  for (const m of code.matchAll(/import\s+(?:type\s+)?(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\}|\*\s+as\s+(\w+))?\s*from\s*["']([^"']+)["']/g)) {
    const names = [m[1], m[3], ...(m[2]?.split(",").map((x) => x.trim().split(/\s+as\s+/).pop()!.replace(/^type\s+/, "")) ?? [])].filter(Boolean) as string[];
    const target = /icon|lucide|heroicons|phosphor|tabler/i.test(m[4]!) ? iconNames : otherNames;
    names.forEach((n) => target.add(n));
  }
  for (const m of code.matchAll(/(?:function|const|let|class)\s+([A-Z]\w*)/g)) otherNames.add(m[1]!);
  return (name) => {
    const root = name.split(".")[0]!;
    if (iconNames.has(root) || /Icon$/.test(name)) return true;
    return !otherNames.has(root);
  };
}

const COMPOSITE_CHILD_ROLES = new Set(["option", "menuitem", "menuitemcheckbox", "menuitemradio", "treeitem", "gridcell", "row", "tab", "radio"]);

function isIconOnly(children: string, isIcon: (name: string) => boolean): boolean {
  if (/sr-only|VisuallyHidden/.test(children)) return false;
  let removed = 0;
  const rest = children
    .replace(/<svg[\s\S]*?<\/svg>/g, () => {
      removed++;
      return "";
    })
    .replace(/<([A-Z][\w.]*)(?:\s(?:[^<>{}]|\{[^{}]*\})*)?\/>/g, (m, name: string) => {
      if (!isIcon(name)) return m;
      removed++;
      return "";
    })
    .replace(/\{\s*\}/g, "");
  return removed > 0 && rest.trim() === "";
}

function verifyCss(code: string): Raw[] {
  const { masked } = lex(code, { css: true });
  const issues: Raw[] = [];
  const declRe = /([\w-]+)\s*:\s*([^;{}]+)/g;
  let m: RegExpExecArray | null;
  while ((m = declRe.exec(masked))) {
    const prop = m[1]!;
    const value = m[2]!;
    if (prop.startsWith("--")) continue; // defining a token is fine
    if (/^(color|background|background-color|border|border-color|outline|outline-color|fill|stroke|box-shadow|text-decoration-color|caret-color|accent-color)$/.test(prop)) {
      for (const re of [HEX, COLOR_FN]) {
        re.lastIndex = 0;
        const c = re.exec(value);
        if (c) issues.push({ rule: "raw-color", severity: "warning", offset: m.index + m[0].indexOf(value) + c.index, message: `Raw colour in ${prop}.`, fix: "Use var(--token) (e.g. var(--fg), var(--surface), var(--accent))." });
      }
    }
    if (prop === "font-family" && !/^\s*(var\(|inherit|initial|unset)/.test(value)) {
      issues.push({ rule: "no-hardcoded-font", severity: "warning", offset: m.index, message: "Hard-coded font-family.", fix: "Use var(--font-ui), var(--font-heading) or var(--font-code)." });
    }
    if (prop === "z-index" && /^\s*-?\d+/.test(value) && Math.abs(parseInt(value, 10)) > 10) {
      issues.push({ rule: "z-index-token", severity: "warning", offset: m.index, message: `z-index ${value.trim()} is not a z token.`, fix: "Use var(--z-overlay), var(--z-popover), var(--z-toast) …" });
    }
  }
  return issues;
}

interface Raw {
  rule: string;
  severity: VerifySeverity;
  offset: number;
  message: string;
  fix?: string;
}

function finish(code: string, raw: Raw[], comments: Comment[] = []): VerifyIssue[] {
  const starts = lineIndex(code);
  const ignored = new Set<number>();
  for (const c of comments) {
    if (!c.text.includes("vamos-ui-ignore")) continue;
    const { line } = position(starts, c.start);
    const endLine = position(starts, c.end).line;
    ignored.add(line);
    ignored.add(endLine + 1);
  }
  const seen = new Set<string>();
  const out: VerifyIssue[] = [];
  for (const r of raw.sort((a, b) => a.offset - b.offset)) {
    const { line, column } = position(starts, r.offset);
    if (ignored.has(line)) continue;
    const key = `${r.rule}:${line}:${column}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const issue: VerifyIssue = { rule: r.rule, severity: r.severity, message: r.message, line, column };
    if (r.fix) issue.fix = r.fix;
    out.push(issue);
  }
  return out;
}
