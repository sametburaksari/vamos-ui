// VamosDoc <-> ProseMirror JSON. Pure functions, no Tiptap runtime: usable on the server
// (imports, AI drafts, tests) and by the editor. The storage format is frozen in
// docs/plan/BLOCK-FORMAT.md; this file is the "editor mapping" described there.

import type { JSONContent } from "@tiptap/react";
import { migrateDoc } from "../blocks/schema/migrate";
import { inlineToText, isBreak, countWords as countWordsRegex } from "../blocks/schema/rich-doc";
import type { RichBlock, RichDoc, RichInline, RichMark, RichTextRun } from "../blocks/schema/rich-doc";
import type { BlockRegistry } from "../blocks/schema/define-block";
import type { BlockNode, DocMeta, ImageRef, VamosDoc } from "../blocks/schema/types";

/** ProseMirror node name of component blocks (hero, pricing, FAQ…). */
export const COMPONENT_BLOCK = "vamosBlock";

/** Block types the editor edits as native text (everything else is a component block). */
export const EDITOR_TEXT_TYPES = ["paragraph", "heading", "list", "list-item", "quote", "code", "divider", "image", "table", "table-row", "table-cell"] as const;
export type EditorTextType = (typeof EDITOR_TEXT_TYPES)[number];
export const isEditorTextType = (t: string): t is EditorTextType => (EDITOR_TEXT_TYPES as readonly string[]).includes(t);

/** Props of an `image` node (flat, see BLOCK-FORMAT §2 "Media in content"). */
export interface ImageBlockProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  focal?: ImageRef["focal"];
  assetId?: string;
  decorative?: boolean;
}

/** Props of a `table-cell` node. */
export interface TableCellProps {
  header?: boolean;
  colspan?: number;
  rowspan?: number;
}

// ---------------------------------------------------------------- ids

const ID_ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const ID_RE = /^[A-Za-z0-9_-]{4,64}$/;

/** A new stable block id (`b_` + 8 random characters). */
export function createBlockId(): string {
  const bytes = new Uint8Array(8);
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  let out = "b_";
  for (const b of bytes) out += ID_ALPHABET[b % ID_ALPHABET.length];
  return out;
}

export const isValidBlockId = (id: unknown): id is string => typeof id === "string" && ID_RE.test(id);

// ---------------------------------------------------------------- marks

const MARK_TO_PM: Record<string, string> = { bold: "bold", italic: "italic", underline: "underline", strike: "strike", code: "code", highlight: "highlight", sub: "subscript", sup: "superscript", link: "link" };
const MARK_FROM_PM: Record<string, RichMark["type"]> = { bold: "bold", italic: "italic", underline: "underline", strike: "strike", code: "code", highlight: "highlight", subscript: "sub", superscript: "sup", link: "link" };
/** Canonical nesting order (BLOCK-FORMAT §3). */
const MARK_ORDER: RichMark["type"][] = ["link", "bold", "italic", "underline", "strike", "highlight", "code", "sub", "sup"];

function markToPM(m: RichMark): { type: string; attrs?: Record<string, unknown> } | null {
  const type = MARK_TO_PM[m.type];
  if (!type) return null;
  if (m.type === "link") return { type, attrs: { href: m.href, target: m.newTab ? "_blank" : null, title: m.title ?? null } };
  return { type };
}

function markFromPM(m: { type: string; attrs?: Record<string, unknown> }): RichMark | null {
  const type = MARK_FROM_PM[m.type];
  if (!type) return null;
  if (type === "link") {
    const href = typeof m.attrs?.href === "string" ? m.attrs.href : "";
    if (!href) return null;
    const out: RichMark = { type: "link", href };
    if (m.attrs?.target === "_blank") out.newTab = true;
    if (typeof m.attrs?.title === "string" && m.attrs.title) out.title = m.attrs.title;
    return out;
  }
  return { type } as RichMark;
}

