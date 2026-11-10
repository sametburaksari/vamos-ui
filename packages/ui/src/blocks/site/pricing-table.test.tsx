import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { PricingTable, type PricingPlan } from "./pricing-table";
import { site2LabelsTr } from "./shared/labels-2";
import { pricingBlock } from "./registry-2";

const USD = (amount: string) => ({ amount, currency: "USD" });
const plans: PricingPlan[] = [
  { name: "Starter", description: "One page, booking form and map.", price: { monthly: USD("49"), yearly: USD("490") }, features: [{ text: "1 page, 2 languages" }, { text: "Blog", included: false }], cta: { link: { href: "/signup?plan=starter", label: "Start Starter" }, style: "primary" } },
  { name: "Studio", description: "Up to 20 pages, blog and menu.", price: { monthly: USD("129"), yearly: USD("1290") }, highlight: "Most chosen", features: [{ text: "20 pages, 4 languages", note: "Machine drafts, human review" }], cta: { link: { href: "/signup?plan=studio", label: "Start Studio" }, style: "primary" } },
  { name: "Group", description: "Several branches, one brand.", custom: "Get a quote", cta: { link: { href: "/contact", label: "Talk to us" } } },
];

describe("PricingTable", () => {
  it("columns: plans, prices with periods, one primary action, accessible", async () => {
    const { container } = render(<main><PricingTable title="One site, three *speeds*" plans={plans} billing="both" yearlySaving="2 months free" taxNote="Prices exclude 20% VAT" /></main>);
    expect(screen.getByRole("heading", { level: 2, name: "One site, three speeds" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Starter", "Studio", "Group"]);
    // Both periods are in the DOM; CSS shows one. Screen readers get the full currency name.
    expect(screen.getAllByText(/49 US dollars/i)[0]).toBeInTheDocument();
    expect(container.querySelectorAll('[data-period="yearly"]').length).toBe(2);
    expect(screen.getByText("Get a quote")).toBeInTheDocument();
    // Only the highlighted plan keeps the primary style.
    expect(screen.getByRole("link", { name: "Start Studio" })).toHaveClass("vb-action-primary");
    expect(screen.getByRole("link", { name: "Start Starter" })).not.toHaveClass("vb-action-primary");
    // Excluded features carry text, not a cross.
    expect(screen.getByText(/Not included/)).toHaveClass("sr-only");
    expect(screen.getByText("Prices exclude 20% VAT")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("billing switch is a fieldset of radios that works with the keyboard", async () => {
    const user = userEvent.setup();
    render(<PricingTable plans={plans} billing="both" taxNote="VAT included" />);
    const group = screen.getByRole("group", { name: "Billing period" });
    const monthly = within(group).getByRole("radio", { name: "Monthly" });
    const yearly = within(group).getByRole("radio", { name: "Yearly" });
    expect(monthly).toBeChecked();
    await user.click(monthly);
    await user.keyboard("{ArrowRight}");
    expect(yearly).toBeChecked();
  });

  it("formats money per locale and uses the Turkish period suffix", () => {
    render(<PricingTable locale="tr-TR" labels={site2LabelsTr} billing="monthly" taxNote="KDV hariç" plans={[{ name: "Bakım", price: { monthly: { amount: "4500", currency: "TRY" } } }]} variant="rows" />);
    expect(screen.getByText("₺4.500")).toBeInTheDocument();
    expect(screen.getByText("/ay")).toBeInTheDocument();
  });

  it("rows and single variants", async () => {
    const { container, rerender } = render(<main><PricingTable variant="rows" plans={plans} taxNote="VAT included" /></main>);
    expect(container.querySelector("ol")?.children).toHaveLength(3);
    rerender(<main><PricingTable variant="single" plans={[{ ...plans[1]!, price: { once: USD("4500"), from: true } }]} billing="once" taxNote="Excl. VAT" /></main>);
    expect(screen.getByText("from")).toBeInTheDocument();
    expect(screen.getByText("one-off", { selector: "[aria-hidden]" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("registry preview validates against the schema", () => {
    expect(pricingBlock.schema.safeParse(pricingBlock.sample()).success).toBe(true);
  });
});
