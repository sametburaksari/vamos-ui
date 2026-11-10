import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ArticleLayout, shareUrl, type ArticlePost } from "./article-layout";
import { articleBlock } from "./registry-2";

const h2 = (text: string) => ({ type: "heading" as const, level: 2 as const, content: [{ text }] });
const p = (text: string) => ({ type: "paragraph" as const, content: [{ text }] });
const post: ArticlePost = {
  title: "How we plan a *menu* around the morning boats",
  dek: "Twelve years of buying fish at Kumkapı before sunrise.",
  publishedAt: "2026-10-28",
  updatedAt: "2026-11-03",
  category: { href: "/journal/kitchen", label: "Kitchen" },
  breadcrumb: [{ href: "/", label: "Home" }, { href: "/journal", label: "Journal" }],
  author: { name: "Deniz Arslan", role: "Chef-owner", bio: "Cooks at Meyhane Cevizli since 2014." },
  tags: [{ href: "/tags/fish", label: "Fish" }],
  body: { type: "doc", content: [p("We decide the evening’s menu at six in the morning."), h2("Six o’clock at Kumkapı"), p("The boats come in."), h2("What makes the cut"), p("Bonito in autumn."), h2("Çiroz ve lakerda"), p("Cured fish keeps the winter menu honest.")] },
};

describe("ArticleLayout", () => {
  it("classic: article landmark, h1, breadcrumb, dates, TOC from h2s with locale-aware anchors", async () => {
    const { container } = render(<main><ArticleLayout post={post} url="https://meyhane.example/journal/morning-boats" locale="tr-TR" /></main>);
    expect(screen.getByRole("heading", { level: 1, name: "How we plan a menu around the morning boats" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Journal");
    const tocs = screen.getAllByRole("navigation", { name: "On this page" });
    const links = within(tocs[0]!).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["#six-oclock-at-kumkapi", "#what-makes-the-cut", "#ciroz-ve-lakerda"]);
    expect(container.querySelector("#ciroz-ve-lakerda")?.tagName).toBe("H2");
    expect(container.querySelector('time[datetime="2026-11-03"]')).toBeInTheDocument();
    expect(screen.getByText("Written by")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("share: plain URLs and a copy button that announces", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<ArticleLayout post={post} url="https://meyhane.example/j/1" share={["copy", "whatsapp", "x", "email"]} />);
    expect(screen.getByRole("link", { name: /Share on WhatsApp/ })).toHaveAttribute("href", expect.stringContaining("https://wa.me/?text="));
    expect(screen.getByRole("link", { name: "Share by email" })).toHaveAttribute("href", expect.stringMatching(/^mailto:\?subject=/));
    await user.click(screen.getByRole("button", { name: /Copy link/ }));
    expect(writeText).toHaveBeenCalledWith("https://meyhane.example/j/1");
    expect(screen.getByRole("status")).toHaveTextContent("Link copied");
    expect(shareUrl("linkedin", "https://a.b/c", "T")).toBe("https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fa.b%2Fc");
  });

  it("minimal hides the TOC under 3 headings; draft shows a preview strip; related posts render", async () => {
    const short = { ...post, body: { type: "doc" as const, content: [p("Closed 1–3 April for the holiday."), h2("Bookings")] } };
    const { container } = render(<main><ArticleLayout variant="minimal" draft post={short} related={[{ href: "/j/2", title: "Reading our rakı list", publishedAt: "2026-10-14" }]} /></main>);
    expect(screen.queryByRole("navigation", { name: "On this page" })).toBeNull();
    expect(screen.getByRole("note")).toHaveTextContent("Preview");
    expect(screen.getByRole("heading", { name: "Related reading" })).toBeInTheDocument();
    expect(screen.getByText("1 min read")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    expect(articleBlock.schema.safeParse(articleBlock.sample()).success).toBe(true);
  });
});
