// RichDoc — the frozen rich-text format (BLOCK-FORMAT.md §3). Types + pure helpers, no zod,
// no React: the site renderer, the editor converters and server code all import this file.

/** Inline marks. Order of nesting on render is fixed (link → bold → italic → … → sup). */
export type RichMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "code" }
  | { type: "highlight" }
  | { type: "sub" }
  | { type: "sup" }
  | { type: "link"; href: string; newTab?: boolean; title?: string };

export type RichMarkType = RichMark["type"];

/** A run of text with marks. `text` never contains `\n` — use a `{ type: "br" }` run. */
export interface RichTextRun {
  text: string;
  marks?: RichMark[];
}
/** A hard line break inside a paragraph or heading. */
export interface RichBreak {
  type: "br";
}
export type RichInline = RichTextRun | RichBreak;

export interface RichParagraph {
  type: "paragraph";
  content?: RichInline[];
}
export interface RichHeading {
  type: "heading";
  level: 2 | 3 | 4;
  content?: RichInline[];
  /** Optional stable anchor (`id` on the element, TOC target). */
  anchor?: string;
}
export interface RichListItem {
  /** Paragraphs and nested lists. */
  content: RichBlock[];
}
export interface RichList {
  type: "list";
  ordered?: boolean;
  /** First number of an ordered list. */
  start?: number;
  items: RichListItem[];
}
export interface RichBlockquote {
  type: "blockquote";
  content: RichBlock[];
  /** Attribution line ("— Ayşe K., head chef"). */
  cite?: string;
}
export interface RichCode {
  type: "code";
  text: string;
  language?: string;
}
export interface RichRule {
  type: "hr";
}
export type RichBlock = RichParagraph | RichHeading | RichList | RichBlockquote | RichCode | RichRule;
export type RichNodeType = RichBlock["type"];

/** A rich-text field value: `f.rich()` stores `Localized<RichDoc>`. */
export interface RichDoc {
  type: "doc";
  content: RichBlock[];
}

export const RICH_NODE_TYPES = ["paragraph", "heading", "list", "blockquote", "code", "hr"] as const satisfies readonly RichNodeType[];
export const RICH_MARK_TYPES = ["bold", "italic", "underline", "strike", "code", "highlight", "sub", "sup", "link"] as const satisfies readonly RichMarkType[];

export const isBreak = (n: RichInline): n is RichBreak => (n as RichBreak).type === "br";

/** Builds a doc from plain paragraphs (blank line = new paragraph, single newline = `br`). */
export function richFromText(text: string): RichDoc {
  const paras = text.replace(/\r\n?/g, "\n").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return {
    type: "doc",
    content: paras.map((p) => ({
      type: "paragraph",
      content: p.split("\n").flatMap((line, i): RichInline[] => (i === 0 ? [{ text: line }] : [{ type: "br" }, { text: line }])),
    })),
  };
}

/** Plain text of inline runs (`br` → newline). */
export function inlineToText(content: readonly RichInline[] | undefined): string {
  if (!content) return "";
  return content.map((n) => (isBreak(n) ? "\n" : n.text)).join("");
}

function blockToText(b: RichBlock): string {
  switch (b.type) {
    case "paragraph":
    case "heading":
      return inlineToText(b.content);
    case "code":
      return b.text;
    case "hr":
      return "";
    case "blockquote":
      return b.content.map(blockToText).filter(Boolean).join("\n\n");
    case "list":
      return b.items.map((it) => it.content.map(blockToText).filter(Boolean).join("\n")).join("\n");
  }
}

/** Plain text of a doc (paragraphs separated by a blank line). Search indexes, meta descriptions, reading time. */
export function richToText(doc: RichDoc | readonly RichBlock[] | undefined): string {
  if (!doc) return "";
  const blocks = Array.isArray(doc) ? doc : (doc as RichDoc).content;
  return blocks.map(blockToText).filter(Boolean).join("\n\n");
}

/** Word count (Unicode-aware; works for Turkish, German, etc.). */
export function countWords(text: string): number {
  return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
}

/** Visits every inline run in a doc. */
export function forEachRun(doc: RichDoc, visit: (run: RichTextRun) => void): void {
  const walk = (blocks: readonly RichBlock[]) => {
    for (const b of blocks) {
      if (b.type === "paragraph" || b.type === "heading") b.content?.forEach((n) => !isBreak(n) && visit(n));
      else if (b.type === "blockquote") walk(b.content);
      else if (b.type === "list") b.items.forEach((it) => walk(it.content));
    }
  };
  walk(doc.content);
}
