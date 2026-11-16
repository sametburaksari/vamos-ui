import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { TierPricing } from "./tier-pricing";
import { tierQuote, type PriceTier } from "./tier-quote";
import { tr } from "../locales/tr";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const tiers: PriceTier[] = [
  { min: 10, price: 44, label: "Trade" },
  { min: 1, price: 52 },
  { min: 50, price: 40, label: "Pallet" },
];

describe("tierQuote", () => {
  it("finds the tier, the next break and the saving", () => {
    expect(tierQuote(tiers, 4)).toMatchObject({ index: 0, more: 6, unitPrice: 52, total: 208, saved: 0 });
    expect(tierQuote(tiers, 12)).toMatchObject({ index: 1, more: 38, unitPrice: 44, total: 528, saved: 96 });
    expect(tierQuote(tiers, 60)).toMatchObject({ index: 2, next: null, more: 0, total: 2400 });
    expect(tierQuote([{ min: 5, price: 10 }], 2)).toMatchObject({ index: -1, unitPrice: 10 });
  });
});

describe("TierPricing", () => {
  it("highlights the tier for the quantity and says how far the next break is", async () => {
    const { container } = renderWithProviders(<TierPricing tiers={tiers} quantity={4} unit="case" />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveAttribute("aria-current", "true");
    expect(rows[0]).toHaveTextContent("1–9");
    expect(rows[2]).toHaveTextContent("50+");
    expect(rows[2]).toHaveTextContent("−23%");
    expect(container.querySelector("[data-slot=tier-total]")).toHaveTextContent("$208.00");
    expect(screen.getByText("6 more for $44.00 per case.")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("figure", { name: "Price per case by quantity" })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("sets the quantity from a tier or the field", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<TierPricing tiers={tiers} defaultQuantity={4} onQuantityChange={onChange} quantityInput unit="case" />);
    await user.click(screen.getByRole("button", { name: "Order 50 at $40.00 per case" }));
    expect(onChange).toHaveBeenLastCalledWith(50);
    expect(screen.getByText("You have the best price.")).toBeInTheDocument();
    expect(screen.getByText("You save $600.00.")).toBeInTheDocument();
    const field = screen.getByRole("spinbutton");
    fireEvent.change(field, { target: { value: "12" } });
    fireEvent.blur(field);
    expect(onChange).toHaveBeenLastCalledWith(12);
    expect(screen.getByText("38 more for $40.00 per case.")).toBeInTheDocument();
  });

  it("draws a ladder and formats in Turkish", async () => {
    const { container } = renderWithProviders(<TierPricing tiers={tiers} quantity={12} variant="ladder" unit="koli" labels={{ next: "{price} / {unit} için {more} {unit} daha." }} />, { locale: "tr-TR", currency: "TRY" });
    const steps = container.querySelectorAll("[data-tier]");
    expect(steps).toHaveLength(3);
    expect(steps[1]!.firstElementChild).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("₺40,00 / koli için 38 koli daha.")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
  it("uses the Turkish dictionary", () => {
    renderWithProviders(<TierPricing tiers={tiers} quantity={60} unit="koli" />, { locale: "tr-TR", currency: "TRY", messages: tr });
    expect(screen.getByText("En iyi fiyattasınız.")).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Miktara göre koli fiyatı" })).toBeInTheDocument();
  });
});
