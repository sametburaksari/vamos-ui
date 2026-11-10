import { ex, type DocEntry } from "../types";
import Demo from "../examples/team/demo";
import ListHover from "../examples/team/list-hover";
import FeatureFounder from "../examples/team/feature-founder";

const entry: DocEntry = {
  slug: "team",
  title: "Team",
  group: "Site blocks",
  description:
    "Team and specialist introductions — spa therapists, clinic doctors, an agency team. Card-less: 4:5 portraits with a name and a small mono role, a typographic list with a hover portrait, or a founder feature with the name set like a signature. Honorifics (“Dr.”, “Op. Dr.”) are a separate field because their order varies by locale. Profile links are short text links, never rows of social icons.",
  source: ["blocks/site/team.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  usage: `import { Team } from "@vamos-cms/ui/blocks";

<Team
  title="Hands you can *trust*"
  members={[
    { name: "Elif Aydın", role: "Lead therapist", photo: { src, alt, width: 800, height: 1000 } },
    { name: "Selin Öztürk", title: "Dr.", role: "Dermatologist", links: [{ network: "linkedin", href: "…" }] },
  ]}
/>`,
  demo: ex("demo", "Portrait (spa therapists)", "team/demo.tsx", Demo),
  examples: [
    ex("list-hover", "List with hover portrait (clinic)", "team/list-hover.tsx", ListHover, "Name · role · specialty rows; on wide screens a decorative portrait appears on hover (CSS only); phones get a small leading portrait."),
    ex("feature-founder", "Feature (founder)", "team/feature-founder.tsx", FeatureFounder, "5/7 layout, long bio (blank line = new paragraph), signature-style name. One member always renders as feature."),
  ],
  api: [
    {
      name: "Team",
      props: [
        { name: "variant", type: '"portrait" | "list" | "feature"', default: '"portrait"', description: "Layout." },
        { name: "members", type: "TeamMember[]", description: "{ name, title?, role, specialty?, photo?, bio?, links? }. No photo = an empty inset area, never initials." },
        { name: "members[].links", type: "{ network: SocialNetwork; href }[]", description: "Up to 3, rendered as text (“LinkedIn”) with an aria-label “Elif Aydın on LinkedIn”." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header (split alignment in portrait)." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "profileOf template." },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
  ],
  covers: ["Team"],
};

export default entry;
