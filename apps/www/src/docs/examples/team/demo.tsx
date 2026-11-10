import { Team } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { more } from "../_site-2/data";

// Portrait: 4:5 photos, name + mono role, a text profile link instead of icon rows.
export default function TeamDemo() {
  return (
    <SiteFrame>
      <Team
        eyebrow="Therapists"
        title="Hands you can *trust*"
        lead="Every therapist at Hamam Moda has at least eight years of practice. Book any of them by name."
        members={[
          { name: "Elif Aydın", role: "Lead therapist", photo: more.portrait1, links: [{ network: "instagram", href: "https://instagram.com/elif.touch" }] },
          { name: "Mert Kaya", role: "Hammam master", photo: more.portrait2 },
          { name: "Selin Öztürk", title: "Dr.", role: "Dermatologist", photo: more.portrait3, links: [{ network: "linkedin", href: "https://linkedin.com/in/selinozturk" }] },
          { name: "Deniz Uçar", role: "Reflexologist", photo: more.portrait5 },
        ]}
      />
    </SiteFrame>
  );
}
