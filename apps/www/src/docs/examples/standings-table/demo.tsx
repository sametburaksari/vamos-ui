import { StandingsTable } from "@vamos-ui/react";
import { standings } from "./data";

export default function StandingsTableDemo() {
  return (
    <div className="w-full max-w-3xl">
      <StandingsTable
        caption="North League after round 9"
        rows={standings}
        highlight="northgate"
        columns={["played", "won", "drawn", "lost", "score", "difference", "points"]}
        zones={[
          { after: 2, label: "Promotion" },
          { after: 7, label: "Relegation", tone: "muted" },
        ]}
      />
    </div>
  );
}
