import { fireEvent, screen, within } from "@testing-library/react";
import { Download, Pencil, Trash2 } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./context-menu";
import type { MenuEntry } from "../lib/variants";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const fileActions = (onRename: () => void): MenuEntry[] => [
  { type: "label", label: "harbour-sunrise.jpg" },
  { id: "rename", label: "Rename", icon: <Pencil />, shortcut: "f2", onSelect: onRename },
  { id: "download", label: "Download", icon: <Download /> },
  {
    type: "submenu",
    id: "move",
    label: "Move to",
    items: [
      { id: "campaigns", label: "Campaigns" },
      { id: "press", label: "Press kit" },
    ],
  },
  { type: "separator" },
  { id: "delete", label: "Delete", icon: <Trash2 />, tone: "danger" },
];

describe("ContextMenu", () => {
  it("opens on right-click at the pointer, from data, and passes axe", async () => {
    renderWithProviders(
      <ContextMenu items={fileActions(() => {})}>
        <div tabIndex={0}>harbour-sunrise.jpg tile</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("harbour-sunrise.jpg tile"), { clientX: 40, clientY: 60 });
    const menu = await screen.findByRole("menu");
    expect(menu).toHaveAttribute("data-layer-depth", "1");
    expect(within(menu).getByRole("menuitem", { name: /Delete/ })).toHaveAttribute("data-tone", "danger");
    expect(menu.closest('[data-slot="theme-scope"]')).not.toBeNull();
    await expectNoA11yViolations();
  });

  it("keyboard: arrows move, Enter selects and closes", async () => {
    const onRename = vi.fn();
    const { user } = renderWithProviders(
      <ContextMenu items={fileActions(onRename)}>
        <div>tile</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("tile"));
    await screen.findByRole("menu");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Rename/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("disabled lets the native menu through", () => {
    renderWithProviders(
      <ContextMenu items={fileActions(() => {})} disabled>
        <div>tile</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("tile"));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("works as a compound root", async () => {
    renderWithProviders(
      <ContextMenu>
        <ContextMenuTrigger>Kanban card</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Assign to me</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("Kanban card"));
    expect(await screen.findByRole("menuitem", { name: "Assign to me" })).toBeInTheDocument();
  });
});
