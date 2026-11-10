import { MapHours } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { meyhane } from "../_site-2/data";

// Info: no map — Address / Hours / Contact in three typographic columns, right above the footer.
export default function MapHoursInfo() {
  return (
    <SiteFrame>
      <MapHours variant="info" title="Opening *hours*" branches={[meyhane]} directions={["google"]} theme={{ surface: "surface-2" }} />
    </SiteFrame>
  );
}
