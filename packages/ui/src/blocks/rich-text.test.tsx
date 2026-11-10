import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { RichText } from "./rich-text";
import type { RichDoc } from "./schema/rich-doc";

const doc: RichDoc = {
  type: "doc",
  content: [
    { type: "heading", level: 2, anchor: "hours", content: [{ text: "Opening hours" }] },
    {
      type: "paragraph",
      content: [
        { text: "Kitchen open until " },
        { text: "23:00", marks: [{ type: "bold" }] },
        { type: "br" },
        { text: "Read the " },
        { text: "full ", marks: [{ type: "link", href: "/menu" }] },
        { text: "menu", marks: [{ type: "link", href: "/menu" }, { type: "italic" }] },
        { text: " or " },
        { text: "evil", marks: [{ type: "link", href: "javascript:alert(1)" }] },
      ],
    },
    { type: "list", ordered: true, start: 3, items: [{ content: [{ type: "paragraph", content: [{ text: "Meze" }] }] }, { content: [{ type: "paragraph", content: [{ text: "Grill" }] }] }] },
    { type: "blockquote", cite: "Ayşe K., head chef", content: [{ type: "paragraph", content: [{ text: "We cook what the boats bring." }] }] },
    { type: "code", text: "GET /api/menu", language: "http" },
    { type: "hr" },
  ],
};

describe("RichText", () => {
  it("renders every node and mark with semantics", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<RichText doc={doc} />);
    expect(screen.getByRole("heading", { level: 2, name: "Opening hours" })).toHaveAttribute("id", "hours");
    expect(container.querySelector("strong")).toHaveTextContent("23:00");
    expect(container.querySelector("br")).not.toBeNull();
    // consecutive runs with the same link merge into one anchor
    const link = screen.getByRole("link", { name: "full menu" });
    expect(link).toHaveAttribute("href", "/menu");
    expect(link.querySelector("em")).toHaveTextContent("menu");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(container.querySelector("ol")).toHaveAttribute("start", "3");
    expect(container.querySelector("blockquote footer")).toHaveTextContent("Ayşe K., head chef");
    expect(container.querySelector("pre")).toHaveAttribute("data-language", "http");
    expect(container.firstChild).toHaveClass("prose-ui", "vb-prose");
    expect(await axe(container)).toHaveNoViolations();
    warn.mockRestore();
  });

  it("accepts plain text and inline runs, and shifts heading levels", () => {
    const { container, rerender } = render(<RichText doc={"First line\nsecond line\n\nNew paragraph"} />);
    expect(container.querySelectorAll("p")).toHaveLength(2);
    rerender(<RichText doc={[{ text: "Just " }, { text: "inline", marks: [{ type: "code" }] }]} />);
    expect(container.querySelector("code")).toHaveTextContent("inline");
    rerender(<RichText doc={doc} headingOffset={1} />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  it("renders nothing when empty, a placeholder in edit mode", () => {
    const { container, rerender } = render(<RichText doc="" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<RichText doc="" editMode field="props.body" />);
    expect(screen.getByText("Add text").parentElement).toHaveAttribute("data-field", "props.body");
  });
});
