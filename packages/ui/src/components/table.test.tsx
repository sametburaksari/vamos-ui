import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Table, TableBody, TableCaption, TableCell, TableContainer, TableEmpty, TableFooter, TableHead, TableHeader, TableRow } from "./table";

function Invoice() {
  return (
    <TableContainer aria-label="Invoice lines">
      <Table stickyHeader density="compact" striped>
        <TableCaption>Invoice INV-2041</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead numeric>Qty</TableHead>
            <TableHead numeric>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow selected>
            <TableCell rowHeader>Design retainer</TableCell>
            <TableCell numeric>1</TableCell>
            <TableCell numeric>$4,500.00</TableCell>
          </TableRow>
          <TableRow disabled>
            <TableCell rowHeader truncate>Hosting (cancelled)</TableCell>
            <TableCell numeric>12</TableCell>
            <TableCell numeric>$480.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell numeric>$4,980.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

describe("Table", () => {
  it("renders semantic parts with caption, scopes and numeric alignment", async () => {
    const { container } = render(<Invoice />);
    expect(screen.getByRole("table", { name: "Invoice INV-2041" })).toHaveAttribute("data-density", "compact");
    expect(screen.getByRole("region", { name: "Invoice lines" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveClass("text-end");
    expect(screen.getByRole("rowheader", { name: "Design retainer" })).toHaveAttribute("scope", "row");
    expect(screen.getByText("$4,500.00")).toHaveClass("tabular", "text-end");
    expect(screen.getByText("Design retainer").closest("tr")).toHaveAttribute("data-state", "selected");
    expect(screen.getByText("Hosting (cancelled)").closest("tr")).toHaveAttribute("aria-disabled", "true");
    expect(container.querySelector("table")).toHaveAttribute("data-sticky-header");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("sortable headers are buttons with aria-sort", async () => {
    function Sortable() {
      const [sort, setSort] = React.useState<"asc" | "desc" | false>(false);
      return (
        <Table aria-label="Deals">
          <TableHeader>
            <TableRow>
              <TableHead>Deal</TableHead>
              <TableHead numeric sort={sort} onSort={() => setSort(sort === "asc" ? "desc" : "asc")}>
                Value
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Northwind renewal</TableCell>
              <TableCell numeric>$18,400</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    }
    const user = userEvent.setup();
    const { container } = render(<Sortable />);
    const header = screen.getByRole("columnheader", { name: "Value" });
    expect(header).toHaveAttribute("aria-sort", "none");
    const button = screen.getByRole("button", { name: "Value" });
    button.focus();
    await user.keyboard("{Enter}");
    expect(header).toHaveAttribute("aria-sort", "ascending");
    await user.click(button);
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("empty body row spans all columns", () => {
    render(
      <Table aria-label="Invoices">
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Client</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty colSpan={2} description="Try another date range." />
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.getByText("No results").closest("td")).toHaveAttribute("colspan", "2");
  });

  it("warns without a caption or label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("TableCaption"));
    warn.mockRestore();
  });
});
