import { Footer } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { studioFooter } from "./_props";

// Columns (dark): brand, text and contact at the start, three link columns at the end; one legal
// line with "Cookie settings" — a button that reopens the consent preferences.
export default function FooterDemo() {
  return (
    <SiteFrame>
      <Footer {...studioFooter} theme={{ mode: "dark" }} />
    </SiteFrame>
  );
}
