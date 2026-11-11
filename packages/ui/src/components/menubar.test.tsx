import * as React from "react";
import { screen, within } from "@testing-library/react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  type MenubarMenuEntry,
} from "./menubar";
import { VamosProvider } from "../lib/provider";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function EditorBar({ onSave = () => {} }: { onSave?: () => void }) {
  const [ruler, setRuler] = React.useState(true);
  const [zoom, setZoom] = React.useState("100");
  return (
    <Menubar aria-label="Document">
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="mod+s" onSelect={onSave}>
            Save
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Export as</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>Markdown</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem disabled>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={ruler} onCheckedChange={setRuler}>
            Show ruler
          </MenubarCheckboxItem>
          <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
            <MenubarRadioItem value="100">100%</MenubarRadioItem>
            <MenubarRadioItem value="150">150%</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

describe("Menubar", () => {
  it("renders a menubar with menuitem triggers and passes axe when open", async () => {
    const { user } = renderWithProviders(<EditorBar />);
    const bar = screen.getByRole("menubar", { name: "Document" });
    const file = within(bar).getByRole("menuitem", { name: "File" });
    expect(file).toHaveAttribute("aria-haspopup", "menu");
    await expectNoA11yViolations();
    await user.click(file);
    const menu = await screen.findByRole("menu");
    expect(menu).toHaveAttribute("data-layer-depth", "1");
    expect(within(menu).getByRole("menuitem", { name: /Print/ })).toHaveAttribute("data-disabled");
    await expectNoA11yViolations();
  });

  it("roving focus: one tab stop, arrows move between triggers", async () => {
    const { user } = renderWithProviders(<EditorBar />);
    await user.tab();
    const file = screen.getByRole("menuitem", { name: "File" });
    const view = screen.getByRole("menuitem", { name: "View" });
    expect(file).toHaveFocus();
    expect(view).toHaveAttribute("tabindex", "-1");
    await user.keyboard("{ArrowRight}");
    expect(view).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(file).toHaveFocus(); // loops
  });

  it("ArrowDown opens, ← → switch open menus, Enter selects, Escape closes", async () => {
    const onSave = vi.fn();
    const { user } = renderWithProviders(<EditorBar onSave={onSave} />);
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("menuitem", { name: /Save/ })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitemcheckbox", { name: "Show ruler" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "View" })).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowLeft}");
    const save = await screen.findByRole("menuitem", { name: /Save/ });
    // Switching menus focuses the panel; ↓ lands on the first item.
    await user.keyboard("{ArrowDown}");
    expect(save).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens submenus with ArrowRight and toggles checkbox / radio items", async () => {
    const { user } = renderWithProviders(<EditorBar />);
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    const sub = await screen.findByRole("menuitem", { name: /Export as/ });
    sub.focus();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "PDF" })).toHaveFocus();
    expect(screen.getAllByRole("menu")).toHaveLength(2);
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("menuitem", { name: "View" }));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "Show ruler" }));
    await user.click(screen.getByRole("menuitem", { name: "View" }));
    expect(await screen.findByRole("menuitemcheckbox", { name: "Show ruler" })).toHaveAttribute("aria-checked", "false");
    await user.click(screen.getByRole("menuitemradio", { name: "150%" }));
    await user.click(screen.getByRole("menuitem", { name: "View" }));
    expect(await screen.findByRole("menuitemradio", { name: "150%" })).toHaveAttribute("aria-checked", "true");
  });

  it("data-driven menus hide entries without permission", async () => {
    const menus: MenubarMenuEntry[] = [
      { id: "file", label: "File", items: [{ id: "new", label: "New invoice", shortcut: "mod+n" }] },
      { id: "admin", label: "Admin", permission: "admin", items: [{ id: "users", label: "Users" }] },
    ];
    const { user } = renderWithProviders(
      <VamosProvider can={(p: string) => p !== "admin"}>
        <Menubar aria-label="Billing" menus={menus} />
      </VamosProvider>,
    );
    expect(screen.queryByRole("menuitem", { name: "Admin" })).toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    expect(await screen.findByRole("menuitem", { name: /New invoice/ })).toBeInTheDocument();
  });
});
