import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { DateRangePicker } from "./date-range-picker";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 10, 10, 0));
});
afterEach(() => vi.useRealTimers());

describe("DateRangePicker", () => {
  it("shows the range on the trigger and passes axe when open", async () => {
    const mm = vi.spyOn(window, "matchMedia").mockImplementation((q: string) => ({ matches: true, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList);
    const { user } = renderWithProviders(<DateRangePicker aria-label="Report period" presets defaultValue={{ from: "2026-11-01", to: "2026-11-10" }} />);
    const trigger = screen.getByRole("button", { name: /^Report period\b/ });
    expect(trigger).toHaveTextContent("Nov 1 – 10, 2026");
    await user.click(trigger);
    await screen.findByRole("dialog");
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    await expectNoA11yViolations();
    mm.mockRestore();
  });

  it("picks from and to and closes (immediate)", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<DateRangePicker aria-label="Stay" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: /^Stay\b/ }));
    await user.click(await screen.findByRole("button", { name: /November 3, 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: "2026-11-03" });
    expect(screen.getByText("From November 3, 2026. Now pick the end date.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /November 7, 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: "2026-11-03", to: "2026-11-07" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("presets are a listbox operated by keyboard", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<DateRangePicker aria-label="Period" presets onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: /^Period\b/ }));
    const list = await screen.findByRole("listbox", { name: "Quick ranges" });
    const options = within(list).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toContain("Last 7 days");
    options[0]!.focus();
    await user.keyboard(keys.down);
    await user.keyboard(keys.down);
    await user.keyboard(keys.enter);
    expect(onValueChange).toHaveBeenLastCalledWith({ from: "2026-11-04", to: "2026-11-10" });
  });

  it("apply mode commits only on Apply", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<DateRangePicker aria-label="Campaign" commit="apply" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: /^Campaign\b/ }));
    await user.click(await screen.findByRole("button", { name: /November 12, 2026/ }));
    await user.click(screen.getByRole("button", { name: /November 14, 2026/ }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByText("3 days")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith({ from: "2026-11-12", to: "2026-11-14" });
  });

  it("blocks days beyond maxDays while picking the end", async () => {
    const { user } = renderWithProviders(<DateRangePicker aria-label="Leave" maxDays={5} />);
    await user.click(screen.getByRole("button", { name: /^Leave\b/ }));
    await user.click(await screen.findByRole("button", { name: /November 10, 2026/ }));
    expect(screen.getByRole("button", { name: /November 14, 2026/ })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /November 15, 2026/ })).toBeDisabled();
  });

  it("input trigger has two typeable fields", async () => {
    const onValueChange = vi.fn();
    const { user, container } = renderWithProviders(<DateRangePicker trigger="input" aria-label="Booking" nameFrom="from" nameTo="to" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("textbox", { name: "Start date" }), "11/20/2026");
    await user.tab();
    await user.type(screen.getByRole("textbox", { name: "End date" }), "11/23/2026");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith({ from: "2026-11-20", to: "2026-11-23" });
    expect(container.querySelector('input[name="to"]')).toHaveValue("2026-11-23");
  });
});
