import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb";
import { LocaleProvider } from "../lib/locale";
import { tr } from "../locales/tr";

const trail = [
  { label: "Companies", href: "/companies" },
  { label: "Northwind Traders", href: "/companies/northwind" },
  { label: "Contacts", href: "/companies/northwind/contacts" },
  { label: "Regional", href: "/companies/northwind/contacts/regional" },
  { label: "Laura Callahan" },
];

describe("Breadcrumb", () => {
  it("renders nav > ol with the last item as the current page", async () => {
    const { container } = render(<Breadcrumb items={trail.slice(0, 3)} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav.querySelector("ol")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Companies" })).toHaveAttribute("href", "/companies");
    expect(screen.getByText("Contacts").closest("[aria-current]")).toHaveAttribute("aria-current", "page");
    expect(container.querySelectorAll("[data-slot=breadcrumb-separator][aria-hidden]")).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("collapses the middle into a menu with maxItems", async () => {
    const { container } = render(<Breadcrumb items={trail} maxItems={4} />);
    expect(screen.queryByRole("link", { name: "Northwind Traders" })).toBeNull();
    expect(screen.getByRole("link", { name: "Regional" })).toBeInTheDocument();
    const more = screen.getByRole("button", { name: "Show hidden pages" });
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(more);
    expect(await screen.findByRole("menuitem", { name: "Northwind Traders" })).toHaveAttribute("href", "/companies/northwind");
    expect(screen.getByRole("menuitem", { name: "Contacts" })).toBeInTheDocument();
  });

  it("offers a sibling menu", async () => {
    render(<Breadcrumb items={[{ label: "Companies", href: "/companies", menu: [{ label: "Contacts", href: "/contacts" }] }, { label: "Acme" }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Pages next to Companies" }));
    expect(await screen.findByRole("menuitem", { name: "Contacts" })).toBeInTheDocument();
  });

  it("supports the compound API and the locale", () => {
    render(
      <LocaleProvider locale="tr-TR" messages={tr}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/pages">Sayfalar</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Hakkımızda</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </LocaleProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Sayfa yolu" })).toBeInTheDocument();
  });

  it("outputs JSON-LD for websites", () => {
    const { container } = render(<Breadcrumb items={trail.slice(0, 2).concat({ label: "Q3 report", href: "/companies/northwind/q3" })} jsonLd baseUrl="https://vamos.ist" />);
    const json = JSON.parse(container.querySelector("script[type='application/ld+json']")!.textContent!);
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement[0]).toMatchObject({ position: 1, name: "Companies", item: "https://vamos.ist/companies" });
  });
});
