import { Team } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { more } from "../_site-2/data";

// Feature: one founder — large portrait beside a long bio, the name set like a signature.
export default function TeamFeatureFounder() {
  return (
    <SiteFrame>
      <Team
        variant="feature"
        eyebrow="Founder"
        title="Started in a *one-room* studio"
        members={[
          {
            name: "Kerem Yıldız",
            role: "Founder, creative director",
            photo: more.portrait4,
            bio: "Kerem designed his first restaurant website in 2011 for his uncle’s fish place in Ayvalık. It took bookings by email and crashed every Friday.\n\nFifteen years later the studio builds sites and booking systems for forty restaurants, spas and clinics across Istanbul — still from the same desk by the window in Maltepe.",
            links: [{ network: "linkedin", href: "https://linkedin.com/in/keremyildiz" }, { network: "x", href: "https://x.com/keremyildiz" }],
          },
        ]}
      />
    </SiteFrame>
  );
}