const sortMarks = (marks: RichMark[]) => [...marks].sort((a, b) => MARK_ORDER.indexOf(a.type) - MARK_ORDER.indexOf(b.type));
const marksKey = (marks?: RichMark[]) => (marks?.length ? JSON.stringify(sortMarks(marks)) : "");

/** Inline runs → ProseMirror inline nodes (`br` → hardBreak, stray `\n` tolerated). */
export function inlineToPM(content: readonly RichInline[] | undefined): JSONContent[] {
  const out: JSONContent[] = [];
  for (const run of content ?? []) {
    if (isBreak(run)) {
      out.push({ type: "hardBreak" });
      continue;
    }
    const marks = (run.marks ?? []).map(markToPM).filter((m): m is NonNullable<typeof m> => !!m);
    run.text.split("\n").forEach((part, i) => {
      if (i > 0) out.push({ type: "hardBreak" });
      if (part) out.push(marks.length ? { type: "text", text: part, marks } : { type: "text", text: part });
    });
  }
  return out;
}

/** ProseMirror inline nodes → inline runs (adjacent runs with equal marks merged). */
export function inlineFromPM(nodes: readonly JSONContent[] | undefined): RichInline[] {
  const out: RichInline[] = [];
  for (const n of nodes ?? []) {
    if (n.type === "hardBreak") {
      out.push({ type: "br" });
      continue;
    }
    if (n.type !== "text" || !n.text) continue;
    const marks = sortMarks((n.marks ?? []).map((m) => markFromPM(m as { type: string; attrs?: Record<string, unknown> })).filter((m): m is RichMark => !!m));
    const prev = out[out.length - 1];
    if (prev && !isBreak(prev) && marksKey(prev.marks) === marksKey(marks)) {
      (prev as RichTextRun).text += n.text;
      continue;
    }
    out.push(marks.length ? { text: n.text, marks } : { text: n.text });
  }
  return out;
}

// ---------------------------------------------------------------- VamosDoc → PM

/** BlockNode fields kept on text blocks that ProseMirror has no attribute for. */
interface ExtraFields {
  hidden?: boolean;
  theme?: BlockNode["theme"];
  schedule?: BlockNode["schedule"];
  anchor?: string;
  variant?: string;
}
function extraOf(b: BlockNode, skipAnchor = false): ExtraFields | null {
  const e: ExtraFields = {};
  if (b.hidden) e.hidden = true;
  if (b.theme) e.theme = b.theme;
  if (b.schedule) e.schedule = b.schedule;
  if (b.variant) e.variant = b.variant;
  if (b.anchor && !skipAnchor) e.anchor = b.anchor;
  return Object.keys(e).length ? e : null;
}
function applyExtra(node: BlockNode, extra: unknown): BlockNode {
  if (!extra || typeof extra !== "object") return node;
  const e = extra as ExtraFields;
  return {
    ...node,
    ...(e.variant ? { variant: e.variant } : null),
    ...(e.theme ? { theme: e.theme } : null),
    ...(e.anchor && !node.anchor ? { anchor: e.anchor } : null),
    ...(e.hidden ? { hidden: true } : null),
    ...(e.schedule ? { schedule: e.schedule } : null),
  };
}

const para = (content: readonly RichInline[] | undefined, id?: string): JSONContent => {
  const inner = inlineToPM(content);
  return { type: "paragraph", attrs: { id: id ?? null }, ...(inner.length ? { content: inner } : null) };
};

function listItemToPM(item: BlockNode): JSONContent {
  const kids = item.slots?.items ?? [];
  const content: JSONContent[] = [];
  let rest = kids;
  if (item.content !== undefined || !kids.length || kids[0]!.type !== "paragraph") content.push(para(item.content));
  else {
    content.push(para(kids[0]!.content, kids[0]!.id));
    rest = kids.slice(1);
  }
  for (const k of rest) content.push(...blockToPM(k));
  return { type: "listItem", attrs: { id: item.id }, content };
}

