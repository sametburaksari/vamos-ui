import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { FormattedInput, NumberInput, PercentInput, createDecimalFormat, maskFormatter } from "./formatted-input";
import { LocaleProvider } from "../lib/locale";
import { caretAfterAccepted, countAccepted } from "../lib/use-formatted-input";

const digit = (c: string) => c >= "0" && c <= "9";
describe("useFormattedInput helpers", () => {
  it("maps the caret by significant characters", () => {
    expect(countAccepted("1.25", digit)).toBe(3);
    expect(caretAfterAccepted("1.250", 2, digit)).toBe(3);
    expect(caretAfterAccepted("1.250", 0, digit)).toBe(0);
    expect(caretAfterAccepted("12", 5, digit)).toBe(2);
  });
});

describe("createDecimalFormat", () => {
  it("groups live with locale separators and keeps decimals as typed", () => {
    const tr = createDecimalFormat({ locale: "tr-TR", precision: 2, fixed: true });
    expect(tr.format("1250000,5")).toBe("1.250.000,5");
    expect(tr.parse("1.250.000,5")).toBe("1250000.50");
    expect(tr.formatOnBlur(",5")).toBe("0,50");
    expect(tr.toDisplay("1250.5")).toBe("1.250,50");
    const en = createDecimalFormat({ locale: "en-US", precision: 2, fixed: true });
    expect(en.format("0012345.678")).toBe("12,345.67");
    expect(en.isSameValue("12.5", "12.50")).toBe(true);
  });

  it("maskFormatter inserts literals", () => {
    const m = maskFormatter("(###) ###-####");
    expect(m.format("4155550132")).toBe("(415) 555-0132");
    expect(m.parse("(415) 555-0132")).toBe("4155550132");
  });
});

describe("NumberInput & PercentInput", () => {
  it("is a spinbutton with arrow keys and stepper buttons", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<NumberInput aria-label="Quantity" defaultValue={4} min={1} max={10} stepper onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("5");
    expect(onValueChange).toHaveBeenLastCalledWith(5, expect.anything());
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(input).toHaveValue("10");
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(input).toHaveValue("9");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("puts the percent sign where the locale does", () => {
    const { unmount } = render(
      <LocaleProvider locale="tr-TR">
        <PercentInput aria-label="İndirim" defaultValue={12.5} />
      </LocaleProvider>,
    );
    const input = screen.getByLabelText("İndirim") as HTMLInputElement;
    expect(input.value).toBe("12,5");
    const box = input.closest('[data-slot="input"]')!;
    expect(box.textContent?.indexOf("%")).toBe(0);
    unmount();
  });
});

describe("FormattedInput", () => {
  it("applies a mask and validates completeness on blur", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn();
    render(<FormattedInput aria-label="Order" mask="AA-####" uppercase onValidate={onValidate} />);
    const input = screen.getByLabelText("Order") as HTMLInputElement;
    await user.type(input, "po12");
    expect(input.value).toBe("PO-12");
    await user.tab();
    expect(onValidate).toHaveBeenLastCalledWith(expect.objectContaining({ valid: false, reason: "incomplete" }));
  });
});
