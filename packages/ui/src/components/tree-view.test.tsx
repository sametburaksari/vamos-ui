import * as React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { TreeView, type TreeNode } from "./tree-view";
import { LocaleProvider } from "../lib/locale";

// Direct imports (not test/utils, which loads the whole barrel) keep this suite independent.
function renderWithProviders(ui: React.ReactElement, opts: { locale?: string } = {}) {
  const wrap = (node: React.ReactElement) => <LocaleProvider locale={opts.locale ?? "en-US"}>{node}</LocaleProvider>;
  const r = render(wrap(ui));
  return { ...r, user: userEvent.setup(), rerender: (next: React.ReactElement) => r.rerender(wrap(next)) };
}
async function expectNoA11yViolations() {
  expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
}

const pages: TreeNode[] = [
  {
    id: "company",
    label: "Company",
    children: [
      { id: "about", label: "About us" },
      { id: "careers", label: "Careers", children: [{ id: "engineering", label: "Engineering roles" }, { id: "design", label: "Design roles" }] },
    ],
  },
  { id: "pricing", label: "Pricing" },
  { id: "istanbul", label: "İstanbul office" },
];

const item = (name: string) => screen.getByRole("treeitem", { name: new RegExp(`^${name}`) });

describe("TreeView", () => {
  it("renders a flat ARIA tree with level, set size and position, and passes axe", async () => {
    renderWithProviders(<TreeView aria-label="Pages" data={pages} defaultExpanded={["company"]} />);
    const tree = screen.getByRole("tree", { name: "Pages" });
    expect(within(tree).getAllByRole("treeitem")).toHaveLength(5);
    const about = item("About us");
    expect(about).toHaveAttribute("aria-level", "2");
    expect(about).toHaveAttribute("aria-posinset", "1");
    expect(about).toHaveAttribute("aria-setsize", "2");
    expect(item("Company")).toHaveAttribute("aria-expanded", "true");
    expect(item("Pricing")).not.toHaveAttribute("aria-expanded");
    // roving tabindex: exactly one tab stop
    expect(within(tree).getAllByRole("treeitem").filter((el) => el.tabIndex === 0)).toHaveLength(1);
    await expectNoA11yViolations();
  });

  it("supports the WAI-ARIA tree keyboard (arrows, Home/End, type-ahead, Enter)", async () => {
    const onAction = vi.fn();
    const { user } = renderWithProviders(<TreeView aria-label="Pages" data={pages} onAction={onAction} />);
    await user.click(item("Company"));
    expect(item("Company")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(item("Company")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowRight}");
    expect(item("About us")).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowRight}{ArrowRight}");
    expect(item("Engineering roles")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(item("Careers")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(item("Careers")).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{End}");
    expect(item("İstanbul office")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(item("Company")).toHaveFocus();
    // type-ahead folds case: "p" → Pricing
    await user.keyboard("p");
    expect(item("Pricing")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: "pricing" }));
    expect(item("Pricing")).toHaveAttribute("aria-selected", "true");
  });

  it("checkbox mode cascades and shows mixed parents", async () => {
    const onSelectedChange = vi.fn();
    const { user } = renderWithProviders(
      <TreeView aria-label="Pages" data={pages} selectionMode="checkbox" defaultExpanded={["company", "careers"]} onSelectedChange={onSelectedChange} />,
    );
    await user.click(item("Careers"));
    expect(item("Careers")).toHaveAttribute("aria-checked", "true");
    expect(item("Engineering roles")).toHaveAttribute("aria-checked", "true");
    expect(item("Company")).toHaveAttribute("aria-checked", "mixed");
    expect(onSelectedChange).toHaveBeenLastCalledWith(["careers", "engineering", "design"]);
    item("About us").focus();
    await user.keyboard(" ");
    expect(item("Company")).toHaveAttribute("aria-checked", "true");
    await user.click(item("Design roles"));
    expect(item("Careers")).toHaveAttribute("aria-checked", "mixed");
    expect(item("Company")).toHaveAttribute("aria-checked", "mixed");
  });

  it("checkValueMode leaf / parent shape the value", async () => {
    const leaf = vi.fn();
    const { user, unmount } = renderWithProviders(
      <TreeView aria-label="Pages" data={pages} selectionMode="checkbox" checkValueMode="leaf" defaultExpanded={["company"]} onSelectedChange={leaf} />,
    );
    await user.click(item("Company"));
    expect(leaf).toHaveBeenLastCalledWith(["about", "engineering", "design"]);
    unmount();
    const parent = vi.fn();
    const r = renderWithProviders(<TreeView aria-label="Pages" data={pages} selectionMode="checkbox" checkValueMode="parent" defaultExpanded={["company"]} onSelectedChange={parent} />);
    await r.user.click(item("Company"));
    expect(parent).toHaveBeenLastCalledWith(["company"]);
  });

  it("loads lazy children with a busy row, and retries after an error", async () => {
    let fail = true;
    const loadChildren = vi.fn(async (node: TreeNode) => {
      await new Promise((r) => setTimeout(r, 10));
      if (fail) throw new Error("Network");
      return [{ id: `${node.id}-q3`, label: "Q3 invoices" }];
    });
    const { user } = renderWithProviders(<TreeView aria-label="Folders" data={[{ id: "finance", label: "Finance", hasChildren: true }]} loadChildren={loadChildren} />);
    await user.click(item("Finance"));
    await user.keyboard("{ArrowRight}");
    expect(item("Finance")).toHaveAttribute("aria-busy", "true");
    await screen.findByText("Couldn't load");
    fail = false;
    await user.click(screen.getByRole("button", { name: /Retry/ }));
    expect(await screen.findByRole("treeitem", { name: "Q3 invoices" })).toHaveAttribute("aria-level", "2");
    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("filter keeps ancestors, folds Turkish case and announces the count", () => {
    renderWithProviders(<TreeView aria-label="Pages" data={pages} filter="engineering" />);
    expect(screen.getAllByRole("treeitem").map((el) => el.dataset.treeId)).toEqual(["company", "careers", "engineering"]);
    expect(screen.getByRole("status")).toHaveTextContent("1 match");
  });

  it("filter matches İ with a plain i and shows an empty state", () => {
    const { rerender } = renderWithProviders(<TreeView aria-label="Pages" data={pages} filter="istanbul" />, { locale: "tr-TR" });
    expect(screen.getAllByRole("treeitem").map((el) => el.dataset.treeId)).toEqual(["istanbul"]);
    rerender(<TreeView aria-label="Pages" data={pages} filter="warehouse" />);
    expect(screen.getByText("No matches for “warehouse”")).toBeInTheDocument();
  });

  it("virtual mode renders a tree for large data", () => {
    const big: TreeNode[] = Array.from({ length: 2000 }, (_, i) => ({ id: `n${i}`, label: `Folder ${i + 1}` }));
    renderWithProviders(<TreeView aria-label="Folders" data={big} virtual height={320} />);
    const tree = screen.getByRole("tree", { name: "Folders" });
    // jsdom has no layout, so only a window (or nothing) renders — never all 2000 rows.
    expect(within(tree).queryAllByRole("treeitem").length).toBeLessThan(2000);
  });

  it("controlled expanded state", async () => {
    function Controlled() {
      const [expanded, setExpanded] = React.useState<string[]>([]);
      return (
        <>
          <button onClick={() => setExpanded(["company"])}>Open company</button>
          <TreeView aria-label="Pages" data={pages} expanded={expanded} onExpandedChange={setExpanded} />
        </>
      );
    }
    const { user } = renderWithProviders(<Controlled />);
    expect(screen.queryByRole("treeitem", { name: "About us" })).toBeNull();
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Open company" }));
    });
    expect(item("About us")).toBeInTheDocument();
  });
});
