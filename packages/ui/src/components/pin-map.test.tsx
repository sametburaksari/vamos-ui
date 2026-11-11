import * as React from "react";
import { screen } from "@testing-library/react";
import { PinMap, type MapPin } from "./pin-map";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const pins: MapPin[] = [
  { id: "west", lat: 40.98, lng: 28.87, label: "Bakırköy store", description: "Open until 21:00" },
  { id: "centre", lat: 41.024, lng: 28.976, label: "Karaköy store" },
  { id: "north", lat: 41.077, lng: 29.043, label: "Bebek store" },
  { id: "east", lat: 40.992, lng: 29.124, label: "Ataşehir store", tone: "danger" },
];
const bounds = { north: 41.16, south: 40.8, west: 28.62, east: 29.42 };

describe("PinMap", () => {
  it("places pins by coordinate, exposes them as toggle buttons and passes axe", async () => {
    const { container } = renderWithProviders(<PinMap aria-label="Stores in Istanbul" pins={pins} bounds={bounds} />);
    expect(screen.getByRole("group", { name: "Stores in Istanbul" })).toBeInTheDocument();
    const west = screen.getByRole("button", { name: "Bakırköy store" });
    const east = screen.getByRole("button", { name: "Ataşehir store" });
    expect(parseFloat(west.style.left)).toBeLessThan(parseFloat(east.style.left));
    const north = screen.getByRole("button", { name: "Bebek store" });
    expect(parseFloat(north.style.top)).toBeLessThan(parseFloat(west.style.top));
    expect(west).toHaveAttribute("tabindex", "0");
    expect(east).toHaveAttribute("tabindex", "-1");
    await expectNoA11yViolations(container);
  });

  it("selects on click with a callout, clears with Escape", async () => {
    const onSelectedIdChange = vi.fn();
    const { user } = renderWithProviders(<PinMap aria-label="Stores" pins={pins} bounds={bounds} onSelectedIdChange={onSelectedIdChange} />);
    const west = screen.getByRole("button", { name: "Bakırköy store" });
    await user.click(west);
    expect(west).toHaveAttribute("aria-pressed", "true");
    expect(onSelectedIdChange).toHaveBeenLastCalledWith("west");
    expect(west).toHaveAccessibleDescription(/Open until 21:00/);
    await user.keyboard("{Escape}");
    expect(west).toHaveAttribute("aria-pressed", "false");
  });

  it("moves focus to the nearest pin in the arrow direction", async () => {
    const { user } = renderWithProviders(<PinMap aria-label="Stores" pins={pins} bounds={bounds} />);
    screen.getByRole("button", { name: "Bakırköy store" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Karaköy store" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("button", { name: "Bebek store" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Ataşehir store" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Ataşehir store" })).toHaveAttribute("tabindex", "0");
  });

  it("sizes bubbles by value and fits bounds when none are given", () => {
    renderWithProviders(<PinMap aria-label="Visitors" variant="bubble" pins={[{ id: "a", lat: 41, lng: 29, label: "Istanbul, 86", value: 86 }, { id: "b", lat: 39.9, lng: 32.9, label: "Ankara, 9", value: 9 }]} />);
    const a = screen.getByRole("button", { name: "Istanbul, 86" });
    const b = screen.getByRole("button", { name: "Ankara, 9" });
    expect(parseFloat(a.style.width)).toBeGreaterThan(parseFloat(b.style.width));
    for (const el of [a, b]) {
      const x = parseFloat(el.style.left);
      const y = parseFloat(el.style.top);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(100);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(100);
    }
  });
});
