import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { contrastRatio, parseColor } from "../../lib/color";
import { SiteShell, SiteShellLink, SiteShellLocale, SiteShellPage } from "./site-shell";
import { siteAccent, siteAccentCss, siteAccentKey } from "./shared/site-accent";
import { parseSiteHref, readSiteLocation, sitePageHref, writeSiteLocation } from "./shared/site-routing";

// Starting colours of the example sites, light and very dark ones included.
const COLOURS = ["#B4532A", "#E4572E", "#2B4C7E", "#22C55E", "#0F766E", "#A16207", "#F97316", "#CA8A04", "#0EA5E9", "#14532D", "#FB7185", "#3F3F46", "#06B6D4", "#4D7C0F", "#B91C1C", "#EAB308", "#EC4899", "#6B8E6B", "#FACC15", "#1E3A8A", "#7F1D1D", "#78350F", "#ffffff", "#000000"];

describe("siteAccent", () => {
  it.each(COLOURS)("%s: every text use reaches 4.5:1", (colour) => {
    const p = siteAccent(colour);
    // Measured independently with the kit's colour module (it parses the oklch() strings).
    expect(contrastRatio(p.fg, p.base)!).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.inkLight, "#eef0ea")!).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.inkDark, "#1b1e15")!).toBeGreaterThanOrEqual(4.5);
    if (p.dark) expect(contrastRatio(p.dark.fg, p.dark.base)!).toBeGreaterThanOrEqual(4.5);
    expect(p.contrast.fgOnBase).toBeGreaterThanOrEqual(4.5);
  });

  it.each(COLOURS)("%s: accent ink also reaches 4.5:1 on an accent-soft chip", (colour) => {
    const p = siteAccent(colour);
    // `color-mix(in oklch, base N%, transparent)` painted on the hardest surface of each theme.
    const chip = (base: string, bg: string, amount: number) => {
      const f = parseColor(base)!;
      const b = parseColor(bg)!;
      const mix = (x: number, y: number) => Math.round(x * amount + y * (1 - amount));
      return `rgb(${mix(f.r, b.r)}, ${mix(f.g, b.g)}, ${mix(f.b, b.b)})`;
    };
    expect(contrastRatio(p.inkLight, chip(p.base, "#eef0ea", 0.22))!).toBeGreaterThanOrEqual(4.45);
    expect(contrastRatio(p.inkDark, chip(p.dark?.base ?? p.base, "#1b1e15", 0.16))!).toBeGreaterThanOrEqual(4.45);
  });

  it("very dark colours get a dark-mode fill; the CSS scopes it to dark pages and sections", () => {
    const p = siteAccent("#0b2a17");
    expect(p.dark).toBeDefined();
    const css = siteAccentCss(p, "forest");
    expect(css).toContain(`[data-site-accent="forest"]{--accent-base:${p.base}`);
    expect(css).toContain(`.dark [data-site-accent="forest"]`);
    expect(css).toContain(`[data-site-accent="forest"] .dark{`);
    expect(siteAccent("#22C55E").dark).toBeUndefined();
  });

  it("rejects what is not a colour; keys are selector-safe", () => {
    expect(() => siteAccent("var(--brand)")).toThrow(TypeError);
    expect(siteAccentKey("#B4532A")).toBe("b4532a");
    expect(siteAccentKey('oklch(0.6 0.1 40)"]')).toBe("oklch-0-6-0-1-40");
  });
});

describe("site routing", () => {
  it("builds and reads page / locale hrefs", () => {
    expect(sitePageHref("pricing")).toBe("?page=pricing");
    expect(sitePageHref("home", "faq")).toBe("?page=home#faq");
    expect(sitePageHref("pricing", undefined, { routing: "hash" })).toBe("#page=pricing");
    expect(parseSiteHref("?page=home#faq")).toEqual({ page: "home", locale: undefined, anchor: "faq" });
    expect(parseSiteHref("?lang=tr")).toEqual({ page: undefined, locale: "tr", anchor: undefined });
    expect(parseSiteHref("#page=shop")).toEqual({ page: "shop" });
    expect(parseSiteHref("#faq")).toBeNull();
    expect(parseSiteHref("/pricing")).toBeNull();
    expect(parseSiteHref("?utm=x")).toBeNull();
  });

  it("writes the URL keeping other params and leaving defaults out", () => {
    const at = { pathname: "/view/site", search: "?theme=dark&page=shop", hash: "" };
    const defaults = { page: "home", locale: "en" };
    expect(writeSiteLocation(at, { page: "home", locale: "tr" }, defaults, "search")).toBe("/view/site?theme=dark&lang=tr");
    expect(writeSiteLocation(at, { page: "cart", locale: "en", anchor: "top" }, defaults, "search")).toBe("/view/site?theme=dark&page=cart#top");
    expect(writeSiteLocation(at, { page: "cart", locale: "en" }, defaults, "hash")).toBe("/view/site?theme=dark&page=shop#page=cart");
    expect(readSiteLocation("?lang=tr", "#page=cart", "hash")).toEqual({ page: "cart", locale: "tr" });
  });
});

