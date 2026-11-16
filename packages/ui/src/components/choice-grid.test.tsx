import * as React from "react";
import { screen } from "@testing-library/react";
import { ChoiceGrid, type ChoiceGridAxisItem } from "./choice-grid";
import { choiceGridStep } from "./choice-grid-step";
import { tr } from "../locales/tr";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

const rows: ChoiceGridAxisItem[] = [
  { id: "s", label: "Small", description: "250 g" },
  { id: "m", label: "Medium", description: "500 g" },
  { id: "l", label: "Large", description: "1 kg" },
];
const columns: ChoiceGridAxisItem[] = [
  { id: "w1", label: "Weekly" },
  { id: "w2", label: "Every 2 weeks" },
  { id: "w4", label: "Monthly" },
];
const prices: Record<string, Record<string, number | null>> = {
  s: { w1: 300, w2: 320, w4: 340 },
  m: { w1: 520, w2: null, w4: 590 },
  l: { w1: 900, w2: 960, w4: 1020 },
};
const cell = (r: string, c: string) => (prices[r]![c] == null ? null : { price: prices[r]![c]!, meta: "per box" });

describe("choiceGridStep", () => {
  const a = [
    [true, true, true],
    [true, false, true],
    [true, true, true],
  ];
  it("moves along rows with wrapping and down columns skipping holes", () => {
    expect(choiceGridStep(a, [0, 2], "next")).toEqual([1, 0]);
    expect(choiceGridStep(a, [1, 0], "next")).toEqual([1, 2]);
    expect(choiceGridStep(a, [0, 1], "down")).toEqual([2, 1]);
    expect(choiceGridStep(a, [0, 1], "up")).toBeNull();
    expect(choiceGridStep(a, [1, 2], "rowStart")).toEqual([1, 0]);
    expect(choiceGridStep(a, [0, 0], "last")).toEqual([2, 2]);
  });
});

describe("ChoiceGrid", () => {
  it("is one radio group with a single tab stop and named cells", async () => {
    const { container } = renderWithProviders(<ChoiceGrid caption="Choose a plan" rows={rows} columns={columns} cell={cell} defaultValue={{ row: "m", column: "w1" }} />);
    expect(screen.getByRole("radiogroup", { name: "Choose a plan" })).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(9);
    expect(radios.filter((r) => r.tabIndex === 0)).toHaveLength(1);
    expect(screen.getByRole("radio", { name: "Medium, Weekly: $520" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Medium, Every 2 weeks: not available" })).toHaveAttribute("aria-disabled", "true");
    expect(container.querySelectorAll("[data-selected]")).toHaveLength(2);
    await expectNoA11yViolations(container);
  });

  it("moves in both axes with the arrow keys, skipping unavailable cells", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<ChoiceGrid aria-label="Plan" rows={rows} columns={columns} cell={cell} defaultValue={{ row: "s", column: "w2" }} onValueChange={onChange} />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Small, Every 2 weeks: $320" })).toHaveFocus();
    await user.keyboard(keys.down);
    expect(onChange).toHaveBeenLastCalledWith({ row: "l", column: "w2" });
    expect(screen.getByRole("radio", { name: "Large, Every 2 weeks: $960" })).toHaveFocus();
    await user.keyboard(keys.right);
    expect(onChange).toHaveBeenLastCalledWith({ row: "l", column: "w4" });
    await user.keyboard(keys.up);
    expect(onChange).toHaveBeenLastCalledWith({ row: "m", column: "w4" });
    await user.keyboard(keys.left);
    expect(onChange).toHaveBeenLastCalledWith({ row: "m", column: "w1" });
    await user.keyboard(keys.home);
    await user.click(screen.getByRole("radio", { name: "Medium, Every 2 weeks: not available" }));
    expect(onChange).toHaveBeenLastCalledWith({ row: "m", column: "w1" });
  });

  it("flips left and right in RTL", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<ChoiceGrid aria-label="Plan" rows={rows} columns={columns} cell={cell} defaultValue={{ row: "s", column: "w2" }} onValueChange={onChange} />, { dir: "rtl", locale: "ar" });
    await user.tab();
    await user.keyboard(keys.left);
    expect(onChange).toHaveBeenLastCalledWith({ row: "s", column: "w4" });
  });

  it("posts the choice with a form and formats in the locale", () => {
    const { container } = renderWithProviders(
      <form>
        <ChoiceGrid aria-label="Plan" rows={rows} columns={columns} cell={cell} defaultValue={{ row: "l", column: "w4" }} name="plan" rowName="size" columnName="frequency" />
      </form>,
      { locale: "tr-TR", currency: "TRY" },
    );
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("plan")).toBe("l:w4");
    expect(data.get("size")).toBe("l");
    expect(data.get("frequency")).toBe("w4");
    expect(screen.getByRole("radio", { name: "Large, Monthly: ₺1.020" })).toBeInTheDocument();
  });
  it("uses the Turkish dictionary", () => {
    renderWithProviders(<ChoiceGrid aria-label="Plan" rows={rows} columns={columns} cell={cell} />, { locale: "tr-TR", currency: "TRY", messages: tr });
    expect(screen.getByRole("radio", { name: "Medium, Every 2 weeks: mevcut değil" })).toBeInTheDocument();
  });
});
