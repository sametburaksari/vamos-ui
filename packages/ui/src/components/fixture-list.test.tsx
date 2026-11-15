import * as React from "react";
import { screen, within } from "@testing-library/react";
import { FixtureList, fixtureOutcome, type Fixture } from "./fixture-list";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

const fixtures: Fixture[] = [
  { id: "r1", start: "2026-10-03T15:00:00Z", home: "Northgate", away: "Riverside", score: [2, 1], competition: "league", venue: "North Park" },
  { id: "r2", start: "2026-10-10T15:00:00Z", home: "Hillcrest", away: "Northgate", score: [0, 0], competition: "cup", round: "Round 1" },
  { id: "u1", start: "2026-11-21T18:30:00Z", home: "Northgate", away: "Harbour Town", competition: "league" },
  { id: "u2", start: "2026-11-28", home: "Lakeside", away: "Northgate", competition: "cup", round: "Quarter-final" },
  { id: "u3", start: "2026-12-05T14:00:00Z", home: "Northgate", away: "Hillcrest", competition: "league", status: "postponed" },
];
const competitions = [
  { id: "league", label: "League" },
  { id: "cup", label: "Cup" },
];

describe("fixtureOutcome", () => {
  it("reads the result from the side's point of view", () => {
    expect(fixtureOutcome(fixtures[0]!, "Northgate")).toBe("win");
    expect(fixtureOutcome(fixtures[0]!, "Riverside")).toBe("loss");
    expect(fixtureOutcome(fixtures[1]!, "Northgate")).toBe("draw");
    expect(fixtureOutcome(fixtures[2]!, "Northgate")).toBeUndefined();
    expect(fixtureOutcome(fixtures[0]!, "Lakeside")).toBeUndefined();
  });
});

describe("FixtureList", () => {
  it("lists upcoming matches in order with month rows, the next match and TBC times", async () => {
    const { container } = renderWithProviders(<FixtureList side="Northgate" fixtures={fixtures} competitions={competitions} caption="Northgate 2026" />, { timeZone: "UTC" });
    expect(screen.getByRole("tab", { name: /Upcoming/ })).toHaveAttribute("aria-selected", "true");
    const table = screen.getByRole("table", { name: "Northgate 2026 — Upcoming" });
    const rows = within(table).getAllByRole("row").filter((r) => r.hasAttribute("data-fixture"));
    expect(rows.map((r) => r.getAttribute("data-fixture"))).toEqual(["u1", "u2", "u3"]);
    expect(within(table).getByRole("rowheader", { name: "November 2026" })).toBeInTheDocument();
    expect(rows[0]).toHaveAttribute("data-highlighted");
    expect(rows[0]).toHaveTextContent("Next");
    expect(rows[0]).toHaveTextContent("6:30 PM");
    expect(rows[1]).toHaveTextContent("TBC");
    expect(within(rows[1]!).getByRole("img", { name: "Away" })).toBeInTheDocument();
    expect(rows[2]).toHaveTextContent("Postponed");
    expect(screen.getByText("3 matches shown")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  }, 15_000);

  it("switches to results with spoken scores and outcomes", async () => {
    const { user } = renderWithProviders(<FixtureList side="Northgate" fixtures={fixtures} competitions={competitions} />, { timeZone: "UTC" });
    screen.getByRole("tab", { name: /Upcoming/ }).focus();
    await user.keyboard(keys.right);
    expect(screen.getByRole("tab", { name: /Results/ })).toHaveAttribute("aria-selected", "true");
    const rows = screen.getAllByRole("row").filter((r) => r.hasAttribute("data-fixture"));
    expect(rows.map((r) => r.getAttribute("data-fixture"))).toEqual(["r2", "r1"]);
    expect(rows[1]).toHaveTextContent("Northgate 2, Riverside 1");
    expect(rows[1]).toHaveAttribute("data-outcome", "win");
    expect(within(rows[0]!).getByRole("img", { name: "Draw" })).toBeInTheDocument();
    expect(screen.getByText("2 matches shown")).toBeInTheDocument();
  });

  it("filters by competition and venue", async () => {
    const { user } = renderWithProviders(<FixtureList side="Northgate" fixtures={fixtures} competitions={competitions} />);
    await user.click(screen.getByRole("radio", { name: "Away" }).closest("button") ?? screen.getByRole("radio", { name: "Away" }));
    let ids = screen.getAllByRole("row").filter((r) => r.hasAttribute("data-fixture")).map((r) => r.getAttribute("data-fixture"));
    expect(ids).toEqual(["u2"]);
    await user.click(screen.getByRole("radio", { name: "All" }));
    await user.click(screen.getByRole("button", { name: "Cup" }));
    ids = screen.getAllByRole("row").filter((r) => r.hasAttribute("data-fixture")).map((r) => r.getAttribute("data-fixture"));
    expect(ids).toEqual(["u1", "u3"]);
    await user.click(screen.getByRole("button", { name: "League" }));
    expect(screen.getByText("No matches for this filter.")).toBeInTheDocument();
  });

  it("works without a side or filters, with actions and links", () => {
    const onView = vi.fn();
    renderWithProviders(
      <FixtureList
        fixtures={[{ id: "a", start: "2026-11-21T10:00:00Z", home: "Team Quark", away: "Team Lepton", href: "/matches/a" }]}
        groupByMonth={false}
        onViewChange={onView}
        renderActions={(m) => <button type="button">Remind me about {m.home}</button>}
      />,
    );
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.queryByRole("rowheader")).toBeNull();
    expect(screen.getByRole("link", { name: "Team Quark v Team Lepton" })).toHaveAttribute("href", "/matches/a");
    expect(screen.getByRole("button", { name: "Remind me about Team Quark" })).toBeInTheDocument();
    expect(screen.queryByText("Next")).toBeNull();
  });
});
