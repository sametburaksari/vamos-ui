"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "../lib/cn";
import { renderDoc } from "../render/block-renderer";
import type { BlockNode } from "../blocks/schema/types";
import { Popover, PopoverAnchor, PopoverContent } from "../components/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/command";
import { useBlockEditor } from "./context";
import { filterAllowed, patternItems, runInsert, type InsertGroup, type InsertItem } from "./items";
import { useInsertItems } from "./slash-menu";

const GROUPS: InsertGroup[] = ["text", "media", "layout", "blocks"];
const GROUP_LABEL = { text: "groupText", media: "groupMedia", layout: "groupLayout", blocks: "groupBlocks", patterns: "groupPatterns" } as const;

/** A scaled, non-interactive render of a block or pattern (inserter preview). */
function InsertPreview({ item }: { item: InsertItem | undefined }) {
  const { registry, lang, t } = useBlockEditor();
  const blocks = React.useMemo<BlockNode[] | null>(() => {
    if (!item) return null;
    if (item.pattern) return item.pattern.doc.blocks;
    if (item.def) {
      const variant = item.def.defaultVariant ?? item.def.variants?.[0];
      return [{ id: "b_preview", type: item.def.type, v: item.def.version, variant, props: item.def.sample(variant, lang) as Record<string, unknown> }];
    }
    return null;
  }, [item, lang]);
  if (!item) return null;
  return (
    <div className="vui-inserter-preview" aria-hidden>
      <p className="vui-eyebrow">{t("preview")}</p>
      {blocks ? (
        <div className="vui-inserter-stage" data-material="solid">
          <div className="vui-inserter-scale">{renderDoc({ version: 1, lang, blocks }, { registry, locale: lang, jsonLd: false, dev: false })}</div>
        </div>
      ) : (
        <div className="vui-inserter-stage vui-inserter-text">
          <item.icon className="size-5 text-fg-subtle" />
          <p className="text-sm font-medium text-fg">{item.title}</p>
          {item.hint ? <p className="text-xs text-fg-muted">{item.hint}</p> : null}
        </div>
      )}
      {item.hint && (blocks || item.pattern) ? <p className="mt-2 text-xs text-fg-muted">{item.hint}</p> : null}
    </div>
  );
}

export interface BlockInserterProps {
  /** Custom trigger. Default: an "Add block" row at the end of the canvas. `null` hides it (open via the drag handle "+"). */
  trigger?: React.ReactNode | null;
  className?: string;
}

/**
 * The "+" inserter: a searchable popover of text blocks, page blocks and patterns, grouped by
 * category, with a live mini preview of the highlighted block. Opens from its trigger or from
 * the drag handle "+" (then it inserts below that block).
 */
export function BlockInserter({ trigger, className }: BlockInserterProps) {
  const { editor, t, inserter, openInserter, patterns, registry, lang, allowedTypes, readOnly } = useBlockEditor();
  const items = useInsertItems();
  const pItems = React.useMemo(() => filterAllowed(patternItems(patterns, registry), allowedTypes()), [patterns, registry, allowedTypes]);
  const [tab, setTab] = React.useState<"blocks" | "patterns">("blocks");
  const [highlight, setHighlight] = React.useState("");
  const list = tab === "patterns" ? pItems : items;
  const current = list.find((i) => i.id === highlight) ?? list[0];

  const anchorRef = React.useRef<{ getBoundingClientRect: () => DOMRect }>({ getBoundingClientRect: () => new DOMRect() });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  anchorRef.current = {
    getBoundingClientRect: () => {
      if (inserter.anchor?.isConnected) return inserter.anchor.getBoundingClientRect();
      if (editor && inserter.at !== undefined) {
        const dom = editor.view.nodeDOM(inserter.at) as HTMLElement | null;
        if (dom?.getBoundingClientRect) {
          const r = dom.getBoundingClientRect();
          return new DOMRect(r.left, r.bottom, Math.min(r.width, 1), 0);
        }
      }
      return triggerRef.current?.getBoundingClientRect() ?? new DOMRect();
    },
  };

  if (readOnly) return null;

  const choose = (item: InsertItem) => {
    if (!editor) return;
    inserter.setOpen(false);
    runInsert(editor, item, { lang, at: inserter.at });
  };

  return (
    <Popover open={inserter.open} onOpenChange={(o) => (o ? undefined : inserter.setOpen(false))}>
      <PopoverAnchor virtualRef={anchorRef as unknown as React.RefObject<HTMLElement>} />
      {trigger === null ? null : (
        <div className={cn("vui-inserter-row", className)}>
          {trigger ?? (
            <button
              ref={triggerRef}
              type="button"
              className="vui-inserter-trigger focus-ring"
              aria-haspopup="dialog"
              aria-expanded={inserter.open}
              onClick={(e) => {
                if (!editor) return;
                const anchor = e.currentTarget;
                // Insert at the end of the document.
                const doc = editor.state.doc;
                openInserter({ at: doc.childCount ? doc.content.size - doc.lastChild!.nodeSize : 0, anchor });
              }}
            >
              <Plus aria-hidden className="size-4" />
              {t("insert")}
            </button>
          )}
        </div>
      )}
      <PopoverContent
        size="auto"
        padded={false}
        align="start"
        side="bottom"
        aria-label={t("insert")}
        className="vui-inserter w-[min(40rem,calc(100vw-1.5rem))] overflow-hidden"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor?.commands.focus();
        }}
      >
        <Command label={t("searchBlocks")} value={current?.id ?? ""} onValueChange={setHighlight} loop>
          <CommandInput placeholder={t("searchBlocks")} />
          {pItems.length ? (
            <div role="tablist" aria-label={t("insert")} className="vui-inserter-tabs">
              {(["blocks", "patterns"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  data-active={tab === k ? "" : undefined}
                  className="focus-ring"
                  onClick={() => {
                    setTab(k);
                    setHighlight("");
                  }}
                >
                  {t(k)}
                </button>
              ))}
            </div>
          ) : null}
          <div className="grid min-h-0 sm:grid-cols-[minmax(0,1fr)_15rem]">
            <CommandList className="max-h-[min(24rem,60dvh)] sm:border-e sm:border-line">
              <CommandEmpty>{t("noBlocksPlain")}</CommandEmpty>
              {tab === "patterns" ? (
                <CommandGroup heading={t("groupPatterns")}>
                  {pItems.map((it) => (
                    <CommandItem key={it.id} value={it.id} keywords={[it.title, ...it.keywords]} icon={<it.icon className="size-4" />} description={it.hint} onSelect={() => choose(it)}>
                      {it.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                GROUPS.map((g) => {
                  const inGroup = items.filter((i) => i.group === g);
                  if (!inGroup.length) return null;
                  return (
                    <CommandGroup key={g} heading={t(GROUP_LABEL[g])}>
                      {inGroup.map((it) => (
                        <CommandItem key={it.id} value={it.id} keywords={[it.title, ...it.keywords]} icon={<it.icon className="size-4" />} description={it.hint} onSelect={() => choose(it)}>
                          {it.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })
              )}
            </CommandList>
            <div className="max-sm:hidden">
              <InsertPreview item={current} />
            </div>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
