import { StandingsTable } from "@vamos-ui/react";
import { standings } from "./data";

export default function StandingsTableCompact() {
  return (
    <div className="w-full max-w-sm">
      <StandingsTable caption="North League, top three and Harbour Town" rows={standings} highlight="harbour" limit={3} columns={["played", "difference", "points"]} showForm={false} density="compact" />
    </div>
  );
}
