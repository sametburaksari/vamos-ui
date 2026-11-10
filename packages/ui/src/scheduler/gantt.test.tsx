import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { Gantt, type GanttLink, type GanttTask } from "./gantt";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const tasks: GanttTask[] = [
  { id: "web", title: "Website relaunch", start: "2026-11-02", end: "2026-11-02" },
  { id: "disc", parentId: "web", title: "Discovery", start: "2026-11-02", end: "2026-11-06", progress: 1 },
  { id: "design", parentId: "web", title: "Design", start: "2026-11-09", end: "2026-11-13", progress: 0.4 },
  { id: "build", parentId: "web", title: "Build", start: "2026-11-16", end: "2026-11-27" },
  { id: "launch", title: "Launch", start: "2026-11-30", end: "2026-11-30", type: "milestone" },
];
const links: GanttLink[] = [
  { id: "l1", from: "disc", to: "design" },
  { id: "l2", from: "design", to: "build" },
];
const nextFrame = () => act(() => new Promise((r) => requestAnimationFrame(() => r(null))));
const cal = { workDays: [1, 2, 3, 4, 5] };

describe("Gantt", () => {
  it("renders a treegrid with levels, durations and passes axe", async () => {
    renderWithProviders(<Gantt tasks={tasks} links={links} workCalendar={cal} today="2026-11-10" />);
    const grid = screen.getByRole("treegrid", { name: "Project plan" });
    const rows = within(grid).getAllByRole("row");
    expect(rows).toHaveLength(6);
    expect(rows[1]).toHaveAttribute("aria-level", "1");
    expect(rows[1]).toHaveAttribute("aria-expanded", "true");
    expect(rows[2]).toHaveAttribute("aria-level", "2");
    expect(within(rows[1]!).getByText("20 working days")).toBeInTheDocument();
    expect(within(rows[5]!).getByText("Milestone")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("collapses and expands summaries with the arrow keys", async () => {
    const { user } = renderWithProviders(<Gantt tasks={tasks} links={links} today="2026-11-10" />);
    const first = screen.getAllByRole("gridcell")[0]!;
    first.focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getAllByRole("row")[1]).toHaveAttribute("aria-expanded", "false");
    const grid = screen.getByRole("treegrid");
    expect(within(grid).queryByText("Discovery")).not.toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(within(grid).getByText("Discovery")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    await nextFrame();
    expect(document.activeElement).toHaveTextContent("Discovery");
  });

  it("edits a start date inline and pushes successors (one batch)", async () => {
    const onTaskChange = vi.fn();
    const { user } = renderWithProviders(<Gantt tasks={tasks} links={links} workCalendar={cal} onTaskChange={onTaskChange} today="2026-11-10" />);
    const discRow = screen.getAllByRole("row")[2]!;
    const startCell = within(discRow).getAllByRole("gridcell")[1]!;
    startCell.focus();
    await user.keyboard("{Enter}");
    const input = screen.getByLabelText("Start, Discovery");
    fireEvent.change(input, { target: { value: "2026-11-04" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await act(async () => {});
    expect(onTaskChange).toHaveBeenCalledTimes(1);
    const batch = onTaskChange.mock.calls[0]![0];
    expect(batch).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "disc", start: "2026-11-04", end: "2026-11-10" }),
        expect.objectContaining({ id: "design", start: "2026-11-11", end: "2026-11-17" }),
        expect.objectContaining({ id: "build", start: "2026-11-18" }),
      ]),
    );
  });

  it("edits predecessors by WBS number and refuses cycles", async () => {
    const onLinkCreate = vi.fn();
    const { user } = renderWithProviders(<Gantt tasks={tasks} links={links} columns={["title", "predecessors"]} onLinkCreate={onLinkCreate} onLinkDelete={() => {}} today="2026-11-10" />);
    const launchRow = screen.getAllByRole("row")[5]!;
    const cell = within(launchRow).getAllByRole("gridcell")[1]!;
    cell.focus();
    await user.keyboard("{Enter}");
    const input = screen.getByLabelText("Predecessors, Launch");
    fireEvent.change(input, { target: { value: "1.3" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await act(async () => {});
    expect(onLinkCreate).toHaveBeenCalledWith({ from: "build", to: "launch", type: "FS" });

    onLinkCreate.mockClear();
    await nextFrame();
    const discCell = within(screen.getAllByRole("row")[2]!).getAllByRole("gridcell")[1]!;
    discCell.focus();
    await user.keyboard("{Enter}");
    const input2 = screen.getByLabelText("Predecessors, Discovery");
    fireEvent.change(input2, { target: { value: "1.3" } });
    fireEvent.keyDown(input2, { key: "Enter" });
    await act(async () => {});
    expect(onLinkCreate).not.toHaveBeenCalled();
  });

  it("shows an empty state without tasks", () => {
    renderWithProviders(<Gantt tasks={[]} />);
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });
});
