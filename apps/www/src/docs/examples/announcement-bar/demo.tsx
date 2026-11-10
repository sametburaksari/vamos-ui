import { AnnouncementBar } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// A restaurant's holiday closure, above the navbar.
export default function AnnouncementBarDemo() {
  return (
    <SiteFrame>
      <AnnouncementBar
        text="Closed 1–3 April for Eid — open again Thursday from noon."
        link={{ href: "/hours", label: "Holiday hours" }}
      />
    </SiteFrame>
  );
}
