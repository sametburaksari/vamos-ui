import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { SectionHeader } from "./section-header";
import { BlockLink } from "./block-link";

describe("SectionHeader", () => {
  it("renders eyebrow, title with emphasis, lead and actions", async () => {
    const { container } = render(
      <SectionHeader
        index="02"
        eyebrow="Private dining"
        title="Rooms for *twelve* or forty"
        lead="Two rooms upstairs with their own entrance and a set menu built around what came in that morning."
        headingId="rooms"
        actions={<BlockLink href="/events" appearance="primary">Plan an event</BlockLink>}
      />,
    );
    const h = screen.getByRole("heading", { level: 2, name: "Rooms for twelve or forty" });
    expect(h).toHaveAttribute("id", "rooms");
    expect(h.querySelector("em")).toHaveTextContent("twelve");
    expect(screen.getByText("Private dining")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Plan an event" })).toHaveAttribute("href", "/events");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("supports split and center alignment and heading levels", () => {
    const { rerender, container } = render(<SectionHeader title="Menu" align="split" lead="Changes weekly." headingLevel={1} />);
    expect(container.firstChild).toHaveAttribute("data-align", "split");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    rerender(<SectionHeader title="Menu" align="center" size="l" />);
    expect(container.firstChild).toHaveAttribute("data-align", "center");
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-display-l");
  });

  it("shows field placeholders in edit mode", () => {
    render(<SectionHeader editMode />);
    const h = screen.getByRole("heading", { name: "Add a title" });
    expect(h).toHaveAttribute("data-field", "props.title");
    expect(h).toHaveAttribute("data-empty");
  });
});
