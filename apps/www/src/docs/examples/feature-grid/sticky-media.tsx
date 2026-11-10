import { FeatureGrid } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Sticky media: the image on the start side stays put and swaps as the list scrolls — CSS
// view timelines, no JS. Without support (or with reduced motion) each item shows its own image.
export default function FeatureGridStickyMedia() {
  return (
    <SiteFrame>
      <FeatureGrid
        variant="sticky-media"
        eyebrow="Rituals"
        title="Three ways to spend an *afternoon*"
        items={[
          { title: "The hammam ritual", text: "Steam, a kese scrub and a foam wash on the warm göbektaşı, then twenty minutes with linden tea. 75 minutes, ₺2,900.", media: photos.spaStones, link: { href: "/rituals/hammam", label: "Book the ritual" } },
          { title: "Deep tissue massage", text: "For desk shoulders and runner’s calves. Our therapists ask before they press. 60 or 90 minutes, from ₺2,400.", media: photos.spaRoom },
          { title: "Peony facial", text: "A cleanse, a gentle peel and a cold-stone massage with this season’s peony oil. 50 minutes, ₺2,100.", media: photos.flowers },
        ]}
      />
    </SiteFrame>
  );
}
