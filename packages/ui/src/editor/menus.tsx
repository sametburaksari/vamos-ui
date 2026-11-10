"use client";

import * as React from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { NodeSelection } from "@tiptap/pm/state";
import {
  Bold,
  ChevronDown,
  Code,
  CornerDownLeft,
  ExternalLink,
  Highlighter,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo2,
  FileText,
} from "lucide-react";
import { cn } from "../lib/cn";
import { sanitizeHref } from "../blocks/schema/safety";
import { IconButtonTooltip } from "../components/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/dropdown-menu";
import { Checkbox } from "../components/checkbox";
import { useBlockEditor, type LinkSuggestion } from "./context";
import { COMPONENT_BLOCK } from "./convert";
import { turnIntoItems } from "./items";
import type { BlockEditorLabels } from "./labels";

// ---------------------------------------------------------------- toolbar primitives

/** Arrow-key navigation inside a `role="toolbar"` (roving focus). Esc returns to the text. */
function useToolbarKeys(editor: Editor | null) {
  return React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (e.key === "Escape") {
        e.preventDefault();
        editor?.commands.focus();
        return;
      }
      if (!keys.includes(e.key)) return;
      const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-toolbar-item]:not([disabled])"));
      if (!items.length) return;
      const i = items.indexOf(document.activeElement as HTMLElement);
      const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
      const fwd = rtl ? "ArrowLeft" : "ArrowRight";
      let next = i;
      if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      else next = (i + (e.key === fwd ? 1 : -1) + items.length) % items.length;
      e.preventDefault();
      items.forEach((el, j) => (el.tabIndex = j === next ? 0 : -1));
      items[next]!.focus();
    },
    [editor],
  );
}

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  shortcut?: string;
  active?: boolean;
  first?: boolean;
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton({ label, shortcut, active, first, className, children, ...props }, ref) {
  return (
    <IconButtonTooltip label={label} shortcut={shortcut} side="top">
      <button
        ref={ref}
        type="button"
        data-toolbar-item=""
        aria-label={label}
        aria-pressed={active === undefined ? undefined : active}
        tabIndex={first ? 0 : -1}
        // Keep the text selection: never steal focus on pointer down.
        onMouseDown={(e) => e.preventDefault()}
        className={cn("vui-tb-btn focus-ring", className)}
        {...props}
      >
        {children}
      </button>
    </IconButtonTooltip>
  );
});

const Divider = () => <span aria-hidden className="vui-tb-sep" />;

type MarkKey = "bold" | "italic" | "underline" | "strike" | "code" | "highlight" | "subscript" | "superscript" | "link";

function useMarkState(editor: Editor | null) {
  return useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      const marks: Record<MarkKey, boolean> = {
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        code: e.isActive("code"),
        highlight: e.isActive("highlight"),
        subscript: e.isActive("subscript"),
        superscript: e.isActive("superscript"),
        link: e.isActive("link"),
      };
      return {
        ...marks,
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        blockquote: e.isActive("blockquote"),
        inCode: e.isActive("codeBlock"),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
        turnInto: turnIntoItemsCache.find((it) => it.active(e))?.id ?? "paragraph",
      };
    },
  });
}
// Static "turn into" predicate list (labels resolved at render time).
const turnIntoItemsCache = turnIntoItems(((k: string) => k) as never);

const MARKS: { key: MarkKey; label: keyof BlockEditorLabels; icon: React.ComponentType<{ className?: string }>; shortcut?: string; run: (e: Editor) => void }[] = [
  { key: "bold", label: "bold", icon: Bold, shortcut: "mod+b", run: (e) => e.chain().focus().toggleBold().run() },
  { key: "italic", label: "italic", icon: Italic, shortcut: "mod+i", run: (e) => e.chain().focus().toggleItalic().run() },
  { key: "underline", label: "underline", icon: Underline, shortcut: "mod+u", run: (e) => e.chain().focus().toggleUnderline().run() },
  { key: "strike", label: "strike", icon: Strikethrough, shortcut: "mod+shift+s", run: (e) => e.chain().focus().toggleStrike().run() },
  { key: "code", label: "inlineCode", icon: Code, shortcut: "mod+e", run: (e) => e.chain().focus().toggleCode().run() },
  { key: "highlight", label: "highlight", icon: Highlighter, shortcut: "mod+shift+h", run: (e) => e.chain().focus().toggleMark("highlight").run() },
];
const SCRIPT_MARKS: typeof MARKS = [
  { key: "subscript", label: "subscript", icon: Subscript, shortcut: "mod+,", run: (e) => e.chain().focus().toggleMark("subscript").run() },
  { key: "superscript", label: "superscript", icon: Superscript, shortcut: "mod+.", run: (e) => e.chain().focus().toggleMark("superscript").run() },
];

// ---------------------------------------------------------------- link form

