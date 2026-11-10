import { AnnouncementBar } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// A day spa's maintenance notice in the warning tone (always solid, also in glass mode).
export default function AnnouncementBarWarning() {
  return (
    <SiteFrame>
      <AnnouncementBar
        tone="warning"
        text="The hammam is closed for maintenance 12–14 November. Massage and facial rooms stay open."
        link={{ href: "/treatments", label: "Book another treatment" }}
      />
    </SiteFrame>
  );
}
