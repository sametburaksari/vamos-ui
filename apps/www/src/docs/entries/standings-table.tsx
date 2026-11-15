import { ex, type DocEntry } from "../types";
import StandingsTableDemo from "../examples/standings-table/demo";
import StandingsTableCompact from "../examples/standings-table/compact";
import StandingsTableCustomColumns from "../examples/standings-table/custom-columns";

const entry: DocEntry = {
  slug: "standings-table",
  title: "Standings table",
  group: "Data display",
  description:
    "A ranking table for any league or ladder — sports, esports, quiz nights, debating, sales contests. Position, side, played / won / drawn / lost, score difference and points by default, with configurable columns, your own side highlighted, promotion or play-off lines with a legend, a compact top-N view and an optional form guide.",
  source: ["components/standings-table.tsx"],
  basedOn: "HTML table with row headers",
  usage: `import { StandingsTable } from "@vamos-ui/react";

<StandingsTable
  caption="North League after round 9"
  rows={rows}
  highlight="northgate"
  zones={[{ after: 2, label: "Promotion" }, { after: 7, label: "Relegation", tone: "muted" }]}
/>`,
  demo: ex("demo", "Demo", "standings-table/demo.tsx", StandingsTableDemo),
  examples: [
    ex("compact", "Compact (top three + your row)", "standings-table/compact.tsx", StandingsTableCompact, "limit keeps the top rows and the highlighted side, with a dashed gap rule; fits a sidebar or a home page."),
    ex("custom-columns", "Custom columns", "standings-table/custom-columns.tsx", StandingsTableCustomColumns, "Built-in keys mixed with your own column definitions; points passed directly."),
  ],
  api: [
    { name: "StandingsTable", props: [
      { name: "rows", type: "StandingRow[]", description: "In ranked order: { id?, side, position?, played?, won?, drawn?, lost?, for?, against?, points?, form?, …your own fields }." },
      { name: "caption", type: "string", description: "Names the table (visually hidden)." },
      { name: "columns", type: "(StandingsColumnKey | StandingsColumn)[]", default: '["played", "won", "drawn", "lost", "difference", "points"]', description: "Keys: played, won, drawn, lost, for, against, score (F:A), difference, points — or { key, label, short?, value(row), numeric?, hideBelow? }." },
      { name: "highlight", type: "string", description: "Row id (or string side) to emphasise; gets aria-current and a spoken \"your team\"." },
      { name: "zones", type: "{ after, label, tone? }[]", description: "A rule under a position plus a legend entry (accent solid or muted dashed)." },
      { name: "limit", type: "number", description: "Top N rows plus the highlighted row." },
      { name: "showForm", type: "boolean", description: "Form guide column (lg and up). Default: when any row has form." },
      { name: "pointsPerWin / pointsPerDraw", type: "number", default: "3 / 1", description: "Used when a row has no points." },
      { name: "labels", type: "Partial<StandingsTableLabels>", description: 'Dictionary namespace "standingsTable": column names and short forms, side, form, current.' },
      { name: "…Table props", type: "TableProps", description: "density, striped, stickyHeader, bordered …" },
    ] },
    { name: "FormGuide", props: [
      { name: "form", type: '("win" | "draw" | "loss")[]', description: "Oldest first. role=\"img\" named \"Form: Win, Draw, Loss\"; letters visible, so colour is not the only signal." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Square size." },
      { name: "labels", type: "Partial<FormGuideLabels>", description: 'Namespace "formGuide": win, draw, loss, their short letters, form.' },
    ] },
  ],
  notes: [
    "Short headers (P, W, D, L, Pts) are visible; screen readers hear the full column names.",
    "Numbers use the locale formatter; negative differences use a true minus sign.",
  ],
  covers: [],
};

export default entry;