function LinkForm({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  const { t, linkSearch } = useBlockEditor();
  const current = editor.getAttributes("link") as { href?: string; target?: string | null };
  const [href, setHref] = React.useState(current.href ?? "");
  const [newTab, setNewTab] = React.useState(current.target === "_blank");
  const [error, setError] = React.useState(false);
  const [results, setResults] = React.useState<LinkSuggestion[]>([]);
  const [active, setActive] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();
  const errId = React.useId();

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  React.useEffect(() => {
    if (!linkSearch || !href.trim() || /^(https?:|mailto:|tel:|#)/.test(href)) {
      setResults([]);
      return;
    }
    let live = true;
    const id = setTimeout(() => {
      linkSearch(href.trim()).then((r) => live && (setResults(r.slice(0, 6)), setActive(-1)), () => live && setResults([]));
    }, 150);
    return () => {
      live = false;
      clearTimeout(id);
    };
  }, [href, linkSearch]);

  const apply = (value = href) => {
    const safe = sanitizeHref(value.trim());
    if (!safe) {
      setError(true);
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: safe, target: newTab ? "_blank" : null }).run();
    onDone();
  };
  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onDone();
  };

  return (
    <div className="vui-link-form" role="group" aria-label={current.href ? t("linkEdit") : t("link")}>
      <div className="flex items-center gap-1.5">
        <Link2 aria-hidden className="ms-2 size-3.5 shrink-0 text-fg-subtle" />
        <input
          ref={inputRef}
          value={href}
          onChange={(e) => {
            setHref(e.target.value);
            setError(false);
          }}
          placeholder={t("linkPlaceholder")}
          aria-label={t("link")}
          aria-invalid={error || undefined}
          aria-describedby={error ? errId : undefined}
          role={results.length ? "combobox" : undefined}
          aria-expanded={results.length ? true : undefined}
          aria-controls={results.length ? listId : undefined}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && results.length) {
              e.preventDefault();
              setActive((a) => (a + 1) % results.length);
            } else if (e.key === "ArrowUp" && results.length) {
              e.preventDefault();
              setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (active >= 0 && results[active]) apply(results[active]!.href);
              else apply();
            } else if (e.key === "Escape") {
              e.preventDefault();
              editor.commands.focus();
              onDone();
            }
          }}
          className="vui-link-input"
        />
        <button type="button" className="vui-tb-btn focus-ring" aria-label={t("linkApply")} title={t("linkApply")} onClick={() => apply()}>
          <CornerDownLeft aria-hidden />
        </button>
        {current.href ? (
          <button type="button" className="vui-tb-btn focus-ring" aria-label={t("linkRemove")} title={t("linkRemove")} onClick={remove}>
            <Link2Off aria-hidden />
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errId} className="px-2.5 pb-1 text-xs text-danger">
          {t("linkInvalid")}
        </p>
      ) : null}
      {results.length ? (
        <ul id={listId} role="listbox" aria-label={t("linkPlaceholder")} className="vui-link-results">
          {results.map((r, i) => (
            <li
              key={r.href}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              data-active={i === active ? "" : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => apply(r.href)}
            >
              <FileText aria-hidden className="size-3.5 shrink-0 text-fg-subtle" />
              <span className="min-w-0 flex-1 truncate text-fg">{r.title}</span>
              <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-wide text-fg-subtle">{r.type}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="px-2.5 pb-2 pt-1 text-xs text-fg-muted">
        <Checkbox size="sm" checked={newTab} onCheckedChange={(v) => setNewTab(v === true)} label={<span className="inline-flex items-center gap-1.5 text-xs font-normal text-fg-muted"><ExternalLink aria-hidden className="size-3" />{t("linkNewTab")}</span>} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- shared formatting row

function TurnIntoMenu({ editor, first }: { editor: Editor; first?: boolean }) {
  const { t } = useBlockEditor();
  const items = React.useMemo(() => turnIntoItems(t), [t]);
  const state = useMarkState(editor);
  const current = items.find((i) => i.id === state?.turnInto) ?? items[0]!;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" data-toolbar-item="" tabIndex={first ? 0 : -1} className="vui-tb-btn vui-tb-wide focus-ring" aria-label={`${t("turnInto")}: ${current.label}`} onMouseDown={(e) => e.preventDefault()}>
          <current.icon aria-hidden />
          <span className="max-sm:hidden">{current.label}</span>
          <ChevronDown aria-hidden className="size-3! opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent size="sm" onCloseAutoFocus={(e) => e.preventDefault()}>
        {items.map((it) => (
          <DropdownMenuItem key={it.id} icon={<it.icon />} onSelect={() => it.run(editor)} data-active={it.id === current.id ? "" : undefined}>
            {it.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MarkButtons({ editor, onLink, scripts }: { editor: Editor; onLink: () => void; scripts?: boolean }) {
  const { t } = useBlockEditor();
  const state = useMarkState(editor);
  const list = scripts ? [...MARKS, ...SCRIPT_MARKS] : MARKS;
  return (
    <>
      {list.map((m) => (
        <ToolbarButton key={m.key} label={t(m.label)} shortcut={m.shortcut} active={!!state?.[m.key]} disabled={state?.inCode} onClick={() => m.run(editor)}>
          <m.icon aria-hidden />
        </ToolbarButton>
      ))}
      <ToolbarButton label={t("link")} shortcut="mod+k" active={!!state?.link} disabled={state?.inCode} onClick={onLink}>
        <Link2 aria-hidden />
      </ToolbarButton>
    </>
  );
}

// ---------------------------------------------------------------- bubble menu

export interface BlockEditorBubbleMenuProps {
  className?: string;
  /** Extra toolbar content at the end. */
  children?: React.ReactNode;
}

/**
 * Floating toolbar on a text selection: "turn into", bold, italic, underline, strike, code,
 * highlight, link. `role="toolbar"` with arrow-key navigation; Alt+F10 focuses it, Esc returns.
 * ⌘/Ctrl+K opens the link editor.
 */
export function BlockEditorBubbleMenu({ className, children }: BlockEditorBubbleMenuProps) {
  const { editor, t, toolbarRef, variant } = useBlockEditor();
  const [mode, setMode] = React.useState<"format" | "link">("format");
  const onKeyDown = useToolbarKeys(editor);
  const elRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !editor.state.selection.empty) {
        e.preventDefault();
        setMode("link");
      }
    };
    dom.addEventListener("keydown", onKey);
    const reset = () => setMode("format");
    editor.on("selectionUpdate", reset);
    return () => {
      dom.removeEventListener("keydown", onKey);
      editor.off("selectionUpdate", reset);
    };
  }, [editor]);

  if (!editor) return null;
  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8, flip: true, shift: { padding: 12 } }}
      shouldShow={({ editor: e, state, from, to }) => {
        if (!e.isEditable || from === to) return false;
        if (state.selection instanceof NodeSelection) return false;
        if (e.isActive("codeBlock")) return false;
        const node = state.doc.nodeAt(from);
        if (node?.type.name === COMPONENT_BLOCK || node?.type.name === "image") return false;
        return state.doc.textBetween(from, to).length > 0;
      }}
      className="vui-bubble-host"
    >
      <div
        ref={(el) => {
          elRef.current = el;
          if (variant !== "rich-text") toolbarRef.current = el;
        }}
        data-slot="block-editor-bubble"
        role={mode === "format" ? "toolbar" : undefined}
        aria-label={mode === "format" ? t("formatting") : undefined}
        onKeyDown={mode === "format" ? onKeyDown : undefined}
        className={cn("vui-bubble surface-popover ui-pop", className)}
        data-layer-depth="1"
      >
        {mode === "link" ? (
          <LinkForm editor={editor} onDone={() => setMode("format")} />
        ) : (
          <div className="flex items-center gap-0.5 p-1">
            <TurnIntoMenu editor={editor} first />
            <Divider />
            <MarkButtons editor={editor} onLink={() => setMode("link")} />
            {children}
          </div>
        )}
      </div>
    </BubbleMenu>
  );
}

// ---------------------------------------------------------------- fixed toolbar

export interface BlockEditorToolbarProps {
  className?: string;
  /** Show sub/superscript buttons. */
  scripts?: boolean;
  children?: React.ReactNode;
}

/** Fixed toolbar above the text (rich-text mode): marks, lists, quote, link, undo/redo. */
export function BlockEditorToolbar({ className, scripts, children }: BlockEditorToolbarProps) {
  const { editor, t, toolbarRef, readOnly } = useBlockEditor();
  const onKeyDown = useToolbarKeys(editor);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const state = useMarkState(editor);
  if (readOnly) return null;
  return (
    <div
      ref={(el) => {
        toolbarRef.current = el;
      }}
      data-slot="block-editor-toolbar"
      role="toolbar"
      aria-label={t("formatting")}
      aria-controls={editor ? (editor.view.dom as HTMLElement).id || undefined : undefined}
      onKeyDown={onKeyDown}
      className={cn("vui-toolbar", className)}
    >
      {editor ? (
        linkOpen ? (
          <LinkForm editor={editor} onDone={() => setLinkOpen(false)} />
        ) : (
          <>
            <TurnIntoMenu editor={editor} first />
            <Divider />
            <MarkButtons editor={editor} scripts={scripts} onLink={() => !editor.state.selection.empty && setLinkOpen(true)} />
            <Divider />
            <ToolbarButton label={t("bulletList")} active={!!state?.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List aria-hidden />
            </ToolbarButton>
            <ToolbarButton label={t("orderedList")} active={!!state?.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered aria-hidden />
            </ToolbarButton>
            <ToolbarButton label={t("quote")} active={!!state?.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote aria-hidden />
            </ToolbarButton>
            {children}
            <span className="ms-auto" />
            <ToolbarButton label={t("undo")} shortcut="mod+z" disabled={!state?.canUndo} onClick={() => editor.chain().focus().undo().run()}>
              <Undo2 aria-hidden />
            </ToolbarButton>
            <ToolbarButton label={t("redo")} shortcut="mod+shift+z" disabled={!state?.canRedo} onClick={() => editor.chain().focus().redo().run()}>
              <Redo2 aria-hidden />
            </ToolbarButton>
          </>
        )
      ) : (
        <span className="h-8" />
      )}
    </div>
  );
}
