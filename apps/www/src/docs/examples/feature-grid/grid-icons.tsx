import { FeatureGrid } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Grid: 3–4 columns, a 1px top rule per item. Icons are lucide names (f.icon()), 20px at
// stroke 1.5, muted, never inside coloured circles.
export default function FeatureGridIcons() {
  return (
    <SiteFrame>
      <FeatureGrid
        variant="grid"
        columns={3}
        eyebrow="At the spa"
        title="Included with *every* treatment"
        items={[
          { icon: "bath", title: "Hammam, 20 minutes", text: "Warm marble and a kese scrub before any massage or facial." },
          { icon: "waves", title: "Pool & sauna", text: "The 12-metre pool and Finnish sauna for the rest of the day." },
          { icon: "coffee", title: "Linden tea & lokum", text: "In the relaxation room, as long as you like." },
          { icon: "parking-circle", title: "Two hours parking", text: "In the Bahariye garage, validated at reception." },
          { icon: "shield-check", title: "Single-use linens", text: "Robes, slippers and peştamal washed at 90°C between guests." },
          { icon: "calendar-check", title: "Free rescheduling", text: "Move your booking up to 6 hours before, by message or online." },
        ]}
      />
    </SiteFrame>
  );
}
