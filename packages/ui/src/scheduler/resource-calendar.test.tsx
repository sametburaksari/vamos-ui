import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, screen, within } from "@testing-library/react";
import { ResourceCalendar, maxConcurrentRule, minRestRule, type ResourceBlock, type ResourceTemplate } from "./resource-calendar";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const people = [
  { id: "ayse", title: "Ayşe Demir", meta: "Head chef", group: "Kitchen" },
  { id: "liam", title: "Liam Carter", meta: "Line cook", group: "Kitchen" },
  { id: "noor", title: "Noor Haddad", meta: "Host", group: "Front of house" },
];
const templates: ResourceTemplate[] = [
  { id: "morning", label: "Morning", start: "08:00", end: "16:00", tone: "chart-2", code: "M" },
  { id: "evening", label: "Evening", start: "16:00", end: "24:00", tone: "chart-4", code: "E" },
];
const blocks: ResourceBlock[] = [
  { id: "b1", resourceId: "ayse", start: "2026-11-09T13:00:00Z", end: "2026-11-09T21:00:00Z", label: "Evening", tone: "chart-4" },
  { id: "b2", resourceId: "ayse", start: "2026-11-10T05:00:00Z", end: "2026-11-10T13:00:00Z", label: "Morning", tone: "chart-2" },
  { id: "b3", resourceId: "liam", start: "2026-11-11", end: "2026-11-13", label: "Annual leave", kind: "leave", status: "pending" },
];
const range = { start: "2026-11-09", end: "2026-11-15" };
const NOW = new Date("2026-11-10T09:00:00Z");
const nextFrame = () => act(() => new Promise((r) => requestAnimationFrame(() => r(null))));

describe("ResourceCalendar", () => {
  it("renders a labelled grid with row and column headers and passes axe", async () => {
    renderWithProviders(<ResourceCalendar resources={people} blocks={blocks} range={range} now={NOW} timeZone="Europe/Istanbul" />);
    const grid = screen.getByRole("grid", { name: /Schedule, November 9\s–\s15, 2026/ });
    expect(within(grid).getAllByRole("rowheader").map((h) => h.textContent)).toEqual(expect.arrayContaining([expect.stringContaining("Ayşe Demir")]));
    expect(within(grid).getByRole("columnheader", { name: /Tuesday, November 10/ })).toHaveAttribute("data-today");
    expect(within(grid).getByRole("gridcell", { name: /Liam Carter, Thursday, November 12. Annual leave, pending approval/ })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("marks Turkish public holidays on the column", () => {
    renderWithProviders(<ResourceCalendar resources={people} blocks={[]} range={{ start: "2026-10-26", end: "2026-11-01" }} now={NOW} />, { locale: "tr-TR" });
    expect(screen.getByRole("columnheader", { name: /29 Ekim Perşembe\. Republic Day/ })).toHaveAttribute("data-holiday");
  });

  it("assigns a template from the cell menu (keyboard path)", async () => {
    const onBlocksChange = vi.fn();
    const { user } = renderWithProviders(<ResourceCalendar resources={people} blocks={blocks} range={range} templates={templates} onBlocksChange={onBlocksChange} now={NOW} timeZone="Europe/Istanbul" />);
    const cell = screen.getByRole("gridcell", { name: /^Ayşe Demir, Tuesday, November 10/ });
    cell.focus();
    await user.keyboard("{ArrowDown}");
    await nextFrame();
    expect(document.activeElement).toHaveAccessibleName(/^Liam Carter, Tuesday, November 10/);
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("menuitem", { name: "Assign Morning" }));
    expect(onBlocksChange).toHaveBeenCalledWith({ created: [expect.objectContaining({ resourceId: "liam", label: "Morning", start: "2026-11-10T05:00:00.000Z", end: "2026-11-10T13:00:00.000Z" })], deleted: undefined });
  });

  it("selects a range with Shift+Arrow and deletes with Delete", async () => {
    const onBlocksChange = vi.fn();
    const { user } = renderWithProviders(<ResourceCalendar resources={people} blocks={blocks} range={range} onBlocksChange={onBlocksChange} now={NOW} />);
    screen.getByRole("gridcell", { name: /^Ayşe Demir, Monday, November 9/ }).focus();
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}");
    await nextFrame();
    expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(2);
    await user.keyboard("{Delete}");
    expect(onBlocksChange).toHaveBeenCalledWith({ deleted: ["b1", "b2"] });
  });

  it("moves the blocks of a cell with Alt+Arrow", async () => {
    const onBlocksChange = vi.fn();
    const { user } = renderWithProviders(<ResourceCalendar resources={people} blocks={blocks} range={range} onBlocksChange={onBlocksChange} now={NOW} />);
    screen.getByRole("gridcell", { name: /^Ayşe Demir, Tuesday, November 10/ }).focus();
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onBlocksChange).toHaveBeenCalledWith({ updated: [expect.objectContaining({ id: "b2", start: "2026-11-11T05:00:00.000Z", end: "2026-11-11T13:00:00.000Z" })] });
  });

  it("codes variant: typing a code assigns it and replaces the cell", async () => {
    const onBlocksChange = vi.fn();
    const { user } = renderWithProviders(
      <ResourceCalendar variant="codes" resources={people} blocks={[{ id: "c1", resourceId: "noor", start: "2026-11-09", end: "2026-11-09", code: "W" }]} range={range} templates={[{ id: "w", label: "Worked", code: "W" }, { id: "s", label: "Sick", code: "S", tone: "danger" }]} onBlocksChange={onBlocksChange} now={NOW} />,
    );
    screen.getByRole("gridcell", { name: /^Noor Haddad, Monday, November 9/ }).focus();
    await user.keyboard("s");
    expect(onBlocksChange).toHaveBeenCalledWith({ created: [expect.objectContaining({ resourceId: "noor", code: "S", start: "2026-11-09", end: "2026-11-09" })], deleted: ["c1"] });
  });

  it("explains rule violations in the cell's name and flags over-capacity days", () => {
    renderWithProviders(
      <ResourceCalendar
        resources={people}
        blocks={[...blocks, { id: "b4", resourceId: "noor", start: "2026-11-12", end: "2026-11-12", kind: "leave", label: "Sick" }]}
        range={range}
        rules={[minRestRule(11 * 60), maxConcurrentRule(1, ["leave"])]}
        now={NOW}
      />,
    );
    expect(screen.getByRole("gridcell", { name: /^Ayşe Demir, Tuesday, November 10.*Warning: Only 8 h rest before this shift/ })).toHaveAttribute("data-violation", "warning");
    expect(screen.getByRole("columnheader", { name: /Thursday, November 12. Warning: 2 people off, the limit is 1/ })).toHaveAttribute("data-violation");
  });

  it("an armed palette template is assigned by clicking a cell", async () => {
    const onBlocksChange = vi.fn();
    const { user } = renderWithProviders(<ResourceCalendar resources={people} blocks={[]} range={range} templates={templates} onBlocksChange={onBlocksChange} now={NOW} />);
    const chip = screen.getByRole("button", { name: /Evening/ });
    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("gridcell", { name: /^Noor Haddad, Friday, November 13/ }));
    expect(onBlocksChange).toHaveBeenCalledWith(expect.objectContaining({ created: [expect.objectContaining({ resourceId: "noor", label: "Evening", start: "2026-11-13T16:00:00.000Z", end: "2026-11-14T00:00:00.000Z" })] }));
  });
});
