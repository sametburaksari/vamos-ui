import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { BlockHeading, renderEmphasis } from "./block-heading";

describe("BlockHeading", () => {
  it("parses one *emphasis* into <em> and keeps the accessible name clean", async () => {
    const { container } = render(<BlockHeading level={1} size="display-xl" text="Dinner, *slowly*." />);
    const h = screen.getByRole("heading", { level: 1, name: "Dinner, slowly." });
    expect(h).toHaveClass("vb-heading", "font-display", "text-display-xl");
    expect(h.querySelector("em")).toHaveTextContent("slowly");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("passes ReactNodes through and renders nothing when empty (view mode)", () => {
    const { container, rerender } = render(<BlockHeading><span>Our *kitchen*</span></BlockHeading>);
    expect(container.querySelector("em")).toBeNull();
    rerender(<BlockHeading text="" />);
    expect(container.querySelector("h2")).toBeNull();
  });

  it("renders a translated placeholder in edit mode", () => {
    render(<BlockHeading editMode field="props.title" labels={{ addTitle: "Başlık ekleyin" }} />);
    expect(screen.getByRole("heading", { name: "Başlık ekleyin" })).toHaveAttribute("data-field", "props.title");
  });

  it("renderEmphasis returns plain strings untouched", () => {
    expect(renderEmphasis("No stars")).toBe("No stars");
  });
});
