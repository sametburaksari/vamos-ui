import { ReviewScore } from "@vamos-ui/react/blocks";

// Percent and star displays, a book and a watch, each with an action.
export default function ReviewScoreCompact() {
  return (
    <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
      <ReviewScore
        display="percent"
        score={91}
        max={100}
        title="Field Notes on Clay"
        headingLevel={3}
        scoreLabel="A new standard text"
        verdict="Clear enough for a first class, deep enough to keep on the studio shelf."
        item={{ name: "Field Notes on Clay, 2nd edition", type: "Book" }}
        action={<a className="text-small font-medium text-accent-ink underline underline-offset-4" href="#buy">See editions</a>}
      />
      <ReviewScore
        display="stars"
        score={4}
        max={5}
        title="Atlas field watch"
        headingLevel={3}
        pros={["Legible at a glance", "100 m water resistance"]}
        cons={["Strap runs short"]}
        item={{ name: "Meridian Works Atlas 38", brand: "Meridian Works" }}
      />
    </div>
  );
}