function cellToPM(cell: BlockNode): JSONContent {
  const p = (cell.props ?? {}) as TableCellProps;
  const paragraphs = cell.slots?.items?.length ? cell.slots.items.flatMap(blockToPM) : [para(cell.content)];
  return {
    type: p.header ? "tableHeader" : "tableCell",
    attrs: { id: cell.id, colspan: p.colspan ?? 1, rowspan: p.rowspan ?? 1, colwidth: null },
    content: paragraphs.length ? paragraphs : [para(undefined)],
  };
}

function blockToPM(b: BlockNode): JSONContent[] {
  const p = (b.props ?? {}) as Record<string, unknown>;
  const extra = extraOf(b, b.type === "heading");
  const base = { id: b.id, extra };
  switch (b.type) {
    case "paragraph": {
      const inner = inlineToPM(b.content);
      return [{ type: "paragraph", attrs: base, ...(inner.length ? { content: inner } : null) }];
    }
    case "heading": {
      const inner = inlineToPM(b.content);
      const level = Math.min(6, Math.max(1, Number(p.level) || 2));
      return [{ type: "heading", attrs: { ...base, level, anchor: b.anchor ?? null }, ...(inner.length ? { content: inner } : null) }];
    }
    case "list": {
      const items = (b.slots?.items ?? []).map((it) => (it.type === "list-item" ? it : { id: createBlockId(), type: "list-item", slots: { items: [it] } }));
      const content = items.length ? items.map(listItemToPM) : [{ type: "listItem", attrs: { id: null }, content: [para(undefined)] }];
      return p.ordered
        ? [{ type: "orderedList", attrs: { ...base, start: typeof p.start === "number" ? p.start : 1 }, content }]
        : [{ type: "bulletList", attrs: base, content }];
    }
    case "list-item":
      // A list item outside a list: wrap it.
      return [{ type: "bulletList", attrs: { id: createBlockId(), extra: null }, content: [listItemToPM(b)] }];
    case "quote": {
      const content: JSONContent[] = [];
      if (b.content?.length) content.push(para(b.content));
      for (const k of b.slots?.items ?? []) content.push(...blockToPM(k));
      if (!content.length) content.push(para(undefined));
      return [{ type: "blockquote", attrs: { ...base, cite: typeof p.cite === "string" ? p.cite : null }, content }];
    }
    case "code": {
      const text = inlineToText(b.content);
      return [{ type: "codeBlock", attrs: { ...base, language: typeof p.language === "string" ? p.language : null }, ...(text ? { content: [{ type: "text", text }] } : null) }];
    }
    case "divider":
      return [{ type: "horizontalRule", attrs: base }];
    case "image": {
      const ip = p as Partial<ImageBlockProps>;
      return [
        {
          type: "image",
          attrs: {
            ...base,
            src: ip.src ?? null,
            alt: ip.alt ?? null,
            width: ip.width ?? null,
            height: ip.height ?? null,
            caption: ip.caption ?? null,
            focal: ip.focal ?? null,
            assetId: ip.assetId ?? null,
            decorative: ip.decorative ?? null,
          },
        },
      ];
    }
    case "table": {
      const rows = (b.slots?.items ?? []).map((row) => ({ type: "tableRow", attrs: { id: row.id }, content: (row.slots?.items ?? []).map(cellToPM) })).filter((r) => r.content.length);
      if (!rows.length) return [];
      return [{ type: "table", attrs: base, content: rows }];
    }
    default:
      return [componentToPM(b)];
  }
}

function componentToPM(b: BlockNode): JSONContent {
  return {
    type: COMPONENT_BLOCK,
    attrs: {
      id: b.id,
      blockType: b.type,
      v: b.v ?? null,
      variant: b.variant ?? null,
      props: b.props ?? null,
      theme: b.theme ?? null,
      anchor: b.anchor ?? null,
      hidden: b.hidden ?? null,
      schedule: b.schedule ?? null,
      slots: b.slots ?? null,
      content: b.content ?? null,
    },
  };
}

