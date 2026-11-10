import { ComparisonTable } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Versus: two columns everywhere; the end column is muted.
export default function ComparisonVersus() {
  return (
    <SiteFrame>
      <ComparisonTable
        variant="versus"
        eyebrow="Why custom"
        title="A built site vs. a *template*"
        columns={[{ name: "Built with Vamos" }, { name: "Theme marketplace template" }]}
        groups={[{ rows: [
          { feature: "Loads in under 2 s on 4G", values: [true, false] },
          { feature: "Booking flow", values: ["Built in, with deposits", "Third-party plugin"] },
          { feature: "Turkish and English URLs", values: [true, "Paid add-on"] },
          { feature: "KVKK-ready consent banner", values: [true, false] },
          { feature: "Who fixes it at 9 pm on a Friday", values: ["We do", "A support forum"] },
        ] }]}
      />
    </SiteFrame>
  );
}
