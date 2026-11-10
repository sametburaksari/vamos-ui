import { ex, type DocEntry } from "../types";
import BlockEditorDemo from "../examples/block-editor/demo";
import BlockEditorRichText from "../examples/block-editor/rich-text";
import BlockEditorCustomBlock from "../examples/block-editor/custom-block";
import BlockEditorInspector from "../examples/block-editor/inspector";
import BlockEditorAllowedBlocks from "../examples/block-editor/allowed-blocks";
import BlockEditorRender from "../examples/block-editor/render";
import BlockEditorReadOnly from "../examples/block-editor/readonly";
import BlockEditorPaste from "../examples/block-editor/paste";

const entry: DocEntry = {
  slug: "block-editor",
  title: "Rich text / block editor",
  group: "Editors & drag-and-drop",
  description:
    "Edits content as blocks. Text blocks (paragraphs, headings, lists, quotes, code, tables, images, dividers) are edited inline; page blocks such as a hero or a pricing table render as the very component the site uses, configured in an inspector generated from the block's schema. Reads and writes VamosDoc, so the site renders the same content with @vamos-ui/react/render and never loads the editor. A compact RichTextEditor covers notes, comments and announcements.",
  source: ["editor/block-editor.tsx", "editor/schema-form.tsx", "editor/convert.ts", "styles/editors.css"],
  basedOn: "Tiptap v3 (ProseMirror, MIT extensions only) + cmdk + zod",
  usage: `import { BlockEditor, RichTextEditor } from "@vamos-ui/react/editor";
import { siteBlocks } from "@/blocks/registry"; // createRegistry([heroBlock, pricingBlock, …])

// Posts and pages: text + page blocks, "/" menu, drag handle, inserter
<BlockEditor value={doc} onChange={(next) => save(next)} registry={siteBlocks} variant="document" />

// A note field in a form (RichDoc in and out)
<Field label="Summary"><RichTextEditor value={note} onChange={setNote} size="sm" /></Field>

// The site (server component, no editor code)
import { renderDoc } from "@vamos-ui/react/render";
renderDoc(doc, { registry: siteBlocks, locale: "en" });`,
  demo: ex(
    "demo",
    "Landing page editor (CMS)",
    "block-editor/demo.tsx",
    BlockEditorDemo,
    "Text and page blocks in one document. Select text for the bubble menu, type / on an empty line, hover a block for the handle. Select the pricing table to edit plans in the inspector.",
  ),
  examples: [
    ex("rich-text", "Rich-text field in a form (CRM activity)", "block-editor/rich-text.tsx", BlockEditorRichText, "RichTextEditor reads the surrounding Field: label, hint, error and required are wired to the text area. Value is a RichDoc, the format of f.rich() fields."),
    ex("custom-block", "Your own block, end to end", "block-editor/custom-block.tsx", BlockEditorCustomBlock, "defineBlock once: the component renders on the site and inside the editor; the zod schema drives validation and the inspector; preview props fill a new block. variant=\"canvas\" runs blocks edge to edge, canvasTheme puts the canvas in the site's accent."),
    ex("inspector", "SchemaForm on its own", "block-editor/inspector.tsx", BlockEditorInspector, "The inspector engine: widgets come from f.* metadata (text, toggle, nested group, sortable list with keyboard move buttons). Validation issues land on the field."),
    ex("allowed-blocks", "Restricted block set (CRM quote)", "block-editor/allowed-blocks.tsx", BlockEditorAllowedBlocks, "allowedBlocks limits what the / menu and the inserter offer. Tables use Tab to move between cells."),
    ex("render", "Editor and site output side by side", "block-editor/render.tsx", BlockEditorRender, "The same VamosDoc through renderDoc from @vamos-ui/react/render — RSC-safe and free of Tiptap."),
    ex("paste", "Markdown and Word paste", "block-editor/paste.tsx", BlockEditorPaste, "Markdown becomes headings, lists, quotes, code and tables; Word and Google Docs HTML is cleaned of styles before parsing; a bare URL becomes a link."),
    ex("readonly", "Read-only document with outline (HR policy)", "block-editor/readonly.tsx", BlockEditorReadOnly, "readOnly keeps the text selectable and hides every editing control. The outline lists headings with word count and reading time."),
  ],
  api: [
    {
      name: "BlockEditor",
      props: [
        { name: "value / defaultValue", type: "VamosDoc", description: "Content. Doc-level fields (seo, layout, locales) are kept; blocks and meta are written by the editor." },
        { name: "onChange", type: "(doc: VamosDoc, info: { wordCount; changedBlockIds }) => void", description: "Debounced 300 ms and flushed on blur. The editor's own state is the truth while typing." },
        { name: "registry", type: "BlockRegistry", description: "Page blocks (createRegistry). The same registry the site renders with. Default: text blocks only." },
        { name: "variant", type: '"document" | "canvas" | "rich-text"', default: '"document"', description: "Reading column (~720px), full-width page builder, or compact field (no inserter or drag handle)." },
        { name: "allowedBlocks", type: "string[] | ({ parentType }) => string[]", description: "Block types offered in the / menu and inserter: paragraph, heading, list, quote, code, divider, table, image and registry types." },
        { name: "patterns", type: "BlockPattern[]", description: "Ready-made groups of blocks ({ id, title, category, doc }), shown in the inserter's Patterns tab." },
        { name: "placeholder", type: "string", default: '"Type / to add a block"', description: "Empty-editor text (dictionary key blockEditor.placeholder)." },
        { name: "readOnly", type: "boolean", default: "false", description: "Display only: no toolbar, menus, handle or inserter." },
        { name: "media / uploadImage", type: "MediaAdapter / (file, { signal }) => Promise<{ src; alt?; width?; height?; assetId? }>", description: "Pasted and dropped images upload through here. Default: the VamosProvider media adapter." },
        { name: "linkSearch", type: "(q) => Promise<{ title; href; type }[]>", description: "Internal page suggestions in the link editor (⌘/Ctrl+K)." },
        { name: "canvasTheme", type: "{ accent?; font?; density?; theme? }", description: "Site theme axes on the canvas, so blocks look as they will live. The canvas is always solid, also inside a glass admin." },
        { name: "lang", type: "string", default: "value.lang → UI locale", description: "Content language: lang attribute (spellcheck, hyphenation), word counting and anchor slugs." },
        { name: "editorRef", type: "Ref<BlockEditorHandle>", description: "{ focus, insertBlock(type, props?), getDoc, undo, redo, editor }. editor is the Tiptap instance." },
        { name: "size / minHeight / maxHeight / toolbar", type: '"sm" | "md" / CSS length / boolean', description: "Rich-text variant sizing and the fixed toolbar." },
        { name: "aria-label / aria-labelledby", type: "string", default: '"Content"', description: "Accessible name of the text area." },
        { name: "labels", type: "Partial<BlockEditorLabels>", description: "Every built-in string (namespace blockEditor)." },
        { name: "children", type: "ReactNode", description: "Your composition of parts. Default: content, bubble menu, / menu, drag handle and inserter (toolbar for rich-text)." },
      ],
    },
    {
      name: "Parts",
      props: [
        { name: "BlockEditorContent", type: "HTMLAttributes<div>", description: "The canvas: contenteditable with role=textbox, aria-multiline, lang and Field wiring." },
        { name: "BlockEditorBubbleMenu", type: "{ children? }", description: "role=toolbar on a text selection: turn into, bold, italic, underline, strike, code, highlight, link. Arrow keys move, Alt+F10 focuses, Esc returns." },
        { name: "BlockEditorToolbar", type: "{ scripts?; children? }", description: "Fixed toolbar (rich-text): marks, lists, quote, link, undo/redo. scripts adds sub/superscript." },
        { name: "BlockEditorSlashMenu", type: "{ className? }", description: "/ inserter. cmdk listbox driven from the text: arrows, Enter or Tab inserts, Esc closes. Search folds Turkish İ/ı." },
        { name: "BlockEditorDragHandle", type: "{ className? }", description: "Gutter + (insert below) and grip (drag, accent drop line) with a block menu: duplicate, move, turn into, copy link, hide, delete." },
        { name: "BlockInserter", type: "{ trigger?: ReactNode | null }", description: "+ popover: Blocks | Patterns, cmdk search, live mini preview of the highlighted block." },
        { name: "BlockInspector", type: "{ widgets?; onShowDocument?; documentLabel? }", description: "Settings of the selected page block from its schema: variant, props, anchor, hide. Images: alt text, decorative, caption." },
        { name: "BlockEditorOutline", type: "{ stats? }", description: "Heading outline, word count, reading time, warnings for skipped levels, several H1s and images without alt." },
      ],
    },
    {
      name: "RichTextEditor",
      props: [
        { name: "value / defaultValue / onChange", type: "RichDoc", description: "f.rich() value: paragraphs, h2–h4, lists, quotes, code, rules. onChange is debounced." },
        { name: "id / invalid / required / aria-describedby", type: "—", description: "Usually set by the surrounding Field." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Text size and padding." },
        { name: "minHeight / maxHeight", type: "CSS length", default: '"7rem" / none', description: "The text area scrolls past maxHeight." },
        { name: "toolbar", type: "boolean", default: "true", description: "Fixed toolbar above the text." },
        { name: "placeholder / readOnly / labels / autoFocus", type: "—", description: "As on BlockEditor." },
      ],
    },
    {
      name: "SchemaForm",
      props: [
        { name: "schema", type: "z.ZodObject", description: "Usually a block's schema built with f.*." },
        { name: "value / onChange", type: "Record<string, unknown>", description: "Props object (localized fields edit the locale entry)." },
        { name: "fields", type: "Record<key, { widget?; label?; help?; placeholder?; group?; hidden?; when?(v) }>", description: "Hints; group is content, style or advanced." },
        { name: "widgets", type: "Record<string, WidgetComponent>", description: "Custom widgets by name (receive id, value, onChange, schema, meta, invalid, locale)." },
        { name: "errors", type: "ZodError | { path; message }[]", description: "Shown under the matching fields." },
        { name: "layout", type: '"sidebar" | "dialog"', default: '"sidebar"', description: "Stacked, or two columns in a dialog." },
        { name: "variant / locale / disabled", type: "string / string / boolean", description: "Hide fields of other variants; locale edited in Localized<T>; read-only." },
      ],
    },
    {
      name: "Converters (pure)",
      props: [
        { name: "toProseMirror(doc, registry?)", type: "VamosDoc → JSONContent", description: "Migrates the doc and component blocks to current versions first. Unknown types are carried untouched." },
        { name: "fromProseMirror(json, { base?, lang?, meta? })", type: "JSONContent → VamosDoc", description: "Stable ids (missing or duplicate ones replaced), merged runs, derived meta (wordCount, readingTime, toc)." },
        { name: "richDocToProseMirror / proseMirrorToRichDoc", type: "RichDoc ↔ JSONContent", description: "For f.rich() fields; headings clamp to h2–h4." },
        { name: "markdownToBlocks / cleanPastedHtml", type: "string → BlockNode[] / string", description: "Paste conversion, usable on the server for imports." },
      ],
    },
  ],
  notes: [
    "Keyboard: Esc selects the current block. In block selection, ↑/↓ move between blocks, Alt+Shift+↑/↓ moves the block, ⌘/Ctrl+Shift+D duplicates, Alt+Shift+Z deletes, Enter goes back to the text. Insertions, moves and deletes are announced.",
    "Markdown shortcuts while typing: # to ####, - or *, 1., >, ``` and ---.",
    "Storage: image blocks are { type: \"image\", props: { src, alt, width, height, caption, assetId, focal } }; tables are table → table-row → table-cell (props.header, colspan, rowspan) with inline content.",
    "Unknown block types (a disabled module) show a placeholder and are saved back exactly as they were loaded.",
  ],
  covers: ["Rich text / block editor"],
};

export default entry;
