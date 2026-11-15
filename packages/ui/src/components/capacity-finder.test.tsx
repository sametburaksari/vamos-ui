import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { CapacityFinder, capacityFit, type CapacityArrangement, type CapacityOption } from "./capacity-finder";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

const arrangements: CapacityArrangement[] = [
  { id: "theatre", label: "Theatre", phrase: "theatre-style" },
  { id: "boardroom", label: "Boardroom", phrase: "around one table" },
  { id: "standing", label: "Standing" },
];
const options: CapacityOption[] = [
  { id: "north", name: "North Room", meta: "Floor 2 · 90 m²", capacities: { theatre: 80, boardroom: 24, standing: 120 } },
  { id: "loft", name: "The Loft", capacities: { theatre: 40, boardroom: 16, standing: 60 } },
  { id: "court", name: "Courtyard", capacities: { standing: 200 } },
];

describe("capacityFit", () => {
  it("classifies each option", () => {
    expect(capacityFit(options, "theatre", 50).map((x) => x.status)).toEqual(["fits", "too-small", "unavailable"]);
    expect(capacityFit(options, "standing", 150).map((x) => x.capacity)).toEqual([120, 60, 200]);
  });
});

describe("CapacityFinder", () => {
  it("summarises what fits and shows each option's capacity", async () => {
    const { container } = renderWithProviders(<CapacityFinder options={options} arrangements={arrangements} defaultCount={50} />);
    expect(screen.getByText("1 of 3 take 50 people theatre-style.")).toHaveAttribute("aria-live", "polite");
    const items = container.querySelectorAll("[data-option]");
    expect([...items].map((i) => i.getAttribute("data-status"))).toEqual(["fits", "too-small", "unavailable"]);
    expect(items[0]).toHaveTextContent("Fits · up to 80");
    expect(items[1]).toHaveTextContent("Too small · up to 40");
    expect(items[2]).toHaveTextContent("Not in this layout");
    expect(screen.getByRole("heading", { name: "North Room" })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("switches layout with the keyboard and explains when nothing fits", async () => {
    const onArrangement = vi.fn();
    const { user } = renderWithProviders(<CapacityFinder options={options} arrangements={arrangements} defaultCount={30} onArrangementChange={onArrangement} noneFitMessage="Larger groups: get in touch." />);
    screen.getByRole("radio", { name: "Theatre" }).focus();
    await user.keyboard(keys.right);
    await user.keyboard(keys.space);
    expect(onArrangement).toHaveBeenLastCalledWith("boardroom");
    expect(screen.getByText("None takes 30 people around one table. The largest is North Room, up to 24.")).toBeInTheDocument();
    expect(screen.getByText("Larger groups: get in touch.")).toBeInTheDocument();
  });

  it("follows the count input, sorts by fit and renders actions", () => {
    renderWithProviders(
      <CapacityFinder
        options={options}
        arrangements={arrangements}
        defaultArrangement="standing"
        defaultCount={10}
        sortByFit
        showAllCapacities
        renderAction={({ option, status }) => (
          <button type="button" disabled={status !== "fits"}>
            Book {option.name}
          </button>
        )}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Number of people" });
    fireEvent.change(input, { target: { value: "150" } });
    fireEvent.blur(input);
    expect(screen.getByText("1 of 3 take 150 people standing.")).toBeInTheDocument();
    const headings = screen.getAllByRole("heading").map((h) => h.textContent);
    expect(headings).toEqual(["Courtyard", "North Room", "The Loft"]);
    expect(screen.getByRole("button", { name: "Book Courtyard" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Book The Loft" })).toBeDisabled();
    expect(document.querySelectorAll("[data-current]")).toHaveLength(3);
  });

  it("formats with the locale", () => {
    renderWithProviders(<CapacityFinder options={[{ id: "a", name: "Salon A", capacities: { theatre: 1500 } }]} arrangements={[{ id: "theatre", label: "Tiyatro", phrase: "tiyatro düzeninde" }]} defaultCount={1200} labels={{ result: "{total} alandan {fit} tanesi {arrangement} {count} kişi alıyor.", upTo: "en fazla {capacity}", fits: "Sığar" }} />, { locale: "tr-TR" });
    expect(screen.getByText("1 alandan 1 tanesi tiyatro düzeninde 1.200 kişi alıyor.")).toBeInTheDocument();
    expect(screen.getByText("Sığar · en fazla 1.500")).toBeInTheDocument();
  });
});
