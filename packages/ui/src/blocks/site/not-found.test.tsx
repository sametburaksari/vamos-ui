import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { NotFound } from "./not-found";
import { site2LabelsTr } from "./shared/labels-2";
import { notFoundBlock } from "./registry-2";

const links = [{ href: "/menu", label: "Menu" }, { href: "/reservations", label: "Reservations" }, { href: "/private-dining", label: "Private dining" }, { href: "/contact", label: "Find us" }];

describe("NotFound", () => {
  it("plain: small code, sentence h1 with emphasis, one way home", async () => {
    const { container } = render(<main><NotFound /></main>);
    expect(screen.getByText("Error 404")).toBeInTheDocument();
    const h1 = screen.getByRole("heading", { level: 1, name: "This page moved, or never existed." });
    expect(h1.querySelector("em")).toHaveTextContent("existed");
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("links: a GET search form, popular pages and a phone line", async () => {
    const user = userEvent.setup();
    const { container } = render(<main><NotFound variant="links" links={links} search={{ action: "/search", param: "q" }} phone="+902160000000" /></main>);
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("action", "/search");
    expect(form).toHaveAttribute("method", "get");
    await user.type(screen.getByRole("searchbox", { name: "Search the site" }), "rakı");
    expect(screen.getByRole("searchbox")).toHaveAttribute("name", "q");
    expect(screen.getByRole("navigation", { name: "Popular pages" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+90 216 000 00 00" })).toHaveAttribute("href", "tel:+902160000000");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("500 with reset (error.tsx) and Turkish maintenance copy", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const { rerender } = render(<NotFound kind="500" reset={reset} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
    rerender(<NotFound kind="maintenance" locale="tr-TR" labels={site2LabelsTr} phone="+902160000000" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Birazdan döneceğiz.");
    expect(screen.getByRole("link", { name: "+90 216 000 00 00" })).toBeInTheDocument();
    expect(notFoundBlock.schema.safeParse(notFoundBlock.sample()).success).toBe(true);
  });
});
