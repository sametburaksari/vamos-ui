import * as React from "react";
import { act, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Countdown, countdownParts } from "./countdown";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const NOW = Date.parse("2026-11-18T10:00:00Z");
const TO = NOW + ((3 * 24 + 4) * 3600 + 12 * 60 + 9) * 1000; // 3 d 4 h 12 min 9 s

describe("countdownParts", () => {
  it("splits into the chosen units, the largest absorbing the overflow", () => {
    expect(countdownParts(TO, NOW).values).toEqual({ days: 3, hours: 4, minutes: 12, seconds: 9 });
    expect(countdownParts(TO, NOW, ["hours", "minutes"]).values).toEqual({ hours: 76, minutes: 12 });
    expect(countdownParts(TO, TO + 5000)).toMatchObject({ total: 0, done: true });
  });
});

describe("Countdown", () => {
  it("is a timer with one sentence; digits are hidden from screen readers", async () => {
    const { container } = renderWithProviders(<Countdown to={TO} now={NOW} label="Registration opens" highlightLast />);
    const timer = screen.getByRole("timer");
    expect(timer).toHaveAccessibleName("Registration opens: 3 days 4 hours 12 minutes left");
    expect(timer).toHaveAttribute("data-state", "running");
    const days = container.querySelector('[data-unit="days"]')!;
    expect(days).toHaveAttribute("aria-hidden", "true");
    expect(days).toHaveTextContent("03days");
    expect(container.querySelector('[data-unit="seconds"]')).toHaveClass("bg-accent");
    await expectNoA11yViolations(container);
  });

  it("renders the inline variant with configurable units", () => {
    renderWithProviders(<Countdown variant="inline" units={["hours", "minutes", "seconds"]} to={TO} now={NOW} />);
    expect(screen.getByRole("timer")).toHaveTextContent("76h12m09s");
  });

  it("ticks live and completes once", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const onComplete = vi.fn();
    renderWithProviders(<Countdown to={NOW + 3000} onComplete={onComplete} completed="Doors are open" />);
    expect(screen.getByRole("timer")).toHaveAccessibleName("3 seconds left");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("timer")).toHaveAccessibleName("2 seconds left");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Doors are open");
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("shows the zero clock with the completed sentence when no completed content is given", () => {
    const onComplete = vi.fn();
    renderWithProviders(<Countdown to={NOW - 1000} now={NOW} onComplete={onComplete} />);
    expect(screen.getByRole("timer")).toHaveAccessibleName("Time's up");
    expect(screen.getByRole("timer")).toHaveAttribute("data-state", "completed");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("server-renders dashes and a date sentence (no hydration drift)", () => {
    const html = renderToString(<Countdown to="2027-03-01T09:00:00Z" />);
    expect(html).toContain("––");
    expect(html).toMatch(/aria-label="Until Mar 1, 2027/);
    expect(html).toContain('data-state="pending"');
  });

  it("localizes unit captions and the sentence", () => {
    renderWithProviders(<Countdown to={TO} now={NOW} labels={{ remaining: "{time} kaldı" }} />, { locale: "tr-TR" });
    const timer = screen.getByRole("timer");
    expect(timer.getAttribute("aria-label")).toMatch(/^3 gün.*kaldı$/);
    expect(timer.querySelector('[data-unit="hours"]')).toHaveTextContent("saat");
  });
});
