import * as React from "react";
import { screen, within } from "@testing-library/react";
import { FormGuide, StandingsTable, type StandingRow } from "./standings-table";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const rows: StandingRow[] = [
  { id: "north", side: "Northgate", played: 4, won: 3, drawn: 1, lost: 0, for: 9, against: 3, form: ["win", "draw", "win", "win"] },
  { id: "river", side: "Riverside", played: 4, won: 2, drawn: 1, lost: 1, for: 6, against: 5, form: ["loss", "win", "draw", "win"] },
  { id: "harbour", side: "Harbour Town", played: 4, won: 1, drawn: 1, lost: 2, for: 4, against: 6 },
  { id: "hill", side: "Hillcrest", played: 4, won: 0, drawn: 1, lost: 3, for: 2, against: 7 },
];

describe("FormGuide", () => {
  it("names the strip and shows letters", () => {
    renderWithProviders(<FormGuide form={["win", "draw", "loss"]} />);
    const strip = screen.getByRole("img", { name: "Form: Win, Draw, Loss" });
    expect(strip).toHaveTextContent("WDL");
  });
});

describe("StandingsTable", () => {
  it("renders positions, computed points and difference, and highlights a side", async () => {
    const { container } = renderWithProviders(<StandingsTable caption="North Division" rows={rows} highlight="harbour" zones={[{ after: 1, label: "Promotion" }, { after: 3, label: "Relegation", tone: "muted" }]} />);
    const table = screen.getByRole("table", { name: "North Division" });
    const body = within(table).getAllByRole("row").slice(1);
    expect(body).toHaveLength(4);
    expect(within(body[0]!).getByRole("rowheader")).toHaveTextContent("Northgate");
    expect(body[0]).toHaveTextContent("+6");
    expect(body[0]).toHaveTextContent("10");
    expect(body[3]).toHaveTextContent("−5");
    expect(body[2]).toHaveAttribute("aria-current", "true");
    expect(within(body[2]!).getByRole("rowheader")).toHaveTextContent("Harbour Town (your team)");
    expect(body[0]).toHaveAttribute("data-zone", "accent");
    expect(body[2]).toHaveAttribute("data-zone", "muted");
    expect(screen.getByText("Promotion")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Points" })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: /^Form:/ })).toHaveLength(2);
    await expectNoA11yViolations(container);
  });

  it("limits to the top rows plus the highlighted side", () => {
    renderWithProviders(<StandingsTable caption="Ladder" rows={rows} limit={2} highlight="hill" showForm={false} />);
    const body = screen.getAllByRole("row").slice(1);
    expect(body.map((r) => within(r).getByRole("rowheader").textContent)).toEqual(["Northgate", "Riverside", "Hillcrest (your team)"]);
    expect(within(body[2]!).getAllByRole("cell")[0]).toHaveTextContent("4");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("takes custom columns and explicit points", () => {
    renderWithProviders(
      <StandingsTable
        caption="Quiz league"
        rows={[{ side: "Team Quark", played: 3, points: 41, bonus: 5 }]}
        columns={["played", { key: "bonus", label: "Bonus rounds", short: "BR", numeric: true, value: (r) => String(r.bonus) }, "points"]}
      />,
    );
    expect(screen.getByRole("columnheader", { name: "Bonus rounds" })).toHaveTextContent("BR");
    const row = screen.getAllByRole("row")[1]!;
    expect(row).toHaveTextContent("41");
    expect(row).toHaveTextContent("5");
  });

  it("formats numbers with the locale and translates labels", () => {
    renderWithProviders(<StandingsTable caption="Lig" rows={[{ side: "Kuzey", played: 2, won: 1, drawn: 0, lost: 1, for: 1200, against: 0 }]} columns={["score", "points"]} labels={{ points: "Puan", pointsShort: "P" }} />, { locale: "tr-TR" });
    expect(screen.getByRole("columnheader", { name: "Puan" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("1.200:0");
  });
});
