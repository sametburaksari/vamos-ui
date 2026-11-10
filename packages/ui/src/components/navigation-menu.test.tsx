import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { MobileNav, NavigationMenu, type SiteNavItem } from "./navigation-menu";
import { VamosProvider } from "../lib/provider";

const nav: SiteNavItem[] = [
  {
    label: "Products",
    layout: "grid-2",
    children: [
      { label: "vTag", href: "/products/vtag", description: "NFC business cards for teams" },
      { label: "vRest", href: "/products/vrest", description: "Restaurant POS and QR menus" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

describe("NavigationMenu", () => {
  it("renders a labelled nav with triggers and links", async () => {
    const { container } = render(
      <VamosProvider currentPath="/pricing">
        <NavigationMenu items={nav} />
      </VamosProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Products" })).toHaveAttribute("aria-expanded", "false");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens a panel on click and closes on Escape", async () => {
    render(<NavigationMenu items={nav} />);
    const trigger = screen.getByRole("button", { name: "Products" });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("link", { name: /vTag/ })).toHaveAttribute("href", "/products/vtag");
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

describe("MobileNav", () => {
  it("opens a sheet with groups as an accordion", async () => {
    render(<MobileNav items={nav} />);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = await screen.findByRole("dialog", { name: "Menu" });
    expect(dialog).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Products" }));
    expect(screen.getByRole("link", { name: /vRest/ })).toBeInTheDocument();
    expect(await axe(dialog)).toHaveNoViolations();
    await userEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
