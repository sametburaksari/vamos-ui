// Paste conversion: Markdown → blocks, Word / Google Docs HTML → clean HTML for the schema parser.
// Small on purpose: covers what people paste (headings, lists, quotes, fences, rules, tables,
// emphasis, code, links), not the whole CommonMark spec.

import type { BlockNode } from "../blocks/schema/types";
import type { RichInline, RichMark } from "../blocks/schema/rich-doc";
import { sanitizeHref } from "../blocks/schema/safety";
import { createBlockId } from "./convert";

/** Heuristic: does plain text look like Markdown worth converting? */
export function looksLikeMarkdown(text: string): boolean {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2 && !/^(#{1,6}\s|>\s|[-*+]\s|\d+[.)]\s|```)/.test(text)) return /\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)/.test(text);
  let hits = 0;
  for (const l of lines) if (/^(#{1,6}\s|>\s?|\s*[-*+]\s|\s*\d+[.)]\s|```|---\s*$|\|.+\|)/.test(l)) hits++;
  return hits >= 1;
}

const INLINE_RE = /(`[^`]+`)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)|(~~[^~]+~~)|(==[^=]+==)|(\[[^\]]+\]\([^)\s]+(?:\s+"[^"]*")?\))/;

/** Markdown inline syntax → runs with marks. */
export function parseInlineMarkdown(src: string, marks: RichMark[] = []): RichInline[] {
  const out: RichInline[] = [];
  let rest = src;
  const push = (text: string, m: RichMark[]) => {
    if (!text) return;
    const prev = out[out.length - 1];
    if (prev && !("type" in prev) && JSON.stringify(prev.marks ?? []) === JSON.stringify(m)) prev.text += text;
    else out.push(m.length ? { text, marks: m } : { text });
  };
  while (rest) {
    const m = INLINE_RE.exec(rest);
    if (!m) {
      push(rest, marks);
      break;
    }
    push(rest.slice(0, m.index), marks);
    const tok = m[0];
    if (m[1]) push(tok.slice(1, -1), [...marks, { type: "code" }]);
    else if (m[2]) out.push(...parseInlineMarkdown(tok.slice(2, -2), [...marks, { type: "bold" }]));
    else if (m[3]) out.push(...parseInlineMarkdown(tok.slice(1, -1), [...marks, { type: "italic" }]));
    else if (m[4]) out.push(...parseInlineMarkdown(tok.slice(2, -2), [...marks, { type: "strike" }]));
    else if (m[5]) out.push(...parseInlineMarkdown(tok.slice(2, -2), [...marks, { type: "highlight" }]));
    else if (m[6]) {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(tok)!;
      const href = sanitizeHref(lm[2]!);
      if (href) out.push(...parseInlineMarkdown(lm[1]!, [{ type: "link", href, ...(lm[3] ? { title: lm[3] } : null) }, ...marks]));
      else push(lm[1]!, marks);
    }
    rest = rest.slice(m.index + tok.length);
  }
  return out;
}

const id = () => createBlockId();

interface ListFrame {
  indent: number;
  node: BlockNode;
}

/** Markdown → VamosDoc blocks (paragraph, heading, list, quote, code, divider, table). */
export function markdownToBlocks(markdown: string): BlockNode[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: BlockNode[] = [];
  let paragraph: string[] = [];
  let lists: ListFrame[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const content: RichInline[] = [];
    paragraph.forEach((l, i) => {
      if (i > 0) content.push({ type: "br" });
      content.push(...parseInlineMarkdown(l.trim()));
    });
    blocks.push({ id: id(), type: "paragraph", content });
    paragraph = [];
  };
  const closeLists = () => {
    lists = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // Fenced code
    const fence = /^\s*```\s*([\w+-]*)\s*$/.exec(line);
    if (fence) {
      flushParagraph();
      closeLists();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i]!)) body.push(lines[i++]!);
      const content: RichInline[] = body.flatMap((l, j): RichInline[] => [...(j > 0 ? [{ type: "br" } as const] : []), ...(l ? [{ text: l }] : [])]);
      blocks.push({ id: id(), type: "code", content, ...(fence[1] ? { props: { language: fence[1] } } : null) });
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      closeLists();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      flushParagraph();
      closeLists();
      blocks.push({ id: id(), type: "heading", props: { level: heading[1]!.length }, content: parseInlineMarkdown(heading[2]!) });
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushParagraph();
      closeLists();
      blocks.push({ id: id(), type: "divider" });
      continue;
    }
    if (/^\s*>/.test(line)) {
      flushParagraph();
      closeLists();
      const body: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i]!)) body.push(lines[i++]!.replace(/^\s*>\s?/, ""));
      i--;
      const inner = markdownToBlocks(body.join("\n"));
      const only = inner.length === 1 && inner[0]!.type === "paragraph" ? inner[0]! : null;
      blocks.push(only ? { id: id(), type: "quote", content: only.content } : { id: id(), type: "quote", slots: { items: inner } });
      continue;
    }
    // GFM table: header row, separator row, body rows.
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1]!)) {
      flushParagraph();
      closeLists();
      const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const rows: BlockNode[] = [];
      rows.push({ id: id(), type: "table-row", slots: { items: cells(line).map((c) => ({ id: id(), type: "table-cell", props: { header: true }, content: parseInlineMarkdown(c) })) } });
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i]!)) {
        rows.push({ id: id(), type: "table-row", slots: { items: cells(lines[i]!).map((c) => ({ id: id(), type: "table-cell", content: parseInlineMarkdown(c) })) } });
        i++;
      }
      i--;
      blocks.push({ id: id(), type: "table", slots: { items: rows } });
      continue;
    }
    const item = /^(\s*)([-*+]|(\d+)[.)])\s+(.*)$/.exec(line);
    if (item) {
      flushParagraph();
      const indent = item[1]!.replace(/\t/g, "    ").length;
      const ordered = !!item[3];
      const li: BlockNode = { id: id(), type: "list-item", content: parseInlineMarkdown(item[4]!) };
      while (lists.length && lists[lists.length - 1]!.indent > indent) lists.pop();
      const top = lists[lists.length - 1];
      if (top && top.indent === indent && !!(top.node.props as { ordered?: boolean } | undefined)?.ordered === ordered) {
        top.node.slots!.items!.push(li);
      } else if (top && indent > top.indent) {
        const parentItem = top.node.slots!.items![top.node.slots!.items!.length - 1]!;
        const list: BlockNode = { id: id(), type: "list", ...(ordered ? { props: { ordered: true } } : null), slots: { items: [li] } };
        parentItem.slots = { items: [...(parentItem.slots?.items ?? []), list] };
        lists.push({ indent, node: list });
      } else {
        const start = ordered ? Number(item[3]) : 1;
        const list: BlockNode = { id: id(), type: "list", ...(ordered ? { props: { ordered: true, ...(start !== 1 ? { start } : null) } } : null), slots: { items: [li] } };
        blocks.push(list);
        lists = [{ indent, node: list }];
      }
      continue;
    }
    if (lists.length) closeLists();
    paragraph.push(line);
  }
  flushParagraph();
  return blocks;
}

