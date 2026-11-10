import { MediaText } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Bleed + video: the image runs to the section edge; the YouTube player (youtube-nocookie)
// loads only after a click, so nothing third-party runs before the visitor asks.
export default function MediaTextBleedVideo() {
  return (
    <SiteFrame>
      <MediaText
        variant="bleed"
        aspect="3:2"
        eyebrow="Case study · 2 min"
        title="A clinic site that answers the *phone*"
        body="Lena Clinic took 70 calls a day asking for prices. We put the prices on the site — with VAT — and the calls dropped to twenty."
        cta={{ link: { href: "/work/lena-clinic", label: "Read the case study" }, style: "link" }}
        media={photos.team}
        video={{ provider: "youtube", url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", title: "Lena Clinic case study" }}
      />
    </SiteFrame>
  );
}
