import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Funnel } from "./funnel";

const steps = [
  { key: "leads", label: "Leads", value: 1240, amount: 1860000 },
  { key: "qualified", label: "Qualified", value: 610, amount: 1220000 },
  { key: "proposal", label: "Proposal", value: 205, amount: 640000 },
  { key: "won", label: "Won", value: 84, amount: 262000 },
];

describe("Funnel", () => {
  it("is an ordered list with a sentence per stage", async () => {
    const { container } = render(<Funnel title="Sales pipeline" steps={steps} />);
    const list = screen.getByRole("list", { name: "Sales pipeline" });
    expect(list.querySelectorAll("li")).toHaveLength(4);
    expect(screen.getByText("Proposal: 205 (34% of Qualified), $640,000.00")).toBeInTheDocument();
    expect(container).toHaveTextContent("−405");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("makes stages buttons when clickable", async () => {
    const user = userEvent.setup();
    const onStep = vi.fn();
    render(<Funnel title="Pipeline" steps={steps} onStepClick={onStep} />);
    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onStep).toHaveBeenCalledWith(steps[1]);
  });

  it("shows '—' after an empty stage and compares to a previous period", () => {
    const zero = [{ key: "a", label: "Visits", value: 0 }, { key: "b", label: "Signups", value: 0 }];
    const { rerender } = render(<Funnel steps={zero} title="Signup" />);
    expect(screen.getByText("Signups: 0 (— of Visits)")).toBeInTheDocument();
    const prev = steps.map((s) => ({ ...s, value: Math.round(s.value * 0.9) }));
    prev[3]!.value = 60;
    rerender(<Funnel title="Pipeline" steps={steps} compareTo={prev} />);
    expect(screen.getByText(/Won: 84 .*vs previous period/)).toBeInTheDocument();
  });

  it("renders a stepped skeleton while loading", () => {
    render(<Funnel steps={[]} loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
