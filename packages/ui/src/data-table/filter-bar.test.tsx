import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { FilterBar } from "./filter-bar";
import type { FilterFieldDef, FilterGroup } from "./types";

const fields: FilterFieldDef[] = [
  { field: "stage", label: "Stage", type: "enum", quick: true, options: [{ value: "lead", label: "Lead" }, { value: "proposal", label: "Proposal" }, { value: "won", label: "Won" }] },
  { field: "value", label: "Deal value", type: "currency" },
  { field: "company", label: "Company", type: "text" },
];

const initial: FilterGroup = {
  logic: "and",
  clauses: [
    { id: "a", field: "stage", op: "in", value: ["proposal", "won"] },
    { id: "b", field: "value", op: "gte", value: "5000" },
  ],
};

function Controlled({ onChange }: { onChange?: (g: FilterGroup) => void }) {
  const [value, setValue] = React.useState(initial);
  return (
    <FilterBar
      layout="inline"
      fields={fields}
      value={value}
      onChange={(g) => {
        setValue(g);
        onChange?.(g);
      }}
      resultCount={84}
    />
  );
}

describe("FilterBar", () => {
  it("renders chips with full accessible names and passes axe", async () => {
    const { container } = render(<Controlled />);
    expect(screen.getByRole("toolbar", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stage is any of Proposal or Won. Edit value" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deal value at least $5,000.00. Edit value" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear all" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("roves focus with the arrow keys (one tab stop)", async () => {
    render(<Controlled />);
    const user = userEvent.setup();
    const first = screen.getByRole("button", { name: "Field: Stage. Change field" });
    expect(first).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("button", { name: "Condition: is any of. Change condition" })).toHaveAttribute("tabindex", "-1");
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Condition: is any of. Change condition" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Clear all" })).toHaveFocus();
  });

  it("removes a chip, announces it and moves focus on", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Remove filter Stage" }));
    expect(onChange).toHaveBeenLastCalledWith({ logic: "and", clauses: [initial.clauses[1]] });
    expect(screen.getByText(/Filter removed: Stage\. 84 results\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Field: Deal value. Change field" })).toHaveFocus();
  });

  it("adds a filter: field → value → Apply", async () => {
    const onChange = vi.fn();
    render(<FilterBar layout="inline" fields={fields} defaultValue={{ logic: "and", clauses: [] }} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.keyboard("Company");
    await user.keyboard("{Enter}");
    const input = await screen.findByRole("textbox", { name: "Value" });
    await user.type(input, "Northwind{Enter}");
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls.at(-1)![0].clauses[0]).toMatchObject({ field: "company", op: "contains", value: "Northwind" });
  });

  it("quick chips open the value step directly", async () => {
    const onChange = vi.fn();
    render(<FilterBar layout="inline" fields={fields} defaultValue={{ logic: "and", clauses: [] }} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Stage" }));
    await user.click(await screen.findByRole("option", { name: /Won/ }));
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange.mock.calls.at(-1)![0].clauses[0]).toMatchObject({ field: "stage", op: "in", value: ["won"] });
  });

  it("is read-only without × buttons", () => {
    render(<FilterBar layout="inline" fields={fields} value={initial} readOnly />);
    expect(screen.queryByRole("button", { name: /Remove filter/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add filter" })).toBeNull();
  });
});
