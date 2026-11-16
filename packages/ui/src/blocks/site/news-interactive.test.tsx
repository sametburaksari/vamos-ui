import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { NewsTicker } from "./news-ticker";
import { PostTabs } from "./post-tabs";
import { AdSlot } from "./ad-slot";
import { AuthDialog } from "./auth-dialog";
import { NewsHeader, NewsTopBar } from "./news-masthead";
import { NewsPagination, newsPageHref } from "./news-pagination";
import { CategoryCounts, FollowCounts, NewsColumns, PopularPosts, RecentComments } from "./news-widgets";
import { writeConsent } from "./shared/consent";
import { newsLabelsTr } from "./shared/labels-news";
import type { NewsPost } from "./shared/news";

const posts: NewsPost[] = [
  { href: "/a", title: "The night tram returns", category: { label: "Transport" }, publishedAt: "2026-11-15" },
  { href: "/b", title: "Port orders four cranes", category: { label: "The port" }, publishedAt: "2026-11-14" },
  { href: "/c", title: "Seagrass is back", publishedAt: "2026-11-13" },
];
const headlines = posts.map((p) => ({ title: p.title, href: p.href }));

describe("NewsTicker", () => {
  afterEach(() => vi.useRealTimers());

  it("rotates on a timer, stops with the pause button and steps with the arrows", async () => {
    vi.useFakeTimers();
    const { container } = render(<NewsTicker items={headlines} interval={3000} />);
    const region = screen.getByRole("region", { name: "Trending now" });
    expect(within(region).getByRole("link")).toHaveTextContent("The night tram returns");
    act(() => vi.advanceTimersByTime(3000));
    expect(within(region).getByRole("link")).toHaveTextContent("Port orders four cranes");
    // While running nothing is announced
    expect(container.querySelector("[aria-live]")).toHaveAttribute("aria-live", "off");
    act(() => screen.getByRole("button", { name: "Pause headlines" }).click());
    expect(container.querySelector("[aria-live]")).toHaveAttribute("aria-live", "polite");
    act(() => vi.advanceTimersByTime(9000));
    expect(within(region).getByRole("link")).toHaveTextContent("Port orders four cranes");
    act(() => screen.getByRole("button", { name: "Next headline" }).click());
    expect(within(region).getByRole("link")).toHaveTextContent("Seagrass is back");
    act(() => screen.getByRole("button", { name: "Previous headline" }).click());
    act(() => screen.getByRole("button", { name: "Previous headline" }).click());
    expect(within(region).getByRole("link")).toHaveTextContent("The night tram returns");
    vi.useRealTimers();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("never autoplays under reduced motion; marquee mode lists every headline once for AT", () => {
    const mm = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: q.includes("reduce") })) as typeof window.matchMedia;
    vi.useFakeTimers();
    const { unmount } = render(<NewsTicker items={headlines} labels={newsLabelsTr} locale="tr-TR" />);
    expect(screen.queryByRole("button", { name: "Başlıkları durdur" })).toBeNull();
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByRole("region", { name: "Gündemde" })).toHaveTextContent("The night tram returns");
    unmount();
    window.matchMedia = mm;
    render(<NewsTicker items={headlines} mode="marquee" />);
    expect(screen.getByRole("list", { name: "Trending now" }).querySelectorAll("li")).toHaveLength(3);
  });
});

