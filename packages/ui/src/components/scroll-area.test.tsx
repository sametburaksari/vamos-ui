import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ScrollArea } from "./scroll-area";

describe("ScrollArea", () => {
  it("renders a labelled region with maxHeight and no a11y violations", async () => {
    const { container } = render(
      <ScrollArea maxHeight={200} aria-label="Recent activity" fade>
        <ul>
          {Array.from({ length: 30 }, (_, i) => (
            <li key={i}>Invoice #{1040 + i} paid</li>
          ))}
        </ul>
      </ScrollArea>,
    );
    const region = screen.getByRole("region", { name: "Recent activity" });
    expect(region).toHaveStyle({ maxHeight: "200px" });
    expect(region).toHaveAttribute("data-edge-fade", "y");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("forwards the viewport ref and stays unfocusable when content has controls", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ScrollArea viewportRef={ref} orientation="horizontal">
        <button type="button">Design</button>
      </ScrollArea>,
    );
    expect(ref.current).toHaveAttribute("data-slot", "scroll-area-viewport");
    expect(ref.current).not.toHaveAttribute("tabindex");
  });
});
