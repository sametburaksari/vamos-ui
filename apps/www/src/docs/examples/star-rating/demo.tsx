import { StarRating } from "@vamos-ui/react/blocks";

// Read-only: one image named "Rated 4.6 out of 5", half stars, average and review count.
export default function StarRatingDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <StarRating value={4.6} showValue count={128} countHref="#reviews" size="lg" />
      <StarRating value={4.5} count={52} />
      <StarRating value={3.2} step={0.1} showValue size="sm" />
    </div>
  );
}