function Demo() {
  return (
    <SiteShell accent="#B4532A" font="editorial" material="solid" density="comfortable" pages={["home", "shop"]}>
      <header>
        <nav aria-label="Main">
          <a href="?page=home">Home</a>
          <a href="?page=shop">Shop</a>
          <a href="?lang=tr" hrefLang="tr">TR</a>
          <a href="/elsewhere">Elsewhere</a>
        </nav>
      </header>
      <main>
        <SiteShellLocale code="en">
          <SiteShellPage id="home" title="Kilnhouse">
            <h1>Small-batch ceramics</h1>
            <SiteShellLink page="shop">Browse the shop</SiteShellLink>
          </SiteShellPage>
          <SiteShellPage id="shop" title="Shop · Kilnhouse">
            <h1>Shop</h1>
          </SiteShellPage>
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <SiteShellPage id="home">
            <h1>Küçük seri seramik</h1>
          </SiteShellPage>
          <SiteShellPage id="shop">
            <h1>Mağaza</h1>
          </SiteShellPage>
        </SiteShellLocale>
      </main>
    </SiteShell>
  );
}

describe("SiteShell", () => {
  beforeEach(() => window.history.replaceState(null, "", "/view/site-store-01"));

  it("scopes the accent and axes to the site root", async () => {
    const { container } = render(<Demo />);
    const root = container.querySelector<HTMLElement>("[data-site-shell]")!;
    expect(root).toHaveAttribute("data-accent", "site");
    expect(root).toHaveAttribute("data-site-accent", "b4532a");
    expect(root).toHaveAttribute("data-font", "editorial");
    expect(root).toHaveAttribute("data-material", "solid");
    expect(root).toHaveAttribute("data-density", "comfortable");
    expect(root.querySelector("style")!.textContent).toContain('[data-site-accent="b4532a"]{--accent-base:oklch(');
    expect(await axe(container)).toHaveNoViolations();
  });

  it("switches inner pages from plain links: URL, focus on the h1, aria-current, title", async () => {
    render(<Demo />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Small-batch ceramics");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");

    await act(async () => {
      fireEvent.click(screen.getByRole("link", { name: "Shop" }));
    });
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Shop");
    expect(h1).toHaveFocus();
    expect(window.location.search).toBe("?page=shop");
    expect(document.title).toBe("Shop · Kilnhouse");
    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");

    // Locale keeps the page.
    await act(async () => {
      fireEvent.click(screen.getByRole("link", { name: "TR" }));
    });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mağaza");
    expect(window.location.search).toBe("?page=shop&lang=tr");

    // Back to the default page: a clean URL.
    await act(async () => {
      fireEvent.click(screen.getByRole("link", { name: "Home" }));
    });
    expect(window.location.search).toBe("?lang=tr");
  });

  it("reads the URL on mount and follows back/forward; other links pass through", async () => {
    window.history.replaceState(null, "", "/view/site-store-01?page=shop");
    render(<Demo />);
    expect(await screen.findByRole("heading", { level: 1, name: "Shop" })).toBeInTheDocument();
    await act(async () => {
      window.history.pushState(null, "", "/view/site-store-01");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Small-batch ceramics");
    const outside = screen.getByRole("link", { name: "Elsewhere" });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    outside.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("SiteShellLink navigates; preset names pass through; a bad colour only warns", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { unmount } = render(<Demo />);
    await act(async () => {
      fireEvent.click(screen.getByRole("link", { name: "Browse the shop" }));
    });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Shop");
    unmount();

    const { container, rerender } = render(<SiteShell accent="ocean">x</SiteShell>);
    expect(container.firstElementChild).toHaveAttribute("data-accent", "ocean");
    expect(container.querySelector("style")).toBeNull();
    rerender(<SiteShell accent="brand">x</SiteShell>);
    expect(container.firstElementChild).toHaveAttribute("data-accent", "brand");
    rerender(<SiteShell accent="#zz">x</SiteShell>);
    expect(container.firstElementChild).not.toHaveAttribute("data-accent");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
