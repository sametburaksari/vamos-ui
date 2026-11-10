// @ts-check
/**
 * Minimal CSS reader for the design-token stylesheet: enough structure to list every custom
 * property with its light value, dark value, axis overrides and the comment that documents it.
 * Dependency-free; handles comments, strings, nested at-rules and data: URLs.
 */

/**
 * @typedef {{ name: string, value: string, comment?: string }} Decl
 * @typedef {object} CssNode
 * @property {"rule" | "at"} kind
 * @property {string} prelude Selector, or at-rule text ("@theme inline", "@media (…)").
 * @property {Decl[]} decls
 * @property {CssNode[]} children
 * @property {string | undefined} comment Comment immediately before the block.
 * @property {string | undefined} section Most recent section banner before the block.
 */

/**
 * @typedef {object} Token
 * @property {string} name
 * @property {string | null} light
 * @property {string | null} dark
 * @property {string} [description]
 * @property {string} [section]
 * @property {"token" | "theme"} kind "theme" = a Tailwind theme mapping (source of utility classes).
 * @property {{ selector: string, value: string }[]} overrides
 */

/** @param {string} text */
const cleanComment = (text) =>
  text
    .replace(/^\/\*+|\*+\/$/g, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*?\s?/, "").trim())
    .filter((l) => l && !/^-{4,}$/.test(l))
    .join(" ")
    .trim();

/**
 * Parses CSS into a shallow tree (rules and at-rule blocks with their declarations).
 * @param {string} css
 * @returns {CssNode[]}
 */
export function parseCss(css) {
  let i = 0;
  const n = css.length;
  /** @type {string | undefined} */
  let section;
  let bannerOpen = false;
  /** @type {string | undefined} */
  let bannerText;

  /** @returns {CssNode[]} */
  const parseBlock = (/** @type {boolean} */ topLevel) => {
    /** @type {CssNode[]} */
    const nodes = [];
    /** @type {Decl[]} */
    const decls = [];
    let buf = "";
    /** @type {string | undefined} */
    let pendingComment;
    while (i < n) {
      const c = css[i];
      if (c === "/" && css[i + 1] === "*") {
        const end = css.indexOf("*/", i + 2);
        const raw = css.slice(i, end < 0 ? n : end + 2);
        i = end < 0 ? n : end + 2;
        const text = cleanComment(raw);
        if (topLevel && /^\/\*\s*-{6,}\s*\*\/$/.test(raw)) {
          // Section banners: a dashed line, one or more text comments, a dashed line.
          bannerOpen = !bannerOpen;
          bannerText = bannerOpen ? undefined : bannerText;
          pendingComment = undefined;
        } else if (topLevel && bannerOpen) {
          if (!bannerText) section = bannerText = text.replace(/\s*[—–-]{1,2}\s.*$/, "").trim() || text;
        } else if (!buf.trim()) pendingComment = text || undefined;
        continue;
      }
      if (c === '"' || c === "'") {
        const start = i++;
        while (i < n && css[i] !== c) i += css[i] === "\\" ? 2 : 1;
        i++;
        buf += css.slice(start, i);
        continue;
      }
      if (c === "(") {
        // keep parenthesised groups (url(), var(), media queries) intact, including ';'
        let depth = 0;
        const start = i;
        while (i < n) {
          const ch = css[i];
          if (ch === '"' || ch === "'") {
            i++;
            while (i < n && css[i] !== ch) i += css[i] === "\\" ? 2 : 1;
          } else if (ch === "(") depth++;
          else if (ch === ")" && --depth === 0) {
            i++;
            break;
          }
          i++;
        }
        buf += css.slice(start, i);
        continue;
      }
      if (c === "{") {
        i++;
        const prelude = buf.trim().replace(/\s+/g, " ");
        const comment = pendingComment;
        buf = "";
        pendingComment = undefined;
        const sectionAtStart = section;
        const inner = parseBlock(false);
        const node = /** @type {CssNode} */ ({
          kind: prelude.startsWith("@") ? "at" : "rule",
          prelude,
          decls: /** @type {any} */ (inner).decls,
          children: inner,
          comment,
          section: sectionAtStart,
        });
        nodes.push(node);
        continue;
      }
      if (c === "}") {
        i++;
        flushDecl();
        return Object.assign(nodes, { decls });
      }
      if (c === ";") {
        i++;
        flushDecl();
        continue;
      }
      buf += c;
      i++;
    }
    flushDecl();
    return Object.assign(nodes, { decls });

    function flushDecl() {
      const text = buf.trim();
      buf = "";
      if (!text || text.startsWith("@")) {
        pendingComment = undefined;
        return;
      }
      const colon = text.indexOf(":");
      if (colon > 0) {
        const name = text.slice(0, colon).trim();
        const value = text.slice(colon + 1).trim().replace(/\s+/g, " ");
        decls.push({ name, value, ...(pendingComment ? { comment: pendingComment } : {}) });
      }
      pendingComment = undefined;
    }
  };
  return parseBlock(true);
}

/** @param {string} selector */
const selectorList = (selector) => selector.split(",").map((s) => s.trim().replace(/\s+/g, " "));

/**
 * Extracts design tokens from the stylesheet.
 * @param {string} css
 * @returns {Token[]}
 */
export function extractTokens(css) {
  const tree = parseCss(css);
  /** @type {Map<string, Token>} */
  const tokens = new Map();
  const get = (/** @type {string} */ name, /** @type {"token" | "theme"} */ kind, /** @type {CssNode} */ node) => {
    let t = tokens.get(name);
    if (!t) {
      t = { name, light: null, dark: null, kind, overrides: [], ...(node.section ? { section: node.section } : {}) };
      tokens.set(name, t);
    }
    return t;
  };
  /** @param {CssNode} node @param {string} [context] */
  const visitRule = (node, context) => {
    const sels = selectorList(node.prelude);
    const isLight = !context && sels.includes(":root");
    const isDark = !context && sels.includes(".dark");
    for (const d of node.decls) {
      if (!d.name.startsWith("--")) continue;
      const isNew = !tokens.has(d.name);
      const t = get(d.name, "token", node);
      // A rule's leading comment only documents the tokens that rule introduces.
      const description = d.comment ?? (isNew ? node.comment : undefined);
      if (description && !t.description) t.description = description;
      if (isLight) t.light = d.value;
      if (isDark) t.dark = d.value;
      if (!isLight && !isDark) t.overrides.push({ selector: context ? `${context} ${node.prelude}` : node.prelude, value: d.value });
    }
  };
  for (const node of tree) {
    if (node.kind === "rule") visitRule(node);
    else if (/^@theme\b/.test(node.prelude)) {
      for (const d of node.decls) {
        if (!d.name.startsWith("--")) continue;
        const t = get(d.name, "theme", node);
        t.light = d.value;
        t.dark = d.value;
        if (d.comment && !t.description) t.description = d.comment;
      }
    } else if (/^@media\b/.test(node.prelude)) {
      for (const child of node.children) if (child.kind === "rule") visitRule(child, node.prelude);
    }
  }
  // A token never redefined under .dark inherits its light value.
  for (const t of tokens.values()) if (t.dark === null && t.light !== null) t.dark = t.light;
  return [...tokens.values()].sort((a, b) => a.name.localeCompare(b.name));
}
