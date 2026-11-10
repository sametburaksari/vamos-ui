import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { LineChart } from "./line-chart";
import { mockChartSize } from "./test-utils";

const rows = [
  { month: "Jul", maya: 0.31, diego: 0.24, priya: 0.28 },
  { month: "Aug", maya: 0.34, diego: 0.27, priya: 0.26 },
  { month: "Sep", maya: 0.36, diego: 0.29, priya: 0.31 },
];
const config = { maya: { label: "Maya", format: "percent" as const }, diego: { label: "Diego", format: "percent" as const }, priya: { label: "Priya", format: "percent" as const } };

let restore: () => void;
beforeEach(() => (restore = mockChartSize()));
afterEach(() => restore());

describe("LineChart", () => {
  it("draws a line per series with percent ticks", async () => {
    const { container } = render(<LineChart title="Win rate" data={rows} x="month" config={config} animate={false} />);
    expect(container.querySelectorAll(".recharts-line-curve")).toHaveLength(3);
    const ticks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")].map((n) => n.textContent);
    expect(ticks).toContain("30%");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("writes end labels instead of a legend", () => {
    const { container } = render(<LineChart title="Win rate" data={rows} x="month" config={config} endLabels animate={false} />);
    expect(screen.queryByRole("group", { name: "Series" })).not.toBeInTheDocument();
    const labels = [...container.querySelectorAll(".vui-chart-end-label")].map((n) => n.textContent);
    expect(labels).toEqual(["Maya", "Diego", "Priya"]);
  });

  it("marks only the last point by default", () => {
    const { container } = render(<LineChart title="Win rate" data={rows} x="month" config={{ maya: config.maya }} animate={false} />);
    expect(container.querySelectorAll(".recharts-line-dots circle")).toHaveLength(1);
  });
});
