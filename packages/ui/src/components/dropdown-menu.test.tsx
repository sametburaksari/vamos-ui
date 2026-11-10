import * as React from "react";
import { screen, within } from "@testing-library/react";
import { Copy, FolderInput, Pencil, Trash2 } from "lucide-react";
import {
  ActionMenu,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import type { MenuEntry } from "../lib/variants";
import { VamosProvider } from "../lib/provider";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function RowMenu({ onEdit = () => {}, onTrash = () => {} }: { onEdit?: () => void; onTrash?: () => void }) {
  const [showDrafts, setShowDrafts] = React.useState(true);
  const [sort, setSort] = React.useState("updated");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Post</DropdownMenuLabel>
        <DropdownMenuItem icon={<Pencil />} shortcut="mod+e" onSelect={onEdit}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem icon={<Copy />} disabled>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<FolderInput />}>Move to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Newsroom</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showDrafts} onCheckedChange={setShowDrafts}>
          Show drafts
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="updated">Last updated</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Trash2 />} tone="danger" onSelect={onTrash}>
          Move to trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens from the keyboard as a menu button and passes axe", async () => {
    const { user } = renderWithProviders(<RowMenu />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    trigger.focus();
    await user.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(menu).toHaveAttribute("data-layer-depth", "1");
    expect(within(menu).getByRole("menuitemcheckbox", { name: "Show drafts" })).toHaveAttribute("aria-checked", "true");
    expect(within(menu).getByRole("menuitemradio", { name: "Last updated" })).toHaveAttribute("aria-checked", "true");
    expect(within(menu).getByRole("menuitem", { name: /Duplicate/ })).toHaveAttribute("data-disabled");
    expect(within(menu).getByRole("menuitem", { name: /Move to trash/ })).toHaveAttribute("data-tone", "danger");
    await expectNoA11yViolations();
  });

  it("arrow keys move, Enter selects and focus returns to the trigger", async () => {
    const onEdit = vi.fn();
    const { user } = renderWithProviders(<RowMenu onEdit={onEdit} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("menu");
    expect(screen.getByRole("menuitem", { name: /Edit/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("ArrowRight opens a submenu one layer deeper, Escape closes", async () => {
    const { user } = renderWithProviders(<RowMenu />);
    screen.getByRole("button", { name: "Actions" }).focus();
    await user.keyboard("{Enter}");
    const sub = await screen.findByRole("menuitem", { name: /Move to$/ });
    sub.focus();
    await user.keyboard("{ArrowRight}");
    const menus = await screen.findAllByRole("menu");
    expect(menus).toHaveLength(2);
    expect(menus[1]).toHaveAttribute("data-layer-depth", "2");
    expect(screen.getByRole("menuitem", { name: "Newsroom" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getAllByRole("menu")).toHaveLength(1);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("checkbox items toggle", async () => {
    const { user } = renderWithProviders(<RowMenu />);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "Show drafts" }));
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menuitemcheckbox", { name: "Show drafts" })).toHaveAttribute("aria-checked", "false");
  });
});

describe("ActionMenu", () => {
  const items = (onArchive: () => void): MenuEntry[] => [
    { id: "edit", label: "Edit", icon: <Pencil />, shortcut: "mod+e" },
    { id: "open", label: "Open in new tab", href: "/posts/41" },
    { id: "archive", label: "Archive", onSelect: onArchive },
    { type: "separator" },
    { id: "delete", label: "Delete", tone: "danger", permission: "posts.delete" },
    { type: "separator" },
  ];

  it("renders a labelled ⋯ trigger, entries, links and hides entries without permission", async () => {
    const onArchive = vi.fn();
    const { user } = renderWithProviders(
      <VamosProvider can={(p) => p !== "posts.delete"}>
        <ActionMenu items={items(onArchive)} />
      </VamosProvider>,
    );
    await user.click(screen.getByRole("button", { name: "More actions" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(3);
    expect(within(menu).getByRole("menuitem", { name: /^Edit/ })).toBeInTheDocument();
    expect(within(menu).queryByRole("menuitem", { name: "Delete" })).toBeNull();
    expect(within(menu).queryByRole("separator")).toBeNull();
    expect(within(menu).getByRole("menuitem", { name: "Open in new tab" })).toHaveAttribute("href", "/posts/41");
    await expectNoA11yViolations();
    await user.click(within(menu).getByRole("menuitem", { name: "Archive" }));
    expect(onArchive).toHaveBeenCalled();
  });

  it("renders nothing when every entry is hidden", () => {
    const { container } = renderWithProviders(
      <VamosProvider can={() => false}>
        <ActionMenu items={[{ id: "delete", label: "Delete", permission: "posts.delete" }]} />
      </VamosProvider>,
    );
    expect(container.querySelector("button")).toBeNull();
  });
});
