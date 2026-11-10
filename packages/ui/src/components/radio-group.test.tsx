import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Field } from "./input";

const visibility = [
  { value: "public", label: "Public", description: "Anyone with the link." },
  { value: "private", label: "Private", description: "Only your team." },
  { value: "password", label: "Password protected" },
];

describe("RadioGroup", () => {
  it("is labelled by the Field and has no a11y violations", async () => {
    const { container } = render(
      <Field label="Visibility" hint="You can change this later.">
        <RadioGroup defaultValue="public" items={visibility} />
      </Field>,
    );
    const group = screen.getByRole("radiogroup", { name: "Visibility" });
    expect(group).toHaveAccessibleDescription("You can change this later.");
    expect(screen.getByRole("radio", { name: "Public" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Private" })).toHaveAccessibleDescription("Only your team.");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("arrow keys move and select (single tab stop)", async () => {
    const onChange = vi.fn();
    render(<RadioGroup aria-label="Visibility" defaultValue="public" items={visibility} onValueChange={onChange} />);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Public" })).toHaveFocus();
    // hold the key: Radix selects on the focus that an arrow key causes
    await userEvent.keyboard("{ArrowDown>}");
    expect(screen.getByRole("radio", { name: "Private" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Private" })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith("private");
    await userEvent.keyboard("{/ArrowDown}");
  });

  it("segmented variant selects on click", async () => {
    const { container } = render(
      <RadioGroup variant="segmented" aria-label="Billing period" defaultValue="monthly">
        <RadioGroupItem value="monthly" label="Monthly" />
        <RadioGroupItem value="yearly" label="Yearly" />
      </RadioGroup>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Yearly" }));
    expect(screen.getByRole("radio", { name: "Yearly" })).toBeChecked();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("card variant: clicking the card selects", async () => {
    render(
      <RadioGroup variant="card" aria-label="Plan" items={[{ value: "starter", label: "Starter", description: "Up to 3 seats." }, { value: "team", label: "Team", description: "Up to 25 seats." }]} />,
    );
    await userEvent.click(screen.getByText("Up to 25 seats."));
    expect(screen.getByRole("radio", { name: "Team" })).toBeChecked();
  });

  it("read-only keeps the selection", async () => {
    render(<RadioGroup aria-label="Invoice type" readOnly defaultValue="individual" items={[{ value: "individual", label: "Individual" }, { value: "company", label: "Company" }]} />);
    await userEvent.click(screen.getByRole("radio", { name: "Company" }));
    expect(screen.getByRole("radio", { name: "Individual" })).toBeChecked();
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-readonly", "true");
  });
});
