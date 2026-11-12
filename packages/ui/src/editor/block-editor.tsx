"use client";

import * as React from "react";
import { EditorContent, useEditor, type Editor, type JSONContent } from "@tiptap/react";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useMediaAdapter } from "../lib/provider";
import { useFieldContext, useFieldControl } from "../lib/field-context";
import { useLatest } from "../lib/use-controllable-state";
import { createRegistry, type BlockRegistry } from "../blocks/schema/define-block";
import type { RichDoc } from "../blocks/schema/rich-doc";
import type { VamosDoc } from "../blocks/schema/types";
import type { MediaAdapter } from "../media/types";
import { blockEditorLabels, type BlockEditorLabels } from "./labels";
import {
  BlockEditorContext,
  createSlashStore,
  useBlockEditor,
  type BlockEditorContextValue,
  type BlockEditorVariant,
  type BlockPattern,
  type ImageUploader,
  type InserterRequest,
  type LinkSuggestion,
} from "./context";
import { buildExtensions, type EditorBridge } from "./extensions";
import { changedBlockIds, stableStringify, fromProseMirror, proseMirrorToRichDoc, richDocToProseMirror, toProseMirror } from "./convert";
import { blockTitle, registryItems, runInsert, textItems, filterAllowed } from "./items";
import { BlockEditorBubbleMenu, BlockEditorToolbar } from "./menus";
import { BlockEditorSlashMenu } from "./slash-menu";
import { BlockEditorDragHandle } from "./drag-handle";
import { BlockInserter } from "./inserter";

export interface BlockEditorHandle {
  focus(): void;
  /** Inserts a block after the current one. `type` is a text type ("heading-2", "table") or a registry type ("hero"). */
  insertBlock(type: string, props?: Record<string, unknown>): void;
  /** The current content as a VamosDoc (not debounced). */
  getDoc(): VamosDoc;
  undo(): void;
  redo(): void;
  /** Tiptap escape hatch. */
  editor: Editor | null;
}

export interface BlockEditorChangeInfo {
  wordCount: number;
  changedBlockIds: string[];
}

export interface BlockEditorProps {
  value?: VamosDoc;
  defaultValue?: VamosDoc;
  /** Debounced (300 ms). The editor's own state is the truth while typing. */
  onChange?: (doc: VamosDoc, info: BlockEditorChangeInfo) => void;
  /** Blocks available to insert and render. Default: none (text blocks only). */
  registry?: BlockRegistry;
  /**
   * `"document"`: a ~720px reading column (posts, KB) · `"canvas"`: full-width page builder ·
   * `"rich-text"`: compact field, text blocks only, no inserter or drag handle.
   */
  variant?: BlockEditorVariant;
  /** Rich-text size. Default `"md"`. */
  size?: "sm" | "md";
  /** Block types that may be inserted (text types are `paragraph`, `heading`, `list`, `quote`, `code`, `divider`, `table`, `image`). */
  allowedBlocks?: string[] | ((ctx: { parentType?: string }) => string[]);
  patterns?: BlockPattern[];
  /** Placeholder of an empty editor. Dictionary default: "Type / to add a block". */
  placeholder?: string;
  readOnly?: boolean;
  /** Paste / drop images → upload. Default: the `VamosProvider` media adapter. */
  media?: MediaAdapter;
  /** Custom image upload (wins over `media`). */
  uploadImage?: ImageUploader;
  /** Internal link suggestions in the link editor. */
  linkSearch?: (q: string) => Promise<LinkSuggestion[]>;
  /** Site theme axes for the canvas, so blocks look exactly as they will live. */
  canvasTheme?: { accent?: string; font?: string; density?: string; theme?: "light" | "dark" };
  /** Content language (spellcheck, hyphenation, word counting). Default `value.lang` → UI locale. */
  lang?: string;
  editorRef?: React.Ref<BlockEditorHandle>;
  /** Accessible name of the text area. Default "Content". */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Min / max height of the rich-text field (CSS length). */
  minHeight?: string;
  maxHeight?: string;
  /** Rich-text: show the fixed toolbar. Default true. */
  toolbar?: boolean;
  /** Autofocus on mount. */
  autoFocus?: boolean;
  labels?: Partial<BlockEditorLabels>;
  className?: string;
  /**
   * Parts to render. Default per variant: content + bubble menu + "/" menu (+ drag handle and
   * inserter for document/canvas, + toolbar for rich-text). Pass your own composition to add
   * `BlockInspector`, `BlockEditorOutline` or a custom layout.
   */
  children?: React.ReactNode;
  /** @internal value format used by RichTextEditor. */
  format?: "doc" | "rich";
  /** @internal */
  richValue?: RichDoc;
  /** @internal */
  defaultRichValue?: RichDoc;
  /** @internal */
  onRichChange?: (doc: RichDoc) => void;
  /** @internal Field wiring. */
  a11y?: BlockEditorContextValue["a11y"];
}

