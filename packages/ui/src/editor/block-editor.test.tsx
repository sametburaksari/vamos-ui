import "./_test-setup";
import * as React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { NodeSelection } from "@tiptap/pm/state";
import type { VamosDoc } from "../blocks/schema/types";
import { testRegistry } from "../render/_fixtures";
import { BlockEditor, BlockEditorContent, type BlockEditorHandle } from "./block-editor";
import { BlockInspector } from "./inspector";
import { BlockEditorOutline } from "./outline";
import { BlockEditorSlashMenu } from "./slash-menu";
import { selectBlock } from "./commands";

const doc: VamosDoc = {
  version: 1,
  lang: "en",
  blocks: [
    { id: "b_head01", type: "heading", props: { level: 2 }, content: [{ text: "Spring menu" }] },
    { id: "b_para01", type: "paragraph", content: [{ text: "We open at " }, { text: "6 pm", marks: [{ type: "bold" }] }, { text: " from Tuesday to Sunday." }] },
    {
      id: "b_faq001",
      type: "faq",
      v: 1,
      props: { title: "Before you *book*", items: [{ q: "Do you take walk-ins?", a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Yes, at the bar." }] }] } }] },
    },
    { id: "b_gone01", type: "booking-widget", v: 2, props: { venue: "kadikoy" } },
  ],
};

async function setup(ui?: React.ReactNode, props: Partial<React.ComponentProps<typeof BlockEditor>> = {}, waitText = "We open at") {
  const ref = React.createRef<BlockEditorHandle>();
  const onChange = vi.fn();
  const utils = render(
    <BlockEditor defaultValue={doc} registry={testRegistry} lang="en" editorRef={ref} onChange={onChange} {...props}>
      {ui}
    </BlockEditor>,
  );
  const box = await screen.findByRole("textbox", { name: "Content" });
  await waitFor(() => expect(box.textContent).toContain(waitText));
  return { ...utils, ref, onChange, box, editor: () => ref.current!.editor! };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const caretIn = (editor: any, text: string) => {
  let at = -1;
  editor.state.doc.descendants((n: any, pos: number) => {
    if (at < 0 && n.isText && n.text.includes(text)) at = pos + 1;
  });
  act(() => {
    (editor.view.dom as HTMLElement).focus();
    editor.commands.setTextSelection(at);
  });
};

describe("BlockEditor", () => {
  it("renders text blocks inline and page blocks with the site component", async () => {
    const { box } = await setup();
    expect(within(box).getByRole("heading", { level: 2, name: "Spring menu" })).toBeInTheDocument();
    // The FAQ block renders through the registry, the same component as the site.
    expect(within(box).getByRole("group", { name: "FAQ" })).toHaveTextContent("Do you take walk-ins?");
    // Unknown blocks keep their data and show a placeholder.
    expect(within(box).getByRole("note")).toHaveTextContent("Unknown block “booking-widget”");
    expect(box).toHaveAttribute("aria-multiline", "true");
    expect(box).toHaveAttribute("lang", "en");
  });

  it("has no axe violations", async () => {
    const { container } = await setup();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("emits a debounced VamosDoc and keeps unknown blocks", async () => {
    const { ref, onChange, editor } = await setup();
    caretIn(editor(), "Tuesday");
    act(() => {
      editor().commands.insertContent(" Closed on Mondays.");
    });
    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1), { timeout: 1500 });
    const [next, info] = onChange.mock.calls[0]!;
    expect(next.blocks.map((b: { id: string }) => b.id)).toEqual(["b_head01", "b_para01", "b_faq001", "b_gone01"]);
    expect(next.blocks[3]).toEqual(doc.blocks[3]);
    expect(info.changedBlockIds).toEqual(["b_para01"]);
    expect(info.wordCount).toBeGreaterThan(5);
    expect(ref.current!.getDoc().blocks[1]!.content!.at(-1)).toMatchObject({ text: expect.stringContaining("Mondays") });
  });

  it("Esc selects the block; Alt+Shift+Arrow moves it; mod+shift+d duplicates", async () => {
    const { editor, box, ref } = await setup();
    caretIn(editor(), "We open");
    fireEvent.keyDown(box, { key: "Escape" });
    expect(editor().state.selection).toBeInstanceOf(NodeSelection);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Text selected"));

    fireEvent.keyDown(box, { key: "ArrowUp", altKey: true, shiftKey: true });
    expect(ref.current!.getDoc().blocks.map((b) => b.id).slice(0, 2)).toEqual(["b_para01", "b_head01"]);

    fireEvent.keyDown(box, { key: "ArrowDown" });
    expect((editor().state.selection as NodeSelection).node.type.name).toBe("heading");

    fireEvent.keyDown(box, { key: "d", ctrlKey: true, shiftKey: true });
    await waitFor(() => expect(ref.current!.getDoc().blocks.filter((b) => b.type === "heading")).toHaveLength(2));
  });

  it("inserts blocks from the slash menu with the keyboard", async () => {
    const { editor, box, ref } = await setup(
      <>
        <BlockEditorContent />
        <BlockEditorSlashMenu />
      </>,
    );
    caretIn(editor(), "Tuesday");
    act(() => {
      editor().commands.enter();
      editor().commands.insertContent("/head");
    });
    const list = await screen.findByRole("listbox", { name: "Add block" });
    expect(within(list).getByRole("option", { name: /Heading 1/ })).toHaveAttribute("aria-selected", "true");
    expect(box).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(box, { key: "ArrowDown" });
    expect(within(list).getByRole("option", { name: /Heading 2/ })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(box.getAttribute("aria-activedescendant")).toBe(within(list).getByRole("option", { name: /Heading 2/ }).id));
    fireEvent.keyDown(box, { key: "Enter" });
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    const blocks = ref.current!.getDoc().blocks;
    expect(blocks.filter((b) => b.type === "heading" && (b.props as { level: number }).level === 2 && !b.content?.length)).toHaveLength(1);
    expect(blocks.some((b) => b.content?.some((r) => "text" in r && r.text.includes("/head")))).toBe(false);
  });

  it("edits page block props in the inspector", async () => {
    const { editor, box } = await setup(
      <>
        <BlockEditorContent />
        <aside aria-label="Block settings">
          <BlockInspector />
        </aside>
      </>,
    );
    const panel = screen.getByRole("complementary", { name: "Block settings" });
    expect(within(panel).getByText("Select a block")).toBeInTheDocument();
    let faqPos = -1;
    editor().state.doc.forEach((n, pos) => {
      if (n.attrs.blockType === "faq") faqPos = pos;
    });
    act(() => {
      selectBlock(editor(), faqPos);
    });
    const title = await within(panel).findByRole("textbox", { name: /Title/ });
    expect(title).toHaveValue("Before you *book*");
    fireEvent.change(title, { target: { value: "Good to *know*" } });
    await waitFor(() => expect(within(box).getByRole("group", { name: "FAQ" })).toHaveTextContent("Good to know"));
    expect(await axe(panel)).toHaveNoViolations();
  });

  it("outlines headings and warns on skipped levels", async () => {
    await setup(
      <>
        <BlockEditorContent />
        <BlockEditorOutline />
      </>,
      { defaultValue: { version: 1, blocks: [{ id: "b_h2xxxx", type: "heading", props: { level: 2 }, content: [{ text: "Menu" }] }, { id: "b_h4xxxx", type: "heading", props: { level: 4 }, content: [{ text: "Desserts" }] }] } },
      "Desserts",
    );
    const nav = await screen.findByRole("navigation", { name: "Outline" });
    expect(within(nav).getByRole("button", { name: /Menu/ })).toBeInTheDocument();
    expect(nav).toHaveTextContent("Skipped level: H2 → H4");
    expect(nav).toHaveTextContent("2 words");
  });

  it("is read-only when asked", async () => {
    const { box } = await setup(undefined, { readOnly: true });
    expect(box).toHaveAttribute("contenteditable", "false");
    expect(box).toHaveAttribute("aria-readonly", "true");
    expect(screen.queryByRole("button", { name: "Add block" })).not.toBeInTheDocument();
  });
});
