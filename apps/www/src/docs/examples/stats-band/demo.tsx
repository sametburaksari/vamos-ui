import { StatsBand } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Inline: figures between vertical rules, each with a source. Numbers go through Intl.
export default function StatsBandDemo() {
  return (
    <SiteFrame>
      <StatsBand
        eyebrow="Kıyı in numbers"
        title="Fifteen years by the *water*"
        items={[
          { value: 4.8, label: "Google rating", source: "1,240 reviews · Business Profile, Nov 2026" },
          { value: 22, label: "Cold meze on the menu tonight", source: "Kitchen, 10 Nov 2026" },
          { value: 40, label: "Rakı labels, by the glass", source: "Wine & spirits list, autumn" },
          { value: 63, unit: "%", label: "Of tables booked on WhatsApp", source: "Reservations, Oct 2026" },
        ]}
      />
    </SiteFrame>
  );
}
