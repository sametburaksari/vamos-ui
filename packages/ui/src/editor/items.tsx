"use client";

// The insertable things (text blocks, registry blocks, patterns) shared by the "/" menu and the
// inserter, plus "turn into" targets for the bubble menu and the block menu.

import * as React from "react";
import type { Editor, JSONContent } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import {
  AlignLeft,
  Blocks,
  Code2,
  Columns2,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  HelpCircle,
  Image as ImageIcon,
  LayoutTemplate,
  List,
  ListOrdered,
  Mail,
  MapPin,
  Megaphone,
  MessageSquareQuote,
  Minus,
  MousePointerClick,
  Quote,
  Sparkles,
  Star,
  Table2,
  Tag,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { AnyBlockDefinition, BlockRegistry } from "../blocks/schema/define-block";
import type { LabelFn } from "../lib/labels";
import type { BlockEditorLabels } from "./labels";
import type { BlockPattern } from "./context";
import { COMPONENT_BLOCK, createBlockId, toProseMirror } from "./convert";
import { insertAfterBlock, withoutIds } from "./commands";

export type InsertGroup = "text" | "media" | "layout" | "blocks" | "patterns";

export interface InsertItem {
  id: string;
  title: string;
  hint?: string;
  group: InsertGroup;
  /** Extra search terms. */
  keywords: string[];
  icon: LucideIcon;
  /** Block type it creates ("heading", "hero"…); used by `allowedBlocks`. */
  blockType: string;
  /** Markdown shortcut shown as a hint ("#", "-", ">"). */
  shortcut?: string;
  def?: AnyBlockDefinition;
  pattern?: BlockPattern;
  /** Content for the node, built lazily. */
  build: (lang: string) => JSONContent | JSONContent[];
}

const ICONS: Record<string, LucideIcon> = {
  "layout-template": LayoutTemplate,
  "help-circle": HelpCircle,
  "circle-help": HelpCircle,
  "message-square-quote": MessageSquareQuote,
  megaphone: Megaphone,
  "mouse-pointer-click": MousePointerClick,
  tag: Tag,
  star: Star,
  users: Users,
  image: ImageIcon,
  video: Video,
  "map-pin": MapPin,
  mail: Mail,
  "columns-2": Columns2,
  "file-text": FileText,
  sparkles: Sparkles,
  table: Table2,
  quote: Quote,
};

export const iconForBlock = (name?: string): LucideIcon => (name && ICONS[name]) || Blocks;

const mediaCategory = new Set(["media", "embed"]);
const layoutCategory = new Set(["layout"]);

/** The text block items ("Text", "Heading 2", "Bulleted list"…). */
export function textItems(t: LabelFn<BlockEditorLabels>, opts: { richText?: boolean } = {}): InsertItem[] {
  const p = (text?: string): JSONContent => ({ type: "paragraph", ...(text ? { content: [{ type: "text", text }] } : null) });
  const items: InsertItem[] = [
    { id: "paragraph", title: t("paragraph"), hint: t("paragraphHint"), group: "text", keywords: ["text", "paragraph", "p", "body"], icon: AlignLeft, blockType: "paragraph", build: () => p() },
    { id: "heading-2", title: t("heading2"), hint: t("headingHint"), group: "text", keywords: ["h2", "heading", "title", "section"], icon: Heading2, blockType: "heading", shortcut: "##", build: () => ({ type: "heading", attrs: { level: 2 } }) },
    { id: "heading-3", title: t("heading3"), hint: t("headingHint"), group: "text", keywords: ["h3", "heading", "subtitle"], icon: Heading3, blockType: "heading", shortcut: "###", build: () => ({ type: "heading", attrs: { level: 3 } }) },
    { id: "heading-4", title: t("heading4"), hint: t("headingHint"), group: "text", keywords: ["h4", "heading"], icon: Heading4, blockType: "heading", shortcut: "####", build: () => ({ type: "heading", attrs: { level: 4 } }) },
    { id: "bullet-list", title: t("bulletList"), hint: t("bulletListHint"), group: "text", keywords: ["ul", "bullet", "list", "unordered"], icon: List, blockType: "list", shortcut: "-", build: () => ({ type: "bulletList", content: [{ type: "listItem", content: [p()] }] }) },
    { id: "ordered-list", title: t("orderedList"), hint: t("orderedListHint"), group: "text", keywords: ["ol", "numbered", "ordered", "steps"], icon: ListOrdered, blockType: "list", shortcut: "1.", build: () => ({ type: "orderedList", content: [{ type: "listItem", content: [p()] }] }) },
    { id: "quote", title: t("quote"), hint: t("quoteHint"), group: "text", keywords: ["blockquote", "quote", "citation", "testimonial"], icon: Quote, blockType: "quote", shortcut: ">", build: () => ({ type: "blockquote", content: [p()] }) },
    { id: "code", title: t("code"), hint: t("codeHint"), group: "text", keywords: ["code", "snippet", "pre"], icon: Code2, blockType: "code", shortcut: "```", build: () => ({ type: "codeBlock" }) },
    { id: "divider", title: t("divider"), hint: t("dividerHint"), group: "layout", keywords: ["hr", "divider", "rule", "separator", "line"], icon: Minus, blockType: "divider", shortcut: "---", build: () => [{ type: "horizontalRule" }, p()] },
  ];
  if (!opts.richText) {
    items.splice(1, 0, { id: "heading-1", title: t("heading1"), hint: t("headingHint"), group: "text", keywords: ["h1", "heading", "title"], icon: Heading1, blockType: "heading", shortcut: "#", build: () => ({ type: "heading", attrs: { level: 1 } }) });
    items.push(
      {
        id: "table",
        title: t("table"),
        hint: t("tableHint"),
        group: "layout",
        keywords: ["table", "grid", "rows", "columns", "spreadsheet"],
        icon: Table2,
        blockType: "table",
        build: () => {
          const cell = (type: string): JSONContent => ({ type, content: [p()] });
          return {
            type: "table",
            content: [
              { type: "tableRow", content: [cell("tableHeader"), cell("tableHeader"), cell("tableHeader")] },
              { type: "tableRow", content: [cell("tableCell"), cell("tableCell"), cell("tableCell")] },
              { type: "tableRow", content: [cell("tableCell"), cell("tableCell"), cell("tableCell")] },
            ],
          };
        },
      },
      { id: "image", title: t("image"), hint: t("imageHint"), group: "media", keywords: ["image", "photo", "picture", "img", "figure"], icon: ImageIcon, blockType: "image", build: () => ({ type: "image", attrs: { src: null } }) },
    );
  }
  return items;
}

/** One item per registered component block. */
export function registryItems(registry: BlockRegistry): InsertItem[] {
  return registry.list({ region: "body" }).map((def) => ({
    id: `block:${def.type}`,
    title: def.title,
    hint: def.description,
    group: mediaCategory.has(def.category) ? "media" : layoutCategory.has(def.category) ? "layout" : "blocks",
    keywords: [def.type, def.category, ...(def.keywords ?? [])],
    icon: iconForBlock(def.icon),
    blockType: def.type,
    def,
    build: (lang) => {
      const variant = def.defaultVariant ?? def.variants?.[0];
      return { type: COMPONENT_BLOCK, attrs: { id: createBlockId(), blockType: def.type, v: def.version, variant: variant ?? null, props: structuredCloneSafe(def.sample(variant, lang)) } };
    },
  }));
}

export function patternItems(patterns: readonly BlockPattern[], registry: BlockRegistry): InsertItem[] {
  return patterns.map((pt) => ({
    id: `pattern:${pt.id}`,
    title: pt.title,
    hint: pt.description ?? pt.category,
    group: "patterns",
    keywords: [pt.category, pt.id],
    icon: LayoutTemplate,
    blockType: "pattern",
    pattern: pt,
    build: () => (toProseMirror(pt.doc, registry).content ?? []).map(withoutIds),
  }));
}

function structuredCloneSafe<T>(v: T): T {
  try {
    return v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T);
  } catch {
    return v;
  }
}

