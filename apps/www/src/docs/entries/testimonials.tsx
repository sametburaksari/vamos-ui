import { ex, type DocEntry } from "../types";
import Demo from "../examples/testimonials/demo";
import Wall from "../examples/testimonials/wall";
import Carousel from "../examples/testimonials/carousel";
import Reviews from "../examples/testimonials/reviews";

const entry: DocEntry = {
  slug: "testimonials",
  title: "Testimonials",
  group: "Site blocks",
  description:
    "Customer voices — agency references, Google reviews for a spa or a restaurant, SaaS quotes. figure > blockquote + figcaption with locale quotation marks; no avatar means name only (never an initials circle); star ratings appear only with a named source. The carousel is a ~1 KB scroll-snap island with arrows and a “3 / 8” counter, never autoplaying.",
  source: ["blocks/site/testimonials.tsx", "blocks/site/shared/testimonials-carousel.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  basedOn: "CSS scroll-snap (carousel)",
  usage: `import { Testimonials } from "@vamos-ui/react/blocks";

<Testimonials
  variant="reviews"
  title="What guests *say*"
  summary={{ rating: 4.8, count: 1240, source: "google", link: { href: "https://g.page/r/…", label: "Read all reviews" } }}
  items={[{ quote: "The lakerda alone is worth the booking.", author: "Murat Ç.", rating: 5, source: "google", date: "2026-11-02" }]}
/>`,
  demo: ex("demo", "Feature (one large quote)", "testimonials/demo.tsx", Demo),
  examples: [
    ex("wall", "Wall (agency references)", "testimonials/wall.tsx", Wall, "CSS columns, hairline rules, uneven lengths. Only the item with a source shows stars."),
    ex("carousel", "Carousel (spa guests)", "testimonials/carousel.tsx", Carousel, "One slide on phones, two on wide; slides are labelled groups; ←/→, Home, End on the track. A single item falls back to feature."),
    ex("reviews", "Reviews (restaurant, Google)", "testimonials/reviews.tsx", Reviews, "Sticky rating summary beside a dated list. Reviews are imported into props — the kit never calls the Places API."),
  ],
  api: [
    {
      name: "Testimonials",
      props: [
        { name: "variant", type: '"feature" | "wall" | "carousel" | "reviews"', default: '"feature"', description: "Layout (see examples)." },
        { name: "items", type: "TestimonialItem[]", description: "{ quote, author, role?, company?, avatar?, logo?, rating?, source?, date?, link? } — 1–24." },
        { name: "summary", type: "{ rating; count; source; link? }", description: "reviews variant: “4.8 on Google — 1,240 reviews”." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header (beside the arrows in carousel, sticky in reviews)." },
        { name: "labels", type: "Partial<Site2Labels>", description: "quoteOpen / quoteClose (locale marks), ratingOutOf, counters, Previous / Next." },
        { name: "locale", type: "string", default: '"en-US"', description: "Dates and numbers through Intl." },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
    { name: "RatingStars", props: [{ name: "rating / label", type: "number / string", description: "Monochrome stars with role=img and a text alternative (“4.8 out of 5”)." }] },
  ],
  covers: ["Testimonials"],
};

export default entry;