const EMPTY_REGISTRY = createRegistry([]);

/**
 * The block editor: text blocks edited inline, page blocks rendered by the very component the
 * site uses (via the registry), a "/" inserter, a bubble menu on selection, a drag handle with a
 * keyboard-equivalent block menu, and a schema-generated inspector. Reads and writes `VamosDoc`.
 *
 * ```tsx
 * <BlockEditor value={doc} onChange={setDoc} registry={siteBlocks} variant="document" />
 *
 * <BlockEditor value={doc} onChange={setDoc} registry={siteBlocks}>
 *   <BlockEditorContent />
 *   <BlockEditorBubbleMenu />
 *   <BlockEditorSlashMenu />
 *   <BlockEditorDragHandle />
 *   <aside><BlockInspector /></aside>
 * </BlockEditor>
 * ```
 */
export function BlockEditor(props: BlockEditorProps) {
  const {
    value,
    defaultValue,
    onChange,
    registry = EMPTY_REGISTRY,
    variant = "document",
    size = "md",
    allowedBlocks,
    patterns = [],
    placeholder,
    readOnly = false,
    media: mediaProp,
    uploadImage: uploadProp,
    linkSearch,
    lang: langProp,
    editorRef,
    autoFocus,
    labels,
    format = "doc",
    richValue,
    defaultRichValue,
    onRichChange,
    a11y,
    children,
  } = props;
  const t = useLabels("blockEditor", blockEditorLabels, labels);
  const { locale } = useLocale();
  const providerMedia = useMediaAdapter<MediaAdapter>();
  const media = mediaProp ?? providerMedia ?? undefined;
  const initialDoc = value ?? defaultValue;
  const lang = langProp ?? initialDoc?.lang ?? locale.split("-")[0] ?? "en";
  const richText = variant === "rich-text";

  const uploadImage = React.useMemo<ImageUploader | undefined>(() => {
    if (uploadProp) return uploadProp;
    if (!media?.upload) return undefined;
    return async (file, opts) => {
      const asset = await media.upload(file, { signal: opts.signal, onProgress: opts.onProgress ?? (() => {}) });
      return { src: asset.url, alt: asset.alt, width: asset.width, height: asset.height, assetId: asset.id };
    };
  }, [uploadProp, media]);

  // ---------------------------------------------------------------- announcements
  const [message, setMessage] = React.useState("");
  const announce = React.useCallback((m: string) => {
    setMessage("");
    requestAnimationFrame?.(() => setMessage(m));
  }, []);

  const slash = React.useMemo(() => createSlashStore(), []);
  const toolbarRef = React.useRef<HTMLElement | null>(null);
  const editorHolder = React.useRef<Editor | null>(null);
  const bridge = React.useRef<EditorBridge>(null as unknown as EditorBridge);
  bridge.current = {
    t,
    announce,
    title: (node) => blockTitle(node, registry, t),
    focusToolbar: () => {
      const el = toolbarRef.current?.querySelector<HTMLElement>("button:not([disabled])");
      if (!el) return false;
      el.focus();
      return true;
    },
    uploader: readOnly ? undefined : uploadImage,
  };

  const baseDoc = React.useRef<VamosDoc | undefined>(initialDoc);
  const lastDoc = React.useRef<VamosDoc | undefined>(initialDoc);
  const lastRich = React.useRef<RichDoc | undefined>(richValue ?? defaultRichValue);
  const onChangeRef = useLatest(onChange);
  const onRichRef = useLatest(onRichChange);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const emit = React.useCallback(() => {
    timer.current = null;
    const ed = editorHolder.current;
    if (!ed || ed.isDestroyed) return;
    const json = ed.getJSON();
    if (format === "rich") {
      const rich = proseMirrorToRichDoc(json);
      if (stableStringify(rich) === stableStringify(lastRich.current ?? { type: "doc", content: [] })) return;
      lastRich.current = rich;
      onRichRef.current?.(rich);
      return;
    }
    const doc = fromProseMirror(json, { base: baseDoc.current, lang });
    if (lastDoc.current && stableStringify(doc.blocks) === stableStringify(lastDoc.current.blocks)) return;
    const changed = changedBlockIds(lastDoc.current, doc);
    lastDoc.current = doc;
    onChangeRef.current?.(doc, { wordCount: doc.meta?.wordCount ?? 0, changedBlockIds: changed });
  }, [format, lang, onChangeRef, onRichRef]);

  const initialContent = React.useMemo<JSONContent>(
    () => (format === "rich" ? richDocToProseMirror(richValue ?? defaultRichValue) : toProseMirror(initialDoc ?? { version: 1, blocks: [] }, registry)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const editor = useEditor(
    {
      extensions: buildExtensions({ variant, t, placeholder, slash: readOnly ? null : slash, bridge, getEditor: () => editorHolder.current!, blocks: !richText }),
      content: initialContent,
      editable: !readOnly,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      autofocus: autoFocus ? "end" : false,
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-multiline": "true",
          spellcheck: "true",
          class: cn("vui-editor-prose prose-ui vb-prose", richText && size === "sm" && "prose-ui-sm"),
        },
      },
      onCreate: ({ editor: ed }) => {
        editorHolder.current = ed;
        // Start with a caret in the first text block, not a selected page block.
        if (ed.state.selection instanceof NodeSelection) {
          const sel = TextSelection.findFrom(ed.state.doc.resolve(0), 1, true);
          if (sel) ed.view.dispatch(ed.state.tr.setSelection(sel).setMeta("addToHistory", false));
        }
      },
      onUpdate: () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(emit, 300);
      },
      onBlur: () => {
        if (timer.current) {
          clearTimeout(timer.current);
          emit();
        }
      },
    },
    [variant, richText],
  );
  editorHolder.current = editor;

  // Flush pending changes on unmount.
  React.useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        emit();
      }
    },
    [emit],
  );

  React.useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  // Controlled value: replace content only when the value differs from what we last emitted.
  React.useEffect(() => {
    if (!editor || format !== "doc" || !value || value === lastDoc.current) return;
    if (lastDoc.current && stableStringify(value.blocks) === stableStringify(lastDoc.current.blocks)) {
      lastDoc.current = value;
      baseDoc.current = value;
      return;
    }
    baseDoc.current = value;
    lastDoc.current = value;
    editor.commands.setContent(toProseMirror(value, registry), { emitUpdate: false });
  }, [editor, value, registry, format]);
  React.useEffect(() => {
    if (!editor || format !== "rich" || !richValue || richValue === lastRich.current) return;
    if (stableStringify(richValue) === stableStringify(lastRich.current)) return;
    lastRich.current = richValue;
    editor.commands.setContent(richDocToProseMirror(richValue), { emitUpdate: false });
  }, [editor, richValue, format]);

  // ---------------------------------------------------------------- allowed blocks, inserter
  const allowedRef = useLatest(allowedBlocks);
  const allowedTypes = React.useCallback(
    (parentType?: string) => {
      const a = allowedRef.current;
      if (!a) return null;
      return typeof a === "function" ? a({ parentType }) : a;
    },
    [allowedRef],
  );
  const [inserter, setInserter] = React.useState<{ open: boolean; at?: number; anchor?: HTMLElement | null }>({ open: false });
  const openInserter = React.useCallback((req?: InserterRequest) => setInserter({ open: true, at: req?.at, anchor: req?.anchor }), []);

  React.useImperativeHandle(
    editorRef,
    (): BlockEditorHandle => ({
      focus: () => editor?.commands.focus(),
      insertBlock: (type, props) => {
        if (!editor) return;
        const items = filterAllowed([...textItems(t, { richText }), ...registryItems(registry)], null);
        const item = items.find((i) => i.id === type || i.id === `block:${type}` || i.blockType === type);
        if (!item) return;
        const patched = props && item.def ? { ...item, build: (l: string) => {
          const c = item.build(l) as JSONContent;
          return { ...c, attrs: { ...c.attrs, props: { ...(c.attrs?.props as object), ...props } } };
        } } : item;
        runInsert(editor, patched, { lang });
      },
      getDoc: () => (editor ? fromProseMirror(editor.getJSON(), { base: baseDoc.current, lang }) : (lastDoc.current ?? { version: 1, blocks: [] })),
      undo: () => editor?.commands.undo(),
      redo: () => editor?.commands.redo(),
      editor,
    }),
    [editor, registry, t, lang, richText],
  );

  const ctx: BlockEditorContextValue = {
    editor,
    registry,
    variant,
    size,
    readOnly,
    lang,
    t,
    allowedTypes,
    patterns,
    media,
    uploadImage: readOnly ? undefined : uploadImage,
    linkSearch,
    slash,
    announce,
    openInserter,
    inserter: { open: inserter.open, at: inserter.at, anchor: inserter.anchor, setOpen: (open) => setInserter((s) => ({ ...s, open })) },
    toolbarRef,
    editorLabel: props["aria-label"] ?? t("editorLabel"),
    canvasTheme: props.canvasTheme,
    placeholder,
    a11y: { ...a11y, labelledBy: props["aria-labelledby"] ?? a11y?.labelledBy },
  };

  const content =
    children ??
    (richText ? (
      <>
        {props.toolbar === false || readOnly ? null : <BlockEditorToolbar />}
        <BlockEditorContent />
        {readOnly ? null : <BlockEditorBubbleMenu />}
        {readOnly ? null : <BlockEditorSlashMenu />}
      </>
    ) : (
      <>
        <BlockEditorContent />
        {readOnly ? null : (
          <>
            <BlockEditorBubbleMenu />
            <BlockEditorSlashMenu />
            <BlockEditorDragHandle />
            <BlockInserter />
          </>
        )}
      </>
    ));

  return (
    <BlockEditorContext.Provider value={ctx}>
      <div
        data-slot="block-editor"
        data-variant={variant}
        data-size={richText ? size : undefined}
        data-readonly={readOnly ? "" : undefined}
        data-invalid={a11y?.invalid ? "" : undefined}
        className={cn("vui-editor", props.className)}
        style={richText ? ({ "--editor-min-h": props.minHeight, "--editor-max-h": props.maxHeight } as React.CSSProperties) : undefined}
      >
        {content}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {message}
        </div>
      </div>
    </BlockEditorContext.Provider>
  );
}

