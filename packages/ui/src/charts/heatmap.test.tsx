import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { LocaleProvider } from "../lib/locale";
import { Heatmap, weekStartOf } from "./heatmap";

const days = Array.from({ length: 21 }, (_, i) => ({ x: `2026-11-${String(i + 1).padStart(2, "0")}`, value: (i * 7) % 5 }));

describe("Heatmap", () => {
  it("reads week start from the locale", () => {
    expect(weekStartOf("en-US")).toBe(0);
    expect(weekStartOf("tr-TR")).toBe(1);
  });

  it("calendar: an ARIA grid with labelled cells and roving focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<Heatmap mode="calendar" title="Posts published" data={days} valueLabel="Posts" today="2026-11-10" />);
    const grid = screen.getByRole("grid", { name: "Posts published" });
    expect(grid).toBeInTheDocument();
    const cell = screen.getByRole("gridcell", { name: "Tuesday, November 10, 2026: 3 posts" });
    expect(cell).toHaveAttribute("aria-current", "date");
    // the last day is the single tab stop
    const last = screen.getByRole("gridcell", { name: /November 21, 2026/ });
    expect(last).toHaveAttribute("tabindex", "0");
    await user.tab();
    expect(last).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("gridcell", { name: /November 20, 2026/ })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("gridcell", { name: /November 13, 2026/ })).toHaveFocus();
    await user.keyboard("{PageUp}");
    expect(screen.getByRole("gridcell", { name: /November 1, 2026/ })).toHaveFocus();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("matrix: weekday × hour with column headers and Enter to activate", async () => {
    const user = userEvent.setup();
    const onCell = vi.fn();
    const data = ["Mon", "Tue"].flatMap((y) => ["9:00", "10:00", "11:00"].map((x, i) => ({ x, y, value: i + (y === "Tue" ? 3 : 0) })));
    const { container } = render(<Heatmap mode="matrix" title="Calls answered" data={data} onCellClick={onCell} />);
    const grid = screen.getByRole("grid", { name: "Calls answered" });
    expect(within(grid).getByRole("columnheader", { name: "10:00" })).toBeInTheDocument();
    expect(within(grid).getByRole("rowheader", { name: "Tue" })).toBeInTheDocument();
    const first = screen.getByRole("gridcell", { name: "Mon, 9:00: 0" });
    first.focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("gridcell", { name: "Mon, 11:00: 2" })).toHaveFocus();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onCell).toHaveBeenCalledWith(expect.objectContaining({ x: "11:00", y: "Tue", value: 5 }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("starts weeks on Monday in tr-TR and keeps a table alternative", () => {
    render(
      <LocaleProvider locale="tr-TR">
        <Heatmap mode="calendar" title="Yayınlar" data={days} />
      </LocaleProvider>,
    );
    const rowHeaders = within(screen.getByRole("grid")).getAllByRole("rowheader");
    expect(rowHeaders[0]).toHaveTextContent("Pzt");
    expect(screen.getByRole("table", { name: "Yayınlar" })).toBeInTheDocument();
  });

  it("diverging scale colours negatives and positives differently", () => {
    const data = [{ x: "Q1", y: "Sales", value: -0.2 }, { x: "Q2", y: "Sales", value: 0 }, { x: "Q3", y: "Sales", value: 0.3 }];
    const { container } = render(<Heatmap mode="matrix" title="Budget variance" data={data} scale="diverging" format="percent" />);
    const fills = [...container.querySelectorAll('[role="gridcell"]')].map((c) => (c as HTMLElement).style.background);
    expect(fills[0]).toContain("var(--danger)");
    expect(fills[1]).toContain("var(--track)");
    expect(fills[2]).toContain("var(--success)");
  });
});
