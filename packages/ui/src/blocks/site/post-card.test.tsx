import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { PostCard } from "./post-card";
import { FeaturedPosts, PostBlock } from "./post-modules";
import { newsLabelsTr } from "./shared/labels-news";
import { newsArticleJsonLd, newsItemListJsonLd, type NewsPost } from "./shared/news";

const cover = (alt: string) => ({ src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200", alt, width: 1200, height: 800 });
const newsPosts: NewsPost[] = [
  { href: "/city/night-tram", title: "The night tram returns", excerpt: "A twelve-month trial starts in March.", cover: cover("The city at dusk"), category: { label: "Transport", href: "/city/transport" }, publishedAt: "2026-11-15T07:40:00+03:00", author: { name: "Ayla Durukan" }, commentCount: 48, readingMinutes: 6 },
  { href: "/economy/cranes", title: "Port orders four electric cranes", cover: cover("Cranes over towers"), category: { label: "The port" }, publishedAt: "2026-11-15", author: { name: "Jonas Werth" }, commentCount: 0 },
  { href: "/science/seagrass", title: "Seagrass meadows are back", cover: cover("A river at dusk"), category: { label: "Sea & coast" }, publishedAt: "2026-11-14", format: "gallery" },
  { href: "/sport/derby", title: "Late header settles the derby", category: { label: "Football" }, publishedAt: "2026-11-14", format: "video" },
  { href: "/city/rents", title: "Rents near the waterfront rose 31 per cent", category: { label: "Housing" }, publishedAt: "2026-11-14" },
  { href: "/culture/festival", title: "The warehouse festival sells out", category: { label: "Music" }, publishedAt: "2026-11-13" },
];

describe("PostCard", () => {
  it("is an article with one covering title link plus a section link, machine dates and announced comments", async () => {
    const { container } = render(<main><PostCard post={newsPosts[0]!} variant="stack" excerpt /></main>);
    const card = screen.getByRole("article");
    const links = within(card).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/city/transport", "/city/night-tram"]);
    expect(within(card).getByRole("heading", { level: 3 })).toHaveTextContent("The night tram returns");
    expect(card.querySelector("time")).toHaveAttribute("datetime", "2026-11-15T07:40:00+03:00");
    expect(card.querySelector(".vb-news-meta")).toHaveTextContent("48 comments");
    expect(screen.getByText("6 min read")).toBeInTheDocument();
    expect(screen.getByText("A twelve-month trial starts in March.")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("overlay / row / list / text variants; format marks; Turkish labels; meta can be hidden", () => {
    const { rerender } = render(<PostCard post={newsPosts[2]!} variant="overlay" />);
    expect(screen.getByText("Gallery")).toBeInTheDocument();
    rerender(<PostCard post={newsPosts[0]!} variant="row" locale="tr-TR" labels={newsLabelsTr} />);
    expect(screen.queryByText("Transport")).toBeNull(); // rows drop the badge by default
    expect(screen.getByRole("article")).toHaveAttribute("data-variant", "row");
    rerender(<PostCard post={newsPosts[1]!} variant="list" locale="tr-TR" labels={newsLabelsTr} />);
    expect(screen.getByRole("article").querySelector(".vb-news-meta")).toHaveTextContent("0 yorum");
    rerender(<PostCard post={newsPosts[0]!} variant="text" meta={false} rank={2} />);
    expect(screen.queryByText(/Ayla/)).toBeNull();
    expect(screen.getByText("2")).toHaveAttribute("aria-hidden");
  });
});

describe("FeaturedPosts / PostBlock", () => {
  it("featured grid: four overlay cards, the lead eager; slider pages hide the rest", () => {
    const { container } = render(<FeaturedPosts posts={[...newsPosts, ...newsPosts]} slider label="Top stories" />);
    expect(screen.getByRole("region", { name: "Top stories" })).toBeInTheDocument();
    const pages = container.querySelectorAll('[aria-roledescription="slide"]');
    expect(pages).toHaveLength(3);
    expect(pages[1]).toHaveAttribute("hidden");
    expect(within(pages[0] as HTMLElement).getAllByRole("article")).toHaveLength(4);
    expect(container.querySelector("img")).toHaveAttribute("fetchpriority", "high");
  });

  it("module: titled section, card headings one level down, numbered pagination with Page x of y", async () => {
    const { container } = render(
      <main>
        <PostBlock title="Latest" href="/latest" layout="list" posts={newsPosts.slice(0, 3)} pagination={{ page: 1, total: 17, hrefTemplate: "/latest?page={page}" }} />
      </main>,
    );
    expect(screen.getByRole("region", { name: "Latest" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getByRole("link", { name: /View all/ })).toHaveAttribute("href", "/latest");
    expect(container.querySelector(".vb-news-pagination > p")).toHaveTextContent("Page 1 of 17");
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("href", "/latest?page=2");
    expect(await axe(container)).toHaveNoViolations();
  });

  it.each(["lead-list", "lead-grid", "big-2", "featured-list", "trio", "grid"] as const)("%s renders its posts", (layout) => {
    render(<PostBlock title="City" layout={layout} posts={newsPosts} />);
    expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(3);
  });

  it("empty module says so", () => {
    render(<PostBlock title="City" posts={[]} />);
    expect(screen.getByText("No stories here yet.")).toBeInTheDocument();
  });
});

describe("news JSON-LD", () => {
  it("NewsArticle and ItemList with absolute URLs", () => {
    const a = newsArticleJsonLd(newsPosts[0]!, { origin: "https://example.com", publisher: { name: "The Harbour Ledger" } });
    expect(a).toMatchObject({ "@type": "NewsArticle", url: "https://example.com/city/night-tram", articleSection: "Transport", commentCount: 48, publisher: { "@type": "NewsMediaOrganization" } });
    const l = newsItemListJsonLd(newsPosts.slice(0, 2), { origin: "https://example.com" });
    expect((l.itemListElement as { position: number; url: string }[])[1]).toEqual({ "@type": "ListItem", position: 2, url: "https://example.com/economy/cranes" });
  });
});
