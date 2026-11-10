import { MapHours } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { clinicBranches } from "../_site-2/data";

// Branches: a radio location picker (with each branch's open/closed state) beside the selected
// branch's map, address and hours. Switching is CSS (:has), zero JavaScript.
export default function MapHoursBranches() {
  return (
    <SiteFrame>
      <MapHours variant="branches" eyebrow="Locations" title="Three clinics, one *team*" businessType="MedicalClinic" branches={clinicBranches} directions={["google", "apple"]} />
    </SiteFrame>
  );
}
