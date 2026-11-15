import * as React from "react";
import { screen } from "@testing-library/react";
import { GoalMeter, daysUntil } from "./goal-meter";
import { tr } from "../locales/tr";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("daysUntil", () => {
  it("counts whole days to the end of the deadline day", () => {
    expect(daysUntil("2026-12-31", "2026-12-21T10:00:00")).toBe(10);
    expect(daysUntil("2026-12-31", "2026-12-31T08:00:00")).toBe(0);
    expect(daysUntil("2026-12-31", "2027-01-01T08:00:00")).toBe(-1);
  });
});

describe("GoalMeter", () => {
  it("shows raised against the goal with backers and days left", async () => {
    const { container } = renderWithProviders(<GoalMeter label="Spring campaign" value={182400} goal={250000} backers={612} deadline="2026-12-31" now="2026-12-21T10:00:00" />);
    const bar = screen.getByRole("progressbar", { name: "Raised towards the goal" });
    expect(bar).toHaveAttribute("aria-valuetext", "$182,400 of $250,000 raised, 73%");
    expect(screen.getByText(/612 backers/)).toBeInTheDocument();
    expect(container.querySelector("[data-slot=goal-meter-timing]")).toHaveTextContent("10 days left · Ends December 31");
    await expectNoA11yViolations(container);
  });

  it("marks a reached goal and an ended campaign", () => {
    const { container } = renderWithProviders(<GoalMeter value={260000} goal={250000} backers={1} deadline="2026-12-31" now="2027-01-03" />);
    expect(container.querySelector("[data-slot=goal-meter]")).toHaveAttribute("data-state", "reached");
    expect(screen.getByText(/Goal reached/)).toBeInTheDocument();
    expect(screen.getByText(/1 backer ·/)).toBeInTheDocument();
    expect(screen.getByText("Ended December 31")).toBeInTheDocument();
  });

  it("reads as stock left, low and sold out", () => {
    const { rerender, container } = renderWithProviders(<GoalMeter variant="stock" value={6} goal={40} />);
    expect(screen.getByRole("progressbar", { name: "Stock left" })).toHaveAttribute("aria-valuetext", "6 of 40 left");
    expect(screen.getByText("Almost gone")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-tone", "warning");
    rerender(<GoalMeter variant="stock" value={0} goal={40} />);
    expect(container.querySelector("[data-slot=goal-meter]")).toHaveAttribute("data-state", "sold-out");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "Sold out");
  });

  it("formats in Turkish", () => {
    renderWithProviders(<GoalMeter value={1500} goal={10000} backers={3} labels={{ valueText: "{goal} hedefin {percent} kadarı toplandı ({value})", backers: "{count} bağışçı" }} />, { locale: "tr-TR", currency: "TRY" });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "₺10.000 hedefin %15 kadarı toplandı (₺1.500)");
    expect(screen.getByText(/3 bağışçı/)).toBeInTheDocument();
  });
  it("uses the Turkish dictionary", () => {
    renderWithProviders(<GoalMeter variant="stock" value={4} goal={40} />, { locale: "tr-TR", messages: tr });
    expect(screen.getByRole("progressbar", { name: "Kalan stok" })).toHaveAttribute("aria-valuetext", "40 adetten 4 kaldı");
    expect(screen.getByText("Tükenmek üzere")).toBeInTheDocument();
  });
});
