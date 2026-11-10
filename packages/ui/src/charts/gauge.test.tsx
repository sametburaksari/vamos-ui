import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { LocaleProvider } from "../lib/locale";
import { Gauge, ProgressRing } from "./gauge";

const bands = [
  { at: 0, color: "danger" as const, label: "Poor" },
  { at: 50, color: "warning" as const, label: "Fair" },
  { at: 80, color: "success" as const, label: "Good" },
];

describe("Gauge", () => {
  it("is a meter with a value text that names the band", async () => {
    const { container } = render(<Gauge value={64} aria-label="SEO score" thresholds={bands} color="auto" showThresholdBands />);
    const meter = screen.getByRole("meter", { name: "SEO score" });
    expect(meter).toHaveAttribute("aria-valuenow", "64");
    expect(meter).toHaveAttribute("aria-valuetext", "64 of 100, Fair");
    expect(container.querySelector(".vui-gauge-value")).toHaveAttribute("stroke", "var(--warning)");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("marks a target and caps the value at max", () => {
    render(<Gauge value={118} max={100} target={100} aria-label="Quota" format="percent" />);
    const meter = screen.getByRole("meter", { name: "Quota" });
    expect(meter).toHaveAttribute("aria-valuenow", "100");
    expect(meter.getAttribute("aria-valuetext")).toBe("118% of 100%, Target 100%");
  });

  it("handles an unknown value", () => {
    render(<Gauge value={null} aria-label="NPS" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "No value");
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("ProgressRing", () => {
  it("is a progressbar, localised", async () => {
    const { container } = render(
      <LocaleProvider locale="tr-TR">
        <ProgressRing value={85} aria-label="Profil" format="percent" />
      </LocaleProvider>,
    );
    const bar = screen.getByRole("progressbar", { name: "Profil" });
    expect(bar).toHaveAttribute("aria-valuetext", "%85 of %100");
    expect(container).toHaveTextContent("%85");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("hides the label at xs", () => {
    const { container } = render(<ProgressRing value={3} max={8} size="xs" aria-label="Checklist" />);
    expect(container.textContent).toBe("");
  });
});