describe("PostTabs", () => {
  it("switches panels from props, folds extra tabs into More, and loads lazy panels once", async () => {
    const user = userEvent.setup();
    const load = vi.fn(async (id: string) => <p>Loaded {id}</p>);
    const { container } = render(
      <main>
        <PostTabs
          title="Don’t miss"
          maxVisible={2}
          load={load}
          tabs={[
            { id: "all", label: "All", content: <p>All stories</p> },
            { id: "city", label: "City", content: <p>City stories</p> },
            { id: "science", label: "Science" },
          ]}
        />
      </main>,
    );
    expect(screen.getByRole("region", { name: "Don’t miss" })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("All stories");
    await user.click(screen.getByRole("tab", { name: "City" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("City stories");
    expect(screen.queryByRole("tab", { name: "Science" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "More topics" }));
    await user.click(await screen.findByRole("menuitem", { name: "Science" }));
    // The selected tab is swapped into the row
    expect(screen.getByRole("tab", { name: "Science" })).toHaveAttribute("aria-selected", "true");
    expect(await screen.findByText("Loaded science")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("AdSlot", () => {
  afterEach(() => {
    document.cookie = "vb_consent=; Max-Age=0; path=/";
  });

  it("reserves the box, labels the aside and renders the ad only after marketing consent", async () => {
    const onReady = vi.fn();
    const { container } = render(
      <AdSlot size="leaderboard" mobileSize="mobile-banner" slotId="div-ad-1" onReady={onReady}>
        <span>Ad creative</span>
      </AdSlot>,
    );
    const aside = screen.getByRole("complementary", { name: "Advertisement" });
    const box = aside.querySelector(".vb-ad-box") as HTMLElement;
    expect(box.style.getPropertyValue("--ad-w")).toBe("728px");
    expect(box.style.getPropertyValue("--ad-mh-n")).toBe("50");
    expect(screen.queryByText("Ad creative")).toBeNull();
    expect(screen.getByText("Ads appear once you allow marketing cookies.")).toBeInTheDocument();
    expect(onReady).not.toHaveBeenCalled();
    act(() => {
      writeConsent({ marketing: true });
    });
    expect(await screen.findByText("Ad creative")).toBeInTheDocument();
    expect(onReady).toHaveBeenCalledWith(container.querySelector("#div-ad-1"));
  });

  it("house ads skip the gate; Turkish label", () => {
    render(
      <AdSlot consent={false} labels={newsLabelsTr}>
        <span>House ad</span>
      </AdSlot>,
    );
    expect(screen.getByRole("complementary", { name: "Reklam" })).toHaveTextContent("House ad");
  });
});

describe("AuthDialog", () => {
  it("validates, signs in through the callback and switches to password recovery", async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn(async () => "Wrong email or password");
    const onRecover = vi.fn(async () => undefined);
    render(<AuthDialog trigger={<button type="button">Sign in / Join</button>} onSignIn={onSignIn} onRecover={onRecover} joinHref="/join" />);
    await user.click(screen.getByRole("button", { name: "Sign in / Join" }));
    const dialog = await screen.findByRole("dialog", { name: /Welcome back/ });
    await user.click(within(dialog).getByRole("button", { name: "Sign in" }));
    expect(within(dialog).getAllByText("Required")).toHaveLength(2);
    expect(onSignIn).not.toHaveBeenCalled();
    await user.type(within(dialog).getByLabelText(/Email/), "reader@example.com");
    await user.type(within(dialog).getByLabelText(/Password/), "hunter22");
    await user.click(within(dialog).getByRole("button", { name: "Sign in" }));
    expect(onSignIn).toHaveBeenCalledWith({ email: "reader@example.com", password: "hunter22", remember: true });
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Wrong email or password");
    expect(within(dialog).getByRole("link", { name: "Create a free account" })).toHaveAttribute("href", "/join");

    await user.click(within(dialog).getByRole("button", { name: "Forgot your password?" }));
    const recover = await screen.findByRole("dialog", { name: /Reset your password/ });
    await waitFor(() => expect(within(recover).getByLabelText(/Email/)).toHaveFocus());
    await user.type(within(recover).getByLabelText(/Email/), "reader@example.com");
    await user.click(within(recover).getByRole("button", { name: "Send reset link" }));
    expect(onRecover).toHaveBeenCalledWith("reader@example.com");
    expect(await within(recover).findByRole("status")).toHaveTextContent("reader@example.com");
  });

  it("sizes the title on the header's own title element (an inner size lost to the header style)", async () => {
    render(<AuthDialog defaultOpen brand="The Harbour Ledger" joinHref="/join" />);
    const dialog = await screen.findByRole("dialog", { name: /Welcome back/ });
    const title = dialog.querySelector('[data-slot="layer-title"]')!;
    expect(title.closest('[data-slot="layer-header"]')!.className).toContain("[&_[data-slot=layer-title]]:text-[1.5rem]");
    expect(title.querySelector('[class*="text-[1.5rem]"]')).toBeNull();
  });
});

describe("NewsTopBar / NewsHeader", () => {
  it("top bar: fixed date, weather adapter, auth trigger and social names", async () => {
    render(<NewsTopBar date="2026-11-15" weather={{ temp: 13, place: "Harbourside", condition: "cloudy" }} loadWeather={async () => ({ temp: 14, place: "Harbourside", conditionLabel: "partly cloudy" })} social={[{ network: "x", href: "https://x.com/example" }]} auth={{ joinHref: "/join" }} />);
    expect(screen.getByText("Sunday, November 15, 2026")).toHaveAttribute("datetime", "2026-11-15");
    expect(await screen.findByText("14° partly cloudy in Harbourside")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in / Join" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /X/ })).toHaveAttribute("href", "https://x.com/example");
  });

  it("header: banner landmark, main nav with a mega panel that swaps on focus, search form", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NewsHeader
        brand="The Harbour Ledger"
        nav={[
          { label: "City", href: "/city", mega: [{ id: "all", label: "All", href: "/city", posts }, { id: "housing", label: "Housing", href: "/city/housing", posts: [posts[2]!] }] },
          { label: "Opinion", href: "/opinion" },
        ]}
        more={[{ label: "Puzzles", href: "/puzzles" }]}
        currentPath="/opinion"
      />,
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Opinion" })).toHaveAttribute("aria-current", "page");
    await user.click(within(nav).getByRole("button", { name: "City" }));
    expect(await screen.findByText("Latest in City")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    act(() => screen.getByRole("link", { name: "Housing" }).focus());
    expect(await screen.findByText("Latest in Housing")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("search")).toHaveAttribute("action", "/search");
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("search")).toBeNull();
    expect(container.querySelector(".vb-news-navbar")).toHaveClass("sticky");
  });

  it("header: a section with a mega menu is marked and underlined as the current page", () => {
    render(<NewsHeader brand="The Harbour Ledger" nav={[{ label: "City", href: "/city", mega: [{ id: "all", label: "All", href: "/city", posts }] }, { label: "Opinion", href: "/opinion" }]} currentPath="/city/housing" />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const city = within(nav).getByRole("button", { name: "City" });
    expect(city).toHaveAttribute("aria-current", "page");
    expect(city.className).toContain("aria-[current=page]:shadow-");
    expect(within(nav).getByRole("link", { name: "Opinion" })).not.toHaveAttribute("aria-current");
  });
});

describe("pagination and sidebar widgets", () => {
  it("newsPageHref drops page 1", () => {
    expect(newsPageHref("/latest?page={page}", 1)).toBe("/latest");
    expect(newsPageHref("/latest?page={page}", 4)).toBe("/latest?page=4");
    expect(newsPageHref("/latest/{page}", 1)).toBe("/latest/1");
  });

  it("NewsPagination hides for one page", () => {
    const { container } = render(<NewsPagination page={1} total={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("columns + widgets: named aside, compact follower counts, numbered most-read, comments and counts", async () => {
    const { container } = render(
      <main>
        <NewsColumns
          asideLabel="More from the Ledger"
          aside={
            <>
              <FollowCounts title="Stay connected" accounts={[{ network: "youtube", href: "https://youtube.com/@example", count: 22900, unit: "subscribers", action: "Subscribe" }, { network: "x", href: "https://x.com/example", count: 3913 }]} />
              <PopularPosts title="Most read" posts={posts} />
              <RecentComments title="Recent comments" comments={[{ author: "Leyla K.", postTitle: "The night tram returns", postHref: "/a", href: "/a#c-3" }]} />
            </>
          }
          asideSticky={<CategoryCounts title="Sections" categories={[{ label: "City", href: "/city", count: 271 }]} />}
        >
          <p>Main</p>
        </NewsColumns>
      </main>,
    );
    expect(screen.getByRole("complementary", { name: "More from the Ledger" })).toBeInTheDocument();
    expect(screen.getByText("22.9K subscribers")).toBeInTheDocument();
    expect(screen.getByText("3.9K followers")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Most read" }).querySelectorAll("ol > li")).toHaveLength(3);
    expect(container.querySelector('a[href="/a#c-3"]')).toHaveTextContent("The night tram returns");
    expect(screen.getByText("271 stories")).toHaveClass("sr-only");
    expect(container.querySelector("[data-sticky]")).toHaveTextContent("City");
    expect(await axe(container)).toHaveNoViolations();
  });
});