/**
 * Cleans Word / Google Docs / LibreOffice clipboard HTML before ProseMirror parses it: drops
 * Office namespaces, conditional comments, inline styles, classes, fonts and empty spans, and
 * maps Google Docs' styled spans to semantic bold/italic.
 */
export function cleanPastedHtml(html: string): string {
  let out = html
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?(o|w|v|m|st1):[^>]*>/gi, "")
    .replace(/<(meta|link|style|script|xml|title)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(meta|link)[^>]*\/?>(?!<\/)/gi, "");
  // Google Docs wraps everything in <b style="font-weight:normal" id="docs-internal-guid-…">.
  out = out.replace(/<b[^>]*id="docs-internal-guid[^"]*"[^>]*>([\s\S]*?)<\/b>/gi, "$1");
  // Styled spans → semantic marks.
  out = out.replace(/<span([^>]*)style="([^"]*)"([^>]*)>([\s\S]*?)<\/span>/gi, (_m, _a, style: string, _b, inner: string) => {
    let s = inner;
    if (/font-style:\s*italic/i.test(style)) s = `<em>${s}</em>`;
    if (/font-weight:\s*(bold|[6-9]00)/i.test(style)) s = `<strong>${s}</strong>`;
    if (/text-decoration[^;]*underline/i.test(style)) s = `<u>${s}</u>`;
    if (/text-decoration[^;]*line-through/i.test(style)) s = `<s>${s}</s>`;
    return s;
  });
  out = out
    .replace(/\s(style|class|lang|align|face|size|color|width|height|valign|dir|id)="[^"]*"/gi, "")
    .replace(/<\/?(font|span)[^>]*>/gi, "")
    .replace(/<p>\s*(&nbsp;| )?\s*<\/p>/gi, "");
  return out;
}
