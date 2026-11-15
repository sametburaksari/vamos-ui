import * as React from "react";
import { screen } from "@testing-library/react";
import { ImageHotspots, type Hotspot } from "./image-hotspots";
import { expectNoA11yViolations, expectRovingFocus, keys, renderWithProviders } from "../../test/utils";

const rooms: Hotspot[] = [
  { id: "lobby", x: 20, y: 70, label: "Lobby", description: "Reception and lockers" },
  { id: "studio", x: 50, y: 30, label: "Studio", description: "Seats 24" },
  { id: "library", x: 80, y: 70, label: "Library" },
  { id: "roof", x: 80, y: 20, label: "Roof terrace", disabled: true },
];

const Plan = (props: Partial<React.ComponentProps<typeof ImageHotspots>>) => (
  <ImageHotspots aria-label="Ground floor" aspectRatio={2} hotspots={rooms} {...(props as object)}>
    <svg viewBox="0 0 200 100" aria-hidden="true">
      <rect width="200" height="100" fill="none" stroke="currentColor" />
    </svg>
  </ImageHotspots>
);

describe("ImageHotspots", () => {
  it("single: a radio group of positioned buttons with a callout, passes axe", async () => {
    const { container } = renderWithProviders(<Plan defaultValue="studio" />);
    const group = screen.getByRole("radiogroup", { name: "Ground floor" });
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    const studio = screen.getByRole("radio", { name: "Studio" });
    expect(studio).toBeChecked();
    expect(studio).toHaveStyle({ left: "50.000%", top: "30.000%" });
    expect(studio).toHaveAccessibleDescription("Studio Seats 24");
    expect(group.querySelector('[data-slot="image-hotspots-callout"]')).toHaveTextContent("Seats 24");
    await expectNoA11yViolations(container);
  });

  it("single: one tab stop, arrows move to the nearest spot and select it, Escape clears", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<Plan onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Lobby" })).toHaveFocus();
    await user.keyboard(keys.right);
    // Nearest to the right of Lobby is Library (same row), not the disabled roof.
    expect(screen.getByRole("radio", { name: "Library" })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith("library");
    await user.keyboard(keys.up);
    expect(screen.getByRole("radio", { name: "Studio" })).toHaveFocus();
    expectRovingFocus(screen.getAllByRole("radio"));
    await user.keyboard(keys.home);
    expect(screen.getByRole("radio", { name: "Lobby" })).toBeChecked();
    await user.keyboard(keys.escape);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("multiple: toggle buttons; arrows move focus only, Space toggles", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<Plan type="multiple" defaultValue={["library"]} onValueChange={onValueChange} numbered />);
    expect(screen.getByRole("group", { name: "Ground floor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Library" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Lobby" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["library", "lobby"]);
    await user.keyboard(keys.up);
    expect(screen.getByRole("button", { name: "Studio" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Studio" })).toHaveAttribute("aria-pressed", "false");
    await user.keyboard(keys.space);
    expect(onValueChange).toHaveBeenLastCalledWith(["library", "lobby", "studio"]);
    expect(screen.getByRole("button", { name: "Studio" })).toHaveTextContent("2");
  });

  it("controlled value and a custom callout", () => {
    renderWithProviders(<Plan value="library" callout={(s) => <span>Picked {s.label}</span>} />);
    expect(screen.getByRole("radio", { name: "Library" })).toBeChecked();
    expect(screen.getByText("Picked Library")).toBeInTheDocument();
  });
});
