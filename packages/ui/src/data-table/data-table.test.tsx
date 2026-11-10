import * as React from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { DataTable, DataTableContent, DataTableFilterBar, DataTableFooter, DataTableToolbar, useDataTable, type DataTableColumn } from "./data-table";
import type { ListState } from "./types";
import { createMemoryAdapter } from "./url-state";

interface Employee {
  id: string;
  name: string;
  department: string;
  salary: string;
  startDate: string;
}

const people: Employee[] = [
  { id: "e1", name: "Jane Cooper", department: "sales", salary: "84000", startDate: "2023-04-17" },
  { id: "e2", name: "Kemal Aydın", department: "engineering", salary: "112000", startDate: "2021-09-01" },
  { id: "e3", name: "Priya Raman", department: "design", salary: "96500", startDate: "2024-02-12" },
  { id: "e4", name: "Lucas Moreau", department: "sales", salary: "71000", startDate: "2025-06-30" },
];

const columns: DataTableColumn<Employee>[] = [
  { id: "name", header: "Name", accessor: "name" },
  {
    id: "department",
    header: "Department",
    accessor: "department",
    type: "enum",
    options: [
      { value: "sales", label: "Sales", tone: "accent" },
      { value: "engineering", label: "Engineering", tone: "info" },
      { value: "design", label: "Design", tone: "warning" },
    ],
    edit: { type: "select" },
  },
  { id: "salary", header: "Salary", accessor: "salary", type: "currency", edit: { type: "currency" } },
  { id: "startDate", header: "Start date", accessor: "startDate", type: "date" },
];

const names = () =>
  screen
    .getAllByRole("rowheader")
    .map((c) => c.textContent);

