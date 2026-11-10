import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { MediaText, videoEmbedUrl } from "./media-text";

const media = { src: "/kitchen.jpg", alt: "Hüseyin Usta cleaning sea bass", width: 1600, height: 2000 };

describe("MediaText", () => {
  it("side: titled region, text, accent-dash bullets and one action", async () => {
    const { container } = render(
      <main>
        <MediaText eyebrow="The kitchen" title="Fish from the *morning* boats" body="What he buys decides the menu." bullets={["Sea bass in season", "Meze made the same morning"]} cta={{ link: { href: "/menu", label: "Tonight’s menu" }, style: "link" }} media={media} mediaSide="end" />
      </main>,
    );
    const region = screen.getByRole("region", { name: "Fish from the morning boats" });
    expect(region).toHaveAttribute("data-side", "end");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Tonight’s menu" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("img")).toHaveAttribute("alt", media.alt);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("video facade loads the player only after a click and focuses it", async () => {
    const user = userEvent.setup();
    const { container } = render(<main><MediaText variant="overlap" title="A morning in our kitchen" media={media} video={{ provider: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }} /></main>);
    expect(container.querySelector("iframe")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: "Play video: A morning in our kitchen" }));
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0");
    expect(frame).toHaveAttribute("title", "A morning in our kitchen");
    expect(frame).toHaveFocus();
  });

  it("embed URLs", () => {
    expect(videoEmbedUrl({ provider: "vimeo", url: "https://vimeo.com/76979871" })).toBe("https://player.vimeo.com/video/76979871?autoplay=1&dnt=1");
    expect(videoEmbedUrl({ provider: "youtube", url: "https://youtu.be/abc123XYZ" })).toContain("/embed/abc123XYZ");
    expect(videoEmbedUrl({ provider: "mp4", url: "/tour.mp4" })).toBe("/tour.mp4");
  });

  it("bleed puts the image against the section edge", () => {
    const { container } = render(<MediaText variant="bleed" title="The garden" media={media} />);
    expect(container.querySelector(".vb-bleed-start")).not.toBeNull();
  });
});
