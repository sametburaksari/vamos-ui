import "./_test-setup";
import * as React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import type { RichDoc } from "../blocks/schema/rich-doc";
import { Field } from "../components/input";
import { RichTextEditor } from "./block-editor";

const note: RichDoc = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ text: "Called Deniz about the " }, { text: "Q3 renewal", marks: [{ type: "bold" }] }, { text: "." }] },
    { type: "list", items: [{ content: [{ type: "paragraph", content: [{ text: "Send the revised quote" }] }] }] },
  ],
};

async function setup(props: Partial<React.ComponentProps<typeof RichTextEditor>> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <Field label="Activity note" hint="Visible to the account team." error={props.invalid ? "Add a note before saving." : undefined}>
      <RichTextEditor defaultValue={note} onChange={onChange} size="sm" {...props} />
    </Field>,
  );
  const box = await screen.findByRole("textbox", { name: "Activity note" });
  await waitFor(() => expect(box.textContent).toContain("Called Deniz"));
  return { ...utils, box, onChange };
}

describe("RichTextEditor", () => {
  it("is labelled and described by its Field", async () => {
    const { box } = await setup();
    expect(box).toHaveAccessibleDescription("Visible to the account team.");
    expect(within(box).getByText("Q3 renewal").tagName).toBe("STRONG");
  });

  it("has no axe violations (with toolbar and error)", async () => {
    const { container, box } = await setup({ invalid: true });
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("toolbar toggles marks and moves with arrow keys", async () => {
    const { box } = await setup();
    const toolbar = screen.getByRole("toolbar", { name: "Text formatting" });
    const bold = within(toolbar).getByRole("button", { name: "Bold" });
    const italic = within(toolbar).getByRole("button", { name: "Italic" });
    act(() => box.focus());
    fireEvent.click(bold);
    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "true"));
    const turnInto = within(toolbar).getByRole("button", { name: /Turn into/ });
    turnInto.focus();
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(document.activeElement).toBe(bold);
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(document.activeElement).toBe(italic);
    fireEvent.keyDown(toolbar, { key: "Home" });
    expect(document.activeElement).toBe(turnInto);
  });

  it("emits a RichDoc", async () => {
    const { box, onChange } = await setup();
    act(() => box.focus());
    fireEvent.click(within(screen.getByRole("toolbar")).getByRole("button", { name: "Quote" }));
    await waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 1500 });
    const doc = onChange.mock.calls.at(-1)![0] as RichDoc;
    expect(doc.type).toBe("doc");
    expect(doc.content.some((b) => b.type === "blockquote")).toBe(true);
  });

  it("read-only hides the toolbar", async () => {
    const { box } = await setup({ readOnly: true });
    expect(box).toHaveAttribute("contenteditable", "false");
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
});
