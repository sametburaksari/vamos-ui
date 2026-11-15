"use client";

import { Badge, FixtureList, IconButton, type Fixture } from "@vamos-ui/react";
import { BellPlus } from "lucide-react";

const matches: Fixture[] = [
  { id: "m1", start: "2026-11-20T18:00:00Z", home: "Team Quark", away: "Team Lepton", status: "live", round: "Group B", href: "#m1", tags: <Badge tone="outline" size="sm">Best of 3</Badge> },
  { id: "m2", start: "2026-11-20T20:30:00Z", home: "Team Boson", away: "Team Gluon", round: "Group B", href: "#m2" },
  { id: "m3", start: "2026-11-21T18:00:00Z", home: "Team Muon", away: "Team Quark", round: "Group B", href: "#m3" },
  { id: "m4", start: "2026-11-19T18:00:00Z", home: "Team Gluon", away: "Team Muon", score: [2, 1], round: "Group B", details: "Maps: 13–9, 11–13, 13–7" },
];

export default function FixtureListEsports() {
  return (
    <div className="w-full max-w-3xl">
      <FixtureList
        fixtures={matches}
        groupByMonth={false}
        caption="Winter series"
        labels={{ versus: "vs" }}
        renderActions={(m) =>
          m.score ? null : (
            <IconButton size="sm" variant="ghost" label={`Remind me: ${m.home} vs ${m.away}`}>
              <BellPlus />
            </IconButton>
          )
        }
      />
    </div>
  );
}