export interface BlockEditorContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * The editable canvas. Wears the site theme (`canvasTheme`) and is always `solid`, even inside a
 * glass admin, for long-text readability and scroll performance.
 */
export const BlockEditorContent = /*#__PURE__*/ React.forwardRef<HTMLDivElement, BlockEditorContentProps>(function BlockEditorContent({ className, ...props }, ref) {
  const { editor, variant, lang, editorLabel, a11y, readOnly, size, canvasTheme = {} } = useBlockEditor();

  // ARIA on the contenteditable element (Tiptap owns the node).
  React.useEffect(() => {
    const dom = editor?.view.dom as HTMLElement | undefined;
    if (!dom) return;
    const set = (k: string, v: string | undefined | null) => (v ? dom.setAttribute(k, v) : dom.removeAttribute(k));
    set("aria-label", a11y?.labelledBy ? null : editorLabel);
    set("aria-labelledby", a11y?.labelledBy);
    set("aria-describedby", a11y?.describedBy);
    set("aria-invalid", a11y?.invalid ? "true" : null);
    set("aria-required", a11y?.required ? "true" : null);
    set("aria-readonly", readOnly ? "true" : null);
    set("id", a11y?.id);
    set("lang", lang);
  }, [editor, editorLabel, a11y?.labelledBy, a11y?.describedBy, a11y?.invalid, a11y?.required, a11y?.id, readOnly, lang]);

  return (
    <div
      ref={ref}
      data-slot="block-editor-content"
      data-material={variant === "rich-text" ? undefined : "solid"}
      data-accent={canvasTheme.accent}
      data-font={canvasTheme.font}
      data-density={canvasTheme.density}
      className={cn("vui-editor-canvas", variant !== "rich-text" && canvasTheme.theme, className)}
      lang={lang}
      {...props}
    >
      {editor ? (
        <EditorContent editor={editor} className="vui-editor-root" />
      ) : (
        <div className="vui-editor-root" aria-hidden>
          <div className={cn("vui-editor-prose prose-ui vb-prose", variant === "rich-text" && size === "sm" && "prose-ui-sm")} />
        </div>
      )}
    </div>
  );
});

