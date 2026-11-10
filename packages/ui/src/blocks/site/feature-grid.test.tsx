import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { FeatureGrid } from "./feature-grid";

const items = [
  { title: "Restaurant sites", text: "Menus your staff edit from a phone.", link: { href: "/services/restaurants", label: "Read more" } },
  { title: "Clinic & spa sites", text: "Treatment pages that rank for the district.", icon: "heart-pulse" },
  { title: "Ad management", text: "Campaigns measured against real bookings.", media: { src: "/ads.jpg", alt: "A report on a desk", width: 1200, height: 800 } },
];

describe("FeatureGrid", () => {
  it("list: numbered rows, h3 items under an h2, one stretched link per linked row", async () => {
    const { container } = render(<main><FeatureGrid eyebrow="Services" title="What we *build*" lead="Three things, done properly." items={items} /></main>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("What we build");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getByText("01")).toHaveClass("font-mono");
    const li = screen.getByRole("link", { name: "Restaurant sites" }).closest("li")!;
    expect(li).toHaveClass("vb-linked");
    expect(li.querySelectorAll("a")).toHaveLength(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("grid: icons render small and unboxed; two items fall back to the list", () => {
    const { container, rerender } = render(<FeatureGrid variant="grid" columns={3} items={items} />);
    expect(container.querySelector("section")).toHaveAttribute("data-variant", "grid");
    expect(container.querySelector("svg.lucide-heart-pulse")).toHaveClass("size-5", "text-fg-muted");
    rerender(<FeatureGrid variant="grid" items={items.slice(0, 2)} />);
    expect(container.querySelector("section")).toHaveAttribute("data-variant", "list");
  });

  it("tabs: vertical WAI-ARIA tabs with arrow keys", async () => {
    const user = userEvent.setup();
    const { container } = render(<main><FeatureGrid variant="tabs" title="One inbox" items={items} /></main>);
    const tablist = screen.getByRole("tablist", { name: "One inbox" });
    expect(tablist).toHaveAttribute("aria-orientation", "vertical");
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    tabs[0]!.focus();
    await user.keyboard("{ArrowDown}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("sticky-media: per-item view timelines and inline fallback images", async () => {
    const { container } = render(<main><FeatureGrid id="feat" variant="sticky-media" title="Inside the spa" items={items.map((it) => ({ ...it, media: { src: "/x.jpg", alt: `${it.title} photo`, width: 1200, height: 1500 } }))} /></main>);
    const li = container.querySelectorAll(".vb-sticky-item");
    expect(li).toHaveLength(3);
    expect((li[1] as HTMLElement).style.getPropertyValue("view-timeline-name")).toBe("--vbf-feat-1");
    expect(container.querySelector(".vb-sticky-media")).toHaveAttribute("aria-hidden");
    expect(container.querySelectorAll(".vb-sticky-inline")).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });
});
