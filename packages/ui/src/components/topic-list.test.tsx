import * as React from "react";
import { screen, within } from "@testing-library/react";
import { TopicList, TopicRow, type TopicListItem } from "./topic-list";
import { tr } from "../locales/tr";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const NOW = Date.parse("2026-11-15T12:00:00Z");
const topics: TopicListItem[] = [
  { id: "1", title: "House rules and how to ask a good question", href: "/t/1", pinned: true, locked: true, replies: 0, views: 5400, category: { label: "Meta", href: "/c/meta" } },
  { id: "2", title: "Best way to back up a home server?", href: "/t/2", solved: true, unread: true, tags: ["backup", "nas"], replies: 14, views: 1280, lastPost: { name: "Mira Kaya", at: NOW - 3 * 3600_000 } },
  { id: "3", title: "Quiet fans for a small case", href: "/t/3", replies: 0 },
];

describe("TopicList", () => {
  it("renders a named list of topics with spoken counts and states", async () => {
    const { container } = renderWithProviders(<TopicList aria-label="Latest topics" topics={topics} now={NOW} />);
    const list = screen.getByRole("list", { name: "Latest topics" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("heading", { level: 3, name: /^Pinned: Locked: House rules/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Best way to back up a home server? Solved New" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Best way to back up a home server?" })).toHaveAttribute("href", "/t/2");
    expect(screen.getByRole("link", { name: "Meta" })).toHaveAttribute("href", "/c/meta");
    expect(screen.getAllByText("14 replies").length).toBeGreaterThan(0);
    expect(screen.getByText("1,280 views")).toBeInTheDocument();
    expect(screen.getByText("Last post by Mira Kaya, 3 hr. ago")).toBeInTheDocument();
    expect(container.querySelector("time")).toHaveAttribute("dateTime", new Date(NOW - 3 * 3600_000).toISOString());
    expect(screen.getAllByText("No replies yet")).toHaveLength(2);
    await expectNoA11yViolations(container);
  });

  it("shows an empty state", () => {
    renderWithProviders(<TopicList topics={[]} empty={<p>Start the first topic.</p>} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText("Start the first topic.")).toBeInTheDocument();
  });

  it("TopicRow links tags when given tagHref, and speaks Turkish", () => {
    renderWithProviders(
      <ul>
        <li>
          <TopicRow title="Yedekleme önerisi" href="/t/9" tags={["yedek"]} tagHref={(t) => `/tag/${t}`} replies={2} solved now={NOW} />
        </li>
      </ul>,
      { locale: "tr-TR", messages: tr },
    );
    expect(screen.getByRole("link", { name: "#yedek" })).toHaveAttribute("href", "/tag/yedek");
    expect(screen.getByRole("heading", { name: "Yedekleme önerisi Çözüldü" })).toBeInTheDocument();
    expect(screen.getAllByText("2 yanıt").length).toBeGreaterThan(0);
  });
});
