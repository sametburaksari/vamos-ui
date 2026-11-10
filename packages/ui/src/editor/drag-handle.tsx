"use client";

import * as React from "react";
import DragHandle from "@tiptap/extension-drag-handle-react";
import type { Node as PMNode } from "@tiptap/pm/model";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, Link as LinkIcon, Plus, Repeat2, Trash2 } from "lucide-react";
import { cn } from "../lib/cn";
import { slugify } from "../lib/text";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../components/dropdown-menu";
import { useBlockEditor } from "./context";
import { COMPONENT_BLOCK } from "./convert";
import { deleteBlock, duplicateBlock, moveBlock, setNodeAttrs, selectBlock } from "./commands";
import { blockTitle, turnIntoItems } from "./items";

export interface BlockEditorDragHandleProps {
  className?: string;
}

/**
 * The gutter handle beside the hovered block: "+" inserts below, the grip drags (drop line in
 * `--accent`) and opens the block menu — duplicate, move up/down, turn into, copy link, hide,
 * delete. Every drag action has a menu and keyboard twin (WCAG 2.5.7).
 */
export function BlockEditorDragHandle({ className }: BlockEditorDragHandleProps) {
  const { editor, t, registry, openInserter, announce, lang } = useBlockEditor();
  const [target, setTarget] = React.useState<{ node: PMNode; pos: number } | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const turnInto = React.useMemo(() => turnIntoItems(t), [t]);

  const lock = React.useCallback(
    (on: boolean) => {
      const cmds = editor?.commands as unknown as { lockDragHandle?: () => boolean; unlockDragHandle?: () => boolean } | undefined;
      if (on) cmds?.lockDragHandle?.();
      else cmds?.unlockDragHandle?.();
    },
    [editor],
  );

  if (!editor) return null;
  const node = target?.node;
  const title = node ? blockTitle(node, registry, t) : "";
  const isComponent = node?.type.name === COMPONENT_BLOCK;
  const textBlock = node && !isComponent && node.type.name !== "image" && node.type.name !== "table" && node.type.name !== "horizontalRule";
  const index = target ? editor.state.doc.resolve(target.pos).index(0) : 0;
  const count = editor.state.doc.childCount;

  const run = (fn: () => void) => {
    fn();
    setMenuOpen(false);
    lock(false);
  };
  const anchorOf = () => {
    if (!node) return "";
    if (isComponent && typeof node.attrs.anchor === "string" && node.attrs.anchor) return node.attrs.anchor as string;
    if (node.type.name === "heading") return (node.attrs.anchor as string) || slugify(node.textContent, { locale: lang });
    return String(node.attrs.id ?? "");
  };

  return (
    <DragHandle editor={editor} onNodeChange={({ node: n, pos }) => !menuOpen && setTarget(n ? { node: n, pos } : null)} className={cn("vui-drag-handle", className)}>
      <div className="flex items-center gap-0.5" data-slot="block-editor-drag-handle">
        <button
          type="button"
          className="vui-handle-btn focus-ring"
          aria-label={t("insertBelow")}
          title={t("insertBelow")}
          onClick={(e) => target && openInserter({ at: target.pos, anchor: e.currentTarget })}
        >
          <Plus aria-hidden />
        </button>
        <DropdownMenu
          modal={false}
          open={menuOpen}
          onOpenChange={(o) => {
            setMenuOpen(o);
            lock(o);
            if (o && target) selectBlock(editor, target.pos);
          }}
        >
          <DropdownMenuTrigger asChild>
            <button type="button" className="vui-handle-btn vui-handle-grip focus-ring" aria-label={`${t("blockMenu")}: ${title}`} title={t("dragHandle")} data-drag-handle="">
              <GripVertical aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent size="sm" side="left" align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
            <div className="px-2.5 pb-1 pt-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-subtle">{title}</div>
            <DropdownMenuItem icon={<Copy />} shortcut="mod+shift+d" onSelect={() => run(() => target && duplicateBlock(editor, target.pos) && announce(t("announceDuplicated", { title })))}>
              {t("duplicate")}
            </DropdownMenuItem>
            <DropdownMenuItem icon={<ArrowUp />} shortcut="alt+shift+arrowup" disabled={index === 0} onSelect={() => run(() => target && moveBlock(editor, -1, target.pos) && announce(t("announceMovedUp", { title })))}>
              {t("moveUp")}
            </DropdownMenuItem>
            <DropdownMenuItem icon={<ArrowDown />} shortcut="alt+shift+arrowdown" disabled={index >= count - 1} onSelect={() => run(() => target && moveBlock(editor, 1, target.pos) && announce(t("announceMovedDown", { title })))}>
              {t("moveDown")}
            </DropdownMenuItem>
            {textBlock ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger icon={<Repeat2 />}>{t("turnInto")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent size="sm">
                  {turnInto.map((it) => (
                    <DropdownMenuItem
                      key={it.id}
                      icon={<it.icon />}
                      onSelect={() =>
                        run(() => {
                          if (!target) return;
                          editor.chain().focus().setTextSelection(target.pos + 1).run();
                          it.run(editor);
                        })
                      }
                    >
                      {it.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : null}
            <DropdownMenuItem
              icon={<LinkIcon />}
              onSelect={() =>
                run(() => {
                  const a = anchorOf();
                  if (!a) return;
                  const url = typeof location !== "undefined" ? `${location.origin}${location.pathname}#${a}` : `#${a}`;
                  navigator.clipboard?.writeText(url).then(() => announce(t("announceCopied")), () => undefined);
                })
              }
            >
              {t("copyAnchor")}
            </DropdownMenuItem>
            {isComponent && target ? (
              <DropdownMenuItem icon={node?.attrs.hidden ? <Eye /> : <EyeOff />} onSelect={() => run(() => setNodeAttrs(editor, target.pos, { hidden: node?.attrs.hidden ? null : true }))}>
                {node?.attrs.hidden ? t("show") : t("hide")}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<Trash2 />} tone="danger" shortcut="alt+shift+z" onSelect={() => run(() => target && deleteBlock(editor, target.pos) && announce(t("announceDeleted", { title })))}>
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DragHandle>
  );
}
