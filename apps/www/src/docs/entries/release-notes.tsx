import { ex, type DocEntry } from "../types";
import ReleaseNotesDemo from "../examples/release-notes/demo";
import ReleaseNotesGrouped from "../examples/release-notes/grouped";
import ReleaseNotesFilter from "../examples/release-notes/filter";
import ReleaseNotesCustomTypes from "../examples/release-notes/custom-types";

const entry: DocEntry = {
  slug: "release-notes",
  title: "Release notes",
  group: "Data display",
  description:
    "A changelog: one entry per release with a date and version rail that sticks beside it on wide containers, a change-type tag on every change (added, changed, fixed, removed, deprecated, security — or your own) and a linkable anchor per release. Optionally grouped by type or filtered.",
  source: ["components/release-notes.tsx"],
  basedOn: "Native <ol> / <article> + Keep a Changelog types",
  usage: `import { ReleaseNotes } from "@vamos-ui/react";

<ReleaseNotes releases={[
  { version: "3.8.0", date: "2026-11-10", title: "Saved views", changes: [
    { type: "added", title: "Save any filtered list as a view" },
    { type: "fixed", title: "Export kept the previous column order" },
  ] },
]} />`,
  demo: ex("demo", "Changelog", "release-notes/demo.tsx", ReleaseNotesDemo),
  examples: [
    ex("grouped", "Grouped by type", "release-notes/grouped.tsx", ReleaseNotesGrouped, "groupBy=\"type\" puts a sub-heading per type, Keep a Changelog style."),
    ex("filter", "Type filter", "release-notes/filter.tsx", ReleaseNotesFilter, "filter shows a toggle per type with counts; the number of releases shown is announced politely. anchorPrefix changes the ids."),
    ex("custom-types", "Your own types", "release-notes/custom-types.tsx", ReleaseNotesCustomTypes, "types maps your keys to a label and a Badge tone; href adds a link to the full notes."),
  ],
  api: [
    { name: "ReleaseNotes", props: [
      { name: "releases", type: "Release[]", description: "Newest first." },
      { name: "types", type: "Record<string, { label?: string; tone?: BadgeTone }>", description: "Change types, merged over the six defaults. Key order is tag and filter order." },
      { name: "groupBy", type: '"none" | "type"', default: '"none"', description: "One tagged list, or a sub-heading per type." },
      { name: "filter / defaultTypes", type: "boolean / string[]", default: "false / all", description: "Type filter above the list." },
      { name: "headingLevel", type: "2 | 3", default: "2", description: "Release heading level; type sub-headings are one below." },
      { name: "dateFormat", type: "DatePreset | Intl.DateTimeFormatOptions", default: '"long"', description: "Rail date." },
      { name: "anchors / anchorPrefix", type: "boolean / string", default: 'true / "v"', description: "\"#\" link per release; ids via releaseAnchor(version, prefix)." },
      { name: "stickyRail / stickyTop", type: "boolean / string", default: 'true / "1rem"', description: "Rail sticks beside its release on wide containers; stickyTop clears a fixed navbar (also the scroll margin)." },
      { name: "labels", type: "Partial<ReleaseNotesLabels>", description: 'Dictionary namespace "releaseNotes": type names, version, anchor, filter, shown, empty, readMore.' },
    ] },
    { name: "Release", props: [
      { name: "version / date", type: "string", description: "\"3.8.0\" (shown as v3.8.0) and YYYY-MM-DD." },
      { name: "title / summary", type: "ReactNode", description: "Headline (default: the version) and lead." },
      { name: "changes", type: "{ type; title; description? }[]", description: "The changes." },
      { name: "href", type: "string", description: "Full notes — adds a \"Read the v… notes\" link." },
      { name: "id", type: "string", description: "Anchor id override." },
    ] },
  ],
  notes: [
    "Type tags are words, not just colour; the tone only reinforces them.",
    "The layout switches to the rail at a 42rem container width (container query), so it works in a narrow column too.",
  ],
  covers: [],
};

export default entry;
