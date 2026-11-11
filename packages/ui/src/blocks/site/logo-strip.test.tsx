import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { LogoStrip } from "./logo-strip";

const logos = ["Kıyı", "Hamam Moda", "Ledgerly", "Defne Clinic", "Studio Arda", "Pera Bakery"].map((name, i) => ({
  name,
  image: { src: `/logos/${i}.svg`, width: 160, height: 40 },
  link: i === 0 ? { href: "/work/kiyi" } : undefined,
}));

describe("LogoStrip", () => {
  it("row: caption names the region; alt = brand name; monochrome by default", async () => {
    const { container } = render(<main><LogoStrip caption="120+ businesses since 2014" logos={logos} /></main>);
    expect(screen.getByRole("region", { name: "120+ businesses since 2014" })).toHaveAttribute("data-mono");
    expect(screen.getByRole("img", { name: "Hamam Moda" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kıyı" })).toHaveAttribute("href", "/work/kiyi");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("marquee: the duplicate copy is hidden from assistive tech and not focusable", async () => {
    const { container } = render(<main><LogoStrip variant="marquee" caption="Clients" logos={logos} speed={30} /></main>);
    expect(container.querySelectorAll(".vb-marquee-track > li")).toHaveLength(12);
    const dups = container.querySelectorAll('.vb-marquee-track > li[data-dup]');
    expect(dups).toHaveLength(6);
    dups.forEach((d) => {
      expect(d).toHaveAttribute("aria-hidden", "true");
      expect(d.querySelector("a")).toBeNull();
    });
    expect(screen.getAllByRole("img")).toHaveLength(6);
    expect((container.querySelector(".vb-marquee") as HTMLElement).style.getPropertyValue("--vb-marquee-duration")).toBe("30s");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("too few logos for a marquee render as a row; grid uses gridlines", () => {
    const { container, rerender } = render(<LogoStrip variant="marquee" logos={logos.slice(0, 3)} />);
    expect(container.querySelector("section")).toHaveAttribute("data-variant", "row");
    expect(screen.getByRole("region", { name: "Clients" })).toBeInTheDocument();
    rerender(<LogoStrip variant="grid" logos={logos} monochrome={false} />);
    expect(container.querySelector(".vb-logo-grid")).not.toBeNull();
    expect(container.querySelector("section")).not.toHaveAttribute("data-mono");
  });
});
