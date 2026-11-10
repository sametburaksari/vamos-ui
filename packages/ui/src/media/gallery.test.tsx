import * as React from "react";
import { screen, within } from "@testing-library/react";
import { Gallery } from "./gallery";
import { justifyRows, masonryColumns, responsiveValue } from "./gallery-layout";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";
import type { MediaSource } from "./types";

const photos: MediaSource[] = [
  { id: "g1", src: "https://cdn.example.com/kitchen.jpg", alt: "Open kitchen with copper pans", width: 1600, height: 1067, caption: "Open kitchen" },
  { id: "g2", src: "https://cdn.example.com/terrace.jpg", alt: "Terrace tables under olive trees", width: 1200, height: 1600, caption: "Terrace" },
  { id: "g3", src: "https://cdn.example.com/bar.jpg", alt: "Marble bar at the entrance", width: 1600, height: 1600 },
  { id: "g4", src: "https://cdn.example.com/dining.jpg", alt: "Main dining room in the evening", width: 2000, height: 1000 },
];

describe("gallery layout math", () => {
  it("puts each item in the shortest column", () => {
    expect(masonryColumns([1, 1, 0.5, 1, 1], 2)).toEqual([[0, 2], [1, 3, 4]]);
  });
  it("justifies rows to the container width and keeps the last row at the target height", () => {
    const rows = justifyRows([1.5, 1.5, 1, 2, 0.75], 600, 200, 10);
    expect(rows[0]!.items).toEqual([0, 1]);
    expect(rows[0]!.justified).toBe(true);
    const r0 = rows[0]!;
    expect(1.5 * r0.height * 2 + 10).toBeCloseTo(600);
    expect(rows.at(-1)!.justified).toBe(false);
    expect(rows.at(-1)!.height).toBeLessThanOrEqual(200);
  });
  it("picks responsive values by width", () => {
    expect(responsiveValue({ base: 2, md: 3, lg: 4 }, 800, 1)).toBe(3);
    expect(responsiveValue({ base: 2, md: 3 }, undefined, 1)).toBe(2);
    expect(responsiveValue(5, 100, 1)).toBe(5);
  });
});

describe("Gallery", () => {
  it("renders a labelled list of enlarge buttons and passes axe", async () => {
    renderWithProviders(<Gallery items={photos} lightbox captions="below" label="Restaurant photos" />);
    const list = screen.getByRole("list", { name: "Restaurant photos" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Enlarge image: Terrace tables under olive trees" })).toBeInTheDocument();
    expect(screen.getByText("Open kitchen")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("opens the lightbox at the chosen item", async () => {
    const { user } = renderWithProviders(<Gallery items={photos} lightbox />);
    await user.click(screen.getByRole("button", { name: /Marble bar/ }));
    expect(await screen.findByRole("dialog", { name: "Image viewer" })).toBeInTheDocument();
    expect(screen.getByText("Image 3 of 4: Marble bar at the entrance")).toBeInTheDocument();
  });

  it("lays out masonry columns", () => {
    const { container } = renderWithProviders(<Gallery items={photos} layout="masonry" columns={2} />);
    expect(container.querySelectorAll(".vui-gallery-masonry > ul")).toHaveLength(2);
    expect(screen.getAllByRole("img")).toHaveLength(4);
  });

  it("renders nothing when empty in view mode, and skeletons while loading", () => {
    const { container, rerender } = renderWithProviders(<Gallery items={[]} />);
    expect(container.querySelector("[data-slot=gallery]")).toBeNull();
    rerender(<Gallery items={[]} loading skeletonCount={3} />);
    expect(screen.getByRole("status", { name: "Loading images" })).toBeInTheDocument();
  });

  it("edit mode: remove, caption, move menu and add tile", async () => {
    const onRemove = vi.fn();
    const onCaptionChange = vi.fn();
    const onAdd = vi.fn();
    const onReorder = vi.fn();
    const { user } = renderWithProviders(<Gallery items={photos} editable onRemove={onRemove} onCaptionChange={onCaptionChange} onAdd={onAdd} onReorder={onReorder} />);
    await user.click(screen.getByRole("button", { name: "Remove Marble bar at the entrance" }));
    expect(onRemove).toHaveBeenCalledWith("g3");
    const caption = screen.getByRole("textbox", { name: "Caption for Terrace tables under olive trees" });
    await user.clear(caption);
    await user.type(caption, "Terrace in June{Enter}");
    expect(onCaptionChange).toHaveBeenCalledWith("g2", "Terrace in June");
    await user.click(screen.getByRole("button", { name: "Add images" }));
    expect(onAdd).toHaveBeenCalled();
    expect(screen.getAllByRole("button", { name: /^Move / }).length).toBe(4);
    await expectNoA11yViolations();
  });

  it("edit mode with no items shows the big add tile", () => {
    renderWithProviders(<Gallery items={[]} editable onAdd={() => {}} />);
    expect(screen.getByRole("button", { name: /Add images/ })).toHaveTextContent("Pick from the library or drop files");
  });
});
