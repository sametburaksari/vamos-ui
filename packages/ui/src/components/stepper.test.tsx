import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Step, Stepper } from "./stepper";

/** Text a screen reader gets: aria-hidden parts removed. */
const spoken = (el: Element) => {
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll("[aria-hidden]").forEach((n) => n.remove());
  return clone.textContent;
};

const steps = [{ title: "Upload" }, { title: "Map columns" }, { title: "Review" }, { title: "Import" }];

describe("Stepper", () => {
  it("is an ordered list with aria-current and status in the name", async () => {
    const { container } = render(<Stepper value={1} steps={steps} />);
    const list = screen.getAllByRole("list", { name: "Progress" })[0]!;
    const items = list.querySelectorAll(":scope > li");
    expect(items).toHaveLength(4);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(spoken(items[0]!)).toBe("Step 1 of 4, Upload, Completed");
    expect(spoken(items[1]!)).toBe("Step 2 of 4, Map columns, Current");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("completed steps are clickable buttons; upcoming are plain text", async () => {
    const onValueChange = vi.fn();
    render(<Stepper value={2} steps={steps} onValueChange={onValueChange} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: /Upload/ }));
    expect(onValueChange).toHaveBeenCalledWith(0);
  });

  it("navigable='all' and per-step error status", async () => {
    const { container } = render(<Stepper value={2} navigable="all" onValueChange={() => {}} steps={[{ title: "Details", status: "error" }, ...steps.slice(1)]} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: /Details, Needs attention/ })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("vertical with compound Step shows content under the current step", () => {
    render(
      <Stepper value={1} orientation="vertical">
        <Step title="Company">Company form</Step>
        <Step title="Billing" optional>
          Billing form
        </Step>
        <Step title="Invite team" />
      </Stepper>,
    );
    expect(screen.getByText("Billing form")).toBeInTheDocument();
    expect(screen.queryByText("Company form")).toBeNull();
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("compact variant summarises the position", async () => {
    const { container } = render(<Stepper value={1} steps={steps} variant="compact" />);
    expect(container).toHaveTextContent("Map columns");
    expect(await axe(container)).toHaveNoViolations();
  });
});
