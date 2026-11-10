import * as React from "react";
import { screen } from "@testing-library/react";
import { Progress, ProgressCircle } from "./progress";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("Progress", () => {
  it("exposes progressbar values, label and value text, and passes axe", async () => {
    const { container } = renderWithProviders(<Progress label="Uploading 4 files" value={42} showValue />);
    const bar = screen.getByRole("progressbar", { name: "Uploading 4 files" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuetext", "42%");
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(bar.querySelector<HTMLElement>("[data-slot=progress-indicator]")!.style.transform).toBe("scaleX(0.42)");
    await expectNoA11yViolations(container);
  });

  it("formats with the locale (tr: %42) and fractions", () => {
    renderWithProviders(
      <>
        <Progress aria-label="Yükleniyor" value={42} />
        <Progress aria-label="Contacts imported" value={1240} max={5000} display="fraction" />
      </>,
      { locale: "tr-TR" },
    );
    expect(screen.getByRole("progressbar", { name: "Yükleniyor" })).toHaveAttribute("aria-valuetext", "%42");
    expect(screen.getByRole("progressbar", { name: "Contacts imported" })).toHaveAttribute("aria-valuetext", "1.240 of 5.000");
  });

  it("is indeterminate with null (no aria-valuenow)", async () => {
    const { container } = renderWithProviders(<Progress aria-label="Preparing export" value={null} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-state", "indeterminate");
    await expectNoA11yViolations(container);
  });

  it("tone=auto warns above 80% and turns danger at the limit; accent completes as success", () => {
    renderWithProviders(
      <>
        <Progress aria-label="a" value={85} tone="auto" />
        <Progress aria-label="b" value={11} max={10} tone="auto" />
        <Progress aria-label="c" value={100} />
      </>,
    );
    expect(screen.getByRole("progressbar", { name: "a" })).toHaveAttribute("data-tone", "warning");
    const over = screen.getByRole("progressbar", { name: "b" });
    expect(over).toHaveAttribute("data-tone", "danger");
    expect(over).toHaveAttribute("aria-valuenow", "10");
    expect(over).toHaveAttribute("aria-valuetext", "110%");
    expect(screen.getByRole("progressbar", { name: "c" })).toHaveAttribute("data-tone", "success");
  });
});

describe("ProgressCircle", () => {
  it("renders an accessible ring with the value in the centre", async () => {
    const { container } = renderWithProviders(<ProgressCircle aria-label="Profile complete" value={72} size="lg" />);
    const ring = screen.getByRole("progressbar", { name: "Profile complete" });
    expect(ring).toHaveAttribute("aria-valuetext", "72%");
    expect(ring.querySelector("circle[stroke-dasharray]")).toHaveAttribute("stroke-dasharray", "72 100");
    expect(screen.getByText("72%")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("indeterminate announces loading", () => {
    renderWithProviders(<ProgressCircle aria-label="Syncing" size="sm" />);
    const ring = screen.getByRole("progressbar");
    expect(ring).toHaveAttribute("data-state", "indeterminate");
    expect(ring).toHaveAttribute("aria-valuetext", "Loading…");
  });
});
