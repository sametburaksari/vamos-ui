import { ex, type DocEntry } from "../types";
import CardDemo from "../examples/card/demo";
import CardStat from "../examples/card/stat";

const entry: DocEntry = {
  slug: "card",
  title: "Card",
  group: "Data display",
  description: "The main content surface. Takes its glass or solid material from tokens; built from Header, Body, Footer and Inset parts.",
  source: ["components/card.tsx"],
  usage: `import { Card, CardHeader, CardBody } from "@vamos-cms/ui";

<Card>
<CardHeader title="Traffic" description="Last 30 days" />
<CardBody>…</CardBody>
</Card>`,
  demo: ex("demo", "Demo", "card/demo.tsx", CardDemo),
  examples: [ex("stat", "Stat card", "card/stat.tsx", CardStat, "Numbers use the mono font with tabular figures.")],
  api: [
    { name: "CardHeader", props: [
      { name: "title", type: "ReactNode", description: "Title." },
      { name: "description", type: "ReactNode", description: "Subtitle." },
      { name: "action", type: "ReactNode", description: "Action slot at the top end." },
    ] },
    { name: "Card / CardBody / CardFooter / Inset", props: [{ name: "...props", type: "HTMLAttributes<div>", description: "Native div attributes." }] },
  ],
  covers: ["Card"],
};

export default entry;
