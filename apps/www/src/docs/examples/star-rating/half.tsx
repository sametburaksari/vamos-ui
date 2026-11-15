import { StarRatingInput } from "@vamos-ui/react/blocks";

// allowHalf: two radios per star (start and end half), named "3.5 stars". Sizes sm / md / lg.
export default function StarRatingHalf() {
  return (
    <div className="flex flex-col gap-6">
      <StarRatingInput name="sound" label="Sound" allowHalf defaultValue={3.5} size="lg" />
      <StarRatingInput name="comfort" label="Comfort" defaultValue={4} size="sm" />
      <StarRatingInput name="build" label="Build quality (locked)" defaultValue={2} disabled />
    </div>
  );
}
