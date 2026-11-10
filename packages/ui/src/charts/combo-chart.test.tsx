import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ComboChart } from "./combo-chart";
import { mockChartSize } from "./test-utils";

const rows = [
  { month: "Jun", quotes: 42, winRate: 0.31 },
  { month: "Jul", quotes: 51, winRate: 0.35 },
  { month: "Aug", quotes: 47, winRate: 0.29 },
];
const config = { quotes: { label: "Quotes sent", format: "integer" as const }, winRate: { label: "Win rate", format: "percent" as const } };

let restore: () => void;
beforeEach(() => (restore = mockChartSize()));
afterEach(() => restore());

describe("ComboChart", () => {
  it("draws bars on the start axis and a line on the end axis", async () => {
    const { container } = render(<ComboChart title="Quotes and win rate" data={rows} x="month" bars={["quotes"]} lines={["winRate"]} config={config} startAxisLabel="Quotes" endAxisLabel="Win rate" animate={false} />);
    expect(container.querySelectorAll(".recharts-bar")).toHaveLength(1);
    expect(container.querySelectorAll(".recharts-line-curve")).toHaveLength(1);
    expect(container.querySelectorAll(".recharts-yAxis")).toHaveLength(2);
    const ticks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")].map((n) => n.textContent);
    expect(ticks).toEqual(expect.arrayContaining(["0", "15", "30", "45", "60", "0%", "10%", "40%"]));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("lists both units in the data table", () => {
    render(<ComboChart title="Quotes" data={rows} x="month" bars={["quotes"]} lines={["winRate"]} config={config} animate={false} />);
    expect(screen.getByRole("columnheader", { name: "Win rate" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "35%" })).toBeInTheDocument();
  });

  it("can hide the end axis", () => {
    const { container } = render(<ComboChart title="Quotes" data={rows} x="month" bars={["quotes"]} lines={["winRate"]} config={config} endAxis={false} animate={false} />);
    const ticks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")].map((n) => n.textContent);
    expect(ticks.some((t) => t?.includes("%"))).toBe(false);
  });
});
