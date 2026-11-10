import { AnnouncementBar } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// SaaS release notice. Dismissing writes a cookie (vb_ann_<hash of the text>), so new copy shows again.
export default function AnnouncementBarDismissible() {
  return (
    <SiteFrame>
      <AnnouncementBar
        variant="centered"
        tone="accent"
        label="Release"
        text="v2.4 is out: shared inboxes and WhatsApp templates."
        link={{ href: "/changelog/2-4", label: "What’s new" }}
        dismissible
      />
    </SiteFrame>
  );
}
