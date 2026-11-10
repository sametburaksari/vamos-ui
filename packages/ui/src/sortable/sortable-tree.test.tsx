import * as React from "react";
import { act, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";
import { SortableTree, moveTreeNode, type SortableTreeMoveEvent } from "./index";

interface MenuItem {
  id: string;
  label: string;
  kind?: "page" | "link";
  children?: MenuItem[];
}

const MENU: MenuItem[] = [
  { id: "home", label: "Home" },
  {
    id: "services",
    label: "Services",
    children: [
      { id: "design", label: "Brand design" },
      { id: "web", label: "Web development", children: [{ id: "shops", label: "Online shops" }] },
    ],
  },
  { id: "about", label: "About us" },
  { id: "contact", label: "Contact", kind: "link" },
];

function Menu(props: { onMove?: (e: SortableTreeMoveEvent) => void | Promise<void>; maxDepth?: number; locked?: string[] }) {
  const [menu, setMenu] = React.useState(MENU);
  return (
    <SortableTree
      aria-label="Main menu"
      nodes={menu}
      maxDepth={props.maxDepth}
      disabled={(n) => !!props.locked?.includes(n.id)}
      canDrop={(c) => (c.parentId === "contact" ? "Links can't have children" : true)}
      onMove={(e) => {
        const r = props.onMove?.(e);
        if (r instanceof Promise) return r;
        setMenu((m) => moveTreeNode(m, e.id, e.parentId, e.index));
      }}
    />
  );
}

const tree = () => screen.getByRole("tree", { name: "Main menu" });
const rows = () => within(tree()).getAllByRole("treeitem").map((r) => `${r.getAttribute("aria-level")}:${r.textContent}`);
const row = (name: string) => screen.getByRole("treeitem", { name });

async function openMenu(user: ReturnType<typeof renderWithProviders>["user"], item: string) {
  await user.click(screen.getByRole("button", { name: `Move ${item}` }));
  return screen.findByRole("menu");
}

describe("SortableTree", () => {
  it("renders the tree pattern with levels, sizes and expansion", async () => {
    renderWithProviders(<Menu />);
    expect(rows()).toEqual(["1:Home", "1:Services", "2:Brand design", "2:Web development", "3:Online shops", "1:About us", "1:Contact"]);
    expect(row("Services")).toHaveAttribute("aria-expanded", "true");
    expect(row("Brand design")).toHaveAttribute("aria-posinset", "1");
    expect(row("Brand design")).toHaveAttribute("aria-setsize", "2");
    expect(within(tree()).getAllByRole("treeitem").filter((r) => r.tabIndex === 0)).toHaveLength(1);
    await expectNoA11yViolations();
  });

  it("is accessible in dark glass RTL", async () => {
    renderWithProviders(<Menu />, { dir: "rtl", locale: "ar-EG", theme: { dark: true, material: "glass" } });
    await expectNoA11yViolations();
  });

  it("navigates with arrow keys, collapses and expands", async () => {
    const { user } = renderWithProviders(<Menu />);
    act(() => row("Home").focus());
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(row("Services"));
    await user.keyboard("{ArrowLeft}");
    expect(row("Services")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("treeitem", { name: "Brand design" })).toBeNull();
    await user.keyboard("{ArrowRight}");
    expect(row("Services")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(row("Brand design"));
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(row("Services"));
    await user.keyboard("a");
    expect(document.activeElement).toBe(row("About us"));
  });

  it("indents, outdents and moves through the Move menu, then announces", async () => {
    const onMove = vi.fn();
    const { user } = renderWithProviders(<Menu onMove={onMove} />);
    const menu = await openMenu(user, "About us");
    await user.click(within(menu).getByRole("menuitem", { name: /Indent/ }));
    expect(onMove).toHaveBeenLastCalledWith({ id: "about", parentId: "services", index: 2, fromParentId: null, fromIndex: 2 });
    expect(rows()).toContain("2:About us");
    await waitFor(() => expect(document.querySelector('[data-slot="sortable-status"]')).toHaveTextContent("About us moved. Level 2, position 3 of 3."));
    const menu2 = await openMenu(user, "Online shops");
    await user.click(within(menu2).getByRole("menuitem", { name: /Outdent/ }));
    expect(onMove).toHaveBeenLastCalledWith({ id: "shops", parentId: "services", index: 2, fromParentId: "web", fromIndex: 0 });
  });

  it("moves with Alt + arrows", async () => {
    const { user } = renderWithProviders(<Menu />);
    act(() => row("About us").focus());
    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
    expect(rows().slice(0, 2)).toEqual(["1:Home", "1:About us"]);
    await waitFor(() => expect(document.activeElement).toBe(row("About us")));
  });

  it("blocks moves past maxDepth and canDrop rules with a reason", async () => {
    const onMove = vi.fn();
    const { user } = renderWithProviders(<Menu onMove={onMove} maxDepth={2} />);
    const menu = await openMenu(user, "Web development");
    // Web development has a child: indenting it under Brand design would need 3 levels.
    const indent = within(menu).getByRole("menuitem", { name: /Indent/ });
    expect(indent).toHaveAttribute("data-disabled");
    expect(indent).toHaveTextContent("Max depth 2");
    await user.keyboard("{Escape}");
    const menu2 = await openMenu(user, "About us");
    await user.hover(within(menu2).getByRole("menuitem", { name: "Move into…" }));
    await user.keyboard("{ArrowRight}");
    const contact = await screen.findByRole("menuitem", { name: /Contact/ });
    expect(contact).toHaveAttribute("data-disabled");
    expect(contact).toHaveTextContent("Links can't have children");
    expect(onMove).not.toHaveBeenCalled();
  });

  it("rolls back a rejected async move", async () => {
    let reject!: () => void;
    const { user } = renderWithProviders(<Menu onMove={() => new Promise<void>((_, r) => (reject = () => r(new Error("409"))))} />);
    const menu = await openMenu(user, "Home");
    await user.click(within(menu).getByRole("menuitem", { name: /^Move down/ }));
    expect(rows().slice(0, 2)).toEqual(["1:Services", "2:Brand design"]);
    await act(async () => reject());
    await waitFor(() => expect(rows()[0]).toBe("1:Home"));
  });

  it("hides the Move menu for fixed items and shows the empty slot", () => {
    const { rerender } = renderWithProviders(<Menu locked={["home"]} />);
    expect(screen.queryByRole("button", { name: "Move Home" })).toBeNull();
    expect(row("Home")).toHaveAttribute("aria-disabled", "true");
    rerender(<SortableTree aria-label="Menu" nodes={[]} onMove={() => {}} empty={<p>No menu items yet</p>} />);
    expect(screen.getByText("No menu items yet")).toBeInTheDocument();
  });
});
