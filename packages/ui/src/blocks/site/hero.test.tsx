import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Hero } from "./hero";

const photo = { src: "/dining.jpg", alt: "The dining room at dusk", width: 2000, height: 1333 };

describe("Hero", () => {
  it("editorial: h1 with emphasis, one text-link action, facts, a 21:9 strip", async () => {
    const { container } = render(
      <main>
        <Hero
          eyebrow="Studio Arda · Maltepe"
          title="Websites for places people *actually* visit."
          lead="We design and run sites for restaurants, clinics and hotels."
          actions={[{ link: { href: "/work", label: "See the work" }, style: "link" }, { link: { href: "/contact", label: "Contact" }, style: "primary" }]}
          meta={[{ label: "Founded", value: "2014" }]}
          media={photo}
        />
      </main>,
    );
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.querySelector("em")).toHaveTextContent("actually");
    expect(screen.getByRole("region", { name: /Websites for places/ })).toHaveAttribute("data-variant", "editorial");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("2014").tagName).toBe("DD");
    expect(container.querySelector(".vb-hero-strip [data-ratio]")).toHaveStyle({ aspectRatio: "21 / 9" });
    expect(screen.getByRole("img")).toHaveAttribute("fetchpriority", "high");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("split-media: portrait bleeds off the end edge with a caption", async () => {
    const { container } = render(<main><Hero variant="split-media" title="Two hours, *nowhere* to be." media={{ ...photo, alt: "Warm stones by the massage table" }} caption="Treatment room 3" /></main>);
    expect(container.querySelector("figure.vb-bleed-end figcaption")).toHaveTextContent("Treatment room 3");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("full-bleed: forced dark, decorative photo under a scrim, aside card, video toggle", async () => {
    const { container } = render(
      <main>
        <Hero variant="full-bleed" title="Dinner, *slowly*." media={photo} video={{ src: "/dusk.mp4" }} aside={{ title: "Open today", body: "18:00 – 00:30", cta: { link: { href: "/book", label: "Book a table" }, style: "primary" } }} height="screen" />
      </main>,
    );
    const region = screen.getByRole("region");
    expect(region).toHaveClass("dark");
    expect(container.querySelector(".vb-hero-screen")).not.toBeNull();
    expect(container.querySelector("video")).toHaveAttribute("poster", "/dining.jpg");
    expect(screen.getByRole("button", { name: /background video/ })).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveTextContent("Open today");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("product: release chip, screenshot frame; statement: centred, slash-separated services", async () => {
    const { container, rerender } = render(
      <main>
        <Hero variant="product" title="Every booking in *one* inbox." release={{ tag: "v2.4", label: "Shared inboxes", href: "/changelog" }} screenshot={{ src: "/app.png", alt: "The inbox", width: 2400, height: 1600 }} />
      </main>,
    );
    expect(screen.getByRole("link", { name: /v2.4/ })).toHaveAttribute("href", "/changelog");
    expect(container.querySelector(".vb-hero-shot img")).toHaveAttribute("alt", "The inbox");
    rerender(<main><Hero variant="statement" title="Sites that *open* the door." services={[{ label: "Restaurant sites", href: "/a" }, { label: "Ad management", href: "/b" }]} /></main>);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("/");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("headingLevel 2 when the renderer says so", () => {
    render(<Hero title="Second hero" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Second hero");
  });
});
