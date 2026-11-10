import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { StatsBand } from "./stats-band";

const items = [
  { value: 4.8, label: "Google rating", source: "1,240 reviews, Nov 2026" },
  { value: 1240, label: "Reviews" },
  { value: 38, unit: "%", label: "Bookings via WhatsApp" },
  { value: "11 min", label: "Median first reply" },
];

describe("StatsBand", () => {
  it("inline: a definition list with Intl-formatted figures and spoken units", async () => {
    const { container } = render(<main><StatsBand title="In numbers" items={items} /></main>);
    expect(container.querySelector("dl")).not.toBeNull();
    expect(container.querySelectorAll("dt")).toHaveLength(4);
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("1,240")).toBeInTheDocument();
    expect(screen.getByText("percent")).toHaveClass("sr-only");
    expect(screen.getByText("%")).toHaveAttribute("aria-hidden");
    expect(screen.getByText("11 min")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("formats per locale", () => {
    render(<StatsBand locale="tr-TR" items={items.slice(0, 2)} labels={{ percent: "yüzde" }} />);
    expect(screen.getByText("4,8")).toBeInTheDocument();
    expect(screen.getByText("1.240")).toBeInTheDocument();
  });

  it("ledger + with-text", async () => {
    const { container, rerender } = render(<main><StatsBand variant="ledger" title="2026 at a glance" items={items} /></main>);
    expect(container.querySelectorAll(".vb-leader")).toHaveLength(4);
    expect(screen.getByText("1,240 reviews, Nov 2026").tagName).toBe("DD");
    expect(await axe(container)).toHaveNoViolations();
    rerender(<main><StatsBand variant="with-text" title="Why it works" body="Most of our clients answer bookings on WhatsApp." items={items} /></main>);
    expect(screen.getByText(/Most of our clients/)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
