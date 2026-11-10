import * as React from "react";
import { screen, within } from "@testing-library/react";
import { LogOut, Settings } from "lucide-react";
import { CommandPalette, CommandProvider } from "./command";
import { TopBar, TopBarActions, TopBarMenuButton, TopBarSearch, TopBarSpacer, TopBarStart, UserMenu } from "./top-bar";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const signOut = vi.fn();

function Bar({ onMenu }: { onMenu?: () => void }) {
  return (
    <CommandProvider actions={[{ id: "nav.contacts", title: "Contacts", group: "Go to", href: "/crm/contacts" }]}>
      <TopBar>
        <TopBarStart>
          <TopBarMenuButton onClick={onMenu} />
        </TopBarStart>
        <TopBarSearch />
        <TopBarSpacer />
        <TopBarActions>
          <UserMenu
            name="Ada Lovelace"
            email="ada@northwind.io"
            items={[
              { id: "settings", label: "Account settings", icon: <Settings />, href: "/account" },
              { type: "separator" },
              { id: "out", label: "Sign out", icon: <LogOut />, onSelect: signOut },
            ]}
          />
        </TopBarActions>
      </TopBar>
      <CommandPalette />
    </CommandProvider>
  );
}

describe("TopBar", () => {
  it("is a banner with a search trigger and passes axe", async () => {
    renderWithProviders(<Bar />);
    const banner = screen.getByRole("banner");
    const search = within(banner).getByRole("button", { name: /Search or run a command/ });
    expect(search).toHaveAttribute("aria-haspopup", "dialog");
    expect(search).toHaveAttribute("aria-keyshortcuts", "Meta+K Control+K");
    await expectNoA11yViolations();
  });

  it("the search trigger opens the command palette", async () => {
    const { user } = renderWithProviders(<Bar />);
    await user.click(screen.getByRole("button", { name: /Search or run a command/ }));
    expect(await screen.findByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Contacts" })).toBeInTheDocument();
  });

  it("the menu button calls onClick outside a shell", async () => {
    const onMenu = vi.fn();
    const { user } = renderWithProviders(<Bar onMenu={onMenu} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(onMenu).toHaveBeenCalled();
  });

  it("user menu shows the account and runs items from the keyboard", async () => {
    signOut.mockReset();
    const { user } = renderWithProviders(<Bar />);
    const trigger = screen.getByRole("button", { name: "Account menu for Ada Lovelace" });
    trigger.focus();
    await user.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("ada@northwind.io")).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Account settings" })).toHaveAttribute("href", "/account");
    await expectNoA11yViolations();
    await user.click(within(menu).getByRole("menuitem", { name: "Sign out" }));
    expect(signOut).toHaveBeenCalled();
  });

  it("transparent variant gets data-scrolled after scrolling", async () => {
    renderWithProviders(<TopBar variant="transparent">Title</TopBar>);
    const bar = screen.getByRole("banner");
    expect(bar).not.toHaveAttribute("data-scrolled");
    Object.defineProperty(window, "scrollY", { value: 120, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    await vi.waitFor(() => expect(bar).toHaveAttribute("data-scrolled"));
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });
});
