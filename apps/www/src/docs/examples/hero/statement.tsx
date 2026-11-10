import { Hero } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Brand manifesto / agency home: no image, one centred sentence, services as slash-separated links.
export default function HeroStatement() {
  return (
    <SiteFrame>
      <Hero
        variant="statement"
        title="We build sites that *open* the door, not just a browser tab."
        services={[
          { label: "Restaurant sites", href: "/services/restaurants" },
          { label: "Clinic & spa sites", href: "/services/clinics" },
          { label: "Ad management", href: "/services/ads" },
          { label: "Local SEO", href: "/services/local-seo" },
        ]}
      />
    </SiteFrame>
  );
}
