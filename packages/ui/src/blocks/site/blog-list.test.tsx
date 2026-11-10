import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { BlogList, BlogListSkeleton, type PostSummary } from "./blog-list";
import { site2LabelsTr } from "./shared/labels-2";
import { blogListBlock } from "./registry-2";

const cover = (alt: string) => ({ src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200", alt, width: 1200, height: 800 });
const posts: PostSummary[] = [
  { href: "/journal/morning-boats", title: "How we plan a menu around the morning boats", excerpt: "Twelve years of buying fish at Kumkapı before sunrise.", cover: cover("Crates of bonito at the fish market"), category: { label: "Kitchen" }, publishedAt: "2026-10-28", readingMinutes: 6, author: { name: "Deniz Arslan" } },
  { href: "/journal/raki-list", title: "Reading our rakı list", category: { label: "Drinks" }, publishedAt: "2026-10-14T19:00:00+03:00", readingMinutes: 4 },
  { href: "/journal/private-dining", title: "Private dining for twelve", publishedAt: "2026-09-30", readingMinutes: 3 },
];

describe("BlogList", () => {
  it("editorial: articles with one covering title link and machine-readable dates", async () => {
    const { container } = render(<main><BlogList title="From the *journal*" posts={posts} allLink={{ href: "/journal", label: "All posts" }} /></main>);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    const first = screen.getAllByRole("article")[0]!;
    expect(within(first).getAllByRole("link")).toHaveLength(1);
    expect(within(first).getByRole("heading", { level: 3 })).toHaveTextContent("morning boats");
    expect(first.querySelector("time")).toHaveAttribute("datetime", "2026-10-28");
    expect(screen.getByText("Oct 28, 2026")).toBeInTheDocument();
    expect(screen.getByText("6 min read")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("list + pagination with URL hrefs and Turkish labels", async () => {
    const { container } = render(<main><BlogList variant="list" locale="tr-TR" labels={site2LabelsTr} title="Yazılar" posts={posts} pagination={{ page: 2, total: 3, hrefTemplate: "/blog?page={page}" }} /></main>);
    const nav = screen.getByRole("navigation", { name: "Sayfalama" });
    expect(within(nav).getByRole("link", { name: /Önceki sayfa/ })).toHaveAttribute("href", "/blog");
    expect(within(nav).getByRole("link", { name: /Sonraki sayfa/ })).toHaveAttribute("href", "/blog?page=3");
    expect(screen.getByText("Sayfa 2 / 3")).toBeInTheDocument();
    expect(screen.getByText("4 dk okuma")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("grid: categories filter with aria-current; compact shows ≤ 5 titles", async () => {
    const { container, rerender } = render(<main><BlogList variant="grid" title="Guides" posts={posts} categories={[{ label: "All", href: "/blog" }, { label: "Kitchen", href: "/blog/kitchen", active: true }]} /></main>);
    expect(screen.getByRole("link", { name: "Kitchen" })).toHaveAttribute("aria-current", "page");
    expect(await axe(container)).toHaveNoViolations();
    rerender(<main><BlogList variant="compact" title="Related" posts={[...posts, ...posts]} /></main>);
    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(container.querySelector("img")).toBeNull();
  });

  it("empty state with an action, and a skeleton", () => {
    const { container } = render(<BlogList title="News" posts={[]} empty={{ action: <a href="/newsletter">Get new posts by email</a> }} />);
    expect(screen.getByText("No posts here yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get new posts by email" })).toBeInTheDocument();
    render(<BlogListSkeleton count={2} />);
    expect(document.querySelector("[data-skeleton]")).toHaveAttribute("aria-hidden");
    expect(container).toBeTruthy();
    expect(blogListBlock.schema.safeParse(blogListBlock.sample()).success).toBe(true);
  });
});
