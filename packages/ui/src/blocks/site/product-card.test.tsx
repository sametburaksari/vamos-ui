import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ProductCard, discountPercent, productJsonLd, type ProductCardData } from "./product-card";
import { ProductGrid } from "./product-grid";
import { commerceLabelsTr } from "./shared/labels-commerce";

const photo = (id: string, alt: string) => ({ src: `https://images.example.com/${id}.jpg`, alt, width: 800, height: 1000 });
const usd = (amount: string) => ({ amount, currency: "USD" });

const mug: ProductCardData = {
  id: "tide-mug",
  title: "Tide mug",
  href: "/shop/tide-mug",
  vendor: "Kilnhouse",
  image: photo("mug-salt", "A pale blue stoneware mug"),
  price: usd("38"),
  compareAt: usd("48"),
  isNew: true,
  rating: { value: 4.7, count: 52 },
  swatches: [
    { name: "Sea salt", color: "oklch(0.8 0.035 232)", image: photo("mug-salt", "A pale blue stoneware mug") },
    { name: "Oat", color: "oklch(0.8 0.055 76)", image: photo("mug-oat", "An oat stoneware mug") },
    { name: "Iron", color: "oklch(0.35 0.02 40)", soldOut: true },
  ],
};

describe("ProductCard", () => {
  it("an article with one covering title link, sale price, badges, rating and swatch radios", async () => {
    const { container } = render(<main><ProductCard {...mug} /></main>);
    const card = screen.getByRole("article", { name: "Tide mug" });
    expect(within(card).getAllByRole("link")).toHaveLength(1);
    expect(within(card).getByRole("link", { name: "Tide mug" })).toHaveAttribute("href", "/shop/tide-mug");
    expect(within(card).getByText("Now $38, Was $48")).toBeInTheDocument();
    expect(card.querySelector("s")).toHaveTextContent("$48");
    expect(within(card).getByText("−21%")).toBeInTheDocument();
    expect(within(card).getByText("New")).toBeInTheDocument();
    expect(within(card).getByRole("img", { name: "Rated 4.7 out of 5" })).toBeInTheDocument();
    const group = within(card).getByRole("group", { name: "Options for Tide mug" });
    const radios = within(group).getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("value"))).toEqual(["0", "1", "2"]);
    expect(radios[0]).toBeChecked();
    expect(within(group).getByRole("radio", { name: "Iron, Sold out" })).toBeInTheDocument();
    // one stacked photo per swatch with a photo of its own (the third falls back to the main photo)
    expect(card.querySelectorAll(".vb-pc-photo")).toHaveLength(3);
    expect(card.querySelectorAll("img[alt='']")).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("built-in quick add reports the chosen swatch; sold-out options are skipped", () => {
    const added: number[] = [];
    render(<ProductCard {...mug} onQuickAdd={(i) => added.push(i)} />);
    const add = screen.getByRole("button", { name: "Add Tide mug to cart" });
    fireEvent.click(add);
    fireEvent.click(screen.getByRole("radio", { name: "Oat" }));
    fireEvent.click(add);
    fireEvent.click(screen.getByRole("radio", { name: "Iron, Sold out" }));
    fireEvent.click(add);
    expect(added).toEqual([0, 1]);
  });

  it("controlled swatches name the variant and disable quick add when it is sold out", () => {
    function Controlled() {
      const [i, setI] = React.useState(1);
      return <ProductCard {...mug} swatchIndex={i} onSwatchChange={setI} onQuickAdd={() => {}} />;
    }
    render(<Controlled />);
    expect(screen.getByRole("button", { name: "Add Tide mug, Oat, to cart" })).toBeEnabled();
    fireEvent.click(screen.getByRole("radio", { name: "Iron, Sold out" }));
    expect(screen.getByRole("button", { name: "Add Tide mug, Iron, to cart" })).toBeDisabled();
  });

  it("slots, price range, sold out and hover photo", () => {
    const { rerender } = render(
      <ProductCard title="Atlas watch" href="/w/atlas" image={photo("atlas", "A steel field watch")} hoverImage={photo("atlas-back", "The case back")} priceRange={{ min: usd("240"), max: usd("410") }} rangeStyle="range" wishlist={<button type="button">Save Atlas watch</button>} quickAdd={<button type="button">Choose size</button>} />,
    );
    expect(screen.getByText("$240 – $410")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Atlas watch" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose size" })).toBeInTheDocument();
    expect(document.querySelector("[data-hover]")).toHaveAttribute("aria-hidden", "true");
    rerender(<ProductCard title="Atlas watch" href="/w/atlas" price={usd("240")} soldOut onQuickAdd={() => {}} locale="tr-TR" labels={commerceLabelsTr} />);
    expect(screen.getByText("Tükendi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Atlas watch ürününü sepete ekle" })).toBeDisabled();
  });

  it("discountPercent and productJsonLd", () => {
    expect(discountPercent(usd("80"), usd("100"))).toBe(20);
    expect(discountPercent(usd("100"), usd("80"))).toBeNull();
    expect(discountPercent(usd("80"), { amount: "100", currency: "EUR" })).toBeNull();
    const ld = productJsonLd(mug, { url: "https://shop.example.com/shop/tide-mug", brand: "Kilnhouse", sku: "TM-01" });
    expect(ld).toMatchObject({
      "@type": "Product",
      name: "Tide mug",
      sku: "TM-01",
      brand: { "@type": "Brand", name: "Kilnhouse" },
      offers: { "@type": "Offer", price: "38", priceCurrency: "USD", availability: "https://schema.org/InStock" },
      aggregateRating: { ratingValue: 4.7, reviewCount: 52 },
    });
    expect(ld.image).toEqual(["https://images.example.com/mug-salt.jpg", "https://images.example.com/mug-oat.jpg"]);
    expect(productJsonLd({ title: "Atlas", href: "/a", priceRange: { min: usd("240"), max: usd("410") }, soldOut: true }).offers).toMatchObject({ "@type": "AggregateOffer", lowPrice: "240", highPrice: "410", availability: "https://schema.org/OutOfStock" });
  });
});

