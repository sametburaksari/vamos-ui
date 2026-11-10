import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { DatePicker, DateTimePicker } from "./date-picker";
import { Field } from "./input";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 10, 10, 0));
});
afterEach(() => vi.useRealTimers());

describe("DatePicker", () => {
  it("is wired to its Field, uses the locale placeholder and passes axe", async () => {
    renderWithProviders(
      <Field label="Due date" hint="Invoices are due within 30 days.">
        <DatePicker />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Due date" });
    expect(input).toHaveAttribute("placeholder", "MM/DD/YYYY");
    expect(input).toHaveAccessibleDescription("Invoices are due within 30 days.");
    await expectNoA11yViolations();
  });

  it("parses typed text on blur into YYYY-MM-DD", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<DatePicker aria-label="Start date" onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox", { name: "Start date" });
    await user.type(input, "11/23/2026");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith("2026-11-23");
    await user.clear(input);
    await user.type(input, "tomorrow{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("2026-11-11");
    expect(input).toHaveValue("11/11/2026");
  });

  it("keeps the text and flags unparseable or out-of-range input", async () => {
    const onInputError = vi.fn();
    const { user } = renderWithProviders(<DatePicker aria-label="Hire date" min="2026-11-01" onInputError={onInputError} />);
    const input = screen.getByRole("textbox", { name: "Hire date" });
    await user.type(input, "next week");
    await user.tab();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveValue("next week");
    expect(onInputError).toHaveBeenLastCalledWith("invalid", "Enter a valid date (MM/DD/YYYY)");
    await user.clear(input);
    await user.type(input, "10/01/2026");
    await user.tab();
    expect(onInputError).toHaveBeenLastCalledWith("beforeMin", "Choose Nov 1, 2026 or later");
  });

  it("opens the calendar, focuses the selected day, picks one and returns focus", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<DatePicker aria-label="Publish date" defaultValue="2026-11-20" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    const dialog = await screen.findByRole("dialog");
    expect(document.activeElement).toHaveAccessibleName(/November 20, 2026, selected/);
    await user.keyboard(keys.right);
    await user.keyboard(keys.enter);
    expect(onValueChange).toHaveBeenLastCalledWith("2026-11-21");
    expect(dialog).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Publish date" })).toHaveFocus();
  });

  it("Escape closes the popover", async () => {
    const { user } = renderWithProviders(<DatePicker aria-label="Publish date" />);
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    await screen.findByRole("dialog");
    await user.keyboard(keys.escape);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("button trigger shows a readable date and submits a hidden value", async () => {
    const { container, user } = renderWithProviders(<DatePicker trigger="button" name="due" defaultValue="2026-11-23" aria-label="Due" clearable />);
    const button = screen.getByRole("button", { name: /^Due\b/ });
    expect(button).toHaveTextContent("November 23, 2026");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    expect(container.querySelector('input[type="hidden"][name="due"]')).toHaveValue("2026-11-23");
    await user.click(button);
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Clear date" }));
    expect(button).toHaveTextContent("Pick a date");
  });

  it("uses the Turkish pattern", () => {
    renderWithProviders(<DatePicker aria-label="Tarih" defaultValue="2026-11-23" />, { locale: "tr-TR" });
    expect(screen.getByRole("textbox", { name: "Tarih" })).toHaveValue("23.11.2026");
  });
});

describe("DateTimePicker", () => {
  it("combines a date and a time into YYYY-MM-DDTHH:mm", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<DateTimePicker onValueChange={onValueChange} hourCycle={24} timeZone="Europe/Istanbul" />);
    await user.type(screen.getByRole("textbox", { name: "Date" }), "11/12/2026");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith("2026-11-12T09:00");
    expect(screen.getByText("GMT+3")).toBeInTheDocument();
    await expectNoA11yViolations();
  });
});
