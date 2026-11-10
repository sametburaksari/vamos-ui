import { MapHours } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { meyhane } from "../_site-2/data";

// Map-split: a greyscale static map with an accent pin — the Google Maps iframe loads only after
// "Load map" (or functional consent). Hours table with today marked, "Open now" computed in
// Europe/Istanbul on the client, direction links without API keys.
export default function MapHoursDemo() {
  return (
    <SiteFrame>
      <MapHours eyebrow="Visit" title="Find *us*" businessType="Restaurant" branches={[meyhane]} directions={["google", "apple", "yandex"]} />
    </SiteFrame>
  );
}
