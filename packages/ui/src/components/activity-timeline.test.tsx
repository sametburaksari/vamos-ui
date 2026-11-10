import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Inbox, MessageSquare } from "lucide-react";
import { LocaleProvider } from "../lib/locale";
import { tr } from "../locales/tr";
import { ActivityTimeline, Timeline, TimelineContent, TimelineIndicator, TimelineItem, TimelineTime, TimelineTitle } from "./activity-timeline";

const NOW = "2026-11-10T12:00:00Z";

const items = [
  { id: "1", at: "2026-11-10T11:56:00Z", icon: Inbox, title: <>New submission on <b>Contact form</b></> },
  { id: "2", at: "2026-11-10T11:22:00Z", avatar: { name: "Ahmet Kaya" }, actor: "Ahmet Kaya", title: "commented on “QR menus guide”", body: "Can we add a section on allergen labels?" },
  { id: "3", at: "2026-11-09T16:40:00Z", icon: MessageSquare, tone: "accent" as const, title: "12 images uploaded to Media", href: "/media" },
  { id: "4", at: "2026-11-06T08:00:00Z", title: "Meltem scheduled a post" },
];

describe("ActivityTimeline", () => {
  it("renders an ordered feed newest first with relative times", async () => {
    const { container } = render(<ActivityTimeline items={items} now={NOW} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("New submission on Contact form");
    expect(screen.getByText("4 minutes ago").tagName).toBe("TIME");
    expect(screen.getByText("4 minutes ago")).toHaveAttribute("datetime", "2026-11-10T11:56:00Z");
    expect(screen.getByText("4 minutes ago")).toHaveAttribute("title");
    expect(screen.getByText("19 hours ago")).toBeInTheDocument();
    expect(screen.getByText("4 days ago")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "12 images uploaded to Media" })).toHaveAttribute("href", "/media");
    expect(screen.getByText("Can we add a section on allergen labels?")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("groups by day with Today / Yesterday / weekday labels", async () => {
    const { container } = render(<ActivityTimeline items={items} now={NOW} groupBy="day" />);
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
    expect(screen.getByText("Friday, Nov 6")).toBeInTheDocument();
    // inside groups, times are the time of day
    expect(screen.getByText("11:56 AM")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("speaks Turkish", () => {
    render(
      <LocaleProvider locale="tr-TR" messages={{ ...tr, timeline: { today: "Bugün", yesterday: "Dün" } }} timeZone="Europe/Istanbul">
        <ActivityTimeline items={items.slice(0, 1)} now={NOW} />
        <ActivityTimeline items={items} now={NOW} groupBy="day" timeZone="Europe/Istanbul" />
      </LocaleProvider>,
    );
    expect(screen.getByText("4 dakika önce")).toBeInTheDocument();
    expect(screen.getByText("Dün")).toBeInTheDocument();
  });

  it("steps: aria-current and status text", async () => {
    const { container } = render(
      <ActivityTimeline
        variant="steps"
        now={NOW}
        items={[
          { id: "a", at: "2026-11-03T09:00:00Z", title: "Quote sent", status: "done" },
          { id: "b", at: "2026-11-07T09:00:00Z", title: "Approved by client", status: "current" },
          { id: "c", at: "2026-11-12T09:00:00Z", title: "Invoice issued", status: "upcoming" },
        ]}
      />,
    );
    expect(screen.getByText("Approved by client").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Completed")).toHaveClass("sr-only");
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Quote sent");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("empty, loading, new items, load more and live region", async () => {
    const user = userEvent.setup();
    const onShowNew = vi.fn();
    let resolve!: () => void;
    const onLoadMore = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    const { rerender } = render(<ActivityTimeline items={[]} />);
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    rerender(<ActivityTimeline items={[]} loading />);
    expect(document.querySelector('[data-slot="timeline-skeleton"]')).toHaveAttribute("aria-busy", "true");
    rerender(<ActivityTimeline items={items} now={NOW} newCount={3} onShowNew={onShowNew} hasMore onLoadMore={onLoadMore} announcement="3 new updates" />);
    await user.click(screen.getByRole("button", { name: "3 new updates" }));
    expect(onShowNew).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("3 new updates");
    await user.click(screen.getByRole("button", { name: "Load older activity" }));
    expect(screen.getByRole("button", { name: "Loading…" })).toHaveAttribute("aria-busy", "true");
    resolve();
    expect(await screen.findByRole("button", { name: "Load older activity" })).toBeEnabled();
  });

  it("composes parts", () => {
    render(
      <Timeline aria-label="Deal history">
        <TimelineItem>
          <TimelineIndicator icon={Inbox} tone="success" />
          <TimelineContent>
            <TimelineTitle>Deal won</TimelineTitle>
            <TimelineTime value="2026-11-10T10:00:00Z" now={NOW} />
          </TimelineContent>
        </TimelineItem>
      </Timeline>,
    );
    expect(screen.getByRole("list", { name: "Deal history" })).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });
});
