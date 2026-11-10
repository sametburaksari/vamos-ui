// The Tiptap extension set behind BlockEditor. MIT extensions only (no Pro / Cloud).

import { Extension, Mark, mergeAttributes, type AnyExtension, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import UniqueID from "@tiptap/extension-unique-id";
import { Suggestion, exitSuggestion } from "@tiptap/suggestion";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { sanitizeHref } from "../blocks/schema/safety";
import type { LabelFn } from "../lib/labels";
import type { BlockEditorLabels } from "./labels";
import type { BlockEditorVariant, ImageUploader, SlashStore } from "./context";
import { COMPONENT_BLOCK, createBlockId, toProseMirror } from "./convert";
import { cleanPastedHtml, looksLikeMarkdown, markdownToBlocks } from "./markdown";
import { ComponentBlockNode, ImageNode, uploadImageFile } from "./nodes";
import { deleteBlock, duplicateBlock, editBlock, getTopBlock, isBlockSelection, moveBlock, selectBlock, selectSibling } from "./commands";

// ---------------------------------------------------------------- marks missing from StarterKit

const simpleMark = (name: string, tag: string, shortcut?: string) =>
  Mark.create({
    name,
    excludes: name === "subscript" ? "superscript" : name === "superscript" ? "subscript" : undefined,
    parseHTML: () => [{ tag }],
    renderHTML: ({ HTMLAttributes }) => [tag, mergeAttributes(HTMLAttributes), 0],
    addKeyboardShortcuts() {
      return shortcut ? { [shortcut]: () => this.editor.commands.toggleMark(name) } : {};
    },
  });

export const HighlightMark = simpleMark("highlight", "mark", "Mod-Shift-h");
export const SubscriptMark = simpleMark("subscript", "sub", "Mod-,");
export const SuperscriptMark = simpleMark("superscript", "sup", "Mod-.");

// ---------------------------------------------------------------- BlockNode fields with no PM home

const EXTRA_TYPES = ["paragraph", "heading", "bulletList", "orderedList", "blockquote", "codeBlock", "horizontalRule", "image", "table"];

const VamosAttributes = Extension.create({
  name: "vamosAttributes",
  addGlobalAttributes() {
    return [
      { types: EXTRA_TYPES, attributes: { extra: { default: null, rendered: false, keepOnSplit: false } } },
      { types: ["heading"], attributes: { anchor: { default: null, rendered: false, keepOnSplit: false } } },
      { types: ["blockquote"], attributes: { cite: { default: null, parseHTML: (el) => el.getAttribute("data-cite"), renderHTML: (a) => (a.cite ? { "data-cite": a.cite } : {}) } } },
      // Content language direction per block (mixed-script docs).
      { types: ["paragraph", "heading", "blockquote", "listItem", "tableCell", "tableHeader"], attributes: { dir: { default: "auto", renderHTML: () => ({ dir: "auto" }), parseHTML: () => "auto" } } },
    ];
  },
});

// ---------------------------------------------------------------- keyboard (block-selection mode)

export interface EditorBridge {
  t: LabelFn<BlockEditorLabels>;
  announce: (m: string) => void;
  title: (node: { type: { name: string }; attrs: Record<string, unknown> }) => string;
  focusToolbar: () => boolean;
  uploader?: ImageUploader;
}

const BlockKeymap = Extension.create<{ bridge: { current: EditorBridge } }>({
  name: "vamosBlockKeymap",
  priority: 150,
  addOptions() {
    return { bridge: { current: null as unknown as EditorBridge } };
  },
  addKeyboardShortcuts() {
    const b = () => this.options.bridge.current;
    const say = (key: keyof BlockEditorLabels, node: { type: { name: string }; attrs: Record<string, unknown> } | undefined) => node && b().announce(b().t(key, { title: b().title(node) }));
    return {
      Escape: ({ editor }) => {
        if (isBlockSelection(editor)) return false;
        const top = getTopBlock(editor);
        if (!top) return false;
        selectBlock(editor, top.pos);
        say("announceSelected", top.node);
        return true;
      },
      ArrowUp: ({ editor }) => {
        if (!isBlockSelection(editor)) return false;
        const s = selectSibling(editor, -1);
        if (s) say("announceSelected", s.node);
        return true;
      },
      ArrowDown: ({ editor }) => {
        if (!isBlockSelection(editor)) return false;
        const s = selectSibling(editor, 1);
        if (s) say("announceSelected", s.node);
        return true;
      },
      Enter: ({ editor }) => (isBlockSelection(editor) ? editBlock(editor) : false),
      "Alt-Shift-ArrowUp": ({ editor }) => {
        const m = moveBlock(editor, -1);
        if (m) say("announceMovedUp", m.node);
        return true;
      },
      "Alt-Shift-ArrowDown": ({ editor }) => {
        const m = moveBlock(editor, 1);
        if (m) say("announceMovedDown", m.node);
        return true;
      },
      "Mod-Shift-d": ({ editor }) => {
        const d = duplicateBlock(editor);
        if (d) say("announceDuplicated", d.node);
        return true;
      },
      "Alt-Shift-z": ({ editor }) => {
        const d = deleteBlock(editor);
        if (d) say("announceDeleted", d.node);
        return true;
      },
      "Alt-F10": () => b().focusToolbar(),
    };
  },
});

// ---------------------------------------------------------------- paste / drop

const imageFiles = (dt: DataTransfer | null | undefined) => Array.from(dt?.files ?? []).filter((f) => f.type.startsWith("image/"));

function PasteHandler(opts: { editor: () => Editor; bridge: { current: EditorBridge }; tables: boolean; images: boolean }) {
  return new Plugin({
    key: new PluginKey("vamosPaste"),
    props: {
      transformPastedHTML: (html) => cleanPastedHtml(html),
      handlePaste(view, event) {
        const editor = opts.editor();
        const uploader = opts.bridge.current.uploader;
        const files = imageFiles(event.clipboardData);
        if (files.length && uploader && opts.images) {
          files.forEach((f) => uploadImageFile(editor, f, uploader, { onError: () => opts.bridge.current.announce(opts.bridge.current.t("imageFailed")) }));
          return true;
        }
        const html = event.clipboardData?.getData("text/html");
        const text = event.clipboardData?.getData("text/plain");
        if (html || !text || view.state.selection.$from.parent.type.spec.code) return false;
        if (!looksLikeMarkdown(text)) return false;
        let blocks = markdownToBlocks(text);
        if (!opts.tables) blocks = blocks.filter((bl) => bl.type !== "table");
        if (!blocks.length) return false;
        const content = toProseMirror({ version: 1, blocks }).content ?? [];
        editor.chain().focus().insertContent(content).run();
        return true;
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const uploader = opts.bridge.current.uploader;
        const files = imageFiles((event as DragEvent).dataTransfer);
        if (!files.length || !uploader || !opts.images) return false;
        const coords = view.posAtCoords({ left: (event as DragEvent).clientX, top: (event as DragEvent).clientY });
        event.preventDefault();
        files.forEach((f) => uploadImageFile(opts.editor(), f, uploader, { pos: coords?.pos }));
        return true;
      },
    },
  });
}

// ---------------------------------------------------------------- slash command

export const slashPluginKey = new PluginKey("vamosSlash");

const SlashCommand = Extension.create<{ store: SlashStore | null }>({
  name: "vamosSlash",
  priority: 200,
  addOptions() {
    return { store: null };
  },
  addProseMirrorPlugins() {
    const store = this.options.store;
    if (!store) return [];
    const editor = this.editor;
    store.close.current = () => {
      exitSuggestion(editor.view, slashPluginKey);
      store.set(null);
    };
    return [
      Suggestion({
        editor,
        pluginKey: slashPluginKey,
        char: "/",
        allowSpaces: false,
        items: () => [],
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          return $from.parent.type.name === "paragraph" && !state.selection.$from.parent.type.spec.code;
        },
        render: () => ({
          onStart: (p) => store.set({ query: p.query, range: p.range, rect: p.clientRect?.() ?? null }),
          onUpdate: (p) => store.set({ query: p.query, range: p.range, rect: p.clientRect?.() ?? null }),
          onExit: () => store.set(null),
          onKeyDown: ({ event }) => {
            if (event.key === "Escape") {
              store.close.current?.();
              return true;
            }
            return store.keydown.current?.(event) ?? false;
          },
        }),
      }),
    ];
  },
});

