import * as React from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import { TypingDemo, typingFinalText, typingFrames, type TypingStep } from "./typing-demo";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const script: TypingStep[] = ["Hi team, maybe we could", { type: "pause", duration: 300 }, { type: "replace", text: "Ship it Friday." }];

afterEach(() => vi.useRealTimers());

/** One act per timer step: each keystroke schedules the next after it renders. */
const tick = (ms: number, step = 10) => {
  for (let t = 0; t < ms; t += step) act(() => vi.advanceTimersByTime(step));
};

describe("typingFrames", () => {
  it("expands type / delete / replace / pause / set into keystrokes", () => {
    expect(typingFinalText(script)).toBe("Ship it Friday.");
    expect(typingFinalText(["abc", { type: "delete", count: 1 }, "d"])).toBe("abd");
    expect(typingFinalText(["abc", { type: "set", text: "xyz" }, { type: "delete" }])).toBe("");
    const frames = typingFrames(["ab"], 10);
    expect(frames.map((f) => f.text)).toEqual(["", "a", "ab"]);
    expect(frames[2]!.delay).toBe(10);
  });
});

describe("TypingDemo", () => {
  it("screen readers get the final text only; the animated copy is hidden", async () => {
    const { container } = renderWithProviders(<TypingDemo steps={script} autoPlay={false} />);
    const sr = container.querySelector(".sr-only")!;
    expect(sr).toHaveTextContent("Ship it Friday.");
    for (const span of container.querySelectorAll("p > span:not(.sr-only)")) expect(span).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Replay" })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("types the script out, pauses, resumes and replays", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { container } = renderWithProviders(<TypingDemo steps={["Hello"]} autoPlay startDelay={100} speed={10} onComplete={onComplete} />);
    const root = container.querySelector("[data-slot='typing-demo']")!;
    const visible = () => container.querySelectorAll("p > span")[1]!.textContent;
    expect(root).toHaveAttribute("data-state", "idle");
    tick(100);
    expect(root).toHaveAttribute("data-state", "playing");
    tick(20);
    expect(visible()).toBe("He");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    tick(200);
    expect(visible()).toBe("He");
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    tick(200);
    expect(visible()).toBe("Hello");
    expect(root).toHaveAttribute("data-state", "done");
    expect(onComplete).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Replay" }));
    expect(visible()).toBe("");
  });

  it("shows the final text with no controls under reduced motion", () => {
    const mm = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: q.includes("reduce") })) as typeof window.matchMedia;
    const { container } = renderWithProviders(<TypingDemo steps={script} autoPlay labels={{ pause: "Durdur" }} />);
    expect(container.querySelector("[data-slot='typing-demo']")).toHaveAttribute("data-state", "static");
    expect(container.querySelectorAll("p > span")[2]!.textContent).toBe("Ship it Friday.");
    expect(screen.queryByRole("button")).toBeNull();
    window.matchMedia = mm;
  });
});
