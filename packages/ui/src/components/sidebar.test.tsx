import * as React from "react";
import { screen, waitFor, within } from "@testing-library/react";
import { FileText, Files, LayoutDashboard, MessageSquare } from "lucide-react";
import { VamosProvider } from "../lib/provider";
import { AppSwitcher, Sidebar, SidebarCollapseButton, SidebarContent, SidebarFooter, SidebarHeader, SidebarItem, SidebarNav, SidebarSubItem, type NavNode } from "./sidebar";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const nav: NavNode[] = [
  { id: "dashboard", label: "Dashboard", href: "/site", icon: LayoutDashboard },
  {
    type: "group",
    id: "content",
    label: "Content",
    items: [
      {
        id: "posts",
        label: "Posts",
        href: "/site/posts",
        icon: FileText,
        children: [
          { id: "posts.all", label: "All posts", href: "/site/posts" },
          { id: "posts.categories", label: "Categories", href: "/site/posts/categories" },
        ],
      },
      {
        id: "pages",
        label: "Pages",
        href: "/site/pages",
        icon: Files,
        children: [
          { id: "pages.all", label: "All pages", href: "/site/pages" },
          { id: "pages.new", label: "Add new", href: "/site/pages/new" },
        ],
      },
      { id: "comments", label: "Comments", href: "/site/comments", icon: MessageSquare, permission: "comments.moderate" },
    ],
  },
];

function Menu({ path = "/site/posts/categories", can = () => true, collapsed, mode }: { path?: string; can?: (p: string) => boolean; collapsed?: boolean; mode?: "desktop" | "mobile" }) {
  return (
    <VamosProvider currentPath={path} can={can}>
      <Sidebar defaultCollapsed={collapsed} mode={mode}>
        <SidebarHeader>
          <AppSwitcher apps={[{ id: "site", name: "Site", description: "Content & website", href: "/site" }, { id: "crm", name: "CRM", description: "Customers & sales", href: "/crm" }]} activeApp="site" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav items={nav} badges={{ comments: 4 }} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarCollapseButton />
        </SidebarFooter>
      </Sidebar>
    </VamosProvider>
  );
}

describe("Sidebar", () => {
  it("marks the active trail by longest prefix and opens the active section inline", async () => {
    renderWithProviders(<Menu />);
    const navEl = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(navEl).getByRole("link", { name: "Categories" })).toHaveAttribute("aria-current", "page");
    expect(within(navEl).getByRole("link", { name: "Posts" })).toHaveAttribute("aria-current", "true");
    expect(within(navEl).getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    // inactive section with children is a flyout parent, not inline
    expect(within(navEl).getByRole("link", { name: "Pages" })).toHaveAttribute("aria-haspopup", "true");
    expect(within(navEl).queryByRole("link", { name: "Add new" })).toBeNull();
    expect(screen.getByRole("group", { name: "Content" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("adds badge text to the accessible name", () => {
    renderWithProviders(<Menu />);
    expect(screen.getByRole("link", { name: "Comments, 4 new" })).toBeInTheDocument();
  });

  it("hides items the user can't see", () => {
    renderWithProviders(<Menu can={(p) => p !== "comments.moderate"} />);
    expect(screen.queryByRole("link", { name: /Comments/ })).toBeNull();
  });

  it("opens a flyout with ArrowRight, moves focus in, and Escape returns focus", async () => {
    const { user } = renderWithProviders(<Menu />);
    const pages = screen.getByRole("link", { name: "Pages" });
    pages.focus();
    await user.keyboard("{ArrowRight}");
    const flyout = await screen.findByRole("dialog", { name: "Pages" });
    expect(pages).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(within(flyout).getByRole("link", { name: "All pages" })).toHaveFocus());
    await user.keyboard("{ArrowDown}");
    expect(within(flyout).getByRole("link", { name: "Add new" })).toHaveFocus();
    await expectNoA11yViolations();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Pages" })).toBeNull());
    expect(pages).toHaveFocus();
  });

  it("collapses to a rail with the collapse button (aria-pressed)", async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithProviders(
      <VamosProvider currentPath="/site">
        <Sidebar onCollapsedChange={onChange}>
          <SidebarContent>
            <SidebarNav items={nav} />
          </SidebarContent>
          <SidebarCollapseButton />
        </Sidebar>
      </VamosProvider>,
    );
    const btn = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await user.click(btn);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(container.querySelector("[data-slot=sidebar]")).toHaveAttribute("data-collapsed");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    // labels stay in the accessibility tree as visually hidden text
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("renders accordions in mobile mode", async () => {
    const { user } = renderWithProviders(<Menu mode="mobile" path="/site" />);
    const toggle = screen.getByRole("button", { name: "Show Pages pages" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Add new" })).toBeInTheDocument();
  });

  it("compound API produces the same structure", () => {
    renderWithProviders(
      <VamosProvider currentPath="/site/posts">
        <Sidebar>
          <SidebarContent>
            <ul>
              <SidebarItem label="Posts" href="/site/posts" icon={FileText}>
                <SidebarSubItem label="All posts" href="/site/posts" />
                <SidebarSubItem label="Categories" href="/site/posts/categories" />
              </SidebarItem>
            </ul>
          </SidebarContent>
        </Sidebar>
      </VamosProvider>,
    );
    expect(screen.getByRole("link", { name: "All posts" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Categories" })).toBeInTheDocument();
  });

  it("app switcher lists apps", async () => {
    const { user } = renderWithProviders(<Menu />);
    await user.click(screen.getByRole("button", { name: "Switch app, current: Site" }));
    const panel = await screen.findByRole("dialog", { name: "Apps" });
    expect(within(panel).getByRole("link", { name: /CRM/ })).toHaveAttribute("href", "/crm");
    expect(within(panel).getByRole("link", { name: /Site/ })).toHaveAttribute("aria-current", "true");
  });
});
