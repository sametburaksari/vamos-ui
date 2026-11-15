import * as React from "react";
import { screen, within } from "@testing-library/react";
import { VideoPlaylist, type VideoPlaylistItem } from "./video-playlist";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const items: VideoPlaylistItem[] = [
  { id: "trailer", title: "Launch trailer", description: "1 min", provider: "youtube", videoId: "aqz-KE-bpKQ", duration: 74 },
  { id: "tour", title: "Studio tour", provider: "vimeo", videoId: "76979871", poster: "https://example.com/poster.jpg" },
  { id: "talk", title: "Behind the scenes", src: "https://example.com/talk.mp4", poster: "https://example.com/talk.jpg", duration: "12:30" },
];

const row = (name: RegExp) => within(screen.getByRole("list")).getByRole("button", { name });

describe("VideoPlaylist", () => {
  it("shows the first video behind a facade and a named list with the current row", async () => {
    const { container } = renderWithProviders(<VideoPlaylist items={items} />);
    expect(container.querySelector('[data-slot="video-embed"]')).toHaveAttribute("data-state", "facade");
    expect(container.querySelector("iframe")).toBeNull();
    const list = screen.getByRole("list", { name: "Videos" });
    const first = within(list).getByRole("button", { name: /Launch trailer/ });
    expect(first).toHaveAttribute("aria-current", "true");
    expect(first).toHaveTextContent("Length 1:14");
    expect(screen.getByRole("heading", { level: 3, name: "Launch trailer" })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("swaps the video, announces it and keeps the player behind its facade", async () => {
    const onValueChange = vi.fn();
    const { user, container } = renderWithProviders(<VideoPlaylist items={items} onValueChange={onValueChange} layout="side" />);
    await user.click(row(/Studio tour/));
    expect(onValueChange).toHaveBeenCalledWith("tour");
    expect(container.querySelector('[data-slot="video-embed"]')).toHaveAttribute("data-provider", "vimeo");
    expect(screen.getByRole("status")).toHaveTextContent("Now showing: Studio tour");
    expect(row(/Studio tour/)).toHaveAttribute("aria-current", "true");
    expect(row(/Launch trailer/)).not.toHaveAttribute("aria-current");

    await user.click(row(/Behind the scenes/));
    expect(container.querySelector('[data-slot="video-embed"]')).toBeNull();
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("can be controlled and localized", () => {
    renderWithProviders(<VideoPlaylist items={items} value="talk" numbered={false} labels={{ list: "Videolar", duration: "Süre {time}" }} />, { locale: "tr-TR" });
    expect(screen.getByRole("list", { name: "Videolar" })).toBeInTheDocument();
    expect(row(/Behind the scenes/)).toHaveAttribute("aria-current", "true");
    expect(row(/Behind the scenes/)).toHaveTextContent("Süre 12:30");
  });
});
