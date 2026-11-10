import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { TimeInput, TimePicker, TimeRangePicker } from "./time-picker";
import { Field } from "./input";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

describe("TimeInput", () => {
  it("is a labelled group of spinbuttons and passes axe", async () => {
    renderWithProviders(
      <Field label="Start time" hint="Your local time.">
        <TimeInput defaultValue="14:30" hourCycle={24} />
      </Field>,
    );
    const group = screen.getByRole("group", { name: "Start time" });
    const [hour, minute] = within(group).getAllByRole("spinbutton");
    expect(hour).toHaveAttribute("aria-valuenow", "14");
    expect(minute).toHaveAttribute("aria-valuenow", "30");
    expect(group).toHaveAccessibleDescription("Your local time.");
    await expectNoA11yViolations();
  });

  it("types digits with auto-advance and emits HH:mm", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<TimeInput hourCycle={24} onValueChange={onValueChange} aria-label="Meeting time" />);
    const [hour, minute] = screen.getAllByRole("spinbutton");
    hour!.focus();
    await user.keyboard("0");
    await user.keyboard("9");
    expect(minute).toHaveFocus();
    await user.keyboard("4");
    await user.keyboard("5");
    expect(onValueChange).toHaveBeenLastCalledWith("09:45");
  });

  it("steps with arrows, moves with left/right and clears with Backspace", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<TimeInput hourCycle={24} defaultValue="10:00" step={15} onValueChange={onValueChange} aria-label="Start" />);
    const [hour, minute] = screen.getAllByRole("spinbutton");
    minute!.focus();
    await user.keyboard(keys.up);
    expect(onValueChange).toHaveBeenLastCalledWith("10:15");
    await user.keyboard(keys.left);
    expect(hour).toHaveFocus();
    await user.keyboard(keys.down);
    expect(onValueChange).toHaveBeenLastCalledWith("09:15");
    await user.keyboard(keys.backspace);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(hour).toHaveAttribute("aria-valuetext", "No time");
  });

  it("shows AM/PM for en-US and keeps the value 24h", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<TimeInput defaultValue="14:30" onValueChange={onValueChange} aria-label="Pickup" />);
    const segs = screen.getAllByRole("spinbutton");
    expect(segs).toHaveLength(3);
    expect(segs[0]).toHaveAttribute("aria-valuenow", "2");
    expect(segs[2]).toHaveAttribute("aria-valuetext", "PM");
    segs[2]!.focus();
    await user.keyboard("a");
    expect(onValueChange).toHaveBeenLastCalledWith("02:30");
  });

  it("marks out-of-range times invalid", () => {
    renderWithProviders(<TimeInput hourCycle={24} value="20:00" min="09:00" max="18:00" aria-label="Opening" />);
    expect(screen.getByRole("group", { name: "Opening" })).toHaveAttribute("aria-invalid", "true");
  });
});

describe("TimePicker", () => {
  it("opens a slot listbox and picks a time", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<TimePicker slots step={30} min="09:00" max="12:00" hourCycle={24} onValueChange={onValueChange} aria-label="Appointment" />);
    await user.click(screen.getByRole("button", { name: "Show times" }));
    const list = await screen.findByRole("listbox", { name: "Times" });
    const options = within(list).getAllByRole("option");
    expect(options[0]).toHaveTextContent("09:00");
    expect(options.at(-1)).toHaveTextContent("12:00");
    await user.click(options[2]!);
    expect(onValueChange).toHaveBeenLastCalledWith("10:00");
    expect(screen.queryByRole("listbox")).toBeNull();
    await expectNoA11yViolations();
  });
});

describe("TimeRangePicker", () => {
  it("shows the duration and flags an end before the start", () => {
    const { rerender } = renderWithProviders(<TimeRangePicker hourCycle={24} value={{ start: "09:00", end: "17:30" }} aria-label="Shift" />);
    expect(screen.getByText("8 h 30 min")).toBeInTheDocument();
    rerender(<TimeRangePicker hourCycle={24} value={{ start: "18:00", end: "09:00" }} aria-label="Shift" />);
    expect(screen.getByRole("group", { name: "End time" })).toHaveAttribute("aria-invalid", "true");
    rerender(<TimeRangePicker hourCycle={24} overnight value={{ start: "22:00", end: "06:00" }} aria-label="Shift" />);
    expect(screen.getByText("8 h")).toBeInTheDocument();
    expect(screen.getByText("+1 day")).toBeInTheDocument();
  });
});
