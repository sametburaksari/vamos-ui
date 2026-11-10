import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { EntityCard } from "./entity-card";

describe("EntityCard", () => {
  it("renders a person card as an article with heading, status, fields and labelled actions", async () => {
    const { container } = render(
      <EntityCard
        name="Jane Cooper"
        subtitle="Head of Operations · Northwind Traders"
        status={{ tone: "success", label: "Customer" }}
        contact={{ email: "jane@northwind.com", phone: "+1 (415) 555-0136" }}
        fields={[{ key: "owner", label: "Owner", value: "Ayşe Kaya" }]}
        stats={[{ label: "Open deals", value: 4 }, { label: "Lifetime value", value: 182400, format: "currency" }]}
        href="/contacts/jane-cooper"
      />,
    );
    const card = screen.getByRole("article", { name: "Jane Cooper" });
    expect(card).toHaveAttribute("data-variant", "card");
    expect(screen.getByRole("heading", { level: 3, name: "Jane Cooper" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jane Cooper" })).toHaveAttribute("href", "/contacts/jane-cooper");
    expect(screen.getByRole("link", { name: "Email Jane Cooper" })).toHaveAttribute("href", "mailto:jane@northwind.com");
    expect(screen.getByRole("link", { name: "Call Jane Cooper" })).toHaveAttribute("href", "tel:+14155550136");
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("$182,400.00")).toBeInTheDocument();
    expect(screen.getByText("Ayşe Kaya")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("product tile with image fallback, archived and selected states", async () => {
    const { container } = render(
      <EntityCard kind="product" name="Linen Lounge Chair" subtitle="SKU LC-2041" status={{ tone: "warning", label: "Low stock" }} archived selected />,
    );
    const card = screen.getByRole("article", { name: "Linen Lounge Chair" });
    expect(card).toHaveAttribute("aria-current", "true");
    expect(card).toHaveAttribute("data-archived");
    expect(screen.getByText("Archived")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("header variant uses h1, compact and loading variants render", async () => {
    const { rerender, container } = render(<EntityCard variant="header" kind="organization" name="Northwind Traders" subtitle="northwind.com · Logistics" />);
    expect(screen.getByRole("heading", { level: 1, name: "Northwind Traders" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    rerender(<EntityCard variant="compact" name="Daniel Brooks" subtitle="Account executive" />);
    expect(screen.getByRole("article")).toHaveAttribute("data-variant", "compact");
    rerender(<EntityCard loading name="Loading" />);
    expect(screen.getByRole("article")).toHaveAttribute("aria-busy", "true");
  });

  it("chip variant is a focusable link trigger", async () => {
    const { container } = render(<EntityCard variant="chip" name="Mehmet Yılmaz" href="/people/mehmet" subtitle="Designer" />);
    const link = screen.getByRole("link", { name: /Mehmet Yılmaz/ });
    expect(link).toHaveAttribute("href", "/people/mehmet");
    expect(await axe(container)).toHaveNoViolations();
  });
});
