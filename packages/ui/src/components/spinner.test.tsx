import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("is decorative without a label", async () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("announces its label politely", async () => {
    const { container } = render(<Spinner label="Loading orders" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Loading orders");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("maps sizes and accepts pixel numbers", () => {
    const { container, rerender } = render(<Spinner size="lg" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "28");
    rerender(<Spinner size={40} />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "40");
  });

  it("can delay its appearance with CSS only", () => {
    const { container } = render(<Spinner delay={300} tone="accent" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveClass("ui-spinner-delayed", "text-accent-ink");
    expect(svg.style.getPropertyValue("--spinner-delay")).toBe("300ms");
  });
});
