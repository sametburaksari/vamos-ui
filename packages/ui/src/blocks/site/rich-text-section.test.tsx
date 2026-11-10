import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { RichTextSection } from "./rich-text-section";
import type { RichDoc } from "../schema/rich-doc";

const doc: RichDoc = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ text: "Kıyı opened in 2011 as a six-table meyhane." }] },
    { type: "heading", level: 2, content: [{ text: "The slate" }] },
    { type: "paragraph", content: [{ text: "Read the " }, { text: "privacy notice", marks: [{ type: "link", href: "/privacy" }] }, { text: "." }] },
  ],
};

describe("RichTextSection", () => {
  it("column: body headings shift below the block title; drop cap class", async () => {
    const { container } = render(<main><RichTextSection title="How we *started*" body={doc} dropCap /></main>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("How we started");
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("The slate");
    expect(container.querySelector(".vb-dropcap")).not.toBeNull();
    expect(screen.getByRole("link", { name: "privacy notice" })).toHaveAttribute("href", "/privacy");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("without a title the body keeps its levels; aside-heading and two-column layouts", async () => {
    const { container, rerender } = render(<main><RichTextSection body={doc} /></main>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("The slate");
    rerender(<main><RichTextSection variant="aside-heading" title="Privacy notice" note="Last updated 4 November 2026" body={doc} /></main>);
    expect(screen.getByText("Last updated 4 November 2026")).toBeInTheDocument();
    rerender(<main><RichTextSection variant="two-column" body={"First paragraph.\n\nSecond paragraph."} /></main>);
    expect(container.querySelector(".vb-prose-columns")?.querySelectorAll("p")).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });
});
