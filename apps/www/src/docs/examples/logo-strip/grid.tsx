import { LogoStrip } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { clientLogos } from "../_site-1/assets";

// Grid: 1px gridlines like a table; linked logos go to the case study.
export default function LogoStripGrid() {
  return (
    <SiteFrame>
      <LogoStrip
        variant="grid"
        columns={5}
        caption="Clients, 2024–2026"
        logos={clientLogos.map((l, i) => (i < 3 ? { ...l, link: { href: `/work/${l.name.toLowerCase().replace(/[^a-z]+/g, "-")}` } } : l))}
      />
    </SiteFrame>
  );
}
