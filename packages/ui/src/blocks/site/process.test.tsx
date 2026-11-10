import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Steps } from "./process";

const steps = [
  { title: "Discovery", text: "Two hours at your place, not ours.", duration: "Week 1" },
  { title: "Design", text: "Real copy and your own photos from day one.", duration: "Weeks 2–3" },
  { title: "Launch", text: "We watch Search Console daily for thirty days." },
];

describe("Steps", () => {
  it("vertical: an ordered list; numbers are visual; durations as tags; first badge accented", async () => {
    const { container } = render(<main><Steps title="How a project *runs*" steps={steps} /></main>);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("01")).toHaveAttribute("aria-hidden");
    expect(container.querySelector(".vb-step-badge-first")).toHaveTextContent("01");
    expect(screen.getByText("Weeks 2–3")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("horizontal sets the column count; split uses display numbers", async () => {
    const { container, rerender } = render(<main><Steps variant="horizontal" title="Your first visit" steps={steps} /></main>);
    expect((container.querySelector(".vb-steps-h") as HTMLElement).style.getPropertyValue("--vb-steps")).toBe("3");
    expect(container.querySelector(".vb-step-dot-first")).not.toBeNull();
    rerender(<main><Steps variant="split" title="Setup in an afternoon" steps={steps} actions={[{ link: { href: "/signup", label: "Start free" }, style: "primary" }]} /></main>);
    expect(screen.getByText("03")).toHaveClass("font-display");
    expect(screen.getByRole("link", { name: "Start free" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
