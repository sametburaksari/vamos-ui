import * as React from "react";
import { screen, waitFor, within } from "@testing-library/react";
import { FileText, Globe, Handshake, KanbanSquare, LayoutDashboard, Settings } from "lucide-react";
import type { VamosLinkProps } from "../lib/provider";
import { AppShell, AppShellProvider, useAppShell, type AppDefinition } from "./app-shell";
import type { NavNode } from "./sidebar";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const apps: AppDefinition[] = [
  {
    id: "site",
    name: "Site",
    description: "Content & website",
    icon: Globe,
    href: "/site",
    nav: [
      { id: "dashboard", label: "Dashboard", href: "/site", icon: LayoutDashboard },
      { type: "group", id: "content", label: "Content", items: [{ id: "posts", label: "Posts", href: "/site/posts", icon: FileText }] },
    ],
    links: [{ id: "view-site", label: "View site", href: "https://northwind.example" }],
    newMenu: [{ id: "new-post", label: "Post", href: "/site/posts/new" }],
  },
  {
    id: "crm",
    name: "CRM",
    description: "Customers & sales",
    icon: Handshake,
    href: "/crm",
    accent: "ocean",
    nav: [
      { id: "dashboard", label: "Dashboard", href: "/crm", icon: LayoutDashboard },
      { id: "pipeline", label: "Pipeline", href: "/crm/pipeline", icon: KanbanSquare, badge: 7 },
    ],
  },
  { id: "payroll", name: "Payroll", href: "/payroll", nav: [], permission: "payroll.view" },
];
const shared: NavNode[] = [{ id: "settings", label: "Settings", href: "/settings", icon: Settings }];

function Where() {
  const { activeApp } = useAppShell();
  return <p>Active: {activeApp?.name}</p>;
}

function Harness({ initial = "/site/posts", can }: { initial?: string; can?: (p: string) => boolean }) {
  const [path, setPath] = React.useState(initial);
  const Link = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, VamosLinkProps>(function MemoryLink({ href, onClick, replace: _r, prefetch: _p, ...props }, ref) {
        return (
          <a
            ref={ref}
            href={href}
            onClick={(e) => {
              onClick?.(e);
              e.preventDefault();
              setPath(href);
            }}
            {...props}
          />
        );
      }),
    [],
  );
  return (
    <AppShellProvider apps={apps} sharedNav={shared} currentPath={path} navigate={setPath} linkComponent={Link} can={can ?? ((p) => p !== "payroll.view")} onCollapsedChange={() => {}}>
      <AppShell user={{ name: "Ada Lovelace", email: "ada@northwind.io", items: [{ id: "out", label: "Sign out" }] }} height="fill">
        <h1>Page at {path}</h1>
        <Where />
      </AppShell>
    </AppShellProvider>
  );
}

describe("AppShell", () => {
  it("renders landmarks, skip link and the active app, and passes axe", async () => {
    renderWithProviders(<Harness />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "vui-main");
    expect(screen.getByRole("navigation", { name: "Site menu" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to content" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute("aria-current", "page");
    await expectNoA11yViolations();
  });

  it('"View site" only shows in the Site app; switching apps swaps nav and accent', async () => {
    const { user, container } = renderWithProviders(<Harness />);
    expect(screen.getByRole("link", { name: /View site/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Switch app, current: Site" }));
    const panel = await screen.findByRole("dialog", { name: "Apps" });
    expect(within(panel).queryByText("Payroll")).toBeNull();
    await user.click(within(panel).getByRole("button", { name: /CRM/ }));
    expect(await screen.findByText("Active: CRM")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View site/ })).toBeNull();
    expect(screen.getByRole("navigation", { name: "CRM menu" })).toBeInTheDocument();
    expect(container.ownerDocument.querySelector("[data-slot=theme-scope][data-accent=ocean]")).not.toBeNull();
  });

  it("⌘K lists Go to commands from every app with app badges and navigates", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.keyboard("{Control>}k{/Control}");
    const dialog = await screen.findByRole("dialog", { name: "Command palette" });
    await user.type(within(dialog).getByRole("combobox"), "pipeline");
    const option = within(dialog).getByRole("option", { name: /Pipeline/ });
    expect(option).toHaveTextContent("CRM");
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("heading", { name: "Page at /crm/pipeline" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
  });

  it("the New menu comes from the active app", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByRole("button", { name: "New" }));
    expect(await screen.findByRole("menuitem", { name: "Post" })).toHaveAttribute("href", "/site/posts/new");
  });

  it("mobile menu button opens the navigation sheet", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const sheet = await screen.findByRole("dialog", { name: "Navigation" });
    expect(within(sheet).getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    await user.click(within(sheet).getByRole("link", { name: "Dashboard" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Navigation" })).toBeNull());
  });

  it("shows a forbidden state when no app is permitted", () => {
    renderWithProviders(
      <AppShellProvider apps={[apps[2]!]} currentPath="/" can={() => false}>
        <AppShell height="fill">x</AppShell>
      </AppShellProvider>,
    );
    expect(screen.getByRole("heading", { name: "No apps available" })).toBeInTheDocument();
  });
});
