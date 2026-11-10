import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./input";
import { CurrencyInput } from "./currency-input";
import { LocaleProvider } from "../lib/locale";

describe("CurrencyInput", () => {
  it("formats while typing, keeps the caret and emits a decimal string", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <LocaleProvider locale="tr-TR" currency="TRY">
        <Field label="Tutar">
          <CurrencyInput onValueChange={onValueChange} />
        </Field>
      </LocaleProvider>,
    );
    const input = screen.getByLabelText("Tutar") as HTMLInputElement;
    await user.type(input, "1250000");
    expect(input.value).toBe("1.250.000");
    // "." starts the decimals even though "." is the Turkish group separator
    await user.type(input, ".5");
    expect(input.value).toBe("1.250.000,5");
    expect(onValueChange).toHaveBeenLastCalledWith("1250000.50", expect.objectContaining({ valid: true, formatted: "1.250.000,5" }));
    // caret stays put when a group separator appears in front of it
    input.setSelectionRange(1, 1);
    await user.keyboard("9");
    expect(input.value).toBe("19.250.000,5");
    expect(input.selectionStart).toBe(2);
    await user.tab();
    expect(input.value).toBe("19.250.000,50");
    expect(screen.getByText("₺")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Backspace over a group separator deletes the digit before it", async () => {
    const user = userEvent.setup();
    render(<CurrencyInput aria-label="Amount" currency="USD" defaultValue="1250.00" />);
    const input = screen.getByLabelText("Amount") as HTMLInputElement;
    expect(input.value).toBe("1,250.00");
    await user.click(input);
    input.setSelectionRange(2, 2);
    await user.keyboard("{Backspace}");
    expect(input.value).toBe("250.00");
  });

  it("parses pasted amounts and reports min on blur", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn();
    render(<CurrencyInput aria-label="Amount" currency="USD" min="10" onValidate={onValidate} name="amount" />);
    const input = screen.getByLabelText("Amount") as HTMLInputElement;
    await user.click(input);
    await user.paste("$1,250.5");
    expect(input.value).toBe("1,250.5");
    await user.clear(input);
    await user.type(input, "4");
    await user.tab();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onValidate).toHaveBeenLastCalledWith(expect.objectContaining({ valid: false, reason: "min", message: "Must be at least $10.00" }));
    expect(document.querySelector<HTMLInputElement>('input[type=hidden][name="amount"]')!.value).toBe("4.00");
  });

  it("syncs a controlled value", () => {
    function Controlled() {
      const [v, setV] = React.useState<string | null>("99.90");
      return (
        <>
          <CurrencyInput aria-label="Price" currency="EUR" value={v} onValueChange={setV} />
          <button onClick={() => setV("1200")}>Set</button>
        </>
      );
    }
    render(<Controlled />);
    const input = screen.getByLabelText("Price") as HTMLInputElement;
    expect(input.value).toBe("99.90");
    fireEvent.click(screen.getByText("Set"));
    expect(input.value).toBe("1,200.00");
  });
});
