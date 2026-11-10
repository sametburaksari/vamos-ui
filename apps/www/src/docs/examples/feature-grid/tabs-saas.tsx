import { FeatureGrid } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Tabs: feature titles on the start side (Radix Tabs, vertical arrow keys), the selected
// feature's screenshot on the end side. Narrow containers stack every feature instead.
export default function FeatureGridTabsSaas() {
  return (
    <SiteFrame>
      <FeatureGrid
        variant="tabs"
        eyebrow="Product"
        title="How the front desk *uses* it"
        items={[
          { title: "One inbox for every channel", text: "WhatsApp Business, Instagram DMs and your website form arrive in one list, with the guest’s history beside each thread.", media: photos.dashboard, link: { href: "/product/inbox", label: "About the inbox" } },
          { title: "Bookings from a message", text: "Turn “table for 4 on Friday” into a booking in two clicks. The guest gets a confirmation in the same chat.", media: photos.team },
          { title: "Templates that pass review", text: "Pre-approved WhatsApp templates for reminders and no-show follow-ups, in Turkish and English.", media: photos.studio },
        ]}
      />
    </SiteFrame>
  );
}
