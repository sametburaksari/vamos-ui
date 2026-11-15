import { ReviewScore } from "@vamos-ui/react/blocks";

// Score, criteria bars, pros and cons, verdict, readers' rating and Review JSON-LD.
export default function ReviewScoreDemo() {
  return (
    <div className="w-full max-w-3xl">
      <ReviewScore
        score={8.6}
        scoreLabel="Excellent"
        criteria={[
          { label: "Sound", score: 9.2 },
          { label: "Comfort", score: 8.4 },
          { label: "Battery", score: 7.8 },
          { label: "Build", score: 8.9 },
        ]}
        pros={["Warm, detailed mids", "Folds flat into a slim pouch", "Thirty hours on one charge"]}
        cons={["No hard case in the box", "Touch controls are easy to brush"]}
        verdict="The Arden H2 is the pair to beat under $200: rich sound, light on the head, and a battery that outlasts a long-haul flight."
        reviewer={{ name: "Mara Ellison" }}
        datePublished="2026-11-02"
        aggregateRating={{ value: 4.4, count: 312 }}
        item={{ name: "Arden H2 wireless headphones", brand: "Arden" }}
      />
    </div>
  );
}