/** Filters items by `allowedBlocks` (block types; patterns pass when every block inside is allowed). */
export function filterAllowed(items: InsertItem[], allowed: string[] | null): InsertItem[] {
  if (!allowed) return items;
  const set = new Set(allowed);
  return items.filter((it) => (it.pattern ? it.pattern.doc.blocks.every((b) => set.has(b.type)) : set.has(it.blockType)));
}

/** Inserts an item: replaces `range` (the "/query" text) or goes after the current block. Selects component blocks. */
export function runInsert(editor: Editor, item: InsertItem, opts: { lang: string; range?: { from: number; to: number }; at?: number }): number {
  const content = item.build(opts.lang);
  let pos: number;
  if (opts.range) {
    editor.chain().focus().deleteRange(opts.range).run();
    const $from = editor.state.selection.$from;
    const parent = $from.depth >= 1 ? $from.node(1) : null;
    const isEmptyPara = parent?.type.name === "paragraph" && parent.content.size === 0;
    pos = $from.depth >= 1 ? $from.before(1) : $from.pos;
    if (isEmptyPara) editor.chain().insertContentAt({ from: pos, to: pos + parent!.nodeSize }, content).run();
    else {
      pos = pos + (parent?.nodeSize ?? 0);
      editor.chain().insertContentAt(pos, content).run();
    }
  } else {
    pos = insertAfterBlock(editor, content, opts.at);
  }
  const inserted = editor.state.doc.nodeAt(pos);
  if (inserted && (inserted.type.name === COMPONENT_BLOCK || (inserted.type.name === "image" && !inserted.attrs.src))) {
    editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)).scrollIntoView());
  } else if (inserted) {
    editor.chain().focus().setTextSelection(Math.min(pos + 1, editor.state.doc.content.size)).run();
  }
  editor.view.focus();
  return pos;
}