describe("ProductGrid", () => {
  const books: ProductCardData[] = [
    { title: "Field Notes, vol. 2", href: "/books/field-notes-2", price: usd("24") },
    { title: "The Quiet Workshop", href: "/books/quiet-workshop", price: usd("31"), rating: { value: 4.2, count: 9 } },
  ];

  it("a section with a header; the list is named by the title; cards get h3", async () => {
    const { container } = render(<main><ProductGrid title="New this *week*" products={[mug, ...books]} allLink={{ href: "/shop", label: "Shop all" }} jsonLd siteUrl="https://shop.example.com" /></main>);
    const list = screen.getByRole("list", { name: "New this week" });
    expect(within(list).getAllByRole("article")).toHaveLength(3);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getByRole("link", { name: /Shop all/ })).toHaveAttribute("href", "/shop");
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(ld.itemListElement[1]).toEqual({ "@type": "ListItem", position: 2, url: "https://shop.example.com/books/field-notes-2", name: "Field Notes, vol. 2" });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("bare list variant, renderCard and empty state", () => {
    const { container, rerender } = render(<ProductGrid bare variant="list" products={books} />);
    expect(container.querySelector("section")).toBeNull();
    expect(screen.getByRole("list", { name: "Products" })).toHaveAttribute("data-variant", "list");
    expect(container.querySelectorAll("[data-layout='row']")).toHaveLength(2);
    rerender(<ProductGrid bare products={books} renderCard={(p) => <a href={p.href}>{p.title}</a>} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
    rerender(<ProductGrid bare products={[]} locale="tr-TR" labels={commerceLabelsTr} />);
    expect(screen.getByText("Burada henüz ürün yok")).toBeInTheDocument();
  });
});
