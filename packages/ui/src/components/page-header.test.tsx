import * as React from "react";
import { screen } from "@testing-library/react";
import { FileText } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { PageHeader } from "./page-header";
import { AppShellProvider } from "./app-shell";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("PageHeader", () => {
  it("renders one h1 with eyebrow, description, meta and actions, and passes axe", async () => {
    renderWithProviders(
      <PageHeader
        eyebrow="Content"
        title="Posts"
        description="128 posts · 6 scheduled for this week"
        meta={<Badge tone="success">Live</Badge>}
        actions={<Button variant="primary">New post</Button>}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Posts" })).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New post" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("back link and loading state", () => {
    renderWithProviders(<PageHeader back={{ href: "/crm/contacts", label: "Contacts" }} title="Jane Doe" size="sm" loading />);
    expect(screen.getByRole("link", { name: "Contacts" })).toHaveAttribute("href", "/crm/contacts");
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("aria-busy", "true");
  });

  it("overflow menu opens from the ⋯ button", async () => {
    const { user } = renderWithProviders(<PageHeader title="Payroll" menu={[{ id: "export", label: "Export CSV" }]} />);
    await user.click(screen.getByRole("button", { name: "More actions" }));
    expect(await screen.findByRole("menuitem", { name: "Export CSV" })).toBeInTheDocument();
  });

  it('breadcrumb="auto" follows the App shell trail', () => {
    renderWithProviders(
      <AppShellProvider
        currentPath="/site/posts/categories"
        apps={[
          {
            id: "site",
            name: "Site",
            href: "/site",
            nav: [{ id: "posts", label: "Posts", href: "/site/posts", icon: FileText, children: [{ id: "posts.all", label: "All posts", href: "/site/posts" }, { id: "posts.categories", label: "Categories", href: "/site/posts/categories" }] }],
          },
          { id: "crm", name: "CRM", href: "/crm", nav: [] },
        ]}
      >
        <PageHeader breadcrumb="auto" title="Categories" />
      </AppShellProvider>,
    );
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(crumbs).toHaveTextContent("Site");
    expect(crumbs).toHaveTextContent("Posts");
    expect(crumbs.querySelector("[aria-current=page]")).toHaveTextContent("Categories");
  });
});
