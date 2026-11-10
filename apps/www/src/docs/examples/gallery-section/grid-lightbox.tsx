import { GallerySection } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { more, photos } from "../_site-2/data";

// Grid: equal 1:1 cells with small captions; click any photo for the lightbox.
export default function GalleryGridLightbox() {
  return (
    <SiteFrame>
      <GallerySection
        variant="grid"
        aspect="1:1"
        title="On the *menu* this week"
        images={[
          { image: more.meze, caption: "Cold meze" },
          { image: photos.plated, caption: "Grilled levrek" },
          { image: more.grill, caption: "Bonito, charcoal" },
          { image: more.bread, caption: "Sourdough pide" },
          { image: photos.mezeTable, caption: "The full table" },
          { image: more.bar, caption: "Rakı service" },
        ]}
      />
    </SiteFrame>
  );
}
