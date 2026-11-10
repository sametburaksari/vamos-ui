import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Separator } from "./separator";

describe("Separator", () => {
  it("is decorative by default", async () => {
    const { container } = render(<div><p>Profile</p><Separator /><p>Security</p></div>);
    expect(screen.queryByRole("separator")).toBeNull();
    expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute("data-orientation", "horizontal");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("exposes role separator and orientation when not decorative", () => {
    render(<Separator orientation="vertical" decorative={false} />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders a readable label between two lines", async () => {
    const { container } = render(<Separator label="or continue with" />);
    expect(screen.getByText("or continue with")).toBeVisible();
    expect(container.querySelectorAll('[data-orientation="horizontal"]').length).toBeGreaterThanOrEqual(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("supports tone and inset", () => {
    render(<Separator tone="nav" inset data-testid="s" />);
    expect(screen.getByTestId("s").className).toMatch(/bg-nav-line/);
  });
});
