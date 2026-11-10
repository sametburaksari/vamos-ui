import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Sparkline, sparklineColor, sparklineDirection, sparklineSummary } from "./sparkline";

describe("Sparkline", () => {
  it("is decorative by default and an image with a label", async () => {
    const { container } = render(
      <div>
        <Sparkline values={[4, 6, 5, 8, 7, 9, 12, 11, 14]} data-testid="deco" />
        <Sparkline values={[4, 6, 14]} label="Rose from 4 to 14, peak 14" />
      </div>,
    );
    expect(screen.getByTestId("deco")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img", { name: "Rose from 4 to 14, peak 14" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("draws every variant, sizes and null gaps", () => {
    const { container } = render(
      <div>
        <Sparkline values={[1, 3, null, 4, 6]} data-testid="line" />
        <Sparkline values={[1, 3, 2]} variant="area" size="md" data-testid="area" />
        <Sparkline values={[1, 3, 2, 5]} variant="bars" size="xs" data-testid="bars" />
        <Sparkline values={[1, -1, 0, 2]} variant="winloss" data-testid="wl" />
      </div>,
    );
    // null splits the line into two segments
    expect(screen.getByTestId("line").querySelectorAll('path[fill="none"]')).toHaveLength(2);
    expect(screen.getByTestId("area").querySelector("linearGradient")).not.toBeNull();
    expect(screen.getByTestId("area")).toHaveAttribute("width", "160");
    expect(screen.getByTestId("bars").querySelectorAll("rect")).toHaveLength(4);
    expect(screen.getByTestId("bars")).toHaveAttribute("height", "20");
    const fills = [...screen.getByTestId("wl").querySelectorAll("rect")].map((r) => r.getAttribute("fill"));
    expect(fills).toEqual(["var(--success)", "var(--danger)", "var(--fg-subtle)", "var(--success)"]);
    expect(container.querySelectorAll("svg")).toHaveLength(4);
  });

  it("handles empty, single and flat series", () => {
    render(
      <div>
        <Sparkline values={[]} data-testid="empty" />
        <Sparkline values={[7]} data-testid="one" />
        <Sparkline values={[5, 5, 5]} data-testid="flat" />
      </div>,
    );
    expect(screen.getByTestId("empty").querySelector("line")).toHaveAttribute("stroke-dasharray", "2 3");
    expect(screen.getByTestId("one").querySelector("path")?.getAttribute("d")).toMatch(/^M/);
    // flat → middle line (y = 16 of 32)
    expect(screen.getByTestId("flat").querySelector('path[fill="none"]')?.getAttribute("d")).toContain(" 16.00");
  });

  it("fluid width, token colour, reference and markers", () => {
    render(<Sparkline values={[2, 8, 4, 9]} width="100%" color="chart-2" reference={5} showLast showMinMax data-testid="s" />);
    const svg = screen.getByTestId("s");
    expect(svg).toHaveAttribute("width", "100%");
    expect(svg).toHaveAttribute("preserveAspectRatio", "none");
    expect(svg.style.color).toBe("var(--chart-2)");
    expect(svg.querySelector('[data-slot="sparkline-reference"]')).not.toBeNull();
    // last + min + max dots are zero-length round-capped paths
    expect(svg.querySelectorAll('path[stroke-linecap="round"][d$="h0"]')).toHaveLength(3);
  });

  it("helpers", () => {
    expect(sparklineColor("success")).toBe("var(--success)");
    expect(sparklineColor("#123")).toBe("#123");
    expect(sparklineDirection([3, 1, 9])).toBe(1);
    expect(sparklineDirection([9, 1, 3])).toBe(-1);
    expect(sparklineDirection([4])).toBe(0);
    expect(sparklineSummary([4, 6, 14, 11, 14])).toBe("Rose from 4 to 14, peak 14");
    expect(sparklineSummary([9, 3, 5])).toBe("Fell from 9 to 5, low 3");
    expect(sparklineSummary([])).toBe("No data");
  });
});
