import type { Fixture } from "@vamos-ui/react";

export const competitions = [
  { id: "league", label: "North League", short: "League" },
  { id: "cup", label: "District Cup", short: "Cup" },
];

export const fixtures: Fixture[] = [
  { id: "f1", start: "2026-10-04T13:00:00Z", home: "Northgate", away: "Riverside", score: [2, 1], competition: "league", round: "Round 7", venue: "North Park", details: "Okafor 12′, Lind 77′" },
  { id: "f2", start: "2026-10-11T13:00:00Z", home: "Hillcrest", away: "Northgate", score: [0, 0], competition: "league", round: "Round 8", venue: "Hill Lane" },
  { id: "f3", start: "2026-10-18T17:30:00Z", home: "Northgate", away: "Lakeside", score: [1, 3], competition: "cup", round: "Round 2", venue: "North Park" },
  { id: "f4", start: "2026-11-01T14:00:00Z", home: "Harbour Town", away: "Northgate", score: [1, 2], competition: "league", round: "Round 9", venue: "Quay Road" },
  { id: "f5", start: "2026-11-22T14:00:00Z", home: "Northgate", away: "Elmwood", competition: "league", round: "Round 10", venue: "North Park" },
  { id: "f6", start: "2026-11-29", home: "Stonebridge", away: "Northgate", competition: "cup", round: "Quarter-final", venue: "Bridge Ground" },
  { id: "f7", start: "2026-12-06T14:00:00Z", home: "Northgate", away: "Westfield", competition: "league", round: "Round 11", venue: "North Park", status: "postponed" },
  { id: "f8", start: "2027-01-10T14:00:00Z", home: "Riverside", away: "Northgate", competition: "league", round: "Round 12", venue: "Mill Field" },
];