// ---------------------------------------------------------------- RichTextEditor

export interface RichTextEditorProps
  extends Omit<BlockEditorProps, "value" | "defaultValue" | "onChange" | "variant" | "registry" | "patterns" | "format" | "richValue" | "defaultRichValue" | "onRichChange" | "a11y" | "canvasTheme" | "allowedBlocks"> {
  /** A RichDoc (the value of `f.rich()` fields): paragraphs, h2–h4, lists, quotes, code, rules. */
  value?: RichDoc;
  defaultValue?: RichDoc;
  /** Debounced (300 ms). */
  onChange?: (doc: RichDoc) => void;
  id?: string;
  invalid?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
}

/**
 * Compact rich-text field for notes, comments, CRM activities and HR announcements. Same engine
 * as BlockEditor (`variant="rich-text"`), RichDoc in and out, Field-aware like Textarea.
 *
 * ```tsx
 * <Field label="Note" hint="Visible to your team only.">
 *   <RichTextEditor value={note} onChange={setNote} size="sm" minHeight="6rem" />
 * </Field>
 * ```
 */
export function RichTextEditor({ value, defaultValue, onChange, id, invalid, required, "aria-describedby": describedBy, "aria-labelledby": labelledBy, ...rest }: RichTextEditorProps) {
  const field = useFieldContext();
  const control = useFieldControl({ id, "aria-describedby": describedBy, "aria-invalid": invalid || undefined, required });
  return (
    <BlockEditor
      {...rest}
      variant="rich-text"
      format="rich"
      richValue={value}
      defaultRichValue={defaultValue}
      onRichChange={onChange}
      a11y={{
        id: control.id,
        describedBy: control["aria-describedby"],
        invalid: !!control["aria-invalid"],
        required: !!control.required,
        labelledBy: labelledBy ?? field?.labelId,
      }}
    />
  );
}