/**
 * A VamosDoc as a ProseMirror document. With a `registry`, the doc and every component block are
 * first migrated to their current version, so the editor always works on current props.
 * Unknown block types become component blocks too: their data is carried untouched.
 */
export function toProseMirror(doc: VamosDoc | unknown, registry?: BlockRegistry): JSONContent {
  const d = doc ? migrateDoc(doc, registry) : ({ version: 1, blocks: [] } as VamosDoc);
  const content = d.blocks.flatMap(blockToPM);
  return { type: "doc", content: content.length ? content : [{ type: "paragraph", attrs: { id: null } }] };
}

// ---------------------------------------------------------------- PM → VamosDoc

interface FromCtx {
  seen: Set<string>;
}
function takeId(ctx: FromCtx, raw: unknown): string {
  let id = isValidBlockId(raw) ? raw : createBlockId();
  while (ctx.seen.has(id)) id = createBlockId();
  ctx.seen.add(id);
  return id;
}
const attrs = (n: JSONContent) => (n.attrs ?? {}) as Record<string, unknown>;
const compact = <T extends object>(o: T): T => {
  const r: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== null) r[k] = v;
  return r as T;
};

function listItemFromPM(n: JSONContent, ctx: FromCtx): BlockNode {
  const id = takeId(ctx, attrs(n).id);
  const kids = n.content ?? [];
  const first = kids[0];
  const node: BlockNode = { id, type: "list-item" };
  let rest = kids;
  if (first?.type === "paragraph") {
    node.content = inlineFromPM(first.content);
    rest = kids.slice(1);
  } else node.content = [];
  const nested = rest.flatMap((k) => blockFromPM(k, ctx));
  if (nested.length) node.slots = { items: nested };
  return node;
}

function cellFromPM(n: JSONContent, ctx: FromCtx): BlockNode {
  const a = attrs(n);
  const props = compact<TableCellProps>({
    header: n.type === "tableHeader" ? true : undefined,
    colspan: typeof a.colspan === "number" && a.colspan > 1 ? a.colspan : undefined,
    rowspan: typeof a.rowspan === "number" && a.rowspan > 1 ? a.rowspan : undefined,
  });
  const paragraphs = (n.content ?? []).filter((k) => k.type === "paragraph");
  const node: BlockNode = { id: takeId(ctx, a.id), type: "table-cell" };
  if (Object.keys(props).length) node.props = props as Record<string, unknown>;
  // Several paragraphs in one cell are joined with line breaks (cells hold inline runs).
  node.content = paragraphs.flatMap((pp, i): RichInline[] => (i === 0 ? inlineFromPM(pp.content) : [{ type: "br" }, ...inlineFromPM(pp.content)]));
  return node;
}

