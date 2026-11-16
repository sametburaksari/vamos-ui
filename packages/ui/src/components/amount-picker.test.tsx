import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { AmountPicker, type AmountOption } from "./amount-picker";
import { impactFor } from "./amount-impact";
import { tr } from "../locales/tr";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const once: AmountOption[] = [
  { value: 250, impact: "Ten new picture books" },
  { value: 500, impact: "A month of reading club", badge: "Most chosen" },
  { value: 1000, impact: "A shelf for a new room" },
];
const monthly: AmountOption[] = [{ value: 100, impact: "Four books a month" }, { value: 200 }, { value: 400 }];

describe("impactFor", () => {
  it("takes the largest preset at or below the amount", () => {
    expect(impactFor(once, 700)).toBe("A month of reading club");
    expect(impactFor(once, 100)).toBeNull();
    expect(impactFor(once, null)).toBeNull();
  });
});

describe("AmountPicker", () => {
  it("picks a preset and announces its impact", async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithProviders(<AmountPicker amounts={(f) => (f === "monthly" ? monthly : once)} onValueChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "How often" })).toBeInTheDocument();
    expect(container.querySelector("[data-slot=amount-summary]")).toHaveTextContent("$250 onceTen new picture books");
    await user.click(screen.getByRole("radio", { name: /\$500/ }));
    expect(onChange).toHaveBeenLastCalledWith({ frequency: "once", amount: 500 });
    expect(screen.getByText("A month of reading club")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("swaps the presets with the frequency, keeping the position", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<AmountPicker amounts={(f) => (f === "monthly" ? monthly : once)} defaultValue={{ amount: 500 }} onValueChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "Monthly" }));
    expect(onChange).toHaveBeenLastCalledWith({ frequency: "monthly", amount: 200 });
    expect(screen.getByText("$200 a month")).toBeInTheDocument();
  });

  it("takes a custom amount within bounds and posts it", async () => {
    const { user, container } = renderWithProviders(
      <form>
        <AmountPicker amounts={once} frequencies={false} min={50} name="amount" frequencyName="frequency" />
      </form>,
    );
    expect(screen.queryByRole("radiogroup", { name: "How often" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Other amount" }));
    const field = screen.getByRole("textbox", { name: "Your amount" });
    fireEvent.change(field, { target: { value: "20" } });
    fireEvent.blur(field);
    expect(screen.getByText("The minimum is $50.")).toBeInTheDocument();
    expect(new FormData(container.querySelector("form")!).get("amount")).toBe("");
    fireEvent.change(field, { target: { value: "750" } });
    fireEvent.blur(field);
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("amount")).toBe("750");
    expect(data.get("frequency")).toBe("once");
    expect(screen.getByText("A month of reading club")).toBeInTheDocument();
  });

  it("formats in Turkish", () => {
    renderWithProviders(<AmountPicker amounts={monthly} defaultValue={{ frequency: "monthly", amount: 100 }} labels={{ summaryRecurring: "{suffix} {amount}", perMonth: "aylık" }} />, { locale: "tr-TR", currency: "TRY" });
    expect(screen.getByText("aylık ₺100")).toBeInTheDocument();
  });
  it("uses the Turkish dictionary", () => {
    renderWithProviders(<AmountPicker amounts={monthly} defaultValue={{ frequency: "monthly", amount: 200 }} />, { locale: "tr-TR", currency: "TRY", messages: tr });
    expect(screen.getByRole("radiogroup", { name: "Ne sıklıkla" })).toBeInTheDocument();
    expect(screen.getByText("Her ay ₺200")).toBeInTheDocument();
  });
});
