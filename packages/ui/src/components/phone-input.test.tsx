import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./input";
import { PhoneInput, preloadPhoneInput } from "./phone-input";

describe("PhoneInput", () => {
  beforeAll(async () => {
    await preloadPhoneInput();
  });

  it("formats for the selected country and emits E.164", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Mobile">
        <PhoneInput defaultCountry="TR" onValueChange={onValueChange} />
      </Field>,
    );
    const input = screen.getByLabelText("Mobile") as HTMLInputElement;
    await user.type(input, "05321234567");
    expect(input.value).toBe("0532 123 45 67");
    expect(onValueChange).toHaveBeenLastCalledWith("+905321234567", expect.objectContaining({ valid: true, kind: "TR" }));
    expect(screen.getByRole("combobox", { name: "Country" })).toHaveValue("TR");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("normalizes 0090 / 90 prefixes and switches country from +", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PhoneInput aria-label="Phone" defaultCountry="TR" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Phone") as HTMLInputElement;
    await user.type(input, "905321234567");
    expect(onValueChange).toHaveBeenLastCalledWith("+905321234567", expect.anything());
    await user.clear(input);
    await user.type(input, "+442071838750");
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Country" })).toHaveValue("GB"));
    expect(onValueChange).toHaveBeenLastCalledWith("+442071838750", expect.anything());
  });

  it("handles 444 corporate numbers", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PhoneInput aria-label="Phone" defaultCountry="TR" onValueChange={onValueChange} />);
    await user.type(screen.getByLabelText("Phone"), "4441444");
    expect(onValueChange).toHaveBeenLastCalledWith("+904441444", expect.objectContaining({ valid: true }));
  });
});