function blockFromPM(n: JSONContent, ctx: FromCtx): BlockNode[] {
  const a = attrs(n);
  const finish = (node: BlockNode) => [applyExtra(node, a.extra)];
  switch (n.type) {
    case "paragraph":
      return finish({ id: takeId(ctx, a.id), type: "paragraph", content: inlineFromPM(n.content) });
    case "heading": {
      const node: BlockNode = { id: takeId(ctx, a.id), type: "heading", props: { level: Number(a.level) || 2 }, content: inlineFromPM(n.content) };
      if (typeof a.anchor === "string" && /^[a-z0-9-]+$/.test(a.anchor)) node.anchor = a.anchor;
      return finish(node);
    }
    case "bulletList":
    case "orderedList": {
      const ordered = n.type === "orderedList";
      const props: Record<string, unknown> = ordered ? { ordered: true } : {};
      if (ordered && typeof a.start === "number" && a.start !== 1) props.start = a.start;
      const node: BlockNode = { id: takeId(ctx, a.id), type: "list", slots: { items: (n.content ?? []).filter((k) => k.type === "listItem").map((k) => listItemFromPM(k, ctx)) } };
      if (Object.keys(props).length) node.props = props;
      return finish(node);
    }
    case "blockquote": {
      const kids = n.content ?? [];
      const node: BlockNode = { id: takeId(ctx, a.id), type: "quote" };
      if (kids.length === 1 && kids[0]!.type === "paragraph") node.content = inlineFromPM(kids[0]!.content);
      else node.slots = { items: kids.flatMap((k) => blockFromPM(k, ctx)) };
      if (typeof a.cite === "string" && a.cite) node.props = { cite: a.cite };
      return finish(node);
    }
    case "codeBlock": {
      const text = (n.content ?? []).map((t) => t.text ?? "").join("");
      const lines = text.split("\n");
      const content: RichInline[] = lines.flatMap((l, i): RichInline[] => {
        const parts: RichInline[] = i > 0 ? [{ type: "br" }] : [];
        if (l) parts.push({ text: l });
        return parts;
      });
      const node: BlockNode = { id: takeId(ctx, a.id), type: "code", content: text ? content : [] };
      if (typeof a.language === "string" && a.language) node.props = { language: a.language };
      return finish(node);
    }
    case "horizontalRule":
      return finish({ id: takeId(ctx, a.id), type: "divider" });
    case "image": {
      if (typeof a.src !== "string" || !a.src || a.uploading) return [];
      const props = compact<ImageBlockProps>({
        src: a.src,
        alt: typeof a.alt === "string" ? a.alt : undefined,
        width: typeof a.width === "number" ? a.width : undefined,
        height: typeof a.height === "number" ? a.height : undefined,
        caption: typeof a.caption === "string" && a.caption ? a.caption : undefined,
        focal: (a.focal as ImageRef["focal"]) ?? undefined,
        assetId: typeof a.assetId === "string" ? a.assetId : undefined,
        decorative: a.decorative === true ? true : undefined,
      });
      return finish({ id: takeId(ctx, a.id), type: "image", props: props as unknown as Record<string, unknown> });
    }
    case "table": {
      const rows = (n.content ?? []).filter((r) => r.type === "tableRow").map((r): BlockNode => ({ id: takeId(ctx, attrs(r).id), type: "table-row", slots: { items: (r.content ?? []).map((c) => cellFromPM(c, ctx)) } }));
      return finish({ id: takeId(ctx, a.id), type: "table", slots: { items: rows } });
    }
    case COMPONENT_BLOCK: {
      const type = typeof a.blockType === "string" ? a.blockType : "";
      if (!type) return [];
      const node: BlockNode = compact<BlockNode>({
        id: takeId(ctx, a.id),
        type,
        v: typeof a.v === "number" ? a.v : undefined,
        variant: typeof a.variant === "string" ? a.variant : undefined,
        props: (a.props as Record<string, unknown>) ?? undefined,
        content: (a.content as RichInline[]) ?? undefined,
        slots: (a.slots as Record<string, BlockNode[]>) ?? undefined,
        theme: (a.theme as BlockNode["theme"]) ?? undefined,
        anchor: typeof a.anchor === "string" ? a.anchor : undefined,
        hidden: a.hidden === true ? true : undefined,
        schedule: (a.schedule as BlockNode["schedule"]) ?? undefined,
      });
      return [node];
    }
    default:
      return [];
  }
}

export interface FromProseMirrorOptions {
  /** Doc-level fields (lang, seo, layout, locales…) to keep. `blocks` and `meta` are replaced. */
  base?: Partial<VamosDoc>;
  /** Content language for word counts. Default `base.lang ?? "en"`. */
  lang?: string;
  /** Write `meta` (word count, reading time, toc). Default true. */
  meta?: boolean;
}