// ---------------------------------------------------------------- the set

export interface BuildExtensionsOptions {
  variant: BlockEditorVariant;
  t: LabelFn<BlockEditorLabels>;
  placeholder?: string;
  slash: SlashStore | null;
  bridge: { current: EditorBridge };
  getEditor: () => Editor;
  /** Allow component blocks, tables and images (false in rich-text mode). */
  blocks: boolean;
}

const ID_TYPES = ["paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote", "codeBlock", "horizontalRule", "image", "table", "tableRow", "tableCell", "tableHeader", COMPONENT_BLOCK];

export function buildExtensions(o: BuildExtensionsOptions): AnyExtension[] {
  const richText = o.variant === "rich-text";
  const exts: AnyExtension[] = [
    StarterKit.configure({
      heading: { levels: richText ? [2, 3, 4] : [1, 2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer", target: null },
        isAllowedUri: (url) => sanitizeHref(url) !== null,
      },
      dropcursor: { color: "var(--accent)", width: 2, class: "vui-dropcursor" },
      trailingNode: richText ? false : { node: "paragraph", notAfter: ["paragraph"] },
    }),
    HighlightMark,
    SubscriptMark,
    SuperscriptMark,
    VamosAttributes,
    Placeholder.configure({
      includeChildren: true,
      placeholder: ({ node, editor }) => {
        if (node.type.name === "heading") return o.t("placeholderHeading");
        if (node.type.name === "codeBlock") return o.t("placeholderCode");
        if (editor.isEmpty) return o.placeholder ?? (richText ? o.t("placeholderRichText") : o.t("placeholder"));
        return richText ? "" : o.t("placeholder");
      },
    }),
    UniqueID.configure({ types: ID_TYPES.filter((n) => o.blocks || !["image", "table", "tableRow", "tableCell", "tableHeader", COMPONENT_BLOCK].includes(n)), attributeName: "id", generateID: () => createBlockId() }),
    BlockKeymap.configure({ bridge: o.bridge }),
    SlashCommand.configure({ store: o.slash }),
    Extension.create({
      name: "vamosPaste",
      addProseMirrorPlugins: () => [PasteHandler({ editor: o.getEditor, bridge: o.bridge, tables: o.blocks, images: o.blocks })],
    }),
  ];
  if (o.blocks) exts.push(Table.configure({ resizable: false, HTMLAttributes: { class: "vui-table" } }), TableRow, TableHeader, TableCell, ImageNode, ComponentBlockNode);
  return exts;
}
