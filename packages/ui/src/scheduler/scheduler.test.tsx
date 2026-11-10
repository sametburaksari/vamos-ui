import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Scheduler, type SchedulerEvent } from "./scheduler";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const NOW = new Date("2026-11-10T09:00:00Z");
const events: SchedulerEvent[] = [
  { id: "e1", title: "Pipeline review", start: "2026-11-10T10:00:00Z", end: "2026-11-10T11:00:00Z", tone: "chart-1" },
  { id: "e2", title: "Call with Northwind", start: "2026-11-10T10:30:00Z", end: "2026-11-10T11:00:00Z", status: "tentative" },
  { id: "e3", title: "Team offsite", start: "2026-11-12", end: "2026-11-13", allDay: true, tone: "success" },
];

function Controlled(props: Partial<React.ComponentProps<typeof Scheduler>>) {
  const [list, setList] = React.useState(events);
  return (
    <Scheduler
      events={list}
      defaultDate="2026-11-10"
      now={NOW}
      onEventChange={(c) => setList((l) => l.map((e) => (e.id === c.id ? { ...e, start: c.start, end: c.end } : e)))}
      {...props}
    />
  );
}

describe("Scheduler", () => {
  it("renders the week with a localized title, named events and passes axe", async () => {
    renderWithProviders(<Scheduler events={events} defaultDate="2026-11-10" now={NOW} onEventOpen={() => {}} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("November 8 – 14, 2026");
    expect(screen.getByRole("button", { name: "Pipeline review, Tuesday, November 10, 10:00 AM to 11:00 AM" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Call with Northwind, .*tentative/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Team offsite, Thursday, November 12 to Friday, November 13/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Now, 9:00 AM/ })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("shows times in the given time zone and Monday-first weeks for tr", () => {
    renderWithProviders(<Scheduler events={events} defaultDate="2026-11-10" now={NOW} timeZone="Europe/Istanbul" />, { locale: "tr-TR" });
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("9–15 Kasım 2026");
    expect(screen.getByRole("button", { name: /Pipeline review, 10 Kasım Salı, 13:00 to 14:00/ })).toBeInTheDocument();
  });

  it("moves an event with Alt+Arrow keys (snap) and resizes with Alt+Shift", async () => {
    const onEventChange = vi.fn();
    const { user } = renderWithProviders(<Controlled onEventChange={onEventChange} />);
    const ev = screen.getByRole("button", { name: /^Pipeline review/ });
    ev.focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(onEventChange).toHaveBeenLastCalledWith({ id: "e1", start: "2026-11-10T10:15:00.000Z", end: "2026-11-10T11:15:00.000Z", allDay: false });
    await user.keyboard("{Alt>}{Shift>}{ArrowDown}{/Shift}{/Alt}");
    expect(onEventChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: "e1", start: "2026-11-10T10:15:00.000Z", end: "2026-11-10T11:30:00.000Z" }));
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onEventChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: "e1", start: "2026-11-11T10:15:00.000Z", end: "2026-11-11T11:30:00.000Z" }));
  });

  it("reverts an optimistic move when the save is rejected", async () => {
    let reject: (e: Error) => void = () => {};
    const onEventChange = vi.fn(() => new Promise<void>((_, rej) => (reject = rej)));
    const { user } = renderWithProviders(<Scheduler events={events} defaultDate="2026-11-10" now={NOW} onEventChange={onEventChange} />);
    screen.getByRole("button", { name: /^Pipeline review/ }).focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(screen.getByRole("button", { name: /^Pipeline review, .*10:15 AM/ })).toBeInTheDocument();
    await act(async () => reject(new Error("offline")));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Pipeline review, .*10:00 AM/ })).toBeInTheDocument());
  });

  it("creates an event from the keyboard slot cursor", async () => {
    const onCreate = vi.fn();
    const { user } = renderWithProviders(<Scheduler events={[]} defaultDate="2026-11-10" now={NOW} onCreate={onCreate} slotMinutes={30} />);
    const cursor = screen.getByRole("button", { name: /^New event at Tuesday, November 10, 9:00 AM/ });
    cursor.focus();
    await user.keyboard("{ArrowDown}{ArrowRight}{Enter}");
    expect(onCreate).toHaveBeenCalledWith({ start: "2026-11-11T09:30:00.000Z", end: "2026-11-11T10:00:00.000Z", allDay: false });
  });

  it("month view is an arrow-key grid; Enter opens the day", async () => {
    const onViewChange = vi.fn();
    const { user } = renderWithProviders(<Scheduler events={events} defaultDate="2026-11-10" defaultView="month" now={NOW} onViewChange={onViewChange} />);
    const grid = screen.getByRole("grid", { name: "November 2026" });
    const cell = within(grid).getByRole("gridcell", { name: /Tuesday, November 10, 2 events/ });
    cell.focus();
    await user.keyboard("{ArrowRight}");
    await act(() => new Promise((r) => requestAnimationFrame(() => r(null))));
    expect(document.activeElement).toHaveAccessibleName(/Wednesday, November 11/);
    await user.keyboard("{ArrowDown}");
    await act(() => new Promise((r) => requestAnimationFrame(() => r(null))));
    expect(document.activeElement).toHaveAccessibleName(/Wednesday, November 18/);
    await user.keyboard("{Enter}");
    expect(onViewChange).toHaveBeenCalledWith("day");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Wednesday, November 18, 2026");
  });

  it("list view shows grouped events and an empty state", async () => {
    const { user } = renderWithProviders(<Scheduler events={events} defaultDate="2026-11-10" defaultView="list" now={NOW} />);
    expect(screen.getByRole("heading", { level: 3, name: "Tuesday, November 10, 2026" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Nothing scheduled this week")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("opens an event on click and marks Turkish holidays", () => {
    const onEventOpen = vi.fn();
    renderWithProviders(<Scheduler events={events} defaultDate="2026-10-29" now={NOW} onEventOpen={onEventOpen} />, { locale: "tr-TR" });
    expect(screen.getAllByText(/Republic Day/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: /^Pipeline review/ }));
    expect(onEventOpen).toHaveBeenCalledWith("e1", expect.objectContaining({ id: "e1" }));
  });
});
