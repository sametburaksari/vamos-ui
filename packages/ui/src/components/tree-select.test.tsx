import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { TreeSelect } from "./tree-select";
import type { TreeNode } from "../lib/use-tree";
import { LocaleProvider } from "../lib/locale";

function setup(ui: React.ReactElement) {
  return { ...render(<LocaleProvider locale="en-US">{ui}</LocaleProvider>), user: userEvent.setup() };
}
const noViolations = async () => expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();

const categories: TreeNode[] = [
  {
    id: "electronics",
    label: "Electronics",
    children: [
      { id: "phones", label: "Phones", children: [{ id: "android", label: "Android" }, { id: "ios", label: "iOS" }] },
      { id: "laptops", label: "Laptops" },
    ],
  },
  { id: "home", label: "Home & kitchen", children: [{ id: "coffee", label: "Coffee makers" }] },
];
const row = (name: string) => screen.getByRole("treeitem", { name: new RegExp(`^${name}`) });

describe("TreeSelect", () => {
  it("opens a searchable tree, selects with the keyboard and shows the path", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(<TreeSelect aria-label="Category" nodes={categories} onValueChange={onValueChange} name="category" />);
    const trigger = screen.getByRole("button", { name: "Category" });
    expect(trigger).toHaveAttribute("aria-haspopup", "tree");
    await user.click(trigger);
    const search = await screen.findByRole("searchbox");
    expect(search).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(row("Electronics")).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(row("Phones")).toHaveFocus();
    await noViolations();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("phones", expect.objectContaining({ label: "Phones" }));
    await waitFor(() => expect(screen.queryByRole("tree")).toBeNull());
    expect(trigger).toHaveTextContent("Electronics›Phones");
    expect(document.querySelector<HTMLInputElement>('input[name="category"]')?.value).toBe("phones");
  });

  it("selectable=leaf expands parents instead of selecting them", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(<TreeSelect aria-label="Category" nodes={categories} selectable="leaf" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Category" }));
    await user.click(await screen.findByRole("treeitem", { name: /^Home/ }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(row("Home")).toHaveAttribute("aria-expanded", "true");
    await user.click(row("Coffee makers"));
    expect(onValueChange).toHaveBeenCalledWith("coffee", expect.anything());
  });

  it("search keeps ancestors and Enter picks the first match", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(<TreeSelect aria-label="Category" nodes={categories} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Category" }));
    await user.type(await screen.findByRole("searchbox"), "andr");
    expect(screen.getAllByRole("treeitem").map((el) => el.dataset.treeId)).toEqual(["electronics", "phones", "android"]);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("android", expect.anything());
  });

  it("multiple: tri-state cascade, chips and valueMode", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(<TreeSelect aria-label="Categories" multiple valueMode="parent" nodes={categories} defaultExpanded={["electronics", "phones"]} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Categories" }));
    await user.click(await screen.findByRole("treeitem", { name: /^Android/ }));
    await user.click(row("iOS"));
    expect(row("Phones")).toHaveAttribute("aria-checked", "true");
    expect(row("Electronics")).toHaveAttribute("aria-checked", "mixed");
    expect(onValueChange).toHaveBeenLastCalledWith(["phones"]);
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Remove Phones" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("creates a node under the focused one", async () => {
    const onCreate = vi.fn(async (parentId: string | null, label: string) => ({ id: "kettles", label }));
    const { user } = setup(<TreeSelect aria-label="Category" mode="inline" nodes={categories} onCreate={onCreate} />);
    await user.click(row("Home"));
    await user.click(screen.getByRole("button", { name: "New item in Home & kitchen" }));
    await user.type(screen.getByLabelText("New item in Home & kitchen"), "Kettles{Enter}");
    expect(onCreate).toHaveBeenCalledWith("home", "Kettles");
  });
});
