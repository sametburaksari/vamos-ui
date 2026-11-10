import { ex, type DocEntry } from "../types";
import CardDemo from "../examples/card/demo";
import CardStat from "../examples/card/stat";
import CardComposition from "../examples/card/composition";
import CardVariants from "../examples/card/variants";
import CardInteractiveLink from "../examples/card/interactive-link";
import CardLoading from "../examples/card/loading";
import CardNestedInset from "../examples/card/nested-inset";

const entry: DocEntry = {
  slug: "card",
  title: "Card",
  group: "Data display",
  description:
    "The main content surface. Takes its glass or solid material from tokens and its spacing from --gap; built from Header, Body, Footer and Inset parts, or composed CardTitle / CardDescription / CardAction.",
  source: ["components/card.tsx"],
  basedOn: "Radix Slot",
  usage: `import { Card, CardHeader, CardBody } from "@vamos-ui/react";

<Card>
  <CardHeader title="Traffic" description="Last 30 days" />
  <CardBody>…</CardBody>
</Card>`,
  demo: ex("demo", "Demo", "card/demo.tsx", CardDemo),
  examples: [
    ex("stat", "Stat card", "card/stat.tsx", CardStat, "Numbers use the mono font with tabular figures."),
    ex("composition", "Composed header (HR)", "card/composition.tsx", CardComposition, 'as="section" + aria-labelledby on the CardTitle id makes the card a named region.'),
    ex("variants", "Variants", "card/variants.tsx", CardVariants, "surface, outline, ghost and inset; padding=\"md\" pads the card itself."),
    ex("interactive-link", "Whole-card link (CRM)", "card/interactive-link.tsx", CardInteractiveLink, "asChild + interactive: the card is the link. Keep exactly one interactive element inside."),
    ex("loading", "Loading", "card/loading.tsx", CardLoading, "Card loading sets aria-busy; CardBody loading shows a text skeleton while the header stays."),
    ex("nested-inset", "Nesting in glass", "card/nested-inset.tsx", CardNestedInset, "Nest with Inset or variant=\"inset\" — never a second blurred surface."),
  ],
  api: [
    { name: "Card", props: [
      { name: "variant", type: '"surface" | "outline" | "ghost" | "inset"', default: '"surface"', description: "Surface material, hairline, none, or nested tile." },
      { name: "padding", type: '"none" | "sm" | "md"', default: '"none"', description: "Pad the card itself (parts bring their own padding)." },
      { name: "interactive", type: "boolean", default: "false", description: "Hover border, pointer, focus ring." },
      { name: "asChild", type: "boolean", default: "false", description: "Merge onto the child, e.g. a Link." },
      { name: "as", type: '"div" | "section" | "article" | "aside" | "li"', default: '"div"', description: "Semantic element." },
      { name: "loading", type: "boolean", default: "false", description: "aria-busy." },
      { name: "selected", type: "boolean", default: "false", description: "Selected state (data-selected, accent border)." },
    ] },
    { name: "CardHeader", props: [
      { name: "eyebrow", type: "ReactNode", description: "Small mono line above the title (no CSS uppercase)." },
      { name: "title", type: "ReactNode", description: "Title." },
      { name: "description", type: "ReactNode", description: "Subtitle." },
      { name: "action", type: "ReactNode", description: "Action slot at the top end." },
      { name: "titleAs", type: '"h2" | "h3" | "h4"', default: '"h3"', description: "Heading level." },
      { name: "titleId", type: "string", description: "Id for aria-labelledby." },
      { name: "divider", type: "boolean", default: "false", description: "Hairline under the header." },
    ] },
    { name: "CardBody", props: [
      { name: "loading", type: "boolean", default: "false", description: "Replace content with a text skeleton." },
      { name: "loadingLines", type: "number", default: "3", description: "Skeleton lines." },
    ] },
    { name: "CardTitle / CardDescription / CardAction / CardEyebrow / CardFooter / Inset", props: [
      { name: "as (CardTitle)", type: '"h2" | "h3" | "h4" | "p"', default: '"h3"', description: "Heading level of a composed title." },
      { name: "...props", type: "HTMLAttributes", description: "Native attributes." },
    ] },
  ],
  covers: ["Card"],
};

export default entry;
