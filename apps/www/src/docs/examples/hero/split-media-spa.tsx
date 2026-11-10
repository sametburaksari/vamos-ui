import { Hero } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Spa, clinic, boutique hotel: 7/5 split, a 4:5 portrait bleeding off the end edge with a mono
// caption in its corner. On phones the photo goes on top, cropped square.
export default function HeroSplitMediaSpa() {
  return (
    <SiteFrame>
      <Hero
        variant="split-media"
        eyebrow="Day spa · Moda"
        title="Two hours, *nowhere* to be."
        lead="A marble hammam, a quiet pool and therapists who have been with us for a decade. Open daily from 10 am; last treatment at 8."
        actions={[
          { link: { href: "/book", label: "Book a treatment" }, style: "primary" },
          { link: { href: "/treatments", label: "Treatments & prices" }, style: "secondary" },
        ]}
        meta={[
          { label: "Address", value: "Bahariye Cd. 41, Kadıköy" },
          { label: "Open", value: "Daily 10:00–21:00" },
        ]}
        media={{ ...photos.spaStones, focal: { x: 0.5, y: 0.4 } }}
        caption="Treatment room 3, 2nd floor"
      />
    </SiteFrame>
  );
}
