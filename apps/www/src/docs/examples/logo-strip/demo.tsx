import { LogoStrip } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { clientLogos } from "../_site-1/assets";

// Row: caption at the start, logos on one line at 28px, greyscale until hover.
// Dark artwork comes from imageDark (never invert()).
export default function LogoStripDemo() {
  return (
    <SiteFrame>
      <LogoStrip theme={{ rhythm: "tight" }} caption="Running the sites of 120+ businesses since 2014" logos={clientLogos.slice(0, 6)} />
    </SiteFrame>
  );
}