describe("DataTable", () => {
  it("renders a captioned table and passes axe", async () => {
    const { container } = render(<DataTable caption="Employees" columns={columns} data={people} getRowId={(r) => r.id} selectable />);
    expect(screen.getByRole("table", { name: "Employees" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(5);
    expect(screen.getByText("$84,000.00")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("sorts asc → desc → none with aria-sort", async () => {
    render(<DataTable caption="Employees" columns={columns} data={people} getRowId={(r) => r.id} />);
    const user = userEvent.setup();
    const th = screen.getByRole("columnheader", { name: /Salary/ });
    await user.click(within(th).getByRole("button", { name: "Sort by Salary" }));
    expect(th).toHaveAttribute("aria-sort", "ascending");
    expect(names()[0]).toBe("Lucas Moreau");
    await user.click(within(th).getByRole("button", { name: "Sort by Salary" }));
    expect(th).toHaveAttribute("aria-sort", "descending");
    expect(names()[0]).toBe("Kemal Aydın");
    await user.click(within(th).getByRole("button", { name: "Sort by Salary" }));
    expect(th).toHaveAttribute("aria-sort", "none");
  });

  it("searches (debounced) and shows the no-results state", async () => {
    render(<DataTable caption="Employees" columns={columns} data={people} getRowId={(r) => r.id} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "kemal aydin");
    await waitFor(() => expect(names()).toEqual(["Kemal Aydın"]));
    await user.clear(screen.getByRole("searchbox", { name: "Search" }));
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "zzz{Enter}");
    expect(await screen.findByText("No results for these filters")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(names()).toHaveLength(4);
  });

  it("selects rows, shows the bulk bar and runs a confirmed action", async () => {
    const run = vi.fn();
    render(
      <DataTable
        caption="Employees"
        columns={columns}
        data={people}
        getRowId={(r) => r.id}
        selectable
        defaultState={{ page: { index: 0, size: 2 } }}
        pageSizes={[2, 10]}
        bulkActions={[{ id: "archive", label: "Archive", tone: "danger", confirm: { title: "Archive employees?", description: (n) => `${n} records will be archived.` }, run }]}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox", { name: "Select Jane Cooper" }));
    const bar = screen.getByRole("toolbar", { name: "Bulk actions" });
    expect(within(bar).getByText("1 selected")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    await user.click(within(bar).getByRole("button", { name: "Select all 4" }));
    expect(within(bar).getByText("4 selected")).toBeInTheDocument();
    await user.click(within(bar).getByRole("button", { name: "Archive" }));
    expect(await screen.findByText("4 records will be archived.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Archive" }));
    await waitFor(() => expect(run).toHaveBeenCalledTimes(1));
    expect(run.mock.calls[0]![0]).toEqual({ mode: "ids", ids: ["e1", "e2", "e3", "e4"] });
  });

  it("Escape clears the selection", async () => {
    render(<DataTable caption="Employees" columns={columns} data={people} getRowId={(r) => r.id} selectable />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox", { name: "Select Jane Cooper" }));
    expect(screen.getByRole("toolbar", { name: "Bulk actions" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("toolbar", { name: "Bulk actions" })).toBeNull();
  });

  it("paginates on the client", async () => {
    render(<DataTable caption="Employees" columns={columns} data={people} getRowId={(r) => r.id} defaultState={{ page: { index: 0, size: 2 } }} pageSizes={[2, 10]} />);
    const user = userEvent.setup();
    expect(screen.getByText("1–2 of 4")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(names()).toEqual(["Priya Raman", "Lucas Moreau"]);
  });

  it("edits a cell optimistically and rolls back on error", async () => {
    const onCellEdit = vi.fn().mockRejectedValueOnce(new Error("Salary is above the band for Sales.")).mockResolvedValue(undefined);
    render(<DataTable caption="Employees" columns={columns} data={people} getRowId={(r) => r.id} onCellEdit={onCellEdit} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Salary: $84,000.00. Edit" }));
    const input = screen.getByRole("textbox", { name: "Salary" });
    await user.clear(input);
    await user.type(input, "250000{Enter}");
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ rowId: "e1", columnId: "salary", value: "250000" }));
    await waitFor(() => expect(screen.getByText("Salary is above the band for Sales.")).toBeInTheDocument());
    expect(screen.getByText("$84,000.00")).toBeInTheDocument();
  });

  it("server mode hands state changes over with increasing request ids", async () => {
    const onStateChange = vi.fn();
    render(<DataTable caption="Contacts" mode="server" rowCount={12480} columns={columns} data={people} getRowId={(r) => r.id} onStateChange={onStateChange} selectable defaultState={{ page: { index: 0, size: 25 } }} />);
    const user = userEvent.setup();
    expect(screen.getByText("1–25 of 12,480")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    const [state, reason, id1] = onStateChange.mock.calls.at(-1)! as [ListState, string, number];
    expect(reason).toBe("page");
    expect(state.page).toEqual({ index: 1, size: 25 });
    await user.click(within(screen.getByRole("columnheader", { name: /Name/ })).getByRole("button", { name: "Sort by Name" }));
    const [s2, r2, id2] = onStateChange.mock.calls.at(-1)! as [ListState, string, number];
    expect(r2).toBe("sort");
    expect(s2.page).toEqual({ index: 0, size: 25 });
    expect(id2).toBeGreaterThan(id1);
    // select-all across pages
    await user.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    await user.click(screen.getByRole("button", { name: "Select all 12,480" }));
    expect(screen.getByText("All 12,480 selected")).toBeInTheDocument();
  });

  it("shows skeleton rows while first loading and the empty state without data", () => {
    const { rerender } = render(<DataTable caption="Employees" columns={columns} data={[]} getRowId={(r) => r.id} loading />);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(document.querySelectorAll('[data-slot="data-table-skeleton"]').length).toBeGreaterThan(0);
    rerender(<DataTable caption="Employees" columns={columns} data={[]} getRowId={(r) => r.id} />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("composes with a bound Filter bar and exposes useDataTable", async () => {
    function Count() {
      const { total } = useDataTable<Employee>();
      return <output aria-label="Matching">{total}</output>;
    }
    render(
      <DataTable caption="Employees" columns={columns} data={people} getRowId={(r) => r.id} defaultState={{ filters: { logic: "and", clauses: [{ id: "d", field: "department", op: "in", value: ["sales"] }] } }}>
        <DataTableToolbar>
          <DataTableFilterBar layout="inline" />
          <Count />
        </DataTableToolbar>
        <DataTableContent />
        <DataTableFooter />
      </DataTable>,
    );
    expect(screen.getByRole("button", { name: "Department is any of Sales. Edit value" })).toBeInTheDocument();
    expect(screen.getByLabelText("Matching")).toHaveTextContent("2");
    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Remove filter Department" }));
    });
    expect(screen.getByLabelText("Matching")).toHaveTextContent("4");
  });
  it("reads and writes URL state through an adapter", async () => {
    const adapter = createMemoryAdapter("?tab=team&q=priya&sort=-salary");
    render(<DataTable caption="Employees" columns={columns} data={people} getRowId={(r) => r.id} urlState={{ adapter }} />);
    await waitFor(() => expect(names()).toEqual(["Priya Raman"]));
    expect(screen.getByRole("columnheader", { name: /Salary/ })).toHaveAttribute("aria-sort", "descending");
    const user = userEvent.setup();
    await user.click(within(screen.getByRole("columnheader", { name: /Name/ })).getByRole("button", { name: "Sort by Name" }));
    await waitFor(() => expect(adapter.search).toBe("tab=team&q=priya&sort=name"));
  });
});
