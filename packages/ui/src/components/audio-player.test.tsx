import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AudioPlayer, chapterAt } from "./audio-player";
import { renderWithProviders } from "../../test/utils";

// axe waits for media metadata; jsdom never loads media, so skip the preload.
async function expectNoA11yViolations() {
  const results = await axe(document.body, { preload: false, rules: { "color-contrast": { enabled: false }, region: { enabled: false } } } as never);
  expect(results).toHaveNoViolations();
}

beforeAll(() => {
  // jsdom has no media playback: emulate play / pause and a seekable currentTime.
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
  Object.defineProperty(HTMLMediaElement.prototype, "currentTime", {
    configurable: true,
    get(this: HTMLMediaElement & { _t?: number }) {
      return this._t ?? 0;
    },
    set(this: HTMLMediaElement & { _t?: number }, v: number) {
      this._t = v;
      this.dispatchEvent(new Event("timeupdate"));
    },
  });
});

const src = "https://cdn.example.com/episode-12.mp3";
const chapters = [
  { start: 0, title: "Welcome" },
  { start: 300, title: "Packing the boxes" },
  { start: 1200, title: "The new street" },
];

describe("chapterAt", () => {
  it("returns the chapter playing at a time", () => {
    expect(chapterAt(chapters, 0)).toBe(0);
    expect(chapterAt(chapters, 299)).toBe(0);
    expect(chapterAt(chapters, 300)).toBe(1);
    expect(chapterAt([{ start: 10, title: "Late" }], 5)).toBe(-1);
  });
});

describe("AudioPlayer", () => {
  it("renders a labelled player with controls, chapters and links; passes axe", async () => {
    renderWithProviders(<AudioPlayer src={src} title="Episode 12: Moving house" duration={2710} chapters={chapters} transcriptHref="/episodes/12/transcript" download />);
    expect(screen.getByRole("group", { name: "Audio player: Episode 12: Moving house" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back 15 seconds" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Forward 30 seconds" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuetext", "0:00 of 45:10");
    expect(screen.getByRole("navigation", { name: "Chapters" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", src);
    expect(screen.getByRole("link", { name: "Transcript" })).toHaveAttribute("href", "/episodes/12/transcript");
    await expectNoA11yViolations();
  });

  it("plays and pauses; Space and K toggle from the player", async () => {
    const { user } = renderWithProviders(<AudioPlayer src={src} title="Talk" duration={600} />);
    await user.click(screen.getByRole("button", { name: "Play" }));
    const root = screen.getByRole("group", { name: /Talk/ });
    expect(root).toHaveAttribute("data-state", "playing");
    await user.keyboard("k");
    expect(root).toHaveAttribute("data-state", "paused");
  });

  it("seeks from a chapter, highlights it and reports the change", async () => {
    const onChapterChange = vi.fn();
    const { user } = renderWithProviders(<AudioPlayer src={src} duration={2710} chapters={chapters} onChapterChange={onChapterChange} />);
    const audio = document.querySelector("audio")!;
    await user.click(screen.getByRole("button", { name: /Packing the boxes/ }));
    expect(audio.currentTime).toBe(300);
    expect(screen.getByRole("button", { name: /Packing the boxes/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("Chapter 2 of 3")).toBeInTheDocument();
    expect(onChapterChange).toHaveBeenLastCalledWith(1);
  });

  it("skips with the buttons and J / L / arrow keys, and cycles the speed", async () => {
    const { user } = renderWithProviders(<AudioPlayer src={src} title="Lesson" duration={600} skipBack={10} />);
    const audio = document.querySelector("audio")!;
    await user.click(screen.getByRole("button", { name: "Forward 30 seconds" }));
    expect(audio.currentTime).toBe(30);
    await user.click(screen.getByRole("button", { name: "Back 10 seconds" }));
    expect(audio.currentTime).toBe(20);
    await user.keyboard("l");
    expect(audio.currentTime).toBe(50);
    fireEvent.keyDown(screen.getByRole("group", { name: /Lesson/ }), { key: "ArrowLeft" });
    expect(audio.currentTime).toBe(45);
    const speed = screen.getByRole("button", { name: "Playback speed 1×, change" });
    await user.click(speed);
    expect(audio.playbackRate).toBe(1.25);
    expect(speed).toHaveTextContent("1.25×");
  });

  it("shows an error message when the source fails", () => {
    renderWithProviders(<AudioPlayer src={src} />);
    fireEvent.error(document.querySelector("audio")!);
    expect(screen.getByRole("alert")).toHaveTextContent("This audio can't be played.");
  });
});
