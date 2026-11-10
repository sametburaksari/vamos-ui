import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Slider } from "./slider";
import { Field } from "./input";
import { LocaleProvider } from "../lib/locale";

describe("Slider", () => {
  it("single value: keyboard steps and formatted aria-valuetext", async () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const { container } = render(
      <Slider aria-label="Deal probability" defaultValue={[60]} step={5} formatOptions={{ style: "percent" }} formatValue={(n) => `${n}%`} onValueChange={onChange} onValueCommit={onCommit} />,
    );
    const thumb = screen.getByRole("slider", { name: "Deal probability" });
    expect(thumb).toHaveAttribute("aria-valuetext", "60%");
    await userEvent.tab();
    expect(thumb).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "65");
    expect(onChange).toHaveBeenLastCalledWith([65]);
    expect(onCommit).toHaveBeenLastCalledWith([65]);
    await userEvent.keyboard("{End}");
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("range thumbs are named from the Field label + Minimum / Maximum", async () => {
    const { container } = render(
      <Field label="Price per night">
        <Slider defaultValue={[80, 240]} min={0} max={500} step={10} formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
      </Field>,
    );
    const [lo, hi] = screen.getAllByRole("slider");
    expect(lo).toHaveAccessibleName("Price per night Minimum");
    expect(hi).toHaveAccessibleName("Price per night Maximum");
    expect(lo).toHaveAttribute("aria-valuetext", "$80");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("formats with the provider locale", () => {
    render(
      <LocaleProvider locale="tr-TR">
        <Slider aria-label="Budget" defaultValue={[1250]} max={5000} formatOptions={{ style: "currency", currency: "TRY", maximumFractionDigits: 0 }} />
      </LocaleProvider>,
    );
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", expect.stringContaining("1.250"));
  });

  it("withInputs commits typed values, clamped and snapped", async () => {
    const onCommit = vi.fn();
    render(<Slider aria-label="Salary band" defaultValue={[40000, 60000]} min={20000} max={120000} step={1000} withInputs onValueCommit={onCommit} />);
    const [minInput] = screen.getAllByRole("spinbutton");
    await userEvent.clear(minInput!);
    await userEvent.type(minInput!, "70450{Enter}");
    // can't pass the max thumb
    expect(onCommit).toHaveBeenLastCalledWith([60000, 60000]);
    fireEvent.change(minInput!, { target: { value: "45499" } });
    fireEvent.blur(minInput!);
    expect(onCommit).toHaveBeenLastCalledWith([45000, 60000]);
  });

  it("read-only ignores keys", async () => {
    render(<Slider aria-label="Opacity" defaultValue={[50]} readOnly />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "50");
    expect(thumb).toHaveAttribute("aria-readonly", "true");
  });
});
