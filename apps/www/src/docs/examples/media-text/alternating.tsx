import { MediaText } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Alternating sides down a page: mediaSide is logical (start/end), so RTL mirrors it.
export default function MediaTextAlternating() {
  return (
    <SiteFrame>
      <MediaText
        theme={{ rhythm: "tight" }}
        eyebrow="01 · Hammam"
        title="Twenty minutes on the *warm* stone"
        body="Every treatment begins here. Steam opens the skin; a kese scrub with olive oil soap does the rest."
        media={photos.spaStones}
        aspect="1:1"
      />
      <MediaText
        theme={{ rhythm: "tight" }}
        mediaSide="end"
        eyebrow="02 · Treatment"
        title="Then the room you *booked*"
        body="Massage, facial or both. Your therapist asks before they press, and writes down what you liked for next time."
        media={photos.spaRoom}
        aspect="1:1"
      />
    </SiteFrame>
  );
}
