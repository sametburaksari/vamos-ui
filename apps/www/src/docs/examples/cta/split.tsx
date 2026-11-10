import { Cta } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Split: title + action at the start, a cropped photo at the end; height follows the photo.
export default function CtaSplit() {
  return (
    <SiteFrame>
      <Cta
        variant="split"
        theme={{ surface: "surface-2" }}
        eyebrow="Groups"
        title="Bring your *team* for lunch"
        lead="Weekday set lunch for six to twenty, in and out in fifty minutes. ₺1,350 per person, VAT included."
        actions={[{ link: { href: "/groups", label: "Plan a group lunch" }, style: "primary" }]}
        contact={{ phone: "+902160000000" }}
        fineprint="Book by 11:00 for the same day."
        media={photos.mezeTable}
      />
    </SiteFrame>
  );
}
