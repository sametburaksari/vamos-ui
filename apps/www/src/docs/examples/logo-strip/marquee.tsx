import { LogoStrip } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { clientLogos } from "../_site-1/assets";

// Marquee: CSS keyframes, edges faded with a mask; pauses on hover and focus; under reduced
// motion it becomes a static wrapped row. The duplicate copy is aria-hidden.
export default function LogoStripMarquee() {
  return (
    <SiteFrame>
      <LogoStrip variant="marquee" theme={{ rhythm: "tight" }} caption="Restaurants, clinics and hotels we work with" logos={clientLogos} speed={45} />
    </SiteFrame>
  );
}
