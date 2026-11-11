import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { MenuList, menuJsonLd, type MenuCategory } from "./menu-list";
import { site2LabelsTr } from "./shared/labels-2";
import { menuBlock } from "./registry-2";

const TRY = (amount: string) => ({ amount, currency: "TRY" });
const categories: MenuCategory[] = [
  { title: "Cold meze", note: "Served from 6 pm", items: [
    { name: "Haydari", description: "Strained yoghurt, dill, roasted garlic.", prices: [{ amount: TRY("180") }], tags: ["vegetarian"], allergens: ["milk"] },
    { name: "Lakerda", description: "Cured bonito, red onion, olive oil.", prices: [{ amount: TRY("420") }], tags: ["chef-pick"], allergens: ["fish"], unavailable: true },
  ] },
  { title: "From the grill", items: [{ name: "Catch of the day", prices: [{}] }] },
  { title: "Rakı", items: [{ name: "Yeni Rakı Yeni Seri", prices: [{ label: "35 cl", amount: TRY("1450") }, { label: "70 cl", amount: TRY("2600") }] }] },
  { title: "Empty", items: [] },
];

describe("MenuList", () => {
  it("classic: category sections with headings, jump bar, tags as words, prices for screen readers", async () => {
    const { container } = render(<main><MenuList title="Tonight’s *meze*" categories={categories} priceNote="Prices include VAT. Service is not added." /></main>);
    const nav = screen.getByRole("navigation", { name: "Menu sections" });
    expect(within(nav).getAllByRole("link")).toHaveLength(3); // empty category hidden
    const cold = screen.getByRole("region", { name: "Cold meze" });
    expect(within(nav).getByRole("link", { name: "Cold meze" })).toHaveAttribute("href", `#${cold.id}`);
    expect(within(cold).getByText("Vegetarian")).toBeInTheDocument();
    expect(within(cold).getByText("Not today")).toBeInTheDocument();
    expect(within(cold).getByText(/^180 Turkish lir/i)).toHaveClass("sr-only");
    expect(screen.getByText("Market price")).toBeInTheDocument();
    expect(screen.getByText("70 cl")).toBeInTheDocument();
    expect(screen.getAllByText(/Allergens/)[0]!.parentElement).toHaveTextContent("Milk");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("service-list in Turkish: duration, price, a Book link named after the service", async () => {
    const spa: MenuCategory[] = [{ title: "Masaj", items: [
      { name: "Bali masajı", description: "Derin doku, sıcak taş.", duration: "50 dk", prices: [{ amount: TRY("1800") }] },
      { name: "İsveç masajı", prices: [{ label: "50 dk", amount: TRY("1600") }, { label: "80 dk", amount: TRY("2300") }] },
    ] }];
    const { container } = render(<main><MenuList variant="service-list" locale="tr-TR" labels={site2LabelsTr} title="Fiyat listesi" categories={spa} bookHref="/randevu" priceNote="Fiyatlara KDV dahildir." /></main>);
    expect(screen.getByText("₺1.800")).toBeInTheDocument();
    expect(screen.getByText("50 dk", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bali masajı için randevu" })).toHaveAttribute("href", "/randevu");
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("a whole menu page: h1 title, h2 categories, h3 dishes, dietary tags and allergens", async () => {
    const page: MenuCategory[] = [
      { title: "Meze", items: [{ name: "Şakşuka", prices: [{ amount: TRY("190") }], tags: ["vegan", "halal", "to-share"], allergens: ["celery"] }] },
      { title: "Tatlı", items: [{ name: "Kabak tatlısı", prices: [{ amount: TRY("220") }], tags: ["dairy-free", "seasonal"], allergens: ["nuts", "sesame"] }] },
    ];
    const { container } = render(<main><MenuList headingLevel={1} title="Menü" locale="tr-TR" labels={site2LabelsTr} categories={page} priceNote="Fiyatlara KDV dahildir." /></main>);
    expect(screen.getByRole("heading", { level: 1, name: "Menü" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Meze", "Tatlı"]);
    expect(screen.getByRole("heading", { level: 3, name: "Şakşuka" })).toBeInTheDocument();
    expect(screen.getByText("Helal")).toBeInTheDocument();
    expect(screen.getByText("Paylaşımlık")).toBeInTheDocument();
    expect(screen.getByText("Sütsüz")).toBeInTheDocument();
    expect(screen.getByText("Mevsimlik")).toBeInTheDocument();
    const diet = (menuJsonLd({ categories: page }).hasMenuSection as { hasMenuItem: { suitableForDiet: string[] }[] }[]).map((c) => c.hasMenuItem[0]!.suitableForDiet);
    expect(diet).toEqual([["https://schema.org/VeganDiet", "https://schema.org/HalalDiet"], ["https://schema.org/LowLactoseDiet"]]);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("photo keeps alignment without images; JSON-LD", () => {
    const { container } = render(<MenuList variant="photo" categories={[categories[0]!]} />);
    expect(container.querySelectorAll("li > span.size-\\[72px\\]")).toHaveLength(2);
    const ld = menuJsonLd({ categories });
    expect(ld["@type"]).toBe("Menu");
    expect((ld.hasMenuSection as { hasMenuItem: { offers: unknown[] }[] }[])[0]!.hasMenuItem[0]!.offers).toEqual([{ "@type": "Offer", price: "180", priceCurrency: "TRY", name: undefined }]);
    expect(menuBlock.schema.safeParse(menuBlock.sample()).success).toBe(true);
  });
});
