import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { AreaChart } from "./area-chart";
import { mockChartSize } from "./test-utils";

const traffic = [
  { date: "2026-11-01", visits: 1180, reads: 640, prev: 1010 },
  { date: "2026-11-02", visits: 1320, reads: 702, prev: 1100 },
  { date: "2026-11-03", visits: 1402, reads: 811, prev: 1190 },
  { date: "2026-11-04", visits: 1265, reads: 690, prev: 1220 },
];
const config = { visits: { label: "Visits" }, reads: { label: "Full reads" }, prev: { label: "Previous period" } };

let restore: () => void;
beforeEach(() => (restore = mockChartSize()));
afterEach(() => restore());

describe("AreaChart", () => {
  it("draws one area per series with token colours and is accessible", async () => {
    const { container } = render(<AreaChart title="Traffic" data={traffic} x="date" config={config} series={["visits", "reads"]} animate={false} />);
    expect(container.querySelectorAll(".recharts-area")).toHaveLength(2);
    const curve = container.querySelector(".recharts-area-curve");
    expect(curve).toHaveAttribute("stroke", "var(--series-visits)");
    expect(screen.getByRole("figure", { name: "Traffic" })).toHaveAccessibleDescription(/Visits: low 1,180 \(Nov 1\), high 1,402 \(Nov 3\)/);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses unique gradient ids for two charts on one page", () => {
    const { container } = render(
      <>
        <AreaChart title="A" data={traffic} x="date" config={{ visits: { label: "Visits" } }} animate={false} />
        <AreaChart title="B" data={traffic} x="date" config={{ visits: { label: "Visits" } }} animate={false} />
      </>,
    );
    const ids = [...container.querySelectorAll("linearGradient")].map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("renders the comparison series dashed and unfilled", () => {
    const { container } = render(<AreaChart title="Traffic" data={traffic} x="date" config={config} series={["visits", "prev"]} compare={{ key: "prev" }} animate={false} />);
    const curves = container.querySelectorAll(".recharts-area-curve");
    expect(curves[1]).toHaveAttribute("stroke-dasharray", "4 4");
  });

  it("hides a series from the legend with the keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(<AreaChart title="Traffic" data={traffic} x="date" config={config} series={["visits", "reads"]} animate={false} />);
    const toggle = within(screen.getByRole("group", { name: "Series" })).getByRole("button", { name: "Full reads" });
    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelectorAll(".recharts-area-curve")).toHaveLength(1);
  });

  it("stacks to 100% with percent ticks", () => {
    const { container } = render(<AreaChart title="Mix" data={traffic} x="date" config={config} series={["visits", "reads"]} stack="percent" animate={false} />);
    const ticks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")].map((n) => n.textContent);
    expect(ticks.some((t) => t?.includes("%"))).toBe(true);
  });
});
