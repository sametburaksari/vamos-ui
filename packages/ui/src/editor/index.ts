// Public API of @vamos-ui/react/editor — the block / rich-text editor (Tiptap v3, admin only).
// Websites render content with @vamos-ui/react/render and never load this entry.

export {
  BlockEditor,
  BlockEditorContent,
  RichTextEditor,
  type BlockEditorProps,
  type BlockEditorContentProps,
  type BlockEditorHandle,
  type BlockEditorChangeInfo,
  type RichTextEditorProps,
} from "./block-editor";
export { BlockEditorBubbleMenu, BlockEditorToolbar, type BlockEditorBubbleMenuProps, type BlockEditorToolbarProps } from "./menus";
export { BlockEditorSlashMenu, type BlockEditorSlashMenuProps } from "./slash-menu";
export { BlockEditorDragHandle, type BlockEditorDragHandleProps } from "./drag-handle";
export { BlockInserter, type BlockInserterProps } from "./inserter";
export { BlockInspector, type BlockInspectorProps } from "./inspector";
export { BlockEditorOutline, type BlockEditorOutlineProps } from "./outline";
export { SchemaForm, type SchemaFormProps, type SchemaFieldHint, type SchemaFieldHints, type SchemaFormIssue, type WidgetComponent, type WidgetProps } from "./schema-form";
export { useBlockEditor, type BlockEditorContextValue, type BlockEditorVariant, type BlockPattern, type LinkSuggestion, type ImageUploader } from "./context";
export { blockEditorLabels, type BlockEditorLabels } from "./labels";

// Converters + doc helpers (pure, no Tiptap runtime)
export {
  toProseMirror,
  fromProseMirror,
  richDocToProseMirror,
  proseMirrorToRichDoc,
  inlineToPM,
  inlineFromPM,
  computeDocMeta,
  changedBlockIds,
  stableStringify,
  docToPlainText,
  countWords,
  createBlockId,
  isValidBlockId,
  isRichDocEmpty,
  COMPONENT_BLOCK,
  EDITOR_TEXT_TYPES,
  isEditorTextType,
  type EditorTextType,
  type ImageBlockProps,
  type TableCellProps,
  type FromProseMirrorOptions,
} from "./convert";
export { markdownToBlocks, parseInlineMarkdown, looksLikeMarkdown, cleanPastedHtml } from "./markdown";
export { getTopBlock, selectBlock, moveBlock, duplicateBlock, deleteBlock, setNodeAttrs, type TopBlock } from "./commands";
export { buildExtensions, HighlightMark, SubscriptMark, SuperscriptMark, type BuildExtensionsOptions } from "./extensions";
