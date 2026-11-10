import { Hero } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Editorial (agency, consultancy): huge serif title with one italic word, a narrow lead and a
// single text-link CTA, mono facts at the end, a 21:9 photo strip bleeding edge to edge.
export default function HeroDemo() {
  return (
    <SiteFrame>
      <Hero
        eyebrow="Studio Arda · Maltepe, Istanbul"
        title="Websites for places people *actually* visit."
        lead="We design and run sites for restaurants, clinics and hotels on the Asian side — menus your staff can edit and booking that lands on WhatsApp."
        actions={[{ link: { href: "/work", label: "See the work" }, style: "link" }]}
        meta={[
          { label: "Founded", value: "2014" },
          { label: "Sites live", value: "126" },
          { label: "Team", value: "9 people, one office" },
        ]}
        media={{ ...photos.studio, focal: { x: 0.5, y: 0.6 } }}
      />
    </SiteFrame>
  );
}
