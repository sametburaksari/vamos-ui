import { ex, type DocEntry } from "../types";
import Demo from "../examples/star-rating/demo";
import Input from "../examples/star-rating/input";
import Half from "../examples/star-rating/half";
import Locales from "../examples/star-rating/locales";

const entry: DocEntry = {
  slug: "star-rating",
  title: "Star rating",
  group: "Site blocks",
  description:
    "Stars for ratings. StarRating shows a value read-only: one role=\"img\" named “Rated 4.5 out of 5”, half (or tenth) fills that start from the inline start, an optional average and review count (as a link to the reviews). StarRatingInput asks for one: a native radio group in a fieldset with a legend, one tab stop and arrow keys, every radio named (“4 stars”, “4.5 stars” with half steps), and it posts with the form. Hover and checked fills are CSS; there is no JS unless you pass onValueChange.",
  source: ["blocks/site/star-rating.tsx", "styles/commerce.css"],
  basedOn: "Native radios + :has()",
  usage: `import { StarRating, StarRatingInput } from "@vamos-ui/react/blocks";

<StarRating value={4.6} showValue count={128} countHref="#reviews" />

<form action={saveReview}>
  <StarRatingInput name="rating" label="How would you rate it?" allowHalf required />
</form>`,
  demo: ex("demo", "Display: average, count, sizes", "star-rating/demo.tsx", Demo),
  examples: [
    ex("input", "Input (controlled)", "star-rating/input.tsx", Input, "value + onValueChange; the legend is the question, the description sits under it."),
    ex("half", "Half steps, sizes, disabled", "star-rating/half.tsx", Half, "allowHalf puts two radios on each star. Uncontrolled with defaultValue; disabled disables the fieldset."),
    ex("locales", "Turkish, German, Arabic (RTL)", "star-rating/locales.tsx", Locales, "commerceLabelsTr / De / Fr / Es / Ar; numbers follow the locale."),
  ],
  api: [
    {
      name: "StarRating",
      props: [
        { name: "value", type: "number", description: "The rating; clamped to 0…max. The label keeps one decimal." },
        { name: "max", type: "number", default: "5", description: "Number of stars." },
        { name: "step", type: "0.1 | 0.5 | 1", default: "0.5", description: "Fill precision (half stars by default)." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Star size and text size." },
        { name: "showValue", type: "boolean", description: "Average as text after the stars." },
        { name: "count / countHref", type: "number / string", description: "“128 reviews”, as a link when countHref is set." },
        { name: "label", type: "string", description: "Overrides “Rated {rating} out of {max}”." },
        { name: "labels / locale / components", type: "Partial<CommerceLabels> / string / BlockAdapters", description: "Strings, number format, Link adapter." },
      ],
    },
    {
      name: "StarRatingInput",
      props: [
        { name: "name", type: "string", description: "Form field name (default: an auto id)." },
        { name: "value / defaultValue / onValueChange", type: "number / number / (v: number) => void", description: "Controlled or uncontrolled. 0 = no rating." },
        { name: "allowHalf", type: "boolean", description: "Half-star steps: two radios per star." },
        { name: "max", type: "number", default: "5", description: "Number of stars." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "24 / 32 / 40px stars." },
        { name: "label / hideLabel / description", type: "ReactNode / boolean / ReactNode", description: "The legend (default “Rating”), visually hidden or not, and a hint under it." },
        { name: "required / disabled / form / id", type: "boolean / boolean / string / string", description: "Native form attributes." },
      ],
    },
  ],
  notes: [
    "Half steps halve the click target of each radio; keep size=\"lg\" when you use allowHalf on touch screens.",
    "The stars are monochrome (text-fg). Set a colour with className on StarRating, e.g. text-accent-ink.",
  ],
  covers: ["Star rating"],
};

export default entry;
