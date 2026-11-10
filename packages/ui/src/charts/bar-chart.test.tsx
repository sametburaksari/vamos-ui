import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { BarChart } from "./bar-chart";
import { BarList } from "./bar-list";
import { mockChartSize } from "./test-utils";

const reps = [
  { rep: "Maya Chen", won: 184000, lost: 42000 },
  { rep: "Diego Alvarez", won: 152500, lost: 61000 },
  { rep: "Priya Raman", won: 98000, lost: 23000 },
];
const config = { won: { label: "Won", format: "currency" as const }, lost: { label: "Lost", format: "currency" as const } };

describe("BarChart", () => {
  let restore: () => void;
  beforeEach(() => (restore = mockChartSize()));
  afterEach(() => restore());

  it("renders grouped bars and passes axe", async () => {
    const { container } = render(<BarChart title="Deals by rep" data={reps} x="rep" config={config} animate={false} />);
    expect(container.querySelectorAll(".recharts-bar")).toHaveLength(2);
    expect(container.querySelectorAll(".recharts-bar-rectangle").length).toBeGreaterThanOrEqual(6);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("dims bars outside the highlight", () => {
    const { container } = render(<BarChart title="Won" data={reps} x="rep" config={{ won: config.won }} highlight={(r) => r.rep === "Maya Chen"} animate={false} />);
    const fills = [...container.querySelectorAll(".recharts-bar-rectangle path")].map((p) => p.getAttribute("fill"));
    expect(fills[0]).toBe("var(--series-won)");
    expect(fills[1]).toContain("35%");
  });

  it("lays out horizontally with category ticks", () => {
    const { container } = render(<BarChart title="Won" data={reps} x="rep" layout="horizontal" config={{ won: config.won }} animate={false} />);
    const yTicks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")].map((n) => n.textContent?.replace(/\s/g, ""));
    expect(yTicks).toContain("MayaChen");
  });

  it("draws a zero line for negative values", () => {
    const pnl = [{ m: "Jan", p: 1200 }, { m: "Feb", p: -800 }, { m: "Mar", p: 400 }];
    const { container } = render(<BarChart title="Profit" data={pnl} x="m" config={{ p: { label: "Profit", format: "currency" } }} animate={false} />);
    expect(container.querySelector(".recharts-reference-line")).toBeInTheDocument();
  });
});

describe("BarList", () => {
  const sources = [
    { key: "google", label: "Google", value: 4120, delta: 0.12 },
    { key: "direct", label: "Direct", value: 2380 },
    { key: "linkedin", label: "LinkedIn", value: 960, delta: -0.04 },
    { key: "newsletter", label: "Newsletter", value: 610 },
    { key: "bing", label: "Bing", value: 140 },
  ];

  it("is an ordered list with full row text, sorted and grouped", async () => {
    const { container } = render(<BarList aria-label="Top sources" data={sources} max={3} showShare />);
    const list = screen.getByRole("list", { name: "Top sources" });
    const items = list.querySelectorAll("li");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent(/Google, 4,120, 50(\.\d)?%, \+12%/);
    expect(screen.getByText("Other (2)", { selector: "span" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("activates rows with the keyboard", async () => {
    const user = userEvent.setup();
    const onItem = vi.fn();
    render(<BarList aria-label="Top sources" data={sources} onItemClick={onItem} />);
    const google = screen.getByRole("button", { name: /^Google, 4,120/ });
    google.focus();
    await user.keyboard("{Enter}");
    expect(onItem).toHaveBeenCalledWith(sources[0]);
  });

  it("shows loading and empty states", () => {
    const { rerender } = render(<BarList data={sources} loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<BarList data={[]} emptyMessage="No referrers yet" />);
    expect(screen.getByText("No referrers yet")).toBeInTheDocument();
  });
});
