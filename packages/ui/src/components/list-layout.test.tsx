import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import { Button } from "./button";
import { Input } from "./input";
import { PageHeader } from "./page-header";
import { ListBulkBar, ListContent, ListFooter, ListLayout, ListToolbar, ListViewSwitch, type ListContentState } from "./list-layout";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function ContactsList({ initialState = "ready" as ListContentState }) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [state, setState] = React.useState<ListContentState>(initialState);
  const [view, setView] = React.useState("table");
  return (
    <ListLayout stickyTop={0}>
      <PageHeader title="Contacts" />
      <ListToolbar
        search={<Input aria-label="Search contacts" placeholder="Search contacts" />}
        viewSwitch={
          <ListViewSwitch
            value={view}
            onValueChange={setView}
            options={[
              { value: "table", label: "Table" },
              { value: "board", label: "Board" },
            ]}
          />
        }
        actions={<Button onClick={() => setSelected(["c1", "c2"])}>Select two</Button>}
      />
      <ListBulkBar count={selected.length} total={1284} onSelectAll={() => {}} onClear={() => setSelected([])}>
        <Button size="sm">Add tag</Button>
      </ListBulkBar>
      <ListContent state={state} resultCount={1284} onRetry={() => setState("ready")} onClearFilters={() => setState("ready")}>
        <p>{view === "table" ? "Table view" : "Board view"}</p>
      </ListContent>
      <ListFooter>
        <Button onClick={() => setState("refreshing")}>Refresh</Button>
      </ListFooter>
    </ListLayout>
  );
}

describe("ListLayout", () => {
  it("renders the toolbar with a search landmark and passes axe", async () => {
    renderWithProviders(<ContactsList />);
    expect(screen.getByRole("search", { name: "Search" })).toContainElement(screen.getByRole("textbox", { name: "Search contacts" }));
    expect(screen.getByText("Table view")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("view switch moves with arrow keys and changes the view", async () => {
    const { user } = renderWithProviders(<ContactsList />);
    screen.getByRole("radiogroup", { name: "View" });
    screen.getByRole("radio", { name: "Table", checked: true }).focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toHaveAccessibleName("Board");
    await user.keyboard(" ");
    expect(screen.getByText("Board view")).toBeInTheDocument();
  });

  it("bulk bar replaces the toolbar, announces the count, and Esc clears", async () => {
    const { user } = renderWithProviders(<ContactsList />);
    await user.click(screen.getByRole("button", { name: "Select two" }));
    const bar = screen.getByRole("region", { name: "Bulk actions" });
    expect(bar).toHaveTextContent("2 selected");
    expect(screen.getByRole("button", { name: "Select all 1,284" })).toBeInTheDocument();
    expect(document.querySelector("[data-slot=list-toolbar]")).toHaveAttribute("hidden");
    await expectNoA11yViolations();
    screen.getByRole("button", { name: "Add tag" }).focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("region", { name: "Bulk actions" })).not.toBeInTheDocument();
    expect(document.querySelector("[data-slot=list-toolbar]")).not.toHaveAttribute("hidden");
  });

  it("shows the error state with retry, and announces results when ready", async () => {
    const { user } = renderWithProviders(<ContactsList initialState="error" />);
    expect(screen.getByRole("heading", { name: "Couldn't load this list" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("Table view")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1,284 results"));
  });

  it("refreshing keeps the content and marks the region busy", async () => {
    const { user } = renderWithProviders(<ContactsList />);
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    const content = document.querySelector("[data-slot=list-content]")!;
    expect(content).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("progressbar", { name: "Updating results…" })).toBeInTheDocument();
    expect(screen.getByText("Table view")).toBeInTheDocument();
  });

  it("no-results and empty states", () => {
    const { rerender } = renderWithProviders(
      <ListContent state="no-results" onClearFilters={() => {}}>
        rows
      </ListContent>,
    );
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
    rerender(<ListContent state="loading">rows</ListContent>);
    expect(screen.queryByText("rows")).not.toBeInTheDocument();
    expect(document.querySelector("[data-slot=list-content]")).toHaveAttribute("aria-busy", "true");
  });
});
