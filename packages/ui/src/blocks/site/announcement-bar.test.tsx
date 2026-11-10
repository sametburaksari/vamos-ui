import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { AnnouncementBar } from "./announcement-bar";

describe("AnnouncementBar", () => {
  afterEach(() => {
    document.cookie.split("; ").forEach((c) => (document.cookie = `${c.split("=")[0]}=; max-age=0; path=/`));
  });

  it("is a labelled region with text and an underlined link", async () => {
    const { container } = render(<AnnouncementBar text="Closed 1–3 April for Eid — open again Thursday from noon." link={{ href: "/hours", label: "Holiday hours" }} />);
    const region = screen.getByRole("region", { name: "Announcement" });
    expect(region).toHaveAttribute("data-tone", "neutral");
    expect(region).toHaveClass("bg-fg", "text-scene");
    expect(screen.getByRole("link", { name: "Holiday hours" })).toHaveAttribute("href", "/hours");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("centered: shows the mono label; tones map to tokens", () => {
    render(<AnnouncementBar variant="centered" tone="warning" label="Release" text="v2.4 is out." />);
    expect(screen.getByText("Release")).toHaveClass("font-mono");
    expect(screen.getByRole("region")).toHaveClass("vb-announcement-warning");
  });

  it("respects the schedule and a server-read dismissal", () => {
    const { container, rerender } = render(<AnnouncementBar text="Winter menu from 1 December" from="2026-12-01T00:00:00+03:00" now="2026-11-10T12:00:00Z" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<AnnouncementBar text="Winter menu from 1 December" until="2026-12-01T00:00:00+03:00" now="2026-11-10T12:00:00Z" />);
    expect(screen.getByRole("region")).toBeInTheDocument();
    rerender(<AnnouncementBar text="Winter menu from 1 December" dismissed />);
    expect(container).toBeEmptyDOMElement();
  });

  it("dismiss hides the bar, writes the cookie and moves focus to #content", async () => {
    render(
      <>
        <AnnouncementBar text="v2.4 is out" dismissible storageKey="vb_ann_test" />
        <main id="content">Page</main>
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss announcement" }));
    expect(document.querySelector("[data-announcement]")).toHaveAttribute("hidden");
    expect(document.cookie).toContain("vb_ann_test=1");
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("hides an already-dismissed bar on mount (cached pages)", () => {
    document.cookie = "vb_ann_cached=1; path=/";
    render(<AnnouncementBar text="Cached" dismissible storageKey="vb_ann_cached" />);
    expect(document.querySelector("[data-announcement]")).toHaveAttribute("hidden");
  });
});
