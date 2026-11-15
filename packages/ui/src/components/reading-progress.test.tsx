import * as React from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import { ReadingProgress } from "./reading-progress";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function setRect(el: HTMLElement, top: number, height: number) {
  el.getBoundingClientRect = () => ({ top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top, toJSON() {} }) as DOMRect;
}

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    cb(0);
    return 0;
  });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
});
afterEach(() => vi.restoreAllMocks());

describe("ReadingProgress", () => {
  it("is a labelled progressbar that tracks a target element", async () => {
    const article = document.createElement("article");
    document.body.appendChild(article);
    setRect(article, 300, 2000); // top at the reading line (30% of 1000)
    const onChange = vi.fn();
    const { container } = renderWithProviders(<ReadingProgress target={article} minutes={10} position="inline" onProgressChange={onChange} />);
    const bar = screen.getByRole("progressbar", { name: "Reading progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "0");

    setRect(article, -700, 2000); // 1000px past the line → 50%
    act(() => {
      fireEvent.scroll(window);
    });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveAttribute("aria-valuetext", "50% · 5 min left");
    expect(bar.querySelector("[style]")!.getAttribute("style")).toContain("scaleX(0.5)");
    expect(onChange).toHaveBeenLastCalledWith(0.5);

    setRect(article, -3000, 2000);
    act(() => {
      fireEvent.scroll(window);
    });
    expect(bar.getAttribute("aria-valuetext")).toBe("Finished");
    expect(bar).toHaveAttribute("data-complete");
    await expectNoA11yViolations(container);
    article.remove();
  });

  it("accepts a selector and a ref, and portals the pinned bar with an indicator", () => {
    const section = document.createElement("section");
    section.id = "essay";
    document.body.appendChild(section);
    setRect(section, -200, 1000);
    renderWithProviders(<ReadingProgress target="#essay" indicator labels={{ label: "Progress" }} />);
    const bar = screen.getByRole("progressbar", { name: "Progress" });
    expect(bar).toHaveAttribute("data-position", "top");
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar.className).toContain("fixed");
    const pill = document.querySelector("[data-slot='reading-progress-indicator']")!;
    expect(pill).toHaveAttribute("data-shown");
    expect(pill).toHaveAttribute("aria-hidden", "true");
    section.remove();

    function WithRef() {
      const ref = React.useRef<HTMLDivElement>(null);
      return (
        <>
          <ReadingProgress target={ref} position="inline" labels={{ label: "Ref" }} />
          <div ref={ref} />
        </>
      );
    }
    renderWithProviders(<WithRef />);
    expect(screen.getByRole("progressbar", { name: "Ref" })).toBeInTheDocument();
  });

  it("measures the whole page without a target", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 3000 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 500 });
    renderWithProviders(<ReadingProgress position="bottom" portal={false} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  });
});
