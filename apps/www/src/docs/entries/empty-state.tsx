import { ex, type DocEntry } from "../types";
import EmptyStateDemo from "../examples/empty-state/demo";
import EmptyStateNoResults from "../examples/empty-state/no-results";
import EmptyStateInTable from "../examples/empty-state/in-table";
import EmptyStateForbidden from "../examples/empty-state/forbidden";
import EmptyStateError from "../examples/empty-state/error";
import EmptyStateSizes from "../examples/empty-state/sizes";

const entry: DocEntry = {
  slug: "empty-state",
  title: "Empty state",
  group: "Overlays & feedback",
  description:
    "Points to the next step when a list is empty, a search finds nothing, access is denied or something failed. Five kinds with default icons and copy, three sizes, an illustration slot and a dashed frame. Server-compatible.",
  source: ["components/empty-state.tsx", "styles/overlays.css"],
  usage: `import { EmptyState, Button } from "@vamos-cms/ui";

<EmptyState
  title="No posts yet"
  description="Write your first post."
  actions={<Button variant="primary">Write a post</Button>}
/>`,
  demo: ex("demo", "First use", "empty-state/demo.tsx", EmptyStateDemo),
  examples: [
    ex("no-results", "No results (CRM)", "empty-state/no-results.tsx", EmptyStateNoResults, 'kind="no-results" is announced with role="status". Offer "Clear filters".'),
    ex("in-table", "Inside a table (HR)", "empty-state/in-table.tsx", EmptyStateInTable, "size=\"sm\" fits a table body or a card."),
    ex("forbidden", "No access", "empty-state/forbidden.tsx", EmptyStateForbidden, "Say who can grant access."),
    ex("error", "Error", "empty-state/error.tsx", EmptyStateError, 'kind="error" with a "Try again" action; framed draws the dashed border.'),
    ex("sizes", "Sizes", "empty-state/sizes.tsx", EmptyStateSizes, "sm for cards, md for page sections, lg for a whole page (display font title)."),
  ],
  api: [
    { name: "EmptyState", props: [
      { name: "kind", type: '"first-use" | "no-results" | "error" | "forbidden" | "done"', default: '"first-use"', description: "Default icon, tint and title (dictionary empty.*)." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "sm inside a table/card, md a page section, lg a full page." },
      { name: "title", type: "ReactNode", description: "Defaults to the kind's dictionary text." },
      { name: "description", type: "ReactNode", description: "Why it's empty and what to do." },
      { name: "actions", type: "ReactNode", description: "One primary next step, optionally a secondary one." },
      { name: "icon", type: "ReactNode | false", description: "Replace the kind's icon, or none." },
      { name: "illustration", type: "ReactNode", description: "A larger picture in place of the icon well." },
      { name: "framed", type: "boolean", default: "false", description: "Dashed frame — empty columns and drop zones." },
      { name: "as", type: '"h2" | "h3" | "h4" | "p"', default: '"h3"', description: "Title element — match the page outline." },
    ] },
    { name: "EmptyStateIcon / EmptyStateTitle / EmptyStateDescription / EmptyStateActions", props: [
      { name: "className", type: "string", description: "Parts for a custom arrangement. Title and Description take size; Title takes as." },
    ] },
  ],
  covers: ["Empty state"],
};

export default entry;
