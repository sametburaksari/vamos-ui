import * as React from "react";
import { screen } from "@testing-library/react";
import { PlaceholderArt, hashSeed, placeholderArtRecipe, placeholderArtStyle } from "./placeholder-art";
import { Image } from "./image";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("PlaceholderArt", () => {
  it("is deterministic per seed", () => {
    expect(hashSeed("harbour-terrace")).toBe(hashSeed("harbour-terrace"));
    expect(placeholderArtRecipe("harbour-terrace")).toEqual(placeholderArtRecipe("harbour-terrace"));
    const patterns = new Set(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"].map((s) => placeholderArtRecipe(s).pattern));
    expect(patterns.size).toBeGreaterThan(1);
    expect(placeholderArtRecipe("x", "dots").pattern).toBe("dots");
  });

  it("uses tokens only", () => {
    for (const p of ["grid", "dots", "lines", "rings", "glow"] as const) {
      const style = placeholderArtStyle(placeholderArtRecipe("seed", p));
      const css = `${style.backgroundColor} ${style.backgroundImage}`;
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|oklch\(/i);
      expect(css).toContain("var(--chart-");
    }
  });

  it("is an image with a name when labelled, decorative otherwise", async () => {
    renderWithProviders(
      <div>
        <PlaceholderArt seed="studio" label="Studio entrance on Linden Street" caption />
        <PlaceholderArt seed="pattern-only" data-testid="deco" icon={false} />
      </div>,
    );
    expect(screen.getByRole("img", { name: "Studio entrance on Linden Street" })).toBeInTheDocument();
    expect(screen.getByText("Studio entrance on Linden Street")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("deco")).toHaveAttribute("aria-hidden", "true");
    await expectNoA11yViolations();
  });
});

describe("Image art placeholder", () => {
  it("renders art without a src and keeps the alt as the name", async () => {
    const { container } = renderWithProviders(<Image src={null} alt="Chef plating the tasting menu" aspect="3/2" rounded="ui" />);
    const wrapper = container.querySelector("[data-slot=image]") as HTMLElement;
    expect(wrapper).toHaveAttribute("data-state", "empty");
    expect(parseFloat(wrapper.style.aspectRatio)).toBeCloseTo(1.5, 3);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Chef plating the tasting menu" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("empty string src falls back to a 4:3 box", () => {
    const { container } = renderWithProviders(<Image src="" alt="" />);
    const wrapper = container.querySelector("[data-slot=image]") as HTMLElement;
    expect(parseFloat(wrapper.style.aspectRatio)).toBeCloseTo(4 / 3, 3);
    expect(container.querySelector("[data-slot=image-art]")).toHaveAttribute("aria-hidden", "true");
  });

  it('placeholder="art" shows decorative art while loading', () => {
    const { container } = renderWithProviders(<Image src="https://cdn.example.com/a.jpg" alt="Reading room" aspect="16/9" placeholder="art" />);
    const art = container.querySelector("[data-slot=image-art]");
    expect(art).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img", { name: "Reading room" }).tagName).toBe("IMG");
  });
});
