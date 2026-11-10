import { MapHours, site2LabelsTr, type Branch } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { meyhane } from "../_site-2/data";

// Special days and past-midnight hours, in Turkish (Monday-first, 24 h). `now` pins the clock
// to New Year's Eve so the table shows the override and "Open now" reads the 03:00 close.
const branch: Branch = { ...meyhane, mapImage: undefined };

export default function MapHoursSpecialDays() {
  return (
    <SiteFrame>
      <MapHours variant="info" locale="tr-TR" labels={site2LabelsTr} title="Yılbaşı *saatleri*" branches={[branch]} now="2026-12-31T23:40:00+03:00" directions={["yandex", "google"]} />
    </SiteFrame>
  );
}
