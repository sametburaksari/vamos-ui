import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Area, AreaChart as RAreaChart } from "recharts";
import { LocaleProvider } from "../lib/locale";
import { createFormatter } from "../format/core";
import { Chart, ChartDataTable } from "./chart-shell";
import { ChartFrame, ChartGrid, ChartTooltip, ChartXAxis, ChartYAxis } from "./chart";
import { alignZeroDomains, alignedAxes, formatValue, resolveChartColor, resolveSeries, seriesPalette, summarizeSeries } from "./utils";
import { mockChartSize } from "./test-utils";

const rows = [
  { date: "2026-11-01", revenue: 1240.5, refunds: 80 },
  { date: "2026-11-02", revenue: 980, refunds: 40 },
  { date: "2026-11-03", revenue: 1610, refunds: 120 },
];
const config = { revenue: { label: "Revenue", format: "currency" as const }, refunds: { label: "Refunds", format: "currency" as const } };

describe("chart utils", () => {
  it("resolves tokens and palettes", () => {
    expect(resolveChartColor("chart-2")).toBe("var(--chart-2)");
    expect(seriesPalette(7)).toEqual(["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-1"]);
    const four = resolveSeries({ a: { label: "A" }, b: { label: "B" }, c: { label: "C" }, d: { label: "D" } });
    expect(four.map((s) => s.pattern)).toEqual(["solid", "dashed", "dotted", "solid"]);
  });

  it("formats in en-US and tr-TR, compact for axes", () => {
    const en = createFormatter("en-US", { currency: "USD" });
    const tr = createFormatter("tr-TR", { currency: "TRY", timeZone: "Europe/Istanbul" });
    expect(formatValue(en, "currency", 1234.5)).toBe("$1,234.50");
    expect(formatValue(en, "currency", 1_200_000, { compact: true })).toBe("$1.2M");
    expect(formatValue(en, "percent", 0.124)).toBe("12.4%");
    expect(formatValue(tr, "percent", 0.124)).toBe("%12,4");
    expect(formatValue(tr, "number", 1234.5)).toBe("1.234,5");
    expect(formatValue(en, { date: "day-month" }, "2026-11-01")).toBe("Nov 1");
    expect(formatValue(tr, { date: "day-month" }, "2026-11-01")).toBe("1 Kas");
    expect(formatValue(en, "number", null)).toBe("—");
  });

  it("aligns zero across two axes", () => {
    const [a, b] = alignZeroDomains([-50, 100], [0, 0.6]);
    expect(a[0] / (a[1] - a[0])).toBeCloseTo(b[0] / (b[1] - b[0]));
    expect(alignZeroDomains([0, 87], [0, 0.42])).toEqual([[0, 100], [0, 0.6]]);
  });

  it("gives two axes nice ticks around a shared zero", () => {
    const { domains, ticks } = alignedAxes([-7200, 17800], [0, 0.42]);
    const [start, end] = ticks;
    expect(start).toContain(0);
    const steps = start.slice(1).map((v, i) => v - start[i]!);
    expect(new Set(steps).size).toBe(1);
    expect(start[0]).toBeLessThanOrEqual(-7200);
    expect(start.at(-1)).toBeGreaterThanOrEqual(17800);
    // the non-negative end axis shows no negative ticks, but its zero lines up with the start axis
    expect(end.every((v) => v >= 0)).toBe(true);
    expect(end.at(-1)).toBeGreaterThanOrEqual(0.42);
    const share = (d: [number, number]) => -d[0] / (d[1] - d[0]);
    expect(share(domains[0])).toBeCloseTo(share(domains[1]));
    expect(alignedAxes([0, 87], [0, 0.42])).toEqual({ domains: [[0, 100], [0, 0.6]], ticks: [[0, 25, 50, 75, 100], [0, 0.15, 0.3, 0.45, 0.6]] });
  });

  it("summarises a series", () => {
    const f = createFormatter("en-US");
    const text = summarizeSeries({ f, rows, series: [{ key: "revenue", label: "Revenue", format: "currency" }], x: "date" });
    expect(text).toBe("Nov 1 – Nov 3. Revenue: low $980.00 (Nov 2), high $1,610.00 (Nov 3), average $1,276.83.");
  });
});

