import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { GallerySection, type GalleryImage } from "./gallery-section";
import { galleryBlock } from "./registry-2";

const img = (n: number, alt: string, span?: GalleryImage["span"]): GalleryImage => ({ image: { src: `https://images.unsplash.com/photo-${n}?w=1200`, alt, width: 1200, height: 800 }, span, caption: `${alt}.` });
const images = [img(1, "The dining room at dusk", "big"), img(2, "A table for two by the window"), img(3, "Meze on marble"), img(4, "The raki shelf", "tall"), img(5, "The terrace in May", "wide"), img(6, "Grilled bonito")];

describe("GallerySection", () => {
  it("mosaic: spans, buttons named 'Open image n of N'", async () => {
    const { container } = render(<main><GallerySection title="The *room*" images={images} /></main>);
    expect(container.querySelector('[data-span="big"]')).toBeInTheDocument();
    const triggers = screen.getAllByRole("button", { name: /Open image/ });
    expect(triggers).toHaveLength(6);
    expect(triggers[2]).toHaveAccessibleName("Open image 3 of 6");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("lightbox opens on click, Escape closes and focus returns", async () => {
    const user = userEvent.setup();
    render(<GallerySection images={images} variant="grid" />);
    const trigger = screen.getByRole("button", { name: "Open image 2 of 6" });
    await user.click(trigger);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("few images fall back to grid; filmstrip is a scrollable list; lightbox can be off", async () => {
    const { container, rerender } = render(<main><GallerySection images={images.slice(0, 3)} /></main>);
    expect(container.querySelector("section")).toHaveAttribute("data-variant", "grid");
    rerender(<main><GallerySection variant="filmstrip" title="Terrace" images={images} lightbox={false} /></main>);
    expect(screen.getByRole("list", { name: "Terrace" })).toHaveAttribute("tabindex", "0");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("6 photos")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("split-caption: figures with captions; preview validates", async () => {
    const { container } = render(<main><GallerySection variant="split-caption" title="Project: Kidwell clinics" images={images.slice(0, 3)} lightbox={false} /></main>);
    expect(container.querySelectorAll("figure figcaption")).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
    expect(galleryBlock.schema.safeParse(galleryBlock.sample()).success).toBe(true);
  });
});
