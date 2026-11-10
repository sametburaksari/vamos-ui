"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { matchText } from "../lib/text";
import { Layer } from "../lib/layer";
import { usePortalContainer } from "../lib/theme-scope";
import { Command, CommandGroup, CommandItem, CommandList } from "../components/command";
import { Kbd } from "../components/kbd";
import { useBlockEditor, useSlashState } from "./context";
import { filterAllowed, registryItems, runInsert, textItems, type InsertGroup, type InsertItem } from "./items";

const GROUP_ORDER: InsertGroup[] = ["text", "media", "layout", "blocks"];
const GROUP_LABEL = { text: "groupText", media: "groupMedia", layout: "groupLayout", blocks: "groupBlocks", patterns: "groupPatterns" } as const;

/** Items for the current editor, filtered by `allowedBlocks`. */
export function useInsertItems(): InsertItem[] {
  const { t, registry, variant, allowedTypes } = useBlockEditor();
  return React.useMemo(() => {
    const richText = variant === "rich-text";
    const all = [...textItems(t, { richText }), ...(richText ? [] : registryItems(registry))];
    return filterAllowed(all, allowedTypes());
  }, [t, registry, variant, allowedTypes]);
}

/** Search over title + keywords, folded for the UI locale ("İ" matches "i" in Turkish). */
export function searchItems(items: InsertItem[], query: string, locale: string): InsertItem[] {
  const q = query.trim();
  if (!q) return items;
  return items.filter((it) => matchText(it.title, q, locale) || it.keywords.some((k) => matchText(k, q, locale)));
}

export interface BlockEditorSlashMenuProps {
  className?: string;
}

/**
 * The "/" inserter: type `/` in an empty line (or after a space), then filter, arrow, Enter.
 * A cmdk listbox driven from the editor (focus stays in the text; `aria-activedescendant`
 * follows the highlighted option). Esc closes and leaves the typed text.
 */
export function BlockEditorSlashMenu({ className }: BlockEditorSlashMenuProps) {
  const { editor, slash, t, lang } = useBlockEditor();
  const { locale } = useLocale();
  const state = useSlashState(slash);
  const items = useInsertItems();
  const results = React.useMemo(() => (state ? searchItems(items, state.query, locale) : []), [items, state, locale]);
  const grouped = React.useMemo(() => GROUP_ORDER.map((g) => ({ g, list: results.filter((r) => r.group === g) })).filter((x) => x.list.length), [results]);
  const flat = React.useMemo(() => grouped.flatMap((x) => x.list), [grouped]);
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const container = usePortalContainer();
  const listId = React.useId();

  React.useEffect(() => setActive(0), [state?.query]);

  const choose = React.useCallback(
    (item: InsertItem | undefined) => {
      if (!editor || !state || !item) return;
      runInsert(editor, item, { lang, range: state.range });
      slash.set(null);
    },
    [editor, state, lang, slash],
  );

  // Keys arrive from the editor while the menu is open.
  React.useEffect(() => {
    slash.keydown.current = (e) => {
      if (!flat.length) return false;
      if (e.key === "ArrowDown") {
        setActive((a) => (a + 1) % flat.length);
        return true;
      }
      if (e.key === "ArrowUp") {
        setActive((a) => (a - 1 + flat.length) % flat.length);
        return true;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        choose(flat[active]);
        return true;
      }
      return false;
    };
    return () => {
      slash.keydown.current = null;
    };
  }, [slash, flat, active, choose]);

  // Combobox wiring on the contenteditable while open.
  React.useEffect(() => {
    const dom = editor?.view.dom as HTMLElement | undefined;
    if (!dom) return;
    if (!state) {
      ["aria-controls", "aria-expanded", "aria-activedescendant", "aria-autocomplete", "aria-haspopup"].forEach((a) => dom.removeAttribute(a));
      return;
    }
    dom.setAttribute("aria-haspopup", "listbox");
    dom.setAttribute("aria-expanded", "true");
    dom.setAttribute("aria-autocomplete", "list");
    const list = listRef.current?.querySelector<HTMLElement>("[cmdk-list]") ?? listRef.current;
    if (list?.id) dom.setAttribute("aria-controls", list.id);
    // cmdk marks the highlighted item after its own render: read it on the next tick.
    const id = setTimeout(() => {
      const sel = listRef.current?.querySelector<HTMLElement>('[cmdk-item][aria-selected="true"]');
      if (sel?.id) dom.setAttribute("aria-activedescendant", sel.id);
      else dom.removeAttribute("aria-activedescendant");
    }, 0);
    return () => clearTimeout(id);
  });

  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[cmdk-item][aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!state || !editor || typeof document === "undefined") return null;
  const rect = state.rect;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const below = !rect || rect.bottom + 340 < vh || rect.top < 340;
  const style: React.CSSProperties = rect
    ? below
      ? { position: "fixed", top: rect.bottom + 6, left: Math.max(8, rect.left - 8) }
      : { position: "fixed", bottom: vh - rect.top + 6, left: Math.max(8, rect.left - 8) }
    : { position: "fixed", top: 80, left: 24 };

  const menu = (
    <Layer
      ref={listRef}
      data-slot="block-editor-slash"
      className={cn("vui-slash surface-popover ui-pop z-(--z-popover) rounded-ui-lg", className)}
      style={style}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Command shouldFilter={false} value={flat[active]?.id ?? ""} onValueChange={(v) => setActive(Math.max(0, flat.findIndex((f) => f.id === v)))} label={t("insert")} loop>
        <CommandList id={listId} label={t("insert")} className="max-h-[min(20rem,50dvh)]">
          {flat.length ? (
            grouped.map(({ g, list }) => (
              <CommandGroup key={g} heading={t(GROUP_LABEL[g])}>
                {list.map((it) => (
                  <CommandItem key={it.id} value={it.id} icon={<span className="vui-slash-icon"><it.icon className="size-4" /></span>} description={it.hint} onSelect={() => choose(it)} badge={it.shortcut ? <Kbd size="sm" variant="ghost">{it.shortcut}</Kbd> : undefined}>
                    {it.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm text-fg-muted" role="status">
              {t("noBlocks", { query: state.query })}
            </p>
          )}
        </CommandList>
      </Command>
    </Layer>
  );
  return createPortal(menu, container ?? document.body);
}
