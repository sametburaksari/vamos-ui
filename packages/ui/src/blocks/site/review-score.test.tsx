import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ReviewScore, reviewJsonLd } from "./review-score";
import { commerceLabelsDe } from "./shared/labels-commerce";

const props = {
  score: 8.6,
  scoreLabel: "Excellent",
  criteria: [
    { label: "Sound", score: 9.2 },
    { label: "Comfort", score: 8 },
    { label: "Battery", score: 7.5 },
  ],
  pros: ["Warm, detailed mids", "Folds flat"],
  cons: ["No hard case"],
  verdict: "The pair to beat under $200.",
  reviewer: { name: "Mara Ellison" },
  datePublished: "2026-11-02",
  aggregateRating: { value: 4.4, count: 312 },
  item: { name: "Arden H2 headphones", brand: "Arden", image: "https://images.example.com/h2.jpg" },
};

describe("ReviewScore", () => {
  it("a named section with the score, criteria, pros/cons and verdict in text", async () => {
    const { container } = render(<main><article><h1>Arden H2 review</h1><ReviewScore {...props} /></article></main>);
    const box = screen.getByRole("region", { name: "Our score" });
    expect(within(box).getByRole("img", { name: "8.6 out of 10" })).toBeInTheDocument();
    expect(within(box).getByText("Excellent")).toBeInTheDocument();
    expect(within(box).getByText("Sound").closest("li")).toHaveTextContent("9.2 (9.2 out of 10)");
    expect(within(box).getByRole("heading", { name: "Pros" }).nextElementSibling?.querySelectorAll("li")).toHaveLength(2);
    expect(within(box).getByRole("heading", { name: "Cons" })).toBeInTheDocument();
    expect(within(box).getByText("The pair to beat under $200.")).toBeInTheDocument();
    expect(within(box).getByRole("img", { name: "Rated 4.4 out of 5" })).toBeInTheDocument();
    expect(within(box).getByText("(312 reviews)")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("emits Review JSON-LD with reviewRating, notes and the item's aggregateRating", () => {
    const { container } = render(<ReviewScore {...props} />);
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Review");
    expect(ld.reviewRating).toEqual({ "@type": "Rating", ratingValue: 8.6, bestRating: 10, worstRating: 0 });
    expect(ld.itemReviewed).toMatchObject({ "@type": "Product", name: "Arden H2 headphones", brand: { name: "Arden" }, aggregateRating: { ratingValue: 4.4, reviewCount: 312, bestRating: 5 } });
    expect(ld.positiveNotes.itemListElement.map((e: { name: string }) => e.name)).toEqual(["Warm, detailed mids", "Folds flat"]);
    expect(ld.negativeNotes.itemListElement[0]).toEqual({ "@type": "ListItem", position: 1, name: "No hard case" });
    expect(ld.author).toEqual({ "@type": "Person", name: "Mara Ellison" });
    expect(ld.reviewBody).toBe("The pair to beat under $200.");
  });

  it("percent and stars displays; no JSON-LD without an item or when turned off", () => {
    const { container, rerender } = render(<ReviewScore score={86} max={100} display="percent" title="Verdict" headingLevel={3} />);
    expect(screen.getByRole("img", { name: "86 out of 100" })).toHaveTextContent("86%");
    expect(screen.getByRole("heading", { level: 3, name: "Verdict" })).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    rerender(<ReviewScore score={9} display="stars" item={{ name: "Field Notes, vol. 2", type: "Book" }} jsonLd={false} locale="de-DE" labels={commerceLabelsDe} />);
    expect(screen.getByRole("img", { name: "9,0 von 10" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Unsere Wertung" })).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });

  it("reviewJsonLd keeps only string notes", () => {
    const ld = reviewJsonLd({ score: 4, max: 5, item: { name: "Tide mug" }, pros: ["Holds heat", <b key="b">bold</b>] });
    expect(ld.positiveNotes).toEqual({ "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Holds heat" }] });
    expect(ld).not.toHaveProperty("negativeNotes");
  });
});