/** "Turn into" targets for a text block. */
export function turnIntoItems(t: LabelFn<BlockEditorLabels>): { id: string; label: string; icon: LucideIcon; run: (e: Editor) => void; active: (e: Editor) => boolean }[] {
  return [
    { id: "paragraph", label: t("paragraph"), icon: AlignLeft, run: (e) => e.chain().focus().setParagraph().run(), active: (e) => e.isActive("paragraph") && !e.isActive("bulletList") && !e.isActive("orderedList") && !e.isActive("blockquote") },
    { id: "heading-2", label: t("heading2"), icon: Heading2, run: (e) => e.chain().focus().setHeading({ level: 2 }).run(), active: (e) => e.isActive("heading", { level: 2 }) },
    { id: "heading-3", label: t("heading3"), icon: Heading3, run: (e) => e.chain().focus().setHeading({ level: 3 }).run(), active: (e) => e.isActive("heading", { level: 3 }) },
    { id: "heading-4", label: t("heading4"), icon: Heading4, run: (e) => e.chain().focus().setHeading({ level: 4 }).run(), active: (e) => e.isActive("heading", { level: 4 }) },
    { id: "bullet-list", label: t("bulletList"), icon: List, run: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive("bulletList") },
    { id: "ordered-list", label: t("orderedList"), icon: ListOrdered, run: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive("orderedList") },
    { id: "quote", label: t("quote"), icon: Quote, run: (e) => e.chain().focus().toggleBlockquote().run(), active: (e) => e.isActive("blockquote") },
    { id: "code", label: t("code"), icon: Code2, run: (e) => e.chain().focus().toggleCodeBlock().run(), active: (e) => e.isActive("codeBlock") },
  ];
}

/** Human title of a block node for announcements and menus. */
export function blockTitle(node: { type: { name: string }; attrs: Record<string, unknown> }, registry: BlockRegistry, t: LabelFn<BlockEditorLabels>): string {
  switch (node.type.name) {
    case "paragraph":
      return t("paragraph");
    case "heading":
      return t(`heading${Math.min(4, Math.max(1, Number(node.attrs.level) || 2))}` as "heading2");
    case "bulletList":
      return t("bulletList");
    case "orderedList":
      return t("orderedList");
    case "blockquote":
      return t("quote");
    case "codeBlock":
      return t("code");
    case "horizontalRule":
      return t("divider");
    case "table":
      return t("table");
    case "image":
      return t("image");
    case COMPONENT_BLOCK: {
      const type = String(node.attrs.blockType ?? "");
      return registry.get(type)?.title ?? type;
    }
    default:
      return node.type.name;
  }
}

/** The block type of a PM node in VamosDoc terms (for allowedBlocks). */
export function docTypeOf(name: string, attrs: Record<string, unknown>): string {
  const map: Record<string, string> = { paragraph: "paragraph", heading: "heading", bulletList: "list", orderedList: "list", blockquote: "quote", codeBlock: "code", horizontalRule: "divider", table: "table", image: "image" };
  return name === COMPONENT_BLOCK ? String(attrs.blockType) : (map[name] ?? name);
}

export const useStableItems = (factory: () => InsertItem[], deps: React.DependencyList) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useMemo(factory, deps);
