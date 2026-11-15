import { ex, type DocEntry } from "../types";
import Demo from "../examples/ad-slot/demo";
import Sizes from "../examples/ad-slot/sizes";

const entry: DocEntry = {
  slug: "ad-slot",
  title: "Ad slot",
  group: "Site blocks",
  description:
    "A labelled advertising slot (“Advertisement” / “Reklam”). The box is reserved at its final ratio before anything loads, so the page never jumps (no CLS), and it scales down with its column. The ad markup renders — and onReady, the hook point for an ad server, fires — only after the visitor grants the consent category (marketing by default, read from the kit ConsentBanner cookie and updated live). House ads that track nothing pass consent={false}. An aside landmark named by its label.",
  source: ["blocks/site/ad-slot.tsx", "blocks/site/shared/news.tsx", "blocks/site/shared/consent.ts", "styles/blocks.css"],
  usage: `import { AdSlot } from "@vamos-ui/react/blocks";

<AdSlot size="leaderboard" mobileSize="mobile-banner" slotId="div-gpt-home-top"
  onReady={(el) => googletag.cmd.push(() => googletag.display(el.id))} />

<AdSlot size="rectangle" consent={false}><HouseAd /></AdSlot>`,
  demo: ex("demo", "Consent-gated leaderboard", "ad-slot/demo.tsx", Demo),
  examples: [ex("sizes", "Reserved sizes", "ad-slot/sizes.tsx", Sizes, "IAB names (AD_SIZES) or { width, height }. Empty slots show their size in a quiet hatched box.")],
  api: [
    {
      name: "AdSlot",
      props: [
        { name: "size", type: "AdSize", default: '"rectangle"', description: "leaderboard 728×90 · billboard 970×250 · large-leaderboard 970×90 · rectangle 300×250 · half-page 300×600 · skyscraper 160×600 · mobile-banner 320×50 · large-mobile-banner 320×100 · { width, height }." },
        { name: "mobileSize", type: "AdSize", description: "Box below a 40rem container." },
        { name: "children", type: "ReactNode", description: "The creative; rendered only with consent." },
        { name: "consent", type: 'ConsentCategory | false', default: '"marketing"', description: "Category that must be granted. false: house ads." },
        { name: "consentVersion", type: "number", description: "Older stored answers don't count." },
        { name: "onReady", type: "(el) => void | cleanup", description: "Runs once consent is granted, with the inner element (id = slotId)." },
        { name: "slotId", type: "string", description: "Id of the inner element ad servers target." },
        { name: "placeholder", type: "ReactNode", description: "Shown in the empty box." },
        { name: "label", type: "ReactNode | false", default: '"Advertisement"', description: "Visible label above the box (keep it; ads must be recognisable)." },
        { name: "center", type: "boolean", default: "true", description: "Centre in the column." },
      ],
    },
  ],
  covers: ["Ad slot"],
};

export default entry;
