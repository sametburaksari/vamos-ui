import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { snapToGrid, usePointerDrag, type UsePointerDragOptions } from "./use-pointer-drag";
import { useTimeScale } from "./use-time-scale";

function Bar(props: UsePointerDragOptions) {
  const { bind, isDragging } = usePointerDrag(props);
  return (
    <div role="slider" aria-label="Design review, 14:00 to 15:00" aria-valuenow={0} tabIndex={0} data-dragging={isDragging || undefined} {...bind}>
      Design review
    </div>
  );
}

const down = (el: Element, x = 0, y = 0) => fireEvent.pointerDown(el, { clientX: x, clientY: y, button: 0, isPrimary: true, pointerId: 1, pointerType: "mouse" });
const move = (x: number, y: number, extra: Record<string, unknown> = {}) => fireEvent.pointerMove(window, { clientX: x, clientY: y, pointerId: 1, ...extra });
const up = (x: number, y: number) => fireEvent.pointerUp(window, { clientX: x, clientY: y, pointerId: 1 });

describe("usePointerDrag", () => {
  it("treats small movement as a tap and larger movement as a drag", () => {
    const onTap = vi.fn();
    const onStart = vi.fn();
    const onEnd = vi.fn();
    render(<Bar onTap={onTap} onStart={onStart} onEnd={onEnd} />);
    const el = screen.getByRole("slider");
    down(el, 10, 10);
    move(11, 11);
    up(11, 11);
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();

    down(el, 10, 10);
    move(10, 40);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(el).toHaveAttribute("data-dragging");
    up(10, 52);
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd.mock.calls[0]![0].delta).toEqual({ x: 0, y: 42 });
    expect(el).not.toHaveAttribute("data-dragging");
  });

  it("locks the axis and snaps", () => {
    const onMove = vi.fn();
    render(<Bar axis="y" snap={snapToGrid({ y: 12 })} onMove={onMove} />);
    down(screen.getByRole("slider"), 0, 0);
    move(30, 17);
    const s = onMove.mock.calls.at(-1)![0];
    expect(s.rawDelta).toEqual({ x: 0, y: 17 });
    expect(s.delta).toEqual({ x: 0, y: 12 });
    up(30, 17);
  });

  it("cancels with Escape and ignores secondary buttons", () => {
    const onCancel = vi.fn();
    const onEnd = vi.fn();
    render(<Bar onCancel={onCancel} onEnd={onEnd} />);
    const el = screen.getByRole("slider");
    fireEvent.pointerDown(el, { clientX: 0, clientY: 0, button: 2, isPrimary: true, pointerId: 1 });
    move(50, 50);
    expect(onCancel).not.toHaveBeenCalled();
    down(el);
    move(40, 0);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
    up(40, 0);
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("does nothing when disabled and passes axe", async () => {
    const onStart = vi.fn();
    const { container } = render(<Bar disabled onStart={onStart} />);
    down(screen.getByRole("slider"));
    move(50, 50);
    expect(onStart).not.toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("useTimeScale", () => {
  function Ruler({ end }: { end: string }) {
    const scale = useTimeScale({ start: "2026-11-09", end, scale: "day", locale: "tr-TR", timeZone: "Europe/Istanbul" });
    return (
      <ol aria-label="Days">
        {scale.ticks("day").map((t) => (
          <li key={t.start} style={{ insetInlineStart: t.x, width: t.width }}>
            {t.date}
          </li>
        ))}
      </ol>
    );
  }
  it("renders ticks and recomputes on change", () => {
    const { rerender } = render(<Ruler end="2026-11-12" />);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["2026-11-09", "2026-11-10", "2026-11-11"]);
    act(() => rerender(<Ruler end="2026-11-10" />));
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});
