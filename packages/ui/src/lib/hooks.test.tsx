import * as React from "react";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useControllableState } from "./use-controllable-state";
import { composeRefs, mergeIds } from "./compose-refs";
import { formatShortcut, matchesShortcut, parseShortcut, shortcutKeys, useHotkeys } from "./use-hotkeys";
import { useMediaQuery } from "./use-media-query";
import { useHoverIntent } from "./use-hover-intent";

describe("useControllableState", () => {
  it("works uncontrolled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    act(() => result.current[1]((v) => v + 1));
    expect(result.current[0]).toBe(3);
    act(() => result.current[1](3));
    expect(onChange).toHaveBeenCalledTimes(2);
  });
  it("works controlled", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useControllableState({ value, defaultValue: 0, onChange }), { initialProps: { value: 5 } });
    act(() => result.current[1](6));
    expect(onChange).toHaveBeenCalledWith(6);
    expect(result.current[0]).toBe(5);
    rerender({ value: 6 });
    expect(result.current[0]).toBe(6);
  });
  it("treats null as controlled", () => {
    const { result } = renderHook(() => useControllableState<string | null>({ value: null, defaultValue: "a" }));
    expect(result.current[0]).toBeNull();
  });
});

describe("refs and ids", () => {
  it("composes refs", () => {
    const a = React.createRef<HTMLDivElement>();
    let b: HTMLDivElement | null = null;
    render(<div ref={composeRefs(a, (n) => {
      b = n;
    })} data-testid="x" />);
    expect(a.current).toBe(screen.getByTestId("x"));
    expect(b).toBe(screen.getByTestId("x"));
  });
  it("merges ids", () => {
    expect(mergeIds("a", undefined, "b a", false, "c")).toBe("a b c");
    expect(mergeIds(undefined, "")).toBeUndefined();
  });
});

describe("shortcuts", () => {
  const key = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);
  it("parses and matches mod per platform", () => {
    expect(parseShortcut("mod+Shift+K")).toMatchObject({ key: "k", mod: true, shift: true });
    expect(matchesShortcut(key({ key: "k", metaKey: true }), "mod+k", true)).toBe(true);
    expect(matchesShortcut(key({ key: "k", ctrlKey: true }), "mod+k", false)).toBe(true);
    expect(matchesShortcut(key({ key: "k", ctrlKey: true }), "mod+k", true)).toBe(false);
    expect(matchesShortcut(key({ key: "k", metaKey: true, shiftKey: true }), "mod+k", true)).toBe(false);
  });
  it("matches symbols regardless of shift, aliases and code fallback", () => {
    expect(matchesShortcut(key({ key: "?", shiftKey: true }), "?", false)).toBe(true);
    expect(matchesShortcut(key({ key: "Escape" }), "esc", false)).toBe(true);
    expect(matchesShortcut(key({ key: "˚", code: "KeyK", altKey: true }), "alt+k", true)).toBe(true);
  });
  it("formats per platform", () => {
    expect(formatShortcut("mod+k", { isMac: true })).toBe("⌘K");
    expect(formatShortcut("mod+k", { isMac: false })).toBe("Ctrl+K");
    expect(formatShortcut("mod+shift+p", { isMac: true })).toBe("⇧⌘P");
    expect(formatShortcut("alt+enter", { isMac: false })).toBe("Alt+Enter");
    expect(shortcutKeys("shift+mod+alt+x", true)).toEqual(["alt", "shift", "mod", "x"]);
  });
  it("useHotkeys fires, respects form fields and enabled", () => {
    const onSlash = vi.fn();
    const onMod = vi.fn();
    function Test({ enabled = true }: { enabled?: boolean }) {
      useHotkeys("/", onSlash, { enabled });
      useHotkeys("mod+k", onMod);
      return <input aria-label="search" />;
    }
    const { rerender } = render(<Test />);
    fireEvent.keyDown(document, { key: "/" });
    expect(onSlash).toHaveBeenCalledTimes(1);
    const input = screen.getByLabelText("search");
    fireEvent.keyDown(input, { key: "/" });
    expect(onSlash).toHaveBeenCalledTimes(1); // plain keys ignored while typing
    fireEvent.keyDown(input, { key: "k", ctrlKey: true });
    expect(onMod).toHaveBeenCalledTimes(1); // modifier shortcuts still work
    rerender(<Test enabled={false} />);
    fireEvent.keyDown(document, { key: "/" });
    expect(onSlash).toHaveBeenCalledTimes(1);
  });
});

describe("useMediaQuery", () => {
  it("returns the client value after mount", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 1px)"));
    expect(result.current).toBe(false); // jsdom stub matches nothing
  });
});

describe("useHoverIntent", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it("opens after the delay on mouse hover and closes after leaving", () => {
    function Test() {
      const h = useHoverIntent({ openDelay: 100, closeDelay: 100, safeTriangle: false });
      return (
        <>
          <button {...h.triggerProps}>Posts</button>
          {h.open ? <div>Flyout</div> : null}
        </>
      );
    }
    render(<Test />);
    const btn = screen.getByRole("button");
    fireEvent.pointerEnter(btn, { pointerType: "mouse" });
    expect(screen.queryByText("Flyout")).toBeNull();
    act(() => void vi.advanceTimersByTime(120));
    expect(screen.getByText("Flyout")).toBeInTheDocument();
    fireEvent.pointerLeave(btn, { pointerType: "mouse" });
    act(() => void vi.advanceTimersByTime(120));
    expect(screen.queryByText("Flyout")).toBeNull();
  });
});
