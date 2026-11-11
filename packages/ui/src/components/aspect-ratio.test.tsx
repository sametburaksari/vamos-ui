import { screen } from "@testing-library/react";
import { AspectRatio, parseAspectRatio } from "./aspect-ratio";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("AspectRatio", () => {
  it("parses ratios", () => {
    expect(parseAspectRatio("16/9")).toBeCloseTo(16 / 9);
    expect(parseAspectRatio("4:3")).toBeCloseTo(4 / 3);
    expect(parseAspectRatio(1.5)).toBe(1.5);
    expect(parseAspectRatio("2")).toBe(2);
    expect(parseAspectRatio("0/9")).toBeUndefined();
    expect(parseAspectRatio(-1)).toBeUndefined();
  });

  it("sets aspect-ratio, defaults to 16/9 and fills the child", async () => {
    const { container, rerender } = renderWithProviders(
      <AspectRatio ratio="4/3" rounded="ui-lg">
        <iframe title="Office location map" src="about:blank" />
      </AspectRatio>,
    );
    const box = container.querySelector("[data-slot=aspect-ratio]") as HTMLElement;
    expect(parseFloat(box.style.aspectRatio)).toBeCloseTo(4 / 3, 3);
    expect(box).toHaveClass("rounded-ui-lg");
    expect(screen.getByTitle("Office location map")).toBeInTheDocument();
    // axe cannot walk into jsdom iframes; check a plain media child instead.
    rerender(
      <AspectRatio ratio="1/1">
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Ceramic vase on a linen cloth" />
      </AspectRatio>,
    );
    await expectNoA11yViolations();
    rerender(
      <AspectRatio>
        <div>Video</div>
      </AspectRatio>,
    );
    expect(parseFloat((container.querySelector("[data-slot=aspect-ratio]") as HTMLElement).style.aspectRatio)).toBeCloseTo(16 / 9, 3);
  });

  it("has no interactive surface of its own (keyboard passes through to the child)", async () => {
    const { user } = renderWithProviders(
      <AspectRatio ratio={1}>
        <button type="button">Play tour</button>
      </AspectRatio>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Play tour" })).toHaveFocus();
  });
});
