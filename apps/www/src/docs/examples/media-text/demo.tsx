import { MediaText } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Side: 5/7, the text top-aligned with the image (not vertically centred), accent-dash bullets.
export default function MediaTextDemo() {
  return (
    <SiteFrame>
      <MediaText
        eyebrow="The kitchen"
        title="Fish from the *morning* boats"
        body="Hüseyin Usta is at the Cevizli market at six. What he buys decides the menu — there is no printed fish list, only the slate by the door."
        bullets={["Sea bass, bonito and red mullet in season", "Every meze made the same morning", "Forty rakı labels, by the glass"]}
        cta={{ link: { href: "/menu", label: "Tonight’s menu" }, style: "link" }}
        media={photos.plated}
      />
    </SiteFrame>
  );
}
