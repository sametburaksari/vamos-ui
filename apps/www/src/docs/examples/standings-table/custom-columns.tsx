import { StandingsTable, type StandingRow } from "@vamos-ui/react";

// A debating ladder: no draws, ballots instead of goals, points given directly.
const ladder: StandingRow[] = [
  { side: "Meridian Society", played: 6, won: 5, lost: 1, ballots: 15, points: 10 },
  { side: "Oak Hall", played: 6, won: 4, lost: 2, ballots: 13, points: 8 },
  { side: "Granite Union", played: 6, won: 2, lost: 4, ballots: 8, points: 4 },
  { side: "Fernside", played: 6, won: 1, lost: 5, ballots: 5, points: 2 },
];

export default function StandingsTableCustomColumns() {
  return (
    <div className="w-full max-w-xl">
      <StandingsTable
        caption="Autumn debating ladder"
        rows={ladder}
        labels={{ side: "Society" }}
        columns={["played", "won", "lost", { key: "ballots", label: "Ballots won", short: "Ballots", numeric: true, value: (r) => String(r.ballots) }, "points"]}
      />
    </div>
  );
}
