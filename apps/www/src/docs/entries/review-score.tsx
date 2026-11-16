import { ex, type DocEntry } from "../types";
import Demo from "../examples/review-score/demo";
import Compact from "../examples/review-score/compact";

const entry: DocEntry = {
  slug: "review-score",
  title: "Review score",
  group: "Site blocks",
  description:
    "The summary box of a review article: overall score as points, percent or stars with a word beside it, score bars per criterion, pros and cons, the verdict, the reviewer and the readers' rating. A named <section>; the bars are decorative and every score is also in text. With an item it emits schema.org Review JSON-LD: reviewRating, author, date, reviewBody, pros and cons as positiveNotes / negativeNotes, and the item's aggregateRating.",
  source: ["blocks/site/review-score.tsx", "styles/commerce.css", "blocks/site/registry-news.ts"],
  basedOn: "Server component + JSON-LD",
  usage: `import { ReviewScore } from "@vamos-ui/react/blocks";

<ReviewScore
  score={8.6}
  scoreLabel="Excellent"
  criteria={[{ label: "Sound", score: 9.2 }, { label: "Battery", score: 7.8 }]}
  pros={["Warm, detailed mids"]}
  cons={["No hard case"]}
  verdict="The pair to beat under $200."
  aggregateRating={{ value: 4.4, count: 312 }}
  item={{ name: "Arden H2 wireless headphones", brand: "Arden" }}
/>`,
  demo: ex("demo", "Headphones review (points)", "review-score/demo.tsx", Demo),
  examples: [ex("compact", "Percent and stars", "review-score/compact.tsx", Compact, "A book scored 91/100 with an action, a watch scored 4/5 as stars. headingLevel={3} inside an article section.")],
  api: [
    {
      name: "ReviewScore",
      props: [
        { name: "score / max", type: "number / number", default: "— / 10", description: "Overall score and scale; criteria use the same scale." },
        { name: "display", type: '"points" | "percent" | "stars"', default: '"points"', description: "8.6 / 10, 86%, or five stars." },
        { name: "title / headingLevel / scoreLabel", type: "ReactNode / 2 | 3 | 4 / ReactNode", default: "“Our score” / 2", description: "Box heading and a word beside the score." },
        { name: "criteria", type: "{ label: string; score: number }[]", description: "One bar per criterion." },
        { name: "pros / cons", type: "ReactNode[]", description: "Check and minus lists. String items reach the JSON-LD." },
        { name: "verdict / reviewer / datePublished", type: "ReactNode / { name; url? } / string", description: "Bottom line, author, `YYYY-MM-DD`." },
        { name: "aggregateRating", type: "{ value; count; best? }", description: "Readers' rating under the score and in the JSON-LD." },
        { name: "item / jsonLd", type: "{ name; type?; brand?; image?; url? } / boolean", default: "— / true", description: "What was reviewed; JSON-LD is emitted when item is set." },
        { name: "action", type: "ReactNode", description: "A link or button under the verdict." },
        { name: "labels / locale / id / className", type: "Partial<CommerceLabels> / string / string / string", description: "Strings, number format, anchor id." },
      ],
    },
    { name: "reviewJsonLd(input)", props: [{ name: "input", type: "ReviewJsonLdInput", description: "The same fields; returns the Review node for <JsonLd />." }] },
  ],
  covers: ["Review score box"],
};

export default entry;
