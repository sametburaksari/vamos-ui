import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./input";
import { IbanInput } from "./iban-input";

describe("IbanInput", () => {
  it("groups by four, shows the bank and validates mod-97", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="IBAN">
        <IbanInput onValueChange={onValueChange} />
      </Field>,
    );
    const input = screen.getByLabelText("IBAN") as HTMLInputElement;
    await user.type(input, "tr190006200012345678901234");
    expect(input.value).toBe("TR19 0006 2000 1234 5678 9012 34");
    expect(onValueChange).toHaveBeenLastCalledWith("TR190006200012345678901234", expect.objectContaining({ valid: true, kind: "iban-TR" }));
    expect(input).toHaveAccessibleDescription("Bank: Garanti BBVA");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("caps at the country length and reports a bad checksum", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn();
    render(<IbanInput aria-label="IBAN" onValidate={onValidate} />);
    const input = screen.getByLabelText("IBAN") as HTMLInputElement;
    await user.type(input, "TR18000620001234567890123499");
    expect(input.value.replace(/ /g, "")).toHaveLength(26);
    await user.tab();
    expect(onValidate).toHaveBeenLastCalledWith(expect.objectContaining({ valid: false, reason: "checksum" }));
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("rejects countries outside the list", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn();
    render(<IbanInput aria-label="IBAN" countries={["TR"]} onValidate={onValidate} defaultValue="DE89370400440532013000" />);
    await user.click(screen.getByLabelText("IBAN"));
    await user.tab();
    expect(onValidate).toHaveBeenLastCalledWith(expect.objectContaining({ valid: false, reason: "country" }));
  });
});
