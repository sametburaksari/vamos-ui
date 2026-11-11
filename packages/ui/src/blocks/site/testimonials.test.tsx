import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Testimonials, type TestimonialItem } from "./testimonials";
import { testimonialsBlock } from "./registry-2";

const items: TestimonialItem[] = [
  { quote: "Table requests through the site doubled before the summer season started.", author: "Deniz Arslan", role: "Owner", company: "Meyhane Rasimpaşa", rating: 5, source: "google", date: "2026-09-14" },
  { quote: "The hammam booking finally works on phones. Guests stopped calling to ask.", author: "Melis Aydın", role: "Manager", company: "Defne Spa" },
  { quote: "Clear prices, a calm site, and we can edit the menu ourselves.", author: "Kerem Yıldız", rating: 4, date: "2026-10-02" },
];

describe("Testimonials", () => {
  it("feature: figure > blockquote + figcaption with locale quotes", async () => {
    const { container } = render(<main><Testimonials items={items} /></main>);
    const fig = container.querySelector("figure")!;
    expect(fig.querySelector("blockquote")).toHaveTextContent("Table requests");
    expect(fig.querySelector("figcaption")).toHaveTextContent("Deniz Arslan");
    expect(screen.getByText("“", { selector: ".vb-quote-mark" })).toHaveAttribute("aria-hidden");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("wall: stars only with a named source", async () => {
    const { container } = render(<main><Testimonials variant="wall" title="What clients *say*" items={items} /></main>);
    expect(screen.getAllByRole("img", { name: /out of 5/ })).toHaveLength(1);
    expect(screen.getByRole("img", { name: "5 out of 5" })).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("reviews: a first-party summary shows without a platform name", () => {
    render(<Testimonials variant="reviews" title="From the order notes" items={items} summary={{ rating: 4.9, count: 312, source: "direct" }} />);
    expect(screen.getByText(/Rated 4\.9 out of 5 — 312 reviews/)).toBeInTheDocument();
  });

  it("reviews: summary with source and count", async () => {
    const { container } = render(<main><Testimonials variant="reviews" title="Guests on *Google*" items={items} summary={{ rating: 4.8, count: 1240, source: "google", link: { href: "https://g.page/r/meyhane", label: "Read all reviews" } }} /></main>);
    expect(screen.getByText(/4\.8 on Google — 1,240 reviews/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read all reviews/ })).toHaveAttribute("target", "_blank");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("carousel: labelled slides, counter, buttons and arrow keys (no autoplay)", async () => {
    const user = userEvent.setup();
    const { container } = render(<main><Testimonials variant="carousel" title="References" items={items} /></main>);
    const region = screen.getAllByRole("region", { name: "carousel" })[0]!;
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    const slides = within(region).getAllByRole("group");
    expect(slides[0]).toHaveAccessibleName("1 of 3");
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    const track = container.querySelector(".vb-carousel-track") as HTMLElement;
    track.focus();
    await user.keyboard("{End}");
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("a single item never becomes a carousel; preview validates", () => {
    render(<Testimonials variant="carousel" items={[items[0]!]} />);
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(testimonialsBlock.schema.safeParse(testimonialsBlock.sample()).success).toBe(true);
  });
});
