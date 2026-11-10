import { StatsBand } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// With text: a paragraph on the start side, a 2×2 grid of figures on the end side.
export default function StatsBandWithText() {
  return (
    <SiteFrame>
      <StatsBand
        variant="with-text"
        eyebrow="Results"
        title="What a site that *works* changes"
        body="We measure our sites by bookings, not visits. These are medians across the 48 restaurants and clinics we ran for the whole of the last twelve months."
        items={[
          { value: 38, unit: "%", label: "More booking requests in year one", source: "48 clients, Nov 2025–Oct 2026" },
          { value: "11 min", label: "Median first reply to a request", source: "Shared inbox data" },
          { value: 1.4, unit: "s", unitLabel: "seconds", label: "Largest contentful paint on 4G", source: "CrUX, p75, Oct 2026" },
          { value: 126, label: "Sites live today", source: "Studio records" },
        ]}
      />
    </SiteFrame>
  );
}