/** A ProseMirror document (JSON) as a VamosDoc. Missing or duplicate ids are replaced. */
export function fromProseMirror(json: JSONContent, opts: FromProseMirrorOptions = {}): VamosDoc {
  const ctx: FromCtx = { seen: new Set() };
  let blocks = (json.content ?? []).flatMap((n) => blockFromPM(n, ctx));
  // Trailing empty paragraphs are an editing artifact (the caret line after a page block).
  const isBlank = (b: BlockNode) => b.type === "paragraph" && !b.content?.length && !b.hidden && !b.theme && !b.anchor;
  while (blocks.length && isBlank(blocks[blocks.length - 1]!)) blocks = blocks.slice(0, -1);
  const { blocks: _b, meta: _m, ...rest } = (opts.base ?? {}) as VamosDoc;
  const doc: VamosDoc = { ...rest, version: 1, blocks };
  if (opts.meta !== false) doc.meta = computeDocMeta(doc, opts.lang ?? rest.lang ?? "en");
  return doc;
}

// ---------------------------------------------------------------- meta

const segmenters = new Map<string, Intl.Segmenter | null>();
/** Word count with `Intl.Segmenter(lang, { granularity: "word" })` (regex fallback). */
export function countWords(text: string, lang = "en"): number {
  if (!text.trim()) return 0;
  let seg = segmenters.get(lang);
  if (seg === undefined) {
    try {
      seg = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(lang, { granularity: "word" }) : null;
    } catch {
      seg = null;
    }
    segmenters.set(lang, seg);
  }
  if (!seg) return countWordsRegex(text);
  let n = 0;
  for (const s of seg.segment(text)) if (s.isWordLike) n++;
  return n;
}

function nodeText(b: BlockNode): string {
  const own = b.content ? inlineToText(b.content) : "";
  const kids = Object.values(b.slots ?? {})
    .flat()
    .map(nodeText)
    .filter(Boolean);
  const caption = b.type === "image" && typeof (b.props as unknown as ImageBlockProps | undefined)?.caption === "string" ? (b.props as unknown as ImageBlockProps).caption! : "";
  return [own, caption, ...kids].filter(Boolean).join("\n");
}

/** Plain text of the editable text in a doc (component block props are not included). */
export function docToPlainText(doc: VamosDoc): string {
  return doc.blocks.map(nodeText).filter(Boolean).join("\n\n");
}

/** Derived doc meta: word count, reading time (230 wpm, min 1) and the heading outline. */
export function computeDocMeta(doc: VamosDoc, lang = "en"): DocMeta {
  const wordCount = countWords(docToPlainText(doc), lang);
  const toc = doc.blocks
    .filter((b) => b.type === "heading")
    .map((b) => ({ id: b.id, level: Number((b.props as { level?: number } | undefined)?.level) || 2, text: inlineToText(b.content).replace(/\n/g, " ").trim() }))
    .filter((h) => h.text);
  return { wordCount, readingTime: wordCount ? Math.max(1, Math.ceil(wordCount / 230)) : 0, toc };
}

/** JSON with sorted object keys: equal content compares equal regardless of key order. */
export function stableStringify(v: unknown): string {
  return JSON.stringify(v, (_k, val) =>
    val && typeof val === "object" && !Array.isArray(val) ? Object.fromEntries(Object.keys(val as object).sort().map((k) => [k, (val as Record<string, unknown>)[k]])) : val,
  );
}

/** Ids of top-level blocks that were added, removed or changed between two docs. */
export function changedBlockIds(prev: VamosDoc | undefined, next: VamosDoc): string[] {
  const before = new Map((prev?.blocks ?? []).map((b) => [b.id, stableStringify(b)]));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const b of next.blocks) {
    seen.add(b.id);
    if (before.get(b.id) !== stableStringify(b)) out.push(b.id);
  }
  for (const id of before.keys()) if (!seen.has(id)) out.push(id);
  return out;
}

// ---------------------------------------------------------------- RichDoc (f.rich fields)

