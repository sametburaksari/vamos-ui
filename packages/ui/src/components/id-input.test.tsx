import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./input";
import { IdInput, NationalIdInput, TaxIdInput, registerIdRule, getIdRule } from "./id-input";

describe("IdInput", () => {
  it("validates TCKN and reports YKN as its own kind", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="ID number">
        <NationalIdInput onValueChange={onValueChange} />
      </Field>,
    );
    const input = screen.getByLabelText("ID number") as HTMLInputElement;
    await user.type(input, "9923817467612");
    expect(input.value).toBe("99238174676");
    expect(onValueChange).toHaveBeenLastCalledWith("99238174676", expect.objectContaining({ valid: true, kind: "tr-ykn" }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a checksum error and masks a valid value when not focused", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn();
    render(
      <>
        <IdInput aria-label="TCKN" kind="tr-tckn" onValidate={onValidate} />
        <TaxIdInput aria-label="Tax ID" masked defaultValue="1847205636" />
      </>,
    );
    const tax = screen.getByLabelText("Tax ID") as HTMLInputElement;
    expect(tax.value).toBe("184*****36");
    await user.type(screen.getByLabelText("TCKN"), "38291746551");
    await user.tab(); // focus moves to the tax field → revealed
    expect(onValidate).toHaveBeenLastCalledWith(expect.objectContaining({ valid: false, reason: "checksum" }));
    expect(tax).toHaveFocus();
    expect(tax.value).toBe("1847205636");
  });

  it("accepts registered rules", () => {
    registerIdRule({ id: "test-member", label: "Member no.", lengths: [6], normalize: (v) => v.trim(), validate: (v) => ({ valid: v.length === 6, value: v }), charset: "alphanumeric" });
    expect(getIdRule("test-member")?.label).toBe("Member no.");
  });
});
