import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { TimeEntryList, TimerButton, Timesheet, createMemoryTimerAdapter } from "./time-tracker";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const projects = [
  { id: "mobile", label: "Mobile app", meta: "Northwind" },
  { id: "site", label: "Website relaunch", meta: "Lumen Spa" },
];

describe("TimerButton", () => {
  it("is a toggle button that starts and stops the timer for a project", async () => {
    const onStop = vi.fn();
    const adapter = createMemoryTimerAdapter({ onStop });
    const { user } = renderWithProviders(<TimerButton adapter={adapter} projects={projects} defaultProjectId="mobile" />);
    const btn = screen.getByRole("button", { name: "Start timer for Mobile app" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await user.click(btn);
    const running = await screen.findByRole("button", { name: "Stop timer for Mobile app" });
    expect(running).toHaveAttribute("aria-pressed", "true");
    await expectNoA11yViolations();
    await user.click(running);
    await screen.findByRole("button", { name: "Start timer for Mobile app" });
    expect(onStop).toHaveBeenCalledWith(expect.objectContaining({ projectId: "mobile", projectLabel: "Mobile app", end: expect.any(String) }));
  });

  it("follows a timer started elsewhere (shared adapter) and warns when stale", async () => {
    const adapter = createMemoryTimerAdapter({ initial: { id: "x", start: new Date(Date.now() - 11 * 3600_000).toISOString(), projectId: "site", projectLabel: "Website relaunch", origin: "other-tab" } as never });
    renderWithProviders(<TimerButton variant="full" adapter={adapter} projects={projects} staleAfterMin={600} onAdjust={() => {}} />);
    expect(await screen.findByRole("button", { name: "Stop timer for Website relaunch" })).toBeInTheDocument();
    expect(screen.getByText(/Running for 11 h/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adjust end time" })).toBeInTheDocument();
  });
});

describe("Timesheet", () => {
  const rows = [
    { id: "mobile", label: "Mobile app", meta: "Northwind" },
    { id: "site", label: "Website relaunch", meta: "Lumen Spa" },
  ];
  const value = { mobile: { "2026-11-09": 240, "2026-11-10": 180 }, site: { "2026-11-09": 120 } };

  it("renders a grid with totals and passes axe", async () => {
    renderWithProviders(<Timesheet weekStart="2026-11-09" rows={rows} value={value} dailyTarget={480} />);
    expect(screen.getByRole("grid", { name: /Timesheet/ })).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { name: "Mobile app, total 7 h" })).toHaveTextContent("7:00");
    expect(screen.getByRole("gridcell", { name: /Monday, November 9, total 6 h, under the 8 h target/ })).toHaveAttribute("data-under");
    expect(screen.getByRole("gridcell", { name: "Week total, 9 h" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("type to edit: decimal comma in Turkish, Enter saves and moves down", async () => {
    const onCellChange = vi.fn();
    const { user } = renderWithProviders(<Timesheet weekStart="2026-11-09" rows={rows} value={value} onCellChange={onCellChange} />, { locale: "tr-TR" });
    const cell = screen.getAllByRole("gridcell")[1]!; // Mobile app, Tuesday
    cell.focus();
    await user.keyboard("1,5{Enter}");
    await act(async () => {});
    expect(onCellChange).toHaveBeenCalledWith("mobile", "2026-11-10", 90);
  });

  it("rejects input it can't read and Escape cancels", async () => {
    const onCellChange = vi.fn();
    const { user } = renderWithProviders(<Timesheet weekStart="2026-11-09" rows={rows} value={value} onCellChange={onCellChange} />);
    screen.getAllByRole("gridcell")[0]!.focus();
    await user.keyboard("{Enter}");
    const input = screen.getByRole("textbox", { name: "Mobile app, Monday, November 9" });
    await user.clear(input);
    await user.type(input, "lots{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("Use 1.5, 1:30, 90m or 1h 30m");
    expect(input).toHaveAttribute("aria-invalid", "true");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(onCellChange).not.toHaveBeenCalled();
  });

  it("locked weeks are read-only", async () => {
    const { user } = renderWithProviders(<Timesheet weekStart="2026-11-09" rows={rows} value={value} locked />);
    expect(screen.getByText("Approved. This week is read-only.")).toBeInTheDocument();
    screen.getAllByRole("gridcell")[0]!.focus();
    await user.keyboard("2");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("TimeEntryList", () => {
  it("groups entries by day with totals", async () => {
    renderWithProviders(
      <TimeEntryList
        entries={[
          { id: "1", start: "2026-11-10T09:00:00Z", end: "2026-11-10T11:30:00Z", projectLabel: "Mobile app", note: "Checkout flow", billable: true },
          { id: "2", start: "2026-11-10T13:00:00Z", end: "2026-11-10T14:00:00Z", projectLabel: "Website relaunch" },
          { id: "3", start: "2026-11-09T09:00:00Z", durationMin: 45, projectLabel: "Mobile app" },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: /Tuesday, November 10.*3 h 30 min/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Monday, November 9.*45 min/ })).toBeInTheDocument();
    await expectNoA11yViolations();
  });
});
