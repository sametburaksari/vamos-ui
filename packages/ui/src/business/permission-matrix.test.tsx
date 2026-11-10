import * as React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { PermissionCompare, PermissionMatrix, type PermissionAction, type PermissionResource } from "./permission-matrix";
import { applyDependencies, diffPermissions, type PermissionValue } from "./permission-core";

const resources: PermissionResource[] = [
  { id: "deals", label: "Deals", group: "Sales" },
  { id: "quotes", label: "Quotes", group: "Sales" },
  { id: "invoices", label: "Invoices", group: "Finance", actions: ["view", "edit"] },
];
const actions: PermissionAction[] = [
  { id: "view", label: "View", scoped: true },
  { id: "edit", label: "Edit", scoped: true },
  { id: "delete", label: "Delete", danger: true },
];

describe("permission core", () => {
  it("diffs values and treats none/false/missing as equal", () => {
    expect(diffPermissions({ deals: { view: "own", delete: false } }, { deals: { view: "team" } })).toEqual([{ resource: "deals", action: "view", from: "own", to: "team" }]);
  });
  it("raises requirements and lowers dependents", () => {
    const deps = [{ action: "edit", requires: "view" }];
    const up = applyDependencies({ deals: { edit: "team", view: "own" } }, deps, { changed: { resource: "deals", action: "edit" }, scoped: () => true });
    expect(up.value.deals!.view).toBe("team");
    const down = applyDependencies({ deals: { edit: "team", view: "none" } }, deps, { changed: { resource: "deals", action: "view" }, scoped: () => true });
    expect(down.value.deals!.edit).toBeUndefined();
  });
});

function Harness(props: { baseline?: PermissionValue; onSave?: () => void; inherited?: PermissionValue }) {
  const [value, setValue] = React.useState<PermissionValue>({ deals: { view: "own" } });
  return (
    <PermissionMatrix
      resources={resources}
      actions={actions}
      value={value}
      onValueChange={setValue}
      dependencies={[{ action: "edit", requires: "view" }]}
      inheritedFrom="Manager"
      {...props}
    />
  );
}

describe("PermissionMatrix", () => {
  it("is a grid with named cells and no a11y violations", async () => {
    const { container } = render(<Harness inherited={{ quotes: { view: "team" } }} />);
    expect(screen.getByRole("grid", { name: "Permissions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deals, View: Own" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quotes, View: Team, inherited from Manager" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Deals, Delete: Not allowed" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("img", { name: "Invoices, Delete: Not applicable" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("moves with arrow keys (roving tabindex), Space toggles and 1–4 pick a scope", async () => {
    render(<Harness />);
    const first = screen.getByRole("button", { name: "Deals, View: Own" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    const edit = screen.getByRole("button", { name: /Deals, Edit/ });
    await waitFor(() => expect(edit).toHaveFocus());
    expect(edit).toHaveAttribute("tabindex", "0");
    expect(first).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(edit, { key: "3" });
    // Edit: Team requires View ≥ Team → raised automatically, and announced.
    expect(screen.getByRole("button", { name: "Deals, Edit: Team" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deals, View: Team" })).toBeInTheDocument();
    expect(screen.getByText("View enabled because Edit requires it")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("button", { name: "Deals, Edit: Team" }), { key: "ArrowRight" });
    const del = screen.getByRole("checkbox", { name: /Deals, Delete/ });
    await waitFor(() => expect(del).toHaveFocus());
    fireEvent.keyDown(del, { key: "Enter" });
    expect(screen.getByRole("checkbox", { name: "Deals, Delete: Allowed" })).toHaveAttribute("aria-checked", "true");
  });

  it("column and row toggles grant in bulk; changes show a save bar and a review", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<Harness baseline={{ deals: { view: "own" } }} onSave={onSave} />);
    await user.click(screen.getByRole("button", { name: "Grant Delete on all resources" }));
    expect(screen.getByRole("checkbox", { name: "Quotes, Delete: Allowed" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Grant all actions on Invoices/ }));
    expect(screen.getByRole("button", { name: "Invoices, Edit: All" })).toBeInTheDocument();
    expect(screen.getByText("4 changes")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Review/ }));
    const dialog = await screen.findByRole("dialog", { name: "Review permission changes" });
    expect(within(dialog).getAllByText("Sensitive").length).toBe(2);
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("opens the scope menu with Enter and picks a scope", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const cell = screen.getByRole("button", { name: "Quotes, View: None" });
    cell.focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("menuitemradio", { name: /All/ }));
    expect(screen.getByRole("button", { name: "Quotes, View: All" })).toBeInTheDocument();
  });

  it("collapses groups", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: /^Sales/, expanded: true }));
    expect(screen.queryByRole("button", { name: /Deals, View/ })).not.toBeInTheDocument();
  });
});

describe("PermissionCompare", () => {
  it("shows subjects side by side and flags differences", async () => {
    const { container } = render(
      <PermissionCompare
        aria-label="Compare roles"
        resources={resources}
        actions={actions}
        subjects={[
          { id: "rep", label: "Sales rep", value: { deals: { view: "own" } } },
          { id: "mgr", label: "Manager", value: { deals: { view: "team", delete: true } } },
        ]}
        onlyDifferences
      />,
    );
    expect(container.querySelectorAll("[data-differs]")).toHaveLength(2);
    expect(screen.getByText("Sales rep")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
