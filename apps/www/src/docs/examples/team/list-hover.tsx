import { Team } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { more } from "../_site-2/data";

// List: name · role · specialty rows; on wide screens a portrait appears on hover (CSS only, decorative).
export default function TeamListHover() {
  return (
    <SiteFrame>
      <Team
        variant="list"
        eyebrow="Clinic"
        title="Our *specialists*"
        members={[
          { name: "Selin Öztürk", title: "Dr.", role: "Dermatologist", specialty: "Acne scars · Laser · Microneedling", photo: more.portrait3, links: [{ network: "linkedin", href: "https://linkedin.com/in/selinozturk" }] },
          { name: "Kerem Yıldız", title: "Op. Dr.", role: "Plastic surgeon", specialty: "Rhinoplasty · Blepharoplasty", photo: more.portrait4 },
          { name: "Elif Aydın", role: "Aesthetician", specialty: "Facials · Chemical peels", photo: more.portrait1 },
          { name: "Mert Kaya", role: "Physiotherapist", specialty: "Lymphatic drainage · Post-op care", photo: more.portrait2 },
        ]}
      />
    </SiteFrame>
  );
}
