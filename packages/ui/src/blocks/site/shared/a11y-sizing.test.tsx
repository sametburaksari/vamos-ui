import { render, screen } from "@testing-library/react";
import { columnSizes, filmstripSizes, SITE_SIZES } from "./image-sizes";
import { nameWithLabel } from "./tap";
import { headingLines } from "./heading-lines";
import { ContactDock } from "../contact-dock";
import { GallerySection } from "../gallery-section";
import { MediaText } from "../media-text";

describe("responsive image sizes", () => {
  it("caps columns at the container and keeps bleeds fluid", () => {
    expect(columnSizes(5 / 12)).toBe("(min-width: 56rem) min(42vw, 32rem), 100vw");
    expect(columnSizes(1 / 3, { narrow: "50vw" })).toBe("(min-width: 56rem) min(34vw, 26rem), 50vw");
    expect(columnSizes(5 / 12, { bleed: true })).toBe("(min-width: 56rem) 42vw, 100vw");
    expect(filmstripSizes(4 / 5)).toBe("max(12rem, min(31vw, 24rem))");
    expect(SITE_SIZES.container).toBe("min(100vw, 76rem)");
  });

  it("every photo in a site block gets a layout-based sizes, never the 100vw default on a column", () => {
    const img = { src: "/a.jpg", alt: "Grill at dusk", width: 1600, height: 1200 };
    const { container } = render(
      <>
        <GallerySection variant="grid" images={[{ image: img }, { image: { ...img, alt: "Bar" } }, { image: { ...img, alt: "Terrace" } }]} lightbox={false} />
        <MediaText title="Fish" media={img} />
      </>,
    );
    const sizes = [...container.querySelectorAll("img")].map((i) => i.getAttribute("sizes"));
    expect(sizes).toHaveLength(4);
    for (const s of sizes) expect(s).toMatch(/^\(min-width: 56rem\) min\(\d+vw, \d+rem\), (50|100)vw$/);
  });
});

describe("label in name (WCAG 2.5.3)", () => {
  it("keeps names that already contain the visible label, prefixes the rest", () => {
    expect(nameWithLabel("WhatsApp", "Message us on WhatsApp")).toBe("Message us on WhatsApp");
    expect(nameWithLabel("Rezervasyon", "WhatsApp üzerinden bize yazın")).toBe("Rezervasyon, WhatsApp üzerinden bize yazın");
    expect(nameWithLabel(undefined, "Call")).toBe("Call");
  });

  it("ContactDock: a custom fab label and every bar action are part of the accessible name", () => {
    render(<ContactDock contained variant="both" label="Book a table" whatsapp="+902160000000" phone="+902160000000" directionsHref="https://maps.example.com/x" />);
    expect(screen.getByRole("link", { name: /^Book a table, Message us on WhatsApp/ })).toBeInTheDocument();
    for (const link of screen.getAllByRole("link")) {
      const visible = link.querySelector("span[aria-hidden]")?.textContent;
      if (visible) expect(link.getAttribute("aria-label")!.toLowerCase()).toContain(visible.toLowerCase());
    }
  });
});

describe("headingLines", () => {
  it("splits on \\n into block lines joined by a real space; emphasis survives", () => {
    const { container } = render(<h1>{headingLines("Ateşte *közde*,\nmuhabbet sofrada.")}</h1>);
    expect(container.textContent).toBe("Ateşte közde, muhabbet sofrada.");
    expect(container.querySelector("em")).toHaveTextContent("közde");
    expect(container.querySelectorAll(".vb-heading-line")).toHaveLength(2);
    expect(headingLines("No break")).toBe("No break");
  });
});
