import * as React from "react";
import { act, screen } from "@testing-library/react";
import { SlaTimer, slaState } from "./sla-timer";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const NOW = Date.parse("2026-11-18T10:24:00+03:00");
const min = (m: number) => NOW + m * 60_000;

describe("slaState", () => {
  it("moves from on track to at risk to breached, and freezes as met / missed / paused", () => {
    expect(slaState({ start: min(-10), due: min(50), now: NOW }).state).toBe("on-track");
    expect(slaState({ start: min(-50), due: min(10), now: NOW }).state).toBe("at-risk");
    expect(slaState({ due: min(20), warnMinutes: 30, now: NOW }).state).toBe("at-risk");
    expect(slaState({ due: min(-5), now: NOW }).state).toBe("breached");
    expect(slaState({ due: min(-5), completedAt: min(-20), now: NOW })).toMatchObject({ state: "met", remaining: 15 * 60_000 });
    expect(slaState({ due: min(-20), completedAt: min(-5), now: NOW }).state).toBe("missed");
    expect(slaState({ start: min(-30), due: min(30), pausedAt: min(-15), now: NOW })).toMatchObject({ state: "paused", used: 0.25 });
  });
});

describe("SlaTimer", () => {
  it("is a timer with a full sentence and a state", async () => {
    const { container } = renderWithProviders(<SlaTimer label="First response" start={min(-40)} due={min(12)} now={NOW} />);
    const timer = screen.getByRole("timer", { name: "First response: Due in 12m" });
    expect(timer).toHaveAttribute("data-state", "at-risk");
    expect(timer).toHaveTextContent("12m");
    await expectNoA11yViolations(container);
  });

  it("shows overdue and met states, and the bar variant", () => {
    renderWithProviders(
      <>
        <SlaTimer label="Resolution" due={min(-95)} now={NOW} />
        <SlaTimer label="Reply" due={min(30)} completedAt={min(-3)} now={NOW} variant="inline" />
        <SlaTimer label="Delivery" start={min(-60)} due={min(60)} now={NOW} variant="bar" />
      </>,
    );
    const overdue = screen.getByRole("timer", { name: "Resolution: Overdue by 1h 35m" });
    expect(overdue).toHaveAttribute("data-state", "breached");
    expect(overdue).toHaveTextContent("−1h 35m");
    expect(screen.getByRole("timer", { name: "Reply: Met with 33m to spare" })).toHaveTextContent("Met");
    const bar = screen.getByRole("timer", { name: "Delivery: Due in 1h" });
    expect(bar.querySelector("[style]")!.getAttribute("style")).toContain("scaleX(0.5)");
  });

  it("ticks live without a fixed now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    renderWithProviders(<SlaTimer label="Reply" due={min(2)} />);
    expect(screen.getByRole("timer")).toHaveAccessibleName("Reply: Due in 2m");
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("timer")).toHaveAccessibleName("Reply: Due in 1m 55s");
    vi.useRealTimers();
  });

  it("formats with the locale", () => {
    renderWithProviders(<SlaTimer due={min(-30)} now={NOW} labels={{ overdue: "{time} gecikti" }} />, { locale: "tr-TR" });
    expect(screen.getByRole("timer").getAttribute("aria-label")).toMatch(/30 dk\.? gecikti/);
  });
});
