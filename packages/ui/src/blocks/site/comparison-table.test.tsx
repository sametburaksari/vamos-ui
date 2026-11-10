import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ComparisonTable } from "./comparison-table";
import { comparisonBlock } from "./registry-2";

const columns = [{ name: "Starter", note: "$49 / mo" }, { name: "Studio", note: "$129 / mo", highlight: true }, { name: "Group", note: "Quote" }];
const groups = [
  { title: "Publishing", rows: [{ feature: "Pages", values: ["5", "20", "Unlimited"] }, { feature: "Blog", hint: "Posts, categories and RSS.", values: [false, true, true] }] },
  { title: "Support", rows: [{ feature: "Dedicated designer", values: [false, null, true] }] },
];

describe("ComparisonTable", () => {
  it("is a real table with caption, scoped headers and Yes/No text", async () => {
    const { container } = render(<main><ComparisonTable title="What each plan *includes*" columns={columns} groups={groups} /></main>);
    const table = screen.getByRole("table", { name: "What each plan includes" });
    expect(within(table.querySelector("thead")!).getAllByRole("columnheader").map((c) => c.querySelector(".text-h3")?.textContent ?? c.textContent)).toEqual(["Feature", "Starter", "Studio", "Group"]);
    expect(within(table).getByRole("rowheader", { name: /Blog/ })).toHaveTextContent("Posts, categories and RSS.");
    expect(within(table).getAllByText("Yes")).toHaveLength(3);
    expect(within(table).getAllByText("No")).toHaveLength(3);
    expect(container.querySelectorAll('td[data-highlight]').length).toBe(3);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("mobile plan picker: radios, highlighted plan preselected, arrow keys move", async () => {
    const user = userEvent.setup();
    render(<ComparisonTable columns={columns} groups={groups} />);
    const picker = screen.getByRole("group", { name: "Show plan" });
    const radios = within(picker).getAllByRole("radio");
    expect(radios[1]).toBeChecked();
    await user.click(radios[1]!);
    await user.keyboard("{ArrowRight}");
    expect(radios[2]).toBeChecked();
  });

  it("versus: two columns, no picker", async () => {
    const { container } = render(<main><ComparisonTable variant="versus" title="Built for you vs. a template" columns={[{ name: "Vamos" }, { name: "Template site" }, { name: "Ignored" }]} groups={[{ rows: [{ feature: "Loads in under 2 s on 4G", values: [true, false] }, { feature: "Your own booking flow", values: ["Built in", "Plugin"] }] }]} /></main>);
    expect(screen.queryByRole("group", { name: "Show plan" })).toBeNull();
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.getByText("Plugin").closest("td")).toHaveClass("text-fg-muted");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("registry preview validates", () => {
    expect(comparisonBlock.schema.safeParse(comparisonBlock.sample()).success).toBe(true);
  });
});
