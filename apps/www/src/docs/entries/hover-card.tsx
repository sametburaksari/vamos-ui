import { ex, type DocEntry } from "../types";
import HoverCardDemo from "../examples/hover-card/demo";
import HoverCardEntity from "../examples/hover-card/entity";
import HoverCardMention from "../examples/hover-card/mention";

const entry: DocEntry = {
  slug: "hover-card",
  title: "Hover Card",
  group: "Overlays & feedback",
  description: "A rich preview when the pointer rests on a name or link: an author, a CRM contact, an @mention. Extra information for mouse users only.",
  source: ["components/hover-card.tsx", "lib/floating-arrow.tsx"],
  basedOn: "Radix Hover Card",
  usage: `import { HoverCard, HoverCardTrigger, HoverCardContent } from "@vamos-ui/react";

<HoverCard>
  <HoverCardTrigger href="/contacts/482">Amelia Hart</HoverCardTrigger>
  <HoverCardContent>…</HoverCardContent>
</HoverCard>`,
  demo: ex("demo", "Demo", "hover-card/demo.tsx", HoverCardDemo),
  examples: [
    ex("entity", "Entity preview with loading", "hover-card/entity.tsx", HoverCardEntity, "Fetch on first open in onOpenChange and show Skeleton meanwhile — a CRM contact card."),
    ex("mention", "Mentions in a comment", "hover-card/mention.tsx", HoverCardMention, "Shorter delay and an arrow for @mentions in an HR comment thread."),
  ],
  api: [
    { name: "HoverCard", props: [
      { name: "openDelay", type: "number", default: "500", description: "Hover time before it opens (ms)." },
      { name: "closeDelay", type: "number", default: "150", description: "Time before it closes after the pointer leaves (ms)." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Controlled or uncontrolled. Fetch data in onOpenChange." },
    ] },
    { name: "HoverCardTrigger", props: [
      { name: "href", type: "string", description: "Renders an <a>. Use asChild for a router Link." },
      { name: "asChild", type: "boolean", default: "false", description: "Merge onto your own element." },
    ] },
    { name: "HoverCardContent", props: [
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Width: 256 or 320 px." },
      { name: "arrow", type: "boolean", default: "false", description: "Pointer arrow." },
      { name: "side / align", type: "Radix placement", default: '"bottom" / "center"', description: "Preferred placement; flips on collision." },
      { name: "sideOffset", type: "number", default: "8", description: "Gap to the trigger in px." },
    ] },
  ],
  notes: [
    "Hover cards don't open from the keyboard or on touch. The same details must be reachable on the link target (the contact page, the author page).",
    "Don't put actions that exist nowhere else inside a hover card; use Popover for interactive content.",
  ],
  covers: ["Hover Card"],
};

export default entry;
