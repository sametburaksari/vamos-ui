import { MediaText } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Overlap: the image takes 8 columns, a surface panel overlaps its corner (glassy in glass mode).
export default function MediaTextOverlap() {
  return (
    <SiteFrame>
      <MediaText
        variant="overlap"
        mediaSide="end"
        eyebrow="Rooms"
        title="Six rooms above the *garden*"
        body="Linen sheets, a deep bath and windows onto the plane tree. Breakfast is served downstairs until eleven; the hammam is yours from four."
        cta={{ link: { href: "/rooms", label: "See the rooms" }, style: "primary" }}
        media={photos.hotelRoom}
      />
    </SiteFrame>
  );
}
