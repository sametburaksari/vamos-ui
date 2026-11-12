"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { BlockRegistry } from "../blocks/schema/define-block";
import type { VamosDoc } from "../blocks/schema/types";
import type { MediaAdapter } from "../media/types";
import type { LabelFn } from "../lib/labels";
import type { BlockEditorLabels } from "./labels";

export type BlockEditorVariant = "document" | "canvas" | "rich-text";

export interface BlockPattern {
  id: string;
  title: string;
  category: string;
  description?: string;
  doc: VamosDoc;
}

export interface LinkSuggestion {
  title: string;
  href: string;
  type: string;
}

/** Uploads a dropped / pasted image and returns what the image node stores. */
export type ImageUploader = (file: File, opts: { signal: AbortSignal; onProgress?: (p: { loaded: number; total: number }) => void }) => Promise<{
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  assetId?: string;
}>;

/** State of the "/" menu, written by the suggestion plugin and read by `BlockEditorSlashMenu`. */
export interface SlashState {
  query: string;
  range: { from: number; to: number };
  rect: DOMRect | null;
}

export interface SlashStore {
  get(): SlashState | null;
  set(s: SlashState | null): void;
  subscribe(cb: () => void): () => void;
  /** Keydown forwarded from the editor while the menu is open. Returns true when handled. */
  keydown: { current: ((e: KeyboardEvent) => boolean) | null };
  close: { current: (() => void) | null };
}

export function createSlashStore(): SlashStore {
  let state: SlashState | null = null;
  const subs = new Set<() => void>();
  return {
    get: () => state,
    set(s) {
      state = s;
      subs.forEach((cb) => cb());
    },
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    keydown: { current: null },
    close: { current: null },
  };
}

export interface InserterRequest {
  /** Insert after the top-level block at this position. Default: after the current block. */
  at?: number;
  /** Element the popover anchors to (the "+" that opened it). Default: the block at `at`. */
  anchor?: HTMLElement | null;
}

export interface BlockEditorContextValue {
  editor: Editor | null;
  registry: BlockRegistry;
  variant: BlockEditorVariant;
  size: "sm" | "md";
  readOnly: boolean;
  lang: string;
  t: LabelFn<BlockEditorLabels>;
  allowedTypes: (parentType?: string) => string[] | null;
  patterns: BlockPattern[];
  media?: MediaAdapter;
  uploadImage?: ImageUploader;
  linkSearch?: (q: string) => Promise<LinkSuggestion[]>;
  slash: SlashStore;
  announce: (message: string) => void;
  /** Opens the inserter (drag handle "+", empty-state hint). */
  openInserter: (req?: InserterRequest) => void;
  inserter: { open: boolean; at?: number; anchor?: HTMLElement | null; setOpen: (open: boolean) => void };
  /** Bubble/fixed toolbar registers itself so Alt+F10 can focus it. */
  toolbarRef: React.MutableRefObject<HTMLElement | null>;
  editorLabel: string;
  canvasTheme?: { accent?: string; font?: string; density?: string; theme?: "light" | "dark" };
  placeholder?: string;
  /** Field wiring for the rich-text variant (id, aria-describedby, invalid). */
  a11y?: { id?: string; describedBy?: string; invalid?: boolean; required?: boolean; labelledBy?: string };
}

export const BlockEditorContext = /*#__PURE__*/ React.createContext<BlockEditorContextValue | null>(null);

/** The surrounding `BlockEditor` (editor instance, registry, labels…). */
export function useBlockEditor(): BlockEditorContextValue {
  const ctx = React.useContext(BlockEditorContext);
  if (!ctx) throw new Error("Block editor parts must be rendered inside <BlockEditor>.");
  return ctx;
}

export function useSlashState(store: SlashStore): SlashState | null {
  return React.useSyncExternalStore(store.subscribe, store.get, () => null);
}