function richBlockToPM(b: RichBlock): JSONContent[] {
  switch (b.type) {
    case "paragraph":
      return [para(b.content)];
    case "heading": {
      const inner = inlineToPM(b.content);
      return [{ type: "heading", attrs: { level: b.level, anchor: b.anchor ?? null }, ...(inner.length ? { content: inner } : null) }];
    }
    case "list": {
      const items = b.items.map((it) => {
        const content = it.content.flatMap(richBlockToPM);
        if (!content.length || content[0]!.type !== "paragraph") content.unshift(para(undefined));
        return { type: "listItem", content };
      });
      if (!items.length) return [];
      return [b.ordered ? { type: "orderedList", attrs: { start: b.start ?? 1 }, content: items } : { type: "bulletList", content: items }];
    }
    case "blockquote": {
      const content = b.content.flatMap(richBlockToPM);
      return [{ type: "blockquote", attrs: { cite: b.cite ?? null }, content: content.length ? content : [para(undefined)] }];
    }
    case "code":
      return [{ type: "codeBlock", attrs: { language: b.language ?? null }, ...(b.text ? { content: [{ type: "text", text: b.text }] } : null) }];
    case "hr":
      return [{ type: "horizontalRule" }];
  }
}

/** A RichDoc (the value of an `f.rich()` field) as a ProseMirror document. */
export function richDocToProseMirror(doc: RichDoc | undefined | null): JSONContent {
  const content = (doc?.content ?? []).flatMap(richBlockToPM);
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

function richBlockFromPM(n: JSONContent, minHeading: 2 | 3 | 4 = 2): RichBlock[] {
  const a = attrs(n);
  switch (n.type) {
    case "paragraph":
      return [{ type: "paragraph", content: inlineFromPM(n.content) }];
    case "heading": {
      const level = Math.min(4, Math.max(minHeading, Number(a.level) || 2)) as 2 | 3 | 4;
      const h: RichBlock = { type: "heading", level, content: inlineFromPM(n.content) };
      if (typeof a.anchor === "string" && a.anchor) h.anchor = a.anchor;
      return [h];
    }
    case "bulletList":
    case "orderedList": {
      const items = (n.content ?? []).map((li) => ({ content: (li.content ?? []).flatMap((k) => richBlockFromPM(k, minHeading)) }));
      const l: RichBlock = { type: "list", items };
      if (n.type === "orderedList") {
        l.ordered = true;
        if (typeof a.start === "number" && a.start !== 1) l.start = a.start;
      }
      return [l];
    }
    case "blockquote": {
      const q: RichBlock = { type: "blockquote", content: (n.content ?? []).flatMap((k) => richBlockFromPM(k, minHeading)) };
      if (typeof a.cite === "string" && a.cite) q.cite = a.cite;
      return [q];
    }
    case "codeBlock": {
      const c: RichBlock = { type: "code", text: (n.content ?? []).map((t) => t.text ?? "").join("") };
      if (typeof a.language === "string" && a.language) c.language = a.language;
      return [c];
    }
    case "horizontalRule":
      return [{ type: "hr" }];
    default:
      return [];
  }
}

/** A ProseMirror document as a RichDoc. Headings are clamped to h2–h4 (rich fields never hold h1). */
export function proseMirrorToRichDoc(json: JSONContent): RichDoc {
  let content = (json.content ?? []).flatMap((n) => richBlockFromPM(n));
  if (content.length === 1 && content[0]!.type === "paragraph" && !content[0]!.content?.length) content = [];
  return { type: "doc", content };
}

/** True when a RichDoc has no text at all. */
export function isRichDocEmpty(doc: RichDoc | undefined | null): boolean {
  if (!doc) return true;
  const visit = (blocks: RichBlock[]): boolean =>
    blocks.every((b) => {
      if (b.type === "paragraph" || b.type === "heading") return !inlineToText(b.content).trim();
      if (b.type === "code") return !b.text.trim();
      if (b.type === "hr") return false;
      if (b.type === "blockquote") return visit(b.content);
      return b.items.every((it) => visit(it.content));
    });
  return visit(doc.content);
}
