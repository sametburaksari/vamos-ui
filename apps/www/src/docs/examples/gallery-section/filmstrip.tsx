import { GallerySection } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { more, photos } from "../_site-2/data";

// Filmstrip: one scroll-snapped row, equal heights with natural widths, running off the end edge.
export default function GalleryFilmstrip() {
  return (
    <SiteFrame>
      <GallerySection
        variant="filmstrip"
        title="A day at *Hamam Moda*"
        images={[
          { image: photos.spaStones },
          { image: photos.spaRoom },
          { image: photos.flowers },
          { image: photos.hotelRoom },
          { image: more.clinic },
        ]}
      />
    </SiteFrame>
  );
}
