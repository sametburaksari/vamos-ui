import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { PageIntro, breadcrumbJsonLd } from "./page-intro";

const crumbs = [{ label: "Home", href: "/" }, { label: "Treatments", href: "/treatments" }, { label: "Hammam rituals" }];

describe("PageIntro", () => {
  it("simple: breadcrumb nav with the current page and an h1", async () => {
    const { container } = render(<main><PageIntro breadcrumb={crumbs} title="Hammam rituals, *by the hour*" lead="Every ritual starts with twenty minutes on the warm stone." /></main>);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByText("Hammam rituals", { selector: "[aria-current]" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hammam rituals, by the hour");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("with-media bleeds a 21:9 image; ruled shows facts behind a rule", async () => {
    const { container, rerender } = render(<main><PageIntro variant="with-media" title="About" media={{ src: "/team.jpg", alt: "The team at the long table", width: 2400, height: 1600 }} /></main>);
    expect(container.querySelector("[data-ratio]")).toHaveStyle({ aspectRatio: "21 / 9" });
    rerender(<main><PageIntro variant="ruled" title="Mobile massage" meta={[{ label: "Service area", value: "Asian side" }, { label: "From", value: "₺2,400" }]} /></main>);
    expect(screen.getByText("Service area").tagName).toBe("DT");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("BreadcrumbList JSON-LD", () => {
    const ld = breadcrumbJsonLd(crumbs.map((c) => ({ label: c.label, href: c.href })), "https://hamam.example");
    expect(ld).toMatchObject({ "@type": "BreadcrumbList", itemListElement: [{ position: 1, item: "https://hamam.example/" }, { position: 2 }, { position: 3, name: "Hammam rituals" }] });
    expect((ld!.itemListElement as { item?: string }[])[2]!.item).toBeUndefined();
  });
});
