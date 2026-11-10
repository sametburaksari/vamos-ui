import { GallerySection } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { more, photos } from "../_site-2/data";

// Mosaic: a 12-column grid with author-chosen spans; every image opens the lightbox
// (focus trap, Esc, ←/→, "Image 3 of 7").
export default function GallerySectionDemo() {
  return (
    <SiteFrame>
      <GallerySection
        eyebrow="Gallery"
        title="The *room*, the terrace, the grill"
        images={[
          { image: photos.diningRoom, span: "big", caption: "The dining room at dusk." },
          { image: more.bar, span: "tall", caption: "Forty rakıs behind the bar." },
          { image: photos.mezeTable, caption: "Cold meze for four." },
          { image: more.grill, caption: "Bonito on charcoal." },
          { image: more.terrace, span: "wide", caption: "The terrace, May to October." },
          { image: more.meze, caption: "Haydari, fava, sea beans." },
          { image: more.bread, caption: "Sourdough pide at five." },
        ]}
      />
    </SiteFrame>
  );
}
