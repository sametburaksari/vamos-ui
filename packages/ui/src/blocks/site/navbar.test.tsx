import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Navbar, formatSitePhone } from "./navbar";

const items = [
  { label: "Menu", href: "/menu" },
  {
    label: "Private dining",
    href: "/private-dining",
    children: [
      { label: "The long table", href: "/private-dining/long-table", description: "Up to fourteen guests" },
      { label: "The cellar room", href: "/private-dining/cellar", description: "Eight guests, own sommelier" },
    ],
  },
  { label: "Visit", href: "/visit" },
];

describe("Navbar", () => {
  it("bar: skip link first, labelled nav, current page, phone and one CTA", async () => {
    const { container } = render(
      <>
        <Navbar wordmark="Kıyı" items={items} currentPath="/menu" phone="+902160000000" actions={[{ link: { href: "/book", label: "Book a table" }, style: "primary" }]} sticky />
        <main id="content" />
      </>,
    );
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Skip to content");
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("link", { name: "Menu" })[0]).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: /Call/ })).toHaveAttribute("href", "tel:+902160000000");
    expect(within(nav).getByRole("link", { name: "Book a table" })).toHaveClass("vb-action-primary");
    expect(container.querySelector("header")).toHaveAttribute("data-sticky");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("mobile menu is a native popover the trigger controls", () => {
    render(<Navbar id="site-nav" wordmark="Kıyı" items={items} />);
    const trigger = screen.getAllByRole("button", { name: "Menu" })[0]!;
    const panel = document.getElementById("site-nav-menu")!;
    expect(trigger).toHaveAttribute("popovertarget", "site-nav-menu");
    expect(panel).toHaveAttribute("popover", "auto");
    expect(panel).toHaveAttribute("role", "dialog");
  });

  it("submenu: disclosure with keyboard support", async () => {
    const user = userEvent.setup();
    render(<Navbar wordmark="Kıyı" items={items} currentPath="/private-dining/cellar" />);
    const trigger = screen.getByRole("button", { name: "Private dining" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("data-active");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: /The long table/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: /The cellar room/ })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("split centres the brand; rail frames the links; overlay forces dark", () => {
    const { container, rerender } = render(<Navbar variant="split" wordmark="Hamam Moda" items={items} actions={[{ link: { href: "/book", label: "Book" }, style: "primary" }]} />);
    expect(container.querySelector("nav")).toHaveClass("grid");
    expect(screen.getAllByRole("link", { name: "Book" })[0]).not.toHaveClass("vb-action-primary");
    rerender(<Navbar variant="rail" overlay wordmark="Ledgerly" items={items} />);
    expect(container.querySelector(".vb-nav-rail")).not.toBeNull();
    expect(container.querySelector("header")).toHaveClass("dark");
  });

  it("locale switch and phone formats", () => {
    render(<Navbar wordmark="Kıyı" locale="tr" items={[]} locales={[{ code: "tr", href: "/" }, { code: "en", href: "/en" }]} />);
    expect(screen.getAllByRole("link", { name: "tr" })[0]).toHaveAttribute("aria-current", "true");
    expect(formatSitePhone("+902160000000", "tr")).toBe("0216 000 00 00");
    expect(formatSitePhone("+902160000000", "en-US")).toBe("+90 216 000 00 00");
  });
});
