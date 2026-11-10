import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { Calendar, CalendarGrid, CalendarSlots } from "./calendar";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 10, 10, 0));
});
afterEach(() => vi.useRealTimers());

describe("CalendarGrid", () => {
  it("renders a labelled grid with localized week start", () => {
    const { container } = renderWithProviders(<CalendarGrid mode="single" defaultMonth={new Date(2026, 10, 1)} />, { locale: "tr-TR" });
    const headers = container.querySelectorAll("th");
    // Turkish weeks start on Monday ("Pt").
    expect(headers[0]?.getAttribute("aria-label")?.toLocaleLowerCase("tr")).toContain("pazartesi");
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("marks weekends and today with data attributes", () => {
    const { container } = renderWithProviders(<CalendarGrid mode="single" defaultMonth={new Date(2026, 10, 1)} />);
    expect(container.querySelector('[data-day="2026-11-10"]')).toHaveAttribute("data-today");
    expect(container.querySelector('[data-day="2026-11-14"]')).toHaveAttribute("data-weekend");
    expect(container.querySelector('[data-day="2026-11-12"]')).not.toHaveAttribute("data-weekend");
  });
});

describe("Calendar", () => {
  it("selects a day as YYYY-MM-DD, shows markers in the accessible name and passes axe", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(
      <Calendar defaultMonth="2026-11" onValueChange={onValueChange} markers={{ "2026-11-12": { label: "2 scheduled posts", tone: "accent" } }} legend={[{ label: "Scheduled", tone: "accent" }]} />,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("November 2026");
    const day = screen.getByRole("button", { name: /Thursday, November 12, 2026, 2 scheduled posts/ });
    await user.click(day);
    expect(onValueChange).toHaveBeenCalledWith("2026-11-12");
    await expectNoA11yViolations();
  });

  it("moves focus with the arrow keys (WAI-ARIA grid)", async () => {
    const { user } = renderWithProviders(<Calendar defaultValue="2026-11-12" />);
    const day = screen.getByRole("button", { name: /November 12, 2026/ });
    day.focus();
    await user.keyboard(keys.right);
    expect(document.activeElement).toHaveAccessibleName(/November 13, 2026/);
    await user.keyboard(keys.down);
    expect(document.activeElement).toHaveAccessibleName(/November 20, 2026/);
    await user.keyboard(keys.enter);
    expect(document.activeElement).toHaveAccessibleName(/selected/);
  });

  it("shows Turkish holidays for the tr locale and navigates with the header", async () => {
    const { user, container } = renderWithProviders(<Calendar defaultMonth="2026-10" />, { locale: "tr-TR" });
    const cell = container.querySelector('[data-day="2026-10-29"]');
    expect(cell).toHaveAttribute("data-holiday");
    expect(within(cell as HTMLElement).getByRole("button")).toHaveAccessibleName(/Cumhuriyet Bayramı/);
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(/Kasım/);
  });

  it("selects a range and supports week numbers", async () => {
    const onValueChange = vi.fn();
    const { user, container } = renderWithProviders(<Calendar mode="range" defaultMonth="2026-11" showWeekNumbers onValueChange={onValueChange} />);
    expect(container.querySelectorAll('th[role="rowheader"]').length).toBeGreaterThan(3);
    await user.click(screen.getByRole("button", { name: /November 3, 2026/ }));
    await user.click(screen.getByRole("button", { name: /November 6, 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: "2026-11-03", to: "2026-11-06" });
    expect(container.querySelector('[data-day="2026-11-04"]')).toHaveAttribute("data-range-middle");
  });

  it("renders a 12-month year view", () => {
    renderWithProviders(<Calendar months={12} defaultMonth="2026-05" mode="none" />);
    expect(screen.getAllByRole("grid")).toHaveLength(12);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("2026");
  });
});

describe("CalendarSlots", () => {
  const slots = [
    { start: "09:00", available: true },
    { start: "09:30", available: false },
    { start: "10:00", available: true, label: "1 left" },
  ];

  it("is a radiogroup with roving focus that skips unavailable slots", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<CalendarSlots day="2026-11-12" slots={slots} onValueChange={onValueChange} />);
    const group = screen.getByRole("radiogroup");
    const radios = within(group).getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    radios[0]!.focus();
    await user.keyboard(keys.right);
    expect(onValueChange).toHaveBeenLastCalledWith("10:00");
    expect(radios[2]).toHaveFocus();
    await expectNoA11yViolations();
  });

  it("shows the empty and error states", async () => {
    const onRetry = vi.fn();
    const { rerender, user } = renderWithProviders(<CalendarSlots slots={[]} />);
    expect(screen.getByText("No times available on this day")).toBeInTheDocument();
    rerender(<CalendarSlots slots={[]} error onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: /Try again/ }));
    expect(onRetry).toHaveBeenCalled();
  });
});
