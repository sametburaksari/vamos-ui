import * as React from "react";
import { screen } from "@testing-library/react";
import { SubscribeLinks } from "./subscribe-links";
import { tr } from "../locales/tr";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const FEED = "https://example.com/feed.xml";
const links = [
  { label: "Podcast app", href: "podcast://example.com/feed.xml" },
  { label: "Video channel", href: "https://video.example.com/c/sample", description: "Full episodes" },
  { label: "Episodes by email", href: "/subscribe" },
];

describe("SubscribeLinks", () => {
  it("lists the links in a named group; the first is primary, external ones open a new tab", async () => {
    const { container } = renderWithProviders(<SubscribeLinks title="Listen on" links={links} feedUrl={FEED} />);
    expect(screen.getByRole("group", { name: "Listen on" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    const video = screen.getByRole("link", { name: "Video channel (opens in a new tab)" });
    expect(video).toHaveAttribute("target", "_blank");
    expect(video).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Episodes by email" })).not.toHaveAttribute("target");
    expect(screen.getByText(FEED)).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("copies the feed address and announces it", async () => {
    const onCopyFeed = vi.fn();
    const { user } = renderWithProviders(<SubscribeLinks links={links} feedUrl={FEED} onCopyFeed={onCopyFeed} />);
    expect(screen.getByRole("group", { name: "Follow" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy RSS feed" }));
    expect(await navigator.clipboard.readText()).toBe(FEED);
    expect(onCopyFeed).toHaveBeenCalledWith(FEED);
    expect(screen.getByRole("status")).toHaveTextContent("Feed address copied");
  });

  it("list variant shows descriptions; no feed means no copy button", async () => {
    const { container } = renderWithProviders(<SubscribeLinks variant="list" links={links} />);
    expect(screen.getByText("Full episodes")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("uses the Turkish dictionary", () => {
    renderWithProviders(<SubscribeLinks links={links} feedUrl={FEED} />, { locale: "tr-TR", messages: tr });
    expect(screen.getByRole("button", { name: "RSS akışını kopyala" })).toBeInTheDocument();
  });
});
