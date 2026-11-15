import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { StarRating, StarRatingInput } from "./star-rating";
import { commerceLabelsAr, commerceLabelsTr } from "./shared/labels-commerce";

describe("StarRating", () => {
  it("is one image named with the exact rating; half stars are drawn as half fills", async () => {
    const { container } = render(<main><StarRating value={4.46} count={128} showValue countHref="#reviews" /></main>);
    const img = screen.getByRole("img", { name: "Rated 4.5 out of 5" });
    expect(img.children).toHaveLength(5);
    // 4.46 snaps to 4.5: four full stars and one half
    const fills = [...img.querySelectorAll<HTMLElement>("[style]")].map((el) => el.style.width);
    expect(fills).toEqual(["100%", "100%", "100%", "100%", "50%"]);
    expect(screen.getByText("4.5")).toHaveAttribute("aria-hidden");
    expect(screen.getByRole("link", { name: "128 reviews" })).toHaveAttribute("href", "#reviews");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("clamps, supports other maxima and translated labels", () => {
    const { rerender } = render(<StarRating value={7} max={3} step={1} />);
    expect(screen.getByRole("img", { name: "Rated 3.0 out of 3" }).children).toHaveLength(3);
    rerender(<StarRating value={4} count={1} locale="tr-TR" labels={commerceLabelsTr} />);
    expect(screen.getByRole("img", { name: "5 üzerinden 4,0 puan" })).toBeInTheDocument();
    expect(screen.getByText("1 değerlendirme")).toBeInTheDocument();
    rerender(<StarRating value={4} count={2} locale="ar" labels={commerceLabelsAr} />);
    expect(screen.getByText("مراجعتان")).toBeInTheDocument();
  });
});

describe("StarRatingInput", () => {
  it("is a named radio group inside a fieldset that posts with the form", async () => {
    const { container } = render(
      <main>
        <form aria-label="Review">
          <StarRatingInput name="rating" label="How would you rate it?" defaultValue={3} required />
        </form>
      </main>,
    );
    const group = screen.getByRole("group", { name: /How would you rate it/ });
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(radios[0]).toHaveAccessibleName("1 star");
    expect(radios[2]).toBeChecked();
    expect(new FormData(container.querySelector("form")!).get("rating")).toBe("3");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("half steps: ten radios; controlled value reports through onValueChange", () => {
    const changes: number[] = [];
    function Controlled() {
      const [v, setV] = React.useState(2);
      return <StarRatingInput allowHalf value={v} onValueChange={(n) => { changes.push(n); setV(n); }} />;
    }
    render(<Controlled />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(10);
    expect(screen.getByRole("radio", { name: "4.5 stars" })).not.toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "4.5 stars" }));
    expect(changes).toEqual([4.5]);
    expect(screen.getByRole("radio", { name: "4.5 stars" })).toBeChecked();
    expect(radios[0]!.closest("label")).toHaveAttribute("data-half", "start");
    expect(radios[1]!.closest("label")).toHaveAttribute("data-half", "end");
  });

  it("disabled disables every radio through the fieldset", () => {
    render(<StarRatingInput disabled defaultValue={4} />);
    for (const r of screen.getAllByRole("radio")) expect(r).toBeDisabled();
  });
});
