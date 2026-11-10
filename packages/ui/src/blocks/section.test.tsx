import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Section, Container, SkipLink, sectionThemeAttributes, accentForeground } from "./section";

describe("Section", () => {
  it("is a labelled region with the theme as subtree axes", async () => {
    const { container } = render(
      <main>
        <Section anchor="private-dining" headingId="pd" theme={{ mode: "dark", surface: "accent", accent: "ember", density: "compact", rhythm: "loose", material: "inherit" }}>
          <Container>
            <h2 id="pd">Private dining</h2>
          </Container>
        </Section>
      </main>,
    );
    const region = screen.getByRole("region", { name: "Private dining" });
    expect(region).toHaveAttribute("id", "private-dining");
    expect(region).toHaveClass("vb-section", "dark");
    expect(region).toHaveAttribute("data-surface", "accent");
    expect(region).toHaveAttribute("data-accent", "ember");
    expect(region).toHaveAttribute("data-density", "compact");
    expect(region).toHaveAttribute("data-rhythm", "loose");
    expect(region).toHaveAttribute("data-tone", "accent/dark");
    expect(region).not.toHaveAttribute("data-material");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("paints a scene when only the mode changes, and maps custom oklch accents", () => {
    expect(sectionThemeAttributes({ mode: "light" }).attrs["data-surface"]).toBe("scene");
    const t = sectionThemeAttributes({ accent: "oklch(0.82 0.15 85)" });
    expect(t.attrs["data-accent"]).toBe("custom");
    expect((t.style as Record<string, string>)["--accent-base"]).toBe("oklch(0.82 0.15 85)");
    expect(accentForeground("oklch(0.82 0.15 85)")).not.toBe("#fff");
    expect(accentForeground("oklch(45% 0.15 250)")).toBe("#fff");
  });

  it("media surface forces dark and renders a decorative background", () => {
    const { container } = render(
      <Section theme={{ surface: "media", background: { src: "/terrace.jpg", width: 2400, height: 1600, alt: "Terrace" } }} aria-label="Terrace">
        <p>Open air, May to October.</p>
      </Section>,
    );
    const section = container.querySelector("section")!;
    expect(section).toHaveClass("dark");
    const img = section.querySelector(".vb-section-media img")!;
    expect(img).toHaveAttribute("alt", "");
    expect(section.querySelector(".vb-section-media")).toHaveAttribute("aria-hidden", "true");
  });

  it("emits block ids only in edit mode and supports other landmarks", () => {
    const { rerender, container } = render(<Section blockId="b_hero01" blockType="hero" as="header" />);
    expect(container.querySelector("header")).not.toHaveAttribute("data-block-id");
    rerender(<Section blockId="b_hero01" blockType="hero" as="header" editMode />);
    expect(container.querySelector("header")).toHaveAttribute("data-block-id", "b_hero01");
  });
});

describe("Container", () => {
  it("sets the size token", () => {
    const { container } = render(<Container size="prose">Text</Container>);
    expect(container.firstChild).toHaveClass("vb-container");
    expect(container.firstChild).toHaveAttribute("data-size", "prose");
  });
});

describe("SkipLink", () => {
  it("is the first tab stop and targets #content", async () => {
    render(
      <>
        <SkipLink />
        <a href="/menu">Menu</a>
      </>,
    );
    await userEvent.tab();
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute("href", "#content");
  });
  it("takes translated labels", () => {
    render(<SkipLink labels={{ skipToContent: "İçeriğe geç" }} />);
    expect(screen.getByRole("link", { name: "İçeriğe geç" })).toBeInTheDocument();
  });
});
