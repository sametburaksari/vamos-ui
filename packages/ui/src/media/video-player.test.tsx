import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { BackgroundVideo, VideoEmbed, VideoPlayer, formatMediaTime } from "./video-player";
import { axe } from "vitest-axe";
import { renderWithProviders } from "../../test/utils";

// axe waits up to 10 s for media metadata; jsdom never loads media, so skip the preload.
async function expectNoA11yViolations() {
  const results = await axe(document.body, { preload: false, rules: { "color-contrast": { enabled: false }, region: { enabled: false } } } as never);
  expect(results).toHaveNoViolations();
}

beforeAll(() => {
  // jsdom has no media playback: emulate play / pause events.
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value(this: HTMLMediaElement) {
      Object.defineProperty(this, "paused", { configurable: true, value: false });
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    },
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value(this: HTMLMediaElement) {
      Object.defineProperty(this, "paused", { configurable: true, value: true });
      this.dispatchEvent(new Event("pause"));
    },
  });
});

const src = "https://cdn.example.com/onboarding-week-one.mp4";

describe("formatMediaTime", () => {
  it("formats m:ss and h:mm:ss", () => {
    expect(formatMediaTime(187)).toBe("3:07");
    expect(formatMediaTime(3725)).toBe("1:02:05");
    expect(formatMediaTime(Number.NaN)).toBe("0:00");
  });
});

describe("VideoPlayer", () => {
  it("renders a labelled player with a poster play button and passes axe", async () => {
    renderWithProviders(
      <VideoPlayer src={src} poster="https://cdn.example.com/onboarding.jpg" title="Onboarding: your first week" tracks={[{ src: "/captions.en.vtt", lang: "en", label: "English", default: true }]} />,
    );
    expect(screen.getByRole("group", { name: "Video player: Onboarding: your first week" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play video: Onboarding: your first week" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Seek" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Turn off captions" })).toHaveAttribute("aria-pressed", "true");
    await expectNoA11yViolations();
  });

  it("plays and pauses with the button and the K / Space keys; M mutes; C toggles captions", async () => {
    const { user, container } = renderWithProviders(<VideoPlayer src={src} title="Product tour" tracks={[{ src: "/c.vtt", lang: "en", label: "English" }]} />);
    await user.click(screen.getByRole("button", { name: "Play video: Product tour" }));
    const root = screen.getByRole("group", { name: /Product tour/ });
    expect(root).toHaveAttribute("data-state", "playing");
    const pause = screen.getByRole("button", { name: "Pause" });
    pause.focus();
    await user.keyboard("k");
    expect(root).toHaveAttribute("data-state", "paused");
    const video = container.querySelector("video")!;
    await user.keyboard("m");
    fireEvent.volumeChange(video);
    expect(video.muted).toBe(true);
    await user.keyboard("c");
    expect(screen.getByRole("button", { name: "Turn off captions" })).toBeInTheDocument();
  });

  it("seeks ±5 s with the arrow keys", async () => {
    const { user, container } = renderWithProviders(<VideoPlayer src={src} title="Tour" />);
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "duration", { configurable: true, value: 120 });
    video.currentTime = 30;
    screen.getByRole("button", { name: "Full screen" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(video.currentTime).toBe(35);
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(video.currentTime).toBe(25);
  });

  it("shows an error when HLS has no loader", () => {
    renderWithProviders(<VideoPlayer src="https://cdn.example.com/live/stream.m3u8" title="Live" />);
    expect(screen.getByRole("alert")).toHaveTextContent("HLS");
  });

  it("lazy-loads hls.js only for HLS sources", async () => {
    const loadSource = vi.fn();
    const attachMedia = vi.fn();
    class FakeHls {
      static isSupported() {
        return true;
      }
      loadSource = loadSource;
      attachMedia = attachMedia;
      destroy() {}
    }
    const hls = vi.fn(() => Promise.resolve({ default: FakeHls }));
    renderWithProviders(<VideoPlayer src="https://cdn.example.com/live/stream.m3u8" title="Live" hls={hls} />);
    await vi.waitFor(() => expect(loadSource).toHaveBeenCalledWith("https://cdn.example.com/live/stream.m3u8"));
    expect(hls).toHaveBeenCalledTimes(1);
    expect(attachMedia).toHaveBeenCalled();
  });
});

describe("VideoEmbed", () => {
  it("shows a facade and loads the no-cookie iframe on click", async () => {
    const { user } = renderWithProviders(<VideoEmbed provider="youtube" id="aqz-KE-bpKQ" title="Spring menu launch" />);
    expect(document.querySelector("iframe")).toBeNull();
    await expectNoA11yViolations();
    await user.click(screen.getByRole("button", { name: "Play video: Spring menu launch" }));
    const frame = document.querySelector("iframe")!;
    expect(frame).toHaveAttribute("title", "Spring menu launch");
    expect(frame.src).toContain("https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ");
  });
});

describe("BackgroundVideo", () => {
  it("is hidden from assistive tech but has a visible pause button", async () => {
    const { user } = renderWithProviders(
      <BackgroundVideo src={src} poster="https://cdn.example.com/hero.jpg">
        <h1>Weekend brunch</h1>
      </BackgroundVideo>,
    );
    expect(document.querySelector("video")).toHaveAttribute("aria-hidden", "true");
    const toggle = screen.getByRole("button", { name: "Pause background video" });
    Object.defineProperty(document.querySelector("video")!, "paused", { configurable: true, value: false });
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Play background video" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });
});
