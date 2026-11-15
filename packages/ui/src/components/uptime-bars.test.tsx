import * as React from "react";
import { screen } from "@testing-library/react";
import { UptimeBars, UptimeLegend, uptimePercent, type UptimeBar } from "./uptime-bars";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

const bars: UptimeBar[] = [
  { date: "2026-11-07", status: "none" },
  { date: "2026-11-08", status: "operational", uptime: 100 },
  { date: "2026-11-09", status: "major", uptime: 98.5, note: "Elevated error rates" },
  { date: "2026-11-10", status: "maintenance" },
  { date: "2026-11-11", status: "degraded", uptime: 99.5 },
];

describe("uptimePercent", () => {
  it("averages bars with data; missing uptime counts as 100", () => {
    expect(uptimePercent(bars)).toBeCloseTo((100 + 98.5 + 100 + 99.5) / 4);
    expect(uptimePercent([{ date: "2026-11-01", status: "none" }])).toBeNull();
  });
});

describe("UptimeBars", () => {
  it("names the row and every bar in text, not colour only", async () => {
    renderWithProviders(<UptimeBars name="Public API" bars={bars} />);
    expect(screen.getByRole("group", { name: "Public API, uptime history" })).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
    expect(buttons[0]).toHaveAccessibleName("Nov 7, 2026: No data");
    expect(buttons[2]).toHaveAccessibleName("Nov 9, 2026: Major outage · 98.50% uptime · Elevated error rates");
    expect(buttons[2]).toHaveAttribute("data-status", "major");
    expect(screen.getByText("99.50% uptime")).toBeInTheDocument();
    expect(screen.getByText("5 days ago")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("has one tab stop; arrows, Home and End move and show the tooltip", async () => {
    const { user } = renderWithProviders(<UptimeBars name="Public API" bars={bars} />);
    const buttons = screen.getAllByRole("button");
    await user.tab();
    expect(buttons[4]).toHaveFocus();
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1);
    await user.keyboard(keys.left);
    expect(buttons[3]).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Maintenance");
    await user.keyboard("{Home}");
    expect(buttons[0]).toHaveFocus();
    await user.keyboard("{End}");
    expect(buttons[4]).toHaveFocus();
  });

  it("moves the other way in RTL", async () => {
    const { user } = renderWithProviders(
      <div dir="rtl">
        <UptimeBars name="Public API" bars={bars} />
      </div>,
    );
    const buttons = screen.getAllByRole("button");
    buttons[2]!.focus();
    await user.keyboard(keys.left);
    expect(buttons[3]).toHaveFocus();
  });

  it("selects with click and Enter; unselectable bars are aria-disabled", async () => {
    const onBarSelect = vi.fn();
    const data = bars.map((b) => ({ ...b, selectable: b.status !== "operational" && b.status !== "none" }));
    const { user } = renderWithProviders(<UptimeBars name="Public API" bars={data} onBarSelect={onBarSelect} />);
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[2]!);
    expect(onBarSelect).toHaveBeenCalledWith(expect.objectContaining({ status: "major" }), 2);
    buttons[4]!.focus();
    await user.keyboard(keys.enter);
    expect(onBarSelect).toHaveBeenLastCalledWith(expect.objectContaining({ status: "degraded" }), 4);
    expect(buttons[1]).toHaveAttribute("aria-disabled", "true");
    await user.click(buttons[1]!);
    expect(onBarSelect).toHaveBeenCalledTimes(2);
  });

  it("formats with the locale and custom labels", () => {
    renderWithProviders(<UptimeBars name="API" bars={bars} labels={{ uptime: "{value} erişilebilir", start: "{count} gün önce", end: "Bugün" }} />, { locale: "tr-TR" });
    expect(screen.getByText(/%99,50 erişilebilir/)).toBeInTheDocument();
    expect(screen.getByText("5 gün önce")).toBeInTheDocument();
  });
});

describe("UptimeLegend", () => {
  it("lists the states as text", async () => {
    const { container } = renderWithProviders(<UptimeLegend statuses={["operational", "major", "none"]} />);
    const list = screen.getByRole("list", { name: "Legend" });
    expect(list).toHaveTextContent("OperationalMajor outageNo data");
    await expectNoA11yViolations(container);
  });
});
