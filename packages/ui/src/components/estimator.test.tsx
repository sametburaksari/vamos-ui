import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { Estimator, type EstimateResult, type EstimatorInput, type EstimatorValues } from "./estimator";
import { effectiveEstimatorValues, estimatorDefaults } from "./estimator-values";
import { tr } from "../locales/tr";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

const inputs: EstimatorInput[] = [
  {
    type: "options",
    id: "plan",
    label: "Plan",
    options: [
      { value: "basic", label: "Basic", meta: "from $100" },
      { value: "plus", label: "Plus", meta: "from $200" },
    ],
  },
  { type: "slider", id: "seats", label: "Seats", min: 1, max: 20, defaultValue: 2, format: (v) => `${v} seats` },
  { type: "toggle", id: "yearly", label: "Pay yearly", description: "Two months free" },
  {
    type: "addons",
    id: "extras",
    label: "Extras",
    options: [
      { value: "support", label: "Priority support", meta: "+$50" },
      { value: "audit", label: "Annual audit", meta: "+$80", when: (v) => v.plan === "plus" },
    ],
  },
];

const formula = (v: EstimatorValues): EstimateResult => {
  const base = v.plan === "plus" ? 200 : 100;
  const seats = (v.seats as number) * 10;
  const extras = (v.extras as string[]).reduce((s, x) => s + (x === "support" ? 50 : 80), 0);
  const sub = base + seats + extras;
  const discount = v.yearly ? Math.round(sub / 6) : 0;
  return {
    total: sub - discount,
    lines: [
      { id: "base", label: "Plan", amount: base },
      { id: "seats", label: "Seats", amount: seats, detail: `${v.seats} × $10` },
      ...(extras ? [{ id: "extras", label: "Extras", amount: extras }] : []),
      ...(discount ? [{ id: "discount", label: "Yearly discount", amount: discount, kind: "discount" as const }] : []),
    ],
    notes: ["Excludes VAT."],
  };
};

describe("estimator helpers", () => {
  it("fills defaults and drops hidden add-ons", () => {
    const d = estimatorDefaults(inputs);
    expect(d).toEqual({ plan: "basic", seats: 2, yearly: false, extras: [] });
    expect(effectiveEstimatorValues(inputs, { ...d, extras: ["support", "audit"] }).extras).toEqual(["support"]);
    expect(effectiveEstimatorValues(inputs, { ...d, plan: "plus", extras: ["audit"] }).extras).toEqual(["audit"]);
  });
});

describe("Estimator", () => {
  it("renders the inputs, the total, the lines and a polite live summary", async () => {
    const { container } = renderWithProviders(<Estimator inputs={inputs} formula={formula} cta="Request a quote" />);
    expect(container.querySelector("[data-slot=estimator-total]")).toHaveTextContent("$120");
    expect(screen.getByText("Total: $120")).toHaveAttribute("aria-live", "polite");
    expect(container.querySelector("[data-line=seats]")).toHaveTextContent("2 × $10");
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Estimate" })).toBeInTheDocument();
    expect(screen.queryByText("Annual audit")).not.toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("recalculates on every input and reports values with the result", async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithProviders(<Estimator inputs={inputs} formula={formula} onValuesChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: /Plus/ }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ plan: "plus" }), expect.objectContaining({ total: 220 }));
    await user.click(screen.getByRole("checkbox", { name: /Annual audit/ }));
    await user.click(screen.getByRole("switch", { name: /Pay yearly/ }));
    // 200 + 20 + 80 = 300, minus 50
    expect(container.querySelector("[data-slot=estimator-total]")).toHaveTextContent("$250");
    expect(container.querySelector("[data-line=discount]")).toHaveTextContent("−$50");
    screen.getByRole("slider").focus();
    await user.keyboard(keys.right);
    expect(container.querySelector("[data-slot=estimator-total]")).toHaveTextContent("$258");
  });

  it("shows a range, facts and an empty state; the CTA hands over the selection", async () => {
    const onSubmit = vi.fn();
    const rangeFormula = (v: EstimatorValues): EstimateResult => (v.plan === "plus" ? { total: 1000, range: [900, 1200], facts: [{ label: "Crew", value: "3 people" }] } : { total: null });
    const { user, container } = renderWithProviders(
      <form data-testid="f">
        <Estimator inputs={inputs.slice(0, 1)} formula={rangeFormula} cta="Book" onSubmit={onSubmit} name="estimate" />
      </form>,
    );
    expect(screen.getByRole("button", { name: "Book" })).toBeDisabled();
    expect(screen.getAllByText("Make a choice to see the price.").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("radio", { name: /Plus/ }));
    expect(container.querySelector("[data-slot=estimator-total]")).toHaveTextContent("$900–$1,200");
    expect(screen.getByText("3 people")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Book" }));
    expect(onSubmit).toHaveBeenCalledWith({ plan: "plus" }, expect.objectContaining({ total: 1000 }));
    const hidden = container.querySelector<HTMLInputElement>("input[name=estimate]")!;
    expect(JSON.parse(hidden.value)).toEqual({ values: { plan: "plus" }, total: 1000, range: [900, 1200] });
  });

  it("supports number and select inputs, numbering and conditional inputs", () => {
    const more: EstimatorInput[] = [
      { type: "select", id: "type", label: "Type", options: [{ value: "a", label: "Type A" }, { value: "b", label: "Type B" }] },
      { type: "number", id: "qty", label: "Quantity", min: 1, max: 99, defaultValue: 3 },
      { type: "toggle", id: "rush", label: "Rush", when: (v) => v.type === "b" },
    ];
    renderWithProviders(<Estimator inputs={more} numbered formula={(v) => ({ total: (v.qty as number) * (v.type === "b" ? 20 : 10) })} />);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: /Type/ }), { target: { value: "b" } });
    expect(screen.getByRole("switch", { name: /Rush/ })).toBeInTheDocument();
    expect(screen.getByText("Total: $60")).toBeInTheDocument();
    expect(screen.getAllByText("01").length).toBeGreaterThan(0);
  });

  it("formats with the locale and Turkish labels", () => {
    renderWithProviders(<Estimator inputs={inputs.slice(0, 1)} formula={() => ({ total: 12500, range: [11000, 14000] })} labels={{ total: "Aylık toplam" }} totalLabel="Aylık toplam" />, { locale: "tr-TR", currency: "TRY" });
    expect(screen.getByText("Aylık toplam: ₺11.000–₺14.000")).toBeInTheDocument();
  });
  it("uses the Turkish dictionary", () => {
    renderWithProviders(<Estimator inputs={inputs.slice(0, 1)} formula={() => ({ total: null })} />, { locale: "tr-TR", currency: "TRY", messages: tr });
    expect(screen.getByRole("complementary", { name: "Tahmin" })).toBeInTheDocument();
    expect(screen.getAllByText("Fiyatı görmek için bir seçim yapın.").length).toBeGreaterThan(0);
  });
});
