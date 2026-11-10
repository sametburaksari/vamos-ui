import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Switch } from "./switch";
import { Field } from "./input";

describe("Switch", () => {
  it("toggles with Space and by clicking the label", async () => {
    const onChange = vi.fn();
    const { container } = render(<Switch label="Maintenance mode" description="Visitors see a holding page." onCheckedChange={onChange} />);
    const sw = screen.getByRole("switch", { name: "Maintenance mode" });
    expect(sw).toHaveAccessibleDescription("Visitors see a holding page.");
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(sw).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByText("Maintenance mode"));
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("loading locks the switch and sets aria-busy", async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Active" loading onCheckedChange={onChange} />);
    const sw = screen.getByRole("switch", { name: "Active" });
    expect(sw).toHaveAttribute("aria-busy", "true");
    await userEvent.click(sw);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reads Field context", async () => {
    const { container } = render(
      <Field label="Accept online bookings" orientation="horizontal" hint="Guests can book a table from your website.">
        <Switch size="sm" />
      </Field>,
    );
    const sw = screen.getByRole("switch", { name: "Accept online bookings" });
    expect(sw).toHaveAccessibleDescription("Guests can book a table from your website.");
    expect(sw).toHaveAttribute("data-size", "sm");
    expect(await axe(container)).toHaveNoViolations();
  });
});
