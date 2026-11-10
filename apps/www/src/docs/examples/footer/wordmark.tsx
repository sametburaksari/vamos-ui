import { Footer } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { restaurantFooter } from "./_props";

// Wordmark: details across the top, the brand name at container width at the bottom, clipped by the edge.
export default function FooterWordmark() {
  return (
    <SiteFrame>
      <Footer {...restaurantFooter} variant="wordmark" theme={{ mode: "dark", accent: "ember" }} />
    </SiteFrame>
  );
}