describe("Chart frame", () => {
  it("is a labelled figure with a generated summary and a hidden data table", async () => {
    const { container } = render(
      <Chart title="Daily revenue" data={rows} config={config} x="date" height="sm">
        <div />
      </Chart>,
    );
    const fig = screen.getByRole("figure", { name: "Daily revenue" });
    expect(fig).toHaveAccessibleDescription(/Revenue: low \$980\.00 \(Nov 2\)/);
    const table = screen.getByRole("table", { name: "Daily revenue" });
    expect(within(table).getByRole("columnheader", { name: "Revenue" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "$1,240.50" })).toBeInTheDocument();
    const style = (container.querySelector('[data-slot="chart"]') as HTMLElement).style;
    expect(style.getPropertyValue("--series-revenue")).toBe("var(--chart-1)");
    expect(style.getPropertyValue("--series-refunds")).toBe("var(--chart-2)");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("toggles series from the legend and keeps one visible", async () => {
    const user = userEvent.setup();
    const onHidden = vi.fn();
    render(
      <Chart title="Revenue" data={rows} config={config} x="date" onHiddenSeriesChange={onHidden}>
        <div />
      </Chart>,
    );
    const legend = screen.getByRole("group", { name: "Series" });
    const revenue = within(legend).getByRole("button", { name: "Revenue" });
    const refunds = within(legend).getByRole("button", { name: "Refunds" });
    expect(revenue).toHaveAttribute("aria-pressed", "true");
    await user.click(refunds);
    expect(refunds).toHaveAttribute("aria-pressed", "false");
    expect(onHidden).toHaveBeenLastCalledWith(["refunds"]);
    // the last visible series cannot be hidden
    expect(revenue).toHaveAttribute("aria-disabled", "true");
    await user.click(revenue);
    expect(revenue).toHaveAttribute("aria-pressed", "true");
    // keyboard: Space on the focused toggle
    refunds.focus();
    await user.keyboard(" ");
    expect(refunds).toHaveAttribute("aria-pressed", "true");
  });

  it("switches to a visible table and back", async () => {
    const user = userEvent.setup();
    const onPoint = vi.fn();
    render(
      <Chart title="Revenue" data={rows} config={config} x="date" xLabel="Day" tableToggle onPointClick={onPoint}>
        <div data-testid="plot" />
      </Chart>,
    );
    await user.click(screen.getByRole("button", { name: "View as table" }));
    expect(screen.queryByTestId("plot")).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Day" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Nov 2, 2026" }));
    expect(onPoint).toHaveBeenCalledWith(rows[1], "revenue");
    await user.click(screen.getByRole("button", { name: "View as chart" }));
    expect(screen.getByTestId("plot")).toBeInTheDocument();
  });

  it("renders loading, refreshing, empty and error states", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const { rerender, container } = render(
      <Chart title="Revenue" data={rows} config={config} state={{ status: "loading" }} skeleton="bar">
        <div />
      </Chart>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading chart…");
    expect(container.querySelector('[data-slot="chart-body"]')).toHaveAttribute("aria-busy", "true");

    rerender(
      <Chart title="Revenue" data={rows} config={config} state={{ status: "refreshing" }}>
        <div data-testid="plot" />
      </Chart>,
    );
    expect(screen.getByTestId("plot")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Updating…");

    rerender(
      <Chart title="Revenue" data={[]} config={config}>
        <div />
      </Chart>,
    );
    expect(screen.getByText("No data for this range")).toBeInTheDocument();

    rerender(
      <Chart title="Revenue" data={rows} config={config} state={{ status: "error", onRetry: retry }}>
        <div />
      </Chart>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("This chart couldn't load.");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalled();
  });

  it("formats the table with the provider locale", () => {
    render(
      <LocaleProvider locale="tr-TR" currency="TRY" timeZone="Europe/Istanbul">
        <ChartDataTable caption="Gelir" spec={{ columns: [{ key: "date", label: "Gün", header: true }, { key: "revenue", label: "Gelir", format: "currency" }], rows }} />
      </LocaleProvider>,
    );
    expect(screen.getByRole("cell", { name: "₺1.240,50" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "1 Kas 2026" })).toBeInTheDocument();
  });

  it("hosts raw Recharts children in the frame", () => {
    const restore = mockChartSize();
    const { container } = render(
      <Chart title="Revenue" data={rows} config={config} x="date" animate={false}>
        <ChartFrame>
          <RAreaChart data={rows}>
            <ChartGrid />
            <ChartXAxis />
            <ChartYAxis />
            <ChartTooltip />
            <Area dataKey="revenue" stroke="var(--series-revenue)" isAnimationActive={false} />
          </RAreaChart>
        </ChartFrame>
      </Chart>,
    );
    expect(container.querySelector(".recharts-area-curve")).toBeInTheDocument();
    const ticks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")].map((n) => n.textContent);
    expect(ticks.some((t) => /^Nov\s?\d/.test(t ?? ""))).toBe(true);
    expect(ticks.some((t) => t?.startsWith("$"))).toBe(true);
    restore();
  });
});
