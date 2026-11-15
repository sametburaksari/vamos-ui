import { ex, type DocEntry } from "../types";
import FixtureListDemo from "../examples/fixture-list/demo";
import FixtureListResults from "../examples/fixture-list/results";
import FixtureListEsports from "../examples/fixture-list/esports";

const entry: DocEntry = {
  slug: "fixture-list",
  title: "Fixture list",
  group: "Data display",
  description:
    "Upcoming matches and results between two sides, for any head-to-head competition — a sports club, an esports series, a chess or debating league. Upcoming / Results tabs with counts, an optional competition and home/away filter, month rows, the next match marked, statuses (live, postponed, cancelled) and scores read as full sentences.",
  source: ["components/fixture-list.tsx", "components/standings-table.tsx"],
  basedOn: "WAI-ARIA Tabs + HTML table",
  usage: `import { FixtureList } from "@vamos-ui/react";

<FixtureList
  side="Northgate"
  fixtures={matches}
  competitions={[{ id: "league", label: "North League" }, { id: "cup", label: "District Cup" }]}
  renderActions={(m) => <AddToCalendar match={m} />}
/>`,
  demo: ex("demo", "Demo", "fixture-list/demo.tsx", FixtureListDemo),
  examples: [
    ex("results", "Results first", "fixture-list/results.tsx", FixtureListResults, "defaultView=\"results\": newest first, each score with the outcome square from your side's point of view."),
    ex("esports", "No own side (a series schedule)", "fixture-list/esports.tsx", FixtureListEsports, "Without side there is no home/away filter or outcome; tags, links and a per-row action still work."),
  ],
  api: [
    { name: "FixtureList", props: [
      { name: "fixtures", type: "Fixture[]", description: "{ id, start, home, away, score?, status?, competition?, round?, venue?, details?, tags?, href? }. start is an instant, or \"YYYY-MM-DD\" when the time is not fixed (shows TBC)." },
      { name: "competitions", type: "{ id, label, short? }[]", description: "Competition names; two or more add a multi-select filter." },
      { name: "side", type: "string", description: "Your own side: home/away filter and tags, outcome squares on results, the next match marked." },
      { name: "view / defaultView / onViewChange", type: '"upcoming" | "results"', default: '"upcoming"', description: "Selected tab, controlled or not." },
      { name: "groupByMonth", type: "boolean", default: "true", description: "Month header rows (locale-formatted)." },
      { name: "filters", type: "boolean", default: "true", description: "Show the filter bar." },
      { name: "renderActions", type: "(fixture) => ReactNode", description: "Trailing cell per match (calendar, tickets, reminders)." },
      { name: "caption", type: "string", description: "Names the tables for screen readers (\"… — Upcoming\")." },
      { name: "labels", type: "Partial<FixtureListLabels>", description: 'Dictionary namespace "fixtureList": tab names, filter names, home/away, versus, scoreSpoken, timeTbc, statuses, empty, shown.' },
      { name: "formLabels", type: "Partial<FormGuideLabels>", description: "Outcome names (formGuide namespace)." },
    ] },
    { name: "fixtureOutcome(fixture, side)", props: [
      { name: "returns", type: '"win" | "draw" | "loss" | undefined', description: "The result from one side's point of view." },
    ] },
  ],
  notes: [
    "A score without a status counts as finished; live, postponed and cancelled matches stay under Upcoming with a badge.",
    "Dates and times use the locale formatter and its time zone — set timeZone on LocaleProvider to show local kick-off times.",
    "The visible score is \"2–1\"; screen readers hear \"Northgate 2, Riverside 1\". The filter result count is announced politely.",
  ],
  covers: [],
};

export default entry;
