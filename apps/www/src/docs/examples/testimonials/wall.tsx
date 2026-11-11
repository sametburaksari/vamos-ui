import { Testimonials } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { more } from "../_site-2/data";

// Wall: uneven columns, hairline rules, no cards. Stars appear only where a source is named.
export default function TestimonialsWall() {
  return (
    <SiteFrame>
      <Testimonials
        variant="wall"
        eyebrow="References"
        title="Clients, in their own *words*"
        items={[
          { quote: "They rebuilt our booking flow in three weeks. Table requests through the site doubled before the summer season even started.", author: "Deniz Arslan", role: "Owner", company: "Kıyı Meyhane", avatar: more.avatar1 },
          { quote: "Clear prices, a calm site, and we can change the treatment menu ourselves.", author: "Melis Aydın", role: "Manager", company: "Hamam Moda" },
          { quote: "The clinic pages finally rank for our own neighbourhood. Patients mention finding us on Google Maps.", author: "Dr. Selin Öztürk", company: "Defne Clinic", rating: 5, source: "google", date: "2026-09-14" },
          { quote: "Honest about what wouldn’t work, which is rarer than it should be.", author: "Can Demir", role: "Founder", company: "Ledgerly", avatar: more.avatar2 },
          { quote: "Our Google Ads spend went down by a third and calls went up. The monthly report is two pages and I actually read it.", author: "Kerem Yıldız", role: "Partner", company: "Yıldız Hukuk" },
          { quote: "Launch day was boring, in the best way.", author: "Ayşe Kaya", role: "Marketing lead", company: "Moda Pilates" },
        ]}
      />
    </SiteFrame>
  );
}
