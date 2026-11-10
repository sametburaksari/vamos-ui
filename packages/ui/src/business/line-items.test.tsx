import { render, screen, fireEvent, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { LineItems } from "./line-items";
import { computeLineTotals, trLineTaxPack, type LineItem } from "./line-items-core";

const rows: LineItem[] = [
  { id: "a", description: "Discovery workshop", quantity: "2", unit: "day", unitPrice: "1450.00", taxRate: "20" },
  { id: "b", description: "Front-end build", quantity: "80", unit: "hour", unitPrice: "85.00", taxRate: "20", discount: { type: "percent", value: "10" } },
];

describe("computeLineTotals", () => {
  it("computes exact KDV with tevkifat from the tr pack", () => {
    const pack = trLineTaxPack("2026-11-10");
    expect(pack.rates.map((r) => r.value)).toEqual(["0", "1", "10", "20"]);
    const t = computeLineTotals([{ id: "1", description: "Consulting", quantity: "10", unitPrice: "100", taxRate: "20", withholding: "602" }], { taxPack: pack });
    expect(t.net).toBe("1000.00");
    expect(t.tax).toBe("200.00");
    expect(t.withheld).toBe("180.00");
    expect(t.payable).toBe("1020.00");
    expect(t.withholding[0]).toMatchObject({ code: "602", ratio: [9, 10] });
  });

  it("handles row + document discounts and groups by rate", () => {
    const t = computeLineTotals(
      [
        { id: "1", description: "A", quantity: "3", unitPrice: "33.33", taxRate: "20" },
        { id: "2", description: "B", quantity: "1", unitPrice: "200", taxRate: "10", discount: { type: "amount", value: "50" } },
      ],
      { documentDiscount: { type: "percent", value: "10" } },
    );
    expect(t.subtotal).toBe("299.99");
    // nets before doc discount: 99.99 + 150.00 = 249.99 → 10% = 25.00 allocated
    expect(t.net).toBe("224.99");
    expect(t.byRate.map((g) => g.rate)).toEqual(["20", "10"]);
    expect(t.total).toBe(String((Number(t.net) + Number(t.tax)).toFixed(2)));
  });

  it("keeps the entered gross for tax-inclusive prices", () => {
    const t = computeLineTotals([{ id: "1", description: "Gift card", quantity: "1", unitPrice: "120.00", taxRate: "20" }], { pricesIncludeTax: true });
    expect(t.net).toBe("100.00");
    expect(t.tax).toBe("20.00");
    expect(t.total).toBe("120.00");
  });

  it("flags rows without a price", () => {
    const t = computeLineTotals([{ id: "1", description: "Draft", quantity: "1", unitPrice: "" }]);
    expect(t.invalidCount).toBe(1);
    expect(t.total).toBe("0.00");
  });
});

describe("LineItems", () => {
  it("renders a real table with labelled cells and totals, and has no a11y violations", async () => {
    const { container } = render(<LineItems currency="EUR" defaultValue={rows} units={["day", "hour"]} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Description, row 1" })).toHaveValue("Discovery workshop");
    expect(screen.getByLabelText("Qty, row 2")).toBeInTheDocument();
    // 2900 + 6800 − 680 = 9020 net, 20% = 1804 → 10,824.00
    expect(screen.getByText("€10,824.00")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Enter on the last field of the last row adds a row and Alt+ArrowUp moves it", async () => {
    const onValueChange = vi.fn();
    render(<LineItems currency="USD" defaultValue={rows} columns={["description", "quantity", "unitPrice"]} onValueChange={onValueChange} />);
    const price = screen.getByLabelText("Price, row 2");
    fireEvent.keyDown(price, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(expect.any(Array), expect.any(Object));
    expect(onValueChange.mock.lastCall![0]).toHaveLength(3);

    const desc = screen.getByRole("textbox", { name: "Description, row 2" });
    fireEvent.keyDown(desc, { key: "ArrowUp", altKey: true });
    const order = onValueChange.mock.lastCall![0].map((r: LineItem) => r.id);
    expect(order.slice(0, 2)).toEqual(["b", "a"]);
  });

  it("deletes a row from the row menu and announces it", async () => {
    const user = userEvent.setup();
    render(<LineItems currency="USD" defaultValue={rows} />);
    await user.click(screen.getByRole("button", { name: "Actions for row 1" }));
    await user.click(await screen.findByRole("menuitem", { name: /Delete row/ }));
    expect(screen.queryByDisplayValue("Discovery workshop")).not.toBeInTheDocument();
    expect(screen.getByText("Row 1 deleted")).toBeInTheDocument();
  });

  it("adds rows from the Add item button", async () => {
    const user = userEvent.setup();
    render(<LineItems currency="USD" defaultValue={rows} />);
    await user.click(screen.getByRole("button", { name: "Add item" }));
    expect(screen.getAllByRole("textbox", { name: /Description, row/ })).toHaveLength(3);
  });

  it("read-only renders a printable summary with withholding and payable", async () => {
    const pack = trLineTaxPack("2026-11-10");
    const { container } = render(
      <LineItems
        readOnly
        currency="TRY"
        taxPack={pack}
        defaultValue={[{ id: "x", description: "Danışmanlık", quantity: "10", unitPrice: "100", taxRate: "20", withholding: "602" }]}
      />,
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    const summary = container.querySelector<HTMLElement>("[data-slot=line-items-summary]");
    expect(within(summary as HTMLElement).getByText(/Payable/)).toBeInTheDocument();
    expect(within(summary as HTMLElement).getByText(/Withholding 602/)).toBeInTheDocument();
    await act(async () => {});
    expect(await axe(container)).toHaveNoViolations();
  });
});
