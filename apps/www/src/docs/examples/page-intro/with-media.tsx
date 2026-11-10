import { PageIntro } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// With media: title + lead, then a 21:9 photo bleeding past the container.
export default function PageIntroWithMedia() {
  return (
    <SiteFrame>
      <PageIntro
        variant="with-media"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
        title="Nine people, *one* long table"
        lead="We’ve worked from the same office in Cevizli since 2014. Clients visit; we visit them more."
        media={{ ...photos.team, focal: { x: 0.5, y: 0.45 } }}
      />
    </SiteFrame>
  );
}
