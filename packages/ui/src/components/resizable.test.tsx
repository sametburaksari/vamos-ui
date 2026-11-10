import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ResizableGroup, ResizableHandle, ResizablePanel } from "./resizable";

describe("Resizable", () => {
  it("renders panes and a window splitter", async () => {
    const { container } = render(
      <ResizableGroup className="h-96">
        <ResizablePanel id="list" defaultSize="35%" minSize="20%">
          Inbox
        </ResizablePanel>
        <ResizableHandle withGrip aria-label="Resize inbox" />
        <ResizablePanel id="detail">Message</ResizablePanel>
      </ResizableGroup>,
    );
    const sep = screen.getByRole("separator", { name: "Resize inbox" });
    expect(sep).toHaveAttribute("aria-orientation", "vertical");
    expect(sep).toHaveAttribute("tabindex", "0");
    expect(container.querySelector("[data-slot=resizable-group]")).toHaveAttribute("data-orientation", "horizontal");
    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("vertical groups get a horizontal separator; autoSaveId survives missing storage", () => {
    render(
      <ResizableGroup orientation="vertical" autoSaveId="test-editor">
        <ResizablePanel id="a">Editor</ResizablePanel>
        <ResizableHandle aria-label="Resize editor" />
        <ResizablePanel id="b">Preview</ResizablePanel>
      </ResizableGroup>,
    );
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");
  });
});
