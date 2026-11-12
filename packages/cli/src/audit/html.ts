/**
 * A small, tolerant HTML tokenizer: enough to read tags, attributes and text from real-world
 * pages (unclosed tags, uppercase names, unquoted attributes, comments, inline scripts) without
 * a DOM. Pure: no Node built-ins, no dependencies.
 */

export type Token =
  | { type: "open"; name: string; attrs: Record<string, string>; selfClosing: boolean; offset: number }
  | { type: "close"; name: string; offset: number }
  | { type: "text"; text: string; offset: number }
  /** Contents of <script>, <style>, <title>, <textarea>: kept raw, attached to the element. */
  | { type: "raw"; name: string; attrs: Record<string, string>; text: string; offset: number };

const RAW = new Set(["script", "style", "title", "textarea", "noscript", "template", "xmp"]);
export const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", copy: "©", reg: "®", hellip: "…", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", middot: "·", bull: "•" };

export function decodeEntities(s: string): string {
  if (!s.includes("&")) return s;
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

const ATTR = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

export function parseAttrs(src: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of src.matchAll(ATTR)) {
    const key = m[1]!.toLowerCase();
    if (key in attrs) continue;
    attrs[key] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

/** Finds the end of a tag starting at `i` ('<'), honouring quoted attribute values. */
function tagEnd(html: string, i: number): number {
  let quote = "";
  for (let j = i + 1; j < html.length; j++) {
    const c = html[j]!;
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'") {
      // Only treat as a quote when it opens an attribute value (after '=').
      if (/=\s*$/.test(html.slice(Math.max(i, j - 8), j))) quote = c;
    } else if (c === ">") return j;
  }
  return -1;
}

export function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = html.length;
  const pushText = (from: number, to: number) => {
    if (to > from) tokens.push({ type: "text", text: decodeEntities(html.slice(from, to)), offset: from });
  };
  while (i < n) {
    const lt = html.indexOf("<", i);
    if (lt < 0) {
      pushText(i, n);
      break;
    }
    pushText(i, lt);
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt + 4);
      i = end < 0 ? n : end + 3;
      continue;
    }
    if (html[lt + 1] === "!" || html[lt + 1] === "?") {
      const end = html.indexOf(">", lt);
      i = end < 0 ? n : end + 1;
      continue;
    }
    const close = html[lt + 1] === "/";
    const nameMatch = /^[a-zA-Z][a-zA-Z0-9:-]*/.exec(html.slice(lt + (close ? 2 : 1), lt + 64));
    if (!nameMatch) {
      // A stray "<" in text.
      pushText(lt, lt + 1);
      i = lt + 1;
      continue;
    }
    const end = tagEnd(html, lt);
    if (end < 0) {
      i = n;
      break;
    }
    const name = nameMatch[0].toLowerCase();
    if (close) {
      tokens.push({ type: "close", name, offset: lt });
      i = end + 1;
      continue;
    }
    const inner = html.slice(lt + 1 + nameMatch[0].length, end);
    const selfClosing = /\/\s*$/.test(inner);
    const attrs = parseAttrs(selfClosing ? inner.replace(/\/\s*$/, "") : inner);
    if (RAW.has(name) && !selfClosing) {
      const re = new RegExp(`</${name}\\s*>`, "ig");
      re.lastIndex = end + 1;
      const m = re.exec(html);
      const stop = m ? m.index : n;
      const raw = html.slice(end + 1, stop);
      tokens.push({ type: "raw", name, attrs, text: name === "title" || name === "textarea" ? decodeEntities(raw) : raw, offset: lt });
      i = m ? m.index + m[0].length : n;
      continue;
    }
    tokens.push({ type: "open", name, attrs, selfClosing, offset: lt });
    i = end + 1;
  }
  return tokens;
}

export const collapse = (s: string) => s.replace(/\s+/g, " ").trim();
