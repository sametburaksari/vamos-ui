// Block-level commands on the Tiptap editor: find / select / move / duplicate / delete the
// top-level block around the selection. Every drag action has a keyboard + menu twin here (WCAG 2.5.7).

import type { Editor, JSONContent } from "@tiptap/react";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Node as PMNode } from "@tiptap/pm/model";
import { COMPONENT_BLOCK } from "./convert";

export interface TopBlock {
  /** Position before the node. */
  pos: number;
  node: PMNode;
  index: number;
}

/** The top-level block containing the selection (or the selected top-level node). */
export function getTopBlock(editor: Editor): TopBlock | null {
  const { state } = editor;
  const sel = state.selection;
  if (sel instanceof NodeSelection && sel.$from.depth === 0) {
    return { pos: sel.from, node: sel.node, index: sel.$from.index(0) };
  }
  const $from = sel.$from;
  if ($from.depth < 1) {
    const node = state.doc.nodeAt(sel.from);
    return node ? { pos: sel.from, node, index: $from.index(0) } : null;
  }
  const index = $from.index(0);
  const pos = $from.before(1);
  return { pos, node: state.doc.child(index), index };
}

/** The top-level block at a document position. */
export function topBlockAt(editor: Editor, pos: number): TopBlock | null {
  const doc = editor.state.doc;
  if (pos < 0 || pos > doc.content.size) return null;
  const $pos = doc.resolve(pos);
  if ($pos.depth === 0) {
    const node = doc.nodeAt(pos);
    return node ? { pos, node, index: $pos.index(0) } : null;
  }
  return { pos: $pos.before(1), node: doc.child($pos.index(0)), index: $pos.index(0) };
}

export const isBlockSelection = (editor: Editor) => editor.state.selection instanceof NodeSelection && editor.state.selection.$from.depth === 0;

/** Selects a whole top-level block (block-selection mode). */
export function selectBlock(editor: Editor, pos: number): boolean {
  const node = editor.state.doc.nodeAt(pos);
  if (!node) return false;
  const tr = editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)).scrollIntoView();
  editor.view.dispatch(tr);
  return true;
}

/** Moves the block selection to the previous / next top-level block. */
export function selectSibling(editor: Editor, dir: -1 | 1): TopBlock | null {
  const cur = getTopBlock(editor);
  if (!cur) return null;
  const doc = editor.state.doc;
  const index = cur.index + dir;
  if (index < 0 || index >= doc.childCount) return null;
  let pos = 0;
  for (let i = 0; i < index; i++) pos += doc.child(i).nodeSize;
  selectBlock(editor, pos);
  return { pos, node: doc.child(index), index };
}

/** Leaves block-selection mode: cursor at the end of a text block. */
export function editBlock(editor: Editor): boolean {
  const sel = editor.state.selection;
  if (!(sel instanceof NodeSelection) || sel.node.isAtom || sel.node.isLeaf || sel.node.type.name === COMPONENT_BLOCK) return false;
  const end = sel.from + sel.node.nodeSize - 1;
  const tr = editor.state.tr.setSelection(TextSelection.near(editor.state.doc.resolve(end), -1));
  editor.view.dispatch(tr);
  return true;
}

/** Moves the current top-level block one step up or down. Keeps it selected. */
export function moveBlock(editor: Editor, dir: -1 | 1, at?: number): TopBlock | null {
  const cur = at === undefined ? getTopBlock(editor) : topBlockAt(editor, at);
  if (!cur) return null;
  const doc = editor.state.doc;
  const targetIndex = cur.index + dir;
  if (targetIndex < 0 || targetIndex >= doc.childCount) return null;
  const sibling = doc.child(targetIndex);
  const wasBlockSel = isBlockSelection(editor) || at !== undefined;
  const sel = editor.state.selection;
  const offset = sel.from - cur.pos;
  const tr = editor.state.tr;
  tr.delete(cur.pos, cur.pos + cur.node.nodeSize);
  const insertAt = dir === -1 ? cur.pos - sibling.nodeSize : cur.pos + sibling.nodeSize;
  tr.insert(insertAt, cur.node);
  if (wasBlockSel) tr.setSelection(NodeSelection.create(tr.doc, insertAt));
  else tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(insertAt + offset, tr.doc.content.size))));
  editor.view.dispatch(tr.scrollIntoView());
  return { pos: insertAt, node: cur.node, index: targetIndex };
}

/** JSON of a node with every `id` attribute cleared (the unique-id plugin assigns new ones). */
export function withoutIds(json: JSONContent): JSONContent {
  const out: JSONContent = { ...json };
  if (out.attrs && "id" in out.attrs) out.attrs = { ...out.attrs, id: null };
  if (out.content) out.content = out.content.map(withoutIds);
  return out;
}

/** Duplicates the current top-level block below itself and selects the copy. */
export function duplicateBlock(editor: Editor, at?: number): TopBlock | null {
  const cur = at === undefined ? getTopBlock(editor) : topBlockAt(editor, at);
  if (!cur) return null;
  const copy = editor.schema.nodeFromJSON(withoutIds(cur.node.toJSON() as JSONContent));
  const insertAt = cur.pos + cur.node.nodeSize;
  const tr = editor.state.tr.insert(insertAt, copy);
  tr.setSelection(NodeSelection.create(tr.doc, insertAt));
  editor.view.dispatch(tr.scrollIntoView());
  return { pos: insertAt, node: copy, index: cur.index + 1 };
}

/** Deletes the current top-level block. Selection lands on the neighbour. */
export function deleteBlock(editor: Editor, at?: number): TopBlock | null {
  const cur = at === undefined ? getTopBlock(editor) : topBlockAt(editor, at);
  if (!cur) return null;
  const tr = editor.state.tr.delete(cur.pos, cur.pos + cur.node.nodeSize);
  if (tr.doc.childCount === 0) tr.insert(0, editor.schema.nodes.paragraph!.create());
  const pos = Math.min(cur.pos, tr.doc.content.size);
  tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
  editor.view.dispatch(tr.scrollIntoView());
  return cur;
}

/** Sets attributes of the node at `pos` without losing a node selection on it. */
export function setNodeAttrs(editor: Editor, pos: number, patch: Record<string, unknown>): boolean {
  const node = editor.state.doc.nodeAt(pos);
  if (!node) return false;
  const keepSelection = editor.state.selection instanceof NodeSelection && editor.state.selection.from === pos;
  const tr = editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...patch });
  if (keepSelection) tr.setSelection(NodeSelection.create(tr.doc, pos));
  editor.view.dispatch(tr);
  return true;
}

/** Inserts content after the top-level block at `pos` (or after the current one). */
export function insertAfterBlock(editor: Editor, content: JSONContent | JSONContent[], at?: number): number {
  const cur = at === undefined ? getTopBlock(editor) : topBlockAt(editor, at);
  const doc = editor.state.doc;
  // Replace an empty paragraph instead of leaving it behind.
  if (cur && cur.node.type.name === "paragraph" && cur.node.content.size === 0) {
    editor.chain().insertContentAt({ from: cur.pos, to: cur.pos + cur.node.nodeSize }, content).run();
    return cur.pos;
  }
  const pos = cur ? cur.pos + cur.node.nodeSize : doc.content.size;
  editor.chain().insertContentAt(pos, content).run();
  return pos;
}
