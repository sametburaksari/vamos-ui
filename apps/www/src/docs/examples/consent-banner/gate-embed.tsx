import { ConsentGate, BlockImage } from "@vamos-ui/react/blocks";
import { more, photos } from "../_site-2/data";

// ConsentGate: a static preview with one button. The iframe (map, YouTube, Calendly) loads only
// after a click, or by itself once the visitor has granted the category.
export default function ConsentBannerGateEmbed() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <ConsentGate
        src="https://www.google.com/maps?q=Bağdat+Caddesi+412+Kadıköy&z=16&output=embed"
        title="Map of Kıyı Meyhane"
        loadLabel="Load map"
        notice="The map loads from Google Maps, which may set cookies."
        rememberLabel="Always load maps"
      >
        <BlockImage {...more.map} decorative aspect="4:3" className="size-full" />
      </ConsentGate>
      <ConsentGate
        src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?autoplay=1"
        title="Video: a morning at the fish market"
        category="marketing"
        loadLabel="Play video"
        notice="Hosted by YouTube, which may set cookies."
        aspect="16 / 9"
        allow="autoplay; encrypted-media; picture-in-picture"
      >
        <BlockImage {...photos.plated} decorative aspect="16:9" className="size-full" />
      </ConsentGate>
    </div>
  );
}
